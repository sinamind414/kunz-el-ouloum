/* Intégrité du contenu PDF — trois invariants qui n'étaient garantis nulle part
   avant ce test, et que deux défauts distincts avaient déjà violés :
   D6  : l'entrée 2017/m session exceptionnelle pointait vers les PDF de la
         session principale, donc l'élève voyait le mauvais sujet pendant que les
         vrais PDF restaient orphelins sur le disque ;
   D9  : le service worker ne reconnaissait pas le segment `exceptional/`, donc
         ces PDF retombaient dans le cache shell, qui n'a aucune borne. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

import { ARCHIVE } from "../data/archive.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const toPosix = (path) => path.split(sep).join("/");

/** Tous les PDF réellement présents sous subjects/. */
function pdfFilesOnDisk() {
  const found = [];
  const walk = (dir) => {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      if (statSync(full).isDirectory()) walk(full);
      else if (entry.endsWith(".pdf")) found.push(`/${toPosix(relative(root, full))}`);
    }
  };
  walk(join(root, "subjects"));
  return found.sort();
}

/** Tous les fichiers .js sous un répertoire. */
function jsFiles(dir) {
  const found = [];
  const walk = (current) => {
    for (const entry of readdirSync(current)) {
      const full = join(current, entry);
      if (statSync(full).isDirectory()) walk(full);
      else if (entry.endsWith(".js")) found.push(full);
    }
  };
  walk(dir);
  return found.sort();
}

/** Toute référence "/subjects/….pdf" écrite dans les données, indexée par fichier. */
function referencedPdfPaths() {
  const refs = new Map();
  for (const file of jsFiles(join(root, "data"))) {
    const source = readFileSync(file, "utf8");
    for (const match of source.matchAll(/"(\/subjects\/[^"]+\.pdf)"/g)) {
      const path = match[1];
      if (!refs.has(path)) refs.set(path, new Set());
      refs.get(path).add(toPosix(relative(root, file)));
    }
  }
  return refs;
}

/** Charge sw.js dans un contexte isolé pour atteindre isRuntimeAsset. */
function serviceWorkerApi() {
  const source = `${readFileSync(join(root, "sw.js"), "utf8")}\nglobalThis.__swTest = { isRuntimeAsset };`;
  const context = vm.createContext({
    caches: {
      async open() {},
      async keys() {
        return [];
      }
    },
    self: { APP_BUILD_ID: "test", location: { origin: "https://app.test" }, addEventListener() {} },
    Request: globalThis.Request,
    Response,
    URL,
    fetch: async () => {
      throw new Error("network not configured");
    },
    importScripts() {},
    console
  });
  vm.runInContext(source, context);
  return context.__swTest;
}

test("toute référence PDF écrite dans data/ existe réellement sur le disque", () => {
  const missing = [];
  for (const [path, files] of referencedPdfPaths()) {
    if (!existsSync(join(root, path))) missing.push(`${path} ← ${[...files].join(", ")}`);
  }
  assert.deepEqual(missing, [], "références PDF cassées");
});

test("aucun PDF présent sur le disque n'est orphelin", () => {
  const referenced = referencedPdfPaths();
  const orphans = pdfFilesOnDisk().filter((path) => !referenced.has(path));
  assert.deepEqual(orphans, [], "PDF jamais atteignables depuis l'application");
});

test("deux sessions différentes ne partagent jamais les mêmes PDF", () => {
  const rows = [...(ARCHIVE.entries || []), ...(ARCHIVE.gaps || [])];
  const byKey = new Map();
  const collisions = [];
  for (const entry of rows) {
    if (!Array.isArray(entry.localPdfUrls) || entry.localPdfUrls.length === 0) continue;
    const key = `${entry.stream}|${entry.year}`;
    const signature = [...entry.localPdfUrls].sort().join("|");
    const previous = byKey.get(key);
    // Même session = doublon volontaire acceptable ; session distincte = l'élève
    // verrait le sujet de l'autre session.
    if (previous && previous.session !== entry.session && previous.signature === signature) {
      collisions.push(`${key} : ${previous.session} et ${entry.session} → ${signature}`);
    }
    if (!previous) byKey.set(key, { session: entry.session, signature });
  }
  assert.deepEqual(collisions, [], "deux sessions partagent les mêmes fichiers");
});

test("SE 2023 : le sujet 1 s'arrête à sa dernière page, le sujet 2 commence au sien", async () => {
  const { createRequire } = await import("node:module");
  const pdfjs = createRequire(import.meta.url)("pdfjs-dist/legacy/build/pdf.js");
  async function pages(path) {
    const doc = await pdfjs.getDocument({
      data: new Uint8Array(readFileSync(join(root, path))),
      isEvalSupported: false
    }).promise;
    return doc.numPages;
  }
  /* Livret dzexams de 10 pages, mal coupé jusqu'au 2026-09-21 : la page 5
     (début du sujet 2) était collée à la fin du sujet 1, et manquait au sujet 2. */
  assert.equal(await pages("subjects/SE/2023/sujet-1.pdf"), 4);
  assert.equal(await pages("subjects/SE/2023/sujet-2.pdf"), 6);
});

test("le service worker place tout PDF de sujet dans le cache runtime borné", () => {
  const api = serviceWorkerApi();
  const leaked = [];
  for (const path of pdfFilesOnDisk()) {
    const request = new globalThis.Request(`https://app.test${path}`);
    // Un PDF non reconnu par isRuntimeAsset suit fetchShellOrAsset : il entre
    // dans le cache shell, qui n'évince jamais rien.
    if (!api.isRuntimeAsset(request)) leaked.push(path);
  }
  assert.deepEqual(leaked, [], "PDF qui échapperaient au cache runtime borné");
});
