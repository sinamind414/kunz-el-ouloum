// d2u7demarche.lock.test.ts — verrou de la leçon active D2-U7 « المسار التجريبي للتنفس »
// (chantier ③ D2-U2, 2026-10-16, autorisation explicite de l'utilisateur pour
// activeLessons.ts + régénération de lessonIndex.ts).
//
// Source : livre scanné (data/bookContent.json, OCR 3755-3897) —
//   ch. 36 [3766-3818] مقر الأكسدة التنفسية (خميرة + الأخضر جانوس + بنية الميتوكوندري)
//   ch. 37 [3819-3885] التحلل السكري (غلوكوز مشع، جداول أ/ب، مخطط الهيولى)
//   ch. 38 [3886-3972] مراحل تفكك حمض البيروفيك (ميتوكوندريات معزولة + حلقة كريبس)
// Le ch. 39 (الفسفرة التأكسدية côté chimiosmose) est déjà couvert par la leçon
// Racker `d2-u7-l1-mitchell-racker` — le nouveau maillon se place AVANT elle,
// dans l'ordre du livre (ch. 36-38 → ch. 39).

import { describe, expect, it } from 'vitest';
import { ACTIVE_LESSONS, LESSON_PROGRESSION } from './activeLessons';
import { LESSON_INDEX, LESSON_INDEX_STATS } from './lessonIndex';
import { OFFICIAL_PROGRAM_SEQUENCE } from './unitLessonSequences';

const CLE = 'd2-u7-l2-demarche-respiration';
const PRECEDENTE = 'd2-u6-l3-calvin';
const SUIVANTE = 'd2-u7-l1-mitchell-racker';

function textesLecon(): string {
  const lecon = ACTIVE_LESSONS[CLE];
  expect(lecon, `la leçon ${CLE} doit exister dans ACTIVE_LESSONS`).toBeTruthy();
  return JSON.stringify(lecon);
}

describe('leçon active D2-U7 : المسار التجريبي للتنفس (livre ch. 36-38)', () => {
  it('existe, avec au moins 5 blocs couvrant les 3 chapitres du livre', () => {
    const lecon = ACTIVE_LESSONS[CLE];
    expect(lecon).toBeTruthy();
    expect(lecon!.blocks.length).toBeGreaterThanOrEqual(5);
    const types = new Set(lecon!.blocks.map((b) => b.type));
    for (const t of [
      'MISSION_CHOICE',
      'HYPOTHESIS_EXPERIMENT', // ch. 36 : خميرة + الأخضر جانوس
      'DUAL_EVIDENCE', // ch. 37 : الغلوكوز المشع, جداول أ/ب
      'SEQUENCE_ORDER', // ch. 37 : مراحل التحلل السكري في الهيولى
      'GUIDED_DOC_QA', // ch. 36 بنية + ch. 38 ميتوكوندريات معزولة
    ]) {
      expect(types.has(t as never), `bloc attendu manquant : ${t}`).toBe(true);
    }
  });

  it('porte les ancrages verbatim du livre (chiffres et termes intacts)', () => {
    const t = textesLecon();
    for (const ancre of [
      'الميتوكوندري',
      'أخضر جانوس',
      'الهيولى',
      'حمض البيروفيك',
      'أستيل مرافق الإنزيم',
      'حلقة كريبس',
      'المادة الأساسية',
    ]) {
      expect(t.includes(ancre), `ancre manquante : ${ancre}`).toBe(true);
    }
    // Dimensions du livre (ch. 36, doc 2) — les SEULS nombres fiables de l'OCR :
    for (const nombre of ['0.5', '0.1', '2 ميكرون', '0.5 ميكرون']) {
      expect(t.includes(nombre), `nombre du livre manquant : ${nombre}`).toBe(true);
    }
  });

  it("s'insère dans la progression Calvin → démarche → Racker (ordre du livre)", () => {
    expect(LESSON_PROGRESSION[PRECEDENTE]?.nextLessonId).toBe(CLE);
    expect(LESSON_PROGRESSION[CLE]?.nextLessonId).toBe(SUIVANTE);
    expect(LESSON_PROGRESSION[SUIVANTE]?.nextLessonId).toBeUndefined();
    for (const k of [PRECEDENTE, CLE, SUIVANTE]) {
      expect(
        LESSON_PROGRESSION[k]?.completionMessageAr,
        `completionMessageAr manquant pour ${k}`,
      ).toBeTruthy();
    }
  });

  it("figure dans la séquence officielle de l'unité 7, avant Racker", () => {
    const seq = OFFICIAL_PROGRAM_SEQUENCE[7];
    expect(seq?.includes(CLE), `${CLE} absent de la séquence U7`).toBe(true);
    expect(seq!.indexOf(CLE)).toBeLessThan(seq!.indexOf(SUIVANTE));
  });

  it('est indexée pour le tuteur (lessonIndex régénéré, unitId 7)', () => {
    const chunks = LESSON_INDEX.filter((c) => c.lessonKey === CLE);
    expect(chunks.length, 'aucun chunk lessonIndex pour la nouvelle leçon').toBeGreaterThan(0);
    expect(chunks.every((c) => c.unitId === 7), 'unitId attendu : 7').toBe(true);
    expect(LESSON_INDEX_STATS.lessonsActive).toBe(Object.keys(ACTIVE_LESSONS).length);
  });
});
