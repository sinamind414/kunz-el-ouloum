// tc6MatriceOrphelines.lock.test.tsx — LA MATRICE UNITÉ×RESSOURCE
// (TC6/T3c, audit « architecture d'apprentissage » 19/10/2026, §6/W7).
//
// Ce que l'audit a mesuré : 12 leçons actives CONSTRUITES (contenu réel dans
// ACTIVE_LESSONS, indexées pour le tuteur) étaient ORPHELINES — absentes de
// OFFICIAL_PROGRAM_SEQUENCE, donc inatteignables depuis الدرس والمسار :
//   U1 ×3 (l1-expression, l2-transcription, l3-traduction) · U2 ×1
//   (protein_structure_function) · U3 ×1 (d1-u3-l1-enzyme) · U4 ×4
//   (immunité : self_nonself, humoral, cellular, memory) · U5 ×1 (synapse)
//   · U10 ×1 (seismic_waves) · U11 ×1 (subduction).
//
// Le câblage TC6 fixe EXACTEMENT chaque unité (l'unitId de l'index du tuteur
// fait foi — le verrou lessonIndexParity croisera). Positions :
//   · U1/U2/U5/U10/U11 en append (clôture d'unité, ordre des chapitres entre
//     elles) : AUCUN id positionnel des leçons déjà faites ne bouge ;
//   · U3 : insertion AVANT enzyme_inhibitors (verrou enzymeInhibitors.lock :
//     les inhibiteurs closent l'unité ; LESSON_PROGRESSION : d1-u3-l1 →
//     enzyme_inhibitors) ;
//   · U4 : insertion APRES phase7 et AVANT le dossier VIH + la حوصلة (ordre
//     TDM : chapitres 14→20 puis dossier puis synthèse, LESSON_PROGRESSION
//     mémoire → coopération inchangée).
//   Les 3 ids décalés (enzyme_inhibitors, hiv, cooperation) sont MIGRÉS une
//   fois dans le store (parcoursIdMigration.ts, marque mig:6).

import { describe, expect, it } from 'vitest';
import { OFFICIAL_PROGRAM_SEQUENCE } from '../data/programSequence';
import { getActiveLessonKeysForUnit } from '../data/lessonModes';
import { ACTIVE_LESSONS } from '../data/activeLessons';
import {
  PARCOURS_DOMAINS,
  PARCOURS_FLAT,
} from '../lib/parcours/parcoursPath';
import {
  etatParDefaut,
  loadParcours,
  saveParcours,
} from '../lib/parcours/parcoursProgress';
import { migrerIdsParcours, versionMigrationTC6 } from '../lib/parcours/parcoursIdMigration';

const ORPHELINES_PAR_UNITE: Record<number, string[]> = {
  1: ['d1-u1-l1-expression-genique', 'd1-u1-l2-transcription', 'd1-u1-l3-traduction'],
  2: ['protein_structure_function'],
  3: ['d1-u3-l1-enzyme'],
  4: ['immunity_self_nonself', 'immunity_humoral_response', 'immunity_cellular_response', 'immunity_memory_response'],
  5: ['synapse'],
  10: ['seismic_waves'],
  11: ['subduction'],
};

describe('les 12 orphelines sont câblées à LEUR unité', () => {
  it('chaque orpheline est désormais dans la séquence de son unité (matrice §6)', () => {
    for (const [uid, cles] of Object.entries(ORPHELINES_PAR_UNITE)) {
      const sequence = OFFICIAL_PROGRAM_SEQUENCE[Number(uid)];
      for (const cle of cles) {
        expect(sequence, `${cle} absente de U${uid}`).toContain(cle);
      }
    }
  });

  it('chaque orpheline est atteignable : dans ACTIVE_LESSONS et dans getActiveLessonKeysForUnit', () => {
    let totalCablees = 0;
    for (const [uid, cles] of Object.entries(ORPHELINES_PAR_UNITE)) {
      const actives = getActiveLessonKeysForUnit(Number(uid));
      for (const cle of cles) {
        expect(ACTIVE_LESSONS[cle], `${cle} absente du registre ACTIVE_LESSONS`).toBeTruthy();
        expect(actives, `${cle} non servie par getActiveLessonKeysForUnit(U${uid})`).toContain(cle);
      }
      totalCablees += cles.length;
    }
    expect(totalCablees).toBe(12);
  });

  it('l index du tuteur classe chaque orpheline dans LA MÊME unité (pas de divergence B5)', () => {
    // Réflexe du verrou lessonIndexParity : l'unitId catégorisé par l'index
    // doit être celui du câblage TC6 — sinon l'index doit être régénéré.
    const attendu: Record<string, number> = {
      'd1-u1-l1-expression-genique': 1,
      'd1-u1-l2-transcription': 1,
      'd1-u1-l3-traduction': 1,
      protein_structure_function: 2,
      'd1-u3-l1-enzyme': 3,
      immunity_self_nonself: 4,
      immunity_humoral_response: 4,
      immunity_cellular_response: 4,
      immunity_memory_response: 4,
      synapse: 5,
      seismic_waves: 10,
      subduction: 11,
    };
    for (const [cle, unit] of Object.entries(attendu)) {
      const sequence = OFFICIAL_PROGRAM_SEQUENCE[unit];
      expect(sequence, `${cle} : TC6 la met hors de l'unité U${unit} de l'index`).toContain(cle);
    }
  });
});

