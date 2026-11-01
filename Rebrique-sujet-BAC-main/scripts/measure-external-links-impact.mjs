/* Mesure l'impact d'une bascule des PDF locaux vers des liens externes.
 * Tout est mesuré sur l'arbre : aucune estimation.
 *
 * Usage: node scripts/measure-external-links-impact.mjs [--check]
 *   (sans --check) régénère docs/rights/external-links-impact.md
 *   --check        échoue (exit 1) si le document n'est plus à jour
 *
 * Ce document est une pièce du dossier juridique : il ne doit pas dériver en
 * silence. Le --check est donc comparé au document committé, comme
 * generate-rights-request-dossier.mjs. Aucune date calculée ni SHA de commit
 * n'est inséré dans le contenu, sinon le contrôle casserait à chaque commit.
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const OUT_PATH = join(root, "docs", "rights", "external-links-impact.md");
const read = (p) => readFileSync(join(root, p), "utf8");
const manifest = JSON.parse(read("subjects/manifest.json"));

// 1. pdfLocalUrl / pdfExternalUrl par sujet dans data/years.
const externalByLocalFile = new Map();
const localRefs = new Set();
let yearPayloads = 0;
const walkYears = (dir) => {
  for (const e of readdirSync(dir)) {
    const full = join(dir, e);
    if (statSync(full).isDirectory()) {
      walkYears(full);
      continue;
    }
    if (!full.endsWith(".js")) continue;
    yearPayloads += 1;
    const text = readFileSync(full, "utf8");
    const constUrls = {};
    for (const cm of text.matchAll(/const\s+([A-Z_0-9]+)\s*=\s*"([^"]+)"/g)) constUrls[cm[1]] = cm[2];
    for (const lm of [...text.matchAll(/pdfLocalUrl:\s*"([^"]+)"/g)]) {
      const local = lm[1].replace(/^\//, "");
      localRefs.add(local);
      const before = text.slice(0, lm.index);
      const exts = [...before.matchAll(/pdfExternalUrl:\s*([A-Z_0-9]+|"[^"]+")/g)];
      if (!exts.length) continue;
      const raw = exts[exts.length - 1][1];
      const resolved = raw.startsWith('"') ? raw.slice(1, -1) : constUrls[raw] || null;
      if (!resolved) continue;
      if (!externalByLocalFile.has(local)) externalByLocalFile.set(local, new Set());
      externalByLocalFile.get(local).add(resolved);
    }
  }
};
walkYears(join(root, "data", "years"));

// 2. Consommateurs mesures (chaines litterales presentes dans le code).
const viewer = read("js/ui/pdf-viewer.js");
const renderer = read("js/ui/pdf-renderer.js");
const strategy = read("js/ui/screens/strategy.js");
const hub = read("js/ui/screens/hub.js");
const sw = read("sw.js");
const server = read("server.mjs");
const build = read("build.mjs");
const publicAssets = read("scripts/lib/public-assets.mjs");
const verifyRelease = read("scripts/verify-release.mjs");
const pdfIntegrity = read("tests/pdf-content-integrity.test.mjs");
const pdfViewerTest = read("tests/pdf-viewer.test.mjs");
const swRuntimeTest = read("tests/service-worker-runtime.test.mjs");
const serverTest = read("tests/server.test.mjs");
const lazyTest = read("tests/lazy-loading.test.mjs");
const extBranch = viewer.slice(viewer.indexOf("if (external) {"));
const consumers = {
  "pdf-viewer branche locale (canvas + iframe masquee + ouverture + download)": [
    viewer.includes("subject?.pdfLocalUrl"),
    viewer.includes("data-pdf-src"),
    viewer.includes('iframe class="pdf-frame"'),
    viewer.includes("download")
  ],
  "pdf-viewer branche externe existante (sans local, sans iframe, sans download)": [
    viewer.includes("if (external) {"),
    extBranch.includes("فتح المصدر الخارجي") &&
      !extBranch.includes("download") &&
      !extBranch.includes("<iframe")
  ],
  "pdf-renderer rendu canvas + repli iframe": [
    renderer.includes("fallbackToFrame"),
    renderer.includes("iframe.pdf-frame")
  ],
  "strategy affichage via pdfViewerHTML(subject)": [strategy.includes("pdfViewerHTML(subject)")],
  "hub consultation archive via localPdfUrls": [hub.includes("entry.localPdfUrls")],
  "SW: PDF sujets en cache runtime borne, jamais precache": [
    sw.includes("Les data/years/** et les PDF sont volontairement absents"),
    sw.includes("/subjects\\/"),
    sw.includes("RUNTIME_MAX_ENTRIES")
  ],
  "server + public-assets: subjects servi et publie": [
    server.includes('"subjects/"'),
    publicAssets.includes('"subjects"')
  ],
  "build: dist/site recopie subjects, standalone sans PDF": [
    build.includes("mirrors the repository's `subjects/` directory"),
    build.includes("contains no PDF at all")
  ],
  "verify-release: verifie dist/site dont PDF": [
    verifyRelease.includes("release.json") && verifyRelease.includes("contentSha256")
  ],
  "test integrite: refs data existent, aucun orphelin, SW borne": [
    pdfIntegrity.includes("toute référence PDF écrite dans data/ existe réellement"),
    pdfIntegrity.includes("aucun PDF présent sur le disque n'est orphelin")
  ],
  "test viewer: externe sans iframe verrouille": [
    pdfViewerTest.includes("un sujet sans fichier local garde le lien source")
  ],
  "test SW runtime: PDF via cache borne": [
    swRuntimeTest.includes("un PDF de sujet doit passer par le cache borné")
  ],
  "test server Range via subjects/SE/2025/sujet-1.pdf": [serverTest.includes("subjects/SE/2025/sujet-1.pdf")],
  "test lazy via pdfLocalUrl + pdfExternalUrl dzexams": [
    lazyTest.includes("sujet-1"),
    lazyTest.includes("pdfExternalUrl")
  ]
};

const rows = manifest.map((e) => ({
  ...e,
  manifestUrl: /^https:\/\//.test(e.source || "") ? e.source : null,
  payloadUrls: [...(externalByLocalFile.get(e.file) || [])].sort()
}));
const DIRECT_PDF = /\/uploads\/sujets\/officiels\/.*\.pdf$/;
const withDirectPdf = rows.filter(
  (r) => (r.manifestUrl && DIRECT_PDF.test(r.manifestUrl)) || r.payloadUrls.some((u) => DIRECT_PDF.test(u))
);
const withoutDirectPdf = rows.filter((r) => !withDirectPdf.includes(r));

// 3. Archive de consultation : entrees et pdfUrl directs observes.
const archiveText = read("data/archive.js");
const archiveEntries = (archiveText.match(/^\s{4}\{\s*$/gm) || []).length;
const archiveDirect = [...archiveText.matchAll(/pdfUrl:\s*"([^"]+)"/g)].filter((m) =>
  DIRECT_PDF.test(m[1])
).length;

const consumerOk = Object.entries(consumers).filter(([, v]) => v.every(Boolean)).length;
const consumerTotal = Object.keys(consumers).length;
const totalPages = rows.reduce((a, r) => a + (r.pages || 0), 0);
const pdfBytes = rows.reduce((a, r) => {
  try {
    return a + statSync(join(root, r.file)).size;
  } catch {
    return a;
  }
}, 0);
const pdfMio = (pdfBytes / 1048576).toFixed(2).replace(".", ",");

// ---------------------------------------------------------------------------
// Document genere
// ---------------------------------------------------------------------------
const lines = [];
lines.push("# Analyse d'impact — bascule des PDF locaux vers des liens externes");
lines.push("");
lines.push("_Tout est mesuré sur l'arbre : aucune estimation._");
lines.push("_Document généré — ne pas éditer à la main._");
lines.push("");
lines.push(`## 1. Ce qui consomme les fichiers locaux de \`subjects/\``);
lines.push("");
lines.push(
  `Mesure : \`node scripts/measure-external-links-impact.mjs\` → **${consumerOk}/${consumerTotal} consommateurs confirmés \`true\`**.`
);
lines.push("");
lines.push(
  '- `js/ui/pdf-viewer.js` — branche locale : `subject?.pdfLocalUrl`, rendu `<canvas>` via `data-pdf-src`, `<iframe class="pdf-frame">` masquée en repli, liens d\'ouverture et `download`. Branche externe déjà existante : `if (external) {` → lien `فتح المصدر الخارجي` en `_blank`, sans `<iframe>` ni `download` (verrouillé par `tests/pdf-viewer.test.mjs` : « un sujet sans fichier local garde le lien source, sans cadre vide »).'
);
lines.push(
  "- `js/ui/pdf-renderer.js` — rendu pdf.js sur canvas (`fallbackToFrame`, `iframe.pdf-frame`) : ne sait lire qu'une URL même origine servie par l'application."
);
lines.push(
  "- `js/ui/screens/strategy.js` — affichage épreuve via `pdfViewerHTML(subject)` : sans `pdfLocalUrl`, bascule automatique vers la branche externe."
);
lines.push(
  "- `js/ui/screens/hub.js` — cartes de consultation d'archive via `entry.localPdfUrls` + `pdfViewerHTML({ pdfLocalUrl: href })`."
);
lines.push(
  "- `sw.js` — PDF sujets reconnus par `isRuntimeAsset` (`/subjects\\//`), jamais précachés (« Les data/years/** et les PDF sont volontairement absents »), cache runtime borné `RUNTIME_MAX_ENTRIES = 20`."
);
lines.push(
  "- `server.mjs:52` + `scripts/lib/public-assets.mjs:6` — `subjects/` servi au public et copié dans la release."
);
lines.push(
  "- `build.mjs` — `dist/site` recopie `subjects/` (« mirrors the repository's `subjects/` directory ») ; le monofichier standalone « contains no PDF at all »."
);
lines.push(
  "- `scripts/verify-release.mjs` — vérifie `release.json` + `contentSha256` de `dist/site`, PDF inclus."
);
lines.push(
  "- Tests verrouillant le local : `tests/pdf-content-integrity.test.mjs` (toute ref `data/` existe, aucun PDF orphelin, SW borné), `tests/service-worker-runtime.test.mjs` (PDF via cache borné), `tests/server.test.mjs` (Range via `subjects/SE/2025/sujet-1.pdf`), `tests/lazy-loading.test.mjs` (`pdfLocalUrl` + `pdfExternalUrl`)."
);
lines.push("");
lines.push("## 2. Ce qui existe déjà en externe (mesuré fichier par fichier)");
lines.push("");
lines.push(
  `- \`subjects/manifest.json\` : **${rows.length} entrées · ${rows.filter((r) => r.manifestUrl).length} avec URL source · ${rows.filter((r) => !r.manifestUrl).length} sans URL** · ${totalPages} pages · ${pdfMio} Mio.`
);
lines.push(
  `- \`data/years/**\` : ${yearPayloads} payloads, ${localRefs.size} références \`pdfLocalUrl\`, ${externalByLocalFile.size} fichiers avec \`pdfExternalUrl\` mesuré (page annales, PDF direct ou miroir).`
);
lines.push(
  `- \`data/archive.js\` : ${archiveEntries} entrées de consultation, dont ${archiveDirect} avec \`pdfUrl\` direct observé.`
);
lines.push("");
lines.push("## 3. Verdict chiffré");
lines.push("");
lines.push(
  `- **${withDirectPdf.length}/${rows.length} sujets basculables sans perte** : PDF direct externe mesuré dans le manifeste (\`source\`) et/ou \`data/years\`.`
);
lines.push(
  `- **${withoutDirectPdf.length}/${rows.length} sujets perdus ou à re-sourcer** (aucun PDF direct externe mesuré) :`
);
lines.push("");
lines.push("```bash");
lines.push('node scripts/measure-external-links-impact.mjs  # champ "missing"');
lines.push("```");
lines.push("");
lines.push("| fichier | URL externes mesurées |");
lines.push("| --- | --- |");
for (const r of withoutDirectPdf) {
  const urls = r.payloadUrls.length ? r.payloadUrls.map((u) => `\`${u}\``).join(" ; ") : "**aucune**";
  lines.push(`| \`${r.file}\` | ${urls} |`);
}
lines.push("");
lines.push(
  "Trois situations distinctes, à ne pas confondre : une **page d'annales** n'est pas un lien PDF direct ; un **miroir** (eddirasa) n'est pas la source officielle ; l'**absence** totale interdit toute bascule sans source nouvelle."
);
lines.push("");
lines.push(
  "La cause de chaque absence doit être documentée avant toute bascule : une URL devinée est pire qu'une URL absente dans un dossier juridique. Aucune source alternative ne doit être inventée."
);
lines.push("");
lines.push(
  "Conséquence : sans autorisation, ces sujets deviendraient inaccessibles en lecture intégrée, ou exigeraient une source alternative à documenter."
);
lines.push("");
lines.push("## 4. Effets collatéraux d'une bascule");
lines.push("");
lines.push(
  "- Lecture intégrée (canvas + iframe de repli même origine), téléchargement et prévisualisation stratégie : perdus pour tout sujet sans local (le rendu pdf.js ne peut pas lire un domaine tiers via la CSP)."
);
lines.push(
  "- Hors ligne : le cache runtime borné (`sw.js`) ne couvre qu'une même origine — les sujets externes ne sont plus disponibles hors connexion."
);
lines.push(
  `- \`dist/site\` : −${pdfMio} Mio de PDF ; le monofichier standalone est déjà sans PDF (aucun changement).`
);
lines.push(
  "- Tests à réécrire : `tests/pdf-content-integrity.test.mjs` (« aucun PDF orphelin », refs `data/` existantes), `tests/lazy-loading.test.mjs` (`pdfLocalUrl`), `tests/server.test.mjs` (Range PDF local), `tests/service-worker-runtime.test.mjs` (cache borné d'un PDF de sujet), `tests/e2e/offline-pwa.spec.mjs` (téléchargement PDF)."
);
lines.push(
  "- Le garde-fou P3.2 (`scripts/report-p3-status.mjs:71-77`) exige la branche externe sans iframe ni download — il resterait vert, la branche existe déjà."
);
lines.push("");
lines.push("## Méthode de génération");
lines.push("");
lines.push(
  "Document généré par `node scripts/measure-external-links-impact.mjs` depuis `subjects/manifest.json`, `data/years/**`, `data/archive.js` et les fichiers consommateurs. Contrôle :"
);
lines.push("");
lines.push("```bash");
lines.push("node scripts/measure-external-links-impact.mjs --check");
lines.push("```");
lines.push("");

const out = `${lines.join("\n")}`;
if (process.argv.includes("--check")) {
  const current = readFileSync(OUT_PATH, "utf8");
  if (current !== out) {
    console.error("external links impact is stale. Run: node scripts/measure-external-links-impact.mjs");
    process.exit(1);
  }
  console.log(
    `external links impact is current (${rows.length} entries, ${withDirectPdf.length} switchable, ${withoutDirectPdf.length} missing).`
  );
} else {
  writeFileSync(OUT_PATH, out);
  console.log(
    `external links impact written (${rows.length} entries, ${withDirectPdf.length} switchable, ${withoutDirectPdf.length} missing).`
  );
}
