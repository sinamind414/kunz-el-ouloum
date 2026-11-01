// contentReachability.test.ts — AUCUN contenu produit ne doit rester
// inatteignable par l'élève (sprint 21).
//
// Origine de ce fichier : le sprint 20 a découvert que le moteur du plan
// repoussait la même ressource plusieurs fois par tour, rendant inatteignables
// les 2e et 3e ressources d'une unité chargée. L'audit qui a suivi a trouvé
// pire : les 19 exercices « élite » d'analyse documentaire n'étaient importés
// par AUCUN composant — du contenu écrit, testé, et jamais montré.
//
// Ces tests ferment la porte : chaque banque doit être atteignable par au
// moins un chemin réel, et chaque élément doit être atteint par ce chemin.

import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import {
  SITUATION_INDEX,
  analysisExercisesForSituation,
  practiceContextsForSituation,
} from './situationIndex';
import { DOCUMENT_ANALYSIS_EXERCISES } from './documentAnalysisExercises';
import { DOCUMENT_PRACTICE_CONTEXTS } from './documentPracticeContexts';
import { MICRO_CAPSULES } from './microCapsules';
import { SCHEMA_DRILLS } from './schemaDrills';
import { BAC_ARCHETYPES } from './bacArchetypes';
import { BAC_IDEAS, bacEchoForCapsule, bacEchoForDrill } from './bacSessionIndex';
import { buildRevisionPlan } from './revisionPlan';
import { SVT_QUIZ_QUESTIONS } from '../data';
import { INITIAL_UNITS } from '../unitCatalog';
import { VERB_FAMILIES, classifyVerb } from './verbDemands';

const SRC = join(process.cwd(), 'src');

function fichiersSources(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const chemin = join(dir, e.name);
    if (e.isDirectory()) return fichiersSources(chemin);
    if (!/\.(ts|tsx)$/.test(e.name)) return [];
    if (/\.test\.tsx?$/.test(e.name)) return [];
    return [chemin];
  });
}

const COMPOSANTS = fichiersSources(join(SRC, 'components')).map((f) => readFileSync(f, 'utf8'));

function importeParUnComposant(motif: RegExp): boolean {
  return COMPOSANTS.some((contenu) => motif.test(contenu));
}

describe('atteignabilité — chaque banque a un chemin vers l’écran', () => {
  it('les contextes documentaires sont rendus par la banque de situations', () => {
    expect(importeParUnComposant(/practiceContextsForSituation/)).toBe(true);
  });

  it('les exercices « élite » sont rendus, et plus seulement importés pour validation', () => {
    expect(importeParUnComposant(/analysisExercisesForSituation/)).toBe(true);
  });

  it('capsules, schémas et montages ont chacun un écran', () => {
    expect(importeParUnComposant(/microCapsules|MICRO_CAPSULES/)).toBe(true);
    expect(importeParUnComposant(/schemaDrills|SCHEMA_DRILLS/)).toBe(true);
    expect(importeParUnComposant(/bacArchetypes|archetypeRecurrence/)).toBe(true);
  });
});

describe('atteignabilité — chaque élément est réellement atteint', () => {
  it('les 53 contextes documentaires sont cités par au moins une situation', () => {
    const rendus = new Set(
      SITUATION_INDEX.flatMap((s) => practiceContextsForSituation(s.id)).map(
        (c) => `${c.exerciseId}:${c.questionId}`,
      ),
    );
    for (const c of DOCUMENT_PRACTICE_CONTEXTS) {
      expect(rendus.has(`${c.exerciseId}:${c.questionId}`), c.exerciseId).toBe(true);
    }
  });

  it('les exercices « élite » sont tous rattachés à une situation, sans orphelin', () => {
    const rendus = new Set(
      SITUATION_INDEX.flatMap((s) => analysisExercisesForSituation(s.id)).map((e) => e.id),
    );
    const orphelins = DOCUMENT_ANALYSIS_EXERCISES.filter((e) => !rendus.has(e.id)).map((e) => e.id);
    expect(orphelins).toEqual([]);
  });

  it('le plan d’un mois atteint toutes les capsules, tous les schémas et tous les montages', () => {
    const plan = buildRevisionPlan({ daysLeft: 30, minutesPerDay: 120 });
    const vues = new Set(plan.days.flatMap((j) => j.tasks).map((t) => `${t.kind}:${t.refId}`));
    const manquants: string[] = [];
    for (const c of MICRO_CAPSULES) if (!vues.has(`capsule:${c.id}`)) manquants.push(`capsule:${c.id}`);
    for (const d of SCHEMA_DRILLS) if (!vues.has(`schema:${d.id}`)) manquants.push(`schema:${d.id}`);
    for (const a of BAC_ARCHETYPES) if (!vues.has(`montage:${a.id}`)) manquants.push(`montage:${a.id}`);
    expect(manquants).toEqual([]);
  });

  it('chaque idée BAC ouvre au moins une porte vers une ressource atteignable', () => {
    const situations = new Set(SITUATION_INDEX.map((s) => s.id));
    for (const idea of BAC_IDEAS) {
      const portes = [
        ...idea.situationIds.filter((id) => situations.has(id)),
        ...idea.capsuleIds,
        ...idea.drillIds,
      ];
      expect(portes.length, idea.id).toBeGreaterThan(0);
    }
  });
});

describe('atteignabilité — les 549 QCM et les familles de consignes', () => {
  it('rattache chaque QCM à une unité réellement présente dans le catalogue', () => {
    const unites = new Set(INITIAL_UNITS.map((u) => u.id));
    for (const q of SVT_QUIZ_QUESTIONS) {
      expect(unites.has(q.unitId), `QCM ${q.id}`).toBe(true);
    }
  });

  it('laisse chaque unité du programme avec de quoi réviser', () => {
    for (const u of INITIAL_UNITS) {
      const n = SVT_QUIZ_QUESTIONS.filter((q) => q.unitId === u.id).length;
      expect(n, `unité ${u.id}`).toBeGreaterThan(0);
    }
  });

  it('n’a aucun identifiant de QCM en double (un doublon masque une question)', () => {
    const ids = SVT_QUIZ_QUESTIONS.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('rend les familles de consignes depuis un écran', () => {
    expect(importeParUnComposant(/verbDemands|verbFamilyStats/)).toBe(true);
    for (const f of VERB_FAMILIES) expect(classifyVerb(f.titleAr.split(' / ')[0])).toBeTruthy();
  });
});

describe('atteignabilité — les échos BAC sont montrés, pas seulement calculés', () => {
  it('branche l’écho des situations, des capsules ET des schémas sur un écran', () => {
    // Sprint 35 : `bacEchoForCapsule` et `bacEchoForDrill` existaient depuis le
    // sprint 18 sans aucun consommateur — du code exact, testé, et invisible.
    expect(importeParUnComposant(/bacEchoForSituation/)).toBe(true);
    expect(importeParUnComposant(/bacEchoForCapsule/)).toBe(true);
    expect(importeParUnComposant(/bacEchoForDrill/)).toBe(true);
  });

  it('a réellement de quoi afficher : des capsules et des schémas avec écho', () => {
    const capsules = MICRO_CAPSULES.filter((c) => bacEchoForCapsule(c.id).years.length > 0);
    const schemas = SCHEMA_DRILLS.filter((d) => bacEchoForDrill(d.id).years.length > 0);
    expect(capsules.length).toBeGreaterThan(10);
    expect(schemas.length).toBeGreaterThan(8);
  });
});
