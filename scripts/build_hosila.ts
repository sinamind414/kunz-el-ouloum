/**
 * build_hosila.ts — GÉNÉRE `src/data/hosila.ts` : الحصيلة المعرفية officielle
 * (texte corrigé du livre scolaire 3AS SVT), structurée par unité.
 *
 * Source : uploads_externes/hosila_officielle_3as.txt (copie du fichier
 * « إليك النص الكامل والمصحح… » fourni par l'utilisateur — textes +L/None→ok,
 * fichiers+L/None→ok). SEGMENTS linéaires déclarés ci-dessous (1-based inclusifs)
 * → exécution déterministe, fraîcheur vérrouillée par hosila.lock.test.ts.
 *
 * Usage : npx tsx scripts/build_hosila.ts   (npm run build:hosila)
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { OKACHA_UNITES_ENRICHIES, type BlocOkacha, type UniteOkachaEnrichie } from '../src/data/okachaEnriched';

const racine = join(dirname(fileURLToPath(import.meta.url)), '..');
export const CHEMIN_SOURCE = 'uploads_externes/hosila_officielle_3as.txt';

/** Découpage vérrouillé par unité (ancre attendue dans les 10 lignes d'ouverture). */
interface Seg { debut: number; fin: number; ancre: string }
interface ConfUnite { id: string; pages: string; segs: Seg[]; ancres: string[] }

const UNITES: ConfUnite[] = [
  { id: 'd1u1', pages: 'الحصيلة المعرفية', ancres: ['مقر تركيب البروتين', 'الترجمة', 'الريبوزوم'], segs: [{ debut: 5, fin: 44, ancre: 'الحصيلة المعرفية' }] },
  { id: 'd1u2', pages: 'ص 51-53', ancres: ['Rastop', 'البنية الفراغية', 'الأحماض الأمينية'], segs: [{ debut: 49, fin: 96, ancre: 'معلومات مفيدة' }] },
  { id: 'd1u3', pages: 'ص 68', ancres: ['الإنزيم', 'درجة الحرارة', 'pH'], segs: [{ debut: 158, fin: 178, ancre: 'الحصيلة المعرفية' }] },
  { id: 'd1u4', pages: 'ص 111-116', ancres: ['HLA', 'الريزوس', 'المعقد المناعي'], segs: [{ debut: 184, fin: 316, ancre: 'الذات واللاذات' }] },
  { id: 'd1u5', pages: 'ص 158-164', ancres: ['المشبك', 'النقل المشبكي', 'المخدرات'], segs: [{ debut: 321, fin: 435, ancre: 'الصفحة 158' }] },
  { id: 'd2u1', pages: 'ص 197-201', ancres: ['RuDP', 'حلقة كالفن', 'المرحلة الكيموضوئية'], segs: [{ debut: 442, fin: 515, ancre: 'الحصيلة المعرفية' }] },
  { id: 'd2u2', pages: 'ص 219-231', ancres: ['38 ATP', 'التحلل السكري', 'التخمر', 'حلقة كريبس'], segs: [{ debut: 517, fin: 608, ancre: 'التنفس' }] },
  { id: 'd3u1', pages: 'ص 280-281', ancres: ['الموجات الزلزالية', 'البرنس', 'سيال'], segs: [{ debut: 2313, fin: 2360, ancre: 'الموجات الزلزالية' }] },
  { id: 'd3u2', pages: 'الحصيلة المعرفية', ancres: ['الصفائح التكتونية', 'الطاقة الداخلية', 'الغوص'], segs: [
    { debut: 2245, fin: 2308, ancre: 'تحديد الصفائح' },
    { debut: 2421, fin: 2444, ancre: 'الحصيلة المعرفية' },
  ] },
  { id: 'd3u3', pages: 'ص 326', ancres: ['الأفيوليت', 'التصادم', 'الحركة البانية'], segs: [{ debut: 2446, fin: 2491, ancre: 'مناطق التصادم' }] },
];

/* ── LaTeX → Unicode (l'app n'a pas de renderer math) ─────────────────── */
const SUB: Record<string, string> = { '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉', a: 'ₐ', e: 'ₑ', o: 'ₒ', x: 'ₓ', h: 'ₕ', k: 'ₖ', l: 'ₗ', m: 'ₘ', n: 'ₙ', p: 'ₚ', s: 'ₛ', t: 'ₜ' };
const SUP: Record<string, string> = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '+': '⁺', '-': '⁻', '=': '⁼', '(': '⁽', ')': '⁾', n: 'ⁿ', i: 'ⁱ', a: 'ᵃ', b: 'ᵇ', d: 'ᵈ', e: 'ᵉ', g: 'ᵍ', h: 'ʰ', k: 'ᵏ', l: 'ˡ', m: 'ᵐ', o: 'ᵒ', p: 'ᵖ', r: 'ʳ', t: 'ᵗ', u: 'ᵘ', v: 'ᵛ', w: 'ʷ', x: 'ˣ', y: 'ʸ', z: 'ᶻ' };
const GREC: Record<string, string> = { alpha: 'α', beta: 'β', gamma: 'γ', Gamma: 'Γ', delta: 'δ', Delta: 'Δ', lambda: 'λ', Lambda: 'Λ', mu: 'μ', nu: 'ν', pi: 'π', Pi: 'Π', rho: 'ρ', sigma: 'σ', Sigma: 'Σ', phi: 'φ', chi: 'χ', omega: 'ω', Omega: 'Ω', theta: 'θ' };

