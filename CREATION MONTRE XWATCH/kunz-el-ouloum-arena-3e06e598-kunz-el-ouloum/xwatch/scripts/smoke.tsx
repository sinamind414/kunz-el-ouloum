import { JSDOM } from "jsdom";

const dom = new JSDOM("<!doctype html><html><body><div id='root'></div></body></html>", {
  url: "http://localhost:5173/",
  pretendToBeVisual: true,
});

const g = globalThis as unknown as Record<string, unknown>;
g.window = dom.window;
g.document = dom.window.document;
Object.defineProperty(globalThis, "navigator", { value: dom.window.navigator, configurable: true });
g.HTMLElement = dom.window.HTMLElement;
g.SVGElement = dom.window.SVGElement;
g.Image = dom.window.Image;
g.Node = dom.window.Node;
g.Event = dom.window.Event;
g.CustomEvent = dom.window.CustomEvent;
g.getComputedStyle = dom.window.getComputedStyle;
g.requestAnimationFrame = (cb: FrameRequestCallback) => setTimeout(() => cb(Date.now()), 16) as unknown as number;
g.cancelAnimationFrame = (id: number) => clearTimeout(id);
g.IntersectionObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};
g.matchMedia = () => ({ matches: false, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} });
Object.defineProperty(globalThis, "localStorage", { value: dom.window.localStorage, configurable: true });

async function main() {
  const { default: React } = await import("react");
  const { createRoot } = await import("react-dom/client");
  const { default: App } = await import("../src/App");

  const root = createRoot(document.getElementById("root")!);
  root.render(React.createElement(App));

  const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
  await wait(400);

  const check = (label: string) => {
    const html = document.body.innerHTML;
    console.log(`${label}: ${html.length} chars, h1="${document.querySelector("h1")?.textContent?.replace(/\s+/g, " ").trim().slice(0, 60) ?? "-"}"`);
    if (html.length < 500) throw new Error(`Page ${label} vide`);
  };
  check("home");
  if (!document.querySelector(".hero-watch")) throw new Error("Montre hero absente");
  if (!document.querySelector(".preset-card")) throw new Error("Cartes collection absentes");

  window.location.hash = "/configurateur";
  window.dispatchEvent(new dom.window.HashChangeEvent("hashchange"));
  await wait(300);
  check("configurateur");
  const tabs = document.querySelectorAll(".tab");
  console.log("tabs:", tabs.length, "options cards:", document.querySelectorAll(".option-card").length);
  if (tabs.length < 10) throw new Error("Onglets manquants");

  // simulate option click
  (tabs[1] as HTMLElement).click();
  await wait(150);
  const cards = document.querySelectorAll(".option-card");
  console.log("cadran cards:", cards.length);
  (cards[3] as HTMLElement).click();
  await wait(150);

  window.location.hash = "/collection";
  window.dispatchEvent(new dom.window.HashChangeEvent("hashchange"));
  await wait(250);
  check("collection");

  window.location.hash = "/atelier";
  window.dispatchEvent(new dom.window.HashChangeEvent("hashchange"));
  await wait(250);
  check("atelier");

  console.log("SMOKE OK");
  process.exit(0);
}

main().catch((e) => {
  console.error("SMOKE FAIL", e);
  process.exit(1);
});
