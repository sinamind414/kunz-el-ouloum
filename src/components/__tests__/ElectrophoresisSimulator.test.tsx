// ElectrophoresisSimulator.test.tsx — verrous du simulateur d'électrophorèse
// (audit item 6 : le seul livrable « simulation » du plan de renforcement).
//
// Deux contrats sont figés ici :
//   1. la RÈGLE physique du livre (ch. 8) : pH < pHi → positif → cathode ;
//      pH > pHi → négatif → anode ; pH = pHi → immobile. Testée en unitaire sur
//      la fonction pure, pour qu'un refactor d'UI ne puisse pas l'altérer.
//   2. le CONTRAT pédagogique : l'élève prédit AVANT de voir. Tant qu'aucune
//      prédiction n'est faite, la migration reste verrouillée ; changer les
//      conditions annule la manche.

import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import ElectrophoresisSimulator, {
  MOLECULES_ELECTROPHORESE,
  chargeGlobale,
  positionSpot,
  sensMigration,
} from '../ElectrophoresisSimulator';

afterEach(cleanup);

describe('règle pH / pHi (fonction pure)', () => {
  it('les 3 vecteurs du livre pour l alanine (pHi = 6)', () => {
    expect(sensMigration(2, 6)).toBe('cathode');
    expect(sensMigration(6, 6)).toBe('immobile');
    expect(sensMigration(12, 6)).toBe('anode');
  });

  it('charge globale : positive sous le pHi, négative au-dessus, nulle au pHi', () => {
    expect(chargeGlobale(2, 6)).toBe('+');
    expect(chargeGlobale(6, 6)).toBe('0');
    expect(chargeGlobale(12, 6)).toBe('−');
  });

  it('un acide aminé acide et un basique se séparent en sens opposés au même pH', () => {
    const glu = MOLECULES_ELECTROPHORESE.find((m) => m.id === 'glu')!;
    const lys = MOLECULES_ELECTROPHORESE.find((m) => m.id === 'lys')!;
    expect(sensMigration(6, glu.pHi)).toBe('anode');
    expect(sensMigration(6, lys.pHi)).toBe('cathode');
  });

  it('la distance parcourue croît avec l écart |pH − pHi| et reste bornée', () => {
    const proche = positionSpot(7, 6);
    const loin = positionSpot(12, 6);
    expect(Math.abs(loin - 350)).toBeGreaterThan(Math.abs(proche - 350));
    expect(loin).toBeLessThanOrEqual(610);
    expect(positionSpot(1, 13)).toBeGreaterThanOrEqual(90);
  });

  it('au pHi exactement, la tache ne bouge pas du point de dépôt', () => {
    for (const m of MOLECULES_ELECTROPHORESE) {
      expect(sensMigration(m.pHi, m.pHi), m.id).toBe('immobile');
      expect(positionSpot(m.pHi, m.pHi), m.id).toBe(350);
    }
  });
});

describe('contrat pédagogique — prédire avant de voir', () => {
  it('le bouton de migration est verrouillé tant qu aucune prédiction n est faite', async () => {
    const user = userEvent.setup();
    render(<ElectrophoresisSimulator />);
    const bouton = screen.getByTestId('lancer-migration') as HTMLButtonElement;
    expect(bouton.disabled).toBe(true);
    await user.click(screen.getByTestId('prediction-cathode'));
    expect((screen.getByTestId('lancer-migration') as HTMLButtonElement).disabled).toBe(false);
  });

  it('prédiction juste (Ala à pH 2 → cathode) : verdict positif et score 1/1', async () => {
    const user = userEvent.setup();
    render(<ElectrophoresisSimulator />);
    await user.click(screen.getByTestId('prediction-cathode'));
    await user.click(screen.getByTestId('lancer-migration'));
    expect(screen.getByTestId('verdict').textContent).toContain('إجابة صحيحة');
    expect(screen.getByTestId('score').textContent).toContain('1 / 1');
  });

  it('prédiction fausse : le verdict renvoie à la règle et explicite la comparaison pH/pHi', async () => {
    const user = userEvent.setup();
    render(<ElectrophoresisSimulator />);
    await user.click(screen.getByTestId('prediction-anode'));
    await user.click(screen.getByTestId('lancer-migration'));
    const verdict = screen.getByTestId('verdict').textContent ?? '';
    expect(verdict).toContain('راجع القاعدة');
    expect(screen.getByTestId('explication').textContent).toContain('أقل من');
    expect(screen.getByTestId('score').textContent).toContain('0 / 1');
  });

  it('changer de molécule annule la manche en cours (pas de verdict figé à l écran)', async () => {
    const user = userEvent.setup();
    render(<ElectrophoresisSimulator />);
    await user.click(screen.getByTestId('prediction-cathode'));
    await user.click(screen.getByTestId('lancer-migration'));
    expect(screen.queryByTestId('verdict')).not.toBeNull();
    await user.click(screen.getByTestId('molecule-lys'));
    expect(screen.queryByTestId('verdict')).toBeNull();
    expect((screen.getByTestId('lancer-migration') as HTMLButtonElement).disabled).toBe(true);
  });

  it('les 4 molécules du programme sont proposées avec leur pHi affiché', () => {
    render(<ElectrophoresisSimulator />);
    for (const m of MOLECULES_ELECTROPHORESE) {
      const bouton = screen.getByTestId(`molecule-${m.id}`);
      expect(bouton.textContent).toContain(String(m.pHi));
    }
    // l'alanine du livre (pHi = 6) est bien la molécule par défaut
    expect(screen.getByTestId('molecule-ala').getAttribute('aria-pressed')).toBe('true');
  });

  it('le pH est réglable et la valeur affichée suit le curseur', async () => {
    render(<ElectrophoresisSimulator />);
    const slider = screen.getByTestId('ph-slider') as HTMLInputElement;
    expect(slider.min).toBe('1');
    expect(slider.max).toBe('13');
    expect(screen.getByTestId('ph-valeur').textContent).toContain('2.0');
  });
});
