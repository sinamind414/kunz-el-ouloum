/**
 * Local, privacy-preserving operational diagnostics.
 * Nothing is transmitted or persisted. Error messages, stacks, URLs, answers and
 * arbitrary context are deliberately excluded; only technical counters remain.
 */

/** @typedef {Window & { CustomEvent: typeof CustomEvent }} OperationalWindow */

const MAX_ERROR_BUCKETS = 40;
const MAX_COUNTER = 9999;
const ALLOWED_SCOPES = new Set([
  "application.init",
  "service-worker.register",
  "sound.disconnect-node",
  "sound.play",
  "sound.resume",
  "sound.stop-node",
  "speech.abort",
  "speech.recognition",
  "speech.start",
  "store.backup-malformed",
  "store.load-invalid-legacy-state",
  "store.load-invalid-state",
  "store.load-unavailable",
  "store.reset",
  "store.save",
  "subjects.load-year",
  /* Ouverture d'une année dont les données ont bien été chargées : l'échec vient
     du démarrage de session (rendu ou persistance), pas du chargement. Le
     distinguer de `subjects.load-year` évite de chercher la panne au mauvais
     endroit — les deux n'ont ni la même cause ni le même message. */
  "subjects.start-session",
  "subjects.restore-year",
  "theme.load",
  "theme.save"
]);
const ALLOWED_ERROR_NAMES = new Set([
  "aborterror",
  "error",
  "invalidstateerror",
  "networkerror",
  "notallowederror",
  "quotaexceedederror",
  "rangeerror",
  "securityerror",
  "syntaxerror",
  "typeerror"
]);
const errorBuckets = new Map();
const serviceWorkerEvents = new Map();
let online = typeof navigator === "undefined" ? true : navigator.onLine !== false;
let onlineTransitions = 0;
let offlineTransitions = 0;
/** @type {OperationalWindow | null} */
let initializedWindow = null;

/** @param {unknown} value @param {string} [fallback] */
const safeToken = (value, fallback = "unknown") => {
  const token = String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
  return token || fallback;
};

/** @param {unknown} error */
function errorName(error) {
  const name = safeToken(error instanceof Error ? error.name : typeof error, "error");
  return ALLOWED_ERROR_NAMES.has(name) ? name : "other-error";
}

/** @param {Map<string, number>} map @param {string} key */
function increment(map, key) {
  if (!map.has(key) && map.size >= MAX_ERROR_BUCKETS) key = "other";
  const next = Math.min(MAX_COUNTER, (map.get(key) || 0) + 1);
  map.set(key, next);
  return next;
}

/** @param {OperationalWindow | null} [target] */
function dispatchOperationalUpdate(target = initializedWindow) {
  if (!target || typeof target.dispatchEvent !== "function" || typeof target.CustomEvent !== "function")
    return;
  target.dispatchEvent(
    new target.CustomEvent("miftah:operational-status", { detail: getOperationalSnapshot() })
  );
}

/**
 * Records one aggregate technical failure without retaining its payload.
 * The third argument remains accepted for API compatibility but is never stored.
 * @param {string} scope
 * @param {unknown} error
 * @param {Record<string, unknown>} [_discardedContext]
 */
export function reportDiagnostic(scope, error, _discardedContext = {}) {
  const requestedScope = safeToken(scope, "application");
  const safeScope = ALLOWED_SCOPES.has(requestedScope) ? requestedScope : "application";
  const name = errorName(error);
  const count = increment(errorBuckets, `${safeScope}:${name}`);
  const detail = { code: safeScope, scope: safeScope, errorName: name, count };

  console.warn(`[miftah:${safeScope}] ${name}`);
  if (typeof window !== "undefined" && typeof window.CustomEvent === "function") {
    try {
      window.dispatchEvent(new window.CustomEvent("boussole4d:diagnostic", { detail }));
    } catch {
      // Diagnostics must never interrupt the student flow.
    }
  }
  dispatchOperationalUpdate();
  return detail;
}

/** @param {boolean} nextOnline */
function setOnline(nextOnline) {
  if (nextOnline === online) return;
  online = nextOnline;
  if (online) onlineTransitions += 1;
  else offlineTransitions += 1;
  dispatchOperationalUpdate();
}

/** @param {MessageEvent} event */
function onServiceWorkerMessage(event) {
  if (event.data?.source === "miftah-sw") recordServiceWorkerEvent(event.data.type);
}

/** @param {string} type */
function recordServiceWorkerEvent(type) {
  const allowed = new Set(["runtime-cache-updated", "offline-fallback", "offline-miss"]);
  if (!allowed.has(type)) return;
  increment(serviceWorkerEvents, type);
  if (type.startsWith("offline-")) setOnline(false);
  else if (type === "runtime-cache-updated" && initializedWindow?.navigator?.onLine !== false) {
    setOnline(true);
  } else dispatchOperationalUpdate();
}

function cleanupOldObservability() {
  const old = initializedWindow;
  if (!old || !old.removeEventListener) return;
  try {
    old.removeEventListener("online", setOnlineTrue);
  } catch {
    /* noop */
  }
  try {
    old.removeEventListener("offline", setOnlineFalse);
  } catch {
    /* noop */
  }
  try {
    old.navigator?.serviceWorker?.removeEventListener?.("message", onServiceWorkerMessage);
  } catch {
    /* noop */
  }
}

function setOnlineTrue() {
  setOnline(true);
}
function setOnlineFalse() {
  setOnline(false);
}

/**
 * Idempotently observes online/offline and allowlisted service-worker events.
 * @param {OperationalWindow | null} [target]
 */
export function initializeOperationalObservability(
  target = typeof window === "undefined" ? null : /** @type {OperationalWindow} */ (window)
) {
  if (!target) return getOperationalSnapshot();
  if (initializedWindow === target) return getOperationalSnapshot();
  cleanupOldObservability();
  initializedWindow = target;
  online = target.navigator?.onLine !== false;
  target.addEventListener?.("online", setOnlineTrue);
  target.addEventListener?.("offline", setOnlineFalse);
  target.navigator?.serviceWorker?.addEventListener?.("message", onServiceWorkerMessage);
  dispatchOperationalUpdate(target);
  return getOperationalSnapshot();
}

/** Backward-compatible name; now returns aggregate buckets rather than raw errors. */
export function getDiagnostics() {
  return [...errorBuckets.entries()]
    .map(([key, count]) => {
      const separator = key.lastIndexOf(":");
      return { scope: key.slice(0, separator), errorName: key.slice(separator + 1), count };
    })
    .sort((a, b) => a.scope.localeCompare(b.scope) || a.errorName.localeCompare(b.errorName));
}

export function getOperationalSnapshot() {
  const runtime = /** @type {{ APP_BUILD_ID?: unknown }} */ (globalThis);
  return {
    schemaVersion: 1,
    buildId: safeToken(runtime.APP_BUILD_ID, "dev"),
    online,
    transitions: { online: onlineTransitions, offline: offlineTransitions },
    errors: getDiagnostics(),
    serviceWorker: Object.fromEntries(
      [...serviceWorkerEvents.entries()].sort(([a], [b]) => a.localeCompare(b))
    )
  };
}

export function clearDiagnostics() {
  errorBuckets.clear();
  serviceWorkerEvents.clear();
  onlineTransitions = 0;
  offlineTransitions = 0;
  dispatchOperationalUpdate();
}
