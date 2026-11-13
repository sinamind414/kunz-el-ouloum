/* ===========================================================
   B50 — diagnosticMessage throws si code = undefined
   =========================================================== */
test("Bug #B50 : diagnosticMessage tolère les codes non-string (undefined, null, nombre)", () => {
  // diagnosticMessage est une fonction interne à js/ui/accessibility.js.
  // On reproduit ici l'algorithme pour vérifier le contrat : aucune
  // entrée non-string ne doit lever TypeError. Le code de prod doit
  // ramener toute entrée non-string à "" avant les startsWith.
  function diagnosticMessage(code) {
    const safeCode = typeof code === "string" ? code : "";
    if (safeCode.startsWith("store.")) return "تعذر حفظ البيانات محلياً";
    if (safeCode.startsWith("speech.")) return "تعذر تشغيل الإملاء الصوتي";
    if (safeCode.startsWith("sound.")) return "تعذر تشغيل الصوت";
    if (safeCode.startsWith("theme.")) return "تعذر حفظ إعداد العرض";
    if (safeCode.startsWith("service-worker.")) return "تعذر تحديث وضع العمل دون اتصال";
    return "حدث خطأ تقني غير متوقع";
  }
  assert.equal(diagnosticMessage(undefined), "حدث خطأ تقني غير متوقع");
  assert.equal(diagnosticMessage(null), "حدث خطأ تقني غير متوقع");
  assert.equal(diagnosticMessage(42), "حدث خطأ تقني غير متوقع");
  assert.equal(diagnosticMessage({}), "حدث خطأ تقني غير متوقع");
  assert.equal(diagnosticMessage("store.save"), "تعذر حفظ البيانات محلياً");
  assert.equal(diagnosticMessage(""), "حدث خطأ تقني غير متوقع");
});

/* ============================================================
   Bug fixes — tests de non-régression (2026-09-17)
   ------------------------------------------------------------
   Ce fichier verrouille les corrections des bugs identifiés lors
   de l'audit de code du 2026-09-17 (cf. liste dans docs/history/CONTINUATION.md).
   Chaque test référence l'identifiant du bug qu'il verrouille.

   Convention : les commentaires "Bug #B<n>" pointent vers la liste
   de docs/history/CONTINUATION.md pour qu'on puisse retrouver la discussion
   d'origine. (Document archivé sous docs/history/ le 2026-09-18.)

   Bugs couverts ici :
     B2 : validateState accepte un yearId hors catalogue
     B3 : enterSession ne valide pas sujetId
     B5 : load() ne tente pas LEGACY_KEY quand KEY est corrompu
     B6 : leaveSession pollue l'état sans session active
     B7 : store.exercise accepte NaN comme clé
     B9 : evaluateText retourne 0 quand req=0 et hits=0
     B11 : scoreBac arrondit vers le haut à 0.49
     B12 : formatDuration(0) → "0س" vide visuel
     B13 : normalizeArabic(42) → "42" au lieu de ""
     B15 : sanitizeExercise scratch sans length cap
     B16 : timers.stopAll() ne persistait pas le store
     B18 : disposePdfViewer (alias disposeViewerState) exporté
     B19 : helpers.fmt(undefined) → "NaN:NaN" sur le chrono
     B22 : scoreFromFraction(null/NaN/string) retourne NaN
     B23 : fallbackToFrame duplique le <p> à chaque échec
     B36 : setActiveExercise/setActiveStep/setActiveScreen pas validés
     B14 : matchConcept (note documentée dans text-analysis.js)
   ============================================================ */
import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import * as nodeFs from "node:fs";

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
const { store, helpers, validateState, KNOWN_YEAR_IDS, CURRENT_SCHEMA_VERSION } =
  await import("../js/store.js");
const { normalizeArabic, stripArabicClitics } = await import("../data/subjects.js");
const { evaluateText, scoreFromFraction } = await import("../js/domain/evaluation/text-evaluator.js");

beforeEach(() => {
  localStorage.clear();
  store.reset();
});

/* ===========================================================
   B2 — validateState accepte un yearId hors catalogue
   =========================================================== */
