// poids-entree.mjs — rendre VISIBLE le poids du premier affichage (M7, 2026-10-14).
//
// Pourquoi ce script existe
// -------------------------
// `src/build/bundleBudget.test.ts` fixe un plafond de 700 Ko pour l'entrée, mais
// il est exclu de la suite unitaire (`vite.config.ts`, dossier `src/build/**`) et
// `npm run test:build` n'est appelé par AUCUN job de la CI. Résultat mesuré le
// 14/10/2026 : l'entrée pèse 938 Ko, soit +34 % au-dessus du plafond, et personne
// ne le voit — le garde-fou ne garde rien.
//
// Ce script ne tranche PAS à la place du mainteneur : il ne fait pas échouer la
// CI. Relever un plafond et rendre un test vert serait maquiller le problème ;
// bloquer la CI sur un plafond déjà dépassé empêcherait toute fusion. Il mesure
// donc, il publie le chiffre (résumé du job GitHub), et il laisse la décision
// M7 ouverte : ramener l'entrée sous 700 Ko, ou relever le plafond à la réalité.
// Un chiffre affiché à chaque exécution vaut mieux qu'un test vert qui ment.
//
// Usage : node scripts/poids-entree.mjs   (après `npm run build`)

import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { gzipSync } from 'node:zlib';

const DIST = resolve(process.cwd(), 'dist');
const CIBLE_KO = 700; // plafond de bundleBudget.test.ts — non atteint aujourd'hui
const ko = (octets) => Math.round(octets / 1024);

function poids(chemin) {
  const buf = readFileSync(chemin);
  return { brut: buf.length, gzip: gzipSync(buf, { level: 9 }).length };
}

if (!existsSync(resolve(DIST, 'index.html'))) {
  console.error('✗ dist/index.html absent — lancez `npm run build` avant ce script.');
  process.exit(1);
}

const html = readFileSync(resolve(DIST, 'index.html'), 'utf8');
const entree = html.match(/<script type="module"[^>]*src="([^"]+)"/)?.[1];
const preloads = [...html.matchAll(/<link rel="modulepreload"[^>]*href="([^"]+)"/g)].map((m) => m[1]);
const styles = [...html.matchAll(/<link rel="stylesheet"[^>]*href="([^"]+)"/g)].map((m) => m[1]);

if (!entree) {
  console.error('✗ aucun script d’entrée trouvé dans dist/index.html.');
  process.exit(1);
}

/** Les URL de index.html sont absolues (`/assets/…`) : on les ramène dans dist/. */
const dansDist = (url) => resolve(DIST, url.replace(/^\//, ''));

const lignes = [['index.html', poids(resolve(DIST, 'index.html'))], ['ENTRÉE ' + entree, poids(dansDist(entree))]];
for (const p of preloads) lignes.push(['vendor ' + p.split('/').pop(), poids(dansDist(p))]);
for (const c of styles) lignes.push(['CSS ' + c.split('/').pop(), poids(dansDist(c))]);

const totBrut = lignes.reduce((s, [, v]) => s + v.brut, 0);
const totGzip = lignes.reduce((s, [, v]) => s + v.gzip, 0);
const entreeKo = ko(lignes[1][1].brut);
const ecart = Math.round((100 * entreeKo) / CIBLE_KO - 100);

const rapport = [
  '### Poids du premier affichage (chemin critique)',
  '',
  '| Ressource | Brut | gzip |',
  '|---|---:|---:|',
  ...lignes.map(([n, v]) => `| \`${n}\` | ${ko(v.brut)} Ko | ${ko(v.gzip)} Ko |`),
  `| **TOTAL** | **${ko(totBrut)} Ko** | **${ko(totGzip)} Ko** |`,
  '',
  `Entrée : **${entreeKo} Ko** pour une cible de **${CIBLE_KO} Ko** (${ecart > 0 ? '+' : ''}${ecart} %).`,
  '',
  '> Mesure indicative, non bloquante (décision M7 ouverte : réduire ou relever la cible).',
  '> Repères 3G : ~40–60 Ko/s utiles ⇒ le total gzip ci-dessus est le coût incompressible avant interaction.',
].join('\n');

console.log(rapport);
if (process.env.GITHUB_STEP_SUMMARY) {
  const { appendFileSync } = await import('node:fs');
  appendFileSync(process.env.GITHUB_STEP_SUMMARY, rapport + '\n');
}
