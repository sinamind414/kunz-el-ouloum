// etatEleve.ts — L'ÉTAT DE L'ÉLÈVE, LU UNE SEULE FOIS.
//
// C'est l'étape 2 du §9 de `docs/VISION_COACH_MORCHID_2026-10-15.md` :
//
//   « Un seul état de l'élève. Assembler les sept familles de signaux une fois,
//     dans un module unique, au lieu que chaque consommateur relise sa part. »
//
// LE DIAGNOSTIC QUI A MENÉ LÀ. Le capitaine lisait la série dans un coin, les
// erreurs dans un autre, l'épreuve ailleurs, la rubrique encore autre part (et
// `App.tsx` la relisait pour son propre compte). Chaque consommateur relisait sa
// tranche de stockage ; personne ne voyait l'élève. Ce module est le seul endroit
// qui rassemble les sept familles.
//
// ─────────────────────────────────────────────────────────────────────────────
// TROIS RÈGLES, ET ELLES SONT DÉLIBÉRÉES.
//
// 1. LA LECTURE NE MODIFIE RIEN. `assemblerEtatEleve` et `lireEtatEleve` sont
//    sans effet de bord : un état qui écrit pendant qu'il se calcule serait
//    intestable et se déclencherait à chaque rendu. Les écritures de la relation
//    (`marquerInvitationIgnoree`) existent, mais ce sont des fonctions DISTINCTES,
//    que seul l'appelant décide d'appeler.
//
// 2. LES FAMILLES LOURDES ENTRENT PAR INJECTION — et ce n'est pas une élégance,
//    c'est une contrainte mesurée. `utils/profilErreurs` traîne la taxonomie
//    complète (+7 % du bundle d'ENTRÉE, mesuré le 14/10/2026) ; le diagnostic de
//    parcours traîne les séquences de leçons (286 Ko, sortis de l'entrée par M7).
//    Ce module est lu par la bulle, donc présent dans l'entrée : il ne peut pas
//    les importer statiquement. Chaque famille lourde porte donc `chargee: false`
//    tant que son propriétaire ne l'a pas fournie — et « pas encore connue »
//    produit le SILENCE, jamais une valeur inventée.
//    Les types des familles lourdes sont importés en `import type` : effacés à la
//    compilation, ils ne coûtent rien.
//
// 3. L'ÉTAT EST DATÉ, L'HORLOGE N'EST PAS LUE EN DOUCHE. `assemblerEtatEleve`
//    reçoit `maintenant` ; c'est la seule façon de tester « à 22 h, il se tait »
//    sans voyager dans le temps. `lireEtatEleve` est la seule fonction qui touche
//    au stockage, et elle le fait en UN passage.
//
// CE QUE CE MODULE DÉDUIT DEPUIS L'ÉTAPE 3 (15/10/2026, soir) : la PHASE de
// l'élève, par la fonction pure `deduirePhase` de `phaseEleve.ts`. Le partage
// reste net, et c'est ce qui rend les trois étapes testables séparément —
// ce module CONSTATE (les sept familles), `phaseEleve` DÉDUIT, et
// `invitationCapitaine` DÉCIDE. Aucun des trois ne déborde sur le suivant.

import {
  bilanBoucle,
  echecsParMotif,
  lireRegistre,
  motifsRetires,
  type BilanBoucle,
  type Registre,
} from './prescriptions';
import { doitParlerRubrique, rubriquesVues } from './conseilRubrique';
import { cumulJoursDepuisDaily, serieAfficheeDepuisDaily } from '../utils/activiteQuotidienne';
import { ecartEnJours, jourLocal } from '../utils/dayKey';
import { PALIERS_SERIE } from '../utils/serie';
import { BAC_EXAM_DATE_IS_PROVISIONAL, bacDaysLeft } from '../utils/dashboardActions';
import { deduirePhase, type PhaseEleve } from './phaseEleve';
import { RELAIS_VIDE, lireRelais, type Relais } from './relais';
import type { VerdictUnite } from './coach/diagnostic';
import type { ContexteCapitaine, EchecsMotif } from './invitationCapitaine';
import type { DailyGoalConfig } from '../types';

// ─────────────────────────────────────────────────────────────────────────────
// LES SEPT FAMILLES (§5.A du document de vision)
// ─────────────────────────────────────────────────────────────────────────────

