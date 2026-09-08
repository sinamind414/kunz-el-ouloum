// drillBank.ts — شحذ البوابات الثلاث (Update 2026-09-06, docs/MARQUE.md §12)
//
// Le drill « مصفاة التعليمات » tire 12 consignes sur une banque ≥ 50, à JOURNÉE FIXE
// (même tirage le même jour, nouveau tirage le lendemain) — anti-mémorisation (D3).
//
// TROIS PORTES par consigne, en cascade (progressive disclosure) :
//   🚪 بوابة ١ — الوجود : قفل (وثيقة) / لا قفل (🧠 دُرج المعرفة)
//   📥 بوابة ٢ — المصدر : وثيقة فقط / مختلط («ومعلوماتك / ومكتسباتك»)
//   ⚙️ بوابة ٣ — الحركة : 📷 صورة / 🎬 فيلم / 🔨 حدّاد (NOUVEAU)
//
// Règles d'écriture (auto-vérifiées au chargement en DEV + par le test vitest) :
//   - existence est DÉRIVÉ par le moteur (detectExistenceGate) : les mots-clés
//     document (وثيقة/شكل/جدول/منحنى/رسم/صورة/سند/بيان/مخطط) ⇒ قفل ; sinon لا قفل.
//     Les consignes du دُرج NE CONTIENNENT AUCUN mot document.
//   - source est DÉRIVÉ (detectSourceKind) : قفل + «معلومات/مكتسبات» ⇒ مختلط ; sinon وثيقة.
//   - movement est DÉRIVÉ du verbe (movement de la carte v2) : la famille 🔨 حدّاد
//     (اقترح/برر/ناقض/قدّم حلا) est la 3e issue — l'angle mort corrigé (6× sur BAC 2025).
//
// Distribution cible (statistique réelle BAC 2025) : le 🔨 ≈ 25-30% des questions
// ouvertes. La banque actuelle : 12/58 قفل ≈ 21% — le premier trou à combler vers 150.

import {
  getVerbCardV2, detectExistenceGate, detectSourceKind,
  ExistenceGate, SourceKind, Movement,
} from './methodologyEngine';

export type D1 = ExistenceGate;            // 'lock' | 'no_lock'
export type D2 = SourceKind;               // 'document' | 'mixed'
export type D3 = Movement | 'drawer';      // 'photo' | 'film' | 'smith' | 'drawer'

export interface DrillConsigne {
  /** Identifiant stable dans la banque. */
  id: string;
  /** Ordre d'affichage (stable dans un tirage). */
  seq: number;
  /** La consigne (impératif SVT BAC). */
  consigne: string;
  /** Carte v2 du verbe d'action. */
  verbCardId: string;
  /** 🚪 Porte 1 — intention éditoriale (doit coïncider avec le dérivé du moteur). */
  existence: D1;
  /** 📥 Porte 2 — null ⇔ pas de قفل. */
  source: D2 | null;
  /** ⚙️ Porte 3 — 'drawer' ⇔ pas de قفل. */
  movement: D3;
}

interface RawConsigne {
  id: string; consigne: string; verbCardId: string;
  existence: D1; source: D2 | null;
}

/** 🚪 dérivé par le moteur. */
export function deriveExistence(consigne: string): D1 {
  return detectExistenceGate(consigne);
}

/** 📥 dérivé par le moteur (null si pas de قفل). */
export function deriveSource(consigne: string): D2 | null {
  return detectSourceKind(consigne);
}

/** ⚙️ dérivé de la carte : pas de قفل ⇒ دُرج ; عرّف (toujours sans قفل) ⇒ دُرج ;
 *  sinon le mouvement de la carte (list avec قفل = extraction = 📷). */
export function deriveMovement(consigne: string, verbCardId: string): D3 {
  if (detectExistenceGate(consigne) === 'no_lock') return 'drawer';
  const card = getVerbCardV2(verbCardId);
  if (!card) throw new Error(`[drillBank] carte inconnue : ${verbCardId}`);
  return card.movement === 'drawer' ? 'drawer' : card.movement;
}

