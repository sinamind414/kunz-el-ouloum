import fs from 'node:fs';
import path from 'node:path';
import { SVT_QUIZ_QUESTIONS, INITIAL_UNITS } from '../src/data';

const root = process.cwd();
const outPath = path.join(root, 'src', 'data', 'fillBlanks.ts');

const questions: any[] = SVT_QUIZ_QUESTIONS;

// Global lesson numbering (matches the original 40 entries' lessonId = درس N).
// startOfUnit[unitId] = first global lesson id of that unit.
const startOfUnit: Record<number, number> = {};
let cursor = 1;
for (const u of [...INITIAL_UNITS].sort((a, b) => a.id - b.id)) {
  startOfUnit[u.id] = cursor;
  cursor += u.lessonsCount;
}

const TERMINATOR = 'يرتبط هنا بـ: ';

function buildMicroTest(q: any) {
  const correct = q.options[q.correctAnswerIndex];
  if (!correct) return null;
  const explanation = q.explanation || '';
  let blanked: string;
  const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  if (explanation.includes(correct)) {
    blanked = explanation.replace(new RegExp(escape(correct) + '\\s*[.،؛;]?', 'u'), '_______');
  } else if (explanation.includes(TERMINATOR)) {
    const [prefix] = explanation.split(TERMINATOR);
    blanked = prefix + TERMINATOR + '_______';
  } else {
    blanked = explanation + ' _______';
  }
  const answer = correct.trim().replace(/\.$/, '');
  return {
    id: `fb_${q.unitId}_${q.id}`,
    unitId: q.unitId,
    lessonId: lessonOf[q.id] ?? startOfUnit[q.unitId] ?? 1,
    type: 'TEXT_AND_PRODUCE',
    prompt: `أكمل: ${blanked}`,
    answer,
    errorHint: `التعريف الصحيح: ${answer}`
  };
}

const byUnit = new Map<number, any[]>();
for (const q of questions) {
  if (!byUnit.has(q.unitId)) byUnit.set(q.unitId, []);
  byUnit.get(q.unitId)!.push(q);
}
const unitIds = [...byUnit.keys()].sort((a, b) => a - b);
const targetTotal = 120;
const perUnit = Math.ceil(targetTotal / unitIds.length);
const remainingByUnit = new Map<number, any[]>();
let selected: any[] = [];
for (const u of unitIds) {
  const qs = byUnit.get(u)!;
  const take = Math.min(perUnit, qs.length);
  selected.push(...qs.slice(0, take));
  remainingByUnit.set(u, qs.slice(take));
}
let idx = 0;
while (selected.length < targetTotal && remainingByUnit.size > 0) {
  const u = unitIds[idx % unitIds.length];
  idx++;
  const rem = remainingByUnit.get(u);
  if (rem && rem.length > 0) selected.push(rem.shift()!);
  else remainingByUnit.delete(u);
}

// Build a lessonId map for the selected QCMs:
// - exact value from "محور U.L" when present,
// - otherwise distributed across the unit's lessons by position.
const lessonOf: Record<number, number> = {};
for (const u of unitIds) {
  const qs = selected.filter((q: any) => q.unitId === u);
  const unit = INITIAL_UNITS.find((x: any) => x.id === u)!;
  const start = startOfUnit[u];
  const count = unit.lessonsCount;
  qs.forEach((q: any, i: number) => {
    let lid = start + Math.min(count - 1, Math.floor((i * count) / Math.max(1, qs.length)));
    const m = (q.questionText || '').match(/محور\s*(\d+)\.(\d+)/);
    if (m) {
      const within = parseInt(m[2], 10);
      lid = start + within - 1;
    }
    lessonOf[q.id] = lid;
  });
}

const microTests: any[] = [];
let missingAxis = 0;
for (const q of selected) {
  const mt = buildMicroTest(q);
  if (mt) {
    if (!(q.questionText || '').match(/محور\s*\d+\.\d+/)) missingAxis++;
    microTests.push(mt);
  }
}

