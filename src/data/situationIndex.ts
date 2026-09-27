// situationIndex.ts — Banque d'exercices INDEXÉE PAR SITUATION (audit item 18, sprint 10)
//
// Pourquoi ce fichier existe
// --------------------------
// L'app possédait déjà 31 contextes documentaires (`documentPracticeContexts.ts`)
// et 19 exercices « élite » (`documentAnalysisExercises.ts`), mais ils n'étaient
// atteignables que par unité et par type de document (« منحنى », « جدول »…).
// Or la banque la plus consultée du BAC algérien — la playlist d'exercices de
// @MostafaBdd : 121 vidéos / 350 075 vues — nomme chaque exercice par la
// SITUATION CONCRÈTE qu'il met en scène : « المضاد الحيوي » (134 K vues),
// « البروجيريا » (102 K), « سرطان الثدي » (69 K), « أشعة الشمس »,
// « المورثة و سلوك الأحماض الأمينية ». L'élève ne cherche pas « un tableau à
// double entrée » : il cherche « l'exercice du diabétique » ou « celui du gaz
// sarin ». Cet index est cette porte d'entrée.
//
// Ce fichier n'invente AUCUN exercice : il ré-indexe l'existant. Chaque
// `exerciseIds` référence des exercices réels, et le verrou
// `situationIndex.lock.test.ts` casse si une référence devient morte.

import { DOCUMENT_PRACTICE_CONTEXTS } from './documentPracticeContexts';
import { DOCUMENT_ANALYSIS_EXERCISES } from './documentAnalysisExercises';

/** Difficulté ressentie : 1 = accessible, 2 = standard BAC, 3 = piège classique. */
export type SituationDifficulty = 1 | 2 | 3;

export interface SituationCard {
  /** Identifiant stable (snake_case). */
  id: string;
  /** Nom de la situation, tel que l'élève la cherche : « المضاد الحيوي ». */
  titleAr: string;
  /** Sous-titre : de quoi parle la scène en une ligne. */
  subtitleAr: string;
  /** La scène réelle, 2 à 4 phrases — c'est l'énoncé d'accroche. */
  situationAr: string;
  /** La question d'entrée, formulée comme au BAC. */
  questionAr: string;
  /** Ce qui est RÉELLEMENT évalué derrière l'habillage (anti-surprise). */
  notionAr: string;
  /** Le piège que la situation tend à l'élève. */
  piegeAr: string;
  /** Unités du programme mobilisées (ordre : principale d'abord). */
  unitIds: number[];
  difficulty: SituationDifficulty;
  /** Durée conseillée pour traiter la situation, en minutes. */
  minutes: number;
  /** Mots-clés de recherche (arabe et/ou latin), 3 minimum. */
  tags: string[];
  /** Exercices existants à ouvrir — références vérifiées par le verrou. */
  exerciseIds: string[];
  /** Leçon active à réviser si l'élève cale. */
  lessonId?: string;
}

