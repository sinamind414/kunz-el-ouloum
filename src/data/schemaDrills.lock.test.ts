// schemaDrills.lock.test.ts — verrous de « ارسم من الذاكرة » (item 17, sprint 12).
//
// Le risque n°1 de ce module est l'ASSET FANTÔME : un exercice qui renvoie vers
// un fichier absent afficherait une image cassée au moment exact où l'élève
// attend la correction. Le premier test lit donc le manifeste réel sur disque.
// Les autres figent la grille de notation (elle vaut barème) et la couverture.

import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  SCHEMA_DRILLS,
  SCHEMA_DRILL_BY_ID,
  SCHEMA_DRILL_COUNT,
  drillUnitIds,
  drillsForUnit,
  missingEssentials,
  scoreFromChecked,
  totalPoints,
  verdictFor,
} from './schemaDrills';
import { ACTIVE_LESSONS } from './activeLessons';
import { INITIAL_UNITS } from './index';

const RACINE = resolve(__dirname, '../..');
const MANIFESTE: string[] = JSON.parse(
  readFileSync(resolve(RACINE, 'public/assets/images/schemas/manifest.json'), 'utf8'),
).assets;

describe('schémas — les assets existent réellement', () => {
  it('chaque assetSrc figure au manifeste des schémas', () => {
    const connus = new Set(MANIFESTE);
    for (const d of SCHEMA_DRILLS) {
      expect(connus.has(d.assetSrc), `${d.id} → ${d.assetSrc} absent du manifeste`).toBe(true);
    }
  });

  it('chaque assetSrc correspond à un fichier présent sur disque', () => {
    for (const d of SCHEMA_DRILLS) {
      const chemin = resolve(RACINE, 'public' + d.assetSrc);
      expect(existsSync(chemin), `${d.id} → fichier manquant : ${chemin}`).toBe(true);
    }
  });

  it('chaque exercice porte un texte alternatif utile (accessibilité)', () => {
    for (const d of SCHEMA_DRILLS) expect(d.altAr.length, d.id).toBeGreaterThanOrEqual(25);
  });
});

describe('schémas — grille de notation', () => {
  it('5 à 9 éléments par exercice, identifiants uniques', () => {
    for (const d of SCHEMA_DRILLS) {
      expect(d.elements.length, d.id).toBeGreaterThanOrEqual(5);
      expect(d.elements.length, d.id).toBeLessThanOrEqual(9);
      const ids = d.elements.map((e) => e.id);
      expect(new Set(ids).size, `${d.id} : éléments dupliqués`).toBe(ids.length);
    }
  });

  it('chaque exercice contient au moins trois éléments indispensables (2 points)', () => {
    for (const d of SCHEMA_DRILLS) {
      expect(d.elements.filter((e) => e.points === 2).length, d.id).toBeGreaterThanOrEqual(3);
    }
  });

  it('le total est un barème plausible (8 à 16 points)', () => {
    for (const d of SCHEMA_DRILLS) {
      expect(totalPoints(d), d.id).toBeGreaterThanOrEqual(8);
      expect(totalPoints(d), d.id).toBeLessThanOrEqual(16);
    }
  });

  it('chaque exercice nomme au moins deux pièges et un ordre de tracé', () => {
    for (const d of SCHEMA_DRILLS) {
      expect(d.trapsAr.length, d.id).toBeGreaterThanOrEqual(2);
      expect(d.orderAr.length, d.id).toBeGreaterThanOrEqual(3);
      expect(d.orderAr.length, d.id).toBeLessThanOrEqual(5);
      expect(d.minutes, d.id).toBeGreaterThanOrEqual(5);
      expect(d.minutes, d.id).toBeLessThanOrEqual(15);
    }
  });

  it('la consigne est bien une demande de dessin', () => {
    for (const d of SCHEMA_DRILLS) {
      expect(/ارسم|أنجز رسماً|أنجز مخططاً|ارسم مخططاً/.test(d.consigneAr), `${d.id} : ${d.consigneAr}`).toBe(
        true,
      );
    }
  });
});

describe('schémas — calcul du score', () => {
  const d = SCHEMA_DRILL_BY_ID.drill_synapse;

  it('une feuille blanche vaut zéro et déclenche « à refaire »', () => {
    expect(scoreFromChecked(d, [])).toBe(0);
    expect(verdictFor(d, [])).toBe('a_refaire');
  });

  it('tout cocher vaut le total et déclenche « maîtrisé »', () => {
    const tous = d.elements.map((e) => e.id);
    expect(scoreFromChecked(d, tous)).toBe(totalPoints(d));
    expect(verdictFor(d, tous)).toBe('maitrise');
  });

  it('un identifiant inconnu n ajoute aucun point', () => {
    expect(scoreFromChecked(d, ['element_qui_n_existe_pas'])).toBe(0);
  });

  it('les éléments indispensables oubliés sont listés, les accessoires non', () => {
    const sansVesicules = d.elements.filter((e) => e.id !== 'vesicules').map((e) => e.id);
    const oublis = missingEssentials(d, sansVesicules).map((e) => e.id);
    expect(oublis).toEqual(['vesicules']);

    const tous = d.elements.map((e) => e.id);
    expect(missingEssentials(d, tous)).toEqual([]);
  });

  it('les trois verdicts sont atteignables sur le même exercice', () => {
    const tries = [...d.elements].sort((a, b) => b.points - a.points).map((e) => e.id);
    const verdicts = new Set(tries.map((_, i) => verdictFor(d, tries.slice(0, i + 1))));
    expect(verdicts.has('a_refaire')).toBe(true);
    expect(verdicts.has('maitrise')).toBe(true);
    expect(verdicts.size).toBeGreaterThanOrEqual(2);
  });
});

describe('schémas — couverture', () => {
  it('au moins 16 schémas, identifiants uniques', () => {
    expect(SCHEMA_DRILL_COUNT).toBeGreaterThanOrEqual(16);
    const ids = SCHEMA_DRILLS.map((d) => d.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(Object.keys(SCHEMA_DRILL_BY_ID)).toHaveLength(SCHEMA_DRILL_COUNT);
  });

  it('les unités couvertes existent et incluent les plus lourdes du sujet', () => {
    const unites = drillUnitIds();
    for (const u of unites) expect(INITIAL_UNITS.some((x) => x.id === u), `unité ${u}`).toBe(true);
    for (const u of [1, 2, 3, 4, 5, 6, 7]) expect(unites, `unité ${u} sans schéma`).toContain(u);
    expect(drillsForUnit(4).length).toBeGreaterThanOrEqual(3);
  });

  it('tout lessonId cité est une leçon active réelle', () => {
    for (const d of SCHEMA_DRILLS) {
      if (!d.lessonId) continue;
      expect(Object.keys(ACTIVE_LESSONS), d.id).toContain(d.lessonId);
    }
  });

  it('drillsForUnit ne renvoie que l unité demandée', () => {
    for (const u of drillUnitIds()) {
      expect(drillsForUnit(u).every((d) => d.unitId === u)).toBe(true);
    }
    expect(drillsForUnit(42)).toEqual([]);
  });
});
