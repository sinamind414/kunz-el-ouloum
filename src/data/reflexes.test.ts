// reflexes.test.ts
// P0.0 — Référentiel canonique unique (Spec V2 §2.1 / §2.2).
import { describe, it, expect } from 'vitest';
import { CORE_REFLEXES, CORE_REFLEX_IDS, SUPPORTING_SKILLS, HYPOTHESIS_RBMA_MESSAGE } from './reflexes';

describe('Réflexes canoniques (V2 §2.1)', () => {
  it('contient exactement les six réflexes requis', () => {
    expect(CORE_REFLEX_IDS).toEqual(['analyse', 'interpret', 'compare', 'hypothesize', 'explain', 'validate']);
  });

  it('chaque réflexe a mantra, checklist et libellés AR/FR', () => {
    for (const id of CORE_REFLEX_IDS) {
      const r = CORE_REFLEXES[id];
      expect(r.labelAr).toBeTruthy();
      expect(r.labelFr).toBeTruthy();
      expect(r.mantraAr).toBeTruthy();
      expect(Array.isArray(r.checklist) && r.checklist.length > 0).toBe(true);
    }
  });

  it('interdit "ربما" UNIQUEMENT dans la production de l\'élève pour hypothesize', () => {
    expect(CORE_REFLEXES.hypothesize.forbiddenTerms).toContain('ربما');
    // Les autres réflexes ne l'interdisent pas (peut apparaître en explication/citation).
    for (const id of CORE_REFLEX_IDS) {
      if (id === 'hypothesize') continue;
      expect(CORE_REFLEXES[id].forbiddenTerms ?? []).not.toContain('ربما');
    }
  });

  it('message "ربما" bienveillant présent et exact', () => {
    expect(HYPOTHESIS_RBMA_MESSAGE).toContain('ربما');
    expect(HYPOTHESIS_RBMA_MESSAGE).toContain('نفترض أن');
  });

  it('compétences complémentaires définies sans être nommées "six réflexes"', () => {
    expect(Object.keys(SUPPORTING_SKILLS).length).toBe(7);
    expect(SUPPORTING_SKILLS.identify.labelAr).toBe('حدد');
    expect(SUPPORTING_SKILLS.scientific_text.labelAr).toBe('اكتب نصا علميا');
  });
});
