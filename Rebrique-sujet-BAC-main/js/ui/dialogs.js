import { node, replaceContent, setInternalHTML } from "./dom.js";

export function createDialogManager({ $, $$, onClose }) {
  let activeDialog = null;
  let dialogSequence = 0;
  let backgroundState = [];

  function restoreBackground() {
    for (const state of backgroundState) {
      state.element.inert = state.inert;
      if (state.ariaHidden === null) state.element.removeAttribute("aria-hidden");
      else state.element.setAttribute("aria-hidden", state.ariaHidden);
    }
    backgroundState = [];
  }

  function isolateDialog(element) {
    backgroundState = [...document.body.children]
      .filter((child) => child !== element)
      .map((child) => ({
        element: child,
        inert: child.inert === true,
        ariaHidden: child.getAttribute("aria-hidden")
      }));
    for (const state of backgroundState) {
      state.element.inert = true;
      state.element.setAttribute("aria-hidden", "true");
    }
  }

  function closeActiveDialog() {
    if (!activeDialog) return;
    const { element, returnFocus } = activeDialog;
    activeDialog = null;
    // Avant le retrait du DOM : c'est la dernière occasion d'atteindre les
    // hôtes encore vivants (visionneuses PDF, minuteurs) via leur sous-arbre.
    // Injecté par l'appelant pour garder ce gestionnaire indépendant du rendu.
    onClose?.(element);
    element.remove();
    restoreBackground();
    if (returnFocus?.isConnected) returnFocus.focus();
  }

  function closeModal() {
    closeActiveDialog();
  }

  function trapFocus(event, container, close) {
    if (event.key === "Escape") {
      event.preventDefault();
      close();
      return;
    }
    if (event.key !== "Tab") return;
    const focusable = $$(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      container
    ).filter((item) => !item.disabled && !item.hidden && item.getAttribute("aria-hidden") !== "true");
    if (!focusable.length) return event.preventDefault();
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function dialogIds(prefix) {
    dialogSequence += 1;
    return { title: `${prefix}-title-${dialogSequence}` };
  }

  function openModal(title, body, extra = "") {
    closeActiveDialog();
    const returnFocus = document.activeElement;
    const ids = dialogIds("modal");
    const overlay = node("div", { className: "overlay", dataset: { close: "overlay" } });
    const dialog = node("div", {
      className: "modal",
      attrs: {
        role: "dialog",
        "aria-modal": "true",
        "aria-labelledby": ids.title,
        tabindex: "-1"
      }
    });
    const head = node("div", { className: "modal-head" });
    head.append(
      node("h2", { className: "modal-title text-amber", text: title, attrs: { id: ids.title } }),
      node("button", {
        className: "btn btn-ghost btn-sm",
        text: "✕",
        dataset: { close: "btn" },
        attrs: { "aria-label": "إغلاق النافذة" }
      })
    );
    const content = node("div", { className: "small" });
    setInternalHTML(content, body);
    const extraContent = node("div");
    setInternalHTML(extraContent, extra);
    const actions = node("div", { className: "flex justify-end" });
    actions.append(
      node("button", { className: "btn btn-emerald", text: "فهمت، سأواصل", dataset: { close: "ok" } })
    );
    replaceContent(dialog, [head, content, extraContent, actions]);
    overlay.append(dialog);
    document.body.append(overlay);
    activeDialog = { element: overlay, returnFocus };
    isolateDialog(overlay);
    $$("[data-close]", dialog).forEach((button) => button.addEventListener("click", closeActiveDialog));
    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) closeActiveDialog();
    });
    overlay.addEventListener("keydown", (event) => trapFocus(event, dialog, closeActiveDialog));
    $("[data-close='btn']", dialog)?.focus();
    return overlay;
  }

  function openDrawer(side, title, body) {
    closeActiveDialog();
    const returnFocus = document.activeElement;
    const ids = dialogIds("drawer");
    const drawer = node("div", {
      className: `drawer ${side} open`,
      attrs: {
        role: "dialog",
        "aria-modal": "true",
        "aria-labelledby": ids.title,
        tabindex: "-1"
      }
    });
    const head = node("div", { className: "drawer-head" });
    head.append(
      node("h2", { className: "modal-title", text: title, attrs: { id: ids.title } }),
      node("button", {
        className: "btn btn-ghost btn-sm",
        text: "✕",
        attrs: { "data-close": "", "aria-label": "إغلاق اللوحة" }
      })
    );
    const content = node("div", { className: "drawer-body" });
    setInternalHTML(content, body);
    drawer.append(head, content);
    document.body.append(drawer);
    activeDialog = { element: drawer, returnFocus };
    isolateDialog(drawer);
    $$("[data-close]", drawer).forEach((button) => button.addEventListener("click", closeActiveDialog));
    drawer.addEventListener("keydown", (event) => trapFocus(event, drawer, closeActiveDialog));
    $("[data-close]", drawer)?.focus();
    return drawer;
  }

  return { openModal, closeModal, openDrawer };
}
