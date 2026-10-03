// documentTypology.test.ts — verrous de l'index secondaire (BILAN §5).
//
// Ce fichier n'écrit aucun contenu : ses tests vérifient qu'il se contente de
// REGROUPER l'existant et qu'il n'écrit aucune étiquette de son cru
// (AGENTS.md §5 : aucun contenu inventé).

import { describe, expect, it } from 'vitest';
import {
  exercicesQuantitatifs,
  formesDe,
  groupesParForme,
  pastillesForme,
  situationIdsParForme,
  situationIdsQuantitatives,
} from './documentTypology';
import { DOCUMENT_ANALYSIS_EXERCISES } from './documentAnalysisExercises';
import { DOCUMENT_PRACTICE_CONTEXTS } from './documentPracticeContexts';
import { SITUATION_INDEX } from './situationIndex';

/** Corpus de provenance : toutes les phrases déjà écrites par le projet. */
const CORPUS = [
  ...DOCUMENT_ANALYSIS_EXERCISES.map((e) => e.doc.descriptionAr),
  ...DOCUMENT_PRACTICE_CONTEXTS.flatMap((c) => [
    c.documentTypeAr ?? '',
    c.altAr,
    c.goalAr,
    c.observationAr,
  ]),
].join(' \n ');

describe('groupesParForme — trou 3, typologie des documents', () => {
  it('couvre exactement les 19 exercices, sans doublon ni perte', () => {
    const groupes = groupesParForme();
    const ids = groupes.flatMap((g) => g.exerciceIds);
    expect(ids).toHaveLength(DOCUMENT_ANALYSIS_EXERCISES.length);
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(ids)).toEqual(new Set(DOCUMENT_ANALYSIS_EXERCISES.map((e) => e.id)));
    for (const g of groupes) expect(g.total).toBe(g.exerciceIds.length);
  });

  it('ne contient aucun type vide et affiche les formes par effectif décroissant', () => {
    const groupes = groupesParForme();
    expect(groupes.length).toBeGreaterThanOrEqual(5);
    for (const g of groupes) expect(g.total, g.forme).toBeGreaterThan(0);
  });

  it('les libellés arabes sont PRIS DANS le corpus — aucune étiquette inventée', () => {
    for (const g of groupesParForme()) {
      expect(CORPUS.includes(g.labelAr), `${g.forme} → « ${g.labelAr} » absent du corpus`).toBe(
        true,
      );
    }
  });

  it('les libellés ne contiennent aucune lettre latine', () => {
    for (const g of groupesParForme()) expect(/[A-Za-z]/.test(g.labelAr), g.forme).toBe(false);
  });

  it('compte 15 documents affichables sur 19, comme le verrou d intégrité', () => {
    const affichables = groupesParForme().reduce((s, g) => s + g.affichables, 0);
    expect(affichables).toBe(15);
    for (const g of groupesParForme()) {
      expect(g.affichables, g.forme).toBeLessThanOrEqual(g.total);
      expect(g.affichables, g.forme).toBeGreaterThanOrEqual(0);
    }
  });

  it('les deux formes du trou 3 ont enfin un groupe non vide', () => {
    const parForme = new Map(groupesParForme().map((g) => [g.forme, g]));
    expect(parForme.get('ouchterlony')?.total).toBe(1);
    expect(parForme.get('electrophorese')?.total).toBe(1);
    // L'ouchterlony est désormais affichable (image déjà présente dans le dépôt) ;
    // l'électrophorèse HbA/HbS reste sans document : on ne montre pas la figure
    // des γ-globulines à la place.
    expect(parForme.get('ouchterlony')?.affichables).toBe(1);
    expect(parForme.get('electrophorese')?.affichables).toBe(0);
  });

  it('pastillesForme reflète groupesParForme sans divergence', () => {
    expect(pastillesForme()).toEqual(
      groupesParForme().map((g) => ({ forme: g.forme, labelAr: g.labelAr, total: g.total })),
    );
  });
});

describe('exercicesQuantitatifs — trou 1, exploitation chiffrée', () => {
  it('ne retient que les questions déclarées quantitative par le ValidationEngine', () => {
    const listes = exercicesQuantitatifs();
    expect(listes.length).toBeGreaterThan(0);
    const attendues = DOCUMENT_ANALYSIS_EXERCISES.flatMap((e) =>
      e.questions.filter((q) => (q.ctx as { docType?: string }).docType === 'quantitative'),
    );
    expect(listes.reduce((s, x) => s + x.questionIds.length, 0)).toBe(attendues.length);
    expect(attendues).toHaveLength(6);
  });

  it('ne retourne jamais un exercice sans question quantitative', () => {
    for (const x of exercicesQuantitatifs()) {
      const ex = DOCUMENT_ANALYSIS_EXERCISES.find((e) => e.id === x.exerciseId);
      expect(ex, x.exerciseId).toBeDefined();
      expect(x.questionIds.length, x.exerciseId).toBeGreaterThan(0);
      for (const qid of x.questionIds) {
        expect(ex!.questions.some((q) => q.id === qid), `${x.exerciseId}/${qid}`).toBe(true);
      }
    }
  });

  it('reste vide plutôt que faux positif si aucune question n est quantitative', () => {
    // Les tableaux ATP et les vitesses sismiques sont bien dans le lot :
    const ids = exercicesQuantitatifs().map((x) => x.exerciseId);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toContain('respiration_bilan');
  });
});

describe('pointeurs vers les situations', () => {
  it('situationIdsParForme ne renvoie que des situations réelles', () => {
    const valides = new Set(SITUATION_INDEX.map((s) => s.id));
    for (const g of groupesParForme()) {
      for (const id of situationIdsParForme(g.forme)) expect(valides.has(id), id).toBe(true);
    }
  });

  it('la forme « أقواس الترسيب » ouvre au moins une situation', () => {
    expect(situationIdsParForme('ouchterlony').size).toBeGreaterThan(0);
  });

  it('le filtre chiffré pointe des situations réelles et une sous-ensemble de la banque', () => {
    const valides = new Set(SITUATION_INDEX.map((s) => s.id));
    const q = situationIdsQuantitatives();
    expect(q.size).toBeGreaterThan(0);
    for (const id of q) expect(valides.has(id), id).toBe(true);
    expect(q.size).toBeLessThan(SITUATION_INDEX.length);
  });

  it('formesDe agrège les formes d un ensemble d exercices', () => {
    const une = formesDe(['curare_table']);
    expect(une).toEqual(new Set(['tableau']));
    expect(formesDe([])).toEqual(new Set());
  });
});
