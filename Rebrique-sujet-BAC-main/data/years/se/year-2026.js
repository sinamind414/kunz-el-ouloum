/* ============================================================
   BAC SVT Algérie 2026 — شعبة علوم تجريبية — entraînement 4D
   ------------------------------------------------------------
   Énoncé : PDF officiel eddirasa
     https://eddirasa.com/uploads/2026/08/bac-science-2026-se.pdf
     (OCR, 10 pages, 2 sujets × 3 exercices 5+7+8, 2026-08-31).
   Corrigé : PDF officiel eddirasa
     https://eddirasa.com/uploads/2026/08/correction-bac-science-2026-se.pdf
     croisé avec le viewer dzexams (corrigé inversé, albumine/SIRT1/RSV).
   Un pôle = une consigne. Les questions surnuméraires restent
   non mappées (notes).
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

const PDF = "https://eddirasa.com/uploads/2026/08/bac-science-2026-se.pdf";
const PDF_NOTE =
  "PDF officiel non redistribué dans le dépôt. Source énoncé: https://eddirasa.com/uploads/2026/08/bac-science-2026-se.pdf (consulté 2026-08-31). Corrigé: https://eddirasa.com/uploads/2026/08/correction-bac-science-2026-se.pdf. Miroir dzexams: https://www.dzexams.com/ar/annales/L0tWNjNjZ1pNQ1RmU3JUOUFUbFpTdz09.";

export const YEAR_2026_SE = {
  id: "2026",
  stream: "se",
  calendarYear: "2026",
  label: "بكالوريا الجزائر دورة 2026 — شعبة علوم تجريبية",
  theme: "emerald",
  enabled: true,
  sujets: [
    {
      id: 1,
      pdf: null,
      pdfExternalUrl: PDF,
      pdfLocalUrl: "/subjects/SE/2026/sujet-1.pdf",
      pdfNote: PDF_NOTE,
      title: "الموضوع الأول",
      exercises: [
        {
          number: 1,
          ui: "text",
          label: "الألبومين وجذور الهيدروكسيل الحرة",
          max: 5,
          desc: "بنية بروتين الألبومين (جسور ثنائية الكبريت وCys34) وأثر جذور الهيدروكسيل الحرة في ظهور الوذمة Edema",
          poles: {
            N: {
              points: 1,
              prompt: "تأطير الإشكالية: علاقة بنية الألبومين بوظيفته وأثر جذور الهيدروكسيل",
              bacPrompt:
                "كيف ترتبط البنية الفراغية لبروتين الألبومين بتخصصه الوظيفي، وكيف تؤدي جذور الهيدروكسيل الحرة إلى الوذمة؟",
              ...RECON(
                "Pas de question officielle autonome de type حدد المشكل. Reformulation pédagogique du préambule page 1."
              ),
              placeholder: "صياغة المشكل العلمي...",
              minLength: 40,
              modelAnswer:
                "المشكل العلمي: كيف تضمن البنية الفراغية لبروتين الألبومين تخصصه الوظيفي، وكيف يؤدي كسر جسور ثنائية الكبريت بجذور الهيدروكسيل الحرة إلى الوذمة؟",
              rule: {
                prompt: "حدد المشكل العلمي حول الألبومين والوذمة",
                keywords: ["البومين", "بنيه", "وذمه"],
                minHits: 2,
                forbidden: []
              }
            },
            S: {
              points: 1,
              prompt: "تمثيل الصيغة العامة للأحماض الأمينية وذكر الروابط حسب المستوى البنيوي",
              bacPrompt:
                "مثّل الصيغة العامة للأحماض الأمينية واذكر مختلف الروابط التي تنشأ بينها أثناء انتقالها من مستوى بنيوي إلى آخر.",
              ...OFFICIAL(
                1,
                "Relecture du PDF eddirasa 2026 (OCR page 1). Verbe officiel : مثّل / اذكر. Question 1 du التمرين الأول."
              ),
              placeholder: "NH2-CH(R)-COOH، روابط ببتيدية، هيدروجينية...",
              minLength: 40,
              modelAnswer:
                "الصيغة العامة للحمض الأميني: NH2-CH(R)-COOH. البنية الأولية: روابط ببتيدية. البنية الثانوية: روابط هيدروجينية. البنية الثالثية: روابط هيدروجينية وشاردية وجسور ثنائية الكبريت وروابط كارهة للماء. البنية الرابعية: روابط هيدروجينية بين سلاسل ببتيدية.",
              rule: {
                prompt: "مثل الصيغة العامة واذكر الروابط",
                keywords: ["ببتيديه", "هيدروجينيه", "كبريت", "امينيه"],
                minHits: 3,
                forbidden: []
              }
            },
            E: {
              points: 2,
              prompt: "النص العلمي: العلاقة بين البنية والتخصص الوظيفي وأثر جذور الهيدروكسيل",
              bacPrompt:
                "بيّن في نص علمي العلاقة بين البنية والتخصص الوظيفي للبروتين وتأثير جذور الهيدروكسيل الحرة.",
              ...OFFICIAL(
                1,
                "Relecture du PDF eddirasa 2026 (OCR page 1). Verbe officiel : بيّن في نص علمي. Question 2 du التمرين الأول."
              ),
              placeholder: "مقدمة، عرض، خاتمة...",
              minLength: 120,
              modelAnswer:
                "ترتبط الأحماض الأمينية بروابط ببتيدية CO-NH فتتحدد البنية الفراغية بعدد ونوع وترتيب الأحماض الأمينية وبالروابط التي تنشأ بينها في مواقع دقيقة. يضمن استقرار البنية الفراغية للألبومين 17 جسرا ثنائي الكبريت والجذر الحر Cys34 امتصاص الماء من الأنسجة. تكسر جذور الهيدروكسيل الحرة الجسور الثنائية الكبريت فيتحول جذر Cys إلى جذر يشبه Ala فيفقد الألبومين بنيته الفراغية وقدرته على امتصاص الماء فيتراكم الماء داخل الأنسجة وتظهر الوذمة Edema.",
              rule: {
                prompt: "بين العلاقة بين البنية والوظيفة وأثر الجذور الحرة",
                keywords: ["البومين", "كبريت", "هيدروكسيل", "وذمه"],
                minHits: 3,
                forbidden: []
              }
            },
            W: {
              points: 1,
              prompt: "الخاتمة: أثر تغير بنية الألبومين على ظهور الوذمة",
              bacPrompt: "ما أثر كسر جسور ثنائية الكبريت في الألبومين على ظهور الوذمة؟",
              ...RECON(
                "La clôture est incluse dans le texte scientifique officiel (pôle E). Pas une question BAC autonome."
              ),
              placeholder: "في الختام...",
              minLength: 40,
              modelAnswer:
                "في الختام، يساهم ثبات البنية الفراغية في حفاظ البروتين على تخصصه الوظيفي، وقد تغير جذور الهيدروكسيل بنية الألبومين فتفقد وظيفته ويظهر الوذم.",
              rule: {
                prompt: "اكتب خاتمة حول أثر الجذور الحرة",
                keywords: ["بنيه", "وظيفه", "وذمه"],
                minHits: 2,
                forbidden: []
              }
            }
          }
        },
        {
          number: 2,
          ui: "text",
          label: "أنزيم SIRT1 ومادة الريسفيراترول RSV",
          max: 7,
          desc: "نشاط SIRT1 بوجود NAD+ ونزع الأسيتيل عن P53A، ودور RSV والجهد البدني في حيوية الخلايا",
          poles: {
            N: {
              points: 1,
              prompt: "تأطير الإشكالية: وظيفة SIRT1 وأهمية RSV والجهد البدني",
              bacPrompt: "كيف يؤمن أنزيم SIRT1 حيوية الخلايا، وما أهمية RSV والجهد البدني في ذلك؟",
              ...RECON("Préambule pages 2-3. Pas de question officielle autonome de cadrage."),
              placeholder: "صياغة المشكل العلمي...",
              minLength: 30,
              modelAnswer:
                "المشكل العلمي: كيف يعمل أنزيم SIRT1 بوجود NAD+ على حماية ADN، وكيف يرفع RSV والجهد البدني حيوية الخلايا العضلية؟",
              rule: {
                prompt: "حدد المشكل العلمي حول SIRT1",
                keywords: ["SIRT1", "حيويه", "خلايا"],
                minHits: 2,
                forbidden: []
              }
            },
            S: {
              points: 2.5,
              prompt: "تحليل الشكل (أ): كمية الركيزة P53A بدلالة كميات NAD+",
              bacPrompt: "حلّل نتائج الشكل (أ).",
              ...OFFICIAL(
                2,
                "Relecture du corrigé officiel eddirasa 2026 (page 2) et du préambule. Verbe officiel du corrigé : حلّل. Question 1 du الجزء الأول. Consigne برّر النشاط البدني non mappée."
              ),
              placeholder: "قارن: قبل إضافة NAD+ وبعد كميات مختلفة...",
              minLength: 90,
              modelAnswer:
                "يمثل الشكل (أ) تغيرات كمية الركيزة P53A بوجود أنزيم SIRT1 وكميات مختلفة من NAD+. نلاحظ قبل إضافة NAD+ ثبات كمية الركيزة عند قيمة عظمى 7.55 و.أ بينما بعد إضافة كمية قليلة من NAD+ تنخفض كمية الركيزة إلى 3.7 و.أ. بعد إضافة كمية كبيرة من NAD+ انخفاض كبير حتى الانعدام عند 1.4 و.أ. ومنه نستنتج أن نشاط أنزيم SIRT1 يتطلب وجود مركب NAD+.",
              rule: {
                prompt: "حلل الشكل أ حول P53A و NAD+",
                keywords: ["P53A", "NAD", "ركيزه", "انخفاض"],
                minHits: 3,
                forbidden: ["بسبب"],
                document: {
                  kind: "curve",
                  axes: ["كميه", "NAD"],
                  comparisons: [["قبل", "بعد"]],
                  trends: [
                    { about: "قبل", expect: ["ثبات", "عظمي"] },
                    { about: "بعد", expect: ["انخفاض", "ينخفض"] }
                  ],
                  relations: [{ type: "inverse", a: "NAD", b: "ركيزه" }],
                  values: ["7.55"],
                  strictValues: true
                }
              }
            },
            E: {
              points: 2.5,
              prompt: "توضيح وظيفة أنزيم SIRT1 على مستوى الخلايا من الشكل (ب)",
              bacPrompt: "وضّح وظيفة أنزيم SIRT1 على مستوى الخلايا انطلاقا من نتائج الشكل (ب).",
              ...OFFICIAL(
                2,
                "Relecture du PDF eddirasa 2026 (OCR). Verbe officiel : وضّح. Question du الجزء الأول après الشكل (ب)."
              ),
              placeholder: "نزع الأسيتيل عن P53A، حماية ADN...",
              minLength: 110,
              modelAnswer:
                "يعمل أنزيم SIRT1 على نزع الأسيتيل من المركب P53A فيتحول إلى P53 الذي يحمي جزيئة ADN من التلف فيسمح باستمرار حياة الخلية. في غياب نشاط SIRT1 لا يُنزع الأسيتيل عن P53A فيتلف ADN وتموت الخلية. يؤمن أنزيم SIRT1 حيوية الخلايا بنزع الأسيتيل عن البروتين المرتبط بـ P53A بوجود NAD+ مما يحمي ADN.",
              rule: {
                prompt: "وضح وظيفة SIRT1 من الشكل ب",
                keywords: ["SIRT1", "اسيتيل", "P53", "ADN"],
                minHits: 3,
                forbidden: [],
                causalOrder: ["SIRT1", "اسيتيل"]
              }
            },
            W: {
              points: 1,
              prompt: "بيان أهمية استعمال مادة RSV للحفاظ على حيوية الخلايا العضلية",
              bacPrompt: "بيّن أهمية استعمال مادة RSV للحفاظ على حيوية الخلايا العضلية.",
              ...OFFICIAL(
                3,
                "Relecture du PDF eddirasa 2026 (OCR page 3). Verbe officiel : بيّن. Question 1 du الجزء الثاني. Consigne برّر التأثير الإيجابي لممارسة نشاط بدني non mappée."
              ),
              placeholder: "تقارب NTD و CD، Lys304 و Glu214...",
              minLength: 40,
              modelAnswer:
                "تساهم مادة الريسفيراترول RSV في زيادة تقارب الجزأين NTD و CD عبر تقليص المسافة بين Lys304 و Glu214 فيرتفع التكامل المحفّز ونشاط SIRT1 فتستمر حماية ADN وحيوية الخلايا. كما يرفع الجهد العضلي كمية NAD+ الضرورية لنشاط SIRT1.",
              rule: {
                prompt: "بين أهمية استعمال RSV",
                keywords: ["RSV", "SIRT1", "حيويه"],
                minHits: 2,
                forbidden: []
              }
            }
          }
        },
        {
          number: 3,
          ui: "text",
          label: "مبيد الأترازين والتركيب الضوئي",
          max: 8,
          desc: "تعطيل السلسلة التركيبية الضوئية بمبيد الأترازين (تنافس مع QB على D1/PSII) ومقاومة الذرة والزنجبيل الأرقطي",
          poles: {
            N: {
              points: 0.5,
              prompt: "اقتراح فرضية تفسر مقاومة نبات الذرة لمبيد الأترازين",
              bacPrompt: "اقترح فرضية تفسر بها مقاومة نبات الذرة لتأثير مبيد الأترازين.",
              ...OFFICIAL(
                4,
                "Relecture du corrigé officiel eddirasa 2026. Verbe officiel : اقترح فرضية. Question 2 du الجزء الأول."
              ),
              placeholder: "الفرضية: يملك نبات الذرة آلية...",
              minLength: 30,
              modelAnswer:
                "الفرضية: يملك نبات الذرة آلية تمكنه من مقاومة تأثير مبيد الأترازين بإبطال مفعوله بأنزيم.",
              rule: {
                prompt: "اقترح فرضية حول مقاومة الذرة",
                keywords: ["فرضيه", "ذره", "اترازين"],
                minHits: 2,
                forbidden: []
              }
            },
            S: {
              points: 2,
              prompt: "استغلال شكلي الوثيقة 1: شدة امتصاص CO2 والفلورة عند نباتات شاهدة ومعاملة",
              bacPrompt:
                "بيّن من خلال استغلالك لمعطيات شكلي الوثيقة 1 أن مبيد الأترازين يستهدف تعطيل عملية التركيب الضوئي وأن له تأثيرا متباينا على المحاصيل الزراعية والنباتات الضارة.",
              ...OFFICIAL(
                4,
                "Verbe officiel : demontrer. Consigne lue sur le fichier local dzexams p4 (partie 1, document 1). Ancienne valeur 3 (relecture eddirasa fautive), corrigee le 2026-09-23."
              ),
              placeholder: "النبات الشاهد: امتصاص CO2 مرتفع... النبات المعامل...",
              minLength: 90,
              modelAnswer:
                "يمثل الشكل (أ) شدة امتصاص CO2 وشدة الفلورة عند نبات شاهد غير معامل ونبات معامل بالأترازين. عند النبات الشاهد يبلغ امتصاص CO2 قيمة 25 µmol.m-2.s-1 وشدة الفلورة 121 و.أ مما يدل على تركيب ضوئي فعال بينما عند النبات المعامل ينخفض امتصاص CO2 إلى 5 µmol.m-2.s-1 وترتفع الفلورة إلى 201 و.أ. يمثل الشكل (ب) ثبات الامتصاص عند الشاهد والزنجبيل الأرقطي، وتناقصا ثم استعادة عند الذرة، وتوقفا شبه تام عند الشوفان والسرمد. ومنه نستنتج أن الأترازين يعطل التركيب الضوئي بتأثير متباين حسب النبات.",
              rule: {
                prompt: "بين تعطيل التركيب الضوئي من شكلي الوثيقة 1",
                keywords: ["CO2", "فلوره", "اترازين", "امتصاص"],
                minHits: 3,
                forbidden: ["بسبب"],
                document: {
                  kind: "curve",
                  axes: ["امتصاص", "فلوره"],
                  comparisons: [["شاهد", "معامل"]],
                  trends: [
                    { about: "شاهد", expect: ["مرتفع", "امتصاص"] },
                    { about: "معامل", expect: ["ينخفض", "فلوره"] }
                  ],
                  relations: [{ type: "inverse", a: "امتصاص", b: "فلوره" }],
                  values: ["25"],
                  strictValues: true
                }
              }
            },
            E: {
              points: 4,
              prompt: "المصادقة على الفرضية باستغلال الوثيقة 2 (QB/D1، GST/GSH، Thr264)",
              bacPrompt: "صادق على صحة الفرضية المقترحة باستغلالك لمعطيات الوثيقة 2.",
              ...OFFICIAL(
                5,
                "Relecture du PDF eddirasa 2026 (OCR) et du corrigé. Verbe officiel : صادق. Question du الجزء الثاني. Consigne برّر قدرة الزنجبيل الأرقطي non mappée."
              ),
              placeholder: "تنافس ATZ مع QB على D1، أنزيم GST، طفرة Ser264...",
              minLength: 110,
              modelAnswer:
                "يثبت الأترازين على موقع ارتباط QB ببروتين D1 للنظام الضوئي PSII لتشابه البنية فيعيق نقل الإلكترونات. عند الذرة يشرف أنزيم GST على ربط GSH بالأترازين فيتشكل معقد أترازين-غلوتاثيون غير فعال فيفقد المبيد قدرته على التنافس ويبقى QB مرتبطا بـ D1. عند الزنجبيل الأرقطي تستبدل Ser264 بـ Thr264 فيمتنع تثبيت الأترازين. تتأكد الفرضية: الذرة تملك آلية طبيعية تبطل مفعول الأترازين بتركيب أنزيم GST.",
              rule: {
                prompt: "صادق على الفرضية باستغلال الوثيقة 2",
                keywords: ["QB", "D1", "GST", "فرضيه"],
                minHits: 3,
                forbidden: [],
                wrongConcepts: ["SIRT1", "ASIC1a"]
              }
            },
            W: {
              points: 1.5,
              prompt: "مخطط وظيفي يوضح تأثير مبيد الأترازين على التركيب الضوئي",
              bacPrompt:
                "أنجز مخططا وظيفيا يوضح تأثير مبيد الأترازين على عملية التركيب الضوئي اعتمادا على الدراسة والسند المرفق.",
              ...OFFICIAL(
                5,
                "Verbe officiel : realiser un schema fonctionnel. Consigne lue sur le fichier local dzexams p5 (partie 3). Ancienne valeur 6 = pagination du corrige eddirasa, corrigee le 2026-09-23."
              ),
              placeholder: "شاهد → QB-D1 → نقل إلكترونات... في وجود ATZ...",
              minLength: 0,
              modelAnswer:
                "عنوان المخطط: تأثير مبيد الأترازين. نبات شاهد → ارتباط QB بـ PSII-D1 → نقل إلكترونات → QBH2 → ATP و NADPH,H+ → تركيب ضوئي. إضافة ATZ عند الشوفان → تنافس ATZ مع QB → توقف النقل → موت النبات. عند الذرة → أنزيم GST → معقد ATZ-GSH غير فعال → استمرار النقل. عند الزنجبيل الأرقطي طافر → عدم ارتباط ATZ → تركيب ضوئي.",
              rule: {
                prompt: "انجز مخططا وظيفيا لتأثير الأترازين",
                keywords: ["مخطط", "اترازين", "PSII"],
                minHits: 1,
                forbidden: [],
                schema: { arrows: true, title: "اترازين", ordered: ["اترازين", "PSII", "نقل"] }
              }
            }
          }
        }
      ]
    },
    {
      id: 2,
      pdf: null,
      pdfExternalUrl: PDF,
      pdfLocalUrl: "/subjects/SE/2026/sujet-2.pdf",
      pdfNote: PDF_NOTE,
      title: "الموضوع الثاني",
      exercises: [
        {
          number: 1,
          ui: "text",
          label: "غشاء التيلاكوئيد ومبيد Oxyfluorfen",
          max: 5,
          desc: "مكونات غشاء التيلاكوئيد ومساهمتها في تركيب ATP وأثر مبيد Oxyfluorfen الذي يخرّب الغشاء",
          poles: {
            N: {
              points: 1,
              prompt: "تأطير الإشكالية: دور مكونات غشاء التيلاكوئيد في تركيب ATP وأثر المبيد",
              bacPrompt: "كيف تساهم مكونات غشاء التيلاكوئيد في تركيب ATP، وما أثر مبيد Oxyfluorfen على ذلك؟",
              ...RECON("Préambule page 6. Pas de question officielle autonome de cadrage."),
              placeholder: "صياغة المشكل العلمي...",
              minLength: 40,
              modelAnswer:
                "المشكل العلمي: كيف تساهم مكونات غشاء التيلاكوئيد في تركيب ATP، وما أثر تخريب الغشاء بمبيد Oxyfluorfen؟",
              rule: {
                prompt: "حدد المشكل العلمي حول التيلاكوئيد و ATP",
                keywords: ["تيلاكوئيد", "ATP", "غشاء"],
                minHits: 2,
                forbidden: []
              }
            },
            S: {
              points: 1,
              prompt: "ذكر مكونات غشاء التيلاكوئيد والتعرف على الوسطين (أ) و(ب)",
              bacPrompt: "اذكر مختلف مكونات غشاء التيلاكوئيد وتعرّف على الوسطين (أ) و(ب).",
              ...OFFICIAL(
                6,
                "Relecture du PDF eddirasa 2026 (OCR page 6) et du corrigé. Verbes officiels : اذكر / تعرّف. Question 1 du التمرين الأول (Sujet 2)."
              ),
              placeholder: "أنظمة ضوئية، نواقل، ATP سنتاز...",
              minLength: 30,
              modelAnswer:
                "مكونات غشاء التيلاكوئيد: نوعان من الأنظمة الضوئية PSI و PSII، نواقل الإلكترونات، كرية مذنبة (أنزيم ATP سنتاز). الوسط (أ): حشوة (ستروما، مادة أساسية). الوسط (ب): جوف التيلاكوئيد.",
              rule: {
                prompt: "اذكر مكونات غشاء التيلاكوئيد والوسطين",
                keywords: ["PSII", "ATP", "جوف", "حشوه"],
                minHits: 2,
                forbidden: []
              }
            },
            E: {
              points: 2,
              prompt: "النص العلمي: مساهمة مكونات الغشاء في تركيب ATP وأثر Oxyfluorfen",
              bacPrompt:
                "اشرح في نص علمي مساهمة مختلف مكونات غشاء التيلاكوئيد في عملية تركيب ATP وأثر مبيد Oxyfluorfen.",
              ...OFFICIAL(
                6,
                "Relecture du PDF eddirasa 2026 (OCR page 6). Verbe officiel : اشرح في نص علمي. Question 2 du التمرين الأول (Sujet 2)."
              ),
              placeholder: "مقدمة، عرض، خاتمة...",
              minLength: 120,
              modelAnswer:
                "يلتقط النظامان الضوئيان PSI و PSII الفوتونات فتفقد إلكتروناتها. يسترجع PSII إلكتروناته بأكسدة الماء فيتحرر بروتونات داخل جوف التيلاكوئيد. تنتقل الإلكترونات من PSII إلى PSI عبر سلسلة نواقل. يضخ الناقل T2 البروتونات مستهلكا طاقة نقل الإلكترونات فيتولد تدرج تركيز بروتوني بين الجوف والحشوة. يقوم أنزيم ATP سنتاز بفسفرة ADP إلى ATP بوجود Pi مستغلا الطاقة المحررة من سيل البروتونات. يخرّب مبيد Oxyfluorfen جزءا من الغشاء (الطبقة الفوسفوليبيدية المضاعفة) فتتسرب البروتونات ويزول التدرج ويتوقف خروجها عبر ATP سنتاز فيتوقف تركيب ATP.",
              rule: {
                prompt: "اشرح مساهمة الغشاء في تركيب ATP وأثر المبيد",
                keywords: ["بروتون", "ATP", "تيلاكوئيد", "Oxyfluorfen"],
                minHits: 3,
                forbidden: []
              }
            },
            W: {
              points: 1,
              prompt: "الخاتمة: أثر تخريب الغشاء على تدرج البروتونات وتركيب ATP",
              bacPrompt: "ما أثر تخريب غشاء التيلاكوئيد بمبيد Oxyfluorfen على تدرج البروتونات وتركيب ATP؟",
              ...RECON(
                "La clôture est incluse dans le texte scientifique officiel (pôle E). Pas une question BAC autonome."
              ),
              placeholder: "في الختام...",
              minLength: 40,
              modelAnswer:
                "في الختام، سلامة غشاء التيلاكوئيد شرط لتركيب ATP، ويؤدي تخريب المبيد إلى فقدان تدرج تركيز البروتونات بين الجوف والحشوة فيتوقف التركيب.",
              rule: {
                prompt: "اكتب خاتمة حول أثر Oxyfluorfen",
                keywords: ["ATP", "بروتون", "غشاء"],
                minHits: 2,
                forbidden: []
              }
            }
          }
        },
        {
          number: 2,
          ui: "text",
          label: "قناة ASIC1a والجلطة الدماغية",
          max: 7,
          desc: "انفتاح قناة ASIC1a بانخفاض pH ودخول Ca2+ المميت، ودور سم العنكبوت PcTx1 في حماية الخلايا العصبية",
          poles: {
            N: {
              points: 1,
              prompt: "تأطير الإشكالية: علاقة الجلطة الدماغية بموت الخلايا العصبية عبر ASIC1a",
              bacPrompt: "كيف تؤدي الجلطة الدماغية إلى موت الخلايا العصبية عبر قناة ASIC1a؟",
              ...RECON("Préambule pages 6-7. Pas de question officielle autonome de cadrage."),
              placeholder: "صياغة المشكل العلمي...",
              minLength: 30,
              modelAnswer:
                "المشكل العلمي: كيف يؤدي انخفاض pH أثناء الجلطة الدماغية إلى انفتاح قناة ASIC1a ودخول Ca2+ فموت الخلايا العصبية؟",
              rule: {
                prompt: "حدد المشكل العلمي حول الجلطة و ASIC1a",
                keywords: ["جلطه", "ASIC1a", "عصبيه"],
                minHits: 2,
                forbidden: []
              }
            },
            S: {
              points: 2.5,
              prompt: "تحليل الشكل (أ) من الوثيقة 1: تركيز Ca2+ وحيوية الخلايا قبل وبعد الجلطة",
              bacPrompt: "حلّل النتائج الممثلة في الشكل (أ).",
              ...OFFICIAL(
                6,
                "Relecture du PDF eddirasa 2026 (OCR page 6). Verbe officiel : حلّل. Question 1 du الجزء الأول (Sujet 2, Ex2)."
              ),
              placeholder: "قبل الجلطة: Ca2+ منخفض... بعد الجلطة عند Kwt و KO...",
              minLength: 90,
              modelAnswer:
                "يمثل الشكل (أ) تركيز Ca2+ ونسبة حيوية الخلايا العصبية عند النمط Kwt والمعدل وراثيا KO. قبل الجلطة الدماغية يكون تركيز Ca2+ منخفضا في حدود 100 nM ونسبة الحيوية 100 بالمئة عند النمطين. بعد الجلطة نلاحظ عند Kwt ارتفاع تركيز Ca2+ إلى 750 nM وتناقص الحيوية إلى 31 بالمئة، بينما تبقى النتائج نفسها عند KO مع ثبات الحيوية. ومنه نستنتج أن الجلطة تسبب نفاذية Ca2+ عبر قناة ASIC1a وموت هذه الخلايا.",
              rule: {
                prompt: "حلل الشكل أ حول Ca2+ والحيوية",
                keywords: ["Ca", "حيويه", "Kwt", "KO"],
                minHits: 3,
                forbidden: ["بسبب"],
                document: {
                  kind: "curve",
                  axes: ["تركيز", "حيويه"],
                  comparisons: [["Kwt", "KO"]],
                  trends: [
                    { about: "Kwt", expect: ["ارتفاع", "تناقص"] },
                    { about: "KO", expect: ["ثبات", "حيويه"] }
                  ],
                  relations: [{ type: "inverse", a: "Ca", b: "حيويه" }],
                  values: ["31"],
                  strictValues: true
                }
              }
            },
            E: {
              points: 2.5,
              prompt: "توضيح العلاقة بين الجلطة الدماغية وموت الخلايا العصبية",
              bacPrompt: "وضّح العلاقة بين الجلطة الدماغية وموت الخلايا العصبية.",
              ...OFFICIAL(
                7,
                "Relecture du PDF eddirasa 2026 (OCR). Verbe officiel : وضّح. Question 2 du الجزء الأول. Consigne برّر مراعاة pH عند حفظ الأعضاء non mappée."
              ),
              placeholder: "انخفاض pH، انفتاح ASIC1a، دخول Ca2+...",
              minLength: 110,
              modelAnswer:
                "تسبب الجلطة الدماغية ارتفاع حموضة الوسط بين خلوي (انخفاض درجة pH) مما يؤدي إلى انفتاح قناة ASIC1a ونفاذية Ca2+ عبرها إلى هيولى الخلايا العصبية وبالتالي موتها. يؤكد الشكل (ب) أنه عند pH=7.4 لا يُسجل أي تيار داخلي، وعند الانتقال إلى pH=6 يُسجل تيار شدته 75- pA ثم يتوقف التيار عند العودة إلى pH=7.4: ارتفاع الحموضة يسبب انفتاح قناة ASIC1a.",
              rule: {
                prompt: "وضح العلاقة بين الجلطة وموت الخلايا",
                keywords: ["pH", "ASIC1a", "Ca", "موت"],
                minHits: 3,
                forbidden: [],
                causalOrder: ["pH", "ASIC1a"]
              }
            },
            W: {
              points: 1,
              prompt: "شرح آلية تأثير الجلطة ودور السم PcTx1 في المحافظة على حياة الخلايا",
              bacPrompt:
                "اشرح آلية تأثير الجلطة الدماغية على الخلايا العصبية ودور السم PcTx1 في المحافظة على حياة الخلايا باستغلالك لمعطيات ونتائج الوثيقة 2.",
              ...OFFICIAL(
                8,
                "Relecture du PDF eddirasa 2026 (OCR page 8). Verbe officiel : اشرح. Question 1 du الجزء الثاني (Sujet 2, Ex2)."
              ),
              placeholder: "ارتباط H+ بالجيب الحمضي، PcTx1 و Arg27...",
              minLength: 40,
              modelAnswer:
                "عند حدوث جلطة دماغية ترتفع حموضة الوسط بين خلوي فتنفذ بروتونات H+ إلى الجيب الحمضي لقناة ASIC1a وترتبط بجذور الأحماض الأمينية المكونة له فتنفتح القناة ويدخل Ca2+ إلى الهيولى. يضاف سم العنكبوت PcTx1 الذي يرتبط بجذور الأحماض الأمينية في الجيب الحمضي بفضل Arg27 فيمنع ارتباط البروتونات ويحافظ على البنية الفراغية للقناة في حالتها المغلقة فلا تنفذ Ca2+ وتُحفظ حيوية الخلية.",
              rule: {
                prompt: "اشرح آلية الجلطة ودور PcTx1",
                keywords: ["PcTx1", "ASIC1a", "بروتون"],
                minHits: 2,
                forbidden: []
              }
            }
          }
        },
        {
          number: 3,
          ui: "text",
          label: "الأجسام المضادة Anti-Aβ و ATV-Aβ ضد الزهايمر",
          max: 8,
          desc: "عدم عبور Anti-Aβ جدار الوعاء الدموي إلى المخ، وفعالية ATV-Aβ عبر مستقبل TfR والبلعمة",
          poles: {
            N: {
              points: 0.5,
              prompt: "اقتراح فرضية تفسر عدم فعالية Anti-Aβ في علاج الزهايمر",
              bacPrompt:
                "اقترح فرضية تُفسّر بها عدم فعالية الأجسام المضادة ضد بروتين Aβ (Anti-Aβ) في علاج مرض الزهايمر باستغلالك لمعطيات الوثيقة 1.",
              ...OFFICIAL(
                8,
                "Relecture du PDF eddirasa 2026 (OCR page 8). Verbe officiel : اقترح فرضية. Question unique du الجزء الأول (Sujet 2, Ex3)."
              ),
              placeholder: "الفرضية: لا تخترق Anti-Aβ...",
              minLength: 30,
              modelAnswer:
                "الفرضية: يعود عدم فعالية الأجسام المضادة Anti-Aβ في علاج الزهايمر إلى عدم قدرتها على اختراق جدار الوعاء الدموي ونسيج المخ.",
              rule: {
                prompt: "اقترح فرضية حول عدم فعالية Anti-Aβ",
                keywords: ["فرضيه", "Aβ", "مخ"],
                minHits: 2,
                forbidden: []
              }
            },
            S: {
              points: 2,
              prompt: "استغلال الوثيقة 1: وجود Anti-Aβ في الدم وغياب المعقدات في المخ",
              bacPrompt:
                "استغل معطيات الوثيقة 1: توزع Anti-Aβ والمعقدات المناعية في الدم والمخ، ونسبة صفائح Aβ في الحالتين.",
              ...RECON(
                "La page 8 décrit les figures (أ) و (ب) mais la seule consigne écrite est اقترح فرضية. L exploitation chiffrée est pédagogique."
              ),
              placeholder: "في الدم: معقدات... في المخ: غياب...",
              minLength: 60,
              modelAnswer:
                "يمثل الشكل (أ) رسما تخطيطيا لوعاء دموي وعينة من المخ عند شخص مصاب معالج بـ Anti-Aβ. نلاحظ في الدم وجود أجسام مضادة مرتبطة بصفائح الأميلويد مشكلة معقدات مناعية مثبتة على أغشية البلعمات، وفي المخ غياب Anti-Aβ وغياب المعقدات المناعية. يمثل الشكل (ب) تناقص نسبة الصفائح في الدم بزيادة تركيز Anti-Aβ حتى الانعدام عند 2.5 و.أ، وثبات نسبة مرتفعة في المخ عند 100 و.أ. ومنه نستنتج أن العلاج بـ Anti-Aβ فعال في الدم فقط وغير فعال ضد الصفائح الموجودة في المخ.",
              rule: {
                prompt: "استغل الوثيقة 1 حول Anti-Aβ في الدم والمخ",
                keywords: ["دم", "مخ", "صفائح", "معقدات"],
                minHits: 3,
                forbidden: ["بسبب"],
                document: {
                  kind: "table",
                  axes: ["دم", "مخ"],
                  comparisons: [["دم", "مخ"]],
                  cells: [["Anti-Aβ", "صفائح"]],
                  values: ["100"],
                  strictValues: true
                }
              }
            },
            E: {
              points: 4,
              prompt: "المصادقة على الفرضية باستغلال الوثيقة 2 (ATV-Aβ ومستقبل TfR)",
              bacPrompt: "صادق على صحة الفرضية المقترحة باستغلالك لمعطيات الوثيقة 2.",
              ...OFFICIAL(
                9,
                "Relecture du PDF eddirasa 2026 (OCR page 9). Verbe officiel : صادق. Question 1 du الجزء الثاني. Consigne بيّن الخصائص البنيوية non mappée."
              ),
              placeholder: "نسبة المعقدات مع ATV-Aβ، موقع TfR، البلعمة...",
              minLength: 110,
              modelAnswer:
                "في حالة استعمال ATV-Aβ تبلغ نسبة تشكل المعقدات المناعية مع صفائح الأميلويد وبلعمتها على مستوى المخ 100 و.أ بينما تنعدم عند استعمال Anti-Aβ. يتميز ATV-Aβ بموقع إضافي للتثبيت على مستقبلات TfR الموجودة على غشاء خلايا جدار الوعاء الدموي فيُبتلع المعقد TfR-ATV-Aβ ويُطرح داخل المخ فترتبط الأجسام المضادة بصفائح Aβ وتتشكل معقدات تسهل البلعمة. تتأكد الفرضية: عدم فعالية Anti-Aβ يعود إلى عدم قدرتها على اختراق جدار الوعاء الدموي ونسيج المخ فلا تتشكل معقدات مناعية داخل المخ.",
              rule: {
                prompt: "صادق على الفرضية باستغلال الوثيقة 2",
                keywords: ["ATV", "TfR", "فرضيه", "مخ"],
                minHits: 3,
                forbidden: [],
                causalOrder: ["TfR", "مخ"]
              }
            },
            W: {
              points: 1.5,
              prompt: "مخطط وظيفي لتأثير Anti-Aβ و ATV-Aβ في علاج الزهايمر",
              bacPrompt:
                "وضّح في مخطط وظيفي تأثير الأجسام المضادة المصنّعة مخبريا Anti-Aβ و ATV-Aβ في علاج مرض الزهايمر انطلاقا من هذه الدراسة.",
              ...OFFICIAL(
                10,
                "Relecture du PDF eddirasa 2026 (OCR page 10) et du corrigé (schéma). Verbe officiel : وضّح في مخطط وظيفي. Question du الجزء الثالث."
              ),
              placeholder: "Anti-Aβ: عدم الاختراق... ATV-Aβ: TfR → المخ → بلعمة...",
              minLength: 0,
              modelAnswer:
                "عنوان المخطط: تأثير الأجسام المضادة في علاج الزهايمر. Anti-Aβ → عدم الارتباط بمستقبل TfR → عدم الاختراق → عدم تشكل معقدات مناعية في نسيج المخ. ATV-Aβ → الارتباط بمستقبل TfR → اختراق جدار الوعاء الدموي → تشكل معقدات مناعية → حدوث البلعمة → اختفاء صفائح الأميلويد من نسيج المخ.",
              rule: {
                prompt: "وضح في مخطط تأثير Anti-Aβ و ATV-Aβ",
                keywords: ["مخطط", "TfR", "بلعمه"],
                minHits: 1,
                forbidden: [],
                schema: { arrows: true, title: "زهايمر", ordered: ["Anti", "TfR", "بلعمه"] }
              }
            }
          }
        }
      ]
    }
  ]
};

export default YEAR_2026_SE;
