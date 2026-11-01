import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';
const dir = 'public/lessons';
const files = readdirSync(dir).filter(f => f.endsWith('.html')).sort();
for (const file of files) {
  const html = readFileSync(join(dir, file), 'utf-8');
  const h1s = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/g)].map(m => m[1].replace(/\s+/g,' ').trim());
  const chViews = (html.match(/chapter-view/g) || []).length;
  const sommaire = html.includes('id="sommaire"') ? 'OK' : 'MISS';
  console.log(file + ' | views~' + chViews + ' | sommaire:' + sommaire);
  h1s.forEach((h,i) => console.log('   H1.' + (i+1) + ': ' + h));
}
