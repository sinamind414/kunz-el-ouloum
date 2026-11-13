import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createInterface } from "node:readline";
import { findPole } from "./_find-pole.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const CASES_PATH = join(__dirname, "cases.json");
const AUDIT_MANIFEST_PATH = join(__dirname, "audit-manifest.json");
const REPO_ROOT = join(__dirname, "../..");

export function loadCases() {
  try {
    return JSON.parse(readFileSync(CASES_PATH, "utf8"));
  } catch {
    return { cases: [] };
  }
}

export function loadAuditManifest() {
  try {
    return JSON.parse(readFileSync(AUDIT_MANIFEST_PATH, "utf8"));
  } catch {
    return { version: 1, records: [] };
  }
}

export function saveCases(data) {
  data.cases.sort((a, b) => {
    if (a.year !== b.year) return a.year.localeCompare(b.year);
    if (a.sujet !== b.sujet) return a.sujet - b.sujet;
    if (a.exercise !== b.exercise) return a.exercise - b.exercise;
    if (a.pole !== b.pole) return a.pole.localeCompare(b.pole);
    return a.id.localeCompare(b.id);
  });
  writeFileSync(CASES_PATH, JSON.stringify(data, null, 2) + "\n");
}

export function generateId(cases, year, sujet, exercise, pole) {
  const prefix = `${year}-S${sujet}-E${exercise}-${pole}`;
  const existing = cases
    .filter((c) => c.id.startsWith(prefix + "-"))
    .map((c) => parseInt(c.id.split("-").pop(), 10))
    .filter((n) => !Number.isNaN(n));
  const next = existing.length > 0 ? Math.max(...existing) + 1 : 1;
  return `${prefix}-${String(next).padStart(3, "0")}`;
}

const LLM_MARKERS = [
  "En ce qui concerne",
  "Il est important de noter",
  "Tout d'abord",
  "D'une part",
  "D'autre part",
  "En conclusion",
  "Par ailleurs",
  "Il convient de",
  "Il faut souligner",
  "En effet",
  "In conclusion",
  "Furthermore",
  "Moreover"
];

export function detectLLM(text) {
  const hits = [];
  const raw = String(text || "");
  for (const marker of LLM_MARKERS) {
    if (raw.includes(marker)) hits.push(marker);
  }
  if (raw.includes("—") && /[أ-ي]/.test(raw))
    hits.push("em-dash « — » en contexte français/arabe académique");
  return hits;
}

export function validateCase(caseObj, maxScore = Infinity) {
  const errors = [];
  if (!caseObj.id || typeof caseObj.id !== "string") errors.push("id manquant");
  if (!caseObj.year || !/^\d{4}(?:-[a-z]{1,3})?$/.test(caseObj.year)) errors.push("year invalide");
  if (typeof caseObj.sujet !== "number") errors.push("sujet invalide");
  if (typeof caseObj.exercise !== "number") errors.push("exercise invalide");
  if (!["N", "S", "E", "W"].includes(caseObj.pole)) errors.push("pole invalide");
  if (!["strong", "weak", "scientifically-wrong", "off-topic"].includes(caseObj.category))
    errors.push("category invalide (strong, weak, scientifically-wrong, off-topic)");
  if (!caseObj.auditId || !/^AUD-[A-Z0-9-]{8,}$/.test(caseObj.auditId)) errors.push("auditId invalide");
  if (!caseObj.answer || typeof caseObj.answer !== "string" || caseObj.answer.length < 5)
    errors.push("answer trop courte");
  if (!caseObj.source || typeof caseObj.source !== "string") errors.push("source manquante");
  if (!caseObj.collector || typeof caseObj.collector !== "string") errors.push("collector manquant");
  if (!Array.isArray(caseObj.annotations) || caseObj.annotations.length < 2) {
    errors.push("deux annotations humaines indépendantes sont requises");
  } else {
    const annotators = new Set();
    caseObj.annotations.forEach((annotation, index) => {
      if (!annotation || typeof annotation.annotator !== "string" || !annotation.annotator.trim())
        errors.push(`annotator ${index + 1} invalide`);
      if (
        !annotation ||
        typeof annotation.score !== "number" ||
        !Number.isFinite(annotation.score) ||
        annotation.score < 0 ||
        annotation.score > maxScore
      )
        errors.push(`score annotateur ${index + 1} invalide`);
      if (!annotation || typeof annotation.note !== "string" || !annotation.note.trim())
        errors.push(`note annotateur ${index + 1} invalide`);
      if (!annotation?.completedAt || Number.isNaN(Date.parse(annotation.completedAt)))
        errors.push(`horodatage annotateur ${index + 1} invalide`);
      if (annotation?.blindedToPeer !== true || annotation?.blindedToEngine !== true)
        errors.push(`aveugle annotateur ${index + 1} non garanti`);
      if (annotation?.annotator) annotators.add(annotation.annotator.trim());
    });
    if (annotators.size < 2) errors.push("les deux annotations doivent venir de correcteurs distincts");
  }
  if (!caseObj.date || !/^\d{4}-\d{2}-\d{2}$/.test(caseObj.date)) errors.push("date invalide (YYYY-MM-DD)");
  return errors;
}

