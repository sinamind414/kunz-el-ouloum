// derniereUnite.test.ts — audit Capitaine 2026-10-17 (§6.2, P2) :
// « App.tsx : derniereUnite: units[0]?.title → la RÉELLE dernière unité. »
//
// La bulle disait « reprends التركيب البروتين » à tout le monde, toujours —
// le titre INITIAL_UNITS[0], jamais l'unité réellement touchée. Le seul
// TÉMOIN honnête est le parcours (kunz_parcours_v1) : l'item commencé non
// terminé (`current`), sinon la dernière validation datée (`done`).
// Faute de témoin : null — on ne devine pas un souvenir.
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { PARCOURS_DOMAINS, PARCOURS_FLAT } from './parcoursPath';
import {
  derniereUniteTouchee,
  etatParDefaut,
  loadParcours,
  markDone,
  markStarted,
  saveParcours,
} from './parcoursProgress';

const titreDe = (unitId: number): string =>
  PARCOURS_DOMAINS.flatMap((d) => d.units).find((u) => u.unitId === unitId)!.title;

beforeEach(() => {
  localStorage.clear();
  saveParcours(etatParDefaut());
});

afterEach(() => {
  localStorage.clear();
});

describe('derniereUniteTouchee — l unité réelle, pas la première du catalogue', () => {
  it('item commencé non terminé → son unité (le témoin le plus frais)', () => {
    const item = PARCOURS_FLAT.find((i) => i.unitId === 3 && i.kind === 'lesson');
    expect(item).toBeTruthy();
    markStarted(item!.id);
    expect(derniereUniteTouchee()).toBe(titreDe(3));
  });

  it('aucun current → la dernière validation DATÉE gagne', () => {
    const u2 = PARCOURS_FLAT.filter((i) => i.unitId === 2).at(-1)!;
    const u7 = PARCOURS_FLAT.filter((i) => i.unitId === 7).at(-1)!;
    // u2 validée « hier » (date forcée), u7 « aujourd'hui » : la dernière est u7.
    markDone(u2.id);
    const st = loadParcours();
    st.done[u2.id] = { ...st.done[u2.id]!, at: '2020-01-01' };
    saveParcours(st);
    markDone(u7.id);
    expect(derniereUniteTouchee()).toBe(titreDe(7));
  });

  it('parcours vierge → null (pas de titre deviné)', () => {
    expect(derniereUniteTouchee()).toBeNull();
  });
});
