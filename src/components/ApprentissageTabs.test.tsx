// ApprentissageTabs.test.tsx — comportement réel des 3 onglets (pas un toContain).
// Verrous : ordre pédagogique, RTL au clavier, swipe limité à la bande,
// accessibilité (role/aria), absence de chiffres de progression inventés.

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ApprentissageTabs from './ApprentissageTabs';
import { ONGLETS_APPRENTISSAGE } from '../data/apprentissageNav';

afterEach(cleanup);

describe('bande « التعلّم » — rendu', () => {
  it('3 onglets bilingues, un seul sélectionné', () => {
    render(<ApprentissageTabs actif="cours" onChanger={() => {}} />);
    const onglets = screen.getAllByRole('tab');
    expect(onglets).toHaveLength(3);
    expect(onglets.map((b) => b.getAttribute('data-testid'))).toEqual([
      'apprentissage-onglet-cours',
      'apprentissage-onglet-entrainement',
      'apprentissage-onglet-revision',
    ]);
    expect(screen.getByTestId('apprentissage-onglet-cours').getAttribute('aria-selected')).toBe('true');
    expect(screen.getByTestId('apprentissage-onglet-revision').getAttribute('aria-selected')).toBe('false');
    // Ordre du DOM = ordre pédagogique (l'inversion visuelle vient de dir="rtl").
    expect(ONGLETS_APPRENTISSAGE.map((o) => o.ar)).toEqual(['الدروس', 'التمارين', 'المراجعة']);
    expect(screen.getByText('Cours')).toBeTruthy();
    expect(screen.getByText('Révision')).toBeTruthy();
  });

  it('sans compteurs fournis, on n’affiche RIEN (jamais un faux 0)', () => {
    render(<ApprentissageTabs actif="cours" onChanger={() => {}} />);
    expect(screen.queryByText(/12\/20/)).toBeNull();
    expect(screen.queryByTestId('apprentissage-progression-cours')).toBeNull();
    expect(screen.queryByTestId('apprentissage-progression-entrainement')).toBeNull();
    expect(screen.queryByTestId('apprentissage-progression-revision')).toBeNull();
    expect(screen.getByTestId('apprentissage-tabs').getAttribute('dir')).toBe('rtl');
  });

  it('un clic transmet l’identifiant de l’onglet', () => {
    const onChanger = vi.fn();
    render(<ApprentissageTabs actif="cours" onChanger={onChanger} />);
    fireEvent.click(screen.getByTestId('apprentissage-onglet-revision'));
    expect(onChanger).toHaveBeenCalledWith('revision');
    expect(onChanger).toHaveBeenCalledTimes(1);
  });
});

describe('pastilles de progression — valeurs réelles, unités distinctes', () => {
  const reels = {
    leconsFaites: 7,
    leconsTotal: 72,
    tentatives: 3,
    evaluations: 11,
  };

  it('un badge par onglet, chacun avec sa propre unité', () => {
    render(<ApprentissageTabs actif="cours" onChanger={() => {}} progression={reels} />);
    expect(screen.getByTestId('apprentissage-progression-cours').textContent).toContain('7/72');
    expect(screen.getByTestId('apprentissage-progression-entrainement').textContent).toContain('3');
    expect(screen.getByTestId('apprentissage-progression-revision').textContent).toContain('11');
    expect(screen.getByTestId('apprentissage-progression-cours').getAttribute('title')).toContain('Leçons du parcours terminées');
    expect(screen.getByTestId('apprentissage-progression-entrainement').getAttribute('title')).toContain('Tentatives');
  });

  it('zéro réel affiché quand rien n’a été fait', () => {
    render(
      <ApprentissageTabs
        actif="revision"
        onChanger={() => {}}
        progression={{ leconsFaites: 0, leconsTotal: 72, tentatives: 0, evaluations: 0 }}
      />,
    );
    expect(screen.getByTestId('apprentissage-progression-cours').textContent).toContain('0/72');
    expect(screen.getByTestId('apprentissage-progression-entrainement').textContent).toContain('0');
    expect(screen.getByTestId('apprentissage-progression-revision').textContent).toContain('0');
  });

  it('le dénominateur vient des données, pas du composant', () => {
    render(
      <ApprentissageTabs
        actif="cours"
        onChanger={() => {}}
        progression={{ leconsFaites: 2, leconsTotal: 83, tentatives: 1, evaluations: 4 }}
      />,
    );
    expect(screen.getByTestId('apprentissage-progression-cours').textContent).toContain('2/83');
  });
});

describe('clavier — flèches inversées en RTL', () => {
  it('ArrowLeft avance, ArrowRight recule, Home/End aux extrémités', () => {
    const onChanger = vi.fn();
    render(<ApprentissageTabs actif="entrainement" onChanger={onChanger} />);
    const bande = screen.getByTestId('apprentissage-tablist');
    fireEvent.keyDown(bande, { key: 'ArrowLeft' });
    expect(onChanger).toHaveBeenLastCalledWith('revision');
    fireEvent.keyDown(bande, { key: 'ArrowRight' });
    expect(onChanger).toHaveBeenLastCalledWith('cours');
    fireEvent.keyDown(bande, { key: 'End' });
    expect(onChanger).toHaveBeenLastCalledWith('revision');
    fireEvent.keyDown(bande, { key: 'Home' });
    expect(onChanger).toHaveBeenLastCalledWith('cours');
    expect(onChanger).toHaveBeenCalledTimes(4);
  });

  it('aux extrémités, aucun onglet imaginaire n’est appelé', () => {
    const onChanger = vi.fn();
    render(<ApprentissageTabs actif="cours" onChanger={onChanger} />);
    fireEvent.keyDown(screen.getByTestId('apprentissage-tablist'), { key: 'ArrowRight' });
    expect(onChanger).not.toHaveBeenCalled();
  });
});

describe('swipe — sur la bande seulement, seuil 48 px', () => {
  it('glisser vers la gauche ouvre l’onglet suivant', () => {
    const onChanger = vi.fn();
    render(<ApprentissageTabs actif="cours" onChanger={onChanger} />);
    const bande = screen.getByTestId('apprentissage-tablist');
    fireEvent.touchStart(bande, { touches: [{ clientX: 220 }] });
    fireEvent.touchEnd(bande, { changedTouches: [{ clientX: 100 }] });
    expect(onChanger).toHaveBeenCalledWith('entrainement');
  });

  it('glisser vers la droite ouvre l’onglet précédent', () => {
    const onChanger = vi.fn();
    render(<ApprentissageTabs actif="revision" onChanger={onChanger} />);
    const bande = screen.getByTestId('apprentissage-tablist');
    fireEvent.touchStart(bande, { touches: [{ clientX: 100 }] });
    fireEvent.touchEnd(bande, { changedTouches: [{ clientX: 220 }] });
    expect(onChanger).toHaveBeenCalledWith('entrainement');
  });

  it('un micro-mouvement (< 48 px) ne change pas d’onglet', () => {
    const onChanger = vi.fn();
    render(<ApprentissageTabs actif="cours" onChanger={onChanger} />);
    const bande = screen.getByTestId('apprentissage-tablist');
    fireEvent.touchStart(bande, { touches: [{ clientX: 200 }] });
    fireEvent.touchEnd(bande, { changedTouches: [{ clientX: 180 }] });
    expect(onChanger).not.toHaveBeenCalled();
  });
});
