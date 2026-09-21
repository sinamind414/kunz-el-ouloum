// evaluerCopies.ts — SUPERVISION R4 : fiabilité du correcteur sur des copies réelles.
//
// Entrée : N fichiers élèves (eleve_XX.txt) + un RECAPITULATIF (notes du prof).
// Sortie : note correcteur par copie (sujet complet /20 ou exercice isolé),
// comparaison aux notes prof, Pearson r, écarts — le verdict de fiabilité.
//
// Deux modes :
//  · « sujet-complet » : le fichier contient les 3 exercices (repères التمرين…)
//    → noterCopieCalibree → total /20, comparé au RECAP ;
//  · « exercice » : une seule réponse → auto-argmax sur les 6 groupes (ou groupe
//    forcé) — pas de comparaison RECAP (format de notes par exercice inconnu).
//
// AUCUNE décision de correction automatique ici : cet outil MESURE l'écart
// correcteur ↔ prof ; les écarts nourrissent la supervision (R4), jamais une
// note envoyée à un élève.

import { noterExerciceCalibre, noterCopieCalibree, type NoteCalibree } from '../data/dictionaries/calibrationBac2025';

export interface CopieResultat {
  fichier: string;
  numero: number;
  mode: 'sujet-complet' | 'exercice';
  /** Sujet retenu (complet : argmax si --sujet absent ; exercice : celui du groupe). */
  sujet: 1 | 2;
  /** Exercice retenu (mode exercice uniquement). */
  exercice?: 1 | 2 | 3;
  /** Note correcteur : total /20 (complet) ou note /maxPts (exercice). */
  note: number;
  /** Ambiguïté d'attribution S1/S2 (écart < 1 pt) — à trancher à la main. */
  attributionAmbigue?: boolean;
  couverture: number;
  plafondsActifs: string[];
  sanctionsForte: string[];
  noteProf?: number;
  ecart?: number;
  /** Mode complet : notes moteur [Ex1, Ex2, Ex3]. */
  notesParExercice?: number[];
  /** Notes attendues du correcteur (bloc SCORE ATTENDU). */
  attenduParExercice?: (number | null)[];
  /** Écarts par exercice (moteur − attendu) quand les deux existent. */
  ecartsParExercice?: (number | null)[];
}

export interface StatsBatch {
  n: number;
  nAvecProf: number;
  pearson: number | null;
  ecartMoyen: number | null;
  ecartAbsoluMoyen: number | null;
  noteMoyenneCorrecteur: number;
  noteMoyenneProf: number | null;
  attributionsAmbigues: number;
  /** Par exercice (sur les copies avec SCORE ATTENDU) : [Ex1, Ex2, Ex3]. */
  pearsonParExercice: (number | null)[];
  ecartAbsoluMoyenParExercice: (number | null)[];
}

const AR_VERS_LATIN: Record<string, string> = {
  '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
  '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9',
};

function latiniser(s: string): string {
  return s.replace(/[٠-٩]/g, (d) => AR_VERS_LATIN[d] ?? d);
}

/**
 * Supprime le bloc « SCORE ATTENDU » (fin de copie) : il contient les termes du
 * corrigé (ARN, pyrénoïde, hypothèse…) qui pollueraient la détection — on note
 * la COPIE, pas les notes du correcteur.
 */
export function couperBlocScore(texte: string): string {
  const i = texte.search(/SCORE\s+ATTENDU/i);
  return i < 0 ? texte : texte.slice(0, i);
}

export interface ScoreAttendu {
  exercices: (number | null)[]; // index 0..2 = Ex1..Ex3
  total: number | null;
}

