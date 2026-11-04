/* ============================================================
   STORE — état applicatif, persistance et migrations validées
   ============================================================ */

import { EXAM_MINUTES_BY_STREAM, YEAR_CATALOG } from "../data/subjects.js";
import { reportDiagnostic } from "./services/diagnostics.js";

const KEY = "boussole4d.v4";
const LEGACY_KEY = "boussole4d.v3";
const AMBIGUOUS_LEGACY_KEY = "boussole4d.v2";
export const CURRENT_SCHEMA_VERSION = 5;
export const YEAR_ID_PATTERN = /^\d{4}(?:-[a-z]{1,3})?$/;
/** Borne unique de tous les textes persistés par exercice. Bug #B15 : un
 *  localStorage corrompu (ou un copier-coller massif) pouvait accumuler des
 *  dizaines de Mo par pôle et rendre le rechargement inutilisable. La borne
 *  est nommée pour qu'aucun champ ne puisse être oublié par inadvertance. */
export const MAX_PERSISTED_TEXT = 60000;
/** Cardinalité maximale des tables libres d'un exercice (`fields`,
 *  `officialTaskAnswers`). Sans elle, un localStorage corrompu pouvait
 *  multiplier les entrées indéfiniment : borner la longueur des valeurs ne
 *  suffit pas si leur nombre ne l'est pas. */
export const MAX_PERSISTED_KEYS = 200;
/** Plages d'identifiants persistés — identiques à celles de store.exercise().
 *  sanitizeProgress acceptait auparavant /^[1-9]\d*$/ sans plafond : un
 *  localStorage corrompu pouvait créer un nombre illimité de sujets et
 *  d'exercices fantômes, chacun portant ses propres champs texte. */
export const MAX_SUBJECT_ID = 9;
export const MAX_EXERCISE_ID = 9;
/** Années réellement chargeables : dérivées du catalogue applicatif, jamais
 *  recopiées à la main. Bug #B2 : YEAR_ID_PATTERN seul validait la forme sans
 *  garantir l'existence — "9999" issu d'un localStorage corrompu n'a aucun
 *  payload et loadYear jetterait RangeError.
 *  Le correctif initial remplaçait le pattern par une liste tenue à la main,
 *  qui a fini par dériver du catalogue : elle déclarait 2013-m…2020-m alors
 *  que data/subjects.js ne charge que 2021-m…2026-m. enterSession("2013-m")
 *  était donc accepté, puis loadYear("2013-m") levait RangeError. La seule
 *  source de vérité est désormais YEAR_CATALOG (mêmes ids, mêmes chargeurs). */
export const KNOWN_YEAR_IDS = new Set(YEAR_CATALOG.map((entry) => entry.id));
/** Année connue (catalogue) ET conforme au pattern. */
function isCatalogYear(id) {
  return typeof id === "string" && YEAR_ID_PATTERN.test(id) && KNOWN_YEAR_IDS.has(id);
}
/* Un seul mode : l'épreuve. L'ancien « mode entraînement » (N/S/E/W avec
   aides, modèles et diagnostics) a été retiré du produit ; les sessions
   enregistrées avec "training" ou "simulation" sont ramenées à "bac". */
export const SESSION_MODES = Object.freeze(["bac"]);
const LEGACY_SESSION_MODES = new Set(["training", "simulation"]);
export const normalizeSessionMode = (value) => (LEGACY_SESSION_MODES.has(value) ? "bac" : value);
const POLES = ["N", "S", "E", "W"];
const SCREENS = new Set(["view-hub", "view-guide", "view-strategy", "view-workspace"]);
const SESSION_STATUSES = new Set(["idle", "active", "completed"]);

const isRecord = (value) => !!value && typeof value === "object" && !Array.isArray(value);
const asString = (value) => (typeof value === "string" ? value : "");
const asFiniteNumber = (value, fallback, min = -Infinity, max = Infinity) =>
  typeof value === "number" && Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback;
