// manhadjiyaModules.ts
// Données de la Formation Manhadjiya Express (Jour 0) — 100% locales, offline-first.
// Contenu aligné programme officiel BAC SVT Algérie (exemples: curare / cobra / caféine).

import type { ValidationRules } from '../utils/validationEngine';

export type Lang = 'ar' | 'fr' | 'bilingual';

/** Une "Loi Kunz El Ouloum" — principe méthodologique fondateur. */
export interface LoiKunz {
  num: number;
  titleAr: string;
  titleFr: string;
  ruleAr: string;
}

/** Un champ à compléter (fill-in-the-blank) déduit du template. */
export interface TemplateSegment {
  type: 'text' | 'blank';
  value: string; // texte statique OU libellé de l'espace à remplir
}

export interface ManhadjiyaModule {
  id: string;
  order: number;
  durationMin: number;
  loi: LoiKunz;
  titleAr: string;
  titleFr: string;
  introAr: string;
  introFr: string;
  checklist: { ar: string; fr: string }[];
  /** Template avec des espaces entre crochets [ ... ] qui deviennent des champs. */
  templateAr: string;
  exampleAr?: string;
  /** Note du correcteur (précision scientifique) affichée en bas du module. */
  noteAr?: string;
  /** Avertissement barème (module test final) — grille d'entraînement non officielle. */
  disclaimerAr?: string;
  disclaimerFr?: string;
  /** Seuil de réussite indicatif /20 (module test final). */
  scoreThreshold?: number;
  validation: ValidationRules;
  xp: number;
}

/** Découpe un template "…[X]…[Y]…" en segments texte/blank. */
export function parseTemplate(template: string): TemplateSegment[] {
  const segments: TemplateSegment[] = [];
  const regex = /\[([^\]]+)\]/g;
  let lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(template)) !== null) {
    if (m.index > lastIndex) {
      segments.push({ type: 'text', value: template.slice(lastIndex, m.index) });
    }
    segments.push({ type: 'blank', value: m[1] });
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < template.length) {
    segments.push({ type: 'text', value: template.slice(lastIndex) });
  }
  return segments;
}

// ─────────────────────────────────────────────────────────────
// Diagnostic initial (5 min) — profil de départ
// ─────────────────────────────────────────────────────────────

export interface DiagnosticOption {
  key: string;
  textAr: string;
  correct?: boolean;
}
export interface DiagnosticQuestion {
  id: string;
  textAr: string;
  textFr: string;
  options: DiagnosticOption[];
  skill: string;
}

export const DIAGNOSTIC_STORAGE_KEY = 'kunz_diagnostic_profile';

export const DIAGNOSTIC_QUESTIONS: DiagnosticQuestion[] = [
  {
    id: 'q1',
    textAr: 'عندما تحلل منحنى، ما هو أول شيء يجب فعله؟',
    textFr: 'En analysant une courbe, quelle est la première étape ?',
    options: [
      { key: 'A', textAr: 'قراءة السؤال فقط', correct: false },
      { key: 'B', textAr: 'تحديد ما يمثله Y بدلالة X مع الوحدات', correct: true },
      { key: 'C', textAr: 'استخراج القيم مباشرة', correct: false },
    ],
    skill: 'identification_document',
  },
  {
    id: 'q2',
    textAr: 'عند صياغة فرضية، أي عبارة صحيحة؟',
    textFr: 'Pour formuler une hypothèse, quelle affirmation est correcte ?',
    options: [
      { key: 'A', textAr: 'ربما يكون السبب هو الإنزيم', correct: false },
      { key: 'B', textAr: 'يعود السبب إلى تثبيط الإنزيم', correct: true },
      { key: 'C', textAr: 'قد يكون هناك تأثير ما', correct: false },
    ],
    skill: 'hypothesis_formulation',
  },
  {
    id: 'q3',
    textAr: 'في الوصف الموضوعي، ما الذي يجب أن يظهر إلزامياً؟',
    textFr: 'Dans une description objective, qu’est-ce qui est obligatoire ?',
    options: [
      { key: 'A', textAr: 'التفسير والسبب', correct: false },
      { key: 'B', textAr: 'القيم مع الوحدات', correct: true },
      { key: 'C', textAr: 'الفرضية النهائية', correct: false },
    ],
    skill: 'description',
  },
  {
    id: 'q4',
    textAr: 'التفسير الجيد للظاهرة يجب أن يغطي:',
    textFr: 'Une bonne interprétation doit couvrir :',
    options: [
      { key: 'A', textAr: 'مستوى واحد فقط', correct: false },
      { key: 'B', textAr: 'المستويات: الجزيئي، الخلوي، الفيزيولوجي', correct: true },
      { key: 'C', textAr: 'المستوى الفيزيولوجي فقط', correct: false },
    ],
    skill: 'interpretation',
  },
  {
    id: 'q5',
    textAr: 'في التركيب (الاستنتاج النهائي)، الجملة الحاسمة تؤكد:',
    textFr: 'Dans la synthèse, la phrase de jugement confirme :',
    options: [
      { key: 'A', textAr: 'صحة الفرضية وتلغي الأخرى', correct: true },
      { key: 'B', textAr: 'الوصف فقط', correct: false },
      { key: 'C', textAr: 'قراءة المنحنى', correct: false },
    ],
    skill: 'synthesis',
  },
];

