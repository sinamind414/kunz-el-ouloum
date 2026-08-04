// scripts/runValidationTests.ts
// Runner tsx des tests T1–T12 (utilisé par `npm run test:smartbot`).
// Sortie : résumé PASS/FAIL + code de sortie non-zéro si échec.

import { runValidationTests } from '../src/lib/validation/validationTests.ts';

const results = runValidationTests();
let failed = 0;
console.log('\n── ValidationEngine · Tests T1–T12 ──');
for (const r of results) {
  const status = r.pass ? 'PASS' : 'FAIL';
  if (!r.pass) failed++;
  console.log(`[${status}] ${r.id} · ${r.desc} (${r.detail})`);
  console.log(`        ${r.info}`);
}
console.log(`\nRésultat: ${results.length - failed}/${results.length} PASS\n`);
if (failed > 0) process.exit(1);
