// baremeCorrecteur.ts — Notation par barème officiel (section « attendus » du build).
//
// Le DICTIONNAIRE FINAL porte 80 attendus officiels (bac2023→bac2025, sujets 1 et 2),
// chacun avec son texte officiel AR/FR et ses points. Principe de crédit :
//   · la SIGNATURE d'un item = les entités du dictionnaire (officiel+verifie)
//     détectées dans son texte officiel — mémoïsée une fois par item ;
//   · un item est crédité automatiquement si la réponse de l'élève contient
//     au moins une forme de sa signature ;
//   · un item sans signature détectable (intros, conclusions, annonces,
//     items procéduraux) = crédit « manuel » : compté dans le total, jamais
//     attribué automatiquement — le correcteur humain tranche.
// RÈGLE MOTEUR : cette notation est une AIDE au corrigé (advisory), pas un verdict.

import { ATTENDUS_BAREME, entitesDansTexte } from './dictionnaireCorrecteur';
import { normalizeAr } from '../../lib/validation/normalizeAr';

export interface ItemBareme {
  /** Clé complète dans le build (bac2023_S1/S1-Ex1/Q1/item1). */
  id: string;
  /** Question parente (bac2023_S1/S1-Ex1/Q1). */
  questionId: string;
  ar: string;
  fr: string;
  points: number;
  statut: string;
}

export interface BaremeQuestion {
  id: string;
  sujetId: string;
  annee: number;
  session: 'S1' | 'S2';
  exNum: number;
  qNum: number;
  labelAr: string;
  items: ItemBareme[];
  totalPoints: number;
}

export interface BaremeSujet {
  id: string;
  annee: number;
  session: 'S1' | 'S2';
  questions: BaremeQuestion[];
}

export interface ViaEntite {
  id: string;
  /** Forme brute reconnue (affichage). */
  terme: string;
  /** Forme normalisée utilisée pour la recherche. */
  norm: string;
}

export interface VerdictItem {
  item: ItemBareme;
  /** Crédité automatiquement (signature reconnue dans la réponse). */
  credite: boolean;
  /** auto = crédit automatique possible ; manuelle = à vérifier par le correcteur. */
  mode: 'auto' | 'manuelle';
  /** Entités qui ont fait créditer l'item — vide si non crédité ou manuel. */
  via: ViaEntite[];
}

export interface ResultatBareme {
  questionId: string;
  labelAr: string;
  verdicts: VerdictItem[];
  pointsObtenus: number;
  pointsTotal: number;
  nbAuto: number;
  nbManuelles: number;
}

const RE_CLE = /^(bac(\d{4})_(S[12]))\/(S[12]-Ex(\d))\/(Q(\d))\/(.+)$/;

// ── Construction des questions (une fois au chargement) ──────────────────────

const QUESTIONS: BaremeQuestion[] = (() => {
  const entrees = new Map<
    string,
    { items: ItemBareme[]; sujetId: string; annee: number; session: 'S1' | 'S2'; exNum: number; qNum: number }
  >();
  for (const [cle, item] of Object.entries(ATTENDUS_BAREME)) {
    const m = RE_CLE.exec(cle);
    if (!m) continue;
    const questionId = `${m[1]}/${m[4]}/${m[6]}`;
    let e = entrees.get(questionId);
    if (!e) {
      e = {
        items: [],
        sujetId: m[1]!,
        annee: Number(m[2]),
        session: m[3] === 'S2' ? 'S2' : 'S1',
        exNum: Number(m[5]),
        qNum: Number(m[7]),
      };
      entrees.set(questionId, e);
    }
    e.items.push({
      id: cle,
      questionId,
      ar: item.ar ?? '',
      fr: item.fr ?? '',
      points: typeof item.points === 'number' ? item.points : 0,
      statut: item.statut ?? 'officiel',
    });
  }
  const questions: BaremeQuestion[] = [];
  for (const [qid, e] of entrees) {
    const sessionAr = e.session === 'S1' ? 'الموضوع الأول' : 'الموضوع الثاني';
    questions.push({
      id: qid,
      sujetId: e.sujetId,
      annee: e.annee,
      session: e.session,
      exNum: e.exNum,
      qNum: e.qNum,
      labelAr: `بكالوريا ${e.annee} · ${sessionAr} · التمرين ${e.exNum} · السؤال ${e.qNum}`,
      items: e.items,
      totalPoints: Math.round(e.items.reduce((s, i) => s + i.points, 0) * 100) / 100,
    });
  }
  return questions;
})();

/** Questions du barème officiel groupées (12 questions · 80 items · bac2023→2025). */
export function listBaremeQuestions(): BaremeQuestion[] {
  return QUESTIONS;
}

/** Sujets officiels (bac2023_S1 … bac2025_S2) avec leurs questions. */
export function listBaremeSujets(): BaremeSujet[] {
  const parSujet = new Map<string, BaremeSujet>();
  for (const q of QUESTIONS) {
    let s = parSujet.get(q.sujetId);
    if (!s) {
      s = { id: q.sujetId, annee: q.annee, session: q.session, questions: [] };
      parSujet.set(q.sujetId, s);
    }
    s.questions.push(q);
  }
  return [...parSujet.values()];
}

// ── Signatures mémoïsées + évaluation ────────────────────────────────────────

const SIGNATURES = new Map<string, ViaEntite[]>();

/** Entités scorées dont une forme figure dans le texte officiel de l'item. */
function signatureDe(item: ItemBareme): ViaEntite[] {
  let sig = SIGNATURES.get(item.id);
  if (!sig) {
    const texte = item.ar || item.fr;
    sig = entitesDansTexte(texte).trouvees.map((t) => ({
      id: t.id,
      terme: t.terme,
      norm: normalizeAr(t.terme).toLowerCase(),
    }));
    SIGNATURES.set(item.id, sig);
  }
  return sig;
}

/**
 * Note une réponse contre une question du barème officiel.
 * Items « manuelle » : comptés dans pointsTotal mais jamais crédités
 * automatiquement — le correcteur humain tranche.
 */
export function evaluerBareme(reponse: string, questionId: string): ResultatBareme | null {
  const q = QUESTIONS.find((x) => x.id === questionId);
  if (!q) return null;
  const norm = normalizeAr(reponse || '').toLowerCase();
  const verdicts: VerdictItem[] = [];
  let pointsObtenus = 0;
  let nbAuto = 0;
  let nbManuelles = 0;
  for (const item of q.items) {
    const sig = signatureDe(item);
    const mode: 'auto' | 'manuelle' = sig.length > 0 ? 'auto' : 'manuelle';
    if (mode === 'manuelle') nbManuelles++;
    else nbAuto++;
    const via = mode === 'auto' && norm ? sig.filter((s) => norm.includes(s.norm)) : [];
    const credite = via.length > 0;
    if (credite) pointsObtenus += item.points;
    verdicts.push({ item, credite, mode, via });
  }
  return {
    questionId: q.id,
    labelAr: q.labelAr,
    verdicts,
    pointsObtenus: Math.round(pointsObtenus * 100) / 100,
    pointsTotal: q.totalPoints,
    nbAuto,
    nbManuelles,
  };
}