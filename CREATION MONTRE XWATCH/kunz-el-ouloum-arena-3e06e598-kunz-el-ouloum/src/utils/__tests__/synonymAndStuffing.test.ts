// src/utils/__tests__/synonymAndStuffing.test.ts — Verrou de la R3 de l'audit
// qualité Morchid (2026-09-29) :
//   A. Réutilisation du dictionnaire curé SYNONYM_GROUPS dans le scoring des
//      fiches → une forme alternative d'un concept (latin/abréviation/variante)
//      retrouve la bonne fiche sans dupliquer les alias.
//   B. Branchement du détecteur de bourrage (stuffingDetector) dans la notation
//      des réponses ouvertes du défi BAC → une copie « farmée » n'est plus créditée.
//   C. R1 de l'audit Morchid 2026-10-01 (branche master 3e970d2, fusionnée le
//      2026-10-01) : la correction n'est plus un bouton — escalier d'indices et
//      2 tentatives écrites. Les 3 tests ci-dessous proviennent de cette
//      branche, adaptés au contrat KEO-101/102 du SpecKit (3 indices PUIS
//      correction plafonnée ; 1ʳᵉ tentative enregistrée sans indice).
import { describe, expect, it } from 'vitest';
import { findBestKnowledgeCard, processStudentInput } from '../../smartTutorEngine';
import { getDefaultSession, type BotSession } from '../sessionManager';
import { getBossScenarioById } from '../../data/smartBotData';

describe('R3-A — expansion par synonymes (recall)', () => {
  it('une forme latine (« enzyme ») retrouve la fiche arabe de l’activité enzymatique', () => {
    const card = findBestKnowledgeCard('ما وظيفة enzyme في التفاعل', null);
    expect(card).not.toBeNull();
    expect(card!.title).toContain('نزيم'); // إنزيم / الإنزيمي
  });
});

describe('R3-B — anti-bourrage dans la notation ouverte (boss BAC)', () => {
  const note = (t: string): number | null => {
    const m = t.match(/نقاطك لهذه الوضعية: (\d+)\/10/);
    return m ? Number(m[1]) : null;
  };
  const boss = (
    overrides: Partial<NonNullable<BotSession['boss']>> = {},
  ): BotSession => ({
    ...getDefaultSession(),
    activeDomainId: 1,
    mode: 'bac_challenge',
    boss: {
      scenarioId: 'boss1_q1',
      questionIndex: 0,
      totalQuestions: 2,
      score: 0,
      phase: 'answer',
      // KEO-101 : horloge ouverte depuis assez longtemps pour les indices.
      openedAt: Date.now() - 120_000,
      ...overrides,
    },
  });
  const sc = getBossScenarioById('boss1_q1')!;

  // KEO-101 (bilan de vérité 2026-10-01) : deux tentatives réelles débloquent
  // la correction — on rejoue la réponse deux fois.
  // KEO-106 (LOT 2) : la situation demande «بيّن» → connecteur causal ajouté.
  const CAUSAL = '، مما يؤدي إلى استجابة مناعية';
  const reponse = (ans: string) =>
    processStudentInput(processStudentInput(boss(), ans + CAUSAL).session, ans + CAUSAL);

  it('réponse complète (non bourrée) → 10/10 (non régressif)', () => {
    const bon = reponse(sc.keyPoints.join('؛ '));
    expect(note(bon.action.text)).toBe(10);
  });

  it('même réponse noyée dans un mot répété (bourrage) → 0/10', () => {
    const stuffed = reponse(
      sc.keyPoints.join(' ') + ' ' + 'حشو '.repeat(120),
    );
    expect(note(stuffed.action.text)).toBe(0);
  });

  it('R1 — au 1er essai, la correction n’est PAS dévoilée', () => {
    const first = processStudentInput(boss({ attempts: 0 }), sc.keyPoints.join('؛ ') + CAUSAL);
    // Pas de CORRECTION MODÈLE au 1er essai : la tentative est enregistrée,
    // orientée (structure + point manquant), mais jamais corrigée.
    expect(first.action.text).not.toContain(sc.correction);
    expect(first.action.text).toContain('سُجّلت محاولتك الأولى');
    expect(first.session.boss!.attempts).toBe(1);
  });

  it('R1 — « لا أعرف » donne un indice, jamais la correction', () => {
    const res = processStudentInput(boss(), 'لا أعرف');
    expect(res.action.text).not.toContain('التصحيح النموذجي');
    expect(res.action.text).toContain('مفتاح');
    expect(res.session.boss!.hintLevel).toBe(1);
  });

  it('R1 — 3 indices consommés → la tentative suivante donne la correction, score plafonné', () => {
    // KEO-101 : l'escalier compte TROIS indices (le 3ᵉ masque keyPoints[0]) ;
    // la sortie par « لا أعرف » n'arrive qu'ensuite, plafonnée à 3/10.
    const res = processStudentInput(
      boss({ hintLevel: 3, attempts: 0, openedAt: Date.now() - 200_000 }),
      'لا أعرف',
    );
    expect(res.action.text).toContain('التصحيح النموذجي');
    expect(note(res.action.text)!).toBeLessThanOrEqual(3);
  });
});
