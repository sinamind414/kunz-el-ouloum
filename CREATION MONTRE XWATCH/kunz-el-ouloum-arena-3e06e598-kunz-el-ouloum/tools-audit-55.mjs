import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';
const dir = 'public/lessons';
const files = readdirSync(dir).filter(f=>f.endsWith('.html')).sort();
for (const file of files) {
  const html = readFileSync(join(dir,file),'utf-8');
  const h1s = [...html.matchAll(/<h1[^>]*>(.*?)<\/h1>/g)].map(m=>m[1].trim());
  const hasSom = html.includes('id="sommaire"')?'OK':'MISS-sommaire';
  const hasMif = html.includes('miftah-encadre')?'OK':'MISS-miftah';
  const hasC1 = html.includes('id="c1-badge"')?'OK':'MISS-c1';
  const hasC2 = html.includes('id="c2-badge"')?'OK':'MISS-c2';
  const hasCh1 = html.includes('id="ch1-step1"')?'OK':'MISS-ch1';
  const hasCh2 = html.includes('id="ch2-step1"')?'OK':'MISS-ch2';
  const hasCss = html.includes('.sommaire{position:sticky')?'OK':'MISS-css';
  const hasJs = (html.includes('function scrollToStep')&&html.includes('function updateBadges'))?'OK':'MISS-js';
  console.log('=== '+file+' ('+html.length+' chars) ===');
  h1s.forEach((h,i)=>console.log('  H1-'+(i+1)+': '+h));
  console.log('  checks: sommaire='+hasSom+' miftah='+hasMif+' c1='+hasC1+' c2='+hasC2+' ch1='+hasCh1+' ch2='+hasCh2+' css='+hasCss+' js='+hasJs);
}
// lessonData titles
const ld = readFileSync('src/lessonData.ts','utf-8');
const titles = [...ld.matchAll(/titleAr:\s*`([^`]+)`/g)].map(m=>m[1].trim());
console.log('\n=== lessonData titles ('+titles.length+') ===');
titles.forEach((t,i)=>console.log((i+1)+'. '+t));
