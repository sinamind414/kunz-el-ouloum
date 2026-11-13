/* Audit des écarts entre consignes officielles PDF et data/years pour un sujet pilote.
 * Produit un rapport des écarts détectés par OCR naïf, à relire humainement. */
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
process.chdir(root);
const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse/lib/pdf-parse.js");

// Pour un stream/year/sujet donné, extraire les lignes qui ressemblent à des consignes
async function extractPrompts(pdfPath) {
  const data = await pdfParse(readFileSync(pdfPath));
  // Nettoyage minimal : supprimer en-têtes/pieds, caractères parasites, lignes très courtes
  let text = data.text
    .replace(/[\u064B-\u065F]/g, "")
    .replace(/⧒/g, "")
    .replace(/www\.dzexams\.com/g, "")
    .replace(/الجمهورية الجزائرية[\s\S]*?الموضوع الأول/g, "")
    .replace(/صفحة \d+ من \d+/g, "")
    .replace(/الموضوع (الأول|الثاني)/g, "\n---\n");
  // Séparer par numérotation
  const blocks = text.split(/\n\s*(?:\d+|أ|ب|ج)\s*[()（]/);
  return blocks
    .map((b) => b.replace(/\s+/g, " ").trim())
    .filter((b) => b.length > 30 && /[\u0600-\u06FF]/.test(b))
    .slice(0, 20);
}

const path = join(root, "subjects/M/2021/sujet-1.pdf");
const prompts = await extractPrompts(path);
console.log("=== Consignes candidates extraites de M/2021/S1 (nettoyage minimal) ===\n");
for (const [i, p] of prompts.entries()) {
  const snippet = p.length > 280 ? p.slice(0, 280) + "…" : p;
  console.log(`[${i + 1}] ${snippet}\n`);
}