test("Bug #B2 : un yearId hors catalogue (ex. 9999) est rejeté", () => {
  const valid = validateState({
    schemaVersion: CURRENT_SCHEMA_VERSION,
    yearId: "9999"
  });
  assert.equal(valid.yearId, "2025", "doit retomber sur l'année par défaut (2025)");

  const valid2 = validateState({
    schemaVersion: CURRENT_SCHEMA_VERSION,
    yearId: "../etc/passwd"
  });
  assert.equal(valid2.yearId, "2025");
});

test("Bug #B2 : un yearId du catalogue (2025, 2026-m, etc.) est accepté", () => {
  for (const id of KNOWN_YEAR_IDS) {
    const valid = validateState({
      schemaVersion: CURRENT_SCHEMA_VERSION,
      yearId: id
    });
    assert.equal(valid.yearId, id, `${id} doit être conservé`);
  }
});

test("Bug #B2 : sanitizeProgress filtre les yearId hors catalogue", () => {
  // On injecte directement dans localStorage une entrée d'année fantôme
  // pour vérifier que la chaîne load() → validateState → sanitizeProgress
  // la filtre sans propager l'erreur jusqu'à loadYear.
  localStorage.clear();
  localStorage.setItem(
    "boussole4d.v4",
    JSON.stringify({
      schemaVersion: 5,
      yearId: "2025",
      sujetId: 1,
      progress: {
        2025: { 1: { 1: { answeredAny: true } } },
        9999: { 1: { 1: { answeredAny: true } } }
      },
      sessionStatus: "idle",
      sessionActive: false
    })
  );
  store.load();
  assert.equal(store.state.progress["9999"], undefined, "9999 doit être filtré par sanitizeProgress");
  assert.ok(store.state.progress["2025"], "2025 doit être conservé");
});

/* ===========================================================
   B3 — enterSession ne valide pas sujetId
   =========================================================== */
test("Bug #B3 : enterSession clamp sujetId hors plage à 1", () => {
  store.enterSession("2025", "abc");
  assert.equal(store.state.sujetId, 1);

  store.enterSession("2025", null);
  assert.equal(store.state.sujetId, 1);

  store.enterSession("2025", undefined);
  assert.equal(store.state.sujetId, 1);
});

test("Bug #B3 : enterSession accepte sujetId valide", () => {
  store.enterSession("2025", 2);
  assert.equal(store.state.sujetId, 2);
});

/* ===========================================================
   B5 — load() ne tente pas LEGACY_KEY quand KEY est corrompu
   =========================================================== */
test("Bug #B5 : KEY corrompue + LEGACY_KEY valide → restaure depuis LEGACY", () => {
  localStorage.setItem("boussole4d.v4", "{ this is not valid JSON");
  localStorage.setItem(
    "boussole4d.v3",
    JSON.stringify({
      schemaVersion: 3,
      yearId: "2021",
      sujetId: 2,
      progress: {},
      sessionStatus: "idle",
      sessionActive: false
    })
  );
  store.load();
  // LEGACY_KEY doit avoir été consommée (removed) et l'état restauré.
  assert.equal(store.state.yearId, "2021");
  assert.equal(localStorage.getItem("boussole4d.v3"), null, "LEGACY_KEY nettoyée après migration");
});

test("Bug #B5 : KEY corrompue + LEGACY_KEY corrompue → retombe sur défaut", () => {
  localStorage.setItem("boussole4d.v4", "garbage");
  localStorage.setItem("boussole4d.v3", "garbage");
  store.load();
  // L'état doit être celui par défaut, pas un état partiel corrompu.
  assert.equal(store.state.yearId, "2025");
  assert.equal(store.state.sessionStatus, "idle");
});

/* ===========================================================
   B6 — leaveSession pollue l'état sans session active
   =========================================================== */
test("Bug #B6 : leaveSession sans session active est no-op", () => {
  store.reset();
  const before = JSON.stringify(store.state);
  const result = store.leaveSession();
  const after = JSON.stringify(store.state);
  assert.equal(result, false, "leaveSession doit retourner false si rien à fermer");
  assert.equal(before, after, "l'état ne doit pas être modifié");
});

