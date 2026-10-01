import {
  resetSession,
  saveSession,
  getDefaultSession,
  startDomainSession,
  startQuiz,
  recordQuizAnswer,
  startBossFightSession,
  startBossStep,
  finishBossFight,
  completeDailyMission,
  type BotSession,
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
  type BossFightScenario,
} from './data/smartBotData';
import { TUTOR_KNOWLEDGE, type TutorKnowledgeChunk } from './tutorKnowledge';
import { BOOK_TUTOR_QA, findBestBookQA, type BookTutorQA } from './bookTutorQA';
import { findBestMethodologyQA } from './methodologyKnowledge';
import { LESSON_INDEX } from './data/lessonIndex';
import { UNIT_OPENINGS } from './data/unitOpenings';
import { BAC_EXAM_DATE, bacDaysLeft } from './utils/dashboardActions';
import {
  KNOWLEDGE_CARDS as LEGACY_KNOWLEDGE_CARDS,
  type KnowledgeCard as LegacyKnowledgeCard,
} from './knowledgeCards';
import { STUDY_GUIDE_CARDS, type StudyGuideCard } from './studyGuide';
import { SYNONYM_GROUPS } from './lib/validation/synonyms';
import { detecterStuffing } from './lib/validation/stuffingDetector';
import {
  adjacentNegation,
  clauseIsDenial,
  tokenAffirme,
} from './lib/validation/negationAr';
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
  'اخبار اليوم', 'أخبار اليوم', 'اخبار', 'أخبار', 'سينما', 'فيلم',
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
    if (kw && kw.length >= 3 && norm.includes(kw)) {
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
      if (nk.length >= 3 && norm.includes(nk)) score += 8;
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
      text: `🧩 **${scienceCard.title}**\n\n${scienceCard.shortAnswer}\n\n🔑 كلمات مفتاحية: ${scienceCard.keywords.join(' • ')}`,
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
  const newSession = startDomainSession(domainId, session.mistakes);
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

      // ── R10 (audit Morchid 2026-10-01) : on célèbre le GAIN, pas la
      // présence. Avant, le message était « مهمة اليوم مكتملة! كسبت 15 XP » —
      // de la dopamine pure, vide : l'élève ne savait PAS ce qu'il avait
      // appris. Désormais on nomme le point-clé maîtrisé (ou, en cas
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
  const text = `⚔️ **تحدي BAC** — مجال ${domain.title}\n` +
    (replay ? '🏆 سبق إتمامك هذا التحدي — إعادة بدون XP إضافي.\n' : '') +
    `ستُطرح عليك ${scenarios.length} وضعية مشكلة. اكتب إجابتك وسيقوّمها المرشد آلياً وفق النقاط الأساسية.\n\n${first.situation}\n\n📝 اكتب إجابتك، أو اختر «لا أعرف» لطلب فكرة.`;
  return { session: newSession, action: { text, quickActions: ['لا أعرف'], sources: [{ type: 'domain' as SourceType, title: 'تحدي BAC' }] } };
}

/**
 * B2 (audit Morchid 2026-09-25) : une clause qui s'ouvre par une forme de
 *  réfutation (« ليس صحيحاً أن… », « أرفض… », « مستحيل… ») nie tout point-clé
 *  qu'elle reprend. Une réponse niant chaque point-clé obtenait 10/10.
 *  Primitives extraites dans lib/validation/negationAr.ts (partagées avec le
 *  scorer C2 de Tadwin).
 */

/**
 * R5 (audit Morchid 2026-10-01) : la détresse n'est jamais hors programme.
 * Avant, un élève qui écrivait « راني خايف من الباك » ne touchait AUCUN token
 * de DOMAIN_VOCAB → hasDomainSignal renvoyait false → outOfScopeResult. Le
 * moment où l'élève avait le plus besoin d'un humain était exactement celui où
 * Morchid le rejetait (« هذا السؤال خارج قاعدة علوم الطبيعة »).
 *
 * Le lexique d'affect (arabe standard + darija algérien) est testé AVANT tout
 * autre traitement et déclenche une réponse de soutien : écoute en une ligne,
 * réduction de charge (une seule action, 10 minutes), jamais un refus.
 */
