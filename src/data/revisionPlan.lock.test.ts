// revisionPlan.lock.test.ts — verrous du plan de révision (item 14, sprint 15).
//
// Un planificateur est dangereux : il a l'air sérieux même quand il se trompe.
// Ces tests vérifient donc qu'il tient ses quatre règles annoncées, qu'il ne
// programme jamais une ressource inexistante, et qu'il reste honnête dans les
// cas limites (1 jour, 20 minutes, 60 jours).

import { describe, expect, it } from 'vitest';
import {
  buildRevisionPlan,
  minutesByUnit,
  prioritizedUnitIds,
  unitPriority,
  unitWeight,
  declaredWeight,
  observedWeight,
  PRESETS,
  TASK_LABEL_AR,
} from './revisionPlan';
import { CAPSULE_BY_ID } from './microCapsules';
import { SCHEMA_DRILL_BY_ID } from './schemaDrills';
import { SITUATION_BY_ID } from './situationIndex';
import { MIND_MAPS_DATABASE } from './mindMapData';

describe('plan — aucune ressource fantôme', () => {
  it('chaque tâche pointe vers une ressource réellement existante', () => {
    const plan = buildRevisionPlan({ daysLeft: 30, minutesPerDay: 90 });
    for (const jour of plan.days) {
      for (const t of jour.tasks) {
        if (t.kind === 'capsule') expect(CAPSULE_BY_ID[t.refId], t.refId).toBeDefined();
        if (t.kind === 'schema') expect(SCHEMA_DRILL_BY_ID[t.refId], t.refId).toBeDefined();
        if (t.kind === 'situation') expect(SITUATION_BY_ID[t.refId], t.refId).toBeDefined();
        if (t.kind === 'carte') expect(MIND_MAPS_DATABASE[Number(t.refId)], t.refId).toBeDefined();
      }
    }
  });

  it('l unité annoncée par la tâche est celle de la ressource', () => {
    const plan = buildRevisionPlan({ daysLeft: 21, minutesPerDay: 90 });
    for (const jour of plan.days) {
      for (const t of jour.tasks) {
        if (t.kind === 'capsule') expect(CAPSULE_BY_ID[t.refId].unitId).toBe(t.unitId);
        if (t.kind === 'schema') expect(SCHEMA_DRILL_BY_ID[t.refId].unitId).toBe(t.unitId);
        if (t.kind === 'carte') expect(MIND_MAPS_DATABASE[Number(t.refId)].unitId).toBe(t.unitId);
        if (t.kind === 'situation') expect(SITUATION_BY_ID[t.refId].unitIds[0]).toBe(t.unitId);
      }
    }
  });

  it('chaque tâche porte une action concrète et une durée plausible', () => {
    const plan = buildRevisionPlan({ daysLeft: 10, minutesPerDay: 60 });
    for (const jour of plan.days) {
      for (const t of jour.tasks) {
        expect(t.actionAr.length, t.refId).toBeGreaterThanOrEqual(25);
        expect(t.minutes, t.refId).toBeGreaterThanOrEqual(2);
        expect(t.minutes, t.refId).toBeLessThanOrEqual(35);
        expect(Object.keys(TASK_LABEL_AR)).toContain(t.kind);
      }
    }
  });
});

describe('plan — règle 1 et 2 : poids d examen puis difficulté observée', () => {
  it('le poids retenu est la moyenne de l annoncé et du constaté (sprint 18)', () => {
    for (const u of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]) {
      expect(unitWeight(u)).toBeCloseTo((declaredWeight(u) + observedWeight(u)) / 2, 5);
    }
    // U6 : 20 % annoncés par le programme, mais nettement moins constatés sur
    // les sessions dépouillées — le plan ne suit ni l'un ni l'autre seul.
    expect(declaredWeight(6)).toBe(20);
    expect(observedWeight(6)).toBeLessThan(declaredWeight(6));
    expect(unitWeight(6)).toBeLessThan(declaredWeight(6));
    expect(unitWeight(6)).toBeGreaterThan(observedWeight(6));
  });

  it('corrige le poids annoncé là où l examen dit le contraire', () => {
    // U1 est sous-évaluée par le programme et sur-représentée à l'examen.
    expect(observedWeight(1)).toBeGreaterThan(declaredWeight(1));
    expect(unitWeight(1)).toBeGreaterThan(declaredWeight(1));
    // U4 aussi : c'est l'unité qui pèse le plus de points en tête d'exercice.
    expect(observedWeight(4)).toBeGreaterThan(declaredWeight(4));
  });

  it('la priorité combine le poids d examen et le bonus de difficulté', () => {
    expect(unitPriority(6)).toBeGreaterThan(unitPriority(1));
    expect(unitPriority(4)).toBeGreaterThan(unitPriority(10));
  });

  it('les unités du domaine 3 gardent un poids plancher, jamais zéro', () => {
    for (const u of [8, 9, 10, 11]) {
      expect(declaredWeight(u)).toBe(5);
      expect(unitWeight(u)).toBeGreaterThan(0);
    }
  });

  it('l ordre de priorité place U6, U5 et U4 dans les quatre premières', () => {
    const tete = prioritizedUnitIds().slice(0, 4);
    expect(tete).toContain(6);
    expect(tete).toContain(5);
    expect(tete).toContain(4);
  });

  it('sur un plan long, les unités lourdes reçoivent plus de temps que les légères', () => {
    const parUnite = minutesByUnit(buildRevisionPlan({ daysLeft: 30, minutesPerDay: 90 }));
    expect(parUnite[6] ?? 0).toBeGreaterThan(parUnite[10] ?? 0);
    expect(parUnite[4] ?? 0).toBeGreaterThan(parUnite[8] ?? 0);
  });
});

