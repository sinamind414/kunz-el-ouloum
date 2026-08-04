import { describe, expect, it } from 'vitest';
import { HTML_LESSON_ORDER, getNextHtmlLessonKey, isHtmlLesson } from '../data/htmlLessonProgression';

describe('htmlLessonProgression', () => {
  it('contient exactement 44 leçons HTML dans l\'ordre', () => {
    expect(HTML_LESSON_ORDER).toHaveLength(44);
  });

  it('commence par phase1_chapitres_1_2', () => {
    expect(HTML_LESSON_ORDER[0]).toBe('phase1_chapitres_1_2');
  });

  it('finit par phase22_chapitres_43_44_2', () => {
    expect(HTML_LESSON_ORDER[44 - 1]).toBe('phase22_chapitres_43_44_2');
  });

  it('chaque phase de base est suivie de sa continuation _2', () => {
    for (let i = 0; i < 22; i++) {
      const base = `phase${i + 1}_chapitres_${i * 2 + 1}_${i * 2 + 2}`;
      const split = `${base}_2`;
      const baseIdx = HTML_LESSON_ORDER.indexOf(base);
      const splitIdx = HTML_LESSON_ORDER.indexOf(split);
      expect(baseIdx).toBeGreaterThanOrEqual(0);
      expect(splitIdx).toBe(baseIdx + 1);
    }
  });

  it('getNextHtmlLessonKey retourne la leçon suivante', () => {
    expect(getNextHtmlLessonKey('phase1_chapitres_1_2')).toBe('phase1_chapitres_1_2_2');
    expect(getNextHtmlLessonKey('phase1_chapitres_1_2_2')).toBe('phase2_chapitres_3_4');
    expect(getNextHtmlLessonKey('phase22_chapitres_43_44')).toBe('phase22_chapitres_43_44_2');
  });

  it('getNextHtmlLessonKey retourne undefined pour la dernière leçon', () => {
    expect(getNextHtmlLessonKey('phase22_chapitres_43_44_2')).toBeUndefined();
  });

  it('getNextHtmlLessonKey retourne undefined pour une leçon absente', () => {
    expect(getNextHtmlLessonKey('inexistante')).toBeUndefined();
  });

  it('isHtmlLesson identifie les leçons HTML', () => {
    expect(isHtmlLesson('phase1_chapitres_1_2')).toBe(true);
    expect(isHtmlLesson('phase22_chapitres_43_44_2')).toBe(true);
    expect(isHtmlLesson('lecon_transcription')).toBe(false);
    expect(isHtmlLesson('lecon2_transcription')).toBe(false);
  });
});
