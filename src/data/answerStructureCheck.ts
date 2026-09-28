// answerStructureCheck.ts — la réponse écrite respecte-t-elle la FORME que la
// consigne exige ? (sprint 23)
//
// Ce que ce module est, et n'est pas
// ----------------------------------
// L'app sait maintenant ce qui tombe (bacSessionIndex), sous quelle forme
// (bacArchetypes) et ce que chaque consigne demande (verbDemands). Il manquait
// le retour : l'élève écrit, et personne ne lui dit que son « تحليل » est en
// fait un « تفسير », ou que son texte scientifique n'a pas de conclusion.
//
// Ce module NE NOTE PAS et ne juge pas le fond : `correcteurV1.ts` et le
// dictionnaire s'occupent du contenu scientifique. Ici, on ne vérifie que des
// marqueurs de FORME, observables, chacun documenté par sa règle. Un contrôle
// non satisfait n'est pas une faute : c'est une alerte à relire.
//
// Toutes les règles sont des heuristiques assumées sur le texte arabe. Elles
// sont volontairement grossières et explicites plutôt que fines et opaques :
// mieux vaut un signal que l'élève comprend qu'un score qu'il subit.

import { classifyVerb, VERB_FAMILY_BY_ID } from './verbDemands';

export interface StructureCheck {
  id: string;
  /** Ce qui est vérifié, formulé comme une exigence. */
  labelAr: string;
  /** Satisfait ou non. */
  ok: boolean;
  /** Quoi faire si ce n'est pas satisfait. */
  hintAr: string;
  /**
   * 'attendu'   = la consigne l'exige ;
   * 'vigilance' = présence suspecte (ex. une cause dans un « حلّل »).
   */
  nature: 'attendu' | 'vigilance';
}

const CAUSALITE = /(يعود ذلك|يرجع ذلك|لأن|بسبب|نتيجة لـ|نتيجة ل|مما يؤدي|يفسر ذلك|و ذلك ل)/;
const CONCLUSION = /(نستنتج|نستخلص|و منه|في الخاتمة|خلاصة|و بالتالي)/;
const CHIFFRE = /[0-9٠-٩]/;
const UNITE = /(%|٪|mV|ms|mg|ml|µ|mol|°C|ساعة|دقيقة|ثانية|يوم)/;
const TENDANCE = /(كلما|يرتفع|ينخفض|يزداد|يتناقص|يبقى ثابت|من .* إلى)/;
const CONTRASTE = /(بينما|في المقابل|أما|على عكس|خلافاً)/;
const PROBABILITE = /(قد |ربما|يمكن أن|نفترض|من المحتمل|لعل)/;
const VERDICT = /(صحيحة|غير صحيحة|مؤكدة|غير مدعومة|غير مؤكدة|نقبل|نرفض)/;
const NEGATION_TRANCHEE = /(خاطئة|ننفي|منفية|باطلة)/;
const DOCUMENT = /(الوثيقة|الشكل|الجدول|المنحنى|الوثيقتين)/;
const MECANISME = /(جزيئي|خلوي|آلية|مستوى)/;
const FLECHE = /(←|→|⟶|-->|=>)/;
const RECOMMANDATION = /(يُنصح|ينصح|يجب|من الأفضل|يمكن استعمال|نقترح)/;
const CRITERE = /(من حيث|من ناحية|على مستوى)/;

/** Nombre de mots (approximation suffisante pour juger d'une longueur). */
function nbMots(texte: string): number {
  return texte.trim().split(/\s+/).filter(Boolean).length;
}

/** Le texte pose-t-il une question dans son premier tiers ? (problématique) */
function problematiqueEnTete(texte: string): boolean {
  const t = texte.trim();
  if (!t) return false;
  const tete = t.slice(0, Math.max(60, Math.floor(t.length / 3)));
  return /[?؟]/.test(tete);
}

function check(
  id: string,
  labelAr: string,
  ok: boolean,
  hintAr: string,
  nature: StructureCheck['nature'] = 'attendu',
): StructureCheck {
  return { id, labelAr, ok, hintAr, nature };
}

type Regle = (texte: string) => StructureCheck[];

