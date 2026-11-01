// sonder-ex2.ts — compare note moteur vs note prof sur S1-Ex2 + items manqués.
// Preuve F3 : quantify the gap per item before/after any forme change.
//
//   npx tsx scripts/sonder-ex2.ts

import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  splitSections,
  parserScoreAttendu,
  couperBlocScore,
} from '../src/supervision/evaluerCopies';
import { noterExerciceCalibre } from '../src/data/dictionaries/calibrationBac2025';

const dir = '.';
const fichiers = readdirSync(dir)
  .filter((f) => /^eleve[_-]?\d+.*\.txt$/i.test(f))
  .map((f) => Number((f.match(/(\d+)/) ?? ['0'])[1]))
  .sort((a, b) => a - b);

let sommeEcart = 0;
let n = 0;
const manques = new Map<string, number>();
for (const num of fichiers) {
  const brut = readFileSync(join(dir, `eleve_${String(num).padStart(2, '0')}.txt`), 'utf-8');
  const attendu = parserScoreAttendu(brut);
  const sections = splitSections(couperBlocScore(brut));
  const prof = attendu?.exercices?.[1];
  if (!sections || prof === null || prof === undefined) continue;
  const r = noterExerciceCalibre(sections[1], 1, 2);
  sommeEcart += Math.abs(r.points - prof);
  n += 1;
  for (const v of r.verdicts) {
    if (v.auto && v.pointsCredites === 0) manques.set(v.id, (manques.get(v.id) ?? 0) + 1);
  }
  if (num >= 23) {
    const ids = r.verdicts
      .filter((v) => v.auto && v.pointsCredites === 0)
      .map((v) => v.id.split('-').pop())
      .join(',');
    console.log(
      `eleve_${String(num).padStart(2, '0')}: moteur ${r.points.toFixed(2)}/7 | prof ${prof}/7 | manques: ${ids || '-'}`,
    );
  }
}
console.log(`\nMAE Ex2 (40 copies) = ${(sommeEcart / n).toFixed(2)}  (n=${n})`);
console.log(
  '\nFréquence de manque par item (auto): ' +
    [...manques.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([id, f]) => `${id.split('-').pop()}:${f}/${n}`)
      .join('  '),
);
