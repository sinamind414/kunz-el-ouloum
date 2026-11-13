/* Audit every PDF in subjects/{SE,M}/ for native text extractability. */
import { readdirSync, readFileSync, existsSync } from "node:fs";
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

function classify(textLen, pages) {
  if (textLen < 200) return { kind: "scan", note: "image seule, OCR nécessaire" };
  if (textLen < pages * 300) return { kind: "sparse", note: "texte partiel / couche mixte" };
  return { kind: "native", note: "couche texte exploitable" };
}

const out = [];
for (const dir of ["subjects/SE", "subjects/M"]) {
  for (const path of walk(join(root, dir))) {
    try {
      const buf = readFileSync(path);
      const data = await pdfParse(buf).catch(() => ({ text: "", numpages: 0 }));
      const pages = data.numpages || 0;
      const arabic = (data.text.match(/[\u0600-\u06FF]/g) || []).length;
      const total = (data.text || "").replace(/\s+/g, "").length;
      out.push({
        path: path.replace(root + "/", ""),
        pages,
        totalChars: total,
        arabicChars: arabic,
        ...classify(total, pages)
      });
    } catch (err) {
      out.push({
        path: path.replace(root + "/", ""),
        pages: 0,
        totalChars: 0,
        arabicChars: 0,
        kind: "error",
        note: String(err.message).slice(0, 80)
      });
    }
  }
}

const byKind = { native: [], sparse: [], scan: [], error: [] };
out.forEach((r) => byKind[r.kind].push(r));
console.log("=== RÉSUMÉ ===");
for (const k of ["native", "sparse", "scan", "error"]) console.log(`${k.padEnd(8)} ${byKind[k].length}`);

console.log("\n=== DÉTAIL ===");
console.log("stream\tyear\tsujet\tpages\tchars\tarabic\tclassification");
for (const r of out.sort((a, b) => a.path.localeCompare(b.path))) {
  const m = r.path.match(/subjects\/(SE|M)\/(\d{4})(?:\/exceptional)?\/sujet-(\d)\.pdf/);
  console.log(
    `${m?.[1] ?? "?"}\t${m?.[2] ?? "?"}\tS${m?.[3] ?? "?"}\t${r.pages}\t${r.totalChars}\t${r.arabicChars}\t${r.kind}\t${r.note}`
  );
}
