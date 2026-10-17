// revueJ14.test.ts — audit Capitaine 2026-10-17 (§4.2, P1) :
// « cette ouverture ne marque pas la révision comme faite et ne décale pas
// son échéance — le même rappel peut rester prioritaire indéfiniment ».
// Contrat après correction : `replanifierRevue(itemId, fragilePreuve?)`
//   · replanifie le rappel à J+14 (la revue faite n'est plus éternellement due) ;
//   · transfère la preuve mesurée sur le drapeau fragile (une revue ratée
//     re-priorise l'item — une revue réussie lèche ses blessures) ;
//   · refuse (false) un item non terminé (on ne programme pas du vide).
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { PARCOURS_FLAT } from './parcoursPath';
import {
  etatParDefaut,
  loadParcours,
  markDone,
  REVIEW_DELAY_DAYS,
  saveParcours,
  todayKey,
} from './parcoursProgress';
import { replanifierRevue } from './parcoursProgress';
import { nextBestAction } from './nbaEngine';

const ID = PARCOURS_FLAT.find((i) => i.kind === 'lesson')!.id;

/** L'item est validé mais SON rappel est échu (hier). */
function itemAvecRevueEchue(): void {
  markDone(ID);
  const st = loadParcours();
  const hier = isoDaysAgo(1);
  st.reviews[ID] = hier;
  saveParcours(st);
}

function isoDaysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return todayKey(d);
}

beforeEach(() => {
  localStorage.clear();
  saveParcours(etatParDefaut());
});

afterEach(() => {
  localStorage.clear();
});

describe('la revue J+14 se CLOSSE sur preuve (audit §4.2)', () => {
  it('base : un rappel échu apparaît bien dans la NBA (comportement actuel)', () => {
    itemAvecRevueEchue();
    const action = nextBestAction();
    expect(action.type).toBe('review');
  });

  it('replanifierRevue décale l échéance et retire l item de la file due', () => {
    itemAvecRevueEchue();
    expect(replanifierRevue(ID)).toBe(true);

    const st = loadParcours();
    // L'échéance = aujourd'hui + REVIEW_DELAY_DAYS (± une seconde de minuit).
    const due = st.reviews[ID]!;
    expect(due === todayKey() || due === isoATodayPlusDelay()).toBe(true);

    const action = nextBestAction();
    expect(action.type).not.toBe('review');
  });

  it('preuve fragile → le drapeau fragile repriorise l item au rappel du coach', () => {
    itemAvecRevueEchue();
    expect(replanifierRevue(ID, true)).toBe(true);
    expect(loadParcours().done[ID]?.fragile).toBe(true);
    expect(nextBestAction().type).not.toBe('review');
  });

  it('preuve solide → fragile repasse à false (la revue réussie soigne)', () => {
    itemAvecRevueEchue();
    expect(replanifierRevue(ID, false)).toBe(true);
    expect(loadParcours().done[ID]?.fragile).toBe(false);
  });

  it('refuse un item non terminé (pas de rappel programmé sur du vide)', () => {
    expect(replanifierRevue(ID)).toBe(false);
    expect(loadParcours().reviews[ID]).toBeUndefined();
  });
});

function isoATodayPlusDelay(): string {
  const d = new Date();
  d.setDate(d.getDate() + REVIEW_DELAY_DAYS);
  return todayKey(d);
}
