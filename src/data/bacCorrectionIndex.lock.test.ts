// bacCorrectionIndex.lock.test.ts — VERROU DE LA VÉRITÉ BAC.
//
// Un écran qui annonce « corrigé officiel » pour une session sans attendus
// intégrés est une promesse fausse. Ce test empêche toute dérive : chaque année
// affichée doit avoir une source officielle, et chaque barème annoncé doit
// correspondre à de vraies questions de `baremeCorrecteur`.

import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  COUVERTURE_BAC,
  STATS_COUVERTURE_BAC,
  couvertureBacSession,
  questionsBaremePourAnnee,
  RATTRAPAGE_BAC,
} from './bacCorrectionIndex';
import {
  BAC_IDEAS,
  BAC_SESSION_SOURCES,
  INCOMPLETE_SUJETS,
  YEARS_COVERED,
  pointsOfSujet,
} from './bacSessionIndex';
import { listBaremeQuestions } from './dictionaries/baremeCorrecteur';

const RACINE = resolve(__dirname, '../..');

describe('couverture BAC — aucune session inventée', () => {
  it('une couverture par année indexée, ni plus ni moins', () => {
    expect(COUVERTURE_BAC).toHaveLength(YEARS_COVERED.length);
    expect(COUVERTURE_BAC.map((c) => c.year)).toEqual(YEARS_COVERED);
    expect(couvertureBacSession(1999)).toBeNull();
  });

  it('chaque année porte ses DEUX liens officiels (sujet + corrigé)', () => {
    for (const c of COUVERTURE_BAC) {
      expect(c.sujetUrl, `${c.year} : sujet`).toMatch(/^https:\/\//);
      expect(c.correctionUrl, `${c.year} : corrigé`).toMatch(/^https:\/\//);
      const source = BAC_SESSION_SOURCES.find((s) => s.year === c.year);
      expect(c.sujetUrl).toBe(source!.url);
      expect(c.correctionUrl).toBe(source!.correctionUrl);
    }
    expect(STATS_COUVERTURE_BAC.nbSources).toBe(YEARS_COVERED.length);
  });

  it('les compteurs d’idées et de points viennent des exports, pas du texte', () => {
    for (const c of COUVERTURE_BAC) {
      expect(c.nbIdees).toBe(BAC_IDEAS.filter((i) => i.year === c.year).length);
      expect(c.pointsSujet1).toBe(pointsOfSujet(c.year, 1));
      expect(c.pointsSujet2).toBe(pointsOfSujet(c.year, 2));
    }
    expect(STATS_COUVERTURE_BAC.nbIdees).toBe(BAC_IDEAS.length);
  });

  it('un barème n’est annoncé QUE si de vraies questions sont évaluables', () => {
    for (const c of COUVERTURE_BAC) {
      const questions = questionsBaremePourAnnee(c.year);
      expect(c.nbQuestionsBareme, `${c.year}`).toBe(questions.length);
      expect(c.nbItemsBareme, `${c.year}`).toBe(
        questions.reduce((s, q) => s + q.items.length, 0),
      );
      expect(c.niveau === 'bareme-officiel', `${c.year}`).toBe(questions.length > 0);
    }
    expect(STATS_COUVERTURE_BAC.nbQuestionsBareme).toBe(listBaremeQuestions().length);
    expect(STATS_COUVERTURE_BAC.nbItemsBareme).toBe(80);
    expect(STATS_COUVERTURE_BAC.anneesAvecBareme).toEqual([2025, 2024, 2023]);
    expect(STATS_COUVERTURE_BAC.anneesSansBareme).toHaveLength(8);
  });

  it('un seul sujet intégral est annoncé, et l’écran existe réellement', () => {
    expect(STATS_COUVERTURE_BAC.nbSujetsIntegraux).toBe(1);
    expect(COUVERTURE_BAC.find((c) => c.sujetIntegral)!.year).toBe(2025);
    const vue = readFileSync(resolve(RACINE, 'src/components/Bac2025ExamView.tsx'), 'utf8');
    expect(vue).toContain('noterCopieCalibree');
    expect(existsSync(resolve(RACINE, 'src/components/Bac2025ExamView.tsx'))).toBe(true);
  });

  it('la lacune 2021 S2 est déclarée, pas comblée', () => {
    const c2021 = couvertureBacSession(2021)!;
    expect(c2021.lacunes).toHaveLength(1);
    expect(c2021.lacunes[0]!.sujet).toBe(2);
    expect(c2021.pointsSujet2).toBe(15); // 20 - 5 : l'exercice 1 manque
    expect(INCOMPLETE_SUJETS).toHaveLength(STATS_COUVERTURE_BAC.nbLacunes);
  });

  it('le rattrapage reste explicitement « Non vérifiable »', () => {
    expect(RATTRAPAGE_BAC.statut).toBe('non-indexe');
    expect(RATTRAPAGE_BAC.fr).toContain('Non vérifiable');
    expect(RATTRAPAGE_BAC.ar).toContain('لم نضف أي موضوع');
  });
});