const AFFECT_LEXICON: string[] = [
  // Peur / angoisse
  'خايف', 'خايفة', 'خائف', 'خائفة', 'أخاف', 'أخافني', 'فزع', 'فزعت', 'مرعوب',
  // Épuisement
  'تعبت', 'متعب', 'متعة', 'مرهق', 'مرهقة', 'لا أستطيع', 'ما نقدرش', 'ما قدرتش',
  // Découragement
  'محبط', 'محبطة', 'احباط', 'فاشل', 'فاشلة', 'فشلت', 'ضايع', 'ضائع', 'تائه',
  // Blocage
  'حابس', 'محشور', 'حائر', 'حيرة', 'مرتبك', 'مرتبكة',
  // Pression / urgence (légitimes seuls en question de cours, mais utiles en
  // combinaison avec un mot d'affect)
  'الباك', 'البكالوريا', 'الامتحان', 'الامتحانات', 'الموعد', 'الوقت',
].map((w) => normalizeArabic(w)).filter((w) => w.length >= 3);

/** Détresse = un terme d'ÉMOTION (peur/épuisement/échec/blocage). Les termes
 *  d'épreuve (« الباك ») seuls ne suffisent pas — ils sont légitimes dans une
 *  question de cours : il faut un mot d'affect pour déclencher. */
const AFFECT_CORE: string[] = AFFECT_LEXICON.filter((w) =>
  [
    'خايف', 'خائف', 'أخاف', 'فزع', 'مرعوب', 'تعبت', 'متعب', 'مرهق',
    'ما نقدرش', 'لا أستطيع', 'محبط', 'احباط', 'فاشل', 'فشلت',
    'ضايع', 'ضائع', 'تائه', 'حابس', 'محشور', 'حائر', 'مرتبك',
  ].includes(w),
);

function hasAffectSignal(inputTokens: string[]): boolean {
  const normSet = new Set(inputTokens);
  return AFFECT_CORE.some((w) => normSet.has(w) || inputTokens.some((t) => fuzzyTokenEquals(t, w)));
}

/**
 * R5 : réponse de soutien. Structure imposée par l'audit — écoute brève (1
 * ligne), reconnaissance (le stress signifie qu'on se soucie, pas qu'on est
 * incapable), réduction de charge (UNE action de 10 minutes, pas tout le
 * programme), puis l'élève garde la main.
 */
function supportResult(session: BotSession): EngineResult {
  const lastMistakeId = session.mistakes[session.mistakes.length - 1] ?? null;
  const lastCard = lastMistakeId ? getCardById(lastMistakeId) : null;
  const action = lastCard ? `**${lastCard.title}**` : 'درساً واحداً';
  return {
    session,
    action: {
      confidence: 100,
      text:
        `سمعتك. الخوف قبل البكالوريا طبيعي — ومعناه أنّك تهتم، لا أنّك عاجز.\n\n` +
        `لن نراجع كل شيء اليوم. سنراجع **شيئاً واحداً**، لمدة **10 دقائق**، ثم تتوقف.\n\n` +
        (lastCard
          ? `آخر خطأ لك كان في: ${action}.\nابدأ به. 10 دقائق فقط. أنا هنا بعدها.\n\n🎯 بعد العشر دقائق، اختر: «راجع أخطائي السابقة» أو «مهمة اليوم».`
          : `اختر درساً واحداً فقط — الأقصر أو الأكثر ألفة — واكتب سطراً واحداً عنه.\n10 دقائق فقط. أنا هنا بعدها.\n\n🎯 بعد العشر دقائق، اختر: «مهمة اليوم» أو «العودة للقائمة الرئيسية».`),
      quickActions: lastCard
        ? [`راجع ${lastCard.title}`, 'راجع أخطائي السابقة', 'العودة للقائمة الرئيسية']
        : ['مهمة اليوم', 'العودة للقائمة الرئيسية'],
      sources: [{ type: 'out_of_scope' as SourceType, title: 'دعم نفسي' }],
    },
  };
}
/** Un point-clé est couvert s'il apparaît dans une clause NON réfutée, et sans
 *  inversion de polarité par rapport au point-clé attendu (si l'attendu dit
 *  « لا تنتقل », une réponse « لا تنتقل » reste juste). */
