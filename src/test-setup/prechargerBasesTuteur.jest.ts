// src/test-setup/prechargerBasesTuteur.jest.ts — parité jest du setup vitest
// prechargerBasesTuteur.ts (Phases A+B du découpage bundle), rattrapage jest
// 2026-10-18.
//
// Le fichier vitest utilise du top-level await (impossible à transformer en
// CJS par babel-jest — voir les exclusions de jest.config.cjs) : côté jest, la
// même injection est faite dans un beforeAll asynchrone, rejoué avant CHAQUE
// fichier de test (ce setup est branché sous setupFilesAfterEnv). Les
// runtimes enregistrent l'index à l'appel : les tests qui le consultent
// pendant l'exécution le trouvent, exactement comme sous vitest.
import { beforeAll, beforeEach } from '@jest/globals';
import { definirLessonIndex } from '../data/lessonIndexRuntime';
import { definirTutorKnowledge } from '../data/tutorKnowledgeRuntime';
import { semerEssai } from './semisEssai';

beforeAll(async () => {
  const lecons = await import('../data/lessonIndex');
  const opus = await import('../tutorKnowledge');
  await definirLessonIndex(lecons.LESSON_INDEX);
  await definirTutorKnowledge(opus.TUTOR_KNOWLEDGE);
});

// Facturation (24/10/2026) : parité jest du semis vitest — la suite voit le
// contenu comme un élève en essai (voir prechargerBasesTuteur.ts).
beforeEach(() => {
  if (typeof localStorage === 'undefined') return;
  semerEssai();
});
