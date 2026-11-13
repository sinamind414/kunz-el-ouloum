import { createHash } from "node:crypto";
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { YEAR_CATALOG } from "../data/subjects.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const source = readFileSync(join(root, "sw.js"), "utf8");
const OUT_OF_GRAPH = {
  "js/app-version.js": "chargé par index.html et importScripts",
  /* Moteur d'évaluation automatique : aucune note n'est affichée à l'élève,
     l'application ne le charge plus. Il reste utilisé par les outils d'audit
     et de calibration (tests, scripts) — jamais par le navigateur. */
  "js/engine.js": "façade réservée aux outils d'audit et de calibration",
  "js/method-scripts.js": "scripts méthodologiques consommés par le moteur d'évaluation",
  "js/domain/evaluation/text-analysis.js": "moteur d'évaluation — outils d'audit",
  "js/domain/evaluation/text-evaluator.js": "moteur d'évaluation — outils d'audit",
  "js/domain/evaluation/pipeline-evaluator.js": "moteur d'évaluation — outils d'audit",
  "js/domain/evaluation/methodology.js": "moteur d'évaluation — outils d'audit",
  "js/domain/evaluation/quality-checks.js": "moteur d'évaluation — outils d'audit"
};

function toRepoPath(path) {
  return relative(root, path).split(sep).join("/");
}

function listFiles(directory, suffix = ".js") {
  return readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);
    return statSync(path).isDirectory()
      ? listFiles(path, suffix)
      : name.endsWith(suffix)
        ? [toRepoPath(path)]
        : [];
  });
}

