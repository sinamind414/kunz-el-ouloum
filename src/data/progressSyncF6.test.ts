// ============================================================
// F6 — protocole de progression syncable (verrous)
// · progress_v1 : store versionné, LWW par sous-clé
// · push complet via /api/student/sync (champ state)
// · restauration appareil neuf (pull → merge → apply live)
// · contrat serveur : SyncBody accepte state-only, refuse vide
// · moteur intact : on ne touche pas aux services de notation
// ============================================================
import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import {
  PROGRESS_V1_KEY,
  PROGRESS_LIVE_KEYS,
  PROGRESS_VERSION,
  emptyProgress,
  readProgressV1,
  writeProgressV1,
  refreshProgressFromLive,
  mergeProgressLWW,
  applyProgressToLive,
  toWire,
  fromWire,
  pushProgressSnapshot,
  restoreProgressFromServer,
} from './progressSync';
import { SyncBody, parseBody, ProgressStateIn } from '../../server/schemas';

const root = process.cwd();
const read = (rel: string) => fs.readFileSync(path.join(root, rel), 'utf-8');

describe('F6 — progress_v1 store versionné (LWW)', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('refreshProgressFromLive horodate les clés live dans progress_v1', () => {
    localStorage.setItem('svt_units', JSON.stringify([{ id: 1 }]));
    localStorage.setItem('svt_progress', JSON.stringify({ xp: 120, streak: 3 }));
    const now = 1_760_000_000_000;
    const p = refreshProgressFromLive(now);
    expect(p.version).toBe(PROGRESS_VERSION);
    expect(p.subkeys.units?.updatedAt).toBe(now);
    expect(p.subkeys.progress?.updatedAt).toBe(now);
    expect((p.subkeys.progress?.value as { xp: number }).xp).toBe(120);
    const raw = JSON.parse(localStorage.getItem(PROGRESS_V1_KEY)!);
    expect(raw.version).toBe(1);
    expect(raw.subkeys.units.updatedAt).toBe(now);
  });

  it('mergeProgressLWW : la sous-clé la plus récente gagne (indépendamment)', () => {
    const local = {
      ...emptyProgress(),
      subkeys: {
        units: { updatedAt: 100, value: ['local-units'] },
        progress: { updatedAt: 300, value: { xp: 999 } },
      },
    };
    const remote = [
      { key: 'units' as const, updatedAt: 200, value: ['remote-units'] },
      { key: 'progress' as const, updatedAt: 150, value: { xp: 1 } },
    ];
    const m = mergeProgressLWW(local, remote);
    expect(m.subkeys.units?.value).toEqual(['remote-units']); // remote plus récent
    expect(m.subkeys.progress?.value).toEqual({ xp: 999 }); // local plus récent
  });

  it('mergeProgressLWW : égalité d’updatedAt → remote (déterministe)', () => {
    const local = { ...emptyProgress(), subkeys: { units: { updatedAt: 50, value: 'L' } } };
    const remote = [{ key: 'units' as const, updatedAt: 50, value: 'R' }];
    const m = mergeProgressLWW(local, remote);
    expect(m.subkeys.units?.value).toBe('R');
  });

  it('applyProgressToLive n’écrit que les clés qui diffèrent', () => {
    localStorage.setItem('svt_units', JSON.stringify(['a']));
    const p = {
      ...emptyProgress(),
      subkeys: {
        units: { updatedAt: 10, value: ['a'] }, // identique → non appliqué
        progress: { updatedAt: 10, value: { xp: 42 } }, // différent → appliqué
      },
    };
    const applied = applyProgressToLive(p);
    expect(applied).toEqual(['progress']);
    expect(JSON.parse(localStorage.getItem('svt_progress')!)).toEqual({ xp: 42 });
  });

  it('toWire/fromWire roundtrip conserve les sous-clés', () => {
    const p = {
      ...emptyProgress(),
      updatedAt: 7,
      subkeys: { okacha: { updatedAt: 7, value: { page: 3 } } },
    };
    const wire = toWire(p);
    expect(wire).toHaveLength(1);
    const back = fromWire(wire);
    expect(back.subkeys.okacha?.value).toEqual({ page: 3 });
  });

  it('write/read progress_v1 ignore un JSON corrompu', () => {
    localStorage.setItem(PROGRESS_V1_KEY, '{pas du json');
    const p = readProgressV1();
    expect(p.subkeys).toEqual({});
    writeProgressV1(p);
    expect(readProgressV1().version).toBe(1);
  });
});

