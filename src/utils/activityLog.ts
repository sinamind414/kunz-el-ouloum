// ============================================================
// File de synchronisation serveur (offline-first, localStorage)
// Deux genres de payloads partagent la MÊME file :
//   · entries  = productions méthodologiques (carnet بوصلة)
//   · events   = activités (quiz / mission / drill / production)
// Le flush envoie les deux à /api/student/sync (contrat unique).
// Sans compte élève (pas de token) : la file reste en attente,
// rien ne se perd, rien ne quitte l'appareil.
// ============================================================
import type { ProductionLogEntry } from './methodologyLog';

export type ActivityKind = 'quiz' | 'mission' | 'drill' | 'production';

export interface ActivityPayload {
  title?: string;
  score?: number;
  total?: number;
  percent?: number;
  unitId?: number | string;
  domain?: string;
  durationSec?: number;
}

export interface ActivityEntry {
  id: string;
  studentId: string;
  type: ActivityKind;
  payload: ActivityPayload;
  createdAt: string;
}

/** Production au format du contrat serveur (sans studentId — assigné côté serveur). */
export interface SyncEntry {
  id: string;
  verbId: string;
  verbAr: string;
  theme?: string;
  stage: number;
  text: string;
  icm: number;
  criteriaSummary: { label: string; passed: boolean }[];
  errorTags: string[];
  durationSec?: number;
  createdAt: string;
}

interface QueuedItem {
  kind: 'entry' | 'event';
  payload: SyncEntry | ActivityEntry;
}

const QUEUE_KEY = 'boussole_activity_queue';
const BATCH_LIMIT = 100; // miroir de la limite serveur (store.addEntriesIfNew slice(0,100))

/** File v1 héritée : un array PLAT d'ActivityEntry (sans wrapper kind). */
function isLegacyActivity(i: unknown): i is ActivityEntry {
  if (!i || typeof i !== 'object') return false;
  const o = i as Record<string, unknown>;
  return typeof o.id === 'string' && typeof o.type === 'string' && o.kind === undefined;
}

/** Normalise : items v2 (kind/payload) tels quels, items v1 enveloppés en event. */
function migrateLegacy(raw: unknown[]): QueuedItem[] {
  return raw.map(i => {
    if (i && typeof i === 'object' && 'kind' in i && 'payload' in i) {
      const w = i as unknown as QueuedItem;
      if (w.kind === 'entry' || w.kind === 'event') return w;
    }
    if (isLegacyActivity(i)) return { kind: 'event', payload: i };
    return { kind: 'event', payload: i as ActivityEntry };
  });
}

function readQueue(): QueuedItem[] {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    return raw ? migrateLegacy(JSON.parse(raw)) : [];
  } catch {
    return [];
  }
}

function writeQueue(q: QueuedItem[]): void {
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(q));
  } catch {
    // ignore storage errors
  }
}

function enqueue(item: QueuedItem): void {
  const q = readQueue();
  q.push(item);
  writeQueue(q);
}

export function queueActivity(activity: ActivityEntry) {
  enqueue({ kind: 'event', payload: activity });
}

/** Le carnet appelle ça à CHAQUE production — la copie part en file serveur. */
export function queueSyncEntry(entry: SyncEntry) {
  enqueue({ kind: 'entry', payload: entry });
}

const itemKey = (i: QueuedItem): string => {
  const p = i.payload as { id?: string };
  return `${i.kind}:${p?.id ?? ''}`;
};

// Single-flight : un seul flush à la fois — les appels concurrents
// (ex. production + quiz dans la même seconde) partagent le même lot.
let flushPromise: Promise<void> | null = null;

export function flushActivityQueue(): Promise<void> {
  if (flushPromise) return flushPromise;
  flushPromise = doFlush().finally(() => { flushPromise = null; });
  return flushPromise;
}

async function doFlush(): Promise<void> {
  const token = localStorage.getItem('boussole_token');
  if (!token) return; // mode invité : rien ne quitte l'appareil
  for (;;) {
    const queue = readQueue();
    if (queue.length === 0) return;
    const batch = queue.slice(0, BATCH_LIMIT);
    const entries = batch.filter(i => i.kind === 'entry').map(i => i.payload);
    const events = batch.filter(i => i.kind === 'event').map(i => i.payload);
    let ok = false;
    try {
      const res = await fetch('/api/student/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ entries, events }),
      });
      ok = res.ok;
    } catch {
      ok = false;
    }
    if (!ok) return; // offline / erreur serveur → file conservée, retry au prochain flush
    // Retrait PAR ID (et non par position) : des items ajoutés PENDANT le fetch
    // doivent survivre — ils partiront au lot suivant.
    const sent = new Set(batch.map(itemKey));
    writeQueue(readQueue().filter(i => !sent.has(itemKey(i))));
  }
}

export function logActivityLocally(activity: Omit<ActivityEntry, 'id' | 'createdAt'>) {
  enqueue({
    kind: 'event',
    payload: {
      ...activity,
      id: `act_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      createdAt: new Date().toISOString(),
    },
  });
}

/** Convertit une entrée du carnet (localStorage) au format contrat serveur. */
export function logEntryFromCarnet(log: Omit<ProductionLogEntry, 'id' | 'dateISO'>, id: string, createdAt: string): void {
  enqueue({
    kind: 'entry',
    payload: {
      id,
      verbId: log.verbId,
      verbAr: log.verbAr,
      theme: log.theme,
      stage: log.stage,
      text: log.text,
      icm: log.icm,
      criteriaSummary: log.criteriaSummary || [],
      errorTags: log.errorTags || [],
      durationSec: log.durationSec,
      createdAt,
    },
  });
}
