/*
 * build_cartes_hosila.ts — génère les VRAIES cartes de rappel (Vague 2, action 9
 * de l'audit externe 2026-10-17) depuis le TEXTE OFFICIEL du livre scolaire.
 *
 * Source   : src/data/hosila.ts (généré lui-même depuis hosila_officielle_3as.txt).
 * Emballage: carte « إكمال » (cloze) — le recto est la PHRASE OFFICIELLE avec le
 *            terme clé masqué ; le verso est la phrase complète + la source.
 *            RIEN n'est inventé : toute chaîne des cartes se retrouve verbatim
 *            dans hosila (verrou : src/data/cartesHosila.lock.test.ts).
 * Choix du terme masqué : les termes entre « » du corpus QCM de la MÊME unité
 *            (vocabulaire déjà aligné programme) — le plus long apparaissant
 *            EXACTEMENT UNE FOIS dans la phrase (cloze non ambigu).
 * Tranche  : UNITES_CIBLES ci-dessous — U1-U3 aujourd'hui ; étendre la liste
 *            puis relancer (npx tsx) pour ajouter les unités suivantes.
 *
 * NE PAS ÉDITER src/data/cartesHosila.ts À LA MAIN — relancer ce script.
 */
import { writeFileSync } from 'node:fs';
import { HOSILA_IDS, HOSILA_OFFICIELLES } from '../src/data/hosila';
import { SVT_QUIZ_QUESTIONS } from '../src/quizCorpus';
import { INITIAL_UNITS } from '../src/unitCatalog';

const UNITES_CIBLES = ['d1u1', 'd1u2', 'd1u3'];

/** Masque affiché dans le recto des cartes (constante partagée avec le verrou). */
export const CARTE_MASQUE = '……';
const PREFIXE_ID = 'fc_h_';

function normalise(s: string): string {
  return s.replace(/\s+/g, ' ').trim();
}

// 1) Alignement UNITÉ hosila ↔ unité catalogue. Les titres du catalogue sont
//    parfois plus longs (« دور البروتينات في الاتصال العصبي » vs « الاتصال
//    العصبي ») : on accepte l'égalité OU l'inclusion univoque (un seul candidat
//    catalogue contient le titre hosila, et inversement). Les 11 unités sont
//    vérifiées, avec exception affichée si un titre hosila est ambigu.
const idVersUnitId = new Map<string, number>();
for (let i = 0; i < HOSILA_IDS.length; i++) {
  const id = HOSILA_IDS[i];
  const titreH = normalise(HOSILA_OFFICIELLES[i].uniteAr);
  const candidats = INITIAL_UNITS.filter(
    (u) => normalise(u.title) === titreH || normalise(u.title).includes(titreH) || titreH.includes(normalise(u.title)),
  );
  if (candidats.length === 1) {
    idVersUnitId.set(id, candidats[0].id);
    continue;
  }
  // Ambigu/absent : toléré tant que ce n'est pas une unité cible (tranche U1-U3).
  if (UNITES_CIBLES.includes(id)) {
    throw new Error(`alignement rompu pour l'unité cible ${id} (hosila « ${HOSILA_OFFICIELLES[i].uniteAr} ») : ${candidats.length} candidats catalogue`);
  }
  console.warn(`  (unité hors tranche non alignée : ${id} — ${candidats.length} candidats)`);
}

// 2) Vocabulaire de la même unité : les termes « » des QCM du corpus.
const setsParUnite = new Map<number, Set<string>>();
for (const q of SVT_QUIZ_QUESTIONS) {
  const set = setsParUnite.get(q.unitId) ?? new Set<string>();
  for (const m of q.questionText.matchAll(/«([^»]+)»/g)) set.add(m[1].trim());
  setsParUnite.set(q.unitId, set);
}
const termesParUnite = new Map<number, string[]>();
for (const [unitId, set] of setsParUnite) {
  termesParUnite.set(unitId, [...set].sort((a, b) => b.length - a.length)); // le plus long d'abord
}

// 3) Génération des cartes (une au maximum par phrase point).
interface CarteHosila {
  id: string;
  unitId: number;
  question: string;
  answerBullets: string[];
}

const cartes: CarteHosila[] = [];
const stats: Array<{ unite: string; unitId: number; phrases: number; cartes: number }> = [];

