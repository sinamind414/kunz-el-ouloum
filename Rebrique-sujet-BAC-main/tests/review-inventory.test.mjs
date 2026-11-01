import { test } from "node:test";
import assert from "node:assert/strict";
import { findExercises, normalize, splitQuestions } from "../scripts/review-inventory.mjs";

/* La feuille de relecture (travail « C ») ne vaut que si ses deux briques
   tiennent : repérer les exercices, et découper les consignes numérotées.
   Les échantillons ci-dessous sont des extraits RÉELS du corpus, avec le
   défaut « transposé » (ligatures inversées, lettres manquantes). */

test("findExercises repère les trois exercices malgré la transposition", () => {
  const pages = [
    { page: 1, text: "التمرين األول: ( 40 نقاط ) تتميز اغشيه الخاليا" },
    { page: 2, text: "التمريــــن الثاني : بعض النص" },
    { page: 3, text: "التمرين الثالث: نص ثالث" }
  ];
  assert.deepEqual(
    findExercises(pages).map((entry) => [entry.number, entry.page]),
    [
      [1, 1],
      [2, 2],
      [3, 3]
    ]
  );
});

test("splitQuestions isole les consignes numérotées, dans l'ordre", () => {
  const text =
    "التمرين الأول: ( 05 نقاط) مقدمة 1 ــــ تَعرّف على المرحلتين (أ) و(ب) من الشكل (أ) مع التعليل. 2 ــــ ب ي ن في نص علمي آليات تركيب البروتين.";
  const questions = splitQuestions(text);
  assert.deepEqual(
    questions.map((question) => question.number),
    [1, 2]
  );
  // Le corps s'arrête net : sans quoi la consigne 1 avale le « 2 » de la
  // consigne suivante. D'où l'égalité stricte, pas un simple `match`.
  assert.equal(questions[0].body, "تعرف علي المرحلتين (ا) و(ب) من الشكل (ا) مع التعليل.");
  assert.equal(questions[1].body, "ب ي ن في نص علمي اليات تركيب البروتين.");
  assert.doesNotMatch(questions[0].body, /مقدمة/, "le préambule n'est pas une consigne");
});

test("splitQuestions ignore les chiffres du barème et des pages", () => {
  const questions = splitQuestions(
    "صفحة 1 من 11 المدة: 40 سا و 04 د 1 ) اذكر اسم العضية المسؤولة عن تركيب البروتين. 2 ) فسر الملاحظة المدونة اعلاه."
  );
  assert.deepEqual(
    questions.map((question) => question.number),
    [1, 2]
  );
});

test("normalize neutralise tatweel, diacritiques et variantes d'alef", () => {
  assert.equal(normalize("التمريــــن الْأَوّل"), "التمرين الاول");
});
