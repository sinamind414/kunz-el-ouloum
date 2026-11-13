import { test } from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import { createDialogManager } from "../js/ui/dialogs.js";

function setup() {
  const dom = new JSDOM(`<body><button id="trigger">افتح</button><main id="content">المحتوى</main></body>`, {
    pretendToBeVisual: true
  });
  globalThis.window = dom.window;
  globalThis.document = dom.window.document;
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  return { dom, $, manager: createDialogManager({ $, $$ }) };
}

test("la modale isole l’arrière-plan, possède un titre lié et restaure le focus", () => {
  const { dom, $, manager } = setup();
  const trigger = $("#trigger");
  trigger.focus();
  manager.openModal("عنوان النافذة", "<p>محتوى واضح</p>");

  const dialog = $("[role='dialog']");
  const title = $("#" + dialog.getAttribute("aria-labelledby"));
  assert.equal(title.textContent, "عنوان النافذة");
  assert.equal($("#content").inert, true);
  assert.equal($("#content").getAttribute("aria-hidden"), "true");
  assert.equal($("[data-close='btn']").getAttribute("aria-label"), "إغلاق النافذة");
  assert.equal(document.activeElement, $("[data-close='btn']"));

  dialog.dispatchEvent(new dom.window.KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
  assert.equal($("[role='dialog']"), null);
  assert.equal($("#content").inert, false);
  assert.equal($("#content").hasAttribute("aria-hidden"), false);
  assert.equal(document.activeElement, trigger);
});

test("le tiroir applique le même isolement et le même retour de focus", () => {
  const { dom, $, manager } = setup();
  const trigger = $("#trigger");
  trigger.focus();
  manager.openDrawer("left", "عنوان اللوحة", "<textarea aria-label='ملاحظة'></textarea>");
  const drawer = $(".drawer");
  assert.equal($("#content").inert, true);
  assert.equal($(".drawer [data-close]").getAttribute("aria-label"), "إغلاق اللوحة");
  drawer.dispatchEvent(new dom.window.KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
  assert.equal($(".drawer"), null);
  assert.equal($("#content").inert, false);
  assert.equal(document.activeElement, trigger);
});
