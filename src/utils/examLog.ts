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

/** Provenance d'une tentative — alimente les stats PAR TYPE de sujet. */
export type ExamSource = 'bac2025' | 'bareme' | 'blanc' | 'autre';

export interface ExamAttempt {
  id: string;
  dateISO: string;
  sujet: 1 | 2;
  total: number; // /20
  exercices: ExamExerciceResult[];
  /** Champs OPTIONNELS : les anciennes tentatives restent lisibles telles quelles. */
  source?: ExamSource;
  year?: number;
  /** Archétypes BAC réellement tombés dans ce sujet (bacArchetypes.ts). */
  archetypeIds?: string[];
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
  // `domain` suit la provenance réelle : une tentative d'un sujet blanc ou d'un
  // barème isolé ne doit pas être comptée comme un « الإطار الرسمي 2025 ».
  const source: ExamSource = entry.source ?? 'bac2025';
  logActivityLocally({
    studentId: 'local',
    type: 'quiz',
    payload: {
      title:
        source === 'bac2025'
          ? `الإطار الرسمي 2025 — الموضوع ${entry.sujet === 1 ? 'الأول' : 'الثاني'}`
          : `بكالوريا ${entry.year ?? '—'} — الموضوع ${entry.sujet === 1 ? 'الأول' : 'الثاني'}`,
      score: Math.round(entry.total * 100) / 100,
      total: 20,
      percent: Math.round((entry.total / 20) * 100),
      domain: source,
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

// ── Statistiques PAR TYPE DE SUJET (correction axe 5, 2026-11-05) ──────────
//
// `getExamStats()` ne donnait qu'une tendance globale (dernière / meilleure /
// moyenne). L'élève ne pouvait pas savoir s'il perd ses points sur un type de
// montage, sur une année ou sur le 3ᵉ exercice (08 pts). Ces groupes sont
// calculés UNIQUEMENT à partir des tentatives réellement archivées : aucune
// moyenne fictive, aucun « 0 » affiché à la place d'une donnée absente.

export interface TypeStatBac {
  key: string;
  attempts: number;
  average: number | null;
  best: number | null;
}

export interface ExerciceStatBac {
  exercice: 1 | 2 | 3;
  occurrences: number;
  pointsMoyens: number | null;
  maxPtsMoyen: number | null;
  /** Part des points obtenus sur ce rang, 0..1 (null si aucun barème lisible). */
  taux: number | null;
}

export interface ExamTypeStats {
  attempts: number;
  parArchetype: TypeStatBac[];
  parAnnee: TypeStatBac[];
  parSource: TypeStatBac[];
  parExercice: ExerciceStatBac[];
}

function agreger(cle: string, tentatives: ExamAttempt[]): TypeStatBac {
  if (tentatives.length === 0) return { key: cle, attempts: 0, average: null, best: null };
  const totaux = tentatives.map((a) => a.total);
  const somme = totaux.reduce((s, x) => s + x, 0);
  return {
    key: cle,
    attempts: totaux.length,
    average: Math.round((somme / totaux.length) * 100) / 100,
    best: Math.max(...totaux),
  };
}

function grouperPar<T>(
  tentatives: ExamAttempt[],
  cles: (a: ExamAttempt) => T[],
): TypeStatBac[] {
  const groupes = new Map<string, ExamAttempt[]>();
  for (const a of tentatives) {
    // Set : un même archétype cité deux fois dans un sujet ne compte qu'une fois.
    for (const cle of new Set(cles(a))) {
      const k = String(cle);
      const liste = groupes.get(k) ?? [];
      liste.push(a);
      groupes.set(k, liste);
    }
  }
  return [...groupes.entries()]
    .map(([k, liste]) => agreger(k, liste))
    .sort((a, b) => b.attempts - a.attempts || a.key.localeCompare(b.key));
}

/** Stats par archétype / année / provenance / rang d'exercice. */
export function getExamStatsByType(): ExamTypeStats {
  const all = getExamAttempts();
  const parExercice: ExerciceStatBac[] = [];
  for (const rang of [1, 2, 3] as const) {
    const points: number[] = [];
    const maxPts: number[] = [];
    for (const a of all) {
      for (const e of a.exercices) {
        if (e.exercice !== rang || !(e.maxPts > 0)) continue;
        points.push(e.points);
        maxPts.push(e.maxPts);
      }
    }
    if (points.length === 0) continue; // pas de zéro inventé
    const sommePts = points.reduce((s, x) => s + x, 0);
    const sommeMax = maxPts.reduce((s, x) => s + x, 0);
    parExercice.push({
      exercice: rang,
      occurrences: points.length,
      pointsMoyens: Math.round((sommePts / points.length) * 100) / 100,
      maxPtsMoyen: Math.round((sommeMax / maxPts.length) * 100) / 100,
      taux: sommeMax > 0 ? Math.round((sommePts / sommeMax) * 100) / 100 : null,
    });
  }
  return {
    attempts: all.length,
    parArchetype: grouperPar(all, (a) => a.archetypeIds ?? []),
    parAnnee: grouperPar(all, (a) => (a.year === undefined ? [] : [a.year])).sort(
      (a, b) => Number(b.key) - Number(a.key),
    ),
    parSource: grouperPar(all, (a) => [a.source ?? 'bac2025']),
    parExercice,
  };
}

export function clearExamLog(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* noop */
  }
}