const REGLES: Record<string, Regle> = {
  verb_texte_scientifique: (t) => [
    check(
      'intro_probleme',
      'المقدمة تنتهي بطرح المشكل العلمي',
      problematiqueEnTete(t),
      'أضف في المقدمة سؤالاً صريحاً ينتهي بعلامة استفهام: « كيف …؟ ».',
    ),
    check(
      'conclusion',
      'الخاتمة تجيب صراحة عن المشكل',
      CONCLUSION.test(t),
      'اختم بجملة تبدأ بـ « نستنتج أن » أو « و منه ».',
    ),
    check(
      'appui_document',
      'العرض يوظّف معطيات الوثائق',
      DOCUMENT.test(t) || CHIFFRE.test(t),
      'استشهد بالوثيقة أو بقيمة رقمية: النص العلمي ليس درساً محفوظاً.',
    ),
    check(
      'longueur',
      'الحجم يسمح بعرض مهيكل (أكثر من 40 كلمة)',
      nbMots(t) >= 40,
      'العرض قصير جداً: كل مؤشر يستحق جملة كاملة.',
    ),
  ],

  verb_analyser: (t) => [
    check(
      'chiffres',
      'التحليل يذكر القيم الرقمية',
      CHIFFRE.test(t),
      'حلّل بالأرقام: من القيمة … إلى القيمة …',
    ),
    check('unites', 'الوحدات مذكورة', UNITE.test(t), 'أضف الوحدة بعد كل قيمة (%، mV، دقيقة…).'),
    check(
      'tendance',
      'الاتجاه أو العلاقة العامة مصرَّح بها',
      TENDANCE.test(t),
      'اختم بعلاقة: « كلما زاد … كلما … ».',
    ),
    check(
      'pas_de_cause',
      'لا تفسير داخل التحليل',
      !CAUSALITE.test(t),
      'حذفُ السبب مقصود هنا: « لأن » و « يعود ذلك إلى » مكانهما في التفسير، لا في التحليل.',
      'vigilance',
    ),
  ],

  verb_expliquer: (t) => [
    check(
      'connecteur',
      'أداة ربط سببية صريحة',
      CAUSALITE.test(t),
      'استعمل « يعود ذلك إلى » أو « لأن »: بدونها الجواب يبقى وصفاً.',
    ),
    check(
      'mecanisme',
      'الآلية مذكورة على مستوى محدَّد',
      MECANISME.test(t),
      'حدّد المستوى: جزيئياً … و خلوياً …',
    ),
    check(
      'rappel_resultat',
      'تذكير قصير بالنتيجة قبل التفسير',
      DOCUMENT.test(t) || CHIFFRE.test(t),
      'ابدأ بجملة قصيرة تذكّر بما لوحظ، ثم فسّره.',
    ),
  ],

  verb_comparer: (t) => [
    check(
      'contraste',
      'أداة مقابلة بين الحالتين',
      CONTRASTE.test(t),
      'استعمل « بينما » أو « في المقابل » داخل نفس الجملة.',
    ),
    check(
      'criteres',
      'المعايير معلنة',
      CRITERE.test(t),
      'صرّح بالمعيار: « من حيث البنية … من حيث النشاط … ».',
    ),
    check(
      'longueur',
      'المقارنة تعالج أكثر من معيار واحد',
      (t.match(new RegExp(CRITERE, 'g'))?.length ?? 0) >= 2 || nbMots(t) >= 40,
      'عالج معيارين على الأقل، و إلا فهي ملاحظة لا مقارنة.',
    ),
  ],

  verb_hypothese: (t) => [
    check(
      'modalite',
      'صيغة احتمالية',
      PROBABILITE.test(t),
      'الفرضية ليست يقيناً: « قد يعود … » أو « نفترض أن … ».',
    ),
    check(
      'mecanisme_propose',
      'سبب مقترح لا إعادة وصف',
      CAUSALITE.test(t) || /إلى/.test(t),
      'اقترح سبباً: « … مما يؤدي إلى … ».',
    ),
    check(
      'testable',
      'الفرضية قابلة للاختبار',
      nbMots(t) >= 8,
      'فرضية من ثلاث كلمات لا يمكن اختبارها بوثيقة.',
    ),
  ],

  verb_valider: (t) => [
    check(
      'rappel_hypothese',
      'تذكير بالفرضية موضوع المصادقة',
      /(الفرضية|الفرضيتين|فرضية)/.test(t),
      'ابدأ بذكر الفرضية التي تصادق عليها.',
    ),
    check(
      'preuve',
      'دليل من المعطيات (رقم أو وثيقة)',
      CHIFFRE.test(t) || DOCUMENT.test(t),
      'المصادقة بلا معطى ليست مصادقة.',
    ),
    check(
      'verdict',
      'حكم صريح في النهاية',
      VERDICT.test(t),
      'اختم بـ: الفرضية صحيحة / غير صحيحة / غير مدعومة بالمعطيات.',
    ),
    check(
      'prudence',
      'لا نفي قاطع لفرضية لا تدعمها المعطيات',
      !(NEGATION_TRANCHEE.test(t) && !CHIFFRE.test(t)),
      'غياب الدليل ليس دليل غياب: قل « غير مدعومة » بدل « خاطئة » ما لم يكن لديك معطى يناقضها.',
      'vigilance',
    ),
  ],

  verb_conclure: (t) => [
    check(
      'amorce',
      'أداة استنتاج في البداية',
      CONCLUSION.test(t),
      'ابدأ بـ « نستنتج أن ».',
    ),
    check(
      'brievete',
      'الاستنتاج قصير (أقل من 40 كلمة)',
      nbMots(t) <= 40,
      'الاستنتاج تعميم في سطر أو سطرين، لا إعادة للتحليل.',
    ),
  ],

  verb_schema_bilan: (t) => [
    check(
      'fleches',
      'أسهم موجّهة بين العناصر',
      FLECHE.test(t),
      'استعمل الأسهم (←) بين العناصر، و ليس قائمة نقاط.',
    ),
    check(
      'plusieurs_etapes',
      'ثلاث مراحل على الأقل',
      (t.match(new RegExp(FLECHE, 'g'))?.length ?? 0) >= 2,
      'المخطط الوظيفي يربط عدة عناصر، لا عنصرين.',
    ),
  ],

  verb_justifier: (t) => [
    check(
      'connecteur',
      'أداة تبرير',
      CAUSALITE.test(t) || /(بكون|بما أن)/.test(t),
      'برّر بـ « لأن » أو « بما أن ».',
    ),
    check(
      'appui',
      'الاستناد إلى معطى أو قاعدة',
      CHIFFRE.test(t) || DOCUMENT.test(t) || MECANISME.test(t),
      'التبرير يستند إلى معطى من الوثيقة أو إلى قاعدة علمية.',
    ),
  ],

  verb_relation: (t) => [
    check(
      'deux_sources',
      'المعطيان مذكوران معاً',
      (t.match(new RegExp(DOCUMENT, 'g'))?.length ?? 0) >= 2,
      'اذكر الوثيقتين: نقطة التركيب تُمنح على الربط بينهما.',
    ),
    check(
      'lien',
      'جملة ربط صريحة',
      /(بربطهما|بالموازاة|يقابل|كلما|و منه)/.test(t),
      'أضف جملة الربط: « و بربطهما نستنتج أن … ».',
    ),
  ],

  verb_solution: (t) => [
    check(
      'action',
      'الإجراء مذكور بوضوح',
      RECOMMANDATION.test(t),
      'صرّح بالإجراء: « يُنصح بـ … ».',
    ),
    check(
      'justification',
      'الإجراء مبرَّر علمياً',
      CAUSALITE.test(t),
      'اربط النصيحة بالآلية التي أظهرتها الوثائق.',
    ),
  ],

  verb_restituer: (t) => [
    check(
      'concision',
      'جواب مباشر دون إطناب',
      nbMots(t) <= 60,
      'تمرين الاسترجاع لا يُكافئ الإطناب: احتفظ بالوقت للتمرين الثالث.',
    ),
    check(
      'pas_de_cause',
      'لا تفسير غير مطلوب',
      !CAUSALITE.test(t),
      'لم يُطلب منك السبب هنا.',
      'vigilance',
    ),
  ],
};

