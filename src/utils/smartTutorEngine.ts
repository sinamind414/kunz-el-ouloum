import { TUTOR_KNOWLEDGE } from '../tutorKnowledge';
import { SVT_QUIZ_QUESTIONS, INITIAL_UNITS, SVT_FLASHCARDS } from '../data';
import { LESSON_LIBRARY } from '../lessonData';
import { BOOK_TUTOR_QA, BookTutorQA } from '../bookTutorQA';
import { METHODOLOGY_QA, MethodologyQA } from '../methodologyKnowledge';
import { KNOWLEDGE_CARDS, KnowledgeCard } from '../knowledgeCards';

export interface TutorSource {
  id: string;
  title: string;
  unitTitle: string;
  type: 'opus' | 'lesson' | 'qcm' | 'book' | 'methodology' | 'card';
  score: number;
}

interface SearchChunk {
  id: string;
  unitId: number;
  unitTitle: string;
  title: string;
  content: string;
  keywords: string[];
  type: 'opus' | 'lesson' | 'qcm' | 'book' | 'methodology' | 'card';
  normalizedTitle?: string;
  normalizedContent?: string;
}

const UNIT_TITLES: Record<number, string> = {};
for (const c of TUTOR_KNOWLEDGE) {
  if (!UNIT_TITLES[c.unitId]) UNIT_TITLES[c.unitId] = c.unitTitle;
}
function unitTitle(unitId: number): string {
  return UNIT_TITLES[unitId] || `وحدة ${unitId}`;
}

const methodologyChunks: SearchChunk[] = METHODOLOGY_QA.map((qa) => ({
  id: qa.id,
  unitId: 0,
  unitTitle: 'منهجية البكالوريا',
  title: qa.question,
  content: `${qa.answer}\n${qa.template || ''}\nSource: ${qa.sourceBook}`,
  keywords: qa.keywords,
  normalizedTitle: normalizeArabic(`${qa.question} ${qa.category}`),
  normalizedContent: normalizeArabic(`${qa.question} ${qa.answer} ${qa.template || ''} ${qa.keywords.join(' ')}`),
  type: 'methodology' as const,
}));

const bookChunks: SearchChunk[] = BOOK_TUTOR_QA.map((qa) => ({
  id: qa.id,
  unitId: qa.unitId,
  unitTitle: unitTitle(qa.unitId),
  title: qa.question,
  content: `${qa.answer}\nSource: ${qa.sourceBook}`,
  keywords: qa.keywords,
  normalizedTitle: normalizeArabic(`${qa.question} ${qa.topic}`),
  normalizedContent: normalizeArabic(`${qa.question} ${qa.answer} ${qa.topic} ${qa.keywords.join(' ')}`),
  type: 'book' as const,
}));

const opusChunks: SearchChunk[] = TUTOR_KNOWLEDGE.map((c) => ({
  id: c.id,
  unitId: c.unitId,
  unitTitle: c.unitTitle,
  title: c.title,
  content: c.content,
  keywords: c.keywords,
  normalizedTitle: normalizeArabic(c.title),
  normalizedContent: normalizeArabic(`${c.title} ${c.content} ${c.keywords.join(' ')}`),
  type: String(c.id).includes('lesson') ? 'lesson' as const : 'opus' as const,
}));

const cardChunks: SearchChunk[] = KNOWLEDGE_CARDS.map((card) => ({
  id: card.id,
  unitId: card.unitId,
  unitTitle: card.unitId === 0 ? 'منهجية البكالوريا' : unitTitle(card.unitId),
  title: card.title,
  content: `${card.shortAnswer}\n${card.relatedQuestions.join('\n')}\nSource: ${card.source}`,
  keywords: [...card.keywords, ...card.aliases],
  normalizedTitle: normalizeArabic(`${card.title} ${card.aliases.join(' ')}`),
  normalizedContent: normalizeArabic(`${card.title} ${card.aliases.join(' ')} ${card.shortAnswer} ${card.keywords.join(' ')}`),
  type: 'card' as const,
}));

const ALL_CHUNKS: SearchChunk[] = [
  ...cardChunks,
  ...methodologyChunks,
  ...bookChunks,
  ...opusChunks,
];

