import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";

function memoryStorage() {
  const values = new Map();
  return {
    getItem: (key) => (values.has(key) ? values.get(key) : null),
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key),
    clear: () => values.clear(),
    keys: () => [...values.keys()]
  };
}

globalThis.localStorage = memoryStorage();
const { store, CURRENT_SCHEMA_VERSION, migrateState, validateState } = await import("../js/store.js");

beforeEach(() => {
  localStorage.clear();
  store.reset();
});

test("la progression est isolée par année pour le même sujet et exercice", () => {
  const bac2025 = store.exercise("2025", 1, 1);
  bac2025.text.N = "Réponse BAC 2025";
  bac2025.scores.N = 1;
  bac2025.answeredAny = true;

  const bac2024 = store.exercise("2024", 1, 1);
  assert.notStrictEqual(bac2024, bac2025);
  assert.equal(bac2024.text.N, "");
  assert.equal(bac2024.scores.N, 0);
  assert.equal(bac2024.answeredAny, false);

  assert.equal(store.exercise("2025", 1, 1).text.N, "Réponse BAC 2025");
  assert.deepEqual(Object.keys(store.state.progress).sort(), ["2024", "2025"]);
});

test("une progression v2 ambiguë n'est jamais attribuée arbitrairement à une année", () => {
  const legacy = {
    yearId: "2025",
    subjects: { 1: { 1: { text: { N: "ancienne réponse" } } } }
  };
  localStorage.setItem("boussole4d.v2", JSON.stringify(legacy));
  localStorage.removeItem("boussole4d.v4");
  store.load();

  assert.equal(store.state.progress["2025"], undefined);
  assert.equal(localStorage.getItem("boussole4d.v2"), null);
  assert.equal(localStorage.getItem("boussole4d.v2.legacy-unmigrated"), JSON.stringify(legacy));
});

test("une sauvegarde v3 sans schemaVersion migre explicitement puis est normalisée", () => {
  const legacyV3 = {
    activeScreen: "view-workspace",
    yearId: "2024",
    sujetId: 1,
    progress: { 2024: { 1: { 1: { text: { N: "réponse" }, scores: { N: 1 } } } } }
  };
  localStorage.setItem("boussole4d.v3", JSON.stringify(legacyV3));
  localStorage.removeItem("boussole4d.v4");
  store.load();

  assert.equal(store.state.schemaVersion, CURRENT_SCHEMA_VERSION);
  assert.equal(store.state.activeScreen, "view-workspace");
  assert.equal(store.exercise("2024", 1, 1).text.N, "réponse");
  assert.equal(localStorage.getItem("boussole4d.v3"), null);
  assert.equal(JSON.parse(localStorage.getItem("boussole4d.v4")).schemaVersion, CURRENT_SCHEMA_VERSION);
  // L'ancienne session d'entraînement est ramenée à l'unique mode : l'épreuve.
  assert.equal(store.state.sessionMode, "bac");
});

test("un état stocké invalide est remis à zéro et sauvegardé dans une copie de secours", () => {
  const malformed = "{not-json";
  localStorage.setItem("boussole4d.v4", malformed);
  store.load();

  assert.equal(store.state.schemaVersion, CURRENT_SCHEMA_VERSION);
  assert.equal(store.state.activeScreen, "view-hub");
  const backupKey = localStorage.keys().find((key) => key.startsWith("boussole4d.v4.corrupt-"));
  assert.equal(localStorage.getItem(backupKey), malformed);
});

test("la migration v1 ajoute le mode révision désactivé", () => {
  const migrated = migrateState({ schemaVersion: 1, progress: {} });
  assert.equal(migrated.schemaVersion, CURRENT_SCHEMA_VERSION);
  assert.equal(migrated.reviewMode, false);
  assert.equal(migrated.sessionMode, "bac");
});

test("la validation rejette les futures versions et élimine les champs incohérents", () => {
  assert.throws(() => migrateState({ schemaVersion: CURRENT_SCHEMA_VERSION + 1 }), /future schema/);
  const validated = validateState({
    schemaVersion: CURRENT_SCHEMA_VERSION,
    activeScreen: "evil-screen",
    yearId: "pas-une-annee",
    sujetId: "1",
    globalRemaining: -30,
    progress: { bad: { x: { y: { text: { N: 42 } } } } }
  });
  assert.equal(validated.activeScreen, "view-hub");
  assert.equal(validated.yearId, "2025");
  assert.equal(validated.sujetId, 1);
  assert.equal(validated.globalRemaining, 0);
  assert.deepEqual(validated.progress, {});
});

