// BacCorrectionPanel.test.tsx — VERROUS DE LA VÉRITÉ DES CORRIGÉS BAC.
//
// Ce qui ne doit JAMAIS réapparaître : un écran qui propose une « correction »
// pour une session dont aucun barème officiel n'est intégré, ou qui cache la
// lacune 2021 S2 E1. Testé par rendu réel (jsdom), pas par lecture de source.

import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import BacCorrectionPanel from './BacCorrectionPanel';

afterEach(cleanup);

describe('panneau « التصحيح حسب الدورة »', () => {
  it('annonce la couverture réelle et un lien officiel de corrigé', () => {
    render(<BacCorrectionPanel annee={2025} />);
    expect(screen.getByTestId('bac-correction-panel')).toBeTruthy();
    expect(screen.getByTestId('bac-niveau').textContent).toContain('مقياس رسمي مُدمج');
    // 80 = total des 3 années 2023-2025 ; 2025 seule en porte 24 (4 questions).
    expect(screen.getByTestId('bac-correction-panel').textContent).toContain('80');
    expect(screen.getByTestId('bac-couverture').textContent).toContain('4 أسئلة مقياس');
    expect(screen.getByTestId('bac-lien-correction').getAttribute('href')).toMatch(/^https:\/\//);
    expect(screen.getByTestId('bac-avertissement-enonces').textContent).toContain('ONEC');
  });

  it('corrige réellement une réponse contre les attendus officiels', async () => {
    const user = userEvent.setup();
    render(<BacCorrectionPanel annee={2025} />);
    const select = screen.getByTestId('bac-select-question') as HTMLSelectElement;
    const questionId = select.options[1]!.value;
    await user.selectOptions(select, questionId);
    await user.type(screen.getByTestId('bac-reponse'), 'ARNm');
    await user.click(screen.getByTestId('bac-corriger'));
    const resultat = screen.getByTestId('bac-resultat');
    expect(resultat.textContent).toMatch(/\/\s*\d/);
    expect(resultat.textContent).toContain('القرار النهائي للمصحح');
    // Les formes acceptées et les items manuels sont les deux issues possibles
    // d'un item officiel : l'une au moins doit être nommée, jamais un silence.
    expect(
      resultat.textContent!.includes('صيغ مقبولة رُصدت') ||
        resultat.textContent!.includes('بند يدوي'),
    ).toBe(true);
  });

  it('pour une session sans barème intégré : pas de note, lien officiel seulement', async () => {
    const user = userEvent.setup();
    render(<BacCorrectionPanel annee={2019} />);
    await user.selectOptions(screen.getByTestId('bac-annee'), '2019');
    expect(screen.queryByTestId('bac-select-question')).toBeNull();
    expect(screen.getByTestId('bac-correction-externe').textContent).toContain('لا تصحيح مُدمج');
    expect(screen.getByTestId('bac-rattrapage').textContent).toContain('غير مُفهرسة');
  });

  it('déclare la lacune 2021 sans la combler', async () => {
    const user = userEvent.setup();
    render(<BacCorrectionPanel annee={2021} />);
    await user.selectOptions(screen.getByTestId('bac-annee'), '2021');
    expect(screen.getByTestId('bac-lacune').textContent).toContain('15/20');
    expect(screen.getByTestId('bac-lacune').textContent).toContain('لم يُضَف');
  });
});
