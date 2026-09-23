// WIRE-SYNC (pilote PROTOCOLE_PREUVE) — la chaîne complète :
// production écrite → carnet local → file serveur → flush /api/student/sync.
// Sans token : rien ne quitte l'appareil. Avec token : payload conforme au
// contrat serveur (entries sans studentId, lot ≤ 100, idempotent par id).
import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { logProduction, clearProductionLog, getProductionLogs } from '../methodologyLog';
import { flushActivityQueue, logActivityLocally } from '../activityLog';

const QUEUE_KEY = 'boussole_activity_queue';
const LOG_KEY = 'kunz_methodology_production_log_v1';

const mkProd = (over: Partial<Parameters<typeof logProduction>[0]> = {}) =>
  logProduction({
    verbId: 'verb_analyse_v1',
    verbAr: 'حلّل',
    theme: 'neuro',
    stage: 3,
    text: 'كلما زادت شدة الضوء ازداد معدل التركيب الضوئي',
    icm: 85,
    criteriaSummary: [{ label: 'c1', passed: true }],
    errorTags: ['missing_unit'],
    ...over,
  });

describe('WIRE-SYNC — production vers file serveur', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('logProduction archive AUSSI dans la file de sync (kind entry)', () => {
    mkProd();
    const raw = JSON.parse(localStorage.getItem(QUEUE_KEY)!);
    expect(raw.length).toBe(1);
    expect(raw[0].kind).toBe('entry');
    expect(raw[0].payload.verbId).toBe('verb_analyse_v1');
    expect(raw[0].payload.icm).toBe(85);
    expect(raw[0].payload.errorTags).toEqual(['missing_unit']);
    // Le carnet local reste la source locale (les DEUX vivent)
    expect(getProductionLogs().length).toBe(1);
  });

  it('la file contient entries ET events côte à côte', () => {
    mkProd();
    logActivityLocally({ studentId: 'local', type: 'quiz', payload: { percent: 100 } });
    const raw = JSON.parse(localStorage.getItem(QUEUE_KEY)!);
    expect(raw.length).toBe(2);
    expect(raw.map((i: any) => i.kind).sort()).toEqual(['entry', 'event']);
  });

  it('migration file v1 (array plate d’activités) → kind event', () => {
    localStorage.setItem(QUEUE_KEY, JSON.stringify([
      { id: 'act_1', studentId: 'local', type: 'quiz', payload: { percent: 70 }, createdAt: '2026-09-01T00:00:00Z' },
    ]));
    logActivityLocally({ studentId: 'local', type: 'mission', payload: { percent: 50 } });
    const raw = JSON.parse(localStorage.getItem(QUEUE_KEY)!);
    expect(raw.length).toBe(2);
    expect(raw.every((i: any) => i.kind === 'event')).toBe(true);
  });

  it('sans token : flush ne sort RIEN (offline/invité)', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    mkProd();
    await flushActivityQueue();
    expect(fetchMock).not.toHaveBeenCalled();
    // la file attend, rien n'est perdu
    expect(JSON.parse(localStorage.getItem(QUEUE_KEY)!).length).toBe(1);
  });

  it('avec token : flush envoie entries+events au contrat /api/student/sync', async () => {
    localStorage.setItem('boussole_token', 'tok');
    const calls: Array<Record<string, unknown>> = [];
    const fetchMock = vi.fn(async (_url: string, init: RequestInit) => {
      calls.push({ url: _url, body: JSON.parse(String(init.body)) });
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    });
    vi.stubGlobal('fetch', fetchMock);

    mkProd({ icm: 60, errorTags: [] });
    logActivityLocally({ studentId: 'local', type: 'quiz', payload: { percent: 80 } });
    await flushActivityQueue();

    // lot unique : entry + event partis ensemble
    const bodies = calls.map(c => c.body as { entries: any[]; events: any[] });
    const allEntries = bodies.flatMap(b => b.entries);
    const allEvents = bodies.flatMap(b => b.events);
    expect(allEntries.length).toBe(1);
    expect(allEvents.length).toBe(1);
    // Contrat serveur : l'entry n'a PAS de studentId (assigné serveur)
    expect(allEntries[0].studentId).toBeUndefined();
    expect(allEntries[0].verbId).toBe('verb_analyse_v1');
    expect(typeof allEntries[0].id).toBe('string');
    // succès → file vidée
    expect(JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]')).toEqual([]);
  });

  it('flush découpe par lots de 100 (limite serveur)', async () => {
    localStorage.setItem('boussole_token', 'tok');
    let n = 0;
    const fetchMock = vi.fn(async () => {
      n++;
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    });
    vi.stubGlobal('fetch', fetchMock);
    for (let i = 0; i < 150; i++) {
      logActivityLocally({ studentId: 'local', type: 'drill', payload: { percent: i } });
    }
    await flushActivityQueue();
    expect(n).toBe(2); // 100 + 50
    expect(JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]')).toEqual([]);
  });

  it('échec réseau : la file est conservée intégralement (retry)', async () => {
    localStorage.setItem('boussole_token', 'tok');
    const fetchMock = vi.fn(async () => new Response('{}', { status: 500 }));
    vi.stubGlobal('fetch', fetchMock);
    mkProd();
    await flushActivityQueue();
    const raw = JSON.parse(localStorage.getItem(QUEUE_KEY)!);
    expect(raw.length).toBe(1);
    expect(raw[0].kind).toBe('entry');
  });

  it('413 (lot trop gros) : découpe le lot et vide la file — anti-deadlock', async () => {
    localStorage.setItem('boussole_token', 'tok');
    const sizes: number[] = [];
    const fetchMock = vi.fn(async (_url: string, init: RequestInit) => {
      const body = JSON.parse(String(init.body)) as { entries: unknown[]; events: unknown[] };
      const total = body.entries.length + body.events.length;
      sizes.push(total);
      if (total > 25) return new Response('{}', { status: 413 });
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    });
    vi.stubGlobal('fetch', fetchMock);
    for (let i = 0; i < 40; i++) {
      logActivityLocally({ studentId: 'local', type: 'drill', payload: { percent: i } });
    }
    await flushActivityQueue();
    // 1er essai (40 > 25) → 413 → lot coupé à 20 → succès → lot suivant 20 → succès.
    expect(sizes[0]).toBe(40);
    expect(sizes[1]).toBe(20);
    expect(JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]')).toEqual([]);
  });

  it('413 résiduel sur UN seul item : abandon propre, pas de boucle infinie', async () => {
    localStorage.setItem('boussole_token', 'tok');
    const fetchMock = vi.fn(async () => new Response('{}', { status: 413 }));
    vi.stubGlobal('fetch', fetchMock);
    mkProd();
    await flushActivityQueue();
    expect(fetchMock).toHaveBeenCalledTimes(1); // une seule tentative, file intacte
    expect(JSON.parse(localStorage.getItem(QUEUE_KEY)!).length).toBe(1);
  });

  it('rotation carnet : jamais plus de 300 productions locales', () => {
    for (let i = 0; i < 305; i++) {
      mkProd({ text: `p${i}` });
    }
    const logs = getProductionLogs();
    expect(logs.length).toBeLessThanOrEqual(300);
    clearProductionLog();
  });
});
