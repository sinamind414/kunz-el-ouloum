/**
 * S-01 DoD (SpecKit 002, master 81984de — fusion 2026-10-01) : assertion de
 * build, adaptée au type riche `probe { question, expect }` du SpecKit KEO-103.
 *
 * Aucune fiche du parcours élève ne doit exister sans champ `probe`. Sans
 * probe, le chemin socratique (KEO-103) est mort : l'élève reçoit shortAnswer
 * au premier message et croit avoir compris.
 *
 * Ce test existe pour qu'une nouvelle fiche ajoutée sans probe fasse échouer
 * le build — et non pour qu'on s'en aperçoive en production.
 */
import { describe, expect, it } from 'vitest';
import { KNOWLEDGE_CARDS } from '../../data/smartBotData';

describe('S-01 — assertion de build : probe sur chaque fiche', () => {
  it('toute fiche du parcours élève possède une probe socratique', () => {
    const sansProbe = KNOWLEDGE_CARDS.filter((c) => !c.probe?.question?.trim());
    expect(sansProbe).toHaveLength(0);
  });

  it('la probe porte une réponse attendue (expect) non vide', () => {
    for (const c of KNOWLEDGE_CARDS) {
      expect(c.probe?.expect?.length ?? 0).toBeGreaterThan(0);
    }
  });

  it('la probe est une question courte (≤ 120 caractères), jamais un paragraphe', () => {
    for (const c of KNOWLEDGE_CARDS) {
      const p = c.probe?.question ?? '';
      expect(p.length).toBeLessThanOrEqual(120);
      expect(p.trim().length).toBeGreaterThan(10);
    }
  });

  it('la probe ne dévoile pas la réponse (pas de shortAnswer dedans)', () => {
    for (const c of KNOWLEDGE_CARDS) {
      const p = (c.probe?.question ?? '').trim();
      // La probe ne doit pas contenir le début révélateur de shortAnswer.
      expect(p.includes(c.shortAnswer.slice(0, 25))).toBe(false);
    }
  });
});
