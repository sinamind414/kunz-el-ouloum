// recalibrer-copiees.ts — R4 : recalibrage de la notation calibrée sur des
// copies réelles corrigées par un HUMAIN (le fit actuel dépend du générateur
// du corpus bac2025 — voir évaluation 80 copies, 11 faux positifs N°5–13).
//
// PROTOCOLE :
//   1. Faire corriger 20–30 copies vraies par un enseignant (par exercice).
//   2. Déposer les textes (un fichier .txt par copie) sous docs/copies-bac2025/
//      et créer docs/copies-bac2025/copies-humaines.csv (séparateur « ; ») :
//        sujet;exercice;fichier;noteHumaine
//        1;1;bac2025_svt_copies/sujet_1/eleve_01.txt;3.5
//        1;2;bac2025_svt_copies/sujet_1/eleve_01.txt;5
//        …
//   3. Exécuter : npx tsx scripts/recalibrer-copiees.ts
//   4. Coller les constantes imprimées dans
//      src/data/dictionaries/calibrationBac2025.ts (CALIBRATION_BAC2025).
//   5. Vérifier : npx vitest run src/data/dictionaries/calibrationBac2025.test.ts
//      (les ancres de régression sont à mettre à jour avec les nouvelles valeurs).

import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { evaluerReponseKeywords } from '../src/correcteurV1';
import { CALIBRATION_BAC2025 } from '../src/data/dictionaries/calibrationBac2025';

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DOSSIER_COPIES = path.join(RACINE, 'docs', 'copies-bac2025');
const CHEMIN_CSV = path.join(DOSSIER_COPIES, 'copies-humaines.csv');

// Miroir du MAPPING du harnais (sujet, exercice) → (unité, points max).
const MAPPING: Record<number, { unite: number; maxPts: number }[]> = {
  1: [
    { unite: 1, maxPts: 5 },
    { unite: 6, maxPts: 7 },
    { unite: 5, maxPts: 8 },
  ],
  2: [
    { unite: 7, maxPts: 5 },
    { unite: 3, maxPts: 7 },
    { unite: 4, maxPts: 8 },
  ],
};

interface Observation {
  sujet: 1 | 2;
  exercice: 1 | 2 | 3;
  cov: number;
  note: number;
  maxPts: number;
}

function fitLineaire(x: number[], y: number[]): { a: number; b: number; n: number } {
  const n = x.length;
  if (n < 2) return { a: NaN, b: NaN, n };
  const mx = x.reduce((s, v) => s + v, 0) / n;
  const my = y.reduce((s, v) => s + v, 0) / n;
  let sxy = 0;
  let sxx = 0;
  for (let i = 0; i < n; i++) {
    sxy += (x[i]! - mx) * (y[i]! - my);
    sxx += (x[i]! - mx) ** 2;
  }
  const a = sxx === 0 ? 0 : sxy / sxx;
  return { a, b: my - a * mx, n };
}

function principal(): void {
  console.log('╔══════════════════════════════════════════════════════════════════════════╗');
  console.log('║  R4 — RECALIBRAGE DE LA NOTATION SUR COPIES CORRIGÉES PAR UN HUMAIN      ║');
  console.log('╚══════════════════════════════════════════════════════════════════════════╝');

  if (!fs.existsSync(CHEMIN_CSV)) {
    console.log(`\n✗ ${CHEMIN_CSV} introuvable.`);
    console.log('  Suivre le protocole documenté en tête de ce script (CSV :');
    console.log('  sujet;exercice;fichier;noteHumaine — 20 à 30 copies vraies).');
    console.log('\nConstantes actuellement en production (CALIBRATION_BAC2025) :');
    for (const g of CALIBRATION_BAC2025) {
      console.log(
        `  { sujet: ${g.sujet}, exercice: ${g.exercice}, uniteId: ${g.uniteId}, maxPts: ${g.maxPts}, a: ${g.a}, b: ${g.b} },`
      );
    }
    return;
  }

  const lignes = fs
    .readFileSync(CHEMIN_CSV, 'utf8')
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .filter((l) => l.trim() && !l.startsWith('#') && !/^sujet;/i.test(l));

  const obs: Observation[] = [];
  let alertes = 0;
  for (const ligne of lignes) {
    const [sujetS, exerciceS, fichier, noteS] = ligne.split(';').map((c) => c.trim());
    const sujet = Number(sujetS) as 1 | 2;
    const exercice = Number(exerciceS) as 1 | 2 | 3;
    const note = Number((noteS ?? '').replace(',', '.'));
    const m = MAPPING[sujet]?.[exercice - 1];
    if (!m || !fichier || !Number.isFinite(note)) {
      console.warn(`⚠ ligne ignorée (format) : ${ligne}`);
      alertes++;
      continue;
    }
    const chemin = path.join(DOSSIER_COPIES, fichier);
    if (!fs.existsSync(chemin)) {
      console.warn(`⚠ fichier introuvable : ${fichier}`);
      alertes++;
      continue;
    }
    // Le texte entier de la copie est utilisé : si le fichier contient les 3
    // exercices, la couverture d'unité reste un diagnostic valide (le moteur
    // cherche les mots-clés de l'unité mappée sur l'exercice annoté).
    const texte = fs.readFileSync(chemin, 'utf8');
    const cov = evaluerReponseKeywords(texte, m.unite).couverture;
    obs.push({ sujet, exercice, cov, note, maxPts: m.maxPts });
  }

  if (obs.length === 0) {
    console.error('Aucune observation exploitable — abandon.');
    process.exitCode = 1;
    return;
  }

  console.log(`\nObservations chargées : ${obs.length} (alertes : ${alertes})`);
  console.log('\n► Constantes recalibrées — à coller dans CALIBRATION_BAC2025 :');
  for (const sujet of [1, 2] as const) {
    for (const exercice of [1, 2, 3] as const) {
      const g = obs.filter((o) => o.sujet === sujet && o.exercice === exercice);
      const courant = CALIBRATION_BAC2025.find(
        (c) => c.sujet === sujet && c.exercice === exercice
      )!;
      if (g.length < 5) {
        console.log(
          `  // S${sujet}-Ex${exercice} : ${g.length} observation(s) — INSUFFISANT (<5),` +
            ` conserver a: ${courant.a}, b: ${courant.b}`
        );
        continue;
      }
      const f = fitLineaire(
        g.map((o) => o.cov),
        g.map((o) => o.note)
      );
      console.log(
        `  { sujet: ${sujet}, exercice: ${exercice}, uniteId: ${courant.uniteId}, ` +
          `maxPts: ${courant.maxPts}, a: ${f.a.toFixed(6)}, b: ${f.b.toFixed(6)} }, // n=${f.n}`
      );
    }
  }
  console.log(
    '\n► Puis : mettre à jour les ancres de régression du test' +
      ' calibrationBac2025.test.ts et relancer la suite vitest.'
  );
}

principal();
