import { test } from "node:test";
import assert from "node:assert/strict";
import { examMinutesForYear } from "../data/subjects.js";
import { APP_CONFIG } from "./helpers/full-app-config.mjs";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const CASES_PATH = join(__dirname, "hard-benchmark", "cases.json");

function loadCases() {
  try {
    return JSON.parse(readFileSync(CASES_PATH, "utf8"));
  } catch {
    return { cases: [] };
  }
}

const BAD_KEYWORDS = ["synthetic", "généré", "LLM", "GPT", "Claude", "Gemini", "chatbot", "fabriqué"];

test("la durée officielle dépend de la filière", () => {
  assert.equal(examMinutesForYear(APP_CONFIG.years.find((year) => year.id === "2026")), 270);
  assert.equal(examMinutesForYear(APP_CONFIG.years.find((year) => year.id === "2026-m")), 150);
  for (const year of APP_CONFIG.years.filter((item) => item.enabled)) {
    assert.ok([150, 270].includes(examMinutesForYear(year)), `durée non modélisée pour ${year.id}`);
  }
});

test("aucune entrée cases.json ne contient de mots-clés synthétiques dans source", () => {
  const data = loadCases();
  for (const c of data.cases) {
    const src = (c.source || "").toLowerCase();
    const provenanceSrc = ((c.provenance && c.provenance.source) || "").toLowerCase();
    const text = src + " " + provenanceSrc;
    const hits = BAD_KEYWORDS.filter((k) => text.includes(k.toLowerCase()));
    assert.equal(hits.length, 0, `mot-clé interdit détecté dans source/provenance: ${hits.join(", ")}`);
  }
});

test("pdfExternalUrl, si défini, est une URL https:// valide", () => {
  for (const year of APP_CONFIG.years) {
    for (const sujet of year.sujets) {
      if (sujet.pdfExternalUrl) {
        assert.ok(
          sujet.pdfExternalUrl.startsWith("https://"),
          `pdfExternalUrl doit être https:// pour ${year.id}/S${sujet.id}: ${sujet.pdfExternalUrl}`
        );
        assert.ok(!sujet.pdfExternalUrl.includes(" "), `pdfExternalUrl ne doit pas contenir d'espaces`);
      }
    }
  }
});

test("PDF : chargement paresseux, source externe et aucune résurrection de pdfAvailable", () => {
  for (const year of APP_CONFIG.years) {
    for (const sujet of year.sujets) {
      // Le payload n'embarque plus le PDF : c'est ce que pdfAvailable:false
      // prétendait exprimer, en contredisant pdfLocalUrl au passage.
      assert.equal(sujet.pdf, null, `PDF inline inattendu pour ${year.id}/S${sujet.id}`);
      assert.equal(
        sujet.pdfAvailable,
        undefined,
        `pdfAvailable est un champ mort et contradictoire (${year.id}/S${sujet.id})`
      );
      // L'élève garde toujours une sortie : source externe ou note explicite.
      assert.ok(
        (sujet.pdfExternalUrl || "").startsWith("https://") || (sujet.pdfNote || "").length > 0,
        `ni URL externe ni note pour ${year.id}/S${sujet.id}`
      );
    }
  }
});

test("tout pôle marqué official a page + date ISO + notes > 5 caractères", () => {
  for (const year of APP_CONFIG.years) {
    for (const sujet of year.sujets) {
      for (const ex of sujet.exercises) {
        for (const [poleLetter, pole] of Object.entries(ex.poles)) {
          if (pole.bacPromptSource === "official") {
            assert.ok(
              pole.bacPromptPage && typeof pole.bacPromptPage === "number",
              `bacPromptPage manquant pour ${year.id}/S${sujet.id}/E${ex.number}/${poleLetter}`
            );
            assert.ok(
              pole.bacPromptVerifiedAt && /^\d{4}-\d{2}-\d{2}$/.test(pole.bacPromptVerifiedAt),
              `bacPromptVerifiedAt invalide pour ${year.id}/S${sujet.id}/E${ex.number}/${poleLetter}`
            );
            assert.ok(
              pole.bacPromptNotes && pole.bacPromptNotes.length > 5,
              `bacPromptNotes trop courte pour ${year.id}/S${sujet.id}/E${ex.number}/${poleLetter}`
            );
          }
        }
      }
    }
  }
});

