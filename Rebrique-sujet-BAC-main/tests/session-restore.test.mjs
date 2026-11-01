/* ============================================================
   Restauration de session et vocabulaire de l'épreuve
   ------------------------------------------------------------
   Deux régressions réelles, toutes deux invisibles dans les tests
   d'écran :
   1. après « ✓ تسليم الورقة », un rechargement renvoyait l'élève au
      hub : la condition de restauration exigeait sessionMode ===
      "simulation", un mode supprimé depuis que l'épreuve est le seul
      mode. La copie rendue devenait donc inaccessible.
   2. l'écran de choix parlait encore d'« entraînement » (موضوع
      التدريب) alors que le mode entraînement n'existe plus.
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
const { store } = await import("../js/store.js");
const { soundEngine, timers } = await import("../js/engine.js");
await init();

after(() => {
  timers.stopAll();
  soundEngine.stop();
  try {
    dom.window.close();
  } catch (e) {}
});

const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
function click(sel) {
  const element = $(sel);
  if (!element) throw new Error(`Élément introuvable: ${sel}`);
  element.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
}
function type(sel, value) {
  const input = $(sel);
  if (!input) throw new Error(`Champ introuvable: ${sel}`);
  input.value = value;
  input.dispatchEvent(new dom.window.Event("input", { bubbles: true }));
}
/** Recharge l'application : l'état est relu depuis localStorage. */
async function reload() {
  store.load();
  await init();
}

const ANSWER = "إجابة الطالب بعد قراءة الوثائق.";

test("parcours complet : épreuve, réponse, puis remise de la copie", () => {
  click('#year-grid [data-year="2025"]');
  assert.ok(!$("#view-guide").classList.contains("hidden"));
  click("#guide-next");
  assert.ok(!$("#view-strategy").classList.contains("hidden"));
  // L'écran de choix parle de l'épreuve, plus d'un entraînement supprimé.
  assert.equal($("#view-strategy h2").textContent.trim(), "اختر موضوع الإمتحان");
  assert.doesNotMatch($("#view-strategy").textContent, /التدريب/);

  click('#view-strategy [data-confirm="1"][data-session-mode="bac"]');
  assert.ok(!$("#view-workspace").classList.contains("hidden"));
  assert.equal($("#view-workspace").dataset.reviewMode, "false");

  /* Un champ de rédaction par exercice (décision du propriétaire 2026-09-20) :
     aucune question n'est affichée — elles se lisent dans le sujet en PDF. */
  const field = $('#view-workspace [data-exercise-free="1"]');
  assert.ok(field, "un champ de rédaction par exercice");
  type('[data-exercise-free="1"]', ANSWER);
  click("#simulation-finish");
  click("#simulation-finish-yes");
  assert.equal(store.state.sessionStatus, "completed");
  assert.equal($("#view-workspace").dataset.reviewMode, "true");
});

test("après remise, un rechargement ramène la relecture et la copie", async () => {
  await reload();
  const visible = $$(".screen")
    .filter((screen) => !screen.classList.contains("hidden"))
    .map((s) => s.id);
  assert.deepEqual(visible, ["view-workspace"], "la relecture doit être restaurée, pas le hub");
  assert.equal($("#view-workspace").dataset.reviewMode, "true");
  assert.equal($("#simulation-finish"), null, "une copie rendue ne se rend pas deux fois");
  const locked = $$("#view-workspace [data-exercise-free]");
  assert.ok(locked.length > 0, "les réponses rendues doivent être affichées");
  for (const field of locked) assert.equal(field.disabled, true);
  assert.ok(
    locked.some((field) => field.value === ANSWER),
    "la copie de l'élève doit être retrouvée"
  );
  assert.equal(store.state.sessionStatus, "completed");
});

test("une session active est restaurée sur l'écran où l'élève se trouvait", async () => {
  // Repart du hub, ouvre une session, s'arrête sur l'écran de stratégie.
  click("#simulation-home");
  assert.ok(!$("#view-hub").classList.contains("hidden"));
  click('#year-grid [data-year="2024"]');
  await reload();
  const visible = $$(".screen")
    .filter((screen) => !screen.classList.contains("hidden"))
    .map((s) => s.id);
  assert.deepEqual(visible, ["view-guide"]);
  assert.equal(store.state.sessionStatus, "active");
  click("#guide-exit");
  assert.ok(!$("#view-hub").classList.contains("hidden"));
  assert.equal(store.state.sessionStatus, "idle");
});

test("aucun écran d'épreuve ne parle encore d'entraînement ou de simulation", () => {
  click('#year-grid [data-year="2020"]');
  click("#guide-next");
  for (const screen of ["#view-strategy"]) {
    assert.doesNotMatch(
      $(screen).textContent,
      /التدريب|المحاكاة/,
      `${screen} conserve un vocabulaire supprimé`
    );
  }
  click('#view-strategy [data-confirm="2"][data-session-mode="bac"]');
  assert.doesNotMatch($("#view-workspace").textContent, /المحاكاة مرفوضة|بيانات المحاكاة/);
});
