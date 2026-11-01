// activite.ts — calculs d'« activité réelle » des élèves (actifs 7j / 30j).
// Module NEUTRE (aucune dépendance) partagé par SqliteStore.dashboardRows(),
// PostgresStore.assembleDashboard(), iterateExportRows() et la route dashboard.
// Honnêteté de mesure : seuls les INSCRITS sont comptables — un invité n'envoie
// RIEN au serveur (mode hors-ligne par conception, voir src/utils/activityLog.ts),
// donc l'usage invité est invisible côté serveur. Ne jamais présenter
// « inscrits » comme « utilisateurs ».

export const FENETRE_7J_MS = 7 * 24 * 60 * 60 * 1000;
export const FENETRE_30J_MS = 30 * 24 * 60 * 60 * 1000;

export interface ActiviteCalculee {
  /** Dernière activité connue = max(dernière production, dernier événement). */
  lastActivity: string | null;
  /** Actif sur les 7 derniers jours glissants. */
  actif7j: boolean;
  /** Actif sur les 30 derniers jours glissants. */
  actif30j: boolean;
}

function dansFenetre(iso: string | null, fenetreMs: number, maintenant: number): boolean {
  if (!iso) return false;
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return false;
  return t >= maintenant - fenetreMs && t <= maintenant + fenetreMs; // tolérance horloge client
}

/**
 * Calcule lastActivity (max des dates fournies) + drapeaux 7j/30j.
 * Une date non parseable ne fait PAS planter : drapeau à false (donnée douteuse
 * ≠ panne du dashboard).
 */
export function calculeActivite(
  dernieresDates: (string | null | undefined)[],
  maintenant: number = Date.now(),
): ActiviteCalculee {
  let last: string | null = null;
  let lastT = -Infinity;
  for (const d of dernieresDates) {
    if (!d) continue;
    const t = Date.parse(d);
    if (Number.isFinite(t) && t > lastT) {
      lastT = t;
      last = d;
    }
  }
  return {
    lastActivity: last,
    actif7j: dansFenetre(last, FENETRE_7J_MS, maintenant),
    actif30j: dansFenetre(last, FENETRE_30J_MS, maintenant),
  };
}

export interface ResumeActivite {
  /** Élèves inscrits (comptage des comptes — PAS l'usage invité, invisible). */
  inscrits: number;
  actifs7j: number;
  actifs30j: number;
}

/** Agrège les drapeaux déjà calculés — aucune requête SQL supplémentaire. */
export function resumeActivite(
  rows: { actif7j: boolean; actif30j: boolean }[],
  maintenant: number = Date.now(),
): ResumeActivite {
  void maintenant;
  return {
    inscrits: rows.length,
    actifs7j: rows.filter((r) => r.actif7j).length,
    actifs30j: rows.filter((r) => r.actif30j).length,
  };
}