// ─────────────────────────────────────────────────────────────
// Les 6 micro-modules (5+6+7+7+6+18 = 49 min ≈ 45 min) — fusHa
// ─────────────────────────────────────────────────────────────

export const MANHADJIYA_MODULES: ManhadjiyaModule[] = [
  {
    id: 'module_0_identifier',
    order: 0,
    durationMin: 5,
    loi: {
      num: 0,
      titleAr: 'التعرف أولاً',
      titleFr: "Identifier d'abord — Loi Kunz #0",
      ruleAr: 'عندما ترى وثيقة، لا تبدأ التحليل مباشرة. يجب أن تحدد ما هي: نوع الوثيقة، ما يمثله المحور X، ما يمثله المحور Y، وما هي الشروط التجريبية.',
    },
    titleAr: 'التعرف على الوثيقة',
    titleFr: 'Identifier',
    introAr: 'عندما ترى وثيقة، لا تبدأ التحليل مباشرة. يجب أن تحدد ما هي قبل أن تبدأ. هذه هي الخطوة الأولى في المنهجية.',
    introFr: "Avant d'analyser, identifie le type de document, les variables et leurs unités.",
    checklist: [
      { ar: 'نوع الوثيقة: منحنى / جدول / صورة / هجرة كهربائية / منحنى سكر الدم', fr: 'Type : courbe / tableau / image / électrophorèse / courbe glycémie' },
      { ar: 'ما يمثله المحور X ووحدته', fr: 'Ce que représente l’axe X et son unité' },
      { ar: 'ما يمثله المحور Y ووحدته', fr: 'Ce que représente l’axe Y et son unité' },
      { ar: 'الشروط التجريبية: هل هناك مادة أم لا، درجة الحرارة، إلخ', fr: 'Conditions expérimentales : présence/absence de substance, température…' },
    ],
    templateAr: 'الوثيقة عبارة عن [نوع] تمثل [Y] بـ [الوحدة] بدلالة [X] بـ [الوحدة]، تحت الشروط: [الشروط].',
    exampleAr: 'الوثيقة عبارة عن منحنى يمثل قوة التقلص العضلي بـ mN بدلالة تركيز الكورار بـ microM، تحت شروط: غياب وحضور الكورار.',
    validation: {
      requiredKeywords: ['يمثل', 'بدلالة'],
      minLength: 50,
    },
    xp: 10,
  },
  {
    id: 'module_1_decrire',
    order: 1,
    durationMin: 6,
    loi: {
      num: 1,
      titleAr: 'الوصف — Loi Kunz #1',
      titleFr: 'Décrire — Loi Kunz #1',
      ruleAr: 'الوصف هو ما تراه عينك فقط، دون تفسير السبب. ممنوع أن تقول لأن أو بسبب في الوصف.',
    },
    titleAr: 'الوصف',
    titleFr: 'Décrire',
    introAr: 'الوصف = ما تراه عينك فقط، دون تفسير السبب. ممنوع أن تقول «لأن» أو «بسبب» في الوصف، بل صف ما تراه.',
    introFr: 'Décrire = ce que tu vois seulement, avec chiffres et unités, sans interpréter.',
    checklist: [
      { ar: 'تقسيم الوثيقة إلى 2 أو 3 مراحل واضحة', fr: 'Découpe en 2 ou 3 phases claires' },
      { ar: 'كل مرحلة اذكر القيمة + الوحدة الخاصة بها', fr: 'Chaque phase : valeur + unité' },
      { ar: 'استخدم: يزداد / ينقص / يبقى ثابتا / يتذبذب', fr: 'Utilise : augmente / diminue / reste constant / oscille' },
    ],
    templateAr: 'نلاحظ 3 مراحل: من [t1] إلى [t2]: [يزداد/ينقص] من [X1] [الوحدة] إلى [X2] [الوحدة]. من [t2] إلى [t3]: [الوصف].',
    exampleAr: 'نلاحظ من 0 إلى 10 دقيقة: زيادة سريعة من 0 إلى 45 mV. من 10 إلى 20 دقيقة: ثبات عند 45 mV.',
    noteAr: 'القانون الذهبي: قيمة + وحدة إجباري. لو كتبت «ارتفاع كبير» بدون رقم ووحدة = 0 نقطة.',
    validation: {
      mustContainNumbers: true,
      mustContainUnits: true,
      forbiddenWords: ['لأن', 'بسبب'],
      minLength: 40,
    },
    xp: 10,
  },
  {
    id: 'module_2_analyser',
    order: 2,
    durationMin: 7,
    loi: {
      num: 2,
      titleAr: 'التحليل — Loi Kunz #2',
      titleFr: 'Analyser — Loi Kunz #2',
      ruleAr: 'التحليل = الوصف + العلاقة + تفسير جزئي صغير لكل مرحلة.',
    },
    titleAr: 'التحليل',
    titleFr: 'Analyser',
    introAr: 'التحليل = الوصف + العلاقة + تفسير جزئي صغير لكل مرحلة. اربط ما تراه بالسبب ثم استنتج علاقة عامة.',
    introFr: "L'analyse relie la description à la cause, puis dégage une relation générale et une déduction.",
    checklist: [
      { ar: 'بطاقة تعريف الوثيقة', fr: 'Carte d’identité du document' },
      { ar: 'وصف المراحل بالقيم والوحدات', fr: 'Description des phases avec valeurs et unités' },
      { ar: 'تفسير جزئي صغير لكل مرحلة', fr: 'Petite explication par phase' },
      { ar: 'العلاقة العامة: كلما زاد [X] كلما زاد/نقص [Y]', fr: 'Relation générale : plus X augmente, plus Y…' },
      { ar: 'استنتاج عام بدون أرقام', fr: 'Conclusion générale sans chiffres' },
    ],
    templateAr: 'تمثل الوثيقة [الوصف]. نلاحظ المرحلة 1 من [t1] إلى [t2] [تغير] بقيمة [X] [الوحدة]، ويرجع ذلك إلى [تفسير جزئي]. العلاقة العامة: كلما زاد [الشرط] كلما [النتيجة]. نستنتج أن [حقيقة عامة].',
    exampleAr: 'تأثير سم الكوبرا على المستقبلات. نلاحظ المرحلة 1 من 0 إلى 5 دقائق نقص سريع بقيمة 80 بالمئة، ويرجع ذلك إلى تثبيط المستقبل. العلاقة: كلما زاد تركيز السم كلما نقصت الاستجابة. نستنتج أن السم يثبط المستقبلات.',
    noteAr: 'العلاقة «كلما... كلما» تُستعمل فقط في الوثائق الرقمية المتصلة (المنحنيات). أما الوثائق النوعية (مثل Ouchterlony أو الهجرة الكهربائية) فتُقارن بـ «بينما / في حين».',
    validation: {
      requiredKeywords: ['تمثل', 'نلاحظ', 'يرجع ذلك', 'نستنتج'],
      minLength: 80,
    },
    xp: 15,
  },
  {
    id: 'module_3_interpreter',
    order: 3,
    durationMin: 7,
    loi: {
      num: 3,
      titleAr: 'التفسير — Loi Kunz #3',
      titleFr: 'Interpréter — Loi Kunz #3',
      ruleAr: 'التفسير هو الإجابة عن لماذا حدث هذا. 3 مستويات إن استطعت: جزيئي وخلوي وفيزيولوجي.',
    },
    titleAr: 'التفسير',
    titleFr: 'Interpréter',
    introAr: 'التفسير هو الإجابة عن لماذا حدث هذا. يجب أن تذكر 3 مستويات إن استطعت: جزيئي وخلوي وفيزيولوجي، لكن ليس إجباريا في كل وثيقة.',
    introFr: "L'interprétation complète va du moléculaire au cellulaire puis au physiologique.",
    checklist: [
      { ar: 'رصد الظاهرة: نلاحظ [....]', fr: 'Repère la phénomène : on observe […]' },
      { ar: 'المستوى الجزيئي: على المستوى الجزيئي [إنزيم/مستقبل/قناة]', fr: 'Niveau moléculaire : enzyme/récepteur/canal' },
      { ar: 'المستوى الخلوي: على المستوى الخلوي [تأثير على الخلية]', fr: 'Niveau cellulaire : effet sur la cellule' },
      { ar: 'الدلالة: مما يدل على [....]', fr: 'Signification : cela indique […]' },
    ],
    templateAr: 'نلاحظ [الملاحظة]. على المستوى الجزيئي: [آلية]. على المستوى الخلوي: [تأثير]. مما يدل على [دلالة].',
    exampleAr: 'نلاحظ شلل العضلة بعد حقن الكورار. على المستوى الجزيئي: الكورار يغلق المستقبلات النيكوتينية للوحة المحركة. على المستوى الخلوي: لا يدخل Na+. مما يدل على توقف كمون اللوحة المحركة PPM.',
    noteAr: 'القانون: استعمل «ويعود ذلك إلى» + «مما يدل على». ولا تكتب أن الأسيتيل كولين يفتح قنوات Na+ الفولطية مباشرة، قل قنوات كيميائية أولا. (الفرق: الرعشات = تقلصات مبعثرة لألياف معزولة في جرعة ضعيفة؛ التكزز = اندماج الرعشات في تقلص مستمر في جرعة قوية.)',
    validation: {
      requiredKeywords: ['المستوى الجزيئي', 'المستوى الخلوي', 'مما يدل على'],
      minLength: 80,
    },
    xp: 15,
  },
  {
    id: 'module_4_hypothese',
    order: 4,
    durationMin: 6,
    loi: {
      num: 4,
      titleAr: 'الفرضية — Loi Kunz #4',
      titleFr: 'Hypothèse — Loi Kunz #4',
      ruleAr: 'الفرضية ليست تخمينا. يجب أن تكون جازمة لكنها تبقى فرضية. ممنوع ربما / قد / يمكن.',
    },
    titleAr: 'الفرضية',
    titleFr: 'Hypothèse',
    introAr: 'الفرضية ليست تخمينا. يجب أن تكون جازمة لكنها تبقى فرضية. ممنوع أن تقول ربما أو قد أو يمكن. يجب أن تقول نفترض أن.',
    introFr: "L'hypothèse est affirmative, cible une molécule précise et est testable.",
    checklist: [
      { ar: 'ماركر الفرضية: نفترض أن', fr: 'Marqueur : nous supposons que' },
      { ar: 'جملة تأكيدية بعدها', fr: 'Une phrase affirmative après' },
      { ar: 'شيء جزيئي: إنزيم / مستقبل / قناة + اسم علمي', fr: 'Une cible moléculaire : enzyme/récepteur/canal + nom' },
    ],
    templateAr: 'نفترض أن سبب [الظاهرة] يعود إلى [تثبيط/تنشيط/غلق] [الجزيء: إنزيم/مستقبل/قناة] المسمى [الاسم] مما يؤدي إلى [النتيجة].',
    exampleAr: 'نفترض أن سبب التقلص المستمر يعود إلى تثبيط إنزيم AChE مما يؤدي إلى بقاء الأسيتيل كولين مثبتا.',
    noteAr: 'الفرق بين الفرضية والاستنتاج: الفرضية قبل التجربة، والاستنتاج بعدها. ممنوع: ربما / قد / يمكن / أظن. إجباري: نفترض أن + جملة تأكيدية + شيء جزيئي دقيق (إنزيم أو مستقبل أو قناة باسمه).',
    validation: {
      requiredKeywords: ['نفترض'],
      forbiddenWords: ['ربما', 'قد', 'يمكن', 'أظن', 'peut-être', 'peut etre', 'je pense'],
      mustContainTargetAny: ['إنزيم', 'مستقبل', 'قناة'],
      minLength: 40,
    },
    xp: 20,
  },
  {
    id: 'module_5_valider',
    order: 5,
    durationMin: 18,
    loi: {
      num: 5,
      titleAr: 'المصادقة والتركيب — Loi Kunz #5 و #6',
      titleFr: 'Valider + Schéma — Loi Kunz #5 et #6',
      ruleAr: '3 صناديق: الوثيقة 1 + استنتاج صغير، الوثيقة 2 + استنتاج صغير، التركيب + الحكم. ثم المخطط والنص العلمي.',
    },
    titleAr: 'المصادقة والتركيب + المخطط',
    titleFr: 'Valider + Schéma',
    introAr: 'هذه آخر خطوة (18 دقيقة). 3 صناديق: صندوق 1 الوثيقة 1 + استنتاج صغير، صندوق 2 الوثيقة 2 + استنتاج صغير، صندوق 3 التركيب + الحكم. ثم المخطط والنص العلمي.',
    introFr: 'Dernière étape : relie les documents en une synthèse, juge les hypothèses, puis le schéma et le texte scientifique.',
    checklist: [
      { ar: 'صندوق 1: الوثيقة 1 + استنتاج صغير', fr: 'Boîte 1 : Doc1 + petite conclusion' },
      { ar: 'صندوق 2: الوثيقة 2 + استنتاج صغير', fr: 'Boîte 2 : Doc2 + petite conclusion' },
      { ar: 'صندوق 3: التركيب + جملة الحكم', fr: 'Boîte 3 : synthèse + phrase de jugement' },
      { ar: 'المخطط: لبنات + أسهم تنشيط/تثبيط + لونين + مفتاح', fr: 'Schéma : blocs + flèches + 2 couleurs + légende' },
      { ar: 'النص العلمي: مقدمة + مشكل بـ ؟ + عرض + خاتمة', fr: 'Texte : intro + problème ? + développement + conclusion' },
    ],
    templateAr: 'من الوثيقة 1 نستخلص أن [1]. ومن الوثيقة 2 نستخلص أن [2]. بربطهما نجد أن [تركيب]. وهذا ما يؤكد صحة الفرضية رقم [X] التي تنص على [نص] ويلغي الفرضية رقم [Y]. نناقش: هذه النتيجة صحيحة في حدود [شروط].',
    exampleAr: 'مثال إسيرين (ليس سارين، السارين ممنوع في البرنامج): الوثيقة 1 في غياب إسيرين كمون عمل واحد، في حضوره 4 كمونات عمل متقاربة → تقلص متكرر. الوثيقة 2 نشاط AChE 100 بالمئة بلا إسيرين → 0 بالمئة مع إسيرين. التركيب: تثبيط AChE → الأسيتيل كولين لا يتحلل → يبقى مرتبطا بالمستقبلات القنوية الكيميائية → دخول Na+ → كمون لوحة محركة PPM مطول → كمونات عمل متكررة. المخطط: AChE -| (تثبيط) → ACh → مستقبل قنوي → Na+ → PPM → كمون عمل.',
    noteAr: 'القانون: يجب جملة الحكم: «وهذا ما يؤكد صحة الفرضية رقم 1 التي تنص على [....] ويلغي الفرضية رقم 2». ولا تقل رفضت ولا خاطئة، قل غير ضرورية / غير مدعومة إذا لا يوجد دليل كمية محررة. المخطط: لبنات (مستطيلات) + أسهم تنشيط/تثبيط + لونين فقط + مفتاح + عنوان مسطر: مخطط تحصيلي يوضح آلية...',
    validation: {
      requiredKeywords: ['نستخلص', 'يؤكد صحة الفرضية', 'غير ضرورية'],
      minLength: 100,
    },
    xp: 45,
  },
];

export const MANHADJIYA_DONE_KEY = 'kunz_manhadjiya_done';
export const MANHADJIYA_LANG_KEY = 'user_language_preference';

export const CERTIFICATE = {
  nameAr: 'شهادة الانطلاق المنهجي',
  nameFr: 'Certificat de démarrage méthodologique',
  messageAr: 'مبروك! تعلمت 6 مفاتيح ذهبية للمنهجية. الآن تبدأ الرحلة الحقيقية بالممارسة اليومية.',
  messageFr: 'Bravo ! Tu as appris 6 clés d\'or de la méthode. Le vrai entraînement commence chaque jour.',
};
