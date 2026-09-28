// diagnostiquer-items-manques.ts — F3 : où le moteur perd-il les points des
// copies fortes ?
//
// Méthode : pour les copies dont la note prof est élevée (le prof a crédité),
// on liste les items que le moteur crédite à 0. Un item systématiquement
// manqué sur les copies fortes = formes reconnues trop étroites (levier F3),
// pas une réponse faible.
//
//   npx tsx scripts/diagnostiquer-items-manques.ts [--dir "."] [--top 15]

import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import {
  splitSections,
  parserScoreAttendu,
  couperBlocScore,
} from '../src/supervision/evaluerCopies';
import { noterExerciceCalibre } from '../src/data/dictionaries/calibrationBac2025';
import { attendusDeGroupe } from '../src/data/dictionaries/attendusBac2025';

const dir = process.argv[process.argv.indexOf('--dir') + 1] ?? '.';
const SEUIL_FORT = Number(process.argv[process.argv.indexOf('--top') + 1] ?? 15);

const fichiers = readdirSync(dir)
  .filter((f) => /^eleve[_-]?\d+.*\.txt$/i.test(f))
  .map((f) => {
    const brut = readFileSync(join(dir, f), 'utf-8');
    return {
      f,
      numero: parseInt((f.match(/(\d+)/) ?? ['0'])[1], 10),
      attendu: parserScoreAttendu(brut),
      texte: couperBlocScore(brut),
    };
  })
  .filter((c) => c.attendu?.total !== null && c.attendu?.total !== undefined)
  .sort((a, b) => (b.attendu!.total! - a.attendu!.total!));

const forts = fichiers.filter((c) => c.attendu!.total! >= SEUIL_FORT);
console.log(`\n=== ITEMS MANQUÉS SUR LES COPIES FORTES (prof ≥ ${SEUIL_FORT}/20) ===`);
console.log(`${fichiers.length} copies notées · ${forts.length} copies fortes\n`);

for (const exercice of [1, 2, 3] as const) {
  const reg = attendusDeGroupe(1, exercice);
  const manques = new Map<string, { freq: number; points: number; texte: string }>();
  for (const c of forts) {
    const sections = splitSections(c.texte);
    if (!sections) continue;
    const n = noterExerciceCalibre(sections[exercice - 1], 1, exercice);
    for (const v of n.verdicts) {
      if (v.pointsCredites === 0 && v.auto) {
        const cur = manques.get(v.id) ?? { freq: 0, points: v.points, texte: v.texteAr };
        cur.freq += 1;
        manques.set(v.id, cur);
      }
    }
  }
  const lignes = [...manques.entries()]
    .map(([id, v]) => ({ id, ...v, perte: v.freq * v.points }))
    .sort((a, b) => b.perte - a.perte);
  console.log(`--- Ex${exercice} (${reg.maxPts} pts) — ${forts.length} copies fortes`);
  if (lignes.length === 0) {
    console.log('  (aucun item auto manqué)');
  } else {
    for (const l of lignes) {
      console.log(
        `  ${l.id.split('/').pop()} ${String(l.perte).padStart(5)} pts perdus (${l.freq}/${forts.length} copies, ${l.points} pt) — ${l.texte.slice(0, 60)}`,
      );
    }
  }
  console.log();
}