/** 1. TEMPS — l'heure, le jour, et le nombre de jours sans rien produire. */
export interface FamilleTemps {
  maintenantMs: number;
  /** Heure locale 0-23. */
  heure: number;
  /** Jour local 'YYYY-MM-DD'. */
  jour: string;
  /**
   * Jours écoulés depuis le dernier jour RÉELLEMENT travaillé.
   * `null` = jamais rien produit — un fait, pas une inconnue.
   */
  joursSansTravail: number | null;
}

/** 2. HORIZON — les jours restants avant le BAC. Affiché depuis toujours, jamais décidé. */
export interface FamilleHorizon {
  joursAvantBac: number | null;
  /** La date est provisoire : le jour où elle sera officielle, un seul endroit change. */
  dateProvisoire: boolean;
}

/** 3. ASSIDUITÉ — série, cumul, palier. */
export interface FamilleAssiduite {
  /** Série de jours consécutifs affichée (0 = série morte). */
  serie: number;
  /** Cumul des jours travaillés — jamais remis à zéro. */
  cumulJours: number;
  /**
   * Le plus haut palier FRANCHI (7, 30) — ou `null` avant le premier.
   *
   * `serie.palierAtteint()` répond à une autre question : « ce total est-il
   * EXACTEMENT un palier ? », ce qui sert à féliciter le jour où on le franchit.
   * Ici on veut « où en est-il ? », donc on compare le cumul au seuil. Confondre
   * les deux ferait disparaître le palier dès le lendemain de sa conquête.
   */
  palierFranchi: number | null;
}

/** 4. COMPÉTENCE — les verdicts par unité (source : `coach/diagnostic`). */
export interface FamilleCompetence {
  /** `false` = pas encore fournie par son propriétaire (famille lourde). */
  chargee: boolean;
  verdicts: Readonly<Record<string, VerdictUnite>>;
  /** Unités faibles ou non commencées, dans l'ordre de travail. */
  faibles: readonly string[];
  /** L'unité que le coach désignerait d'abord, ou `null`. */
  unitePrioritaire: string | null;
}

/** 5. ERREURS — combien, laquelle domine, et le capital fermé (source : `profilErreurs`). */
export interface FamilleErreurs {
  /** `false` = pas encore fournie (famille lourde : taxonomie complète). */
  chargee: boolean;
  total: number;
  dominante: { code: string; occurrences: number } | null;
  /** Le seul capital qui ne se remet pas à zéro quand la série casse. */
  capital: { fermees: number; rouvertes: number; total: number };
}

/** 6. RELATION — ce que le capitaine a déjà dit, et ce que ça a donné. */
export interface FamilleRelation {
  /** Horodatage de la dernière invitation fermée par l'élève, ou `null`. */
  derniereIgnoreeMs: number | null;
  /** Motifs retirés après trois échecs : le capitaine se taît dessus. */
  motifsRetires: readonly string[];
  /** Émissions / issues, y compris le taux de suivi. */
  bilan: BilanBoucle;
  /**
   * Échecs par motif — la mémoire de l'ESCALADE (§5.D, étape 4).
   *
   * Le bilan dit combien de prescriptions ont été suivies ; ceci dit, pour chaque
   * motif, ce qui a échoué — de quoi choisir la FORME de la prochaine tentative.
   * Deux lectures différentes du même registre, rassemblées ici une fois.
   */
  echecsParMotif: Readonly<Record<string, EchecsMotif>>;
  /**
   * LE RELAIS HUMAIN (§5.D, 4ᵉ tentative — étape 5) : l'état brut, lu sur
   * l'appareil.
   *
   * Il est dans la famille « relation », et non dans une huitième famille, parce
   * qu'il décrit la même chose qu'elle : ce qui existe entre l'élève et ce qui
   * l'accompagne. Le nom qu'un élève confie ne doit pas devenir une catégorie de
   * données de plus — il est un état de la relation, et il s'oublie d'un geste.
   */
  relais: Relais;
}

/** 7. CONTEXTE — l'épreuve en cours, la rubrique ouverte. */
export interface FamilleContexte {
  /** Une épreuve est en cours : le capitaine se tait, sans exception. */
  epreuveEnCours: boolean;
  rubriqueOuverte: string | null;
  /** Le conseil d'entrée de rubrique reste à montrer (jamais encore vu). */
  conseilRubriqueAPrendre: boolean;
}

