/* Generates docs/rights/request-dossier.md from measured data only.
 * Manifest: subjects/manifest.json (58 files, pages, manifest URL).
 * Payloads: data/years (pdfExternalUrl observed per local sujet file).
 * No invented URLs: anything not measured is marked "non documente".
 * Usage: node scripts/generate-rights-request-dossier.mjs [--check]
 */
import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(fileURLToPath(new URL("../", import.meta.url)), "");
const MANIFEST_PATH = join(root, "subjects/manifest.json");
const OUT_PATH = join(root, "docs", "rights", "request-dossier.md");
const manifest = JSON.parse(readFileSync(MANIFEST_PATH, "utf8"));

const externalByLocalFile = new Map();
const walk = (dir) => {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      walk(full);
      continue;
    }
    if (!full.endsWith(".js")) continue;
    const text = readFileSync(full, "utf8");
    const constUrls = {};
    for (const cm of text.matchAll(/const\s+([A-Z_0-9]+)\s*=\s*"([^"]+)"/g)) constUrls[cm[1]] = cm[2];
    const localMatches = [...text.matchAll(/pdfLocalUrl:\s*"([^"]+)"/g)];
    for (const lm of localMatches) {
      // External URL is declared BEFORE the local URL inside the same sujet block:
      // take the last pdfExternalUrl occurring before this pdfLocalUrl.
      const before = text.slice(0, lm.index);
      const exts = [...before.matchAll(/pdfExternalUrl:\s*([A-Z_0-9]+|"[^"]+")/g)];
      if (exts.length === 0) continue;
      const raw = exts[exts.length - 1][1];
      const resolved = raw.startsWith('"') ? raw.slice(1, -1) : constUrls[raw] || null;
      if (!resolved) continue;
      const local = lm[1].replace(/^\//, "");
      if (!externalByLocalFile.has(local)) externalByLocalFile.set(local, new Set());
      externalByLocalFile.get(local).add(resolved);
    }
  }
};
walk(join(root, "data", "years"));

const rows = manifest.map((entry) => {
  const manifestUrl = /^https:\/\//.test(entry.source || "") ? entry.source : null;
  const payloadUrls = [...(externalByLocalFile.get(entry.file) || [])].sort();
  return { ...entry, manifestUrl, payloadUrls };
});
const withManifestUrl = rows.filter((r) => r.manifestUrl).length;
const withoutManifestUrl = rows.length - withManifestUrl;
const totalPages = rows.reduce((sum, r) => sum + (r.pages || 0), 0);
const tracks = [...new Set(rows.map((r) => r.track))].sort();
const years = [...new Set(rows.map((r) => r.year))].sort((a, b) => a - b);
const sessions = [...new Set(rows.map((r) => r.session))].sort();

const lines = [];
lines.push("# Dossier de demande d'autorisation — 58 PDF servis sous `subjects/`");
lines.push("");
lines.push("_Date de génération : 19 septembre 2026._");
lines.push(
  "_Source de vérité : `subjects/manifest.json` (58 entrées) croisé avec les `pdfExternalUrl` mesurés dans `data/years/**`. Aucune URL devinée : toute donnée absente est marquée « non documenté »._"
);
lines.push("");
lines.push("## Mesures");
lines.push("");
lines.push(`- Entrées : **${rows.length}**`);
lines.push(
  `- Filières : ${tracks.map((t) => `\`${t}\` : ${rows.filter((r) => r.track === t).length}`).join(" · ")}`
);
lines.push(`- Millésimes : ${years[0]} → ${years[years.length - 1]} (${years.length} : ${years.join(", ")})`);
lines.push(
  `- Sessions : ${sessions.map((s) => `\`${s}\` : ${rows.filter((r) => r.session === s).length}`).join(" · ")}`
);
lines.push(`- Pages : **${totalPages}** au total (champ \`pages\` du manifeste)`);
lines.push(
  `- Provenance manifeste : **${withManifestUrl} avec URL externe · ${withoutManifestUrl} sans URL**`
);
lines.push("");
lines.push("## Fondement de la demande");
lines.push("");
lines.push(
  "`LICENSE-CONTENT:9-12` exclut les sujets d'examen, corrigés, scans, logos, liens externes et contenus tiers : ils « must not be redistributed without documented permission » (rappelé par `NOTICE` et `docs/CONTENT_RIGHTS.md:9`)."
);
lines.push("");
lines.push(
  "Les 58 fichiers ci-dessous sont des contenus tiers servis au public (`subjects/` dans `PUBLIC_DIRECTORIES`, `server.mjs:52` et `scripts/lib/public-assets.mjs:6`). Une URL publique ne prouve pas un droit de redistribution. Ce dossier demande au titulaire compétent une **autorisation écrite de redistribution de ces sujets au sein de l'application** (affichage intégré, téléchargement, cache hors ligne borné) — à distinguer du simple lien externe."
);
lines.push("");
lines.push("## Tableau complet des 58 fichiers");
lines.push("");
lines.push(
  "| Fichier | Année | Filière | Session | Pages | URL source (manifeste) | URL externe mesurée (`data/years`) |"
);
lines.push("| --- | --- | --- | --- | --- | --- | --- |");
for (const r of rows) {
  const payloadCell = r.payloadUrls.length === 0 ? "non documenté" : r.payloadUrls.join("<br>");
  lines.push(
    `| \`${r.file}\` | ${r.year} | ${r.track} | ${r.session} | ${r.pages} | ${r.manifestUrl || "non documenté"} | ${payloadCell} |`
  );
}
lines.push("");
lines.push(`## Fichiers sans URL dans le manifeste (${withoutManifestUrl})`);
lines.push("");
lines.push(
  "Aucune URL dans `source`. La colonne `data/years` peut contenir une URL observée (page annales ou miroir) ; un lien de page n'est pas un lien PDF direct, et aucun des deux ne prouve un droit de redistribution."
);
lines.push("");
for (const r of rows.filter((x) => !x.manifestUrl)) {
  const payloadCell =
    r.payloadUrls.length === 0 ? "aucune URL mesurée — non documenté" : r.payloadUrls.join(" ; ");
  lines.push(`- \`${r.file}\` (${r.track} ${r.year} ${r.session}, ${r.pages} pages) — ${payloadCell}`);
}
lines.push("");
lines.push("## Objet précis de la demande au titulaire");
lines.push("");
lines.push(
  "1. Autorisation écrite de **redistribuer** les 58 PDF listés (affichage intégré, téléchargement, cache hors ligne borné), pas seulement de lier la source."
);
lines.push("2. Périmètre : mêmes fichiers, années, filières et sessions, sans modification du contenu.");
lines.push(
  "3. En cas d'accord partiel, préciser fichiers couverts, durée et limites pour documenter `NOTICE` et `docs/CONTENT_RIGHTS.md`."
);
lines.push(
  "4. Sans autorisation, le repli est la bascule vers liens externes — voir `docs/rights/external-links-impact.md`."
);
lines.push("");
lines.push("## Méthode de génération");
lines.push("");
lines.push(
  "Tableau généré par `node scripts/generate-rights-request-dossier.mjs` depuis `subjects/manifest.json` + `data/years/**`. Contrôle :"
);
lines.push("");
lines.push("```bash");
lines.push("node scripts/generate-rights-request-dossier.mjs --check");
lines.push("```");
lines.push("");

const out = `${lines.join("\n")}`;
if (process.argv.includes("--check")) {
  const current = readFileSync(OUT_PATH, "utf8");
  if (current !== out) {
    console.error("request dossier is stale. Run: node scripts/generate-rights-request-dossier.mjs");
    process.exit(1);
  }
  console.log(`request dossier is current (${rows.length} entries).`);
} else {
  writeFileSync(OUT_PATH, out);
  console.log(
    `request dossier written (${rows.length} entries, ${withManifestUrl} with URL, ${withoutManifestUrl} without).`
  );
}
