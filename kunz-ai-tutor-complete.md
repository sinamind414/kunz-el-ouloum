# Kunz el Ouloum — Module Tuteur Intelligent (Smart Tutor)

Ce fichier regroupe en un seul endroit tout ce qui compose le « Smart Tutor » de l'application :
les données (`src/data/smartBotData.ts`, `src/data/methodologyKnowledge.ts`), la normalisation arabe
(`src/utils/arabicNormalize.ts`), la gestion de session (`src/utils/sessionManager.ts`), le moteur de
réponses (`src/utils/smartTutorEngine.ts`), et l'interface (`src/components/AITutorView.tsx`,
`SmartBotMessage.tsx`, `SmartBotQuizCard.tsx`).

Le tuteur est désormais un **professeur local hors-ligne** qui : choisit un domaine, lance un
**diagnostic QCM**, corrige et mémorise les erreurs (`mistakes`), propose une révision ciblée, et
répond aux questions de cours / méthodologie.

---

## 1. Arborescence (`src`)

```
src
├── App.tsx
├── bookTutorQA.ts
├── components
│   ├── AITutorView.tsx          (chat principal du tuteur)
│   ├── SmartBotMessage.tsx      (rendu d'un message + quick actions + sources)
│   ├── SmartBotQuizCard.tsx     (carte QCM interactive A/B/C/D)
│   ├── DashboardView.tsx
│   ├── LessonAdventurePortal.tsx
│   ├── LessonsView.tsx
│   ├── MethodologyView.tsx
│   ├── QuizView.tsx
│   ├── RevisionView.tsx
│   ├── SplashView.tsx
│   ├── StatsView.tsx
│   └── StudyReminderModal.tsx
├── data
│   ├── smartBotData.ts          (DOMAINS, KNOWLEDGE_CARDS, banques QCM, erreurs courantes)
│   └── methodologyKnowledge.ts  (cartes de méthodologie bac)
├── data.ts
├── index.css
├── knowledgeCards.ts
├── lessonData.ts
├── main.tsx
├── methodologyKnowledge.ts
├── tutorKnowledge.ts
├── types.ts
├── utils
│   ├── arabicNormalize.ts       (normalizeArabic, calculateKeywordScore, tokenizeArabic)
│   ├── audio.ts
│   ├── hints.ts
│   ├── sessionManager.ts        (BotSession + persistance localStorage)
│   └── smartTutorEngine.ts      (moteur de réponses/quiz)
└── vite-env.d.ts
```

---

## 2. Données — `src/data/smartBotData.ts`

Centre de connaissances du tuteur : 3 domaines, 10 cartes de cours, 60 questions QCM (20 par
domaine) et 60 erreurs courantes. Le moteur consomme aussi `tutorKnowledge.ts` et `bookTutorQA.ts`.

### Interfaces & domaines

```ts
export interface DomainCard {
  id: number;
  title: string;
  subtitle: string;
  emoji: string;
  menuBullets: string[];
  quickActions: string[];
}

export interface KnowledgeCard {
  id: string;
  domainId: number;
  title: string;
  aliases: string[];
  shortAnswer: string;
  keywords: string[];
  relatedQuestions: string[];
}

export interface QuizQuestion {
  id: string;
  domainId: number;
  topicId: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  commonMistakeId?: string;
}

export interface CommonMistake {
  id: string;
  mistake: string;
  correction: string;
}

export const DOMAINS: DomainCard[] = [
  { id: 1, title: 'البروتينات والمناعة', subtitle: 'تركيب البروتين، الإنزيمات، المناعة، الاتصال العصبي', emoji: '🧬',
    menuBullets: ['تركيب البروتين', 'بنية البروتين', 'النشاط الإنزيمي', 'المناعة', 'الاتصال العصبي'],
    quickActions: ['اختبار تشخيصي', 'راجع تركيب البروتين (الاستنساخ والترجمة)', 'راجع النشاط الإنزيمي', 'راجع الاستجابة المناعية', 'راجع الاتصال العصبي', 'راجع أخطائي السابقة', 'العودة للقائمة الرئيسية'] },
  { id: 2, title: 'التحولات الطاقوية', subtitle: 'التركيب الضوئي، التنفس، التخمر، ATP', emoji: '⚡',
    menuBullets: ['التركيب الضوئي', 'المرحلة الكيميوضوئية', 'حلقة كالفن', 'التنفس الخلوي', 'التخمر'],
    quickActions: ['اختبار تشخيصي', 'راجع المرحلة الكيميوضوئية', 'راجع حلقة كالفن', 'قارن بين التنفس والتخمر', 'راجع أخطائي السابقة', 'العودة للقائمة الرئيسية'] },
  { id: 3, title: 'التكتونية العامة', subtitle: 'الصفائح، بنية الأرض، الغوص، البنيات الجيولوجية', emoji: '🌍',
    menuBullets: ['الصفائح التكتونية', 'بنية الكرة الأرضية', 'الموجات الزلزالية', 'الغوص', 'البنيات الجيولوجية'],
    quickActions: ['اختبار تشخيصي', 'راجع بنية الكرة الأرضية', 'راجع الموجات الزلزالية', 'راجع الغوص', 'راجع أخطائي السابقة', 'العودة للقائمة الرئيسية'] },
];
```

