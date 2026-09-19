// Audit d'état : mappe chaque <div class="chapter-view"> à son <h1>, écrit en UTF-8.
import fs from 'fs';

const dir = 'public/lessons';
const files = fs.readdirSync(dir).filter((f) => f.endsWith('.html')).sort();
const out = [];
let total = 0;

for (const f of files) {
  const h = fs.readFileSync(`${dir}/${f}`, 'utf8');
  const chapters = [];
  const re = /<div\s+id="([^"]+)"\s+class="[^"]*chapter-view[^"]*"[\s\S]*?<h1[^>]*>([\s\S]*?)<\/h1>/g;
  let m;
  while ((m = re.exec(h))) {
    chapters.push(`${m[1]} || ${m[2].replace(/\s+/g, ' ').trim()}`);
  }
  const views = (h.match(/class="[^"]*chapter-view/g) || []).length;
  total += chapters.length;
  out.push(`FILE ${f}  views=${views}  h1=${chapters.length}`);
  for (const c of chapters) out.push(`    ${c}`);
}
out.push('');
out.push(`TOTAL chapter-view blocks: ${total}`);

// Titres des leçons déclarées dans lessonData.ts
const ld = fs.readFileSync('src/lessonData.ts', 'utf8');
out.push('');
out.push('--- lessonData.ts entries ---');
const reKey = /"((?:phase|lecon)[^"]*)"\s*:\s*\{[\s\S]*?titleAr:\s*`([^`]*)`/g;
let k;
while ((k = reKey.exec(ld))) out.push(`${k[1]} :: ${k[2].replace(/\s+/g, ' ').trim()}`);

fs.writeFileSync('audit_state_u8.txt', out.join('\n'), 'utf8');
console.log(`written: ${total} chapter blocks`);