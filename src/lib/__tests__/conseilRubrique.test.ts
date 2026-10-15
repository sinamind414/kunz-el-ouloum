// conseilRubrique.test.ts — LE GUIDE ACCUEILLE UNE FOIS, PUIS SE TAIT.
//
// Demande d'origine : « le tutor parle quand tu rentres à une rubrique ». La
// partie facile est d'afficher un bandeau. La partie difficile est de ne PAS le
// réafficher : un guide qui répète la même consigne à chaque entrée devient du
// décor, et l'élève cesse de le lire au bout de trois fois. Ces tests portent
// donc surtout sur les cas de SILENCE.
import { describe, expect, it, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  CLE_CONSEILS_VUS,
  doitParlerRubrique,
  marquerRubriqueVue,
  oublierConseilsVus,
  rubriquesVues,
} from '../conseilRubrique';
import { CONSEILS_RUBRIQUES, conseilDeRubrique } from '../../data/conseilsRubrique';

const app = readFileSync(resolve(process.cwd(), 'src/App.tsx'), 'utf8');
const bandeau = readFileSync(resolve(process.cwd(), 'src/components/BandeauConseilRubrique.tsx'), 'utf8');

/** Identifiants d'onglet réellement gérés par App.tsx. */
const ONGLETS_REELS = new Set([
  'splash', 'reviser', 'review', 'stats', 'badges', 'methodology', 'bootcamp',
  'lesson', 'workshop', 'animations', 'situations', 'schemas', 'training',
  'examens', 'plan', 'bacideas', 'focus', 'tadwin', 'mindmap', 'chat',
  'teacher', 'home',
]);

beforeEach(() => {
  window.localStorage.clear();
});

describe('la décision de parler — et surtout celle de se taire', () => {
  it('elle parle la PREMIÈRE fois, jamais la deuxième', () => {
    expect(doitParlerRubrique('training', [], true)).toBe(true);
    expect(doitParlerRubrique('training', ['training'], true)).toBe(false);
  });

  it('une rubrique sans conseil ne parle pas', () => {
    expect(doitParlerRubrique('training', [], false)).toBe(false);
  });

  it('elle ne parle pas de l’écran de démarrage', () => {
    expect(doitParlerRubrique('splash', [], true)).toBe(false);
  });

  it('un identifiant vide ou absent ne déclenche rien', () => {
    expect(doitParlerRubrique('', [], true)).toBe(false);
    expect(doitParlerRubrique(null, [], true)).toBe(false);
    expect(doitParlerRubrique(undefined, [], true)).toBe(false);
  });

  it('l’ordre des rubriques déjà vues est indifférent', () => {
    expect(doitParlerRubrique('focus', ['training', 'examens'], true)).toBe(true);
    expect(doitParlerRubrique('examens', ['training', 'examens'], true)).toBe(false);
  });
});

describe('la mémoire des rubriques expliquées', () => {
  it('une rubrique vue une fois reste vue', () => {
    marquerRubriqueVue('methodology');
    expect(rubriquesVues()).toContain('methodology');
    expect(doitParlerRubrique('methodology', rubriquesVues(), true)).toBe(false);
  });

  it('marquer deux fois la même rubrique ne la duplique pas', () => {
    marquerRubriqueVue('training');
    marquerRubriqueVue('training');
    expect(rubriquesVues().filter((r) => r === 'training')).toHaveLength(1);
  });

  it('la plus récente passe en tête (la liste est bornée)', () => {
    marquerRubriqueVue('training');
    marquerRubriqueVue('focus');
    expect(rubriquesVues()[0]).toBe('focus');
  });

  it('un stockage corrompu ne fait pas planter et n’affiche rien de faux', () => {
    window.localStorage.setItem(CLE_CONSEILS_VUS, '{{{ pas du json');
    expect(rubriquesVues()).toEqual([]);
    window.localStorage.setItem(CLE_CONSEILS_VUS, '{"pas":"un tableau"}');
    expect(rubriquesVues()).toEqual([]);
    // Un tableau contenant n'importe quoi : on ne garde que les chaînes.
    window.localStorage.setItem(CLE_CONSEILS_VUS, '[42, null, "focus"]');
    expect(rubriquesVues()).toEqual(['focus']);
  });

  it('oublier remet le guide en position de réexpliquer', () => {
    marquerRubriqueVue('examens');
    oublierConseilsVus();
    expect(rubriquesVues()).toEqual([]);
    expect(doitParlerRubrique('examens', rubriquesVues(), true)).toBe(true);
  });
});

