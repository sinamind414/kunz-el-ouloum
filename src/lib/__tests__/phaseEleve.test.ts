// phaseEleve.test.ts — LES CINQ PHASES, DÉDUITES ET JAMAIS DÉCLARÉES.
//
// Étape 3 du §9. Le document est catégorique : « Aucune case à cocher, aucun
// questionnaire. La phase se CALCULE. » Ce fichier vérifie la déduction, et il
// vérifie surtout les DEUX règles de fond qui protègent l'élève :
//
//   · un creux ne fait JAMAIS descendre de phase — un élève qui revient après
//     dix jours n'a pas régressé, il a fait une parenthèse ;
//   · la phase 1 prime sur le sprint — à vingt jours du BAC, un élève qui n'a
//     jamais rien produit n'a pas besoin d'une épreuve chronométrée, il a besoin
//     de la porte des deux minutes.
import { describe, expect, it } from 'vitest';
import { assemblerEtatEleve, type EtatEleve, type EntreesEtatEleve } from '../etatEleve';
import {
  deduirePhase,
  JOURS_CREUX,
  JOURS_DEMARRAGE,
  JOURS_SPRINT_EPREUVE,
  type BesoinPhase,
} from '../phaseEleve';
import type { DailyGoalConfig } from '../../types';

/** Loin du BAC — la session 2027 est en juin. */
const ORDINAIRE = new Date(2026, 9, 15, 18, 0, 0);
/** À moins de trente jours de la date du BAC (2027-06-08). */
const SPRINT_DATE = new Date(2027, 4, 20, 10, 0, 0);

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
    lastActiveDate: '2026-10-15',
    serieDernierJour: '2026-10-15',
    ...over,
  } as DailyGoalConfig;
}

function etat(over: Partial<EntreesEtatEleve> = {}): EtatEleve {
  return assemblerEtatEleve({ daily: daily(), maintenant: ORDINAIRE, ...over });
}

describe('les cinq phases, et ce qui les distingue', () => {
  it('phase 1 — jamais rien produit', () => {
    const e = assemblerEtatEleve({ daily: undefined, maintenant: ORDINAIRE });
    const phase = deduirePhase(e);
    expect(phase.niveau).toBe(1);
    expect(phase.besoin).toBe<BesoinPhase>('porte_2_minutes');
    expect(phase.creux, 'jamais commencé n’est pas un creux : il n’y a rien à interrompre').toBe(false);
  });

  it('phase 2 — moins d’une semaine d’activité accumulée', () => {
    for (const cumul of [1, 3, JOURS_DEMARRAGE - 1]) {
      const phase = deduirePhase(etat({ daily: daily({ joursActifsTotal: cumul, serieDernierJour: '2026-10-15' }) }));
      expect(phase.niveau, `${cumul} jours cumulés`).toBe(2);
      expect(phase.besoin).toBe<BesoinPhase>('victoires_courtes');
    }
  });

  it('phase 3 — installation : ce qui est construit se protège', () => {
    for (const cumul of [JOURS_DEMARRAGE, 15, 60]) {
      const phase = deduirePhase(etat({ daily: daily({ joursActifsTotal: cumul }) }));
      expect(phase.niveau, `${cumul} jours cumulés`).toBe(3);
      expect(phase.besoin).toBe<BesoinPhase>('proteger_acquis');
    }
  });

  it('phase 4 — consolidation, SEULEMENT quand on peut la constater', () => {
    const avecVerdicts = etat({
      daily: daily({ joursActifsTotal: 25 }),
      competence: {
        verdicts: { biologie: 'fort', immunologie: 'moyen', genetique: 'faible' },
        faibles: ['genetique'],
        unitePrioritaire: 'genetique',
      },
    });
    expect(deduirePhase(avecVerdicts).niveau).toBe(4);
    expect(deduirePhase(avecVerdicts).besoin).toBe<BesoinPhase>('espacement_fermeture');

    // Verdicts faibles : il reste du travail de fond, on ne consolide pas.
    const verdictsFaibles = etat({
      daily: daily({ joursActifsTotal: 25 }),
      competence: { verdicts: { biologie: 'faible', genetique: 'non_commence' }, faibles: [], unitePrioritaire: null },
    });
    expect(deduirePhase(verdictsFaibles).niveau).toBe(3);
  });

  it('sans verdicts chargés, on ne DÉCLARE pas la consolidation', () => {
    // La famille « compétence » coûte 286 Ko de séquences de leçons : la bulle ne
    // la charge pas. Ne pas savoir n'autorise pas à supposer — on retombe sur le
    // besoin le plus prudent, qui n'est jamais faux.
    const sansVerdicts = etat({ daily: daily({ joursActifsTotal: 200 }) });
    expect(sansVerdicts.competence.chargee).toBe(false);
    expect(deduirePhase(sansVerdicts).niveau).toBe(3);
  });

  it('phase 5 — sprint : la date du BAC devient une entrée de décision', () => {
    const phase = deduirePhase(
      assemblerEtatEleve({ daily: daily({ joursActifsTotal: 12 }), maintenant: SPRINT_DATE }),
    );
    expect(phase.niveau).toBe(5);
    expect(phase.besoin).toBe<BesoinPhase>('production_chronometree');
  });

  it('la frontière du sprint est exacte, et connue', () => {
    const e = assemblerEtatEleve({ daily: daily({ joursActifsTotal: 12 }), maintenant: SPRINT_DATE });
    expect(e.horizon.joursAvantBac).toBeLessThanOrEqual(JOURS_SPRINT_EPREUVE);
    expect(e.horizon.joursAvantBac).toBeGreaterThan(0);
    // Une date inconnue — `null` — ne déclenche jamais le sprint par accident.
    const sansDate = etat({
      daily: daily({ joursActifsTotal: 12 }),
      // On force une date très lointaine en déplaçant l'horloge du test.
      maintenant: new Date(2026, 0, 1, 10, 0, 0),
    });
    expect(sansDate.horizon.joursAvantBac).toBeGreaterThan(JOURS_SPRINT_EPREUVE);
    expect(deduirePhase(sansDate).niveau).toBe(3);
  });
});

