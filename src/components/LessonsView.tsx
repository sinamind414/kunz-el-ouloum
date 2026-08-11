import { useEffect, useMemo, useState, lazy, Suspense } from 'react';
import { motion } from 'motion/react';
import { BookOpen, Layers, Dna, Zap, Globe2, ChevronRight } from 'lucide-react';
import { Unit } from '../types';
import { LESSON_LIBRARY, LessonLibraryItem } from '../lessonData';
import { SINGLE_PATH_LESSONS } from '../data/singlePathLessons';
import { ACTIVE_LESSONS } from '../data/activeLessons';
import { OFFICIAL_PROGRAM_SEQUENCE } from '../data/unitLessonSequences';
import { getLockedUnitHintAr } from '../services/gatingEngine';
import SvtConceptsView from './SvtConceptsView';

const InteractiveLessonView = lazy(() => import('./InteractiveLessonView'));
const HtmlLessonViewer = lazy(() => import('./HtmlLessonViewer'));

interface LessonsViewProps {
  units: Unit[];
  progress?: { xp: number };
  onStartLesson: (lessonId: string) => void;
  /** V3 — unités validées par l'examen (badge « متقنة »). */
  validatedUnits?: number[];
  /** V3 — clic sur une unité verrouillée → Coach (Gating). */
  onLockedUnitClick?: (unit: Unit) => void;
  /** V3 — mode professeur : force l'accès à toutes les unités. */
  teacherOverride?: boolean;
}

// Display metadata per domain (icon, palette, French subtitle).
export const DOMAIN_INFO: Record<string, { fr: string; icon: typeof Dna; color: string; light: string; dark: string }> = {
  'التخصص الوظيفي للبروتينات': {
    fr: 'Spécialisation fonctionnelle des protéines',
    icon: Dna,
    color: '#006d37',
    light: '#eafaf1',
    dark: '#00562b',
  },
  'التحولات الطاقوية': {
    fr: 'Transformations énergétiques',
    icon: Zap,
    color: '#b45309',
    light: '#fef3e2',
    dark: '#92400e',
  },
  'التكتونية العامة': {
    fr: 'Tectonique générale',
    icon: Globe2,
    color: '#1d4ed8',
    light: '#eaf1fe',
    dark: '#1e40af',
  },
};

const DEFAULT_DOMAIN_INFO = { fr: '', icon: Layers, color: '#006d37', light: '#eafaf1', dark: '#00562b' };

type LessonVisualMeta = {
  imageSrc: string;
  altAr: string;
  metaAr: string;
};

const LESSON_PAGE_VISUAL_OVERRIDES: Record<string, LessonVisualMeta> = {
  'd1-u1-l1-expression-genique': {
    imageSrc: '/assets/images/schemas/domaine1_proteines/schema_10_intro_spider.svg',
    altAr: 'صورة افتتاحية حديثة تربط خيط العنكبوت بسؤال تركيب البروتين داخل الخلية.',
    metaAr: 'مدخل حي نحو التعبير المورثي',
  },
  'd1-u1-l2-transcription': {
    imageSrc: '/assets/images/schemas/domaine1_proteines/schema_17_transcription_bubble_modern.svg',
    altAr: 'وثيقة حديثة تبين فقاعة الاستنساخ وعمل ARN بوليمراز على ADN.',
    metaAr: 'من ADN إلى ARNm',
  },
  'd1-u1-l3-traduction': {
    imageSrc: '/assets/images/schemas/domaine1_proteines/schema_24_polysome_translation_modern.svg',
    altAr: 'وثيقة حديثة تبين متعدد الريبوزوم ودور الترجمة في رفع كمية البروتين المصنّع.',
    metaAr: 'قراءة الرسالة وتركيب البروتين',
  },
  'protein_structure_function': {
    imageSrc: '/assets/images/schemas/domaine1_proteines/schema_40_hemoglobin_structure_function_modern.svg',
    altAr: 'وثيقة حديثة تربط بين طفرة الهيموغلوبين وبنية البروتين ووظيفة الخلية.',
    metaAr: 'بنية البروتين ↔ الوظيفة',
  },
  'immunity_self_nonself': {
    imageSrc: '/assets/images/schemas/domaine1_proteines/schema_58_hla_I_II_structure_modern.svg',
    altAr: 'وثيقة حديثة تبين HLA وCMH كهوية مناعية للخلية.',
    metaAr: 'الذات واللاذات',
  },
  'immunity_humoral_response': {
    imageSrc: '/assets/images/schemas/domaine1_proteines/schema_63_antigen_antibody_complex_modern.svg',
    altAr: 'وثيقة حديثة تبين تكوّن المعقد المناعي في الاستجابة الخلطية.',
    metaAr: 'أجسام مضادة نوعية',
  },
  'immunity_cellular_response': {
    imageSrc: '/assets/images/schemas/domaine1_proteines/schema_70_tcr_cmh_target_modern.svg',
    altAr: 'وثيقة حديثة تبين تعرف اللمفاوية T القاتلة على الخلية الهدف عبر CMH.',
    metaAr: 'تعرف نوعي ثم إقصاء خلوي',
  },
  'immunity_memory_response': {
    imageSrc: '/assets/images/schemas/domaine1_proteines/schema_75_primary_secondary_response_curve_modern.svg',
    altAr: 'وثيقة حديثة تقارن بين الاستجابة الأولية والثانوية في الذاكرة المناعية.',
    metaAr: 'استجابة ثانية أسرع وأقوى',
  },
  'd1-u3-l1-enzyme': {
    imageSrc: '/assets/images/schemas/domaine1_proteines/schema_07_enzyme.svg',
    altAr: 'وثيقة حديثة مبسطة تبين الإنزيم والموقع الفعال والتخصص تجاه مادة التفاعل.',
    metaAr: 'إنزيمات · موقع فعال وتخصص',
  },
  synapse: {
    imageSrc: '/assets/images/schemas/domaine1_proteines/schema_30_ligand_gated_channel_modern_ar.svg',
    altAr: 'وثيقة حديثة تبين قناة غشائية بعد مشبكية تفتح بارتباط مبلغ عصبي.',
    metaAr: 'اتصال عصبي · قنوات ورسائل',
  },
  'phase11_chapitres_21_22': {
    imageSrc: '/assets/images/schemas/domaine2_energie/schema_09_photosynthese.svg',
    altAr: 'وثيقة تبين مقر التفاعلات الضوئية في الصانعة الخضراء.',
    metaAr: 'تركيب ضوئي · تفاعلات ضوئية',
  },
  subduction: {
    imageSrc: '/assets/images/schemas/domaine3_tectonique/schema_16_subduction.svg',
    altAr: 'وثيقة تبين غوص صفيحة محيطية تحت صفيحة طافية وتولد النشاط البركاني.',
    metaAr: 'تكتونية · ظاهرة الغوص',
  },
  seismic_waves: {
    imageSrc: '/assets/images/schemas/domaine3_tectonique/schema_14_ondes.svg',
    altAr: 'وثيقة تبين انتشار الموجات الزلزالية وكيف تكشف بنية باطن الأرض.',
    metaAr: 'جيولوجيا · أمواج زلزالية',
  },
};



