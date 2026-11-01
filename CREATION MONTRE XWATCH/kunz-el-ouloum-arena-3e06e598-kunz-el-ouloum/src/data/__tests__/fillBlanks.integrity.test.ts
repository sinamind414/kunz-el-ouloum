// fillBlanks.integrity.test.ts — verrou anti-régression du corpus des textes à trous.
//
// Bug corrigé (audit 2026-10) : 40 micro-tests « d'origine Flutter » avaient un
// `prompt` réduit à `أكمل: _______` (aucune amorce avant le trou). App.tsx injecte
// `questionText: q.microTest.prompt`, donc l'élève voyait une consigne vide,
// impossible à répondre. `hasUsableStatement` les filtre désormais à l'export.
// Ce test casse si un item à énoncé vide est réintroduit.

import { describe, expect, it } from 'vitest';
import { FILL_BLANK_QUESTIONS } from '../fillBlanks';

describe('Corpus textes à trous — intégrité des énoncés', () => {
  it('aucun item exporté n’a un énoncé vide (juste "أكمل: ___")', () => {
    const broken = FILL_BLANK_QUESTIONS.filter((q) => {
      const stripped = (q.microTest.prompt || '')
        .replace(/أكمل:/g, '')
        .replace(/_{3,}/g, '')
        .trim();
      return stripped.length === 0;
    });
    expect(broken.map((q) => q.id), 'Énoncés vides exposés à l’élève').toEqual([]);
  });

  it('chaque item exporté porte un trou "_____" et au moins une réponse acceptée', () => {
    const violations: string[] = [];
    for (const q of FILL_BLANK_QUESTIONS) {
      if (!q.microTest.prompt.includes('_')) violations.push(q.id + ':pas de trou');
      if (!q.microTest.acceptedAnswers || q.microTest.acceptedAnswers.length === 0) {
        violations.push(q.id + ':aucune réponse');
      }
    }
    expect(violations, 'Items mal formés').toEqual([]);
  });

  it('les 121 items enrichis (à amorce) sont conservés — le filtre ne purge pas le sain', () => {
    expect(FILL_BLANK_QUESTIONS.length).toBe(121);
    expect(FILL_BLANK_QUESTIONS.length).toBeGreaterThan(0);
  });
});
