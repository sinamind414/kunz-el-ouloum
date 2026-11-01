/* ============================================================
   BAC SVT Algérie 2024 — شعبة رياضيات — entraînement 4D
   ------------------------------------------------------------
   Énoncé : PDF officiel eddirasa
     https://eddirasa.com/wp-content/uploads/2024/06/bac-math-sciences-2024.pdf
     (OCR bruité, 6 pages, 2 sujets × 2 exercices 7+13, 2026-08-31).
   Corrigé : PDF officiel eddirasa
     https://eddirasa.com/wp-content/uploads/2024/05/correction-bac-math-sciences-2024.pdf
     (7 pages).
   id = 2024-m.
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

const PDF = "https://eddirasa.com/wp-content/uploads/2024/06/bac-math-sciences-2024.pdf";
const PDF_NOTE =
  "PDF officiel non redistribué dans le dépôt. Source énoncé: https://eddirasa.com/wp-content/uploads/2024/06/bac-math-sciences-2024.pdf (consulté 2026-08-31). Corrigé: https://eddirasa.com/wp-content/uploads/2024/05/correction-bac-math-sciences-2024.pdf.";

export const YEAR_2024_M = {
  id: "2024-m",
  stream: "m",
  calendarYear: "2024",
  label: "بكالوريا الجزائر دورة 2024 — شعبة رياضيات",
  theme: "indigo",
  enabled: true,
  sujets: [
    {
      id: 1,
      pdf: null,
      pdfExternalUrl: PDF,
      pdfLocalUrl: "/subjects/M/2024/sujet-1.pdf",
      pdfNote: PDF_NOTE,
      title: "الموضوع الأول",
      exercises: [
        {
          number: 1,
          ui: "text",
          label: "الكورديسبين وتثبيط الاستنساخ",
          max: 7,
          desc: "توضع cordycepin مكان النيكليوتيدة مقابل T فتتوقف استطالة ARNm",
          poles: {
            N: {
              points: 1,
              prompt: "تأطير الإشكالية: خطوات الاستنساخ وأثر مادة الكورديسبين",
              bacPrompt: "ما هي خطوات الاستنساخ وما أثر مادة الكورديسبين على ذلك؟",
              ...RECON("Préambule page 1. Pas de question officielle autonome de cadrage."),
              placeholder: "صياغة المشكل العلمي...",
              minLength: 30,
              modelAnswer:
                "المشكل العلمي: ما خطوات الاستنساخ، وكيف توقف مادة الكورديسبين استطالة ARNm فتتوقف عملية تركيب البروتين؟",
              rule: {
                prompt: "حدد المشكل العلمي حول الاستنساخ والكورديسبين",
                keywords: ["استنساخ", "كورديسبين", "بروتين"],
                minHits: 2,
                forbidden: []
              }
            },
            S: {
              points: 2,
              prompt: "التعرف على العناصر من 1 إلى 4 وتسمية العنصر (س) ومكوناته",
              bacPrompt: "تعرّف على العناصر المشار إليها بالأرقام من 1 إلى 4 مع تسمية العنصر (س) ومكوناته.",
              ...OFFICIAL(
                1,
                "Relecture du PDF eddirasa 2024 Maths (page 1) et du corrigé (page 1). Verbe officiel : تعرّف. Question 1 du التمرين الأول."
              ),
              placeholder: "1 أنزيم ARN بوليميراز، 2 السلسلة المستنسخة...",
              minLength: 40,
              modelAnswer:
                "1 أنزيم ARN بوليميراز. 2 السلسلة المستنسخة. 3 روابط هيدروجينية. 4 سلسلة ARNm المتشكلة. العنصر (س): نيكليوتيدة مكوناتها سكر خماسي منقوص الأكسجين وقاعدة آزوتية (سيتوزين) وفوسفات.",
              rule: {
                prompt: "تعرف على عناصر الاستنساخ والعنصر س",
                keywords: ["بوليميراز", "مستنسخه", "ARNm"],
                minHits: 2,
                forbidden: []
              }
            },
            E: {
              points: 3,
              prompt: "النص العلمي: خطوات الاستنساخ وتأثير الكورديسبين على تركيب البروتين",
              bacPrompt:
                "اشرح في نص علمي خطوات الاستنساخ وتأثير (COR) على تركيب البروتين باستغلال الوثيقة ومعلوماتك.",
              ...OFFICIAL(
                1,
                "Relecture du PDF eddirasa 2024 Maths (page 1) et du corrigé (page 1). Verbe officiel : اشرح في نص علمي. Question 3 du التمرين الأول. Consigne أكمل التتابع النيكليوتيدي non mappée."
              ),
              placeholder: "مقدمة، عرض: بداية واستطالة ونهاية، وجود COR، خاتمة...",
              minLength: 120,
              modelAnswer:
                "يثبت أنزيم ARN بوليميراز على بداية المورثة ويفكك الروابط الهيدروجينية بين سلسلتي ADN ويبدأ تركيب ARNm. ينتقل الأنزيم على طول السلسلة المستنسخة ويربط النيكليوتيدات وفق تتابع القواعد الآزوتية لسلسلة ADN فتستطيل سلسلة ARNm. عند نهاية المورثة تتوقف الاستطالة وينفصل الأنزيم وARNm وتلتحم سلسلتا ADN. في وجود مادة cordycepin تتوضع هذه المادة مكان النيكليوتيدة الحاملة للقاعدة مقابل النيكليوتيدة T من السلسلة المستنسخة فتتوقف الاستطالة ويتوقف الاستنساخ وتركيب البروتين.",
              rule: {
                prompt: "اشرح خطوات الاستنساخ وأثر الكورديسبين",
                keywords: ["بوليميراز", "استنساخ", "كورديسبين", "استطاله"],
                minHits: 3,
                forbidden: []
              }
            },
            W: {
              points: 1,
              prompt: "الخاتمة: إمكانية تثبيط إحدى خطوات الاستنساخ",
              bacPrompt: "ما أهمية إمكانية إيقاف إحدى خطوات الاستنساخ بمركبات مثل الكورديسبين؟",
              ...RECON("Clôture issue du corrigé officiel. Pas une question BAC autonome."),
              placeholder: "في الختام...",
              minLength: 40,
              modelAnswer:
                "في الختام، تمر مرحلة الاستنساخ بعدة خطوات ويمكن إيقاف إحداها عند الضرورة باستعمال مركبات مختلفة مثل الكورديسبين.",
              rule: {
                prompt: "اكتب خاتمة حول تثبيط الاستنساخ",
                keywords: ["استنساخ", "كورديسبين", "بروتين"],
                minHits: 2,
                forbidden: []
              }
            }
          }
        },
        {
          number: 2,
          ui: "text",
          label: "قصور الرد المناعي في ورم DLBCL",
          max: 13,
          desc: "حذف أربع ثلاثيات في مورثة B2m يمنع عرض المعقد HLA I فلا تتعرف LTc على الورم المتقدم",
          poles: {
            N: {
              points: 1,
              prompt: "اقتراح فرضيتين تفسران سبب القصور المناعي في المرحلة المتقدمة",
              bacPrompt:
                "اقترح فرضيتين تفسر بهما سبب القصور في الرد المناعي عند الشخص المصاب بالورم في المرحلة المتقدمة من السرطان باستغلال الوثيقة 1 ومعلوماتك.",
              ...OFFICIAL(
                2,
                "Relecture du PDF eddirasa 2024 Maths (page 2) et du corrigé (page 1). Verbe officiel : اقترح فرضيتين. Question du الجزء الأول."
              ),
              placeholder: "الفرضية 1: عدم تعرف LTc (عدم تعرف مزدوج)... الفرضية 2: عدم إفراز البيرفورين...",
              minLength: 30,
              modelAnswer:
                "الفرضية 1: سبب القصور المناعي عند الشخص المصاب بالورم المتقدم هو عدم تعرف الخلايا LTc على الخلايا السرطانية (عدم حدوث تعرف مزدوج). الفرضية 2: عدم قدرة الخلايا LTc على إفراز البيرفورين.",
              rule: {
                prompt: "اقترح فرضيتين حول قصور الرد المناعي",
                keywords: ["فرضيه", "LTc", "قصور"],
                minHits: 2,
                forbidden: [],
                hypotheses: { min: 2, distinct: true }
              }
            },
            S: {
              points: 3,
              prompt: "استغلال الوثيقة 1: تغيرات حجم الورم في الوسطين",
              bacPrompt:
                "استغل الوثيقة 1: تغيرات حجم الورم السرطاني في الوسط 1 (ورم حديث) والوسط 2 (ورم متقدم).",
              ...RECON("Le corrigé analyse d'abord la courbe (250→1250 mm³) avant les hypothèses."),
              placeholder: "الوسط 1: تزايد بطيء ثم تناقص إلى 100... الوسط 2: من 250 إلى 1250...",
              minLength: 90,
              modelAnswer:
                "تمثل الوثيقة تغير حجم الورم بدلالة الزمن. في الوسط 1 (ورم حديث) من 0 إلى 7 أيام تزايد بطيء جدا لحجم الورم ثم من 7 إلى 12 يوما تناقص الحجم إلى حوالي 100 مم³، بينما في الوسط 2 (ورم متقدم) من 0 إلى 12 يوما يزداد حجم الورم من 250 إلى 1250 مم³. ومنه الخلايا LTc غير قادرة على القضاء على الخلايا السرطانية للورم المتقدم.",
              rule: {
                prompt: "استغل تغيرات حجم الورم في الوسطين",
                keywords: ["ورم", "1250", "حديث", "متقدم"],
                minHits: 3,
                forbidden: ["بسبب"],
                document: {
                  kind: "curve",
                  axes: ["حجم", "زمن"],
                  comparisons: [["حديث", "متقدم"]],
                  trends: [
                    { about: "حديث", expect: ["تناقص", "100"] },
                    { about: "متقدم", expect: ["تزايد", "1250"] }
                  ],
                  relations: [{ type: "parallel", a: "حديث", b: "متقدم" }],
                  values: ["1250"],
                  strictValues: true
                }
              }
            },
            E: {
              points: 6,
              prompt: "مناقشة صحة إحدى الفرضيتين باستغلال أشكال الوثيقة 2",
              bacPrompt: "ناقش صحة إحدى الفرضيتين باستغلال أشكال الوثيقة 2.",
              ...OFFICIAL(
                3,
                "Relecture du corrigé officiel eddirasa 2024 Maths (pages 2-3). Verbe officiel : ناقش (الربط). Question du الجزء الثاني."
              ),
              placeholder: "خلية الورم المتقدم ليس لها القدرة على عرض المعقد... حذف GTG وأربع ثلاثيات...",
              minLength: 110,
              modelAnswer:
                "على سطح غشاء خلية الورم الحديث يوجد المعقد بينما لا تقدر خلية الورم المتقدم على عرض المعقد (ببتيد مستضدي–HLA I). السلسلة B2m ذات بنية فراغية ثالثية من وريقات. عند المصاب بورم حديث تتكون الوريقة A من ستة أحماض أمينية (6 إلى 11) بينما عند المتقدم تُفقد أحماض أمينية. بمقارنة تتابع الثلاثيات يظهر غياب أربع ثلاثيات عند المصاب بورم متقدم (GTG وثلاث ثلاثيات مقابلة للترتيب 7 و8 و9). طفرة حذف أربع ثلاثيات في مورثة خلايا LB للورم المتقدم تُفقد الوريقة A من B2m فلا يُعرض المعقد على الغشاء فلا تتعرف LTc (عدم تعرف مزدوج). تتأكد الفرضية الأولى.",
              rule: {
                prompt: "ناقش الفرضية باستغلال الوثيقة 2",
                keywords: ["فرضيه", "B2m", "HLA", "حذف"],
                minHits: 3,
                forbidden: [],
                causalOrder: ["حذف", "عرض"]
              }
            },
            W: {
              points: 3,
              prompt: "مخطط: تطور الورم الحديث مقابل الورم المتقدم",
              bacPrompt:
                "وضّح في مخطط مقارنة بين حالة الورم الحديث والورم المتقدم من حيث العرض والتعرف والتخلص من الورم.",
              ...RECON(
                "Schéma du corrigé officiel (page 3). Pas une consigne écrite isolée dans l'énoncé OCR ; reformulation du schéma attendu."
              ),
              placeholder: "ورم حديث: عرض HLA I → تنشيط LTc → تخلص... ورم متقدم: عدم العرض → تطور الورم...",
              minLength: 0,
              modelAnswer:
                "عنوان المخطط: مقارنة DLBCL الحديث والمتقدم. حديث: خلية LB سرطانية تعرض المعقد HLA I-Ag → تنشيط LTc بـ IL → تكاثر وتمايز → التخلص من الورم. متقدم: عدم عرض المعقد → عدم تعرف LTc → تطور الورم.",
              rule: {
                prompt: "وضح في مخطط مقارنة الورم الحديث والمتقدم",
                keywords: ["مخطط", "HLA", "LTc"],
                minHits: 1,
                forbidden: [],
                schema: { arrows: true, title: "DLBCL", ordered: ["عرض", "LTc", "ورم"] }
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
      pdfLocalUrl: "/subjects/M/2024/sujet-2.pdf",
      pdfNote: PDF_NOTE,
      title: "الموضوع الثاني",
      exercises: [
        {
          number: 1,
          ui: "text",
          label: "العوز المناعي الخلقي الأولي PID",
          max: 7,
          desc: "افتقاد نسيج الطحال للخلايا LT فيختل الرد المناعي الخلطي ضد VHB",
          poles: {
            N: {
              points: 1,
              prompt: "تأطير الإشكالية: تأثير العوز المناعي الخلقي على الرد الخلطي",
              bacPrompt: "ما هو دور كل خلية مناعية في الرد الخلطي وكيف يؤثر العوز المناعي الخلقي على ذلك؟",
              ...RECON("Préambule page 4. Pas de question officielle autonome de cadrage."),
              placeholder: "صياغة المشكل العلمي...",
              minLength: 30,
              modelAnswer:
                "المشكل العلمي: كيف تتعاون الخلايا المناعية في الرد الخلطي ضد VHB، وكيف يؤثر غياب الخلايا LT في العوز المناعي الخلقي الأولي؟",
              rule: {
                prompt: "حدد المشكل العلمي حول العوز المناعي الخلقي",
                keywords: ["PID", "خلطي", "LT"],
                minHits: 2,
                forbidden: []
              }
            },
            S: {
              points: 2,
              prompt: "التعرف على نوع الخلايا المناعية التي يفتقدها النسيج وذكر دورها",
              bacPrompt:
                "تعرّف على نوع الخلايا المناعية التي يفتقدها نسيج المولود المصاب (PID) مع ذكر دورها.",
              ...OFFICIAL(
                4,
                "Relecture du PDF eddirasa 2024 Maths (page 4) et du corrigé (page 4). Verbe officiel : تعرّف. Question 1 du التمرين الأول (Sujet 2). Consigne جدول المنشأ ومقر اكتساب الكفاءة non mappée."
              ),
              placeholder: "الخلايا LT: التعرف على محدد المستضد وتنشيط الاستجابة...",
              minLength: 40,
              modelAnswer:
                "يفتقد النسيج الخلايا LT. دورها: التعرف على محدد المستضد وتنشيط الاستجابة المناعية النوعية. الخلايا LTh مصدر IL المحفز للرد الخلطي، والخلايا LTc مصدر الخلايا المتدخلة في الاستجابة الخلوية.",
              rule: {
                prompt: "تعرف على الخلايا المفتقدة ودورها",
                keywords: ["LT", "مستضد", "تنشيط"],
                minHits: 2,
                forbidden: []
              }
            },
            E: {
              points: 3,
              prompt: "النص العلمي: دور الخلايا المناعية في الرد الخلطي وتأثير PID",
              bacPrompt:
                "بيّن في نص علمي دور الخلايا المناعية في الرد المناعي الخلطي وتأثير العوز المناعي الخلقي (PID).",
              ...OFFICIAL(
                4,
                "Relecture du PDF eddirasa 2024 Maths (page 4) et du corrigé (page 4). Verbe officiel : بيّن في نص علمي. Question 3 du التمرين الأول (Sujet 2)."
              ),
              placeholder: "مقدمة، عرض: بالعات، LT4، LB، تأثير غياب LT4، خاتمة...",
              minLength: 120,
              modelAnswer:
                "تقتنص البالعات المستضد وتهضمه جزئيا وتعرضه مرتبطا بجزيئات HLA II وتفرز المنشط لـ LB وتتخلص من المعقدات المناعية. بعد التحسس تتمايز LT4 وتفرز المحفز. تتعرف LB على مولد الضد تعرفا مباشرا وتصبح محسسة، وبعد التحفيز تتكاثر وتتمايز إلى خلايا بلازمية منتجة للأجسام المضادة. يؤدي غياب LT4 إلى عدم إنتاج IL الضروري لتنشيط الرد المناعي الخلطي. تتعاون الخلايا المناعية فيما بينها على إنتاج الأجسام المضادة خلال الرد الخلطي ويتأثر هذا التعاون سلبا بغياب LT كما في حالة العوز المناعي الخلقي الأولي.",
              rule: {
                prompt: "بين دور الخلايا في الرد الخلطي وأثر PID",
                keywords: ["بالعات", "LB", "LT4", "PID"],
                minHits: 3,
                forbidden: []
              }
            },
            W: {
              points: 1,
              prompt: "الخاتمة: أثر غياب LT4 على إنتاج الأجسام المضادة",
              bacPrompt: "ما أثر غياب الخلايا LT على إنتاج الأجسام المضادة؟",
              ...RECON("Clôture issue du corrigé. Pas une question BAC autonome."),
              placeholder: "في الختام...",
              minLength: 40,
              modelAnswer:
                "في الختام، يختل التعاون بين الخلايا المناعية بغياب LT4 فلا يُنتج المحفز الضروري للرد الخلطي كما في العوز المناعي الخلقي الأولي.",
              rule: {
                prompt: "اكتب خاتمة حول أثر PID",
                keywords: ["LT", "خلطي", "مضاده"],
                minHits: 2,
                forbidden: []
              }
            }
          }
        },
        {
          number: 2,
          ui: "text",
          label: "متلازمة ألبورت وكولاجين الغشاء القاعدي",
          max: 13,
          desc: "طفرة COL4A5 تستبدل Gly بـ Glu فتختل ألياف الكولاجين في وحدة التصفية",
          poles: {
            N: {
              points: 1,
              prompt: "اقتراح سبب الإصابة بمتلازمة ألبورت",
              bacPrompt: "اقترح سببا للإصابة بمتلازمة ألبورت باستغلال الوثيقة 1.",
              ...OFFICIAL(
                5,
                "Relecture du corrigé officiel eddirasa 2024 Maths (page 5). Verbe officiel : الفرضية المقترحة بعد الربط. Question du الجزء الأول."
              ),
              placeholder: "الفرضية: تغير بنية بروتين الكولاجين المكون للغشاء القاعدي...",
              minLength: 30,
              modelAnswer:
                "الفرضية: تغير بنية بروتين الكولاجين المكون للغشاء القاعدي هو سبب الإصابة بمتلازمة ألبورت.",
              rule: {
                prompt: "اقترح سببا لمتلازمة ألبورت",
                keywords: ["كولاجين", "البورت", "غشاء"],
                minHits: 2,
                forbidden: []
              }
            },
            S: {
              points: 3,
              prompt: "تحليل نتائج الدم والبول والفحص المجهري لوحدة التصفية",
              bacPrompt:
                "حلّل نتائج التحليل في الدم والبول والرسوم التخطيطية للفحوصات المجهرية في الوثيقة 1.",
              ...OFFICIAL(
                5,
                "Relecture du corrigé officiel eddirasa 2024 Maths (page 5). Verbe officiel : حلّل. Question du الجزء الأول."
              ),
              placeholder: "البروتين في الدم 72 غ/ل ضمن الطبيعي وفي البول 5.43... الغشاء غير منتظم...",
              minLength: 90,
              modelAnswer:
                "في الدم تركيز البروتين 72 غ/ل ضمن القيم الطبيعية وفي البول توجد البروتينات بمقدار 5.43 وهي خارج القيم الطبيعية. كريات الدم الحمراء متواجدة في الدم والبول عند المصاب بينما عند السليم في القيم الطبيعية توجد فقط في الدم. يظهر الغشاء القاعدي متجانسا ذا سمك ثابت عند العادي وغير منتظم بسمك متغير عند المصاب مع وجود كريات حمراء وبروتينات في الأنبوب البولي. ومنه ينتج عن متلازمة ألبورت ظهور البروتينات والكريات الحمراء في البول لتغير بنية الغشاء القاعدي.",
              rule: {
                prompt: "حلل نتائج الدم والبول والغشاء القاعدي",
                keywords: ["بروتين", "بول", "غشاء", "5.43"],
                minHits: 3,
                forbidden: ["بسبب"],
                document: {
                  kind: "table",
                  axes: ["دم", "بول"],
                  comparisons: [["سليم", "مصاب"]],
                  cells: [["بروتين", "كريات"]],
                  values: ["5.43"],
                  strictValues: true
                }
              }
            },
            E: {
              points: 6,
              prompt: "توضيح خطوات تعبير المورثة COL4A5 عند السليم والمصاب",
              bacPrompt:
                "وضّح خطوات تعبير المورثة المسؤولة عن ظهور ألياف الكولاجين في الغشاء القاعدي لوحدة التصفية عند الشخصين العادي والمصاب بمتلازمة ألبورت.",
              ...OFFICIAL(
                6,
                "Consigne وضّح (تعبير المورثة/الكولاجين) lue sur le fichier local dzexams p3 = livret p6. Ancienne valeur 7 = pagination du corrigé eddirasa, corrigée le 2026-09-23."
              ),
              placeholder: "عند السليم: GGA → Gly... عند المصاب: GAA → Glu طفرة...",
              minLength: 110,
              modelAnswer:
                "عند الشخص العادي تُنسخ مورثة COL4A5 إلى ARNm (...GGA GAA CGU GGA UUU...) فتُترجم إلى Gly-Glu-Arg-Gly-Phe فيتركب كولاجين طبيعي بألياف منتظمة. عند المصاب طفرة تستبدل GGA بـ GAA فيُدمج Glu بدل Gly فتتركب ألياف كولاجين غير طبيعية يحدث بها خلل وتليف في وحدة التصفية وتظهر المتلازمة. تتأكد الفرضية: تغير بنية بروتين الكولاجين هو سبب الإصابة.",
              rule: {
                prompt: "وضح تعبير COL4A5 عند السليم والمصاب",
                keywords: ["COL4A5", "Gly", "Glu", "كولاجين"],
                minHits: 3,
                forbidden: [],
                causalOrder: ["طفره", "كولاجين"]
              }
            },
            W: {
              points: 3,
              prompt: "مخطط: من المورثة إلى متلازمة ألبورت",
              bacPrompt: "أنجز مخططا يوضح مسار الطفرة في COL4A5 حتى ظهور المتلازمة.",
              ...RECON("Schéma du corrigé officiel (page 7)."),
              placeholder: "مورثة طبيعية → كولاجين سليم... مورثة طافرة → Glu بدل Gly → تليف...",
              minLength: 0,
              modelAnswer:
                "عنوان المخطط: تعبير COL4A5. شخص عادي: مورثة COL4A5 → استنساخ وترجمة → بروتين كولاجين به Gly → ألياف طبيعية. شخص مصاب: مورثة طافرة → استنساخ وترجمة → بروتين به Glu بدل Gly → ألياف غير طبيعية → خلل وتليف في وحدة التصفية → ظهور المتلازمة.",
              rule: {
                prompt: "انجز مخطط مسار COL4A5",
                keywords: ["مخطط", "COL4A5", "تليف"],
                minHits: 1,
                forbidden: [],
                schema: { arrows: true, title: "البورت", ordered: ["مورثه", "كولاجين", "تليف"] }
              }
            }
          }
        }
      ]
    }
  ]
};

export default YEAR_2024_M;
