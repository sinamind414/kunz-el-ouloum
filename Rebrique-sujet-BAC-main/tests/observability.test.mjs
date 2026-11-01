import { test } from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";

const dom = new JSDOM("<!doctype html><body></body>", { url: "https://example.test/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.APP_BUILD_ID = "abcdef123456";
const serviceWorker = new dom.window.EventTarget();
Object.defineProperty(dom.window.navigator, "serviceWorker", { value: serviceWorker, configurable: true });

const {
  clearDiagnostics,
  getDiagnostics,
  getOperationalSnapshot,
  initializeOperationalObservability,
  reportDiagnostic
} = await import("../js/services/diagnostics.js");
const { mountOperationalStatus } = await import("../js/ui/operational-status.js");

initializeOperationalObservability(dom.window);
clearDiagnostics();

test("les erreurs sont agrégées sans message, pile, contexte ni donnée élève", () => {
  const secret = "student@example.test réponse-personnelle";
  reportDiagnostic("store.save", new Error(secret), { answer: secret, url: `/copy?name=${secret}` });
  reportDiagnostic("store.save", new Error("autre message privé"), { student: "Nom Prénom" });
  const malicious = new Error(secret);
  malicious.name = secret;
  reportDiagnostic(secret, malicious);

  assert.deepEqual(getDiagnostics(), [
    { scope: "application", errorName: "other-error", count: 1 },
    { scope: "store.save", errorName: "error", count: 2 }
  ]);
  const serialized = JSON.stringify(getOperationalSnapshot());
  for (const forbidden of [
    secret,
    "autre message privé",
    "Nom Prénom",
    "stack",
    "context",
    "answer",
    "url"
  ]) {
    assert.equal(
      serialized.includes(forbidden),
      false,
      `donnée conservée dans l'observabilité: ${forbidden}`
    );
  }
  assert.equal(getOperationalSnapshot().buildId, "abcdef123456");
});

test("les changements online/offline et événements SW sont comptés localement", () => {
  dom.window.dispatchEvent(new dom.window.Event("offline"));
  serviceWorker.dispatchEvent(
    new dom.window.MessageEvent("message", {
      data: { source: "miftah-sw", type: "offline-miss", resource: "year-data", url: "secret" }
    })
  );
  let snapshot = getOperationalSnapshot();
  assert.equal(snapshot.online, false);
  assert.equal(snapshot.transitions.offline, 1);

  serviceWorker.dispatchEvent(
    new dom.window.MessageEvent("message", {
      data: { source: "miftah-sw", type: "runtime-cache-updated", resource: "pdf" }
    })
  );
  serviceWorker.dispatchEvent(
    new dom.window.MessageEvent("message", { data: { source: "unknown", type: "private-payload" } })
  );
  snapshot = getOperationalSnapshot();
  assert.equal(snapshot.online, true);
  assert.equal(snapshot.transitions.online, 1);
  assert.deepEqual(snapshot.serviceWorker, { "offline-miss": 1, "runtime-cache-updated": 1 });
});

test("l'état opérationnel visible annonce la version et le mode hors ligne", () => {
  const status = mountOperationalStatus(dom.window.document, dom.window);
  assert.match(status.textContent, /abcdef123456/);
  Object.defineProperty(dom.window.navigator, "onLine", { value: false, configurable: true });
  dom.window.dispatchEvent(new dom.window.Event("offline"));
  serviceWorker.dispatchEvent(
    new dom.window.MessageEvent("message", {
      data: { source: "miftah-sw", type: "runtime-cache-updated", resource: "year-data" }
    })
  );
  assert.equal(
    status.dataset.online,
    "false",
    "un événement cache différé ne doit pas masquer le mode hors ligne"
  );
  assert.match(status.textContent, /دون اتصال/);
  Object.defineProperty(dom.window.navigator, "onLine", { value: true, configurable: true });
  dom.window.dispatchEvent(new dom.window.Event("online"));
  assert.equal(status.dataset.online, "true");
  assert.match(status.textContent, /متصل/);
});
