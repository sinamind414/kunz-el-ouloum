// src/data/htmlLessonProgression.ts
// Progression canonique des leçons HTML affichées dans LessonsView.
// Générée depuis LESSON_LIBRARY pour éviter tout décalage avec les données pédagogiques.

import { LESSON_LIBRARY } from '../lessonData';

function isTrackedHtmlLesson(key: string): boolean {
  if (key === 'lecon_transcription') return false;
  return key.startsWith('phase');
}

function extractPhaseNumber(key: string): number {
  const m = key.match(/^phase(\d+)_/);
  return m ? Number(m[1]) : Number.MAX_SAFE_INTEGER;
}

function isSplitKey(key: string): boolean {
  const baseMatch = key.match(/^(phase\d+_chapitres_\d+_\d+)/);
  if (!baseMatch) return false;
  return key !== baseMatch[1];
}

export const HTML_LESSON_ORDER: readonly string[] = (() => {
  const entries = LESSON_LIBRARY.filter((l) => isTrackedHtmlLesson(l.key)).map((l) => l.key);
  entries.sort((a, b) => {
    const phaseA = extractPhaseNumber(a);
    const phaseB = extractPhaseNumber(b);
    if (phaseA !== phaseB) return phaseA - phaseB;
    const splitA = isSplitKey(a) ? 1 : 0;
    const splitB = isSplitKey(b) ? 1 : 0;
    if (splitA !== splitB) return splitA - splitB;
    return a.localeCompare(b);
  });
  return entries;
})();

export function getNextHtmlLessonKey(lessonKey: string): string | undefined {
  const index = HTML_LESSON_ORDER.indexOf(lessonKey);
  if (index >= 0 && index < HTML_LESSON_ORDER.length - 1) {
    return HTML_LESSON_ORDER[index + 1];
  }
  return undefined;
}

export function isHtmlLesson(lessonKey: string): boolean {
  return isTrackedHtmlLesson(lessonKey);
}
