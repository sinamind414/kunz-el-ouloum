// tadwinEngine.ts — التدوين الشامل — orchestrateur runtime V1.
//
// Assemble les briques validées en un parcours d'apprentissage à 5 paliers :
//   · C2 (couverture par-clé)        → lib/validation/couvCle.ts (calibré §8)
//   · C3 (concision / anti-bourrage) → lib/validation/stuffingDetector.ts
//   · C4 (exactitude / négation)     → lib/validation/negationAr.ts (intégré à couvCle)
//   · 5 paliers à libération graduelle (fading) — Spec §5
//   · rappel espacé J+1/3/7/14       → data/store.ts (REVIEW_INTERVALS_DAYS)
//
// Périmètre V1 : C1 anti-copie et دفتر الأخطاء restent en V1.5. Aucune note ne
// remonte dans evaluerCopies/supervision : le verdict est labellisé
// « تقييم التدوين — ليست نقطة البكالوريا ».
//
// Non câblé dans App.tsx (fichier protégé) — l'UI viendra brancher ces
// fonctions pures ; toute la logique est testable sans React.

import { detecterStuffing, type StuffingResult } from '../validation/stuffingDetector';
import {
  evaluerC2,
  type ChoixCles,
  type ResultatCle,
  type ResultatC2,
} from '../validation/couvCle';
import {
  readRaw,
  writeRaw,
  computeNextReviewAt,
  REVIEW_INTERVALS_DAYS,
  DAY_MS,
} from '../../data/store';

// ──────────────────────────────────────────────────────────────────────────────
// Paliers (Spec §5) — libération graduelle de la responsabilité + fading
// ──────────────────────────────────────────────────────────────────────────────

export interface ConfigPalier {
  palier: number;
  nomAr: string;
  nomFr: string;
  /** Les mots-clés sont donnés, l'élève n'écrit que la clé 1 (mécanisme). */
  gabaritPreRempli: boolean;
  /** L'élève peut demander un indice à la demande. */
  indicesAutorises: boolean;
  /** Alerte bourrage en direct pendant la frappe (R3). */
  alerteBourrageDirect: boolean;
  /** Étape de sélection de 2-3 clés parmi les 3 prescrites (donne le dénominateur de C2). */
  selectionCles: boolean;
  /** Chronomètre doux (FocusTimer). */
  chronometreDoux: boolean;
  /** La production est notée (C2-C4) avec verdict + conseil. */
  notationActive: boolean;
  /** Rappel espacé actif sur les propres fiches (carnet masqué). */
  rappelActif: boolean;
  /** Le carnet est masqué : restitution de mémoire. */
  carnetMasque: boolean;
}

export const PALIERS: readonly ConfigPalier[] = [
  {
    palier: 0,
    nomAr: 'الصدمة',
    nomFr: 'La preuve',
    gabaritPreRempli: false,
    indicesAutorises: false,
    alerteBourrageDirect: false,
    selectionCles: false,
    chronometreDoux: false,
    notationActive: false,
    rappelActif: true,
    carnetMasque: false,
  },
  {
    palier: 1,
    nomAr: 'موجّه',
    nomFr: 'Guidé (modelage + gabarit pré-rempli)',
    gabaritPreRempli: true,
    indicesAutorises: true,
    alerteBourrageDirect: false,
    selectionCles: false,
    chronometreDoux: false,
    notationActive: false,
    rappelActif: false,
    carnetMasque: false,
  },
  {
    palier: 2,
    nomAr: 'مُساعَد',
    nomFr: 'Assisté (pratique guidée + retour en direct)',
    gabaritPreRempli: false,
    indicesAutorises: true,
    alerteBourrageDirect: true,
    selectionCles: false,
    chronometreDoux: false,
    notationActive: false,
    rappelActif: false,
    carnetMasque: false,
  },
  {
    palier: 3,
    nomAr: 'مستقل',
    nomFr: 'Autonome (production notée)',
    gabaritPreRempli: false,
    indicesAutorises: false,
    alerteBourrageDirect: false,
    selectionCles: true,
    chronometreDoux: true,
    notationActive: true,
    rappelActif: false,
    carnetMasque: false,
  },
  {
    palier: 4,
    nomAr: 'التثبيت',
    nomFr: 'Consolidation (rappel espacé)',
    gabaritPreRempli: false,
    indicesAutorises: false,
    alerteBourrageDirect: false,
    selectionCles: false,
    chronometreDoux: false,
    notationActive: false,
    rappelActif: true,
    carnetMasque: true,
  },
];

