/* 2024 — Sciences expérimentales. Données extraites du catalogue historique sans modifier les champs de contenu ni de provenance.
 * Chargé à la demande par data/subjects.js.
 */
const YEAR_2024_SE = {
  id: "2024",
  label: "بكالوريا الجزائر دورة 2024 — شعبة علوم تجريبية",
  theme: "indigo",
  enabled: true,
  sujets: [
    {
      id: 1,
      pdf: null,
      pdfExternalUrl: "https://eddirasa.com/wp-content/uploads/2024/06/bac-sc-sciences-2024.pdf",
      pdfLocalUrl: "/subjects/SE/2024/sujet-1.pdf",
      pdfNote:
        "PDF non redistribué dans le dépôt ; source: https://eddirasa.com/bac-science-2024-se/ (consulté 2026-08-25). Miroir dzexams: https://www.dzexams.com/ar/annales/bkVXVzlvRTlpV1RMYUk5cGNyS3oxdz09 · PDF: https://www.dzexams.com/uploads/sujets/officiels/bac/2024/dzexams-bac-sciences-naturelles-1751784.pdf. Pages 2, 6, 7 et 10 relues sur photos du sujet officiel (2026-08-31). Viewer dzexams bloqué (0 pages) dans la sandbox. Session de remplacement non localisée.",
      title: "الموضوع الأول",
      exercises: [
        {
          number: 1,
          ui: "text",
          label: "فيروس VIH والخلايا LT4",
          max: 5,
          desc: "مراحل تطور فيروس VIH داخل الخلايا التائية LT4 وتأثير دواء Zalcitabine المثبط لإحدى مراحل التطور على فقدان المناعة المكتسبة",
          poles: {
            N: {
              points: 1,
              prompt: "تأطير الإشكالية: كيف يتطور فيروس VIH داخل الخلايا LT4 وما أثر تثبيط إحدى مراحله؟",
              bacPrompt:
                "كيف يتطور فيروس VIH داخل الخلايا LT4 مسببا فقدان المناعة المكتسبة، وما أثر تثبيط إحدى مراحل هذا التطور بدواء Zalcitabine؟",
              bacPromptSource: "reconstructed",
              bacPromptNotes:
                "Thème lu sur la couche texte bruitée (2026-08-25). Pas de question autonome de cadrage ; reformulation pédagogique du préambule.",
              placeholder: "صياغة المشكل العلمي...",
              minLength: 40,
              modelAnswer:
                "المشكل العلمي: كيف يتطور فيروس VIH داخل الخلايا التائية LT4 مسببا فقدان المناعة المكتسبة، وما أثر تثبيط إحدى مراحل تطوره بدواء Zalcitabine على تكاثره؟",
              rule: {
                prompt: "حدد المشكل العلمي حول تطور VIH في LT4",
                keywords: ["فيروس", "LT4", "مناعه", "تطور"],
                minHits: 2,
                forbidden: []
              }
            },
            S: {
              points: 1,
              prompt: "استخراج مراحل تطور الفيروس من الوثيقة",
              bacPrompt: "استخرج من الوثيقة المراحل المختلفة لتطور فيروس VIH داخل الخلايا LT4.",
              bacPromptSource: "reconstructed",
              bacPromptNotes:
                "Reconstruction pédagogique 2024 — thème (VIH/LT4/Zalcitabine) lu sur la couche texte bruitée.",
              placeholder: "التصاق، نسخ عكسي، إدماج، تبرعم...",
              minLength: 40,
              modelAnswer:
                "تمثل الوثيقة رسما تخطيطيا لمراحل تطور فيروس VIH داخل الخلية LT4: الالتصاق بالخلية، النسخ العكسي للـ ARN الفيروسي، إدماج الـ ADN في مورثة الخلية، التعبير وتشكل فيروسات جديدة ثم تبرعمها خارج الخلية.",
              rule: {
                prompt: "استخرج مراحل تطور فيروس VIH",
                keywords: ["التصاق", "نسخ", "عكسي", "ادماج", "تبرعم"],
                minHits: 2,
                forbidden: ["بسبب"]
              }
            },
            E: {
              points: 2,
              prompt: "النص العلمي: مراحل تطور الفيروس وتأثير Zalcitabine",
              bacPrompt:
                "بيّن في نص علمي مراحل تطور فيروس VIH في الخلايا LT4 وتأثير دواء Zalcitabine على ذلك.",
              bacPromptSource: "reconstructed",
              bacPromptNotes:
                "Verbe officiel lu (بيّن في نص علمي) sur la couche texte bruitée ; wording reconstruit mot à mot.",
              placeholder: "مقدمة، عرض، خاتمة...",
              minLength: 120,
              modelAnswer:
                "يلتصق فيروس VIH بمستقبلات الخلية التائية LT4 ثم يحقن محتواه، فيُنسخ ARNه عكسيا إلى ADN يتكامل في مورثة الخلية، فتُعبَّر المورثة وتُنتج فيروسات جديدة تبرعم خارجا. يثبط دواء Zalcitabine مرحلة النسخ العكسي (المرحلة 2) فيمنع تشكل الـ ADN الفيروسي، فيتوقف تكاثر الفيروس ويحد من فقدان المناعة المكتسبة.",
              rule: {
                prompt: "بين مراحل تطور VIH وتأثير Zalcitabine",
                keywords: ["LT4", "نسخ", "عكسي", "Zalcitabine", "تكاثر"],
                minHits: 3,
                forbidden: []
              }
            },
            W: {
              points: 1,
              prompt: "الخاتمة: أثر تثبيط النسخ العكسي على المناعة",
              bacPrompt: "ما أثر تثبيط النسخ العكسي بدواء Zalcitabine على فقدان المناعة المكتسبة؟",
              bacPromptSource: "reconstructed",
              bacPromptNotes:
                "La clôture est incluse dans le texte scientifique officiel (pôle E). Pas une question BAC autonome.",
              placeholder: "في الختام...",
              minLength: 40,
              modelAnswer:
                "في الختام، بتثبيط النسخ العكسي يحد دواء Zalcitabine من تكاثر الفيروس داخل LT4 فيحمي الخلايا التائية من التلف ويحد من فقدان المناعة المكتسبة.",
              rule: {
                prompt: "اكتب خاتمة حول أثر Zalcitabine",
                keywords: ["نسخ", "تكاثر", "مناعه"],
                minHits: 2,
                forbidden: []
              }
            }
          }
        },
        {
          number: 2,
          ui: "text",
          label: "الصرع وتوازن التنبيه والتثبيط",
          max: 7,
          desc: "فقدان التوازن بين التنبيه (Glutamate) والتثبيط (GABA) على مستوى مشابك القشرة المخية عند المصابين بالصرع، ودور طفرة الجين Scn1a",
          poles: {
            N: {
              points: 1,
              prompt: "تأطير الإشكالية: أصل اختلال توازن التنبيه والتثبيط في الصرع",
              bacPrompt:
                "ما أصل اختلال التوازن بين التنبيه والتثبيط في اضطرابات الصرع، وما دور طفرة الجين Scn1a في ذلك؟",
              bacPromptSource: "reconstructed",
              bacPromptNotes:
                "Thème (Excitation/Inhibition, Glutamate/GABA, Scn1a) lu sur la couche texte bruitée ; pas de question autonome de cadrage.",
              placeholder: "صياغة المشكل العلمي...",
              minLength: 40,
              modelAnswer:
                "المشكل العلمي: ما أصل اختلال التوازن بين التنبيه والتثبيط على مستوى مشابك القشرة المخية في حالة الصرع، وما دور طفرة الجين Scn1a؟",
              rule: {
                prompt: "حدد المشكل العلمي حول الصرع",
                keywords: ["توازن", "تنبيه", "تثبيط", "صرع"],
                minHits: 2,
                forbidden: []
              }
            },
            S: {
              points: 2.5,
              prompt: "تحليل تواتر كمونات العمل في الشكل (أ) من الوثيقة 1",
              bacPrompt: "حلّل النتائج الممثّلة في الشكل (أ) من الوثيقة 1.",
              bacPromptSource: "official",
              bacPromptPage: 2,
              bacPromptVerifiedAt: "2026-08-31",
              bacPromptNotes:
                "Relecture visuelle photo page 2 du sujet officiel 2024 (ONEC). Verbe officiel : حلّل. Question 1 du الجزء الأول (Sujet 1, Ex2).",
              placeholder: "تواتر كمونات العمل، مصاب/طبيعي...",
              minLength: 90,
              modelAnswer:
                "تمثل الوثيقة تواتر كمونات العمل في وحدة الزمن على مستوى أغشية الخلايا العصبية قبل المشبكية. نلاحظ ارتفاع تواتر كمونات العمل لدى المصابين بالصرع، بينما يبقى منخفضا لدى الأفراد الطبيعيين، ومنه نستنتج فرط النشاط العصبي لدى المصابين.",
              rule: {
                prompt: "حلل تواتر كمونات العمل في الشكل أ",
                keywords: ["تواتر", "كمون", "مصاب", "طبيعي"],
                minHits: 2,
                forbidden: ["بسبب"],
                document: {
                  kind: "curve",
                  axes: ["تواتر", "كمون"],
                  comparisons: [["مصاب", "طبيعي"]],
                  trends: [
                    {
                      about: "مصاب",
                      expect: ["ارتفاع", "مرتفع"]
                    }
                  ],
                  relations: [
                    {
                      type: "inverse",
                      a: "مصاب",
                      b: "طبيعي"
                    }
                  ],
                  values: [],
                  strictValues: false
                }
              }
            },
            E: {
              points: 2.5,
              prompt: "بيان فقدان التوازن بين التنبيه والتثبيط في حالة الصرع",
              bacPrompt:
                "بيّن فقدان التوازن بين التنبيه والتثبيط على مستوى مشابك القشرة المخية في حالة الصرع انطلاقا من نتائج الشكل (ب) من الوثيقة 1.",
              bacPromptSource: "official",
              bacPromptPage: 2,
              bacPromptVerifiedAt: "2026-08-31",
              bacPromptNotes:
                "Relecture visuelle photo page 2 du sujet officiel 2024 (ONEC). Verbe officiel : بيّن. Question 2 du الجزء الأول (Sujet 1, Ex2).",
              placeholder: "Glutamate، GABA، تنبيه، تثبيط...",
              minLength: 110,
              modelAnswer:
                "يفقد التوازن بين التنبيه والتثبيط لأن كمية Glutamate المفرزة من العصبون (G) المنبّه ترتفع بينما تنخفض كمية GABA المفرزة من العصبون (A) المثبّط، فيغلب الاستثارة على التثبيط في مشابك القشرة المخية وتظهر نوبة الصرع. وتعود هذه العلامة المرضية إلى طفرة الجين Scn1a المشفّر لقناة الصوديوم.",
              rule: {
                prompt: "بين فقدان التوازن بين التنبيه والتثبيط",
                keywords: ["غلوتامات", "GABA", "تنبيه", "تثبيط", "توازن"],
                minHits: 3,
                forbidden: []
              }
            },
            W: {
              points: 1,
              prompt: "الخلاصة: دور طفرة Scn1a في الصرع",
              bacPrompt: "ما دور طفرة الجين Scn1a في ظهور اضطرابات الصرع؟",
              bacPromptSource: "reconstructed",
              bacPromptNotes:
                "La clôture est incluse dans l'explication officielle (pôle E). Pas une question BAC autonome.",
              placeholder: "في الختام...",
              minLength: 40,
              modelAnswer:
                "في الختام، تؤدي طفرة الجين Scn1a المشفّر لقناة الصوديوم إلى خلل في نقل الإشارة العصبية فتختل وظيفة العصبونات المثبطة ويسود التنبيه فتظهر نوبات الصرع.",
              rule: {
                prompt: "اكتب خلاصة حول دور طفرة Scn1a",
                keywords: ["طفره", "Scn1a", "قناه", "صرع"],
                minHits: 2,
                forbidden: []
              }
            }
          }
        },
        {
          number: 3,
          ui: "text",
          label: "بروتين P53 والبنزوبيرين",
          max: 8,
          desc: "أثر طفرة الجين P53 الناتجة عن التعرض للبنزوبيرين (BZP) في فقدان وظيفة البروتين الكابحة للأورام ونشأة سرطان الرئة",
          poles: {
            N: {
              points: 0.5,
              prompt: "تأطير الإشكالية: علاقة طفرة P53 بسرطان الرئة",
              bacPrompt: "كيف تؤدي طفرة الجين P53 الناتجة عن التعرض للبنزوبيرين إلى نشأة سرطان الرئة؟",
              bacPromptSource: "reconstructed",
              bacPromptNotes:
                "Thème (P53, Benzopyrène, cancer du poumon) lu sur la couche texte bruitée ; pas de question autonome de cadrage.",
              placeholder: "صياغة المشكل العلمي...",
              minLength: 30,
              modelAnswer:
                "المشكل العلمي: كيف تؤدي طفرة الجين P53 الناتجة عن التعرض للبنزوبيرين إلى فقدان وظيفة البروتين الكابحة للأورام ونشأة سرطان الرئة؟",
              rule: {
                prompt: "حدد المشكل العلمي حول P53 والبنزوبيرين",
                keywords: ["P53", "طفره", "بنزوبيرين", "سرطان"],
                minHits: 2,
                forbidden: []
              }
            },
            S: {
              points: 2,
              prompt: "استغلال الوثائق: تتابع الجين P53 السليم والسرطاني وعلاقة البنزوبيرين بالإصابة",
              bacPrompt:
                "استغل الوثائق: مقارنة تتابع الجين P53 السليم والسرطاني (Anagène) وتغير تركيز البنزوبيرين بدلالة نسبة احتمال الإصابة بسرطان الرئة.",
              bacPromptSource: "reconstructed",
              bacPromptNotes: "Reconstruction pédagogique 2024 — thème lu sur la couche texte bruitée.",
              placeholder: "تتابع، طفرة، تركيز، نسبة إصابة...",
              minLength: 60,
              modelAnswer:
                "تمثل الوثائق مقارنة تتابع الجين P53 السليم والسرطاني وتغير نسبة احتمال الإصابة بسرطان الرئة بدلالة عدد السجائر وتركيز البنزوبيرين. نلاحظ ظهور طفرة نقطية في التتابع السرطاني وارتفاع نسبة احتمال الإصابة بارتفاع تركيز البنزوبيرين، ومنه نستنتج علاقة البنزوبيرين بطفرة P53 ونشأة السرطان.",
              rule: {
                prompt: "استغل الوثائق حول P53 والبنزوبيرين",
                keywords: ["تتابع", "طفره", "بنزوبيرين", "اصابه"],
                minHits: 2,
                forbidden: ["بسبب"],
                document: {
                  kind: "table",
                  axes: ["تتابع", "تركيز"],
                  comparisons: [["سليم", "سرطاني"]],
                  cells: [["P53", "طفره"]],
                  values: [],
                  strictValues: false
                }
              }
            },
            E: {
              points: 4,
              prompt: "تفسير أثر طفرة P53 على وظيفته الكابحة للورم",
              bacPrompt:
                "فسّر كيف تفقد بروتينة P53 وظيفتها الكابحة للأورام عند حدوث طفرة ناتجة عن البنزوبيرين.",
              bacPromptSource: "reconstructed",
              bacPromptNotes: "Reconstruction pédagogique 2024 — thème lu sur la couche texte bruitée.",
              placeholder: "الموقع الفعال، تتابع، وظيفة كابحة...",
              minLength: 110,
              modelAnswer:
                "يعود فقدان الوظيفة الكابحة للأورام إلى طفرة نقطية في الجين P53 (استبدال نوكليوتيد) تغيّر حمضا أمينيا في البروتين، فيتغير تتابع الأحماض الأمينية وتفقد البروتينة قدرتها على تثبيط الانقسامات الشاذة، فتتكاثر الخلايا السرطانية ويتكون ورم الرئة تحت تأثير البنزوبيرين.",
              rule: {
                prompt: "فسر أثر طفرة P53 على وظيفته الكابحة",
                keywords: ["طفره", "P53", "بروتين", "انقسام", "ورم"],
                minHits: 3,
                forbidden: []
              }
            },
            W: {
              points: 1.5,
              prompt: "الخلاصة: مسار البنزوبيرين نحو الورم",
              bacPrompt: "لخّص المسار الذي يربط البنزوبيرين بطفرة P53 ونشأة ورم الرئة.",
              bacPromptSource: "reconstructed",
              bacPromptNotes:
                "La clôture est incluse dans l'explication (pôle E). Pas une question BAC autonome.",
              placeholder: "بنزوبيرين → طفرة → فقدان الوظيفة → ورم...",
              minLength: 40,
              modelAnswer:
                "في الختام، يحدث البنزوبيرين طفرة في الجين P53 فتفقد البروتينة وظيفتها الكابحة للأورام، فتتكاثر الخلايا دون رقابة ويتكون ورم الرئة.",
              rule: {
                prompt: "لخص مسار البنزوبيرين نحو الورم",
                keywords: ["بنزوبيرين", "طفره", "ورم"],
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
      pdfExternalUrl: "https://eddirasa.com/wp-content/uploads/2024/06/bac-sc-sciences-2024.pdf",
      pdfLocalUrl: "/subjects/SE/2024/sujet-2.pdf",
      pdfNote:
        "PDF non redistribué dans le dépôt ; même fichier que le sujet 1 (session normale, sujets 1 et 2). Pages 6, 7 et 10 relues sur photos du sujet officiel (2026-08-31). Viewer dzexams bloqué dans la sandbox.",
      title: "الموضوع الثاني",
      exercises: [
        {
          number: 1,
          ui: "text",
          label: "الترجمة وتأثير المضادات الحيوية",
          max: 5,
          desc: "ترجمة المعلومة الوراثية المحمولة على ARNm إلى متتالية أحماض أمينية في الهيولى، وتأثير مركبي Tetracycline وOxazolidinone المثبطين لهذه المرحلة",
          poles: {
            N: {
              points: 1,
              prompt: "تأطير الإشكالية: كيف تُترجم معلومة ARNm وما أثر تثبيطها؟",
              bacPrompt:
                "كيف تُترجم المعلومة الوراثية المحمولة على ARNm إلى متتالية أحماض أمينية في الهيولى، وما أثر تثبيط هذه المرحلة بمركبات كيميائية؟",
              bacPromptSource: "reconstructed",
              bacPromptNotes:
                "Thème (traduction, Tetracycline, Oxazolidinone) lu sur la couche texte bruitée ; pas de question autonome de cadrage.",
              placeholder: "صياغة المشكل العلمي...",
              minLength: 40,
              modelAnswer:
                "المشكل العلمي: كيف تُترجم المعلومة الوراثية المحمولة على ARNm إلى متتالية أحماض أمينية في الهيولى، وما أثر تثبيط الترجمة بمركبات كيميائية مختلفة؟",
              rule: {
                prompt: "حدد المشكل العلمي حول الترجمة",
                keywords: ["ترجمه", "ARNm", "احماض", "هيولي"],
                minHits: 2,
                forbidden: []
              }
            },
            S: {
              points: 1,
              prompt: "ذكر العناصر المتدخلة في حدوث الترجمة",
              bacPrompt: "اذكر العناصر المتدخّلة في حدوث هذه المرحلة.",
              bacPromptSource: "official",
              bacPromptPage: 6,
              bacPromptVerifiedAt: "2026-08-31",
              bacPromptNotes:
                "Relecture visuelle photo page 6 du sujet officiel 2024 (ONEC). Verbe officiel : اذكر. Question 1 du التمرين الأول (Sujet 2).",
              placeholder: "ARNm، ريبوزوم، ARNt...",
              minLength: 30,
              modelAnswer:
                "العناصر المتدخلة في الترجمة: ARNm، الريبوزوم، ARNt، الأحماض الأمينية المنشطة، الأنزيمات المنشطة وطاقة ATP.",
              rule: {
                prompt: "اذكر العناصر المتدخلة في الترجمة",
                keywords: ["ARNm", "ريبوزوم", "ARNt", "احماض"],
                minHits: 2,
                forbidden: []
              }
            },
            E: {
              points: 2,
              prompt: "النص العلمي: خطوات الترجمة وتأثير المركبين",
              bacPrompt:
                "اشرح في نص علمي خطوات الترجمة وتأثير كل من Oxazolidinone و Tetracycline عليها باستغلال الوثيقة ومعلوماتك (النص العلمي مهيكل في مقدمة وعرض وخاتمة).",
              bacPromptSource: "official",
              bacPromptPage: 6,
              bacPromptVerifiedAt: "2026-08-31",
              bacPromptNotes:
                "Relecture visuelle photo page 6 du sujet officiel 2024 (ONEC). Verbe officiel : اشرح. Question 2 du التمرين الأول (Sujet 2).",
              placeholder: "مقدمة، عرض، خاتمة...",
              minLength: 120,
              modelAnswer:
                "تبدأ الترجمة بارتباط الريبوزوم بالـ ARNm ثم تنقل أحماض أمينية منشطة محمولة على ARNt وفق الرامزات فتتشكل روابط بيبتيدية وتستطيل السلسلة. يثبط مركب Tetracycline تثبيت ARNt على الريبوزوم فيتوقف البدء أو الاستطالة، بينما يمنع مركب Oxazolidinone تشكل المركب البدئي للترجمة، فيتوقف تركيب البروتين.",
              rule: {
                prompt: "اشرح خطوات الترجمة وتأثير المركبين",
                keywords: ["ريبوزوم", "ARNt", "ترجمه", "Tetracycline", "Oxazolidinone"],
                minHits: 3,
                forbidden: []
              }
            },
            W: {
              points: 1,
              prompt: "الخاتمة: أثر تثبيط الترجمة على تركيب البروتين",
              bacPrompt: "ما أثر تثبيط الترجمة بمركبين كيميائيين على تركيب البروتين؟",
              bacPromptSource: "reconstructed",
              bacPromptNotes:
                "La clôture est incluse dans le texte scientifique officiel (pôle E). Pas une question BAC autonome.",
              placeholder: "في الختام...",
              minLength: 40,
              modelAnswer:
                "في الختام، بتثبيط الترجمة بمركب Tetracycline أو Oxazolidinone يتوقف تركيب البروتين في الخلية.",
              rule: {
                prompt: "اكتب خاتمة حول أثر تثبيط الترجمة",
                keywords: ["ترجمه", "تثبيط", "بروتين"],
                minHits: 2,
                forbidden: []
              }
            }
          }
        },
        {
          number: 2,
          ui: "text",
          label: "RUBISCO وتثبيت CO2 عند الفاصولياء",
          max: 7,
          desc: "تثبيت جزيئة CO2 على الريبولوز ثنائي الفوسفات بأنزيم RUBISCO وأثر عامل الظلام على تفاعلات التثبيت عند أوراق نبات الفاصولياء Phaseolus",
          poles: {
            N: {
              points: 1,
              prompt: "تأطير الإشكالية: أثر الظلام على تثبيت CO2",
              bacPrompt:
                "كيف يؤثر عامل الظلام على تفاعلات تثبيت جزيئة CO2 بأنزيم RUBISCO عند أوراق نبات الفاصولياء؟",
              bacPromptSource: "reconstructed",
              bacPromptNotes:
                "Thème (RUBISCO, CO2, RuBP, Phaseolus, CA1P) lu sur la couche texte bruitée ; pas de question autonome de cadrage.",
              placeholder: "صياغة المشكل العلمي...",
              minLength: 40,
              modelAnswer:
                "المشكل العلمي: كيف يؤثر عامل الظلام على تفاعلات تثبيت جزيئة CO2 على الريبولوز ثنائي الفوسفات بأنزيم RUBISCO عند أوراق نبات الفاصولياء؟",
              rule: {
                prompt: "حدد المشكل العلمي حول تثبيت CO2",
                keywords: ["RUBISCO", "تثبيت", "CO2", "ظلام"],
                minHits: 2,
                forbidden: []
              }
            },
            S: {
              points: 2.5,
              prompt: "تحليل نتائج تثبيت CO2 ونشاط RUBISCO",
              bacPrompt: "حلّل النتائج الممثّلة في الشكل (أ) من الوثيقة 1.",
              bacPromptSource: "official",
              bacPromptPage: 7,
              bacPromptVerifiedAt: "2026-08-31",
              bacPromptNotes:
                "Relecture visuelle photo page 7 du sujet officiel 2024 (ONEC). Verbe officiel : حلّل. Question 1 du الجزء الأول (Sujet 2, Ex2).",
              placeholder: "نشاط RUBISCO، CA1P، تثبيت CO2...",
              minLength: 90,
              modelAnswer:
                "تمثل الوثيقة نشاط أنزيم RUBISCO ونسبة تكوين CA1P وتثبيت CO2 بدلالة الزمن. نلاحظ ارتفاع نشاط RUBISCO في الضوء مع ارتفاع تثبيت CO2، بينما ينخفض النشاط في الظلام مع تكون CA1P المثبط، ومنه نستنتج أن الظلام يثبط نشاط RUBISCO عبر CA1P.",
              rule: {
                prompt: "حلل نتائج نشاط RUBISCO وتكوين CA1P",
                keywords: ["RUBISCO", "CA1P", "تثبيت", "ضوء"],
                minHits: 2,
                forbidden: ["بسبب"],
                document: {
                  kind: "curve",
                  axes: ["نشاط", "زمن"],
                  comparisons: [["ضوء", "ظلام"]],
                  trends: [
                    {
                      about: "ضوء",
                      expect: ["ارتفاع", "مرتفع"]
                    }
                  ],
                  relations: [
                    {
                      type: "inverse",
                      a: "ظلام",
                      b: "نشاط"
                    }
                  ],
                  values: [],
                  strictValues: false
                }
              }
            },
            E: {
              points: 2.5,
              prompt: "شرح أثر الظلام على نشاط RUBISCO عبر CA1P",
              bacPrompt:
                "أبرز العلاقة بين كمية (CA1P) في الأوراق ونسبة نشاط الأنزيم (Rubisco) انطلاقا من نتائج الشكل (ب) والمعلومة المستخلصة من الشكل (أ) من الوثيقة 1.",
              bacPromptSource: "official",
              bacPromptPage: 7,
              bacPromptVerifiedAt: "2026-08-31",
              bacPromptNotes:
                "Relecture visuelle photo page 7 du sujet officiel 2024 (ONEC). Verbe officiel : أبرز. Question 2 du الجزء الأول (Sujet 2, Ex2). Consigne du الجزء الثاني (mécanisme du الظلام) non mappée (un pôle = une consigne).",
              placeholder: "CA1P، الموقع الفعال، تثبيط...",
              minLength: 110,
              modelAnswer:
                "في الظلام يتراكم مثبط CA1P الذي يتثبت على الموقع الفعال لأنزيم RUBISCO فيمنع تثبيت CO2 على الريبولوز ثنائي الفوسفات، فلا يتشكل المركب السداسي ولا حمض الفوسفوغليسيريك، فتتوقف تفاعلات تثبيت CO2 في أوراق الفاصولياء.",
              rule: {
                prompt: "أبرز العلاقة بين كمية CA1P ونشاط Rubisco",
                keywords: ["RUBISCO", "CA1P", "تثبيت", "ظلام", "موقع"],
                minHits: 3,
                forbidden: []
              }
            },
            W: {
              points: 1,
              prompt: "الخلاصة: أهمية الضوء لتثبيت CO2",
              bacPrompt: "ما أهمية الضوء في الحفاظ على نشاط RUBISCO وتثبيت CO2؟",
              bacPromptSource: "reconstructed",
              bacPromptNotes:
                "La clôture est incluse dans l'explication (pôle E). Pas une question BAC autonome.",
              placeholder: "في الختام...",
              minLength: 40,
              modelAnswer:
                "في الختام، يحافظ الضوء على نشاط أنزيم RUBISCO بمنع تراكم مثبط CA1P، فيستمر تثبيت CO2 وإنتاج المادة العضوية عند النبات.",
              rule: {
                prompt: "اكتب خلاصة حول أهمية الضوء لتثبيت CO2",
                keywords: ["ضوء", "RUBISCO", "تثبيت"],
                minHits: 2,
                forbidden: []
              }
            }
          }
        },
        {
          number: 3,
          ui: "text",
          label: "المناعة ضد البكتيريا الممرضة",
          max: 8,
          desc: "الاستجابة المناعية ضد Corynebacterium diphtheriae وStaphylococcus aureus ودور بروتين SPA في تحديد أفضل سيرورة للقضاء على البكتيريا",
          poles: {
            N: {
              points: 0.5,
              prompt: "تأطير الإشكالية: آلية القضاء على البكتيريا الممرضة",
              bacPrompt:
                "كيف تقضي المناعة على البكتيريا الممرضة (Corynebacterium وStaphylococcus aureus)، وما دور بروتين SPA في ذلك؟",
              bacPromptSource: "reconstructed",
              bacPromptNotes:
                "Thème (diphtérie, S. aureus, SPA) lu sur la couche texte bruitée ; pas de question autonome de cadrage.",
              placeholder: "صياغة المشكل العلمي...",
              minLength: 30,
              modelAnswer:
                "المشكل العلمي: كيف تقضي المناعة على البكتيريا الممرضة Corynebacterium وStaphylococcus aureus، وما دور بروتين SPA في تحديد أفضل سيرورة للقضاء عليها؟",
              rule: {
                prompt: "حدد المشكل العلمي حول المناعة ضد البكتيريا",
                keywords: ["مناعه", "بكتيريا", "مستضد", "ممرضه"],
                minHits: 2,
                forbidden: []
              }
            },
            S: {
              points: 2,
              prompt: "استغلال الوثائق: نسبة الروابط الميكروبية ضد الممرضين",
              bacPrompt:
                "استغل الوثائق: نسبة الارتباط بالمستضدات (AgCd) و(AgSa) والبروتينات المناعية ضد Corynebacterium وStaphylococcus aureus.",
              bacPromptSource: "reconstructed",
              bacPromptNotes: "Reconstruction pédagogique 2024 — thème lu sur la couche texte bruitée.",
              placeholder: "أجسام مضادة، مستضد، نسبة ارتباط...",
              minLength: 60,
              modelAnswer:
                "تمثل الوثائق نسبة ارتباط الأجسام المضادة بمستضدات البكتيريا Corynebacterium (AgCd) وStaphylococcus aureus (AgSa). نلاحظ ارتباطا نوعيا مرتفعا للأجسام المضادة بمستضدها الموافق، ومنه نستنتج خصوصية الاستجابة المناعية الخلطية ضد كل بكتيريا.",
              rule: {
                prompt: "استغل الوثائق حول المناعة ضد البكتيريا",
                keywords: ["مستضد", "اجسام", "مضاده", "ارتباط"],
                minHits: 2,
                forbidden: ["بسبب"],
                document: {
                  kind: "table",
                  axes: ["ارتباط", "مستضد"],
                  comparisons: [["AgCd", "AgSa"]],
                  cells: [["مستضد", "ارتباط"]],
                  values: [],
                  strictValues: false
                }
              }
            },
            E: {
              points: 4,
              prompt: "مناقشة صحة الفرضية حول بروتين SPA والإفلات المناعي",
              bacPrompt: "ناقش صحة إحدى الفرضيتين المقترحتين باستغلالك لأشكال الوثيقة 2 ومعلوماتك.",
              bacPromptSource: "official",
              bacPromptPage: 10,
              bacPromptVerifiedAt: "2026-08-31",
              bacPromptNotes:
                "Relecture visuelle photo page 10 du sujet officiel 2024 (ONEC). Verbe officiel : ناقش. Question 1 du الجزء الثاني (Sujet 2, Ex3). Consigne اقترح حلا للمشكل non mappée (un pôle = une consigne).",
              placeholder: "SPA، جسم مضاد، بلعمة...",
              minLength: 110,
              modelAnswer:
                "يرتبط بروتين SPA الموجود على جدار Staphylococcus aureus بالقطعة Fc للأجسام المضادة فيمنع تثبيتها عبر مواقعها المتغيرة على المستضد ويعطل البلعمة، فتستفيد البكتيريا من الإفلات المناعي. وللقضاء عليها تُستعمل سيرورة تحييد SPA لاستعادة التعرف النوعي وتسهيل البلعمة.",
              rule: {
                prompt: "ناقش صحة الفرضية باستغلال الوثيقة 2",
                keywords: ["SPA", "جسم", "مضاد", "بلعمه", "مستضد"],
                minHits: 3,
                forbidden: []
              }
            },
            W: {
              points: 1.5,
              prompt: "مخطط الاستجابة المناعية الخلطية في وجود وغياب البكتيريا",
              bacPrompt:
                "لخّص في مخطط مراحل الاستجابة المناعية الخلطية في وجود وغياب بكتيريا Staphylococcus aureus اعتمادا على ما سبق ومعلوماتك.",
              bacPromptSource: "official",
              bacPromptPage: 10,
              bacPromptVerifiedAt: "2026-08-31",
              bacPromptNotes:
                "Relecture visuelle photo page 10 du sujet officiel 2024 (ONEC). Verbe officiel : لخّص في مخطط. Question du الجزء الثالث (Sujet 2, Ex3).",
              placeholder: "في الختام...",
              minLength: 0,
              modelAnswer:
                "عنوان المخطط: الاستجابة المناعية الخلطية. في غياب SPA: مستضد → جسم مضاد → بلعمة. في وجود Staphylococcus aureus و SPA: ارتباط SPA بالقطعة Fc يعطل البلعمة.",
              rule: {
                prompt: "لخص في مخطط الاستجابة المناعية الخلطية",
                keywords: ["مخطط", "SPA", "بلعمه"],
                minHits: 1,
                forbidden: [],
                schema: {
                  arrows: true,
                  title: "استجابة",
                  ordered: ["مستضد", "جسم", "بلعمه"]
                }
              }
            }
          }
        }
      ]
    }
  ],
  stream: "se",
  calendarYear: "2024"
};

export { YEAR_2024_SE };
export default YEAR_2024_SE;
