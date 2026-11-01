// verify_okacha_fixes.ts — vérifie que CHAQUE clé du dictionnaire FIXES
// (scripts/enrich_okacha.ts) existe réellement dans la source okacha.ts.
// Une clé « morte » = correction annoncée mais JAMAIS appliquée (bug silencieux).
// Lecture seule. Usage : npx tsx scripts/verify_okacha_fixes.ts
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const racine = process.cwd();
// Texte RUNTIME du corpus (les lignes de okacha.ts sont des littéraux TS :
// \" et \t doivent être dééchappés avant comparaison, sinon les clés
// contenant des guillemets paraissent « mortes » à tort).
const src = readFileSync(resolve(racine, 'src/data/okacha.ts'), 'utf-8')
  .replace(/\\"/g, '"')
  .replace(/\\t/g, '\t');
const script = readFileSync(resolve(racine, 'scripts/enrich_okacha.ts'), 'utf-8');

// Extraction textuelle du bloc FIXES (clés entre quotes) — audit, pas de parsing TS.
const start = script.indexOf('const FIXES: Record<string, string> = {');
const end = script.indexOf('\n};', start);
const bloc = script.slice(start, end);

const cles: { cle: string; valeur: string }[] = [];
const re = /^\s*('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*")\s*:\s*(?:\r?\n\s*)?('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*")\s*,/gm;
let m: RegExpExecArray | null;
const unesc = (q: string) =>
  q
    .slice(1, -1)
    .replace(/\\(t|n|r|'|")/g, (_m, c: string) =>
      c === 't' ? '\t' : c === 'n' ? '\n' : c === 'r' ? '\r' : c,
    )
    .replace(/\\\\/g, '\\');
while ((m = re.exec(bloc)) !== null) {
  cles.push({ cle: unesc(m[1]), valeur: unesc(m[2]) });
}

// Simulation ENCHAÎNÉE fidèle à applyFixes : remplacement par la CORRECTION,
// dans l'ordre de déclaration. DEUX textes, car il y a DEUX consommateurs réels :
//   · src           = okacha.ts brut — c'est ce que lit le VERROU (avecFixes) ;
//   · normTabs(src) = bloc structuré (parseBloc écrase \t → espace) — c'est ce
//     que lit applyFixes. Une clé « \t » n'est donc morte NI VIVANTE dans un seul
//     des deux : elle est vivante dès qu'elle frappe l'un des deux.
const normTabs = (s: string) => s.replace(/\\t/g, ' ').replace(/\t/g, ' ');
const utilisees = new Set<number>();
const cycles: string[] = [];
const simuler = (texte: string) => {
  let w = texte;
  cles.forEach((e, idx) => {
    // Fidèle à applyFixes : while (texte.includes(cle)) replace — avec un garde
    // en itérations pour détecter au lieu de se figer.
    let n = 0;
    while (w.includes(e.cle) && n < 50) {
      utilisees.add(idx);
      w = w.split(e.cle).join(e.valeur);
      n++;
    }
    if (n >= 50 && !cycles.includes(e.cle)) cycles.push(e.cle);
  });
};
simuler(src);
simuler(normTabs(src));
const mortes: string[] = [];
const redondantes: string[] = [];
cles.forEach((e, i) => {
  if (utilisees.has(i)) return;
  // Introuvable des DEUX côtés même avant toute règle : vrai bug silencieux.
  // Présente mais absorbée par une règle déclarée AVANT elle : redondante
  // (l'effet est déjà obtenu — sans risque, mais sans effet propre).
  (src.includes(e.cle) || normTabs(src).includes(e.cle) ? redondantes : mortes).push(e.cle);
});

// ── Garde-fou 2 : règle auto-référentielle = while(includes) infini ──
// applyFixes fait `while (b.texte.includes(from)) texte.replace(from, to)` :
// si la CORRECTION contient encore la clé, la boucle ne termine jamais et le
// script de génération se fige (incident constaté 2026-09-26).
const autoRef = cles.filter((e) => e.valeur.includes(e.cle));

console.log('Clés FIXES déclarées :', cles.length);
console.log('Clés APPLICABLES     :', utilisees.size);
console.log('Clés REDONDANTES     :', redondantes.length, '(effet déjà obtenu par une règle antérieure)');
for (const k of redondantes) console.log('  · redondante → ' + JSON.stringify(k.slice(0, 100)));
console.log('Clés MORTES          :', mortes.length, '(jamais trouvées — bug silencieux)');
for (const k of mortes) console.log('  ✗ MORTE → ' + JSON.stringify(k.slice(0, 100)));
console.log('Clés AUTO-RÉFÉRENTIELLES :', autoRef.length, autoRef.length ? '← BOUCLE INFINIE' : '(ok)');
for (const e of autoRef) console.log('  ✗ AUTO → ' + JSON.stringify(e.cle.slice(0, 90)));
console.log('CYCLES DÉTECTÉS (while > 50 it.) :', cycles.length);
for (const c of cycles) console.log('  ✗ CYCLE → ' + JSON.stringify(c.slice(0, 90)));

process.exitCode = mortes.length === 0 && autoRef.length === 0 && cycles.length === 0 ? 0 : 1;

