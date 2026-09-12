// src/data/tahlilWallBank.ts — Pool du mur حلّل (couche 1 du Trainer المفتاح).
//
// CONTRAT (audit 1 R2 + audit 2 B — désindexer la tâche) :
//   - 28 items série A × 6 familles. Les familles F3-F6 (sans indice lexical)
//     sont les seules qui PROUVENT la compréhension : ≥ 35% cue:none, ≥ 25% misleading —
//     verrouillé par le linter.
//   - Chaque item porte family + cue + feedback ≤ 12 mots (audit 1 §5.1).
//   - Véracité biologique : chaque item dérive de MEFTA_BAC_EXERCISES (éléments
//     officiels BAC 2025) ou des 23 leçons — champ reviewedBy à compléter au pilote.
//
// Gate v2 (v3Progress.wallGate) : 12 items tirés du pool, seuil 10/12,
// 0 faute sur F4/F5, 1re tentative, retirage ≥ 1h. Pas de blocage sec :
// 3 échecs → remédiation (retour sur les items ratés + jumeaux).

import type { CueKind, WallItemFamilyId } from './meftahLaw';

export interface WallItem {
  id: string;
  family: WallItemFamilyId;
  cue: CueKind;
  /** La phrase soumise au classement تحليل / تفسير. */
  sentence: string;
  /** tahlil = description mesurée ; tafsir = cause/mécanisme. */
  label: 'tahlil' | 'tafsir';
  /** Patron d'analyse si tahlil (feedback) — null si tafsir. */
  pattern?: 'covariation' | 'comparaison' | null;
  /** Feedback si erreur : ≤ 12 mots, dit POURQUOI, jamais « interdit ». */
  feedbackWrongAr: string;
}

