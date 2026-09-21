// sanctionsCorrecteur.test.ts — extension C6 (6 → 26) : les règles nouvelles
// se déclenchent sur les INVERSIONS et restent silencieuses sur les
// co-occurrences légitimes (comparaisons officielles des corrigés).

import { describe, expect, it } from 'vitest';
import { evaluerSanctions } from './sanctionsCorrecteur';

describe('sanctions — extension C6 (2026-09-19)', () => {
  it('inversion AChE : « استراز يتحرر » → forte', () => {
    const s = evaluerSanctions('يتحرر الأستيل كولين استراز من الحويصلة العصبية.');
    expect(s.map((x) => x.id)).toContain('acetylcholinesterase_liberee');
    expect(s.find((x) => x.id === 'acetylcholinesterase_liberee')!.gravite).toBe('forte');
  });

  it('inversion anticodon/ARNm → forte ; phrase légitime → rien', () => {
    expect(
      evaluerSanctions('الرامزة المضادة موجودة على ARNm.').map((x) => x.id)
    ).toContain('anticodon_sur_arnm');
    expect(
      evaluerSanctions('يتعرف anticodon على رامزة ARNm بالتكامل.').length
    ).toBe(0);
  });

  it('2-DG « augmente ATP » → forte (l inverse est le contenu officiel 2025)', () => {
    expect(
      evaluerSanctions('مادة 2-DG تزيد إنتاج ATP في الخلية السرطانية.').map((x) => x.id)
    ).toContain('dg2_augmente_atp');
  });

  it('co-occurrence légitime (glycolyse → mitochondrie) → vigilance, JAMAIS forte', () => {
    const s = evaluerSanctions(
      'يحدث التحلل السكري في الهيولى ثم ينتقل حمض البيروفيك إلى الميتوكوندريا لأكسدته.'
    );
    const g = s.find((x) => x.id === 'glycolyse_mitochondrie');
    expect(g?.gravite).toBe('vigilance');
    expect(s.every((x) => x.gravite !== 'forte')).toBe(true);
  });

  it('conflit ATP 38 inchangé (non-régression Pierre 1)', () => {
    const s = evaluerSanctions('حصيلة التنفس الخلوي هي 30-32 ATP لكل غلوكوز.');
    expect(s.map((x) => x.id)).toContain('atp_bilan_respiration');
  });

  it('réponse neutre → aucune sanction', () => {
    expect(evaluerSanctions('تؤكد التجربة صحة الفرضية المذكورة في السند.').filter((x) => x.gravite === 'forte')).toHaveLength(0);
    expect(evaluerSanctions('')).toHaveLength(0);
  });
});

