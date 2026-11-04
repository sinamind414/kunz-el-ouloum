/* ============================================================
   BAC SVT Algérie 2021 — شعبة رياضيات — entraînement 4D
   ------------------------------------------------------------
   Énoncé + corrigé officiels (dzexams, 12 pages, couche texte
   inversée reconstituée mot à mot, 2026-08-31) :
     https://www.dzexams.com/ar/annales/T2tYS3FTcFRwWCtCbXV2QmFyRTcydz09
   Format Maths : 2 sujets × 2 exercices (8 + 12).
   id = 2021-m pour ne pas collisionner avec une année SE 2021.
   ============================================================ */

const OFFICIAL = (page, notes) => ({
  bacPromptSource: "official",
  bacPromptPage: page,
  bacPromptVerifiedAt: "2026-08-31",
  bacPromptNotes: notes
});

const RECON = (notes) => ({
  bacPromptSource: "reconstructed",
  bacPromptNotes: notes
});

const PDF_NOTE =
  "PDF officiel non redistribué dans le dépôt. Page annales (consultée 2026-08-31) : https://www.dzexams.com/ar/annales/T2tYS3FTcFRwWCtCbXV2QmFyRTcydz09. Viewer 12 pages, pièces jointes sciences-m-bac2021 + sciences-m-bac2021-correction. Couche texte inversée reconstituée mot à mot. Format Maths : 2 exercices (8+12).";