export const SITUATION_INDEX: SituationCard[] = [
  {
    id: 'antibiotique_rifamycine',
    titleAr: 'المضاد الحيوي',
    subtitleAr: 'لماذا يقتل الريفاميسين البكتيريا دون أن يقتل خلايانا؟',
    situationAr:
      'يصف الطبيب للمريض مضاداً حيوياً هو الريفاميسين لعلاج التهاب بكتيري. بعد ثلاثة أيام تتوقف البكتيريا عن التكاثر. أُجريت تجربتان مخبريتان (H1 و H2) لمتابعة تركيب ARNm داخل الخلية البكتيرية في وجود الدواء وفي غيابه.',
    questionAr: 'حلّل نتائج الوثيقتين ثم استنتج مستوى تدخّل الريفاميسين في تدفق المعلومة الوراثية.',
    notionAr: 'الاستنساخ: دور ARN بوليميراز وتشكّل ARNm انطلاقاً من السلسلة الناسخة.',
    piegeAr:
      'كثير من التلاميذ يجيبون « يمنع تركيب البروتين ». الجواب المقبول يحدّد المرحلة بدقة: تثبيط الاستنساخ، وليس الترجمة — والدليل هو غياب ARNm لا غياب البروتين.',
    unitIds: [1],
    difficulty: 2,
    minutes: 20,
    tags: ['المضاد الحيوي', 'الريفاميسين', 'الاستنساخ', 'ARNm', 'rifamycine'],
    exerciseIds: ['rifamycine_h1h2'],
    lessonId: 'lecon_transcription',
  },
  {
    id: 'uracile_radioactif',
    titleAr: 'اليوراسيل المشع',
    subtitleAr: 'تتبّع جزيء من النواة إلى الهيولى',
    situationAr:
      'وُضعت خلايا في وسط يحتوي يوراسيل مشع. بعد دقائق قليلة يظهر الإشعاع في النواة وحدها، وبعد ساعة يظهر في الهيولى.',
    questionAr: 'فسّر انتقال الإشعاع من النواة إلى الهيولى، مستعيناً بمعلوماتك حول تدفق المعلومة الوراثية.',
    notionAr: 'اليوراسيل خاص بـ ARN: تُركَّب ARNm في النواة ثم تُهاجر إلى الهيولى نحو الريبوزومات.',
    piegeAr: 'اليوراسيل يسم ARN وليس ADN؛ الخلط مع الثيمين يُفقد كل نقاط التمرين.',
    unitIds: [1],
    difficulty: 1,
    minutes: 12,
    tags: ['اليوراسيل', 'المشع', 'النواة', 'ARNm', 'الهيولى'],
    exerciseIds: ['uracile_marque'],
    lessonId: 'lecon_transcription',
  },
  {
    id: 'lecture_shifra',
    titleAr: 'قراءة الشفرة الوراثية',
    subtitleAr: 'من الرامزة إلى الحمض الأميني',
    situationAr:
      'يُعطى لك جزء من ARNm وجدول الشفرة الوراثية. يُطلب منك بناء السلسلة الببتيدية الموافقة وتحديد الريبوزوم كمقر للعملية.',
    questionAr: 'حدّد تسلسل الأحماض الأمينية، ثم بيّن دور مضاد الرامزة على ARNt.',
    notionAr: 'الترجمة: الرامزة على ARNm ↔ مضاد الرامزة على ARNt ↔ حمض أميني واحد.',
    piegeAr: 'قراءة الجدول في الاتجاه الخاطئ (3ʹ→5ʹ) أو نسيان رامزة البدء AUG.',
    unitIds: [1],
    difficulty: 1,
    minutes: 15,
    tags: ['الشفرة الوراثية', 'الترجمة', 'الرامزة', 'ARNt', 'الريبوزوم'],
    exerciseIds: ['codon_anticodon', 'translation_schema', 'h1_h2_generic_double_doc'],
  },
  {
    id: 'anemie_falciforme',
    titleAr: 'فقر الدم المنجلي',
    subtitleAr: 'حمض أميني واحد يغيّر مصير كريّة دم',
    situationAr:
      'مريض يعاني من فقر دم منجلي. يُظهر الترحيل الكهربائي لهيموغلوبينه (HbS) هجرة مختلفة عن هيموغلوبين شخص سليم (HbA)، رغم أن الفارق بين البروتينين حمض أميني واحد فقط.',
    questionAr: 'حلّل نتيجة الترحيل الكهربائي، ثم فسّر كيف يؤدي تبديل حمض أميني واحد إلى تغيّر وظيفة البروتين.',
    notionAr: 'العلاقة بنية/وظيفة: تغيّر الشحنة → تغيّر الطي الفراغي → تغيّر الوظيفة.',
    piegeAr:
      'الجواب « لأن الطفرة غيّرت المورثة » لا يكفي: يجب ربط الشحنة الكهربائية للحمض الأميني الجديد بمسافة الهجرة الملاحظة.',
    unitIds: [2, 1],
    difficulty: 3,
    minutes: 25,
    tags: ['فقر الدم المنجلي', 'HbS', 'الترحيل الكهربائي', 'الطفرة', 'البنية والوظيفة'],
    exerciseIds: ['electro_hb', 'mutation_protein_function'],
    lessonId: 'protein_structure_function',
  },
  {
    id: 'mixture_acides_amines',
    titleAr: 'المورثة و سلوك الأحماض الأمينية',
    subtitleAr: 'مزيج في المخبر: من يهاجر نحو المصعد؟',
    situationAr:
      'يضع تقنيّ مخبر نقطة من مزيج ثلاثة أحماض أمينية في وسط ذي pH محدّد، ثم يطبّق حقلاً كهربائياً. بعد ثلاثين دقيقة تتفرّق البقع: واحدة نحو المصعد، واحدة نحو المهبط، وواحدة بقيت في مكانها.',
    questionAr: 'حدّد شحنة كل حمض أميني في هذا الوسط واستنتج قاعدة عامة تربط pH الوسط بـ pHi الجزيء.',
    notionAr: 'pH < pHi ⇒ شحنة موجبة ⇒ هجرة نحو المهبط؛ pH > pHi ⇒ شحنة سالبة ⇒ نحو المصعد؛ pH = pHi ⇒ ثبات.',
    piegeAr:
      'خلط المصعد بالمهبط. القاعدة الثابتة: الشحنة السالبة تنجذب نحو القطب الموجب (المصعد). راجع المحاكاة التفاعلية في « الأنميشن العلمي ».',
    unitIds: [2],
    difficulty: 3,
    minutes: 20,
    tags: ['الأحماض الأمينية', 'pHi', 'الترحيل الكهربائي', 'المصعد', 'المهبط', 'electrophorese'],
    exerciseIds: ['amino_acid_electrophoresis'],
    lessonId: 'amino_acid_behavior',
  },
  {
    id: 'digestion_pepsine',
    titleAr: 'الهضم في المعدة',
    subtitleAr: 'لماذا تتوقف سرعة الهضم عن الارتفاع؟',
    situationAr:
      'لمتابعة نشاط إنزيم هاضم، يقيس باحث سرعة التفاعل عند تراكيز متزايدة من الركيزة، عند pH و درجة حرارة ثابتتين. يرتفع المنحنى أولاً ثم ينبسط.',
    questionAr: 'حلّل المنحنى، ثم فسّر انبساطه في الجزء الأخير.',
    notionAr: 'التشبّع: عدد المواقع الفعّالة محدود، فتبلغ السرعة قيمة قصوى Vmax.',
    piegeAr: 'قول « الإنزيم تمسّخ » خطأ: الشروط ثابتة. السبب هو إشباع المواقع الفعّالة، لا إتلافها.',
    unitIds: [3],
    difficulty: 2,
    minutes: 18,
    tags: ['الإنزيم', 'التشبع', 'Vmax', 'الركيزة', 'ميكاييلس'],
    exerciseIds: ['michaelis_courbe'],
  },
  {
    id: 'detergent_enzymatique',
    titleAr: 'مسحوق الغسيل البيولوجي',
    subtitleAr: 'ماء ساخن أم فاتر؟ و أي pH؟',
    situationAr:
      'يحتوي مسحوق غسيل على إنزيمات محلِّلة للبروتين. تُعطى نتائج نشاط الإنزيم في جدول مزدوج المدخل حسب pH ودرجة الحرارة.',
    questionAr: 'استخرج من الجدول الشرطين الأمثلين لنشاط هذا الإنزيم، ثم فسّر انهيار النشاط خارجهما.',
    notionAr: 'لكل إنزيم pH أمثل ودرجة حرارة مثلى؛ خارجهما يحدث تمسّخ يفقد الموقع الفعّال شكله.',
    piegeAr: 'قراءة سطر واحد من الجدول: يجب تقاطع المدخلين (pH × T°) قبل أي استنتاج.',
    unitIds: [3],
    difficulty: 2,
    minutes: 15,
    tags: ['الإنزيم', 'pH', 'درجة الحرارة', 'التمسخ', 'جدول'],
    exerciseIds: ['enzyme_ph_temp'],
    lessonId: 'enzyme_inhibitors',
  },
  {
    id: 'diabete_januvia',
    titleAr: 'مريض السكري و دواء الجانوفيا',
    subtitleAr: 'دواء يعمل بتثبيط إنزيم',
    situationAr:
      'يتناول مريض بداء السكري من النمط الثاني دواء « جانوفيا ». تُتابَع نسبة الغلوكوز في دمه قبل الدواء وبعده خلال ساعات.',
    questionAr: 'حلّل المنحنيين باستعمال صيغة « كلما … كلما … »، ثم اقترح آلية تفسّر مفعول الدواء.',
    notionAr: 'التثبيط الإنزيمي في سياق طبي: تثبيط إنزيم يهدم هرموناً ⇒ بقاء الهرمون ⇒ خفض السكر.',
    piegeAr: 'الاكتفاء بوصف المنحنى دون اقتراح آلية: السؤال من عائلة « الحدّاد » (اقترح/فسّر)، لا من عائلة « الصورة ».',
    unitIds: [3],
    difficulty: 3,
    minutes: 25,
    tags: ['السكري', 'الجانوفيا', 'التثبيط', 'الغليسيميا', 'januvia'],
    exerciseIds: ['glycemie_januvia'],
    lessonId: 'enzyme_inhibitors',
  },
  {
    id: 'greffe_rein',
    titleAr: 'زرع الكلية',
    subtitleAr: 'لماذا يرفض الجسم عضواً يحتاجه؟',
    situationAr:
      'مريض بحاجة إلى زرع كلية. يقارن الطبيب محدّدات التوافق النسيجي HLA بين المريض وثلاثة متبرعين محتملين قبل اختيار أحدهم.',
    questionAr: 'بيّن على أي أساس يُختار المتبرّع، ثم فسّر سبب رفض الطعم عند اختلاف المحددات.',
    notionAr: 'الذات واللاذات: معقد HLA (CMH) بصمة بيولوجية تُعرَض للمفاويات T.',
    piegeAr: 'الخلط بين الزمر الدموية ABO ومحددات HLA: هما نظامان مختلفان، والسؤال يحدد أيّهما.',
    unitIds: [4],
    difficulty: 2,
    minutes: 20,
    tags: ['زرع', 'الكلية', 'HLA', 'CMH', 'الذات واللاذات', 'الرفض'],
    exerciseIds: ['cmh_transplant_compatibility', 'membrane_hla_schema'],
    lessonId: 'immunity_self_nonself',
  },
  {
    id: 'sida_vih',
    titleAr: 'فيروس فقدان المناعة VIH',
    subtitleAr: 'من موجب المصل إلى مرحلة السيدا',
    situationAr:
      'تُتابَع عند شخص مصاب بـ VIH ثلاث منحنيات خلال عشر سنوات: الحمولة الفيروسية، عدد اللمفاويات LT4، والأجسام المضادة.',
    questionAr: 'حدّد مراحل الإصابة الثلاث انطلاقاً من المنحنيات، ثم فسّر انهيار المناعة في المرحلة الأخيرة.',
    notionAr: 'LT4 هي منسّق الاستجابة المناعية؛ تدميرها يُسقط المناعتين الخلطية والخلوية معاً.',
    piegeAr: 'الخلط بين « موجب المصل » (حامل للأجسام المضادة) و« مريض بالسيدا » (انهيار LT4 + أمراض انتهازية).',
    unitIds: [4],
    difficulty: 3,
    minutes: 30,
    tags: ['السيدا', 'VIH', 'LT4', 'الحمولة الفيروسية', 'موجب المصل'],
    exerciseIds: ['vih_evolution_courbes'],
    lessonId: 'immunity_hiv_aids',
  },
  {
    id: 'vaccination_rappel',
    titleAr: 'حملة التلقيح و الجرعة التذكيرية',
    subtitleAr: 'لماذا جرعتان و ليست واحدة؟',
    situationAr:
      'في حملة تلقيح مدرسية، يتلقّى التلاميذ جرعة أولى ثم جرعة تذكيرية بعد شهر. يُقارَن تطوّر نسبة الأجسام المضادة بعد كل جرعة.',
    questionAr: 'قارن الاستجابتين الأولية والثانوية، ثم فسّر الفرق مستعيناً بمفهوم الخلايا ذات الذاكرة.',
    notionAr: 'الاستجابة الثانوية أسرع وأقوى وأطول بفضل اللمفاويات ذات الذاكرة الناتجة عن الانتقاء النسيلي.',
    piegeAr: 'وصف المنحنيين دون ذكر الخلايا ذات الذاكرة: المقارنة وحدها لا تُفسّر شيئاً.',
    unitIds: [4],
    difficulty: 2,
    minutes: 20,
    tags: ['التلقيح', 'الجرعة التذكيرية', 'الذاكرة المناعية', 'الأجسام المضادة'],
    exerciseIds: ['primary_secondary_response', 'lb_antibody_response'],
    lessonId: 'immunity_memory_response',
  },
  {
    id: 'labo_ouchterlony',
    titleAr: 'مخبر التحاليل: هل المصلان متطابقان؟',
    subtitleAr: 'قراءة هالات أوشترلوني',
    situationAr:
      'في تقنية أوشترلوني، تُوضع مستضدات في حفر وأمصال في حفر أخرى داخل هلام. بعد 24 ساعة تظهر أقواس ترسيب: بعضها يندمج وبعضها يتقاطع.',
    questionAr: 'حلّل شكل الأقواس ثم استنتج العلاقة بين المستضدات المستعملة.',
    notionAr: 'اندماج قوسين ⇒ تطابق المستضدّين؛ تقاطعهما ⇒ اختلافهما — النوعية مستضد/جسم مضاد.',
    piegeAr: 'الاستنتاج من عدد الحفر بدل شكل الأقواس؛ لا بدّ من وصف الاندماج/التقاطع قبل الاستنتاج.',
    unitIds: [4],
    difficulty: 2,
    minutes: 18,
    tags: ['أوشترلوني', 'المستضد', 'الجسم المضاد', 'الترسيب', 'النوعية'],
    exerciseIds: ['ouchterlony_arcs'],
    lessonId: 'immunity_humoral_response',
  },
  {
    id: 'cellules_cibles_lt',
    titleAr: 'الخلايا المصابة تختفي',
    subtitleAr: 'دليل تجريبي على الإقصاء الخلوي',
    situationAr:
      'تُوضع خلايا هدف مصابة بفيروس في وسط زرع، ثم تُضاف إليها لمفاويات T سامّة مأخوذة من حيوان ملقّح. يُتابَع عدد الخلايا الهدف الحيّة مع الزمن.',
    questionAr: 'حلّل المنحنى ثم بيّن أنه دليل على مناعة ذات وساطة خلوية.',
    notionAr: 'LTc تتعرّف على الخلية المصابة بفضل HLA وتُحدث انحلالها بالبرفورين.',
    piegeAr: 'نسبة الاختفاء إلى الأجسام المضادة: الوسط لا يحتوي مصلاً، بل خلايا — وهذا هو الشاهد الحاسم.',
    unitIds: [4],
    difficulty: 2,
    minutes: 18,
    tags: ['الخلايا الهدف', 'LTc', 'الإقصاء الخلوي', 'البرفورين'],
    exerciseIds: ['lt_target_cell_response'],
    lessonId: 'immunity_cellular_response',
  },
  {
    id: 'sarin_attaque',
    titleAr: 'التسمّم بغاز السارين',
    subtitleAr: 'لماذا يبقى العضل منقبضاً حتى الاختناق؟',
    situationAr:
      'يُعرَض حيوان مخبري لجرعة صغيرة من السارين. تبيّن الوثيقتان انهيار نشاط إنزيم الأستيل كولين إستراز وبقاء الناقل في الشقّ المشبكي.',
    questionAr: 'حلّل الوثيقتين، ثم فسّر الانقباض العضلي الدائم الملاحَظ عند الحيوان.',
    notionAr: 'AChE تُفكّك الأستيل كولين؛ تثبيطها ⇒ تنبيه دائم للمستقبلات بعد المشبكية.',
    piegeAr:
      'الخلط مع الكورار: السارين يُبقي الناقل (انقباض دائم)، الكورار يحتلّ المستقبل (شلل رخو). الآليتان متعاكستان.',
    unitIds: [5, 3],
    difficulty: 3,
    minutes: 25,
    tags: ['السارين', 'الأستيل كولين', 'AChE', 'التثبيط', 'المشبك', 'sarin'],
    exerciseIds: ['sarin_gb_double'],
    lessonId: 'synapse',
  },
  {
    id: 'curare_chirurgie',
    titleAr: 'الكورار في غرفة العمليات',
    subtitleAr: 'شلل مؤقّت مطلوب طبياً',
    situationAr:
      'يستعمل طبيب التخدير مشتقاً من الكورار لإرخاء عضلات المريض أثناء الجراحة. يعرض جدول تجارب شدّة الانقباض العضلي قبل الحقن وبعده وبعد غسل الوسط.',
    questionAr: 'حلّل الجدول ثم حدّد مستوى تأثير الكورار على مستوى اللوحة المحركة.',
    notionAr: 'الكورار مضاد للأستيل كولين ينافسه على المستقبل النيكوتيني دون فتح القناة.',
    piegeAr: 'القول إنه « يوقف السيالة العصبية »: السيالة تصل فعلاً إلى النهاية العصبية؛ العطل بعد المشبكي.',
    unitIds: [5],
    difficulty: 2,
    minutes: 20,
    tags: ['الكورار', 'اللوحة المحركة', 'المستقبل النيكوتيني', 'الشلل', 'curare'],
    exerciseIds: ['curare_table', 'ach_jnm_schema'],
    lessonId: 'synapse',
  },
  {
    id: 'seuil_integration',
    titleAr: 'منبّه ضعيف لا يُولّد استجابة',
    subtitleAr: 'الإدماج الزماني و المكاني',
    situationAr:
      'يُنبَّه عصبون قبل مشبكي بمنبّه ضعيف: لا استجابة. تُكرَّر التنبيهات بسرعة، أو تُنبَّه عدة مشابك في آنٍ واحد: يظهر كمون عمل.',
    questionAr: 'فسّر ظهور كمون العمل في الحالتين الأخيرتين، ثم قارن بين PPSE و PPSI.',
    notionAr: 'الإدماج العصبي: جمع الكمونات الموضعية حتى بلوغ العتبة، ثم قانون الكل أو اللاشيء.',
    piegeAr: 'الخلط بين PPSE (موضعي، متدرّج) و PPM (اللوحة المحركة) وكمون العمل (كلّ أو لاشيء).',
    unitIds: [5],
    difficulty: 3,
    minutes: 25,
    tags: ['الإدماج', 'العتبة', 'PPSE', 'PPSI', 'كمون العمل'],
    exerciseIds: ['synapse_integration', 'ppse_ppsi_compare', 'nmj_ppm_courbe'],
    lessonId: 'synapse',
  },
  {
    id: 'serre_agricole',
    titleAr: 'البيت البلاستيكي',
    subtitleAr: 'هل تزيد الإضاءة المردود إلى ما لا نهاية؟',
    situationAr:
      'يريد فلاح رفع مردود بيته البلاستيكي. يُقاس معدّل التركيب الضوئي عند شدّات إضاءة متزايدة: يرتفع المنحنى ثم ينبسط رغم زيادة الضوء.',
    questionAr: 'حلّل المنحنى، ثم حدّد العامل المحدِّد في الجزء المنبسط واقترح إجراءً عملياً للفلاح.',
    notionAr: 'العوامل المحدّدة: الضوء، CO₂، درجة الحرارة — والانبساط يدلّ على عامل آخر صار محدِّداً.',
    piegeAr: 'قول « النبات تعب »: المطلوب تسمية عامل محدّد (غالباً CO₂) وربطه بالمرحلة الكيمياحيوية.',
    unitIds: [6],
    difficulty: 2,
    minutes: 20,
    tags: ['التركيب الضوئي', 'العامل المحدد', 'الإضاءة', 'CO2', 'البيت البلاستيكي'],
    exerciseIds: ['photosynth_courbe', 'photosynthese_cycle'],
  },
  {
    id: 'jagendorf_chloroplaste',
    titleAr: 'تجربة جاغندورف',
    subtitleAr: 'ATP في الظلام: الضوء ليس الشرط المباشر',
    situationAr:
      'تُوضع صفائح تيلاكويدية في وسط حمضي ثم تُنقل فجأة إلى وسط قاعدي، في الظلام التام. يُسجَّل تركيب ATP رغم غياب الضوء.',
    questionAr: 'فسّر تركيب ATP في الظلام، ثم حدّد مصدر الطاقة المستعملة فعلياً.',
    notionAr: 'نظرية ميتشل: تدرّج البروتونات عبر الغشاء هو الطاقة المباشرة لتركيب ATP (الكرة المذنّبة).',
    piegeAr: 'الجواب « الضوء يصنع ATP » خاطئ: الضوء يصنع التدرّج، والتدرّج يصنع ATP — التجربة نفسها هي البرهان.',
    unitIds: [6],
    difficulty: 3,
    minutes: 25,
    tags: ['جاغندورف', 'ميتشل', 'التدرج البروتوني', 'ATP', 'المرحلة الكيموضوئية'],
    exerciseIds: ['photochemical_chain_membrane'],
    lessonId: 'photochemical_chain',
  },
  {
    id: 'coureur_crampe',
    titleAr: 'العدّاء و التشنّج العضلي',
    subtitleAr: 'من أين يأتي الـ ATP عند نفاد الأكسجين؟',
    situationAr:
      'يركض رياضي سباق 400 م بأقصى سرعته. تنفد كمية الأكسجين المتاحة لعضلاته فيشعر بحرقة وتشنّج. يُعطى جدول مراحل الهدم التنفسي ومردود كل مرحلة من ATP.',
    questionAr: 'حدّد المرحلة التي توفّر معظم ATP، ثم فسّر ما يحدث في العضلة عند نقص الأكسجين.',
    notionAr: 'التخمّر اللبني: حصيلة جزيئتي ATP فقط مقابل 36 في التنفس، مع تراكم حمض اللبن.',
    piegeAr: 'نسبة معظم ATP إلى حلقة كريبس: المنتج الأكبر هو الفسفرة التأكسدية على مستوى الغشاء الداخلي.',
    unitIds: [7],
    difficulty: 2,
    minutes: 20,
    tags: ['التنفس', 'التخمر', 'ATP', 'حمض اللبن', 'العضلة', 'كريبس'],
    exerciseIds: ['respiration_bilan'],
  },
  {
    id: 'feuille_jour_nuit',
    titleAr: 'ورقة نبات: نهاراً و ليلاً',
    subtitleAr: 'من يستهلك و من ينتج الأكسجين؟',
    situationAr:
      'تُقاس المبادلات الغازية لخلية يخضورية في ثلاث حالات: في الظلام، عند إضاءة ضعيفة، وعند إضاءة قوية.',
    questionAr: 'قارن المبادلات الغازية في الحالات الثلاث، ثم استنتج العلاقة بين التركيب الضوئي والتنفس.',
    notionAr: 'التنفس متواصل ليلاً ونهاراً؛ نقطة التعويض هي التساوي الظاهري بين الوظيفتين.',
    piegeAr: 'الاعتقاد أن النبات « يتنفّس ليلاً فقط »: عند نقطة التعويض المبادلات صفر ظاهرياً لا حقيقةً.',
    unitIds: [8, 6, 7],
    difficulty: 2,
    minutes: 18,
    tags: ['المبادلات الغازية', 'نقطة التعويض', 'التنفس', 'التركيب الضوئي', 'اليخضور'],
    exerciseIds: ['bilan_energetique_cellule'],
  },
  {
    id: 'seisme_boumerdes',
    titleAr: 'زلزال و باطن الأرض',
    subtitleAr: 'ما الذي تكشفه الأمواج التي لا تصل؟',
    situationAr:
      'بعد هزّة أرضية، تسجّل محطات رصد موزّعة حول الكرة الأرضية أمواج P و S. تُلاحَظ منطقة ظلّ لا تصلها الأمواج S إطلاقاً.',
    questionAr: 'حلّل خصائص الأمواج P و S، ثم استنتج حالة النواة الخارجية.',
    notionAr: 'الأمواج S لا تنتشر في السوائل: منطقة الظلّ برهان على نواة خارجية سائلة.',
    piegeAr: 'وصف الانقطاعات دون استعمال منطقة الظل كحجة: الاستنتاج يجب أن يستند إلى غياب S لا إلى تباطؤ P فقط.',
    unitIds: [10, 9],
    difficulty: 2,
    minutes: 20,
    tags: ['الزلزال', 'الأمواج P', 'الأمواج S', 'منطقة الظل', 'النواة', 'غوتنبرغ'],
    exerciseIds: ['seismic_p_s_core', 'structure_terre_ondes'],
    lessonId: 'seismic_waves',
  },
  {
    id: 'volcans_subduction',
    titleAr: 'براكين فوق منطقة الغوص',
    subtitleAr: 'لماذا ينصهر الوشاح رغم برودة اللوح الغائص؟',
    situationAr:
      'تصطفّ البراكين على حافّة قارّية موازية لخندق محيطي. تُعطى معطيات حول تميّه صخور اللوح المحيطي وتحرّر الماء مع العمق.',
    questionAr: 'فسّر كيف يؤدّي غوص لوح بارد إلى انصهار جزئي للوشاح فوقه.',
    notionAr: 'الماء المحرَّر يخفض درجة انصهار البيريدوتيت ⇒ انصهار جزئي ⇒ صعود صهارة.',
    piegeAr: 'قول « الحرارة تنصهر بالعمق »: المفتاح هو الماء الذي يخفّض عتبة الانصهار، لا ارتفاع الحرارة وحده.',
    unitIds: [9, 11],
    difficulty: 3,
    minutes: 25,
    tags: ['الغوص', 'البراكين', 'الانصهار الجزئي', 'التميه', 'البيريدوتيت'],
    exerciseIds: ['subduction_water_melting', 'structures_geologiques_compare'],
    lessonId: 'subduction',
  },
];

