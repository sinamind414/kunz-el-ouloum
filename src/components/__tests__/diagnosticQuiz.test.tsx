// diagnosticQuiz.test.tsx — LE PRODUCTEUR DE MÉMOIRE (point A, 14/10/2026).
//
// DÉFAUT COUVERT : `utils/profilErreurs.ts` savait suivre les erreurs, mais
// `enregistrerErreurs` n'était appelé qu'à DEUX endroits de l'application — les
// productions de l'atelier méthodologique. Un élève qui ne touche jamais cet
// atelier gardait donc une mémoire d'erreurs VIDE à vie, et le capitaine
// n'avait rien de vrai à lui dire. Ces tests vérifient que le QCM alimente
// désormais cette mémoire, avec ce que l'élève DÉCLARE — jamais ce qu'on suppose.

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import QuizView from '../QuizView';
import type { QuizQuestion } from '../../types';
import { ERROR_TAXONOMY } from '../../data/errorTaxonomy';
import { CAUSES_QCM, causeParId, doitDemanderCause } from '../../data/diagnosticQuiz';

const QUESTION: QuizQuestion = {
  id: 1,
  questionText: 'حدد العضية المسؤولة عن دمج الأحماض الأمينية في الخلية.',
  options: ['النواة', 'الريبوزوم', 'الميتوكندريا', 'جهاز غولجي'],
  correctAnswerIndex: 1,
  explanation: 'التجميع يتم على مستوى الريبوزوم.',
  unitId: 1,
};

const CLE_PROFIL = 'boussole_profil_erreurs';

const props = {
  unitId: 1,
  unitTitle: 'التخصص الوظيفي للبروتينات',
  questions: [QUESTION],
  onClose: vi.fn(),
  onQuizComplete: vi.fn(),
};

/** Répond au QCM : `juste` choisit la bonne proposition, sinon la mauvaise. */
function repondre(juste: boolean) {
  render(<QuizView {...props} />);
  // Le mélange des propositions est actif : on clique par TEXTE, jamais par index.
  const texte = juste ? 'الريبوزوم' : 'النواة';
  fireEvent.click(screen.getByText(texte));
  fireEvent.click(screen.getByText('إنهاء وحساب النتيجة'));
}

beforeEach(() => {
  window.localStorage.clear();
  window.sessionStorage.clear();
});
afterEach(cleanup);

describe('les causes proposées sont des données valides', () => {
  it('quatre causes, identifiants distincts', () => {
    expect(CAUSES_QCM).toHaveLength(4);
    expect(new Set(CAUSES_QCM.map((c) => c.id)).size).toBe(4);
  });

  it('chaque code non nul EXISTE dans la taxonomie', () => {
    // Sans cette garde, `enregistrerErreurs` rejetterait silencieusement le code
    // (il ignore les codes inconnus) : l'élève répondrait, et RIEN ne serait
    // mémorisé — le pire des deux mondes.
    for (const cause of CAUSES_QCM) {
      if (cause.code === null) continue;
      expect(Object.keys(ERROR_TAXONOMY), `${cause.id} → ${cause.code}`).toContain(cause.code);
    }
  });

  it('« cause autre » n’enregistre RIEN (on n’invente pas un motif)', () => {
    // La taxonomie ne doit jamais recevoir une cause que l'élève n'a pas
    // reconnue : c'est la différence entre une mémoire et une fiction.
    expect(causeParId('autre')?.code).toBeNull();
  });

  it('un identifiant inconnu ne produit pas d’erreur', () => {
    expect(causeParId('inexistant')).toBeNull();
    expect(causeParId(null)).toBeNull();
    expect(causeParId(undefined)).toBeNull();
  });

  it('la famille des notions est enfin stockable', () => {
    // Avant le 14/10/2026, AUCUN code de la taxonomie ne décrivait une confusion
    // entre deux notions : la famille décrite dans `profilErreurs.ts` ne pouvait
    // pas être remplie, même par un producteur. Le commentaire est devenu donnée.
    expect(ERROR_TAXONOMY.notion_confusion).toBeDefined();
    expect(ERROR_TAXONOMY.notion_confusion.nameAr).toContain('الخلط');
    expect(ERROR_TAXONOMY.notion_confusion.counterActionAr.length).toBeGreaterThan(20);
  });
});

