// profilErreurs.test.ts — LA MÉMOIRE DU GUIDE : utile, honnête, et locale.
//
// Ce qui compte :
//   1. elle ne retient QUE des erreurs que l'application sait expliquer ;
//   2. elle ne quitte PAS le téléphone (aucune requête, promesse §3) ;
//   3. elle ne parle pas pour ne rien dire (une seule occurrence = silence) ;
//   4. elle ne se laisse pas corrompre par un stockage abîmé.
import { describe, expect, it, beforeEach, vi } from 'vitest';
import {
  effacerProfilErreurs,
  enregistrerErreurs,
  erreurDominante,
  oublierErreur,
  profilErreurs,
  profilPourLeGuide,
  resumeProfilAr,
  totalErreurs,
} from '../profilErreurs';
import { ERROR_TAXONOMY } from '../../data/methodologyEngine';
import { messagePersonnalise } from '../../data/capitaine';

// Deux codes réels de la taxonomie publiée.
const CODE_A = 'premature_interpretation'; // تفسير مبكر أثناء التحليل
const CODE_B = 'missing_unit'; // غياب الوحدة القياسية

beforeEach(() => {
  localStorage.clear();
});

describe('enregistrement', () => {
  it('un profil neuf est vide (cas normal du premier lancement)', () => {
    expect(totalErreurs()).toBe(0);
    expect(erreurDominante()).toBeNull();
    expect(profilPourLeGuide()).toBeNull();
  });

  it('enregistre des codes réels et compte les occurrences', () => {
    expect(enregistrerErreurs([CODE_A, CODE_A, CODE_B])).toBe(3);
    expect(profilErreurs()[CODE_A].n).toBe(2);
    expect(profilErreurs()[CODE_B].n).toBe(1);
    expect(totalErreurs()).toBe(3);
  });

  it('IGNORE un code inconnu de la taxonomie', () => {
    // Un code orphelin produirait un message de guide vide — ou inventé.
    expect(enregistrerErreurs(['code_invente', CODE_A])).toBe(1);
    expect(profilErreurs().code_invente).toBeUndefined();
    expect(totalErreurs()).toBe(1);
  });

  it('ignore ce qui n’est pas une liste de chaînes', () => {
    expect(enregistrerErreurs(null)).toBe(0);
    expect(enregistrerErreurs('premature_interpretation')).toBe(0);
    expect(enregistrerErreurs([42, null, { tag: CODE_A }])).toBe(0);
    expect(totalErreurs()).toBe(0);
  });

  it('mémorise le thème travaillé, sans doublon et du plus récent au plus ancien', () => {
    enregistrerErreurs([CODE_A], { theme: 'التركيب الضوئي' });
    enregistrerErreurs([CODE_A], { theme: 'المناعة' });
    enregistrerErreurs([CODE_A], { theme: 'التركيب الضوئي' }); // déjà vu
    const themes = profilErreurs()[CODE_A].themes;
    expect(themes[0]).toBe('التركيب الضوئي');
    expect(themes).toContain('المناعة');
    expect(themes.filter((t) => t === 'التركيب الضوئي')).toHaveLength(1);
  });

  it('tronque un thème démesuré au lieu de stocker n’importe quoi', () => {
    enregistrerErreurs([CODE_A], { theme: 'x'.repeat(500) });
    expect(profilErreurs()[CODE_A].themes[0].length).toBeLessThanOrEqual(120);
  });
});

describe('erreur dominante : ce qu’il faut travailler maintenant', () => {
  it('c’est la plus FRÉQUENTE', () => {
    enregistrerErreurs([CODE_B]);
    enregistrerErreurs([CODE_A, CODE_A]);
    expect(erreurDominante()?.code).toBe(CODE_A);
  });

  it('à égalité de fréquence, la plus RÉCENTE gagne', () => {
    const passe = new Date('2026-10-01T10:00:00.000Z');
    const recent = new Date('2026-10-14T10:00:00.000Z');
    enregistrerErreurs([CODE_A], { quand: passe });
    enregistrerErreurs([CODE_B], { quand: recent });
    expect(erreurDominante()?.code).toBe(CODE_B);
  });

  it('à égalité parfaite, le classement est STABLE (pas de clignotement)', () => {
    const quand = new Date('2026-10-14T10:00:00.000Z');
    enregistrerErreurs([CODE_A], { quand });
    enregistrerErreurs([CODE_B], { quand });
    const premier = erreurDominante()?.code;
    for (let i = 0; i < 5; i += 1) {
      expect(erreurDominante()?.code).toBe(premier);
    }
  });

  it('elle porte le nom arabe ET la contre-mesure publiée par la taxonomie', () => {
    enregistrerErreurs([CODE_A, CODE_A]);
    const d = erreurDominante()!;
    expect(d.nomAr).toBe(ERROR_TAXONOMY[CODE_A].nameAr);
    expect(d.contreMesureAr).toBe(ERROR_TAXONOMY[CODE_A].counterActionAr);
    expect(d.occurrences).toBe(2);
  });

  it('les thèmes remontent avec l’erreur (où l’élève se trompe)', () => {
    enregistrerErreurs([CODE_A, CODE_A], { theme: 'المناعة' });
    expect(erreurDominante()?.themes).toContain('المناعة');
  });
});