describe('zéro sinistre de progression — les anciens ids ne bougent pas', () => {
  it('U1/U2/U5/U10/U11 : préfixe inchangé (append-pur) ; U4 : PrEREQUIS+phases aux mêmes indices, hiv/حوصلة décalées en l8/l9 (migrées)', () => {
    const PREFIXES_HISTORIQUES: Record<number, string[]> = {
      1: ['phase1_chapitres_1_2', 'lecon_transcription', 'phase1_chapitres_1_2_2', 'phase2_chapitres_3_4'],
      // U4 : les indices 0-3 (prérequis + 3 phases) restent EXACTS — un élève
      // ayant terminé une de ces 4 leçons garde son done. Les 2 seuls décalages
      // (hiv l4→l8, cooperation l5→l9) sont couverts par REMAPPAGE_TC6.
      4: ['prerequis2AS_genetique', 'phase5_chapitres_9_10', 'phase6_chapitres_11_12', 'phase7_chapitres_13_14'],
      5: ['phase8_chapitres_15_16', 'phase9_chapitres_17_18', 'phase10_chapitres_19_20'],
      10: ['phase19_chapitres_37_38', 'phase20_chapitres_39_40'],
      11: ['d3-u11-l1-migmatite', 'phase17_chapitres_33_34_2', 'phase20_chapitres_39_40_2', 'phase21_chapitres_41_42', 'phase22_chapitres_43_44'],
    };
    for (const [uid, avant] of Object.entries(PREFIXES_HISTORIQUES)) {
      const sequence = OFFICIAL_PROGRAM_SEQUENCE[Number(uid)];
      for (let i = 0; i < avant.length; i++) {
        expect(sequence[i], `U${uid}[${i}] décalé par TC6 (sinistre d'ids)`).toBe(avant[i]);
      }
    }
    // Les 2 décalages U4 sont EXACTEMENT ceux de la table de migration.
    const sequenceU4 = OFFICIAL_PROGRAM_SEQUENCE[4];
    expect(sequenceU4[8]).toBe('immunity_hiv_aids');
    expect(sequenceU4[9]).toBe('immunity_cooperation');
  });

  it('U3 : enzyme_inhibitors reste la clôture ; d1-u3-l1 la précède (verrous préservés)', () => {
    const sequence = OFFICIAL_PROGRAM_SEQUENCE[3];
    expect(sequence[sequence.length - 1]).toBe('enzyme_inhibitors');
    expect(sequence.indexOf('d1-u3-l1-enzyme')).toBe(
      sequence.indexOf('enzyme_inhibitors') - 1,
    );
    expect(sequence.indexOf('phase4_chapitres_7_8')).toBe(sequence.indexOf('d1-u3-l1-enzyme') - 1);
  });

  it('le parcours dérivé garde le même id positionnel pour phase1_chapitres_1_2 (PARCOURS_FLAT[0])', () => {
    expect(PARCOURS_FLAT[0].lessonKey).toBe('phase1_chapitres_1_2');
    expect(PARCOURS_FLAT[0].id).toBe('parcours:u1:l0');
  });
});

