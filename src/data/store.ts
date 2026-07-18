// src/data/store.ts
// P0.0 — Contrats de stockage offline versionné + migrations (Spec V2 §2.3 / §2.4).
// Offline-first : localStorage uniquement, aucune dépendance Supabase.
// Toute lecture survit à JSON invalide ou localStorage indisponible.

// ---------------------------------------------------------------------------
// Types contractuels (§2.3)
// ---------------------------------------------------------------------------

export type CoreReflexId =
  | 'analyse'
  | 'interpret'
  | 'compare'
  | 'hypothesize'
  | 'explain'
  | 'validate';

export type MasteryLevel = 'unknown' | 'needs_work' | 'developing' | 'mastered';

export interface MasteryCell {
  level: MasteryLevel;
  evidenceCount: number;
  lastEvidenceAt?: number;
  lastScore?: number;
}

export interface MasteryRecord {
  conceptId: string;
  knowledge: MasteryCell;
  document: MasteryCell;
  methodology: Partial<Record<CoreReflexId, MasteryCell>>;
}

export type LearningErrorKind = 'knowledge' | 'document' | 'methodology';

export interface LearningError {
  id: string;
  kind: LearningErrorKind;
  conceptId?: string;
  unitId?: number;
  reflexId?: CoreReflexId;
  ruleIds: string[];
  labelAr: string;
  count: number;
  createdAt: number;
  lastSeenAt: number;
  reviewStartedAt: number;
  reviewStage: number;
  nextReviewAt: number;
  resolvedAt?: number;
}

export interface LearningInsight {
  id: string;
  errorId: string;
  kind: LearningErrorKind;
  labelAr: string;
  count: number;
  lastSeenAt: number;
  unitId?: number;
  reflexId?: CoreReflexId;
}

export type MissionSource = 'error' | 'weak_unit' | 'spaced_review' | 'onboarding';
export type MissionAction = 'knowledge_recall' | 'document_analysis' | 'word_by_word' | 'quiz' | 'review' | 'survival_card';

export interface MissionStep {
  id: string;
  action: MissionAction;
  titleAr: string;
  expectedMinutes: number;
  conceptId?: string;
  reflexId?: CoreReflexId;
  survivalCardId?: string;
}

export interface Mission {
  id: string;
  source: MissionSource;
  titleAr: string;
  reasonAr: string;
  expectedMinutes: number;
  primaryActionLabelAr: string;
  steps: MissionStep[];
  createdAt: number;
  completedAt?: number;
  relatedErrorIds: string[];
}

// Preuve réelle de maîtrise (P2.2 / P1.1-B) — jamais un simple compteur.
export interface MasteryEvidence {
  id: string;
  conceptId: string;
  dimension: 'knowledge' | 'document' | 'methodology';
  reflexId?: CoreReflexId;
  source: 'quiz' | 'document_analysis' | 'lesson_transfer' | 'word_by_word';
  score: number;
  createdAt: number;
  relatedErrorIds?: string[];
}

// Registre de destination pédagogique : relie une erreur à la leçon/quiz/doc à ouvrir.
export interface ConceptRoute {
  conceptId: string;
  unitId?: number;
  lessonId?: string;
  documentExerciseId?: string;
  survivalCardId?: string;
}

export interface ReviewMetadata {
  reviewed: boolean;
  reviewedAt?: string;
  reviewedBy?: string;
  sourceProgram?: string;
}

// Cadence de rappels espacés (P2.3) : offsets depuis reviewStartedAt.
export const REVIEW_INTERVALS_DAYS = [1, 3, 7, 14] as const;
export const DAY_MS = 24 * 60 * 60 * 1000;

export interface StorageMeta {
  version: number;
  updatedAt: number;
  migratedFrom?: number;
}

// ---------------------------------------------------------------------------
// Clés standardisées et constantes (§2.4)
// ---------------------------------------------------------------------------

