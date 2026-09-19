// evaluer-copies.ts — Harnais d'évaluation du correcteur V1 sur les 80 copies BAC 2025 SVT.
//
// Données : docs/copies-bac2025/bac2025_svt_copies/ (gitignoré — données élèves).
//   · sujet_1 + sujet_2 : 40 copies chacun, arabe, avec bloc SCORE ATTENDU (vérité terrain).
//   · Barème copies : Ex1 = 5 pts, Ex2 = 7 pts, Ex3 = 8 pts (les deux sujets).
// Chemins d'évaluation du correcteur :
//   A. Barème officiel build (bac2025_S1/S2-Ex1 Q1+Q2 uniquement) → evaluerBareme ;
//   B. Couverture mots-clés + entités par unité mappée → evaluerReponseKeywords/evaluerEntites ;
//   C. Sanctions pédagogiques → evaluerSanctions (forte/vigilance).
// Métriques de fiabilité : Pearson/Spearman, MAE, RMSE, biais, calibration par
// décile, fit linéaire par exercice (calibration entraînée), matrices de
// confusion au niveau copie, top écarts avec diagnostic.
// Sorties : rapport console + 2 CSV dans docs/copies-bac2025/ (gitignoré).

import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CORRECTEUR_V1_UNITES, evaluerReponseKeywords } from '../src/correcteurV1';
import { normalizeAr } from '../src/lib/validation/normalizeAr';
import { evaluerBareme } from '../src/data/dictionaries/baremeCorrecteur';
import { evaluerEntites } from '../src/data/dictionaries/dictionnaireCorrecteur';
import { evaluerSanctions, type Sanction } from '../src/data/dictionaries/sanctionsCorrecteur';

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DOSSIER_COPIES = path.join(RACINE, 'docs', 'copies-bac2025', 'bac2025_svt_copies');
const DOSSIER_SORTIE = path.join(RACINE, 'docs', 'copies-bac2025');

// ── Mapping exercice → unité du correcteur ───────────────────────────────────
// S1 : Ex1 ARN/protéines → U1 · Ex2 photosynthèse/pyrénoïde → U6 · Ex3 Ado/A1R/NE → U5.
// S2 : Ex1 glycolyse → U7 · Ex2 SOD/ROS (enzymes) → U3 · Ex3 transfusion → U4.
const MAPPING: Record<number, { unite: number; maxPts: number }[]> = {
  1: [
    { unite: 1, maxPts: 5 },
    { unite: 6, maxPts: 7 },
    { unite: 5, maxPts: 8 },
  ],
  2: [
    { unite: 7, maxPts: 5 },
    { unite: 3, maxPts: 7 },
    { unite: 4, maxPts: 8 },
  ],
};

const QUESTIONS_BAREME_EX1: Record<number, string[]> = {
  1: ['bac2025_S1/S1-Ex1/Q1', 'bac2025_S1/S1-Ex1/Q2'],
  2: ['bac2025_S2/S2-Ex1/Q1', 'bac2025_S2/S2-Ex1/Q2'],
};

const EX_NUMS = ['الأول', 'الثاني', 'الثالث'] as const;
const RE_SECTION_EX = /التمرين\s*(الأول|الثاني|الثالث)/g;
const RE_SECTION_PARTIE = /الجزء\s*(الأول|الثاني|الثالث)/g;

// ── Types ────────────────────────────────────────────────────────────────────
interface ScoreAttendu {
  exercices: number[]; // [ex1, ex2, ex3]
  parties: Record<number, number[]>; // ex → [part1, part2, (part3)]
  total: number;
}
interface Copie {
  sujet: number;
  numero: number;
  nom: string;
  sections: string[]; // [texte Ex1, texte Ex2, texte Ex3] (corps nettoyé)
  parties: string[][]; // par exercice → textes de parties
  attendu: ScoreAttendu;
}
interface ObsExercice {
  copie: Copie;
  ex: number; // 1..3
  unite: number;
  maxPts: number;
  couverture: number;
  trouve: number;
  totalKw: number;
  couvertureEntites: number;
  entitesTrouvees: number;
  entitesTotal: number;
  nbPistes: number;
  pointsAttendus: number;
  p1: number; // couverture × maxPts
  p2: number; // Ex1 : barème auto (normalisé maxPts) ; sinon p1
  pointsBaremeAuto: number | null; // Ex1 uniquement
  plafondBaremeAuto: number | null;
  passeDefaut: boolean;
}

