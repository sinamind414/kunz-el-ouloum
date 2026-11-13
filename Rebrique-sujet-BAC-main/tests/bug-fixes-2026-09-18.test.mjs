/* ============================================================
   Régressions de l'audit du 2026-09-18 — lot 1 (bloquants store)
   ------------------------------------------------------------
   Couvert ici :
     D2 : KNOWN_YEAR_IDS tenu à la main avait dérivé de YEAR_CATALOG
          (2013-m…2020-m déclarés, aucun chargeur → RangeError)
     D3 : enterSession validait la FORME du yearId, pas son existence
          (enterSession("9999") ouvrait une session active persistée)
     D4 : scratch.free était le seul champ texte non borné de
          sanitizeExercise (5 000 000 caractères traversaient la
          sanitisation alors que ses voisins étaient plafonnés)
     D4bis : officialTaskAnswers — mêmes valeurs non bornées ; c'est là
          que persistAnswers() écrit la réponse de l'élève en épreuve
   ============================================================ */
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
const {
  store,
  validateState,
  KNOWN_YEAR_IDS,
  MAX_PERSISTED_TEXT,
  MAX_PERSISTED_KEYS,
  MAX_SUBJECT_ID,
  MAX_EXERCISE_ID,
  CURRENT_SCHEMA_VERSION
} = await import("../js/store.js");
const { YEAR_CATALOG, loadYear } = await import("../data/subjects.js");

beforeEach(() => {
  localStorage.clear();
  store.reset();
});

/* ===========================================================
   D2 — KNOWN_YEAR_IDS doit dériver du catalogue, pas le recopier
   =========================================================== */
test("D2 : KNOWN_YEAR_IDS contient exactement les ids de YEAR_CATALOG", () => {
  const catalogue = YEAR_CATALOG.map((entry) => entry.id);
  assert.equal(
    KNOWN_YEAR_IDS.size,
    new Set(catalogue).size,
    "la liste blanche ne doit ni ajouter ni retirer d'année au catalogue"
  );
  for (const id of catalogue) {
    assert.ok(KNOWN_YEAR_IDS.has(id), `${id} est au catalogue mais absent de KNOWN_YEAR_IDS`);
  }
  for (const id of KNOWN_YEAR_IDS) {
    assert.ok(catalogue.includes(id), `${id} est dans KNOWN_YEAR_IDS mais pas au catalogue`);
  }
});

test("D2 : les huit années maths 2013–2020 ont aujourd'hui un payload réel", async () => {
  /* C'étaient les huit fantômes de l'audit du 2026-09-18 : des ids déclarés
     dans YEAR_CATALOG sans aucun chargeur, acceptés par isCatalogYear() puis
     refusés par loadYear() en cours de route.
     Elles ont reçu le 2026-09-19 une armature « copie libre », puis le
     2026-09-20 une structuration 4D complète pour 2013–2015 (extraction OCR
     des scans officiels — scripts/ocr-extract-sujets.mjs) : le contrat de la
     régression reste le même — une année déclarée doit se charger —, et le
     contenu est désormais encodé (consignes, pôles, barème mesuré). */
  const ghosts = ["2013-m", "2014-m", "2015-m"];
  for (const id of ghosts) {
    assert.ok(KNOWN_YEAR_IDS.has(id), `${id} est au catalogue`);
  }
  const years = await Promise.all(ghosts.map((id) => loadYear(id)));
  for (const year of years) {
    assert.notEqual(year.answerMode, "free", `${year.id} est structurée en 4D, plus une armature`);
    assert.equal(year.sujets.length, 2, `${year.id} doit avoir 2 sujets`);
    for (const sujet of year.sujets) {
      for (const exercise of sujet.exercises) {
        assert.ok(
          (Number(exercise.max) || 0) > 0,
          `${year.id}/S${sujet.id}/E${exercise.number} : barème mesuré`
        );
        for (const pole of ["N", "S", "E", "W"]) {
          assert.ok(exercise.poles[pole], `${year.id}/S${sujet.id}/E${exercise.number} sans pôle ${pole}`);
        }
      }
    }
  }
});

