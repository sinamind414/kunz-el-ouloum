/* Patch chirurgical de mots connus dans les couches texte générées maison.
   Ne touche QUE les mots Tj décodés correspondant EXACTEMENT (mot entier)
   aux clés de la patchlist. Clés à espaces = mots Tj consécutifs (le 1er
   reçoit le mot corrigé, les suivants sont vidés). Nouveaux caractères ->
   codes de rechange, ToUnicode reconstruit. Descend dans les XObjects
   de forme (qpdf --overlay
   place la couche texte dans /Fx1). Usage :
     node scripts/patch-text-words.mjs scripts/patch-words-2E.json incoming/patched/
   Vérifier ensuite par extraction pdf.js (ancien absent, nouveau présent). */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { createRequire } from "node:module";
import zlib from "node:zlib";

const require = createRequire(import.meta.url);
const { PDFDocument, PDFName, PDFArray } = require("pdf-lib");

const AR = /[\u0600-\u06FF]/;
/* Nos couches stockent du VISUEL bidi : pur arabe = inversé, pur latin = tel quel.
   (La patchlist ne contient que ces deux cas, vérifiés un par un.)
   python-bidi a parfois inséré des marques directionnelles invisibles
   (ex. U+200F après « gb ») : on les ignore à la comparaison. */
const MARKS = /[\u200E\u200F\u202A-\u202E\u2066-\u2069\u061C\uFEFF]/g;
const flip = (s) => {
  const clean = s.replace(MARKS, "");
  return AR.test(clean) ? [...clean].reverse().join("") : clean;
};

function pool() {
  const p = [];
  for (let b = 0x20; b < 0x7f; b += 1) if (![0x28, 0x29, 0x5c].includes(b)) p.push(b);
  for (let b = 0xa0; b < 0x100; b += 1) p.push(b);
  return p;
}

function parseCMap(str) {
  const entries = [];
  const re = /<([0-9A-Fa-f]{2})>\s*<([0-9A-Fa-f]{4,8})>/g;
  let m;
  while ((m = re.exec(str))) entries.push([parseInt(m[1], 16), String.fromCodePoint(parseInt(m[2], 16))]);
  const head = str.slice(0, str.search(/\d+ beginbfchar/));
  const foot = str.slice(str.lastIndexOf("endbfchar") + 9);
  return { entries, head, foot };
}

function buildCMap(head, entries, foot) {
  const blocks = [];
  for (let i = 0; i < entries.length; i += 100) {
    const block = entries.slice(i, i + 100);
    blocks.push(`${block.length} beginbfchar`);
    for (const [code, ch] of block)
      blocks.push(
        `<${code.toString(16).toUpperCase().padStart(2, "0")}> <${ch.codePointAt(0).toString(16).toUpperCase().padStart(4, "0")}>`
      );
    blocks.push("endbfchar");
  }
  return `${head} ${blocks.join(" ")} ${foot}`;
}

function streamText(st) {
  const raw = Buffer.from(st.getContents());
  const filter = st.dict.lookup(PDFName.of("Filter"));
  const name = filter instanceof PDFArray ? filter.lookup(0).toString() : filter ? filter.toString() : null;
  if (!name) return { text: raw.toString("latin1"), flate: false };
  if (name === "/FlateDecode") return { text: zlib.inflateSync(raw).toString("latin1"), flate: true };
  return { text: null, flate: false };
}

function streamWrite(st, text, flate) {
  const buf = Buffer.from(text, "latin1");
  st.contents = Uint8Array.from(flate ? zlib.deflateSync(buf) : buf);
}

function unescape(bytes) {
  const out = [];
  for (let i = 0; i < bytes.length; i += 1) {
    if (bytes[i] === 0x5c && i + 1 < bytes.length) {
      out.push(bytes[i + 1]);
      i += 1;
    } else out.push(bytes[i]);
  }
  return out;
}

function escapeStr(codes) {
  let s = "(";
  for (const c of codes) {
    if (c === 0x28 || c === 0x29 || c === 0x5c) s += "\\";
    s += String.fromCharCode(c);
  }
  return `${s})`;
}