describe('F6 — restauration appareil neuf', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('sans token : restore ne sort rien (offline / invité)', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const applied = await restoreProgressFromServer();
    expect(applied).toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('appareil neuf : remote remplit les clés live (pull → LWW → apply)', async () => {
    localStorage.setItem('boussole_token', 'tok');
    // local vide (nouvel appareil)
    const remoteBody = {
      state: [
        { key: 'units', updatedAt: 1000, value: [{ id: 7, unlocked: true }] },
        { key: 'progress', updatedAt: 1000, value: { xp: 500, streak: 12 } },
        { key: 'okacha', updatedAt: 900, value: { page: 5 } },
      ],
    };
    const fetchMock = vi.fn(async () =>
      new Response(JSON.stringify(remoteBody), { status: 200 }),
    );
    vi.stubGlobal('fetch', fetchMock);

    const applied = await restoreProgressFromServer();
    expect(applied.sort()).toEqual(['okacha', 'progress', 'units']);
    expect(JSON.parse(localStorage.getItem('svt_progress')!)).toEqual({ xp: 500, streak: 12 });
    expect(JSON.parse(localStorage.getItem('svt_units')!)).toEqual([{ id: 7, unlocked: true }]);
    expect(JSON.parse(localStorage.getItem('kunz_okacha_progress_v1')!)).toEqual({ page: 5 });
    // progress_v1 persisté
    const p = readProgressV1();
    expect(p.subkeys.progress?.updatedAt).toBe(1000);
    // le merge est re-poussé (idempotent)
    const pushCalls = fetchMock.mock.calls.filter(
      (c) => String((c as unknown[])[0]).includes('/api/student/sync'),
    );
    const pullCalls = fetchMock.mock.calls.filter(
      (c) => String((c as unknown[])[0]).includes('/api/student/progress'),
    );
    expect(pullCalls.length).toBe(1);
    expect(pushCalls.length).toBeGreaterThanOrEqual(1);
    const firstPush = pushCalls[0] as unknown as [string, RequestInit];
    const pushBody = JSON.parse(String(firstPush[1].body));
    expect(Array.isArray(pushBody.state)).toBe(true);
    expect(pushBody.entries).toEqual([]);
    expect(pushBody.events).toEqual([]);
  });

  it('local plus récent gagne et est re-poussé (pas de downgrade)', async () => {
    localStorage.setItem('boussole_token', 'tok');
    localStorage.setItem('svt_progress', JSON.stringify({ xp: 900, streak: 20 }));
    refreshProgressFromLive(5_000); // local updatedAt = 5000
    const fetchMock = vi.fn(async (url: string) => {
      if (String(url).includes('/api/student/progress')) {
        return new Response(
          JSON.stringify({ state: [{ key: 'progress', updatedAt: 100, value: { xp: 1 } }] }),
          { status: 200 },
        );
      }
      return new Response(JSON.stringify({ ok: true, progressAccepted: 0 }), { status: 200 });
    });
    vi.stubGlobal('fetch', fetchMock);

    const applied = await restoreProgressFromServer();
    expect(applied).toEqual([]); // live déjà à jour (local gagnant)
    expect(JSON.parse(localStorage.getItem('svt_progress')!)).toEqual({ xp: 900, streak: 20 });
    // re-push du gagnant local
    const push = fetchMock.mock.calls.find((c) => String(c[0]).includes('/api/student/sync'));
    expect(push).toBeTruthy();
    const pushInit = (push as unknown as [string, RequestInit])[1];
    const body = JSON.parse(String(pushInit.body));
    expect(body.state[0].value).toEqual({ xp: 900, streak: 20 });
  });

  it('pushProgressSnapshot : no-op invité, payload state-only connecté', () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    localStorage.setItem('svt_units', JSON.stringify([1]));
    refreshProgressFromLive(1);
    pushProgressSnapshot();
    expect(fetchMock).not.toHaveBeenCalled();

    localStorage.setItem('boussole_token', 'tok');
    fetchMock.mockImplementation(async () => new Response(JSON.stringify({ ok: true }), { status: 200 }));
    pushProgressSnapshot();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const body = JSON.parse(String(fetchMock.mock.calls[0][1].body));
    expect(body.entries).toEqual([]);
    expect(body.events).toEqual([]);
    expect(body.state[0].key).toBe('units');
    expect(body.state[0].updatedAt).toBeGreaterThan(0);
  });

  it('réseau KO pendant restore : [] sans throw (offline-first)', async () => {
    localStorage.setItem('boussole_token', 'tok');
    vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('network down'); }));
    await expect(restoreProgressFromServer()).resolves.toEqual([]);
  });
});

