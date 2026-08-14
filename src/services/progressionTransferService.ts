import type { Unit, UserProgress } from '../types';
import {
  MAX_ACTIVE_ERRORS,
  MAX_EVIDENCES,
  MAX_RESOLVED_ERRORS,
  STORAGE_KEYS,
  STORAGE_VERSION,
  type LearningError,
  type MasteryCell,
  type MasteryEvidence,
  type MasteryRecord,
  type RecallItem,
  loadStore,
} from '../data/store';
import type { LessonSessionSnapshot } from '../lib/lesson/sessionSnapshotService';
import { DATA_VERSION } from '../config/appConfig';
import { EDITORIAL_OVERRIDE_PREFIX } from './editorialReviewService';

export const PROGRESSION_TRANSFER_FORMAT = 'kunz-progression';
export const PROGRESSION_TRANSFER_VERSION = 1;
export const SNAPSHOT_KEY_PREFIX = 'kunz_lesson_session_v1:';
const MAX_IMPORT_BYTES = 5 * 1024 * 1024;
const MAX_SNAPSHOTS = 100;

interface UnitProgress {
  id: number;
  progress: number;
  isLocked: boolean;
}

export interface ProgressionTransferFile {
  format: typeof PROGRESSION_TRANSFER_FORMAT;
  version: typeof PROGRESSION_TRANSFER_VERSION;
  exportedAt: string;
  data: {
    progress: UserProgress;
    units: UnitProgress[];
    learningErrors: LearningError[];
    evidences: MasteryEvidence[];
    mastery: Record<string, MasteryRecord>;
    recalls: RecallItem[];
    snapshots: LessonSessionSnapshot[];
    editorialOverrides?: Record<string, { reviewed: boolean; reviewedBy?: string; reviewedAt?: string; sourceProgram?: string; locallyDeclared?: boolean }>;
  };
}

export interface ProgressionImportPreview {
  exportedAt: string;
  xp: number;
  completedUnits: number;
  errors: number;
  evidences: number;
  masteredCells: number;
  recalls: number;
  snapshots: number;
  editorialOverrides: number;
}

export type ProgressionImportResult =
  | { ok: true; file: ProgressionTransferFile; preview: ProgressionImportPreview }
  | { ok: false; error: string };

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);
const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);
const isNonNegativeInteger = (value: unknown): value is number =>
  Number.isSafeInteger(value) && isFiniteNumber(value) && value >= 0;
const isString = (value: unknown): value is string => typeof value === 'string';

function isProgress(value: unknown): value is UserProgress {
  if (!isObject(value) || !isNonNegativeInteger(value.xp) || !isNonNegativeInteger(value.streak)) return false;
  if (!isNonNegativeInteger(value.completedQuestionsCount) || !isNonNegativeInteger(value.studyMinutes)) return false;
  if (!Array.isArray(value.completedUnits) || !value.completedUnits.every(isNonNegativeInteger)) return false;
  const stats = value.flashcardStats;
  if (!isObject(stats)) return false;
  if (!['again', 'hard', 'good', 'easy'].every((key) => isNonNegativeInteger(stats[key]))) return false;
  if (!Array.isArray(value.quizScoreHistory) || value.quizScoreHistory.length > 10_000) return false;
  return value.quizScoreHistory.every((entry) => isObject(entry)
    && isString(entry.date)
    && isNonNegativeInteger(entry.score)
    && isNonNegativeInteger(entry.total)
    && entry.score <= entry.total
    && isString(entry.unitTitle));
}

function isUnitProgress(value: unknown): value is UnitProgress {
  return isObject(value)
    && isNonNegativeInteger(value.id)
    && isFiniteNumber(value.progress)
    && value.progress >= 0
    && value.progress <= 100
    && typeof value.isLocked === 'boolean';
}

const REFLEX_IDS = new Set(['analyse', 'interpret', 'compare', 'hypothesize', 'explain', 'validate']);
const DIMENSIONS = new Set(['knowledge', 'document', 'methodology']);
const SOURCES = new Set(['quiz', 'document_analysis', 'lesson_transfer', 'word_by_word']);

function isEvidence(value: unknown): value is MasteryEvidence {
  return isObject(value)
    && isString(value.id) && value.id.length > 0
    && isString(value.conceptId) && value.conceptId.length > 0
    && isString(value.dimension) && DIMENSIONS.has(value.dimension)
    && (value.reflexId === undefined || (isString(value.reflexId) && REFLEX_IDS.has(value.reflexId)))
    && isString(value.source) && SOURCES.has(value.source)
    && isFiniteNumber(value.score) && value.score >= 0 && value.score <= 100
    && isNonNegativeInteger(value.createdAt)
    && (value.relatedErrorIds === undefined
      || (Array.isArray(value.relatedErrorIds) && value.relatedErrorIds.every(isString)));
}

