import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const source = `${readFileSync(join(root, "sw.js"), "utf8")}\nglobalThis.__swTest = { cacheRuntimeResponse, fetchNavigation, fetchRuntime, fetchShellOrAsset, isCacheableResponse, isRuntimeAsset, trimRuntimeCache, RUNTIME_MAX_ENTRIES, RUNTIME_CACHE, SHELL_CACHE };`;

class MemoryCache {
  constructor() {
    this.entries = new Map();
  }
  key(request) {
    return typeof request === "string" ? new URL(request, "https://app.test/").href : request.url;
  }
  async put(request, response) {
    this.entries.set(this.key(request), response);
  }
  async delete(request) {
    return this.entries.delete(this.key(request));
  }
  async keys() {
    return [...this.entries.keys()].map((url) => new globalThis.Request(url));
  }
  async match(request) {
    return this.entries.get(this.key(request));
  }
}

function harness(
  fetchImpl = async () => {
    throw new Error("network not configured");
  }
) {
  const stores = new Map();
  const caches = {
    async open(name) {
      if (!stores.has(name)) stores.set(name, new MemoryCache());
      return stores.get(name);
    },
    async keys() {
      return [...stores.keys()];
    },
    async delete(name) {
      return stores.delete(name);
    },
    async match(request) {
      for (const cache of stores.values()) {
        const hit = await cache.match(request);
        if (hit) return hit;
      }
      return undefined;
    }
  };
  const listeners = {};
  const self = {
    APP_BUILD_ID: "abcdef123456",
    location: { origin: "https://app.test" },
    clients: {
      async matchAll() {
        return [];
      },
      async claim() {}
    },
    skipWaiting: async () => {},
    addEventListener(type, listener) {
      listeners[type] = listener;
    }
  };
  const context = vm.createContext({
    caches,
    self,
    Request: globalThis.Request,
    Response,
    URL,
    fetch: fetchImpl,
    importScripts() {},
    console
  });
  vm.runInContext(source, context);
  return { api: context.__swTest, caches, listeners, stores };
}

test("la politique runtime refuse échec, redirection opaque et ressource hors périmètre", async () => {
  const { api, caches } = harness();
  const year = new globalThis.Request("https://app.test/data/years/se/year-2025.js");
  const external = new globalThis.Request("https://cdn.example/data/years/se/year-2025.js");

  assert.equal(api.isRuntimeAsset(year), true);
  assert.equal(api.isRuntimeAsset(external), true, "le filtre d'origine est appliqué avant cette fonction");
  assert.equal(api.isCacheableResponse(new Response("missing", { status: 404 })), false);
  assert.equal(api.isCacheableResponse(new Response("error", { status: 500 })), false);
  assert.equal(await api.cacheRuntimeResponse(year, new Response("missing", { status: 404 })), false);
  assert.equal(await api.cacheRuntimeResponse(external, new Response("ok")), false);
  const runtime = await caches.open(api.RUNTIME_CACHE);
  assert.equal((await runtime.keys()).length, 0);
});

test("une réponse locale 200 est stockée et l'éviction respecte strictement la borne", async () => {
  const { api, caches } = harness();
  const runtime = await caches.open(api.RUNTIME_CACHE);
  const first = new globalThis.Request("https://app.test/data/years/se/year-2000.js");
  for (let year = 2000; year < 2000 + api.RUNTIME_MAX_ENTRIES + 3; year += 1) {
    const request = new globalThis.Request(`https://app.test/data/years/se/year-${year}.js`);
    assert.equal(await api.cacheRuntimeResponse(request, new Response(`year-${year}`)), true);
  }
  const keys = await runtime.keys();
  assert.equal(keys.length, api.RUNTIME_MAX_ENTRIES);
  assert.equal(await runtime.match(first), undefined, "l'insertion la plus ancienne doit être évincée");
  assert.ok(await runtime.match(new globalThis.Request("https://app.test/data/years/se/year-2014.js")));
});

test("une réponse 500 ne remplace jamais une entrée saine déjà mise en cache", async () => {
  const { api, caches } = harness();
  const request = new globalThis.Request("https://app.test/data/years/se/year-2025.js");
  assert.equal(await api.cacheRuntimeResponse(request, new Response("year-ok")), true);
  assert.equal(await api.cacheRuntimeResponse(request, new Response("server-error", { status: 500 })), false);
  const cached = await (await caches.open(api.RUNTIME_CACHE)).match(request);
  assert.equal(await cached.text(), "year-ok");
});

