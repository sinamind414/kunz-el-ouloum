/* 2025 — Sciences expérimentales. Données extraites du catalogue historique sans modifier les champs de contenu ni de provenance.
 * Chargé à la demande par data/subjects.js.
 */
const YEAR_2025_SE = {
  id: "2025",
  label: "بكالوريا الجزائر دورة 2025 — شعبة علوم تجريبية",
  theme: "emerald",
  enabled: true,
  sujets: [
    {
      id: 1,
      pdf: null,
      pdfFilename: null,
      pdfExternalUrl: "https://www.dzexams.com/ar/annales/S3VKb3UrRU9MUnJHVG5ndENaV1FIdz09",
      pdfLocalUrl: "/subjects/SE/2025/sujet-1.pdf",
      pdfNote: "Source externe DzExams 2025 ; le dépôt ne redistribue pas le PDF tiers.",
      title: "الموضوع الأول",
      exercises: [
        {
          number: 1,
          ui: "text",
          label: "دور الـ ARN في تركيب البروتين",
          max: 5,
          desc: "أنواع الأحماض الريبية النووية (ARN) ودورها في تركيب البروتين وتأثير مادة RIP التي تكسر الرابطة أدنين–ريبوز",
          poles: {
            N: {
              points: 1,
              prompt:
                "تأطير الإشكالية: دور مختلف أنواع ARN في تركيب البروتين وتأثير المادة المُعطِّلة على الأورام السرطانية",
              bacPrompt: "كيف تتدخل مختلف أنواع الـ ARN في تركيب البروتين، وما أثر مادة RIP على هذا التركيب؟",
              bacPromptSource: "reconstructed",
              bacPromptNotes:
                "Pas de question officielle autonome de type « حدد المشكل ». Reformulation pédagogique du préambule page 1.",
              placeholder: "صياغة المشكل العلمي بدقة...",
              minLength: 40,
              modelAnswer:
                "المشكل العلمي: كيف تتدخل مختلف أنواع الـ ARN في تركيب البروتين، وما أثر تكسير الرابطة أدنين–ريبوز بمادة RIP على تكاثر الخلايا السرطانية؟",
              rule: {
                prompt: "حدد المشكل العلمي حول دور أنواع ARN",
                keywords: [["الحمض", "ARN"], "الريبوزي", "النووي", "البروتين", ["تركيب", "اصطناع"]],
                minHits: 2,
                forbidden: []
              }
            },
            S: {
              points: 1,
              prompt: "انتقاء المفاهيم: أنواع ARN المتواجدة في الهيولى خلال وخارج فترة تركيب البروتين",
              bacPrompt: "اذكر مختلف أنواع الـ ARN المتواجدة في الهيولى خلال وخارج فترة تركيب البروتين.",
              bacPromptSource: "official",
              bacPromptPage: 1,
              bacPromptVerifiedAt: "2026-08-23",
              bacPromptNotes:
                "Relecture visuelle du scan page 1 (Sujet 1). Verbe officiel : اذكر. Question 1 du التمرين الأول.",
              placeholder: "رسول، ناقل، ريبوزومي، ريبوزوم، هيولى...",
              minLength: 30,
              modelAnswer:
                "خلال تركيب البروتين تتواجد في الهيولى ARN رسول وARN ناقل وARN ريبوزومي. خارج فترة التركيب يبقى أساسا ARN ناقل وARN ريبوزومي.",
              rule: {
                prompt: "اذكر مختلف أنواع ARN",
                keywords: ["رسول", "ناقل", "ريبوزوم", "هيولي"],
                minHits: 2,
                forbidden: []
              }
            },
            E: {
              points: 2,
              prompt:
                "هيكلة العرض السببي: دور كل نوع من ARN + أثر المادة المعطِّلة (كسر الرابطة أدنين–ريبوز)",
              bacPrompt:
                "اشرح في نصٍ علميٍ دور مختلف أنواع الـ ARN في تركيب البروتين مبرزا تأثير مادة الـ RIP في علاج بعض الأورام السرطانية. (النص العلمي مُهيكل بمقدمة وعرض وخاتمة)",
              bacPromptSource: "official",
              bacPromptPage: 1,
              bacPromptVerifiedAt: "2026-08-23",
              bacPromptNotes:
                "Relecture visuelle du scan page 1. Verbe officiel : اشرح. Question 2 du التمرين الأول.",
              placeholder: "الـARN الرسول ينقل المعلومة، الـARN الناقل يحمل الأحماض الأمينية...",
              minLength: 120,
              modelAnswer:
                "ينقل ARN الرسول المعلومة الوراثية، وينقل ARN الناقل الأحماض الأمينية إلى الريبوزوم حيث يضمن ARN الريبوزومي الترجمة. تكسر مادة RIP الرابطة أدنين–ريبوز فتتوقف الاستطالة ويتوقف تكاثر الخلايا السرطانية.",
              rule: {
                prompt: "اشرح دور أنواع ARN وأثر RIP",
                keywords: ["الرسول", "الناقل", "الريبوزوم", "الادنين", "السكر", "العرض"],
                minHits: 3,
                forbidden: [],
                wrongConcepts: ["SOD", "RUBISCO"]
              }
            },
            W: {
              points: 1,
              prompt: "الخاتمة التركيبية: كيف يُثبِّط الدواء تكاثر الخلايا السرطانية",
              bacPrompt:
                "كيف يُفضي تكسير الرابطة أدنين–ريبوز بمادة RIP إلى توقف تركيب البروتين وتثبيط تكاثر الخلايا السرطانية؟",
              bacPromptSource: "reconstructed",
              bacPromptNotes:
                "La question officielle est un texte scientifique unique (pôle E). Ce pôle isole pédagogiquement la clôture, ce n'est pas une question BAC autonome.",
              placeholder: "الخاتمة كإجابة نهائية مختصرة...",
              minLength: 40,
              modelAnswer:
                "في الختام، بتكسير الرابطة أدنين–ريبوز يتوقف تركيب البروتين فتتوقف الخلايا السرطانية عن التكاثر.",
              rule: {
                prompt: "اكتب خاتمة حول تأثير RIP",
                keywords: ["الانواع", "الثلاثه", "البروتين", "يتوقف"],
                minHits: 2,
                forbidden: []
              }
            }
          }
        },
        {
          number: 2,
          ui: "text",
          label: "الطحالب الخضراء وثاني أكسيد الكربون",
          max: 7,
          desc: "بنية الصانعات الخضراء وآلية استغلال CO₂ عند الطحالب الطبيعية والطافرة (T.pseudonana)",
          poles: {
            N: {
              points: 1,
              prompt:
                "تأطير الإشكالية: العلاقة بين بنية الصانعات الخضراء وآلية استغلال CO₂ وتحويل الطاقة الضوئية",
              bacPrompt: "ما العلاقة بين بنية الصانعات الخضراء وآلية استغلال CO₂ عند طحالب T.pseudonana؟",
              bacPromptSource: "reconstructed",
              bacPromptNotes:
                "Le préambule page 1-2 pose le cadre ; aucune question officielle autonome « حدد المشكل » pour ce pôle.",
              placeholder: "المتغيرات والمشكل العلمي...",
              minLength: 30,
              modelAnswer:
                "المشكل العلمي: كيف تسمح البنية النسيجية للصانعة الخضراء (البيرينويد) باستغلال تراكيز منخفضة من CO₂؟",
              rule: {
                prompt: "حدد العلاقة بين بنية الصانعات واستغلال CO2",
                keywords: ["الصانعات", "الخضراء", "اكسيد", "الكربون", "الضوئيه"],
                minHits: 2,
                forbidden: []
              }
            },
            S: {
              points: 2.5,
              prompt:
                "مصفوفة استغلال الوثائق بالأرقام: مقارنة النمو بين النمط الطبيعي والطافر عند تراكيز CO₂ مختلفة",
              bacPrompt: "حلّل نتائج الشكل(أ) من الوثيقة1.",
              bacPromptSource: "official",
              bacPromptPage: 2,
              bacPromptVerifiedAt: "2026-08-23",
              bacPromptNotes:
                "Relecture visuelle page 2. Verbe officiel : حلّل. Question 1 du الجزء الأول. Consigne page 2 « أبرز أثر الخصائص البنيوية… » non mappée (un pôle = une consigne).",
              placeholder: "حلّل الشكل (أ): قارن بالتوازي النطبيعي والطافر...",
              minLength: 90,
              modelAnswer:
                "تمثل الوثيقة نسبة نمو النمط الطبيعي والطافر بدلالة تركيز HCO3⁻. نلاحظ نموا مرتفعا عند الطبيعي في التركيز المنخفض بينما ينخفض نمو الطافر، ومنه نستنتج أن النمط الطبيعي يستغل التراكيز المنخفضة بكفاءة أعلى.",
              rule: {
                prompt: "حلل نتائج الشكل أ من الوثيقة 1",
                keywords: ["نمو", "طبيعي", "طافر", "التركيز", "نسبه"],
                minHits: 3,
                forbidden: ["بسبب"],
                document: {
                  kind: "curve",
                  axes: ["نمو", "تركيز"],
                  comparisons: [["طبيعي", "طافر"]],
                  trends: [
                    {
                      about: "طبيعي",
                      expect: ["مرتفع", "نمو"]
                    },
                    {
                      about: "طافر",
                      expect: ["ينخفض", "منخفض"]
                    }
                  ],
                  domains: [
                    {
                      about: "طبيعي",
                      expect: ["مرتفع", "منخفض"]
                    },
                    {
                      about: "طافر",
                      expect: ["ينخفض", "منخفض"]
                    }
                  ],
                  relations: [
                    {
                      type: "parallel",
                      a: "طبيعي",
                      b: "طافر"
                    }
                  ],
                  values: ["منخفض", "مرتفع", "نسبه"],
                  strictValues: true
                }
              }
            },
            E: {
              points: 2.5,
              prompt: "الربط السببي: دور أنزيم RUBISCO والبِرينويد والتيلاكوئيد في تثبيت CO₂ وتحويل الطاقة",
              bacPrompt:
                "اشرح الآلية التي تسمح للطحالب T.P من النمط الطبيعي بتحويل الطاقة الضوئية في أوساط ذات تراكيز CO₂ منخفضة، وذلك باستغلالك لأشكال الوثيقة 2 ومكتسباتك.",
              bacPromptSource: "official",
              bacPromptPage: 3,
              bacPromptVerifiedAt: "2026-08-23",
              bacPromptNotes: "Relecture visuelle page 3. Verbe officiel : اشرح. Question 1 après الوثيقة 2.",
              placeholder: "يتشرب CO₂ من الوسط، أنزيم RUBISCO يثبّته على RuBP...",
              minLength: 110,
              modelAnswer:
                "يعود ذلك إلى تجميع HCO3⁻ في البيرينويد وتحويله إلى CO₂ بواسطة CA ثم تثبيته بأنزيم RUBISCO على RudIP مما يسمح بتحويل الطاقة الضوئية رغم انخفاض CO₂ الخارجي.",
              rule: {
                prompt: "اشرح آلية تحويل الطاقة عند النمط الطبيعي",
                keywords: ["الانزيم", "تثبيت", "البيرينويد", "التيلاكوئيد", "الضوئيه"],
                minHits: 3,
                forbidden: [],
                wrongConcepts: ["SOD", "اميلاد", "هيموغلوبين"],
                causalOrder: ["البيرينويد", "تثبيت", "الضوئيه"]
              }
            },
            W: {
              points: 1,
              prompt: "الاستخلاص: تبرير حماية الطحالب الطبيعية حفاظاً على البيئة البحرية",
              bacPrompt:
                "برر تأكيد الباحثين على حماية الطحالب T.P الطبيعية حفاظا على البيئة البحرية، انطلاقا من الدراسة السابقة.",
              bacPromptSource: "official",
              bacPromptPage: 3,
              bacPromptVerifiedAt: "2026-08-23",
              bacPromptNotes:
                "Relecture visuelle page 3. Verbe officiel : برر. Question 2 de clôture du التمرين الثاني.",
              placeholder: "الطاقة الكيميائية الكامنة رغم انخفاض CO₂...",
              minLength: 40,
              modelAnswer:
                "في الختام يجب حماية الطحالب الطبيعية لأنها تثبّت CO₂ وتنتج O₂ وتحفظ توازن البيئة البحرية حتى عند انخفاض التركيز.",
              rule: {
                prompt: "برر حماية الطحالب الطبيعية",
                keywords: ["حمايه", "تلوث", "اكسجين", "يثبت", "طحالب", "طبيعي", "بيئه"],
                minHits: 2,
                forbidden: []
              }
            }
          }
        },
        {
          number: 3,
          ui: "pipeline",
          label: "الأدينوزين، الكافيين والنشاط العصبي",
          max: 8,
          desc: "أثر Methylthéobromine (Mtb) على دور الأدينوزين (Ado) في النشاط العصبي (اليقظة/النوم)",
          poles: {
            N: {
              points: 0.5,
              prompt: "تأطير المسعى: ضبط المتغيرات (تركيز أدينوزين/كافيين، النشاط الدماغي)، وصياغة الفرضيتين",
              bacPrompt:
                "اقترح فرضيتين حول آلية تأثير مادة الـ Mtb على دور الـ Ado في النشاط العصبي الخاص باليقظة والنوم باستغلالك لشكلي الوثيقة1 ومعلوماتك.",
              bacPromptSource: "official",
              bacPromptPage: 4,
              bacPromptVerifiedAt: "2026-08-23",
              bacPromptNotes:
                "Relecture visuelle page 4. Verbe officiel : اقترح فرضيتين. Seule consigne chiffrée du الجزء الأول.",
              minLength: 30,
              modelAnswer:
                "الفرضية 1: يتنافس Mtb مع Ado على المستقبل A1R. الفرضية 2: يثبط Mtb إفراز Ado نفسه.",
              rule: {
                prompt: "اقترح فرضيتين حول تأثير Mtb",
                keywords: ["فرضيه", "ادينوزين", "مستقبل"],
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
              prompt:
                "مصفوفة استغلال الوثيقة 1 (الشكل أ: النشاط العصبي / الشكل ب: شدة الارتباط بـ A1R) بالأرقام",
              bacPrompt:
                "حلّل شكلي الوثيقة 1: نسبة النشاط العصبي الدماغي وشدة ارتباط Ado بـ A1R بدلالة تراكيز Ado و Mtb.",
              bacPromptSource: "reconstructed",
              bacPromptNotes:
                "Page 4 donne le tableau et la courbe mais la seule consigne écrite est « اقترح فرضيتين ». L'analyse chiffrée est une étape pédagogique, pas une question officielle autonome.",
              minLength: 60,
              modelAnswer:
                "نلاحظ انخفاض النشاط العصبي بارتفاع Ado عند المجموعة 1 أكثر من المجموعة 2، وانخفاض شدة الارتباط بارتفاع Mtb.",
              rule: {
                prompt: "حلل الوثيقة 1 بالأرقام",
                keywords: ["نشاط", "ارتباط", "تركيز"],
                minHits: 2,
                forbidden: ["بسبب"],
                document: {
                  kind: "curve",
                  axes: ["نشاط", "ارتباط"],
                  comparisons: [["Ado", "Mtb"]],
                  trends: [
                    {
                      about: "نشاط",
                      expect: ["انخفاض", "Ado"]
                    },
                    {
                      about: "ارتباط",
                      expect: ["انخفاض", "Mtb"]
                    }
                  ],
                  values: ["نشاط", "ارتباط"],
                  strictValues: true
                }
              }
            },
            E: {
              points: 4,
              prompt:
                "الاستدلال: تتبّع سلسلة A1R → Gi/Go → قنوات K⁺/Ca²⁺ → إفراز النورإبينفرين (NE) مع المصادقة",
              bacPrompt: "تأكد من صحة إحدى الفرضيتين المقترحتين باستغلالك لشكلي الوثيقة2 ومعلوماتك.",
              bacPromptSource: "official",
              bacPromptPage: 5,
              bacPromptVerifiedAt: "2026-08-23",
              bacPromptNotes: "Relecture visuelle page 5. Verbe officiel : تأكد. Question 1 du الجزء الثاني.",
              minLength: 80,
              modelAnswer:
                "تتأكد الفرضية الأولى لأن Mtb ينافس Ado على A1R فلا تُفعَّل Gi/Go ويستمر تدفق Ca²⁺ فيتحرر NE وترتفع اليقظة.",
              rule: {
                prompt: "تأكد من صحة الفرضية باستغلال الوثيقة 2",
                keywords: ["مستقبل", "نوريبنفرين", "كافيين"],
                minHits: 2,
                forbidden: []
              }
            },
            W: {
              points: 1.5,
              prompt:
                "المصادقة والمخطط المقارن: الحالة الطبيعية (نقص اليقظة) مقابل وجود الكافيين (زيادة اليقظة)",
              bacPrompt:
                "وضّح في مخطط كيف يؤدي تراكم الـ Ado إلى الشعور بالنعاس وتأثير استهلاك مادة Methylthéobromine (Mtb) على ذلك، بناءً على ما توصلت إليه من نتائج هذه الدراسة ومعلوماتك.",
              bacPromptSource: "official",
              bacPromptPage: 5,
              bacPromptVerifiedAt: "2026-08-23",
              bacPromptNotes:
                "Relecture visuelle page 5. Verbe officiel : وضّح في مخطط. Consigne du الجزء الثالث. Consigne « قدّم نصيحتين » non mappée (un pôle = une consigne).",
              minLength: 0,
              modelAnswer:
                "Ado → A1R → Gi/Go → انخفاض Ca²⁺ → انخفاض NE → نعاس. في وجود Mtb ينعكس المسار فترتفع اليقظة.",
              rule: {
                prompt: "وضح في مخطط مسار Ado و Mtb",
                keywords: ["مخطط", "نعاس", "يقظه"],
                minHits: 1,
                forbidden: [],
                schema: {
                  arrows: true,
                  title: "Ado",
                  ordered: ["Ado", "A1R", "نعاس"]
                }
              }
            }
          },
          blocksBank: [
            {
              id: "b1",
              text: "تشكل معقد (أدينوزين-A1R) على الغشاء",
              stream: 1,
              slot: 0
            },
            {
              id: "b2",
              text: "تفعيل البروتينات الغشائية Gi و Go",
              stream: 1,
              slot: 1
            },
            {
              id: "b3",
              text: "زيادة خروج K⁺ وتثبيط دخول شوارد Ca²⁺",
              stream: 1,
              slot: 2
            },
            {
              id: "b4",
              text: "انخفاض إفراز المبلغ العصبي (NE)",
              stream: 1,
              slot: 3
            },
            {
              id: "b5",
              text: "تنافس الكافيين على مستقبل A1R مع الأدينوزين",
              stream: 2,
              slot: 0
            },
            {
              id: "b6",
              text: "عدم تفعيل البروتينات الغشائية Gi و Go",
              stream: 2,
              slot: 1
            },
            {
              id: "b7",
              text: "زوال تثبيط Ca²⁺ واستمرار تدفقها",
              stream: 2,
              slot: 2
            },
            {
              id: "b8",
              text: "تحرير المبلغ العصبي (NE) في الشق المشبكي",
              stream: 2,
              slot: 3
            }
          ],
          streams: [
            {
              id: 1,
              title: "المسار 1: الحالة الطبيعية (نقص اليقظة)",
              theme: "rose",
              slots: [
                "الاستقبال الغشائي لأدينوزين",
                "البروتينات Gi/Go",
                "قنوات K⁺/Ca²⁺",
                "إفراز النورإبينفرين"
              ]
            },
            {
              id: 2,
              title: "المسار 2: في وجود الكافيين (زيادة اليقظة)",
              theme: "emerald",
              slots: [
                "التنافس / الحجب على A1R",
                "عدم تفعيل Gi/Go",
                "استمرار تدفق Ca²⁺",
                "تحرير النورإبينفرين"
              ]
            }
          ]
        }
      ]
    },
    {
      id: 2,
      pdf: null,
      pdfFilename: null,
      pdfExternalUrl: "https://www.dzexams.com/ar/annales/S3VKb3UrRU9MUnJHVG5ndENaV1FIdz09",
      pdfLocalUrl: "/subjects/SE/2025/sujet-2.pdf",
      pdfNote: "Source externe DzExams 2025 ; le dépôt ne redistribue pas le PDF tiers.",
      title: "الموضوع الثاني",
      exercises: [
        {
          number: 1,
          ui: "text",
          label: "التحلل السكري وطاقة الجلوكوز",
          max: 5,
          desc: "تحويل الطاقة الكيميائية الكامنة في جزيئة الجلوكوز إلى ATP خلال التحلل السكري + أثر 2-DG",
          poles: {
            N: {
              points: 1,
              prompt:
                "تأطير الإشكالية: كيف تُحَّول طاقة الجلوكوز خلال التحلل السكري وما أثر الدواء المُثبِّط للخطوة 1",
              bacPrompt: "كيف تُحوَّل طاقة الجلوكوز خلال التحلل السكري وما أثر 2-Désoxyglucose على الخطوة 1؟",
              bacPromptSource: "reconstructed",
              bacPromptNotes:
                "Préambule page 6 (Sujet 2). Pas de question officielle autonome de type « حدد المشكل ».",
              placeholder: "...",
              minLength: 40,
              modelAnswer:
                "المشكل العلمي: كيف تُحوَّل طاقة الجلوكوز إلى ATP خلال التحلل السكري، وما أثر تثبيط الخطوة 1 بـ 2-DG؟",
              rule: {
                prompt: "حدد المشكل العلمي حول التحلل السكري",
                keywords: ["التحلل", "السكري", "الجلوكوز", "الطاقه"],
                minHits: 2,
                forbidden: []
              }
            },
            S: {
              points: 1,
              prompt: "التعرف على المركبات (أ، ب، ج، د، هـ) في المخطط + كتابة المعادلة الإجمالية",
              bacPrompt: "تعرّف على المركبات المشار إليها بالأحرف: A.B.C.D.D′",
              bacPromptSource: "official",
              bacPromptPage: 6,
              bacPromptVerifiedAt: "2026-08-23",
              bacPromptNotes:
                "Relecture visuelle page 1 du sujet 2 (page 6 du PDF). Verbe officiel : تعرّف. Question 1.",
              placeholder: "جلوكوز، فركتوز ثنائي الفوسفات، حمض البيروفيك...",
              minLength: 40,
              modelAnswer:
                "A و B مانحا/مستقبلا الفوسفات (ATP/ADP)، المركب الوسط فركتوز ثنائي الفوسفات، الناتج حمض البيروفيك، D/D′ NADH/NAD⁺.",
              rule: {
                prompt: "تعرف على المركبات المشار إليها",
                keywords: ["حمض", "البيروفيك", "فركتوز", "جلوكوز"],
                minHits: 2,
                forbidden: []
              }
            },
            E: {
              points: 2,
              prompt: "العرض السببي: تسلسل تفاعلات التحلل السكري وإنتاج ATP + أثر الدواء على الخطوة 1",
              bacPrompt:
                "اشرح في نصٍ علميٍ مدعّم بمعادلة كيميائية إجمالية تفاعلات تحويل الطاقة الكيميائية الكامنة في جزيئة الغلوكوز خلال مرحلة التحلل السكري المشار إليها في الوثيقة وأثر مادة 2-Désoxyglucose على ذلك.",
              bacPromptSource: "official",
              bacPromptPage: 6,
              bacPromptVerifiedAt: "2026-08-23",
              bacPromptNotes:
                "Relecture visuelle page 6. Verbe officiel : اشرح. Question 2 — texte scientifique structuré.",
              placeholder: "الخطوة 1/الخطوة 2، أنزيم، ATP، البيروفيك...",
              minLength: 120,
              modelAnswer:
                "خلال التحلل السكري يُفسفر الغلوكوز ثم يُشق إلى جزيئتي حمض بيروفيك مع إنتاج صافٍ من ATP. يثبط 2-DG الإنزيم المنشط للخطوة 1 فيتوقف التحويل وتتوقف الخلايا السرطانية عن التكاثر.",
              rule: {
                prompt: "اشرح تفاعلات التحلل السكري وأثر 2-DG",
                keywords: ["الخطوه", "انزيم", "فوسفات", "ثنائي", "الطاقه"],
                minHits: 3,
                forbidden: [],
                equation: {
                  tokens: ["ATP", "ADP", "جلوكوز", "بيروفيك"],
                  minTokens: 2
                },
                wrongConcepts: ["SOD", "RUBISCO"]
              }
            },
            W: {
              points: 1,
              prompt: "الخاتمة: دور التحلل السكري في إنتاج الطاقة وتأثير الدواء على تكاثر الخلايا السرطانية",
              bacPrompt:
                "ما النتيجة النهائية لتثبيط الخطوة 1 بـ 2-DG على الحصيلة الطاقوية وتكاثر الخلايا السرطانية؟",
              bacPromptSource: "reconstructed",
              bacPromptNotes:
                "La clôture est incluse dans le texte scientifique officiel (pôle E). Pas une question BAC autonome.",
              placeholder: "...",
              minLength: 40,
              modelAnswer:
                "في الختام يتوقف إنتاج الطاقة القابلة للاستعمال فتتوقف الخلايا السرطانية عن التكاثر.",
              rule: {
                prompt: "اكتب خاتمة حول أثر 2-DG",
                keywords: ["الطاقه", "يتوقف", "الخلايا", "تتكاثر"],
                minHits: 2,
                forbidden: []
              }
            }
          }
        },
        {
          number: 2,
          ui: "text",
          label: "أنزيم SOD والتصلب الجانبي الضموري",
          max: 7,
          desc: "نشاط أنزيم SOD ضد أنواع الأكسجين التفاعلية (ROS) وعلاقته بتلف الخلايا العصبية الحركية في مرض ALS",
          poles: {
            N: {
              points: 1,
              prompt: "تأطير الإشكالية: آلية حماية أنزيم SOD للخلايا العصبية من ROS وعلاقته بمرض ALS",
              bacPrompt: "كيف يحمي أنزيم SOD الخلايا العصبية الحركية من ROS وما علاقته بمرض ALS؟",
              bacPromptSource: "reconstructed",
              bacPromptNotes: "Préambule pages 6-7. Pas de question officielle autonome de cadrage.",
              placeholder: "...",
              minLength: 30,
              modelAnswer:
                "المشكل العلمي: كيف يحمي SOD الخلايا العصبية من ROS، وما سبب الخلل عند المصاب بـ ALS؟",
              rule: {
                prompt: "حدد المشكل العلمي حول SOD و ALS",
                keywords: ["الانزيم", "الاكسجين", "التفاعلي", "الخلايا", "العصبيه"],
                minHits: 2,
                forbidden: []
              }
            },
            S: {
              points: 2.5,
              prompt: "تحليل الشكل (أ): نسبة نشاط SOD وتراكيز ROS ونسبة تلف الخلايا عند السليم والمصاب",
              bacPrompt: "حلّل النتائج الممثّلة في الشكل(أ) من الوثيقة1.",
              bacPromptSource: "official",
              bacPromptPage: 7,
              bacPromptVerifiedAt: "2026-08-23",
              bacPromptNotes:
                "Relecture visuelle page 7 (2e page du sujet 2). Verbe officiel : حلّل. Question 1.",
              placeholder: "قارن بالتوازي: نشاط SOD، تراكيز ROS، تلف الخلايا...",
              minLength: 90,
              modelAnswer:
                "نلاحظ عند السليم نشاط SOD مرتفعا وROS وتلفا منخفضين، بينما عند المصاب ينخفض النشاط وترتفع ROS ونسبة التلف. ومنه نستنتج ارتباط التلف بانخفاض نشاط SOD.",
              rule: {
                prompt: "حلل الشكل أ من الوثيقة 1",
                keywords: ["نشاط", "تراكيز", "تلف", "الخلايا", "سليم"],
                minHits: 3,
                forbidden: ["بسبب"],
                document: {
                  kind: "curve",
                  axes: ["نشاط", "تلف"],
                  comparisons: [["سليم", "مصاب"]],
                  trends: [
                    {
                      about: "سليم",
                      expect: ["مرتفع", "نشاط"]
                    },
                    {
                      about: "مصاب",
                      expect: ["ينخفض", "تلف", "ترتفع"]
                    }
                  ],
                  domains: [
                    {
                      about: "سليم",
                      expect: ["مرتفع", "نشاط"]
                    },
                    {
                      about: "مصاب",
                      expect: ["ينخفض", "تلف"]
                    }
                  ],
                  relations: [
                    {
                      type: "inverse",
                      a: "نشاط",
                      b: "تلف"
                    }
                  ],
                  values: ["نشاط", "تلف"],
                  strictValues: true
                }
              }
            },
            E: {
              points: 2.5,
              prompt:
                "الربط السببي: دور الموقع الفعّال وشوارد النحاس/الزّنك وسبب الخلل في وظيفة الأنزيم عند المصاب",
              bacPrompt:
                "بيّن سبب الخلل في وظيفة الأنزيم SOD عند الشخص المصاب باستغلالك للشكل(ب) والمعلومة المستخلصة من الشكل(أ) من الوثيقة1.",
              bacPromptSource: "official",
              bacPromptPage: 7,
              bacPromptVerifiedAt: "2026-08-23",
              bacPromptNotes: "Relecture visuelle page 7. Verbe officiel : بيّن. Question 2.",
              placeholder: "الموقع الفعّال، النحاس، الزنك، طفرة/خلل...",
              minLength: 110,
              modelAnswer:
                "يعود الخلل إلى تغير بقايا الموقع الفعال فلا تُثبَّت شوارد النحاس/الزنك فيفقد الإنزيم قدرته على تحويل O₂⁻.",
              rule: {
                prompt: "بين سبب الخلل في وظيفة SOD",
                keywords: ["الموقع", "الفعال", "النحاس", "الزنك", "خلل"],
                minHits: 3,
                forbidden: [],
                wrongConcepts: ["RUBISCO", "روبيسكو", "هيموغلوبين"],
                causalOrder: ["الموقع", "النحاس"]
              }
            },
            W: {
              points: 1,
              prompt: "التبرير: استعمال (SOD) كدواء لعلاج ALS واقتراح علاج آخر",
              bacPrompt:
                "برّر استعمال EDA كدواء لعلاج التصلّب الجانبي الضموري ALS باستغلالك لأشكال الوثيقة2 ومعلوماتك.",
              bacPromptSource: "official",
              bacPromptPage: 8,
              bacPromptVerifiedAt: "2026-08-23",
              bacPromptNotes:
                "Relecture visuelle page 8. Verbe officiel : برّر. Question 1 après الوثيقة 2. Consigne « اقترح علاجا آخر » non mappée (un pôle = une consigne).",
              placeholder: "...",
              minLength: 40,
              modelAnswer: "EDA يلتقط O₂⁻ ويعوّض نقص SOD فتنخفض السمية ويتراجع تلف الخلايا العصبية الحركية.",
              rule: {
                prompt: "برر استعمال EDA كدواء لـ ALS",
                keywords: ["علاج", "اكسده", "سميه", "اقترح", "دواء", "استعمال", "EDA"],
                minHits: 2,
                forbidden: []
              }
            }
          }
        },
        {
          number: 3,
          ui: "text",
          label: "زمر الدم والتسامح المناعي",
          max: 8,
          desc: "منظومة الزمر ABO، نقل الدم وقبول/رفض المتبرّع، والتسامح المناعي (نقل بين الزمرتين A و O)",
          poles: {
            N: {
              points: 1,
              prompt:
                "تأطير الإشكالية: آلية تحقيق التسامح المناعي عند نقل الدم من مانح زمرته A إلى مستقل زمرته O",
              bacPrompt:
                "اقترح فرضية حول الآلية المستخدمة لتحقيق التسامح المناعي عند نقل الدم من مانح زمرته A إلى مستقبل زمرته O باستغلالك لشكلي الوثيقة1 ومعلوماتك.",
              bacPromptSource: "official",
              bacPromptPage: 9,
              bacPromptVerifiedAt: "2026-08-23",
              bacPromptNotes:
                "Relecture visuelle page 9. Verbe officiel : اقترح فرضية. Consigne unique du الجزء الأول.",
              placeholder: "...",
              minLength: 30,
              modelAnswer:
                "نفترض أن تحويلا إنزيميا للمستضد A إلى مستضد H يلغي التعرف بالـ anti-A فيصبح النقل آمنا.",
              rule: {
                prompt: "اقترح فرضية حول التسامح المناعي",
                keywords: ["الزمر", "المستضد", "الاجسام", "المضاده"],
                minHits: 2,
                forbidden: []
              }
            },
            S: {
              points: 2.5,
              prompt:
                "استغلال الشكل (أ): شدة انحلال خلايا الدم الحمراء (هيموغلوبين/بيليروبين) وزمرة وكمية الدم",
              bacPrompt:
                "استغل شكلي الوثيقة 1: شدة انحلال خلايا الدم الحمراء وكميات الهيموغلوبين والبيليروبين حسب الزمرة المنقولة.",
              bacPromptSource: "reconstructed",
              bacPromptNotes:
                "Page 9 présente le tableau et la courbe ; la seule consigne écrite est « اقترح فرضية ». L'exploitation chiffrée est pédagogique.",
              placeholder: "حلّل العمليتين وقارن بالتوازي...",
              minLength: 90,
              modelAnswer:
                "نلاحظ ارتفاع الهيموغلوبين والبيليروبين عند نقل الزمرة A إلى O مقارنة بالعكس، مما يدل على انحلال أقوى.",
              rule: {
                prompt: "حلل الشكل أ حول انحلال الدم",
                keywords: ["انحلال", "هيموغلوبين", "بيليروبين", "زمري"],
                minHits: 3,
                forbidden: ["بسبب"],
                document: {
                  kind: "table",
                  axes: ["انحلال", "زمره"],
                  comparisons: [["هيموغلوبين", "بيليروبين"]],
                  cells: [
                    ["A", "انحلال"],
                    ["O", "هيموغلوبين"]
                  ],
                  values: ["هيموغلوبين", "بيليروبين"],
                  strictValues: true
                }
              }
            },
            E: {
              points: 2.5,
              prompt:
                "الفرضية والربط: دور الجسم المضاد anti-A/anti-B ونشاط الأنزيم المُعدَّل وراثياً (تحويل المستضد)",
              bacPrompt: "ناقش صحة الفرضية المقترحة باستغلالك لشكلي الوثيقة2.",
              bacPromptSource: "official",
              bacPromptPage: 10,
              bacPromptVerifiedAt: "2026-08-23",
              bacPromptNotes:
                "Relecture visuelle page 10. Verbe officiel : ناقش. Question 1 du الجزء الثاني.",
              placeholder: "فرضية حول آلية التحمل المناعي + دور الأنزيم...",
              minLength: 110,
              modelAnswer:
                "تتأكد الفرضية لأن الإنزيم NAGA يزيل السكر الطرفي للمستضد A فيختفي التعرف بـ anti-A ولا يحدث انحلال.",
              rule: {
                prompt: "ناقش صحة الفرضية باستغلال الوثيقة 2",
                keywords: ["فرضيه", "انزيم", "مستضد", "الاجسام", "التحول"],
                minHits: 3,
                forbidden: []
              }
            },
            W: {
              points: 2,
              prompt: "الاستخلاص: كيف يُحقَّق التسامح المناعي لنقل آمن بين الزمرتين",
              bacPrompt:
                "وضّح في فقرة علمية الخطوات التي اتّبعها الباحثون في تحقيق التسامح المناعي عند نقل الدم من شخص زمرته A إلى آخر زمرته O من خلال ما توصلت إليه من هذه الدراسة ومعارفك.",
              bacPromptSource: "official",
              bacPromptPage: 10,
              bacPromptVerifiedAt: "2026-08-23",
              bacPromptNotes:
                "Relecture visuelle page 10. Verbe officiel : وضّح في فقرة علمية. Consigne du الجزء الثالث.",
              placeholder: "التسامح المناعي: إمكانية نقل الدم بين الزمرتين...",
              minLength: 40,
              modelAnswer:
                "في الختام يتحقق التسامح بتحويل المستضد A إنزيميا إلى شكل غير متعرف عليه من anti-A فيصبح النقل آمنا.",
              rule: {
                prompt: "وضح فقرة علمية حول التسامح المناعي",
                keywords: ["التسامح", "المناعي", "مانح", "مستقبل"],
                minHits: 2,
                forbidden: []
              }
            }
          }
        }
      ]
    }
  ],
  stream: "se",
  calendarYear: "2025"
};

export { YEAR_2025_SE };
export default YEAR_2025_SE;
