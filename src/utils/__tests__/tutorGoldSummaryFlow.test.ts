// tutorGoldSummaryFlow.test.ts
// KEO-RSUM (2026-10-04) — flow « الملخصات الذهبية » du المرشد الذكي :
// « الملخص » → liste des unités → leçons de l'unité → résumé d'or complet.
import { describe, it, expect } from 'vitest';
import {
  handleSummaryFlow,
  lessonsForUnit,
  totalSummaries,
  unitIdsWithSummaries,
  formatGoldSummary,
  type GoldSummaryLesson,
} from '../../tutorGoldSummaryFlow';
import { LESSON_GOLD_SUMMARIES } from '../../data/lessonGoldSummaries';
import { processStudentInput } from '../../smartTutorEngine';
import { getDefaultSession } from '../sessionManager';

const n = (s: string) => handleSummaryFlow(s.trim(), undefined);

describe('Flow الملخصات الذهبية — couverture', () => {
  it('couvre les 11 unités et les 71 résumés', () => {
    expect(unitIdsWithSummaries()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
    expect(totalSummaries()).toBe(71);
    const sumLessonKeys = new Set<string>();
    for (const id of unitIdsWithSummaries()) {
      expect(lessonsForUnit(id).length).toBeGreaterThan(0);
      for (const l of lessonsForUnit(id)) sumLessonKeys.add(l.key);
    }
    expect(sumLessonKeys.size).toBe(totalSummaries());
  });

  it('chaque leçon du flow pointe vers un résumé d\'or réel', () => {
    for (const id of unitIdsWithSummaries()) {
      for (const l of lessonsForUnit(id)) {
        expect(LESSON_GOLD_SUMMARIES[l.key]).toBeDefined();
        expect(l.title.trim().length).toBeGreaterThan(3);
      }
    }
  });
});

describe('Flow الملخصات الذهبية — intention liste', () => {
  it('« الملخص » affiche la liste des unités (11 raccourcis)', () => {
    const r = n('الملخص');
    expect(r).not.toBeNull();
    expect(r!.text).toContain('الملخصات الذهبية');
    expect(r!.text).toContain('الوحدة 1');
    expect(r!.quickActions).toHaveLength(11);
    expect(r!.quickActions[0]).toBe('ملخصات الوحدة 1');
    expect(r!.quickActions[10]).toBe('ملخصات الوحدة 11');
    expect(r!.nextPendingUnit).toBeNull();
  });

  it('déclencheurs alternatifs (arabe + français) donnent la même liste', () => {
    for (const q of [
      'لخص لي',
      'ملخصات الدروس',
      'أريد ملخصات الدروس',
      'اعرض جميع الملخصات',
      'الخلاصات',
      'الملخصات الذهبية',
      'tous les résumés',
      'la liste des resumes',
    ]) {
      const r = n(q);
      expect(r).not.toBeNull();
      expect(r!.quickActions).toHaveLength(11);
    }
  });

  it('ne détourne pas une question de cours (« لخص دور LT4… »)', () => {
    expect(n('لخص دور اللمفاويات LT4 في تنشيط المناعة')).toBeNull();
    expect(n('ما هو الملخص الذهبي للدرس الثالث؟')).toBeNull();
    expect(n('اشرح لي آليات عملية الاستنساخ بالتفصيل')).toBeNull();
  });
});

describe('Flow الملخصات الذهبية — navigation unité → leçon', () => {
  it('« ملخصات الوحدة 4 » liste les leçons de l\'immunité', () => {
    const r = handleSummaryFlow('ملخصات الوحدة 4', null);
    expect(r).not.toBeNull();
    expect(r!.text).toContain('الوحدة 4');
    expect(r!.text).toContain('دور البروتينات في الدفاع عن الذات');
    expect(r!.quickActions).toEqual(lessonsForUnit(4).map((l) => l.title));
    expect(r!.nextPendingUnit).toBe(4);
  });

  it('le clic sur un titre de leçon affiche le résumé d\'or complet', () => {
    const lesson: GoldSummaryLesson = lessonsForUnit(4).find(
      (l) => l.key === 'phase6_chapitres_11_12',
    )!;
    expect(lesson).toBeDefined();
    const r = handleSummaryFlow(lesson.title, 4);
    expect(r).not.toBeNull();
    expect(r!.lessonKey).toBe('phase6_chapitres_11_12');
    const gold = LESSON_GOLD_SUMMARIES['phase6_chapitres_11_12'];
    expect(r!.text).toContain(gold.missionAr);
    for (const step of gold.mechanismAr) expect(r!.text).toContain(step);
    expect(r!.text).toContain(gold.evidenceAr);
    for (const v of gold.vocabulary) expect(r!.text).toContain(v);
    expect(r!.text).toContain(gold.commonErrorAr);
    expect(r!.text).toContain(gold.recallQuestionAr);
    expect(r!.text).toContain(gold.bacSentenceFrameAr ?? '');
    expect(r!.quickActions).toContain('ملخصات الوحدة 4');
    expect(r!.quickActions).toContain('قائمة الوحدات');
  });

  it('« قائمة الوحدات » ramène à la liste des unités', () => {
    const r = handleSummaryFlow('قائمة الوحدات', 4);
    expect(r).not.toBeNull();
    expect(r!.text).toContain('الملخصات الذهبية');
    expect(r!.quickActions).toHaveLength(11);
    expect(r!.nextPendingUnit).toBeNull();
  });

  it('hors navigation, « ملخص <عنوان> » donne directement le résumé', () => {
    const r = n('ملخص استنساخ المعلومات الوراثية الموجودة على مستوى ADN');
    expect(r).not.toBeNull();
    expect(r!.lessonKey).toBe('lecon_transcription');
    expect(r!.nextPendingUnit).toBe(1);
  });

  it('formatGoldSummary reste honnête sur un résumé non relu', () => {
    const r = formatGoldSummary(lessonsForUnit(1)[0]);
    expect(r.text).not.toContain('مراجَع من قبل أستاذ');
    expect(r.text).toContain('شرح Kunz');
  });
});

describe('Flow الملخصات الذهبية — intégration processStudentInput', () => {
  it('« الملخص » → unités → leçons → résumé, avec état de session', () => {
    const step1 = processStudentInput(getDefaultSession(), 'الملخص');
    expect(step1.action.text).toContain('الملخصات الذهبية');
    expect(step1.action.quickActions).toHaveLength(11);
    expect(step1.session.pendingSummaryUnit).toBeNull();

    const step2 = processStudentInput(step1.session, 'ملخصات الوحدة 1');
    expect(step2.action.text).toContain('ملخصات الوحدة 1');
    expect(step2.session.pendingSummaryUnit).toBe(1);

    const firstLesson = lessonsForUnit(1)[0];
    const step3 = processStudentInput(step2.session, firstLesson.title);
    expect(step3.action.text).toContain('المهمة');
    expect(step3.action.sources?.[0].type).toBe('lesson');
    expect(step3.action.sources?.[0].title).toBe(firstLesson.title);
    expect(step3.session.pendingSummaryUnit).toBe(1);
  });

  it('le retour à l\'accueil réinitialise la navigation des résumés', () => {
    const browsing = { ...getDefaultSession(), pendingSummaryUnit: 4 as number | null };
    const home = processStudentInput(browsing, 'القائمة الرئيسية');
    expect(home.session.pendingSummaryUnit).toBeUndefined();
  });
});