const DOMAIN_PAGE_VISUALS: Record<string, LessonVisualMeta> = {
  'التخصص الوظيفي للبروتينات': {
    imageSrc: '/assets/images/schemas/domaine1_proteines/schema_10_intro_spider.svg',
    altAr: 'صورة حديثة تمثل مدخل تركيب البروتين عبر خيط العنكبوت.',
    metaAr: 'بروتينات · من المورثة إلى الوظيفة',
  },
  'التحولات الطاقوية': {
    imageSrc: '/assets/images/schemas/domaine2_energie/schema_09_photosynthese.svg',
    altAr: 'صورة تمثل الصانعة الخضراء وتحويل الطاقة الضوئية.',
    metaAr: 'طاقة · تركيب ضوئي وتنفس',
  },
  'التكتونية العامة': {
    imageSrc: '/assets/images/schemas/domaine3_tectonique/schema_16_subduction.svg',
    altAr: 'صورة تمثل غوص صفيحة تكتونية ونشاطاً جيولوجياً.',
    metaAr: 'أرض · صفائح وبنيات عميقة',
  },
};

const UNIT_PAGE_VISUALS: Record<number, LessonVisualMeta> = {
  1: {
    imageSrc: '/assets/images/schemas/domaine1_proteines/schema_35_unit1_big_picture_modern.jpg',
    altAr: 'خريطة بصرية حديثة تلخص الانتقال من المورثة إلى البروتين الوظيفي.',
    metaAr: 'الوحدة 1 · تركيب البروتين',
  },
  2: {
    imageSrc: '/assets/images/schemas/domaine1_proteines/schema_40_hemoglobin_structure_function_modern.svg',
    altAr: 'صورة حديثة تربط بين بنية الهيموغلوبين ووظيفة البروتين.',
    metaAr: 'الوحدة 2 · بنية ووظيفة',
  },
  3: {
    imageSrc: '/assets/images/schemas/domaine1_proteines/schema_07_enzyme.svg',
    altAr: 'صورة حديثة مبسطة للإنزيم وموقعه الفعال.',
    metaAr: 'الوحدة 3 · نشاط إنزيمي',
  },
  4: {
    imageSrc: '/assets/images/schemas/domaine1_proteines/schema_80_immunity_big_picture_modern.svg',
    altAr: 'خريطة حديثة تلخص التعرف المناعي والاستجابة والذاكرة.',
    metaAr: 'الوحدة 4 · المناعة',
  },
  5: {
    imageSrc: '/assets/images/schemas/domaine1_proteines/schema_30_ligand_gated_channel_modern_ar.svg',
    altAr: 'صورة حديثة تبين قناة مرتبطة بربيطة على الغشاء بعد المشبكي.',
    metaAr: 'الوحدة 5 · اتصال عصبي',
  },
  6: {
    imageSrc: '/assets/images/schemas/domaine2_energie/schema_09_photosynthese.svg',
    altAr: 'صورة تمثل مقر التفاعلات الضوئية في الصانعة الخضراء.',
    metaAr: 'الوحدة 6 · تركيب ضوئي',
  },
  7: {
    imageSrc: '/assets/images/schemas/domaine2_energie/schema_10_respiration.svg',
    altAr: 'صورة تمثل التنفس الخلوي داخل الميتوكندري.',
    metaAr: 'الوحدة 7 · تنفس وتخمر',
  },
  8: {
    imageSrc: '/assets/images/schemas/domaine2_energie/schema_12_bilan_energetique.svg',
    altAr: 'صورة تمثل الحصيلة الطاقوية ومسارات إنتاج ATP.',
    metaAr: 'الوحدة 8 · حصيلة طاقوية',
  },
  9: {
    imageSrc: '/assets/images/schemas/domaine3_tectonique/schema_16_subduction.svg',
    altAr: 'صورة تمثل النشاط التكتوني للصفائح والغوص.',
    metaAr: 'الوحدة 9 · نشاط الصفائح',
  },
  10: {
    imageSrc: '/assets/images/schemas/domaine3_tectonique/schema_14_ondes.svg',
    altAr: 'صورة تمثل الموجات الزلزالية وبنية الأرض الداخلية.',
    metaAr: 'الوحدة 10 · بنية الأرض',
  },
  11: {
    imageSrc: '/assets/images/schemas/domaine3_tectonique/schema_17_collision.svg',
    altAr: 'صورة تمثل التصادم القاري وتشكّل البنيات الجيولوجية.',
    metaAr: 'الوحدة 11 · بنيات جيولوجية',
  },
};

