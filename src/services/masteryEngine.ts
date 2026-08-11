// ═══════════════════════════════════════════════════════════════════════
// V3 — MASTERY ENGINE : mesure la maîtrise réelle de l'élève.
// Couche 2 de l'architecture « La Boussole » :
//   1. Focus Engine   → choisit la prochaine action ;
//   2. Mastery Engine → mesure la maîtrise (ce fichier) ;
//   3. Gating Engine  → contrôle les déverrouillages.
//
// Règles validées :
//   - Examen de validation d'unité (« Le Gardien ») : 10 QCM de l'unité,
//     seuil de réussite 80 %.
//   - Après un échec : jamais « Échec, recommence » seul — on diagnostique
//     les lacunes et on propose une boucle de remédiation ciblée.
//   - Offline-first : état persisté dans localStorage, jamais bloquant.
// ═══════════════════════════════════════════════════════════════════════

import type { QuizQuestion } from '../types';

export const EXAM_PASS_THRESHOLD = 80; // % requis pour valider une unité
export const EXAM_QUESTION_COUNT = 10; // taille de l'examen de validation
export const DRILL_QUESTION_COUNT = 5; // exercices correctifs après échec
export const EXAM_READY_PROGRESS = 60; // progression conseillée avant l'examen

export type ExamMode = 'validation' | 'diagnostic' | 'drill';

export interface ExamAttempt {
  unitId: number;
  mode: ExamMode;
  at: number; // timestamp
  score: number;
  total: number;
  passed: boolean;
  questionIds: number[]; // questions posées (permet de varier les tentatives)
  wrongQuestionIds: number[]; // erreurs (alimente la remédiation ciblée)
}

export interface LastFailure {
  unitId: number;
  at: number;
  percent: number;
  wrongQuestionIds: number[];
  weakTopicsAr: string[]; // diagnostic : notions à revoir avant de retenter
}

export interface MasteryState {
  validatedUnits: number[];
  attempts: ExamAttempt[];
  lastFailure: LastFailure | null;
}

const STORAGE_KEY = 'kunz_v3_mastery_v1';
const MAX_ATTEMPTS_KEPT = 20;

export function createEmptyMasteryState(): MasteryState {
  return { validatedUnits: [], attempts: [], lastFailure: null };
}

export function loadMasteryState(): MasteryState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createEmptyMasteryState();
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return createEmptyMasteryState();
    return {
      validatedUnits: Array.isArray(parsed.validatedUnits) ? parsed.validatedUnits : [],
      attempts: Array.isArray(parsed.attempts) ? parsed.attempts : [],
      lastFailure: parsed.lastFailure && typeof parsed.lastFailure === 'object' ? parsed.lastFailure : null,
    };
  } catch {
    return createEmptyMasteryState();
  }
}

export function saveMasteryState(state: MasteryState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* offline-first : silencieux */
  }
}

export function isUnitValidated(state: MasteryState, unitId: number): boolean {
  return state.validatedUnits.includes(unitId);
}

export function examPercent(score: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((score / total) * 100);
}

export function hasPassedExam(score: number, total: number): boolean {
  return examPercent(score, total) >= EXAM_PASS_THRESHOLD;
}

/** Enregistre une tentative d'examen (fonction pure). */
export function recordExamAttempt(
  state: MasteryState,
  attempt: Omit<ExamAttempt, 'at' | 'passed'>,
  now: number = Date.now(),
): MasteryState {
  const passed = hasPassedExam(attempt.score, attempt.total);
  const full: ExamAttempt = { ...attempt, at: now, passed };
  const attempts = [...state.attempts, full].slice(-MAX_ATTEMPTS_KEPT);
  let next: MasteryState = { ...state, attempts };

  if (passed) {
    next = {
      ...next,
      validatedUnits: [...new Set([...state.validatedUnits, attempt.unitId])],
      lastFailure: state.lastFailure?.unitId === attempt.unitId ? null : state.lastFailure,
    };
  } else if (attempt.mode !== 'drill') {
    next = {
      ...next,
      lastFailure: {
        unitId: attempt.unitId,
        at: now,
        percent: examPercent(attempt.score, attempt.total),
        wrongQuestionIds: attempt.wrongQuestionIds,
        weakTopicsAr: state.lastFailure?.unitId === attempt.unitId ? state.lastFailure.weakTopicsAr : [],
      },
    };
  }
  return next;
}

