// src/tutorGoldSummaryFlow.ts
// KEO-RSUM (2026-10-04) — flow « الملخصات الذهبية » dans le المرشد الذكي.
//
// L'élève demande « الملخص » → liste des UNITÉS → leçons de l'unité choisie →
// résumé d'or complet (mission, خطوات الفهم, دليل, مفاهيم, خطأ شائع, سؤال
// المراجعة). Aucun contenu n'est inventé ici : tout provient de
// LESSON_GOLD_SUMMARIES et de LESSON_INDEX. L'état de navigation est porté par
// session.pendingSummaryUnit (null = liste des unités, number = dans l'unité N,
// absent = on n'est pas dans le flow).
//
// Le module est PUR : il retourne null quand la saisie ne le concerne pas, et
// le moteur (processStudentInput) poursuit alors sa cascade habituelle.

import { LESSON_INDEX } from './data/lessonIndex';
import {
  LESSON_GOLD_SUMMARIES,
  type LessonGoldSummary,
} from './data/lessonGoldSummaries';
import { INITIAL_UNITS } from './unitCatalog';
import {
  normalizeArabic,
  tokenizeArabic,
  tokenOverlapRatio,
} from './utils/arabicNormalize';

export interface GoldSummaryLesson {
  key: string;
  unitId: number;
  title: string;
}

const n = (s: string) => normalizeArabic(s);

/**
 * Registre ordonné des leçons ayant un résumé d'or. Construit depuis
 * LESSON_INDEX : premier chunk de chaque lessonKey → titre complet de la
 * leçon (lessonTitle). L'ordre est celui du livre (U1 → U11), stable.
 */
const LESSONS_WITH_SUMMARY: GoldSummaryLesson[] = (() => {
  const seen = new Set<string>();
  const out: GoldSummaryLesson[] = [];
  for (const c of LESSON_INDEX) {
    if (seen.has(c.lessonKey)) continue;
    if (!LESSON_GOLD_SUMMARIES[c.lessonKey]) continue;
    seen.add(c.lessonKey);
    const title = (c.lessonTitle ?? c.title).trim();
    out.push({ key: c.lessonKey, unitId: c.unitId, title });
  }
  return out;
})();

export function lessonsForUnit(unitId: number): GoldSummaryLesson[] {
  return LESSONS_WITH_SUMMARY.filter((l) => l.unitId === unitId);
}

export function unitIdsWithSummaries(): number[] {
  return [...new Set(LESSONS_WITH_SUMMARY.map((l) => l.unitId))].sort((a, b) => a - b);
}

export function totalSummaries(): number {
  return LESSONS_WITH_SUMMARY.length;
}

function unitTitleOf(unitId: number): string {
  const u = INITIAL_UNITS.find((x) => x.id === unitId);
  return u ? u.title : `الوحدة ${unitId}`;
}

/* --------------------------------- déclencheurs ------------------------------- */

/** Saisies génériques qui ouvrent la LISTE des unités. Correspondance EXACTE
 *  (après normalisation) : on ne veut pas détourner « لخص دور اللمفاويات… »
 *  qui est une question de cours, ni « ملخص الدرس كذا » (accès direct). */
const LIST_EXACT_RAW = [
  'ملخص', 'الملخص', 'ملخصات', 'الملخصات', 'الملخص الذهبي', 'ملخص ذهبي',
  'الملخصات الذهبية', 'ملخصات ذهبية', 'تلخيص', 'لخص', 'لخص لي',
  'ملخصات الدروس', 'جميع الملخصات', 'كل الملخصات', 'قائمة الملخصات',
  'قائمة الملخصات الذهبية', 'أريد الملخص', 'أريد الملخصات',
  'أريد ملخصات الدروس', 'اعرض الملخصات', 'اعرض لي الملخصات',
  'اعرض جميع الملخصات', 'استعرض الملخصات', 'أعطني الملخصات',
  'هات الملخصات', 'خلاصات', 'الخلاصات', 'خلاصات الدروس',
  // Déclencheurs français (l'élève peut taper en français).
  'résumé', 'resume', 'les résumés', 'les resumes', 'tous les résumés',
  'tous les resumes', 'le résumé', 'la liste des résumés', 'la liste des resumes',
  'montre les résumés', 'montre les resumes', 'affiche les résumés',
  'affiche les resumes', 'donne les résumés', 'donne les resumes',
  'je veux les résumés', 'je veux les resumes', 'résumés des leçons',
  'resumes des lecons', 'tous les résumés des leçons',
];

