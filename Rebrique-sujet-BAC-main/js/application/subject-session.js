import { examMinutesForYear, getLoadedYear, loadYear } from "../../data/subjects.js";
import { reportDiagnostic } from "../services/diagnostics.js";
import { classifyYearLoadError, YEAR_LOAD_MESSAGES } from "./year-load-error.js";

/* Un échec de chargement peut venir du réseau, d'une copie périmée ou d'ailleurs.
   Les trois n'appellent pas la même réponse : réessayer, recharger, ou s'excuser.
   Les constantes ci-dessous bornent les tentatives automatiques — jamais de
   rechargement en boucle, jamais d'interruption d'une épreuve en cours. */
const STALE_RELOAD_KEY = "boussole4d.stale-reload-count";
const MAX_STALE_RELOADS = 1;
const NETWORK_RETRY_DELAY_MS = 600;
const RELOAD_DELAY_MS = 400;

const defaultSleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function sessionStore() {
  try {
    return globalThis.sessionStorage || null;
  } catch {
    return null;
  }
}

/** Loads one subject payload, then starts the persisted session. */
export function createSubjectSessionStarter({
  appConfig,
  renderGuide,
  showScreen,
  store,
  timers,
  toast,
  timerBar,
  helpers,
  $,
  windowRef = globalThis,
  sleep = defaultSleep,
  storage = sessionStore,
  /* Source des données d'année. Injection réservée aux tests : en production
     c'est toujours le chargeur paresseux de data/subjects.js, le seul qui
     garantit qu'une année n'est téléchargée que si l'élève l'ouvre. */
  yearSource = { getLoadedYear, loadYear }
}) {
  /** Une panne réseau isolée n'est pas une panne définitive : une seule nouvelle
   *  tentative, puis on rend la main à l'élève (le bouton se réactive). */
  async function loadOnce(yearId, { retry = true } = {}) {
    try {
      return { year: await yearSource.loadYear(yearId) };
    } catch (error) {
      const kind = classifyYearLoadError(error);
      reportDiagnostic("subjects.load-year", error, { yearId: String(yearId) });
      if (kind !== "network" || !retry) return { error, kind };
      await sleep(NETWORK_RETRY_DELAY_MS);
      return loadOnce(yearId, { retry: false });
    }
  }

  /** Recharger est sûr (la session est persistée) mais jamais pendant une épreuve. */
  function staleReloadCount() {
    const raw = Number(storage()?.getItem(STALE_RELOAD_KEY));
    return Number.isFinite(raw) ? raw : 0;
  }

  function canReloadForStaleData() {
    if (typeof windowRef?.location?.reload !== "function") return false;
    if (store.isSessionActive()) return false;
    return staleReloadCount() < MAX_STALE_RELOADS;
  }

  function reloadForStaleData() {
    try {
      storage()?.setItem(STALE_RELOAD_KEY, String(staleReloadCount() + 1));
    } catch {
      /* stockage indisponible : le rechargement reste tenté, la boucle est bornée par MAX_STALE_RELOADS */
    }
    sleep(RELOAD_DELAY_MS).then(() => windowRef.location.reload());
  }

  /** Le bouton reste réactivé : l'élève peut réessayer. S'il retrouve du réseau
   *  avant d'avoir cliqué, l'année s'ouvre d'elle-même — c'est ce qu'il voulait. */
  const onlineRetries = new Map();

  function armOnlineRetry(yearId) {
    if (typeof windowRef?.addEventListener !== "function") return;
    if (onlineRetries.has(yearId)) return;
    const handler = async () => {
      windowRef.removeEventListener("online", handler);
      onlineRetries.delete(yearId);
      // L'élève a pu ouvrir une autre année ou quitter le hub pendant la panne.
      if (store.isSessionActive() || store.state?.activeScreen !== "view-hub") return;
      try {
        begin(await yearSource.loadYear(yearId));
      } catch (error) {
        reportDiagnostic("subjects.load-year", error, { yearId: String(yearId) });
      }
    };
    onlineRetries.set(yearId, handler);
    windowRef.addEventListener("online", handler);
  }

  function reportLoadFailure(yearId, kind) {
    if (kind === "network") {
      toast(YEAR_LOAD_MESSAGES.network, "error", 6000);
      armOnlineRetry(yearId);
      return null;
    }
    if (kind === "stale") {
      if (canReloadForStaleData()) {
        toast(YEAR_LOAD_MESSAGES.staleReloading, "info", 4000);
        reloadForStaleData();
      } else {
        toast(YEAR_LOAD_MESSAGES.staleManual, "error", 6000);
      }
      return null;
    }
    toast(YEAR_LOAD_MESSAGES.unknown, "error", 6000);
    return null;
  }

  function begin(year) {
    store.enterSession(
      year.id,
      year.sujets[0].id,
      examMinutesForYear(year) * 60,
      appConfig.strategyMinutes * 60
    );
    renderGuide(year);
    // Global exam clock starts only after the student confirms subject + mode
    // in strategy screen. The 25-minute strategy phase and breathing guide
    // must not debit the official BAC duration (fixes premature timer drain).
    // Keep the timer bar hidden on guide/strategy, but refresh its value to
    // the chosen year's duration so any reveal shows the correct starting time.
    const t = $("#global-timer");
    if (t) t.textContent = helpers.fmt(store.state.globalRemaining);
    showScreen("view-guide");
    timerBar()?.classList.add("hidden");
    return year;
  }

  return async function startSession(yearId) {
    let year = yearSource.getLoadedYear(yearId);
    if (!year) {
      const attempt = await loadOnce(yearId);
      if (!attempt.year) return reportLoadFailure(yearId, attempt.kind);
      year = attempt.year;
    }
    /* `begin()` est volontairement HORS du bloc de chargement : une panne à
       l'ouverture de la session (rendu, persistance) n'est pas une panne de
       données, et ne doit pas être annoncée comme telle. */
    try {
      return begin(year);
    } catch (error) {
      reportDiagnostic("subjects.start-session", error, { yearId: String(yearId) });
      toast("تعذّر فتح هذه السنة. أعد المحاولة.", "error", 6000);
      return null;
    }
  };
}