function mapper(s: string, table: Record<string, string>): string {
  let out = '';
  for (const c of s) out += table[c] ?? c;
  return out;
}

/** Convertit le LaTeX inline/display du livre en Unicode lisible. */
function texVersUnicode(s: string): string {
  s = s.replace(/\\text\{([^{}]*)\}/g, '$1');
  s = s.replace(/\\(?:mathrm|mathbf|textbf|mathit)\{([^{}]*)\}/g, '$1');
  s = s.replace(/\\frac\{([^{}]*)\}\{([^{}]*)\}/g, '($1)/($2)');
  s = s.replace(/\\longrightarrow|\\rightarrow|\\to\b/g, '⟶');
  s = s.replace(/\\%|\\,/g, (m) => (m === '\\%' ? '%' : ' '));
  s = s.replace(/\\([A-Za-z]+)/g, (m, w: string) => GREC[w] ?? m);
  let out = '';
  let i = 0;
  while (i < s.length) {
    const c = s[i];
    if ((c === '_' || c === '^') && i + 1 < s.length) {
      let j = i + 1;
      let grp = '';
      if (s[j] === '{') {
        const f = s.indexOf('}', j);
        grp = s.slice(j + 1, f === -1 ? j + 1 : f);
        j = f === -1 ? s.length : f + 1;
      } else {
        grp = s[j];
        j += 1;
      }
      // la base reste intacte (H_{12} → H₁₂, m^2 → m², NAD^+ → NAD⁺)
      out += c === '_' ? mapper(grp, SUB) : mapper(grp, SUP);
      i = j;
      continue;
    }
    out += c;
    i += 1;
  }
  return out.replace(/[{}$]/g, '').replace(/\s{2,}/g, ' ').trim();
}

/* ── Nettoyage : artefacts, intros, prompts, pngs, en-têtes de page ─────── */
function nettoyer(raw: string): string | null {
  let l = raw.replace(/\s+$/u, '');
  if (/^[\s\u200B\uFEFF\u200E]*$/u.test(l)) return null;
  if (/^livre_scolaire/i.test(l.trim()) || /^EXTRAIRE/.test(l.trim())) return null;
  if (/^\s*إليك النص/.test(l) || /^تمت مراجعة النص/.test(l.trim())) return null;
  if (/^#{1,6}\s*.*الصفحة/.test(l) || /^الصفحة\s*\d/.test(l.trim())) return null;
  if (/^(---|\*\*\*+|___+)\s*$/.test(l.trim())) return null;
  const mImg = /^الصورة\s+\S+\s*[:：]\s*(.+)$/.exec(l.trim());
  if (mImg) l = '### **' + mImg[1] + '**';
  if (!/[\u0600-\u06FF]/.test(l) && l.trim().length <= 3) return null;
  l = latex(l).replace(/[ ]{2,}/g, ' ').trim();
  return l || null;
}

/* ── Parse : ligne nettoyée → bloc sémantique ──────────────────────────── */
const sansGras = (s: string): string => s.replace(/\*\*/g, '').trim();

function analyser(ligne: string): BlocOkacha {
  let t = ligne.trim().replace(/^#{1,6}\s*/, '');
  const nu = sansGras(t);
  const mAct = /^(النشاط\s+[➊-➟⓫-⓴①-⑳0-9]{1,3}\s*[:：].*)$/.exec(nu);
  if (mAct) return { kind: 'titre', texte: mAct[1] };
  if (/^الحصيلة المعرفية/.test(nu) && nu.length < 80) return { kind: 'titre', texte: nu };
  if (/^(?:I|II|III)-\s+/.test(nu)) return { kind: 'titre', texte: nu };
  // « **الغرض:** suite » → point avec libellé ; seul → note surlignée
  const mLib = /^\*\*([^*]{1,45}?)\s*[:：]\*\*\s*(.*)$/.exec(t);
  if (mLib) {
    const suite = sansGras(mLib[2] ?? '');
    if (suite) return { kind: 'point', texte: suite, num: sansGras(mLib[1]) + ':' };
    return { kind: 'note', texte: sansGras(mLib[1]) + ':' };
  }
  const mLet = /^\*\*([أ-ي]\)[^*]*)\*\*\s*(.*)$/.exec(t);
  if (mLet) {
    const suite = sansGras(mLet[2] ?? '');
    if (suite) return { kind: 'point', texte: suite, num: mLet[1].replace(/[:：]\s*$/, '') };
    return { kind: 'note', texte: sansGras(mLet[1]) };
  }
  const mLet2 = /^([أ-ي]\))\s+(.*)$/.exec(nu);
  if (mLet2) return { kind: 'point', texte: mLet2[2], num: mLet2[1] };
  const mNum = /^(\d{1,2})[.)]\s+(.*)$/.exec(nu);
  if (mNum) return { kind: 'point', texte: sansGras(mNum[2]), num: mNum[1] };
  if (/^\*\*[^*]+\*\*$/.test(t)) return { kind: 'note', texte: nu };
  const mPuce = /^[-*•]\s+(.*)$/.exec(t) ?? /^\*\s+(.*)$/.exec(t);
  if (mPuce) return { kind: 'puce', texte: sansGras(mPuce[1]) };
  return { kind: 'texte', texte: nu };
}