/** Locutions multi-mots non ambiguës recherchées EN CONTENU. */
const LIST_CONTAINS_RAW = [
  'جميع الملخصات', 'كل الملخصات', 'قائمة الملخصات', 'ملخصات الدروس',
  'جميع ملخصات الدروس', 'كل ملخصات الدروس', 'الملخصات الذهبية',
  'اعرض لي الملخصات', 'اعرض جميع الملخصات', 'استعراض الملخصات',
  'جميع الخلاصات', 'خلاصات الدروس', 'قائمة الخلاصات',
  'tous les résumés', 'tous les resumes', 'la liste des résumés',
  'la liste des resumes', 'résumés de tous les cours',
];

// normalizeArabic supprime les accents latins (é → espace) : on les neutralise
// AVANT de normaliser pour que « résumé » devienne « resume ».
const stripLatinAccents = (s: string) =>
  s
    .replace(/[àâä]/g, 'a')
    .replace(/[éèêë]/g, 'e')
    .replace(/[îï]/g, 'i')
    .replace(/[ôö]/g, 'o')
    .replace(/[ûü]/g, 'u')
    .replace(/[ç]/g, 'c');

const normFr = (s: string) => n(stripLatinAccents(s));

const LIST_EXACT = new Set([...LIST_EXACT_RAW].map((s) => normFr(s)));
const LIST_CONTAINS = [...LIST_CONTAINS_RAW].map((s) => normFr(s));

export function isSummaryListIntent(norm: string): boolean {
  if (!norm) return false;
  if (LIST_EXACT.has(norm)) return true;
  return LIST_CONTAINS.some((p) => p.length >= 6 && norm.includes(p));
}

/** « ملخصات الوحدة 4 » / « الوحدة 4 » → 4 (uniquement en navigation). */
const UNIT_RE = new RegExp('^(?:ملخصات\\s+)?الوحده\\s+(\\d+)');

export function parseUnitSummaryRequest(norm: string): number | null {
  const m = norm.match(UNIT_RE);
  if (!m) return null;
  const id = Number(m[1]);
  return Number.isInteger(id) && id >= 1 && id <= 11 ? id : null;
}

const BACK_TO_UNITS_RAW = [
  'قائمة الوحدات', 'الوحدات', 'كل الوحدات', 'رجوع للوحدات',
  'العودة للوحدات', 'العودة لقائمة الوحدات', 'رجوع لقائمة الملخصات',
];
const BACK_TO_UNITS = new Set(BACK_TO_UNITS_RAW.map((s) => n(s)));

export function isBackToUnitsIntent(norm: string): boolean {
  return BACK_TO_UNITS.has(norm);
}

/* ----------------------------- recherche de leçon ---------------------------- */

function matchIn(
  norm: string,
  pool: GoldSummaryLesson[],
): GoldSummaryLesson | null {
  if (!norm) return null;
  // 1) titre exact normalisé.
  let hit = pool.find((l) => n(l.title) === norm);
  if (hit) return hit;
  // 2) inclusion (l'un dans l'autre), saisie suffisamment longue pour être
  //    significative : « ملخص استنساخ المعلومات الوراثية… ».
  if (norm.length >= 12) {
    hit = pool.find((l) => n(l.title).includes(norm));
    if (hit) return hit;
    hit = pool.find((l) => {
      const t = n(l.title);
      return t.length >= 12 && norm.includes(t);
    });
    if (hit) return hit;
  }
  // 3) reformulation / fautes de frappe : ≥ 85 % des mots du titre retrouvés.
  const tokens = tokenizeArabic(norm);
  if (tokens.length >= 2) {
    let best: GoldSummaryLesson | null = null;
    let bestRatio = 0;
    for (const l of pool) {
      const ratio = tokenOverlapRatio(tokens, n(l.title));
      if (ratio > bestRatio) {
        bestRatio = ratio;
        best = l;
      }
    }
    if (best && bestRatio >= 0.85) return best;
  }
  return null;
}

