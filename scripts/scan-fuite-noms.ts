// scan-fuite-noms.ts — F8 : cherche tout nom d'élève dans les fichiers suivis.
// Les 40 noms sont extraits de RECAPITULATIF.txt puis cherchés partout.
import { readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

const rec = readFileSync('RECAPITULATIF.txt', 'utf-8');
const noms = [...rec.matchAll(/^\s*\d+\s*\|\s*([A-Z][A-Za-zÀ-ÿ' .-]{2,})\s*\|/gm)]
  .map((m) => m[1].trim())
  .filter((n) => !/^(NOM|Total)/i.test(n));
console.log(`${noms.length} noms extraits du RECAPITULATIF`);

const fichiers = execSync('git ls-files', { encoding: 'utf-8' })
  .split(/\r?\n/).filter((f) => /\.(txt|md|ts|tsx|json|js|html|csv)$/i.test(f));

let fuites = 0;
for (const f of fichiers) {
  let t: string;
  try { t = readFileSync(f, 'utf-8'); } catch { continue; }
  const touches = noms.filter((n) => t.includes(n));
  if (touches.length) {
    fuites++;
    console.log(`FUITE ${f} : ${touches.length} noms (ex: ${touches.slice(0, 3).join(', ')})`);
  }
}
console.log(fuites === 0 ? '\nAucune autre fuite.' : `\n${fuites} fichier(s) avec fuite.`);