function isLearningError(value: unknown): value is LearningError {
  return isObject(value)
    && isString(value.id) && value.id.length > 0
    && isString(value.kind) && DIMENSIONS.has(value.kind)
    && (value.conceptId === undefined || isString(value.conceptId))
    && (value.unitId === undefined || isNonNegativeInteger(value.unitId))
    && (value.reflexId === undefined || (isString(value.reflexId) && REFLEX_IDS.has(value.reflexId)))
    && Array.isArray(value.ruleIds) && value.ruleIds.every(isString)
    && isString(value.labelAr)
    && isNonNegativeInteger(value.count)
    && isNonNegativeInteger(value.createdAt)
    && isNonNegativeInteger(value.lastSeenAt)
    && isNonNegativeInteger(value.reviewStartedAt)
    && isNonNegativeInteger(value.reviewStage) && value.reviewStage <= 3
    && isNonNegativeInteger(value.nextReviewAt)
    && (value.resolvedAt === undefined || isNonNegativeInteger(value.resolvedAt));
}

function isRecall(value: unknown): value is RecallItem {
  return isObject(value)
    && isString(value.id) && value.id.length > 0
    && (value.lessonId === undefined || isString(value.lessonId))
    && isString(value.conceptId) && value.conceptId.length > 0
    && (value.reflexId === undefined || (isString(value.reflexId) && REFLEX_IDS.has(value.reflexId)))
    && isNonNegativeInteger(value.stage) && value.stage <= 3
    && isNonNegativeInteger(value.nextReviewAt)
    && isNonNegativeInteger(value.createdAt)
    && (value.sourceEvidenceId === undefined || isString(value.sourceEvidenceId))
    && (value.relatedErrorId === undefined || isString(value.relatedErrorId))
    && (value.questionAr === undefined || isString(value.questionAr))
    && (value.completedAt === undefined || isNonNegativeInteger(value.completedAt));
}

const SESSION_STATES = new Set(['MISSION_VISIBLE', 'BLOCKS_IN_PROGRESS', 'EXIT_PRACTICE', 'COMPLETION_VISIBLE', 'SESSION_SUSPENDED']);
const SESSION_OUTCOMES = new Set(['passed', 'doc_only', 'failed', 'aborted']);

function isSnapshot(value: unknown): value is LessonSessionSnapshot {
  return isObject(value)
    && isString(value.lessonId) && value.lessonId.length > 0 && value.lessonId.length <= 200
    && isString(value.state) && SESSION_STATES.has(value.state)
    && isNonNegativeInteger(value.currentBlockIndex)
    && Array.isArray(value.validatedBlocks) && value.validatedBlocks.length <= 1_000
    && value.validatedBlocks.every((item) => typeof item === 'boolean')
    && (value.outcome === null || (isString(value.outcome) && SESSION_OUTCOMES.has(value.outcome)))
    && typeof value.feedbackViewed === 'boolean'
    && isNonNegativeInteger(value.suspendedAt);
}

function isMasteryExport(value: unknown): value is Record<string, MasteryRecord> {
  if (!isObject(value)) return false;
  const levels = new Set(['unknown', 'needs_work', 'developing', 'mastered']);
  const isCell = (cell: unknown): cell is MasteryCell => isObject(cell)
    && isString(cell.level) && levels.has(cell.level)
    && isNonNegativeInteger(cell.evidenceCount)
    && (cell.lastEvidenceAt === undefined || isNonNegativeInteger(cell.lastEvidenceAt))
    && (cell.lastScore === undefined || (isFiniteNumber(cell.lastScore) && cell.lastScore >= 0 && cell.lastScore <= 100));
  return Object.entries(value).every(([conceptId, record]) => conceptId.length > 0
    && isObject(record)
    && record.conceptId === conceptId
    && isCell(record.knowledge)
    && isCell(record.document)
    && isObject(record.methodology)
    && Object.entries(record.methodology).every(([reflexId, cell]) => REFLEX_IDS.has(reflexId) && isCell(cell)));
}

function emptyCell(): MasteryCell {
  return { level: 'unknown', evidenceCount: 0 };
}

