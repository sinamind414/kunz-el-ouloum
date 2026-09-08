// lessonModes.ts
// Source de vérité pour la structure de l'onglet الدروس :
//   - Leçon Active (درس نشيط) : leçons TS interactives « mot par mot » (ACTIVE_LESSONS).
//   - Leçon Passive (درس سلبي) : les 23 leçons HTML officielles (public/lessons).
// La Leçon Passive est organisée en 3 domaines du BAC DZ, chaque domaine
// regroupant ses unités, chaque unité listant ses chapitres dans l'ordre canonique
// (OFFICIAL_PROGRAM_SEQUENCE — la même source que le Focus Engine).

import { ACTIVE_LESSONS } from './activeLessons';
import { LESSON_LIBRARY } from '../lessonData';
import { INITIAL_UNITS } from './index';
import { getUnitLessonSequence } from './unitLessonSequences';

export type LessonMode = 'active' | 'passive';

export interface DomainGroup {
  id: number;
  titleAr: string;
  emoji: string;
  unitIds: number[];
}

/** Les 3 domaines du BAC SVT DZ (alignés sur unitCatalog : ids 1-5, 6-8, 9-11). */
export const PASSIVE_DOMAINS: DomainGroup[] = [
  {
    id: 1,
    titleAr: 'البروتينات والمناعة',
    emoji: '🧬',
    unitIds: [1, 2, 3, 4, 5],
  },
  {
    id: 2,
    titleAr: 'التحولات الطاقوية',
    emoji: '⚡',
    unitIds: [6, 7, 8],
  },
  {
    id: 3,
    titleAr: 'التكتونية العامة',
    emoji: '🌍',
    unitIds: [9, 10, 11],
  },
];

/** Les clés HTML sont celles qui ont un fichier dans public/lessons (les autres sont des leçons actives TS). */
export const hasHtmlFile = (key: string): boolean =>
  key === 'lecon_transcription' || key.startsWith('phase');

/** Leçons actives d'une unité, dans l'ordre canonique de l'unité. */
export function getActiveLessonKeysForUnit(unitId: number): string[] {
  return getUnitLessonSequence(unitId).filter((k) => !hasHtmlFile(k) && k in ACTIVE_LESSONS);
}

/** Titre arabe d'une leçon active depuis ACTIVE_LESSONS. */
export function getActiveLessonTitle(key: string): string {
  return ACTIVE_LESSONS[key]?.title ?? key;
}

/** Titre arabe d'une leçon passive depuis LESSON_LIBRARY. */
export function getPassiveLessonTitle(key: string): string {
  const l = LESSON_LIBRARY.find((x) => x.key === key);
  return l ? String(l.titleAr) : key;
}

/** Libellé arabe d'une unité depuis le catalogue. */
export function getUnitTitle(unitId: number): string {
  const u = INITIAL_UNITS.find((x) => x.id === unitId);
  return u ? `${u.id}. ${u.title}` : `الوحدة ${unitId}`;
}
