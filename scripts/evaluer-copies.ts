// evaluer-copies.ts — CLI de supervision R4.
//
//   npx tsx scripts/evaluer-copies.ts --dir /home/user/uploads [--sujet 1|2]
//        [--groupe S-E] [--out docs/SUPERVISION_COPIES.md]
//
// Lit les copies eleve_*.txt du dossier (+ RECAPITULATIF.txt facultatif),
// les corrige avec le moteur (noterCopieCalibree), compare aux notes du prof,
// affiche le tableau des écarts et écrit un rapport MD.
// La logique est dans src/supervision/evaluerCopies.ts (testée).

import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { evaluerBatch, parserRecap, type CopieResultat } from '../src/supervision/evaluerCopies';

function arg(flag: string): string | undefined {
  const i = process.argv.indexOf(flag);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

const dir = arg('--dir') ?? '/home/user/uploads';
const out = arg('--out');
const sujetArg = arg('--sujet');
const groupeArg = arg('--groupe');

const sujet = sujetArg === '1' || sujetArg === '2' ? (Number(sujetArg) as 1 | 2) : undefined;
const groupe = groupeArg?.match(/^([12])-([123])$/)
  ? { sujet: Number(groupeArg![1]) as 1 | 2, exercice: Number(groupeArg![2]) as 1 | 2 | 3 }
  : undefined;

if (!existsSync(dir)) {
  console.error(`✗ dossier introuvable : ${dir}`);
  console.error('  Le canal d\'upload échoue régulièrement — coller les textes dans le chat');
  console.error('  avec des séparateurs « === eleve_01 === » et un RECAPITULATIF à la fin.');
  process.exit(1);
}

const fichiers = readdirSync(dir)
  .filter((f) => /^eleve[_-]?\d+.*\.txt$/i.test(f))
  .sort((a, b) => {
    const na = parseInt((a.match(/(\d+)/) ?? ['0'])[1], 10);
    const nb = parseInt((b.match(/(\d+)/) ?? ['0'])[1], 10);
    return na - nb;
  });

if (fichiers.length === 0) {
  console.error(`✗ aucun eleve_*.txt dans ${dir}`);
  process.exit(1);
}

const copies = fichiers.map((f) => ({ fichier: f, texte: readFileSync(join(dir, f), 'utf-8') }));
const cheminRecap = join(dir, 'RECAPITULATIF.txt');
const recap = existsSync(cheminRecap) ? parserRecap(readFileSync(cheminRecap, 'utf-8')) : undefined;

const { resultats, stats } = evaluerBatch(copies, recap, { sujet, groupe });

console.log(`\n=== SUPERVISION — ${stats.n} copies (${dir}) ===`);
if (recap) {
  console.log(`RECAP : ${recap.notes.size} notes du prof`);
  for (const l of recap.lignesNonParsees.slice(0, 5)) console.log(`  ⚠ ligne non parsée : ${l.slice(0, 60)}`);
} else {
  console.log('RECAP : absent — pas de comparaison prof (fiabilité = notes seules)');
}

const ligne = (r: CopieResultat): string => {
  const ident = `${r.mode === 'sujet-complet' ? `S${r.sujet}/20` : `S${r.sujet}-Ex${r.exercice}`}`;
  const prof = r.noteProf !== undefined ? String(r.noteProf) : '—';
  const ecart = r.ecart !== undefined ? (r.ecart > 0 ? '+' : '') + r.ecart : '—';
  const flags = [r.attributionAmbigue ? '⚠attribution' : '', ...r.sanctionsForte].filter(Boolean).join(',');
  const plaf = r.plafondsActifs.length ? ` [${r.plafondsActifs.join(',')}]` : '';
  return `eleve_${String(r.numero).padStart(2, '0')}  ${ident.padEnd(8)} correcteur=${String(r.note).padStart(5)}  prof=${prof.padStart(5)}  écart=${ecart.padStart(5)}  couv=${r.couverture}${plaf}${flags ? '  ⛔' + flags : ''}`;
};

for (const r of resultats) console.log(ligne(r));

console.log('\n=== FIABILITÉ ===');
console.log(`n=${stats.n} · comparés au prof=${stats.nAvecProf}`);
if (stats.pearson !== null) {
  console.log(`Pearson r = ${stats.pearson}`);
  console.log(`écart moyen = ${stats.ecartMoyen} · écart absolu moyen = ${stats.ecartAbsoluMoyen}`);
  console.log(`moyenne correcteur = ${stats.noteMoyenneCorrecteur} · moyenne prof = ${stats.noteMoyenneProf}`);
} else {
  console.log('Pearson n/a (moins de 2 copies comparables ou variance nulle)');
}
if (stats.attributionsAmbigues > 0) console.log(`⚠ ${stats.attributionsAmbigues} copie(s) avec attribution S1/S2 ambiguë (< 1 pt d'écart) — trancher à la main`);

if (out) {
  const md = [
    `# Supervision correcteur — ${new Date().toISOString().slice(0, 10)}`,
    ``,
    `Source : \`${dir}\` · ${stats.n} copies · RECAP : ${recap ? `${recap.notes.size} notes` : 'absent'}`,
    ``,
    `| élève | groupe | correcteur | prof | écart | couverture | plafonds | sanctions fortes |`,
    `|---|---|---|---|---|---|---|---|`,
    ...resultats.map((r) =>
      `| ${r.numero} | ${r.mode === 'sujet-complet' ? `S${r.sujet} /20` : `S${r.sujet}-Ex${r.exercice}`} | ${r.note} | ${r.noteProf ?? '—'} | ${r.ecart ?? '—'} | ${r.couverture} | ${r.plafondsActifs.join(',') || '—'} | ${r.sanctionsForte.join(',') || '—'} |`
    ),
    ``,
    `**Fiabilité** : Pearson r = ${stats.pearson ?? 'n/a'} · écart moyen = ${stats.ecartMoyen ?? 'n/a'} · |écart| moyen = ${stats.ecartAbsoluMoyen ?? 'n/a'} · attributions ambiguës = ${stats.attributionsAmbigues}`,
    ``,
  ].join('\n');
  writeFileSync(out, md, 'utf-8');
  console.log(`\n→ rapport écrit : ${out}`);
}