function tokenAffirmed(normAnswer: string, token: string, normKp: string): boolean {
  return tokenAffirme(normAnswer, token, normKp);
}

/**
 * Auto-évaluation honnête (recommandation audit #3) : la couverture des
 * points-clés du scénario par la réponse remplace l'auto-note (+10/+5/0)
 * que l'élève se donnait lui-même — l'XP n'est plus fermable au clic.
 * Barème : ≥ 50 % des mots-clés couverts = 10 pts · ≥ 20 % = 5 pts · sinon 0.
 */
function gradeKeyPoints(answer: string, keyPoints: string[]): number {
  const normAnswer = normalizeArabic(answer);
  const tokens = new Set(tokenizeArabic(normAnswer).filter((t) => t.length >= 3));
  if (tokens.size === 0) return 0;
  // token -> point-clé normalisé qui l'a produit (pour la comparaison de polarité)
  const expected = new Map<string, string>();
  for (const kp of keyPoints) {
    const nk = normalizeArabic(kp);
    for (const t of tokenizeArabic(nk)) {
      if (t.length >= 3 && !expected.has(t)) expected.set(t, nk);
    }
  }
  if (expected.size === 0) return 0;
  let hits = 0;
  for (const [t, nk] of expected) {
    if (tokenAffirmed(normAnswer, t, nk)) hits += 1;
  }
  const coverage = hits / expected.size;
  const score = coverage >= 0.5 ? 10 : coverage >= 0.2 ? 5 : 0;

  // R3 (audit 2026-09-29) : anti-bourrage lexical. La couverture de points-clés
  // pouvait être « farmée » en répétant le même terme (ex. « أنزيم أنزيم أنزيم »).
  // On réutilise le détecteur curé du projet : si la réponse est du bourrage,
  // le score est annulé — on ne récompense pas une copie sans contenu réel.
  if (score > 0 && detecterStuffing(answer).stuffing_detected) return 0;

  return score;
}

