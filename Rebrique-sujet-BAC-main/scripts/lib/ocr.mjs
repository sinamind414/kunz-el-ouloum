/* ============================================================
   Briques partagées du pipeline OCR (scripts/ocr-*.mjs).
   ------------------------------------------------------------
   Chaîne : PDF (pdfjs-dist) -> rendu page en PNG (@napi-rs/canvas)
   -> OCR arabe (tesseract.js, LSTM uniquement, traineddata issu
   du paquet npm @tesseract.js-data/ara — aucun accès réseau).
   ============================================================ */
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);

let pdfjsLib;
let napiCanvas;

/** pdfjs-dist (build legacy Node) — chargé une seule fois. */
export function getPdfjs() {
  if (!pdfjsLib) {
    pdfjsLib = require("pdfjs-dist/legacy/build/pdf.js");
    pdfjsLib.GlobalWorkerOptions.workerSrc = require.resolve("pdfjs-dist/legacy/build/pdf.worker.js");
  }
  return pdfjsLib;
}

/** @napi-rs/canvas — canvas natif précompilé, aucune dépendance système. */
export function getCanvasFactory() {
  if (!napiCanvas) {
    napiCanvas = require("@napi-rs/canvas");
    /* Les PDF vectoriels (dégradés RadialAxialShadingPattern, p.ex. SE 2021)
       exigent DOMMatrix, API navigateur absente de Node : @napi-rs/canvas en
       fournit une implémentation native qu'on expose globalement pour pdfjs. */
    if (napiCanvas.DOMMatrix && typeof globalThis.DOMMatrix === "undefined") {
      globalThis.DOMMatrix = napiCanvas.DOMMatrix;
    }
  }
  class NodeCanvasFactory {
    create(w, h) {
      const canvas = napiCanvas.createCanvas(w, h);
      const context = canvas.getContext("2d");
      return { canvas, context };
    }

    reset({ canvas }, w, h) {
      canvas.width = w;
      canvas.height = h;
    }

    destroy() {}
  }
  return NodeCanvasFactory;
}

/** Répertoire local du traineddata arabe embarqué via npm
 *  (node_modules/@tesseract.js-data/ara/4.0.0_best_int). Aucun téléchargement. */
export function resolveTessdataDir() {
  const gz = require.resolve("@tesseract.js-data/ara/4.0.0_best_int/ara.traineddata.gz");
  return gz.replace(/[/\\]ara\.traineddata\.gz$/, "");
}

/** Worker tesseract.js branché sur le traineddata local (ara par défaut). */
export async function createOcrWorker(langs = "ara") {
  const Tesseract = (await import("tesseract.js")).default;
  return Tesseract.createWorker(langs, 1, {
    langPath: resolveTessdataDir(),
    gzip: true,
    workerPath: require.resolve("tesseract.js/src/worker-script/node/index.js"),
    corePath: require.resolve("tesseract.js-core/tesseract-core-lstm.wasm.js"),
    cachePath: "/tmp/tesscache"
  });
}

/** Ouvre un PDF du dépôt et le rend page par page en buffers PNG. */
export async function renderPdfPages(pdfPath, { dpi = 300 } = {}) {
  const pdfjs = getPdfjs();
  const { createCanvas } = require("@napi-rs/canvas");
  const NodeCanvasFactory = getCanvasFactory();
  const data = new Uint8Array(readFileSync(pdfPath));
  const doc = await pdfjs.getDocument({
    data,
    isEvalSupported: false,
    canvasFactory: new NodeCanvasFactory()
  }).promise;
  const scale = dpi / 72;
  const pages = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const viewport = page.getViewport({ scale });
    const canvas = createCanvas(viewport.width, viewport.height);
    await page.render({
      canvasContext: canvas.getContext("2d"),
      viewport,
      canvasFactory: new NodeCanvasFactory()
    }).promise;
    pages.push({
      page: i,
      dpi,
      width: Math.round(viewport.width),
      height: Math.round(viewport.height),
      png: canvas.toBuffer("image/png")
    });
  }
  return pages;
}

/* ------------------------------------------------------------ */

/** Normalisation arabe légère pour la recherche de motifs (l'original
 *  transcrit reste brut : aucune correction silencieuse du texte). */
export function normalizeArabic(text) {
  return text
    .replace(/[\u064B-\u065F\u0670]/g, "")
    .replace(/\u0640/g, "")
    .replace(/[\u0622\u0623\u0625]/g, "\u0627")
    .replace(/\u0649/g, "\u064A")
    .replace(/\s+/g, " ")
    .trim();
}

const EXERCISE_NAMES = { الاول: 1, الثاني: 2, الثالث: 3 };

/** Repère les en-têtes « التمرين … ( n نقاط ) » et leur barème éventuel. */
export function findExerciseHeaders(text) {
  const norm = normalizeArabic(text);
  const headers = [];
  const re = /التمرين\s+(الاول|الثاني|الثالث)\s*[^)]{0,20}\(\s*(\d+(?:[.,]\d+)?)\s*(?:نقطة|نقاط|ن)/g;
  let m;
  while ((m = re.exec(norm)) !== null) {
    headers.push({ exercise: EXERCISE_NAMES[m[1]], points: Number(m[2].replace(",", ".")) });
  }
  if (!headers.length) {
    const bare = /التمرين\s+(الاول|الثاني|الثالث)/g;
    while ((m = bare.exec(norm)) !== null) {
      headers.push({ exercise: EXERCISE_NAMES[m[1]], points: null });
    }
  }
  return headers;
}

/** Repère les en-têtes de sujet « الموضوع الأول / الثاني ». */
export function findSujetHeaders(text) {
  const norm = normalizeArabic(text);
  const out = [];
  const re = /الموضوع\s*(الاول|الثاني|الثالث)/g;
  const names = { الاول: 1, الثاني: 2, الثالث: 3 };
  let m;
  while ((m = re.exec(norm)) !== null) out.push(names[m[1]]);
  return out;
}

/** Compte les amorces de questions numérotées (1- 2- أ- ب- …). */
export function countQuestionStarts(text) {
  const lines = text.split(/\r?\n/);
  let n = 0;
  for (const line of lines) {
    if (/^\s*\d+\s*[-–—.:]/.test(line)) n++;
    else if (/^\s*[أ-ي]\s*[-–—.:]/.test(line)) n++;
  }
  return n;
}

/** Chemin racine du dépôt. */
export function repoRoot() {
  return join(dirname(fileURLToPath(import.meta.url)), "..", "..");
}
