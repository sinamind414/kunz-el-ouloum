/* ============================================================
   Tests d'auto-cohérence des données (toutes années)
   ------------------------------------------------------------
   Garde-fou contre les régressions de données : chaque « réponse
   modèle » doit satisfaire sa propre règle d'évaluation, sinon un
   élève qui recopie le corrigé serait pénalisé à tort.
   S'exécute dans `npm test` (node --test tests/*.test.mjs).
   ============================================================ */
import { test } from "node:test";
import assert from "node:assert/strict";
import { APP_CONFIG } from "./helpers/full-app-config.mjs";
import { evaluateDocument, evaluateArtifact, matchConcept } from "../js/engine.js";

function* iterPoles() {
  for (const year of APP_CONFIG.years) {
    for (const sujet of year.sujets || []) {
      for (const ex of sujet.exercises || []) {
        for (const [letter, pole] of Object.entries(ex.poles || {})) {
          const tag = `${year.id}/S${sujet.id}/E${ex.number}/${letter}`;
          yield { tag, pole, year };
        }
      }
    }
  }
}

test("aucune réponse modèle ne contient un terme interdit par sa propre règle", () => {
  const problems = [];
  for (const { tag, pole } of iterPoles()) {
    for (const f of pole.rule?.forbidden || []) {
      if (matchConcept(pole.modelAnswer || "", f)) {
        problems.push(`${tag} contient l'interdit "${f}"`);
      }
    }
  }
  assert.deepEqual(problems, [], problems.join("\n"));
});

test("aucune réponse modèle d'hypothèse ne contient ربما/لعل (style كتفي 2023)", () => {
  const problems = [];
  for (const { tag, pole } of iterPoles()) {
    if (!pole.rule?.hypotheses) continue;
    if (matchConcept(pole.modelAnswer || "", "ربما") || matchConcept(pole.modelAnswer || "", "لعل")) {
      problems.push(`${tag} contient ربما/لعل`);
    }
  }
  assert.deepEqual(problems, [], problems.join("\n"));
});

test("toute réponse modèle de pôle documenté lit sa propre règle document sans écart", () => {
  const problems = [];
  for (const { tag, pole } of iterPoles()) {
    const r = pole.rule || {};
    if (!r.document) continue;
    // On vérifie toute règle document, quel que soit le pôle.
    const d = evaluateDocument(pole.modelAnswer || "", r);
    if (d.applicable && d.gaps.length) {
      problems.push(`${tag} → ${d.gaps.join(" | ")}`);
    }
  }
  assert.deepEqual(problems, [], problems.join("\n"));
});

test("toute réponse modèle à schéma satisfait son schéma (titre, flèches, ordre)", () => {
  const problems = [];
  for (const { tag, pole } of iterPoles()) {
    const r = pole.rule || {};
    if (!r.schema) continue;
    const a = evaluateArtifact(pole.modelAnswer || "", r);
    if (a.applicable && a.gaps.length) {
      problems.push(`${tag} → ${a.gaps.join(" | ")}`);
    }
  }
  assert.deepEqual(problems, [], problems.join("\n"));
});

test("les mots-clés n'utilisent pas la forme ى (normalizeArabic mappe ى→ي)", () => {
  const problems = [];
  for (const { tag, pole } of iterPoles()) {
    const keys = Array.isArray(pole.rule?.keywords) ? pole.rule.keywords.flat() : [pole.rule?.keywords];
    for (const k of keys.filter(Boolean)) {
      if (/ى/.test(String(k))) problems.push(`${tag} : "${k}"`);
    }
  }
  assert.deepEqual(problems, [], problems.join("\n"));
});

test("aucun champ de matching ne contient de caractères arabes non standard (ی ک پ چ گ ژ — résidus OCR persans)", () => {
  // Régression : des keywords contenaient le yeh persan ی (U+06CC), invisible à l'œil
  // mais différent du ي arabe (U+064A) → aucun élève ne pouvait matcher ces mots-clés.
  const suspect = /[یکپچگژےہ]/;
  const problems = [];
  for (const { tag, pole } of iterPoles()) {
    const rule = pole.rule || {};
    const fields = {
      keywords: Array.isArray(rule.keywords) ? rule.keywords.flat() : [],
      wrongConcepts: Array.isArray(rule.wrongConcepts) ? rule.wrongConcepts.flat() : [],
      modelAnswer: [pole.modelAnswer].filter(Boolean)
    };
    for (const [field, values] of Object.entries(fields)) {
      for (const v of values) {
        if (suspect.test(String(v))) problems.push(`${tag} (${field}) : "${v}"`);
      }
    }
  }
  assert.deepEqual(problems, [], problems.join("\n"));
});
