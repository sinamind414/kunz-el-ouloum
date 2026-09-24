// F3 — versionnage par OCTETS, pas par query string.
// `__SW_BUILD_HASH__` est remplacé à la construction (plugin vite closeBundle)
// par un hash shell+assets : le navigateur compare les octets → réinstall →
// activate → cleanupOldCaches. Avant F3, `?v=Date.now()` ne changeait pas les
// octets de sw.js → jamais de réinstallation, VERSION figé à la 1ʳᵉ visite.
const VERSION = '__SW_BUILD_HASH__';
const CACHE_PREFIX = 'kunz-offline-web';
const SHELL_CACHE = `${CACHE_PREFIX}-shell-${VERSION}`;
const RUNTIME_CACHE = `${CACHE_PREFIX}-runtime-${VERSION}`;

// F3 — RUNTIME borné (LRU approximation par ordre d'insertion de Cache.keys).
// Sans borne, chaque asset y entre à vie et peut faire purger l'origin
// (localStorage de l'élève inclus) sous pression de quota mobile.
const RUNTIME_MAX_ENTRIES = 80;

const CORE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/assets/images/mascot-192.png',
  '/assets/svt/d1_u1_l2_transcription_met.svg',
  '/assets/svt/d1_u1_l3_traduction_ribosome.svg',
];

function unique(urls) {
  return [...new Set(urls)];
}

async function collectBuildAssets() {
  try {
    const response = await fetch('/index.html', { cache: 'no-cache' });
    if (!response.ok) return [];
    const html = await response.text();
    return unique(
      Array.from(html.matchAll(/(?:src|href)=["']([^"']+)["']/g))
        .map((match) => match[1])
        .filter((url) => url.startsWith('/assets/') || url === '/manifest.json')
    );
  } catch {
    return [];
  }
}

async function collectSchemaAssets() {
  try {
    const response = await fetch('/assets/images/schemas/manifest.json', { cache: 'no-cache' });
    if (!response.ok) return [];
    const payload = await response.json();
    if (!payload || !Array.isArray(payload.assets)) return [];
    return payload.assets.filter((url) => typeof url === 'string' && url.startsWith('/assets/images/schemas/'));
  } catch {
    return [];
  }
}

async function precacheShell() {
  const cache = await caches.open(SHELL_CACHE);
  // ARCH-005/006 — précache SÉLECTIF : shell + assets du build (~1 MB).
  // P5/F4 : les leçons ne sont PLUS précachées en /lessons/* — elles sont
  // embarquées via les getters ?raw (srcdoc), une seule source content/lessons.
  // Les ~120 schémas (8 MB) sont précachés EN ARRIÈRE-PLAN après l'activation
  // (lazySchemaPrecache) : l'installation n'impose plus ~11 MB au premier
  // lancement sur une connexion 3G.
  const buildAssets = await collectBuildAssets();
  const urls = unique([...CORE_URLS, ...buildAssets]);

  await Promise.all(
    urls.map(async (url) => {
      try {
        await cache.add(new Request(url, { cache: 'reload' }));
      } catch {
        // Best effort: une ressource absente ne doit pas annuler toute l'installation.
      }
    })
  );
}

/**
 * ARCH-006 — précache différé des schémas (8 MB), hors chemin critique :
 * lancé après l'installation, par petites rafales, sans jamais bloquer
 * l'interaction. Chaque schéma consulté reste de toute façon mis en cache
 * par staleWhileRevalidate au fil de l'utilisation.
 */
async function lazySchemaPrecache() {
  const assets = await collectSchemaAssets();
  if (assets.length === 0) return;
  const cache = await caches.open(SHELL_CACHE);
  const BATCH = 8;
  for (let i = 0; i < assets.length; i += BATCH) {
    const batch = assets.slice(i, i + BATCH);
    await Promise.all(
      batch.map(async (url) => {
        try {
          const cached = await cache.match(url);
          if (!cached) await cache.add(new Request(url, { cache: 'reload' }));
        } catch {
          // best effort
        }
      })
    );
  }
}

async function cleanupOldCaches() {
  const keys = await caches.keys();
  await Promise.all(
    keys
      .filter((key) => key.startsWith(CACHE_PREFIX) && key !== SHELL_CACHE && key !== RUNTIME_CACHE)
      .map((key) => caches.delete(key))
  );
}

/**
 * F3 — borne RUNTIME à RUNTIME_MAX_ENTRIES entrées (les plus anciennes sortent).
 * SHELL reste non borné au même seuil : il porte le précache schémas (voulu).
 */
async function trimRuntimeCache() {
  try {
    const cache = await caches.open(RUNTIME_CACHE);
    const keys = await cache.keys();
    if (keys.length <= RUNTIME_MAX_ENTRIES) return;
    const excess = keys.length - RUNTIME_MAX_ENTRIES;
    // Cache.keys() : ordre d'insertion dans les navigateurs modernes → FIFO.
    for (let i = 0; i < excess; i++) {
      await cache.delete(keys[i]);
    }
  } catch {
    // best effort — ne jamais casser la réponse réseau à cause du trim
  }
}

function isCacheableResponse(response) {
  return Boolean(response && response.ok && (response.type === 'basic' || response.type === 'default'));
}

async function putRuntime(request, response) {
  const cache = await caches.open(RUNTIME_CACHE);
  await cache.put(request, response);
  await trimRuntimeCache();
}

async function networkFirstNavigation(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  try {
    const response = await fetch(request);
    if (isCacheableResponse(response)) {
      await putRuntime(request, response.clone());
      const shellCache = await caches.open(SHELL_CACHE);
      await shellCache.put('/index.html', response.clone());
    }
    return response;
  } catch {
    return (await cache.match(request))
      || (await caches.match('/index.html'))
      || (await caches.match('/'))
      || Response.error();
  }
}

async function staleWhileRevalidate(request) {
  const cached = await caches.match(request);
  const updatePromise = fetch(request)
    .then(async (response) => {
      if (isCacheableResponse(response)) {
        await putRuntime(request, response.clone());
      }
      return response;
    })
    .catch(() => null);

  if (cached) {
    return cached;
  }

  const fresh = await updatePromise;
  return fresh || Response.error();
}

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    await precacheShell();
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    await cleanupOldCaches();
    await self.clients.claim();
    // ARCH-006 — précache différé des schémas : uniquement si le réseau le
    // permet (pas en mode économie de données ni sur 2G/slow-2G), sinon les
    // schémas sont mis en cache au fil de l'utilisation (staleWhileRevalidate).
    try {
      const conn = navigator.connection;
      const fastEnough = !conn || (conn.effectiveType === '4g' || (conn.effectiveType === '3g' && !conn.saveData));
      if (fastEnough) await lazySchemaPrecache();
    } catch {
      // best effort
    }
  })());
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    void self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api/')) return;

  if (request.mode === 'navigate') {
    event.respondWith(networkFirstNavigation(request));
    return;
  }

  event.respondWith(staleWhileRevalidate(request));
});
