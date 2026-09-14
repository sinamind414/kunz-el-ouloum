// ValidationEngine.errata.test.ts
// Branchement errata + non-exigibles dans ValidationEngine — HINT non pénalisant.
//
// Contrats vérifiés :
//   1. ERRATA_MANUEL : une réponse contenant une forme erronée du manuel
//      (ex. TTX/TEA inversés) reçoit un hint ERRATA_MANUEL avec la forme
//      correcte officielle, SANS aucune perte de score (severity hint = 0 pt).
//   2. NON_EXIGIBLES : une réponse mobilisant un terme du manuel écarté du
//      BAC (المتمم، مبدأ الأسيلوسكوب، نضج الـ ARNm) reçoit un hint
//      NON_EXIGIBLE_BAC, sans pénalité — règle d'or L5 p.6.
//   3. Non-régression : les hints n'apparaissent JAMAIS seuls (score intact)
//      et ne brisent aucune loi (brokenLois inchangé).

import { describe, expect, it } from 'vitest';
import { validateAnswer } from './ValidationEngine';
import { SEVERITY_PENALTY } from './scoring';

const BASE_CTX = {
  docType: 'quantitative',
  actionVerb: 'analyse',
  isNeuromuscular: true,
} as const;

describe('ValidationEngine — errata officiels (دليل الأستاذ)', () => {
  it('une réponse complète contenant l’erreur TTX/TEA du manuel garde son score complet + hint ERRATA_MANUEL', () => {
    const sansErrata = validateAnswer(
      'كلما زاد تركيز الناقل العصبي كلما قصر زمن كمون اللوحة المحركة PPM، إذ تنخفض قيمته من 10 ملي ثانية إلى 5 ملي ثانية، مما يدل على تحرر أكبر للأستيل كولين عبر قنوات مرتبطة بالربيطة',
      { ...BASE_CTX, expectedTargets: ['قنوات'] },
    );
    const avecErrata = validateAnswer(
      'كلما زاد تركيز الناقل العصبي كلما قصر زمن كمون اللوحة المحركة PPM، إذ تنخفض قيمته من 10 ملي ثانية إلى 5 ملي ثانية، مما يدل على تحرر أكبر للأستيل كولين عبر قنوات مرتبطة بالربيطة. Tetraethyl-ammonium مادة مثبطة لانتقال Na⁺',
      { ...BASE_CTX, expectedTargets: ['قنوات'] },
    );

    expect(avecErrata.errors.some((e) => e.code === 'ERRATA_MANUEL' && e.severity === 'hint')).toBe(true);
    // Non-pénalisant : le score ne baisse pas d'un point.
    expect(avecErrata.score).toBe(sansErrata.score);
    expect(avecErrata.passed).toBe(sansErrata.passed);
    expect(avecErrata.brokenLois).toEqual(sansErrata.brokenLois);
  });

  it('le hint ERRATA_MANUEL porte la correction officielle (forme correcte) en expected', () => {
    const res = validateAnswer(
      'Tetrodotoxine مادة مثبطة لانتقال K⁺ عند غشاء الليف العصبي حيث تدوم التجربة 10 ملي ثانية',
      { ...BASE_CTX, expectedTargets: ['غشاء'] },
    );
    const hint = res.errors.find((e) => e.code === 'ERRATA_MANUEL');
    expect(hint).toBeDefined();
    expect(hint?.expected).toContain('Tetrodotoxine');
  });

  it('une réponse saine ne déclenche AUCUN hint d’errata', () => {
    const res = validateAnswer(
      'كلما زاد تركيز الكورار كلما انخفض الانقباض العضلي',
      { docType: 'qualitative', qualitativeTrend: true, actionVerb: 'analyse', isNeuromuscular: false },
    );
    expect(res.errors.some((e) => e.code === 'ERRATA_MANUEL')).toBe(false);
    expect(res.errors.some((e) => e.code === 'NON_EXIGIBLE_BAC')).toBe(false);
  });
});