function sanitizeProgress(progress: UserProgress): UserProgress {
  return {
    xp: progress.xp,
    streak: progress.streak,
    completedUnits: [...progress.completedUnits],
    completedQuestionsCount: progress.completedQuestionsCount,
    studyMinutes: progress.studyMinutes,
    flashcardStats: {
      again: progress.flashcardStats.again,
      hard: progress.flashcardStats.hard,
      good: progress.flashcardStats.good,
      easy: progress.flashcardStats.easy,
    },
    quizScoreHistory: progress.quizScoreHistory.map(({ date, score, total, unitTitle }) => ({
      date,
      score,
      total,
      unitTitle,
    })),
  };
}

function sanitizeLearningError(error: LearningError): LearningError {
  return {
    id: error.id,
    kind: error.kind,
    conceptId: error.conceptId,
    unitId: error.unitId,
    reflexId: error.reflexId,
    ruleIds: [...error.ruleIds],
    labelAr: error.labelAr,
    count: error.count,
    createdAt: error.createdAt,
    lastSeenAt: error.lastSeenAt,
    reviewStartedAt: error.reviewStartedAt,
    reviewStage: error.reviewStage,
    nextReviewAt: error.nextReviewAt,
    resolvedAt: error.resolvedAt,
  };
}

function sanitizeEvidence(evidence: MasteryEvidence): MasteryEvidence {
  return {
    id: evidence.id,
    conceptId: evidence.conceptId,
    dimension: evidence.dimension,
    reflexId: evidence.reflexId,
    source: evidence.source,
    score: evidence.score,
    createdAt: evidence.createdAt,
    relatedErrorIds: evidence.relatedErrorIds ? [...evidence.relatedErrorIds] : undefined,
  };
}

function sanitizeRecall(recall: RecallItem): RecallItem {
  return {
    id: recall.id,
    lessonId: recall.lessonId,
    conceptId: recall.conceptId,
    reflexId: recall.reflexId,
    stage: recall.stage,
    nextReviewAt: recall.nextReviewAt,
    sourceEvidenceId: recall.sourceEvidenceId,
    relatedErrorId: recall.relatedErrorId,
    questionAr: recall.questionAr,
    createdAt: recall.createdAt,
    completedAt: recall.completedAt,
  };
}

function sanitizeSnapshot(snapshot: LessonSessionSnapshot): LessonSessionSnapshot {
  return {
    lessonId: snapshot.lessonId,
    state: snapshot.state,
    currentBlockIndex: snapshot.currentBlockIndex,
    validatedBlocks: [...snapshot.validatedBlocks],
    outcome: snapshot.outcome,
    feedbackViewed: snapshot.feedbackViewed,
    suspendedAt: snapshot.suspendedAt,
  };
}

// Imported mastery labels are never trusted: derive them again from actual evidence.
export function rebuildMastery(evidences: MasteryEvidence[]): Record<string, MasteryRecord> {
  const mastery: Record<string, MasteryRecord> = {};
  for (const evidence of [...evidences].sort((a, b) => a.createdAt - b.createdAt)) {
    const record = mastery[evidence.conceptId] ?? {
      conceptId: evidence.conceptId,
      knowledge: emptyCell(),
      document: emptyCell(),
      methodology: {},
    };
    const previous = evidence.dimension === 'methodology'
      ? record.methodology[evidence.reflexId ?? 'analyse'] ?? emptyCell()
      : record[evidence.dimension];
    const evidenceCount = previous.evidenceCount + 1;
    const strongProduction = evidence.source !== 'quiz' && evidence.score >= 80;
    const level = evidence.score < 50
      ? 'needs_work'
      : evidenceCount >= 3 && strongProduction
        ? 'mastered'
        : 'developing';
    const next: MasteryCell = { level, evidenceCount, lastEvidenceAt: evidence.createdAt, lastScore: evidence.score };
    if (evidence.dimension === 'methodology') {
      if (evidence.reflexId) record.methodology[evidence.reflexId] = next;
    } else {
      record[evidence.dimension] = next;
    }
    mastery[evidence.conceptId] = record;
  }
  return mastery;
}

function collectEditorialOverrides(): Record<string, { reviewed: boolean; reviewedBy?: string; reviewedAt?: string; sourceProgram?: string; locallyDeclared?: boolean }> {
  const overrides: Record<string, { reviewed: boolean; reviewedBy?: string; reviewedAt?: string; sourceProgram?: string; locallyDeclared?: boolean }> = {};
  try {
    for (let index = 0; index < localStorage.length; index++) {
      const key = localStorage.key(index);
      if (!key?.startsWith(EDITORIAL_OVERRIDE_PREFIX)) continue;
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const parsed: unknown = JSON.parse(raw);
      if (isObject(parsed) && typeof parsed.reviewed === 'boolean') {
        overrides[key] = { reviewed: parsed.reviewed, reviewedBy: isString(parsed.reviewedBy) ? parsed.reviewedBy : undefined, reviewedAt: isString(parsed.reviewedAt) ? parsed.reviewedAt : undefined, sourceProgram: isString(parsed.sourceProgram) ? parsed.sourceProgram : undefined, locallyDeclared: parsed.locallyDeclared === true ? true : undefined };
      }
    }
  } catch {}
  return overrides;
}