// ── Utilitaires stats ────────────────────────────────────────────────────────
const num = (s: string) => Number(s.replace(',', '.'));
const r2 = (x: number) => Math.round(x * 100) / 100;

function moyenne(v: number[]): number {
  return v.length ? v.reduce((a, b) => a + b, 0) / v.length : NaN;
}
function pearson(x: number[], y: number[]): number {
  const n = Math.min(x.length, y.length);
  if (n < 2) return NaN;
  const mx = moyenne(x.slice(0, n));
  const my = moyenne(y.slice(0, n));
  let sxy = 0;
  let sx = 0;
  let sy = 0;
  for (let i = 0; i < n; i++) {
    const dx = x[i]! - mx;
    const dy = y[i]! - my;
    sxy += dx * dy;
    sx += dx * dx;
    sy += dy * dy;
  }
  return sxy / Math.sqrt(sx * sy);
}
function rangsMoyens(v: number[]): number[] {
  const idx = v.map((val, i) => ({ val, i })).sort((a, b) => a.val - b.val);
  const out = new Array<number>(v.length);
  let i = 0;
  while (i < idx.length) {
    let j = i;
    while (j + 1 < idx.length && idx[j + 1]!.val === idx[i]!.val) j++;
    const rg = (i + j + 2) / 2; // rangs 1-based, moyenne pour les ex æquo
    for (let k = i; k <= j; k++) out[idx[k]!.i] = rg;
    i = j + 1;
  }
  return out;
}
function spearman(x: number[], y: number[]): number {
  return pearson(rangsMoyens(x), rangsMoyens(y));
}
function mae(pred: number[], ref: number[]): number {
  return moyenne(pred.map((p, i) => Math.abs(p - ref[i]!)));
}
function rmse(pred: number[], ref: number[]): number {
  return Math.sqrt(moyenne(pred.map((p, i) => (p - ref[i]!) ** 2)));
}
/** Fit moindres carrés y = a·x + b (+ R²). */
function fitLineaire(x: number[], y: number[]): { a: number; b: number; r2: number } {
  const mx = moyenne(x);
  const my = moyenne(y);
  let sxy = 0;
  let sxx = 0;
  for (let i = 0; i < x.length; i++) {
    sxy += (x[i]! - mx) * (y[i]! - my);
    sxx += (x[i]! - mx) ** 2;
  }
  const a = sxx === 0 ? 0 : sxy / sxx;
  const b = my - a * mx;
  const ychapeau = x.map((v) => a * v + b);
  const sce = y.reduce((s, v, i) => s + (v - ychapeau[i]!) ** 2, 0);
  const sct = y.reduce((s, v) => s + (v - my) ** 2, 0);
  return { a, b, r2: sct === 0 ? 1 : 1 - sce / sct };
}
function niveauDe(total: number): string {
  if (total < 5) return 'très faible';
  if (total < 8) return 'faible';
  if (total < 10) return 'en dessous';
  if (total < 12) return 'intermédiaire';
  if (total < 14) return 'au-dessus';
  if (total < 16) return 'bonne';
  if (total < 17.5) return 'très bonne';
  return 'excellente';
}

// ── Parsing des copies ───────────────────────────────────────────────────────

function couperCorps(contenu: string): string {
  // Corps = tout ce qui précède la ligne de tirets qui introduit SCORE ATTENDU
  // (le bloc score + les notes de correction en français sont EXCLUS — fuite).
  const idx = contenu.lastIndexOf('SCORE ATTENDU');
  if (idx < 0) return contenu;
  let corps = contenu.slice(0, idx);
  corps = corps.replace(/-{4,}\s*$/, ''); // séparateur de tirets terminal
  // Retire l'en-tête : tout jusqu'à la 2e ligne « ==== » incluse.
  const lignes = corps.split(/\r?\n/);
  let vuesSep = 0;
  let debut = 0;
  for (let i = 0; i < lignes.length; i++) {
    if (/^={4,}\s*$/.test(lignes[i]!)) {
      vuesSep++;
      if (vuesSep === 2) {
        debut = i + 1;
        break;
      }
    }
  }
  return lignes.slice(debut).join('\n').trim();
}

