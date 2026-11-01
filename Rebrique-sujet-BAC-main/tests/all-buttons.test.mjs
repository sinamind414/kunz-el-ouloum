/* ============================================================
   Tests Exhaustifs — Test de TOUS les boutons et flux (E2E)
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

const html = readFileSync(join(__dirname, "..", "index.html"), "utf8");
const dom = new JSDOM(html, { url: "http://localhost/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.localStorage = dom.window.localStorage;
dom.window.scrollTo = () => {};
// Mock window.open for print test
dom.window.open = () => ({
  document: {
    open: () => {},
    write: () => {},
    close: () => {}
  }
});

const { loadAllYears } = await import("../data/subjects.js");
await loadAllYears();
const { init } = await import("../js/ui.js");
const { store } = await import("../js/store.js");
const { soundEngine, timers } = await import("../js/engine.js");
const { officialTaskInventoryFor } = await import("../data/official-tasks.js");
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
  const e = typeof sel === "string" ? $(sel) : sel;
  if (!e) throw new Error(`Élément introuvable: ${sel}`);
  e.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
}

test("1. Hub : test des boutons d'accueil, adkar, sons et années", () => {
  // Sound button
  click("#btn-hub-sound");
  assert.notEqual(soundEngine.currentMode, "off");
  soundEngine.stop();

  // Adkar modal
  click("#btn-hub-adkar");
  assert.ok($(".modal"));
  click('[data-close="ok"]');
  assert.equal($(".modal"), null);

  // Plus d'outils d'entraînement dans le hub : ni أطلس, ni تشخيص تجريبي, ni exercice rapide.
  for (const id of ["#btn-atlas", "#btn-demo", "#drill-start"]) {
    assert.equal($(id), null, `${id} ne doit plus exister`);
  }

  // Years verification
  assert.equal($('#year-grid [data-year="2025"]').disabled, false);
  assert.equal($('#year-grid [data-year="2024"]').disabled, false);
  assert.equal($('#year-grid [data-year="2023"]').disabled, false);

  // Une seule action par carte-sujet : démarrer l'épreuve (pas de double bouton).
  assert.equal($('#year-grid [data-hub-year="2025"]').querySelectorAll("button").length, 1);
  assert.equal($("#year-grid [data-quick-year]"), null, "l'accès rapide séparé est supprimé");
  click('#year-grid [data-year="2025"]');
  assert.ok(!$("#view-guide").classList.contains("hidden"));
  click("#guide-exit");
  assert.ok(!$("#view-hub").classList.contains("hidden"));
});

test('1b. SE 2013–2026 en épreuve : 4D partout, 2021 en armature "copie libre"', () => {
  assert.equal($$("#year-grid .year-card").length, 14);
  const training2013 = $('#year-grid [data-hub-year="2013"]');
  assert.ok(training2013);
  assert.equal(training2013.dataset.kind, "exam");
  assert.ok(training2013.querySelector("[data-year]"));
  assert.equal($('#year-grid [data-hub-year="2019"]').dataset.kind, "exam");
  assert.equal($('#year-grid [data-hub-year="2021"]').dataset.kind, "exam");
  assert.ok($('#year-grid [data-hub-year="2021"]').querySelector("[data-year]"), "2021 ouvre une épreuve");
  assert.equal($('#year-grid [data-hub-year="2020"]').dataset.kind, "exam");
  assert.equal($('#year-grid [data-hub-year="2026"]').dataset.kind, "exam");
  assert.ok($('#year-grid [data-year="2026"]'));
  assert.ok($('#year-grid [data-year="2020"]'));
  assert.ok($('#year-grid [data-year="2013"]'));
  const links = $$('#year-grid [data-kind="consult"] a[href*="dzexams.com/ar/annales/"]');
  assert.equal(links.length, 0, "filière SE : chaque année ouvre une épreuve dans l'application");
  assert.ok(!$(".modal"));
  assert.ok(!$("#view-hub").classList.contains("hidden"));
});

test("1c. Le bouton filière affiche Maths puis l'espace باكالوريات أجنبية", () => {
  click("#btn-stream-fab");
  assert.match($("#stream-fab-label").textContent, /رياضيات/);
  /* 14 épreuves Maths : 6 entraînements 4D (2021–2026) + 8 armatures
     « copie libre » (2013–2020, aucune consigne encodée). */
  assert.equal($$("#year-grid [data-year]").length, 15);
  assert.equal($('#year-grid [data-hub-year="2021"]').dataset.kind, "exam");
  assert.equal($('#year-grid [data-year="2021-m"]').disabled, false);
  /* 15 cartes = 14 millésimes + la session exceptionnelle 2017, qui a ses
     propres fichiers et ses propres sujets. */
  assert.equal($$("#year-grid .year-card").length, 15);
  assert.ok($('#year-grid [data-year="2017-em"]'), "la session exceptionnelle doit rester atteignable");
  assert.ok($('#year-grid [data-hub-year="2026"]'));
  assert.ok($('#year-grid [data-hub-year="2022"]'));
  assert.ok($('#year-grid [data-hub-year="2021"]'));
  assert.ok($('#year-grid [data-hub-year="2013"]'));
  // 2013–2020 ne sont plus des cartes de consultation : elles ouvrent l'épreuve.
  for (const year of ["2013", "2014", "2015", "2016", "2017", "2018", "2019", "2020"]) {
    assert.equal(
      $('#year-grid [data-hub-year="' + year + '"]').dataset.kind,
      "exam",
      year + " Maths doit ouvrir une épreuve"
    );
    assert.equal($('#year-grid [data-year="' + year + '-m"]').disabled, false, year + " -m actif");
  }
  const links = $$('#year-grid [data-kind="consult"] a[href*="dzexams.com/ar/annales/"]');
  assert.equal(links.length, 0, "filière Maths : chaque millésime ouvre une épreuve dans l'application");

  click('#year-grid [data-year="2026-m"]');
  assert.match($("#view-guide").textContent, /2س30د/);
  assert.equal($("#global-timer").textContent, "02:30:00");
  click("#guide-next");
  assert.doesNotMatch($("#view-strategy").textContent, /110 د/);
  click("#strategy-exit");

  click("#btn-stream-fab");
  assert.match($("#stream-fab-label").textContent, /باكالوريات أجنبية/);
  assert.equal($$('#year-grid [data-kind="gap"]').length, 1);
  assert.equal(
    $$('#year-grid a[href*="dzexams.com/ar/annales/"]').length,
    0,
    "aucun lien dzexams pour un espace qui n'indexe pas le BAC algérien"
  );
  click("#btn-stream-fab");
  assert.match($("#stream-fab-label").textContent, /علوم تجريبية/);
  assert.ok($('#year-grid [data-year="2025"]'));
});

