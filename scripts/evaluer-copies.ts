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
import { execSync } from 'node:child_process';
import { join } from 'node:path';
import { evaluerBatch, parserRecap, parserScoreAttendu, couperBlocScore, type CopieResultat } from '../src/supervision/evaluerCopies';
import { noterExerciceCalibre } from '../src/data/dictionaries/calibrationBac2025';
import { MEFTA_BAC_EXERCISES } from '../src/data/meftahManhajia';

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

const copies = fichiers.map((f) => {
  const brut = readFileSync(join(dir, f), 'utf-8');
  const attendu = parserScoreAttendu(brut);
  return { fichier: f, texte: couperBlocScore(brut), attendu: attendu ?? undefined };
});
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
  const parEx =
    r.notesParExercice && r.attenduParExercice
      ? `  par Ex (moteur/attendu): ${r.notesParExercice.map((n, i) => `${n}/${r.attenduParExercice![i] ?? '?'}`).join(' · ')}`
      : '';
  return `eleve_${String(r.numero).padStart(2, '0')}  ${ident.padEnd(8)} correcteur=${String(r.note).padStart(5)}  prof=${prof.padStart(5)}  écart=${ecart.padStart(5)}  couv=${r.couverture}${plaf}${flags ? '  ⛔' + flags : ''}${parEx}`;
};

for (const r of resultats) console.log(ligne(r));

console.log('\n=== FIABILITÉ (F5) ===');
console.log(`n=${stats.n} · comparés au prof=${stats.nAvecProf}`);
if (stats.pearson !== null) {
  console.log(`Pearson r = ${stats.pearson}`);
  console.log(`écart moyen (biais signé) = ${stats.ecartMoyen} · écart absolu moyen (MAE) = ${stats.ecartAbsoluMoyen}`);
  console.log(`κ pondéré quadratique = ${stats.kappaPondere ?? 'n/a'}`);
  console.log(`moyenne correcteur = ${stats.noteMoyenneCorrecteur} · moyenne prof = ${stats.noteMoyenneProf}`);
}
if (stats.pearsonParExercice.some((x) => x !== null)) {
  console.log(
    `par exercice — r: ${stats.pearsonParExercice.map((x, i) => `Ex${i + 1}=${x ?? 'n/a'}`).join(' · ')}` +
      ` | |écart| moy: ${stats.ecartAbsoluMoyenParExercice.map((x, i) => `Ex${i + 1}=${x ?? 'n/a'}`).join(' · ')}` +
      ` | biais: ${stats.biaisParExercice.map((x, i) => `Ex${i + 1}=${x ?? 'n/a'}`).join(' · ')}` +
      ` | κ: ${stats.kappaPondereParExercice.map((x, i) => `Ex${i + 1}=${x ?? 'n/a'}`).join(' · ')}` +
      ` | MAE/barème: ${stats.maeNormaliseeParExercice.map((x, i) => `Ex${i + 1}=${x === null ? 'n/a' : Math.round(x * 100) + '%'}`).join(' · ')}`
  );
}
for (const t of stats.tranchesDeNote) {
  if (t.n > 0) console.log(`  tranche ${t.tranche} (n=${t.n}) : biais=${t.biais} · MAE=${t.mae}`);
}
if (stats.pearson === null) {
  console.log('Pearson n/a (moins de 2 copies comparables ou variance nulle)');
}
if (stats.attributionsAmbigues > 0) console.log(`⚠ ${stats.attributionsAmbigues} copie(s) avec attribution S1/S2 ambiguë (< 1 pt d'écart) — trancher à la main`);

