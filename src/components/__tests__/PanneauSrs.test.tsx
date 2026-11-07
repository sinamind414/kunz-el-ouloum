// PanneauSrs.test.tsx — LE PANNEAU AFFICHE L'ÉTAT RÉEL DU STOCKAGE, ET RIEN
// D'AUTRE. Verrou du câblage Reco 3 (audit coach 2026-11-06, lot 🔴) : si le
// bilan s'inventait un chiffre — ou si une absence d'état devenait une
// « échéance » — l'élève verrait une répétition espacée mensongère. Ici chaque
// testid est posé sur la valeur numérique, jamais sur le libellé : une
// reformulation de texte ne peut pas classer un compteur.
//
// Discipline du dépôt (AGENTS.md) : `@testing-library/jest-dom` n'est PAS
// câblé → les assertions passent par des existence de nœud et comparaisons
// de textContent. `cleanup()` est appelé explicitement.

import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import PanneauSrs from '../PanneauSrs';
import type { Flashcard } from '../../types';

const JOUR = 86_400_000;
// L'horloge réelle, RELATIVE : le panneau calcule ses états contre Date.now()
// au rendu — toute échéance antérieure est comptée « échue ». Le stockage de
// test est donc posé autour de l'horloge actuelle, jamais d'un instant figé.
const horloge = (): number => Date.now();

const carte = (id: string, unitId: number, question: string): Flashcard => ({
  id,
  unitId,
  question,
  answerBullets: ['جواب'],
});

const cartes: Flashcard[] = [
  carte('c-echue', 1, 'السؤال المسدد'),
  carte('c-programmee', 1, 'السؤال المجدول'),
  carte('c-consolidee', 2, 'السؤال المتقن'),
  carte('c-jamais', 2, 'السؤال غير المقيَّم'),
];

const installerStockage = (): number => {
  const maintenant = horloge();
  localStorage.setItem(
    'kunz_flashcard_srs_v1',
    JSON.stringify({
      'c-echue': { ease: 2.5, intervalDays: 1, dueAt: maintenant - 1000, reps: 1, lapses: 0 },
      'c-programmee': { ease: 2.5, intervalDays: 3, dueAt: maintenant + 3 * JOUR, reps: 2, lapses: 0 },
      'c-consolidee': { ease: 2.5, intervalDays: 30, dueAt: 0, reps: 5, lapses: 0 },
      // c-jamais : volontairement ABSENT — le panneau doit le dire, pas le déguiser.
    }),
  );
  return maintenant;
};

const valeurDe = (testid: string): string | null => {
  const span = document.querySelector(`[data-testid="${testid}-valeur"]`);
  return span ? span.textContent : null;
};

afterEach(() => {
  cleanup();
  localStorage.clear();
});

describe('PanneauSrs — lecture honnête du stockage SM-2', () => {
  it('les quatre compteurs reflètent exactement l\'état persisté', () => {
    installerStockage();
    render(<PanneauSrs cards={cartes} srsVersion={1} />);
    expect(valeurDe('srs-echeues')).toBe('1');
    expect(valeurDe('srs-programmees')).toBe('1');
    expect(valeurDe('srs-consolidees')).toBe('1');
    expect(valeurDe('srs-jamais')).toBe('1');
  });

  it('aucune carte sans état ne devient « échue » (l\'absence se dit, ne se masque pas)', () => {
    installerStockage();
    render(<PanneauSrs cards={cartes} srsVersion={1} />);
    const panneau = document.querySelector('[data-testid="panneau-srs"]');
    expect(panneau).toBeTruthy();
    expect(valeurDe('srs-echeues')).not.toBe('2');
  });

  it('deck vierge : zéro partout, aucun libellé de chemin masqué', () => {
    render(<PanneauSrs cards={cartes} srsVersion={1} />);
    expect(valeurDe('srs-echeues')).toBe('0');
    expect(valeurDe('srs-programmees')).toBe('0');
    expect(valeurDe('srs-consolidees')).toBe('0');
    expect(valeurDe('srs-jamais')).toBe('4');
    expect(document.querySelector('[data-testid="srs-prochain-list"]')).toBeNull();
  });

  it('le bilan d\'unité choisie s\'ajoute au bilan global sans le remplacer', () => {
    installerStockage();
    render(<PanneauSrs cards={cartes} uniteId={1} uniteTitre="الوحدة 1" srsVersion={1} />);
    const bilanUnite = document.querySelector('[data-testid="srs-unite-bilan"]');
    expect(bilanUnite).toBeTruthy();
    expect(bilanUnite!.textContent).toContain('1');
    // Le bilan GLOBAL reste affiché (la carte de l'unité 2 n'a pas disparu).
    expect(valeurDe('srs-consolidees')).toBe('1');
  });

  it('listable : les cartes programmées apparaissent par prochaine échéance', () => {
    installerStockage();
    render(<PanneauSrs cards={cartes} srsVersion={1} />);
    const liste = document.querySelector('[data-testid="srs-prochain-list"]');
    expect(liste).toBeTruthy();
    expect(liste!.textContent).toContain('السؤال المجدول');
  });

  it('srsVersion change → le bilan rejoue sa lecture (deux notations simulées)', () => {
    const maintenant = installerStockage();
    const { rerender } = render(<PanneauSrs cards={cartes} srsVersion={1} />);
    expect(valeurDe('srs-echeues')).toBe('1');
    // L'élève a noté la carte échue comme « good » → elle passe en programmée.
    const brut = localStorage.getItem('kunz_flashcard_srs_v1');
    expect(brut).toBeTruthy();
    const etats = JSON.parse(brut!);
    etats['c-echue'] = { ease: 2.5, intervalDays: 1, dueAt: maintenant + JOUR, reps: 2, lapses: 0 };
    localStorage.setItem('kunz_flashcard_srs_v1', JSON.stringify(etats));
    rerender(<PanneauSrs cards={cartes} srsVersion={2} />);
    expect(valeurDe('srs-echeues')).toBe('0');
    expect(valeurDe('srs-programmees')).toBe('2');
  });
});
