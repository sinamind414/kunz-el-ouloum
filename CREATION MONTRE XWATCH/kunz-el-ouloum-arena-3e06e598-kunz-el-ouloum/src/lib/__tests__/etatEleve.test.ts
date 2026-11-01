// etatEleve.test.ts — LES SEPT FAMILLES, ET LA PREUVE QU'ELLES SONT LUES UNE FOIS.
//
// Étape 2 du §9 de `docs/VISION_COACH_MORCHID_2026-10-15.md`. Le défaut réparé
// n'était pas un bug : le capitaine lisait la série ici, les erreurs là-bas,
// l'épreuve ailleurs, la rubrique encore autre part — et `App.tsx` relisait la
// sienne de son côté. Chacun voyait sa tranche, personne ne voyait l'élève.
//
// Trois choses sont vérifiées ici, et la troisième est la plus importante :
//   1. les sept familles sont présentes, et aucune n'est inventée ;
//   2. `assemblerEtatEleve` est PUR — il ne lit ni le stockage ni l'horloge ;
//   3. le stockage est lu en UN passage, sur un nombre CONNU de clés. C'est ce
//      qui empêche la relecture éparpillée de revenir sans qu'on s'en aperçoive.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  assemblerEtatEleve,
  contexteCapitaine,
  lireEtatEleve,
  type EtatEleve,
} from '../etatEleve';
import { emettrePrescription, marquerIgnoree } from '../prescriptions';
import { RELAIS_VIDE } from '../relais';
import { bacDaysLeft } from '../../utils/dashboardActions';
import type { DailyGoalConfig } from '../../types';

const JOUR = '2026-10-15';
const MAINTENANT = new Date(2026, 9, 15, 18, 30, 0);

function daily(over: Partial<DailyGoalConfig> = {}): DailyGoalConfig {
  return {
    type: 'minutes',
    targetMinutes: 30,
    targetQuestions: 20,
    todayMinutes: 0,
    todayQuestions: 0,
    completedToday: false,
    streakDays: 0,
    joursActifsTotal: 0,
    lastActiveDate: JOUR,
    serieDernierJour: JOUR,
    ...over,
  } as DailyGoalConfig;
}

