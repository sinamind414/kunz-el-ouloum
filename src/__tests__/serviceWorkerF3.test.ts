// serviceWorkerF3.test.ts — verrous F3 (audit ARCHITECTURE §F3) :
//   · VERSION dans les octets (placeholder build), pas via ?v=Date.now()
//   · register('/sw.js') sans query string
//   · RUNTIME_CACHE borné (RUNTIME_MAX_ENTRIES + trimRuntimeCache)
//   · cleanupOldCaches présent (active) pour purger les vieux préfixes
import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (rel: string) => fs.readFileSync(path.join(root, rel), 'utf-8');

describe('F3 — service worker : octets versionnés + cache runtime borné', () => {
  it('public/sw.js porte le placeholder __SW_BUILD_HASH__ (hash injecté au build)', () => {
    const sw = read('public/sw.js');
    expect(sw).toContain("const VERSION = '__SW_BUILD_HASH__';");
    expect(sw).not.toMatch(/searchParams\.get\(['"]v['"]\)/);
  });

  it('main.tsx enregistre /sw.js sans Date.now() ni query string', () => {
    const main = read('src/main.tsx');
    // assertion sur le call réel, pas sur les commentaires F3 du fichier
    expect(main).toMatch(/\.register\(\s*['"]\/sw\.js['"]\s*\)/);
    expect(main).not.toMatch(/register\([^)]*Date\.now/);
    expect(main).not.toMatch(/sw\.js\?v=/);
    expect(main).not.toMatch(/register\([^)]*\?v=/);
  });

  it('RUNTIME_MAX_ENTRIES entre 50 et 100 (borné, pas infini)', () => {
    const sw = read('public/sw.js');
    const m = sw.match(/RUNTIME_MAX_ENTRIES\s*=\s*(\d+)/);
    expect(m, 'RUNTIME_MAX_ENTRIES manquant').toBeTruthy();
    const n = Number(m![1]);
    expect(n).toBeGreaterThanOrEqual(50);
    expect(n).toBeLessThanOrEqual(100);
  });

  it('trimRuntimeCache appliqué à chaque putRuntime (FIFO borné)', () => {
    const sw = read('public/sw.js');
    expect(sw).toContain('async function trimRuntimeCache');
    expect(sw).toContain('await trimRuntimeCache()');
    expect(sw).toContain('async function putRuntime');
    // les deux chemins de cache passent par putRuntime
    expect(sw.match(/await putRuntime\(/g)?.length ?? 0).toBeGreaterThanOrEqual(2);
    // plus de cache.put direct sur RUNTIME hors putRuntime/trim
    const directPuts = sw.match(/await cache\.put\(/g) ?? [];
    expect(directPuts.length).toBeGreaterThanOrEqual(1); // shell index.html autorisé
    expect(sw).toContain("await putRuntime(request, response.clone());");
  });

  it('cleanupOldCaches purge les préfixes obsolètes à activate (VERSION octets)', () => {
    const sw = read('public/sw.js');
    expect(sw).toContain('async function cleanupOldCaches');
    expect(sw).toMatch(/addEventListener\(\s*['"]activate['"]/);
    expect(sw).toContain('await cleanupOldCaches()');
    expect(sw).toContain('await self.skipWaiting()');
  });

  it('vite.config injecte le hash dans dist/sw.js (closeBundle)', () => {
    const cfg = read('vite.config.ts');
    expect(cfg).toContain('swBuildHashPlugin');
    expect(cfg).toContain('__SW_BUILD_HASH__');
    expect(cfg).toContain('closeBundle');
  });
});

// Après un build local : dist/sw.js ne doit plus contenir le placeholder.
const DIST_SW = path.join(root, 'dist', 'sw.js');
const HAS_DIST_SW = fs.existsSync(DIST_SW);

describe.skipIf(!HAS_DIST_SW)('F3 — dist/sw.js après build', () => {
  it('placeholder remplacé par un hash hex 16', () => {
    const sw = read('dist/sw.js');
    expect(sw).not.toContain('__SW_BUILD_HASH__');
    const m = sw.match(/const VERSION = '([0-9a-f]+)';/);
    expect(m, 'VERSION hash absente de dist/sw.js').toBeTruthy();
    expect(m![1].length).toBeGreaterThanOrEqual(16);
    expect(sw).not.toMatch(/searchParams\.get\(['"]v['"]\)/);
    expect(sw).toContain('RUNTIME_MAX_ENTRIES');
    expect(sw).toContain('trimRuntimeCache');
  });
});
