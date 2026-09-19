// examLog.ts — HISTORIQUE DES NOTES OBLIGATOIRES (décision propriétaire 2026-09-19).
//
// Chaque épreuve bac2025 soumise (Bac2025ExamView) est archivée localement :
// total /20 + détail par exercice (points, maxPts, couverture) — la même note
// que le correcteur affiche, rien d'autre. Mêmes conventions que le carnet de
// bord (methodologyLog.ts) : localStorage + rotation, et si l'élève a un compte
// (boussole_token), un ÉVÉNEMENT activité part au serveur pour le dashboard
// enseignant. Le TEXTE des réponses reste local (aucun contrat de synchro ne le
// porte — décision : l'historique de NOTES n'exige pas la réplication des copies).

import { logActivityLocally } from './activityLog';

export interface ExamExerciceResult {
  sujet: 1 | 2;
  exercice: 1 | 2 | 3;
  points: number;
  maxPts: number;
  couverture: number; // 0..1 (points attendus auto crédités / Σ auto)
}

export interface ExamAttempt {
  id: string;
  dateISO: string;
  sujet: 1 | 2;
  total: number; // /20
  exercices: ExamExerciceResult[];
}

export interface ExamStats {
  attempts: number;
  last: number | null;
  previous: number | null; // avant-dernier (delta affichable)
  best: number | null;
  average: number | null;
  /** Derniers totaux, ordre chronologique (max 10) — tendance. */
  spark: number[];
}

const STORAGE_KEY = 'kunz_exam_attempts_log_v1';
const MAX_ENTRIES = 200; // rotation : ~2 sujets × 100 essais, largement assez

function safeRead(): ExamAttempt[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (e): e is ExamAttempt =>
        e && typeof e.id === 'string' && typeof e.total === 'number' && Array.isArray(e.exercices)
    );
  } catch {
    return []; // JSON corrompu → historique vide, jamais un crash
  }
}

/** Archive une tentative ET pousse l'événement dashboard (si compte élève). */
export function logExamAttempt(entry: Omit<ExamAttempt, 'id' | 'dateISO'>): ExamAttempt {
  const full: ExamAttempt = {
    ...entry,
    id: `exam_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    dateISO: new Date().toISOString(),
  };
  try {
    const all = safeRead();
    all.push(full);
    if (all.length > MAX_ENTRIES) all.splice(0, all.length - MAX_ENTRIES);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch (e) {
    console.warn("Impossible d'archiver la tentative:", e);
  }
  // Événement dashboard (file offline-first ; sans token rien ne quitte l'appareil).
  logActivityLocally({
    studentId: 'local',
    type: 'quiz',
    payload: {
      title: `الإطار الرسمي 2025 — الموضوع ${entry.sujet === 1 ? 'الأول' : 'الثاني'}`,
      score: Math.round(entry.total * 100) / 100,
      total: 20,
      percent: Math.round((entry.total / 20) * 100),
      domain: 'bac2025',
    },
  });
  return full;
}

/** Tentatives, ordre chronologique (ancien → récent). */
export function getExamAttempts(): ExamAttempt[] {
  return safeRead().sort((a, b) => a.dateISO.localeCompare(b.dateISO));
}

/** Stats de tendance — null tant qu'il n'y a aucune tentative (l'absence ≠ 0). */
export function getExamStats(): ExamStats | null {
  const all = getExamAttempts();
  if (!all.length) return null;
  const totals = all.map((a) => a.total);
  const spark = totals.slice(-10);
  const sum = spark.reduce((s, x) => s + x, 0);
  return {
    attempts: all.length,
    last: totals[totals.length - 1] ?? null,
    previous: totals.length >= 2 ? totals[totals.length - 2]! : null,
    best: Math.max(...totals),
    average: Math.round((sum / spark.length) * 100) / 100,
    spark,
  };
}

export function clearExamLog(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* noop */
  }
}
