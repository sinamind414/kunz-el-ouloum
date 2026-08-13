import { describe, expect, it } from 'vitest';
import { ACTIVE_LESSONS, LESSON_PROGRESSION } from './activeLessons';
import { LESSON_GOLD_SUMMARIES } from './lessonGoldSummaries';
import { LESSON_TRANSFER_CHALLENGES } from './lessonTransferChallenges';
import { CONCEPT_ROUTES } from './conceptRoutes';
import { DOCUMENT_PRACTICE_CONTEXTS } from './documentPracticeContexts';
import { SPACED_RECALL_PROMPTS } from './spacedRecallPrompts';
import { MICRO_REMEDIATIONS } from './microRemediations';
import { HTML_LESSON_ORDER, getNextHtmlLessonKey } from './htmlLessonProgression';
import { INITIAL_UNITS } from '../data';
import {
  detectCycle,
  findDuplicateQuestionIds,
  buildExerciseIdSet,
} from './curriculumIntegrity';

const VALID_NEXT_ACTIONS = ['retry_document', 'open_reflex', 'schedule_recall'] as const;

const ACTIVE_LESSON_KEYS = new Set(Object.keys(ACTIVE_LESSONS));
const PROGRESSION_KEYS = new Set(Object.keys(LESSON_PROGRESSION));
const GOLD_SUMMARY_KEYS = new Set(Object.keys(LESSON_GOLD_SUMMARIES));

const UNIT_IDS = new Set(INITIAL_UNITS.map((u) => u.id));

const DOCUMENT_EXERCISE_IDS = buildExerciseIdSet(DOCUMENT_PRACTICE_CONTEXTS);

function findLessonIdsWithoutProgression(): string[] {
  return Array.from(ACTIVE_LESSON_KEYS).filter((id) => !PROGRESSION_KEYS.has(id));
}

const MODERN_DOCUMENTS = DOCUMENT_PRACTICE_CONTEXTS.filter(
  (ctx) => ctx.sourceStatus != null
);

// ----- 1. Graphe actif sans route fantôme -----
describe('Progression active', () => {
  it('nextLessonId pointe vers une leçon active existante', () => {
    const missing: string[] = [];
    for (const [lessonId, prog] of Object.entries(LESSON_PROGRESSION)) {
      if (prog.nextLessonId && !ACTIVE_LESSON_KEYS.has(prog.nextLessonId)) {
        missing.push(
          `LESSON_PROGRESSION['${lessonId}'].nextLessonId = '${prog.nextLessonId}' introuvable dans ACTIVE_LESSONS`
        );
      }
    }
    expect(missing, 'Routes fantômes détectées').toEqual([]);
  });

  it('chaque entrée LESSON_PROGRESSION a un completionMessageAr', () => {
    for (const [id, prog] of Object.entries(LESSON_PROGRESSION)) {
      expect(
        prog.completionMessageAr,
        `LESSON_PROGRESSION['${id}'] n'a pas de completionMessageAr`
      ).toBeTruthy();
    }
  });

  it('LESSON_PROGRESSION n\'a pas d\'entrées hors ACTIVE_LESSONS', () => {
    const extra = Object.keys(LESSON_PROGRESSION).filter(
      (id) => !ACTIVE_LESSON_KEYS.has(id)
    );
    expect(extra, 'Entrées LESSON_PROGRESSION sans leçon active correspondante').toEqual([]);
  });
});

// ----- 2. Aucune référence vers document inexistant -----
describe('Références document', () => {
  it('CONCEPT_ROUTES.documentExerciseId existe dans DOCUMENT_PRACTICE_CONTEXTS', () => {
    const missing: string[] = [];
    for (const [conceptId, route] of Object.entries(CONCEPT_ROUTES)) {
      if (route.documentExerciseId && !DOCUMENT_EXERCISE_IDS.has(route.documentExerciseId)) {
        missing.push(
          `CONCEPT_ROUTES['${conceptId}'].documentExerciseId = '${route.documentExerciseId}' introuvable dans DOCUMENT_PRACTICE_CONTEXTS`
        );
      }
    }
    expect(missing, 'Références vers document inexistant').toEqual([]);
  });
});

