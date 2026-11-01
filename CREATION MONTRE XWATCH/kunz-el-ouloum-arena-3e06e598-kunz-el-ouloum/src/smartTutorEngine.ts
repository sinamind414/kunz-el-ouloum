import {
  resetSession,
  saveSession,
  getDefaultSession,
  startDomainSession,
  startQuiz,
  recordQuizAnswer,
  startBossFightSession,
  startBossStep,
  recordBossProgress,
  finishBossFight,
  completeDailyMission,
  type BotSession,
} from './utils/sessionManager';
import { graineSession } from './utils/melangeOptions';
import {
  DOMAINS,
  KNOWLEDGE_CARDS,
  getQuestionsForDomain,
  getQuestionById,
  getMistakeById,
  getCardById,
  getBossScenariosForDomain,
  getBossScenarioById,
  type KnowledgeCard,
  type QuizQuestion,
} from './data/smartBotData';
import type { TutorKnowledgeChunk } from './tutorKnowledge';
import { tutorKnowledgeSiChargee } from './data/tutorKnowledgeRuntime';
import { BOOK_TUTOR_QA, findBestBookQA, type BookTutorQA } from './bookTutorQA';
import { findBestMethodologyQA } from './methodologyKnowledge';
import { lessonIndexSiChargee } from './data/lessonIndexRuntime';
// Fusion master 3e970d2 (2026-10-01) : R6 pondère les erreurs par le poids
// BAC des unités (unitOpenings) ; R8 affiche le compte à rebours BAC.
import { UNIT_OPENINGS } from './data/unitOpenings';
import { BAC_EXAM_DATE, bacDaysLeft } from './utils/dashboardActions';
import { jourLocal } from './utils/dayKey';
// Négation/réfutation : primitives partagées avec le scorer C2 de Tadwin.
import { tokenAffirme } from './lib/validation/negationAr';
import { PARCOURS_DOMAINS } from './lib/parcours/parcoursPath';
import { construireVocabulaire, domaineProbable, domaineDeUnite } from './lib/routageDomaine';
import { gesteDuMessage, gesteFatigueDuMessage, type GesteDialogue } from './lib/gesteDialogue';
import { noterRappel, noterReponseLibre, phraseEcheance, etatRappel } from './lib/rappelAdaptatif';
import { prochainRappelDu, promptPour } from './lib/rappelConcepts';
import { JOUR_MS, qualiteDepuisAutoEvaluation, qualiteDepuisPreuves } from './lib/sm2';
import { loadParcours } from './lib/parcours/parcoursProgress';
import { scoreLivreUnite } from './lib/parcours/parcoursMeta';
import {
  diagnostiquerParcours,
  classerParUrgence,
  ligneCoach,
  type DiagnosticUnite,
} from './lib/coach/diagnostic';
import {
  KNOWLEDGE_CARDS as LEGACY_KNOWLEDGE_CARDS,
  type KnowledgeCard as LegacyKnowledgeCard,
} from './knowledgeCards';
import { STUDY_GUIDE_CARDS, type StudyGuideCard } from './studyGuide';
import { handleSummaryFlow } from './tutorGoldSummaryFlow';
import { SYNONYM_GROUPS } from './lib/validation/synonyms';
import { detecterStuffing } from './lib/validation/stuffingDetector';
import {
  normalizeArabic,
  tokenizeArabic,
  fuzzyTokenEquals,
  tokenOverlapRatio,
  includesAsWord,
} from './utils/arabicNormalize';

export { normalizeArabic, calculateKeywordScore, tokenizeArabic } from './utils/arabicNormalize';

export type SourceType = 'internal_card' | 'legacy_card' | 'book' | 'opus' | 'methodology' | 'guide' | 'domain' | 'quiz' | 'lesson' | 'out_of_scope';

export interface SourceRef {
  type: SourceType;
  title: string;
}

/**
 * Charge envoyée à l'UI : volontairement SANS correctIndex/explanation
 * (B5, audit Morchid 2026-09-22) — le module n'est pas trichable via le
 * payload ; la correction arrive dans le texte noté par le moteur.
 */
export interface QuizPrompt {
  id: string;
  question: string;
  options: string[];
}

/** Détails de fin d'activité (journalisation serveur + affichage). */
export interface TutorRewardDetails {
  /** Nature de l'activité terminée. */
  kind?: 'quiz' | 'mission';
  score?: number;
  total?: number;
  /** Titre du domaine — utilisé par la file /api/student/sync. */
  domain?: string;
}

export interface TutorAction {
  text: string;
  confidence?: number;
  quickActions?: string[];
  quiz?: QuizPrompt;
  sources?: SourceRef[];
  reward?: { xpGained: number } & TutorRewardDetails;
}

export interface EngineResult {
  session: BotSession;
  action: TutorAction;
}

const OUT_OF_PROGRAM = [
  'كرة القدم', 'كره القدم', 'كرة قدم', 'مباراة', 'فيلم سينما', 'موسيقى', 'سيارة', 'سياره', 'اغنية',
  'اخبار اليوم', 'أخبار اليوم', 'اخبار', 'أخبار', 'سينما', 'فيلم',
  // Audit v4b (15/10/2026, détournement mesuré) : un mot du corpus ne fait pas
  // un sujet du programme. « من فاز بكأس افريقيا؟ » couchait la leçon Atlantique
  // à 55 % (token « إفريقيا »), « كأس العالم » la leçon tectonique, et
  // « راسي كبير » la lithosphère (« راسي » ≈ « رأسي »).
  'كأس افريقيا', 'كأس العالم', 'راسي كبير',
];

/**
 * KEO-201 (bilan de vérité 2026-10-01) : lexique de la DÉTRESSE de l'élève —
 * arabe standard ET darija algérienne. DÉTECTION uniquement (comprendre
 * l'élève) : aucune de ces formes n'est jamais reproduite dans une SORTIE du
 * tuteur, qui reste en فصحى (AGENTS.md règle 5). Testé AVANT isGibberishInput
 * et OUT_OF_PROGRAM : « راني خايف من الباك » doit recevoir la réponse de
 * soutien, pas le refus « hors programme ».
 */
const AFFECT_LEXICON = [
  // فصحى et darija — PEUR, DÉCOURAGEMENT, ANXIÉTÉ seulement. La FATIGUE
  // (« تعبت », « أنا تعبان », « راسي يوجعني »…) n'est PAS ici : Morchid v3, M5
  // (15/10/2026) a mesuré qu'un mal de tête recevait le discours sur le trac.
  // Les formes de fatigue vivent dans `gestesDialogue.ts` (geste `fatigue`).
  'خائف', 'خايف', 'خائفة', 'قلق', 'يائس', 'فاشل', 'ضائع', 'محبط',
  // darija algérienne — détection seulement, jamais en production
  // ATTENTION : « ما فهمتش » (je n'ai pas compris) N'EST PAS ici, et c'est
  // volontaire (14/10/2026). La détresse est l'émotion ; l'incompréhension est
  // une DEMANDE, à laquelle un professeur répond « quoi exactement ? ». Les
  // confondre donnait à l'élève bloqué un discours d'encouragement à la place
  // du triage. Ces formes sont traitées par `gestesDialogue.ts` (famille
  // `incomprehension`), qui demande où est l'obstacle.
  'ضايع', 'ضعت', 'ما نقدرش', 'ماقدرش', 'حبست',
  // TROUS MESURÉS le 14/10/2026 : la couche existait, ces formes manquaient.
  // Les formes de fatigue mesurées ce jour-là (« أنا تعبان »…) ont migré vers
  // le geste `fatigue` de `gestesDialogue.ts` (Morchid v3, M5).
  'ماععلاباليش', 'ماعلاباليش', 'صعيب علي', 'كرهت البكالوريا', 'كرهت الدراسة',
];

/** Rendu d'un geste humain : la réponse du module, sans « confiance » affichée
 *  (comme le soutien KEO-201 — un geste n'est pas une performance du moteur). */
function resultatDuGeste(session: BotSession, geste: GesteDialogue): EngineResult {
  const actionsDomaine = session.activeDomainId
    ? DOMAINS.find((d) => d.id === session.activeDomainId)?.quickActions || ['العودة للقائمة الرئيسية']
    : DOMAINS.map((d) => d.title);
  return {
    session,
    action: {
      text: geste.reponseAr,
      quickActions: geste.actionsAr.length > 0 ? geste.actionsAr : actionsDomaine,
      sources: [],
    },
  };
}

/** Détection des entrées absurdes, rires répétitifs, ou blabla non scientifique. */
function isGibberishInput(raw: string): boolean {
  const s = (raw || '').trim().toLowerCase();
  if (/^([هha]){3,}$/i.test(s)) return true;
  if (/^(bla)+$/i.test(s) || /^(blabla)+$/i.test(s)) return true;
  if (/^(.)\1{3,}$/.test(s)) return true; // aaaa, zzzz, ءءءء...
  return false;
}

/**
 * Mélange DÉTERMINISTE des options (seed = id de la question) : le même
 * mélange est appliqué à l'affichage (toQuizPrompt) ET à la notation
 * (gradeQuizAnswer), sans état supplémentaire dans la session.
 * Corrige l'audit : correctIndex était 0 (option A) sur les 66 questions —
 * la bonne réponse s'affichait toujours en A.
 */
