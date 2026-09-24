// src/data/lessonIndexBuilder.ts — logique PURE de construction de l'index des
// leçons pour le moteur tuteur (lot « index leçons » 2026-09-24).
//
// Deux corpus sont indexés :
//   1. Les 47 leçons HTML passives (public/lessons/*.html, 25 fichiers — une clé
//      de base + clé `_2` par fichier phase), découpées par `<section class="card">` ;
//   2. Les 20 leçons actives TS (src/data/activeLessons.ts), texte des blocs.
//
// Contraintes :
//   - AUCUNE I/O ici : le script fs (scripts/build_lesson_index.ts) et le verrou
//     (lessonIndex.lock.test.ts) appellent buildLessonIndex() avec les fichiers
//     HTML lus via node:fs — le résultat doit être IDENTIQUE (déterminisme) ;
//   - chunks ≤ LESSON_INDEX_MAX (520 car.) — granularité alignée sur le
//     corpus okacha (lot granularité, commit bc34fcf de la session précédente) ;
//   - le texte source de chaque groupe (card / leçon active) reste COUVERT :
//     join(' ') des parties == texte nettoyé (normalisation espaces) ;
//   - mots-clés : tokens ≥ 5 caractères, fréquence documentaire ≤ 10 % des
//     chunks (filtre anti-bruit « الطالب » etc.), max 18 par chunk ; les tokens
//     du titre sont toujours gardés (c'est le signal de match principal).
//
// SORTIE : exportée par src/data/lessonIndex.ts (GÉNÉRÉ par
// scripts/build_lesson_index.ts — NE PAS ÉDITER À LA MAIN).

import { HTML_LESSON_ORDER } from './htmlLessonProgression';
import { sliceLessonHtml, getBaseLessonKey } from './lessonChapterSplit';
import { LESSON_LIBRARY, type LessonLibraryItem } from '../lessonData';
import { ACTIVE_LESSONS, type ActiveLesson } from './activeLessons';
import { OFFICIAL_PROGRAM_SEQUENCE } from './unitLessonSequences';
import { tokenizeArabic, normalizeArabic } from '../utils/arabicNormalize';

/** Taille maximale d'un chunk (caractères) — alignée sur la granularité okacha. */
export const LESSON_INDEX_MAX = 520;

/** Filtre doc-fréquence : un token présent dans plus de max(4, 10 %) des chunks est du bruit. */
const DF_RATIO = 0.1;
const DF_FLOOR = 4;
const KEYWORDS_PER_CHUNK = 18;
const KEYWORD_MIN_LEN = 5;

export type LessonIndexKind = 'html' | 'active';

export interface LessonIndexChunk {
  /** Id stable : `lhx_{lessonKey}_{part}` (HTML) / `lha_{lessonKey}_{part}` (active). */
  id: string;
  kind: LessonIndexKind;
  lessonKey: string;
  /** Titre AFFICHÉ : heading de la card (HTML) ou titre de la leçon. */
  title: string;
  /** Titre canonique de la leçon (LESSON_LIBRARY / ActiveLesson.title). */
  lessonTitle: string;
  unitId: number;
  /** Position (1-based) et total des parties du GROUPE (card ou leçon active). */
  part: number;
  total: number;
  text: string;
  /** Mots-clés bruts (normalisés à la construction des SearchChunks). */
  keywords: string[];
  /** Segments du titre (alias de recherche) : « تجربة هيل وروبن » depuis « … : تجربة هيل وروبن ». */
  aliases: string[];
}

export interface LessonIndexStats {
  lessonsHtml: number;
  lessonsActive: number;
  chunksHtml: number;
  chunksActive: number;
  chunksTotal: number;
  textCharsHtml: number;
  textCharsActive: number;
}

export interface LessonIndexBuildResult {
  chunks: LessonIndexChunk[];
  stats: LessonIndexStats;
  /**
   * Groupes de couverture : texte source nettoyé par groupe (card / leçon active)
   * — sert au verrou à prouver que join(' ') des parties recouvre la source.
   */
  coverage: { key: string; source: string; parts: string[] }[];
}

// ── Unités ──────────────────────────────────────────────────────────────────

/**
 * ownerMap (OFFICIAL_PROGRAM_SEQUENCE) + motif `dX-uY`, puis table explicite
 * pour les leçons actives hors séquence officielle (chapitres ancrés livre).
 */
const ACTIVE_UNIT_FALLBACK: Record<string, number> = {
  synapse: 5, // chapitres 26/28 — عصبي (U5)
  subduction: 11, // chapitres 43/44 — structures géo (U11)
  protein_structure_function: 2, // chapitre 8 — بنية/وظيفة (U2)
  immunity_self_nonself: 4, // chapitre 14 — مناعة (U4)
  immunity_humoral_response: 4, // chapitre 16
  immunity_cellular_response: 4, // chapitre 18
  immunity_memory_response: 4, // chapitre 20
  seismic_waves: 10, // chapitres 39/40 — structure Terre (U10)
};

