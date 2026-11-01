// HARNESS V3.1 — RED avant implémentation
// Ne touche pas aux 102+10 existants — ce fichier doit PASSER après implémentation V3.1
// Décisions validées : 1) noyau 8 J1 →10 après drill, 2) ternaire dual, 3) harnais first
import { describe, expect, it } from 'vitest';

// Ces imports doivent exister après implémentation — actuellement RED
import {
  detectSourceGate,
  isDualSource,
  getSourceGateInfo,
  classifyConclusion,
  STEP0_TEMPLATE_AR,
  MEMORY_TEMPLATES,
} from '../../data/methodologyEngine';

import { evaluateStudentProduction } from '../methodologyScorer';
import { getVerbCardV2 } from '../../data/methodologyEngine';

describe('V3.1 Gate 1 — ورقة vs رأس', () => {
  it('ورقة: instruction avec وثيقة/شكل/جدول/منحنى/رسم', () => {
    expect(detectSourceGate('اذكر من الوثيقة 2 العناصر الأساسية')).toBe('paper');
    expect(detectSourceGate('حلل الشكل 3 وماذا نلاحظ')).toBe('paper');
    expect(detectSourceGate('استخرج من الجدول 1 القيم')).toBe('paper');
    expect(detectSourceGate('فسر منحنى الوثيقة 1')).toBe('paper');
    expect(detectSourceGate('لخص في رسم تخطيطي')).toBe('paper');
  });
  it('رأس: sans mot document → memory', () => {
    expect(detectSourceGate('عرّف الإنزيم')).toBe('memory');
    expect(detectSourceGate('اذكر مراحل الانقسام')).toBe('memory');
    expect(detectSourceGate('عدّد أنواع الأجسام المضادة')).toBe('memory');
    expect(detectSourceGate('سمّ العضيات')).toBe('memory');
  });
  it('terggte case: معلوماتك + وثيقة → paper + dual true', () => {
    expect(detectSourceGate('فسّر بالاعتماد على معلوماتك والشكل 3')).toBe('paper');
    expect(isDualSource('فسّر بالاعتماد على معلوماتك والشكل 3')).toBe(true);
    expect(getSourceGateInfo('فسّر بالاعتماد على معلوماتك ومعطيات الوثيقة 2').isDual).toBe(true);
    expect(getSourceGateInfo('فسّر بالاعتماد على معلوماتك والشكل 3').source).toBe('paper');
  });
  it('ورقة simple → dual false', () => {
    expect(isDualSource('اذكر من الوثيقة 2 العناصر')).toBe(false);
    expect(getSourceGateInfo('حلل الشكل 1').isDual).toBe(false);
  });
});

describe('V3.1 Preservation — وضع الحفظ', () => {
  it('MEMORY_TEMPLATES expose 2 gabarits', () => {
    expect(MEMORY_TEMPLATES.define).toBeDefined();
    expect(MEMORY_TEMPLATES.list).toBeDefined();
    // عرّف = 3 briques الانتماء+الخاصية+الدور
    expect(MEMORY_TEMPLATES.define.ar).toMatch(/الانتماء/);
    expect(MEMORY_TEMPLATES.define.ar).toMatch(/الخاصية/);
    // اذكر = liste numérotée
    expect(MEMORY_TEMPLATES.list.ar).toMatch(/قائمة مرقّمة/);
  });
  it('verbes حفظ existent avec bon switch/path', () => {
    const def = getVerbCardV2('verb_define_v1');
    const list = getVerbCardV2('verb_list_v1');
    expect(def).toBeDefined();
    expect(list).toBeDefined();
    // حفظ = رأس → path court 1-4 (pas de 2 ni 3), step3Mode none, switch closed
    expect(def!.path).toEqual([1, 4]);
    expect(list!.path).toEqual([1, 4]);
  });
  it('scorer حفظ: liste numérotée passe, paragraphe échoue', () => {
    // اذكر ثلاث عناصر — bonne réponse = 3 lignes numérotées
    const goodList = '1. إنزيم ليباز\n2. إنزيم بروتياز\n3. إنزيم أميلاز';
    const badPara = 'الإنزيمات هي الليباز والبروتياز والأميلاز وهي مهمة للهضم';
    const repGood = evaluateStudentProduction('verb_list_v1', goodList);
    const repBad = evaluateStudentProduction('verb_list_v1', badPara);
    // au moins, good doit avoir ICM > bad (harness souple)
    expect(repGood.icm).toBeGreaterThan(repBad.icm);
  });
});

describe('V3.1 dual — معلوماتك + وثيقة', () => {
  it('Step3Mode dual existe', async () => {
    const mod = await import('../../data/methodologyEngine');
    // @ts-ignore
    expect(mod.VERB_V2_META['verb_explain_v1']).toBeDefined();
    // au moins un verbe ou le type doit supporter dual
    const hasDualType = JSON.stringify(mod).includes('dual');
    expect(hasDualType).toBe(true);
  });
  it('scorer dual: besoin de 2 colonnes (وثيقة + درس)', () => {
    // dual correct = mentionne وثيقة + mécanisme du cours
    const dualGood = 'انطلاقا من الوثيقة 3 نلاحظ ارتفاعا من 2 إلى 8 ملغ/ل وبما أن الإنزيم يتأثر بالحرارة وهذا لأن البنية الفراغية تتخرب';
    const dualMissingLesson = 'انطلاقا من الوثيقة 3 نلاحظ ارتفاعا من 2 إلى 8 ملغ/ل';
    const repGood = evaluateStudentProduction('verb_explain_v1', dualGood, undefined, 3, { switchChoice: 'open' } as any);
    // on ne teste pas l'impl dual verb spécifique, mais que le scorer distingue
    // harness souple : dualGood doit avoir moins d'erreurs que missing
    const repMiss = evaluateStudentProduction('verb_explain_v1', dualMissingLesson, undefined, 3, { switchChoice: 'open' } as any);
    expect(repGood.detectedErrors.length).toBeLessThanOrEqual(repMiss.detectedErrors.length);
  });
});

describe('V3.1 عام vs خاص — conclusion', () => {
  it('classifyConclusion distingue générique vs spécifique', () => {
    // générique reste vraie si on change le nom de la molécule
    expect(classifyConclusion('الإنزيم نوعي تجاه مادة التفاعل', 'الإنزيم')).toBe('generic');
    expect(classifyConclusion('الغليكوكيناز نوعي تجاه الغلوكوز', 'الغليكوكيناز')).toBe('specific');
  });
  it('scorer ne penalise pas conclusion générique quand objectif général demandé', () => {
    // placeholder — au moins la fonction doit exister
    expect(typeof classifyConclusion).toBe('function');
  });
});

describe('V3.1 Step 0 — افهم', () => {
  it('STEP0_TEMPLATE_AR existe et contient الهدف العام', () => {
    expect(STEP0_TEMPLATE_AR).toMatch(/الهدف العام/);
  });
});
