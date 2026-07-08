import {
  loadSession,
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
} from './sessionManager';
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
} from '../data/smartBotData';
import { METHODOLOGY_CARDS, findMethodologyCard } from '../data/methodologyKnowledge';
import { TUTOR_KNOWLEDGE, type TutorKnowledgeChunk } from '../tutorKnowledge';
import { BOOK_TUTOR_QA, type BookTutorQA } from '../bookTutorQA';
import {
  KNOWLEDGE_CARDS as LEGACY_KNOWLEDGE_CARDS,
  type KnowledgeCard as LegacyKnowledgeCard,
} from '../knowledgeCards';
import { normalizeArabic, calculateKeywordScore } from './arabicNormalize';

export { normalizeArabic, calculateKeywordScore } from './arabicNormalize';

export type SourceType = 'card' | 'book' | 'opus' | 'methodology' | 'domain' | 'quiz' | 'out';

export interface SourceRef {
  type: SourceType;
  title: string;
}

export interface QuizPrompt {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface TutorAction {
  text: string;
  quickActions?: string[];
  quiz?: QuizPrompt;
  sources?: SourceRef[];
  reward?: { xpGained: number };
}

export interface EngineResult {
  session: BotSession;
  action: TutorAction;
}

const OUT_OF_PROGRAM = [
  'كرة القدم',
  'فريق',
  'لاعب',
  'مباراه',
  'فيلم',
  'موسيقى',
  'سياره',
  'سفر',
  'طقس',
  'اكل',
  'طعام',
];

function toQuizPrompt(q: QuizQuestion): QuizPrompt {
  return {
    id: q.id,
    question: q.question,
    options: q.options,
    correctIndex: q.correctIndex,
    explanation: q.explanation,
  };
}

const DOMAIN_UNITS: Record<number, [number, number]> = {
  1: [1, 5],
  2: [6, 8],
  3: [9, 11],
};

interface SearchChunk {
  id: string;
  type: 'card' | 'book' | 'opus';
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
  type: 'card',
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
  type: 'book',
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
  type: 'opus',
  title: c.title,
  unitId: c.unitId,
  unitTitle: c.unitTitle,
  text: c.content,
  normTitle: normalizeArabic(c.title),
  normAliases: [],
  normKeywords: c.keywords.map((k) => normalizeArabic(k)),
}));

const ALL_CHUNKS: SearchChunk[] = [...LEGACY_CHUNKS, ...BOOK_CHUNKS, ...OPUS_CHUNKS];

function scoreChunk(norm: string, ch: SearchChunk, activeDomainId: number | null): number {
  let score = 0;
  if (ch.normTitle && norm.includes(ch.normTitle)) score += 80;
  for (const alias of ch.normAliases) {
    if (alias && norm.includes(alias)) score += 60;
  }
  for (const kw of ch.normKeywords) {
    if (kw && kw.length >= 3 && norm.includes(kw)) score += 6;
  }
  if (activeDomainId != null) {
    const range = DOMAIN_UNITS[activeDomainId];
    if (range && ch.unitId >= range[0] && ch.unitId <= range[1]) score += 10;
  }
  if (ch.type === 'opus') score *= 0.7;
  return score;
}

export function searchAllBases(norm: string, activeDomainId: number | null): SearchChunk[] {
  return ALL_CHUNKS.map((ch) => ({ ch, score: scoreChunk(norm, ch, activeDomainId) }))
    .filter((x) => x.score >= 12)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.ch);
}

