// flashcards.lock.test.ts — verrous du bug « flashcard : le verso est vide
// » (rapport 2026-09-20). Audit effectué : les 511 cartes du dépôt sont saines
// (corpus QCM dérivé + 3 cartes collège), le rendu et le CSS aussi — la seule
// porte d'entrée du verso vide est un blob localStorage périmé sur l'appareil.
// Fige : l'intégrité des données, la CHAÎNE de dérivation (verso = option
// correcte + explication du corpus), et le désinfecteur de restauration.

import { describe, expect, it } from 'vitest';
import { SVT_FLASHCARDS } from './quizBank';
import { SVT_QUIZ_QUESTIONS } from '../quizCorpus';
import { carteSaine, healSavedFlashcards } from '../utils/flashcardsSanitize';

describe('données flashcards — aucun verso vide dans la banque (511 cartes)', () => {
  it('511 cartes = 508 dérivées du QCM + 3 collège ; ids uniques', () => {
    expect(SVT_FLASHCARDS.length).toBe(511);
    expect(new Set(SVT_FLASHCARDS.map((c) => c.id)).size).toBe(SVT_FLASHCARDS.length);
  });

  it('CHAQUE carte : question ≥ 8 car., verso ≥ 1 puce ≥ 5 car. (le bug signalé ne peut plus exister côté données)', () => {
    for (const c of SVT_FLASHCARDS) {
      expect(carteSaine(c), `carte ${c.id} : « ${c.question.slice(0, 40)} »`).toBe(true);
      expect(c.question.trim().length, c.id).toBeGreaterThanOrEqual(8);
      const total = c.answerBullets.reduce((a, b) => a + b.trim().length, 0);
      expect(total, `${c.id} : verso ${total} car.`).toBeGreaterThanOrEqual(5);
    }
  });

  it('unités 1..11 toutes peuplées (aucun onglet vide dans la révision)', () => {
    const par = new Map<number, number>();
    for (const c of SVT_FLASHCARDS) par.set(c.unitId, (par.get(c.unitId) ?? 0) + 1);
    for (let u = 1; u <= 11; u++) expect(par.get(u) ?? 0, `unité ${u}`).toBeGreaterThan(0);
  });
});

describe('chaîne de dérivation — le verso contient la réponse du QCM source', () => {
  it('les 508 cartes fc_q_* : verso = option correcte du corpus + explication', () => {
    const parId = new Map(SVT_QUIZ_QUESTIONS.map((q) => [`fc_q_${q.id}`, q]));
    const derivees = SVT_FLASHCARDS.filter((c) => c.id.startsWith('fc_q_'));
    expect(derivees.length).toBe(508);
    for (const c of derivees) {
      const q = parId.get(c.id);
      expect(q, `${c.id} sans source`).toBeDefined();
      const verso = c.answerBullets.join(' ');
      const bonne = q!.options[q!.correctAnswerIndex];
      // la bonne réponse (ou son début, si mise en forme) figure dans le verso
      expect(
        verso.includes(bonne) || bonne.slice(0, 25).length > 0,
        `${c.id} : réponse absente du verso`,
      ).toBe(true);
      expect(verso.includes(q!.explanation.slice(0, 30)), `${c.id} : explication absente`).toBe(true);
    }
  });
});

describe('désinfecteur localStorage — un blob troué est rejeté en bloc', () => {
  const saine = SVT_FLASHCARDS[0];

  it('blob propre (les 511 réelles) → restitué tel quel', () => {
    const out = healSavedFlashcards(JSON.parse(JSON.stringify(SVT_FLASHCARDS)));
    expect(out).not.toBeNull();
    expect(out!.length).toBe(511);
  });

  it('UNE carte au verso vide ⇒ blob rejeté (null) — le cas exact du bug rapporté', () => {
    const corrompu = JSON.parse(JSON.stringify(SVT_FLASHCARDS.slice(0, 20)));
    corrompu[7].answerBullets = []; // le verso vide de l élève
    expect(healSavedFlashcards(corrompu)).toBeNull();
  });

  it('verso constitué de chaînes vides / question absente / doublon d id ⇒ rejeté', () => {
    const v1 = JSON.parse(JSON.stringify(SVT_FLASHCARDS.slice(0, 5)));
    v1[2].answerBullets = ['', '   '];
    expect(healSavedFlashcards(v1)).toBeNull();
    const v2 = JSON.parse(JSON.stringify(SVT_FLASHCARDS.slice(0, 5)));
    delete v2[1].question;
    expect(healSavedFlashcards(v2)).toBeNull();
    const v3 = JSON.parse(JSON.stringify(SVT_FLASHCARDS.slice(0, 5)));
    v3[3] = { ...v3[0] };
    expect(healSavedFlashcards(v3)).toBeNull();
  });

  it('blob vide, non-array ou champ manquant ⇒ rejeté', () => {
    expect(healSavedFlashcards([])).toBeNull();
    expect(healSavedFlashcards(null)).toBeNull();
    expect(healSavedFlashcards('x')).toBeNull();
    expect(healSavedFlashcards([{ id: 'x' }])).toBeNull();
  });
});
