// bacArchetypes.lock.test.ts — verrou des montages récurrents du BAC (sprint 19).
//
// Un archétype n'a de valeur que s'il est ADOSSÉ à des exercices réels : ces
// tests interdisent qu'un montage soit inventé, qu'il cite un exercice
// inexistant, ou qu'il repose sur une seule session (auquel cas ce n'est pas
// une récurrence, c'est une anecdote).

import { describe, expect, it } from 'vitest';
import {
  ARCHETYPE_BY_ID,
  ARCHETYPE_COUNT,
  BAC_ARCHETYPES,
  archetypeRecurrence,
  archetypesForIdea,
  ideasOfArchetype,
  unclassifiedIdeaIds,
  yearsOfArchetype,
} from './bacArchetypes';
import { BAC_IDEAS, IDEA_BY_ID } from './bacSessionIndex';

describe('archétypes — adossement aux sujets réels', () => {
  it('ne cite que des exercices existants de la banque', () => {
    for (const a of BAC_ARCHETYPES) {
      for (const id of a.ideaIds) {
        expect(IDEA_BY_ID[id], `${a.id} → ${id}`).toBeTruthy();
      }
    }
  });

  it('repose sur au moins trois exercices et deux sessions distinctes', () => {
    for (const a of BAC_ARCHETYPES) {
      expect(a.ideaIds.length, a.id).toBeGreaterThanOrEqual(3);
      expect(yearsOfArchetype(a.id).length, a.id).toBeGreaterThanOrEqual(2);
    }
  });

  it('n’a ni doublon d’identifiant ni doublon d’exercice au sein d’un montage', () => {
    const ids = BAC_ARCHETYPES.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const a of BAC_ARCHETYPES) {
      expect(new Set(a.ideaIds).size, a.id).toBe(a.ideaIds.length);
      expect(ARCHETYPE_BY_ID[a.id]).toBe(a);
    }
  });

  it('classe la quasi-totalité du corpus, et assume le reste', () => {
    const restants = unclassifiedIdeaIds();
    expect(restants.length / BAC_IDEAS.length).toBeLessThan(0.1);
    // Le seul isolat attendu : l'unique exercice de bioénergétique du corpus.
    for (const id of restants) expect(IDEA_BY_ID[id]).toBeTruthy();
  });
});

describe('archétypes — utilité pédagogique', () => {
  it('donne des signaux de reconnaissance, une méthode ordonnée et un piège', () => {
    for (const a of BAC_ARCHETYPES) {
      expect(a.signalsAr.length, a.id).toBeGreaterThanOrEqual(2);
      expect(a.methodAr.length, a.id).toBeGreaterThanOrEqual(3);
      expect(a.trapAr.length, a.id).toBeGreaterThan(40);
      expect(a.definitionAr.length, a.id).toBeGreaterThan(40);
    }
  });

  it('couvre les grands gestes attendus : enzyme, nerf, immunité, photosynthèse, génétique', () => {
    expect(ARCHETYPE_COUNT).toBeGreaterThanOrEqual(8);
    const ids = BAC_ARCHETYPES.map((a) => a.id);
    expect(ids).toContain('arch_inhibiteur_sosie');
    expect(ids).toContain('arch_canal_detourne');
    expect(ids).toContain('arch_echappement_immunitaire');
    expect(ids).toContain('arch_mibide_photosynthese');
    expect(ids).toContain('arch_mutation_phenotype');
  });

  it('reconnaît qu’un exercice peut relever de plusieurs montages', () => {
    const multiples = BAC_IDEAS.filter((i) => archetypesForIdea(i.id).length > 1);
    expect(multiples.length).toBeGreaterThan(3);
  });
});

describe('archétypes — classement de récurrence', () => {
  it('trie par points cumulés et reste déterministe', () => {
    const r1 = archetypeRecurrence();
    expect(r1).toEqual(archetypeRecurrence());
    for (let i = 1; i < r1.length; i += 1) {
      expect(r1[i - 1].points).toBeGreaterThanOrEqual(r1[i].points);
    }
  });

  it('place le montage « canal détourné » et « molécule sosie » en tête', () => {
    const tete = archetypeRecurrence().slice(0, 3).map((r) => r.archetypeId);
    expect(tete).toContain('arch_canal_detourne');
    expect(tete).toContain('arch_inhibiteur_sosie');
  });

  it('rend les exercices d’un montage du plus récent au plus ancien', () => {
    const annees = ideasOfArchetype('arch_inhibiteur_sosie').map((i) => i.year);
    expect(annees).toEqual([...annees].sort((a, b) => b - a));
  });

  it('cumule des points cohérents avec le barème officiel', () => {
    for (const r of archetypeRecurrence()) {
      const attendu = ideasOfArchetype(r.archetypeId).reduce((s, i) => s + i.points, 0);
      expect(r.points).toBe(attendu);
    }
  });
});
