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
} from './data/smartBotData';
import { TUTOR_KNOWLEDGE, type TutorKnowledgeChunk } from './tutorKnowledge';
import { BOOK_TUTOR_QA, findBestBookQA, type BookTutorQA } from './bookTutorQA';
import { findBestMethodologyQA } from './methodologyKnowledge';
import {
  KNOWLEDGE_CARDS as LEGACY_KNOWLEDGE_CARDS,
  type KnowledgeCard as LegacyKnowledgeCard,
} from './knowledgeCards';
import { STUDY_GUIDE_CARDS, type StudyGuideCard } from './studyGuide';
import { normalizeArabic, tokenizeArabic } from './utils/arabicNormalize';

export { normalizeArabic, calculateKeywordScore, tokenizeArabic } from './utils/arabicNormalize';

export type SourceType = 'internal_card' | 'legacy_card' | 'book' | 'opus' | 'methodology' | 'guide' | 'domain' | 'quiz' | 'out_of_scope';

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
];

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
  type: 'card' | 'book' | 'opus' | 'guide';
  title: string;
  unitId: number;
  unitTitle: string;
  text: string;
  sourceLabel?: string;
  followUp?: string;
  normTitle: string;
  normAliases: string[];
  normKeywords: string[];
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

const ALL_CHUNKS: SearchChunk[] = [...GUIDE_CHUNKS, ...LEGACY_CHUNKS, ...BOOK_CHUNKS, ...OPUS_CHUNKS];