export const WALL_SERIES_A: WallItem[] = [
  // ── F1 : تحليل بقيم (chiffrée, cue explicit — les faciles, ≤ 4) ──
  {
    id: 'A-F1-1', family: 'F1', cue: 'explicit', label: 'tahlil', pattern: 'covariation',
    sentence: 'كلما زاد تركيز Ado من 1 إلى 20 pmol/L، نقص النشاط العصبي الدماغي من 80% إلى 10%.',
    feedbackWrongAr: 'قيم + علاقة كلما بلا سبب — هذا تحليل.',
  },
  {
    id: 'A-F1-2', family: 'F1', cue: 'explicit', label: 'tahlil', pattern: 'covariation',
    sentence: 'عند 0% ارتباط يكون تركيز NE حوالي 8 nmol/L، وعند 75% ينخفض إلى حوالي 2 nmol/L.',
    feedbackWrongAr: 'تغير مقيس بقيمه — تحليل.',
  },
  {
    id: 'A-F1-3', family: 'F1', cue: 'explicit', label: 'tahlil', pattern: 'comparaison',
    sentence: 'نسبة نمو الطبيعية تبلغ 90% بينما الطافرة لا تتعدى 20% عند التركيز المنخفض.',
    feedbackWrongAr: 'مقارنة بقيم الحالتين — تحليل.',
  },
  {
    id: 'A-F1-4', family: 'F1', cue: 'explicit', label: 'tahlil', pattern: 'covariation',
    sentence: 'من t0 إلى t1 يبقى HCO₃⁻ المشع ثابتا عند 100%، ثم يتناقص حتى الانعدام بعد إضافة CA.',
    feedbackWrongAr: 'تغير زمني مقيس — تحليل.',
  },

  // ── F2 : تفسير برابط (cue explicit — les faciles, ≤ 4) ──
  {
    id: 'A-F2-1', family: 'F2', cue: 'explicit', label: 'tafsir',
    sentence: 'تتناقص نسبة ARNm لأن مادة RIP تكسر الرابطة بين الأدنين وسكر الريبوز.',
    feedbackWrongAr: 'لأن تفتح السبب — هذا تفسير.',
  },
  {
    id: 'A-F2-2', family: 'F2', cue: 'explicit', label: 'tafsir',
    sentence: 'وهذا راجع إلى أن الغشاء البروتيني للبيرنويدة غير نفوذ لـ CO₂.',
    feedbackWrongAr: 'راجع إلى = سبب — تفسير.',
  },
  {
    id: 'A-F2-3', family: 'F2', cue: 'explicit', label: 'tafsir',
    sentence: 'ينخفض النشاط العصبي، مما يدل على أن Ado يثبط إفراز NE.',
    feedbackWrongAr: 'مما يدل يستخرج السبب — تفسير.',
  },
  {
    id: 'A-F2-4', family: 'F2', cue: 'explicit', label: 'tafsir',
    sentence: 'يتوقف تكاثر الخلايا السرطانية بسبب توقف تركيب البروتين.',
    feedbackWrongAr: 'بسبب تعلن المسبب — تفسير.',
  },

  // ── F3 : تحليل نوعي بلا أرقام (cue none — PROUVE la compréhension) ──
  {
    id: 'A-F3-1', family: 'F3', cue: 'none', label: 'tahlil', pattern: 'comparaison',
    sentence: 'في المجموعة المعالجة تظهر مستعمرات البكتيريا، بينما تنعدم في الشاهد.',
    feedbackWrongAr: 'وصف مقارن للحالتين بلا سبب — تحليل.',
  },
  {
    id: 'A-F3-2', family: 'F3', cue: 'none', label: 'tahlil', pattern: null,
    sentence: 'يظهر الوسم أولا في النواة ثم ينتقل لاحقا إلى الهيولى.',
    feedbackWrongAr: 'تتبع مكاني-زمني، وصف بلا سبب — تحليل.',
  },
  {
    id: 'A-F3-3', family: 'F3', cue: 'none', label: 'tahlil', pattern: 'comparaison',
    sentence: 'تتشابه البنيتان بوجود الغلاف والحشوة، بينما تنفرد الطبيعية بالبيرنويدة.',
    feedbackWrongAr: 'تشابه ثم اختلاف بالبنية — تحليل مقارن.',
  },
  {
    id: 'A-F3-4', family: 'F3', cue: 'none', label: 'tahlil', pattern: null,
    sentence: 'في غياب Mtb يبقى الارتباط عاليا، وفي وجوده يكاد ينعدم.',
    feedbackWrongAr: 'وصف الحالتين بلا آلية — تحليل.',
  },
  {
    id: 'A-F3-5', family: 'F3', cue: 'none', label: 'tahlil', pattern: 'comparaison',
    sentence: 'تنعدم البنية الثالثة للبروتين عند 60°م، بينما تبقى محفوظة عند 37°م.',
    feedbackWrongAr: 'وصف مقارن للحالتين — تحليل.',
  },

  // ── F4 : تفسير عارٍ — mécanisme SANS connecteur (cue none — le plus dur) ──
  {
    id: 'A-F4-1', family: 'F4', cue: 'none', label: 'tafsir',
    sentence: 'يحتل Mtb موقع تثبيت Ado على المستقبل A1R فيمنع ارتباطه.',
    feedbackWrongAr: 'هذه آلية تعليلية (يشغل الموقع فيمنع) — تفسير.',
  },
  {
    id: 'A-F4-2', family: 'F4', cue: 'none', label: 'tafsir',
    sentence: 'تنشط قنوات K⁺ وتتوقف قنوات Ca²⁺ فلا تفرز حويصلات NE.',
    feedbackWrongAr: 'سلسلة سببية (فلا تفرز) — تفسير.',
  },
  {
    id: 'A-F4-3', family: 'F4', cue: 'none', label: 'tafsir',
    sentence: 'يفقد ARN بنيته ووظيفته فيتوقف تركيب البروتين.',
    feedbackWrongAr: 'آلية الجزئية تفسر النتيجة — تفسير.',
  },
  {
    id: 'A-F4-4', family: 'F4', cue: 'none', label: 'tafsir',
    sentence: 'يعيد الغشاء تجميع CO₂ داخل البيرنويدة رغم انخفاضه في الوسط.',
    feedbackWrongAr: 'دور الغشاء = آلية تفسيرية — تفسير.',
  },

  // ── F5 : خليط — chiffres + mot de tafsir (cue misleading — piège) ──
  {
    id: 'A-F5-1', family: 'F5', cue: 'misleading', label: 'tafsir',
    sentence: 'ينخفض النشاط العصبي من 90% إلى 50% لأن Mtb يحد من تأثير Ado.',
    feedbackWrongAr: 'القيم تحليل لكن لأن تفسّر — الجملة تفسير.',
  },
  {
    id: 'A-F5-2', family: 'F5', cue: 'misleading', label: 'tafsir',
    sentence: 'ارتفاع CO₂ إلى 60 داخل البيرنويدة مما يدل على حجز الغشاء له.',
    feedbackWrongAr: 'رقم + مما يدل = سبب — تفسير.',
  },
  {
    id: 'A-F5-3', family: 'F5', cue: 'misleading', label: 'tafsir',
    sentence: 'تناقص النشاط من 80% إلى 10% بسبب غلق قنوات Ca²⁺.',
    feedbackWrongAr: 'القيم لا تلغي بسبب — تفسير.',
  },
  {
    id: 'A-F5-4', family: 'F5', cue: 'misleading', label: 'tafsir',
    sentence: 'يبلغ الارتباط 100 وحدة وهو ما يفسر انعدام إفراز NE في غياب Mtb.',
    feedbackWrongAr: 'قيمة + يفسر = cause annoncée — تفسير.',
  },
  {
    id: 'A-F5-5', family: 'F5', cue: 'misleading', label: 'tafsir',
    sentence: 'تزداد سرعة التفاعل من 0 إلى Vmax وهذا يعني أن كل المواقع الفعالة مشغولة.',
    feedbackWrongAr: 'قيم ثم وهذا يعني = استخراج سبب — تفسير.',
  },
  {
    id: 'A-F5-6', family: 'F5', cue: 'misleading', label: 'tafsir',
    sentence: 'تنعدم المستعمرات عند 60°م، مما يدل على تخرب البنية الفراغية للإنزيم.',
    feedbackWrongAr: 'رقم + مما يدل = سبب — تفسير.',
  },
  {
    id: 'A-F5-7', family: 'F5', cue: 'misleading', label: 'tafsir',
    sentence: 'تظهر الأجسام المضادة في اليوم 10 فقط، وهذا راجع إلى الانتخاب النسيلي.',
    feedbackWrongAr: 'قيمة + راجع إلى = cause — تفسير.',
  },

  // ── F6 : صديق كاذب — يبيّن/نلاحظ = descriptif (cue none — faux ami) ──
  {
    id: 'A-F6-1', family: 'F6', cue: 'none', label: 'tahlil', pattern: null,
    sentence: 'تبين الوثيقة أن شدة الارتباط تنعدم تقريبا عند 20 pmol/L.',
    feedbackWrongAr: 'تبين تُظهر المعطى — بلا سبب = تحليل.',
  },
  {
    id: 'A-F6-2', family: 'F6', cue: 'none', label: 'tahlil', pattern: 'comparaison',
    sentence: 'نلاحظ استقرار نسبة النمو عند 90% في الحالتين عند التركيز المرتفع.',
    feedbackWrongAr: 'نلاحظ تقدم الملاحظة — تحليل.',
  },
  {
    id: 'A-F6-3', family: 'F6', cue: 'none', label: 'tahlil', pattern: null,
    sentence: 'يظهر الشكل خروج CO₂ من التيلاكويد داخل البيرنويدة.',
    feedbackWrongAr: 'وصف ما يظهره الشكل — تحليل.',
  },
  {
    id: 'A-F6-4', family: 'F6', cue: 'none', label: 'tahlil', pattern: 'comparaison',
    sentence: 'نلاحظ غياب البيرنويدة عند الطافرة، في حين تتوفر عند الطبيعية.',
    feedbackWrongAr: 'ملاحظة مقارنة بلا آلية — تحليل.',
  },
];

/** Linter contenu (CI) : distributions anti-heuristique + feedback courts + labels valides. */
export function lintWallBank(bank: WallItem[]): string[] {
  const errors: string[] = [];
  const byCue = { explicit: 0, none: 0, misleading: 0 };
  for (const it of bank) {
    if (it.label !== 'tahlil' && it.label !== 'tafsir') errors.push(`${it.id}: label invalide`);
    if (it.feedbackWrongAr.length > 60) errors.push(`${it.id}: feedback > 12 mots (${it.feedbackWrongAr.length} car.)`);
    byCue[it.cue] += 1;
  }
  const n = bank.length;
  if (n > 0) {
    if (byCue.none / n < 0.35) errors.push(`cue:none < 35% (${byCue.none}/${n}) — la tâche reste indicée`);
    if (byCue.misleading / n < 0.25) errors.push(`cue:misleading < 25% (${byCue.misleading}/${n})`);
    if (byCue.explicit / n > 0.4) errors.push(`cue:explicit > 40% (${byCue.explicit}/${n})`);
  }
  const families = new Set(bank.map((i) => i.family));
  if (families.size !== 6) errors.push(`familles: ${families.size}/6`);
  return errors;
}