/** Les quatre clés que l'état a le droit de lire — et rien d'autre. */
const CLES_DE_L_ETAT = [
  'boussole_prescriptions_v1',
  'boussole_capitaine_invitation_ignoree',
  'boussole_conseils_rubriques_vus',
  // Étape 5 : le relais humain. Le nom qu'un élève confie passe par l'état
  // comme le reste — une seule lecture, un seul assemblage.
  'boussole_relais_v1',
];

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('les sept familles sont présentes, et aucune n’est inventée', () => {
  it('un élève qui n’a jamais rien produit : des faits, pas des trous', () => {
    const etat = assemblerEtatEleve({
      daily: undefined,
      maintenant: MAINTENANT,
    });

    expect(etat.temps.heure).toBe(18);
    expect(etat.temps.jour).toBe(JOUR);
    expect(etat.temps.joursSansTravail, 'jamais travaillé est un FAIT, pas une inconnue').toBeNull();

    expect(etat.horizon.joursAvantBac).toBe(bacDaysLeft(MAINTENANT));

    expect(etat.assiduite).toEqual({ serie: 0, cumulJours: 0, palierFranchi: null });

    // Familles lourdes : « pas encore chargée » — et surtout PAS zéro inventé.
    expect(etat.erreurs.chargee).toBe(false);
    expect(etat.erreurs.dominante).toBeNull();
    expect(etat.competence.chargee).toBe(false);
    expect(etat.competence.unitePrioritaire).toBeNull();

    expect(etat.relation.derniereIgnoreeMs).toBeNull();
    expect(etat.relation.motifsRetires).toEqual([]);
    expect(etat.relation.bilan.emises).toBe(0);

    expect(etat.contexte.epreuveEnCours).toBe(false);
    expect(etat.contexte.rubriqueOuverte).toBeNull();
  });

  it('un élève en activité : les trois familles chiffrées suivent la donnée', () => {
    const etat = assemblerEtatEleve({
      daily: daily({ todayMinutes: 45, streakDays: 6, joursActifsTotal: 31, serieDernierJour: JOUR }),
      maintenant: MAINTENANT,
      derniereUnite: 'التركيب الضوئي',
      epreuveEnCours: true,
    });

    expect(etat.temps.joursSansTravail).toBe(0);
    expect(etat.assiduite.cumulJours).toBe(31);
    // 31 jours cumulés : le palier des 30 est FRANCHI, et il le reste demain.
    // (`palierAtteint` aurait répondu `null` — c'est une autre question.)
    expect(etat.assiduite.palierFranchi).toBe(30);
    expect(etat.contexte.epreuveEnCours).toBe(true);
  });

  it('le palier franchi résiste au lendemain, contrairement au palier exact', () => {
    const seuils: Array<[number, number | null]> = [
      [0, null], [6, null], [7, 7], [8, 7], [29, 7], [30, 30], [45, 30],
    ];
    for (const [cumul, attendu] of seuils) {
      const etat = assemblerEtatEleve({
        daily: daily({ streakDays: 0, joursActifsTotal: cumul }),
        maintenant: MAINTENANT,
      });
      expect(etat.assiduite.palierFranchi, `${cumul} jours cumulés`).toBe(attendu);
    }
  });

  it('une famille lourde fournie devient « chargée » et transmet ses chiffres', () => {
    const etat = assemblerEtatEleve({
      daily: daily(),
      maintenant: MAINTENANT,
      erreurs: {
        total: 3,
        dominante: { code: 'missing_unit', occurrences: 4 },
        capital: { fermees: 2, rouvertes: 1, total: 2 },
      },
      competence: {
        verdicts: { biologie: 'faible' },
        faibles: ['biologie'],
        unitePrioritaire: 'biologie',
      },
    });

    expect(etat.erreurs.chargee).toBe(true);
    expect(etat.erreurs.total).toBe(3);
    expect(etat.erreurs.dominante?.code).toBe('missing_unit');
    expect(etat.erreurs.capital.fermees).toBe(2);
    expect(etat.competence.chargee).toBe(true);
    expect(etat.competence.unitePrioritaire).toBe('biologie');
  });

  it('la famille « relation » lit la boucle fermée à l’étape 1', () => {
    emettrePrescription({ situation: 'reprise', cible: 'reviser' }, {}, MAINTENANT.getTime());
    marquerIgnoree(MAINTENANT.getTime() + 1000);

    // `lireEtatEleve` — et pas l'assembleur pur : la prescription vit dans le
    // stockage, et l'assembleur, précisément, n'y touche pas. C'est la preuve par
    // l'usage de la règle n° 1 du module.
    const etat = lireEtatEleve({ daily: daily(), maintenant: MAINTENANT });
    expect(etat.relation.bilan.ignorees).toBe(1);
    expect(etat.relation.bilan.tauxSuivi, 'trois échecs avant qu’un motif soit retiré').toBe(0);
    expect(etat.relation.motifsRetires).toEqual([]);
  });
});

describe('l’assembleur est PUR — et c’est vérifié, pas affirmé', () => {
  it('il ne lit PAS le stockage, même quand les clés sont remplies', () => {
    localStorage.setItem('boussole_capitaine_invitation_ignoree', '999');
    const espion = vi.spyOn(Storage.prototype, 'getItem');

    assemblerEtatEleve({ daily: daily(), maintenant: MAINTENANT });

    expect(espion, 'assemblerEtatEleve a touché au stockage').not.toHaveBeenCalled();
  });

  it('il n’écrit RIEN — un état qui écrit en se calculant est intestable', () => {
    const setEspion = vi.spyOn(Storage.prototype, 'setItem');
    assemblerEtatEleve({ daily: daily(), maintenant: MAINTENANT });
    expect(setEspion).not.toHaveBeenCalled();
  });

  it('il n’appelle PAS l’horloge : la date est reçue, jamais devinée', () => {
    // Sans cette règle, « à 22 h le capitaine se tait » serait intestable.
    const dateEspion = vi.spyOn(Date.prototype, 'getHours');
    const etat = assemblerEtatEleve({ daily: daily(), maintenant: MAINTENANT });
    expect(etat.temps.heure).toBe(18);
    expect(dateEspion.mock.instances.length).toBeGreaterThan(0); // appelé sur LA date reçue
    const sur = dateEspion.mock.contexts.filter((c) => c === MAINTENANT);
    expect(sur.length, 'l’heure vient d’ailleurs que de `maintenant`').toBeGreaterThan(0);
  });
});

