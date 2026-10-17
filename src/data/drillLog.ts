// drillLog.ts — la trace des schémas refaits de mémoire (sprint 66).
//
// Le trou comblé ici
// ------------------
// « ارسم من الذاكرة » est le deuxième geste le plus coûteux de l'application
// après la rédaction : l'élève dessine sans modèle, puis s'auto-évalue sur une
// grille cotée. Jusqu'à ce sprint, ce score s'affichait une fois puis
// disparaissait. Conséquence : impossible de dire si un schéma raté en avril
// est su en mai, et le rappel espacé ignorait complètement ce geste.
//
// Ce qui est enregistré
// ---------------------
// Une ligne par (jour, schéma) : la date, le schéma, les points obtenus sur le
// total, et le nombre d'éléments ESSENTIELS oubliés. Rien d'autre — pas de
// contenu, rien de personnel, rien qui quitte l'appareil.
//
// Pourquoi un journal séparé de `learningLog`
// -------------------------------------------
// Les deux gestes ne prouvent pas la même chose : la rédaction mesure la
// production, le schéma mesure la restitution. Les mélanger dans une moyenne
// unique produirait un « score global » flatteur et sans signification. Deux
// journaux, deux verdicts.

export const DRILL_LOG_KEY = 'kunz.drillLog.v1';

/** Nombre maximal d'entrées conservées (les plus anciennes sont écartées). */
export const DRILL_LOG_MAX = 300;

/** Un schéma est considéré su à partir de ce taux ET sans oubli essentiel. */
export const SEUIL_SCHEMA_SU = 0.75;

export interface DrillEntry {
  /** Date ISO courte (YYYY-MM-DD). */
  date: string;
  drillId: string;
  unitId: number;
  /** Points obtenus à l'auto-évaluation. */
  score: number;
  /** Points possibles. */
  total: number;
  /** Éléments essentiels absents de la copie. */
  oublisEssentiels: number;
}

function estValide(e: unknown): e is DrillEntry {
  const x = e as Partial<DrillEntry>;
  return (
    typeof x?.date === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(x.date) &&
    typeof x.drillId === 'string' &&
    x.drillId.length > 0 &&
    typeof x.unitId === 'number' &&
    typeof x.score === 'number' &&
    typeof x.total === 'number' &&
    x.total > 0 &&
    x.score >= 0 &&
    x.score <= x.total &&
    typeof x.oublisEssentiels === 'number' &&
    x.oublisEssentiels >= 0
  );
}

/** Journal complet, du plus ancien au plus récent. */
export function readDrillLog(): DrillEntry[] {
  try {
    const brut = localStorage.getItem(DRILL_LOG_KEY);
    if (!brut) return [];
    const parsed = JSON.parse(brut);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(estValide);
  } catch {
    return [];
  }
}

/**
 * Enregistre une auto-évaluation.
 *
 * Une seule entrée par (jour, schéma) : refaire trois fois le même schéma dans
 * la même journée ne doit pas gonfler la trace. C'est la DERNIÈRE tentative du
 * jour qui est conservée — celle qui reflète l'état en fin de séance.
 */
export function recordDrill(entree: DrillEntry): void {
  if (!estValide(entree)) return;
  const journal = readDrillLog().filter(
    (e) => !(e.date === entree.date && e.drillId === entree.drillId),
  );
  journal.push(entree);
  const garde = journal.slice(-DRILL_LOG_MAX);
  try {
    localStorage.setItem(DRILL_LOG_KEY, JSON.stringify(garde));
  } catch {
    /* quota plein : la trace est un confort, jamais un blocage */
  }
}

export function clearDrillLog(): void {
  try {
    localStorage.removeItem(DRILL_LOG_KEY);
  } catch {
    /* ignoré */
  }
}

export interface EtatSchema {
  drillId: string;
  unitId: number;
  /** Nombre de passages enregistrés. */
  passages: number;
  /** Taux du dernier passage (0 → 1). */
  dernierTaux: number;
  /** Date du dernier passage. */
  derniereDate: string;
  /** Oublis essentiels au dernier passage. */
  derniersOublis: number;
  /** Su = taux suffisant ET aucun élément essentiel manquant. */
  su: boolean;
}

/** État par schéma, le plus fragile d'abord. */
export function etatDesSchemas(journal: DrillEntry[] = readDrillLog()): EtatSchema[] {
  const parSchema = new Map<string, DrillEntry[]>();
  for (const e of journal) {
    const liste = parSchema.get(e.drillId) ?? [];
    liste.push(e);
    parSchema.set(e.drillId, liste);
  }

  const etats: EtatSchema[] = [];
  for (const [drillId, liste] of parSchema) {
    liste.sort((a, b) => a.date.localeCompare(b.date));
    const dernier = liste[liste.length - 1];
    const taux = dernier.score / dernier.total;
    etats.push({
      drillId,
      unitId: dernier.unitId,
      passages: liste.length,
      dernierTaux: taux,
      derniereDate: dernier.date,
      derniersOublis: dernier.oublisEssentiels,
      su: taux >= SEUIL_SCHEMA_SU && dernier.oublisEssentiels === 0,
    });
  }

  etats.sort((a, b) => a.dernierTaux - b.dernierTaux || a.drillId.localeCompare(b.drillId));
  return etats;
}

export interface BilanSchemas {
  /** Schémas distincts tentés au moins une fois. */
  tentes: number;
  /** Schémas sus au dernier passage. */
  sus: number;
  /** Schémas qui restent à reprendre. */
  fragiles: EtatSchema[];
  /** Phrase d'état, honnête quand la trace est trop maigre. */
  messageAr: string;
}

/**
 * Bilan de restitution. Comme pour la rédaction, on refuse de conclure sur
 * trop peu de données : en dessous de 3 schémas tentés, la seule chose
 * honnête à dire est « continue ».
 */
export function bilanSchemas(journal: DrillEntry[] = readDrillLog()): BilanSchemas {
  const etats = etatDesSchemas(journal);
  const sus = etats.filter((e) => e.su).length;
  const fragiles = etats.filter((e) => !e.su);

  let messageAr: string;
  if (etats.length === 0) {
    messageAr = 'لم ترسم أي مخطط من الذاكرة بعد. الرسم من الذاكرة هو ما يكشف ما تظن أنك تعرفه.';
  } else if (etats.length < 3) {
    messageAr = `رسمت ${etats.length} من المخططات. أنجز ثلاثة على الأقل قبل الحكم على استرجاعك.`;
  } else {
    messageAr = `أتقنت ${sus} من ${etats.length} مخططاً في آخر محاولة${
      fragiles.length > 0 ? ` — ${fragiles.length} ما تزال تحتاج إعادة.` : '.'
    }`;
  }

  return { tentes: etats.length, sus, fragiles, messageAr };
}
