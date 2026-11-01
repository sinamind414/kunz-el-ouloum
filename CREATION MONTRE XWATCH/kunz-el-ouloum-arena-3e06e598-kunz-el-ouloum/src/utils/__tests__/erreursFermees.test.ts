// erreursFermees.test.ts — LE CAPITAL QUI NE SE REMET PAS À ZÉRO.
//
// Défaut réparé le 15/10/2026 : `oublierErreur()` existait — la fonction qui
// FERME une erreur — et n'était appelée nulle part sauf dans son propre test.
// Or c'est l'événement le plus précieux du produit : le seul capital qui monte
// même quand la série casse, le seul qui se comporte comme des intérêts composés.
//
// Ce fichier verrouille trois choses, et la troisième est la plus importante :
//   1. une erreur fermée quitte le profil et entre au registre ;
//   2. le capital se compte, et il ne se remet jamais à zéro tout seul ;
//   3. une erreur « fermée » qui REVIENT est comptée comme ROUVERTE — c'est le
//      révélateur le plus honnête du produit, celui qui dit si la fermeture
//      valait quelque chose.
import { beforeEach, describe, expect, it } from 'vitest';
import {
  capitalErreurs,
  cloreErreursAbsentes,
  effacerProfilErreurs,
  enregistrerErreurs,
  erreursFermees,
  fermerErreur,
  oublierErreur,
  phraseErreurFermeeAr,
  profilErreurs,
} from '../profilErreurs';

const CODE_A = 'premature_interpretation';
const CODE_B = 'missing_unit';
const FICHIER_RECU = 'reel_fichier_globules_rouges';

beforeEach(() => {
  localStorage.clear();
});

describe('fermer une erreur — l’évènement, pas la remise à zéro', () => {
  it('elle quitte le profil ouvert ET entre au registre', () => {
    enregistrerErreurs([CODE_A, CODE_B]);
    expect(fermerErreur(CODE_A, { theme: 'المناعة' })).toBe(true);
    // Le profil ouvert ne la contient plus…
    expect(profilErreurs()[CODE_A]).toBeUndefined();
    expect(profilErreurs()[CODE_B]).toBeDefined();
    // …mais le registre garde la trace, avec son thème.
    const fermees = erreursFermees();
    expect(fermees).toHaveLength(1);
    expect(fermees[0]!.code).toBe(CODE_A);
    expect(fermees[0]!.theme).toBe('المناعة');
    expect(fermees[0]!.par).toBe('production_propre');
  });

  it('fermer une erreur jamais ouverte n’invente rien', () => {
    // Sinon le capital serait gonflé par des évènements qui n'ont pas eu lieu —
    // le pire défaut possible pour un chiffre qu'on montre à l'élève.
    expect(fermerErreur(CODE_A)).toBe(false);
    expect(erreursFermees()).toHaveLength(0);
  });

  it('`oublier` EFFACE, `fermer` CONSIGNE — et ce n’est pas la même chose', () => {
    enregistrerErreurs([CODE_A]);
    oublierErreur(CODE_A);
    expect(profilErreurs()[CODE_A]).toBeUndefined();
    expect(erreursFermees(), 'oublier ne doit pas créditer un capital').toHaveLength(0);
  });

  it('fermer deux fois le même code ne le compte pas deux fois', () => {
    enregistrerErreurs([CODE_A]);
    fermerErreur(CODE_A, { par: 'reprise_manuelle' });
    enregistrerErreurs([CODE_A]);
    fermerErreur(CODE_A, { par: 'production_propre' });
    const fermees = erreursFermees();
    expect(fermees).toHaveLength(1);
    // C'est la fermeture la PLUS RÉCENTE qui décrit l'état courant.
    expect(fermees[0]!.par).toBe('production_propre');
  });
});

describe('le capital : deux chiffres, et le second juge le premier', () => {
  it('un profil neuf n’a rien fermé et ne prétend rien', () => {
    expect(capitalErreurs()).toEqual({ fermees: 0, rouvertes: 0, total: 0 });
  });

  it('deux erreurs fermées, une revenue → un capital honnête', () => {
    enregistrerErreurs([CODE_A, CODE_B]);
    fermerErreur(CODE_A);
    fermerErreur(CODE_B);
    expect(capitalErreurs()).toEqual({ fermees: 2, rouvertes: 0, total: 2 });

    // L'élève rate à nouveau sur le même type : l'erreur était « fermée ».
    enregistrerErreurs([CODE_A]);
    const c = capitalErreurs();
    expect(c.total).toBe(2);
    expect(c.rouvertes).toBe(1);
    expect(c.fermees).toBe(1);
  });

  it('une erreur rouverte peut être refermée, et elle compte de nouveau', () => {
    enregistrerErreurs([CODE_A]);
    fermerErreur(CODE_A);
    enregistrerErreurs([CODE_A]); // rouverte
    expect(capitalErreurs().rouvertes).toBe(1);
    fermerErreur(CODE_A); // refermée : la réouverture est abandonnée
    expect(capitalErreurs()).toEqual({ fermees: 1, rouvertes: 0, total: 1 });
  });

  it('le registre ne se remet PAS à zéro quand la série casse', () => {
    // C'est tout l'intérêt du chiffre : il ne dépend d'aucune assiduité.
    enregistrerErreurs([CODE_A]);
    fermerErreur(CODE_A);
    // …aucune activité pendant trois semaines…
    expect(capitalErreurs().fermees).toBe(1);
  });

  it('`effacerProfilErreurs` remet les DEUX à zéro (bouton « repartir de zéro »)', () => {
    enregistrerErreurs([CODE_A]);
    fermerErreur(CODE_A);
    effacerProfilErreurs();
    expect(capitalErreurs()).toEqual({ fermees: 0, rouvertes: 0, total: 0 });
    expect(profilErreurs()).toEqual({});
  });

  it('erreursFermees(false) cache les rouvertes — pour la vue « acquis »', () => {
    enregistrerErreurs([CODE_A, CODE_B]);
    fermerErreur(CODE_A);
    fermerErreur(CODE_B);
    enregistrerErreurs([CODE_B]);
    expect(erreursFermees(true)).toHaveLength(2);
    expect(erreursFermees(false).map((e) => e.code)).toEqual([CODE_A]);
  });
});

