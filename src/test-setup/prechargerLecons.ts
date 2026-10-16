// src/test-setup/prechargerLecons.ts — setupFiles vitest (Phase A découpage
// bundle, 2026-10-16).
//
// En production, l'index des leçons arrive par fetch (tutor/lesson-index.json,
// préchargé par les vues AITutorView et SearchView). En test, pas de serveur :
// on injecte directement le module TS généré dans le runtime partagé du
// moteur (src/data/lessonIndexRuntime.ts). Import dynamique + top-level
// await : rejoué avant CHAQUE fichier de test (isolation vitest), l'état
// injecté est celui du graphe de modules du worker.

import { definirLessonIndex } from '../data/lessonIndexRuntime';

const mod = await import('../data/lessonIndex');
await definirLessonIndex(mod.LESSON_INDEX);
