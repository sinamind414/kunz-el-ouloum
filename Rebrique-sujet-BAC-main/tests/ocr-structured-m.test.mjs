/* ============================================================
   Maths 2013–2015 + session exceptionnelle 2017 : structurées en 4D
   par extraction OCR des documents officiels (2026-09-20).
   ------------------------------------------------------------
   Ces quatre millésimes étaient des armatures « copie libre »
   (décision 4 du 19/09/2026) : scans sans couche texte (2013–2015)
   ou couche « transposée » aux chiffres corrompus (2017 استثنائية).
   À la demande du propriétaire, le pipeline OCR du dépôt
   (scripts/ocr-extract-sujets.mjs — tesseract ara 300 dpi, passes
   psm 3 et psm 6) en a extrait consignes et barème, encodés dans
   data/years/m/year-{2013,2014,2015,2017-exceptional}.js.

   Ces tests verrouillent l'honnêteté de l'opération :
     - structure 4D complète et barème MESURÉ sur le document (20 pts) ;
     - chaque consigne officielle cite sa preuve d'extraction OCR ;
     - les preuves brutes (transcription + json) existent et couvrent
       chaque sujet servi ;
     - la session exceptionnelle garde ses fichiers DISTINCTS ;
     - l'inventaire officiel de chaque sujet est bien généré, et
       l'épreuve n'affiche que les consignes officielles.
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
const { officialTaskInventoryFor } = await import("../data/official-tasks.js");
const { APP_CONFIG: FULL_APP_CONFIG } = await import("./helpers/full-app-config.mjs");
await init();

after(() => {
  timers.stopAll();
  soundEngine.stop();
  try {
    dom.window.close();
  } catch {
    /* déjà fermé */
  }
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

const OCR_M_IDS = ["2013-m", "2014-m", "2015-m", "2017-em"];
/* Identifiant de carte dans le hub : une session exceptionnelle du même
   millésime doit avoir sa propre carte, sinon elle est masquée. */
const CARD_BY_ID = Object.freeze({
  "2013-m": "2013",
  "2014-m": "2014",
  "2015-m": "2015",
  "2017-em": "2017 (دورة استثنائية)"
});
/* Dossier des preuves OCR, dans scripts/extracted/. */
const EVIDENCE_DIR = Object.freeze({
  "2013-m": "M/2013",
  "2014-m": "M/2014",
  "2015-m": "M/2015",
  "2017-em": "M/2017-exceptional"
});
/* Barème lu sur chaque document par le pipeline OCR. */
const EXPECTED_MAX = Object.freeze({
  "2013-m": [
    [10, 10],
    [10, 10]
  ],
  "2014-m": [
    [10, 10],
    [10, 10]
  ],
  "2015-m": [
    [10, 10],
    [10, 10]
  ],
  "2017-em": [
    [7, 13],
    [8, 12]
  ]
});

function goToMathsStream() {
  if ($("#simulation-home") && !$("#view-workspace").classList.contains("hidden")) {
    click("#simulation-home");
  }
  store.reset();
  for (let tour = 0; tour < 3 && !/رياضيات/.test($("#stream-fab-label").textContent); tour += 1) {
    click("#btn-stream-fab");
  }
  assert.match($("#stream-fab-label").textContent, /رياضيات/);
}

function openExam(yearId, subjectId = 1) {
  click(`#year-grid [data-year="${yearId}"]`);
  assert.ok(!$("#view-guide").classList.contains("hidden"), `${yearId} : guide non ouvert`);
  click("#guide-next");
  click(`#view-strategy [data-confirm="${subjectId}"][data-session-mode="bac"]`);
  assert.ok(!$("#view-workspace").classList.contains("hidden"));
}

test("structure 4D complète : 2 sujets × 2 exercices × 4 pôles, 20 points mesurés par sujet", () => {
  for (const id of OCR_M_IDS) {
    const year = FULL_APP_CONFIG.years.find((entry) => entry.id === id);
    assert.ok(year, `${id} absent du catalogue`);
    assert.equal(year.stream, "m");
    assert.notEqual(year.answerMode, "free", `${id} n'est plus une armature « copie libre »`);
    assert.equal(year.sujets.length, 2, `${id} : deux sujets`);
    for (const sujet of year.sujets) {
      assert.equal(sujet.exercises.length, 2, `${id}/S${sujet.id} : deux exercices`);
      for (const exercise of sujet.exercises) {
        assert.ok(
          (Number(exercise.max) || 0) > 0,
          `${id}/S${sujet.id}/E${exercise.number} : le barème doit être mesuré, plus jamais null`
        );
        for (const pole of ["N", "S", "E", "W"]) {
          assert.ok(exercise.poles[pole], `${id}/S${sujet.id}/E${exercise.number} sans pôle ${pole}`);
        }
        const sum = ["N", "S", "E", "W"].reduce((total, p) => total + (exercise.poles[p].points || 0), 0);
        assert.ok(
          Math.abs(sum - exercise.max) < 1e-6,
          `${id}/S${sujet.id}/E${exercise.number} : pôles ≠ max`
        );
      }
      const expected = EXPECTED_MAX[id][sujet.id - 1];
      assert.deepEqual(
        sujet.exercises.map((exercise) => exercise.max),
        expected,
        `${id}/S${sujet.id} : barème OCR attendu ${expected.join("+")}`
      );
    }
  }
});

