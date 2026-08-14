// correctionFeedbackService.ts
// Constat #64 — « أبلغ عن خطأ في التصحيح » ouvrait une alerte promettant que
// « notre équipe » relirait la réponse et « entraînerait l'algorithme ». Mesuré :
// le clic n'écrivait RIEN (localStorage inchangé) et n'émettait aucun événement
// de télémétrie. L'application est hors ligne par conception : il n'existe aucune
// équipe joignable, et le correcteur est un moteur de règles local qui ne
// s'entraîne pas. La promesse était donc doublement fausse.
//
// Doctrine reprise de #56/#57/#59 : quand on ne peut pas tenir la promesse, on
// cesse de la faire — et on rend le geste réellement utile là où il peut l'être,
// c'est-à-dire sur l'appareil de l'élève.

const KEY = 'kunz_correction_feedback_v1';

/** Borne dure : un signalement est un texte court, la file ne doit pas enfler. */
export const MAX_FEEDBACK = 50;

export interface CorrectionFeedback {
  exerciseId: string;
  questionId: string;
  /** Réponse telle que l'élève l'avait rédigée, pour qu'il la retrouve. */
  answer: string;
  /** Score de forme affiché au moment du désaccord. */
  score: number;
  maxScore: number;
  reportedAt: string;
}

function readAll(): CorrectionFeedback[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Enregistre le désaccord de l'élève avec la correction, localement.
 * Retourne false si rien n'a pu être écrit — l'appelant ne doit alors PAS
 * afficher de confirmation (ne jamais confirmer un enregistrement qui n'a pas eu
 * lieu : c'est exactement le défaut #64).
 */
export function recordCorrectionFeedback(
  entry: Omit<CorrectionFeedback, 'reportedAt'>,
  now: Date = new Date()
): boolean {
  // Une réponse vide ne constitue pas un signalement exploitable.
  if (!entry.exerciseId || !entry.questionId || !entry.answer.trim()) return false;
  try {
    const all = readAll();
    all.push({ ...entry, answer: entry.answer.trim(), reportedAt: now.toISOString() });
    // On garde les plus RÉCENTS : un signalement ancien a déjà été relu ou oublié.
    const trimmed = all.slice(-MAX_FEEDBACK);
    localStorage.setItem(KEY, JSON.stringify(trimmed));
    return true;
  } catch {
    return false;
  }
}

/** Signalements enregistrés sur cet appareil, du plus ancien au plus récent. */
export function listCorrectionFeedback(): CorrectionFeedback[] {
  return readAll();
}

/** Nombre de signalements déjà posés sur cette question précise. */
export function countFeedbackFor(exerciseId: string, questionId: string): number {
  return readAll().filter((f) => f.exerciseId === exerciseId && f.questionId === questionId).length;
}
