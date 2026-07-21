// microRemediations.test.ts
// V3 §3.3 — micro-reprise trouvée pour chaque code prioritaire.
import { describe, it, expect } from 'vitest';
import { MICRO_REMEDIATIONS, getMicroRemediationByCode } from '../data/microRemediations';

describe('Micro-reprises (§3.3)', () => {
  it('la reprise ARNm existe et cible une seule erreur', () => {
    const r = MICRO_REMEDIATIONS['arnm_vs_adn'];
    expect(r).toBeDefined();
    expect(r.estimatedMinutes).toBeGreaterThanOrEqual(2);
    expect(r.estimatedMinutes).toBeLessThanOrEqual(4);
    expect(r.triggerCodes.length).toBeGreaterThan(0);
    expect(r.acceptedEvidence.length).toBeGreaterThan(0);
  });

  it('un code derreur de transcription resolut une reprise', () => {
    expect(getMicroRemediationByCode('MISSING_ARNM')?.id).toBe('mr_arnm_vs_adn');
    expect(getMicroRemediationByCode('CONFUSION_ADN_ARNM')?.id).toBe('mr_arnm_vs_adn');
  });

  it('chaque reprise a une sortie definie', () => {
    for (const r of Object.values(MICRO_REMEDIATIONS)) {
      expect(['retry_document', 'open_reflex', 'schedule_recall']).toContain(r.nextAction);
    }
  });

  it('reprise thylakoïde/stroma existe pour photosynthèse', () => {
    const r = MICRO_REMEDIATIONS['thylakoide_vs_stroma'];
    expect(r).toBeDefined();
    expect(r.conceptId).toBe('photosynthese');
    expect(r.triggerCodes).toContain('THYLAKOID_STROMA_CONFUSION');
    expect(r.acceptedEvidence).toEqual(expect.arrayContaining(['التيلاكويد', 'الحشوة']));
    expect(r.nextAction).toBe('schedule_recall');
  });
});