test("D2 : toute année de KNOWN_YEAR_IDS est réellement chargeable", async () => {
  // Le contrat du store : une année qu'il accepte doit avoir un payload.
  // Avant le fix, 2013-m…2020-m passaient isCatalogYear() puis loadYear()
  // levait RangeError.
  const results = await Promise.allSettled([...KNOWN_YEAR_IDS].map((id) => loadYear(id)));
  const rejected = results
    .map((result, index) => ({ result, id: [...KNOWN_YEAR_IDS][index] }))
    .filter(({ result }) => result.status === "rejected");
  assert.deepEqual(
    rejected.map(({ id, result }) => `${id}: ${result.reason?.message}`),
    [],
    "aucune année acceptée par le store ne doit être sans payload"
  );
});

test("D2 : validateState conserve toute année du catalogue et rejette le reste", () => {
  for (const id of KNOWN_YEAR_IDS) {
    const valid = validateState({ schemaVersion: CURRENT_SCHEMA_VERSION, yearId: id });
    assert.equal(valid.yearId, id, `${id} doit être conservé`);
  }
  for (const id of ["9999", "1999-m", "../etc/passwd", ""]) {
    const valid = validateState({ schemaVersion: CURRENT_SCHEMA_VERSION, yearId: id });
    assert.equal(valid.yearId, "2025", `${id} doit retomber sur l'année par défaut`);
  }
});

/* ===========================================================
   D3 — enterSession doit exiger une année chargeable
   =========================================================== */
test("D3 : enterSession rejette une année conforme au motif mais hors catalogue", () => {
  assert.throws(() => store.enterSession("9999", 1), /yearId invalide/, "9999 doit être refusé");
  assert.equal(store.state.sessionStatus, "idle", "aucune session ne doit être ouverte");
  assert.equal(store.state.yearId, "2025", "l'année par défaut ne doit pas être écrasée");
});

test("D3 : enterSession ouvre les huit armatures maths 2013–2020", () => {
  /* Même contrat qu'en 2026-09-18 : enterSession n'ouvre que des années
     réellement chargeables. La différence, c'est qu'elles le sont devenues. */
  for (const id of ["2013-m", "2016-m", "2020-m"]) {
    localStorage.clear();
    store.reset();
    store.enterSession(id, 1);
    assert.equal(store.state.yearId, id, `${id} doit ouvrir une session`);
    assert.equal(store.state.sessionStatus, "active");
  }
});

test("D3 : enterSession refuse un yearId non-string", () => {
  for (const id of [undefined, null, 2025, {}, ["2025"]]) {
    assert.throws(() => store.enterSession(id, 1), /yearId invalide/, `${String(id)} doit être refusé`);
  }
});

test("D3 : enterSession accepte toute année du catalogue", () => {
  for (const id of KNOWN_YEAR_IDS) {
    localStorage.clear();
    store.reset();
    store.enterSession(id, 1);
    assert.equal(store.state.yearId, id, `${id} doit ouvrir une session`);
    assert.equal(store.state.sessionStatus, "active");
  }
});

/* ===========================================================
   D4 — tous les champs texte persistés sont bornés
   =========================================================== */
const OVERSIZE = "x".repeat(MAX_PERSISTED_TEXT * 5);

test("D4 : sanitizeExercise tronque scratch.free comme ses voisins", () => {
  store.enterSession("2025", 1);
  const exercise = store.exercise("2025", 1, 1);
  exercise.scratch.free = OVERSIZE;
  exercise.scratch.N = OVERSIZE;
  exercise.text.N = OVERSIZE;
  exercise.freeAnswer = OVERSIZE;
  store.save();
  store.load();

  const reloaded = store.exercise("2025", 1, 1);
  assert.equal(reloaded.scratch.free.length, MAX_PERSISTED_TEXT, "scratch.free doit être borné");
  assert.equal(reloaded.scratch.N.length, MAX_PERSISTED_TEXT, "scratch.N doit être borné");
  assert.equal(reloaded.text.N.length, MAX_PERSISTED_TEXT, "text.N doit être borné");
  assert.equal(reloaded.freeAnswer.length, MAX_PERSISTED_TEXT, "freeAnswer doit être borné");
});