/** Clic sur un titre de leçon pendant la navigation (unité courante d'abord,
 *  puis toutes les unités si la saisie est un titre exact). */
export function matchLessonWhileBrowsing(
  norm: string,
  pendingUnit: number | null,
): GoldSummaryLesson | null {
  if (pendingUnit != null) {
    const hit = matchIn(norm, lessonsForUnit(pendingUnit));
    if (hit) return hit;
  }
  return matchIn(norm, LESSONS_WITH_SUMMARY);
}

/** Accès direct hors navigation : « ملخص <titre> » / « لخص <titre> ». */
export function matchDirectSummaryRequest(norm: string): GoldSummaryLesson | null {
  let rest: string | null = null;
  for (const prefix of ['ملخص', 'لخص']) {
    const p = normFr(prefix);
    if (norm.startsWith(p) && norm.length > p.length) {
      rest = norm.slice(p.length).trim();
      break;
    }
  }
  if (!rest || rest.length < 5) return null;
  // « ملخصات » / « ملخصات الدروس » doivent tomber sur la LISTE, pas sur une
  // pseudo-leçon : un reste trop court ou non significatif est refusé.
  return matchIn(rest, LESSONS_WITH_SUMMARY);
}

/* --------------------------------- formatage --------------------------------- */

function arCount(
  count: number,
  forms: { one: string; two: string; few: string; many: string },
): string {
  if (count === 1) return `${count} ${forms.one}`;
  if (count === 2) return `${count} ${forms.two}`;
  if (count <= 10) return `${count} ${forms.few}`;
  return `${count} ${forms.many}`;
}

const COUNT_LESSON = { one: 'درس', two: 'درسان', few: 'دروس', many: 'درساً' };
const COUNT_SUMMARY = { one: 'ملخص', two: 'ملخصان', few: 'ملخصات', many: 'ملخصاً' };
const COUNT_UNIT = { one: 'وحدة', two: 'وحدتان', few: 'وحدات', many: 'وحدة' };

export const unitListQuickActions = (ids: number[]) =>
  ids.map((id) => `ملخصات الوحدة ${id}`);

export interface SummaryFlowResult {
  text: string;
  quickActions: string[];
  /** Prochaine valeur de session.pendingSummaryUnit. */
  nextPendingUnit: number | null;
  /** Lesson key quand un résumé est affiché (pour le bloc sources). */
  lessonKey?: string;
  lessonTitle?: string;
}

export function formatUnitList(): SummaryFlowResult {
  const ids = unitIdsWithSummaries();
  const lines = ids.map((id, i) => {
    const count = lessonsForUnit(id).length;
    return `${i + 1}. **الوحدة ${id} — ${unitTitleOf(id)}** (${arCount(count, COUNT_SUMMARY)})`;
  });
  return {
    text:
      '🗂️ **الملخصات الذهبية — جميع دروس المنهاج**\n\n' +
      `يتوفّر ${arCount(totalSummaries(), COUNT_SUMMARY)} يغطّي ${arCount(
        ids.length,
        COUNT_UNIT,
      )} من المنهاج. كل ملخص يحتوي على: 🎯 المهمة • 🔗 خطوات الفهم • 🔍 الدليل • 🔑 المفاهيم • ⚠️ خطأ شائع • 🧠 سؤال المراجعة.\n\n` +
      '**اختر وحدة لاستعراض ملخصاتها:**\n' +
      lines.join('\n'),
    quickActions: unitListQuickActions(ids),
    nextPendingUnit: null,
  };
}

export function formatUnitLessons(unitId: number): SummaryFlowResult {
  const lessons = lessonsForUnit(unitId);
  const lines = lessons.map((l, i) => `${i + 1}. ${l.title}`);
  return {
    text:
      `📁 **ملخصات الوحدة ${unitId} — ${unitTitleOf(unitId)}** (${arCount(
        lessons.length,
        COUNT_LESSON,
      )})\n\n` +
      '**اختر درساً لعرض ملخصه الذهبي:**\n' +
      lines.join('\n'),
    quickActions: lessons.map((l) => l.title),
    nextPendingUnit: unitId,
  };
}

