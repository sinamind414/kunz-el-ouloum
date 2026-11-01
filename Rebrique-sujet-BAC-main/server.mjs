/* Production-like static server: explicit public surface, CSP and safe MIME types. */
import { createReadStream, existsSync, readFileSync, realpathSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, isAbsolute, join, normalize, relative, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = fileURLToPath(new URL(".", import.meta.url));
const host = process.env.HOST || "0.0.0.0";
const argIdx = process.argv.indexOf("--port");
const port = Number(process.env.PORT || (argIdx >= 0 ? process.argv[argIdx + 1] : undefined) || 8080);
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json",
  ".png": "image/png",
  ".pdf": "application/pdf"
};

/* Origines autorisées à intégrer l'application dans un cadre. Par défaut, seule
   l'origine propre : aucun hôte de prévisualisation n'est figé dans la CSP de
   production. Un environnement qui a besoin d'être intégré le déclare par
   `CSP_FRAME_ANCESTORS="'self' https://hote.exemple"`. Toute valeur non
   conforme fait échouer le démarrage plutôt que d'élargir silencieusement la
   surface d'intégration. */
const FRAME_ANCESTOR = /^(?:'self'|https:\/\/(?:\*\.)?[a-z0-9-]+(?:\.[a-z0-9-]+)+)$/i;

/** @param {string | undefined} raw @returns {string} */
export function resolveFrameAncestors(raw) {
  const value = (raw ?? "'self'").trim();
  if (!value) return "'self'";
  for (const part of value.split(/\s+/)) {
    if (!FRAME_ANCESTOR.test(part)) {
      throw new Error(`CSP_FRAME_ANCESTORS invalide : « ${part} » (attendu 'self' ou https://hote)`);
    }
  }
  return value.split(/\s+/).join(" ");
}

const frameAncestors = resolveFrameAncestors(process.env.CSP_FRAME_ANCESTORS);

export const securityHeaders = {
  "Content-Security-Policy": `default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; media-src 'self'; connect-src 'self'; frame-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors ${frameAncestors}; form-action 'self'`,
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "microphone=(self)",
  "Cross-Origin-Resource-Policy": "same-origin"
};

const PUBLIC_FILES = new Set(["index.html", "manifest.webmanifest", "release.json", "sw.js"]);
const PUBLIC_DIRECTORIES = ["assets/", "js/", "data/", "legal/", "subjects/"];

/** Public URL allowlist. Build files, tests, docs, patches and dotfiles are never deployable assets. */
export function isPublicRoute(requested) {
  if (typeof requested !== "string" || !requested || requested.includes("\\")) return false;
  if (requested.split("/").some((part) => !part || part === "." || part === ".." || part.startsWith("."))) {
    return false;
  }
  return (
    PUBLIC_FILES.has(requested) || PUBLIC_DIRECTORIES.some((directory) => requested.startsWith(directory))
  );
}

/**
 * Résout un en-tête `Range` simple en une plage d'octets.
 * RFC 9110 §14.2 : `bytes=A-B`, `bytes=A-` (jusqu'à la fin) et le **suffixe**
 * `bytes=-N` qui demande les N DERNIERS octets du fichier — c'est ainsi qu'un
 * lecteur PDF va chercher le trailer et la table xref en fin de fichier.
 * Les multi-plages (`bytes=0-9,20-29`) ne sont pas prises en charge.
 *
 * @param {string|undefined} header valeur de l'en-tête Range
 * @param {number} size taille du fichier en octets
 * @returns {{start:number,end:number}|null|undefined}
 *   plage résolue, `null` si elle n'est pas satisfaisable (répondre 416),
 *   `undefined` si l'en-tête est inexploitable (répondre 200 complet).
 */
export function resolveByteRange(header, size) {
  const match = /^bytes=(\d*)-(\d*)$/.exec(String(header || "").trim());
  if (!match) return undefined;
  const first = match[1] === "" ? null : Number(match[1]);
  const last = match[2] === "" ? null : Number(match[2]);
  if (size <= 0) return null;
  if (first === null) {
    // Suffixe : les N derniers octets. `bytes=-` ou `bytes=-0` n'a pas de sens.
    if (last === null || last <= 0) return null;
    return { start: Math.max(0, size - last), end: size - 1 };
  }
  if (first > size - 1) return null;
  const end = last === null ? size - 1 : Math.min(last, size - 1);
  return first <= end ? { start: first, end } : null;
}

function notFound(res) {
  res.writeHead(404, { ...securityHeaders, "Content-Type": "text/plain; charset=utf-8" });
  res.end("Not found");
}