// Original 40 fillBlank entries (Flutter source) preserved as-is.
const ORIGINAL_40: any[] = [
  { id: 'fb_10_596', unitId: 10, lessonId: 40, answer: 'تصل أولاً' },
  { id: 'fb_10_599', unitId: 10, lessonId: 40, answer: 'تعطي معلومات عن بنية الأرض الداخلية' },
  { id: 'fb_10_602', unitId: 10, lessonId: 40, answer: 'يقع تقريباً بين 30 و70 كم تحت القارات' },
  { id: 'fb_10_605', unitId: 10, lessonId: 40, answer: 'لا تنتشر فيها الموجات S' },
  { id: 'fb_11_608', unitId: 11, lessonId: 42, answer: 'دليل على بركانية تحت مائية' },
  { id: 'fb_11_611', unitId: 11, lessonId: 42, answer: 'يدل على انغراز الصفيحة' },
  { id: 'fb_11_614', unitId: 11, lessonId: 42, answer: 'يشكل سلاسل جبلية' },
  { id: 'fb_11_617', unitId: 11, lessonId: 42, answer: 'شاهد على محيط قديم' },
  { id: 'fb_11_620', unitId: 11, lessonId: 42, answer: 'تفسر تاريخ المحيطات والسلاسل' },
  { id: 'fb_1_503', unitId: 1, lessonId: 2, answer: 'رسالة تقرأها الريبوزومات' },
  { id: 'fb_1_506', unitId: 1, lessonId: 5, answer: 'يقرأ السلسلة القالبية 3 نحو 5' },
  { id: 'fb_2_509', unitId: 2, lessonId: 8, answer: 'اختلاف R يحدد نوع الحمض الأميني' },
  { id: 'fb_2_512', unitId: 2, lessonId: 7, answer: 'ينتج عن تفاعلات الجذور R' },
  { id: 'fb_2_515', unitId: 2, lessonId: 10, answer: 'يتكون من أربع تحت وحدات' },
  { id: 'fb_3_518', unitId: 3, lessonId: 12, answer: 'يفسر النوعية الإنزيمية' },
  { id: 'fb_3_521', unitId: 3, lessonId: 15, answer: 'أكثر مرونة من نموذج القفل والمفتاح' },
  { id: 'fb_3_524', unitId: 3, lessonId: 13, answer: 'قد ينتج عن حرارة مرتفعة' },
  { id: 'fb_3_527', unitId: 3, lessonId: 11, answer: 'يمكن تقليل أثره بزيادة تركيز الركيزة' },
  { id: 'fb_4_530', unitId: 4, lessonId: 18, answer: 'واسمات هوية بيولوجية' },
  { id: 'fb_4_533', unitId: 4, lessonId: 21, answer: 'تستهدف خاصة المستضدات خارج الخلايا' },
  { id: 'fb_4_536', unitId: 4, lessonId: 18, answer: 'تتدخل في المناعة الخلوية' },
  { id: 'fb_5_539', unitId: 5, lessonId: 22, answer: 'له تغصنات وجسم خلوي ومحور' },
  { id: 'fb_5_542', unitId: 5, lessonId: 25, answer: 'داخل الليف سالب بالنسبة للخارج' },
  { id: 'fb_5_545', unitId: 5, lessonId: 23, answer: 'يخضع لقانون الكل أو لا شيء' },
  { id: 'fb_5_548', unitId: 5, lessonId: 26, answer: 'يستعمل نواقل عصبية' },
  { id: 'fb_5_551', unitId: 5, lessonId: 24, answer: 'يساهم في الإدماج العصبي' },
  { id: 'fb_6_554', unitId: 6, lessonId: 29, answer: 'تحتوي تيلاكويدات وستروما' },
  { id: 'fb_6_557', unitId: 6, lessonId: 29, answer: 'تتم في التيلاكويدات' },
  { id: 'fb_6_560', unitId: 6, lessonId: 29, answer: 'تنتج مواد عضوية' },
  { id: 'fb_7_563', unitId: 7, lessonId: 30, answer: 'تنتج كثيراً من ATP في وجود O2' },
  { id: 'fb_7_566', unitId: 7, lessonId: 30, answer: 'لا يتطلب O2 مباشرة' },
  { id: 'fb_7_569', unitId: 7, lessonId: 30, answer: 'نقطة دخول كريبس' },
  { id: 'fb_7_572', unitId: 7, lessonId: 30, answer: 'يسمح باستمرار التحلل السكري' },
  { id: 'fb_8_575', unitId: 8, lessonId: 35, answer: 'دور مركزي لـATP' },
  { id: 'fb_8_578', unitId: 8, lessonId: 35, answer: 'العمليتان مرتبطتان في المحيط الحيوي' },
  { id: 'fb_8_581', unitId: 8, lessonId: 35, answer: 'التنفس الهوائي أكثر مردودية من التخمر' },
  { id: 'fb_9_584', unitId: 9, lessonId: 37, answer: 'مجزأ إلى صفائح' },
  { id: 'fb_9_587', unitId: 9, lessonId: 37, answer: 'ترتبط بتدفق حراري مرتفع' },
  { id: 'fb_9_590', unitId: 9, lessonId: 37, answer: 'تثبت توسع قاع المحيط' },
  { id: 'fb_9_593', unitId: 9, lessonId: 37, answer: 'تساهم في ديناميكية الصفائح' }
];