function handleBossInput(session: BotSession, rawInput: string): EngineResult {
  const boss = session.boss;
  if (!boss) return { session, action: { text: 'لا يوجد تحدي BAC جارٍ.', quickActions: ['العودة للقائمة الرئيسية'] } };
  const scenario = getBossScenarioById(boss.scenarioId);
  if (!scenario) {
    const finished = finishBossFight(session);
    return { session: finished, action: { text: 'انتهى التحدي.', quickActions: ['العودة للقائمة الرئيسية'] } };
  }
  // La phase « eval » (auto-note) n'existe plus : TOUTE saisie est notée
  // automatiquement — y compris les sessions héritées restées en 'eval'.
  const n = normalizeArabic(rawInput);
  const giveUp = n.includes(normalizeArabic('لا أعرف')) || n.includes(normalizeArabic('لم أجب'));

  // ── R1 (audit Morchid 2026-10-01) : la correction n'est plus un bouton. ──
  // Avant, « لا أعرف » affichait la correction modèle ET tous les points-clés
  // en un clic — zéro tentative, zéro indice. Cela vidait toute l'ingénierie
  // anti-triche de son sens pédagogique (règle d'or de studyGuide.ts : « لا
  // تفتح الحل النموذجي قبل محاولة كتابية حقيقية لمدة 20 إلى 25 دقيقة »).
  //
  // Nouveau contrat :
  //   - « لا أعرف » donne un INDICE (escalier de 3), pas la correction.
  //   - 2 tentatives écrites réelles (≥ 15 car.) débloquent la correction.
  //   - 3 indices consommés la débloquent aussi, mais score plafonné à 3/10.
  // ── R3 : la correction est refusée avant 90 s sans tentative écrite — la
  // règle d'or devient une contrainte du moteur, pas un texte décoratif.
  const openedAt = boss.openedAt ?? Date.now();
  const hintLevel = boss.hintLevel ?? 0;
  const attempts = boss.attempts ?? 0;
  const TENTATIVE_MIN = 15;
  const DELAI_MIN_MS = 90_000;

  const hintActions = ['لا أعرف'];
  const correctionActions = ['راجع أخطائي السابقة', 'العودة للقائمة الرئيسية'];

  // Une « vraie » tentative : texte suffisamment long et qui n'est pas un
  // abandon déguisé (« لا أعرف », « لم أجب »).
  const isRealAttempt = !giveUp && n.replace(/[^؀-ۿ]/g, '').length >= TENTATIVE_MIN;

  // Cas 1 — abandon : on monte d'un cran dans l'escalier d'indices.
  if (giveUp) {
    const nextHintLevel = hintLevel + 1;
    if (nextHintLevel < 3) {
      const hint = nextBossHint(scenario, nextHintLevel);
      const newSession: BotSession = {
        ...session,
        boss: { ...boss, hintLevel: nextHintLevel },
      };
      saveSession(newSession);
      const hintCount = 3 - nextHintLevel;
      return {
        session: newSession,
        action: {
          text:
            `${hint}\n\n💡 لا تزال أمامك ${hintCount} فرصة لتحاول بنفسك — أكتب جملة واحدة، ولو بسيطة.\n` +
            `📝 أو اختر «لا أعرف» مرة أخرى لعرض فكرة جديدة.`,
          quickActions: hintActions,
          sources: [{ type: 'domain' as SourceType, title: 'تحدي BAC' }],
        },
      };
    }
    // 3 indices consommés : la correction se débloque, score plafonné.
    const points = 3;
    return finishBossStepWithCorrection(session, scenario, points, openedAt, attempts, DELAI_MIN_MS, hintActions);
  }

  // Cas 2 — tentative écrite : on compte, on note, puis on décide.
  const nextAttempts = attempts + (isRealAttempt ? 1 : 0);

  if (nextAttempts >= 2) {
    // R1 : 2 tentatives réelles → correction ET score plein.
    const points = isRealAttempt ? gradeKeyPoints(rawInput, scenario.keyPoints) : 0;
    return finishBossStepWithCorrection(session, scenario, points, openedAt, nextAttempts, DELAI_MIN_MS, hintActions);
  }

  // Cas 3 — première tentative (insuffisante pour débloquer) : feedback ciblé
  // qui nomme CE qui manque, sans jamais afficher la correction complète.
  if (isRealAttempt) {
    const points = gradeKeyPoints(rawInput, scenario.keyPoints);
    const missed = missedKeyPoints(rawInput, scenario.keyPoints);
    const newSession: BotSession = {
      ...session,
      boss: { ...boss, attempts: nextAttempts, hintLevel: Math.max(hintLevel, 1) },
    };
    saveSession(newSession);
    const hint = nextBossHint(scenario, Math.max(hintLevel, 1));
    return {
      session: newSession,
      action: {
        text:
          `🔍 محاولتك الأولى مُسجَّلة (${points}/10).\n\n` +
          (missed.length > 0
            ? `نقص واضح: **${missed[0]}** — الفكرة غائبة من جوابك.\n\n`
            : '') +
          `${hint}\n\n` +
          `📝 اكتب محاولة ثانية تتضمّن ما نَقص، وستُفتح لك التصحيح النموذجي بكامله.`,
        quickActions: hintActions,
        sources: [{ type: 'domain' as SourceType, title: 'تحدي BAC' }],
      },
    };
  }

  // Cas 4 — saisie trop courte / non arabe : on demande une vraie tentative.
  const newSession: BotSession = { ...session, boss: { ...boss } };
  saveSession(newSession);
  return {
    session: newSession,
    action: {
      text:
        `✏️ محاولة قصيرة جداً. اكتب جملة واحدة على الأقل (15 حرفاً) عن الوضعية.\n` +
        `💡 أو اختر «لا أعرف» للحصول على فكرة تمهيدية.`,
      quickActions: hintActions,
      sources: [{ type: 'domain' as SourceType, title: 'تحدي BAC' }],
    },
  };
}

