import { describe, expect, it } from 'vitest';
import { SPACED_RECALL_PROMPTS } from '../data/spacedRecallPrompts';
import { recordSpacedRecallAttempt } from './spacedRecallService';
import type { RecallItem } from '../data/store';

// Ces tests passent par recordSpacedRecallAttempt (le service REELLEMENT execute).
// Repliquer son contexte de validation dans le test reviendrait a tester la copie.

const ALL_PROMPTS = Object.values(SPACED_RECALL_PROMPTS).flat();

function fakeRecall(conceptId: string, stage: number): RecallItem {
  return {
    id: `recall_${conceptId}_${stage}`,
    conceptId,
    stage: stage as RecallItem['stage'],
    nextReviewAt: 0,
  } as RecallItem;
}

/** Reponse "modele" : exactement les preuves que la carte declare acceptables. */
function idealAnswer(evidence: string[]): string {
  return `${evidence.join(' و ')} حسب ما تمت دراسته.`;
}

describe('rappel espace — le correcteur ne se contredit pas', () => {
  it('accepte les 48 reponses construites depuis acceptedEvidence, sans aucun reproche bloquant', () => {
    const reproches: string[] = [];

    for (const prompt of ALL_PROMPTS) {
      const outcome = recordSpacedRecallAttempt({
        recall: fakeRecall(prompt.conceptId, prompt.stage),
        prompt,
        answer: idealAnswer(prompt.acceptedEvidence),
        now: 1,
      });

      const bloquants = outcome.validationResult.errors.filter(
        (e) => e.severity === 'critical' || e.severity === 'major'
      );
      if (bloquants.length > 0) {
        reproches.push(
          `${prompt.conceptId}/s${prompt.stage} (${prompt.reflexId}) -> ${bloquants
            .map((e) => e.code)
            .join(',')}`
        );
      }
    }

    expect(ALL_PROMPTS.length).toBe(48);
    expect(reproches).toEqual([]);
  });

  it("n'exige jamais de valeur chiffree : un rappel se fait sans document sous les yeux", () => {
    // Une carte memoire ne montre aucune courbe : reclamer une unite ou un nombre
    // est structurellement impossible a satisfaire pour l'eleve.
    const fautifs = ALL_PROMPTS.filter((prompt) => {
      const outcome = recordSpacedRecallAttempt({
        recall: fakeRecall(prompt.conceptId, prompt.stage),
        prompt,
        answer: idealAnswer(prompt.acceptedEvidence),
        now: 1,
      });
      return outcome.validationResult.errors.some((e) => e.code === 'MISSING_VALUE_UNIT');
    });

    expect(fautifs.map((p) => `${p.conceptId}/s${p.stage}`)).toEqual([]);
  });

  it('accepte le vocabulaire de tendance (كلما) attendu au BAC', () => {
    const prompt = SPACED_RECALL_PROMPTS['enzymes'][0];
    const outcome = recordSpacedRecallAttempt({
      recall: fakeRecall('enzymes', 0),
      prompt,
      answer: 'كلما زاد تركيز الركيزة زادت السرعة حتى بلوغ التشبع.',
      now: 1,
    });

    expect(
      outcome.validationResult.errors.filter((e) => e.code === 'FORBIDDEN_KULLAMA')
    ).toEqual([]);
    expect(outcome.passed).toBe(true);
  });

  it('continue de refuser une reponse vide ou hors sujet (le correcteur reste exigeant)', () => {
    const prompt = SPACED_RECALL_PROMPTS['enzymes'][0];

    const vide = recordSpacedRecallAttempt({
      recall: fakeRecall('enzymes', 0),
      prompt,
      answer: '',
      now: 1,
    });
    expect(vide.passed).toBe(false);

    const horsSujet = recordSpacedRecallAttempt({
      recall: fakeRecall('enzymes', 0),
      prompt,
      answer: 'لا أعرف الجواب على هذا السؤال إطلاقا.',
      now: 1,
    });
    expect(horsSujet.passed).toBe(false);
  });
});
