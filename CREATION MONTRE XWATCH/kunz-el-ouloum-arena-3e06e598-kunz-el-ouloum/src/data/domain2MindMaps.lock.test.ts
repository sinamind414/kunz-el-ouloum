// domain2MindMaps.lock.test.ts — verrous des cartes mentales du domaine 2
// (audit item 16, sprint 9) : U5 الاتصال العصبي, U6 التركيب الضوئي,
// U7 تحويل الطاقة إلى ATP, plus l'étoffement de la carte U2 (8 → 13 nœuds).
//
// Pourquoi ce format en priorité : chez @MostafaBdd la carte mentale d'une unité
// fait ×6 à ×7 les vues du cours correspondant (U2 : 568 K vs 87 K ; U3 : 565 K
// vs 73 K). Trois des unités les plus demandées n'en avaient aucune.
//
// Ce fichier fige, pour chaque carte : le rattachement à la bonne unité du
// catalogue, l'intégrité du graphe (racine présente, aucun lien mort, aucun
// nœud orphelin), l'absence de collision d'identifiants entre cartes, et la
// présence des nœuds qui portent les pièges d'examen de l'unité.

import { describe, expect, it } from 'vitest';
import { MIND_MAPS_DATABASE } from './mindMapData';
import type { MindMapData } from './mindMapData';
import { INITIAL_UNITS } from './index';

const idsDe = (c: MindMapData) => new Set(c.nodes.map((n) => n.id));
const cible = (l: { source: string | { id: string }; target: string | { id: string } }) => ({
  s: typeof l.source === 'string' ? l.source : l.source.id,
  t: typeof l.target === 'string' ? l.target : l.target.id,
});

