// conceptRoutes.test.ts
// Correction D — ConceptRoute et routage réel (Speckit FINAL §6).
import { describe, it, expect } from 'vitest';
import {
  CONCEPT_ROUTES,
  getConceptRoute,
  routeErrorToTarget,
} from '../data/conceptRoutes';
import { getPublishableSurvivalCards } from '../data/survivalCards';

describe('ConceptRoute (§6)', () => {
  it('route Enzymes pointe vers carte + leçon + document', () => {
    const r = getConceptRoute('enzymes');
    expect(r).toBeDefined();
    expect(r!.survivalCardId).toBe('sc_enzymes');
    expect(r!.lessonId).toBe('d1-u3-l1-enzyme');
    expect(r!.documentExerciseId).toBe('michaelis_courbe');
  });

  it('route Transcription pointe vers ADN/leçon', () => {
    const r = getConceptRoute('transcription');
    expect(r!.lessonId).toBe('d1-u1-l2-transcription');
    expect(r!.survivalCardId).toBe('sc_adn_proteine');
  });

  it('toutes les routes ont un conceptId', () => {
    for (const [id, r] of Object.entries(CONCEPT_ROUTES)) {
      expect(r.conceptId).toBe(id);
    }
  });
});

describe('Routage réel — priorité (§6)', () => {
  it('sans carte Enzymes publiable, la leçon est ciblée (P1-7 statut honnête)', () => {
    // sc_enzymes n'est PAS publiée tant que la revue enseignant n'est pas traçable.
    const published = getPublishableSurvivalCards().some((c) => c.id === 'sc_enzymes');
    expect(published).toBe(false);
    // Le routage retombe donc sur la leçon active, jamais sur un brouillon.
    const target = routeErrorToTarget('enzymes', { quizUnitId: 3 });
    expect(target.kind).toBe('lesson');
    if (target.kind === 'lesson') expect(target.lessonId).toBe('d1-u3-l1-enzyme');
  });

  it('sans carte publiable, la leçon est ciblée', () => {
    const target = routeErrorToTarget('transcription', { quizUnitId: 1 });
    expect(target.kind).toBe('lesson');
    if (target.kind === 'lesson') expect(target.lessonId).toBe('d1-u1-l2-transcription');
  });

  it('sans route connue, fallback vers quiz unité', () => {
    const target = routeErrorToTarget('concept_inconnu', { quizUnitId: 4 });
    expect(target.kind).toBe('quiz');
    if (target.kind === 'quiz') expect(target.unitId).toBe(4);
  });
});
