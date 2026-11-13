// conseilRubrique.ts — LE GUIDE PARLE À CHAQUE ENTRÉE, EN ROTATION.
//
// RÈGLE (option B, 2026-11-05) : le guide accueille à chaque entrée de rubrique,
// pas seulement à la première. Chaque rubrique dispose de 2 ou 3 conseils en
// rotation : le compteur de visites détermine lequel s'affiche (compteur % nb
// conseils). Réentrer dans une rubrique donne un conseil nouveau — le guide
// réagit sans harceler.
//
// Ce module est PUR (aucune dépendance à React) : la décision « faut-il parler ? »
// se teste donc sans monter d'interface.

/** Clé de stockage des compteurs de visites par rubrique. */
export const CLE_VISITES_RUBRIQUES = 'boussole_conseils_visites_rubriques';

/** Nombre maximal de rubriques mémorisées (même plafond qu'avant). */
const MAX_RUBRIQUES_MEMORISEES = 40;

/**
 * Faut-il montrer le conseil de cette rubrique ?
 *
 * Fonction PURE : trois refus seulement
 *  · pas de conseil pour cette rubrique → silence (voir `conseilsRubrique.ts`) ;
 *  · identifiant vide ou douteux → silence (on ne parle pas d'un écran inconnu) ;
 *  · écran de démarrage → silence.
 *
 * Une rubrique déjà visitée PARLE ENCORE — c'est le changement de l'option B :
 * le guide réagit à chaque entrée, en rotation.
 */
export function doitParlerRubrique(
  rubrique: string | null | undefined,
  aUnConseil: boolean
): boolean {
  if (!aUnConseil) return false;
  if (typeof rubrique !== 'string' || rubrique.length === 0) return false;
  if (rubrique === 'splash') return false;
  return true;
}

/** Lectures des compteurs de visites (lecture tolérante : jamais d'exception). */
export function visitesRubriques(): Record<string, number> {
  try {
    const brut = localStorage.getItem(CLE_VISITES_RUBRIQUES);
    if (!brut) return {};
    const liste = JSON.parse(brut);
    if (typeof liste !== 'object' || liste === null || Array.isArray(liste))
      return {};
    const out: Record<string, number> = {};
    for (const [k, v] of Object.entries(liste)) {
      if (typeof v === 'number' && Number.isFinite(v)) out[k] = v;
    }
    return out;
  } catch {
    return {};
  }
}

/** Index du conseil à afficher pour cette rubrique (rotation : visite % nbConseils). */
export function indiceConseil(
  rubrique: string,
  nbConseils: number
): number {
  const visites = visitesRubriques()[rubrique] ?? 0;
  return visites % nbConseils;
}

/** Mémorise une visite supplémentaire dans cette rubrique. */
export function enregistrerVisiteRubrique(rubrique: string): void {
  if (typeof rubrique !== 'string' || rubrique.length === 0) return;
  try {
    const visites = visitesRubriques();
    visites[rubrique] = (visites[rubrique] ?? 0) + 1;
    // Bornage : garde les MAX_RUBRIQUES_MEMORISEES plus récentes.
    const entree = Object.entries(visites)
      .sort(([, a], [, b]) => b - a)
      .slice(0, MAX_RUBRIQUES_MEMORISEES)
      .reduce<Record<string, number>>((acc, [k, v]) => { acc[k] = v; return acc; }, {});
    localStorage.setItem(CLE_VISITES_RUBRIQUES, JSON.stringify(entree));
  } catch {
    /* stockage indisponible : au pire, la rotation recommence à zéro */
  }
}

/** Oublie toutes les visites — l'élève redemandera donc les explications. */
export function oublierVisitesRubriques(): void {
  try {
    localStorage.removeItem(CLE_VISITES_RUBRIQUES);
  } catch {
    /* rien à faire */
  }
}

/** Nombre de visites enregistrées pour une rubrique (0 si jamais visitée). */
export function nbVisitesRubrique(rubrique: string): number {
  return visitesRubriques()[rubrique] ?? 0;
}

/** Rubriques visitées au moins une fois (liste des clés avec compteur > 0). */
export function rubriquesVisitees(): string[] {
  return Object.entries(visitesRubriques())
    .filter(([, v]) => v > 0)
    .map(([k]) => k);
}
