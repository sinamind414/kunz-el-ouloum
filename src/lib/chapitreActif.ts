// src/lib/chapitreActif.ts — LE CHAPITRE ACTIF, PARTAGÉ PAR TOUTE L'APPLICATION.
//
// Le principe (demande du propriétaire, 2026-11-10) : l'élève ENTRE par le
// chapitre (l'un des 3 domaines du programme), puis voit les rubriques de CE
// chapitre. Le chapitre choisi est donc un état GLOBAL de l'application, pas
// un filtre local à une vue.
//
// MACHINE D'ÉTAT (localStorage) et non contexte React : aucune modification
// d'App.tsx n'est nécessaire, et toutes les vues s'y abonnent toutes seules
// (useSyncExternalStore). La sélection survit à un rechargement et reste
// dans le téléphone (rien ne sort — la promesse de confidentialité tient).

import { useSyncExternalStore } from 'react';
import { CHAPITRES, unitesDuChapitre } from '../data/chapitres';

const CLE = 'kunz-chapitre-actif';

/** Par défaut : le premier chapitre du programme (protéines). */
let chapitreActif = 1;
let initialise = false;
const abonnes = new Set<() => void>();

function lireStockage(): number {
  try {
    const brut = localStorage.getItem(CLE);
    const n = brut ? parseInt(brut, 10) : NaN;
    if (CHAPITRES.some((c) => c.id === n)) return n;
  } catch {
    /* stockage indisponible : on garde le défaut */
  }
  return CHAPITRES[0]?.id ?? 1;
}

function initialiser(): void {
  if (initialise) return;
  initialise = true;
  chapitreActif = lireStockage();
}

/** Le chapitre actif (1, 2 ou 3). La lecture est TOUJOURS synchronisée avec le
 *  stockage : une vue remontée (ou un test) reçoit la valeur réellement posée,
 *  pas un cache périmé. */
export function lireChapitreActif(): number {
  const stocke = lireStockage();
  if (stocke !== chapitreActif) chapitreActif = stocke;
  initialise = true;
  return chapitreActif;
}

/** Change le chapitre actif et prévient les vues abonnées. */
export function definirChapitreActif(id: number): void {
  initialiser();
  if (!CHAPITRES.some((c) => c.id === id)) return;
  if (id === chapitreActif) return;
  chapitreActif = id;
  try {
    localStorage.setItem(CLE, String(id));
  } catch {
    /* stockage indisponible : la sélection vaut pour la session */
  }
  for (const abonne of abonnes) abonne();
}

function abonner(abonne: () => void): () => void {
  abonnes.add(abonne);
  return () => abonnes.delete(abonne);
}

/** Hook React : le chapitre actif et le moyen de le changer. */
export function useChapitreActif(): { id: number; set: (id: number) => void } {
  const id = useSyncExternalStore(abonner, lireChapitreActif, lireChapitreActif);
  return { id, set: definirChapitreActif };
}

/**
 * Ne garde que les unités du chapitre actif.
 * Fonction générique : elle marche avec toute liste qui porte un `id`
 * d'unité (les listes de l'app sont toutes de cette forme).
 */
export function filtrerParChapitre<T extends { id: number }>(liste: T[], chapitreId: number): T[] {
  const ids = new Set(unitesDuChapitre(chapitreId));
  return liste.filter((u) => ids.has(u.id));
}
