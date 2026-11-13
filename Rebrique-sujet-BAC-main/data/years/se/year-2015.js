/* ============================================================
   BAC SVT Algérie 2015 — archive pédagogique reconstruite
   ------------------------------------------------------------
   Aucune consigne n'est marquée official. Les champs de provenance
   restent attachés à chaque pôle. Chargé à la demande par le shell.
   ============================================================ */

const RECON = (notes) => ({
  bacPromptSource: "reconstructed",
  bacPromptNotes: notes
});

const YEAR_2015_SE = {
  id: "2015",
  stream: "se",
  calendarYear: "2015",
  label: "بكالوريا الجزائر دورة 2015 — شعبة علوم تجريبية",
  theme: "indigo",
  enabled: true,
  sujets: [
    {
      id: 1,
      pdf: null,
      pdfExternalUrl:
        "https://www.dzexams.com/uploads/sujets/officiels/bac/2015/dzexams-bac-sciences-5906014.pdf",
      pdfLocalUrl: "/subjects/SE/2015/sujet-1.pdf",
      pdfNote:
        "PDF non redistribué dans le dépôt. Page dzexams : https://www.dzexams.com/ar/annales/aTlRWGREbDN3Qit2cVdRaHNmK0FYQT09. 2015 : PDF dzexams دون طبقة نص قابلة للشهادة هنا. Thèmes pédagogiques reconstruits.",
      title: "الموضوع الأول",
      exercises: [
        {
          number: 1,
          ui: "text",
          label: "الترجمة في الهيولى",
          max: 5,
          desc: "العناصر المتدخلة في تركيب السلسلة البيبتيدية",
          poles: {
            N: {
              points: 1,
              prompt: "تأطير الإشكالية حول: الترجمة في الهيولى",
              bacPrompt: "ما المشكل العلمي المرتبط بـ الترجمة في الهيولى؟",
              ...RECON(
                "Thème recoupé sur des sources secondaires et le programme 3AS, sans relecture visuelle d un PDF ministériel dans cette session. Wording reconstructed, non certifiable official. À confronter au PDF dzexams avant toute utilisation comme énoncé."
              ),
              placeholder: "صياغة المشكل العلمي...",
              minLength: 40,
              modelAnswer:
                "المشكل العلمي: كيف تتدخل الآليات المرتبطة بـ الترجمة في الهيولى في الظاهرة المدروسة؟",
              rule: {
                prompt: "تأطير الإشكالية حول: الترجمة في الهيولى",
                keywords: ["هيولي", "ريبوزوم"],
                minHits: 2,
                forbidden: []
              }
            },
            S: {
              points: 1,
              prompt: "استغلال الوثيقة المتعلقة بـ الترجمة في الهيولى",
              bacPrompt: "حلّل أو استخرج من الوثيقة المعطيات المرتبطة بـ الترجمة في الهيولى.",
              ...RECON(
                "Thème recoupé sur des sources secondaires et le programme 3AS, sans relecture visuelle d un PDF ministériel dans cette session. Wording reconstructed, non certifiable official. À confronter au PDF dzexams avant toute utilisation comme énoncé."
              ),
              placeholder: "نلاحظ... بينما... ومنه نستنتج...",
              minLength: 40,
              modelAnswer:
                "تمثل الوثيقة تغيرات هيولي بدلالة الزمن مقارنة بـ ريبوزوم. نلاحظ تغيرا واضحا في هيولي مقارنة بالشاهد، ومنه نستنتج علاقة مباشرة مع ريبوزوم.",
              rule: {
                prompt: "استغلال الوثيقة المتعلقة بـ الترجمة في الهيولى",
                keywords: ["هيولي", "ريبوزوم", "نلاحظ"],
                minHits: 2,
                forbidden: ["بسبب"],
                document: {
                  kind: "curve",
                  axes: ["هيولي", "زمن"],
                  comparisons: [["هيولي", "ريبوزوم"]],
                  trends: [{ about: "هيولي", expect: ["هيولي", "ريبوزوم"] }],
                  values: [],
                  strictValues: false
                }
              }
            },
            E: {
              points: 2,
              prompt: "تفسير الآلية المرتبطة بـ الترجمة في الهيولى",
              bacPrompt: "اشرح الآلية التي تفسر الترجمة في الهيولى انطلاقا من الوثيقة ومعلوماتك.",
              ...RECON(
                "Thème recoupé sur des sources secondaires et le programme 3AS, sans relecture visuelle d un PDF ministériel dans cette session. Wording reconstructed, non certifiable official. À confronter au PDF dzexams avant toute utilisation comme énoncé."
              ),
              placeholder: "يعود ذلك إلى...",
              minLength: 120,
              modelAnswer:
                "يعود ذلك إلى تدخل هيولي وريبوزوم عبر آلية دقيقة تؤدي إلى ARNt، فتتغير الوظيفة النهائية للظاهرة المدروسة.",
              rule: {
                prompt: "تفسير الآلية المرتبطة بـ الترجمة في الهيولى",
                keywords: ["هيولي", "ريبوزوم", "ARNt"],
                minHits: 3,
                forbidden: []
              }
            },
            W: {
              points: 1,
              prompt: "الخاتمة التركيبية حول الترجمة في الهيولى",
              bacPrompt: "لخّص النتيجة النهائية المرتبطة بـ الترجمة في الهيولى.",
              ...RECON(
                "Thème recoupé sur des sources secondaires et le programme 3AS, sans relecture visuelle d un PDF ministériel dans cette session. Wording reconstructed, non certifiable official. À confronter au PDF dzexams avant toute utilisation comme énoncé."
              ),
              placeholder: "في الختام...",
              minLength: 40,
              modelAnswer: "في الختام، ترتبط النتيجة النهائية بـ هيولي وريبوزوم فتُغلق الظاهرة على ARNt.",
              rule: {
                prompt: "الخاتمة التركيبية حول الترجمة في الهيولى",
                keywords: ["هيولي", "ARNt", "ختام"],
                minHits: 2,
                forbidden: []
              }
            }
          }
        },
        {
          number: 2,
          ui: "text",
          label: "الكربوكسي بيبتيداز والموقع الفعال",
          max: 7,
          desc: "علاقة البنية الفراغية للإنزيم بمادة التفاعل",
          poles: {
            N: {
              points: 1,
              prompt: "تأطير الإشكالية حول: الكربوكسي بيبتيداز والموقع الفعال",
              bacPrompt: "ما المشكل العلمي المرتبط بـ الكربوكسي بيبتيداز والموقع الفعال؟",
              ...RECON(
                "Thème recoupé sur des sources secondaires et le programme 3AS, sans relecture visuelle d un PDF ministériel dans cette session. Wording reconstructed, non certifiable official. À confronter au PDF dzexams avant toute utilisation comme énoncé."
              ),
              placeholder: "صياغة المشكل العلمي...",
              minLength: 40,
              modelAnswer:
                "المشكل العلمي: كيف تتدخل الآليات المرتبطة بـ الكربوكسي بيبتيداز والموقع الفعال في الظاهرة المدروسة؟",
              rule: {
                prompt: "تأطير الإشكالية حول: الكربوكسي بيبتيداز والموقع الفعال",
                keywords: ["بيبتيداز", "موقع"],
                minHits: 2,
                forbidden: []
              }
            },
            S: {
              points: 2.5,
              prompt: "استغلال الوثيقة المتعلقة بـ الكربوكسي بيبتيداز والموقع الفعال",
              bacPrompt: "حلّل أو استخرج من الوثيقة المعطيات المرتبطة بـ الكربوكسي بيبتيداز والموقع الفعال.",
              ...RECON(
                "Thème recoupé sur des sources secondaires et le programme 3AS, sans relecture visuelle d un PDF ministériel dans cette session. Wording reconstructed, non certifiable official. À confronter au PDF dzexams avant toute utilisation comme énoncé."
              ),
              placeholder: "نلاحظ... بينما... ومنه نستنتج...",
              minLength: 90,
              modelAnswer:
                "تمثل الوثيقة تغيرات بيبتيداز بدلالة الزمن مقارنة بـ موقع. نلاحظ تغيرا واضحا في بيبتيداز مقارنة بالشاهد، ومنه نستنتج علاقة مباشرة مع موقع.",
              rule: {
                prompt: "استغلال الوثيقة المتعلقة بـ الكربوكسي بيبتيداز والموقع الفعال",
                keywords: ["بيبتيداز", "موقع", "نلاحظ"],
                minHits: 2,
                forbidden: ["بسبب"],
                document: {
                  kind: "curve",
                  axes: ["بيبتيداز", "زمن"],
                  comparisons: [["بيبتيداز", "موقع"]],
                  trends: [{ about: "بيبتيداز", expect: ["بيبتيداز", "موقع"] }],
                  values: [],
                  strictValues: false
                }
              }
            },
            E: {
              points: 2.5,
              prompt: "تفسير الآلية المرتبطة بـ الكربوكسي بيبتيداز والموقع الفعال",
              bacPrompt:
                "اشرح الآلية التي تفسر الكربوكسي بيبتيداز والموقع الفعال انطلاقا من الوثيقة ومعلوماتك.",
              ...RECON(
                "Thème recoupé sur des sources secondaires et le programme 3AS, sans relecture visuelle d un PDF ministériel dans cette session. Wording reconstructed, non certifiable official. À confronter au PDF dzexams avant toute utilisation comme énoncé."
              ),
              placeholder: "يعود ذلك إلى...",
              minLength: 110,
              modelAnswer:
                "يعود ذلك إلى تدخل بيبتيداز وموقع عبر آلية دقيقة تؤدي إلى فعال، فتتغير الوظيفة النهائية للظاهرة المدروسة.",
              rule: {
                prompt: "تفسير الآلية المرتبطة بـ الكربوكسي بيبتيداز والموقع الفعال",
                keywords: ["بيبتيداز", "موقع", "فعال"],
                minHits: 3,
                forbidden: []
              }
            },
            W: {
              points: 1,
              prompt: "الخاتمة التركيبية حول الكربوكسي بيبتيداز والموقع الفعال",
              bacPrompt: "لخّص النتيجة النهائية المرتبطة بـ الكربوكسي بيبتيداز والموقع الفعال.",
              ...RECON(
                "Thème recoupé sur des sources secondaires et le programme 3AS, sans relecture visuelle d un PDF ministériel dans cette session. Wording reconstructed, non certifiable official. À confronter au PDF dzexams avant toute utilisation comme énoncé."
              ),
              placeholder: "في الختام...",
              minLength: 40,
              modelAnswer: "في الختام، ترتبط النتيجة النهائية بـ بيبتيداز وموقع فتُغلق الظاهرة على فعال.",
              rule: {
                prompt: "الخاتمة التركيبية حول الكربوكسي بيبتيداز والموقع الفعال",
                keywords: ["بيبتيداز", "فعال", "ختام"],
                minHits: 2,
                forbidden: []
              }
            }
          }
        },
        {
          number: 3,
          ui: "text",
          label: "الاستجابة ضد VIH",
          max: 8,
          desc: "حدود المراقبة المناعية بعد إصابة LT4",
          poles: {
            N: {
              points: 0.5,
              prompt: "تأطير الإشكالية حول: الاستجابة ضد VIH",
              bacPrompt: "ما المشكل العلمي المرتبط بـ الاستجابة ضد VIH؟",
              ...RECON(
                "Thème recoupé sur des sources secondaires et le programme 3AS, sans relecture visuelle d un PDF ministériel dans cette session. Wording reconstructed, non certifiable official. À confronter au PDF dzexams avant toute utilisation comme énoncé."
              ),
              placeholder: "صياغة المشكل العلمي...",
              minLength: 30,
              modelAnswer:
                "المشكل العلمي: كيف تتدخل الآليات المرتبطة بـ الاستجابة ضد VIH في الظاهرة المدروسة؟",
              rule: {
                prompt: "تأطير الإشكالية حول: الاستجابة ضد VIH",
                keywords: ["VIH", "LT4"],
                minHits: 2,
                forbidden: []
              }
            },
            S: {
              points: 2,
              prompt: "استغلال الوثيقة المتعلقة بـ الاستجابة ضد VIH",
              bacPrompt: "حلّل أو استخرج من الوثيقة المعطيات المرتبطة بـ الاستجابة ضد VIH.",
              ...RECON(
                "Thème recoupé sur des sources secondaires et le programme 3AS, sans relecture visuelle d un PDF ministériel dans cette session. Wording reconstructed, non certifiable official. À confronter au PDF dzexams avant toute utilisation comme énoncé."
              ),
              placeholder: "نلاحظ... بينما... ومنه نستنتج...",
              minLength: 60,
              modelAnswer:
                "تمثل الوثيقة تغيرات VIH بدلالة الزمن مقارنة بـ LT4. نلاحظ تغيرا واضحا في VIH مقارنة بالشاهد، ومنه نستنتج علاقة مباشرة مع LT4.",
              rule: {
                prompt: "استغلال الوثيقة المتعلقة بـ الاستجابة ضد VIH",
                keywords: ["VIH", "LT4", "نلاحظ"],
                minHits: 2,
                forbidden: ["بسبب"],
                document: {
                  kind: "curve",
                  axes: ["VIH", "زمن"],
                  comparisons: [["VIH", "LT4"]],
                  trends: [{ about: "VIH", expect: ["VIH", "LT4"] }],
                  values: [],
                  strictValues: false
                }
              }
            },
            E: {
              points: 4,
              prompt: "تفسير الآلية المرتبطة بـ الاستجابة ضد VIH",
              bacPrompt: "اشرح الآلية التي تفسر الاستجابة ضد VIH انطلاقا من الوثيقة ومعلوماتك.",
              ...RECON(
                "Thème recoupé sur des sources secondaires et le programme 3AS, sans relecture visuelle d un PDF ministériel dans cette session. Wording reconstructed, non certifiable official. À confronter au PDF dzexams avant toute utilisation comme énoncé."
              ),
              placeholder: "يعود ذلك إلى...",
              minLength: 110,
              modelAnswer:
                "يعود ذلك إلى تدخل VIH وLT4 عبر آلية دقيقة تؤدي إلى مراقبه، فتتغير الوظيفة النهائية للظاهرة المدروسة.",
              rule: {
                prompt: "تفسير الآلية المرتبطة بـ الاستجابة ضد VIH",
                keywords: ["VIH", "LT4", "مراقبه"],
                minHits: 3,
                forbidden: []
              }
            },
            W: {
              points: 1.5,
              prompt: "الخاتمة التركيبية حول الاستجابة ضد VIH",
              bacPrompt: "لخّص النتيجة النهائية المرتبطة بـ الاستجابة ضد VIH.",
              ...RECON(
                "Thème recoupé sur des sources secondaires et le programme 3AS, sans relecture visuelle d un PDF ministériel dans cette session. Wording reconstructed, non certifiable official. À confronter au PDF dzexams avant toute utilisation comme énoncé."
              ),
              placeholder: "VIH → LT4 → مراقبه",
              minLength: 40,
              modelAnswer: "عنوان المخطط: VIH. VIH → LT4 → مراقبه.",
              rule: {
                prompt: "الخاتمة التركيبية حول الاستجابة ضد VIH",
                keywords: ["مخطط", "VIH", "مراقبه"],
                minHits: 2,
                forbidden: [],
                schema: { arrows: true, title: "VIH", ordered: ["VIH", "LT4", "مراقبه"] }
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
        "https://www.dzexams.com/uploads/sujets/officiels/bac/2015/dzexams-bac-sciences-5906014.pdf",
      pdfLocalUrl: "/subjects/SE/2015/sujet-2.pdf",
      pdfNote:
        "PDF non redistribué dans le dépôt. Page dzexams : https://www.dzexams.com/ar/annales/aTlRWGREbDN3Qit2cVdRaHNmK0FYQT09. 2015 : PDF dzexams دون طبقة نص قابلة للشهادة هنا. Thèmes pédagogiques reconstruits.",
      title: "الموضوع الثاني",
      exercises: [
        {
          number: 1,
          ui: "text",
          label: "النقل المشبكي",
          max: 5,
          desc: "تأخير مشبكي ودور المبلغ الكيميائي",
          poles: {
            N: {
              points: 1,
              prompt: "تأطير الإشكالية حول: النقل المشبكي",
              bacPrompt: "ما المشكل العلمي المرتبط بـ النقل المشبكي؟",
              ...RECON(
                "Thème recoupé sur des sources secondaires et le programme 3AS, sans relecture visuelle d un PDF ministériel dans cette session. Wording reconstructed, non certifiable official. À confronter au PDF dzexams avant toute utilisation comme énoncé."
              ),
              placeholder: "صياغة المشكل العلمي...",
              minLength: 40,
              modelAnswer: "المشكل العلمي: كيف تتدخل الآليات المرتبطة بـ النقل المشبكي في الظاهرة المدروسة؟",
              rule: {
                prompt: "تأطير الإشكالية حول: النقل المشبكي",
                keywords: ["مشبك", "تاخير"],
                minHits: 2,
                forbidden: []
              }
            },
            S: {
              points: 1,
              prompt: "استغلال الوثيقة المتعلقة بـ النقل المشبكي",
              bacPrompt: "حلّل أو استخرج من الوثيقة المعطيات المرتبطة بـ النقل المشبكي.",
              ...RECON(
                "Thème recoupé sur des sources secondaires et le programme 3AS, sans relecture visuelle d un PDF ministériel dans cette session. Wording reconstructed, non certifiable official. À confronter au PDF dzexams avant toute utilisation comme énoncé."
              ),
              placeholder: "نلاحظ... بينما... ومنه نستنتج...",
              minLength: 40,
              modelAnswer:
                "تمثل الوثيقة تغيرات مشبك بدلالة الزمن مقارنة بـ تاخير. نلاحظ تغيرا واضحا في مشبك مقارنة بالشاهد، ومنه نستنتج علاقة مباشرة مع تاخير.",
              rule: {
                prompt: "استغلال الوثيقة المتعلقة بـ النقل المشبكي",
                keywords: ["مشبك", "تاخير", "نلاحظ"],
                minHits: 2,
                forbidden: ["بسبب"],
                document: {
                  kind: "curve",
                  axes: ["مشبك", "زمن"],
                  comparisons: [["مشبك", "تاخير"]],
                  trends: [{ about: "مشبك", expect: ["مشبك", "تاخير"] }],
                  values: [],
                  strictValues: false
                }
              }
            },
            E: {
              points: 2,
              prompt: "تفسير الآلية المرتبطة بـ النقل المشبكي",
              bacPrompt: "اشرح الآلية التي تفسر النقل المشبكي انطلاقا من الوثيقة ومعلوماتك.",
              ...RECON(
                "Thème recoupé sur des sources secondaires et le programme 3AS, sans relecture visuelle d un PDF ministériel dans cette session. Wording reconstructed, non certifiable official. À confronter au PDF dzexams avant toute utilisation comme énoncé."
              ),
              placeholder: "يعود ذلك إلى...",
              minLength: 120,
              modelAnswer:
                "يعود ذلك إلى تدخل مشبك وتاخير عبر آلية دقيقة تؤدي إلى مبلغ، فتتغير الوظيفة النهائية للظاهرة المدروسة.",
              rule: {
                prompt: "تفسير الآلية المرتبطة بـ النقل المشبكي",
                keywords: ["مشبك", "تاخير", "مبلغ"],
                minHits: 3,
                forbidden: []
              }
            },
            W: {
              points: 1,
              prompt: "الخاتمة التركيبية حول النقل المشبكي",
              bacPrompt: "لخّص النتيجة النهائية المرتبطة بـ النقل المشبكي.",
              ...RECON(
                "Thème recoupé sur des sources secondaires et le programme 3AS, sans relecture visuelle d un PDF ministériel dans cette session. Wording reconstructed, non certifiable official. À confronter au PDF dzexams avant toute utilisation comme énoncé."
              ),
              placeholder: "في الختام...",
              minLength: 40,
              modelAnswer: "في الختام، ترتبط النتيجة النهائية بـ مشبك وتاخير فتُغلق الظاهرة على مبلغ.",
              rule: {
                prompt: "الخاتمة التركيبية حول النقل المشبكي",
                keywords: ["مشبك", "مبلغ", "ختام"],
                minHits: 2,
                forbidden: []
              }
            }
          }
        },
        {
          number: 2,
          ui: "text",
          label: "أنزيم RUBISCO وتثبيت CO2",
          max: 7,
          desc: "تثبيت CO2 على RudIP في الحشوة",
          poles: {
            N: {
              points: 1,
              prompt: "تأطير الإشكالية حول: أنزيم RUBISCO وتثبيت CO2",
              bacPrompt: "ما المشكل العلمي المرتبط بـ أنزيم RUBISCO وتثبيت CO2؟",
              ...RECON(
                "Thème recoupé sur des sources secondaires et le programme 3AS, sans relecture visuelle d un PDF ministériel dans cette session. Wording reconstructed, non certifiable official. À confronter au PDF dzexams avant toute utilisation comme énoncé."
              ),
              placeholder: "صياغة المشكل العلمي...",
              minLength: 40,
              modelAnswer:
                "المشكل العلمي: كيف تتدخل الآليات المرتبطة بـ أنزيم RUBISCO وتثبيت CO2 في الظاهرة المدروسة؟",
              rule: {
                prompt: "تأطير الإشكالية حول: أنزيم RUBISCO وتثبيت CO2",
                keywords: ["RUBISCO", "تثبيت"],
                minHits: 2,
                forbidden: []
              }
            },
            S: {
              points: 2.5,
              prompt: "استغلال الوثيقة المتعلقة بـ أنزيم RUBISCO وتثبيت CO2",
              bacPrompt: "حلّل أو استخرج من الوثيقة المعطيات المرتبطة بـ أنزيم RUBISCO وتثبيت CO2.",
              ...RECON(
                "Thème recoupé sur des sources secondaires et le programme 3AS, sans relecture visuelle d un PDF ministériel dans cette session. Wording reconstructed, non certifiable official. À confronter au PDF dzexams avant toute utilisation comme énoncé."
              ),
              placeholder: "نلاحظ... بينما... ومنه نستنتج...",
              minLength: 90,
              modelAnswer:
                "تمثل الوثيقة تغيرات RUBISCO بدلالة الزمن مقارنة بـ تثبيت. نلاحظ تغيرا واضحا في RUBISCO مقارنة بالشاهد، ومنه نستنتج علاقة مباشرة مع تثبيت.",
              rule: {
                prompt: "استغلال الوثيقة المتعلقة بـ أنزيم RUBISCO وتثبيت CO2",
                keywords: ["RUBISCO", "تثبيت", "نلاحظ"],
                minHits: 2,
                forbidden: ["بسبب"],
                document: {
                  kind: "curve",
                  axes: ["RUBISCO", "زمن"],
                  comparisons: [["RUBISCO", "تثبيت"]],
                  trends: [{ about: "RUBISCO", expect: ["RUBISCO", "تثبيت"] }],
                  values: [],
                  strictValues: false
                }
              }
            },
            E: {
              points: 2.5,
              prompt: "تفسير الآلية المرتبطة بـ أنزيم RUBISCO وتثبيت CO2",
              bacPrompt: "اشرح الآلية التي تفسر أنزيم RUBISCO وتثبيت CO2 انطلاقا من الوثيقة ومعلوماتك.",
              ...RECON(
                "Thème recoupé sur des sources secondaires et le programme 3AS, sans relecture visuelle d un PDF ministériel dans cette session. Wording reconstructed, non certifiable official. À confronter au PDF dzexams avant toute utilisation comme énoncé."
              ),
              placeholder: "يعود ذلك إلى...",
              minLength: 110,
              modelAnswer:
                "يعود ذلك إلى تدخل RUBISCO وتثبيت عبر آلية دقيقة تؤدي إلى CO2، فتتغير الوظيفة النهائية للظاهرة المدروسة.",
              rule: {
                prompt: "تفسير الآلية المرتبطة بـ أنزيم RUBISCO وتثبيت CO2",
                keywords: ["RUBISCO", "تثبيت", "CO2"],
                minHits: 3,
                forbidden: []
              }
            },
            W: {
              points: 1,
              prompt: "الخاتمة التركيبية حول أنزيم RUBISCO وتثبيت CO2",
              bacPrompt: "لخّص النتيجة النهائية المرتبطة بـ أنزيم RUBISCO وتثبيت CO2.",
              ...RECON(
                "Thème recoupé sur des sources secondaires et le programme 3AS, sans relecture visuelle d un PDF ministériel dans cette session. Wording reconstructed, non certifiable official. À confronter au PDF dzexams avant toute utilisation comme énoncé."
              ),
              placeholder: "في الختام...",
              minLength: 40,
              modelAnswer: "في الختام، ترتبط النتيجة النهائية بـ RUBISCO وتثبيت فتُغلق الظاهرة على CO2.",
              rule: {
                prompt: "الخاتمة التركيبية حول أنزيم RUBISCO وتثبيت CO2",
                keywords: ["RUBISCO", "CO2", "ختام"],
                minHits: 2,
                forbidden: []
              }
            }
          }
        },
        {
          number: 3,
          ui: "text",
          label: "الصفائح التكتونية",
          max: 8,
          desc: "التوسع المحيطي ومناطق الغوص",
          poles: {
            N: {
              points: 0.5,
              prompt: "تأطير الإشكالية حول: الصفائح التكتونية",
              bacPrompt: "ما المشكل العلمي المرتبط بـ الصفائح التكتونية؟",
              ...RECON(
                "Thème recoupé sur des sources secondaires et le programme 3AS, sans relecture visuelle d un PDF ministériel dans cette session. Wording reconstructed, non certifiable official. À confronter au PDF dzexams avant toute utilisation comme énoncé."
              ),
              placeholder: "صياغة المشكل العلمي...",
              minLength: 30,
              modelAnswer:
                "المشكل العلمي: كيف تتدخل الآليات المرتبطة بـ الصفائح التكتونية في الظاهرة المدروسة؟",
              rule: {
                prompt: "تأطير الإشكالية حول: الصفائح التكتونية",
                keywords: ["صفائح", "ظهره"],
                minHits: 2,
                forbidden: []
              }
            },
            S: {
              points: 2,
              prompt: "استغلال الوثيقة المتعلقة بـ الصفائح التكتونية",
              bacPrompt: "حلّل أو استخرج من الوثيقة المعطيات المرتبطة بـ الصفائح التكتونية.",
              ...RECON(
                "Thème recoupé sur des sources secondaires et le programme 3AS, sans relecture visuelle d un PDF ministériel dans cette session. Wording reconstructed, non certifiable official. À confronter au PDF dzexams avant toute utilisation comme énoncé."
              ),
              placeholder: "نلاحظ... بينما... ومنه نستنتج...",
              minLength: 60,
              modelAnswer:
                "تمثل الوثيقة تغيرات صفائح بدلالة الزمن مقارنة بـ ظهره. نلاحظ تغيرا واضحا في صفائح مقارنة بالشاهد، ومنه نستنتج علاقة مباشرة مع ظهره.",
              rule: {
                prompt: "استغلال الوثيقة المتعلقة بـ الصفائح التكتونية",
                keywords: ["صفائح", "ظهره", "نلاحظ"],
                minHits: 2,
                forbidden: ["بسبب"],
                document: {
                  kind: "curve",
                  axes: ["صفائح", "زمن"],
                  comparisons: [["صفائح", "ظهره"]],
                  trends: [{ about: "صفائح", expect: ["صفائح", "ظهره"] }],
                  values: [],
                  strictValues: false
                }
              }
            },
            E: {
              points: 4,
              prompt: "تفسير الآلية المرتبطة بـ الصفائح التكتونية",
              bacPrompt: "اشرح الآلية التي تفسر الصفائح التكتونية انطلاقا من الوثيقة ومعلوماتك.",
              ...RECON(
                "Thème recoupé sur des sources secondaires et le programme 3AS, sans relecture visuelle d un PDF ministériel dans cette session. Wording reconstructed, non certifiable official. À confronter au PDF dzexams avant toute utilisation comme énoncé."
              ),
              placeholder: "يعود ذلك إلى...",
              minLength: 110,
              modelAnswer:
                "يعود ذلك إلى تدخل صفائح وظهره عبر آلية دقيقة تؤدي إلى غوص، فتتغير الوظيفة النهائية للظاهرة المدروسة.",
              rule: {
                prompt: "تفسير الآلية المرتبطة بـ الصفائح التكتونية",
                keywords: ["صفائح", "ظهره", "غوص"],
                minHits: 3,
                forbidden: []
              }
            },
            W: {
              points: 1.5,
              prompt: "الخاتمة التركيبية حول الصفائح التكتونية",
              bacPrompt: "لخّص النتيجة النهائية المرتبطة بـ الصفائح التكتونية.",
              ...RECON(
                "Thème recoupé sur des sources secondaires et le programme 3AS, sans relecture visuelle d un PDF ministériel dans cette session. Wording reconstructed, non certifiable official. À confronter au PDF dzexams avant toute utilisation comme énoncé."
              ),
              placeholder: "صفائح → ظهره → غوص",
              minLength: 40,
              modelAnswer: "عنوان المخطط: صفائح. صفائح → ظهره → غوص.",
              rule: {
                prompt: "الخاتمة التركيبية حول الصفائح التكتونية",
                keywords: ["مخطط", "صفائح", "غوص"],
                minHits: 2,
                forbidden: [],
                schema: { arrows: true, title: "صفائح", ordered: ["صفائح", "ظهره", "غوص"] }
              }
            }
          }
        }
      ]
    }
  ]
};

export { YEAR_2015_SE };
export default YEAR_2015_SE;