function buildAnswer(norm: string, activeDomainId: number | null): TutorAction | null {
  const scienceCard = findBestKnowledgeCard(norm, activeDomainId);
  const hits = searchAllBases(norm, activeDomainId);

  if (!scienceCard && hits.length === 0) return null;

  const sources: SourceRef[] = [];
  const parts: string[] = [];
  const quickActions: string[] = [];

  if (scienceCard) {
    parts.push(
      `🧩 **${scienceCard.title}**\n\n${scienceCard.shortAnswer}\n\n🔑 كلمات مفتاحية: ${scienceCard.keywords.join(' • ')}`
    );
    sources.push({ type: 'card', title: scienceCard.title });
    quickActions.push(...scienceCard.relatedQuestions);
  }

  const used = new Set(scienceCard ? [scienceCard.title] : []);
  let bookAdded = false;

  for (const h of hits) {
    if (used.has(h.title) || h.type === 'opus') continue;
    const label = h.type === 'book' ? '📖 من الكتاب المدرسي' : '📝 بطاقة معرفية';
    const snippet = h.text.length > 300 ? `${h.text.slice(0, 297)}…` : h.text;
    parts.push(`${label}:\n${snippet}${h.sourceLabel ? `\n\n🔗 المصدر: ${h.sourceLabel}` : ''}`);
    sources.push({ type: h.type, title: h.title });
    used.add(h.title);
    if (h.followUp) quickActions.push(h.followUp);
    if (h.type === 'book') bookAdded = true;
    if (sources.length >= 3) break;
  }

  if (!bookAdded) {
    const opus = hits.find((h) => h.type === 'opus' && !used.has(h.title));
    if (opus) {
      const snippet = opus.text.length > 240 ? `${opus.text.slice(0, 237)}…` : opus.text;
      if (snippet.trim().length > 40) {
        parts.push(`📚 من الدرس (${opus.unitTitle}):\n${snippet}`);
        sources.push({ type: 'opus', title: opus.title });
      }
    }
  }

  const text = parts.join('\n\n');
  const qa = Array.from(
    new Set([...quickActions, 'راجع أخطائي السابقة', 'العودة للقائمة الرئيسية'])
  );

  return { text, sources, quickActions: qa };
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
    return {
      session: resetSession(),
      action: { text: 'مجال غير معروف. اختر مجالاً من القائمة.', quickActions: DOMAINS.map((d) => d.title) },
    };
  }

  const newSession = startDomainSession(domainId, session.mistakes);
  const cards = KNOWLEDGE_CARDS.filter((c) => c.domainId === domainId);

  const text =
    `📚 اخترت مجال: **${domain.title}**\n${domain.subtitle}\n\n` +
    `المواضيع المتاحة للمراجعة:\n` +
    cards.map((c, i) => `${i + 1}. ${c.title}`).join('\n') +
    `\n\nابدأ باختبار تشخيصي، أو راجع موضوعاً مباشرةً من القائمة أدناه.`;

  const quickActions = [
    'اختبار تشخيصي',
    'تحدي BAC',
    ...cards.map((c) => `راجع ${c.title}`),
    'راجع أخطائي السابقة',
    'العودة للقائمة الرئيسية',
  ];

  return { session: newSession, action: { text, quickActions } };
}

export function findBestKnowledgeCard(input: string, activeDomainId: number | null): KnowledgeCard | null {
  const norm = normalizeArabic(input);
  if (!norm) return null;

  let best: KnowledgeCard | null = null;
  let bestScore = 0;

  for (const card of KNOWLEDGE_CARDS) {
    let score = 0;

    let bestAliasLen = 0;
    for (const alias of card.aliases) {
      const na = normalizeArabic(alias);
      if (na && norm.includes(na)) {
        score += 100 + na.length;
        if (na.length > bestAliasLen) bestAliasLen = na.length;
      }
    }

    const nt = normalizeArabic(card.title);
    if (nt && norm.includes(nt)) score += 50;

    score += calculateKeywordScore(norm, card.keywords) * 6;

    if (activeDomainId != null && card.domainId === activeDomainId) score += 20;

    if (score > bestScore) {
      bestScore = score;
      best = card;
    }
  }

  if (best && bestScore >= 20) return best;
  return null;
}

