// src/data/positionnementInitial.ts — TEST DE POSITIONNEMENT (étage 3 / R1).
//
// Recommandation de l'audit : « 15 QCM (3 par domaine + 3 verbes), 5 min, non
// noté, qui oriente vers 3 parcours et demande l'objectif de note ».
//
// RÈGLE D'OR : 0 question inventée. Les 12 QCM sont PRIS TELS QUELS dans
// `SVT_QUIZ_QUESTIONS` ; les 3 items de consigne réutilisent les 10 contrats
// `يُطلب/يُمنع` du moteur via `CONTRATS_VERBES`. Seules les consignes d'écran
// (libellés d'interface) sont nouvelles — aucun contenu scientifique.
//
// [CONSTAT] La difficulté du corpus SUIT le domaine (D1 = أساسي, D2 = متوسط,
// D3 = متقدم) : le test est donc une gradation naturelle, pas un mélange
// artificiel. [INTERPRÉTATION] Les seuils de profil ci-dessous sont une
// proposition pédagogique, PAS une norme officielle : « Non vérifiable ».

import { SVT_QUIZ_QUESTIONS } from '../quizCorpus';
import { PROGRESSION_OFFICIELLE } from './curriculumOfficial';
import { CONTRATS_VERBES } from './glossaireCapitaine';

export type ProfilEleve = 'bases' | 'consolidation' | 'approfondissement';
export type ObjectifNote = 10 | 14 | 18;

export const OBJECTIFS_NOTE: readonly ObjectifNote[] = [10, 14, 18];

/** [INTERPRÉTATION] seuils proposés sur 15 réponses, non officiels. */
export const SEUILS_PROFIL = { consolidation: 6, approfondissement: 12 } as const;

export interface QuestionPositionnement {
  id: string;
  domaine: 1 | 2 | 3;
  type: 'qcm' | 'verbe';
  enonceAr: string;
  optionsAr: readonly string[];
  correctIndex: number;
  /** Ce qui rend la question traçable (QCM du corpus / contrat du moteur). */
  sourceAr: string;
}

function domaineDe(unitId: number): 1 | 2 | 3 {
  return PROGRESSION_OFFICIELLE.find((u) => u.uniteId === unitId)?.domaine ?? 1;
}

/** 4 QCM par domaine, les plus anciens du corpus (sélection déterministe). */
const QCM_PAR_DOMAINE = 4;
function qcmDuDomaine(domaine: 1 | 2 | 3): QuestionPositionnement[] {
  return SVT_QUIZ_QUESTIONS.filter(
    (q) => domaineDe(q.unitId) === domaine && q.options.length >= 2,
  )
    .slice(0, QCM_PAR_DOMAINE)
    .map((q) => ({
      id: `pos_qcm_${q.id}`,
      domaine,
      type: 'qcm' as const,
      enonceAr: q.questionText,
      optionsAr: [...q.options],
      correctIndex: q.correctAnswerIndex,
      sourceAr: `سؤال ${q.id} من بنك الأسئلة (الوحدة ${q.unitId})`,
    }));
}

/** 3 verbes : les options sont les lignes `يُطلب` des contrats du moteur. */
const VERBES_TESTES = ['استنتج', 'حلل', 'قارن'] as const;
function questionsVerbes(): QuestionPositionnement[] {
  const ligneDemandee = (verbe: string) =>
    CONTRATS_VERBES.find((c) => c.verb === verbe)!.contractAr.split('\n')[0];
  const leurres = CONTRATS_VERBES.filter((c) => !VERBES_TESTES.some((v) => v === c.verb))
    .slice(0, 2)
    .map((c) => c.contractAr.split('\n')[0]);

  return VERBES_TESTES.map((verbe, i) => {
    const bonne = ligneDemandee(verbe);
    const options = [bonne, ...leurres];
    // Rotation déterministe : la bonne réponse n'est pas toujours en 1re place.
    const decalage = i % options.length;
    const tournees = [...options.slice(decalage), ...options.slice(0, decalage)];
    return {
      id: `pos_verbe_${verbe}`,
      domaine: (i + 1) as 1 | 2 | 3,
      type: 'verbe' as const,
      enonceAr: `في تعليمة « ${verbe} »، أي عقد هو المطلوب؟`,
      optionsAr: tournees,
      correctIndex: tournees.indexOf(bonne),
      sourceAr: `عقد الفعل من المرشد (${verbe})`,
    };
  });
}

export const QUESTIONS_POSITIONNEMENT: readonly QuestionPositionnement[] = [
  ...qcmDuDomaine(1),
  ...qcmDuDomaine(2),
  ...qcmDuDomaine(3),
  ...questionsVerbes(),
];

export interface ResultatPositionnement {
  score: number;
  total: number;
  profil: ProfilEleve;
  objectif: ObjectifNote;
  rubrique: 'cours' | 'entrainement' | 'revision';
  outilAr: string;
  raisonAr: string;
}

export const LIBELLES_PROFIL: Record<ProfilEleve, string> = {
  bases: 'إعادة بناء الأسس',
  consolidation: 'تثبيت وبناء التدريب',
  approfondissement: 'تعميم ومواضيع معقدة',
};

/**
 * `reponses[i]` = index choisi, ou `null` si l'élève a passé.
 * Le parcours pointe vers une RUBRIQUE EXISTANTE (4 rubriques) : aucun nombre
 * de leçons/jour ni aucune durée n'est inventé ici.
 */
export function evaluerPositionnement(
  reponses: ReadonlyArray<number | null>,
  objectif: ObjectifNote = 14,
): ResultatPositionnement {
  const score = QUESTIONS_POSITIONNEMENT.reduce(
    (s, q, i) => s + (reponses[i] === q.correctIndex ? 1 : 0),
    0,
  );
  const profil: ProfilEleve =
    score >= SEUILS_PROFIL.approfondissement
      ? 'approfondissement'
      : score >= SEUILS_PROFIL.consolidation
        ? 'consolidation'
        : 'bases';

  const parcours: Record<ProfilEleve, Pick<ResultatPositionnement, 'rubrique' | 'outilAr' | 'raisonAr'>> = {
    bases: {
      rubrique: 'cours',
      outilAr: 'الدروس والاختبارات القصيرة',
      raisonAr: 'ابدأ بالأسس من الدروس قبل التدريب المكثف.',
    },
    consolidation: {
      rubrique: 'entrainement',
      outilAr: 'بنك الأسئلة والتصحيح',
      raisonAr: 'أسسك موجودة : ثبّتها بالتدريب وتصحيح الأخطاء.',
    },
    approfondissement: {
      rubrique: 'revision',
      outilAr: 'أفكار البكالوريا والمراجعة',
      raisonAr: 'انتقل إلى مواضيع البكالوريا والتركيب.',
    },
  };

  return {
    score,
    total: QUESTIONS_POSITIONNEMENT.length,
    profil,
    objectif,
    ...parcours[profil],
  };
}
