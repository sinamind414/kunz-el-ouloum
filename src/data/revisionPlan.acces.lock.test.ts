// revisionPlan.acces.lock.test.ts — VERROU H1 (audit 8 axes, novembre 2026).
//
// Constat d'audit : buildRevisionPlan ignorait l'accès réel — sur un plan
// 30 j/90 min, 1 112 min sur 2 688 (41 %) tombaient sur U6-U11 payantes, et
// la 1ʳᵉ unité recommandée était U6 (priorité 24,9) pour un élève qui ne peut
// même pas l'ouvrir. Le coach s'interrompait au milieu de sa propre consigne.
//
// Ce fichier verrouille le contrat réparé : le plan ne programme QUE ce que
// l'élève peut RÉELLEMENT ouvrir, mesuré côté vue par utils/acces
// (UNITES_GRATUITES = le المجال 1 = U1-U5 pour un invité ; les gestes
// « schéma/situation/rédaction/montage » vivent dans des rubriques payantes
// entières — SchemaDrillView l. 344, SituationBankView l. 472, BacIdeasView
// l. 574 — et dépendent donc de rubriquePayanteOuverte(), pas de l'unité).
//
// Le moteur reste PUR : l'accès arrive en paramètre (PlanAcces), jamais par
// une lecture cachée du stockage — la promesse « mêmes options ⇒ même plan »
// inclut donc l'accès dans les options.

import { describe, expect, it } from 'vitest';
import {
  GESTES_RUBRIQUE_PAYANTE,
  buildRevisionPlan,
  gestesOuverts,
  prioritizedUnitIds,
  unitPriority,
  type PlanAcces,
} from './revisionPlan';
import { UNITES_GRATUITES } from '../utils/acces';

/** Le palier invité/gratuit, exactement comme la vue le mesure (acces.ts). */
const ACCES_INVITE: PlanAcces = {
  unites: prioritizedUnitIds().filter((u) => UNITES_GRATUITES.includes(u)),
  gestes: gestesOuverts(false),
};

describe('plan de révision × accès réel (H1, audit 8 axes)', () => {
  it('l’invité ne reçoit AUCUNE unité payante, aucun geste de rubrique payante', () => {
    const plan = buildRevisionPlan({ daysLeft: 30, minutesPerDay: 90, acces: ACCES_INVITE });
    for (const j of plan.days) {
      for (const t of j.tasks) {
        expect(
          ACCES_INVITE.unites.includes(t.unitId),
          `tâche payante dans un plan invité : ${t.kind}:${t.refId} (unité ${t.unitId})`,
        ).toBe(true);
        expect(
          GESTES_RUBRIQUE_PAYANTE.includes(t.kind),
          `geste de rubrique payante : ${t.kind}:${t.refId}`,
        ).toBe(false);
      }
      expect(j.tasks.length, `journée ${j.day} vide`).toBeGreaterThan(0);
    }
  });

  it('la 1ʳᵉ tâche du plan invité vient de la plus prioritaire des unités OUVERTES — plus jamais U6', () => {
    // Mesure directe de la rupture d'audit : la séquence pondérée met en tête
    // la cour du jour 1 l'unité à priorité maximale ; pour un invité, cette
    // tête est une unité du المجال 1 (la taillée U6 = 24,9 a quitté la cour).
    const ouvertes = prioritizedUnitIds().filter((u) => UNITES_GRATUITES.includes(u));
    const premiereAttendue = [...ouvertes].sort(
      (a: number, b: number) => unitPriority(b) - unitPriority(a) || a - b,
    )[0];
    expect(premiereAttendue).toBeLessThan(6);
    const plan = buildRevisionPlan({ daysLeft: 30, minutesPerDay: 90, acces: ACCES_INVITE });
    expect(plan.days[0].tasks[0].unitId, 'tête du plan invité').toBe(premiereAttendue);
    expect(plan.coveredUnitIds).not.toContain(6);
  });

  it('un abonné reçoit EXACTEMENT le plan par défaut (l’accès complet ne change rien)', () => {
    const parDefaut = buildRevisionPlan({ daysLeft: 30, minutesPerDay: 90 });
    const abonne: PlanAcces = {
      unites: prioritizedUnitIds(),
      gestes: gestesOuverts(true),
    };
    const avecAcces = buildRevisionPlan({ daysLeft: 30, minutesPerDay: 90, acces: abonne });
    expect(JSON.stringify(avecAcces)).toBe(JSON.stringify(parDefaut));
  });

  it('le chiffre de l’audit est mort : 0 minute payante dans un plan invité de 30 jours', () => {
    const plan = buildRevisionPlan({ daysLeft: 30, minutesPerDay: 90, acces: ACCES_INVITE });
    const minutesPayantes = plan.days
      .flatMap((j) => j.tasks)
      .filter((t) => !UNITES_GRATUITES.includes(t.unitId) || GESTES_RUBRIQUE_PAYANTE.includes(t.kind))
      .reduce((s, t) => s + t.minutes, 0);
    expect(minutesPayantes).toBe(0);
  });

  it('GESTES_RUBRIQUE_PAYANTE : la mesure d’audit reste vraie (schémas, situations, rédaction, montage)', () => {
    expect([...GESTES_RUBRIQUE_PAYANTE].sort()).toEqual(
      ['montage', 'redaction', 'schema', 'situation'],
    );
    // Capsule et carte vivent dans des vues gated par UNITÉ (RevisionView l. 149,
    // MindMapView l. 77) — elles ne font PAS partie des gestes payants.
    expect(GESTES_RUBRIQUE_PAYANTE).not.toContain('capsule');
    expect(GESTES_RUBRIQUE_PAYANTE).not.toContain('carte');
  });
});
