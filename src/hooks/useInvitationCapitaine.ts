// useInvitationCapitaine.ts — CÂBLAGE DE LA BULLE DU CAPITAINE.
//
// Le module `lib/invitationCapitaine.ts` est PUR (contexte → invitation) : c'est
// ce qui permet de vérifier les 4 lois d'Atomic Habits par des tests. Ce hook
// fait le travail inverse et sale : lire l'état réel de l'élève, mémoriser les
// messages ignorés, et ne rien calculer de plus.
//
// ─────────────────────────────────────────────────────────────────────────────
// CE QUE CE HOOK A APPRIS À FAIRE LE 15/10/2026 — LA BOUCLE.
//
// Avant : la bulle s'affichait, et le seul retour retenu était « il a fermé ».
// Après : chaque parole devient une PRESCRIPTION TRACÉE (`lib/prescriptions.ts`),
// avec une issue. Trois gestes, trois significations :
//
//   · l'invitation est AFFICHÉE      → `emettrePrescription`  (en attente)
//   · l'élève clique « agir »        → `accepter`   (intention, pas travail)
//   · l'élève ferme la bulle         → `ignorer`    (la demande n'a pas passé)
//   · du TRAVAIL MESURÉ a lieu       → `marquerSuivie`, appelé par
//                                      `activiteQuotidienne` — pas ici, parce que
//                                      c'est le seul endroit qui atteste d'un
//                                      travail réel plutôt que d'un clic.
//
// Et une conséquence déjà active : un motif qui a échoué trois fois est RETIRÉ
// (`motifsRetires`), donc le capitaine se tait sur ce motif au lieu de le répéter.
//
// ─────────────────────────────────────────────────────────────────────────────
// CE QUE CE HOOK A APPRIS LE 15/10/2026 (SOIR) — L'ÉTAT UNIQUE.
//
// Il construisait son contexte à la main, en piochant lui-même dans quatre
// sources : la série, le cumul, le registre, la mémoire du silence. `App.tsx`
// relisait la rubrique de son côté. Chaque consommateur lisait sa tranche.
//
// Depuis, l'assemblage est fait UNE fois par `lib/etatEleve.ts` (étape 2 du §9 du
// document de vision), et ce hook ne fait plus que deux choses : demander l'état,
// et le traduire en contexte pour le module pur `invitationCapitaine`. Les deux
// fonctions de lecture qui vivaient ici (`joursSansTravail`,
// `derniereInvitationIgnoreeMs`) sont parties avec la famille qu'elles servent ;
// elles restent réexportées pour ne casser aucun appelant.
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
import { invitationDuMoment, relaisDuMoment, type Invitation } from '../lib/invitationCapitaine';
import type { QuestionRelais } from '../lib/relais';
import { emettrePrescription, marquerAcceptee, marquerIgnoree } from '../lib/prescriptions';
import { classerParUrgence, diagnostiquerParcours } from '../lib/coach/diagnostic';
import { PARCOURS_DOMAINS } from '../lib/parcours/parcoursPath';
import {
  derniereUniteTouchee,
  loadParcours,
} from '../lib/parcours/parcoursProgress';
import {
  contexteCapitaine,
  derniereInvitationIgnoreeMs,
  joursSansTravail,
  lireEtatEleve,
  marquerInvitationIgnoree,
  type EtatEleve,
  type FamilleCompetence,
  type FamilleErreurs,
} from '../lib/etatEleve';
import type { DailyGoalConfig } from '../types';

// Réexport : ces trois fonctions vivaient ici avant l'état unique (elles servent
// la famille « temps » et « relation », désormais assemblées dans `etatEleve`).
// Les garder au même endroit évite de casser un appelant qui les importerait.
export { derniereInvitationIgnoreeMs, joursSansTravail, marquerInvitationIgnoree };

export interface EtatCapitaine {
  /** Invitation du moment, ou `null` si le capitaine se tait. */
  invitation: Invitation | null;
  /**
   * L'état de l'élève, assemblé UNE fois par `lib/etatEleve.ts`.
   *
   * Exposé parce que d'autres écrans lisent les mêmes familles : `App.tsx` s'en
   * sert pour le conseil d'entrée de rubrique, qui relisait `rubriquesVues()` de
   * son côté. Un seul assemblage, plusieurs consommateurs — c'est exactement
   * l'étape 2, et l'exposer est ce qui la rend réelle.
   */
  etat: EtatEleve;
  /**
   * LA QUESTION DU RELAIS HUMAIN, ou `null` (§5.D, 4ᵉ tentative — étape 5).
   *
   * Elle n'est pas une `Invitation` : elle ne devient pas une prescription, elle
   * ne compte pas comme un échec, et elle n'est affichée que quand le capitaine
   * peut parler. Quand elle existe, `invitation` vaut `null` — le relais est
   * seul à parler.
   */
  relais: QuestionRelais | null;
  /** L'élève ferme la bulle : elle se tait pour un temps. */
  ignorer: () => void;
  /** L'élève clique « agir » : intention mémorisée, pas travail. */
  accepter: () => void;
  /** Recalcule immédiatement (après un travail terminé). */
  rafraichir: () => void;
}