/* ── LaTeX $…$ / $$…$$ → Unicode (l'app n'a pas de renderer math) ──────── */
function latex(s: string): string {
  s = s.replace(/\$\$([^$]+)\$\$/g, (_t, m) => texVersUnicode(m));
  s = s.replace(/\$([^$]+)\$/g, (_t, m) => texVersUnicode(m));
  return s;
}

/* ── Construction (segments déterministes + verrous d'ancrage) ─────────── */
const source = readFileSync(join(racine, CHEMIN_SOURCE), 'utf8').split(/\r?\n/);

const unitesGenerees = UNITES.map((conf) => {
  const bruttes: string[] = [];
  for (const seg of conf.segs) {
    const ouverture = source.slice(seg.debut - 1, seg.debut + 5).join('\n');
    if (!ouverture.includes(seg.ancre)) {
      throw new Error(`${conf.id} l.${seg.debut} : ancre « ${seg.ancre} » absente de l'ouverture du segment`);
    }
    bruttes.push(...source.slice(seg.debut - 1, seg.fin));
  }
  const blocs: BlocOkacha[] = [];
  let precedent = '';
  for (const brut of bruttes) {
    const l = nettoyer(brut);
    if (l === null) continue;
    const b = analyser(l);
    if (!b.texte || !b.texte.trim()) continue;
    const texte = b.texte.replace(/\s{2,}/g, ' ').trim();
    const cle = b.kind + '|' + texte;
    if (cle === precedent) continue; // doublon consécutif
    precedent = cle;
    blocs.push(b.num ? { kind: b.kind, texte, num: b.num } : { kind: b.kind, texte });
  }
  if (blocs.length < 6) {
    throw new Error(`${conf.id} : seulement ${blocs.length} blocs (segments ${conf.segs.map((s) => `${s.debut}-${s.fin}`).join(', ')})`);
  }
  const tout = blocs.map((b) => `${b.num ?? ''} ${b.texte}`).join(' ');
  for (const a of conf.ancres) {
    if (!tout.includes(a)) throw new Error(`${conf.id} : ancre unité « ${a} » absente du contenu généré`);
  }
  const ref = OKACHA_UNITES_ENRICHIES.find((u) => u.id === conf.id);
  if (!ref) throw new Error(`${conf.id} : introuvable dans okachaEnriched (domaine/uniteAr)`);
  // Titre de section du livre garanti (contrat du verrou hosila.lock.test.ts).
  if (!blocs.some((b) => b.kind === 'titre' && b.texte.includes('الحصيلة'))) {
    blocs.unshift({ kind: 'titre', texte: 'الحصيلة المعرفية' });
  }
  // Cartes محفوظة (mode حفظ) : la 1ʳᵉ réponse après chaque « النشاط » devient
  // un « point » masquable → ≥ 1 carte par unité + une carte par activité livre.
  for (let i = 0; i < blocs.length - 1; i++) {
    const suit = blocs[i + 1];
    if (blocs[i].kind === 'titre' && blocs[i].texte.includes('النشاط')
      && (suit.kind === 'texte' || suit.kind === 'puce')) {
      blocs[i + 1] = { kind: 'point', texte: suit.texte };
    }
  }
  if (!blocs.some((b) => b.kind === 'point')) {
    // On doit pouvoir masquer/révéler au moins un point par unité dans le mode
    // حفظ ; on ne crée jamais un point vide : on prend le premier paragraphe
    // non vide long (≥ 40) ou, à défaut, le plus long bloc non vide existant.
    let j = blocs.findIndex(
      (b) => b.kind === 'texte' && b.texte.replace(/\s/g, '').length >= 40,
    );
    if (j === -1)
      j = blocs.findIndex(
        (b) =>
          b.kind === 'texte' &&
          b.texte.trim().length > 0 &&
          !b.texte.match(/^(?:-|(?:\d+\.|•\s|[•·‣▪▸]))\s*\p{Emoji_Presentation}?/u),
      );
    if (j !== -1) blocs[j] = { kind: 'point', texte: blocs[j].texte };
  }
  // نقطة = carte masquable en mode حفظ (kind « point » uniquement).
  const nbPoints = blocs.filter((b) => b.kind === 'point').length;
  return { conf, ref, blocs, nbPoints };
});

