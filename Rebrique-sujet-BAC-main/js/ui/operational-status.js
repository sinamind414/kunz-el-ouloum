import { getOperationalSnapshot } from "../services/diagnostics.js";
import { node } from "./dom.js";

function renderStatus(element, snapshot) {
  const isOnline = snapshot.online !== false;
  element.dataset.online = String(isOnline);
  element.classList.toggle("is-offline", !isOnline);
  element.setAttribute("aria-label", isOnline ? "حالة الاتصال: متصل" : "حالة الاتصال: دون اتصال");
  const connection = element.querySelector("[data-connectivity]");
  const build = element.querySelector("[data-build-id]");
  if (connection) connection.textContent = isOnline ? "متصل" : "دون اتصال — المحتوى المحفوظ فقط";
  if (build) build.textContent = snapshot.buildId;
}

/** Visible, non-intrusive build/offline status. No personal data is displayed or collected. */
export function mountOperationalStatus(document, targetWindow = globalThis.window) {
  let element = document.getElementById("operational-status");
  if (!element) {
    element = node("aside", {
      className: "operational-status",
      attrs: { id: "operational-status", role: "status", "aria-live": "polite", "aria-atomic": "true" }
    });
    element.append(
      node("span", { attrs: { "data-connectivity": "" } }),
      node("span", { className: "operational-separator", text: "·", attrs: { "aria-hidden": "true" } }),
      node("span", { text: "الإصدار " }),
      node("code", { attrs: { "data-build-id": "" } })
    );
    document.body.appendChild(element);
  }
  renderStatus(element, getOperationalSnapshot());
  targetWindow?.addEventListener?.("miftah:operational-status", (event) => {
    renderStatus(element, event.detail || getOperationalSnapshot());
  });
  return element;
}
