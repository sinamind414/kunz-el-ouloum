// okachaProgress.ts — PROGRESSION « بنك الحفظ » (modernisation 2026-09-22).
//
// Persiste en localStorage : (1) les unités marquées « تم الحفظ », (2) les
// auto-évaluations des points révélés en mode حفظ (again/hard/good/easy —
// mêmes notes que le SM-2 des flashcards de RevisionView, qui partent aussi
// vers UserProgress.flashcardStats via onRateCard). Mêmes conventions que
// examLog.ts : lecture tolérante (JSON corrompu → état vide, jamais de crash),
// écriture best-effort (stockage plein/indisponible non bloquant).

export type NoteHafiz = 'again' | 'hard' | 'good' | 'easy';

export interface CompteurNote {
  again: number;
  hard: number;
  good: number;
  easy: number;
}

export interface OkachaProgress {
  /** ids d'unités marquées « lu / تم الحفظ » (ex. « d1u1 »). */
  lus: string[];
  /** auto-évaluations par point, clé « unitId#idxBloc » dans les blocs de l'unité. */
  evals: Record<string, CompteurNote>;
  /** ids de sections méthodo ouvertes (badge « n/9 sections lues »). */
  sectionsLues: string[];
}

const STORAGE_KEY = 'kunz_okacha_progress_v1';

const EMPTY: OkachaProgress = { lus: [], evals: {}, sectionsLues: [] };

const isCompteur = (v: unknown): v is CompteurNote =>
  !!v && typeof v === 'object' &&
  ['again', 'hard', 'good', 'easy'].every((k) => Number.isFinite((v as Record<string, unknown>)[k]));

export function loadOkachaProgress(): OkachaProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const p: unknown = JSON.parse(raw);
    if (!p || typeof p !== 'object') return EMPTY;
    const { lus, evals, sectionsLues } = p as { lus?: unknown; evals?: unknown; sectionsLues?: unknown };
    if (!Array.isArray(lus) || !evals || typeof evals !== 'object') return EMPTY;
    const evalsPropres: Record<string, CompteurNote> = {};
    for (const [k, v] of Object.entries(evals as Record<string, unknown>)) {
      if (isCompteur(v)) evalsPropres[k] = v;
    }
    return {
      lus: lus.filter((x): x is string => typeof x === 'string'),
      evals: evalsPropres,
      sectionsLues: Array.isArray(sectionsLues)
        ? sectionsLues.filter((x): x is string => typeof x === 'string')
        : [],
    };
  } catch {
    return EMPTY;
  }
}

export function saveOkachaProgress(p: OkachaProgress): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  } catch {
    // stockage plein / indisispensable : non bloquant (contrat examLog).
  }
}

/** Ajoute (ou retire, si déjà lue) l'unité des unités « تم الحفظ ». */
export function toggleUniteLue(p: OkachaProgress, uniteId: string): OkachaProgress {
  const lus = p.lus.includes(uniteId) ? p.lus.filter((id) => id !== uniteId) : [...p.lus, uniteId];
  const next = { ...p, lus };
  saveOkachaProgress(next);
  return next;
}

/** Compte +1 sur la note d'un point (auto-évaluation en mode حفظ). */
export function noterPoint(p: OkachaProgress, uniteId: string, idx: number, note: NoteHafiz): OkachaProgress {
  const cle = `${uniteId}#${idx}`;
  const c = p.evals[cle] ?? { again: 0, hard: 0, good: 0, easy: 0 };
  const next: OkachaProgress = {
    ...p,
    evals: { ...p.evals, [cle]: { ...c, [note]: c[note] + 1 } },
  };
  saveOkachaProgress(next);
  return next;
}

/** XP correspondant aux notes — miroir EXACT de handleRateCard (App.tsx). */
export const XP_PAR_NOTE: Record<NoteHafiz, number> = {
  easy: 15,
  good: 10,
  hard: 5,
  again: 2,
};

/** Nombre total d'auto-évaluations (affichage « تقييماتك : N »). */
export function totalNotations(p: OkachaProgress): number {
  return Object.values(p.evals).reduce(
    (s, c) => s + c.again + c.hard + c.good + c.easy,
    0,
  );
}

/** Ouvre une section méthodo → marquée lue (idempotent). */
export function marquerSectionLue(p: OkachaProgress, sectionId: string): OkachaProgress {
  if (p.sectionsLues.includes(sectionId)) return p;
  const next = { ...p, sectionsLues: [...p.sectionsLues, sectionId] };
  saveOkachaProgress(next);
  return next;
}

/** Sous-total de notes d'une unité (badge sur l'accordéon). */
export function notationsUnite(p: OkachaProgress, uniteId: string): number {
  const pre = `${uniteId}#`;
  return Object.entries(p.evals)
    .filter(([k]) => k.startsWith(pre))
    .reduce((s, [, c]) => s + c.again + c.hard + c.good + c.easy, 0);
}