// deepLinkInterne.lock.test.ts — validation des paramètres de lien profond.
//
// Ici (et seulement ici, dans un TEST) on importe la banque BAC complète :
// elle sert de référence pour prouver que le validateur léger du bundle
// d'entrée accepte exactement les 65 ids réels. Aucune donnée lourde n'est
// ainsi ajoutée au premier écran (verrou poidsEntree.verrou.test.ts).

import { describe, expect, it } from 'vitest';
import { BAC_IDEAS, INCOMPLETE_SUJETS } from '../data/bacSessionIndex';
import { PARCOURS_FLAT } from '../lib/parcours/parcoursPath';
import {
  UNITES_REELLES,
  estIdeeBacValide,
  lireDeepLinkInterne,
  queryDeUrl,
} from './deepLinkInterne';
import { resoudreRoute } from './navigationHash';

const LECON = PARCOURS_FLAT.find((i) => i.kind === 'lesson' && i.lessonKey)!;
const IDEE = BAC_IDEAS[0].id;

describe('estIdeeBacValide — recoupé avec la banque officielle', () => {
  it('accepte les 65 ids réels 2016→2026', () => {
    expect(BAC_IDEAS).toHaveLength(65);
    for (const idee of BAC_IDEAS) {
      expect(estIdeeBacValide(idee.id), `${idee.id} refusé à tort`).toBe(true);
    }
  });

  it('refuse le trou déclaré 2021 S2 E1 et toute idée inventée', () => {
    expect(INCOMPLETE_SUJETS).toHaveLength(1);
    expect(estIdeeBacValide('bac2021_s2_e1')).toBe(false);
    expect(estIdeeBacValide('bac2030_s1_e1')).toBe(false);
    expect(estIdeeBacValide('bac2025_s3_e1')).toBe(false);
    expect(estIdeeBacValide('bac2025_s1_e4')).toBe(false);
    expect(estIdeeBacValide('../../etc/passwd')).toBe(false);
    expect(estIdeeBacValide('')).toBe(false);
  });
});

describe('unités réelles — aucune unité 12 imaginaire', () => {
  it('dérive la liste de PARCOURS_FLAT', () => {
    expect(UNITES_REELLES).toEqual(
      [...new Set(PARCOURS_FLAT.map((i) => i.unitId))].sort((a, b) => a - b),
    );
    expect(UNITES_REELLES).not.toContain(12);
  });
});

describe('lireDeepLinkInterne — une seule cible, validée', () => {
  it('?lecon= ouvre une leçon du parcours avec SA unité et SON type', () => {
    expect(lireDeepLinkInterne(`?lecon=${encodeURIComponent(LECON.lessonKey!)}`)).toEqual({
      lecon: {
        key: LECON.lessonKey,
        kind: LECON.lessonKind ?? 'html',
        unitId: LECON.unitId,
      },
    });
  });

  it('une clé de leçon inconnue est IGNORÉE, jamais transmise à LessonsView', () => {
    expect(lireDeepLinkInterne('?lecon=lecon-qui-nexiste-pas')).toBeNull();
  });

  it('?qcm= accepte une unité réelle et refuse une unité inventée', () => {
    const unite = UNITES_REELLES[0];
    expect(lireDeepLinkInterne(`?qcm=${unite}`)).toEqual({ qcm: unite });
    expect(lireDeepLinkInterne('?qcm=12')).toBeNull();
    expect(lireDeepLinkInterne('?qcm=abc')).toBeNull();
  });

  it('?examen= n’accepte que qcm | bac', () => {
    expect(lireDeepLinkInterne('?examen=bac')).toEqual({ examen: 'bac' });
    expect(lireDeepLinkInterne('?examen=qcm')).toEqual({ examen: 'qcm' });
    expect(lireDeepLinkInterne('?examen=officiel')).toBeNull();
  });

  it('priorité lecon > qcm > examen (une seule cible d’écran)', () => {
    const q = `?lecon=${encodeURIComponent(LECON.lessonKey!)}&qcm=1&examen=bac`;
    expect(lireDeepLinkInterne(q)).toEqual({
      lecon: {
        key: LECON.lessonKey,
        kind: LECON.lessonKind ?? 'html',
        unitId: LECON.unitId,
      },
    });
    expect(lireDeepLinkInterne('?qcm=1&examen=bac')).toEqual({ qcm: 1 });
  });

  it('?idee= est indépendant et validé', () => {
    expect(lireDeepLinkInterne(`?idee=${IDEE}`)).toEqual({ idee: IDEE });
    expect(lireDeepLinkInterne('?idee=bac2021_s2_e1')).toBeNull();
  });

  it('query vide ou inconnue → null', () => {
    expect(lireDeepLinkInterne('')).toBeNull();
    expect(lireDeepLinkInterne('?autre=1')).toBeNull();
  });
});

describe('URL — paramètres conservés dans la route canonique', () => {
  it('queryDeUrl privilégie le hash, sinon le chemin', () => {
    expect(queryDeUrl('#/apprentissage/cours?lecon=x', '?qcm=2')).toBe('lecon=x');
    expect(queryDeUrl('#/apprentissage/cours', '?qcm=2')).toBe('qcm=2');
    expect(queryDeUrl('', '')).toBe('');
  });

  it('resoudreRoute garde ?… sans casser la casse des clés', () => {
    const q = `?lecon=${encodeURIComponent(LECON.lessonKey!)}`;
    expect(resoudreRoute('/', `#/apprentissage/cours${q}`)).toEqual({
      tab: 'lesson',
      canonique: `#/apprentissage/cours${q}`,
    });
    expect(resoudreRoute(`/apprentissage/cours${q}`, '')).toEqual({
      tab: 'lesson',
      canonique: `#/apprentissage/cours${q}`,
    });
  });

  it('un hash sans paramètre reste inchangé (rétrocompatibilité)', () => {
    expect(resoudreRoute('/', '#/apprentissage/revision')).toEqual({
      tab: 'reviser',
      canonique: '#/apprentissage/revision',
    });
  });
});
