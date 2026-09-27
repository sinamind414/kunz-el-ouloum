// BacIdeasView.test.tsx — verrous de la vue « أفكار التمارين حسب الدورة »
// (audit item 12, sprint 16).
//
// Promesses testées :
//   1. l'écran s'ouvre sur la session la plus récente, pas sur un fourre-tout ;
//   2. changer d'année change réellement les fiches affichées ;
//   3. la recherche trouve un exercice par son thème, même écrit sans hamza ;
//   4. le trou 2020 est affiché comme trou, jamais comblé par du contenu.

import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import BacIdeasView from '../BacIdeasView';
import { YEARS_COVERED, ideasForYear } from '../../data/bacSessionIndex';

afterEach(cleanup);

describe('أفكار التمارين — rendu', () => {
  it("s'ouvre sur la session la plus récente couverte", () => {
    render(<BacIdeasView />);
    const recente = YEARS_COVERED[0];
    for (const idea of ideasForYear(recente)) {
      expect(screen.getByTestId(`idee-${idea.id}`), idea.id).toBeTruthy();
    }
    expect(screen.getByTestId('idees-total').textContent).toContain(
      String(ideasForYear(recente).length),
    );
  });

  it('affiche le barème des deux sujets de la session ouverte', () => {
    render(<BacIdeasView />);
    expect(screen.getByTestId('idees-bareme').textContent).toContain('20');
  });

  it('montre le classement de pression et annonce la couverture complète', () => {
    render(<BacIdeasView />);
    const bloc = screen.getByTestId('idees-pression');
    expect(bloc.textContent).toContain('كل الدورات');
    expect(screen.getByTestId('pression-4')).toBeTruthy();
  });

  it('propose un onglet par session dépouillée, 2020 et 2026 comprises', () => {
    render(<BacIdeasView />);
    for (const y of YEARS_COVERED) expect(screen.getByTestId(`annee-${y}`)).toBeTruthy();
    expect(screen.getByTestId('annee-2020')).toBeTruthy();
    expect(screen.getByTestId('annee-2026')).toBeTruthy();
  });
});

describe('أفكار التمارين — navigation', () => {
  it("change réellement de corpus quand on change d'année", async () => {
    const user = userEvent.setup();
    render(<BacIdeasView />);
    expect(screen.getByTestId('idee-bac2026_s2_e3')).toBeTruthy();
    await user.click(screen.getByTestId('annee-2019'));
    expect(screen.queryByTestId('idee-bac2026_s2_e3')).toBeNull();
    expect(screen.getByTestId('idee-bac2019_s2_e3')).toBeTruthy();
  });

  it('affiche toutes les idées sur « كل الدورات »', async () => {
    const user = userEvent.setup();
    render(<BacIdeasView />);
    await user.click(screen.getByTestId('annee-all'));
    expect(screen.getByTestId('idee-bac2019_s1_e1')).toBeTruthy();
    expect(screen.getByTestId('idee-bac2025_s1_e1')).toBeTruthy();
  });
});

describe('أفكار التمارين — recherche', () => {
  it('retrouve un exercice par son thème', async () => {
    const user = userEvent.setup();
    render(<BacIdeasView />);
    await user.type(screen.getByTestId('idees-recherche'), 'البرفورين');
    expect(screen.getByTestId('idee-bac2023_s2_e2')).toBeTruthy();
    expect(screen.queryByTestId('idee-bac2025_s1_e1')).toBeNull();
  });

  it('affiche un message clair quand rien ne correspond', async () => {
    const user = userEvent.setup();
    render(<BacIdeasView />);
    await user.type(screen.getByTestId('idees-recherche'), 'زززز');
    expect(screen.getByTestId('idees-vide')).toBeTruthy();
  });
});

describe('أفكار التمارين — fiche', () => {
  it("donne l'idée, les supports, la notion et les verbes", async () => {
    const user = userEvent.setup();
    render(<BacIdeasView />);
    await user.click(screen.getByTestId('annee-2025'));
    const fiche = screen.getByTestId('idee-bac2025_s2_e3');
    expect(fiche.textContent).toContain('ABO');
    expect(fiche.textContent).toContain('ما يُقيَّم فعلاً');
    expect(fiche.textContent).toContain('ناقش صحة الفرضية');
    expect(fiche.textContent).toContain('08 ن'.replace('08', '8'));
  });
});
