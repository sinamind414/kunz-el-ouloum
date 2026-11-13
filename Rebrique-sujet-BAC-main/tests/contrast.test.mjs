import { test } from "node:test";
import assert from "node:assert/strict";

function luminance(hex) {
  const channels = hex
    .replace("#", "")
    .match(/.{2}/g)
    .map((part) => parseInt(part, 16) / 255)
    .map((value) => (value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4));
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function ratio(foreground, background) {
  const values = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
  return (values[0] + 0.05) / (values[1] + 0.05);
}

test("les jetons --dim corrigés sont réellement déclarés dans les thèmes sombre et clair", async () => {
  const { readFile } = await import("node:fs/promises");
  const css = await readFile(new URL("../assets/styles.css", import.meta.url), "utf8");
  assert.match(css, /:root\s*\{[\s\S]*--dim:\s*#94a3b8/);
  assert.match(css, /:root\[data-theme="light"\]\s*\{[\s\S]*--dim:\s*#475569/);
  assert.match(css, /html\[lang="ar"\][\s\S]*font-size:\s*0\.9rem/);
});

test("audit WCAG AA : les couples de couleurs textuelles essentiels atteignent 4,5:1", () => {
  const pairs = {
    "dark/texte": ["#f1f5f9", "#020617"],
    "dark/texte-secondaire": ["#a8b5c7", "#020617"],
    "dark/texte-dim": ["#94a3b8", "#020617"],
    "light/texte": ["#0f172a", "#ffffff"],
    "light/texte-secondaire": ["#475569", "#ffffff"],
    "light/texte-dim": ["#475569", "#ffffff"],
    "bouton-émeraude": ["#ffffff", "#047857"],
    "bouton-indigo": ["#ffffff", "#4338ca"],
    "bouton-violet": ["#ffffff", "#7e22ce"],
    "bouton-rose": ["#ffffff", "#be123c"],
    "contraste/texte": ["#ffffff", "#000000"],
    "contraste/accent": ["#ffd800", "#000000"]
  };
  for (const [name, [foreground, background]] of Object.entries(pairs)) {
    assert.ok(ratio(foreground, background) >= 4.5, `${name}: ${ratio(foreground, background).toFixed(2)}:1`);
  }
});
