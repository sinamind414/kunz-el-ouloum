// spacedRecall.ts — le rappel espacé, construit sur ce que l'élève a RÉELLEMENT
// écrit (sprint 65).
//
// Pourquoi ce module
// ------------------
// Le plan de révision répond à « que dois-je faire aujourd'hui ? » en partant du
// programme et de la pression mesurée au BAC. Il ne sait rien de ce que l'élève
// a déjà produit. Résultat : une réponse rédigée le 3 mai n'est jamais revue, et
// l'effort le plus coûteux de l'application — écrire — est aussi le moins
// capitalisé.
//
// Ce que ce module fait
// ---------------------
// Il relit le journal d'apprentissage et propose de REFAIRE, sans regarder,
// les exercices déjà rédigés dont la date tombe sur un palier d'espacement.
//
// Sur les paliers, et sur ce qu'on ne prétend pas faire
// -----------------------------------------------------
// La « courbe de l'oubli » d'Ebbinghaus est souvent citée avec un chiffre
// précis (« 67 % en 24 h ») : ce chiffre vient d'une expérience menée par
// Ebbinghaus sur lui-même avec des SYLLABES SANS SIGNIFICATION. Du cours de SVT
// compris ne s'oublie pas à ce rythme, et aucun modèle sérieux ne permet de
// prédire l'oubli d'un élève donné sur une notion donnée.
//
// Ce qui est solide, en revanche, est l'effet d'espacement : la même quantité de
// travail répartie dans le temps retient mieux que massée. On s'en tient donc à
// des paliers simples et assumés — 1, 3, 7 et 16 jours — sans prétendre calculer
// une probabilité d'oubli. Aucun « algorithme adaptatif » ici : il serait une
// mise en scène, pas une mesure.
//
// Deux garde-fous :
//   · un exercice dont la forme était déjà maîtrisée (≥ 80 % des exigences)
//     saute le palier 1 — le reprendre dès le lendemain est du gaspillage ;
//   · on ne propose jamais plus de 3 rappels par jour : au-delà, la liste
//     devient une dette et l'élève cesse de l'ouvrir.

import { readLearningLog, aujourdHui, type LearningEntry } from './learningLog';
import { readDrillLog, SEUIL_SCHEMA_SU, type DrillEntry } from './drillLog';
import { IDEA_BY_ID } from './bacSessionIndex';
import { SCHEMA_DRILL_BY_ID } from './schemaDrills';
import { VERB_FAMILY_BY_ID } from './verbDemands';

/** Paliers d'espacement, en jours écoulés depuis la rédaction. */
export const PALIERS = [1, 3, 7, 16] as const;

/** Au-delà, un rappel de plus ne sera pas fait : il décourage. */
export const RAPPELS_MAX = 3;

/**
 * Les schémas sont plafonnés plus bas que les rédactions : refaire un schéma
 * coûte 10 à 15 minutes, et la carte d'accueil doit rester tenable en une
 * séance. Deux maximum.
 */
export const RAPPELS_SCHEMAS_MAX = 2;

/** Taux d'exigences satisfaites à partir duquel le palier 1 est sauté. */
export const SEUIL_MAITRISE = 0.8;

export type Palier = (typeof PALIERS)[number];

export interface Rappel {
  ideaId: string;
  /** Titre de l'exercice, vide si l'identifiant n'est plus dans la banque. */
  titleAr: string;
  familyId: string;
  /** Nom de la famille de consigne, vide si inconnue. */
  familleAr: string;
  /** Jours écoulés depuis la rédaction. */
  jours: number;
  palier: Palier;
  /** Taux d'exigences de forme satisfaites lors de la rédaction (0 → 1). */
  taux: number;
  /** Pourquoi ce rappel remonte aujourd'hui — affiché tel quel. */
  raisonAr: string;
}

function joursEntre(debut: string, fin: string): number {
  const a = Date.parse(`${debut}T00:00:00Z`);
  const b = Date.parse(`${fin}T00:00:00Z`);
  if (Number.isNaN(a) || Number.isNaN(b)) return -1;
  return Math.round((b - a) / 86_400_000);
}

function taux(e: LearningEntry): number {
  return e.total > 0 ? e.satisfaits / e.total : 0;
}

/**
 * Rappels à proposer aujourd'hui, du plus fragile au plus solide.
 *
 * Une rédaction remonte si le nombre de jours écoulés tombe exactement sur un
 * palier. Les rédactions du même exercice sont dédoublonnées : seule la plus
 * récente compte, sinon un exercice travaillé trois fois reviendrait trois fois.
 */
