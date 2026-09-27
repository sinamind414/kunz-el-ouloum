// simuler-fix-ex3.ts — mesure fidèle (via le VRAI moteur) des corrections Ex3.
//
// Actuel      : moteur tel que livré (MAE de référence 1.30).
// fix1        : item 19 (NE) — on ajoute la forme "ne" (label du corrigé officiel).
// fix1+E      : + re-pondération des 3 parties sur le barème officiel
//               (P1 1,5 · P2 4,5 · P3 2) au lieu du registre (P1 3,5 · P2 3,5 · P3 1).
//
// La re-pondération s'applique sur les verdicts RÉELS du moteur (pointsCredites
// par item), sans reinjecter la logique de matching.

import { readFileSync } from 'node:fs';
import { ATTENDUS_BAC2025 } from '../src/data/dictionaries/attendusBac2025';
import { noterExerciceCalibre } from '../src/data/dictionaries/calibrationBac2025';
import { couperBlocScore, parserScoreAttendu, splitSections } from '../src/supervision/evaluerCopies';

const PARTIE: Record<string, 1 | 2 | 3> = {
  'corr-2025-13': 1, 'corr-2025-14': 1, 'corr-2025-15': 1, 'corr-2025-16': 1,
  'corr-2025-17': 1, 'corr-2025-18': 1,
  'corr-2025-19': 2, 'corr-2025-20': 2, 'corr-2025-21': 2, 'corr-2025-22': 2,
  'corr-2025-23': 2,
  'corr-2025-24': 3, 'corr-2025-25': 3,
};
const POIDS_REGISTRE: Record<number, number> = { 1: 3.5, 2: 3.5, 3: 1.0 };
const POIDS_OFFICIEL: Record<number, number> = { 1: 1.5, 2: 4.5, 3: 2.0 };

const reg = ATTENDUS_BAC2025[1][3];
const it19 = reg.items.find((i) => i.id === 'corr-2025-19')!;

interface Run { prof: number; actuel: number; Eseul: number; fix1: number; fix1E: number }
const runs: Run[] = [];

// ── Passe 1 : actuel (sans le fix) + E seul (re-pondération officielle) ──
for (let i = 1; i <= 40; i++) {
  const n = String(i).padStart(2, '0');
  const brut = readFileSync(`eleve_${n}.txt`, 'utf-8');
  const a = parserScoreAttendu(brut);
  if (a.exercices[2] === null) continue;
  const texte = splitSections(couperBlocScore(brut))![2];
  const r = noterExerciceCalibre(texte, 1, 3);
  const parts: Record<number, number> = { 1: 0, 2: 0, 3: 0 };
  for (const v of r.verdicts) {
    if (v.auto && v.credite) parts[PARTIE[v.id]] += v.pointsCredites;
  }
  let e = 0;
  for (const p of [1, 2, 3] as const) e += parts[p] * (POIDS_OFFICIEL[p] / POIDS_REGISTRE[p]);
  runs.push({ prof: a.exercices[2], actuel: r.points, Eseul: Math.min(8, Math.max(0, e)), fix1: NaN, fix1E: NaN });
}

// ── Passe 2 : fix2 (item 19 en COMPOSANTES : terme NE + relation de baisse)
//   + re-pondération E sur le barème officiel des parties ──
it19.formes = [];
it19.composantes = [
  ['ne', 'النورادرينالين', 'نورادرينالين', 'norepinephrine', 'noradrenaline'],
  ['نقص', 'يقلل', 'تناقص', 'ينخفض', 'انخفاض'],
];
for (let idx = 0; idx < runs.length; idx++) {
  const n = String(idx + 1).padStart(2, '0');
  const brut = readFileSync(`eleve_${n}.txt`, 'utf-8');
  const texte = splitSections(couperBlocScore(brut))![2];
  const r = noterExerciceCalibre(texte, 1, 3);
  runs[idx].fix1 = r.points;
  const parts: Record<number, number> = { 1: 0, 2: 0, 3: 0 };
  for (const v of r.verdicts) {
    if (v.auto && v.credite) parts[PARTIE[v.id]] += v.pointsCredites;
  }
  let e = 0;
  for (const p of [1, 2, 3] as const) e += parts[p] * (POIDS_OFFICIEL[p] / POIDS_REGISTRE[p]);
  runs[idx].fix1E = Math.min(8, Math.max(0, e));
}

const mae = (f: (r: Run) => number) =>
  runs.reduce((s, r) => s + Math.abs(f(r) - r.prof), 0) / runs.length;
const biais = (f: (r: Run) => number) =>
  runs.reduce((s, r) => s + (f(r) - r.prof), 0) / runs.length;

console.log(`n=${runs.length}`);
for (const [nom, f] of [
  ['actuel  ', (r: Run) => r.actuel],
  ['E-seul  ', (r: Run) => r.Eseul],
  ['fix1    ', (r: Run) => r.fix1],
  ['fix1+E  ', (r: Run) => r.fix1E],
] as const) {
  const m = mae(f), b = biais(f);
  const gte = runs.filter((r) => f(r) !== r.actuel).length;
  console.log(`${nom}  MAE=${m.toFixed(2)}  biais=${b >= 0 ? '+' : ''}${b.toFixed(2)}  (copies modifiées: ${gte})`);
}
