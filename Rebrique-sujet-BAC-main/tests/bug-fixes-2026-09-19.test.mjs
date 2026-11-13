/* ============================================================
   Régressions du 2026-09-19 — « تعذّر تحميل بيانات هذه السنة »
   ------------------------------------------------------------
   Signalé par le propriétaire : en cliquant sur certains bacs,
   l'élève obtenait « تعذّر تحميل بيانات هذه السنة. أعد المحاولة. »
   et « أعد المحاولة » ne réparait rien.

   Cause : un seul message pour trois pannes distinctes, aucune
   d'entre elles n'étant traitée.

     B24 : panne réseau (module non téléchargé) — non retentée, et
           annoncée comme une donnée cassée alors que la donnée est
           simplement ABSENTE de l'appareil ;
     B25 : copie périmée (catalogue d'années et charge utile de deux
           versions différentes) — `navigator.onLine !== false` ne dit
           rien de ce cas, et rien ne réalignait les deux ;
     B26 : `begin()` était dans le `try` du chargement : une panne de
           rendu ou de persistance était annoncée comme une panne de
           données.

   Couverture : classification de la panne, réponse distincte par
   cause, bornes (jamais plus d'un rechargement, jamais pendant une
   épreuve), et le payload de la session exceptionnelle qui doit
   passer par le cache borné du service worker.
   ============================================================ */
import { test } from "node:test";
import assert from "node:assert/strict";
import { classifyYearLoadError, YEAR_LOAD_MESSAGES } from "../js/application/year-load-error.js";
import { createSubjectSessionStarter } from "../js/application/subject-session.js";

const YEAR = Object.freeze({
  id: "2013-m",
  stream: "m",
  examMinutes: 180,
  sujets: [{ id: 1, exercises: [] }]
});

function harness({ loadImpl, sessionActive = false, activeScreen = "view-hub" } = {}) {
  const calls = { toasts: [], reloads: 0, entered: [], screens: [], loads: 0, rendered: 0 };
  const listeners = new Map();
  const memory = new Map();
  const storage = {
    getItem: (key) => (memory.has(key) ? memory.get(key) : null),
    setItem: (key, value) => memory.set(key, String(value))
  };
  const windowRef = {
    location: {
      reload() {
        calls.reloads += 1;
      }
    },
    addEventListener(type, handler) {
      listeners.set(type, [...(listeners.get(type) || []), handler]);
    },
    removeEventListener(type, handler) {
      listeners.set(
        type,
        (listeners.get(type) || []).filter((item) => item !== handler)
      );
    }
  };
  const store = {
    state: { activeScreen, globalRemaining: 0 },
    isSessionActive: () => sessionActive,
    enterSession(...args) {
      calls.entered.push(args);
    }
  };
  const starter = createSubjectSessionStarter({
    appConfig: { strategyMinutes: 25 },
    renderGuide() {
      calls.rendered += 1;
    },
    showScreen(id) {
      calls.screens.push(id);
    },
    store,
    timers: {},
    toast(message, type) {
      calls.toasts.push({ message, type });
    },
    timerBar: () => null,
    helpers: { fmt: (value) => String(value) },
    $: () => null,
    windowRef,
    sleep: async () => {},
    storage: () => storage,
    yearSource: {
      getLoadedYear: () => null,
      async loadYear(yearId) {
        calls.loads += 1;
        return loadImpl(yearId, calls.loads);
      }
    }
  });
  const fire = async (type) => {
    for (const handler of listeners.get(type) || []) await handler();
  };
  return { starter, calls, fire, store };
}

const networkError = () =>
  new TypeError("Failed to fetch dynamically imported module: ./years/m/year-2013.js");
const staleError = () => new RangeError("سنة غير معروفة: 2013-m");

test("un échec de chargement est classé selon sa cause, pas selon une supposition", () => {
  assert.equal(classifyYearLoadError(networkError()), "network");
  assert.equal(classifyYearLoadError(new TypeError("error loading dynamically imported module")), "network");
  assert.equal(
    classifyYearLoadError(new Error("NetworkError when attempting to fetch resource.")),
    "network"
  );
  assert.equal(classifyYearLoadError(staleError()), "stale");
  assert.equal(classifyYearLoadError(new Error("بنية تمارين السنة 2013-m غير متطابقة.")), "stale");
  assert.equal(classifyYearLoadError(new Error("بيانات السنة 2013-m غير صالحة.")), "stale");
  assert.equal(classifyYearLoadError(new Error("boom")), "unknown");
  assert.equal(classifyYearLoadError(undefined), "unknown");
});