const RAW: RawConsigne[] = [
  // ── 🚪 قفل + 📥 وثيقة + 📷 صورة ──────────────────────────────────
  { id:'p01', consigne:'حلل منحنى الوثيقة 1', verbCardId:'verb_analyse_v1', existence:'lock', source:'document' },
  { id:'p02', consigne:'حلل الوثيقة ١', verbCardId:'verb_analyse_v1', existence:'lock', source:'document' },
  { id:'p03', consigne:'قارن بين المنحنيين', verbCardId:'verb_compare_v1', existence:'lock', source:'document' },
  { id:'p04', consigne:'قارن الجدول 1 مع الجدول 2', verbCardId:'verb_compare_v1', existence:'lock', source:'document' },
  { id:'p05', consigne:'استخرج من الجدول', verbCardId:'verb_list_v1', existence:'lock', source:'document' },
  { id:'p06', consigne:'استخرج القيم من منحنى الوثيقة 2', verbCardId:'verb_list_v1', existence:'lock', source:'document' },
  { id:'p07', consigne:'حدد من الشكل 2 العضية المعنية', verbCardId:'verb_list_v1', existence:'lock', source:'document' },
  { id:'p08', consigne:'حدد من الوثيقة 3 العناصر الأساسية', verbCardId:'verb_list_v1', existence:'lock', source:'document' },
  { id:'p09', consigne:'صف مظهر المستضد في الصورة 1', verbCardId:'verb_list_v1', existence:'lock', source:'document' },
  { id:'p10', consigne:'صف الشكل 4 خطوة خطوة', verbCardId:'verb_list_v1', existence:'lock', source:'document' },
  { id:'p11', consigne:'اذكر من الوثيقة 2 المراحل المرقمة', verbCardId:'verb_list_v1', existence:'lock', source:'document' },
  { id:'p12', consigne:'لخص في رسم تخطيطي معطيات الوثيقة', verbCardId:'verb_schema_v1', existence:'lock', source:'document' },
  { id:'p13', consigne:'أنجز مخططا انطلاقا من الجدول 1', verbCardId:'verb_schema_v1', existence:'lock', source:'document' },
  { id:'p14', consigne:'عيّن من البيان 1 مرحلة الانقسام', verbCardId:'verb_list_v1', existence:'lock', source:'document' },
  { id:'p15', consigne:'صف شكل الخلية انطلاقا من الصورة 3', verbCardId:'verb_list_v1', existence:'lock', source:'document' },

  // ── 🚪 قفل + 📥 وثيقة + 🎬 فيلم ──────────────────────────────────
  { id:'pf01', consigne:'فسر منحنى الوثيقة 1', verbCardId:'verb_explain_v1', existence:'lock', source:'document' },
  { id:'pf02', consigne:'علل سبب الانخفاض في منحنى الوثيقة 2', verbCardId:'verb_explain_v1', existence:'lock', source:'document' },
  { id:'pf03', consigne:'وضّح العلاقة بين متغيرات الشكل 3', verbCardId:'verb_explain_v1', existence:'lock', source:'document' },
  { id:'pf04', consigne:'بيّن الآلية المفسرة لمنحنى الوثيقة 1', verbCardId:'verb_explain_multi_v1', existence:'lock', source:'document' },
  { id:'pf05', consigne:'استنتج العلاقة من منحنى الوثيقة', verbCardId:'verb_deduce_v1', existence:'lock', source:'document' },
  { id:'pf06', consigne:'استنتج من الوثيقتين 1 و2', verbCardId:'verb_deduce_v1', existence:'lock', source:'document' },
  { id:'pf07', consigne:'فسّر تذبذب منحني الوثيقة', verbCardId:'verb_explain_v1', existence:'lock', source:'document' },
  { id:'pf08', consigne:'وضّح دور الشكل 2 في الظاهرة', verbCardId:'verb_explain_v1', existence:'lock', source:'document' },
  { id:'pf09', consigne:'فسّر الشكل 3 بالاعتماد على معطياته', verbCardId:'verb_explain_v1', existence:'lock', source:'document' },
  { id:'pf10', consigne:'علّل استقرار منحنى الوثيقة بعد الدقيقة 20', verbCardId:'verb_explain_v1', existence:'lock', source:'document' },
  { id:'pf11', consigne:'وضّح ما تكشفه الوثيقة 2 حول الآلية', verbCardId:'verb_explain_multi_v1', existence:'lock', source:'document' },
  { id:'pf12', consigne:'فسر الوثيقة 1', verbCardId:'verb_explain_v1', existence:'lock', source:'document' },

  // ── 🚪 قفل + 📥 مختلط (وثيقة + معلوماتي) ─────────────────────────
  { id:'d01', consigne:'فسر الوثيقة مستعينا بمعلوماتك', verbCardId:'verb_explain_v1', existence:'lock', source:'mixed' },
  { id:'d02', consigne:'استنتج العلاقة من الوثيقة ومعلوماتك', verbCardId:'verb_deduce_v1', existence:'lock', source:'mixed' },
  { id:'d03', consigne:'وضّح مستعينا بالوثيقة ومعلوماتك', verbCardId:'verb_explain_v1', existence:'lock', source:'mixed' },
  { id:'d04', consigne:'فسّر بالاعتماد على معلوماتك والشكل 3', verbCardId:'verb_explain_v1', existence:'lock', source:'mixed' },
  { id:'d05', consigne:'بيّن آلية الظاهرة بالاعتماد على معلوماتك ومنحنى الوثيقة', verbCardId:'verb_explain_multi_v1', existence:'lock', source:'mixed' },
  { id:'d06', consigne:'استنتج سبب النتيجة من الوثيقة ومعلوماتك', verbCardId:'verb_deduce_v1', existence:'lock', source:'mixed' },
  { id:'d07', consigne:'وضّح دور المنحنى 2 بالاستعانة بمعلوماتك', verbCardId:'verb_explain_v1', existence:'lock', source:'mixed' },
  { id:'d08', consigne:'قارن المنحنى 1 مع معلوماتك', verbCardId:'verb_compare_v1', existence:'lock', source:'mixed' },
  { id:'d09', consigne:'علل الظاهرة مستعينا بالوثيقة 1 ومعلوماتك', verbCardId:'verb_explain_v1', existence:'lock', source:'mixed' },
  { id:'d10', consigne:'وضّح التكامل بين الوثيقة 2 ومعلوماتك', verbCardId:'verb_explain_multi_v1', existence:'lock', source:'mixed' },

  // ── 🚪 لا قفل → 🧠 دُرج المعرفة (pas de source, pas de mouvement) ─
  { id:'m01', consigne:'عرّف الإنزيم', verbCardId:'verb_define_v1', existence:'no_lock', source:null },
  { id:'m02', consigne:'عرّف المناعة النوعية', verbCardId:'verb_define_v1', existence:'no_lock', source:null },
  { id:'m03', consigne:'اذكر مراحل الترجمة', verbCardId:'verb_list_v1', existence:'no_lock', source:null },
  { id:'m04', consigne:'اذكر مراحل الانقسام الميئوزي', verbCardId:'verb_list_v1', existence:'no_lock', source:null },
  { id:'m05', consigne:'عدّد أنواع الأجسام المضادة', verbCardId:'verb_list_v1', existence:'no_lock', source:null },
  { id:'m06', consigne:'سمّ العضيات الغشائية', verbCardId:'verb_list_v1', existence:'no_lock', source:null },
  { id:'m07', consigne:'صف دورة حياة الديدان المستديرة', verbCardId:'verb_list_v1', existence:'no_lock', source:null },
  { id:'m08', consigne:'أعدد خصائص الاستجابة الخلطية', verbCardId:'verb_list_v1', existence:'no_lock', source:null },
  { id:'m09', consigne:'حدد موقع الإنزيم في الخلية', verbCardId:'verb_list_v1', existence:'no_lock', source:null },
  { id:'m10', consigne:'لخص مراحل تكوين المعقد المناعي', verbCardId:'verb_schema_v1', existence:'no_lock', source:null },
  { id:'m11', consigne:'رتّب مراحل الانقسام ترتيبا تصاعديا', verbCardId:'verb_list_v1', existence:'no_lock', source:null },

  // ── 🚪 قفل + 📥 وثيقة + 🎬 فيلم (mémoire du cours sur سند présent) ──
  // BAC-fidèles : chaque question vit dans un exercice qui porte un document.
  { id:'mf01', consigne:'فسر لماذا ينعدم النشاط عند pH=6 انطلاقا من معطيات الوثيقة 1', verbCardId:'verb_explain_v1', existence:'lock', source:'document' },
  { id:'mf02', consigne:'علل تفوق الاستجابة الثانوية بالاعتماد على معطيات الشكل 2', verbCardId:'verb_explain_v1', existence:'lock', source:'document' },
  { id:'mf03', consigne:'وضّح سبب تخصصية الإنزيم انطلاقا من الوثيقة 1', verbCardId:'verb_explain_v1', existence:'lock', source:'document' },
  { id:'mf04', consigne:'بيّن كيف يحدث التنشيط اللمفاوي بالاستعانة بالجدول 1', verbCardId:'verb_explain_multi_v1', existence:'lock', source:'document' },
  { id:'mf06', consigne:'صادق على صحة الفرضية F1 انطلاقا من الوثيقة 2', verbCardId:'verb_validate_v1', existence:'lock', source:'document' },
  { id:'mf07', consigne:'وضّح الآلية الجزيئية للتحسس بالاعتماد على الشكل 3', verbCardId:'verb_explain_v1', existence:'lock', source:'document' },
  { id:'mf08', consigne:'فسّر سبب تكيف الغشاء انطلاقا من معطيات الوثيقة 1', verbCardId:'verb_explain_v1', existence:'lock', source:'document' },
  { id:'mf09', consigne:'استنتج سبب تفضيل الإنزيم لركيزته من منحنى الوثيقة 2', verbCardId:'verb_deduce_v1', existence:'lock', source:'document' },
  { id:'mf11', consigne:'صادق على الفرضية الأنسب انطلاقا من الجدول 1', verbCardId:'verb_validate_v1', existence:'lock', source:'document' },

  // ── ⚙️ 🔨 الحدّاد — la famille NOUVELLE (اقترح/برر/ناقض/قدّم حلا) ──
  // 3 items RÉELS des sujets BAC 2025 (copiés mot pour mot du document owner),
  // + variantes fidèles au pattern «استغل… ومعلوماتك».
  { id:'s01', consigne:'اقترح فرضيتين حول آلية تأثير مادة Mtb على ارتباط الأدينوزين بالاستعانة بالوثيقة 1 ومعلوماتك', verbCardId:'verb_hypothesis_v1', existence:'lock', source:'mixed' },
  { id:'s02', consigne:'اقترح علاجا آخر لمرض ALS انطلاقا من معطيات الوثيقة 3 ومعلوماتك', verbCardId:'verb_hypothesis_v1', existence:'lock', source:'mixed' },
  { id:'s03', consigne:'اقترح طريقة أخرى لضمان أمان نقل الدم بالاستعانة بالوثيقة 2 ومعلوماتك', verbCardId:'verb_hypothesis_v1', existence:'lock', source:'mixed' },
  { id:'s04', consigne:'برر الاختيار التجريبي لإضافة المادة X انطلاقا من منحنى الوثيقة 2', verbCardId:'verb_hypothesis_v1', existence:'lock', source:'document' },
  { id:'s05', consigne:'ناقض الفرضية الثانية بالاستناد إلى معطيات الشكل 2', verbCardId:'verb_hypothesis_v1', existence:'lock', source:'document' },
  { id:'s06', consigne:'اقترح فرضية تفسر تناقص الارتباط تدريجيا انطلاقا من منحنى الوثيقة 1', verbCardId:'verb_hypothesis_v1', existence:'lock', source:'document' },
  { id:'s07', consigne:'اقترح توصية للحد من تلوث مياه الشرب بالاعتماد على الجدول 2 ومعلوماتك', verbCardId:'verb_hypothesis_v1', existence:'lock', source:'mixed' },
  { id:'s08', consigne:'قدّم حلا للتغلب على مقاومة البكتيريا بالمستعجل بالوثيقة 3 ومعلوماتك', verbCardId:'verb_hypothesis_v1', existence:'lock', source:'mixed' },
  { id:'s09', consigne:'اقترح تجربة جديدة للتحقق من الفرضية F1 انطلاقا من الوثيقة 2', verbCardId:'verb_hypothesis_v1', existence:'lock', source:'document' },
  { id:'s10', consigne:'برر ارتفاع نسبة الخلايا المقاومة في الشكل 2', verbCardId:'verb_hypothesis_v1', existence:'lock', source:'document' },
  // (les deux anciens items mémoire « اقترح » sont devenus BAC-fidèles : قفل + مختلط)
  { id:'mf05', consigne:'اقترح فرضية تفسر توقف النمو انطلاقا من معطيات الوثيقة 1 ومعلوماتك', verbCardId:'verb_hypothesis_v1', existence:'lock', source:'mixed' },
  { id:'mf10', consigne:'اقترح فرضية حول دور المستقبل بالاستعانة بالوثيقة 2 ومعلوماتك', verbCardId:'verb_hypothesis_v1', existence:'lock', source:'mixed' },
];