function hashSeed(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * Le mélange dépend désormais de DEUX choses : l'identifiant de la question et
 * la graine de SESSION (melangeOptions.graineSession()).
 *
 * Avant le 14/10/2026, il ne dépendait que de l'identifiant : l'ordre était donc
 * le même à chaque session, pour toujours. Une clé relevée une fois (« la réponse
 * est la 3ᵉ ») restait vraie indéfiniment. Avec la graine de session, elle ne
 * vaut plus que pour la session où elle a été relevée.
 */
export function shuffledView(q: QuizQuestion): QuizQuestion {
  let s = hashSeed(`${q.id}|${graineSession()}`);
  const rnd = () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
  const order = q.options.map((_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return {
    ...q,
    options: order.map((i) => q.options[i]),
    correctIndex: order.indexOf(q.correctIndex),
  };
}

function toQuizPrompt(q: QuizQuestion): QuizPrompt {
  const view = shuffledView(q);
  // B5 : seul l'énoncé + les options mélangées partent vers l'UI.
  return {
    id: view.id,
    question: view.question,
    options: view.options,
  };
}

const DOMAIN_UNITS: Record<number, [number, number]> = {
  1: [1, 5],
  2: [6, 8],
  3: [9, 11],
};

interface SearchChunk {
  id: string;
  type: 'card' | 'book' | 'opus' | 'guide' | 'lesson';
  title: string;
  unitId: number;
  unitTitle: string;
  text: string;
  sourceLabel?: string;
  followUp?: string;
  normTitle: string;
  normAliases: string[];
  normKeywords: string[];
  /** R5 (recherche globale) : pour les chunks de type 'lesson', clé canonique
   *  permettant d'ouvrir la leçon complète (ActiveLessonView / HtmlLessonViewer). */
  lessonKey?: string;
  /** Kind du lesson chunk : 'html' (leçon passive) vs 'active' (leçon active TS). */
  lessonKind?: 'html' | 'active';
}

const LEGACY_CHUNKS: SearchChunk[] = LEGACY_KNOWLEDGE_CARDS.map((c: LegacyKnowledgeCard) => ({
  id: c.id,
  type: 'card' as const,
  title: c.title,
  unitId: c.unitId,
  unitTitle: c.title,
  text: c.shortAnswer,
  sourceLabel: c.source,
  normTitle: normalizeArabic(c.title),
  normAliases: c.aliases.map((a) => normalizeArabic(a)),
  normKeywords: c.keywords.map((k) => normalizeArabic(k)),
}));

const BOOK_CHUNKS: SearchChunk[] = BOOK_TUTOR_QA.map((q: BookTutorQA) => ({
  id: q.id,
  type: 'book' as const,
  title: q.question,
  unitId: q.unitId,
  unitTitle: q.topic,
  text: q.answer,
  sourceLabel: q.sourceBook,
  followUp: q.followUp,
  normTitle: normalizeArabic(q.question),
  normAliases: [normalizeArabic(q.topic)],
  normKeywords: q.keywords.map((k) => normalizeArabic(k)),
}));

let chunksOpusCache: SearchChunk[] | null = null;

/** Chunks opuscules (tutorKnowledge, 428 × content) — Phase B bundle : cache
 *  paresseux, [] tant que le JSON n'est pas arrivé (dégradation honnête). */
function chunksOpus(): SearchChunk[] {
  if (chunksOpusCache) return chunksOpusCache;
  const donnees = tutorKnowledgeSiChargee();
  if (!donnees) return [];
  chunksOpusCache = donnees.map((c: TutorKnowledgeChunk) => ({
    id: c.id,
    type: 'opus' as const,
    title: c.title,
    unitId: c.unitId,
    unitTitle: c.unitTitle,
    text: c.content,
    normTitle: normalizeArabic(c.title),
    normAliases: [],
    normKeywords: c.keywords.map((k) => normalizeArabic(k)),
  }));
  return chunksOpusCache;
}

const GUIDE_CHUNKS: SearchChunk[] = STUDY_GUIDE_CARDS.map((card: StudyGuideCard) => ({
  id: card.id,
  type: 'guide' as const,
  title: card.title,
  unitId: 0,
  unitTitle: 'دليل الدراسة',
  text: `${card.subtitle}\n${card.sections.map((section) => `${section.heading}: ${section.bullets.join(' ')}`).join('\n')}`,
  sourceLabel: 'دليل دراسة module sciences',
  followUp: 'كيف أحلل وثيقة؟',
  normTitle: normalizeArabic(card.title),
  normAliases: card.triggers.map((trigger) => normalizeArabic(trigger)),
  normKeywords: [
    ...card.keywords,
    ...card.sections.flatMap((section) => [section.heading, ...section.bullets]),
  ].map((k) => normalizeArabic(k)),
}));

/** Index des leçons (47 HTML + 20 actives) — lot « index leçons » 2026-09-24.
 *  Phase A découpage bundle (2026-10-16) : l'index (786 Ko) ne voyage plus en
 *  JavaScript, il arrive par fetch (src/data/lessonIndexRuntime.ts). Cache
 *  paresseux : construit à la première recherche APRÈS chargement ; retourne
 *  [] tant que les données ne sont pas là — dégradation honnête (« لم أجد »),
 *  jamais d'invention. Verrou : src/build/tutorLeconsJson.lock.test.ts. */
let chunksLeconsCache: SearchChunk[] | null = null;

function chunksLecons(): SearchChunk[] {
  if (chunksLeconsCache) return chunksLeconsCache;
  const indexActif = lessonIndexSiChargee();
  if (!indexActif) return [];
  chunksLeconsCache = indexActif.map((c) => ({
  id: c.id,
  type: 'lesson' as const,
  title: c.title,
  unitId: c.unitId,
  unitTitle: c.lessonTitle,
  text: c.text,
  sourceLabel: c.kind === 'html' ? 'كتاب الدروس التفاعلي' : 'درس نشط',
  // R5 : clé + kind pour le deep-link vers la leçon complète.
  lessonKey: c.lessonKey,
  lessonKind: c.kind,
  // Suffixe de granularité « (n/m) » retiré : le match titre exact (+80) doit
  // rester possible sur les chunks découpés.
  normTitle: normalizeArabic(c.title.replace(/\s*\(\d+\/\d+\)\s*$/, '')),
  normAliases: c.aliases.map((a) => normalizeArabic(a)),
  normKeywords: c.keywords.map((k) => normalizeArabic(k)),
  }));
  return chunksLeconsCache;
}

/** Fusion des bases de recherche — cache invalidé dès qu'une base dynamique
 *  (leçons Phase A, opuscules Phase B) arrive (avant : tableaux figés au
 *  chargement du module sur les imports statiques). */
let tousChunksCache: SearchChunk[] | null = null;
let tousChunksCle = '';

/** Clé d'invalidation commune des caches dérivés de la fusion. */
function cleBasesChargees(): string {
  return `${chunksLecons().length > 0 ? 'L' : ''}|${chunksOpus().length > 0 ? 'O' : ''}`;
}

function tousLesChunks(): SearchChunk[] {
  const cle = cleBasesChargees();
  if (tousChunksCache && tousChunksCle === cle) return tousChunksCache;
  tousChunksCache = [...GUIDE_CHUNKS, ...LEGACY_CHUNKS, ...BOOK_CHUNKS, ...chunksOpus(), ...chunksLecons()];
  tousChunksCle = cle;
  return tousChunksCache;
}

/**
 * Vocabulaire de chaque domaine, construit sur les titres et mots-clés des
 * extraits déjà indexés : rien à écrire à la main, et rien à maintenir quand une
 * leçon s'ajoute. Sert à savoir DE QUOI PARLE la question avant de choisir un
 * extrait (`routageDomaine.ts`).
 */
let vocabDomaineCache: ReturnType<typeof construireVocabulaire> | null = null;
let vocabDomaineCle = '';

function vocabDomaine(): ReturnType<typeof construireVocabulaire> {
  const cle = cleBasesChargees();
  if (!vocabDomaineCache || vocabDomaineCle !== cle) {
    vocabDomaineCache = construireVocabulaire(
      tousLesChunks().map((ch) => ({
        domaine: domaineDeUnite(ch.unitId, DOMAIN_UNITS),
        tokens: [...tokenizeArabic(ch.normTitle), ...ch.normKeywords],
      })),
    );
    vocabDomaineCle = cle;
  }
  return vocabDomaineCache;
}

/* -------------------------------------------------------------------------- *
 * Détecteur « IN-DOMAINE » positif (R2 audit qualité Morchid 2026-09-29).    *
 *                                                                            *
 * Avant, le hors-sujet reposait sur une LISTE NOIRE figée (foot, cinéma…).   *
 * Une question hors programme non listée traversait toute la cascade et      *
 * renvoyait un extrait SVT peu pertinent (confiance 70) au lieu d'un franc   *
 * « hors programme ». On calcule désormais un SIGNAL DE DOMAINE positif :    *
 * la question doit partager du vocabulaire avec au moins une base.           *
 *                                                                            *
 *   - domaineVocab()     : gros vocabulaire (tous les tokens ≥3 des titres,   *
 *     alias et mots-clés de TOUTES les bases + titres de domaines).          *
 *     → correspondance EXACTE (haute couverture, zéro faux signal).          *
 *   - DOMAIN_CORE_VOCAB : vocabulaire identitaire CURÉ et restreint (titres  *
 *     et alias de fiches + titres de domaines). → correspondance FLOUE, pour *
 *     tolérer une faute de frappe sur un terme-clé sans sur-matcher.         *
 *                                                                            *
 * Un token exact du gros vocab OU un token flou du vocab curé = in-domaine.  *
 * -------------------------------------------------------------------------- */
function collectTokens(...phrases: string[]): string[] {
  const out: string[] = [];
  for (const p of phrases) out.push(...tokenizeArabic(p));
  return out;
}

let domaineVocabCache: Set<string> | null = null;
let domaineVocabCle = '';

/** Gros vocabulaire du programme, reconstruit dès qu'une base dynamique
 *  (leçons Phase A, opuscules Phase B) arrive (avant : Set figé au chargement
 *  du module sur les imports statiques). */
function domaineVocab(): Set<string> {
  const cle = cleBasesChargees();
  if (!domaineVocabCache || domaineVocabCle !== cle) {
    const vocab = new Set<string>();
    const add = (phrase: string | undefined) => {
      if (!phrase) return;
      for (const t of tokenizeArabic(phrase)) if (t.length >= 3) vocab.add(t);
    };
    for (const card of KNOWLEDGE_CARDS) {
      add(card.title);
      card.aliases.forEach(add);
      card.keywords.forEach(add);
    }
    for (const ch of tousLesChunks()) {
      add(ch.normTitle);
      ch.normAliases.forEach((a) => add(a));
      ch.normKeywords.forEach((k) => add(k));
    }
    for (const d of DOMAINS) add(d.title);
    for (const t of PEDAGOGICAL_TERMS) vocab.add(t);
    domaineVocabCache = vocab;
    domaineVocabCle = cle;
  }
  return domaineVocabCache;
}

/** Termes pédagogiques/commandes qui SONT dans le périmètre même s'ils ne
 *  nomment pas un concept SVT (ex. clic sur un bouton « دليل الإجابة »). Évite
 *  qu'une commande d'étude soit classée « hors programme ». */
const PEDAGOGICAL_TERMS = [
  'منهجيه', 'بروتوكول', 'دراسه', 'وحده', 'خطوات', 'دليل', 'الاجابه', 'اجابه',
  'تجارب', 'تجربه', 'البكالوريا', 'بكالوريا', 'مراجعه', 'تلخيص', 'ملخص', 'تمرين',
  'تمارين', 'سؤال', 'اسئله', 'شرح', 'تعريف', 'مقارنه', 'اختبار', 'تشخيصي', 'الدروس', 'درس',
  // DÉFAUT MESURÉ (audit §5.6) : « كيف أحضر للباك؟ » recevait « هذا السؤال خارج
  // قاعدة علوم الطبيعة والحياة ». Or c'est la question la plus posée par un
  // élève de 3AS, et elle porte sur la MÉTHODE. Ces verbes désignent une
  // intention de travail, jamais un contenu de chapitre : les déclarer
  // pédagogiques ouvre la branche de méthode sans rien voler aux cours (aucun
  // titre de leçon ne dit « كيف أحضّر »).
  'أحضر', 'احضر', 'أراجع', 'اراجع', 'أنظم', 'انظم', 'أخطط', 'اخطط', 'أبدأ',
  'أبدا', 'ابدأ', 'ألخص', 'الخص', 'أفهم', 'افهم', 'أحفظ', 'احفظ', 'أنجز',
  'أركز', 'اركز', 'أتدرّب', 'اتدرب', 'أنجح', 'انجح', 'أتحضّر', 'اتحضر',
].map((t) => normalizeArabic(t)).filter((t) => t.length >= 3);

const DOMAIN_CORE_VOCAB: string[] = (() => {
  const core = new Set<string>();
  for (const card of KNOWLEDGE_CARDS) {
    for (const t of collectTokens(card.title, ...card.aliases)) if (t.length >= 4) core.add(t);
  }
  for (const d of DOMAINS) for (const t of tokenizeArabic(d.title)) if (t.length >= 4) core.add(t);
  return Array.from(core);
})();

/** Mots vides / interrogatifs arabes : ils ne portent AUCUN signal de domaine.
 *  Les retirer évite qu'un « كيف / متى / ماذا » suffise à faire passer une
 *  question hors-sujet pour du programme. */
const AR_STOPWORDS: Set<string> = new Set(
  [
    'ما', 'ماذا', 'من', 'هو', 'هي', 'هل', 'كيف', 'متى', 'اين', 'لماذا', 'كم', 'اي', 'ايهما',
    'في', 'على', 'الى', 'عن', 'مع', 'بين', 'عند', 'هذا', 'هذه', 'ذلك', 'التي', 'الذي', 'الذين',
    'كل', 'قد', 'ثم', 'او', 'مثل', 'ايضا', 'لكن', 'حتى', 'كذلك', 'يعني', 'اذا', 'عندما', 'شيء',
    'يوجد', 'توجد', 'هناك', 'نعم', 'لا', 'ليس', 'كان', 'يكون', 'اريد', 'اعطني', 'قل', 'اخبرني',
  ].map((w) => normalizeArabic(w)),
);

/** Vrai si la question partage un vocabulaire suffisant avec le programme SVT :
 *  soit un token identique au vocabulaire global, soit un token proche (faute
 *  de frappe) d'un terme identitaire curé. Sinon → hors programme. */
function hasDomainSignal(inputTokens: string[]): boolean {
  const content = inputTokens.filter((t) => t.length >= 3 && !AR_STOPWORDS.has(t));
  if (content.length === 0) return false;
  for (const t of content) if (domaineVocab().has(t)) return true;
  for (const t of content) {
    if (t.length < 4) continue;
    if (DOMAIN_CORE_VOCAB.some((core) => fuzzyTokenEquals(t, core))) return true;
  }
  return false;
}

/** Réponse « hors programme » unique (utilisée par le garde-fou précoce ET par
 *  le détecteur in-domaine positif en fin de cascade). */
function outOfScopeResult(session: BotSession, label: string): EngineResult {
  return {
    session,
    action: {
      confidence: 0,
      text: '❓ هذا السؤال خارج قاعدة علوم الطبيعة والحياة للبكالوريا. ركّز مراجعتك على المجالات الثلاثة: التخصص الوظيفي للبروتينات، التحولات الطاقوية، والتكتونية العامة.',
      quickActions: session.activeDomainId
        ? DOMAINS.find((d) => d.id === session.activeDomainId)?.quickActions || ['العودة للقائمة الرئيسية']
        : DOMAINS.map((d) => d.title),
      sources: [{ type: 'out_of_scope' as SourceType, title: label }],
    },
  };
}

/**
 * KEO-201 (bilan de vérité 2026-10-01 — SpecKit #23) : la détresse n'est jamais
 * hors programme. Réponse de soutien en trois temps, ≤ 6 lignes : écoute (sans
 * conseil) → réduction de charge (un seul sujet, 10 minutes) → UNE action fondée
 * sur la dernière erreur réelle de l'élève.
 * Interdits dans cette réponse : note/évaluation, liste de domaines, proverbe
 * ou discours motivationnel générique, et toute darija — la SORTIE reste
 * strictement en فصحى (AGENTS.md règle 5) ; la darija n'est qu'un signal
 * d'entrée.
 */
function supportResult(session: BotSession): EngineResult {
  const lastMistakeId = session.mistakes.length > 0 ? session.mistakes[session.mistakes.length - 1] : null;
  const card = lastMistakeId ? getCardById(lastMistakeId) : null;
  const action = card
    ? `آخر خطأ مسجّل لديك كان في: **${card.title}**. ابدأ به الآن — بطاقة واحدة وسؤال تثبيت واحد، عشر دقائق ثمّ نتوقّف.`
    : 'افتح المجال الذي تجده أصعب عليك، واقرأ بطاقته الأولى فقط. عشر دقائق ثمّ نتوقّف.';
  const text =
    'سمعتك. القلق قبل البكالوريا طبيعي — ومعناه أنّك تهتمّ لأمر دراستك، لا أنّك عاجز.\n\n' +
    'لن نراجع كلّ شيء اليوم: سنراجع موضوعاً واحداً فقط، لمدّة **10 دقائق**، ثمّ نتوقّف.\n\n' +
    `👉 ${action}\n\nأنا هنا بعد العشر دقائق.`;
  return {
    session,
    action: {
      text,
      quickActions: ['راجع أخطائي السابقة', 'العودة للقائمة الرئيسية'],
      sources: [],
    },
  };
}

/* -------------------------------------------------------------------------- *
 * KEO-103 (LOT 2) : mode socratique — une question de sondage (probe) avant
 * tout contenu de fiche. Le chemin « fiche » livrait shortAnswer dès la
 * première question (réponse prémâchée, ~80 % des réponses du moteur) ;
 * désormais l'élève tente, puis le contenu arrive ciblé sur son écart.
 * -------------------------------------------------------------------------- */
/** Marqueurs d'une demande d'EXPLICATION (les quick actions «راجع …» et les
 *  titres seuls ne sondent pas : c'est une intention de révision explicite). */
const EXPLAIN_MARKERS = [
  'ما هو', 'ماهو', 'ما هي', 'ماهي', 'ماذا', 'كيف', 'لماذا', 'اشرح', 'وضح', 'عرف',
];

function isExplainQuestion(norm: string): boolean {
  return EXPLAIN_MARKERS.some((m) => norm.includes(normalizeArabic(m)));
}

/** Action renvoyée pour la question de sondage : la probe seule, zéro contenu. */
/**
 * S-05 (SpecKit 002, master 81984de — fusion 2026-10-01) : rappel actif.
 * Toute explication livrée se termine par UNE tâche de rappel — la séance
 * n'est pas close tant que cette tâche n'a pas de réponse. Le discriminateur
 * est pris sur le PREMIER mot-clé de la fiche (le concept le plus central).
 */
/**
 * LA PHRASE DE LA FICHE QUI RELIE LES DEUX MOTS-CLÉS — ou `null`.
 *
 * Sert à DEUX choses, et la première est une garantie d'honnêteté :
 *
 *  1. vérifier que la question « صح أم خطأ » a une réponse VÉRIFIABLE dans la
 *     fiche. Sans cette vérification, la phrase « X مرتبط بـ Y » est toujours
 *     vraie par construction (les deux mots viennent de la même fiche) et la
 *     question est un faux exercice : le tuteur ne peut ni corriger ni expliquer.
 *  2. fournir la phrase à montrer après la réponse de l'élève — c'est la fiche
 *     qui parle, pas le moteur. Utilisée par `reponseAuRappel`.
 */
function phraseRelation(card: KnowledgeCard): string | null {
  const phrases = card.shortAnswer
    .split(/[.!?؟\n؛]+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
  const kw = card.keywords.filter((k) => k.length >= 3);
  const d = normalizeArabic(kw[0] ?? '');
  const s2 = normalizeArabic(kw[1] ?? '');
  if (!d || phrases.length === 0) return null;
  const deuxMots = phrases.find((p) => {
    const np = normalizeArabic(p);
    return np.includes(d) && (!s2 || np.includes(s2));
  });
  if (deuxMots) return deuxMots;
  return phrases.find((p) => normalizeArabic(p).includes(d)) ?? null;
}

function buildRecallQuestion(card: KnowledgeCard): string {
  const kw = card.keywords.filter((k) => k.length >= 3);
  const discriminator = kw[0] ?? card.title;
  const second = kw[1] ?? discriminator;
  // Question VÉRIFIABLE → la forme à un mot (la plus rapide, et conforme à la
  // règle des 2 minutes). Sinon → tâche de production, dont la réponse est la
  // phrase de la fiche : on ne pose jamais une question qu'on ne peut pas juger.
  if (phraseRelation(card) === null || second === discriminator) {
    return (
      `\n\n🧠 **قبل أن ننتقل:** سؤال واحد يقفل الحصّة.\n` +
      `اكتب في سطر واحد: ما العلاقة بين **${discriminator}** و **${second}** في هذا الدرس؟\n` +
      `أرسل جملتك — ثم أقارنها بجملة البطاقة.`
    );
  }
  return (
    `\n\n🧠 **قبل أن ننتقل:** سؤال واحد يقفل الحصّة.\n` +
    `صح أم خطأ: **${discriminator}** مرتبط مباشرةً بـ **${second}** في هذا الدرس.\n` +
    `أجب بكلمة واحدة — إن أخطأت، نعيد الجملة لا الدرس.`
  );
}

/**
 * INTENTIONS QUI ABANDONNENT UNE QUESTION POSÉE — menu, test, révision, défi.
 *
 * Elles sont traitées PARFOIS PLUS HAUT dans la cascade que le bloc d'écoute du
 * rappel (« راجع أخطائي السابقة » l'est). Sans un nettoyage placé EN TÊTE de
 * `processStudentInput`, l'état resterait armé après que l'élève a quitté la
 * question : la saisie SUIVANTE serait notée comme la réponse à une question à
 * laquelle il ne répond plus. C'est la même famille de défaut que le bug corrigé
 * ici — un état qui survit à son contexte.
 */
function estIntentionForte(norm: string): boolean {
  const n = (s: string) => normalizeArabic(s);
  return (
    norm.includes(n('القائمة الرئيسية')) ||
    norm.includes(n('العودة للقائمة')) ||
    norm.includes(n('رجوع للقائمة')) ||
    norm.includes(n('اختبرني')) ||
    norm.includes(n('راجع أخطائي')) ||
    norm.startsWith(n('راجع')) ||
    norm.includes(n('تحدي bac')) ||
    norm.includes(n('تحدي البكالوريا'))
  );
}

/**
 * PREMIERS MOTS QUI ANNONCENT UNE QUESTION, pas une réponse.
 * « اشرح لي », « ما هو الاستنساخ؟ » : l'élève DEMANDE quelque chose. Les prendre
 * pour la réponse au rappel était le défaut mesuré au test KEO-102 (la carte
 * contournée ne doit plus jamais re-sonder) — et c'est plus grave que le bug
 * d'origine : on aurait répondu à côté à une vraie question.
 */
// Volontairement ÉTROITE : « من » est aussi une préposition (« من النواة إلى… »)
// et « ايه » veut dire OUI en dialecte. Rejeter une réponse qui commence par
// « من » aurait recréé le bug : une vraie réponse jetée hors de la conversation.
const MOTS_INTERROGATIFS = [
  'ما', 'ماذا', 'كيف', 'لماذا', 'اين', 'متي', 'هل', 'اشرح', 'فسر', 'علل',
  'اذكر', 'قارن', 'وضح', 'اعطني', 'صحح', 'اكتب',
];

/** Découpe une saisie normalisée en mots, sans le seuil de 3 lettres de
 *  `tokenizeArabic` — « صح » et « لا » font 2 lettres et sont des réponses. */
function motsSaisie(norm: string): string[] {
  return norm.replace(/[؟?،؛.!:,]/g, ' ').trim().split(/\s+/).filter(Boolean);
}

/**
 * La saisie POURRAIT-elle être une prise de position sur la question posée ?
 * Une question n'est jamais une réponse : ni « ؟ », ni un mot interrogatif en
 * tête. Le reste — une phrase, une ligne, un paragraphe — est recevable : on ne
 * refuse jamais à un élève le droit de répondre longuement.
 */
function estReponseAuRappel(input: string, norm: string): boolean {
  if (/[?؟]/.test(input)) return false;
  const mots = motsSaisie(norm);
  if (mots.length === 0) return false;
  return !MOTS_INTERROGATIFS.includes(mots[0]);
}

/**
 * Saisie nue qui est un VERDICT sans question : « صح », « خطأ », « نعم »…
 * Sans question en attente, ce n'est pas un hors-sujet — c'est une réponse
 * orpheline. On demande à quoi elle répond au lieu d'accuser l'élève.
 */
function estMotReponseSeul(norm: string): boolean {
  const mots = motsSaisie(norm);
  if (mots.length === 0 || mots.length > 2) return false;
  const connus = [...RAPPEL_VRAI, ...RAPPEL_FAUX].map((m) => normalizeArabic(m));
  return mots.every((m) => connus.some((c) => includesAsWord(m, c)));
}

/** « Je ne sais pas » n'est ni vrai ni faux : c'est une demande d'aide. */
const RAPPEL_INCERTAIN = ['لا اعرف', 'لا ادري', 'لا اعلم', 'ماعرفتش', 'ما عرفتش', 'لا اتذكر'];

/**
 * Le verdict que l'élève porte sur sa propre restitution — ou null s'il n'a rien
 * déclaré (il a rédigé une réponse, ou il parle d'autre chose).
 *
 * PRÉCÉDENCE : « لا أعرف » passe avant « vrai » et « faux », parce que
 * l'incertitude CONTIENT le mot « لا ». Lire « لا أعرف » comme « خطأ » serait la
 * faute typique du correcteur automatique : répondre à la place de l'élève au
 * lieu de l'aider. L'ordre est donc incertain > vrai > faux, et il est testé.
 */
function verdictAutoEvaluation(norm: string): 'vrai' | 'faux' | 'incertain' | null {
  if (RAPPEL_INCERTAIN.some((m) => includesAsWord(norm, normalizeArabic(m)))) return 'incertain';
  if (RAPPEL_VRAI.some((m) => includesAsWord(norm, normalizeArabic(m)))) return 'vrai';
  if (RAPPEL_FAUX.some((m) => includesAsWord(norm, normalizeArabic(m)))) return 'faux';
  return null;
}

/**
 * PROGRAMME LE RAPPEL APRÈS LA RÉPONSE — et dit à l'élève quand il reviendra.
 *
 * LE DÉFAUT RÉPARÉ (15/10/2026). `reponseAuRappel` produisait un verdict, puis
 * ce verdict n'était enregistré NULLE PART. Conséquence : l'élève qui répondait
 * parfaitement et celui qui répondait « لا أعرف » étaient reprogrammés à
 * l'identique — c'est-à-dire jamais, puisque rien ne les reprogrammait.
 *
 * La qualité vient de deux sources, dans cet ordre :
 *   1. le verdict déclaré (« صح » / « خطأ » / « لا أعرف ») — c'est ainsi que
 *      fonctionnent toutes les applications de cartes, et l'élève est honnête
 *      sur sa propre restitution ;
 *   2. sinon, la réponse RÉDIGÉE est notée sur les mots-clés de la fiche :
 *      c'est la même mesure que le corpus des concepts applique à ses preuves,
 *      avec ici `minEvidence = 1` — une fiche est un rappel court, exiger trois
 *      mots-clés reviendrait à refuser presque toutes les bonnes réponses.
 *
 * L'échéance est ensuite calculée par l'algorithme SM-2 canonique, à partir de
 * l'historique de CETTE fiche — pas d'une échelle fixe.
 */
function avecEcheanceRappel(
  action: TutorAction,
  card: KnowledgeCard,
  rawInput: string,
): TutorAction {
  const verdict = verdictAutoEvaluation(normalizeArabic(rawInput));
  const qualite = verdict
    ? qualiteDepuisAutoEvaluation(verdict)
    : qualiteDepuisPreuves(rawInput, { acceptedEvidence: card.keywords, minEvidence: 1 });
  const etat = noterRappel(card.id, qualite);
  return { ...action, text: `${action.text}\n\n⏱️ ${phraseEcheance(etat.intervalDays)}` };
}

/** Mots qui valent « vrai » / « faux » à la question de rappel. Comparés par MOT
 *  ENTIER : « لا » doit être un mot, pas les deux lettres de « سلام ». */
const RAPPEL_VRAI = ['صح', 'صحيح', 'نعم', 'أجل', 'اجل', 'true', 'vrai'];
const RAPPEL_FAUX = ['خطأ', 'خطا', 'لا', 'غير صحيح', 'false', 'faux'];

/**
 * LA RÉPONSE AU RAPPEL — le chaînon qui manquait.
 *
 * Elle ne prétend RIEN que la fiche ne dise pas : le verdict n'existe que si
 * `phraseRelation` a trouvé la phrase qui relie les deux mots-clés. Le tuteur
 * cite la fiche — il n'explique pas à sa place, et il ne termine pas par une
 * question de plus (une question sans réponse possible est exactement le défaut
 * que ce correctif répare).
 */
function reponseAuRappel(card: KnowledgeCard, rawInput: string): TutorAction {
  const phrase = phraseRelation(card);
  const norm = normalizeArabic(rawInput);
  const verdict = verdictAutoEvaluation(norm);
  const ditVrai = verdict === 'vrai';
  const ditFaux = verdict === 'faux';
  const ditIncertain = verdict === 'incertain';

  let entete: string;
  if (ditIncertain) {
    entete = '🤝 لا بأس — «لا أعرف» جواب صادق. وهذه هي الجملة التي تحمل العلاقة، اقرأها ثم أعد السؤال:';
  } else if (phrase && ditVrai) {
    entete = '✅ صحيح — والبطاقة تقولها بعبارة واحدة:';
  } else if (phrase && ditFaux) {
    entete = '↺ في هذا الدرس هما مرتبطان فعلًا — وهذه هي الجملة التي تثبت ذلك:';
  } else {
    entete = '📝 وصلني جوابك. هذه جملة البطاقة التي تحمل العلاقة — قارن بها:';
  }
  const corps = phrase ? `\n\n> «${phrase}»` : `\n\n${card.shortAnswer}`;
  return {
    confidence: 90,
    text:
      `${entete}${corps}\n\n` +
      'إن طابقت صياغتك هذه الجملة، فالمعلومة مثبّتة. وإن اختلفت، فالفرق بين الصياغتين هو بالضبط ما تكتبه على ورقتك.',
    quickActions: filterQuickActions(card.relatedQuestions, norm),
    sources: [{ type: 'internal_card' as SourceType, title: card.title }],
  };
}

function probeQuestionAction(card: KnowledgeCard): TutorAction {
  return {
    confidence: 90,
    text:
      `🧭 **سؤال قبل الشرح — إجابتك ستحدّد ما سأشرحه:**\n\n${card.probe!.question}\n\n` +
      '(لن أعطيك الشرح قبل محاولتك. إن أردته رغم ذلك اكتب «اشرح لي» — سأعطيه لك وهذا مسجّل.)',
    quickActions: filterQuickActions(card.relatedQuestions, ''),
    sources: [{ type: 'internal_card' as SourceType, title: card.title }],
  };
}

/** Verdict en UNE ligne sur la tentative de l'élève, puis le contenu complet —
 *  l'accroche du contenu dépend de la justesse de la tentative. Les formes
 *  attendues très courtes (≤ 2 lettres : «لا»، «LB») sont comparées par mot
 *  entier pour éviter les faux positifs de sous-chaîne. */
function probeVerdictThenContent(card: KnowledgeCard, rawAnswer: string): TutorAction {
  const normAns = normalizeArabic(rawAnswer);
  // Morchid v3, M3 (15/10/2026) : « لا أعرف » est un AVEU d'ignorance, pas une
  // réponse fausse. Avant : texte identique à « zzz » (« 📌 إجابتك غير موفقة »).
  // Un élève qui avoue ouvre le contenu par la base, sans fausse accusation.
  const aveu = RAPPEL_INCERTAIN.some((m) => includesAsWord(normAns, normalizeArabic(m)));
  const hit = card.probe!.expect.some((e) => {
    const ne = normalizeArabic(e);
    return ne.length <= 2 ? includesAsWord(normAns, ne) : normAns.includes(ne);
  });
  const verdict = aveu
    ? '👍 **الاعتراف بالجهل أول خطوات التعلّم الصادق.** إليك الشرح من الأساس — ثمّ أعِد المحاولة بكلماتك:'
    : hit
      ? '✅ **إجابتك في محلّها.** إليك الشرح — وابدأ منه حيث أصبت:'
      : `📌 **إجابتك غير موفقة** — الجواب المنتظر: ${card.probe!.expect.join(' / ')}. اقرأ الشرح بعناية خاصة لبدايته:`;
  return {
    confidence: 95,
    text: `${verdict}\n\n🧩 **${card.title}**\n\n${card.shortAnswer}\n\n🔑 كلمات مفتاحية: ${card.keywords.join(' • ')}${buildRecallQuestion(card)}`,
    quickActions: filterQuickActions(card.relatedQuestions, normAns),
    sources: [{ type: 'internal_card' as SourceType, title: card.title }],
  };
}

function scoreChunk(
  norm: string,
  ch: SearchChunk,
  activeDomainId: number | null,
  inputTokens: string[],
): number {
  if (norm.length < 3) return 0;
  let score = 0;
  if (ch.normTitle && ch.normTitle.length >= 3 && norm.includes(ch.normTitle)) score += 80;
  for (const alias of ch.normAliases) {
    if (alias && alias.length >= 3 && norm.includes(alias)) score += 60;
  }
  for (const kw of ch.normKeywords) {
    // N1 (bilan de vérité 2026-10-01) : mot ENTIER pour un mot-clé mono-mot —
    // même garde-fou que le matching des fiches (B3). Une sous-chaîne arabe
    // («لب» dans «الباك») ne doit pas marquer le chunk RAG.
    if (kw && kw.length >= 3 && (kw.includes(' ') ? norm.includes(kw) : includesAsWord(norm, kw))) {
      score += 6;
    } else if (kw && kw.length >= 4 && !kw.includes(' ') && inputTokens.some((it) => fuzzyTokenEquals(it, kw))) {
      // R1 : mot-clé mono-mot tapé avec une faute → demi-poids (recall sans bruit).
      score += 3;
    }
  }
  if (activeDomainId != null) {
    const range = DOMAIN_UNITS[activeDomainId];
    if (range && ch.unitId >= range[0] && ch.unitId <= range[1]) score += 10;
  }
  if (ch.type === 'opus') score *= 0.7;
  if (ch.type === 'guide') score *= 1.15;
  return score;
}

function findBestStudyGuide(query: string): { card: StudyGuideCard; score: number }[] {
  const normRaw = normalizeArabic(query);
  if (!normRaw) return [];
  const norm = normRaw.replace(/[؟?.!،,]/g, ' ').replace(/\s+/g, ' ').trim();
  if (norm.length < 3) return [];

  return STUDY_GUIDE_CARDS.map((card) => {
    let score = 0;
    const title = normalizeArabic(card.title);
    const subtitle = normalizeArabic(card.subtitle);
    if (title && title.length >= 3 && (norm.includes(title) || title.includes(norm))) score += 70;
    if (subtitle && subtitle.length >= 3 && (norm.includes(subtitle) || subtitle.includes(norm))) score += 30;
    for (const trigger of card.triggers) {
      const nt = normalizeArabic(trigger);
      if (nt && nt.length >= 3 && (norm.includes(nt) || nt.includes(norm))) score += 55;
    }
    for (const keyword of card.keywords) {
      const nk = normalizeArabic(keyword);
      // N1 (bilan de vérité 2026-10-01) : mot ENTIER pour un mot-clé mono-mot —
      // même règle que le matching des fiches (correctif B3, includesAsWord).
      // Une sous-chaîne arabe («لب» dans «الباك») ne doit pas rapporter de
      // score au guide d'étude, plus qu'aux fiches.
      if (nk.length >= 3 && (nk.includes(' ') ? norm.includes(nk) : includesAsWord(norm, nk))) score += 8;
    }
    for (const section of card.sections) {
      const ns = normalizeArabic(section.heading);
      if (ns && norm.includes(ns)) score += 12;
      for (const bullet of section.bullets) {
        for (const token of tokenizeArabic(normalizeArabic(bullet))) {
          if (token.length >= 4 && norm.includes(token)) score += 1;
        }
      }
    }
    return { card, score };
  })
    .filter((x) => x.score >= 14)
    .sort((a, b) => b.score - a.score);
}

function formatStudyGuideAnswer(card: StudyGuideCard): string {
  const sections = card.sections
    .map((section) => `📌 **${section.heading}**\n${section.bullets.map((bullet) => `• ${bullet}`).join('\n')}`)
    .join('\n\n');

  return `🧭 **${card.title}**\n${card.subtitle}\n\n${sections}\n\n🔑 **كلمات مفتاحية:** ${card.keywords.join(' • ')}`;
}

/** Un extrait avec son score de pertinence. Le score est la SEULE mesure dont on
 *  dispose pour savoir si le moteur sait répondre : il doit donc être visible,
 *  pas jeté après le tri. */
export interface ScoredChunk {
  ch: SearchChunk;
  score: number;
}

/**
 * DEUX BARÈMES, PARCE QUE LA MESURE L'EXIGE (R6, 14/10/2026).
 *
 * Pourquoi 12 ne suffisait pas : `scoreChunk` accorde +10 dès que l'extrait
 * appartient au domaine ACTIF (celui de la session, pas celui de la question) et
 * +6 par mot-clé reconnu. Un seul mot courant plus ce bonus atteignait donc 16,
 * et le moteur servait l'extrait avec une confiance de 70 affichée à l'élève.
 * C'est ce mécanisme qui répondait « البنيات الثانوية » (protéines) à une
 * question sur les **بنيات جيولوجية**.
 *
 * Population mesurée sur 26 questions :
 *   réponses justes mais faibles : 16, 19, 25, 28   ← à NE PAS casser
 *   réponses fausses             : 13, 16, 19, 19   ← à refuser
 *
 * Les deux se recouvrent : un seuil unique ne peut pas les séparer. Ce qui les
 * sépare, c'est la cohérence de DOMAINE entre la question et l'extrait servi.
 * D'où deux barèmes :
 *   · domaine de la question établi → 12 : on peut vérifier la cohérence, donc on
 *     accepte une correspondance faible — l'extrait est dans le bon chapitre.
 *   · domaine non établi → 28 : sans moyen de vérifier, il faut une preuve
 *     lexicale forte (trois mots-clés, ou un titre partiel). En dessous de 28,
 *     refuser coûte moins cher à l'élève que se tromper de chapitre.
 */
export const SEUIL_SANS_DOMAINE = 28;
export const SEUIL_AVEC_DOMAINE = 12;

export function searchAllBasesScores(norm: string, activeDomainId: number | null): ScoredChunk[] {
  if (!norm || norm.length < 3) return [];
  const inputTokens = tokenizeArabic(norm);
  return tousLesChunks().map((ch) => ({ ch, score: scoreChunk(norm, ch, activeDomainId, inputTokens) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);
}

export function searchAllBases(norm: string, activeDomainId: number | null): SearchChunk[] {
  return searchAllBasesScores(norm, activeDomainId)
    .filter((x) => x.score >= 12)
    .map((x) => x.ch);
}

/**
 * L'extrait qu'on peut honnêtement servir — ou `null`.
 *
 * Trois étapes, dans cet ordre :
 *   1. À quel domaine du programme appartient la QUESTION ? (routage par
 *      vocabulaire, `routageDomaine.ts`)
 *   2. Le bonus de domaine est accordé à CE domaine — jamais à celui de la
 *      session : c'est la question de l'élève qui décide de ce qui est pertinent,
 *      et non l'onglet où il se trouve.
 *   3. Si le domaine est établi, on ne sert QUE des extraits de ce domaine (ou
 *      transverses : fiches de méthode, guide, livre).
 *
 * La confiance affichée DÉCOULE du score : elle ne peut plus valoir 70 sur une
 * correspondance qui vaut 16.
 */
export function meilleurExtrait(
  norm: string,
  activeDomainId: number | null,
): { extrait: ScoredChunk; domaine: number | null } | null {
  const domaine = domaineProbable(tokenizeArabic(norm), vocabDomaine());
  const bonus = domaine ?? activeDomainId;
  const seuil = domaine == null ? SEUIL_SANS_DOMAINE : SEUIL_AVEC_DOMAINE;

  const hits = searchAllBasesScores(norm, bonus).filter((h) => h.score >= seuil);
  if (hits.length === 0) return null;

  const dansLeDomaine =
    domaine == null
      ? hits
      : hits.filter((h) => {
          const d = domaineDeUnite(h.ch.unitId, DOMAIN_UNITS);
          // `d == null` = extrait transverse (méthode, guide, livre) : il
          // n'appartient à aucun domaine, donc il ne le contredit pas.
          return d == null || d === domaine;
        });
  if (dansLeDomaine.length === 0) return null;
  return { extrait: dansLeDomaine[0], domaine };
}

/** Confiance dérivée du score : 28 → 55 %, 60 → 70 %, 120 et plus → 85 %. */
export function confianceDepuisScore(score: number): number {
  if (score >= 120) return 85;
  if (score >= 60) return 70;
  if (score >= 40) return 62;
  return 55;
}

function filterQuickActions(actions: string[], currentInputNorm: string): string[] {
  const seen = new Set<string>();
  return actions
    .filter((action) => {
      const na = normalizeArabic(action);
      if (na === currentInputNorm || (na.length > 3 && currentInputNorm.includes(na)) || (currentInputNorm.length > 3 && na.includes(currentInputNorm))) {
        return false;
      }
      if (seen.has(na)) return false;
      seen.add(na);
      return true;
    })
    .slice(0, 3);
}

function findMicroAnswer(card: KnowledgeCard, norm: string): string | null {
  if (!card.microAnswers) return null;
  for (const micro of card.microAnswers) {
    for (const trigger of micro.triggers) {
      const nTrigger = normalizeArabic(trigger);
      if (nTrigger && norm.includes(nTrigger)) {
        return micro.answer;
      }
    }
  }
  return null;
}

/** F10 (audit Morchid 2026-09-26) : coupe un extrait à la dernière fin de
 *  phrase avant la limite, jamais en plein milieu d'un mot. L'ancienne coupe
 *  fixe à 397 caractères tronquait les phrases (et les mots arabes) en plein
 *  milieu. On ne remonte à la fin de phrase précédente que si elle garde au
 *  moins la moitié de la longueur maximale, sinon l'extrait serait trop court. */
export const SNIPPET_MAX = 400;

export function couperExtrait(texte: string, max = SNIPPET_MAX): { text: string; truncated: boolean } {
  if (texte.length <= max) return { text: texte, truncated: false };
  const coupe = texte.slice(0, max);
  const finsDePhrase = ['.', '؟', '!', '،', '؛', ';'];
  let fin = -1;
  for (const f of finsDePhrase) {
    const i = coupe.lastIndexOf(f);
    if (i > fin) fin = i;
  }
  const text = fin > max * 0.5 ? coupe.slice(0, fin + 1) : coupe;
  return { text, truncated: true };
}

/** Ce que `buildAnswer` renvoie : l'action, ET la fiche dont la question de
 *  rappel reste en attente (pour que l'appelant puisse l'enregistrer). */
interface ReponseAvecRappel {
  action: TutorAction;
  /** Fiche dont la question de rappel est désormais en attente, ou `null`. */
  recallCardId: string | null;
}

function buildAnswer(norm: string, activeDomainId: number | null): ReponseAvecRappel | null {
  if (!norm || norm.length < 3) return null;
  const scored = findBestKnowledgeCardScored(norm, activeDomainId);

  if (scored) {
    const scienceCard = scored.card;
    const confidence = confidenceFromCardScore(scored.score, scored.exact);
    const microHit = findMicroAnswer(scienceCard, norm);
    if (microHit) {
      return {
        // Réponse ciblée : le contenu entier n'a pas été servi, donc aucune
        // question de rappel n'a été posée — rien à écouter ensuite.
        action: {
          confidence,
          text: `🎯 **${scienceCard.title}**\n\n${microHit}`,
          quickActions: filterQuickActions(scienceCard.relatedQuestions, norm),
          sources: [{ type: 'internal_card' as SourceType, title: scienceCard.title }],
        },
        recallCardId: null,
      };
    }
    return {
      action: {
        confidence,
        text: `🧩 **${scienceCard.title}**\n\n${scienceCard.shortAnswer}\n\n🔑 كلمات مفتاحية: ${scienceCard.keywords.join(' • ')}${buildRecallQuestion(scienceCard)}`,
        quickActions: filterQuickActions(scienceCard.relatedQuestions, norm),
        sources: [{ type: 'internal_card' as SourceType, title: scienceCard.title }],
      },
      recallCardId: scienceCard.id,
    };
  }

  // R6 (14/10/2026) : le repli de recherche ne sert plus « le moins mauvais »
  // extrait. Sans preuve suffisante, il rend la main — et la cascade répond
  // honnêtement qu'elle ne sait pas, au lieu d'un cours d'un autre chapitre.
  const trouve = meilleurExtrait(norm, activeDomainId);
  if (!trouve) return null;

  const best = trouve.extrait.ch;
  const extrait = couperExtrait(best.text);
  let sourceType: SourceType = 'opus';
  if (best.type === 'book') sourceType = 'book';
  else if (best.type === 'card') sourceType = 'legacy_card';
  else if (best.type === 'guide') sourceType = 'guide';
  else if (best.type === 'lesson') sourceType = 'lesson';

  return {
    action: {
      // R5 : la recherche brute (fallback) est moins fiable qu'une carte
      // curatée. R6 : la confiance DÉCOULE désormais du score obtenu — 70 était
      // une valeur de façade, identique pour une correspondance forte et pour
      // une coïncidence de vocabulaire.
      confidence: confianceDepuisScore(trouve.extrait.score),
      text: `📚 **${best.title}**\n\n${extrait.text}${extrait.truncated ? ' …' : ''}`,
      quickActions: best.followUp ? filterQuickActions([best.followUp], norm) : [],
      sources: [{ type: sourceType, title: best.title }],
    },
    // Extrait de recherche brute : aucune question de rappel n'est posée.
    recallCardId: null,
  };
}

function parseAnswer(raw: string): number | null {
  const t = (raw || '').trim().toLowerCase();
  const letterMap: Record<string, number> = { a: 0, b: 1, c: 2, d: 3 };
  if (t in letterMap) return letterMap[t];
  if (/^[1-4]$/.test(t)) return Number(t) - 1;
  const arabicMap: Record<string, number> = { ا: 0, ب: 1, ج: 2, د: 3 };
  if (t in arabicMap) return arabicMap[t];
  return null;
}

export function handleDomainClick(session: BotSession, domainId: number): EngineResult {
  const domain = DOMAINS.find((d) => d.id === domainId);
  if (!domain) {
    return { session: resetSession(), action: { text: 'مجال غير معروف. اختر مجالاً من القائمة.', quickActions: DOMAINS.map((d) => d.title) } };
  }
  const newSession = startDomainSession(domainId, session.mistakes, session.mistakeStats);
  const cards = KNOWLEDGE_CARDS.filter((c) => c.domainId === domainId);
  const text = `📚 اخترت مجال: **${domain.title}**\n${domain.subtitle}\n\n` +
    `المواضيع المتاحة للمراجعة:\n` +
    cards.map((c, i) => `${i + 1}. ${c.title}`).join('\n') +
    `\n\nابدأ باختبار تشخيصي، أو راجع موضوعاً مباشرةً من القائمة أدناه.`;
  const quickActions = ['اختبار تشخيصي', 'تحدي BAC', ...cards.map((c) => `راجع ${c.title}`), 'راجع أخطائي السابقة', 'العودة للقائمة الرئيسية'];
  return { session: newSession, action: { text, quickActions } };
}

/**
 * B3 (audit Morchid 2026-09-25) : recherche par MOT ENTIER et non par sous-chaîne.
 * « الباك » contient la sous-chaîne « لب » → il renvoyait la carte du noyau
 * terrestre. Le mot englobant l'occurrence doit valoir le needle, ou sa forme
 * avec l'article défini « ال ». Les needles multi-mots (espaces) retombent sur
 * un `includes` simple (ils ne peuvent pas être engulfés dans un mot).
 */
/* -------------------------------------------------------------------------- *
 * Expansion par SYNONYMES (R3 audit 2026-09-29). Réutilise le dictionnaire    *
 * curé `SYNONYM_GROUPS` (déjà maintenu pour ValidationEngine) au lieu de      *
 * dupliquer des alias fiche par fiche : un élève qui écrit « acetylcholine », *
 * « ACh » ou « أستيل كولين » active le même groupe que « الاستيل كولين ».     *
 * -------------------------------------------------------------------------- */
/** forme normalisée (normalizeArabic) → clés de groupes de synonymes. */
const SYNONYM_FORM_INDEX: Map<string, string[]> = (() => {
  const m = new Map<string, string[]>();
  for (const g of SYNONYM_GROUPS) {
    for (const form of g.forms) {
      const nf = normalizeArabic(form);
      if (!nf) continue;
      const arr = m.get(nf) ?? [];
      if (!arr.includes(g.key)) arr.push(g.key);
      m.set(nf, arr);
    }
  }
  return m;
})();

/** Groupes de synonymes activés par la question (calculé UNE fois par requête). */
function activeSynonymGroups(norm: string): Set<string> {
  const active = new Set<string>();
  for (const g of SYNONYM_GROUPS) {
    for (const form of g.forms) {
      const nf = normalizeArabic(form);
      if (nf && nf.length >= 3 && (includesAsWord(norm, nf) || norm.includes(nf))) {
        active.add(g.key);
        break;
      }
    }
  }
  return active;
}

/** Vrai si `nk` (mot-clé normalisé) appartient à un groupe activé par la question. */
function keywordHitViaSynonym(nk: string, activeGroups: Set<string>): boolean {
  if (activeGroups.size === 0) return false;
  const groups = SYNONYM_FORM_INDEX.get(nk);
  return !!groups && groups.some((k) => activeGroups.has(k));
}

/**
 * Score de contenu d'une fiche pour une question donnée (source unique — R1
 * audit 2026-09-29 : `findBestKnowledgeCard` et sa variante scorée partagent
 * désormais CE calcul, ce qui supprime la duplication à l'origine des dérives).
 *
 * Priorité EXACTE d'abord (précision), puis REPLI FLOU si l'exact échoue :
 *   - alias : mot entier → 100+len ; sinon recouvrement ≥ 0,75 (multi-mots) ou
 *     alias mono-mot tapé avec une faute → 60.
 *   - titre : mot entier → 50 ; sinon recouvrement ≥ 0,60 → 25.
 *   - mot-clé : présent (token/mot entier) OU tapé avec une faute → +8 chacun.
 * Le flou n'intervient QUE pour les tokens ≥ 4 lettres, donc la précision sur
 * les mots courts arabes reste intacte et l'exact garde toujours le dessus.
 */
interface CardScore {
  score: number;
  /** R5 : true si AU MOINS une preuve EXACTE (alias/titre mot-entier, ou mot-clé
   *  présent tel quel). false quand le score ne vient QUE d'appariements inexacts
   *  (faute de frappe, recouvrement partiel, synonyme) → confiance plafonnée. */
  exact: boolean;
}

function scoreCardContent(
  norm: string,
  inputTokens: string[],
  card: KnowledgeCard,
  activeGroups: Set<string>,
): CardScore {
  let contentScore = 0;
  let exact = false;

  for (const alias of card.aliases) {
    const na = normalizeArabic(alias);
    if (!na || na.length < 2) continue;
    if (includesAsWord(norm, na)) {
      contentScore += 100 + na.length;
      exact = true;
    } else if (na.length >= 4 && tokenOverlapRatio(inputTokens, na) >= 0.75) {
      contentScore += 60;
    }
  }

  const nt = normalizeArabic(card.title);
  if (nt && nt.length >= 2) {
    if (includesAsWord(norm, nt)) {
      contentScore += 50;
      exact = true;
    } else if (nt.length >= 4 && tokenOverlapRatio(inputTokens, nt) >= 0.6) {
      contentScore += 25;
    }
  }

  let keywordHits = 0;
  for (const kw of card.keywords) {
    const nk = normalizeArabic(kw);
    if (nk.length < 2) continue;
    if (inputTokens.includes(nk) || includesAsWord(norm, nk)) {
      keywordHits += 1;
      exact = true;
    } else if (nk.length >= 4 && inputTokens.some((it) => fuzzyTokenEquals(it, nk))) {
      keywordHits += 1; // mot-clé mono-mot tapé avec une faute de frappe
    } else if (keywordHitViaSynonym(nk, activeGroups)) {
      keywordHits += 1; // R3 : forme synonyme du mot-clé présente dans la question
    }
  }
  contentScore += keywordHits * 8;

  return { score: contentScore, exact };
}

export function findBestKnowledgeCard(input: string, activeDomainId: number | null): KnowledgeCard | null {
  return findBestKnowledgeCardScored(input, activeDomainId)?.card ?? null;
}

/**
 * SEGMENTATION DES PRÉFIXES INTERROGATIFS COLLÉS (sonde audit « Opus 5 High »,
 * 16/10/2026 — reproduction locale : sonde 32 cas, verrou tuteurMahoSegmentation).
 *
 * « ماهو » collé (orthographe clavier ultra-courante) produisait un token de
 * 4 lettres que la tolérance aux fautes rapprochait de l'alias « موهو »
 * (discontinuité de Moho, fiche géologie) : Levenshtein(ماهو→موهو)=1 ≤ budget
 * d'un token de 4 lettres → alias-overlap 1,00 → +60 pts → 9 notions sur 16
 * recevaient بنية الكرة الأرضية à 70 % de confiance — y compris quand
 * l'orthographe propre « ما هو » donnait la bonne carte. Le mot interrogatif
 * choisissait une carte À LA PLACE de l'élève.
 *
 * La segmentation rend le préfixe à des mots-outils (ما/هو، ما/هي) que
 * AR_STOPWORDS filtre ensuite ; l'alias « موهو » reste atteignable par les
 * vraies questions tectoniques, et le garde-fou B3 (« ماهو اللب » → fiche du
 * noyau) est préservé car « اللب » matche toujours mot-entier.
 */
export function segmenterPrefixesInterrogatifs(norm: string): string {
  return norm.replace(/(^|\s)ماهو/g, '$1ما هو').replace(/(^|\s)ماهي/g, '$1ما هي');
}

/** Variante scorée (R4 audit/G4) : permet d'alimenter `confidence` partout. */
function findBestKnowledgeCardScored(
  input: string,
  activeDomainId: number | null,
): { card: KnowledgeCard; score: number; exact: boolean } | null {
  const norm = segmenterPrefixesInterrogatifs(normalizeArabic(input));
  if (!norm || norm.length < 2) return null;
  const inputTokens = tokenizeArabic(norm);
  const activeGroups = activeSynonymGroups(norm);
  let best: KnowledgeCard | null = null;
  let bestRankingScore = 0;
  let bestContentScore = 0;
  let bestExact = false;

  for (const card of KNOWLEDGE_CARDS) {
    const { score: contentScore, exact } = scoreCardContent(norm, inputTokens, card, activeGroups);
    const domainBonus = (activeDomainId != null && card.domainId === activeDomainId) ? 5 : 0;
    const rankingScore = contentScore + domainBonus;

    if (rankingScore > bestRankingScore) {
      bestRankingScore = rankingScore;
      bestContentScore = contentScore;
      bestExact = exact;
      best = card;
    }
  }

  if (best && bestContentScore >= 8) return { card: best, score: bestContentScore, exact: bestExact };
  return null;
}

/**
 * Confiance calibrée (R5 audit 2026-09-29). Deux principes :
 *   1. MONOTONE avec la force de la preuve : plus le score est élevé, plus la
 *      confiance l'est (alias/titre exact > plusieurs mots-clés > un seul).
 *   2. HONNÊTE sur la nature de la preuve : un match obtenu uniquement par
 *      appariement INEXACT (faute de frappe, recouvrement partiel, synonyme)
 *      est plafonné à 70 — on ne revendique jamais une haute confiance sur une
 *      correspondance approximative. Aligne le plafond sur la recherche brute.
 */
function confidenceFromCardScore(score: number, exact: boolean): number {
  if (!exact) return score >= 30 ? 70 : 65;
  if (score >= 100) return 92;
  if (score >= 50) return 85;
  if (score >= 30) return 80;
  return 75;
}

export function startDiagnostic(session: BotSession): EngineResult {
  const domainId = session.activeDomainId;
  const domain = DOMAINS.find((d) => d.id === domainId);
  if (domainId == null || !domain) {
    return { session, action: { text: 'اختر مجالاً أولاً لبدء التشخيص.', quickActions: DOMAINS.map((d) => d.title) } };
  }
  const questions = getQuestionsForDomain(domainId);
  if (questions.length === 0) {
    return { session, action: { text: 'لا توجد أسئلة لهذا المجال بعد.', quickActions: ['العودة للقائمة الرئيسية'] } };
  }
  const first = questions[0];
  const newSession = startQuiz(session, questions.length, first.id, 'diagnostic');
  const text = `🩺 بدأ التشخيص في مجال **${domain.title}**.\n` + `أجب عن ${questions.length} سؤالاً واحداً تلو الآخر. اختر A أو B أو C أو D.`;
  return { session: newSession, action: { text, quiz: toQuizPrompt(first), quickActions: [] } };
}

export function reviewMistakes(session: BotSession): EngineResult {
  if (session.mistakes.length === 0) {
    return { session, action: { text: '✅ لا توجد أخطاء مسجلة لديك بعد. واصل التدريب لتسجيل نقاط ضعفك ومعالجتها!', quickActions: ['العودة للقائمة الرئيسية'] } };
  }
  const cards = session.mistakes.map((id) => getCardById(id)).filter((c): c is KnowledgeCard => Boolean(c));
  const bacDone = session.completedBac.length;
  const text = '📌 هذه المواضيع التي سجلت أخطاءً فيها:\n' + cards.map((c, i) => `${i + 1}. ${c.title} (${c.aliases[0]})`).join('\n') + '\n\nراجع كل موضوع لترسيخه قبل إعادة الاختبار.' + (bacDone > 0 ? `\n\n🏆 تحديات BAC مكتملة: ${bacDone}` : '');
  const quickActions = [...cards.map((c) => `راجع ${c.title}`), 'إعادة الاختبار التشخيصي', 'العودة للقائمة الرئيسية'];
  return { session, action: { text, quickActions } };
}

/**
 * COACH (2026-10-12) — « un vrai coach SVT BAC » : dire à l'élève où il en est,
 * sans détour, et quoi faire ensuite.
 *
 * Si l'élève nomme une unité (« ما مستواي في تركيب البروتين »), le coach répond
 * pour CETTE unité — c'est la demande « dites-moi si je suis faible ou fort dans
 * CE cours ». Sinon, vue d'ensemble avec les trois unités à travailler d'abord
 * (classées par poids au BAC).
 *
 * Aucune note inventée : tout est dérivé du store du parcours
 * (src/lib/coach/diagnostic.ts). On ne félicite pas et on ne dramatise pas :
 * verdict brut + action concrète. Une unité dont les leçons sont lues mais dont
 * le جسر n'est pas passé ne peut pas être « forte » — la lecture n'est pas la
 * preuve.
 */
/**
 * Audit Capitaine 2026-10-17 (§1, P0) : un seul endroit décide des libellés des
 * raccourcis du coach — le moteur les ÉMET depuis ces constantes, la vue les
 * ROUTE sur les mêmes constantes. Avant : libellés retapés à la main dans
 * AITutorView ; « حدّث تشخيصي » et « المهمة اليومية » partaient en texte libre
 * générique (« خارج قاعدة البيانات ») au lieu d'exécuter leur promesse.
 */
export const ACTIONS_COACH = {
  /** Préfixe suivi du titre d'unité : `اشرح 2. تركيب البروتين`. */
  expliquerUnite: 'اشرح ',
  actualiserDiagnostic: 'حدّث تشخيصي',
  missionQuotidienne: 'المهمة اليومية',
} as const;

/**
 * Résout l'unité du parcours dont le titre (normalisé, sans numéro) figure
 * dans le texte — même règle de match que diagnosticCoach (l.1382-1390).
 * Sert à router le raccourci « اشرح <unité> » vers le vrai contenu.
 */
export function uniteParTitre(texte: string): { unitId: number; titre: string } | null {
  const q = normalizeArabic(texte).toLowerCase();
  const titreNu = (t: string) =>
    normalizeArabic(t).toLowerCase().replace(/^\s*\d+\.?\s*/, '').trim();
  const unite = PARCOURS_DOMAINS.flatMap((d) => d.units).find((u) => {
    const t = titreNu(u.title);
    return t.length >= 6 && q.includes(t);
  });
  return unite ? { unitId: unite.unitId, titre: unite.title } : null;
}

/**
 * Première leçon d'une unité du parcours (les jalons sont exclus : « اشرح »
 * vise le contenu du cours, pas l'évaluation de fin d'unité).
 */
export function premiereLeconDeUnite(
  unitId: number,
): { lessonKey: string; lessonKind: 'html' | 'active'; unitId: number } | null {
  const unite = PARCOURS_DOMAINS.flatMap((d) => d.units).find((u) => u.unitId === unitId);
  if (!unite) return null;
  const lecon = unite.items.find((it) => it.kind === 'lesson' && it.lessonKey && it.lessonKind);
  return lecon && lecon.lessonKey && lecon.lessonKind
    ? { lessonKey: lecon.lessonKey, lessonKind: lecon.lessonKind, unitId }
    : null;
}

export function diagnosticCoach(session: BotSession, rawInput?: string): EngineResult {
  const state = loadParcours();
  const groupes = PARCOURS_DOMAINS.flatMap((d) => d.units);

  // Unité explicitement nommée par l'élève (match sur le titre normalisé).
  // Les titres du parcours sont numérotés (« 1. تركيب البروتين ») : on retire le
  // préfixe, sinon « ما مستواي في تركيب البروتين » ne matcherait jamais.
  const normQ = rawInput ? normalizeArabic(rawInput).toLowerCase() : '';
  const titreNu = (t: string) =>
    normalizeArabic(t).toLowerCase().replace(/^\s*\d+\.?\s*/, '').trim();
  const ciblee = normQ
    ? groupes.find((u) => {
        const t = titreNu(u.title);
        return t.length >= 6 && normQ.includes(t);
      })
    : undefined;

  const diags = classerParUrgence(
    // Audit Capitaine §2 : le diagnostic consulte l'agrégat اختبار الكتاب
    // (scoreLivreUnite) — une unité dont le livre est réussi n'est plus
    // affichée « حصيلة الوحدة: — » ; le جسر garde la priorité (côté coach).
    diagnostiquerParcours(groupes, state, scoreLivreUnite),
    (unitId) => UNIT_BAC_WEIGHT.get(unitId) ?? 1,
  );

  if (ciblee) {
    const d = diags.find((x) => x.unitId === ciblee.unitId)!;
    const text =
      `🎓 **تشخيص الوحدة: ${d.titre}**\n\n${ligneCoach(d)}\n\n` +
      (d.score === null
        ? 'لا توجد نتيجة مسجّلة بعد في هذه الوحدة — اقرأ الدروس ثم اجتز اختبار الحصيلة.'
        : '');
    return {
      session,
      action: {
        text,
        quickActions: [
          `${ACTIONS_COACH.expliquerUnite}${d.titre}`,
          ACTIONS_COACH.actualiserDiagnostic,
          ACTIONS_COACH.missionQuotidienne,
          'العودة للقائمة الرئيسية',
        ],
      },
    };
  }

  const compte = (v: string) => diags.filter((d) => d.verdict === v).length;
  const entete =
    `🎓 **تشخيص مستواك** — ${diags.length} وحدة\n` +
    `قوي: ${compte('fort')} · متوسط: ${compte('moyen')} · ضعيف: ${compte('faible')} · لم تبدأ: ${compte('non_commence')}`;

  const priorite = diags.slice(0, 3).filter((d) => d.verdict !== 'fort');
  const lignes = priorite.map((d) => ligneCoach(d)).join('\n\n');

  const conseil = priorite.length === 0
    ? '🎉 كل وحدة بدأتها على مستوى قوي. احتفظ بالإيقاع: مراجعة خفيفة كل يوم أفضل من حصص طويلة متباعدة.'
    : `📌 ابدأ بهذه الوحدات بالترتيب — لها أكبر أثر على معدلك.\n\n${lignes}`;

  const text = `${entete}\n\n${conseil}`;

  const quickActions = [
    ...priorite.map((d) => `${ACTIONS_COACH.expliquerUnite}${d.titre}`),
    ACTIONS_COACH.actualiserDiagnostic,
    ACTIONS_COACH.missionQuotidienne,
    'العودة للقائمة الرئيسية',
  ];

  return {
    session,
    action: { text, quickActions },
  };
}


export function gradeQuizAnswer(session: BotSession, rawAnswer: string): EngineResult {
  const current = session.currentQuiz;
  if (!current) return { session, action: { text: 'لا يوجد اختبار جارٍ حالياً.', quickActions: ['العودة للقائمة الرئيسية'] } };
  const question = getQuestionById(current.questionId);
  if (!question) return { session, action: { text: 'تعذر العثور على السؤال.', quickActions: ['العودة للقائمة الرئيسية'] } };
  const view = shuffledView(question); // même ordre mélangé que le prompt affiché
  const selected = parseAnswer(rawAnswer);
  if (selected === null) return { session, action: { text: '⚠️ الرجاء اختيار إجابة بكتابة A أو B أو C أو D (أو 1، 2، 3، 4).', quiz: toQuizPrompt(question), quickActions: [] } };
  const isCorrect = selected === view.correctIndex;
  const mistake = getMistakeById(question.commonMistakeId);
  let text: string;
  if (isCorrect) {
    text = `✅ إجابة صحيحة!\n\n${question.explanation}`;
  } else {
    text = `❌ إجابة خاطئة.\nالإجابة الصحيحة هي: ${view.options[view.correctIndex]}\n\n${question.explanation}`;
    if (mistake) text += `\n\n⚠️ خطأ شائع: ${mistake.mistake}\n✅ التصحيح: ${mistake.correction}`;
  }
  const questions = getQuestionsForDomain(question.domainId);
  const idx = questions.findIndex((q) => q.id === question.id);
  const nextQ = idx >= 0 ? questions[idx + 1] : undefined;
  const nextId = nextQ ? nextQ.id : null;
  const correctCount = current.correctAnswers + (isCorrect ? 1 : 0);
  const total = current.totalQuestions;
  // F10 (audit Morchid 2026-09-26) : la mission quotidienne promet +15 XP mais
  // son QCM de consolidation n'était même pas démarré (getDailyMission ne
  // positionnait jamais currentQuiz → « لا يوجد اختبار جارٍ حالياً »), et la
  // mission n'était jamais clôturée. On capture l'id AVANT recordQuizAnswer,
  // qui vide currentQuiz à la dernière question.
  const missionTopicId = current.missionTopicId ?? null;
  let newSession = recordQuizAnswer(session, isCorrect, question.topicId, nextId);
  let quiz: QuizPrompt | undefined;
  if (newSession.currentQuiz && nextQ) {
    quiz = toQuizPrompt(nextQ);
  } else {
    const pct = total > 0 ? Math.round((correctCount / total) * 100) : 0;
    const appreciation = pct === 100 ? 'ممتاز 🏆' : pct >= 50 ? 'جيد 👍' : 'يحتاج مراجعة 📖';
    text += `\n\n📊 نتيجتك النهائية: ${correctCount}/${total} (${pct}%).\nالتقدير: ${appreciation}.`;
    quiz = undefined;
    if (missionTopicId) {
      // Clôture la mission (anti-rejoue le même jour) — l'XP promis est versé
      // à l'ACHÈVEMENT, pas à la réussite, exactement comme l'affiche le
      // message « المكافأة: +15 XP ». lastMissionDate verrouille le lendemain.
      newSession = completeDailyMission(newSession, missionTopicId);

      // ── R10 (audit Morchid 2026-10-01, master 3e970d2) : on célèbre le
      // GAIN, pas la présence. On nomme le point-clé maîtrisé (ou, en cas
      // d'échec, le point-clé à reprendre demain) : le cerveau retient ce
      // qu'on nomme, pas ce qu'on félicite.
      const missionCard = getCardById(missionTopicId);
      const masteredKeyPoint = missionCard?.keywords?.[0] ?? missionCard?.title ?? '';
      if (correctCount > 0) {
        text += `\n\n🎯 **مهمة اليوم مكتملة!** كسبت ${MISSION_XP} XP. ⚡\n`;
        text += `✅ لقد ثبّتت الآن نقطة مفتاحية واحدة: **${masteredKeyPoint}**.\n`;
        text += `غداً سنبني عليها نقطة جديدة. عُد كل يوم لتثبيت نقطة واحدة. 📈`;
      } else {
        text += `\n\n🎯 **مهمة اليوم مكتملة** (كسبت ${MISSION_XP} XP). ⚡\n`;
        text += `⚠️ النقطة المفتاحية **${masteredKeyPoint}** لم تثبّت بعد.\n`;
        text += `لا بأس — غداً سنعيد التثبيت عليها بطريقة أبسط. التقدّم ليس خطاً مستقيماً. 📈`;
      }
    }
  }
  const quickActions = quiz === undefined ? ['راجع أخطائي السابقة', 'اعاده الاختبار التشخيصي', 'العودة للقائمة الرئيسية'] : [];
  const domain = DOMAINS.find((d) => d.id === question.domainId);
  const reward = quiz === undefined
    ? missionTopicId
      ? { xpGained: MISSION_XP, score: correctCount, total, kind: 'mission' as const, domain: domain?.title ?? '' }
      : { xpGained: correctCount * 10, score: correctCount, total, kind: 'quiz' as const, domain: domain?.title ?? '' }
    : undefined;
  return { session: newSession, action: { text, quiz, quickActions, reward } };
}

export function startBossFight(session: BotSession): EngineResult {
  const domainId = session.activeDomainId;
  const scenarios = getBossScenariosForDomain(domainId);
  const domain = DOMAINS.find((d) => d.id === domainId);
  if (domainId == null || !domain) return { session, action: { text: 'اختر مجالاً أولاً لبدء تحدي BAC.', quickActions: DOMAINS.map((d) => d.title) } };
  if (scenarios.length === 0) return { session, action: { text: 'لا يوجد تحدي BAC لهذا المجال بعد.', quickActions: ['العودة للقائمة الرئيسية'] } };
  const first = scenarios[0];
  const newSession = startBossFightSession(session, first.id, scenarios.length);
  const replay = session.completedBac.includes(String(domainId));
  // KEO-106 : le contrat du verbe de consigne s'affiche AVANT que l'élève
  // écrive — ce que le verbe paie, ce qu'il interdit.
  const firstContract = detectConsigneVerb(normalizeArabic(first.situation));
  const text = `⚔️ **تحدي BAC** — مجال ${domain.title}\n` +
    (replay ? '🏆 سبق إتمامك هذا التحدي — إعادة بدون XP إضافي.\n' : '') +
    `ستُطرح عليك ${scenarios.length} وضعيات مشكلة. اكتب إجابتك وسيقوّمها المرشد آلياً وفق النقاط الأساسية.\n\n${first.situation}\n\n` +
    (firstContract ? `${verbContractLine(firstContract)}\n\n` : '') +
    '📝 اكتب إجابتك — لن أعرض التصحيح قبل محاولتين حقيقيتين («لا أعرف» يعطيك مفتاحاً، لا حلّاً).';
  return { session: newSession, action: { text, quickActions: ['لا أعرف'], sources: [{ type: 'domain' as SourceType, title: 'تحدي BAC' }] } };
}

/**
 * Auto-évaluation honnête (recommandation audit #3) : la couverture des
 * points-clés du scénario par la réponse remplace l'auto-note (+10/+5/0)
 * que l'élève se donnait lui-même — l'XP n'est plus fermable au clic.
 * Barème : ≥ 50 % des mots-clés couverts = 10 pts · ≥ 20 % = 5 pts · sinon 0.
 */
/** Un point-clé est couvert s'il apparaît dans une clause NON réfutée, et sans
 *  inversion de polarité par rapport au point-clé attendu (si l'attendu dit
 *  « لا تنتقل », une réponse « لا تنتقل » reste juste).
 *  Implémentation : lib/validation/negationAr.ts (fusion master 3e970d2 —
 *  primitives partagées avec le scorer C2 de Tadwin). */
function tokenAffirmed(normAnswer: string, token: string, normKp: string): boolean {
  return tokenAffirme(normAnswer, token, normKp);
}

/**
 * KEO-107 / N5 (bilan de vérité 2026-10-01) : notation détaillée d'une réponse
 * ouverte. En plus du score, on rapporte les points-clés « mentionnés mais
 * niés/inversés » — l'élève qui écrit « ليس صحيحاً أن… » en recopiant les
 * mots-clés doit savoir QUE sa réponse contredisait l'attendu, pas seulement
 * qu'il a eu 0. `gradeKeyPoints` (ci-dessous) garde le même barème exact.
 */
function gradeKeyPointsDetail(answer: string, keyPoints: string[]): { score: number; inverted: string[]; missed: string[] } {
  const normAnswer = normalizeArabic(answer);
  const tokens = new Set(tokenizeArabic(normAnswer).filter((t) => t.length >= 3));
  if (tokens.size === 0) return { score: 0, inverted: [], missed: [...keyPoints] };
  // token -> point-clé normalisé qui l'a produit (pour la comparaison de polarité)
  const expected = new Map<string, string>();
  for (const kp of keyPoints) {
    const nk = normalizeArabic(kp);
    for (const t of tokenizeArabic(nk)) {
      if (t.length >= 3 && !expected.has(t)) expected.set(t, nk);
    }
  }
  if (expected.size === 0) return { score: 0, inverted: [], missed: [] };
  let hits = 0;
  const invertedNorms = new Set<string>();
  for (const [t, nk] of expected) {
    if (tokenAffirmed(normAnswer, t, nk)) hits += 1;
    else if (normAnswer.includes(t)) invertedNorms.add(nk); // mentionné, jamais affirmé
  }
  const coverage = hits / expected.size;
  let score = coverage >= 0.5 ? 10 : coverage >= 0.2 ? 5 : 0;

  // R3 (audit 2026-09-29) : anti-bourrage lexical. La couverture de points-clés
  // pouvait être « farmée » en répétant le même terme (ex. « أنزيم أنزيم أنزيم »).
  // On réutilise le détecteur curé du projet : si la réponse est du bourrage,
  // le score est annulé — on ne récompense pas une copie sans contenu réel.
  if (score > 0 && detecterStuffing(answer).stuffing_detected) score = 0;

  // On ne rapporte que les points-clés réellement présents dans la réponse
  // mais jamais affirmés : la cause exacte du zéro, pas une liste générique.
  const inverted = keyPoints.filter((kp) => invertedNorms.has(normalizeArabic(kp)));
  // KEO-104 : point-clé NON couvert (aucun de ses tokens affirmé) — nourrit
  // le bilan final CAUSE/ACTION/PORTE du défi.
  const missed = keyPoints.filter((kp) => {
    const nk = normalizeArabic(kp);
    const kpTokens = tokenizeArabic(nk).filter((t) => t.length >= 3);
    return kpTokens.length > 0 && !kpTokens.some((t) => tokenAffirmed(normAnswer, t, nk));
  });
  return { score, inverted, missed };
}

function gradeKeyPoints(answer: string, keyPoints: string[]): number {
  return gradeKeyPointsDetail(answer, keyPoints).score;
}

/* -------------------------------------------------------------------------- *
 * KEO-101/102 (bilan de vérité 2026-10-01 — SpecKit #10/#11) : le défi BAC ne
 * délivre plus la correction modèle au premier clic, ni à la première saisie.
 * Contrat du moteur (la règle d'or imprimée par studyGuide.ts — « لا تفتح الحل
 * النموذجي قبل محاولة كتابية حقيقية » — devient une contrainte du code) :
 *   — « لا أعرف » → l'indice suivant (3 max), JAMAIS la correction avant le
 *     3ᵉ indice consommé (score alors plafonné à 3/10) ;
 *   — aucun indice avant 90 s sans tentative écrite ;
 *   — une saisie < 15 caractères utiles n'est pas une tentative ;
 *   — 2 tentatives réelles débloquent la correction avec score plein.
 * -------------------------------------------------------------------------- */
const MIN_ATTEMPT_CHARS = 15;
const MIN_ELAPSED_BEFORE_HINT_MS = 90_000;
const MAX_HINTS = 3;
/** Score plafonné quand la correction est débloquée par la voie des indices. */
const HINT_PATH_CAP = 3;

/** Caractères « utiles » d'une saisie : lettres et chiffres, sans espaces ni
 *  ponctuation — « نعم !!! » ne fait pas une tentative. */
function usefulChars(raw: string): number {
  return (raw.match(/[\p{L}\p{N}]/gu) || []).length;
}

/** Masque ~2/3 de chaque mot d'un point-clé : l'élève voit la structure de la
 *  réponse attendue, pas son contenu (indice 3/3). */
function maskKeyPoint(kp: string): string {
  return kp
    .split(/\s+/)
    .map((w) => (w.length <= 3 ? w : w.slice(0, Math.max(2, Math.ceil(w.length / 3))) + '……'))
    .join(' ');
}

/**
 * S-04 (SpecKit 002, master 81984de — fusion 2026-10-01) : type d'erreur.
 * « يحتاج مراجعة » est un adjectif qui ne dit pas quoi soigner.
 * Type R (استرجاع / restitution) : le terme, le lieu ou l'acteur est faux ou
 * absent, et AUCUN document n'était en jeu — le remède est de revoir la fiche.
 * Type A (تحليل / analyse) : un document/courbe/tableau est en jeu, ou la
 * consigne porte un verbe d'exploitation — le remède est une question sur le
 * fait visible. Si les deux sont présents, A l'emporte : le BAC paie
 * l'analyse avant la restitution.
 */
export type ErrorType = 'R' | 'A';

const VERBES_ANALYSE = ['حلل', 'استخرج', 'استنتج', 'قارن', 'علل', 'اقترح', 'فسر'];
const SIGNAUX_DOCUMENT = ['الوثيقه', 'المنحنى', 'الجدول', 'المخطط', 'الرسم', 'بكتروفور', 'هجره', 'وثيق'];

export function classifyError(
  rawInput: string,
  scenario: { keyPoints: string[]; situation?: string } | null,
): ErrorType {
  const norm = normalizeArabic(rawInput);
  const contexte = normalizeArabic(scenario?.situation ?? '');
  const consigne = norm + ' ' + contexte;
  const aDocument = SIGNAUX_DOCUMENT.some((sg) => consigne.includes(normalizeArabic(sg)));
  const aVerbe = VERBES_ANALYSE.some((v) => norm.includes(normalizeArabic(v)));
  if (aDocument || aVerbe) return 'A';
  return 'R';
}

/** S-04 : le message de typage, une ligne, avant tout contenu. */
export function errorTypeLine(t: ErrorType): string {
  return t === 'A'
    ? '🩺 **النوع:** خطأ في **التحليل**، لا في الاسترجاع — معارفك حاضرة، والمشكلة في قراءة الوثيقة أو ربط السبب بالنتيجة.'
    : '🩺 **النوع:** خطأ في **الاسترجاع**، لا في التحليل — المصطلح أو المكان غير مثبّت بعد.';
}

/* -------------------------------------------------------------------------- *
 * KEO-106 (SpecKit 2026-10-01) : contrat du VERBE DE CONSIGNE. La regex de
 * causalité existait (answerStructureCheck.ts) mais n'était pas branchée sur
 * le tuteur. Ici : détection du verbe dans l'énoncé, contrat affiché AVANT
 * que l'élève écrive, puis conformité vérifiée sur la réponse.
 * -------------------------------------------------------------------------- */
/** Connecteurs causaux — formes NORMALISÉES (normalizeArabic retire la
 *  tashkeel : «لأنّ» → «لان»). Alignés sur la regex CAUSALITE du correcteur. */
// NORMALISÉS via normalizeArabic (ؤ→و : «مما يؤدي» → «مما يودي», ة→ه…) pour
// matcher le texte de l'élève déjà normalisé.
const CAUSAL_CONNECTORS = [
  'لأنّ', 'بسبب', 'يعود ذلك', 'يرجع ذلك', 'نتيجة ل', 'مما يؤدي', 'يفسّر ذلك', 'وذلك ل',
].map(normalizeArabic);

interface VerbContract {
  /** forme normalisée cherchée dans l'énoncé (normalizeArabic). */
  verb: string;
  /** forme vocalisée affichée à l'élève. */
  labelAr: string;
  /** contrat en 2 lignes : ce que le verbe paie / ce qu'il interdit. */
  contractAr: string;
  causal: 'required' | 'forbidden' | null;
}

/** Ordre = priorité de détection (فسّر avant استنتج avant بيّن : «بين» est
 *  aussi une préposition — on ne le retient qu'en dernier recours). */
const VERB_CONTRACTS: VerbContract[] = [
  { verb: 'فسر', labelAr: 'فسّر', contractAr: 'يُطلب: رابط سببي إجباري («لأنّ» / «بسبب» / «يعود ذلك إلى»)\nيُمنع: البقاء في الوصف', causal: 'required' },
  { verb: 'علل', labelAr: 'علّل', contractAr: 'يُطلب: تعليل بمعرفة من الدرس («يعود ذلك إلى…»)\nيُمنع: الوصف المجرد', causal: 'required' },
  { verb: 'برر', labelAr: 'برّر', contractAr: 'يُطلب: حجّة علمية من الدرس\nيُمنع: التأكيد دون سبب', causal: 'required' },
  { verb: 'حلل', labelAr: 'حلّل', contractAr: 'يُطلب: وصف + مقارنة + تغيّرات بالأرقام\nيُمنع: التعليل («لأنّ») — التحليل لا يفسّر', causal: 'forbidden' },
  { verb: 'استخرج', labelAr: 'استخرج', contractAr: 'يُطلب: معطى من الوثيقة كما هو\nيُمنع: كل تفسير أو تعليل', causal: 'forbidden' },
  { verb: 'قارن', labelAr: 'قارن', contractAr: 'يُطلب: طرفان + عناصر مقارنة + فرق صريح\nيُمنع: وصف طرف واحد', causal: null },
  { verb: 'اقترح', labelAr: 'اقترح', contractAr: 'يُطلب: فرضية قابلة للدحض + اختبار ممكن\nيُمنع: تأكيد غير قابل للاختبار', causal: null },
  { verb: 'استنتج', labelAr: 'استنتج', contractAr: 'يُطلب: علاقة أو آلية في جملة واحدة\nيُمنع: إعادة وصف المعطيات', causal: null },
  { verb: 'صف', labelAr: 'صِف', contractAr: 'يُطلب: وصف مباشر لما تُظهره الوثيقة\nيُمنع: التفسير («لأنّ»)', causal: 'forbidden' },
  { verb: 'بين', labelAr: 'بيّن', contractAr: 'يُطلب: شرح الآلية بمراحلها وربط منطقي («مما يؤدي» / «وذلك لـ»)\nيُمنع: الاكتفاء بالوصف', causal: 'required' },
];

function detectConsigneVerb(normSituation: string): VerbContract | null {
  for (const c of VERB_CONTRACTS) {
    if (normSituation.includes(c.verb)) return c;
  }
  return null;
}

function hasCausalConnector(normAnswer: string): boolean {
  return CAUSAL_CONNECTORS.some((c) => normAnswer.includes(c));
}

function verbContractLine(c: VerbContract): string {
  return `📜 **عقد الفعل «${c.labelAr}»:**\n${c.contractAr}`;
}

/** KEO-104 (SpecKit 2026-10-01) : porte vers la leçon exacte. Recherche dans
 *  l'index des leçons (lessonIndexRuntime — Phase A bundle) par recouvrement
 *  de tokens (titre + alias + mots-clés) du point-clé manqué. Aucun lien
 *  inventé : index pas encore chargé ou rien ne recoupe → null, on le dit. */
function findLessonForKeyPoint(kp: string): { lessonKey: string; title: string } | null {
  const nk = normalizeArabic(kp);
  const tokens = tokenizeArabic(nk).filter((t) => t.length >= 4);
  if (tokens.length === 0) return null;
  const indexActif = lessonIndexSiChargee();
  if (!indexActif) return null;
  let best: { lessonKey: string; title: string; score: number } | null = null;
  for (const entry of indexActif) {
    const hay = normalizeArabic(
      entry.title + ' ' + (entry.aliases ?? []).join(' ') + ' ' + (entry.keywords ?? []).join(' '),
    );
    let score = 0;
    for (const t of tokens) {
      if (hay.includes(t)) score += 1;
    }
    if (score > 0 && (!best || score > best.score)) {
      best = { lessonKey: entry.lessonKey, title: entry.title, score };
    }
  }
  return best ? { lessonKey: best.lessonKey, title: best.title } : null;
}

type BossScenarioT = NonNullable<ReturnType<typeof getBossScenarioById>>;

/** Les trois indices progressifs : I1 verbe de consigne, I2 squelette de
 *  phrase, I3 premier point-clé partiellement masqué. */
function bossHint(scenario: BossScenarioT, level: 1 | 2 | 3): string {
  if (level === 1) {
    return (
      '🔑 **مفتاح 1/3:** عد إلى التعليمة وحدّد الفعل المطلوب — استخراج، تحليل، أم تفسير؟\n' +
      'الفعل يحدّد شكل الجواب: «استخرج» = معطى من الوثيقة فقط، «فسّر» = رابط بـ «لأنّ».\n\n' +
      '✍️ اكتب جملة واحدة تناسب الفعل، ولو كانت ناقصة.'
    );
  }
  if (level === 2) {
    return (
      '🔑 **مفتاح 2/3:** أكمل الجملة التالية بمعطيات الوثيقة فقط:\n' +
      '« انطلاقًا من الوثيقة، نلاحظ أنّ ……… »\n\n' +
      '✍️ جملة واحدة تكفي — التفسير يأتي بعدها.'
    );
  }
  return (
    '🔑 **مفتاح 3/3 (الأخير):** النقطة الأساسية الأولى تبدأ هكذا:\n' +
    `« ${maskKeyPoint(scenario.keyPoints[0] ?? '')} »\n\n` +
    '✍️ أكملها بأسلوبك — أو اطلب التصحيح ولن تتجاوز 3/10.'
  );
}

/** Livre la correction DÉBLOQUÉE (2 tentatives ou 3 indices) et enchaîne sur
 *  la question suivante ou le bilan final. Inclut le feedback d'inversion
 *  KEO-107 (un zéro causé par une réponse qui nie l'attendu est nommé) et,
 *  depuis le LOT 2, le bilan CAUSE/ACTION/PORTE de KEO-104 : aucune note
 *  sans cause nommée, action ≤ 15 minutes et porte vers la leçon exacte. */
function deliverBossCorrection(
  session: BotSession,
  scenario: BossScenarioT,
  lastAnswer: string,
  capPoints: boolean
): EngineResult {
  const boss = session.boss!;
  const graded = gradeKeyPointsDetail(lastAnswer, scenario.keyPoints);
  const points = capPoints ? Math.min(graded.score, HINT_PATH_CAP) : graded.score;
  let correctionText =
    `✅ **التصحيح النموذجي**\n\n${scenario.correction}\n\n🔑 **النقاط الأساسية:**\n${scenario.keyPoints.map((p) => `- ${p}`).join('\n')}` +
    `\n\n🎯 نقاطك لهذه الوضعية: ${points}/10`;
  if (graded.inverted.length > 0) {
    correctionText +=
      `\n\n⚠️ **انتبه:** إجابتك ذكرت النقطة التالية لكنّها نَفَتْها بدل أن تُثبتها:\n« ${graded.inverted[0]} »\nالمنتظَر هو الإثبات لا النفي — الكلمة المفتاحية وحدها لا تكسب النقطة.`;
  }
  const scenarios = getBossScenariosForDomain(session.activeDomainId);
  const idx = scenarios.findIndex((s) => s.id === boss.scenarioId);
  const next = idx >= 0 ? scenarios[idx + 1] : undefined;
  if (next) {
    // KEO-104 : les points manqués s'accumulent sur TOUT le défi.
    const withMissed: BotSession = {
      ...session,
      boss: { ...boss, missedKeyPoints: [...(boss.missedKeyPoints ?? []), ...graded.missed] },
    };
    const newSession = startBossStep(withMissed, points, next.id, boss.questionIndex + 1);
    // KEO-106 : le contrat du verbe de la situation SUIVANTE s'affiche avant
    // que l'élève écrive.
    const nextContract = detectConsigneVerb(normalizeArabic(next.situation));
    const text =
      `${correctionText}\n\n➡️ **السؤال التالي (${boss.questionIndex + 2}/${boss.totalQuestions})**\n\n${next.situation}\n\n` +
      (nextContract ? `${verbContractLine(nextContract)}\n\n` : '') +
      '📝 اكتب إجابتك — لن أعرض التصحيح قبل محاولتين حقيقيتين («لا أعرف» يعطيك مفتاحاً، لا حلّاً).';
    return { session: newSession, action: { text, quickActions: ['لا أعرف'], sources: [{ type: 'domain' as SourceType, title: 'تحدي BAC' }] } };
  }
  const total = boss.score + points;
  const max = boss.totalQuestions * 10;
  const pct = max > 0 ? Math.round((total / max) * 100) : 0;
  const appreciation = pct >= 80 ? 'ممتاز 🏆' : pct >= 50 ? 'جيد 👍' : 'يحتاج مراجعة 📖';
  // ── KEO-104 : bilan CAUSE / ACTION / PORTE ────────────────────────────────
  const missedAll = [...(boss.missedKeyPoints ?? []), ...graded.missed];
  const freq = new Map<string, number>();
  for (const m of missedAll) freq.set(m, (freq.get(m) ?? 0) + 1);
  let topMissed: string | null = null;
  let topCount = 0;
  for (const [m, c] of freq) {
    if (c > topCount) {
      topMissed = m;
      topCount = c;
    }
  }
  const causeBlock = topMissed
    ? `🔍 **السبب المسمّى:** في ${topCount} وضعيات، غابت عن إجابتك النقطة:\n« ${topMissed} »`
    : '🔍 **السبب المسمّى:** لم تغب أيّ نقطة أساسية عن إجاباتك — عمل متقن.';
  const actionBlock = topMissed
    ? `🎯 **عملك الآن (10 دقائق):** أعد كتابة الوضعية ${boss.questionIndex + 1} وأضف سطراً واحداً يبدأ بـ «ومنه نستنتج أنّ…» يغطّي النقطة الغائبة.`
    : '🎯 **عملك الآن:** انتقل إلى تحدّي المجال الموالي للحفاظ على هذا المستوى.';
  const lesson = topMissed ? findLessonForKeyPoint(topMissed) : null;
  const porteBlock = topMissed
    ? lesson
      ? `📖 **الدرس المعني:** ${lesson.title} — مفتاح الدرس: \`${lesson.lessonKey}\``
      : '📖 **الدرس المعني:** لا يوجد درس مطابق في فهرسي — لن أخترع لك رابطاً.'
    : '';
  // ──────────────────────────────────────────────────────────────────────────
  // Anti-farm (recommandation audit #4) : l'XP du défi n'est accordé qu'à la
  // PREMIÈRE complétion du domaine — completedBac, jusqu'ici jamais rempli,
  // devient le garde-fou de rejouabilité.
  const domainKey = String(session.activeDomainId ?? '');
  const firstTime = domainKey !== '' && !session.completedBac.includes(domainKey);
  const finished = finishBossFight(session);
  const newSession: BotSession = firstTime
    ? { ...finished, completedBac: [...finished.completedBac, domainKey] }
    : finished;
  saveSession(newSession);
  const domain = DOMAINS.find((d) => d.id === session.activeDomainId);
  // S-04 : le type d'erreur (استرجاع/تحليل) est écrit en premier — avant la
  // cause, l'action et la porte. S-10 : si score < 50 %, le protocole d'étude
  // S'IMPOSE en tête des actions — l'élève qui vient d'échouer en a besoin.
  const errLine = errorTypeLine(classifyError('', scenario));
  const weak = pct < 50;
  const text =
    `🏁 **انتهى تحدي BAC!**\nنتيجتك: ${total}/${max} نقطة (${pct}%).\nالتقدير: ${appreciation}.` +
    `\n${errLine}` +
    `\n\n${causeBlock}\n${actionBlock}` +
    (porteBlock ? `\n${porteBlock}` : '') +
    (firstTime ? '' : '\n\n🏆 سبق إتمامك هذا التحدي — إعادة بدون XP إضافي.');
  return {
    session: newSession,
    action: {
      text,
      quickActions: weak
        ? ['كيف أدرس العلوم؟', 'راجع أخطائي السابقة', 'العودة للقائمة الرئيسية']
        : ['راجع أخطائي السابقة', 'العودة للقائمة الرئيسية'],
      reward: { xpGained: firstTime ? total : 0, score: total, total: max, kind: 'mission', domain: domain?.title ?? '' },
      sources: [{ type: 'domain' as SourceType, title: 'تحدي BAC' }],
    },
  };
}

function handleBossInput(session: BotSession, rawInput: string): EngineResult {
  const boss = session.boss;
  if (!boss) return { session, action: { text: 'لا يوجد تحدي BAC جارٍ.', quickActions: ['العودة للقائمة الرئيسية'] } };
  const scenario = getBossScenarioById(boss.scenarioId);
  if (!scenario) {
    const finished = finishBossFight(session);
    return { session: finished, action: { text: 'انتهى التحدي.', quickActions: ['العودة للقائمة الرئيسية'] } };
  }
  // La phase « eval » (auto-note) n'existe plus : TOUTE saisie passe par la
  // machine KEO-101 ci-dessous — y compris les sessions héritées restées en
  // 'eval' ou sans compteurs (compteurs absents = comportement aménagé).
  const n = normalizeArabic(rawInput);
  const giveUp = n.includes(normalizeArabic('لا أعرف')) || n.includes(normalizeArabic('لم أجب'));
  const hintLevel = boss.hintLevel ?? 0;
  const attempts = boss.attempts ?? 0;
  // Compatibilité : une session antérieure à KEO-101 n'a pas d'horodatage — on
  // ne bloque pas l'élève sur un chrono qui n'a jamais démarré.
  const elapsedMs = boss.openedAt ? Date.now() - boss.openedAt : Number.POSITIVE_INFINITY;

  // 1) «لا أعرف» trop tôt et sans AUCUNE tentative → refus + temps restant
  //    (KEO-102) : la règle d'or des 20-25 min devient un chrono moteur de 90 s.
  if (giveUp && attempts === 0 && hintLevel === 0 && elapsedMs < MIN_ELAPSED_BEFORE_HINT_MS) {
    const restant = Math.max(1, Math.ceil((MIN_ELAPSED_BEFORE_HINT_MS - elapsedMs) / 1000));
    return {
      session,
      action: {
        text:
          '⏱️ لن أعطيك التصحيح الآن — قاعدتي هي قاعدتك: محاولة كتابية حقيقية قبل الحل.\n\n' +
          '✍️ اكتب جملة واحدة، ولو كانت ناقصة أو خاطئة: جوابُك أنت خيرٌ لك من جوابي.\n' +
          `(بعد نحو ${restant} ثانية من التفكير أستطيع أن أعطيك المفتاح الأول.)`,
        quickActions: ['لا أعرف'],
        sources: [{ type: 'domain' as SourceType, title: 'تحدي BAC' }],
      },
    };
  }

  // 2) «لا أعرف» (après le délai, ou suite à une tentative) → indice suivant,
  //    jamais la correction tant que les 3 indices ne sont pas consommés.
  if (giveUp) {
    const nextLevel = hintLevel + 1;
    if (nextLevel <= MAX_HINTS) {
      const newSession = recordBossProgress(session, { hintLevel: nextLevel });
      return {
        session: newSession,
        action: {
          text: bossHint(scenario, nextLevel as 1 | 2 | 3),
          quickActions: ['لا أعرف'],
          sources: [{ type: 'domain' as SourceType, title: 'تحدي BAC' }],
        },
      };
    }
    // 3 indices consommés : la correction se débloque — score plafonné (KEO-101).
    return deliverBossCorrection(session, scenario, rawInput, true);
  }

  // 3) Saisie trop courte pour être une tentative réelle (KEO-101) : «نعم»,
  //    «لا أدري» ou trois lettres ne débloquent rien.
  if (usefulChars(rawInput) < MIN_ATTEMPT_CHARS) {
    return {
      session,
      action: {
        text:
          `✍️ جوابك قصير جداً ليُعدّ محاولة (${MIN_ATTEMPT_CHARS} حرفاً مفيداً على الأقل).\n` +
          'اكتب جملة كاملة ولو كانت ناقصة — سأوجّهك منها دون أن أحلّ مكانك.',
        quickActions: ['لا أعرف'],
        sources: [{ type: 'domain' as SourceType, title: 'تحدي BAC' }],
      },
    };
  }

  // 3-bis) KEO-106 : conformité au CONTRAT DU VERBE de consigne. Un premier
  //  écart est corrigé sans consommer la tentative (l'élève réécrit) ; au
  //  deuxième on avance — trappe anti-frustration, personne ne reste bloqué.
  const contract = detectConsigneVerb(normalizeArabic(scenario.situation));
  if (contract && contract.causal) {
    const causal = hasCausalConnector(n);
    const violating = contract.causal === 'required' ? !causal : causal;
    if (violating && (boss.verbWarnings ?? 0) < 1) {
      const ecart =
        contract.causal === 'required'
          ? 'إجابتك بلا رابط سببي — أنت وصفتَ ولم تُبيّن'
          : 'إجابتك تحتوي «لأنّ» — أنت علّلتَ ولم تنفّذ الفعل المطلوب';
      const newSession = recordBossProgress(session, { verbWarnings: (boss.verbWarnings ?? 0) + 1 });
      return {
        session: newSession,
        action: {
          text:
            `⚠️ **توقّف عند الفعل.**\nالسؤال يقول «${contract.labelAr}»، و${ecart}.\n\n` +
            `${verbContractLine(contract)}\n\n` +
            '👉 أعد كتابة إجابتك وفق العقد — لن أعدّ هذا التحذير محاولة.',
          quickActions: ['لا أعرف'],
          sources: [{ type: 'domain' as SourceType, title: 'تحدي BAC' }],
        },
      };
    }
  }

  // 4) Première tentative réelle : enregistrée, PAS de correction (KEO-101).
  //    L'élève relit, améliore, réessaie — la correction arrive à la 2ᵉ.
  //    KEO-105 : le coaching impose la triade ألاحظ → أستنتج → أخلص.
  if (attempts + 1 < 2) {
    const newSession = recordBossProgress(session, { attempts: attempts + 1 });
    // R1 (master 3e970d2) : la 1ʳᵉ tentative NOMME ce qui manque — sans
    // livrer la correction ni le score. L'élève sait où corriger sa copie.
    const graded = gradeKeyPointsDetail(rawInput, scenario.keyPoints);
    const missedLine =
      graded.missed.length > 0
        ? `🔍 أهم ما نقص من جوابك: **${graded.missed[0]}** — أضِفه في محاولتك الثانية.\n\n`
        : '';
    return {
      session: newSession,
      action: {
        text:
          '📝 **سُجّلت محاولتك الأولى — لن أعرض التصحيح بعد.**\n\n' +
          missedLine +
          (contract
            ? 'هيكل الجواب وفق التثليث: **① ألاحظ** (المعطيات بالأرقام) ← **② أستنتج** (الربط بـ «لأنّ») ← **③ أخلص** («ومنه نستنتج أنّ…»).\n\n'
            : '') +
          'راجع ما كتبت: هل ذكرت معطيات الوثيقة؟ هل وضعت الرابط المنطقي؟\n' +
          '✍️ حسّن إجابتك واكتب المحاولة الثانية — عندها أصحّح وأناقش ما كتبت.\n' +
          '(أو اطلب «لا أعرف» فأعطيك مفتاحاً لا حلّاً.)',
        quickActions: ['لا أعرف'],
        sources: [{ type: 'domain' as SourceType, title: 'تحدي BAC' }],
      },
    };
  }

  // 5) Deuxième tentative réelle : correction + score plein via gradeKeyPoints.
  return deliverBossCorrection(session, scenario, rawInput, false);
}

/** N4 (bilan de vérité 2026-10-01) : première carte du domaine disposant d'au
 *  moins un QCM — pour proposer une alternative TESTABLE quand le sujet demandé
 *  n'en a pas. Jamais une fiche de cours en substitution d'un test. */
function findTestableCard(domainId: number, excludeId: string): KnowledgeCard | null {
  const pool = getQuestionsForDomain(domainId);
  return (
    KNOWLEDGE_CARDS.find(
      (c) => c.domainId === domainId && c.id !== excludeId && pool.some((q) => q.topicId === c.id)
    ) ?? null
  );
}

export function processStudentInput(session: BotSession, rawInput: string): EngineResult {
  const input = (rawInput || '').trim();
  // Sonde audit « Opus 5 High » (16/10/2026) : segmentation DES L'ENTRÉE, avant
  // toute intention/matching — « ماهو كمون العمل » ne doit plus nourrir le
  // moteur d'un token fantôme qui vote géologie. Voir segmenterPrefixesInterrogatifs.
  const norm = segmenterPrefixesInterrogatifs(normalizeArabic(input));
  const n = (s: string) => normalizeArabic(s);

  // S-05 (14/10/2026) : une intention forte ABANDONNE la question en attente.
  // Placé en tête À DESSEIN — plusieurs intentions sont traitées plus haut dans
  // la cascade que le bloc qui écoute la réponse, donc un nettoyage placé plus
  // bas ne s'exécuterait jamais pour elles.
  if ((session.pendingRecallCardId || session.pendingProbeCardId) && estIntentionForte(norm)) {
    session = { ...session, pendingRecallCardId: null, pendingProbeCardId: null };
    saveSession(session);
  }

  if (norm.includes(n('القائمة الرئيسية')) || norm.includes(n('العودة للقائمة')) || norm.includes(n('رجوع للقائمة'))) {
    // B5 (audit Morchid 2026-09-25) : l'accueil réinitialise la NAVIGATION mais
    // préserve le SUIVI — erreurs, défis BAC déjà complétés (garde-fou anti-farm)
    // et date de la mission quotidienne. Sans cela, retourner à l'accueil effaçait
    // completedBac et permettait de re-gagner l'XP d'un défi BAC déjà récompensé.
    const back: BotSession = {
      ...getDefaultSession(),
      mistakes: [...session.mistakes],
      completedBac: [...session.completedBac],
      lastMissionDate: session.lastMissionDate,
    };
    saveSession(back);
    return { session: back, action: { text: '↩️ رجعنا إلى القائمة الرئيسية. اختر مجالاً لبدء جلسة مراجعة:', quickActions: DOMAINS.map((d) => d.title) } };
  }

  // COACH (2026-10-12) : « Quel est mon niveau dans cette unité ? »
  // Volontairement DISTINCT de « اختبار تشخيصي », qui LANCE un test : ici on ne
  // fait rien passer à l'élève, on lit l'état déjà existant.
  // PIÈGE MESURÉ : « مستوي » seul interceptait « مستويات البنية الفراغية » (une
  // vraie question de cours). On exige donc la forme possessive « مستواي » ou un
  // déclencheur explicite — jamais le radical nu.
  if (
    norm.includes(n('مستواي')) ||
    norm.includes(n('نقط ضعفي')) || norm.includes(n('نقط ضعف')) ||
    norm.includes(n('هل انا قوي')) || norm.includes(n('هل انا ضعيف')) ||
    norm.includes(n('وضحي مستواي')) || norm.includes(n('قيم مستواي'))
  ) {
    return diagnosticCoach(session, input);
  }

  if (norm.includes(n('راجع أخطائي'))) return reviewMistakes(session);

  // Navigation domaine : un clic sur un titre de domaine (match EXACT de la
  // question normalisée) doit ouvrir le menu du domaine AVANT les bases
  // sémantiques — les guides « مدخل المجال… » déclarent ces titres comme
  // triggers et interceptaient la navigation (domaines 2/3). Le match exact
  // ne détourne pas les vraies questions (« اشرح لي التكتونية العامة… »).
  if (session.activeDomainId == null && norm.length >= 3) {
    const domain = DOMAINS.find((d) => normalizeArabic(d.title) === norm);
    if (domain) return handleDomainClick(session, domain.id);
  }

  // Priorité absolue : une session active (quiz/boss) doit traiter l'entrée AVANT
  // toute recherche sémantique, sinon une réponse comme "A" est interceptée par un guide.
  if (session.mode === 'bac_challenge' && session.boss) return handleBossInput(session, input);
  if (session.currentQuiz && (session.mode === 'quiz' || session.mode === 'diagnostic')) return gradeQuizAnswer(session, input);

  // KEO-201 (bilan de vérité 2026-10-01) : la détresse court-circuite TOUT —
  // avant l'intention « اختبرني », avant isGibberishInput et avant le filtre
  // OUT_OF_PROGRAM. Un élève qui écrit son angoisse (فصحى ou darija) reçoit la
  // réponse de soutien, jamais le refus « hors programme » ; le filtre anti-bruit
  // (كرة القدم…) reste intact car son vocabulaire ne figure pas dans AFFECT_LEXICON.
  // Morchid v3, M5 (15/10/2026) : la FATIGUE court-circuite pareillement —
  // « راسي يوجعني » était pris par la recherche de contenu (« راسي » ≈ « رأسي »
  // dans une leçon de géologie) et recevait un cours au lieu d'une pause.
  const gesteFatigue = norm.length >= 3 ? gesteFatigueDuMessage(norm) : null;
  if (gesteFatigue) return resultatDuGeste(session, gesteFatigue);
  if (norm.length >= 3 && AFFECT_LEXICON.some((k) => norm.includes(n(k)))) {
    return supportResult(session);
  }

  // KEO-103 (LOT 2) : probe socratique EN ATTENTE — la saisie courante est la
  // tentative de l'élève. Une intention forte (menu, test, défi, révision)
  // libère le probe sans bloquer personne.
  if (session.pendingProbeCardId) {
    const probeCard = getCardById(session.pendingProbeCardId);
    const strongIntent =
      norm.includes(n('القائمة الرئيسية')) || norm.includes(n('اختبرني')) || norm.includes(n('راجع أخطائي')) ||
      norm.startsWith(n('راجع')) || norm.includes(n('تحدي bac')) || norm.includes(n('تحدي البكالوريا'));
    if (probeCard?.probe && !strongIntent && usefulChars(rawInput) >= 2) {
      // Trappe anti-frustration (R2) : « اشرح لي » explicite → contenu complet,
      // journalisé dans probeBypassed (la carte ne re-probera plus).
      const explicitExplain = norm.includes(n('اشرح')) || norm.includes(n('وضّح')) || norm.includes(n('وضح'));
      if (explicitExplain) {
        const bypassed = [...(session.probeBypassed ?? [])];
        if (!bypassed.includes(probeCard.id)) bypassed.push(probeCard.id);
        const s2: BotSession = {
          ...session,
          pendingProbeCardId: null,
          probeBypassed: bypassed,
          // Le contenu complet est servi, ET la question de rappel avec lui.
          pendingRecallCardId: probeCard.id,
        };
        saveSession(s2);
        return {
          session: s2,
          action: {
            confidence: 95,
            text:
              '⏩ فتحتُ لك الشرح الكامل بطلبٍ صريح — مسجّل، ولن أعيد سؤال التحقيق في هذه البطاقة.\n\n' +
              `🧩 **${probeCard.title}**\n\n${probeCard.shortAnswer}\n\n🔑 كلمات مفتاحية: ${probeCard.keywords.join(' • ')}${buildRecallQuestion(probeCard)}`,
            quickActions: filterQuickActions(probeCard.relatedQuestions, norm),
            sources: [{ type: 'internal_card' as SourceType, title: probeCard.title }],
          },
        };
      }
      // Tentative de l'élève → verdict en UNE ligne, puis contenu ciblé.
      const s2: BotSession = { ...session, pendingProbeCardId: null, pendingRecallCardId: probeCard.id };
      saveSession(s2);
      return { session: s2, action: probeVerdictThenContent(probeCard, rawInput) };
    }
    // Intention forte ou saisie vide : libérer le probe, poursuivre le flux.
    const s2: BotSession = { ...session, pendingProbeCardId: null };
    saveSession(s2);
    session = s2;
  }

  // ══════════════════════════════════════════════════════════════════════════
  // S-05 (CORRIGÉ le 14/10/2026) : LA QUESTION DE RAPPEL EST ENFIN ÉCOUTÉE.
  //
  // LE DÉFAUT, tel qu'un élève l'a vécu : le tuteur terminait sa fiche par
  // « صح أم خطأ: نسخ مرتبط مباشرةً بترجمة في هذا الدرس », l'élève répondait
  // « صح » — et recevait « ❓ هذا السؤال خارج قاعدة علوم الطبيعة والحياة
  // للبكالوريا » avec 0 % de confiance. Le tuteur déclarait hors programme sa
  // PROPRE question, en deux lettres. Deux causes : aucun état ne retenait
  // qu'une question venait d'être posée, et « صح » (2 caractères) ne partage
  // aucun mot avec le programme, ce qui suffisait au détecteur de hors-sujet.
  //
  // C'est le défaut « un signal que personne n'écoute » appliqué au pire
  // endroit : le moment où l'élève fait l'effort de répondre.
  // ══════════════════════════════════════════════════════════════════════════
  // ════════════════════════════════════════════════════════════════════════
  // Audit Capitaine §4.1 (suite) : LA RÉPONSE LIBRE AU RAPPEL DE CONCEPT EST
  // ÉCOUTÉE ET NOTÉE SM-2. La mission a posé la question du corpus
  // (pendingCorpusRecallId) ; la saisie de l'élève est mesurée sur les
  // preuves déclarées par le corpus (noterReponseLibre) — verdict honnête,
  // espacement SM-2 réel, mission clôturée par cette restitution.
  // ════════════════════════════════════════════════════════════════════════
  if (session.pendingCorpusRecallId) {
    const conceptId = session.pendingCorpusRecallId;
    const prompt = promptPour(conceptId, etatRappel(conceptId));
    const intentionForte = estIntentionForte(norm);
    if (prompt && !intentionForte && usefulChars(rawInput) >= 2 && estReponseAuRappel(input, norm)) {
      const { etat, qualite } = noterReponseLibre(conceptId, rawInput, {
        acceptedEvidence: prompt.acceptedEvidence,
        minEvidence: prompt.minEvidence,
      });
      // Mission clôturée par la restitution (quelle que soit la qualité —
      // la qualité, elle, pilote l'espacement ; c'est le travail du SM-2).
      const cloturee = { ...session, pendingCorpusRecallId: null };
      const s2 = completeDailyMission(cloturee, `rappel-corpus:${conceptId}`);
      saveSession(s2);
      const reussi = qualite >= 3;
      const verdict = reussi
        ? `✅ صَح — استرجاع صحيح. ${phraseEcheance(etat.intervalDays)}\n`
        : '⚪ لم تكتمل الإجابة — سأعيد السؤال قريباً (الذاكرة تحتاج محاولات).\n';
      // Indices : les éléments attendus absents de la réponse (affichage
      // d'aide, pas un verdict — le verdict vient du SM-2 ci-dessus).
      const preuvesManquantes = prompt.acceptedEvidence.filter(
        (p) => !norm.includes(normalizeArabic(p)),
      );
      const reconstruction = reussi
        ? ''
        : `\n🔓 عناصر كان المطلوب إظهارها في الإجابة: ${preuvesManquantes.join(' • ')}\n\nتابع شرح المفهوم في درسه أو «الملخصات الذهبية»، وسأعيد سؤالك.`;
      return {
        session: s2,
        action: {
          confidence: 90,
          text: `${verdict}${reconstruction}\n🗓️ التقييم محفوظ في منظم المراجعات (SM-2).`,
          quickActions: ['العودة للقائمة الرئيسية'],
        },
      };
    }
    // Intention forte ou saisie non éligible : libérer sans juger.
    if (intentionForte) {
      const s2: BotSession = { ...session, pendingCorpusRecallId: null };
      saveSession(s2);
      session = s2;
    }
  }

  if (session.pendingRecallCardId) {
    const recallCard = getCardById(session.pendingRecallCardId);
    // Une intention FORTE libère le rappel sans bloquer personne (même règle que
    // la question de sondage) : l'élève qui veut changer d'activité le peut.
    const intentionForte = estIntentionForte(norm);
    // Même seuil que la question de sondage (2 caractères utiles) : « صح », « لا »
    // et « نعم » sont des réponses recevables — ce sont MÊME les réponses
    // attendues à la forme « صح أم خطأ ».
    if (
      recallCard &&
      !intentionForte &&
      usefulChars(rawInput) >= 2 &&
      // Une QUESTION ne vaut pas réponse : sans ce filtre, la question suivante
      // de l'élève (« ما هو الاستنساخ؟ ») recevait le verdict du rappel.
      estReponseAuRappel(input, norm)
    ) {
      const s2: BotSession = { ...session, pendingRecallCardId: null };
      saveSession(s2);
      // Le verdict était calculé puis jeté : il programme désormais le rappel.
      return {
        session: s2,
        action: avecEcheanceRappel(reponseAuRappel(recallCard, rawInput), recallCard, rawInput),
      };
    }
    // Saisie vide, trop courte ou intention forte : on libère et on continue.
    const s2: BotSession = { ...session, pendingRecallCardId: null };
    saveSession(s2);
    session = s2;
  }

  // KEO-105 (LOT 2) : triade en cours — ألاحظ → أستنتج → أخلص. Morchid ne
  // rédige JAMAIS les trois blocs : l'élève produit chaque maillon.
  if (session.triadeStep) {
    const menuIntent = norm.includes(n('القائمة الرئيسية')) || norm.includes(n('اختبرني'));
    const giveUpTriade = norm.includes(n('لا أعرف'));
    if (!menuIntent && (usefulChars(rawInput) >= 10 || giveUpTriade)) {
      const step = session.triadeStep;
      const triadeSources = [{ type: 'methodology' as SourceType, title: 'التثليث العلمي' }];
      if (step === 1) {
        if (hasCausalConnector(norm)) {
          return {
            session,
            action: {
              text:
                '⏸️ ليس بعد — أنت في خطوة **الملاحظة** (ألاحظ).\n«لأنّ» مكانها في الخطوة الموالية.\n\n' +
                '👉 عد إلى المعطى: ما الرقم أو الشكل الذي رأيته في الوثيقة؟ صفه في جملة واحدة دون تعليل.',
              quickActions: [],
              sources: triadeSources,
            },
          };
        }
        const s2: BotSession = { ...session, triadeStep: 2 };
        saveSession(s2);
        return {
          session: s2,
          action: {
            text: session.triadeClosed
              ? '✅ ملاحظة مسجّلة.\n\n**الخطوة 2 · أستنتج (عائلة مغلقة):**\nاربط ما لاحظته بمعرفتك العلمية — ولكن بدون تعليل.\n⚠️ الفعل في التعليمة هو «حلّل/استخرج»: لا تكتب «لأنّ» — اذكر العلاقة أو الخاصية فقط في جملة واحدة.'
              : '✅ ملاحظة مسجّلة.\n\n**الخطوة 2 · أستنتج / أفسّر:**\nاربط ما لاحظته بمعرفتك العلمية: لماذا حدث ذلك؟\nاكتب جملة واحدة تستعمل «لأنّ» أو «يعود ذلك إلى».',
            quickActions: [],
            sources: triadeSources,
          },
        };
      }
      if (step === 2) {
        // S-03 (SpecKit 002, fusion master) : famille FERMÉE (حلّل/استخرج) —
        // on décrit, on n'explique pas. «لأنّ» y est refusé exactement comme
        // à l'étape 1 : le BAC paie la lecture du document avant le cours.
        if (session.triadeClosed && hasCausalConnector(norm)) {
          return {
            session,
            action: {
              text:
                '⏸️ ليس هنا — التعليمة من **العائلة المغلقة** (حلّل/استخرج): التحليل لا يفسّر.\n«لأنّ» ليس مكانها في هذا التمرين.\n\n' +
                '👉 اذكر العلاقة أو الخاصية العلمية في جملة واحدة، دون تعليل: «يظهر أنّ…» / «تتناسب… مع…».',
              quickActions: [],
              sources: triadeSources,
            },
          };
        }
        if (!session.triadeClosed && !hasCausalConnector(norm)) {
          return {
            session,
            action: {
              text:
                '⏸️ التفسير يحتاج رابطاً سببياً — أين «لأنّ» / «بسبب»؟\n\n' +
                '👉 اكتب السبب العلمي في جملة واحدة: «يعود ذلك إلى…».',
              quickActions: [],
              sources: triadeSources,
            },
          };
        }
        const s2: BotSession = { ...session, triadeStep: 3 };
        saveSession(s2);
        return {
          session: s2,
          action: {
            text:
              '✅ تفسير مقبول.\n\n**الخطوة 3 · أخلص:**\nاكتب الجواب النهائي في جملة واحدة تبدأ بـ «ومنه نستنتج أنّ…» — دون تكرار الأرقام ولا السبب.',
            quickActions: [],
            sources: triadeSources,
          },
        };
      }
      // step 3 → triade complète.
      const s2: BotSession = { ...session, triadeStep: null, triadeClosed: false };
      saveSession(s2);
      return {
        session: s2,
        action: {
          text:
            '🏁 **أكملتَ التثليث كاملاً: ملاحظة ← تفسير ← خلاصة.**\nهذا بالضبط ما تدفع فيه سلّم التنقيط الرسمي.\n\n' +
            '✍️ **تحقّق سريع (30 ثانية):** أعد صياغة الخلاصة بأسلوبك في جملة واحدة — ثم انتقل للاختبار.',
          quickActions: ['اختبرني في الغوص', 'اختبرني في الاستنساخ', 'العودة للقائمة الرئيسية'],
          sources: triadeSources,
        },
      };
    }
    // Intention de menu : libérer la triade, poursuivre le flux.
    const s2: BotSession = { ...session, triadeStep: null, triadeClosed: false };
    saveSession(s2);
    session = s2;
  }

  // B7 (audit Morchid 2026-09-25) : « اختبرني (في X) » doit LANCER UN QCM sur le
  // sujet ciblé. Jusqu'ici l'intention tombait sur la recherche sémantique et
  // renvoyait une carte de cours : le bouton promettait un test, pas un cours.
  // N4 (bilan de vérité 2026-10-01) : fin des substitutions silencieuses —
  // sujet non identifié → clarification ; sujet sans QCM → indisponibilité dite
  // + alternative TESTABLE du même domaine. Jamais une fiche à la place d'un
  // test, jamais la première carte du domaine par défaut.
  if (norm.includes(n('اختبرني'))) {
    const scored = findBestKnowledgeCardScored(norm, session.activeDomainId);
    if (scored) {
      const card = scored.card;
      const pool = getQuestionsForDomain(card.domainId).filter((q) => q.topicId === card.id);
      if (pool.length > 0) {
        const picked = pool[Math.floor(Math.random() * pool.length)];
        const newSession = startQuiz(session, pool.length, picked.id, 'quiz');
        return {
          session: newSession,
          action: {
            text: `🧪 اختبار سريع في **${card.title}** — ${pool.length} أسئلة. اكتب الحرف A أو B أو C أو D (أو 1 2 3 4) لكل سؤال.`,
            quiz: toQuizPrompt(picked),
            quickActions: [],
            sources: [{ type: 'internal_card' as SourceType, title: card.title }],
          },
        };
      }
      const alternative = findTestableCard(card.domainId, card.id);
      return {
        session,
        action: {
          text:
            `🧪 لا يوجد اختبار جاهز في «${card.title}» بعد — ولن أعوّضه بدرسٍ تقرؤه بدل اختبارٍ تؤدّيه.` +
            (alternative
              ? `\nأستطيع اختبارك الآن في **${alternative.title}** من المجال نفسه. أيّهما تختار؟`
              : '\nجرّب موضوعاً آخر من المجال نفسه.'),
          quickActions: alternative ? [`اختبرني في ${alternative.title}`] : ['العودة للقائمة الرئيسية'],
          sources: [{ type: 'internal_card' as SourceType, title: card.title }],
        },
      };
    }
    return {
      session,
      action: {
        text: 'لم أحدّد الموضوع الذي تريد اختبارك فيه. اكتبه صراحةً، مثال: «اختبرني في الغوص» أو «اختبرني في الاستنساخ».',
        quickActions: ['اختبرني في الغوص', 'اختبرني في الاستنساخ'],
      },
    };
  }

  // KEO-105 (LOT 2) : question d'analyse libre (فسّر/حلّل/استنتج + document)
  // → Morchid ne rédige pas la conclusion à la place de l'élève : il impose la
  // triade, un bloc à la fois. Les questions de MÉTHODE («كيف أحلل…») restent
  // servies par le banco méthodologique — elles ne parlent pas d'un document.
  const analysisVerb = norm.includes(n('فسر')) || norm.includes(n('حلل')) || norm.includes(n('استنتج'));
  const documentContext =
    norm.includes(n('وثيق')) || norm.includes(n('تجرب')) || norm.includes(n('منحن')) ||
    norm.includes(n('جدول')) || norm.includes(n('النتائج'));
  const methodQuestion = norm.includes(n('كيف')) || norm.includes(n('منهج')) || norm.includes(n('قالب'));
  if (analysisVerb && documentContext && !methodQuestion && !session.pendingProbeCardId) {
    // S-03 : حلّل/استخرج = famille fermée (décrire) ; فسّر/استنتج = ouverte
    // (expliquer). Le drapeau porte le contrat de l'étape 2.
    const triadeClosed = norm.includes(n('حلل')) || norm.includes(n('استخرج'));
    const s1: BotSession = { ...session, triadeStep: 1, triadeClosed, pendingProbeCardId: null };
    saveSession(s1);
    return {
      session: s1,
      action: {
        text:
          '🔬 **لن أكتب الخلاصة مكانك — الملاحظة أولاً.**\n\n' +
          '**الخطوة 1 · ألاحظ:**\nصف ما تُظهره الوثيقة في جملة واحدة بالأرقام (القيمة في البداية، القيمة في النهاية، طبيعة التغيّر).\n\n' +
          '⛔ لا تستعمل «لأنّ» في هذه الخطوة — التفسير يأتي في الخطوة الموالية.',
        quickActions: [],
        sources: [{ type: 'methodology' as SourceType, title: 'التثليث العلمي' }],
      },
    };
  }

  // KEO-RSUM (flow الملخصات الذهبية, 2026-10-04) : « الملخص » → liste des
  // unités → leçons de l'unité → résumé d'or complet (mission, خطوات الفهم,
  // دليل, مفاهيم, خطأ شائع, سؤال المراجعة). En navigation, un clic sur un
  // titre de leçon est intercepté ICI, avant la recherche de cours, pour
  // afficher le résumé demandé. Hors navigation, seuls « الملخص » (liste) et
  // « ملخص <عنوان الدرس> » (accès direct) sont reconnus — le reste tombe dans
  // la cascade normale.
  const summaryFlow = handleSummaryFlow(norm, session.pendingSummaryUnit);
  if (summaryFlow) {
    const sumSession: BotSession = {
      ...session,
      pendingSummaryUnit: summaryFlow.nextPendingUnit,
    };
    saveSession(sumSession);
    return {
      session: sumSession,
      action: {
        confidence: 90,
        text: summaryFlow.text,
        quickActions: summaryFlow.quickActions,
        sources: summaryFlow.lessonKey
          ? [{ type: 'lesson' as SourceType, title: summaryFlow.lessonTitle ?? summaryFlow.lessonKey }]
          : [{ type: 'guide' as SourceType, title: 'الملخصات الذهبية' }],
      },
    };
  }

  // ══════════════════════════════════════════════════════════════════════════
  // GESTES DE DIALOGUE (R6, 14/10/2026) — « un geste humain n'est jamais du
  // hors-programme ».
  //
  // PLACEMENT : après TOUT le contenu (fiches, leçons, méthode, triade, rappel,
  // résumés) et AVANT le refus. Un élève qui dit « السلام عليكم », « مافهمت
  // والو » ou « أعد من فضلك » recevait « ❓ هذا السؤال خارج قاعدة علوم الطبيعة
  // والحياة » — le tuteur reprochait un hors-sujet à un élève qui parlait de lui.
  // Le refus « hors programme » reste réservé aux questions HORS DISCIPLINE
  // (football, cuisine, politique), et c'est le seul usage légitime de ce texte.
  // ══════════════════════════════════════════════════════════════════════════
  const geste = gesteDuMessage(
    norm,
    (n2) => domaineProbable(tokenizeArabic(n2), vocabDomaine()) != null,
  );
  if (geste) return resultatDuGeste(session, geste);

  if (isGibberishInput(rawInput || input) || (norm.length >= 3 && OUT_OF_PROGRAM.some((k) => {
    const nk = n(k);
    return nk.length >= 3 && norm.includes(nk);
  }))) {
    return outOfScopeResult(session, rawInput || input);
  }

  const studyGuideMatches = findBestStudyGuide(input);
  if (studyGuideMatches.length > 0 && studyGuideMatches[0].score >= 18) {
    const card = studyGuideMatches[0].card;
    return {
      session,
      action: {
        confidence: studyGuideMatches[0].score >= 50 ? 95 : 82,
        text: formatStudyGuideAnswer(card),
        quickActions: ['بروتوكول دراسة أي وحدة في 5 خطوات', 'التجارب الأساسية التي يجب ربطها بالدروس', 'دليل الإجابة في البكالوريا'],
        sources: [{ type: 'guide' as SourceType, title: card.title }],
      },
    };
  }

  // المنهجية أولاً
  const methodologyMatches = findBestMethodologyQA(input);
  if (methodologyMatches.length > 0 && methodologyMatches[0].score >= 18) {
    const qa = methodologyMatches[0].qa;
    const text =
      `🧭 **إجابة منهجية من بنك المنهجية المحلي.**\n\n` +
      `📌 **السؤال:** ${qa.question}\n\n` +
      `✅ **الطريقة الصحيحة:**\n${qa.answer}\n\n` +
      `🧩 **قالب جاهز:**\n${qa.template || '—'}\n\n` +
      `🔑 **كلمات مفتاحية:** ${qa.keywords.join(' • ')}`;
    return {
      session,
      action: {
        confidence: methodologyMatches[0].score >= 50 ? 95 : 80,
        text,
        quickActions: ['كيف أحلل وثيقة؟', 'ما الفرق بين استخرج واستنتج؟', 'العودة للقائمة الرئيسية'],
        sources: [{ type: 'methodology' as SourceType, title: qa.question }],
      },
    };
  }

  // بنك الأسئلة العلمي
  const bookMatches = findBestBookQA(input);
  if (bookMatches.length > 0 && bookMatches[0].score >= 18) {
    const qa = bookMatches[0].qa;
    const text =
      `📚 **إجابة من بنك الأسئلة العلمي المحلي.**\n\n` +
      `🎯 **المحور:** ${qa.topic}\n\n` +
      `📌 **السؤال:** ${qa.question}\n\n` +
      `✅ **الجواب الدقيق:**\n${qa.answer}\n\n` +
      `🔑 **كلمات مفتاحية:** ${qa.keywords.join(' • ')}`;
    return {
      session,
      action: {
        confidence: bookMatches[0].score >= 50 ? 98 : 85,
        text,
        quickActions: qa.followUp ? [qa.followUp, 'العودة للقائمة الرئيسية'] : ['العودة للقائمة الرئيسية'],
        sources: [{ type: 'book' as SourceType, title: qa.question }],
      },
    };
  }

  if (norm.includes(n('اختبار'))) return startDiagnostic(session);
  if (norm.includes(n('تحدي bac')) || norm.includes(n('تحدي البكالوريا')) || norm.includes(n('تحدي الباك')) || norm.includes(n('boss'))) return startBossFight(session);

  if (session.activeDomainId == null) {
    const domain = DOMAINS.find((d) => {
      const dn = normalizeArabic(d.title);
      return dn === norm || norm.includes(dn) || dn.includes(norm);
    });
    if (domain) return handleDomainClick(session, domain.id);
  }

  const scoredCard = findBestKnowledgeCardScored(norm, session.activeDomainId);

  if (scoredCard) {
    const scienceCard = scoredCard.card;
    const confidence = confidenceFromCardScore(scoredCard.score, scoredCard.exact);
    const microHit = findMicroAnswer(scienceCard, norm);
    if (microHit) {
      return {
        session,
        action: {
          confidence,
          text: `🎯 **${scienceCard.title}**\n\n${microHit}`,
          quickActions: filterQuickActions(scienceCard.relatedQuestions, norm),
          sources: [{ type: 'internal_card' as SourceType, title: scienceCard.title }],
        },
      };
    }
    // KEO-103 (LOT 2) : question d'EXPLICATION (ما هو/كيف/لماذا/اشرح…) sur une
    // fiche → une question de sondage AVANT le contenu. Les quick actions
    // «راجع …» (intention de révision explicite) et les cartes déjà
    // contournées livrent le contenu directement. Le contenu ne vient qu'après
    // la tentative de l'élève — ou après « اشرح لي » (journalisé).
    if (
      scienceCard.probe &&
      !(session.probeBypassed ?? []).includes(scienceCard.id) &&
      isExplainQuestion(norm)
    ) {
      const withProbe: BotSession = { ...session, pendingProbeCardId: scienceCard.id, triadeStep: null, triadeClosed: false };
      saveSession(withProbe);
      return { session: withProbe, action: probeQuestionAction(scienceCard) };
    }
    const avecRappel: BotSession = { ...session, pendingRecallCardId: scienceCard.id };
    saveSession(avecRappel);
    return {
      session: avecRappel,
      action: {
        confidence,
        text: `🧩 **${scienceCard.title}**\n\n${scienceCard.shortAnswer}\n\n🔑 كلمات مفتاحية: ${scienceCard.keywords.join(' • ')}${buildRecallQuestion(scienceCard)}`,
        quickActions: filterQuickActions(scienceCard.relatedQuestions, norm),
        sources: [{ type: 'internal_card' as SourceType, title: scienceCard.title }],
      },
    };
  }

  // R2 (audit qualité 2026-09-29) : détecteur IN-DOMAINE positif. On n'arrive
  // ici QU'APRÈS l'échec de toutes les bases curées (guide/méthodo/livre/fiche).
  // Si la question ne partage AUCUN vocabulaire avec le programme, c'est un
  // hors-sujet non listé : on le déclare franchement au lieu de renvoyer un
  // extrait vaguement lié (l'ancien fallback à confiance 70).
  // S-05 (14/10/2026) : une saisie TROP COURTE n'est pas un hors-sujet.
  //
  // « صح », « نعم », « لا » ne sont pas des questions : ce sont des RÉPONSES — à
  // une question que le tuteur n'a pas posée, ou plus. Déclarer « hors programme
  // du Bac SVT » devant deux lettres était un non-sens, et surtout un aveu : le
  // vrai problème est qu'on ne sait pas à quoi l'élève répond. On le dit, au lieu
  // de lui reprocher un hors-sujet qu'il n'a pas commis.
  //
  // Ce garde-fou ne peut pas masquer un vrai hors-sujet : la liste OUT_OF_PROGRAM
  // et le test de charabia passent AVANT, et les mots-clés du programme (5 lettres
  // et moins, comme « الغوص ») sont déjà résolus par les bases de fiches plus haut.
  if (estMotReponseSeul(norm)) {
    return {
      session,
      action: {
        confidence: 60,
        text: `🤔 وصلتني « ${input} » وحدها، ولا أعرف علامَ تجيب. اكتب سؤالك كاملًا، أو اختر من الاقتراحات.`,
        quickActions: session.activeDomainId
          ? DOMAINS.find((d) => d.id === session.activeDomainId)?.quickActions || ['العودة للقائمة الرئيسية']
          : DOMAINS.map((d) => d.title),
        sources: [{ type: 'guide' as SourceType, title: 'طلب توضيح' }],
      },
    };
  }

  if (!hasDomainSignal(tokenizeArabic(norm))) {
    return outOfScopeResult(session, rawInput || input);
  }

  const built = buildAnswer(norm, session.activeDomainId);
  if (built) {
    // La fiche servie pose une question de rappel : on la MÉMORISE, sans quoi la
    // réponse de l'élève (« صح », deux lettres) ressortirait en « hors programme ».
    const avecRappel: BotSession = { ...session, pendingRecallCardId: built.recallCardId };
    if (built.recallCardId) saveSession(avecRappel);
    return { session: avecRappel, action: built.action };
  }

  // ── Aveu d'ignorance (R6, 14/10/2026) ─────────────────────────────────────
  // Un professeur qui ne sait pas le dit, et oriente. Cette branche n'est plus
  // un « je n'ai rien trouvé » anonyme : quand le domaine de la question est
  // établi, elle le NOMME et propose les boutons de ce domaine — l'élève sait
  // au moins de quoi il parle, et où chercher.
  const domaineQuestion = domaineProbable(tokenizeArabic(norm), vocabDomaine());
  const domaineAffiche = domaineQuestion ?? session.activeDomainId ?? null;
  const domaineTitre = DOMAINS.find((d) => d.id === domaineAffiche)?.title;
  const fallbackActions = domaineAffiche
    ? DOMAINS.find((d) => d.id === domaineAffiche)?.quickActions || ['العودة للقائمة الرئيسية']
    : DOMAINS.map((d) => d.title);

  const tete = domaineTitre
    ? `🤔 سؤالك في مجال **${domaineTitre}**، لكنّي لم أجد في دروسي نصًّا يجيب عنه بدقّة.`
    : '🤔 لم أجد في دروسي نصًّا يجيب عن سؤالك بدقّة.';

  return {
    session,
    action: {
      // Ignorance assumée : on ne peut pas prétendre à la certitude d'une fiche.
      confidence: 20,
      text:
        `${tete}\n\n` +
        'جرّب صيغة أخرى: اسم وحدة، أو مصطلح من الدرس (مثال: «تركيب البروتين»، «حلقة كالفن»، «الغوص»).\n\n' +
        '💡 أسئلة منهجية مقترحة:\n' +
        METHODOLOGY_SUGGESTIONS.map((s) => `• ${s}`).join('\n'),
      quickActions: fallbackActions,
      sources: [{ type: 'guide' as SourceType, title: 'لا يوجد نصّ مطابق' }],
    },
  };
}

export function answerTutorQuestion(rawInput: string): TutorAction {
  // API sans session (tests / intégrations legacy). La probe socratique
  // (KEO-103) est un flux À ÉTAT : elle pose sa question via
  // pendingProbeCardId puis attend la réponse de l'élève. Sans session
  // persistante pour héberger cet aller-retour, on livre le contenu
  // directement (contournement explicite, journalisé comme « اشرح لي »).
  const session: BotSession = {
    ...getDefaultSession(),
    probeBypassed: KNOWLEDGE_CARDS.filter((c) => c.probe).map((c) => c.id),
  };
  return processStudentInput(session, rawInput || '').action;
}

/** F10 (audit Morchid 2026-09-26) : XP promis par la mission quotidienne.
 *  Doit rester en phase avec le texte affiché (« المكافأة: +15 XP »). */
const MISSION_XP = 15;

function pickRandomQuizForTopic(domainId: number, topicId: string): QuizQuestion | undefined {
  const questions = getQuestionsForDomain(domainId);
  const candidates = questions.filter((q) => q.topicId === topicId);
  if (candidates.length === 0) return undefined;
  return candidates[Math.floor(Math.random() * candidates.length)];
}

/**
 * R6 (audit Morchid 2026-10-01, master 3e970d2) : priorisation réelle, pas
 * index zéro. getDailyMission prenait mistakes[0] — la PREMIÈRE erreur
 * chronologique — indépendamment de sa fréquence ou du poids BAC de l'unité.
 * Nouveau score = fréquence (occurrences) × poids BAC de l'unité × oubli.
 */
const UNIT_BAC_WEIGHT: Map<number, number> = (() => {
  const map = new Map<number, number>();
  for (const o of UNIT_OPENINGS) {
    if (o.bacWeightPercent != null) map.set(o.unitId, o.bacWeightPercent);
  }
  return map;
})();

/**
 * Associe un topic (carte) à son unité pédagogique pour récupérer son poids
 * BAC. KnowledgeCard.domainId est le domaine (1-3), pas l'unité — on se
 * replie sur le poids moyen du domaine quand l'unité précise est inconnue.
 */
function weightForTopic(topicId: string, domainId: number | null): number {
  // Poids moyens mesurés par domaine (unitOpenings) : protéines ~12,
  // énergétique ~13, tectonique ~10. Sans unité précise, on prend la moyenne.
  const domainAverage: Record<number, number> = { 1: 12, 2: 13, 3: 10 };
  const card = getCardById(topicId);
  if (card) {
    const unitId = domainToUnit(card.domainId, topicId);
    const w = unitId != null ? UNIT_BAC_WEIGHT.get(unitId) : undefined;
    if (w != null) return w;
    return domainAverage[card.domainId] ?? 10;
  }
  return domainId != null ? domainAverage[domainId] ?? 10 : 10;
}

/**
 * R6 : approximation du mapping topic → unité. Les cartes du domaine 1
 * couvrent les unités 1-5, le domaine 2 les unités 6-8, le domaine 3 les
 * unités 9-11. On retourne l'unité la plus probable d'après le rang de la
 * carte dans son domaine — approximation honnête : elle ne sert qu'à
 * pondérer la priorité, pas à afficher un contenu.
 */
function domainToUnit(domainId: number, topicId: string): number | null {
  const cards = KNOWLEDGE_CARDS.filter((c) => c.domainId === domainId);
  const idx = cards.findIndex((c) => c.id === topicId);
  if (idx < 0) return null;
  const ranges: Record<number, [number, number]> = { 1: [1, 5], 2: [6, 8], 3: [9, 11] };
  const range = ranges[domainId];
  if (!range) return null;
  const span = range[1] - range[0] + 1;
  return range[0] + Math.floor((idx / Math.max(1, cards.length)) * span);
}

/**
 * R6 : classe les erreurs par score = fréquence × poids BAC × oubli.
 *
 * Audit Capitaine §5.2 (2026-10-17) : la fréquence comptait des doublons que
 * `recordQuizAnswer` n'écrit jamais (liste dédoublonnée) — tout valait 1 — et
 * l'oubli était déduit du RANG dans le tableau, pas d'une date. Depuis :
 * `session.mistakeStats` porte le compte réel et `lastSeenAt`. Sans stats
 * (vieille session persistée, AB-test, tests), l'heuristique d'ordre reste le
 * repli — le classement ne plante jamais sur des données anciennes.
 */
function rankMistakes(
  mistakes: string[],
  lastSeenAt: number,
  stats?: BotSession['mistakeStats'],
): string[] {
  const freq = new Map<string, number>();
  for (const m of mistakes) {
    // Fréquence mesurée (occurrences réelles) ; 1 minimum = l'entrée de la liste.
    freq.set(m, Math.max(1, stats?.[m]?.count ?? 1));
  }

  const scored = Array.from(freq.entries()).map(([topicId, count]) => {
    const card = getCardById(topicId);
    const weight = weightForTopic(topicId, card?.domainId ?? null);
    // Oubli : avec une date réelle, jours écoulés depuis le dernier échec ;
    // sinon repli historique sur le rang dans la liste.
    const horodatage = stats?.[topicId]?.lastSeenAt;
    const daysSince = horodatage
      ? Math.max(1, Math.floor((lastSeenAt - horodatage) / JOUR_MS))
      : Math.max(1, Math.floor((mistakes.length - mistakes.indexOf(topicId)) / 2));
    const oubli = Math.min(daysSince, 14) / 14;
    return { topicId, score: count * weight * (0.5 + oubli) };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.map((x) => x.topicId);
}

/**
 * Audit Capitaine §5.1 (2026-10-17) : le SÉLECTEUR de sujet de mission,
 * extrait pour être testé sans QCM. lastMissionTopic — écrit depuis toujours
 * par completeDailyMission — était jamais lu : la mission répétait son
 * premier sujet à l'infini. Ordre conservé : lacunes classées par rankMistakes
 * > domaine actif dans l'ordre du catalogue ; dans chaque cas, la mission
 * d'hier laisse sa place (rotation circulaire, un seul sujet = il reste).
 */
export function choisirSujetMission(session: BotSession): {
  topicId: string | null;
  domainId: number | null;
} {
  let targetTopicId: string | null = null;
  let targetDomainId: number | null = session.activeDomainId;

  if (session.mistakes.length > 0) {
    // R6 : rankMistakes (fréquence réelle × poids BAC × oubli daté).
    const ranked = rankMistakes(session.mistakes, session.lastInteraction, session.mistakeStats);
    targetTopicId = ranked.find((id) => id !== session.lastMissionTopic) ?? ranked[0] ?? null;
    const card0 = targetTopicId ? getCardById(targetTopicId) : null;
    if (card0) targetDomainId = card0.domainId;
  } else if (session.activeDomainId) {
    targetTopicId = carteSuivante(
      KNOWLEDGE_CARDS.filter((c) => c.domainId === session.activeDomainId),
      session.lastMissionTopic,
    );
  } else if (KNOWLEDGE_CARDS.length > 0) {
    targetTopicId = carteSuivante(KNOWLEDGE_CARDS, session.lastMissionTopic);
    const card = targetTopicId ? getCardById(targetTopicId) : null;
    if (card) targetDomainId = card.domainId;
  }

  return { topicId: targetTopicId, domainId: targetDomainId };
}

/** La carte suivant `dernier` dans `cards` (rotation circulaire) ; sans
 *  repère, la première. La mission PROGRESSE au lieu de repliquer cards[0]. */
function carteSuivante(cards: KnowledgeCard[], dernier: string | null): string | null {
  if (cards.length === 0) return null;
  const idx = dernier ? cards.findIndex((c) => c.id === dernier) : -1;
  return idx >= 0 ? cards[(idx + 1) % cards.length].id : cards[0].id;
}

export function getDailyMission(session: BotSession): EngineResult {
  // H3 : jour LOCAL. En UTC (Alger = UTC+1), la « mission du jour » restait
  // celle de la veille jusqu'à 01 h du matin — donc rejouable une fois de plus.
  const today = jourLocal();
  if (session.lastMissionDate === today) {
    return { session, action: { text: '✅ لقد أنجزت مهمة اليوم بنجاح! عُد غداً لمهمة جديدة، أو تابع مراجعتك بحرية.', quickActions: ['اختبار تشخيصي', 'العودة للقائمة الرئيسية'] } };
  }

  // Audit Capitaine §5.1 : le sélecteur vit désormais dans choisirSujetMission
  // (testé sans QCM) — lacunes classées > domaine actif > catalogue, et la
  // mission d'hier (lastMissionTopic) laisse sa place par rotation circulaire.
  const { topicId: targetTopicId, domainId: targetDomainId } = choisirSujetMission(session);


  // ════════════════════════════════════════════════════════════════════════
  // Audit Capitaine §4.1 (2026-10-17) — LA FILE DE RAPPELS DE CONCEPTS EST
  // ENFIN CONSULTÉE. `prochainRappelDu` (SM-2 sur le corpus de rappels
  // espacés, alimenté par planifierRappelsPourErreurs après chaque erreur
  // reliée) existait sans aucun consommateur : le moteur-programmeur devient
  // enfin moteur-lecteur. Une revue dûe devient LA mission :
  // restitution courte exigée (réponse libre notée par les preuves du
  // corpus), pas une lecture passive.
  // ════════════════════════════════════════════════════════════════════════
  const rappel = prochainRappelDu();
  if (rappel?.prompt) {
    const retard = rappel.retardJours;
    const titreRetard =
      retard > 0
        ? ` — متأخرة ${retard} ${retard === 1 ? 'يوم' : 'أيام'}`
        : '';
    const text =
      `🔁 **مراجعة موعدة${titreRetard}**\n\n` +
      `**${rappel.prompt.questionAr}**\n\n` +
      'أجب بكلماتك القصيرة — سأقيس إجابتك على معايير النموذج ثم أمهّل استرجاعاً بعدُ.\n' +
      'إن اختفت الإجابة، قل «لا أعرف» — أعيد البناء معك دون عتاب.';
    const s2: BotSession = { ...session, pendingCorpusRecallId: rappel.itemId };
    saveSession(s2);
    return { session: s2, action: { text, quickActions: ['العودة للقائمة الرئيسية'] } };
  }

  if (!targetTopicId) {
    return { session, action: { text: '🎯 مهمة اليوم: اختر مجالاً أولاً، ثم ابدأ اختباراً تشخيصياً سريعاً لتفعيل المهمة!', quickActions: DOMAINS.map((d) => d.title) } };
  }

  const card = getCardById(targetTopicId);
  if (!card) return { session, action: { text: 'خطأ في تحميل المهمة.', quickActions: ['العودة للقائمة الرئيسية'] } };

  const domain = DOMAINS.find((d) => d.id === (targetDomainId ?? card.domainId));
  const quiz = pickRandomQuizForTopic(card.domainId, card.id);
  // ── R8 (audit Morchid 2026-10-01, master 3e970d2) : BAC_EXAM_DATE était
  // vide → le compte à rebours affichait « — ». La date (provisoire, voir
  // dashboardActions) est désormais visible dans la mission.
  const bacLeft = bacDaysLeft(new Date(), BAC_EXAM_DATE);
  const bacLine =
    bacLeft != null && bacLeft > 0
      ? `\n⏳ **بقي ${bacLeft} يوماً على البكالوريا.** كل يوم تثبّت فيه نقطة واحدة = نقطة مضمونة.\n`
      : '';

  // ── R7 : le guide ne se cache plus derrière une phrase magique. Quand
  // l'élève enchaîne les erreurs sur ce sujet (≥ 3), le protocole d'étude
  // se PROPOSE dans la mission — au lieu d'attendre « كيف ادرس العلوم ».
  // R7 + audit Capitaine §5.2 : le déclencheur du protocole est la fréquence
  // RÉELLE des échecs (mistakeStats.count) — compter les doublons de
  // `mistakes` (liste dédoublonnée) donnait toujours ≤ 1 : la ligne d'aide
  // était inatteignable.
  const freq = session.mistakeStats?.[targetTopicId]?.count ?? 0;
  const guideLine =
    freq >= 3
      ? `\n💡 لقد أخطأت ${freq} مرات في هذا الدرس. قبل السؤال، خذ 90 ثانية لقراءة بروتوكول الدراسة: «كيف أدرس العلوم؟» — ستجده في قسم الإرشاد.\n`
      : '';

  const text = `🎯 **مهمة اليوم (3 دقائق):**\nالمجال: **${domain?.title || ''}**\n\nركّز على: **${card.title}**\n${bacLine}${guideLine}\n1. اقرأ بطاقة المعرفة أدناه.\n2. اجب على سؤال التثبيت.\n\nالمكافأة: +15 XP وتعبئة الرادار! ⚡\n\n---\n🧩 **${card.title}**\n\n${card.shortAnswer}\n\n🔑 ${card.keywords.join(' • ')}`;

  // F10 : sans session.currentQuiz positionnée, l'élève voyait bien la question
  // mais sa réponse tombait sur « لا يوجد اختبار جارٍ حالياً » (gradeQuizAnswer
  // n'était jamais atteint) → +15 XP promis n'était jamais versé, et la
  // mission n'était jamais clôturée (rejouable à l'infini, XP non compté).
  if (quiz) {
    const missionSession = startQuiz(session, 1, quiz.id, 'quiz', card.id);
    return { session: missionSession, action: { text, quiz: toQuizPrompt(quiz), quickActions: [], sources: [{ type: 'internal_card' as SourceType, title: card.title }] } };
  }

  return { session, action: { text, quickActions: ['العودة للقائمة الرئيسية'], sources: [{ type: 'internal_card' as SourceType, title: card.title }] } };
}

export const METHODOLOGY_SUGGESTIONS: string[] = [
  'كيف أحلل وثيقة؟',
  'اعطني قالب فرضية',
  'ما الفرق بين استخرج واستنتج؟',
  'كيف أعلل أو أبرر؟',
  'كيف أكتب نصا علميا؟',
];
