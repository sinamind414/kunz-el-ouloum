// revisionPlan.ts — « خطة المراجعة النهائية » (audit item 14, sprint 15).
//
// Pourquoi ce module existe
// -------------------------
// Les sprints 1 à 14 ont produit des briques : 24 capsules, 17 schémas à
// reproduire, 23 situations, 11 cartes mentales, 12 leçons actives. Un élève à
// trois semaines du BAC n'a pas besoin d'une brique de plus : il a besoin de
// savoir **quoi faire aujourd'hui**. C'est le seul objet que l'app n'avait pas.
//
// Ce moteur n'invente aucun contenu : il ORDONNE l'existant sur le temps qui
// reste, selon quatre règles explicites et testées.
//
// RÈGLE 1 — le poids réel à l'examen prime.
//   Le score d'une unité part de son poids d'examen et non d'un ordre
//   alphabétique ou du numéro d'unité.
//
//   Sprint 18 : ce poids est désormais la MOYENNE de deux mesures qui ne
//   disent pas la même chose, et les faire dialoguer vaut mieux que d'en
//   choisir une :
//     · le poids ANNONCÉ par la répartition du programme
//       (`unitOpenings.bacWeightPercent`, issu de BILAN_DETAILLE_BAC_SVT.md) ;
//     · la pression CONSTATÉE sur les 8 sessions réellement dépouillées
//       (`observedUnitSharePercent()` de bacSessionIndex.ts).
//   L'écart est spectaculaire sur U6+U7 (39 % annoncés, ~13 % constatés) et
//   sur U1 (10 % annoncés, ~20 % constatés) : suivre aveuglément l'un ou
//   l'autre produit un plan faux dans les deux cas.
//
// RÈGLE 2 — la difficulté ressentie corrige le poids.
//   Le dépouillement des chaînes a classé les notions les plus demandées :
//   la phase photochimique (U6), le comportement des acides aminés (U2),
//   l'immunité (U4). Elles reçoivent un bonus : on révise ce qui coince, pas
//   ce qui rassure.
//
// RÈGLE 3 — alternance des gestes.
//   Une journée ne peut pas être faite d'un seul type de tâche : lire une
//   capsule, refaire un schéma et traiter une situation ne sollicitent pas la
//   même mémoire. Le moteur alterne.
//
// RÈGLE 4 — les deux derniers jours ne servent qu'à consolider.
//   Aucune situation longue ni notion nouvelle : capsules, schémas et cartes
//   uniquement. On ne découvre rien la veille.

import { MICRO_CAPSULES, type MicroCapsule } from './microCapsules';
import { SCHEMA_DRILLS, type SchemaDrill } from './schemaDrills';
import { SITUATION_INDEX, type SituationCard } from './situationIndex';
import { MIND_MAPS_DATABASE } from './mindMapData';
import { UNIT_OPENINGS } from './unitOpenings';
import { observedUnitSharePercent } from './bacSessionIndex';

export type TaskKind = 'capsule' | 'schema' | 'situation' | 'carte';

export interface PlanTask {
  kind: TaskKind;
  /** Identifiant de la ressource (capsule, schéma, situation) ou clé de carte. */
  refId: string;
  unitId: number;
  titleAr: string;
  /** Ce que l'élève fait concrètement. */
  actionAr: string;
  minutes: number;
}

export interface PlanDay {
  /** 1 = aujourd'hui. */
  day: number;
  /** Jours restants avant l'examen à la fin de cette journée. */
  daysLeft: number;
  tasks: PlanTask[];
  totalMinutes: number;
  /** Vrai pour les deux derniers jours : consolidation seule. */
  consolidationOnly: boolean;
}

export interface RevisionPlan {
  days: PlanDay[];
  /** Unités touchées au moins une fois. */
  coveredUnitIds: number[];
  totalMinutes: number;
  totalTasks: number;
}

export interface PlanOptions {
  /** Jours disponibles avant l'examen (1 à 60). */
  daysLeft: number;
  /** Budget quotidien en minutes (20 à 240). */
  minutesPerDay: number;
}

/**
 * Notions les plus demandées d'après le dépouillement des chaînes
 * (docs/analyse/BILAN_LECONS_DIFFICILES.md) : score de difficulté par unité.
 * Ce n'est pas une opinion : c'est le classement observé des recherches.
 */
export const DIFFICULTY_BONUS: Record<number, number> = {
  6: 9, // المرحلة الكيموضوئية — la plus demandée
  2: 8, // سلوك الأحماض الأمينية
  4: 7, // المناعة (خلطية، خلوية، ذات/لاذات)
  5: 5, // الاتصال العصبي
  3: 4, // التثبيط الإنزيمي
  7: 4, // تحويل الطاقة
  1: 2,
};

