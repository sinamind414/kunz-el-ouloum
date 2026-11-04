/* ============================================================
   Visionneuse du sujet — rendu pdf.js et repli
   ------------------------------------------------------------
   Le lecteur PDF natif (iframe) n'est pas fiable : bloqué par
   object-src 'none' sur Chromium, muet sur mobile. Le sujet est
   donc dessiné sur <canvas>. Ces tests verrouillent le rendu et,
   surtout, le repli : jamais un cadre vide sans issue.
   ============================================================ */
import { test, beforeEach, after } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { JSDOM } = require("jsdom");
const { pdfViewerHTML, mountPdfViewer, mountPdfViewers } = await import("../js/ui/pdf-viewer.js");

const dom = new JSDOM(`<!doctype html><body><div id="host-container"></div></body>`, {
  url: "http://localhost/"
});
globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.devicePixelRatio = 1;
// jsdom n'implémente pas <canvas> : on fournit un contexte factice pour que le
// rendu pdf.js soit réellement appelé pendant le test.
dom.window.HTMLCanvasElement.prototype.getContext = () => ({ fake: true });

after(() => {
  try {
    dom.window.close();
  } catch (e) {}
});

const container = () => document.getElementById("host-container");

function scaffold() {
  document.getElementById("host-container").innerHTML = pdfViewerHTML({
    id: 1,
    pdfLocalUrl: "/subjects/SE/2021/sujet-1.pdf",
    pdfExternalUrl: "https://www.dzexams.com/uploads/2021.pdf"
  });
  return {
    host: document.querySelector("[data-pdf-canvas]"),
    frame: document.querySelector("iframe.pdf-frame")
  };
}

function fakePage(rendered, index) {
  return {
    getViewport: ({ scale }) => ({ width: 600 * scale, height: 800 * scale }),
    render: async () => {
      rendered.push(index);
      return { promise: Promise.resolve() };
    },
    cleanup: () => {}
  };
}
function fakeLibrary(pages = 3) {
  const rendered = [];
  const calls = [];
  return {
    rendered,
    calls,
    lib: {
      GlobalWorkerOptions: {},
      getDocument(options) {
        calls.push(options);
        assert.equal(options.url, "/subjects/SE/2021/sujet-1.pdf");
        return {
          promise: Promise.resolve({
            numPages: pages,
            async getPage(index) {
              return fakePage(rendered, index);
            },
            destroy: () => {}
          })
        };
      }
    }
  };
}
/** pdf.js dont le worker refuse de démarrer : seul le repli sans worker aboutit. */
function workerlessLibrary(pages = 2, message = "Setting up fake worker failed: no Worker") {
  const rendered = [];
  const calls = [];
  return {
    rendered,
    calls,
    lib: {
      GlobalWorkerOptions: {},
      getDocument(options) {
        calls.push(options);
        if (!options.disableWorker) return { promise: Promise.reject(new Error(message)) };
        return {
          promise: Promise.resolve({
            numPages: pages,
            async getPage(index) {
              return fakePage(rendered, index);
            },
            destroy: () => {}
          })
        };
      }
    }
  };
}

beforeEach(() => {
  delete globalThis.pdfjsLib;
  document.getElementById("host-container").innerHTML = "";
  document.getElementById("pdfjs-vendor-script")?.remove();
});

test("le sujet est rendu dans l'application, pas confié au lecteur du navigateur", () => {
  const html = pdfViewerHTML({ id: 1, pdfLocalUrl: "/subjects/SE/2021/sujet-1.pdf" });
  assert.match(
    html,
    /<div class="pdf-canvas-host" data-pdf-canvas data-pdf-src="\/subjects\/SE\/2021\/sujet-1\.pdf"/
  );
  assert.match(html, /data-pdf-page="1"/);
  // L'iframe n'est plus le mode d'affichage : elle reste en repli, masquée.
  assert.match(html, /<iframe class="pdf-frame"[^>]+hidden>/);
  assert.match(html, /src="\/subjects\/SE\/2021\/sujet-1\.pdf#view=FitH"/);
  // Et l'élève garde toujours une sortie : ouverture et téléchargement.
  assert.match(html, /فتح في نافذة مستقلة/);
  assert.match(html, /تنزيل PDF/);
});

test("une page demandée est annoncée au visionneur et au lien", () => {
  const html = pdfViewerHTML({ id: 2, pdfLocalUrl: "/subjects/SE/2021/sujet-2.pdf" }, { page: 6 });
  assert.match(html, /data-pdf-page="6"/);
  assert.match(html, /src="\/subjects\/SE\/2021\/sujet-2\.pdf#page=6"/);
});

test("pdf.js dessine toutes les pages, la page demandée d'abord", async () => {
  const { host } = scaffold();
  const { lib, rendered } = fakeLibrary(3);
  globalThis.pdfjsLib = lib;

  await mountPdfViewer(host, { page: 2 });
  assert.equal(host.dataset.pdfState, "ready");
  assert.equal(host.querySelectorAll("canvas.pdf-page-canvas").length, 3);
  assert.equal(host.querySelector("[data-pdf-pages]").textContent, "3");
  assert.equal(rendered[0], 2, "la page demandée doit être rendue en premier");
  assert.equal(rendered.length, 3);
  assert.match(host.textContent, /3 صفحة/);
  assert.ok(host.querySelector("[data-pdf-prev]"), "la navigation entre pages doit exister");
});

