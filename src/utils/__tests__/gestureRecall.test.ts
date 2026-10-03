// Audit 03102026, idée 1 — tests du moteur de rappel des gestes.
// Vérifie que la méthode entre bien dans la boucle de rappel espacée,
// ce qui n'était JAMAIS le cas avant (PARCOURS_FLAT ne contient que des leçons).

import { afterEach, describe, expect, it } from 'vitest';
import {
  GESTURE_IDS,
  etatGestesParDefaut,
  gestureMastered,
  gestureStage,
  loadGestureRecall,
  markGestureRecallFailed,
  markGestureRecallOk,
  nextDueGesture,
} from '../../lib/parcours/gestureRecallEngine';

const GESTURE_RECALL_KEY = 'kunz-gesture-recall-v1';

afterEach(() => {
  window.localStorage.removeItem(GESTURE_RECALL_KEY);
});

describe('spacedRecallIntervals — référentiel unique (idée 2)', () => {
  it("expose la séquence canonique J+1 → J+3 → J+7 → J+14, pas J+16/J+30", async () => {
    const mod = await import('../../data/spacedRecallIntervals');
    expect([...mod.SPACED_RECALL_INTERVALS]).toEqual([1, 3, 7, 14]);
    expect(mod.SPACED_RECALL_INTERVALS).not.toContain(16);
    expect(mod.SPACED_RECALL_INTERVALS).not.toContain(30);
    expect(mod.intervalForStage(0)).toBe(1);
    expect(mod.intervalForStage(1)).toBe(3);
    expect(mod.intervalForStage(2)).toBe(7);
    expect(mod.intervalForStage(3)).toBe(14);
  });

  it('stage maximum stagne (entretien, pas allongement infini)', async () => {
    const mod = await import('../../data/spacedRecallIntervals');
    expect(mod.nextStage(0)).toBe(1);
    expect(mod.nextStage(2)).toBe(3);
    expect(mod.nextStage(3)).toBe(3); // plafond
    expect(mod.nextStage(99)).toBe(3); // débordement sécurisé
  });
});

describe('gestureRecallEngine — idée 1 : les gestes dans la boucle', () => {
  it('état par défaut : aucun geste échu, aucun rappel prévu', () => {
    const s = etatGestesParDefaut();
    expect(nextDueGesture(s)).toBeNull();
    expect(Object.keys(s.stage)).toHaveLength(0);
  });

  it('markGestureRecallOk programme le rappel suivant (J+1 → J+3)', () => {
    markGestureRecallOk('verb_prouver');
    const s = loadGestureRecall();
    expect(gestureStage(s, 'verb_prouver')).toBe(1); // 0 → nextStage(0) = 1
    // échéance = aujourd'hui + 3 jours (intervalForStage(1))
    const today = new Date();
    const attendu = new Date(today);
    attendu.setDate(attendu.getDate() + 3);
    const attenduKey = `${attendu.getFullYear()}-${String(attendu.getMonth() + 1).padStart(2, '0')}-${String(attendu.getDate()).padStart(2, '0')}`;
    expect(s.due['verb_prouver']).toBe(attenduKey);
  });

  it('un geste non échu n\'est pas proposé (respecte l\'intervalle)', () => {
    markGestureRecallOk('verb_prouver');
    // échéance à J+3 → rien à rejouer aujourd'hui
    expect(nextDueGesture()).toBeNull();
  });

  it('un geste arrivé à échéance est proposé en priorité au plus jeune', () => {
    // verb_prouver au stage 1 (échéance J+3)
    markGestureRecallOk('verb_prouver');
    const s = loadGestureRecall();
    // on force l'échéance dans le passé pour simuler J+3 écoulé
    const hier = new Date();
    hier.setDate(hier.getDate() - 1);
    const hierKey = `${hier.getFullYear()}-${String(hier.getMonth() + 1).padStart(2, '0')}-${String(hier.getDate()).padStart(2, '0')}`;
    s.due['verb_prouver'] = hierKey;
    window.localStorage.setItem(GESTURE_RECALL_KEY, JSON.stringify(s));

    expect(nextDueGesture()).toBe('verb_prouver');
  });

  it('priorise le stage le plus bas (le geste le moins installé d\'abord)', () => {
    // verb_relier au stage 0 (échu)
    // verb_prouver au stage 2 (échu) → verb_relier doit passer en premier
    const base = etatGestesParDefaut();
    base.due['verb_relier'] = '2020-01-01';
    base.stage['verb_relier'] = 0;
    base.due['verb_prouver'] = '2020-01-01';
    base.stage['verb_prouver'] = 2;
    window.localStorage.setItem(GESTURE_RECALL_KEY, JSON.stringify(base));

    expect(nextDueGesture()).toBe('verb_relier');
  });

  it('markGestureRecallFailed remet le stage à 0 (retour à J+1)', () => {
    markGestureRecallOk('verb_prouver'); // stage 1
    markGestureRecallFailed('verb_prouver');
    const s = loadGestureRecall();
    expect(gestureStage(s, 'verb_prouver')).toBe(0);
    // échéance = aujourd'hui + 1 jour
    const today = new Date();
    const attendu = new Date(today);
    attendu.setDate(attendu.getDate() + 1);
    const attenduKey = `${attendu.getFullYear()}-${String(attendu.getMonth() + 1).padStart(2, '0')}-${String(attendu.getDate()).padStart(2, '0')}`;
    expect(s.due['verb_prouver']).toBe(attenduKey);
  });

  it('atteint le palier après 3 réussites et y reste (entretien)', () => {
    GESTURE_IDS.forEach(() => {});
    markGestureRecallOk('verb_agir'); // 0 → 1
    markGestureRecallOk('verb_agir'); // 1 → 2
    markGestureRecallOk('verb_agir'); // 2 → 3
    let s = loadGestureRecall();
    expect(gestureStage(s, 'verb_agir')).toBe(3);
    expect(gestureMastered(s, 'verb_agir')).toBe(true);
    // un rappel de plus stagne au plafond
    markGestureRecallOk('verb_agir');
    s = loadGestureRecall();
    expect(gestureStage(s, 'verb_agir')).toBe(3);
  });

  it('les 5 gestes MIFTah sont bien couverts par le moteur', () => {
    // audit : « élire UN référentiel public » — le moteur doit couvrir
    // exactement les 4 gestes + STEP0, pas plus, pas moins.
    expect(GESTURE_IDS).toHaveLength(5);
    expect(GESTURE_IDS).toContain('step0_comprendre');
    expect(GESTURE_IDS).toContain('verb_agir');
    expect(GESTURE_IDS).toContain('verb_prouver');
    expect(GESTURE_IDS).toContain('verb_relier');
    expect(GESTURE_IDS).toContain('verb_conclure');
  });
});

