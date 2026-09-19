// src/data/lessonChapterSplit.ts
// Chaque fichier HTML de phase (public/lessons/phaseN_chapitres_X_Y.html, source
// canonique suivie par git et validée par check:lecons) contient DEUX leçons,
// un <div class="chapter-view">.
// Ce module isole UNE SEULE leçon avant injection dans l'iframe (srcDoc) :
//   - clé de base  (phase1_chapitres_1_2)   → 1re leçon du fichier
//   - clé suffixée (phase1_chapitres_1_2_2) → 2e  leçon du fichier
// Le sommaire sticky ne référence plus que la leçon affichée, et le script de
// navigation ne peut plus basculer vers l'autre chapitre (une leçon = une page).
//
// NOTE : les ids de chapitre ne sont PAS normalisés (phase1 → ch1/ch2, phase2 →
// ch3/ch4). L'isolation se fait donc par ORDRE D'APPARITION, jamais par le nom.
//
// Une clé de phase a la forme `phaseN_chapitres_X_Y`. Attention : la 1re leçon de
// la 1re phase s'appelle `phase1_chapitres_1_2` — elle se TERMINE par `_2` sans
// être une leçon suffixée. La détection se fait donc sur la forme canonique
// complète, jamais sur un simple suffixe.
const PHASE_BASE_KEY_RE = /^phase\d+_chapitres_\d+_\d+/;

/** Clé de base (fichier HTML source) d'une clé de leçon éventuellement suffixée. */
export function getBaseLessonKey(lessonKey: string): string {
  const match = lessonKey.match(PHASE_BASE_KEY_RE);
  return match ? match[0] : lessonKey;
}

/** Une clé suffixée `_2` (…) désigne une leçon suivante du même fichier HTML. */
export function isSplitLessonKey(lessonKey: string): boolean {
  return lessonKey !== getBaseLessonKey(lessonKey);
}

/** Index (1-based) de la leçon à afficher pour une clé donnée. */
export function getChapterIndexFromKey(lessonKey: string): number {
  const base = getBaseLessonKey(lessonKey);
  if (base === lessonKey) return 1;
  const suffix = lessonKey.slice(base.length);
  if (!suffix.startsWith('_')) return 1;
  const index = Number(suffix.slice(1));
  return Number.isFinite(index) && index > 0 ? index : 1;
}

interface ChapterBlock {
  id: string;
  start: number;
  end: number;
}

/** Retourne l'index de fin (exclusif) du `</div>` fermant le div ouvert à `openIndex`. */
function findMatchingDivClose(html: string, openIndex: number): number {
  const tagRe = /<div\b[^>]*>|<\/div>/g;
  tagRe.lastIndex = openIndex;
  let depth = 0;
  let m: RegExpExecArray | null;
  while ((m = tagRe.exec(html))) {
    if (m[0] === '</div>') {
      depth -= 1;
      if (depth === 0) return m.index + m[0].length;
    } else {
      depth += 1;
    }
  }
  return -1;
}

/** Blocs `chapter-view` du document, dans l'ordre d'apparition. */
export function findChapterBlocks(html: string): ChapterBlock[] {
  const blocks: ChapterBlock[] = [];
  const openRe = /<div\s+id="([^"]+)"\s+class="[^"]*chapter-view[^"]*"[^>]*>/g;
  let m: RegExpExecArray | null;
  while ((m = openRe.exec(html))) {
    const end = findMatchingDivClose(html, m.index);
    if (end < 0) break;
    blocks.push({ id: m[1], start: m.index, end });
    openRe.lastIndex = end;
  }
  return blocks;
}

