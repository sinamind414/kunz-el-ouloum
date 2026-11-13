// statsErreursPassives.lock.test.ts — VERROU R4 (audit coach 2026-11-06,
// GO propriétaire en session — AFFICHAGE PASSIF dès 1).
//
// Le défaut d'origine : le دفتر الأخطاء comptait depuis la PREMIÈRE erreur
// (`totalErreurs`), mais aucun écran stat ne le lisait — l'élève ne voyait
// rien avant que le capitaine ne parle (≥ 2). Ce verrou fige les DEUX faces
// de la décision :
//
//   1. le drapeau reste câblé aux stats (testid + lecture du total réel) ;
//   2. AUCUN seuil n'est déplacé : le seuil de PAROLE du capitaine (≥ 2, deux
//      portes) et le seuil de `resumeProfilAr` (< 2 → silence) restent exacts.
//
// Pourquoi un verrou SOURCE : StatsView monte un canvas et des modales — le
// greffon minimum est le texte (pratique éprouvée : tc2Brancher.lock.test.ts).
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { enregistrerErreurs, totalErreurs } from '../../utils/profilErreurs';

const SOURCE_STATS = readFileSync(
  join(process.cwd(), 'src', 'components', 'StatsView.tsx'),
  'utf8',
);
const SOURCE_CAPITAINE = readFileSync(
  join(process.cwd(), 'src', 'lib', 'invitationCapitaine.ts'),
  'utf8',
);

beforeEach(() => {
  localStorage.clear();
});
afterEach(() => {
  localStorage.clear();
});

describe('R4 — le drapeau « erreurs » reste câblé aux stats, en lecture pure', () => {
  it('StatsView porte le testid dédié et lit le total RÉEL du دفتر', () => {
    expect(SOURCE_STATS).toContain('data-testid="stats-erreurs-signal"');
    expect(SOURCE_STATS).toContain('erreursOuvertes');
  });

  it('le drapeau est SILENCIEUX quand le دفتر est vide (dès 1, pas à 0)', () => {
    // Le rendu conditionnel est le verrou : sans lui, un zéro fabriquerait un
    // drapeau permanent qui ne dit rien (exactement le organe vide refusé).
    expect(SOURCE_STATS).toContain('erreursOuvertes > 0');
  });

  it('l\'affichage N\'ouvre AUCUNE porte vers la parole du capitaine', () => {
    // Passif = aucune bulle, aucun import de la machine de décision.
    expect(SOURCE_STATS).not.toContain('invitationCapitaine');
    expect(SOURCE_STATS).not.toContain('invitationDuMoment');
  });
});

describe('R4 — AUCUN seuil modifié (les deux faces de la règle restent exactes)', () => {
  it('le seuil de parole ≥ 2 reste aux DEUX portes du capitaine', () => {
    expect(SOURCE_CAPITAINE).toContain('ctx.erreursAReprendre >= 2');
    expect(SOURCE_CAPITAINE).toContain('etat.erreurs.total >= 2');
  });

  it('la Mémoire compte RÉELLEMENT dès 1 (mesuré, pas esthétique)', () => {
    // `missing_unit` est un code réel de ERROR_TAXONOMY (cf. profilErreurs.test).
    enregistrerErreurs(['missing_unit'], { theme: 'التنفس الخلوي' });
    expect(totalErreurs()).toBe(1); // la pastille peut apparaître DÈS cette valeur
  });
});