function buildUnitOwner(): Map<string, number> {
  const owner = new Map<string, number>();
  for (const [uid, keys] of Object.entries(OFFICIAL_PROGRAM_SEQUENCE)) {
    for (const k of keys) if (!owner.has(k)) owner.set(k, Number(uid));
  }
  return owner;
}

const UNIT_OWNER = buildUnitOwner();

export function unitIdForActiveLesson(key: string): number {
  const owned = UNIT_OWNER.get(key);
  if (owned !== undefined) return owned;
  const m = key.match(/^d\d-u(\d+)/);
  if (m) return Number(m[1]);
  return ACTIVE_UNIT_FALLBACK[key] ?? 0;
}

// ── Nettoyage HTML ──────────────────────────────────────────────────────────

const CARD_OPEN_RE = /<section class="card(?:\s|")[^>]*>/;

/** Texte visible d'un fragment HTML : tags retirés, entités décodées, espaces normalisés. */
export function stripHtml(html: string): string {
  return html
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
    .replace(/<\/(p|div|li|h[1-6]|section|header|tr|ul|ol|button)>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#\d+;/g, ' ')
    .replace(/[\t\u00a0]+/g, ' ')
    .replace(/[ ]*\n[ ]*/g, '\n')
    .replace(/\n{2,}/g, '\n')
    .replace(/[ ]{2,}/g, ' ')
    .trim();
}

/** Normalisation de comparaison pour le verrou de couverture (espaces only). */
export function normSpaces(s: string): string {
  return s.replace(/\s+/g, ' ').trim();
}

/** Premier heading (h1–h4) d'un fragment, texte brut. */
function firstHeading(fragment: string): string | null {
  const m = fragment.match(/<h[1-4][^>]*>([\s\S]*?)<\/h[1-4]>/i);
  if (!m) return null;
  const t = stripHtml(m[1]);
  return t.length >= 3 ? t : null;
}

/** Découpe le texte en parties ≤ max : frontières de phrases, puis mots. */
export function splitLongText(text: string, max: number): string[] {
  const clean = normSpaces(text);
  if (clean.length <= max) return clean ? [clean] : [];
  const parts: string[] = [];
  const sentences = clean.split(/(?<=[.!?؟:؛،])\s+/u);
  let cur = '';
  const push = (s: string) => {
    if (s) parts.push(s);
  };
  const flush = () => {
    if (cur) push(cur);
    cur = '';
  };
  for (const sent of sentences) {
    if (!sent) continue;
    if ((cur ? `${cur} ${sent}` : sent).length <= max) {
      cur = cur ? `${cur} ${sent}` : sent;
      continue;
    }
    flush();
    if (sent.length <= max) {
      cur = sent;
      continue;
    }
    // phrase encore trop longue → découpe mot à mot
    let buf = '';
    for (const w of sent.split(' ')) {
      if ((buf ? `${buf} ${w}` : w).length <= max) {
        buf = buf ? `${buf} ${w}` : w;
      } else {
        push(buf);
        buf = w;
      }
    }
    cur = buf;
  }
  flush();
  return parts;
}

/** Fusionne les parties < min dans la voisine si ça reste ≤ max (résidus de fin de split). */
export function mergeTinyParts(parts: string[], min: number, max: number): string[] {
  const out = parts.slice();
  for (let i = 1; i < out.length; i++) {
    if (out[i].length >= min) continue;
    // 1) fusion avec la précédente
    const back = `${out[i - 1]} ${out[i]}`;
    if (back.length <= max) {
      out[i - 1] = back;
      out.splice(i, 1);
      i--;
      continue;
    }
    // 2) fusion avec la suivante
    if (i + 1 < out.length && `${out[i]} ${out[i + 1]}`.length <= max) {
      out[i + 1] = `${out[i]} ${out[i + 1]}`;
      out.splice(i, 1);
      i--;
      continue;
    }
    // 3) re-coupe la précédente à sa dernière frontière (phrase/espace) laissant
    //    de la place pour absorber le résidu — déterministe, ≤ max garanti.
    const prev = out[i - 1];
    const tiny = out[i];
    const cutMax = max - tiny.length - 1;
    if (cutMax >= 20) {
      const window = prev.slice(0, cutMax + 1);
      let cut = -1;
      for (let j = window.length - 1; j >= 20; j--) {
        const ch = window[j - 1];
        if (ch === ' ' || ch === '.' || ch === '!' || ch === '?' || ch === '؟' || ch === '،' || ch === '؛' || ch === ':') {
          cut = j;
          break;
        }
      }
      if (cut > 0) {
        const head = prev.slice(0, cut).trimEnd();
        const tail = `${prev.slice(cut).trimStart()} ${tiny}`;
        if (head.length >= 20 && tail.length <= max) {
          out[i - 1] = head;
          out[i] = tail;
        }
      }
    }
  }
  return out;
}

// ── Titre / alias ───────────────────────────────────────────────────────────

/** Segments d'un titre (« A : B — C ») → aliases de recherche. */
export function titleAliases(title: string): string[] {
  const segs = title
    .split(/\s*[•—–]\s*|\s*:\s*/u)
    .map((s) => s.trim())
    .filter((s) => s.length >= 4);
  return segs.slice(0, 6);
}

// ── Extraction des deux corpus ──────────────────────────────────────────────

interface RawGroup {
  /** Id technique du groupe (card id ou lessonKey). */
  key: string;
  /** Titre affiché pour ce groupe. */
  title: string;
  lessonKey: string;
  lessonTitle: string;
  unitId: number;
  /** Texte SOURCE nettoyé du groupe (avant split) — pour le verrou de couverture. */
  source: string;
}

function extractHtmlGroups(htmlFiles: Record<string, string>): RawGroup[] {
  const libByKey = new Map<string, LessonLibraryItem>(LESSON_LIBRARY.map((l) => [l.key, l]));
  const groups: RawGroup[] = [];

  for (const lessonKey of HTML_LESSON_ORDER) {
    const lib = libByKey.get(lessonKey);
    if (!lib) throw new Error(`lessonIndexBuilder : clé absente de LESSON_LIBRARY — ${lessonKey}`);
    const base = getBaseLessonKey(lessonKey);
    const file = htmlFiles[base];
    if (file === undefined) throw new Error(`lessonIndexBuilder : fichier HTML absent — ${base}.html`);

    const slice = sliceLessonHtml(file, lessonKey);

    // Groupe 0 — préambule : breadcrumb + objectifs (métadonnées de la lib).
    const preamble = normSpaces([lib.breadcrumb, ...lib.objectives].join('\n'));
    groups.push({
      key: `${lessonKey}::intro`,
      title: lib.titleAr,
      lessonKey,
      lessonTitle: lib.titleAr,
      unitId: lib.unitId,
      source: preamble,
    });

    // Groupes 1..n — une card = un groupe.
    const cardRe = /<section class="card(?:\s|")[^>]*>([\s\S]*?)<\/section>/g;
    let m: RegExpExecArray | null;
    let cardIndex = 0;
    while ((m = cardRe.exec(slice))) {
      cardIndex++;
      const raw = m[1];
      const text = stripHtml(raw);
      if (text.length < 20) continue; // card quasi vide (badge/JS seul)
      const heading = firstHeading(raw);
      groups.push({
        key: `${lessonKey}::card${cardIndex}`,
        title: heading ?? lib.titleAr,
        lessonKey,
        lessonTitle: lib.titleAr,
        unitId: lib.unitId,
        source: text,
      });
    }

    if (cardIndex === 0) {
      throw new Error(`lessonIndexBuilder : aucune <section class="card"> dans ${lessonKey}`);
    }
  }
  return groups;
}

