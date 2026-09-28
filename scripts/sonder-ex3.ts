// sonder-ex3.ts — compare note moteur vs note prof sur S1-Ex3 (modèle par partie).
//   npx tsx scripts/sonder-ex3.ts

import { readdirSync, readFileSync } from 'node:fs';
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
let sommeAbs = 0;
let n = 0;
const manques = new Map<string, number>();
for (const num of fichiers) {
  const brut = readFileSync(join2(dir, num), 'utf-8');
  const a = parserScoreAttendu(brut);
  const sections = splitSections(couperBlocScore(brut));
  const prof = a?.exercices[2];
  if (!sections || prof === null || prof === undefined) continue;
  const r = noterExerciceCalibre(sections[2], 1, 3);
  sommeEcart += r.points - prof;
  sommeAbs += Math.abs(r.points - prof);
  n += 1;
  for (const v of r.verdicts) {
    if (v.auto && v.pointsCredites === 0) manques.set(v.id, (manques.get(v.id) ?? 0) + 1);
  }
  if (num >= 23 || num <= 6) {
    const ids = r.verdicts
      .filter((v) => v.auto && v.pointsCredites === 0)
      .map((v) => v.id.split('-').pop())
      .join(',');
    const d = r.points - prof;
    console.log(
      `eleve_${String(num).padStart(2, '0')}: moteur ${r.points.toFixed(2)}/8 | prof ${prof}/8 | écart ${d >= 0 ? '+' : ''}${d.toFixed(2)} | réserve manuelle ${r.pointsManuelsAArbitrer} | manques: ${ids || '-'}`,
    );
  }
}
console.log(`\nMAE Ex3 = ${(sommeAbs / n).toFixed(2)} · biais = ${(sommeEcart / n).toFixed(2)} (n=${n})`);
console.log(
  'manques auto: ' +
    [...manques.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([id, f]) => `${id.split('-').pop()}:${f}/${n}`)
      .join('  '),
);

function join2(_d: string, num: number): string {
  return `${_d}/eleve_${String(num).padStart(2, '0')}.txt`;
}