function statusLabelAr(s: LessonGoldSummary): string {
  switch (s.status) {
    case 'manuel_officiel_verifie':
      return 'مصدر من الكتاب المدرسي الرسمي — مُتحقَّق منه';
    case 'adaptation_pedagogique':
      return 'تكييف تربوي لبرنامج البكالوريا — شرح Kunz';
    case 'a_valider_enseignant':
      return 'ملخص تربوي — لم تُراجَع من قبل أستاذ بعد';
    default:
      return 'ملخص تربوي';
  }
}

export function formatGoldSummary(lesson: GoldSummaryLesson): SummaryFlowResult {
  const s = LESSON_GOLD_SUMMARIES[lesson.key];
  if (!s) {
    return {
      text: `عذراً، لا يتوفّر ملخص ذهبي للدرس «${lesson.title}» بعد.`,
      quickActions: ['قائمة الوحدات', 'القائمة الرئيسية'],
      nextPendingUnit: null,
    };
  }
  const steps = s.mechanismAr.map((m, i) => `${i + 1}. ${m}`).join('\n');
  const backAction = `ملخصات الوحدة ${lesson.unitId}`;
  return {
    text:
      `📜 **الملخص الذهبي**\n**${lesson.title}**\n\n` +
      `🎯 **المهمة:**\n${s.missionAr}\n\n` +
      `🔗 **خطوات الفهم:**\n${steps}\n\n` +
      `🔍 **الدليل الذي يجب التعرّف عليه:**\n${s.evidenceAr}\n\n` +
      `🔑 **المفاهيم الأساسية:** ${s.vocabulary.join(' • ')}\n\n` +
      `⚠️ **خطأ شائع يجب تجنّبه:**\n${s.commonErrorAr}\n\n` +
      `🧠 **سؤال المراجعة:** ${s.recallQuestionAr}\n\n` +
      (s.bacSentenceFrameAr
        ? `📝 **قالب جاهز للإجابة:** ${s.bacSentenceFrameAr}\n\n`
        : '') +
      `🏷️ ${statusLabelAr(s)}`,
    quickActions: [backAction, 'قائمة الوحدات', 'القائمة الرئيسية'],
    nextPendingUnit: lesson.unitId,
    lessonKey: lesson.key,
    lessonTitle: lesson.title,
  };
}

/* --------------------------------- orchestrateur ------------------------------ */

/**
 * Point d'entrée unique du moteur. Retourne null si la saisie ne concerne pas
 * les résumés (le moteur poursuit sa cascade), sinon le résultat à afficher.
 *
 * Ordre :
 *  1. accès direct « ملخص <titre> » / « لخص <titre> » (priorité sur la liste) ;
 *  2. intention LISTE (« الملخص », « tous les résumés »…) ;
 *  3. en navigation : « ملخصات الوحدة N » / « الوحدة N » / retour aux unités /
 *     clic sur un titre de leçon.
 *
 * @param norm saisie normalisée
 * @param pendingUnit valeur courante de session.pendingSummaryUnit
 */
export function handleSummaryFlow(
  norm: string,
  pendingUnit: number | null | undefined,
): SummaryFlowResult | null {
  // KEO-RSUM : normalisation locale (idempotente) — l'API publique accepte
  // aussi bien la saisie brute de l'élève que la chaîne déjà normalisée par le
  // moteur. normFr neutralise en plus les accents latins (« résumé » →
  // « resume ») avant la normalisation arabe qui les supprimerait.
  const input = normFr(norm || '');
  if (!input) return null;

  // 1) Accès direct hors navigation.
  const direct = matchDirectSummaryRequest(input);
  if (direct) return formatGoldSummary(direct);

  // 2) Intention liste.
  if (isSummaryListIntent(input)) return formatUnitList();

  // 3) Navigation en cours.
  if (pendingUnit === undefined) return null;

  const requestedUnit = parseUnitSummaryRequest(input);
  if (requestedUnit != null) {
    const lessons = lessonsForUnit(requestedUnit);
    if (lessons.length > 0) return formatUnitLessons(requestedUnit);
    return formatUnitList();
  }

  if (isBackToUnitsIntent(input)) return formatUnitList();

  const lesson = matchLessonWhileBrowsing(input, pendingUnit);
  if (lesson) return formatGoldSummary(lesson);

  return null;
}