/** Textes d'une leçon active (champs string arabes, hors assets/ids). */
const ACTIVE_SKIP_KEYS = new Set([
  'imageSrc',
  'schemaSrc',
  'supportAssetSrc',
  'supportSecondaryAssetSrc',
  'assetSrc',
  'id',
  'type',
  'x',
  'y',
  'radius',
  'nextLessonId',
  'answerType',
  'validationMode',
]);

function collectActiveStrings(value: unknown, out: string[]): void {
  if (typeof value === 'string') {
    out.push(value);
    return;
  }
  if (Array.isArray(value)) {
    for (const v of value) collectActiveStrings(v, out);
    return;
  }
  if (value && typeof value === 'object') {
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (ACTIVE_SKIP_KEYS.has(k)) continue;
      collectActiveStrings(v, out);
    }
  }
}

function extractActiveGroups(activeLessons: Record<string, ActiveLesson>): RawGroup[] {
  const groups: RawGroup[] = [];
  for (const [lessonKey, lesson] of Object.entries(activeLessons)) {
    const strings: string[] = [];
    collectActiveStrings(lesson, strings);
    const filtered = strings.filter(
      (s) => s.length >= 4 && /[\u0600-\u06ff]/.test(s) && !s.startsWith('/'),
    );
    const source = normSpaces(filtered.join('\n'));
    if (source.length < 40) continue;
    groups.push({
      key: `${lessonKey}::active`,
      title: lesson.title,
      lessonKey,
      lessonTitle: lesson.title,
      unitId: unitIdForActiveLesson(lessonKey),
      source,
    });
  }
  return groups;
}

