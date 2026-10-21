// buildBudgets.mjs — M1 (audit 8 axes 20/10/2026) : BUDGETS DE BUNDLE.
//
// L'audit M1 demandait « CI + budgets bundle ». Ce script vérifie après le
// build que les morceaux critiques du dist restent sous des plafonds — pour
// figer le prix d'une régression (ajout d'une dépendance lourde, import qui
// casse le cache-stable, etc.) avant qu'elle n'atteigne les élèves.
//
// RÈGLES :
//   · budgets exprimés en BRUT et en GZIP (zlib niveau par défaut — la même
//     mesure partout) ; gzip = ce que l'élève télécharge réellement ;
//   · plafonds = valeur mesurée du jour + marge ~10-20 %, PAS un rêve.
//     Mesures du 21/10/2026 : entry 606,0 Ko brut / 136,3 Ko gzip → 700/160 ;
//     vendor-react 387,8 / 116,2 → 450/135 ; CSS 242,3 / 31,5 → 300/40 ;
//     total dist/assets 5,85 Mo brut / 1,31 Mo gzip → 6,5 / 1,6 ;
//   · dépassement = code de sortie 1 — la CI échoue, le commit ne passe pas
//     silencieusement.
//
// Appelé dans .github/workflows/ci.yml (job build-et-postbuild) ; en local :
// `node scripts/buildBudgets.mjs` après `npm run build`.

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import process from 'node:process';

const DIST = 'dist/assets';

/** [motif de nom, plafond brut, plafond gzip, libellé] — la FAMILLE entière. */
const BUDGETS = [
  [/^index-.*\.js$/, 700 * 1024, 160 * 1024, 'entry principal (index-*.js)'],
  [/^vendor-react-.*\.js$/, 450 * 1024, 135 * 1024, 'vendor react (vendor-react-*.js)'],
  [/^index-.*\.css$/, 300 * 1024, 40 * 1024, 'css principal (index-*.css)'],
];

const TOTAL_BRUT = 6.5 * 1024 * 1024; // Σ dist/assets (JS+CSS+images)
const TOTAL_GZIP = 1.6 * 1024 * 1024;

if (!existsSync(DIST)) {
  console.error('[budgets] dist/assets introuvable — lance `npm run build` d\'abord.');
  process.exit(1);
}

// FICHIERS SEULEMENT : dist/assets contient aussi des sous-dossiers
// (images/, svt/ — mesuré 21/10 : EISDIR sinon).
const fichiers = readdirSync(DIST)
  .map((nom) => `${DIST}/${nom}`)
  .filter((p) => statSync(p).isFile())
  .map((p) => ({ nom: p, taille: statSync(p).size, gzip: gzipSync(readFileSync(p)).length }));

let echec = false;

function rapporter(libelle, nomF, taille, plafond, estGzip) {
  const val = (taille / 1024).toFixed(1);
  const plafondKo = Math.round(plafond / 1024);
  const suffixe = estGzip ? ' (gzip)' : '';
  if (taille > plafond) {
    console.error(`[budgets] ÉCHEC — ${libelle} (${nomF}) : ${val} Ko > ${plafondKo} Ko${suffixe}`);
    echec = true;
  } else {
    console.log(`[budgets] OK — ${libelle} (${nomF}) : ${val} Ko ≤ ${plafondKo} Ko${suffixe}`);
  }
}

for (const [motif, plafondBrut, plafondGzip, libelle] of BUDGETS) {
  // H4d (21/10) : un même motif peut matcher PLUSIEURS fichiers (vite nomme
  // aussi des lazy chunks « index-*.js » — sorti du build 22 s : un 2e index
  // de 5 Ko doublait l'entry de 606 Ko et le 1er match attrapait le petit).
  // Un BUDGET porte sur la famille entière : chaque match doit tenir sous
  // le plafond, sinon c'est un faux vert.
  const matches = fichiers.filter((x) => motif.test(x.nom.split('/').pop() ?? ''));
  if (!matches.length) {
    console.error(`[budgets] ÉCHEC — aucun fichier pour « ${libelle} » (le découpage a changé ?)`);
    echec = true;
    continue;
  }
  for (const f of matches) {
    rapporter(libelle, f.nom.split('/').pop(), f.taille, plafondBrut, false);
    rapporter(libelle + ' [gzip]', f.nom.split('/').pop(), f.gzip, plafondGzip, true);
  }
}

const total = fichiers.reduce((s, x) => s + x.taille, 0);
const totalGzip = fichiers.reduce((s, x) => s + x.gzip, 0);
rapporter('total dist/assets', '', total, TOTAL_BRUT, false);
rapporter('total dist/assets [gzip]', '', totalGzip, TOTAL_GZIP, true);

process.exit(echec ? 1 : 0);
