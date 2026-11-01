// simuler-fix-ex3.ts — mesure les variantes de notation Ex3 sur le vrai moteur.
//
//   npx tsx scripts/simuler-fix-ex3.ts
//
// Depuis le 2026-09-27 le moteur applique E (ventilation par partie, voir
// S1_EX3_PARTIES dans attendusBac2025.ts). Ce script mesure, sur les 40 copies :
//   plat     : l'ancien modèle couverture × maxPts (avant E) ;
//   engine   : le moteur livré (= E) ;
//   +fixNE   : engine + item 19 en composantes (terme NE + relation de baisse)
//              — variante rejetée : voir docs/DIAGNOSTIC_EX3.md §3.
//
// Référence = SCORE ATTENDU de chaque copie (note officielle attendue).

import { readFileSync } from 'node:fs';
import { attendusDeGroupe } from '../src/data/dictionaries/attendusBac2025';
import { noterExerciceCalibre } from '../src/data/dictionaries/calibrationBac2025';
import { couperBlocScore, parserScoreAttendu, splitSections } from '../src/supervision/evaluerCopies';

const reg = attendusDeGroupe(1, 3);
const pp = reg.poidsPartie!;
const it19 = reg.items.find((i) => i.id === 'corr-2025-19')!;

interface Run { prof: number; plat: number; engine: number; fixNE: number }
const runs: Run[] = [];

// Passe 1 : moteur livré (= E) + reconstitution de l'ancien modèle plat.
for (let i = 1; i <= 40; i++) {
  const n = String(i).padStart(2, '0');
  const brut = readFileSync(`eleve_${n}.txt`, 'utf-8');
  const a = parserScoreAttendu(brut);
  if (!a || a.exercices[2] === null) continue;
  const texte = splitSections(couperBlocScore(brut))![2];
  const r = noterExerciceCalibre(texte, 1, 3);
  // Ancien modèle : couverture × maxPts (les points auto = 8 = maxPts).
  const plat = Math.round(r.couverture * r.maxPts * 100) / 100;
  runs.push({ prof: a.exercices[2], plat, engine: r.points, fixNE: NaN });
}

// Passe 2 : variante rejetée (item 19 en composantes) — gardée pour mémoire.
const formesAvant = [...it19.formes];
it19.formes = [];
it19.composantes = [
  ['ne', 'النورادرينالين', 'نورادرينالين', 'norepinephrine', 'noradrenaline'],
  ['نقص', 'يقلل', 'تناقص', 'ينخفض', 'انخفاض'],
];
for (let idx = 0; idx < runs.length; idx++) {
  const n = String(idx + 1).padStart(2, '0');
  const brut = readFileSync(`eleve_${n}.txt`, 'utf-8');
  const texte = splitSections(couperBlocScore(brut))![2];
  runs[idx].fixNE = noterExerciceCalibre(texte, 1, 3).points;
}
it19.formes = formesAvant; // restauration (sécurité si réutilisation)

const mae = (f: (r: Run) => number) =>
  runs.reduce((s, r) => s + Math.abs(f(r) - r.prof), 0) / runs.length;
const biais = (f: (r: Run) => number) =>
  runs.reduce((s, r) => s + (f(r) - r.prof), 0) / runs.length;

console.log(`n=${runs.length}  (maxPts=${reg.maxPts}, parties registre=${JSON.stringify(pp.registre)} officiel=${JSON.stringify(pp.officiel)})`);
for (const [nom, f] of [
  ['plat   ', (r: Run) => r.plat],
  ['engine ', (r: Run) => r.engine],
  ['+fixNE ', (r: Run) => r.fixNE],
] as const) {
  const m = mae(f), b = biais(f);
  console.log(`${nom}  MAE=${m.toFixed(2)}  biais=${b >= 0 ? '+' : ''}${b.toFixed(2)}  F5(≤1.0)=${m <= 1.0 ? 'OK' : 'ECHEC'}`);
}
