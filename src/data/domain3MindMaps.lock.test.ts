// domain3MindMaps.lock.test.ts — verrous des dernières cartes mentales
// (audit item 16, FIN — sprint 14) : U8 ما فوق البنية الخلوية,
// U9 النشاط التكتوني, U10 بنية الكرة الأرضية, U11 البنيات الجيولوجية.
//
// Avec ces quatre cartes, les 11 unités du programme sont couvertes : la dette
// explicitement inscrite au sprint 9 (« restent à produire : U8-U11 ») est
// soldée, et le test qui la portait a été retourné en test de couverture.
//
// Comme pour le domaine 2, on fige ici l'intégrité du graphe, la documentation
// de chaque nœud et la présence des raisonnements qui font gagner des points —
// pas seulement la présence d'étiquettes.

import { describe, expect, it } from 'vitest';
import { MIND_MAPS_DATABASE } from './mindMapData';
import type { MindMapData } from './mindMapData';
import { INITIAL_UNITS } from './index';

const cible = (l: { source: string | { id: string }; target: string | { id: string } }) => ({
  s: typeof l.source === 'string' ? l.source : l.source.id,
  t: typeof l.target === 'string' ? l.target : l.target.id,
});

function verifierCarte(cle: number, unitIdAttendu: number): MindMapData {
  const carte = MIND_MAPS_DATABASE[cle];
  expect(carte, `carte ${cle} absente`).toBeDefined();
  expect(carte.unitId).toBe(unitIdAttendu);
  expect(INITIAL_UNITS.some((u) => u.id === unitIdAttendu), `unité ${unitIdAttendu}`).toBe(true);

  const ids = new Set(carte.nodes.map((n) => n.id));
  expect(ids.size, 'identifiants dupliqués').toBe(carte.nodes.length);
  expect(ids.has(carte.rootId)).toBe(true);

  const racines = carte.nodes.filter((n) => n.level === 0);
  expect(racines).toHaveLength(1);
  expect(racines[0].id).toBe(carte.rootId);

  for (const n of carte.nodes) {
    expect(n.unitId, n.id).toBe(unitIdAttendu);
    expect(n.summary.length, `${n.id} : résumé trop court`).toBeGreaterThanOrEqual(40);
    expect(n.bacTip.length, `${n.id} : conseil BAC trop court`).toBeGreaterThanOrEqual(30);
    expect(n.keywords.length, `${n.id} : mots-clés`).toBeGreaterThanOrEqual(3);
    expect(n.level).toBeGreaterThanOrEqual(0);
    expect(n.level).toBeLessThanOrEqual(3);
  }

  expect(carte.links.length).toBeGreaterThanOrEqual(carte.nodes.length);
  const relies = new Set<string>();
  for (const l of carte.links) {
    const { s, t } = cible(l);
    expect(ids.has(s), `lien mort (source ${s})`).toBe(true);
    expect(ids.has(t), `lien mort (cible ${t})`).toBe(true);
    expect(l.relation.length, 'relation non étiquetée').toBeGreaterThan(1);
    relies.add(s);
    relies.add(t);
  }
  for (const n of carte.nodes) expect(relies.has(n.id), `${n.id} orphelin`).toBe(true);

  return carte;
}

describe('carte U8 — ما فوق البنية الخلوية', () => {
  it('structure et intégrité du graphe', () => {
    expect(verifierCarte(8, 8).nodes).toHaveLength(12);
  });

  it('oppose explicitement les deux organites énergétiques', () => {
    const ids = new Set(MIND_MAPS_DATABASE[8].nodes.map((n) => n.id));
    expect(ids.has('node-u8-chloroplast')).toBe(true);
    expect(ids.has('node-u8-mitochondria')).toBe(true);
    expect(ids.has('node-u8-cristae')).toBe(true);
    expect(ids.has('node-u8-thylakoid')).toBe(true);
  });

  it('l ATP synthase est rattachée AUX DEUX organites (unité du mécanisme)', () => {
    const liens = MIND_MAPS_DATABASE[8].links.map(cible);
    expect(liens.some((l) => l.s === 'node-u8-thylakoid' && l.t === 'node-u8-atp-synthase')).toBe(true);
    expect(liens.some((l) => l.s === 'node-u8-cristae' && l.t === 'node-u8-atp-synthase')).toBe(true);
  });

  it('le piège de la nuance apparent/réel est écrit', () => {
    const noeud = MIND_MAPS_DATABASE[8].nodes.find((n) => n.id === 'node-u8-compensation')!;
    expect(`${noeud.summary} ${noeud.bacTip}`).toContain('الظاهرية');
  });
});