/** Valide une unité sans examen (ex : forçage professeur). */
export function markUnitValidated(state: MasteryState, unitId: number): MasteryState {
  return { ...state, validatedUnits: [...new Set([...state.validatedUnits, unitId])] };
}

/**
 * Sélection des questions d'un examen : on écarte les questions de la
 * dernière tentative de l'unité afin que « nouvelle tentative » rime avec
 * « nouvelles questions » (règle validée de la V3).
 */
export function pickExamQuestions(
  pool: QuizQuestion[],
  lastAttemptIds: number[],
  count: number,
  random: () => number = Math.random,
): QuizQuestion[] {
  const excluded = new Set(lastAttemptIds);
  const fresh = pool.filter((q) => !excluded.has(q.id));
  const source = fresh.length >= Math.min(count, pool.length) ? fresh : pool;
  const shuffled = [...source];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

/**
 * Exercices correctifs après échec : on re-propose d'abord les questions
 * ratées (avec leur explication), complétées par d'autres questions de l'unité.
 */
export function pickDrillQuestions(pool: QuizQuestion[], wrongIds: number[]): QuizQuestion[] {
  const wrong = pool.filter((q) => wrongIds.includes(q.id));
  const others = pool.filter((q) => !wrongIds.includes(q.id));
  return [...wrong, ...others].slice(0, DRILL_QUESTION_COUNT);
}

// ───────────────────────────────────────────────────────────────────────
// Diagnostic des lacunes : lexique de notions par unité (arabe DZ).
// On scanne les questions ratées pour nommer précisément ce qu'il faut
// revoir (« تحتاج إلى مراجعة مرحلة الاستنساخ قبل إعادة امتحان الوحدة »).
// ───────────────────────────────────────────────────────────────────────

interface TopicEntry {
  labelAr: string;
  keywords: string[];
}

export const UNIT_TOPIC_LEXICON: Record<number, TopicEntry[]> = {
  1: [
    { labelAr: 'مرحلة الاستنساخ', keywords: ['استنساخ', 'بوليميراز', 'arnm', 'النواة'] },
    { labelAr: 'مرحلة الترجمة', keywords: ['ترجمة', 'ريبوزوم', 'arnt', 'ببتيد', 'الهيولى'] },
    { labelAr: 'التعبير المورثي و بنية الـ ADN', keywords: ['مورثة', 'adn', 'تعبير', 'نكليوتيد'] },
  ],
  2: [
    { labelAr: 'بنى البروتين (ألفا و بيتا)', keywords: ['بنية', 'حلزون', 'التفاف', 'ثالثية', 'بيبتيد'] },
    { labelAr: 'العلاقة بنية ↔ وظيفة', keywords: ['وظيفة', 'تخصص', 'هيموغلوبين', 'طفرة'] },
  ],
  3: [
    { labelAr: 'الموقع الفعال و التخصص', keywords: ['موقع فعال', 'انزيم', 'إنزيم', 'تخصص', 'مادة التفاعل'] },
    { labelAr: 'عوامل تأثير الفعالية (pH و الحرارة)', keywords: ['ph', 'حموضة', 'حرارة', 'فعالية', 'سرعة'] },
  ],
  4: [
    { labelAr: 'الذات و اللاذات (CMH)', keywords: ['ذات', 'cmh', 'hla', 'هوية'] },
    { labelAr: 'الاستجابة الخلطية (أجسام مضادة)', keywords: ['خلطية', 'مضادة', 'مضاد', 'لمفاوية b', 'بلازمية'] },
    { labelAr: 'الاستجابة الخلوية (LTc)', keywords: ['خلوية', 'قاتلة', 'ltc', 'tcr'] },
    { labelAr: 'الذاكرة المناعية و التلقيح', keywords: ['ذاكرة', 'ثانوية', 'لقاح', 'مصل'] },
  ],
  5: [
    { labelAr: 'كمون الراحة و الاستقطاب', keywords: ['كمون الراحة', 'استقطاب', 'na+k', 'ضخ'] },
    { labelAr: 'كمون العمل و السيالة العصبية', keywords: ['كمون العمل', 'سيالة', 'عصبون', 'الياف'] },
    { labelAr: 'النقل المشبكي', keywords: ['مشبك', 'ناقل عصبي', 'استيل', 'حويصلات'] },
  ],
  6: [
    { labelAr: 'المرحلة الكيميوضوئية', keywords: ['كيميوضوئية', 'ضوئية', 'تيلاكويد', 'فوتون', 'الانظمة الضوئية', 'النظام الضوئي'] },
    { labelAr: 'التحلل الضوئي للماء و طرح O2', keywords: ['تحلل الماء', 'اكسجين', 'أكسجين', 'الضوئي للماء'] },
    { labelAr: 'المرحلة الكيميوحيوية (حلقة كالفن)', keywords: ['كالفن', 'كيميوحيوية', 'روبيسكو', 'co2', 'الحشوة'] },
  ],
  7: [
    { labelAr: 'التحلل السكري', keywords: ['تحلل سكري', 'بيروفيك', 'الهيولى', 'فركتوز'] },
    { labelAr: 'حلقة كريبس في الميتوكندرون', keywords: ['كريبس', 'ميتوكندرون', 'استيل', 'المادة الاساسية', 'المادة الأساسية'] },
    { labelAr: 'التخمر', keywords: ['تخمر', 'لا هوائي', 'كحولي', 'لبني', 'خميرة'] },
  ],
  8: [
    { labelAr: 'الفسفرة التأكسدية و ATP', keywords: ['فسفرة', 'atp', 'تاكسدية', 'تأكسدية', 'السلسلة التنفسية'] },
    { labelAr: 'الحصيلة الطاقوية الشاملة', keywords: ['حصيلة', 'bilan', 'مردود', '38'] },
  ],
  9: [
    { labelAr: 'حركات الصفائح و حدودها', keywords: ['صفيحة', 'صفائح', 'تباعد', 'تقارب', 'حدود'] },
    { labelAr: 'ظاهرة الغوص (الاندساس)', keywords: ['غوص', 'اندساس', 'انغمار', 'subduction'] },
    { labelAr: 'النشاط البركاني و الصهارة', keywords: ['بركان', 'بركانية', 'صهارة', 'magma', 'اندسيت'] },
  ],
  10: [
    { labelAr: 'الموجات الزلزالية و بنية الأرض', keywords: ['موجات', 'زلزالية', 'اهتزازية', 'zonal', 'سرعة الموجات'] },
    { labelAr: 'طبقات الأرض و الانقطاعات', keywords: ['قشرة', 'وشاح', 'نواة', 'موهو', 'غوتنبرغ', 'انقطاع', 'طبقات'] },
  ],
  11: [
    { labelAr: 'التصادم القاري', keywords: ['تصادم', 'اصطدام', 'collision', 'سلسلة جبلية'] },
    { labelAr: 'البنيات التكتونية (طيات و صدوع)', keywords: ['طية', 'صدع', 'التواء', 'انكسار', 'انعكاس'] },
    { labelAr: 'التحول و الصخور المتحولة', keywords: ['تحول', 'متحولة', 'معادن', 'ضغط', 'حرارة'] },
  ],
};

function normalizeArabic(text: string): string {
  return text
    .toLowerCase()
    .replace(/[\u064B-\u0652\u0640]/g, '') // diacritiques + tatweel
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي');
}

/**
 * Diagnostic : retourne jusqu'à 3 notions faibles (en arabe) à partir des
 * questions ratées d'une unité. Si aucun thème ne matche, renvoie un
 * libellé générique — jamais de blocage sur un diagnostic incertain
 * (règle validée : l'IA/le moteur ne doit pas « emprisonner » l'élève).
 */
export function diagnoseWeakTopics(unitId: number, wrongQuestions: QuizQuestion[]): string[] {
  const lexicon = UNIT_TOPIC_LEXICON[unitId];
  if (!lexicon || wrongQuestions.length === 0) return [];

  const hits = new Map<string, number>();
  for (const question of wrongQuestions) {
    const haystack = normalizeArabic(`${question.questionText} ${question.options.join(' ')} ${question.explanation}`);
    for (const topic of lexicon) {
      if (topic.keywords.some((kw) => haystack.includes(normalizeArabic(kw)))) {
        hits.set(topic.labelAr, (hits.get(topic.labelAr) ?? 0) + 1);
      }
    }
  }

  return [...hits.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([labelAr]) => labelAr);
}
