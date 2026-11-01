import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, statSync } from "node:fs";
import {
  createStaticServer,
  isPublicRoute,
  resolveByteRange,
  resolveFrameAncestors,
  securityHeaders
} from "../server.mjs";

let server;
let origin;

before(async () => {
  server = createStaticServer();
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  origin = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
});

test("aucune logique ni donnée d'année n'est servie 24 h sans revalidation", async () => {
  /* Contre-exemple mesuré : `max-age=86400` sur `data/years/**` laissait le
     navigateur rejouer l'ancienne charge utile d'une année déjà modifiée. Le
     catalogue, frais, la validait contre une structure périmée : l'année
     refusait de s'ouvrir jusqu'à 24 h, rechargement compris. Seules les
     icônes — dont l'URL porte l'empreinte du contenu — et les PDF restent
     cacheables. */
  const cases = [
    ["data/years/m/year-2013.js", /no-cache/],
    ["data/subjects.js", /no-cache/],
    ["js/main.js", /no-cache/],
    ["sw.js", /no-cache/],
    ["assets/styles.css", /no-cache/],
    ["subjects/M/2013/sujet-1.pdf", /must-revalidate/],
    ["assets/icon-192.png", /max-age=86400/]
  ];
  for (const [path, pattern] of cases) {
    const response = await globalThis.fetch(`${origin}/${path}`);
    assert.equal(response.status, 200, `${path} doit être servie`);
    assert.match(
      response.headers.get("cache-control") || "",
      pattern,
      `${path} → ${response.headers.get("cache-control")}`
    );
  }
});

test("la liste blanche ne reconnaît que les routes de déploiement", () => {
  for (const route of [
    "index.html",
    "manifest.webmanifest",
    "release.json",
    "sw.js",
    "assets/styles.css",
    "js/main.js",
    "data/subjects.js",
    "legal/privacy.html"
  ]) {
    assert.equal(isPublicRoute(route), true, `${route} devrait être publique`);
  }
  for (const route of [
    ".git/HEAD",
    ".git/config",
    "package.json",
    "server.mjs",
    "build.mjs",
    "tests/ui.test.mjs",
    "docs/REMEDIATION_PLAN.md",
    "docs/history/patches/README.md",
    "docs/history/_v1_backup/index.html",
    "assets/../package.json"
  ]) {
    assert.equal(isPublicRoute(route), false, `${route} ne doit jamais être publique`);
  }
});

test("le serveur livre le shell avec CSP et refuse les fichiers privés", async () => {
  const home = await globalThis.fetch(`${origin}/`);
  assert.equal(home.status, 200);
  assert.match(home.headers.get("content-type"), /^text\/html/);
  assert.equal(home.headers.get("content-security-policy"), securityHeaders["Content-Security-Policy"]);
  assert.match(home.headers.get("content-security-policy"), /script-src 'self'/);
  assert.match(home.headers.get("content-security-policy"), /style-src 'self'/);
  assert.doesNotMatch(home.headers.get("content-security-policy"), /(?:script|style)-src[^;]*unsafe-inline/);

  for (const path of [
    "/.git/HEAD",
    "/.git/config",
    "/package.json",
    "/server.mjs",
    "/tests/ui.test.mjs",
    "/docs/REMEDIATION_PLAN.md",
    "/docs/history/patches/README.md",
    "/docs/history/_v1_backup/index.html"
  ]) {
    const response = await globalThis.fetch(origin + path);
    assert.equal(response.status, 404, `${path} a été exposé`);
  }
});

test("les PDF tiers ne sont plus servis par le dépôt", async () => {
  const response = await globalThis.fetch(`${origin}/BAC2025_SVT_Sujet1.pdf`, { method: "HEAD" });
  assert.equal(response.status, 404);
});

test("les méthodes d'écriture sont refusées", async () => {
  const response = await globalThis.fetch(`${origin}/index.html`, { method: "POST", body: "x" });
  assert.equal(response.status, 405);
  assert.equal(response.headers.get("allow"), "GET, HEAD");
});

/* ===========================================================
   Range — RFC 9110 §14.2 : « A-B », « A- » et le suffixe « -N ».
   Avant le fix, « bytes=-N » renvoyait les N PREMIERS octets : un lecteur
   PDF qui va chercher le trailer et la table xref en fin de fichier
   recevait l'en-tête et échouait à ouvrir le sujet.
   =========================================================== */
const RANGE_PDF = "subjects/SE/2025/sujet-1.pdf";

test("resolveByteRange : « bytes=A-B » borne la plage au fichier", () => {
  assert.deepEqual(resolveByteRange("bytes=0-99", 1000), { start: 0, end: 99 });
  assert.deepEqual(resolveByteRange("bytes=500-4999", 1000), { start: 500, end: 999 });
  assert.deepEqual(resolveByteRange("bytes=999-1000", 1000), { start: 999, end: 999 });
});

