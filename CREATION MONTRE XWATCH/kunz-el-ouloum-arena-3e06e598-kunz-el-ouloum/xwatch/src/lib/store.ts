import { useCallback, useEffect, useMemo, useState } from "react";
import {
  WatchConfig,
  defaultConfig,
  findBracelet,
  findCase,
  findDial,
  findEngraving,
  totalPrice,
} from "../configurator/catalog";

/* ------------------------------------------------------------------ */
/* Currency                                                            */
/* ------------------------------------------------------------------ */

export type Currency = "EUR" | "DZD";

export const DZD_RATE = 285;

export function formatMoney(valueEur: number, currency: Currency): string {
  if (currency === "DZD") {
    const v = Math.round((valueEur * DZD_RATE) / 100) * 100;
    return `${v.toLocaleString("fr-FR").replace(/\u202f/g, " ")} DA`;
  }
  return `${valueEur.toLocaleString("fr-FR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })} €`;
}

export function formatDelta(value: number, currency: Currency): string {
  if (!value) return "Inclus";
  return `+ ${formatMoney(value, currency)}`;
}

/* ------------------------------------------------------------------ */
/* Persistence                                                         */
/* ------------------------------------------------------------------ */

const CONFIG_KEY = "xwatch.config.v1";
const CART_KEY = "xwatch.cart.v1";
const CURRENCY_KEY = "xwatch.currency.v1";

export function loadConfig(): WatchConfig {
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    if (!raw) return defaultConfig;
    return sanitize(JSON.parse(raw));
  } catch {
    return defaultConfig;
  }
}

export function saveConfig(config: WatchConfig) {
  try {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  } catch {
    /* quota */
  }
}

export function loadCart(): WatchConfig[] {
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(sanitize);
  } catch {
    return [];
  }
}

export function saveCart(items: WatchConfig[]) {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  } catch {
    /* quota */
  }
}

export function loadCurrency(): Currency {
  const v = localStorage.getItem(CURRENCY_KEY);
  return v === "DZD" ? "DZD" : "EUR";
}

export function saveCurrency(c: Currency) {
  localStorage.setItem(CURRENCY_KEY, c);
}

let currencyState: Currency = loadCurrency();
const currencyListeners = new Set<() => void>();

function subscribeCurrency(listener: () => void) {
  currencyListeners.add(listener);
  return () => {
    currencyListeners.delete(listener);
  };
}



function sanitize(input: unknown): WatchConfig {
  const base = JSON.parse(JSON.stringify(defaultConfig)) as WatchConfig;
  if (!input || typeof input !== "object") return base;
  const c = input as Partial<WatchConfig>;
  const out: WatchConfig = {
    ...base,
    ...c,
    engraving: { ...base.engraving, ...(c.engraving ?? {}) },
    logo: { ...base.logo, ...(c.logo ?? {}) },
  };
  // guard against stale ids
  out.caseId = c.caseId ?? base.caseId;
  out.braceletId = c.braceletId ?? base.braceletId;
  return out;
}

/* ------------------------------------------------------------------ */
/* Share helpers                                                       */
/* ------------------------------------------------------------------ */

export function encodeConfig(config: WatchConfig): string {
  return btoa(encodeURIComponent(JSON.stringify(config))).replace(/=+$/, "");
}

export function decodeConfig(token: string): WatchConfig | null {
  try {
    const json = decodeURIComponent(atob(token.replace(/-/g, "+").replace(/_/g, "/")));
    return sanitize(JSON.parse(json));
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ */
/* Hooks                                                               */
/* ------------------------------------------------------------------ */

export function useConfigurator(initial?: WatchConfig) {
  const [config, setConfig] = useState<WatchConfig>(() => initial ?? loadConfig());

  useEffect(() => {
    saveConfig(config);
  }, [config]);

  const update = useCallback(<K extends keyof WatchConfig>(key: K, value: WatchConfig[K]) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  }, []);

  const reset = useCallback(() => setConfig(defaultConfig), []);
  const set = useCallback((c: WatchConfig) => setConfig(c), []);

  return { config, update, reset, set };
}

/* Cart — module-level store shared by every component */

let cartState: WatchConfig[] = loadCart();
const cartListeners = new Set<() => void>();

function commitCart(next: WatchConfig[]) {
  cartState = next;
  saveCart(next);
  cartListeners.forEach((l) => l());
}

function subscribeCart(listener: () => void) {
  cartListeners.add(listener);
  return () => {
    cartListeners.delete(listener);
  };
}

export function useCart() {
  const [items, setItems] = useState<WatchConfig[]>(cartState);

  useEffect(() => {
    const sync = () => setItems(cartState);
    sync();
    return subscribeCart(sync);
  }, []);

  const add = useCallback((config: WatchConfig) => {
    commitCart([...cartState, JSON.parse(JSON.stringify(config))]);
  }, []);

  const remove = useCallback((index: number) => {
    commitCart(cartState.filter((_, i) => i !== index));
  }, []);

  const clear = useCallback(() => commitCart([]), []);

  return { items, add, remove, clear };
}

export function useCartCount() {
  const [count, setCount] = useState(cartState.length);

  useEffect(() => {
    const sync = () => setCount(cartState.length);
    sync();
    return subscribeCart(sync);
  }, []);

  return count;
}

export function useCurrency() {
  const [currency, setLocal] = useState<Currency>(currencyState);

  useEffect(() => {
    const l = () => setLocal(currencyState);
    return subscribeCurrency(l);
  }, []);

  const setCurrency = useCallback((c: Currency) => {
    currencyState = c;
    saveCurrency(c);
    currencyListeners.forEach((l) => l());
  }, []);

  return { currency, setCurrency };
}

/* ------------------------------------------------------------------ */
/* Naming                                                              */
/* ------------------------------------------------------------------ */

export function configName(config: WatchConfig): string {
  const dial = findDial(config.dialId);
  const brace = findBracelet(config.braceletId);
  return `XWATCH · ${dial.name} / ${brace.name}`;
}

export function configReference(config: WatchConfig): string {
  const seed = `${config.caseId}-${config.dialId}-${config.bezelId}-${config.handsId}-${config.braceletId}`;
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return `XW-${h.toString(36).toUpperCase().slice(0, 6).padStart(6, "0")}`;
}

export function configDetails(config: WatchConfig) {
  const c = findCase(config.caseId);
  const b = findBracelet(config.braceletId);
  const e = findEngraving(config.engraving.spot);
  return {
    caseName: c.name,
    bracelet: b.name,
    diameter: `${c.diameter} mm`,
    thickness: `${c.thickness} mm`,
    water: `${c.water} m`,
    engraving: config.engraving.spot === "none" ? "—" : `${e.name}${config.engraving.text ? ` · « ${config.engraving.text} »` : ""}`,
    logo:
      config.logo.mode === "brand"
        ? "Signature XWATCH"
        : config.logo.mode === "text"
          ? `Texte · ${config.logo.text || "—"}`
          : "Logo importé",
    total: totalPrice(config),
  };
}

export function useConfigSummary(config: WatchConfig) {
  return useMemo(() => configDetails(config), [config]);
}
