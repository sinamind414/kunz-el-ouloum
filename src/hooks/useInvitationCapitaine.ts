// useInvitationCapitaine.ts — CÂBLAGE DE LA BULLE DU CAPITAINE.
//
// Le module `lib/invitationCapitaine.ts` est PUR (contexte → invitation) : c'est
// ce qui permet de vérifier les 4 lois d'Atomic Habits par des tests. Ce hook
// fait le travail inverse et sale : lire l'état réel de l'élève, mémoriser les
// messages ignorés, et ne rien calculer de plus.
//
// POURQUOI LA LECTURE EST FAITE UNE FOIS, PAS EN BOUCLE :
// l'application vise des téléphones d'entrée de gamme. Interroger le stockage en
// boucle coûte plus qu'il n'apporte. La bulle se recalcule sur les évènements qui
// comptent (ouverture, changement de rubrique, retour de travail) — pas toutes
// les secondes.
//
// L'HEURE EST LUE SUR L'HORLOGE À CHAQUE RECALCUL, et passée en paramètre : le
// module reste pur et testable, le hook ne décide de rien.

import { useCallback, useEffect, useMemo, useState } from 'react';
import { invitationDuMoment, type ContexteCapitaine, type Invitation } from '../lib/invitationCapitaine';
import { cumulJoursDepuisDaily, serieAfficheeDepuisDaily } from '../utils/activiteQuotidienne';
import { jourLocal, ecartEnJours } from '../utils/dayKey';
import type { DailyGoalConfig } from '../types';

const CLE_IGNOREE = 'boussole_capitaine_invitation_ignoree';

/** Horodatage du dernier message ignoré (0 si jamais). */
export function derniereInvitationIgnoreeMs(): number {
  try {
    const brut = localStorage.getItem(CLE_IGNOREE);
    if (!brut) return 0;
    const n = Number.parseInt(brut, 10);
    return Number.isFinite(n) && n > 0 ? n : 0;
  } catch {
    return 0;
  }
}

/** L'élève a fermé la bulle : on se tait un moment (loi 1, version inverse). */
export function marquerInvitationIgnoree(maintenantMs: number = Date.now()): void {
  try {
    localStorage.setItem(CLE_IGNOREE, String(maintenantMs));
  } catch {
    /* stockage indisponible : au pire, la bulle reparle plus tôt */
  }
}

/**
 * Jours écoulés depuis le dernier jour RÉELLEMENT travaillé.
 *
 * `null` = jamais rien produit (et c'est un fait, pas une inconnue).
 * La source est `serieDernierJour`, le champ que H3 (2026-10-14) a introduit
 * précisément parce que `lastActiveDate` est remis à aujourd'hui dès l'OUVERTURE
 * de l'application, sans aucun travail. Compter avec ce dernier ferait dire au
 * capitaine « tu as travaillé aujourd'hui » à un élève qui a seulement ouvert
 * l'app — exactement le genre de mensonge qu'on veut éviter.
 */
export function joursSansTravail(daily: DailyGoalConfig | undefined, maintenant: Date = new Date()): number | null {
  const dernier = daily?.serieDernierJour;
  if (typeof dernier !== 'string' || dernier.length === 0) return null;
  const ecart = ecartEnJours(dernier, jourLocal(maintenant));
  if (!Number.isFinite(ecart) || ecart < 0) return null;
  return ecart;
}

export interface EtatCapitaine {
  /** Invitation du moment, ou `null` si le capitaine se tait. */
  invitation: Invitation | null;
  /** L'élève ferme la bulle : elle se tait pour un temps. */
  ignorer: () => void;
  /** Recalcule immédiatement (après un travail terminé). */
  rafraichir: () => void;
}

export function useInvitationCapitaine(options: {
  daily: DailyGoalConfig | undefined;
  derniereUnite?: string | null;
  epreuveEnCours: boolean;
  /** Change de valeur quand l'élève travaille : force le recalcul. */
  signalTravail: number;
}): EtatCapitaine {
  const { daily, derniereUnite, epreuveEnCours, signalTravail } = options;
  const [version, setVersion] = useState(0);
  const [ignoreeMs, setIgnoreeMs] = useState<number>(() => derniereInvitationIgnoreeMs());
  const [maintenant, setMaintenant] = useState<Date>(() => new Date());
  const [erreurs, setErreurs] = useState(0);

  /**
   * LE COMPTEUR D'ERREURS ARRIVE EN DIFFÉRÉ — et ce n'est pas un détail.
   *
   * `utils/profilErreurs` lit la taxonomie des erreurs ; un import STATIQUE ici
   * tirait tout cela dans le bundle d'ENTRÉE, c'est-à-dire dans les premiers
   * octets que l'élève télécharge. Mesuré le 14/10/2026 : 166 Ko → 177 Ko
   * (+7 %) pour afficher parfois un message parlant de deux erreurs.
   *
   * Le cahier des charges est déjà écrit dans le dépôt (`poidsEntree.verrou`) :
   * les données non nécessaires au premier écran restent derrière un import
   * dynamique. La valeur initiale 0 est donc assumée : au pire, l'invitation
   * « reprends une erreur » apparaît quelques millisecondes plus tard — jamais
   * un message faux, puisque 0 erreur ne déclenche rien.
   */
  useEffect(() => {
    let vivant = true;
    import('../utils/profilErreurs')
      .then((m) => {
        if (vivant) setErreurs(m.totalErreurs());
      })
      .catch(() => {
        // Échec de chargement : on reste à 0. La bulle se tait sur ce motif,
        // elle ne prétend rien.
      });
    return () => {
      vivant = false;
    };
  }, [signalTravail, version]);

  // Un recalcule à l'ouverture de l'application : sans lui, la bulle afficherait
  // l'heure de la dernière session (potentiellement la veille au soir).
  useEffect(() => {
    setMaintenant(new Date());
    setIgnoreeMs(derniereInvitationIgnoreeMs());
  }, [signalTravail, version]);

  const invitation = useMemo(() => {
    const contexte: ContexteCapitaine = {
      heure: maintenant.getHours(),
      joursSansTravail: joursSansTravail(daily, maintenant),
      serie: serieAfficheeDepuisDaily(daily, maintenant),
      joursAccumules: cumulJoursDepuisDaily(daily),
      erreursAReprendre: erreurs,
      derniereUnite: derniereUnite ?? null,
      derniereInvitationIgnoreeMs: ignoreeMs > 0 ? ignoreeMs : null,
      maintenantMs: maintenant.getTime(),
      epreuveEnCours,
    };
    return invitationDuMoment(contexte);
  }, [daily, derniereUnite, epreuveEnCours, ignoreeMs, maintenant, erreurs]);

  const ignorer = useCallback(() => {
    const t = Date.now();
    marquerInvitationIgnoree(t);
    setIgnoreeMs(t);
  }, []);

  const rafraichir = useCallback(() => setVersion((v) => v + 1), []);

  return { invitation, ignorer, rafraichir };
}
