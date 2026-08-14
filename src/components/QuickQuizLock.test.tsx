// #61 — Le sous-onglet « أسئلة سريعة » lançait les 10 unités verrouillées.
//
// Second passage sur le Défi BAC : #58 avait conclu que cet écran était « le
// seul » à contourner `isLocked`. C'était faux. Le sous-onglet voisin, dans
// le MÊME composant, listait `all.filter(u => u.progress < 100)` — sans
// jamais consulter `isLocked` — et servait un bouton « ابدأ QCM » pour
// chacune. Mesure d'origine : à 20 XP, les 3 domaines rendaient 5 + 3 + 3
// boutons et lançaient [1..11], dont **10 unités verrouillées**, là où le
// Défi BAC n'en laissait fuir que 2. La correction de #58 avait donc traité
// la fuite la plus visible en laissant intacte la plus large.
//
// Ces tests verrouillent les deux moitiés du correctif : (a) aucune unité
// fermée n'est lançable ; (b) un domaine fermé n'est pas annoncé comme
// « terminé » — un état vide qui ment est un défaut d'affichage, pas un
// détail cosmétique.
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import TrainingView from './TrainingView';
import { INITIAL_UNITS } from '../unitCatalog';
import type { Unit, UserProgress } from '../types';

afterEach(cleanup);

const progress = (xp: number, completedUnits: number[] = []): UserProgress =>
  ({
    xp,
    streak: 0,
    completedUnits,
    completedQuestionsCount: 0,
    studyMinutes: 0,
    flashcardStats: { again: 0, hard: 0, good: 0, easy: 0 },
    quizScoreHistory: [],
  } as unknown as UserProgress);

const LOCKED_IDS = INITIAL_UNITS.filter((u) => u.isLocked).map((u) => u.id);

function renderTraining(
  launched: number[],
  completedUnits: number[] = [],
  units: Unit[] = INITIAL_UNITS,
) {
  return render(
    <TrainingView
      units={units}
      flashcards={[]}
      progress={progress(20, completedUnits)}
      onLaunchQuiz={(id) => launched.push(id)}
      onLaunchRevision={() => {}}
      onStartLesson={() => {}}
      onRateCard={() => {}}
      isFocusMode={false}
      setIsFocusMode={() => {}}
      onNavigateToTab={() => {}}
    />,
  );
}

/** Ouvre « أسئلة سريعة » puis le domaine demandé, et ancre positivement le
 *  montage : sans cette ancre, une assertion d'absence passerait à vide si le
 *  clic n'avait rien monté (piège rencontré sur DefiBac.test.tsx). */
function openDomain(title: string) {
  fireEvent.click(screen.getByText('أسئلة سريعة'));
  const card = screen.getAllByText(title)[0];
  fireEvent.click(card.closest('button') ?? card);
  expect(screen.getAllByText(title).length).toBeGreaterThan(0);
}

function clickAllLaunchButtons() {
  const btns = screen.queryAllByText(/ابدأ QCM/);
  btns.forEach((b) => fireEvent.click(b.closest('button')!));
  return btns.length;
}

describe('#61 — أسئلة سريعة ne doit pas lancer d unite verrouillee', () => {
  it('le domaine 1 ne propose que l unite reellement ouverte', () => {
    const launched: number[] = [];
    renderTraining(launched);
    openDomain('البروتينات والمناعة');

    const count = clickAllLaunchButtons();
    // Catalogue livré : seule U1 est ouverte dans ce domaine (U2..U5 fermées).
    expect(count).toBe(1);
    expect(launched).toEqual([1]);
  });

  it('AUCUNE unite verrouillee n est lancable, sur les trois domaines', () => {
    for (const title of ['البروتينات والمناعة', 'التحولات الطاقوية', 'التكتونية العامة']) {
      cleanup();
      const launched: number[] = [];
      renderTraining(launched);
      openDomain(title);
      clickAllLaunchButtons();

      const leaked = launched.filter((id) => LOCKED_IDS.includes(id));
      expect(leaked).toEqual([]);
    }
  });

  it('un domaine entierement ferme n est pas annonce comme termine', () => {
    const launched: number[] = [];
    renderTraining(launched);
    openDomain('التحولات الطاقوية'); // U6..U8, toutes verrouillées

    // Aucun bouton, et surtout : le bon message.
    expect(screen.queryAllByText(/ابدأ QCM/)).toHaveLength(0);
    expect(screen.getByTestId('quick-domain-locked')).toBeTruthy();
    expect(screen.queryByTestId('quick-domain-done')).toBeNull();
    expect(document.body.textContent).not.toContain('أحسنت! كل وحدات هذا المجال مكتملة');
  });

  it('un domaine ouvert et acheve affiche bien le message de reussite', () => {
    // Contre-épreuve du test précédent : le message « terminé » doit rester
    // atteignable, sans quoi le correctif l'aurait simplement supprimé.
    const units: Unit[] = INITIAL_UNITS.map((u) =>
      u.id >= 6 && u.id <= 8 ? { ...u, isLocked: false, progress: 100 } : u,
    );
    const launched: number[] = [];
    renderTraining(launched, [], units);
    openDomain('التحولات الطاقوية');

    expect(screen.getByTestId('quick-domain-done')).toBeTruthy();
    expect(screen.queryByTestId('quick-domain-locked')).toBeNull();
  });

  it('une unite deverrouillee par la progression redevient lancable', () => {
    // U6 s'ouvre lorsque U5 est terminée : la règle d'ouverture doit être la
    // même que celle du Défi BAC (#58), et non un simple `!isLocked`.
    const launched: number[] = [];
    renderTraining(launched, [5]);
    openDomain('التحولات الطاقوية');

    clickAllLaunchButtons();
    expect(launched).toContain(6);
    expect(launched).not.toContain(7); // U7 reste fermée
  });

  it('la vignette du domaine ne dit pas « مكتمل » pour un domaine verrouille', () => {
    const launched: number[] = [];
    renderTraining(launched);
    fireEvent.click(screen.getByText('أسئلة سريعة'));

    // Grille des 3 domaines : aucun ne doit s'annoncer complet sur un
    // catalogue vierge où 10 unités sur 11 sont fermées.
    expect(document.body.textContent).not.toContain('مكتمل ✓');
    expect(document.body.textContent).toContain('مقفل');
  });
});
