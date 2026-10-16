// scripts/emit_lesson_index_json.ts — GÉNÉRATION BUILD (Phases A et B du
// découpage bundle, 2026-10-16). Appelé par le plugin Vite
// `kunz-tutor-bases-json` (vite.config.ts) : bundle esbuild → import → JSON
// émis dans dist/tutor/lesson-index.json (547 chunks) et
// dist/tutor/knowledge.json (428 chunks opuscules), récupérés par fetch par
// src/data/lessonIndexRuntime.ts et src/data/tutorKnowledgeRuntime.ts.
//
// Aucune transformation de contenu : les données restent EXACTEMENT celles
// des modules sources (verrou src/build/tutorLeconsJson.lock.test.ts à chaque
// `npm run test:build`).

import { LESSON_INDEX } from '../src/data/lessonIndex';
import { TUTOR_KNOWLEDGE } from '../src/tutorKnowledge';

export const donnees = LESSON_INDEX;
export const donneesOpus = TUTOR_KNOWLEDGE;
