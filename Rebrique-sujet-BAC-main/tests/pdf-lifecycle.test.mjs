/* ============================================================
   Cycle de vie des visionneuses dans l'application réelle (D7)
   ------------------------------------------------------------
   pdf-dispose.test.mjs verrouille disposePdfViewer lui-même. Ce fichier
   verrouille son BRANCHEMENT : avant le correctif, les fonctions étaient
   exportées mais jamais appelées, donc chaque aperçu de sujet, chaque
   tiroir et chaque retour au hub laissait un document pdf.js ouvert.
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
dom.window.HTMLCanvasElement.prototype.getContext = () => ({ fake: true });

/* On enregistre les accroches « resize » sans casser jsdom : pdf-renderer
   résout sa cible sur `window`, donc on enveloppe les méthodes de la fenêtre
   en déléguant à l'implémentation native. Sans cela la fuite est invisible. */
const resizeListeners = new Set();
const nativeAdd = dom.window.addEventListener.bind(dom.window);
const nativeRemove = dom.window.removeEventListener.bind(dom.window);
dom.window.addEventListener = (type, listener, options) => {
  if (type === "resize") resizeListeners.add(listener);
  return nativeAdd(type, listener, options);
};
dom.window.removeEventListener = (type, listener, options) => {
  if (type === "resize") resizeListeners.delete(listener);
  return nativeRemove(type, listener, options);
};

let destroyed = 0;
globalThis.pdfjsLib = {
  GlobalWorkerOptions: {},
  getDocument() {
    return {
      promise: Promise.resolve({
        numPages: 1,
        async getPage() {
          return {
            getViewport: ({ scale }) => ({ width: 600 * scale, height: 800 * scale }),
            render: async () => ({ promise: Promise.resolve() }),
            cleanup: () => {}
          };
        },
        destroy: () => {
          destroyed += 1;
        }
      })
    };
  }
};

const { loadAllYears } = await import("../data/subjects.js");
await loadAllYears();
const { init } = await import("../js/ui.js");
const { soundEngine, timers } = await import("../js/engine.js");
await init();

after(() => {
  timers.stopAll();
  soundEngine.stop();
  try {
    dom.window.close();
  } catch (e) {}
});

const $ = (sel, root = globalThis.document) => root.querySelector(sel);
const $$ = (sel, root = globalThis.document) => [...root.querySelectorAll(sel)];
function click(target) {
  const element = typeof target === "string" ? $(target) : target;
  if (!element) throw new Error(`Élément introuvable: ${target}`);
  element.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
}
const settle = () => new Promise((resolve) => setTimeout(resolve, 20));

test("D7 : changer d'aperçu du sujet libère le visionneur précédent", async () => {
  click('#year-grid [data-year="2025"]');
  click("#guide-next");
  await settle();

  const previews = $$("#view-strategy [data-preview]");
  assert.ok(previews.length >= 2, "l'écran de stratégie propose plusieurs sujets");
  assert.ok($("#pdf-preview-container [data-pdf-canvas]"), "l'aperçu du sujet est monté");
  assert.ok(resizeListeners.size >= 1, "le visionneur d'aperçu est bien accroché à resize");

  const before = destroyed;
  click(previews[1]);
  await settle();

  assert.ok(destroyed > before, "le visionneur de l'aperçu précédent doit être détruit, pas abandonné");
});

test("D7 : fermer le tiroir du sujet pendant l'épreuve libère le visionneur", async () => {
  click('#view-strategy [data-confirm="1"][data-session-mode="bac"]');
  await settle();

  /* Quitter l'écran de stratégie libère son aperçu. Depuis le 2026-09-20,
     la copie embarque le sujet officiel directement (décision du
     propriétaire) : le SEUL visionneur restant est celui de l'épreuve. */
  assert.equal(resizeListeners.size, 1, "seul le visionneur du sujet embarqué dans la copie reste monté");
  assert.ok($("#view-workspace [data-pdf-canvas]"), "le sujet est rendu dans la copie");

  // Le tiroir « الموضوع » ouvre le sujet à la page de l'exercice choisi.
  const avant = resizeListeners.size;
  click("#simulation-pdf");
  await settle();

  const drawer = document.querySelector(".drawer");
  assert.ok(drawer, "le tiroir du sujet s'ouvre");
  assert.ok(drawer.querySelector("[data-pdf-canvas]"), "le sujet y est rendu");
  assert.equal(resizeListeners.size, avant + 1, "le tiroir ajoute exactement un visionneur");

  const before = destroyed;
  click(drawer.querySelector("[data-close]"));
  await settle();

  assert.ok(destroyed > before, "fermer le tiroir doit détruire le document pdf.js");
  assert.equal(resizeListeners.size, avant, "le listener du tiroir doit disparaître avec lui");
});

test("D7 : retourner au hub ne laisse aucun visionneur accroché", async () => {
  // Filet : quoi qu'il reste monté sur l'écran d'épreuve, le retour au hub doit
  // tout libérer — la navigation seule ne couvre pas le cas d'un écran encore
  // affiché au moment du départ.
  click("#simulation-pdf");
  await settle();
  assert.ok(resizeListeners.size >= 1, "un visionneur est monté avant le départ");

  const before = destroyed;
  click("#simulation-home");

  assert.ok(destroyed > before, "le retour au hub doit libérer les visionneuses");
  assert.equal(resizeListeners.size, 0, "plus aucun visionneur ne doit subsister au hub");
});
