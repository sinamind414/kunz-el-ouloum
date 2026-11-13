// navigation4Rubiques.test.tsx — preuve COMPORTEMENTALE dans <App /> réelle.
//
// Les verrous de source (apprentissageNav.lock.test.ts, MoiView.test.tsx…)
// prouvent la structure ; celui-ci prouve que l'élève peut réellement :
//   1. arriver par un lien profond (chemin propre OU hash) sans passer par le
//      splash, avec le bon onglet allumé ;
//   2. changer d'onglet, voir l'URL suivre et le choix être mémorisé ;
//   3. revenir en arrière (popstate) ;
//   4. ne voir que 4 portes dans les deux barres de navigation.
//
// Aucun contenu pédagogique n'est créé : on ne vérifie que des libellés,
// des attributs ARIA et des routes.

import { cleanup, fireEvent, render, screen, act } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from '../../App';
import { CLE_DERNIER_ONGLET } from '../../data/apprentissageNav';
import { PARCOURS_FLAT } from '../../lib/parcours/parcoursPath';
import { BAC_IDEAS } from '../../data/bacSessionIndex';

// jsdom ne fournit pas ResizeObserver (composants lazy du tableau de bord).
class RO {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver = globalThis.ResizeObserver ?? RO;

afterEach(() => {
  cleanup();
  localStorage.clear();
  window.history.replaceState(null, '', '/');
});

describe('4 rubriques — navigation réelle', () => {
  it('un lien profond en CHEMIN ouvre directement « المراجعة » (pas de splash)', async () => {
    window.history.replaceState(null, '', '/apprentissage/revision');
    render(<App />);

    expect(await screen.findByTestId('apprentissage-tabs')).toBeTruthy();
    expect(screen.getByTestId('apprentissage-onglet-revision').getAttribute('aria-selected')).toBe('true');
    expect(screen.queryByText('افْتَحْ كَنْزَ العُلُومِ (دخول)')).toBeNull();
    // Le chemin propre est ramené au hash canonique (PWA / TWA hors ligne) —
    // vérifié par le test unitaire de navigationHash.ts.
  });

  it('un lien profond en HASH ouvre « التمارين » avec le bon onglet', async () => {
    window.history.replaceState(null, '', '/#/apprentissage/entrainement');
    render(<App />);
    expect(await screen.findByTestId('apprentissage-tabs')).toBeTruthy();
    expect(screen.getByTestId('apprentissage-onglet-entrainement').getAttribute('aria-selected')).toBe('true');
  });

  it('cliquer un onglet change l’écran, l’URL ET le dernier onglet mémorisé', async () => {
    window.history.replaceState(null, '', '/#/apprentissage/revision');
    render(<App />);
    await screen.findByTestId('apprentissage-tabs');

    fireEvent.click(screen.getByTestId('apprentissage-onglet-cours'));

    expect(screen.getByTestId('apprentissage-onglet-cours').getAttribute('aria-selected')).toBe('true');
    expect(window.location.hash).toBe('#/apprentissage/cours');
    expect(localStorage.getItem(CLE_DERNIER_ONGLET)).toBe('cours');
  });

  it('le bouton Retour (popstate) ramène à la rubrique précédente', async () => {
    window.history.replaceState(null, '', '/#/apprentissage/cours');
    render(<App />);
    await screen.findByTestId('apprentissage-tabs');
    fireEvent.click(screen.getByTestId('apprentissage-onglet-revision'));
    expect(window.location.hash).toBe('#/apprentissage/revision');

    act(() => {
      window.history.replaceState(null, '', '/#/apprentissage/cours');
      window.dispatchEvent(new Event('popstate'));
    });
    expect(screen.getByTestId('apprentissage-onglet-cours').getAttribute('aria-selected')).toBe('true');
  });

  it('changer d’onglet REMONTE le canevas : la bande et les 3 chapitres sont visibles d’emblée', async () => {
    // Demande du propriétaire 2026-11-11 : les 3 chapitres sont montés en tête
    // du canevas ; si l'élève a défilé, ils semblaient « apparaître en bas ».
    window.history.replaceState(null, '', '/#/apprentissage/cours');
    render(<App />);
    await screen.findByTestId('apprentissage-tabs');

    // Le canevas a bien une zone de défilement…
    const canevas = document.getElementById('zone-principale') as HTMLElement;
    expect(canevas).toBeTruthy();
    const scroll = vi.fn();
    canevas.scrollTo = scroll;

    // …et changer d'onglet le renvoie en haut.
    fireEvent.click(screen.getByTestId('apprentissage-onglet-revision'));
    await screen.findByTestId('apprentissage-onglet-revision');
    expect(scroll).toHaveBeenCalledWith({ top: 0 });
  });

  it('?lecon= ouvre le Cours en gardant le paramètre dans l’URL', async () => {
    const lecon = PARCOURS_FLAT.find((i) => i.kind === 'lesson' && i.lessonKey)!;
    window.history.replaceState(
      null, '', `/#/apprentissage/cours?lecon=${encodeURIComponent(lecon.lessonKey!)}`,
    );
    render(<App />);
    expect(await screen.findByTestId('apprentissage-tabs')).toBeTruthy();
    expect(screen.getByTestId('apprentissage-onglet-cours').getAttribute('aria-selected')).toBe('true');
    expect(window.location.hash).toContain(`lecon=${encodeURIComponent(lecon.lessonKey!)}`);
  });

  it('?idee= ouvre directement la banque BAC (pas le hub التمارين)', async () => {
    // Fiabilisation (2026-11-06, GO propriétaire) : BacIdeasView est chargé par
    // `lazy()` dans App. En jsdom (imports lourds), la résolution du chunk
    // pouvait dépasser le timeout par défaut (1 s) de findByTestId et rendre
    // le verrou flaky. On importe le module ICI : le loader du lazy résout
    // ensuite depuis le cache de modules en un tick, de façon déterministe.
    await import('../../components/BacIdeasView');
    const idee = BAC_IDEAS[0].id;
    window.history.replaceState(null, '', `/#/apprentissage/entrainement?idee=${idee}`);
    render(<App />);
    expect(await screen.findByTestId('apprentissage-tabs')).toBeTruthy();
    expect(screen.getByTestId('apprentissage-onglet-entrainement').getAttribute('aria-selected')).toBe('true');
    expect(await screen.findByTestId('bac-ideas')).toBeTruthy();
  });

  it('une clé ?lecon= inconnue n’ouvre pas un écran cassé', async () => {
    window.history.replaceState(null, '', '/#/apprentissage/cours?lecon=inconnue-xyz');
    render(<App />);
    expect(await screen.findByTestId('apprentissage-tabs')).toBeTruthy();
    expect(screen.getByTestId('apprentissage-onglet-cours').getAttribute('aria-selected')).toBe('true');
  });

  it('les deux barres portent exactement 4 portes, plus les 3 anciennes', async () => {
    window.history.replaceState(null, '', '/#/apprentissage/cours');
    render(<App />);
    await screen.findByTestId('apprentissage-tabs');

    for (const titre of [
      'الرئيسية · Accueil',
      'التعلّم · Apprentissage',
      'المنهجية · Méthode',
      'حسابي · Mon espace',
    ]) {
      // Une occurrence dans le menu latéral + une dans la barre mobile.
      expect(screen.getAllByTitle(titre)).toHaveLength(2);
    }
    expect(screen.queryByTitle('التمارين والتدريب · S\'entraîner')).toBeNull();
    expect(screen.queryByTitle('المراجعة · Réviser')).toBeNull();
    expect(screen.queryByTitle('أنا · Moi')).toBeNull();
    expect(screen.getAllByRole('tab')).toHaveLength(3);
  });
});