test("le zoom passe par un attribut CSS, jamais par un style inline", async () => {
  const { host } = scaffold();
  globalThis.pdfjsLib = fakeLibrary(2).lib;
  await mountPdfViewer(host);
  assert.equal(host.dataset.pdfZoom, "100");
  host
    .querySelector("[data-pdf-zoom-in]")
    .dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
  assert.equal(host.dataset.pdfZoom, "125");
  assert.equal(host.querySelector("[data-pdf-zoom]").textContent, "125%");
  host
    .querySelector("[data-pdf-zoom-out]")
    .dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
  assert.equal(host.dataset.pdfZoom, "100");
  assert.equal(host.getAttribute("style"), null, "aucun style inline ne doit être écrit");
});

test("si pdf.js échoue, l'iframe de repli est révélée et expliquée", async () => {
  const { host, frame } = scaffold();
  assert.equal(frame.hidden, true);
  const mounted = mountPdfViewer(host);
  const script = document.getElementById("pdfjs-vendor-script");
  assert.ok(script, "pdf.js doit être chargé depuis la même origine");
  assert.match(script.getAttribute("src"), /assets\/vendor\/pdfjs\/pdf\.min\.js$/);
  script.dispatchEvent(new dom.window.Event("error"));
  await mounted;
  assert.equal(host.hidden, true, "le conteneur canvas ne doit pas rester vide");
  assert.equal(frame.hidden, false, "l'iframe de repli doit être révélée");
  assert.match(container().textContent, /تعذّر عرض الموضوع داخل التطبيق/);
});

test("si le worker pdf.js échoue, le sujet est relu sans worker plutôt qu'en iframe", async () => {
  const { host, frame } = scaffold();
  const { lib, rendered, calls } = workerlessLibrary(2);
  globalThis.pdfjsLib = lib;
  await mountPdfViewer(host);
  assert.equal(calls.length, 2, "une tentative avec worker, puis une sans");
  assert.equal(calls[0].disableWorker, undefined);
  assert.equal(calls[1].disableWorker, true);
  assert.equal(host.dataset.pdfState, "ready");
  assert.equal(rendered.length, 2, "les pages doivent être dessinées malgré l'absence de worker");
  assert.equal(host.hidden, false, "le rendu direct reste la voie normale");
  assert.equal(frame.hidden, true, "pas de repli iframe quand le sujet s'affiche");
  assert.match(host.textContent, /2 صفحة/);
});
test("un fichier introuvable n'est pas retéléchargé pour rien", async () => {
  const { host, frame } = scaffold();
  const calls = [];
  globalThis.pdfjsLib = {
    GlobalWorkerOptions: {},
    getDocument(options) {
      calls.push(options);
      return { promise: Promise.reject(new Error("Unexpected server response (404) while retrieving PDF")) };
    }
  };
  await mountPdfViewer(host);
  assert.equal(calls.length, 1, "une erreur réseau ne doit pas déclencher de second essai");
  assert.equal(host.hidden, true);
  assert.equal(frame.hidden, false, "l'élève garde une sortie de secours");
  assert.match(container().textContent, /تعذّر عرض الموضوع داخل التطبيق/);
});
test("la note de repli nomme la cause probable de l'échec", async () => {
  const { host } = scaffold();
  globalThis.pdfjsLib = {
    GlobalWorkerOptions: {},
    getDocument() {
      return { promise: Promise.reject(new Error("Unexpected server response (404) while retrieving PDF")) };
    }
  };
  await mountPdfViewer(host);
  assert.match(container().textContent, /السبب: ملف الموضوع غير موجود/);
});
test("un sujet sans fichier local garde le lien source, sans cadre vide", () => {
  const html = pdfViewerHTML({ id: 1, pdfExternalUrl: "https://www.dzexams.com/x.pdf" });
  assert.doesNotMatch(html, /<iframe/);
  assert.match(html, /فتح المصدر الخارجي/);
});

test("le lien externe prévient que l'afficheur tiers peut inverser l'arabe", () => {
  const html = pdfViewerHTML({
    id: 1,
    pdfLocalUrl: "subjects/SE/2019/sujet-1.pdf",
    pdfExternalUrl: "https://www.dzexams.com/x.pdf"
  });
  assert.match(html, /المصدر الخارجي/);
  assert.match(html, /معكوسا/);
  const externalOnly = pdfViewerHTML({ id: 1, pdfExternalUrl: "https://www.dzexams.com/x.pdf" });
  assert.match(externalOnly, /فتح المصدر الخارجي/);
  assert.match(externalOnly, /معكوسا/);
});

test("mountPdfViewers monte tous les visionneurs d'un écran, une seule fois", async () => {
  document.getElementById("host-container").innerHTML =
    pdfViewerHTML({ id: 1, pdfLocalUrl: "/a.pdf" }) + pdfViewerHTML({ id: 2, pdfLocalUrl: "/b.pdf" });
  globalThis.pdfjsLib = fakeLibrary(1).lib;
  assert.equal(mountPdfViewers(container()), 2);
  assert.equal(mountPdfViewers(container()), 0, "ne pas monter deux fois le même visionneur");
});