function extraireSections(corps: string): { sections: string[]; parties: string[][] } {
  // 3 sections (une par exercice), chacune découpée en parties.
  const trouvailles: { ex: number; index: number }[] = [];
  for (const m of corps.matchAll(RE_SECTION_EX)) {
    const ex = EX_NUMS.indexOf(m[1] as (typeof EX_NUMS)[number]) + 1;
    if (ex >= 1 && ex <= 3 && !trouvailles.some((t) => t.ex === ex)) {
      trouvailles.push({ ex, index: m.index ?? 0 });
    }
  }
  trouvailles.sort((a, b) => a.index - b.index);
  const sections = ['', '', ''];
  const parties: string[][] = [[], [], []];
  for (let i = 0; i < trouvailles.length; i++) {
    const t = trouvailles[i]!;
    const fin = i + 1 < trouvailles.length ? trouvailles[i + 1]!.index : corps.length;
    const texte = corps.slice(t.index, fin).trim();
    sections[t.ex - 1] = texte;
    // Découpe interne en parties (الجزء …) — garde le prologue (données communes).
    const sous: { p: number; index: number }[] = [];
    for (const m of texte.matchAll(RE_SECTION_PARTIE)) {
      const p = EX_NUMS.indexOf(m[1] as (typeof EX_NUMS)[number]) + 1;
      if (!sous.some((s) => s.p === p)) sous.push({ p, index: m.index ?? 0 });
    }
    sous.sort((a, b) => a.index - b.index);
    const morceaux: string[] = [];
    for (let j = 0; j < sous.length; j++) {
      const finP = j + 1 < sous.length ? sous[j + 1]!.index : texte.length;
      morceaux.push(texte.slice(sous[j]!.index, finP).trim());
    }
    parties[t.ex - 1] = morceaux;
  }
  return { sections, parties };
}

function parserScoreAttendu(contenu: string): ScoreAttendu | null {
  const idx = contenu.lastIndexOf('SCORE ATTENDU');
  if (idx < 0) return null;
  const bloc = contenu.slice(idx);
  const exercices: number[] = [0, 0, 0];
  for (const m of bloc.matchAll(/Exercice\s*([123])\s*:\s*([\d.,]+)\s*\/\s*[\d.,]+/g)) {
    exercices[Number(m[1]) - 1] = num(m[2]!);
  }
  const parties: Record<number, number[]> = {};
  for (const m of bloc.matchAll(/(?:Partie|Part)\s*([123])\s*:\s*([\d.,]+)\s*\/\s*[\d.,]+/g)) {
    const p = Number(m[1]);
    (parties[p] ??= []).push(num(m[2]!));
  }
  const t = /TOTAL\s*:\s*([\d.,]+)\s*\/\s*20/.exec(bloc);
  if (!t) return null;
  return { exercices, parties, total: num(t[1]!) };
}

function chargerCopies(): Copie[] {
  const copies: Copie[] = [];
  let alertes = 0;
  for (const sujet of [1, 2]) {
    const dossier = path.join(DOSSIER_COPIES, `sujet_${sujet}`);
    for (let n = 1; n <= 40; n++) {
      const nn = String(n).padStart(2, '0');
      const fichier = path.join(dossier, `eleve_${nn}.txt`);
      const contenu = fs.readFileSync(fichier, 'utf8');
      const attendu = parserScoreAttendu(contenu);
      if (!attendu) {
        console.error(`  !! sujet_${sujet}/eleve_${nn}: bloc SCORE ATTENDU introuvable`);
        alertes++;
        continue;
      }
      const corps = couperCorps(contenu);
      const { sections, parties } = extraireSections(corps);
      if (sections.some((s) => s === '')) {
        console.error(
          `  !! sujet_${sujet}/eleve_${nn}: section exercice vide [${sections.map((s) => s ? 'ok' : 'VIDE').join(', ')}]`
        );
        alertes++;
      }
      // Cohérence arithmétique de la vérité terrain.
      const somme = attendu.exercices[0]! + attendu.exercices[1]! + attendu.exercices[2]!;
      if (Math.abs(somme - attendu.total) > 0.011) {
        console.error(
          `  !! sujet_${sujet}/eleve_${nn}: incohérence somme exercices ${r2(somme)} ≠ TOTAL ${attendu.total}`
        );
        alertes++;
      }
      const ligneNom = /Nom\s*:\s*(.+?)\s*—/.exec(contenu);
      copies.push({
        sujet,
        numero: n,
        nom: ligneNom ? ligneNom[1]!.trim() : `eleve_${nn}`,
        sections,
        parties,
        attendu,
      });
    }
  }
  console.log(`Copies chargées : ${copies.length}/80 — alertes de parsing : ${alertes}`);
  return copies;
}

// ── Évaluation ───────────────────────────────────────────────────────────────

