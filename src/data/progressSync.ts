// ============================================================
// progressSync.ts — F6 « protocole de progression syncable »
// · UN store versionné `progress_v1` horodaté (sous-clés indépendantes)
// · push complet vers le sync existant (POST /api/student/sync, champ `state`)
// · pull + last-write-wins par sous-clé → restauration appareil neuf
// Hors périmètre moteur : on ne lit/écrit que des clés localStorage
// d'affichage (svt_* / okacha) — aucune logique de notation.
// ============================================================
import { fetchProgressState, getApiToken, pushProgressState } from '../utils/api';

export const PROGRESS_V1_KEY = 'progress_v1';
export const PROGRESS_VERSION = 1 as const;

/** Sous-clés F6 (contrat serveur : ProgressStateIn.key). */
export type ProgressKey = 'units' | 'progress' | 'flashcards' | 'okacha';

export const PROGRESS_LIVE_KEYS: Record<ProgressKey, string> = {
  units: 'svt_units',
  progress: 'svt_progress',
  flashcards: 'svt_flashcards',
  okacha: 'kunz_okacha_progress_v1',
};

export interface ProgressSubState {
  updatedAt: number;
  value: unknown;
}

export interface ProgressV1 {
  version: typeof PROGRESS_VERSION;
  updatedAt: number;
  subkeys: Partial<Record<ProgressKey, ProgressSubState>>;
}

/** Format d'échange serveur (table progress_state). */
export interface ProgressStateWire {
  key: ProgressKey;
  updatedAt: number;
  value: unknown;
}

/** Accepte le JSON serveur (key peut venir en string élargie). */
export type ProgressStateWireIn = {
  key: string;
  updatedAt: number;
  value: unknown;
};

const isProgressKey = (k: string): k is ProgressKey =>
  k === 'units' || k === 'progress' || k === 'flashcards' || k === 'okacha';

export function emptyProgress(): ProgressV1 {
  return { version: PROGRESS_VERSION, updatedAt: 0, subkeys: {} };
}

export function readProgressV1(): ProgressV1 {
  try {
    const raw = localStorage.getItem(PROGRESS_V1_KEY);
    if (!raw) return emptyProgress();
    const j = JSON.parse(raw) as Partial<ProgressV1>;
    if (!j || typeof j !== 'object' || !j.subkeys || typeof j.subkeys !== 'object') {
      return emptyProgress();
    }
    const subkeys: ProgressV1['subkeys'] = {};
    for (const [k, s] of Object.entries(j.subkeys as Record<string, unknown>)) {
      if (!isProgressKey(k) || !s || typeof s !== 'object') continue;
      const sub = s as ProgressSubState;
      if (typeof sub.updatedAt !== 'number' || !Number.isFinite(sub.updatedAt)) continue;
      subkeys[k as ProgressKey] = { updatedAt: sub.updatedAt, value: sub.value };
    }
    return {
      version: PROGRESS_VERSION,
      updatedAt: typeof j.updatedAt === 'number' ? j.updatedAt : 0,
      subkeys,
    };
  } catch {
    return emptyProgress();
  }
}

export function writeProgressV1(p: ProgressV1): void {
  try {
    localStorage.setItem(PROGRESS_V1_KEY, JSON.stringify(p));
  } catch {
    // quota / stockage indisponible — le prochain save retente
  }
}

/** Lit les clés live et les horodate dans progress_v1 (appelé à chaque save App). */
export function refreshProgressFromLive(now = Date.now()): ProgressV1 {
  const cur = readProgressV1();
  for (const key of Object.keys(PROGRESS_LIVE_KEYS) as ProgressKey[]) {
    const raw = localStorage.getItem(PROGRESS_LIVE_KEYS[key]);
    if (raw == null) continue;
    try {
      const parsed: unknown = JSON.parse(raw);
      cur.subkeys[key] = { updatedAt: now, value: parsed };
    } catch {
      // valeur live corrompue : on ne l'envoie pas au serveur
    }
  }
  cur.updatedAt = now;
  writeProgressV1(cur);
  return cur;
}

/**
 * Merge last-write-wins par sous-clé.
 * · updatedAt strictement plus grand → gagnant ;
 * * égalité → la valeur distante (remote) l'emporte (déterministe multi-appareils).
 */
