const VERSION = new URL(self.location.href).searchParams.get('v') || 'dev';
const CACHE_PREFIX = 'kunz-offline-web';
const SHELL_CACHE = `${CACHE_PREFIX}-shell-${VERSION}`;
const RUNTIME_CACHE = `${CACHE_PREFIX}-runtime-${VERSION}`;

const CORE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/assets/images/mascot.png',
  '/assets/images/schemas/manifest.json',
  '/assets/svt/d1_u1_l2_transcription_met.svg',
  '/assets/svt/d1_u1_l3_traduction_ribosome.svg',
  '/lessons/lecon_transcription.html',
  '/lessons/phase1_chapitres_1_2.html',
  '/lessons/phase2_chapitres_3_4.html',
  '/lessons/phase3_chapitres_5_6.html',
  '/lessons/phase4_chapitres_7_8.html',
  '/lessons/phase5_chapitres_9_10.html',
  '/lessons/phase6_chapitres_11_12.html',
  '/lessons/phase7_chapitres_13_14.html',
  '/lessons/phase8_chapitres_15_16.html',
  '/lessons/phase9_chapitres_17_18.html',
  '/lessons/phase10_chapitres_19_20.html',
  '/lessons/phase11_chapitres_21_22.html',
  '/lessons/phase12_chapitres_23_24.html',
  '/lessons/phase13_chapitres_25_26.html',
  '/lessons/phase14_chapitres_27_28.html',
  '/lessons/phase15_chapitres_29_30.html',
  '/lessons/phase16_chapitres_31_32.html',
  '/lessons/phase17_chapitres_33_34.html',
  '/lessons/phase18_chapitres_35_36.html',
  '/lessons/phase19_chapitres_37_38.html',
  '/lessons/phase20_chapitres_39_40.html',
  '/lessons/phase21_chapitres_41_42.html',
  '/lessons/phase22_chapitres_43_44.html',
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
  const [buildAssets, schemaAssets] = await Promise.all([collectBuildAssets(), collectSchemaAssets()]);
  const urls = unique([...CORE_URLS, ...buildAssets, ...schemaAssets]);

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

async function cleanupOldCaches() {
  const keys = await caches.keys();
  await Promise.all(
    keys
      .filter((key) => key.startsWith(CACHE_PREFIX) && key !== SHELL_CACHE && key !== RUNTIME_CACHE)
      .map((key) => caches.delete(key))
  );
}

function isCacheableResponse(response) {
  return Boolean(response && response.ok && (response.type === 'basic' || response.type === 'default'));
}

async function networkFirstNavigation(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  try {
    const response = await fetch(request);
    if (isCacheableResponse(response)) {
      await cache.put(request, response.clone());
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
        const cache = await caches.open(RUNTIME_CACHE);
        await cache.put(request, response.clone());
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
