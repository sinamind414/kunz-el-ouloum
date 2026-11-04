/* Regroupement des écritures (D11) — le contrat qui rend le debounce sans
   danger : rien n'est perdu, parce que flush() écrit immédiatement et que tout
   point de sortie l'appelle. */
import { test } from "node:test";
import assert from "node:assert/strict";

import { debounce } from "../js/application/debounce.js";

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

test("des appels rapprochés ne produisent qu'une seule exécution", async () => {
  let calls = 0;
  const grouped = debounce(() => (calls += 1), 30);

  for (let index = 0; index < 50; index += 1) grouped();
  assert.equal(calls, 0, "rien ne s'exécute avant l'échéance");

  await wait(60);
  assert.equal(calls, 1, "cinquante appels, une seule exécution");
});

test("les derniers arguments sont ceux qui sont transmis", async () => {
  const seen = [];
  const grouped = debounce((value) => seen.push(value), 20);

  grouped("a");
  grouped("b");
  grouped("c");
  await wait(50);

  assert.deepEqual(seen, ["c"]);
});

test("flush() exécute immédiatement et vide la file", async () => {
  let calls = 0;
  const grouped = debounce(() => (calls += 1), 5000);

  grouped();
  assert.equal(grouped.pending(), true);

  grouped.flush();
  assert.equal(calls, 1, "flush exécute l'appel en attente");
  assert.equal(grouped.pending(), false, "la file est vide après flush");

  // Un second flush sans appel en attente ne relance rien.
  grouped.flush();
  assert.equal(calls, 1, "flush ne doit pas exécuter deux fois");
});

test("cancel() abandonne l'appel en attente sans l'exécuter", async () => {
  let calls = 0;
  const grouped = debounce(() => (calls += 1), 20);

  grouped();
  grouped.cancel();
  assert.equal(grouped.pending(), false);

  await wait(50);
  assert.equal(calls, 0, "un appel annulé ne s'exécute jamais");
});
