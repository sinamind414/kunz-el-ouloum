/* ============================================================
   BAC SVT Algérie 2026 — شعبة رياضيات — entraînement 4D
   ------------------------------------------------------------
   Énoncé : PDF officiel eddirasa
     https://eddirasa.com/uploads/2026/08/bac-math-sciences-2026.pdf
     (OCR, 6 pages, 2 sujets × 2 exercices 6+14 / 8+12, 2026-08-31).
   Corrigé : PDF officiel eddirasa
     https://eddirasa.com/uploads/2026/08/correction-bac-math-sciences-2026.pdf
     (8 pages, couche inversée reconstituée).
   id = 2026-m pour ne pas collisionner avec l'année SE 2026.
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

const PDF = "https://eddirasa.com/uploads/2026/08/bac-math-sciences-2026.pdf";
const PDF_NOTE =
  "PDF officiel non redistribué dans le dépôt. Source énoncé: https://eddirasa.com/uploads/2026/08/bac-math-sciences-2026.pdf (consulté 2026-08-31). Corrigé: https://eddirasa.com/uploads/2026/08/correction-bac-math-sciences-2026.pdf. Page: https://eddirasa.com/bac-math-sciences-2026/.";

export const YEAR_2026_M = {
  id: "2026-m",
  stream: "m",
  calendarYear: "2026",
  label: "بكالوريا الجزائر دورة 2026 — شعبة رياضيات",
  theme: "indigo",
  enabled: true,
  sujets: [
    {
      id: 1,
      pdf: null,
      pdfExternalUrl: PDF,
      pdfLocalUrl: "/subjects/M/2026/sujet-1.pdf",
      pdfNote: PDF_NOTE,
      title: "الموضوع الأول",
      exercises: [
        {
          number: 1,
          ui: "text",
          label: "الخلية LTc والخلايا السرطانية",
          max: 6,
          desc: "التعرف المزدوج LTc–CMH I والإفلات من الرقابة بنقص عرض المعقد",
          poles: {
            N: {
              points: 1,
              prompt: "تأطير الإشكالية: كيف تقضي LTc على الخلايا السرطانية وكيف تفلت بعضها؟",
              bacPrompt: "كيف تتدخل الخلية LTc في القضاء على الخلايا السرطانية، وما سبب الإفلات من الرقابة؟",
              ...RECON("Préambule page 1. Pas de question officielle autonome de cadrage."),
              placeholder: "صياغة المشكل العلمي...",
              minLength: 30,
              modelAnswer:
                "المشكل العلمي: كيف تتعرف LTc تعرفا مزدوجا على الخلية السرطانية وتقضي عليها، ولماذا تفلت بعض الخلايا السرطانية من الرقابة؟",
              rule: {
                prompt: "حدد المشكل العلمي حول LTc والخلايا السرطانية",
                keywords: ["LTc", "سرطان", "رقابه"],
                minHits: 2,
                forbidden: []
              }
            },
            S: {
              points: 1.5,
              prompt: "التعرف على البيانات المرقمة من 1 إلى 6",
              bacPrompt: "تعرّف على البيانات المرقمة.",
              ...OFFICIAL(
                1,
                "Relecture du PDF eddirasa 2026 Maths (OCR page 1) et du corrigé. Verbe officiel : تعرّف. Question 1 du التمرين الأول."
              ),
              placeholder: "1 مستقبل غشائي TCR...",
              minLength: 40,
              modelAnswer:
                "1 مستقبل غشائي خاص بالخلية التائية السامة TCR. 2 ببتيد مستضدي. 3 معقد CMH I (HLA I). 4 مؤشر CD8. 5 إنزيمات الحالة (غرازيم) + بيرفورين. 6 ثقوب (قنوات) غشائية.",
              rule: {
                prompt: "تعرف على البيانات المرقمة لتفاعل LTc",
                keywords: ["TCR", "CMH", "بيرفورين", "CD8"],
                minHits: 3,
                forbidden: []
              }
            },
            E: {
              points: 2.5,
              prompt: "النص العلمي: تدخل LTc في القضاء على الخلايا السرطانية وسبب الإفلات",
              bacPrompt:
                "وضّح في نص علمي آلية تدخل الخلية LTc في القضاء على الخلايا السرطانية وسبب الإفلات من الرقابة.",
              ...OFFICIAL(
                1,
                "Relecture du PDF eddirasa 2026 Maths (page 1) et du corrigé (page 1). Verbe officiel : وضّح في نص علمي. Question 2 du التمرين الأول."
              ),
              placeholder: "مقدمة، عرض: حالة القضاء وحالة الإفلات، خاتمة...",
              minLength: 120,
              modelAnswer:
                "تتعرف الخلية LTc تعرفا مزدوجا على الخلية السرطانية بواسطة مستقبلات TCR التي تتكامل بنيويا مع المعقد CMH I-P المعروض على غشائها. يثير هذا التعرف إفراز البيرفورين وإنزيمات الحالة (غرازيم). يتثبت البيرفورين على غشاء الخلية السرطانية مشكلا ثقوبا تسمح بدخول الماء والشوار وإنزيمات الحالة فيؤدي ذلك إلى انحلالها (البير). في حالة الإفلات تحجب بعض الخلايا السرطانية المعقد المعروض على غشائها فتمنع تعرف LTc عليها وبالتالي عدم انحلالها وإفلاتها.",
              rule: {
                prompt: "وضح تدخل LTc وسبب الإفلات",
                keywords: ["LTc", "بيرفورين", "CMH", "افلات"],
                minHits: 3,
                forbidden: []
              }
            },
            W: {
              points: 1,
              prompt: "الخاتمة: ارتباط القضاء بعرض المعقد CMH I-P",
              bacPrompt: "ما الشرط الذي يرتبط به قضاء LTc على الخلايا السرطانية؟",
              ...RECON("Clôture issue du corrigé officiel. Pas une question BAC autonome."),
              placeholder: "في الختام...",
              minLength: 40,
              modelAnswer:
                "في الختام، يرتبط القضاء على الخلايا السرطانية بتعرف LTc على المعقد CMH I-P، وأي خلل في هذا النظام يسمح بإفلات الخلايا السرطانية.",
              rule: {
                prompt: "اكتب خاتمة حول قضاء LTc",
                keywords: ["LTc", "CMH", "افلات"],
                minHits: 2,
                forbidden: []
              }
            }
          }
        },
        {
          number: 2,
          ui: "text",
          label: "مرض HCF ومستقبلات LDL الكبدية",
          max: 14,
          desc: "ارتفاع كوليسترول الدم العائلي بنمطي A (PCSK9) و B (طفرة LDLR)",
          poles: {
            N: {
              points: 1,
              prompt: "اقتراح فرضيتين حول سبب مرض HCF",
              bacPrompt: "اقترح فرضيتين حول سبب مرض HCF.",
              ...OFFICIAL(
                2,
                "Relecture du corrigé officiel eddirasa 2026 Maths (page 2). Verbe officiel : اقترح فرضيتين. Question du الجزء الأول."
              ),
              placeholder: "الفرضية 1: خلل في بنية LDLR... الفرضية 2: زيادة PCSK9...",
              minLength: 30,
              modelAnswer:
                "الفرضية 1: يرتبط مرض HCF بوجود خلل في بنية LDLR. الفرضية 2: يرتبط مرض HCF بنقص في عدد جزيئات LDLR نتيجة زيادة كمية أو نشاط بروتين PCSK9.",
              rule: {
                prompt: "اقترح فرضيتين حول سبب HCF",
                keywords: ["فرضيه", "LDLR", "PCSK9"],
                minHits: 2,
                forbidden: [],
                hypotheses: { min: 2, distinct: true }
              }
            },
            S: {
              points: 4,
              prompt: "استغلال شكلي الوثيقة 1: تركيز LDL ودور LDLR و PCSK9",
              bacPrompt:
                "استغل الشكل (أ) والشكل (ب) من الوثيقة 1: تركيز LDL في البلازما ودور البروتينات الغشائية للكبد.",
              ...RECON(
                "Le corrigé analyse les deux figures avant d'aboutir aux hypothèses. L'exploitation chiffrée est pédagogique."
              ),
              placeholder: "السليم 100 مغ/دل... النمط A 280... النمط B 780...",
              minLength: 90,
              modelAnswer:
                "يقدر تركيز LDL في بلازما الدم عند الشخص السليم بـ 100 مغ/دل، ويرتفع إلى 280 مغ/دل عند المصاب بالنمط A وإلى 780 مغ/دل عند المصاب بالنمط B. في الحالة العادية يُخلَّص من فائض LDL على مستوى الخلية الكبدية بطريقتين: عرض جزيئات LDLR وتثبيت المعقد LDLR-LDL ثم ابتلاعه، أو تدخل PCSK9 الذي يربط LDLR فيُبتلع المعقد ولا يُعاد عرض LDLR. ومنه يعاني المصابون بـ HCF من ارتفاع كمية LDL في الدم (خلل في تنظيم LDL).",
              rule: {
                prompt: "استغل الوثيقة 1 حول تركيز LDL",
                keywords: ["LDL", "100", "280", "PCSK9"],
                minHits: 3,
                forbidden: ["بسبب"],
                document: {
                  kind: "table",
                  axes: ["تركيز", "LDL"],
                  comparisons: [["سليم", "مصاب"]],
                  cells: [["A", "B"]],
                  values: ["100"],
                  strictValues: true
                }
              }
            },
            E: {
              points: 6,
              prompt: "مناقشة مدى صحة الفرضيتين باستغلال الوثيقة 2",
              bacPrompt: "ناقش مدى صحة الفرضيتين المقترحتين باستغلالك معطيات الوثيقة 2.",
              ...OFFICIAL(
                3,
                "Relecture du PDF eddirasa 2026 Maths (page 3) et du corrigé (pages 3-4). Verbe officiel : ناقش. Question 1 du الجزء الثاني. Consigne برّر تثبيط PCSK9 non mappée."
              ),
              placeholder: "كمية LDL المشع المثبتة... التتابع النيكليوتيدي... نسبة LDLR...",
              minLength: 110,
              modelAnswer:
                "كمية LDL المشع المثبتة مرتفعة عند السليم (12 ng/mg) ومنخفضة عند النمط A (3 ng/mg) وشبه منعدمة عند النمط B. التتابع النيكليوتيدي متماثل عند السليم والنمط A فيركب LDLR طبيعي، بينما عند النمط B استبدال نيكليوتيد أنتج LDLR غير مكتمل. بارتفاع تركيز PCSK9 تنخفض نسبة جزيئات LDLR إلى 30 بالمئة. يعود النمط B إلى طفرة في مورثة LDLR (الفرضية 1) والنمط A إلى إفراط في كمية PCSK9 فتتناقص جزيئات LDLR المعروضة (الفرضية 2). تتأكد الفرضيتان.",
              rule: {
                prompt: "ناقش صحة الفرضيتين من الوثيقة 2",
                keywords: ["فرضيه", "LDLR", "PCSK9", "طفره"],
                minHits: 3,
                forbidden: [],
                wrongConcepts: ["SLC12A3", "Gitelman"]
              }
            },
            W: {
              points: 3,
              prompt: "خلاصة: أهمية البروتينات الغشائية الكبدية في توازن كوليسترول LDL",
              bacPrompt:
                "أنجز خلاصة تبرز فيها أهمية البروتينات الغشائية الكبدية في تحقيق التوازن في تركيز الكوليسترول LDL في الدم.",
              ...OFFICIAL(
                3,
                "Relecture du PDF eddirasa 2026 Maths (page 3) et du corrigé (page 4). Verbe officiel : أنجز خلاصة. Question du الجزء الثالث."
              ),
              placeholder: "LDLR مستقبل غشائي... PCSK9 يتحكم في العدد...",
              minLength: 50,
              modelAnswer:
                "تتحكم الخلايا الكبدية في توازن تركيز الكوليسترول في الدم بتدخل نوعين من البروتينات: تلعب بروتينات LDLR دور مستقبل غشائي يثبت جزيئات LDL فتُدخل. تتحكم بروتينات PCSK9 في عدد جزيئات LDLR المعروضة على السطح وبالتالي في كمية LDL التي تدخل الخلية. حدوث خلل في بنية هذه البروتينات أو في كميتها يؤدي إلى اختلال نسبة LDL وعدم تحقيق التوازن في تركيز كوليسترول LDL في الدم.",
              rule: {
                prompt: "انجز خلاصة حول البروتينات الغشائية الكبدية",
                keywords: ["LDLR", "PCSK9", "كوليسترول"],
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
      pdfExternalUrl: PDF,
      pdfLocalUrl: "/subjects/M/2026/sujet-2.pdf",
      pdfNote: PDF_NOTE,
      title: "الموضوع الثاني",
      exercises: [
        {
          number: 1,
          ui: "text",
          label: "الأنترلوكين IL-2 والنسخ المعدّلة",
          max: 8,
          desc: "دور IL-2 في الرد المناعي النوعي وتعديل بنيته (NDNA11 و H9-RETR) ضد السرطان أو التثبيط",
          poles: {
            N: {
              points: 1,
              prompt: "ذكر دور الأنترلوكينات في الرد المناعي النوعي",
              bacPrompt: "اذكر دور الأنترلوكينات في الرد المناعي النوعي.",
              ...OFFICIAL(
                4,
                "Relecture du PDF eddirasa 2026 Maths (page 4) et du corrigé (page 5). Verbe officiel : اذكر. Question 1 du التمرين الأول (Sujet 2)."
              ),
              placeholder: "مراقبة تكاثر الخلايا ذات الكفاءة المناعية LT و LB...",
              minLength: 30,
              modelAnswer: "تسهر الأنترلوكينات على مراقبة تكاثر الخلايا ذات الكفاءة المناعية LT و LB.",
              rule: {
                prompt: "اذكر دور الأنترلوكينات",
                keywords: ["انترلوكين", "تكاثر", "LT"],
                minHits: 2,
                forbidden: []
              }
            },
            S: {
              points: 2,
              prompt: "تسمية الخلايا المفرزة والمستهدفة لكل نوع من الأنترلوكينات",
              bacPrompt: "سمّ الخلايا المفرزة والمستهدفة لكل نوع من الأنترلوكينات.",
              ...OFFICIAL(
                4,
                "Relecture du PDF eddirasa 2026 Maths (page 4) et du corrigé. Verbe officiel : سمّ. Question 2 du التمرين الأول (Sujet 2)."
              ),
              placeholder: "IL-1: الخلية العارضة/المصابة → LT4 و LT8...",
              minLength: 40,
              modelAnswer:
                "IL-1 تفرزه الخلية العارضة أو المصابة ويستهدف LT4 و LT8. IL-2 تفرزه LTh ويستهدف LT8 و LB المحسستين.",
              rule: {
                prompt: "سم الخلايا المفرزة والمستهدفة للأنترلوكينات",
                keywords: ["IL", "LTh", "LT8", "LB"],
                minHits: 3,
                forbidden: []
              }
            },
            E: {
              points: 4,
              prompt: "النص العلمي: أثر التعديل في بنية IL-2 على الاستجابة ضد السرطان أو التثبيط",
              bacPrompt:
                "بيّن في نص علمي أن التعديل في بنية IL-2 أدى إلى تعزيز الاستجابة الموجهة ضد السرطان أو تثبيط الاستجابة في بعض الحالات المرضية بالاستعانة بالوثيقة ومعلوماتك (النص العلمي مهيكل بمقدمة وعرض وخاتمة).",
              ...OFFICIAL(
                4,
                "Relecture du PDF eddirasa 2026 Maths (page 4) et du corrigé (page 5). Verbe officiel : بيّن في نص علمي. Question 3 du التمرين الأول (Sujet 2)."
              ),
              placeholder: "مقدمة، عرض: IL-2 الطبيعي، NDNA11، H9-RETR، خاتمة...",
              minLength: 120,
              modelAnswer:
                "تؤدي المبلغات الكيميائية دورا أساسيا في نقل المعلومة وتنظيم شدة الرد المناعي النوعي. تعرض الخلايا LT و LB مستقبلات الأنترلوكين 2 بعد تحسسها بالببتيد المستضدي فيرتبط IL-2 الطبيعي بمستقبله فيحفز تكاثر LT8 وتمايزها إلى LTc التي تفرز البيرفورين. بتعديل بنية IL-2 تتغير درجة التكامل البنيوي مع مستقبله. ترتبط جزيئة NDNA11 ارتباطا قويا فتزيد تحفيز LT8 وتكاثرها وتمايزها إلى LTc فتعزز الاستجابة الموجهة ضد السرطان. أما جزيئة H9-RETR فارتباطها ضعيف بالمستقبل فيقل تحفيز LT8 وتُثبَّط الاستجابة مما يوفّر حماية للطعوم أو يحد من الرد الموجه ضد عناصر الذات. سمحت تقنيات الهندسة الوراثية بتصميم جزيئات IL-2 مصنعة معززة أو مثبطة للرد المناعي.",
              rule: {
                prompt: "بين أثر تعديل بنية IL-2",
                keywords: ["IL-2", "NDNA11", "سرطان", "تثبيط"],
                minHits: 3,
                forbidden: []
              }
            },
            W: {
              points: 1,
              prompt: "الخاتمة: آفاق جزيئات IL-2 المصنعة",
              bacPrompt: "ما الآفاق العلاجية لتصميم جزيئات IL-2 معززة أو مثبطة؟",
              ...RECON("Clôture issue du corrigé officiel. Pas une question BAC autonome."),
              placeholder: "في الختام...",
              minLength: 40,
              modelAnswer:
                "في الختام، تلعب جزيئات IL-2 دورا محوريا في الرد المناعي النوعي، ويفتح تصميم نسخ معدلة آفاقا لتطوير بروتوكولات علاجية لبعض المشاكل الصحية.",
              rule: {
                prompt: "اكتب خاتمة حول جزيئات IL-2 المصنعة",
                keywords: ["IL-2", "علاج", "مناعي"],
                minHits: 2,
                forbidden: []
              }
            }
          }
        },
        {
          number: 2,
          ui: "text",
          label: "متلازمة غيتلمان والناقل SLC12A3",
          max: 12,
          desc: "خلل امتصاص Na+ و Cl- بطفرة Leu892Pro تفقد الروابط الكارهة للماء",
          poles: {
            N: {
              points: 1,
              prompt: "اقتراح فرضية توضح سبب الإصابة بمتلازمة غيتلمان",
              bacPrompt: "اقترح فرضية توضح سبب الإصابة بمتلازمة غيتلمان باستغلال معطيات ونتائج الوثيقة 1.",
              ...OFFICIAL(
                5,
                "Relecture du PDF eddirasa 2026 Maths (page 5) et du corrigé (page 6). Verbe officiel : اقترح فرضية. Question unique du الجزء الأول."
              ),
              placeholder: "الفرضية: يعود السبب إلى خلل في وظيفة الناقل SLC12A3...",
              minLength: 30,
              modelAnswer: "الفرضية: يعود سبب الإصابة بمتلازمة غيتلمان إلى خلل في وظيفة الناقل SLC12A3.",
              rule: {
                prompt: "اقترح فرضية حول متلازمة غيتلمان",
                keywords: ["فرضيه", "SLC12A3", "غيتلمان"],
                minHits: 2,
                forbidden: []
              }
            },
            S: {
              points: 3,
              prompt: "استغلال الوثيقة 1: نشاط الناقل ومعايرة الشوارد في الدم",
              bacPrompt:
                "استغل الشكل (أ) والشكل (ب) من الوثيقة 1: نشاط الناقل SLC12A3 ومعايرة الشوارد في دم المصاب.",
              ...RECON(
                "La seule consigne écrite du الجزء الأول est اقترح فرضية. L'exploitation chiffrée est pédagogique."
              ),
              placeholder: "يصطاد الناقل شوارد Na و Cl من البول... الصوديوم 125...",
              minLength: 90,
              modelAnswer:
                "الناقل SLC12A3 بروتين غشائي مكون من سلسلة ببتيدية واحدة يصطاد شوارد Na+ و Cl- من البول وينقلها عبر غشاء الخلية الأنبوبية إلى الدم. نتائج المعايرة عند المصاب بدلالة الشوارد: تركيز الصوديوم 125 مليمول/ل (دون القيم الطبيعية 137-147) والكلور 83 (دون 99-110) بينما الكالسيوم ضمن القيم الطبيعية. ومنه ترتبط متلازمة غيتلمان بنقص شوارد Na و Cl في الدم.",
              rule: {
                prompt: "استغل الوثيقة 1 حول الناقل والشوارد",
                keywords: ["Na", "Cl", "SLC12A3", "125"],
                minHits: 3,
                forbidden: ["بسبب"],
                document: {
                  kind: "table",
                  axes: ["تركيز", "شارد"],
                  comparisons: [["Na", "Cl"]],
                  cells: [["صوديوم", "كلور"]],
                  values: ["125"],
                  strictValues: true
                }
              }
            },
            E: {
              points: 6,
              prompt: "شرح سبب الإصابة مصادقا على صحة الفرضية من الوثيقة 2",
              bacPrompt:
                "اشرح سبب الإصابة بمتلازمة غيتلمان، مصادقا على صحة الفرضية باستغلال معطيات الوثيقة 2.",
              ...OFFICIAL(
                6,
                "Relecture du PDF eddirasa 2026 Maths (pages 5-6) et du corrigé (pages 6-7). Verbe officiel : اشرح. Question 1 du الجزء الثاني. Consigne قدّم نصيحة non mappée."
              ),
              placeholder: "معدل امتصاص Na 1.5 عند السليم و 1.0 عند المصاب... CUG→CCG Leu→Pro...",
              minLength: 110,
              modelAnswer:
                "معدل امتصاص شوارد الصوديوم عند السليم حوالي 1.5 و.إ وعند المصاب منخفض في حدود 1 و.إ (نصف القيمة الطبيعية): ترتبط المتلازمة بضعف نشاط الناقل. على مستوى الثلاثية 892 استبدال T بـ C حوّل الرامزة CUG إلى CCG فدُمج Pro بدل Leu. عند السليم يتجاذب جذر Leu892 الكاره للماء مع Ile888 و Leu897 فيستقر البروتين. عند المصاب لا تتشكل هذه الروابط فتصبح البنية غير وظيفية. ضعفت قدرة امتصاص Na و Cl من البول فانخفض تركيزهما في الدم وظهرت الأعراض. تتأكد الفرضية.",
              rule: {
                prompt: "اشرح سبب غيتلمان وصادق على الفرضية",
                keywords: ["فرضيه", "Leu", "Pro", "SLC12A3"],
                minHits: 3,
                forbidden: [],
                causalOrder: ["طفره", "Pro"]
              }
            },
            W: {
              points: 2,
              prompt: "مخطط وظيفي: تحكم المورثة في بنية البروتين عند السليم والمصاب",
              bacPrompt:
                "وضّح بمخطط وظيفي كيف تتحكم المورثة في تحديد بنية البروتين لدى الشخص السليم والمصاب بمتلازمة غيتلمان.",
              ...OFFICIAL(
                6,
                "Relecture du PDF eddirasa 2026 Maths (page 6) et du corrigé (page 8). Verbe officiel : وضّح بمخطط. Question du الجزء الثالث."
              ),
              placeholder: "مورثة طبيعية → نسخ → ترجمة → Leu892... مورثة طافرة → Pro892...",
              minLength: 0,
              modelAnswer:
                "عنوان المخطط: تحكم المورثة في الناقل SLC12A3. شخص سليم: مورثة طبيعية → نسخ → ARNm → ترجمة → سلسلة ببتيدية Leu892 تسمح بتجاذب الجذور الكارهة للماء → بنية فراغية وظيفية. شخص مصاب: مورثة طافرة → نسخ → تغير الرامزة → ترجمة → Pro892 لا يسمح بالتجاذب → بنية فراغية غير وظيفية.",
              rule: {
                prompt: "وضح بمخطط تحكم المورثة في بنية البروتين",
                keywords: ["مخطط", "Leu", "Pro"],
                minHits: 1,
                forbidden: [],
                schema: { arrows: true, title: "غيتلمان", ordered: ["مورثه", "ترجمه", "بنيه"] }
              }
            }
          }
        }
      ]
    }
  ]
};

export default YEAR_2026_M;
