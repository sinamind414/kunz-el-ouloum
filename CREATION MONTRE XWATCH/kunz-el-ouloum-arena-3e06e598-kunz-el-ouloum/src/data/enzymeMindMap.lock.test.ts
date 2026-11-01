// enzymeMindMap.lock.test.ts — verrou du SPRINT 4 de l'audit
// docs/analyse/AUDIT_APP_5_LECONS_PRIORITAIRES.md, « Mise à jour 2 », item 16 :
// l'audit de @MostafaBdd montre qu'à contenu égal la carte mentale d'une unité
// est vue 6 à 8 fois plus que le cours (U3 : 565 K contre 73 K). L'application
// ne comptait que 3 cartes pour 11 unités, et AUCUNE pour les enzymes — alors
// que les inhibiteurs enzymatiques sont une des 5 leçons prioritaires.
import { describe, expect, it } from 'vitest';
import { MIND_MAPS_DATABASE } from './mindMapData';

const CARTE = MIND_MAPS_DATABASE[4];

describe('Carte mentale — النشاط الإنزيمي (unité 3)', () => {
  it('existe, rattachée à l’unité 3 et au domaine 1', () => {
    expect(CARTE).toBeDefined();
    expect(CARTE.unitId).toBe(3);
    expect(CARTE.unitTitle).toContain('الإنزيمي');
    expect(CARTE.rootId).toBe('node-enz-root');
  });

  it('compte 12 nœuds documentés (résumé + astuce BAC + mots-clés)', () => {
    expect(CARTE.nodes).toHaveLength(12);
    for (const n of CARTE.nodes) {
      expect(n.unitId, n.id).toBe(3);
      expect(n.summary.length, n.id).toBeGreaterThanOrEqual(40);
      expect(n.bacTip.length, n.id).toBeGreaterThanOrEqual(30);
      expect(n.keywords.length, n.id).toBeGreaterThanOrEqual(3);
      expect(n.level, n.id).toBeGreaterThanOrEqual(0);
      expect(n.level, n.id).toBeLessThanOrEqual(3);
    }
    expect(CARTE.nodes.filter((n) => n.level === 0)).toHaveLength(1);
  });

  it('porte le comparatif compétitif / non compétitif, priorité n°1 du plan', () => {
    const comp = CARTE.nodes.find((n) => n.id === 'node-enz-competitive');
    const non = CARTE.nodes.find((n) => n.id === 'node-enz-noncompetitive');
    const lecture = CARTE.nodes.find((n) => n.id === 'node-enz-inhibition-read');
    expect(comp).toBeDefined();
    expect(non).toBeDefined();
    expect(lecture).toBeDefined();
    // Le critère décisif au BAC : ce que devient Vmax.
    expect(comp!.bacTip).toContain('Vmax');
    expect(non!.bacTip).toContain('Vmax');
    expect(comp!.bacTip).toContain('Km');
    expect(lecture!.bacTip).toContain('Vmax');
  });

  it('couvre les trois courbes exigibles : substrat/Vmax, température, pH', () => {
    const ids = CARTE.nodes.map((n) => n.id);
    for (const id of [
      'node-enz-substrate-curve',
      'node-enz-km',
      'node-enz-temperature',
      'node-enz-ph',
    ]) {
      expect(ids, id).toContain(id);
    }
  });

  it('aucun lien mort : chaque source et chaque cible existe', () => {
    const ids = new Set(CARTE.nodes.map((n) => n.id));
    expect(CARTE.links.length).toBeGreaterThanOrEqual(15);
    for (const l of CARTE.links) {
      expect(ids.has(l.source as string), `source ${l.source}`).toBe(true);
      expect(ids.has(l.target as string), `cible ${l.target}`).toBe(true);
      expect(l.relation.length).toBeGreaterThanOrEqual(3);
    }
  });

  it('chaque nœud non racine est relié à au moins un autre', () => {
    const relies = new Set<string>();
    for (const l of CARTE.links) {
      relies.add(l.source as string);
      relies.add(l.target as string);
    }
    for (const n of CARTE.nodes) expect(relies.has(n.id), `orphelin : ${n.id}`).toBe(true);
  });

  it('les identifiants n’empiètent pas sur la carte immunitaire', () => {
    const immunite = new Set(MIND_MAPS_DATABASE[3].nodes.map((n) => n.id));
    for (const n of CARTE.nodes) expect(immunite.has(n.id), n.id).toBe(false);
  });

  // Sprint 14 (item 16, fin) : les 11 unités du programme ont leur carte.
  it('l’application propose désormais 11 cartes mentales', () => {
    expect(Object.keys(MIND_MAPS_DATABASE)).toEqual([
      '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11',
    ]);
  });
});
