/* ============================================================
   Service worker — shell minimal + cache runtime borné
   ------------------------------------------------------------
   - le shell applicatif est le seul contenu précaché ;
   - les payloads d'années et PDF sont récupérés à la demande ;
   - seules les réponses locales HTTP 200 réussies entrent au runtime ;
   - le runtime évince les insertions les plus anciennes au-delà de la borne.
   ============================================================ */

importScripts("./js/app-version.js");

const CACHE_PREFIX = "miftah-kanz";
const BUILD_ID = self.APP_BUILD_ID || "dev";
const SHELL_CACHE = `${CACHE_PREFIX}-shell-${BUILD_ID}`;
const RUNTIME_CACHE = `${CACHE_PREFIX}-runtime-${BUILD_ID}`;
const CURRENT_CACHES = new Set([SHELL_CACHE, RUNTIME_CACHE]);
// Charge utile d'une année + PDF du sujet : compter large, mais rester sous
// la borne de 32 validée par P3.4 (≈ 24 Mo au pire, jamais le dépôt entier).
const RUNTIME_MAX_ENTRIES = 20;

// Shell = document, apparence, manifeste et graphe d'imports STATIQUES de
// js/main.js. Les data/years/** et les PDF sont volontairement absents.
// Le moteur d'évaluation (engine.js + domain/evaluation/**) n'en fait plus
// partie : aucune note n'est affichée à l'élève, l'application ne le charge
// donc plus au démarrage (un test verrouille cette cohérence).
const SHELL_ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./assets/styles.css",
  "./assets/icon-192.png",
  "./assets/icon-512.png",
  "./js/app-version.js",
  "./js/main.js",
  "./js/ui.js",
  "./js/store.js",
  "./js/application/debounce.js",
  "./js/application/timers.js",
  "./js/application/subject-session.js",
  "./js/application/year-load-error.js",
  "./js/domain/subjects/official-coverage.js",
  "./js/services/sound-engine.js",
  "./js/services/speech-recognition.js",
  "./js/services/diagnostics.js",
  "./js/ui/dialogs.js",
  "./js/ui/coverage-messages.js",
  "./js/ui/dom.js",
  "./js/ui/navigation.js",
  "./js/ui/operational-status.js",
  "./js/ui/screens/hub.js",
  "./js/ui/screens/guide.js",
  "./js/ui/screens/strategy.js",
  "./js/ui/screens/workspace.js",
  "./js/ui/screens/simulation.js",
  "./js/ui/pdf-viewer.js",
  "./js/ui/pdf-renderer.js",
  "./js/ui/accessibility.js",
  "./data/subjects.js",
  "./data/archive.js",
  "./data/bac-mode-policy.js",
  "./data/calibration-status.js",
  "./data/official-tasks.js",
  "./legal/privacy.html",
  "./legal/legal-notice.html"
];

/* `cache: "reload"` : quand le cache runtime ou le cache shell est vide, la
   requête doit contourner le cache HTTP du navigateur. Sans cela, une année
   servie naguère avec `max-age` restait valable des heures alors que son
   fichier avait changé depuis : le catalogue, lui, était à jour, la validation
   croisée échouait et l'année refusait de s'ouvrir — sans qu'aucun
   rechargement n'y change rien. Cette directive rend le correctif indépendant
   du serveur qui héberge l'application. */
const NETWORK_FRESH = Object.freeze({ cache: "reload" });

function isLocalRequest(request) {
  try {
    return new URL(request.url).origin === self.location.origin;
  } catch {
    return false;
  }
}

/* Le cache runtime est le seul cache borné du service worker : tout ce qui y
   entre est évictable. Les PDF de sujet y sont donc délibérément inclus —
   sinon ils tombaient dans le cache shell, qui n'a aucune borne, et 42 Mo de
   sujets pouvaient s'y accumuler sans jamais être libérés. */