/** Index d'accès direct par identifiant. */
export const SITUATION_BY_ID: Record<string, SituationCard> = Object.fromEntries(
  SITUATION_INDEX.map((s) => [s.id, s]),
);

/** Tous les exerciseId connus de l'app (les deux banques réunies). */
export function knownExerciseIds(): Set<string> {
  return new Set<string>([
    ...DOCUMENT_PRACTICE_CONTEXTS.map((c) => c.exerciseId),
    ...DOCUMENT_ANALYSIS_EXERCISES.map((e) => e.id),
  ]);
}

/** Normalise une requête arabe : retire les diacritiques et unifie les hamza/ya. */
export function normalizeArabic(input: string): string {
  return input
    .replace(/[\u064B-\u0652\u0670]/g, '')
    .replace(/[\u0622\u0623\u0625\u0671]/g, '\u0627')
    .replace(/\u0649/g, '\u064A')
    .replace(/\u0629/g, '\u0647')
    .replace(/\u0640/g, '')
    .toLowerCase()
    .trim();
}

export interface SituationFilter {
  unitId?: number;
  difficulty?: SituationDifficulty;
}

/**
 * Recherche plein-texte sur le titre, la scène, la notion et les mots-clés.
 * Une requête vide renvoie toute la banque (filtrée), afin que la vue puisse
 * utiliser la même fonction pour l'état initial.
 */