export const PALIER_MIN = 0;
export const PALIER_MAX = PALIERS.length - 1;

export function configPalier(palier: number): ConfigPalier {
  const idx = Math.max(PALIER_MIN, Math.min(PALIER_MAX, palier));
  return PALIERS[idx];
}

// ──────────────────────────────────────────────────────────────────────────────
// État du module + carnet de fiches (localStorage, style store.ts)
// ──────────────────────────────────────────────────────────────────────────────

const CLE_PALIER = 'kunz_tadwin_etat_v1';
const CLE_FICHES = 'kunz_tadwin_fiches_v1';
const MAX_FICHES = 200;

export interface EtatTadwin {
  uniteId: number;
  palier: number;
  /** Défi 3 jours : horodatage de démarrage (undefined = défi non démarré). */
  defiDebutAt?: number;
}

export type MaitriseFiche = 'en_cours' | 'maitrise';

export interface FicheTadwin {
  id: string;
  uniteId: number;
  clesChoisies: string[];
  reponse: string;
  c2: number;
  stuffingDetecte: boolean;
  palier: number;
  creeLe: number;
  rappelStage: number;
  prochainRappelAt: number;
  dernierRappelAt?: number;
  maitrise: MaitriseFiche;
}

export function etatParDefaut(): EtatTadwin {
  return { uniteId: 1, palier: PALIER_MIN };
}

export function lireEtat(): EtatTadwin {
  const raw = readRaw(CLE_PALIER);
  if (!raw || typeof raw !== 'object') return etatParDefaut();
  const e = raw as Partial<EtatTadwin>;
  return {
    uniteId: Number.isFinite(e.uniteId) ? (e.uniteId as number) : 1,
    palier: Number.isInteger(e.palier) ? Math.max(PALIER_MIN, Math.min(PALIER_MAX, e.palier as number)) : PALIER_MIN,
    defiDebutAt: Number.isFinite(e.defiDebutAt) ? e.defiDebutAt : undefined,
  };
}

export function ecrireEtat(etat: EtatTadwin): void {
  writeRaw(CLE_PALIER, etat);
}

export function lireFiches(): FicheTadwin[] {
  const raw = readRaw(CLE_FICHES);
  if (!Array.isArray(raw)) return [];
  return raw.filter((f): f is FicheTadwin =>
    !!f && typeof f === 'object' && typeof (f as FicheTadwin).id === 'string',
  );
}

export function ecrireFiches(fiches: FicheTadwin[]): void {
  // Limite du carnet : on garde les plus récentes (comme MAX_RESOLVED_ERRORS).
  const triees = [...fiches].sort((a, b) => b.creeLe - a.creeLe);
  writeRaw(CLE_FICHES, triees.slice(0, MAX_FICHES));
}

// ──────────────────────────────────────────────────────────────────────────────
// Verdict (palier 3) — C3 + C2 + C4, un seul conseil actionnable
// ──────────────────────────────────────────────────────────────────────────────

export const ETIQUETTE_NOTATION = 'تقييم التدوين — ليست نقطة البكالوريا';

export interface ResultatTadwin {
  c2: number;
  detail: ResultatCle[];
  stuffing: StuffingResult;
  verdictAr: string;
  conseilAr: string;
  etiquetteAr: string;
  /** Première clé non couverte — la cible du conseil. */
  cleLaPlusFaible?: string;
}

/** Retour en direct des paliers 1-2 : alerte bourrage uniquement (C3). */
export function retourDirect(reponse: string): { stuffing: StuffingResult; alerteAr: string | null } {
  const stuffing = detecterStuffing(reponse);
  return {
    stuffing,
    alerteAr: stuffing.stuffing_detected ? '⚠︎ تكرار — ابحث عن الزبدة' : null,
  };
}

/**
 * Évalue une production autonome (palier 3). C2 (par-clé, seuil 0,5 figé §8)
 * intègre déjà C4 (négation via negationAr.ts) ; C3 bloque le bourrage.
 *
 * {@link evaluerProduction} lève {@link ChoixClesInvalide} si le choix des clés
 * est incohérent (§6.1/§6.2) — on ne note pas un dénominateur sans valeur.
 */
