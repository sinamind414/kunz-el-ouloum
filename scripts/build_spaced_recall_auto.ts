/**
 * build_spaced_recall_auto.ts — GÉNÈRE `src/data/spacedRecallPromptsAuto.ts` :
 * les prompts de rappel espacé AUTO (63 concepts clavés par lessonId de
 * LESSON_GOLD_SUMMARIES), tranche P1-2 (extension 15 → 63 concepts, branchement
 * (c) « agenda d'ouverture » validé par le propriétaire le 28/10/2026).
 *
 * RÈGLES (héritées de build_hosila.ts et du skill v0.2.1) :
 *   · AUCUN contenu inventé : questionAr/recallQuestionAr/mechanismAr/
 *     evidenceAr/commonErrorAr/bacSentenceFrameAr/vocabulary sont repris
 *     VERBATIM de lessonGoldSummaries.ts ; seules des charpentes FRAMES fixes
 *     en arabe فصحى encadrent le contenu (correction d'erreur, fssر du
 *     mécanisme, complétion du gabarit BAC).
 *   · Exclusion DYNAMIQUE des concepts déjà couverts par le corpus manuel
 *     (SPACED_RECALL_PROMPTS) — zéro collision.
 *   · Exécution déterministe, sans horodatage : le diff du fichier généré ne
 *     contient que le diff des données.
 *   · Le fichier généré ne s'édite JAMAIS à la main.
 *
 * Usage : npx tsx scripts/build_spaced_recall_auto.ts
 */
import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { LESSON_GOLD_SUMMARIES } from '../src/data/lessonGoldSummaries';
import { SPACED_RECALL_PROMPTS } from '../src/data/spacedRecallPrompts';

const racine = join(dirname(fileURLToPath(import.meta.url)), '..');
const CHEMIN_SORTIE = join(racine, 'src', 'data', 'spacedRecallPromptsAuto.ts');

/** Nombre minimal de vocabulaire attendu sur les leçons gold (vérifié 63/63). */
const MIN_VOCAB = 3;

interface PromptGen {
  stage: number;
  conceptId: string;
  questionAr: string;
  reflexId: 'explain' | 'interpret' | 'validate';
  acceptedEvidence: string[];
  minEvidence: number;
}

/**
 * Charpentes fixes (فصحى uniquement). Le CONTENU entre guillemets est repris
 * verbatim des leçons gold ; la charpente, elle, est la même pour les 63 —
 * elle n'ajoute aucune affirmation scientifique.
 */
const CADRE_ERREUR = (texte: string) =>
  `يقع بعض الطلاب في الخطأ التالي: «${texte}» — صحّح هذا الخطأ مع التعليل.`;
const CADRE_MECANISME = (texte: string) =>
  `فسّر العلمية للعبارة التالية الواردة في الدرس: «${texte}»`;
const CADRE_BAC = (texte: string) =>
  `أكمل قالب الجواب من نمط البكالوريا بكلمات من الدرس: ${texte}`;

/** Genèse des 4 prompts d'un concept, selon la convention du corpus manuel :
 *  stage 0 = question de cours (explain), stage 1 = correction d'erreur
 *  (explain), stage 2 = interprétation du mécanisme (interpret), stage 3 =
 *  production type BAC (validate). */
