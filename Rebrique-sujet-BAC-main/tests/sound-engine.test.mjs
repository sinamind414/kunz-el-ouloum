/* ============================================================
   Moteur audio — chaîne binaurale et étanchéité des modes
   ------------------------------------------------------------
   Pourquoi ce test : `js/services/sound-engine.js` était décrit comme
   « non vérifiable ici » (jsdom n'a pas de WebAudio). Or le moteur est un
   objet injectable (`soundEngine.ctx`) : un contexte factice permet de
   vérifier le CÂBLAGE des deux chemins binauraux et l'étanchéité des
   changements de mode, sans dépendre d'un navigateur.

   Ce qui reste explicitement non vérifié : le rendu sonore réel dans
   Safari (bug #51) — seule une oreille sur un vrai Safari peut le
   confirmer. Ce test garantit que le code part bien sur le chemin
   `StereoPannerNode` quand il existe, et sur le repli `ChannelMerger`
   sinon, ce qui est la partie déterministe du correctif.
   ============================================================ */
import { test } from "node:test";
import assert from "node:assert/strict";
import { soundEngine } from "../js/services/sound-engine.js";

/** Contexte WebAudio factice qui journalise le graphe réellement construit. */
function fakeContext({ withPanner = true } = {}) {
  let seq = 0;
  const nodes = [];
  function param(value = 0) {
    return {
      value,
      setValueAtTime(next) {
        this.value = next;
      }
    };
  }
  function node(kind, extra = {}) {
    const n = {
      id: `${kind}#${++seq}`,
      kind,
      connections: [],
      disconnects: 0,
      started: false,
      stopped: false,
      connect(target, output, input) {
        n.connections.push({ to: target.id, output, input });
        return target;
      },
      disconnect() {
        n.disconnects += 1;
        n.disconnected = true;
      },
      disconnected: false,
      ...extra
    };
    nodes.push(n);
    return n;
  }
  const ctx = {
    state: "running",
    currentTime: 0,
    sampleRate: 48000,
    destination: { id: "destination", kind: "destination", connections: [] },
    resume: () => Promise.resolve(),
    createGain: () => node("gain", { gain: param() }),
    createOscillator: () =>
      node("oscillator", {
        frequency: param(),
        start() {
          this.started = true;
        },
        stop() {
          this.stopped = true;
        }
      }),
    createBiquadFilter: () => node("biquad", { frequency: param(), Q: param(), type: "" }),
    createBufferSource: () =>
      node("bufferSource", {
        buffer: null,
        loop: false,
        start() {
          this.started = true;
        },
        stop() {
          this.stopped = true;
        }
      }),
    createChannelMerger: (inputs) => node("merger", { inputs }),
    createBuffer: (channels, length) => ({
      channels,
      length,
      getChannelData: () => new Float32Array(length)
    })
  };
  if (withPanner) {
    ctx.createStereoPanner = () => node("panner", { pan: param() });
  }
  return { ctx, nodes, of: (kind) => nodes.filter((n) => n.kind === kind) };
}

function arme(mode, options) {
  const audio = fakeContext(options);
  soundEngine.stop();
  soundEngine.ctx = audio.ctx;
  soundEngine.volume = 0.15;
  const played = soundEngine.play(mode);
  return { audio, played };
}