export const YEAR_2021_M = {
  id: "2021-m",
  stream: "m",
  calendarYear: "2021",
  label: "بكالوريا الجزائر دورة 2021 — شعبة رياضيات",
  theme: "indigo",
  enabled: true,
  sujets: [
    {
      id: 1,
      pdf: null,
      pdfExternalUrl: "https://www.dzexams.com/ar/annales/T2tYS3FTcFRwWCtCbXV2QmFyRTcydz09",
      pdfLocalUrl: "/subjects/M/2021/sujet-1.pdf",
      pdfNote: PDF_NOTE,
      title: "الموضوع الأول",
      exercises: [
        {
          number: 1,
          ui: "text",
          label: "CMH والتوافق النسيجي في زرع الكلية",
          max: 8,
          desc: "مورثات CMH I و CMH II على الصبغي 6 وسبب ارتفاع التوافق النسيجي بين الإخوة مقارنة بالوالدين",
          poles: {
            N: {
              points: 1,
              prompt: "تأطير الإشكالية: لماذا يكون التوافق النسيجي أكبر بين المريض وأخيه؟",
              bacPrompt:
                "لماذا يكون التوافق النسيجي بين المريض وأخيه أكبر مما هو بينه وبين والديه بما يسمح بنقل آمن للكلية؟",
              ...RECON(
                "Pas de question officielle autonome de type حدد المشكل. Reformulation pédagogique du préambule page 1."
              ),
              placeholder: "صياغة المشكل العلمي...",
              minLength: 30,
              modelAnswer:
                "المشكل العلمي: لماذا يرتفع التوافق النسيجي بين المريض وأخيه مقارنة بوالديه بما يسمح بنقل آمن للكلية؟",
              rule: {
                prompt: "حدد المشكل العلمي حول التوافق النسيجي",
                keywords: ["توافق", "نسيجي", "كليه"],
                minHits: 2,
                forbidden: []
              }
            },
            S: {
              points: 2,
              prompt: "اقتراح نمط وراثي هجين لمورثات CMH للأب والأم",
              bacPrompt: "اقترح نمطا وراثيا هجينا خاصا بمورثات الـ CMH لكل من الأب والأم.",
              ...OFFICIAL(
                1,
                "Relecture du PDF dzexams 2021 Maths (couche inversée, reconstituée). Verbe officiel : اقترح. Question 1 du التمرين الأول. Consigne حدد النمط الوراثي لولدين non mappée."
              ),
              placeholder: "الأب: أليلات من الصبغي 6... الأم: ...",
              minLength: 40,
              modelAnswer:
                "الأب هجين لمورثات CMH الستة A و C و B و DR و DQ و DP المحمولة على الصبغي 6، بنسختين مختلفتين من كل أليل. الأم هجينة كذلك بنسختين مختلفتين. يقبل أي نمط وراثي هجين ممثل بتمثيل صبغي أو بالحروف.",
              rule: {
                prompt: "اقترح نمطا وراثيا هجينا للأب والأم",
                keywords: ["اب", "ام", "هجين", "CMH"],
                minHits: 3,
                forbidden: []
              }
            },
            E: {
              points: 4,
              prompt: "النص العلمي: سبب ارتفاع التوافق النسيجي بين الإخوة",
              bacPrompt:
                "وضّح في نص علمي سبب ارتفاع نسبة التوافق النسيجي بين المريض وأخيه مقارنة بينه وبين والديه بما يسمح بنقل آمن للكلية.",
              ...OFFICIAL(
                1,
                "Relecture du PDF dzexams 2021 Maths (couche inversée, reconstituée). Verbe officiel : وضّح في نص علمي. Question 3 du التمرين الأول."
              ),
              placeholder: "مقدمة، عرض، خاتمة...",
              minLength: 120,
              modelAnswer:
                "يستدعي نجاح نقل الأعضاء توافقا نسيجيا عاليا بين المانح والمستقبل. تشكل جزيئات HLA I على سطح الخلايا ذات الأنوية (مورثات CMH I) وجزيئات HLA II على سطح بعض الخلايا المناعية (مورثات CMH II) هوية بيولوجية. مورثات CMH الستة A و C و B و DR و DQ و DP محمولة على الصبغي 6 تنتقل معا ولا توجد بينها سيادة. يملك كل فرد زوجا من الصبغي 6 فيأخذ الأبناء صبغيا من الأب وصبغيا من الأم فتكون نسبة التشابه مع كل والد 50 بالمئة، بينما يمكن أن يأخذ بعض الإخوة نفس الزوج من الصبغي 6 فترتفع نسبة التشابه إلى 100 بالمئة ويسمح ذلك بنقل آمن للكلية من أخ إلى أخيه.",
              rule: {
                prompt: "وضح سبب ارتفاع التوافق النسيجي بين الإخوة",
                keywords: ["صبغي", "اخوه", "توافق", "CMH"],
                minHits: 3,
                forbidden: []
              }
            },
            W: {
              points: 1,
              prompt: "الخاتمة: أهمية تحديد النمط الوراثي لنظام التوافق النسيجي",
              bacPrompt: "ما أهمية اكتشاف النمط الوراثي لنظام التوافق النسيجي عند نقل الأعضاء بين الإخوة؟",
              ...RECON("Clôture issue du corrigé officiel (الخاتمة). Pas une question BAC autonome."),
              placeholder: "في الختام...",
              minLength: 40,
              modelAnswer:
                "في الختام، يسمح تحديد النمط الوراثي لنظام التوافق النسيجي بتفادي رفض الطعوم الناتجة عن نقل الأعضاء، ويكون النقل آمنا بين الإخوة كلما زاد عددهم.",
              rule: {
                prompt: "اكتب خاتمة حول نقل الأعضاء بين الإخوة",
                keywords: ["توافق", "اخوه", "نقل"],
                minHits: 2,
                forbidden: []
              }
            }
          }
        },
        {
          number: 2,
          ui: "text",
          label: "الماكروليد ومقاومة البكتيريا (Mex.R)",
          max: 12,
          desc: "تثبيط الترجمة بالماكروليد على الريبوزوم، ومقاومة السلالة الطافرة بزيادة المضخات الغشائية بعد طفرة Mex.R",
          poles: {
            N: {
              points: 1,
              prompt: "اقتراح فرضية تفسر اكتساب البكتيريا مقاومة للماكروليد",
              bacPrompt:
                "اقترح فرضية تفسر بها كيفية اكتساب بعض السلالات البكتيرية مقاومة لتأثير المضاد الحيوي.",
              ...OFFICIAL(
                2,
                "Relecture du PDF dzexams 2021 Maths. Verbe officiel : اقترح فرضية. Question 2ب du الجزء الأول."
              ),
              placeholder: "الفرضية: تعمل البكتيريا على إخراج الماكروليد...",
              minLength: 30,
              modelAnswer:
                "الفرضية: تعمل البكتيريا على إخراج الماكروليد الداخل عبر غشائها حتى لا يتثبت على الريبوزوم.",
              rule: {
                prompt: "اقترح فرضية حول مقاومة الماكروليد",
                keywords: ["فرضيه", "ماكروليد", "ريبوزوم"],
                minHits: 2,
                forbidden: []
              }
            },
            S: {
              points: 3,
              prompt: "تحديد مستوى تأثير الماكروليد بتحليل الشكل (أ)",
              bacPrompt:
                "حدد المستوى المحتمل لتأثير المضاد الحيوي الماكروليد بتحليلك للشكل (أ) من الوثيقة 1.",
              ...OFFICIAL(
                2,
                "Relecture du PDF dzexams 2021 Maths. Verbe officiel : حدد. Question 1 du الجزء الأول."
              ),
              placeholder: "إدماج اليوريدين المشع مقابل الأحماض الأمينية المشعة...",
              minLength: 90,
              modelAnswer:
                "يمثل المنحنى تغير نسبة الإشعاع بدلالة الزمن. من 0 إلى 10 د تزداد النسبة المئوية لإدماج اليوريدين المشع من 0 إلى 50 بالمئة بينما تكون نسبة إدماج الأحماض الأمينية المشعة قليلة من 0 إلى 5 بالمئة وتبقى نسبة البروتينات البكتيرية قليلة جدا. ومنه نستنتج أن الماكروليد يؤثر على مرحلة الترجمة ولا يؤثر على مرحلة النسخ.",
              rule: {
                prompt: "حدد مستوى تأثير الماكروليد من الشكل أ",
                keywords: ["يوريدين", "ترجمه", "نسخ", "اشعاع"],
                minHits: 3,
                forbidden: ["بسبب"],
                document: {
                  kind: "curve",
                  axes: ["اشعاع", "زمن"],
                  comparisons: [["يوريدين", "امينيه"]],
                  trends: [
                    { about: "يوريدين", expect: ["تزداد", "50"] },
                    { about: "امينيه", expect: ["قليله", "5"] }
                  ],
                  relations: [{ type: "parallel", a: "يوريدين", b: "امينيه" }],
                  values: ["50"],
                  strictValues: true
                }
              }
            },
            E: {
              points: 6,
              prompt: "تفسير اكتساب خاصية المقاومة باستغلال الوثيقتين 2 و 3",
              bacPrompt:
                "باستغلالك للوثيقتين 2 و 3 فسّر كيف تكتسب إحدى السلالتين خاصية مقاومة المضاد الحيوي.",
              ...OFFICIAL(
                3,
                "Relecture du PDF dzexams 2021 Maths et du corrigé. Verbe officiel : فسّر. Question 1 du الجزء الثاني. Consigne اشرح آلية التأثير على التكاثر (الجزء الأول 2أ) non mappée."
              ),
              placeholder: "قنوات دخول، مضخات إخراج، طفرة Mex.R، رامزة التوقف...",
              minLength: 110,
              modelAnswer:
                "تحتوي أغشية البكتيريا على قنوات تسمح بدخول الماكروليد إلى الهيولى ومضخات تعمل على إخراجه. عند السلالة الطبيعية يكون تركيز الماكروليد داخل البكتيريا أكبر من تركيزه خارجها وعدد المضخات قليل. عند السلالة الطافرة ينخفض التركيز الداخلي ويرتفع الخارجي ويزداد عدد المضخات. يثبط بروتين Mex.R تركيب هذه المضخات. عند الطبيعية تُترجم المورثة إلى His-Ala-Glu-Ala-Ile-Met-Ser-Cys-Val. عند الطافرة استبدال C في الثلاثية أنتج رامزة توقف UGA فسُلسلة أقصر غير فعالة. فيصبح Mex.R غير فعال فيزيد عدد المضخات وتتخلص البكتيريا من الماكروليد مكتسبة مقاومة له.",
              rule: {
                prompt: "فسر اكتساب مقاومة الماكروليد",
                keywords: ["مضخات", "Mex", "طافره", "توقف"],
                minHits: 3,
                forbidden: [],
                wrongConcepts: ["هيموغلوبين", "ASIC1a"]
              }
            },
            W: {
              points: 2,
              prompt: "نص علمي: استعمال المضادات الحيوية وتجنب ظهور سلالات مقاومة",
              bacPrompt:
                "أنشئ في نص علمي دقيق كيف يمكن استعمال المضادات الحيوية في مكافحة الإصابات البكتيرية وفي نفس الوقت تجنب ظهور سلالات مقاومة.",
              ...OFFICIAL(
                3,
                "Relecture du PDF dzexams 2021 Maths. Verbe officiel : أنشئ في نص علمي. Question du الجزء الثالث. Consigne قدم نصيحة حول الاستعمال المفرط non mappée."
              ),
              placeholder: "تثبيط تركيب البروتين... الاستعمال الرشيد...",
              minLength: 50,
              modelAnswer:
                "يمكن استعمال المضادات الحيوية في مكافحة الإصابات البكتيرية حيث تثبط تركيب بروتيناتها في إحدى مراحل نموها وتكاثرها. ولتجنب ظهور سلالات بكتيرية مقاومة يجب استعمالها تحت المراقبة الطبية والالتزام بالمدة المحددة دون إفراط.",
              rule: {
                prompt: "اكتب نصا علميا حول استعمال المضادات الحيوية",
                keywords: ["مضادات", "مقاومه", "بكتيريا"],
                minHits: 2,
                forbidden: []
              }
            }
          }
        }
      ]
    },
    {
      id: 2,
      pdf: null,
      pdfExternalUrl: "https://www.dzexams.com/ar/annales/T2tYS3FTcFRwWCtCbXV2QmFyRTcydz09",
      pdfLocalUrl: "/subjects/M/2021/sujet-2.pdf",
      pdfNote: PDF_NOTE,
      title: "الموضوع الثاني",
      exercises: [
        {
          number: 1,
          ui: "text",
          label: "عناصر تركيب البروتين عند حقيقيات النواة",
          max: 8,
          desc: "دور ARN بوليميراز (س) في النسخ ودور الريبوزوم (ع) في الترجمة ومعادلة تشكل ثنائي الببتيد",
          poles: {
            N: {
              points: 1,
              prompt: "تأطير الإشكالية: كيف يتدخل العنصران س و ع في تركيب البروتين؟",
              bacPrompt: "كيف يتدخل العنصران (س) و(ع) في تركيب البروتين عند الخلايا حقيقية النواة؟",
              ...RECON("Préambule page 4. Pas de question officielle autonome de cadrage."),
              placeholder: "صياغة المشكل العلمي...",
              minLength: 30,
              modelAnswer:
                "المشكل العلمي: كيف يتدخل أنزيم ARN بوليميراز والريبوزوم في تركيب البروتين عند حقيقيات النواة؟",
              rule: {
                prompt: "حدد المشكل العلمي حول تركيب البروتين",
                keywords: ["بروتين", "نسخ", "ترجمه"],
                minHits: 2,
                forbidden: []
              }
            },
            S: {
              points: 2,
              prompt: "تسمية البيانات المرقمة والعنصرين (س) و(ع)",
              bacPrompt: "سمّ البيانات المرقمة والعنصرين (س) و(ع).",
              ...OFFICIAL(
                4,
                "Relecture du PDF dzexams 2021 Maths. Verbe officiel : سمّ. Question 1 du التمرين الأول (Sujet 2). Consignes حدد مراحل تدخل و اكتب معادلة ثنائي الببتيد non mappées."
              ),
              placeholder: "1 نيكليوتيدات ريبية حرة... (س) ARN بوليميراز...",
              minLength: 40,
              modelAnswer:
                "1 نيكليوتيدات ريبية حرة. 2 سلسلة الـ ADN المستنسخة. 3 سلسلة الـ ADN غير المستنسخة. 4 ARNt يحمل حمضا أمينيا منشطا. 5 تحت وحدة صغرى. 6 تحت وحدة كبرى. (س): أنزيم الـ ARN بوليميراز. (ع): ريبوزوم.",
              rule: {
                prompt: "سم البيانات المرقمة والعنصرين س و ع",
                keywords: ["بوليميراز", "ريبوزوم", "ADN", "ARNt"],
                minHits: 3,
                forbidden: []
              }
            },
            E: {
              points: 4,
              prompt: "النص العلمي: تدخل العنصرين (س) و(ع) في تركيب البروتين",
              bacPrompt: "وضّح في نص علمي كيف يتدخل العنصران (س) و(ع) في تركيب البروتين.",
              ...OFFICIAL(
                4,
                "Relecture du PDF dzexams 2021 Maths et du corrigé. Verbe officiel : وضّح في نص علمي. Question 4 du التمرين الأول (Sujet 2)."
              ),
              placeholder: "مقدمة، عرض: النسخ ثم الترجمة، خاتمة...",
              minLength: 120,
              modelAnswer:
                "تتدخل عدة عناصر متخصصة في تركيب البروتين عند حقيقيات النواة أهمها ARN بوليميراز والريبوزوم. يثبت أنزيم ARN بوليميراز على بداية المورثة ويفكك جزء من جزيئة ADN ويربط النيكليوتيدات الريبية الحرة فينتج ARNm في النواة. يثبت الريبوزوم على بداية ARNm في الهيولى ويربط الأحماض الأمينية في متتالية محددة وفق المعلومة الوراثية. يضمن ARN بوليميراز عملية النسخ في النواة وينتج ARNm الذي يترجمه الريبوزوم في الهيولى إلى سلسلة ببتيدية. معادلة تشكل ثنائي الببتيد: حمض أميني + حمض أميني يعطي ثنائي ببتيد + ماء.",
              rule: {
                prompt: "وضح تدخل س و ع في تركيب البروتين",
                keywords: ["بوليميراز", "ريبوزوم", "نسخ", "ترجمه"],
                minHits: 3,
                forbidden: [],
                equation: { tokens: ["حمض", "ببتيد", "ماء"], minTokens: 2 }
              }
            },
            W: {
              points: 1,
              prompt: "الخاتمة: مقر وناتج النسخ والترجمة",
              bacPrompt: "ما مقر وناتج تدخل ARN بوليميراز والريبوزوم في تركيب البروتين؟",
              ...RECON("Clôture issue du corrigé officiel (الخاتمة). Pas une question BAC autonome."),
              placeholder: "في الختام...",
              minLength: 40,
              modelAnswer:
                "في الختام، يضمن ARN بوليميراز النسخ في النواة فينتج ARNm، ويترجمه الريبوزوم في الهيولى إلى سلسلة ببتيدية.",
              rule: {
                prompt: "اكتب خاتمة حول النسخ والترجمة",
                keywords: ["نواه", "هيولي", "ARNm"],
                minHits: 2,
                forbidden: []
              }
            }
          }
        },
        {
          number: 2,
          ui: "text",
          label: "الهيموغلوبين والبنيتان R و T",
          max: 12,
          desc: "تغير بنية الهيموغلوبين بين R و T حسب pH الدم، الرابطة الشاردية His146-Asp94، وخطورة الاختناق بـ CO2",
          poles: {
            N: {
              points: 1,
              prompt: "تقديم فرضية تفسر سبب تغير بنية الهيموغلوبين",
              bacPrompt: "قدم فرضية تفسر بها سبب تغير بنية الهيموغلوبين.",
              ...OFFICIAL(
                5,
                "Relecture du PDF dzexams 2021 Maths. Verbe officiel : قدم فرضية. Question 2 du الجزء الأول (Sujet 2, Ex2)."
              ),
              placeholder: "الفرضية: تتغير البنية نتيجة نشأة أو اختفاء روابط...",
              minLength: 30,
              modelAnswer:
                "الفرضية: تتغير بنية الهيموغلوبين نتيجة نشأة أو اختفاء روابط كيميائية بحسب تغير pH الوسط.",
              rule: {
                prompt: "قدم فرضية حول تغير بنية الهيموغلوبين",
                keywords: ["فرضيه", "روابط", "pH"],
                minHits: 2,
                forbidden: []
              }
            },
            S: {
              points: 3,
              prompt: "المقارنة بين البنيتين R و T لجزيئة الهيموغلوبين",
              bacPrompt: "قارن بين البنية (R) والبنية (T) لجزيئة الهيموغلوبين.",
              ...OFFICIAL(
                5,
                "Relecture du PDF dzexams 2021 Maths. Verbe officiel : قارن. Question 1 du الجزء الأول (Sujet 2, Ex2)."
              ),
              placeholder: "نفس السلاسل α و β... في R تثبيت O2... في T روابط إضافية...",
              minLength: 90,
              modelAnswer:
                "تتكون البنيتان R و T من نفس السلاسل الببتيدية α1 و α2 و β1 و β2 مترابطة فيما بينها بروابط كارهة للماء. في البنية R تترابط هذه السلاسل بروابط كارهة للماء فقط مما يسمح بتثبيت جزيئة ثنائي الأكسجين بينما في البنية T تترابط السلاسل بروابط كارهة للماء بالإضافة إلى روابط أخرى تحرر جزيئة ثنائي الأكسجين. ومنه نستنتج أن جزيئة الهيموغلوبين تتغير بنيتها لأداء وظيفة محددة.",
              rule: {
                prompt: "قارن بين البنيتين R و T",
                keywords: ["سلاسل", "كارهه", "اكسجين", "وظيفه"],
                minHits: 3,
                forbidden: ["بسبب"],
                document: {
                  kind: "curve",
                  axes: ["بنيه", "اكسجين"],
                  comparisons: [["R", "T"]],
                  trends: [
                    { about: "R", expect: ["تثبيت", "اكسجين"] },
                    { about: "T", expect: ["تحرر", "روابط"] }
                  ],
                  relations: [{ type: "parallel", a: "R", b: "T" }],
                  values: [],
                  strictValues: false
                }
              }
            },
            E: {
              points: 6,
              prompt: "تحليل الشكل (أ) ومناقشة صحة الفرضية من الوثيقة 2",
              bacPrompt: "حلّل النتائج الموضحة في الشكل (أ) من الوثيقة 2 مبرزا سبب التغير في الـ pH.",
              ...OFFICIAL(
                6,
                "Relecture du PDF dzexams 2021 Maths. Verbe officiel : حلّل. Question 1 du الجزء الثاني. Consignes فسّر الشكل (ب) و ناقش الفرضية و بيّن خطورة انخفاض pH non mappées."
              ),
              placeholder: "pH=7.4 بنية R... pH=7.3 بنية T... رابطة شاردية His146-Asp94...",
              minLength: 110,
              modelAnswer:
                "يمثل الشكل (أ) مخططا تفسيريا لآلية تغير pH بلازما الدم الصادر من الرئتين والوارد إلى الخلايا. على مستوى الرئتين يثبت ثنائي الأكسجين على البنية R ويكون pH الدم الصادر 7.4. عند وصوله إلى الخلايا ينخفض pH الدم إلى 7.3 وتتغير البنية R إلى البنية T فيتحرر ثنائي الأكسجين. تستعمل الخلية ثنائي الأكسجين في تفاعلات أكسدة الكربون فينتج HCO3- وبروتون H+ الذي يخفض pH من 7.4 إلى 7.3. يفسر تباعد His146 و Asp94 بمسافة 8 أنغستروم في البنية R بعدم تشكل رابطة شاردية عند pH=7.4، وتقاربهما إلى 2 أنغستروم في البنية T بتشكل الرابطة الشاردية عند pH=7.3. تتأكد الفرضية: تتغير البنية نتيجة نشأة روابط شاردية بانخفاض pH.",
              rule: {
                prompt: "حلل الشكل أ وناقش الفرضية",
                keywords: ["pH", "فرضيه", "شاردية", "هيموغلوبين"],
                minHits: 3,
                forbidden: [],
                causalOrder: ["pH", "شاردية"]
              }
            },
            W: {
              points: 2,
              prompt: "نص علمي: العلاقة بين بنية البروتين ووظيفته وأثر عوامل الوسط",
              bacPrompt: "لخّص في نص علمي العلاقة بين بنية البروتين ووظيفته وأثر هذه العلاقة بعوامل الوسط.",
              ...OFFICIAL(
                6,
                "Relecture du PDF dzexams 2021 Maths. Verbe officiel : لخّص في نص علمي. Question du الجزء الثالث."
              ),
              placeholder: "مقدمة، عرض، خاتمة...",
              minLength: 50,
              modelAnswer:
                "البروتينات جزيئات حيوية تتعدد أدوارها حسب تخصصاتها التي تتوقف على بنيتها الفراغية. تتوقف البنية الفراغية والتخصص الوظيفي على الروابط التي تنشأ بين أحماض أمينية محددة (جسور ثنائية الكبريت، شاردية، كارهة للماء، هيدروجينية) ومتوضعة بدقة في السلسلة الببتيدية. تتأثر البنية بعوامل الوسط كدرجة pH والحرارة حيث أي تغير طفيف قد يكسر روابط جانبية فيتغير التخصص. إن تعدد أدوار البروتينات مرتبط بعدد ونوع وترتيب الأحماض الأمينية في شروط فيزيولوجية محددة.",
              rule: {
                prompt: "لخص العلاقة بين بنية البروتين ووظيفته",
                keywords: ["بنيه", "وظيفه", "pH", "روابط"],
                minHits: 3,
                forbidden: []
              }
            }
          }
        }
      ]
    }
  ]
};

export default YEAR_2021_M;