// ----- 3. Routes conceptuelles -----
describe('Routes conceptuelles', () => {
  it('lessonId des routes existe dans ACTIVE_LESSONS', () => {
    const missing: string[] = [];
    for (const [conceptId, route] of Object.entries(CONCEPT_ROUTES)) {
      if (route.lessonId && !ACTIVE_LESSON_KEYS.has(route.lessonId)) {
        missing.push(
          `CONCEPT_ROUTES['${conceptId}'].lessonId = '${route.lessonId}' introuvable dans ACTIVE_LESSONS`
        );
      }
    }
    expect(missing, 'Routes vers leçon inexistante').toEqual([]);
  });

  it('unitId des routes existe dans INITIAL_UNITS', () => {
    const bad: string[] = [];
    for (const [conceptId, route] of Object.entries(CONCEPT_ROUTES)) {
      if (route.unitId != null && !UNIT_IDS.has(route.unitId)) {
        bad.push(
          `CONCEPT_ROUTES['${conceptId}'].unitId = ${route.unitId} introuvable dans INITIAL_UNITS`
        );
      }
    }
    expect(bad, 'Routes vers unité inexistante').toEqual([]);
  });
});

// ----- 4. Aucun rappel orphelin -----
describe('Rappels espacés', () => {
  it('chaque concept de SPACED_RECALL_PROMPTS a exactement 4 prompts (stages 0-3)', () => {
    const bad: string[] = [];
    for (const [conceptId, prompts] of Object.entries(SPACED_RECALL_PROMPTS)) {
      if (prompts.length !== 4) {
        bad.push(`SPACED_RECALL_PROMPTS['${conceptId}'] a ${prompts.length} prompts (attendu: 4)`);
        continue;
      }
      const stages = prompts.map((p) => p.stage).sort((a, b) => a - b);
      if (stages[0] !== 0 || stages[1] !== 1 || stages[2] !== 2 || stages[3] !== 3) {
        bad.push(`SPACED_RECALL_PROMPTS['${conceptId}'] a des stages non ordonnés: [${stages}]`);
      }
    }
    expect(bad, 'Rappels mal configurés').toEqual([]);
  });

  it('chaque prompt a conceptId cohérent, questionAr et acceptedEvidence non vides, minEvidence >= 1', () => {
    const violations: string[] = [];
    for (const [conceptId, prompts] of Object.entries(SPACED_RECALL_PROMPTS)) {
      for (const prompt of prompts) {
        if (prompt.conceptId !== conceptId) {
          violations.push(
            `SPACED_RECALL_PROMPTS['${conceptId}'] contient prompt avec conceptId='${prompt.conceptId}' incohérent`
          );
        }
        if (!prompt.questionAr?.trim()) {
          violations.push(`SPACED_RECALL_PROMPTS['${conceptId}'] stage ${prompt.stage}: questionAr vide`);
        }
        if (!prompt.acceptedEvidence?.length) {
          violations.push(`SPACED_RECALL_PROMPTS['${conceptId}'] stage ${prompt.stage}: acceptedEvidence vide`);
        }
        if (prompt.minEvidence < 1) {
          violations.push(`SPACED_RECALL_PROMPTS['${conceptId}'] stage ${prompt.stage}: minEvidence = ${prompt.minEvidence} (< 1)`);
        }
      }
    }
    expect(violations, 'Rappels avec contrat non respecté').toEqual([]);
  });

  it('chaque concept de rappel existe dans CONCEPT_ROUTES', () => {
    const conceptRoutesIds = new Set(Object.keys(CONCEPT_ROUTES));
    const orphan = Object.keys(SPACED_RECALL_PROMPTS).filter(
      (id) => !conceptRoutesIds.has(id)
    );
    expect(orphan, 'Rappels orphelins sans route conceptuelle').toEqual([]);
  });
});

// ----- 5. Aucune micro-reprise orpheline -----
describe('Micro-reprises', () => {
  it('chaque MicroRemediation a un conceptId dans CONCEPT_ROUTES', () => {
    const routeIds = new Set(Object.keys(CONCEPT_ROUTES));
    const orphan: string[] = [];
    for (const [key, mr] of Object.entries(MICRO_REMEDIATIONS)) {
      if (!routeIds.has(mr.conceptId)) {
        orphan.push(`MICRO_REMEDIATIONS['${key}'].conceptId = '${mr.conceptId}' introuvable dans CONCEPT_ROUTES`);
      }
    }
    expect(orphan, 'Micro-reprises orphelines').toEqual([]);
  });

  it('estimatedMinutes entre 2 et 4', () => {
    const bad: string[] = [];
    for (const [key, mr] of Object.entries(MICRO_REMEDIATIONS)) {
      if (mr.estimatedMinutes < 2 || mr.estimatedMinutes > 4) {
        bad.push(`MICRO_REMEDIATIONS['${key}'].estimatedMinutes = ${mr.estimatedMinutes} (attendu: 2-4)`);
      }
    }
    expect(bad, 'estimatedMinutes hors intervalle').toEqual([]);
  });

  it('acceptedEvidence non vide', () => {
    const empty: string[] = [];
    for (const [key, mr] of Object.entries(MICRO_REMEDIATIONS)) {
      if (!mr.acceptedEvidence?.length) {
        empty.push(`MICRO_REMEDIATIONS['${key}'].acceptedEvidence est vide`);
      }
    }
    expect(empty, 'acceptedEvidence absent').toEqual([]);
  });

  it('nextAction est une valeur autorisée', () => {
    const bad: string[] = [];
    for (const [key, mr] of Object.entries(MICRO_REMEDIATIONS)) {
      if (!VALID_NEXT_ACTIONS.includes(mr.nextAction as typeof VALID_NEXT_ACTIONS[number])) {
        bad.push(`MICRO_REMEDIATIONS['${key}'].nextAction = '${mr.nextAction}' non autorisé`);
      }
    }
    expect(bad, 'nextAction invalide').toEqual([]);
  });
});

