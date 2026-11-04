import { test } from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import { createSimulationController, examPaperHTML } from "../js/ui/screens/simulation.js";

/* ============================================================================
   Décision du propriétaire (2026-09-20) : l'écran d'épreuve n'affiche plus
   AUCUNE question. L'épreuve = les exercices du sujet, leur barème (dépend
   de l'année et de la filière) et le sujet officiel en PDF. Les questions
   officielles restent encodées dans les inventaires — jamais à l'écran.
   ========================================================================== */

const subject = {
  id: 1,
  pdfLocalUrl: "/subjects/SE/2026/sujet-1.pdf",
  exercises: [
    {
      number: 1,
      label: "تركيب البروتين",
      max: 5,
      desc: "البنية الفراغية",
      poles: {
        E: { modelAnswer: "مرجع تدريبي سري حتى التسليم" }
      }
    },
    { number: 2, label: "المناعة", max: 7 },
    { number: 3, label: "الرسالة العصبية", max: 8 }
  ]
};
const inventory = {
  tasks: [
    {
      id: "2026-S1-E1-Q1",
      exerciseNumber: 1,
      order: 1,
      page: 1,
      prompt: "اشرح آلية تركيب البروتين.",
      maxPoints: 5,
      documentRefs: [],
      promptSource: "official",
      scoringReviewStatus: "provisional",
      trainingMappings: [{ exerciseNumber: 1, pole: "E", kind: "direct" }]
    }
  ]
};

test("l'épreuve active expose les exercices et le barème, jamais une question ni un modèle", () => {
  const html = examPaperHTML({ subject, inventory, completed: false });
  // Un champ de rédaction par exercice, avec le barème officiel affiché.
  assert.match(html, /data-free-exercise="1"/);
  assert.match(html, /data-free-exercise="2"/);
  assert.match(html, /data-free-exercise="3"/);
  assert.match(html, /5 نقطة/);
  assert.match(html, /7 نقطة/);
  assert.match(html, /8 نقطة/);
  assert.match(html, /data-exam-total="20"/);
  // Le sujet officiel est la source des questions : il est rendu dans l'app.
  assert.match(html, /data-pdf-canvas/);
  assert.match(html, /data-exercise-pdf="1"/);
  // Les trois avis ont été retirés de la page de réponses.
  assert.doesNotMatch(html, /اختبار صامت/);
  assert.doesNotMatch(html, /التنقيط غير معاير/);
  assert.doesNotMatch(html, /الأسئلة كلها في ملف الموضوع الرسمي/);
  // AUCUNE question : ni le texte officiel, ni la structure de tâche.
  assert.doesNotMatch(html, /اشرح آلية تركيب البروتين/);
  assert.doesNotMatch(html, /data-task-answer|data-official-task|bac-consigne|data-task-source/);
  // Et aucun indice, modèle, diagnostic ou action de correction.
  assert.doesNotMatch(html, /مرجع تدريبي سري/);
  assert.doesNotMatch(html, /data-check|model-box|id="ws-panic"|id="ws-brouillon"/);
  assert.doesNotMatch(html, /textarea[^>]+disabled/);
});

test("la relecture après remise verrouille les réponses, sans question ni modèle", () => {
  const html = examPaperHTML({ subject, inventory, completed: true });
  assert.match(html, /simulation-review-notice/);
  assert.match(html, /textarea[^>]+disabled/);
  assert.match(html, /data-qualitative-free="1"/);
  // Toujours aucune question affichée, et aucun modèle de réponse.
  assert.doesNotMatch(html, /اشرح آلية تركيب البروتين/);
  assert.doesNotMatch(html, /مرجع تدريبي سري/);
  assert.doesNotMatch(html, /data-check|التقدير:/);
});

test("le contrôleur persiste la copie puis bascule réellement en relecture après remise", () => {
  const dom = new JSDOM(
    '<!doctype html><body><div id="global-timer-bar"></div><section id="view-workspace"></section></body>'
  );
  globalThis.document = dom.window.document;
  /* Le vrai store sépare la progression PAR EXERCICE : le mock doit faire
     pareil, sinon la copie d'un exercice vide écrase celle d'un autre. */
  const progressByExercise = new Map();
  const progressFor = (n) => {
    if (!progressByExercise.has(n)) {
      progressByExercise.set(n, { answeredAny: false, freeAnswer: "", officialTaskAnswers: {} });
    }
    return progressByExercise.get(n);
  };
  const progress = progressFor(1);
  const store = {
    state: {
      yearId: "2026",
      sujetId: 1,
      activeExercise: 1,
      sessionStatus: "active",
      sessionEndReason: null
    },
    exercise: (_yearId, _sujetId, exerciseNumber) => progressFor(exerciseNumber),
    save() {},
    setActiveExercise(number) {
      this.state.activeExercise = number;
    },
    isSessionActive() {
      return this.state.sessionStatus === "active";
    },
    finishSession(reason) {
      this.state.sessionStatus = "completed";
      this.state.sessionEndReason = reason;
    },
    leaveSession() {
      this.state.sessionStatus = "idle";
    }
  };
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];
  const controller = createSimulationController({
    $,
    $$,
    bindMics() {},
    closeModal: () => $("#test-modal")?.remove(),
    goHome() {},
    micButton: (id) => `<button class="btn-mic" data-mic="${id}">🎙️</button>`,
    officialCoverageForSubject: () => ({ simulationEligible: true, blockers: [] }),
    officialTaskInventoryFor: () => inventory,
    openDrawer() {},
    openModal(title, body, actions = "") {
      const modal = document.createElement("div");
      modal.id = "test-modal";
      modal.innerHTML = `${title}${body}${actions}<button data-close="ok">OK</button>`;
      document.body.appendChild(modal);
    },
    showScreen() {},
    store,
    timers: { stopAll() {} },
    toast() {},
    yearObj: () => ({ id: "2026", sujets: [subject] }),
    sujetObj: () => subject
  });

  controller.renderSimulation();
  // La réponse vit par exercice, plus par tâche : aucune question à l'écran.
  assert.equal($('[data-task-answer="2026-S1-E1-Q1"]'), null);
  const answer = $('[data-exercise-free="1"]');
  answer.value = "إجابة التلميذ";
  answer.dispatchEvent(new dom.window.Event("input", { bubbles: true }));
  assert.equal(progress.freeAnswer, "إجابة التلميذ");
  $("#simulation-finish").click();
  $("#simulation-finish-yes").click();

  assert.equal(store.state.sessionStatus, "completed");
  assert.equal($('[data-exercise-free="1"]').disabled, true);
  assert.doesNotMatch($("#view-workspace").textContent, /اشرح آلية تركيب البروتين/);
  assert.equal($("#simulation-finish"), null);
});
