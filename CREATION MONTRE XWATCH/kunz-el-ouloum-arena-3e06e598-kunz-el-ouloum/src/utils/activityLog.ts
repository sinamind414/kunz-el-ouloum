// ============================================================
// File de synchronisation serveur (offline-first, localStorage)
// Deux genres de payloads partagent la MÊME file :
//   · entries  = productions méthodologiques (carnet بوصلة)
//   · events   = activités (quiz / mission / drill / production)
// Le flush envoie les deux à /api/student/sync (contrat unique).
// Sans compte élève (pas de token) : la file reste en attente,
// rien ne se perd, rien ne quitte l'appareil.
//
// ── ATTRIBUTION (correctif du 14/10/2026) ────────────────────
// Chaque élément de la file porte l'IDENTITÉ qui l'a produit (`owner`).
// Le flush n'envoie QUE les éléments de l'identité connectée :
//   · un téléphone partagé entre frères et sœurs ne mélange plus les travaux ;
//   · le travail fait en invité n'est JAMAIS attribué d'office au compte qui
//     se connecte ensuite — l'élève doit le demander (importerActivitesInvite).
// Avant ce correctif, la file était globale à l'appareil et partait sous le
// jeton présent au moment du flush : le travail d'un invité atterrissait sous
// le nom de l'élève qui se connectait, dans le tableau de bord du professeur.
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
  /** Identité qui a produit l'activité (id élève), ou 'invite'. */
  owner?: string;
}

/** Identité des activités produites sans compte. */
export const IDENTITE_INVITE = 'invite';
/** Identité de repli quand un jeton existe mais n'est pas décodable. */
const IDENTITE_COMPTE = 'compte';

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

/**
 * Identité de l'appareil : l'id de l'élève connecté, lu dans le jeton.
 *
 * Décoder le jeton (base64url, sans vérifier la signature — le serveur la
 * vérifie de son côté) donne une identité STABLE : elle ne change pas à chaque
 * reconnexion, contrairement au jeton lui-même. Un jeton d'enseignant, lui,
 * n'a pas de `studentId` → « compte », donc il ne peut rien s'attribuer du
 * travail d'un élève.
 */
export function identiteCourante(): string {
  let token: string | null = null;
  try {
    token = localStorage.getItem('boussole_token');
  } catch {
    return IDENTITE_INVITE;
  }
  if (!token) return IDENTITE_INVITE;
  try {
    const payload = token.split('.')[1];
    if (!payload) return IDENTITE_COMPTE;
    const normalize = payload.replace(/-/g, '+').replace(/_/g, '/');
    const json = JSON.parse(atob(normalize)) as { studentId?: unknown };
    return typeof json.studentId === 'string' && json.studentId ? json.studentId : IDENTITE_COMPTE;
  } catch {
    return IDENTITE_COMPTE;
  }
}

function readQueue(): QueuedItem[] {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    // Les éléments écrits AVANT ce correctif n'ont pas d'`owner` : impossible de
    // prouver à qui ils appartiennent → ils sont traités comme « invité », donc
    // jamais attribués d'office (l'élève les rattache d'un clic s'ils sont siens).
    return raw ? migrateLegacy(JSON.parse(raw)).map(i => ({ ...i, owner: i.owner || IDENTITE_INVITE })) : [];
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
  // L'identité est figée ICI, au moment où l'élève travaille : c'est la seule
  // information qui permette plus tard de savoir à qui attribuer ce travail.
  q.push({ ...item, owner: identiteCourante() });
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
  const identite = identiteCourante();
  if (identite === IDENTITE_INVITE) return; // pas d'attribution sans compte
  let batchLimit = BATCH_LIMIT;
  for (;;) {
    // SEULEMENT mes activités : celles d'un autre compte ou d'un invité restent
    // en file — elles partiront sous leur propre identité, ou jamais.
    const queue = readQueue().filter(i => (i.owner || IDENTITE_INVITE) === identite);
    if (queue.length === 0) return;
    const batch = queue.slice(0, Math.min(batchLimit, queue.length));
    const entries = batch.filter(i => i.kind === 'entry').map(i => i.payload);
    const events = batch.filter(i => i.kind === 'event').map(i => i.payload);
    let status = 0;
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
      status = res.status;
      ok = res.ok;
      // A2 (14/10/2026) : le serveur REFUSE désormais ce qui est hors barème
      // (note hors 0-100, étape hors 1-4, texte démesuré) et corrige une date
      // future. Ces éléments sont retirés de la file — les renvoyer en boucle
      // ne les rendrait pas valides — mais l'élève doit SAVOIR que son travail
      // n'est pas arrivé chez le professeur : un succès muet lui ferait croire
      // le contraire.
      if (ok) {
        const data = (await res.json().catch(() => null)) as { refuses?: Record<string, number> } | null;
        if (data?.refuses && Object.keys(data.refuses).length > 0) enregistrerRefus(data.refuses);
      }
    } catch {
      ok = false;
    }
    // 413 = lot trop gros pour le serveur : on découpe et on réessaie.
    // (Sans ça, la file renvoyait toujours le MÊME lot → bloquée éternellement.)
    if (status === 413 && batch.length > 1) {
      batchLimit = Math.max(1, Math.floor(batch.length / 2));
      continue;
    }
    if (!ok) return; // offline / erreur / 413 résiduel → file conservée, retry au prochain flush
    // Retrait PAR ID (et non par position) : des items ajoutés PENDANT le fetch
    // doivent survivre — ils partiront au lot suivant.
    const sent = new Set(batch.map(itemKey));
    writeQueue(readQueue().filter(i => !sent.has(itemKey(i))));
    batchLimit = BATCH_LIMIT; // palier entier restauré après succès
  }
}

