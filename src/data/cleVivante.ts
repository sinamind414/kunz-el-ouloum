/**
 * Données de la clé vivante (المفتاح الحيّ) — module المفتاح (MeftahView).
 * Source unique des dents : ASNAN (miftahSpec.ts) — zéro littéral dupliqué.
 *
 * Règle de mapping verbe → dents (cohérente avec l'audit §11 D2 et la
 * catégorie des verbes) :
 *   - descriptive   → dents 1, 2, 4 (دليل mis de côté → la dent علاقة n'est pas requise)
 *   - reasoned       → dents 1, 2, 3, 4 (le lien causal est requis)
 *   - عَرِّفْ         → dents 1, 4 (tiroir de connaissances, pas de document)
 *
 * Verrou : tout ajout d'un verbe dans VERB_CARDS doit être ajouté ici,
 * sinon la couverture est signalée par le lock test cleVivante.lock.test.tsx.
 */

import { ASNAN, MOVEMENTS } from './miftahSpec';
import type { VerbCard } from './methodologyEngine';

// ------------------------------------------------------------------
// 4 dents — verbatim ASNAN (miftahSpec.ts), enrichi d'icônes et de tons
// Note : ASNAN exporte aussi une 5ᵉ case STEP0 (اِفهم) qui n'est PAS une dent
// (voir STEP0.templateAr « la « dent 0 » n'est pas une dent : c'est le قفل »).
// On ne compte donc que les 4 dents (ids 1→4).
// ------------------------------------------------------------------
export type Dent = (typeof DENTS)[number];

export const DENTS = Object.freeze([
  {
    id: 1,
    nameAr: ASNAN[0].nameAr,
    nameFr: 'Le verbe',
    iconAr: ASNAN[0].iconAr,
    actionAr: ASNAN[0].actionAr,
    correctorAr: ASNAN[0].correctorAr,
    tone: 'gold',
  },
  {
    id: 2,
    nameAr: ASNAN[1].nameAr,
    nameFr: 'La preuve',
    iconAr: ASNAN[1].iconAr,
    actionAr: ASNAN[1].actionAr,
    correctorAr: ASNAN[1].correctorAr,
    tone: 'teal',
  },
  {
    id: 3,
    nameAr: ASNAN[2].nameAr,
    nameFr: 'Le lien',
    iconAr: ASNAN[2].iconAr,
    actionAr: ASNAN[2].actionAr,
    correctorAr: ASNAN[2].correctorAr,
    noteAr: ASNAN[2].noteAr,
    tone: 'teal',
  },
  {
    id: 4,
    nameAr: ASNAN[3].nameAr,
    nameFr: 'La réponse',
    iconAr: ASNAN[3].iconAr,
    actionAr: ASNAN[3].actionAr,
    correctorAr: ASNAN[3].correctorAr,
    tone: 'gold',
  },
] as const);

export const TEETH_COUNT = DENTS.length;

// ------------------------------------------------------------------
// Mapping verbe → dents
// ------------------------------------------------------------------
export type VerbDent = 'dent1' | 'dent2' | 'dent3' | 'dent4';

export interface VerbeCle {
  id: string;
  verbAr: string;
  verbFr: string;
  dents: number[];             // indices des dents mobilisées (→ DENTS)
  familleAr: string;
  familleFr: string;
  qafal: boolean;              // Porte 1 : y a-t-il un verrou (document) ?
  source: 'document' | 'mixte' | 'connaissances';
}

// Règle auditable : descriptive → 1/2/4 ; reasoned → 1/2/3/4 ; عَرِّف → 1/4.
export function mapCategoryToDents(category: VerbCard['category'], id: string): number[] {
  if (category === 'reasoned') return [1, 2, 3, 4];
  if (id === 'verb_define_v1') return [1, 4];
  return [1, 2, 4];
}

