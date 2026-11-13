/* Small DOM construction boundary for UI values that may be dynamic. */
export function node(tag, { className, text, attrs = {}, dataset = {} } = {}) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = String(text);
  for (const [name, value] of Object.entries(attrs)) {
    if (value !== undefined && value !== null) element.setAttribute(name, String(value));
  }
  for (const [name, value] of Object.entries(dataset)) {
    if (value !== undefined && value !== null) element.dataset[name] = String(value);
  }
  return element;
}

export function replaceContent(element, children = []) {
  element.replaceChildren(...children.filter(Boolean));
  return element;
}

/* L'en-tête d'écran est collant en haut de la page, et le bandeau de
   chronomètre l'est aussi depuis toujours. Sans décalage, l'en-tête passerait
   DERRIÈRE le bandeau dès que les deux sont épinglés. On publie donc la
   hauteur RÉELLE du bandeau dans `--sticky-offset`, que le CSS applique au
   `top` de l'en-tête : mesuré, pas estimé — la hauteur varie avec la police
   et la largeur d'écran. */
export function stickyHeaderOffset(bar = document.getElementById("global-timer-bar")) {
  const height = bar && !bar.classList.contains("hidden") ? bar.offsetHeight : 0;
  document.documentElement.style.setProperty("--sticky-offset", `${height}px`);
  return height;
}

/** Branche la synchronisation. Un observateur plutôt qu'un appel dans chaque
    écran : le bandeau est montré ou masqué depuis trois modules différents
    (ui.js, strategy.js, simulation.js). */
export function watchStickyHeaderOffset(bar) {
  stickyHeaderOffset(bar);
  /* MutationObserver est une API de navigateur : on passe par `globalThis`
     pour que le module reste chargeable et testable hors DOM. */
  const Observer = globalThis.MutationObserver;
  if (!bar || typeof Observer !== "function") return;
  new Observer(() => stickyHeaderOffset(bar)).observe(bar, {
    attributes: true,
    attributeFilter: ["class"]
  });
  globalThis.window?.addEventListener?.("resize", () => stickyHeaderOffset(bar));
}

/** Central boundary for application-owned templates. Never pass raw user input. */
export function setInternalHTML(element, html) {
  element.innerHTML = String(html);
  return element;
}

/* Any value that can originate from localStorage or user input must cross this
   boundary before being interpolated in HTML. Prefer .textContent/.value
   elsewhere. Implémentation unique : elle était recopiée à l'identique dans
   js/ui.js, js/ui/pdf-viewer.js et js/ui/screens/simulation.js, donc trois
   endroits à corriger si l'échappement devait changer. */
export const escapeHTML = (value = "") =>
  String(value).replace(
    /[&<>'"]/g,
    (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]
  );
