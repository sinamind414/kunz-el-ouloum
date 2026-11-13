/* ============================================================================
   RELECTURE ASSISTÉE DES INVENTAIRES (travail « C »)
   ----------------------------------------------------------------------------
   Pourquoi cet outil existe
   -------------------------
   Une tâche ne passe en `official` que si sa consigne a été RELUE sur le
   document officiel. Ce script ne décide rien et n'encode rien : il fabrique
   la feuille de relecture — pour chaque exercice, la page du PDF concernée et
   le texte qui s'y trouve — afin qu'un humain confirme (ou corrige) la
   consigne. Une fois la confirmation obtenue, l'encodage se fait dans
   data/years/** puis `node scripts/generate-official-inventories.mjs`.

   Ce que le corpus permet, mesuré le 2026-09-19 (`npm run pdftext:status`) :
     - SE 2013, 2014, 2015 : SCAN, aucune couche texte. Aucune extraction
       possible : il faut lire l'image. La feuille le dit au lieu de le taire.
     - SE 2016, 2017, 2018, 2019, SE 2024 : couche texte présente mais
       TRANSPOSÉE — l'ordre des glyphes est inversé par endroits et des
       lettres manquent (« اغية » pour « الفراغية »). Le texte extrait est un
       POINT DE DÉPART, pas une transcription.
   Aucun fichier du corpus ne permet une recopie automatique fidèle : c'est
   précisément pourquoi la promotion reste une décision humaine.

   Usage
   -----
     node scripts/review-inventory.mjs --years 2016,2017,2018,2019
     node scripts/review-inventory.mjs --missing   # les exercices sans consigne officielle
     node scripts/review-inventory.mjs --year 2018 --sujet 1
   ========================================================================== */

import { existsSync, mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const require = createRequire(import.meta.url);
const pdfjs = require("pdfjs-dist/legacy/build/pdf.js");
const root = fileURLToPath(new URL("../", import.meta.url));

const ORDINALS = [
  { key: 1, patterns: ["الأول", "أألول", "الاول", "األول", "اول"] },
  { key: 2, patterns: ["الثاني", "الثانى", "ثاني"] },
  { key: 3, patterns: ["الثالث", "الثالثة", "ثالث"] }
];

/* Le tatweel (ـ) sert de séparateur de consigne dans les sujets officiels
   (« 1 ــــ ») : on doit pouvoir le CONSERVER pour le découpage, et le
   retirer partout ailleurs. */
export function normalize(text, { keepTatweel = false } = {}) {
  const diacritics = /[ًٌٍَُِّْٰ]/g;
  let value = String(text || "").replace(diacritics, "");
  if (!keepTatweel) value = value.replace(/ـ/g, "");
  return value
    .replace(/[آأإٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/\s+/g, " ")
    .trim();
}

async function pageTexts(path) {
  if (!existsSync(path)) return null;
  const doc = await pdfjs.getDocument({ data: new Uint8Array(readFileSync(path)) }).promise;
  const pages = [];
  for (let page = 1; page <= doc.numPages; page += 1) {
    const pdfPage = await doc.getPage(page);
    const content = await pdfPage.getTextContent();
    pages.push({ page, text: content.items.map((item) => item.str).join(" ") });
  }
  return { numPages: doc.numPages, pages };
}

/* Repère le début de chaque exercice : « التمرين الأول »… en tolérant la
   transposition des ligatures (التمرين / التمريــــن / التمرين األول). */
export function findExercises(pages) {
  const hits = [];
  for (const { page, text } of pages) {
    const normalized = normalize(text);
    let index = normalized.indexOf("التمرين");
    while (index !== -1) {
      const window = normalized.slice(index, index + 40);
      const ordinal = ORDINALS.find((entry) =>
        entry.patterns.some((pattern) => window.includes(normalize(pattern)))
      );
      if (ordinal) hits.push({ number: ordinal.key, page, at: index });
      index = normalized.indexOf("التمرين", index + 1);
    }
  }
  // Un exercice peut être cité plusieurs fois (sommaire) : on garde la 1re page.
  const byNumber = new Map();
  for (const hit of hits) if (!byNumber.has(hit.number)) byNumber.set(hit.number, hit);
  return [...byNumber.values()].sort((a, b) => a.number - b.number);
}

/* Les consignes sont numérotées « 1 ــــ », « 2 ) », « ـ 1 »… On n'accepte
   qu'un chiffre isolé suivi d'un séparateur de consigne (tiret arabe ou
   parenthèse) : c'est la mise en forme constante des sujets officiels. */
export function splitQuestions(text) {
  const normalized = normalize(text, { keepTatweel: true });
  const marks = [];
  const pattern = /(?:^|[\s.])(\d)\s*(?:[ـ\-–]{2,}|\))\s*/g;
  let match;
  while ((match = pattern.exec(normalized)) !== null) {
    marks.push({ number: Number(match[1]), at: match.index, start: match.index + match[0].length });
  }
  if (!marks.length) return [];
  // On ne garde que la première suite croissante 1, 2, 3… : les autres
  // chiffres du document (pages, barème) ne sont pas des consignes.
  const kept = [];
  for (const mark of marks) {
    if (mark.number === kept.length + 1) kept.push(mark);
  }
  const questions = [];
  for (let index = 0; index < kept.length; index += 1) {
    // Le corps s'arrête AU DÉBUT du marqueur suivant, sinon la consigne
    // précédente avale le numéro de la suivante.
    const end = index + 1 < kept.length ? kept[index + 1].at : normalized.length;
    const body = normalize(normalized.slice(kept[index].start, end));
    if (body.length >= 20) questions.push({ number: kept[index].number, body });
  }
  return questions;
}

function pagesForExercise(exercises, number, total) {
  const current = exercises.find((entry) => entry.number === number);
  if (!current) return null;
  const next = exercises.find((entry) => entry.number === number + 1);
  return { from: current.page, to: next ? next.page : total };
}

function bump(map, key, field) {
  const row = map.get(key) || { scan: 0, transpose: 0, texte: 0, candidats: 0 };
  row[field] += 1;
  map.set(key, row);
}

function parseArgs(argv) {
  const options = { years: [], sujet: null, missing: false, out: null };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--years") options.years = argv[++index].split(",").map((value) => value.trim());
    else if (arg === "--year") options.years = [argv[++index]];
    else if (arg === "--sujet") options.sujet = Number(argv[++index]);
    else if (arg === "--out") options.out = argv[++index];
    else if (arg === "--missing") options.missing = true;
  }
  return options;
}