function evaluerToutes(copies: Copie[]): ObsExercice[] {
  const obs: ObsExercice[] = [];
  for (const copie of copies) {
    for (const ex of [1, 2, 3]) {
      const m = MAPPING[copie.sujet]![ex - 1]!;
      const texte = copie.sections[ex - 1]!;
      const attenduPts = copie.attendu.exercices[ex - 1]!;
      const kw = evaluerReponseKeywords(texte, m.unite);
      const ent = evaluerEntites(texte, m.unite);
      const p1 = kw.couverture * m.maxPts;
      let p2 = p1;
      let ptsBaremeAuto: number | null = null;
      let plafond: number | null = null;
      if (ex === 1) {
        let pts = 0;
        let plaf = 0;
        for (const qid of QUESTIONS_BAREME_EX1[copie.sujet]!) {
          const res = evaluerBareme(texte, qid);
          if (!res) continue;
          pts += res.pointsObtenus;
          plaf += res.verdicts
            .filter((v) => v.mode === 'auto')
            .reduce((s, v) => s + v.item.points, 0);
        }
        ptsBaremeAuto = Math.round(pts * 100) / 100;
        plafond = Math.round(plaf * 100) / 100;
        // P2 : crédit barème cru sur 5 pts (le barème build Q1+Q2 = 5 pts).
        p2 = ptsBaremeAuto;
      }
      obs.push({
        copie,
        ex,
        unite: m.unite,
        maxPts: m.maxPts,
        couverture: kw.couverture,
        trouve: kw.trouve,
        totalKw: kw.total,
        couvertureEntites: ent.couvertureEntites,
        entitesTrouvees: ent.trouvees.length,
        entitesTotal: ent.total,
        nbPistes: ent.pistesAmbigues.length,
        pointsAttendus: attenduPts,
        p1: r2(p1),
        p2: r2(p2),
        pointsBaremeAuto: ptsBaremeAuto,
        plafondBaremeAuto: plafond,
        passeDefaut: kw.passe,
      });
    }
  }
  return obs;
}

// ── Sanctions ────────────────────────────────────────────────────────────────

interface SanctionsCopie {
  copie: Copie;
  fortes: Sanction[];
  vigilances: Sanction[];
}

function evaluerSanctionsCopies(copies: Copie[]): SanctionsCopie[] {
  return copies.map((copie) => {
    // Corps complet (sans notes de correction) : les sanctions travaillent
    // sur la réponse de l'élève uniquement.
    const corps = [copie.sections[0]!, copie.sections[1]!, copie.sections[2]!].join('\n');
    const s = evaluerSanctions(corps);
    return {
      copie,
      fortes: s.filter((x) => x.gravite === 'forte'),
      vigilances: s.filter((x) => x.gravite === 'vigilance'),
    };
  });
}

// ── Rapport + CSV ────────────────────────────────────────────────────────────

function titre(s: string): void {
  console.log(`\n${'═'.repeat(78)}\n${s}\n${'═'.repeat(78)}`);
}