const ACTIVE_UNIT_LESSONS_BY_UNIT: Partial<Record<number, string[]>> = {
  1: ['d1-u1-l1-expression-genique', 'd1-u1-l2-transcription', 'd1-u1-l3-traduction'],
  2: ['protein_structure_function'],
  3: ['d1-u3-l1-enzyme'],
  4: ['immunity_self_nonself', 'immunity_humoral_response', 'immunity_cellular_response', 'immunity_memory_response'],
  5: ['synapse'],
  6: ['phase11_chapitres_21_22'],
  9: ['subduction'],
  10: ['seismic_waves'],
};

const LEGACY_LESSON_VISUAL_OVERRIDES: Record<string, LessonVisualMeta> = {
  phase1_chapitres_1_2: {
    imageSrc: '/assets/images/schemas/domaine1_proteines/schema_10_intro_spider.svg',
    altAr: 'صورة حديثة تمهيدية تربط سؤال تركيب البروتين بخيط العنكبوت.',
    metaAr: 'مكتسبات وبداية تركيب البروتين',
  },
  lecon_transcription: {
    imageSrc: '/assets/images/schemas/domaine1_proteines/schema_17_transcription_bubble_modern.svg',
    altAr: 'وثيقة حديثة تبين فقاعة الاستنساخ وعمل ARN بوليمراز.',
    metaAr: 'الاستنساخ · من ADN إلى ARNm',
  },
  phase2_chapitres_3_4: {
    imageSrc: '/assets/images/schemas/domaine1_proteines/schema_24_polysome_translation_modern.svg',
    altAr: 'وثيقة حديثة تبين الترجمة ومتعدد الريبوزوم على نفس ARNm.',
    metaAr: 'الترجمة · قراءة الرسالة',
  },
  phase3_chapitres_5_6: {
    imageSrc: '/assets/images/schemas/domaine1_proteines/schema_40_hemoglobin_structure_function_modern.svg',
    altAr: 'وثيقة حديثة تربط بين طفرة الهيموغلوبين وبنية البروتين ووظيفته.',
    metaAr: 'بنية البروتين ↔ الوظيفة',
  },
  phase4_chapitres_7_8: {
    imageSrc: '/assets/images/schemas/domaine1_proteines/schema_07_enzyme.svg',
    altAr: 'وثيقة حديثة مبسطة للإنزيم وموقعه الفعال.',
    metaAr: 'نشاط إنزيمي · شروط الفعالية',
  },
  phase5_chapitres_9_10: {
    imageSrc: '/assets/images/schemas/domaine1_proteines/schema_58_hla_I_II_structure_modern.svg',
    altAr: 'وثيقة حديثة تبين HLA وCMH كمحددات للهوية المناعية.',
    metaAr: 'مناعة · الذات واللاذات',
  },
  phase6_chapitres_11_12: {
    imageSrc: '/assets/images/schemas/domaine1_proteines/schema_63_antigen_antibody_complex_modern.svg',
    altAr: 'وثيقة حديثة تبين تشكل المعقد المناعي في الاستجابة الخلطية.',
    metaAr: 'مناعة · استجابة خلطية',
  },
  phase7_chapitres_13_14: {
    imageSrc: '/assets/images/schemas/domaine1_proteines/schema_70_tcr_cmh_target_modern.svg',
    altAr: 'وثيقة حديثة تبين التعرف النوعي في الاستجابة الخلوية.',
    metaAr: 'مناعة · استجابة خلوية',
  },
  phase8_chapitres_15_16: {
    imageSrc: '/assets/images/schemas/domaine1_proteines/schema_30_ligand_gated_channel_modern_ar.svg',
    altAr: 'وثيقة حديثة تبين قناة غشائية ودور البروتينات في الاتصال العصبي.',
    metaAr: 'عصب · كمون الراحة والسيالة',
  },
  phase9_chapitres_17_18: {
    imageSrc: '/assets/images/schemas/domaine1_proteines/schema_30_ligand_gated_channel_modern_ar.svg',
    altAr: 'وثيقة حديثة تبين استقبال المبلغ العصبي على الغشاء بعد المشبكي.',
    metaAr: 'عصب · النقل المشبكي',
  },
  phase10_chapitres_19_20: {
    imageSrc: '/assets/images/schemas/domaine1_proteines/schema_30_ligand_gated_channel_modern_ar.svg',
    altAr: 'وثيقة حديثة مرتبطة بالبروتينات الغشائية التي تضبط النقل المشبكي.',
    metaAr: 'عصب · تنظيم الرسالة المشبكية',
  },
  phase11_chapitres_21_22: {
    imageSrc: '/assets/images/schemas/domaine2_energie/schema_09_photosynthese.svg',
    altAr: 'وثيقة تمثل الصانعة الخضراء ومقر التفاعلات الضوئية.',
    metaAr: 'تركيب ضوئي · مرحلة ضوئية',
  },
  phase12_chapitres_23_24: {
    imageSrc: '/assets/images/schemas/domaine2_energie/schema_09_photosynthese.svg',
    altAr: 'وثيقة تمثل الصانعة الخضراء وتكامل مراحل التركيب الضوئي.',
    metaAr: 'تركيب ضوئي · حلقة كالفن',
  },
  phase13_chapitres_25_26: {
    imageSrc: '/assets/images/schemas/domaine2_energie/schema_10_respiration.svg',
    altAr: 'وثيقة تمثل التنفس الخلوي ومسارات إنتاج الطاقة.',
    metaAr: 'طاقة · تحلل سكري وكريبس',
  },
  phase14_chapitres_27_28: {
    imageSrc: '/assets/images/schemas/domaine2_energie/schema_10_respiration.svg',
    altAr: 'وثيقة تمثل التنفس الخلوي والتخمر داخل الخلية.',
    metaAr: 'طاقة · سلسلة تنفسية',
  },
  phase15_chapitres_29_30: {
    imageSrc: '/assets/images/schemas/domaine2_energie/schema_12_bilan_energetique.svg',
    altAr: 'وثيقة تمثل الحصيلة الطاقوية وتكامل التركيب الضوئي والتنفس.',
    metaAr: 'طاقة · حصيلة شاملة',
  },
  phase16_chapitres_31_32: {
    imageSrc: '/assets/images/schemas/domaine3_tectonique/schema_16_subduction.svg',
    altAr: 'وثيقة تمثل حركة الصفائح وحدود النشاط التكتوني.',
    metaAr: 'تكتونية · حدود الصفائح',
  },
  phase17_chapitres_33_34: {
    imageSrc: '/assets/images/schemas/domaine3_tectonique/schema_16_subduction.svg',
    altAr: 'وثيقة تمثل ظاهرة الغوص والشواهد الجيوفيزيائية المرتبطة بها.',
    metaAr: 'تكتونية · الغوص',
  },
  phase18_chapitres_35_36: {
    imageSrc: '/assets/images/schemas/domaine3_tectonique/schema_16_subduction.svg',
    altAr: 'وثيقة تمثل النشاط الداخلي للأرض وعلاقته بحركة الصفائح.',
    metaAr: 'تكتونية · طاقة داخلية',
  },
  phase19_chapitres_37_38: {
    imageSrc: '/assets/images/schemas/domaine3_tectonique/schema_14_ondes.svg',
    altAr: 'وثيقة تمثل انتشار الموجات الزلزالية داخل الأرض.',
    metaAr: 'جيولوجيا · موجات زلزالية',
  },
  phase20_chapitres_39_40: {
    imageSrc: '/assets/images/schemas/domaine3_tectonique/schema_14_ondes.svg',
    altAr: 'وثيقة تمثل طبقات الأرض وخصائصها الفيزيائية.',
    metaAr: 'جيولوجيا · نمذجة باطن الأرض',
  },
  phase21_chapitres_41_42: {
    imageSrc: '/assets/images/schemas/domaine3_tectonique/schema_17_collision.svg',
    altAr: 'وثيقة تمثل تصادم الصفائح وتكوّن البنيات الجيولوجية.',
    metaAr: 'جيولوجيا · مغمايتية وتصادم',
  },
  phase22_chapitres_43_44: {
    imageSrc: '/assets/images/schemas/domaine3_tectonique/schema_17_collision.svg',
    altAr: 'وثيقة تمثل الدورة الصخرية والبنيات الجيولوجية الكبرى.',
    metaAr: 'جيولوجيا · دورة الصخور',
  },
};

