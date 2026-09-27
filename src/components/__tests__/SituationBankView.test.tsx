// SituationBankView.test.tsx — verrous de la vue « تمارين بالوضعيات »
// (audit item 18, sprint 10).
//
// Contrat protégé ici :
//   1. la recherche filtre réellement la grille (et l'état vide est explicite) ;
//   2. les filtres unité/difficulté se cumulent avec la requête et sont
//      désactivables par un second clic ;
//   3. l'ouverture d'une fiche montre la consigne et le piège, mais la
//      CORRECTION RESTE MASQUÉE tant que l'élève ne la demande pas — c'est le
//      cœur pédagogique : sans ce verrou la banque devient un corrigé à lire.

import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import SituationBankView from '../SituationBankView';
import { SITUATION_COUNT, searchSituations } from '../../data/situationIndex';

afterEach(cleanup);

describe('SituationBankView — liste et recherche', () => {
  it('affiche toute la banque au premier rendu', () => {
    render(<SituationBankView />);
    expect(screen.getByTestId('situation-count').textContent).toContain(String(SITUATION_COUNT));
    expect(screen.getByTestId('situation-diabete_januvia')).toBeTruthy();
    expect(screen.getByTestId('situation-seisme_boumerdes')).toBeTruthy();
  });

  it('la recherche réduit la grille aux situations correspondantes', async () => {
    const user = userEvent.setup();
    render(<SituationBankView />);
    await user.type(screen.getByTestId('situation-search'), 'السكري');
    const attendus = searchSituations('السكري');
    expect(screen.getByTestId('situation-count').textContent).toContain(String(attendus.length));
    expect(screen.getByTestId('situation-diabete_januvia')).toBeTruthy();
    expect(screen.queryByTestId('situation-seisme_boumerdes')).toBeNull();
  });

  it('une recherche sans résultat affiche un message d aide, pas une grille vide muette', async () => {
    const user = userEvent.setup();
    render(<SituationBankView />);
    await user.type(screen.getByTestId('situation-search'), 'زرافة');
    expect(screen.getByTestId('situation-vide')).toBeTruthy();
    expect(screen.getByTestId('situation-count').textContent).toContain('0');
  });

  it('le filtre par unité s active puis se désactive au second clic', async () => {
    const user = userEvent.setup();
    render(<SituationBankView />);
    await user.click(screen.getByTestId('filtre-unite-4'));
    const apres = Number(screen.getByTestId('situation-count').textContent?.match(/\d+/)?.[0]);
    expect(apres).toBe(searchSituations('', { unitId: 4 }).length);
    expect(screen.queryByTestId('situation-seisme_boumerdes')).toBeNull();

    await user.click(screen.getByTestId('filtre-unite-4'));
    expect(screen.getByTestId('situation-count').textContent).toContain(String(SITUATION_COUNT));
  });

  it('les filtres unité et difficulté se cumulent', async () => {
    const user = userEvent.setup();
    render(<SituationBankView />);
    await user.click(screen.getByTestId('filtre-unite-5'));
    await user.click(screen.getByTestId('filtre-difficulte-3'));
    const attendu = searchSituations('', { unitId: 5, difficulty: 3 }).length;
    expect(screen.getByTestId('situation-count').textContent).toContain(String(attendu));
  });
});

describe('SituationBankView — fiche d une situation', () => {
  it('ouvre la fiche avec sa consigne et son piège', async () => {
    const user = userEvent.setup();
    render(<SituationBankView />);
    await user.click(screen.getByTestId('situation-sarin_attaque'));
    expect(screen.getByTestId('situation-fiche')).toBeTruthy();
    expect(screen.getByTestId('fiche-question').textContent).toContain('حلّل');
    expect(screen.getByTestId('fiche-piege').textContent).toContain('الكورار');
    expect(screen.getByTestId('fiche-documents')).toBeTruthy();
  });

  it('la correction est masquée par défaut et n apparaît qu à la demande', async () => {
    const user = userEvent.setup();
    render(<SituationBankView />);
    await user.click(screen.getByTestId('situation-jagendorf_chloroplaste'));
    expect(screen.queryByTestId('fiche-correction')).toBeNull();

    await user.click(screen.getByTestId('basculer-correction'));
    expect(screen.getByTestId('fiche-correction')).toBeTruthy();

    await user.click(screen.getByTestId('basculer-correction'));
    expect(screen.queryByTestId('fiche-correction')).toBeNull();
  });

  it('le retour à la liste conserve la banque complète', async () => {
    const user = userEvent.setup();
    render(<SituationBankView />);
    await user.click(screen.getByTestId('situation-greffe_rein'));
    await user.click(screen.getByTestId('fermer-fiche'));
    expect(screen.getByTestId('situation-bank')).toBeTruthy();
    expect(screen.getByTestId('situation-count').textContent).toContain(String(SITUATION_COUNT));
  });

  it('chaque fiche ouverte expose au moins un sanad documentaire', async () => {
    const user = userEvent.setup();
    for (const id of ['antibiotique_rifamycine', 'vaccination_rappel', 'coureur_crampe']) {
      render(<SituationBankView />);
      await user.click(screen.getByTestId(`situation-${id}`));
      expect(screen.getByTestId('fiche-documents'), id).toBeTruthy();
      cleanup();
    }
  });
});
