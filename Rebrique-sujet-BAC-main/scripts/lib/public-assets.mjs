import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

export const PUBLIC_ROOT_FILES = Object.freeze(["index.html", "manifest.webmanifest", "sw.js"]);
export const PUBLIC_DIRECTORIES = Object.freeze(["assets", "js", "data", "legal", "subjects"]);
export const GENERATED_VERSION_FILE = "js/app-version.js";

const repoPath = (root, path) => relative(root, path).split(sep).join("/");

function walkFiles(root, directory) {
  const absolute = join(root, directory);
  if (!existsSync(absolute)) return [];
  return readdirSync(absolute, { withFileTypes: true }).flatMap((entry) => {
    const path = join(absolute, entry.name);
    return entry.isDirectory() ? walkFiles(root, repoPath(root, path)) : [repoPath(root, path)];
  });
}

/** Exact static surface copied into dist/site. */
export function listPublicAssets(root) {
  const files = [
    ...PUBLIC_ROOT_FILES.filter((path) => existsSync(join(root, path))),
    ...PUBLIC_DIRECTORIES.flatMap((directory) => walkFiles(root, directory))
  ];
  return [...new Set(files)].filter((path) => statSync(join(root, path)).isFile()).sort();
}

export function sha256(content) {
  return createHash("sha256").update(content).digest("hex");
}

export function fileMetadata(root, path) {
  const content = readFileSync(join(root, path));
  return { path, bytes: content.byteLength, sha256: sha256(content) };
}

/**
 * Build ID is content-addressed over every deployable input except its own
 * generated carrier, avoiding a recursive hash. Manifest, icons and PDFs are
 * therefore first-class version inputs.
 */
export function computeBuildMetadata(root) {
  const inputs = listPublicAssets(root).filter((path) => path !== GENERATED_VERSION_FILE);
  const files = inputs.map((path) => fileMetadata(root, path));
  const aggregate = createHash("sha256");
  for (const file of files) {
    aggregate.update(file.path);
    aggregate.update("\0");
    aggregate.update(file.sha256);
    aggregate.update("\0");
  }
  return {
    schemaVersion: 1,
    buildId: aggregate.digest("hex").slice(0, 12),
    files
  };
}
