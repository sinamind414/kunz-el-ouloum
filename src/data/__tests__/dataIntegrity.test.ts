// src/data/__tests__/dataIntegrity.test.ts — R6 de l'audit qualité Morchid
// (2026-09-29). Le contenu vit dans de gros littéraux TS (smartBotData ~1595 l,
// tutorKnowledge ~3440 l) : une migration JSON complète serait risquée sans
// exécution de l'app. À la place, ce FILET DE VALIDATION DE SCHÉMA attrape à la
// compilation/CI les erreurs d'édition (id dupliqué, champ vide, correctIndex
// hors bornes, unitId invalide, orthographe scientifique interdite) — la source
// réelle des régressions signalées par les audits internes précédents.
import { describe, expect, it } from 'vitest';
import { KNOWLEDGE_CARDS, DOMAIN_QUESTION_BANKS } from '../smartBotData';
import { BOOK_TUTOR_QA } from '../../bookTutorQA';
import { METHODOLOGY_QA } from '../../methodologyKnowledge';
import { STUDY_GUIDE_CARDS } from '../../studyGuide';
import { TUTOR_KNOWLEDGE } from '../../tutorKnowledge';

const ids = (arr: { id: string }[]) => arr.map((x) => x.id);
const noDuplicates = (arr: string[]) => arr.length === new Set(arr).size;

describe('R6 — unicité des identifiants par base', () => {
  it('fiches de connaissances', () => expect(noDuplicates(ids(KNOWLEDGE_CARDS))).toBe(true));
  it('base « livre »', () => expect(noDuplicates(ids(BOOK_TUTOR_QA))).toBe(true));
  it('base « méthodologie »', () => expect(noDuplicates(ids(METHODOLOGY_QA))).toBe(true));
  it('guide d’étude', () => expect(noDuplicates(ids(STUDY_GUIDE_CARDS))).toBe(true));
  it('chunks OPUS', () => expect(noDuplicates(ids(TUTOR_KNOWLEDGE))).toBe(true));
});

describe('R6 — schéma des fiches de connaissances', () => {
  it('domainId ∈ {0,1,2,3}, title et keywords non vides', () => {
    for (const c of KNOWLEDGE_CARDS) {
      expect([0, 1, 2, 3], `card ${c.id} domainId`).toContain(c.domainId);
      expect(c.title.trim().length, `card ${c.id} title`).toBeGreaterThan(0);
      expect(c.keywords.length, `card ${c.id} keywords`).toBeGreaterThan(0);
    }
  });
});

describe('R6 — intégrité des QCM', () => {
  it('≥ 2 options, correctIndex dans les bornes, explication + domaine cohérents', () => {
    for (const [domain, questions] of Object.entries(DOMAIN_QUESTION_BANKS)) {
      for (const q of questions) {
        expect(q.options.length, `quiz ${q.id} options`).toBeGreaterThanOrEqual(2);
        expect(q.correctIndex, `quiz ${q.id} correctIndex bas`).toBeGreaterThanOrEqual(0);
        expect(q.correctIndex, `quiz ${q.id} correctIndex haut`).toBeLessThan(q.options.length);
        expect(q.explanation.trim().length, `quiz ${q.id} explanation`).toBeGreaterThan(0);
        expect(String(q.domainId), `quiz ${q.id} domaine`).toBe(domain);
      }
    }
  });
});

describe('R6 — schéma des bases annexes', () => {
  it('base livre : unitId ∈ 1..11, keywords et réponse non vides', () => {
    for (const b of BOOK_TUTOR_QA) {
      expect(b.unitId, `book ${b.id} unitId`).toBeGreaterThanOrEqual(1);
      expect(b.unitId, `book ${b.id} unitId`).toBeLessThanOrEqual(11);
      expect(b.keywords.length, `book ${b.id} keywords`).toBeGreaterThan(0);
      expect(b.answer.trim().length, `book ${b.id} answer`).toBeGreaterThan(0);
    }
  });
  it('méthodologie : keywords et réponse non vides', () => {
    for (const m of METHODOLOGY_QA) {
      expect(m.keywords.length, `methodo ${m.id} keywords`).toBeGreaterThan(0);
      expect(m.answer.trim().length, `methodo ${m.id} answer`).toBeGreaterThan(0);
    }
  });
  it('guide : chaque carte a des sections, chaque section a des puces', () => {
    for (const g of STUDY_GUIDE_CARDS) {
      expect(g.sections.length, `guide ${g.id} sections`).toBeGreaterThan(0);
      for (const s of g.sections) {
        expect(s.bullets.length, `guide ${g.id} / ${s.heading}`).toBeGreaterThan(0);
      }
    }
  });
});

describe('R6 — verrou d’orthographe scientifique (S1/S6/S8)', () => {
  // فيغوص (« fa-yaghūs » = donc il subducte) est CORRECT et volontairement exclu.
  const FORBIDDEN = ['الوشام', 'منيل', 'تقارب متباعد'];
  const allContent = [
    ...KNOWLEDGE_CARDS.map((c) => `${c.title} ${c.shortAnswer}`),
    ...BOOK_TUTOR_QA.map((b) => b.answer),
    ...STUDY_GUIDE_CARDS.flatMap((g) => g.sections.flatMap((s) => s.bullets)),
    ...TUTOR_KNOWLEDGE.map((c) => c.content),
  ].join('\n');

  for (const bad of FORBIDDEN) {
    it(`aucune occurrence de « ${bad} »`, () => {
      expect(allContent.includes(bad)).toBe(false);
    });
  }
});