function promptsPourConcept(conceptId: string): PromptGen[] {
  const s = LESSON_GOLD_SUMMARIES[conceptId]!;
  const preuves = s.vocabulary.slice(0, 6);
  const seuil = (base: number) => Math.max(1, Math.min(base, preuves.length));

  const mechanisme = Array.isArray(s.mechanismAr) ? s.mechanismAr[0] : s.mechanismAr;
  if (!s.recallQuestionAr || !s.commonErrorAr || !mechanisme || !s.bacSentenceFrameAr) {
    throw new Error(`Leçon '${conceptId}' : champ gold absent (rappel/erreur/mécanisme/BAC).`);
  }
  if (s.vocabulary.length < MIN_VOCAB) {
    throw new Error(`Leçon '${conceptId}' : vocabulary < ${MIN_VOCAB}.`);
  }

  return [
    {
      stage: 0,
      conceptId,
      questionAr: s.recallQuestionAr,
      reflexId: 'explain',
      acceptedEvidence: preuves,
      minEvidence: seuil(2),
    },
    {
      stage: 1,
      conceptId,
      questionAr: CADRE_ERREUR(s.commonErrorAr),
      reflexId: 'explain',
      acceptedEvidence: preuves,
      minEvidence: seuil(2),
    },
    {
      stage: 2,
      conceptId,
      questionAr: CADRE_MECANISME(mechanisme),
      reflexId: 'interpret',
      acceptedEvidence: preuves,
      minEvidence: seuil(3),
    },
    {
      stage: 3,
      conceptId,
      questionAr: CADRE_BAC(s.bacSentenceFrameAr),
      reflexId: 'validate',
      acceptedEvidence: preuves,
      minEvidence: seuil(3),
    },
  ];
}

/* ── Exécution déterministe ──────────────────────────────────────────────── */

const idsGold = Object.keys(LESSON_GOLD_SUMMARIES);
const idsManuels = new Set(Object.keys(SPACED_RECALL_PROMPTS));
const idsAuto = idsGold.filter((id) => !idsManuels.has(id));
const collisions = idsGold.filter((id) => idsManuels.has(id));

console.log(`Leçons gold : ${idsGold.length}`);
console.log(`Déjà couvertes par le corpus manuel (exclues) : ${collisions.length}`);
console.log(`Concepts auto à générer : ${idsAuto.length}`);

const record: Record<string, PromptGen[]> = {};
for (const id of idsAuto) {
  const prompts = promptsPourConcept(id);
  for (const p of prompts) record[id] = record[id] ?? [], (record[id] as PromptGen[]).push(p);
}

const serialiserPrompt = (p: PromptGen, indent: string) => {
  const preuves = JSON.stringify(p.acceptedEvidence);
  return `${indent}{ stage: ${p.stage}, conceptId: ${JSON.stringify(p.conceptId)}, questionAr: ${JSON.stringify(p.questionAr)}, reflexId: ${JSON.stringify(p.reflexId)}, acceptedEvidence: ${preuves}, minEvidence: ${p.minEvidence} },`;
};

const entrees = Object.keys(record)
  .map((id) => {
    const prompts = record[id]!
      .map((p) => serialiserPrompt(p, '    '))
      .join('\n');
    return `  ${JSON.stringify(id)}: [\n${prompts}\n  ],`;
  })
  .join('\n');

const fichier = `// src/data/spacedRecallPromptsAuto.ts
// GÉNÉRÉ PAR scripts/build_spaced_recall_auto.ts — NE PAS ÉDITER À LA MAIN.
// Régénérer : npx tsx scripts/build_spaced_recall_auto.ts
//
// Tranche P1-2 (branchement (c) « agenda d'ouverture », validé 28/10/2026) :
// 63 concepts clavés par lessonId de LESSON_GOLD_SUMMARIES (les 11 déjà
// couverts par le corpus manuel sont exclus dynamiquement par le générateur).
// Aucun contenu inventé : le contenu verbatim des leçons gold est encadré par
// des charpentes fixes en arabe فصحى. L'alimentation SM-2 se fait à
// l'OUVERTURE du résumé (planifierRappelPourLecon, planificationRappels.ts) —
// idempotence garantie par planifierRappel : un espacement en cours n'est
// jamais écrasé. Ce record est FUSIONNÉ par src/lib/rappelConcepts.ts avec le
// corpus manuel (16 concepts) — il ne remplace pas SPACED_RECALL_PROMPTS.

import type { SpacedRecallPrompt } from './spacedRecallPrompts';

export const SPACED_RECALL_PROMPTS_AUTO: Record<string, SpacedRecallPrompt[]> = {
${entrees}
};
`;

writeFileSync(CHEMIN_SORTIE, fichier, 'utf8');
console.log(`Écrit : src/data/spacedRecallPromptsAuto.ts (${idsAuto.length} concepts × 4 prompts).`);
