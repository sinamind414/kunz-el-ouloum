// src/test-setup/prechargerBasesTuteur.ts — setupFiles vitest (Phases A+B du
// découpage bundle, 2026-10-16).
//
// En production, les bases dynamiques du tuteur arrivent par fetch (JSON émis
// par le build, préchargés par les vues AITutorView et SearchView). En test,
// pas de serveur : on injecte directement les modules TS dans les runtimes
// partagés du moteur (lessonIndexRuntime / tutorKnowledgeRuntime). Import
// dynamique + top-level await : rejoué avant CHAQUE fichier de test
// (isolation vitest), l'état injecté est celui du graphe de modules du worker.

import { definirLessonIndex } from '../data/lessonIndexRuntime';
import { definirTutorKnowledge } from '../data/tutorKnowledgeRuntime';

const lecons = await import('../data/lessonIndex');
const opus = await import('../tutorKnowledge');
await definirLessonIndex(lecons.LESSON_INDEX);
await definirTutorKnowledge(opus.TUTOR_KNOWLEDGE);