/**
 * R3 (audit Morchid) : la règle d'or « pas de correction avant 20-25 min »
 * devient une contrainte du moteur. Avant 90 s sans AUCUNE tentative écrite,
 * la correction est refusée — l'élève doit au moins avoir essayé.
 * Cette fonction gère le dénouement commun : correction affichée (ou refusée
 * si trop tôt) puis passage à la suite ou fin du défi.
 */
function finishBossStepWithCorrection(
  session: BotSession,
  scenario: BossFightScenario,
  points: number,
  openedAt: number,
  attempts: number,
  delaiMinMs: number,
  hintActions: string[],
): EngineResult {
  const boss = session.boss;
  if (!boss) return { session, action: { text: 'انتهى التحدي.', quickActions: ['العودة للقائمة الرئيسية'] } };

  // R3 : refus de la correction si l'élève n'a pas attendu 90 s SANS tentative.
  // S'il a écrit (attempts ≥ 1), il a prouvé son effort : pas de délai.
  const tropTot = attempts === 0 && Date.now() - openedAt < delaiMinMs;
  if (tropTot) {
    const restant = Math.max(1, Math.ceil((delaiMinMs - (Date.now() - openedAt)) / 1000));
    const newSession: BotSession = { ...session, boss: { ...boss } };
    saveSession(newSession);
    return {
      session: newSession,
      action: {
        text:
          `⏱️ قبل التصحيح، جرب ولو جملة واحدة. حاول أن تكتب خلال 90 ثانية.\n` +
          `بقي لك حوالي ${restant} ثانية — اكتب ما فهمته من الوثيقة، ولو كان ناقصاً.`,
        quickActions: hintActions,
        sources: [{ type: 'domain' as SourceType, title: 'تحدي BAC' }],
      },
    };
  }

  const correctionText =
    `✅ **التصحيح النموذجي**\n\n${scenario.correction}\n\n🔑 **النقاط الأساسية:**\n${scenario.keyPoints.map((p) => `- ${p}`).join('\n')}` +
    `\n\n🎯 نقاطك لهذه الوضعية: ${points}/10`;
  const scenarios = getBossScenariosForDomain(session.activeDomainId);
  const idx = scenarios.findIndex((s) => s.id === boss.scenarioId);
  const next = idx >= 0 ? scenarios[idx + 1] : undefined;
  if (next) {
    const newSession = startBossStep(session, points, next.id, boss.questionIndex + 1);
    const text = `${correctionText}\n\n➡️ **السؤال التالي (${boss.questionIndex + 2}/${boss.totalQuestions})**\n\n${next.situation}\n\n📝 اكتب إجابتك، أو اختر «لا أعرف» لطلب فكرة.`;
    return { session: newSession, action: { text, quickActions: ['لا أعرف'], sources: [{ type: 'domain' as SourceType, title: 'تحدي BAC' }] } };
  }

  // ── R4 (audit Morchid) : un score n'est plus un adjectif. Tout bilan de
  // défi contient OBLIGATOIREMENT : la cause exacte (quels points-clés ont
  // manqué), une action de moins de 15 minutes, et un lien vers la leçon.
  const total = boss.score + points;
  const max = boss.totalQuestions * 10;
  const pct = max > 0 ? Math.round((total / max) * 100) : 0;
  // Anti-farm : l'XP n'est accordé qu'à la PREMIÈRE complétion du domaine.
  const domainKey = String(session.activeDomainId ?? '');
  const firstTime = domainKey !== '' && !session.completedBac.includes(domainKey);
  const finished = finishBossFight(session);
  const newSession: BotSession = firstTime
    ? { ...finished, completedBac: [...finished.completedBac, domainKey] }
    : finished;
  saveSession(newSession);
  const domain = DOMAINS.find((d) => d.id === session.activeDomainId);

  const bilan = buildBossBilan(scenario, domain?.title ?? '', pct, total, max);

  const text =
    `🏁 **انتهى تحدي BAC!**\nنتيجتك: ${total}/${max} نقطة (${pct}%).\n` +
    bilan +
    (firstTime ? '' : '\n🏆 سبق إتمامك هذا التحدي — إعادة بدون XP إضافي.');
  return {
    session: newSession,
    action: {
      text,
      quickActions: ['راجع أخطائي السابقة', 'العودة للقائمة الرئيسية'],
      reward: { xpGained: firstTime ? total : 0, score: total, total: max, kind: 'mission', domain: domain?.title ?? '' },
      sources: [{ type: 'domain' as SourceType, title: 'تحدي BAC' }],
    },
  };
}