test("chaque consigne officielle cite sa preuve d'extraction, et la preuve existe", () => {
  for (const id of OCR_M_IDS) {
    const year = FULL_APP_CONFIG.years.find((entry) => entry.id === id);
    for (const sujet of year.sujets) {
      /* La preuve brute couvre chaque PDF servi : transcription lisible + json. */
      const stem = join(__dirname, "..", "scripts", "extracted", EVIDENCE_DIR[id], `sujet-${sujet.id}`);
      assert.ok(existsSync(`${stem}.ocr.txt`), `preuve manquante : ${stem}.ocr.txt`);
      assert.ok(existsSync(`${stem}.ocr.json`), `preuve manquante : ${stem}.ocr.json`);
      const transcript = readFileSync(`${stem}.ocr.txt`, "utf8");
      assert.match(transcript, /tesseract\.js/, `la preuve cite le moteur OCR (${id}/S${sujet.id})`);
      for (const exercise of sujet.exercises) {
        let officialCount = 0;
        for (const [poleLetter, pole] of Object.entries(exercise.poles)) {
          if (pole.bacPromptSource !== "official") continue;
          officialCount += 1;
          assert.match(
            pole.bacPromptNotes || "",
            /OCR/,
            `${id}/S${sujet.id}/E${exercise.number}/${poleLetter} : la consigne officielle doit citer l'extraction OCR`
          );
          assert.match(
            pole.bacPromptNotes || "",
            /scripts\/extracted/,
            `${id}/S${sujet.id}/E${exercise.number}/${poleLetter} : les notes doivent pointer la preuve`
          );
          assert.ok(
            Number.isInteger(pole.bacPromptPage) && pole.bacPromptPage >= 1,
            `${id}/S${sujet.id}/E${exercise.number}/${poleLetter} : page connue`
          );
        }
        assert.ok(
          officialCount >= 2,
          `${id}/S${sujet.id}/E${exercise.number} : au moins deux pôles officiels`
        );
      }
    }
  }
});

test("l'inventaire officiel de chaque sujet est généré : 8 tâches, dont 6 consignes officielles", () => {
  for (const id of OCR_M_IDS) {
    for (const sujetId of [1, 2]) {
      const inventory = officialTaskInventoryFor(id, sujetId);
      assert.ok(inventory, `${id}/S${sujetId} : inventaire attendu`);
      assert.equal(inventory.status, "partial", `${id}/S${sujetId} : le pôle N reste une étape reconstruite`);
      assert.equal(inventory.tasks.length, 8, `${id}/S${sujetId} : 4 pôles × 2 exercices`);
      const official = inventory.tasks.filter((task) => task.promptSource === "official");
      assert.equal(official.length, 6, `${id}/S${sujetId} : 3 consignes officielles par exercice`);
      assert.ok(
        inventory.tasks.every((task) => task.scoringReviewStatus === "provisional"),
        `${id}/S${sujetId} : aucune consigne OCR ne s'auto-certifie vérifiée`
      );
    }
  }
});

test("le hub ouvre une épreuve 4D pour les quatre millésimes, sans carte de consultation", () => {
  goToMathsStream();
  assert.equal($$('#year-grid [data-kind="consult"]').length, 0, "aucune carte de consultation Maths");
  for (const id of OCR_M_IDS) {
    const year = CARD_BY_ID[id];
    const card = $(`#year-grid [data-hub-year="${year}"]`);
    assert.ok(card, `carte ${year} absente`);
    assert.equal(card.dataset.kind, "exam", `${year} doit ouvrir une épreuve`);
    const button = card.querySelector("[data-year]");
    assert.equal(button.dataset.year, id);
    assert.equal(button.disabled, false, `${id} doit être cliquable`);
    /* Ces années sont désormais encodées : l'infobulle ne doit plus annoncer
       « غير مُشفَّرة », mais le جرد المهام (partiel : pôle N reconstruit). */
    assert.doesNotMatch(card.getAttribute("title"), /غير مُشفَّرة/, `${year} n'est plus en copie libre`);
    assert.match(card.getAttribute("title"), /جرد المهام/, `${year} annonce son جرد المهام`);
  }
});

