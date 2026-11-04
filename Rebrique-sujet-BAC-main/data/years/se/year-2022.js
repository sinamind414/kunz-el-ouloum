/* 2022 — Sciences expérimentales. Données extraites du catalogue historique sans modifier les champs de contenu ni de provenance.
 * Chargé à la demande par data/subjects.js.
 */
const YEAR_2022_SE = {
  id: "2022",
  label: "بكالوريا الجزائر دورة 2022 — شعبة علوم تجريبية",
  theme: "rose",
  enabled: true,
  sujets: [
    {
      id: 1,
      pdf: null,
      pdfExternalUrl:
        "https://www.dzexams.com/uploads/sujets/officiels/bac/2022/dzexams-bac-sciences-2311208.pdf",
      pdfLocalUrl: "/subjects/SE/2022/sujet-1.pdf",
      pdfNote:
        "PDF officiel (ONEC, pp. 1-5 pour ce sujet) non redistribué dans le dépôt ; page : https://www.dzexams.com/ar/annales/eVlXSFRFOEJaN2ozSlE3NytzWkRHQT09 (consulté 2026-08-27). La couche texte du PDF est inversée (miroir mot à mot) ; les consignes ont été reconstituées mot à mot à partir de cette couche. Corrigé officiel (الإجابة النموذجية) joint au même PDF (pp. 11-21) et croisé avec : https://eddirasa.com/correction-bac-science-2022-se/ — textes concordants.",
      title: "الموضوع الأول",
      exercises: [
        {
          number: 1,
          ui: "text",
          label: "الغشاء الهيولي: التمييز بين الذات واللاذات",
          max: 5,
          desc: "بنية الغشاء الهيولي (طبقتان فسفوليبيد + بروتينات) ودور مكوناته (CMH, ABO, Rh, BCR, TCR) في تحديد الذات والتعرف على اللاذات",
          poles: {
            N: {
              points: 1,
              prompt: "تأطير الإشكالية: كيف يحدد الغشاء الهيولي ذات الخلية ويتعرف على اللاذات؟",
              bacPrompt:
                "المشكل: كيف يحدد الغشاء الهيولي ذات الخلية ويتعرف على اللاذات انطلاقا من مكوناته البروتينية؟",
              bacPromptSource: "reconstructed",
              bacPromptNotes:
                "Pas de question officielle autonome de type « حدد المشكل ». Reformulation pédagogique du préambule page 1 (lisible : « يتميّز الغشاء الهيولي بتركيب كميائي وتنظيم جزئي أكسبه قدرة التمييز بين الذات واللاذات بواسطة جزيئات بروتينية »).",
              placeholder: "صياغة المشكل العلمي...",
              minLength: 30,
              modelAnswer:
                "المشكل العلمي: كيف تتيح مكونات الغشاء الهيولي البروتينية (CMH, ABO, Rh, BCR, TCR) للخلية تحديد ذاتها والتعرف على اللاذات؟",
              rule: {
                prompt: "حدد المشكل العلمي حول الغشاء الهيولي",
                keywords: ["ذات", "لاذات", "بروتين"],
                minHits: 2,
                forbidden: []
              }
            },
            S: {
              points: 1,
              prompt: "وصف بنية الغشاء الهيولي ومميزات مكوناته",
              bacPrompt: "صف بنية الغشاء الهيولي واذكر مميزات مكوناته.",
              bacPromptSource: "official",
              bacPromptPage: 1,
              bacPromptVerifiedAt: "2026-08-27",
              bacPromptNotes:
                "Relecture du PDF dzexams 2022 (couche texte inversée, reconstituée). Verbes officiels : صف / اذكر. Question 1 du التمرين الأول (Sujet 1). Le corrigé officiel (p. 11) détaille la réponse attendue (2 couches, rôle des protéines, tête hydrophile).",
              placeholder: "طبقتان فسفوليبيد، رأس محب للماء، ذيل كاره للماء...",
              minLength: 30,
              modelAnswer:
                "الغشاء الهيولي مكوّن من طبقتين فسفوليبيد تشكلان الطبقة الوسطى ذات الطبيعة الليبوفيلية (كارهة للماء) المحاطة بأطراف قطبية محبة للماء، واختلاف وظائفه وبنية مكوناته ناتج عن البروتينات (بروتينات سطحية خارجية وداخلية وبروتين ضمني). مميزات المكونات: الرأس الفسفوي (القطب الكيميائي) محب للماء، والذيل الليبيدي كاره للماء.",
              rule: {
                prompt: "صف بنية الغشاء الهيولي ومميزات مكوناته",
                keywords: ["فسفوليب", "بروتين", "طبقتين", "كارهه"],
                minHits: 3,
                forbidden: []
              }
            },
            E: {
              points: 2,
              prompt: "النص العلمي: دور مكونات الغشاء الهيولي في تحديد الذات والتعرف على اللاذات",
              bacPrompt:
                "وضح في نص علمي مهيكل ومنظم دور مختلف مكونات الغشاء الهيولي المتدخلة في تحديد الذات والتعرف على اللاذات انطلاقا مما تقدمه الوثيقة واعتمادا على معلوماتك.",
              bacPromptSource: "official",
              bacPromptPage: 1,
              bacPromptVerifiedAt: "2026-08-27",
              bacPromptNotes:
                "Relecture du PDF dzexams 2022 (couche texte inversée, reconstituée). Verbe officiel : وضّح في نص علمي مهيكل ومنظم. Question 2 du التمرين الأول (Sujet 1). Le corrigé officiel (p. 11) fournit le texte attendu : CMH I/II, ABO, Rh, BCR, TCR.",
              placeholder: "مقدمة، عرض (CMH, ABO, Rh, BCR, TCR)، خاتمة...",
              minLength: 110,
              modelAnswer:
                "الغشاء الهيولي يكتسب بواسطة بروتيناته الغشائية القدرة على تحديد الذات والتعرف على اللاذات: نظام CMH (HLA) يتكون من بروتينات سكريات دهنية توجد على سطح جميع الخلايا حقيقية النواة (النوع I) وعلى سطح بعض الخلايا المناعية أساسا (النوع II - الخلايا العارضة). نظام ABO: بروتينات سكرية دهنية توجد على غشاء كريات الدم الحمراء يحدد رمزها المجموعة الدموية. نظام Rh: بروتينات المستضد (D) توجد على غشاء كريات الدم الحمراء في حالة المجموعة (Rh+). المستقبل BCR: غليكوبروتين يوجد على سطح الخلايا LB يسمح للخلية بالتعرف على مستضد معين. المستقبل TCR: غليكوبروتين يوجد على سطح الخلايا LT4 يسمح بالتعرف على الببتيد المستضد معروض على CMHII، وعلى سطح الخلايا LT8 يسمح بالتعرف على الببتيد المستضد معروض على CMHI (تعرّف مزدوج). بضم هذه البروتينات الغشائية يكون للغشاء الهيولي القدرة على تحديد الذات والتعرف على اللاذات، فكل ما لا يحمل هذه المكونات يُعد عنصرا غريبا (لاذاتيا).",
              rule: {
                prompt: "اكتب نصا علميا حول مكونات الغشاء الهيولي",
                keywords: ["cmh", "abo", "rh", "bcr", "tcr", "ذات", "لاذات"],
                minHits: 3,
                forbidden: []
              }
            },
            W: {
              points: 1,
              prompt: "الخاتمة: الدور الحاسم للبروتينات الغشائية في تحديد الذات",
              bacPrompt: "ما الدور الحاسم للبروتينات الغشائية في قدرة الخلية على التمييز بين الذات واللاذات؟",
              bacPromptSource: "reconstructed",
              bacPromptNotes:
                "Clôture issue du corrigé officiel (p. 11) : « بروتينات الغشاء تضيف للغشاء القدرة على تحديد الذات والتعرف على اللاذات ». Ce pôle isole pédagogiquement la clôture (question BAC autonome introuvable).",
              placeholder: "في الختام...",
              minLength: 40,
              modelAnswer:
                "في الختام، بروتينات الغشاء الهيولي هي التي تمنحه القدرة على تحديد الذات والتعرف على اللاذات، فكل جزيء غريب عن هذه المكونات يُعامل كعنصر لاذاتي.",
              rule: {
                prompt: "اكتب خاتمة حول دور البروتينات الغشائية",
                keywords: ["بروتين", "ذات", "لاذات"],
                minHits: 2,
                forbidden: []
              }
            }
          }
        },
        {
          number: 2,
          ui: "text",
          label: "منطقة التشابك على مستوى النخاع الشوكي (الغلوتامات و GABA)",
          max: 7,
          desc: "أنواع المشابك (منبّهة/مثبطة) على مستوى المادة الرمادية للنخاع الشوكي، ودور مستقبلات GABA (a/b) في كبح الرسالة العصبية وتأمين استرخاء العضلة",
          poles: {
            N: {
              points: 1,
              prompt: "تأطير الإشكالية: كيف تؤمن البروتينات الغشائية تقلص العضلة واسترخائها خلال المنعكسات؟",
              bacPrompt:
                "المشكل: كيف تؤمن البروتينات الغشائية على مستوى مناطق التشابك في النخاع الشوكي تقلص العضلة واسترخائها (المنعكس العضلي)؟",
              bacPromptSource: "reconstructed",
              bacPromptNotes:
                "Pas de question officielle autonome de type « حدد المشكل ». Reformulation pédagogique du préambule page 2 (lisible : « يؤمن نشاط العضلات خلال المنعكسات العضلية بروتينات غشائية نوعية بعضها تعمل بتأثير مبلغات عصبية على مستوى مناطق التشابك »).",
              placeholder: "صياغة المشكل العلمي...",
              minLength: 30,
              modelAnswer:
                "المشكل العلمي: كيف تتدخل البروتينات الغشائية (المستقبلات النوعية) على مستوى مناطق التشابك في النخاع الشوكي لتأمين تقلص العضلة واسترخائها خلال المنعكسات العضلية؟",
              rule: {
                prompt: "حدد المشكل العلمي حول مناطق التشابك",
                keywords: ["تشابك", "عضله", "بروتين"],
                minHits: 2,
                forbidden: []
              }
            },
            S: {
              points: 2.5,
              prompt: "بيان العلاقة بين أنواع المشابك والمبلغات العصبية المدروسة",
              bacPrompt:
                "بيّن باستغلالك لنتائج الشكل (ب) العلاقة بين أنواع المشابك الممثّلة في الشكل (أ) والمبلغات العصبية المدروسة.",
              bacPromptSource: "official",
              bacPromptPage: 2,
              bacPromptVerifiedAt: "2026-08-27",
              bacPromptNotes:
                "Relecture du PDF dzexams 2022 (couche texte inversée, reconstituée). Verbe officiel : بيّن. Question du الجزء الأول (Sujet 1, Ex2). Le corrigé officiel (p. 12) détaille les 3 enregistrements (ج1/ج2/ج3) et les 2 conclusions (الغلوتامات / GABA).",
              placeholder: "عند التنبيه 1: PPSE... عند التنبيه 2: PPSI... نستنتج...",
              minLength: 90,
              modelAnswer:
                "عند التنبيه 1: يسجل الجهاز (ج1) جهدا بعد مشبكي تنبيها (PPSE) والجهاز (ج2) كمونا مستقرا والجهاز (ج3) جهدا بعد مشبكي تنبيها (PPSE). عند التنبيه 2 (تثبيط GABA على المنطقة (س)): يسجل الجهازان (ج1) و(ج3) جهدا بعد مشبكي تثبيطا (PPSI) والجهاز (ج2) كمونا مستقرا. نستنتج أن المشبك (ع3-ع1) من النوع المنبّه يحرر مبلغا عصبيّا هو الغلوتامات، وأن المشبك (ع3-ع2) من النوع المثبط يحرر مبلغا عصبيّا هو GABA على مستوى كل منهما.",
              rule: {
                prompt: "بيّن العلاقة بين أنواع المشابك والمبلغات",
                keywords: ["مشبك", "منبه", "مثبط", "غلوتامات", "gaba", "تسجيل"],
                minHits: 3,
                forbidden: ["بسبب"]
              }
            },
            E: {
              points: 2.5,
              prompt: "اشرح تدخّل البروتينات الغشائية في كبح الرسالة العصبية وتأمين استرخاء العضلة",
              bacPrompt:
                "اشرح كيف تتدخّل البروتينات الغشائية على مستوى المشابك في كبح وصول الرسالة العصبية إلى العضلة وتأمين استرخائها وذلك باستغلال معطيات الشكل (ب) من الوثيقة (2).",
              bacPromptSource: "official",
              bacPromptPage: 2,
              bacPromptVerifiedAt: "2026-08-27",
              bacPromptNotes:
                "Relecture du PDF dzexams 2022 (couche texte inversée, reconstituée). Verbe officiel : اشرح. Question 2 du الجزء الثاني (Sujet 1, Ex2). Consigne « أبرز مختلف الظواهر الناتجة عن وصول الرسالة العصبية إلى نهاية العصبون (ع1)... » (question 1 du même الجزء) non mappée (un pôle = une consigne).",
              placeholder: "يتنشط العصبون (ع2) فيحفز فتح قنوات الكالسيوم...",
              minLength: 110,
              modelAnswer:
                "يتنشط العصبون (ع2) فيحفز فتح القنوات الفسفوليبيدية للكالسيوم ودخوله إلى النهاية العصبية (ع2)، فيؤدي إلى هجرة الحويصلات المشبكية وتحرير المبلغ الكيميائي GABA في الشق المشبكي لكل من المشبك (ع1-ع2) و(ع2-ع3). على مستوى المشبك (ع1-ع2): يثبت GABA على المستقبلات GABA-b الموجودة على الغشاء بعد المشبكي للعصبون (ع1) ما ينشّط قنوات البوتاسيوم التي يخرج من خلالها أيون K⁺ إلى خارج الخلية بعد المشبكية؛ ومن جهة أخرى يثبّت GABA القنوات الفسفوليبيدية للكالسيوم ما يؤدي إلى عدم دخول Ca²⁺ وعدم تحرر الغلوتامات رغم وصول رسالة عصبية إلى العصبون (ع1)، فيكبح اقتران الرسالة من العصبون (ع1) إلى العصبون (ع3). على مستوى المشبك (ع2-ع3): يثبت GABA على المستقبلات GABA-b فينشّط قنوات البوتاسيوم فيخرج أيون K⁺ من الغشاء بعد المشبكي للعصبون (ع3)، ويثبت على المستقبلات GABA-a فيفتح القنوات الأيونية ويدخل أيون Cl⁻ إلى الهيولى بعد المشبكية فيحدث فرط استقطاب الغشاء بعد المشبكي للعصبون (ع3).",
              rule: {
                prompt: "اشرح تدخّل مستقبلات GABA في الاسترخاء",
                keywords: ["gaba", "مستقبل", "كالسيوم", "استقطاب"],
                minHits: 3,
                forbidden: []
              }
            },
            W: {
              points: 1,
              prompt: "الخاتمة: أثر تثبيط GABA على الرسالة الموجهة إلى العضلة",
              bacPrompt:
                "ما أثر تثبيط GABA على مستوى المشابكين (ع1-ع2) و(ع2-ع3) على الرسالة العصبية الموجهة إلى العضلة؟",
              bacPromptSource: "reconstructed",
              bacPromptNotes:
                "Clôture issue du corrigé officiel (p. 13) : « GABA على مستوى المشابكين يضمن ردة فعل تثبيطية بعد مشبكية ديلوت من المكونات التنبيهية فيكبح رسالة عصبية على العصبون (ع3) المحرك للعضلة ما يؤدي إلى استرخائها ». Ce pôle isole pédagogiquement la clôture.",
              placeholder: "في الختام...",
              minLength: 40,
              modelAnswer:
                "في الختام، يضمن GABA على مستوى المشابكين (ع1-ع2) و(ع2-ع3) ردة فعل تثبيطية بعد مشبكية ديلوت من المكونات التنبيهية، فيكبح الرسالة العصبية على العصبون (ع3) المحرك للعضلة ما يؤدي إلى استرخائها.",
              rule: {
                prompt: "اكتب خاتمة حول أثر GABA على العضلة",
                keywords: ["gaba", "تثبيطي", "استرخاء"],
                minHits: 2,
                forbidden: []
              }
            }
          }
        },
        {
          number: 3,
          ui: "text",
          label: "الجينتامسين وانحلال البشرة الفقاعية",
          max: 8,
          desc: "تأثير المضاد الحيوي الجينتامسين على البكتيريا (مضاد حيوي) وعلى الشخص المصاب (بروتين اللامينين المكتمل)، وقراءة خاطئة للرموز خلال الترجمة",
          poles: {
            N: {
              points: 0.5,
              prompt: "اقترح فرضية حول طريقة تأثير الجينتامسين (الشكل د)",
              bacPrompt:
                "اقترح فرضية وجيهة تسمح بتحديد طريقة تأثير الجينتامسين اعتمادا على معطيات الشكل (د) من الوثيقة (1).",
              bacPromptSource: "official",
              bacPromptPage: 4,
              bacPromptVerifiedAt: "2026-08-27",
              bacPromptNotes:
                "Relecture du PDF dzexams 2022 (couche texte inversée, reconstituée). Verbe officiel : اقترح فرضية. Question 2 du الجزء الأول (Sujet 1, Ex3). Le corrigé officiel (p. 14) : « الجينتاميسين يتسبب في قراءة بعض رموز ARNm خاطئة خلال عملية الترجمة » (تقبل فرضيات أخرى وجيهة لها نفس المحتوى).",
              placeholder: "الفرضية: يتسبب الجينتامسين في...",
              minLength: 30,
              modelAnswer:
                "الفرضية: يتسبب الجينتامسين في قراءة بعض رموز ARNm قراءة خاطئة خلال عملية الترجمة على مستوى الريبوزوم (الموقع A) مما يؤدي إلى تغيير طبيعة البروتين الكيماوية.",
              rule: {
                prompt: "اقترح فرضية حول تأثير الجينتامسين",
                keywords: ["فرضيه", "ترجمه", "جينتاميسين"],
                minHits: 2,
                forbidden: []
              }
            },
            S: {
              points: 2,
              prompt: "استغلال منهجي للأشكال (أ، ب، ج): البكتيريا، اللوسين، اللامينين + المشكل المطروح",
              bacPrompt:
                "بيّن تأثير المعالجة بالجينتامسين ضد البكتيريا وعلى الشخص المصاب مبرزا المشكل المطروح وذلك باستغلال منهجي للأشكال (أ، ب، ج) من الوثيقة (1).",
              bacPromptSource: "official",
              bacPromptPage: 3,
              bacPromptVerifiedAt: "2026-08-27",
              bacPromptNotes:
                "Relecture du PDF dzexams 2022 (couche texte inversée, reconstituée). Verbe officiel : بيّن. Question 1 du الجزء الأول (Sujet 1, Ex3). Le corrigé officiel (p. 13-14) détaille la lecture des 3 figures (colonies / leucine 13% / laminine 21%) et le « المشكل المطرح ».",
              placeholder:
                "الشكل (أ): يتناقص عدد المستعمرات... الشكل (ب): الاندماج 13%... الشكل (ج): اللامينين 21%...",
              minLength: 90,
              modelAnswer:
                "الشكل (أ): يتناقص عدد مستعمرات البكتيريا E.coli في غياب الجينتامسين عن 333 مستعمرة، ويتناقص أكثر بزيادة تركيز الجينتامسين حتى ينعدم عند تركيز 11 mg/l: الجينتامسين مضاد حيوي. الشكل (ب): يتناقص معدل اندماج اللوسين في الببتيد في وجود مختلف تراكيز الجينتامسين، حيث يبلغ الاندماج 13% من الاندماج في غيابه عند تركيز 9 µM: في وجود الجينتامسين تُترجم رامزة مشفرة للفنيل ألانين إلى لوسين. الشكل (ج): نسبة التعبير عن بروتين اللامينين المكتمل الوظيفي عند الشخص المصاب منخفضة في غياب الجينتامسين وتزداد مع وجوده بتغير تركيز المضاد الحيوي لتبلغ 21% عند تركيز 25 µg/ml: يحمي المضاد الحيوي الجينتامسين من تركيب بروتين كامل وظيفي في خلايا البشرة عند الشخص المصاب بالمرض. المشكل المطرح: كيف يؤدي الجينتامسين إلى تركيب بروتين كامل وظيفي عند الشخص المصاب بانحلال البشرة الفقاعية بينما ينتج عنه بروتين غير وظيفي عند البكتيريا؟",
              rule: {
                prompt: "بيّن تأثير الجينتامسين بالاستغلال المنهجي",
                keywords: ["مستعمرة", "اندماج", "تركيز", "لامينين"],
                minHits: 3,
                forbidden: ["بسبب"]
              }
            },
            E: {
              points: 4,
              prompt: "وضّح طريقة تأثير الجينتامسين مصادقا على صحة الفرضية (وثيقة 2)",
              bacPrompt:
                "وضح باستغلال معطيات الوثيقة (2) طريقة تأثير الجينتامسين مصادقا على صحة الفرضية المقترحة.",
              bacPromptSource: "official",
              bacPromptPage: 5,
              bacPromptVerifiedAt: "2026-08-27",
              bacPromptNotes:
                "Relecture du PDF dzexams 2022 (couche texte inversée, reconstituée). Verbe officiel : وضّح. Question du الجزء الثاني (Sujet 1, Ex3). Le corrigé officiel (p. 14-15) donne les 2 traductions (CGC→stop / UAG→Gln) et la validation de la hypothèse.",
              placeholder: "في غياب الجينتامسين يترجم... بينما في وجوده تتوقف الترجمة عند CGC...",
              minLength: 110,
              modelAnswer:
                "في غياب الجينتامسين يترجم جزء من مورثة بروتين النمو عند البكتيريا (الجزء TAC GCG CCT AGG GGG TGG → رموز ARNm: AUG CGC GGA UCC CCC ACC) إلى السلسلة ثريوبرولين-برولين-سيرين-جليسين-أرجينين-ميثيونين، بينما في وجوده تتوقف الترجمة عند الرامزة الثانية CGC الدالة على أرجينين إذ تُقرأ كرامزة توقف فيتوقف تركيب البروتين. في الشخص المصاب: في غياب الجينتامسين يترجم الجزء (TAC TTG ACC ATC CGT AGC → AUG AAC UGG UAG GCA UCG) إلى تريبان-أسباراجين-ميثيونين... (بروتين غير مكتمل)، بينما في وجود الجينتامسين تُقرأ رامزة التوقف UAG إلى Gln ما يرتجل الترجمة إلى تركيب بروتين كامل وظيفي. هكذا تصح الفرضية المقترحة: يتسبب الجينتامسين في قراءة خاطئة لبعض رموز ARNm خلال عملية الترجمة مما يؤدي إلى تغيير طبيعة البروتين الكيماوية.",
              rule: {
                prompt: "وضّح طريقة تأثير الجينتامسين مع المصادقة",
                keywords: ["ترجمه", "رامزه", "بروتين", "فرضيه"],
                minHits: 3,
                forbidden: [],
                wrongConcepts: ["ميثان", "nop"]
              }
            },
            W: {
              points: 1.5,
              prompt: "برّر الاهتمامات المتزايدة بالجينتامسين في الأساليب العلاجية",
              bacPrompt:
                "برّر انطلاقا مما توصلت إليه من هذه الدراسة الاهتمامات المتزايدة بالمضاد الحيوي الجينتامسين (gentamicine) في الأساليب العلاجية.",
              bacPromptSource: "official",
              bacPromptPage: 5,
              bacPromptVerifiedAt: "2026-08-27",
              bacPromptNotes:
                "Relecture du PDF dzexams 2022 (couche texte inversée, reconstituée). Verbe officiel : برّر. Question du الجزء الثالث (Sujet 1, Ex3).",
              placeholder: "يعمل الجينتامسين من خلال دوره في...",
              minLength: 50,
              modelAnswer:
                "يعمل الجينتامسين من خلال دوره في منع تركيب البروتينات غير الوظيفية في البكتيريا (فعل مضاد حيوي). ويعمل على علاج بعض الضراير الناتجة عن طفرات مؤدية إلى تركيب بروتينات مبتورة من خلال تركيب بروتينات مكتملة وظيفية عند الإنسان.",
              rule: {
                prompt: "برّر الاهتمامات بالجينتامسين",
                keywords: ["علاج", "طفرات", "بروتين", "بكتيريا"],
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
      pdfExternalUrl:
        "https://www.dzexams.com/uploads/sujets/officiels/bac/2022/dzexams-bac-sciences-2311208.pdf",
      pdfLocalUrl: "/subjects/SE/2022/sujet-2.pdf",
      pdfNote:
        "PDF officiel (ONEC, pp. 6-10 pour ce sujet) non redistribué dans le dépôt ; page : https://www.dzexams.com/ar/annales/eVlXSFRFOEJaN2ozSlE3NytzWkRHQT09 (consulté 2026-08-27). La couche texte du PDF est inversée (miroir mot à mot) ; les consignes ont été reconstituées mot à mot à partir de cette couche. Corrigé officiel (الإجابة النموذجية) joint au même PDF (pp. 16-20) et croisé avec : https://eddirasa.com/correction-bac-science-2022-se/ — textes concordants.",
      title: "الموضوع الثاني",
      exercises: [
        {
          number: 1,
          ui: "text",
          label: "السّيانور وكمون الراحة للليف العصبي",
          max: 5,
          desc: "مصدر كمون الراحة (توزيع Na⁺/K⁺ وقنوات التسرب ومضخة Na⁺/K⁺)، وتأثير مادة السّيانور (منع تركيب ATP) على كمون الراحة وقابلية تنبيه الليف العصبي",
          poles: {
            N: {
              points: 1,
              prompt: "تأطير الإشكالية: كيف تؤثر مادة السّيانور على الكمون الغشائي أثناء الراحة؟",
              bacPrompt:
                "المشكل: كيف تؤثر مادة السّيانور (المانعة لتركيب ATP) على الكمون الغشائي للليف العصبي أثناء الراحة؟",
              bacPromptSource: "reconstructed",
              bacPromptNotes:
                "Pas de question officielle autonome de type « حدد المشكل ». Reformulation pédagogique du préambule page 6 (lisible : « يتميّز غشاء العصبون بالاستقطاب أثناء الراحة لكونه قابلا للتنبيه بتدخل بروتينات عالية التخصص. بعض المركبات السامة مثل السّيانور (يمنع تركيب ATP) فقد غشاء الليف العصبي هذه الخاصية »).",
              placeholder: "صياغة المشكل العلمي...",
              minLength: 30,
              modelAnswer:
                "المشكل العلمي: كيف يؤدي منع مادة السّيانور لتركيب ATP إلى التأثير على الكمون الغشائي للليف العصبي أثناء الراحة وعلى قابليته للتنبيه؟",
              rule: {
                prompt: "حدد المشكل العلمي حول السّيانور وكمون الراحة",
                keywords: ["سيانور", "atp", "كمون"],
                minHits: 2,
                forbidden: []
              }
            },
            S: {
              points: 1,
              prompt: "تحديد مصدر كمون الراحة",
              bacPrompt: "حدّد مصدر كمون الراحة.",
              bacPromptSource: "official",
              bacPromptPage: 6,
              bacPromptVerifiedAt: "2026-08-27",
              bacPromptNotes:
                "Relecture du PDF dzexams 2022 (couche texte inversée, reconstituée). Verbe officiel : حدّد. Question 1 du التمرين الأول (Sujet 2). Le corrigé officiel (p. 16) : distribution Na⁺/K⁺ + nombre de canaux ouverts.",
              placeholder: "توزيع غير متساو لشوارد Na⁺/K⁺، قنوات مفتوحة أكبر لـ K⁺...",
              minLength: 50,
              modelAnswer:
                "يتميّز غشاء العصبون أثناء الراحة بالقطبية (كمون راحة سالب داخل الخلية) ينتج عن: توزيع غير متساو لشوارد Na⁺ وK⁺ بين داخل الغشاء وخارجه (تركيز شوارد K⁺ أكبر في الداخل وشوارد Na⁺ أكبر في الخارج)، وعدد القنوات المفتوحة في الغشاء أكبر لـ K⁺ منه لـ Na⁺.",
              rule: {
                prompt: "حدّد مصدر كمون الراحة",
                keywords: ["شوارد", "قنوات", "توزيع"],
                minHits: 2,
                forbidden: []
              }
            },
            E: {
              points: 2,
              prompt: "النص العلمي: كيفية تأثير السّيانور على الكمون الغشائي أثناء الراحة",
              bacPrompt:
                "اشرح مستعينا بالوثيقة واعتمادا على معلوماتك في نص علمي منظم ومهيكل، كيفية تأثير مادة السّيانور على الكمون الغشائي للليف العصبي أثناء الراحة.",
              bacPromptSource: "official",
              bacPromptPage: 6,
              bacPromptVerifiedAt: "2026-08-27",
              bacPromptNotes:
                "Relecture du PDF dzexams 2022 (couche texte inversée, reconstituée). Verbe officiel : اشرح في نص علمي منظم ومهيكل. Question 2 du التمرين الأول (Sujet 2). Le corrigé officiel (p. 16) structure le texte (مقدمة / عرض: الحالة الطبيعية ثم وجود السّيانور / خاتمة).",
              placeholder: "في الحالة الطبيعية: تتسرب الشوارد... في وجود السّيانور: يمنع تركيب ATP...",
              minLength: 110,
              modelAnswer:
                "تتوقف قابلية تنبيه الليف العصبي على حالة كهربائية تعرف بكمون الراحة والتي يلزمها بروتينات غشائية خاصة، غير أن بعض المواد الكيميائية مثل السّيانور تسبب خللا في نشاط بعضها فتؤثر على كمون الراحة. في الحالة الطبيعية: تتسرب شوارد الصوديوم نحو الداخل عبر قنوات التسرب وفق تدرج تركيزها، كما تتسرب شوارد البوتاسيوم نحو الخارج عبر قنوات التسرب وفق تدرج تركيزها، ويعمل مضخة Na⁺/K⁺ على نقل الشاردتين عكس تدرج تركيزهما باستهلاك الطاقة على شكل ATP ما يحافظ على التوزيع المتباين لشوارد Na⁺ وK⁺ على جانبي الغشاء ومنه على كمون الراحة. في وجود السّيانور: يمنع السّيانور تركيب ATP في الليف العصبي، في غياب ATP يتوقف نشاط المضخة فيؤدي تسرب الشوارد عبر القنوات إلى تساوي تركيزها على جانبي غشاء الليف ومنه زوال كمون الراحة وقابلية تنبيه الليف العصبي.",
              rule: {
                prompt: "اشرح تأثير السّيانور على كمون الراحة",
                keywords: ["atp", "مضخه", "تسرب", "قنوات", "سيانور"],
                minHits: 3,
                forbidden: [],
                wrongConcepts: ["جينتامسين", "جينتاميسين", "gentamicine", "ميثان"]
              }
            },
            W: {
              points: 1,
              prompt: "الخاتمة: الخطر الصحي للسّيانور على الإنسان",
              bacPrompt: "ما الخطر الصحي لمادة السّيانور على الإنسان من خلال تأثيرها على كمون الراحة؟",
              bacPromptSource: "reconstructed",
              bacPromptNotes:
                "Clôture issue du corrigé officiel (p. 16) : « السيانور من المواد السامة التي تؤثر سلبا على صحة الإنسان بتأثيرها على كمون الراحة وبالتالي على قابلية تنبيه الليف العصبي ». Ce pôle isole pédagogiquement la clôture.",
              placeholder: "في الختام...",
              minLength: 40,
              modelAnswer:
                "في الختام، السّيانور من المواد السامة التي تؤثر سلبا على صحة الإنسان بتأثيرها على كمون الراحة وبالتالي على قابلية تنبيه الليف العصبي.",
              rule: {
                prompt: "اكتب خاتمة حول الخطر الصحي للسّيانور",
                keywords: ["سامه", "كمون", "تنبيه"],
                minHits: 2,
                forbidden: []
              }
            }
          }
        },
        {
          number: 2,
          ui: "text",
          label: "α-amanitine وعلاج الأورام السرطانية (ATAC)",
          max: 7,
          desc: "تثبيط أنزيم ARN بوليميراز بمادة α-amanitine (الحلقة TL)، واستغلال تأثيرها في علاج الأورام السرطانية عبر الدواء ATAC (جسم مضاد + α-amanitine)",
          poles: {
            N: {
              points: 1,
              prompt: "تأطير الإشكالية: تأثير α-amanitine على تركيب البروتين واستغلالها في علاج الأورام",
              bacPrompt:
                "المشكل: كيف تؤثر مادة (α-amanitine) على تركيب البروتين، وكيف يستغل الباحثون خاصيتها في علاج بعض الأورام السرطانية؟",
              bacPromptSource: "reconstructed",
              bacPromptNotes:
                "Pas de question officielle autonome de type « حدد المشكل ». Reformulation pédagogique du préambule page 6 (lisible : « يمكن لبعض المواد مثل مادة (α-amanitine) المستخرجة من فطر Amanita Phalloïde أن تؤثر على عملية تركيب البروتين، استغل الباحثون خصائص تأثير هذه المادة في علاج بعض الأورام السرطانية »).",
              placeholder: "صياغة المشكل العلمي...",
              minLength: 30,
              modelAnswer:
                "المشكل العلمي: كيف تثبط مادة (α-amanitine) تركيب البروتين في الخلايا، وكيف يمكن استغلال هذا التثبيط في علاج بعض الأورام السرطانية؟",
              rule: {
                prompt: "حدد المشكل العلمي حول α-amanitine",
                keywords: ["amanitine", "بروتين", "سرطانيه"],
                minHits: 2,
                forbidden: []
              }
            },
            S: {
              points: 2.5,
              prompt: "وضّح تأثير α-amanitine على تركيب البروتين (شكلا 1 أ/ب)",
              bacPrompt:
                "وضّح كيفية تأثير مادة (α-amanitine) على تركيب البروتين باستغلالك لشكلي الوثيقة (1).",
              bacPromptSource: "official",
              bacPromptPage: 7,
              bacPromptVerifiedAt: "2026-08-27",
              bacPromptNotes:
                "Relecture du PDF dzexams 2022 (couche texte inversée, reconstituée). Verbe officiel : وضّح. Question du الجزء الأول (Sujet 2, Ex2). Le corrigé officiel (p. 17) : activité de l'ARN polymérase (100% → 30% à 13 µg/ml) + boucle TL.",
              placeholder: "في غياب α-amanitine يبلغ النشاط 100%... على المستوى الجزئي: الحلقة TL...",
              minLength: 90,
              modelAnswer:
                "في غياب α-amanitine يبلغ نشاط أنزيم ARN بوليميراز 100%، بينما في وجوده ينخفض نشاط الأنزيم إلى 30% عند تركيز 13 µg/ml: α-amanitine يثبط نشاط أنزيم ARN بوليميراز. على المستوى الجزئي: في الحالة الطبيعية (الغياب) تغيّر الحلقة TL في أنزيم ARN بوليميراز شكلها ما يسمح بدمج نيكليوتيدات جديدة في سلسلة الـ ARNm المتشكلة، بينما في وجود α-amanitine يثبت الأنزيم على الحلقة TL فيحافظ على شكلها ومنه عدم دمج نيكليوتيدات جديدة في الـ ARNm. ومنه يثبط α-amanitine نشاط ARN بوليميراز بتثبيته على الحلقة TL (منع دمج النيكليوتيدات الجديدة) ما يوقف عملية النسخ.",
              rule: {
                prompt: "وضّح تأثير α-amanitine بالاستغلال",
                keywords: ["بوليميراز", "نشاط", "الحلقه", "نسخ", "تركيز"],
                minHits: 3,
                forbidden: ["بسبب"]
              }
            },
            E: {
              points: 2.5,
              prompt: "اشرح آلية تأثير دواء ATAC مبرزا دور الأجسام المضادة (وثيقة 2)",
              bacPrompt:
                "اشرح آلية تأثير دواء (ATAC) على الخلايا السرطانية مبرزا دور الأجسام المضادة في ذلك، انطلاقا من استغلال معطيات الوثيقة (2).",
              bacPromptSource: "official",
              bacPromptPage: 7,
              bacPromptVerifiedAt: "2026-08-27",
              bacPromptNotes:
                "Relecture du PDF dzexams 2022 (couche texte inversée, reconstituée). Verbe officiel : اشرح. Question du الجزء الثاني (Sujet 2, Ex2). Le corrigé officiel (p. 17-18) : volumes de tumeurs (100→1000 mm³ ; 4 mg/kg) + complexe (anticorps-amanitine) + lysosomes.",
              placeholder: "في غياب الدواء يزداد حجم الورم... آلية التأثير: معقد من أجسام مضادة...",
              minLength: 90,
              modelAnswer:
                "في غياب الدواء يزداد حجم الورم السرطاني من أقل من 100 mm³ إلى أكثر من 1000 mm³ خلال 15 يوما، بينما في وجود الدواء بتركيز 4 mg/kg يتناقص حجم الورم حتى يختفي بعد 15 يوما: الدواء ATAC فعال في علاج السرطان بتركيز 4 mg/kg. آلية التأثير: الدواء ATAC معقد من جزيئات α-amanitine مع أجسام مضادة نوعية اتجاه البروتينات الغشائية للخلايا السرطانية، فيرتبط المعقد (بروتين غشائي — دواء) على البروتينات الغشائية للخلية السرطانية، وبعد دخوله هيولى الخلية السرطانية تعمل الأنزيمات الليزوزومية على تفكيك الجسم المضاد فتتحرر جزيئات α-amanitine التي تثبت على أنزيم ARN بوليميراز في النواة فتوقف عمله ومنه توقف عملية النسخ وتركيب البروتين في الخلايا السرطانية.",
              rule: {
                prompt: "اشرح آلية تأثير ATAC ودور الأجسام المضادة",
                keywords: ["amanitine", "جسم", "سرطانيه", "نسخ", "ورم"],
                minHits: 3,
                forbidden: [],
                causalOrder: ["amanitine", "نسخ"]
              }
            },
            W: {
              points: 1,
              prompt: "الخاتمة: النتيجة العلاجية لتوقف النسخ في الخلايا السرطانية",
              bacPrompt: "ما النتيجة العلاجية لتوقف النسخ في الخلايا السرطانية بواسطة الدواء ATAC؟",
              bacPromptSource: "reconstructed",
              bacPromptNotes:
                "Clôture issue du corrigé officiel (p. 18) : « يستهدف الدواء الخلايا السرطانية بواسطة الأجسام المضادة النوعية... يعمل هذا الدواء على وقف النسخ وتركيب البروتين في الخلايا السرطانية مما يوقف نمو الورم ما يؤدي إلى تراجعه ». Ce pôle isole pédagogiquement la clôture.",
              placeholder: "في الختام...",
              minLength: 40,
              modelAnswer:
                "في الختام، يستهدف الدواء الخلايا السرطانية بواسطة الأجسام المضادة النوعية اتجاه البروتينات الغشائية لها، ومن خلال ما يحتويه من جزيئات α-amanitine يوقف عملية النسخ وتركيب البروتين في الخلايا السرطانية مما يوقف نمو الورم ما يؤدي إلى تراجعه.",
              rule: {
                prompt: "اكتب خاتمة حول النتيجة العلاجية لـ ATAC",
                keywords: ["ورم", "نسخ", "جسم"],
                minHits: 2,
                forbidden: []
              }
            }
          }
        },
        {
          number: 3,
          ui: "text",
          label: "غاز الميثان في الأبقار والمكمل الغذائي (3-NOP)",
          max: 8,
          desc: "إنتاج غاز الميثان (CH₄) أثناء الاجتراء بتدخل أنزيم M (المرافق CoEM)، وتأثير المكمل الغذائي (3-NOP) التنافسي على الموقع الخاص للمرافق الإنزيمي",
          poles: {
            N: {
              points: 0.5,
              prompt: "تأطير المسعى: استغلال خصائص أنزيم M للتقليل من الانبعاثات",
              bacPrompt:
                "المشكل: كيف يمكن استغلال خصائص أنزيم M (وخلطائه) للتقليل من انبعاث غاز الميثان (CH₄) دون الإضرار بالتفاعلات الهضمية للأبقار؟",
              bacPromptSource: "reconstructed",
              bacPromptNotes:
                "Pas de question officielle autonome de type « حدد المشكل ». Reformulation pédagogique du préambule page 9 (lisible : « تحفز الأنزيمات العديد من التفاعلات الأيضية... فكيف يمكن استغلال خصائص هذه الأنزيمات للتقليل من الانبعاثات ؟ »).",
              placeholder: "صياغة المشكل العلمي...",
              minLength: 30,
              modelAnswer:
                "المشكل العلمي: كيف يمكن استغلال طبيعة ارتباط أنزيم M بمرافقه CoEM للتقليل من إنتاج وانبعاث غاز الميثان (CH₄) دون الإضرار بالتفاعلات الهضمية للأبقار؟",
              rule: {
                prompt: "حدد المشكل العلمي حول غاز الميثان",
                keywords: ["ميثان", "coem", "انزيم"],
                minHits: 2,
                forbidden: []
              }
            },
            S: {
              points: 2,
              prompt: "بيّن أن التفاعلات الهضمية تفضي إلى إنتاج غاز الميثان (شكلا 1 أ/ب)",
              bacPrompt:
                "بيّن أن التفاعلات الهضمية تفضي إلى إنتاج غاز الميثان أثناء الاجتراء باستغلال الأشكال (أ) و(ب) من الوثيقة (1).",
              bacPromptSource: "reconstructed",
              bacPromptNotes:
                "Consigne du الجزء الأول partiellement lisible dans la couche texte (OCR tronquée) ; reformulation pédagogique fidèle au corrigé officiel (p. 18) : « استغلال الشكل (أ)... استغلال الشكل (ب)... التفاعلات الهضمية لمادة السليلوز عند الأبقار تنتج عنها غازات منها غاز الميثان / أنزيم M يحوّل CO₂ إلى غاز الميثان ».",
              placeholder:
                "الشكل (أ): تنتج تفاعلات هضمية غازات... الشكل (ب): السليلوز → غلوكوز → CO₂ + H₂ → ميثان...",
              minLength: 80,
              modelAnswer:
                "الشكل (أ): عند استهلاك الأغذية النباتية على مستوى الكرش تنتج تفاعلات هضمية بتدخل بكتيريا تنتج غاز CO₂ وغاز الميثان. الشكل (ب): يهضم السليلوز إلى غلوكوز بتدخل أنزيمات السليليز، يتم هدم الغلوكوز من جهة إلى مواد أيضية (أحماض عضوية) يتم امتصاصها ومن جهة أخرى يتحول جزء منه إلى غاز CO₂ وفي وجود أنزيم M والهيدروجين ينتج غاز الميثان والماء. نستنتج: أنزيم M يحوّل CO₂ إلى غاز الميثان. (تتم التفاعلات الهضمية لمادة السليلوز عند الأبقار بتدخل أنزيمات الكائنات الدقيقة التي تعيش في الكرش ما يؤدي إلى إنتاج غاز الميثان بتدخل أنزيم M.)",
              rule: {
                prompt: "بيّن إنتاج غاز الميثان أثناء الاجتراء",
                keywords: ["ميثان", "سليلوز", "غلوكوز", "co"],
                minHits: 3,
                forbidden: []
              }
            },
            E: {
              points: 4,
              prompt: "وضّح تأثير 3-NOP على إنتاج وانبعاث CH₄ مع المصادقة (وثيقة 2)",
              bacPrompt:
                "وضّح تأثير المكمل الغذائي (3-NOP) على إنتاج وانبعاث غاز (CH₄) ما سمح بالمصادقة على الفرضية المقترحة مستغلا معطيات أشكال الوثيقة (2).",
              bacPromptSource: "official",
              bacPromptPage: 9,
              bacPromptVerifiedAt: "2026-08-27",
              bacPromptNotes:
                "Relecture du PDF dzexams 2022 (couche texte inversée, reconstituée). Verbe officiel : وضّح. Question du الجزء الثاني (Sujet 2, Ex3). Le corrigé officiel (p. 18-19) : figures A/B/C (330→230 g/jour ; CO₂+H₂ ; compétition CoEM/3-NOP sur Arg120/Tyr333).",
              placeholder:
                "الشكل (أ): في غياب 3-NOP... في وجوده... الشكل (ب): CO₂ + H₂... الشكل (ج): يتنافس 3-NOP مع CoEM...",
              minLength: 110,
              modelAnswer:
                "الشكل (أ): في غياب 3-NOP يترفع إنتاج الميثان من 130 غ/اليوم إلى 330 غ/اليوم ثم يثبت، بينما في وجود 3-NOP يتناقص إنتاج الميثان من 330 غ/اليوم إلى 230 غ/اليوم ثم يثبت: يقلل المكمل الغذائي 3-NOP من غاز الميثان. الشكل (ب): في وجود CO₂ وبإضافة الهيدروجين ينتج أنزيم M (مرافقه CoEM) غاز الميثان والماء: يستخدم أنزيم M مرافقه CoEM التي يربطها لتحويل CO₂ إلى غاز الميثان. الشكل (ج): يتنافس المكمل الغذائي 3-NOP مع المرافق الإنزيمي CoEM على تثبيت الموقع الخاص للرفاق الإنزيمي على أنزيم M؛ في غياب CoEM يكون الأنزيم غير وظيفي، وفي وجود CoEM يثبت على جزء من الأنزيم حيث تتشكل روابط بين الضمحل الييني وArg120 وTyr333 ما يجعله وظيفيا؛ وفي وجود CoEM و3-NOP يأخذ 3-NOP مكان CoEM فتتوقف التفاعلات فيصبح الأنزيم غير وظيفي. (يعمل 3-NOP على منع ارتباط CoEM ما يوقف نشاط أنزيم M، فينخفض إنتاج وانبعاث غاز الميثان مع الحفاظ على التفاعلات الأيضية الهضمية للأبقار : تتأكد الفرضية المقترحة.)",
              rule: {
                prompt: "وضّح تأثير 3-NOP مع المصادقة",
                keywords: ["nop", "coem", "ميثان", "تركيض"],
                minHits: 3,
                forbidden: [],
                causalOrder: ["nop", "coem"]
              }
            },
            W: {
              points: 1.5,
              prompt: "مخطط الآلية: التقليل من CH₄ دون الإضرار بالتفاعلات الهضمية",
              bacPrompt:
                "لخّص في مخطط الآلية التي تسمح بالتقليل من التلوث بغاز (CH₄) دون الإضرار بالتفاعلات الهضمية للأبقار.",
              bacPromptSource: "official",
              bacPromptPage: 10,
              bacPromptVerifiedAt: "2026-08-27",
              bacPromptNotes:
                "Relecture du PDF dzexams 2022 (couche texte inversée, reconstituée). Verbe officiel : لخّص في مخطط. Question du الجزء الثالث (Sujet 2, Ex3). Le corrigé officiel (p. 20) fournit le schéma (سليلوز → غلوكوز → CO₂/H₂ → Mth + 3-NOP/EM-CoEM).",
              placeholder: "سليلوز → غلوكوز → CO₂ + H₂ → ميثان؛ 3-NOP يمنع CoEM...",
              minLength: 0,
              modelAnswer:
                "عنوان المخطط: عمل المكمل الغذائي 3-NOP على أنزيم M. سليلوز → غلوكوز (أنزيمات السليليز للكائنات الدقيقة) → مواد أيضية ممتصة + CO₂ + H₂ → (أنزيم M + CoEM) → غاز الميثان. في وجود 3-NOP: معقد (3-NOP-EM) يمنع ارتباط CoEM-EM فلا يُنتج غاز الميثان مع الحفاظ على التفاعلات الهضمية.",
              rule: {
                prompt: "لخص في مخطط آلية تقليل غاز الميثان",
                keywords: ["مخطط", "ميثان", "غلوكوز"],
                minHits: 1,
                forbidden: [],
                schema: {
                  arrows: true,
                  title: "ميثان",
                  ordered: ["سليلوز", "غلوكوز", "ميثان"]
                }
              }
            }
          }
        }
      ]
    }
  ],
  stream: "se",
  calendarYear: "2022"
};

export { YEAR_2022_SE };
export default YEAR_2022_SE;
