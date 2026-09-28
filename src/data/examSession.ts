// examSession.ts — l'épreuve blanche survit à la mise en arrière-plan et au
// rechargement (sprint 44).
//
// Défaut corrigé ici, introduit au sprint 43 : le chronomètre incrémentait un
// compteur à chaque tick de `setInterval`. Deux conséquences, invisibles en
// développement et systématiques chez l'élève :
//
//   1. **les onglets en arrière-plan sont ralentis** par les navigateurs
//      mobiles (souvent 1 tick/minute au mieux, parfois aucun) : l'élève qui
//      consulte autre chose pendant vingt minutes retrouvait un chronomètre en
//      retard, donc un budget faux ;
//   2. **un rechargement remettait tout à zéro** — au milieu d'une épreuve de
//      4 h 30, c'est la fin de l'exercice.
//
// Correctif : on ne compte plus le temps, on le LIT. La session mémorise un
// horodatage de départ et un cumul ; le temps écoulé se déduit de l'horloge.
// Les ticks ne servent plus qu'à rafraîchir l'affichage.

export const EXAM_SESSION_KEY = 'kunz.examSession';

export interface ExamSession {
  /** Numéro du sujet blanc en cours. */
  numero: number;
  /** Minutes déjà accumulées lors des périodes précédentes. */
  cumulMinutes: number;
  /** Horodatage du démarrage de la période en cours, ou null si en pause. */
  demarreeA: number | null;
}

export const SESSION_VIDE: ExamSession = { numero: 1, cumulMinutes: 0, demarreeA: null };

function estFini(valeur: unknown): valeur is number {
  return typeof valeur === 'number' && Number.isFinite(valeur);
}

/** Lit la session en cours ; toute anomalie ramène à une session propre. */
export function readExamSession(): ExamSession {
  try {
    const brut = localStorage.getItem(EXAM_SESSION_KEY);
    if (!brut) return SESSION_VIDE;
    const p = JSON.parse(brut) as Partial<ExamSession>;
    return {
      numero: estFini(p.numero) && p.numero > 0 ? Math.round(p.numero) : SESSION_VIDE.numero,
      cumulMinutes: estFini(p.cumulMinutes) && p.cumulMinutes >= 0 ? p.cumulMinutes : 0,
      demarreeA: estFini(p.demarreeA) && p.demarreeA > 0 ? p.demarreeA : null,
    };
  } catch {
    return SESSION_VIDE;
  }
}

export function writeExamSession(session: ExamSession): void {
  try {
    localStorage.setItem(EXAM_SESSION_KEY, JSON.stringify(session));
  } catch {
    /* stockage indisponible : le chronomètre reste utilisable, sans mémoire */
  }
}

export function clearExamSession(): void {
  try {
    localStorage.removeItem(EXAM_SESSION_KEY);
  } catch {
    /* rien à faire */
  }
}

/**
 * Minutes écoulées, lues sur l'horloge et non comptées par les ticks.
 * `maintenant` est injectable pour les tests.
 */
export function minutesEcoulees(session: ExamSession, maintenant = Date.now()): number {
  const enCours = session.demarreeA ? Math.max(0, maintenant - session.demarreeA) / 60_000 : 0;
  return Math.floor(session.cumulMinutes + enCours);
}

/** Démarre ou reprend le chronomètre. */
export function demarrer(session: ExamSession, maintenant = Date.now()): ExamSession {
  if (session.demarreeA) return session;
  return { ...session, demarreeA: maintenant };
}

/** Met en pause en consolidant le temps de la période en cours. */
export function mettreEnPause(session: ExamSession, maintenant = Date.now()): ExamSession {
  if (!session.demarreeA) return session;
  const ecoule = Math.max(0, maintenant - session.demarreeA) / 60_000;
  return { numero: session.numero, cumulMinutes: session.cumulMinutes + ecoule, demarreeA: null };
}

/** Remet le chronomètre à zéro, en gardant le sujet. */
export function remettreAZero(session: ExamSession): ExamSession {
  return { numero: session.numero, cumulMinutes: 0, demarreeA: null };
}

/** Change de sujet : le chronomètre repart de zéro, sinon le budget ment. */
export function changerSujet(session: ExamSession, numero: number): ExamSession {
  return { numero: Math.max(1, Math.round(numero)), cumulMinutes: 0, demarreeA: null };
}