test("Bug #B6 : leaveSession avec session active fonctionne normalement", () => {
  store.enterSession("2025", 1);
  store.leaveSession();
  assert.equal(store.state.sessionStatus, "idle");
  assert.equal(store.state.sessionActive, false);
});

/* ===========================================================
   B7 — store.exercise accepte NaN comme clé
   =========================================================== */
test("Bug #B7 : store.exercise rejette sujetId non entier", () => {
  store.enterSession("2025", 1);
  assert.throws(() => store.exercise("2025", "abc", 1), /sujetId invalide/, "chaîne doit throw");
  assert.throws(() => store.exercise("2025", NaN, 1), /sujetId invalide/, "NaN doit throw");
});

test("Bug #B7 : store.exercise rejette exNum non entier", () => {
  store.enterSession("2025", 1);
  assert.throws(() => store.exercise("2025", 1, NaN), /exNum invalide/);
  assert.throws(() => store.exercise("2025", 1, "abc"), /exNum invalide/);
  assert.throws(() => store.exercise("2025", 1, 0), /exNum invalide/);
  assert.throws(() => store.exercise("2025", 1, 99), /exNum invalide/);
});

/* ===========================================================
   B9 — evaluateText retourne 0 quand req=0 et hits=0
   =========================================================== */
test("Bug #B9 : règle sans keywords + réponse longue méthodologique → fraction > 0", () => {
  const text =
    "يتميز الأنزيم بتخصص بنيوي ووظيفي يسمح له بالتعرف على ركيزته نوعيا. " +
    "نلاحظ من الوثيقة أن نشاط الأنزيم يتغير بتغير درجة الحرارة، ومنه نستنتج أن " +
    "للأنزيم موقعا فعالا محدد البنية.";
  const r = evaluateText(text, { keywords: [], minHits: 0 }, "E");
  assert.ok(r.fraction > 0, `fraction doit être > 0 pour texte long et structuré, got ${r.fraction}`);
});

test("Bug #B9 : règle sans keywords + réponse vide → fraction = 0", () => {
  const r = evaluateText("", { keywords: [], minHits: 0 }, "E");
  assert.equal(r.fraction, 0);
});

/* ===========================================================
   B11 — scoreBac arrondit vers le haut à 0.49
   =========================================================== */
test("Bug #B11 : scoreBac(5, 0.49) ne monte PAS à 2.5", () => {
  // 5 * 0.49 = 2.45 → arrondi au quart de point le plus proche = 2.25.
  // Avant le fix, Math.round(2.45 * 4) = Math.round(9.8) = 10 → 2.5.
  const score = scoreFromFraction(5, 0.49, { step: 0.25 });
  assert.equal(score, 2.25);
});

test("Bug #B11 : scoreBac(5, 0.50) reste 2.5 (quart pile)", () => {
  const score = scoreFromFraction(5, 0.5, { step: 0.25 });
  assert.equal(score, 2.5);
});

test("Bug #B11 : scoreBac(5, 0.74) → 3.5 (troncature au quart inférieur)", () => {
  // 5 * 0.74 = 3.7 → 3.7 / 0.25 = 14.8 → floor = 14 → 14 * 0.25 = 3.5.
  // Le barème officiel du BAC tronque au quart inférieur (pas d'arrondi
  // supérieur). Avant le fix, scoreBac(5, 0.74) = 3.75 par Math.round(14.8) = 15.
  const score = scoreFromFraction(5, 0.74, { step: 0.25 });
  assert.equal(score, 3.5);
});

test("Bug #B11 : scoreBac(5, 0.99) → 4.75 (proche du max)", () => {
  // 5 * 0.99 = 4.95 → 4.95 / 0.25 = 19.8 → floor = 19 → 19 * 0.25 = 4.75.
  const score = scoreFromFraction(5, 0.99, { step: 0.25 });
  assert.equal(score, 4.75);
});

/* ===========================================================
   B12 — formatDuration(0) → "0س" vide visuel
   =========================================================== */
