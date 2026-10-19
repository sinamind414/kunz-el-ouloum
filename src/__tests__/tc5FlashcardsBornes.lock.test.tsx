// tc5FlashcardsBornes.lock.test.tsx — LES FLASHCARDS SM-2 BORNÉES
// (TC5/H3, audit « architecture d'apprentissage » 19/10/2026).
//
// Ce que l'audit a mesuré : la transition SM-2 canonique ne plafonne RIEN —
// le chemin 1 → 6 → ×ease mène, après quelques mois de réussites, à des
// échéances à 6-12 mois, au-delà du BAC : une carte bien réussie se programme
// hors de portée de l'élève et ne revient jamais.
//
// Convention après correction (mêmes chiffres que la mémoire par question,
// TC3/H1 — plafond IMPORTÉ et non recopié) :
//   · l'intervalle ne dépasse jamais INTERVALLE_MAX_JOURS (21 j) ;
//   · atteindre le plafond par une réussite = SORTIE (dueAt = 0) — la carte
//     est reléguée en fin de deck, elle ne re-remplit plus le calendrier ;
//   · un échec rouvre TOUT, même une carte sortie ;
//   · noter une carte déjà sortie ne la fait jamais rentrer.

import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  getSrsState,
  nextSrsState,
  previewIntervalDays,
  rateCard,
  resetAllSrs,
  sortByDue,
} from '../utils/flashcardsSrs';
import { INTERVALLE_MAX_JOURS } from '../lib/memoireQuestions';

const CLE_SRS = 'kunz_flashcard_srs_v1';
const ANCIEN_ECHELON = 38; // intervalle que le SM-2 non borné fabriquait (15 × 2,5)

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  localStorage.clear();
});

describe('la borne — plafond 21 jours, sortie au plafond', () => {
  it('le chemin de réussites atteint le plafond puis SORT (dueAt = 0)', () => {
    const now = Date.now();
    const s1 = nextSrsState(null, 'good', now);
    const s2 = nextSrsState(s1, 'good', now);
    const s3 = nextSrsState(s2, 'good', now);
    // SM-2 canonique : 1, 6, puis round(6 × ease) — encore sous le plafond.
    expect(s1.intervalDays).toBe(1);
    expect(s2.intervalDays).toBe(6);
    expect(s3.intervalDays).toBeLessThan(INTERVALLE_MAX_JOURS);
    expect(s3.dueAt).toBeGreaterThan(now);
    // La 4e réussite aurait produit round(15 × ease) ≈ 38 j : SORTIE.
    const s4 = nextSrsState(s3, 'good', now);
    expect(s4.intervalDays).toBe(INTERVALLE_MAX_JOURS);
    expect(s4.dueAt).toBe(0);
  });

  it('une carte déjà programmée trop loin (état d avant la borne) sort à la réussite', () => {
    const now = Date.now();
    localStorage.setItem(
      CLE_SRS,
      JSON.stringify({
        c1: {
          ease: 2.5,
          intervalDays: ANCIEN_ECHELON,
          dueAt: now + ANCIEN_ECHELON * 86_400_000,
          reps: 4,
          lapses: 0,
        },
      }),
    );
    const s = rateCard('c1', 'good', now + ANCIEN_ECHELON * 86_400_000);
    expect(s.intervalDays).toBe(INTERVALLE_MAX_JOURS);
    expect(s.dueAt).toBe(0);
    expect(getSrsState('c1')?.dueAt).toBe(0); // persisté
  });

  it('une carte programmée sous le plafond garde son échéance normale', () => {
    const now = Date.now();
    const s = nextSrsState(null, 'good', now);
    expect(s.dueAt).toBe(now + 86_400_000); // intacte, rien de fabriqué
  });
});

describe('la sortie — ré-entrée impossible sans échec', () => {
  it('noter une carte SORTIE ne la fait pas rentrer dans la boucle', () => {
    const now = Date.now();
    const sortie = { ease: 2.5, intervalDays: 21, dueAt: 0, reps: 4, lapses: 0 };
    const s = nextSrsState(sortie, 'good', now);
    expect(s.dueAt).toBe(0);
    expect(s.intervalDays).toBe(INTERVALLE_MAX_JOURS);
  });

  it('un échec sur une carte SORTIE la fait rentrer (dueAt = maintenant, lapses +1)', () => {
    const now = Date.now();
    const sortie = { ease: 2.5, intervalDays: 21, dueAt: 0, reps: 4, lapses: 0 };
    const s = nextSrsState(sortie, 'again', now);
    expect(s.intervalDays).toBe(0);
    expect(s.dueAt).toBe(now);
    expect(s.lapses).toBe(1);
    // Et son cycle recommence : la réussite suivante re-programme à 1 jour.
    const s2 = nextSrsState({ ...s, dueAt: now - 1 }, 'good', now + 1);
    expect(s2.intervalDays).toBe(1);
  });
});

describe('l ordre du deck — une carte sortie va en fin de deck, jamais dans les dues', () => {
  it('dues → programmées (par dueAt) → sorties', () => {
    const now = Date.now();
    // a : due (échec intra-séance), b : programmée, c : sortie.
    rateCard('a', 'again', now);
    rateCard('b', 'hard', now);
    // c injectée directement : on relit d'abord ce que rateCard a écrit pour
    // ne pas l'écraser, puis on ajoute l'état de sortie (dueAt = 0).
    const brut = JSON.parse(localStorage.getItem(CLE_SRS) ?? '{}') as Record<string, unknown>;
    brut['c'] = { ease: 2.5, intervalDays: 21, dueAt: 0, reps: 4, lapses: 0 };
    localStorage.setItem(CLE_SRS, JSON.stringify(brut));

    const cards = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];
    expect(sortByDue(cards, now).map((c) => c.id)).toEqual(['a', 'b', 'c']);
  });
});

describe('previewIntervalDays — le plafond se voit sur les boutons', () => {
  it('une carte à 15 jours annonce 21 (le plafond) — la réussite la fait réellement sortir', () => {
    const now = Date.now();
    const s3 = nextSrsState(nextSrsState(nextSrsState(null, 'good', now), 'good', now), 'good', now);
    const etat = { ...s3, dueAt: now - 86_400_000 }; // échéance atteinte
    expect(previewIntervalDays(etat, 'good')).toBe(INTERVALLE_MAX_JOURS);
  });
});

describe('persistance', () => {
  it('rateCard écrit la sortie (dueAt = 0) et la relit', () => {
    const now = Date.now();
    localStorage.setItem(
      CLE_SRS,
      JSON.stringify({
        c1: { ease: 2.5, intervalDays: ANCIEN_ECHELON, dueAt: now - 1, reps: 4, lapses: 0 },
      }),
    );
    rateCard('c1', 'easy', now);
    const s = getSrsState('c1');
    expect(s?.intervalDays).toBe(INTERVALLE_MAX_JOURS);
    expect(s?.dueAt).toBe(0);
    resetAllSrs();
    expect(getSrsState('c1')).toBeNull();
  });
});