const { YEAR_CATALOG, loadYear } = await import("../data/subjects.js");
const { officialTaskInventoryFor } = await import("../data/official-tasks.js");
const { classifyTextLayer, SCAN_CHAR_THRESHOLD } = await import("./report-pdf-text-layers.mjs");

async function main() {
  const options = parseArgs(process.argv.slice(2));

  const targets = [];
  for (const catalogEntry of YEAR_CATALOG) {
    if (options.years.length && !options.years.includes(catalogEntry.id)) continue;
    let entry;
    try {
      entry = await loadYear(catalogEntry.id);
    } catch {
      console.log(`année non chargeable : ${catalogEntry.id}`);
      continue;
    }
    for (const sujet of entry.sujets || []) {
      if (options.sujet && sujet.id !== options.sujet) continue;
      const inventory = officialTaskInventoryFor(entry.id, sujet.id);
      const officialByExercise = new Map();
      for (const task of inventory?.tasks || []) {
        if (task.promptSource !== "official") continue;
        officialByExercise.set(task.exerciseNumber, (officialByExercise.get(task.exerciseNumber) || 0) + 1);
      }
      for (const exercise of sujet.exercises || []) {
        const official = officialByExercise.get(exercise.number) || 0;
        if (options.missing && official > 0) continue;
        targets.push({ entry, sujet, exercise, official });
      }
    }
  }

  if (!targets.length) {
    console.log("Aucun exercice ne correspond aux critères.");
    return;
  }

  const statsByYear = new Map();
  const lines = [];
  lines.push("# Feuille de relecture des consignes officielles");
  lines.push("");
  lines.push(`Générée par \`node scripts/review-inventory.mjs\`. ${targets.length} exercices.`);
  lines.push("");
  lines.push("Comment s'en servir : pour chaque consigne, comparer le texte extrait avec le PDF");
  lines.push("ouvert dans la visionneuse, corriger, puis me renvoyer la version confirmée. Rien");
  lines.push("n'est encodé tant que la consigne n'est pas confirmée.");
  lines.push("");

  let withText = 0;
  let withoutText = 0;
  let candidates = 0;

  for (const { entry, sujet, exercise, official } of targets) {
    const pdfPath = join(root, sujet.pdfLocalUrl.replace(/^\//, ""));
    const document = await pageTexts(pdfPath);
    lines.push(`## ${entry.id} · sujet ${sujet.id} · exercice ${exercise.number}`);
    lines.push("");
    lines.push(`- Thème (donnée encodée) : ${exercise.label || "—"}`);
    lines.push(`- Barème encodé : ${exercise.max === null ? "non mesuré" : `${exercise.max} نقطة`}`);
    lines.push(`- Consignes officielles déjà inventoriées : ${official}`);
    if (exercise.wholeSubject) {
      lines.push("- Découpage non mesurable : une seule copie pour le sujet entier.");
    }

    const fullText = document ? document.pages.map((page) => page.text).join(" ") : "";
    if (!document || fullText.length <= SCAN_CHAR_THRESHOLD) {
      withoutText += 1;
      bump(statsByYear, entry.id, "scan");
      lines.push(
        `- **Couche texte ${
          fullText.length <= SCAN_CHAR_THRESHOLD ? "absente (scan)" : "insuffisante"
        }** : ${fullText.length} caractères sur ${document?.numPages ?? 0} pages.`
      );
      lines.push("- Aucune extraction possible. La relecture doit se faire sur l'image du PDF.");
      lines.push("");
      continue;
    }

    withText += 1;
    const classe = classifyTextLayer(fullText).classe;
    bump(statsByYear, entry.id, classe === "transposé" ? "transpose" : "texte");
    lines.push(
      `- Classe mesurée de la couche texte : **${classe}**${
        classe === "transposé"
          ? " — ordre des glyphes inversé par endroits, lettres manquantes : le texte ci-dessous est un point de départ, pas une transcription."
          : classe === "propre"
            ? " — arabe logique ; les chiffres extraits restent corrompus."
            : ""
      }`
    );

    const exercises = findExercises(document.pages);
    const range = pagesForExercise(exercises, exercise.wholeSubject ? 1 : exercise.number, document.numPages);
    const pages = range
      ? document.pages.filter((page) => page.page >= range.from && page.page <= range.to)
      : document.pages;
    lines.push(
      `- Pages retenues : ${pages[0].page} → ${pages[pages.length - 1].page} (${document.numPages} pages dans le fichier)`
    );
    lines.push(`- Fichier : \`${sujet.pdfLocalUrl}\``);
    lines.push("");
    for (const page of pages) {
      const questions = splitQuestions(page.text);
      for (const question of questions) {
        candidates += 1;
        bump(statsByYear, entry.id, "candidats");
        lines.push(`### p${page.page} · consigne ${question.number}`);
        lines.push("");
        lines.push(`> ${question.body}`);
        lines.push("");
      }
    }
    lines.push("---");
    lines.push("");
  }

  lines.push("");
  lines.push(
    "| Année | Exercices sans consigne officielle | Scan (image à lire) | Couche texte transposée | Consignes candidates extraites |"
  );
  lines.push("|---|---|---|---|---|");
  for (const [year, row] of [...statsByYear].sort()) {
    lines.push(
      `| ${year} | ${row.scan + row.transpose + row.texte} | ${row.scan} | ${row.transpose} | ${row.candidats} |`
    );
  }
  lines.push("");
  lines.push(
    `Bilan : ${withText} exercice(s) avec couche texte exploitable, ${withoutText} scan(s) sans aucune couche texte, ${candidates} consigne(s) candidates extraites.`
  );
  lines.push("Le texte extrait des PDF « transposés » comporte des lettres manquantes : une");
  lines.push("candidate n'est pas une transcription, elle doit être vérifiée mot à mot.");

  const out =
    options.out || join(root, "docs", "inventories", `relecture-${options.years.join("-") || "cibles"}.md`);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, lines.join("\n"), "utf8");
  console.log(`Feuille écrite : ${out}`);
  console.log(
    `${targets.length} exercices · ${withText} avec texte · ${withoutText} scans · ${candidates} consignes candidates`
  );
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) await main();