test("resolveByteRange : « bytes=A- » va jusqu'à la fin", () => {
  assert.deepEqual(resolveByteRange("bytes=900-", 1000), { start: 900, end: 999 });
  assert.deepEqual(resolveByteRange("bytes=0-", 1000), { start: 0, end: 999 });
});

test("resolveByteRange : « bytes=-N » renvoie les N DERNIERS octets", () => {
  assert.deepEqual(resolveByteRange("bytes=-500", 1000), { start: 500, end: 999 });
  assert.deepEqual(resolveByteRange("bytes=-1", 1000), { start: 999, end: 999 });
  // N plus grand que le fichier : tout le fichier, jamais de débordement.
  assert.deepEqual(resolveByteRange("bytes=-5000", 1000), { start: 0, end: 999 });
});

test("resolveByteRange : une plage impossible renvoie null (→ 416)", () => {
  assert.equal(resolveByteRange("bytes=1000-", 1000), null);
  assert.equal(resolveByteRange("bytes=5000-6000", 1000), null);
  assert.equal(resolveByteRange("bytes=-0", 1000), null);
  assert.equal(resolveByteRange("bytes=9-2", 1000), null);
  assert.equal(resolveByteRange("bytes=0-10", 0), null);
});

test("resolveByteRange : un en-tête inexploitable renvoie undefined (→ 200 complet)", () => {
  assert.equal(resolveByteRange("bytes=0-9,20-29", 1000), undefined);
  assert.equal(resolveByteRange("items=0-9", 1000), undefined);
  assert.equal(resolveByteRange("", 1000), undefined);
  assert.equal(resolveByteRange(undefined, 1000), undefined);
});

test("HTTP : un Range suffixe livre réellement la fin du PDF", async () => {
  const size = statSync(RANGE_PDF).size;
  const response = await globalThis.fetch(`${origin}/${RANGE_PDF}`, {
    headers: { Range: "bytes=-500" }
  });
  assert.equal(response.status, 206);
  assert.equal(response.headers.get("content-range"), `bytes ${size - 500}-${size - 1}/${size}`);
  assert.equal(response.headers.get("accept-ranges"), "bytes");
  const body = new Uint8Array(await response.arrayBuffer());
  assert.equal(body.length, 500);
  assert.deepEqual(body, new Uint8Array(readFileSync(RANGE_PDF)).slice(size - 500));
});

test("HTTP : un Range « A-B » livre exactement les octets demandés", async () => {
  const response = await globalThis.fetch(`${origin}/${RANGE_PDF}`, {
    headers: { Range: "bytes=0-99" }
  });
  assert.equal(response.status, 206);
  assert.equal(response.headers.get("content-range"), `bytes 0-99/${statSync(RANGE_PDF).size}`);
  const body = new Uint8Array(await response.arrayBuffer());
  assert.deepEqual(body, new Uint8Array(readFileSync(RANGE_PDF)).slice(0, 100));
});

test("HTTP : un Range hors fichier répond 416 avec « bytes */size »", async () => {
  const size = statSync(RANGE_PDF).size;
  const response = await globalThis.fetch(`${origin}/${RANGE_PDF}`, {
    headers: { Range: `bytes=${size + 10}-` }
  });
  assert.equal(response.status, 416);
  assert.equal(response.headers.get("content-range"), `bytes */${size}`);
});

test("CSP : frame-ancestors n'embarque aucun hôte de prévisualisation par défaut", () => {
  const csp = securityHeaders["Content-Security-Policy"];
  assert.match(csp, /frame-ancestors 'self'(?:;|$)/);
  assert.doesNotMatch(csp, /e2b\.app/, "un hôte de sandbox ne doit pas être figé dans la CSP");
});

test("resolveFrameAncestors : 'self' par défaut, y compris sur valeur vide", () => {
  assert.equal(resolveFrameAncestors(undefined), "'self'");
  assert.equal(resolveFrameAncestors("   "), "'self'");
  assert.equal(resolveFrameAncestors("'self'"), "'self'");
});

test("resolveFrameAncestors : accepte une origine https explicite", () => {
  assert.equal(resolveFrameAncestors("'self' https://hote.exemple"), "'self' https://hote.exemple");
  assert.equal(resolveFrameAncestors("'self' https://*.e2b.app"), "'self' https://*.e2b.app");
});

test("resolveFrameAncestors : refuse toute valeur qui élargirait la surface", () => {
  for (const value of [
    "*",
    "https://*",
    "http://insecure.test",
    "'unsafe-inline'",
    "https://",
    "example.com"
  ]) {
    assert.throws(
      () => resolveFrameAncestors(value),
      /CSP_FRAME_ANCESTORS invalide/,
      `${value} doit être refusé`
    );
  }
});