export interface EtatEleve {
  /**
   * LA PHASE, DÉDUITE — cinquième et dernière pièce de l'état (§5.B).
   *
   * Elle est calculée à partir des six autres familles, jamais déclarée par
   * l'élève. Elle est ici, et pas chez le consommateur, pour une raison simple :
   * deux écrans qui la déduiraient chacun de leur côté finiraient par en déduire
   * deux choses différentes — c'est exactement le défaut que l'étape 2 a réparé.
   */
  phase: PhaseEleve;
  temps: FamilleTemps;
  horizon: FamilleHorizon;
  assiduite: FamilleAssiduite;
  competence: FamilleCompetence;
  erreurs: FamilleErreurs;
  relation: FamilleRelation;
  contexte: FamilleContexte;
}

// ─────────────────────────────────────────────────────────────────────────────
// LA MÉMOIRE DE LA RELATION, CÔTÉ STOCKAGE
// ─────────────────────────────────────────────────────────────────────────────

const CLE_IGNOREE = 'boussole_capitaine_invitation_ignoree';

/** Horodatage du dernier message fermé par l'élève (0 si jamais). */
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

/**
 * L'élève a fermé la bulle : on se tait un moment (loi 1, version inverse).
 *
 * ÉCRITURE — à appeler explicitement, jamais depuis la lecture de l'état.
 */
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
export function joursSansTravail(
  daily: DailyGoalConfig | undefined,
  maintenant: Date = new Date(),
): number | null {
  const dernier = daily?.serieDernierJour;
  if (typeof dernier !== 'string' || dernier.length === 0) return null;
  const ecart = ecartEnJours(dernier, jourLocal(maintenant));
  if (!Number.isFinite(ecart) || ecart < 0) return null;
  return ecart;
}

// ─────────────────────────────────────────────────────────────────────────────
// L'ASSEMBLAGE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Ce que l'appelant sait déjà, ou peut fournir.
 *
 * Tout est facultatif sauf `daily` et `maintenant` : un appelant qui ne fournit
 * pas une famille lourde obtient une famille honnêtement VIDE (`chargee: false`),
 * jamais une valeur devinée.
 */
export interface EntreesEtatEleve {
  daily: DailyGoalConfig | undefined;
  /** L'horloge, en paramètre : l'état est daté, jamais « maintenant » implicite. */
  maintenant: Date;
  derniereUnite?: string | null;
  epreuveEnCours?: boolean;
  rubrique?: string | null;
  /**
   * La rubrique ouverte a-t-elle un conseil à montrer ? Fourni par l'appelant,
   * qui seul connaît le contenu (`data/conseilsRubrique.ts`) sans le faire entrer
   * dans l'entrée du bundle.
   */
  rubriqueAUnConseil?: boolean;
  /** Famille lourde — `profilErreurs`. Absente = pas encore chargée. */
  erreurs?: Omit<FamilleErreurs, 'chargee'> | null;
  /** Famille lourde — `coach/diagnostic`. Absente = pas encore calculée. */
  competence?: Omit<FamilleCompetence, 'chargee'> | null;
  /** Lectures de stockage, injectées par `lireEtatEleve`. */
  registre?: Registre;
  ignoreeMs?: number;
  rubriquesDejaVues?: readonly string[];
  /** Lecture de stockage — le relais nommé par l'élève (étape 5). */
  relais?: Relais;
}

/**
 * Assemble les sept familles. FONCTION PURE : aucun accès au stockage, aucune
 * écriture, aucun appel à l'horloge — `maintenant` est reçu.
 */