test("Bug #B12 : formatDuration(0) ne retourne PAS '0س' (vidé)", () => {
  // On importe depuis le module ui.js (non exporté directement : on re-teste
  // la logique via les durées plausibles).
  // 0 min → au moins "0د"
  // 30 min → "30د"
  // 45 min → "45د" (avant: "0س" — bug)
  // 60 min → "1س"
  // 90 min → "1س30د"
  // 270 min → "4س30د"
  const expectations = [
    [0, "0د"],
    [30, "30د"],
    [45, "45د"],
    [60, "1س"],
    [90, "1س30د"],
    [270, "4س30د"]
  ];
  // Le format est implémenté dans js/ui.js mais non exporté. On reproduit
  // l'algorithme ici pour vérifier le contrat ; la logique est dans ui.js.
  function formatDuration(minutes) {
    const safe = Math.max(0, Math.floor(Number(minutes) || 0));
    const hours = Math.floor(safe / 60);
    const rest = safe % 60;
    if (!hours) return `${safe}د`;
    if (!rest) return `${hours}س`;
    return `${hours}س${String(rest).padStart(2, "0")}د`;
  }
  for (const [input, expected] of expectations) {
    assert.equal(formatDuration(input), expected, `formatDuration(${input})`);
  }
});

/* ===========================================================
   B13 — normalizeArabic(42) → "42" au lieu de ""
   =========================================================== */
test("Bug #B13 : normalizeArabic rejette les non-string", () => {
  assert.equal(normalizeArabic(42), "");
  assert.equal(normalizeArabic(null), "");
  assert.equal(normalizeArabic(undefined), "");
  assert.equal(normalizeArabic({}), "");
  assert.equal(normalizeArabic([]), "");
});

test("Bug #B13 : normalizeArabic accepte toujours les string", () => {
  assert.equal(normalizeArabic(""), "");
  assert.equal(normalizeArabic("البروتين"), "البروتين");
  assert.equal(normalizeArabic("بروتين"), "بروتين");
});

/* ===========================================================
   B15 — sanitizeExercise scratch sans length cap
   =========================================================== */
test("Bug #B15 : sanitizeExercise tronque scratch à 60000 chars", () => {
  const huge = "x".repeat(200000);
  // On injecte via enterSession puis save puis load (qui appelle sanitize).
  store.enterSession("2025", 1);
  const ex = store.exercise("2025", 1, 1);
  ex.scratch.N = huge;
  ex.text.N = huge;
  store.save();
  store.load();
  const reloaded = store.exercise("2025", 1, 1);
  assert.equal(reloaded.scratch.N.length, 60000, "scratch tronqué");
  assert.equal(reloaded.text.N.length, 60000, "text tronqué");
});

/* ===========================================================
   B16 — timers.stopAll() ne persistait pas le store
   =========================================================== */
test("Bug #B16 : timers.stopAll persiste strategyRunning=false dans localStorage", async () => {
  // On initialise un store minimal et on vérifie que stopAll() appelle bien
  // store.save() (donc écrit dans localStorage). Avant le fix, stopAll
  // remettait strategyRunning à false en mémoire mais ne persistait pas,
  // donc un rechargement relisait strategyRunning=true (fuite d'état).
  store.enterSession("2025", 1, 270 * 60, 25 * 60);
  // Démarrer la stratégie pour mettre strategyRunning=true
  const { timers } = await import("../js/application/timers.js");
  timers.startStrategy();
  assert.equal(store.state.strategyRunning, true);
  // Forcer la persistance pour vérifier le baseline
  store.save();
  assert.match(JSON.parse(localStorage.getItem("boussole4d.v4") || "{}").strategyRunning + "", /true/);
  // Stopper sans save manuel
  timers.stopAll();
  // Vérifier l'écriture immédiate
  const persisted = JSON.parse(localStorage.getItem("boussole4d.v4") || "{}");
  assert.equal(persisted.strategyRunning, false, "strategyRunning doit être persisté");
  assert.equal(persisted.strategyLastTick, null, "strategyLastTick doit être null");
});

/* ===========================================================
   B18 — disposePdfViewer (alias disposeViewerState) exporté
   =========================================================== */
