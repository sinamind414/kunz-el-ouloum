// couvCle.ts
// Scorer C2 du module Tadwin (التدوين الشامل) — couverture PAR CLÉ.
//
//   C2 = clésCouvertes / clésChoisies
//
// L'atome est la PREUVE ; la clé est l'UNITÉ NOTÉE (docs/tadwin_decisions.md §2).
// Une clé est couverte si la réponse contient assez de SES PROPRES atomes. Le
// dénominateur n'est jamais :
//   · l'union des atomes (§2 : tolérance 0 vs 3 manques pour un même effort 2-clés,
//     inéquité structurelle mesurée) ;
//   · le pool correcteur.motsCles de l'unité (§4 : union INTERDITE — elle ramenait
//     les pools à 40–73 formes, soit +55 % d'exigence, réintroduisant le bug de
//     seuil inatteignable corrigé le 2026-09-16).
//
// SEUIL : FIGÉ PAR CALIBRATION (2026-09-30) — « ≥ la moitié des atomes, minimum 1 »
// (docs/tadwin_decisions.md §8). Mesuré sur 33 fiches-modèles
// (src/data/tadwinCalibration.ts) : les fiches d'excellence concises exigent
// 1/2, 2/3 ou 3/5 atomes selon les clés ; tout seuil > 0,5 casse au moins une
// fiche excellente (test de gel dans tadwinCalibration.test.ts). Le seuil 0,6
// supposé jouable à l'origine est réfuté (§7) : 12/33 clés ont exactement 2
// atomes, et > 0,5 leur donne 0 tolérance.

import { normalizeAr, motPresentDans } from './normalizeAr';
import { clesDeUnite, type CleTadwin } from '../../data/tadwinCles';

/**
 * Seuil C2 figé par calibration : une clé est couverte si la réponse contient
 * au moins la moitié de SES atomes (minimum 1). Voir tadwinCalibration.ts.
 */
export const SEUIL_C2 = 0.5;

/** Alias historique du candidat — garder SEUIL_C2 dans le nouveau code. */
export const SEUIL_C2_CANDIDAT = SEUIL_C2;

/** Levé quand le choix des clés viole un lock §6.1/§6.2 (choix invalide). */
export class ChoixClesInvalide extends Error {}

export interface ChoixCles {
  uniteId: number;
  /** 2 à 3 clés CHOISIES par l'élève parmi les 3 prescrites (palier 3, §5). */
  clesChoisies: string[];
}

export interface ResultatCle {
  cle: string;
  atomsPresents: string[];
  atomsManquants: string[];
  couvert: boolean;
}

export interface ResultatC2 {
  uniteId: number;
  clesChoisies: string[];
  couvertes: string[];
  manquantes: string[];
  /** clésCouvertes / clésChoisies — note de Tadwin (jamais une note de bac). */
  c2: number;
  detail: ResultatCle[];
}

/**
 * Nombre d'atomes qu'il faut trouver pour couvrir une clé (candidat §8) :
 * `max(1, ceil(nbAtoms × seuil))`. Le `max(1, …)` est le « minimum 1 » —
 * sans lui, une clé mono-atome couverte ne vaudrait jamais rien.
 */
export function seuilCouvertureCle(nbAtoms: number, seuil = SEUIL_C2): number {
  return Math.max(1, Math.ceil(nbAtoms * seuil));
}

/** Un atome est prouvé s'il apparaît dans la réponse aux frontières de mots. */
function atomePresent(normReponse: string, atome: string): boolean {
  const nAtome = normalizeAr(atome).toLowerCase();
  return !!nAtome && motPresentDans(normReponse, nAtome);
}

/**
 * Évalue UNE clé indépendamment de toute autre (jamais d'union, §2).
 * Le matcher est exactement celui du correcteur V1 (motPresentDans) — pas
 * d'expansion de synonymes : la calibration se fera sur les atomes déclarés.
 */
export function evaluerCle(
  reponse: string,
  cle: CleTadwin,
  seuil = SEUIL_C2,
): ResultatCle {
  const norm = normalizeAr(reponse || '').toLowerCase();
  const atomsPresents: string[] = [];
  const atomsManquants: string[] = [];
  for (const atome of cle.atoms) {
    if (atomePresent(norm, atome)) atomsPresents.push(atome);
    else atomsManquants.push(atome);
  }
  return {
    cle: cle.cle,
    atomsPresents,
    atomsManquants,
    couvert:
      atomsPresents.length >= seuilCouvertureCle(cle.atoms.length, seuil),
  };
}

/**
 * Évalue la couverture par-clé des clés choisies par l'élève.
 *
 * Verrouille §6.1 (clésChoisies ⊆ 3 prescrites) et §6.2 (≥ 2 clés, plancher
 * bloc = geste-signature « مفتاحان يكفيان »). Lève {@link ChoixClesInvalide}
 * plutôt que de noter un choix incohérent — le dénominateur serait sans valeur.
 */
export function evaluerC2(
  reponse: string,
  choix: ChoixCles,
  seuil = SEUIL_C2,
): ResultatC2 {
  const prescrites = clesDeUnite(choix.uniteId);
  if (!prescrites) {
    throw new ChoixClesInvalide(`unité inconnue: ${choix.uniteId}`);
  }
  const choixN = choix.clesChoisies;
  if (new Set(choixN).size !== choixN.length) {
    throw new ChoixClesInvalide('doublon dans les clés choisies');
  }
  for (const cle of choixN) {
    if (!prescrites.some((p) => p.cle === cle)) {
      throw new ChoixClesInvalide(
        `clé choisie hors des 3 prescrites de l'unité ${choix.uniteId}: ${cle}`,
      );
    }
  }
  if (choixN.length < 2) {
    throw new ChoixClesInvalide(
      `plancher bloc non respecté: ${choixN.length} clé(s) choisie(s), minimum 2`,
    );
  }

  const detail = choixN.map((cle) => {
    const prescrite = prescrites.find((p) => p.cle === cle);
    return evaluerCle(reponse, prescrite!, seuil);
  });
  const couvertes = detail.filter((d) => d.couvert).map((d) => d.cle);

  return {
    uniteId: choix.uniteId,
    clesChoisies: [...choixN],
    couvertes,
    manquantes: detail.filter((d) => !d.couvert).map((d) => d.cle),
    c2: couvertes.length / choixN.length,
    detail,
  };
}
