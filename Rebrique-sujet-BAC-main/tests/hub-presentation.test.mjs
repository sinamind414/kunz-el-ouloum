/* ============================================================
   Présentation du hub — ce qui a été RETIRÉ volontairement
   ------------------------------------------------------------
   Demande du propriétaire : « delete this thing or buttons they are
   unnecessary and perturbent pour l'élève ». Trois nuisances supprimées :

     1. les badges de carte (ورقة حرة · دورة رسمية · دورة نموذجية ·
        أرشيف مُعاد بناؤه …) ;
     2. la description affichée sous le titre de l'année, et la légende de
        filière du type « 2021–2026 بتمارين مُشفَّرة، 2013–2020 بورقة حرة » ;
     3. les couleurs de boutons différentes, remplacées par un vert unique.

   Et une régression à ne pas perdre : l'en-tête reste visible au défilement
   (changer de شعبة ou couper le son sans remonter la page), sans passer
   derrière le bandeau de chronomètre.

   Ce que ces tests NE verrouillent PAS : le fond. L'information retirée de
   la carte (consignes non encodées, barème non mesuré) reste portée par
   l'infobulle `title` et par l'écran d'épreuve — jamais supprimée, seulement
   déplacée hors du champ de lecture de l'élève.
   ============================================================ */
import { test, after } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createRequire } from "node:module";
import { pdfViewerHTML } from "../js/ui/pdf-viewer.js";

const require = createRequire(import.meta.url);
const { JSDOM } = require("jsdom");
const __dirname = dirname(fileURLToPath(import.meta.url));

