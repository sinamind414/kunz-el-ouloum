/**
 * analyser-tracabilite.ts — Diagnostic HORS CI de la traçabilité mots-clés ↔ sources.
 *
 * Contexte (audit 2026-09-16) : L5 (التدرج السنوي 2017) et L6 (دليل الأستاذ 2017)
 * sont les deux seules sources présentes (commitées — documents officiels, voir
 * docs/sources/README.md). Ce script mesure, pour chaque source disponible,
 * combien de mots-clés des unités qui la déclarent sont réellement localisables,
 * selon deux pipelines :
 *
 *   · PRODUCTION — fixSubscripts + normalizeAr (identique test + extracteur) ;
 *   · NFKC       — Unicode NFKC (déplie les presentation forms U+FBxx/U+FExx,
 *                  massives dans L5, que normalizeAr remplace par des espaces
 *                  → mots entiers détruits) puis pipeline PRODUCTION.
 *
 * Mesure aussi la densité de presentation forms de chaque source et sonde les
 * erreurs OCR typiques de L6 (inversions, ligatures, chiffres).
 *
 * Usage : npx tsx scripts/analyser-tracabilite.ts
 */
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { normalizeAr } from '../src/lib/validation/normalizeAr';
import { CORRECTEUR_V1_UNITES, SOURCES_LABELS } from '../src/correcteurV1';

const SRC_DIR = path.resolve(import.meta.dirname, '..', 'docs', 'sources');
/** Nombre maximal de mots-clés manquants affichés par source. */
const MAX_MANQUANTS = 40;

/** Ramène les indices Unicode (CO₂…) à leur chiffre ASCII — identique test. */
function fixSubscripts(s: string): string {
  return s.replace(/[\u2080-\u2089]/g, (c) => String(c.codePointAt(0)! - 0x2080));
}
/** Pipeline PRODUCTION : exactement celui du test et de l'extracteur. */
const normProd = (s: string): string => normalizeAr(fixSubscripts(s));
/** Pipeline NFKC : dépliage Unicode puis pipeline production. */
const normNfkc = (s: string): string => normProd(s.normalize('NFKC'));

/** Localisation d'un mot-clé avec la tolérance « الـ » du test (article omittable). */
function localiser(nrm: string, kw: string, norm: (s: string) => string): boolean {
  const nk = norm(kw);
  if (!nk) return false;
  if (nrm.includes(nk)) return true;
  const relaxed = nk.startsWith('ال') && nk.length > 4 ? nk.slice(2) : '';
  return relaxed !== '' && nrm.includes(relaxed);
}

/** Occurrences brutes d'une sous-chaîne. */
const compter = (raw: string, needle: string): number =>
  needle === '' ? 0 : raw.split(needle).length - 1;

const pct = (part: number, total: number): string =>
  total === 0 ? '—' : `${Math.round((100 * part) / total)} %`;

interface LigneUnite {
  id: number;
  titre: string;
  total: number;
  prod: number;
  nfkc: number;
}
interface StatsSource {
  label: string;
  present: boolean;
  carBruts: number;
  carPresentation: number;
  lignes: LigneUnite[];
  prodTotal: number;
  nfkcTotal: number;
  motsTotal: number;
  manquantsNfkc: string[];
}

const brut: Record<string, string> = {};
const nProd: Record<string, string> = {};
const nNfkc: Record<string, string> = {};
const stats: StatsSource[] = [];

for (const [label, filename] of Object.entries(SOURCES_LABELS)) {
  const p = path.join(SRC_DIR, filename);
  if (!existsSync(p)) {
    stats.push({
      label,
      present: false,
      carBruts: 0,
      carPresentation: 0,
      lignes: [],
      prodTotal: 0,
      nfkcTotal: 0,
      motsTotal: 0,
      manquantsNfkc: [],
    });
    continue;
  }
  const raw = readFileSync(p, 'utf-8');
  brut[label] = raw;
  nProd[label] = normProd(raw);
  nNfkc[label] = normNfkc(raw);
  const st: StatsSource = {
    label,
    present: true,
    carBruts: raw.length,
    carPresentation: (raw.match(/[\uFB50-\uFDFF\uFE70-\uFEFF]/g) ?? []).length,
    lignes: [],
    prodTotal: 0,
    nfkcTotal: 0,
    motsTotal: 0,
    manquantsNfkc: [],
  };
  for (const u of CORRECTEUR_V1_UNITES) {
    if (!u.sources.includes(label)) continue;
    const mots = [...new Set(u.motsCles)];
    let prod = 0;
    let nfkc = 0;
    const manquants: string[] = [];
    for (const kw of mots) {
      const a = localiser(nProd[label]!, kw, normProd);
      const b = localiser(nNfkc[label]!, kw, normNfkc);
      if (a) prod += 1;
      if (b) nfkc += 1;
      else manquants.push(kw);
    }
    st.lignes.push({ id: u.uniteId, titre: u.titre, total: mots.length, prod, nfkc });
    st.prodTotal += prod;
    st.nfkcTotal += nfkc;
    st.motsTotal += mots.length;
    st.manquantsNfkc.push(...manquants);
  }
  stats.push(st);
}

