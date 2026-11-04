// LessonsViewEtat.test.tsx — LA PASTILLE D'ÉTAT PAR UNITÉ (tranche 3, audit 8
// axes — 2026-11-04).
//
// Le contrat mesuré :
//   1. VERROU : `etatEleveSiChargee() === null` ⇒ AUCUNE pastille rendue — ni
//      gris qui ressemble à un verdict, ni valeur inventée ;
//   2. l'état arrive ASYNCHRONE (dépôt APRÈS le montage) : l'abonnement
//      (option C, `surveillerEtatEleve`) doit faire apparaître les pastilles
//      sans re-monter la vue — le piège du pointeur jamais relu ;
//   3. la couleur dérive du verdict existant du coach (🔴 faible · 🟡 moyen ·
//      ⚪ non commencé · 🟢 fort), et une unité absente du verdict reste sans
//      pastille (famille compétence non chargée pour elle).
import { act, cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import LessonsView from '../LessonsView';
import {
  etatEleveSiChargee,
  fournirEtatEleve,
  reinitialiserEtatEleve,
  surveillerEtatEleve,
} from '../../lib/etatEleveRuntime';
import { assemblerEtatEleve } from '../../lib/etatEleve';
import { getUnitTitle } from '../../data/lessonModes';

// La leçon ouverte n'est pas le sujet : on capture la clé reçue par le lecteur.
vi.mock('../HtmlLessonViewer', () => ({
  default: ({ lessonKey }: { lessonKey: string }) => (
    <div data-testid="viewer">{lessonKey}</div>
  ),
}));

afterEach(() => {
  reinitialiserEtatEleve();
  cleanup();
});

/** Ouvre l'écran « الدرس الرسمي » puis le domaine 1 (grille des unités). */
async function ouvrirDomaine1() {
  const user = userEvent.setup();
  render(<LessonsView />);
  await user.click(screen.getByText('الدرس الرسمي'));
  await user.click(screen.getByTestId('domaine-1'));
  return user;
}

/** Un état minimal dont seule la famille compétence est chargée. */
function etatAvecVerdicts(verdicts: Record<string, 'faible' | 'moyen' | 'non_commence' | 'fort'>) {
  return assemblerEtatEleve({
    daily: undefined,
    maintenant: new Date(2026, 10, 4, 18, 0, 0),
    competence: { verdicts, faibles: [], unitePrioritaire: null },
  });
}

describe('la pastille d’état par unité obéit au verrou « pas d’état ⇒ aucune couleur »', () => {
  it('sans état déposé : aucune pastille dans la grille des unités', async () => {
    await ouvrirDomaine1();
    expect(etatEleveSiChargee()).toBeNull();
    expect(screen.queryByTestId('etat-unite-1')).toBeNull();
    expect(screen.queryByTestId('etat-unite-2')).toBeNull();
    expect(screen.queryByTestId('etat-unite-5')).toBeNull();
  });

  it('état déposé APRÈS le montage : les pastilles apparaissent (l’abonnement a joué)', async () => {
    await ouvrirDomaine1();
    // Le dépôt simule l'arrivée async de l'état du capitaine — hors d'un
    // événement utilisateur, donc dans `act()` pour que React committe.
    act(() => {
      fournirEtatEleve(etatAvecVerdicts({
        [getUnitTitle(1)]: 'fort',
        [getUnitTitle(2)]: 'faible',
      }));
    });
    const p1 = screen.getByTestId('etat-unite-1');
    const p2 = screen.getByTestId('etat-unite-2');
    expect(p1.textContent).toContain('🟢');
    expect(p2.textContent).toContain('🔴');
    // Une unité sans verdict dans l'état reste SANS pastille.
    expect(screen.queryByTestId('etat-unite-3')).toBeNull();
  });

  it('remise à zéro : les pastilles disparaissent (jamais un verdict figé)', async () => {
    await ouvrirDomaine1();
    act(() => {
      fournirEtatEleve(etatAvecVerdicts({ [getUnitTitle(1)]: 'moyen' }));
    });
    expect(screen.getByTestId('etat-unite-1').textContent).toContain('🟡');
    act(() => {
      reinitialiserEtatEleve();
    });
    expect(screen.queryByTestId('etat-unite-1')).toBeNull();
  });
});

describe('surveillerEtatEleve — le signal du pointeur (option C)', () => {
  it('prévient les abonnés au dépôt ET à la remise à zéro ; désabonnement propre', () => {
    const coups: string[] = [];
    const stop = surveillerEtatEleve(() => coups.push('signal'));
    act(() => {
      fournirEtatEleve(etatAvecVerdicts({}));
    });
    expect(coups).toEqual(['signal']);
    act(() => {
      reinitialiserEtatEleve();
    });
    expect(coups).toEqual(['signal', 'signal']);
    stop();
    act(() => {
      fournirEtatEleve(etatAvecVerdicts({}));
    });
    expect(coups).toEqual(['signal', 'signal']); // plus rien après désabonnement
  });
});