function scoreSearchChunk(query: string, chunk: SearchChunk): number {
  const nq = normalizeArabic(query);
  const nTitle = chunk.normalizedTitle || normalizeArabic(chunk.title);
  const nContent = chunk.normalizedContent || normalizeArabic(chunk.content);
  const nKeywords = chunk.keywords.map(normalizeArabic);

  const qTokens = tokenize(nq);
  const titleTokens = tokenize(nTitle);
  const contentTokens = tokenize(nContent);

  let score = 0;

  if (nTitle.includes(nq) || nContent.includes(nq)) {
    score += 30;
  }

  const titleOverlap = qTokens.filter((t) => titleTokens.includes(t)).length;
  if (titleOverlap > 0) score += titleOverlap * 10;

  const keywordOverlap = qTokens.filter((t) => nKeywords.includes(t)).length;
  if (keywordOverlap > 0) score += keywordOverlap * 7;

  const contentOverlap = qTokens.filter((t) => contentTokens.includes(t)).length;
  if (contentOverlap > 0) score += contentOverlap * 2;

  return score;
}

function findBestKnowledgeCards(query: string): Array<KnowledgeCard & { score: number; exact: boolean }> {
  const tokens = tokenize(query);
  const queryNorm = normalizeArabic(query);
  if (tokens.length === 0) return [];

  return KNOWLEDGE_CARDS.map((card) => {
    const aliasesNorm = card.aliases.map(normalizeArabic);
    const titleNorm = normalizeArabic(card.title);
    const contentNorm = normalizeArabic(`${card.title} ${card.aliases.join(' ')} ${card.shortAnswer} ${card.keywords.join(' ')}`);

    const exact =
      aliasesNorm.some((alias) => queryNorm.includes(alias) || alias.includes(queryNorm)) ||
      queryNorm.includes(titleNorm);

    let score = exact ? 100 : 0;

    for (const token of tokens) {
      if (titleNorm.includes(token)) score += 14;
      if (aliasesNorm.some((alias) => alias.includes(token) || token.includes(alias))) score += 12;
      if (card.keywords.some((keyword) => normalizeArabic(keyword).includes(token) || token.includes(normalizeArabic(keyword)))) score += 10;
      if (contentNorm.includes(token)) score += 2;
    }

    return { ...card, score, exact };
  })
    .filter((card) => card.score > 0)
    .sort((a, b) => b.score - a.score);
}

function hasScientificContentIntent(query: string): boolean {
  const normalized = normalizeArabic(query);
  return /الكره الارضيه|بنيه الارض|بنيه الكره|طبقات الارض|الاغلفه الداخليه|الموجات الزلزاليه|موهو|غوتنبرغ|ليمان|الغوص|التكتونيه|الصفائح|الاستنساخ|الترجمه|الريبوزوم|البروتين|الانزيم|المناعه|التركيب الضوئي|التنفس|التخمر/.test(normalized);
}

function hasMethodologyIntent(query: string): boolean {
  const normalized = normalizeArabic(query);
  return /منهجي|منهجيه|تعليمه|مهمه|قالب|كيف احلل|كيف افسر|كيف اقترح|كيف اكتب|كيف اعلق|كيف اقارن|كيف اعلل|كيف ابرر|استخرج|استنتج|فرضيه|نصا علميا|نص علميا|كلمات مفتاحيه|استدلال علمي|مسعي علمي|مشكل علمي/.test(normalized);
}

function findRelatedQuiz(query: string, unitId?: number): TutorQuizPrompt | undefined {
  const res = findBestQuiz(query);
  if (!res) return undefined;
  return toQuizPrompt(res.question);
}

function toQuizPrompt(question: typeof SVT_QUIZ_QUESTIONS[number]): TutorQuizPrompt {
  return {
    id: question.id,
    questionText: question.questionText,
    options: question.options,
    correctAnswerIndex: question.correctAnswerIndex,
    explanation: question.explanation,
    unitId: question.unitId,
  };
}

function findBestMethodologyQA(query: string): { qa: MethodologyQA; score: number } | null {
  let best: { qa: MethodologyQA; score: number } | null = null;
  for (const qa of METHODOLOGY_QA) {
    const score = scoreSearchChunk(query, {
      id: qa.id,
      unitId: 0,
      unitTitle: 'منهجية البكالوريا',
      title: qa.question,
      content: `${qa.answer} ${qa.template || ''} ${qa.keywords.join(' ')}`,
      keywords: qa.keywords,
      normalizedTitle: normalizeArabic(qa.question),
      normalizedContent: normalizeArabic(`${qa.question} ${qa.answer} ${qa.template || ''} ${qa.keywords.join(' ')}`),
      type: 'methodology',
    });
    if (!best || score > best.score) best = { qa, score };
  }
  return best;
}

