// tc3Memoire.lock.test.tsx — LA MÉMOIRE PAR QUESTION (TC3, 19/10/2026).
//
// Ce que l'audit « architecture d'apprentissage » a mesuré et que cette
// tranche verrouille :
//   H1 — après une séance de QCM, le stockage ne retenait que {date, score,
//        total} : les questions ratées étaient perdues à vie. Désormais
//        chaque réponse tourne la boucle « erreur → reprise » (SM-2 BORNÉ :
//        échec ⇒ due demain ; réussite À L'ÉCHEANCE ⇒ intervalle ×3, plafonné
//        21 j ; jamais d'intervalle inventé pour une réussite fraîche).
//   H8 — la sauvegarde oubliait des familles entières de clés (boussole_*,
//        kunz-*, bonz_*, smart_tutor_session). Le registre ici rejoue
//        l'inventaire : toute clé écrite dans src/ est sauvegardée ou exclue
//        explicitement.

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import QuizView from '../components/QuizView';
import {
  bilanMemoire,
  enregistrerReponseQcm,
  ordonnerParDues,
  questionsDues,
  reinitialiserMemoireQuestions,
} from '../lib/memoireQuestions';
import { estCleApplicative } from '../data/backup';
import { jourLocal } from '../utils/dayKey';
import type { QuizQuestion } from '../types';

/** Minuit LOCAL du jour contenant `ms` — même convention que le module. */
const minuitLocal = (ms: number): number => Date.parse(`${jourLocal(new Date(ms))}T00:00:00`);

const JOUR = 24 * 60 * 60 * 1000;
// T0 = un mardi 10 h UTC (≠ minuit local : on exige l'alignement sur le jour
// LOCAL de l'élève, pas sur l'epoch).
const T0 = Date.parse('2026-10-19T10:00:00Z');

const QCM = (id: number, juste: string, fausse: string): QuizQuestion => ({
  id,
  unitId: 2,
  questionText: `سؤال ${id}`,
  options: [juste, fausse],
  correctAnswerIndex: 0,
  explanation: 'شرح',
});

beforeEach(() => {
  localStorage.clear();
  reinitialiserMemoireQuestions();
});
afterEach(() => cleanup());

describe('H1 — la boucle « erreur → reprise » (SM-2 borné)', () => {
  it('un échec rend la question due DEMAIN — critère d’acceptation de l’audit atteint', () => {
    // « Après une séance à 10 erreurs, ≥ 80 % reviennent sous 3 jours » :
    // ici, les 10 sont dues dès le lendemain, jour LOCAL.
    for (let i = 0; i < 10; i += 1) enregistrerReponseQcm(100 + i, 2, false, T0);
    const dues = questionsDues(T0 + 1 * JOUR);
    expect(dues).toHaveLength(10);
    for (const m of dues) {
      expect(m.dueAt).toBe(minuitLocal(T0) + JOUR);
      expect(m.dueAt).toBeLessThanOrEqual(T0 + 3 * JOUR);
    }
  });

  it('un succès FRAIS (jamais échoué) n’ouvre AUCUNE ordonnance', () => {
    // Leçon de l'audit (W3) : ne pas transformer 550 QCM en 550 rappels.
    enregistrerReponseQcm(7, 2, true, T0);
    expect(bilanMemoire(T0)).toEqual({ ouvertes: 0, dues: 0 });
    expect(questionsDues(T0 + 10 * JOUR)).toHaveLength(0);
  });

  it('une reprise immédiate réussie (avant l’échéance) ne recule RIEN', () => {
    // Réussir tout de suite n'est pas une preuve de consolidation.
    enregistrerReponseQcm(7, 2, false, T0);
    enregistrerReponseQcm(7, 2, true, T0 + 5 * 60 * 1000);
    const dues = questionsDues(T0 + 1 * JOUR);
    expect(dues).toHaveLength(1);
    expect(dues[0].dueAt).toBe(minuitLocal(T0) + JOUR);
    expect(dues[0].reussites).toBe(1);
  });

  it('une réussite À L’ÉCHEANCE éloigne l’échéance (1 → 3 → 9 → 21 → sortie)', () => {
    enregistrerReponseQcm(7, 2, false, T0);
    const J0 = minuitLocal(T0);
    const r1 = enregistrerReponseQcm(7, 2, true, J0 + 1 * JOUR);
    expect(r1.intervalDays).toBe(3);
    const r2 = enregistrerReponseQcm(7, 2, true, J0 + 1 * JOUR + 3 * JOUR);
    expect(r2.intervalDays).toBe(9);
    const r3 = enregistrerReponseQcm(7, 2, true, J0 + 1 * JOUR + 3 * JOUR + 9 * JOUR);
    expect(r3.intervalDays).toBe(21);
    expect(r3.dueAt).toBe(0); // plafond atteint : sortie de la boucle active
    expect(bilanMemoire(r3.dueAt + JOUR)).toEqual({ ouvertes: 0, dues: 0 });
  });

  it('un échec après consolidation ROUVRE la boucle (retour à 1 j)', () => {
    enregistrerReponseQcm(7, 2, false, T0);
    enregistrerReponseQcm(7, 2, true, T0 + JOUR);
    const rechute = enregistrerReponseQcm(7, 2, false, T0 + 2 * JOUR);
    expect(rechute.echecs).toBe(2);
    expect(rechute.intervalDays).toBe(1);
    expect(rechute.dueAt).toBe(minuitLocal(T0 + 2 * JOUR) + JOUR);
  });
});

