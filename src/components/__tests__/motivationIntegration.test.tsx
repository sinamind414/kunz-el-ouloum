// motivationIntegration.test.tsx — vérifie la chaîne complète MOTIVATION dans <App />.
//
// Les tests unitaires couvrent FocusTimer et MotivationDeclic isolément ; celui-ci
// les parcourt enchaînés dans l'app réelle, comme le ferait un élève :
//   splash → tableau de bord → déclic du jour → « جلسة تركيز » → minuteur → crédit.
// C'est la preuve que le câblage App.tsx fonctionne bout en bout.
//
// Le splash a deux étapes : ouverture du coffre (افْتَحْ كَنْزَ العُلُومِ) puis
// démarrage (ابدأ رحلة التعلم). demarrer() enchaîne les deux.

import { cleanup, render, screen, fireEvent, act } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from '../../App';

afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.useRealTimers();
});

/**
 * Ouvre le coffre puis démarre la session : on arrive sur le tableau de bord.
 * Le splash utilise AnimatePresence mode="wait" : l'écran suivant n'apparaît
 * qu'après l'animation de sortie — d'où les attentes asynchrones.
 */
async function demarrer() {
  fireEvent.click(screen.getByText('افْتَحْ كَنْزَ العُلُومِ (دخول)'));
  const bouton = await screen.findByText('ابدأ رحلة التعلم', {}, { timeout: 4000 });
  fireEvent.click(bouton);
  await screen.findByTestId('declic-overlay', {}, { timeout: 4000 });
}

describe('App — chaîne motivation (déclic → focus → objectif)', () => {
  it('affiche le déclic du jour en arrivant sur le tableau de bord', async () => {
    render(<App />);
    await demarrer();
    expect(screen.getByTestId('declic-overlay')).toBeTruthy();
    // MotivationDeclic est chargée en lazy : le contenu arrive un tick plus tard.
    expect(await screen.findByTestId('motivation-declic', {}, { timeout: 4000 })).toBeTruthy();
  });

  it('« ليس الآن » ferme le déclic sans ouvrir de session', async () => {
    render(<App />);
    await demarrer();
    fireEvent.click(screen.getByText('ليس الآن'));
    expect(screen.queryByTestId('declic-overlay')).toBeNull();
    // Le déclic ne réapparaît plus dans la même journée.
    const today = new Date().toISOString().split('T')[0];
    expect(localStorage.getItem('kunz_declic_shown_v1')).toBe(today);
  });

  it('« جلسة تركيز » depuis le déclic ouvre le minuteur', async () => {
    render(<App />);
    await demarrer();
    fireEvent.click(screen.getByText('جلسة تركيز'));
    expect(await screen.findByTestId('focus-timer', {}, { timeout: 4000 })).toBeTruthy();
  });

  it('une session de focus terminée crédite l\'objectif quotidien', async () => {
    render(<App />);
    await demarrer();
    fireEvent.click(screen.getByText('جلسة تركيز'));
    // FocusTimer est chargée en lazy : on attend qu\'elle monte AVANT
    // d\'armer les faux minuteurs, sinon l\'attente elle-même serait gelée.
    await screen.findByText('ابدأ', {}, { timeout: 4000 });
    vi.useFakeTimers();
    fireEvent.click(screen.getByText('ابدأ'));
    const avant = JSON.parse(localStorage.getItem('svt_progress') ?? '{}')
      .dailyGoals?.todayMinutes ?? 0;
    act(() => { vi.advanceTimersByTime(25 * 60 * 1000); });
    act(() => { vi.advanceTimersByTime(1000); });
    const apres = JSON.parse(localStorage.getItem('svt_progress') ?? '{}')
      .dailyGoals?.todayMinutes ?? 0;
    expect(apres, `objectif quotidien : ${avant} → ${apres} minutes`).toBe(avant + 25);
  });
});
