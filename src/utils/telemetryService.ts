// telemetryService.ts
// Module 2 — Télémétrie "Offline-First" (buffer localStorage + flush Supabase).
// Les events sont empilés localement, puis envoyés dès le retour réseau.
// Jamais bloquant : si l'insert échoue, la file reste intacte pour plus tard.

import { supabase } from '../lib/supabase';

export interface TelemetryEvent {
  eventName:
    | 'APP_OPENED'
    | 'METHOD_FAIL'
    | 'METHOD_SUCCESS'
    | 'PRO_TEASER_CLICKED'
    | 'GUEST_LOGIN_OFFLINE'
    | 'QUIZ_COMPLETED'
    | 'BOSS_COMPLETED'
    | 'DOMAIN_SELECTED';
  payload: Record<string, any>;
  userId: string;
  timestamp: number;
  isOnline: boolean;
}

const QUEUE_KEY = 'kunz_telemetry_queue';

// Phase 2 — quota : borne la file pour ne jamais saturer localStorage.
const MAX_QUEUE = 100;
const TRIM_TO = 80;

// Debounce APP_OPENED (ouvertures répétées en quelques minutes).
const APP_OPENED_DEBOUNCE = 5 * 60 * 1000;
let lastAppOpened = 0;

const getQueue = (): TelemetryEvent[] => {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
  } catch {
    return [];
  }
};

const setQueue = (queue: TelemetryEvent[]) => {
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch {
    // QuotaExceeded : on abandonne 20% des plus anciens puis on réessaie.
    try {
      const trimmed = queue.slice(Math.ceil(queue.length * 0.2));
      localStorage.setItem(QUEUE_KEY, JSON.stringify(trimmed));
    } catch {
      /* localStorage indisponible : on ignore */
    }
  }
};

// Enregistre un event localement (et tente un flush immédiat si online).
export function logEvent(eventName: TelemetryEvent['eventName'], payload: Record<string, any> = {}) {
  // Debounce APP_OPENED : une seule ouverture toutes les 5 min.
  if (eventName === 'APP_OPENED') {
    const now = Date.now();
    if (now - lastAppOpened < APP_OPENED_DEBOUNCE) return;
    lastAppOpened = now;
  }

  let userId = 'unknown';
  try {
    const saved = localStorage.getItem('kunz_user');
    if (saved) userId = JSON.parse(saved).id || 'unknown';
  } catch {
    userId = 'unknown';
  }

  const event: TelemetryEvent = {
    eventName,
    payload,
    userId,
    timestamp: Date.now(),
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : false,
  };

  let queue = getQueue();
  queue.push(event);
  // Borne la file : garde les TRIM_TO plus récents.
  if (queue.length > MAX_QUEUE) queue = queue.slice(queue.length - TRIM_TO);
  setQueue(queue);

  if (typeof navigator !== 'undefined' && navigator.onLine) {
    void flushEvents();
  }
}

// Vide la file vers Supabase. En cas d'échec (offline / RLS / pas de client), on garde la file.
export async function flushEvents() {
  const queue = getQueue();
  if (queue.length === 0 || !supabase) return;

  try {
    const { error } = await supabase.from('telemetry_events').insert(
      queue.map((e) => ({
        user_id: e.userId,
        event_name: e.eventName,
        payload: e.payload,
        is_online: e.isOnline,
      }))
    );
    if (error) throw error;
    setQueue([]); // Vide la file uniquement en cas de succès
  } catch {
    // Silencieux : la file reste pour le prochain 'online'
  }
}

// Écouteur réseau : dès que l'app revient en ligne, on vide la file.
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => void flushEvents());
  // Flush périodique (30s) quand on est en ligne.
  setInterval(() => {
    if (navigator.onLine) void flushEvents();
  }, 30000);
}