export function evaluerProduction(reponse: string, choix: ChoixCles): ResultatTadwin {
  const stuffing = detecterStuffing(reponse);
  const c2res: ResultatC2 = evaluerC2(reponse, choix);

  const cleLaPlusFaible = c2res.manquantes[0];

  let verdictAr: string;
  let conseilAr: string;

  if (stuffing.stuffing_detected) {
    // C3 : le bourrage invalide la note — répéter un terme ne couvre pas une clé.
    verdictAr = 'تكرار لفظي مفرط — الزبدة لا تُبنى بالتكرار';
    conseilAr = `أعد الكتابة دون تكرار لفظ «${stuffing.most_frequent_word}» أكثر من مرة`;
  } else if (c2res.c2 === 1) {
    verdictAr = 'زبدة ممتازة — كل المفاتيح مغطاة';
    conseilAr = 'ثبّت هذه المفاتيح في راحة J+3، ثم انتقل إلى الوحدة الموالية';
  } else if (c2res.c2 >= 2 / 3) {
    verdictAr = 'زبدة جيدة جدًا — بقي مفتاح ناقص';
    conseilAr = cleLaPlusFaible
      ? `المفتاح الناقص: «${cleLaPlusFaible}» — اكتبه في جملة واحدة بأسلوبك`
      : 'راجع المفاتيح الناقصة';
  } else if (c2res.c2 > 0) {
    verdictAr = 'زبدة ناقصة — راجع المفاتيح الأساسية';
    conseilAr = cleLaPlusFaible
      ? `ابدأ بالمفتاح: «${cleLaPlusFaible}» — ما الآلية التي يلخصها؟`
      : 'راجع المفاتيح الناقصة';
  } else {
    verdictAr = 'لم تبلغ أي مفتاح بعد — أعد المحاولة';
    conseilAr = cleLaPlusFaible
      ? `المفتاح الأول: «${cleLaPlusFaible}» — حاول كتابة آليته في جملة`
      : 'راجع الدرس ثم أعد الكتابة بأسلوبك';
  }

  return {
    c2: stuffing.stuffing_detected ? 0 : c2res.c2,
    detail: c2res.detail,
    stuffing,
    verdictAr,
    conseilAr,
    etiquetteAr: ETIQUETTE_NOTATION,
    cleLaPlusFaible,
  };
}

// ──────────────────────────────────────────────────────────────────────────────
// Carnet — enregistrement d'une fiche après verdict (palier 3)
// ──────────────────────────────────────────────────────────────────────────────

