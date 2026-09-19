// tools-etat-reel.mjs — état réel des leçons HTML vs programme officiel (55 chapitres).
// Sortie UTF-8 lisible : ETAT_REEL.txt
import fs from 'fs';

const out = [];
const P = 'public/lessons';

// ---------- 1) Clés déclarées dans lessonData.ts ----------
const lessonData = fs.readFileSync('src/lessonData.ts', 'utf8');
const keys = [...lessonData.matchAll(/^\s{2}"(phase\d+_chapitres_\d+_\d+|lecon_transcription)":\s*\{/gm)].map(
  (m) => m[1]
);
out.push(`=== lessonData.ts : ${keys.length} entrées ===`);
keys.forEach((k) => out.push('  ' + k));

// ---------- 2) Titres H1 de chaque chapitre vu dans les HTML ----------
const files = fs.readdirSync(P).filter((f) => f.endsWith('.html')).sort();
out.push('');
out.push('=== Fichiers HTML : contenu réel ===');
let total = 0;
for (const f of files) {
  const html = fs.readFileSync(`${P}/${f}`, 'utf8');
  const openRe = /<div\s+id="([^"]+)"\s+class="[^"]*chapter-view[^"]*"[^>]*>/g;
  const ids = [...html.matchAll(openRe)].map((m) => m[1]);
  total += ids.length;
  const titles = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/g)].map((m) =>
    m[1].replace(/\s+/g, ' ').trim()
  );
  out.push(`  ${f} — chapter-views=${ids.length} [${ids.join(', ')}]`);
  titles.forEach((t, i) => out.push(`      h1#${i + 1}: ${t}`));
}
out.push(`TOTAL chapter-views = ${total}`);

// ---------- 3) Diff : phase23-26 présentes vs attendues ----------
out.push('');
out.push('=== Contrôle phase23..phase26 ===');
const extra = keys.filter((k) => /^phase2[3-6]_/.test(k));
out.push('  déclarées : ' + (extra.length ? extra.join(', ') : 'AUCUNE'));
const htmlExtra = files.filter((f) => /^phase2[3-6]_/.test(f));
out.push('  fichiers  : ' + (htmlExtra.length ? htmlExtra.join(', ') : 'AUCUN'));

// ---------- 4) Recherche « passive » dans le code ----------
out.push('');
out.push('=== Occurrences "passive/passif" dans src + public ===');
const walk = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = `${dir}/${e.name}`;
    if (e.isDirectory()) return walk(p);
    return /\.(ts|tsx|html|mjs)$/.test(e.name) ? [p] : [];
  });
const hits = [];
for (const p of walk('src').concat(walk('public'))) {
  const text = fs.readFileSync(p, 'utf8');
  text.split(/\r?\n/).forEach((line, i) => {
    if (/passiv|passif/i.test(line)) hits.push(`${p}:${i + 1}: ${line.trim().slice(0, 140)}`);
  });
}
out.push(hits.length ? hits.join('\n') : '  (aucune)');

fs.writeFileSync('ETAT_REEL.txt', out.join('\n'), 'utf8');
console.log('ETAT_REEL.txt OK — ' + out.length + ' lignes');