export function rappelsDuJour(
  date: string = aujourdHui(),
  journal: LearningEntry[] = readLearningLog(),
): Rappel[] {
  const derniere = new Map<string, LearningEntry>();
  for (const e of journal) {
    const connue = derniere.get(e.ideaId);
    if (!connue || e.date > connue.date) derniere.set(e.ideaId, e);
  }

  const rappels: Rappel[] = [];
  for (const e of derniere.values()) {
    const jours = joursEntre(e.date, date);
    if (!PALIERS.includes(jours as Palier)) continue;

    const t = taux(e);
    // Déjà bien structuré hier : inutile de le refaire aujourd'hui.
    if (jours === 1 && t >= SEUIL_MAITRISE) continue;

    const idee = IDEA_BY_ID[e.ideaId];
    const famille = VERB_FAMILY_BY_ID[e.familyId];
    rappels.push({
      ideaId: e.ideaId,
      titleAr: idee?.titleAr ?? '',
      familyId: e.familyId,
      familleAr: famille?.titleAr ?? '',
      jours,
      palier: jours as Palier,
      taux: t,
      raisonAr:
        t < SEUIL_MAITRISE
          ? `كتبته قبل ${jours} ${jours === 1 ? 'يوم' : 'أيام'} واستوفيت ${e.satisfaits} من ${e.total} من متطلبات الشكل — أعده دون النظر إلى ما كتبت.`
          : `مرّت ${jours} أيام: أعده من الذاكرة للتأكد من أن البنية ثبتت فعلاً.`,
    });
  }

  // Le plus fragile d'abord ; à taux égal, le plus ancien.
  rappels.sort((a, b) => a.taux - b.taux || b.jours - a.jours);
  return rappels.slice(0, RAPPELS_MAX);
}

/**
 * Phrase d'état affichée quand aucun rappel n'est dû — elle doit expliquer,
 * pas s'excuser.
 */
export function messageAucunRappel(journal: LearningEntry[] = readLearningLog()): string {
  if (journal.length === 0) {
    return 'لا توجد مراجعة مبرمجة اليوم: لم تكتب أي جواب بعد. المراجعة المتباعدة تبدأ من أول نص تكتبه.';
  }
  return 'لا شيء يستحق الإعادة اليوم. المراجعة المتباعدة تعود بعد يوم، ثلاثة، سبعة ثم ستة عشر يوماً من كل جواب.';
}

// ---------------------------------------------------------------------------
// Schémas (sprint 67)
// ---------------------------------------------------------------------------
//
// Depuis le sprint 66, « ارسم من الذاكرة » laisse une trace. Le même principe
// d'espacement s'y applique, avec une différence assumée : un schéma déjà SU
// (taux suffisant et aucun élément essentiel manquant) ne revient qu'au
// palier 7 et au-delà. Le redemander dès le lendemain ferait de la carte une
// corvée, et c'est exactement ce qui fait abandonner un outil de révision.

export interface RappelSchema {
  drillId: string;
  /** Titre du schéma, vide si l'identifiant n'est plus dans la banque. */
  titleAr: string;
  unitId: number;
  jours: number;
  palier: Palier;
  taux: number;
  /** Éléments essentiels absents lors du dernier passage. */
  oublis: number;
  raisonAr: string;
}

/** Schémas à refaire de mémoire aujourd'hui, le plus fragile d'abord. */
export function rappelsSchemas(
  date: string = aujourdHui(),
  journal: DrillEntry[] = readDrillLog(),
): RappelSchema[] {
  const derniere = new Map<string, DrillEntry>();
  for (const e of journal) {
    const connue = derniere.get(e.drillId);
    if (!connue || e.date > connue.date) derniere.set(e.drillId, e);
  }

  const rappels: RappelSchema[] = [];
  for (const e of derniere.values()) {
    const jours = joursEntre(e.date, date);
    if (!PALIERS.includes(jours as Palier)) continue;

    const taux = e.score / e.total;
    const su = taux >= SEUIL_SCHEMA_SU && e.oublisEssentiels === 0;
    // Un schéma su ne revient pas avant une semaine.
    if (su && jours < 7) continue;

    rappels.push({
      drillId: e.drillId,
      titleAr: SCHEMA_DRILL_BY_ID[e.drillId]?.titleAr ?? '',
      unitId: e.unitId,
      jours,
      palier: jours as Palier,
      taux,
      oublis: e.oublisEssentiels,
      raisonAr:
        e.oublisEssentiels > 0
          ? `غاب عن رسمك ${e.oublisEssentiels} عنصراً أساسياً قبل ${jours} ${jours === 1 ? 'يوم' : 'أيام'} — أعد الرسم على ورقة بيضاء.`
          : `مرّت ${jours} ${jours === 1 ? 'يوم' : 'أيام'}: أعد رسمه دون النظر للتأكد من ثباته.`,
    });
  }

  rappels.sort((a, b) => a.taux - b.taux || b.jours - a.jours);
  return rappels.slice(0, RAPPELS_SCHEMAS_MAX);
}
