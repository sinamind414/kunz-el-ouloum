// bilanSrs.test.ts — verrou du bilan du deck SM-2 (audit coach 2026-11-06,
// reco 3 — lot 🔴). Le panneau ne peut PAS mentir : quatre états exclusifs et
// exhaustifs, aucune carte oubliée, aucune carte comptée deux fois. Une absence
// d'état n'est JAMAIS une échéance — le défaut d'origine (« toute carte non
// vue serait due ») est ce verrou précisément.

import { describe, expect, it } from 'vitest';
import type { SrsCardState } from '../flashcardsSrs';
import {
  bilanSrsDesCartes,
  bilanSrsParUnite,
  BILAN_SRS_VIDE,
  cartesParProchaineEcheance,
} from '../bilanSrs';

const JOUR = 86_400_000;
const MAINTENANT = 1_700_000_000_000;

const etat = (dueAt: number): SrsCardState => ({
  ease: 2.5,
  intervalDays: 1,
  dueAt,
  reps: 1,
  lapses: 0,
});

const etats = (parId: Record<string, number>): Record<string, SrsCardState> =>
  Object.fromEntries(Object.entries(parId).map(([id, d]) => [id, etat(d)]));

describe('bilanSrsDesCartes — quatre états exclusifs et exhaustifs', () => {
  it('le vrai classement : échu / programmée / consolidée / jamais évaluée', () => {
    const cartes = [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }];
    const bilan = bilanSrsDesCartes(
      cartes,
      { a: etat(MAINTENANT - 1), b: etat(MAINTENANT + 3 * JOUR), c: etat(0) },
      MAINTENANT,
    );
    expect(bilan).toEqual({
      jamaisEvaluees: 1,
      echeues: 1,
      programmees: 1,
      consolidees: 1,
    });
  });

  it('deck vide → bilan vide (aucun chiffre inventé)', () => {
    expect(bilanSrsDesCartes([], {}, MAINTENANT)).toEqual(BILAN_SRS_VIDE);
  });

  it('dueAt EXACTEMENT égale à maintenant = échéance atteinte', () => {
    const bilan = bilanSrsDesCartes([{ id: 'a' }], { a: etat(MAINTENANT) }, MAINTENANT);
    expect(bilan.echeues).toBe(1);
    expect(bilan.programmees).toBe(0);
  });
});

describe('bilanSrsParUnite — agrégation par unité', () => {
  it('ne crée pas de clé pour les unités absentes', () => {
    const cartes = [
      { id: 'a', unitId: 1 },
      { id: 'b', unitId: 1 },
      { id: 'c', unitId: 3 },
    ];
    const parUnite = bilanSrsParUnite(
      cartes,
      etats({ a: MAINTENANT - 1, b: MAINTENANT + JOUR, c: 0 }),
      MAINTENANT,
    );
    expect(Object.keys(parUnite).sort().join(',')).toBe('1,3');
    expect(parUnite[1]).toEqual({ jamaisEvaluees: 0, echeues: 1, programmees: 1, consolidees: 0 });
    expect(parUnite[3]!.consolidees).toBe(1);
    expect(parUnite[2]).toBeUndefined();
  });
});

describe('cartesParProchaineEcheance — le chemin visible, trié, plafonné', () => {
  it('ne liste QUE les programmées, par dueAt croissant, plafonné à max', () => {
    const cartes = [
      { id: 'echue', question: 'q-échue' },
      { id: 'b+', question: 'q-plus-tard' },
      { id: 'a+', question: 'q-tôt' },
      { id: 'consolidee', question: 'q-sortie' },
      { id: 'jamais', question: 'q-rien' },
    ];
    const etatst = etats({
      echue: MAINTENANT - 1,
      'a+': MAINTENANT + JOUR,
      'b+': MAINTENANT + 4 * JOUR,
      consolidee: 0,
    });
    const liste = cartesParProchaineEcheance(cartes, etatst, MAINTENANT, 10);
    expect(liste.map((l) => l.id).join(',')).toBe('a+,b+');
    expect(liste.every((l) => l.dueAt !== 0 && l.dueAt > MAINTENANT)).toBeTruthy();
  });

  it('max = 0 → liste vide, max plafonne réellement l\'extraction', () => {
    const cartes = [
      { id: 'a', question: 'x' },
      { id: 'b', question: 'y' },
    ];
    const etatst = etats({ a: MAINTENANT + JOUR, b: MAINTENANT + 2 * JOUR });
    expect(cartesParProchaineEcheance(cartes, etatst, MAINTENANT, 0)).toHaveLength(0);
    expect(cartesParProchaineEcheance(cartes, etatst, MAINTENANT, 1)).toHaveLength(1);
  });
});