describe('les conseils sont des données valides', () => {
  it('chaque conseil vise un onglet qui EXISTE dans App.tsx', () => {
    // Leçon apprise : `erreurs` et `entrainement` étaient des identifiants
    // inventés, et le bouton du capitaine menait dans le vide. Un conseil rangé
    // sous une rubrique inexistante ne s'afficherait jamais — silencieusement.
    for (const c of CONSEILS_RUBRIQUES) {
      expect(ONGLETS_REELS.has(c.rubrique), `« ${c.rubrique} » n’est pas un onglet`).toBe(true);
      expect(app, `App.tsx ne gère pas l’onglet « ${c.rubrique} »`).toContain(`currentTab === '${c.rubrique}'`);
    }
  });

  it('aucune rubrique en double', () => {
    expect(new Set(CONSEILS_RUBRIQUES.map((c) => c.rubrique)).size).toBe(CONSEILS_RUBRIQUES.length);
  });

  it('chaque conseil porte une idée ET un geste, jamais l’un sans l’autre', () => {
    for (const c of CONSEILS_RUBRIQUES) {
      // Seuil à 50 et non 60 : l'arabe est une langue dense, « جلسة واحدة = هدف
      // واحد. الهدف الغامض يتحوّل إلى تصفّح. » est une idée complète en 53
      // caractères. Allonger un bon conseil pour atteindre un seuil serait
      // ajouter du remplissage — exactement ce que ce fichier interdit.
      expect(c.conseilAr.length, `${c.rubrique} : conseil trop court`).toBeGreaterThan(50);
      expect(c.gesteAr.length, `${c.rubrique} : geste trop long`).toBeLessThan(70);
      expect(c.gesteAr.length, `${c.rubrique} : geste trop court`).toBeGreaterThan(15);
    }
  });

  it('aucun conseil n’est une phrase d’encouragement', () => {
    // « Bravo », « courage », « bonne chance » : ce sont des mots qui ne changent
    // aucun geste. Un professeur utile donne une consigne, pas un applaudissement.
    for (const c of CONSEILS_RUBRIQUES) {
      for (const creux of ['بالتوفيق', 'أحسنت', 'شجاعة', 'لا تستسلم', 'ثابر']) {
        expect(c.conseilAr, `${c.rubrique} contient « ${creux} »`).not.toContain(creux);
      }
    }
  });

  it('deux rubriques ne reçoivent pas le même texte', () => {
    // Le signe d'un remplissage automatique : des conseils interchangeables.
    expect(new Set(CONSEILS_RUBRIQUES.map((c) => c.conseilAr)).size).toBe(CONSEILS_RUBRIQUES.length);
  });

  it('une rubrique absente est silencieuse, et c’est normal', () => {
    expect(conseilDeRubrique('badges')).toBeNull();
    expect(conseilDeRubrique('teacher')).toBeNull();
    expect(conseilDeRubrique(null)).toBeNull();
  });
});

describe('le branchement dans App.tsx', () => {
  it('le bandeau est rendu et le rappel existe', () => {
    // Le testid du bandeau vit dans le COMPOSANT (il y est vérifié plus bas) ;
    // ici on vérifie ce qui appartient à App.tsx : le rendu et le bouton de rappel.
    expect(app).toContain('<BandeauConseilRubrique');
    expect(app).toContain('data-testid="conseil-rubrique-ouvrir"');
  });

  it('le guide se TAIT pendant une épreuve', () => {
    // Pendant une épreuve chronométrée, aucune parole : c'est la règle du §7 du
    // cahier des charges, déjà appliquée à la bulle.
    const bloc = app.slice(app.indexOf('<BandeauConseilRubrique') - 320);
    expect(bloc).toContain('!epreuveEnCours');
  });

  it('le conseil est mémorisé À L’AFFICHAGE, pas à la fermeture', () => {
    // Sinon un élève qui change d'onglet sans lire revoit le même discours à
    // l'infini — et l'application devient un perroquet.
    const bloc = app.slice(app.indexOf('doitParlerRubrique(currentTab'));
    expect(bloc.slice(0, 400)).toContain('marquerRubriqueVue(currentTab)');
    expect(app).toContain('setConseilFerme(false)');
  });

  it('le bandeau est fermable par l’élève', () => {
    expect(bandeau).toContain('data-testid="bandeau-conseil-fermer"');
    expect(bandeau).toContain('onFermer');
  });

  it('le bandeau porte le visage du capitaine, une seule fois par écran', () => {
    expect(bandeau).toContain('CAPITAINE_VISAGE_URL');
    expect((bandeau.match(/<img/g) ?? []).length).toBe(1);
  });

  it('le texte du conseil n’est jamais recopié dans le composant', () => {
    // Le composant affiche la donnée ; il ne la fabrique pas. Sans cette garde,
    // un conseil pourrait vivre en dur dans le JSX et échapper aux tests ci-dessus.
    expect(bandeau).not.toMatch(/[ء-ي]{25,}/);
  });
});