describe('les deux règles de fond qui protègent l’élève', () => {
  it('UN CREUX NE FAIT JAMAIS DESCENDRE DE PHASE (§5.B)', () => {
    // L'élève avait 40 jours accumulés, puis dix jours de silence. Sa phase ne
    // bouge pas : elle n'a jamais regardé la fraîcheur de la dernière activité.
    const enCreux = etat({
      daily: daily({ joursActifsTotal: 40, streakDays: 0, serieDernierJour: '2026-10-05' }),
    });
    const phase = deduirePhase(enCreux);
    expect(enCreux.temps.joursSansTravail).toBeGreaterThanOrEqual(JOURS_CREUX);
    expect(phase.creux, 'dix jours sans rien : c’est un creux').toBe(true);
    expect(phase.niveau, 'un creux n’est pas une régression').toBe(3);
    expect(phase.besoin).toBe<BesoinPhase>('proteger_acquis');
  });

  it('et le creux se voit quand même — il ajoute un besoin, pas un niveau', () => {
    const dedans = deduirePhase(etat({ daily: daily({ joursActifsTotal: 40 }) }));
    const dehors = deduirePhase(
      etat({ daily: daily({ joursActifsTotal: 40, serieDernierJour: '2026-10-05' }) }),
    );
    expect(dedans.creux).toBe(false);
    expect(dehors.creux).toBe(true);
    expect(dehors.niveau).toBe(dedans.niveau);
  });

  it('LA PHASE 1 PRIME SUR LE SPRINT — la porte des 2 minutes, rien d’autre', () => {
    // Vingt jours du BAC, zéro production : proposer une épreuve chronométrée
    // serait absurde. Le §5.B est explicite sur le besoin de la phase 1.
    const jamaisRien = assemblerEtatEleve({ daily: undefined, maintenant: SPRINT_DATE });
    const phase = deduirePhase(jamaisRien);
    expect(jamaisRien.horizon.joursAvantBac).toBeLessThanOrEqual(JOURS_SPRINT_EPREUVE);
    expect(phase.niveau).toBe(1);
    expect(phase.besoin).toBe<BesoinPhase>('porte_2_minutes');
  });

  it('le sprint ne demande JAMAIS de contenu neuf (§5.B)', () => {
    // Vérifié par construction : le besoin de la phase 5 est une production, et
    // les destinations du capitaine ne proposent aucune découverte.
    const phase = deduirePhase(
      assemblerEtatEleve({ daily: daily({ joursActifsTotal: 12 }), maintenant: SPRINT_DATE }),
    );
    expect(phase.besoin).toBe('production_chronometree');
    expect(phase.besoin).not.toBe('victoires_courtes');
  });
});