async function patchFile(src, patchmap, dest) {
  const doc = await PDFDocument.load(readFileSync(src), { ignoreEncryption: true });
  const report = { patched: 0, words: {}, newChars: [], targets: 0, tj: 0 };
  const seen = new Set();
  function scopesFor(resDict, contentObj, out) {
    if (!resDict || !contentObj) return;
    out.push({ res: resDict, content: contentObj });
    const xo = resDict.lookup(PDFName.of("XObject"));
    if (xo && typeof xo.keys === "function") {
      for (const k of xo.keys()) {
        const f = xo.lookup(k);
        if (f && f.dict && !seen.has(f)) {
          seen.add(f);
          scopesFor(f.dict.lookup(PDFName.of("Resources")), f, out);
        }
      }
    }
  }
  for (const page of doc.getPages()) {
    const scopes = [];
    scopesFor(page.node.lookup(PDFName.of("Resources")), page.node.lookup(PDFName.of("Contents")), scopes);
    for (const { res, content } of scopes) {
      const fonts = res.lookup(PDFName.of("Font"));
      if (!fonts || typeof fonts.keys !== "function") continue;
      let target = null;
      for (const key of fonts.keys()) {
        const f = fonts.lookup(key);
        const tu = f && f.lookup(PDFName.of("ToUnicode"));
        if (tu && tu.getContents) {
          const decoded = streamText(tu);
          if (decoded.text && decoded.text.includes("beginbfchar")) {
            target = { font: f, stream: tu, cmap: decoded.text, flate: decoded.flate };
            break;
          }
        }
      }
      if (!target) continue;
      report.targets += 1;
      const { entries, head, foot } = parseCMap(target.cmap);
      const codeOf = new Map(entries.map(([c, ch]) => [ch, c]));
      const byteOf = new Map(entries.map(([c, ch]) => [c, ch]));
      const spare = pool().filter((c) => !byteOf.has(c));
      const alloc = (ch) => {
        if (!codeOf.has(ch)) {
          if (!spare.length) throw new Error(`plus de codes de rechange (${src})`);
          const c = spare.shift();
          codeOf.set(ch, c);
          entries.push([c, ch]);
          report.newChars.push(ch);
        }
        return codeOf.get(ch);
      };
      const streams =
        content && typeof content.size === "function"
          ? Array.from({ length: content.size() }, (_, i) => content.lookup(i))
          : [content];
      const before = report.newChars.length;
      for (const st of streams) {
        if (!st || !st.getContents) continue;
        const { text, flate } = streamText(st);
        if (text === null) continue;
        const re = /\((?:\\[\\()]|[^()\\])*\)\s*Tj/g;
        const found = [];
        let m;
        while ((m = re.exec(text))) {
          report.tj += 1;
          const inner = Buffer.from(m[0].slice(1, m[0].indexOf(")")), "latin1");
          const bytes = unescape(inner);
          let shown = null;
          if (!bytes.some((b) => !byteOf.has(b))) {
            shown = flip(bytes.map((b) => byteOf.get(b)).join(""));
          }
          found.push({ m, shown });
        }
        /* Gauche→droite glouton : clés multi-mots (les plus longues d'abord),
         sinon mot seul. Clé multi = 1er Tj remplacé, suivants vidés. */
        const multi = Object.keys(patchmap)
          .filter((k) => k.includes(" "))
          .sort((a, b) => b.length - a.length);
        let out = "";
        let last = 0;
        let dirty = false;
        let i = 0;
        while (i < found.length) {
          let done = null;
          for (const k of multi) {
            const parts = k.split(" ");
            if (found.slice(i, i + parts.length).every((f, j) => f.shown === parts[j])) {
              done = { n: parts.length, key: k };
              break;
            }
          }
          if (!done && found[i].shown !== null && found[i].shown in patchmap) {
            done = { n: 1, key: found[i].shown };
          }
          if (!done) {
            i += 1;
            continue;
          }
          const newBytes = [...flip(patchmap[done.key])].map(alloc);
          const first = found[i];
          out += text.slice(last, first.m.index) + escapeStr(newBytes) + " Tj";
          last = first.m.index + first.m[0].length;
          for (let j = 1; j < done.n; j += 1) {
            const f = found[i + j];
            out += text.slice(last, f.m.index) + "() Tj";
            last = f.m.index + f.m[0].length;
          }
          dirty = true;
          report.patched += 1;
          report.words[done.key] = (report.words[done.key] || 0) + 1;
          i += done.n;
        }
        if (dirty) {
          out += text.slice(last);
          streamWrite(st, out, flate);
        }
      }
      if (report.newChars.length > before) {
        const rebuilt = buildCMap(
          head,
          entries.sort((a, b) => a[0] - b[0]),
          foot
        );
        streamWrite(target.stream, rebuilt, target.flate);
      }
    }
  }
  mkdirSync(join(dest), { recursive: true });
  const tag = src
    .replace(/^subjects\//, "")
    .replaceAll("/", "-")
    .replace(/\.pdf$/, "");
  writeFileSync(join(dest, tag + ".patched.pdf"), await doc.save());
  return report;
}

const [patchlistPath, outdir] = process.argv.slice(2);
const patchlist = JSON.parse(readFileSync(patchlistPath, "utf-8"));
for (const [file, map] of Object.entries(patchlist)) {
  if (file.startsWith("_")) continue;
  try {
    const r = await patchFile(file, map, outdir);
    console.log(
      `${file} => targets=${r.targets} tj=${r.tj} patched=${r.patched} ${JSON.stringify(r.words)} newChars=${r.newChars.length}`
    );
  } catch (e) {
    console.log(`${file} => ERREUR ${e.message}`);
  }
}