/** Poids ANNONCÉ par la répartition du programme ; 5 par défaut (U8-U11). */
export function declaredWeight(unitId: number): number {
  const opening = UNIT_OPENINGS.find((o) => o.unitId === unitId);
  return opening?.bacWeightPercent ?? 5;
}

/** Pression CONSTATÉE sur les sessions dépouillées, en % des points. */
export function observedWeight(unitId: number): number {
  return observedUnitSharePercent()[unitId] ?? 0;
}

/**
 * Poids d'examen retenu par le plan : moyenne du poids annoncé et de la
 * pression constatée (règle 1). Aucune unité n'est effacée par l'autre source.
 */
export function unitWeight(unitId: number): number {
  return (declaredWeight(unitId) + observedWeight(unitId)) / 2;
}

/** Priorité d'une unité = poids mesuré + bonus de difficulté observée. */
export function unitPriority(unitId: number): number {
  return unitWeight(unitId) + (DIFFICULTY_BONUS[unitId] ?? 0);
}

/** Unités du programme triées de la plus prioritaire à la moins prioritaire. */
export function prioritizedUnitIds(): number[] {
  return UNIT_OPENINGS.map((o) => o.unitId).sort((a, b) => {
    const d = unitPriority(b) - unitPriority(a);
    return d !== 0 ? d : a - b;
  });
}

/**
 * Séquence de passage des unités, PONDÉRÉE par la priorité : une unité qui pèse
 * deux fois plus revient deux fois plus souvent. Un simple tri ne suffisait pas
 * — il changeait l'ordre du premier jour sans changer le temps total alloué,
 * ce qui donnait un plan visuellement priorisé mais réellement uniforme.
 *
 * Les occurrences sont étalées (méthode du plus grand reste) pour qu'une unité
 * lourde revienne régulièrement au lieu d'être servie en bloc.
 */
export function weightedUnitSequence(): number[] {
  const unites = prioritizedUnitIds();
  const min = Math.min(...unites.map(unitPriority));
  const occurrences: { unitId: number; position: number; priority: number }[] = [];
  for (const unitId of unites) {
    const parts = Math.max(1, Math.round(unitPriority(unitId) / min));
    for (let k = 0; k < parts; k += 1) {
      occurrences.push({ unitId, position: (k + 0.5) / parts, priority: unitPriority(unitId) });
    }
  }
  occurrences.sort((a, b) => a.position - b.position || b.priority - a.priority || a.unitId - b.unitId);
  return occurrences.map((o) => o.unitId);
}

const capsuleTask = (c: MicroCapsule): PlanTask => ({
  kind: 'capsule',
  refId: c.id,
  unitId: c.unitId,
  titleAr: c.questionAr,
  actionAr: 'اقرأ الكبسولة ثم أجب عن اختبارها قبل كشف الجواب.',
  minutes: Math.max(2, Math.round(c.durationSec / 60) + 1),
});

const schemaTask = (d: SchemaDrill): PlanTask => ({
  kind: 'schema',
  refId: d.id,
  unitId: d.unitId,
  titleAr: d.titleAr,
  actionAr: 'ارسمه على ورقة بيضاء ثم قيّم نفسك بالشبكة قبل النظر إلى الرسم.',
  minutes: d.minutes,
});

const situationTask = (s: SituationCard): PlanTask => ({
  kind: 'situation',
  refId: s.id,
  unitId: s.unitIds[0],
  titleAr: s.titleAr,
  actionAr: 'عالج الوضعية كاملة بالورقة والقلم، ثم قارن بعناصر التصحيح.',
  minutes: s.minutes,
});

function carteTask(unitId: number): PlanTask | null {
  const entree = Object.entries(MIND_MAPS_DATABASE).find(([, m]) => m.unitId === unitId);
  if (!entree) return null;
  const [cle, carte] = entree;
  return {
    kind: 'carte',
    refId: cle,
    unitId,
    titleAr: `الخريطة الذهنية: ${carte.unitTitle}`,
    actionAr: 'استعرض الخريطة ثم أعد بناءها شفوياً من العقدة المركزية.',
    minutes: 8,
  };
}

/** Réserve de tâches d'une unité, par type, dans un ordre stable. */
function poolForUnit(unitId: number) {
  return {
    capsule: MICRO_CAPSULES.filter((c) => c.unitId === unitId).map(capsuleTask),
    schema: SCHEMA_DRILLS.filter((d) => d.unitId === unitId).map(schemaTask),
    situation: SITUATION_INDEX.filter((s) => s.unitIds[0] === unitId).map(situationTask),
    carte: [carteTask(unitId)].filter((t): t is PlanTask => t !== null),
  };
}

/** Ordre d'alternance des gestes dans une journée ordinaire. */
const ORDRE_NORMAL: TaskKind[] = ['capsule', 'schema', 'situation', 'carte'];
/** Les deux derniers jours : rien de long, rien de neuf. */
const ORDRE_CONSOLIDATION: TaskKind[] = ['capsule', 'schema', 'carte'];

