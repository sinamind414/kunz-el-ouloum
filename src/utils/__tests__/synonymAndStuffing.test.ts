// src/utils/__tests__/synonymAndStuffing.test.ts — Verrou de la R3 de l'audit
// qualité Morchid (2026-09-29) :
//   A. Réutilisation du dictionnaire curé SYNONYM_GROUPS dans le scoring des
//      fiches → une forme alternative d'un concept (latin/abréviation/variante)
//      retrouve la bonne fiche sans dupliquer les alias.
//   B. Branchement du détecteur de bourrage (stuffingDetector) dans la notation
//      des réponses ouvertes du défi BAC → une copie « farmée » n'est plus créditée.
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
  const boss = (overrides: Partial<NonNullable<BotSession['boss']>> = {}): BotSession => ({
    ...getDefaultSession(),
    activeDomainId: 1,
    mode: 'bac_challenge',
    boss: {
      scenarioId: 'boss1_q1',
      questionIndex: 0,
      totalQuestions: 2,
      score: 0,
      phase: 'answer',
      // R1 (audit Morchid 2026-10-01) : la correction et la note ne sont
      // délivrées qu'après 2 tentatives écrites (ou 3 indices). Les tests
      // ci-dessous simulent donc le 2e essai — le 1er essai est désormais un
      // feedback d'orientation, pas un verdict noté.
      attempts: 1,
      hintLevel: 0,
      openedAt: Date.now() - 120_000,
      ...overrides,
    },
  });
  const sc = getBossScenarioById('boss1_q1')!;

  it('réponse complète (non bourrée) → 10/10 (non régressif)', () => {
    const bon = processStudentInput(boss(), sc.keyPoints.join('؛ '));
    expect(note(bon.action.text)).toBe(10);
  });

  it('même réponse noyée dans un mot répété (bourrage) → 0/10', () => {
    const stuffed = processStudentInput(
      boss(),
      sc.keyPoints.join(' ') + ' ' + 'حشو '.repeat(120),
    );
    expect(note(stuffed.action.text)).toBe(0);
  });

  it('R1 — au 1er essai, la correction n’est PAS dévoilée', () => {
    const first = processStudentInput(boss({ attempts: 0 }), sc.keyPoints.join('؛ '));
    // Pas de CORRECTION MODÈLE au 1er essai : seul son INTITULÉ est mentionné
    // (« elle s'ouvrira au 2e essai »), jamais son contenu.
    expect(first.action.text).not.toContain(sc.correction);
    expect(first.session.boss!.attempts).toBe(1);
    // La tentative est orientée : indice de niveau 1 servi.
    expect(first.action.text).toContain('مفتاح');
  });

  it('R1 — « لا أعرف » donne un indice, jamais la correction', () => {
    const res = processStudentInput(boss(), 'لا أعرف');
    expect(res.action.text).not.toContain('التصحيح النموذجي');
    expect(res.action.text).toContain('مفتاح');
    expect(res.session.boss!.hintLevel).toBe(1);
  });

  it('R1 — 3 indices consommés → correction débloquée, score plafonné à 3/10', () => {
    const res = processStudentInput(
      boss({ hintLevel: 2, attempts: 0, openedAt: Date.now() - 200_000 }),
      'لا أعرف',
    );
    expect(res.action.text).toContain('التصحيح النموذجي');
    expect(note(res.action.text)).toBe(3);
  });
});