for (const idUnite of UNITES_CIBLES) {
  const unite = HOSILA_OFFICIELLES[HOSILA_IDS.indexOf(idUnite as (typeof HOSILA_IDS)[number])];
  const unitId = idVersUnitId.get(idUnite);
  if (!unitId) throw new Error(`unité cible inconnue : ${idUnite}`);
  const termes = termesParUnite.get(unitId) ?? [];
  const phrases = unite.blocs
    .filter((b) => (b.kind === 'point' || b.kind === 'texte' || b.kind === 'puce'))
    .map((b) => b.texte.trim())
    // Fragments inutilisables en cloze : listes introduites (« ... : »),
    // continuations de phrase (« ...والمحاور »), énoncés trop courts.
    .filter((p) => p.length >= 35 && !p.endsWith(':') && !p.startsWith('...') && !/[<>{}]/.test(p));
  let nCartes = 0;
  for (const phrase of phrases) {
    // Candidats arabes : vocabulaire « » du QCM de la même unité (programme).
    const candidatsAr = termes.filter((t) => t.length >= 4 && t.length <= 40);
    // Candidats latins : sigles et termes scientifiques du livre (ADN, ARNm,
    // ATP, CMH, patch clamp, Rastop...) — franc-s et non ambigus.
    const candidatsLatin = [...phrase.matchAll(/[A-Za-z][A-Za-z0-9]*/g)]
      .map((m) => m[0])
      .filter((t) => t.length >= 2);
    // Le terme masqué : le PLUS LONG apparaissant EXACTEMENT UNE FOIS, avec
    // assez de contexte restant (≥ 30 car.) pour que le rappel soit faisable.
    const unicite = (t: string): boolean => {
      let occurrences = 0;
      let pos = phrase.indexOf(t);
      while (pos !== -1) { occurrences += 1; pos = phrase.indexOf(t, pos + t.length); }
      return occurrences === 1 && phrase.length - t.length >= 30;
    };
    const candidat =
      [...candidatsAr, ...candidatsLatin].sort((a, b) => b.length - a.length).find(unicite) ?? null;
    if (!candidat) continue;
    nCartes += 1;
    cartes.push({
      id: `${PREFIXE_ID}${idUnite}_${String(nCartes).padStart(2, '0')}`,
      unitId,
      question: `أكمل الفراغ : ${phrase.replace(candidat, CARTE_MASQUE)}`,
      answerBullets: [phrase, `**المصدر:** « ${unite.uniteAr} » — الكتاب المدرسي المقرر (الوحدة ${unitId}).`],
    });
  }
  stats.push({ unite: idUnite, unitId, phrases: phrases.length, cartes: nCartes });
}

const total = cartes.length;
if (total === 0) throw new Error('aucune carte générée — vérifier les termes/points');

// 4) Écriture du fichier généré (UTF-8 sans BOM).
const enTete = `/* eslint-disable */
/**
 * GÉNÉRÉ - NE PAS ÉDITER À LA MAIN.
 * Script : scripts/build_cartes_hosila.ts (npx tsx) · Verrou : src/data/cartesHosila.lock.test.ts
 * Source : src/data/hosila.ts (texte OFFICIEL du livre scolaire 3AS SVT).
 * Vague 2 - action 9 (audit externe 2026-10-17) : de vraies cartes de rappel
 * actif, sans options, non dérivées des QCM — format « إكمال » (cloze) :
 *   recto = phrase officielle avec le terme clé masqué (karim « » du QCM de la
 *   même unité, plus long terme à occurrence unique) ;
 *   verso = la phrase complète + la source (unité du livre).
 * AUCUN contenu inventé : verrou d'anti-invention sur chaque chaîne.
 * Tranche actuelle : ${UNITES_CIBLES.join(', ')} (unités ${stats.map((s) => s.unitId).join('/')}) · ${total} cartes.
 */
import type { Flashcard } from '../types';

/** Masque affiché dans le recto (partagé avec le verrou d'anti-invention). */
export const CARTE_MASQUE = ${JSON.stringify(CARTE_MASQUE)};

/** Préfixe des ids de cartes hosila (exclusions de tests / tri). */
export const PREFIXE_ID_CARTE_HOSILA = ${JSON.stringify(PREFIXE_ID)};

/** Statistiques de génération (tranche courante). */
export const CARTES_HOSILA_STATS = ${JSON.stringify({ unites: stats, total }, null, 2)};

/** Cartes de rappel issues du texte officiel du livre — unités traitées. */
export const CARTES_HOSILA: Flashcard[] = [
${cartes.map((c) => '  ' + JSON.stringify(c, null, 2).replace(/\n/g, '\n  ')).join(',\n')}
];
`;

const fichier = 'src/data/cartesHosila.ts';
writeFileSync(fichier, enTete, 'utf8');

console.log(`Généré ${fichier} : ${total} cartes (UTF-8 sans BOM).`);
for (const s of stats) console.log(`  ${s.unite} (U${s.unitId}) : ${s.cartes} cartes / ${s.phrases} phrases officielles`);