/** Portée affichée sur la carte : marque officielle + pages du livre. */
const portee = (p: string) => (p.startsWith('ص') ? `الحصيلة الرسمية · ${p}` : 'الحصيلة الرسمية');

const stats = {
  unites: unitesGenerees.length,
  points: unitesGenerees.reduce((s, u) => s + u.nbPoints, 0),
  blocs: unitesGenerees.reduce((s, u) => s + u.blocs.length, 0),
};

/* ── Écriture src/data/hosila.ts ───────────────────────────────────────── */
const corps = unitesGenerees
  .map((u) => {
    const lb = u.blocs
      .map((b) => `      { kind: ${JSON.stringify(b.kind)}, texte: ${JSON.stringify(b.texte)}${b.num !== undefined ? `, num: ${JSON.stringify(b.num)}` : ''} },`)
      .join('\n');
    return `  ${JSON.stringify(u.conf.id)}: {
    id: ${JSON.stringify(u.conf.id)},
    uniteAr: ${JSON.stringify(u.ref.uniteAr)},
    domaine: ${JSON.stringify(u.ref.domaine)},
    sourceRange: ${JSON.stringify(portee(u.conf.pages))},
    nbPoints: ${u.nbPoints},
    blocs: [
${lb}
    ],
  },`;
  })
  .join('\n');

const ids = unitesGenerees.map((u) => `  ${JSON.stringify(u.conf.id)},`).join('\n');

const entete = `/* eslint-disable */
/**
 * GÉNÉRÉ — NE PAS ÉDITER À LA MAIN.
 * Script : scripts/build_hosila.ts (npx tsx) · Verrou : src/data/hosila.lock.test.ts
 * Source : uploads_externes/hosila_officielle_3as.txt
 *   (copie explicite de « إليك النص الكامل والمصحح المستخرج م.txt ») :
 *   الحصيلة المعرفية officielle du livre scolaire 3AS SVT, structurée par unité.
 * Nettoyage : intros « إليك النص… » / prompts « EXTRAIRE… » / pngs /
 *   en-têtes « الصفحة N: » exclus ; doublons fragmentés non retenus ;
 *   LaTeX → Unicode (SUB/SUP/GREC).
 * Stats : ${stats.unites} unités · ${stats.points} points · ${stats.blocs} blocs.
 */
import type { UniteOkachaEnrichie, BlocOkacha } from './okachaEnriched';

/** Contenu OFFICIEL (texte du livre) indexé par id d'unité. */
export const HOSILA_UNITE_PAR_ID: Readonly<Record<string, UniteOkachaEnrichie>> = {
${corps}
};

/** Ids des unités dont le contenu vient du livre. */
export const HOSILA_IDS = [
${ids}
] as const;

/** Liste ordonnée des unités officielles (usage tests/verrous + rendu). */
export const HOSILA_OFFICIELLES: readonly UniteOkachaEnrichie[] = HOSILA_IDS.map((id) => HOSILA_UNITE_PAR_ID[id]!);

export const HOSILA_STATS = {
  unites: ${stats.unites},
  points: ${stats.points},
  blocs: ${stats.blocs},
} as const;

/**
 * Fusion : contenu officiel prioritaire ; repli sur le récap عكاشة
 * (okachaEnriched) si une unité n'est pas encore couverte.
 */
export function unitesAffichees(repli: readonly UniteOkachaEnrichie[]): UniteOkachaEnrichie[] {
  return repli.map((u) => HOSILA_UNITE_PAR_ID[u.id] ?? u);
}
`;

writeFileSync(join(racine, 'src/data/hosila.ts'), entete, 'utf8');
console.log(`hosila.ts généré : ${stats.unites} unités · ${stats.points} points · ${stats.blocs} blocs`);
for (const u of unitesGenerees) {
  console.log(`  ${u.conf.id} [${u.conf.segs.map((s) => `${s.debut}-${s.fin}`).join(' + ')}] → ${u.blocs.length} blocs · ${u.nbPoints} pts`);
}



