// revisionPlan.rappels.lock.test.ts — VERROU H3 (audit 8 axes, novembre 2026).
//
// Constat d'audit : la répétition espacée (SM-2) vivait dans le deck de
// RevisionView mais le plan de révision ne la programmais JAMAIS — aucun kind
// « rappel », aucune importation de l'état SRS. Les échéances s'entassaient
// hors de la vue de l'élève : le plan donnait du neuf à apprendre sans jamais
// faire REVISER ce qui allait être oublié.
//
// Contrat verrouillé ici :
//   · le moteur reçoit la file des cartes DUES en paramètre (`rappels`) —
//     il reste PUR, aucune lecture cachée du stockage ;
//   · injection EN TÊTE de chaque journée, ≤ RAPPELS_PAR_JOUR (3), y compris
//     les jours de consolidation ;
//   · chaque carte une seule fois dans TOUT le plan ;
//   · leurs minutes comptent dans le budget (le chiffre promis reste honnête) ;
//   · sans `rappels` (ou file vide) : plan identique à l'ancien comportement ;
//   · `fileRappels` filtre les unités fermées (cohérence H1) et trie par
//     échéance croissante — la plus en retard passe en premier.

import { describe, expect, it } from 'vitest';
import {
  MINUTES_RAPPEL,
  RAPPELS_PAR_JOUR,
  buildRevisionPlan,
  fileRappels,
  type RappelDu,
} from './revisionPlan';

/** Fabrique une carte due, échéance il y a `retard` jours. */
function due(id: string, unitId: number, retardJours: number): RappelDu {
  return {
    id,
    unitId,
    question: `سؤال التجربة ${id} — نص طويل بما يكفي لتجربة الترقيم و القصّ على حدود الكلمات.`,
    dueAt: Date.now() - retardJours * 86_400_000,
  };
}

describe('plan de révision × rappels SRS (H3, audit 8 axes)', () => {
  it('chaque journée ouvre par SES rappels : ≤ 3, en tête, jamais au milieu', () => {
    const file = fileRappels(
      Array.from({ length: 30 }, (_, i) => due(`fc_test_${i}`, 1 + (i % 5), i)),
      [1, 2, 3, 4, 5],
    );
    const plan = buildRevisionPlan({ daysLeft: 10, minutesPerDay: 60, rappels: file });
    for (const j of plan.days) {
      const premiersRappels = j.tasks.findIndex((t) => t.kind !== 'rappel');
      const nRappels = j.tasks.filter((t) => t.kind === 'rappel').length;
      expect(nRappels, `journée ${j.day}`).toBeLessThanOrEqual(RAPPELS_PAR_JOUR);
      // Les rappels forment un PRÉFIXE : aucun rappel après une tâche d'un
      // autre geste — le jour commence par la mémoire, pas par le neuf.
      expect(
        j.tasks.slice(premiersRappels === -1 ? 0 : premiersRappels).some((t) => t.kind === 'rappel'),
        `journée ${j.day} : rappel après une tâche de rotation`,
      ).toBe(false);
    }
    // Une journée ordinaire (liste fournie assez longue) en a exactement 3.
    expect(plan.days[0].tasks.filter((t) => t.kind === 'rappel')).toHaveLength(RAPPELS_PAR_JOUR);
  });

  it('chaque carte apparaît UNE SEULE FOIS dans tout le plan', () => {
    const file = fileRappels(
      Array.from({ length: 40 }, (_, i) => due(`fc_test_${i}`, 1 + (i % 5), i)),
      [1, 2, 3, 4, 5],
    );
    const plan = buildRevisionPlan({ daysLeft: 10, minutesPerDay: 60, rappels: file });
    const ids = plan.days.flatMap((j) => j.tasks.filter((t) => t.kind === 'rappel').map((t) => t.refId));
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.length).toBe(30); // 10 jours × 3 — la file est assez longue
  });

  it('les minutes des rappels comptent dans le budget du jour', () => {
    const file = fileRappels(
      Array.from({ length: 6 }, (_, i) => due(`fc_test_${i}`, 1, i)),
      [1],
    );
    const plan = buildRevisionPlan({ daysLeft: 2, minutesPerDay: 60, rappels: file });
    const jour1 = plan.days[0];
    const minutesRappels = jour1.tasks
      .filter((t) => t.kind === 'rappel')
      .reduce((s, t) => s + t.minutes, 0);
    expect(minutesRappels).toBe(RAPPELS_PAR_JOUR * MINUTES_RAPPEL);
    expect(jour1.totalMinutes).toBeGreaterThanOrEqual(minutesRappels);
    // Cohérence globale : totalMinutes = somme des minutes de toutes les tâches.
    const somme = plan.days
      .flatMap((j) => j.tasks)
      .reduce((s, t) => s + t.minutes, 0);
    expect(plan.totalMinutes).toBe(somme);
  });

  it('les jours de consolidation reçoivent AUSSI leurs rappels', () => {
    const file = fileRappels(
      Array.from({ length: 12 }, (_, i) => due(`fc_test_${i}`, 1 + (i % 5), i)),
      [1, 2, 3, 4, 5],
    );
    const plan = buildRevisionPlan({ daysLeft: 4, minutesPerDay: 60, rappels: file });
    const consolidation = plan.days.filter((j) => j.consolidationOnly);
    expect(consolidation.length).toBeGreaterThan(0);
    for (const j of consolidation) {
      expect(
        j.tasks.filter((t) => t.kind === 'rappel').length,
        `consolidation journée ${j.day}`,
      ).toBe(RAPPELS_PAR_JOUR);
    }
  });

  it('sans `rappels` (ou file vide) : le plan est EXACTEMENT l’ancien', () => {
    const parDefaut = buildRevisionPlan({ daysLeft: 30, minutesPerDay: 90 });
    const vide = buildRevisionPlan({ daysLeft: 30, minutesPerDay: 90, rappels: [] });
    expect(JSON.stringify(vide)).toBe(JSON.stringify(parDefaut));
    // Pureté : mêmes options + même file ⇒ même plan (déterminisme intact).
    const file = fileRappels([due('fc_a', 1, 2), due('fc_b', 4, 1)], [1, 2, 3, 4, 5]);
    const une = buildRevisionPlan({ daysLeft: 30, minutesPerDay: 90, rappels: file });
    const deux = buildRevisionPlan({ daysLeft: 30, minutesPerDay: 90, rappels: file });
    expect(JSON.stringify(deux)).toBe(JSON.stringify(une));
  });

  it('fileRappels : unités fermées exclues, tri par échéance croissante, coût constant', () => {
    const file = fileRappels(
      [due('fc_u6', 6, 5), due('fc_u2_retard', 2, 9), due('fc_u1', 1, 3)],
      [1, 2, 3, 4, 5], // U6 fermée (invité) — cohérence H1
    );
    expect(file.map((t) => t.refId)).toEqual(['fc_u2_retard', 'fc_u1']);
    expect(file.every((t) => t.minutes === MINUTES_RAPPEL)).toBe(true);
    expect(file.every((t) => t.kind === 'rappel')).toBe(true);
    // Le tri : la carte la plus EN RETARD (dueAt le plus ancien) en premier.
    expect(file[0].refId).toBe('fc_u2_retard');
  });
});
