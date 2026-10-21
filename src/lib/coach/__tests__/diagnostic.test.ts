// diagnostic.test.ts — verrous du COACH (2026-10-12).
//
// Ce que le coach DOIT faire : dire à l'élève où il en est (fort / moyen /
// faible / non commencé) et lui prescrire UNE action concrète. Ce qu'il ne doit
// JAMAIS faire : inventer une note, ni déclarer « forte » une unité dont la
// lecture seule est faite.

import { afterEach, describe, expect, it } from 'vitest';
import { PARCOURS_DOMAINS, PARCOURS_FLAT } from '../../parcours/parcoursPath';
import { etatParDefaut, type ParcoursState } from '../../parcours/parcoursProgress';
import {
  diagnostiquerParcours,
  diagnostiquerUnite,
  classerParUrgence,
  ligneCoach,
} from '../diagnostic';

afterEach(() => localStorage.clear());

function unite(n: number) {
  for (const d of PARCOURS_DOMAINS) {
    const u = d.units.find((x) => x.unitId === n);
    if (u) return u;
  }
  throw new Error(`unité ${n} introuvable`);
}

/** Marque les items `ids` comme faits dans un état neuf. */
function etatAvec(ids: string[], opts: { score?: number; fragile?: boolean } = {}): ParcoursState {
  const st = etatParDefaut();
  for (const id of ids) {
    st.done[id] = { at: '2026-10-12', fragile: opts.fragile ?? false, ...(opts.score !== undefined ? { score: opts.score, total: 10 } : {}) };
  }
  return st;
}

describe('coach — verdict par unité', () => {
  it('unité jamais entamée → non commencé + action « commencer »', () => {
    const u = unite(1);
    const d = diagnostiquerUnite(u, u.items, etatParDefaut());
    expect(d.verdict).toBe('non_commence');
    expect(d.score).toBeNull();
    expect(d.action.type).toBe('commencer');
    expect(d.restants).toBe(u.items.length);
  });

  it('leçons lues mais جسر non passé → MOYEN, jamais fort', () => {
    // La lecture n'est pas la preuve : sans le جسر, pas de « niveau fort ».
    const u = unite(1);
    const lecons = u.items.filter((i) => i.kind === 'lesson');
    const d = diagnostiquerUnite(u, u.items, etatAvec(lecons.map((i) => i.id)));
    expect(d.leconsFaites).toBe(lecons.length);
    expect(d.score).toBeNull();
    expect(d.verdict).toBe('moyen');
  });

  it('جسر réussi haut et sans fragilité → fort', () => {
    const u = unite(1);
    const jalon = u.items.find((i) => i.kind === 'jalon')!;
    const lecons = u.items.filter((i) => i.kind === 'lesson');
    const d = diagnostiquerUnite(
      u,
      u.items,
      etatAvec([...lecons.map((i) => i.id), jalon.id], { score: 0.85 }),
    );
    expect(d.verdict).toBe('fort');
    expect(d.score).toBeCloseTo(0.85);
    expect(d.action.type).toBe('maintenir');
  });

  it('جسر échoué (< 0.6) → faible + action « relire puis retenter »', () => {
    const u = unite(1);
    const jalon = u.items.find((i) => i.kind === 'jalon')!;
    const lecons = u.items.filter((i) => i.kind === 'lesson');
    const d = diagnostiquerUnite(
      u,
      u.items,
      etatAvec([...lecons.map((i) => i.id), jalon.id], { score: 0.4 }),
    );
    expect(d.verdict).toBe('faible');
    expect(d.action.type).toBe('reviser_cours');
    expect(d.action.libelleAr).toContain('أعد');
  });

  it('score haut MAIS item fragile → plafonné à moyen, jamais « fort »', () => {
    // Un 0.9 avec un élément fragile veut dire : vous maîtrisez l ensemble, mais
    // un point précis vous échappe. Le coach doit le dire, pas couronner.
    const u = unite(1);
    const jalon = u.items.find((i) => i.kind === 'jalon')!;
    const lecons = u.items.filter((i) => i.kind === 'lesson');

    // Seul le جalon est fragile : les leçons ont simplement été lues.
    const st = etatParDefaut();
    for (const l of lecons) st.done[l.id] = { at: '2026-10-12', fragile: false };
    st.done[jalon.id] = { at: '2026-10-12', score: 0.9, total: 10, fragile: true };

    const d = diagnostiquerUnite(u, u.items, st);
    expect(d.verdict).toBe('moyen');
    expect(d.verdict).not.toBe('fort');
    expect(d.fragiles).toBe(1);
  });

  it('score dans la zone médiane → moyen', () => {
    const u = unite(1);
    const jalon = u.items.find((i) => i.kind === 'jalon')!;
    const d = diagnostiquerUnite(u, u.items, etatAvec([jalon.id], { score: 0.7 }));
    expect(d.verdict).toBe('moyen');
  });
});

