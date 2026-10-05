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
  algeriaDateKey,
  type BotSession,
  type TopicLearningStat,
} from './utils/sessionManager';
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
import { TUTOR_KNOWLEDGE, type TutorKnowledgeChunk } from './tutorKnowledge';
import { BOOK_TUTOR_QA, findBestBookQA, type BookTutorQA } from './bookTutorQA';
import { findBestMethodologyQA } from './methodologyKnowledge';
import { LESSON_INDEX } from './data/lessonIndex';
// Fusion master 3e970d2 (2026-10-01) : R6 pondère les erreurs par le poids
// BAC des unités (unitOpenings) ; R8 affiche le compte à rebours BAC.
import { UNIT_OPENINGS } from './data/unitOpenings';
import { NON_EXIGIBLES } from './data/curriculumOfficial';
import { BAC_EXAM_DATE, bacDaysLeft } from './utils/dashboardActions';
// Négation/réfutation : primitives partagées avec le scorer C2 de Tadwin.
import { tokenAffirme } from './lib/validation/negationAr';
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
  'اخبار اليوم', 'أخبار اليوم', 'اخبار', 'أخبار', 'سينما', 'فيلم', 'طبخ', 'اطبخ', 'أطبخ',
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
  // فصحى — peur, fatigue, découragement
  'خائف', 'خايف', 'خائفة', 'تعبت', 'مرهق', 'قلق', 'يائس', 'فاشل', 'ضائع', 'محبط',
  // darija algérienne — détection seulement, jamais en production
  'ضايع', 'ضعت', 'ما نقدرش', 'ماقدرش', 'حبست', 'ما فهمتش', 'مافهمتش',
  'ماععلاباليش', 'ماعلاباليش', 'صعيب علي', 'كرهت البكالوريا', 'كرهت الدراسة',
];

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

