/* OCR d'un PDF scanné via la chaîne partagée (scripts/lib/ocr.mjs) :
 * rendu pdfjs-dist + @napi-rs/canvas, OCR tesseract.js (ara, LSTM,
 * traineddata npm local — aucun accès réseau).
 * Usage: node scripts/ocr-scan-pdf.mjs subjects/SE/2025/sujet-1.pdf [dpi] */
import { writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { renderPdfPages, createOcrWorker, repoRoot } from "./lib/ocr.mjs";

const root = repoRoot();
const pdfPath = process.argv[2];
if (!pdfPath) {
  console.error("usage: node scripts/ocr-scan-pdf.mjs <path> [dpi]");
  process.exit(1);
}
const dpi = Number(process.argv[3] || 300);

const pages = await renderPdfPages(join(root, pdfPath), { dpi });
const worker = await createOcrWorker(["ara"]);

let full = "";
const outRel = "scripts/extracted/" + pdfPath + ".ocr.txt";
mkdirSync(join(root, dirname(outRel)), { recursive: true });

for (const page of pages) {
  process.stderr.write(`page ${page.page}/${pages.length} (${page.width}x${page.height})…\n`);
  const {
    data: { text, confidence }
  } = await worker.recognize(page.png);
  full += `\n\n===== PAGE ${page.page} (confiance ${confidence.toFixed(0)}%) =====\n${text}`;
}
await worker.terminate();
writeFileSync(join(root, outRel), full, "utf8");
console.log(`\nWrote ${outRel} (${full.length} chars)`);