test("aucun bacPrompt officiel ne contient de sous-partie ou reconstructed", () => {
  for (const year of APP_CONFIG.years) {
    for (const sujet of year.sujets) {
      for (const ex of sujet.exercises) {
        for (const [poleLetter, pole] of Object.entries(ex.poles)) {
          if (pole.bacPromptSource === "official" && pole.bacPrompt) {
            const notes = pole.bacPromptNotes || "";
            assert.ok(
              !pole.bacPrompt.includes("reconstructed"),
              `bacPrompt officiel contient 'reconstructed' pour ${year.id}/S${sujet.id}/E${ex.number}/${poleLetter}`
            );
            assert.ok(
              !pole.bacPrompt.includes("ليس سؤالاً رسمياً مستقلاً"),
              `bacPrompt officiel contient une sous-partie pour ${year.id}/S${sujet.id}/E${ex.number}/${poleLetter}`
            );
            assert.ok(
              !/— الخاتمة/.test(pole.bacPrompt),
              `suffixe pédagogique interdit dans bacPrompt officiel ${year.id}/S${sujet.id}/E${ex.number}/${poleLetter}`
            );
            assert.ok(
              !/reconstructed|sous-partie|ليس سؤالاً رسمياً مستقلاً/.test(notes),
              `notes officielles contaminées pour ${year.id}/S${sujet.id}/E${ex.number}/${poleLetter}`
            );
          }
        }
      }
    }
  }
});

test("un même bacPrompt certifié officiel ne peut pas être partagé par deux pôles d'un même exercice", () => {
  for (const year of APP_CONFIG.years) {
    for (const sujet of year.sujets) {
      for (const ex of sujet.exercises) {
        const officialPrompts = new Map();
        for (const [poleLetter, pole] of Object.entries(ex.poles)) {
          if (pole.bacPromptSource === "official" && pole.bacPrompt) {
            if (officialPrompts.has(pole.bacPrompt)) {
              assert.fail(
                `bacPrompt officiel dupliqué entre pôles ${officialPrompts.get(pole.bacPrompt)} et ${poleLetter} dans ${year.id}/S${sujet.id}/E${ex.number}`
              );
            }
            officialPrompts.set(pole.bacPrompt, poleLetter);
          }
        }
      }
    }
  }
});

/* Phase 5 du plan docs/PLAN_SE_2013_2020.md : un encodage bâclé se
   reconnaît à quatre signatures, toutes refusées ici. Ajoutées le
   2026-09-23 avec la Phase 3 de SE 2020 ; aucune consigne du corpus ne
   les déclenchait à cette date (mesure faite avant l'ajout). */
test("une consigne officielle ne porte ni خلاصة/الخاتمة, ni parenthèses vides, ni mot dupliqué", () => {
  const offenders = [];
  for (const year of APP_CONFIG.years) {
    for (const sujet of year.sujets || []) {
      for (const ex of sujet.exercises || []) {
        for (const [poleLetter, pole] of Object.entries(ex.poles || {})) {
          if (pole.bacPromptSource !== "official" || !pole.bacPrompt) continue;
          const tag = `${year.id}/S${sujet.id}/E${ex.number}/${poleLetter}`;
          if (/^\s*(خلاصة|الخاتمة)\s*[:：]/.test(pole.bacPrompt)) {
            offenders.push(`${tag} : la consigne commence par un titre pédagogique خلاصة/الخاتمة`);
          }
          if (/\(\s*\)/.test(pole.bacPrompt)) {
            offenders.push(`${tag} : parenthèses vides dans une consigne officielle`);
          }
          if (pole.bacPrompt.includes("أنزيم وأنزيم")) {
            offenders.push(`${tag} : terme dupliqué « أنزيم وأنزيم » (perte de contenu OCR)`);
          }
        }
      }
    }
  }
  assert.deepEqual(offenders, [], offenders.join("\n"));
});

/* Une phrase imprimée identique sur deux exercices différents est une
   signature de recopie paresseuse — SAUF quand le sujet officiel imprime
   réellement la même formule passe-partout (constaté, avec pages et
   notes distinctes, sur deux paires de 2024 et 2026). Ces paires sont
   donc nommées ici : toute nouvelle paire exige une relecture humaine
   et une décision, pas un silence. */
const PHRASES_PASSE_PART_VERIFIEES = [
  ["2024/S1/E2/S", "2024/S2/E2/S"],
  ["2026/S1/E3/E", "2026/S2/E3/E"]
];