/**
 * R4 : construit le bilan de fin de défi — cause, action, porte. L'adjectif
 * seul (« يحتاج مراجعة ») est interdit : un verdict sans cause suivie d'une
 * action est une sanction déguisée.
 */
function buildBossBilan(scenario: BossFightScenario, domainTitle: string, pct: number, total: number, max: number): string {
  if (pct >= 80) {
    return `\n**الخلاصة:** إتقان واضح للنقاط الأساسية. ${total}/${max}.\n` +
      `🎯 الخطوة التالية: انتقل إلى وضعيات النقل (تحديات أعمق) في نفس المجال.`;
  }
  if (pct >= 50) {
    return `\n**الخلاصة:** أساس جيد، لكن توجد ثغرات.\n` +
      `🎯 الخطوة التالية: راجع النقاط الناقصة في الدرس المرتبط، ثم أعد المحاولة.`;
  }
  return `\n**الخلل ليس في معرفتك — هو في خطوة واحدة.**\n` +
    `🎯 **عملك الآن (12 دقيقة):** أعد قراءة التصحيح النموذجي، ثم أعد كتابة المحاولة بإضافة سطر يبدأ بـ « ومنه نستنتج أنّ… ».\n` +
    `📖 الدرس المعني: ${domainTitle} — ابدأ من الوحدة الأولى للمجال.`;
}

/**
 * R1 : escalier d'indices. Chaque palier donne moins que la correction et plus
 * que le néant : on oriente l'élève SANS faire le travail à sa place.
 */
function nextBossHint(scenario: BossFightScenario, level: number): string {
  const first = scenario.keyPoints[0] ?? '';
  const second = scenario.keyPoints[1] ?? first;
  if (level === 1) {
    return `🔑 **مفتاح 1/3:** الوثيقة تقارن حالتين. ابدأ بجملة واحدة فقط:\n« انطلاقًا من الوثيقة، نلاحظ أنّ… »`;
  }
  if (level === 2) {
    return `🔑 **مفتاح 2/3:** الفكرة المركزية في هذه الوضعية هي:\n**${first}**\nحاول أن تربطها بجوابك.`;
  }
  return `🔑 **مفتاح 3/3:** النقطة الثانية المطلوبة:\n**${second}**\nالآن، اكتب جملتين تربطان هاتين الفكرتين.`;
}