/** Clé numérique persistable, dans la même plage que store.exercise(). */
function isBoundedId(value, max) {
  if (typeof value !== "string" || !/^[1-9]\d*$/.test(value)) return false;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed <= max;
}
/** Copie au plus `limit` entrées valides d'une table libre. */
function copyBoundedEntries(source, target, isValidKey, limit = MAX_PERSISTED_KEYS) {
  let kept = 0;
  for (const [key, value] of Object.entries(source)) {
    if (kept >= limit) break;
    if (typeof value !== "string" || !isValidKey(key)) continue;
    target[key] = value.slice(0, MAX_PERSISTED_TEXT);
    kept += 1;
  }
  return kept;
}

function emptyExercise() {
  return {
    answeredAny: false,
    scores: { N: 0, S: 0, E: 0, W: 0 },
    text: { N: "", S: "", E: "", W: "" },
    scratch: { N: "", S: "", E: "", W: "", free: "" },
    fields: {},
    officialTaskAnswers: {},
    // Free-form answer used by bac-reading-mode when no official inventory
    // exists for the exercise (no per-task decomposition yet). Persisted
    // separately from officialTaskAnswers which is strictly Q-pattern keyed.
    freeAnswer: "",
    pipeline: { stream1: [null, null, null, null], stream2: [null, null, null, null] }
  };
}

function defaultState() {
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    activeScreen: "view-hub",
    sessionStatus: "idle",
    // Kept as a normalized compatibility flag for older consumers.
    sessionActive: false,
    sessionStartedAt: null,
    sessionCompletedAt: null,
    sessionEndReason: null,
    sessionMode: "bac",
    reviewMode: false,
    yearId: "2025",
    sujetId: 1,
    activeExercise: 1,
    activeStep: 1,
    globalDuration: 270 * 60,
    globalRemaining: 270 * 60,
    globalLastTick: null,
    strategyDuration: 25 * 60,
    strategyRemaining: 25 * 60,
    strategyLastTick: null,
    strategyRunning: false,
    // { [yearId]: { [sujetId]: { [exNum]: emptyExercise() } } }
    progress: {},
    // drill شحذ المفتاح: série de rounds parfaits et déblocage du المفتاح+
    drill: { streak: 0, best: 0, rounds: 0, unlocked: false }
  };
}

function sanitizeExercise(value) {
  const raw = isRecord(value) ? value : {};
  const safe = emptyExercise();
  safe.answeredAny = raw.answeredAny === true;
  for (const pole of POLES) {
    safe.scores[pole] = asFiniteNumber(raw.scores?.[pole], 0, 0, 20);
    // Bug #B15 : scratch et text peuvent accumuler des blocs copiés-collés
    // dépassant la dizaine de MB ; on borne à MAX_PERSISTED_TEXT caractères
    // par pôle pour éviter qu'un localStorage corrompu ralentisse le
    // rechargement (et que la session prenne >30s pour validerState).
    safe.text[pole] = asString(raw.text?.[pole]).slice(0, MAX_PERSISTED_TEXT);
    safe.scratch[pole] = asString(raw.scratch?.[pole]).slice(0, MAX_PERSISTED_TEXT);
  }
  // Bug #B15 (suite) : scratch.free était un champ texte non borné —
  // 5 000 000 caractères traversaient sanitizeExercise alors que text[pole],
  // scratch[pole] et freeAnswer étaient déjà plafonnés.
  safe.scratch.free = asString(raw.scratch?.free).slice(0, MAX_PERSISTED_TEXT);
  if (isRecord(raw.fields)) {
    // Champ historique que l'application n'écrit plus, mais sanitizeExercise
    // est une frontière : la valeur ET le nombre de clés doivent être bornés.
    copyBoundedEntries(raw.fields, safe.fields, (key) => key.length <= 100);
  }
  if (isRecord(raw.officialTaskAnswers)) {
    // C'est ici que persistAnswers() écrit la réponse de l'élève en mode
    // épreuve : valeur et nombre de tâches sont bornés tous les deux.
    copyBoundedEntries(raw.officialTaskAnswers, safe.officialTaskAnswers, (taskId) =>
      /^\d{4}(?:-[a-z]{1,3})?-S\d+-E\d+-Q\d+$/.test(taskId)
    );
  }
  // Free-form exercise-level answer (bac-reading-mode) — plain string, length-capped.
  safe.freeAnswer = typeof raw.freeAnswer === "string" ? raw.freeAnswer.slice(0, MAX_PERSISTED_TEXT) : "";
  for (const stream of ["stream1", "stream2"]) {
    const values = Array.isArray(raw.pipeline?.[stream]) ? raw.pipeline[stream] : [];
    safe.pipeline[stream] = Array.from({ length: 4 }, (_, index) => {
      const block = values[index];
      return typeof block === "string" && block.length <= 100 ? block : null;
    });
  }
  return safe;
}

