// difficulteQcm.lock.test.ts — M3 (audit externe 8 axes, 14/10/2026) :
// « aucun étiquetage de difficulté sur les QCM ». La difficulté existe dans la
// STRUCTURE du dépôt (6 segments nommés d1a/d1b/d1c, d2a/d2b, d3) — le barrel
// l'estampe centralement ; ce verrou fige :
//   1. la cohérence segment ↔ id ↔ palier (aucune dérive possible),
//   2. les compteurs mesurés après le filtre T3a (531 QCM servis),
//   3. l'affichage du badge dans QuizView (source + rendu réel jsdom).
// Ça ne crée AUCUNE donnée : les paliers viennent de l'origine des segments ;
// le rééquilibrage vers D1≈75 %/D2≈20 %/D3≈5 % se fera par AJOUT (enseignant).

import { cleanup, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import {
  SVT_QUIZ_QUESTIONS,
  QCM_HORS_PERIMETRE,
  LIBELLES_DIFFICULTE,
} from '../quizCorpus/index';
import { QUESTIONS_D1A } from '../quizCorpus/qcm0-d1a';
import { QUESTIONS_D2A } from '../quizCorpus/qcm1-d2a';
import { QUESTIONS_D3 } from '../quizCorpus/qcm2-d3';
import { QUESTIONS_D1B } from '../quizCorpus/qcm3-d1b';
import { QUESTIONS_D2B } from '../quizCorpus/qcm4-d2b';
import { QUESTIONS_D1C } from '../quizCorpus/qcm5-d1c';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import QuizView from '../components/QuizView';

const PALIER_PAR_SEGMENT = {
  QUESTIONS_D1A: 1,
  QUESTIONS_D2A: 2,
  QUESTIONS_D3: 3,
  QUESTIONS_D1B: 1,
  QUESTIONS_D2B: 2,
  QUESTIONS_D1C: 1,
} as const;
const SEGMENTS = {
  QUESTIONS_D1A,
  QUESTIONS_D2A,
  QUESTIONS_D3,
  QUESTIONS_D1B,
  QUESTIONS_D2B,
  QUESTIONS_D1C,
};

describe('M3 — difficulté des QCM : cohérence segment ↔ palier', () => {
  it('CHAQUE QCM servi porte un palier valide (1|2|3) et le bon au regard de son segment', () => {
    expect(SVT_QUIZ_QUESTIONS.every((q) => q.difficulte === 1 || q.difficulte === 2 || q.difficulte === 3))
      .toBe(true);
    for (const [nom, palier] of Object.entries(PALIER_PAR_SEGMENT)) {
      for (const q of SEGMENTS[nom as keyof typeof SEGMENTS]) {
        if (QCM_HORS_PERIMETRE.has(q.id)) continue; // les exclus restent dans le segment brut
        const servi = SVT_QUIZ_QUESTIONS.find((x) => x.id === q.id);
        expect(servi, `id ${q.id} (${nom}) : absent ou palier dérivé !== segment`).toBeTruthy();
        expect(servi!.difficulte, `id ${q.id} (${nom})`).toBe(palier);
      }
    }
  });

  it('compteurs figés mesurés (post-T3a) : 531 servis = 250 D1 + 127 D2 + 154 D3', () => {
    expect(SVT_QUIZ_QUESTIONS.length).toBe(531);
    const par = { 1: 0, 2: 0, 3: 0 } as Record<number, number>;
    for (const q of SVT_QUIZ_QUESTIONS) par[q.difficulte!]++;
    expect(par[1]).toBe(250);
    expect(par[2]).toBe(127);
    expect(par[3]).toBe(154);
  });

  it('les libellés d affichage couvrent les 3 paliers (فصحى, source unique du badge)', () => {
    expect(new Set(Object.keys(LIBELLES_DIFFICULTE)).size).toBe(3);
    for (const libelle of Object.values(LIBELLES_DIFFICULTE)) {
      expect(libelle.trim().length).toBeGreaterThan(0);
      expect(libelle).toMatch(/[\u0600-\u06FF]/); // arabe
    }
  });

  it('QuizView affiche le badge « صعوبة » (source)', () => {
    const src = readFileSync(resolve(__dirname, '../components/QuizView.tsx'), 'utf8');
    expect(src).toContain('LIBELLES_DIFFICULTE');
    expect(src).toContain('صعوبة');
  });

  it('badge rendu en réel : « صعوبة » visible pour difficulte=2, absent sans difficulte (fillBlank)', () => {
    const base = {
      id: 7,
      questionText: 'ما هو قياس الضغط داخل الشعيرات؟',
      options: ['a', 'b', 'c', 'd'],
      correctAnswerIndex: 0,
      explanation: 'شرح.',
      unitId: 4,
    };
    render(
      <QuizView unitId={4} unitTitle="الوحدة" questions={[{ ...base, difficulte: 2 }]} onClose={vi.fn()} onQuizComplete={vi.fn()} />,
    );
    expect(screen.getByText(/صعوبة/)).toBeTruthy();
    expect(screen.getByText(/متوسط/)).toBeTruthy();
    cleanup();
    render(<QuizView unitId={4} unitTitle="الوحدة" questions={[base]} onClose={vi.fn()} onQuizComplete={vi.fn()} />);
    expect(screen.queryByText(/صعوبة/)).toBeNull();
  });
});
