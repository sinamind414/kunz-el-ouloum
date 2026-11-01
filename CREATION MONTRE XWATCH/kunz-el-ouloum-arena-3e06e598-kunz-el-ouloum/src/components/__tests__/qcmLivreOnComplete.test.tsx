// qcmLivreOnComplete.test.tsx — audit Capitaine 2026-10-17 (§2, P0) :
// « score non transmis ». L'élève termine un chapitre de اختبار الكتاب et son
// score disparaît (aucune écriture, aucun diagnostic informé). Contrat : quand
// la DERNIÈRE réponse du chapitre est validée, QcmLivreView appelle
// onQuizTermine({ unitId, score, total }) — App écrit ensuite l'entrée
// `source: 'livre'` dans quizScoreHistory. Clics réels sur les propositions.
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import QcmLivreView from '../QcmLivreView';
import { QCM_CHAPITRES } from '../../data/qcmLivre';
import { CHAPITRES } from '../../data/bookIndex';

afterEach(cleanup);

function uniteOf(chapitre: number): number | undefined {
  const c = CHAPITRES[chapitre - 1];
  if (!c) return undefined;
  return c.unit + (c.domain === 1 ? 0 : c.domain === 2 ? 5 : 8);
}

describe('QcmLivreView transmet le score du chapitre termine', () => {
  it('la dernière réponse d un chapitre appelle onQuizTermine (unité, score, total)', () => {
    // Chapitre couvert par le plus de questions (banque : ≤ 2 q/chapitre).
    let chapitre = 0;
    for (const q of QCM_CHAPITRES) {
      const nb = QCM_CHAPITRES.filter((x) => x.chapitre === q.chapitre).length;
      const nbMeilleur = QCM_CHAPITRES.filter((x) => x.chapitre === chapitre).length;
      if (nb > nbMeilleur) chapitre = q.chapitre;
    }
    expect(chapitre).toBeGreaterThan(0);
    const questions = QCM_CHAPITRES.filter((q) => q.chapitre === chapitre);
    expect(questions.length).toBeGreaterThanOrEqual(1);

    const espion = vi.fn();
    render(<QcmLivreView onBack={vi.fn()} onQuizTermine={espion} />);

    // Écran 1 → ouvrir le chapitre par son titre exact (libellé du bouton ;
    // le titre apparaît aussi comme en-tête → on vise le BOUTON).
    const titre = CHAPITRES[chapitre - 1].titreAr;
    const entrees = screen.getAllByText(titre);
    const boutonChapitre = entrees.map((e) => e.closest('button')).find(Boolean) as HTMLButtonElement;
    fireEvent.click(boutonChapitre);

    // Répondre TOUT DE BON aux questions (proposition exacte, ordre mélangé).
    for (const q of questions) {
      const bonne = q.options[q.correct];
      const btn = screen.getAllByRole('button').find((b) => (b.textContent || '').trim() === bonne);
      expect(btn, `proposition introuvable pour le chapitre ${chapitre}`).toBeTruthy();
      fireEvent.click(btn!);
    }

    expect(espion).toHaveBeenCalledTimes(1);
    const [res] = espion.mock.calls[0];
    expect(res.unitId).toBe(uniteOf(chapitre));
    expect(res.chapitre).toBe(chapitre);
    expect(res.total).toBe(questions.length);
    expect(res.score).toBe(questions.length); // tout de bon
  });

  it('sans onQuizTermine → aucun crash (prop optionnelle)', () => {
    render(<QcmLivreView onBack={vi.fn()} />);
    expect(screen.getAllByTestId(/^qcm-unite-\d+/).length).toBeGreaterThanOrEqual(1);
  });
});