/** Parse « - Exercice N : X/Y » + « - TOTAL : T/20 » (décimales . ou ,). */
export function parserScoreAttendu(texte: string): ScoreAttendu | null {
  const bloc = texte.slice(texte.search(/SCORE\s+ATTENDU/i));
  if (!bloc) return null;
  const exercices: (number | null)[] = [null, null, null];
  let m: RegExpExecArray | null;
  const re = /Exercice\s*([123])\s*:\s*(\d{1,2}(?:[.,]\d{1,2})?)\s*\/\s*\d+/gi;
  while ((m = re.exec(bloc)) !== null) exercices[parseInt(m[1], 10) - 1] = parseFloat(m[2].replace(',', '.'));
  const t = bloc.match(/TOTAL\s*:\s*(\d{1,2}(?:[.,]\d{1,2})?)\s*\/\s*20/i);
  const any = exercices.some((x) => x !== null) || t !== null;
  return any ? { exercices, total: t ? parseFloat(t[1].replace(',', '.')) : null } : null;
}

/**
 * Découpe un sujet complet en 3 sections sur les repères « التمرين الأول/الثاني/
 * الثالث » (ou 1/2/3). null si moins de 2 repères — la copie n'est pas splittable.
 */
export function splitSections(texte: string): [string, string, string] | null {
  const re = /التمرين\s*(الأول|الثاني|الثالث|[123١٢٣])\b|التمرين\s*[:：]?\s*(الأول|الثاني|الثالث)/g;
  type Marqueur = { index: number; rang: 1 | 2 | 3 };
  const marqueurs: Marqueur[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(texte)) !== null) {
    const token = m[1] ?? m[2];
    const rang: 1 | 2 | 3 =
      /الأول|1|١/.test(token) ? 1 : /الثاني|2|٢/.test(token) ? 2 : 3;
    if (!marqueurs.some((x) => x.rang === rang)) marqueurs.push({ index: m.index, rang });
  }
  if (marqueurs.length < 2) return null;
  const tri = [...marqueurs].sort((a, b) => a.index - b.index);
  const sections: string[] = ['', '', ''];
  for (let i = 0; i < tri.length; i++) {
    const fin = i + 1 < tri.length ? tri[i + 1].index : texte.length;
    sections[tri[i].rang - 1] = texte.slice(tri[i].index, fin);
  }
  return [sections[0], sections[1], sections[2]];
}

export interface RecapParse {
  notes: Map<number, number>;
  lignesNonParsees: string[];
}

/**
 * Parse tolérant du RECAPITULATIF : toute ligne contenant « eleve_NN » (ou
 * « eleve NN ») + un nombre. Plusieurs nombres ≤ 8 par ligne = notes par
 * exercice → sommées. Chiffres arabes (٠-٩) acceptés, virgule décimale acceptée.
 */
export function parserRecap(texteBrut: string): RecapParse {
  const notes = new Map<number, number>();
  const lignesNonParsees: string[] = [];
  for (const ligneBrute of latiniser(texteBrut).split(/\r?\n/)) {
    const ligne = ligneBrute.trim();
    if (!ligne) continue;
    const mEleve = ligne.match(/eleve\s*[_\-\s]?\s*(\d{1,2})/i);
    const mTable = mEleve ? null : ligne.match(/^(\d{1,2})\s*\|/);
    if (!mEleve && !mTable) {
      if (/\d/.test(ligne)) lignesNonParsees.push(ligneBrute);
      continue;
    }
    const numero = parseInt((mEleve ?? mTable)![1], 10);
    const apres = mEleve
      ? ligne.slice((mEleve.index ?? 0) + mEleve[0].length)
      : ligne.slice((mTable!.index ?? 0) + mTable![0].length);
    const nombres = [...apres.matchAll(/(\d{1,2}(?:[.,]\d{1,2})?)\s*(?:\/\s*20)?/g)]
      .map((x) => parseFloat(x[1].replace(',', '.')))
      .filter((x) => Number.isFinite(x));
    if (nombres.length === 0) {
      lignesNonParsees.push(ligneBrute);
      continue;
    }
    const somme = Math.round(nombres.slice(0, -1).reduce((a, b) => a + b, 0) * 100) / 100;
    const note =
      nombres.length === 1
        ? nombres[0]
        : Math.abs(somme - nombres[nombres.length - 1]) < 0.01
          ? nombres[nombres.length - 1] // « n1 n2 n3 TOTAL » avec TOTAL = Σ
          : nombres.every((x) => x <= 8)
            ? Math.round(nombres.reduce((a, b) => a + b, 0) * 100) / 100
            : nombres[0];
    notes.set(numero, note);
  }
  return { notes, lignesNonParsees };
}

