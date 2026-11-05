// conseilRubrique.test.ts — LE GUIDE PARLE À CHAQUE ENTRÉE, EN ROTATION.
//
// Option B (2026-11-05) : le guide parle à chaque entrée de rubrique, pas
// seulement à la première visite. Chaque rubrique a 2 ou 3 conseils en
// rotation — le compteur de visites détermine lequel s'affiche. Ces tests
// portent donc sur la rotation et sur la validité des données.
import { describe, expect, it, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  CLE_VISITES_RUBRIQUES,
  doitParlerRubrique,
  enregistrerVisiteRubrique,
  indiceConseil,
  nbVisitesRubrique,
  oublierVisitesRubriques,
  rubriquesVisitees,
  visitesRubriques,
} from '../conseilRubrique';
import {
  CONSEILS_RUBRIQUES,
  conseilDeRubrique,
  tousLesConseils,
} from '../../data/conseilsRubrique';

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

describe('la décision de parler — option B : à chaque entrée', () => {
  it('elle parle quand la rubrique a un conseil', () => {
    expect(doitParlerRubrique('training', true)).toBe(true);
    expect(doitParlerRubrique('methodology', true)).toBe(true);
  });

  it('elle parle même si la rubrique a déjà été visitée', () => {
    enregistrerVisiteRubrique('training');
    expect(doitParlerRubrique('training', true)).toBe(true);
  });

  it('une rubrique sans conseil ne parle pas', () => {
    expect(doitParlerRubrique('training', false)).toBe(false);
  });

  it('elle ne parle pas de l’écran de démarrage', () => {
    expect(doitParlerRubrique('splash', true)).toBe(false);
  });

  it('un identifiant vide ou absent ne déclenche rien', () => {
    expect(doitParlerRubrique('', true)).toBe(false);
    expect(doitParlerRubrique(null, true)).toBe(false);
    expect(doitParlerRubrique(undefined, true)).toBe(false);
  });
});

describe('la rotation des conseils', () => {
  it('le premier indice est 0 (première visite)', () => {
    expect(indiceConseil('training', 2)).toBe(0);
  });

  it('l’indice tourne après une visite (1 % 2 = 1)', () => {
    enregistrerVisiteRubrique('training');
    expect(indiceConseil('training', 2)).toBe(1);
  });

  it('l’indice revient à 0 après deux visites (2 % 2 = 0)', () => {
    enregistrerVisiteRubrique('training');
    enregistrerVisiteRubrique('training');
    expect(indiceConseil('training', 2)).toBe(0);
  });

  it('chaque rubrique a son propre compteur', () => {
    enregistrerVisiteRubrique('training');
    expect(indiceConseil('methodology', 2)).toBe(0);
    expect(indiceConseil('training', 2)).toBe(1);
  });

  it('enregistrer une visite incrémente le compteur', () => {
    expect(nbVisitesRubrique('examens')).toBe(0);
    enregistrerVisiteRubrique('examens');
    expect(nbVisitesRubrique('examens')).toBe(1);
    enregistrerVisiteRubrique('examens');
    expect(nbVisitesRubrique('examens')).toBe(2);
  });

  it('rubriquesVisitees liste les rubriques avec au moins une visite', () => {
    expect(rubriquesVisitees()).toEqual([]);
    enregistrerVisiteRubrique('lesson');
    enregistrerVisiteRubrique('schemas');
    expect(rubriquesVisitees().sort()).toEqual(['lesson', 'schemas']);
  });

  it('oublierVisitesRubriques remet les compteurs à zéro', () => {
    enregistrerVisiteRubrique('focus');
    oublierVisitesRubriques();
    expect(nbVisitesRubrique('focus')).toBe(0);
    expect(indiceConseil('focus', 2)).toBe(0);
  });

  it('un stockage corrompu ne fait pas planter', () => {
    window.localStorage.setItem(CLE_VISITES_RUBRIQUES, '{{{ pas du json');
    expect(visitesRubriques()).toEqual({});
    window.localStorage.setItem(CLE_VISITES_RUBRIQUES, '{"pas":"un objet"}');
    expect(visitesRubriques()).toEqual({});
    window.localStorage.setItem(CLE_VISITES_RUBRIQUES, '{"training": "pas un nombre"}');
    expect(visitesRubriques()).toEqual({});
  });
});

