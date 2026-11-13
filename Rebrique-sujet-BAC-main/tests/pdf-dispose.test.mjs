/* ============================================================
   Nettoyage des visionneuses PDF (D7 / D8)
   ------------------------------------------------------------
   D7 : disposePdfViewer et disposeAllPdfViewers étaient exportés mais
        jamais appelés. Chaque aperçu, chaque tiroir, chaque remontage
        d'écran laissait un document pdf.js ouvert et un listener
        « resize » accroché — une fuite cumulative par consultation.
   D8 : le minuteur de redimensionnement vivait dans une fermeture
        locale, donc disposePdfViewer testait state.resizeTimer, une
        propriété jamais assignée : le minuteur en attente se déclenchait
        APRÈS le nettoyage et re-rendait un document déjà détruit.
   ============================================================ */
import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { JSDOM } = require("jsdom");
const { pdfViewerHTML, mountPdfViewer, disposePdfViewer, disposeAllPdfViewers } =
  await import("../js/ui/pdf-viewer.js");

const dom = new JSDOM(`<!doctype html><body><div id="host-container"></div></body>`, {
  url: "http://localhost/"
});
globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.devicePixelRatio = 1;
dom.window.HTMLCanvasElement.prototype.getContext = () => ({ fake: true });

/* On enregistre les accroches « resize » sans casser jsdom : pdf-renderer
   résout sa cible sur `window`, donc on enveloppe les méthodes de la fenêtre
   en déléguant à l'implémentation native. */
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

const container = () => document.getElementById("host-container");
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function scaffold(index = 1) {
  const wrapper = document.createElement("div");
  wrapper.innerHTML = pdfViewerHTML({ id: index, pdfLocalUrl: "/subjects/SE/2021/sujet-1.pdf" });
  container().append(wrapper);
  return wrapper.querySelector("[data-pdf-canvas]");
}

/** pdf.js factice dont on observe destroy() et le nombre de rendus. */
function observableLibrary(pages = 2) {
  let destroyed = 0;
  let renders = 0;
  return {
    destroyed: () => destroyed,
    renders: () => renders,
    lib: {
      GlobalWorkerOptions: {},
      getDocument() {
        return {
          promise: Promise.resolve({
            numPages: pages,
            async getPage() {
              return {
                getViewport: ({ scale }) => ({ width: 600 * scale, height: 800 * scale }),
                render: async () => {
                  renders += 1;
                  return { promise: Promise.resolve() };
                },
                cleanup: () => {}
              };
            },
            destroy: () => {
              destroyed += 1;
            }
          })
        };
      }
    }
  };
}

/** Largeur pilotable : le redimensionnement ne re-rend qu'au-delà de 40 px. */
function withWidth(host, initial = 720) {
  let width = initial;
  Object.defineProperty(host, "clientWidth", { get: () => width, configurable: true });
  return { setWidth: (value) => (width = value) };
}

beforeEach(() => {
  container().innerHTML = "";
  resizeListeners.clear();
  document.getElementById("pdfjs-vendor-script")?.remove();
});

test("D7 : monter un visionneur accroche un listener resize, le dispose le retire", async () => {
  const host = scaffold();
  const library = observableLibrary(2);
  globalThis.pdfjsLib = library.lib;

  await mountPdfViewer(host);
  assert.equal(host.dataset.pdfState, "ready");
  assert.equal(resizeListeners.size, 1, "un listener resize doit être accroché");

  disposePdfViewer(host);

  assert.equal(resizeListeners.size, 0, "le listener resize doit être retiré au nettoyage");
  assert.equal(library.destroyed(), 1, "le document pdf.js doit être détruit");
});

test("D7 : disposePdfViewer est idempotent et n'explose pas sur un hôte inconnu", async () => {
  const host = scaffold();
  globalThis.pdfjsLib = observableLibrary(1).lib;
  await mountPdfViewer(host);

  disposePdfViewer(host);
  disposePdfViewer(host);
  disposePdfViewer(document.createElement("div"));

  assert.equal(resizeListeners.size, 0);
});

test("D7 : disposeAllPdfViewers libère tous les visionneurs d'un sous-arbre", async () => {
  const first = scaffold(1);
  const second = scaffold(2);
  const library = observableLibrary(1);
  globalThis.pdfjsLib = library.lib;

  await mountPdfViewer(first);
  await mountPdfViewer(second);
  assert.equal(resizeListeners.size, 2, "deux visionneurs, deux listeners");

  disposeAllPdfViewers(container());

  assert.equal(resizeListeners.size, 0, "aucun listener ne doit survivre");
  assert.equal(library.destroyed(), 2, "les deux documents doivent être détruits");
});

test("D8 : un redimensionnement déclenche bien un re-rendu", async () => {
  const host = scaffold();
  const library = observableLibrary(2);
  globalThis.pdfjsLib = library.lib;
  const width = withWidth(host, 720);

  await mountPdfViewer(host);
  const afterMount = library.renders();
  assert.equal(afterMount, 2, "les deux pages sont rendues au montage");

  width.setWidth(1000);
  for (const listener of resizeListeners) listener();
  await wait(700);

  assert.ok(library.renders() > afterMount, "le re-rendu après redimensionnement doit avoir lieu");
});

test("D8 : le minuteur en attente est annulé par le dispose", async () => {
  const host = scaffold();
  const library = observableLibrary(2);
  globalThis.pdfjsLib = library.lib;
  const width = withWidth(host, 720);

  await mountPdfViewer(host);
  const afterMount = library.renders();

  // Redimensionnement programmé, puis nettoyage avant l'échéance du minuteur.
  width.setWidth(1000);
  for (const listener of resizeListeners) listener();
  disposePdfViewer(host);
  await wait(700);

  assert.equal(
    library.renders(),
    afterMount,
    "aucun re-rendu ne doit suivre le nettoyage : le minuteur doit être annulé"
  );
  assert.equal(resizeListeners.size, 0);
});

/* Le branchement (D7) : fermer un tiroir doit libérer les visionneuses qu'il
   contient. C'est le mécanisme qui couvre les tiroirs du hub et l'aperçu du
   sujet pendant l'épreuve. */
const { createDialogManager } = await import("../js/ui/dialogs.js");

test("D7 : fermer un tiroir notifie l'appelant avant le retrait du DOM", () => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const seen = [];
  const dialogs = createDialogManager({ $, $$, onClose: (element) => seen.push(element) });

  const drawer = dialogs.openDrawer("right", "titre", "<div data-pdf-canvas></div>");
  assert.ok(document.body.contains(drawer), "le tiroir est dans le document");

  dialogs.closeModal();

  assert.equal(seen.length, 1, "le crochet de fermeture doit être appelé une fois");
  assert.equal(seen[0], drawer, "le crochet reçoit bien l'élément du tiroir");
  assert.equal(document.body.contains(drawer), false, "le tiroir est retiré");
  // Le sous-arbre est encore atteignable au moment du crochet : c'est ce qui
  // permet de libérer les visionneuses avant de perdre la référence.
  assert.equal(seen[0].querySelectorAll("[data-pdf-canvas]").length, 1);
});

test("D7 : un tiroir sans visionneuse se ferme sans erreur", () => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const dialogs = createDialogManager({ $, $$, onClose: (element) => disposeAllPdfViewers(element) });

  dialogs.openModal("titre", "<p>contenu</p>");
  dialogs.closeModal();

  assert.equal(document.querySelector(".overlay"), null, "la modale est retirée");
});
