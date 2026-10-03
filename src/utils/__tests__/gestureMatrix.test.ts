// Audit 03102026, idée 4 — tests de la matrice Geste × Chapitre (transfert).
//
// Ce qui est testé : un geste ne se déclare dans un chapitre que si on peut
// nommer le document précis sur lequel il s'exerce, et le transfert change
// TOUJOURS de chapitre (sinon c'est de la répétition, pas du transfert).

import { afterEach, describe, expect, it } from 'vitest';
import {
  GESTURE_CHAPTER_MATRIX,
  chaptersForGesture,
  matrixGestureIds,
  nextTransferForGesture,
} from '../../data/gestureChapterMatrix';
import {
  GESTURE_IDS,
  loadGestureRecall,
  gestureIsTransversal,
  markGestureRecallOk,
  nextDueGestureWithTransfer,
} from '../../lib/parcours/gestureRecallEngine';

const GESTURE_RECALL_KEY = 'kunz-gesture-recall-v1';

afterEach(() => {
  window.localStorage.removeItem(GESTURE_RECALL_KEY);
});

describe('matrice Geste × Chapitre — contenu', () => {
  it('chaque cellule pointe vers une unité réelle du programme (1..11)', () => {
    GESTURE_CHAPTER_MATRIX.forEach((cell) => {
      expect(cell.unitId).toBeGreaterThanOrEqual(1);
      expect(cell.unitId).toBeLessThanOrEqual(11);
    });
  });

  it('chaque cellule nomme un document concret ET une consigne BAC', () => {
    GESTURE_CHAPTER_MATRIX.forEach((cell) => {
      expect(cell.anchor.bacPromptAr.trim().length).toBeGreaterThan(10);
      expect(cell.anchor.supportAr.trim().length).toBeGreaterThan(3);
    });
  });

  it('ne déclare que des gestes MIFTah gérés par la boucle de rappel', () => {
    matrixGestureIds().forEach((id) => {
      expect(GESTURE_IDS).toContain(id);
    });
  });
});

describe('transfert — on change TOUJOURS de chapitre', () => {
  it('nextTransferForGesture ne renvoie jamais l\'unité courante', () => {
    matrixGestureIds().forEach((gestureId) => {
      chaptersForGesture(gestureId).forEach((cell) => {
        const transfer = nextTransferForGesture(gestureId, cell.unitId);
        if (transfer) {
          expect(transfer.unitId).not.toBe(cell.unitId);
        }
      });
    });
  });

  it('renvoie null si le geste n\'existe que dans un seul chapitre', () => {
    // verb_relier est défini en U3, U4, U5, U6 → depuis U99, on doit trouver
    // une cellule (et elle n\'est pas en U99)
    const t = nextTransferForGesture('verb_relier', 99);
    expect(t).not.toBeNull();
    expect(t!.unitId).not.toBe(99);
  });

  it('la rotation est déterministe (même unité → même destination)', () => {
    const a = nextTransferForGesture('verb_prouver', 1);
    const b = nextTransferForGesture('verb_prouver', 1);
    expect(a).toEqual(b);
  });

  it('deux unités différentes mènent à des destinations différentes', () => {
    const a = nextTransferForGesture('verb_prouver', 1);
    const b = nextTransferForGesture('verb_prouver', 3);
    expect(a!.unitId).not.toBe(b!.unitId);
  });
});

describe('transversalité — un geste n\'est pas la propriété d\'un cours', () => {
  it('verb_prouver (دليل) est transversal : présent dans ≥ 2 chapitres', () => {
    expect(chaptersForGesture('verb_prouver').length).toBeGreaterThanOrEqual(2);
    const s = loadGestureRecall();
    expect(gestureIsTransversal(s, 'verb_prouver')).toBe(true);
  });

  it('verb_relier et verb_agir sont aussi transversaux', () => {
    expect(chaptersForGesture('verb_relier').length).toBeGreaterThanOrEqual(2);
    expect(chaptersForGesture('verb_agir').length).toBeGreaterThanOrEqual(2);
  });
});

describe('jonction idée 1 → idée 4 : le rappel dû porte un contexte de transfert', () => {
  it('sans geste échu → null', () => {
    expect(nextDueGestureWithTransfer()).toBeNull();
  });

  it('un geste échu est livré avec un chapitre de transfert', () => {
    // verb_prouver au stage 0, échéance J+1 → on force l'échéance à hier
    const base = loadGestureRecall();
    base.due['verb_prouver'] = '2020-01-01';
    window.localStorage.setItem(GESTURE_RECALL_KEY, JSON.stringify(base));

    const due = nextDueGestureWithTransfer();
    expect(due).not.toBeNull();
    expect(due!.id).toBe('verb_prouver');
    expect(due!.transferUnitId).not.toBeNull();
    expect(due!.bacPromptAr).not.toBeNull();
    expect(due!.bacPromptAr!.length).toBeGreaterThan(10);
  });

  it('le contexte de transfert ne dépend pas du chapitre d\'acquisition', () => {
    markGestureRecallOk('verb_prouver'); // stage 1 → échéance J+3
    // On force l'échéance sans toucher au stage
    const s = loadGestureRecall();
    s.due['verb_prouver'] = '2020-01-01';
    window.localStorage.setItem(GESTURE_RECALL_KEY, JSON.stringify(s));

    const due = nextDueGestureWithTransfer();
    expect(due!.transferUnitId).toBeGreaterThan(0);
  });
});