describe('H1 — l’ordre d’ouverture d’une séance (`ordonnerParDues`)', () => {
  it('les dues passent EN PREMIER, l’ordre relatif du reste est préservé', () => {
    enregistrerReponseQcm(22, 2, false, T0);
    enregistrerReponseQcm(44, 2, false, T0);
    const liste = [{ id: 11 }, { id: 22 }, { id: 33 }, { id: 44 }];
    expect(ordonnerParDues(liste, T0 + JOUR).map((q) => q.id)).toEqual([22, 44, 11, 33]);
  });

  it('sans dues, la liste est rendue TELLE QUELLE (aucun cosmétique)', () => {
    const liste = [{ id: 11 }, { id: 22 }];
    expect(ordonnerParDues(liste, T0)).toEqual(liste);
    // et ce n'est pas la même instance mutée :
    expect(ordonnerParDues(liste, T0)).not.toBe(liste);
  });
});

describe('TC3 — verrou source de QuizView', () => {
  const src = readFileSync(resolve(import.meta.dirname, '..', 'components', 'QuizView.tsx'), 'utf8');

  it('enregistre chaque réponse dans la mémoire à la fin de séance', () => {
    expect(src).toContain('enregistrerReponseQcm(question.id');
    expect(src).toContain('ordonnerParDues(questions)');
  });

  it('affiche les ratées nommées une à une + le bouton de reprise ciblée', () => {
    expect(src).toContain('data-testid="quiz-erreurs-seance"');
    expect(src).toContain('data-testid="quiz-reprise-erreurs"');
    expect(src).toContain('أعد أخطائي فقط');
  });

  it('ne crédite la progression qu’UNE fois (la reprise n’est pas une 2ᵉ note)', () => {
    expect(src).toContain('dejaCrediteRef.current = true');
  });

  it('la séance vit entièrement sur la liste « actives » (plus de questions.length)', () => {
    expect(src).not.toContain('questions.length');
  });
});

