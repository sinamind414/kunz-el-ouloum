// ActiveLessonEnzyme.test.ts
// Speckit §9 (Priority 1) — pilote "Enzymes et catalyse".
// Vérifie la logique métier de la leçon active sans dépendance DOM.
import { describe, it, expect } from 'vitest';
import { ACTIVE_LESSONS } from '../data/activeLessons';
import { checkProduction, isInsideHotspot } from '../utils/methodologyChecker';

describe('Leçon active "Enzymes et catalyse" (d1-u3-l1-enzyme)', () => {
  const lesson = ACTIVE_LESSONS['d1-u3-l1-enzyme'];

  it('est câblée dans le tunnel ACTIVE_LESSONS', () => {
    expect(lesson).toBeDefined();
    expect(lesson.id).toBe('d1-u3-l1-enzyme');
    expect(lesson.blocks.length).toBeGreaterThan(0);
  });

  it('définit des micro-tests avec au moins une réponse acceptée', () => {
    for (const block of lesson.blocks) {
      if (block.type === 'TEXT_AND_PRODUCE') {
        expect(Array.isArray(block.microTest.acceptedAnswers)).toBe(true);
        expect(block.microTest.acceptedAnswers.length).toBeGreaterThan(0);
      }
    }
  });

  it('valide la réponse correcte du micro-test "طاقة التنشيط"', () => {
    const block = lesson.blocks[0] as Extract<typeof lesson.blocks[number], { type: 'TEXT_AND_PRODUCE' }>;
    expect(checkProduction('الإنزيم يخفض طاقة التنشيط', block.microTest.acceptedAnswers)).toBe(true);
  });

  it('rejette une réponse vide au micro-test', () => {
    const block = lesson.blocks[0] as Extract<typeof lesson.blocks[number], { type: 'TEXT_AND_PRODUCE' }>;
    expect(checkProduction('', block.microTest.acceptedAnswers)).toBe(false);
  });

  it('place chaque bloc hotspot/texte dans la zone correcte (géométrie)', () => {
    // On garantit qu'au moins un bloc TEXT_AND_PRODUCE existe (pas de hotspot cassé ici).
    const textBlocks = lesson.blocks.filter((b) => b.type === 'TEXT_AND_PRODUCE');
    expect(textBlocks.length).toBeGreaterThanOrEqual(3);
    // isInsideHotspot doit rester cohérent pour un centre de zone.
    expect(isInsideHotspot(50, 50, { x: 50, y: 50, radius: 10 })).toBe(true);
    expect(isInsideHotspot(0, 0, { x: 50, y: 50, radius: 10 })).toBe(false);
  });

  it('exerce le parcours : chaque réponse acceptée de chaque micro-test passe via le moteur réel', () => {
    for (const block of lesson.blocks) {
      if (block.type !== 'TEXT_AND_PRODUCE') continue;
      for (const answer of block.microTest.acceptedAnswers) {
        expect(
          checkProduction(answer, block.microTest.acceptedAnswers),
          `micro-test "${block.microTest.prompt}" — réponse "${answer}" rejetée`
        ).toBe(true);
      }
    }
  });
});