describe('sanctions — P2f, sources دليل الأستاذ (errata + attendus)', () => {
  it('O2 : « مصدر الأكسجين المنطلق هو CO2 » → forte ; « الماء وليس CO2 » (réponse du guide) → rien', () => {
    const s = evaluerSanctions('مصدر الأكسجين المنطلق في التركيب الضوئي هو CO2.');
    expect(s.map((x) => x.id)).toContain('oxygene_source_co2');
    expect(s.find((x) => x.id === 'oxygene_source_co2')!.gravite).toBe('forte');
    expect(
      evaluerSanctions('مصدر الأكسجين المنطلق هو الماء وليس CO2.').map((x) => x.id)
    ).not.toContain('oxygene_source_co2');
  });

  it('structure : « البنية الرباعية » → vigilance terme ; « 4 سلاسل » → vigilance ; Hb sans le nombre → rien', () => {
    const s1 = evaluerSanctions('يتكون الهيموغلوبين من البنية الرباعية.');
    expect(s1.map((x) => x.id)).toContain('structure_terme_rubaiya');
    const s2 = evaluerSanctions('البنية الرابعية تتكون من 4 سلاسل ببتيدية.');
    expect(s2.map((x) => x.id)).toContain('structure_quaternaire_4_chaines');
    const s3 = evaluerSanctions('الهيموغلوبين بروتين له بنية رابعية تتجمع فيها تحت وحدات.');
    expect(s3.every((x) => !x.id.startsWith('structure_'))).toBe(true);
  });

  it('protéases : trypsine+Tyr → forte ; chymotrypsine+Lys → forte ; séquence latine du guide → rien', () => {
    const s1 = evaluerSanctions('ينتج عن معاملة الببتيد بتربسين قطع تنتهي بتيروزين.');
    expect(s1.map((x) => x.id)).toContain('protease_specificite_inversee');
    const s2 = evaluerSanctions('الكيموتريبسين يحلل الرابطة بعد الليزين.');
    expect(s2.map((x) => x.id)).toContain('protease_specificite_inversee');
    // La réponse CORRECTE du guide (séquences latines + trypsine) ne doit pas sonner.
    expect(
      evaluerSanctions('عند معاملة الببتيد بإنزيم تربسين ينتج: Ala-Gly-Tyr-Arg | Ser-Phe-Glu-Val-Lys | Leu.')
        .map((x) => x.id)
    ).not.toContain('protease_specificite_inversee');
  });

  it('TTX/TEA échangés → vigilance ; usage correct → rien', () => {
    const s = evaluerSanctions('تترودوتوكس مادة تحصر انتقال البوتاسيوم.');
    expect(s.map((x) => x.id)).toContain('bloqueurs_ttx_tea');
    expect(s.find((x) => x.id === 'bloqueurs_ttx_tea')!.gravite).toBe('vigilance');
    expect(
      evaluerSanctions('Tetrodotoxine تحصر انتقال الصوديوم.').map((x) => x.id)
    ).not.toContain('bloqueurs_ttx_tea');
  });

  it('curare + canaux voltage → vigilance (jamais forte)', () => {
    const s = evaluerSanctions('يمنع الكورار انتقال النبأ لأنه يثبط القنوات الفولطية للغشاء.');
    expect(s.map((x) => x.id)).toContain('curare_sur_canal_voltage');
    expect(s.every((x) => x.gravite !== 'forte')).toBe(true);
  });

  it('pompe inversée → vigilance ; phrase exacte du guide → rien', () => {
    const s = evaluerSanctions('تخرج المضخة 3 شوارد البوتاسيوم وتدخل 2 شوارد الصوديوم.');
    expect(s.map((x) => x.id)).toContain('pompe_na_k_inversee');
    expect(
      evaluerSanctions('تثبت المضخة 3 شوارد الصوديوم وتنقلها خارج الخلية وتثبت 2 شاردتي البوتاسيوم.')
        .map((x) => x.id)
    ).not.toContain('pompe_na_k_inversee');
  });

  it('« 3 أنواع من ARNt » → vigilance (errata bac 1999) ; « 3 أنواع من ARNr » → rien', () => {
    const s = evaluerSanctions('ظهرت في التجربة 3 أنواع من ARNt بأوزان جزيئية مختلفة.');
    expect(s.map((x) => x.id)).toContain('arnr_3_types_pas_arnt');
    expect(
      evaluerSanctions('ظهرت 3 أنواع من ARNr في الشواضر الثلاث.').map((x) => x.id)
    ).not.toContain('arnr_3_types_pas_arnt');
  });

  it('phase obscure resserrée : « اللاضوئية تتم في الظلام » → vigilance ; « في غياب الضوء » (guide) → rien', () => {
    const s = evaluerSanctions('المرحلة اللاضوئية تتم في الظلام ليلاً.');
    expect(s.map((x) => x.id)).toContain('phase_obscure_nuit');
    // Formulations légitimes du guide : co-occurrence simple + « في غياب الضوء ».
    expect(
      evaluerSanctions('يتم امتصاص CO2 في غياب الضوء وفي وجوده لإثبات حدوث المرحلة الكيميائية الحيوية.')
        .map((x) => x.id)
    ).not.toContain('phase_obscure_nuit');
    expect(
      evaluerSanctions('في الظلام يتم تشكل APG ثم يعاد تدوير RuBP.').map((x) => x.id)
    ).not.toContain('phase_obscure_nuit');
  });

  it('ATP 38 : la correction cite désormais le guide (non-régression texte)', () => {
    const s = evaluerSanctions('الحصيلة الكلية هي 36 ATP لكل غلوكوز.');
    const r = s.find((x) => x.id === 'atp_bilan_respiration')!;
    expect(r.correctionAr).toContain('دليل الأستاذ');
    expect(r.correctionAr).toContain('38 جزيئة');
  });
});
