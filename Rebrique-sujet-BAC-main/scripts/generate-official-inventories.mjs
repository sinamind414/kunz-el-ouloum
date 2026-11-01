/* ============================================================
   Génère data/official-tasks.js à partir des chargements d'années.
   ------------------------------------------------------------
   Règle d'honnêteté : ce script NE CERTIFIE RIEN. Il recopie la
   provenance déjà enregistrée dans les données :
     - bacPromptSource === "official"      -> consigne officielle, page connue
     - bacPromptSource === "reconstructed" -> étape pédagogique reconstruite,
                                              page inconnue (page: null)
   Le barème reste "provisional" partout : aucune copie doublement annotée
   n'existe, donc rien ne peut être marqué "verified" sans mentir.
   ============================================================ */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import prettier from "prettier";
import { YEAR_CATALOG, loadYear } from "../data/subjects.js";

const root = fileURLToPath(new URL("../", import.meta.url));
const require = createRequire(import.meta.url);
const pdfjs = require("pdfjs-dist/legacy/build/pdf.js");
const outputPath = join(root, "data", "official-tasks.js");
const POLES = ["N", "S", "E", "W"];

/** Sujets en faisceau : pages du sujet seul (offset calculé dessus). */
const BUNDLED_SUJET_PAGES = new Map([
  ["2025/S1", 5],
  ["2025/S2", 5]
]);

/** Notes de relecture humaine déjà consignées — jamais inventées ici. */
const HUMAN_NOTES = new Map([
  [
    "2025/S1",
    "Exercice 1 relu visuellement sur le scan local par un humain (2026-08-23). Les autres exercices et années sont inventoriés mécaniquement depuis les données 4D, sans relecture humaine : voir promptSource de chaque tâche."
  ]
]);

/* ------------------------------------------------------------
   Pagination : les pages enregistrées (bacPromptPage) sont celles du
   document officiel complet. Or subjects/<année>/sujet-N.pdf ne
   contient souvent qu'un seul sujet : annoncer « ص 9 » sur un fichier
   de 5 pages est faux. On lit le nombre de pages réel et on déduit le
   décalage quand il est certain (sinon : null, aucune page inventée).
   ------------------------------------------------------------ */
const pageCounts = new Map();
async function pdfPageCount(file) {
  if (pageCounts.has(file)) return pageCounts.get(file);
  let count = null;
  if (existsSync(file)) {
    try {
      const doc = await pdfjs.getDocument({
        data: new Uint8Array(readFileSync(file)),
        isEvalSupported: false
      }).promise;
      count = doc.numPages;
    } catch {
      count = null; // PDF illisible : on n'affirme rien
    }
  }
  pageCounts.set(file, count);
  return count;
}

/** Décalage entre la page du document officiel et celle du PDF local. */
function computePageOffset(pages, pdfPages) {
  if (!pages.length || !pdfPages) return null;
  const min = Math.min(...pages);
  const max = Math.max(...pages);
  if (max <= pdfPages && min >= 1) return 0; // le fichier suit la numérotation du document
  if (max - min + 1 === pdfPages) return min - 1; // le fichier commence à la 1re page du sujet
  return null; // ambigu : on n'invente pas de correspondance
}

function buildTasks(yearId, subject, exercise) {
  const tasks = [];
  let order = 0;
  for (const pole of POLES) {
    const data = exercise.poles?.[pole];
    const prompt = typeof data?.bacPrompt === "string" ? data.bacPrompt.trim() : "";
    if (!prompt) continue;
    const official = data.bacPromptSource === "official";
    const page = Number.isInteger(data.bacPromptPage) && data.bacPromptPage > 0 ? data.bacPromptPage : null;
    order += 1;
    tasks.push({
      id: `${yearId}-S${subject.id}-E${exercise.number}-Q${order}`,
      exerciseNumber: exercise.number,
      order,
      pole,
      page: official ? page : null,
      prompt,
      promptSource: official ? "official" : "reconstructed",
      maxPoints: Number(data.points) > 0 ? Number(data.points) : 1,
      scoringReviewStatus: "provisional",
      documentReviewStatus: official && page ? "pending" : "not-required",
      documentRefs: [], // renseigné après l'offset (page fichier, voir buildInventory)
      trainingMappings: [{ exerciseNumber: exercise.number, pole, kind: "direct" }]
    });
  }
  return tasks;
}