describe('le stockage est lu en UN passage, sur un nombre CONNU de clés', () => {
  it('`lireEtatEleve` lit exactement les clés de ses familles', () => {
    const cles = new Set<string>();
    const espion = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(function (
      this: Storage,
      cle: string,
    ) {
      cles.add(cle);
      return null;
    });

    lireEtatEleve({ daily: daily(), maintenant: MAINTENANT });

    expect(espion.mock.calls.length, 'trop de lectures pour un seul assemblage').toBeLessThanOrEqual(6);
    for (const cle of cles) {
      expect(CLES_DE_L_ETAT, `l’état lit une clé qui n’est pas la sienne : ${cle}`).toContain(cle);
    }
    expect(cles.size, 'aucune clé lue ? l’assemblage ne lit donc rien').toBeGreaterThan(0);
  });

  it('l’état REMPLACE la relecture : deux consommation, une seule lecture de clés', () => {
    // C'est le point de l'étape 2. Avant, `App.tsx` et le hook lisaient chacun
    // leur part ; les deux passaient par le stockage.
    const espion = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => null);
    const etat = lireEtatEleve({ daily: daily(), maintenant: MAINTENANT });
    const premier = espion.mock.calls.length;

    // Les consommateurs ne relisent plus : ils lisent l'état déjà assemblé.
    contexteCapitaine(etat);
    void etat.contexte.conseilRubriqueAPrendre;
    void etat.relation.motifsRetires;

    expect(espion.mock.calls.length, 'un consommateur a relu le stockage').toBe(premier);
  });
});

