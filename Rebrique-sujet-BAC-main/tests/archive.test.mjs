/* ============================================================
   Tests d'intégrité de l'archive 2013–2020 (data/archive.js)
   ------------------------------------------------------------
   Garde-fous :
   1. Toute année 2013–2020 doit avoir une session principale
      cataloguée pour se ET m.
   2. Les URLs doivent être des annales dzexams https valides et
      uniques (pas de liens inventés, pas de doublons).
   3. Les sessions/filières doivent être des valeurs contrôlées.
   4. Provenance datée + notes non vides (transparence exigée).
   5. Aucun mot-clé synthétique dans les provenances.
   6. Les années archivées ne doivent PAS être des années
      d'entraînement 4D activées (deux produits distincts).
   7. Les entrées avec `contentVerified: false` doivent avoir
      `page: "access_confirmed"` et `viewer: "blocked"`.
   8. Les PDFs référencés par `pdfUrl` doivent être accessibles
      (test conditionnel en environnement réseau).
   ============================================================ */
import { test } from "node:test";
import assert from "node:assert/strict";
import { ARCHIVE } from "../data/archive.js";

const BAD_KEYWORDS = ["synthetic", "généré", "LLM", "GPT", "Claude", "Gemini", "chatbot", "fabriqué"];

test("2021 SE : plus de carte d'archive — entraînement 4D structuré depuis l'OCR du sujet officiel", async () => {
  const se = ARCHIVE.entries.find((e) => e.year === "2021" && e.stream === "se");
  const maths = ARCHIVE.entries.find((e) => e.year === "2021" && e.stream === "m");
  assert.equal(se, undefined, "2021/se n'est plus une carte d'archive (année 4D)");
  assert.ok(maths, "2021 m doit rester cataloguée");
  assert.equal(maths.viewer, "ok");
  assert.equal(maths.contentVerified, true);
  /* 2021 est structurée 4D depuis le 2026-09-20 : consignes extraites par le
     pipeline OCR du PDF officiel (scripts/extracted/SE/2021) — couche texte
     aux chiffres corrompus. Une consigne officielle = LA question du sujet,
     une seule par tâche (décision 6 du propriétaire). */
  const { APP_CONFIG, loadYear } = await import("../data/subjects.js");
  const se2021 = APP_CONFIG.years.find((y) => y.id === "2021" && (y.stream || "se") === "se");
  assert.ok(se2021 && se2021.enabled, "2021 ouvre une épreuve");
  const year2021 = await loadYear("2021");
  assert.equal(year2021.answerMode, undefined, "plus d'armature « copie libre »");
  /* Le champ `answerModeNote` a été SUPPRIMÉ des payloads le 2026-09-19. */
  assert.equal(year2021.answerModeNote, undefined);
  for (const sujet of year2021.sujets) {
    assert.deepEqual(
      sujet.exercises.map((ex) => ex.max),
      [5, 7, 8]
    );
    for (const ex of sujet.exercises) {
      assert.deepEqual(
        Object.keys(ex.poles),
        ["N", "S", "E", "W"],
        `${sujet.id}/E${ex.number} doit avoir les 4 pôles`
      );
      for (const [key, pole] of Object.entries(ex.poles)) {
        assert.ok(
          pole.bacPrompt && pole.bacPrompt.length > 10,
          `${sujet.id}/E${ex.number}/${key} doit porter une consigne`
        );
        assert.ok(
          pole.modelAnswer && pole.modelAnswer.length >= pole.minLength,
          `${sujet.id}/E${ex.number}/${key} doit avoir un corrigé`
        );
      }
    }
    assert.ok(sujet.pdfLocalUrl.startsWith("/subjects/SE/2021/"));
  }
  const { officialTaskInventoryFor } = await import("../data/official-tasks.js");
  for (const sujet of year2021.sujets) {
    const inventory = officialTaskInventoryFor("2021", sujet.id);
    assert.ok(inventory, "inventaire généré pour 2021");
    assert.equal(inventory.tasks.length, 12, "3 exercices × 4 pôles par sujet");
  }
});

test("la session exceptionnelle 2016 Maths n'est pas inventée", () => {
  assert.equal(
    ARCHIVE.entries.some((e) => e.year === "2016" && e.stream === "m" && e.session === "exceptional"),
    false
  );
  const gap = ARCHIVE.gaps.find((g) => g.year === "2016" && g.stream === "m" && g.session === "exceptional");
  assert.ok(gap, "le trou 2016/m/exceptional doit rester documenté");
  assert.ok(gap.reason.length > 20);
});

test("chaque année 2013–2021 a une session principale pour se et m, sauf SE 4D (2013–2021)", () => {
  const seFourD = new Set(["2013", "2014", "2015", "2016", "2017", "2018", "2019", "2020", "2021"]);
  for (let y = 2013; y <= 2021; y++) {
    const year = String(y);
    for (const stream of ["se", "m"]) {
      if (stream === "se" && seFourD.has(year)) continue;
      assert.ok(
        ARCHIVE.entries.some((e) => e.year === year && e.stream === stream && e.session === "main"),
        `session principale manquante pour ${year}/${stream}`
      );
    }
  }
  for (const year of seFourD) {
    assert.equal(
      ARCHIVE.entries.some((e) => e.year === year && e.stream === "se"),
      false,
      `SE ${year} ne doit plus être une carte d'archive (entraînement 4D)`
    );
  }
});

