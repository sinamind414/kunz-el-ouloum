// diagnostiquer-ex3.ts — Creuser le MAE Ex3 (1.30) du rapport SUPERVISION_ACTUEL.
//
//   npx tsx scripts/diagnostiquer-ex3.ts
//
// Pour chacune des 40 copies : note moteur Ex3 vs SCORE ATTENDU, puis détail
// item par item (crédité / non crédité) pour identifier les items responsables
// de l'écart. Aucune décision de notation ici — diagnostic seul.

import { readFileSync, writeFileSync } from 'node:fs';
import { noterExerciceCalibre } from '../src/data/dictionaries/calibrationBac2025';
import { couperBlocScore, parserScoreAttendu, splitSections } from '../src/supervision/evaluerCopies';

interface Ligne {
  n: string;
  moteur: number;
  attendu: number | null;
  ecart: number | null;
  couverture: number;
  credites: number;
  totalAuto: number;
  itemsManquants: string[];
  plafonds: string[];
  sanctions: string[];
}

const lignes: Ligne[] = [];
const compteurItems: Record<string, { points: number; credits: number; manques: number; pointsManques: number }> = {};

for (let i = 1; i <= 40; i++) {
  const n = String(i).padStart(2, '0');
  const brut = readFileSync(`eleve_${n}.txt`, 'utf-8');
  const attendu = parserScoreAttendu(brut);
  const attenduEx3 = attendu?.exercices[2] ?? null;
  const copie = couperBlocScore(brut);
  const sections = splitSections(copie);
  const ex3 = sections ? sections[2] : copie;

  const r = noterExerciceCalibre(ex3, 1, 3);
  const manquants = r.verdicts
    .filter((v) => v.auto && !v.credite)
    .map((v) => `${v.id}(${v.points})`);
  const credits = r.verdicts.filter((v) => v.auto && v.credite).length;

  for (const v of r.verdicts) {
    if (!v.auto) continue;
    const c = (compteurItems[v.id] ??= { points: v.points, credits: 0, manques: 0, pointsManques: 0 });
    if (v.credite) c.credits++;
    else { c.manques++; c.pointsManques += v.points; }
  }

  lignes.push({
    n,
    moteur: r.points,
    attendu: attenduEx3,
    ecart: attenduEx3 === null ? null : Math.round((r.points - attenduEx3) * 100) / 100,
    couverture: r.couverture,
    credites: credits,
    totalAuto: r.pointsAttendusAuto,
    itemsManquants: manquants,
    plafonds: r.plafonds.map((p) => String(p.type)),
    sanctions: r.sanctionsForte.map((s) => s.id),
  });
}

// ── Synthèse ──────────────────────────────────────────────────────────────────
const avec = lignes.filter((l) => l.ecart !== null);
const mae = avec.reduce((s, l) => s + Math.abs(l.ecart!), 0) / avec.length;
const biais = avec.reduce((s, l) => s + l.ecart!, 0) / avec.length;
const surNote = avec.filter((l) => l.ecart! > 0.01).length;
const sousNote = avec.filter((l) => l.ecart! < -0.01).length;

let out = `# Diagnostic Ex3 — ${new Date().toISOString().slice(0, 10)}\n\n`;
out += `n=${avec.length} · MAE=${mae.toFixed(2)} · biais=${biais.toFixed(2)} · surnoté=${surNote} · sous-noté=${sousNote}\n\n`;

out += `## Par copie (moteur vs attendu)\n\n| copie | moteur | attendu | écart | couv | items crédités | plafonds | manquants (pts) |\n|---|---|---|---|---|---|---|---|\n`;
for (const l of lignes) {
  out += `| ${l.n} | ${l.moteur} | ${l.attendu ?? '—'} | ${l.ecart ?? '—'} | ${l.couverture} | ${l.credites} | ${l.plafonds.join(',') || '—'} | ${l.itemsManquants.join(', ') || '—'} |\n`;
}

out += `\n## Items les plus manqués (fréquence)\n\n| item | pts | crédités | manqués | pts perdus (cumul) |\n|---|---|---|---|---|\n`;
const tries = Object.entries(compteurItems).sort((a, b) => b[1].manques - a[1].manques || b[1].pointsManques - a[1].pointsManques);
for (const [id, c] of tries) {
  out += `| ${id} | ${c.points} | ${c.credits}/40 | ${c.manques}/40 | ${c.pointsManques.toFixed(1)} |\n`;
}

writeFileSync('docs/DIAGNOSTIC_EX3.md', out, 'utf-8');
console.log(out);