describe('les conseils sont des données valides', () => {
  it('chaque conseil vise un onglet qui EXISTE dans App.tsx', () => {
    for (const cr of CONSEILS_RUBRIQUES) {
      expect(ONGLETS_REELS.has(cr.rubrique), `« ${cr.rubrique} » n’est pas un onglet`).toBe(true);
      expect(app, `App.tsx ne gère pas l’onglet « ${cr.rubrique} »`).toContain(`currentTab === '${cr.rubrique}'`);
    }
  });

  it('aucune rubrique en double', () => {
    expect(new Set(CONSEILS_RUBRIQUES.map((c) => c.rubrique)).size).toBe(CONSEILS_RUBRIQUES.length);
  });

  it('chaque rubrique a au moins 2 conseils', () => {
    for (const cr of CONSEILS_RUBRIQUES) {
      expect(cr.conseils.length, `${cr.rubrique} : pas assez de conseils pour la rotation`).toBeGreaterThanOrEqual(2);
    }
  });

  it('chaque conseil porte une idée ET un geste, jamais l’un sans l’autre', () => {
    for (const c of tousLesConseils()) {
      expect(c.conseilAr.length, `conseil trop court`).toBeGreaterThan(50);
      expect(c.gesteAr.length, `geste trop long`).toBeLessThan(70);
      expect(c.gesteAr.length, `geste trop court`).toBeGreaterThan(15);
    }
  });

  it('aucun conseil n’est une phrase d’encouragement', () => {
    for (const c of tousLesConseils()) {
      for (const creux of ['بالتوفيق', 'أحسنت', 'شجاعة', 'لا تستسلم', 'ثابر']) {
        expect(c.conseilAr, `conseil contient « ${creux} »`).not.toContain(creux);
      }
    }
  });

  it('tous les conseils sont uniques entre eux', () => {
    const tous = tousLesConseils().map((c) => c.conseilAr);
    expect(new Set(tous).size).toBe(tous.length);
  });

  it('une rubrique absente est silencieuse, et c’est normal', () => {
    expect(conseilDeRubrique('badges')).toBeNull();
    expect(conseilDeRubrique('teacher')).toBeNull();
    expect(conseilDeRubrique(null)).toBeNull();
  });
});

describe('le branchement dans App.tsx', () => {
  it('le bandeau est rendu et le rappel existe', () => {
    expect(app).toContain('<BandeauConseilRubrique');
    expect(app).toContain('data-testid="conseil-rubrique-ouvrir"');
  });

  it('le guide se TAIT pendant une épreuve', () => {
    const bloc = app.slice(app.indexOf('<BandeauConseilRubrique') - 320);
    expect(bloc).toContain('!epreuveEnCours');
  });

  it('le conseil est sélectionné par rotation', () => {
    expect(app).toContain('indiceConseil');
    expect(app).toContain('enregistrerVisiteRubrique');
  });

  it('le bandeau est fermable par l’élève', () => {
    expect(bandeau).toContain('data-testid="bandeau-conseil-fermer"');
    expect(bandeau).toContain('onFermer');
  });

  it('le bandeau porte le visage du capitaine', () => {
    expect(bandeau).toContain('CAPITAINE_VISAGE_URL');
    expect((bandeau.match(/<img/g) ?? []).length).toBe(1);
  });

  it('le texte du conseil n’est jamais recopié dans le composant', () => {
    expect(bandeau).not.toMatch(/[ء-ي]{25,}/);
  });
});