test("les URLs annales sont https, dzexams et uniques", () => {
  const urls = ARCHIVE.entries.map((e) => e.url);
  assert.equal(new Set(urls).size, urls.length, "doublon d'URL d'annales");
  for (const e of ARCHIVE.entries) {
    assert.ok(
      e.url.startsWith("https://www.dzexams.com/ar/annales/"),
      `URL annales invalide pour ${e.year}/${e.stream}/${e.session}: ${e.url}`
    );
    assert.ok(!e.url.includes(" "), `URL avec espace pour ${e.year}`);
    if (e.pdfUrl) {
      assert.ok(e.pdfUrl.startsWith("https://"), `pdfUrl non https pour ${e.year}/${e.stream}/${e.session}`);
      assert.ok(
        e.pdfUrl.includes("dzexams.com/uploads/sujets/"),
        `pdfUrl hors des téléchargements dzexams pour ${e.year}/${e.stream}/${e.session}`
      );
    }
  }
});

test("toutes les entrées sont vérifiées (page ouverte) avec métriques de contrôle", () => {
  for (const e of ARCHIVE.entries) {
    if (e.viewer === "ok") {
      assert.equal(
        e.page,
        "consulted",
        `viewer ok mais page !== consulted: ${e.year}/${e.stream}/${e.session}`
      );
    } else {
      assert.equal(
        e.page,
        "access_confirmed",
        `viewer blocked mais page !== access_confirmed: ${e.year}/${e.stream}/${e.session}`
      );
    }
    assert.ok(["se", "m"].includes(e.stream), `filière inconnue: ${e.stream}`);
    assert.ok(["main", "exceptional"].includes(e.session), `session inconnue: ${e.session}`);
    assert.ok(["ok", "blocked"].includes(e.viewer), `viewer inconnu: ${e.viewer}`);
    assert.equal(typeof e.attachments, "boolean", `attachments non booléen: ${e.year}`);
  }
});

test("provenance datée et notes de vérification non vides", () => {
  assert.match(ARCHIVE.verifiedAt, /^\d{4}-\d{2}-\d{2}$/);
  for (const e of ARCHIVE.entries) {
    assert.ok(e.notes && e.notes.length > 20, `notes trop courtes pour ${e.year}/${e.stream}/${e.session}`);
  }
});

test("aucun mot-clé synthétique dans les provenances", () => {
  const corpus = ARCHIVE.entries.map((e) => e.notes).join(" ") + " " + ARCHIVE.sourceLabel;
  const hits = BAD_KEYWORDS.filter((k) => corpus.toLowerCase().includes(k.toLowerCase()));
  assert.deepEqual(hits, [], `mot-clé interdit détecté: ${hits.join(", ")}`);
});

test("une année 4D SE n'a pas d'entrée d'archive SE (pas de confusion de produits)", async () => {
  const { APP_CONFIG, loadYear } = await import("../data/subjects.js");
  const enabledIds = APP_CONFIG.years.filter((y) => y.enabled).map((y) => y.id);
  for (const e of ARCHIVE.entries.filter((entry) => entry.stream === "se")) {
    if (!enabledIds.includes(e.year)) continue;
    /* Seule exception documentée : l'armature « copie libre ». Elle ouvre une
       épreuve (sujet lu dans l'application) mais n'encode aucun contenu 4D. */
    const year = await loadYear(e.year);
    assert.equal(
      year.answerMode,
      "free",
      `${e.year}/se est à la fois archive et entraînement 4D activé — confusion de produits`
    );
    for (const sujet of year.sujets) {
      for (const ex of sujet.exercises) {
        assert.deepEqual(ex.poles, {}, `${e.year}/S${sujet.id}/E${ex.number} ne doit pas porter de pôle 4D`);
      }
    }
  }
});

test("Maths 2021–2026 et SE 2020/2026 sont du 4D ; Maths reste cataloguée (confusion SE-only)", async () => {
  for (const year of ["2022", "2023", "2024", "2025", "2026"]) {
    const maths = ARCHIVE.entries.find((e) => e.year === year && e.stream === "m" && e.session === "main");
    assert.ok(maths, `Maths ${year} manquante`);
    assert.ok(maths.url.includes("/ar/annales/"));
    assert.ok(maths.pdfUrl);
  }
  assert.equal(
    ARCHIVE.entries.some((e) => e.year === "2026" && e.stream === "se"),
    false,
    "SE 2026 ne doit plus être une carte d'archive (entraînement 4D)"
  );
  const { APP_CONFIG } = await import("../data/subjects.js");
  const se2026 = APP_CONFIG.years.find((y) => y.id === "2026");
  assert.ok(se2026 && se2026.enabled && (se2026.stream || "se") === "se");
  const se2020 = APP_CONFIG.years.find((y) => y.id === "2020");
  assert.ok(se2020 && se2020.enabled && (se2020.stream || "se") === "se");
  for (const year of ["2021", "2022", "2023", "2024", "2025", "2026"]) {
    const maths = APP_CONFIG.years.find((y) => y.id === `${year}-m`);
    assert.ok(
      maths && maths.enabled && maths.stream === "m" && maths.calendarYear === year,
      `Maths ${year} 4D manquant`
    );
  }
});