describe('ValidationEngine — non-exigibles BAC (التدرج السنوي p.6)', () => {
  it('المتمم (complément) : crédit sans pénalité, hint NON_EXIGIBLE_BAC', () => {
    const cible = 'المتمم';
    const res = validateAnswer(
      'نفترض أن بروتينات المتمم تتدخل في التحلل عبر تكوين قنوات غشائية على سطح البكتيريا',
      {
        docType: 'mixed',
        actionVerb: 'hypothesize',
        isNeuromuscular: false,
        expectedTargets: [cible],
      },
    );
    const hint = res.errors.find((e) => e.code === 'NON_EXIGIBLE_BAC');
    expect(hint).toBeDefined();
    expect(hint?.severity).toBe('hint');
    expect(hint?.found).toBe(cible);
    // Vocab reconnu (crédit) ET hint informatif : l'élève n'est ni sanctionné ni bloqué.
    expect(res.score).toBeGreaterThanOrEqual(10);
    expect(SEVERITY_PENALTY.hint).toBe(0);
  });

  it('نضج الـ ARNm : hint sans baisse de score', () => {
    const sans = validateAnswer(
      'نفترض أن إنزيم الاستنساخ العكسي يشكل ADN مزدوج من ARN الفيروسي قبل الإدماج في ADN الخلية LT4',
      { docType: 'mixed', actionVerb: 'hypothesize', isNeuromuscular: false, expectedTargets: ['إنزيم'] },
    );
    const avec = validateAnswer(
      'نفترض أن نضج الـ ARNm يسبق خروجه من النواة عبر المسام نحو الهيولى حيث تجري الترجمة',
      { docType: 'mixed', actionVerb: 'hypothesize', isNeuromuscular: false, expectedTargets: ['نضج الـ ARNm'] },
    );
    expect(avec.errors.some((e) => e.code === 'NON_EXIGIBLE_BAC' && e.severity === 'hint')).toBe(true);
    // Hint = 0 pt de pénalité : la note n'est pas plafonnée par le flag.
    expect(avec.errors.filter((e) => e.severity !== 'hint')).toHaveLength(sans.errors.filter((e) => e.severity !== 'hint').length);
  });

  it('un terme NON exigible utilisé dans une réponse complète n’empêche pas la réussite', () => {
    const res = validateAnswer(
      'كلما زاد تركيز الناقل العصبي كلما قصر زمن كمون اللوحة المحركة PPM، إذ تنخفض قيمته من 10 ملي ثانية إلى 5 ملي ثانية، مما يدل على تحرر أكبر للأستيل كولين عبر قنوات مرتبطة بالربيطة. مبدأ الأسيلوسكوب يسمح بمتابعة التسجيل',
      { ...BASE_CTX, expectedTargets: ['مبدأ الأسيلوسكوب', 'قنوات'] },
    );
    expect(res.errors.some((e) => e.code === 'NON_EXIGIBLE_BAC')).toBe(true);
    expect(res.passed).toBe(true);
    expect(res.brokenLois).toHaveLength(0);
  });
});

describe('ValidationEngine — non-régression T1–T16 avec les nouveaux checks', () => {
  it('T12 (bonne réponse quanti NM) : score >= 16, xp 15, brokenLois vide — hints inclus', () => {
    const res = validateAnswer(
      'كلما زاد تركيز الناقل العصبي كلما قصر زمن كمون اللوحة المحركة PPM، إذ تنخفض قيمته من 10 ملي ثانية إلى 5 ملي ثانية، مما يدل على تحرر أكبر للأستيل كولين عبر قنوات مرتبطة بالربيطة',
      { docType: 'quantitative', actionVerb: 'analyse', isNeuromuscular: true },
    );
    expect(res.score).toBeGreaterThanOrEqual(16);
    expect(res.xp).toBe(15);
    expect(res.brokenLois).toHaveLength(0);
    expect(res.errors.some((e) => e.code === 'ERRATA_MANUEL')).toBe(false);
    expect(res.errors.some((e) => e.code === 'NON_EXIGIBLE_BAC')).toBe(false);
    expect(res.meta.checksRun).toContain('ERRATA_OFFICIEL');
    expect(res.meta.checksRun).toContain('NON_EXIGIBLES');
  });
});
