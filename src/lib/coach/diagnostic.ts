// src/lib/coach/diagnostic.ts
// LE COACH — diagnostic par unité, avec verdict et prescription.
//
// DEMANDE (2026-10-12) : « je veux que mon tuteur Morchid soit un vrai coach
// SVT BAC, qui oriente et dise à l'élève VOUS ÊTES FAIBLE OU FORT dans ce
// cours, et ce qu'il doit faire : réviser, refaire le cours, refaire l'exercice. »
//
// PRINCIPE : aucun nouveau stockage. Le verdict est DÉRIVÉ des données déjà
// produites par l'élève (src/lib/parcours/parcoursProgress.ts) :
//   · score       : score 0..1 du جسر (QCM de fin d'unité) — la seule note
//                   réellement produite par l'élève dans l'app ;
//   · fragile     : drapeau posé à l'échec ou à une validation fragile ;
//   · leçons faites / total.
// Rien n'est inventé : si l'élève n'a rien fait, le coach le DIT.
//
// SEUILS : SEUIL_FRAGILE (0,6) est repris de parcoursProgress — même frontière
// partout dans l'app, pas un seuil privé du coach.

import type { ParcoursItem, ParcoursUnitGroup } from '../parcours/parcoursPath';
import type { ParcoursRecord, ParcoursState } from '../parcours/parcoursProgress';
import { SEUIL_FRAGILE } from '../parcours/parcoursProgress';

export type VerdictUnite = 'non_commence' | 'faible' | 'moyen' | 'fort';

export type TypeAction =
  | 'commencer' // rien de fait → ouvrir la première leçon
  | 'reviser_cours' // faible/moyen → relire puis retenter
  | 'maintenir'; // fort → révision espacée, ne pas en faire trop

export interface DiagnosticUnite {
  unitId: number;
  titre: string;
  verdict: VerdictUnite;
  /** Moyenne 0..1 des scores des items notés — null si aucun item noté. */
  score: number | null;
  leconsFaites: number;
  totalLecons: number;
  /** Items validés mais marqués fragiles (échec ou validation fragile). */
  fragiles: number;
  /** Items du chemin restant à faire. */
  restants: number;
  action: { type: TypeAction; libelleAr: string };
}

/** Libellé du verdict — ce que l'élève lit EN PREMIER. */
export const LIBELLE_VERDICT: Record<VerdictUnite, string> = {
  non_commence: 'لم تبدأ هذه الوحدة بعد',
  faible: 'مستوى ضعيف',
  moyen: 'مستوى متوسط',
  fort: 'مستوى قوي',
};

/**
 * Diagnostic d'UNE unité. `items` = les items du chemin de cette unité
 * (leçons + جسر). `state` = l'état persisté de l'élève.
 *
 * Le جسر est le seul item noté : c'est lui qui décide entre fort / moyen /
 * faible. Une unité dont toutes les leçons sont lues mais dont le جسر n'est pas
 * passé ne peut pas être déclarée « forte » — la lecture n'est pas la preuve.
 */
export function diagnostiquerUnite(
  unite: Pick<ParcoursUnitGroup, 'unitId' | 'title'>,
  items: ParcoursItem[],
  state: ParcoursState,
): DiagnosticUnite {
  const rec = (it: ParcoursItem): ParcoursRecord | undefined => state.done[it.id];

  const lecons = items.filter((i) => i.kind === 'lesson');
  const leconsFaites = lecons.filter((i) => rec(i)).length;

  const scores = items
    .map(rec)
    .filter((r): r is ParcoursRecord => Boolean(r) && typeof r!.score === 'number')
    .map((r) => r!.score as number);
  const score = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : null;

  const fragiles = items.filter((i) => rec(i)?.fragile).length;
  const restants = items.filter((i) => !rec(i)).length;
  const commence = Object.keys(state.done).some((id) =>
    items.some((i) => i.id === id),
  );

  const verdict: VerdictUnite = !commence
    ? 'non_commence'
    : score === null
      ? fragiles > 0
        ? 'faible'
        : leconsFaites < lecons.length
          ? 'moyen'
          : 'moyen'
      : fragiles > 0 && score < SEUIL_FRAGILE
        ? 'faible'
        : score >= 0.8 && fragiles === 0
          ? 'fort'
          : score >= SEUIL_FRAGILE
            ? 'moyen'
            : 'faible';

  const action: { type: TypeAction; libelleAr: string } =
    verdict === 'non_commence'
      ? { type: 'commencer', libelleAr: 'ابدأ بالدرس الأول من هذه الوحدة.' }
      : verdict === 'faible'
        ? { type: 'reviser_cours', libelleAr: 'أعد قراءة دروس الوحدة، ثم أعد اختبار الحصيلة.' }
        : verdict === 'moyen'
          ? { type: 'reviser_cours', libelleAr: 'أكمل ما تبقّى من الدروس، ثم أعِد اختبار الحصيلة.' }
          : { type: 'maintenir', libelleAr: 'حافظ على مستواك — راجع الوحدة بعد أسبوعين.' };

  return {
    unitId: unite.unitId,
    titre: unite.title,
    verdict,
    score,
    leconsFaites,
    totalLecons: lecons.length,
    fragiles,
    restants,
    action,
  };
}

/** Diagnostic de tout le parcours, groupé par unité. */
export function diagnostiquerParcours(
  groupes: ParcoursUnitGroup[],
  state: ParcoursState,
): DiagnosticUnite[] {
  return groupes.map((u) => diagnostiquerUnite(u, u.items, state));
}

/**
 * Ordre de travail du coach : ce qui rapporte le plus de points au BAC d'abord.
 * Une unité faible et lourde au bac passe avant une unité faible légère ; une
 * unité non commencée vient après ce qui est déjà entamé (on finit ce qu'on a
 * commencé), mais avant une unité forte.
 */
export function classerParUrgence(
  diags: DiagnosticUnite[],
  poidsBac: (unitId: number) => number = () => 1,
): DiagnosticUnite[] {
  const rang: Record<VerdictUnite, number> = {
    faible: 0,
    moyen: 1,
    non_commence: 2,
    fort: 3,
  };
  return [...diags].sort((a, b) => {
    const d = rang[a.verdict] - rang[b.verdict];
    if (d !== 0) return d;
    return poidsBac(b.unitId) - poidsBac(a.unitId);
  });
}

/** Ligne d'affichage du coach (arabe فصحى, sans mélange). */
export function ligneCoach(d: DiagnosticUnite): string {
  const score = d.score === null ? '—' : `${Math.round(d.score * 100)}%`;
  const tete = `${LIBELLE_VERDICT[d.verdict]} في «${d.titre}»`;
  const detail = `حصيلة الوحدة: ${score} · دروس مقروءة ${d.leconsFaites}/${d.totalLecons} · عناصر هشّة ${d.fragiles} · متبقٍّ ${d.restants}`;
  return `${tete}\n${detail}\n➡️ ${d.action.libelleAr}`;
}
