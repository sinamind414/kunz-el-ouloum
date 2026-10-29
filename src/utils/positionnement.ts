/*
 * positionnement.ts — TRANCHE P0-3 (2026-10-29) : état du TEST DE
 * POSITIONNEMENT et de l'OBJECTIF DE NOTE BAC.
 *
 * Motif identique aux autres stores du dépôt (parcoursProgress, examLog) :
 * helpers dédiés, lecture défensive (try/catch → défaut sain), écriture
 * best-effort — JAMAIS d'accès direct au store depuis un composant.
 *
 * HONNÊTÉ DE LA MESURE : le résultat provient d'un test COURT de positionnement
 * (18 items, plan P0-3 : cible 15-22), PAS d'un sujet BAC intégral. La note
 * dérivée est donc étiquetée « تقدير أولي » partout où elle s'affiche — le
 * moteur ne doit jamais la présenter comme une note réelle.
 */

export interface ResultatPositionnement {
  /** Horodatage (ms) de la fin du test. */
  at: number;
  correct: number;
  total: number;
  /** Pourcentage arrondi 0-100. */
  percent: number;
  /** Note estimée /20 dérivée du pourcentage — TOUJOURS présentée comme « تقدير ». */
  noteEstimee: number;
}

export interface EtatPositionnement {
  resultat: ResultatPositionnement | null;
  /** Note cible /20 choisie par l'élève (5-20, entier). null = pas encore fixé. */
  objectifNote: number | null;
}

const CLE = 'kunz_positionnement_v1';

export const OBJECTIF_MIN = 5;
export const OBJECTIF_MAX = 20;

const ETAT_VIDE: EtatPositionnement = { resultat: null, objectifNote: null };

export function chargerPositionnement(): EtatPositionnement {
  if (typeof window === 'undefined') return { ...ETAT_VIDE };
  try {
    const brut = window.localStorage.getItem(CLE);
    if (!brut) return { ...ETAT_VIDE };
    const parse = JSON.parse(brut) as Partial<EtatPositionnement>;
    return {
      resultat: parse.resultat ?? null,
      objectifNote: typeof parse.objectifNote === 'number' ? parse.objectifNote : null,
    };
  } catch {
    return { ...ETAT_VIDE };
  }
}

/** Note /20 dérivée du pourcentage (0-100) — arrondi mathématique assumé. */
export function noteSur20(percent: number): number {
  return Math.round((Math.max(0, Math.min(100, percent)) * 20) / 100);
}

export function enregistrerResultat(correct: number, total: number): ResultatPositionnement {
  const percent = total > 0 ? Math.round((correct / total) * 100) : 0;
  const resultat: ResultatPositionnement = {
    at: Date.now(),
    correct,
    total,
    percent,
    noteEstimee: noteSur20(percent),
  };
  const etat = chargerPositionnement();
  sauverEtat({ ...etat, resultat });
  return resultat;
}

/**
 * Fixe l'objectif de note (5-20, entier). Retourne false et ne modifie RIEN
 * sinon — la validation reste côté appelant pour afficher le message juste.
 */
export function enregistrerObjectifNote(note: number): boolean {
  if (!Number.isInteger(note) || note < OBJECTIF_MIN || note > OBJECTIF_MAX) return false;
  const etat = chargerPositionnement();
  sauverEtat({ ...etat, objectifNote: note });
  return true;
}

/** Libellé de palier (فصحى) honnête — seuils assumés, sans sur-promesse. */
export function libellePalier(percent: number): string {
  if (percent >= 85) return 'قوي';
  if (percent >= 60) return 'متوسط';
  if (percent >= 40) return 'يحتاج تثبيتاً';
  return 'ضعيف';
}

function sauverEtat(etat: EtatPositionnement): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(CLE, JSON.stringify(etat));
  } catch {
    /* localStorage plein/indisponible : l'état reste en mémoire de session */
  }
}
