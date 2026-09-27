// anonymiser-copies.ts — F8 : anonymisation des copies d'élèves (mineurs).
//
//   npx tsx scripts/anonymiser-copies.ts
//
// Remplace les en-têtes nominatifs des eleve_*.txt du dossier courant par des
// codes non réversibles ELEVE_NN. Conserve notes et contenu pédagogique.
// Procédure documentée dans docs/copies/README.md (gouvernance F8).

import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();

const fichiers = readdirSync(ROOT)
  .filter((f) => /^eleve_\d+\.txt$/i.test(f))
  .sort();

console.log(`F8 — ${fichiers.length} copies à anonymiser`);

let purges = 0;
for (const f of fichiers) {
  let t = readFileSync(join(ROOT, f), 'utf-8');

  const m = f.match(/(\d+)/);
  const code = `ELEVE_${m ? m[1].padStart(2, '0') : 'XX'}`;

  // En-tête français : "Nom : [prénom nom] — Examen : BAC 2025 SVT — Sujet 1"
  t = t.replace(/^Nom\s*:.*$/m, `Code : ${code} — Examen : BAC 2025 SVT (anonymisé)`);
  // En-tête arabe : "الاسم: [الاسم]"
  t = t.replace(/^.*الاسم\s*:.*$/m, `الرمز: ${code}`);

  writeFileSync(join(ROOT, f), t, 'utf-8');
  purges++;
  console.log(`  ✓ ${f} → ${code}`);
}

console.log(`F8 terminé — ${purges}/${fichiers.length} copies anonymisées`);

// ── RECAPITULATIF.txt : table "N° | NOM | Ex1 | Ex2 | Ex3 | TOTAL | NIVEAU" ──
const recPath = join(ROOT, 'RECAPITULATIF.txt');
const recExiste = existsSync(recPath);
if (recExiste) {
  let rec = readFileSync(recPath, 'utf-8');
  let nomsRemplaces = 0;
  rec = rec.replace(/^(\s*\d+\s*\|)\s*[^|]+\|/gm, (_ligne, prefixe) => {
    const num = parseInt((prefixe.match(/(\d+)/) ?? ['', '0'])[1], 10);
    nomsRemplaces++;
    return `${prefixe} ELEVE_${String(num).padStart(2, '0')} ${'|'}`;
  });
  writeFileSync(recPath, rec, 'utf-8');
  console.log(`\nRECAPITULATIF.txt — ${nomsRemplaces} noms remplacés par ELEVE_NN`);
}

console.log('\nVérification : lancer `npx tsx scripts/scan-fuite-noms.ts` (0 fuite attendu).');