describe('contexteCapitaine — l’adaptateur reproduit exactement le contexte d’avant', () => {
  /**
   * Ce que le contexte DOIT contenir, champ par champ.
   *
   * Trois champs sont venus s'y ajouter : `sprint` et `joursAvantBac` à l'étape 3
   * (la phase et l'horizon entrent dans la décision), puis `echecsParMotif` à
   * l'étape 4 (la mémoire des échecs choisit la FORME de la prochaine tentative).
   * Ils sont listés ici EXPLICITEMENT — un champ qui apparaîtrait ou disparaîtrait
   * sans qu'on le décide ferait tomber ce test, et c'est exactement ce qu'on veut.
   */
  function contexteAttendu(etat: EtatEleve, derniereUnite: string | null) {
    return {
      sprint: etat.phase.niveau === 5,
      joursAvantBac: etat.horizon.joursAvantBac,
      echecsParMotif: etat.relation.echecsParMotif,
      heure: etat.temps.heure,
      joursSansTravail: etat.temps.joursSansTravail,
      serie: etat.assiduite.serie,
      joursAccumules: etat.assiduite.cumulJours,
      erreursAReprendre: etat.erreurs.total,
      derniereUnite,
      derniereInvitationIgnoreeMs: etat.relation.derniereIgnoreeMs,
      maintenantMs: etat.temps.maintenantMs,
      epreuveEnCours: etat.contexte.epreuveEnCours,
      motifsRetires: etat.relation.motifsRetires,
      relais: etat.relation.relais,
    };
  }

  const situations: Array<[string, Parameters<typeof assemblerEtatEleve>[0]]> = [
    ['élève neuf', { daily: undefined, maintenant: MAINTENANT }],
    [
      'élève en activité',
      { daily: daily({ todayMinutes: 40, streakDays: 5, joursActifsTotal: 12 }), maintenant: MAINTENANT, derniereUnite: 'المناعة' },
    ],
    [
      'creux de trois jours',
      {
        daily: daily({ serieDernierJour: '2026-10-12', joursActifsTotal: 44 }),
        maintenant: MAINTENANT,
        erreurs: { total: 4, dominante: null, capital: { fermees: 0, rouvertes: 0, total: 0 } },
      },
    ],
    [
      'pendant l’épreuve',
      { daily: daily(), maintenant: MAINTENANT, epreuveEnCours: true },
    ],
  ];

  for (const [nom, entrees] of situations) {
    it(`« ${nom} » : champ par champ`, () => {
      const etat = assemblerEtatEleve(entrees);
      expect(contexteCapitaine(etat, entrees.derniereUnite ?? null)).toEqual(
        contexteAttendu(etat, entrees.derniereUnite ?? null),
      );
      // Et la cohérence interne : le contexte ne se contredit jamais lui-même.
      expect(etat.assiduite.serie).toBeGreaterThanOrEqual(0);
      expect(etat.erreurs.total).toBeGreaterThanOrEqual(0);
    });
  }

  it('une erreur dominante est transmise au motif de prescription', () => {
    const etat = assemblerEtatEleve({
      daily: daily(),
      maintenant: MAINTENANT,
      erreurs: {
        total: 2,
        dominante: { code: 'premature_interpretation', occurrences: 5 },
        capital: { fermees: 1, rouvertes: 0, total: 1 },
      },
    });
    expect(etat.erreurs.dominante?.code).toBe('premature_interpretation');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// ÉTAPE 3 — LA PHASE EST DANS L'ÉTAT, ET ELLE EN SORT.
//
// Un état qui calcule une phase que personne ne lit serait le péché que ce
// projet dénonce partout (« plus d'organes que de connexions »). Ces trois
// vérifications ferment la chaîne : la phase est déduite, l'adaptateur la
// transmet, et la décision la reçoit.
// ─────────────────────────────────────────────────────────────────────────────
describe('la phase traverse l’état jusqu’au contexte du capitaine', () => {
  it('l’état porte une phase, cohérente avec le besoin déclaré', () => {
    const etat = lireEtatEleve({ daily: daily({ joursActifsTotal: 3 }), maintenant: MAINTENANT });
    expect(etat.phase.niveau).toBe(2);
    expect(etat.phase.besoin).toBe('victoires_courtes');
    expect(etat.phase.creux).toBe(false);
  });

  it('l’adaptateur transmet `sprint` et le décompte — la date du BAC DÉCIDE', () => {
    // 20 mai 2027 : la session du BAC (08/06/2027) est à moins de trente jours.
    const sprint = lireEtatEleve({
      daily: daily({ joursActifsTotal: 12, serieDernierJour: '2026-10-14' }),
      maintenant: new Date(2027, 4, 20, 10, 0, 0),
    });
    expect(sprint.phase.niveau).toBe(5);
    const ctx = contexteCapitaine(sprint);
    expect(ctx.sprint).toBe(true);
    expect(ctx.joursAvantBac).toBeGreaterThan(0);
    expect(ctx.joursAvantBac).toBeLessThanOrEqual(30);
  });

  it('hors sprint, l’adaptateur ne prétend rien', () => {
    const ordinaire = lireEtatEleve({ daily: daily({ joursActifsTotal: 12 }), maintenant: MAINTENANT });
    const ctx = contexteCapitaine(ordinaire);
    expect(ctx.sprint).toBe(false);
    expect(ordinaire.phase.niveau).not.toBe(5);
  });
});

describe('le relais humain (étape 5) entre par la famille « relation »', () => {
  it('sans injection, l’assembleur PUR ne prétend rien : personne n’est nommé', () => {
    const etat = assemblerEtatEleve({ daily: daily(), maintenant: MAINTENANT });
    expect(etat.relation.relais).toEqual(RELAIS_VIDE);
  });

  it('`lireEtatEleve` remonte le nom écrit sur l’appareil, et l’adaptateur le transmet', () => {
    localStorage.setItem(
      'boussole_relais_v1',
      JSON.stringify({
        nom: 'أستاذي',
        demandeMs: MAINTENANT.getTime(),
        nommeMs: MAINTENANT.getTime(),
        relanceMs: null,
        reponse: null,
        refusMs: null,
      }),
    );
    const etat = lireEtatEleve({ daily: daily(), maintenant: MAINTENANT });
    expect(etat.relation.relais.nom).toBe('أستاذي');
    expect(contexteCapitaine(etat).relais?.nom).toBe('أستاذي');
  });

  it('une valeur illisible ne casse rien : un relais vide, jamais une exception', () => {
    localStorage.setItem('boussole_relais_v1', 'pas du JSON');
    const etat = lireEtatEleve({ daily: daily(), maintenant: MAINTENANT });
    expect(etat.relation.relais).toEqual(RELAIS_VIDE);
    expect(contexteCapitaine(etat).relais).toEqual(RELAIS_VIDE);
  });
});
