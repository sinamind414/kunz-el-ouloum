// src/data/useBasesTuteur.ts — Phases A+B découpage bundle (2026-10-16).
//
// Précharge les bases dynamiques du tuteur (fetch des JSON émis par le build
// — plugin kunz-tutor-bases-json :
//   · tutor/lesson-index.json — index des leçons, Phase A (lessonIndexRuntime) ;
//   · tutor/knowledge.json    — opuscules, Phase B (tutorKnowledgeRuntime)) —
// au premier montage d'une vue du tuteur, puis force un re-rendu à l'arrivée
// des données. Idempotent : plusieurs vues partagent les mêmes promesses.

import { useEffect, useState } from 'react';
import { chargerLessonIndex, lessonIndexChargee } from './lessonIndexRuntime';
import { chargerTutorKnowledge, tutorKnowledgeChargee } from './tutorKnowledgeRuntime';

export function useBasesTuteurPrechargees(): boolean {
  const [pretes, setPretes] = useState(lessonIndexChargee() && tutorKnowledgeChargee());
  useEffect(() => {
    if (lessonIndexChargee() && tutorKnowledgeChargee()) return;
    let vivant = true;
    Promise.all([chargerLessonIndex(), chargerTutorKnowledge()]).then(() => {
      if (vivant && lessonIndexChargee() && tutorKnowledgeChargee()) setPretes(true);
    });
    return () => {
      vivant = false;
    };
  }, []);
  return pretes;
}