test("2. Guide : respiration, adkar intégrés et navigation", () => {
  click('#year-grid [data-year="2024"]');
  assert.ok(!$("#view-guide").classList.contains("hidden"));
  assert.ok($(".adkar-section"));
  assert.ok($$(".adkar-card").length >= 6);

  // Test exit and re-entry
  click("#guide-exit");
  assert.ok(!$("#view-hub").classList.contains("hidden"));

  // Re-enter 2025
  click('#year-grid [data-year="2025"]');
  assert.ok(!$("#view-guide").classList.contains("hidden"));
  click("#guide-next");
  assert.ok(!$("#view-strategy").classList.contains("hidden"));
});

test("3. Stratégie : calculatrice, inventaire officiel et confirmation", () => {
  const coverageCards = $$("#view-strategy [data-subject-coverage]");
  assert.equal(coverageCards.length, 2);
  assert.equal(coverageCards[0].dataset.subjectCoverage, "partial");
  assert.equal(coverageCards[1].dataset.subjectCoverage, "partial");
  // Un seul mode : les deux sujets sont ouverts, sans message d'interdiction.
  const examButtons = $$('#view-strategy [data-session-mode="bac"]');
  assert.equal(examButtons.length, 2);
  assert.ok(examButtons.every((button) => !button.disabled));
  assert.doesNotMatch($("#view-strategy").textContent, /المحاكاة ممنوعة/);
  assert.match($("#view-strategy").textContent, /جرد المهام/);

  // Le sujet s'affiche dans l'application : plus de renvoi externe.
  click('#view-strategy [data-preview="2"]');
  assert.equal(
    $("#pdf-preview-container iframe.pdf-frame").getAttribute("src").split("#")[0],
    "/subjects/SE/2025/sujet-2.pdf"
  );
  assert.ok($("#pdf-preview-container a[download]"), "le téléchargement hors ligne est proposé");
  click('#view-strategy [data-preview="1"]');
  assert.equal(
    $("#pdf-preview-container iframe.pdf-frame").getAttribute("src").split("#")[0],
    "/subjects/SE/2025/sujet-1.pdf"
  );

  // Calc inputs
  const input = $$("#view-strategy .calc-input")[0];
  if (input) {
    input.value = "5";
    input.dispatchEvent(new dom.window.Event("input", { bubbles: true }));
  }

  // Confirm sujet 1 → entrée directe dans l'épreuve
  click('#view-strategy [data-confirm="1"][data-session-mode="bac"]');
  assert.equal(store.state.sessionMode, "bac");
  assert.ok(!$("#view-workspace").classList.contains("hidden"));
});