if (out) {
  // F5 : la version du moteur fait partie de la publication (chaque version
  // publie ses propres métriques — audit F5, implémentation #4).
  const commit = execSync('git rev-parse --short HEAD').toString().trim();
  const date = new Date().toISOString().slice(0, 10);
  const pct = (x: number | null) => (x === null ? 'n/a' : Math.round(x * 100) + '%');
  const ok = (cond: boolean) => (cond ? '✅' : '❌');

  // F5 — plafond modèle : ce que le moteur accorde sur la RÉPONSE MODÈLE
  // officielle (Meftah). Un plafond < barème explique une sous-note
  // structurelle des copies fortes (cf. tranches ci-dessous).
  const sujetsVus = [...new Set(resultats.map((r) => r.sujet))];
  const plafondModele = sujetsVus.map((s) => ({
    sujet: s,
    ex: ([1, 2, 3] as const).map((e) => {
      const q = MEFTA_BAC_EXERCISES.find((x) => x.id === `bac2025-ex${e}`)!
        .questions.flatMap((x) => x.writeAr).join('\n');
      return { e, note: Math.round(noterExerciceCalibre(q, s, e).points * 100) / 100 };
    }),
  }));
  const md = [
    `# Supervision correcteur — fiabilité mesurée (${date})`,
    ``,
    `> **Moteur** : commit \`${commit}\` · **Corpus** : \`${dir}\` · **n** = ${stats.n} copies · **référence prof** : ${recap ? `${recap.notes.size} notes` : 'absent'}`,
    `>`,
    `> ⚠ **PROVENANCE (audit F5, garde-fou)** : ce corpus a servi à **calibrer** les`,
    `> registres d'attendus (items, formes, plafonds). Ce n'est **pas** un jeu de`,
    `> validation indépendant : les écarts publiés sont un **plancher** de l'erreur`,
    `> de généralisation. La validation F5 (300 copies authentiques, double`,
    `> correction à l'aveugle, ≥20 % arbitrées, calibration/test séparés) reste`,
    `> **à constituer**. Voir le protocole ci-dessous.`,
    ``,
    `## Tableau des copies`,
    ``,
    `| élève | groupe | correcteur | prof | écart | couverture | plafonds | sanctions fortes |`,
    `|---|---|---|---|---|---|---|---|`,
    ...resultats.map((r) =>
      `| ${r.numero} | ${r.mode === 'sujet-complet' ? `S${r.sujet} /20` : `S${r.sujet}-Ex${r.exercice}`} | ${r.note} | ${r.noteProf ?? '—'} | ${r.ecart ?? '—'} | ${r.couverture} | ${r.plafondsActifs.join(',') || '—'} | ${r.sanctionsForte.join(',') || '—'} |`
    ),
    ``,
    `## Fiabilité globale /20`,
    ``,
    `| métrique | mesure | cible F5 | statut |`,
    `|---|---|---|---|`,
    `| Pearson r | ${stats.pearson ?? 'n/a'} | (association seulement) | — |`,
    `| **MAE** (\\|écart\\| moyen) | ${stats.ecartAbsoluMoyen ?? 'n/a'} | **≤ 1,0 pt** | ${ok((stats.ecartAbsoluMoyen ?? Infinity) <= 1.0)} |`,
    `| **Biais signé** (moteur − prof) | ${stats.ecartMoyen ?? 'n/a'} | **\\|biais\\| ≤ 0,3 pt** | ${ok(Math.abs(stats.ecartMoyen ?? Infinity) <= 0.3)} |`,
    `| **κ pondéré quadratique** | ${stats.kappaPondere ?? 'n/a'} | **≥ 0,80** | ${ok((stats.kappaPondere ?? -Infinity) >= 0.8)} |`,
    `| Moyenne correcteur / prof | ${stats.noteMoyenneCorrecteur} / ${stats.noteMoyenneProf ?? 'n/a'} | — | — |`,
    ``,
    `> κ pondéré : Pearson seul mesure une **association** — un correcteur qui`,
    `> surenote tout de +3 a r = 1 et un accord nul. Le κ quadratique pénalise`,
    `> chaque désaccord proportionnellement à sa gravité.`,
    ``,
    `## Par exercice`,
    ``,
    `| exercice | r | MAE | **biais signé** | **κ** | **MAE / barème** | cible | statut |`,
    `|---|---|---|---|---|---|---|---|`,
    ...[0, 1, 2].map((i) => {
      const cibleMae = (stats.maeNormaliseeParExercice[i] ?? 1) <= 0.08;
      const cibleK = (stats.kappaPondereParExercice[i] ?? -1) >= 0.8;
      return `| Ex${i + 1} | ${stats.pearsonParExercice[i] ?? 'n/a'} | ${stats.ecartAbsoluMoyenParExercice[i] ?? 'n/a'} | ${stats.biaisParExercice[i] ?? 'n/a'} | ${stats.kappaPondereParExercice[i] ?? 'n/a'} | ${pct(stats.maeNormaliseeParExercice[i])} | ≤ 8 % / κ ≥ 0,80 | ${ok(cibleMae && cibleK)} |`;
    }),
    ``,
    `## Par tranche de note (référence prof)`,
    ``,
    `| tranche | n | biais signé | MAE |`,
    `|---|---|---|---|`,
    ...stats.tranchesDeNote.filter((t) => t.n > 0).map((t) =>
      `| ${t.tranche} | ${t.n} | ${t.biais} | ${t.mae} |`
    ),
    ``,
    `> **Lecture du biais par tranche** : un biais positif sur les notes faibles`,
    `> et négatif sur les notes hautes = **compression de la plage** — le moteur`,
    `> surenote les copies faibles et sous-note les copies fortes. Sur les copies`,
    `> fortes, l'écart vient principalement des **variantes de formulation non`,
    `> reconnues** (levier F3) ; le plafond modèle ci-dessous montre si une cause`,
    `> structurelle s'ajoute (levier F2).`,
    ``,
    `## Plafond modèle (réponse modèle officielle)`,
    ``,
    `> Maximum que le moteur peut accorder sur une **réponse modèle parfaite**.`,
    `> Un plafond inférieur au barème est une cause **structurelle** de sous-note :`,
    `> aucun élève, même parfait, ne peut le dépasser.`,
    ``,
    `| sujet | exercice | modèle | barème | plafond | sans plafond structurel |`,
    `|---|---|---|---|---|---|`,
    ...plafondModele.flatMap((p) =>
      p.ex.map((x) => {
        const max = [5, 7, 8][x.e - 1];
        return `| ${p.sujet} | Ex${x.e} | ${x.note} | ${max} | ${Math.round((x.note / max) * 100)} % | ${ok(x.note >= max - 0.001)} |`;
      }),
    ),
    ``,
    `## Protocole de validation F5 (à constituer)`,
    ``,
    `1. 300 copies authentiques anonymisées — 3 exercices × 2 sujets, tous`,
    `   niveaux de réussite, variantes de formulation.`,
    `2. Double correction à l'aveugle par deux enseignants ; référence = moyenne ;`,
    `   arbitrage de ≥ 20 % des copies et de tout désaccord > 2 pts.`,
    `3. Séparation calibration / test par élève ET par sujet : aucune copie ayant`,
    `   servi à ajuster les règles ne réapparaît dans le test final.`,
    `4. Publication de MAE, biais, κ, par exercice et par tranche à chaque version`,
    `   (ce script, \`--out\`).`,
    ``,
    `Attributions ambiguës S1/S2 (< 1 pt) à trancher à la main : ${stats.attributionsAmbigues}`,
    ``,
  ].join('\n');
  writeFileSync(out, md, 'utf-8');
  console.log(`\n→ rapport écrit : ${out}`);
}