describe('carte U9 — النشاط التكتوني', () => {
  it('structure et intégrité du graphe', () => {
    expect(verifierCarte(9, 9).nodes).toHaveLength(12);
  });

  it('la chaîne causale du volcanisme de subduction est complète', () => {
    const liens = MIND_MAPS_DATABASE[9].links.map(cible);
    const chaine: [string, string][] = [
      ['node-u9-convergence', 'node-u9-hydration'],
      ['node-u9-hydration', 'node-u9-partial-melting'],
      ['node-u9-partial-melting', 'node-u9-magma'],
      ['node-u9-magma', 'node-u9-volcanism'],
    ];
    for (const [s, t] of chaine) {
      expect(liens.some((l) => l.s === s && l.t === t), `${s} → ${t}`).toBe(true);
    }
  });

  it('les relations négatives sont modélisées comme telles', () => {
    const inhib = MIND_MAPS_DATABASE[9].links.filter((l) => l.type === 'inhibitory');
    expect(inhib.length).toBeGreaterThanOrEqual(2);
  });

  it('le rôle de l eau — et non de la chaleur — est nommé', () => {
    const noeud = MIND_MAPS_DATABASE[9].nodes.find((n) => n.id === 'node-u9-partial-melting')!;
    expect(noeud.summary).toContain('الماء');
    expect(noeud.bacTip).toContain('عتبة');
  });
});

describe('carte U10 — بنية الكرة الأرضية', () => {
  it('structure et intégrité du graphe', () => {
    expect(verifierCarte(10, 10).nodes).toHaveLength(12);
  });

  it('les trois discontinuités majeures sont présentes', () => {
    const ids = new Set(MIND_MAPS_DATABASE[10].nodes.map((n) => n.id));
    for (const id of ['node-u10-moho', 'node-u10-gutenberg', 'node-u10-lehmann']) {
      expect(ids.has(id), id).toBe(true);
    }
  });

  it('l argument décisif est modélisé : les ondes S ne traversent pas le noyau externe', () => {
    const liens = MIND_MAPS_DATABASE[10].links.map((l) => ({ ...cible(l), type: l.type }));
    expect(
      liens.some(
        (l) => l.s === 'node-u10-s-waves' && l.t === 'node-u10-outer-core' && l.type === 'inhibitory',
      ),
    ).toBe(true);
    expect(liens.some((l) => l.s === 'node-u10-shadow-zone' && l.t === 'node-u10-outer-core')).toBe(true);
  });
});

describe('carte U11 — البنيات الجيولوجية الكبرى', () => {
  it('structure et intégrité du graphe', () => {
    expect(verifierCarte(11, 11).nodes).toHaveLength(12);
  });

  it('construction et destruction sont toutes deux rattachées à la racine', () => {
    const liens = MIND_MAPS_DATABASE[11].links.map(cible);
    expect(liens.some((l) => l.s === 'node-u11-root' && l.t === 'node-u11-ridge')).toBe(true);
    expect(liens.some((l) => l.s === 'node-u11-root' && l.t === 'node-u11-subduction')).toBe(true);
    expect(liens.some((l) => l.s === 'node-u11-root' && l.t === 'node-u11-collision')).toBe(true);
  });

  it('les roches témoins distinguent les deux domaines', () => {
    const ids = new Set(MIND_MAPS_DATABASE[11].nodes.map((n) => n.id));
    expect(ids.has('node-u11-pillow-basalt')).toBe(true); // construction
    expect(ids.has('node-u11-andesite')).toBe(true); // destruction
    const andesite = MIND_MAPS_DATABASE[11].nodes.find((n) => n.id === 'node-u11-andesite')!;
    expect(andesite.bacTip).toContain('البازلت');
  });

  it('le cycle de Wilson relie l ouverture à la fermeture', () => {
    const liens = MIND_MAPS_DATABASE[11].links.map(cible);
    expect(liens.some((l) => l.s === 'node-u11-wilson' && l.t === 'node-u11-ridge')).toBe(true);
    expect(liens.some((l) => l.s === 'node-u11-wilson' && l.t === 'node-u11-collision')).toBe(true);
  });
});

describe('couverture finale des cartes mentales', () => {
  it('11 cartes, 11 unités, aucune unité en double', () => {
    const cles = Object.keys(MIND_MAPS_DATABASE);
    expect(cles).toHaveLength(11);
    const unites = cles.map((k) => MIND_MAPS_DATABASE[Number(k)].unitId).sort((a, b) => a - b);
    expect(unites).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
  });

  it('aucune collision d identifiant entre les 11 cartes', () => {
    const vus = new Map<string, number>();
    for (const cle of Object.keys(MIND_MAPS_DATABASE)) {
      for (const n of MIND_MAPS_DATABASE[Number(cle)].nodes) {
        expect(vus.has(n.id), `${n.id} déjà dans la carte ${vus.get(n.id)}`).toBe(false);
        vus.set(n.id, Number(cle));
      }
    }
  });

  it('chaque unité du catalogue a bien une carte atteignable', () => {
    const parUnite = new Map<number, number>();
    for (const cle of Object.keys(MIND_MAPS_DATABASE)) {
      parUnite.set(MIND_MAPS_DATABASE[Number(cle)].unitId, Number(cle));
    }
    for (const u of INITIAL_UNITS) expect(parUnite.has(u.id), `unité ${u.id} sans carte`).toBe(true);
  });
});
