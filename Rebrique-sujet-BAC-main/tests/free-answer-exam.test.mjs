/* ============================================================
   Épreuve « copie libre » — garde-fous + SE 2021 structurée 4D
   ------------------------------------------------------------
   Historique : le PDF officiel de SE 2021 avait une couche texte aux
   chiffres corrompus (barème extrait « 05 / 40 / 00 » pour un barème
   réel 5 + 7 + 8 — mesuré par `npm run pdftext:status`) : l'année était
   ouverte en « copie libre » — le sujet officiel lu dans l'application,
   un champ de rédaction par exercice, aucune consigne encodée, aucune
   note calculée.
   Le 2026-09-20, à la demande du propriétaire (prolongement de la
   décision 6 de PROMPT_DECISIONS_PROPRIETAIRE.md), les consignes ont
   été extraites par le pipeline OCR du dépôt
   (scripts/extracted/SE/2021) et SE 2021 est devenue une épreuve 4D
   complète. Il n'existe donc PLUS aucune année « copie libre ».
   Ce test verrouille :
     - plus aucune année « copie libre » dans le catalogue ;
     - le mécanisme « copie libre » reste correct s'il est un jour
       réactivé (garde-fous du domaine sur un sujet synthétique) ;
     - SE 2021 ouvre une vraie épreuve 4D : carte, choix du sujet,
       consignes officielles, PDF servi par l'application, copie
       enregistrée puis verrouillée.
   ============================================================ */
import { test, after } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { JSDOM } = require("jsdom");
const __dirname = dirname(fileURLToPath(import.meta.url));