test("la session exceptionnelle 2017 garde ses propres fichiers et une épreuve 4D", () => {
  goToMathsStream();
  openExam("2017-em");
  assert.equal(store.state.yearId, "2017-em");
  /* En épreuve 4D, le sujet s'ouvre dans un tiroir via « الموضوع » : c'est
     là que se trouve la visionneuse (iframe de repli + rendu canvas). */
  click("#simulation-pdf");
  const frame = globalThis.document.querySelector("iframe.pdf-frame");
  assert.ok(frame, "la visionneuse du sujet doit être montée dans le tiroir");
  assert.match(
    frame.getAttribute("src"),
    /^\/subjects\/M\/2017\/exceptional\/sujet-1\.pdf/,
    "la session exceptionnelle a ses propres PDF"
  );
  assert.equal($("#view-workspace").dataset.answerMode, undefined, "plus d'attribut data-answer-mode");
  /* Décision du propriétaire (2026-09-20) : AUCUNE question à l'écran —
     les exercices du sujet, leur barème et le PDF. Un champ par exercice. */
  const fields = $$("#view-workspace [data-exercise-free]");
  assert.equal(fields.length, 2, "2017-em : deux exercices, deux champs");
  assert.deepEqual(
    fields.map((field) => Number(field.dataset.exercise)),
    [1, 2]
  );
  assert.equal($$("#view-workspace [data-task-answer]").length, 0, "aucune tâche affichée");
  assert.equal($$("#view-workspace .bac-consigne").length, 0, "aucune consigne affichée");
  /* Le barème de la session exceptionnelle (7+13) est affiché, total 20. */
  assert.match($("#view-workspace").textContent, /7 نقطة/);
  assert.match($("#view-workspace").textContent, /13 نقطة/);
  assert.match($("#view-workspace").textContent, /بارم الموضوع/);
  /* Le barème est MESURÉ désormais : aucun « البارم غير مُقاس » ne doit fuir. */
  assert.doesNotMatch($("#view-workspace").textContent, /البارم غير مُقاس/);
  /* Garde-fou produit : jamais de note numérique visible pendant l'épreuve. */
  assert.doesNotMatch($("#view-workspace").textContent, /\d+[.,]\d+\s*\/\s*\d+/);
});

test("le troisième onglet est « باكالوريات أجنبية », sans lien dzexams ni شعبة:", () => {
  goToMathsStream();
  click("#btn-stream-fab"); // Maths -> باكالوريات أجنبية
  assert.match($("#stream-fab-label").textContent, /باكالوريات أجنبية/);
  assert.equal($(".stream-fab-kicker").hidden, true, "ce n'est pas une شعبة : pas de préfixe الشعبة:");
  assert.equal($$('#year-grid [data-kind="gap"]').length, 1);
  assert.equal($$('#year-grid a[href*="dzexams.com"]').length, 0, "aucun lien algérien dans cet espace");
  click("#btn-stream-fab"); // retour SE
  assert.equal($(".stream-fab-kicker").hidden, false, "les شعب algériennes gardent le préfixe");
  assert.match($("#stream-fab-label").textContent, /علوم تجريبية/);
});

test("la copie d'une épreuve OCR est enregistrée puis verrouillée par la remise", () => {
  goToMathsStream();
  openExam("2015-m");
  /* Un champ de rédaction par exercice (2015 M : 10+10), aucune question
     affichée — elles se lisent dans le sujet officiel en PDF. */
  const fields = $$("#view-workspace [data-exercise-free]");
  assert.equal(fields.length, 2, "2015-m : deux exercices, deux champs");
  const exerciseNumber = Number(fields[0].dataset.exercise);
  const answer = "إجابة التلميذ: تحليل نتائج الرحلان الكهربائي ثم استخراج المتتالية البنائية.";
  type(`[data-exercise-free="${exerciseNumber}"]`, answer);
  assert.equal(
    store.exercise("2015-m", 1, exerciseNumber).freeAnswer,
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
  assert.equal(
    store.exercise("2015-m", 1, exerciseNumber).freeAnswer,
    answer,
    "la réponse survit à la remise"
  );
});