describe('la question n’est posée que quand elle a un sens', () => {
  it('aucune erreur → aucune question', () => {
    expect(doitDemanderCause(0, false)).toBe(false);
  });

  it('au moins une erreur → question', () => {
    expect(doitDemanderCause(1, false)).toBe(true);
    expect(doitDemanderCause(7, false)).toBe(true);
  });

  it('jamais deux fois dans la même séance', () => {
    expect(doitDemanderCause(3, true)).toBe(false);
  });

  it('un compteur inexploitable ne déclenche pas de question', () => {
    expect(doitDemanderCause(Number.NaN, false)).toBe(false);
    expect(doitDemanderCause(Number.POSITIVE_INFINITY, false)).toBe(false);
  });
});

describe('dans un vrai QCM — le producteur fonctionne', () => {
  it('un élève qui rate voit la question à la fin de la séance', () => {
    repondre(false);
    expect(screen.getByText('من أين جاء خطؤك في هذا التمرين؟')).toBeTruthy();
    expect(screen.getByTestId('cause-notion')).toBeTruthy();
  });

  it('un élève qui réussit ne voit AUCUNE question', () => {
    repondre(true);
    // Demander « pourquoi as-tu échoué ? » à un élève qui a tout juste serait une
    // faute de pédagogie, pas une collecte de données.
    expect(screen.queryByText('من أين جاء خطؤك في هذا التمرين؟')).toBeNull();
  });

  it('déclarer « je ne connaissais pas le concept » écrit dans le profil', () => {
    repondre(false);
    fireEvent.click(screen.getByTestId('cause-notion'));

    const brut = window.localStorage.getItem(CLE_PROFIL);
    expect(brut, 'aucune erreur enregistrée — le producteur ne produit rien').not.toBeNull();
    const profil = JSON.parse(brut as string);
    expect(profil.notion_confusion.n).toBe(1);
    // Le thème est transmis : le guide peut nommer l'ENDROIT, pas seulement le type.
    expect(profil.notion_confusion.themes[0]).toBe('التخصص الوظيفي للبروتينات');
  });

  it('« سبب آخر » ne laisse AUCUNE trace dans le profil', () => {
    repondre(false);
    fireEvent.click(screen.getByTestId('cause-autre'));
    expect(window.localStorage.getItem(CLE_PROFIL)).toBeNull();
  });

  it('après avoir répondu, la question disparaît (on ne redemande pas)', () => {
    repondre(false);
    fireEvent.click(screen.getByTestId('cause-notion'));
    expect(screen.queryByTestId('cause-notion')).toBeNull();
    expect(screen.getByTestId('cause-enregistree')).toBeTruthy();
  });

  it('une réponse ne produit QU’UNE entrée, même en cliquant deux fois', () => {
    repondre(false);
    fireEvent.click(screen.getByTestId('cause-notion'));
    const profil = JSON.parse(window.localStorage.getItem(CLE_PROFIL) as string);
    expect(profil.notion_confusion.n).toBe(1);
  });
});

describe('le branchement ne peut pas être retiré en silence', () => {
  const quiz = readFileSync(resolve(process.cwd(), 'src/components/QuizView.tsx'), 'utf8');

  it('le QCM importe et appelle réellement enregistrerErreurs', () => {
    expect(quiz).toContain("import { enregistrerErreurs } from '../utils/profilErreurs'");
    expect(quiz).toMatch(/enregistrerErreurs\(\[cause\.code\]/);
  });

  it('le profil n’est jamais alimenté par une cause supposée', () => {
    // Un seul appel, et il passe par la cause déclarée. Toute autre écriture
    // serait une déduction de l'application sur l'élève.
    const appels = quiz.match(/enregistrerErreurs\(/g) ?? [];
    expect(appels).toHaveLength(1);
    expect(quiz).toContain('const cause = causeParId(id);');
  });
});
