import { store } from "../store.js";

/* Application timer state; kept outside domain scoring. */
export const timers = {
  globalInterval: null,
  strategyInterval: null,
  onChange: null, // callback(which: 'global'|'strategy')

  _tick(which) {
    const now = Date.now();
    if (which === "global") {
      if (!store.isSessionActive()) return;
      const last = store.state.globalLastTick || now;
      const seconds = Math.max(1, Math.floor((now - last) / 1000));
      store.tickGlobal(seconds);
      if (!store.isSessionActive()) this.stopGlobal();
    } else {
      if (!store.state.strategyRunning || !store.isSessionActive()) return;
      const last = store.state.strategyLastTick || now;
      const seconds = Math.max(1, Math.floor((now - last) / 1000));
      store.tickStrategy(seconds);
      if (store.state.strategyRemaining <= 0) this.stopStrategy();
    }
    store.save();
    if (this.onChange) this.onChange(which);
  },

  startGlobal() {
    if (!store.isSessionActive() || store.state.globalRemaining <= 0) return false;
    this.stopGlobal();
    store.state.globalLastTick = Date.now();
    this.globalInterval = setInterval(() => this._tick("global"), 1000);
    store.save();
    if (this.onChange) this.onChange("global");
    return true;
  },

  stopGlobal() {
    if (this.globalInterval) clearInterval(this.globalInterval);
    this.globalInterval = null;
  },

  startStrategy() {
    if (!store.isSessionActive() || store.state.strategyRemaining <= 0) return false;
    if (this.strategyInterval) clearInterval(this.strategyInterval);
    store.state.strategyRunning = true;
    store.state.strategyLastTick = Date.now();
    this.strategyInterval = setInterval(() => this._tick("strategy"), 1000);
    store.save();
    if (this.onChange) this.onChange("strategy");
    return true;
  },

  stopStrategy() {
    if (this.strategyInterval) clearInterval(this.strategyInterval);
    this.strategyInterval = null;
    store.state.strategyRunning = false;
    store.state.strategyLastTick = null;
    store.save();
  },

  stopAll() {
    this.stopGlobal();
    if (this.strategyInterval) clearInterval(this.strategyInterval);
    this.strategyInterval = null;
    store.state.strategyRunning = false;
    store.state.strategyLastTick = null;
    // Bug #B16 : avant le fix, stopAll() remettait strategyRunning à false
    // en mémoire mais ne persistait pas dans localStorage. Un rechargement
    // relisait strategyRunning=true (fuite d'état). stopStrategy() persistait,
    // stopAll() non — asymétrie silencieuse.
    store.save();
  }
};