/** Corrélation de Pearson ; null si n < 2 ou variance nulle. */
export function pearson(xs: number[], ys: number[]): number | null {
  const n = Math.min(xs.length, ys.length);
  if (n < 2) return null;
  const mx = xs.reduce((a, b) => a + b, 0) / n;
  const my = ys.reduce((a, b) => a + b, 0) / n;
  let sxy = 0, sxx = 0, syy = 0;
  for (let i = 0; i < n; i++) {
    const dx = xs[i] - mx, dy = ys[i] - my;
    sxy += dx * dy; sxx += dx * dx; syy += dy * dy;
  }
  if (sxx === 0 || syy === 0) return null;
  return sxy / Math.sqrt(sxx * syy);
}

// Les plafonds de NoteCalibree = uniquement ceux DÉCLENCHÉS (calculerPlafonds
// filtre sur les signaux ; appliquerPlafonds prend leur min).
const fmtPlafonds = (n: NoteCalibree): string[] => n.plafonds.map((p) => String(p.type));

function evaluerExerciceAuto(texte: string): {
  sujet: 1 | 2; exercice: 1 | 2 | 3; note: number; couverture: number; n: NoteCalibree;
} {
  let best: { sujet: 1 | 2; exercice: 1 | 2 | 3; note: number; couverture: number; n: NoteCalibree } | null = null;
  for (const sujet of [1, 2] as const)
    for (const exercice of [1, 2, 3] as const) {
      const n = noterExerciceCalibre(texte, sujet, exercice);
      if (!best || n.points > best.note || (n.points === best.note && n.couverture > best.couverture)) {
        best = { sujet, exercice, note: n.points, couverture: n.couverture, n };
      }
    }
  return best!;
}

/** Évalue UNE copie (sujet complet si splittable, sinon exercice auto/forcé). */
export function evaluerCopie(
  fichier: string,
  texte: string,
  opts: { sujet?: 1 | 2; groupe?: { sujet: 1 | 2; exercice: 1 | 2 | 3 } } = {}
): CopieResultat {
  const numero = parseInt((fichier.match(/(\d{1,3})/) ?? ['0', '0'])[1], 10) || 0;
  const sections = opts.groupe ? null : splitSections(texte);
  if (sections) {
    const candidats = opts.sujet ? ([opts.sujet] as const) : ([1, 2] as const);
    let best: { sujet: 1 | 2; total: number; ex: NoteCalibree[] } | null = null;
    for (const sujet of candidats) {
      const r = noterCopieCalibree(sections, sujet);
      if (!best || r.total > best.total) best = { sujet, total: r.total, ex: r.exercices };
    }
    const ambigue =
      !opts.sujet &&
      (() => {
        const t1 = noterCopieCalibree(sections, 1).total;
        const t2 = noterCopieCalibree(sections, 2).total;
        return Math.abs(t1 - t2) < 1;
      })();
    const couv = best!.ex.reduce((s, e) => s + e.couverture, 0) / 3;
    return {
      fichier, numero, mode: 'sujet-complet', sujet: best!.sujet, note: best!.total,
      attributionAmbigue: ambigue || undefined, couverture: Math.round(couv * 1000) / 1000,
      notesParExercice: best!.ex.map((e) => e.points),
      plafondsActifs: [...new Set(best!.ex.flatMap(fmtPlafonds))],
      sanctionsForte: [...new Set(best!.ex.flatMap((e) => e.sanctionsForte.map((s) => s.id)))],
    };
  }
  if (opts.groupe) {
    const n = noterExerciceCalibre(texte, opts.groupe.sujet, opts.groupe.exercice);
    return {
      fichier, numero, mode: 'exercice', sujet: opts.groupe.sujet, exercice: opts.groupe.exercice,
      note: n.points, couverture: n.couverture, plafondsActifs: fmtPlafonds(n),
      sanctionsForte: n.sanctionsForte.map((s) => s.id),
    };
  }
  const auto = evaluerExerciceAuto(texte);
  return {
    fichier, numero, mode: 'exercice', sujet: auto.sujet, exercice: auto.exercice,
    note: auto.note, couverture: auto.couverture, plafondsActifs: fmtPlafonds(auto.n),
    sanctionsForte: auto.n.sanctionsForte.map((s) => s.id),
  };
}