function isRuntimeAsset(request) {
  const pathname = new URL(request.url).pathname;
  return (
    // `(?:-[a-z]+)?` et non `(?:-[a-z]{1,3})?` : la session exceptionnelle
    // s'appelle `year-2017-exceptional.js` (11 lettres). Avec l'ancienne borne
    // elle échappait au cache runtime — donc à son éviction et à son cycle de
    // vie par version — et atterrissait dans le cache shell, qui n'a aucune borne.
    /\/data\/years\/(?:se|m)\/year-\d{4}(?:-[a-z]+)?\.js$/.test(pathname) ||
    // (?:\/exceptional)? : les PDF de session exceptionnelle vivent dans un
    // sous-dossier. Sans ce segment ils échappaient au cache runtime borné et
    // retombaient dans le cache shell, qui n'a aucune borne.
    /\/subjects\/(?:SE|M|TM)\/(?:\d{4}|\d{4}-[a-z]{1,3})(?:\/exceptional)?\/sujet-\d+\.pdf$/.test(pathname)
  );
}

function isCacheableResponse(response) {
  return response?.ok === true && response.status === 200 && ["basic", "default"].includes(response.type);
}

async function notifyClients(type, detail = {}) {
  try {
    const clients = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const client of clients) client.postMessage({ source: "miftah-sw", type, ...detail });
  } catch {
    // Observability is best-effort and must never break a resource response.
  }
}

async function trimRuntimeCache(cache) {
  const keys = await cache.keys();
  const overflow = keys.length - RUNTIME_MAX_ENTRIES;
  if (overflow > 0) await Promise.all(keys.slice(0, overflow).map((request) => cache.delete(request)));
}

async function cacheRuntimeResponse(request, response) {
  if (!isLocalRequest(request) || !isRuntimeAsset(request) || !isCacheableResponse(response)) return false;
  const cache = await caches.open(RUNTIME_CACHE);
  // Delete + put refreshes insertion order and makes eviction deterministic.
  await cache.delete(request);
  await cache.put(request, response.clone());
  await trimRuntimeCache(cache);
  await notifyClients("runtime-cache-updated", {
    resource: new URL(request.url).pathname.endsWith(".pdf") ? "subject-pdf" : "year-data"
  });
  return true;
}

async function fetchNavigation(request) {
  let response;
  try {
    response = await fetch(request, NETWORK_FRESH);
  } catch {
    await notifyClients("offline-fallback", { resource: "navigation" });
    return (await caches.match("./index.html")) || Response.error();
  }
  if (isCacheableResponse(response)) {
    try {
      const shell = await caches.open(SHELL_CACHE);
      await shell.put("./index.html", response.clone());
    } catch {
      // A quota/cache failure must not replace a successful network navigation.
    }
  }
  return response;
}

async function fetchRuntime(request) {
  // Revision queries on manifest icons reuse the matching build cache offline.
  const cached = await caches.match(request, { ignoreSearch: true });
  if (cached) return cached;
  let response;
  try {
    response = await fetch(request, NETWORK_FRESH);
  } catch {
    await notifyClients("offline-miss", {
      resource: new URL(request.url).pathname.endsWith(".pdf") ? "subject-pdf" : "year-data"
    });
    return Response.error();
  }
  try {
    await cacheRuntimeResponse(request, response);
  } catch {
    // Cache writes are opportunistic; never turn HTTP 200 into a student-visible failure.
  }
  return response;
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(SHELL_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith(`${CACHE_PREFIX}-`) && !CURRENT_CACHES.has(key))
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

async function fetchShellOrAsset(request) {
  const cached = await caches.match(request, { ignoreSearch: true });
  if (cached) return cached;
  let response;
  try {
    response = await fetch(request, NETWORK_FRESH);
  } catch {
    return Response.error();
  }
  if (isCacheableResponse(response)) {
    try {
      const cache = await caches.open(SHELL_CACHE);
      await cache.put(request, response.clone());
    } catch {
      // Cache failures are opportunistic.
    }
  }
  return response;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET" || !isLocalRequest(request)) return;
  if (request.mode === "navigate") {
    event.respondWith(fetchNavigation(request));
    return;
  }
  if (request.headers.has("range")) {
    // Let the network serve 206 Partial Content responses natively. Returning
    // undefined here leaves Chromium/Safari PDF viewers unable to resume or
    // seek; feeding fetch(request) through keeps the SW transparent for range
    // requests without breaking the cache-first strategy for the shell.
    event.respondWith(fetch(request));
    return;
  }
  if (isRuntimeAsset(request)) {
    event.respondWith(fetchRuntime(request));
    return;
  }
  event.respondWith(fetchShellOrAsset(request));
});
