// attendusBac2025.ts — LE REGISTRE DES ATTENDUS OBLIGATOIRES (Pierre 2).
//
// AUDIT docs/AUDIT_CORRECTEUR_MEFTAH_2026-09-19.md §5.1 : « le correcteur ne
// note plus contre une unité, il note contre la question. » Ce registre est
// la SEULE source du dénominateur de la note — la banque d'unité n'est plus
// jamais un dénominateur (le défaut historique qui faisait 8/8 à une salade).
//
// SOURCES PAR GROUPE (bac2025, 6 groupes notés) :
//   · S1-Ex1, S2-Ex1 : pont programmatique vers ATTENDUS_BAREME
//     (dictionnaire_final.json) — validé item par item contre le corrigé
//     officiel le 2026-09-19 (Q1=0.25×5, Q2=3.75, RIP=1.25, annonce=0) ;
//     formes de reconnaissance = entités scorées du build détectées dans le
//     texte officiel de l'item (mécanisme signatureDe du barème).
//   · S1-Ex2, S1-Ex3 : encodés depuis le corrigé officiel
//     (correction-bac-sci-sciences-2025.pdf, p.2-4, lisible) ; les `formes`
//     sont des SOUS-CHAÎNES VERBATIM du texte officiel de chaque élément
//     (traçables par construction). Ventilation fine par contrainte de somme
//     quand l'OCR atténue un point (commenté par item).
//   · S2-Ex2, S2-Ex3 : encodés depuis le même corrigé (p.8-11, partiellement
//     bruité) — mêmes règles ; les valeurs clés (21→13 µmol/L, 326/221/529,
//     250/500 mL) servent de formes et sont fidèles au scan.
//
// SÉMANTIQUE DE LA NOTE (R6) :
//   · item « auto » = a au moins une forme → crédité si une forme figure
//     dans la réponse (texte normalisé) ;
//   · item à COMPOSANTES (P5) : quand le corrigé exige PLUSIEURS éléments
//     simultanés (ex. Q1 : contexte « hors/pendant synthèse » ET l'ARN nommé),
//     `composantes` = liste de groupes (OU dans un groupe = synonymes, ET
//     entre groupes = co-requis) ; crédit = points × (groupes détectés /
//     groupes totaux). Fin du « un mot = un item entier » : écrire
//     « ARNm ARNr ARNt » ne crédite plus les rôles non exprimés ;
//   · item « manuel » = aucune forme définissable (intros/annonces, items
//     build sans entité) → JAMAIS crédité automatiquement, EXCLU du
//     dénominateur, remonté au correcteur humain ;
//   · couverture = Σ points auto crédités / Σ points auto ;
//   · note = couverture × maxPts, PUIS plafonds d'intégrité
//     (integriteCopie : non-prose 30 %, négations 50 %, perroquet 25 %) ;
//   · couverture 0 → 0 pt (une copie qui ne touche aucun attendu ne gagne rien).
//
// La calibration linéaire (a·cov+b sur banque d'unité) N'EST PLUS le chemin
// de notation : ses constantes étaient ajustées sur l'ANCIEN dénominateur ;
// `noterDepuisCouverture` reste exporté en LEGACY pour recherche/tests.

import { normalizeAr } from '../../lib/validation/normalizeAr';
import { ATTENDUS_BAREME, entitesDansTexte } from './dictionnaireCorrecteur';

export type SujetId = 1 | 2;
export type ExerciceId = 1 | 2 | 3;

export interface AttenduItem {
  id: string;
  /** Texte officiel de l'élément (affichage + traçabilité). */
  texteAr: string;
  points: number;
  /** Sous-chaînes normalisées de reconnaissance (synonymes : OU) — vides = item manuel. */
  formes: string[];
  /**
   * Composants co-requis (P5) : OU dans un groupe, ET entre groupes.
   * Présentes → remplacent `formes` pour le crédit (proportionnel).
   */
  composantes?: string[][];
  source: 'build' | 'corrige-officiel-2025';
}

export interface AttendusExercice {
  sujet: SujetId;
  exercice: ExerciceId;
  maxPts: number;
  /** L'énoncé/le verrou de l'exercice (détection de perroquet). */
  questionAr: string;
  items: AttenduItem[];
}

// ── Pont programmatique : Ex1 des deux sujets depuis le build prouvé fidèle ──