test("les identifiants Maths sont validés et leur progression persiste", () => {
  store.enterSession("2025-m", 1, 150 * 60);
  store.exercise("2025-m", 1, 2).text.N = "réponse Maths";
  store.save();
  store.load();

  assert.equal(store.state.yearId, "2025-m");
  assert.equal(store.state.globalDuration, 150 * 60);
  assert.equal(store.exercise("2025-m", 1, 2).text.N, "réponse Maths");
});

test("le cycle de session démarre frais puis se termine sans effacer les réponses", () => {
  store.enterSession("2025", 1, 270 * 60, 25 * 60);
  assert.equal(store.state.sessionStatus, "active");
  assert.equal(store.state.globalRemaining, 270 * 60);
  store.exercise("2025", 1, 1).text.N = "réponse conservée";
  store.state.globalRemaining = 10;

  store.enterSession("2025", 2, 270 * 60, 25 * 60);
  assert.equal(store.state.sujetId, 2);
  assert.equal(store.state.globalRemaining, 270 * 60);
  assert.equal(store.state.activeExercise, 1);
  assert.equal(store.exercise("2025", 1, 1).text.N, "réponse conservée");

  assert.equal(store.finishSession("manual"), true);
  assert.equal(store.state.sessionStatus, "completed");
  assert.equal(store.state.sessionActive, false);
  assert.equal(store.state.sessionEndReason, "manual");
  assert.equal(store.state.reviewMode, true);
  assert.equal(store.finishSession("manual"), false);
});

test("l'épreuve démarre son horloge au choix du sujet et interdit la relecture anticipée", () => {
  store.enterSession("2025", 1, 270 * 60, 25 * 60);
  store.state.globalRemaining = 123;
  assert.equal(store.activateSubjectMode(2, "bac"), true);
  assert.equal(store.state.sessionMode, "bac");
  assert.equal(store.state.sujetId, 2);
  assert.equal(store.state.globalRemaining, 270 * 60);
  assert.throws(() => store.setReviewMode(true), /relecture est interdite/);
  // Les anciens modes ("training", "simulation") sont normalisés, jamais rejetés.
  store.state.globalRemaining = 123;
  assert.equal(store.activateSubjectMode(2, "simulation"), true);
  assert.equal(store.state.sessionMode, "bac");
  assert.equal(store.state.globalRemaining, 270 * 60);
  store.state.globalRemaining = 123;
  assert.equal(store.activateSubjectMode(2, "training"), true);
  assert.equal(store.state.sessionMode, "bac");
  assert.equal(store.state.globalRemaining, 270 * 60);

  const answer = store.exercise("2025", 2, 1);
  answer.officialTaskAnswers["2025-S2-E1-Q1"] = "إجابة محفوظة";
  store.save();
  store.load();
  assert.equal(store.exercise("2025", 2, 1).officialTaskAnswers["2025-S2-E1-Q1"], "إجابة محفوظة");
});

test("la réconciliation termine une session dont le temps est écoulé", () => {
  store.enterSession("2025-m", 1, 150 * 60);
  store.state.globalRemaining = 2;
  store.state.globalLastTick = Date.now() - 5_000;
  store._reconcileTimers();

  assert.equal(store.state.globalRemaining, 0);
  assert.equal(store.state.sessionStatus, "completed");
  assert.equal(store.state.sessionEndReason, "time-expired");
  assert.equal(store.state.globalLastTick, null);
});

test("exercise exige explicitement yearId", () => {
  assert.throws(() => store.exercise("", 1, 1), /yearId est requis/);
});

test("un état persisté pointant vers view-onboarding retombe proprement sur le hub", () => {
  const validated = validateState({
    schemaVersion: CURRENT_SCHEMA_VERSION,
    activeScreen: "view-onboarding",
    progress: {}
  });
  assert.equal(validated.activeScreen, "view-hub");
});
