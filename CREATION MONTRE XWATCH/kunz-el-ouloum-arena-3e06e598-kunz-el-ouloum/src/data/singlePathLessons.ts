/**
 * Single Path Lessons - Mot → Exemple → Micro-test (avec Speech-to-Text) → Méthodo incarnée
 * Leçons 2 et 3 - Design papier validé par owner
 * Prêt pour InteractiveLessonView + SpeechToTextInput
 * Respect Règle d'Or DZ: الاستنساخ, الهيولى, الرامزة, البرنس... préservés
 */

export interface DragDropOption {
  id: string;
  text: string;
  correct: boolean;
}

export interface SinglePathStep {
  id: 'mot' | 'exemple' | 'microtest' | 'methodo';
  title: string;
  badge: string;
  instruction: string;
  content: {
    type: 'text' | 'image_hotspot' | 'drag_drop' | 'table_bases' | 'speech_input' | 'quiz' | 'methodo_boxes';
    data: any;
  }[];
}

export interface SinglePathLesson {
  key: string;
  unitId: number;
  titleAr: string;
  breadcrumb: string;
  objective: string;
  motsSacre: string[]; // 5 mots sacrés DZ
  steps: SinglePathStep[];
}

export const SINGLE_PATH_LESSONS: Record<string, SinglePathLesson> = {
  lecon2_transcription: {
    key: 'lecon2_transcription',
    unitId: 1,
    titleAr: 'الدرس 2: استنساخ المعلومة الوراثية (Transcription)',
    breadcrumb: 'المجال الأول: التخصص الوظيفي للبروتينات • الوحدة 1: تركيب البروتين',
    objective: 'تحديد مقر وآلية التصنيع الحيوي لجزيئة ARNm انطلاقا من ADN - 5 mots sacrés mot par mot',
    motsSacre: ['السلسلة الناسخة', 'ARN بوليميراز', 'مبدأ التكامل', 'اتجاه الاستنساخ 3\'→5\'', 'ARNm'],
    steps: [
      {
        id: 'mot',
        title: 'الكلمة المفتاحية - السلسلة الناسخة',
        badge: 'كلمة 1/5',
        instruction: 'يتم التعبير عن المعلومة الوراثية على مرحلتين: الاستنساخ في النواة يتم انطلاقا من إحدى سلسلتي الـ ADN وتسمى ............',
        content: [
          {
            type: 'drag_drop',
            data: {
              question: 'يتم التعبير عن المعلومة الوراثية على مرحلتين: الاستنساخ في النواة يتم انطلاقا من إحدى سلسلتي الـ ADN وتسمى ............',
              options: [
                { id: 'opt1', text: 'السلسلة غير الناسخة', correct: false },
                { id: 'opt2', text: 'السلسلة المحمولة', correct: false },
                { id: 'opt3', text: 'السلسلة الناسخة', correct: true }
              ],
              correctFeedback: 'ممتاز! السلسلة الناسخة (Brin transcrit 3\'→5\') هي التي يقرأها ARN بوليميراز لصنع ARNm بالتكامل.',
              wrongFeedback: 'راجع الوثيقة 1 ص16: السلسلة الناسخة هي التي يُصنع منها ARNm بالتكامل.',
              definition: {
                term: 'السلسلة الناسخة',
                def: 'Brin transcrit 3\'→5\': سلسلة ADN التي يقرأها ARN بوليميراز لصنع ARNm بالتكامل. تسمى أيضا السلسلة القالبية.'
              }
            }
          },
          {
            type: 'speech_input',
            data: {
              question: 'سؤال الإنتاج: لماذا نسميها "ناسخة"؟ (أجب في سطر واحد)',
              placeholder: 'اكتب إجابتك هنا أو استخدم الميكروفون',
              expectedKeywords: ['تُنسخ', 'ARNm', 'قالب', 'تكامل'],
              correctFeedback: 'أحسنت! لأنها تُنسخ إلى ARNm.',
              hint: 'لأنها تُنسخ / لأنها قالب يُصنع منه ARNm'
            }
          }
        ]
      },
      {
        id: 'exemple',
        title: 'المثال - تجربة مثبط ARN بوليميراز',
        badge: 'مثال',
        instruction: 'الوثيقة 3 ص17: منحنى يمثل نسبة تشكل ARNm بدلالة تركيز مركب سام (ألفا أمانيتين)',
        content: [
          {
            type: 'image_hotspot',
            data: {
              image: '/assets/images/schemas/domaine1_proteines/schema_02_transcription.svg',
              hotspots: [
                { id: 'pol', top: '50%', left: '50%', label: 'ARN بوليميراز', correct: true },
                { id: 'adn_pol', top: '20%', left: '30%', label: 'ADN بوليميراز', correct: false },
                { id: 'helic', top: '70%', left: '70%', label: 'الهيليكاز', correct: false }
              ],
              question: 'انقر على الإنزيم المسؤول عن الاستنساخ في هذا المنحنى',
              correctFeedback: 'ممتاز! ARN بوليميراز هو المسؤول. الدراسة تظهر أن مثبطه يوقف العملية.',
              wrongFeedback: 'الوثيقة 3 ص17: هذا الإنزيم هو المسؤول عن الاستنساخ.'
            }
          },
          {
            type: 'text',
            data: {
              text: 'كلما زاد تركيز المركب السام (ألفا أمانيتين)، تناقصت نسبة تشكل ARNm إلى 0%. هذا يثبت أن ARN بوليميراز هو الإنزيم المسؤول.'
            }
          }
        ]
      },
      {
        id: 'microtest',
        title: 'الاختبار المصغر - مبدأ التكامل',
        badge: 'إنتاج',
        instruction: 'جدول التكامل: أكمل ARNm انطلاقا من ADN الناسخة',
        content: [
          {
            type: 'table_bases',
            data: {
              headers: ['ADN ناسخة 3\'→5\'', 'ARNm 5\'→3\''],
              rows: [
                { adn: 'T A C', arnm: '' },
                { adn: 'G C T', arnm: '' },
                { adn: 'A A G', arnm: '' }
              ],
              expected: [
                { adn: 'T A C', arnm: 'A U G' },
                { adn: 'G C T', arnm: 'C G A' },
                { adn: 'A A G', arnm: 'U U C' }
              ],
              hint: 'A→U, T→A, C→G, G→C - تذكر U مكان T في ARN'
            }
          },
          {
            type: 'speech_input',
            data: {
              question: 'إذا كانت السلسلة الناسخة TAC, ماذا تكون رامزة ARNm؟',
              placeholder: 'قل أو اكتب AUG',
              expectedKeywords: ['AUG'],
              correctFeedback: 'ممتاز! TAC (ADN) → AUG (ARNm) وهي رامزة البداية.',
              hint: 'AUG - بداية الترجمة'
            }
          }
        ]
      },
      {
        id: 'methodo',
        title: 'المنهجية المجسدة',
        badge: 'منهجية',
        instruction: 'بناء نص علمي من 3 كتل: مقدمة - عرض - خاتمة باستخدام الكلمات المفتاحية',
        content: [
          {
            type: 'methodo_boxes',
            data: {
              boxes: [
                {
                  label: 'المقدمة (طرح المشكل)',
                  placeholder: 'تتميز الخلايا حقيقية النواة بوجود ADN في النواة بينما تركيب البروتين في الهيولى، فكيف...؟',
                  keywords: ['النواة', 'الهيولى'],
                  example: 'تتواجد المعلومات الوراثية ADN داخل النواة بينما تركيب البروتين في الهيولى، كيف تنتقل نسخة من المعلومات؟'
                },
                {
                  label: 'العرض (الآلية)',
                  placeholder: 'يتم الاستنساخ في النواة بواسطة ARN بوليميراز الذي يقرأ السلسلة الناسخة 3\'→5\' ويركب ARNm 5\'→3\' حسب مبدأ التكامل...',
                  keywords: ['ARN بوليميراز', 'السلسلة الناسخة', 'تكامل', '3\'', '5\''],
                  example: 'يتم الاستنساخ في النواة بواسطة ARN بوليميراز الذي يقرأ السلسلة الناسخة 3\'→5\' ويركب ARNm 5\'→3\' حسب مبدأ التكامل A-U, C-G.'
                },
                {
                  label: 'الخاتمة',
                  placeholder: 'وعليه، الاستنساخ هو نسخ المعلومة من ADN إلى ARNm الذي سينتقل للهيولى...',
                  keywords: ['ARNm', 'الهيولى', 'تركيب البروتين'],
                  example: 'وعليه، الاستنساخ هو نسخ المعلومة الوراثية من ADN (السلسلة الناسخة) إلى ARNm الذي يغادر النواة نحو الهيولى ليكون قالبا للترجمة.'
                }
              ]
            }
          }
        ]
      }
    ]
  },

  lecon3_traduction: {
    key: 'lecon3_traduction',
    unitId: 1,
    titleAr: 'الدرس 3: الترجمة - الشفرة الوراثية',
    breadcrumb: 'المجال الأول: التخصص الوظيفي للبروتينات • الوحدة 1: تركيب البروتين',
    objective: 'فهم وحدة الشفرة: الرامزة = 3 قواعد، AUG بداية، UAA/UAG/UGA توقف، المورثة',
    motsSacre: ['الرامزة', 'الشفرة الوراثية', 'AUG - بداية', 'UAA/UAG/UGA - توقف', 'المورثة'],
    steps: [
      {
        id: 'mot',
        title: 'الكلمة المفتاحية - الرامزة',
        badge: 'كلمة 1/5',
        instruction: 'وحدة الشفرة الوراثية هي ثلاثية من القواعد تدعى ............',
        content: [
          {
            type: 'drag_drop',
            data: {
              question: 'وحدة الشفرة الوراثية هي ثلاثية من القواعد تدعى ............',
              options: [
                { id: '1', text: 'النيوكليوتيدة', correct: false },
                { id: '2', text: 'الرامزة', correct: true },
                { id: '3', text: 'الحمض الأميني', correct: false }
              ],
              correctFeedback: 'ممتاز! الرامزة = 3 قواعد = 1 حمض أميني.',
              definition: { term: 'الرامزة', def: 'Codon: ثلاثية من القواعد الآزوتية على ARNm تحدد حمضا أمينيا. Ex: AUG = Méthionine' }
            }
          },
          {
            type: 'speech_input',
            data: {
              question: 'ما هي وحدة الشفرة؟ (شرح في سطر)',
              placeholder: 'الرامزة هي 3 قواعد...',
              expectedKeywords: ['3 قواعد', 'الرامزة', 'حمض أميني'],
              hint: '3 قواعد = رامزة = 1 حمض أميني'
            }
          }
        ]
      },
      {
        id: 'exemple',
        title: 'المثال - لماذا 3 قواعد؟',
        badge: 'مثال',
        instruction: 'اللغة النووية 4 أحرف (A,U,C,G)، اللغة البروتينية 20 حمض أميني. لماذا 1 أو 2 غير كافية؟',
        content: [
          {
            type: 'text',
            data: {
              text: 'الفرضية 1: 1 نيوكليوتيد = 1 حمض → 4^1 = 4 < 20 (غير كافي)\nالفرضية 2: 2 نيوكليوتيدات = 16 < 20 (غير كافي)\nالفرضية 3: 3 نيوكليوتيدات = 4^3 = 64 > 20 (كافي، هذه هي الشفرة الحقيقية)'
            }
          },
          {
            type: 'image_hotspot',
            data: {
              image: '/assets/images/schemas/domaine1_proteines/schema_05_code_genetique.svg',
              hotspots: [
                { id: 'aug', top: '30%', left: '50%', label: 'AUG - Méthionine - بداية', correct: true },
                { id: 'uaa', top: '60%', left: '30%', label: 'UAA - توقف', correct: true },
                { id: 'random', top: '70%', left: '70%', label: 'CCC - Proline', correct: false }
              ],
              question: 'انقر على رامزة البداية ورامزة التوقف في جدول الشفرة',
              correctFeedback: 'ممتاز! AUG = بداية, UAA/UAG/UGA = توقف'
            }
          }
        ]
      },
      {
        id: 'microtest',
        title: 'الاختبار المصغر - AUG و UAA',
        badge: 'إنتاج',
        instruction: 'اختبر معلوماتك',
        content: [
          {
            type: 'speech_input',
            data: {
              question: 'إذا كان ARNm = AUG UGG UAA, كم حمض أميني؟ وما هما؟',
              placeholder: '2 حمض: ميثونين و تربتوفان',
              expectedKeywords: ['2', 'ميثونين', 'تربتوفان', 'Met', 'Trp', 'AUG', 'UGG'],
              correctFeedback: 'ممتاز! 2 حمض أميني: Met (AUG بداية) + Trp (UGG). UAA = توقف لا تشفر.',
              hint: '2 حمض، UAA لا تشفر'
            }
          },
          {
            type: 'drag_drop',
            data: {
              question: 'ماذا تشفر UAA/UAG/UGA؟',
              options: [
                { id: '1', text: 'لا تشفر أي حمض أميني، توقف', correct: true },
                { id: '2', text: 'تشفر ميثونين', correct: false },
                { id: '3', text: 'تشفر 20 حمض', correct: false }
              ],
              correctFeedback: 'صحيح! رامزات توقف: تجلب عامل تحرير، ليس ARNt.'
            }
          }
        ]
      },
      {
        id: 'methodo',
        title: 'المنهجية المجسدة',
        badge: 'منهجية',
        instruction: 'بناء نص علمي حول الشفرة الوراثية',
        content: [
          {
            type: 'methodo_boxes',
            data: {
              boxes: [
                {
                  label: 'المقدمة',
                  placeholder: 'اللغة النووية 4 أحرف واللغة البروتينية 20 حمض، كيف يمكن الترميز؟',
                  keywords: ['4 أحرف', '20 حمض'],
                  example: 'تتكون اللغة النووية من 4 قواعد بينما اللغة البروتينية من 20 حمض، فكيف يتم التشفير؟'
                },
                {
                  label: 'العرض',
                  placeholder: 'وحدة الشفرة هي الرامزة = 3 قواعد تشفر حمضا، AUG بداية، UAA/UAG/UGA توقف...',
                  keywords: ['الرامزة', '3 قواعد', 'AUG', 'UAA', 'توقف'],
                  example: 'وحدة الشفرة هي الرامزة = 3 قواعد، 4^3=64 رامزة تشفر 20 حمض. AUG=بداية (Met)، UAA/UAG/UGA=توقف لا تشفر.'
                },
                {
                  label: 'الخاتمة',
                  placeholder: 'وعليه، الشفرة الوراثية ثلاثية، مترادفة، غير متداخلة...',
                  keywords: ['ثلاثية', 'توقف'],
                  example: 'وعليه، الشفرة ثلاثية، AUG بداية، UAA/UAG/UGA نهاية.'
                }
              ]
            }
          }
        ]
      }
    ]
  }
};
