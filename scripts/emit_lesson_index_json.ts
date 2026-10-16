// scripts/emit_lesson_index_json.ts — GÉNÉRATION BUILD (Phase A découpage
// bundle, 2026-10-16). Appelé par le plugin Vite `kunz-tutor-lesson-json`
// (vite.config.ts) : bundle esbuild → import → JSON émis dans
// dist/tutor/lesson-index.json, récupéré par fetch par
// src/data/lessonIndexRuntime.ts.
//
// Aucune transformation de contenu : les données restent EXACTEMENT celles
// du fichier généré src/data/lessonIndex.ts (547 chunks — verrou
// src/data/lessonIndex.lock.test.ts). src/build/tutorLeconsJson.lock.test.ts
// vérifie le résultat à chaque `npm run test:build`.

import { LESSON_INDEX } from '../src/data/lessonIndex';

export const donnees = LESSON_INDEX;