/**
 * Sigles scientifiques d'un texte officiel : tokens latins avec >=2 majuscules
 * consecutives (ARNm, RIP, ATP, NADH) ou contenant un chiffre (H2O, CO2, 2-DG).
 * Le texte `ar` des items build est parfois en francais : les entites arabes y
 * manquent, les sigles restent fiables (sources = texte officiel de l'item).
 */
function siglesDeTexte(texte: string): string[] {
  const out: string[] = [];
  for (const m of texte.matchAll(/[A-Za-z]*[A-Z]{2,}[A-Za-z0-9]*|[A-Za-z]*\d[A-Za-z0-9-]*/g)) {
    const t = m[0];
    if (t.length >= 2 && /[A-Z]{2,}|\d/.test(t)) out.push(normalizeAr(t).toLowerCase());
  }
  return out;
}

// Groupes de contextes du Q1 (S1-Ex1) — le corrigé exige le PAIRE (contexte, ARN).
const HORS_SYNTH = ['hors synthese', 'خارج فترة تركيب', 'خارج عملية التركيب', 'خارج التركيب'];
const PEND_SYNTH = ['pendant synthese', 'خلال فترة تركيب', 'اثناء فترة تركيب', 'أثناء فترة تركيب', 'اثناء التركيب', 'خلال التركيب'];

/**
 * Décomposition par composantes des items build où le corrigé exige des rôles
 * (P5) — clé = suffixe d'id dans le groupe. + formes manquantes ajoutées à la
 * main quand le sigle échappe au détecteur (Pi : 1 majuscule seulement).
 */
const OVERLAY_BUILD: Record<string, { composantes?: string[][]; formes?: string[] }> = {
  'S1-Ex1/Q1/item1': { composantes: [HORS_SYNTH, ['arnr']] },
  'S1-Ex1/Q1/item2': { composantes: [HORS_SYNTH, ['arnt']] },
  'S1-Ex1/Q1/item3': { composantes: [PEND_SYNTH, ['arnm']] },
  'S1-Ex1/Q1/item4': { composantes: [PEND_SYNTH, ['arnr']] },
  'S1-Ex1/Q1/item5': { composantes: [PEND_SYNTH, ['arnt']] },
  'S1-Ex1/Q2/ARNm': { composantes: [['arnm'], ['messager', 'transporte', 'رسول', 'انتقال المعلومه', 'نقل المعلومه']] },
  'S1-Ex1/Q2/ARNt': { composantes: [['arnt'], ['aa', 'anticodon', 'احماض امينيه', 'رامزه']] },
  'S1-Ex1/Q2/ARNr': { composantes: [['arnr'], ['ribosome', 'ريبوزوم']] },
  'S1-Ex1/Q2/RIP': { composantes: [['rip'], ['adenine', 'ادنين', 'ribose', 'ريبوز']] },
  'S2-Ex1/Q1/item3': { formes: ['pi', 'فوسفات'] }, // corrigé p.7 : « +2ADP+2Pi+2NAD+ » — C = Pi (phosphate inorganique)
};

function itemsDepuisBuild(prefix: string): AttenduItem[] {
  const items: AttenduItem[] = [];
  for (const [cle, v] of Object.entries(ATTENDUS_BAREME)) {
    if (!cle.startsWith(prefix)) continue;
    const texte = v.ar || v.fr || cle;
    const sig = [
      ...entitesDansTexte(texte).trouvees.map((t) => normalizeAr(t.terme).toLowerCase()),
      ...siglesDeTexte(texte),
    ].filter(Boolean);
    const ov = Object.entries(OVERLAY_BUILD).find(([k]) => cle.endsWith(k))?.[1];
    if (ov?.formes?.length) sig.push(...ov.formes.map((f) => normalizeAr(f).toLowerCase()));
    items.push({
      id: cle,
      texteAr: texte,
      points: typeof v.points === 'number' ? v.points : 0,
      formes: [...new Set(sig)],
      composantes: ov?.composantes?.map((g) => g.map((f) => normalizeAr(f).toLowerCase())),
      source: 'build',
    });
  }
  return items;
}

// ── Aides d'encodage (S1-Ex2/Ex3, S2-Ex2/Ex3 depuis le corrigé officiel) ─────

let seq = 0;
function item(points: number, formes: string[], texteAr: string): AttenduItem {
  seq += 1;
  return {
    id: `corr-2025-${seq}`,
    texteAr,
    points,
    formes: formes.map((f) => normalizeAr(f).toLowerCase()).filter(Boolean),
    source: 'corrige-officiel-2025',
  };
}