/** Nombre de leçons réellement présentes dans un fichier HTML de phase. */
export function countLessonChapters(html: string): number {
  return findChapterBlocks(html).length;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Force la classe `chapter-view active` sur le div de la leçon conservée. */
function markActive(block: string): string {
  return block.replace(
    /^<div\s+id="([^"]+)"\s+class="([^"]*)"/,
    (_all, id: string, cls: string) => {
      const classes = new Set(cls.split(/\s+/).filter(Boolean));
      classes.add('chapter-view');
      classes.add('active');
      return `<div id="${id}" class="${Array.from(classes).join(' ')}"`;
    }
  );
}

// Le script d'origine déduit le chapitre cible en dur (`ch1` ou `ch2`) : il
// planterait sur un fichier dont les chapitres sont `ch3`/`ch4`, et il pourrait
// réactiver un chapitre supprimé. On le remplace par une version qui suit le DOM.
const OVERRIDE_SCRIPT = `<script>
/* v3.3 — une seule leçon par page : le sommaire ne peut plus changer de leçon */
(function () {
  window.scrollToStep = function (id, evt) {
    if (evt) evt.preventDefault();
    var el = document.getElementById(id);
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 110, behavior: 'smooth' });
    var links = document.querySelectorAll('.sommaire a');
    for (var i = 0; i < links.length; i++) links[i].classList.remove('active');
    var link = document.getElementById('link-' + id);
    if (link) link.classList.add('active');
    var ch = el && el.closest ? el.closest('.chapter-view') : null;
    if (ch && !ch.classList.contains('active')) ch.classList.add('active');
  };
})();
</script>
`;

/**
 * Ids des `<section id="...">` contenus dans un bloc de chapitre.
 * Les fichiers de phase réels nomment leurs blocs `ch19`/`ch20`… alors que
 * les sections et les liens du sommaire utilisent `ch1-step*`/`ch2-step*`
 * (copier-coller du gabarit) : le nettoyage du sommaire doit donc suivre
 * les SECTIONS, pas seulement l'id du bloc.
 */
function collectSectionIds(blockHtml: string): string[] {
  const ids: string[] = [];
  const re = /<section\b[^>]*\bid="([^"]+)"/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(blockHtml))) ids.push(m[1]);
  return ids;
}

function injectOverrideScript(html: string): string {
  const idx = html.lastIndexOf('</body>');
  if (idx < 0) return html + OVERRIDE_SCRIPT;
  return html.slice(0, idx) + OVERRIDE_SCRIPT + html.slice(idx);
}

/**
 * Isole la leçon demandée dans un fichier HTML de phase.
 * - conserve uniquement le chapitre ciblé (classe `active`)
 * - retire les liens de sommaire des autres chapitres et le séparateur
 * - neutralise le script de navigation multi-chapitres
 * Un fichier sans (ou avec un seul) `chapter-view` est retourné inchangé.
 */
export function sliceLessonHtml(html: string, lessonKey: string): string {
  const blocks = findChapterBlocks(html);
  if (blocks.length < 2) return html;

  const chapterIndex = getChapterIndexFromKey(lessonKey) - 1;
  const keep = blocks[Math.min(Math.max(chapterIndex, 0), blocks.length - 1)];
  const drop = blocks.filter((b) => b !== keep);

  // 1) Supprimer les chapitres non concernés, marquer le chapitre conservé actif.
  let out = '';
  let cursor = 0;
  for (const b of blocks) {
    out += html.slice(cursor, b.start);
    if (b === keep) out += markActive(html.slice(b.start, b.end));
    cursor = b.end;
  }
  out += html.slice(cursor);

  // 2) Retirer les entrées de sommaire des chapitres supprimés.
  // 2a) Par id de bloc (cas nominal : blocs `ch1`/`ch2` alignés sur les liens).
  for (const b of drop) {
    const linkRe = new RegExp(
      `\\s*<a\\b[^>]*id="link-${escapeRegExp(b.id)}-step\\d+"[\\s\\S]*?</a>`,
      'g'
    );
    out = out.replace(linkRe, '');
  }
  // 2b) Par sections contenues (cas réel : blocs `ch19`/`ch20`… mais liens et
  // sections en `ch1-step*`/`ch2-step*`). Sans ceci, les 8 pastilles restaient
  // visibles et la moitié pointait vers des sections supprimées (liens morts).
  {
    const keepSections = new Set<string>();
    const allSections = new Set<string>();
    for (const b of blocks) {
      const ids = collectSectionIds(html.slice(b.start, b.end));
      for (const id of ids) {
        allSections.add(id);
        if (b === keep) keepSections.add(id);
      }
    }
    if (allSections.size > 0) {
      out = out.replace(
        /\s*<a\b[^>]*id="link-([^"]+)"[\s\S]*?<\/a>/g,
        (full, target: string) =>
          allSections.has(target) && !keepSections.has(target) ? '' : full
      );
    }
  }
  out = out.replace(/\s*<span class="sep"><\/span>/g, '');

  return injectOverrideScript(out);
}