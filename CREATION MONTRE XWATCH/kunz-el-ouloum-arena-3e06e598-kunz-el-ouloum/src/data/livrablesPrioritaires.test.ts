// livrablesPrioritaires.test.ts — l'audit initial a prescrit des livrables
// précis pour les cinq leçons prioritaires. Ce test vérifie qu'ils EXISTENT
// encore (sprint 54).
//
// Pourquoi ce fichier : 53 sprints séparent la demande initiale de l'état
// actuel. Un journal peut affirmer qu'une chose a été livrée ; seul un test
// peut affirmer qu'elle est toujours là. Chaque assertion cite le livrable
// demandé, et échoue si la pièce correspondante disparaît du code.

import { describe, expect, it } from 'vitest';
import { ACTIVE_LESSONS } from './activeLessons';
import { MICRO_CAPSULES } from './microCapsules';
import { SCHEMA_DRILLS } from './schemaDrills';
import { SITUATION_INDEX } from './situationIndex';
import { MIND_MAPS_DATABASE } from './mindMapData';
import { UNIT_OPENINGS } from './unitOpenings';
import { BAC_IDEAS } from './bacSessionIndex';

/**
 * Tous les identifiants d'étapes des leçons actives.
 *
 * Ils ne vivent pas au premier niveau : selon le type de bloc, ils sont dans
 * `choices[].id`, `steps[].id` ou plus profond. Plutôt que de suivre chaque
 * forme — et de casser au prochain type de bloc — on parcourt l'objet en
 * profondeur et on collecte toute propriété `id`.
 */
function étapes(): string[] {
  const vus: string[] = [];
  const parcourir = (valeur: unknown) => {
    if (Array.isArray(valeur)) {
      valeur.forEach(parcourir);
      return;
    }
    if (valeur && typeof valeur === 'object') {
      for (const [cle, v] of Object.entries(valeur as Record<string, unknown>)) {
        if (cle === 'id' && typeof v === 'string') vus.push(v);
        else parcourir(v);
      }
    }
  };
  parcourir(ACTIVE_LESSONS);
  return vus;
}

describe('leçon 1 — pHi et comportement des acides aminés (U2)', () => {
  it('garde le parcours pH → charge → migration', () => {
    const ids = étapes();
    for (const attendu of ['lire_ph', 'phi_deduire_charge', 'phi_analyse_migration', 'sens_migration']) {
      expect(ids, attendu).toContain(attendu);
    }
  });

  it('garde ses micro-fiches et son exercice officiel', () => {
    expect(MICRO_CAPSULES.filter((c) => c.unitId === 2).length).toBeGreaterThanOrEqual(3);
    // L'exercice 2018 sujet 1 : pHi par acide aminé, forme ionique, mutation.
    expect(BAC_IDEAS.some((i) => i.id === 'bac2018_s1_e2')).toBe(true);
  });
});

describe('leçon 2 — coopération immunitaire (U4)', () => {
  it('garde le parcours de coopération et sa synthèse BAC', () => {
    const ids = étapes();
    for (const attendu of ['coop_analyse_milieux', 'coop_role_il2', 'coop_synthese_bac']) {
      expect(ids, attendu).toContain(attendu);
    }
  });

  it('garde son schéma-bilan et ses exercices réels', () => {
    expect(SCHEMA_DRILLS.some((d) => d.unitId === 4)).toBe(true);
    const exercicesU4 = BAC_IDEAS.filter((i) => i.unitIds[0] === 4);
    expect(exercicesU4.length, 'exercices U4 du corpus').toBeGreaterThanOrEqual(3);
  });
});

describe('leçon 3 — inhibiteurs enzymatiques (U3)', () => {
  it('garde l’atelier des six courbes', () => {
    const ids = étapes();
    for (let n = 1; n <= 6; n += 1) {
      expect(ids.some((id) => id.startsWith(`atelier_courbe${n}`)), `courbe ${n}`).toBe(true);
    }
  });

  it('garde le comparatif compétitif / non compétitif', () => {
    const ids = étapes();
    expect(ids).toContain('inhib_identifier_type');
    expect(MICRO_CAPSULES.some((c) => c.id === 'cap_u3_inhibition_type')).toBe(true);
  });
});

describe('leçon 4 — CMH, ABO et prérequis de 2AS (U4)', () => {
  it('garde le module de prérequis', () => {
    const ids = étapes();
    expect(ids.some((id) => id.includes('haplotype') || id.includes('alleles'))).toBe(true);
    expect(UNIT_OPENINGS.some((o) => o.unitId === 4)).toBe(true);
  });

  it('garde la distinction CMH / ABO, source d’erreur documentée', () => {
    expect(MICRO_CAPSULES.some((c) => c.id === 'cap_u4_cmh_vs_abo')).toBe(true);
    expect(SITUATION_INDEX.some((s) => s.id === 'greffe_rein')).toBe(true);
  });
});

describe('leçon 5 — phase photochimique (U6)', () => {
  it('garde la synthèse d’unité et les CINQ micro-fiches demandées', () => {
    expect(UNIT_OPENINGS.some((o) => o.unitId === 6)).toBe(true);
    // L'audit initial en prescrivait cinq ; elles sont au complet depuis le
    // sprint 55. Ce nombre est la commande, pas une estimation.
    expect(MICRO_CAPSULES.filter((c) => c.unitId === 6).length).toBeGreaterThanOrEqual(5);
  });

  it('garde ses deux schémas : chaîne photochimique et bilan des deux phases', () => {
    const u6 = SCHEMA_DRILLS.filter((d) => d.unitId === 6).map((d) => d.id);
    expect(u6).toContain('drill_chaine_photochimique');
    expect(u6).toContain('drill_bilan_photosynthese');
  });
});

describe('socle commun aux cinq leçons', () => {
  it('garde une carte mentale par unité du programme', () => {
    const unites = new Set(Object.values(MIND_MAPS_DATABASE).map((m: { unitId: number }) => m.unitId));
    for (const u of [1, 2, 3, 4, 5, 6]) expect(unites.has(u), `carte U${u}`).toBe(true);
  });

  it('garde une carte d’ouverture par unité', () => {
    expect(UNIT_OPENINGS.length).toBeGreaterThanOrEqual(11);
  });
});