test("un échec d’écriture du cache ne masque jamais une réponse réseau réussie", async () => {
  const networkBody = "fresh-network-response";
  const { api, caches } = harness(async () => new Response(networkBody));
  const runtime = await caches.open(api.RUNTIME_CACHE);
  runtime.put = async () => {
    throw new globalThis.DOMException("quota", "QuotaExceededError");
  };
  const request = new globalThis.Request("https://app.test/data/years/se/year-2025.js");
  const response = await api.fetchRuntime(request);
  assert.equal(response.status, 200);
  assert.equal(await response.text(), networkBody);

  const shell = await caches.open(api.SHELL_CACHE);
  shell.put = runtime.put;
  const navigation = await api.fetchNavigation(new globalThis.Request("https://app.test/index.html"));
  assert.equal(navigation.status, 200);
  assert.equal(await navigation.text(), networkBody);
});

test("les PDF de sujet sont évictables : runtime borné, jamais le cache shell sans borne", async () => {
  const { api, caches } = harness();
  const pdf = new globalThis.Request("https://app.test/subjects/SE/2025/sujet-1.pdf");
  const pdfMaths = new globalThis.Request("https://app.test/subjects/M/2021/sujet-2.pdf");
  const payload = new globalThis.Request("https://app.test/data/years/se/year-2025.js");
  assert.equal(api.isRuntimeAsset(pdf), true, "un PDF de sujet doit passer par le cache borné");
  assert.equal(api.isRuntimeAsset(pdfMaths), true);
  assert.equal(api.isRuntimeAsset(payload), true);
  /* `year-2017-exceptional.js` : 11 lettres après le tiret. Avec l'ancienne
     borne `(?:-[a-z]{1,3})?` il échappait au cache borné et atterrissait dans
     le cache shell — donc sans éviction, et sans le cycle de vie par version
     qui garantit qu'un payload périmé n'est plus jamais servi. */
  assert.equal(
    api.isRuntimeAsset(new globalThis.Request("https://app.test/data/years/m/year-2017-exceptional.js")),
    true,
    "le payload de la session exceptionnelle doit passer par le cache borné"
  );
  assert.equal(api.isRuntimeAsset(new globalThis.Request("https://app.test/assets/styles.css")), false);
  assert.equal(api.isRuntimeAsset(new globalThis.Request("https://app.test/index.html")), false);

  assert.equal(await api.cacheRuntimeResponse(pdf, new Response("pdf", { status: 200 })), true);
  const runtime = await caches.open(api.RUNTIME_CACHE);
  const shell = await caches.open(api.SHELL_CACHE);
  assert.ok(await runtime.match(pdf), "le PDF doit être dans le runtime");
  assert.equal(await shell.match(pdf), undefined, "le PDF ne doit pas gonfler le cache shell");
});

test("le cache HTTP du navigateur ne peut pas rejouer une année déjà remplacée", async () => {
  /* Le cache runtime est « cache d'abord » : tant qu'il répond, aucun réseau.
     Mais dès qu'il est vide — éviction, nouvelle version — la requête repart
     sur le réseau, et là le cache HTTP du navigateur pouvait resservir
     l'ancienne charge utile pendant des heures. `cache: "reload"` rend la
     fraîcheur indépendante des en-têtes du serveur qui héberge l'app. */
  const seen = [];
  const { api } = harness(async (request, init) => {
    seen.push({ url: request.url, init });
    return new Response("export default {};", { status: 200 });
  });
  const year = new globalThis.Request("https://app.test/data/years/m/year-2013.js");
  const shell = new globalThis.Request("https://app.test/js/main.js");

  await api.fetchRuntime(year);
  await api.fetchShellOrAsset(shell);
  await api.fetchNavigation(new globalThis.Request("https://app.test/index.html"));

  assert.equal(seen.length, 3, "les trois chemins réseau sont passés par fetch()");
  for (const call of seen) {
    // Comparaison par valeur : l'objet vient du contexte `vm`, son prototype
    // n'est pas celui de ce fichier — un deepEqual échouerait pour rien.
    assert.equal(call.init?.cache, "reload", `${call.url} doit contourner le cache HTTP du navigateur`);
  }
});
