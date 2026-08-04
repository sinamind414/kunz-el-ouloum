// Auto-generated.
// 1) 121 micro-tests enrichis derives des 500 QCM (src/data.ts -> SVT_QUIZ_QUESTIONS) :
//    algorithme : pour chaque QCM, la reponse officielle (option correcte) devient le trou
//    dans l'explication ("X يرتبط هنا بـ: _______"). lessonId derive de "محور U.L"
//    via la numerotation globale des lecons (درس N).
// 2) 40 micro-tests fillBlank d'origine (source Flutter) conserves tels quels.
// Aucun contenu invente.

export interface FillBlankMicroTest {
  prompt: string;
  acceptedAnswers: string[];
  errorHint: string;
}

export interface FillBlankQuestion {
  id: string;
  unitId: number;
  lessonId: number;
  type: 'TEXT_AND_PRODUCE';
  microTest: FillBlankMicroTest;
}

export const FILL_BLANK_QUESTIONS: FillBlankQuestion[] = [
  {
    id: 'fb_1_1',
    unitId: 1,
    lessonId: 1,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: الجين يرتبط هنا بـ: _______",
      acceptedAnswers: ["قطعة من ADN تحمل معلومة تركيب سلسلة ببتيدية أو بروتين معين"],
      errorHint: "التعريف الصحيح: قطعة من ADN تحمل معلومة تركيب سلسلة ببتيدية أو بروتين معين"
    }
  },
  {
    id: 'fb_1_2',
    unitId: 1,
    lessonId: 1,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: النيوكليوتيد يرتبط هنا بـ: _______",
      acceptedAnswers: ["الوحدة البنائية لـADN ويتكوّن من سكر وفوسفات وقاعدة آزوتية"],
      errorHint: "التعريف الصحيح: الوحدة البنائية لـADN ويتكوّن من سكر وفوسفات وقاعدة آزوتية"
    }
  },
  {
    id: 'fb_1_3',
    unitId: 1,
    lessonId: 2,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: قاعدة التكامل يرتبط هنا بـ: _______",
      acceptedAnswers: ["A تقابل T وG تقابل C في ADN"],
      errorHint: "التعريف الصحيح: A تقابل T وG تقابل C في ADN"
    }
  },
  {
    id: 'fb_1_4',
    unitId: 1,
    lessonId: 1,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: الشفرة الوراثية يرتبط هنا بـ: _______",
      acceptedAnswers: ["كل رامزة من ثلاث قواعد في ARNm تحدد حمضاً أمينياً"],
      errorHint: "التعريف الصحيح: كل رامزة من ثلاث قواعد في ARNm تحدد حمضاً أمينياً"
    }
  },
  {
    id: 'fb_1_5',
    unitId: 1,
    lessonId: 3,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: AUG يرتبط هنا بـ: _______",
      acceptedAnswers: ["رامزة بدء الترجمة وتشفر غالباً للميتيونين"],
      errorHint: "التعريف الصحيح: رامزة بدء الترجمة وتشفر غالباً للميتيونين"
    }
  },
  {
    id: 'fb_1_6',
    unitId: 1,
    lessonId: 3,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: UAA/UAG/UGA يرتبط هنا بـ: _______",
      acceptedAnswers: ["رامزات توقف لا يوافقها ARNt حامل لحمض أميني"],
      errorHint: "التعريف الصحيح: رامزات توقف لا يوافقها ARNt حامل لحمض أميني"
    }
  },
  {
    id: 'fb_1_7',
    unitId: 1,
    lessonId: 4,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: الشفرة المترادفة يرتبط هنا بـ: _______",
      acceptedAnswers: ["الحمض الأميني الواحد قد توافقه عدة رامزات"],
      errorHint: "التعريف الصحيح: الحمض الأميني الواحد قد توافقه عدة رامزات"
    }
  },
  {
    id: 'fb_1_8',
    unitId: 1,
    lessonId: 4,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: ARNm يرتبط هنا بـ: _______",
      acceptedAnswers: ["ينقل نسخة الرسالة الوراثية من النواة نحو الريبوزوم"],
      errorHint: "التعريف الصحيح: ينقل نسخة الرسالة الوراثية من النواة نحو الريبوزوم"
    }
  },
  {
    id: 'fb_1_9',
    unitId: 1,
    lessonId: 2,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: ARNt يرتبط هنا بـ: _______",
      acceptedAnswers: ["يحمل حمضاً أمينياً ومضاد رامزة مكمل لرامزة ARNm"],
      errorHint: "التعريف الصحيح: يحمل حمضاً أمينياً ومضاد رامزة مكمل لرامزة ARNm"
    }
  },
  {
    id: 'fb_1_10',
    unitId: 1,
    lessonId: 5,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: ARNr يرتبط هنا بـ: _______",
      acceptedAnswers: ["يدخل في تركيب الريبوزوم ويساهم في نشاطه"],
      errorHint: "التعريف الصحيح: يدخل في تركيب الريبوزوم ويساهم في نشاطه"
    }
  },
  {
    id: 'fb_1_11',
    unitId: 1,
    lessonId: 2,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: اليوراسيل U يرتبط هنا بـ: _______",
      acceptedAnswers: ["يعوض الثيمين T في جزيئات ARN"],
      errorHint: "التعريف الصحيح: يعوض الثيمين T في جزيئات ARN"
    }
  },
  {
    id: 'fb_2_36',
    unitId: 2,
    lessonId: 7,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: الحمض الأميني يرتبط هنا بـ: _______",
      acceptedAnswers: ["وحدة بناء البروتينات وله NH2 وCOOH وجذر R"],
      errorHint: "التعريف الصحيح: وحدة بناء البروتينات وله NH2 وCOOH وجذر R"
    }
  },
  {
    id: 'fb_2_37',
    unitId: 2,
    lessonId: 7,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: الجذر R يرتبط هنا بـ: _______",
      acceptedAnswers: ["اختلافه يحدد خصائص الحمض الأميني"],
      errorHint: "التعريف الصحيح: اختلافه يحدد خصائص الحمض الأميني"
    }
  },
  {
    id: 'fb_2_38',
    unitId: 2,
    lessonId: 7,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: الرابطة الببتيدية يرتبط هنا بـ: _______",
      acceptedAnswers: ["رابطة تساهمية بين COOH لحمض وNH2 لآخر مع طرح ماء"],
      errorHint: "التعريف الصحيح: رابطة تساهمية بين COOH لحمض وNH2 لآخر مع طرح ماء"
    }
  },
  {
    id: 'fb_2_39',
    unitId: 2,
    lessonId: 7,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: عديد الببتيد يرتبط هنا بـ: _______",
      acceptedAnswers: ["سلسلة طويلة من أحماض أمينية مترابطة بروابط ببتيدية"],
      errorHint: "التعريف الصحيح: سلسلة طويلة من أحماض أمينية مترابطة بروابط ببتيدية"
    }
  },
  {
    id: 'fb_2_40',
    unitId: 2,
    lessonId: 8,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: الطرف N يرتبط هنا بـ: _______",
      acceptedAnswers: ["نهاية السلسلة الحاملة للمجموعة الأمينية الحرة"],
      errorHint: "التعريف الصحيح: نهاية السلسلة الحاملة للمجموعة الأمينية الحرة"
    }
  },
  {
    id: 'fb_2_41',
    unitId: 2,
    lessonId: 7,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: الطرف C يرتبط هنا بـ: _______",
      acceptedAnswers: ["نهاية السلسلة الحاملة للمجموعة الكربوكسيلية الحرة"],
      errorHint: "التعريف الصحيح: نهاية السلسلة الحاملة للمجموعة الكربوكسيلية الحرة"
    }
  },
  {
    id: 'fb_2_42',
    unitId: 2,
    lessonId: 9,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: الأحماض الأمينية الأساسية يرتبط هنا بـ: _______",
      acceptedAnswers: ["لا يستطيع الجسم تركيبها بكمية كافية"],
      errorHint: "التعريف الصحيح: لا يستطيع الجسم تركيبها بكمية كافية"
    }
  },
  {
    id: 'fb_2_43',
    unitId: 2,
    lessonId: 9,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: تفاعل التكاثف يرتبط هنا بـ: _______",
      acceptedAnswers: ["ينتج الرابطة الببتيدية مع تحرير H2O"],
      errorHint: "التعريف الصحيح: ينتج الرابطة الببتيدية مع تحرير H2O"
    }
  },
  {
    id: 'fb_2_44',
    unitId: 2,
    lessonId: 7,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: التحلل المائي يرتبط هنا بـ: _______",
      acceptedAnswers: ["يكسر الرابطة الببتيدية بإضافة الماء"],
      errorHint: "التعريف الصحيح: يكسر الرابطة الببتيدية بإضافة الماء"
    }
  },
  {
    id: 'fb_2_45',
    unitId: 2,
    lessonId: 10,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: البنية الأولية يرتبط هنا بـ: _______",
      acceptedAnswers: ["تسلسل خطي للأحماض الأمينية في السلسلة"],
      errorHint: "التعريف الصحيح: تسلسل خطي للأحماض الأمينية في السلسلة"
    }
  },
  {
    id: 'fb_2_46',
    unitId: 2,
    lessonId: 10,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: البنية الثانوية يرتبط هنا بـ: _______",
      acceptedAnswers: ["لولب ألفا أو صفيحة بيتا تثبتهما روابط هيدروجينية"],
      errorHint: "التعريف الصحيح: لولب ألفا أو صفيحة بيتا تثبتهما روابط هيدروجينية"
    }
  },
  {
    id: 'fb_3_69',
    unitId: 3,
    lessonId: 11,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: الإنزيم يرتبط هنا بـ: _______",
      acceptedAnswers: ["محفز حيوي غالباً بروتيني يسرع التفاعل دون أن يستهلك"],
      errorHint: "التعريف الصحيح: محفز حيوي غالباً بروتيني يسرع التفاعل دون أن يستهلك"
    }
  },
  {
    id: 'fb_3_70',
    unitId: 3,
    lessonId: 11,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: الركيزة يرتبط هنا بـ: _______",
      acceptedAnswers: ["الجزيء الذي يعمل عليه الإنزيم"],
      errorHint: "التعريف الصحيح: الجزيء الذي يعمل عليه الإنزيم"
    }
  },
  {
    id: 'fb_3_71',
    unitId: 3,
    lessonId: 11,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: الناتج يرتبط هنا بـ: _______",
      acceptedAnswers: ["الجزيء المتحصل عليه بعد التحول الإنزيمي"],
      errorHint: "التعريف الصحيح: الجزيء المتحصل عليه بعد التحول الإنزيمي"
    }
  },
  {
    id: 'fb_3_72',
    unitId: 3,
    lessonId: 12,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: الموقع الفعال يرتبط هنا بـ: _______",
      acceptedAnswers: ["منطقة تثبيت الركيزة والتحفيز في الإنزيم"],
      errorHint: "التعريف الصحيح: منطقة تثبيت الركيزة والتحفيز في الإنزيم"
    }
  },
  {
    id: 'fb_3_73',
    unitId: 3,
    lessonId: 12,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: النوعية الإنزيمية يرتبط هنا بـ: _______",
      acceptedAnswers: ["مرتبطة بتكامل شكل وشحنات الموقع الفعال مع الركيزة"],
      errorHint: "التعريف الصحيح: مرتبطة بتكامل شكل وشحنات الموقع الفعال مع الركيزة"
    }
  },
  {
    id: 'fb_3_74',
    unitId: 3,
    lessonId: 11,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: المحفز يرتبط هنا بـ: _______",
      acceptedAnswers: ["يخفض طاقة التنشيط ولا يغير حصيلة التفاعل"],
      errorHint: "التعريف الصحيح: يخفض طاقة التنشيط ولا يغير حصيلة التفاعل"
    }
  },
  {
    id: 'fb_3_75',
    unitId: 3,
    lessonId: 13,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: E+S يرتبط هنا بـ: _______",
      acceptedAnswers: ["يتحول مؤقتاً إلى معقد ES قبل تحرير الناتج"],
      errorHint: "التعريف الصحيح: يتحول مؤقتاً إلى معقد ES قبل تحرير الناتج"
    }
  },
  {
    id: 'fb_3_76',
    unitId: 3,
    lessonId: 14,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: الإنزيم بعد التفاعل يرتبط هنا بـ: _______",
      acceptedAnswers: ["يبقى قابلاً لإعادة الاستعمال"],
      errorHint: "التعريف الصحيح: يبقى قابلاً لإعادة الاستعمال"
    }
  },
  {
    id: 'fb_3_77',
    unitId: 3,
    lessonId: 14,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: بنية الإنزيم يرتبط هنا بـ: _______",
      acceptedAnswers: ["تحدد نشاطه لأنها تحدد شكل الموقع الفعال"],
      errorHint: "التعريف الصحيح: تحدد نشاطه لأنها تحدد شكل الموقع الفعال"
    }
  },
  {
    id: 'fb_3_78',
    unitId: 3,
    lessonId: 15,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: النوعية المطلقة يرتبط هنا بـ: _______",
      acceptedAnswers: ["إنزيم لا يقبل إلا ركيزة محددة جداً"],
      errorHint: "التعريف الصحيح: إنزيم لا يقبل إلا ركيزة محددة جداً"
    }
  },
  {
    id: 'fb_3_79',
    unitId: 3,
    lessonId: 11,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: نوعية التفاعل يرتبط هنا بـ: _______",
      acceptedAnswers: ["إنزيم يحفز نمط تفاعل معيناً"],
      errorHint: "التعريف الصحيح: إنزيم يحفز نمط تفاعل معيناً"
    }
  },
  {
    id: 'fb_4_114',
    unitId: 4,
    lessonId: 16,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: الذات يرتبط هنا بـ: _______",
      acceptedAnswers: ["جزيئات يتعرف عليها الجهاز المناعي كمنتمية للجسم"],
      errorHint: "التعريف الصحيح: جزيئات يتعرف عليها الجهاز المناعي كمنتمية للجسم"
    }
  },
  {
    id: 'fb_4_115',
    unitId: 4,
    lessonId: 16,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: اللاذات يرتبط هنا بـ: _______",
      acceptedAnswers: ["عناصر غريبة قادرة على إثارة رد مناعي"],
      errorHint: "التعريف الصحيح: عناصر غريبة قادرة على إثارة رد مناعي"
    }
  },
  {
    id: 'fb_4_116',
    unitId: 4,
    lessonId: 17,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: CMH يرتبط هنا بـ: _______",
      acceptedAnswers: ["واسمات غشائية تساعد على تمييز الذات"],
      errorHint: "التعريف الصحيح: واسمات غشائية تساعد على تمييز الذات"
    }
  },
  {
    id: 'fb_4_117',
    unitId: 4,
    lessonId: 17,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: CMH I يرتبط هنا بـ: _______",
      acceptedAnswers: ["يوجد على معظم الخلايا المنواة ويعرض ببتيدات داخلية"],
      errorHint: "التعريف الصحيح: يوجد على معظم الخلايا المنواة ويعرض ببتيدات داخلية"
    }
  },
  {
    id: 'fb_4_118',
    unitId: 4,
    lessonId: 18,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: CMH II يرتبط هنا بـ: _______",
      acceptedAnswers: ["يوجد على خلايا تقديم المستضد وينشط LT4"],
      errorHint: "التعريف الصحيح: يوجد على خلايا تقديم المستضد وينشط LT4"
    }
  },
  {
    id: 'fb_4_119',
    unitId: 4,
    lessonId: 16,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: المستضد يرتبط هنا بـ: _______",
      acceptedAnswers: ["عنصر غريب يملك حاتمات نوعية"],
      errorHint: "التعريف الصحيح: عنصر غريب يملك حاتمات نوعية"
    }
  },
  {
    id: 'fb_4_120',
    unitId: 4,
    lessonId: 19,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: الحاتمة يرتبط هنا بـ: _______",
      acceptedAnswers: ["جزء محدد من المستضد يتعرف عليه مستقبل أو جسم مضاد"],
      errorHint: "التعريف الصحيح: جزء محدد من المستضد يتعرف عليه مستقبل أو جسم مضاد"
    }
  },
  {
    id: 'fb_4_121',
    unitId: 4,
    lessonId: 16,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: CPA يرتبط هنا بـ: _______",
      acceptedAnswers: ["خلية تقدم المستضد مثل البالعة الكبيرة"],
      errorHint: "التعريف الصحيح: خلية تقدم المستضد مثل البالعة الكبيرة"
    }
  },
  {
    id: 'fb_4_122',
    unitId: 4,
    lessonId: 20,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: رفض الطعم يرتبط هنا بـ: _______",
      acceptedAnswers: ["ينتج عن اختلاف واسمات CMH بين المعطي والمتلقي"],
      errorHint: "التعريف الصحيح: ينتج عن اختلاف واسمات CMH بين المعطي والمتلقي"
    }
  },
  {
    id: 'fb_4_123',
    unitId: 4,
    lessonId: 20,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: الباراتوب يرتبط هنا بـ: _______",
      acceptedAnswers: ["موقع ارتباط على الجسم المضاد أو مستقبل LB"],
      errorHint: "التعريف الصحيح: موقع ارتباط على الجسم المضاد أو مستقبل LB"
    }
  },
  {
    id: 'fb_4_124',
    unitId: 4,
    lessonId: 17,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: المناعة غير النوعية يرتبط هنا بـ: _______",
      acceptedAnswers: ["استجابة فطرية سريعة لا تستهدف مستضداً محدداً"],
      errorHint: "التعريف الصحيح: استجابة فطرية سريعة لا تستهدف مستضداً محدداً"
    }
  },
  {
    id: 'fb_5_162',
    unitId: 5,
    lessonId: 22,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: العصبون يرتبط هنا بـ: _______",
      acceptedAnswers: ["خلية متخصصة في استقبال ودمج ونقل الرسالة العصبية"],
      errorHint: "التعريف الصحيح: خلية متخصصة في استقبال ودمج ونقل الرسالة العصبية"
    }
  },
  {
    id: 'fb_5_163',
    unitId: 5,
    lessonId: 22,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: التغصنات يرتبط هنا بـ: _______",
      acceptedAnswers: ["تستقبل رسائل من عصبونات أخرى"],
      errorHint: "التعريف الصحيح: تستقبل رسائل من عصبونات أخرى"
    }
  },
  {
    id: 'fb_5_164',
    unitId: 5,
    lessonId: 22,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: المحور يرتبط هنا بـ: _______",
      acceptedAnswers: ["ينقل كمون العمل بعيداً عن الجسم الخلوي"],
      errorHint: "التعريف الصحيح: ينقل كمون العمل بعيداً عن الجسم الخلوي"
    }
  },
  {
    id: 'fb_5_165',
    unitId: 5,
    lessonId: 23,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: الغشاء العصبي يرتبط هنا بـ: _______",
      acceptedAnswers: ["يحافظ على فروق تراكيز أيونية بين الداخل والخارج"],
      errorHint: "التعريف الصحيح: يحافظ على فروق تراكيز أيونية بين الداخل والخارج"
    }
  },
  {
    id: 'fb_5_166',
    unitId: 5,
    lessonId: 23,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: القنوات الأيونية يرتبط هنا بـ: _______",
      acceptedAnswers: ["بروتينات تسمح بمرور نوعي للأيونات"],
      errorHint: "التعريف الصحيح: بروتينات تسمح بمرور نوعي للأيونات"
    }
  },
  {
    id: 'fb_5_167',
    unitId: 5,
    lessonId: 24,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: قنوات فولطية يرتبط هنا بـ: _______",
      acceptedAnswers: ["تنفتح أو تنغلق حسب فرق الكمون"],
      errorHint: "التعريف الصحيح: تنفتح أو تنغلق حسب فرق الكمون"
    }
  },
  {
    id: 'fb_5_168',
    unitId: 5,
    lessonId: 24,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: الغمد النخاعيني يرتبط هنا بـ: _______",
      acceptedAnswers: ["يزيد سرعة انتشار السيالة في الألياف المغمدة"],
      errorHint: "التعريف الصحيح: يزيد سرعة انتشار السيالة في الألياف المغمدة"
    }
  },
  {
    id: 'fb_5_169',
    unitId: 5,
    lessonId: 22,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: عقد رانفييه يرتبط هنا بـ: _______",
      acceptedAnswers: ["مناطق غير مغمدة يتم بينها الانتشار القفزي"],
      errorHint: "التعريف الصحيح: مناطق غير مغمدة يتم بينها الانتشار القفزي"
    }
  },
  {
    id: 'fb_5_170',
    unitId: 5,
    lessonId: 25,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: المضخة Na+/K+ يرتبط هنا بـ: _______",
      acceptedAnswers: ["بروتين غشائي يستعمل ATP للحفاظ على التدرجات"],
      errorHint: "التعريف الصحيح: بروتين غشائي يستعمل ATP للحفاظ على التدرجات"
    }
  },
  {
    id: 'fb_5_171',
    unitId: 5,
    lessonId: 22,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: الرسالة العصبية يرتبط هنا بـ: _______",
      acceptedAnswers: ["تشفّر غالباً بتواتر كمونات العمل"],
      errorHint: "التعريف الصحيح: تشفّر غالباً بتواتر كمونات العمل"
    }
  },
  {
    id: 'fb_5_172',
    unitId: 5,
    lessonId: 26,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: المستقبلات الغشائية يرتبط هنا بـ: _______",
      acceptedAnswers: ["تتعرف على النواقل العصبية في المشبك"],
      errorHint: "التعريف الصحيح: تتعرف على النواقل العصبية في المشبك"
    }
  },
  {
    id: 'fb_6_217',
    unitId: 6,
    lessonId: 27,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: الصانعة الخضراء يرتبط هنا بـ: _______",
      acceptedAnswers: ["عضية يتم فيها التركيب الضوئي في الخلايا اليخضورية"],
      errorHint: "التعريف الصحيح: عضية يتم فيها التركيب الضوئي في الخلايا اليخضورية"
    }
  },
  {
    id: 'fb_6_218',
    unitId: 6,
    lessonId: 27,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: الثيلاكويدات يرتبط هنا بـ: _______",
      acceptedAnswers: ["أكياس غشائية تحمل أصباغاً ومكونات المرحلة الضوئية"],
      errorHint: "التعريف الصحيح: أكياس غشائية تحمل أصباغاً ومكونات المرحلة الضوئية"
    }
  },
  {
    id: 'fb_6_219',
    unitId: 6,
    lessonId: 27,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: الغرانا يرتبط هنا بـ: _______",
      acceptedAnswers: ["تراص عدة ثيلاكويدات داخل الصانعة"],
      errorHint: "التعريف الصحيح: تراص عدة ثيلاكويدات داخل الصانعة"
    }
  },
  {
    id: 'fb_6_220',
    unitId: 6,
    lessonId: 27,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: الستروما يرتبط هنا بـ: _______",
      acceptedAnswers: ["سائل داخلي تتم فيه حلقة كالفن"],
      errorHint: "التعريف الصحيح: سائل داخلي تتم فيه حلقة كالفن"
    }
  },
  {
    id: 'fb_6_221',
    unitId: 6,
    lessonId: 27,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: اليخضور a يرتبط هنا بـ: _______",
      acceptedAnswers: ["صبغة أساسية تمتص الضوء وتطلق إلكترونات مثارة"],
      errorHint: "التعريف الصحيح: صبغة أساسية تمتص الضوء وتطلق إلكترونات مثارة"
    }
  },
  {
    id: 'fb_6_222',
    unitId: 6,
    lessonId: 28,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: اليخضور b يرتبط هنا بـ: _______",
      acceptedAnswers: ["صبغة مساعدة توسع مجال امتصاص الضوء"],
      errorHint: "التعريف الصحيح: صبغة مساعدة توسع مجال امتصاص الضوء"
    }
  },
  {
    id: 'fb_6_223',
    unitId: 6,
    lessonId: 28,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: الكاروتينات يرتبط هنا بـ: _______",
      acceptedAnswers: ["أصباغ مساعدة وتحمي من فائض الضوء"],
      errorHint: "التعريف الصحيح: أصباغ مساعدة وتحمي من فائض الضوء"
    }
  },
  {
    id: 'fb_6_224',
    unitId: 6,
    lessonId: 27,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: طيف الامتصاص يرتبط هنا بـ: _______",
      acceptedAnswers: ["يبين الأطوال الموجية التي تمتصها الصبغة"],
      errorHint: "التعريف الصحيح: يبين الأطوال الموجية التي تمتصها الصبغة"
    }
  },
  {
    id: 'fb_6_225',
    unitId: 6,
    lessonId: 29,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: طيف العمل يرتبط هنا بـ: _______",
      acceptedAnswers: ["يبين فعالية الأطوال الموجية في التركيب الضوئي"],
      errorHint: "التعريف الصحيح: يبين فعالية الأطوال الموجية في التركيب الضوئي"
    }
  },
  {
    id: 'fb_6_226',
    unitId: 6,
    lessonId: 29,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: الضوء الأحمر والأزرق يرتبط هنا بـ: _______",
      acceptedAnswers: ["يمتصهما اليخضور بفعالية عالية"],
      errorHint: "التعريف الصحيح: يمتصهما اليخضور بفعالية عالية"
    }
  },
  {
    id: 'fb_6_227',
    unitId: 6,
    lessonId: 29,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: الضوء الأخضر يرتبط هنا بـ: _______",
      acceptedAnswers: ["ينعكس جزئياً لذلك تبدو الأوراق خضراء"],
      errorHint: "التعريف الصحيح: ينعكس جزئياً لذلك تبدو الأوراق خضراء"
    }
  },
  {
    id: 'fb_7_262',
    unitId: 7,
    lessonId: 30,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: الميتوكندري يرتبط هنا بـ: _______",
      acceptedAnswers: ["عضية التنفس الخلوي الهوائي وإنتاج ATP"],
      errorHint: "التعريف الصحيح: عضية التنفس الخلوي الهوائي وإنتاج ATP"
    }
  },
  {
    id: 'fb_7_263',
    unitId: 7,
    lessonId: 30,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: الغشاء الداخلي يرتبط هنا بـ: _______",
      acceptedAnswers: ["يحمل السلسلة التنفسية وATP synthase"],
      errorHint: "التعريف الصحيح: يحمل السلسلة التنفسية وATP synthase"
    }
  },
  {
    id: 'fb_7_264',
    unitId: 7,
    lessonId: 30,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: الأعراف يرتبط هنا بـ: _______",
      acceptedAnswers: ["طيات تزيد مساحة الغشاء الداخلي"],
      errorHint: "التعريف الصحيح: طيات تزيد مساحة الغشاء الداخلي"
    }
  },
  {
    id: 'fb_7_265',
    unitId: 7,
    lessonId: 30,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: المصفوفة يرتبط هنا بـ: _______",
      acceptedAnswers: ["مقر أكسدة البيروفات وحلقة كريبس"],
      errorHint: "التعريف الصحيح: مقر أكسدة البيروفات وحلقة كريبس"
    }
  },
  {
    id: 'fb_7_266',
    unitId: 7,
    lessonId: 31,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: الغشاء الخارجي يرتبط هنا بـ: _______",
      acceptedAnswers: ["يفصل الميتوكندري عن الهيولى"],
      errorHint: "التعريف الصحيح: يفصل الميتوكندري عن الهيولى"
    }
  },
  {
    id: 'fb_7_267',
    unitId: 7,
    lessonId: 31,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: الحشوة الميتوكندرية يرتبط هنا بـ: _______",
      acceptedAnswers: ["تحتوي إنزيمات ودنا ميتوكندري"],
      errorHint: "التعريف الصحيح: تحتوي إنزيمات ودنا ميتوكندري"
    }
  },
  {
    id: 'fb_7_268',
    unitId: 7,
    lessonId: 31,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: وجود O2 يرتبط هنا بـ: _______",
      acceptedAnswers: ["يسمح باستمرار السلسلة التنفسية"],
      errorHint: "التعريف الصحيح: يسمح باستمرار السلسلة التنفسية"
    }
  },
  {
    id: 'fb_7_269',
    unitId: 7,
    lessonId: 30,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: ATP الميتوكندري يرتبط هنا بـ: _______",
      acceptedAnswers: ["ينتج بكثرة في الفسفرة التأكسدية"],
      errorHint: "التعريف الصحيح: ينتج بكثرة في الفسفرة التأكسدية"
    }
  },
  {
    id: 'fb_7_270',
    unitId: 7,
    lessonId: 32,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: تدرج H+ يرتبط هنا بـ: _______",
      acceptedAnswers: ["يتشكل عبر الغشاء الداخلي"],
      errorHint: "التعريف الصحيح: يتشكل عبر الغشاء الداخلي"
    }
  },
  {
    id: 'fb_7_271',
    unitId: 7,
    lessonId: 31,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: التحلل السكري يرتبط هنا بـ: _______",
      acceptedAnswers: ["تفكيك الغلوكوز إلى بيروفات في الهيولى"],
      errorHint: "التعريف الصحيح: تفكيك الغلوكوز إلى بيروفات في الهيولى"
    }
  },
  {
    id: 'fb_7_272',
    unitId: 7,
    lessonId: 32,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: المقر يرتبط هنا بـ: _______",
      acceptedAnswers: ["الهيولى وليس الميتوكندري"],
      errorHint: "التعريف الصحيح: الهيولى وليس الميتوكندري"
    }
  },
  {
    id: 'fb_8_307',
    unitId: 8,
    lessonId: 33,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: ATP يرتبط هنا بـ: _______",
      acceptedAnswers: ["جزيء طاقوي مباشر الاستعمال في الخلية"],
      errorHint: "التعريف الصحيح: جزيء طاقوي مباشر الاستعمال في الخلية"
    }
  },
  {
    id: 'fb_8_308',
    unitId: 8,
    lessonId: 33,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: ADP + Pi يرتبط هنا بـ: _______",
      acceptedAnswers: ["ينتجان عن حلمهة ATP"],
      errorHint: "التعريف الصحيح: ينتجان عن حلمهة ATP"
    }
  },
  {
    id: 'fb_8_309',
    unitId: 8,
    lessonId: 33,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: الحلمهة يرتبط هنا بـ: _______",
      acceptedAnswers: ["تحرر طاقة قابلة للاستعمال الخلوي"],
      errorHint: "التعريف الصحيح: تحرر طاقة قابلة للاستعمال الخلوي"
    }
  },
  {
    id: 'fb_8_310',
    unitId: 8,
    lessonId: 33,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: الاقتران الطاقوي يرتبط هنا بـ: _______",
      acceptedAnswers: ["ربط تفاعل محرر للطاقة بتفاعل مستهلك لها"],
      errorHint: "التعريف الصحيح: ربط تفاعل محرر للطاقة بتفاعل مستهلك لها"
    }
  },
  {
    id: 'fb_8_311',
    unitId: 8,
    lessonId: 33,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: فسفرة الجزيئات يرتبط هنا بـ: _______",
      acceptedAnswers: ["نقل فوسفات من ATP لتفعيل تفاعل"],
      errorHint: "التعريف الصحيح: نقل فوسفات من ATP لتفعيل تفاعل"
    }
  },
  {
    id: 'fb_8_312',
    unitId: 8,
    lessonId: 34,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: دورة ATP/ADP يرتبط هنا بـ: _______",
      acceptedAnswers: ["تضمن تداول الطاقة داخل الخلية"],
      errorHint: "التعريف الصحيح: تضمن تداول الطاقة داخل الخلية"
    }
  },
  {
    id: 'fb_8_313',
    unitId: 8,
    lessonId: 34,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: ATP ليس مخزناً بعيد المدى يرتبط هنا بـ: _______",
      acceptedAnswers: ["بل وسيط سريع التجدد"],
      errorHint: "التعريف الصحيح: بل وسيط سريع التجدد"
    }
  },
  {
    id: 'fb_8_314',
    unitId: 8,
    lessonId: 33,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: التفاعلات البنائية يرتبط هنا بـ: _______",
      acceptedAnswers: ["غالباً تستهلك ATP"],
      errorHint: "التعريف الصحيح: غالباً تستهلك ATP"
    }
  },
  {
    id: 'fb_8_315',
    unitId: 8,
    lessonId: 35,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: النقل الفعال يرتبط هنا بـ: _______",
      acceptedAnswers: ["مثال لعملية تستهلك ATP"],
      errorHint: "التعريف الصحيح: مثال لعملية تستهلك ATP"
    }
  },
  {
    id: 'fb_8_316',
    unitId: 8,
    lessonId: 35,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: العمل العضلي يرتبط هنا بـ: _______",
      acceptedAnswers: ["يعتمد مباشرة على حلمهة ATP"],
      errorHint: "التعريف الصحيح: يعتمد مباشرة على حلمهة ATP"
    }
  },
  {
    id: 'fb_8_317',
    unitId: 8,
    lessonId: 35,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: التركيب الضوئي يرتبط هنا بـ: _______",
      acceptedAnswers: ["ينتج مادة عضوية وO2"],
      errorHint: "التعريف الصحيح: ينتج مادة عضوية وO2"
    }
  },
  {
    id: 'fb_9_347',
    unitId: 9,
    lessonId: 36,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: الغلاف الصخري يرتبط هنا بـ: _______",
      acceptedAnswers: ["غلاف صلب من القشرة والبرنس العلوي ومجزأ إلى صفائح"],
      errorHint: "التعريف الصحيح: غلاف صلب من القشرة والبرنس العلوي ومجزأ إلى صفائح"
    }
  },
  {
    id: 'fb_9_348',
    unitId: 9,
    lessonId: 36,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: الأستينوسفير يرتبط هنا بـ: _______",
      acceptedAnswers: ["جزء لدن من البرنس العلوي يسمح بحركة الصفائح"],
      errorHint: "التعريف الصحيح: جزء لدن من البرنس العلوي يسمح بحركة الصفائح"
    }
  },
  {
    id: 'fb_9_349',
    unitId: 9,
    lessonId: 36,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: الصفيحة التكتونية يرتبط هنا بـ: _______",
      acceptedAnswers: ["قطعة صلبة من الغلاف الصخري تتحرك ببطء"],
      errorHint: "التعريف الصحيح: قطعة صلبة من الغلاف الصخري تتحرك ببطء"
    }
  },
  {
    id: 'fb_9_350',
    unitId: 9,
    lessonId: 36,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: القشرة المحيطية يرتبط هنا بـ: _______",
      acceptedAnswers: ["أكثف وأرق من القشرة القارية"],
      errorHint: "التعريف الصحيح: أكثف وأرق من القشرة القارية"
    }
  },
  {
    id: 'fb_9_351',
    unitId: 9,
    lessonId: 36,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: القشرة القارية يرتبط هنا بـ: _______",
      acceptedAnswers: ["أقل كثافة وأكثر سماكة غالباً"],
      errorHint: "التعريف الصحيح: أقل كثافة وأكثر سماكة غالباً"
    }
  },
  {
    id: 'fb_9_352',
    unitId: 9,
    lessonId: 37,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: حدود الصفائح يرتبط هنا بـ: _______",
      acceptedAnswers: ["تتركز عندها الزلازل والبراكين والتشوهات"],
      errorHint: "التعريف الصحيح: تتركز عندها الزلازل والبراكين والتشوهات"
    }
  },
  {
    id: 'fb_9_353',
    unitId: 9,
    lessonId: 37,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: الحركة السنوية يرتبط هنا بـ: _______",
      acceptedAnswers: ["تقاس غالباً بالسنتيمترات في السنة"],
      errorHint: "التعريف الصحيح: تقاس غالباً بالسنتيمترات في السنة"
    }
  },
  {
    id: 'fb_9_354',
    unitId: 9,
    lessonId: 36,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: الغلاف الصخري المحيطي يرتبط هنا بـ: _______",
      acceptedAnswers: ["يزداد سمكاً وكثافة بابتعاده عن الظهرة"],
      errorHint: "التعريف الصحيح: يزداد سمكاً وكثافة بابتعاده عن الظهرة"
    }
  },
  {
    id: 'fb_9_355',
    unitId: 9,
    lessonId: 38,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: البرنس العلوي يرتبط هنا بـ: _______",
      acceptedAnswers: ["يشمل جزءاً صلباً وآخر لدناً"],
      errorHint: "التعريف الصحيح: يشمل جزءاً صلباً وآخر لدناً"
    }
  },
  {
    id: 'fb_9_356',
    unitId: 9,
    lessonId: 38,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: الصفائح الكبرى يرتبط هنا بـ: _______",
      acceptedAnswers: ["مثل الإفريقية والأوراسية والهادئة"],
      errorHint: "التعريف الصحيح: مثل الإفريقية والأوراسية والهادئة"
    }
  },
  {
    id: 'fb_9_357',
    unitId: 9,
    lessonId: 38,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: خريطة الزلازل يرتبط هنا بـ: _______",
      acceptedAnswers: ["تكشف حدود الصفائح"],
      errorHint: "التعريف الصحيح: تكشف حدود الصفائح"
    }
  },
  {
    id: 'fb_10_390',
    unitId: 10,
    lessonId: 39,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: الزلزال يرتبط هنا بـ: _______",
      acceptedAnswers: ["اهتزاز مفاجئ ناتج عن تحرير طاقة على فالق"],
      errorHint: "التعريف الصحيح: اهتزاز مفاجئ ناتج عن تحرير طاقة على فالق"
    }
  },
  {
    id: 'fb_10_391',
    unitId: 10,
    lessonId: 39,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: البؤرة يرتبط هنا بـ: _______",
      acceptedAnswers: ["نقطة انطلاق الموجات في العمق"],
      errorHint: "التعريف الصحيح: نقطة انطلاق الموجات في العمق"
    }
  },
  {
    id: 'fb_10_392',
    unitId: 10,
    lessonId: 39,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: المركز السطحي يرتبط هنا بـ: _______",
      acceptedAnswers: ["إسقاط البؤرة على سطح الأرض"],
      errorHint: "التعريف الصحيح: إسقاط البؤرة على سطح الأرض"
    }
  },
  {
    id: 'fb_10_393',
    unitId: 10,
    lessonId: 39,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: الموجة P يرتبط هنا بـ: _______",
      acceptedAnswers: ["موجة طولية سريعة تنتشر في الصلب والسائل"],
      errorHint: "التعريف الصحيح: موجة طولية سريعة تنتشر في الصلب والسائل"
    }
  },
  {
    id: 'fb_10_394',
    unitId: 10,
    lessonId: 39,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: الموجة S يرتبط هنا بـ: _______",
      acceptedAnswers: ["موجة عرضية لا تنتشر في السوائل"],
      errorHint: "التعريف الصحيح: موجة عرضية لا تنتشر في السوائل"
    }
  },
  {
    id: 'fb_10_395',
    unitId: 10,
    lessonId: 40,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: الموجات L يرتبط هنا بـ: _______",
      acceptedAnswers: ["سطحية وبطيئة وكبيرة السعة ومدمرة"],
      errorHint: "التعريف الصحيح: سطحية وبطيئة وكبيرة السعة ومدمرة"
    }
  },
  {
    id: 'fb_10_396',
    unitId: 10,
    lessonId: 40,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: السيزموغرام يرتبط هنا بـ: _______",
      acceptedAnswers: ["تسجيل وصول الموجات الزلزالية"],
      errorHint: "التعريف الصحيح: تسجيل وصول الموجات الزلزالية"
    }
  },
  {
    id: 'fb_10_397',
    unitId: 10,
    lessonId: 40,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: فرق وصول P وS يرتبط هنا بـ: _______",
      acceptedAnswers: ["يساعد على حساب بعد المحطة عن البؤرة"],
      errorHint: "التعريف الصحيح: يساعد على حساب بعد المحطة عن البؤرة"
    }
  },
  {
    id: 'fb_10_398',
    unitId: 10,
    lessonId: 41,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: سرعة P يرتبط هنا بـ: _______",
      acceptedAnswers: ["أكبر من سرعة S لذلك تصل أولاً"],
      errorHint: "التعريف الصحيح: أكبر من سرعة S لذلك تصل أولاً"
    }
  },
  {
    id: 'fb_10_399',
    unitId: 10,
    lessonId: 39,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: الموجات السطحية يرتبط هنا بـ: _______",
      acceptedAnswers: ["تصل أخيراً غالباً وتسبب أضراراً كبيرة"],
      errorHint: "التعريف الصحيح: تصل أخيراً غالباً وتسبب أضراراً كبيرة"
    }
  },
  {
    id: 'fb_10_400',
    unitId: 10,
    lessonId: 41,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: السعة يرتبط هنا بـ: _______",
      acceptedAnswers: ["ترتبط بشدة الاهتزاز المسجل"],
      errorHint: "التعريف الصحيح: ترتبط بشدة الاهتزاز المسجل"
    }
  },
  {
    id: 'fb_11_440',
    unitId: 11,
    lessonId: 42,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: الظهرة يرتبط هنا بـ: _______",
      acceptedAnswers: ["حد تباعدي محيطي تتشكل عنده قشرة جديدة"],
      errorHint: "التعريف الصحيح: حد تباعدي محيطي تتشكل عنده قشرة جديدة"
    }
  },
  {
    id: 'fb_11_441',
    unitId: 11,
    lessonId: 42,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: الصهير البازلتي يرتبط هنا بـ: _______",
      acceptedAnswers: ["يصعد عند الظهرة نتيجة انخفاض الضغط"],
      errorHint: "التعريف الصحيح: يصعد عند الظهرة نتيجة انخفاض الضغط"
    }
  },
  {
    id: 'fb_11_442',
    unitId: 11,
    lessonId: 42,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: البازلت الوسائدي يرتبط هنا بـ: _______",
      acceptedAnswers: ["ينتج من تبرد اللافا سريعاً في ماء البحر"],
      errorHint: "التعريف الصحيح: ينتج من تبرد اللافا سريعاً في ماء البحر"
    }
  },
  {
    id: 'fb_11_443',
    unitId: 11,
    lessonId: 42,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: الدوليريت يرتبط هنا بـ: _______",
      acceptedAnswers: ["عروق تغذي البازلت على شكل قواطع"],
      errorHint: "التعريف الصحيح: عروق تغذي البازلت على شكل قواطع"
    }
  },
  {
    id: 'fb_11_444',
    unitId: 11,
    lessonId: 42,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: الغابرو يرتبط هنا بـ: _______",
      acceptedAnswers: ["صخر ماغماتي عميق بطيء التبلور في القشرة المحيطية"],
      errorHint: "التعريف الصحيح: صخر ماغماتي عميق بطيء التبلور في القشرة المحيطية"
    }
  },
  {
    id: 'fb_11_445',
    unitId: 11,
    lessonId: 43,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: البيريدوتيت يرتبط هنا بـ: _______",
      acceptedAnswers: ["صخر البرنس أسفل موهو المحيطي"],
      errorHint: "التعريف الصحيح: صخر البرنس أسفل موهو المحيطي"
    }
  },
  {
    id: 'fb_11_446',
    unitId: 11,
    lessonId: 43,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: الرواسب البحرية يرتبط هنا بـ: _______",
      acceptedAnswers: ["تزداد سماكتها بالابتعاد عن الظهرة"],
      errorHint: "التعريف الصحيح: تزداد سماكتها بالابتعاد عن الظهرة"
    }
  },
  {
    id: 'fb_11_447',
    unitId: 11,
    lessonId: 43,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: العمر المحيطي يرتبط هنا بـ: _______",
      acceptedAnswers: ["صغير عند الظهرة ويزداد بعيداً عنها"],
      errorHint: "التعريف الصحيح: صغير عند الظهرة ويزداد بعيداً عنها"
    }
  },
  {
    id: 'fb_11_448',
    unitId: 11,
    lessonId: 44,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: التدفق الحراري يرتبط هنا بـ: _______",
      acceptedAnswers: ["مرتفع قرب محور الظهرة"],
      errorHint: "التعريف الصحيح: مرتفع قرب محور الظهرة"
    }
  },
  {
    id: 'fb_11_449',
    unitId: 11,
    lessonId: 42,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: الثقوب الحرارية يرتبط هنا بـ: _______",
      acceptedAnswers: ["مياه ساخنة غنية بالمعادن قرب الظهرات"],
      errorHint: "التعريف الصحيح: مياه ساخنة غنية بالمعادن قرب الظهرات"
    }
  },
  {
    id: 'fb_11_450',
    unitId: 11,
    lessonId: 44,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: البناء المحيطي يرتبط هنا بـ: _______",
      acceptedAnswers: ["يعوض هدم الليثوسفير عند الغوص"],
      errorHint: "التعريف الصحيح: يعوض هدم الليثوسفير عند الغوص"
    }
  },
  // --- 40 micro-tests d'origine (Flutter) conserves ---
  {
    id: 'fb_10_596',
    unitId: 10,
    lessonId: 40,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: _______",
      acceptedAnswers: ["تصل أولاً"],
      errorHint: "التعريف الصحيح: تصل أولاً"
    }
  },
  {
    id: 'fb_10_599',
    unitId: 10,
    lessonId: 40,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: _______",
      acceptedAnswers: ["تعطي معلومات عن بنية الأرض الداخلية"],
      errorHint: "التعريف الصحيح: تعطي معلومات عن بنية الأرض الداخلية"
    }
  },
  {
    id: 'fb_10_602',
    unitId: 10,
    lessonId: 40,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: _______",
      acceptedAnswers: ["يقع تقريباً بين 30 و70 كم تحت القارات"],
      errorHint: "التعريف الصحيح: يقع تقريباً بين 30 و70 كم تحت القارات"
    }
  },
  {
    id: 'fb_10_605',
    unitId: 10,
    lessonId: 40,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: _______",
      acceptedAnswers: ["لا تنتشر فيها الموجات S"],
      errorHint: "التعريف الصحيح: لا تنتشر فيها الموجات S"
    }
  },
  {
    id: 'fb_11_608',
    unitId: 11,
    lessonId: 42,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: _______",
      acceptedAnswers: ["دليل على بركانية تحت مائية"],
      errorHint: "التعريف الصحيح: دليل على بركانية تحت مائية"
    }
  },
  {
    id: 'fb_11_611',
    unitId: 11,
    lessonId: 42,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: _______",
      acceptedAnswers: ["يدل على انغراز الصفيحة"],
      errorHint: "التعريف الصحيح: يدل على انغراز الصفيحة"
    }
  },
  {
    id: 'fb_11_614',
    unitId: 11,
    lessonId: 42,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: _______",
      acceptedAnswers: ["يشكل سلاسل جبلية"],
      errorHint: "التعريف الصحيح: يشكل سلاسل جبلية"
    }
  },
  {
    id: 'fb_11_617',
    unitId: 11,
    lessonId: 42,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: _______",
      acceptedAnswers: ["شاهد على محيط قديم"],
      errorHint: "التعريف الصحيح: شاهد على محيط قديم"
    }
  },
  {
    id: 'fb_11_620',
    unitId: 11,
    lessonId: 42,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: _______",
      acceptedAnswers: ["تفسر تاريخ المحيطات والسلاسل"],
      errorHint: "التعريف الصحيح: تفسر تاريخ المحيطات والسلاسل"
    }
  },
  {
    id: 'fb_1_503',
    unitId: 1,
    lessonId: 2,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: _______",
      acceptedAnswers: ["رسالة تقرأها الريبوزومات"],
      errorHint: "التعريف الصحيح: رسالة تقرأها الريبوزومات"
    }
  },
  {
    id: 'fb_1_506',
    unitId: 1,
    lessonId: 5,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: _______",
      acceptedAnswers: ["يقرأ السلسلة القالبية 3 نحو 5"],
      errorHint: "التعريف الصحيح: يقرأ السلسلة القالبية 3 نحو 5"
    }
  },
  {
    id: 'fb_2_509',
    unitId: 2,
    lessonId: 8,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: _______",
      acceptedAnswers: ["اختلاف R يحدد نوع الحمض الأميني"],
      errorHint: "التعريف الصحيح: اختلاف R يحدد نوع الحمض الأميني"
    }
  },
  {
    id: 'fb_2_512',
    unitId: 2,
    lessonId: 7,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: _______",
      acceptedAnswers: ["ينتج عن تفاعلات الجذور R"],
      errorHint: "التعريف الصحيح: ينتج عن تفاعلات الجذور R"
    }
  },
  {
    id: 'fb_2_515',
    unitId: 2,
    lessonId: 10,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: _______",
      acceptedAnswers: ["يتكون من أربع تحت وحدات"],
      errorHint: "التعريف الصحيح: يتكون من أربع تحت وحدات"
    }
  },
  {
    id: 'fb_3_518',
    unitId: 3,
    lessonId: 12,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: _______",
      acceptedAnswers: ["يفسر النوعية الإنزيمية"],
      errorHint: "التعريف الصحيح: يفسر النوعية الإنزيمية"
    }
  },
  {
    id: 'fb_3_521',
    unitId: 3,
    lessonId: 15,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: _______",
      acceptedAnswers: ["أكثر مرونة من نموذج القفل والمفتاح"],
      errorHint: "التعريف الصحيح: أكثر مرونة من نموذج القفل والمفتاح"
    }
  },
  {
    id: 'fb_3_524',
    unitId: 3,
    lessonId: 13,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: _______",
      acceptedAnswers: ["قد ينتج عن حرارة مرتفعة"],
      errorHint: "التعريف الصحيح: قد ينتج عن حرارة مرتفعة"
    }
  },
  {
    id: 'fb_3_527',
    unitId: 3,
    lessonId: 11,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: _______",
      acceptedAnswers: ["يمكن تقليل أثره بزيادة تركيز الركيزة"],
      errorHint: "التعريف الصحيح: يمكن تقليل أثره بزيادة تركيز الركيزة"
    }
  },
  {
    id: 'fb_4_530',
    unitId: 4,
    lessonId: 18,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: _______",
      acceptedAnswers: ["واسمات هوية بيولوجية"],
      errorHint: "التعريف الصحيح: واسمات هوية بيولوجية"
    }
  },
  {
    id: 'fb_4_533',
    unitId: 4,
    lessonId: 21,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: _______",
      acceptedAnswers: ["تستهدف خاصة المستضدات خارج الخلايا"],
      errorHint: "التعريف الصحيح: تستهدف خاصة المستضدات خارج الخلايا"
    }
  },
  {
    id: 'fb_4_536',
    unitId: 4,
    lessonId: 18,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: _______",
      acceptedAnswers: ["تتدخل في المناعة الخلوية"],
      errorHint: "التعريف الصحيح: تتدخل في المناعة الخلوية"
    }
  },
  {
    id: 'fb_5_539',
    unitId: 5,
    lessonId: 22,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: _______",
      acceptedAnswers: ["له تغصنات وجسم خلوي ومحور"],
      errorHint: "التعريف الصحيح: له تغصنات وجسم خلوي ومحور"
    }
  },
  {
    id: 'fb_5_542',
    unitId: 5,
    lessonId: 25,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: _______",
      acceptedAnswers: ["داخل الليف سالب بالنسبة للخارج"],
      errorHint: "التعريف الصحيح: داخل الليف سالب بالنسبة للخارج"
    }
  },
  {
    id: 'fb_5_545',
    unitId: 5,
    lessonId: 23,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: _______",
      acceptedAnswers: ["يخضع لقانون الكل أو لا شيء"],
      errorHint: "التعريف الصحيح: يخضع لقانون الكل أو لا شيء"
    }
  },
  {
    id: 'fb_5_548',
    unitId: 5,
    lessonId: 26,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: _______",
      acceptedAnswers: ["يستعمل نواقل عصبية"],
      errorHint: "التعريف الصحيح: يستعمل نواقل عصبية"
    }
  },
  {
    id: 'fb_5_551',
    unitId: 5,
    lessonId: 24,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: _______",
      acceptedAnswers: ["يساهم في الإدماج العصبي"],
      errorHint: "التعريف الصحيح: يساهم في الإدماج العصبي"
    }
  },
  {
    id: 'fb_6_554',
    unitId: 6,
    lessonId: 29,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: _______",
      acceptedAnswers: ["تحتوي تيلاكويدات وستروما"],
      errorHint: "التعريف الصحيح: تحتوي تيلاكويدات وستروما"
    }
  },
  {
    id: 'fb_6_557',
    unitId: 6,
    lessonId: 29,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: _______",
      acceptedAnswers: ["تتم في التيلاكويدات"],
      errorHint: "التعريف الصحيح: تتم في التيلاكويدات"
    }
  },
  {
    id: 'fb_6_560',
    unitId: 6,
    lessonId: 29,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: _______",
      acceptedAnswers: ["تنتج مواد عضوية"],
      errorHint: "التعريف الصحيح: تنتج مواد عضوية"
    }
  },
  {
    id: 'fb_7_563',
    unitId: 7,
    lessonId: 30,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: _______",
      acceptedAnswers: ["تنتج كثيراً من ATP في وجود O2"],
      errorHint: "التعريف الصحيح: تنتج كثيراً من ATP في وجود O2"
    }
  },
  {
    id: 'fb_7_566',
    unitId: 7,
    lessonId: 30,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: _______",
      acceptedAnswers: ["لا يتطلب O2 مباشرة"],
      errorHint: "التعريف الصحيح: لا يتطلب O2 مباشرة"
    }
  },
  {
    id: 'fb_7_569',
    unitId: 7,
    lessonId: 30,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: _______",
      acceptedAnswers: ["نقطة دخول كريبس"],
      errorHint: "التعريف الصحيح: نقطة دخول كريبس"
    }
  },
  {
    id: 'fb_7_572',
    unitId: 7,
    lessonId: 30,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: _______",
      acceptedAnswers: ["يسمح باستمرار التحلل السكري"],
      errorHint: "التعريف الصحيح: يسمح باستمرار التحلل السكري"
    }
  },
  {
    id: 'fb_8_575',
    unitId: 8,
    lessonId: 35,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: _______",
      acceptedAnswers: ["دور مركزي لـATP"],
      errorHint: "التعريف الصحيح: دور مركزي لـATP"
    }
  },
  {
    id: 'fb_8_578',
    unitId: 8,
    lessonId: 35,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: _______",
      acceptedAnswers: ["العمليتان مرتبطتان في المحيط الحيوي"],
      errorHint: "التعريف الصحيح: العمليتان مرتبطتان في المحيط الحيوي"
    }
  },
  {
    id: 'fb_8_581',
    unitId: 8,
    lessonId: 35,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: _______",
      acceptedAnswers: ["التنفس الهوائي أكثر مردودية من التخمر"],
      errorHint: "التعريف الصحيح: التنفس الهوائي أكثر مردودية من التخمر"
    }
  },
  {
    id: 'fb_9_584',
    unitId: 9,
    lessonId: 37,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: _______",
      acceptedAnswers: ["مجزأ إلى صفائح"],
      errorHint: "التعريف الصحيح: مجزأ إلى صفائح"
    }
  },
  {
    id: 'fb_9_587',
    unitId: 9,
    lessonId: 37,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: _______",
      acceptedAnswers: ["ترتبط بتدفق حراري مرتفع"],
      errorHint: "التعريف الصحيح: ترتبط بتدفق حراري مرتفع"
    }
  },
  {
    id: 'fb_9_590',
    unitId: 9,
    lessonId: 37,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: _______",
      acceptedAnswers: ["تثبت توسع قاع المحيط"],
      errorHint: "التعريف الصحيح: تثبت توسع قاع المحيط"
    }
  },
  {
    id: 'fb_9_593',
    unitId: 9,
    lessonId: 37,
    type: 'TEXT_AND_PRODUCE',
    microTest: {
      prompt: "أكمل: _______",
      acceptedAnswers: ["تساهم في ديناميكية الصفائح"],
      errorHint: "التعريف الصحيح: تساهم في ديناميكية الصفائح"
    }
  },
];

// Total: 121 enrichis (QCM) + 40 d'origine = 161 micro-tests.
// QCM sans reference "محور": 85 (lessonId repli sur la 1re lecon de l'unite).