const html = readFileSync(join(__dirname, "..", "index.html"), "utf8");
const dom = new JSDOM(html, { url: "http://localhost/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.localStorage = dom.window.localStorage;
dom.window.scrollTo = () => {};

const { loadAllYears } = await import("../data/subjects.js");
await loadAllYears();
const { init } = await import("../js/ui.js");
const { store } = await import("../js/store.js");
const { soundEngine, timers } = await import("../js/engine.js");
const { APP_CONFIG: FULL_APP_CONFIG } = await import("./helpers/full-app-config.mjs");
await init();

after(() => {
  timers.stopAll();
  soundEngine.stop();
  try {
    dom.window.close();
  } catch (e) {}
});

const $ = (s, root = globalThis.document) => root.querySelector(s);
const $$ = (s, root = globalThis.document) => [...root.querySelectorAll(s)];
function click(sel) {
  const element = typeof sel === "string" ? $(sel) : sel;
  if (!element) throw new Error(`Élément introuvable: ${sel}`);
  element.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
}
function type(sel, value) {
  const input = $(sel);
  if (!input) throw new Error(`Champ introuvable: ${sel}`);
  input.value = value;
  input.dispatchEvent(new dom.window.Event("input", { bubbles: true }));
}

function goToSeStream() {
  if ($("#simulation-home") && !$("#view-workspace").classList.contains("hidden")) {
    click("#simulation-home");
  }
  store.reset();
  for (let tour = 0; tour < 3 && !/علوم تجريبية/.test($("#stream-fab-label").textContent); tour += 1) {
    click("#btn-stream-fab");
  }
  assert.match($("#stream-fab-label").textContent, /علوم تجريبية/);
}

test("plus aucune année n'est en copie libre — SE 2021 est structurée 4D", () => {
  for (const year of FULL_APP_CONFIG.years) {
    assert.notEqual(year.answerMode, "free", `${year.id} ne doit plus être une armature « copie libre »`);
    for (const sujet of year.sujets) {
      assert.notEqual(sujet.answerMode, "free", `${year.id}/S${sujet.id} doit être structuré`);
    }
  }
  /* SE 2021 : la dernière armature, structurée le 2026-09-20. */
  const se2021 = FULL_APP_CONFIG.years.find((y) => y.id === "2021" && (y.stream || "se") === "se");
  assert.ok(se2021, "2021 SE doit exister");
  assert.equal(se2021.sujets.length, 2);
  for (const sujet of se2021.sujets) {
    assert.deepEqual(
      sujet.exercises.map((ex) => ex.max),
      [5, 7, 8]
    );
    for (const exercise of sujet.exercises) {
      for (const pole of ["N", "S", "E", "W"]) {
        assert.ok(exercise.poles[pole], `2021/S${sujet.id}/E${exercise.number} sans pôle ${pole}`);
      }
      const sum = ["N", "S", "E", "W"].reduce((total, p) => total + (exercise.poles[p].points || 0), 0);
      assert.ok(Math.abs(sum - exercise.max) < 1e-6, `2021/S${sujet.id}/E${exercise.number} : pôles ≠ max`);
    }
  }
});

test("les consignes officielles de 2021 citent leur preuve OCR, et la preuve existe", () => {
  const evidenceDir = join(__dirname, "..", "scripts", "extracted", "SE", "2021");
  assert.ok(existsSync(join(evidenceDir, "sujet-1.ocr.txt")), "preuve OCR sujet-1 manquante");
  assert.ok(existsSync(join(evidenceDir, "sujet-2.ocr.txt")), "preuve OCR sujet-2 manquante");
  const se2021 = FULL_APP_CONFIG.years.find((y) => y.id === "2021");
  let official = 0;
  for (const sujet of se2021.sujets) {
    for (const exercise of sujet.exercises) {
      for (const pole of Object.values(exercise.poles)) {
        if (pole.bacPromptSource !== "official") continue;
        official += 1;
        assert.match(
          pole.bacPromptNotes || "",
          /scripts\/extracted\/SE\/2021/,
          "la consigne officielle doit citer sa preuve d'extraction"
        );
      }
    }
  }
  assert.equal(official, 16, "2 sujets × (2 + 3 + 3) consignes officielles attendues");
});

test("le mécanisme « copie libre » reste verrouillé pour un sujet synthétique", async () => {
  const { isFreeAnswerSubject, buildOfficialCoverageReport, examOpenable } =
    await import("../js/domain/subjects/official-coverage.js");
  /* Sujet synthétique : ce que serait une future armature (année sans
     consigne encodable). Le domaine doit continuer à l'ouvrir en épreuve
     sans note — et à refuser un sujet sans PDF ni barème. */
  const synthetic = {
    id: 1,
    answerMode: "free",
    pdfLocalUrl: "/subjects/X/2099/sujet-1.pdf",
    exercises: [
      { number: 1, max: 5, poles: {} },
      { number: 2, max: 7, poles: {} },
      { number: 3, max: 8, poles: {} }
    ]
  };
  assert.equal(isFreeAnswerSubject(synthetic), true);
  const report = buildOfficialCoverageReport({ yearId: "2099", subject: synthetic, inventory: null });
  assert.equal(report.freeAnswerEligible, true);
  assert.equal(report.simulationEligible, false, "aucune note ne peut être calculée sans inventaire");
  assert.equal(examOpenable(report), true, "l'épreuve reste ouverte");

  const noPdf = { ...synthetic, pdfLocalUrl: undefined, pdfExternalUrl: undefined };
  assert.equal(isFreeAnswerSubject(noPdf), false, "sans PDF, pas d'épreuve copie libre");
  const noBareme = { ...synthetic, exercises: [{ number: 1, max: null, poles: {} }] };
  assert.equal(
    isFreeAnswerSubject(noBareme),
    true,
    "barème null reste mesurable (« 00 » lu) — épreuve ouverte"
  );
  const noExercises = { ...synthetic, exercises: [] };
  assert.equal(isFreeAnswerSubject(noExercises), false, "sans exercice, rien à rédiger");

  /* Et un sujet structuré réel n'est JAMAIS en copie libre. */
  const real = FULL_APP_CONFIG.years.find((y) => y.id === "2021").sujets[0];
  assert.equal(isFreeAnswerSubject(real), false);
});

test("2021 ouvre une épreuve 4D, pas une consultation ni une copie libre", () => {
  goToSeStream();
  const card = $('#year-grid [data-hub-year="2021"]');
  assert.ok(card, "la carte 2021 doit exister");
  assert.equal(card.dataset.kind, "exam", "2021 est une épreuve");
  const button = card.querySelector("[data-year]");
  assert.ok(button, "2021 doit avoir un bouton d'épreuve");
  assert.equal(button.disabled, false);
  /* L'infobulle annonce désormais le جرد المهام (16 consignes officielles
     sur 24 tâches), plus l'ancien « غير مُشفَّرة » de l'armature. */
  assert.match(card.getAttribute("title"), /جرد المهام/);
  assert.doesNotMatch(card.getAttribute("title"), /غير مُشفَّرة/);
});

test("l'écran de choix de 2021 affiche l'inventaire, le barème et la simulation", () => {
  goToSeStream();
  click('#year-grid [data-year="2021"]');
  assert.ok(!$("#view-guide").classList.contains("hidden"));
  click("#guide-next");
  assert.ok(!$("#view-strategy").classList.contains("hidden"));

  for (const card of $$("#view-strategy [data-subject-coverage]")) {
    assert.equal(card.dataset.examOpenable, "true", "l'épreuve doit être ouvrable");
    assert.equal(card.dataset.simulationEligible, "true", "la note est calculable (consignes encodées)");
  }
  /* Plus d'écran « absence de consignes » : l'inventaire s'affiche. */
  assert.match($("#view-strategy").textContent, /جرد المهام: \d+ مهمة/);
  assert.doesNotMatch($("#view-strategy").textContent, /null/);
  assert.match($("#view-strategy .subject-card-head").textContent, /20\.00 نقطة/);
  /* 2 sujets × 3 exercices : six champs d'estimation. */
  assert.equal($$("#view-strategy .calc-input").length, 6);
});

test("l'épreuve 2021 affiche les exercices, leur barème et le sujet en PDF", () => {
  goToSeStream();
  click('#year-grid [data-year="2021"]');
  click("#guide-next");
  click('#view-strategy [data-confirm="1"][data-session-mode="bac"]');
  assert.ok(!$("#view-workspace").classList.contains("hidden"));
  assert.equal($("#view-workspace").dataset.sessionMode, "bac");
  assert.equal($("#view-workspace").dataset.answerMode, undefined, "plus d'attribut data-answer-mode");

  /* Décision du propriétaire (2026-09-20) : AUCUNE question à l'écran —
     les trois exercices du sujet, leur barème (5+7+8) et le sujet en PDF. */
  const fields = $$("#view-workspace [data-exercise-free]");
  assert.equal(fields.length, 3, "un champ de rédaction par exercice");
  assert.deepEqual(
    fields.map((field) => Number(field.dataset.exercise)),
    [1, 2, 3]
  );
  for (const field of fields) assert.equal(field.disabled, false);
  assert.equal($$("#view-workspace [data-task-answer]").length, 0, "aucune tâche affichée");
  assert.equal($$("#view-workspace .bac-consigne").length, 0, "aucune consigne affichée");
  const paper = $("#view-workspace").textContent;
  assert.match(paper, /5 نقطة/);
  assert.match(paper, /7 نقطة/);
  assert.match(paper, /8 نقطة/);
  assert.match(paper, /بارم الموضوع/);

  // Le sujet officiel s'ouvre dans l'application, en visionneuse intégrée.
  click("#simulation-pdf");
  const frame = $(".drawer.open iframe.pdf-frame");
  assert.ok(frame, "le sujet doit s'afficher en visionneuse intégrée");
  assert.match(frame.getAttribute("src"), /^\/subjects\/SE\/2021\/sujet-1\.pdf/);
  assert.ok($(".drawer.open a[download]"), "le téléchargement hors ligne reste proposé");
  click(".drawer [data-close]");

  // L'épreuve garde son chronomètre officiel et sa remise de copie.
  assert.ok(!$("#global-timer-bar").classList.contains("hidden"), "le chronomètre doit tourner");
  assert.equal($("#simulation-finish").textContent.trim(), "✓ تسليم الورقة");
});

test("la copie 2021 est enregistrée puis verrouillée par la remise", () => {
  goToSeStream();
  click('#year-grid [data-year="2021"]');
  click("#guide-next");
  click('#view-strategy [data-confirm="1"][data-session-mode="bac"]');
  const fields = $$("#view-workspace [data-exercise-free]");
  const exerciseNumber = Number(fields[0].dataset.exercise);
  const answer = "إجابة التلميذ: تحليل معطيات الوثائق ثم الاستدلال العلمي للإجابة عن التمرين الأول.";
  type(`[data-exercise-free="${exerciseNumber}"]`, answer);
  assert.equal(
    store.exercise("2021", 1, exerciseNumber).freeAnswer,
    answer,
    "la réponse doit être enregistrée localement"
  );

  click("#simulation-finish");
  assert.ok($(".modal"), "la remise demande confirmation");
  click("#simulation-finish-yes");

  assert.equal(store.state.sessionStatus, "completed");
  assert.equal(
    $("#view-workspace [data-exercise-free]").disabled,
    true,
    "la copie est verrouillée après la remise"
  );
  assert.equal(store.exercise("2021", 1, exerciseNumber).freeAnswer, answer, "la réponse survit à la remise");
  assert.ok($("#global-timer-bar").classList.contains("hidden"), "le chronomètre s'arrête");
  assert.equal($("#view-workspace").dataset.reviewMode, "true");
});