export function assemblerEtatEleve(entrees: EntreesEtatEleve): EtatEleve {
  const { daily, maintenant } = entrees;
  const maintenantMs = maintenant.getTime();
  const jour = jourLocal(maintenant);

  const registre = entrees.registre ?? { prescriptions: [], motifs: {} };
  const ignoreeMs = entrees.ignoreeMs ?? 0;
  const cumul = cumulJoursDepuisDaily(daily);
  const palierFranchi = PALIERS_SERIE.filter((seuil) => cumul >= seuil).pop() ?? null;

  // Les six familles d'abord, la phase ensuite : elle se déduit d'elles.
  const etat: EtatEleve = {
    // Provisoire — remplacée juste après, une fois les familles assemblées.
    phase: { niveau: 1, besoin: 'porte_2_minutes', creux: false },
    temps: {
      maintenantMs,
      heure: maintenant.getHours(),
      jour,
      joursSansTravail: joursSansTravail(daily, maintenant),
    },
    horizon: {
      joursAvantBac: bacDaysLeft(maintenant),
      dateProvisoire: BAC_EXAM_DATE_IS_PROVISIONAL,
    },
    assiduite: {
      serie: serieAfficheeDepuisDaily(daily, maintenant),
      cumulJours: cumul,
      palierFranchi,
    },
    competence: entrees.competence
      ? { chargee: true, ...entrees.competence }
      : { chargee: false, verdicts: {}, faibles: [], unitePrioritaire: null },
    erreurs: entrees.erreurs
      ? { chargee: true, ...entrees.erreurs }
      : {
          chargee: false,
          total: 0,
          dominante: null,
          capital: { fermees: 0, rouvertes: 0, total: 0 },
        },
    relation: {
      derniereIgnoreeMs: ignoreeMs > 0 ? ignoreeMs : null,
      motifsRetires: motifsRetires(registre),
      bilan: bilanBoucle(maintenantMs, registre),
      echecsParMotif: echecsParMotif(registre),
      // Absent ⇒ `RELAIS_VIDE` : « personne de nommé » se dit par un fait, jamais
      // par un nom deviné.
      relais: entrees.relais ?? RELAIS_VIDE,
    },
    contexte: {
      epreuveEnCours: entrees.epreuveEnCours === true,
      rubriqueOuverte: entrees.rubrique ?? null,
      conseilRubriqueAPrendre: doitParlerRubrique(
        entrees.rubrique,
        entrees.rubriquesDejaVues ?? [],
        entrees.rubriqueAUnConseil === true,
      ),
    },
  };
  return { ...etat, phase: deduirePhase(etat) };
}

/**
 * LA seule fonction de ce module qui touche au stockage — et elle lit, en un
 * passage : le registre de la boucle, la mémoire du silence, les rubriques vues.
 *
 * `daily` vient de l'état React de l'appelant, pas du stockage : ce n'est pas une
 * exception, c'est la même donnée, déjà lue une fois au démarrage de l'app.
 */
export function lireEtatEleve(entrees: Omit<EntreesEtatEleve, 'registre' | 'ignoreeMs' | 'rubriquesDejaVues'>): EtatEleve {
  const maintenantMs = entrees.maintenant.getTime();
  return assemblerEtatEleve({
    ...entrees,
    registre: lireRegistre(maintenantMs),
    // La relecture paresseuse des expirations est faite par `lireRegistre` : un
    // état qu'on consulte tous les jours ne peut pas laisser une prescription
    // « en attente » pour toujours.
    ignoreeMs: derniereInvitationIgnoreeMs(),
    rubriquesDejaVues: rubriquesVues(),
    // Le relais humain : le nom qu'un élève a confié reste ici, sur l'appareil,
    // et remonte par la famille « relation » comme le reste de l'état.
    relais: lireRelais(),
  });
}

/**
 * Traduction vers le contexte du capitaine — l'adaptateur, et rien d'autre.
 *
 * Il est ici, et pas dans la bulle, pour une raison précise : le jour où la
 * décision changera (étape 4), c'est CETTE fonction qu'il faudra regarder, sans
 * toucher au module pur `invitationCapitaine` ni à la lecture de l'état.
 */
export function contexteCapitaine(etat: EtatEleve, derniereUnite?: string | null): ContexteCapitaine {
  return {
    heure: etat.temps.heure,
    joursSansTravail: etat.temps.joursSansTravail,
    serie: etat.assiduite.serie,
    joursAccumules: etat.assiduite.cumulJours,
    erreursAReprendre: etat.erreurs.total,
    derniereUnite: derniereUnite ?? null,
    derniereInvitationIgnoreeMs: etat.relation.derniereIgnoreeMs,
    maintenantMs: etat.temps.maintenantMs,
    epreuveEnCours: etat.contexte.epreuveEnCours,
    motifsRetires: etat.relation.motifsRetires,
    // Étape 3 : la phase et l'horizon entrent dans la DÉCISION. La date du BAC
    // était affichée depuis toujours sans rien décider — voici où elle décide.
    sprint: etat.phase.niveau === 5,
    joursAvantBac: etat.horizon.joursAvantBac,
    // Étape 4 : la mémoire des échecs permet de NE PAS répéter la même forme.
    echecsParMotif: etat.relation.echecsParMotif,
    // Étape 5 : le relais humain. L'adaptateur le transmet TEL QUEL — le module
    // pur décide de la question, il ne connaît ni le stockage ni la façon dont le
    // nom est écrit.
    relais: etat.relation.relais,
  };
}
