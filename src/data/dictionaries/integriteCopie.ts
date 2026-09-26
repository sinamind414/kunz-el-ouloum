// integriteCopie.ts — Blindage anti-jeu du correcteur (Pierre 1 — audit
// docs/AUDIT_CORRECTEUR_MEFTAH_2026-09-19.md, constats C1/C2/C7).
//
// PROBLÈME (probes adversariales du 2026-09-19, sorties réelles) :
//   · salade de mots-clés sans syntaxe            → 8/8
//   · réponse hors-sujet (autre partie du cours)  → 8/8
//   · négations (le bon mot, le sens faux)        → 8/8
//   · énoncé recopié mot à mot (perroquet)        → 8/8
// Le correcteur est un détecteur de déversement lexical : il compte des
// mots-clés sans lire ni la structure, ni le sens, ni la question.
//
// CE MODULE (règle moteur « Pierre 1 ») :
//   · calcule des SIGNAUX de surface : structure de prose, densité de
//     négations d'assertion, écho lexical avec l'énoncé (perroquet) ;
//   · les convertit en PLAFONDS (jamais en points) appliqués à la note
//     calibrée — le retour pédagogique (mots-clés trouvés, entités,
//     sanctions) reste inchangé ;
//   · CONTRÔLE POSITIF verrouillé par test : les réponses modèles de
//     Meftah (meftahManhajia.ts, visages BAC 2025) ne déclenchent AUCUN
//     plafond — on ne régresse pas sur les copies légitimes.
//
// HORS PÉRIMÈTRE assumé (prochaine pierre) : le hors-sujet intrinsèque
// exige les attendus PAR question en entrée — la porte existe
// (OptionsNotation.attendus → evaluerReponseKeywords mode « attendus »),
// le contenu reste à rédiger (projet éditorial, audit §5.4a).

import { normalizeAr } from '../../lib/validation/normalizeAr';

// ─── Signaux ─────────────────────────────────────────────────────────────────

export interface SignauxCopie {
  /** Mots (≥2 caractères) de la réponse normalisée. */
  nbMots: number;
  /** La réponse a une structure de prose (phrases + marqueur de relation). */
  estProse: boolean;
  /** Marqueurs de négation d'assertion détectés (formes normalisées). */
  negations: string[];
  /**
   * Part des mots de contenu de la réponse qui proviennent de l'énoncé
   * (0..1) — « perroquet » si élevée. Null si aucun énoncé fourni.
   */
  ratioEcho: number | null;
}

/** Marqueurs de relation/analyse (meftahLaw ANALYSIS_PATTERNS + scorer). */
const RELATION_RE =
  /(كلما|بينما|في حين|نلاحظ|تمثل|يمثل|علاقه|يزداد|يتزايد|ينقص|يتناقص|راجع الى|نستنتج|الاستنتاج|ومنه|يؤكد)/;

// Clitique arabe agglutiné + radical de ≥3 lettres (morphologie d'une vraie phrase).
const RE_CLIT = /^(?:ال|[وفبلك]).{3,}$/;
/** Densité minimale de clitiques pour qu'un segment long + marqueur soit de la prose. */
const SEUIL_GLUE = 0.2; // audit 2026-09-26 : salade 0.06 vs légitimes 0.26–0.57

/**
 * Négations d'ASSERTION uniquement — PAS les négations légitimes d'un
 * mécanisme décrit (« فلا تفرز حويصلات » dans la réponse modèle officielle
 * est une causalité, pas un déni). Liste explicite, seuil de densité ≥ 3.
 */
const NEGATION_MARKERS = [
  'لا يوجد', 'لا يمكن', 'لا يحدث', 'لا يتحرر', 'لا يعمل', 'لا يرتبط',
  'لا يثبت', 'لا تدخل', 'لا ينتقل', 'غير موجود', 'غير قادر', 'مستحيل',
];

const STOPWORDS = new Set([
  'في', 'من', 'على', 'الى', 'عن', 'مع', 'هذا', 'هذه', 'ذلك', 'تلك',
  'التي', 'الذي', 'الذين', 'ما', 'لا', 'ان', 'هو', 'هي', 'كما', 'او',
  'ثم', 'قد', 'كل', 'بعد', 'قبل', 'عند', 'حيث', 'لماذا', 'كيف', 'هل',
  'ذات', 'دون', 'بين', 'اما', 'بها', 'به', 'لها', 'له', 'منها', 'فيها',
  'حتى', 'اذا', 'كلما', 'بينما', 'و', 'ب', 'ل',
]);