function genererId(now: number): string {
  return `tadwin_${now}_${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Range la fiche dans le carnet et programme son premier rappel (J+1, stage 0
 * — ancré sur la création, jamais sur Date.now() seul, comme store.ts).
 */
export function enregistrerFiche(
  reponse: string,
  choix: ChoixCles,
  maintenant: number = Date.now(),
): FicheTadwin {
  const resultat = evaluerProduction(reponse, choix);
  const fiche: FicheTadwin = {
    id: genererId(maintenant),
    uniteId: choix.uniteId,
    clesChoisies: [...choix.clesChoisies],
    reponse,
    c2: resultat.c2,
    stuffingDetecte: resultat.stuffing.stuffing_detected,
    palier: 3,
    creeLe: maintenant,
    rappelStage: 0,
    prochainRappelAt: computeNextReviewAt(maintenant, 0, maintenant),
    maitrise: 'en_cours',
  };
  const fiches = lireFiches();
  ecrireFiches([...fiches, fiche]);
  return fiche;
}

// ──────────────────────────────────────────────────────────────────────────────
// Rappel espacé (palier 4) — stages J+1/3/7/14 de store.ts
// ──────────────────────────────────────────────────────────────────────────────

/** Remplace (ou ajoute) une fiche dans le carnet persisté. */
function remplacerFiche(fiche: FicheTadwin): void {
  const sans = lireFiches().filter((f) => f.id !== fiche.id);
  ecrireFiches([...sans, fiche]);
}

export function ficheDue(fiche: FicheTadwin, maintenant: number = Date.now()): boolean {
  return fiche.prochainRappelAt != null && maintenant >= fiche.prochainRappelAt;
}

/**
 * Marque une tentative de rappel (carnet masqué, restitution de mémoire).
 * Miroir de `applyEvidenceToError` : un échec redémarre la cadence à J+1
 * (l'ancre devient la tentative) ; une réussite à l'échéance avance le stage.
 * Au dernier stage (J+14) validé, la fiche passe en maîtrise.
 */
export function enregistrerRappel(
  fiche: FicheTadwin,
  reussi: boolean,
  maintenant: number = Date.now(),
): FicheTadwin {
  if (!reussi) {
    const echec: FicheTadwin = {
      ...fiche,
      rappelStage: 0,
      dernierRappelAt: maintenant,
      // On ancre la cadence sur la tentative ratée, pas sur la création.
      prochainRappelAt: computeNextReviewAt(maintenant, 0, maintenant),
      maitrise: 'en_cours',
    };
    remplacerFiche(echec);
    return echec;
  }

  if (!ficheDue(fiche, maintenant)) return fiche;

  const stage = Math.min(fiche.rappelStage + 1, REVIEW_INTERVALS_DAYS.length - 1);
  const termine = stage >= REVIEW_INTERVALS_DAYS.length - 1;
  const reussite: FicheTadwin = {
    ...fiche,
    rappelStage: stage,
    dernierRappelAt: maintenant,
    prochainRappelAt: computeNextReviewAt(fiche.creeLe, stage, maintenant),
    maitrise: termine ? 'maitrise' : 'en_cours',
  };
  remplacerFiche(reussite);
  return reussite;
}

/** Fiches du carnet dont le rappel est dû (palier 4). */
export function fichesDuees(maintenant: number = Date.now()): FicheTadwin[] {
  return lireFiches().filter((f) => ficheDue(f, maintenant));
}

// ──────────────────────────────────────────────────────────────────────────────
// Avancement des paliers — la grille est « une tentative terminée », jamais
// un seuil de note (la note est un outil de diagnostic, pas une barrière).
// ──────────────────────────────────────────────────────────────────────────────

export type EvenementPalier =
  | { type: 'rappel_tente' }          // palier 0 : la preuve de l'oubli (peu importe le résultat)
  | { type: 'cle1_ecrite' }           // palier 1 : clé mécanisme écrite dans le gabarit
  | { type: 'fiche_assistee_terminee' } // palier 2 : pratique guidée aboutie
  | { type: 'fiche_autonome_terminee' }; // palier 3 : production notée dans le carnet

const GATES: Record<number, EvenementPalier['type']> = {
  0: 'rappel_tente',
  1: 'cle1_ecrite',
  2: 'fiche_assistee_terminee',
  3: 'fiche_autonome_terminee',
};

/** Vrai si l'événement valide la grille du palier actuel (→ passage au suivant). */
export function palierValide(palier: number, evenement: EvenementPalier): boolean {
  const gate = GATES[Math.max(PALIER_MIN, Math.min(PALIER_MAX, palier))];
  return gate === evenement.type;
}

/**
 * Fait avancer l'état si l'événement valide la grille. Retourne un NOUVEL état
 * (immutabilité) et ne persiste rien — l'appelant décide (cf. ecrireEtat).
 * Au palier 4, on boucle : la consolidation ne se termine jamais.
 */
export function avancerPalier(
  etat: EtatTadwin,
  evenement: EvenementPalier,
): EtatTadwin {
  if (etat.palier >= PALIER_MAX) return etat;
  if (!palierValide(etat.palier, evenement)) return etat;
  return { ...etat, palier: etat.palier + 1 };
}

// ──────────────────────────────────────────────────────────────────────────────
// Défi 3 jours (objet d'engagement à l'entrée du module)
// ──────────────────────────────────────────────────────────────────────────────

const DUREE_DEFI_MS = 3 * DAY_MS;

export function demarrerDefi(maintenant: number = Date.now()): EtatTadwin {
  const etat = lireEtat();
  return { ...etat, defiDebutAt: maintenant };
}

export function defiEnCours(etat: EtatTadwin, maintenant: number = Date.now()): boolean {
  return etat.defiDebutAt != null && maintenant - etat.defiDebutAt < DUREE_DEFI_MS;
}

export function defiTermine(etat: EtatTadwin, maintenant: number = Date.now()): boolean {
  return etat.defiDebutAt != null && !defiEnCours(etat, maintenant);
}

// Export utilitaire pour les tests (jours restants du défi).
export function joursRestantsDefi(etat: EtatTadwin, maintenant: number = Date.now()): number {
  if (etat.defiDebutAt == null) return 0;
  return Math.max(0, Math.ceil((DUREE_DEFI_MS - (maintenant - etat.defiDebutAt)) / DAY_MS));
}
