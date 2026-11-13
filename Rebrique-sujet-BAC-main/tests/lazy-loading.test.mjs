import { test } from "node:test";
import assert from "node:assert/strict";
import {
  APP_CONFIG,
  getLoadedYear,
  loadAllYears,
  loadYear,
  loadedYearIds,
  YEAR_CATALOG
} from "../data/subjects.js";

test("le catalogue initial reste léger et ne contient aucun sujet complet", () => {
  assert.equal(APP_CONFIG.dataLoading, "on-demand");
  assert.equal(YEAR_CATALOG.length, 29);
  assert.deepEqual(loadedYearIds(), []);
  for (const metadata of YEAR_CATALOG) {
    assert.equal("sujets" in metadata, false, `${metadata.id} embarque un payload dans le catalogue`);
    assert.match(
      metadata.modulePath,
      /^data\/years\/(?:se|m)\/year-\d{4}(?:-exceptional)?\.js$/,
      `${metadata.id} : chemin de payload inattendu`
    );
    assert.ok(Object.isFrozen(metadata));
  }
});

test("loadYear ne charge que l'année demandée, la valide et la mémorise", async () => {
  const firstPromise = loadYear("2025");
  const secondPromise = loadYear("2025");
  assert.equal(firstPromise, secondPromise, "deux requêtes concurrentes doivent partager leur promesse");
  const year = await firstPromise;
  assert.equal(year.id, "2025");
  assert.equal(year.sujets.length, 2);
  assert.deepEqual(loadedYearIds(), ["2025"]);
  assert.equal(getLoadedYear("2025"), year);
  assert.equal(getLoadedYear("2024"), null);
  // Le PDF n'est plus inline dans le payload : il est servi séparément, via
  // pdfLocalUrl (fichier du dépôt) ou pdfExternalUrl (source externe).
  assert.equal(year.sujets[0].pdf, null);
  assert.match(year.sujets[0].pdfLocalUrl, /^\/subjects\/SE\/2025\/sujet-1\.pdf$/);
  assert.match(year.sujets[0].pdfExternalUrl, /^https:\/\/www\.dzexams\.com\//);
});

test("une année inconnue est refusée sans modifier le cache", async () => {
  await assert.rejects(loadYear("1999"), /سنة غير معروفة/);
  assert.deepEqual(loadedYearIds(), ["2025"]);
});

test("l'audit exhaustif peut charger les 29 payloads sans doublon", async () => {
  const years = await loadAllYears();
  assert.equal(years.length, 29);
  assert.equal(new Set(years.map((year) => year.id)).size, 29);
  assert.deepEqual(
    years.map((year) => year.id),
    YEAR_CATALOG.map((year) => year.id)
  );
});

test("le mode de réponse annoncé par le catalogue correspond au payload chargé", async () => {
  const years = await loadAllYears();
  const byId = new Map(years.map((year) => [year.id, year]));
  for (const metadata of YEAR_CATALOG) {
    const year = byId.get(metadata.id);
    assert.ok(year, `${metadata.id} non chargé`);
    assert.equal(
      metadata.answerMode || "inventory",
      year.answerMode || "inventory",
      `${metadata.id} : la carte du hub annonce un autre mode que le payload`
    );
  }
});
