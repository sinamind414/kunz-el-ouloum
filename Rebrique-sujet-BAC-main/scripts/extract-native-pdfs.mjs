/* Extract raw text from PDFs that have a native Arabic text layer.
 * Output goes to scripts/extracted/<stream>/<year>[-exceptional]/<sujetN>.txt */
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
process.chdir(root);
const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse/lib/pdf-parse.js");

function walk(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = join(dir, e.name);
    return e.isDirectory() ? walk(p) : e.isFile() && e.name.endsWith(".pdf") ? [p] : [];
  });
}
import { readdirSync } from "node:fs";

const outRoot = join(__dirname, "extracted");
mkdirSync(outRoot, { recursive: true });

let native = 0,
  skipped = 0;
for (const dir of ["subjects/SE", "subjects/M"]) {
  for (const pdfPath of walk(join(root, dir))) {
    const rel = pdfPath.replace(root + "/", "");
    const m = rel.match(/subjects\/(SE|M)\/(\d{4})(\/exceptional)?\/sujet-(\d)\.pdf/);
    if (!m) continue;
    const [, stream, year, exceptional, sujetN] = m;
    const buf = readFileSync(pdfPath);
    const data = await pdfParse(buf).catch(() => ({ text: "", numpages: 0 }));
    const arabic = (data.text.match(/[\u0600-\u06FF]/g) || []).length;
    if (arabic < 200) {
      skipped++;
      continue;
    }
    const outDir = join(outRoot, stream, year + (exceptional ? "-exceptional" : ""));
    mkdirSync(outDir, { recursive: true });
    writeFileSync(join(outDir, `sujet-${sujetN}.txt`), data.text, "utf8");
    native++;
  }
}
console.log(`Extrait: ${native} PDFs (natifs)\nIgnorés (scans): ${skipped}\nSortie: ${outRoot}`);
