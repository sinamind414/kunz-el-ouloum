import { after, test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { JSDOM } = require("jsdom");
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const html = readFileSync(join(root, "index.html"), "utf8");
const dom = new JSDOM(html, { url: "http://localhost/" });

globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.localStorage = dom.window.localStorage;
dom.window.scrollTo = () => {};

const { init, notify } = await import("../js/ui.js");

after(() => {
  dom.window.close();
});

/* `toast()` sortait silencieusement quand `#toast-zone` manquait, et la zone
   n'était créée que dans `init()`. Toute notification émise avant la fin de
   `init()` était donc perdue sans aucune trace — ni DOM, ni diagnostic. */
test("une notification émise avant init() est rendue, pas perdue", () => {
  assert.equal(document.querySelector("#toast-zone"), null, "pré-condition : la zone n'existe pas encore");

  notify("قبل التهيئة", "warn");

  const zone = document.querySelector("#toast-zone");
  assert.ok(zone, "la zone doit être créée à la demande plutôt que de perdre le message");
  assert.equal(zone.getAttribute("aria-live"), "polite");
  assert.equal(zone.getAttribute("aria-label"), "الإشعارات");
  assert.match(zone.textContent, /قبل التهيئة/, "le message doit être présent dans le DOM");
});

test("la zone créée à la demande porte les attributs d'une région live", () => {
  const zone = document.querySelector("#toast-zone");
  assert.equal(zone.getAttribute("aria-relevant"), "additions text");
  assert.equal(zone.className, "toast-zone");
});

test("init() réutilise la zone existante au lieu d'en créer une seconde", async () => {
  await init();
  assert.equal(document.querySelectorAll("#toast-zone").length, 1, "une seule région live");
});
