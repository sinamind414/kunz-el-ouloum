/* 2023 — Sciences expérimentales.
 * Le livret dzexams imprimait de faux chiffres (40 سا، 40 نقاط، الوثيقة 0).
 * Remplacé le 2026-09-21 par le PDF eddirasa, relu sur l'image : المدة 04 سا
 * و 30 د، barème 05+07+08، documents numérotés. Découpé en sujet-1 = pages
 * 1–4 et sujet-2 = pages 5–10. Chargé à la demande par data/subjects.js.
 */
const YEAR_2023_SE = {
  id: "2023",
  label: "بكالوريا الجزائر دورة 2023 — شعبة علوم تجريبية",
  theme: "amber",
  enabled: true,
  sujets: [
    {
      id: 1,
      pdf: null,
      pdfExternalUrl: "https://eddirasa.com/wp-content/uploads/2023/06/eddirasa.com-bac-sciences-se-2023.pdf",
      pdfLocalUrl: "/subjects/SE/2023/sujet-1.pdf",
      pdfNote:
        "Remplace le livret dzexams dont l'impression montrait « المدة: 40 سا و 04 د », « (40 نقاط) » et « الوثيقة 0 ». Source eddirasa relue sur l'image le 2026-09-21 : المدة 04 سا و 30 د, exercice 3 à 08 نقاط, documents 1, 2 et 3. Le fichier local est le sujet 1 seul (pages 1 à 4). Le chronomètre reste 4 h 30 et le barème encodé 5+7+8, ce que le PDF propre confirme.",
      title: "الموضوع الأول",
      exercises: [
        {
          number: 1,
          ui: "text",
          label: "البروتينات الغشائية في المشبك وتوكسين الكزاز",
          max: 5,
          desc: "دور البروتينات الغشائية (مستقبلات وقنوات) للخلية بعد المشبكية في النقل المشبكي، وأثر توكسين بكتيريا الكزاز (Clostridium tetani) المثبط للإفراز",
          poles: {
            N: {
              points: 1,
              prompt: "تأطير الإشكالية: كيف تعمل البروتينات الغشائية في المشبك وما أثر ذيفان الكزاز عليها؟",
              bacPrompt:
                "كيف تتدخل مختلف البروتينات الغشائية في عمل المشبك، وما أثر ذيفان الكزاز على هذا العمل؟",
              bacPromptSource: "reconstructed",
              bacPromptNotes:
                "Pas de question officielle autonome de type « حدد المشكل ». Reformulation pédagogique du préambule page 1.",
              placeholder: "صياغة المشكل العلمي...",
              minLength: 30,
              modelAnswer:
                "المشكل العلمي: كيف تتدخل مختلف البروتينات الغشائية للخلية بعد المشبكية في عمل المشبك، وما أثر تثبيط إفراز GABA بذيفان الكزاز على النقل العصبي؟",
              rule: {
                prompt: "حدد المشكل العلمي حول البروتينات الغشائية في المشبك",
                keywords: ["مشبك", "بروتين", "غشائي", "كزاز"],
                minHits: 2,
                forbidden: []
              }
            },
            S: {
              points: 1,
              prompt: "تسمية التسجيلين والبروتين الغشائي المسؤول عن كل تسجيل",
              bacPrompt:
                "سمّ التسجيلين المتوقع الحصول عليهما في أجهزة راسم الاهتزاز المهبطي (أ) و(ب) وكذا البروتين الغشائي للخلية بعد المشبكية المسؤول عن كل تسجيل.",
              bacPromptSource: "official",
              bacPromptPage: 1,
              bacPromptVerifiedAt: "2026-09-21",
              bacPromptNotes:
                "Relecture visuelle de la page 1 (image, pas la couche texte). Verbe officiel : سمّ. Question 1 du التمرين الأول.",
              placeholder: "تسجيل تنبيهي/تثبيطي، مستقبل غشائي...",
              minLength: 30,
              modelAnswer:
                "التسجيل (أ) جهد بعد مشبكي تنبيهي PPSE والتسجيل (ب) جهد بعد مشبكي تثبيطي PPSI. البروتين الغشائي المسؤول: مستقبل غشائي للمبلغ العصبي (مستقبل الأستيل كولين المنبّه ومستقبل GABA المثبط).",
              rule: {
                prompt: "سم التسجيلين والبروتين الغشائي المسؤول",
                keywords: ["مشبكي", "مستقبل", "تسجيل", "غشائي"],
                minHits: 2,
                forbidden: []
              }
            },
            E: {
              points: 2,
              prompt: "النص العلمي: دور البروتينات الغشائية في عمل المشبك وأثر ذيفان الكزاز",
              bacPrompt:
                "بيّن في نص علمي دور مختلف البروتينات الغشائية في عمل المشابك وتأثير توكسين الكزاز على ذلك انطلاقا من معطيات الوثيقة ومعلوماتك. (النص العلمي مُهيكل بمقدمة وعرض وخاتمة)",
              bacPromptSource: "official",
              bacPromptPage: 1,
              bacPromptVerifiedAt: "2026-09-21",
              bacPromptNotes:
                "Relecture visuelle de la page 1. Verbe officiel : بيّن. Le sujet écrit توكسين et المشابك, pas ذيفان ni المشبك.",
              placeholder: "مقدمة، عرض، خاتمة...",
              minLength: 120,
              modelAnswer:
                "ترتبط المبالغ العصبية بمستقبلات غشائية نوعية على الغشاء بعد المشبكي فتتفتح قنوات شاردية نوعية: يرتبط GABA بمستقبله المثبط فيدخل Cl⁻ ويتولد جهد تثبيطي، بينما يرتبط الأستيل كولين بمستقبله المنبّه فيدخل Na⁺ ويتولد جهد تنبيهي، ويُدمج المحصّل على مستوى العصبون. يمنع ذيفان الكزاز تحرير GABA فيغيب التثبيط وتسيطر المكونات التنبيهية فيحدث تقلص عضلي عنيف.",
              rule: {
                prompt: "بين دور البروتينات الغشائية وأثر ذيفان الكزاز",
                keywords: ["مستقبل", "غشائي", "تثبيط", "تنبيه", "تحرير"],
                minHits: 3,
                forbidden: []
              }
            },
            W: {
              points: 1,
              prompt: "الخاتمة: أثر ذيفان الكزاز على النقل العصبي",
              bacPrompt: "ما أثر تثبيط إفراز GABA بذيفان الكزاز على عمل المشبك والنقل العصبي؟",
              bacPromptSource: "reconstructed",
              bacPromptNotes:
                "La clôture est incluse dans le texte scientifique officiel (pôle E). Ce pôle isole pédagogiquement la clôture, ce n'est pas une question BAC autonome.",
              placeholder: "في الختام...",
              minLength: 40,
              modelAnswer:
                "في الختام، بتثبيط تحرير GABA يختل توازن المشبك فتهيمن المكونات التنبيهية ويحدث تقلص عضلي عنيف.",
              rule: {
                prompt: "اكتب خاتمة حول أثر ذيفان الكزاز",
                keywords: ["تثبيط", "مشبك", "تقلص"],
                minHits: 2,
                forbidden: []
              }
            }
          }
        },
        {
          number: 2,
          ui: "text",
          label: "دواء ML901 والملاريا",
          max: 7,
          desc: "تثبيط تركيب البروتين لدى طفيلي البلاسموديوم المسبب للملاريا بدواء ML901، دون التأثير على خلايا الإنسان",
          poles: {
            N: {
              points: 1,
              prompt: "تأطير الإشكالية: كيف يستغل دواء ML901 تثبيط تركيب البروتين لعلاج الملاريا؟",
              bacPrompt:
                "كيف يستغل دواء ML901 تثبيط تركيب البروتين لعلاج الملاريا دون الإضرار بخلايا الإنسان؟",
              bacPromptSource: "reconstructed",
              bacPromptNotes:
                "Pas de question officielle autonome de type « حدد المشكل ». Reformulation pédagogique du préambule.",
              placeholder: "صياغة المشكل العلمي...",
              minLength: 30,
              modelAnswer:
                "المشكل العلمي: كيف يثبط دواء ML901 تركيب البروتين لدى طفيلي البلاسموديوم دون التأثير على خلايا الإنسان؟",
              rule: {
                prompt: "حدد المشكل العلمي حول دواء ML901",
                keywords: ["ML901", "بروتين", "طفيلي", "تركيب"],
                minHits: 2,
                forbidden: []
              }
            },
            S: {
              points: 2.5,
              prompt: "مقارنة النتائج التجريبية للشكل (أ) من الوثيقة 1",
              bacPrompt: "قارن بين النتائج التجريبية الموضحة في الشكل (أ) من الوثيقة 1.",
              bacPromptSource: "official",
              bacPromptPage: 2,
              bacPromptVerifiedAt: "2026-08-25",
              bacPromptNotes:
                "Relecture visuelle de la page 2. Verbe officiel : قارن. Question 1 du الجزء الأول. Consigne « حلّل منحنَيَي الشكل (ب) من الوثيقة 1 » (question 2) non mappée (un pôle = une consigne).",
              placeholder: "قارن بالتوازي: في غياب العلاج وفي وجوده...",
              minLength: 90,
              modelAnswer:
                "تمثل الوثيقة تغير معدل الطفيليات في الدم بدلالة الزمن. نلاحظ في غياب العلاج ارتفاعا متواصلا لمعدل الطفيليات حتى اليوم السابع، بينما ينخفض هذا المعدل مع استعمال ML901 حتى الانعدام. ومنه نستنتج أن دواء ML901 يثبط تكاثر الطفيلي المسبب للملاريا.",
              rule: {
                prompt: "قارن بين النتائج التجريبية للشكل أ",
                keywords: ["علاج", "طفيلي", "معدل", "زمن"],
                minHits: 2,
                forbidden: ["بسبب"],
                document: {
                  kind: "curve",
                  axes: ["معدل", "زمن"],
                  comparisons: [["علاج", "غياب"]],
                  trends: [
                    {
                      about: "علاج",
                      expect: ["انخفاض", "ينخفض"]
                    },
                    {
                      about: "غياب",
                      expect: ["ارتفاع", "يرتفع"]
                    }
                  ],
                  relations: [
                    {
                      type: "inverse",
                      a: "علاج",
                      b: "معدل"
                    }
                  ],
                  values: [],
                  strictValues: false
                }
              }
            },
            E: {
              points: 2.5,
              prompt: "تبرير أهمية استعمال دواء ML901",
              bacPrompt: "برّر أهمية استعمال دواء ML901 انطلاقا من معلوماتك ونتائج الوثيقتين 2 و3.",
              bacPromptSource: "official",
              bacPromptPage: 3,
              bacPromptVerifiedAt: "2026-09-21",
              bacPromptNotes:
                "Relecture visuelle de la page 3 du PDF eddirasa. Verbe officiel : برّر. La figure au-dessus est la الوثيقة 3, pas 0.",
              placeholder: "الموقع الفعال، Tyr-ARNt، تثبيط الترجمة...",
              minLength: 110,
              modelAnswer:
                "يستعمل ML901 لعلاج الملاريا لأن الطفيلي لا يستطيع إنتاج بروتيناته بدون الحمض الأميني تيروزين المنشط، إذ يرتبط ML901 بالموقع الفعال لأنزيم تنشيط التيروزين في مكان AMP فيمنع تشكل معقد Tyr-ARNt فتتوقف الترجمة ويموت الطفيلي، بينما لا يتأثر الإنسان لأن أنزيمه لا يثبت الدواء.",
              rule: {
                prompt: "برر أهمية استعمال ML901",
                keywords: ["ML901", "تيروزين", "ARNt", "تنشيط", "ترجمه"],
                minHits: 3,
                forbidden: []
              }
            },
            W: {
              points: 1,
              prompt: "الخلاصة: انتقائية دواء ML901",
              bacPrompt: "ما أهمية انتقائية دواء ML901 في التمييز بين خلايا الطفيلي وخلايا الإنسان؟",
              bacPromptSource: "reconstructed",
              bacPromptNotes:
                "La clôture est incluse dans le justificatif officiel (pôle E). Pas une question BAC autonome.",
              placeholder: "في الختام...",
              minLength: 40,
              modelAnswer:
                "في الختام، تكمن أهمية ML901 في انتقائيته: يثبط تنشيط التيروزين عند الطفيلي فقط فيتوقف تركيبه البروتيني دون المساس بخلايا الإنسان.",
              rule: {
                prompt: "اكتب خلاصة حول انتقائية ML901",
                keywords: ["انتقائي", "انسان", "طفيلي"],
                minHits: 2,
                forbidden: []
              }
            }
          }
        },
        {
          number: 3,
          ui: "text",
          label: "سرطان الثدي ومادة الكيرسيتين",
          max: 8,
          desc: "تكاثر خلايا سرطان الثدي بدفع من الأستراديول ودور أنزيم الأروماتاز، واستغلال مادة الكيرسيتين (Quercetin) لإيجاد حلول علاجية",
          poles: {
            N: {
              points: 0.5,
              prompt: "اقتراح فرضيتين للحد من تطور سرطان الثدي",
              bacPrompt: "اقترح فرضيتين للحدّ من تطور سرطان الثدي باستغلال معلوماتك ونتائج شكلي الوثيقة 1.",
              bacPromptSource: "official",
              bacPromptPage: 3,
              bacPromptVerifiedAt: "2026-09-21",
              bacPromptNotes:
                "Relecture visuelle de la page 3 du PDF eddirasa. Verbe officiel : اقترح فرضيتين. Question unique du الجزء الأول. Le fichier propre imprime (08 نقاط) ; le barème encodé reste 8.",
              placeholder: "فرضية 1، فرضية 2...",
              minLength: 30,
              modelAnswer:
                "الفرضية 1: مادة تثبط عمل أنزيم الأروماتاز فتمنع تركيب الأستراديول ولا تتكاثر الخلايا السرطانية. الفرضية 2: مادة تثبت على مستقبلات الأستراديول فتمنع تحفيز تكاثر الخلايا السرطانية.",
              rule: {
                prompt: "اقترح فرضيتين للحد من سرطان الثدي",
                keywords: ["فرضيه", "استراديول", "تكاثر"],
                minHits: 1,
                forbidden: [],
                hypotheses: {
                  min: 2,
                  distinct: true
                }
              }
            },
            S: {
              points: 2,
              prompt: "استغلال الوثيقة 1: تكاثر الخلايا بدلالة الأستراديول ودور البروتينات",
              bacPrompt:
                "استغل شكلي الوثيقة 1: تكاثر الخلايا السرطانية بدلالة تراكيز الأستراديول، ودور مستقبل الأستراديول وأنزيم الأروماتاز في هذا التكاثر.",
              bacPromptSource: "reconstructed",
              bacPromptNotes:
                "La page 3 décrit les figures (أ) et (ب) mais la seule consigne écrite est « اقترح فرضيتين ». L'exploitation chiffrée est une étape pédagogique, pas une question officielle autonome.",
              placeholder: "قارن بالتوازي: قبل/بعد حقن الأستراديول...",
              minLength: 60,
              modelAnswer:
                "تمثل الوثيقة تكاثر الخلايا السرطانية بدلالة الزمن. نلاحظ ارتفاع تكاثر الخلايا بسرعة بعد حقن الأستراديول مقارنة بما قبله، ويمثل الشكل (ب) كيف يحوّل أنزيم الأروماتاز الأندروجينات إلى أستراديول الذي يثبت على مستقبله الغشائي ويحفز التكاثر.",
              rule: {
                prompt: "استغل الوثيقة 1 حول تكاثر الخلايا",
                keywords: ["تكاثر", "استراديول", "خليه", "اروماتاز"],
                minHits: 2,
                forbidden: ["بسبب"],
                document: {
                  kind: "curve",
                  axes: ["تكاثر", "زمن"],
                  comparisons: [["قبل", "بعد"]],
                  trends: [
                    {
                      about: "بعد",
                      expect: ["ارتفاع", "يرتفع"]
                    }
                  ],
                  values: [],
                  strictValues: false
                }
              }
            },
            E: {
              points: 4,
              prompt: "مناقشة صحة الفرضيتين وتقديم نصيحة",
              bacPrompt:
                "ناقش صحة الفرضيتين المقترحتين بناءً على معلوماتك وما تُقدّمه لك نتائج الوثيقتين 2 و3، ثُمّ قدّم نصيحة للوقاية من سرطان الثدي.",
              bacPromptSource: "official",
              bacPromptPage: 4,
              bacPromptVerifiedAt: "2026-09-21",
              bacPromptNotes:
                "Relecture visuelle de la page 4 du PDF eddirasa. Verbe officiel : ناقش. La نصيحة est dans la même consigne. Les figures sont légendées الوثيقة 2 et الوثيقة 3.",
              placeholder: "الموقع الفعال للأروماتاز، مستقبل الأستراديول...",
              minLength: 110,
              modelAnswer:
                "تثبت مادة الكيرسيتين على الموقع الفعال لأنزيم الأروماتاز فتثبط نشاطه وتمنع تركيب الأستراديول، كما تثبت على مستقبل الأستراديول فتمنع تشكل معقد أستراديول-مستقبل؛ ومنه تتراجع وتيرة تكاثر الخلايا السرطانية ونمو الورم، فتتأكد الفرضيتان معا. النصيحة: تناول الخضروات الغنية بالكيرسيتين للوقاية من سرطان الثدي.",
              rule: {
                prompt: "ناقش صحة الفرضيتين باستغلال الوثيقتين 2 و3",
                keywords: ["اروماتاز", "كيرسيتين", "مستقبل", "استراديول", "فرضيه"],
                minHits: 3,
                forbidden: []
              }
            },
            W: {
              points: 1.5,
              prompt: "المخطط: تطور الورم في غياب ووجود الكيرسيتين",
              bacPrompt:
                "لخّص في مخطط تطور الورم السرطاني في غياب ووجود مادة الكيرسيتين اعتمادا على ما توصلت إليه في هذه الدراسة ومكتسباتك.",
              bacPromptSource: "official",
              bacPromptPage: 4,
              bacPromptVerifiedAt: "2026-09-21",
              bacPromptNotes:
                "Relecture visuelle de la page 4. Verbe officiel : لخّص في مخطط. Question du الجزء الثالث.",
              placeholder: "أستراديول → تكاثر → ورم؛ وفي وجود الكيرسيتين...",
              minLength: 0,
              modelAnswer:
                "عنوان المخطط: تطور الورم السرطاني. أستراديول → مستقبله → تكاثر الخلايا السرطانية → نمو الورم، وفي وجود الكيرسيتين يتوقف التكاثر ويتراجع الورم.",
              rule: {
                prompt: "لخص في مخطط تطور الورم",
                keywords: ["مخطط", "ورم", "كيرسيتين"],
                minHits: 1,
                forbidden: [],
                schema: {
                  arrows: true,
                  title: "تطور الورم",
                  ordered: ["استراديول", "تكاثر", "كيرسيتين"]
                }
              }
            }
          }
        }
      ]
    },
    {
      id: 2,
      pdf: null,
      pdfExternalUrl: "https://eddirasa.com/wp-content/uploads/2023/06/eddirasa.com-bac-sciences-se-2023.pdf",
      pdfLocalUrl: "/subjects/SE/2023/sujet-2.pdf",
      pdfNote:
        "Même livret eddirasa que le sujet 1, pages 5 à 10. Relu sur l'image le 2026-09-21 : التمرين الأول (05 نقاط), التمرين الثاني (07 نقاط), التمرين الثالث (08 نقاط), documents 1 et 2. La couche texte reste inversée ; les consignes viennent de l'image.",
      title: "الموضوع الثاني",
      exercises: [
        {
          number: 1,
          ui: "text",
          label: "البنية الفراغية للبروتين والطفرات",
          max: 5,
          desc: "الروابط المسؤولة عن استقرار البنية الفراغية للبروتين، ودور التتابع النوكليوتيدي للمورثة في الحفاظ على وظيفة البروتين وأثر الطفرات",
          poles: {
            N: {
              points: 1,
              prompt: "تأطير الإشكالية: كيف تضمن المورثة استقرار بنية البروتين ووظيفته؟",
              bacPrompt:
                "كيف يضمن التتابع النوكليوتيدي في المورثة استقرار البنية الفراغية للبروتين ووظيفته، وكيف تؤثر الطفرات في ذلك؟",
              bacPromptSource: "reconstructed",
              bacPromptNotes:
                "Pas de question officielle autonome de type « حدد المشكل ». Reformulation pédagogique du préambule.",
              placeholder: "صياغة المشكل العلمي...",
              minLength: 30,
              modelAnswer:
                "المشكل العلمي: كيف يضمن التتابع النوكليوتيدي في المورثة استقرار البنية الفراغية للبروتين ووظيفته، وكيف يؤثر تغيره (الطفرة) في فقدان التخصص الوظيفي؟",
              rule: {
                prompt: "حدد المشكل العلمي حول بنية البروتين",
                keywords: ["نوكليوتيد", "بروتين", "طفره", "بنيه"],
                minHits: 2,
                forbidden: []
              }
            },
            S: {
              points: 1,
              prompt: "اختيار العبارات الصحيحة حول البنية الفراغية للبروتين",
              bacPrompt:
                "إختر العبارة الصحيحة من العبارات المقترحة لتكملة الجمل التالية: أ- الروابط التكافئية التي تساهم في استقرار البنية الفراغية للبروتينات هي: a الجسور ثنائية الكبريت. b الروابط الكارهة للماء. c الروابط الشاردية. ب- تتوقف البنية الفراغية وبالتالي التخصص الوظيفي للبروتينات على: a الروابط التي تنشأ بين أحماض أمينية محددة ومتموضعة بشكل دقيق في السلسلة الببتيدية. b طبيعة وعدد الأحماض الأمينية فقط في السلسلة الببتيدية. c عدد وترتيب الاحماض الأمينية فقط في السلسلة الببتيدية. ت- إن ترتيب الأحماض الأمينية في السلسلة الببتيدية يفرضه ترتيب الرامزات في: a ARNr. b ARNm. c ARNt. ث- أصل الطفرة الوراثية هو تغير على مستوى: a ARNm. b ADN. c البروتين.",
              bacPromptSource: "official",
              bacPromptPage: 5,
              bacPromptVerifiedAt: "2026-09-21",
              bacPromptNotes:
                "Relecture visuelle de la page 5 du livret (page 1 du fichier sujet 2). Verbe officiel : إختر. QCM à 4 items, choix recopiés tels qu'imprimés (dont « الاحماض » sans hamza).",
              placeholder: "أ- جسور ثنائية الكبريت، ب- …، ت- ARNm، ث- ADN...",
              minLength: 30,
              modelAnswer:
                "أ- جسور ثنائية الكبريت فقط. ب- الروابط التي تنشأ بين أحماض أمينية محددة وموضعة بشكل دقيق في السلسلة البيبتيدية. ت- ترتيب الترميزات في ARNm. ث- تغير على مستوى ADN.",
              rule: {
                prompt: "اختر العبارة الصحيحة حول بنية البروتين",
                keywords: ["كبريت", "ARNm", "ADN", "امينيه"],
                minHits: 2,
                forbidden: []
              }
            },
            E: {
              points: 2,
              prompt: "النص العلمي: دور مكونات المورثة وأثر الطفرات",
              bacPrompt:
                "وضّح في نص علمي كيف يحافظ التسلسل النيكليوتيدي للمورثة على وظيفة البروتين مبرزًا دور بعض الطفرات في فقدان التخصص الوظيفي. (النص العلمي مُهيكل بمقدمة وعرض وخاتمة)",
              bacPromptSource: "official",
              bacPromptPage: 5,
              bacPromptVerifiedAt: "2026-09-21",
              bacPromptNotes:
                "Relecture visuelle de la page 5 du livret. Verbe officiel : وضّح, pas أبرز. Question 2 du التمرين الأول.",
              placeholder: "مقدمة، عرض، خاتمة...",
              minLength: 120,
              modelAnswer:
                "يتحدد التتابع النوكليوتيدي للـ ARNm بالنسخ انطلاقا من إحدى سلسلتي ADN بتدخل أنزيم ARNp، وكل رامزة (ثلاثية نوكليوتيدات) ترمز لحمض أميني محدد تُربط أثناء الترجمة وفق ترتيب الترميزات فتتشكل السلسلة البيبتيدية وتنطوي إلى بنية فراغية محددة تحدد وظيفتها. أي تغير (طفرة) في تتابع النوكليوتيدات يغيّر نوع أو عدد الأحماض الأمينية فيفقد البروتين بنيته الفراغية وتخصصه الوظيفي.",
              rule: {
                prompt: "اكتب نصا علميا حول مكونات المورثة والطفرات",
                keywords: ["تتابع", "نوكليوتيد", "بروتين", "طفره", "تخصص"],
                minHits: 3,
                forbidden: []
              }
            },
            W: {
              points: 1,
              prompt: "الخاتمة: أثر الطفرة على وظيفة البروتين",
              bacPrompt: "ما أثر تغير التتابع النوكليوتيدي على البنية الفراغية والتخصص الوظيفي للبروتين؟",
              bacPromptSource: "reconstructed",
              bacPromptNotes:
                "La clôture est incluse dans le texte scientifique officiel (pôle E). Pas une question BAC autonome.",
              placeholder: "في الختام...",
              minLength: 40,
              modelAnswer:
                "في الختام، أي طفرة في التتابع النوكليوتيدي قد تغير البنية الفراغية للبروتين فيفقد تخصصه الوظيفي.",
              rule: {
                prompt: "اكتب خاتمة حول أثر الطفرة",
                keywords: ["طفره", "وظيفه", "بروتين"],
                minHits: 2,
                forbidden: []
              }
            }
          }
        },
        {
          number: 2,
          ui: "text",
          label: "الخلايا التائية السامة والبرفورين",
          max: 7,
          desc: "إقصاء الخلايا المصابة ببروتين البرفورين الذي تفرزه الخلايا التائية السامة (LTc)، وآلية حماية هذه الخلايا لنفسها من تأثيره",
          poles: {
            N: {
              points: 1,
              prompt: "تأطير الإشكالية: كيف تحمي الخلايا LTc نفسها من البيرفورين؟",
              bacPrompt:
                "كيف تحمي الخلايا التائية السامة (LTc) نفسها من تأثير بروتين البيرفورين الذي تفرزه لإقصاء الخلايا المصابة؟",
              bacPromptSource: "reconstructed",
              bacPromptNotes:
                "Pas de question officielle autonome de type « حدد المشكل ». Reformulation pédagogique du préambule.",
              placeholder: "صياغة المشكل العلمي...",
              minLength: 30,
              modelAnswer:
                "المشكل العلمي: كيف تحمي الخلايا التائية السامة (LTc) نفسها من تأثير البيرفورين الذي تفرزه، بينما تتأثر به الخلايا المصابة؟",
              rule: {
                prompt: "حدد المشكل العلمي حول حماية LTc",
                keywords: ["لمفاويه", "بيرفورين", "مصابه", "خليه"],
                minHits: 2,
                forbidden: []
              }
            },
            S: {
              points: 2.5,
              prompt: "تحليل مقارن للبنية الجزيئية لغشاء LTc والخلايا المصابة",
              bacPrompt:
                "قدّم تحليلا مقارنا للبنية الجزيئية لغشائي الـ (LTc) والخلايا المصابة الممثلة في الشكل (أ) من الوثيقة 1.",
              bacPromptSource: "official",
              bacPromptPage: 6,
              bacPromptVerifiedAt: "2026-09-21",
              bacPromptNotes:
                "Relecture visuelle de la page 6 du livret. Verbe officiel : قدّم تحليلا مقارنا. Question 1 du الجزء الأول. Consigne « برّر الاختلاف بين بنيتي غشائي الـ (LTc) والخلايا المصابة انطلاقا من نتائج الشكل (ب) من الوثيقة 1 » non mappée (un pôle = une consigne).",
              placeholder: "قارن: الكوليسترول، البيرفورين، الغشاء...",
              minLength: 90,
              modelAnswer:
                "تمثل الوثيقة البنية الجزيئية لغشاء LTc وغشاء الخلية المصابة. يتشابه الغشاءان في كونهما طبقة ثنائية فوسفوليبيدية تحتوي كوليسترول، بينما يختلفان في نسبة الكوليسترول (أعلى عند LTc) وفي وجود قنوات البيرفورين المتشكلة فقط على غشاء الخلية المصابة. ومنه نستنتج أن غشاء LTc يتميز عن غشاء الخلية المصابة بنسبة الكوليسترول وغياب قنوات البيرفورين.",
              rule: {
                prompt: "حلل البنية الجزيئية لغشائي LTc والمصابة",
                keywords: ["غشاء", "كوليسترول", "بيرفورين", "لمفاويه"],
                minHits: 2,
                forbidden: ["بسبب"],
                document: {
                  kind: "curve",
                  axes: ["بنيه", "غشاء"],
                  comparisons: [["LTc", "مصابه"]],
                  trends: [
                    {
                      about: "LTc",
                      expect: ["كوليسترول", "اعلي"]
                    }
                  ],
                  relations: [
                    {
                      type: "parallel",
                      a: "LTc",
                      b: "مصابه"
                    }
                  ],
                  values: [],
                  strictValues: false
                }
              }
            },
            E: {
              points: 2.5,
              prompt: "شرح آلية حماية الخلايا LTc لنفسها من البيرفورين",
              bacPrompt:
                "اشرح الآلية التي تحمي بها الخلايا (LTc) نفسها من تأثير البرفورين على مستوى العضوية وذلك انطلاقا من استغلال النتائج المبينة في أشكال الوثيقة 2.",
              bacPromptSource: "official",
              bacPromptPage: 7,
              bacPromptVerifiedAt: "2026-09-21",
              bacPromptNotes:
                "Relecture visuelle de la page 7 du livret. Verbe officiel : اشرح. Le sujet écrit البرفورين, pas البيرفورين.",
              placeholder: "الكوليسترول، السيولة الغشائية، تثبيت البيرفورين...",
              minLength: 110,
              modelAnswer:
                "تعود حماية الخلايا LTc لنفسها إلى ارتفاع نسبة الكوليسترول والفينغومييلين (SM) في غشائها مما يخفض سيولته الغشائية، فيتعذر تثبيت البيرفورين وتشكل القنوات، فلا تتسرب إنزيمات الغرانزيم إلى داخل LTc؛ عكس غشاء الخلية المصابة الأفقر في الكوليسترول الذي يسمح بتثبيت البيرفورين وتشكل القنوات فتُخرَّب الخلية.",
              rule: {
                prompt: "اشرح آلية حماية LTc من البيرفورين",
                keywords: ["غشاء", "بيرفورين", "كوليسترول", "حمايه", "تثبيت"],
                minHits: 3,
                forbidden: []
              }
            },
            W: {
              points: 1,
              prompt: "الخلاصة: حماية الذات أثناء الإقصاء المناعي",
              bacPrompt: "ما الميزة البنيوية التي تحمي الخلايا LTc أثناء إقصائها للخلايا المصابة؟",
              bacPromptSource: "reconstructed",
              bacPromptNotes:
                "La clôture est incluse dans l'explication officielle (pôle E). Pas une question BAC autonome.",
              placeholder: "في الختام...",
              minLength: 40,
              modelAnswer:
                "في الختام، يحمي ارتفاع الكوليسترول والفينغومييلين غشاء LTc من تشكل قنوات البيرفورين فتنجو الخلية المناعية أثناء تخريبها للخلايا المصابة.",
              rule: {
                prompt: "اكتب خلاصة حول حماية LTc",
                keywords: ["حمايه", "لمفاويه", "بيرفورين"],
                minHits: 2,
                forbidden: []
              }
            }
          }
        },
        {
          number: 3,
          ui: "text",
          label: "مبيد DCMU والمرحلة الكيموضوئية",
          max: 8,
          desc: "آلية تأثير مبيد DCMU على المرحلة الكيموضوئية (النظام الضوئي الثاني PSII) وتحويل الطاقة الضوئية عند النباتات",
          poles: {
            N: {
              points: 0.5,
              prompt: "اقتراح فرضيتين حول آلية تأثير DCMU",
              bacPrompt:
                "اقترح فرضيتين حول آلية تأثير (DCMU) على المرحلة الكيموضوئية باستغلال معلوماتك ونتائج أشكال الوثيقة 1.",
              bacPromptSource: "official",
              bacPromptPage: 8,
              bacPromptVerifiedAt: "2026-09-21",
              bacPromptNotes:
                "Relecture visuelle de la page 8 du livret. Verbe officiel : اقترح فرضيتين. Le sujet écrit الكيموضوئية, pas المرحلة الكيميائية الضوئية.",
              placeholder: "فرضية 1، فرضية 2...",
              minLength: 30,
              modelAnswer:
                "الفرضية 1: يثبط DCMU أكسدة الماء (النظام الضوئي الثاني) فيتوقف تحرر الإلكترونات. الفرضية 2: يمنع DCMU انتقال الإلكترونات نحو الناقل الأول T1 فتتوقف السلسلة التركيبية الضوئية.",
              rule: {
                prompt: "اقترح فرضيتين حول تأثير DCMU",
                keywords: ["فرضيه", "DCMU", "ضوء"],
                minHits: 1,
                forbidden: [],
                hypotheses: {
                  min: 2,
                  distinct: true
                }
              }
            },
            S: {
              points: 2,
              prompt: "استغلال الوثيقة 1: تحرر O2 واختزال DCPIP في الضوء والظلام",
              bacPrompt:
                "استغل أشكال الوثيقة 1: نسبة الأكسجين المطروح واختزال DCPIP بدلالة الزمن في وجود الضوء وفي الظلام وبدلالة تراكيز DCMU.",
              bacPromptSource: "reconstructed",
              bacPromptNotes:
                "La page 7 décrit les figures (أ/ب/ج) mais la seule consigne écrite est « اقترح فرضيتين ». L'exploitation chiffrée est une étape pédagogique, pas une question officielle autonome.",
              placeholder: "في الضوء/في الظلام، DCPIP، O₂...",
              minLength: 60,
              modelAnswer:
                "تمثل الوثيقة نسبة الأكسجين المطروح واختزال DCPIP بدلالة الزمن. نلاحظ في الضوء ارتفاعا في تحرر O2 واختزال DCPIP، بينما لا يحدث أي تحرر في الظلام، كما ينخفض تحرر O2 بارتفاع تركيز DCMU حتى الانعدام. ومنه نستنتج أن الضوء ضروري لأكسدة الماء وأن DCMU يثبط المرحلة الكيميائية الضوئية.",
              rule: {
                prompt: "استغل الوثيقة 1 حول تأثير DCMU",
                keywords: ["اكسجين", "DCPIP", "ضوء", "ظلام"],
                minHits: 2,
                forbidden: ["بسبب"],
                document: {
                  kind: "curve",
                  axes: ["اكسجين", "زمن"],
                  comparisons: [["ضوء", "ظلام"]],
                  trends: [
                    {
                      about: "ضوء",
                      expect: ["ارتفاع", "يرتفع"]
                    }
                  ],
                  relations: [
                    {
                      type: "inverse",
                      a: "DCMU",
                      b: "اكسجين"
                    }
                  ],
                  values: [],
                  strictValues: false
                }
              }
            },
            E: {
              points: 4,
              prompt: "مناقشة صحة إحدى الفرضيتين",
              bacPrompt:
                "ناقش صحة إحدى الفرضيتين المقترحتين باستغلالك لمعلوماتك والنتائج الممثلة في أشكال الوثيقة 2.",
              bacPromptSource: "official",
              bacPromptPage: 10,
              bacPromptVerifiedAt: "2026-09-21",
              bacPromptNotes:
                "Relecture visuelle de la page 10 du livret. Verbe officiel : ناقش. Question 1 du الجزء الثاني. Consigne « قدّم على ضوء ذلك نصيحة للمزارعين فيما يخص استعمال (DCMU) في الميدان الزراعي » non mappée (un pôle = une consigne).",
              placeholder: "PSII، الناقل T1، انتقال الإلكترونات...",
              minLength: 110,
              modelAnswer:
                "تتأكد الفرضية الثانية: عند غياب DCMU يواصل PSII امتصاص الفوتونات الضوئية وأكسدة الماء فيحرر إلكترونين يختزلان الناقل T1، أما في وجود DCMU فيثبت المبيد على جزء من PSII مانعا انتقال الإلكترونات نحو T1 فتتوقف أكسدة الماء وخض البروتونات نحو جوف التيلاكوئيد. النصيحة: ترشيد استعمال المبيدات أو استبدالها بمبيدات بيولوجية.",
              rule: {
                prompt: "ناقش صحة الفرضية حول تأثير DCMU",
                keywords: ["DCMU", "PSII", "الكترون", "ناقل", "اكسده"],
                minHits: 3,
                forbidden: []
              }
            },
            W: {
              points: 1.5,
              prompt: "رسم تخطيطي وظيفي لتحويل الطاقة الضوئية",
              bacPrompt:
                "وضّح في رسم تخطيطي وظيفي عليه البيانات آليات تحويل الطاقة الضوئية خلال المرحلة الكيموضوئية في وجود وغياب المبيد (DCMU) اعتمادا على معلوماتك وما استخلصته مما سبق.",
              bacPromptSource: "official",
              bacPromptPage: 10,
              bacPromptVerifiedAt: "2026-09-21",
              bacPromptNotes:
                "Relecture visuelle de la page 10 du livret. Verbe officiel : وضّح في رسم تخطيطي, pas حوّل. La page 11 n'existe pas dans le livret.",
              placeholder: "ضوء → PSII → إلكترونات → T1 → H⁺...",
              minLength: 0,
              modelAnswer:
                "عنوان المخطط: تحويل الطاقة الضوئية. في غياب DCMU: ضوء → PSII → أكسدة الماء → إلكترونات → الناقل T1 → خض H⁺ إلى جوف التيلاكوئيد. في وجود DCMU: يثبت المبيد على PSII فيتوقف انتقال الإلكترونات إلى T1 وتتوقف أكسدة الماء.",
              rule: {
                prompt: "حول في رسم تخطيطي آليات تحويل الطاقة",
                keywords: ["ضوء", "PSII", "DCMU"],
                minHits: 1,
                forbidden: [],
                schema: {
                  arrows: true,
                  title: "تحويل الطاقة",
                  ordered: ["ضوء", "PSII", "الكترون"]
                }
              }
            }
          }
        }
      ]
    }
  ],
  stream: "se",
  calendarYear: "2023"
};

export { YEAR_2023_SE };
export default YEAR_2023_SE;
