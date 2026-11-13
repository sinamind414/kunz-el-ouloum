/* ============================================================
   BAC SVT Algérie 2025 — شعبة رياضيات — entraînement 4D
   ------------------------------------------------------------
   Énoncé : PDF officiel eddirasa
     https://eddirasa.com/wp-content/uploads/2025/06/bac-math-science-2025.pdf
     (OCR bruité, 6 pages, 2 sujets × 2 exercices 8+12, 2026-08-31).
   Corrigé : PDF officiel eddirasa
     https://eddirasa.com/wp-content/uploads/2025/06/correction-bac-math-science-2025.pdf
     (7 pages).
   id = 2025-m.
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

const PDF = "https://eddirasa.com/wp-content/uploads/2025/06/bac-math-science-2025.pdf";
const PDF_NOTE =
  "PDF officiel non redistribué dans le dépôt. Source énoncé: https://eddirasa.com/wp-content/uploads/2025/06/bac-math-science-2025.pdf (consulté 2026-08-31). Corrigé: https://eddirasa.com/wp-content/uploads/2025/06/correction-bac-math-science-2025.pdf.";

export const YEAR_2025_M = {
  id: "2025-m",
  stream: "m",
  calendarYear: "2025",
  label: "بكالوريا الجزائر دورة 2025 — شعبة رياضيات",
  theme: "indigo",
  enabled: true,
  sujets: [
    {
      id: 1,
      pdf: null,
      pdfExternalUrl: PDF,
      pdfLocalUrl: "/subjects/M/2025/sujet-1.pdf",
      pdfNote: PDF_NOTE,
      title: "الموضوع الأول",
      exercises: [
        {
          number: 1,
          ui: "text",
          label: "المضادان الحيويان Q/D والريبوزوم",
          max: 8,
          desc: "تثبيط الاستطالة بـ Quinupristin/Dalfopristin بين الموقعين P و A للوحدة الكبرى",
          poles: {
            N: {
              points: 1,
              prompt: "تأطير الإشكالية: دور الريبوزوم وأثر المضادين Q/D على نمو البكتيريا",
              bacPrompt:
                "ما دور الريبوزوم في تركيب البروتين وكيف يؤثر المضادان الحيويان Q/D على نمو البكتيريا؟",
              ...RECON("Préambule page 1. Pas de question officielle autonome de cadrage."),
              placeholder: "صياغة المشكل العلمي...",
              minLength: 30,
              modelAnswer:
                "المشكل العلمي: كيف يركب الريبوزوم البروتين خلال الترجمة، وكيف يثبط المضادان Q/D الاستطالة فيعيقان نمو البكتيريا؟",
              rule: {
                prompt: "حدد المشكل العلمي حول الريبوزوم و Q/D",
                keywords: ["ريبوزوم", "بكتيريا", "بروتين"],
                minHits: 2,
                forbidden: []
              }
            },
            S: {
              points: 2,
              prompt: "تسمية المرحلة والعناصر المرقمة من 1 إلى 6",
              bacPrompt:
                "سمّ بدقة المرحلة الممثلة في الوثيقة في وجود Q/D وتعرّف على العناصر المرقمة من 1 إلى 6.",
              ...OFFICIAL(
                1,
                "Relecture du PDF eddirasa 2025 Maths (page 1) et du corrigé (page 1). Verbe officiel : سمّ / تعرّف. Question 1 du التمرين الأول."
              ),
              placeholder: "المرحلة: الاستطالة. 1 رابطة، 2 حمض أميني...",
              minLength: 40,
              modelAnswer:
                "المرحلة الممثلة: الاستطالة (في وجود Q/D). 1 رابطة ببتيدية. 2 حمض أميني (سلسلة ببتيدية). 3 تحت الوحدة الكبرى للريبوزوم. 4 تحت الوحدة الصغرى. 5 ARNm. 6 معقد (حمض أميني–ARNt).",
              rule: {
                prompt: "سم المرحلة والعناصر المرقمة",
                keywords: ["استطاله", "ريبوزوم", "ببتيديه"],
                minHits: 2,
                forbidden: []
              }
            },
            E: {
              points: 4,
              prompt: "النص العلمي: دور الريبوزوم وتأثير المضادين Q/D على نمو البكتيريا",
              bacPrompt:
                "اشرح في نص علمي دور الريبوزوم في تركيب البروتين مبرزا تأثير المضادين الحيويين Q/D على نمو البكتيريا (النص العلمي مهيكل بمقدمة وعرض وخاتمة).",
              ...OFFICIAL(
                1,
                "Relecture du PDF eddirasa 2025 Maths (page 1) et du corrigé (page 1). Verbe officiel : اشرح في نص علمي. Question 4 du التمرين الأول. Consignes الصيغة المفصلة و الصيغة في وسط حامضي non mappées."
              ),
              placeholder: "مقدمة، عرض: مواقع A و P، تأثير Q/D، خاتمة...",
              minLength: 120,
              modelAnswer:
                "تحمل تحت الوحدة الصغرى موقع تثبيت رامزة الانطلاق على ARNm. تحمل تحت الوحدة الكبرى موقعين تحفيزيين A و P يتوضع على كل منهما معقد حمض أميني–ARNt. تُقرأ الرامزات الموجودة على ARNm وتتشكل الرابطة الببتيدية بين الحمضين ثم تستطيل السلسلة. عند رامزة التوقف تنفصل تحت الوحدتين. يتوضع المضادان Q/D بين الموقعين P و A للوحدة الكبرى ويمنعان تشكل الرابطة الببتيدية فتوقف مرحلة الاستطالة. بتعطيل تركيب البكتيريا للبروتين تُعاق نشاطاتها. تساهم الريبوزومات بشكل أساسي في مرحلة الترجمة ويمكن تثبيطها لعلاج الإصابات البكتيرية.",
              rule: {
                prompt: "اشرح دور الريبوزوم وأثر Q/D",
                keywords: ["ريبوزوم", "استطاله", "ببتيديه", "بكتيريا"],
                minHits: 3,
                forbidden: []
              }
            },
            W: {
              points: 1,
              prompt: "الخاتمة: تثبيط الريبوزوم لعلاج الإصابات البكتيرية",
              bacPrompt: "لماذا يمكن تثبيط الريبوزوم عند علاج الإصابات البكتيرية؟",
              ...RECON("Clôture issue du corrigé. Pas une question BAC autonome."),
              placeholder: "في الختام...",
              minLength: 40,
              modelAnswer:
                "في الختام، تساهم الريبوزومات في الترجمة لتركيب البروتين ويمكن تثبيطها بالمضادين Q/D لعلاج حالات الإصابات البكتيرية.",
              rule: {
                prompt: "اكتب خاتمة حول تثبيط الريبوزوم",
                keywords: ["ريبوزوم", "بكتيريا", "علاج"],
                minHits: 2,
                forbidden: []
              }
            }
          }
        },
        {
          number: 2,
          ui: "text",
          label: "العوز المناعي والناقل الغشائي TAP",
          max: 12,
          desc: "خلل TAP بطفرة حذف يمنع نقل الببتيد المستضدي إلى ش.ه.ف فلا يُعرض المعقد HLA I",
          poles: {
            N: {
              points: 1,
              prompt: "اقتراح فرضيتين حول سبب هذا العوز المناعي",
              bacPrompt: "اقترح فرضيتين حول سبب العوز المناعي في عرض المعقدات على CPA.",
              ...OFFICIAL(
                2,
                "Relecture du corrigé officiel eddirasa 2025 Maths (page 2). Verbe officiel : الفرضيتان. Question du الجزء الأول."
              ),
              placeholder:
                "الفرضية 1: خلل في تركيب جزيئات HLA في ش.ه.ف... الفرضية 2: خلل في نشاط الناقل TAP...",
              minLength: 30,
              modelAnswer:
                "الفرضية 1: سبب هذا العجز المناعي هو خلل في تركيب جزيئات HLA I في الشبكة الهيولية الفعالة. الفرضية 2: سبب هذا العجز المناعي هو خلل في نشاط الناقل الغشائي TAP.",
              rule: {
                prompt: "اقترح فرضيتين حول العوز المناعي و TAP",
                keywords: ["فرضيه", "TAP", "HLA"],
                minHits: 2,
                forbidden: [],
                hypotheses: { min: 2, distinct: true }
              }
            },
            S: {
              points: 3,
              prompt: "استغلال الوثيقة 1: عرض المعقدات على CPA عند السليم والمصاب",
              bacPrompt:
                "استغل أشكال الوثيقة 1: عرض المعقدات (ببتيد مستضدي–HLA I) على CPA عند الشخص السليم والمصاب.",
              ...RECON("Le corrigé analyse d'abord les figures (10%→70% vs 3%) avant les hypothèses."),
              placeholder: "عند السليم تزايد المعقدات المعروضة من 10 إلى 70%... عند المصاب من 3%...",
              minLength: 90,
              modelAnswer:
                "يتم تركيب سلسلتين ببتيديتين داخل تجويف ش.ه.ف ويُنقل الببتيد عبر الناقل الغشائي TAP لتشكيل المعقد Ag-HLA I داخل حويصلات ويُعرض على الغشاء الهيولي فتعرف عليه الخلايا LTS. عند الشخص السليم بزيادة تركيز Ag من 0.1 إلى 2 تزداد المعقدات المعروضة على CPA من 10 إلى 70 بالمئة بينما عند المصاب تبقى المعقدات حوالي 3 بالمئة. ومنه تفقد خلايا CPA عند المصاب كفاءتها في عرض المعقدات HLA I على غشائها.",
              rule: {
                prompt: "استغل عرض المعقدات على CPA",
                keywords: ["CPA", "HLA", "سليم", "مصاب"],
                minHits: 3,
                forbidden: ["بسبب"],
                document: {
                  kind: "curve",
                  axes: ["معقدات", "تركيز"],
                  comparisons: [["سليم", "مصاب"]],
                  trends: [
                    { about: "سليم", expect: ["تزايد", "70"] },
                    { about: "مصاب", expect: ["3", "منخفض"] }
                  ],
                  relations: [{ type: "parallel", a: "سليم", b: "مصاب" }],
                  values: ["70"],
                  strictValues: true
                }
              }
            },
            E: {
              points: 6,
              prompt: "التأكد من صحة إحدى الفرضيتين باستغلال أشكال الوثيقة 2",
              bacPrompt: "تأكد من صحة إحدى الفرضيتين باستغلالك لأشكال الوثيقة 2 ومعلوماتك.",
              ...OFFICIAL(
                3,
                "Relecture du PDF eddirasa 2025 Maths (page 3) et du corrigé (page 3). Verbe officiel : تأكد. Question du الجزء الثاني."
              ),
              placeholder:
                "الإشعاع داخل ش.ه.ف 100% عند السليم و 12% عند المصاب... نشاط TAP 100% مقابل أقل من 10%... حذف نيكليوتيدات...",
              minLength: 110,
              modelAnswer:
                "عند السليم تزايد تدريجي في نسبة الإشعاع داخل ش.ه.ف لتصل إلى 100 بالمئة بينما عند المصاب ورغم ارتفاع التركيز تبقى النسبة حوالي 12 بالمئة: الإصابة تعود إلى خلل في نقل الببتيد المستضدي. نشاط الناقل TAP أعظمي 100 بالمئة عند العادي وأقل من 10 بالمئة عند المصاب. سمحت البنية الفراغية لـ TAP عند السليم بنفاذية عالية للببتيد بينما البنية المتغيرة عند المصاب لم تسمح إلا بمرور كمية ضئيلة. يظهر عند السليم تتابع من ثمانية نيكليوتيدات بينما عند المصاب حذف. الطفرة في المورثة المشرفة على تركيب TAP غيرت بنيته فأوقف نشاطه فلا تُنقل الببتيدات المستضدية إلى ش.ه.ف ولا تتشكل المعقدات ولا تُعرض على الغشاء. تتأكد الفرضية 2.",
              rule: {
                prompt: "تأكد من الفرضية باستغلال الوثيقة 2",
                keywords: ["فرضيه", "TAP", "طفره", "ببتيد"],
                minHits: 3,
                forbidden: [],
                causalOrder: ["TAP", "عرض"]
              }
            },
            W: {
              points: 2,
              prompt: "مخطط مراحل عرض الببتيد المستضدي عند السليم والمصاب",
              bacPrompt:
                "وضّح في مخطط مراحل عرض الخلايا العارضة (CPA) للببتيد المستضدي عند الشخص السليم وعند الشخص المصاب بهذا النوع من العوز المناعي انطلاقا مما توصلت إليه ومعارفك المكتسبة.",
              ...OFFICIAL(
                3,
                "Relecture du PDF eddirasa 2025 Maths (page 3) et du corrigé (page 4). Verbe officiel : وضّح في مخطط. Question du الجزء الثالث."
              ),
              placeholder: "سليم: ببتيد → TAP → ش.ه.ف → HLA I-Ag → غشاء... مصاب: TAP معطل → عدم العرض...",
              minLength: 0,
              modelAnswer:
                "عنوان المخطط: المسار المناعي. شخص سليم: ببتيد مستضدي → نقل عبر TAP إلى ش.ه.ف → تشكل المعقد HLA I-Ag → عرض على غشاء CPA. شخص مصاب: طفرة TAP → توقف النشاط → عدم نقل الببتيد → عدم تشكل المعقد → عدم العرض.",
              rule: {
                prompt: "وضح في مخطط عرض الببتيد عند السليم والمصاب",
                keywords: ["مخطط", "TAP", "HLA"],
                minHits: 1,
                forbidden: [],
                schema: { arrows: true, title: "TAP", ordered: ["ببتيد", "TAP", "عرض"] }
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
      pdfLocalUrl: "/subjects/M/2025/sujet-2.pdf",
      pdfNote: PDF_NOTE,
      title: "الموضوع الثاني",
      exercises: [
        {
          number: 1,
          ui: "text",
          label: "طفرة HLA-DRB1 والبلعمة في الرد الخلطي",
          max: 8,
          desc: "طفرة Arg74Trp تمنع تثبيت الببتيد المستضدي على HLA II فتتوقف الاستجابة الخلطية",
          poles: {
            N: {
              points: 1,
              prompt: "تأطير الإشكالية: أهمية الخلية البالعة وأثر الطفرة Arg74Trp",
              bacPrompt: "ما هي أهمية الخلايا البالعة في الاستجابة المناعية الخلطية وما هو أثر الطفرة؟",
              ...RECON("Problème posé par le corrigé (المقدمة). Pas de consigne autonome حدد المشكل."),
              placeholder: "صياغة المشكل العلمي...",
              minLength: 30,
              modelAnswer:
                "المشكل العلمي: كيف تؤمن الخلية البالعة التعرف وإقصاء المستضد في الرد الخلطي، وما أثر طفرة Arg74Trp في HLA-DRB1؟",
              rule: {
                prompt: "حدد المشكل العلمي حول البلعمة و HLA-DRB1",
                keywords: ["بالعه", "خلطي", "HLA"],
                minHits: 2,
                forbidden: []
              }
            },
            S: {
              points: 2,
              prompt: "التعرف على البيانات ودور الخلية البالعة في التخلص من المعقد المناعي",
              bacPrompt:
                "تعرّف على البيانات. اذكر دور الخلية البالعة في التعرف على الببتيد المستضدي والتخلص من المعقد المناعي.",
              ...OFFICIAL(
                4,
                "Relecture du corrigé officiel eddirasa 2025 Maths (page 5). Verbes officiels : تعرّف / دور. Questions 1 et 2 du التمرين الأول (Sujet 2)."
              ),
              placeholder: "4 مستقبل، 5 TCR، 6 مستقبل، 7 جسم مضاد، 8 معقد مناعي...",
              minLength: 40,
              modelAnswer:
                "تتعرف الخلية البالعة على الببتيد المستضدي المحمول على HLA II. 5 TCR. 6 مستقبل. 7 جسم مضاد. 8 معقد مناعي. تبتلع المستضد وتهضمه بواسطة الإنزيمات الهاضمة منتجة الببتيد المستضدي ثم تثبته على المعقد على غشائها وتقدمه لـ LT4 بالتماس لتنشيطها. تثبت المعقد المناعي على المستقبلات الغشائية المتكاملة مع منطقة التثبيت في الجسم المضاد للتخلص منه.",
              rule: {
                prompt: "تعرف على البيانات ودور البالعة",
                keywords: ["بالعه", "معقد", "مضاد", "HLA"],
                minHits: 3,
                forbidden: []
              }
            },
            E: {
              points: 4,
              prompt: "النص العلمي: أهمية الخلية البالعة وأثر طفرة HLA-DRB1",
              bacPrompt:
                "بيّن في نص علمي أهمية الخلايا البالعة في الاستجابة المناعية الخلطية وأثر الطفرة Arg74Trp في HLA-DRB1.",
              ...OFFICIAL(
                4,
                "Relecture du corrigé officiel eddirasa 2025 Maths (page 5). Verbe officiel : النص العلمي. Question 3 du التمرين الأول (Sujet 2)."
              ),
              placeholder: "مقدمة، عرض: بلعمة وعرض وتنشيط، أثر الطفرة، خاتمة...",
              minLength: 120,
              modelAnswer:
                "تتمثل أهمية الخلية البالعة في تأمينها للتعرف وإقصاء المستضد: تبتلع المستضد وتهضمه منتجة الببتيد المستضدي وتثبته على المعقد HLA II على غشائها وتقدمه لـ LT4 بالتماس لتنشيطها ثم تثبت المعقد المناعي للتخلص منه. الطفرة تغير بنية HLA II فلا يثبت الببتيد المستضدي عليها ولا يتم عرضه فتتوقف الاستجابة المناعية. للخلية البالعة الكبيرة دور أساسي في الاستجابة الخلطية والتخلص من المستضدات وقد يختل ذلك بتعرضها لطفرة على HLA-DRB1.",
              rule: {
                prompt: "بين أهمية البالعة وأثر طفرة HLA-DRB1",
                keywords: ["بالعه", "HLA", "طفره", "مستضد"],
                minHits: 3,
                forbidden: []
              }
            },
            W: {
              points: 1,
              prompt: "الخاتمة: اختلال الرد الخلطي بطفرة HLA II",
              bacPrompt: "ما أثر طفرة HLA-DRB1 على عرض الببتيد المستضدي؟",
              ...RECON("Clôture issue du corrigé. Pas une question BAC autonome."),
              placeholder: "في الختام...",
              minLength: 40,
              modelAnswer:
                "في الختام، تمنع طفرة Arg74Trp تثبيت الببتيد المستضدي على HLA II فلا يُعرض فتتوقف الاستجابة الخلطية.",
              rule: {
                prompt: "اكتب خاتمة حول أثر طفرة HLA-DRB1",
                keywords: ["طفره", "HLA", "عرض"],
                minHits: 2,
                forbidden: []
              }
            }
          }
        },
        {
          number: 2,
          ui: "text",
          label: "أشعة UV-C وبروتين Spike لفيروس SARS-CoV-2",
          max: 12,
          desc: "تثبيط تضاعف الفيروس بتكسير روابط Spike (Cys-Cys و Arg) فلا يرتبط بـ ACE2",
          poles: {
            N: {
              points: 1,
              prompt: "اقتراح فرضيتين حول تأثير أشعة UV-C على SARS-CoV-2",
              bacPrompt: "اقترح فرضيتين حول تأثير أشعة UV-C على تضاعف فيروس SARS-CoV-2.",
              ...OFFICIAL(
                5,
                "Relecture du corrigé officiel eddirasa 2025 Maths (page 6). Verbe officiel : الفرضيتان. Question du الجزء الأول."
              ),
              placeholder:
                "الفرضية 1: الأشعة ذات الشدة S1 تثبط التضاعف... الفرضية 2: الشدة المرتفعة تمنع الاندماج...",
              minLength: 30,
              modelAnswer:
                "الفرضية 1: الأشعة ذات الشدة (S1) تثبط تضاعف الفيروس. الفرضية 2: الأشعة ذات الشدة المرتفعة (S2) تمنع الاندماج بالمستقبل ACE2.",
              rule: {
                prompt: "اقترح فرضيتين حول تأثير UV-C",
                keywords: ["فرضيه", "UV", "فيروس"],
                minHits: 2,
                forbidden: [],
                hypotheses: { min: 2, distinct: true }
              }
            },
            S: {
              points: 3,
              prompt: "استغلال الوثيقة 1: عدد النسخ وارتباط الفيروس بـ ACE2 حسب شدة UV-C",
              bacPrompt:
                "استغل أشكال الوثيقة 1: عدد نسخ SARS-CoV-2 وارتباطه بالمستقبل ACE2 حسب شدة أشعة UV-C.",
              ...RECON("Le corrigé analyse d'abord 100.10^5 → 75.10^5 → 1.10^2 حسب 0 / 3.7 / 16.9 mJ/cm²."),
              placeholder:
                "في الحالة العادية 100.10^5 نسخة... بشدة 3.7 تنخفض إلى 75.10^5... بشدة 16.9 إلى 1.10^2...",
              minLength: 90,
              modelAnswer:
                "في الحالة العادية غير المعرضة يقدر عدد النسخ بـ 100.10^5. بأشعة UV-C شدة 3.7 mJ/cm² ينخفض العدد إلى 75.10^5 وبشدة 16.9 mJ/cm² إلى 1.10^2. ومنه تثبط الشدات تضاعف فيروس SARS-CoV-2. يتم الارتباط بواسطة بروتين Spike على ACE2 الموجود على الخلية المستهدفة فيدخل الفيروس ويتضاعف.",
              rule: {
                prompt: "استغل عدد النسخ حسب شدة UV-C",
                keywords: ["UV", "نسخ", "ACE2", "Spike"],
                minHits: 3,
                forbidden: ["بسبب"],
                document: {
                  kind: "table",
                  axes: ["نسخ", "شدّه"],
                  comparisons: [["0", "16.9"]],
                  cells: [["UV-C", "نسخ"]],
                  values: ["16.9"],
                  strictValues: true
                }
              }
            },
            E: {
              points: 6,
              prompt: "تبيان كفاية UV-C لإلغاء ارتباط SARS-CoV-2 من الوثيقة 2",
              bacPrompt:
                "بيّن كفاية استخدام أشعة UV-C لإلغاء ارتباط SARS-CoV-2 بالمستقبلات باستغلال الوثيقة 2.",
              ...OFFICIAL(
                6,
                "Relecture du PDF eddirasa 2025 Maths (page 6) et du corrigé (pages 6-7). Verbe officiel : بيّن. Question du الجزء الثاني."
              ),
              placeholder: "الوسط 1 روابط قوية... الوسط 2 متحور S1 Arg... الوسط 3 كسر Cys-Cys...",
              minLength: 110,
              modelAnswer:
                "في حالة الفيروسات غير المعرضة يكون الارتباط بـ ACE2 مرتفعا. بأشعة 3.7 mJ/cm² ينخفض الارتباط إلى حوالي 85 بالمئة وبالشدة المرتفعة جدا إلى حوالي 15 بالمئة: تثبط UV-C ارتباط الفيروس بالمستقبلات ACE2. في الوسط 1 (بدون أشعة) بروتين Spike الأصلي بروابط كيميائية قوية في S1 و S2. في الوسط 2 بشدة متوسطة يظهر متحور حامل لـ Spike في S1 (Arg) بقدرة أقل على التضاعف. في الوسط 3 بشدة 16.9 mJ/cm² متحوران: أحدهما انكسرت فيه رابطة Cys-Cys في S1 والآخر فقد روابط S1 مع استمرار S2 وليست لهما القدرة على التضاعف. زيادة شدة الأشعة ترفع درجة تغير البنية الفراغية لبروتين Spike فيفقد الفيروس قدرته على التضاعف.",
              rule: {
                prompt: "بين كفاية UV-C لإلغاء الارتباط",
                keywords: ["UV", "Spike", "ACE2", "Cys"],
                minHits: 3,
                forbidden: [],
                causalOrder: ["UV", "Spike"]
              }
            },
            W: {
              points: 2,
              prompt: "خلاصة: مبرر استعمال UV-C في التعقيم بالمستشفيات",
              bacPrompt:
                "لخّص كيف تؤثر أشعة UV-C ذات الشدة العالية على تثبيت واندماج SARS-CoV-2 ولماذا تُستعمل في التعقيم.",
              ...OFFICIAL(
                6,
                "Relecture du corrigé officiel eddirasa 2025 Maths (page 7). Verbe officiel : الجزء الثالث."
              ),
              placeholder: "يستهدف الفيروس خلايا الأسناخ... Spike يتكامل بجزئه S1 مع ACE2...",
              minLength: 50,
              modelAnswer:
                "يستهدف فيروس SARS-CoV-2 خلايا الأسناخ ويمتلك بروتين Spike يتكامل بجزئه S1 بنيويا مع المستقبل الغشائي ACE2 للخلية المستهدفة ثم يندمج الغشاءان بوجود الجزء S2. تؤثر UV-C ذات الشدة العالية على S1 و S2 فيفقد الفيروس قدرته على التثبيت والاندماج بغشاء الخلية المستهدفة ما يمنعه من التضاعف. الخاصية المميزة للأشعة تبرر استعمالها في التعقيم والحد من انتشار الفيروس في المستشفيات.",
              rule: {
                prompt: "لخص أثر UV-C ومبرر التعقيم",
                keywords: ["UV", "Spike", "تعقيم"],
                minHits: 2,
                forbidden: []
              }
            }
          }
        }
      ]
    }
  ]
};

export default YEAR_2025_M;
