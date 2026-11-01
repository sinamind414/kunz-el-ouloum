import { reportDiagnostic } from "./diagnostics.js";

/** @type {{ ctx: any, currentMode: string, gainNode: any, nodes: any[], volume: number, [key: string]: any }} */
export const soundEngine = {
  ctx: null,
  currentMode: "off", // "off" | "rain" | "waves" | "binaural"
  gainNode: null,
  nodes: [],
  volume: 0.15,

  init() {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioCtx = window.AudioContext || /** @type {any} */ (window).webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
  },

  /** @param {number} v */
  setVolume(v) {
    this.volume = Math.max(0, Math.min(1, v));
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  },

  stop() {
    this.nodes.forEach((n) => {
      try {
        n.stop?.();
      } catch (error) {
        reportDiagnostic("sound.stop-node", error);
      }
      try {
        n.disconnect();
      } catch (error) {
        reportDiagnostic("sound.disconnect-node", error);
      }
    });
    this.nodes = [];
    // Disconnect the master GainNode from destination so mode switches don't
    // leave parallel gain chains permanently connected (audio leak fix).
    if (this.gainNode) {
      try {
        this.gainNode.disconnect();
      } catch (error) {
        reportDiagnostic("sound.disconnect-node", error);
      }
      this.gainNode = null;
    }
    this.currentMode = "off";
  },

  /** @param {"off" | "rain" | "waves" | "binaural"} mode */
  play(mode) {
    this.init();
    if (mode === "off") {
      this.stop();
      return "off";
    }

    this.currentMode = mode;

    if (!this.ctx) {
      return this.currentMode;
    }

    if (this.ctx.state === "suspended") {
      this.ctx.resume().catch((/** @type {unknown} */ error) => reportDiagnostic("sound.resume", error));
    }
    this.stop();

    this.currentMode = mode;

    try {
      this.gainNode = this.ctx.createGain();
      this.gainNode.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      this.gainNode.connect(this.ctx.destination);

      if (mode === "rain") {
        this._playRain();
      } else if (mode === "waves") {
        this._playWaves();
      } else if (mode === "binaural") {
        this._playBinaural();
      }
    } catch (error) {
      reportDiagnostic("sound.play", error, { mode });
      // Graceful fallback for non-standard audio environments
    }

    return this.currentMode;
  },

  cycle() {
    const modes = ["off", "rain", "waves", "binaural"];
    const nextIdx = (modes.indexOf(this.currentMode) + 1) % modes.length;
    return this.play(modes[nextIdx]);
  },

  _playRain() {
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.4;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(900, this.ctx.currentTime);

    noise.connect(filter);
    filter.connect(this.gainNode);
    noise.start();
    this.nodes.push(noise, filter);
  },

  _playWaves() {
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = data[i];
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(320, this.ctx.currentTime);
    filter.Q.setValueAtTime(1.8, this.ctx.currentTime);

    const lfo = this.ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.12, this.ctx.currentTime);
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(220, this.ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfo.start();

    noise.connect(filter);
    filter.connect(this.gainNode);
    noise.start();
    this.nodes.push(noise, filter, lfo, lfoGain);
  },

  _playBinaural() {
    const oscL = this.ctx.createOscillator();
    const oscR = this.ctx.createOscillator();
    oscL.frequency.setValueAtTime(210, this.ctx.currentTime);
    oscR.frequency.setValueAtTime(250, this.ctx.currentTime);
    oscL.start();
    oscR.start();

    // Le battement binaural n'existe que si chaque oreille ne reçoit QU'UNE
    // fréquence. Deux chemins, du plus explicite au plus compatible :
    //  1. StereoPannerNode (±1) : la séparation ne dépend pas de l'indexation
    //     des canaux en aval — c'est le chemin qui tient sur Safari (bug #51) ;
    //  2. ChannelMerger : repli pour les moteurs sans createStereoPanner.
    // NB : non vérifiable dans cette sandbox (jsdom n'a pas WebAudio) — le
    // comportement réel reste à confirmer sur Safari.
    if (typeof this.ctx.createStereoPanner === "function") {
      const panL = this.ctx.createStereoPanner();
      const panR = this.ctx.createStereoPanner();
      panL.pan.setValueAtTime(-1, this.ctx.currentTime);
      panR.pan.setValueAtTime(1, this.ctx.currentTime);
      oscL.connect(panL);
      oscR.connect(panR);
      panL.connect(this.gainNode);
      panR.connect(this.gainNode);
      this.nodes.push(oscL, oscR, panL, panR);
      return;
    }

    const merger = this.ctx.createChannelMerger(2);
    oscL.connect(merger, 0, 0);
    oscR.connect(merger, 0, 1);
    merger.connect(this.gainNode);
    this.nodes.push(oscL, oscR, merger);
  }
};
