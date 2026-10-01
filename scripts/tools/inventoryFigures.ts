/**
 * scripts/tools/inventoryFigures.ts
 *
 * Inventaire des figures SVG inline de public/lessons :
 * pour chaque <svg> : sujet (h4 le plus proche), viewBox, taille, nb d'éléments,
 * statut (pfe-figure ou primitif), et l'extrait des textes affichés.
 *
 * Sert au déploiement progressif de ProFigureEngine : identifier les catégories
 * (cellule / courbe / mécanisme / coupe / comparaison) avant d'écrire les gabarits.
 *
 * Exécution : npx tsx scripts/tools/inventoryFigures.ts
 */

import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

interface Entry {
  file: string;
  index: number;
  subject: string;
  viewBox: string;
  bytes: number;
  elements: number;
  pro: boolean;
  texts: string;
}

const DIR = resolve(process.cwd(), 'public/lessons');
/** Filtre optionnel : n'examiner que les leçons dont le nom contient l'un de ces arguments. */
const FILTER = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const entries: Entry[] = [];

for (const file of readdirSync(DIR)
  .filter((f) => f.endsWith('.html'))
  .filter((f) => FILTER.length === 0 || FILTER.some((k) => f.includes(k)))
  .sort()) {

  const html = readFileSync(resolve(DIR, file), 'utf8');
  const svgs = html.match(/<svg[\s\S]*?<\/svg>/g) || [];

  svgs.forEach((svg, index) => {
    const head = html.slice(0, html.indexOf(svg));
    const headings = [...head.matchAll(/<h[1-4][^>]*>([\s\S]*?)<\/h[1-4]>/g)];
    const subject = (headings[headings.length - 1]?.[1] || '')
      .replace(/<[^>]+>/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 90);

    const viewBox = /viewBox="([^"]+)"/.exec(svg)?.[1] ?? '—';
    const elements = (svg.match(/<[a-zA-Z][^>]*>/g) || []).length;
    const full = process.argv.includes('--full');
    const texts = [...svg.matchAll(/<text[^>]*>([\s\S]*?)<\/text>/g)]
      .map((m) => m[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim())
      .filter(Boolean)
      .slice(0, full ? 40 : 6)
      .join(full ? '\n        · ' : ' · ')
      .slice(0, full ? 1400 : 150);


    entries.push({
      file,
      index,
      subject,
      viewBox,
      bytes: svg.length,
      elements,
      pro: svg.includes('pfe-figure'),
      texts,
    });
  });
}

const lines: string[] = [];
lines.push(`TOTAL: ${entries.length} figures (pro: ${entries.filter((e) => e.pro).length}, primitives: ${entries.filter((e) => !e.pro).length})`);
lines.push('');

const byCategory = new Map<string, Entry[]>();
for (const e of entries) {
  if (e.pro) continue;
  const vb = e.viewBox.split(/\s+/);
  const w = Number(vb[2]) || 0;
  const h = Number(vb[3]) || 0;
  const cat = h >= w ? 'portrait/haut' : w >= 700 ? 'paysage large' : 'compact 400x200';
  byCategory.set(cat, [...(byCategory.get(cat) ?? []), e]);
}

for (const [cat, list] of [...byCategory.entries()].sort()) {
  lines.push(`=== ${cat} (${list.length}) ===`);
  for (const e of list) {
    lines.push(
      `  ${e.file} #${e.index} | vb=${e.viewBox} | ${e.bytes} oct | ${e.elements} el`,
      `      sujet: ${e.subject}`,
      `      textes: ${e.texts}`,
    );
  }
  lines.push('');
}

console.log(lines.join('\n'));

// Écrit aussi en UTF-8 propre (la redirection PowerShell casse l'arabe en console).
if (process.argv.includes('--file')) {
  writeFileSync(resolve(process.cwd(), 'tmp_inventory.txt'), lines.join('\n'), 'utf8');
  console.log('\nfichier : tmp_inventory.txt');
}

