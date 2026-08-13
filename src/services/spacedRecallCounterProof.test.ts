// Contre-epreuve inversee des surfaces de correction (cf. constat #38).
//
// Un correcteur peut trahir l'eleve de DEUX facons, et aucune ne leve d'erreur :
// en laissant passer une mauvaise reponse (#37), ou en refusant une bonne (#38).
// Les tests de ce fichier eprouvent donc chaque surface dans les deux sens, sur
// les DONNEES REELLES de l'application et via ses SERVICES REELS.
import { beforeEach, describe, expect, it } from 'vitest';

import { ACTIVE_LESSONS } from '../data/activeLessons';
import { SPACED_RECALL_PROMPTS } from '../data/spacedRecallPrompts';
import type { SpacedRecallPrompt } from '../data/spacedRecallPrompts';
import { recordSpacedRecallAttempt } from './spacedRecallService';
import { validateKeywordAnswer } from './proteinChapterValidationService';

const HORS_SUJET = 'احب كرة القدم كثيرا جدا في المساء مع اصدقائي';

function faireRecall(conceptId: string) {
  return {
    id: `recall_${conceptId}`,
    conceptId,
    stage: 0 as const,
    nextReviewAt: 0,
    createdAt: 0,
  };
}

function toutesLesCartes(): { conceptId: string; prompt: SpacedRecallPrompt }[] {
  return Object.entries(SPACED_RECALL_PROMPTS).flatMap(([conceptId, prompts]) =>
    prompts.map((prompt) => ({ conceptId, prompt })),
  );
}

function questionsGuidees() {
  return Object.values(ACTIVE_LESSONS).flatMap((lesson) =>
    (lesson.blocks ?? []).flatMap((block) =>
      block.type === 'GUIDED_DOC_QA'
        ? block.questions.map((question) => ({ lessonId: lesson.id, question }))
        : [],
    ),
  );
}

describe('contre-epreuve des rappels espaces', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('accepte une reponse portant les preuves attendues par la carte (48/48)', () => {
    const refuses = toutesLesCartes().filter(({ conceptId, prompt }) => {
      const bonne = `${prompt.acceptedEvidence.join(' و ')}.`;
      return !recordSpacedRecallAttempt({
        recall: faireRecall(conceptId),
        prompt,
        answer: bonne,
      }).passed;
    });

    expect(refuses.map((r) => `${r.conceptId}/s${r.prompt.stage}`)).toEqual([]);
  });

  it('refuse une reponse hors sujet sur chaque carte', () => {
    const acceptes = toutesLesCartes().filter(
      ({ conceptId, prompt }) =>
        recordSpacedRecallAttempt({
          recall: faireRecall(conceptId),
          prompt,
          answer: HORS_SUJET,
        }).passed,
    );

    expect(acceptes.map((r) => `${r.conceptId}/s${r.prompt.stage}`)).toEqual([]);
  });

  it("la defense repose sur minEvidence, pas sur les douze lois", () => {
    // Documente la dependance mesuree : le ValidationEngine seul accorde la
    // moyenne a un hors-sujet ; c'est le seuil de preuves qui protege la
    // surface. Abaisser minEvidence rouvrirait la faille.
    const { conceptId, prompt } = toutesLesCartes()[0];
    const resultat = recordSpacedRecallAttempt({
      recall: faireRecall(conceptId),
      prompt,
      answer: HORS_SUJET,
    });

    expect(prompt.minEvidence).toBeGreaterThan(0);
    expect(resultat.matchedEvidence.length).toBeLessThan(prompt.minEvidence);
  });
});

describe('contre-epreuve des questions guidees de lecon', () => {
  it("aucune question n'est infranchissable", () => {
    const impossibles = questionsGuidees().filter(({ question }) => {
      const requis = question.requiredKeywords ?? [];
      if (requis.length === 0) return false;
      return !validateKeywordAnswer(requis.join(' '), requis, question.forbiddenKeywords ?? [])
        .valid;
    });

    expect(impossibles.map((q) => q.question.id)).toEqual([]);
  });

  it('exige des mots-cles sur chaque question (aucune ne valide tout texte non vide)', () => {
    const sansExigence = questionsGuidees().filter(
      ({ question }) => (question.requiredKeywords ?? []).length === 0,
    );

    expect(sansExigence.map((q) => q.question.id)).toEqual([]);
  });

  it("resiste largement a une reponse generique en sac de mots", () => {
    // Mesure de reference : 2 questions sur 22 seulement sont franchies par un
    // empilement de termes du chapitre. Ce test fige la borne : si une
    // modification rendait la correction nettement plus permissive, il casse.
    const sacDeMots = 'ADN ARNm بروتين A P تحت وحدة كبرى تحت وحدة صغرى الكودون مضاد الكودون ARNt';
    const toutes = questionsGuidees();
    const franchies = toutes.filter(
      ({ question }) =>
        validateKeywordAnswer(
          sacDeMots,
          question.requiredKeywords ?? [],
          question.forbiddenKeywords ?? [],
        ).valid,
    );

    expect(toutes.length).toBeGreaterThanOrEqual(22);
    expect(franchies.length).toBeLessThanOrEqual(2);
  });
});
