// sonder-surnote.ts — F3/F2 : quels items le moteur crédite-t-il quand le prof
// est plus sévère ? Cible les sur-notes structurelles (Ex1/Ex3, copies moyennes).
//
//   npx tsx scripts/sonder-surnote.ts

import { readFileSync } from 'node:fs';
import {
  splitSections,
  parserScoreAttendu,
  couperBlocScore,
} from '../src/supervision/evaluerCopies';
import { noterExerciceCalibre } from '../src/data/dictionaries/calibrationBac2025';

const CIBLES = [3, 11, 13, 19, 24, 28, 1, 6, 14];
for (const num of CIBLES) {
  const brut = readFileSync(`eleve_${String(num).padStart(2, '0')}.txt`, 'utf-8');
  const a = parserScoreAttendu(brut);
  const sections = splitSections(couperBlocScore(brut));
  if (!sections || !a) continue;
  console.log(`\n=== eleve_${String(num).padStart(2, '0')} — prof total ${a.total}/20`);
  for (const ex of [1, 2, 3] as const) {
    const prof = a.exercices[ex - 1];
    const r = noterExerciceCalibre(sections[ex - 1], 1, ex);
    const credited = r.verdicts
      .filter((v) => v.pointsCredites > 0)
      .map((v) => `${v.id.split('-').pop()}(${v.pointsCredites})`)
      .join(' ');
    const d = (r.points - (prof ?? 0)).toFixed(2);
    console.log(
      `  Ex${ex}: moteur ${r.points.toFixed(2)} | prof ${prof} | écart ${Number(d) >= 0 ? '+' : ''}${d}` +
        (Math.abs(r.points - (prof ?? 0)) > 0.75 ? '  ← SUR-NOTE' : ''),
    );
    if (Math.abs(r.points - (prof ?? 0)) > 0.75) console.log(`    crédités: ${credited}`);
  }
}