### Cartes de cours (`KNOWLEDGE_CARDS`)

10 cartes, chacune reliée à un `domainId` : `protein_synthesis`, `enzyme_activity`, `immune_response`,
`nervous_communication` (domaine 1) ; `photosynthesis`, `cellular_respiration` (domaine 2) ;
`earth_structure`, `seismic_waves`, `lithosphere_asthenosphere`, `subduction` (domaine 3).
Exemple :

```ts
{
  id: 'protein_synthesis',
  domainId: 1,
  title: 'تركيب البروتين (الاستنساخ والترجمة)',
  aliases: ['تركيب البروتين', 'الاستنساخ والترجمة', 'النسخ والترجمة', 'الاستنساخ', 'الترجمة', 'transcription traduction', 'بروتين'],
  shortAnswer: 'يتم تركيب البروتين على مرحلتين: النسخ (الاستنساخ) داخل النواة ...',
  keywords: ['نسخ', 'ترجمة', 'ARNm', 'ARNt', 'ريبوزوم', 'كودون', 'AUG', 'بروتين', 'نواة', 'هيولى'],
  relatedQuestions: ['الفرق بين النسخ والترجمة؟', 'ما دور ARN بوليميراز؟', 'أين تتم الترجمة؟'],
}
```

### Banques QCM (`DOMAIN_QUESTION_BANKS`)

`Record<number, QuizQuestion[]>` : 20 questions par domaine reliées à une carte via `topicId` et à
une erreur courante via `commonMistakeId`. Helpers :

```ts
export function getQuestionsForDomain(domainId: number): QuizQuestion[] {
  return DOMAIN_QUESTION_BANKS[domainId] || [];
}

export function getQuestionById(questionId: string): QuizQuestion | undefined {
  for (const domainId of Object.keys(DOMAIN_QUESTION_BANKS)) {
    const found = DOMAIN_QUESTION_BANKS[Number(domainId)].find((q) => q.id === questionId);
    if (found) return found;
  }
  return undefined;
}

export function getMistakeById(id?: string): CommonMistake | undefined {
  if (!id) return undefined;
  return COMMON_MISTAKES.find((m) => m.id === id);
}

export function getCardById(id: string): KnowledgeCard | undefined {
  return KNOWLEDGE_CARDS.find((c) => c.id === id);
}
```

---

## 3. Méthodologie — `src/data/methodologyKnowledge.ts`

Cartes déclenchées par mots-clés (analyse de document, démarche scientifique, comparaison,
hypothèse, justification).