// ----- 6. Aucun cycle nextLessonId -----
describe('Cycle dans la progression', () => {
  it('LESSON_PROGRESSION ne contient pas de cycle nextLessonId', () => {
    const { hasCycle, path } = detectCycle(LESSON_PROGRESSION);
    expect(
      hasCycle,
      `Cycle détecté dans LESSON_PROGRESSION: ${path.join(' → ')}`
    ).toBe(false);
  });
});

// ----- 7. 44 HTML ordonnés et résolus -----
describe('HTML lessons', () => {
  it('HTML_LESSON_ORDER contient exactement 44 clés', () => {
    expect(HTML_LESSON_ORDER.length).toBe(44);
  });

  it('getNextHtmlLessonKey(dernière leçon) = undefined', () => {
    const last = HTML_LESSON_ORDER[HTML_LESSON_ORDER.length - 1];
    expect(getNextHtmlLessonKey(last)).toBeUndefined();
  });

  it('chaque clé HTML a une leçon suivante dans l\'ordre sauf la dernière', () => {
    for (let i = 0; i < HTML_LESSON_ORDER.length - 1; i++) {
      const next = getNextHtmlLessonKey(HTML_LESSON_ORDER[i]);
      expect(
        next,
        `HTML_LESSON_ORDER[${i}] = '${HTML_LESSON_ORDER[i]}' → getNextHtmlLessonKey aurait dû être '${HTML_LESSON_ORDER[i + 1]}'`
      ).toBe(HTML_LESSON_ORDER[i + 1]);
      expect(
        HTML_LESSON_ORDER.indexOf(next!),
        `'${next}' devrait suivre immédiatement '${HTML_LESSON_ORDER[i]}' mais index diffère`
      ).toBe(i + 1);
    }
  });

  it('aucune clé dupliquée dans HTML_LESSON_ORDER', () => {
    const unique = new Set(HTML_LESSON_ORDER);
    expect(unique.size).toBe(HTML_LESSON_ORDER.length);
  });
});

// ----- 8. Contrat minimum des documents vivants -----
describe('Documents — identifiants', () => {
  // Cette spec exigeait UN SEUL contexte par exercice, alors que la clé de lecture
  // est le couple (exerciseId, questionId) : `getDocumentPracticeContext(ex, q)`.
  // Elle empêchait donc de documenter les questions q2/q3 — et c'est précisément
  // ce manque qui faisait planter `handleValidate` (`context: practice!`).
  // L'invariant utile est l'unicité du COUPLE, vérifiée ci-dessous.
  it('couple (exerciseId, questionId) unique', () => {
    const pairs = DOCUMENT_PRACTICE_CONTEXTS.map((c) => `${c.exerciseId}::${c.questionId}`);
    const dups = pairs.filter((p, i) => pairs.indexOf(p) !== i);
    expect(dups, 'couple en double dans DOCUMENT_PRACTICE_CONTEXTS').toEqual([]);
  });

  it('plusieurs questions d un même exercice peuvent avoir leur propre contexte', () => {
    const perExercise = new Map<string, number>();
    for (const c of DOCUMENT_PRACTICE_CONTEXTS) {
      perExercise.set(c.exerciseId, (perExercise.get(c.exerciseId) ?? 0) + 1);
    }
    // Régression : au moins un exercice documenté sur plus d'une question.
    expect(Math.max(...perExercise.values())).toBeGreaterThan(1);
  });

  it('questionId unique', () => {
    const dups = findDuplicateQuestionIds(DOCUMENT_PRACTICE_CONTEXTS);
    expect(dups, 'questionId en double dans DOCUMENT_PRACTICE_CONTEXTS').toEqual([]);
  });
});

