// audit_lexique.ts — audit orthographe/terminologie du بنك الحفظ affiché contre
// les livres de référence (الكتاب_المصحح_v1.0.md + المكتبة_الكاملة_SVT.md).
//
// Méthode :
//   1. normaliser le TEXTE ENTIER d'abord (chadda/diacritiques/tatweel/hamza/ة/ى),
//      PUIS tokenizer — sinon le chadda coupe le mot en deux et tout devient OOV ;
//   2. indexer chaque forme de référence ET ses préfixes (longueur ≥ 3), pour ne
//      pas signaler « المتعلق » quand le livre n'écrit que « المتعلقة » ;
//   3. accepter aussi un mot plus long qu'une forme connue (racine en tête) ;
//   4. tout mot affiché restant hors lexique = candidat OCR à réparer.
//
// Lecture seule. Usage : UNITE=d1u4 npx tsx scripts/audit_lexique.ts [seuil] [souple]
// (le filtre d'unité passe par une variable d'environnement : PowerShell avale les
//  arguments vides, ce qui faisait basculer « '' » en filtre d'unité inexistant.)
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { OKACHA_UNITES_ENRICHIES } from '../src/data/okachaEnriched';

/** Normalisation commune aux DEUX côtés (même esprit que normAr du verrou). */
const norm = (s: string): string =>
  s
    .normalize('NFKC')
    .replace(/[\u064B-\u065F\u0670\u0640]/g, '')
    .replace(/[إأآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه');

const reToken = /[\u0621-\u064A]{3,}/g;
const MIN = 3;

const refs = [
  'الكتاب_المصحح_v1.0.md',
  'المكتبة_الكاملة_SVT.md',
];

const formesRef = new Set<string>();
const prefRef = new Set<string>();
const indexe = (mot: string) => {
  formesRef.add(mot);
  for (let i = MIN; i <= mot.length; i++) prefRef.add(mot.slice(0, i));
};
for (const f of refs) {
  const brut = readFileSync(resolve(process.cwd(), f), 'utf-8');
  for (const m of norm(brut).matchAll(reToken)) indexe(m[0]);
}
// Mots-outils du programme (jamais signalés).
for (const w of ['من', 'في', 'الى', 'على', 'عن', 'مع', 'ما', 'لا', 'هل', 'هذا', 'هذه', 'ذلك', 'التي', 'الذي', 'الذين', 'بعد', 'قبل', 'غير', 'كل', 'بين', 'عند', 'حتى', 'اذا', 'ان']) {
  indexe(norm(w));
}

/** Mot connu = préfixe d'une forme de référence (strict), éventuellement doublé
 *  du contrôle « racine connue en tête » (souple : tolère un pluriel/une
 *  flexion absente des livres, mais laisse passer plus de mots abîmés). */
const connuStrict = (mot: string): boolean => prefRef.has(mot);
const connuSouple = (mot: string): boolean => {
  if (connuStrict(mot)) return true;
  for (let i = mot.length; i >= MIN; i--) if (formesRef.has(mot.slice(0, i))) return true;
  return false;
};

const [seuilBrut, mode] = process.argv.slice(2);
const filtre = process.env.UNITE || '';
const connu = mode === 'souple' ? connuSouple : connuStrict;
const seuil = Number(seuilBrut ?? 2);
const candidats = new Map<string, { n: number; ex: string; unite: string }>();

for (const u of OKACHA_UNITES_ENRICHIES) {
  if (filtre && u.id !== filtre) continue;
  for (const b of u.blocs) {
    for (const m of norm(b.texte).matchAll(reToken)) {
      const brut = m[0];
      if (connu(brut)) continue;
      const e = candidats.get(brut) ?? { n: 0, ex: brut, unite: u.id };
      e.n++;
      e.ex = b.texte;
      candidats.set(brut, e);
    }
  }
}

const rangs = [...candidats.entries()].sort((a, b) => b[1].n - a[1].n || b[0].length - a[0].length);
console.log('Lexique de référence :', formesRef.size, 'formes /', prefRef.size, 'préfixes');
console.log('Mots affichés hors lexique :', rangs.length);
console.log(`\n--- fréquence >= ${seuil} ---`);
for (const [mot, v] of rangs.filter(([, v]) => v.n >= seuil)) {
  console.log(`\n[${v.n}x|${v.unite}] ${mot}`);
  console.log(`   ctx: ${v.ex.slice(0, 200)}`);
}