const Q_S1: Record<ExerciceId, string> = {
  1: 'كيف تستهدف مادة RIP جزيئات ARN فتوقف تكاثر الخلايا السرطانية؟',
  2: 'لماذا تنمو الطحالب T.P الطبيعية في أوساط ذات تركيز منخفض من HCO₃⁻ بينما الطافرة لا تقدر؟',
  3: 'كيف يقوّي استهلاك Mtb (المتواجد في الشاي الأخضر) اليقظة ويقلل الشعور بالنعاس؟',
};
const Q_S2: Record<ExerciceId, string> = {
  1: 'ما هي التفاعلات المميزة لمرحلة التحلل السكري وكيف تؤثر مادة 2-DG عليها؟',
  2: 'كيف يفسَّر التأثير الطافر لأنزيم SOD في تراكم ROS، ولماذا اعتُمد الإيدارافون EDA دوالاً لعلاج التصلب الجانبي الضموري؟',
  3: 'كيف يتحقق النقل الآمن للدم بين الزمرات، وكيف يمكن تحقيق التسامح المناعي عند نقل الدم من الزمرة A إلى الزمرة O؟',
};

// ── S1-Ex2 (7 ن) — طحالب T.P · بيرنويدة · CA / Rubisco ───────────────────────
const S1_EX2: AttenduItem[] = [
  item(0.5, ['نسبه نمو الطبيعيه اعظميه', 'لا تتعدى'],
    'عند التركيز المنخفض: نسبة نمو الطبيعية أعظمية (~90%) أما الطافرة فلا تتعدى ~20%'),
  item(0.5, ['ثابته عند حوالي 90', 'ترتفع عند الطافره'],
    'عند التركيز المرتفع: تبقى نسبة نمو الطبيعية ~90% بينما ترتفع عند الطافرة (~70%)'),
  item(0.5, ['بقدرتها على النمو في الاوساط'],
    'الاستنتاج: تمتاز الطبيعية بقدرتها على النمو في الأوساط ذات HCO3⁻ منخفض التركيز'),
  item(0.5, ['وجود غلاف', 'تيلاكويدات'],
    'تتشابه البنيتان بوجود غلاف وحشوة تحتوي أنزيم Rubisco وتيلاكويدات بداخلها أنزيم CA'),
  item(1.5, ['البيرنويد', 'غشاء بروتيني يحيط'],
    // Corrigé : description البيرنويدة (~1.5) — ventilation OCR atténuée, somme contrainte.
    'تتميز الطبيعية بوجود البيرنويدة: غشاء بروتيني يحيط بجزء من الحشوة يتضمن تيلاكويدة ويجمع Rubisco وCA — غائبة عند الطافرة'),
  item(0.5, ['تمنح الطبيعيه النمو', 'يمنحها', 'يحدّ من نمو'],
    'الربط: البيرنويدة تمنح الطبيعية النمو في HCO3⁻ منخفض؛ غيابها يحدّ من نمو الطافرة'),
  item(0.5, ['قبل اضافه', 'بعد اضافه'],
    'الشكل(أ): قبل إضافة CA ثبات HCO3⁻ المشع (~100%) وانعدام CO2؛ بعد إضافته تناقص HCO3⁻ وتزايد CO2 حتى ~100%'),
  item(0.5, ['يحفز انزيم', 'تفكيك'],
    'الاستنتاج: يحفز أنزيم CA تفكيك HCO3⁻ وإنتاج CO2'),
  item(0.5, ['تراكم', 'الحشوه'],
    'الشكل(ب): عند الطبيعية تتراكم كمية CO2 في البيرنويدة؛ عند الطافرة تكون مرتفعة في الحشوة وقليلة في الهيولى'),
  item(0.5, ['غير نفوذ', 'نفوذ'],
    'الشكل(ج): الغشاء البروتيني للبيرنويدة نفوذ لـ HCO3⁻ وRuBP/APG وغير نفوذ لـ CO2 — فيُحجز CO2 داخل البيرنويدة'),
  item(0.5, ['طاقه كيميائيه كامنه', 'سكر'],
    'الربط: تثبيت CO2 على RuBP فيتشكل APG يتحول جزئياً إلى سكر سداسي وتجديد RuBP — تحويل الطاقة الضوئية إلى كيميائية كامنة رغم انخفاض CO2'),
  item(0.5, ['التلوث المائي', 'O₂'],
    'التبرير البيئي: الطبيعية تساهم في التخلص من التلوث المائي بامتصاص HCO3⁻ (مصدر CO2) وتوفير O2'),
];

