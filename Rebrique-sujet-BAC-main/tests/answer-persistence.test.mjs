/* ============================================================
   Persistance des réponses pendant la frappe (D11)
   ------------------------------------------------------------
   Chaque frappe déclenchait store.save(), qui resérialise TOUT l'état :
   la saisie saccadait sur téléphone. L'écriture est désormais regroupée.
   Ce fichier verrouille les deux moitiés du contrat :
     • l'état en mémoire est à jour dès la frappe (rien ne dépend du
       minuteur pour la suite du parcours) ;
     • la remise de copie écrit immédiatement, parce que l'application
       promet « حُفظت الإجابات محلياً » juste après.
   ============================================================ */
import { test, after } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { JSDOM } = require("jsdom");
const __dirname = dirname(fileURLToPath(import.meta.url));

const dom = new JSDOM(readFileSync(join(__dirname, "..", "index.html"), "utf8"), {
  url: "http://localhost/"
});
globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.localStorage = dom.window.localStorage;
dom.window.scrollTo = () => {};

const { loadAllYears } = await import("../data/subjects.js");
await loadAllYears();
const { init } = await import("../js/ui.js");
const { soundEngine, timers } = await import("../js/engine.js");
const { store } = await import("../js/store.js");
await init();

after(() => {
  timers.stopAll();
  soundEngine.stop();
  try {
    dom.window.close();
  } catch (e) {}
});

const $ = (sel, root = globalThis.document) => root.querySelector(sel);
function click(target) {
  const element = typeof target === "string" ? $(target) : target;
  if (!element) throw new Error(`Élément introuvable: ${target}`);
  element.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
}
function type(selector, value) {
  const input = $(selector);
  if (!input) throw new Error(`Champ introuvable: ${selector}`);
  input.value = value;
  input.dispatchEvent(new dom.window.Event("input", { bubbles: true }));
}
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const persisted = () => globalThis.localStorage.getItem("boussole4d.v4") || "";

test("D11 : la frappe met l'état à jour tout de suite et regroupe l'écriture", async () => {
  click('#year-grid [data-year="2025"]');
  click("#guide-next");
  click('#view-strategy [data-confirm="1"][data-session-mode="bac"]');

  /* Décision du propriétaire (2026-09-20) : un champ de rédaction PAR
     EXERCICE — les questions se lisent dans le sujet officiel en PDF. */
  const field = $('#view-workspace [data-exercise-free="1"]');
  assert.ok(field, "une zone de réponse par exercice est proposée");
  const exerciseNumber = Number(field.dataset.exercise);
  assert.equal(exerciseNumber, 1);
  const ANSWER = "إجابة مكتوبة أثناء الإمتحان";

  type('[data-exercise-free="1"]', ANSWER);

  // 1. L'état en mémoire est à jour immédiatement : la suite du parcours
  //    (remise, relecture) ne dépend pas du minuteur.
  assert.equal(
    store.exercise(store.state.yearId, store.state.sujetId, exerciseNumber).freeAnswer,
    ANSWER,
    "l'état doit être à jour dès la frappe"
  );

  // 2. L'écriture disque est regroupée, pas synchrone à chaque frappe.
  assert.ok(
    !persisted().includes(ANSWER),
    "l'écriture doit être différée : c'est tout l'intérêt du regroupement"
  );

  // 3. Elle finit par arriver sans aucune action de l'élève.
  await wait(600);
  assert.ok(persisted().includes(ANSWER), "la réponse doit être écrite après le regroupement");
});

test("D11 : la remise de copie écrit immédiatement, sans attendre le minuteur", async () => {
  const field = $('#view-workspace [data-exercise-free="1"]');
  assert.ok(field, "une zone de réponse par exercice est disponible");
  const exerciseNumber = Number(field.dataset.exercise);
  const FINAL = "الجملة الأخيرة المكتوبة قبل التسليم";

  type('[data-exercise-free="1"]', FINAL);
  assert.equal(store.exercise(store.state.yearId, store.state.sujetId, exerciseNumber).freeAnswer, FINAL);

  click("#simulation-finish");
  click("#simulation-finish-yes");

  // Aucune attente : « حُفظت الإجابات محلياً » est affiché à cet instant.
  assert.ok(persisted().includes(FINAL), "la remise doit écrire tout de suite, pas dans 350 ms");
  assert.equal(store.state.sessionStatus, "completed");
});

test("D11 : la page masquée vide la file d'écriture en attente", async () => {
  const field = $("#view-workspace [data-task-answer]");
  if (!field || field.disabled) {
    // La copie est verrouillée après remise : on rouvre une session.
    click("#simulation-home");
    click('#year-grid [data-year="2025"]');
    click("#guide-next");
    click('#view-strategy [data-confirm="2"][data-session-mode="bac"]');
  }
  const active = $('#view-workspace [data-exercise-free="1"]');
  assert.ok(active && !active.disabled, "une zone de réponse éditable est disponible");

  const HIDDEN = "إجابة محفوظة عند إخفاء الصفحة";
  type('[data-exercise-free="1"]', HIDDEN);
  assert.ok(!persisted().includes(HIDDEN), "l'écriture est en attente");

  // Ce que fait un navigateur qui met l'onglet en arrière-plan.
  Object.defineProperty(globalThis.document, "visibilityState", {
    value: "hidden",
    configurable: true
  });
  globalThis.window.dispatchEvent(new globalThis.window.Event("visibilitychange"));

  assert.ok(
    persisted().includes(HIDDEN),
    "masquer la page doit vider la file : aucune réponse ne doit être perdue"
  );
});

test("D11 : le déchargement de la page vide aussi la file", async () => {
  const active = $('#view-workspace [data-exercise-free="1"]');
  assert.ok(active && !active.disabled, "une zone de réponse éditable est disponible");

  const UNLOAD = "إجابة محفوظة عند مغادرة الصفحة";
  type('[data-exercise-free="1"]', UNLOAD);
  assert.ok(!persisted().includes(UNLOAD), "l'écriture est en attente");

  globalThis.window.dispatchEvent(new globalThis.window.Event("pagehide"));

  assert.ok(persisted().includes(UNLOAD), "pagehide doit écrire avant de perdre la main");
});
