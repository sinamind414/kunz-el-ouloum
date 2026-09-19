// tools-fix-lessondata.mjs
// Correctif structurel : EXPERIMENTAL_LESSONS était fermé trop tôt (ligne `};`)
// AVANT les entrées phase23..phase26, ce qui les laissait hors de l'objet
// (erreur de syntaxe TS). Le script :
//   1) transforme la fermeture prématurée en virgule d'entrée ;
//   2) ré-ouvre l'objet en insérant `};` juste avant EXPERIMENTAL_SLUGS.
import fs from 'node:fs';

const FILE = 'src/lessonData.ts';
const raw = fs.readFileSync(FILE, 'utf8');
const nl = raw.includes('\r\n') ? '\r\n' : '\n';
const endsWithNl = raw.endsWith(nl);

const lines = raw.split(nl);
if (lines[lines.length - 1] === '') lines.pop();

const closeIdx = lines.findIndex((l) => l.trim() === '};');
if (closeIdx < 0) throw new Error('Fermeture `};` introuvable');
if (lines[closeIdx - 1].trim() !== '}') {
  throw new Error(`Ligne avant \`};\` inattendue : ${JSON.stringify(lines[closeIdx - 1])}`);
}
if (closeIdx !== 165) {
  console.warn(`[warn] fermeture prématurée à l'index ${closeIdx} (attendu 165) — poursuite`);
}

// 1) fermeture prématurée -> virgule de séparation
lines[closeIdx - 1] = '  },';
lines.splice(closeIdx, 1);

// 2) insérer la vraie fermeture de l'objet avant EXPERIMENTAL_SLUGS
const slugIdx = lines.findIndex((l) => l.startsWith('export const EXPERIMENTAL_SLUGS'));
if (slugIdx < 0) throw new Error('EXPERIMENTAL_SLUGS introuvable');
if (lines[slugIdx - 1].trim() !== '},') {
  throw new Error(`Ligne avant EXPERIMENTAL_SLUGS inattendue : ${JSON.stringify(lines[slugIdx - 1])}`);
}
lines.splice(slugIdx, 0, '};');

fs.writeFileSync(FILE, lines.join(nl) + (endsWithNl ? nl : ''), 'utf8');
console.log('OK: EXPERIMENTAL_LESSONS refermé après phase26_chapitres_51_52');