// ── S1-Ex3 (8 ن) — Ado · A1R · NE · Mtb (الشاي) ──────────────────────────────
const S1_EX3: AttenduItem[] = [
  item(0.5, ['المجموعه 1', 'النشاط العصبي'],
    'الشكل(أ): المجموعة 1 (Ado وحده) — كلما زاد تركيز Ado نقص النشاط العصبي الدماغي (~90%→~10%)'),
  item(0.5, ['المجموعه 2'],
    'المجموعة 2 (Ado + Mtb ثابت) — تناقص أضعف (~90%→~50%)'),
  item(0.5, ['من تأثير', 'يحد'],
    'الاستنتاج: يحدّ Mtb من تأثير الأدينوزين المسبب لتناقص النشاط العصبي الدماغي'),
  item(0.5, ['شده الارتباط', 'ينعدم'],
    'الشكل(ب): في غياب Mtb شدة الارتباط Ado-A1R ~100؛ مع Mtb تتناقص حتى الانعدام (~20 pmol/L)'),
  item(0.5, ['يعيق', 'ارتباط الادينوزين'],
    'الاستنتاج: يعيق Mtb ارتباط الأدينوزين بمستقبله A1R'),
  item(1.0, ['فرضيه', 'يرتبط mtb'],
    // Corrigé p.3 : « الربط واقتراح الفرضيتين — 1.0 ».
    'الربط واقتراح الفرضيتين: (ف1) يرتبط Mtb بمستقبل الأدينوزين A1R · (ف2) يرتبط Mtb بالأدينوزين'),
  item(0.5, ['النورادرينالين', 'نورادرينالين', 'norepinephrine', 'noradrenaline'],
    'الجزء 2-الشكل(أ): كلما ارتفعت نسبة المعقدات Ado-A1R نقص تركيز NE/النورأدرينالين (من ~8 إلى ~2 nmol/L)'),
  item(0.5, ['يقلل افراز'],
    'الاستنتاج: ارتباط Ado بـ A1R يقلل إفراز NE من الخلايا قبل المشبكية'),
  item(1.0, ['قنوات', 'الحويصلات'],
    'الشكل(ب) غياب Mtb: ارتباط Ado → تفعيل Go/Gi → تنشيط قنوات K⁺ وتثبيط قنوات Ca²⁺ → لا اندفاع Ca²⁺ → عدم إفراز NE من الحويصلات'),
  item(1.0, ['يتثبت', 'يعود'],
    'وجود Mtb: يتثبت Mtb على A1R (تكامل بنيوي) ← منع تثبيت Ado ← لا تفعيل Go/Gi ← عودة قنوات Ca²⁺ وإفراز NE'),
  item(0.5, ['صحه الفرضيه', 'الفرضيه 1'],
    'الحسم: يؤكد صحة الفرضية 1 — يرتبط Mtb بمستقبل الأدينوزين A1R'),
  item(0.5, ['الاعتدال', 'قبل النوم'],
    'النصيحتان: الاعتدال في الكمية اليومية + تجنب الشاي مساء/قبل النوم (اختلال النوم بفعل Mtb)'),
  item(0.5, ['نعاس', 'يقظه'],
    'المخطط: مسار Ado (تراكم → ارتباط A1R → نقص NE → نعاس) ومسار Mtb (احتلال A1R → عودة NE → يقظة)'),
];