describe('cloreErreursAbsentes — le pont avec la boucle du coach', () => {
  it('ferme l’erreur prescrite qui a DISPARU de la production', () => {
    enregistrerErreurs([CODE_A]);
    const fermees = cloreErreursAbsentes([], {
      prescrites: [{ code: CODE_A }],
    });
    expect(fermees.map((f) => f.code)).toEqual([CODE_A]);
    expect(profilErreurs()[CODE_A]).toBeUndefined();
  });

  it('ne ferme RIEN si l’erreur est encore détectée', () => {
    enregistrerErreurs([CODE_A]);
    const fermees = cloreErreursAbsentes([CODE_A], { prescrites: [{ code: CODE_A }] });
    expect(fermees).toHaveLength(0);
    expect(profilErreurs()[CODE_A]).toBeDefined();
  });

  it('thèmes CONNUS et différents → aucune conclusion tirée', () => {
    // La production portait sur autre chose : son absence ne prouve pas que
    // l'élève a réglé cette erreur.
    enregistrerErreurs([CODE_A], { theme: 'المناعة' });
    const fermees = cloreErreursAbsentes([], {
      theme: 'التركيب الضوئي',
      prescrites: [{ code: CODE_A, theme: 'المناعة' }],
    });
    expect(fermees).toHaveLength(0);
    expect(profilErreurs()[CODE_A]).toBeDefined();
  });

  it('même thème → la fermeture a lieu', () => {
    enregistrerErreurs([CODE_A], { theme: 'المناعة' });
    const fermees = cloreErreursAbsentes([], {
      theme: 'المناعة',
      prescrites: [{ code: CODE_A, theme: 'المناعة' }],
    });
    expect(fermees.map((f) => f.code)).toEqual([CODE_A]);
  });

  it('thème inconnu d’un côté → on ferme quand même, et c’est assumé', () => {
    // Sans cela le registre ne se remplirait jamais, et une boucle qui ne ferme
    // rien ne sert à rien. La limite est documentée dans le module.
    enregistrerErreurs([CODE_A]);
    expect(cloreErreursAbsentes([], { prescrites: [{ code: CODE_A }] })).toHaveLength(1);
  });

  it('plusieurs erreurs prescrites : seules celles qui ont disparu se ferment', () => {
    enregistrerErreurs([CODE_A, CODE_B]);
    const fermees = cloreErreursAbsentes([CODE_B], {
      prescrites: [{ code: CODE_A }, { code: CODE_B }],
    });
    expect(fermees.map((f) => f.code)).toEqual([CODE_A]);
    expect(profilErreurs()[CODE_B]).toBeDefined();
  });

  it('fermer une erreur jamais ouverte ne produit aucun crédit', () => {
    const fermees = cloreErreursAbsentes([], { prescrites: [{ code: FICHIER_RECU }] });
    expect(fermees).toHaveLength(0);
    expect(capitalErreurs().fermees).toBe(0);
  });
});

describe('la phrase de crédit — la seule félicitation mesurée du produit', () => {
  it('nomme l’erreur par son nom publié, jamais un encouragement générique', () => {
    const phrase = phraseErreurFermeeAr(CODE_B, 'المناعة');
    expect(phrase).toContain('خرج من دفترك');
    expect(phrase).toContain('المناعة');
    // La contrepartie de la récompense immédiate : elle ne s'efface pas.
    expect(phrase).toContain('لا يُلغيه');
  });

  it('un code inconnu de la taxonomie ne fait pas inventer un nom', () => {
    const phrase = phraseErreurFermeeAr('code_qui_nexiste_pas');
    expect(phrase).toContain('خطأ واحد خرج من دفترك');
    expect(phrase).not.toContain('undefined');
  });

  it('la sortie reste en فصحى, sans darija recopiée', () => {
    const darija = ['واش', 'كيفاش', 'راني', 'مافهمتش', 'عيان'];
    const phrase = phraseErreurFermeeAr(CODE_A, 'المناعة');
    for (const mot of darija) expect(phrase.includes(mot)).toBe(false);
  });
});

describe('robustesse du registre', () => {
  it('un registre illisible est traité comme vide', () => {
    localStorage.setItem('boussole_erreurs_fermees', '{pas du json');
    expect(erreursFermees()).toEqual([]);
    expect(capitalErreurs()).toEqual({ fermees: 0, rouvertes: 0, total: 0 });
  });

  it('une entrée corrompue est écartée sans emporter les autres', () => {
    localStorage.setItem(
      'boussole_erreurs_fermees',
      JSON.stringify([
        { code: CODE_A, fermeMs: 1, par: 'production_propre' },
        { code: 42 },
        { fermeMs: 2 },
      ]),
    );
    expect(erreursFermees().map((e) => e.code)).toEqual([CODE_A]);
  });
});
