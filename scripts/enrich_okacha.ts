// enrich_okacha.ts — 2ᵉ passe OCR + structuration du « بنك الحفظ » (audit 2026-09-22).
//
// ENTRÉE : src/data/okacha.ts (injection mécanique v1 verbatim — NE PAS ÉDITER).
// SORTIE : src/data/okachaEnriched.ts (GÉNÉRÉ — NE PAS ÉDITER À LA MAIN).
//
// Transformations (toutes tracées dans ENRICH_STATS / ENRICH_FIXES) :
//  1. Parsing en blocs sémantiques : titre | point (numéroté) | puce | note | texte ;
//  2. Recollage des fragments OCR (< 25 car.) et des lignes de continuation
//     (précédent sans ponctuation finale) — le texte reste contiguous ;
//  3. Normalisation de la numérotation (« 6-\t » → « 6- », « 14 ٠ » → « 14- »,
//     « 3 1 - » → « 31- ») — AUCUNE renumérotation, seul le séparateur est nettoyé ;
//  4. Corrections OCR à haute confiance (dictionnaire ci-dessous) — zéro invention :
//     un mot non réparable reste verbatim ;
//  5. Méthodo : découpage en sections par déclencheurs documentés.
//
// Verrou : src/data/okachaEnriched.lock.test.ts (v2).

import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { OKACHA_UNITES, OKACHA_METHODO } from '../src/data/okacha';

// ── Dictionnaire de corrections OCR (haute confiance uniquement) ──
const FIXES: Record<string, string> = {
  'الرونبنات': 'البروتينات', // permutation boustrophedon attestée (U1)
  'الأمنية': 'الأمينية', // أحماض أمينية (U1)
  'براوبط': 'بروابط', // روابط boustrophedon (U1)
  'النيكلبوتيدة': 'النيكليوتيدة', // (U1)
  'النيكلبوتيدات': 'النيكليوتيدات',
};