/** Static imports only: import() is intentionally excluded from the shell graph. */
function staticImportGraph(entry) {
  const seen = new Set();
  const stack = [entry];
  while (stack.length) {
    const current = stack.pop();
    if (seen.has(current)) continue;
    seen.add(current);
    const code = readFileSync(join(root, current), "utf8");
    const pattern =
      /(?:^|\n)\s*(?:import\s+(?:[^"']*?\s+from\s+)?|export\s+[^"']*?\s+from\s+)["']([^"']+)["']/g;
    for (const match of code.matchAll(pattern)) {
      const specifier = match[1];
      if (!specifier.startsWith(".")) continue;
      const target = toRepoPath(resolve(dirname(join(root, current)), specifier));
      if (existsSync(join(root, target))) stack.push(target);
    }
  }
  return seen;
}

function shellAssets() {
  const block = source.match(/const SHELL_ASSETS = \[([\s\S]*?)\];/);
  assert.ok(block, "const SHELL_ASSETS introuvable dans sw.js");
  return [...block[1].matchAll(/"([^"]+)"/g)].map((match) => match[1]);
}

const assets = shellAssets();
const shellFiles = new Set(assets.map((asset) => asset.replace(/^\.\//, "")));
const graph = staticImportGraph("js/main.js");
const lazyYearFiles = YEAR_CATALOG.map((year) => year.modulePath);

test("le graphe statique du shell est parcouru sans avaler les imports d'années", () => {
  assert.ok(graph.has("js/main.js"));
  assert.ok(graph.has("js/ui.js"));
  assert.ok(graph.has("data/subjects.js"));
  assert.ok(graph.has("js/ui/operational-status.js"));
  // Le seuil protège contre un parcours cassé (graphe vide ou tronqué) : il a
  // été ajusté après la suppression des modules d'entraînement, puis après le
  // retrait du moteur d'évaluation du graphe de démarrage (2026-09-13).
  assert.ok(graph.size >= 20, `graphe statique anormalement petit: ${graph.size}`);
  assert.equal(
    [...graph].some((path) => path.startsWith("data/years/")),
    false
  );
});

test("tout le graphe statique et uniquement le shell nécessaire sont précachés", () => {
  const missing = [...graph].filter((path) => !shellFiles.has(path));
  assert.deepEqual(missing, [], `modules statiques absents du shell: ${missing.join(", ")}`);
  for (const asset of [
    "./",
    "./index.html",
    "./manifest.webmanifest",
    "./assets/styles.css",
    "./assets/icon-192.png",
    "./assets/icon-512.png",
    "./js/app-version.js"
  ]) {
    assert.ok(assets.includes(asset), `${asset} manque au shell`);
  }
});

test("aucun payload d'année ni PDF n'est précaché", () => {
  for (const path of lazyYearFiles)
    assert.equal(shellFiles.has(path), false, `${path} ne doit pas être précaché`);
  assert.equal(
    assets.some((asset) => asset.endsWith(".pdf")),
    false
  );
  assert.equal(
    assets.some((asset) => asset.includes("data/years/")),
    false
  );
});

test("chaque entrée du shell existe et chaque module JS est justifié", () => {
  const ghosts = assets
    .filter((asset) => asset !== "./")
    .map((asset) => asset.replace(/^\.\//, ""))
    .filter((path) => !existsSync(join(root, path)));
  assert.deepEqual(ghosts, []);

  const unaccounted = listFiles(join(root, "js")).filter(
    (path) => !graph.has(path) && !(path in OUT_OF_GRAPH) && path !== "js/app-version.js"
  );
  assert.deepEqual(unaccounted, [], `modules JS sans justification: ${unaccounted.join(", ")}`);
});

test("tous les payloads d'année sont découpés, catalogués et importés dynamiquement", () => {
  /* 14 SE + 6 Maths 4D + 8 armatures « copie libre » Maths 2013–2020
     + la session exceptionnelle 2017 Maths. */
  assert.equal(lazyYearFiles.length, 29);
  assert.equal(new Set(lazyYearFiles).size, lazyYearFiles.length);
  const subjectsSource = readFileSync(join(root, "data/subjects.js"), "utf8");
  for (const path of lazyYearFiles) {
    assert.ok(existsSync(join(root, path)), `${path} absent`);
    const relativeSpecifier = `./${path.replace(/^data\//, "")}`;
    assert.ok(subjectsSource.includes(`import("${relativeSpecifier}")`), `import dynamique absent: ${path}`);
  }
  assert.doesNotMatch(subjectsSource, /^import .*years\//m, "un payload est importé statiquement");
});

test("le runtime est borné et évince les insertions les plus anciennes", () => {
  const maximum = Number(source.match(/const RUNTIME_MAX_ENTRIES = (\d+);/)?.[1]);
  assert.ok(Number.isInteger(maximum) && maximum >= 1 && maximum <= 32, `borne invalide: ${maximum}`);
  assert.match(source, /keys\.slice\(0, overflow\)/);
  assert.match(source, /cache\.delete\(request\)/);
  assert.match(source, /trimRuntimeCache\(cache\)/);
});

test("seuls les payloads/PDF locaux réussis HTTP 200 peuvent entrer au runtime", () => {
  assert.match(source, /isRuntimeAsset\(request\)/);
  assert.match(source, /response\?\.ok === true/);
  assert.match(source, /response\.status === 200/);
  assert.match(source, /\["basic", "default"\]\.includes\(response\.type\)/);
  assert.match(
    source,
    /!isLocalRequest\(request\) \|\| !isRuntimeAsset\(request\) \|\| !isCacheableResponse\(response\)/
  );
  assert.match(source, /request\.method !== "GET" \|\| !isLocalRequest\(request\)/);
});

test("les caches sont isolés par build et l'activation ne supprime pas les caches voisins", () => {
  assert.match(source, /importScripts\("\.\/js\/app-version\.js"\)/);
  assert.match(source, /miftah-kanz/);
  assert.match(source, /CURRENT_CACHES/);
  assert.match(source, /key\.startsWith\(`\$\{CACHE_PREFIX\}-`\)/);
  assert.doesNotMatch(source, /keys\.filter\(\(key\) => key !==/);
});

test("le fallback HTML reste réservé aux navigations", () => {
  assert.match(source, /request\.mode === "navigate"/);
  assert.match(source, /caches\.match\(request, \{ ignoreSearch: true \}\)/);
  assert.match(source, /caches\.match\("\.\/index\.html"\)/);
  assert.match(source, /return Response\.error\(\)/);
});

test("manifeste et icônes portent une révision de contenu vérifiable et consommée", () => {
  const version = readFileSync(join(root, "js/app-version.js"), "utf8");
  const manifest = JSON.parse(readFileSync(join(root, "manifest.webmanifest"), "utf8"));
  const index = readFileSync(join(root, "index.html"), "utf8");
  const strategy = readFileSync(join(root, "js/ui/screens/strategy.js"), "utf8");
  for (const path of ["manifest.webmanifest", "assets/icon-192.png", "assets/icon-512.png"]) {
    const expected = createHash("sha256")
      .update(readFileSync(join(root, path)))
      .digest("hex");
    assert.ok(version.includes(`"${path}"`), `révision absente: ${path}`);
    assert.ok(version.includes(`sha256: "${expected}"`), `empreinte incorrecte: ${path}`);
  }
  for (const path of ["assets/icon-192.png", "assets/icon-512.png"]) {
    const revision = createHash("sha256")
      .update(readFileSync(join(root, path)))
      .digest("hex")
      .slice(0, 12);
    assert.ok(manifest.icons.some((icon) => icon.src === `${path}?v=${revision}`));
    if (path === "assets/icon-192.png") assert.ok(index.includes(`${path}?v=${revision}`));
  }
  assert.doesNotMatch(strategy, /APP_ASSET_REVISIONS\?\.\[subject\.pdf\]/);
  assert.doesNotMatch(source, /isPdfRequest\(request\)/);
});

/* Le shell doit refléter exactement ce que l'application charge au démarrage :
   ni module oublié (casse hors ligne), ni module mort (installation plus
   lourde qu'elle ne doit l'être). */
function staticImportClosure(entry) {
  const seen = new Set();
  const stack = [entry];
  while (stack.length) {
    const file = stack.pop();
    if (seen.has(file) || !existsSync(file)) continue;
    seen.add(file);
    for (const specifier of readFileSync(file, "utf8").matchAll(/from\s+"(\.[^"]+)"/g)) {
      stack.push(resolve(dirname(file), specifier[1]));
    }
  }
  return [...seen];
}

test("le shell précache tout le graphe de démarrage et rien de plus", () => {
  const shell = [...source.match(/const SHELL_ASSETS = \[([\s\S]*?)\];/)[1].matchAll(/"(\.[^"]+)"/g)].map(
    (match) => match[1]
  );
  const startup = staticImportClosure(join(root, "js/main.js")).map(
    (file) => "./" + relative(root, file).split(sep).join("/")
  );
  assert.ok(startup.length > 10, "le graphe de démarrage doit être détecté");
  for (const file of startup) {
    assert.ok(shell.includes(file), `${file} est chargé au démarrage sans être précaché`);
  }
  // Le moteur d'évaluation automatique n'est plus branché sur l'épreuve.
  const dead = shell.filter((path) =>
    /domain\/evaluation\/|js\/engine\.js|js\/method-scripts\.js/.test(path)
  );
  assert.deepEqual(dead, [], `modules morts précachés: ${dead.join(", ")}`);
});