function stripLessonVariantSuffix(key: string): string {
  return key.replace(/_\d+$/, '');
}

function resolveLegacyLessonVisual(lesson: LessonLibraryItem): LessonVisualMeta | undefined {
  return (
    LEGACY_LESSON_VISUAL_OVERRIDES[lesson.key]
    ?? LEGACY_LESSON_VISUAL_OVERRIDES[stripLessonVariantSuffix(lesson.key)]
    ?? UNIT_PAGE_VISUALS[lesson.unitId]
  );
}

// Strips the leading global "الدرس N :" or "الوحدة N :" prefix so the lesson shows a single, clean title.
function cleanLessonTitle(title: string): string {
  // We keep the "الدرس X :" part because the user wants strictly the book format
  return title.trim();
}

export default function LessonsView({ units, progress, onStartLesson, validatedUnits, onLockedUnitClick, teacherOverride }: LessonsViewProps) {
  const isFirstSessions = progress && progress.xp <= 150;

  // Only keep units that actually contain lessons.
  const unitsWithLessons = useMemo(
    () => units.filter((unit) => LESSON_LIBRARY.some((lesson) => lesson.unitId === unit.id)),
    [units]
  );

  // Build the 3 domains (preserving their natural order) → units.
  const domains = useMemo(() => {
    const ordered: string[] = [];
    const byDomain = new Map<string, Unit[]>();
    for (const unit of unitsWithLessons) {
      if (!byDomain.has(unit.domain)) {
        byDomain.set(unit.domain, []);
        ordered.push(unit.domain);
      }
      byDomain.get(unit.domain)!.push(unit);
    }
    return ordered.map((name) => ({ name, units: byDomain.get(name)! }));
  }, [unitsWithLessons]);

  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const [selectedUnitId, setSelectedUnitId] = useState<number | null>(null);
  const [selectedLessonKey, setSelectedLessonKey] = useState<string>('');
  const [openLessonKey, setOpenLessonKey] = useState<string | null>(null);
  const [showSvt, setShowSvt] = useState(false);

  const domainUnits = useMemo(
    () => (selectedDomain ? unitsWithLessons.filter((u) => u.domain === selectedDomain) : []),
    [selectedDomain, unitsWithLessons]
  );

  const lessonsForUnit = useMemo(
    () => (selectedUnitId ? LESSON_LIBRARY.filter((lesson) => lesson.unitId === selectedUnitId) : []),
    [selectedUnitId]
  );

  // Order lessons by their chapter number. Lessons that keep the original title expose
  // "الدرس N"; split sub-lessons (e.g. "كيف تكونت قمة إيفرست") have no number, so we place
  // them just after the preceding numbered chapter to preserve the real chapter sequence.
  const sortedLessonsForUnit = useMemo(() => {
    let lastNum = 0;
    const withKeys = lessonsForUnit.map((lesson) => {
      const m = lesson.titleAr.match(/الدرس\s+(\d+)/);
      let key: number;
      if (m) {
        key = Number(m[1]);
        lastNum = key;
      } else {
        key = lastNum + 0.5;
      }
      return { lesson, key };
    });
    return withKeys.sort((a, b) => a.key - b.key).map((x) => x.lesson);
  }, [lessonsForUnit]);

  useEffect(() => {
    const currentStillVisible = lessonsForUnit.some((lesson) => lesson.key === selectedLessonKey);
    if (!currentStillVisible && lessonsForUnit[0]) {
      setSelectedLessonKey(lessonsForUnit[0].key);
    }
  }, [lessonsForUnit, selectedLessonKey]);

  const selectedLesson: LessonLibraryItem | undefined =
    LESSON_LIBRARY.find((lesson) => lesson.key === selectedLessonKey) || lessonsForUnit[0];

  

  const activeLessonsForSelectedUnit = useMemo(() => {
    if (!selectedUnitId) return [];
    const lessonIds = ACTIVE_UNIT_LESSONS_BY_UNIT[selectedUnitId] ?? [];
    return lessonIds
      .map((lessonId) => {
        const lesson = ACTIVE_LESSONS[lessonId];
        const visual = LESSON_PAGE_VISUAL_OVERRIDES[lessonId] ?? UNIT_PAGE_VISUALS[selectedUnitId];
        if (!lesson || !visual) return null;
        return {
          lessonId,
          title: cleanLessonTitle(lesson.title),
          imageSrc: visual.imageSrc,
          altAr: visual.altAr,
          metaAr: visual.metaAr,
        };
      })
      .filter((card): card is { lessonId: string; title: string; imageSrc: string; altAr: string; metaAr: string } => Boolean(card));
  }, [selectedUnitId]);

  const selectedUnit = unitsWithLessons.find((u) => u.id === selectedUnitId) || null;
  const domainInfo = selectedDomain ? DOMAIN_INFO[selectedDomain] ?? DEFAULT_DOMAIN_INFO : DEFAULT_DOMAIN_INFO;


  const unifiedLessons = useMemo(() => {
    if (!selectedUnitId) return [];

    const sequence = OFFICIAL_PROGRAM_SEQUENCE[selectedUnitId];
    if (!sequence) {
      return [
         ...activeLessonsForSelectedUnit.map(a => ({ ...a, type: 'active' as const, key: a.lessonId })),
         ...sortedLessonsForUnit.map(l => {
            const visual = resolveLegacyLessonVisual(l);
            return {
              key: l.key,
              type: 'legacy' as const,
              title: cleanLessonTitle(l.titleAr),
              imageSrc: visual?.imageSrc ?? '',
              altAr: visual?.altAr ?? '',
              metaAr: visual?.metaAr ?? ''
            };
         })
      ];
    }

    return sequence.map(key => {
       const active = ACTIVE_LESSONS[key];
       if (active) {
         const visual = LESSON_PAGE_VISUAL_OVERRIDES[key] ?? UNIT_PAGE_VISUALS[selectedUnitId];
         return {
           key,
           type: 'active' as const,
           title: cleanLessonTitle(active.title ?? key),
           imageSrc: visual?.imageSrc ?? '',
           altAr: visual?.altAr ?? '',
           metaAr: visual?.metaAr ?? ''
         };
       } else {
         const legacy = lessonsForUnit.find(l => l.key === key);
         if (legacy) {
           const visual = resolveLegacyLessonVisual(legacy);
           return {
             key,
             type: 'legacy' as const,
             title: cleanLessonTitle(legacy.titleAr),
             imageSrc: visual?.imageSrc ?? '',
             altAr: visual?.altAr ?? '',
             metaAr: visual?.metaAr ?? ''
           };
         }
       }
       return null;
    }).filter(Boolean) as { key: string; type: 'active'|'legacy'; title: string; imageSrc: string; altAr: string; metaAr: string }[];
  }, [selectedUnitId, activeLessonsForSelectedUnit, sortedLessonsForUnit, lessonsForUnit]);

  const goToDomain = (domain: string) => {
    setSelectedDomain(domain);
    setSelectedUnitId(null);
    setOpenLessonKey(null);
  };

  const goToUnit = (unitId: number) => {
    setSelectedUnitId(unitId);
    setOpenLessonKey(null);
  };

  const backToDomains = () => {
    setSelectedDomain(null);
    setSelectedUnitId(null);
    setOpenLessonKey(null);
  };

  const backToUnits = () => {
    setSelectedUnitId(null);
    setOpenLessonKey(null);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6 pb-24 font-sans" dir="rtl">
      <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-1">الدروس</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        درس تفاعلي بدون تمرير: كلمة مفتاحية → مثال → اختبار → منهجية
      </p>

      {/* Breadcrumb navigation (visible uniquement à l'intérieur d'un domaine) */}
      {(selectedDomain || showSvt) && (
        <nav className="flex items-center gap-2 flex-wrap text-sm mb-4">
          <button
            onClick={() => { backToDomains(); setShowSvt(false); }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer text-[#006d37] dark:text-[#2ecc71] hover:bg-[#fed65b]/15"
          >
            <ChevronRight className="w-4 h-4" />
            <span>المجالات</span>
          </button>
          {selectedDomain && (
            <>
              <ChevronRight className="w-4 h-4 opacity-40" />
              <button
                onClick={backToUnits}
                disabled={!selectedUnitId}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  selectedUnitId
                    ? 'text-[#006d37] dark:text-[#2ecc71] hover:bg-[#fed65b]/15'
                    : 'text-[#1f1c0b] dark:text-gray-100 opacity-70'
                }`}
              >
                {selectedDomain}
              </button>
            </>
          )}
          {selectedUnit && (
            <>
              <ChevronRight className="w-4 h-4 opacity-40" />
              <span className="px-3 py-1.5 rounded-xl font-bold text-[#1f1c0b] dark:text-gray-100 opacity-90">{selectedUnit.title}</span>
            </>
          )}
        </nav>
      )}

      {/* LEVEL 1 — Grille d'icônes rondes : 3 domaines + Concepts SVT */}
      {!selectedDomain && !showSvt && (
        <>
          <section className="grid grid-cols-2 gap-3">
            {domains.map((domain, idx) => {
              const info = DOMAIN_INFO[domain.name] ?? DEFAULT_DOMAIN_INFO;
              const Icon = info.icon;
              const visual = DOMAIN_PAGE_VISUALS[domain.name];
              const unitCount = domain.units.length;
              const chapterCount = domain.units.reduce(
                (acc, u) => acc + LESSON_LIBRARY.filter((l) => l.unitId === u.id).length,
                0
              );
              return (
                <motion.article
                  key={domain.name}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.06 }}
                  className={`relative rounded-3xl shadow-sm border bg-white dark:bg-[#141916] overflow-hidden ${
                    isFirstSessions && idx === 0 ? 'border-[#ff9a4a] ring-2 ring-[#ff9a4a]/40 shadow-[0_0_15px_rgba(255,154,74,0.2)]' : 'border-gray-200 dark:border-gray-800'
                  }`}
                >
                  {isFirstSessions && idx === 0 && (
                    <div className="absolute top-0 right-0 z-10 px-3 py-1 bg-gradient-to-r from-[#ffb347] to-[#ff9a4a] text-white text-[10px] font-black rounded-bl-xl shadow-md animate-pulse">
                      ابدأ بدروس هذا المجال
                    </div>
                  )}
                  
                  <div className="flex flex-col items-center text-center gap-3 p-6">
                    <span
                      className="w-20 h-20 rounded-full flex items-center justify-center text-white shadow-md"
                      style={{ background: `linear-gradient(135deg, ${info.color}, ${info.color}cc)` }}
                    >
                      <Icon className="w-9 h-9" />
                    </span>
                    <div>
                      <div className="text-[11px] font-black" style={{ color: info.color }}>{visual?.metaAr ?? info.fr}</div>
                      <h3 className="text-base font-black text-[#1f1c0b] dark:text-gray-100 leading-snug mt-1">{domain.name}</h3>
                      <p className="text-[11px] text-[#506072] dark:text-gray-400 mt-1">{info.fr}</p>
                    </div>
                    <span className="text-[11px] font-bold text-gray-400">
                      {unitCount} وحدة · {chapterCount} درس
                    </span>
                    <button
                      onClick={() => goToDomain(domain.name)}
                      className="w-full py-3 rounded-2xl bg-[#006d37] hover:bg-[#00562b] text-white font-black text-sm shadow-sm cursor-pointer"
                    >
                      افتح المجال ←
                    </button>
                  </div>
                </motion.article>
              );
            })}

            {/* 4e icône — Concepts SVT */}
            <motion.button
              key="svt-concepts"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: domains.length * 0.06 }}
              onClick={() => setShowSvt(true)}
              className="flex flex-col items-center text-center gap-3 rounded-3xl p-6 shadow-sm border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#141916] hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] transition-all cursor-pointer"
            >
              <span
                className="w-20 h-20 rounded-full flex items-center justify-center text-white shadow-md"
                style={{ background: 'linear-gradient(135deg, #0284c7, #0284c7cc)' }}
              >
                <BookOpen className="w-9 h-9" />
              </span>
              <div>
                <h3 className="text-base font-black text-[#1f1c0b] dark:text-gray-100 leading-snug">مكتبة المصطلحات SVT</h3>
                <p className="text-[11px] text-[#506072] dark:text-gray-400 mt-1">Concepts SVT</p>
              </div>
              <span className="text-[11px] font-bold text-gray-400">استكشف المفاهيم</span>
            </motion.button>
          </section>
        </>
      )}

      {/* LEVEL 1b — Concepts SVT library */}
      {!selectedDomain && showSvt && (
        <section>
          <SvtConceptsView />
        </section>
      )}

      {/* LEVEL 2 — Units of the selected domain */}
      {selectedDomain && !selectedUnitId && (
        <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {domainUnits.map((unit, idx) => {
            const info = DOMAIN_INFO[selectedDomain] ?? DEFAULT_DOMAIN_INFO;
            const visual = UNIT_PAGE_VISUALS[unit.id];
            const chapterCount = LESSON_LIBRARY.filter((l) => l.unitId === unit.id).length;
            // V3 — Gating : unité verrouillée = grisée + cadenas + Coach au clic
            // (sauf en mode professeur). Les unités déjà débloquées restent ouvertes.
            const gated = unit.isLocked && !teacherOverride;
            const validated = validatedUnits?.includes(unit.id) ?? false;
            const handleUnitOpen = () => {
              if (gated) {
                if (onLockedUnitClick) onLockedUnitClick(unit);
                return;
              }
              goToUnit(unit.id);
            };
            return (
              <motion.article
                key={unit.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`group text-right rounded-3xl shadow-sm border border-[#e2dabf]/60 dark:border-[#2ecc71]/10 bg-white dark:bg-[#141916] transition-all overflow-hidden flex flex-col ${gated ? 'opacity-70 grayscale-[0.5]' : 'hover:shadow-md'}`}
                style={{ borderTop: `4px solid ${info.color}` }}
                data-testid={`lessons-unit-card-${unit.id}`}
                data-gated={gated ? 'true' : 'false'}
              >
                
                <div className="p-5 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span
                      className="text-[11px] font-black px-3 py-1 rounded-full"
                      style={{ background: info.light, color: info.color }}
                    >
                      الوحدة {idx + 1}
                    </span>
                    {validated && <span className="text-[10px] font-bold text-[#006d37] dark:text-[#2ecc71]">✅ متقنة</span>}
                    {!validated && gated && <span className="text-[10px] font-bold text-amber-600">🔒 مغلقة</span>}
                  </div>
                  <div>
                    <div className="text-[11px] font-black" style={{ color: info.color }}>{visual?.metaAr ?? unit.description}</div>
                    <h3 className="text-lg font-black text-[#1f1c0b] dark:text-gray-100 leading-snug mt-1">{unit.title}</h3>
                    <p className="text-xs text-[#506072] dark:text-gray-400 mt-1 leading-6">{unit.description}</p>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="flex items-center gap-1 text-[11px] font-bold text-[#504441] dark:text-gray-300">
                      <BookOpen className="w-3.5 h-3.5" style={{ color: info.color }} />
                      {chapterCount} درس
                    </span>
                    {unit.progress > 0 && (
                      <span className="text-[11px] font-bold" style={{ color: info.color }}>{unit.progress}%</span>
                    )}
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-[#e2dabf]/50 dark:bg-white/10 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${unit.progress}%`, background: info.color }} />
                  </div>
                  {gated && (
                    <p className="text-[10px] font-bold text-amber-700 dark:text-amber-400 leading-5">
                      {getLockedUnitHintAr(units, unit)}
                    </p>
                  )}
                  <button
                    onClick={handleUnitOpen}
                    className={`w-full py-3 rounded-2xl font-black text-sm shadow-sm cursor-pointer ${
                      gated
                        ? 'bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                        : 'bg-[#006d37] hover:bg-[#00562b] text-white'
                    }`}
                  >
                    {gated ? '🔒 افتح بعد إتقان الوحدة السابقة' : 'افتح الوحدة ←'}
                  </button>
                </div>
              </motion.article>
            );
          })}
        </section>
      )}

      {/* LEVEL 3 — Lessons of the selected unit */}
      {selectedUnitId && (
        <div className="grid gap-4 lg:grid-cols-[280px_1fr] lg:gap-5 items-start">
          <aside className="bg-white dark:bg-[#141916] border border-[#e2dabf]/60 dark:border-[#2ecc71]/10 rounded-[28px] sm:rounded-3xl p-3 sm:p-4 shadow-sm space-y-3 sm:space-y-4 lg:sticky lg:top-24 lg:max-h-[calc(100vh-120px)] lg:overflow-y-auto" style={{ ['--dc']: domainInfo.color, ['--dl']: domainInfo.light } as any}>
            <div className="rounded-2xl border border-[#e2dabf]/50 dark:border-white/10 bg-[#fffdf8] dark:bg-[#101613] p-3 sm:p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-black text-[#1f1c0b] dark:text-gray-100 mb-1 flex items-center gap-2 text-sm sm:text-base">
                    <BookOpen className="w-4 h-4 text-[#006d37] dark:text-[#2ecc71] shrink-0" />
                    <span>دروس الوحدة</span>
                  </h3>
                  <p className="text-[10px] sm:text-[11px] text-[#506072] dark:text-gray-400 leading-5 sm:leading-6">
                    حسب التدرج الرسمي لوزارة التربية الوطنية.
                  </p>
                </div>
                <span className="shrink-0 inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-black text-white" style={{ background: domainInfo.color }}>
                  {unifiedLessons.length} دروس
                </span>
              </div>
            </div>

            <section className="space-y-2.5 rounded-2xl bg-transparent">
              {unifiedLessons.map((lesson) => {
                const isSelected = selectedLesson?.key === lesson.key || openLessonKey === lesson.key;
                return (
                  <article
                    key={lesson.key}
                    className={`rounded-2xl sm:rounded-3xl border p-2.5 sm:p-3 shadow-sm transition-all ${
                      isSelected
                        ? 'bg-[var(--dl)] border-[var(--dc)] ring-1 ring-[var(--dc)]/15'
                        : 'bg-white dark:bg-[#1a211c] border-[#e2dabf]/50 dark:border-white/10 hover:border-[#006d37]/40'
                    }`}
                  >
                    <div className="flex items-start gap-2.5 sm:gap-3">
                      
                      <div className="min-w-0 flex-1 flex flex-col gap-2">
                        <div>
                          <div className="flex flex-wrap items-center gap-1.5 mb-1">
                            
                            
                            {isSelected && (
                              <span className="inline-flex items-center rounded-full bg-[var(--dc)]/10 px-2 py-0.5 text-[9px] sm:text-[10px] font-black text-[var(--dc)]">
                                محدد الآن
                              </span>
                            )}
                          </div>
                          <div className="text-[9px] sm:text-[10px] font-black mb-1" style={{ color: domainInfo.color }}>{lesson.metaAr}</div>
                          <h5 className={`text-[11px] sm:text-xs leading-5 sm:leading-6 max-h-10 sm:max-h-12 overflow-hidden ${isSelected ? 'font-black text-[var(--dc)] dark:text-[var(--dc)]' : 'font-bold text-[#504441] dark:text-gray-200'}`}>
                            {lesson.title}
                          </h5>
                        </div>
                        <button
                          onClick={() => {
                            if (lesson.type === 'active') {
                              onStartLesson(lesson.key);
                            } else {
                              setSelectedLessonKey(lesson.key); 
                              setOpenLessonKey(lesson.key);
                            }
                          }}
                          className={`w-full py-2 sm:py-2.5 rounded-xl sm:rounded-2xl text-[11px] sm:text-xs font-black shadow-sm transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[var(--dc)] text-white hover:brightness-95'
                              : 'bg-white dark:bg-[#101613] border border-[#e2dabf]/60 dark:border-white/10 text-[#1f1c0b] dark:text-gray-100 hover:bg-[var(--dl)]'
                          }`}
                        >
                          افتح هذا الدرس ←
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </section>
          </aside>

          <main className="space-y-0 min-w-0">
            {openLessonKey ? (
              <Suspense fallback={<div className="p-10 text-center text-sm font-bold">تحميل الدرس التفاعلي...</div>}>
                {SINGLE_PATH_LESSONS[openLessonKey] ? (
                  <InteractiveLessonView lessonId={openLessonKey} onClose={() => setOpenLessonKey(null)} />
                ) : (
                   <HtmlLessonViewer
                    lessonKey={openLessonKey}
                    onClose={() => setOpenLessonKey(null)}
                    onNextLesson={(nextKey) => setOpenLessonKey(nextKey)}
                  />
                )}
              </Suspense>
            ) : (
              <div className="p-10 text-center text-sm text-[#506072] bg-white dark:bg-[#141916] rounded-3xl border border-[#e2dabf]/60 dark:border-[#2ecc71]/10">اختر درسا من القائمة</div>
            )}
          </main>
        </div>
      )}
    </div>
  );
}