```ts
import { normalizeArabic } from '../utils/arabicNormalize';

export interface MethodologyCard {
  id: string;
  triggers: string[];
  title: string;
  steps: string[];
}

export const METHODOLOGY_CARDS: MethodologyCard[] = [
  { id: 'method_doc_analysis', triggers: ['كيف احلل وثيقه', 'تحليل وثيقه', 'منهجيه الوثيقه', 'استثمار وثيقه', 'كيف استخرج المعطيات', 'قالب تحليل'],
    title: 'منهجية تحليل واستثمار وثيقة علمية',
    steps: ['1. الملاحظة...', '2. الاستخراج...', '3. التفسير...', '4. الخلاصة...'] },
  { id: 'method_scientific_process', triggers: ['المسعي العلمي', 'السعي العلمي', 'كيف افسر ظاهره', 'منهجيه حل مشكله علميه', 'كيف اطرح فرضيه', 'الاستدلال العلمي'],
    title: 'منهجية حل مشكلة علمية (المسعى العلمي)',
    steps: ['1. طرح المشكلة...', '2. صياغة الفرضية...', '3. اختبار الفرضية...', '4. تحليل النتائج...', '5. الخلاصة...'] },
  { id: 'method_compare', triggers: ['كيف اقارن', 'المقارنه بين', 'منهجيه المقارنه', 'قارن بين', 'تحليل مقارن'],
    title: 'منهجية المقارنة بين ظاهرتين أو معطيين',
    steps: ['1. حدد عناصر المقارنة...', '2. أوجه التشابه...', '3. أوجه الاختلاف...', '4. استنتاج...'] },
  { id: 'method_hypothesis', triggers: ['كيف اقترح فرضيه', 'اقترح فرضيه', 'قالب فرضيه', 'صياغه فرضيه'],
    title: 'منهجية اقتراح فرضية',
    steps: ['1. استخرج المشكل...', '2. اربطها...', '3. صغ تفسيراً...', '4. اجعلها قابلة للاختبار...'] },
  { id: 'method_justify', triggers: ['كيف اعلل', 'كيف ابرر', 'قالب تعليل', 'قالب تبرير', 'علل', 'برر'],
    title: 'منهجية التعليل والتبرير',
    steps: ['1. ابدأ بالدليل...', '2. أضف المكتسب...', '3. اربط...', '4. اختم...'] },
];

export function findMethodologyCard(normalizedInput: string): MethodologyCard | null {
  const input = normalizeArabic(normalizedInput);
  for (const card of METHODOLOGY_CARDS) {
    for (const trigger of card.triggers) {
      if (input.includes(normalizeArabic(trigger))) return card;
    }
  }
  return null;
}
```

---

## 4. Normalisation arabe — `src/utils/arabicNormalize.ts`

Factorisé hors du moteur. `normalizeArabic` unifie les voyelles/lettres, `calculateKeywordScore`
compte les mots-clés présents, `tokenizeArabic` extrait les tokens de 3+ caractères.

```ts
export function normalizeArabic(input: string): string {
  if (!input) return '';

  return input
    .toLowerCase()
    .replace(/[\u064B-\u065F\u0670ـ]/g, '')
    .replace(/[إأآا]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/[^\u0600-\u06ffA-Za-z0-9+\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function calculateKeywordScore(normalizedInput: string, keywords: string[]): number {
  let score = 0;
  const normalizedKeywords = keywords.map((keyword) => normalizeArabic(keyword)).filter(Boolean);

  for (const keyword of normalizedKeywords) {
    if (normalizedInput.includes(keyword)) score += 1;
  }

  return score;
}

export function tokenizeArabic(input: string): string[] {
  const normalized = normalizeArabic(input);
  return Array.from(new Set(normalized.match(/[\u0600-\u06ffA-Za-z0-9+]{3,}/g) || []));
}
```

---

## 5. Gestion de session — `src/utils/sessionManager.ts`

État de la conversation tuteur (domaine actif, mode, quiz en cours, **erreurs mémorisées**), persisté
dans `localStorage` (clé `smart_tutor_session`). Remplace l'ancienne gestion éparpillée dans `App.tsx`.