export const DRILL_BANK: DrillConsigne[] = RAW.map((r, i) => ({
  id: r.id,
  seq: i + 1,
  consigne: r.consigne,
  verbCardId: r.verbCardId,
  existence: r.existence,
  source: r.source,
  movement: deriveMovement(r.consigne, r.verbCardId),
}));

// Auto-vérification au chargement (DEV) : l'intention éditoriale doit coïncider
// avec le dérivé du moteur — sinon la banque ment à la règle qu'elle fait entraîner.
if ((import.meta as unknown as { env?: { DEV?: boolean } }).env?.DEV) {
  for (const c of DRILL_BANK) {
    if (deriveExistence(c.consigne) !== c.existence) throw new Error(`[drillBank] ${c.id} existence : édité=${c.existence} dérivé=${deriveExistence(c.consigne)}`);
    if (deriveSource(c.consigne) !== c.source) throw new Error(`[drillBank] ${c.id} source : édité=${c.source} dérivé=${deriveSource(c.consigne)}`);
  }
  const smiths = DRILL_BANK.filter(c => c.movement === 'smith').length;
  const locked = DRILL_BANK.filter(c => c.existence === 'lock').length;
  if (locked > 0 && smiths / locked < 0.15) throw new Error(`[drillBank] 🔨 sous-représenté : ${smiths}/${locked} (cible ≈ 25-30% des questions ouvertes)`);
}

