/* ============================================================
   BAC SVT Algérie 2018 — archive pédagogique reconstruite
   ------------------------------------------------------------
   Aucune consigne n'est marquée official. Les champs de provenance
   restent attachés à chaque pôle. Chargé à la demande par le shell.
   ============================================================ */

const RECON = (notes) => ({
  bacPromptSource: "reconstructed",
  bacPromptNotes: notes
});

const YEAR_2018_SE = {
  id: "2018",
  stream: "se",
  calendarYear: "2018",
  label: "بكالوريا الجزائر دورة 2018 — شعبة علوم تجريبية",
  theme: "emerald",
  enabled: true,
  sujets: [
    {
      id: 1,
      pdf: null,
      pdfExternalUrl: "https://www.dzexams.com/ar/annales/RGZmd0lTRW0xNmZTRUFjR0F5QzMwZz09",
      pdfLocalUrl: "/subjects/SE/2018/sujet-1.pdf",
      pdfNote:
        "PDF non redistribué dans le dépôt. Page dzexams : https://www.dzexams.com/ar/annales/RGZmd0lTRW0xNmZTRUFjR0F5QzMwZz09. Thèmes relus sur la couche texte dzexams (OCR inversé, 2026-08-30). Wording reconstructed.",
      title: "الموضوع الأول",
      exercises: [
        {
          number: 1,
          ui: "text",
          label: "البروتينات الغشائية والرسالة العصبية",
          max: 5,
          desc: "بروتينات أغشية الخلايا العصبية المتدخلة في توليد وانتشار الرسالة العصبية وآلية دمجها على العصبون المحرك",
          poles: {
            N: {
              points: 1,
              prompt: "تأطير الإشكالية: كيف تؤمن البروتينات الغشائية نقل الرسالة العصبية ودمجها؟",
              bacPrompt: "كيف تتدخل البروتينات الغشائية في توليد وانتشار الرسالة العصبية ودمجها؟",
              ...RECON(
                "Couche texte dzexams bruitée ou inversée, relue le 2026-08-30. Wording reconstructed, non certifiable official. Pas de question autonome de cadrage pour N/W quand la consigne officielle est unique."
              ),
              placeholder: "صياغة المشكل العلمي...",
              minLength: 40,
              modelAnswer:
                "المشكل العلمي: كيف تتدخل مختلف البروتينات الغشائية في توليد وانتشار الرسالة العصبية ودمجها على مستوى العصبون المحرك؟",
              rule: {
                prompt: "تأطير الإشكالية: كيف تؤمن البروتينات الغشائية نقل الرسالة العصبية ودمجها؟",
                keywords: ["غشائي", "رساله", "عصبيه"],
                minHits: 2,
                forbidden: []
              }
            },
            S: {
              points: 1,
              prompt: "ذكر البروتينات الغشائية ودور كل منها",
              bacPrompt:
                "اذكر مختلف البروتينات الغشائية المتدخلة في توليد وانتشار الرسالة العصبية عبر سلسلة عصبونية محددا دور كل منها.",
              ...RECON(
                "Couche texte dzexams bruitée ou inversée, relue le 2026-08-30. Wording reconstructed, non certifiable official. Pas de question autonome de cadrage pour N/W quand la consigne officielle est unique."
              ),
              placeholder: "قنوات فولطية، مضخة، مستقبلات...",
              minLength: 40,
              modelAnswer:
                "القنوات الفولطية لـ Na⁺ وK⁺ تولد كمون العمل. مضخة Na⁺/K⁺ تحفظ كمون الراحة. قنوات الكالسيوم الفولطية تسمح بالتحرير. مستقبلات بعد مشبكية تولد PPSE أو PPSI.",
              rule: {
                prompt: "ذكر البروتينات الغشائية ودور كل منها",
                keywords: ["قنوات", "مضخه", "مستقبل"],
                minHits: 2,
                forbidden: ["بسبب"]
              }
            },
            E: {
              points: 2,
              prompt: "نص علمي حول دمج الرسائل على العصبون المحرك",
              bacPrompt: "اكتب نصا علميا تبيّن فيه آلية دمج الرسائل العصبية على مستوى العصبون المحرك.",
              ...RECON(
                "Couche texte dzexams bruitée ou inversée, relue le 2026-08-30. Wording reconstructed, non certifiable official. Pas de question autonome de cadrage pour N/W quand la consigne officielle est unique."
              ),
              placeholder: "تجميع فضائي وزماني...",
              minLength: 120,
              modelAnswer:
                "تصل إلى العصبون المحرك جهود بعد مشبكية تنبيهية وتثبيطية. يُدمج المحصّل تجميعا فضائيا وزمانيا على مستوى القطعة الابتدائية، فإذا بلغ العتبة تولد كمون عمل وانتشر نحو العضلة.",
              rule: {
                prompt: "نص علمي حول دمج الرسائل على العصبون المحرك",
                keywords: ["دمج", "تنبيهي", "تثبيطي", "عتبه", "محرك"],
                minHits: 3,
                forbidden: []
              }
            },
            W: {
              points: 1,
              prompt: "الخاتمة: شرط صدور الرسالة الحركية",
              bacPrompt: "ما شرط صدور رسالة عصبية حركية بعد الدمج؟",
              ...RECON(
                "Couche texte dzexams bruitée ou inversée, relue le 2026-08-30. Wording reconstructed, non certifiable official. Pas de question autonome de cadrage pour N/W quand la consigne officielle est unique."
              ),
              placeholder: "في الختام...",
              minLength: 40,
              modelAnswer: "في الختام، لا تصدر رسالة حركية إلا إذا بلغ محصّل الدمج عتبة توليد كمون العمل.",
              rule: {
                prompt: "الخاتمة: شرط صدور الرسالة الحركية",
                keywords: ["دمج", "عتبه", "حركيه"],
                minHits: 2,
                forbidden: []
              }
            }
          }
        },
        {
          number: 2,
          ui: "text",
          label: "مستقبل LDL وتصلب الشرايين",
          max: 7,
          desc: "دخول LDL عبر المستقبل الغشائي R، ودور الأحماض الأمينية في ثبات بنيته، وأثر طفرة الأليل على تصلب الشرايين",
          poles: {
            N: {
              points: 1,
              prompt: "تأطير الإشكالية: كيف تؤدي طفرة مستقبل LDL إلى تصلب الشرايين؟",
              bacPrompt: "كيف ترتبط بنية المستقبل الغشائي لـ LDL بالحالة الصحية وتصلب الشرايين؟",
              ...RECON(
                "Couche texte dzexams bruitée ou inversée, relue le 2026-08-30. Wording reconstructed, non certifiable official. Pas de question autonome de cadrage pour N/W quand la consigne officielle est unique."
              ),
              placeholder: "صياغة المشكل العلمي...",
              minLength: 40,
              modelAnswer:
                "المشكل العلمي: كيف تضمن أحماض أمينية محددة ثبات مستقبل LDL، وكيف تفقد الطفرة هذا التخصص فيرتفع الكولسترول؟",
              rule: {
                prompt: "تأطير الإشكالية: كيف تؤدي طفرة مستقبل LDL إلى تصلب الشرايين؟",
                keywords: ["LDL", "مستقبل", "طفره"],
                minHits: 2,
                forbidden: []
              }
            },
            S: {
              points: 2.5,
              prompt: "تحديد دور الأحماض الأمينية في ثبات المستقبل",
              bacPrompt:
                "حدد بدقة دور الأحماض الأمينية في كشف وثبات البنية الفراغية للمستقبل R باستغلال الشكلين أ و ب.",
              ...RECON(
                "Couche texte dzexams bruitée ou inversée, relue le 2026-08-30. Wording reconstructed, non certifiable official. Pas de question autonome de cadrage pour N/W quand la consigne officielle est unique."
              ),
              placeholder: "جسور، شحنات، تموضع...",
              minLength: 90,
              modelAnswer:
                "تمثل الوثيقة تتابع الأحماض الأمينية في المستقبل LDL بدلالة الموضع عند السليم والمصاب. نلاحظ تموضعا دقيقا لأحماض مشحونة وكبريتية عند السليم، بينما يختل التموضع عند المصاب، ومنه نستنتج أن الروابط تثبّت البنية الفراغية اللازمة للتعرف على LDL.",
              rule: {
                prompt: "تحديد دور الأحماض الأمينية في ثبات المستقبل",
                keywords: ["احماض", "بنيه", "مستقبل", "LDL"],
                minHits: 2,
                forbidden: ["بسبب"],
                document: {
                  kind: "table",
                  axes: ["حمض", "موضع"],
                  comparisons: [["سليم", "مصاب"]],
                  cells: [["LDL", "مستقبل"]],
                  values: [],
                  strictValues: false
                }
              }
            },
            E: {
              points: 2.5,
              prompt: "مناقشة العلاقة بين الطفرة وتصلب الشرايين",
              bacPrompt:
                "ناقش العلاقة بين بنية المستقبل الغشائي لـ LDL والحالة الصحية للشخص السليم مقارنة بالمصاب.",
              ...RECON(
                "Couche texte dzexams bruitée ou inversée, relue le 2026-08-30. Wording reconstructed, non certifiable official. Pas de question autonome de cadrage pour N/W quand la consigne officielle est unique."
              ),
              placeholder: "أليل R1 وR2، كولسترول...",
              minLength: 110,
              modelAnswer:
                "عند السليم يثبت LDL على مستقبل وظيفي فيُقتنص. عند المصاب تغيّر الطفرة حمضا أمينيا فيفقد المستقبل شكله فلا يدخل LDL، فيرتفع الكولسترول في الدم ويتصلب الشريان.",
              rule: {
                prompt: "مناقشة العلاقة بين الطفرة وتصلب الشرايين",
                keywords: ["طفره", "كولسترول", "مستقبل", "شرايين", "LDL"],
                minHits: 3,
                forbidden: []
              }
            },
            W: {
              points: 1,
              prompt: "الخاتمة: أصل المرض",
              bacPrompt: "ما أصل تصلب الشرايين في هذه الدراسة؟",
              ...RECON(
                "Couche texte dzexams bruitée ou inversée, relue le 2026-08-30. Wording reconstructed, non certifiable official. Pas de question autonome de cadrage pour N/W quand la consigne officielle est unique."
              ),
              placeholder: "في الختام...",
              minLength: 40,
              modelAnswer: "في الختام، أصل المرض طفرة في مورثة المستقبل تمنع اقتناص LDL فيتراكم الكولسترول.",
              rule: {
                prompt: "الخاتمة: أصل المرض",
                keywords: ["طفره", "LDL", "كولسترول"],
                minHits: 2,
                forbidden: []
              }
            }
          }
        },
        {
          number: 3,
          ui: "text",
          label: "العقم والنطاف وCoenzyme Q10",
          max: 8,
          desc: "علاقة نقص حركة النطاف بتحول الطاقة، ودور Coenzyme Q10 في السلسلة التنفسية",
          poles: {
            N: {
              points: 0.5,
              prompt: "اقتراح فرضية حول سبب قلة حركة النطاف",
              bacPrompt: "اقترح فرضية تفسر قلة حركة النطاف عند الشخص س.",
              ...RECON(
                "Couche texte dzexams bruitée ou inversée, relue le 2026-08-30. Wording reconstructed, non certifiable official. Pas de question autonome de cadrage pour N/W quand la consigne officielle est unique."
              ),
              placeholder: "الفرضية...",
              minLength: 30,
              modelAnswer:
                "الفرضية: يعود نقص الحركة إلى خلل في أكسدة النواقل المرجعة فلا يتشكل ATP الكافي لحركة النطفة.",
              rule: {
                prompt: "اقتراح فرضية حول سبب قلة حركة النطاف",
                keywords: ["فرضيه", "نطاف", "ATP"],
                minHits: 2,
                forbidden: []
              }
            },
            S: {
              points: 2,
              prompt: "تحليل استهلاك O2 في معلق النطاف",
              bacPrompt: "حلّل نتائج تغيرات نسبة O2 في المعلقين بعد إضافة الناقل TH2.",
              ...RECON(
                "Couche texte dzexams bruitée ou inversée, relue le 2026-08-30. Wording reconstructed, non certifiable official. Pas de question autonome de cadrage pour N/W quand la consigne officielle est unique."
              ),
              placeholder: "معلق سليم ومعلق الشخص س...",
              minLength: 60,
              modelAnswer:
                "تمثل الوثيقة نسبة الأكسجين بدلالة الزمن في المعلق السليم والمصاب. نلاحظ عند السليم انخفاضا واضحا في O2 بعد إضافة TH2، بينما يبقى الانخفاض ضعيفا عند المصاب، ومنه نستنتج ضعفا في أكسدة النواقل عند المصاب.",
              rule: {
                prompt: "تحليل استهلاك O2 في معلق النطاف",
                keywords: ["اكسجين", "نطاف", "ناقل"],
                minHits: 2,
                forbidden: ["بسبب"],
                document: {
                  kind: "curve",
                  axes: ["اكسجين", "زمن"],
                  comparisons: [["سليم", "مصاب"]],
                  trends: [{ about: "سليم", expect: ["انخفاض", "اكسجين"] }],
                  values: [],
                  strictValues: false
                }
              }
            },
            E: {
              points: 4,
              prompt: "تفسير تأثير Coenzyme Q10",
              bacPrompt:
                "فسّر آلية تأثير الدواء المكون من Coenzyme Q10 على حركة النطاف مع المصادقة على الفرضية.",
              ...RECON(
                "Couche texte dzexams bruitée ou inversée, relue le 2026-08-30. Wording reconstructed, non certifiable official. Pas de question autonome de cadrage pour N/W quand la consigne officielle est unique."
              ),
              placeholder: "سلسلة تنفسية، ATP، حركة...",
              minLength: 110,
              modelAnswer:
                "يعيد Coenzyme Q10 نقل الإلكترونات في السلسلة التنفسية فيستأنف تدرج البروتونات ويتشكل ATP فتعود حركة النطاف، فتتأكد فرضية الخلل الطاقوي.",
              rule: {
                prompt: "تفسير تأثير Coenzyme Q10",
                keywords: ["Q10", "سلسله", "ATP", "نطاف", "الكترون"],
                minHits: 3,
                forbidden: []
              }
            },
            W: {
              points: 1.5,
              prompt: "مخطط العلاقة أيض-O2-وظائف حيوية",
              bacPrompt: "اشرح العلاقة بين هدم مادة الأيض واستهلاك O2 والقيام بالوظائف الحيوية.",
              ...RECON(
                "Couche texte dzexams bruitée ou inversée, relue le 2026-08-30. Wording reconstructed, non certifiable official. Pas de question autonome de cadrage pour N/W quand la consigne officielle est unique."
              ),
              placeholder: "فركتوز → نواقل → O2 → ATP → حركة...",
              minLength: 40,
              modelAnswer:
                "عنوان المخطط: طاقة النطفة. فركتوز → نواقل مرجعة → سلسلة تنفسية تستهلك O2 → ATP → نطاف. في وجود Q10 تُستأنف السلسلة.",
              rule: {
                prompt: "مخطط العلاقة أيض-O2-وظائف حيوية",
                keywords: ["مخطط", "ATP", "نطاف"],
                minHits: 2,
                forbidden: [],
                schema: { arrows: true, title: "ATP", ordered: ["فركتوز", "ATP", "نطاف"] }
              }
            }
          }
        }
      ]
    },
    {
      id: 2,
      pdf: null,
      pdfExternalUrl: "https://www.dzexams.com/ar/annales/RGZmd0lTRW0xNmZTRUFjR0F5QzMwZz09",
      pdfLocalUrl: "/subjects/SE/2018/sujet-2.pdf",
      pdfNote:
        "PDF non redistribué dans le dépôt. Page dzexams : https://www.dzexams.com/ar/annales/RGZmd0lTRW0xNmZTRUFjR0F5QzMwZz09. Thèmes relus sur la couche texte dzexams (OCR inversé, 2026-08-30). Wording reconstructed.",
      title: "الموضوع الثاني",
      exercises: [
        {
          number: 1,
          ui: "text",
          label: "نظام الزمر الدموية ABO",
          max: 5,
          desc: "المؤشرات الغشائية لنظام ABO على كريات الدم الحمراء ودور الأليلات IA وIB وi",
          poles: {
            N: {
              points: 1,
              prompt: "تأطير الإشكالية: كيف يظهر النمط الظاهري للزمرة؟",
              bacPrompt: "كيف تفسر اختلاف المؤشرات الغشائية لنظام ABO بين الزمر؟",
              ...RECON(
                "Couche texte dzexams bruitée ou inversée, relue le 2026-08-30. Wording reconstructed, non certifiable official. Pas de question autonome de cadrage pour N/W quand la consigne officielle est unique."
              ),
              placeholder: "صياغة المشكل العلمي...",
              minLength: 40,
              modelAnswer:
                "المشكل العلمي: كيف تحدد الأليلات IA وIB وi نوع المستضد الغشائي على كرية الدم الحمراء؟",
              rule: {
                prompt: "تأطير الإشكالية: كيف يظهر النمط الظاهري للزمرة؟",
                keywords: ["زمره", "مستضد", "اليل"],
                minHits: 2,
                forbidden: []
              }
            },
            S: {
              points: 1,
              prompt: "المقارنة بين الزمر والمؤشرات",
              bacPrompt: "قارن بين المؤشرات الغشائية المميزة لكل زمرة دموية.",
              ...RECON(
                "Couche texte dzexams bruitée ou inversée, relue le 2026-08-30. Wording reconstructed, non certifiable official. Pas de question autonome de cadrage pour N/W quand la consigne officielle est unique."
              ),
              placeholder: "مستضد H، A، B...",
              minLength: 40,
              modelAnswer:
                "الزمرة O تحمل مستضد H فقط، والزمرة A تضيف غالاكتوز أمين على H، والزمرة B تضيف غالاكتوز، والزمرة AB تحمل المستضدين A وB.",
              rule: {
                prompt: "المقارنة بين الزمر والمؤشرات",
                keywords: ["مستضد", "زمره", "غشاء"],
                minHits: 2,
                forbidden: ["بسبب"]
              }
            },
            E: {
              points: 2,
              prompt: "نص علمي حول وراثة الزمر",
              bacPrompt: "اكتب نصا علميا تشرح فيه كيف يتحكم النمط الوراثي في النمط الظاهري لنظام ABO.",
              ...RECON(
                "Couche texte dzexams bruitée ou inversée, relue le 2026-08-30. Wording reconstructed, non certifiable official. Pas de question autonome de cadrage pour N/W quand la consigne officielle est unique."
              ),
              placeholder: "سيادة، غياب سيادة...",
              minLength: 120,
              modelAnswer:
                "يشرف الصبغي 9 على أليلات IA وIB السائدتين بالنسبة إلى i المتنحي، وبين IA وIB غياب سيادة. يركّب كل أليل سائد إنزيما يضيف سكرا نوعيا على المستضد H فيظهر النمط الظاهري للزمرة.",
              rule: {
                prompt: "نص علمي حول وراثة الزمر",
                keywords: ["اليل", "سياده", "مستضد", "زمره", "نمط"],
                minHits: 3,
                forbidden: []
              }
            },
            W: {
              points: 1,
              prompt: "الخاتمة: أهمية معرفة الزمرة",
              bacPrompt: "ما أهمية معرفة مؤشرات الزمرة عند نقل الدم؟",
              ...RECON(
                "Couche texte dzexams bruitée ou inversée, relue le 2026-08-30. Wording reconstructed, non certifiable official. Pas de question autonome de cadrage pour N/W quand la consigne officielle est unique."
              ),
              placeholder: "في الختام...",
              minLength: 40,
              modelAnswer:
                "في الختام، تحدد المؤشرات الغشائية التوافق عند النقل، فكل مستضد غريب يُرفض بالأجسام المضادة.",
              rule: {
                prompt: "الخاتمة: أهمية معرفة الزمرة",
                keywords: ["زمره", "مستضد", "نقل"],
                minHits: 2,
                forbidden: []
              }
            }
          }
        },
        {
          number: 2,
          ui: "text",
          label: "اللاكتاز وعدم تحمل اللاكتوز",
          max: 7,
          desc: "نشاط إنزيم اللاكتاز وتأثير pH والحرارة والثيولاكتوز، وعلاقة نقصه بأعراض عدم التحمل",
          poles: {
            N: {
              points: 1,
              prompt: "تأطير الإشكالية: ما أصل عدم تحمل اللاكتوز؟",
              bacPrompt: "كيف يرتبط نشاط اللاكتاز بأعراض عدم تحمل اللاكتوز؟",
              ...RECON(
                "Couche texte dzexams bruitée ou inversée, relue le 2026-08-30. Wording reconstructed, non certifiable official. Pas de question autonome de cadrage pour N/W quand la consigne officielle est unique."
              ),
              placeholder: "صياغة المشكل العلمي...",
              minLength: 40,
              modelAnswer: "المشكل العلمي: كيف يؤثر نقص اللاكتاز على هضم اللاكتوز فتظهر أعراض عدم التحمل؟",
              rule: {
                prompt: "تأطير الإشكالية: ما أصل عدم تحمل اللاكتوز؟",
                keywords: ["لاكتاز", "لاكتوز", "تحمل"],
                minHits: 2,
                forbidden: []
              }
            },
            S: {
              points: 2.5,
              prompt: "تحليل أثر pH والحرارة على السرعة الابتدائية",
              bacPrompt:
                "أنشئ منحنى تغير السرعة الابتدائية بدلالة pH الوسط مفسرا تأثيرها، ثم استنتج أثر الحرارة.",
              ...RECON(
                "Couche texte dzexams bruitée ou inversée, relue le 2026-08-30. Wording reconstructed, non certifiable official. Pas de question autonome de cadrage pour N/W quand la consigne officielle est unique."
              ),
              placeholder: "pH أمثل، حرارة منخفضة أو مرتفعة...",
              minLength: 90,
              modelAnswer:
                "تمثل الوثيقة تغير السرعة بدلالة pH. نلاحظ سرعة أعظمية عند pH قريب من المعتدل وحرارة متوسطة، بينما تنعدم عند الطرف، ومنه نستنتج أن اللاكتاز يعمل في ظروف المعي الدقيق.",
              rule: {
                prompt: "تحليل أثر pH والحرارة على السرعة الابتدائية",
                keywords: ["سرعه", "لاكتاز", "حراره"],
                minHits: 2,
                forbidden: ["بسبب"],
                document: {
                  kind: "curve",
                  axes: ["سرعه", "PH"],
                  comparisons: [["معتدل", "طرف"]],
                  trends: [{ about: "معتدل", expect: ["اعظميه", "سرعه"] }],
                  values: [],
                  strictValues: false
                }
              }
            },
            E: {
              points: 2.5,
              prompt: "تفسير أعراض عدم التحمل",
              bacPrompt: "اشرح سبب ظهور أعراض عدم تحمل اللاكتوز عند المصاب وعدم ظهورها عند السليم.",
              ...RECON(
                "Couche texte dzexams bruitée ou inversée, relue le 2026-08-30. Wording reconstructed, non certifiable official. Pas de question autonome de cadrage pour N/W quand la consigne officielle est unique."
              ),
              placeholder: "تخمرات في المعي الغليظ...",
              minLength: 110,
              modelAnswer:
                "عند السليم يهضم اللاكتاز اللاكتوز في المعي الدقيق فلا يصل إلى الغليظ. عند المصاب ينقص اللاكتاز فيصل اللاكتوز إلى المعي الغليظ حيث تخمره البكتيريا فتتكون غازات وأحماض مسببة الانتفاخ والآلام.",
              rule: {
                prompt: "تفسير أعراض عدم التحمل",
                keywords: ["لاكتاز", "تخمر", "معي", "غازات", "مصاب"],
                minHits: 3,
                forbidden: []
              }
            },
            W: {
              points: 1,
              prompt: "الخاتمة: مفهوم الإنزيم",
              bacPrompt: "ما المفهوم الدقيق للإنزيم انطلاقا من هذه الدراسة؟",
              ...RECON(
                "Thème recoupé sur des sources secondaires et le programme 3AS, sans relecture visuelle d un PDF ministériel dans cette session. Wording reconstructed, non certifiable official. À confronter au PDF dzexams avant toute utilisation comme énoncé."
              ),
              placeholder: "في الختام...",
              minLength: 40,
              modelAnswer:
                "في الختام، الإنزيم وسيط حيوي نوعي يسرّع التفاعل في ظروف ملائمة دون أن يُستهلك، ونقصه يعطل الهضم.",
              rule: {
                prompt: "الخاتمة: مفهوم الإنزيم",
                keywords: ["انزيم", "نوعي", "تفاعل"],
                minHits: 2,
                forbidden: []
              }
            }
          }
        },
        {
          number: 3,
          ui: "text",
          label: "Cyanobacter وتحويل الطاقة الضوئية",
          max: 8,
          desc: "قدرة بكتيريا Cyanobacter على تحويل الطاقة الضوئية إلى طاقة كيميائية كامنة مع طرح O2",
          poles: {
            N: {
              points: 0.5,
              prompt: "اقتراح فرضية حول مصدر O2 المطروح",
              bacPrompt: "اقترح فرضية فيما يخص مصدر وآلية طرح ثنائي الأكسجين عند Cyanobacter.",
              ...RECON(
                "Couche texte dzexams bruitée ou inversée, relue le 2026-08-30. Wording reconstructed, non certifiable official. Pas de question autonome de cadrage pour N/W quand la consigne officielle est unique."
              ),
              placeholder: "الفرضية...",
              minLength: 30,
              modelAnswer: "الفرضية: ينتج O2 من أكسدة الماء خلال المرحلة الكيميائية الضوئية بوجود الضوء.",
              rule: {
                prompt: "اقتراح فرضية حول مصدر O2 المطروح",
                keywords: ["فرضيه", "اكسجين", "ضوء"],
                minHits: 2,
                forbidden: []
              }
            },
            S: {
              points: 2,
              prompt: "استغلال ارتفاع O2 في الضوء",
              bacPrompt: "استغل ارتفاع نسبة O2 عند تعريض Cyanobacter للضوء.",
              ...RECON(
                "Couche texte dzexams bruitée ou inversée, relue le 2026-08-30. Wording reconstructed, non certifiable official. Pas de question autonome de cadrage pour N/W quand la consigne officielle est unique."
              ),
              placeholder: "في الضوء يرتفع O2...",
              minLength: 60,
              modelAnswer:
                "تمثل الوثيقة نسبة الأكسجين بدلالة الزمن في الضوء والظلام. نلاحظ ارتفاع O2 في الضوء وعدم ارتفاعه في الظلام، ومنه نستنتج أن الضوء ضروري لطرح الأكسجين.",
              rule: {
                prompt: "استغلال ارتفاع O2 في الضوء",
                keywords: ["اكسجين", "ضوء", "ظلام"],
                minHits: 2,
                forbidden: ["بسبب"],
                document: {
                  kind: "curve",
                  axes: ["اكسجين", "زمن"],
                  comparisons: [["ضوء", "ظلام"]],
                  trends: [{ about: "ضوء", expect: ["ارتفاع", "اكسجين"] }],
                  values: [],
                  strictValues: false
                }
              }
            },
            E: {
              points: 4,
              prompt: "تفسير آلية طرح O2",
              bacPrompt: "فسّر الآلية التي تسمح لـ Cyanobacter بطرح O2 وتحويل الطاقة الضوئية.",
              ...RECON(
                "Couche texte dzexams bruitée ou inversée, relue le 2026-08-30. Wording reconstructed, non certifiable official. Pas de question autonome de cadrage pour N/W quand la consigne officielle est unique."
              ),
              placeholder: "فوتونات، أكسدة الماء، نواقل...",
              minLength: 110,
              modelAnswer:
                "تمتص الأنظمة الضوئية الفوتونات فتتأكسد جزيئة الماء وينطلق O2 وتتحرر إلكترونات تختزل النواقل، فتتحول الطاقة الضوئية إلى طاقة كيميائية كامنة. تتأكد الفرضية.",
              rule: {
                prompt: "تفسير آلية طرح O2",
                keywords: ["ضوء", "ماء", "اكسجين", "الكترون", "طاقه"],
                minHits: 3,
                forbidden: []
              }
            },
            W: {
              points: 1.5,
              prompt: "مخطط تحويل الطاقة الضوئية",
              bacPrompt: "لخّص في مخطط تحويل الطاقة الضوئية إلى طاقة كيميائية كامنة مع طرح O2.",
              ...RECON(
                "Couche texte dzexams bruitée ou inversée, relue le 2026-08-30. Wording reconstructed, non certifiable official. Pas de question autonome de cadrage pour N/W quand la consigne officielle est unique."
              ),
              placeholder: "ضوء → ماء → اكسجين",
              minLength: 40,
              modelAnswer: "عنوان المخطط: ضوء. ضوء → ماء → اكسجين.",
              rule: {
                prompt: "مخطط تحويل الطاقة الضوئية",
                keywords: ["مخطط", "ضوء", "اكسجين"],
                minHits: 2,
                forbidden: [],
                schema: { arrows: true, title: "ضوء", ordered: ["ضوء", "ماء", "اكسجين"] }
              }
            }
          }
        }
      ]
    }
  ]
};

export { YEAR_2018_SE };
export default YEAR_2018_SE;
