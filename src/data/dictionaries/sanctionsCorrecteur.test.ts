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