function readSnapshots(): LessonSessionSnapshot[] {
  const snapshots: LessonSessionSnapshot[] = [];
  try {
    for (let index = 0; index < localStorage.length; index++) {
      const key = localStorage.key(index);
      if (!key?.startsWith(SNAPSHOT_KEY_PREFIX)) continue;
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const parsed: unknown = JSON.parse(raw);
      if (isSnapshot(parsed)) snapshots.push(sanitizeSnapshot(parsed));
    }
  } catch {
    return snapshots;
  }
  return snapshots;
}

export function createProgressionExport(progress: UserProgress, units: Unit[]): ProgressionTransferFile {
  const store = loadStore();
  const evidences = store.evidences.filter(isEvidence).map(sanitizeEvidence);
  return {
    format: PROGRESSION_TRANSFER_FORMAT,
    version: PROGRESSION_TRANSFER_VERSION,
    exportedAt: new Date().toISOString(),
    data: {
      progress: sanitizeProgress(progress),
      units: units.map(({ id, progress: unitProgress, isLocked }) => ({ id, progress: unitProgress, isLocked })),
      learningErrors: store.learningErrors.filter(isLearningError).map(sanitizeLearningError),
      evidences,
      mastery: rebuildMastery(evidences),
      recalls: store.recalls.filter(isRecall).map(sanitizeRecall),
      snapshots: readSnapshots(),
      editorialOverrides: collectEditorialOverrides(),
    },
  };
}

function makePreview(file: ProgressionTransferFile): ProgressionImportPreview {
  const trustedMastery = rebuildMastery(file.data.evidences);
  const masteredCells = Object.values(trustedMastery).reduce((total, record) =>
    total
    + (record.knowledge.level === 'mastered' ? 1 : 0)
    + (record.document.level === 'mastered' ? 1 : 0)
    + Object.values(record.methodology).filter((cell) => cell?.level === 'mastered').length, 0);
  return {
    exportedAt: file.exportedAt,
    xp: file.data.progress.xp,
    completedUnits: file.data.progress.completedUnits.length,
    errors: file.data.learningErrors.length,
    evidences: file.data.evidences.length,
    masteredCells,
    recalls: file.data.recalls.length,
    snapshots: file.data.snapshots.length,
    editorialOverrides: Object.keys(file.data.editorialOverrides ?? {}).length,
  };
}

export function validateProgressionImport(text: string): ProgressionImportResult {
  if (new Blob([text]).size > MAX_IMPORT_BYTES) return { ok: false, error: 'Le fichier dépasse la limite de 5 Mo.' };
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { ok: false, error: 'Le fichier ne contient pas un JSON valide.' };
  }
  if (!isObject(parsed) || parsed.format !== PROGRESSION_TRANSFER_FORMAT) {
    return { ok: false, error: 'Ce fichier n’est pas un export de progression Kunz.' };
  }
  if (parsed.version !== PROGRESSION_TRANSFER_VERSION) {
    return { ok: false, error: `Version d’export non prise en charge : ${String(parsed.version)}.` };
  }
  if (!isString(parsed.exportedAt) || !Number.isFinite(Date.parse(parsed.exportedAt)) || !isObject(parsed.data)) {
    return { ok: false, error: 'Les métadonnées de l’export sont invalides.' };
  }
  const data = parsed.data;
  if (!isProgress(data.progress)
    || new Set(data.progress.completedUnits).size !== data.progress.completedUnits.length
    || !Array.isArray(data.units) || data.units.length > 1_000 || !data.units.every(isUnitProgress)
    || new Set(data.units.map((unit) => unit.id)).size !== data.units.length
    || !Array.isArray(data.learningErrors) || data.learningErrors.length > MAX_ACTIVE_ERRORS + MAX_RESOLVED_ERRORS || !data.learningErrors.every(isLearningError)
    || new Set(data.learningErrors.map((error) => error.id)).size !== data.learningErrors.length
    || !Array.isArray(data.evidences) || data.evidences.length > MAX_EVIDENCES || !data.evidences.every(isEvidence)
    || new Set(data.evidences.map((evidence) => evidence.id)).size !== data.evidences.length
    || !isMasteryExport(data.mastery)
    || !Array.isArray(data.recalls) || data.recalls.length > 1_000 || !data.recalls.every(isRecall)
    || new Set(data.recalls.map((recall) => recall.id)).size !== data.recalls.length
    || !Array.isArray(data.snapshots) || data.snapshots.length > MAX_SNAPSHOTS || !data.snapshots.every(isSnapshot)
    || new Set(data.snapshots.map((snapshot) => snapshot.lessonId)).size !== data.snapshots.length
    || (data.editorialOverrides !== undefined && (!isObject(data.editorialOverrides) || !Object.entries(data.editorialOverrides).every(([key, value]) => isString(key) && isObject(value) && typeof value.reviewed === 'boolean' && (value.reviewedBy === undefined || isString(value.reviewedBy)) && (value.reviewedAt === undefined || isString(value.reviewedAt)) && (value.sourceProgram === undefined || isString(value.sourceProgram)))))) {
    return { ok: false, error: 'Le contenu de progression est invalide ou dépasse les limites autorisées.' };
  }
  const file = parsed as unknown as ProgressionTransferFile;
  return { ok: true, file, preview: makePreview(file) };
}

