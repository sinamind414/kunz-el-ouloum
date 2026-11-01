// Tests v2 du scorer sous vitest (jsdom).
// Complète tests/boussole.test.ts (harnais natif tsx, CI-friendly) — ne le remplace pas.
import { describe, expect, it } from 'vitest';
import { evaluateStudentProduction } from '../methodologyScorer';
import { TRAINING_EXERCISES } from '../../data/methodologyEngine';

const hasTag = (rep: ReturnType<typeof evaluateStudentProduction>, tag: string) =>
  rep.detectedErrors.some(e => e.tag === tag);

describe('an_c2 — « قيمة + وحدة إن وُجدت »', () => {
  it('texte sans aucun nombre : pas de missing_unit (ex: حلّل sur schéma histologique)', () => {
    const rep = evaluateStudentProduction('verb_analyse_v1',
      'تمثل الوثيقة 1 مقطعاً في ورقة نباتية حيث نلاحظ بشرة علوية شفافة ونسيجاً بالياً غنياً بالبلاستيدات الخضراء وبشرة سفلية تحمل ثغوراً. الاستنتاج: بنية الورقة متكيفة مع وظيفة البناء الضوئي.');
    expect(hasTag(rep, 'missing_unit')).toBe(false);
  });
  it('nombre nu : missing_unit', () => {
    const rep = evaluateStudentProduction('verb_analyse_v1',
      'تمثل الوثيقة 1 منحنى تغير نسبة السكر في الدم حيث نلاحظ ارتفاعاً إلى 1,6 ثم عودة إلى 0,9. الاستنتاج: يضمن التنظيم استقرار نسبة السكر.');
    expect(hasTag(rep, 'missing_unit')).toBe(true);
  });
  it('nombre avec unité : pas de missing_unit', () => {
    const rep = evaluateStudentProduction('verb_analyse_v1',
      'تمثل الوثيقة 1 منحنى تغير نسبة السكر في الدم حيث نلاحظ ارتفاعاً إلى 1,6 غ/ل ثم عودة إلى 0,9 غ/ل. الاستنتاج: يضمن التنظيم استقرار نسبة السكر.');
    expect(hasTag(rep, 'missing_unit')).toBe(false);
  });
});

describe('photosynthesis_07 (chiffres partout)', () => {
  it('expertAnswer : aucune erreur, ICM ≥ 90', () => {
    const ex = TRAINING_EXERCISES.find(e => e.id === 'ex_analyse_photosynthesis_07');
    const rep = evaluateStudentProduction('verb_analyse_v1', ex!.stage1.expertAnswer, undefined, 4, { switchChoice: null });
    expect(rep.detectedErrors.map(e => e.tag)).toEqual([]);
    expect(rep.icm).toBeGreaterThanOrEqual(90);
  });
});