describe('Documents — champs communs', () => {
  it('conceptId non vide', () => {
    const empty: string[] = [];
    for (const ctx of DOCUMENT_PRACTICE_CONTEXTS) {
      if (!ctx.conceptId) {
        empty.push(`Document '${ctx.exerciseId}': conceptId vide`);
      }
    }
    expect(empty, 'Documents sans conceptId').toEqual([]);
  });

  it('vocabulary entre 3 et 8 termes', () => {
    const bad: string[] = [];
    for (const ctx of DOCUMENT_PRACTICE_CONTEXTS) {
      if (ctx.vocabulary.length < 3 || ctx.vocabulary.length > 8) {
        bad.push(`Document '${ctx.exerciseId}': vocabulary.length = ${ctx.vocabulary.length} (attendu: 3-8)`);
      }
    }
    expect(bad, 'Documents avec vocabulary hors plage').toEqual([]);
  });

  it('expectedEvidence non vide', () => {
    const empty: string[] = [];
    for (const ctx of DOCUMENT_PRACTICE_CONTEXTS) {
      if (!ctx.expectedEvidence?.length) {
        empty.push(`Document '${ctx.exerciseId}': expectedEvidence vide`);
      }
    }
    expect(empty, 'Documents sans expectedEvidence').toEqual([]);
  });

  it('observationAr présent', () => {
    const missing: string[] = [];
    for (const ctx of DOCUMENT_PRACTICE_CONTEXTS) {
      if (!ctx.observationAr) {
        missing.push(`Document '${ctx.exerciseId}': observationAr absent`);
      }
    }
    expect(missing, 'Documents sans observationAr').toEqual([]);
  });
});

describe('Documents vivants modernes (sourceStatus défini) — contrat minimum', () => {
  it('promptObserveAr présent', () => {
    const missing: string[] = [];
    for (const ctx of MODERN_DOCUMENTS) {
      if (!ctx.promptObserveAr) {
        missing.push(`Document '${ctx.exerciseId}': promptObserveAr absent`);
      }
    }
    expect(missing, 'Documents vivants sans promptObserveAr').toEqual([]);
  });

  it('promptProduceAr présent', () => {
    const missing: string[] = [];
    for (const ctx of MODERN_DOCUMENTS) {
      if (!ctx.promptProduceAr) {
        missing.push(`Document '${ctx.exerciseId}': promptProduceAr absent`);
      }
    }
    expect(missing, 'Documents vivants sans promptProduceAr').toEqual([]);
  });

  it('hintsAr exactement 2 éléments', () => {
    const bad: string[] = [];
    for (const ctx of MODERN_DOCUMENTS) {
      if (!ctx.hintsAr || ctx.hintsAr.length !== 2) {
        bad.push(
          `Document '${ctx.exerciseId}': hintsAr = ${JSON.stringify(ctx.hintsAr)} (attendu: exactement 2)`
        );
      }
    }
    expect(bad, 'Documents vivants sans exactement 2 hints').toEqual([]);
  });

  it('correctionAr présent', () => {
    const missing: string[] = [];
    for (const ctx of MODERN_DOCUMENTS) {
      if (!ctx.correctionAr) {
        missing.push(`Document '${ctx.exerciseId}': correctionAr absent`);
      }
    }
    expect(missing, 'Documents vivants sans correctionAr').toEqual([]);
  });

  it('criteria.evidence, mechanism, conclusion non vides', () => {
    const bad: string[] = [];
    for (const ctx of MODERN_DOCUMENTS) {
      if (!ctx.criteria) {
        bad.push(`Document '${ctx.exerciseId}': criteria absent`);
        continue;
      }
      if (!ctx.criteria.evidence?.length) {
        bad.push(`Document '${ctx.exerciseId}': criteria.evidence vide`);
      }
      if (!ctx.criteria.mechanism?.length) {
        bad.push(`Document '${ctx.exerciseId}': criteria.mechanism vide`);
      }
      if (!ctx.criteria.conclusion?.length) {
        bad.push(`Document '${ctx.exerciseId}': criteria.conclusion vide`);
      }
    }
    expect(bad, 'Documents vivants avec criteria incomplet').toEqual([]);
  });
});

