import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { fileMetadata, sha256 } from "./lib/public-assets.mjs";

const defaultSite = fileURLToPath(new URL("../dist/site/", import.meta.url));
const repoPath = (root, path) => relative(root, path).split(sep).join("/");

function walk(root, directory = root) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? walk(root, path) : [repoPath(root, path)];
  });
}

function releaseDigest(files) {
  return sha256(files.map((file) => `${file.path}\0${file.sha256}\0`).join(""));
}

export function verifyRelease(siteRoot = defaultSite) {
  const manifestPath = join(siteRoot, "release.json");
  if (!existsSync(manifestPath)) throw new Error(`release manifest missing: ${manifestPath}`);
  const release = JSON.parse(readFileSync(manifestPath, "utf8"));
  if (release.schemaVersion !== 1 || !/^[a-f0-9]{12}$/.test(release.buildId || "")) {
    throw new Error("invalid release identity");
  }
  const expectedPaths = release.files.map((file) => file.path);
  if (new Set(expectedPaths).size !== expectedPaths.length)
    throw new Error("duplicate path in release manifest");
  if (expectedPaths.join("\n") !== [...expectedPaths].sort().join("\n")) {
    throw new Error("release files are not sorted");
  }
  const actualPaths = walk(siteRoot)
    .filter((path) => path !== "release.json")
    .sort();
  if (actualPaths.join("\n") !== expectedPaths.join("\n")) {
    throw new Error("release file set differs from manifest");
  }
  const actualFiles = expectedPaths.map((path) => {
    const absolute = join(siteRoot, path);
    if (!statSync(absolute).isFile()) throw new Error(`release entry is not a file: ${path}`);
    return fileMetadata(siteRoot, path);
  });
  for (let index = 0; index < actualFiles.length; index += 1) {
    const expected = release.files[index];
    const actual = actualFiles[index];
    if (expected.bytes !== actual.bytes || expected.sha256 !== actual.sha256) {
      throw new Error(`release checksum mismatch: ${actual.path}`);
    }
  }
  if (release.fileCount !== actualFiles.length) throw new Error("release fileCount mismatch");
  if (release.contentSha256 !== releaseDigest(actualFiles)) throw new Error("release tree digest mismatch");

  const versionSource = readFileSync(join(siteRoot, "js/app-version.js"), "utf8");
  const carriedBuildId = versionSource.match(/APP_BUILD_ID\s*=\s*"([a-f0-9]{12})"/)?.[1];
  if (carriedBuildId !== release.buildId) throw new Error("release build ID differs from app-version.js");
  return release;
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const siteRoot = process.argv[2] ? join(process.cwd(), process.argv[2]) : defaultSite;
  const release = verifyRelease(siteRoot);
  console.log(
    `Release ${release.buildId} verified: ${release.fileCount} files, sha256 ${release.contentSha256}`
  );
}