```ts
export type BotMode = 'idle' | 'domain_menu' | 'diagnostic' | 'lesson' | 'quiz' | 'bac_challenge' | 'review';

export interface QuizState {
  questionId: string;
  questionIndex: number;
  totalQuestions: number;
  correctAnswers: number;
}

export interface BotSession {
  activeDomainId: number | null;
  activeUnitId: number | null;
  activeTopicId: string | null;
  mode: BotMode;
  currentQuiz: QuizState | null;
  mistakes: string[];
  lastInteraction: number;
}

const STORAGE_KEY = 'smart_tutor_session';

const defaultSession: BotSession = {
  activeDomainId: null,
  activeUnitId: null,
  activeTopicId: null,
  mode: 'idle',
  currentQuiz: null,
  mistakes: [],
  lastInteraction: Date.now(),
};

export function getDefaultSession(): BotSession {
  return { ...defaultSession, mistakes: [], currentQuiz: null, lastInteraction: Date.now() };
}

export function loadSession(): BotSession {
  if (typeof window === 'undefined') return getDefaultSession();

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as Partial<BotSession>;
      return { ...getDefaultSession(), ...parsed };
    }
  } catch (error) {
    console.error('Erreur de chargement de session:', error);
  }

  return getDefaultSession();
}

export function saveSession(session: BotSession): void {
  if (typeof window === 'undefined') return;

  try {
    const next = { ...session, lastInteraction: Date.now() };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch (error) {
    console.error('Erreur de sauvegarde de session:', error);
  }
}

export function startDomainSession(domainId: number): BotSession {
  const newSession: BotSession = {
    ...getDefaultSession(),
    activeDomainId: domainId,
    mode: 'domain_menu',
  };

  saveSession(newSession);
  return newSession;
}

export function startQuiz(
  session: BotSession,
  totalQuestions: number,
  firstQuestionId: string,
  mode: BotMode = 'quiz'
): BotSession {
  const newSession: BotSession = {
    ...session,
    mode,
    currentQuiz: {
      questionId: firstQuestionId,
      questionIndex: 0,
      totalQuestions,
      correctAnswers: 0,
    },
  };

  saveSession(newSession);
  return newSession;
}

export function recordQuizAnswer(
  session: BotSession,
  isCorrect: boolean,
  topicIdForMistake: string | null,
  nextQuestionId: string | null
): BotSession {
  if (!session.currentQuiz) return session;

  const updatedMistakes = [...session.mistakes];
  if (!isCorrect && topicIdForMistake && !updatedMistakes.includes(topicIdForMistake)) {
    updatedMistakes.push(topicIdForMistake);
  }

  const correctAnswers = session.currentQuiz.correctAnswers + (isCorrect ? 1 : 0);
  const nextIndex = session.currentQuiz.questionIndex + 1;
  const isLastQuestion = nextIndex >= session.currentQuiz.totalQuestions;

  const newSession: BotSession = {
    ...session,
    mistakes: updatedMistakes,
    currentQuiz: isLastQuestion || !nextQuestionId
      ? null
      : {
          ...session.currentQuiz,
          questionId: nextQuestionId,
          questionIndex: nextIndex,
          correctAnswers,
        },
    mode: isLastQuestion || !nextQuestionId ? 'domain_menu' : session.mode,
  };

  saveSession(newSession);
  return newSession;
}

export function resetSession(): BotSession {
  const session = getDefaultSession();
  saveSession(session);
  return session;
}
```

---

## 6. Le moteur — `src/utils/smartTutorEngine.ts`

Moteur 100 % local qui recherche la meilleure réponse dans les bases (cartes cours, livre, OPUS) via
une recherche lexicale arabe normalisée, gère le diagnostic QCM, la correction et les erreurs.

```ts
import {
  loadSession,
  resetSession,
  saveSession,
  getDefaultSession,
  startDomainSession,
  startQuiz,
  recordQuizAnswer,
  type BotSession,
} from './sessionManager';
import {
  DOMAINS,
  KNOWLEDGE_CARDS,
  getQuestionsForDomain,
  getQuestionById,
  getMistakeById,
  getCardById,
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
}

export interface EngineResult {
  session: BotSession;
  action: TutorAction;
}

const OUT_OF_PROGRAM = [
  'كرة القدم', 'فريق', 'لاعب', 'مباراه', 'فيلم', 'موسيقى',
  'سياره', 'سفر', 'طقس', 'اكل', 'طعام',
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

  const newSession = startDomainSession(domainId);
  const cards = KNOWLEDGE_CARDS.filter((c) => c.domainId === domainId);

  const text =
    `📚 اخترت مجال: **${domain.title}**\n${domain.subtitle}\n\n` +
    `المواضيع المتاحة للمراجعة:\n` +
    cards.map((c, i) => `${i + 1}. ${c.title}`).join('\n') +
    `\n\nابدأ باختبار تشخيصي، أو راجع موضوعاً مباشرةً من القائمة أدناه.`;

  const quickActions = [
    'اختبار تشخيصي',
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

  return { session: newSession, action: { text, quiz, quickActions } };
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
```

