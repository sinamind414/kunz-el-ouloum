// immunityCooperation.lock.test.ts — verrou du SPRINT 2 de l'audit
// docs/analyse/AUDIT_APP_5_LECONS_PRIORITAIRES.md (items 3 et 4) :
//   3) leçon active `immunity_cooperation` : schéma-bilan interactif (6 étapes)
//      + 3 exercices type BAC (GUIDED_DOC_QA) + comparatif humoral/cellulaire ;
//   4) branche « coopération cellulaire » de la carte mentale immunitaire.
import { describe, expect, it } from 'vitest';
import { ACTIVE_LESSONS, LESSON_PROGRESSION } from './activeLessons';
import { CONCEPT_ROUTES } from './conceptRoutes';
import { RESUMES_LECONS, CHAPITRES_ANCRAGE } from './resumesLecons';
import { LESSON_GOLD_SUMMARIES } from './lessonGoldSummaries';
import { getUnitLessonSequence } from './unitLessonSequences';
import { MIND_MAPS_DATABASE } from './mindMapData';

const CLE = 'immunity_cooperation';

describe('Leçon de synthèse — التعاون الخلوي (U4)', () => {
  const lecon = ACTIVE_LESSONS[CLE];

  it('existe, avec 4 blocs : bilan ordonné, 3 questions BAC, comparatif, production', () => {
    expect(lecon).toBeDefined();
    expect(lecon.blocks.map((b) => b.type)).toEqual([
      'SEQUENCE_ORDER',
      'GUIDED_DOC_QA',
      'COMPARISON_TABLE',
      'TEXT_AND_PRODUCE',
    ]);
  });

  it('le schéma-bilan compte 6 étapes ordonnées, de la CPA aux effecteurs', () => {
    const b = lecon.blocks[0];
    if (b.type !== 'SEQUENCE_ORDER') throw new Error('bloc 1 inattendu');
    expect(b.steps.map((s) => s.expectedOrder)).toEqual([1, 2, 3, 4, 5, 6]);
    expect(b.steps[0].labelAr).toContain('تبلعم');
    expect(b.steps[b.steps.length - 1].labelAr).toContain('ذاكرة');
    expect(b.summaryKeywords).toEqual(
      expect.arrayContaining(['CMH', 'الإنترلوكين', 'التكاثر النسيلي']),
    );
  });

  it('les 3 exercices BAC couvrent analyse des milieux, rôle d’IL2 et cas du SIDA', () => {
    const b = lecon.blocks[1];
    if (b.type !== 'GUIDED_DOC_QA') throw new Error('bloc 2 inattendu');
    expect(b.questions.map((q) => q.id)).toEqual([
      'coop_analyse_milieux',
      'coop_role_il2',
      'coop_synthese_bac',
    ]);
    for (const q of b.questions) {
      expect(q.validationMode, q.id).toBe('keywords');
      expect(q.requiredKeywords?.length, q.id).toBeGreaterThanOrEqual(3);
      expect(q.errorHintAr, q.id).toBeTruthy();
    }
  });

  it('le comparatif humoral/cellulaire inclut le critère « transfert » (sérum vs cellules)', () => {
    const b = lecon.blocks[2];
    if (b.type !== 'COMPARISON_TABLE') throw new Error('bloc 3 inattendu');
    const transfert = b.criteria.find((c) => c.id === 'transfert');
    expect(transfert).toBeDefined();
    expect(transfert!.leftExpected.join(' ')).toContain('المصل');
    expect(transfert!.rightExpected.join(' ')).toContain('اللمفاويات');
  });
});

describe('Leçon coopération — câblage dans le parcours', () => {
  it('clôture la chaîne immunitaire : mémoire → coopération → fin', () => {
    expect(LESSON_PROGRESSION['immunity_memory_response']?.nextLessonId).toBe(CLE);
    expect(LESSON_PROGRESSION[CLE]?.nextLessonId).toBeUndefined();
    expect(LESSON_PROGRESSION[CLE]?.completionMessageAr).toBeTruthy();
  });

  it('dernière leçon affichée de l’unité 4, route + résumés en place', () => {
    const seq = getUnitLessonSequence(4);
    expect(seq[seq.length - 1]).toBe(CLE);
    expect(CONCEPT_ROUTES[CLE]?.unitId).toBe(4);
    expect(CONCEPT_ROUTES[CLE]?.lessonId).toBe(CLE);
    expect(CHAPITRES_ANCRAGE[CLE]).toEqual([21, 22]);
    expect(RESUMES_LECONS[CLE]?.points.length).toBe(6);
    expect(LESSON_GOLD_SUMMARIES[CLE]?.mechanismAr.length).toBe(6);
  });
});

describe('Carte mentale immunitaire — branche coopération', () => {
  const carte = MIND_MAPS_DATABASE[3];

  it('15 nœuds dont la chaîne CPA → synapse → IL2 → sélection clonale → effecteurs', () => {
    expect(carte.nodes).toHaveLength(15);
    const ids = new Set(carte.nodes.map((n) => n.id));
    for (const id of [
      'node-u3-cpa',
      'node-u3-immune-synapse',
      'node-u3-il2',
      'node-u3-clonal-selection',
      'node-u3-plasmocyte',
      'node-u3-ltc',
      'node-u3-memory',
    ]) {
      expect(ids, id).toContain(id);
    }
  });

  it('tous les liens pointent vers des nœuds existants (aucun lien mort)', () => {
    const ids = new Set(carte.nodes.map((n) => n.id));
    for (const l of carte.links) {
      expect(ids, `source ${String(l.source)}`).toContain(l.source as string);
      expect(ids, `target ${String(l.target)}`).toContain(l.target as string);
    }
  });

  it('chaque nouveau nœud a résumé, astuce BAC et mots-clés', () => {
    const nouveaux = carte.nodes.filter((n) =>
      ['node-u3-cpa', 'node-u3-il2', 'node-u3-clonal-selection', 'node-u3-memory'].includes(n.id),
    );
    expect(nouveaux).toHaveLength(4);
    for (const n of nouveaux) {
      expect(n.summary.length, n.id).toBeGreaterThan(40);
      expect(n.bacTip.length, n.id).toBeGreaterThan(30);
      expect(n.keywords.length, n.id).toBeGreaterThanOrEqual(3);
      expect(n.unitTitle).toBe('دور البروتينات في الدفاع عن الذات');
    }
  });
});
