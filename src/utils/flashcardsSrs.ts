// SM-2 (Wojniak 1987) — répétition espacée RÉELLE par carte, persistée en
// localStorage. RevisionView interroge cet état pour l'ordre du deck et les
// intervalles affichés sur les boutons ; App.tsx/handleRateCard ne fait que
// créditer l'XP (statuts 'again'|'hard'|'good'|'easy' mappés q=1/3/4/5).

export type SrsRating = 'again' | 'hard' | 'good' | 'easy';

export interface SrsCardState {
  ease: number;        // facteur de facilité (≥ 1,3)
  intervalDays: number; // intervalle courant en jours (0 = intra-séance)
  dueAt: number;       // timestamp ms de la prochaine révision
  reps: number;        // répétitions consécutives réussies
  lapses: number;      // nombre de « encore » (remises à zéro)
}

const STORAGE_KEY = 'kunz_flashcard_srs_v1';
const DAY_MS = 86_400_000;
const MIN_EASE = 1.3;

function loadAll(): Record<string, SrsCardState> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function saveAll(states: Record<string, SrsCardState>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(states));
  } catch {
    /* quota dépassé — la progression du jour reste en mémoire de session */
  }
}

export function getSrsState(cardId: string): SrsCardState | null {
  return loadAll()[cardId] ?? null;
}

export function resetAllSrs(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

const QUALITY: Record<SrsRating, number> = { again: 1, hard: 3, good: 4, easy: 5 };

/** Transition SM-2 pure : renvoie le nouvel état sans le persister. */
export function nextSrsState(
  previous: SrsCardState | null,
  rating: SrsRating,
  now: number,
): SrsCardState {
  const s: SrsCardState = previous ?? {
    ease: 2.5,
    intervalDays: 0,
    dueAt: now,
    reps: 0,
    lapses: 0,
  };
  const q = QUALITY[rating];
  const ease = Math.max(MIN_EASE, s.ease + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)));

  if (q < 3) {
    // « encore » : cycle de répétition remis à zéro, carte re-présentée
    // dans la séance courante (dueAt = maintenant, poussée en fin de deck).
    return { ease, intervalDays: 0, dueAt: now, reps: 0, lapses: s.lapses + 1 };
  }

  const reps = s.reps + 1;
  let intervalDays =
    reps === 1 ? 1 : reps === 2 ? 6 : Math.max(1, Math.round(s.intervalDays * ease));
  if (rating === 'hard') intervalDays = Math.max(1, Math.round(intervalDays * 0.8));
  if (rating === 'easy') intervalDays = Math.max(4, Math.round(intervalDays * 1.3));

  return { ease, intervalDays, dueAt: now + intervalDays * DAY_MS, reps, lapses: s.lapses };
}

/** Note une carte et persiste son état SM-2. */
export function rateCard(cardId: string, rating: SrsRating, now = Date.now()): SrsCardState {
  const next = nextSrsState(getSrsState(cardId), rating, now);
  const all = loadAll();
  all[cardId] = next;
  saveAll(all);
  return next;
}

/**
 * Ordre de passage : dues/nouvelles d'abord (ordre d'origine, stable),
 * puis les programmées par dueAt croissant. `backId` (note « encore »)
 * est poussé en dernière position pour ne pas reboucler immédiatement.
 */
export function sortByDue<T extends { id: string }>(
  cards: T[],
  now = Date.now(),
  backId?: string,
): T[] {
  const states = loadAll();
  const dues: T[] = [];
  const schedulees: Array<{ card: T; dueAt: number }> = [];
  for (const card of cards) {
    const st = states[card.id];
    if (!st || st.dueAt <= now) dues.push(card);
    else schedulees.push({ card, dueAt: st.dueAt });
  }
  schedulees.sort((a, b) => a.dueAt - b.dueAt);
  const ordered = [...dues, ...schedulees.map((x) => x.card)];
  if (backId) {
    const idx = ordered.findIndex((c) => c.id === backId);
    if (idx >= 0 && idx !== ordered.length - 1) {
      const [card] = ordered.splice(idx, 1);
      ordered.push(card);
    }
  }
  return ordered;
}

/** Aperçu de l'intervalle qu'une note produirait (libellés des boutons). */
export function previewIntervalDays(
  previous: SrsCardState | null,
  rating: SrsRating,
): number {
  return nextSrsState(previous, rating, Date.now()).intervalDays;
}

/** Libellé d'intervalle — chiffres latins (convention src/utils/latinDigits.ts). */
export function formatIntervalLabel(days: number): string {
  if (days <= 0) return 'داخل الجلسة';
  if (days === 1) return 'يوم واحد';
  if (days === 2) return 'يومان';
  if (days < 30) return `${days} أيام`;
  if (days < 60) return 'شهر واحد';
  return `${Math.round(days / 30)} أشهر`;
}