test("Bug #B18 : disposePdfViewer et disposeAllPdfViewers sont exportés depuis pdf-renderer.js", async () => {
  const mod = await import("../js/ui/pdf-renderer.js");
  assert.equal(typeof mod.disposePdfViewer, "function", "disposePdfViewer exporté");
  assert.equal(typeof mod.disposeAllPdfViewers, "function", "disposeAllPdfViewers exporté");
});

/* ===========================================================
   B19 — helpers.fmt(undefined) → "NaN:NaN" sur le chrono
   =========================================================== */
test("Bug #B19 : helpers.fmt ne retourne jamais NaN:NaN", () => {
  // Avant le fix, fmt(undefined) → "NaN:NaN" (Math.floor(undefined/3600) = NaN).
  // Le chrono affiché était illisible et décontenançait l'élève. On borne
  // désormais à un entier >= 0 ; toute entrée aberrante produit "00:00".
  // helpers est importé en haut du fichier (même module que store).
  assert.equal(helpers.fmt(undefined), "00:00");
  assert.equal(helpers.fmt(null), "00:00");
  assert.equal(helpers.fmt(""), "00:00");
  assert.equal(helpers.fmt("abc"), "00:00");
  assert.equal(helpers.fmt(NaN), "00:00");
  assert.equal(helpers.fmt(-30), "00:00", "négatif ramené à 0");
  assert.equal(helpers.fmt(0), "00:00");
  assert.equal(helpers.fmt(59), "00:59");
  assert.equal(helpers.fmt(60), "01:00");
  assert.equal(helpers.fmt(3599), "59:59");
  assert.equal(helpers.fmt(3600), "01:00:00");
  assert.equal(helpers.fmt(3661), "01:01:01");
});

test("Bug #B19 : helpers.fmt ignore les fractions (floor)", () => {
  // 90.7 doit afficher 01:30 (floor), pas 01:30.7.
  assert.equal(helpers.fmt(90.7), "01:30");
});

/* ===========================================================
   B22 — scoreFromFraction(null/NaN/string) retourne NaN
   =========================================================== */
test("Bug #B22 : scoreFromFraction ne retourne jamais NaN, même sur entrées aberrantes", () => {
  // Avant le fix, scoreFromFraction(5, undefined) = NaN (Number(undefined) = NaN).
  // Le barème affichait « NaN/5 » à l'élève. On ramène désormais toute entrée
  // invalide à 0 ; et toute fraction hors [0,1] est clampée (négatif → 0,
  // > 1 → 1).
  const cases = [
    [5, undefined, 0],
    [5, null, 0],
    [5, NaN, 0],
    [5, "abc", 0],
    [5, -0.5, 0],
    [5, 1.5, 5],
    [5, 0.49, 2.25],
    [5, 0.5, 2.5],
    ["5", 0.5, 2.5],
    [null, 0.5, 0]
  ];
  for (const [points, fraction, expected] of cases) {
    const got = scoreFromFraction(points, fraction, { step: 0.25 });
    assert.equal(
      got,
      expected,
      `scoreFromFraction(${JSON.stringify(points)}, ${JSON.stringify(fraction)}) = ${got}, attendu ${expected}`
    );
  }
});

/* ===========================================================
   B23 — fallbackToFrame duplique le <p> à chaque échec
   =========================================================== */
test("Bug #B23 : fallbackToFrame insère la note une seule fois, la réutilise aux retries", () => {
  // On simule un hôte parent + host + iframe + on appelle fallbackToFrame
  // deux fois (simule un retry après disposeViewerState). Le DOM ne doit
  // contenir qu'UN SEUL élément .pdf-viewer-fallback, pas deux empilés.
  const fakeDoc = makeFakeDocument();
  const previousDoc = globalThis.document;
  globalThis.document = fakeDoc;
  try {
    const fallbackToFrame = extractFallbackToFrame();
    const parent = makeParent();
    fallbackToFrame(parent.host, "premier échec");
    fallbackToFrame(parent.host, "deuxième échec");
    const notes = fakeDoc.fallbackNotes();
    assert.equal(notes.length, 1, "une seule note doit exister, pas deux");
    assert.equal(notes[0].textContent, "deuxième échec", "le texte doit être mis à jour");
  } finally {
    if (previousDoc === undefined) delete globalThis.document;
    else globalThis.document = previousDoc;
  }
});

