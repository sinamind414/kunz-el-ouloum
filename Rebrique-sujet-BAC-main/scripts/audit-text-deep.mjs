/* Audit profond des couches texte, fichier par fichier, de 2026 à 2013.
   Va au-delà des 5 marqueurs du correcteur : ordre des exercices, marqueur
   الموضوع attendu, mots mixtes chiffres+arabe, pages vs manifest, verdict
   OK/WARN/FAIL avec preuves. Usage : node scripts/audit-text-deep.mjs */
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { classifyTextLayer, extractPdfText } from "./report-pdf-text-layers.mjs";

const require = createRequire(import.meta.url);
const pdfjs = require("pdfjs-dist/legacy/build/pdf.js");
const root = fileURLToPath(new URL("../", import.meta.url));
const manifest = JSON.parse(readFileSync(join(root, "subjects/manifest.json"), "utf-8"));
const pagesOf = new Map(manifest.map((e) => [e.file, e.pages]));

const YEARS = [2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013];
const TRACKS = ["SE", "M"];

async function itemsOf(abs) {
  const doc = await pdfjs.getDocument({ url: abs, useSystemFonts: true, isEvalSupported: false }).promise;
  const items = [];
  for (let p = 1; p <= doc.numPages; p += 1) {
    const page = await doc.getPage(p);
    const content = await page.getTextContent();
    for (const it of content.items) if (it.str && it.str.trim()) items.push({ p, str: it.str });
    page.cleanup();
  }
  await doc.destroy();
  return { pages: doc.numPages, items };
}

function exerciseOrder(text) {
  const marks = ["التمرين الأول", "التمرين الثاني", "التمرين الثالث"];
  const pos = marks.map((m) => text.indexOf(m)).filter((i) => i >= 0);
  const ok = pos.every((v, i) => i === 0 || pos[i - 1] < v);
  return { found: pos.length, ok };
}

async function auditOne(rel) {
  const abs = join(root, rel);
  const text = await extractPdfText(abs);
  const c = classifyTextLayer(text);
  const { pages, items } = await itemsOf(abs);
  const exo = exerciseOrder(text);
  const expectSecond = rel.includes("sujet-2");
  const hasMawdou3 = expectSecond ? text.includes("الموضوع الثاني") : text.includes("الموضوع الأول");
  const mixed = [
    ...new Set(items.map((i) => i.str).filter((s) => /\d/.test(s) && /[\u0600-\u06FF]/.test(s)))
  ];
  const latin = [...new Set(text.match(/[A-Za-zÀ-ÿ]{2,}/g) || [])];
  const reasons = [];
  if (c.transpose > 0) reasons.push(`FAIL transposé=${c.transpose}`);
  if (c.presentation > 0.15) reasons.push(`FAIL présentation=${c.presentation.toFixed(2)}`);
  if (pages !== pagesOf.get(rel)) reasons.push(`FAIL pages=${pages}≠manifest${pagesOf.get(rel)}`);
  if (!exo.ok) reasons.push("WARN exercices-désordre");
  if (exo.found === 0) reasons.push("WARN 0-exercice");
  if (!hasMawdou3) reasons.push(expectSecond ? "WARN sans-الموضوع-الثاني" : "WARN sans-الموضوع-الأول");
  if (c.correct <= 1) reasons.push(`WARN marqueurs=${c.correct}/5`);
  const verdict = reasons.some((r) => r.startsWith("FAIL")) ? "FAIL" : reasons.length ? "WARN" : "OK";
  return {
    rel,
    classe: c.classe,
    correct: c.correct,
    tr: c.transpose,
    exo,
    mixed,
    latin,
    verdict,
    reasons,
    head: text.slice(0, 130)
  };
}

const files = [];
for (const y of YEARS)
  for (const t of TRACKS) for (const n of [1, 2]) files.push(`subjects/${t}/${y}/sujet-${n}.pdf`);
files.splice(
  files.indexOf("subjects/M/2017/sujet-2.pdf") + 1,
  0,
  "subjects/M/2017/exceptional/sujet-1.pdf",
  "subjects/M/2017/exceptional/sujet-2.pdf"
);

console.log("rel | verdict | classe correct/5 tr | exo | mixtes | raisons");
for (const rel of files) {
  const a = await auditOne(rel);
  const tag = rel
    .replace("subjects/", "")
    .replace("/sujet-", "-s")
    .replace(".pdf", "")
    .replace("exceptional", "EXC");
  console.log(
    `${tag} | ${a.verdict} | ${a.classe} ${a.correct}/5 tr=${a.tr} | exo=${a.exo.found}${a.exo.ok ? "" : "!"} | mixtes=${a.mixed.length} | ${a.reasons.join(" ; ") || "—"}`
  );
  if (a.verdict !== "OK") {
    console.log(`    DEBUT: ${JSON.stringify(a.head)}`);
    if (a.mixed.length) console.log(`    MIXTES: ${JSON.stringify(a.mixed.slice(0, 10))}`);
    if (a.latin.length > 12)
      console.log(`    LATIN(${a.latin.length}): ${JSON.stringify(a.latin.slice(0, 12))}`);
  }
}