### Flux de `processStudentInput`

1. Retour menu principal (`القائمة الرئيسية`) → réinitialise la session (erreurs conservées).
2. `راجع أخطائي` → `reviewMistakes` liste les cartes des erreurs enregistrées.
3. Hors-programme → message de redirection + source `out`.
4. `اختبار` → `startDiagnostic` lance le QCM du domaine.
5. Si un quiz est en cours (`mode quiz/diagnostic`) → `gradeQuizAnswer` corrige, mémorise l'erreur
   (`recordQuizAnswer`), enchaîne sur la question suivante ou affiche le bilan + appréciation.
6. Aucun domaine actif + nom de domaine tapé → `handleDomainClick`.
7. Carte méthodologie détectée → réponse méthodologique.
8. Sinon `buildAnswer` (carte cours + livres + OPUS) ou message de repli.

---

## 7. Interface principale — `src/components/AITutorView.tsx`

Composant React (Tailwind + lucide-react) qui pilote le chat. Il délègue le rendu des messages à
`SmartBotMessage`, affiche les cartes de domaines au démarrage, et utilise `processStudentInput`
pour obtenir chaque réponse.

```tsx
import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, BrainCircuit, Trash2, GraduationCap } from 'lucide-react';
import {
  loadSession,
  resetSession,
  type BotSession,
} from '../utils/sessionManager';
import {
  handleDomainClick,
  processStudentInput,
} from '../utils/smartTutorEngine';
import { DOMAINS } from '../data/smartBotData';
import SmartBotMessage, { type BotMessageData } from './SmartBotMessage';

interface AITutorViewProps {
  onBackToDashboard?: () => void;
}

const WELCOME_TEXT =
  'مرحباً بك يا بحّار المعرفة! أنا الأستاذ الذكي لـ **كنز العلوم** 🏴‍☠️.\n' +
  'أنا أستاذ محلي يعمل بدون إنترنت: أختار لك مجالاً، أشخّص مستواك بأسئلة QCM، أصحّح أخطاءك وأراجعها معك، وأعلّمك المنهجية.\n' +
  'ابدأ باختيار أحد المجالات الثلاثة أدناه.';

export default function AITutorView({ onBackToDashboard }: AITutorViewProps) {
  const [session, setSession] = useState<BotSession>(() => loadSession());
  const [messages, setMessages] = useState<BotMessageData[]>([
    { id: 'welcome', sender: 'ai', text: WELCOME_TEXT },
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const showDomainCards = session.activeDomainId == null;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const appendExchange = (
    userText: string,
    aiText: string,
    quickActions?: string[],
    quiz?: BotMessageData['quiz'],
    sources?: BotMessageData['sources']
  ) => {
    const userMsg: BotMessageData = {
      id: `user_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      sender: 'user',
      text: userText,
    };
    const aiMsg: BotMessageData = {
      id: `ai_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      sender: 'ai',
      text: aiText,
      quickActions,
      quiz,
      sources,
    };
    setMessages((prev) => [...prev, userMsg, aiMsg]);
  };

  const handleDomainSelect = (domainId: number) => {
    const res = handleDomainClick(session, domainId);
    setSession(res.session);
    setMessages((prev) => [
      ...prev,
      {
        id: `ai_domain_${Date.now()}`,
        sender: 'ai',
        text: res.action.text,
        quickActions: res.action.quickActions,
      },
    ]);
  };

  const handleSend = (rawText: string) => {
    const trimmed = (rawText || '').trim();
    if (!trimmed) return;

    const res = processStudentInput(session, trimmed);
    setSession(res.session);
    appendExchange(trimmed, res.action.text, res.action.quickActions, res.action.quiz, res.action.sources);
  };

  const handleQuickAction = (action: string) => {
    handleSend(action);
  };

  const handleAnswer = (letter: string) => {
    handleSend(letter);
  };

  const handleClear = () => {
    const fresh = resetSession();
    setSession(fresh);
    setMessages([{ id: 'welcome', sender: 'ai', text: WELCOME_TEXT }]);
    setInput('');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] md:h-[calc(100vh-100px)] bg-[#ffffff] border border-[#e2dabf]/60 rounded-3xl shadow-sm overflow-hidden font-sans">
      <div className="bg-[#fff9ed] border-b border-[#e2dabf]/60 px-5 py-4 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-[#006d37]/10 rounded-full blur-sm" />
            <div className="w-10 h-10 rounded-full bg-[#006d37] text-white flex items-center justify-center text-xl relative">
              🧠
            </div>
          </div>
          <div>
            <h3 className="font-extrabold text-base text-[#006d37] flex items-center gap-1.5">
              <span>الأستاذ الذكي (كنز العلوم)</span>
              <BrainCircuit className="w-4 h-4 text-[#944a00]" />
            </h3>
            <span className="text-[10px] text-[#506072] font-semibold block">
              أستاذ محلي - يعمل بدون إنترنت
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleClear}
          className="p-2.5 rounded-xl hover:bg-[#ba1a1a]/10 text-[#ba1a1a] transition-all cursor-pointer"
          title="إعادة تعيين الجلسة"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-[#fcf3d8]/10">
        {messages.map((msg) => (
          <SmartBotMessage
            key={msg.id}
            message={msg}
            onQuickAction={handleQuickAction}
            onAnswer={handleAnswer}
          />
        ))}

        {showDomainCards && (
          <div className="ml-auto max-w-[90%] space-y-2">
            <div className="flex items-center gap-2 mb-1 text-[#006d37] font-bold text-sm">
              <Sparkles className="w-4 h-4 text-[#944a00]" />
              <span>اختر مجالاً لبدء جلسة المراجعة:</span>
            </div>
            {DOMAINS.map((domain) => (
              <button
                key={domain.id}
                type="button"
                onClick={() => handleDomainSelect(domain.id)}
                className="w-full text-right px-4 py-3 rounded-2xl bg-[#ffffff] border border-[#e2dabf] hover:border-[#006d37] hover:shadow-sm transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-2xl">{domain.emoji}</span>
                  <span className="text-sm font-bold text-[#1f1c0b] group-hover:text-[#006d37] transition-colors">
                    {domain.title}
                  </span>
                </div>
                <p className="text-[11px] text-[#506072] leading-relaxed pr-9">{domain.subtitle}</p>
                <div className="flex flex-wrap gap-1 mt-2 pr-9">
                  {domain.menuBullets.map((b, i) => (
                    <span
                      key={i}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-[#006d37]/10 text-[#006d37] font-semibold"
                    >
                      {b}
                    </span>
                  ))}
                </div>
              </button>
            ))}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-[#e2dabf]/60 shrink-0 bg-[#ffffff]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(input);
            setInput('');
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="اسأل الأستاذ الذكي أو اكتب إجابتك (A/B/C/D)..."
            className="flex-1 px-4 h-12 rounded-xl bg-[#f3f4f5] border border-transparent focus:border-[#006d37] focus:bg-[#ffffff] text-sm focus:outline-none transition-all placeholder:text-[#506072]/60"
          />
          <button
            type="submit"
            className="w-12 h-12 bg-[#006d37] hover:bg-[#00562b] text-[#ffffff] rounded-xl flex items-center justify-center cursor-pointer transition-colors"
            title="إرسال"
          >
            <Send className="w-5 h-5 rotate-180" />
          </button>
        </form>
      </div>
    </div>
  );
}
```

### `src/components/SmartBotMessage.tsx`

Rend un message (texte, bulles, quick actions, sources). Le `quiz` est délégué à `SmartBotQuizCard`.

```tsx
import type { QuizCardData } from './SmartBotQuizCard';
import SmartBotQuizCard from './SmartBotQuizCard';
import type { SourceRef, SourceType } from '../utils/smartTutorEngine';

export interface BotMessageData {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  quickActions?: string[];
  quiz?: QuizCardData;
  sources?: SourceRef[];
}

interface SmartBotMessageProps {
  message: BotMessageData;
  onQuickAction: (action: string) => void;
  onAnswer: (letter: string) => void;
}

const SOURCE_META: Record<SourceType, { label: string; cls: string }> = {
  card: { label: 'بطاقة', cls: 'bg-[#006d37]/10 text-[#006d37]' },
  book: { label: 'كتاب', cls: 'bg-[#944a00]/10 text-[#944a00]' },
  opus: { label: 'درس', cls: 'bg-[#1d4ed8]/10 text-[#1d4ed8]' },
  methodology: { label: 'منهجية', cls: 'bg-[#7c3aed]/10 text-[#7c3aed]' },
  domain: { label: 'مجال', cls: 'bg-[#006d37]/10 text-[#006d37]' },
  quiz: { label: 'اختبار', cls: 'bg-[#006d37]/10 text-[#006d37]' },
  out: { label: 'خارج البرنامج', cls: 'bg-[#ba1a1a]/10 text-[#ba1a1a]' },
};

function renderText(text: string) {
  return text.split('\n').map((line, lIdx) => {
    if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      const content = line.trim().substring(2);
      return (
        <li key={lIdx} className="list-disc list-inside ml-2">
          {content}
        </li>
      );
    }
    return <p key={lIdx}>{line || ' '}</p>;
  });
}

export default function SmartBotMessage({ message, onQuickAction, onAnswer }: SmartBotMessageProps) {
  const isUser = message.sender === 'user';

  return (
    <div dir="rtl" className={`flex gap-3 max-w-[90%] ${isUser ? 'mr-auto flex-row-reverse' : 'ml-auto'}`}>
      <div className="space-y-1">
        <div
          className={`p-4 rounded-2xl text-sm leading-relaxed ${
            isUser
              ? 'bg-[#006d37] text-[#ffffff] rounded-tl-none font-medium'
              : 'bg-[#ffffff] text-[#1f1c0b] border border-[#e2dabf]/60 rounded-tr-none shadow-sm'
          }`}
        >
          <div className="whitespace-pre-wrap space-y-2">{renderText(message.text)}</div>

          {message.quiz && (
            <SmartBotQuizCard
              key={message.quiz.id}
              quiz={message.quiz}
              onAnswer={onAnswer}
            />
          )}
        </div>

        {!isUser && message.quickActions && message.quickActions.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {message.quickActions.map((action, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onQuickAction(action)}
                className="bg-[#ffffff] hover:bg-[#fed65b]/20 border border-[#e2dabf] px-3 py-1.5 rounded-xl text-xs font-bold text-[#006d37] hover:text-[#00562b] cursor-pointer transition-colors"
              >
                {action}
              </button>
            ))}
          </div>
        )}

        {!isUser && message.sources && message.sources.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            <span className="text-[10px] font-bold text-[#506072] self-center">📚 المصادر:</span>
            {message.sources.map((src, idx) => {
              const meta = SOURCE_META[src.type];
              return (
                <span
                  key={idx}
                  title={src.title}
                  className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${meta.cls}`}
                >
                  {meta.label}: {src.title}
                </span>
              );
            })}
          </div>
        )}

        {isUser && message.quickActions && message.quickActions.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1 justify-end">
            {message.quickActions.map((action, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onQuickAction(action)}
                className="bg-[#006d37]/5 hover:bg-[#006d37]/10 border border-[#006d37]/20 px-3 py-1.5 rounded-xl text-xs font-bold text-[#006d37] cursor-pointer transition-colors"
              >
                {action}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

### `src/components/SmartBotQuizCard.tsx`

Carte QCM interactive : options A/B/C/D, verrouillage après réponse, renvoie la lettre via `onAnswer`.

```tsx
import { useState } from 'react';

export interface QuizCardData {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface SmartBotQuizCardProps {
  quiz: QuizCardData;
  onAnswer: (letter: string) => void;
}

const LETTERS = ['A', 'B', 'C', 'D'];

export default function SmartBotQuizCard({ quiz, onAnswer }: SmartBotQuizCardProps) {
  const [locked, setLocked] = useState(false);

  const handleClick = (index: number) => {
    if (locked) return;
    setLocked(true);
    onAnswer(LETTERS[index]);
  };

  return (
    <div dir="rtl" className="mt-3 bg-[#fff9ed] border-2 border-[#006d37]/20 rounded-2xl p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-bold text-[#006d37]">🧪 اختبر فهمك</span>
      </div>
      <p className="text-sm font-bold text-[#1f1c0b] mb-3 leading-relaxed">{quiz.question}</p>
      <div className="space-y-2">
        {quiz.options.map((option, idx) => (
          <button
            key={idx}
            type="button"
            disabled={locked}
            onClick={() => handleClick(idx)}
            className={`w-full text-right px-4 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer border ${
              locked
                ? 'bg-[#f3f4f5] border-[#e2dabf] text-[#506072]'
                : 'bg-[#ffffff] border-[#e2dabf] hover:border-[#006d37] hover:bg-[#006d37]/5 text-[#1f1c0b]'
            }`}
          >
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-[#006d37]/10 text-[#006d37] text-xs font-black mr-2">
              {LETTERS[idx]}
            </span>
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
```

---

## 8. Résumé des changements

- **Session** : l'ancien `sessionManager` (units/flashcards/progress/thème) est remplacé par un
  `BotSession` léger centré sur le tuteur (domaine actif, mode, quiz en cours, **erreurs**).
- **Moteur** : `smartTutorEngine` utilise désormais des `BotSession`/`EngineResult`, un diagnostic QCM
  par domaine, la mémorisation/correction des erreurs, et des types renommés (`QuizPrompt`,
  `TutorAction`, `SourceRef`, `SourceType`).
- **Données** : nouveau `src/data/smartBotData.ts` (10 cartes, 60 QCM, erreurs courantes) et
  `methodologyKnowledge.ts` restructuré en cartes à déclencheurs.
- **Normalisation** : `normalizeArabic`/`calculateKeywordScore`/`tokenizeArabic` extraits dans
  `arabicNormalize.ts`.
- **UI** : `AITutorView` délègue le rendu à `SmartBotMessage` + `SmartBotQuizCard` ; plus de mascot
  image, remplacé par un avatar 🧠 ; les sources sont affichées sous forme de puces colorées par type.

---

## 9. Correctifs additionnels (Boss Fight, XP, erreurs, markdown)

### 9.1 Bug `mistakes` corrigé (persistance)

`startDomainSession(domainId, currentMistakes)` conserve désormais les erreurs globales quand
l'élève change de domaine ; `handleDomainClick` passe `session.mistakes`. Le retour au menu
(`العودة للقائمة الرئيسية`) préserve aussi `session.mistakes` (`back` spread les erreurs).

### 9.2 Boss Fight BAC

Ajout dans `smartBotData.ts` (`BOSS_FIGHT_SCENARIOS`, `getBossScenariosForDomain`,
`getBossScenarioById`), `sessionManager.ts` (`BossState`, `startBossFightSession`, `startBossStep`,
`finishBossFight`) et `smartTutorEngine.ts` (`startBossFight`, `handleBossInput`).

Flux : `تحدي BAC` → situation problème → l'élève répond (ou `لا أعرف`) → correction type +
points clés → auto-évaluation (`إجابة كاملة (+10)` / `ناقصة (+5)` / `لم أجب (0)`) → question suivante
→ score final → `reward: { xpGained }`.

Domaines couverts : D1 immunité/structure-fonction, D2 photosynthèse/transformations énergétiques,
D3 structure de la Terre/ondes sismiques.

### 9.3 Gamification XP

`TutorAction` possède `reward?: { xpGained: number }`. Le moteur le renvoie à la fin du diagnostic
QCM (`correctCount * 10`) et du Boss Fight (`total` des points). `AITutorView` capte la récompense via
`onAwardXP?.(xp)` et `App.tsx` met à jour `progress.xp` + `studyMinutes`, persiste via
`saveToLocalStorage(units, flashcards, updatedProgress)` et `updateLastStudyTime()`.

### 9.4 Markdown amélioré

`SmartBotMessage.tsx` gère `**gras**`, les puces `-`/`*`, et les lignes vides (`renderBold` +
`renderText`).

### 9.5 Vérifications

```bash
npm run lint   # OK (tsc --noEmit)
npm run build  # OK (vite build + esbuild server.ts -> dist/)
```

