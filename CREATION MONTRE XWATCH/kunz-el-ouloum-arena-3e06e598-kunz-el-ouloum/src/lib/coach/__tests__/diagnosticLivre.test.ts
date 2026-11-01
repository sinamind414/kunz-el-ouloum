// diagnosticLivre.test.ts — audit Capitaine 2026-10-17 (§2, P0) :
// « distinguer absent de maîtrisé ». Avant : une unité dont toutes les leçons
// sont lues et dont le QCM du livre est réussi restait « حصيلة الوحدة: — »
// (absence traitée comme ignorance). Après : le score RÉEL de اختبار الكتاب
// (source mesurée, écrite par App) alimente le diagnostic quand le جسر
// n'a pas encore produit de note — sans jamais recouvrir un score de جسر
// existant, et sans noter une unité avec < 3 questions (U9 n'a qu'UNE question
// : ce ne serait pas une mesure, ce serait un jet de dés).
import { afterEach, describe, expect, it } from 'vitest';
import { PARCOURS_DOMAINS } from '../../parcours/parcoursPath';
import { etatParDefaut, type ParcoursState } from '../../parcours/parcoursProgress';
import { diagnostiquerUnite, ligneCoach } from '../diagnostic';

afterEach(() => localStorage.clear());

function unite(n: number) {
  for (const d of PARCOURS_DOMAINS) {
    const u = d.units.find((x) => x.unitId === n);
    if (u) return u;
  }
  throw new Error(`unité ${n} introuvable`);
}

function etatLeconsLues(u: ReturnType<typeof unite>): ParcoursState {
  const st = etatParDefaut();
  for (const l of u.items.filter((i) => i.kind === 'lesson')) {
    st.done[l.id] = { at: '2026-10-17', fragile: false };
  }
  return st;
}

describe('diagnostic : le score réel du livre distingue absent de maîtrisé', () => {
  it('leçons lues + livre réussi (≥3 q) → score mesuré 0,9, verdict fort', () => {
    const u = unite(1);
    const d = diagnostiquerUnite(u, u.items, etatLeconsLues(u), {
      scoreLivre: { score: 9, total: 10 },
    });
    expect(d.score).toBeCloseTo(0.9);
    expect(d.verdict).toBe('fort');
    // L'élève doit savoir D'OÙ vient la mesure.
    expect(ligneCoach(d)).toContain('اختبار الكتاب');
  });

  it('livre avec moins de 3 questions → PAS une mesure (U9 : 1 seule q)', () => {
    const u = unite(1);
    const d = diagnostiquerUnite(u, u.items, etatLeconsLues(u), {
      scoreLivre: { score: 1, total: 1 },
    });
    expect(d.score).toBeNull();
    expect(d.verdict).toBe('moyen'); // leçons lues, rien de mesuré
    expect(ligneCoach(d)).not.toContain('اختبار الكتاب');
  });

  it('جسر existant PRÉCÈDE toujours le livre (décision 2026-10-02 intacte)', () => {
    const u = unite(1);
    const st = etatLeconsLues(u);
    const jalon = u.items.find((i) => i.kind === 'jalon')!;
    st.done[jalon.id] = { at: '2026-10-17', fragile: false, score: 0.4, total: 10 };
    const d = diagnostiquerUnite(u, u.items, st, {
      scoreLivre: { score: 10, total: 10 },
    });
    expect(d.score).toBeCloseTo(0.4);
    expect(d.verdict).toBe('faible');
    expect(ligneCoach(d)).toContain('اختبار الحصيلة');
  });

  it('sans option scoreLivre → comportement historique inchangé', () => {
    const u = unite(1);
    const d = diagnostiquerUnite(u, u.items, etatLeconsLues(u));
    expect(d.score).toBeNull();
    expect(d.verdict).toBe('moyen');
    expect(ligneCoach(d)).not.toContain('اختبار الكتاب');
  });

  it('livre réussi + leçons non lues →plafonné à moyen, prescription « finis le cours »', () => {
    // Une note de livre (mesure réelle) sort l'unité de « non_commence » MAIS
    // اختبار الكتاب ne remplace pas le cours : jamais « fort » sans leçons.
    const u = unite(1);
    const st = etatParDefaut();
    const d = diagnostiquerUnite(u, u.items, st, { scoreLivre: { score: 9, total: 10 } });
    expect(d.score).toBeCloseTo(0.9);
    expect(d.verdict).toBe('moyen');
    expect(d.action.type).toBe('reviser_cours');
    expect(d.action.libelleAr).toContain('أعِد');
  });
});