/** Contrats communs à toute carte publiée. */
function verifierCarte(cle: number, unitIdAttendu: number, nbNoeudsMin: number) {
  const carte = MIND_MAPS_DATABASE[cle];
  expect(carte, `carte ${cle} absente`).toBeDefined();
  expect(carte.unitId).toBe(unitIdAttendu);

  // le titre d'unité doit exister dans le catalogue officiel
  const unite = INITIAL_UNITS.find((u) => u.id === unitIdAttendu);
  expect(unite, `unité ${unitIdAttendu} absente du catalogue`).toBeDefined();

  expect(carte.nodes.length).toBeGreaterThanOrEqual(nbNoeudsMin);
  const ids = idsDe(carte);
  expect(ids.size, 'identifiants dupliqués').toBe(carte.nodes.length);
  expect(ids.has(carte.rootId)).toBe(true);

  // une seule racine, de niveau 0
  const racines = carte.nodes.filter((n) => n.level === 0);
  expect(racines).toHaveLength(1);
  expect(racines[0].id).toBe(carte.rootId);

  // chaque nœud est documenté (c'est ce qui distingue une carte d'un schéma)
  for (const n of carte.nodes) {
    expect(n.unitId, n.id).toBe(unitIdAttendu);
    expect(n.summary.length, `${n.id} : résumé trop court`).toBeGreaterThanOrEqual(40);
    expect(n.bacTip.length, `${n.id} : conseil BAC trop court`).toBeGreaterThanOrEqual(30);
    expect(n.keywords.length, `${n.id} : mots-clés`).toBeGreaterThanOrEqual(3);
    expect(n.level).toBeGreaterThanOrEqual(0);
    expect(n.level).toBeLessThanOrEqual(3);
  }

  // graphe : aucun lien mort, aucun nœud isolé
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

describe('carte mentale U5 — الاتصال العصبي', () => {
  const carte = () => verifierCarte(5, 5, 12);

  it('structure et intégrité du graphe', () => {
    expect(carte().nodes).toHaveLength(12);
  });

  it('porte les deux codages, le pivot du programme', () => {
    const labels = carte().nodes.map((n) => `${n.label} ${n.summary} ${n.bacTip}`).join(' ');
    expect(labels).toContain('تواتر');
    expect(labels).toContain('المبلغ الكيميائي');
    expect(labels).toContain('PPSE');
  });

  it('le potentiel d action est relié au potentiel de repos et à l intégration', () => {
    const c = carte();
    const liens = c.links.map(cible);
    expect(liens.some((l) => l.s === 'node-u5-resting' && l.t === 'node-u5-action')).toBe(true);
    expect(liens.some((l) => l.s === 'node-u5-integration' && l.t === 'node-u5-action')).toBe(true);
  });

  it('les toxines sont modélisées comme inhibitrices, pas comme une étape du trajet', () => {
    const c = carte();
    const inhib = c.links.filter((l) => l.type === 'inhibitory').map(cible);
    expect(inhib.length).toBeGreaterThanOrEqual(2);
    expect(inhib.every((l) => l.s === 'node-u5-toxins')).toBe(true);
  });
});

describe('carte mentale U6 — التركيب الضوئي', () => {
  const carte = () => verifierCarte(6, 6, 12);

  it('structure et intégrité du graphe', () => {
    expect(carte().nodes).toHaveLength(12);
  });

  it('les deux phases sont présentes et la première alimente la seconde', () => {
    const c = carte();
    const liens = c.links.map(cible);
    expect(
      liens.some((l) => l.s === 'node-u6-photochemical' && l.t === 'node-u6-biochemical'),
    ).toBe(true);
  });

  it('les trois pièges de l unité sont écrits noir sur blanc', () => {
    const texte = carte()
      .nodes.map((n) => `${n.summary} ${n.bacTip}`)
      .join(' ');
    expect(texte).toContain('روبن'); // l'O2 vient de l'eau
    expect(texte).toContain('جاغندورف'); // la lumière ne fabrique pas l'ATP
    expect(texte).toContain('الترقيم تاريخي'); // PSII avant PSI
  });
});

describe('carte mentale U7 — تحويل الطاقة إلى ATP', () => {
  const carte = () => verifierCarte(7, 7, 12);

  it('structure et intégrité du graphe', () => {
    expect(carte().nodes).toHaveLength(12);
  });

  it('la glycolyse alimente les deux voies (respiration et fermentation)', () => {
    const liens = carte().links.map(cible);
    expect(liens.some((l) => l.s === 'node-u7-glycolysis' && l.t === 'node-u7-krebs')).toBe(true);
    expect(liens.some((l) => l.s === 'node-u7-glycolysis' && l.t === 'node-u7-fermentation')).toBe(
      true,
    );
  });

  it('le bilan énergétique oppose bien les deux rendements', () => {
    const bilan = carte().nodes.find((n) => n.id === 'node-u7-balance')!;
    expect(bilan.summary).toContain('36');
    expect(bilan.summary).toContain('جزيئتين');
  });
});

describe('carte U2 étoffée (8 → 13 nœuds)', () => {
  it('compte 13 nœuds documentés et reste intègre', () => {
    const carte = verifierCarte(2, 2, 13);
    expect(carte.nodes).toHaveLength(13);
  });

  it('les 5 nœuds ajoutés couvrent le pHi appliqué et la dénaturation', () => {
    const ids = idsDe(MIND_MAPS_DATABASE[2]);
    for (const id of [
      'node-u2-classification',
      'node-u2-electrophoresis',
      'node-u2-denaturation',
      'node-u2-structure-function',
      'node-u2-examples',
    ]) {
      expect(ids.has(id), id).toBe(true);
    }
  });

  it('la dénaturation est reliée en inhibition au principe structure/fonction', () => {
    const liens = MIND_MAPS_DATABASE[2].links.map((l) => ({ ...cible(l), type: l.type }));
    expect(
      liens.some(
        (l) =>
          l.s === 'node-u2-denaturation' &&
          l.t === 'node-u2-structure-function' &&
          l.type === 'inhibitory',
      ),
    ).toBe(true);
  });
});

describe('cohérence de la base de cartes mentales', () => {
  it('11 cartes publiées, une par clé, sans unité dupliquée', () => {
    const cles = Object.keys(MIND_MAPS_DATABASE);
    expect(cles).toEqual(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11']);
    const unites = cles.map((k) => MIND_MAPS_DATABASE[Number(k)].unitId);
    expect(new Set(unites).size).toBe(unites.length);
  });

  it('aucune collision d identifiant entre deux cartes', () => {
    const vus = new Map<string, number>();
    for (const cle of Object.keys(MIND_MAPS_DATABASE)) {
      const carte = MIND_MAPS_DATABASE[Number(cle)];
      for (const n of carte.nodes) {
        expect(vus.has(n.id), `${n.id} déjà présent dans la carte ${vus.get(n.id)}`).toBe(false);
        vus.set(n.id, Number(cle));
      }
    }
  });

  it('toutes les unités couvertes existent dans le catalogue des 11 unités', () => {
    for (const cle of Object.keys(MIND_MAPS_DATABASE)) {
      const uid = MIND_MAPS_DATABASE[Number(cle)].unitId;
      expect(INITIAL_UNITS.some((u) => u.id === uid), `unité ${uid}`).toBe(true);
    }
  });

  // Sprint 14 : la dette U8-U11 est soldée, voir domain3MindMaps.lock.test.ts.
  it('les 11 unités du programme sont couvertes', () => {
    const couvertes = new Set(
      Object.keys(MIND_MAPS_DATABASE).map((k) => MIND_MAPS_DATABASE[Number(k)].unitId),
    );
    expect([...couvertes].sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
  });
});
