// src/data/prioritesBac.ts — VRAIES ÉTIQUETTES DE PRIORITÉ (étage 3 / R2).
//
// Recommandation de l'audit du 7/11 : « vraies étiquettes 🔴/🟡/🟢 calculées
// à partir de unitPressure() et des 65 BAC_IDEAS, affichées sur 11/11 unités ».
//
// ⚠️ Les 🔴/🟡/🟢 de `lessonIndex.ts` sont des LÉGENDES DE SCHÉMAS (« النقاط
// الحمراء »), pas des priorités. Ce module n'y touche pas : il calcule les
// siennes UNIQUEMENT depuis les 65 idées officiellement indexées.
//
// [INTERPRÉTATION] Le classement est RELATIF (rang par points mesurés), pas une
// pondération officielle du ministère : « Non vérifiable ». Aucun pourcentage
// n'est inventé, tous sont dérivés de `unitPressure()`.

import { BAC_IDEAS, unitPressure } from './bacSessionIndex';
import { PROGRESSION_OFFICIELLE } from './curriculumOfficial';

export type NiveauPriorite = 'indispensable' | 'important' | 'complementaire';

export interface PrioriteUnite {
  unitId: number;
  domaine: 1 | 2 | 3;
  titreAr: string;
  /** Points des exercices où l'unité est PORTEUSE (rang 0), source unitPressure(). */
  pointsPrincipaux: number;
  /** Nombre d'idées BAC où l'unité apparaît, tout rang confondu. */
  occurrences: number;
  annees: number[];
  partPourCent: number;
  rang: number;
  niveau: NiveauPriorite;
  emoji: '🔴' | '🟡' | '🟢';
  libelleAr: string;
}

/** [INTERPRÉTATION] Seuils de RANG, pas de points : 3 / 4 / 4 sur 11 unités. */
export const REGLE_RANG = {
  indispensable: { min: 1, max: 3 },
  important: { min: 4, max: 7 },
  complementaire: { min: 8, max: 11 },
} as const;

export const LIBELLES_PRIORITE: Record<NiveauPriorite, string> = {
  indispensable: 'أولوية قصوى (قياس الدورات)',
  important: 'أولوية متوسطة (قياس الدورات)',
  complementaire: 'أولوية داعمة (قياس الدورات)',
};

export const TOTAL_POINTS_MESURES = unitPressure().reduce((s, p) => s + p.pointsPrincipaux, 0);
export const NB_IDEES_BAC = BAC_IDEAS.length;

function niveauParRang(rang: number): NiveauPriorite {
  if (rang <= REGLE_RANG.indispensable.max) return 'indispensable';
  if (rang <= REGLE_RANG.important.max) return 'important';
  return 'complementaire';
}

const EMOJI: Record<NiveauPriorite, '🔴' | '🟡' | '🟢'> = {
  indispensable: '🔴',
  important: '🟡',
  complementaire: '🟢',
};

/** 11 lignes, UNE par unité officielle — y compris U8, U10 et U11. */
export const PRIORITES_BAC: readonly PrioriteUnite[] = unitPressure().map((p, i) => {
  const officielle = PROGRESSION_OFFICIELLE.find((u) => u.uniteId === p.unitId)!;
  const rang = i + 1;
  const niveau = niveauParRang(rang);
  return {
    unitId: p.unitId,
    domaine: officielle.domaine,
    titreAr: officielle.titre,
    pointsPrincipaux: p.pointsPrincipaux,
    occurrences: p.count,
    annees: [...p.years],
    partPourCent: Math.round((p.pointsPrincipaux / TOTAL_POINTS_MESURES) * 1000) / 10,
    rang,
    niveau,
    emoji: EMOJI[niveau],
    libelleAr: LIBELLES_PRIORITE[niveau],
  };
});

/** `null` pour une unité inexistante : l'appelant n'affiche alors rien. */
export function prioritePourUnite(unitId: number): PrioriteUnite | null {
  return PRIORITES_BAC.find((p) => p.unitId === unitId) ?? null;
}

/** Phrase affichée à l'élève : chiffres mesurés, jamais « tombe chaque année ». */
export function phrasePrioriteAr(p: PrioriteUnite): string {
  return `${p.emoji} ${p.libelleAr} · ${p.pointsPrincipaux} نقطة مقيسة (${p.partPourCent}٪) · ${p.occurrences} فكرة من دورات ${Math.min(...p.annees)}–${Math.max(...p.annees)}`;
}
