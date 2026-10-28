// spacedRecallPromptsAuto.lock.test.ts — VERROU DE LA TRANCHE P1-2 (63 concepts auto).
//
// Deux niveaux, comme l'exige la méthode H1 (les tests de source laissent
// passer les organes morts) :
//   1. DONNÉES : le record auto existe, 63 concepts, 4 stages (0-3), contenu
//      verbatim des leçons gold, zéro collision avec le corpus manuel.
//   2. CHAÎNE COMPORTEMENTALE : ouvrir une leçon (planifierRappelPourLecon)
//      programme VRAIMENT le concept, il devient dû et est SERVI par
//      prochainRappelDu — sinon l'extension serait de la donnée morte.

import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { SPACED_RECALL_PROMPTS_AUTO } from './spacedRecallPromptsAuto';
import { SPACED_RECALL_PROMPTS } from './spacedRecallPrompts';
import { LESSON_GOLD_SUMMARIES } from './lessonGoldSummaries';
import { planifierRappelPourLecon } from '../lib/planificationRappels';
import { etatRappel } from '../lib/rappelAdaptatif';
import { prochainRappelDu } from '../lib/rappelConcepts';

const T = new Date('2026-10-28T12:00:00').getTime();

beforeEach(() => {
  window.localStorage.clear();
});
afterEach(() => {
  window.localStorage.clear();
});

/** Les 63 concepts auto, par construction du générateur. */
const idsAuto = Object.keys(SPACED_RECALL_PROMPTS_AUTO);
const idsManuels = new Set(Object.keys(SPACED_RECALL_PROMPTS));
const idsGoldAttendus = Object.keys(LESSON_GOLD_SUMMARIES).filter((id) => !idsManuels.has(id));

describe('corpus auto — données générées (contenu verbatim, zéro collision)', () => {
  it('couvre exactement les leçons gold non déjà couvertes par le corpus manuel', () => {
    expect(idsGoldAttendus.length).toBe(74 - 11); // 74 leçons gold, 11 déjà couvertes
    expect([...idsAuto].sort()).toEqual([...idsGoldAttendus].sort());
    expect(idsAuto.length).toBe(63);
  });

  it('zéro collision : aucun concept manuel n’est repris dans le record auto', () => {
    const collision = idsAuto.filter((id) => idsManuels.has(id));
    expect(collision).toEqual([]);
  });

  it('chaque concept a exactement 4 prompts, stages 0-3 ordonnés, contrat complet', () => {
    for (const [conceptId, prompts] of Object.entries(SPACED_RECALL_PROMPTS_AUTO)) {
      expect(prompts, conceptId).toHaveLength(4);
      expect(prompts.map((p) => p.stage), `${conceptId} stages`).toEqual([0, 1, 2, 3]);
      for (const p of prompts) {
        expect(p.conceptId, `${conceptId} cohérence interne`).toBe(conceptId);
        expect(p.questionAr.trim().length, `${conceptId} s${p.stage} question`).toBeGreaterThan(0);
        expect(p.acceptedEvidence.length, `${conceptId} s${p.stage} preuves`).toBeGreaterThan(0);
        expect(p.minEvidence, `${conceptId} s${p.stage} minEvidence`).toBeGreaterThanOrEqual(1);
        expect(p.minEvidence, `${conceptId} s${p.stage} seuil ≤ preuves`).toBeLessThanOrEqual(
          p.acceptedEvidence.length,
        );
      }
    }
  });

  it('le contenu est un extrait VERBATIM des leçons gold — rien d’inventé', () => {
    for (const [conceptId, prompts] of Object.entries(SPACED_RECALL_PROMPTS_AUTO)) {
      const g = LESSON_GOLD_SUMMARIES[conceptId]!;
      const mecanisme = Array.isArray(g.mechanismAr) ? g.mechanismAr[0] : g.mechanismAr;
      expect(prompts[0]!.questionAr, `${conceptId} s0 = recallQuestionAr`).toBe(g.recallQuestionAr);
      expect(prompts[1]!.questionAr, `${conceptId} s1 contient commonErrorAr`).toContain(g.commonErrorAr);
      expect(prompts[2]!.questionAr, `${conceptId} s2 contient le mécanisme`).toContain(mecanisme!);
      expect(prompts[3]!.questionAr, `${conceptId} s3 contient le gabarit BAC`).toContain(g.bacSentenceFrameAr);
      for (const p of prompts) {
        for (const preuve of p.acceptedEvidence) {
          expect(
            g.vocabulary.includes(preuve),
            `${conceptId} s${p.stage} : la preuve « ${preuve} » vient du vocabulary de la leçon`,
          ).toBe(true);
        }
      }
    }
  });
});

describe('chaîne d’ouverture — de l’agenda au rappel servi (comportemental)', () => {
  const UNE_LECON = idsAuto[0]!;

  it('ouvrir une leçon gold programme son concept ; il devient dû et est servi', () => {
    expect(etatRappel(UNE_LECON)).toBeNull();
    expect(prochainRappelDu(T)).toBeNull();

    expect(planifierRappelPourLecon(UNE_LECON, T)).toBe(UNE_LECON);

    const etat = etatRappel(UNE_LECON);
    expect(etat).not.toBeNull();
    const servi = prochainRappelDu(T);
    expect(servi?.itemId).toBe(UNE_LECON);
    expect(servi?.prompt?.stage).toBe(0); // première question après l’étude
    expect(servi?.retardJours).toBe(0);
  });

  it('replanifier n’écrase JAMAIS un espacement en cours (idempotence héritée)', () => {
    planifierRappelPourLecon(UNE_LECON, T);
    const avant = etatRappel(UNE_LECON)!.dueAt;

    expect(planifierRappelPourLecon(UNE_LECON, T + 5 * 86_400_000)).toBeNull();
    expect(etatRappel(UNE_LECON)!.dueAt).toBe(avant);
  });

  it('une leçon sans corpus n’entre pas dans la banque (pas d’entrée morte)', () => {
    expect(planifierRappelPourLecon('leçon_inexistante', T)).toBeNull();
    expect(etatRappel('leçon_inexistante')).toBeNull();
  });

  it('le rappel est notable par les preuves du corpus (noterReponseLibre branché)', async () => {
    const { noterReponseLibre } = await import('../lib/rappelAdaptatif');
    planifierRappelPourLecon(UNE_LECON, T);
    const p = prochainRappelDu(T)!.prompt!;
    const complet = p.acceptedEvidence.join(' ');
    const { qualite } = noterReponseLibre(UNE_LECON, complet, {
      acceptedEvidence: p.acceptedEvidence,
      minEvidence: p.minEvidence,
    }, T);
    expect(qualite).toBe(5); // toutes les preuves trouvées → qualité pleine
  });
});