function sanitizeProgress(value) {
  const progress = {};
  if (!isRecord(value)) return progress;
  for (const [yearId, subjects] of Object.entries(value)) {
    // Bug #B2 (sanitizeProgress) : on ne garde que les années effectivement
    // cataloguées, pas seulement celles qui matchent YEAR_ID_PATTERN. Une
    // entrée "9999" ou "../etc/passwd" passait le pattern et polluait
    // store.state.progress[yearId] jusqu'à un RangeError dans loadYear.
    if (!isCatalogYear(yearId) || !isRecord(subjects)) continue;
    progress[yearId] = {};
    for (const [sujetId, exercises] of Object.entries(subjects)) {
      // Même plage que store.exercise() (1..9) : sans plafond, un localStorage
      // corrompu pouvait créer un nombre illimité de sujets et d'exercices
      // fantômes, chacun portant ses propres champs texte.
      if (!isBoundedId(sujetId, MAX_SUBJECT_ID) || !isRecord(exercises)) continue;
      progress[yearId][sujetId] = {};
      for (const [exerciseId, exercise] of Object.entries(exercises)) {
        if (!isBoundedId(exerciseId, MAX_EXERCISE_ID)) continue;
        progress[yearId][sujetId][exerciseId] = sanitizeExercise(exercise);
      }
    }
  }
  return progress;
}

/** Migrates only known, unambiguous local schemas. Never guesses an exercise year. */
export function migrateState(candidate) {
  if (!isRecord(candidate)) throw new Error("state is not an object");
  const version = candidate.schemaVersion;
  if (version === undefined && isRecord(candidate.progress)) {
    // The first year-keyed store did not persist a schema version.
    return {
      ...candidate,
      schemaVersion: CURRENT_SCHEMA_VERSION,
      sessionMode: "bac",
      reviewMode: false,
      sessionStatus: candidate.sessionActive === true ? "active" : "idle"
    };
  }
  if (version === 1 || version === 2 || version === 3) {
    return {
      ...candidate,
      schemaVersion: CURRENT_SCHEMA_VERSION,
      sessionMode: SESSION_MODES.includes(normalizeSessionMode(candidate.sessionMode))
        ? normalizeSessionMode(candidate.sessionMode)
        : "bac",
      reviewMode: candidate.reviewMode === true,
      sessionStatus: candidate.sessionActive === true ? "active" : candidate.sessionStatus || "idle"
    };
  }
  if (version === 4) {
    // v4 → v5 : convert legacy bac-reading-mode keys BAC-S?-E? qui étaient
    // stockés dans officialTaskAnswers (ancien bug #73) en freeAnswer concaténé.
    // Ces clés étaient rejetées par le TASK_ID_PATTERN strict et donc perdues
    // au rechargement ; on les récupère pour ne pas détruire le travail
    // d'élèves ayant utilisé le mode lecture pendant la période buggée.
    const out = { ...candidate, schemaVersion: CURRENT_SCHEMA_VERSION };
    if (isRecord(out.progress)) {
      out.progress = Object.fromEntries(
        Object.entries(out.progress).map(([yearId, subjects]) => {
          if (!YEAR_ID_PATTERN.test(yearId) || !isRecord(subjects)) return [yearId, subjects];
          return [
            yearId,
            Object.fromEntries(
              Object.entries(subjects).map(([sujetId, exercises]) => {
                if (!/^[1-9]\d*$/.test(sujetId) || !isRecord(exercises)) return [sujetId, exercises];
                return [
                  sujetId,
                  Object.fromEntries(
                    Object.entries(exercises).map(([exId, ex]) => {
                      if (!/^[1-9]\d*$/.test(exId) || !isRecord(ex)) return [exId, ex];
                      const legacyPattern = /^BAC-S\d+-E\d+$/;
                      const legacy = [];
                      const official = {};
                      const raw = isRecord(ex.officialTaskAnswers) ? ex.officialTaskAnswers : {};
                      for (const [k, v] of Object.entries(raw)) {
                        if (legacyPattern.test(k) && typeof v === "string" && v.trim()) {
                          legacy.push(v.trim());
                        } else if (
                          /^\d{4}(?:-[a-z]{1,3})?-S\d+-E\d+-Q\d+$/.test(k) &&
                          typeof v === "string"
                        ) {
                          official[k] = v;
                        }
                      }
                      if (!legacy.length) return [exId, ex];
                      const existing = typeof ex.freeAnswer === "string" ? ex.freeAnswer : "";
                      const merged = legacy.join("\n\n");
                      const freeAnswer =
                        existing && !existing.includes(merged)
                          ? existing + "\n\n" + merged
                          : existing || merged;
                      return [
                        exId,
                        {
                          ...ex,
                          officialTaskAnswers: official,
                          freeAnswer: freeAnswer.slice(0, MAX_PERSISTED_TEXT)
                        }
                      ];
                    })
                  )
                ];
              })
            )
          ];
        })
      );
    }
    return out;
  }
  if (version === CURRENT_SCHEMA_VERSION) return candidate;
  if (typeof version === "number" && version > CURRENT_SCHEMA_VERSION) {
    throw new Error(`unsupported future schema ${version}`);
  }
  throw new Error(`unsupported schema ${String(version)}`);
}

