import { test } from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";

const dom = new JSDOM("<!doctype html><body><textarea id='answer'></textarea></body>", {
  url: "https://example.test/"
});
globalThis.window = dom.window;
globalThis.document = dom.window.document;

const { createSpeechEngine } = await import("../js/services/speech-recognition.js");

/** Faux Web Speech : on pilote les réussites/échecs locale par locale. */
function installFake({ refuse = [], accept = "ar-SA", throwOnStart = [] } = {}) {
  const instances = [];
  class FakeSpeechRecognition {
    constructor() {
      this.lang = "";
      this.started = false;
      this.onresult = null;
      this.onerror = null;
      this.onend = null;
      instances.push(this);
    }
    start() {
      if (this.started) throw new Error("InvalidStateError: recognition has already started");
      this.started = true;
      if (throwOnStart.includes(this.lang)) throw new Error(`Unsupported: ${this.lang}`);
      if (refuse.includes(this.lang)) {
        // Le moteur accepte start() puis rejette la locale de façon asynchrone.
        Promise.resolve().then(() => this.onerror?.({ error: "language-not-supported" }));
      }
    }
    abort() {
      this.started = false;
    }
  }
  dom.window.SpeechRecognition = FakeSpeechRecognition;
  dom.window.webkitSpeechRecognition = undefined;
  return { instances, accepted: accept };
}

function engine() {
  const notices = [];
  return { voice: createSpeechEngine((message, type) => notices.push({ message, type })), notices };
}

test("une locale refusée à l'ouverture ne relance pas start() sur le même objet (bug #54)", async () => {
  const { instances } = installFake({ throwOnStart: ["ar-SA", "ar-EG"] });
  const { voice, notices } = engine();
  const input = dom.window.document.querySelector("#answer");

  assert.equal(voice.start(input), true);
  // Deux échecs puis la troisième locale : trois objets distincts, un seul démarré.
  assert.equal(instances.length, 3);
  assert.deepEqual(
    instances.map((i) => i.lang),
    ["ar-SA", "ar-EG", "ar"]
  );
  assert.deepEqual(notices, [{ message: "بدأ الإملاء الصوتي…", type: "info" }]);
  assert.equal(voice.listening, true);
});

test("une locale refusée après start() retente la suivante sans prévenir l'élève", async () => {
  const { instances } = installFake({ refuse: ["ar-SA", "ar-EG"] });
  const { voice, notices } = engine();

  voice.start(dom.window.document.querySelector("#answer"));
  await new Promise((resolve) => setTimeout(resolve, 0));

  assert.deepEqual(
    instances.map((i) => i.lang),
    ["ar-SA", "ar-EG", "ar"]
  );
  assert.deepEqual(notices, [{ message: "بدأ الإملاء الصوتي…", type: "info" }]);
  assert.equal(voice.listening, true);
});

test("aucune locale arabe disponible : échec notifié, état nettoyé", async () => {
  const { instances } = installFake({ refuse: ["ar-SA", "ar-EG", "ar"] });
  const { voice, notices } = engine();

  // start() rend la main dès la première ouverture acceptée ; l'échec de toutes
  // les locales n'est connu qu'après les retours asynchrones du moteur.
  voice.start(dom.window.document.querySelector("#answer"));
  await new Promise((resolve) => setTimeout(resolve, 0));

  assert.equal(instances.length, 3);
  assert.equal(voice.listening, false);
  assert.equal(voice.recognition, null);
  assert.equal(voice.target, null);
  assert.equal(notices.at(-1).message, "تعذر بدء الإملاء الصوتي.");
});

test("le moteur absent est signalé sans lever", () => {
  dom.window.SpeechRecognition = undefined;
  dom.window.webkitSpeechRecognition = undefined;
  const { voice, notices } = engine();
  assert.equal(voice.start(dom.window.document.querySelector("#answer")), false);
  assert.equal(notices[0].message, "الإملاء الصوتي غير متاح في هذا المتصفح.");
});

test("relancer la dictée remplace la reconnaissance en cours", () => {
  const { instances } = installFake();
  const { voice } = engine();
  const input = dom.window.document.querySelector("#answer");
  voice.start(input);
  voice.start(input);
  assert.equal(instances.length, 2);
  assert.equal(instances[0].started, false, "l'ancienne session est abandonnée");
  assert.equal(voice.listening, true);
});
