// src/services/guidedKeywordCounterProof.test.ts
// Contre-épreuve de la vérification par mots-clés des questions guidées de leçon
// (InteractiveLessonView → GUIDED_DOC_QA), la surface visée par le constat #33.
//
// #43 — La question « حدد اتجاه حدوث الاستنساخ » n'exigeait que les caractères
// « 5 » et « 3 » : la date « 2035 » était acceptée, tandis que la réponse juste
// écrite en toutes lettres (« من الطرف الخماسي نحو الطرف الثلاثي ») était refusée.
import { describe, it, expect } from 'vitest';
import { ACTIVE_LESSONS } from '../data/activeLessons';
import { validateKeywordAnswer } from './proteinChapterValidationService';

type GuidedQuestion = {
  id: string;
  requiredKeywords?: string[];
  forbiddenKeywords?: string[];
  successMessageAr?: string;
};

const QUESTIONS: GuidedQuestion[] = Object.values(ACTIVE_LESSONS).flatMap((lesson) =>
  (lesson.blocks ?? []).flatMap((block: { type?: string; questions?: GuidedQuestion[] }) =>
    block.type === 'GUIDED_DOC_QA' ? (block.questions ?? []) : [],
  ),
);

const valide = (answer: string, q: GuidedQuestion) =>
  validateKeywordAnswer(answer, q.requiredKeywords ?? [], q.forbiddenKeywords ?? []).valid;

const question = (id: string) => {
  const q = QUESTIONS.find((x) => x.id === id);
  if (!q) throw new Error(`question introuvable : ${id}`);
  return q;
};

describe('#43 — contre-épreuve des questions guidées par mots-clés', () => {
  it('le corpus de questions guidées est bien celui attendu', () => {
    expect(QUESTIONS.length).toBeGreaterThanOrEqual(22);
  });

  it('sens inverse : aucune réponse creuse ou hors-sujet n’est acceptée', () => {
    const rebuts = ['كرة القدم رياضة جميلة والطقس حار اليوم', 'لا اعرف الجواب', '   ', '2035'];
    const fuites: string[] = [];
    for (const texte of rebuts) {
      for (const q of QUESTIONS) if (valide(texte, q)) fuites.push(`${q.id} ← « ${texte.trim()} »`);
    }
    expect(fuites, `réponses non valables acceptées : ${fuites.join(', ')}`).toEqual([]);
  });

  it('direction de transcription : les graphies légitimes sont acceptées', () => {
    const q = question('transcription_direction');
    for (const bonne of [
      "من 5 نحو 3",
      "الاتجاه 5' → 3'",
      "5'->3'",
      'يتم في الاتجاه من 5 الى 3',
      'من الطرف الخماسي نحو الطرف الثلاثي', // réponse en toutes lettres
      'الخماسي ⟶ الثلاثي',
    ]) {
      expect(valide(bonne, q), `refusée à tort : ${bonne}`).toBe(true);
    }
  });

  it('direction de transcription : une suite de chiffres sans sens est refusée', () => {
    const q = question('transcription_direction');
    // « 2035 » contient un 5 et un 3 : c'était le faux positif d'origine.
    for (const mauvaise of ['2035', '53', '3 5', '555']) {
      expect(valide(mauvaise, q), `acceptée à tort : ${mauvaise}`).toBe(false);
    }
  });

  it('un mot-clé dont toutes les variantes disparaissent à la normalisation ne valide rien', () => {
    // normalizeAr efface la ponctuation : une variante « → » seule devient vide,
    // et `includes('')` est toujours vrai. Ce piège doit rester fermé.
    expect(validateKeywordAnswer('كرة القدم', ['→'], []).valid).toBe(false);
    expect(validateKeywordAnswer('n’importe quoi', ['->|→'], []).valid).toBe(false);
  });

  it('l’alternance « | » reste rétrocompatible avec les mots-clés simples', () => {
    expect(validateKeywordAnswer('يحتوي على الريبوزوم', ['الريبوزوم'], []).valid).toBe(true);
    expect(validateKeywordAnswer('نص quelconque', ['الريبوزوم'], []).valid).toBe(false);
  });
});
