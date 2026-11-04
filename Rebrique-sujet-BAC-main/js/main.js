/* ============================================================
   MAIN — point d'entrée. Charge la config et initialise l'UI.
   ============================================================ */
import { init } from "./ui.js";
import { store } from "./store.js";
import { initializeOperationalObservability, reportDiagnostic } from "./services/diagnostics.js";

initializeOperationalObservability(globalThis.window);

/* Quand une nouvelle version du service worker prend la main, elle efface les
   caches de la version précédente. Un onglet resté ouvert garde alors en
   mémoire l'ancien catalogue d'années alors que les charges utiles servies
   sont nouvelles (ou l'inverse) : l'année échoue à la validation et refuse de
   s'ouvrir. Réaligner les deux demande un rechargement — sans risque pour
   l'élève, dont la session est persistée, et jamais pendant une épreuve. */
const MAX_SW_RELOADS = 1;
const SW_RELOAD_KEY = "boussole4d.sw-reload-count";

function readReloadCount() {
  try {
    const raw = Number(globalThis.sessionStorage?.getItem(SW_RELOAD_KEY));
    return Number.isFinite(raw) ? raw : 0;
  } catch {
    return 0;
  }
}

function watchServiceWorkerUpdates() {
  if (globalThis.location?.protocol === "file:") return;
  if (!globalThis.navigator?.serviceWorker) return;
  // Sans contrôleur au chargement, il n'y a rien à réaligner : c'est une
  // première installation, pas une mise à jour.
  const hadController = Boolean(navigator.serviceWorker.controller);
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (!hadController) return;
    if (store.isSessionActive()) return;
    const done = readReloadCount();
    if (done >= MAX_SW_RELOADS) return;
    try {
      globalThis.sessionStorage?.setItem(SW_RELOAD_KEY, String(done + 1));
    } catch {
      /* stockage indisponible : on recharge quand même, la borne est best-effort */
    }
    globalThis.location?.reload();
  });
}

// Service workers are unavailable and unwanted in the file:// standalone build.
if (globalThis.location?.protocol !== "file:" && "serviceWorker" in navigator) {
  watchServiceWorkerUpdates();
  window.addEventListener("load", () =>
    navigator.serviceWorker
      .register("./sw.js")
      .catch((error) => reportDiagnostic("service-worker.register", error))
  );
}

document.addEventListener("DOMContentLoaded", () =>
  init().catch((error) => reportDiagnostic("application.init", error))
);