// ── Normalisation arabe (même logique que okacha.lock.test.ts) ──
export const normAr = (s: string): string =>
  s
    .normalize('NFKC')
    .replace(/[\u064B-\u065F\u0670\u0640]/g, '')
    .replace(/[إأآٱا]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي');

type BlocKind = 'titre' | 'point' | 'puce' | 'note' | 'texte';
interface Bloc {
  kind: BlocKind;
  num?: string;
  texte: string;
}

const TERMINAL = /[.!؟:]$/;

// Détection d'un point numéroté (chiffres latins OU arabes-indiques, ou lettre-ordinal)
// NB : « ٠ » n'est PAS un séparateur ici — il est géré comme puce (branche num==='٠').
const RE_POINT =
  /^\s*((?:\d{1,2}|[٠-٩]{1,2})\s*(?:[-–٫.\t''ʼ])\s*|[٠-٩]\s+(?=\S)|[أ-ي]\s*-\s*)/;
const RE_POINT_DIRTY = /^\s*(\d{1,2})\s+([٠ا]|ا)\s*[-–٫.]?\s*/; // « 14 ٠ » / « 1 ا »
const RE_POINT_SPLIT = /^\s*(\d)\s+(\d)\s*[-–٫.]\s*/; // « 3 1 - » → « 31- »
const RE_PUCE = /^\s*(?:[٠•*\u2022]|-\s|\u2013\s|\.)/;

function parseBlocRaw(raw: string): Bloc {
  const t = raw.replace(/\s+/g, ' ').trim();
  if (/^الوحدة/.test(t)) return { kind: 'titre', texte: t };
  let m = RE_POINT_SPLIT.exec(t);
  if (m) return { kind: 'point', num: `${m[1]}${m[2]}`, texte: `${m[1]}${m[2]}- ${t.slice(m[0].length)}` };
  m = RE_POINT_DIRTY.exec(t);
  if (m) return { kind: 'point', num: m[1], texte: `${m[1]}- ${t.slice(m[0].length)}` };
  m = RE_POINT.exec(t);
  if (m) {
    // NB : « ٠ » N'EST PAS dans la classe de strip — c'est un chiffre, pas un séparateur.
    let num = m[1].trim().replace(/[-–٫.\t\s''ʼ]+$/g, '');
    if (!num) num = '٠';
    // « ٠ » seul en tête = puce OCR, pas un point numéroté 0 (tiret inclus).
    if (num === '٠') {
      return { kind: 'puce', texte: t.replace(/^\s*٠\s*[-–٫.]?\s*/, '') };
    }
    // Gargouilles OCR d'apostrophe entre le numéro et le tiret (« 3'?- ») :
    // le marqueur a mangé « ' », le « ? » et le « - » résiduels partent aussi.
    const reste = t.slice(m[0].length).replace(/^\s*[?'؟][-–٫.\s]*/, '');
    return { kind: 'point', num, texte: `${num}- ${reste}` };
  }
  if (/^ملاحظة/.test(t)) return { kind: 'note', texte: t };
  if (RE_PUCE.test(t)) {
    const texte = t
      .replace(/^\s*[٠•*\u2022]\s*/, '')
      .replace(/^\s*[-–]\s*/, '')
      .replace(/^\s*\.\s*/, '');
    // Une puce qui n'est qu'un intitulé court se terminant par « : » = sous-titre.
    if (texte.endsWith(':') && texte.length < 40) return { kind: 'titre', texte };
    return { kind: 'puce', texte };
  }
  if (t.endsWith(':') && t.length < 90) return { kind: 'titre', texte: t };
  return { kind: 'texte', texte: t };
}

/** Même critère que les passes A/C et le verrou : un sous-titre court (< 20 car.)
 *  finissant par « : » est un TITRE — « ملاحظة: », « 1- التحليل: »… ne sont pas
 *  des fragments orphelins. Appliqué APRÈS les branches point/note/puce (qui
 *  interceptent ces lignes avant la règle titre générique). */
function parseBloc(raw: string): Bloc {
  const b = parseBlocRaw(raw);
  if (b.kind !== 'titre' && b.texte.trim().endsWith(':') && b.texte.trim().length < 20) {
    b.kind = 'titre';
  }
  return b;
}

/** Applique les 3 passes de recollage + normalisation sur une liste de lignes brutes. */
function structurize(lignes: string[]): { blocs: Bloc[]; fragments: number; rattrapages: number; numeros: number } {
  const blocs = lignes.map(parseBloc).filter((b) => b.texte.length > 0);
  let fragments = 0;
  let rattrapages = 0;
  let numeros = 0;

  // Pass A — fragments courts (< 25 car.) : recollés au précédent (ou au suivant).
  // Protection : les blocs « titre de section » (court et se terminant par « : »)
  // ne sont JAMAIS recollés — ils servent de déclencheurs (méthodo) et d'ancres.
  const isHeadingLike = (b: Bloc) => b.texte.trim().endsWith(':') && b.texte.trim().length < 40;
  for (let i = 0; i < blocs.length; ) {
    const b = blocs[i];
    if (b.kind !== 'titre' && !isHeadingLike(b) && b.texte.trim().length < 25) {
      if (i > 0) {
        blocs[i - 1].texte += ` ${b.texte}`;
        blocs.splice(i, 1);
      } else if (blocs.length > 1) {
        blocs[i + 1].texte = `${b.texte} ${blocs[i + 1].texte}`;
        blocs.splice(i, 1);
      } else break;
      fragments++;
    } else i++;
  }

  // Pass B — continuations : uniquement vers une ligne « texte » (jamais vers une
  // puce/point — deux puces sans point final restent deux puces distinctes).
  for (let i = 0; i < blocs.length - 1; ) {
    const b = blocs[i];
    const next = blocs[i + 1];
    if (
      next.kind === 'texte' &&
      (b.kind === 'texte' || b.kind === 'puce') &&
      !TERMINAL.test(b.texte.trim())
    ) {
      b.texte += ` ${next.texte}`;
      blocs.splice(i + 1, 1);
      rattrapages++;
    } else i++;
  }

  // Pass C — sécurité : plus aucun non-titre < 20 car. (titres protégés).
  for (let i = 0; i < blocs.length; ) {
    const b = blocs[i];
    if (b.kind !== 'titre' && !isHeadingLike(b) && b.texte.trim().length < 20) {
      if (i > 0) {
        blocs[i - 1].texte += ` ${b.texte}`;
        blocs.splice(i, 1);
      } else if (blocs.length > 1) {
        blocs[i + 1].texte = `${b.texte} ${blocs[i + 1].texte}`;
        blocs.splice(i, 1);
      } else break;
      fragments++;
    } else i++;
  }

  // Normalisation de la numérotation (aucune renumérotation — séparateurs seulement).
  for (const b of blocs) {
    if (b.kind === 'point' && /\t/.test(b.texte)) {
      b.texte = b.texte.replace(/\t+/g, ' ').replace(/\s{2,}/g, ' ');
      numeros++;
    }
  }
  return { blocs, fragments, rattrapages, numeros };
}

// ── Sections méthodo : dans L'ORDRE DU LIVRE. Déclencheurs testés sur le texte
// NORMALISÉ (normAr : ة→ه, أ→ا, ى→ي) — motifs écrits en forme normalisée :
// « 1- التحليل: » (l.205), « 2-التفهلسوير: » (l.289, OCR de التفسير),
// « 3- المقارنة: » → « 3- المقارنه: », « ٠. اللالملقفقاة: » (l.339, OCR de
// الاستنتاج), « 9-الاستدلال العلمي: » (l.437) — sondage scripts/_probe_okacha.ts.
const SECTION_RULES: { id: string; titreAr: string; test: (t: string) => boolean }[] = [
  {
    id: 'intro',
    titreAr: 'مقدمة المنهجية — قواعد العمل',
    test: () => false, // section par défaut (tout ce qui précède le 1ᵉʳ déclencheur)
  },
  {
    id: 'hikala',
    titreAr: 'هيكلة الموضوع — التمهيد، الوثائق، التعليمة',
    test: (t) => t.includes('الهيكله العامه') || t.startsWith('التمهيد'),
  },
  {
    id: 'tamarin1',
    titreAr: 'التمرين الأول — أسئلة استرداد الموارد',
    test: (t) =>
      t.length < 60 &&
      /النمريف الامل|التمرين الاول|النمرين الاول|ارز ما يطرح/.test(t),
  },
  {
    id: 'tahil',
    titreAr: 'التحليل — استغلال الوثيقة',
    test: (t) => t.length < 45 && /^1\s*[''ʼ٠]?\s*[-–٫.]?\s*التحليل|^التحليل:/.test(t),
  },
  {
    id: 'tafsir',
    titreAr: 'التفسير — من الملاحظة إلى العلّة',
    // Variantes OCR attestées : « 2-التفهلسير: » (l.289) et « التفسير ».
    test: (t) => t.length < 45 && /^2\s*[-–٫.]?\s*التف\S{0,5}ير/.test(t),
  },
  {
    id: 'mouqarana',
    titreAr: 'المقارنة — أوجه التشابه والاختلاف',
    test: (t) => t.length < 45 && /^3\s*[-–٫.]?\s*المقارنه/.test(t),
  },
  {
    id: 'istinj',
    titreAr: 'الاستنتاج — خاص وعام',
    test: (t) => {
      const core = t.replace(/^[\s٠.٫\-–]+/, '');
      return (
        /^٠\s*[.٫]?\s*(اللالملقفقاه|الاستنتاج)/.test(t) ||
        (core.length < 45 && /الاستنتاج|الاستتاج|اللالملقفقاه/.test(core))
      );
    },
  },
  {
    id: 'istidlal',
    titreAr: 'الاستدلال العلمي ومعاييره',
    test: (t) => t.length < 50 && /الاستدلال العلمي|الاست»دلال/.test(t),
  },
];

function sectionsMethodo(lignes: string[]): {
  sections: { id: string; titreAr: string; blocs: Bloc[] }[];
  corrections: number;
  fragments: number;
  rattrapages: number;
  numeros: number;
} {
  const { blocs, fragments, rattrapages, numeros } = structurize(lignes);
  const corrections = applyFixes(blocs);
  const sections: { id: string; titreAr: string; blocs: Bloc[] }[] = [];
  let current = { id: 'intro', titreAr: SECTION_RULES[0].titreAr, blocs: [] as Bloc[] };
  sections.push(current);
  // Pointeur : chaque déclencheur n'est testé que dans l'ordre du livre —
  // une mention tardive d'un thème déjà traité ne rouvre jamais sa section.
  let nextRule = 1;
  for (const b of blocs) {
    const t = normAr(b.texte);
    if (nextRule < SECTION_RULES.length && SECTION_RULES[nextRule].test(t)) {
      current = { id: SECTION_RULES[nextRule].id, titreAr: SECTION_RULES[nextRule].titreAr, blocs: [b] };
      sections.push(current);
      nextRule++;
    } else {
      current.blocs.push(b);
    }
  }
  // Fusion des sections trop petites (< 3 blocs) dans la précédente — jamais de section vide.
  for (let i = 1; i < sections.length; ) {
    if (sections[i].blocs.length < 3) {
      sections[i - 1].blocs.push(...sections[i].blocs);
      sections.splice(i, 1);
    } else i++;
  }
  return { sections, corrections, fragments, rattrapages, numeros };
}
function applyFixes(blocs: Bloc[]): number {
  let n = 0;
  for (const b of blocs) {
    for (const [from, to] of Object.entries(FIXES)) {
      while (b.texte.includes(from)) {
        b.texte = b.texte.replace(from, to);
        n++;
      }
    }
  }
  return n;
}

// ── Génération ──
const stats = { fragments: 0, rattrapages: 0, numeros: 0, corrections: 0 };
const unitesOut = OKACHA_UNITES.map((u) => {
  const r = structurize(u.lignes);
  const corrections = applyFixes(r.blocs);
  stats.fragments += r.fragments;
  stats.rattrapages += r.rattrapages;
  stats.numeros += r.numeros;
  stats.corrections += corrections;
  return {
    id: u.id,
    domaine: u.domaine,
    uniteAr: u.uniteAr,
    sourceRange: u.sourceRange,
    blocs: r.blocs,
    nbPoints: r.blocs.filter((b) => b.kind === 'point').length,
  };
});

// Copie mutable : OKACHA_METHODO.lignes est un tuple readonly (okacha.ts as const).
const meth = sectionsMethodo([...OKACHA_METHODO.lignes]);
stats.corrections += meth.corrections;
stats.fragments += meth.fragments;
stats.rattrapages += meth.rattrapages;
stats.numeros += meth.numeros;

// Comptage précis des corrections : réapplication sur les textes ORIGINAUX.
const fixesOut = Object.entries(FIXES).map(([from, to]) => {
  let count = 0;
  for (const l of [...OKACHA_UNITES.flatMap((u) => u.lignes), ...OKACHA_METHODO.lignes]) {
    count += l.split(from).length - 1;
  }
  return { from, to, count };
});

function blocTs(b: Bloc): string {
  const num = b.num ? `, num: ${JSON.stringify(b.num)}` : '';
  return `    { kind: ${JSON.stringify(b.kind)}${num}, texte: ${JSON.stringify(b.texte)} }`;
}

const out: string[] = [];
out.push('// okachaEnriched.ts — GÉNÉRÉ par scripts/enrich_okacha.ts — NE PAS ÉDITER À LA MAIN.');
out.push('// 2ᵉ passe OCR + structuration du بنك الحفظ (audit 2026-09-22, phases A+B).');
out.push('// Source : src/data/okacha.ts (injection mécanique v1) — transformations tracées');
out.push('// dans ENRICH_STATS / ENRICH_FIXES. Verrou : src/data/okachaEnriched.lock.test.ts');
out.push('');
out.push("export type BlocKind = 'titre' | 'point' | 'puce' | 'note' | 'texte';");
out.push('');
out.push('export interface BlocOkacha {');
out.push('  kind: BlocKind;');
out.push('  num?: string;');
out.push('  texte: string;');
out.push('}');
out.push('');
out.push('export interface UniteOkachaEnrichie {');
out.push('  id: string;');
out.push('  domaine: 1 | 2 | 3;');
out.push('  uniteAr: string;');
out.push('  sourceRange: string;');
out.push('  blocs: BlocOkacha[];');
out.push('  nbPoints: number;');
out.push('}');
out.push('');
out.push('export interface SectionMethodo {');
out.push('  id: string;');
out.push('  titreAr: string;');
out.push('  blocs: BlocOkacha[];');
out.push('}');
out.push('');
out.push('/** Normalisation arabe pour la recherche (miroir de okacha.lock.test.ts). */');
out.push('export const normAr = ' + normAr.toString() + ';');
out.push('');
out.push('export const OKACHA_UNITES_ENRICHIES: UniteOkachaEnrichie[] = [');
for (const u of unitesOut) {
  out.push('  {');
  out.push(`    id: ${JSON.stringify(u.id)},`);
  out.push(`    domaine: ${u.domaine} as 1 | 2 | 3,`);
  out.push(`    uniteAr: ${JSON.stringify(u.uniteAr)},`);
  out.push(`    sourceRange: ${JSON.stringify(u.sourceRange)},`);
  out.push('    blocs: [');
  for (const b of u.blocs) out.push(blocTs(b) + ',');
  out.push('    ],');
  out.push(`    nbPoints: ${u.nbPoints},`);
  out.push('  },');
}
out.push('];');
out.push('');
out.push('export const OKACHA_METHODO_SECTIONS: SectionMethodo[] = [');
for (const s of meth.sections) {
  out.push('  {');
  out.push(`    id: ${JSON.stringify(s.id)},`);
  out.push(`    titreAr: ${JSON.stringify(s.titreAr)},`);
  out.push('    blocs: [');
  for (const b of s.blocs) out.push(blocTs(b) + ',');
  out.push('    ],');
  out.push('  },');
}
out.push('];');
out.push('');
out.push('/** Corrections OCR appliquées (haute confiance) — comptées sur les textes sources. */');
out.push('export const ENRICH_FIXES: { from: string; to: string; count: number }[] = [');
for (const f of fixesOut) {
  out.push(`  { from: ${JSON.stringify(f.from)}, to: ${JSON.stringify(f.to)}, count: ${f.count} },`);
}
out.push('];');
out.push('');
out.push("/** Bilan de la passe d'enrichissement (audit 2026-09-22). */");
out.push('export const ENRICH_STATS = {');
out.push(`  fragmentsRecolles: ${stats.fragments},`);
out.push(`  rattrapagesContinuation: ${stats.rattrapages},`);
out.push(`  numerosNormalises: ${stats.numeros},`);
out.push(`  correctionsAppliquees: ${stats.corrections},`);
out.push(`  sectionsMethodo: ${meth.sections.length},`);
out.push(`  pointsTotal: ${unitesOut.reduce((s, u) => s + u.nbPoints, 0)},`);
out.push("  genere: '2026-09-22',");
out.push('} as const;');
out.push('');

const OUT_PATH = resolve(import.meta.dirname ?? '.', '../src/data/okachaEnriched.ts');
writeFileSync(OUT_PATH, out.join('\n'), 'utf-8');

console.log('[enrich_okacha] généré :', OUT_PATH);
console.log('  unités             :', unitesOut.length);
console.log('  points numérotés   :', unitesOut.reduce((s, u) => s + u.nbPoints, 0));
console.log('  fragments recollés :', stats.fragments);
console.log('  rattrapages        :', stats.rattrapages);
console.log('  numéros normalisés :', stats.numeros);
console.log('  corrections OCR    :', stats.corrections);
console.log('  sections méthodo   :', meth.sections.length, '→', meth.sections.map((s) => `${s.id}(${s.blocs.length})`).join(' '));

