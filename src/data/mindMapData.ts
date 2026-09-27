export interface MindMapNode {
  id: string;
  label: string;
  category: 'core' | 'process' | 'molecule' | 'organelle' | 'rule' | 'condition' | 'outcome';
  unitId: number;
  unitTitle: string;
  summary: string;
  bacTip: string;
  keywords: string[];
  level: number; // 0 = root, 1 = main branch, 2 = sub-branch, 3 = detail
  color?: string;
  radius?: number;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

export interface MindMapLink {
  source: string | MindMapNode;
  target: string | MindMapNode;
  relation: string; // e.g. "يتطلب", "ينتج", "يحدث في", "يرتبط بـ", "يحفز"
  type?: 'primary' | 'secondary' | 'inhibitory' | 'catalytic';
}

export interface MindMapData {
  unitId: number;
  unitTitle: string;
  domain: string;
  rootId: string;
  nodes: MindMapNode[];
  links: MindMapLink[];
}

export const MIND_MAPS_DATABASE: Record<number, MindMapData> = {
  // الوحدة 1: آليات تركيب البروتين
  1: {
    unitId: 1,
    unitTitle: "آليات تركيب البروتين",
    domain: "المجال الأول: التخصص الوظيفي للبروتينات",
    rootId: "node-u1-root",
    nodes: [
      {
        id: "node-u1-root",
        label: "تركيب البروتين",
        category: "core",
        unitId: 1,
        unitTitle: "آليات تركيب البروتين",
        summary: "الظاهرة الحيوية الأساسية التي تقوم فيها الخلية بالتعبير المورثي عن المعلومة الوراثية المحمولة في الـ ADN لإنتاج سلاسل ببتيدية متخصصة وظيفياً.",
        bacTip: "في البكالوريا، تذكر دائماً أن التعبير المورثي يمر بمرحلتين رئيسيتين متعاقبتين زمنياً ومكانياً: الاستنساخ في النواة والترجمة في الهيولى.",
        keywords: ["تعبير مورثي", "ADN", "ARNm", "بروتين", "استنساخ", "ترجمة"],
        level: 0,
        color: "#006d37",
        radius: 38
      },
      // فرع الاستنساخ
      {
        id: "node-u1-transcription",
        label: "الاستنساخ (Transcription)",
        category: "process",
        unitId: 1,
        unitTitle: "آليات تركيب البروتين",
        summary: "المرحلة الأولى من التعبير المورثي، تحدث في النواة عند حقيقيات النوى، يتم خلالها تحويل الرسالة الوراثية المشفرة في الـ ADN إلى جزيء وسيط هو ARNm.",
        bacTip: "ركز على اتجاه القراءة من 3' إلى 5' للسلسلة المستنسخة، واتجاه تركيب ARNm الجديد من 5' إلى 3'.",
        keywords: ["نواة", "ADN", "ARNm", "سلسلة مستنسخة", "سلسلة غير مستنسخة"],
        level: 1,
        color: "#0284c7",
        radius: 28
      },
      {
        id: "node-u1-nucleus",
        label: "النواة (مقر الاستنساخ)",
        category: "organelle",
        unitId: 1,
        unitTitle: "آليات تركيب البروتين",
        summary: "العضية الحاوية على المادة الوراثية (ADN)، حيث تحدث فيها عملية الاستنساخ ثم يهاجر ARNm عبر الثقوب النووية إلى الهيولى.",
        bacTip: "مقر الاستنساخ هو النواة عند حقيقيات النوى، أما عند بدائيات النوى فيحدث في الهيولى مباشرة لتزامن الاستنساخ والترجمة.",
        keywords: ["غلاف نووي", "ثقوب نووية", "عصارة نووية"],
        level: 2,
        color: "#0284c7",
        radius: 22
      },
      {
        id: "node-u1-rna-polymerase",
        label: "إنزيم ARN بوليميراز",
        category: "molecule",
        unitId: 1,
        unitTitle: "آليات تركيب البروتين",
        summary: "الإنزيم النوعي المسؤول عن فك الروابط الهيدروجينية بين سلسلتي الـ ADN وقراءة السلسلة المستنسخة وربط النيوكليوتيدات الريبية الحرة بالتكامل.",
        bacTip: "مادة ألفا-أمانيتين (α-amanitine) تثبط هذا الإنزيم نوعياً وتوقف الاستنساخ في التمارين التجريبية.",
        keywords: ["إنزيم", "بلمرة", "تكامل القواعد", "تثبيط"],
        level: 2,
        color: "#0284c7",
        radius: 24
      },
      {
        id: "node-u1-mrna",
        label: "الرسول الوراثي (ARNm)",
        category: "molecule",
        unitId: 1,
        unitTitle: "آليات تركيب البروتين",
        summary: "جزيء أحادي السلسلة ناتج عن الاستنساخ، ينقل الشفرة الوراثية من النواة إلى الهيولى. يتركب من ريبوز منقوص الأكسجين وقواعد (A, U, C, G) وفوسفات.",
        bacTip: "يتميز ARNm بالقاعدة الآزوتية المميزة اليوراسيل (U) بدلاً من الثايمين (T)، ووجود سكر الريبوز التام C5H10O5.",
        keywords: ["يوراسيل", "سكر ريبوز", "أحادي السلسلة", "كودونات"],
        level: 2,
        color: "#0ea5e9",
        radius: 24
      },
      {
        id: "node-u1-transcription-steps",
        label: "مراحل الاستنساخ",
        category: "process",
        unitId: 1,
        unitTitle: "آليات تركيب البروتين",
        summary: "ثلاث خطوات ديناميكية متسلسلة: الانطلاق (البداية)، الاستطالة (الامتداد)، والنهاية (انفصال الإنزيم وتحرير جزيء ARNm المتشكل).",
        bacTip: "في أسئلة الوصف أو النصوص العلمية، يجب ذكر الشروط والإنزيم والاتجاه في كل مرحلة بدقة.",
        keywords: ["انطلاق", "استطالة", "نهاية", "تحرير"],
        level: 3,
        color: "#38bdf8",
        radius: 20
      },

      // فرع تنشيط الأحماض الأمينية
      {
        id: "node-u1-activation",
        label: "تنشيط الأحماض الأمينية",
        category: "process",
        unitId: 1,
        unitTitle: "آليات تركيب البروتين",
        summary: "عملية كيميائية حيوية في الهيولى يتم فيها ربط كل حمض أميني بجزيء ARNt النوعي الخاص به برابطة طاقوية، تمهيداً للترجمة.",
        bacTip: "تتطلب عملية التنشيط 4 عناصر: حمض أميني، ARNt نوعي، إنزيم التنشيط Aminoacyl-tRNA Synthetase، وطاقة ATP.",
        keywords: ["Aminoacyl-tRNA", "طاقة ATP", "إنزيم نوعي", "ربط استري"],
        level: 1,
        color: "#d97706",
        radius: 27
      },
      {
        id: "node-u1-trna",
        label: "الناقل (ARNt)",
        category: "molecule",
        unitId: 1,
        unitTitle: "آليات تركيب البروتين",
        summary: "جزيء ريبي ناقل يتميز ببنية ورقة النفل ثلاثية الأبعاد، يحتوي موقعين نوعيين: موقع تثبيت الحمض الأميني (في النهاية 3' CCA) وموقع الرامزة المضادة.",
        bacTip: "الرامزة المضادة (Anti-codon) هي المحددة لتكامل ARNt مع رامزة ARNm في الريبوزوم.",
        keywords: ["ورقة النفل", "موقع التثبيت", "رامزة مضادة", "CCA"],
        level: 2,
        color: "#d97706",
        radius: 22
      },
      {
        id: "node-u1-activation-enzyme",
        label: "إنزيم التنشيط النوعي",
        category: "molecule",
        unitId: 1,
        unitTitle: "آليات تركيب البروتين",
        summary: "إنزيم يتميز بموقعي تثبيت نوعيين: موقع خاص بالحمض الأميني وموقع خاص بـ ARNt الموافق، ويعمل بوجود طاقة ATP المحلأة إلى AMP + PPi.",
        bacTip: "يمثل الإنزيم الدقة المزدوجة للترجمة: التعرف على الحمض الأميني والتعرف على ARNt الخاص به.",
        keywords: ["تكامل بنيوي", "نوعية مزدوجة", "ATP", "إماهة"],
        level: 2,
        color: "#f59e0b",
        radius: 22
      },

      // فرع الترجمة
      {
        id: "node-u1-translation",
        label: "الترجمة (Translation)",
        category: "process",
        unitId: 1,
        unitTitle: "آليات تركيب البروتين",
        summary: "تحويل الشفرة الوراثية المكتوبة بلغة نووية (تتابع نيوكليوتيدات ARNm) إلى لغة بروتينية (تتابع أحماض أمينية في السلسلة الببتيدية).",
        bacTip: "تجري الترجمة في الهيولى وتمر بثلاث مراحل: الانطلاق، الاستطالة، النهاية.",
        keywords: ["ريبوزوم", "لغة بروتينية", "كودونات", "رابطة ببتيدية"],
        level: 1,
        color: "#16a34a",
        radius: 28
      },
      {
        id: "node-u1-ribosome",
        label: "الريبوزوم (العضية المحركة)",
        category: "organelle",
        unitId: 1,
        unitTitle: "آليات تركيب البروتين",
        summary: "عضية خلوية مجهرية تتكون من تحت وحدتين: صغرى (تحوي موقع قراءة ARNm) وكبرى (تحوي موقعين تحفيزيين P و A لتشكل الروابط الببتيدية).",
        bacTip: "الموقع P (Peptidyl) مخصص لتثبيت معقد الانطلاق والسلسلة النامية، والموقع A (Aminoacyl) مخصص لاستقبال الحمض الأميني الجديد.",
        keywords: ["تحت وحدة صغرى", "تحت وحدة كبرى", "موقع P", "موقع A", "ARNr"],
        level: 2,
        color: "#16a34a",
        radius: 25
      },
      {
        id: "node-u1-genetic-code",
        label: "الشفرة الوراثية (Genetic Code)",
        category: "rule",
        unitId: 1,
        unitTitle: "آليات تركيب البروتين",
        summary: "نظام التوافق بين الرامزات الثلاثية للأحماض النووية والأحماض الأمينية (64 رامزة: 61 تشفر لـ 20 حمضاً أمينياً و 3 رامزات توقف).",
        bacTip: "رامزة الانطلاق هي دائماً AUG وتشفر للميثيونين (Met). رامزات التوقف (UAA, UAG, UGA) لا تشفر لأي حمض أميني.",
        keywords: ["AUG", "رامزة توقف", "ترادف الشفرة", "شمولية"],
        level: 2,
        color: "#10b981",
        radius: 22
      },
      {
        id: "node-u1-polysome",
        label: "البوليزوم (Polysome)",
        category: "organelle",
        unitId: 1,
        unitTitle: "آليات تركيب البروتين",
        summary: "تجمع عدة ريبوزومات على نفس جزيء ARNm، يسمح بتركيب كميات معتبرة ومكثفة من نفس السلسلة الببتيدية في زمن قياسي.",
        bacTip: "يحدد اتجاه حركة الريبوزومات على ARNm حسب طول السلاسل الببتيدية النامية (من الأقصر إلى الأطول = من 5' إلى 3').",
        keywords: ["قراءة متزامنة", "مردودية عالية", "سلاسل نامية"],
        level: 2,
        color: "#059669",
        radius: 22
      },
      {
        id: "node-u1-translation-steps",
        label: "مراحل الترجمة (انطلاق - استطالة - نهاية)",
        category: "process",
        unitId: 1,
        unitTitle: "آليات تركيب البروتين",
        summary: "تشكل معقد الانطلاق، ثم انتقال الريبوزوم خطوة بخطوة وإضافة الأحماض بروابط ببتيدية، وصولاً لرامزة التوقف وفصل الببتيد وميثيونين البداية.",
        bacTip: "يتم قص حمض الميثيونين الأول نوعياً بواسطة إنزيم خاص في نهاية الترجمة ليصبح البروتين ناضجاً.",
        keywords: ["معقد الانطلاق", "إزاحة الريبوزوم", "قص الميثيونين", "تحرر الببتيد"],
        level: 3,
        color: "#34d399",
        radius: 20
      },
      {
        id: "node-u1-protein-output",
        label: "السلسلة الببتيدية المتشكلة",
        category: "outcome",
        unitId: 1,
        unitTitle: "آليات تركيب البروتين",
        summary: "الناتج النهائي للتعبير المورثي، تهاجر إلى تجويف الشبكة الهيولية وجهاز غولجي لاكتساب بنيتها الفراغية الثلاثية الأبعاد والتخصص الوظيفي.",
        bacTip: "تكتسب السلسلة وظيفتها فقط بعد اكتساب بنية فراغية مستقرة ومحددة بدقة.",
        keywords: ["بنية أولية", "نضج البروتين", "جهاز غولجي", "وظيفة حيوية"],
        level: 1,
        color: "#8b5cf6",
        radius: 26
      }
    ],
    links: [
      { source: "node-u1-root", target: "node-u1-transcription", relation: "المرحلة الأولى", type: "primary" },
      { source: "node-u1-root", target: "node-u1-activation", relation: "المرحلة التحضيرية", type: "primary" },
      { source: "node-u1-root", target: "node-u1-translation", relation: "المرحلة الثانية", type: "primary" },
      { source: "node-u1-transcription", target: "node-u1-nucleus", relation: "يحدث داخل", type: "primary" },
      { source: "node-u1-transcription", target: "node-u1-rna-polymerase", relation: "يتم بواسطة", type: "catalytic" },
      { source: "node-u1-transcription", target: "node-u1-mrna", relation: "ينتج عنه", type: "primary" },
      { source: "node-u1-transcription", target: "node-u1-transcription-steps", relation: "يتكون من", type: "secondary" },
      { source: "node-u1-activation", target: "node-u1-trna", relation: "يربط الحمض بـ", type: "primary" },
      { source: "node-u1-activation", target: "node-u1-activation-enzyme", relation: "يحفزه", type: "catalytic" },
      { source: "node-u1-mrna", target: "node-u1-translation", relation: "يحمل القالب لـ", type: "primary" },
      { source: "node-u1-trna", target: "node-u1-translation", relation: "ينقل الأحماض لـ", type: "primary" },
      { source: "node-u1-translation", target: "node-u1-ribosome", relation: "يتم على مستوى", type: "primary" },
      { source: "node-u1-translation", target: "node-u1-genetic-code", relation: "يخضع لقواعد", type: "secondary" },
      { source: "node-u1-translation", target: "node-u1-polysome", relation: "يتكثف عبر", type: "secondary" },
      { source: "node-u1-translation", target: "node-u1-translation-steps", relation: "يمر عبر", type: "secondary" },
      { source: "node-u1-translation", target: "node-u1-protein-output", relation: "ينتج عنه مباشرة", type: "primary" }
    ]
  },

  // الوحدة 2: العلاقة بين بنية ووظيفة البروتين
  2: {
    unitId: 2,
    unitTitle: "العلاقة بين بنية ووظيفة البروتين",
    domain: "المجال الأول: التخصص الوظيفي للبروتينات",
    rootId: "node-u2-root",
    nodes: [
      {
        id: "node-u2-root",
        label: "بنية ووظيفة البروتين",
        category: "core",
        unitId: 2,
        unitTitle: "العلاقة بين بنية ووظيفة البروتين",
        summary: "تتوقف الوظيفة الحيوية للبروتين على بنيته الفراغية المحددة وراثياً بنوع وعدد وترتيب الأحماض الأمينية والروابط الكيميائية الناشئة بين جذورها.",
        bacTip: "أي تغير في تتابع الأحماض الأمينية (طفرة) أو تفكك الروابط الكيميائية يؤدي إلى تغير أو فقدان البنية الفراغية وبالتالي فقدان التخصص الوظيفي.",
        keywords: ["بنية فراغية", "تخصص وظيفي", "أحماض أمينية", "روابط كيميائية", "خاصية حمقلية"],
        level: 0,
        color: "#006d37",
        radius: 38
      },
      {
        id: "node-u2-amino-acid-structure",
        label: "بنية الحمض الأميني العامة",
        category: "molecule",
        unitId: 2,
        unitTitle: "العلاقة بين بنية ووظيفة البروتين",
        summary: "يتركب من كربون ألفا مركزي (Cα) متصل بـ: وظيفة أمينية (-NH2)، وظيفة كربوكسيلية حمضية (-COOH)، ذرة هيدروجين (-H)، وجذر متغير (R).",
        bacTip: "الجذر (R) هو المسؤول عن تنوع وتصنيف الأحماض الأمينية (حمضية، قاعدية، متعادلة كارهة أو محبة للماء، كبريتية).",
        keywords: ["Cα", "وظيفة أمينية", "وظيفة حمضية", "جذر R"],
        level: 1,
        color: "#3b82f6",
        radius: 27
      },
      {
        id: "node-u2-amphoteric",
        label: "السلوك الأمفوتيري (الحمقلي)",
        category: "rule",
        unitId: 2,
        unitTitle: "العلاقة بين بنية ووظيفة البروتين",
        summary: "قدرة الحمض الأميني على السلوك كحمض (فقدان H+) في الأوساط القاعدية، أو السلوك كقاعدة (اكتساب H+) في الأوساط الحمضية.",
        bacTip: "المعادلة الذهبية: pH > pHi (شحنة سالبة -> مصعد +)، pH < pHi (شحنة موجبة -> مهبط -)، pH = pHi (شحنة معدومة -> لا هجرة).",
        keywords: ["خاصية حمقلية", "تأين", "شحنة إجمالية", "هجرة كهربائية"],
        level: 1,
        color: "#8b5cf6",
        radius: 28
      },
      {
        id: "node-u2-phi",
        label: "نقطة التعادل الكهربائي (pHi)",
        category: "condition",
        unitId: 2,
        unitTitle: "العلاقة بين بنية ووظيفة البروتين",
        summary: "درجة حموضة الوسط التي تكون عندها الشحنة الإجمالية للحمض الأميني أو البروتين معدومة (Zwitterion)، فيتساوى عدد الشحنات الموجبة والسالبة.",
        bacTip: "عند pHi يترسب البروتين أو يبقى في منتصف شريط الهجرة الكهربائية لانعدام حركته في الحقل الكهربائي.",
        keywords: ["Zwitterion", "شحنة صفرية", "ترسيب", "استقرار كهربائي"],
        level: 2,
        color: "#a855f7",
        radius: 23
      },
      {
        id: "node-u2-structural-levels",
        label: "مستويات البنية الفراغية",
        category: "process",
        unitId: 2,
        unitTitle: "العلاقة بين بنية ووظيفة البروتين",
        summary: "تتدرج البنية من البسيطة إلى المعقدة: أولية (خطية)، ثانوية (حلزون α أو صفائح β)، ثالثية (بنية ثلاثية الأبعاد مستقرة)، ورابعية (تجمع عدة تحت وحدات).",
        bacTip: "البنية الثالثية هي الحد الأدنى لاكتساب النشاط الوظيفي لأغلب البروتينات الفردية، وتتميز بوجود مناطق انعطاف.",
        keywords: ["بنية أولية", "بنية ثانوية", "بنية ثالثية", "بنية رابعية", "مناطق انعطاف"],
        level: 1,
        color: "#ec4899",
        radius: 28
      },
      {
        id: "node-u2-chemical-bonds",
        label: "الروابط الكيميائية الحافظة للبنية",
        category: "molecule",
        unitId: 2,
        unitTitle: "العلاقة بين بنية ووظيفة البروتين",
        summary: "أربعة أصناف من الروابط تنشأ بين الجذور R المتقاربة فراغياً: روابط شاردية (بين -NH3+ و -COO-)، روابط كبريتية (بين Cys)، روابط هيدروجينية، وتجاذب الجذور الكارهة للماء.",
        bacTip: "الجسر الكبريتي (Pont disulfure) هو الرابطة التساهمية الوحيدة في البنية الثالثية وهو الأشد مقاومة للحرارة.",
        keywords: ["جسر كبريتي", "رابطة شاردية", "رابطة هيدروجينية", "كارهة للماء"],
        level: 2,
        color: "#f43f5e",
        radius: 25
      },
      {
        id: "node-u2-peptide-bond",
        label: "الرابطة الببتيدية (-CO-NH-)",
        category: "molecule",
        unitId: 2,
        unitTitle: "العلاقة بين بنية ووظيفة البروتين",
        summary: "رابطة تساهمية قوية تربط الوظيفة الحمضية لحمض أميني بالوظيفة الأمينية للحمض الموالي مع تحرير جزيء ماء (H2O).",
        bacTip: "عدد الروابط الببتيدية في سلسلة = عدد الأحماض الأمينية - 1 = عدد جزيئات الماء المتحررة.",
        keywords: ["تكاثف", "تحرير ماء", "رابطة تساهمية", "سلسلة ببتيدية"],
        level: 2,
        color: "#3b82f6",
        radius: 22
      },
      {
        id: "node-u2-ph-temp-factors",
        label: "تأثير الـ pH والحرارة",
        category: "condition",
        unitId: 2,
        unitTitle: "العلاقة بين بنية ووظيفة البروتين",
        summary: "الحرارة المرتفعة تكسر الروابط الهيدروجينية والشاردية (تخريب غير عكوس). تغير الـ pH يغير الحالة الأيونية للجذور R مما يفكك الروابط الشاردية.",
        bacTip: "في التمارين، الحرارة المنخفضة تثبط البروتين عكوساً، بينما الحرارة المرتفعة والـ pH المتطرف يخربان الموقع الفعال نهائياً.",
        keywords: ["تخريب البروتين", "تفكك الروابط", "عكوسية", "الموقع الفعال"],
        level: 2,
        color: "#e11d48",
        radius: 23
      }
    ],
    links: [
      { source: "node-u2-root", target: "node-u2-amino-acid-structure", relation: "الوحدة الأساسية", type: "primary" },
      { source: "node-u2-root", target: "node-u2-amphoteric", relation: "الخاصية الكيميائية", type: "primary" },
      { source: "node-u2-root", target: "node-u2-structural-levels", relation: "المستويات الفراغية", type: "primary" },
      { source: "node-u2-amino-acid-structure", target: "node-u2-peptide-bond", relation: "يشكل روابط", type: "primary" },
      { source: "node-u2-amphoteric", target: "node-u2-phi", relation: "يتحدد وفق", type: "primary" },
      { source: "node-u2-structural-levels", target: "node-u2-chemical-bonds", relation: "تستقر بفضل", type: "primary" },
      { source: "node-u2-chemical-bonds", target: "node-u2-ph-temp-factors", relation: "تتأثر بـ", type: "secondary" },
      { source: "node-u2-amphoteric", target: "node-u2-ph-temp-factors", relation: "يرتبط بـ", type: "secondary" }
    ]
  },

  // الوحدة 3: دور البروتينات في الدفاع عن الذات (المناعة)
  3: {
    unitId: 3,
    unitTitle: "دور البروتينات في الدفاع عن الذات",
    domain: "المجال الأول: التخصص الوظيفي للبروتينات",
    rootId: "node-u3-root",
    nodes: [
      {
        id: "node-u3-root",
        label: "المناعة والدفاع عن الذات",
        category: "core",
        unitId: 3,
        unitTitle: "دور البروتينات في الدفاع عن الذات",
        summary: "منظومة دفاعية خلوية وجزيئية تتدخل فيها بروتينات متخصصة للتمييز بين مكونات الذات والقضاء الانتقائي على عناصر اللاذات.",
        bacTip: "تعتمد المناعة النوعية على مسارين متكاملين: الخلطي (أجسام مضادة ضد المستضدات الحرة) والخلوي (خلايا LTc ضد الخلايا المصابة والسرطانية).",
        keywords: ["ذات ولاذات", "MHC", "استجابة خلطية", "استجابة خلوية", "أجسام مضادة", "تعاون مناعي"],
        level: 0,
        color: "#006d37",
        radius: 38
      },
      {
        id: "node-u3-self-non-self",
        label: "التمييز بين الذات واللاذات",
        category: "rule",
        unitId: 3,
        unitTitle: "دور البروتينات في الدفاع عن الذات",
        summary: "قدرة الجهاز المناعي على التعرف على خلايا الجسم الخاصة عبر محددات سطحية غشائية وراثية ومهاجمة أي جسم غريب (مستضد).",
        bacTip: "الذات = مجموع الجزيئات المحددة وراثياً والخاصة بالفرد (CMH / زمر دموية)، اللاذات = كل جزيء غريب يثير استجابة مناعية.",
        keywords: ["مستضد", "محدد المستضد", "تسامح مناعي", "مولد الضد"],
        level: 1,
        color: "#0284c7",
        radius: 27
      },
      {
        id: "node-u3-mhc",
        label: "معقد التوافق النسيجي (CMH / HLA)",
        category: "molecule",
        unitId: 3,
        unitTitle: "دور البروتينات في الدفاع عن الذات",
        summary: "بروتينات غشائية سكرية مشفرة بـ 4 مورثات متعددة الأليلات (A, B, C, DP, DQ, DR) بدون سيادة، مما يجعل لكل فرد هوية بيولوجية فريدة.",
        bacTip: "CMH-I يوجد على جميع الخلايا ذات النواة ويعرض ببتيد مستضدي لـ LT8 (CD8). CMH-II يوجد على الخلايا العارضة (CPA) ويعرض لـ LT4 (CD4).",
        keywords: ["CMH-I", "CMH-II", "تعدد الأليلات", "غياب السيادة", "ببتيد مستضدي"],
        level: 2,
        color: "#0284c7",
        radius: 25
      },
      {
        id: "node-u3-humoral",
        label: "الاستجابة المناعية الخلطية",
        category: "process",
        unitId: 3,
        unitTitle: "دور البروتينات في الدفاع عن الذات",
        summary: "مسار مناعي نوعي يتم بانتقاء خلايا LB الحاملة لمستقبلات BCR، ثم تكاثرها وتمايزها إلى خلايا بلازمية مفرزة لأجسام مضادة سارية في السوائل.",
        bacTip: "تستهدف المستضدات السائلة، البكتيريا خارج خلوية، والسموم (التوكسينات).",
        keywords: ["لمفاويات LB", "خلايا بلازمية", "أجسام مضادة", "BCR", "معقد مناعي"],
        level: 1,
        color: "#f59e0b",
        radius: 28
      },
      {
        id: "node-u3-antibody",
        label: "الجسم المضاد (Immunoglobulin)",
        category: "molecule",
        unitId: 3,
        unitTitle: "دور البروتينات في الدفاع عن الذات",
        summary: "بروتين سكري غلوبوليني بشكل حرف Y، يتكون من 4 سلاسل ببتيدية (سلسلتين ثقيلتين H وسلسلتين خفيفتين L) ترتبط بجسور كبريتية، ويحوي موقعين لتثبيت المستضد.",
        bacTip: "الموقع المتغير في الجسم المضاد يضمن النوعية التامة، والموقع الثابت يضمن التثبت على البالعات وتفعيل المتمم.",
        keywords: ["سلاسل H و L", "منطقة متغيرة", "منطقة ثابتة", "تكامل بنيوي"],
        level: 2,
        color: "#f59e0b",
        radius: 24
      },
      {
        id: "node-u3-cellular",
        label: "الاستجابة المناعية الخلوية",
        category: "process",
        unitId: 3,
        unitTitle: "دور البروتينات في الدفاع عن الذات",
        summary: "مسار مناعي نوعي يستهدف الخلايا المصابة بفيروسات والخلايا السرطانية والطعم المرفوض بواسطة الخلايا اللمفاوية السامة LTc.",
        bacTip: "تتطلب تعرفاً مزدوجاً بواسطة TCR على [CMH-I + ببتيد مستضدي] بمساعدة مؤشر CD8.",
        keywords: ["لمفاويات LT8", "خلايا LTc", "TCR", "CD8", "صدمة حلولية"],
        level: 1,
        color: "#dc2626",
        radius: 28
      },
      {
        id: "node-u3-perforin",
        label: "البيرفورين والغرونزيم (آلية الإقصاء)",
        category: "molecule",
        unitId: 3,
        unitTitle: "دور البروتينات في الدفاع عن الذات",
        summary: "بروتينات سامة تفرزها LTc عند التماس بالخلية المستهدفة، حيث يثقب البيرفورين الغشاء بتشكيل قنوات حلولية ويدخل الغرانزيم لتحفيز التحلل النووي.",
        bacTip: "البيرفورين = قنوات غشائية وصدمة حلولية. الغرانزيم = تنشيط إنزيمات الموت الخلوي المبرمج (Apoptosis).",
        keywords: ["قنوات حلولية", "دخول الماء والشوارد", "موت مبرمج", "إفراز حلولي"],
        level: 2,
        color: "#ef4444",
        radius: 24
      },
      {
        id: "node-u3-cooperation",
        label: "التعاون المناعي والإنترلوكين (IL-2)",
        category: "process",
        unitId: 3,
        unitTitle: "دور البروتينات في الدفاع عن الذات",
        summary: "تنشيط الخلايا المساعدة LT4 بعد تعرفها على المستضد المعروض مع CMH-II بواسطة TCR ومؤشر CD4، وإفرازها لـ IL-2 المحفز لتكاثر وتمايز LB و LT8.",
        bacTip: "الـ LT4 هي قاطرة ومفتاح الجهاز المناعي، واستهدافها بواسطة فيروس السيدا (VIH) يؤدي إلى انهيار تام للمناعة الخلطية والخلوية.",
        keywords: ["LT4 / LTh", "إنترلوكين 2", "تحفيز ذاتي", "CPA", "سيدا VIH"],
        level: 1,
        color: "#8b5cf6",
        radius: 27
      },
      // ── Branche « coopération cellulaire » ajoutée 2026-09 (audit U4) ──
      {
        id: "node-u3-cpa",
        label: "الخلية العارضة للمستضد (CPA)",
        category: "process",
        unitId: 3,
        unitTitle: "دور البروتينات في الدفاع عن الذات",
        summary: "البلعمية الكبيرة أو الخلية العاصرة التي تبلع المستضد، تهضمه جزئياً ثم تعرض محدده على سطحها مرفقاً بجزيئة CMH-II.",
        bacTip: "لا تبدأ أي استجابة نوعية قبل مرحلة العرض: اذكر دائماً «تبلعم ⇐ عرض المحدد مع CMH-II» قبل الحديث عن اللمفاويات.",
        keywords: ["بلعمية كبيرة", "CPA", "عرض المستضد", "CMH-II"],
        level: 2,
        color: "#8b5cf6",
        radius: 24
      },
      {
        id: "node-u3-immune-synapse",
        label: "المشبك المناعي والتعرف المزدوج",
        category: "process",
        unitId: 3,
        unitTitle: "دور البروتينات في الدفاع عن الذات",
        summary: "التماس بين مستقبل اللمفاوية TCR والمحدد المعروض مع جزيئة CMH: تعرف مزدوج يضمن نوعية الاستجابة (المحدد + الذات).",
        bacTip: "التعرف مزدوج: المستضد + CMH. إهمال أحد الطرفين يفقدك نقطة النوعية في سؤال «فسّر نوعية الاستجابة».",
        keywords: ["TCR", "CD4", "CD8", "تعرف مزدوج", "نوعية"],
        level: 2,
        color: "#8b5cf6",
        radius: 23
      },
      {
        id: "node-u3-il2",
        label: "الإنترلوكين 2 (IL-2)",
        category: "molecule",
        unitId: 3,
        unitTitle: "دور البروتينات في الدفاع عن الذات",
        summary: "بلّغ كيميائي (وسيط بروتيني) تفرزه اللمفاويات LT4 المنشطة؛ يثبت على مستقبلات نوعية فيحفز التكاثر النسيلي والتمايز.",
        bacTip: "الإنترلوكين ليس جسماً مضاداً ولا يرتبط بالمستضد: إنه إشارة تحفيز. في التجارب، إضافته تعوض غياب LT4.",
        keywords: ["إنترلوكين 2", "بلّغ كيميائي", "مستقبل نوعي", "تحفيز"],
        level: 2,
        color: "#a855f7",
        radius: 24
      },
      {
        id: "node-u3-clonal-selection",
        label: "الانتقاء والتكاثر النسيلي",
        category: "process",
        unitId: 3,
        unitTitle: "دور البروتينات في الدفاع عن الذات",
        summary: "انتقاء اللمفاوية ذات المستقبل المكمل للمحدد فقط، ثم تكاثرها إلى نسيلة من خلايا متماثلة قبل التمايز.",
        bacTip: "اربط النوعية بالانتقاء: من بين ملايين اللمفاويات تُنتقى نسيلة واحدة. هذا مفتاح تعليل «استجابة نوعية».",
        keywords: ["انتقاء نسيلي", "نسيلة", "تكاثر", "نوعية المستقبل"],
        level: 2,
        color: "#8b5cf6",
        radius: 24
      },
      {
        id: "node-u3-plasmocyte",
        label: "الخلية البلازمية (المنفِّذ الخلطي)",
        category: "outcome",
        unitId: 3,
        unitTitle: "دور البروتينات في الدفاع عن الذات",
        summary: "لمفاوية B متمايزة ذات شبكة هيولية داخلية فاحمة متطورة، متخصصة في تركيب وإفراز الأجسام المضادة النوعية.",
        bacTip: "في الصور الإلكترونية: تطور الشبكة الهيولية وجهاز غولجي دليل على خلية مفرزة ⇐ خلية بلازمية لا لمفاوية بكر.",
        keywords: ["خلية بلازمية", "شبكة هيولية", "إفراز", "أجسام مضادة"],
        level: 3,
        color: "#10b981",
        radius: 22
      },
      {
        id: "node-u3-ltc",
        label: "اللمفاوية السامة LTc (المنفِّذ الخلوي)",
        category: "outcome",
        unitId: 3,
        unitTitle: "دور البروتينات في الدفاع عن الذات",
        summary: "لمفاوية T8 متمايزة بعد تحفيز الإنترلوكين؛ تتعرف على الخلية المصابة عبر CMH-I وتحدث حلها بإفراز البرفورين.",
        bacTip: "التمييز المطلوب في التصحيح: LT4 تُنسّق ولا تقتل، أما LTc فهي وحدها التي تُحدث الحل الخلوي.",
        keywords: ["LT8", "LTc", "CMH-I", "حل خلوي", "برفورين"],
        level: 3,
        color: "#ef4444",
        radius: 23
      },
      {
        id: "node-u3-memory",
        label: "خلايا الذاكرة والاستجابة الثانوية",
        category: "outcome",
        unitId: 3,
        unitTitle: "دور البروتينات في الدفاع عن الذات",
        summary: "خلايا طويلة البقاء تنشأ من النسيلة المنتقاة؛ تختصر زمن الكمون وترفع شدة الاستجابة عند التماس الثاني، وهو مبدأ التلقيح.",
        bacTip: "منحنى الاستجابة الثانوية: كمون أقصر + ذروة أعلى + أجسام مضادة من نمط IgG. علّل دائماً بخلايا الذاكرة.",
        keywords: ["خلايا ذاكرة", "استجابة ثانوية", "زمن الكمون", "التلقيح"],
        level: 2,
        color: "#f59e0b",
        radius: 24
      }
    ],
    links: [
      { source: "node-u3-root", target: "node-u3-self-non-self", relation: "القاعدة الأساسية", type: "primary" },
      { source: "node-u3-self-non-self", target: "node-u3-mhc", relation: "يتحدد بواسطة", type: "primary" },
      { source: "node-u3-root", target: "node-u3-humoral", relation: "المسار الخلطي", type: "primary" },
      { source: "node-u3-humoral", target: "node-u3-antibody", relation: "تنتج وتفرز", type: "primary" },
      { source: "node-u3-root", target: "node-u3-cellular", relation: "المسار الخلوي", type: "primary" },
      { source: "node-u3-cellular", target: "node-u3-perforin", relation: "تتدخل عبر", type: "primary" },
      { source: "node-u3-root", target: "node-u3-cooperation", relation: "ينسقه ويحفزه", type: "primary" },
      { source: "node-u3-cooperation", target: "node-u3-humoral", relation: "يحفز تكاثر وتمايز", type: "catalytic" },
      { source: "node-u3-cooperation", target: "node-u3-cellular", relation: "يحفز تكاثر وتمايز", type: "catalytic" },
      { source: "node-u3-root", target: "node-u3-cpa", relation: "ينطلق من", type: "primary" },
      { source: "node-u3-cpa", target: "node-u3-immune-synapse", relation: "يعرض المحدد عبر", type: "primary" },
      { source: "node-u3-immune-synapse", target: "node-u3-cooperation", relation: "ينشّط", type: "primary" },
      { source: "node-u3-cooperation", target: "node-u3-il2", relation: "تفرز", type: "primary" },
      { source: "node-u3-il2", target: "node-u3-clonal-selection", relation: "يحفز", type: "catalytic" },
      { source: "node-u3-clonal-selection", target: "node-u3-plasmocyte", relation: "تمايز خلطي", type: "primary" },
      { source: "node-u3-clonal-selection", target: "node-u3-ltc", relation: "تمايز خلوي", type: "primary" },
      { source: "node-u3-clonal-selection", target: "node-u3-memory", relation: "يُبقي", type: "secondary" },
      { source: "node-u3-plasmocyte", target: "node-u3-antibody", relation: "تفرز", type: "primary" },
      { source: "node-u3-ltc", target: "node-u3-perforin", relation: "تفرز", type: "primary" },
      { source: "node-u3-mhc", target: "node-u3-immune-synapse", relation: "شرط التعرف", type: "secondary" }
    ]
  },
  // الوحدة 3: النشاط الإنزيمي للبروتينات
  // Item 16 de l'audit (@MostafaBdd : carte mentale U3 = 565 K vues contre 73 K
  // pour le cours de la même unité) — l'entrée attendue sur les enzymes est
  // synthétique, et elle doit porter le comparatif inhibiteur compétitif /
  // non compétitif, priorité n°1 du plan de renforcement.
  4: {
    unitId: 3,
    unitTitle: "النشاط الإنزيمي للبروتينات",
    domain: "المجال الأول: التخصص الوظيفي للبروتينات",
    rootId: "node-enz-root",
    nodes: [
      {
        id: "node-enz-root",
        label: "النشاط الإنزيمي",
        category: "core",
        unitId: 3,
        unitTitle: "النشاط الإنزيمي للبروتينات",
        summary: "الإنزيم بروتين متخصص يعمل كوسيط حيوي يسرّع التفاعلات الكيميائية في الخلية دون أن يُستهلك، بفضل موقعه الفعال المكمل بنيوياً للركيزة.",
        bacTip: "كل سؤال في الوحدة 3 يعود إلى جملة واحدة : النوعية والسرعة ناتجتان عن التكامل البنيوي بين الموقع الفعال والركيزة.",
        keywords: ["إنزيم", "وسيط حيوي", "تسريع", "موقع فعال"],
        level: 0,
        color: "#006d37",
        radius: 38
      },
      {
        id: "node-enz-protein-nature",
        label: "الطبيعة البروتينية للإنزيم",
        category: "molecule",
        unitId: 3,
        unitTitle: "النشاط الإنزيمي للبروتينات",
        summary: "الإنزيم جزيئة بروتينية ذات بنية فراغية ثالثية أو رابعية ؛ تحدد البنية الأولية (تتابع الأحماض الأمينية) شكل موقعه الفعال.",
        bacTip: "كل عامل يخرب البنية الفراغية (حرارة مرتفعة، pH متطرف، طفرة) يعطل النشاط الإنزيمي : اربط دائماً بالوحدة 2.",
        keywords: ["بنية ثالثية", "أحماض أمينية", "تخريب", "طفرة"],
        level: 1,
        color: "#3b82f6",
        radius: 27
      },
      {
        id: "node-enz-active-site",
        label: "الموقع الفعال",
        category: "organelle",
        unitId: 3,
        unitTitle: "النشاط الإنزيمي للبروتينات",
        summary: "منطقة صغيرة من الإنزيم تتكون من أحماض أمينية متباعدة في السلسلة لكنها متقاربة فراغياً، وتضم موقع تثبيت الركيزة وموقع التحفيز.",
        bacTip: "لا تخلط : موقع التثبيت يفسر النوعية تجاه الركيزة، وموقع التحفيز يفسر نوعية التأثير (نوع التفاعل).",
        keywords: ["موقع التثبيت", "موقع التحفيز", "تقارب فراغي"],
        level: 1,
        color: "#8b5cf6",
        radius: 29
      },
      {
        id: "node-enz-specificity",
        label: "النوعية المزدوجة",
        category: "rule",
        unitId: 3,
        unitTitle: "النشاط الإنزيمي للبروتينات",
        summary: "للإنزيم نوعيتان : نوعية تجاه الركيزة (لا يثبت إلا الجزيئة المكملة لموقعه) ونوعية تجاه التفاعل (لا يحفز إلا نوعاً واحداً من التحول).",
        bacTip: "في تمارين الوثائق : إذا اختفت ركيزة واحدة من بين عدة ركائز فالسؤال يخص نوعية الركيزة، وإذا تغير نوع الناتج فهو نوعية التأثير.",
        keywords: ["نوعية الركيزة", "نوعية التأثير", "تكامل بنيوي"],
        level: 2,
        color: "#a855f7",
        radius: 25
      },
      {
        id: "node-enz-es-complex",
        label: "معقد إنزيم-ركيزة",
        category: "process",
        unitId: 3,
        unitTitle: "النشاط الإنزيمي للبروتينات",
        summary: "ترتبط الركيزة مؤقتاً بالموقع الفعال مكوّنة معقداً غير ثابت، يتحول بعده إلى نواتج ثم يتحرر الإنزيم سليماً ليعيد الكرّة.",
        bacTip: "الإنزيم لا يُستهلك : كمية ضئيلة منه تحوّل كمية كبيرة من الركيزة — حجة تُطلب كثيراً في التعليل.",
        keywords: ["معقد ES", "تحرر الإنزيم", "لا يُستهلك"],
        level: 2,
        color: "#ec4899",
        radius: 25
      },
      {
        id: "node-enz-substrate-curve",
        label: "منحنى تركيز الركيزة و التشبع",
        category: "process",
        unitId: 3,
        unitTitle: "النشاط الإنزيمي للبروتينات",
        summary: "تزداد سرعة التفاعل مع تركيز الركيزة ثم تستقر عند قيمة قصوى Vmax : كل المواقع الفعالة أصبحت مشغولة، وهي حالة التشبع.",
        bacTip: "استقرار المنحنى يُعلل بتشبع المواقع الفعالة لا بنفاد الإنزيم ولا بنفاد الركيزة : خطأ متكرر في التصحيح.",
        keywords: ["Vmax", "التشبع", "المواقع الفعالة", "سرعة ابتدائية"],
        level: 1,
        color: "#f59e0b",
        radius: 28
      },
      {
        id: "node-enz-km",
        label: "ثابت ميكاليس Km",
        category: "condition",
        unitId: 3,
        unitTitle: "النشاط الإنزيمي للبروتينات",
        summary: "Km هو تركيز الركيزة الموافق لنصف السرعة القصوى (Vmax/2) ؛ كلما كان Km صغيراً كانت ألفة الإنزيم للركيزة أكبر.",
        bacTip: "قراءة الرسم : Vmax تُقرأ على المستقيم الأفقي، و Km تُسقط من Vmax/2 على محور التراكيز.",
        keywords: ["Km", "Vmax/2", "الألفة"],
        level: 2,
        color: "#f97316",
        radius: 23
      },
      {
        id: "node-enz-temperature",
        label: "تأثير درجة الحرارة",
        category: "condition",
        unitId: 3,
        unitTitle: "النشاط الإنزيمي للبروتينات",
        summary: "يرتفع النشاط مع الحرارة حتى درجة مثلى (حوالي 37°م عند الإنسان) ثم ينهار بسرعة بسبب التخريب غير العكوس للبنية الفراغية.",
        bacTip: "الجانب الصاعد يُفسر بزيادة التصادمات، والجانب النازل بتخريب الموقع الفعال — تعليلان مختلفان في نفس المنحنى.",
        keywords: ["الحرارة المثلى", "تصادمات", "تخريب غير عكوس"],
        level: 2,
        color: "#ef4444",
        radius: 24
      },
      {
        id: "node-enz-ph",
        label: "تأثير درجة الحموضة pH",
        category: "condition",
        unitId: 3,
        unitTitle: "النشاط الإنزيمي للبروتينات",
        summary: "لكل إنزيم pH أمثل يكون عنده النشاط أعظمياً ؛ خارج هذا المجال تتغير الحالة الأيونية لجذور الموقع الفعال فينخفض النشاط.",
        bacTip: "اربط بالوحدة 2 : تغير pH يفكك الروابط الشاردية بين الجذور، فيتشوه الموقع الفعال.",
        keywords: ["pH الأمثل", "روابط شاردية", "تشوه الموقع"],
        level: 2,
        color: "#e11d48",
        radius: 24
      },
      {
        id: "node-enz-competitive",
        label: "المثبط التنافسي",
        category: "rule",
        unitId: 3,
        unitTitle: "النشاط الإنزيمي للبروتينات",
        summary: "جزيئة تشبه الركيزة بنيوياً فتتثبت في الموقع الفعال نفسه وتنافسها عليه ؛ يزول أثرها برفع تركيز الركيزة.",
        bacTip: "العلامة المميزة على المنحنى : Vmax لا تتغير و Km يرتفع — أي أن السرعة القصوى تُبلغ لكن بتركيز ركيزة أكبر.",
        keywords: ["منافسة", "نفس الموقع", "Vmax ثابتة", "Km يرتفع"],
        level: 1,
        color: "#7c3aed",
        radius: 28
      },
      {
        id: "node-enz-noncompetitive",
        label: "المثبط اللاتنافسي",
        category: "rule",
        unitId: 3,
        unitTitle: "النشاط الإنزيمي للبروتينات",
        summary: "جزيئة تتثبت على موقع آخر غير الموقع الفعال (موقع تنظيمي) فتغير البنية الفراغية للإنزيم ويصبح الموقع الفعال غير مكمل للركيزة.",
        bacTip: "العلامة المميزة : Vmax تنخفض ولا يزول الأثر برفع تركيز الركيزة — لأن المنافسة غير ممكنة أصلاً.",
        keywords: ["موقع تنظيمي", "تغير البنية", "Vmax تنخفض"],
        level: 1,
        color: "#0ea5e9",
        radius: 28
      },
      {
        id: "node-enz-inhibition-read",
        label: "قراءة منحنيات التثبيط",
        category: "outcome",
        unitId: 3,
        unitTitle: "النشاط الإنزيمي للبروتينات",
        summary: "المقارنة بين منحنى شاهد ومنحنى مع مثبط تسمح بتحديد نوع التثبيط : هل تغيرت Vmax ؟ هل يزول الأثر بزيادة الركيزة ؟",
        bacTip: "منهجية مضمونة في ثلاث خطوات : أقارن Vmax، ثم أقارن Km، ثم أستنتج نوع المثبط وأعلل بالموقع الذي يتثبت عليه.",
        keywords: ["منحنى شاهد", "مقارنة", "استنتاج نوع المثبط"],
        level: 2,
        color: "#14b8a6",
        radius: 26
      }
    ],
    links: [
      { source: "node-enz-root", target: "node-enz-protein-nature", relation: "طبيعته الكيميائية", type: "primary" },
      { source: "node-enz-root", target: "node-enz-active-site", relation: "يعمل بواسطة", type: "primary" },
      { source: "node-enz-root", target: "node-enz-substrate-curve", relation: "تُقاس فعاليته بـ", type: "primary" },
      { source: "node-enz-root", target: "node-enz-competitive", relation: "يُثبَّط بـ", type: "primary" },
      { source: "node-enz-root", target: "node-enz-noncompetitive", relation: "يُثبَّط بـ", type: "primary" },
      { source: "node-enz-protein-nature", target: "node-enz-active-site", relation: "تحدد شكل", type: "primary" },
      { source: "node-enz-active-site", target: "node-enz-specificity", relation: "يفسر", type: "primary" },
      { source: "node-enz-active-site", target: "node-enz-es-complex", relation: "يثبت الركيزة في", type: "primary" },
      { source: "node-enz-es-complex", target: "node-enz-substrate-curve", relation: "يحدد سرعة", type: "secondary" },
      { source: "node-enz-substrate-curve", target: "node-enz-km", relation: "تُقرأ منه", type: "primary" },
      { source: "node-enz-substrate-curve", target: "node-enz-temperature", relation: "تتأثر بـ", type: "secondary" },
      { source: "node-enz-substrate-curve", target: "node-enz-ph", relation: "تتأثر بـ", type: "secondary" },
      { source: "node-enz-temperature", target: "node-enz-protein-nature", relation: "تخرب", type: "inhibitory" },
      { source: "node-enz-ph", target: "node-enz-active-site", relation: "يشوّه", type: "inhibitory" },
      { source: "node-enz-competitive", target: "node-enz-active-site", relation: "يحتل", type: "inhibitory" },
      { source: "node-enz-noncompetitive", target: "node-enz-protein-nature", relation: "يغير بنيتها", type: "inhibitory" },
      { source: "node-enz-competitive", target: "node-enz-inhibition-read", relation: "يُميَّز بـ", type: "primary" },
      { source: "node-enz-noncompetitive", target: "node-enz-inhibition-read", relation: "يُميَّز بـ", type: "primary" },
      { source: "node-enz-inhibition-read", target: "node-enz-km", relation: "يقارن", type: "secondary" }
    ]
  },
};
