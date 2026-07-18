// src/services/survivalCardValidator.test.ts
// P1.2 — validateur de carte de survie (SpecKit V2 §3.8 / §4 P1.2-B).

import { describe, it, expect } from 'vitest';
import { validateSurvivalCard, isSurvivalCardValid } from './survivalCardValidator';
import type { SurvivalCard } from '../types/survivalCard';

function makeCard(overrides: Partial<SurvivalCard> = {}): SurvivalCard {
  return {
    id: 'sc_test',
    conceptId: 'enzymes',
    coreIdeaAr: 'الإنزيم يخفّض طاقة التنشيط ويزداد المعدل حتى التشبّع.',
    causalChainAr: ['يرتبط', 'يخفّض', 'يزداد', 'يشبع'],
    scoringTerms: ['طاقة', 'موقع', 'تشبّع'],
    evidenceType: 'curve',
    trapAr: 'لا يُستهلك.',
    review: {
      reviewed: true,
      reviewedAt: '2026-06-15',
      reviewedBy: 'Prof. SVT',
      sourceProgram: 'BAC DZ',
    },
    ...overrides,
  };
}

describe('validateSurvivalCard', () => {
  it('accepte une carte valide et revue', () => {
    expect(isSurvivalCardValid(makeCard())).toBe(true);
    expect(validateSurvivalCard(makeCard())).toHaveLength(0);
  });

  it('refuse une idée centrale > 22 mots', () => {
    const card = makeCard({ coreIdeaAr: Array.from({ length: 25 }, () => 'كلمة').join(' ') });
    const issues = validateSurvivalCard(card);
    expect(issues.some((i) => i.field === 'coreIdeaAr' && i.rule === 'max_words')).toBe(true);
  });

  it('refuse une chaîne causale < 3 nœuds', () => {
    const card = makeCard({ causalChainAr: ['a', 'b'] });
    expect(validateSurvivalCard(card).some((i) => i.field === 'causalChainAr')).toBe(true);
  });

  it('refuse une chaîne causale > 6 nœuds', () => {
    const card = makeCard({ causalChainAr: ['1', '2', '3', '4', '5', '6', '7'] });
    expect(validateSurvivalCard(card).some((i) => i.field === 'causalChainAr' && i.rule === 'max_nodes')).toBe(true);
  });

  it('refuse moins de 3 mots-clés', () => {
    const card = makeCard({ scoringTerms: ['a', 'b'] });
    expect(validateSurvivalCard(card).some((i) => i.field === 'scoringTerms')).toBe(true);
  });

  it('refuse plus de 6 mots-clés', () => {
    const card = makeCard({ scoringTerms: ['1', '2', '3', '4', '5', '6', '7'] });
    expect(validateSurvivalCard(card).some((i) => i.field === 'scoringTerms' && i.rule === 'max_terms')).toBe(true);
  });

  it('refuse une carte non revue (brouillon)', () => {
    const card = makeCard({ review: { reviewed: false } });
    const issues = validateSurvivalCard(card);
    expect(issues.some((i) => i.field === 'review' && i.rule === 'review_required')).toBe(true);
    expect(isSurvivalCardValid(card)).toBe(false);
  });

  it('refuse une revue incomplète (manque reviewedBy)', () => {
    const card = makeCard({ review: { reviewed: true, reviewedAt: '2026-06-15', sourceProgram: 'BAC DZ' } });
    expect(validateSurvivalCard(card).some((i) => i.field === 'review')).toBe(true);
  });
});
