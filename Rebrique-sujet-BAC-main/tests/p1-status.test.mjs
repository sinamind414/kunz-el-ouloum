import { test } from "node:test";
import assert from "node:assert/strict";
import { buildP1Status } from "../scripts/report-p1-status.mjs";

test("le statut P1 refuse un faux 100 % tant que les inventaires et copies manquent", () => {
  const status = buildP1Status();
  const byId = Object.fromEntries(status.gates.map((gate) => [gate.id, gate]));
  assert.equal(status.complete, false);
  assert.equal(status.completedGates, 3);
  assert.equal(status.totalGates, 6);
  assert.equal(byId["P1.1"].complete, false);
  /* 58 sujets = 29 sessions × 2 (15 SE, 14 Maths, 1 Maths exceptionnelle).
     Depuis la structuration OCR de SE 2021 (2026-09-20), TOUS les sujets
     portent un inventaire — aucun n'est « complete » pour autant : les
     pôles N restent reconstruits, le statut reste partial partout. */
  assert.match(byId["P1.1"].evidence, /\/58 inventaires complets/);
  /* 4680 = 312 consignes officielles × 15 copies (3195 jusqu'au 2026-09-19 ;
     3915 avec les 48 consignes OCR Maths ; 4155 avec les 16 consignes OCR de
     SE 2021 ; 4410 avec les 17 consignes de SE 2019 relues sur image ; 4680
     avec les 18 consignes de SE 2016 relues sur image le 2026-09-24).
     Le critère n'est pas assoupli : le dénominateur suit le nombre réel de
     consignes officielles, il ne baisse jamais. */
  assert.match(byId["P1.5"].evidence, /0\/4680 copies/);
  assert.equal(byId["P1.2"].complete, false);
  assert.equal(byId["P1.3"].complete, true);
  assert.equal(byId["P1.4"].complete, true);
  assert.equal(byId["P1.5"].complete, false);
  assert.equal(byId["P1.6"].complete, true);
  assert.match(byId["P1.6"].evidence, /styles inline=0/);
});