/** R4 : liste les points-clés MANQUANTS dans la réponse de l'élève. */
function missedKeyPoints(answer: string, keyPoints: string[]): string[] {
  const normAnswer = normalizeArabic(answer);
  const missed: string[] = [];
  for (const kp of keyPoints) {
    const nk = normalizeArabic(kp);
    const tokens = tokenizeArabic(nk).filter((t) => t.length >= 3);
    const covered = tokens.some((t) => tokenAffirmed(normAnswer, t, nk));
    if (!covered) missed.push(kp);
  }
  return missed;
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

  // B7 (audit Morchid 2026-09-25) : « اختبرني (في X) » doit LANCER UN QCM sur le
  // sujet ciblé. Jusqu'ici l'intention tombait sur la recherche sémantique et
  // renvoyait une carte de cours : le bouton promettait un test, pas un cours.
  if (norm.includes(n('اختبرني'))) {
    const scored = findBestKnowledgeCardScored(norm, session.activeDomainId);
    const card = scored?.card ?? (session.activeDomainId != null
      ? KNOWLEDGE_CARDS.find((c) => c.domainId === session.activeDomainId) ?? null
      : null);
    if (card) {
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
    }
  }

  // ── R5 (audit Morchid 2026-10-01) : la détresse est testée AVANT le
  // hors-programme. « راني خايف من الباك » ne contient aucun token SVT →
  // l'ancien hasDomainSignal le classait hors programme et le rejetait au
  // pire moment. Le lexique d'affect court-circuite tout et déclenche le
  // soutien (une action de 10 minutes, jamais un refus).
  if (hasAffectSignal(tokenizeArabic(norm))) {
    return supportResult(session);
  }

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

    // ── R2 (audit Morchid 2026-10-01) : mode socratique. La fiche ne répond
    // plus par shortAnswer au premier message — elle pose D'ABORD une question
    // de vérification à réponse courte (probe). Le contenu n'arrive qu'après la
    // tentative de l'élève. Un élève qui demande deux fois la même chose (ou qui
    // répond à la probe) obtient le contenu complet : la probe n'est pas un
    // mur, c'est un palier.
    if (scienceCard.probe && session.lastProbeCard !== scienceCard.id) {
      const newSession: BotSession = { ...session, lastProbeCard: scienceCard.id, lastCardId: scienceCard.id };
      saveSession(newSession);
      return {
        session: newSession,
        action: {
          confidence,
          text:
            `🧩 **${scienceCard.title}**\n\n` +
            `قبل أن أجيب، سؤال واحد لك:\n**${scienceCard.probe}**\n` +
            `أجب بكلمة واحدة أو جملة قصيرة — ثم سأعطيك التفسير كاملاً.`,
          quickActions: filterQuickActions(scienceCard.relatedQuestions, norm),
          sources: [{ type: 'internal_card' as SourceType, title: scienceCard.title }],
        },
      };
    }

    // Soit la fiche n'a pas de probe, soit l'élève vient de répondre à la
    // probe, soit il a redemandé la même fiche : on sert le contenu.
    const newSession: BotSession = { ...session, lastProbeCard: null, lastCardId: scienceCard.id };
    saveSession(newSession);
    if (microHit) {
      return {
        session: newSession,
        action: {
          confidence,
          text: `🎯 **${scienceCard.title}**\n\n${microHit}`,
          quickActions: filterQuickActions(scienceCard.relatedQuestions, norm),
          sources: [{ type: 'internal_card' as SourceType, title: scienceCard.title }],
        },
      };
    }
    return {
      session: newSession,
      action: {
        confidence,
        text: `🧩 **${scienceCard.title}**\n\n${scienceCard.shortAnswer}\n\n🔑 كلمات مفتاحية: ${scienceCard.keywords.join(' • ')}`,
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
  return processStudentInput(getDefaultSession(), rawInput || '').action;
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
 * R6 (audit Morchid 2026-10-01) : priorisation réelle, pas index zéro.
 * getDailyMission prenait mistakes[0] — la PREMIÈRE erreur chronologique —
 * indépendamment de sa fréquence ou du poids BAC de l'unité. Un élève avec 9
 * erreurs en immunologie et 1 vieille erreur en tectonique était renvoyé vers
 * la tectonique : le moteur apprenait à l'élève que sa première erreur est sa
 * priorité éternelle.
 *
 * Nouveau score = fréquence (occurrences) × poids BAC de l'unité × oubli
 * (jours écoulés depuis la dernière erreur). Le sommet du classement devient
 * la mission du jour.
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
 * unités 9-11 (cf. DOMAIN_UNITS). On retourne l'unité la plus probable
 * d'après le rang de la carte dans son domaine — approximation honnête :
 * elle ne sert qu'à pondérer la priorité, pas à afficher un contenu.
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
 * @param mistakes ids de cartes (peuvent contenener des doublons : on les
 * compte comme la fréquence, contrairement à l'ancien mistakes[0] qui ne
 * regardait que le premier).
 * @param lastSeenAt horodateur de la dernière interaction (pour l'oubli).
 */
function rankMistakes(mistakes: string[], lastSeenAt: number): string[] {
  const freq = new Map<string, number>();
  for (const m of mistakes) freq.set(m, (freq.get(m) ?? 0) + 1);

  const scored = Array.from(freq.entries()).map(([topicId, count]) => {
    const card = getCardById(topicId);
    const weight = weightForTopic(topicId, card?.domainId ?? null);
    // Oubli : jours depuis la dernière fois que ce sujet a été touché. On ne
    // stocke pas d'horodateur par erreur (session légère) — l'ancienneté
    // relative vient du rang dans le tableau : plus tôt apparu, plus oublié.
    const orderIdx = mistakes.indexOf(topicId);
    const daysSince = Math.max(1, Math.floor((mistakes.length - orderIdx) / 2));
    const oubli = Math.min(daysSince, 14) / 14;
    return { topicId, score: count * weight * (0.5 + oubli) };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.map((s) => s.topicId);
}

export function getDailyMission(session: BotSession): EngineResult {
  const today = new Date().toISOString().split('T')[0];
  if (session.lastMissionDate === today) {
    return { session, action: { text: '✅ لقد أنجزت مهمة اليوم بنجاح! عُد غداً لمهمة جديدة، أو تابع مراجعتك بحرية.', quickActions: ['اختبار تشخيصي', 'العودة للقائمة الرئيسية'] } };
  }

  let targetTopicId: string | null = null;
  let targetDomainId: number | null = session.activeDomainId;

  if (session.mistakes.length > 0) {
    // R6 : mistakes[0] → rankMistakes (fréquence × poids BAC × oubli).
    targetTopicId = rankMistakes(session.mistakes, session.lastInteraction)[0] ?? null;
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
  const quiz = pickRandomQuizForTopic(card.domainId, card.id);

  // ── R8 (audit Morchid 2026-10-01) : BAC_EXAM_DATE était vide → le
  // compte à rebours affichait « — » et aucun cycle de révision n'était
  // possible. La! date est désormais injectée et visible dans la mission.
  const bacLeft = bacDaysLeft(new Date(), BAC_EXAM_DATE);
  const bacLine =
    bacLeft != null && bacLeft > 0
      ? `\n⏳ **بقي ${bacLeft} يوماً على البكالوريا.** كل يوم تثبّت فيه نقطة واحدة = نقطة مضمونة.\n`
      : '';

  // ── R7 (audit Morchid 2026-10-01) : le guide ne se cache plus derrière une
  // phrase magique. Quand l'élève enchaîne les erreurs sur ce sujet (≥ 3), le
  // protocole d'étude se PROPOSE dans la mission — au lieu d'attendre qu'il
  // tape « كيف ادرس العلوم » (score ≥ 18, invisible en pratique).
  const freq = session.mistakes.filter((m) => m === targetTopicId).length;
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
