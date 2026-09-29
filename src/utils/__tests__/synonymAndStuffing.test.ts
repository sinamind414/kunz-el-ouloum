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
  const boss = (): BotSession => ({
    ...getDefaultSession(),
    activeDomainId: 1,
    mode: 'bac_challenge',
    boss: { scenarioId: 'boss1_q1', questionIndex: 0, totalQuestions: 2, score: 0, phase: 'answer' },
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
});
