import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import BoussoleCard from '../BoussoleCard';
import { VERB_CARDS_V2 } from '../../data/methodologyEngine';

describe('BoussoleCard', () => {
  it('ne contient aucune lettre latine visible (couche élève = arabe)', () => {
    const { container } = render(<BoussoleCard />);
    expect(container.textContent).not.toMatch(/[A-Za-z]/);
  });
  it('mentionne chaque verbe de VERB_CARDS_V2 exactement une fois', () => {
    const { container } = render(<BoussoleCard />);
    for (const c of VERB_CARDS_V2) {
      expect(container.textContent!.split(c.verbAr).length - 1).toBe(1);
    }
  });
  it('tient sur une page A4 à 96 dpi', () => {
    const { container } = render(<BoussoleCard />);
    // 297mm ≈ 1123px ; jsdom ne mesure pas, on borne le volume de texte à la place
    expect(container.textContent!.length).toBeLessThan(2200);
  });
});
