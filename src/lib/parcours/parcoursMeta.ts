// src/lib/parcours/parcoursMeta.ts
// Métadonnées d'affichage pour le design OPUS 5.5 (photos « مساري » et
// « البكالوريا ») : bandeau de domaine (FR), en-tête d'unité (heures +
// fenêtre officielles), titres FR et poids BAC.
//
// AUCUNE valeur n'est écrite à la main sans source — chaque champ vient d'un
// fichier déjà présent dans l'app :
//   heures + fenêtre  → src/data/curriculumOfficial.ts (L5, 2017, colonnes
//                        « تقدير الحجم الزمني » et « شهر »)
//   titre FR d'unité  → src/unitCatalog.ts (description « titre AR — titre FR »)
//   titre FR domaine  → étiquette de design du zip OPUS 5.5 (les 3 photos) :
//                        traduction littérale du titre arabe officiel
//   poids BAC         → src/data/unitOpenings.ts (mesuré pour U1..U7 ;
//                        ABSENT pour U8..U11 = non mesuré → on n'affiche rien)
//
// La fenêtre officielle est longue (« من الأسبوع الثاني لشهر سبتمبر إلى
// الأسبوع الرابع لشهر سبتمبر ») : on n'en extrait que les mois nommés, tels
// qu'ils figurent dans le document officiel — pas de reformulation.

import { PROGRESSION_OFFICIELLE } from '../../data/curriculumOfficial';
import { INITIAL_UNITS } from '../../unitCatalog';
import { UNIT_OPENINGS } from '../../data/unitOpenings';

/** Mois tels que cités dans les documents officiels algériens. */
const MOIS_OFFICIELS = [
  'جانفي',
  'فيفري',
  'مارس',
  'أفريل',
  'ماي',
  'جوان',
  'جويلية',
  'أوت',
  'سبتمبر',
  'أكتوبر',
  'نوفمبر',
  'ديسمبر',
];

/**
 * Fenêtre officielle réduite aux mois qu'elle nomme, dans l'ordre du texte.
 * « من الأسبوع الثاني لشهر سبتمبر إلى الأسبوع الرابع لشهر سبتمبر » → « سبتمبر ».
 */
export function fenetreCourte(fenetre: string): string {
  const mois = MOIS_OFFICIELS
    .map((m) => ({ m, pos: fenetre.indexOf(m) }))
    .filter((x) => x.pos >= 0)
    .sort((a, b) => a.pos - b.pos)
    .map((x) => x.m);
  return mois.length > 0 ? mois.join(' ← ') : fenetre;
}

export interface MetaUniteOfficielle {
  /** Volume horaire officiel (heures). */
  heures: number;
  /** Fenêtre officielle réduite à ses mois. */
  fenetre: string;
  /** Trimestre officiel (1..3). */
  trimestre: 1 | 2 | 3;
}

/** Heures + fenêtre officielles d'une unité, ou null si l'unité est absente. */
export function metaUniteOfficielle(uniteId: number): MetaUniteOfficielle | null {
  const p = PROGRESSION_OFFICIELLE.find((x) => x.uniteId === uniteId);
  if (!p) return null;
  return { heures: p.heures, fenetre: fenetreCourte(p.fenetre), trimestre: p.trimestre };
}

/** Titre français officiel d'une unité (« ... — Synthèse des protéines »). */
export function titreFrUnite(uniteId: number): string | null {
  const u = INITIAL_UNITS.find((x) => x.id === uniteId);
  if (!u?.description) return null;
  const sep = u.description.indexOf(' — ');
  if (sep < 0) return null;
  const fr = u.description.slice(sep + 3).trim();
  return fr.length > 0 ? fr : null;
}

/** Titre français du domaine (étiquette de design OPUS 5.5). */
const TITRES_FR_DOMAINES: Record<number, string> = {
  1: 'Spécialisation des protéines',
  2: 'Conversions énergétiques',
  3: 'Tectonique globale',
};

export function titreFrDomaine(domainId: number): string | null {
  return TITRES_FR_DOMAINES[domainId] ?? null;
}

/**
 * Visuel du bandeau de domaine — image DÉJÀ livrée avec l'app (schéma du
 * domaine), utilisée en texture sous le dégradé. Aucun binaire ajouté.
 */
const IMAGES_DOMAINES: Record<number, string> = {
  1: '/assets/images/schemas/domaine1_proteines/schema_35_unit1_big_picture_modern.jpg',
  2: '/assets/images/schemas/domaine2_energie/schema_12_bilan_energetique.png',
  3: '/assets/images/schemas/domaine3_tectonique/schema_synthese_geologie_U10.jpg',
};

export function imageDomaine(domainId: number): string | null {
  return IMAGES_DOMAINES[domainId] ?? null;
}

/** Poids mesuré au BAC (%) — undefined si jamais mesuré (U8..U11). */
export function poidsBacUnite(uniteId: number): number | undefined {
  return UNIT_OPENINGS.find((o) => o.unitId === uniteId)?.bacWeightPercent;
}

/** Date « yyyy-mm-dd » → « 6 أكتوبر » (mois officiels algériens). */
export function formatCourtAr(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return iso;
  const mois = MOIS_OFFICIELS[Number(m[2]) - 1];
  if (!mois) return iso;
  return `${Number(m[3])} ${mois}`;
}
