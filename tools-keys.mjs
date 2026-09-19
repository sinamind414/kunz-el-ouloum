// Audit local : liste ordonnée des clés de EXPERIMENTAL_LESSONS + bornes de l'objet.
import { readFileSync, writeFileSync } from 'node:fs';

const src = readFileSync('src/lessonData.ts', 'utf8');
const lines = src.split(/\r?\n/);

const keys = [];
const closers = [];
lines.forEach((l, i) => {
  const m = l.match(/^  "([^"]+)": \{$/);
  if (m) keys.push({ line: i + 1, key: m[1] });
  if (/^\};$/.test(l) || /^export /.test(l)) closers.push({ line: i + 1, txt: l.slice(0, 80) });
});

const out = [];
out.push(`TOTAL_LINES=${lines.length}`);
out.push(`N_KEYS=${keys.length}`);
out.push('');
out.push('--- CLES (ordre du fichier) ---');
for (const k of keys) out.push(`${String(k.line).padStart(4)}  ${k.key}`);
out.push('');
out.push('--- BORNES / EXPORTS ---');
for (const c of closers) out.push(`${String(c.line).padStart(4)}  ${c.txt}`);

const declared = src.match(/export const EXPERIMENTAL_SLUGS: string\[\] = \[([^\]]+)\]/);
const slugs = declared ? declared[1].split(',').map((s) => s.trim().replace(/`/g, '')) : [];
out.push('');
out.push(`N_SLUGS=${slugs.length}`);
const missing = slugs.filter((s) => !keys.some((k) => k.key === s));
const orphan = keys.filter((k) => !slugs.includes(k.key));
out.push(`SLUGS_SANS_ENTREE=${JSON.stringify(missing)}`);
out.push(`ENTREES_SANS_SLUG=${JSON.stringify(orphan.map((k) => k.key))}`);

writeFileSync('KEYS_OUT.txt', out.join('\n'), 'utf8');
console.log(out.join('\n'));