function findBestBookQA(query: string): { qa: BookTutorQA; score: number } | null {
  let best: { qa: BookTutorQA; score: number } | null = null;
  for (const qa of BOOK_TUTOR_QA) {
    const score = scoreSearchChunk(query, {
      id: qa.id,
      unitId: qa.unitId,
      unitTitle: unitTitle(qa.unitId),
      title: qa.question,
      content: `${qa.answer} ${qa.topic} ${qa.keywords.join(' ')}`,
      keywords: qa.keywords,
      normalizedTitle: normalizeArabic(qa.question),
      normalizedContent: normalizeArabic(`${qa.question} ${qa.answer} ${qa.topic} ${qa.keywords.join(' ')}`),
      type: 'book',
    });
    if (!best || score > best.score) best = { qa, score };
  }
  return best;
}

export interface TutorQuizPrompt {
  id: number;
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  unitId: number;
}

export interface SmartTutorReply {
  text: string;
  confidence: number;
  sources: TutorSource[];
  quickActions: string[];
  quiz?: TutorQuizPrompt;
}

export function normalizeArabic(input: string): string {
  return input
    .toLowerCase()
    .replace(/[\u064B-\u065F\u0670\u0640]/g, '')
    .replace(/[إأآا]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/[^\u0600-\u06ffA-Za-z0-9+\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenize(text: string): string[] {
  return text.split(/[\s\-،.؛:!?؟]+/).filter(w => w.length > 1);
}

function findBestQuiz(query: string): { question: typeof SVT_QUIZ_QUESTIONS[0]; score: number } | null {
  const nq = normalizeArabic(query);
  let best: { question: typeof SVT_QUIZ_QUESTIONS[0]; score: number } | null = null;

  for (const q of SVT_QUIZ_QUESTIONS) {
    const nqText = normalizeArabic(q.questionText);
    const nExp = normalizeArabic(q.explanation);
    let score = 0;

    if (nqText.includes(nq)) score += 20;
    if (nExp.includes(nq)) score += 15;

    const qTokens = tokenize(nq);
    const qtTokens = tokenize(nqText);
    const qeTokens = tokenize(nExp);
    score += qTokens.filter(t => qtTokens.includes(t)).length * 5;
    score += qTokens.filter(t => qeTokens.includes(t)).length * 3;

    if (score >= 15 && (!best || score > best.score)) {
      best = { question: q, score };
    }
  }

  return best;
}

function buildReply(
  query: string,
  chunks: { chunk: SearchChunk; score: number }[],
  quizResult: { question: typeof SVT_QUIZ_QUESTIONS[0]; score: number } | null,
  fallbackText?: string
): SmartTutorReply {
  const sources: TutorSource[] = [];
  const seen = new Set<string>();

  chunks.forEach(({ chunk }) => {
    if (!seen.has(chunk.id)) {
      seen.add(chunk.id);
      sources.push({
        id: chunk.id,
        title: chunk.title,
        unitTitle: chunk.unitTitle,
        type: chunk.type,
        score: chunk.type === 'methodology' ? 5 : chunk.type === 'book' ? 4 : 3,
      });
    }
  });

  if (quizResult) {
    const unit = INITIAL_UNITS.find(u => u.id === quizResult.question.unitId);
    sources.unshift({
      id: `qcm_${quizResult.question.id}`,
      title: `سؤال QCM: ${quizResult.question.questionText.substring(0, 50)}...`,
      unitTitle: unit?.title || `وحدة ${quizResult.question.unitId}`,
      type: 'qcm',
      score: quizResult.score,
    });
  }

  let text = '';
  let confidence = 0;

  if (chunks.length > 0) {
    const best = chunks[0];
    confidence = Math.min(100, Math.round((best.score / 50) * 100));
    text = best.chunk.content;

    if (text.length > 800) {
      text = text.substring(0, 800) + '...';
    }
  } else if (quizResult) {
    confidence = 70;
    text = quizResult.question.explanation;
  } else if (fallbackText) {
    confidence = 30;
    text = fallbackText;
  } else {
    confidence = 0;
    text = 'هذا السؤال خارج قاعدة علوم الطبيعة والحياة للبكالوريا. ركز مراجعتك على وحدات البرنامج: تركيب البروتين، التحولات الطاقوية، والتكتونية العامة.';
  }

  const quickActions = [
    'اشرح آليات الاستنساخ',
    'اختبرني في الترجمة والريبوزوم',
    'فسر تأثير pH على النشاط الإنزيمي',
    'اشرح الاستجابة المناعية الخلطية',
    'ما دور LT4 في المناعة؟',
    'اشرح المرحلة الكيميوضوئية',
    'قارن بين التنفس والتخمر',
    'اشرح الغوص والتكتونية',
    'كيف أحلل وثيقة؟',
    'اعطني قالب فرضية',
    'ما الفرق بين استخرج واستنتج؟',
    'كيف أعلل أو أبرر؟',
    'كيف أكتب نصا علميا؟',
  ];

  return {
    text,
    confidence,
    sources: sources.slice(0, 5),
    quickActions,
    quiz: quizResult ? {
      id: quizResult.question.id,
      questionText: quizResult.question.questionText,
      options: quizResult.question.options,
      correctAnswerIndex: quizResult.question.correctAnswerIndex,
      explanation: quizResult.question.explanation,
      unitId: quizResult.question.unitId,
    } : undefined,
  };
}

function isOutOfProgram(query: string): boolean {
  const outKeywords = ['كرة القدم', 'فريق', 'لاعب', 'مباراة', 'فيلم', 'موسيقى', 'سيارة', 'سفر', 'طقس', 'أكل', 'طعام'];
  const nq = normalizeArabic(query);
  return outKeywords.some(k => nq.includes(normalizeArabic(k)));
}

export function answerTutorQuestion(query: string): SmartTutorReply {
  const trimmed = query.trim();
  if (!trimmed) {
    return {
      text: 'يرجى كتابة سؤال واضح حول مقرر العلوم الطبيعية للحياة.',
      confidence: 0,
      sources: [],
      quickActions: getTutorQuickSuggestions(),
    };
  }

  if (isOutOfProgram(trimmed)) {
    return {
      text: 'هذا السؤال خارج قاعدة علوم الطبيعة والحياة للبكالوريا. ركز مراجعتك على وحدات البرنامج: تركيب البروتين، التحولات الطاقوية، والتكتونية العامة.',
      confidence: 0,
      sources: [],
      quickActions: getTutorQuickSuggestions(),
    };
  }

  const cardMatches = findBestKnowledgeCards(trimmed);

  if (cardMatches.length > 0 && (cardMatches[0].exact || cardMatches[0].score >= 26)) {
    const main = cardMatches[0];
    const quiz = findRelatedQuiz(`${main.title} ${main.shortAnswer}`, main.unitId || undefined);

    const text = [
      '🧩 **بطاقة معرفة دقيقة من قاعدة كنز العلوم.**',
      '',
      `🎯 **المحور:** ${main.unitId === 0 ? 'منهجية البكالوريا' : unitTitle(main.unitId)}`,
      `📌 **الموضوع:** ${main.title}`,
      '',
      '✅ **الجواب المختصر الموثوق:**',
      main.shortAnswer,
      '',
      `🔑 **كلمات مفتاحية:** ${main.keywords.slice(0, 10).join(' • ')}`,
      `📖 **المصدر:** ${main.source}`,
      main.relatedQuestions.length ? `\nتابع بهذا: ${main.relatedQuestions.join(' | ')}` : '',
      '',
      '🎮 إذا أردت التثبيت، جرّب سؤال التدريب بالأسفل أو اختر سؤالاً مرتبطاً.'
    ].filter(Boolean).join('\n');

    return {
      text,
      confidence: Math.min(100, Math.max(85, Math.round(main.score))),
      sources: [
        {
          id: main.id,
          title: main.title,
          unitTitle: main.unitId === 0 ? 'منهجية البكالوريا' : unitTitle(main.unitId),
          type: 'card',
          score: main.score
        }
      ],
      quickActions: main.relatedQuestions.slice(0, 4),
      quiz,
    };
  }

  const methodologyMatch = findBestMethodologyQA(trimmed);
  const bookMatch = findBestBookQA(trimmed);

  const methodologyMatches =
    hasMethodologyIntent(trimmed) && !hasScientificContentIntent(trimmed)
      ? methodologyMatch
      : null;

  const methodStrong = !!methodologyMatches && methodologyMatches.score >= 25;
  const methodWeak = !!methodologyMatches && methodologyMatches.score >= 18;
  const bookOk = !!bookMatch && bookMatch.score >= 18;

  if (methodStrong || (methodWeak && !bookOk)) {
    const qa = methodologyMatches!.qa;
    const text =
      `🧭 **إجابة منهجية من كتاب المنهجية المحلي.**\n\n` +
      `📌 **السؤال:** ${qa.question}\n` +
      `✅ **الطريقة الصحيحة:**\n${qa.answer}\n` +
      (qa.template ? `\n🧩 **قالب جاهز:**\n${qa.template}\n` : '') +
      `\n🔑 **كلمات مفتاحية:** ${qa.keywords.join('، ')}\n` +
      `📖 **المصدر:** LIVRE MANHADJIYA.md (${qa.sourceBook})`;
    return {
      text,
      confidence: Math.min(100, 60 + methodologyMatch!.score),
      sources: [{
        id: qa.id,
        title: qa.question,
        unitTitle: 'منهجية البكالوريا',
        type: 'methodology',
        score: methodologyMatch!.score,
      }],
      quickActions: getTutorQuickSuggestions(),
    };
  }

  if (bookOk) {
    const qa = bookMatch!.qa;
    const text =
      `📚 **إجابة من بنك الأسئلة المستخرج من الكتب المرفقة.**\n\n` +
      `🎯 **المحور:** ${qa.topic}\n` +
      `📌 **السؤال:** ${qa.question}\n` +
      `✅ **الجواب الدقيق:**\n${qa.answer}\n` +
      `\n🔑 **كلمات مفتاحية:** ${qa.keywords.join('، ')}\n` +
      `📖 **المصدر:** ${qa.sourceBook}`;
    return {
      text,
      confidence: Math.min(100, 60 + bookMatch!.score),
      sources: [{
        id: qa.id,
        title: qa.question,
        unitTitle: qa.topic,
        type: 'book',
        score: bookMatch!.score,
      }],
      quickActions: getTutorQuickSuggestions(),
    };
  }

  const scoredChunks: { chunk: SearchChunk; score: number }[] = [];

  for (const chunk of ALL_CHUNKS) {
    const score = scoreSearchChunk(trimmed, chunk);
    if (score > 0) {
      scoredChunks.push({ chunk, score });
    }
  }

  scoredChunks.sort((a, b) => b.score - a.score);
  const topChunks = scoredChunks.slice(0, 3);

  const quizResult = findBestQuiz(trimmed);

  let fallbackText: string | undefined;
  if (topChunks.length === 0 && !quizResult) {
    fallbackText = 'أهلاً بك يا بحار المعرفة! المرشد الذكي يعمل الآن في وضع المراجعة المحلي. يمكنني مساعدتك في تثبيت المفاهيم الأساسية في علوم الطبيعة والحياة: تركيب البروتين، البنية والوظيفة، الإنزيمات، المناعة، الاتصال العصبي، التحولات الطاقوية، والتكتونية.';
  }

  return buildReply(trimmed, topChunks, quizResult, fallbackText);
}

export function gradeTutorQuizAnswer(quiz: TutorQuizPrompt, selectedIndex: number): SmartTutorReply {
  const isCorrect = selectedIndex === quiz.correctAnswerIndex;

  let text = '';
  if (isCorrect) {
    text = `✅ إجابة صحيحة!\n\n${quiz.explanation}`;
  } else {
    const correctOption = quiz.options[quiz.correctAnswerIndex];
    text = `❌ إجابة خاطئة.\n\nالإجابة الصحيحة هي:\n${correctOption}\n\nالشرح:\n${quiz.explanation}`;
  }

  const unit = INITIAL_UNITS.find(u => u.id === quiz.unitId);

  return {
    text,
    confidence: 100,
    sources: [{
      id: `qcm_${quiz.id}`,
      title: `QCM وحدة ${quiz.unitId}`,
      unitTitle: unit?.title || `وحدة ${quiz.unitId}`,
      type: 'qcm',
      score: 100,
    }],
    quickActions: getTutorQuickSuggestions(),
  };
}

export function getTutorDomainCards(): { id: string; title: string; color: string; description: string }[] {
  return [
    {
      id: 'domaine1',
      title: 'البروتينات والمناعة',
      color: '#006d37',
      description: 'تركيب البروتين، البنية والوظيفة، النشاط الإنزيمي، المناعة، الاتصال العصبي',
    },
    {
      id: 'domaine2',
      title: 'التحولات الطاقوية',
      color: '#944a00',
      description: 'التركيب الضوئي، التنفس الخلوي، التخمر، الحصيلة الطاقوية',
    },
    {
      id: 'domaine3',
      title: 'التكتونية العامة',
      color: '#0891b2',
      description: 'النشاط التكتوني، بنية الكرة الأرضية، البنيات الجيولوجية',
    },
  ];
}

export function getTutorQuickSuggestions(): string[] {
  return [
    'اشرح آليات الاستنساخ',
    'اختبرني في الترجمة والريبوزوم',
    'فسر تأثير pH على النشاط الإنزيمي',
    'اشرح الاستجابة المناعية الخلطية',
    'ما دور LT4 في المناعة؟',
    'اشرح المرحلة الكيميوضوئية',
    'قارن بين التنفس والتخمر',
    'اشرح الغوص والتكتونية',
    'كيف أحلل وثيقة؟',
    'اعطني قالب فرضية',
    'ما الفرق بين استخرج واستنتج؟',
    'كيف أعلل أو أبرر؟',
    'كيف أكتب نصا علميا؟',
  ];
}
