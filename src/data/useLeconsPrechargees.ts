// src/data/useLeconsPrechargees.ts — Phase A découpage bundle (2026-10-16).
//
// Précharge l'index des leçons (fetch `tutor/lesson-index.json`, émis par le
// build — plugin kunz-tutor-lesson-json) au premier montage d'une vue du
// tuteur, puis force un re-rendu à l'arrivée des données. Idempotent :
// plusieurs vues partagent la même promesse (lessonIndexRuntime).

import { useEffect, useState } from 'react';
import { chargerLessonIndex, lessonIndexChargee } from './lessonIndexRuntime';

export function useLeconsPrechargees(): boolean {
  const [pretes, setPretes] = useState(lessonIndexChargee());
  useEffect(() => {
    if (lessonIndexChargee()) return;
    let vivant = true;
    chargerLessonIndex().then(() => {
      if (vivant && lessonIndexChargee()) setPretes(true);
    });
    return () => {
      vivant = false;
    };
  }, []);
  return pretes;
}