function sanitizeDrill(value) {
  const raw = isRecord(value) ? value : {};
  return {
    streak: asFiniteNumber(raw.streak, 0, 0, 999),
    best: asFiniteNumber(raw.best, 0, 0, 999),
    rounds: asFiniteNumber(raw.rounds, 0, 0, 100000),
    unlocked: raw.unlocked === true
  };
}

/** Whitelist and normalize persisted values; never shallow-merge untrusted storage. */
export function validateState(candidate) {
  if (!isRecord(candidate) || candidate.schemaVersion !== CURRENT_SCHEMA_VERSION) {
    throw new Error("invalid schema version");
  }
  const state = defaultState();
  state.activeScreen = SCREENS.has(candidate.activeScreen) ? candidate.activeScreen : state.activeScreen;
  state.sessionStatus = SESSION_STATUSES.has(candidate.sessionStatus)
    ? candidate.sessionStatus
    : candidate.sessionActive === true
      ? "active"
      : "idle";
  state.sessionActive = state.sessionStatus === "active";
  state.sessionStartedAt = asFiniteNumber(candidate.sessionStartedAt, null, 0);
  state.sessionCompletedAt = asFiniteNumber(candidate.sessionCompletedAt, null, 0);
  state.sessionEndReason = ["manual", "time-expired", "left"].includes(candidate.sessionEndReason)
    ? candidate.sessionEndReason
    : null;
  const requestedMode = normalizeSessionMode(candidate.sessionMode);
  state.sessionMode = SESSION_MODES.includes(requestedMode) ? requestedMode : "bac";
  state.reviewMode = candidate.reviewMode === true || state.sessionStatus === "completed";
  state.yearId = isCatalogYear(candidate.yearId) ? candidate.yearId : state.yearId;
  state.sujetId = asFiniteNumber(candidate.sujetId, state.sujetId, 1, 9);
  state.activeExercise = asFiniteNumber(candidate.activeExercise, state.activeExercise, 1, 9);
  state.activeStep = asFiniteNumber(candidate.activeStep, state.activeStep, 1, 4);
  // La durée maths vient du catalogue (EXAM_MINUTES_BY_STREAM.m) et non d'un
  // 150 recopié ici : une surcharge par année ne peut plus faire diverger les deux.
  const inferredDuration = state.yearId.endsWith("-m") ? EXAM_MINUTES_BY_STREAM.m * 60 : state.globalDuration;
  state.globalDuration = asFiniteNumber(candidate.globalDuration, inferredDuration, 60, 24 * 60 * 60);
  state.globalRemaining = asFiniteNumber(
    candidate.globalRemaining,
    state.globalDuration,
    0,
    state.globalDuration
  );
  state.globalLastTick = asFiniteNumber(candidate.globalLastTick, null, 0);
  state.strategyDuration = asFiniteNumber(
    candidate.strategyDuration,
    state.strategyDuration || 25 * 60,
    0,
    60 * 60
  );
  state.strategyRemaining = asFiniteNumber(
    candidate.strategyRemaining,
    state.strategyRemaining,
    0,
    state.strategyDuration
  );
  state.strategyLastTick = asFiniteNumber(candidate.strategyLastTick, null, 0);
  state.strategyRunning = candidate.strategyRunning === true;
  state.progress = sanitizeProgress(candidate.progress);
  state.drill = sanitizeDrill(candidate.drill);
  return state;
}

