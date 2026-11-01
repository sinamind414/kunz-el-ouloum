import { test } from "node:test";
import assert from "node:assert/strict";
import { APP_CONFIG } from "./helpers/full-app-config.mjs";
import { evaluateText, scoreFromFraction } from "../js/engine.js";

function getPole(yearId, sujetId, exNumber, poleKey) {
  const year = APP_CONFIG.years.find((y) => y.id === yearId);
  assert.ok(year, `Année introuvable: ${yearId}`);
  const sujet = year.sujets.find((s) => s.id === sujetId);
  assert.ok(sujet, `Sujet introuvable: ${yearId}/${sujetId}`);
  const exercise = sujet.exercises.find((e) => e.number === exNumber);
  assert.ok(exercise, `Exercice introuvable: ${yearId}/${sujetId}/ex${exNumber}`);
  const pole = exercise.poles[poleKey];
  assert.ok(pole, `Pôle introuvable: ${yearId}/${sujetId}/ex${exNumber}/${poleKey}`);
  return pole;
}

function assertBetween(value, min, max, label) {
  assert.ok(value >= min, `${label} trop bas: ${value} < ${min}`);
  assert.ok(value <= max, `${label} trop haut: ${value} > ${max}`);
}

const BENCHMARK_CASES = [
  {
    label: "BAC 2024 / Sujet 2 / Ex1 / E — اشرح خطوات الترجمة",
    poleType: "E",
    expectedTask: "explanation",
    pole: getPole("2024", 2, 1, "E"),
    variants: {
      excellent: {
        answer: getPole("2024", 2, 1, "E").modelAnswer,
        fraction: [0.95, 1],
        methodology: [0.9, 1],
        scoreRatio: [0.95, 1]
      },
      acceptable: {
        answer: "يرتبط الريبوزوم بالـ ARNm ثم تنقل الأحماض الأمينية فيتوقف التركيب بمركب Tetracycline.",
        // D5 : cette copie ne contient QU'UN vrai connecteur (« يرتبط »). Avant le
        // correctif, « في » était compté à l'intérieur de « فيتوقف » (فـ + يتوقف),
        // ce qui gonflait artificiellement la cohérence. Les bornes suivent la
        // mesure corrigée : 0.675 / 0.667 / 0.670.
        fraction: [0.6, 0.8],
        methodology: [0.6, 0.8],
        scoreRatio: [0.6, 0.8]
      },
      falseAnswer: {
        answer: "البروتين مفيد.",
        fraction: [0, 0.05],
        methodology: [0, 0.1],
        scoreRatio: [0, 0.05]
      }
    }
  },
  {
    label: "BAC 2024 / Sujet 2 / Ex2 / S — حلّل نشاط RUBISCO",
    poleType: "S",
    expectedTask: "analysis",
    pole: getPole("2024", 2, 2, "S"),
    variants: {
      excellent: {
        answer: getPole("2024", 2, 2, "S").modelAnswer,
        fraction: [0.95, 1],
        methodology: [0.9, 1],
        scoreRatio: [0.95, 1]
      },
      acceptable: {
        answer: "تمثل الوثيقة نشاط RUBISCO بدلالة الزمن، نلاحظ ارتفاعا في الضوء.",
        fraction: [0.65, 0.8],
        methodology: [0.7, 0.9],
        scoreRatio: [0.65, 0.8]
      },
      falseAnswer: {
        answer: "النبات أخضر.",
        fraction: [0, 0.05],
        methodology: [0.3, 0.5],
        scoreRatio: [0, 0.05]
      }
    }
  },
  {
    label: "BAC 2024 / Sujet 1 / Ex1 / W — الخاتمة العلمية (VIH)",
    poleType: "W",
    expectedTask: "scientific-text",
    pole: getPole("2024", 1, 1, "W"),
    variants: {
      excellent: {
        answer: getPole("2024", 1, 1, "W").modelAnswer,
        fraction: [0.95, 1],
        methodology: [0.9, 1],
        scoreRatio: [0.95, 1]
      },
      acceptable: {
        answer: "في الختام يثبط Zalcitabine التكاثر.",
        fraction: [0.5, 0.7],
        methodology: [0.4, 0.6],
        scoreRatio: [0.5, 0.7]
      },
      falseAnswer: {
        answer: "الخلية صغيرة.",
        fraction: [0, 0.05],
        methodology: [0.15, 0.35],
        scoreRatio: [0, 0.05]
      }
    }
  },
  {
    label: "BAC 2024 / Sujet 1 / Ex3 / E — فسّر أثر طفرة P53",
    poleType: "E",
    expectedTask: "explanation",
    pole: getPole("2024", 1, 3, "E"),
    variants: {
      excellent: {
        answer: getPole("2024", 1, 3, "E").modelAnswer,
        fraction: [0.95, 1],
        methodology: [0.6, 0.8],
        scoreRatio: [0.95, 1]
      },
      acceptable: {
        answer: "تؤدي طفرة P53 إلى فقدان وظيفة البروتين الكابحة للأورام فتتكاثر الخلايا السرطانية.",
        // D5 : un seul vrai connecteur ici (« إلى »). Avant le correctif, « ان »
        // était compté à l'intérieur de « فقدان ». Le seuil méthodologique
        // « connectorHits >= 2 » (methodology.js:800) était de fait inopérant :
        // n'importe quel texte de 12 mots atteignait 2 correspondances
        // accidentelles. Il discrimine réellement pour la première fois, et son
        // calibre n'est validé par aucune copie réelle (calibration : 0/149
        // pôles) — à trancher avec le lot calibration, pas à desserrer ici.
        fraction: [0.95, 1],
        methodology: [0, 0.1],
        scoreRatio: [0.95, 1]
      },
      falseAnswer: {
        answer: "السرطان خطير.",
        fraction: [0, 0.05],
        methodology: [0, 0.1],
        scoreRatio: [0, 0.05]
      }
    }
  }
];

for (const benchmarkCase of BENCHMARK_CASES) {
  test(`mini banc BAC — ${benchmarkCase.label}`, () => {
    const order = ["excellent", "acceptable", "falseAnswer"];
    const results = {};

    for (const variantName of order) {
      const variant = benchmarkCase.variants[variantName];
      const evaluation = evaluateText(variant.answer, benchmarkCase.pole.rule, benchmarkCase.poleType);
      const normalizedScore =
        scoreFromFraction(benchmarkCase.pole.points, evaluation.fraction) / benchmarkCase.pole.points;

      assert.equal(
        evaluation.taskProfile?.id,
        benchmarkCase.expectedTask,
        `${benchmarkCase.label} → tâche détectée incorrecte pour ${variantName}`
      );
      assertBetween(
        evaluation.fraction,
        variant.fraction[0],
        variant.fraction[1],
        `${benchmarkCase.label} → fraction ${variantName}`
      );
      assertBetween(
        evaluation.methodology.score,
        variant.methodology[0],
        variant.methodology[1],
        `${benchmarkCase.label} → méthodologie ${variantName}`
      );
      assertBetween(
        normalizedScore,
        variant.scoreRatio[0],
        variant.scoreRatio[1],
        `${benchmarkCase.label} → score normalisé ${variantName}`
      );

      results[variantName] = evaluation;
    }

    assert.ok(
      results.excellent.fraction >= results.acceptable.fraction,
      `${benchmarkCase.label} → excellente réponse non supérieure ou égale à l'acceptable`
    );
    assert.ok(
      results.acceptable.fraction > results.falseAnswer.fraction,
      `${benchmarkCase.label} → réponse acceptable non supérieure à la fausse`
    );
  });
}