export function useInvitationCapitaine(options: {
  daily: DailyGoalConfig | undefined;
  derniereUnite?: string | null;
  epreuveEnCours: boolean;
  /** Change de valeur quand l'élève travaille : force le recalcul. */
  signalTravail: number;
  /** Rubrique ouverte — famille « contexte », pour le conseil d'entrée. */
  rubrique?: string | null;
  /** Cette rubrique a-t-elle un conseil ? (le contenu reste chez l'appelant) */
  rubriqueAUnConseil?: boolean;
}): EtatCapitaine {
  const { daily, derniereUnite, epreuveEnCours, signalTravail, rubrique, rubriqueAUnConseil } = options;
  const [version, setVersion] = useState(0);
  const [ignoreeMs, setIgnoreeMs] = useState<number>(() => derniereInvitationIgnoreeMs());
  const [maintenant, setMaintenant] = useState<Date>(() => new Date());
  /**
   * La famille « erreurs », une fois sa source chargée — ou `null` tant qu'elle
   * ne l'est pas. « Pas encore connue » se traduit par `chargee: false` dans
   * l'état, jamais par un chiffre inventé.
   */
  const [familleErreurs, setFamilleErreurs] = useState<Omit<FamilleErreurs, 'chargee'> | null>(null);

  /**
   * AUDIT CAPITAINE §6.1 (2026-10-17) : LA FAMILLE « COMPÉTENCE » EST LUE ICI.
   * Elle n'avait AUCUN fournisseur : `chargee: false` à vie, la phase 4
   * (Consolidation) était inatteignable — `verdictsConsolides` exige une
   * famille chargée. Même discipline que la famille erreurs : le diagnostic
   * du parcours (`parcoursMeta`, séquences de leçons — 286 Ko, sortis de
   * l'entrée par M7) entre par import DYNAMIQUE. Le module du verdict
   * (`coach/diagnostic`) est léger : statique. Un parcours vide produit des
   * verdicts « non_commence » — un fait, pas une valeur inventée.
   */
  const [familleCompetence, setFamilleCompetence] = useState<Omit<FamilleCompetence, 'chargee'> | null>(null);

  useEffect(() => {
    let vivant = true;
    import('../lib/parcours/parcoursMeta')
      .then((meta) => {
        if (!vivant) return;
        const diags = diagnostiquerParcours(
          PARCOURS_DOMAINS.flatMap((d) => d.units),
          loadParcours(),
          meta.scoreLivreUnite,
        );
        const ordre = classerParUrgence(diags);
        setFamilleCompetence({
          verdicts: Object.fromEntries(ordre.map((d) => [d.titre, d.verdict])),
          faibles: ordre
            .filter((d) => d.verdict === 'faible' || d.verdict === 'non_commence')
            .map((d) => d.titre),
          unitePrioritaire: ordre[0]?.titre ?? null,
        });
      })
      .catch(() => {
        // Échec de chargement : la famille reste silencieuse, elle ne prétend rien.
      });
    return () => {
      vivant = false;
    };
  }, [signalTravail, version]);

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
        if (!vivant) return;
        const dominante = m.erreurDominante();
        setFamilleErreurs({
          total: m.totalErreurs(),
          dominante: dominante ? { code: dominante.code, occurrences: dominante.occurrences } : null,
          capital: m.capitalErreurs(),
        });
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

  // Audit Capitaine §6.1 (suite) : le RETOUR DE VISIBILITÉ est un évènement qui
  // compte — l'écran veille des téléphones laissait la bulle sur l'heure de la
  // veille, un aveu mensonger. L'horloge, le silence et les familles différées
  // (erreurs, compétence) sont relus en revenant.
  useEffect(() => {
    const auRetour = () => {
      if (document.visibilityState !== 'visible') return;
      setVersion((v) => v + 1);
    };
    document.addEventListener('visibilitychange', auRetour);
    return () => document.removeEventListener('visibilitychange', auRetour);
  }, []);

  /**
   * Audit Capitaine §6.2 : l'unité « dernière » réelle. L'appelant fournissait
   * `units[0]?.title` — le PREMIER titre du catalogue, à tout le monde. Faute
   * de prop, le témoin honnête est le parcours (`derniereUniteTouchee`), relu
   * aux mêmes évènements que le reste de l'état.
   */
  const [derniereUniteResolue, setDerniereUniteResolue] = useState<string | null>(() =>
    derniereUnite === undefined ? derniereUniteTouchee() : (derniereUnite ?? null),
  );
  useEffect(() => {
    setDerniereUniteResolue(derniereUnite === undefined ? derniereUniteTouchee() : (derniereUnite ?? null));
  }, [derniereUnite, signalTravail, version]);

  /**
   * L'ÉTAT DE L'ÉLÈVE — assemblé UNE fois, ici, par le module qui en a la charge.
   *
   * Ce bloc remplace la construction manuelle du contexte : le hook piochait
   * lui-même dans quatre sources (série, cumul, registre, silence), et chacun de
   * ses voisins faisait pareil de son côté. Il ne reste ici qu'un appel.
   */
  const etat = useMemo(
    () =>
      lireEtatEleve({
        daily,
        maintenant,
        derniereUnite: derniereUniteResolue,
        epreuveEnCours,
        rubrique: rubrique ?? null,
        rubriqueAUnConseil,
        erreurs: familleErreurs,
        competence: familleCompetence,
      }),
    [daily, maintenant, derniereUniteResolue, epreuveEnCours, rubrique, rubriqueAUnConseil, familleErreurs, familleCompetence, ignoreeMs],
  );

  /**
   * LES DEUX VOIX, ET UNE SEULE QUI PARLE.
   *
   * L'arbitrage n'est pas ici : `invitationDuMoment` rend `null` dès que le
   * relais humain a quelque chose à demander (`relaisDuMoment`), et c'est le
   * module pur qui en décide. Ce bloc se contente de demander les deux — dans
   * cet ordre, pour qu'on lise la règle dans le sens où elle s'applique.
   */
  const { invitation, relais } = useMemo(() => {
    const contexte = contexteCapitaine(etat, derniereUniteResolue);
    const question = relaisDuMoment(contexte);
    const duMoment = invitationDuMoment(contexte);
    if (duMoment) {
      // La parole affichée est une prescription TRACÉE. Sans cette ligne, le
      // capitaine reparlerait demain exactement pareil — c'était le défaut.
      // `emettrePrescription` refuse un doublon encore en attente, donc un rendu
      // rejoué (React StrictMode) ne fabrique pas deux prescriptions.
      //
      // Le relais, lui, n'entre JAMAIS ici : `QuestionRelais` n'est pas une
      // `Invitation`, et le compilateur l'interdit. Une conversation entre deux
      // personnes ne doit pas devenir un compteur d'échecs.
      emettrePrescription(duMoment, { erreurCode: etat.erreurs.dominante?.code }, etat.temps.maintenantMs);
    }
    return { invitation: duMoment, relais: question };
  }, [etat, derniereUniteResolue]);

  /**
   * L'élève ferme la bulle.
   *
   * Deux écritures, et elles ne disent pas la même chose :
   *   · `marquerInvitationIgnoree` — le silence de 6 h (comportement historique) ;
   *   · `marquerIgnoree`           — l'ISSUE de la prescription : cette demande
   *     n'a pas passé. C'est ce compteur qui, au troisième échec, retire le motif.
   */
  const ignorer = useCallback(() => {
    const t = Date.now();
    marquerInvitationIgnoree(t);
    marquerIgnoree(t);
    setIgnoreeMs(t);
  }, []);

  /**
   * L'élève clique « agir » : il l'a lue et il a voulu.
   *
   * Ce n'est PAS un travail — c'est une intention, et elle est mémorisée comme
   * telle (`accepteMs`). La distinction compte : un motif qui n'est jamais
   * accepté n'a pas été vu ; un motif souvent accepté mais jamais suivi a un
   * problème de format, pas de message. Sans cette séparation, on ne saurait pas
   * laquelle des deux corrections apporter.
   */
  const accepter = useCallback(() => {
    marquerAcceptee(Date.now());
  }, []);

  const rafraichir = useCallback(() => setVersion((v) => v + 1), []);

  return { invitation, relais, etat, ignorer, accepter, rafraichir };
}