function collectSnapshotKeys(): string[] {
  const keys: string[] = [];
  for (let index = 0; index < localStorage.length; index++) {
    const key = localStorage.key(index);
    if (key?.startsWith(SNAPSHOT_KEY_PREFIX)) keys.push(key);
  }
  return keys;
}

export function applyProgressionImport(file: ProgressionTransferFile, currentUnits: Unit[]): boolean {
  if (!file?.data) return false;
  const mastery = rebuildMastery(file.data.evidences);
  const replacement = new Map<string, string>([
    ['svt_data_version', DATA_VERSION],
    ['svt_progress', JSON.stringify(file.data.progress)],
    [STORAGE_KEYS.userProgress, JSON.stringify(file.data.progress)],
    [STORAGE_KEYS.learningErrors, JSON.stringify(file.data.learningErrors)],
    [STORAGE_KEYS.missions, JSON.stringify([])],
    [STORAGE_KEYS.mastery, JSON.stringify(mastery)],
    [STORAGE_KEYS.evidences, JSON.stringify(file.data.evidences)],
    [STORAGE_KEYS.recalls, JSON.stringify(file.data.recalls)],
    [STORAGE_KEYS.storageMeta, JSON.stringify({ version: STORAGE_VERSION, updatedAt: Date.now() })],
  ]);
  const imported = new Map(file.data.units.map((unit) => [unit.id, unit]));
  replacement.set('svt_units', JSON.stringify(currentUnits.map((unit) => {
    const unitProgress = imported.get(unit.id);
    return unitProgress
      ? { ...unit, progress: unitProgress.progress, isLocked: unitProgress.isLocked }
      : unit;
  })));
  for (const snapshot of file.data.snapshots) {
    replacement.set(`${SNAPSHOT_KEY_PREFIX}${snapshot.lessonId}`, JSON.stringify(snapshot));
  }
  if (file.data.editorialOverrides) {
    for (const [key, value] of Object.entries(file.data.editorialOverrides)) {
      // #59 — Le fichier de sauvegarde est un JSON que l'utilisateur peut
      // editer a la main. Une revue qui en provient n'a donc jamais valeur de
      // validation externe : on la marque comme declaree localement, sinon un
      // aller-retour export/import blanchirait une signature inventee.
      replacement.set(key, JSON.stringify({ ...value, locallyDeclared: true }));
    }
  }

  const existingOverrideKeys: string[] = [];
  for (let index = 0; index < localStorage.length; index++) {
    const key = localStorage.key(index);
    if (key?.startsWith(EDITORIAL_OVERRIDE_PREFIX)) existingOverrideKeys.push(key);
  }
  const affectedKeys = new Set([...replacement.keys(), ...collectSnapshotKeys(), ...existingOverrideKeys]);
  const backup = new Map<string, string | null>();
  for (const key of affectedKeys) backup.set(key, localStorage.getItem(key));
  try {
    for (const key of collectSnapshotKeys()) localStorage.removeItem(key);
    for (const key of existingOverrideKeys) localStorage.removeItem(key);
    for (const [key, value] of replacement) localStorage.setItem(key, value);
    return true;
  } catch {
    try {
      for (const key of affectedKeys) localStorage.removeItem(key);
      for (const key of affectedKeys) {
        const previous = backup.get(key);
        if (previous !== null && previous !== undefined) localStorage.setItem(key, previous);
      }
    } catch {
      // Best-effort rollback when the storage implementation itself is unavailable.
    }
    return false;
  }
}

export function progressionExportFilename(date: Date = new Date()): string {
  return `kunz-progression-${date.toISOString().slice(0, 10)}.json`;
}
