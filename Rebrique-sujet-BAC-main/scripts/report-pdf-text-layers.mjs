/* Mesure la fiabilité de la couche texte des PDF officiels.

   Pourquoi cet outil existe
   -------------------------
   T3 (compléter les inventaires officiels de tâches) exige de recopier les
   consignes mot à mot depuis le PDF officiel. Encore faut-il que le PDF ait
   une couche texte exploitable. Ce script la mesure au lieu de la supposer.

   Quatre défauts distincts ont été observés sur ce corpus, et un seul marqueur
   ne suffit pas à les distinguer :

     scan              aucune couche texte (image seule) ;
     transposé         ordre des ligatures inversé — « اختبار يف مادة » au lieu
                       de « اختبار في مادة ». Les glyphes sont les bons, leur
                       ordre est faux : le texte est inutilisable tel quel ;
     formes-visuelles  encodage en « Arabic Presentation Forms » (U+FB50–U+FDFF,
                       U+FE70–U+FEFF), c'est-à-dire la forme visuelle et non la
                       lettre logique ;
     propre            arabe logique, en-tête officiel retrouvé verbatim.

   Ce que cet outil NE fait PAS
   ----------------------------
   Il ne certifie rien et n'écrit aucune donnée. Une couche texte « propre »
   autorise une relecture ASSISTÉE, jamais un encodage automatique : sur les
   sujets les mieux classés de ce corpus, les chiffres restent corrompus
   (barème extrait « 05 / 40 / 00 » pour un barème réel 5 + 7 + 8) et des
   coupures parasites scindent les mots. Recopier sans relecture humaine
   injecterait des consignes fausses. Le garde-fou n° 1 du dépôt s'applique :
   aucune consigne ne passe en `official` sans relecture humaine. */
import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { YEAR_CATALOG, loadYear } from "../data/subjects.js";

const require = createRequire(import.meta.url);
/* pdfjs-dist n'expose pas de point d'entrée ESM : même chargement que
   scripts/generate-official-inventories.mjs et scripts/extract-images.mjs. */
const pdfjs = require("pdfjs-dist/legacy/build/pdf.js");

const root = fileURLToPath(new URL("../", import.meta.url));
const WATERMARK = /www\.dzexams\.com/gi;

/* Mots-outils présents sur quasiment tous les sujets, forme correcte. */
const CORRECT_MARKERS = ["اختبار في مادة", "الجمهورية الجزائرية", "علوم تجريبية", "الطبيعة والحياة", "نقاط"];

/* Mêmes mots, ordre de ligatures inversé. */
const TRANSPOSED_MARKERS = ["اختبار يف مادة", "اجلمهورية", "علوم جتريبية", "واحلياة", "بكالوراي"];

/** En dessous de ce seuil, le PDF est un scan : il n'y a pas de couche texte. */
export const SCAN_CHAR_THRESHOLD = 200;

/** Au-delà de cette proportion, l'encodage est visuel et non logique. */
export const PRESENTATION_FORM_RATIO = 0.15;

/** Part de caractères en « Arabic Presentation Forms ». */
export function presentationFormRatio(text) {
  const chars = [...String(text)];
  if (!chars.length) return 0;
  const visual = chars.filter((char) => {
    const cp = char.codePointAt(0);
    return (cp >= 0xfb50 && cp <= 0xfdff) || (cp >= 0xfe70 && cp <= 0xfeff);
  }).length;
  return visual / chars.length;
}

/**
 * Classe une couche texte. Fonction pure : testable sans ouvrir un PDF.
 * @returns {{classe: string, correct: number, transpose: number, presentation: number}}
 */
export function classifyTextLayer(text) {
  const value = String(text || "");
  const correct = CORRECT_MARKERS.filter((marker) => value.includes(marker)).length;
  const transpose = TRANSPOSED_MARKERS.filter((marker) => value.includes(marker)).length;
  const presentation = presentationFormRatio(value);

  let classe;
  if (value.length <= SCAN_CHAR_THRESHOLD) classe = "scan";
  else if (presentation > PRESENTATION_FORM_RATIO) classe = "formes-visuelles";
  else if (transpose > 0) classe = "transposé";
  else if (correct >= 2) classe = "propre";
  else classe = "indéterminé";

  return { classe, correct, transpose, presentation };
}

