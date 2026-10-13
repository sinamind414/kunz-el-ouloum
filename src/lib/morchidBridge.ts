// src/lib/morchidBridge.ts
// Pont contexte → « المرشد الذكي » (Morchid).
//
// Depuis la restructuration du 2026-10-11, le المرشد n'est plus une rubrique
// de la barre de navigation mais un assistant CONTEXTUEL : l'élève l'interpelle
// depuis l'endroit précis où il bloque — dans un cours (« اشرح لي هذه الوحدة »),
// après une erreur (« لماذا إجابتي خاطئة؟ »), dans un exercice (« أعطني تلميحاً »).
//
// Plutôt que de faire descendre un callback à travers toutes les vues, le pont
// passe par un CustomEvent sur `window` :
//   vue  → demanderAuMorchid(question, origine)
//   App  → écoute MORCHID_ASK_EVENT, ouvre l'onglet `chat` et mémorise la question
//   AITutorView → la reçoit en prop `questionInitiale` et pré-remplit le champ.
// La question n'est JAMAIS envoyée automatiquement : l'élève la relit, l'ajuste,
// puis valide. On ne répond pas à sa place.

export const MORCHID_ASK_EVENT = 'morchid:ask';

export interface MorchidAskDetail {
  /** Question pré-remplie dans le champ du المرشد. */
  question: string;
  /** D'où vient l'appel (traçabilité : cours, exercice, correction, accueil). */
  origine?: string;
}

/** Ouvre le المرشد avec une question pré-remplie. Silencieux si question vide. */
export function demanderAuMorchid(question: string, origine?: string): void {
  const q = question.trim();
  if (typeof window === 'undefined' || !q) return;
  window.dispatchEvent(
    new CustomEvent<MorchidAskDetail>(MORCHID_ASK_EVENT, {
      detail: { question: q, origine },
    }),
  );
}
