// BacExamView.format.test.tsx — B2 (audit « ligne par ligne » 2026-10-17).
//
// DÉFAUT HISTORIQUE : les 3 « épreuves blanches » venaient d'un document
// généré par IA (« PROGRAMME NATIONAL SVT CLAUDE OPUS - Copie.MD ») et
// utilisaient un format qui N'EXISTE PAS au BAC (4 exercices × 5 pts,
// 180 min), verrouillé par un test. L'officiel : 3 exercices 5+7+8 points,
// 4 h 30, deux sujets au choix.
//
// Ce verrou garantit que la voie « اختبار نمط بكالوريا » ne peut plus
// présenter qu'un format officiel composé d'exercices réellement tombés
// (mockExam.composeMockExam, déterministe, sources ONEC/eddirasa citées)
// — et que le corpus généré par IA ne revient pas par la fenêtre.
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import BacExamView from '../BacExamView';

afterEach(cleanup);

describe('BacExamView — format officiel uniquement (B2)', () => {
  it('le corpus d épreuves généré par IA est SUPPRIMÉ du dépôt (src/data/bacExam.ts)', () => {
    expect(existsSync(resolve(__dirname, '../../data/bacExam.ts'))).toBe(false);
    expect(existsSync(resolve(__dirname, '../../data/bacExam.lock.test.ts'))).toBe(false);
  });

  it('affiche 3 sujets blancs au format officiel : 3 exercices 5+7+8, 4 سا و 30 د', async () => {
    const user = userEvent.setup();
    render(<BacExamView onBack={() => {}} />);

    // L'ancien sous-titre mensonger « 4 تمارين × 5 نقاط، 3 ساعات » est interdit :
    expect(screen.queryByText(/4 تمارين/)).toBeNull();

    const premiers = screen.getAllByTestId(/^bac-blanc-\d+$/);
    expect(premiers.length).toBeGreaterThanOrEqual(3);

    await user.click(screen.getByTestId('bac-blanc-1'));

    // Durée officielle affichée : 4 h 30 (270 min).
    expect(screen.getByText(/4 سا و 30 د/)).toBeTruthy();
    expect(screen.getByText(/20 نقطة/)).toBeTruthy();

    // Trois exercices avec le barème 5 / 7 / 8.
    for (const pts of ['5', '7', '8']) {
      expect(screen.getAllByText(new RegExp(`\\(${pts} نقاط?\\)`)).length).toBeGreaterThan(0);
    }
    // Aucun contenu généré par IA ne revient : pas de « الاختبار الرابع ».
    expect(screen.queryByText(/التمرين الرابع/)).toBeNull();
  });
});
