import { test } from "node:test";
import assert from "node:assert/strict";
import { CONFIDENCE_LEVELS, masteryBandAgainst, masteryPercent } from "../js/ui/screens/strategy.js";

const level = (label) => CONFIDENCE_LEVELS.find((item) => item.label === label).value;

test("جيد sur les trois exercices donne 70 %, quel que soit le barème", () => {
  const good = level("جيد");
  assert.equal(masteryPercent([good, good, good], [5, 7, 8]), 70);
  assert.equal(masteryPercent([good, good, good]), 70);
});

test("le bouton rouge est le sujet le plus faible, pas un seuil absolu", () => {
  assert.equal(masteryPercent([level("جيد جداً"), level("جيد جداً"), level("جيد جداً")]), 80);
  assert.equal(masteryPercent([level("متوسط"), level("متوسط"), level("متوسط")]), 50);
  assert.equal(masteryBandAgainst(80, [50]), "strong");
  assert.equal(masteryBandAgainst(50, [80]), "weak");
  // 50 % n'est pas rouge s'il n'est pas plus faible que l'autre sujet.
  assert.equal(masteryBandAgainst(50, [50]), "strong");
  assert.equal(masteryBandAgainst(50, [40]), "strong");
  // 80 % devient rouge s'il est plus faible que l'autre sujet.
  assert.equal(masteryBandAgainst(80, [90]), "weak");
});

test("le barème imprimé pèse : un 8 points faible tire le pourcentage sous 70", () => {
  const good = level("جيد");
  const mid = level("متوسط");
  const weighted = masteryPercent([good, good, mid], [5, 7, 8]);
  const plain = masteryPercent([good, good, mid]);
  assert.notEqual(weighted, plain);
  assert.ok(weighted < 70, `attendu sous 70, obtenu ${weighted}`);
  assert.equal(masteryBandAgainst(weighted, [plain]), "weak");
  assert.equal(masteryBandAgainst(plain, [weighted]), "strong");
});