export function mergeProgressLWW(
  local: ProgressV1,
  remote: ProgressV1 | ProgressStateWireIn[],
): ProgressV1 {
  const remoteP: ProgressV1 = Array.isArray(remote)
    ? fromWire(remote)
    : { version: PROGRESS_VERSION, updatedAt: remote.updatedAt || 0, subkeys: { ...remote.subkeys } };
  const out: ProgressV1 = { version: PROGRESS_VERSION, updatedAt: 0, subkeys: {} };
  const keys = new Set([
    ...(Object.keys(local.subkeys) as ProgressKey[]),
    ...(Object.keys(remoteP.subkeys) as ProgressKey[]),
  ]);
  for (const k of keys) {
    const a = local.subkeys[k];
    const b = remoteP.subkeys[k];
    if (a && b) {
      out.subkeys[k] = b.updatedAt >= a.updatedAt ? b : a;
    } else if (a) {
      out.subkeys[k] = a;
    } else if (b) {
      out.subkeys[k] = b;
    }
  }
  out.updatedAt = Math.max(local.updatedAt || 0, remoteP.updatedAt || 0);
  return out;
}

/** Écrit dans le localStorage « live » uniquement si la valeur diffère. */
export function applyProgressToLive(p: ProgressV1): ProgressKey[] {
  const applied: ProgressKey[] = [];
  for (const key of Object.keys(PROGRESS_LIVE_KEYS) as ProgressKey[]) {
    const sub = p.subkeys[key];
    if (!sub) continue;
    let next: string;
    try {
      next = JSON.stringify(sub.value ?? null);
    } catch {
      continue;
    }
    const liveKey = PROGRESS_LIVE_KEYS[key];
    const current = localStorage.getItem(liveKey);
    if (current === next) continue;
    try {
      localStorage.setItem(liveKey, next);
      applied.push(key);
    } catch {
      // quota — la sous-clé reste locale à son état antérieur
    }
  }
  return applied;
}

export function toWire(p: ProgressV1): ProgressStateWire[] {
  const out: ProgressStateWire[] = [];
  for (const key of Object.keys(p.subkeys) as ProgressKey[]) {
    const s = p.subkeys[key];
    if (!s) continue;
    out.push({ key, updatedAt: s.updatedAt, value: s.value });
  }
  return out;
}

export function fromWire(arr: ProgressStateWireIn[] | ProgressStateWire[]): ProgressV1 {
  const out = emptyProgress();
  for (const item of arr || []) {
    if (!item || !isProgressKey(String(item.key))) continue;
    if (typeof item.updatedAt !== 'number' || !Number.isFinite(item.updatedAt)) continue;
    out.subkeys[item.key] = { updatedAt: item.updatedAt, value: item.value };
    out.updatedAt = Math.max(out.updatedAt, item.updatedAt);
  }
  return out;
}

/**
 * Push best-effort (fire-and-forget) : no-op hors compte élève.
 * Appelé à chaque save pour que le serveur suive l'état live.
 */
export function pushProgressSnapshot(): void {
  if (!getApiToken()) return;
  const wire = toWire(readProgressV1());
  if (wire.length === 0) return;
  void pushProgressState(wire as unknown as Array<Record<string, unknown>>).catch(() => {
    // offline / 5xx : progress_v1 reste local, retenté au prochain save
  });
}

/**
 * Pull → LWW → applique au live → renvoie les sous-clés écrites.
 * Appareil neuf : local vide → remote gagne → restoration complète.
 * Offline : renvoie [] sans lever (offline-first).
 */
export async function restoreProgressFromServer(): Promise<ProgressKey[]> {
  if (!getApiToken()) return [];
  let remoteWire: ProgressStateWireIn[];
  try {
    const res = await fetchProgressState();
    remoteWire = (res.state || []) as ProgressStateWireIn[];
  } catch {
    return [];
  }
  const local = readProgressV1();
  const merged = mergeProgressLWW(local, remoteWire);
  writeProgressV1(merged);
  const applied = applyProgressToLive(merged);
  // Re-pousse le gagnant (local plus récent ou remote appliqué) — idempotent LWW.
  const wire = toWire(merged);
  if (wire.length > 0) {
    void pushProgressState(wire as unknown as Array<Record<string, unknown>>).catch(() => {});
  }
  return applied;
}
