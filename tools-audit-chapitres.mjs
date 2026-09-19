// tools-audit-chapitres.mjs — Audit « mot par mot » des 55 chapitres officiels.
// Pour chaque fichier public/lessons/*.html :
//   - liste ORDONNÉE des <div class="chapter-view"> (id de chapitre)
//   - titre <h1> porté par chacun
//   - contrôles structurels (sommaire, miftah, badges quiz, JS de navigation)
// Puis confrontation à la TDM officielle du livre (book_tdm_clean.md, 55 entrées).
import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';

const dir = 'public/lessons';
const files = readdirSync(dir).filter((f) => f.endsWith('.html'));

/** Blocs chapter-view avec leur H1 (isolation par ordre d'apparition, cf. lessonChapterSplit). */
function chaptersOf(html) {
  const out = [];
  const openRe = /<div\s+id="([^"]+)"\s+class="[^"]*chapter-view[^"]*"[^>]*>/g;
  let m;
  while ((m = openRe.exec(html))) {
    const rest = html.slice(m.index, m.index + 8000);
    const h1 = rest.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
    out.push({
      id: m[1],
      title: h1 ? h1[1].replace(/\s+/g, ' ').trim() : '(AUCUN H1)',
      lone: h1 ? /الدرس\s*[0-9\u0660-\u0669]+/.test(h1[1]) : false,
    });
  }
  return out;
}

/** TDM officielle : « ## Domaine », « ### Unité », « N. titre ». */
function officialChapters() {
  const md = readFileSync('book_tdm_clean.md', 'utf-8');
  const out = [];
  let domain = '';
  let unit = '';
  for (const line of md.split(/\r?\n/)) {
    const d = line.match(/^##\s+Domaine\s*(\d+)\s*:\s*(.+)$/);
    if (d) {
      domain = `D${d[1]}`;
      continue;
    }
    const u = line.match(/^###\s+Unité\s*(\d+)\s*:\s*(.+)$/);
    if (u) {
      unit = `${domain}/U${u[1]}`;
      continue;
    }
    const c = line.match(/^(\d+)\.\s+(.+)$/);
    if (c && unit) out.push({ unit, num: Number(c[1]), title: c[2].trim() });
  }
  return out;
}

const official = officialChapters();
console.log(`TDM officielle : ${official.length} chapitres`);
if (official.length !== 55) console.log('  !! ATTENTION : la TDM ne fait pas 55 entrées');

let total = 0;
const rows = [];
for (const file of files.sort()) {
  const html = readFileSync(join(dir, file), 'utf-8');
  const chs = chaptersOf(html);
  total += chs.length;
  console.log(`\n=== ${file} (${html.length} chars) — ${chs.length} chapitre(s) ===`);
  chs.forEach((c, i) => console.log(`  [${i + 1}] #${c.id} :: ${c.title}`));
  const flags = [];
  if (!html.includes('id="sommaire"')) flags.push('MISS-sommaire');
  if (!html.includes('miftah-encadre')) flags.push('MISS-miftah');
  if (chs.length === 2) {
    if (!html.includes('id="c1-badge"')) flags.push('MISS-badge1');
    if (!html.includes('id="c2-badge"')) flags.push('MISS-badge2');
  }
  if (!html.includes('function scrollToStep')) flags.push('MISS-scrollToStep');
  if (chs.length === 2 && !html.includes('function updateBadges')) flags.push('MISS-updateBadges');
  if (flags.length) console.log('  ⚠ ' + flags.join(' '));
  rows.push({ file, chs });
}

console.log(`\n### TOTAL chapitres HTML = ${total} (attendu ${official.length})`);

// Correspondance : le titre H1 doit citer le même numéro que la TDM (par unité).
console.log('\n### Confrontation TDM <-> fichiers HTML (numéro de chapitre par unité)');
const officialByUnit = new Map();
for (const o of official) {
  if (!officialByUnit.has(o.unit)) officialByUnit.set(o.unit, []);
  officialByUnit.get(o.unit).push(o);
}
for (const [unit, list] of officialByUnit) {
  console.log(`\n--- ${unit} (${list.length} chapitres attendus)`);
  for (const o of list) console.log(`  attendu ${o.num}. ${o.title}`);
}