test("4. L'écran onboarding n'existe plus et les exercices restent librement accessibles", () => {
  assert.equal($("#view-onboarding"), null, "view-onboarding supprimé du DOM");
  assert.equal($("#ws-onb"), null, "le bouton vers l'ancien écran est retiré de la copie");
  /* Tous les exercices du sujet sont sur la même copie : aucun verrou, aucun
     changement d'écran artificiel. Décision du propriétaire (2026-09-20) :
     l'épreuve affiche les EXERCICES du sujet, jamais les questions. */
  const fields = $$("#view-workspace [data-exercise-free]");
  assert.equal(fields.length, 3, "2025 SE : trois exercices, trois champs");
  assert.deepEqual(
    fields.map((field) => Number(field.dataset.exercise)),
    [1, 2, 3]
  );
  for (const field of fields) assert.equal(field.disabled, false);
});

test("5. Épreuve : les seuls outils sont le sujet, la sortie et la remise", () => {
  // Aucun outil d'entraînement dans la copie.
  for (const id of ["#ws-panic", "#ws-brouillon", "#ws-pdf", "#ws-report", "#ws-reset", "#ws-finish"]) {
    assert.equal($(id), null, `${id} ne doit plus exister dans la copie`);
  }
  // Sujet : visionneuse intégrée dans le tiroir.
  click("#simulation-pdf");
  assert.ok($(".drawer.open"));
  assert.ok($(".drawer.open iframe.pdf-frame"));
  click(".drawer [data-close]");
  assert.equal($(".drawer"), null);
  // Remise : jamais sans confirmation.
  click("#simulation-finish");
  assert.ok($(".modal"), "une confirmation est exigée");
  assert.ok($("#simulation-finish-no"));
  click("#simulation-finish-no");
  assert.equal($(".modal"), null);
  assert.equal(store.state.sessionStatus, "active", "la session continue si l'élève refuse");
});

