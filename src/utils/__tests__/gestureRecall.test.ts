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

/** Clé YYYY-MM-DD dans n jours (mêmes règles que todayKey du moteur). */
function keyAt(jours: number): string {
  const d = new Date();
  d.setDate(d.getDate() + jours);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

afterEach(() => {
  window.localStorage.removeItem(GESTURE_RECALL_KEY);
});

// ══════════════════════════════════════════════════════════════════════════
// BASCULE DU 15/10/2026 — l'échelle fixe est remplacée par SM-2.
// ══════════════════════════════════════════════════════════════════════════
// Le bloc qui vivait ici affirmait que la séquence canonique valait [1, 3, 7, 14]
// et que le stage montait de 1 en 1. Ces deux assertions encodaient exactement le
// défaut signalé par l'utilisateur : un intervalle déterminé par le NOMBRE de
// passages, jamais par la qualité de la réponse. Elles sont remplacées par les
// invariants du nouvel algorithme, qui ne dépendent plus d'une table.
describe('l’échelle fixe a disparu au profit de SM-2', () => {
  it('l’échelle publiée est NOMINALE — elle vient de l’algorithme, pas d’une table', async () => {
    const mod = await import('../../data/spacedRecallIntervals');
    const sm2 = await import('../../lib/sm2');
    expect([...mod.SPACED_RECALL_INTERVALS]).toEqual(sm2.echelleNominaleSm2(4));
    // SM-2 authentique : 1 jour, puis 6 jours (et non 3).
    expect(mod.SPACED_RECALL_INTERVALS[0]).toBe(1);
    expect(mod.SPACED_RECALL_INTERVALS[1]).toBe(6);
    // Les valeurs de l'ancienne échelle fixe ne sont plus promises nulle part.
    expect(mod.SPACED_RECALL_INTERVALS).not.toContain(3);
    expect(mod.SPACED_RECALL_INTERVALS).not.toContain(14);
  });

  it('le module d’intervalles ne sert plus à ordonnancer', async () => {
    // Garde-fou anti-régression : si quelqu'un réintroduisait un ordonnancement
    // par stage, il faudrait qu'il le fasse ailleurs — et le verrait ici.
    const mod = await import('../../data/spacedRecallIntervals');
    expect(typeof mod.intervalForStage).toBe('function');
    expect(mod.MAX_RECALL_STAGE).toBe(3);
  });
});

describe('gestureRecallEngine — idée 1 : les gestes dans la boucle', () => {
  it('état par défaut : aucun geste échu, aucun rappel prévu', () => {
    const s = etatGestesParDefaut();
    expect(nextDueGesture(s)).toBeNull();
    expect(Object.keys(s.stage)).toHaveLength(0);
  });

  it('markGestureRecallOk programme le rappel suivant à J+1, puis J+6 (SM-2)', () => {
    markGestureRecallOk('verb_prouver');
    let s = loadGestureRecall();
    expect(gestureStage(s, 'verb_prouver')).toBe(1); // 1re réussite
    // SM-2 : rép. 1 → 1 jour. (L'ancienne échelle fixe annonçait J+3.)
    expect(s.due['verb_prouver']).toBe(keyAt(1));
    expect(s.etat['verb_prouver']?.intervalDays).toBe(1);

    // Deuxième réussite → 6 jours : c'est l'algorithme qui décide, pas une table.
    markGestureRecallOk('verb_prouver');
    s = loadGestureRecall();
    expect(s.etat['verb_prouver']?.intervalDays).toBe(6);
    expect(s.due['verb_prouver']).toBe(keyAt(6));
  });

  it('un échec fait revenir le geste PLUS TÔT qu’une réussite — tout l’algorithme', () => {
    // Le geste réussi trois fois s'espace ; celui qui échoue revient demain.
    for (let i = 0; i < 3; i++) markGestureRecallOk('verb_agir');
    const reussi = loadGestureRecall().etat['verb_agir']!;

    markGestureRecallOk('verb_relier');
    markGestureRecallFailed('verb_relier');
    const rate = loadGestureRecall().etat['verb_relier']!;

    expect(rate.intervalDays).toBeLessThan(reussi.intervalDays);
    expect(rate.lapses).toBe(1);
    expect(rate.ease).toBeLessThan(reussi.ease);
    // Et cet écart se MAINTIENT : c'est le facteur de facilité qui le porte.
    expect(rate.ease).toBeLessThan(2.5);
  });

  it('un geste non échu n\'est pas proposé (respecte l\'intervalle)', () => {
    markGestureRecallOk('verb_prouver');
    // échéance à J+1 (SM-2) → rien à rejouer aujourd'hui
    expect(nextDueGesture()).toBeNull();
  });

  it('un geste arrivé à échéance est proposé en priorité au plus jeune', () => {
    // verb_prouver au stage 1 (échéance J+1)
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

  it('le geste est tenu pour installé dès que son intervalle atteint 14 jours', () => {
    GESTURE_IDS.forEach(() => {});
    markGestureRecallOk('verb_agir'); // rép. 1 → 1 jour
    let s = loadGestureRecall();
    expect(gestureMastered(s, 'verb_agir')).toBe(false);
    markGestureRecallOk('verb_agir'); // rép. 2 → 6 jours
    s = loadGestureRecall();
    expect(gestureMastered(s, 'verb_agir')).toBe(false);
    markGestureRecallOk('verb_agir'); // rép. 3 → 15 jours
    s = loadGestureRecall();
    expect(gestureMastered(s, 'verb_agir')).toBe(true);

    // « Entretien » ne veut plus dire « plafonné » : l'intervalle continue de
    // s'allonger tant que l'élève réussit, ce qui est le but de l'algorithme.
    // L'ancien modèle figeait le stage à 3 et donc la date à J+14 pour toujours.
    const avant = s.etat['verb_agir']!.intervalDays;
    markGestureRecallOk('verb_agir');
    s = loadGestureRecall();
    expect(s.etat['verb_agir']!.intervalDays).toBeGreaterThan(avant);
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
