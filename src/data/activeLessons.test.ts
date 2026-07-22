// activeLessons.test.ts
// Correction A — fin de leçon + orientation réelle (Speckit FINAL §3).
import { describe, it, expect } from 'vitest';
import { ACTIVE_LESSONS, getLessonProgression, LESSON_PROGRESSION } from '../data/activeLessons';

describe('LessonProgression (§3)', () => {
  it('lecon_transcription → leçon suivante + réflexe', () => {
    const p = getLessonProgression('lecon_transcription');
    expect(p).toBeDefined();
    expect(p!.nextLessonId).toBe('lecon_traduction');
    expect(p!.recommendedReflexId).toBe('explain');
    expect(p!.completionMessageAr).toContain('الاستنساخ');
  });

  it('dernière leçon sans suivante → pas de nextLessonId', () => {
    const p = getLessonProgression('lecon_enzyme');
    expect(p!.nextLessonId).toBeUndefined();
    expect(p!.recommendedReflexId).toBe('hypothesize');
  });

  it('d1-u1-l2-transcription → d1-u1-l3-traduction', () => {
    const p = getLessonProgression('d1-u1-l2-transcription');
    expect(p!.nextLessonId).toBe('d1-u1-l3-traduction');
  });

  it('toutes les progressions ont un message de complétion', () => {
    for (const p of Object.values(LESSON_PROGRESSION)) {
      expect(p.completionMessageAr.length).toBeGreaterThan(0);
    }
  });

  it('enchaîne les trois leçons d immunité avec leur réflexe', () => {
    expect(getLessonProgression('immunity_self_nonself')).toMatchObject({
      nextLessonId: 'immunity_humoral_response',
      recommendedReflexId: 'interpret',
    });
    expect(getLessonProgression('immunity_humoral_response')).toMatchObject({
      nextLessonId: 'immunity_cellular_response',
      recommendedReflexId: 'explain',
    });
    expect(getLessonProgression('immunity_cellular_response')).toMatchObject({
      recommendedReflexId: 'explain',
    });
  });

  it('utilise le schéma sismique réellement disponible', () => {
    const lesson = ACTIVE_LESSONS.seismic_waves;
    expect(lesson.blocks[0]).toMatchObject({
      schemaSrc: '/assets/images/schemas/domaine3_tectonique/schema_14_ondes.svg',
    });
  });
});
