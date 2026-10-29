// corrigesTypeJury.lock.test.ts — VERROU DE LA TRANCHE P1-1 (corrigés type
// jury, session 1 : 2024, session 2 : 2023).
//
// Ce que le verrou garantit (méthode H1 — données puis gardes) :
//   1. COUVERTURE EXACTE : [2023, 2024] encodées, 12 exercices (2 années ×
//      2 sujets × 3), chaque exercice porte le barème IMPRIMÉ sur le sujet
//      (5/7/8) — le seul chiffre officiel utilisable ;
//   2. AUCUN BARÈME INVENTÉ PAR ITEM : les éléments n'ont pas de points —
//      structurellement une grille de jury, jamais une note automatique ;
//      aucun énoncé ne contient d'attribution de points (« X نقاط ») ;
//   3. CONTENU SAIN : consigne + attendu non vides, ids uniques, aucun
//      parasite CJK/cyrillique, فصحى ;
//   4. JAMAIS DE PROMESSE CREUSE : toute année « corrigé type » couverte doit
//      exister dans l'index des PDF officiels (le sujet navigateur est
//      téléchargeable) — et toute année non encodée renvoie vide.
//
// L'auto-notation reste l'apanage exclusif du registre 2025 (corrigé
// ministériel) — Pierre 2 : « pas de note sans attendus notés ». —
// (l'itération sur `anneesCorrigesTypeJury()` ci-dessus couvre automatiquement
// chaque session ajoutée au registre : le PDF devra exister pour chacune.)

import { describe, expect, it } from 'vitest';
import {
  anneesCorrigesTypeJury,
  corrigesTypeJuryPour,
  type CorrigeTypeJuryExercice,
} from './corrigesTypeJury';
import { pdfBacDisponible } from '../bacPdfIndex';

const ANNEES_ENCODEES = anneesCorrigesTypeJury();

const TOUS: CorrigeTypeJuryExercice[] = ANNEES_ENCODEES.flatMap((annee) =>
  corrigesTypeJuryPour(annee, 1).concat(corrigesTypeJuryPour(annee, 2)),
);

const PARASITES = /[\u0400-\u04FF\u4E00-\u9FFF]/;

describe('corrigés type jury — couverture et barème officiel', () => {
  it(`deux sessions encodées à ce stade : 2023 puis 2024`, () => {
    expect(ANNEES_ENCODEES).toEqual([2023, 2024]);
    expect(TOUS.length).toBe(12); // 2 années × 2 sujets × 3 exercices
  });

  it(`par année : 6 exercices (2 sujets × 3), barème imprimé 5/7/8 par sujet`, () => {
    for (const annee of ANNEES_ENCODEES) {
      for (const sujet of [1, 2] as const) {
        const exercices = corrigesTypeJuryPour(annee, sujet);
        expect(exercices.length, ` année ${annee} sujet ${sujet}`).toBe(3);
        expect(exercices.map((c) => c.exercice)).toEqual([1, 2, 3]);
        expect(exercices.map((c) => c.maxPts)).toEqual([5, 7, 8]);
        expect(exercices.map((c) => c.sujet)).toEqual([sujet, sujet, sujet]);
      }
    }
  });
});

describe('corrigés type jury — aucun barème inventé (grille jury, manuelle)', () => {
  it(`aucun élément ne porte de points (pas de note automatique)`, () => {
    for (const c of TOUS) {
      expect(c.elements.length).toBeGreaterThanOrEqual(2);
      for (const e of c.elements) {
        expect(Object.keys(e), `élément ${e.id} ne doit pas porter de points`).not.toContain('points');
        expect(Object.keys(e), `élément ${e.id} ne doit pas porter de formes`).not.toContain('formes');
      }
    }
  });

  it(`aucun attendu ne distribue des points (« n نقاط/نقطة »)`, () => {
    const motifPoints = /[0-9٠-٩]\s*(?:نقطة|نقاط|ن)/;
    for (const c of TOUS) {
      for (const e of c.elements) {
        expect(motifPoints.test(e.attenduAr), `attendu ${e.id} : ne doit pas ventiler des points`).toBe(false);
      }
    }
  });
});

describe('corrigés type jury — contenu sain et traçable', () => {
  it(`consigne + attendu non vides, ids uniques au format officiel`, () => {
    const ids = TOUS.flatMap((c) => c.elements.map((e) => e.id));
    expect(new Set(ids).size).toBe(ids.length);
    for (const c of TOUS) {
      expect(c.themeAr.length).toBeGreaterThan(4);
      for (const e of c.elements) {
        expect(e.id).toMatch(/^20\d{2}-[12]-[123]-e\d+$/);
        expect(e.consigneAr.length).toBeGreaterThan(10);
        expect(e.attenduAr.length).toBeGreaterThan(20);
      }
    }
  });

  it(`aucun parasite CJK/cyrillique (فصحى uniquement + sigles latins)`, () => {
    const tout = JSON.stringify(TOUS);
    expect(PARASITES.test(tout)).toBe(false);
  });

  it(`jamais de promesse creuse : année couverte ↔ PDF officiel existant`, () => {
    for (const annee of anneesCorrigesTypeJury()) {
      for (const sujet of [1, 2] as const) {
        expect(pdfBacDisponible(annee, sujet), `PDF manquant pour ${annee}/sujet ${sujet}`).toBe(true);
      }
    }
  });

  it(`années non encodées → vide (l'UI n'affiche rien de fabriqué)`, () => {
    expect(corrigesTypeJuryPour(2013, 1)).toEqual([]);
    expect(corrigesTypeJuryPour(2020, 2)).toEqual([]);
    expect(corrigesTypeJuryPour(2025, 1)).toEqual([]); // 2025 = registre noté (attendusBac2025), pas une grille jury
  });
});