test("l'espace باكالوريات أجنبية n'a aucune entrée inventée", () => {
  assert.equal(ARCHIVE.entries.filter((e) => e.stream === "foreign").length, 0);
  assert.ok(ARCHIVE.streams.foreign);
  assert.equal(ARCHIVE.streams.foreign.label, "باكالوريات أجنبية");
  // Aucune source étrangère n'a été vérifiée : pas d'indexUrl inventé.
  assert.equal(ARCHIVE.streams.foreign.indexUrl, undefined);
  const gap = ARCHIVE.gaps.find((g) => g.stream === "foreign");
  assert.ok(gap, "l'espace vide doit rester documenté");
  assert.ok(gap.reason.length > 40);
  assert.deepEqual(ARCHIVE.streamOrder, ["se", "m", "foreign"]);
});

test("les entrées non vérifiées ont page=access_confirmed et viewer=blocked", () => {
  for (const e of ARCHIVE.entries) {
    if (e.contentVerified === false) {
      assert.equal(
        e.page,
        "access_confirmed",
        `entrée non vérifiée mais page !== access_confirmed: ${e.year}/${e.stream}/${e.session}`
      );
      assert.equal(
        e.viewer,
        "blocked",
        `entrée non vérifiée mais viewer !== blocked: ${e.year}/${e.stream}/${e.session}`
      );
    }
    if (e.contentVerified === true && e.viewer === "ok") {
      assert.equal(
        e.page,
        "consulted",
        `entrée vérifiée (viewer ok) mais page !== consulted: ${e.year}/${e.stream}/${e.session}`
      );
    }
    if (e.contentVerified === true && e.viewer === "blocked") {
      assert.equal(
        e.page,
        "access_confirmed",
        `entrée vérifiée (viewer bloqué, PDF direct) mais page !== access_confirmed: ${e.year}/${e.stream}/${e.session}`
      );
    }
  }
});

test("les entrées vérifiées ont contentVerified: true", () => {
  for (const e of ARCHIVE.entries) {
    if (e.viewer === "ok") {
      assert.equal(
        e.contentVerified,
        true,
        `viewer ok mais contentVerified non true: ${e.year}/${e.stream}/${e.session}`
      );
    }
  }
});

test("toutes les entrées ont un statut contentVerified défini", () => {
  for (const e of ARCHIVE.entries) {
    assert.notEqual(
      e.contentVerified,
      undefined,
      `contentVerified non défini pour: ${e.year}/${e.stream}/${e.session}`
    );
    assert.ok(
      typeof e.contentVerified === "boolean",
      `contentVerified non booléen pour: ${e.year}/${e.stream}/${e.session}`
    );
  }
});

// Test conditionnel : vérifie l'accessibilité des PDF si le réseau le permet
// Note : Peut échouer en environnement restreint (ex: sandbox sans accès externe)
test("les pdfUrl sont des URLs valides (syntaxe)", () => {
  for (const e of ARCHIVE.entries.filter((e) => e.pdfUrl)) {
    assert.ok(
      e.pdfUrl.startsWith("https://"),
      `pdfUrl non https pour ${e.year}/${e.stream}/${e.session}: ${e.pdfUrl}`
    );
    assert.ok(
      e.pdfUrl.includes("dzexams.com/uploads/sujets/"),
      `pdfUrl hors domaine attendu pour ${e.year}/${e.stream}/${e.session}`
    );
  }
});

// Test réseau optionnel (désactivé par défaut en CI si réseau bloqué)
// Pour l'activer, passer SKIP_NETWORK_TESTS=false
test(
  "les pdfUrl sont accessibles (test réseau)",
  {
    // Skippé par défaut ; réellement activable avec SKIP_NETWORK_TESTS=false.
    // (L'ancien `=== "true" || true` rendait l'activation impossible : le commentaire
    // ci-dessus mentait, et un test qui ne peut jamais tourner ne teste rien.)
    skip: process.env.SKIP_NETWORK_TESTS !== "false"
  },
  async () => {
    const https = await import("node:https");
    for (const e of ARCHIVE.entries.filter((e) => e.pdfUrl)) {
      const url = new URL(e.pdfUrl);
      const res = await new Promise((resolve, reject) => {
        https.get(url, (res) => resolve(res)).on("error", reject);
      });
      assert.equal(
        res.statusCode,
        200,
        `PDF inaccessible (${res.statusCode}) pour ${e.year}/${e.stream}/${e.session}: ${e.pdfUrl}`
      );
    }
  }
);