/** Extrait la couche texte d'un PDF, page par page, filigrane retiré. */
export async function extractPdfText(absolutePath) {
  const doc = await pdfjs.getDocument({ url: absolutePath, useSystemFonts: true, isEvalSupported: false })
    .promise;
  let text = "";
  for (let pageNumber = 1; pageNumber <= doc.numPages; pageNumber += 1) {
    const page = await doc.getPage(pageNumber);
    const content = await page.getTextContent();
    const items = content.items.filter((item) => item.str.trim());
    /* Ordre de lecture : haut en bas, puis droite à gauche (arabe). */
    items.sort((a, b) => b.transform[5] - a.transform[5] || b.transform[4] - a.transform[4]);
    text += `${items.map((item) => item.str.trim()).join(" ")} `;
    page.cleanup();
  }
  await doc.destroy();
  return text.replace(WATERMARK, " ").replace(/\s+/g, " ").trim();
}

/**
 * Mesure les 40 sujets du catalogue.
 * @returns {Promise<{total:number, parClasse:Object, sujets:Array, exploitable:number}>}
 */
export async function buildPdfTextLayerStatus() {
  const sujets = [];

  for (const entry of YEAR_CATALOG) {
    const year = await loadYear(entry.id);
    for (const subject of year.sujets || []) {
      if (!subject.pdfLocalUrl) continue;
      const relativePath = subject.pdfLocalUrl.replace(/^\//, "");
      const absolutePath = join(root, relativePath);
      const label = `${entry.id}/${(entry.stream || "").toUpperCase()}${subject.id}`;

      if (!existsSync(absolutePath)) {
        sujets.push({ label, path: relativePath, classe: "absent", chars: 0, correct: 0, transpose: 0 });
        continue;
      }
      try {
        const text = await extractPdfText(absolutePath);
        const { classe, correct, transpose, presentation } = classifyTextLayer(text);
        sujets.push({
          label,
          path: relativePath,
          classe,
          chars: text.length,
          correct,
          transpose,
          presentation
        });
      } catch {
        sujets.push({ label, path: relativePath, classe: "erreur", chars: 0, correct: 0, transpose: 0 });
      }
    }
  }

  const parClasse = {};
  for (const sujet of sujets) parClasse[sujet.classe] = (parClasse[sujet.classe] || 0) + 1;

  return {
    total: sujets.length,
    parClasse,
    sujets,
    /* « exploitable » = relecture assistée possible, pas encodage automatique. */
    exploitable: parClasse["propre"] || 0
  };
}

function print(status) {
  console.log(`PDF officiels mesurés : ${status.total}`);
  for (const classe of Object.keys(status.parClasse).sort()) {
    console.log(`  ${classe.padEnd(18)} ${status.parClasse[classe]}`);
  }
  console.log("");
  console.log(`Relecture assistée possible (couche texte propre) : ${status.exploitable}/${status.total}`);
  console.log("Rappel : une couche texte propre n'autorise PAS un encodage automatique.");
  console.log("         Les chiffres extraits restent corrompus sur ce corpus.");
  console.log("");
  for (const classe of Object.keys(status.parClasse).sort()) {
    console.log(`--- ${classe} ---`);
    for (const sujet of status.sujets.filter((item) => item.classe === classe)) {
      console.log(`  ${sujet.label.padEnd(12)} car=${String(sujet.chars).padStart(6)}  ${sujet.path}`);
    }
    console.log("");
  }
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const status = await buildPdfTextLayerStatus();
  print(status);
  /* T3 n'est atteint que lorsque chaque sujet a une couche texte propre. */
  if (process.argv.includes("--check-complete") && status.exploitable !== status.total) process.exitCode = 1;
}
