/* ============================================================
   BAC SVT Algérie 2013 — archive pédagogique reconstruite
   ------------------------------------------------------------
   Aucune consigne n'est marquée official. Les champs de provenance
   restent attachés à chaque pôle. Chargé à la demande par le shell.
   ============================================================ */

const RECON = (notes) => ({
  bacPromptSource: "reconstructed",
  bacPromptNotes: notes
});

const YEAR_2013_SE = {
  id: "2013",
  stream: "se",
  calendarYear: "2013",
  label: "بكالوريا الجزائر دورة 2013 — شعبة علوم تجريبية",
  theme: "emerald",
  enabled: true,
  sujets: [
    {
      id: 1,
      pdf: null,
      pdfExternalUrl:
        "https://www.dzexams.com/uploads/sujets/officiels/bac/2013/dzexams-bac-sciences-4463279.pdf",
      pdfLocalUrl: "/subjects/SE/2013/sujet-1.pdf",
      pdfNote:
        "PDF non redistribué dans le dépôt. Page dzexams : https://www.dzexams.com/ar/annales/bjdJbVBZMHFKeUZTcExKSEw4REVNQT09. 2013 : PDF dzexams محمي في العارض. Thèmes pédagogiques reconstruits.",
      title: "الموضوع الأول",
      exercises: [
        {
          number: 1,
          ui: "text",
          label: "النسخ والترجمة",
          max: 5,
          desc: "من المورثة إلى البروتين الوظيفي",
          poles: {
            N: {
              points: 1,
              prompt: "تأطير الإشكالية حول: النسخ والترجمة",
              bacPrompt: "ما المشكل العلمي المرتبط بـ النسخ والترجمة؟",
              ...RECON(
                "Thème recoupé sur des sources secondaires et le programme 3AS, sans relecture visuelle d un PDF ministériel dans cette session. Wording reconstructed, non certifiable official. À confronter au PDF dzexams avant toute utilisation comme énoncé."
              ),
              placeholder: "صياغة المشكل العلمي...",
              minLength: 40,
              modelAnswer: "المشكل العلمي: كيف تتدخل الآليات المرتبطة بـ النسخ والترجمة في الظاهرة المدروسة؟",
              rule: {
                prompt: "تأطير الإشكالية حول: النسخ والترجمة",
                keywords: ["مورثه", "نسخ"],
                minHits: 2,
                forbidden: []
              }
            },
            S: {
              points: 1,
              prompt: "استغلال الوثيقة المتعلقة بـ النسخ والترجمة",
              bacPrompt: "حلّل أو استخرج من الوثيقة المعطيات المرتبطة بـ النسخ والترجمة.",
              ...RECON(
                "Thème recoupé sur des sources secondaires et le programme 3AS, sans relecture visuelle d un PDF ministériel dans cette session. Wording reconstructed, non certifiable official. À confronter au PDF dzexams avant toute utilisation comme énoncé."
              ),
              placeholder: "نلاحظ... بينما... ومنه نستنتج...",
              minLength: 40,
              modelAnswer:
                "تمثل الوثيقة تغيرات مورثه بدلالة الزمن مقارنة بـ نسخ. نلاحظ تغيرا واضحا في مورثه مقارنة بالشاهد، ومنه نستنتج علاقة مباشرة مع نسخ.",
              rule: {
                prompt: "استغلال الوثيقة المتعلقة بـ النسخ والترجمة",
                keywords: ["مورثه", "نسخ", "نلاحظ"],
                minHits: 2,
                forbidden: ["بسبب"],
                document: {
                  kind: "curve",
                  axes: ["مورثه", "زمن"],
                  comparisons: [["مورثه", "نسخ"]],
                  trends: [{ about: "مورثه", expect: ["مورثه", "نسخ"] }],
                  values: [],
                  strictValues: false
                }
              }
            },
            E: {
              points: 2,
              prompt: "تفسير الآلية المرتبطة بـ النسخ والترجمة",
              bacPrompt: "اشرح الآلية التي تفسر النسخ والترجمة انطلاقا من الوثيقة ومعلوماتك.",
              ...RECON(
                "Thème recoupé sur des sources secondaires et le programme 3AS, sans relecture visuelle d un PDF ministériel dans cette session. Wording reconstructed, non certifiable official. À confronter au PDF dzexams avant toute utilisation comme énoncé."
              ),
              placeholder: "يعود ذلك إلى...",
              minLength: 120,
              modelAnswer:
                "يعود ذلك إلى تدخل مورثه ونسخ عبر آلية دقيقة تؤدي إلى ترجمه، فتتغير الوظيفة النهائية للظاهرة المدروسة.",
              rule: {
                prompt: "تفسير الآلية المرتبطة بـ النسخ والترجمة",
                keywords: ["مورثه", "نسخ", "ترجمه"],
                minHits: 3,
                forbidden: []
              }
            },
            W: {
              points: 1,
              prompt: "الخاتمة التركيبية حول النسخ والترجمة",
              bacPrompt: "لخّص النتيجة النهائية المرتبطة بـ النسخ والترجمة.",
              ...RECON(
                "Thème recoupé sur des sources secondaires et le programme 3AS, sans relecture visuelle d un PDF ministériel dans cette session. Wording reconstructed, non certifiable official. À confronter au PDF dzexams avant toute utilisation comme énoncé."
              ),
              placeholder: "في الختام...",
              minLength: 40,
              modelAnswer: "في الختام، ترتبط النتيجة النهائية بـ مورثه ونسخ فتُغلق الظاهرة على ترجمه.",
              rule: {
                prompt: "الخاتمة التركيبية حول النسخ والترجمة",
                keywords: ["مورثه", "ترجمه", "ختام"],
                minHits: 2,
                forbidden: []
              }
            }
          }
        },
        {
          number: 2,
          ui: "text",
          label: "الموقع الفعال للإنزيم",
          max: 7,
          desc: "الأحماض الأمينية المحددة للتخصص",
          poles: {
            N: {
              points: 1,
              prompt: "تأطير الإشكالية حول: الموقع الفعال للإنزيم",
              bacPrompt: "ما المشكل العلمي المرتبط بـ الموقع الفعال للإنزيم؟",
              ...RECON(
                "Thème recoupé sur des sources secondaires et le programme 3AS, sans relecture visuelle d un PDF ministériel dans cette session. Wording reconstructed, non certifiable official. À confronter au PDF dzexams avant toute utilisation comme énoncé."
              ),
              placeholder: "صياغة المشكل العلمي...",
              minLength: 40,
              modelAnswer:
                "المشكل العلمي: كيف تتدخل الآليات المرتبطة بـ الموقع الفعال للإنزيم في الظاهرة المدروسة؟",
              rule: {
                prompt: "تأطير الإشكالية حول: الموقع الفعال للإنزيم",
                keywords: ["امينيه", "موقع"],
                minHits: 2,
                forbidden: []
              }
            },
            S: {
              points: 2.5,
              prompt: "استغلال الوثيقة المتعلقة بـ الموقع الفعال للإنزيم",
              bacPrompt: "حلّل أو استخرج من الوثيقة المعطيات المرتبطة بـ الموقع الفعال للإنزيم.",
              ...RECON(
                "Thème recoupé sur des sources secondaires et le programme 3AS, sans relecture visuelle d un PDF ministériel dans cette session. Wording reconstructed, non certifiable official. À confronter au PDF dzexams avant toute utilisation comme énoncé."
              ),
              placeholder: "نلاحظ... بينما... ومنه نستنتج...",
              minLength: 90,
              modelAnswer:
                "تمثل الوثيقة تغيرات امينيه بدلالة الزمن مقارنة بـ موقع. نلاحظ تغيرا واضحا في امينيه مقارنة بالشاهد، ومنه نستنتج علاقة مباشرة مع موقع.",
              rule: {
                prompt: "استغلال الوثيقة المتعلقة بـ الموقع الفعال للإنزيم",
                keywords: ["امينيه", "موقع", "نلاحظ"],
                minHits: 2,
                forbidden: ["بسبب"],
                document: {
                  kind: "curve",
                  axes: ["امينيه", "زمن"],
                  comparisons: [["امينيه", "موقع"]],
                  trends: [{ about: "امينيه", expect: ["امينيه", "موقع"] }],
                  values: [],
                  strictValues: false
                }
              }
            },
            E: {
              points: 2.5,
              prompt: "تفسير الآلية المرتبطة بـ الموقع الفعال للإنزيم",
              bacPrompt: "اشرح الآلية التي تفسر الموقع الفعال للإنزيم انطلاقا من الوثيقة ومعلوماتك.",
              ...RECON(
                "Thème recoupé sur des sources secondaires et le programme 3AS, sans relecture visuelle d un PDF ministériel dans cette session. Wording reconstructed, non certifiable official. À confronter au PDF dzexams avant toute utilisation comme énoncé."
              ),
              placeholder: "يعود ذلك إلى...",
              minLength: 110,
              modelAnswer:
                "يعود ذلك إلى تدخل امينيه وموقع عبر آلية دقيقة تؤدي إلى تخصص، فتتغير الوظيفة النهائية للظاهرة المدروسة.",
              rule: {
                prompt: "تفسير الآلية المرتبطة بـ الموقع الفعال للإنزيم",
                keywords: ["امينيه", "موقع", "تخصص"],
                minHits: 3,
                forbidden: []
              }
            },
            W: {
              points: 1,
              prompt: "الخاتمة التركيبية حول الموقع الفعال للإنزيم",
              bacPrompt: "لخّص النتيجة النهائية المرتبطة بـ الموقع الفعال للإنزيم.",
              ...RECON(
                "Thème recoupé sur des sources secondaires et le programme 3AS, sans relecture visuelle d un PDF ministériel dans cette session. Wording reconstructed, non certifiable official. À confronter au PDF dzexams avant toute utilisation comme énoncé."
              ),
              placeholder: "في الختام...",
              minLength: 40,
              modelAnswer: "في الختام، ترتبط النتيجة النهائية بـ امينيه وموقع فتُغلق الظاهرة على تخصص.",
              rule: {
                prompt: "الخاتمة التركيبية حول الموقع الفعال للإنزيم",
                keywords: ["امينيه", "تخصص", "ختام"],
                minHits: 2,
                forbidden: []
              }
            }
          }
        },
        {
          number: 3,
          ui: "text",
          label: "الأجسام المضادة",
          max: 8,
          desc: "التعرف النوعي على مولد الضد في المرحلة الفاعلة",
          poles: {
            N: {
              points: 0.5,
              prompt: "تأطير الإشكالية حول: الأجسام المضادة",
              bacPrompt: "ما المشكل العلمي المرتبط بـ الأجسام المضادة؟",
              ...RECON(
                "Thème recoupé sur des sources secondaires et le programme 3AS, sans relecture visuelle d un PDF ministériel dans cette session. Wording reconstructed, non certifiable official. À confronter au PDF dzexams avant toute utilisation comme énoncé."
              ),
              placeholder: "صياغة المشكل العلمي...",
              minLength: 30,
              modelAnswer:
                "المشكل العلمي: كيف تتدخل الآليات المرتبطة بـ الأجسام المضادة في الظاهرة المدروسة؟",
              rule: {
                prompt: "تأطير الإشكالية حول: الأجسام المضادة",
                keywords: ["مضاده", "مولد"],
                minHits: 2,
                forbidden: []
              }
            },
            S: {
              points: 2,
              prompt: "استغلال الوثيقة المتعلقة بـ الأجسام المضادة",
              bacPrompt: "حلّل أو استخرج من الوثيقة المعطيات المرتبطة بـ الأجسام المضادة.",
              ...RECON(
                "Thème recoupé sur des sources secondaires et le programme 3AS, sans relecture visuelle d un PDF ministériel dans cette session. Wording reconstructed, non certifiable official. À confronter au PDF dzexams avant toute utilisation comme énoncé."
              ),
              placeholder: "نلاحظ... بينما... ومنه نستنتج...",
              minLength: 60,
              modelAnswer:
                "تمثل الوثيقة تغيرات مضاده بدلالة الزمن مقارنة بـ مولد. نلاحظ تغيرا واضحا في مضاده مقارنة بالشاهد، ومنه نستنتج علاقة مباشرة مع مولد.",
              rule: {
                prompt: "استغلال الوثيقة المتعلقة بـ الأجسام المضادة",
                keywords: ["مضاده", "مولد", "نلاحظ"],
                minHits: 2,
                forbidden: ["بسبب"],
                document: {
                  kind: "curve",
                  axes: ["مضاده", "زمن"],
                  comparisons: [["مضاده", "مولد"]],
                  trends: [{ about: "مضاده", expect: ["مضاده", "مولد"] }],
                  values: [],
                  strictValues: false
                }
              }
            },
            E: {
              points: 4,
              prompt: "تفسير الآلية المرتبطة بـ الأجسام المضادة",
              bacPrompt: "اشرح الآلية التي تفسر الأجسام المضادة انطلاقا من الوثيقة ومعلوماتك.",
              ...RECON(
                "Thème recoupé sur des sources secondaires et le programme 3AS, sans relecture visuelle d un PDF ministériel dans cette session. Wording reconstructed, non certifiable official. À confronter au PDF dzexams avant toute utilisation comme énoncé."
              ),
              placeholder: "يعود ذلك إلى...",
              minLength: 110,
              modelAnswer:
                "يعود ذلك إلى تدخل مضاده ومولد عبر آلية دقيقة تؤدي إلى ضد، فتتغير الوظيفة النهائية للظاهرة المدروسة.",
              rule: {
                prompt: "تفسير الآلية المرتبطة بـ الأجسام المضادة",
                keywords: ["مضاده", "مولد", "ضد"],
                minHits: 3,
                forbidden: []
              }
            },
            W: {
              points: 1.5,
              prompt: "الخاتمة التركيبية حول الأجسام المضادة",
              bacPrompt: "لخّص النتيجة النهائية المرتبطة بـ الأجسام المضادة.",
              ...RECON(
                "Thème recoupé sur des sources secondaires et le programme 3AS, sans relecture visuelle d un PDF ministériel dans cette session. Wording reconstructed, non certifiable official. À confronter au PDF dzexams avant toute utilisation comme énoncé."
              ),
              placeholder: "مضاده → مولد → ضد",
              minLength: 40,
              modelAnswer: "عنوان المخطط: مضاده. مضاده → مولد → ضد.",
              rule: {
                prompt: "الخاتمة التركيبية حول الأجسام المضادة",
                keywords: ["مخطط", "مضاده", "ضد"],
                minHits: 2,
                forbidden: [],
                schema: { arrows: true, title: "مضاده", ordered: ["مضاده", "مولد", "ضد"] }
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
        "https://www.dzexams.com/uploads/sujets/officiels/bac/2013/dzexams-bac-sciences-4463279.pdf",
      pdfLocalUrl: "/subjects/SE/2013/sujet-2.pdf",
      pdfNote:
        "PDF non redistribué dans le dépôt. Page dzexams : https://www.dzexams.com/ar/annales/bjdJbVBZMHFKeUZTcExKSEw4REVNQT09. 2013 : PDF dzexams محمي في العارض. Thèmes pédagogiques reconstruits.",
      title: "الموضوع الثاني",
      exercises: [
        {
          number: 1,
          ui: "text",
          label: "كمون العمل",
          max: 5,
          desc: "دور القنوات الفولطية في زوال وعودة الاستقطاب",
          poles: {
            N: {
              points: 1,
              prompt: "تأطير الإشكالية حول: كمون العمل",
              bacPrompt: "ما المشكل العلمي المرتبط بـ كمون العمل؟",
              ...RECON(
                "Thème recoupé sur des sources secondaires et le programme 3AS, sans relecture visuelle d un PDF ministériel dans cette session. Wording reconstructed, non certifiable official. À confronter au PDF dzexams avant toute utilisation comme énoncé."
              ),
              placeholder: "صياغة المشكل العلمي...",
              minLength: 40,
              modelAnswer: "المشكل العلمي: كيف تتدخل الآليات المرتبطة بـ كمون العمل في الظاهرة المدروسة؟",
              rule: {
                prompt: "تأطير الإشكالية حول: كمون العمل",
                keywords: ["عمل", "قنوات"],
                minHits: 2,
                forbidden: []
              }
            },
            S: {
              points: 1,
              prompt: "استغلال الوثيقة المتعلقة بـ كمون العمل",
              bacPrompt: "حلّل أو استخرج من الوثيقة المعطيات المرتبطة بـ كمون العمل.",
              ...RECON(
                "Thème recoupé sur des sources secondaires et le programme 3AS, sans relecture visuelle d un PDF ministériel dans cette session. Wording reconstructed, non certifiable official. À confronter au PDF dzexams avant toute utilisation comme énoncé."
              ),
              placeholder: "نلاحظ... بينما... ومنه نستنتج...",
              minLength: 40,
              modelAnswer:
                "تمثل الوثيقة تغيرات عمل بدلالة الزمن مقارنة بـ قنوات. نلاحظ تغيرا واضحا في عمل مقارنة بالشاهد، ومنه نستنتج علاقة مباشرة مع قنوات.",
              rule: {
                prompt: "استغلال الوثيقة المتعلقة بـ كمون العمل",
                keywords: ["عمل", "قنوات", "نلاحظ"],
                minHits: 2,
                forbidden: ["بسبب"],
                document: {
                  kind: "curve",
                  axes: ["عمل", "زمن"],
                  comparisons: [["عمل", "قنوات"]],
                  trends: [{ about: "عمل", expect: ["عمل", "قنوات"] }],
                  values: [],
                  strictValues: false
                }
              }
            },
            E: {
              points: 2,
              prompt: "تفسير الآلية المرتبطة بـ كمون العمل",
              bacPrompt: "اشرح الآلية التي تفسر كمون العمل انطلاقا من الوثيقة ومعلوماتك.",
              ...RECON(
                "Thème recoupé sur des sources secondaires et le programme 3AS, sans relecture visuelle d un PDF ministériel dans cette session. Wording reconstructed, non certifiable official. À confronter au PDF dzexams avant toute utilisation comme énoncé."
              ),
              placeholder: "يعود ذلك إلى...",
              minLength: 120,
              modelAnswer:
                "يعود ذلك إلى تدخل عمل وقنوات عبر آلية دقيقة تؤدي إلى فولطيه، فتتغير الوظيفة النهائية للظاهرة المدروسة.",
              rule: {
                prompt: "تفسير الآلية المرتبطة بـ كمون العمل",
                keywords: ["عمل", "قنوات", "فولطيه"],
                minHits: 3,
                forbidden: []
              }
            },
            W: {
              points: 1,
              prompt: "الخاتمة التركيبية حول كمون العمل",
              bacPrompt: "لخّص النتيجة النهائية المرتبطة بـ كمون العمل.",
              ...RECON(
                "Thème recoupé sur des sources secondaires et le programme 3AS, sans relecture visuelle d un PDF ministériel dans cette session. Wording reconstructed, non certifiable official. À confronter au PDF dzexams avant toute utilisation comme énoncé."
              ),
              placeholder: "في الختام...",
              minLength: 40,
              modelAnswer: "في الختام، ترتبط النتيجة النهائية بـ عمل وقنوات فتُغلق الظاهرة على فولطيه.",
              rule: {
                prompt: "الخاتمة التركيبية حول كمون العمل",
                keywords: ["عمل", "فولطيه", "ختام"],
                minHits: 2,
                forbidden: []
              }
            }
          }
        },
        {
          number: 2,
          ui: "text",
          label: "ATP في الميتوكوندري",
          max: 7,
          desc: "دور تدرج البروتونات وATP سنتاز",
          poles: {
            N: {
              points: 1,
              prompt: "تأطير الإشكالية حول: ATP في الميتوكوندري",
              bacPrompt: "ما المشكل العلمي المرتبط بـ ATP في الميتوكوندري؟",
              ...RECON(
                "Thème recoupé sur des sources secondaires et le programme 3AS, sans relecture visuelle d un PDF ministériel dans cette session. Wording reconstructed, non certifiable official. À confronter au PDF dzexams avant toute utilisation comme énoncé."
              ),
              placeholder: "صياغة المشكل العلمي...",
              minLength: 40,
              modelAnswer:
                "المشكل العلمي: كيف تتدخل الآليات المرتبطة بـ ATP في الميتوكوندري في الظاهرة المدروسة؟",
              rule: {
                prompt: "تأطير الإشكالية حول: ATP في الميتوكوندري",
                keywords: ["بروتون", "سنتاز"],
                minHits: 2,
                forbidden: []
              }
            },
            S: {
              points: 2.5,
              prompt: "استغلال الوثيقة المتعلقة بـ ATP في الميتوكوندري",
              bacPrompt: "حلّل أو استخرج من الوثيقة المعطيات المرتبطة بـ ATP في الميتوكوندري.",
              ...RECON(
                "Thème recoupé sur des sources secondaires et le programme 3AS, sans relecture visuelle d un PDF ministériel dans cette session. Wording reconstructed, non certifiable official. À confronter au PDF dzexams avant toute utilisation comme énoncé."
              ),
              placeholder: "نلاحظ... بينما... ومنه نستنتج...",
              minLength: 90,
              modelAnswer:
                "تمثل الوثيقة تغيرات بروتون بدلالة الزمن مقارنة بـ سنتاز. نلاحظ تغيرا واضحا في بروتون مقارنة بالشاهد، ومنه نستنتج علاقة مباشرة مع سنتاز.",
              rule: {
                prompt: "استغلال الوثيقة المتعلقة بـ ATP في الميتوكوندري",
                keywords: ["بروتون", "سنتاز", "نلاحظ"],
                minHits: 2,
                forbidden: ["بسبب"],
                document: {
                  kind: "curve",
                  axes: ["بروتون", "زمن"],
                  comparisons: [["بروتون", "سنتاز"]],
                  trends: [{ about: "بروتون", expect: ["بروتون", "سنتاز"] }],
                  values: [],
                  strictValues: false
                }
              }
            },
            E: {
              points: 2.5,
              prompt: "تفسير الآلية المرتبطة بـ ATP في الميتوكوندري",
              bacPrompt: "اشرح الآلية التي تفسر ATP في الميتوكوندري انطلاقا من الوثيقة ومعلوماتك.",
              ...RECON(
                "Thème recoupé sur des sources secondaires et le programme 3AS, sans relecture visuelle d un PDF ministériel dans cette session. Wording reconstructed, non certifiable official. À confronter au PDF dzexams avant toute utilisation comme énoncé."
              ),
              placeholder: "يعود ذلك إلى...",
              minLength: 110,
              modelAnswer:
                "يعود ذلك إلى تدخل بروتون وسنتاز عبر آلية دقيقة تؤدي إلى ATP، فتتغير الوظيفة النهائية للظاهرة المدروسة.",
              rule: {
                prompt: "تفسير الآلية المرتبطة بـ ATP في الميتوكوندري",
                keywords: ["بروتون", "سنتاز", "ATP"],
                minHits: 3,
                forbidden: []
              }
            },
            W: {
              points: 1,
              prompt: "الخاتمة التركيبية حول ATP في الميتوكوندري",
              bacPrompt: "لخّص النتيجة النهائية المرتبطة بـ ATP في الميتوكوندري.",
              ...RECON(
                "Thème recoupé sur des sources secondaires et le programme 3AS, sans relecture visuelle d un PDF ministériel dans cette session. Wording reconstructed, non certifiable official. À confronter au PDF dzexams avant toute utilisation comme énoncé."
              ),
              placeholder: "في الختام...",
              minLength: 40,
              modelAnswer: "في الختام، ترتبط النتيجة النهائية بـ بروتون وسنتاز فتُغلق الظاهرة على ATP.",
              rule: {
                prompt: "الخاتمة التركيبية حول ATP في الميتوكوندري",
                keywords: ["بروتون", "ATP", "ختام"],
                minHits: 2,
                forbidden: []
              }
            }
          }
        },
        {
          number: 3,
          ui: "text",
          label: "الحمل الحراري والصفائح",
          max: 8,
          desc: "تيارات الرداء كمحرك لحركة الصفائح",
          poles: {
            N: {
              points: 0.5,
              prompt: "تأطير الإشكالية حول: الحمل الحراري والصفائح",
              bacPrompt: "ما المشكل العلمي المرتبط بـ الحمل الحراري والصفائح؟",
              ...RECON(
                "Thème recoupé sur des sources secondaires et le programme 3AS, sans relecture visuelle d un PDF ministériel dans cette session. Wording reconstructed, non certifiable official. À confronter au PDF dzexams avant toute utilisation comme énoncé."
              ),
              placeholder: "صياغة المشكل العلمي...",
              minLength: 30,
              modelAnswer:
                "المشكل العلمي: كيف تتدخل الآليات المرتبطة بـ الحمل الحراري والصفائح في الظاهرة المدروسة؟",
              rule: {
                prompt: "تأطير الإشكالية حول: الحمل الحراري والصفائح",
                keywords: ["حمل", "حراري"],
                minHits: 2,
                forbidden: []
              }
            },
            S: {
              points: 2,
              prompt: "استغلال الوثيقة المتعلقة بـ الحمل الحراري والصفائح",
              bacPrompt: "حلّل أو استخرج من الوثيقة المعطيات المرتبطة بـ الحمل الحراري والصفائح.",
              ...RECON(
                "Thème recoupé sur des sources secondaires et le programme 3AS, sans relecture visuelle d un PDF ministériel dans cette session. Wording reconstructed, non certifiable official. À confronter au PDF dzexams avant toute utilisation comme énoncé."
              ),
              placeholder: "نلاحظ... بينما... ومنه نستنتج...",
              minLength: 60,
              modelAnswer:
                "تمثل الوثيقة تغيرات حمل بدلالة الزمن مقارنة بـ حراري. نلاحظ تغيرا واضحا في حمل مقارنة بالشاهد، ومنه نستنتج علاقة مباشرة مع حراري.",
              rule: {
                prompt: "استغلال الوثيقة المتعلقة بـ الحمل الحراري والصفائح",
                keywords: ["حمل", "حراري", "نلاحظ"],
                minHits: 2,
                forbidden: ["بسبب"],
                document: {
                  kind: "curve",
                  axes: ["حمل", "زمن"],
                  comparisons: [["حمل", "حراري"]],
                  trends: [{ about: "حمل", expect: ["حمل", "حراري"] }],
                  values: [],
                  strictValues: false
                }
              }
            },
            E: {
              points: 4,
              prompt: "تفسير الآلية المرتبطة بـ الحمل الحراري والصفائح",
              bacPrompt: "اشرح الآلية التي تفسر الحمل الحراري والصفائح انطلاقا من الوثيقة ومعلوماتك.",
              ...RECON(
                "Thème recoupé sur des sources secondaires et le programme 3AS, sans relecture visuelle d un PDF ministériel dans cette session. Wording reconstructed, non certifiable official. À confronter au PDF dzexams avant toute utilisation comme énoncé."
              ),
              placeholder: "يعود ذلك إلى...",
              minLength: 110,
              modelAnswer:
                "يعود ذلك إلى تدخل حمل وحراري عبر آلية دقيقة تؤدي إلى رداء، فتتغير الوظيفة النهائية للظاهرة المدروسة.",
              rule: {
                prompt: "تفسير الآلية المرتبطة بـ الحمل الحراري والصفائح",
                keywords: ["حمل", "حراري", "رداء"],
                minHits: 3,
                forbidden: []
              }
            },
            W: {
              points: 1.5,
              prompt: "الخاتمة التركيبية حول الحمل الحراري والصفائح",
              bacPrompt: "لخّص النتيجة النهائية المرتبطة بـ الحمل الحراري والصفائح.",
              ...RECON(
                "Thème recoupé sur des sources secondaires et le programme 3AS, sans relecture visuelle d un PDF ministériel dans cette session. Wording reconstructed, non certifiable official. À confronter au PDF dzexams avant toute utilisation comme énoncé."
              ),
              placeholder: "حمل → حراري → رداء",
              minLength: 40,
              modelAnswer: "عنوان المخطط: حمل. حمل → حراري → رداء.",
              rule: {
                prompt: "الخاتمة التركيبية حول الحمل الحراري والصفائح",
                keywords: ["مخطط", "حمل", "رداء"],
                minHits: 2,
                forbidden: [],
                schema: { arrows: true, title: "حمل", ordered: ["حمل", "حراري", "رداء"] }
              }
            }
          }
        }
      ]
    }
  ]
};

export { YEAR_2013_SE };
export default YEAR_2013_SE;