// ── S2-Ex2 (7 ن) — SOD · الطفرة · EDA · Catalase (ALS) ───────────────────────
const S2_EX2: AttenduItem[] = [
  item(0.5, ['اوكسيد فائق', 'بيروكسيد الهيدروجين'],
    'الشكل(أ) بوجود SOD: ينخفض الأوكسيد الفائق (من ~20) حتى الانعدام، ويظهر بيروكسيد الهيدروجين (~18) والأكسجين (~8)'),
  item(0.5, ['catalase'],
    'بوجود Catalase: ينخفض بيروكسيد الهيدروجين تدريجياً (~18→انعدام) ويستمر تزايد O2'),
  // Confirmé le 2026-09-19 par re-lecture du corrigé (p.7-8) : la ventilation
  // officielle force parties 1+2 = 3.5 pts dont 3.0 lisibles (SOD/Catalase/
  // استنتاج + EDA×3) — le 0.5 manquant est le شاهد (tube témoin sans enzyme).
  item(0.5, ['في غياب الانزيم', 'شاهد'],
    'في غياب الأنزيم (شاهد): ثبات تراكيز الأوكسيد الفائق والمنتجات مع الزمن'),
  item(0.5, ['يحفز'],
    'الاستنتاج: يحفز SOD تحويل الأوكسيد الفائق ويحفز Catalase تفكيك بيروكسيد الهيدروجين'),
  item(0.5, ['طفره', 'الموقع النحاسي', 'النحاس'],
    'الطفرة (ALS): استبدال حمض أميني في موقع النحاس النشط (His46/48/63/120) يمنع تثبيت الأوكسيد الفائق'),
  item(0.5, ['تراكم', 'ros'],
    'الربط: الطفرة تحرم SOD من وظيفتها فيتراكم الأوكسيد الفائق (ROS) وتتلف الخلايا العصبية الحركية'),
  item(0.5, ['بدون الحقن', '21'],
    'الشكل(ب): دون حقن EDA يكون تركيز الأوكسيد الفائق في الخلايا العصبية ~21 µmol/L'),
  item(0.5, ['تناقص تدريجي', '13'],
    'بعد الحقن اليومي بـ EDA: تناقص تدريجي للتركيز حتى ~13 (الأسبوع 10)'),
  item(0.5, ['خفض تراكيز'],
    'الاستنتاج: يعمل EDA على خفض تراكيز الأوكسيد الفائق في الخلايا العصبية الحركية'),
  item(0.5, ['يتفاعل الادارافون', 'eda'],
    'الربط بالمعادلات: SOD يحفز تفاعل الأوكسيد الفائق مع بيروكسيد الهيدروجين؛ EDA يتفاعل مع الأوكسيد الفائق لينتج بيروكسيد الهيدروجين'),
  item(0.5, ['ماء', 'الماء'],
    'في الحالتين يتم التخلص من بيروكسيد الهيدروجين بتدخل Catalase الذي يحوله إلى ماء وأكسجين'),
  item(1.0, ['التصلب الجانبي', 'الدواء', 'يمنع'],
    'التبرير: يمنع EDA تراكم الأوكسيد الفائق (ركيزة نوعية) فيحمي الخلايا العصبية الحركية — لهذا اعتُمد دوالاً للتصلب الجانبي الضموري'),
  item(0.5, ['جذعيه', 'زرع'],
    'اقتراح علاج آخر: زرع خلايا جذعية لتعويض الخلايا العصبية التالفة (يقبل كل اقتراح وجيه)'),
];

// ── S2-Ex3 (8 ن) — نقل الدم · الزمرات · NAGA · التسامح المناعي ───────────────
const S2_EX3: AttenduItem[] = [
  item(0.5, ['هيموغلوبين متحرر', 'بيليروبين'],
    'العملية 1 (O مائحة → A مستقبلة): تحلل قليل — 250 mL: هيموغلوبين متحرر 0.3 وبيليروبين 4.0؛ 500 mL: 0.5 g/dL'),
  item(0.5, ['الزمره a', 'شده التحلل'],
    'العملية 2 (A مائحة → O مستقبلة): ارتفاع شدة التحلل — 250 mL: 2.5 g/dL؛ 500 mL: 5.0 g/dL وبيليروبين مرتفع'),
  item(0.5, ['اكثر', 'امان'],
    'الاستنتاج: نقل الدم من الزمرة O إلى A أكثر أماناً من نقله من A إلى O'),
  item(0.5, ['المعقدات', '98'],
    'الوثيقة 2-الشكل: مع زيادة تركيز الأجسام المضادة anti-A تزداد نسبة تشكل المعقدات (90%→98%)'),
  item(0.5, ['منعدمه', 'لا يتكامل'],
    'بعد التحويل: نسبة المعقدات منعدمة رغم زيادة التركيز — الجسم المضاد لا يتكامل بنيوياً مع المستضد المحوَّل'),
  item(1.0, ['غير امن', 'المعقدات المناعيه'],
    'الربط: النقل آمن من O إلى A (لا معقدات مناعية) وغير آمن من A إلى O (معقدات بين المستضد A والأجسام المضادة anti-A في مصل O)'),
  item(0.5, ['326', 'كروماتوغرافيا'],
    'الكروماتوغرافيا: الوسط 1 (H مع الأنزيم): شريط 326 g/mol = الطرف السكري للمستضد H'),
  item(0.5, ['221'],
    'الوسط 2 (A مع الأنزيم): شريطان 326 (H) و221 — الأنزيم قصّ طرف A السكري'),
  item(0.5, ['529', 'naga'],
    'الوسط 3 (B دون الأنزيم NAGA): شريط 529 — وNAGA يفصل السكر الطرفي من المستضد A'),
  item(0.5, ['ارتصاص'],
    'الارتصاص: كلي (B + anti-B بدون NAGA) · جزئي (A معالج + NAGA) · منعدم (O) — NAGA يحوّل خلايا A إلى خلايا شبيهة بالزمرة O'),
  item(1.0, ['صحه الفرضيه', 'التسامح المناعي'],
    'مناقشة صحة الفرضية: NAGA يحول المستضد A إلى H فيتحقق التسامح المناعي عند نقل الدم من A إلى O — ما يدعم الفرضية'),
  item(0.5, ['مضاده للاجسام', 'اجسام مضاده'],
    'اقتراح آخر: إعطاء مواد مضادة للأجسام المضادة تمنع ارتباطها بالمستضد'),
  item(1.0, ['الخطوات', 'الفقره العلميه', 'المراحل'],
    'الفقرة العلمية: خطوات تحقيق التسامح المناعي (قياس الانحلال · اختبار المعقدات · تحويل NAGA · التحقق بالارتصاص)'),
];

