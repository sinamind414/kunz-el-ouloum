// tools-state.mjs — rapport UTF-8 : état des leçons passives (HTML) vs programme officiel.
import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const dir = 'public/lessons';
const files = readdirSync(dir).filter((f) => f.endsWith('.html')).sort();
const out = [];

for (const file of files) {
  const html = readFileSync(join(dir, file), 'utf-8');
  const h1s = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/g)].map((m) => m[1].replace(/\s+/g, ' ').trim());
  const chapters = (html.match(/class="chapter-view/g) || []).length;
  const checks = {
    sommaire: html.includes('id="sommaire"'),
    miftah: html.includes('miftah-encadre'),
    c1badge: html.includes('id="c1-badge"'),
    c2badge: html.includes('id="c2-badge"'),
    css: html.includes('.sommaire{position:sticky'),
    js: html.includes('function scrollToStep') && html.includes('function updateBadges'),
  };
  const missing = Object.entries(checks).filter(([, v]) => !v).map(([k]) => k);
  out.push(
    `=== ${file} (${html.length} chars, chapters=${chapters})` +
      (missing.length ? `  [MISSING: ${missing.join(', ')}]` : '  [OK]')
  );
  h1s.forEach((h, i) => out.push(`   H1-${i + 1}: ${h}`));
}

const ld = readFileSync('src/lessonData.ts', 'utf-8');
out.push('', '=== lessonData entries ===');
for (const m of ld.matchAll(/"([^"]+)":\s*\{\s*\n\s*titleAr:\s*`([^`]+)`/g)) {
  out.push(`  ${m[1]}  ::  ${m[2]}`);
}
const slugs = ld.match(/export const EXPERIMENTAL_SLUGS[^\]]*\]/);
out.push('', '=== EXPERIMENTAL_SLUGS ===', slugs ? slugs[0] : 'NOT FOUND');

writeFileSync('audit_state.txt', out.join('\n') + '\n', 'utf-8');
console.log('written audit_state.txt (' + out.length + ' lines)');