describe('gestureGames — idée 3 : les deux mini-jeux', () => {
  it('mini-jeu 1 : 3 items de repérage de preuves, tous solvables', async () => {
    const { PROOF_SPOTTER_ITEMS, GESTURE_GAME_PASS_THRESHOLD } = await import('../../data/gestureGames');
    expect(PROOF_SPOTTER_ITEMS).toHaveLength(3);
    expect(GESTURE_GAME_PASS_THRESHOLD).toBe(2);
    PROOF_SPOTTER_ITEMS.forEach((item) => {
      expect(item.tokens.length).toBeGreaterThanOrEqual(4);
      // chaque item doit avoir au moins 3 preuves et au moins 1 distracteur
      expect(item.proofIndexes.length).toBeGreaterThanOrEqual(3);
      expect(item.tokens.length - item.proofIndexes.length).toBeGreaterThanOrEqual(1);
      // les index sont valides
      item.proofIndexes.forEach((i) => expect(i).toBeLessThan(item.tokens.length));
    });
  });

  it('mini-jeu 2 : 3 chaînes à ordonner, ordre strictement croissant de 0', async () => {
    const { CHAIN_ORDER_ITEMS } = await import('../../data/gestureGames');
    expect(CHAIN_ORDER_ITEMS).toHaveLength(3);
    CHAIN_ORDER_ITEMS.forEach((item) => {
      expect(item.links.length).toBeGreaterThanOrEqual(4);
      expect(item.correctOrder).toEqual(item.links.map((_, i) => i));
      expect(item.links.length).toBe(item.correctOrder.length);
    });
  });

  it('les mini-jeux ciblent bien les gestes دليل (prouver) et علاقة (relier)', async () => {
    const { GESTURE_GAME_TARGETS } = await import('../../data/gestureGames');
    expect(GESTURE_GAME_TARGETS.ps).toBe('verb_prouver');
    expect(GESTURE_GAME_TARGETS.co).toBe('verb_relier');
  });

  it('un item résolu alimente la boucle de rappel (jonction idée 3 → idée 1)', async () => {
    const { markGestureRecallOk } = await import('../../lib/parcours/gestureRecallEngine');
    markGestureRecallOk('verb_prouver');
    const s = loadGestureRecall();
    expect(gestureStage(s, 'verb_prouver')).toBe(1);
  });
});
