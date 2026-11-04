/* ============================================================
   Rendu PNG des pages d'un PDF officiel — outil de relecture
   ------------------------------------------------------------
   Pourquoi : la couche texte des scans ministériels est inversée ou
   bruitée (chiffres « 2222 » pour 2022, « المدة: 20 سا و02 د » pour
   2 h 30). La seule source fiable pour recopier une consigne est
   l'image de la page. Cet outil la produit.

   Usage :
     node scripts/render-pdf-pages.mjs subjects/M/2024/sujet-1.pdf 1,2,3
     node scripts/render-pdf-pages.mjs M/dzexams-bac-sciences-1413929.pdf 4
   Sortie : rendered/<chemin>_pN.png (ignoré par git).

   Pré-requis : pdfjs-dist + un canvas Node. pdf.js (build legacy) exige
   le module « canvas » ; si seul @napi-rs/canvas est installé, créer un
   alias local :
     mkdir -p node_modules/canvas
     echo '{"name":"canvas","version":"0.0.0-shim","main":"index.js"}' > node_modules/canvas/package.json
     echo 'module.exports = require("@napi-rs/canvas");' > node_modules/canvas/index.js
   ============================================================ */
import { createRequire } from "node:module";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const require = createRequire(import.meta.url);
const pdfjs = require("pdfjs-dist/legacy/build/pdf.js");
const canvasPkg = require("@napi-rs/canvas");

const file = process.argv[2];
const pages = (process.argv[3] || "1").split(",").map(Number);
const scale = Number(process.argv[4] || 2);
if (!file) {
  console.error("usage: node scripts/render-pdf-pages.mjs <pdf> <pages> [scale]");
  process.exit(2);
}

mkdirSync("rendered", { recursive: true });
const doc = await pdfjs.getDocument({
  data: new Uint8Array(readFileSync(file)),
  // Les polices standard doivent être fournies : sans elles, pdf.js n'arrive
  // pas à dessiner certains mots (pages à trous) alors que le texte existe.
  standardFontDataUrl: new URL("../node_modules/pdfjs-dist/standard_fonts/", import.meta.url).href,
  disableFontFace: true
}).promise;
console.log("pages du document :", doc.numPages);
for (const pageNumber of pages) {
  const page = await doc.getPage(pageNumber);
  const viewport = page.getViewport({ scale });
  const canvas = canvasPkg.createCanvas(viewport.width, viewport.height);
  await page.render({ canvasContext: canvas.getContext("2d"), viewport }).promise;
  const out = `rendered/${file.replace(/\//g, "_")}_p${pageNumber}.png`;
  writeFileSync(out, canvas.toBuffer("image/png"));
  console.log("écrit", out, `${canvas.width}x${canvas.height}`);
}
process.exit(0);
