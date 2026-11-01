/* ============================================================
   Builds two deterministic, offline-capable deliverables:
   1. dist/site/ — exact production static surface + release.json;
   2. dist/boussole-4d-standalone.html — single file for file://.

   Weight note: dist/site mirrors the repository's `subjects/` directory, so it
   ships the official PDFs tracked here (~42 MB — see docs/CONTENT_RIGHTS.md and
   LICENSE-CONTENT). The standalone file, by contrast, contains no PDF at all:
   it only keeps external source links. Both totals are printed at the end of
   the build so a sudden weight change is visible in CI logs.
   ============================================================ */
import { copyFileSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as esbuild from "esbuild";
import {
  computeBuildMetadata,
  fileMetadata,
  listPublicAssets,
  sha256
} from "./scripts/lib/public-assets.mjs";

const root = dirname(fileURLToPath(import.meta.url));
function readText(path) {
  return readFileSync(join(root, path), "utf8");
}

function verifiedBuildMetadata() {
  const metadata = computeBuildMetadata(root);
  const version = readText("js/app-version.js");
  const declared = version.match(/APP_BUILD_ID\s*=\s*"([a-f0-9]{12})"/)?.[1];
  if (declared !== metadata.buildId) {
    throw new Error(
      `js/app-version.js is stale (${declared || "missing"} != ${metadata.buildId}). Run npm run pwa:version.`
    );
  }
  return metadata;
}

function buildStandalone() {
  const jsResult = esbuild.buildSync({
    entryPoints: [join(root, "js/main.js")],
    bundle: true,
    format: "iife",
    minify: false,
    write: false
  });

  let bundleJs = jsResult.outputFiles[0].text;

  const css = readText("assets/styles.css");
  const appVersion = readText("js/app-version.js");
  let out = readText("index.html").replace(
    /<link\s+rel="stylesheet"\s+href="assets\/styles\.css"\s*\/?>/,
    () => `<style>\n${css}\n</style>`
  );

  out = out
    .replace(/\s*<link\s+rel="icon"[^>]*\/?>/g, "")
    .replace(/\s*<link\s+rel="apple-touch-icon"[^>]*\/?>/g, "")
    .replace(/\s*<link\s+rel="manifest"[^>]*\/?>/g, "")
    .replace(/<script\s+src="js\/app-version\.js"><\/script>/, () => `<script>\n${appVersion}\n</script>`)
    .replace(
      /<script\s+type="module"\s+src="js\/main\.js"><\/script>/,
      () => `<script>\n${bundleJs}\n</script>`
    );

  for (const reference of [
    'href="assets/styles.css"',
    'src="js/app-version.js"',
    'src="js/main.js"',
    'href="manifest.webmanifest"',
    'href="assets/icon-192.png"',
    'href="assets/icon-512.png"'
  ]) {
    if (out.includes(reference)) {
      throw new Error(`Standalone build still contains external reference: ${reference}`);
    }
  }

  const target = join(root, "dist", "boussole-4d-standalone.html");
  writeFileSync(target, out);
  return { target, bytes: Buffer.byteLength(out), sha256: sha256(out) };
}

function releaseDigest(files) {
  return sha256(files.map((file) => `${file.path}\0${file.sha256}\0`).join(""));
}

function buildProductionSite(metadata) {
  const targetRoot = join(root, "dist", "site");
  rmSync(targetRoot, { recursive: true, force: true });
  mkdirSync(targetRoot, { recursive: true });

  const assets = listPublicAssets(root);
  for (const path of assets) {
    const destination = join(targetRoot, path);
    mkdirSync(dirname(destination), { recursive: true });
    copyFileSync(join(root, path), destination);
  }
  const files = assets.map((path) => fileMetadata(targetRoot, path));
  const release = {
    schemaVersion: 1,
    buildId: metadata.buildId,
    entrypoint: "index.html",
    fileCount: files.length,
    contentSha256: releaseDigest(files),
    files
  };
  writeFileSync(join(targetRoot, "release.json"), `${JSON.stringify(release, null, 2)}\n`);
  const bytes = files.reduce((total, file) => total + file.bytes, 0);
  const pdfBytes = files
    .filter((file) => file.path.startsWith("subjects/"))
    .reduce((total, file) => total + file.bytes, 0);
  return { targetRoot, release, bytes, pdfBytes };
}

mkdirSync(join(root, "dist"), { recursive: true });
const metadata = verifiedBuildMetadata();
const standalone = buildStandalone();
const production = buildProductionSite(metadata);
const mb = (bytes) => `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
console.log(
  `✅ production: ${production.targetRoot} (${production.release.fileCount} files, ` +
    `${mb(production.bytes)} dont ${mb(production.pdfBytes)} de PDF sous subjects/, ` +
    `build ${metadata.buildId})`
);
console.log(
  `✅ standalone: ${standalone.target} (${Math.round(standalone.bytes / 1024)} KB, sha256 ${standalone.sha256.slice(0, 12)})`
);