describe('Documents — cohérence conceptuelle', () => {
  it('chaque document moderne a un conceptId avec micro-reprise', () => {
    const mrConceptIds = new Set(
      Object.values(MICRO_REMEDIATIONS).map((mr) => mr.conceptId)
    );
    const missing: string[] = [];
    for (const ctx of MODERN_DOCUMENTS) {
      if (!ctx.conceptId || ctx.conceptId.startsWith('unit:')) continue;
      if (!mrConceptIds.has(ctx.conceptId)) {
        missing.push(
          `Document '${ctx.exerciseId}' conceptId='${ctx.conceptId}' sans micro-reprise`
        );
      }
    }
    expect(missing, 'Documents modernes sans micro-reprise pour leur concept').toEqual([]);
  });

  it('chaque document a un conceptId avec 4 prompts de rappel', () => {
    const missing: string[] = [];
    for (const ctx of DOCUMENT_PRACTICE_CONTEXTS) {
      if (!ctx.conceptId || ctx.conceptId.startsWith('unit:')) continue;
      const prompts = SPACED_RECALL_PROMPTS[ctx.conceptId];
      if (!prompts || prompts.length < 4) {
        missing.push(
          `Document '${ctx.exerciseId}' conceptId='${ctx.conceptId}' sans 4 prompts de rappel`
        );
      }
    }
    expect(missing, 'Documents sans 4 prompts de rappel pour leur concept').toEqual([]);
  });

  it('chaque document a un conceptId avec route conceptuelle', () => {
    const routeIds = new Set(Object.keys(CONCEPT_ROUTES));
    const missing: string[] = [];
    for (const ctx of DOCUMENT_PRACTICE_CONTEXTS) {
      if (!ctx.conceptId || ctx.conceptId.startsWith('unit:')) continue;
      if (!routeIds.has(ctx.conceptId)) {
        missing.push(
          `Document '${ctx.exerciseId}' conceptId='${ctx.conceptId}' sans CONCEPT_ROUTES`
        );
      }
    }
    expect(missing, 'Documents sans route conceptuelle pour leur concept').toEqual([]);
  });
});

// ----- 9. Toute leçon moderne est reliée -----
describe('Leçons actives — intégrité du parcours', () => {
  const legacyLessonIds = new Set<string>(['lecon_transcription']);
  const modernLessonIds = Array.from(ACTIVE_LESSON_KEYS).filter(
    (id) => !legacyLessonIds.has(id)
  );

  it('toutes les leçons actives ont une progression', () => {
    const missing = findLessonIdsWithoutProgression();
    expect(missing, 'Leçons sans LESSON_PROGRESSION').toEqual([]);
  });

  it('toutes les leçons modernes ont un gold summary', () => {
    const missing = modernLessonIds.filter((id) => !GOLD_SUMMARY_KEYS.has(id));
    expect(missing, 'Leçons modernes sans LESSON_GOLD_SUMMARIES').toEqual([]);
  });

  it('toute leçon moderne a une route conceptuelle', () => {
    const lessonIdInRoutes = new Set(
      Object.values(CONCEPT_ROUTES).map((r) => r.lessonId).filter(Boolean) as string[]
    );
    const missing = modernLessonIds.filter((id) => !lessonIdInRoutes.has(id));
    expect(missing, 'Leçons sans route conceptuelle').toEqual([]);
  });

  it('toute leçon moderne a un document (via route) ou un défi BAC', () => {
    const challengeLessonIds = new Set(
      Object.values(LESSON_TRANSFER_CHALLENGES).map((c) => c.lessonId)
    );
    const docLessonIds = new Set(
      Object.values(CONCEPT_ROUTES)
        .filter((r) => r.lessonId && r.documentExerciseId)
        .map((r) => r.lessonId as string)
    );
    const missing: string[] = [];
    for (const id of modernLessonIds) {
      const hasDoc = docLessonIds.has(id);
      const hasChallenge = challengeLessonIds.has(id);
      if (!hasDoc && !hasChallenge) {
        missing.push(
          `Leçon '${id}' n'a ni document vivant (via CONCEPT_ROUTES) ni défi BAC`
        );
      }
    }
    expect(missing, 'Leçons sans contenu de sortie').toEqual([]);
  });

  it('LESSON_TRANSFER_CHALLENGES ne contient pas de leçon inactive', () => {
    const bad: string[] = [];
    for (const [id, challenge] of Object.entries(LESSON_TRANSFER_CHALLENGES)) {
      if (!ACTIVE_LESSON_KEYS.has(challenge.lessonId)) {
        bad.push(
          `LESSON_TRANSFER_CHALLENGES['${id}'].lessonId = '${challenge.lessonId}' introuvable dans ACTIVE_LESSONS`
        );
      }
    }
    expect(bad, 'Défis BAC vers leçon inactive').toEqual([]);
  });
});