function backupMalformed(raw) {
  try {
    localStorage.setItem(`${KEY}.corrupt-${Date.now()}`, raw);
  } catch (error) {
    reportDiagnostic("store.backup-malformed", error);
  }
}

export const store = {
  state: defaultState(),
  loaded: false,

  load() {
    this.state = defaultState();
    // Bug #B5 : si KEY est corrompu (JSON invalide), on ne tente pas le
    // LEGACY_KEY et l'élève perd l'accès à un état restaurable. On factorise
    // désormais la restauration en helper qui tente chaque clé
    // indépendamment.
    const tryRestoreFromKey = (keyName, out) => {
      const raw = localStorage.getItem(keyName);
      if (!raw) return false;
      try {
        out.state = validateState(migrateState(JSON.parse(raw)));
        if (keyName !== KEY) localStorage.removeItem(keyName);
        out.save();
        return true;
      } catch (error) {
        reportDiagnostic(`store.load-invalid-${keyName === LEGACY_KEY ? "legacy-" : ""}state`, error);
        backupMalformed(raw);
        return false;
      }
    };
    try {
      if (tryRestoreFromKey(KEY, this)) {
        /* restored */
      } else if (!tryRestoreFromKey(LEGACY_KEY, this)) {
        const ambiguous = localStorage.getItem(AMBIGUOUS_LEGACY_KEY);
        if (ambiguous) {
          // v2 had no year in exercise keys. Keeping it is safer than a false migration.
          localStorage.setItem(`${AMBIGUOUS_LEGACY_KEY}.legacy-unmigrated`, ambiguous);
          localStorage.removeItem(AMBIGUOUS_LEGACY_KEY);
        }
      }
    } catch (error) {
      reportDiagnostic("store.load-unavailable", error);
      /* Storage unavailable: retain a safe default state. */
    }
    this.loaded = true;
    this._reconcileTimers();
    this.save();
    return this.state;
  },

  save() {
    try {
      this.state.schemaVersion = CURRENT_SCHEMA_VERSION;
      localStorage.setItem(KEY, JSON.stringify(this.state));
    } catch (error) {
      reportDiagnostic("store.save", error);
    }
  },

  reset() {
    try {
      localStorage.removeItem(KEY);
    } catch (error) {
      reportDiagnostic("store.reset", error);
    }
    this.state = defaultState();
    this.save();
  },

  _reconcileTimers() {
    const now = Date.now();
    if (this.state.sessionActive && this.state.globalLastTick) {
      const elapsed = Math.max(0, Math.floor((now - this.state.globalLastTick) / 1000));
      this.state.globalRemaining = Math.max(0, this.state.globalRemaining - elapsed);
      this.state.globalLastTick = now;
      if (this.state.globalRemaining === 0) this._complete("time-expired", now);
    }
    if (this.state.strategyRunning && this.state.strategyLastTick) {
      const elapsed = Math.max(0, Math.floor((now - this.state.strategyLastTick) / 1000));
      this.state.strategyRemaining = Math.max(0, this.state.strategyRemaining - elapsed);
      this.state.strategyLastTick = now;
      if (this.state.strategyRemaining === 0) {
        this.state.strategyRunning = false;
        this.state.strategyLastTick = null;
      }
    }
  },

  _complete(reason, completedAt = Date.now()) {
    this.state.sessionStatus = "completed";
    this.state.sessionActive = false;
    this.state.sessionCompletedAt = completedAt;
    this.state.sessionEndReason = reason;
    this.state.reviewMode = true;
    this.state.globalLastTick = null;
    this.state.strategyRunning = false;
    this.state.strategyLastTick = null;
  },

  tickGlobal(seconds) {
    this.state.globalRemaining = Math.max(0, this.state.globalRemaining - seconds);
    this.state.globalLastTick = Date.now();
    if (this.state.globalRemaining === 0) this._complete("time-expired");
  },
  tickStrategy(seconds) {
    this.state.strategyRemaining = Math.max(0, this.state.strategyRemaining - seconds);
    this.state.strategyLastTick = Date.now();
  },

  exercise(yearId, sujetId, exNum) {
    if (!yearId) throw new Error("yearId est requis pour isoler la progression BAC.");
    if (!isCatalogYear(yearId)) throw new Error(`yearId invalide: ${String(yearId)}`);
    // Bug #B7 : NaN ou chaînes passées en sujetId/exNum créaient des clés
    // fantômes (progress[yearId]["abc"][NaN]) non nettoyées par validateState.
    // On impose un entier borné ici aussi pour symétrie avec enterSession.
    if (!Number.isInteger(sujetId) || sujetId < 1 || sujetId > 9)
      throw new Error(`sujetId invalide: ${String(sujetId)}`);
    if (!Number.isInteger(exNum) || exNum < 1 || exNum > 9)
      throw new Error(`exNum invalide: ${String(exNum)}`);
    if (!this.state.progress[yearId]) this.state.progress[yearId] = {};
    if (!this.state.progress[yearId][sujetId]) this.state.progress[yearId][sujetId] = {};
    if (!this.state.progress[yearId][sujetId][exNum])
      this.state.progress[yearId][sujetId][exNum] = emptyExercise();
    return this.state.progress[yearId][sujetId][exNum];
  },

  enterSession(yearId, sujetId, durationSeconds = 270 * 60, strategySeconds = 25 * 60, options = {}) {
    // Bug #B2 (suite) : le contrôle de forme seul laissait passer une année
    // conforme au motif mais absente du catalogue — enterSession("9999")
    // ouvrait une session "active" et persistée que exercise(), validateState()
    // et loadYear() rejettent toutes les trois. On applique ici la même règle
    // que partout ailleurs : l'année doit être chargeable.
    if (!isCatalogYear(yearId)) throw new Error(`yearId invalide: ${String(yearId)}`);
    const duration = asFiniteNumber(durationSeconds, 270 * 60, 60, 24 * 60 * 60);
    const strategyDuration = asFiniteNumber(strategySeconds, 25 * 60, 0, 60 * 60);
    const requestedMode = normalizeSessionMode(options?.mode) || "bac";
    if (!SESSION_MODES.includes(requestedMode)) throw new Error(`mode de session invalide: ${requestedMode}`);
    const now = Date.now();
    this.state.yearId = yearId;
    this.state.sujetId = asFiniteNumber(sujetId, 1, 1, 9);
    this.state.activeExercise = 1;
    this.state.activeStep = 1;
    this.state.activeScreen = "view-guide";
    this.state.sessionStatus = "active";
    this.state.sessionActive = true;
    this.state.sessionStartedAt = now;
    this.state.sessionCompletedAt = null;
    this.state.sessionEndReason = null;
    this.state.sessionMode = requestedMode;
    this.state.reviewMode = false;
    this.state.globalDuration = duration;
    this.state.globalRemaining = duration;
    this.state.globalLastTick = now;
    this.state.strategyDuration = strategyDuration;
    this.state.strategyRemaining = strategyDuration;
    this.state.strategyLastTick = null;
    this.state.strategyRunning = false;
    this.save();
  },
  activateSubjectMode(sujetId, mode = "bac") {
    if (!this.isSessionActive()) return false;
    const requestedMode = normalizeSessionMode(mode);
    if (!SESSION_MODES.includes(requestedMode)) throw new Error(`mode de session invalide: ${String(mode)}`);
    this.state.sujetId = sujetId || 1;
    this.state.sessionMode = requestedMode;
    this.state.reviewMode = false;
    this.state.activeExercise = 1;
    this.state.activeStep = 1;
    this.state.activeScreen = "view-workspace";
    // Stratégie et respiration ont lieu avant le début de l'épreuve : le
    // chrono officiel repart donc de la durée complète du sujet.
    this.state.globalRemaining = this.state.globalDuration;
    this.state.globalLastTick = Date.now();
    this.save();
    return true;
  },
  finishSession(reason = "manual") {
    if (this.state.sessionStatus === "completed") return false;
    this._complete(reason === "time-expired" ? "time-expired" : "manual");
    this.save();
    return true;
  },
  leaveSession() {
    // Bug #B6 : leaveSession sans session active est un no-op strict. Avant le
    // fix, on inventait un sessionEndReason="left" et lastTick=null sur un état
    // déjà inactif, ce qui marquait faussement la session dans les exports.
    if (this.state.sessionActive === false && this.state.sessionStatus === "idle") {
      return false;
    }
    this.state.sessionStatus = "idle";
    this.state.sessionActive = false;
    this.state.sessionEndReason = "left";
    this.state.globalLastTick = null;
    this.state.strategyRunning = false;
    this.state.strategyLastTick = null;
    this.save();
    return true;
  },
  isSessionActive() {
    return this.state.sessionStatus === "active" && this.state.sessionActive === true;
  },
  setReviewMode(enabled) {
    if (enabled === true && this.isSessionActive()) {
      throw new Error("la relecture est interdite pendant une épreuve active");
    }
    this.state.reviewMode = enabled === true;
    this.save();
  },
  setActiveExercise(n) {
    // Bug #B36 : on rejette les entrées non-entières ou hors plage [1,9]
    // plutôt que d'écrire NaN ou "abc" dans store.state.activeExercise
    // (l'UI cliquait ensuite sur un sujet fantôme).
    if (Number.isInteger(n) && n >= 1 && n <= 9) {
      this.state.activeExercise = n;
      this.state.activeStep = 1;
      this.save();
    }
  },
  setActiveStep(step) {
    // Bug #B36 : idem pour activeStep, plage [1,4] (les 4 étapes de l'épreuve).
    if (Number.isInteger(step) && step >= 1 && step <= 4) {
      this.state.activeStep = step;
      this.save();
    }
  },
  setActiveScreen(screenId) {
    // Bug #B36 : whitelist SCREENS. Une URL malveillante ou une faute de
    // frappe ne doit pas pouvoir basculer l'application hors des écrans
    // connus (et donc potentiellement sur du DOM non défini).
    if (typeof screenId === "string" && SCREENS.has(screenId)) {
      this.state.activeScreen = screenId;
      this.save();
    }
  },

  /** Jauge du drill شحذ المفتاح : une round parfaite prolonge la série, sinon remise à zéro. */
  recordDrillRound(perfect) {
    const drill = this.state.drill;
    drill.streak = perfect === true ? drill.streak + 1 : 0;
    drill.best = Math.max(drill.best, drill.streak);
    drill.rounds += 1;
    this.save();
    return { ...drill };
  },

  unlockDrill() {
    this.state.drill.unlocked = true;
    this.save();
    return { ...this.state.drill };
  }
};

export const helpers = {
  fmt(seconds) {
    // Bug #B19 : fmt(undefined) ou fmt("abc") renvoyait "NaN:NaN" parce que
    // Math.floor(undefined / 3600) = NaN. On borne désormais à un entier
    // >= 0, floor appliqué APRÈS le clamp pour respecter la consigne
    // "ignore les fractions (floor)" du test B19.
    const num = Number(seconds);
    if (!Number.isFinite(num) || num < 0) {
      const fallback = Math.floor(0);
      return "00:00";
    }
    const total = Math.floor(num);
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    const p = (n) => String(n).padStart(2, "0");
    return h > 0 ? `${p(h)}:${p(m)}:${p(s)}` : `${p(m)}:${p(s)}`;
  }
};