export function validateAuditRecord(caseObj, manifest = loadAuditManifest()) {
  const record = manifest.records?.find((item) => item.auditId === caseObj.auditId);
  if (!record) return ["auditId absent du manifeste d'audit"];
  const errors = [];
  const sha256 = /^[a-f0-9]{64}$/;
  if (!record.consentRef || record.consentRef.length < 8) errors.push("consentRef d'audit invalide");
  if (!sha256.test(record.copySha256 || "")) errors.push("empreinte de copie invalide");
  if (!sha256.test(record.transcriptionSha256 || "")) errors.push("empreinte de transcription invalide");
  if (!Array.isArray(record.annotationForms) || record.annotationForms.length !== 2) {
    errors.push("deux formulaires d'annotation audités sont requis");
  } else {
    record.annotationForms.forEach((form, index) => {
      if (!form.annotator || !sha256.test(form.sha256 || "") || Number.isNaN(Date.parse(form.completedAt)))
        errors.push(`formulaire d'annotation ${index + 1} invalide`);
    });
  }
  if (!record.verifiedBy || Number.isNaN(Date.parse(record.verifiedAt)))
    errors.push("vérification indépendante incomplète");
  const caseAnnotators = new Set(caseObj.annotations?.map((item) => item.annotator));
  const formAnnotators = new Set(record.annotationForms?.map((item) => item.annotator));
  if ([...caseAnnotators].some((annotator) => !formAnnotators.has(annotator)))
    errors.push("les correcteurs du cas ne correspondent pas au manifeste");
  if (caseAnnotators.has(record.verifiedBy) || record.verifiedBy === caseObj.collector)
    errors.push("le vérificateur doit être distinct du collecteur et des correcteurs");
  return errors;
}

async function prompt(question) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) =>
    rl.question(question, (ans) => {
      rl.close();
      resolve(ans);
    })
  );
}

function printHelp() {
  console.log(`Usage: node tests/hard-benchmark/import-copy.mjs [fichier.json] [--dry-run] [--yes]

Importe une copie d'élève réelle, anonymisée et annotée indépendamment par deux correcteurs humains.
N'invente jamais de copie. Refuse un pôle inexistant, une année désactivée ou une annotation unique.

Options:
  --dry-run   Valide le JSON sans écrire dans cases.json
  --yes       Confirme malgré une alerte de marqueurs LLM
  --help      Affiche cette aide
`);
}

function parseInput() {
  const args = process.argv.slice(2).filter((a) => !a.startsWith("--"));
  if (!args[0]) return null;
  try {
    if (args[0].trim().startsWith("{")) return JSON.parse(args[0]);
    return JSON.parse(readFileSync(args[0], "utf8"));
  } catch {
    console.error("Impossible de lire le JSON:", args[0]);
    process.exit(1);
  }
}