const html = readFileSync(join(__dirname, "..", "index.html"), "utf8");
const dom = new JSDOM(html, { url: "http://localhost/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.localStorage = dom.window.localStorage;
dom.window.scrollTo = () => {};

const css = readFileSync(join(__dirname, "..", "assets", "styles.css"), "utf8");
const { loadAllYears } = await import("../data/subjects.js");
await loadAllYears();
const { init } = await import("../js/ui.js");
const { soundEngine, timers } = await import("../js/engine.js");
await init();

after(() => {
  timers.stopAll();
  soundEngine.stop();
  try {
    dom.window.close();
  } catch {
    /* déjà fermé */
  }
});

const $ = (s, root = globalThis.document) => root.querySelector(s);
const $$ = (s, root = globalThis.document) => [...root.querySelectorAll(s)];
function click(sel) {
  const element = typeof sel === "string" ? $(sel) : sel;
  if (!element) throw new Error(`Élément introuvable: ${sel}`);
  element.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
}

/** Cycle jusqu'à la filière demandée (le hub la mémorise dans localStorage). */
function goToStream(labelPattern) {
  for (let tour = 0; tour < 3 && !labelPattern.test($("#stream-fab-label").textContent); tour += 1) {
    click("#btn-stream-fab");
  }
  assert.match($("#stream-fab-label").textContent, labelPattern);
}

test("aucune carte d'année n'affiche de badge ni de description sous le titre", () => {
  goToStream(/علوم تجريبية/);
  const cards = $$("#year-grid .year-card");
  assert.ok(cards.length >= 14, "le hub SE doit afficher ses années");
  for (const card of cards) {
    assert.equal(card.querySelector(".badge"), null, `${card.dataset.hubYear} porte encore un badge`);
    assert.equal(card.querySelector("p"), null, `${card.dataset.hubYear} affiche encore une description`);
    assert.ok(card.querySelector("h3"), `${card.dataset.hubYear} garde son titre`);
    assert.ok(card.querySelector(".year-number"), `${card.dataset.hubYear} garde son millésime`);
    /* L'honnêteté n'a pas été supprimée, seulement déplacée : elle reste
       disponible au survol et, surtout, dans l'écran d'épreuve. */
    assert.match(card.getAttribute("title") || "", /إمتحان الموضوع/);
  }
});

test("plus de sous-titre sous le nom de l'application, plus de légende de filière", () => {
  goToStream(/علوم تجريبية/);
  assert.equal($("#hub-stream-caption"), null, "la légende de filière est supprimée");
  assert.equal($(".hub-stream-bar"), null, "le bandeau de légende est supprimé");
  assert.equal($(".brand p"), null, "le sous-titre est supprimé");
  assert.equal($(".brand h1").textContent, "مفتاح الكنز", "le titre reste");
});

test("tous les boutons d'ouverture sont du même vert, filière comprise", () => {
  for (const pattern of [/علوم تجريبية/, /رياضيات/]) {
    goToStream(pattern);
    const buttons = $$("#year-grid button[data-year]");
    assert.ok(buttons.length >= 14, `${pattern} : toutes les années ont un bouton`);
    for (const button of buttons) {
      assert.match(button.className, /btn-emerald/, `${button.dataset.year} n'est pas vert`);
      assert.doesNotMatch(
        button.className,
        /btn-indigo|btn-amber|btn-rose|btn-purple/,
        `${button.dataset.year} garde une couleur propre`
      );
    }
    assert.match($("#btn-stream-fab").className, /btn-emerald/, "le bouton de filière est vert");
  }
});

test("les boutons son et adkar suivent le même vert que le reste", () => {
  assert.match(css, /\.btn-adkar\s*\{[^}]*background:\s*#047857/, "adkar : vert plein");
  assert.match(css, /\.btn-sound\.active\s*\{[^}]*#047857/, "son activé : vert plein");
  assert.match(css, /\.btn-sound\s*\{[^}]*border:\s*1px solid var\(--emerald\)/, "son : contour vert");
  /* Le vert plein de la palette est #047857 : c'est le couple déjà audité
     (blanc sur #047857, 4,8:1) par tests/contrast.test.mjs — pas #10b981,
     trop clair pour du texte blanc. */
  assert.match(css, /\.btn-emerald\s*\{\s*background:\s*#047857/);
});

test("l'en-tête reste collé en haut, sous le bandeau de chronomètre", () => {
  const block = css.match(/header\.screen-head\s*\{([^}]*)\}/);
  assert.ok(block, "la règle header.screen-head doit exister");
  assert.match(block[1], /position:\s*sticky/, "l'en-tête doit rester visible au défilement");
  assert.match(block[1], /top:\s*var\(--sticky-offset/, "le décalage doit être mesuré, pas estimé");
  assert.match(block[1], /background:\s*var\(--bg\)/, "fond opaque : sinon le contenu passe au travers");
  assert.match(block[1], /z-index:\s*30/, "sous le bandeau (40) et sous les modales (50+)");
  assert.match(css, /\.global-timer-bar\s*\{[^}]*z-index:\s*40/, "le chronomètre reste au-dessus");
});

test("le décalage collant est publié et suit la visibilité du bandeau", () => {
  const root = document.documentElement;
  assert.equal(
    root.style.getPropertyValue("--sticky-offset"),
    "0px",
    "bandeau masqué hors épreuve : aucun décalage"
  );
  const bar = $("#global-timer-bar");
  assert.ok(bar, "le bandeau de chronomètre doit exister");
  assert.ok(bar.classList.contains("hidden"), "aucune session ouverte au démarrage");
});

/* Retiré le 2026-09-19 à la demande du propriétaire, avec les autres textes
   qui expliquent l'application au lieu de laisser l'élève travailler : le
   bandeau « الملف المحلي — يُعرض داخل التطبيق » au-dessus de la visionneuse.
   Le sujet s'ouvre dans l'application, cela se voit ; le dire en plus de
   l'icône 📄 et des boutons était de trop. */
test("la visionneuse du sujet n'affiche aucun bandeau explicatif", () => {
  const html = pdfViewerHTML(
    { id: 1, pdfLocalUrl: "/subjects/SE/2025/sujet-1.pdf", pdfExternalUrl: null },
    { showCover: true }
  );
  assert.match(html, /📄 موضوع البكالوريا الأول/, "le titre du sujet reste");
  assert.doesNotMatch(html, /الملف المحلي/);
  assert.doesNotMatch(html, /يُعرض داخل التطبيق/);
  // Les seuls textes restants sont le titre et les deux actions utiles.
  const texts = [...html.matchAll(/>([^<>]{3,})</g)].map((match) => match[1].trim()).filter(Boolean);
  assert.deepEqual(texts, ["📄 موضوع البكالوريا الأول", "📄 فتح في نافذة مستقلة", "⬇️ تنزيل PDF"]);
});
