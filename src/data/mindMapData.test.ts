// P1 — badges des unités mindmap dérivés des données (plus de 14/8/9 hardcodés).
import { describe, expect, it } from 'vitest';
import { MIND_MAPS_DATABASE } from './mindMapData';

describe('MIND_MAPS_DATABASE — inventaire', () => {
  it('3 unités, ids uniques, liens tous résolus', () => {
    const units = Object.values(MIND_MAPS_DATABASE);
    expect(units).toHaveLength(3);
    const allIds = new Set<string>();
    for (const u of units) {
      for (const n of u.nodes) {
        expect(allIds.has(n.id), `duplicate id ${n.id}`).toBe(false);
        allIds.add(n.id);
      }
      for (const l of u.links) {
        const src = typeof l.source === 'object' ? l.source.id : l.source;
        const tgt = typeof l.target === 'object' ? l.target.id : l.target;
        expect(u.nodes.some((n) => n.id === src), `orphan source ${src}`).toBe(true);
        expect(u.nodes.some((n) => n.id === tgt), `orphan target ${tgt}`).toBe(true);
      }
      expect(u.nodes.some((n) => n.id === u.rootId)).toBe(true);
    }
  });

  it('comptages hors racine : l’UI doit les dériver (ancien hardcode 14/8/9)', () => {
    // Géométrie réelle constatée — si on ajoute un nœud, le test l’attends
    // et force de mettre à jour l’intention pédagogique, pas un libellé figé.
    const counts = [1, 2, 3].map(
      (id) => MIND_MAPS_DATABASE[id].nodes.filter((n) => n.level !== 0).length,
    );
    // 14 / 7 / 7 hors racine (les anciens badges 8 et 9 étaient faux).
    expect(counts).toEqual([14, 7, 7]);
    const totals = [1, 2, 3].map((id) => MIND_MAPS_DATABASE[id].nodes.length);
    expect(totals).toEqual([15, 8, 8]);
  });
});
