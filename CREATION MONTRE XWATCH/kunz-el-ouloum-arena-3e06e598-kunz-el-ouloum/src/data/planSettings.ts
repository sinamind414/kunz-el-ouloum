// planSettings.ts — le réglage du plan de révision, partagé entre écrans
// (sprint 29).
//
// Le plan vit derrière deux clics (التمارين والتدريب → خطة المراجعة). Pour que
// l'accueil puisse afficher « voici ta journée », il lui faut le réglage choisi
// par l'élève — sinon la carte d'accueil montrerait le plan de quelqu'un
// d'autre. Ce module est la seule source de ce réglage.

export const PLAN_SETTINGS_KEY = 'kunz.revisionPlan.settings';

export interface PlanSettings {
  daysLeft: number;
  minutesPerDay: number;
}

/** Réglage par défaut : trois semaines à 1 h 30, le cas le plus courant. */
export const DEFAULT_PLAN_SETTINGS: PlanSettings = { daysLeft: 14, minutesPerDay: 90 };

function borne(valeur: unknown, min: number, max: number, defaut: number): number {
  const n = typeof valeur === 'number' ? valeur : Number(valeur);
  if (!Number.isFinite(n)) return defaut;
  return Math.min(max, Math.max(min, Math.round(n)));
}

/** Lit le réglage, en se rabattant sur le défaut à la moindre anomalie. */
export function readPlanSettings(): PlanSettings {
  try {
    const brut = localStorage.getItem(PLAN_SETTINGS_KEY);
    if (!brut) return DEFAULT_PLAN_SETTINGS;
    const parsed = JSON.parse(brut) as Partial<PlanSettings>;
    return {
      daysLeft: borne(parsed.daysLeft, 1, 60, DEFAULT_PLAN_SETTINGS.daysLeft),
      minutesPerDay: borne(parsed.minutesPerDay, 20, 240, DEFAULT_PLAN_SETTINGS.minutesPerDay),
    };
  } catch {
    return DEFAULT_PLAN_SETTINGS;
  }
}

/** Enregistre le réglage courant (appelé par la vue du plan). */
export function writePlanSettings(settings: PlanSettings): void {
  try {
    localStorage.setItem(
      PLAN_SETTINGS_KEY,
      JSON.stringify({
        daysLeft: borne(settings.daysLeft, 1, 60, DEFAULT_PLAN_SETTINGS.daysLeft),
        minutesPerDay: borne(
          settings.minutesPerDay,
          20,
          240,
          DEFAULT_PLAN_SETTINGS.minutesPerDay,
        ),
      }),
    );
  } catch {
    /* stockage indisponible : le plan reste utilisable, sans mémoire */
  }
}