function motsContenu(texte: string): string[] {
  const norm = normalizeAr(texte).toLowerCase();
  return norm
    .split(/[^a-z0-9\u0600-\u06FF]+/)
    .filter((t) => t.length >= 2 && !/^\d+$/.test(t) && !STOPWORDS.has(t));
}

/** La ponctuation est détruite par normalizeAr → segmentation sur le BRUT. */
function estDeLaProse(brut: string, norm: string): boolean {
  const segments = brut
    .split(/[.!?؟؛;:\n\r—–]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  let phrases = 0;
  for (const seg of segments) {
    if (seg.split(/\s+/).filter((w) => w.length >= 2).length >= 4) phrases++;
  }
  if (phrases >= 2) return true;
  if (phrases < 1 || !RELATION_RE.test(norm)) return false;
  // AUDIT qualité correcteur (2026-09-26) : une salade de mots-clés contenant
  // une forme attendue qui EST un marqueur de relation (ex. « نستنتج ») passait
  // pour de la prose et désactivait le plafond non_prose → 66 % pour du
  // déversement lexical. Une vraie phrase courte a une morphologie : clitiques
  // agglutinés (ال / و / ف / ب / ل / ك + radical). On exige cette colle
  // grammaticale au-dessus de 10 tokens ; en-dessous, la salade ne peut de
  // toute façon pas créditer beaucoup d'attendus.
  const tokens = norm.split(/\s+/).filter((t) => t.length >= 2);
  if (tokens.length < 10) return true;
  const clitiques = tokens.filter((t) => RE_CLIT.test(t)).length;
  return clitiques / tokens.length >= SEUIL_GLUE;
}

export function analyserSignaux(reponse: string, question?: string): SignauxCopie {
  const brut = reponse || '';
  const norm = normalizeAr(brut).toLowerCase();
  const mots = motsContenu(brut);

  const negations = NEGATION_MARKERS.filter((m) => norm.includes(m));

  let ratioEcho: number | null = null;
  if (question && question.trim()) {
    const setQuestion = new Set(motsContenu(question));
    if (mots.length > 0 && setQuestion.size > 0) {
      const inter = mots.filter((m) => setQuestion.has(m)).length;
      ratioEcho = inter / mots.length;
    }
  }

  return {
    nbMots: mots.length,
    estProse: estDeLaProse(brut, norm),
    negations,
    ratioEcho,
  };
}

// ─── Plafonds ────────────────────────────────────────────────────────────────

export type PlafondType = 'non_prose' | 'negation' | 'echo_question';

export interface PlafondApplique {
  type: PlafondType;
  /** Plafond en fraction de maxPts (0..1). */
  plafondPct: number;
}

/** Plafonds (fractions de maxPts) — audit §5.4 : des plafonds, jamais des points. */
export const PLAFONDS: Record<PlafondType, number> = {
  non_prose: 0.3,
  negation: 0.5,
  echo_question: 0.25,
};

/** Densité de négations à partir de laquelle la copie est suspecte. */
export const SEUIL_NEGATIONS = 3;
/** Écho lexical avec l'énoncé au-delà duquel la copie est un perroquet. */
export const SEUIL_ECHO = 0.6;

export function calculerPlafonds(signaux: SignauxCopie): PlafondApplique[] {
  const out: PlafondApplique[] = [];
  if (!signaux.estProse) out.push({ type: 'non_prose', plafondPct: PLAFONDS.non_prose });
  if (signaux.negations.length >= SEUIL_NEGATIONS)
    out.push({ type: 'negation', plafondPct: PLAFONDS.negation });
  if (signaux.ratioEcho != null && signaux.ratioEcho > SEUIL_ECHO)
    out.push({ type: 'echo_question', plafondPct: PLAFONDS.echo_question });
  return out;
}

/** Note finale = min(note calibrée, plus petit plafond applicable). */
export function appliquerPlafonds(
  points: number,
  maxPts: number,
  plafonds: PlafondApplique[]
): number {
  if (plafonds.length === 0) return points;
  const borne = Math.min(...plafonds.map((p) => p.plafondPct)) * maxPts;
  return Math.min(points, Math.round(borne * 100) / 100);
}
