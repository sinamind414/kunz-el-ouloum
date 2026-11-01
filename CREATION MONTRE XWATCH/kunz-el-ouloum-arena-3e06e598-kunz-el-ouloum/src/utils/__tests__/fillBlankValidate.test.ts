// fillBlankValidate.test.ts — verrous du validateur de questions à trous (S-C4).
// On vérifie la tolérance (variantes orthographiques admises) ET la sévérité
// (réponse vide ou hors-sujet rejetée).

import { describe, expect, it } from 'vitest';
import { validateFillBlank } from '../fillBlankValidate';

describe('S-C4 : validateFillBlank', () => {
  const accepted = ['قطعة من ADN تحمل معلومة تركيب سلسلة ببتيدية أو بروتين معين'];

  it('accepte la réponse officielle telle quelle', () => {
    expect(validateFillBlank(accepted[0], accepted).correct).toBe(true);
  });

  it('accepte une variante avec harakat, tatweel et ة/ه mélangés', () => {
    const r = validateFillBlank('قطعـة مِن ADN تحمـل معلومـة تركيـب سلسلـة ببتيديـة أو بروتيـن معيـن', accepted);
    expect(r.correct).toBe(true);
  });

  it('accepte une reformulation partielle contenant l\'essentiel des notions-clés', () => {
    expect(validateFillBlank('قطعة من ADN تحمل معلومة تركيب بروتين', accepted).correct).toBe(true);
  });

  it('rejette une réponse vide ou trivialement courte', () => {
    expect(validateFillBlank('', accepted).correct).toBe(false);
    expect(validateFillBlank('ADN', accepted).correct).toBe(false);
    expect(validateFillBlank('   ', accepted).correct).toBe(false);
  });

  it('rejette une réponse hors-sujet', () => {
    expect(validateFillBlank('النواة هي مركز الخلية', accepted).correct).toBe(false);
  });

  it('la couverture est comprise entre 0 et 1', () => {
    const r = validateFillBlank('قطعة من ADN', accepted);
    expect(r.coverage).toBeGreaterThan(0);
    expect(r.coverage).toBeLessThanOrEqual(1);
    expect(validateFillBlank('كلام غير ذي صلة تماماً هنا', accepted).coverage).toBeLessThan(0.6);
  });

  it('choisit la meilleure couverture parmi plusieurs réponses acceptées', () => {
    const multi = ['A تقابل T وG تقابل C في ADN', 'التبادل بين A-T و G-C'];
    expect(validateFillBlank('A تقابل T و G تقابل C', multi).correct).toBe(true);
  });
});
