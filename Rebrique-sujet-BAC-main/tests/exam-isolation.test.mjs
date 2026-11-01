import test from "node:test";
import assert from "node:assert/strict";
import { examPaperHTML } from "../js/ui/screens/simulation.js";

/* Décision du propriétaire (2026-09-20) : l'écran d'épreuve n'affiche plus
   AUCUNE question — les exercices du sujet choisi, leur barème et le sujet
   officiel en PDF. Ce test verrouille l'isolement : jamais une question
   (officielle ou reconstruite), jamais une réponse modèle, jamais les
   exercices de l'autre sujet. */
test("l'épreuve rend les exercices du sujet choisi, sans question ni réponse modèle", () => {
  const subject = {
    id: 2,
    pdfLocalUrl: "/subjects/SE/2026/sujet-2.pdf",
    exercises: [
      { number: 1, label: "التمرين الأول", max: 5, desc: "البروتينات" },
      { number: 2, label: "التمرين الثاني", max: 7, poles: { N: { modelAnswer: "سر-الإجابة-النموذجية" } } },
      { number: 3, label: "التمرين الثالث", max: 8 }
    ]
  };
  const html = examPaperHTML({
    subject,
    inventory: {
      tasks: [{ id: "S2-E1-T1", exerciseNumber: 1, order: 1, prompt: "تعليمة رسمية", page: 1, maxPoints: 4 }]
    },
    completed: false
  });
  // Les exercices du sujet, avec le barème officiel de la session.
  assert.match(html, /data-free-exercise="1"/);
  assert.match(html, /data-free-exercise="2"/);
  assert.match(html, /data-free-exercise="3"/);
  assert.match(html, /5 نقطة/);
  assert.match(html, /7 نقطة/);
  assert.match(html, /8 نقطة/);
  assert.match(html, /data-exam-total="20"/);
  // Le sujet officiel est servi dans l'épreuve : c'est LA source des questions.
  assert.match(html, /data-pdf-src="\/subjects\/SE\/2026\/sujet-2\.pdf"/);
  // Aucune question, aucun modèle de réponse, aucune tâche affichée.
  assert.doesNotMatch(html, /تعليمة رسمية/);
  assert.doesNotMatch(html, /سر-الإجابة-النموذجية|مراجع التدريب/);
  assert.doesNotMatch(html, /data-task-answer|data-official-task|bac-consigne/);
  // Jamais l'autre sujet.
  assert.doesNotMatch(html, /الموضوع الأول/);
});