export function createStaticServer({ rootDirectory = root } = {}) {
  const canonicalRoot = realpathSync(rootDirectory);
  let buildId = "dev";
  try {
    const version = readFileSync(join(canonicalRoot, "js/app-version.js"), "utf8");
    buildId = version.match(/APP_BUILD_ID\s*=\s*"([a-f0-9]{12})"/)?.[1] || buildId;
  } catch {
    /* A missing version file is handled as a normal 404 by the route below. */
  }
  return createServer((req, res) => {
    if (!["GET", "HEAD"].includes(req.method || "GET")) {
      res.writeHead(405, { ...securityHeaders, Allow: "GET, HEAD" });
      res.end();
      return;
    }

    let pathname;
    try {
      pathname = decodeURIComponent(
        new URL(req.url || "/", `http://${req.headers.host || "localhost"}`).pathname
      );
    } catch {
      notFound(res);
      return;
    }
    const requested = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
    if (!isPublicRoute(requested)) {
      notFound(res);
      return;
    }

    const path = normalize(join(canonicalRoot, requested));
    const pathFromRoot = relative(canonicalRoot, path);
    if (
      pathFromRoot.startsWith("..") ||
      isAbsolute(pathFromRoot) ||
      !existsSync(path) ||
      !statSync(path).isFile()
    ) {
      notFound(res);
      return;
    }

    // A checked-in symlink inside an allowed directory must not escape the public root.
    const canonicalPath = realpathSync(path);
    const canonicalRelative = relative(canonicalRoot, canonicalPath);
    if (canonicalRelative.startsWith("..") || isAbsolute(canonicalRelative)) {
      notFound(res);
      return;
    }

    const extension = extname(canonicalPath);
    const stat = statSync(canonicalPath);
    /* Politique de cache : rien de ce qui porte la LOGIQUE ou les DONNÉES ne
       doit rester 24 h dans le cache HTTP sans revalidation.

       Contre-exemple mesuré : `max-age=86400` sur `data/years/**` faisait
       rejouer par le navigateur l'ancienne charge utile d'une année pourtant
       déjà modifiée sur le serveur. Le catalogue (`data/subjects.js`), frais,
       la validait contre une structure périmée, la validation échouait et
       l'année refusait de s'ouvrir — jusqu'à 24 heures, rechargement compris.

       Seules restent cacheables les icônes (leur URL porte déjà l'empreinte du
       contenu, `?v=<sha256>`, donc un changement change l'URL) et les PDF,
       immuables mais servis avec `must-revalidate`. */
    const cacheControl =
      extension === ".png"
        ? "public, max-age=86400"
        : extension === ".pdf"
          ? "public, max-age=0, must-revalidate"
          : "no-cache";

    // Minimal Range support so PDF viewers can seek and first-page rendering
    // doesn't have to wait for a full multi-megabyte download. Only a single
    // bytes=start-end / start- / -suffix range is supported (no multi-range).
    let start = 0;
    let end = stat.size - 1;
    let status = 200;
    if (extension === ".pdf" && req.headers.range) {
      const range = resolveByteRange(req.headers.range, stat.size);
      if (range === null) {
        // Plage demandée hors du fichier : le dire explicitement plutôt que de
        // renvoyer silencieusement des octets qui ne sont pas ceux attendus.
        res.writeHead(416, {
          ...securityHeaders,
          "Content-Type": "text/plain; charset=utf-8",
          "Content-Range": `bytes */${stat.size}`,
          "Accept-Ranges": "bytes"
        });
        return res.end(req.method === "HEAD" ? undefined : "Range Not Satisfiable");
      }
      if (range) {
        start = range.start;
        end = range.end;
        if (start > 0 || end < stat.size - 1) status = 206;
      }
    }
    res.writeHead(status, {
      ...securityHeaders,
      "Content-Type": types[extension] || "application/octet-stream",
      "Content-Length": end - start + 1,
      "Accept-Ranges": "bytes",
      ...(status === 206 ? { "Content-Range": `bytes ${start}-${end}/${stat.size}` } : {}),
      "Cache-Control": cacheControl,
      "X-Miftah-Build": buildId
    });
    if (req.method === "HEAD") return res.end();
    createReadStream(canonicalPath, { start, end }).pipe(res);
  });
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const rootDirectory = process.env.PUBLIC_ROOT ? resolve(root, process.env.PUBLIC_ROOT) : root;
  createStaticServer({ rootDirectory }).listen(port, host, () =>
    console.log(`Miftah Kanz ${rootDirectory} available at http://${host}:${port}`)
  );
}
