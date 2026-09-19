import { describe, it, expect } from 'vitest';
import { versEtoile } from './gradeEtoile';

describe('gradeEtoile - conversion note → étoile', () => {
    it('A : ممتاز (note ≥ 16)', () => {
    expect(versEtoile(16, true)).toBe('A');
    expect(versEtoile(20, true)).toBe('A');
  });

    it('B : جيد جدا (note 14–15.9)', () => {
    expect(versEtoile(14, true)).toBe('B');
    expect(versEtoile(15.9, true)).toBe('B');
  });

    it('C : جيد (note 10–13.9)', () => {
    expect(versEtoile(10, true)).toBe('C');
    expect(versEtoile(13.9, true)).toBe('C');
  });

    it('D : متوسط (note 7–9.9)', () => {
    expect(versEtoile(7, true)).toBe('D');
    expect(versEtoile(9.9, true)).toBe('D');
  });

    it('E : يحتاج عملا (note < 7)', () => {
    expect(versEtoile(6.9, true)).toBe('E');
    expect(versEtoile(0.1, true)).toBe('E');
    // Cas limite : aucun mot-clé, mais note = 0 → "—" (non évalué)
    expect(versEtoile(0, false)).toBe('—');
  });

    it('— : غير مقيم (copie blanche, note 0 sans mot-clé)', () => {
    expect(versEtoile(0, false)).toBe('—');
  });

    it('Note 0 avec mot-clé → E (effort rédigé, vide de vocabulaire)', () => {
    expect(versEtoile(0, true)).toBe('E');
  });
});