/**
 * Verrou H5 « effort mesuré » — audit architecture d'apprentissage (19/10).
 *
 * Preuve de l'auditeur (dossier « Preuves », sonde p5_flash, commit audité
 * 0639e08) : 75 notations par un bot à ~0,5 s l'une creditaient 236 min
 * d'étude, 750 XP et « objectif atteint » (minutes aléatoires 2–4 min/note
 * dans App.tsx). Ce verrou gèle la correction :
 *   1. rejeu exact du bot ⇒ 0 minute créditée ;
 *   2. rythme humain honnête (75 cartes × 20 s) ⇒ 25 min, ni plus ni moins ;
 *   3. plafond 2 min par carte (une carte laissée 1 h ne crédit pas 1 h) ;
 *   4. aucune affichage mesuré ⇒ aucun crédit ;
 *   5. Points XP : « again » = 0 (H5), hard/good/easy inchangés (5/10/15).
 *
 * État interne du module remis à zéro avant chaque test par la porte dédiée
 * remiseAZeroPourTests() — compatible double runner (vitest + jest).
 */
import { describe, expect, it, beforeEach } from 'vitest';
import {
  PLAFOND_DUREE_EFFORT_MS,
  POINTS_PAR_NOTATION,
  minutesReelMesurees,
  noterAffichageEffort,
  remiseAZeroPourTests,
} from '../utils/effortMesure';

beforeEach(() => {
  remiseAZeroPourTests();
});

describe('H5 — effort mesuré (minutes réelles, plafonnées, XP again=0)', () => {
  it('rejeu de la sonde p5 : 75 notations à 0,5 s ⇒ 0 minute créditée (avant : 236)', () => {
    let t = 1_000_000;
    let total = 0;
    for (let i = 0; i < 75; i++) {
      noterAffichageEffort(`bot-${i}`, t);
      t += 500; // le bot note en ~0,5 s
      total += minutesReelMesurees(t);
    }
    expect(total).toBe(0);
  });

  it('rythme humain honnête : 75 cartes × 20 s ⇒ 25 minutes exactement', () => {
    let t = 1_000_000;
    let total = 0;
    for (let i = 0; i < 75; i++) {
      noterAffichageEffort(`h-${i}`, t);
      t += 20_000;
      total += minutesReelMesurees(t);
    }
    expect(total).toBe(25);
    // 75 × 20 s = 1500 s = 25 min pile : aucune fraction résiduelle ne doit
    // faire déborder le crédit au-delà du temps réellement passé.
    noterAffichageEffort('h-suite', t);
    t += 59_000; // encore sous la minute
    expect(minutesReelMesurees(t)).toBe(0);
  });

  it('plafond par carte : 1 h sur une carte ⇒ 2 min créditées, pas plus', () => {
    const t0 = 1_000_000;
    noterAffichageEffort('longue', t0);
    const creditees = minutesReelMesurees(t0 + 3_600_000);
    expect(creditees).toBe(2); // PLAFOND_DUREE_EFFORT_MS = 120 s
    // Consommée : aucune nouvelle mesure sans nouvel affichage.
    expect(minutesReelMesurees(t0 + 3_700_000)).toBe(0);
  });

  it('aucune affichage enregistré ⇒ aucun crédit (pas de mesure = pas de crédit)', () => {
    expect(minutesReelMesurees(1_000_000)).toBe(0);
  });

  it('une nouvelle affichage réinitialise la mesure (pas de contamination)', () => {
    const t0 = 1_000_000;
    noterAffichageEffort('carte-a', t0);
    noterAffichageEffort('carte-b', t0 + 10_000); // a remplacée par b
    // La durée mesurée part de l'affichage de b uniquement (20 s ⇒ 0 min).
    const creditees = minutesReelMesurees(t0 + 30_000);
    expect(creditees).toBe(0);
  });

  it('verrou XP : again = 0 (H5), hard/good/easy = 5/10/15 (inchangés)', () => {
    expect(POINTS_PAR_NOTATION.again).toBe(0);
    expect(POINTS_PAR_NOTATION.hard).toBe(5);
    expect(POINTS_PAR_NOTATION.good).toBe(10);
    expect(POINTS_PAR_NOTATION.easy).toBe(15);
  });

  it('le plafond est verrouillé à 120 s (constant de la tranche H5)', () => {
    expect(PLAFOND_DUREE_EFFORT_MS).toBe(120_000);
  });
});