test("D4bis : officialTaskAnswers est borné à la même limite", () => {
  store.enterSession("2025", 1);
  const exercise = store.exercise("2025", 1, 1);
  exercise.officialTaskAnswers["2025-S1-E1-Q1"] = OVERSIZE;
  store.save();
  store.load();

  const reloaded = store.exercise("2025", 1, 1);
  assert.equal(
    reloaded.officialTaskAnswers["2025-S1-E1-Q1"].length,
    MAX_PERSISTED_TEXT,
    "la réponse de l'élève doit être bornée"
  );
});

test("D4 : la taille totale persistée d'un exercice reste bornée", () => {
  store.enterSession("2025", 1);
  const exercise = store.exercise("2025", 1, 1);
  for (const pole of ["N", "S", "E", "W"]) {
    exercise.text[pole] = OVERSIZE;
    exercise.scratch[pole] = OVERSIZE;
  }
  exercise.scratch.free = OVERSIZE;
  exercise.freeAnswer = OVERSIZE;
  exercise.officialTaskAnswers["2025-S1-E1-Q1"] = OVERSIZE;
  store.save();
  store.load();

  const reloaded = store.exercise("2025", 1, 1);
  const persisted =
    ["N", "S", "E", "W"].reduce(
      (total, pole) => total + reloaded.text[pole].length + reloaded.scratch[pole].length,
      0
    ) +
    reloaded.scratch.free.length +
    reloaded.freeAnswer.length +
    reloaded.officialTaskAnswers["2025-S1-E1-Q1"].length;
  // 4 pôles x (text + scratch) + scratch.free + freeAnswer + 1 tâche officielle.
  assert.equal(persisted, MAX_PERSISTED_TEXT * 11);
});

test("D4 : MAX_PERSISTED_TEXT est la seule borne exportée", () => {
  assert.equal(typeof MAX_PERSISTED_TEXT, "number");
  assert.ok(MAX_PERSISTED_TEXT > 0);
  assert.equal(MAX_PERSISTED_TEXT, 60000, "la borne historique ne doit pas changer silencieusement");
});

/* ===========================================================
   D4ter — la sanitisation bornait les VALEURS, pas le NOMBRE d'entrées.
   Plafonner 60 000 caractères ne sert à rien si un localStorage corrompu
   peut en aligner un nombre illimité.
   =========================================================== */
test("D4ter : les valeurs de fields sont bornées comme les autres champs texte", () => {
  const exercise = store.exercise("2025", 1, 1);
  exercise.fields["cle"] = "x".repeat(MAX_PERSISTED_TEXT * 2);
  store.save();
  store.load();
  assert.equal(store.exercise("2025", 1, 1).fields["cle"].length, MAX_PERSISTED_TEXT);
});

test("D4ter : le nombre de clés de fields est borné", () => {
  const exercise = store.exercise("2025", 1, 1);
  for (let index = 0; index < MAX_PERSISTED_KEYS + 50; index += 1) exercise.fields[`k${index}`] = "v";
  store.save();
  store.load();
  assert.equal(Object.keys(store.exercise("2025", 1, 1).fields).length, MAX_PERSISTED_KEYS);
});

test("D4quater : le nombre de tâches officielles persistées est borné", () => {
  const exercise = store.exercise("2025", 1, 1);
  for (let index = 0; index < MAX_PERSISTED_KEYS + 50; index += 1) {
    exercise.officialTaskAnswers[`2025-S1-E1-Q${index}`] = "v";
  }
  store.save();
  store.load();
  assert.equal(Object.keys(store.exercise("2025", 1, 1).officialTaskAnswers).length, MAX_PERSISTED_KEYS);
});

/* ===========================================================
   D4quinquies — sanitizeProgress acceptait /^[1-9]\d*$/ sans plafond alors
   que store.exercise() impose 1..9 : un localStorage corrompu pouvait créer
   un nombre illimité de sujets et d'exercices fantômes.
   =========================================================== */