// ── Impression ────────────────────────────────────────────────────────────────
const titreCourt = (t: string, n = 30): string => (t.length > n ? t.slice(0, n - 1) + '…' : t);

console.log('════════════════════════════════════════════════════════════════');
console.log(' DIAGNOSTIC TRAÇABILITÉ L1..L6 — pipeline PRODUCTION vs NFKC');
console.log('════════════════════════════════════════════════════════════════\n');

console.log('── 1. Densité de presentation forms (U+FB50-FDFF + U+FE70-FEFF) ──');
for (const s of stats) {
  if (!s.present) {
    console.log(`   ${s.label} : ABSENT de docs/sources/`);
    continue;
  }
  const p = ((100 * s.carPresentation) / Math.max(1, s.carBruts)).toFixed(1);
  console.log(
    `   ${s.label} : ${s.carPresentation.toLocaleString('fr-FR')} / ` +
      `${s.carBruts.toLocaleString('fr-FR')} car (${p} %)` +
      (s.carPresentation > 0 ? '  ← mots DÉTRUITS par normalizeAr (hors \\u0600-\\u06FF)' : ''),
  );
}

console.log('\n── 2. Mots-clés localisés par (source × unité) ──');
console.log('   Source | Unité                             | Mots | PROD        | NFKC        | Δ');
for (const s of stats) {
  if (!s.present) continue;
  if (s.lignes.length === 0) {
    console.log(`   ${s.label} : aucune unité ne déclare cette source`);
    continue;
  }
  for (const l of s.lignes) {
    console.log(
      `   ${s.label} | U${String(l.id).padEnd(2)} ${titreCourt(l.titre).padEnd(30)} | ` +
        `${String(l.total).padStart(4)} | ${`${l.prod} (${pct(l.prod, l.total)})`.padStart(11)} | ` +
        `${`${l.nfkc} (${pct(l.nfkc, l.total)})`.padStart(11)} | +${l.nfkc - l.prod}`,
    );
  }
  console.log(
    `   ${s.label} | ${'TOTAL'.padEnd(33)} | ${String(s.motsTotal).padStart(4)} | ` +
      `${`${s.prodTotal} (${pct(s.prodTotal, s.motsTotal)})`.padStart(11)} | ` +
      `${`${s.nfkcTotal} (${pct(s.nfkcTotal, s.motsTotal)})`.padStart(11)} | +${s.nfkcTotal - s.prodTotal}`,
  );
}

console.log('\n── 3. Vue UNITÉ : mots-clés trouvés dans ≥ 1 source disponible ──');
console.log('   (L1-L4 absentes : ce que L5/L6 prouvent à eux seuls)');
for (const u of CORRECTEUR_V1_UNITES) {
  const dispo = u.sources.filter((l) => nProd[l]);
  let prod = 0;
  let nfkc = 0;
  for (const kw of new Set(u.motsCles)) {
    if (dispo.some((l) => localiser(nProd[l]!, kw, normProd))) prod += 1;
    if (dispo.some((l) => localiser(nNfkc[l]!, kw, normNfkc))) nfkc += 1;
  }
  const total = new Set(u.motsCles).size;
  console.log(
    `   U${String(u.uniteId).padEnd(2)} ${titreCourt(u.titre).padEnd(30)} | ${String(total).padStart(4)} mots | ` +
      `PROD ${`${prod} (${pct(prod, total)})`.padStart(11)} | NFKC ${`${nfkc} (${pct(nfkc, total)})`.padStart(11)}`,
  );
}

