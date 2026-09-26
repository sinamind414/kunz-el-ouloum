// scan_okacha_ocr.ts — inventaire des lignes chiffrées « déchets OCR » (audit arabe).
// Lecture seule : n'écrit rien. Usage : npx tsx scripts/scan_okacha_ocr.ts
import { OKACHA_UNITES, OKACHA_METHODO, OKACHA_CONSEILS } from '../src/data/okacha';
import { scoreDechetOCR } from '../src/data/okachaQuality';

const all: string[] = [];
for (const u of OKACHA_UNITES as any[]) for (const l of u.lignes ?? []) all.push(l);
for (const s of Object.values(OKACHA_METHODO as any)) {
  for (const l of (s as any).lignes ?? []) all.push(l);
}
if (Array.isArray(OKACHA_CONSEILS)) for (const l of OKACHA_CONSEILS as any[]) all.push(String(l));

const bad = all.map((t) => ({ t, s: scoreDechetOCR(t) })).filter((x) => x.s >= 0.35);
bad.sort((a, b) => b.t.length - a.t.length);

console.log('TOTAL lignes:', all.length);
console.log('LIGNES DECHET (>=0.35):', bad.length);
console.log('--- recuperables (>= 45 car.) ---');
for (const b of bad.filter((x) => x.t.length >= 45)) {
  console.log(`[${b.s.toFixed(2)}|${b.t.length}] ${JSON.stringify(b.t.slice(0, 170))}`);
}
console.log('--- courts (< 45) : ' + bad.filter((x) => x.t.length < 45).length + ' ---');
for (const b of bad.filter((x) => x.t.length < 45).slice(0, 40)) {
  console.log(`[${b.s.toFixed(2)}|${b.t.length}] ${JSON.stringify(b.t)}`);
}