function entry(mt: any, isOriginal: boolean): string {
  const prompt = isOriginal ? 'أكمل: _______' : mt.prompt;
  const hint = isOriginal ? `التعريف الصحيح: ${mt.answer}` : mt.errorHint;
  let s = '  {\n';
  s += `    id: '${mt.id}',\n`;
  s += `    unitId: ${mt.unitId},\n`;
  s += `    lessonId: ${mt.lessonId},\n`;
  s += `    type: 'TEXT_AND_PRODUCE',\n`;
  s += '    microTest: {\n';
  s += `      prompt: ${JSON.stringify(prompt)},\n`;
  s += `      acceptedAnswers: [${JSON.stringify(mt.answer)}],\n`;
  s += `      errorHint: ${JSON.stringify(hint)}\n`;
  s += '    }\n';
  s += '  },\n';
  return s;
}

let out = '';
out += '// Auto-generated.\n';
out += '// 1) 121 micro-tests enrichis derives des 500 QCM (src/data.ts -> SVT_QUIZ_QUESTIONS) :\n';
out += "//    algorithme : pour chaque QCM, la reponse officielle (option correcte) devient le trou\n";
out += '//    dans l\'explication ("X يرتبط هنا بـ: _______"). lessonId derive de "محور U.L"\n';
out += '//    via la numerotation globale des lecons (درس N).\n';
out += '// 2) 40 micro-tests fillBlank d\'origine (source Flutter) conserves tels quels.\n';
out += '// Aucun contenu invente.\n\n';
out += 'export interface FillBlankMicroTest {\n';
out += '  prompt: string;\n';
out += '  acceptedAnswers: string[];\n';
out += '  errorHint: string;\n';
out += '}\n\n';
out += 'export interface FillBlankQuestion {\n';
out += '  id: string;\n';
out += '  unitId: number;\n';
out += '  lessonId: number;\n';
out += "  type: 'TEXT_AND_PRODUCE';\n";
out += '  microTest: FillBlankMicroTest;\n';
out += '}\n\n';
out += 'export const FILL_BLANK_QUESTIONS: FillBlankQuestion[] = [\n';

for (const mt of microTests) out += entry(mt, false);
out += '  // --- 40 micro-tests d\'origine (Flutter) conserves ---\n';
for (const o of ORIGINAL_40) out += entry(o, true);

out += '];\n\n';
out += `// Total: ${microTests.length} enrichis (QCM) + ${ORIGINAL_40.length} d'origine = ${microTests.length + ORIGINAL_40.length} micro-tests.\n`;
out += `// QCM sans reference "محور": ${missingAxis} (lessonId repli sur la 1re lecon de l'unite).\n`;

fs.writeFileSync(outPath, out, 'utf8');
console.log(`Generated ${microTests.length} enriched + ${ORIGINAL_40.length} original = ${microTests.length + ORIGINAL_40.length} total -> ${outPath}`);
const perUnitCount: Record<number, number> = {};
for (const m of microTests) perUnitCount[m.unitId] = (perUnitCount[m.unitId] || 0) + 1;
console.log('Enriched per unit:', perUnitCount, '| missing axis:', missingAxis);
