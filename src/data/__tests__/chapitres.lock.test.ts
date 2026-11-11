// chapitres.lock.test.ts — verrous de la couche « 3 chapitres » (2026-11-10).
//
// Demande du propriétaire : l'élève ENTRE par le chapitre (les 3 domaines du
// programme), puis voit les rubriques de ce chapitre. Ce verrou garantit que :
//   1. les chapitres sont DÉRIVÉS de la source unique (PASSIVE_DOMAINS + le
//      référentiel officiel), jamais écrits à la main ;
//   2. la somme des heures est celle du référentiel (aucun chiffre inventé) ;
//   3. le store du chapitre actif persiste, refuse un chapitre inconnu et
//      prévient ses abonnés.

import { afterEach, describe, expect, it } from 'vitest';
import { CHAPITRES, chapitreDUnite, unitesDuChapitre } from '../chapitres';
import { PASSIVE_DOMAINS } from '../lessonModes';
import { PROGRESSION_OFFICIELLE } from '../curriculumOfficial';
import {
  definirChapitreActif,
  lireChapitreActif,
  filtrerParChapitre,
} from '../../lib/chapitreActif';
import { INITIAL_UNITS } from '../../unitCatalog';

afterEach(() => {
  localStorage.clear();
  // Retour au défaut pour le test suivant (la lecture resynchronise le cache).
  definirChapitreActif(1);
});

describe('les 3 chapitres — dérivés de la source unique', () => {
  it('exactement 3 chapitres, numérotés comme les domaines du programme', () => {
    expect(CHAPITRES.map((c) => c.id)).toEqual([1, 2, 3]);
    expect(CHAPITRES.map((c) => c.unites)).toEqual(PASSIVE_DOMAINS.map((d) => [...d.unitIds]));
    for (const c of CHAPITRES) {
      expect(c.ar.length).toBeGreaterThan(0);
      expect(c.ar).toBe(PASSIVE_DOMAINS.find((d) => d.id === c.id)!.titleAr);
      expect(c.unites.length).toBeGreaterThan(0);
    }
  });

  it('la couverture des 11 unités est exacte et sans doublon', () => {
    const toutes = CHAPITRES.flatMap((c) => c.unites).sort((a, b) => a - b);
    expect(toutes).toEqual(INITIAL_UNITS.map((u) => u.id));
    expect(new Set(toutes).size).toBe(toutes.length);
  });

  it('les heures de chaque chapitre sont la somme du référentiel officiel', () => {
    for (const c of CHAPITRES) {
      const attendu = PROGRESSION_OFFICIELLE
        .filter((p) => p.domaine === c.id)
        .reduce((s, p) => s + p.heures, 0);
      expect(c.heures).toBe(attendu);
    }
    const totalRef = PROGRESSION_OFFICIELLE.reduce((s, p) => s + p.heures, 0);
    expect(CHAPITRES.reduce((s, c) => s + c.heures, 0)).toBe(totalRef);
  });

  it('chaque unité connaît son chapitre, et réciproquement', () => {
    expect(chapitreDUnite(1)!.id).toBe(1);
    expect(chapitreDUnite(6)!.id).toBe(2);
    expect(chapitreDUnite(11)!.id).toBe(3);
    expect(unitesDuChapitre(2)).toEqual([6, 7, 8]);
    expect(unitesDuChapitre(99)).toEqual([]);
  });
});

describe('le chapitre actif — store partagé', () => {
  it('défaut : le premier chapitre du programme', () => {
    expect(lireChapitreActif()).toBe(1);
  });

  it('change le chapitre et persiste', () => {
    definirChapitreActif(3);
    expect(lireChapitreActif()).toBe(3);
    expect(localStorage.getItem('kunz-chapitre-actif')).toBe('3');
  });

  it('refuse un chapitre inconnu sans toucher à la sélection', () => {
    definirChapitreActif(2);
    definirChapitreActif(99);
    expect(lireChapitreActif()).toBe(2);
  });

  it('filtrerParChapitre ne garde que les unités du chapitre', () => {
    const cible = INITIAL_UNITS.filter((u) => u.id === 6 || u.id === 11);
    expect(filtrerParChapitre(cible, 2).map((u) => u.id)).toEqual([6]);
    expect(filtrerParChapitre(cible, 3).map((u) => u.id)).toEqual([11]);
  });
});