/** Batch : évalue toutes les copies et rapproche SCORE ATTENDU / RECAP (mode complet). */
export function evaluerBatch(
  copies: readonly { fichier: string; texte: string; attendu?: ScoreAttendu }[],
  recap?: RecapParse,
  opts: { sujet?: 1 | 2; groupe?: { sujet: 1 | 2; exercice: 1 | 2 | 3 } } = {}
): { resultats: CopieResultat[]; stats: StatsBatch } {
  const resultats = copies.map((c) => {
    const r = evaluerCopie(c.fichier, c.texte, opts);
    if (r.mode === 'sujet-complet' && c.attendu) {
      r.attenduParExercice = c.attendu.exercices;
      if (c.attendu.total !== null) r.noteProf = c.attendu.total;
      else {
        const vals = c.attendu.exercices.filter((x): x is number => x !== null);
        if (vals.length === 3) r.noteProf = Math.round(vals.reduce((a, b) => a + b, 0) * 100) / 100;
      }
    }
    if (r.noteProf === undefined && recap?.notes.has(r.numero) && r.mode === 'sujet-complet') {
      r.noteProf = recap.notes.get(r.numero);
    }
    if (r.noteProf !== undefined) {
      r.ecart = Math.round((r.note - (r.noteProf ?? 0)) * 100) / 100;
    }
    if (r.notesParExercice && r.attenduParExercice) {
      r.ecartsParExercice = r.attenduParExercice.map((a, i) =>
        a === null ? null : Math.round((r.notesParExercice![i] - a) * 100) / 100
      );
    }
    return r;
  });
  const avecProf = resultats.filter((r) => r.noteProf !== undefined);
  const xs = avecProf.map((r) => r.note);
  const ys = avecProf.map((r) => r.noteProf!);
  const r = pearson(xs, ys);
  const stats: StatsBatch = {
    n: resultats.length,
    nAvecProf: avecProf.length,
    pearson: r === null ? null : Math.round(r * 1000) / 1000,
    ecartMoyen:
      avecProf.length === 0 ? null : Math.round((xs.reduce((a, b) => a + b, 0) - ys.reduce((a, b) => a + b, 0)) / avecProf.length * 100) / 100,
    ecartAbsoluMoyen:
      avecProf.length === 0 ? null : Math.round(avecProf.reduce((s, x) => s + Math.abs(x.ecart!), 0) / avecProf.length * 100) / 100,
    noteMoyenneCorrecteur: resultats.length === 0 ? 0 : Math.round(resultats.reduce((s, x) => s + x.note, 0) / resultats.length * 100) / 100,
    noteMoyenneProf: avecProf.length === 0 ? null : Math.round((ys.reduce((a, b) => a + b, 0) / avecProf.length) * 100) / 100,
    attributionsAmbigues: resultats.filter((x) => x.attributionAmbigue).length,
    pearsonParExercice: [0, 1, 2].map((i) => {
      const paires = resultats
        .filter((x) => x.notesParExercice && x.attenduParExercice && x.attenduParExercice[i] !== null)
        .map((x) => [x.notesParExercice![i], x.attenduParExercice![i] as number]);
      const r = pearson(paires.map((p) => p[0]), paires.map((p) => p[1]));
      return r === null ? null : Math.round(r * 1000) / 1000;
    }),
    ecartAbsoluMoyenParExercice: [0, 1, 2].map((i) => {
      const ecarts = resultats
        .map((x) => x.ecartsParExercice?.[i])
        .filter((x): x is number => x !== undefined && x !== null);
      return ecarts.length === 0
        ? null
        : Math.round((ecarts.reduce((a, b) => a + Math.abs(b), 0) / ecarts.length) * 100) / 100;
    }),
  };
  return { resultats, stats };
}