// ── Tirage quotidien (déterministe par jour) ──────────────────────────────────
function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function mulberry32(a: number): () => number {
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(a ^ (a >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Les 12 consignes du jour : déterministes pour une date donnée, renouvelées
 * chaque jour (anti-mémorisation — D3).
 */
export function drawDailyConsignes(day: string, count = 12): DrillConsigne[] {
  const rnd = mulberry32(hashString(`kunz_drill3:${day}`));
  const arr = [...DRILL_BANK];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, count).sort((a, b) => a.seq - b.seq);
}

// ── Évaluation — une consigne est réussie si TOUTES les portes posées sont justes ──
export interface DrillAnswer {
  /** 🚪 porte 1 (toujours posée). */
  g1?: D1;
  /** 📥 porte 2 (posée seulement si قفل). */
  g2?: D2;
  /** ⚙️ porte 3 (posée seulement si قفل). */
  g3?: D3;
}

export interface DrillItemResult {
  c: DrillConsigne;
  ok1: boolean;
  ok2: boolean;   // true si la porte n'est pas posée (pas de قفل)
  ok3: boolean;
  correct: boolean;
  /** Les portes posées sont-elles toutes répondues ? */
  answered: boolean;
}

export interface DrillGrade { score: number; results: DrillItemResult[]; }

export function gradeDrill(consignes: DrillConsigne[], answers: Record<string, DrillAnswer>): DrillGrade {
  const results: DrillItemResult[] = consignes.map((c) => {
    const a = answers[c.id] ?? {};
    const ok1 = a.g1 === c.existence;
    const ok2 = c.source === null ? true : a.g2 === c.source;
    const ok3 = c.movement === 'drawer' ? true : a.g3 === c.movement;
    const answered = !!a.g1 && (c.source === null || !!a.g2) && (c.movement === 'drawer' || !!a.g3);
    return { c, ok1, ok2, ok3, correct: ok1 && ok2 && ok3, answered };
  });
  return { score: results.filter(r => r.correct).length, results };
}

/** Libellés courts pour l'UI et les résultats. */
export const DRILL_LABELS = {
  g1: { lock: '🔒 قفل', no_lock: '🧠 لا قفل' } as Record<D1, string>,
  g2: { document: '📄 وثيقة', mixed: '📄+🧠 مختلط' } as Record<D2, string>,
  g3: { photo: '📷', film: '🎬', smith: '🔨', drawer: '🧠' } as Record<D3, string>,
} as const;

// ── Phase 0 — ouvrir les portes (auto-pace, avec feedback) ────────────────────
export interface Phase0Demo {
  bankId: string;
  /** Pourquoi — la cascade en une phrase (affichée après la réponse). */
  whyAr: string;
}

export const PHASE0_DEMOS: Phase0Demo[] = [
  { bankId:'p01',  whyAr:'وثيقة ⇒ 🚪 قفل. لا «ومعلوماتك» ⇒ 📥 وثيقة فقط. « حلل » يصف ثم يستنتج ⇒ 📷.' },
  { bankId:'m01',  whyAr:'لا وثيقة ⇒ 🚪 لا قفل ⇒ 🧠 الدُرج : من تَبَصَّر إلى افتح مباشرة.' },
  { bankId:'pf01', whyAr:'وثيقة ⇒ 🚪 قفل. « فسر » يطلب السبب (لأنّ…) ⇒ 🎬.' },
  { bankId:'d04',  whyAr:'وثيقة + «معلوماتك» ⇒ 🚪 قفل 📥 مختلط. « فسّر » ⇒ 🎬.' },
  { bankId:'mf02', whyAr:'الشكل 2 ⇒ 🚪 قفل. « علل » يطلب العلّة ⇒ 🎬.' },
  { bankId:'s01',  whyAr:'وثيقة + «معلوماتك» ⇒ قفل مختلط. « اقترح فرضيتين » = لا جواب واحد صحيح ⇒ 🔨 الحدّاد.' },
];

const PHASE0_KEY = 'kunz_v3:phase0_done';

export function isPhase0Done(): boolean {
  try { return localStorage.getItem(PHASE0_KEY) === '1'; } catch { return false; }
}
export function completePhase0(): void {
  try { localStorage.setItem(PHASE0_KEY, '1'); } catch {}
}
export function resetPhase0(): void {
  try { localStorage.removeItem(PHASE0_KEY); } catch {}
}
