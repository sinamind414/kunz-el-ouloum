/* ============================================================
   BAC SVT Algérie 2014 — archive pédagogique reconstruite
   ------------------------------------------------------------
   Aucune consigne n'est marquée official. Les champs de provenance
   restent attachés à chaque pôle. Chargé à la demande par le shell.
   ============================================================ */

const RECON = (notes) => ({
  bacPromptSource: "reconstructed",
  bacPromptNotes: notes
});

const YEAR_2014_SE = {
  id: "2014",
  stream: "se",
  calendarYear: "2014",
  label: "بكالوريا الجزائر دورة 2014 — شعبة علوم تجريبية",
  theme: "amber",
  enabled: true,
  sujets: [
    {
      id: 1,
      pdf: null,
      pdfExternalUrl:
        "https://www.dzexams.com/uploads/sujets/officiels/bac/2014/dzexams-bac-sciences-4380238.pdf",
      pdfLocalUrl: "/subjects/SE/2014/sujet-1.pdf",
      pdfNote:
        "PDF non redistribué dans le dépôt. Page dzexams : https://www.dzexams.com/ar/annales/SzdNaHlPbThvaEhSSUJjWDRsdUljdz09. 2014 : PDF dzexams دون طبقة نص قابلة للشهادة هنا. Thèmes pédagogiques reconstruits.",
      title: "الموضوع الأول",
      exercises: [
        {
          number: 1,
          ui: "text",
          label: "مراحل تركيب البروتين",
          max: 5,
          desc: "تكامل الاستنساخ والترجمة",
          poles: {
            N: {
              points: 1,
              prompt: "تأطير الإشكالية حول: مراحل تركيب البروتين",
              bacPrompt: "ما المشكل العلمي المرتبط بـ مراحل تركيب البروتين؟",
              ...RECON(
                "Thème recoupé sur des sources secondaires et le programme 3AS, sans relecture visuelle d un PDF ministériel dans cette session. Wording reconstructed, non certifiable official. À confronter au PDF dzexams avant toute utilisation comme énoncé."
              ),
              placeholder: "صياغة المشكل العلمي...",
              minLength: 40,
              modelAnswer:
                "المشكل العلمي: كيف تتدخل الآليات المرتبطة بـ مراحل تركيب البروتين في الظاهرة المدروسة؟",
              rule: {
                prompt: "تأطير الإشكالية حول: مراحل تركيب البروتين",
                keywords: ["استنساخ", "ترجمه"],
                minHits: 2,
                forbidden: []
              }
            },
            S: {
              points: 1,
              prompt: "استغلال الوثيقة المتعلقة بـ مراحل تركيب البروتين",
              bacPrompt: "حلّل أو استخرج من الوثيقة المعطيات المرتبطة بـ مراحل تركيب البروتين.",
              ...RECON(
                "Thème recoupé sur des sources secondaires et le programme 3AS, sans relecture visuelle d un PDF ministériel dans cette session. Wording reconstructed, non certifiable official. À confronter au PDF dzexams avant toute utilisation comme énoncé."
              ),
              placeholder: "نلاحظ... بينما... ومنه نستنتج...",
              minLength: 40,
              modelAnswer:
                "تمثل الوثيقة تغيرات استنساخ بدلالة الزمن مقارنة بـ ترجمه. نلاحظ تغيرا واضحا في استنساخ مقارنة بالشاهد، ومنه نستنتج علاقة مباشرة مع ترجمه.",
              rule: {
                prompt: "استغلال الوثيقة المتعلقة بـ مراحل تركيب البروتين",
                keywords: ["استنساخ", "ترجمه", "نلاحظ"],
                minHits: 2,
                forbidden: ["بسبب"],
                document: {
                  kind: "curve",
                  axes: ["استنساخ", "زمن"],
                  comparisons: [["استنساخ", "ترجمه"]],
                  trends: [{ about: "استنساخ", expect: ["استنساخ", "ترجمه"] }],
                  values: [],
                  strictValues: false
                }
              }
            },
            E: {
              points: 2,
              prompt: "تفسير الآلية المرتبطة بـ مراحل تركيب البروتين",
              bacPrompt: "اشرح الآلية التي تفسر مراحل تركيب البروتين انطلاقا من الوثيقة ومعلوماتك.",
              ...RECON(
                "Thème recoupé sur des sources secondaires et le programme 3AS, sans relecture visuelle d un PDF ministériel dans cette session. Wording reconstructed, non certifiable official. À confronter au PDF dzexams avant toute utilisation comme énoncé."
              ),
              placeholder: "يعود ذلك إلى...",
              minLength: 120,
              modelAnswer:
                "يعود ذلك إلى تدخل استنساخ وترجمه عبر آلية دقيقة تؤدي إلى بروتين، فتتغير الوظيفة النهائية للظاهرة المدروسة.",
              rule: {
                prompt: "تفسير الآلية المرتبطة بـ مراحل تركيب البروتين",
                keywords: ["استنساخ", "ترجمه", "بروتين"],
                minHits: 3,
                forbidden: []
              }
            },
            W: {
              points: 1,
              prompt: "الخاتمة التركيبية حول مراحل تركيب البروتين",
              bacPrompt: "لخّص النتيجة النهائية المرتبطة بـ مراحل تركيب البروتين.",
              ...RECON(
                "Thème recoupé sur des sources secondaires et le programme 3AS, sans relecture visuelle d un PDF ministériel dans cette session. Wording reconstructed, non certifiable official. À confronter au PDF dzexams avant toute utilisation comme énoncé."
              ),
              placeholder: "في الختام...",
              minLength: 40,
              modelAnswer: "في الختام، ترتبط النتيجة النهائية بـ استنساخ وترجمه فتُغلق الظاهرة على بروتين.",
              rule: {
                prompt: "الخاتمة التركيبية حول مراحل تركيب البروتين",
                keywords: ["استنساخ", "بروتين", "ختام"],
                minHits: 2,
                forbidden: []
              }
            }
          }
        },
        {
          number: 2,
          ui: "text",
          label: "التثبيط الإنزيمي",
          max: 7,
          desc: "تثبيط تنافسي وغير تنافسي على الموقع الفعال",
          poles: {
            N: {
              points: 1,
              prompt: "تأطير الإشكالية حول: التثبيط الإنزيمي",
              bacPrompt: "ما المشكل العلمي المرتبط بـ التثبيط الإنزيمي؟",
              ...RECON(
                "Thème recoupé sur des sources secondaires et le programme 3AS, sans relecture visuelle d un PDF ministériel dans cette session. Wording reconstructed, non certifiable official. À confronter au PDF dzexams avant toute utilisation comme énoncé."
              ),
              placeholder: "صياغة المشكل العلمي...",
              minLength: 40,
              modelAnswer:
                "المشكل العلمي: كيف تتدخل الآليات المرتبطة بـ التثبيط الإنزيمي في الظاهرة المدروسة؟",
              rule: {
                prompt: "تأطير الإشكالية حول: التثبيط الإنزيمي",
                keywords: ["تثبيط", "موقع"],
                minHits: 2,
                forbidden: []
              }
            },
            S: {
              points: 2.5,
              prompt: "استغلال الوثيقة المتعلقة بـ التثبيط الإنزيمي",
              bacPrompt: "حلّل أو استخرج من الوثيقة المعطيات المرتبطة بـ التثبيط الإنزيمي.",
              ...RECON(
                "Thème recoupé sur des sources secondaires et le programme 3AS, sans relecture visuelle d un PDF ministériel dans cette session. Wording reconstructed, non certifiable official. À confronter au PDF dzexams avant toute utilisation comme énoncé."
              ),
              placeholder: "نلاحظ... بينما... ومنه نستنتج...",
              minLength: 90,
              modelAnswer:
                "تمثل الوثيقة تغيرات تثبيط بدلالة الزمن مقارنة بـ موقع. نلاحظ تغيرا واضحا في تثبيط مقارنة بالشاهد، ومنه نستنتج علاقة مباشرة مع موقع.",
              rule: {
                prompt: "استغلال الوثيقة المتعلقة بـ التثبيط الإنزيمي",
                keywords: ["تثبيط", "موقع", "نلاحظ"],
                minHits: 2,
                forbidden: ["بسبب"],
                document: {
                  kind: "curve",
                  axes: ["تثبيط", "زمن"],
                  comparisons: [["تثبيط", "موقع"]],
                  trends: [{ about: "تثبيط", expect: ["تثبيط", "موقع"] }],
                  values: [],
                  strictValues: false
                }
              }
            },
            E: {
              points: 2.5,
              prompt: "تفسير الآلية المرتبطة بـ التثبيط الإنزيمي",
              bacPrompt: "اشرح الآلية التي تفسر التثبيط الإنزيمي انطلاقا من الوثيقة ومعلوماتك.",
              ...RECON(
                "Thème recoupé sur des sources secondaires et le programme 3AS, sans relecture visuelle d un PDF ministériel dans cette session. Wording reconstructed, non certifiable official. À confronter au PDF dzexams avant toute utilisation comme énoncé."
              ),
              placeholder: "يعود ذلك إلى...",
              minLength: 110,
              modelAnswer:
                "يعود ذلك إلى تدخل تثبيط وموقع عبر آلية دقيقة تؤدي إلى ركيزه، فتتغير الوظيفة النهائية للظاهرة المدروسة.",
              rule: {
                prompt: "تفسير الآلية المرتبطة بـ التثبيط الإنزيمي",
                keywords: ["تثبيط", "موقع", "ركيزه"],
                minHits: 3,
                forbidden: []
              }
            },
            W: {
              points: 1,
              prompt: "الخاتمة التركيبية حول التثبيط الإنزيمي",
              bacPrompt: "لخّص النتيجة النهائية المرتبطة بـ التثبيط الإنزيمي.",
              ...RECON(
                "Thème recoupé sur des sources secondaires et le programme 3AS, sans relecture visuelle d un PDF ministériel dans cette session. Wording reconstructed, non certifiable official. À confronter au PDF dzexams avant toute utilisation comme énoncé."
              ),
              placeholder: "في الختام...",
              minLength: 40,
              modelAnswer: "في الختام، ترتبط النتيجة النهائية بـ تثبيط وموقع فتُغلق الظاهرة على ركيزه.",
              rule: {
                prompt: "الخاتمة التركيبية حول التثبيط الإنزيمي",
                keywords: ["تثبيط", "ركيزه", "ختام"],
                minHits: 2,
                forbidden: []
              }
            }
          }
        },
        {
          number: 3,
          ui: "text",
          label: "الدفاع عن الذات",
          max: 8,
          desc: "آليات التعرف النوعي على اللاذات",
          poles: {
            N: {
              points: 0.5,
              prompt: "تأطير الإشكالية حول: الدفاع عن الذات",
              bacPrompt: "ما المشكل العلمي المرتبط بـ الدفاع عن الذات؟",
              ...RECON(
                "Thème recoupé sur des sources secondaires et le programme 3AS, sans relecture visuelle d un PDF ministériel dans cette session. Wording reconstructed, non certifiable official. À confronter au PDF dzexams avant toute utilisation comme énoncé."
              ),
              placeholder: "صياغة المشكل العلمي...",
              minLength: 30,
              modelAnswer:
                "المشكل العلمي: كيف تتدخل الآليات المرتبطة بـ الدفاع عن الذات في الظاهرة المدروسة؟",
              rule: {
                prompt: "تأطير الإشكالية حول: الدفاع عن الذات",
                keywords: ["ذات", "لاذات"],
                minHits: 2,
                forbidden: []
              }
            },
            S: {
              points: 2,
              prompt: "استغلال الوثيقة المتعلقة بـ الدفاع عن الذات",
              bacPrompt: "حلّل أو استخرج من الوثيقة المعطيات المرتبطة بـ الدفاع عن الذات.",
              ...RECON(
                "Thème recoupé sur des sources secondaires et le programme 3AS, sans relecture visuelle d un PDF ministériel dans cette session. Wording reconstructed, non certifiable official. À confronter au PDF dzexams avant toute utilisation comme énoncé."
              ),
              placeholder: "نلاحظ... بينما... ومنه نستنتج...",
              minLength: 60,
              modelAnswer:
                "تمثل الوثيقة تغيرات ذات بدلالة الزمن مقارنة بـ لاذات. نلاحظ تغيرا واضحا في ذات مقارنة بالشاهد، ومنه نستنتج علاقة مباشرة مع لاذات.",
              rule: {
                prompt: "استغلال الوثيقة المتعلقة بـ الدفاع عن الذات",
                keywords: ["ذات", "لاذات", "نلاحظ"],
                minHits: 2,
                forbidden: ["بسبب"],
                document: {
                  kind: "curve",
                  axes: ["ذات", "زمن"],
                  comparisons: [["ذات", "لاذات"]],
                  trends: [{ about: "ذات", expect: ["ذات", "لاذات"] }],
                  values: [],
                  strictValues: false
                }
              }
            },
            E: {
              points: 4,
              prompt: "تفسير الآلية المرتبطة بـ الدفاع عن الذات",
              bacPrompt: "اشرح الآلية التي تفسر الدفاع عن الذات انطلاقا من الوثيقة ومعلوماتك.",
              ...RECON(
                "Thème recoupé sur des sources secondaires et le programme 3AS, sans relecture visuelle d un PDF ministériel dans cette session. Wording reconstructed, non certifiable official. À confronter au PDF dzexams avant toute utilisation comme énoncé."
              ),
              placeholder: "يعود ذلك إلى...",
              minLength: 110,
              modelAnswer:
                "يعود ذلك إلى تدخل ذات ولاذات عبر آلية دقيقة تؤدي إلى تعرف، فتتغير الوظيفة النهائية للظاهرة المدروسة.",
              rule: {
                prompt: "تفسير الآلية المرتبطة بـ الدفاع عن الذات",
                keywords: ["ذات", "لاذات", "تعرف"],
                minHits: 3,
                forbidden: []
              }
            },
            W: {
              points: 1.5,
              prompt: "الخاتمة التركيبية حول الدفاع عن الذات",
              bacPrompt: "لخّص النتيجة النهائية المرتبطة بـ الدفاع عن الذات.",
              ...RECON(
                "Thème recoupé sur des sources secondaires et le programme 3AS, sans relecture visuelle d un PDF ministériel dans cette session. Wording reconstructed, non certifiable official. À confronter au PDF dzexams avant toute utilisation comme énoncé."
              ),
              placeholder: "ذات → لاذات → تعرف",
              minLength: 40,
              modelAnswer: "عنوان المخطط: ذات. ذات → لاذات → تعرف.",
              rule: {
                prompt: "الخاتمة التركيبية حول الدفاع عن الذات",
                keywords: ["مخطط", "ذات", "تعرف"],
                minHits: 2,
                forbidden: [],
                schema: { arrows: true, title: "ذات", ordered: ["ذات", "لاذات", "تعرف"] }
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
        "https://www.dzexams.com/uploads/sujets/officiels/bac/2014/dzexams-bac-sciences-4380238.pdf",
      pdfLocalUrl: "/subjects/SE/2014/sujet-2.pdf",
      pdfNote:
        "PDF non redistribué dans le dépôt. Page dzexams : https://www.dzexams.com/ar/annales/SzdNaHlPbThvaEhSSUJjWDRsdUljdz09. 2014 : PDF dzexams دون طبقة نص قابلة للشهادة هنا. Thèmes pédagogiques reconstruits.",
      title: "الموضوع الثاني",
      exercises: [
        {
          number: 1,
          ui: "text",
          label: "كمون الراحة",
          max: 5,
          desc: "توزيع Na⁺ وK⁺ ودور مضخة الصوديوم-بوتاسيوم",
          poles: {
            N: {
              points: 1,
              prompt: "تأطير الإشكالية حول: كمون الراحة",
              bacPrompt: "ما المشكل العلمي المرتبط بـ كمون الراحة؟",
              ...RECON(
                "Thème recoupé sur des sources secondaires et le programme 3AS, sans relecture visuelle d un PDF ministériel dans cette session. Wording reconstructed, non certifiable official. À confronter au PDF dzexams avant toute utilisation comme énoncé."
              ),
              placeholder: "صياغة المشكل العلمي...",
              minLength: 40,
              modelAnswer: "المشكل العلمي: كيف تتدخل الآليات المرتبطة بـ كمون الراحة في الظاهرة المدروسة؟",
              rule: {
                prompt: "تأطير الإشكالية حول: كمون الراحة",
                keywords: ["راحه", "مضخه"],
                minHits: 2,
                forbidden: []
              }
            },
            S: {
              points: 1,
              prompt: "استغلال الوثيقة المتعلقة بـ كمون الراحة",
              bacPrompt: "حلّل أو استخرج من الوثيقة المعطيات المرتبطة بـ كمون الراحة.",
              ...RECON(
                "Thème recoupé sur des sources secondaires et le programme 3AS, sans relecture visuelle d un PDF ministériel dans cette session. Wording reconstructed, non certifiable official. À confronter au PDF dzexams avant toute utilisation comme énoncé."
              ),
              placeholder: "نلاحظ... بينما... ومنه نستنتج...",
              minLength: 40,
              modelAnswer:
                "تمثل الوثيقة تغيرات راحه بدلالة الزمن مقارنة بـ مضخه. نلاحظ تغيرا واضحا في راحه مقارنة بالشاهد، ومنه نستنتج علاقة مباشرة مع مضخه.",
              rule: {
                prompt: "استغلال الوثيقة المتعلقة بـ كمون الراحة",
                keywords: ["راحه", "مضخه", "نلاحظ"],
                minHits: 2,
                forbidden: ["بسبب"],
                document: {
                  kind: "curve",
                  axes: ["راحه", "زمن"],
                  comparisons: [["راحه", "مضخه"]],
                  trends: [{ about: "راحه", expect: ["راحه", "مضخه"] }],
                  values: [],
                  strictValues: false
                }
              }
            },
            E: {
              points: 2,
              prompt: "تفسير الآلية المرتبطة بـ كمون الراحة",
              bacPrompt: "اشرح الآلية التي تفسر كمون الراحة انطلاقا من الوثيقة ومعلوماتك.",
              ...RECON(
                "Thème recoupé sur des sources secondaires et le programme 3AS, sans relecture visuelle d un PDF ministériel dans cette session. Wording reconstructed, non certifiable official. À confronter au PDF dzexams avant toute utilisation comme énoncé."
              ),
              placeholder: "يعود ذلك إلى...",
              minLength: 120,
              modelAnswer:
                "يعود ذلك إلى تدخل راحه ومضخه عبر آلية دقيقة تؤدي إلى شوارد، فتتغير الوظيفة النهائية للظاهرة المدروسة.",
              rule: {
                prompt: "تفسير الآلية المرتبطة بـ كمون الراحة",
                keywords: ["راحه", "مضخه", "شوارد"],
                minHits: 3,
                forbidden: []
              }
            },
            W: {
              points: 1,
              prompt: "الخاتمة التركيبية حول كمون الراحة",
              bacPrompt: "لخّص النتيجة النهائية المرتبطة بـ كمون الراحة.",
              ...RECON(
                "Thème recoupé sur des sources secondaires et le programme 3AS, sans relecture visuelle d un PDF ministériel dans cette session. Wording reconstructed, non certifiable official. À confronter au PDF dzexams avant toute utilisation comme énoncé."
              ),
              placeholder: "في الختام...",
              minLength: 40,
              modelAnswer: "في الختام، ترتبط النتيجة النهائية بـ راحه ومضخه فتُغلق الظاهرة على شوارد.",
              rule: {
                prompt: "الخاتمة التركيبية حول كمون الراحة",
                keywords: ["راحه", "شوارد", "ختام"],
                minHits: 2,
                forbidden: []
              }
            }
          }
        },
        {
          number: 2,
          ui: "text",
          label: "تحويل الطاقة في الميتوكوندري",
          max: 7,
          desc: "أكسدة النواقل وتشكل ATP",
          poles: {
            N: {
              points: 1,
              prompt: "تأطير الإشكالية حول: تحويل الطاقة في الميتوكوندري",
              bacPrompt: "ما المشكل العلمي المرتبط بـ تحويل الطاقة في الميتوكوندري؟",
              ...RECON(
                "Thème recoupé sur des sources secondaires et le programme 3AS, sans relecture visuelle d un PDF ministériel dans cette session. Wording reconstructed, non certifiable official. À confronter au PDF dzexams avant toute utilisation comme énoncé."
              ),
              placeholder: "صياغة المشكل العلمي...",
              minLength: 40,
              modelAnswer:
                "المشكل العلمي: كيف تتدخل الآليات المرتبطة بـ تحويل الطاقة في الميتوكوندري في الظاهرة المدروسة؟",
              rule: {
                prompt: "تأطير الإشكالية حول: تحويل الطاقة في الميتوكوندري",
                keywords: ["ميتوكوندري", "نواقل"],
                minHits: 2,
                forbidden: []
              }
            },
            S: {
              points: 2.5,
              prompt: "استغلال الوثيقة المتعلقة بـ تحويل الطاقة في الميتوكوندري",
              bacPrompt: "حلّل أو استخرج من الوثيقة المعطيات المرتبطة بـ تحويل الطاقة في الميتوكوندري.",
              ...RECON(
                "Thème recoupé sur des sources secondaires et le programme 3AS, sans relecture visuelle d un PDF ministériel dans cette session. Wording reconstructed, non certifiable official. À confronter au PDF dzexams avant toute utilisation comme énoncé."
              ),
              placeholder: "نلاحظ... بينما... ومنه نستنتج...",
              minLength: 90,
              modelAnswer:
                "تمثل الوثيقة تغيرات ميتوكوندري بدلالة الزمن مقارنة بـ نواقل. نلاحظ تغيرا واضحا في ميتوكوندري مقارنة بالشاهد، ومنه نستنتج علاقة مباشرة مع نواقل.",
              rule: {
                prompt: "استغلال الوثيقة المتعلقة بـ تحويل الطاقة في الميتوكوندري",
                keywords: ["ميتوكوندري", "نواقل", "نلاحظ"],
                minHits: 2,
                forbidden: ["بسبب"],
                document: {
                  kind: "curve",
                  axes: ["ميتوكوندري", "زمن"],
                  comparisons: [["ميتوكوندري", "نواقل"]],
                  trends: [{ about: "ميتوكوندري", expect: ["ميتوكوندري", "نواقل"] }],
                  values: [],
                  strictValues: false
                }
              }
            },
            E: {
              points: 2.5,
              prompt: "تفسير الآلية المرتبطة بـ تحويل الطاقة في الميتوكوندري",
              bacPrompt: "اشرح الآلية التي تفسر تحويل الطاقة في الميتوكوندري انطلاقا من الوثيقة ومعلوماتك.",
              ...RECON(
                "Thème recoupé sur des sources secondaires et le programme 3AS, sans relecture visuelle d un PDF ministériel dans cette session. Wording reconstructed, non certifiable official. À confronter au PDF dzexams avant toute utilisation comme énoncé."
              ),
              placeholder: "يعود ذلك إلى...",
              minLength: 110,
              modelAnswer:
                "يعود ذلك إلى تدخل ميتوكوندري ونواقل عبر آلية دقيقة تؤدي إلى ATP، فتتغير الوظيفة النهائية للظاهرة المدروسة.",
              rule: {
                prompt: "تفسير الآلية المرتبطة بـ تحويل الطاقة في الميتوكوندري",
                keywords: ["ميتوكوندري", "نواقل", "ATP"],
                minHits: 3,
                forbidden: []
              }
            },
            W: {
              points: 1,
              prompt: "الخاتمة التركيبية حول تحويل الطاقة في الميتوكوندري",
              bacPrompt: "لخّص النتيجة النهائية المرتبطة بـ تحويل الطاقة في الميتوكوندري.",
              ...RECON(
                "Thème recoupé sur des sources secondaires et le programme 3AS, sans relecture visuelle d un PDF ministériel dans cette session. Wording reconstructed, non certifiable official. À confronter au PDF dzexams avant toute utilisation comme énoncé."
              ),
              placeholder: "في الختام...",
              minLength: 40,
              modelAnswer: "في الختام، ترتبط النتيجة النهائية بـ ميتوكوندري ونواقل فتُغلق الظاهرة على ATP.",
              rule: {
                prompt: "الخاتمة التركيبية حول تحويل الطاقة في الميتوكوندري",
                keywords: ["ميتوكوندري", "ATP", "ختام"],
                minHits: 2,
                forbidden: []
              }
            }
          }
        },
        {
          number: 3,
          ui: "text",
          label: "النشاط التكتوني",
          max: 8,
          desc: "العلاقة بين الزلازل والحدود بين الصفائح",
          poles: {
            N: {
              points: 0.5,
              prompt: "تأطير الإشكالية حول: النشاط التكتوني",
              bacPrompt: "ما المشكل العلمي المرتبط بـ النشاط التكتوني؟",
              ...RECON(
                "Thème recoupé sur des sources secondaires et le programme 3AS, sans relecture visuelle d un PDF ministériel dans cette session. Wording reconstructed, non certifiable official. À confronter au PDF dzexams avant toute utilisation comme énoncé."
              ),
              placeholder: "صياغة المشكل العلمي...",
              minLength: 30,
              modelAnswer:
                "المشكل العلمي: كيف تتدخل الآليات المرتبطة بـ النشاط التكتوني في الظاهرة المدروسة؟",
              rule: {
                prompt: "تأطير الإشكالية حول: النشاط التكتوني",
                keywords: ["زلزال", "حدود"],
                minHits: 2,
                forbidden: []
              }
            },
            S: {
              points: 2,
              prompt: "استغلال الوثيقة المتعلقة بـ النشاط التكتوني",
              bacPrompt: "حلّل أو استخرج من الوثيقة المعطيات المرتبطة بـ النشاط التكتوني.",
              ...RECON(
                "Thème recoupé sur des sources secondaires et le programme 3AS, sans relecture visuelle d un PDF ministériel dans cette session. Wording reconstructed, non certifiable official. À confronter au PDF dzexams avant toute utilisation comme énoncé."
              ),
              placeholder: "نلاحظ... بينما... ومنه نستنتج...",
              minLength: 60,
              modelAnswer:
                "تمثل الوثيقة تغيرات زلزال بدلالة الزمن مقارنة بـ حدود. نلاحظ تغيرا واضحا في زلزال مقارنة بالشاهد، ومنه نستنتج علاقة مباشرة مع حدود.",
              rule: {
                prompt: "استغلال الوثيقة المتعلقة بـ النشاط التكتوني",
                keywords: ["زلزال", "حدود", "نلاحظ"],
                minHits: 2,
                forbidden: ["بسبب"],
                document: {
                  kind: "curve",
                  axes: ["زلزال", "زمن"],
                  comparisons: [["زلزال", "حدود"]],
                  trends: [{ about: "زلزال", expect: ["زلزال", "حدود"] }],
                  values: [],
                  strictValues: false
                }
              }
            },
            E: {
              points: 4,
              prompt: "تفسير الآلية المرتبطة بـ النشاط التكتوني",
              bacPrompt: "اشرح الآلية التي تفسر النشاط التكتوني انطلاقا من الوثيقة ومعلوماتك.",
              ...RECON(
                "Thème recoupé sur des sources secondaires et le programme 3AS, sans relecture visuelle d un PDF ministériel dans cette session. Wording reconstructed, non certifiable official. À confronter au PDF dzexams avant toute utilisation comme énoncé."
              ),
              placeholder: "يعود ذلك إلى...",
              minLength: 110,
              modelAnswer:
                "يعود ذلك إلى تدخل زلزال وحدود عبر آلية دقيقة تؤدي إلى صفائح، فتتغير الوظيفة النهائية للظاهرة المدروسة.",
              rule: {
                prompt: "تفسير الآلية المرتبطة بـ النشاط التكتوني",
                keywords: ["زلزال", "حدود", "صفائح"],
                minHits: 3,
                forbidden: []
              }
            },
            W: {
              points: 1.5,
              prompt: "الخاتمة التركيبية حول النشاط التكتوني",
              bacPrompt: "لخّص النتيجة النهائية المرتبطة بـ النشاط التكتوني.",
              ...RECON(
                "Thème recoupé sur des sources secondaires et le programme 3AS, sans relecture visuelle d un PDF ministériel dans cette session. Wording reconstructed, non certifiable official. À confronter au PDF dzexams avant toute utilisation comme énoncé."
              ),
              placeholder: "زلزال → حدود → صفائح",
              minLength: 40,
              modelAnswer: "عنوان المخطط: زلزال. زلزال → حدود → صفائح.",
              rule: {
                prompt: "الخاتمة التركيبية حول النشاط التكتوني",
                keywords: ["مخطط", "زلزال", "صفائح"],
                minHits: 2,
                forbidden: [],
                schema: { arrows: true, title: "زلزال", ordered: ["زلزال", "حدود", "صفائح"] }
              }
            }
          }
        }
      ]
    }
  ]
};

export { YEAR_2014_SE };
export default YEAR_2014_SE;
