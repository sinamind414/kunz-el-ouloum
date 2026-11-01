// scan_okacha_filigrane.ts — inventaire des fragments de filigrane de scan
// encore présents dans le corpus AFFICHÉ (unités + 9 sections méthodo), avec
// le texte INTÉGRAL de chaque bloc et le ligne source brute correspondante.
//
// Le filigrane du scan (« إجابة الطالب المتفوق في علوم الطبيعة والحياة ») est
// tronqué par l'OCR en 25+ graphies et mélangé au contenu réel : on ne peut ni
// masquer le bloc entier (perte de sens), ni le laisser tel quel.
// Ce scan fourit la matière des clés de retrait (famille B) de FIXES.
//
// Lecture seule. Usage : npx tsx scripts/scan_okacha_filigrane.ts
import {
  OKACHA_UNITES_ENRICHIES,
  OKACHA_METHODO_SECTIONS,
} from '../src/data/okachaEnriched';
import { OKACHA_UNITES, OKACHA_METHODO, OKACHA_CONSEILS } from '../src/data/okacha';

/** Détecteur large : toutes les graphies observées du filigrane du scan. */
export const RE_FILIGRANE_SCAN = new RegExp(
  [
    'كاشة',
    'ءكاشة',
    'ءكاخة',
    'عكامة',
    'مكاشه',
    'ثكاشة',
    'روءكاءة',
    'لطالس',
    'الدلالب',
    'للمطالب',
    'للط[١ا]ب',
    'لنطانس',
    'للانس',
    'لطالب',
    'امنفوش',
    'المنهوق',
    'المنفوق',
    'المنفوف',
    'المنفوث',
    'المنهوك',
    'المنهوف',
    'المتفوك',
    'المتفوف',
    'المثفوك',
    'المذفوف',
    'المهنوق',
    'اشة الطالب',
    'المطسعة',
    'الطمبعة',
    'المطبمة',
    'الطبعة والحب',
    'الطببعة',
    'عاوم العل',
    'العاوم',
  ].join('|'),
  'u',
);

/** Toutes les lignes brutes du corpus (source d'ENRICH_FIXES). */
export const lignesBrutes: string[] = [
  ...OKACHA_UNITES.flatMap((u) => u.lignes),
  ...OKACHA_METHODO.lignes,
  ...OKACHA_CONSEILS.lignes,
];

interface Cible {
  ou: string;
  texte: string;
}

const cibles: Cible[] = [];
for (const u of OKACHA_UNITES_ENRICHIES) {
  u.blocs.forEach((b, i) => {
    if (RE_FILIGRANE_SCAN.test(b.texte)) cibles.push({ ou: `${u.id} #${i} [${b.kind}]`, texte: b.texte });
  });
}
for (const s of OKACHA_METHODO_SECTIONS) {
  s.blocs.forEach((b, i) => {
    if (RE_FILIGRANE_SCAN.test(b.texte)) cibles.push({ ou: `méth:${s.id} #${i} [${b.kind}]`, texte: b.texte });
  });
}

if (process.argv.includes('--print')) {
  console.log(`blocs touchés : ${cibles.length}\n`);
  for (const c of cibles) console.log(`[${c.ou}] ${c.texte}\n`);
}

// ── Vérification : chaque fragment de retrait existe-t-il dans la SOURCE ? ──
// (une clé FIXES absente de okacha.ts est « morte » — bug silencieux.)
export function verifierCle(fragment: string): { brut: number; affiche: number } {
  return {
    brut: lignesBrutes.filter((l) => l.includes(fragment)).length,
    affiche: cibles.filter((c) => c.texte.includes(fragment)).length,
  };
}

if (process.argv.includes('--cle')) {
  const frag = process.argv[process.argv.indexOf('--cle') + 1] ?? '';
  const v = verifierCle(frag);
  console.log(`fragment ${JSON.stringify(frag)} : brut=${v.brut} affiché=${v.affiche}`);
}

console.log(`blocs touchés par le filigrane de scan : ${cibles.length}`);
for (const c of cibles) console.log(`  · ${c.ou}`);