export const STORAGE_KEYS = {
  userProgress: 'kunz_user_progress_v3',
  learningErrors: 'kunz_learning_errors_v1',
  missions: 'kunz_missions_v3',
  mastery: 'kunz_mastery_v1',
  storageMeta: 'kunz_storage_meta_v1',
} as const;

export const STORAGE_VERSION = 1;

export const MAX_SERIALIZED_BYTES_PER_KEY = 1_048_576; // 1 Mo
export const MAX_ACTIVE_ERRORS = 100;
export const MAX_RESOLVED_ERRORS = 100;
export const MAX_MISSION_HISTORY_DAYS = 90;
export const MISSION_HISTORY_MS = MAX_MISSION_HISTORY_DAYS * 24 * 60 * 60 * 1000;

// Forme canonique actuelle du store.
export interface KunzStore {
  meta: StorageMeta;
  userProgress: unknown;
  learningErrors: LearningError[];
  missions: Mission[];
  mastery: Record<string, MasteryRecord>;
}

// ---------------------------------------------------------------------------
// Lecture défensive (survit JSON invalide / localStorage indisponible)
// ---------------------------------------------------------------------------

function safeRead(raw: string | null): unknown {
  if (raw == null) return undefined;
  try {
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
}

export function readRaw(key: string): unknown {
  try {
    if (typeof localStorage === 'undefined') return undefined;
    return safeRead(localStorage.getItem(key));
  } catch {
    return undefined;
  }
}

export function writeRaw(key: string, value: unknown): boolean {
  try {
    if (typeof localStorage === 'undefined') return false;
    const serialized = JSON.stringify(value);
    if (serialized.length > MAX_SERIALIZED_BYTES_PER_KEY) return false;
    localStorage.setItem(key, serialized);
    return true;
  } catch {
    // Quota dépassé ou localStorage indisponible : échec silencieux.
    return false;
  }
}

// ---------------------------------------------------------------------------
// Migration (§2.4)
// ---------------------------------------------------------------------------

function emptyStore(version: number, migratedFrom?: number): KunzStore {
  return {
    meta: { version, updatedAt: Date.now(), migratedFrom },
    userProgress: null,
    learningErrors: [],
    missions: [],
    mastery: {},
  };
}

// Tronque l'historique et borne les erreurs avant échec de quota (§2.4).
function enforceLimits(store: KunzStore, now: number): KunzStore {
  const active = store.learningErrors.filter((e) => !e.resolvedAt);
  const resolved = store.learningErrors.filter((e) => e.resolvedAt);

  const trimmedActive = active.slice(-MAX_ACTIVE_ERRORS);
  const trimmedResolved = resolved.slice(-MAX_RESOLVED_ERRORS);

  const missions = store.missions
    .filter((m) => m.completedAt == null || now - m.completedAt < MISSION_HISTORY_MS)
    .slice(-MAX_ACTIVE_ERRORS);

  return { ...store, learningErrors: [...trimmedActive, ...trimmedResolved], missions };
}

export function migrateStore(raw: unknown, fromVersion: number, toVersion: number): KunzStore {
  const now = Date.now();

  // Store absent → état vide sûr.
  if (raw == null) {
    return enforceLimits(emptyStore(toVersion), now);
  }

  // JSON corrompu déjà filtré par readRaw ; ici raw est un objet.
  const loose = raw as Record<string, any>;

  // Préserve les erreurs actives lors d'une migration valide (§2.4 test).
  // Comble les champs de cadence absents dans les stores anciens (non destructif).
  const rawErrors: any[] = Array.isArray(loose.learningErrors)
    ? loose.learningErrors
    : Array.isArray(loose.errors)
      ? loose.errors
      : [];
  const preservedErrors: LearningError[] = rawErrors.map((e) => ({
    id: String(e.id),
    kind: e.kind ?? 'methodology',
    conceptId: e.conceptId,
    unitId: e.unitId,
    reflexId: e.reflexId,
    ruleIds: Array.isArray(e.ruleIds) ? e.ruleIds : [],
    labelAr: String(e.labelAr ?? ''),
    count: typeof e.count === 'number' ? e.count : 1,
    createdAt: e.createdAt ?? now,
    lastSeenAt: e.lastSeenAt ?? now,
    reviewStartedAt: e.reviewStartedAt ?? 0,
    reviewStage: typeof e.reviewStage === 'number' ? e.reviewStage : 0,
    nextReviewAt: e.nextReviewAt ?? 0,
    resolvedAt: e.resolvedAt,
  }));

  const store: KunzStore = {
    meta: {
      version: toVersion,
      updatedAt: now,
      migratedFrom: fromVersion || loose?.meta?.version,
    },
    userProgress: loose.userProgress ?? null,
    learningErrors: preservedErrors,
    missions: Array.isArray(loose.missions) ? loose.missions : [],
    mastery: loose.mastery && typeof loose.mastery === 'object' ? loose.mastery : {},
  };

  return enforceLimits(store, now);
}

// Migre un store complet à partir d'une version source inconnue.
export function migrateFromRaw(raw: unknown, toVersion: number = STORAGE_VERSION): KunzStore {
  const fromVersion = raw && (raw as any).meta && typeof (raw as any).meta.version === 'number'
    ? (raw as any).meta.version
    : 0;
  return migrateStore(raw, fromVersion, toVersion);
}

// Lit + migre un store depuis localStorage, avec fallback sûr.
export function loadStore(): KunzStore {
  const raw = readRaw(STORAGE_KEYS.learningErrors)
    ? readRaw(STORAGE_KEYS.storageMeta)
    : undefined;
  // On migre à partir du meta si présent, sinon à partir d'un store brut plausible.
  const base = raw ?? readRaw(STORAGE_KEYS.userProgress);
  const store = migrateFromRaw(base);
  writeRaw(STORAGE_KEYS.storageMeta, store.meta);
  writeRaw(STORAGE_KEYS.learningErrors, store.learningErrors);
  writeRaw(STORAGE_KEYS.missions, store.missions);
  if (store.mastery && Object.keys(store.mastery).length) {
    writeRaw(STORAGE_KEYS.mastery, store.mastery);
  }
  return store;
}

// ---------------------------------------------------------------------------
// Boucle de mission (P1.1-B) : complétion UNIQUEMENT via preuve réelle.
// ---------------------------------------------------------------------------

// Calcule le prochain offset de rappel à partir de reviewStartedAt + reviewStage.
export function nextReviewOffsetDays(reviewStage: number): number {
  const idx = Math.max(0, Math.min(reviewStage, REVIEW_INTERVALS_DAYS.length - 1));
  return REVIEW_INTERVALS_DAYS[idx];
}

export function computeNextReviewAt(reviewStartedAt: number, reviewStage: number, _now: number = Date.now()): number {
  // Stage 0 -> J+1, stage 1 -> J+3, etc. (ancré à reviewStartedAt, jamais à Date.now() seul).
  const stageForCompute = reviewStartedAt > 0 ? reviewStage : 0;
  return reviewStartedAt + nextReviewOffsetDays(stageForCompute) * DAY_MS;
}

// Résout ou fait avancer la revue d'une erreur liée selon une preuve réelle.
// Retourne une NOUVELLE erreur (immutabilité) ; ne mut pas l'original.
export function applyEvidenceToError(
  error: LearningError,
  evidence: MasteryEvidence,
  options: { passed: boolean; now?: number } = { passed: true }
): LearningError {
  const now = options.now ?? Date.now();
  const passed = options.passed && evidence.score >= 70;

  if (!passed) {
    // Échec/insuffisant : redémarre la cadence à J+1.
    return {
      ...error,
      count: error.count + 1,
      lastSeenAt: now,
      resolvedAt: undefined,
      reviewStartedAt: now,
      reviewStage: 0,
      nextReviewAt: computeNextReviewAt(now, 0, now),
    };
  }

  // Réussite réelle : si une revue était due, avance d'un stage ; sinon conserve la date.
  const stageBefore = error.reviewStartedAt > 0 ? error.reviewStage : 0;
  const dueNow = error.nextReviewAt != null && now >= error.nextReviewAt;
  const newStage = dueNow ? Math.min(stageBefore + 1, REVIEW_INTERVALS_DAYS.length - 1) : stageBefore;
  const startAt = error.reviewStartedAt > 0 ? error.reviewStartedAt : now;
  const finished = newStage >= REVIEW_INTERVALS_DAYS.length - 1 && dueNow;

  return {
    ...error,
    reviewStartedAt: startAt,
    reviewStage: newStage,
    nextReviewAt: computeNextReviewAt(startAt, newStage, now),
    resolvedAt: finished ? now : undefined,
    lastSeenAt: now,
  };
}

// Relie une preuve à la mission + erreurs associées, et marque la mission terminée.
// `evidence` doit être fourni : une mission n'est jamais terminée par un simple clic.
export function completeMissionWithEvidence(
  mission: Mission,
  evidence: MasteryEvidence | null,
  now: number = Date.now()
): { mission: Mission; errors: LearningError[] } {
  if (!evidence) {
    // Pas de preuve -> la mission reste ouverte (jamais terminée).
    return { mission, errors: [] };
  }
  const completed: Mission = { ...mission, completedAt: now };
  const errors: LearningError[] = [];
  for (const errId of mission.relatedErrorIds) {
    errors.push({
      id: errId,
      kind: evidence.dimension === 'document' ? 'document' : evidence.dimension === 'methodology' ? 'methodology' : 'knowledge',
      conceptId: evidence.conceptId,
      reflexId: evidence.reflexId,
      ruleIds: [],
      labelAr: '',
      count: 1,
      createdAt: now,
      lastSeenAt: now,
      reviewStartedAt: now,
      reviewStage: 0,
      nextReviewAt: computeNextReviewAt(now, 0, now),
    });
  }
  return { mission: completed, errors };
}

// Enregistre une preuve réelle de maîtrise (P1.1-B) sur le bon réflexe, sans
// jamais valider par un simple compteur. Renvoie le store mis à jour (immutable).
export function recordEvidence(evidence: MasteryEvidence): KunzStore {
  const store = loadStore();

  // Maîtrise : attache la preuve au réflexe concerné (dimension methodology).
  const conceptId = evidence.conceptId;
  const prev: MasteryRecord = store.mastery[conceptId] ?? {
    conceptId,
    knowledge: emptyCell(),
    document: emptyCell(),
    methodology: {},
  };
  const reflexId = evidence.reflexId;
  const prevMethod = prev.methodology ?? {};
  const cell = prevMethod[reflexId ?? 'analyse'] ?? emptyCell();

  const updatedRecord: MasteryRecord = {
    ...prev,
    methodology: {
      ...prevMethod,
      ...(reflexId
        ? {
            [reflexId]: {
              level: cell.level,
              evidenceCount: cell.evidenceCount + 1,
              lastEvidenceAt: evidence.createdAt,
              lastScore: evidence.score,
            },
          }
        : {}),
    },
  };

  // Erreurs liées : fait avancer/résoudre l'erreur d'origine si preuve réelle.
  const related = new Set(evidence.relatedErrorIds ?? []);
  const errors = store.learningErrors.map((e) =>
    related.has(e.id) ? applyEvidenceToError(e, evidence, { passed: evidence.score >= 70 }) : e
  );

  const next: KunzStore = {
    ...store,
    mastery: { ...store.mastery, [conceptId]: updatedRecord },
    learningErrors: errors,
  };
  writeRaw(STORAGE_KEYS.mastery, next.mastery);
  writeRaw(STORAGE_KEYS.learningErrors, next.learningErrors);
  return next;
}

function emptyCell(): MasteryCell {
  return { level: 'unknown', evidenceCount: 0 };
}
