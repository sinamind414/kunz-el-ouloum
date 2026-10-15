// ============================================================
// mesurePilotage.ts — CE QU'ON PEUT SAVOIR SANS RIEN COLLECTER DE PLUS.
//
// Question posée le 14/10/2026 : « combien d'élèves s'inscrivent, quel est le
// taux d'abandon, combien utilisent le mode invité ? » — la réponse était alors
// « non vérifiable : aucune télémétrie ».
//
// C'est vrai pour UNE des trois questions, et faux pour les deux autres. Ce
// module calcule, à partir des données DÉJÀ stockées (table students, entries,
// activities), ce que le serveur sait aujourd'hui :
//   · combien se sont inscrits, et combien cette semaine ;
//   · combien ne sont JAMAIS revenus après l'inscription (aucune trace) ;
//   · combien d'anciens inscrits (> 7 jours) n'ont toujours rien produit ;
//   · combien de temps s'écoule, en médiane, entre l'inscription et la première
//     production ou activité — le seul « délai d'accrochage » mesurable.
//
// AUCUNE donnée nouvelle n'est collectée : ce sont les lignes existantes,
// agrégées. C'est exactement ce que la politique de confidentialité publiée
// autorise déjà (§2 : « إحصاءات مجمعة عن استخدام التطبيق »). Rien n'est envoyé
// par l'appareil, donc le mode invité reste invisible — c'est la seule des trois
// questions qui exige de changer la promesse faite aux élèves (voir
// docs/MESURE_ET_ANONYMAT.md).
//
// Aucune dépendance à Express ni à SQLite : fonction PURE, testable, et
// appelable à l'identique depuis SQLite, PostgreSQL ou un export figé.
// ============================================================

/** Ce dont ce module a besoin d'une ligne de tableau de bord (contrat minimal). */
export interface LignePilotage {
  /** Date de création du compte (ISO). */
  createdAt: string;
  /** Nombre de productions méthodologiques envoyées. */
  productions: number;
  /** Première production (ISO) — null si aucune. */
  premiereProduction?: string | null;
  /** Événements d'activité (quiz / missions / drills), horodatés. */
  activities: Array<{ createdAt: string }>;
  actif7j: boolean;
  actif30j: boolean;
}

export interface MesurePilotage {
  /** Élèves inscrits (comptes créés). */
  inscrits: number;
  /** Comptes créés depuis 7 jours ou moins. */
  inscriptions7j: number;
  /** Inscrits SANS aucune trace : ni production, ni événement d'activité. */
  jamaisActifs: number;
  /** Inscrits depuis plus de 7 jours et toujours sans aucune trace. */
  anciensSansTrace: number;
  /** Actifs sur 7 / 30 jours (recopiés des lignes, pour un affichage homogène). */
  actifs7j: number;
  actifs30j: number;
  /**
   * Médiane, en heures, entre l'inscription et la PREMIÈRE trace, sur les
   * élèves qui ont au moins une trace datée. `null` si l'échantillon est vide —
   * une médiane sans effectif n'existe pas, on ne renvoie pas 0.
   */
  retardPremiereTraceH: number | null;
  /** Nombre d'élèves sur lesquels la médiane est calculée (transparence). */
  echantillonRetard: number;
}

const JOUR_MS = 24 * 60 * 60 * 1000;

/** Horodatage exploitable, ou null (date absente/illisible : on n'invente pas). */
function heure(iso: string | null | undefined): number | null {
  if (!iso) return null;
  const t = Date.parse(iso);
  return Number.isFinite(t) ? t : null;
}

/** Première trace d'un élève : la plus ancienne entre première production et événements. */
function premiereTrace(ligne: LignePilotage): number | null {
  const dates = [
    heure(ligne.premiereProduction ?? null),
    ...ligne.activities.map((a) => heure(a.createdAt)),
  ].filter((t): t is number => t !== null);
  return dates.length ? Math.min(...dates) : null;
}

/** Médiane d'une liste de nombres (moyenne des deux valeurs centrales si pair). */
export function mediane(valeurs: number[]): number | null {
  if (valeurs.length === 0) return null;
  const tri = [...valeurs].sort((a, b) => a - b);
  const milieu = Math.floor(tri.length / 2);
  return tri.length % 2 ? tri[milieu] : (tri[milieu - 1] + tri[milieu]) / 2;
}

/**
 * Agrège les lignes du tableau de bord.
 *
 * `maintenant` est injectable : les tests fixent l'horloge au lieu de mocker
 * `Date` (même règle que `calculeActivite`).
 */
export function mesurerPilotage(
  lignes: LignePilotage[],
  maintenant: number = Date.now(),
): MesurePilotage {
  const septJours = maintenant - 7 * JOUR_MS;
  let inscriptions7j = 0;
  let jamaisActifs = 0;
  let anciensSansTrace = 0;
  let actifs7j = 0;
  let actifs30j = 0;
  const retards: number[] = [];

  for (const ligne of lignes) {
    if (ligne.actif7j) actifs7j += 1;
    if (ligne.actif30j) actifs30j += 1;

    const creation = heure(ligne.createdAt);
    if (creation !== null && creation >= septJours) inscriptions7j += 1;

    const trace = premiereTrace(ligne);
    // « Jamais actif » se juge sur les TRACES, pas sur le nombre de productions :
    // un élève qui n'a fait que des quiz est actif, même sans production écrite.
    const aUneTrace = trace !== null || ligne.productions > 0;
    if (!aUneTrace) {
      jamaisActifs += 1;
      if (creation !== null && creation < septJours) anciensSansTrace += 1;
      continue;
    }
    // Délai négatif impossible, mais une horloge d'appareil en retard peut en
    // produire un : on borne à 0 au lieu de fausser la médiane.
    if (creation !== null && trace !== null) {
      retards.push(Math.max(0, (trace - creation) / (60 * 60 * 1000)));
    }
  }

  const medianeBrute = mediane(retards);
  return {
    inscrits: lignes.length,
    inscriptions7j,
    jamaisActifs,
    anciensSansTrace,
    actifs7j,
    actifs30j,
    retardPremiereTraceH: medianeBrute === null ? null : Math.round(medianeBrute * 10) / 10,
    echantillonRetard: retards.length,
  };
}