// ── Assemblage du registre ───────────────────────────────────────────────────

export const ATTENDUS_BAC2025: Record<SujetId, Record<ExerciceId, AttendusExercice>> = {
  1: {
    1: { sujet: 1, exercice: 1, maxPts: 5, questionAr: Q_S1[1], items: [...itemsDepuisBuild('bac2025_S1/S1-Ex1/')] },
    2: { sujet: 1, exercice: 2, maxPts: 7, questionAr: Q_S1[2], items: S1_EX2 },
    3: { sujet: 1, exercice: 3, maxPts: 8, questionAr: Q_S1[3], items: S1_EX3 },
  },
  2: {
    1: { sujet: 2, exercice: 1, maxPts: 5, questionAr: Q_S2[1], items: [...itemsDepuisBuild('bac2025_S2/S2-Ex1/')] },
    2: { sujet: 2, exercice: 2, maxPts: 7, questionAr: Q_S2[2], items: S2_EX2 },
    3: { sujet: 2, exercice: 3, maxPts: 8, questionAr: Q_S2[3], items: S2_EX3 },
  },
};

/** Registre OBLIGATOIRE — lève si un groupe n'a pas d'attendus (jamais le cas). */
export function attendusDeGroupe(sujet: SujetId, exercice: ExerciceId): AttendusExercice {
  const g = ATTENDUS_BAC2025[sujet]?.[exercice];
  if (!g) throw new Error(`[attendus] aucun attendu officiel pour S${sujet}-Ex${exercice} — la notation sans attendus est interdite (Pierre 2)`);
  return g;
}

/** Σ points des items AUTO (formes OU composantes non vides, points > 0). */
export function plafondAutoDe(g: AttendusExercice): number {
  const auto = (i: AttenduItem) => i.points > 0 && (i.formes.length > 0 || (i.composantes?.length ?? 0) > 0);
  return Math.round(g.items.filter(auto).reduce((s, i) => s + i.points, 0) * 100) / 100;
}

/** Étiquette lisible d'un groupe (sélecteur produit). */
export const ETIQUETTES_GROUPES: Record<SujetId, Record<ExerciceId, string>> = {
  1: {
    1: 'الموضوع الأول · التمرين 1 (الخلايا المفترزة · 5 نقاط)',
    2: 'الموضوع الأول · التمرين 2 (البيرنويدة · 7 نقاط)',
    3: 'الموضوع الأول · التمرين 3 (الشاي الأخضر والمشبك · 8 نقاط)',
  },
  2: {
    1: 'الموضوع الثاني · التمرين 1 (الجلوكوز · 5 نقاط)',
    2: 'الموضوع الثاني · التمرين 2 (SOD والتصلب · 7 نقاط)',
    3: 'الموضوع الثاني · التمرين 3 (نقل الدم والتسامح · 8 نقاط)',
  },
};

/** Les 6 groupes exposés au produit (sélecteur « attendus obligatoires »). */
export function listeGroupesBac2025(): { sujet: SujetId; exercice: ExerciceId; labelAr: string }[] {
  const out: { sujet: SujetId; exercice: ExerciceId; labelAr: string }[] = [];
  for (const sujet of [1, 2] as SujetId[])
    for (const exercice of [1, 2, 3] as ExerciceId[])
      out.push({ sujet, exercice, labelAr: ETIQUETTES_GROUPES[sujet][exercice] });
  return out;
}
