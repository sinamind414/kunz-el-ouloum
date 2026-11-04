import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { YEAR_CATALOG } from "../data/subjects.js";

const root = fileURLToPath(new URL("../", import.meta.url));
const read = (path) => readFileSync(join(root, path), "utf8");

function shellAssets(serviceWorker) {
  const block = serviceWorker.match(/const SHELL_ASSETS = \[([\s\S]*?)\];/);
  return block ? [...block[1].matchAll(/"([^"]+)"/g)].map((match) => match[1]) : [];
}

/* Tous les payloads paresseux présents sur le disque, toutes filières
   confondues. Le compte est lu, jamais écrit en dur : ajouter une année ne
   doit pas rouvrir ce critère, oublier de la cataloguer si. */
function lazyYearFiles() {
  const files = [];
  for (const stream of ["se", "m"]) {
    const dir = join(root, "data", "years", stream);
    if (!existsSync(dir)) continue;
    for (const file of readdirSync(dir)) {
      if (/^year-\d{4}(-\w+)?\.js$/.test(file)) files.push(`data/years/${stream}/${file}`);
    }
  }
  return files.sort();
}

function revisionMatches(versionSource, path) {
  const digest = createHash("sha256")
    .update(readFileSync(join(root, path)))
    .digest("hex");
  return versionSource.includes(`"${path}"`) && versionSource.includes(`sha256: "${digest}"`);
}

export function buildP3Status() {
  const subjects = read("data/subjects.js");
  const pdfViewer = read("js/ui/pdf-viewer.js");
  const serviceWorker = read("sw.js");
  const diagnostics = read("js/services/diagnostics.js");
  const build = read("build.mjs");
  const version = read("js/app-version.js");
  const shell = shellAssets(serviceWorker);
  const yearPaths = YEAR_CATALOG.map((year) => year.modulePath);
  const revisioned = ["manifest.webmanifest", "assets/icon-192.png", "assets/icon-512.png"];
  const onDisk = lazyYearFiles();
  const catalogued = YEAR_CATALOG.map((year) => year.modulePath);
  const lazyData =
    // Chaque payload présent est catalogué, et réciproquement : pas de fichier
    // oublié, pas d'entrée fantôme, aucun payload embarqué dans le catalogue.
    onDisk.length === catalogued.length &&
    onDisk.every((path) => catalogued.includes(path)) &&
    YEAR_CATALOG.every(
      (year) =>
        !("sujets" in year) &&
        existsSync(join(root, year.modulePath)) &&
        subjects.includes(`import("./${year.modulePath.replace(/^data\//, "")}")`)
    ) &&
    !/^import .*years\//m.test(subjects);
  /* Le repli vers la source officielle doit rester explicite : construit par la
     visionneuse, ouvert dans un onglet distinct, jamais téléchargé d'office ni
     embarqué dans une iframe. La branche « source externe » est isolée parce
     que la branche « fichier local » contient légitimement une iframe masquée
     (repli du rendu <canvas>, même origine, autorisée par frame-src 'self') et
     un lien de téléchargement. Si l'ancre disparaît, `externalBranch` vaut ""
     et toutes les conditions positives échouent : le garde-fou tombe en échec
     plutôt que de passer à vide. */
  const externalBranchAt = pdfViewer.indexOf("if (external) {");
  const externalBranch = externalBranchAt >= 0 ? pdfViewer.slice(externalBranchAt) : "";
  const explicitPdf =
    !shell.some((asset) => asset.endsWith(".pdf") || asset.includes("data/years/")) &&
    pdfViewer.includes("pdfExternalUrl") &&
    externalBranch.includes("فتح المصدر الخارجي") &&
    externalBranch.includes('target="_blank"') &&
    !externalBranch.includes("download") &&
    !externalBranch.includes("<iframe");
  const versionedAssets = revisioned.every((path) => revisionMatches(version, path));
  const runtimeMaximum = Number(serviceWorker.match(/const RUNTIME_MAX_ENTRIES = (\d+);/)?.[1]);
  const boundedRuntime =
    runtimeMaximum > 0 &&
    runtimeMaximum <= 32 &&
    serviceWorker.includes("trimRuntimeCache") &&
    serviceWorker.includes("response?.ok === true") &&
    serviceWorker.includes("response.status === 200") &&
    serviceWorker.includes("CURRENT_CACHES");
  const privateObservability =
    diagnostics.includes("getOperationalSnapshot") &&
    diagnostics.includes("initializeOperationalObservability") &&
    diagnostics.includes("errorBuckets") &&
    !diagnostics.includes("localStorage") &&
    !diagnostics.includes("fetch(") &&
    existsSync(join(root, "js/ui/operational-status.js"));
  const deterministicRelease =
    build.includes('"dist", "site"') &&
    build.includes("release.json") &&
    build.includes("contentSha256") &&
    !build.includes("new Date") &&
    existsSync(join(root, "scripts/verify-release.mjs")) &&
    existsSync(join(root, "docs/DEPLOYMENT.md"));

  const gates = [
    {
      id: "P3.1",
      complete: lazyData,
      evidence: `${yearPaths.length} payloads filière/année (${onDisk.length} fichiers), catalogue sans sujets, imports dynamiques littéraux`
    },
    {
      id: "P3.2",
      complete: explicitPdf,
      evidence: `${shell.length} ressources shell; 0 payload annuel/PDF précaché; liens PDF externes explicites`
    },
    {
      id: "P3.3",
      complete: versionedAssets,
      evidence: `${revisioned.filter((path) => revisionMatches(version, path)).length}/${revisioned.length} manifeste/icônes révisionnés par SHA-256`
    },
    {
      id: "P3.4",
      complete: boundedRuntime,
      evidence: `runtime limité à ${runtimeMaximum || "?"} entrées; HTTP 200 local seulement; éviction et purge par build`
    },
    {
      id: "P3.5",
      complete: privateObservability,
      evidence:
        "compteurs d'erreurs locaux sans payload, build visible, transitions online/offline et événements SW agrégés"
    },
    {
      id: "P3.6",
      complete: deterministicRelease,
      evidence:
        "dist/site + release.json déterministe, vérificateur d'empreintes et procédure déploiement/rollback"
    }
  ];
  return {
    complete: gates.every((gate) => gate.complete),
    completedGates: gates.filter((gate) => gate.complete).length,
    totalGates: gates.length,
    gates
  };
}

function print(status) {
  console.log("lot\tétat\tpreuve");
  for (const gate of status.gates) {
    console.log(`${gate.id}\t${gate.complete ? "terminé" : "bloqué"}\t${gate.evidence}`);
  }
  console.log(
    `\nP3: ${status.complete ? "TERMINÉ" : "INCOMPLET"} (${status.completedGates}/${status.totalGates} critères d'acceptation fermés).`
  );
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const status = buildP3Status();
  print(status);
  if (process.argv.includes("--check-complete") && !status.complete) process.exitCode = 1;
}