/**
 * File globale des tâches : on déroule les unités dans l'ordre pondéré, et
 * pour chaque passage on prend la tâche suivante de chaque geste (rotation
 * interne, donc pas de répétition tant qu'il reste du matériel neuf).
 *
 * Passer par une file unique — plutôt que de re-remplir chaque journée à
 * partir de zéro — est ce qui garantit que le plan AVANCE : la première
 * version reconstruisait la même journée à l'identique du jour 2 au jour 30.
 */
function buildQueue(pools: Map<number, ReturnType<typeof poolForUnit>>, sequence: number[], besoin: number): PlanTask[] {
  const queue: PlanTask[] = [];
  const maxTours = 40;
  for (let tour = 0; tour < maxTours && queue.length < besoin; tour += 1) {
    for (const unitId of sequence) {
      const pool = pools.get(unitId);
      if (!pool) continue;
      for (const kind of ORDRE_NORMAL) {
        const liste = pool[kind];
        if (liste.length === 0) continue;
        queue.push(liste[tour % liste.length]);
      }
    }
  }
  return queue;
}

/**
 * Construit le plan. Déterministe : mêmes options ⇒ même plan, ce qui permet
 * à l'élève de retrouver sa journée d'hier et au test de la vérifier.
 */
export function buildRevisionPlan({ daysLeft, minutesPerDay }: PlanOptions): RevisionPlan {
  const jours = Math.min(60, Math.max(1, Math.round(daysLeft)));
  const budget = Math.min(240, Math.max(20, Math.round(minutesPerDay)));

  const sequence = weightedUnitSequence();
  const pools = new Map(prioritizedUnitIds().map((u) => [u, poolForUnit(u)]));
  const queue = buildQueue(pools, sequence, jours * Math.ceil(budget / 5) + 40);
  const consomme = new Array<boolean>(queue.length).fill(false);

  const days: PlanDay[] = [];
  let debut = 0;

  for (let d = 1; d <= jours; d += 1) {
    const restants = jours - d;
    const consolidation = jours >= 4 && restants <= 1;
    const gestesAutorises = consolidation ? ORDRE_CONSOLIDATION : ORDRE_NORMAL;

    const tasks: PlanTask[] = [];
    let minutes = 0;

    for (let i = debut; i < queue.length && minutes < budget; i += 1) {
      if (consomme[i]) continue;
      const t = queue[i];
      if (!gestesAutorises.includes(t.kind)) continue;
      if (tasks.some((x) => x.kind === t.kind && x.refId === t.refId)) continue;
      if (minutes + t.minutes > budget && tasks.length > 0) continue;
      tasks.push(t);
      consomme[i] = true;
      minutes += t.minutes;
    }

    // Filet de sécurité : jamais de journée vide, même si la file est épuisée.
    if (tasks.length === 0 && queue.length > 0) {
      const secours = queue.find((t) => gestesAutorises.includes(t.kind)) ?? queue[0];
      tasks.push(secours);
      minutes = secours.minutes;
    }

    while (debut < queue.length && consomme[debut]) debut += 1;

    days.push({
      day: d,
      daysLeft: restants,
      tasks,
      totalMinutes: minutes,
      consolidationOnly: consolidation,
    });
  }

  const couvertes = [...new Set(days.flatMap((j) => j.tasks.map((t) => t.unitId)))].sort(
    (a, b) => a - b,
  );

  return {
    days,
    coveredUnitIds: couvertes,
    totalMinutes: days.reduce((s, j) => s + j.totalMinutes, 0),
    totalTasks: days.reduce((s, j) => s + j.tasks.length, 0),
  };
}

/** Répartition du temps par unité, pour vérifier que le plan suit les priorités. */
export function minutesByUnit(plan: RevisionPlan): Record<number, number> {
  const out: Record<number, number> = {};
  for (const j of plan.days) {
    for (const t of j.tasks) out[t.unitId] = (out[t.unitId] ?? 0) + t.minutes;
  }
  return out;
}

/** Libellés arabes des gestes, utilisés par la vue. */
export const TASK_LABEL_AR: Record<TaskKind, string> = {
  capsule: 'فكرة في دقيقة',
  schema: 'ارسم من الذاكرة',
  situation: 'وضعية كاملة',
  carte: 'خريطة ذهنية',
};

/** Durées proposées par défaut dans l'interface. */
export const PRESETS = [
  { daysLeft: 30, minutesPerDay: 60, labelAr: 'شهر — ساعة يومياً' },
  { daysLeft: 14, minutesPerDay: 90, labelAr: 'أسبوعان — ساعة ونصف' },
  { daysLeft: 7, minutesPerDay: 120, labelAr: 'أسبوع — ساعتان' },
  { daysLeft: 3, minutesPerDay: 120, labelAr: 'ثلاثة أيام — ساعتان' },
] as const;
