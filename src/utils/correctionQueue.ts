// correctionQueue.ts — File de correction (docs/AUDIT_APPROCHE_APP.md §3.5, ordre §6 ligne 5)
//
// Boucle « forme → fond » : la machine valide la FORME (3 portes, verdict Phase 2) ;
// le FOND scientifique est garanti par la correction humaine — dans ce produit,
// l'enseignant du produit lui-même (compte + dashboard), pas un pool externe.
//
// Règle d'entrée : une production entre dans la file UNIQUEMENT si sa forme est
// validée (formeValidee) — un brouillon à la forme invalide renvoie au renvoi
// ciblé (micro-2a), pas au correcteur. 100% local (offline-first), rotation 200.

export type CorrectionStatus = 'pending' | 'approved' | 'corrections';

export interface CorrectionItem {
  id: string;
  verbId: string;
  verbAr: string;
  theme?: string;
  stage: 2 | 3 | 4;
  dateISO: string;
  text: string;
  icm: number;          // ICM de FORME au moment de la soumission
  errorTags: string[];
  status: CorrectionStatus;
  noteAr?: string;      // note du correcteur
  selfScore?: number;   // auto-évaluation /20 (élève, à la soumission stage 4)
  realScore?: number;   // note réelle /20 (enseignant, via la file)
  mode?: 'examen';      // production issue d'un mode examen (ligne 7)
}

const KEY = 'kunz_correction_queue_v1';
const MAX_ITEMS = 200;

function safeRead(): CorrectionItem[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const p = JSON.parse(raw);
    return Array.isArray(p)
      ? p.filter((e: any) => e && typeof e.id === 'string' && typeof e.verbId === 'string' && typeof e.icm === 'number')
      : [];
  } catch {
    try { localStorage.removeItem(KEY); } catch {}
    return [];
  }
}

function save(list: CorrectionItem[]): void {
  try { localStorage.setItem(KEY, JSON.stringify(list)); } catch {}
}

function newId(): string {
  try { return (crypto as any).randomUUID?.() ?? `c-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`; }
  catch { return `c-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`; }
}

/** Ajoute une production « forme validée » en tête de file. */
export function addCorrectionItem(item: Omit<CorrectionItem, 'id' | 'status'>): CorrectionItem {
  const full: CorrectionItem = { ...item, id: newId(), status: 'pending' };
  const list = [full, ...safeRead()].slice(0, MAX_ITEMS);
  save(list);
  return full;
}

/** Note réelle /20 posée par l'enseignant — alimente l'écart de calibration (Phase 4). */
export function setRealScore(id: string, score: number | undefined): void {
  const list = safeRead().map(e =>
    e.id === id ? { ...e, realScore: score != null && isFinite(score) && score >= 0 && score <= 20 ? score : undefined } : e
  );
  save(list);
}

/** Verdict du correcteur : approuvée (fond OK) ou à corriger (+ note). */
export function markCorrection(id: string, status: 'approved' | 'corrections', noteAr?: string): void {
  const list = safeRead().map(e =>
    e.id === id ? { ...e, status, noteAr: noteAr ?? e.noteAr } : e
  );
  save(list);
}

/** File complète, plus récente d'abord. */
export function getCorrectionQueue(): CorrectionItem[] {
  return safeRead();
}

export function getPendingCorrections(): CorrectionItem[] {
  return safeRead().filter(e => e.status === 'pending');
}

export function correctionStats(): { pending: number; approved: number; corrections: number; examCount: number } {
  const list = safeRead();
  return {
    pending: list.filter(e => e.status === 'pending').length,
    approved: list.filter(e => e.status === 'approved').length,
    corrections: list.filter(e => e.status === 'corrections').length,
    examCount: list.filter(e => e.mode === 'examen').length,
  };
}

export function resetCorrectionQueue(): void {
  try { localStorage.removeItem(KEY); } catch {}
}