export function startDiagnostic(session: BotSession): EngineResult {
  const domainId = session.activeDomainId;
  const domain = DOMAINS.find((d) => d.id === domainId);

  if (domainId == null || !domain) {
    return {
      session,
      action: { text: 'اختر مجالاً أولاً لبدء التشخيص.', quickActions: DOMAINS.map((d) => d.title) },
    };
  }

  const questions = getQuestionsForDomain(domainId);
  if (questions.length === 0) {
    return { session, action: { text: 'لا توجد أسئلة لهذا المجال بعد.', quickActions: ['العودة للقائمة الرئيسية'] } };
  }

  const first = questions[0];
  const newSession = startQuiz(session, questions.length, first.id, 'diagnostic');

  const text =
    `🩺 بدأ التشخيص في مجال **${domain.title}**.\n` +
    `أجب عن ${questions.length} سؤالاً واحداً تلو الآخر. اختر A أو B أو C أو D.`;

  return { session: newSession, action: { text, quiz: toQuizPrompt(first), quickActions: [] } };
}

export function reviewMistakes(session: BotSession): EngineResult {
  if (session.mistakes.length === 0) {
    return {
      session,
      action: {
        text: '✅ لا توجد أخطاء مسجلة لديك بعد. واصل التدريب لتسجيل نقاط ضعفك ومعالجتها!',
        quickActions: ['العودة للقائمة الرئيسية'],
      },
    };
  }

  const cards = session.mistakes
    .map((id) => getCardById(id))
    .filter((c): c is KnowledgeCard => Boolean(c));

  const text =
    '📌 هذه المواضيع التي سجلت أخطاءً فيها:\n' +
    cards.map((c, i) => `${i + 1}. ${c.title} (${c.aliases[0]})`).join('\n') +
    '\n\nراجع كل موضوع لترسيخه قبل إعادة الاختبار.';

  const quickActions = [
    ...cards.map((c) => `راجع ${c.title}`),
    'إعادة الاختبار التشخيصي',
    'العودة للقائمة الرئيسية',
  ];

  return { session, action: { text, quickActions } };
}

export function gradeQuizAnswer(session: BotSession, rawAnswer: string): EngineResult {
  const current = session.currentQuiz;
  if (!current) {
    return { session, action: { text: 'لا يوجد اختبار جارٍ حالياً.', quickActions: ['العودة للقائمة الرئيسية'] } };
  }

  const question = getQuestionById(current.questionId);
  if (!question) {
    return { session, action: { text: 'تعذر العثور على السؤال.', quickActions: ['العودة للقائمة الرئيسية'] } };
  }

  const selected = parseAnswer(rawAnswer);
  if (selected === null) {
    return {
      session,
      action: {
        text: '⚠️ الرجاء اختيار إجابة بكتابة A أو B أو C أو D (أو 1، 2، 3، 4).',
        quiz: toQuizPrompt(question),
        quickActions: [],
      },
    };
  }

  const isCorrect = selected === question.correctIndex;
  const mistake = getMistakeById(question.commonMistakeId);

  let text: string;
  if (isCorrect) {
    text = `✅ إجابة صحيحة!\n\n${question.explanation}`;
  } else {
    text =
      `❌ إجابة خاطئة.\nالإجابة الصحيحة هي: ${question.options[question.correctIndex]}\n\n` +
      `${question.explanation}`;
    if (mistake) {
      text += `\n\n⚠️ خطأ شائع: ${mistake.mistake}\n✅ التصحيح: ${mistake.correction}`;
    }
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
    text +=
      `\n\n📊 نتيجتك النهائية: ${correctCount}/${total} (${pct}%).\nالتقدير: ${appreciation}.`;
    quiz = undefined;
  }

  const quickActions =
    quiz === undefined
      ? ['راجع أخطائي السابقة', 'اعاده الاختبار التشخيصي', 'العودة للقائمة الرئيسية']
      : [];

  const reward = quiz === undefined ? { xpGained: correctCount * 10 } : undefined;

  return { session: newSession, action: { text, quiz, quickActions, reward } };
}

