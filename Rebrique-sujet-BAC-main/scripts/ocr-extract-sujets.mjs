/* ============================================================
   Pipeline OCR — extraire les énoncés des sujets scannés.
   ------------------------------------------------------------
   Cible par défaut : les PDF « armature copie libre » de la شعبة
   رياضيات (2013, 2014, 2015 + session exceptionnelle 2017), qui
   n'ont aucune couche texte exploitable (scans) ou des chiffres
   corrompus (2017 استثنائية : couche « transposée »).

   Étapes, par PDF :
     1. rendu de chaque page en PNG à N dpi (pdfjs-dist + @napi-rs/canvas) ;
     2. OCR arabe (tesseract.js, LSTM, traineddata npm local — zéro réseau),
        en deux passes de segmentation (psm 3 auto, psm 6 bloc) ;
     3. écriture des preuves :
          scripts/extracted/<chemin>/sujet-N.ocr.txt  — transcription lisible,
          scripts/extracted/<chemin>/sujet-N.ocr.json — preuve structurée
          (texte des deux passes, confiance par page, métadonnées) ;
     4. résumé : en-têtes التمرين détectés, barème lu, nb de questions.

   La transcription est une PREUVE, pas une consigne : rien ne passe
   en « official » sans relecture (voir PROMPT_RESTANT.md, TRAVAIL C).

   Usage :
     node scripts/ocr-extract-sujets.mjs [--dpi 300] [--psm 3,6]
                                          [--targets a.pdf,b.pdf,...]
   ============================================================ */
import { mkdirSync, writeFileSync, existsSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  renderPdfPages,
  createOcrWorker,
  findExerciseHeaders,
  findSujetHeaders,
  countQuestionStarts,
  repoRoot
} from "./lib/ocr.mjs";

const root = repoRoot();
const args = process.argv.slice(2);
const opt = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i !== -1 && args[i + 1] ? args[i + 1] : fallback;
};

const DPI = Number(opt("dpi", 300));
const PSM_LIST = opt("psm", "3,6")
  .split(",")
  .map((v) => Number(v.trim()))
  .filter((v) => Number.isInteger(v) && v > 0);

/** Cibles par défaut : les 8 PDF de la شعبة رياضيات + les 2 PDF SE 2021. */
const DEFAULT_TARGETS = [
  ["subjects/M/2013/sujet-1.pdf", "M/2013/sujet-1"],
  ["subjects/M/2013/sujet-2.pdf", "M/2013/sujet-2"],
  ["subjects/M/2014/sujet-1.pdf", "M/2014/sujet-1"],
  ["subjects/M/2014/sujet-2.pdf", "M/2014/sujet-2"],
  ["subjects/M/2015/sujet-1.pdf", "M/2015/sujet-1"],
  ["subjects/M/2015/sujet-2.pdf", "M/2015/sujet-2"],
  ["subjects/M/2017/exceptional/sujet-1.pdf", "M/2017-exceptional/sujet-1"],
  ["subjects/M/2017/exceptional/sujet-2.pdf", "M/2017-exceptional/sujet-2"],
  ["subjects/SE/2021/sujet-1.pdf", "SE/2021/sujet-1"],
  ["subjects/SE/2021/sujet-2.pdf", "SE/2021/sujet-2"]
];

const targetsArg = opt("targets", "");
const targets = targetsArg
  ? targetsArg.split(",").map((p) => {
      const rel = p
        .trim()
        .replace(/^subjects\//, "")
        .replace(/\.pdf$/, "");
      return [p.trim(), rel];
    })
  : DEFAULT_TARGETS;

const tesseractVersion = JSON.parse(
  readFileSync(join(root, "node_modules/tesseract.js/package.json"), "utf8")
).version;

const summary = [];
const worker = await createOcrWorker("ara");

for (const [pdfRel, outStem] of targets) {
  const pdfPath = join(root, pdfRel);
  if (!existsSync(pdfPath)) {
    console.error(`introuvable : ${pdfRel}`);
    continue;
  }
  process.stderr.write(`\n=== ${pdfRel} (rendu ${DPI} dpi) ===\n`);
  const pages = await renderPdfPages(pdfPath, { dpi: DPI });
  const pageResults = [];

  for (const rendered of pages) {
    process.stderr.write(`  page ${rendered.page}/${pages.length}…\n`);
    const passes = [];
    for (const psm of PSM_LIST) {
      await worker.setParameters({ tessedit_pageseg_mode: String(psm) });
      const { data } = await worker.recognize(rendered.png);
      passes.push({
        psm,
        confidence: Number(data.confidence.toFixed(1)),
        text: data.text
      });
    }
    pageResults.push({ ...rendered, png: undefined, passes });
  }

  const best = (page) => page.passes.reduce((a, b) => (b.confidence > a.confidence ? b : a));
  const outDir = join(root, "scripts/extracted", dirname(outStem));
  mkdirSync(outDir, { recursive: true });

  const txtPath = join(outDir, `${outStem.split("/").pop()}.ocr.txt`);
  const jsonPath = join(outDir, `${outStem.split("/").pop()}.ocr.json`);

  let txt = `# OCR ${pdfRel} — tesseract.js ${tesseractVersion} (ara, LSTM), ${DPI} dpi, psm ${PSM_LIST.join("/")}\n`;
  txt += `# Preuve d'extraction : transcription brute, non corrigée. Aucune consigne\n`;
  txt += `# ne devient « official » sans relecture (PROMPT_RESTANT.md, TRAVAIL C).\n`;
  for (const page of pageResults) {
    const b = best(page);
    const all = page.passes.map((p) => `psm${p.psm}=${p.confidence}%`).join(" ");
    txt += `\n\n===== PAGE ${page.page} (${page.width}x${page.height} @ ${page.dpi}dpi ; ${all}) =====\n`;
    txt += b.text.trimEnd();
  }
  writeFileSync(txtPath, txt, "utf8");

  const json = {
    pdf: pdfRel,
    ocr: {
      engine: `tesseract.js ${tesseractVersion}`,
      lang: "ara",
      traineddata: "npm:@tesseract.js-data/ara (4.0.0_best_int)",
      dpi: DPI,
      oem: 1,
      passes: PSM_LIST
    },
    pages: pageResults.map((page) => ({
      page: page.page,
      width: page.width,
      height: page.height,
      passes: page.passes
    }))
  };
  writeFileSync(jsonPath, JSON.stringify(json, null, 2), "utf8");

  const fullText = pageResults.map((p) => best(p).text).join("\n");
  const headers = findExerciseHeaders(fullText);
  const sujets = findSujetHeaders(fullText);
  summary.push({
    pdf: pdfRel,
    pages: pageResults.length,
    confAvg: (
      pageResults.reduce((t, p) => t + best(p).confidence, 0) / Math.max(pageResults.length, 1)
    ).toFixed(1),
    sujets,
    exercises: headers,
    questions: countQuestionStarts(fullText),
    txt: `scripts/extracted/${outStem}.ocr.txt`
  });
  process.stderr.write(`  -> ${txtPath}\n`);
}

await worker.terminate();

console.log(`\n=== Résumé OCR (${targets.length} PDF, ${DPI} dpi, passes psm ${PSM_LIST.join("/")}) ===`);
for (const s of summary) {
  const bareme =
    s.exercises.map((e) => `E${e.exercise}:${e.points ?? "?"}pts`).join(" + ") || "aucun en-tête";
  console.log(
    `${s.pdf.padEnd(44)} ${s.pages}p conf ${s.confAvg}%  sujets [${s.sujets.join(",")}]  ${bareme}  ~${s.questions} amorces`
  );
}
