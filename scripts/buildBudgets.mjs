// buildBudgets.mjs — M1 (audit 8 axes 20/10/2026) : BUDGETS DE BUNDLE.
//
// L'audit M1 demandait « CI + budgets bundle ». Ce script vérifie après le
// build que les morceaux critiques du dist restent sous des plafonds — pour
// figer le prix d'une régression (ajout d'une dépendance lourde, import qui
// casse le cache-stable, etc.) avant qu'elle n'atteigne les élèves.
//
// RÈGLES :
//   · budgets exprimés en octets BRUTS mesurés sur dist/assets (pas gzip —
//     mesurable identique partout) ;
//   · plafonds = valeur mesurée du jour + marge ~10-15 %, PAS un rêve :
//     index 606,0 → 700 Ko · vendor-react 387,8 → 450 Ko · CSS 242,0 → 300 Ko
//     · total dist/assets 5,84 → 6,5 Mo (20/10/2026, build 33,23 s) ;
//   · dépassement = code de sortie 1 — la CI échoue, le commit ne passe pas
//     silencieusement.
//
// Appelé dans .github/workflows/ci.yml (job build-et-postbuild) ; en local :
// `node scripts/buildBudgets.mjs` après `npm run build`.

import { existsSync, readdirSync, statSync } from 'node:fs';
import process from 'node:process';

const DIST = 'dist/assets';

/** [motif de nom, plafond en octets, libellé] — le premier match gagne. */
const BUDGETS = [
  [/^index-.*\.js$/, 700 * 1024, 'entry principal (index-*.js)'],
  [/^vendor-react-.*\.js$/, 450 * 1024, 'vendor react (vendor-react-*.js)'],
  [/^index-.*\.css$/, 300 * 1024, 'css principal (index-*.css)'],
];

const TOTAL_BUDGET = 6.5 * 1024 * 1024; // Σ dist/assets (JS+CSS+images inline)

if (!existsSync(DIST)) {
  console.error('[budgets] dist/assets introuvable — lance `npm run build` d\'abord.');
  process.exit(1);
}

const fichiers = readdirSync(DIST).map((nom) => ({
  nom,
  taille: statSync(`${DIST}/${nom}`).size,
}));

let echec = false;

for (const [motif, plafond, libelle] of BUDGETS) {
  // H4d (21/10) : un même motif peut matcher PLUSIEURS fichiers (vite nomme
  // aussi des lazy chunks « index-*.js » — sorti du build 22 s : un 2e index
  // de 5 Ko doublait l'entry de 606 Ko et le 1er match attrapait le petit).
  // Un BUDGET porte sur la famille entière : chaque match doit tenir sous
  // le plafond, sinon c'est un faux vert.
  const matches = fichiers.filter((x) => motif.test(x.nom));
  if (!matches.length) {
    console.error(`[budgets] ÉCHEC — aucun fichier pour « ${libelle} » (le découpage a changé ?)`);
    echec = true;
    continue;
  }
  const plafondKo = Math.round(plafond / 1024);
  for (const f of matches) {
    const ko = (f.taille / 1024).toFixed(1);
    if (f.taille > plafond) {
      console.error(`[budgets] ÉCHEC — ${libelle} (${f.nom}) : ${ko} Ko > plafond ${plafondKo} Ko`);
      echec = true;
    } else {
      console.log(`[budgets] OK — ${libelle} (${f.nom}) : ${ko} Ko ≤ ${plafondKo} Ko`);
    }
  }
}

const total = fichiers.reduce((s, x) => s + x.taille, 0);
const totalMo = (total / (1024 * 1024)).toFixed(2);
if (total > TOTAL_BUDGET) {
  console.error(`[budgets] ÉCHEC — total dist/assets : ${totalMo} Mo > plafond 6.5 Mo`);
  echec = true;
} else {
  console.log(`[budgets] OK — total dist/assets : ${totalMo} Mo ≤ 6.5 Mo`);
}

process.exit(echec ? 1 : 0);
