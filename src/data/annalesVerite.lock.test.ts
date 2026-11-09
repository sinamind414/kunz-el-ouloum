// Phase 1 / R6 (2026-11-07) — VERROU DE NON-INVENTION DES ANNALES.
//
// L'audit demande « 8 → 0 sessions sans énoncé ». Les énoncés et corrigés
// officiels sont ABSENTS du dépôt : les produire serait inventer du contenu.
// Ce verrou ne fige donc pas un chiffre à atteindre, il fige la VÉRITÉ de
// l'existant et la VISIBILITÉ de la dégradation, pour que personne ne puisse
// combler un trou avec un sujet fabriqué en silence.

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  AVERTISSEMENT_ENONCES_BAC,
  RATTRAPAGE_BAC,
  questionsBaremePourAnnee,
} from './bacCorrectionIndex';
import {
  BAC_IDEAS,
  BAC_SESSION_SOURCES,
  INCOMPLETE_SUJETS,
  MISSING_YEARS,
  YEARS_COVERED,
} from './bacSessionIndex';

const lire = (p: string) => readFileSync(resolve(process.cwd(), p), 'utf8');
const idees = lire('src/components/BacIdeasView.tsx');
const correcteur = lire('src/components/BacCorrectionPanel.tsx');

describe('Phase 1 / R6 : état mesuré, aucune annale inventée', () => {
  it('11 sessions indexées (2016..2026), 65 idées, 0 année manquante', () => {
    expect(YEARS_COVERED).toHaveLength(11);
    expect(Math.min(...YEARS_COVERED)).toBe(2016);
    expect(Math.max(...YEARS_COVERED)).toBe(2026);
    expect(BAC_IDEAS).toHaveLength(65);
    expect(MISSING_YEARS).toEqual([]);
  });

  it('CHAQUE session porte ses DEUX liens officiels (sujet + corrigé)', () => {
    expect(BAC_SESSION_SOURCES).toHaveLength(YEARS_COVERED.length);
    for (const s of BAC_SESSION_SOURCES) {
      expect(s.url, `${s.year} : sujet`).toMatch(/^https:\/\//);
      expect(s.correctionUrl, `${s.year} : corrigé`).toMatch(/^https:\/\//);
    }
  });

  it('8 sessions « idées seules » / 3 avec barème : aucun corrigé annoncé à tort', () => {
    const avecBareme = YEARS_COVERED.filter((y) => questionsBaremePourAnnee(y).length > 0);
    expect(avecBareme).toHaveLength(3);
    expect(YEARS_COVERED.length - avecBareme.length).toBe(8);
    for (const y of YEARS_COVERED) {
      if (avecBareme.includes(y)) continue;
      expect(questionsBaremePourAnnee(y), `${y} sans barème intégré`).toEqual([]);
    }
  });

  it('la lacune 2021 S2 reste DÉCLARÉE, avec sa raison', () => {
    expect(INCOMPLETE_SUJETS).toHaveLength(1);
    expect(INCOMPLETE_SUJETS[0].year).toBe(2021);
    expect(INCOMPLETE_SUJETS[0].sujet).toBe(2);
    expect(INCOMPLETE_SUJETS[0].raison).toContain('non lisible');
  });

  it('rattrapage : non-indexe + « Non vérifiable », aucun sujet fabriqué', () => {
    expect(RATTRAPAGE_BAC.statut).toBe('non-indexe');
    expect(RATTRAPAGE_BAC.fr).toContain('Non vérifiable');
    expect(RATTRAPAGE_BAC.ar).toContain('لم نضف أي موضوع');
  });

  it('l’avertissement ONEC est rendu dans les DEUX vues Bac', () => {
    expect(AVERTISSEMENT_ENONCES_BAC.ar).toContain('ONEC');
    expect(AVERTISSEMENT_ENONCES_BAC.fr).toContain('ne sont pas reproduits');
    expect(idees).toContain('AVERTISSEMENT_ENONCES_BAC');
    expect(correcteur).toContain('AVERTISSEMENT_ENONCES_BAC');
  });

  it('la dégradation est VISIBLE : lacune, rattrapage, pas de corrigé intégré', () => {
    expect(idees).toContain('idees-lacune');
    expect(idees).toContain('INCOMPLETE_SUJETS');
    expect(correcteur).toContain('bac-rattrapage');
    expect(correcteur).toContain('RATTRAPAGE_BAC');
    expect(correcteur).toContain('لا تصحيح');
  });
});