test("une consigne officielle n'est jamais recopiée sur deux années ou deux exercices", () => {
  const seen = new Map();
  const offenders = [];
  for (const year of APP_CONFIG.years) {
    for (const sujet of year.sujets || []) {
      for (const ex of sujet.exercises || []) {
        for (const [poleLetter, pole] of Object.entries(ex.poles || {})) {
          if (pole.bacPromptSource !== "official" || !pole.bacPrompt) continue;
          const tag = `${year.id}/S${sujet.id}/E${ex.number}/${poleLetter}`;
          if (seen.has(pole.bacPrompt)) {
            const other = seen.get(pole.bacPrompt);
            const pair = [other.tag, tag];
            const known = PHRASES_PASSE_PART_VERIFIEES.some(
              ([a, b]) => (pair[0] === a && pair[1] === b) || (pair[0] === b && pair[1] === a)
            );
            if (!known) offenders.push(`${tag} recopie la consigne de ${other.tag}`);
          } else {
            seen.set(pole.bacPrompt, { tag, page: pole.bacPromptPage });
          }
        }
      }
    }
  }
  assert.deepEqual(offenders, [], offenders.join("\n"));
});

test("la somme des points N/S/E/W égale ex.max pour chaque exercice", () => {
  for (const year of APP_CONFIG.years) {
    // Armature « copie libre » : aucun pôle encodé, donc rien à sommer.
    if (year.answerMode === "free") continue;
    for (const sujet of year.sujets || []) {
      for (const ex of sujet.exercises || []) {
        const sum = ["N", "S", "E", "W"].reduce((a, p) => a + (ex.poles[p]?.points || 0), 0);
        assert.ok(
          Math.abs(sum - ex.max) < 1e-6,
          `somme pôles ${sum} ≠ max ${ex.max} pour ${year.id}/S${sujet.id}/E${ex.number}`
        );
      }
    }
  }
});

test("toute année enabled=true a au moins un sujet, chaque sujet un exercice, chaque exercice 4 pôles N/S/E/W", () => {
  for (const year of APP_CONFIG.years) {
    if (!year.enabled) continue;
    // Une armature « copie libre » n'a pas de pôles : c'est précisément ce qui
    // la distingue d'une année 4D — elle n'encode aucune consigne.
    if (year.answerMode === "free") {
      for (const sujet of year.sujets) {
        assert.ok(sujet.exercises.length > 0, `sujet ${year.id}/S${sujet.id} sans exercice`);
        for (const ex of sujet.exercises) {
          assert.deepEqual(ex.poles, {}, `${year.id}/S${sujet.id}/E${ex.number} ne doit rien encoder`);
          /* Barème : soit MESURÉ (nombre > 0), soit explicitement NON MESURÉ
             (`max: null`). Un PDF scanné ou aux chiffres corrompus n'autorise
             aucun recopiage : coder 0 ou laisser `undefined` ferait croire à
             un barème nul au lieu d'un barème inconnu. */
          assert.ok(
            ex.max === null || (Number(ex.max) || 0) > 0,
            `${year.id}/S${sujet.id}/E${ex.number} : barème ni mesuré ni marqué non mesuré`
          );
        }
      }
      continue;
    }
    assert.ok(year.sujets.length > 0, `année ${year.id} activée mais sans sujet`);
    for (const sujet of year.sujets) {
      assert.ok(sujet.exercises.length > 0, `sujet ${year.id}/S${sujet.id} sans exercice`);
      for (const ex of sujet.exercises) {
        for (const p of ["N", "S", "E", "W"]) {
          assert.ok(ex.poles[p], `exercice ${year.id}/S${sujet.id}/E${ex.number} sans pôle ${p}`);
        }
      }
    }
  }
});

test("les chaînes de données interpolées dans le HTML ne contiennent aucun caractère cassant le balisage", () => {
  // workspace.js / strategy.js / brouillon.js interpolent les chaînes de
  // données (labels, prompts, consignes BAC, placeholders, notes PDF,
  // réponses modèles) dans des templates HTML. Le contenu est du texte
  // officiel de confiance (pas une saisie utilisateur), mais il doit
  // rester neutre côté balisage : aucun <, >, &, backtick ni guillemet
  // double ASCII (placeholders injectés dans des attributs placeholder="…").
  const offenders = [];
  const walk = (obj, path) => {
    if (typeof obj === "string") {
      if (/[<>&`"]/.test(obj)) offenders.push(`${path} :: ${obj.slice(0, 60)}`);
    } else if (obj && typeof obj === "object") {
      for (const [k, v] of Object.entries(obj)) walk(v, `${path}.${k}`);
    }
  };
  for (const year of APP_CONFIG.years) walk(year, year.id);
  assert.deepEqual(offenders, [], "caractères HTML-dangereux dans les données :\n" + offenders.join("\n"));
});
