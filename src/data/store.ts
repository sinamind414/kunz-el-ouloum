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
export type MissionAction = 'knowledge_recall' | 'document_analysis' | 'word_by_word' | 'quiz' | 'review';

export interface MissionStep {
  id: string;
  action: MissionAction;
  titleAr: string;
  expectedMinutes: number;
  conceptId?: string;
  reflexId?: CoreReflexId;
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
  const preservedErrors: LearningError[] = Array.isArray(loose.learningErrors)
    ? loose.learningErrors
    : Array.isArray(loose.errors)
      ? loose.errors
      : [];

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
