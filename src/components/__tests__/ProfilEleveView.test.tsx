// ProfilEleveView.test.tsx — LE PANNEAU AFFICHE L'ÉTAT RÉEL, ET NE DIT RIEN
// DE PLUS. Verrou de rendu R1 (audit coach 2026-11-06, GO propriétaire) :
//   · filière AFFICHÉE (constat, pas un sélecteur inventé) ;
//   · décompte BAC affiché AVEC l'étiquette provisoire (r5 — jamais tranché
//     par l'élève : aucun champ de date dans le panneau) ;
//   · l'objectif est local — cliquer l'écrit au stockage et l'affiche ;
//     RIEN appelle le coach.
// Discipline du dépôt : jest-dom n'est pas câblé → existence de nœud et
// textContent. cleanup() explicite.
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import ProfilEleveView from '../ProfilEleveView';
import { CLE_PROFIL_ELEVE, lireProfilEleve } from '../../utils/profilEleve';

beforeEach(() => {
  localStorage.clear();
});
afterEach(() => {
  cleanup();
  localStorage.clear();
});

describe('ProfilEleveView — trois informations honnêtes', () => {
  it('la filière s\'affiche, SANS être un champ modifiable', () => {
    render(<ProfilEleveView />);
    const bloc = document.querySelector('[data-testid="profil-filiere"]');
    expect(bloc).toBeTruthy();
    // Un constat n'est pas un bouton : aucun choix cliquable dans CE bloc.
    expect(bloc!.querySelectorAll('button')).toHaveLength(0);
  });

  it('le décompte BAC est affiché ÉTIQUETÉ provisoire (et reste en lecture)', () => {
    render(<ProfilEleveView />);
    const horizon = document.querySelector('[data-testid="profil-horizon"]');
    expect(horizon).toBeTruthy();
    expect(horizon!.textContent).toContain('تاريخ تقديري');
    // AUCUN champ de date : l'élève ne tranche jamais `dateProvisoire`.
    expect(screen.queryByRole('textbox')).toBeNull();
    expect(screen.queryByRole('spinbutton')).toBeNull();
  });

  it('sans cible choisie : « pas encore », jamais une cible présumée', () => {
    render(<ProfilEleveView />);
    expect(document.querySelector('[data-testid="profil-objectif"]')).toBeTruthy();
    expect(document.querySelector('[data-testid="profil-effacer"]')).toBeNull();
    expect(lireProfilEleve().objectifNote).toBeNull();
  });

  it('choisir une cible l\'écrit AU STOCKAGE, pas seulement à l\'écran', () => {
    render(<ProfilEleveView />);
    const cible16 = document.querySelector<HTMLButtonElement>(
      '[data-testid="profil-objectif-16"]',
    );
    expect(cible16).toBeTruthy();
    fireEvent.click(cible16!);
    // La vérité vit au stockage (l'écran relit, il ne devine pas).
    expect(lireProfilEleve().objectifNote).toBe(16);
    // Et la remise à zéro devient disponible — l'élève reste propriétaire.
    expect(document.querySelector('[data-testid="profil-effacer"]')).toBeTruthy();
  });

  it('la remise à zéro n\'en laisse rien au stockage', () => {
    localStorage.setItem(CLE_PROFIL_ELEVE, JSON.stringify({ objectifNote: 18, majMs: 1 }));
    render(<ProfilEleveView />);
    fireEvent.click(document.querySelector('[data-testid="profil-effacer"]')!);
    expect(lireProfilEleve().objectifNote).toBeNull();
    expect(localStorage.getItem(CLE_PROFIL_ELEVE)).toBeNull();
  });
});
