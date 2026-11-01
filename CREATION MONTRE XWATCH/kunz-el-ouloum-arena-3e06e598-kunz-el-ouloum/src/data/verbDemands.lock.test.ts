// verbDemands.lock.test.ts — verrou du classement des consignes (sprint 22).
//
// Le corpus contient 71 formulations pour 47 exercices. Ces tests garantissent
// que le classement reste TOTAL (aucune formulation orpheline), que l'ordre des
// règles est respecté là où il porte du sens, et que chaque famille dit
// vraiment à l'élève quoi écrire.

import { describe, expect, it } from 'vitest';
import {
  VERB_FAMILIES,
  VERB_FAMILY_BY_ID,
  VERB_FAMILY_COUNT,
  classifyVerb,
  formulationsOfFamily,
  ideasForVerbFamily,
  unclassifiedVerbs,
  verbFamilyStats,
} from './verbDemands';
import { BAC_IDEAS } from './bacSessionIndex';

describe('consignes — classement total du corpus', () => {
  it('ne laisse aucune formulation non reconnue', () => {
    expect(unclassifiedVerbs()).toEqual([]);
  });

  it('couvre les 47 exercices : chacun a au moins une famille de consigne', () => {
    for (const idea of BAC_IDEAS) {
      const familles = idea.verbsAr.map((v) => classifyVerb(v)?.id).filter(Boolean);
      expect(familles.length, idea.id).toBeGreaterThan(0);
    }
  });

  it('a des identifiants uniques et un index cohérent', () => {
    const ids = VERB_FAMILIES.map((f) => f.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const f of VERB_FAMILIES) expect(VERB_FAMILY_BY_ID[f.id]).toBe(f);
    expect(VERB_FAMILY_COUNT).toBeGreaterThanOrEqual(10);
  });
});

describe('consignes — l’ordre des règles porte du sens', () => {
  it('« بيّن في نص علمي » est un texte scientifique, pas un simple « بيّن »', () => {
    expect(classifyVerb('بيّن في نص علمي')?.id).toBe('verb_texte_scientifique');
    expect(classifyVerb('بيّن')?.id).toBe('verb_expliquer');
  });

  it('« ناقش صحة الفرضية » est une validation, pas une hypothèse', () => {
    expect(classifyVerb('ناقش صحة الفرضية')?.id).toBe('verb_valider');
    expect(classifyVerb('اقترح فرضيتين')?.id).toBe('verb_hypothese');
  });

  it('« اقترح حلاً علاجياً » est une solution, pas une hypothèse', () => {
    expect(classifyVerb('اقترح حلاً علاجياً')?.id).toBe('verb_solution');
  });

  it('« لخّص في مخطط » est un schéma-bilan, pas une conclusion', () => {
    expect(classifyVerb('لخّص في مخطط')?.id).toBe('verb_schema_bilan');
    expect(classifyVerb('استنتج')?.id).toBe('verb_conclure');
  });

  it('sépare analyser et expliquer, la confusion la plus coûteuse de l’épreuve', () => {
    expect(classifyVerb('حلّل')?.id).toBe('verb_analyser');
    expect(classifyVerb('فسّر')?.id).toBe('verb_expliquer');
    expect(VERB_FAMILY_BY_ID.verb_analyser.confusionAr).toContain('فسّر');
    expect(VERB_FAMILY_BY_ID.verb_expliquer.confusionAr).toContain('تحليل');
  });
});

describe('consignes — utilité de chaque fiche', () => {
  it('donne une demande, une structure ordonnée, un canevas et une confusion', () => {
    for (const f of VERB_FAMILIES) {
      expect(f.demandeAr.length, f.id).toBeGreaterThan(40);
      expect(f.structureAr.length, f.id).toBeGreaterThanOrEqual(3);
      expect(f.templateAr.length, f.id).toBeGreaterThan(10);
      expect(f.confusionAr.length, f.id).toBeGreaterThan(40);
      expect(f.motifs.length, f.id).toBeGreaterThan(0);
    }
  });

  it('rattache chaque famille à des exercices réels et à des formulations vues', () => {
    for (const f of VERB_FAMILIES) {
      expect(ideasForVerbFamily(f.id).length, f.id).toBeGreaterThan(0);
      expect(formulationsOfFamily(f.id).length, f.id).toBeGreaterThan(0);
    }
  });
});

describe('consignes — poids mesuré', () => {
  it('classe « حلّل » et « فسّر » parmi les trois familles les plus fréquentes', () => {
    const tete = verbFamilyStats().slice(0, 3).map((s) => s.familyId);
    expect(tete).toContain('verb_analyser');
    expect(tete).toContain('verb_expliquer');
  });

  it('montre que le texte scientifique est demandé sur la majorité des sessions', () => {
    const texte = verbFamilyStats().find((s) => s.familyId === 'verb_texte_scientifique');
    expect(texte!.sessions).toBeGreaterThanOrEqual(6);
  });

  it('reste déterministe et cohérent avec les exercices comptés', () => {
    expect(verbFamilyStats()).toEqual(verbFamilyStats());
    for (const s of verbFamilyStats()) {
      expect(s.exercices).toBe(ideasForVerbFamily(s.familyId).length);
    }
  });
});