describe('F6 — contrat serveur SyncBody (state)', () => {
  it('state-only est accepté (push progression sans entries/events)', () => {
    const ok = parseBody(SyncBody, {
      entries: [],
      events: [],
      state: [{ key: 'units', updatedAt: 1, value: [] }],
    });
    expect(ok).not.toBeNull();
    expect(ok!.state).toHaveLength(1);
    expect(ok!.state[0].key).toBe('units');
  });

  it('lot totalement vide reste rejeté (contrat historique)', () => {
    expect(parseBody(SyncBody, { entries: [], events: [] })).toBeNull();
    expect(parseBody(SyncBody, {})).toBeNull();
    expect(parseBody(SyncBody, { entries: [], events: [], state: [] })).toBeNull();
  });

  it('clé de progression hors enum F6 rejetée', () => {
    expect(
      parseBody(SyncBody, {
        entries: [],
        events: [],
        state: [{ key: 'mystery', updatedAt: 1, value: {} }],
      }),
    ).toBeNull();
    expect(parseBody(ProgressStateIn, { key: 'units', updatedAt: 1, value: null })).not.toBeNull();
  });

  it('état trop volumineux rejeté (budget 500k chars)', () => {
    const big = { key: 'units' as const, updatedAt: 1, value: { blob: 'x'.repeat(500_001) } };
    expect(parseBody(SyncBody, { entries: [], events: [], state: [big] })).toBeNull();
  });

  it('updatedAt non entier ou ≤0 rejeté', () => {
    expect(parseBody(ProgressStateIn, { key: 'units', updatedAt: 1.5, value: 1 })).toBeNull();
    expect(parseBody(ProgressStateIn, { key: 'units', updatedAt: 0, value: 1 })).toBeNull();
  });
});

describe('F6 — câblage statique (routes + App + moteur hors périmètre)', () => {
  it('server expose GET /api/student/progress et merge LWW dans sync', () => {
    const src = read('server.ts');
    expect(src).toContain('/api/student/progress');
    expect(src).toContain('mergeProgressState');
    expect(src).toContain('progressAccepted');
  });

  it('store SQLite et PG implémentent mergeProgressState + getProgressState', () => {
    const lite = read('server/store.ts');
    expect(lite).toContain('CREATE TABLE IF NOT EXISTS progress_state');
    expect(lite).toContain('mergeProgressState');
    expect(lite).toContain('excluded.updated_at > progress_state.updated_at');
    const pg = read('server/store.pg.ts');
    expect(pg).toContain('CREATE TABLE IF NOT EXISTS progress_state');
    expect(pg).toContain('mergeProgressState');
    expect(pg).toContain('getProgressState');
  });

  it('App.tsx wire save + restore sans toucher au moteur', () => {
    const app = read('src/App.tsx');
    expect(app).toContain('refreshProgressFromLive');
    expect(app).toContain('pushProgressSnapshot');
    expect(app).toContain('restoreProgressFromServer');
    // les clés live F6 restent la source d'hydratation React
    expect(PROGRESS_LIVE_KEYS.units).toBe('svt_units');
    expect(PROGRESS_LIVE_KEYS.progress).toBe('svt_progress');
    expect(PROGRESS_LIVE_KEYS.flashcards).toBe('svt_flashcards');
    expect(PROGRESS_LIVE_KEYS.okacha).toBe('kunz_okacha_progress_v1');
  });

  it('services moteur non modifiés par F6 (hors périmètre)', () => {
    const app = read('src/App.tsx');
    // F6 n'importe que progressSync — aucun nouveau lien vers le moteur
    expect(app).not.toMatch(/documentPracticeContexts|practiceContextMapping|evaluer-copies/);
    // progressSync n'importe que api (aucun service de notation)
    const sync = read('src/data/progressSync.ts');
    expect(sync).not.toMatch(/documentEvidenceService|sessionEffectsService|masteryEvidence/);
  });
});