test("6. Épreuve : les exercices avec leur barème, AUCUNE question affichée", () => {
  /* Décision du propriétaire (2026-09-20) : l'écran d'épreuve n'affiche plus
     aucune question — officielle ou reconstruite. Les questions se lisent
     dans le sujet officiel (PDF), l'écran porte les exercices et le barème. */
  assert.equal($$("#view-workspace [data-task-answer]").length, 0, "aucune tâche affichée");
  assert.equal($$("#view-workspace .bac-consigne").length, 0, "aucune consigne affichée");
  const inventory = officialTaskInventoryFor("2025", 1);
  for (const task of inventory.tasks) {
    const prompt = String(task.prompt || "");
    if (prompt.length < 20) continue;
    assert.ok(
      !$("#view-workspace").textContent.includes(prompt.slice(0, 25)),
      "le texte d'une consigne ne doit pas apparaître dans l'épreuve"
    );
  }
  // Le barème officiel dépendant de l'année et de la filière : 5+7+8 = 20.
  assert.match($("#view-workspace").textContent, /5 نقطة/);
  assert.match($("#view-workspace").textContent, /7 نقطة/);
  assert.match($("#view-workspace").textContent, /8 نقطة/);
  assert.match($("#view-workspace").textContent, /بارم الموضوع/);
  assert.doesNotMatch($("#view-workspace").textContent, /\d+[.,]\d+\s*\/\s*\d+/);
  // Rédaction par exercice : le texte est conservé, sans validation de note.
  const input = $('#view-workspace [data-exercise-free="1"]');
  input.value = "إجابة الطالب في الإمتحان";
  input.dispatchEvent(new dom.window.Event("input", { bubbles: true }));
  assert.equal(store.exercise("2025", 1, 1).freeAnswer, "إجابة الطالب في الإمتحان");
  // L'épreuve reste silencieuse (aucun diagnostic PENDANT l'épreuve, même si
  // le bandeau qui l'annonçait a été retiré) : aucun contrôle d'évaluation
  // ne doit y être rendu. Il réapparaît en relecture.
  assert.equal($("#view-workspace .qualitative-check"), null, "aucun bouton تقييم نوعي en épreuve");
});

test("7. Épreuve : rédaction complète de tous les exercices du sujet", () => {
  const fields = $$("#view-workspace [data-exercise-free]");
  assert.equal(fields.length, 3);
  for (const input of fields) {
    input.value = "إجابة كاملة";
    input.dispatchEvent(new dom.window.Event("input", { bubbles: true }));
  }
  for (const exerciseNumber of [1, 2, 3]) {
    assert.equal(
      store.exercise("2025", 1, exerciseNumber).freeAnswer,
      "إجابة كاملة",
      `la réponse de l'exercice ${exerciseNumber} est conservée`
    );
  }
});

test("8-9. Ni rapport, ni réinitialisation : la remise est la seule sortie", () => {
  // Les garde-fous de l'ancien écran d'entraînement n'existent plus du tout.
  for (const id of ["#ws-report", "#reset-yes", "#dl-csv", "#btn-print-exam"]) {
    assert.equal($(id), null, `${id} ne doit plus exister`);
  }
  // Remise confirmée : la copie est verrouillée, les réponses conservées.
  click("#simulation-finish");
  click("#simulation-finish-yes");
  assert.equal(store.state.sessionStatus, "completed");
  assert.equal(store.state.sessionEndReason, "manual");
  assert.equal($("#view-workspace").dataset.reviewMode, "true");
  assert.equal($("#view-workspace [data-exercise-free]").disabled, true);
  assert.equal($("#simulation-finish"), null, "plus de remise après remise");
  // L'évaluation qualitative a été déplacée ici : en relecture le diagnostic
  // est permis, et il ne reste pas un corrigé — aucune note n'est rendue.
  // (Un bouton par exercice : on ne présuppose donc pas un id.)
  const reviewButton = $("#view-workspace [data-qualitative-free]");
  assert.ok(reviewButton, "l'évaluation qualitative doit être disponible en relecture");
  click(`#view-workspace [data-qualitative-free="${reviewButton.dataset.qualitativeFree}"]`);
  const result = $(
    `#view-workspace [data-qualitative-result-free="${reviewButton.dataset.qualitativeFree}"]`
  );
  assert.notEqual(result.textContent.trim(), "");
  assert.doesNotMatch(result.textContent, /\d+[.,]\d+\s*\/\s*\d+/);
  // Retour au hub.
  click("#simulation-home");
  assert.ok(!$("#view-hub").classList.contains("hidden"));
  assert.ok($("#view-workspace").classList.contains("hidden"));
});

test("10. La copie n'affiche aucun indice de confiance ni barème", () => {
  click('#year-grid [data-year="2025"]');
  click("#guide-next");
  click('#view-strategy [data-confirm="1"][data-session-mode="bac"]');
  assert.equal($$("#view-workspace .confidence-chip").length, 0, "aucun indice de confiance en épreuve");
  assert.doesNotMatch($("#view-workspace").textContent, /ثقة (مرتفعة|متوسطة|منخفضة)/);
  assert.doesNotMatch($("#view-workspace").textContent, /اختبار صامت/);
});