/** Contrôles de forme pour une famille de consigne donnée. */
export function checkAnswerStructure(familyId: string, texte: string): StructureCheck[] {
  const regle = REGLES[familyId];
  if (!regle) return [];
  if (!texte.trim()) return [];
  return regle(texte);
}

/** Contrôles à partir de la formulation brute de la consigne (« حلّل المخطط »). */
export function checkAnswerForVerb(verbe: string, texte: string): StructureCheck[] {
  const famille = classifyVerb(verbe);
  return famille ? checkAnswerStructure(famille.id, texte) : [];
}

export interface StructureVerdict {
  familyId: string;
  titleAr: string;
  checks: StructureCheck[];
  /** Exigences satisfaites / exigences totales (les vigilances sont exclues). */
  satisfaits: number;
  total: number;
  /** Alertes de vigilance déclenchées. */
  alertes: StructureCheck[];
}

/** Bilan lisible pour l'interface. */
export function structureVerdict(familyId: string, texte: string): StructureVerdict | null {
  const famille = VERB_FAMILY_BY_ID[familyId];
  if (!famille) return null;
  const checks = checkAnswerStructure(familyId, texte);
  const attendus = checks.filter((c) => c.nature === 'attendu');
  return {
    familyId,
    titleAr: famille.titleAr,
    checks,
    satisfaits: attendus.filter((c) => c.ok).length,
    total: attendus.length,
    alertes: checks.filter((c) => c.nature === 'vigilance' && !c.ok),
  };
}

/** Familles pour lesquelles un contrôle de forme existe. */
export const FAMILIES_WITH_CHECKS = Object.keys(REGLES);
