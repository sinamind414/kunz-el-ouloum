// src/lib/lesson/sessionEffectsService.test.ts
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { applySessionEffect, buildEffectsForEvent, buildTransferEvidenceEffect, buildSnapshotEffect, buildDocumentTraceEffect, runSessionEffects } from './sessionEffectsService';
import { recordLessonTransferEvidence } from '../../services/masteryEvidenceService';
import { saveLessonSnapshot, clearLessonSnapshot } from './sessionSnapshotService';
import { recordDocumentTrace } from '../../services/documentEvidenceService';
import fs from 'fs';
import path from 'path';

vi.mock('../../services/masteryEvidenceService', () => ({
  recordLessonTransferEvidence: vi.fn(),
}));

vi.mock('./sessionSnapshotService', () => ({
  saveLessonSnapshot: vi.fn(),
  clearLessonSnapshot: vi.fn(),
}));

vi.mock('../../services/documentEvidenceService', () => ({
  recordDocumentTrace: vi.fn(),
}));

describe('sessionEffectsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it('RECORD_TRANSFER_EVIDENCE délègue à masteryEvidenceService', () => {
    applySessionEffect(
      buildTransferEvidenceEffect({
        eventId: 'evt-1',
        lessonId: 'lesson-1',
        conceptId: 'concept-1',
        reflexId: 'analyse',
        score: 80,
        ruleIds: [],
      })
    );

    expect(vi.mocked(recordLessonTransferEvidence)).toHaveBeenCalledWith({
      lessonId: 'lesson-1',
      conceptId: 'concept-1',
      reflexId: 'analyse',
      score: 80,
      ruleIds: [],
    });
  });

  it('SAVE_SNAPSHOT délègue à sessionSnapshotService', () => {
    const mockedSave = vi.mocked(saveLessonSnapshot);
    mockedSave.mockReturnValue(true);

    applySessionEffect(
      buildSnapshotEffect({
        eventId: 'evt-2',
        lessonId: 'lesson-1',
        snapshot: {
          lessonId: 'lesson-1',
          state: 'BLOCKS_IN_PROGRESS',
          currentBlockIndex: 0,
          validatedBlocks: [false],
          outcome: null,
          feedbackViewed: false,
          suspendedAt: Date.now(),
        },
        action: 'SAVE_SNAPSHOT',
      })
    );

    expect(mockedSave).toHaveBeenCalledWith('lesson-1', expect.objectContaining({ state: 'BLOCKS_IN_PROGRESS' }));
  });

  it('CLEAR_SNAPSHOT délègue à sessionSnapshotService', () => {
    const mockedClear = vi.mocked(clearLessonSnapshot);
    mockedClear.mockReturnValue(true);

    applySessionEffect(
      buildSnapshotEffect({
        eventId: 'evt-3',
        lessonId: 'lesson-1',
        action: 'CLEAR_SNAPSHOT',
      })
    );

    expect(mockedClear).toHaveBeenCalledWith('lesson-1');
  });

  it('E1 — SUBMIT_DOCUMENT_ATTEMPT valide appelle recordDocumentTrace', () => {
    const mockedRecord = vi.mocked(recordDocumentTrace);

    applySessionEffect(
      buildDocumentTraceEffect({
        eventId: 'evt-e1',
        lessonId: 'lesson-1',
        exerciseId: 'uracile_marque',
        questionId: 'q1',
        answer: 'la photosynthèse convertit la lumière en énergie chimique',
        validationResult: {
          score: 80,
          maxScore: 100,
          passed: true,
          threshold: 70,
          errors: [],
          matchedLois: [1, 2],
          brokenLois: [],
          suggestions: [],
          xp: 80,
          label: 'valid',
          meta: { normalizedLength: 10, docType: 'qualitative', actionVerb: 'analyse', checksRun: ['length', 'keywords'] },
        },
      })
    );

    expect(mockedRecord).toHaveBeenCalled();
  });

  it('E2 — SUBMIT_DOCUMENT_ATTEMPT invalide crée une erreur', () => {
    const mockedRecord = vi.mocked(recordDocumentTrace);

    applySessionEffect(
      buildDocumentTraceEffect({
        eventId: 'evt-e2',
        lessonId: 'lesson-1',
        exerciseId: 'uracile_marque',
        questionId: 'q1',
        answer: 'réponse courte',
        validationResult: {
          score: 30,
          maxScore: 100,
          passed: false,
          threshold: 70,
          errors: [{ code: 'MISSING_OBSERVATION', severity: 'critical', loi: null, messageAr: 'missing observation' }],
          matchedLois: [],
          brokenLois: [],
          suggestions: ['ajoutez une observation'],
          xp: 30,
          label: 'invalid',
          meta: { normalizedLength: 5, docType: 'qualitative', actionVerb: 'analyse', checksRun: ['length'] },
        },
      })
    );

    expect(mockedRecord).toHaveBeenCalled();
    const callArgs = mockedRecord.mock.calls[0][0];
    expect(callArgs.validationResult.passed).toBe(false);
  });

  it('E3 — SUBMIT_BAC_ATTEMPT valide appelle recordLessonTransferEvidence', () => {
    applySessionEffect(
      buildTransferEvidenceEffect({
        eventId: 'evt-e3',
        lessonId: 'lesson-1',
        conceptId: 'concept-1',
        reflexId: 'analyse',
        score: 85,
        ruleIds: ['R1', 'R2'],
      })
    );

    expect(vi.mocked(recordLessonTransferEvidence)).toHaveBeenCalledWith({
      lessonId: 'lesson-1',
      conceptId: 'concept-1',
      reflexId: 'analyse',
      score: 85,
      ruleIds: ['R1', 'R2'],
    });
  });

  it('E4 — même eventId rejoué est ignoré (idempotence)', async () => {
    const results = await runSessionEffects([
      buildSnapshotEffect({
        eventId: 'evt-dup',
        lessonId: 'lesson-1',
        snapshot: { lessonId: 'lesson-1', state: 'BLOCKS_IN_PROGRESS', currentBlockIndex: 0, validatedBlocks: [], outcome: null, feedbackViewed: false, suspendedAt: Date.now() },
        action: 'SAVE_SNAPSHOT',
      }),
      buildSnapshotEffect({
        eventId: 'evt-dup',
        lessonId: 'lesson-1',
        snapshot: { lessonId: 'lesson-1', state: 'BLOCKS_IN_PROGRESS', currentBlockIndex: 0, validatedBlocks: [], outcome: null, feedbackViewed: false, suspendedAt: Date.now() },
        action: 'SAVE_SNAPSHOT',
      }),
    ]);

    expect(results[0].skipped).toBe(false);
    expect(results[1].skipped).toBe(true);
  });

  it('E4 — deux intentions distinctes ne se neutralisent pas', async () => {
    const effects = [
      buildSnapshotEffect({ eventId: 'evt-intent-1', lessonId: 'lesson-1', action: 'CLEAR_SNAPSHOT' }),
      buildSnapshotEffect({ eventId: 'evt-intent-2', lessonId: 'lesson-1', action: 'CLEAR_SNAPSHOT' }),
    ];

    const results = await runSessionEffects(effects);

    expect(results.every((result) => !result.skipped)).toBe(true);
  });

  it('E4 — le cache idempotent évince les événements au-delà de sa borne', async () => {
    const effects = Array.from({ length: 501 }, (_, index) =>
      buildSnapshotEffect({ eventId: `evt-fifo-${index}`, lessonId: 'lesson-1', action: 'CLEAR_SNAPSHOT' })
    );

    await runSessionEffects(effects);
    const replay = await runSessionEffects([effects[0]]);

    expect(replay[0].skipped).toBe(false);
  });

  it('E4 — buildEffectsForEvent conserve l\'identifiant créé par l\'intention', () => {
    const effects = buildEffectsForEvent(
      { type: 'VALIDATE_BLOCK', blockIndex: 0 },
      { state: 'EXIT_PRACTICE', currentBlockIndex: 0, validatedBlocks: [true], totalBlocks: 1, outcome: null, feedbackViewed: false },
      'lesson-1',
      'session-1-attempt-1',
    );

    expect(effects[0].eventId).toBe('session-1-attempt-1');
  });

  it('E5 — SAVE_SNAPSHOT délègue à sessionSnapshotService avec état SUSPENDED', () => {
    const mockedSave = vi.mocked(saveLessonSnapshot);
    mockedSave.mockReturnValue(true);

    applySessionEffect(
      buildSnapshotEffect({
        eventId: 'evt-e5',
        lessonId: 'lesson-1',
        snapshot: {
          lessonId: 'lesson-1',
          state: 'SESSION_SUSPENDED',
          currentBlockIndex: 2,
          validatedBlocks: [true, true, false],
          outcome: null,
          feedbackViewed: false,
          suspendedAt: Date.now(),
        },
        action: 'SAVE_SNAPSHOT',
      })
    );

    expect(mockedSave).toHaveBeenCalledWith('lesson-1', expect.objectContaining({ state: 'SESSION_SUSPENDED' }));
  });

  it('E6 — InteractiveLessonView et LiveDocumentUracile n\'importent pas de services interdits directement', () => {
    const forbidden = ['recordDocumentTrace', 'recordLessonTransferEvidence', 'scheduleSpacedRecall', 'recordEvidence', 'writeRaw'];
    const viewSource = fs.readFileSync(path.join(__dirname, '../../components/InteractiveLessonView.tsx'), 'utf-8');
    const liveDocSource = fs.readFileSync(path.join(__dirname, '../../components/LiveDocumentUracile.tsx'), 'utf-8');
    for (const fn of forbidden) {
      expect(viewSource).not.toContain(fn);
      expect(liveDocSource).not.toContain(fn);
    }
  });
});