function scoreChunk(norm: string, ch: SearchChunk, activeDomainId: number | null): number {
  if (norm.length < 3) return 0;
  let score = 0;
  if (ch.normTitle && ch.normTitle.length >= 3 && norm.includes(ch.normTitle)) score += 80;
  for (const alias of ch.normAliases) {
    if (alias && alias.length >= 3 && norm.includes(alias)) score += 60;
  }
  for (const kw of ch.normKeywords) {
    if (kw && kw.length >= 3 && norm.includes(kw)) score += 6;
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
  return ALL_CHUNKS.map((ch) => ({ ch, score: scoreChunk(norm, ch, activeDomainId) }))
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

function buildAnswer(norm: string, activeDomainId: number | null): TutorAction | null {
  if (!norm || norm.length < 3) return null;
  const scienceCard = findBestKnowledgeCard(norm, activeDomainId);

  if (scienceCard) {
    const microHit = findMicroAnswer(scienceCard, norm);
    if (microHit) {
      return {
        text: `🎯 **${scienceCard.title}**\n\n${microHit}`,
        quickActions: filterQuickActions(scienceCard.relatedQuestions, norm),
        sources: [{ type: 'internal_card' as SourceType, title: scienceCard.title }],
      };
    }
    return {
      text: `🧩 **${scienceCard.title}**\n\n${scienceCard.shortAnswer}\n\n🔑 كلمات مفتاحية: ${scienceCard.keywords.join(' • ')}`,
      quickActions: filterQuickActions(scienceCard.relatedQuestions, norm),
      sources: [{ type: 'internal_card' as SourceType, title: scienceCard.title }],
    };
  }

  const hits = searchAllBases(norm, activeDomainId);
  if (hits.length === 0) return null;

  const best = hits[0];
  const snippet = best.text.length > 400 ? `${best.text.slice(0, 397)}…` : best.text;
  let sourceType: SourceType = 'opus';
  if (best.type === 'book') sourceType = 'book';
  else if (best.type === 'card') sourceType = 'legacy_card';
  else if (best.type === 'guide') sourceType = 'guide';

  return {
    text: `📚 **${best.title}**\n\n${snippet}`,
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

export function findBestKnowledgeCard(input: string, activeDomainId: number | null): KnowledgeCard | null {
  const norm = normalizeArabic(input);
  if (!norm || norm.length < 2) return null;
  const inputTokens = tokenizeArabic(norm);
  let best: KnowledgeCard | null = null;
  let bestRankingScore = 0;
  let bestContentScore = 0;

  for (const card of KNOWLEDGE_CARDS) {
    let contentScore = 0;

    for (const alias of card.aliases) {
      const na = normalizeArabic(alias);
      if (na && na.length >= 2 && norm.includes(na)) {
        contentScore += 100 + na.length;
      }
    }

    const nt = normalizeArabic(card.title);
    if (nt && nt.length >= 2 && norm.includes(nt)) contentScore += 50;

    let keywordHits = 0;
    for (const kw of card.keywords) {
      const nk = normalizeArabic(kw);
      if (nk.length < 2) continue;
      if (inputTokens.includes(nk) || norm.includes(nk)) {
        keywordHits += 1;
      }
    }
    contentScore += keywordHits * 8;

    const domainBonus = (activeDomainId != null && card.domainId === activeDomainId) ? 5 : 0;
    const rankingScore = contentScore + domainBonus;

    if (rankingScore > bestRankingScore) {
      bestRankingScore = rankingScore;
      bestContentScore = contentScore;
      best = card;
    }
  }

  if (best && bestContentScore >= 8) return best;
  return null;
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
  const newSession = recordQuizAnswer(session, isCorrect, question.topicId, nextId);
  let quiz: QuizPrompt | undefined;
  if (newSession.currentQuiz && nextQ) {
    quiz = toQuizPrompt(nextQ);
  } else {
    const pct = total > 0 ? Math.round((correctCount / total) * 100) : 0;
    const appreciation = pct === 100 ? 'ممتاز 🏆' : pct >= 50 ? 'جيد 👍' : 'يحتاج مراجعة 📖';
    text += `\n\n📊 نتيجتك النهائية: ${correctCount}/${total} (${pct}%).\nالتقدير: ${appreciation}.`;
    quiz = undefined;
  }
  const quickActions = quiz === undefined ? ['راجع أخطائي السابقة', 'اعاده الاختبار التشخيصي', 'العودة للقائمة الرئيسية'] : [];
  const domain = DOMAINS.find((d) => d.id === question.domainId);
  const reward = quiz === undefined
    ? { xpGained: correctCount * 10, score: correctCount, total, kind: 'quiz' as const, domain: domain?.title ?? '' }
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
    `ستُطرح عليك ${scenarios.length} وضعيات مشكلة. اكتب إجابتك وسيقوّمها المرشد آلياً وفق النقاط الأساسية.\n\n${first.situation}\n\n📝 اكتب إجابتك، أو اختر «لا أعرف» لعرض التصحيح.`;
  return { session: newSession, action: { text, quickActions: ['لا أعرف'], sources: [{ type: 'domain' as SourceType, title: 'تحدي BAC' }] } };
}

/**
 * Auto-évaluation honnête (recommandation audit #3) : la couverture des
 * points-clés du scénario par la réponse remplace l'auto-note (+10/+5/0)
 * que l'élève se donnait lui-même — l'XP n'est plus fermable au clic.
 * Barème : ≥ 50 % des mots-clés couverts = 10 pts · ≥ 20 % = 5 pts · sinon 0.
 */
function gradeKeyPoints(answer: string, keyPoints: string[]): number {
  const tokens = new Set(tokenizeArabic(normalizeArabic(answer)).filter((t) => t.length >= 3));
  if (tokens.size === 0) return 0;
  const expected = new Set<string>();
  for (const kp of keyPoints) {
    for (const t of tokenizeArabic(normalizeArabic(kp))) {
      if (t.length >= 3) expected.add(t);
    }
  }
  if (expected.size === 0) return 0;
  let hits = 0;
  for (const t of expected) {
    if (tokens.has(t)) hits += 1;
  }
  const coverage = hits / expected.size;
  if (coverage >= 0.5) return 10;
  if (coverage >= 0.2) return 5;
  return 0;
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
  const points = giveUp ? 0 : gradeKeyPoints(rawInput, scenario.keyPoints);
  const correctionText =
    `✅ **التصحيح النموذجي**\n\n${scenario.correction}\n\n🔑 **النقاط الأساسية:**\n${scenario.keyPoints.map((p) => `- ${p}`).join('\n')}` +
    `\n\n🎯 نقاطك لهذه الوضعية: ${points}/10`;
  const scenarios = getBossScenariosForDomain(session.activeDomainId);
  const idx = scenarios.findIndex((s) => s.id === boss.scenarioId);
  const next = idx >= 0 ? scenarios[idx + 1] : undefined;
  if (next) {
    const newSession = startBossStep(session, points, next.id, boss.questionIndex + 1);
    const text = `${correctionText}\n\n➡️ **السؤال التالي (${boss.questionIndex + 2}/${boss.totalQuestions})**\n\n${next.situation}\n\n📝 اكتب إجابتك أو اختر «لا أعرف» لعرض التصحيح.`;
    return { session: newSession, action: { text, quickActions: ['لا أعرف'], sources: [{ type: 'domain' as SourceType, title: 'تحدي BAC' }] } };
  }
  const total = boss.score + points;
  const max = boss.totalQuestions * 10;
  const pct = max > 0 ? Math.round((total / max) * 100) : 0;
  const appreciation = pct >= 80 ? 'ممتاز 🏆' : pct >= 50 ? 'جيد 👍' : 'يحتاج مراجعة 📖';
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
  const text =
    `🏁 **انتهى تحدي BAC!**\nنتيجتك: ${total}/${max} نقطة (${pct}%).\nالتقدير: ${appreciation}.` +
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

export function processStudentInput(session: BotSession, rawInput: string): EngineResult {
  const input = (rawInput || '').trim();
  const norm = normalizeArabic(input);
  const n = (s: string) => normalizeArabic(s);

  if (norm.includes(n('القائمة الرئيسية')) || norm.includes(n('العودة للقائمة')) || norm.includes(n('رجوع للقائمة'))) {
    const back: BotSession = { ...getDefaultSession(), mistakes: [...session.mistakes] };
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

  if (norm.length >= 3 && OUT_OF_PROGRAM.some((k) => {
    const nk = n(k);
    return nk.length >= 3 && norm.includes(nk);
  })) {
    return {
      session,
      action: {
        confidence: 0,
        text: '❓ هذا السؤال خارج قاعدة علوم الطبيعة والحياة للبكالوريا. ركّز مراجعتك على المجالات الثلاثة: البروتينات والمناعة، التحولات الطاقوية، والتكتونية العامة.',
        quickActions: session.activeDomainId
          ? DOMAINS.find((d) => d.id === session.activeDomainId)?.quickActions || ['العودة للقائمة الرئيسية']
          : DOMAINS.map((d) => d.title),
        sources: [{ type: 'out_of_scope' as SourceType, title: rawInput || input }],
      },
    };
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

  const scienceCard = findBestKnowledgeCard(norm, session.activeDomainId);

  if (scienceCard) {
    const microHit = findMicroAnswer(scienceCard, norm);
    if (microHit) {
      return {
        session,
        action: {
          text: `🎯 **${scienceCard.title}**\n\n${microHit}`,
          quickActions: filterQuickActions(scienceCard.relatedQuestions, norm),
          sources: [{ type: 'internal_card' as SourceType, title: scienceCard.title }],
        },
      };
    }
    return {
      session,
      action: {
        text: `🧩 **${scienceCard.title}**\n\n${scienceCard.shortAnswer}\n\n🔑 كلمات مفتاحية: ${scienceCard.keywords.join(' • ')}`,
        quickActions: filterQuickActions(scienceCard.relatedQuestions, norm),
        sources: [{ type: 'internal_card' as SourceType, title: scienceCard.title }],
      },
    };
  }

  const built = buildAnswer(norm, session.activeDomainId);
  if (built) return { session, action: built };

  const fallbackActions = session.activeDomainId
    ? DOMAINS.find((d) => d.id === session.activeDomainId)?.quickActions || ['العودة للقائمة الرئيسية']
    : DOMAINS.map((d) => d.title);

  return { session, action: { text: 'لم أجد إجابة دقيقة في قاعدتي المحلية. جرّب اختيار مجال، أو اطرح سؤالاً حول: البروتينات والمناعة، التحولات الطاقوية، أو التكتونية العامة.\n\n💡 أسئلة منهجية مقترحة:\n' + METHODOLOGY_SUGGESTIONS.map((s) => `• ${s}`).join('\n'), quickActions: fallbackActions } };
}

export function answerTutorQuestion(rawInput: string): TutorAction {
  return processStudentInput(getDefaultSession(), rawInput || '').action;
}

function pickRandomQuizForTopic(domainId: number, topicId: string): QuizQuestion | undefined {
  const questions = getQuestionsForDomain(domainId);
  const candidates = questions.filter((q) => q.topicId === topicId);
  if (candidates.length === 0) return undefined;
  return candidates[Math.floor(Math.random() * candidates.length)];
}

export function getDailyMission(session: BotSession): EngineResult {
  const today = new Date().toISOString().split('T')[0];
  if (session.lastMissionDate === today) {
    return { session, action: { text: '✅ لقد أنجزت مهمة اليوم بنجاح! عُد غداً لمهمة جديدة، أو تابع مراجعتك بحرية.', quickActions: ['اختبار تشخيصي', 'العودة للقائمة الرئيسية'] } };
  }

  let targetTopicId: string | null = null;
  let targetDomainId: number | null = session.activeDomainId;

  if (session.mistakes.length > 0) {
    targetTopicId = session.mistakes[0];
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
  const text = `🎯 **مهمة اليوم (3 دقائق):**\nالمجال: **${domain?.title || ''}**\n\nركّز على: **${card.title}**\n\n1. اقرأ بطاقة المعرفة أدناه.\n2. اجب على سؤال التثبيت.\n\nالمكافأة: +15 XP وتعبئة الرادار! ⚡\n\n---\n🧩 **${card.title}**\n\n${card.shortAnswer}\n\n🔑 ${card.keywords.join(' • ')}`;

  return { session, action: { text, quiz: quiz ? toQuizPrompt(quiz) : undefined, quickActions: quiz ? [] : ['العودة للقائمة الرئيسية'], sources: [{ type: 'internal_card' as SourceType, title: card.title }] } };
}

export const METHODOLOGY_SUGGESTIONS: string[] = [
  'كيف أحلل وثيقة؟',
  'اعطني قالب فرضية',
  'ما الفرق بين استخرج واستنتج؟',
  'كيف أعلل أو أبرر؟',
  'كيف أكتب نصا علميا؟',
];
