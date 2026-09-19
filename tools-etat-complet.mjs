// tools-etat-complet.mjs — rapport d'état UTF-8 (une passe) :
//  1) chaque fichier public/lessons/*.html : divs chapter-view + h1
//  2) src/lessonData.ts : clés de EXPERIMENTAL_LESSONS + titleAr
//  3) src/data/unitLessonSequences.ts : séquence officielle par unité
//  4) écart entre chapitres HTML et TDM officielle (book_tdm_clean.md / TDM.txt)
import fs from 'fs';

const out = [];
const log = (...a) => out.push(a.join(' '));

// ---------- 1) HTML ----------
log('=== 1) CHAPITRES HTML (public/lessons) ===');
const dir = 'public/lessons';
const files = fs.readdirSync(dir).filter((f) => f.endsWith('.html')).sort();
let totalChapters = 0;
for (const f of files) {
  const html = fs.readFileSync(`${dir}/${f}`, 'utf8');
  const blocks = [];
  const re = /<div\s+id="([^"]+)"\s+class="([^"]*chapter-view[^"]*)"[^>]*>([\s\S]*?)(?=<div\s+id="[^"]+"\s+class="[^"]*chapter-view|<\/body>)/g;
  const idxs = [];
  const openRe = /<div\s+id="([^"]+)"\s+class="([^"]*chapter-view[^"]*)"[^>]*>/g;
  let m;
  while ((m = openRe.exec(html))) idxs.push({ id: m[1], at: m.index });
  for (let i = 0; i < idxs.length; i += 1) {
    const slice = html.slice(idxs[i].at, idxs[i + 1] ? idxs[i + 1].at : html.length);
    const h1 = (slice.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) || [, ''])[1].replace(/\s+/g, ' ').trim();
    blocks.push({ id: idxs[i].id, h1 });
  }
  totalChapters += blocks.length;
  log(`--- ${f}  [${blocks.length} chapitre(s)]`);
  for (const b of blocks) log(`    #${b.id} :: ${b.h1}`);
}
log(`TOTAL chapitres HTML = ${totalChapters}  (fichiers=${files.length})`);
log('');

// ---------- 2) lessonData ----------
log('=== 2) src/lessonData.ts ===');
const ld = fs.readFileSync('src/lessonData.ts', 'utf8');
const keys = [...ld.matchAll(/^\s{2}"([^"]+)":\s*\{/gm)].map((m) => m[1]);
log(`EXPERIMENTAL_LESSONS keys = ${keys.length}`);
for (const k of keys) {
  const at = ld.indexOf(`"${k}": {`);
  const seg = ld.slice(at, at + 900);
  const t = (seg.match(/titleAr:\s*`([^`]+)`/) || [, ''])[1];
  log(`    ${k} :: ${t}`);
}
const slugs = (ld.match(/EXPERIMENTAL_SLUGS[^=]*=\s*\[([^\]]*)\]/) || [, ''])[1];
const slugList = (slugs.match(/`([^`]+)`/g) || []).map((s) => s.slice(1, -1));
log(`EXPERIMENTAL_SLUGS = ${slugList.length}`);
const missingInSlugs = keys.filter((k) => !slugList.includes(k));
log(`clés absentes de EXPERIMENTAL_SLUGS : ${missingInSlugs.length ? missingInSlugs.join(', ') : '(aucune)'}`);
log('');

// ---------- 3) séquences ----------
log('=== 3) src/data/unitLessonSequences.ts (OFFICIAL_PROGRAM_SEQUENCE) ===');
const seq = fs.readFileSync('src/data/unitLessonSequences.ts', 'utf8');
for (const line of seq.split(/\r?\n/)) {
  if (/^\s*\d+:\s*\[/.test(line)) log('    ' + line.trim());
}
log('');

// ---------- 4) TDM officielle ----------
log('=== 4) TDM OFFICIELLE (TDM.txt) ===');
if (fs.existsSync('TDM.txt')) {
  const tdm = fs.readFileSync('TDM.txt', 'utf8').split(/\r?\n/);
  let unit = '';
  let n = 0;
  for (const l of tdm) {
    if (/^#/.test(l)) { log('    ' + l.trim()); continue; }
    if (/^\s*\d+\.\s/.test(l)) { n += 1; log(`    ${String(n).padStart(2)}. ${l.trim()}`); }
    void unit;
  }
  log(`TOTAL chapitres TDM = ${n}`);
} else log('    TDM.txt absent');
log('');

// ---------- 5) lessonHtmlGetters ----------
log('=== 5) src/data/lessonHtmlGetters.ts (clés mappées) ===');
const gh = fs.readFileSync('src/data/lessonHtmlGetters.ts', 'utf8');
const getterKeys = [...gh.matchAll(/^\s{2}([A-Za-z0-9_'-]+):\s*\(\)\s*=>/gm)].map((m) => m[1]);
log(`    ${getterKeys.length} clés : ${getterKeys.join(', ')}`);
const htmlBase = files.map((f) => f.replace(/\.html$/, ''));
const notMapped = htmlBase.filter((b) => b !== 'lecon_transcription' && !getterKeys.includes(b));
log(`    fichiers HTML sans getter : ${notMapped.length ? notMapped.join(', ') : '(aucun)'}`);
log('');

fs.writeFileSync('ETAT_COMPLET.txt', out.join('\n'), 'utf8');
console.log('OK -> ETAT_COMPLET.txt');