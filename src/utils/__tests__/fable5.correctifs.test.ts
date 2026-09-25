// fable5.correctifs.test.ts — verrouille les 5 correctifs de l'audit Fable-5
// (2026-09-25) : (1) \bcar\b, (2) exports morts supprimés, (3) frontières de
// mots dans la couverture de mots-clés, (4) critères def_c1/hyp_c1/list_c2,
// (5) rangement des patches (vérifié par git, pas testé ici).

import { describe, it, expect } from 'vitest';
import { evaluateStudentProduction } from '../methodologyScorer';
import { normalizeAr, motPresentDans } from '../../lib/validation/normalizeAr';

describe('Fable-5 · 1 — \\bcar\\b borne le faux ami « car »', () => {
  it('« carbone » (sous-mot) ne déclenche plus premature_interpretation', () => {
    const rep = evaluateStudentProduction(
      'verb_analyse_v1',
      'نلاحظ أن نسبة الكربون carbone العضوي ترتفع في الوسط من t0 إلى t6.'
    );
    expect(rep.detectedErrors.map((e) => e.tag)).not.toContain('premature_interpretation');
  });

  it('« car » autonome déclenche toujours premature_interpretation', () => {
    const rep = evaluateStudentProduction(
      'verb_analyse_v1',
      'نلاحظ ارتفاع النسبة car ذلك يعود إلى نشاط الإنزيم في الوسط.'
    );
    expect(rep.detectedErrors.map((e) => e.tag)).toContain('premature_interpretation');
  });
});

describe('Fable-5 · 3 — motPresentDans : frontières de mot', () => {
  const n = (s: string) => normalizeAr(s);

  it('un mot-clé court ne matche pas à l’intérieur d’un mot plus long', () => {
    expect(motPresentDans(n('مادنا الخلية'), n('دنا'))).toBe(false);
    expect(motPresentDans(n('ATPase'), n('ATP'))).toBe(false);
  });

  it('la ponctuation arabe (، ؛ ؟) est une frontière, pas un morceau de mot', () => {
    expect(motPresentDans(n('حمض البيروفيك، ثم'), n('حمض البيروفيك'))).toBe(true);
    expect(motPresentDans(n('هل funciona؟'), n('funciona'))).toBe(true);
  });

  it('les clitiques arabes (ال/و/ف/ب/ل/ك) sont acceptés devant le mot-clé', () => {
    expect(motPresentDans(n('يبدأ بالتحلل السكري'), n('التحلل السكري'))).toBe(true);
    expect(motPresentDans(n('والمادة تدور بين'), n('المادة تدور'))).toBe(true);
  });

  it('un mot-clé à l’intérieur d’un mot NON clitic reste introuvable', () => {
    // « مادنا » ne contient pas le mot « دنا » (mim n'est pas un clitique).
    expect(motPresentDans(n('مادنا'), n('دنا'))).toBe(false);
  });

  it('needle vide ne matche jamais', () => {
    expect(motPresentDans(n('أي نص'), n(''))).toBe(false);
  });
});

describe('Fable-5 · 4a — def_c1 accepte les appartenance canoniques élargies', () => {
  const c1 = (text: string) =>
    evaluateStudentProduction('verb_define_v1', text).criteriaResults.find((c) => c.criterionId === 'def_c1')!;

  it('« عبارة عن » (rejeté avant) valide maintenant l’appartenance + propriété', () => {
    expect(
      c1('الإنزيم عبارة عن بروتين حفّاز حيوي يسرّع التفاعلات دون أن يُستهلك.').passed
    ).toBe(true);
  });

  it('« يُعرَّف » valide aussi', () => {
    expect(
      c1('الإنزيم يُعرَّف بأنه بروتين حيوي يتميز بموقع فعّال متخصص.').passed
    ).toBe(true);
  });

  it('la forme canonique « هو » passe toujours', () => {
    expect(
      c1('الإنزيم هو بروتين حفّاز حيوي يسرّع تفاعلاً نوعياً.').passed
    ).toBe(true);
  });

  it('une définition sans appartenance ni propriété échoue toujours', () => {
    expect(c1('الإنزيم مهم للجسم.').passed).toBe(false);
  });
});

describe('Fable-5 · 4b — hyp_c1 exige un système concret (2 marqueurs)', () => {
  const h1 = (text: string) =>
    evaluateStudentProduction('verb_hypothesis_v1', text).criteriaResults.find((c) => c.criterionId === 'hyp_c1')!;

  it('un seul mot biologique générique ne suffit plus', () => {
    expect(h1('نفترض أن البروتين يتأثر بسخونة الجو.').passed).toBe(false);
  });

  it('deux marqueurs en interaction (système concret) valident l’ancrage', () => {
    expect(
      h1('نفترض أن المادة Mtb ترتبط بمستقبل الأدينوزين A1R ومنه يرجع إفراز النورأدرينالين.').passed
    ).toBe(true);
  });

  it('une référence explicite au support valide seule', () => {
    expect(h1('انطلاقاً من الوثيقة 2 نقترح أن الإنزيم يتخرب.').passed).toBe(true);
  });
});

describe('Fable-5 · 4c — list_c2 piloté par expectedCount (3)', () => {
  const l2 = (text: string) =>
    evaluateStudentProduction('verb_list_v1', text).criteriaResults.find((c) => c.criterionId === 'list_c2')!;

  it('3 lignes = nombre exigé → passe', () => {
    expect(l2('1. إنزيم ليباز\n2. إنزيم بروتياز\n3. إنزيم أميلاز').passed).toBe(true);
  });

  it('2 lignes = nombre insuffisant → échoue (l’ancienne fourchette 2-5 passait)', () => {
    expect(l2('1. إنزيم ليباز\n2. إنزيم بروتياز').passed).toBe(false);
  });

  it('5 lignes = dépasse la tolérance (3..4) → échoue', () => {
    expect(
      l2('1. إنزيم ليباز\n2. إنزيم بروتياز\n3. إنزيم أميلاز\n4. إنزيم آخر\n5. إنزيم ثالث').passed
    ).toBe(false);
  });
});

describe('Fable-5 · 2 — pas d’export mort FAUX_AMIS/CONFLITS', () => {
  it('le module dictionnaireCorrecteur n’expose plus les ponts morts', async () => {
    const mod = await import('../../data/dictionaries/dictionnaireCorrecteur');
    expect('FAUX_AMIS' in mod).toBe(false);
    expect('CONFLITS' in mod).toBe(false);
    // Les exports vivants restent.
    expect('ATTENDUS_BAREME' in mod).toBe(true);
    expect('evaluerEntites' in mod).toBe(true);
  });
});