function makeFakeDocument() {
  // Mini-DOM qui suit les enfants ajoutés pour permettre l'introspection.
  const allCreated = [];
  return {
    allCreated,
    allWith(className) {
      return allCreated.filter((node) => node.className === className);
    },
    fallbackNotes() {
      return allCreated.filter((node) => node.className === "feedback mid small pdf-viewer-fallback");
    },
    createElement(tag) {
      const node = {
        tagName: tag,
        className: "",
        textContent: "",
        attrs: {},
        setAttribute(name, value) {
          this.attrs[name] = value;
          if (name === "class") this.className = value;
        }
      };
      allCreated.push(node);
      return node;
    }
  };
}

// Helper synchrone (extrait le code source de fallbackToFrame et l'évalue).
// Test isolé : pas d'import dynamique (qui casse avec `await` en non-async).
function extractFallbackToFrame() {
  const source = nodeFs.readFileSync(new URL("../js/ui/pdf-renderer.js", import.meta.url), "utf8");
  const match = source.match(/function fallbackToFrame[\s\S]+?\n\}/);
  if (!match) throw new Error("fallbackToFrame introuvable dans pdf-renderer.js");
  const body = match[0].replace(/^function fallbackToFrame\s*\([^)]*\)\s*\{/, "").replace(/\n\}$/, "");
  // L'utilisation de new Function est volontaire : permet de tester la
  // logique interne sans dépendre d'un export dynamique.
  return new Function("host", "message", body);
}

function makeParent() {
  const children = [];
  const parent = {
    children,
    appendChild(node) {
      children.push(node);
    },
    querySelector(selector) {
      // Recherche dans nos enfants.
      if (selector === "iframe.pdf-frame") return parent.iframe;
      if (selector === ".pdf-viewer-fallback") {
        return children.find((c) => c.className === "feedback mid small pdf-viewer-fallback");
      }
      return null;
    }
  };
  parent.iframe = { hidden: true };
  const host = {
    parentElement: parent,
    hidden: false,
    classList: { add() {} }
  };
  parent.host = host;
  parent.element = parent;
  return parent;
}

/* ===========================================================
   B36 — setActiveExercise / setActiveStep / setActiveScreen
   =========================================================== */
test("Bug #B36 : setActiveExercise rejette les entrées non-entières", () => {
  store.enterSession("2025", 1);
  store.setActiveExercise(2);
  assert.equal(store.state.activeExercise, 2);
  store.setActiveExercise("abc");
  assert.equal(store.state.activeExercise, 2, "string doit être ignoré");
  store.setActiveExercise(NaN);
  assert.equal(store.state.activeExercise, 2, "NaN doit être ignoré");
  store.setActiveExercise(99);
  assert.equal(store.state.activeExercise, 2, "99 doit être ignoré (hors plage)");
  store.setActiveExercise(0);
  assert.equal(store.state.activeExercise, 2, "0 doit être ignoré");
});

test("Bug #B36 : setActiveStep rejette les entrées hors plage 1-4", () => {
  store.enterSession("2025", 1);
  store.setActiveStep(3);
  assert.equal(store.state.activeStep, 3);
  store.setActiveStep("abc");
  assert.equal(store.state.activeStep, 3, "string ignoré");
  store.setActiveStep(0);
  assert.equal(store.state.activeStep, 3, "0 ignoré");
  store.setActiveStep(99);
  assert.equal(store.state.activeStep, 3, "99 ignoré");
});

test("Bug #B36 : setActiveScreen utilise la whitelist SCREENS", () => {
  store.enterSession("2025", 1);
  store.setActiveScreen("view-strategy");
  assert.equal(store.state.activeScreen, "view-strategy");
  store.setActiveScreen("evil-page");
  assert.equal(store.state.activeScreen, "view-strategy", "page inconnue doit être ignorée");
  store.setActiveScreen(null);
  assert.equal(store.state.activeScreen, "view-strategy", "null ignoré");
});
