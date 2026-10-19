// SM-2 (Wozniak 1987) — répétition espacée RÉELLE par carte, persistée en
// localStorage. RevisionView interroge cet état pour l'ordre du deck et les
// intervalles affichés sur les boutons ; App.tsx/handleRateCard ne fait que
// créditer l'XP (statuts 'again'|'hard'|'good'|'easy' mappés q=1/3/4/5).
//
// REFONTE DU 15/10/2026 — la formule n'est PLUS écrite ici.
// Elle vivait dans ce fichier en double exemplaire avec quatre autres
// ordonnanceurs figés (voir `src/lib/sm2.ts`, qui raconte le tout). Elle est
// désormais importée depuis ce module canonique. Ce fichier ne garde que ce qui
// lui est propre : le vocabulaire des quatre boutons, la persistance, l'ordre
// du deck et les libellés.
//
// Les deux variantes qui appartiennent en propre aux cartes y sont déclarées :
//   · `apresEchec: 'intra-seance'` — une carte ratée se reprÉSENTE dans la
//     séance (on ne renvoie pas l'élève au lendemain pour une carte) ;
//   · `ajustement: 'anki'` — les boutons « difficile » et « facile » modulent
//     l'intervalle, sans quoi ils mentiraient.
// Aucun de ces deux choix n'est appliqué aux concepts ni aux gestes.
//
// BORNE (TC5, audit architecture 2026-10-19, H3) : la transition canonique ne
// plafonne rien — le chemin 1 → 6 → ×ease mène, après quelques mois de
// réussites, à des échéances à 6-12 mois, au-delà du BAC : la carte se
// programme hors de portée de l'élève et ne revient jamais. Même règle que la
// mémoire par question (memoireQuestions.INTERVALLE_MAX_JOURS = 21) :
//   · l'intervalle ne dépasse jamais le plafond ;
//   · atteindre le plafond par une réussite = SORTIE de la boucle (dueAt = 0) :
//     la carte est consolidée, elle est reléguée en fin de deck au lieu de se
//     reformuler calendrier pendant des mois ;
//   · un échec rouvre TOUT, même une carte sortie (dueAt = maintenant) ;
//   · noter une carte déjà sortie ne la fait JAMAIS rentrer (pas de ré-entrée
//     dans la boucle sans échec).
// Le plafond est IMPORTÉ et non recopié : la duplication d'échelles est ce
// qui avait produit cinq ordonnanceurs concurrents (voir en-tête de sm2.ts).

import { prochainEtatSm2, type EtatSm2, type QualiteSm2 } from '../lib/sm2';
import { INTERVALLE_MAX_JOURS } from '../lib/memoireQuestions';

export type SrsRating = 'again' | 'hard' | 'good' | 'easy';

/** L'état d'une carte EST l'état SM-2 canonique — un seul type, pas deux. */
export type SrsCardState = EtatSm2;

const STORAGE_KEY = 'kunz_flashcard_srs_v1';

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

const QUALITY: Record<SrsRating, QualiteSm2> = { again: 1, hard: 3, good: 4, easy: 5 };

/** Transition SM-2 pure + borne H3 : renvoie le nouvel état sans le persister. */
export function nextSrsState(
  previous: SrsCardState | null,
  rating: SrsRating,
  now: number,
): SrsCardState {
  const brut = prochainEtatSm2(previous, QUALITY[rating], now, {
    apresEchec: 'intra-seance',
    ajustement: 'anki',
  });
  // Échec (re-présentation intra-séance) : rien à borner.
  if (brut.intervalDays === 0) return brut;
  // Carte déjà sortie : une réussite ne la fait JAMAIS rentrer dans la
  // boucle (noter ≠ prouver — cf. réussite hors échéance côté TC3).
  if (previous?.dueAt === 0) {
    return { ...brut, intervalDays: INTERVALLE_MAX_JOURS, dueAt: 0 };
  }
  // Atteindre le plafond par une réussite = sortie de la boucle.
  if (brut.intervalDays >= INTERVALLE_MAX_JOURS) {
    return { ...brut, intervalDays: INTERVALLE_MAX_JOURS, dueAt: 0 };
  }
  return brut;
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
  const graduees: T[] = []; // dueAt = 0 : sortie de la boucle (borne H3, TC5)
  for (const card of cards) {
    const st = states[card.id];
    if (!st || (st.dueAt > 0 && st.dueAt <= now)) dues.push(card);
    else if (st.dueAt === 0) graduees.push(card);
    else schedulees.push({ card, dueAt: st.dueAt });
  }
  schedulees.sort((a, b) => a.dueAt - b.dueAt);
  const ordered = [...dues, ...schedulees.map((x) => x.card), ...graduees];
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