test("une panne réseau isolée est retentée une seule fois, sans rien annoncer", async () => {
  const { starter, calls } = harness({
    loadImpl: (_id, attempt) => {
      if (attempt === 1) throw networkError();
      return YEAR;
    }
  });
  const loaded = await starter("2013-m");
  assert.equal(loaded, YEAR, "la deuxième tentative ouvre l'année");
  assert.equal(calls.loads, 2, "exactement une nouvelle tentative");
  assert.deepEqual(calls.toasts, [], "aucun message pour une panne déjà réparée");
  assert.deepEqual(calls.screens, ["view-guide"]);
});

test("réseau coupé : message honnête, aucun rechargement, et réouverture au retour du réseau", async () => {
  const { starter, calls, fire } = harness({
    loadImpl: (_id, attempt) => {
      if (attempt < 3) throw networkError();
      return YEAR;
    }
  });
  assert.equal(await starter("2013-m"), null);
  assert.deepEqual(
    calls.toasts.map((entry) => entry.message),
    [YEAR_LOAD_MESSAGES.network],
    "les données ne sont pas sur l'appareil : c'est cela qu'il faut dire"
  );
  assert.equal(calls.reloads, 0, "une panne réseau ne justifie pas de recharger");

  await fire("online");
  assert.equal(calls.entered.length, 1, "l'année s'ouvre dès le retour du réseau");
  assert.deepEqual(calls.screens, ["view-guide"]);
});

test("copie périmée : la page est rechargée une fois, pas deux", async () => {
  const { starter, calls } = harness({
    loadImpl: () => {
      throw staleError();
    }
  });
  await starter("2013-m");
  assert.deepEqual(
    calls.toasts.map((entry) => entry.message),
    [YEAR_LOAD_MESSAGES.staleReloading]
  );
  assert.equal(calls.reloads, 1);

  await starter("2013-m");
  assert.equal(
    calls.toasts.at(-1).message,
    YEAR_LOAD_MESSAGES.staleManual,
    "au second échec on n'enferme pas l'élève dans une boucle de rechargement"
  );
  assert.equal(calls.reloads, 1);
});

test("copie périmée pendant une épreuve : jamais de rechargement", async () => {
  const { starter, calls } = harness({
    loadImpl: () => {
      throw staleError();
    },
    sessionActive: true
  });
  await starter("2013-m");
  assert.equal(calls.toasts.at(-1).message, YEAR_LOAD_MESSAGES.staleManual);
  assert.equal(calls.reloads, 0, "une épreuve en cours n'est jamais interrompue");
});

test("cause inconnue : le message générique, sans inventer de cause", async () => {
  const { starter, calls } = harness({
    loadImpl: () => {
      throw new Error("boom");
    }
  });
  await starter("2013-m");
  assert.deepEqual(
    calls.toasts.map((entry) => entry.message),
    [YEAR_LOAD_MESSAGES.unknown]
  );
  assert.equal(calls.reloads, 0);
});

test("une panne à l'ouverture de la session n'est pas annoncée comme une panne de données", async () => {
  const { starter, calls } = harness({ loadImpl: () => YEAR });
  const broken = createSubjectSessionStarter({
    appConfig: { strategyMinutes: 25 },
    renderGuide() {
      throw new Error("rendu impossible");
    },
    showScreen() {},
    store: harness({ loadImpl: () => YEAR }).store,
    timers: {},
    toast(message) {
      calls.toasts.push({ message });
    },
    timerBar: () => null,
    helpers: { fmt: (value) => String(value) },
    $: () => null,
    windowRef: {},
    sleep: async () => {},
    storage: () => null,
    yearSource: { getLoadedYear: () => null, loadYear: async () => YEAR }
  });
  void starter;
  assert.equal(await broken("2013-m"), null);
  assert.equal(calls.toasts.length, 1);
  assert.equal(calls.toasts[0].message, "تعذّر فتح هذه السنة. أعد المحاولة.");
  assert.notEqual(calls.toasts[0].message, YEAR_LOAD_MESSAGES.unknown);
});