console.log('\n── 4. Sondes OCR/encodage (occurrences BRUTES) ──');
const sondes: Array<[string, string]> = [
  ['البروتين', 'الربوتني'], // inversion OCR ب/ت ن
  ['الحياة', 'احلياة'], // mélecture de ligature
  ['الديمقراطية', 'ادلميقراطية'], // lam-alef mal reconstituée
  ['20', '٢٠'], // chiffres ASCII vs arabo-indiens
];
for (const s of stats) {
  if (!s.present) continue;
  const cell = sondes
    .map(
      ([ok, ko]) =>
        `«${ok}»=${compter(brut[s.label]!, ok)} vs «${ko}»=${compter(brut[s.label]!, ko)}`,
    )
    .join(' · ');
  console.log(`   ${s.label} : ${cell}`);
}

console.log('\n── 5. Mots-clés ENCORE manquants même avec NFKC (à attribuer prudemment) ──');
for (const s of stats) {
  if (!s.present || s.manquantsNfkc.length === 0) continue;
  console.log(`   ${s.label} — ${s.manquantsNfkc.length} manquant(s) :`);
  for (const kw of s.manquantsNfkc.slice(0, MAX_MANQUANTS)) console.log(`      • ${kw}`);
  if (s.manquantsNfkc.length > MAX_MANQUANTS)
    console.log(`      … +${s.manquantsNfkc.length - MAX_MANQUANTS} autres`);
}

console.log('\n── 6. Racines scientifiques dans les textes NORMALISÉS (concept présent ?) ──');
const racines = [
  'هيدروجين', 'زوتي', 'بوليميراز', 'يوراسيل', 'ببتيد', 'ريبوزوم',
  'غلوبين', 'لفا', 'بيتا', 'انزيم', 'ميتوكوندري', 'تكتوني', 'منجلي', 'كيراتين',
];
const nb = (t: string | undefined, r: string): string =>
  t === undefined ? '   —' : String(compter(t, r)).padStart(4);
for (const r of racines) {
  console.log(
    `   ${r.padEnd(11)} | L5 prod${nb(nProd['L5'], r)} nfkc${nb(nNfkc['L5'], r)} ` +
      `| L6 prod${nb(nProd['L6'], r)} nfkc${nb(nNfkc['L6'], r)}`,
  );
}
console.log('   Sondes OCR sur L6 APRÈS NFKC (erreurs de lettres survivant au dépliage) :');
for (const [ok, ko] of [
  ['البروتين', 'الربوتني'],
  ['الحياة', 'احلياة'],
  ['الديمقراطية', 'ادلميقراطية'],
]) {
  console.log(
    `      «${ok}»=${compter(nNfkc['L6'] ?? '', ok)} vs «${ko}»=${compter(nNfkc['L6'] ?? '', ko)}`,
  );
}

console.log('\n── 7. Mots-clés étiquetés [L5]/[L6] de l unité 1 (test de provenance) ──');
const echantillon: Array<[string, string]> = [
  ['L5', 'مقر تركيب البروتين'],
  ['L5', 'انتقال المعلومة الوراثية من النواة'],
  ['L5', 'حل شفرة المعلومة'],
  ['L5', 'شروط التركيب'],
  ['L6', 'الحمض الريبي النووي الرسول'],
  ['L6', 'رامزة AUG'],
  ['L6', 'الانتخاب اللمي'],
];
for (const [lbl, kw] of echantillon) {
  const etat = (n: string | undefined): string =>
    !n ? '∅' : localiser(n, kw, normProd) ? 'OUI (prod)' : localiser(n, kw, normNfkc) ? 'OUI (nfkc)' : 'NON';
  console.log(`   [${lbl}] «${kw}» → L5: ${etat(nProd['L5'])} | L6: ${etat(nProd['L6'])}`);
}

const gateOk = CORRECTEUR_V1_UNITES.filter((u) => u.sources.every((l) => nProd[l])).length;
console.log(
  `\n── Gate actuel (test) : unités intégralement vérifiables = ${gateOk}/${CORRECTEUR_V1_UNITES.length} ──`,
);
console.log("   (une unité n'est vérifiée que si TOUTES ses sources déclarées sont présentes)");