describe('coach — ce que l élève lit', () => {
  it('la ligne porte le verdict ET la prescription, en arabe', () => {
    const u = unite(1);
    const jalon = u.items.find((i) => i.kind === 'jalon')!;
    const lecons = u.items.filter((i) => i.kind === 'lesson');
    const d = diagnostiquerUnite(
      u,
      u.items,
      etatAvec([...lecons.map((i) => i.id), jalon.id], { score: 0.3 }),
    );
    const ligne = ligneCoach(d);
    expect(ligne).toContain('مستوى ضعيف');
    expect(ligne).toContain(u.title);
    expect(ligne).toContain('➡️');
    expect(d.score).toBe(0.3);
  });

  it('aucun mélange arabe / français dans les messages', () => {
    // Règle du projet : arabe فصحى uniquement.
    const u = unite(1);
    for (const score of [0.3, 0.7, 0.9]) {
      const jalon = u.items.find((i) => i.kind === 'jalon')!;
      const lecons = u.items.filter((i) => i.kind === 'lesson');
      const d = diagnostiquerUnite(
        u,
        u.items,
        etatAvec([...lecons.map((i) => i.id), jalon.id], { score }),
      );
      expect(ligneCoach(d), `score ${score}`).not.toMatch(/[A-Za-z]{3,}/);
    }
  });
});

describe('coach — ordre de travail', () => {
  it('les unités faibles passent avant les fortes', () => {
    const u1 = unite(1);
    const u2 = unite(2);
    const jalon1 = u1.items.find((i) => i.kind === 'jalon')!;
    const lecons2 = u2.items.filter((i) => i.kind === 'lesson');
    const jalon2 = u2.items.find((i) => i.kind === 'jalon')!;

    const st = etatParDefaut();
    st.done[jalon1.id] = { at: '2026-10-12', score: 0.2, total: 10, fragile: false };
    st.done[jalon2.id] = { at: '2026-10-12', score: 0.95, total: 10, fragile: false };
    for (const l of lecons2) st.done[l.id] = { at: '2026-10-12', fragile: false };

    const classe = classerParUrgence(diagnostiquerParcours([u1, u2], st));
    expect(classe[0].unitId).toBe(1);
    expect(classe[0].verdict).toBe('faible');
    expect(classe[1].unitId).toBe(2);
    expect(classe[1].verdict).toBe('fort');
  });

  it('une unité non commencée passe après une unité déjà entamée', () => {
    const u1 = unite(1);
    const u2 = unite(2);
    const jalon1 = u1.items.find((i) => i.kind === 'jalon')!;
    const st = etatParDefaut();
    st.done[jalon1.id] = { at: '2026-10-12', score: 0.7, total: 10, fragile: false };

    const classe = classerParUrgence(diagnostiquerParcours([u1, u2], st));
    expect(classe[0].unitId).toBe(1); // entamée d'abord
    expect(classe[1].verdict).toBe('non_commence');
  });

  it('le parcours complet se Diagnostique sans erreur', () => {
    const groupes = PARCOURS_DOMAINS.flatMap((d) => d.units);
    const diags = diagnostiquerParcours(groupes, etatParDefaut());
    expect(diags).toHaveLength(groupes.length);
    for (const d of diags) expect(d.verdict).toBe('non_commence');
    // TC6 : 72 leçons (60 + 12 orphelines câblées) + 11 jalons = 83 items ;
    // H2 (2026-10-21) : +2 leçons actives U11 (wilson, ophiolites) = 85.
    expect(PARCOURS_FLAT).toHaveLength(85);
  });
});