export function shuffledView(q: QuizQuestion): QuizQuestion {
  let s = hashSeed(q.id);
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

const OPUS_CHUNKS: SearchChunk[] = TUTOR_KNOWLEDGE.map((c: TutorKnowledgeChunk) => ({
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

/** Index des leçons (47 HTML + 20 actives) — lot « index leçons » 2026-09-24. */
const LESSON_CHUNKS: SearchChunk[] = LESSON_INDEX.map((c) => ({
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

const ALL_CHUNKS: SearchChunk[] = [...GUIDE_CHUNKS, ...LEGACY_CHUNKS, ...BOOK_CHUNKS, ...OPUS_CHUNKS, ...LESSON_CHUNKS];

/* -------------------------------------------------------------------------- *
 * Détecteur « IN-DOMAINE » positif (R2 audit qualité Morchid 2026-09-29).    *
 *                                                                            *
 * Avant, le hors-sujet reposait sur une LISTE NOIRE figée (foot, cinéma…).   *
 * Une question hors programme non listée traversait toute la cascade et      *
 * renvoyait un extrait SVT peu pertinent (confiance 70) au lieu d'un franc   *
 * « hors programme ». On calcule désormais un SIGNAL DE DOMAINE positif :    *
 * la question doit partager du vocabulaire avec au moins une base.           *
 *                                                                            *
 *   - DOMAIN_VOCAB      : gros vocabulaire (tous les tokens ≥3 des titres,   *
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

const DOMAIN_VOCAB: Set<string> = (() => {
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
  for (const ch of ALL_CHUNKS) {
    add(ch.normTitle);
    ch.normAliases.forEach((a) => add(a));
    ch.normKeywords.forEach((k) => add(k));
  }
  for (const d of DOMAINS) add(d.title);
  return vocab;
})();

/** Termes pédagogiques/commandes qui SONT dans le périmètre même s'ils ne
 *  nomment pas un concept SVT (ex. clic sur un bouton « دليل الإجابة »). Évite
 *  qu'une commande d'étude soit classée « hors programme ». */
const PEDAGOGICAL_TERMS = [
  'منهجيه', 'بروتوكول', 'دراسه', 'وحده', 'خطوات', 'دليل', 'الاجابه', 'اجابه',
  'تجارب', 'تجربه', 'البكالوريا', 'بكالوريا', 'مراجعه', 'تلخيص', 'ملخص', 'تمرين',
  'تمارين', 'سؤال', 'اسئله', 'شرح', 'تعريف', 'مقارنه', 'اختبار', 'تشخيصي', 'الدروس', 'درس',
].map((t) => normalizeArabic(t)).filter((t) => t.length >= 3);
for (const t of PEDAGOGICAL_TERMS) DOMAIN_VOCAB.add(t);

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
  for (const t of content) if (DOMAIN_VOCAB.has(t)) return true;
  for (const t of content) {
    if (t.length < 4) continue;
    if (DOMAIN_CORE_VOCAB.some((core) => fuzzyTokenEquals(t, core))) return true;
  }
  return false;
}

function findNonExigible(norm: string): { terme: string; raison: string } | null {
  // « متمم إنزيمي » = cofacteur enzymatique, à ne pas confondre avec le
  // système immunitaire du complément explicitement non exigible.
  const enzymeCofactor =
    (includesAsWord(norm, normalizeArabic('متمم')) || includesAsWord(norm, normalizeArabic('المتمم'))) &&
    (norm.includes(normalizeArabic('إنزيمي')) || norm.includes(normalizeArabic('انزيمي')));
  if (!enzymeCofactor && includesAsWord(norm, normalizeArabic('المتمم'))) {
    return NON_EXIGIBLES.find((x) => x.terme === 'المتمم') ?? null;
  }
  if (norm.includes(normalizeArabic('أسيلوسكوب')) || norm.includes(normalizeArabic('اسيلوسكوب'))) {
    return NON_EXIGIBLES.find((x) => x.terme.includes('الأسيلوسكوب')) ?? null;
  }
  if (norm.includes(normalizeArabic('نضج')) && norm.includes('arnm')) {
    return NON_EXIGIBLES.find((x) => x.terme.includes('ARNm')) ?? null;
  }
  return null;
}

function nonExigibleResult(session: BotSession, item: { terme: string; raison: string }): EngineResult {
  return {
    session,
    action: {
      confidence: 100,
      text:
        `ℹ️ **${item.terme} غير مطلوب في بكالوريا 3AS حسب التدرج الرسمي.**\n\n` +
        `قد تجده في الكتاب أو كمعلومة إثرائية، لكن لا تجعله أولوية في الحفظ أو المراجعة. ` +
        `المرجع: التدرج السنوي للتعلمات 2017، الصفحة 6 — ${item.raison}.`,
      quickActions: ['العودة للقائمة الرئيسية'],
      sources: [{ type: 'guide' as SourceType, title: 'التدرج الرسمي 2017 — ص. 6' }],
    },
  };
}

/** Réponses directes aux misconceptions critiques : le routeur lexical ne doit
 * pas éluder une proposition fausse derrière une fiche générique. */
function misconceptionResult(session: BotSession, norm: string): EngineResult | null {
  const has = (s: string) => norm.includes(normalizeArabic(s));
  const negated = has('لا ينتج') || has('ليس') || has('لا يعطي');

  if (has('تنفس') && norm.includes('atp') && (has('كم') || has('عدد') || has('حصيلة') || has('ينتج') || negated)) {
    return {
      session,
      action: {
        confidence: 100,
        text:
          `${negated ? '❌ **العبارة خاطئة:** التنفس ينتج ATP.\n\n' : ''}` +
          'وفق الحصيلة المعتمدة في برنامج 3AS الجزائري، ينتج التنفس الهوائي الكامل **38 ATP** لكل جزيئة غلوكوز، مقابل **2 ATP** فقط في التخمر.',
        quickActions: ['ما الفرق بين التنفس والتخمر؟'],
        sources: [{ type: 'book' as SourceType, title: 'دليل الأستاذ 3AS — حصيلة التنفس' }],
      },
    };
  }

  if ((has('انزيم') || has('أنزيم') || has('إنزيم')) && has('بروتين') && has('ليس')) {
    return {
      session,
      action: {
        confidence: 95,
        text: '❌ **العبارة خاطئة حسب البرنامج:** الإنزيم بروتين ذو بنية فراغية وموقع فعّال، يسرّع تفاعلاً نوعياً دون أن يُستهلك.',
        quickActions: ['ما هو الموقع الفعال؟'],
        sources: [{ type: 'internal_card' as SourceType, title: 'النشاط الإنزيمي' }],
      },
    };
  }

  if (has('غوص') && has('صعود')) {
    return {
      session,
      action: {
        confidence: 95,
        text: '❌ **لا.** الغوص هو اندساس صفيحة محيطية كثيفة تحت صفيحة أخرى عند حدود التقارب؛ أمّا الصعود فيخص الصهارة المتولدة جزئياً فوق الصفيحة الغائصة.',
        quickActions: ['اشرح الغوص'],
        sources: [{ type: 'internal_card' as SourceType, title: 'الغوص (Subduction)' }],
      },
    };
  }

  return null;
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
function buildRecallQuestion(card: KnowledgeCard): string {
  const kw = card.keywords.filter((k) => k.length >= 3);
  const discriminator = kw[0] ?? card.title;
  const second = kw[1] ?? discriminator;
  return (
    `\n\n🧠 **قبل أن ننتقل:** سؤال واحد يقفل الحصّة.\n` +
    `صح أم خطأ: **${discriminator}** مرتبط مباشرةً بـ **${second}** في هذا الدرس.\n` +
    `أجب بكلمة واحدة — إن أخطأت، نعيد الجملة لا الدرس.`
  );
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
  const hit = card.probe!.expect.some((e) => {
    const ne = normalizeArabic(e);
    return ne.length <= 2 ? includesAsWord(normAns, ne) : normAns.includes(ne);
  });
  const verdict = hit
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

export function searchAllBases(norm: string, activeDomainId: number | null): SearchChunk[] {
  if (!norm || norm.length < 3) return [];
  const inputTokens = tokenizeArabic(norm);
  return ALL_CHUNKS.map((ch) => ({ ch, score: scoreChunk(norm, ch, activeDomainId, inputTokens) }))
    .filter((x) => x.score >= 12)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.ch);
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

function buildAnswer(norm: string, activeDomainId: number | null): TutorAction | null {
  if (!norm || norm.length < 3) return null;
  const scored = findBestKnowledgeCardScored(norm, activeDomainId);

  if (scored) {
    const scienceCard = scored.card;
    const confidence = confidenceFromCardScore(scored.score, scored.exact);
    const microHit = findMicroAnswer(scienceCard, norm);
    if (microHit) {
      return {
        confidence,
        text: `🎯 **${scienceCard.title}**\n\n${microHit}`,
        quickActions: filterQuickActions(scienceCard.relatedQuestions, norm),
        sources: [{ type: 'internal_card' as SourceType, title: scienceCard.title }],
      };
    }
    return {
      confidence,
      text: `🧩 **${scienceCard.title}**\n\n${scienceCard.shortAnswer}\n\n🔑 كلمات مفتاحية: ${scienceCard.keywords.join(' • ')}${buildRecallQuestion(scienceCard)}`,
      quickActions: filterQuickActions(scienceCard.relatedQuestions, norm),
      sources: [{ type: 'internal_card' as SourceType, title: scienceCard.title }],
    };
  }

  const hits = searchAllBases(norm, activeDomainId);
  if (hits.length === 0) return null;

  const best = hits[0];
  const extrait = couperExtrait(best.text);
  let sourceType: SourceType = 'opus';
  if (best.type === 'book') sourceType = 'book';
  else if (best.type === 'card') sourceType = 'legacy_card';
  else if (best.type === 'guide') sourceType = 'guide';
  else if (best.type === 'lesson') sourceType = 'lesson';

  return {
    // R5 : la recherche brute (fallback) est moins fiable qu'une carte
    // curatée — confiance plafonnée à 70.
    confidence: 70,
    text: `📚 **${best.title}**\n\n${extrait.text}${extrait.truncated ? ' …' : ''}`,
    quickActions: best.followUp ? filterQuickActions([best.followUp], norm) : [],
    sources: [{ type: sourceType, title: best.title }],
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
  const newSession = startDomainSession(domainId, session.mistakes, session.topicStats);
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
function includesAsWord(haystack: string, needle: string): boolean {
  if (!needle) return false;
  if (needle.includes(' ')) return haystack.includes(needle);
  // Lettres/chiffres « de mot » : on EXCLUT la ponctuation arabe (؟ ، ؛) qui
  // appartient pourtant au bloc U+0600–U+06FF, sinon « الغوص؟ » ne vaudrait
  // jamais « الغوص ».
  const isWordChar = (ch: string | undefined) =>
    typeof ch === 'string' && /[\u0621-\u063A\u0641-\u064A\u0660-\u0669A-Za-z0-9]/.test(ch);
  let from = 0;
  while (true) {
    const idx = haystack.indexOf(needle, from);
    if (idx < 0) return false;
    let s = idx;
    while (s > 0 && isWordChar(haystack[s - 1])) s -= 1;
    let e = idx + needle.length;
    while (e < haystack.length && isWordChar(haystack[e])) e += 1;
    const word = haystack.slice(s, e);
    if (word === needle || word === `ال${needle}`) return true;
    from = idx + 1;
  }
}

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

/** Variante scorée (R4 audit/G4) : permet d'alimenter `confidence` partout. */
function findBestKnowledgeCardScored(
  input: string,
  activeDomainId: number | null,
): { card: KnowledgeCard; score: number; exact: boolean } | null {
  const norm = normalizeArabic(input);
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
  const questionIds = questions.map((q) => q.id);
  const newSession = startQuiz(session, questionIds.length, first.id, 'diagnostic', undefined, questionIds);
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
  // La séquence appartient à l'état du quiz. Le fallback sur la banque du
  // domaine ne sert qu'aux anciennes sessions persistées sans `questionIds`.
  const orderedIds = current.questionIds;
  const nextId = orderedIds
    ? orderedIds[current.questionIndex + 1] ?? null
    : (() => {
        const legacyQuestions = getQuestionsForDomain(question.domainId);
        const legacyIndex = legacyQuestions.findIndex((q) => q.id === question.id);
        return legacyIndex >= 0 ? legacyQuestions[legacyIndex + 1]?.id ?? null : null;
      })();
  const nextQ = nextId ? getQuestionById(nextId) : undefined;
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
 *  LESSON_INDEX par recouvrement de tokens (titre + alias + mots-clés) du
 *  point-clé manqué. Aucun lien inventé : si rien ne recoupe, on le dit. */
function findLessonForKeyPoint(kp: string): { lessonKey: string; title: string } | null {
  const nk = normalizeArabic(kp);
  const tokens = tokenizeArabic(nk).filter((t) => t.length >= 4);
  if (tokens.length === 0) return null;
  let best: { lessonKey: string; title: string; score: number } | null = null;
  for (const entry of LESSON_INDEX) {
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
  const norm = normalizeArabic(input);
  const n = (s: string) => normalizeArabic(s);

  if (norm.includes(n('القائمة الرئيسية')) || norm.includes(n('العودة للقائمة')) || norm.includes(n('رجوع للقائمة'))) {
    // B5 (audit Morchid 2026-09-25) : l'accueil réinitialise la NAVIGATION mais
    // préserve le SUIVI — erreurs, défis BAC déjà complétés (garde-fou anti-farm)
    // et date de la mission quotidienne. Sans cela, retourner à l'accueil effaçait
    // completedBac et permettait de re-gagner l'XP d'un défi BAC déjà récompensé.
    const back: BotSession = {
      ...getDefaultSession(),
      mistakes: [...session.mistakes],
      topicStats: { ...(session.topicStats ?? {}) },
      completedBac: [...session.completedBac],
      lastMissionDate: session.lastMissionDate,
    };
    saveSession(back);
    return { session: back, action: { text: '↩️ رجعنا إلى القائمة الرئيسية. اختر مجالاً لبدء جلسة مراجعة:', quickActions: DOMAINS.map((d) => d.title) } };
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
        const s2: BotSession = { ...session, pendingProbeCardId: null, probeBypassed: bypassed };
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
      const s2: BotSession = { ...session, pendingProbeCardId: null };
      saveSession(s2);
      return { session: s2, action: probeVerdictThenContent(probeCard, rawInput) };
    }
    // Intention forte ou saisie vide : libérer le probe, poursuivre le flux.
    const s2: BotSession = { ...session, pendingProbeCardId: null };
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
        // Ordre explicite et déterministe : la suite reste dans CE pool au lieu
        // de continuer accidentellement dans toute la banque du domaine.
        const questionIds = pool.map((q) => q.id);
        const first = pool[0];
        const newSession = startQuiz(session, questionIds.length, first.id, 'quiz', undefined, questionIds);
        return {
          session: newSession,
          action: {
            text: `🧪 اختبار سريع في **${card.title}** — ${pool.length} أسئلة. اكتب الحرف A أو B أو C أو D (أو 1 2 3 4) لكل سؤال.`,
            quiz: toQuizPrompt(first),
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

  const nonExigible = findNonExigible(norm);
  if (nonExigible) return nonExigibleResult(session, nonExigible);

  const misconception = misconceptionResult(session, norm);
  if (misconception) return misconception;

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
    return {
      session,
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
  if (!hasDomainSignal(tokenizeArabic(norm))) {
    return outOfScopeResult(session, rawInput || input);
  }

  const built = buildAnswer(norm, session.activeDomainId);
  if (built) return { session, action: built };

  const fallbackActions = session.activeDomainId
    ? DOMAINS.find((d) => d.id === session.activeDomainId)?.quickActions || ['العودة للقائمة الرئيسية']
    : DOMAINS.map((d) => d.title);

  return { session, action: { text: 'لم أجد إجابة دقيقة في قاعدتي المحلية. جرّب اختيار مجال، أو اطرح سؤالاً حول: التخصص الوظيفي للبروتينات، التحولات الطاقوية، أو التكتونية العامة.\n\n💡 أسئلة منهجية مقترحة:\n' + METHODOLOGY_SUGGESTIONS.map((s) => `• ${s}`).join('\n'), quickActions: fallbackActions } };
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

function pickDailyQuizForTopic(domainId: number, topicId: string, dayKey: string): QuizQuestion | undefined {
  const questions = getQuestionsForDomain(domainId);
  const candidates = questions.filter((q) => q.topicId === topicId);
  if (candidates.length === 0) return undefined;
  // Même sujet + même jour algérien = même question, donc reproduction exacte.
  const index = hashSeed(`${dayKey}:${domainId}:${topicId}`) % candidates.length;
  return candidates[index];
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

/** Classe les lacunes actives par fréquence réelle × poids BAC × oubli réel. */
function rankMistakes(
  mistakes: string[],
  topicStats: Record<string, TopicLearningStat>,
  now: number = Date.now(),
): string[] {
  const scored = mistakes.map((topicId, stableIndex) => {
    const card = getCardById(topicId);
    const weight = weightForTopic(topicId, card?.domainId ?? null);
    const stat = topicStats[topicId];
    const wrongCount = Math.max(1, stat?.wrongCount ?? 1);
    const referenceTime = stat?.lastWrongAt ?? now;
    const daysSince = Math.max(0, (now - referenceTime) / 86_400_000);
    const oubli = Math.min(daysSince, 14) / 14;
    return { topicId, stableIndex, score: wrongCount * weight * (0.5 + oubli) };
  });

  scored.sort((a, b) => (b.score - a.score) || (a.stableIndex - b.stableIndex) || a.topicId.localeCompare(b.topicId));
  return scored.map((x) => x.topicId);
}

export function getDailyMission(session: BotSession): EngineResult {
  const today = algeriaDateKey();
  if (session.lastMissionDate === today) {
    return { session, action: { text: '✅ لقد أنجزت مهمة اليوم بنجاح! عُد غداً لمهمة جديدة، أو تابع مراجعتك بحرية.', quickActions: ['اختبار تشخيصي', 'العودة للقائمة الرئيسية'] } };
  }

  let targetTopicId: string | null = null;
  let targetDomainId: number | null = session.activeDomainId;

  if (session.mistakes.length > 0) {
    // R6 : mistakes[0] → rankMistakes (fréquence × poids BAC × oubli).
    targetTopicId = rankMistakes(session.mistakes, session.topicStats ?? {})[0] ?? null;
    const card0 = targetTopicId ? getCardById(targetTopicId) : null;
    if (card0) targetDomainId = card0.domainId;
  } else if (session.activeDomainId) {
    const cards = KNOWLEDGE_CARDS.filter((c) => c.domainId === session.activeDomainId);
    if (cards.length > 0) targetTopicId = cards[0].id;
  } else {
    if (KNOWLEDGE_CARDS.length > 0) {
      targetTopicId = KNOWLEDGE_CARDS[0].id;
      targetDomainId = KNOWLEDGE_CARDS[0].domainId;
    }
  }

  if (!targetTopicId) {
    return { session, action: { text: '🎯 مهمة اليوم: اختر مجالاً أولاً، ثم ابدأ اختباراً تشخيصياً سريعاً لتفعيل المهمة!', quickActions: DOMAINS.map((d) => d.title) } };
  }

  const card = getCardById(targetTopicId);
  if (!card) return { session, action: { text: 'خطأ في تحميل المهمة.', quickActions: ['العودة للقائمة الرئيسية'] } };

  const domain = DOMAINS.find((d) => d.id === (targetDomainId ?? card.domainId));
  const quiz = pickDailyQuizForTopic(card.domainId, card.id, today);
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
  const freq = session.topicStats?.[targetTopicId]?.wrongCount ?? 0;
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
    const missionSession = startQuiz(session, 1, quiz.id, 'quiz', card.id, [quiz.id]);
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