test("D4quinquies : sujet et exercice hors plage 1..9 ne sont pas persistés", () => {
  store.exercise("2025", 1, 1).answeredAny = true;
  store.save();
  const persisted = JSON.parse(localStorage.getItem("boussole4d.v4"));
  persisted.progress["2025"]["9999"] = { 1: { answeredAny: true } };
  persisted.progress["2025"]["0"] = { 1: { answeredAny: true } };
  persisted.progress["2025"]["1"]["9999"] = { answeredAny: true };
  persisted.progress["2025"]["1"]["0"] = { answeredAny: true };
  localStorage.setItem("boussole4d.v4", JSON.stringify(persisted));

  store.load();

  const subjects = store.state.progress["2025"];
  assert.deepEqual(Object.keys(subjects), ["1"], "seul le sujet 1 est dans la plage du store");
  assert.deepEqual(Object.keys(subjects["1"]), ["1"], "seul l'exercice 1 est dans la plage du store");
});

test("D4quinquies : les bornes exportées correspondent à celles de store.exercise()", () => {
  assert.equal(MAX_SUBJECT_ID, 9);
  assert.equal(MAX_EXERCISE_ID, 9);
  // Le store refuse déjà au-delà : la sanitisation ne doit pas être plus large.
  assert.throws(() => store.exercise("2025", MAX_SUBJECT_ID + 1, 1));
  assert.throws(() => store.exercise("2025", 1, MAX_EXERCISE_ID + 1));
});

/* ===========================================================
   D5 — les connecteurs étaient détectés par sous-chaîne : sur deux lettres,
   « ان » est contenu dans « انزيم » et « من » dans « مناعه ». Un empilement
   de mots-clés de SVT accumulait donc assez de faux connecteurs pour être lu
   comme une réponse structurée, ce qui inversait l'anti-récitation.
   =========================================================== */
const { analyzeSentenceStructure } = await import("../js/domain/evaluation/text-analysis.js");
const { normalizeArabic } = await import("../data/subjects.js");

test("D5 : un empilement de mots-clés de SVT ne fournit plus de faux connecteurs", () => {
  const dump = normalizeArabic("انزيم مناعه تركيز هضم امتصاص نواة خليه غشاء هيولي بروتين سكر دهن فيتامين");
  const structure = analyzeSentenceStructure(dump, "N");
  // Mesuré avant le correctif : 3 faux connecteurs (ان ⊂ انزيم، من ⊂ مناعه…).
  assert.equal(structure.connectorHits, 0, "aucun connecteur ne doit être compté par sous-chaîne");
  assert.equal(structure.hasConnectors, false);
});

test("D5 : les connecteurs réels restent détectés comme tokens entiers", () => {
  const sentence = normalizeArabic(
    "يقوم الـ ARN باصطناع البروتين في الهيولى مما يؤدي إلى استمرار نشاط الخلية"
  );
  const structure = analyzeSentenceStructure(sentence, "N");
  assert.ok(
    structure.connectorHits >= 4,
    `une réponse rédigée doit conserver ses connecteurs (${structure.connectorHits} trouvés)`
  );
  assert.equal(structure.hasConnectors, true);
  assert.equal(structure.isKeywordDump, false);
});

test("D5 : la séparation dump / réponse rédigée est dans le bon sens", () => {
  const dump = analyzeSentenceStructure(
    normalizeArabic("انزيم مناعه تركيز هضم امتصاص نواة خليه غشاء هيولي بروتين سكر دهن فيتامين"),
    "N"
  );
  const redigee = analyzeSentenceStructure(
    normalizeArabic("يقوم الـ ARN باصطناع البروتين في الهيولى مما يؤدي إلى استمرار نشاط الخلية"),
    "N"
  );
  assert.ok(
    redigee.connectorHits > dump.connectorHits,
    "la réponse rédigée doit scorer strictement plus haut que l'empilement de mots-clés"
  );
});
