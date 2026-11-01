import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { computeBuildMetadata, GENERATED_VERSION_FILE, sha256 } from "./lib/public-assets.mjs";

const defaultRoot = fileURLToPath(new URL("../", import.meta.url));
const REVISIONED_ASSETS = new Set(["manifest.webmanifest", "assets/icon-192.png", "assets/icon-512.png"]);
const ICON_ASSETS = ["assets/icon-192.png", "assets/icon-512.png"];

const contentRevision = (root, path) => sha256(readFileSync(join(root, path))).slice(0, 12);

/** Puts immutable icon revisions into the URLs actually consumed by browsers. */
export function updateRevisionedIconUrls(root = defaultRoot) {
  const revisions = Object.fromEntries(ICON_ASSETS.map((path) => [path, contentRevision(root, path)]));
  const manifestPath = join(root, "manifest.webmanifest");
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  manifest.icons = manifest.icons.map((icon) => {
    const path = String(icon.src).split("?")[0];
    return revisions[path] ? { ...icon, src: `${path}?v=${revisions[path]}` } : icon;
  });
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

  const indexPath = join(root, "index.html");
  let index = readFileSync(indexPath, "utf8");
  for (const [path, revision] of Object.entries(revisions)) {
    index = index.replaceAll(
      new RegExp(`${path.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?:\\?v=[a-f0-9]+)?`, "g"),
      `${path}?v=${revision}`
    );
  }
  writeFileSync(indexPath, index);
  return revisions;
}

export function renderPwaVersion(metadata) {
  const revisions = metadata.files
    .filter((file) => REVISIONED_ASSETS.has(file.path))
    .map(
      (file) =>
        `  ${JSON.stringify(file.path)}: {\n    bytes: ${file.bytes},\n    sha256: ${JSON.stringify(file.sha256)}\n  }`
    )
    .join(",\n");
  return `// Generated deterministically by scripts/generate-pwa-version.mjs\nglobalThis.APP_BUILD_ID = ${JSON.stringify(
    metadata.buildId
  )};\nglobalThis.APP_ASSET_REVISIONS = Object.freeze({\n${revisions}\n});\n`;
}

export function writePwaVersion(root = defaultRoot) {
  updateRevisionedIconUrls(root);
  const metadata = computeBuildMetadata(root);
  writeFileSync(join(root, GENERATED_VERSION_FILE), renderPwaVersion(metadata));
  return metadata;
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const metadata = writePwaVersion();
  console.log(`PWA build id: ${metadata.buildId}`);
}