export function startBossFight(session: BotSession): EngineResult {
  const domainId = session.activeDomainId;
  const scenarios = getBossScenariosForDomain(domainId);
  const domain = DOMAINS.find((d) => d.id === domainId);

  if (domainId == null || !domain) {
    return {
      session,
      action: { text: 'اختر مجالاً أولاً لبدء تحدي BAC.', quickActions: DOMAINS.map((d) => d.title) },
    };
  }

  if (scenarios.length === 0) {
    return { session, action: { text: 'لا يوجد تحدي BAC لهذا المجال بعد.', quickActions: ['العودة للقائمة الرئيسية'] } };
  }

  const first = scenarios[0];
  const newSession = startBossFightSession(session, first.id, scenarios.length);

  const text =
    `⚔️ **تحدي BAC** — مجال ${domain.title}\n` +
    `ستُطرح عليك ${scenarios.length} وضعيات مشكلة. أجب ثم قيّم إجابتك بنفسك.\n\n` +
    `${first.situation}\n\n` +
    `📝 اكتب إجابتك الكاملة، أو اختر «لا أعرف» لعرض التصحيح النموذجي.`;

  return {
    session: newSession,
    action: { text, quickActions: ['لا أعرف'], sources: [{ type: 'domain', title: 'تحدي BAC' }] },
  };
}