describe('H8 — registre des clés écrites (toute clé est sauvegardée ou exclue)', () => {
  /** Parcourt src/ hors tests. */
  function fichiersSrc(dir: string): string[] {
    const sortis: string[] = [];
    for (const nom of readdirSync(dir)) {
      const chemin = join(dir, nom);
      if (statSync(chemin).isDirectory()) {
        if (nom === '__tests__' || nom === 'node_modules') continue;
        sortis.push(...fichiersSrc(chemin));
      } else if (/\.(ts|tsx)$/.test(nom) && !/\.test\.(ts|tsx)$/.test(nom)) {
        sortis.push(chemin);
      }
    }
    return sortis;
  }

  const RACINE = join(import.meta.dirname, '..', '..');
  const JETONS = ['boussole_token', 'boussole_teacher_token'];

  it('chaque-clé setItem litérale dans src/ passe le périmètre de sauvegarde', () => {
    const manquantes: string[] = [];
    for (const fichier of fichiersSrc(join(RACINE, 'src'))) {
      const contenu = readFileSync(fichier, 'utf8');
      for (const m of contenu.matchAll(/setItem\(\s*'([^']+)'/g)) {
        const cle = m[1];
        if (!estCleApplicative(cle) && !JETONS.includes(cle)) {
          manquantes.push(`${cle}  (${fichier.replace(RACINE, '')})`);
        }
      }
    }
    expect(manquantes, 'clés non sauvegardées et non exclues').toEqual([]);
  });
});

describe('TC3 — boucle complète sur le composant (reprise ciblée, crédit unique)', () => {
  const q1 = QCM(101, 'في الريبوزوم', 'في الميتوكوندري');
  const q2 = QCM(102, 'في النواة', 'في السيتوبلازم');

  it('une séance à 1 erreur ouvre la reprise « أعد أخطائي فقط » sans re-créditer', async () => {
    const onQuizComplete = vi.fn();
    render(
      <QuizView
        unitId={2}
        unitTitle="الوحدة الثانية"
        questions={[q1, q2]}
        onClose={vi.fn()}
        onQuizComplete={onQuizComplete}
      />,
    );
    // q1 juste, q2 fausse, fin de séance. La carte est animée (AnimatePresence
    // « wait », 0,3 s) : la question suivante se cherche avec findBy*.
    fireEvent.click(screen.getByText('في الريبوزوم'));
    fireEvent.click(screen.getByRole('button', { name: /التالي/ }));
    fireEvent.click(await screen.findByText('في السيتوبلازم'));
    fireEvent.click(screen.getByRole('button', { name: /إنهاء وحساب النتيجة/ }));
    expect(onQuizComplete).toHaveBeenCalledTimes(1);
    expect(onQuizComplete).toHaveBeenCalledWith(1, 2);
    // La liste des ratées est nommée, la reprise proposée.
    expect(screen.getByTestId('quiz-erreurs-seance')).toBeTruthy();
    expect(screen.getByText('سؤال 102')).toBeTruthy();
    // Reprise : SEULEMENT la ratée.
    fireEvent.click(screen.getByTestId('quiz-reprise-erreurs'));
    // La carte repart en animation → recherche asynchrone.
    await screen.findByText('سؤال 102');
    expect(screen.getByText('السؤال 1 من 1')).toBeTruthy();
    // La réponse est juste cette fois — toujours pas de second crédit.
    fireEvent.click(screen.getByText('في النواة'));
    fireEvent.click(screen.getByRole('button', { name: /إنهاء وحساب النتيجة/ }));
    expect(onQuizComplete).toHaveBeenCalledTimes(1);
    // …et la mémoire a tourné honnêtement : 102 ratée due ; 101 réussie mais
    // JAMAIS ordonnancée (dueAt = 0 — aucun rappel inventé).
    const dossier = JSON.parse(localStorage.getItem('kunz_qcm_memoire_v1') ?? '[]') as Array<{
      questionId: number;
      dueAt: number;
    }>;
    expect(dossier.find((d) => d.questionId === 102)?.dueAt ?? 0).toBeGreaterThan(0);
    expect(dossier.find((d) => d.questionId === 101)?.dueAt ?? 0).toBe(0);
  });
});