// ── Construction complète ───────────────────────────────────────────────────

/**
 * Construit l'index à partir des fichiers HTML (basename sans `.html` → contenu).
 * Déterministe : mêmes entrées ⇒ mêmes chunks (ids, ordre, textes, keywords).
 */
export function buildLessonIndex(
  htmlFiles: Record<string, string>,
  activeLessons: Record<string, ActiveLesson> = ACTIVE_LESSONS,
): LessonIndexBuildResult {
  const groups = [...extractHtmlGroups(htmlFiles), ...extractActiveGroups(activeLessons)];

  // 1) Découpage des groupes en parties ≤ MAX.
  interface Pending {
    group: RawGroup;
    kind: LessonIndexKind;
    parts: string[];
  }
  const pendings: Pending[] = groups.map((group) => ({
    group,
    kind: group.key.endsWith('::active') ? ('active' as const) : ('html' as const),
    parts: mergeTinyParts(splitLongText(group.source, LESSON_INDEX_MAX), 20, LESSON_INDEX_MAX),
  }));

  // 2) Doc-fréquence des tokens candidats (toutes parties confondues).
  const df = new Map<string, number>();
  for (const p of pendings) {
    for (const part of p.parts) {
      const seen = new Set(
        tokenizeArabic(part).filter((t) => t.length >= KEYWORD_MIN_LEN),
      );
      for (const t of seen) df.set(t, (df.get(t) ?? 0) + 1);
    }
  }
  const dfMax = Math.max(DF_FLOOR, Math.floor(pendings.length * DF_RATIO));

  // 3) Émission des chunks.
  const chunks: LessonIndexChunk[] = [];
  for (const p of pendings) {
    const { group, kind } = p;
    const idPrefix = kind === 'html' ? 'lhx' : 'lha';
    // group.key est unique globalement (`{lessonKey}::intro|cardN|active`) :
    // l'id encode le groupe + la partie pour garantir l'unicité.
    const groupSlug = group.key.replace(/::/g, '_');
    const total = p.parts.length;
    const aliases = titleAliases(group.title);
    const titleTokens = tokenizeArabic(`${group.title} ${group.lessonTitle}`);

    p.parts.forEach((text, i) => {
      const seen = new Set(tokenizeArabic(text));
      const kw: string[] = [];
      const kwSet = new Set<string>();
      const add = (t: string) => {
        if (kwSet.has(t)) return;
        kwSet.add(t);
        kw.push(t);
      };
      // Tokens du titre d'abord (signal de match principal), puis corps filtré DF.
      for (const t of titleTokens) add(t);
      for (const t of seen) {
        if (kw.length >= KEYWORDS_PER_CHUNK) break;
        if (t.length < KEYWORD_MIN_LEN) continue;
        if ((df.get(t) ?? 0) > dfMax) continue;
        add(t);
      }
      chunks.push({
        id: `${idPrefix}_${groupSlug}_${i + 1}`,
        kind,
        lessonKey: group.lessonKey,
        title: total > 1 ? `${group.title} (${i + 1}/${total})` : group.title,
        lessonTitle: group.lessonTitle,
        unitId: group.unitId,
        part: i + 1,
        total,
        text,
        keywords: kw.slice(0, KEYWORDS_PER_CHUNK),
        aliases,
      });
    });
  }

  const stats: LessonIndexStats = {
    lessonsHtml: HTML_LESSON_ORDER.length,
    lessonsActive: Object.keys(activeLessons).length,
    chunksHtml: chunks.filter((c) => c.kind === 'html').length,
    chunksActive: chunks.filter((c) => c.kind === 'active').length,
    chunksTotal: chunks.length,
    textCharsHtml: chunks.filter((c) => c.kind === 'html').reduce((a, c) => a + c.text.length, 0),
    textCharsActive: chunks
      .filter((c) => c.kind === 'active')
      .reduce((a, c) => a + c.text.length, 0),
  };

  const coverage = pendings.map((p) => ({
    key: p.group.key,
    source: p.group.source,
    parts: p.parts,
  }));

  return { chunks, stats, coverage };
}

/** Vérifie la couverture d'un groupe : join(' ') des parties == source (espaces normalisés). */
export function groupCovered(source: string, parts: string[]): boolean {
  return normSpaces(parts.join(' ')) === normSpaces(source);
}

/** Utilitaire exporté pour le test de recherche : normalise comme le moteur. */
export function normalizeForMotor(s: string): string {
  return normalizeArabic(s);
}