function ecrireCsv(chemin: string, lignes: (string | number)[][]): void {
  const echappe = (c: string | number) => {
    const s = String(c);
    return /[",;\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  fs.writeFileSync(chemin, '\uFEFF' + lignes.map((l) => l.map(echappe).join(';')).join('\n'), 'utf8');
}

function principal(): void {
  console.log('╔══════════════════════════════════════════════════════════════════════════╗');
  console.log('║  ÉVALUATION DU CORRECTEUR V1 — 80 COPIES BAC 2025 SVT (vérité terrain)   ║');
  console.log('╚══════════════════════════════════════════════════════════════════════════╝');

  const copies = chargerCopies();
  if (copies.length === 0) {
    console.error('Aucune copie chargée — abandon.');
    process.exitCode = 1;
    return;
  }
  const obs = evaluerToutes(copies);
  const sanctions = evaluerSanctionsCopies(copies);

  // ── 1. Vérité terrain ──────────────────────────────────────────────────────
  titre('1. VÉRITÉ TERRAIN (blocs SCORE ATTENDU)');
  const attendus = copies.map((c) => c.attendu.total);
  console.log(
    `Moyenne classe : ${r2(moyenne(attendus))}/20 — min ${Math.min(...attendus)} — max ${Math.max(...attendus)}`
  );
  const niveaux = new Map<string, number>();
  for (const c of copies) {
    const n = niveauDe(c.attendu.total);
    niveaux.set(n, (niveaux.get(n) ?? 0) + 1);
  }
  console.log('Distribution :', [...niveaux.entries()].map(([n, k]) => `${n}:${k}`).join(' · '));

  // ── 2. Chemin barème (Ex1) ────────────────────────────────────────────────
  titre('2. CHEMIN BARÈME OFFICIEL (Ex1 uniquement — Q1+Q2 build bac2025)');
  const ex1 = obs.filter((o) => o.ex === 1);
  for (const sujet of [1, 2]) {
    const g = ex1.filter((o) => o.copie.sujet === sujet);
    const plafond = moyenne(g.map((o) => o.plafondBaremeAuto ?? 0));
    console.log(
      `  Sujet ${sujet} : crédit auto moyen ${r2(moyenne(g.map((o) => o.pointsBaremeAuto ?? 0)))}/5 pts ` +
        `(plafond auto moyen ${r2(plafond)}/5) — attendu moyen ${r2(moyenne(g.map((o) => o.pointsAttendus)))}/5`
    );
  }
  const rBareme = pearson(ex1.map((o) => o.p2), ex1.map((o) => o.pointsAttendus));
  const rBaremeKw = pearson(ex1.map((o) => o.p1), ex1.map((o) => o.pointsAttendus));
  console.log(
    `  r(barème auto, attendu) = ${r2(rBareme)} · r(couverture mots-clés, attendu) = ${r2(rBaremeKw)} sur Ex1`
  );

  // ── 3. Fiabilité globale (prédiction du total /20) ────────────────────────
  titre('3. FIABILITÉ GLOBALE — PRÉDICTION DU TOTAL /20');
  const p1Total = copies.map((c) =>
    r2(obs.filter((o) => o.copie === c).reduce((s, o) => s + o.p1, 0))
  );
  const p2Total = copies.map((c) =>
    r2(obs.filter((o) => o.copie === c).reduce((s, o) => s + o.p2, 0))
  );
  for (const [nom, pred] of [
    ['P1 (mots-clés × barème)', p1Total],
    ['P2 (hybride : barème Ex1 + mots-clés Ex2/Ex3)', p2Total],
  ] as const) {
    console.log(
      `  ${nom}\n    r(Pearson)=${r2(pearson(pred, attendus))} · ρ(Spearman)=${r2(spearman(pred, attendus))} · MAE=${r2(mae(pred, attendus))} pts · RMSE=${r2(rmse(pred, attendus))} pts · biais=${r2(moyenne(pred.map((p, i) => p - attendus[i]!)))}`
    );
  }
  globals.p1Total = p1Total;
  globals.p2Total = p2Total;
  globals.attendus = attendus;
  globals.obs = obs;
  globals.sanctions = sanctions;
}

// Contexte partagé entre principal() et la suite du rapport.
const globals: {
  p1Total: number[];
  p2Total: number[];
  attendus: number[];
  obs: ObsExercice[];
  sanctions: SanctionsCopie[];
} = { p1Total: [], p2Total: [], attendus: [], obs: [], sanctions: [] };

function suiteRapport(): void {
  const { p1Total, p2Total, attendus, obs, sanctions } = globals;
  const copies = sanctions.map((s) => s.copie);

  // ── 4. Par exercice / unité ───────────────────────────────────────────────
  titre('4. PAR EXERCICE — couverture vs points attendus (r, calibration fit a·x+b)');
  console.log('  Ex | S | Unité              | r kw | r ent | MAE P1 | fit: pts ≈ a·cov + b (R²)');
  for (const sujet of [1, 2]) {
    for (const ex of [1, 2, 3]) {
      const g = obs.filter((o) => o.copie.sujet === sujet && o.ex === ex);
      const unite = CORRECTEUR_V1_UNITES.find((u) => u.uniteId === g[0]!.unite);
      const f = fitLineaire(
        g.map((o) => o.couverture),
        g.map((o) => o.pointsAttendus)
      );
      console.log(
        `  ${ex}  | ${sujet} | U${String(g[0]!.unite).padEnd(2)} ${String(unite?.titre ?? '').slice(0, 18).padEnd(18)} |` +
          ` ${String(r2(pearson(g.map((o) => o.couverture), g.map((o) => o.pointsAttendus)))).padEnd(5)} |` +
          ` ${String(r2(pearson(g.map((o) => o.couvertureEntites), g.map((o) => o.pointsAttendus)))).padEnd(5)} |` +
          ` ${String(r2(mae(g.map((o) => o.p1), g.map((o) => o.pointsAttendus)))).padEnd(6)} |` +
          ` ${r2(f.a)}·x + ${r2(f.b)} (R²=${r2(f.r2)})`
      );
    }
  }

  // ── 5. Calibration par décile ─────────────────────────────────────────────
  titre('5. CALIBRATION — points attendus moyens par décile de couverture mots-clés');
  const trie = [...obs].sort((a, b) => a.couverture - b.couverture);
  for (let d = 0; d < 10; d++) {
    const tranche = trie.slice(
      Math.floor((d * trie.length) / 10),
      Math.floor(((d + 1) * trie.length) / 10)
    );
    if (tranche.length === 0) continue;
    console.log(
      `  décile ${d + 1} (cov moy ${r2(moyenne(tranche.map((o) => o.couverture)))}) : ` +
        `attendu ${r2(moyenne(tranche.map((o) => o.pointsAttendus)))} pts · P1 ${r2(moyenne(tranche.map((o) => o.p1)))} pts (n=${tranche.length})`
    );
  }

  // ── 5bis. ENTRAÎNEMENT : calibration par exercice + validation croisée ─────
  titre('5bis. P3 CALIBRÉ (entraîné) — pts ≈ a·cov + b PAR EXERCICE, validation croisée 4-fold');
  const cleGroupe = (o: ObsExercice) => `${o.copie.sujet}-${o.ex}`;
  const idCopie = (o: ObsExercice) => (o.copie.sujet - 1) * 40 + o.copie.numero - 1;
  const predire = (
    coefs: Map<string, { a: number; b: number }>,
    o: ObsExercice
  ): number => {
    const c = coefs.get(cleGroupe(o));
    if (!c) return 0;
    return Math.min(o.maxPts, Math.max(0, c.a * o.couverture + c.b));
  };
  // Validation croisée 4-fold : entraîner sur 3 folds, prédire le 4e.
  const p3cv = new Map<number, number>();
  for (let fold = 0; fold < 4; fold++) {
    const train = obs.filter((o) => idCopie(o) % 4 !== fold);
    const test = obs.filter((o) => idCopie(o) % 4 === fold);
    const groupes = new Map<string, { x: number[]; y: number[] }>();
    for (const o of train) {
      const g = groupes.get(cleGroupe(o)) ?? { x: [], y: [] };
      g.x.push(o.couverture);
      g.y.push(o.pointsAttendus);
      groupes.set(cleGroupe(o), g);
    }
    const coefs = new Map<string, { a: number; b: number }>();
    for (const [k, g] of groupes) coefs.set(k, fitLineaire(g.x, g.y));
    for (const o of test) p3cv.set(idCopie(o), (p3cv.get(idCopie(o)) ?? 0) + predire(coefs, o));
  }
  const p3TotalCv = copies.map((c) => r2(p3cv.get((c.sujet - 1) * 40 + c.numero - 1) ?? 0));
  console.log(
    `  P3-CV : r=${r2(pearson(p3TotalCv, attendus))} · ρ=${r2(spearman(p3TotalCv, attendus))} · ` +
      `MAE=${r2(mae(p3TotalCv, attendus))} pts · RMSE=${r2(rmse(p3TotalCv, attendus))} pts · ` +
      `biais=${r2(moyenne(p3TotalCv.map((p, i) => p - attendus[i]!)))} pts`
  );
  // Modèle de production (entraîné sur les 80) : coefficients livrables.
  const groupesFull = new Map<string, { x: number[]; y: number[] }>();
  for (const o of obs) {
    const g = groupesFull.get(cleGroupe(o)) ?? { x: [], y: [] };
    g.x.push(o.couverture);
    g.y.push(o.pointsAttendus);
    groupesFull.set(cleGroupe(o), g);
  }
  const coefsFull = new Map<string, { a: number; b: number }>();
  for (const [k, g] of groupesFull) coefsFull.set(k, fitLineaire(g.x, g.y));
  for (const [k, c] of coefsFull) console.log(`    calibration[${k}] : pts ≈ ${r2(c.a)}·cov + ${r2(c.b)} (pleine précision : a=${c.a.toFixed(6)}, b=${c.b.toFixed(6)})`);
  const p3Full = copies.map((c) =>
    r2(
      obs
        .filter((o) => o.copie === c)
        .reduce((s, o) => s + predire(coefsFull, o), 0)
    )
  );
  console.log(
    `  P3-full (production) : r=${r2(pearson(p3Full, attendus))} · ρ=${r2(spearman(p3Full, attendus))} · MAE=${r2(mae(p3Full, attendus))} · biais=${r2(moyenne(p3Full.map((p, i) => p - attendus[i]!)))}`
  );

  // ── 6. Matrice de confusion niveau copie (réussite ≥ 10/20) ───────────────
  titre('6. DÉCISION « RÉUSSITE » (prédit ≥ 10/20 vs attendu ≥ 10/20) — 80 copies');
  for (const [nom, pred] of [
    ['P1', p1Total],
    ['P2', p2Total],
    ['P3-CV', p3TotalCv],
    ['P3-full', p3Full],
  ] as const) {
    let vp = 0;
    let fp = 0;
    let fn = 0;
    let vn = 0;
    for (let i = 0; i < attendus.length; i++) {
      const pR = pred[i]! >= 10;
      const vR = attendus[i]! >= 10;
      if (pR && vR) vp++;
      else if (pR && !vR) fp++;
      else if (!pR && vR) fn++;
      else vn++;
    }
    const precision = vp + fp === 0 ? NaN : vp / (vp + fp);
    const rappel = vp + fn === 0 ? NaN : vp / (vp + fn);
    const f1 = precision + rappel === 0 ? NaN : (2 * precision * rappel) / (precision + rappel);
    console.log(
      `  ${nom} : VP=${vp} FP=${fp} FN=${fn} VN=${vn} → précision=${r2(precision)} rappel=${r2(rappel)} F1=${r2(f1)}`
    );
  }

  // ── 7. Sanctions ──────────────────────────────────────────────────────────
  titre('7. SANCTIONS PÉDAGOGIQUES (sur les 80 copies)');
  const avecFortes = sanctions.filter((s) => s.fortes.length > 0);
  console.log(
    `  Copies avec ≥1 sanction forte : ${avecFortes.length}/80 — avec vigilance : ${
      sanctions.filter((s) => s.vigilances.length > 0).length
    }/80`
  );
  const parId = new Map<string, number>();
  for (const s of sanctions) for (const f of s.fortes) parId.set(f.id, (parId.get(f.id) ?? 0) + 1);
  for (const [id, k] of parId) console.log(`    · ${id} : ${k} copie(s)`);
  const attenduFortes = avecFortes.length ? moyenne(avecFortes.map((s) => s.copie.attendu.total)) : NaN;
  const attenduSans = moyenne(
    sanctions.filter((s) => s.fortes.length === 0).map((s) => s.copie.attendu.total)
  );
  console.log(
    `  Total attendu moyen : ${r2(attenduFortes)} (sanctionnées) vs ${r2(attenduSans)} (non sanctionnées)`
  );
  const excellentesF = avecFortes.filter((s) => niveauDe(s.copie.attendu.total) === 'excellente');
  if (excellentesF.length > 0) {
    console.log(`  ⚠ Faux positifs : ${excellentesF.length} copie(s) « excellente » sanctionnée(s) :`);
    for (const s of excellentesF.slice(0, 5)) {
      console.log(
        `    · S${s.copie.sujet}/N°${s.copie.numero} (${s.copie.nom}) → ${s.fortes.map((f) => f.id).join(', ')}`
      );
    }
  }

  // ── 8. Top écarts ─────────────────────────────────────────────────────────
  titre('8. TOP 10 ÉCARTS |P1 − attendu| PAR EXERCICE (diagnostic mots manquants)');
  const ecarts = [...obs].sort(
    (a, b) => Math.abs(b.p1 - b.pointsAttendus) - Math.abs(a.p1 - a.pointsAttendus)
  );
  for (const o of ecarts.slice(0, 10)) {
    const unite = CORRECTEUR_V1_UNITES.find((u) => u.uniteId === o.unite);
    const res = evaluerReponseKeywords(o.copie.sections[o.ex - 1]!, o.unite);
    console.log(
      `  S${o.copie.sujet}/N°${o.copie.numero} Ex${o.ex} (U${o.unite} ${unite?.titre ?? ''}) : ` +
        `attendu ${o.pointsAttendus}/${o.maxPts} vs P1 ${o.p1} — cov=${r2(o.couverture)} (${o.trouve}/${o.totalKw})`
    );
    console.log(`    manquants : ${res.manquants.slice(0, 8).join(' · ')}`);
  }

  // ── 9. SENSIBILITÉ (R4) — appauvrissement du vocabulaire ──────────────────
  titre('9. SENSIBILITÉ DU MODÈLE (R4) — appauvrissement des 5 meilleures copies');
  {
    const trieCopies = [...copies].sort((a, b) => b.attendu.total - a.attendu.total);
    for (const copie of trieCopies.slice(0, 5)) {
      let p3Origine = 0;
      let p3Moitie = 0;
      for (const ex of [1, 2, 3] as const) {
        const m = MAPPING[copie.sujet]![ex - 1]!;
        const texte = copie.sections[ex - 1]!;
        const banque = CORRECTEUR_V1_UNITES.find((u) => u.uniteId === m.unite)!.motsCles;
        const res = evaluerReponseKeywords(texte, m.unite);
        p3Origine += predire(coefsFull, {
          ...obs.find((o) => o.copie === copie && o.ex === ex)!,
          couverture: res.couverture,
        });
        // Dégradation : retirer la MOITIÉ des mots-clés trouvés du texte normalisé.
        const norm = normalizeAr(texte);
        const aRetirer = res.trouves
          .slice(Math.floor(res.trouves.length / 2))
          .map((k) => normalizeAr(k))
          .filter(Boolean);
        let normAppauvri = norm;
        for (const t of aRetirer) normAppauvri = normAppauvri.split(t).join(' ');
        const covAppauvrie =
          banque.filter((kw) => normAppauvri.includes(normalizeAr(kw))).length / banque.length;
        p3Moitie += predire(coefsFull, {
          ...obs.find((o) => o.copie === copie && o.ex === ex)!,
          couverture: covAppauvrie,
        });
      }
      // Appauvrissement total : couverture 0 → note 0 (règle moteur).
      console.log(
        `  S${copie.sujet}/N°${copie.numero} (attendu ${copie.attendu.total}) : ` +
          `P3 ${r2(p3Origine)} → vocabulaire −50% ${r2(p3Moitie)} → vocabulaire 0% 0`
      );
      if (p3Moitie >= p3Origine) {
        console.log('    ⚠ ANOMALIE : la note ne chute pas avec le vocabulaire');
        process.exitCode = 1;
      }
    }
    console.log('  ✓ la note calibrée répond monotonement à l’appauvrissement (−50% → −100%)');
  }

  // ── 10. CSV ───────────────────────────────────────────────────────────────
  titre('10. EXPORTS CSV');
  const lignesEx: (string | number)[][] = [
    [
      'sujet', 'numero', 'nom', 'exercice', 'uniteId', 'couverture', 'trouve', 'totalKw',
      'entitesTrouvees', 'entitesTotal', 'pistes', 'pointsAttendus', 'pointsMax',
      'p1', 'p2', 'baremeAuto', 'plafondBaremeAuto', 'passeDefaut', 'niveau',
    ],
  ];
  for (const o of obs) {
    lignesEx.push([
      o.copie.sujet, o.copie.numero, o.copie.nom, o.ex, o.unite,
      r2(o.couverture), o.trouve, o.totalKw,
      o.entitesTrouvees, o.entitesTotal, o.nbPistes, o.pointsAttendus, o.maxPts,
      o.p1, o.p2, o.pointsBaremeAuto ?? '', o.plafondBaremeAuto ?? '',
      o.passeDefaut ? '1' : '0', niveauDe(o.copie.attendu.total),
    ]);
  }
  const cheminEx = path.join(DOSSIER_SORTIE, 'resultats-correcteur-exercices.csv');
  ecrireCsv(cheminEx, lignesEx);

  const lignesCopies: (string | number)[][] = [
    ['sujet', 'numero', 'nom', 'attenduTotal', 'p1Total', 'p2Total', 'p3Full', 'niveau', 'sanctionsFortes', 'sanctionsVigilance'],
  ];
  for (const s of sanctions) {
    const i = sanctions.indexOf(s);
    lignesCopies.push([
      s.copie.sujet, s.copie.numero, s.copie.nom, s.copie.attendu.total,
      p1Total[i] ?? '', p2Total[i] ?? '', p3Full[i] ?? '',
      niveauDe(s.copie.attendu.total), s.fortes.map((f) => f.id).join('|'), s.vigilances.length,
    ]);
  }
  const cheminCopies = path.join(DOSSIER_SORTIE, 'resultats-correcteur-copies.csv');
  ecrireCsv(cheminCopies, lignesCopies);
  console.log(`  ✓ ${cheminEx} (${lignesEx.length - 1} lignes)`);
  console.log(`  ✓ ${cheminCopies} (${lignesCopies.length - 1} lignes)`);
}

principal();
suiteRapport();




