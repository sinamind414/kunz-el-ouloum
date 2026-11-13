import { test } from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import {
  announceScreen,
  associateFieldsWithInstructions,
  bindDiagnosticAnnouncements,
  ensureLiveRegions
} from "../js/ui/accessibility.js";

function dom(html = "") {
  return new JSDOM(`<body>${html}</body>`, { pretendToBeVisual: true });
}

test("les régions live annoncent écrans, diagnostics et notifications", async () => {
  const { window } = dom('<section id="view-hub"><h1>Accueil</h1></section>');
  window.requestAnimationFrame = (callback) => callback();
  ensureLiveRegions(window.document);
  bindDiagnosticAnnouncements(window);
  announceScreen(window.document, "view-hub");
  assert.equal(window.document.querySelector("#screen-announcer").getAttribute("aria-live"), "polite");
  assert.match(window.document.querySelector("#screen-announcer").textContent, /Accueil/);
  assert.equal(window.document.activeElement, window.document.querySelector("h1"));
  assert.equal(
    window.document.querySelector("#view-hub").getAttribute("aria-labelledby"),
    window.document.querySelector("h1").id
  );
  window.dispatchEvent(
    new window.CustomEvent("boussole4d:diagnostic", { detail: { code: "storage.failure" } })
  );
  assert.equal(window.document.querySelector("#diagnostic-announcer").getAttribute("aria-live"), "assertive");
  assert.match(window.document.querySelector("#diagnostic-announcer").textContent, /خطأ تقني غير متوقع/);
});

test("chaque champ reçoit un nom explicite lié à sa consigne", () => {
  const { window } = dom(`
    <section id="exercise"><h2>Consigne scientifique</h2>
      <textarea id="answer"></textarea>
      <label>Valeur</label><input id="value">
      <input id="named" aria-label="Recherche">
    </section>`);
  associateFieldsWithInstructions(window.document);
  const answer = window.document.querySelector("#answer");
  const value = window.document.querySelector("#value");
  assert.equal(answer.getAttribute("aria-labelledby"), "answer-instruction");
  assert.equal(value.previousElementSibling.htmlFor, "value");
  for (const field of window.document.querySelectorAll("input, textarea, select")) {
    const labelled =
      field.hasAttribute("aria-label") ||
      field.hasAttribute("aria-labelledby") ||
      [...window.document.querySelectorAll("label[for]")].some((label) => label.htmlFor === field.id);
    assert.equal(labelled, true, `${field.id} n'a pas de nom accessible`);
  }
});

test("les identifiants dupliqués sont réparés et les libellés restent uniques", () => {
  const { window } = dom(`
    <section>
      <label for="duplicate">Première valeur</label><input id="duplicate">
      <label for="duplicate">Deuxième valeur</label><input id="duplicate" placeholder="القيمة الثانية">
    </section>`);
  associateFieldsWithInstructions(window.document);
  const fields = [...window.document.querySelectorAll("input")];
  assert.equal(new Set(fields.map((field) => field.id)).size, fields.length);
  assert.equal(fields[0].id, "duplicate");
  assert.notEqual(fields[1].id, "duplicate");
  assert.equal(fields[1].previousElementSibling.htmlFor, fields[1].id);
});

test("le shell fournit un lien d’évitement arabe vers le contenu principal", async () => {
  const { readFile } = await import("node:fs/promises");
  const shell = await readFile(new URL("../index.html", import.meta.url), "utf8");
  assert.match(shell, /class="skip-link" href="#main-content"/);
  assert.match(shell, /<main id="main-content" tabindex="-1">/);
});

test("les contrôles interactifs personnalisés restent des éléments clavier natifs", async () => {
  const simulation = await import("../js/ui/screens/simulation.js");
  const pdfViewer = await import("../js/ui/pdf-viewer.js");
  // Les commandes de l'épreuve (ouverture du sujet par exercice, contrôle
  // qualité, remise) sont des <button> natifs : atteignables au clavier,
  // sans gestionnaire maison.
  assert.match(simulation.examPaperHTML.toString(), /<button type=\\?"button\\?" class=\\?"btn/);
  assert.doesNotMatch(simulation.examPaperHTML.toString(), /<div class=\\?"btn/);
  // La visionneuse du sujet reste un iframe titré, complété par des liens natifs.
  assert.match(pdfViewer.pdfViewerHTML.toString(), /<iframe[^>]+title=/);
  assert.match(pdfViewer.pdfViewerHTML.toString(), /<a class=\\?"btn/);
});