/**
 * Nombre d'activités en attente produites SANS compte (invité).
 * Affiché à l'élève pour lui demander s'il veut les rattacher à son compte.
 */
export function compterActivitesInvite(): number {
  return readQueue().filter(i => (i.owner || IDENTITE_INVITE) === IDENTITE_INVITE).length;
}

/**
 * Rattache à l'identité connectée le travail fait en invité, puis l'envoie.
 * N'est appelé que sur une action EXPLICITE de l'élève — jamais automatiquement,
 * sinon on retomberait sur l'attribution silencieuse corrigée le 14/10/2026.
 */
export async function importerActivitesInvite(): Promise<void> {
  const identite = identiteCourante();
  if (identite === IDENTITE_INVITE) return; // aucun compte : rien à rattacher
  const q = readQueue();
  if (!q.some(i => (i.owner || IDENTITE_INVITE) === IDENTITE_INVITE)) return;
  writeQueue(q.map(i => ((i.owner || IDENTITE_INVITE) === IDENTITE_INVITE ? { ...i, owner: identite } : i)));
  await flushActivityQueue();
}

/** Supprime le travail d'invité (l'élève répond « non, ce n'est pas à moi »). */
export function effacerActivitesInvite(): void {
  writeQueue(readQueue().filter(i => (i.owner || IDENTITE_INVITE) !== IDENTITE_INVITE));
}

const REFUS_KEY = 'boussole_sync_refus';

/** Total des éléments que le serveur a refusés, par raison. */
export type RefusSync = { total: number; raisons: Record<string, number>; dernier: string };

function enregistrerRefus(raisons: Record<string, number>): void {
  try {
    const precedent = lireRefus();
    const cumul: Record<string, number> = { ...precedent.raisons };
    let ajout = 0;
    for (const [raison, n] of Object.entries(raisons)) {
      cumul[raison] = (cumul[raison] ?? 0) + n;
      ajout += n;
    }
    const etat: RefusSync = {
      total: precedent.total + ajout,
      raisons: cumul,
      dernier: new Date().toISOString(),
    };
    localStorage.setItem(REFUS_KEY, JSON.stringify(etat));
  } catch {
    /* stockage indisponible : l'élève ne verra pas le bandeau, rien de plus */
  }
}

function lireRefus(): RefusSync {
  try {
    const brut = localStorage.getItem(REFUS_KEY);
    if (!brut) return { total: 0, raisons: {}, dernier: '' };
    const o = JSON.parse(brut) as Partial<RefusSync>;
    if (typeof o?.total !== 'number' || o.total < 0) return { total: 0, raisons: {}, dernier: '' };
    return { total: o.total, raisons: o.raisons ?? {}, dernier: o.dernier ?? '' };
  } catch {
    return { total: 0, raisons: {}, dernier: '' };
  }
}

/** Nombre d'éléments refusés par le serveur — 0 dans le cas normal. */
export function compterRefusSync(): number {
  return lireRefus().total;
}

/** Détail des raisons (affiché au professeur ou à l'élève selon le besoin). */
export function detaillerRefusSync(): RefusSync {
  return lireRefus();
}

/** L'élève a vu le message : on remet le compteur à zéro. */
export function effacerRefusSync(): void {
  try {
    localStorage.removeItem(REFUS_KEY);
  } catch {
    /* ignore */
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