// ------------------------------------------------------------------
// Les 12 verbes de VERB_CARDS — la liste est le contrat du composant
// ------------------------------------------------------------------
export const VERBES_CLE: readonly VerbeCle[] = Object.freeze([
  { id: 'verb_analyse_v1', verbAr: 'حَلِّلْ', verbFr: 'Analyser', dents: [1, 2, 4], familleAr: MOVEMENTS.photo.labelAr, familleFr: MOVEMENTS.photo.gearAr, qafal: true, source: 'document' },
  { id: 'verb_explain_v1', verbAr: 'فَسِّرْ', verbFr: 'Interpréter / expliquer', dents: [1, 2, 3, 4], familleAr: MOVEMENTS.film.labelAr, familleFr: MOVEMENTS.film.gearAr, qafal: true, source: 'document' },
  { id: 'verb_compare_v1', verbAr: 'قَارِنْ', verbFr: 'Comparer', dents: [1, 2, 4], familleAr: MOVEMENTS.photo.labelAr, familleFr: MOVEMENTS.photo.gearAr, qafal: true, source: 'document' },
  { id: 'verb_hypothesis_v1', verbAr: 'اقْتَرِحْ فَرَضِيَّةً', verbFr: 'Proposer une hypothèse', dents: [1, 2, 3, 4], familleAr: MOVEMENTS.smith.labelAr, familleFr: MOVEMENTS.smith.gearAr, qafal: true, source: 'document' },
  { id: 'verb_deduce_v1', verbAr: 'اسْتَنْتِجْ', verbFr: 'Déduire / conclure', dents: [1, 2, 3, 4], familleAr: MOVEMENTS.film.labelAr, familleFr: MOVEMENTS.film.gearAr, qafal: true, source: 'document' },
  { id: 'verb_validate_v1', verbAr: 'صَادِقْ عَلَى الصِّحَّة', verbFr: 'Valider l\'hypothèse', dents: [1, 2, 3, 4], familleAr: MOVEMENTS.smith.labelAr, familleFr: MOVEMENTS.smith.gearAr, qafal: true, source: 'document' },
  { id: 'verb_explain_multi_v1', verbAr: 'اشْرَحْ', verbFr: 'Expliciter / développer', dents: [1, 2, 3, 4], familleAr: MOVEMENTS.film.labelAr, familleFr: MOVEMENTS.film.gearAr, qafal: true, source: 'mixte' },
  { id: 'verb_schema_v1', verbAr: 'لَخِّصْ فِي مُخَطَّطْ', verbFr: 'Schématiser / résumer', dents: [1, 2, 4], familleAr: MOVEMENTS.photo.labelAr, familleFr: MOVEMENTS.photo.gearAr, qafal: true, source: 'document' },
  { id: 'verb_calcul_v1', verbAr: 'احْسُبْ', verbFr: 'Calculer', dents: [1, 2, 3, 4], familleAr: MOVEMENTS.smith.labelAr, familleFr: MOVEMENTS.smith.gearAr, qafal: true, source: 'document' },
  { id: 'verb_pedigree_v1', verbAr: 'حَدِّدْ نَمَطَ الوِرَاثَةِ', verbFr: 'Déterminer un mode de transmission', dents: [1, 2, 3, 4], familleAr: MOVEMENTS.smith.labelAr, familleFr: MOVEMENTS.smith.gearAr, qafal: true, source: 'document' },
  { id: 'verb_define_v1', verbAr: 'عَرِّفْ', verbFr: 'Définir', dents: [1, 4], familleAr: MOVEMENTS.photo.labelAr, familleFr: 'Forme spéciale — tiroir de connaissances', qafal: false, source: 'connaissances' },
  { id: 'verb_list_v1', verbAr: 'اذْكُرْ / عَدِّدْ / سَمِّ', verbFr: 'Lister / énumérer', dents: [1, 2, 4], familleAr: MOVEMENTS.photo.labelAr, familleFr: MOVEMENTS.photo.gearAr, qafal: true, source: 'document' },
]);

export const VERBES_CLE_ID = Object.freeze(VERBES_CLE.map((v) => v.id));

// Verre d'identité : tous les verbes ont un mapping de dents valide.
export function hasVerbeDents(verbId: string): verbId is VerbeCle['id'] {
  return VERBES_CLE_ID.includes(verbId);
}

// Verre d'identité : une dent donnée est bien une dent de la clé.
export function isValidDentId(id: number): id is Dent['id'] {
  return DENTS.some((d) => d.id === id);
}
