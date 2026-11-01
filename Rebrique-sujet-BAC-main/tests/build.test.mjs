import { createHash } from "node:crypto";
import { before, test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { verifyRelease } from "../scripts/verify-release.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const standalonePath = join(root, "dist", "boussole-4d-standalone.html");
const sitePath = join(root, "dist", "site");
const digest = (path) => createHash("sha256").update(readFileSync(path)).digest("hex");

function build() {
  // The checked-in carrier must already match the sources; silently regenerating it
  // here would hide stale build identities and mutate a shared file during `npm test`.
  execFileSync(process.execPath, [join(root, "build.mjs")], { cwd: root, stdio: "pipe" });
}

before(build);

test("le monofichier embarque le shell sans redistribuer de PDF tiers", () => {
  const output = readFileSync(standalonePath, "utf8");
  /* Budget de poids, pas critère de contenu : ce monofichier est l'unique
     livrable hors-ligne des élèves, il embarque donc toutes les données
     certifiées et grossit à chaque année relue (+16 Ko pour SE 2019, Phases 3
     du plan 2013-2020). 3 Mo était une approximation de « pas de PDF tiers »
     qui devenait fausse par accumulation légitime ; le vrai invariant est
     désormais testé directement (aucun octet de PDF, brut ou base64). Le
     budget passe à 4 Mo, soit ~1 Mo de marge alors que le plus petit PDF du
     dépôt pèse 1,07 Mo : embarquer ne serait-ce qu'un seul sujet resterait
     détecté. */
  assert.ok(
    Buffer.byteLength(output) < 4 * 1024 * 1024,
    "poids du monofichier hors budget (voir le commentaire de ce test)"
  );
  assert.doesNotMatch(output, /%PDF-/, "aucun PDF tiers ne doit être embarqué");
  assert.doesNotMatch(output, /JVBERi0/, "aucun PDF base64 ne doit être embarqué");
  assert.match(output, /<style>/);
  assert.match(output, /location\?\.protocol !== "file:"/);
  assert.match(output, /APP_BUILD_ID/);
  assert.doesNotMatch(output, /href="assets\/styles\.css"/);
  assert.doesNotMatch(output, /src="js\/(?:app-version|main)\.js"/);
  assert.doesNotMatch(output, /href="manifest\.webmanifest"/);
  assert.doesNotMatch(output, /pdf: "BAC2025_SVT_Sujet[12]\.pdf"/);
});

test("dist/site est un artefact vérifiable qui n'expose aucun fichier de développement", () => {
  const release = verifyRelease(sitePath);
  assert.ok(release.fileCount > 60);
  for (const path of [
    "index.html",
    "release.json",
    "sw.js",
    "manifest.webmanifest",
    "data/years/se/year-2025.js",
    "data/years/m/year-2026.js"
  ]) {
    assert.ok(existsSync(join(sitePath, path)), `${path} absent de la release`);
  }
  for (const path of ["package.json", "server.mjs", "tests", "docs", ".git"]) {
    assert.equal(existsSync(join(sitePath, path)), false, `${path} ne doit pas être publié`);
  }
});

test("deux builds consécutifs produisent exactement les mêmes octets", () => {
  const firstRelease = readFileSync(join(sitePath, "release.json"), "utf8");
  const firstStandalone = digest(standalonePath);
  build();
  assert.equal(readFileSync(join(sitePath, "release.json"), "utf8"), firstRelease);
  assert.equal(digest(standalonePath), firstStandalone);
  assert.doesNotMatch(firstRelease, /generatedAt|timestamp|createdAt/);
});
