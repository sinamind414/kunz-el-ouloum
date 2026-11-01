import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dom = readFileSync(join(root, "js", "ui", "dom.js"), "utf8");
const uiSources = {
  "js/ui.js": readFileSync(join(root, "js", "ui.js"), "utf8"),
  "js/ui/screens/simulation.js": readFileSync(join(root, "js", "ui", "screens", "simulation.js"), "utf8"),
  "js/ui/pdf-viewer.js": readFileSync(join(root, "js", "ui", "pdf-viewer.js"), "utf8")
};
const ui = Object.values(uiSources).join("");
const dialogs = readFileSync(join(root, "js", "ui", "dialogs.js"), "utf8");
const server = readFileSync(join(root, "server.mjs"), "utf8");

test("les contenus persistés sont échappés ou posés comme valeur DOM", () => {
  // Les réponses de l'élève reviennent par input.value (jamais parsées en HTML) ;
  // tout ce qui est interpolé — consigne, URL du sujet, références — passe par
  // escapeHTML avant d'entrer dans le gabarit.
  assert.match(dom, /export const escapeHTML/);
  // D15 — l'échappement a une seule implémentation : trois copies identiques
  // faisaient trois endroits à corriger si la liste de caractères changeait.
  for (const [path, source] of Object.entries(uiSources)) {
    assert.doesNotMatch(
      source,
      /const escapeHTML =|function escapeHTML/,
      `${path} ne doit plus redéfinir escapeHTML`
    );
    assert.match(source, /import \{[^}]*escapeHTML[^}]*\} from/, `${path} doit l'importer`);
  }
  /* Décision du propriétaire (2026-09-20) : plus aucune question affichée
     dans l'épreuve — les textes de consignes ne sont plus interpolés du
     tout (garantie plus forte que l'échappement). Restent à échapper :
     intitulés d'exercices et URL du sujet. */
  assert.match(ui, /input\.value = progress\.freeAnswer \|\| ""/);
  assert.match(ui, /escapeHTML\(exercise\.label\)/);
  assert.match(ui, /escapeHTML\(local\)/);
});

test("les dialogues centralisés supportent clavier, échappement et retour de focus", () => {
  assert.match(dialogs, /function trapFocus/);
  assert.match(dialogs, /event\.key === "Escape"/);
  assert.match(dialogs, /returnFocus\.focus/);
  assert.match(dialogs, /function isolateDialog/);
  assert.match(dialogs, /"aria-labelledby": ids\.title/);
});

test("les erreurs récupérables passent par le service de diagnostic", () => {
  for (const file of ["main.js", "store.js", "services/sound-engine.js", "services/speech-recognition.js"]) {
    const source = readFileSync(join(root, "js", file), "utf8");
    assert.match(source, /reportDiagnostic/, `${file} ne rapporte pas ses erreurs récupérables`);
  }
});

test("le serveur de production définit une CSP et des en-têtes de sécurité", () => {
  assert.match(server, /Content-Security-Policy/);
  assert.match(server, /X-Content-Type-Options/);
  assert.match(server, /Referrer-Policy/);
  assert.match(server, /Permissions-Policy/);
  assert.match(server, /Cache-Control/);
  assert.match(server, /PUBLIC_FILES/);
  assert.match(server, /PUBLIC_DIRECTORIES/);
  assert.match(server, /relative\(canonicalRoot, path\)/);
  assert.match(server, /realpathSync\(path\)/);
  assert.match(server, /GET, HEAD/);
  assert.doesNotMatch(server, /style-src[^;]*unsafe-inline/);
});

test("aucun module public ne recrée de style inline sous la CSP stricte", () => {
  const walk = (directory) =>
    readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
      const path = join(directory, entry.name);
      return entry.isDirectory() ? walk(path) : path.endsWith(".js") ? [path] : [];
    });
  const publicSources = [join(root, "index.html"), ...walk(join(root, "js")), ...walk(join(root, "data"))];
  for (const path of publicSources) {
    const source = readFileSync(path, "utf8");
    assert.doesNotMatch(source, /\bstyle\s*=/i, `attribut style inline dans ${path}`);
    assert.doesNotMatch(source, /\.style\.[a-z-]+\s*=/i, `écriture element.style dans ${path}`);
  }
});