function handleBossInput(session: BotSession, rawInput: string): EngineResult {
  const boss = session.boss;
  if (!boss) {
    return { session, action: { text: 'لا يوجد تحدي BAC جارٍ.', quickActions: ['العودة للقائمة الرئيسية'] } };
  }

  const scenario = getBossScenarioById(boss.scenarioId);
  if (!scenario) {
    const finished = finishBossFight(session);
    return { session: finished, action: { text: 'انتهى التحدي.', quickActions: ['العودة للقائمة الرئيسية'] } };
  }

  if (boss.phase === 'answer') {
    const text =
      `✅ **التصحيح النموذجي**\n\n${scenario.correction}\n\n` +
      `🔑 **النقاط الأساسية:**\n${scenario.keyPoints.map((p) => `- ${p}`).join('\n')}\n\n` +
      `قيّم إجابتك لمنح نقاطك:`;

    const newSession: BotSession = { ...session, boss: { ...boss, phase: 'eval' } };
    saveSession(newSession);

    return {
      session: newSession,
      action: {
        text,
        quickActions: ['إجابة كاملة (+10)', 'إجابة ناقصة (+5)', 'لم أجب (0)'],
        sources: [{ type: 'domain', title: 'تحدي BAC' }],
      },
    };
  }

  // phase 'eval' → enregistrer la note et avancer
  const n = normalizeArabic(rawInput);
  let points = 0;
  if (n.includes(normalizeArabic('كاملة'))) points = 10;
  else if (n.includes(normalizeArabic('ناقصة'))) points = 5;
  else points = 0;

  const scenarios = getBossScenariosForDomain(session.activeDomainId);
  const idx = scenarios.findIndex((s) => s.id === boss.scenarioId);
  const next = idx >= 0 ? scenarios[idx + 1] : undefined;

  if (next) {
    const newSession = startBossStep(session, points, next.id, boss.questionIndex + 1);
    const text =
      `➡️ **السؤال التالي (${boss.questionIndex + 2}/${boss.totalQuestions})**\n\n${next.situation}\n\n` +
      `📝 اكتب إجابتك أو اختر «لا أعرف».`;
    return {
      session: newSession,
      action: { text, quickActions: ['لا أعرف'], sources: [{ type: 'domain', title: 'تحدي BAC' }] },
    };
  }

  const total = boss.score + points;
  const max = boss.totalQuestions * 10;
  const pct = max > 0 ? Math.round((total / max) * 100) : 0;
  const appreciation = pct >= 80 ? 'ممتاز 🏆' : pct >= 50 ? 'جيد 👍' : 'يحتاج مراجعة 📖';

  const newSession = finishBossFight(session);
  const text =
    `🏁 **انتهى تحدي BAC!**\n` +
    `نتيجتك: ${total}/${max} نقطة (${pct}%).\n` +
    `التقدير: ${appreciation}.`;

  return {
    session: newSession,
    action: {
      text,
      quickActions: ['راجع أخطائي السابقة', 'العودة للقائمة الرئيسية'],
      reward: { xpGained: total },
      sources: [{ type: 'domain', title: 'تحدي BAC' }],
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
    return {
      session: back,
      action: { text: '↩️ رجعنا إلى القائمة الرئيسية. اختر مجالاً لبدء جلسة مراجعة:', quickActions: DOMAINS.map((d) => d.title) },
    };
  }

  if (norm.includes(n('راجع أخطائي'))) {
    return reviewMistakes(session);
  }

  if (OUT_OF_PROGRAM.some((k) => norm.includes(n(k)))) {
    return {
      session,
      action: {
        text: '❓ هذا السؤال خارج قاعدة علوم الطبيعة والحياة للبكالوريا. ركّز مراجعتك على المجالات الثلاثة: البروتينات والمناعة، التحولات الطاقوية، والتكتونية العامة.',
        quickActions: session.activeDomainId
          ? DOMAINS.find((d) => d.id === session.activeDomainId)?.quickActions || ['العودة للقائمة الرئيسية']
          : DOMAINS.map((d) => d.title),
        sources: [{ type: 'out', title: 'خارج البرنامج' }],
      },
    };
  }

  if (norm.includes(n('اختبار'))) {
    return startDiagnostic(session);
  }

  if (norm.includes(n('تحدي bac')) || norm.includes(n('تحدي البكالوريا')) || norm.includes(n('تحدي الباك')) || norm.includes(n('boss'))) {
    return startBossFight(session);
  }

  if (session.mode === 'bac_challenge' && session.boss) {
    return handleBossInput(session, input);
  }

  if (session.currentQuiz && (session.mode === 'quiz' || session.mode === 'diagnostic')) {
    return gradeQuizAnswer(session, input);
  }

  if (session.activeDomainId == null) {
    const domain = DOMAINS.find((d) => {
      const dn = normalizeArabic(d.title);
      return dn === norm || norm.includes(dn) || dn.includes(norm);
    });
    if (domain) return handleDomainClick(session, domain.id);
  }

  const methodCard = findMethodologyCard(norm);
  const scienceCard = findBestKnowledgeCard(norm, session.activeDomainId);

  if (methodCard && !scienceCard) {
    const text = `🧭 ${methodCard.title}\n\n${methodCard.steps.join('\n')}`;
    return {
      session,
      action: {
        text,
        sources: [{ type: 'methodology', title: methodCard.title }],
        quickActions: ['راجع أخطائي السابقة', 'العودة للقائمة الرئيسية'],
      },
    };
  }

  const built = buildAnswer(norm, session.activeDomainId);
  if (built) {
    return { session, action: built };
  }

  const fallbackActions = session.activeDomainId
    ? DOMAINS.find((d) => d.id === session.activeDomainId)?.quickActions || ['العودة للقائمة الرئيسية']
    : DOMAINS.map((d) => d.title);

  return {
    session,
    action: {
      text: 'لم أجد إجابة دقيقة في قاعدتي المحلية. جرّب اختيار مجال، أو اطرح سؤالاً حول: البروتينات والمناعة، التحولات الطاقوية، أو التكتونية العامة.',
      quickActions: fallbackActions,
    },
  };
}

export function answerTutorQuestion(rawInput: string): TutorAction {
  return processStudentInput(getDefaultSession(), rawInput || '').action;
}

export { METHODOLOGY_CARDS };