describe('la migration TC6 — trois ids décalés (u3:l3→l4, u4:l4→l8, u4:l5→l9)', () => {
  const RECORD = { at: '2026-10-18', fragile: false };

  it('un store d AVANT le câblage est remappé (inhibiteurs + dossier VIH + حوصلة restent faits)', () => {
    const etat = migrerIdsParcours({
      done: {
        'parcours:u3:l3': RECORD, // enzyme_inhibitors (ancien)
        'parcours:u4:l4': RECORD, // immunity_hiv_aids (ancien)
        'parcours:u4:l5': RECORD, // immunity_cooperation (ancien)
      } as Record<string, unknown>,
      reviews: { 'parcours:u3:l3': '2026-11-01', 'parcours:u4:l5': '2026-11-02' } as Record<string, unknown>,
      current: 'parcours:u4:l4',
    });
    expect(etat.done['parcours:u3:l4']).toEqual(RECORD); // enzyme_inhibitors
    expect(etat.done['parcours:u3:l3']).toBeUndefined();
    expect(etat.done['parcours:u4:l8']).toEqual(RECORD); // immunity_hiv_aids
    expect(etat.done['parcours:u4:l9']).toEqual(RECORD); // immunity_cooperation
    expect(etat.done['parcours:u4:l5']).toBeUndefined();
    expect(etat.reviews['parcours:u3:l4']).toBe('2026-11-01');
    expect(etat.reviews['parcours:u4:l9']).toBe('2026-11-02');
    expect(etat.current).toBe('parcours:u4:l8');
    expect(etat.mig).toBe(versionMigrationTC6());
  });

  it('post-câblage : un done sur d1-u3-l1 (le NOUVEAU l3) n est JAMAIS remappé', () => {
    const etat = migrerIdsParcours({
      done: { 'parcours:u3:l3': RECORD } as Record<string, unknown>,
      reviews: {},
      mig: versionMigrationTC6(), // store écrit APRÈS le câblage → marque déjà posée
    });
    expect(etat.done['parcours:u3:l3']).toEqual(RECORD); // d1-u3-l1-enzyme
    expect(etat.done['parcours:u3:l4']).toBeUndefined();
  });

  it('loadParcours applique la migration une seule fois et la persiste au prochain save', () => {
    localStorage.setItem(
      'kunz_parcours_v1',
      JSON.stringify({ done: { 'parcours:u3:l3': RECORD }, reviews: {}, extraAllowance: 0 }),
    );
    const etat = loadParcours();
    expect(etat.done['parcours:u3:l4']).toEqual(RECORD);
    expect(etat.done['parcours:u3:l3']).toBeUndefined();
    expect(etat.mig).toBe(versionMigrationTC6());

    saveParcours(etat);
    // Relecture : idempotence (la marque mig empêche tout second remappage).
    const second = loadParcours();
    expect(second.done['parcours:u3:l4']).toEqual(RECORD);
    expect(second.done['parcours:u3:l3']).toBeUndefined();
  });

  it('etatParDefaut porte déjà la marque (installations neuves jamais remappées)', () => {
    expect(etatParDefaut().mig).toBe(versionMigrationTC6());
  });

  it('round-trip loadParcours : un done POST-câblage sur d1-u3-l1 (l3) survit intact', () => {
    // Le verrou qui aurait attrapé le défaut du premier jet : loadParcours
    // DOIT transmettre la marque mig — sans elle, chaque ouverture remappe
    // u3:l3 (d1-u3-l1 post-câblage) vers l4 (corruption inverse).
    localStorage.setItem(
      'kunz_parcours_v1',
      JSON.stringify({
        done: { 'parcours:u3:l3': RECORD, 'parcours:u3:l4': RECORD },
        reviews: {},
        extraAllowance: 0,
        mig: versionMigrationTC6(),
      }),
    );
    const s = loadParcours();
    expect(s.done['parcours:u3:l3']).toEqual(RECORD); // d1-u3-l1-enzyme (nouveau)
    expect(s.done['parcours:u3:l4']).toEqual(RECORD); // enzyme_inhibitors
  });
});

describe('le chemin dérivé reste sain (verrous structurels parcoursPath)', () => {
  it('chaque unité termine par exactement un جسر, aucun id dupliqué', () => {
    const ids = new Set<string>();
    for (const domaine of PARCOURS_DOMAINS) {
      for (const unit of domaine.units) {
        expect(unit.items[unit.items.length - 1].kind).toBe('jalon');
        for (const item of unit.items) {
          expect(ids.has(item.id)).toBe(false);
          ids.add(item.id);
        }
      }
    }
    expect(ids.size).toBe(PARCOURS_FLAT.length);
  });
});