describe('plan — règle 3 : alternance des gestes', () => {
  it('une journée normale de 90 minutes mobilise au moins trois types de tâches', () => {
    const plan = buildRevisionPlan({ daysLeft: 14, minutesPerDay: 90 });
    const premiere = plan.days[0];
    expect(new Set(premiere.tasks.map((t) => t.kind)).size).toBeGreaterThanOrEqual(3);
  });

  it('aucune journée ne répète deux fois la même ressource', () => {
    const plan = buildRevisionPlan({ daysLeft: 30, minutesPerDay: 120 });
    for (const jour of plan.days) {
      const cles = jour.tasks.map((t) => `${t.kind}:${t.refId}`);
      expect(new Set(cles).size, `jour ${jour.day}`).toBe(cles.length);
    }
  });
});

describe('plan — règle 4 : les deux derniers jours consolident', () => {
  it('les jours J-1 et J-0 ne contiennent aucune situation longue', () => {
    const plan = buildRevisionPlan({ daysLeft: 10, minutesPerDay: 90 });
    const derniers = plan.days.filter((j) => j.consolidationOnly);
    expect(derniers.length).toBeGreaterThanOrEqual(1);
    for (const j of derniers) {
      expect(j.tasks.every((t) => t.kind !== 'situation'), `jour ${j.day}`).toBe(true);
    }
  });

  it('un plan très court (1 à 3 jours) reste un plan de travail complet', () => {
    const plan = buildRevisionPlan({ daysLeft: 3, minutesPerDay: 120 });
    expect(plan.days).toHaveLength(3);
    for (const j of plan.days) expect(j.tasks.length).toBeGreaterThan(0);
  });
});

describe('plan — budget et bornes', () => {
  it('le temps d une journée ne dépasse pas le budget demandé', () => {
    for (const budget of [20, 45, 60, 120, 240]) {
      const plan = buildRevisionPlan({ daysLeft: 7, minutesPerDay: budget });
      for (const j of plan.days) {
        // seule exception admise : une journée d'une seule tâche plus longue
        // que le budget, pour ne jamais rendre une journée vide.
        if (j.tasks.length > 1) expect(j.totalMinutes, `budget ${budget}`).toBeLessThanOrEqual(budget);
        expect(j.tasks.length).toBeGreaterThan(0);
      }
    }
  });

  it('les bornes extrêmes sont ramenées dans le domaine utile', () => {
    expect(buildRevisionPlan({ daysLeft: 0, minutesPerDay: 60 }).days).toHaveLength(1);
    expect(buildRevisionPlan({ daysLeft: 500, minutesPerDay: 60 }).days).toHaveLength(60);
    const maigre = buildRevisionPlan({ daysLeft: 5, minutesPerDay: 1 });
    for (const j of maigre.days) expect(j.tasks.length).toBeGreaterThan(0);
  });

  it('un plan d un mois couvre les 11 unités du programme', () => {
    const plan = buildRevisionPlan({ daysLeft: 30, minutesPerDay: 90 });
    expect(plan.coveredUnitIds).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
  });

  it('un plan de 3 jours ne prétend pas tout couvrir : il concentre sur les priorités', () => {
    const plan = buildRevisionPlan({ daysLeft: 3, minutesPerDay: 60 });
    expect(plan.coveredUnitIds.length).toBeLessThan(11);
    expect(plan.coveredUnitIds).toContain(6);
  });
});

describe('plan — déterminisme et préréglages', () => {
  it('mêmes options ⇒ plan identique (l élève retrouve sa journée)', () => {
    const a = buildRevisionPlan({ daysLeft: 14, minutesPerDay: 90 });
    const b = buildRevisionPlan({ daysLeft: 14, minutesPerDay: 90 });
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });

  it('les quatre préréglages produisent des plans exploitables', () => {
    for (const p of PRESETS) {
      const plan = buildRevisionPlan(p);
      expect(plan.days, p.labelAr).toHaveLength(p.daysLeft);
      expect(plan.totalTasks, p.labelAr).toBeGreaterThan(p.daysLeft);
      expect(plan.totalMinutes, p.labelAr).toBeGreaterThan(0);
    }
  });
});