test("binaural : chemin StereoPannerNode, séparation gauche/droite à ±1", () => {
  const { audio, played } = arme("binaural");
  assert.equal(played, "binaural");
  const oscs = audio.of("oscillator");
  const panners = audio.of("panner");
  assert.equal(oscs.length, 2, "deux oscillateurs");
  assert.equal(panners.length, 2, "un panoramique par oreille");
  assert.deepEqual(
    oscs.map((o) => o.frequency.value).sort((a, b) => a - b),
    [210, 250],
    "les deux fréquences du battement (10 Hz d'écart)"
  );
  assert.deepEqual(
    panners.map((p) => p.pan.value).sort((a, b) => a - b),
    [-1, 1],
    "chaque oscillateur part à fond d'un côté"
  );
  assert.equal(audio.of("merger").length, 0, "pas de repli quand StereoPanner existe");

  // Un oscillateur → un seul panoramique, et les deux panoramiques → le même gain.
  const master = soundEngine.gainNode;
  for (const osc of oscs) {
    assert.equal(osc.connections.length, 1, `${osc.id} ne doit alimenter qu'un seul nœud`);
    const target = panners.find((p) => p.id === osc.connections[0].to);
    assert.ok(target, `${osc.id} doit alimenter un panoramique`);
    assert.deepEqual(target.connections, [{ to: master.id, output: undefined, input: undefined }]);
  }
  assert.equal(panners[0].connections[0].to, panners[1].connections[0].to, "même gain maître");
  assert.equal(master.connections[0].to, "destination", "le maître descend sur la sortie");
});

test("binaural : repli ChannelMerger quand createStereoPanner est absent", () => {
  const { audio, played } = arme("binaural", { withPanner: false });
  assert.equal(played, "binaural");
  assert.equal(audio.of("panner").length, 0, "aucun panoramique sur un moteur qui n'en a pas");
  const mergers = audio.of("merger");
  assert.equal(mergers.length, 1, "un seul mélangeur");
  assert.equal(mergers[0].inputs, 2, "mélangeur stéréo");
  const oscs = audio.of("oscillator");
  assert.deepEqual(
    oscs.map((o) => o.connections[0].input),
    [0, 1],
    "chaque oscillateur occupe un canal distinct du mélangeur"
  );
  assert.equal(mergers[0].connections[0].to, soundEngine.gainNode.id);
});

test("changer de mode coupe la chaîne précédente et le gain maître (bug #50)", () => {
  const { audio } = arme("rain");
  const firstMaster = soundEngine.gainNode;
  const firstNodes = [...soundEngine.nodes];
  assert.equal(firstNodes.length, 2, "pluie : bruit + filtre");
  soundEngine.play("waves");
  assert.equal(firstMaster.disconnects, 1, "l'ancien gain maître est déconnecté");
  for (const n of firstNodes) {
    assert.equal(n.disconnects, 1, `${n.kind} déconnecté`);
  }
  const masters = audio
    .of("gain")
    .filter((g) => !g.disconnected && g.connections.some((c) => c.to === "destination"));
  assert.equal(masters.length, 1, "un seul gain maître vivant par mode");
  assert.equal(
    soundEngine.gainNode.id,
    masters[0].id,
    "le gain maître courant est celui descendu sur la sortie"
  );
  assert.equal(soundEngine.nodes.length, 4, "vagues : bruit, filtre, LFO, gain de LFO");
  soundEngine.stop();
  assert.equal(soundEngine.gainNode, null, "plus de gain maître après arrêt");
  assert.equal(soundEngine.nodes.length, 0);
  assert.equal(soundEngine.currentMode, "off");
});

test("mode « off » et absence de contexte audio restent sans effet", () => {
  soundEngine.stop();
  soundEngine.ctx = null;
  assert.equal(soundEngine.play("off"), "off");
  assert.equal(soundEngine.currentMode, "off");
  // Sans contexte (navigateur sans WebAudio), play() ne lève pas et renvoie le mode.
  assert.equal(soundEngine.play("binaural"), "binaural");
  assert.equal(soundEngine.gainNode, null, "aucun graphe construit sans contexte");
  soundEngine.stop();
  assert.equal(soundEngine.currentMode, "off");
});

test("volume : borné à [0, 1] et appliqué au gain maître vivant", () => {
  arme("binaural");
  soundEngine.setVolume(0.4);
  assert.equal(soundEngine.gainNode.gain.value, 0.4);
  soundEngine.setVolume(4);
  assert.equal(soundEngine.volume, 1, "volume plafonné");
  assert.equal(soundEngine.gainNode.gain.value, 1);
  soundEngine.setVolume(-3);
  assert.equal(soundEngine.volume, 0, "volume plancher");
  soundEngine.stop();
});