async function buildInventory(yearId, year, subject) {
  const tasks = (subject.exercises || []).flatMap((exercise) => buildTasks(yearId, subject, exercise));
  const documentPath = subject.pdfLocalUrl || null;
  const documentPages = documentPath ? await pdfPageCount(join(root, documentPath.replace(/^\//, ""))) : null;
  // Sujets livrés en faisceau sujet+corrigé : pages du SUJET seul, vérifiées
  // par lecture (2025/S1 : p1-5 sujet + p6-11 corrigé ; idem 2025/S2).
  const sujetPages = BUNDLED_SUJET_PAGES.get(`${yearId}/S${subject.id}`) ?? documentPages;
  const offset = computePageOffset(
    tasks.map((task) => task.page).filter((page) => Number.isInteger(page)),
    sujetPages
  );
  // pageInPdf + documentRefs : la page à ouvrir dans le fichier local, uniquement
  // si certaine. Les refs désignent le fichier livré (comme pageInPdf), jamais
  // la numérotation livret (qui reste portée par task.page).
  for (const task of tasks) {
    const local = Number.isInteger(task.page) && offset !== null ? task.page - offset : null;
    task.pageInPdf = local !== null && local >= 1 && local <= sujetPages ? local : null;
    if (task.promptSource === "official" && Number.isInteger(task.pageInPdf)) {
      task.documentRefs = [{ id: "subject-pdf", pages: [task.pageInPdf] }];
    }
  }
  const inventoriedExerciseNumbers = [...new Set(tasks.map((task) => task.exerciseNumber))].sort(
    (a, b) => a - b
  );
  // Un exercice n'est déclaré « complet » que si TOUTES ses étapes sont des
  // consignes officielles ET que les points correspondent au maximum.
  const taskCompleteExerciseNumbers = (subject.exercises || [])
    .filter((exercise) => {
      const own = tasks.filter((task) => task.exerciseNumber === exercise.number);
      if (!own.length) return false;
      if (!own.every((task) => task.promptSource === "official")) return false;
      const sum = own.reduce((total, task) => total + task.maxPoints, 0);
      return Math.abs(sum - (Number(exercise.max) || 0)) < 1e-6;
    })
    .map((exercise) => exercise.number);
  const allExercisesComplete =
    (subject.exercises || []).length > 0 &&
    (subject.exercises || []).every((exercise) => taskCompleteExerciseNumbers.includes(exercise.number));

  return {
    schemaVersion: 1,
    status: allExercisesComplete ? "complete" : "partial",
    source: {
      kind: "local-pdf",
      locator: subject.pdfExternalUrl || subject.pdfLocalUrl || "",
      humanVerified: false,
      verifiedAt: null,
      notes: HUMAN_NOTES.get(`${yearId}/S${subject.id}`) || null
    },
    document: {
      localPath: documentPath,
      pages: documentPages,
      pageOffset: offset
    },
    scope: { inventoriedExerciseNumbers, taskCompleteExerciseNumbers },
    tasks
  };
}

const years = await Promise.all(
  YEAR_CATALOG.map(async (entry) => ({ entry, year: await loadYear(entry.id) }))
);

const inventories = {};
const summary = [];
for (const { entry, year } of years) {
  if (!year) continue;
  /* Une armature « copie libre » n'encode aucune consigne : elle n'a donc
     AUCUN inventaire à générer. En fabriquer un vide reviendrait à prétendre
     que le sujet a été inventorié — ce qu'aucune donnée ne permet d'affirmer. */
  if (year.answerMode === "free") continue;
  for (const subject of year.sujets || []) {
    const key = `${year.id}/S${subject.id}`;
    inventories[key] = await buildInventory(year.id, year, subject);
    const tasks = inventories[key].tasks;
    summary.push({
      key,
      status: inventories[key].status,
      tasks: tasks.length,
      official: tasks.filter((task) => task.promptSource === "official").length,
      reconstructed: tasks.filter((task) => task.promptSource === "reconstructed").length,
      pageInPdf: tasks.filter((task) => Number.isInteger(task.pageInPdf)).length,
      pageOffset: inventories[key].document.pageOffset,
      complete: inventories[key].scope.taskCompleteExerciseNumbers.length
    });
  }
}

const prettierConfig = (await prettier.resolveConfig(outputPath)) || {};
const generated = await prettier.format(
  `// Generated by scripts/generate-official-inventories.mjs; do not edit manually.
/* ============================================================
   OFFICIAL TASK INVENTORIES
   ------------------------------------------------------------
   Inventaires dérivés mécaniquement des chargements data/years/**.
   Chaque tâche porte sa provenance réelle :
     - promptSource "official"      : consigne du sujet, page connue ;
     - promptSource "reconstructed" : étape pédagogique reconstruite,
       page inconnue (null) — CE N'EST PAS une question officielle.
   Aucune tâche n'est marquée "verified" : le barème reste provisoire
   tant qu'aucune copie doublement annotée n'existe (voir
   data/calibration-status.js). Ne pas éditer à la main : relancer
   \`node scripts/generate-official-inventories.mjs\`.
   ============================================================ */
export const OFFICIAL_TASK_INVENTORIES = Object.freeze(${JSON.stringify(inventories, null, 2)});

export function officialTaskInventoryFor(yearId, subjectId) {
  return OFFICIAL_TASK_INVENTORIES[\`\${yearId}/S\${subjectId}\`] || null;
}

export function officialInventoryKeys() {
  return Object.keys(OFFICIAL_TASK_INVENTORIES);
}

export const INVENTORY_SCHEMA_VERSION = 1;
`,
  { ...prettierConfig, parser: "babel" }
);

// --check : le fichier versionné doit être exactement ce que produit le
// générateur. Aucune édition manuelle n'est acceptée (sinon la preuve de
// provenance — official/reconstructed — ne vaut plus rien).
if (process.argv.includes("--check")) {
  const { readFileSync } = await import("node:fs");
  const current = readFileSync(outputPath, "utf8");
  if (current !== generated) {
    console.error("data/official-tasks.js is stale. Run node scripts/generate-official-inventories.mjs");
    process.exit(1);
  }
  console.log(`data/official-tasks.js à jour (${Object.keys(inventories).length} inventaires).`);
} else {
  writeFileSync(outputPath, generated);
  const official = summary.reduce((sum, row) => sum + row.official, 0);
  const reconstructed = summary.reduce((sum, row) => sum + row.reconstructed, 0);
  console.log(`inventories: ${summary.length} sujets, ${summary.reduce((s, r) => s + r.tasks, 0)} tâches`);
  console.log(`  consignes officielles : ${official}`);
  console.log(`  étapes reconstruites  : ${reconstructed}`);
  console.log(
    `  statut "complete"     : ${summary.filter((row) => row.status === "complete").length}/${summary.length}`
  );
  const located = summary.reduce((total, row) => total + row.pageInPdf, 0);
  console.log(`  pages rattachées au fichier : ${located}/${official}`);
  const shifted = summary.filter((row) => row.pageOffset);
  if (shifted.length) {
    console.log(
      `  décalage de pagination : ${shifted.map((row) => `${row.key} (+${row.pageOffset})`).join(", ")}`
    );
  }
  const orphans = summary.filter((row) => row.official > row.pageInPdf);
  if (orphans.length) {
    console.log(
      `  ⚠️ page non locable dans le fichier : ${orphans.map((row) => `${row.key} (${row.official - row.pageInPdf})`).join(", ")}`
    );
  }
  const without = summary.filter((row) => row.tasks === 0);
  if (without.length) console.log(`  ⚠️ sans tâche: ${without.map((row) => row.key).join(", ")}`);
}