describe('le guide ne parle que s’il sait quelque chose', () => {
  it('une seule occurrence → silence', () => {
    enregistrerErreurs([CODE_A]);
    expect(resumeProfilAr()).toBeNull();
    expect(messagePersonnalise(profilPourLeGuide())).toBeNull();
  });

  it('deux occurrences → le guide nomme l’erreur', () => {
    enregistrerErreurs([CODE_A, CODE_A]);
    const resume = resumeProfilAr();
    expect(resume).toContain(ERROR_TAXONOMY[CODE_A].nameAr);
    expect(messagePersonnalise(profilPourLeGuide())).toContain(ERROR_TAXONOMY[CODE_A].nameAr);
  });

  it('profilPourLeGuide() a exactement la forme attendue par le guide', () => {
    enregistrerErreurs([CODE_B, CODE_B]);
    const p = profilPourLeGuide()!;
    expect(Object.keys(p).sort()).toEqual(['codeDominant', 'contreMesureAr', 'nomAr', 'occurrences']);
    expect(p.codeDominant).toBe(CODE_B);
    expect(p.occurrences).toBe(2);
  });
});

describe('oubli et remise à zéro', () => {
  it('oublier un type le retire du profil', () => {
    enregistrerErreurs([CODE_A, CODE_B]);
    oublierErreur(CODE_A);
    expect(profilErreurs()[CODE_A]).toBeUndefined();
    expect(profilErreurs()[CODE_B].n).toBe(1);
  });

  it('oublier un code absent ne casse rien', () => {
    expect(() => oublierErreur('jamais_vu')).not.toThrow();
  });

  it('effacer remet tout à zéro', () => {
    enregistrerErreurs([CODE_A]);
    effacerProfilErreurs();
    expect(totalErreurs()).toBe(0);
    expect(erreurDominante()).toBeNull();
  });
});

describe('robustesse du stockage', () => {
  it('un profil illisible est traité comme vide (jamais une exception)', () => {
    for (const mauvais of ['pas du json', '[]', '"texte"', 'null', '{"a":1}']) {
      localStorage.setItem('boussole_profil_erreurs', mauvais);
      expect(() => profilErreurs(), mauvais).not.toThrow();
      expect(totalErreurs(), mauvais).toBe(0);
    }
  });

  it('un compteur corrompu est écarté sans emporter les autres', () => {
    localStorage.setItem(
      'boussole_profil_erreurs',
      JSON.stringify({
        [CODE_A]: { n: 3, dernier: '2026-10-01', themes: ['x'] },
        corrompu: { n: 'beaucoup' },
        negatif: { n: -5 },
        zero: { n: 0 },
      }),
    );
    expect(totalErreurs()).toBe(3);
    expect(profilErreurs()[CODE_A].n).toBe(3);
    expect(profilErreurs().corrompu).toBeUndefined();
    expect(profilErreurs().negatif).toBeUndefined();
  });

  it('un stockage indisponible ne fait pas planter le parcours', () => {
    const vrai = localStorage;
    vi.stubGlobal('localStorage', {
      getItem: () => {
        throw new Error('bloqué');
      },
      setItem: () => {
        throw new Error('bloqué');
      },
      removeItem: () => {
        throw new Error('bloqué');
      },
    });
    expect(() => enregistrerErreurs([CODE_A])).not.toThrow();
    expect(profilErreurs()).toEqual({});
    expect(erreurDominante()).toBeNull();
    vi.stubGlobal('localStorage', vrai);
  });
});

describe('LA PROMESSE : cette mémoire ne quitte pas le téléphone', () => {
  it('le module n’appelle AUCUNE API réseau', () => {
    // Politique §3 : « في وضع الزائر: لا يغادر أي شيء هاتفك إطلاقا ».
    // Un profil envoyé au serveur sans le dire romprait la promesse.
    const fs = require('node:fs') as typeof import('node:fs');
    const src = fs.readFileSync('src/utils/profilErreurs.ts', 'utf-8');
    const code = src
      .split('\n')
      .filter((l) => !/^\s*(\/\/|\*|\/\*)/.test(l)) // les commentaires EXPLIQUENT le danger
      .join('\n');
    for (const interdit of ['fetch(', 'XMLHttpRequest', 'navigator.sendBeacon', 'axios']) {
      expect(code, `appel réseau interdit : ${interdit}`).not.toContain(interdit);
    }
  });

  it('il n’utilise que localStorage (le stockage de l’appareil)', () => {
    const fs = require('node:fs') as typeof import('node:fs');
    const src = fs.readFileSync('src/utils/profilErreurs.ts', 'utf-8');
    expect(src).toContain('localStorage');
  });

  it('il ne stocke AUCUN identifiant d’élève', () => {
    enregistrerErreurs([CODE_A, CODE_A], { theme: 'المناعة' });
    const brut = localStorage.getItem('boussole_profil_erreurs') ?? '';
    for (const interdit of ['studentId', 'student_id', 'email', '@']) {
      expect(brut, `le profil ne doit pas contenir « ${interdit} »`).not.toContain(interdit);
    }
  });
});
