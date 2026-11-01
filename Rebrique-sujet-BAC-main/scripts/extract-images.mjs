/* Try extracting embedded images from a PDF without canvas.
 * Works on pure scanned PDFs that embed JPEG/PNG per page. */
import { createRequire } from "node:module";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
process.chdir(root);
const require = createRequire(import.meta.url);
const pdfjs = require("pdfjs-dist/legacy/build/pdf.js");

const pdfPath = process.argv[2];
if (!pdfPath) {
  console.error("usage: node scripts/extract-images.mjs <pdf>");
  process.exit(1);
}
const data = new Uint8Array(readFileSync(join(root, pdfPath)));
const doc = await pdfjs.getDocument({ data, disableWorker: true, isEvalSupported: false }).promise;
console.log(`${pdfPath}: ${doc.numPages} pages`);
let extracted = 0;
for (let i = 1; i <= doc.numPages; i++) {
  const page = await doc.getPage(i);
  const ops = await page.getOperatorList();
  // Iterate over OPS.paintImageXObject etc. Simpler: use page.objs
  for (let k = 0; k < ops.fnArray.length; k++) {
    // PDF.js constants: paintImageXObject = 70, paintInlineImageXObject = 96, paintInlineImageXObjectGroup = 97
    const fn = ops.fnArray[k];
    if (fn === 70 || fn === 96 || fn === 97) {
      extracted++;
    }
  }
  // Alternative: enumerate images via page resources via objs._objs
  try {
    (await page.cleanup) && page.cleanup();
  } catch {}
}
console.log(`Image ops found: ${extracted} (rough)`);