async function main() {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    printHelp();
    return;
  }
  const autoYes = process.argv.includes("--yes") || process.argv.includes("--confirm");
  const dryRun = process.argv.includes("--dry-run");
  const auditPath = process.argv.find((arg) => arg.startsWith("--audit-manifest="))?.split("=")[1];
  const auditManifest = auditPath ? JSON.parse(readFileSync(auditPath, "utf8")) : loadAuditManifest();
  let input = parseInput();
  const data = loadCases();
  const caseObj = input ? { ...input } : {};

  if (!input) {
    console.log("=== Import d'une copie réelle ===\n");
    caseObj.year = await prompt("Session (YYYY ou YYYY-m): ");
    caseObj.sujet = parseInt(await prompt("Sujet (1 ou 2): "), 10);
    caseObj.exercise = parseInt(await prompt("Exercice (1-3): "), 10);
    caseObj.pole = (await prompt("Pôle (N/S/E/W): ")).toUpperCase();
    caseObj.category = await prompt("Catégorie (strong/weak/scientifically-wrong/off-topic): ");
    caseObj.answer = await prompt("Réponse transcrite: ");
    caseObj.source = await prompt("Source (fichier/établissement): ");
    caseObj.collector = await prompt("Collecteur: ");
    caseObj.auditId = await prompt("Identifiant du manifeste d'audit (AUD-...): ");
    caseObj.annotations = [];
    for (const index of [1, 2]) {
      const blindedToPeer =
        (await prompt(`Correcteur ${index} aveugle à l'autre note ? (oui/non): `)) === "oui";
      const blindedToEngine =
        (await prompt(`Correcteur ${index} aveugle au résultat moteur ? (oui/non): `)) === "oui";
      caseObj.annotations.push({
        annotator: await prompt(`Correcteur ${index} (identifiant pseudonymisé): `),
        score: Number(await prompt(`Note du correcteur ${index}: `)),
        note: await prompt(`Justification du correcteur ${index}: `),
        completedAt: await prompt(`Horodatage ISO du correcteur ${index}: `),
        blindedToPeer,
        blindedToEngine
      });
    }
    caseObj.date = await prompt("Date (YYYY-MM-DD): ");
  }

  if (typeof caseObj.sujet === "string") caseObj.sujet = parseInt(caseObj.sujet, 10);
  if (typeof caseObj.exercise === "string") caseObj.exercise = parseInt(caseObj.exercise, 10);

  const poleInfo = findPole(caseObj.year, caseObj.sujet, caseObj.exercise, caseObj.pole);
  if (!poleInfo) {
    console.error(
      "❌ Pôle introuvable dans data/subjects.js pour",
      caseObj.year,
      caseObj.sujet,
      caseObj.exercise,
      caseObj.pole
    );
    process.exit(1);
  }

  caseObj.id =
    caseObj.id || generateId(data.cases, caseObj.year, caseObj.sujet, caseObj.exercise, caseObj.pole);

  const errors = [
    ...validateCase(caseObj, poleInfo.pole.points),
    ...validateAuditRecord(caseObj, auditManifest)
  ];
  if (errors.length) {
    console.error("❌ Validation échouée:", errors.join(", "));
    process.exit(1);
  }

  const llmHits = detectLLM(caseObj.answer);
  if (llmHits.length) {
    console.warn("⚠️  Marqueurs LLM détectés:", llmHits.join(", "));
    if (!input && !autoYes) {
      const confirm = await prompt("Confirmer l'ajout malgré tout ? (oui/non): ");
      if (confirm !== "oui") {
        console.log("Import annulé.");
        process.exit(0);
      }
    } else if (!autoYes) {
      console.warn("⚠️  Import non-interactif : copie ajoutée malgré l'alerte (passez --yes pour le taire).");
    }
  }

  if (dryRun) {
    console.log(`🔎 Dry-run : copie valide, non écrite (${caseObj.id}).`);
    console.log(`   Pôle: ${caseObj.year}/S${caseObj.sujet}/E${caseObj.exercise}/${caseObj.pole}`);
    console.log(`   Catégorie: ${caseObj.category}`);
    console.log(`   Source: ${caseObj.source}`);
    return;
  }

  data.cases.push(caseObj);
  saveCases(data);

  console.log(`✅ Copie importée: ${caseObj.id}`);
  console.log(`   Pôle: ${caseObj.year}/S${caseObj.sujet}/E${caseObj.exercise}/${caseObj.pole}`);
  console.log(`   Catégorie: ${caseObj.category}`);
  console.log(`   Source: ${caseObj.source}`);

  if (!input) {
    console.log("\nLancement de npm run test:hard ...");
    const { execSync } = await import("node:child_process");
    try {
      execSync("npm run test:hard", { stdio: "inherit", cwd: REPO_ROOT });
    } catch {
      console.log("(tests hard-benchmark terminés avec avertissements ou erreurs)");
    }
  }
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
