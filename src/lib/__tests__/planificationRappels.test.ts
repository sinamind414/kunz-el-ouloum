// planificationRappels.test.ts — LE PONT H1 EST-IL VIVANT ?
//
// L'audit externe du 16/10 a montré par MUTATION que les tests de source
// (`toContain`) laissent passer des organes morts : `if (false) appel(...)`
// ne change pas un texte. Ici, le test est COMPORTEMENTAL par construction :
// il observe l'EFFET dans l'ordonnanceur SM-2 (`elementsDus`), pas dans le code.
// Neutraliser `planifierRappel` dans le pont fait échouer ce fichier — c'est le
// critère de réussite demandé par l'audit. (Mutation vérifiée le 16/10/2026 :
// `if (false) planifierRappel(...)` → rouge sur « programme le rappel ».)

import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { elementsDus, etatRappel } from '../rappelAdaptatif';
import { planifierRappelsPourErreurs, remediationPour } from '../planificationRappels';
import { MICRO_REMEDIATIONS } from '../../data/microRemediations';

const T = new Date('2026-10-16T12:00:00').getTime();
const JOUR = 24 * 60 * 60 * 1000;

/** 11 entrées du corpus déclarent `schedule_recall` — toutes avec un concept. */
const SCHEDULE_RECALL = Object.values(MICRO_REMEDIATIONS).filter((r) => r.nextAction === 'schedule_recall');

beforeEach(() => {
  window.localStorage.clear();
});
afterEach(() => {
  window.localStorage.clear();
});

describe('remediationPour — le résolveur unique (le nom que l’audit a trouvé orphelin)', () => {
  it('résout par la nomenclature d’origine (triggerCodes)', () => {
    expect(remediationPour('CONFUSION_ADN_ARNM')?.id).toBe('mr_arnm_vs_adn');
    expect(remediationPour('CONFUSION_HUMORAL_CELLULAR')?.id).toBe('mr_humoral_vs_cellulaire');
  });

  it('résout par la taxonomie RÉELLE du correcteur (taxonomyCodes)', () => {
    expect(remediationPour('verb_confusion')?.id).toBe('mr_method_analysis_interp');
    expect(remediationPour('premature_interpretation')?.id).toBe('mr_method_analysis_interp');
    expect(remediationPour('conditional_hypothesis')?.id).toBe('mr_method_hypothesis_rubama');
  });

  it('un code sans lien déclaré renvoie undefined — jamais une remédiation forcée', () => {
    expect(remediationPour('code_invente')).toBeUndefined();
    expect(remediationPour('')).toBeUndefined();
    // `notion_confusion` est enregistrable mais aucun corpus ne le déclenche :
    // l'absence de lien est une DONNÉE, pas un oubli à combler à l'aveugle.
    expect(remediationPour('notion_confusion')).toBeUndefined();
  });
});

describe('planifierRappelsPourErreurs — l’intention « schedule_recall » devient un SM-2 réel', () => {
  it('un code `schedule_recall` programme VRAIMENT le concept (effet observé, pas du texte)', () => {
    expect(etatRappel('immunity_memory')).toBeNull(); // encore rien dans la banque
    expect(elementsDus(T)).not.toContain('immunity_memory');

    const programmes = planifierRappelsPourErreurs(['CONFUSION_HUMORAL_CELLULAR'], T);

    expect(programmes).toEqual(['immunity_memory']);
    expect(etatRappel('immunity_memory')).not.toBeNull();
    expect(elementsDus(T)).toContain('immunity_memory');
  });

  it('les 11 concepts `schedule_recall` du corpus sont tous programmables', () => {
    const codes = SCHEDULE_RECALL.flatMap((r) => r.triggerCodes);
    const programmes = planifierRappelsPourErreurs(codes, T);
    const attendus = [...new Set(SCHEDULE_RECALL.map((r) => r.conceptId))];
    expect(programmes.length).toBe(attendus.length);
    for (const id of attendus) {
      expect(etatRappel(id)).not.toBeNull();
    }
  });

  it('idempotent : refaire la faute NE réinitialise PAS un espacement en cours', () => {
    planifierRappelsPourErreurs(['CONFUSION_HUMORAL_CELLULAR'], T);
    const premier = etatRappel('immunity_memory');
    expect(premier).not.toBeNull();
    expect(premier!.dueAt).toBe(T); // dû immédiatement (contrat planifierRappel)

    // Une seconde faute « plus tard » ne doit NI écraser ni retarder l'échéance.
    planifierRappelsPourErreurs(['CONFUSION_HUMORAL_CELLULAR'], T + JOUR);
    const second = etatRappel('immunity_memory');
    expect(second!.dueAt).toBe(premier!.dueAt);
    expect(second!.intervalDays).toBe(premier!.intervalDays);
  });

  it('une micro-reprise sans `schedule_recall` NE programme RIEN (elle s’affiche)', () => {
    // verb_confusion → mr_method_analysis_interp : open_reflex + question
    // affichée — le concept `enzymes` ne doit PAS entrer dans l'ordonnanceur.
    const programmes = planifierRappelsPourErreurs(['verb_confusion'], T);
    expect(programmes).toEqual([]);
    expect(etatRappel('enzymes')).toBeNull();
  });

  it('des codes inconnus, vides ou hétéroclites ne lèvent rien et ne programment rien', () => {
    expect(planifierRappelsPourErreurs(['code_invente', '', 'notion_confusion'], T)).toEqual([]);
    expect(elementsDus(T)).toEqual([]);
  });
});