export function searchSituations(query: string, filter: SituationFilter = {}): SituationCard[] {
  const q = normalizeArabic(query);
  return SITUATION_INDEX.filter((s) => {
    if (filter.unitId !== undefined && !s.unitIds.includes(filter.unitId)) return false;
    if (filter.difficulty !== undefined && s.difficulty !== filter.difficulty) return false;
    if (!q) return true;
    const haystack = normalizeArabic(
      [s.titleAr, s.subtitleAr, s.situationAr, s.notionAr, s.questionAr, ...s.tags].join(' '),
    );
    return haystack.includes(q);
  });
}

/** Unités réellement couvertes par la banque, triées. */
export function coveredUnitIds(): number[] {
  return [...new Set(SITUATION_INDEX.flatMap((s) => s.unitIds))].sort((a, b) => a - b);
}

/** Situations qui mobilisent une unité donnée (principale ou secondaire). */
export function situationsForUnit(unitId: number): SituationCard[] {
  return SITUATION_INDEX.filter((s) => s.unitIds.includes(unitId));
}

/** Les contextes documentaires ouvrables pour une situation. */
export function practiceContextsForSituation(situationId: string) {
  const card = SITUATION_BY_ID[situationId];
  if (!card) return [];
  return DOCUMENT_PRACTICE_CONTEXTS.filter((c) => card.exerciseIds.includes(c.exerciseId));
}

/**
 * Exercices « élite » d'analyse documentaire rattachés à une situation.
 *
 * Sprint 21 : ces 19 exercices (questions avec verbe de consigne, indice de
 * rédaction, grille d'entraînement et correction) existaient depuis le sprint
 * Speckit §6 mais AUCUN composant ne les affichait — `situationIndex.ts` était
 * le seul fichier à les importer, et seulement pour valider des identifiants.
 * Ils étaient donc du contenu mort côté élève. Ce sélecteur les rend
 * atteignables depuis la fiche de situation.
 */
export function analysisExercisesForSituation(situationId: string) {
  const card = SITUATION_BY_ID[situationId];
  if (!card) return [];
  return DOCUMENT_ANALYSIS_EXERCISES.filter((e) => card.exerciseIds.includes(e.id));
}

export const SITUATION_COUNT = SITUATION_INDEX.length;
