with open('C:/Users/zakaria/Documents/application kunz el ouloum finale/src/lessonData.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Locate the lecon_transcription entry boundaries
start_marker = '  "lecon_transcription": {'
end_marker = '  "phase10_chapitres_19_20": {'

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

if start_idx == -1 or end_idx == -1 or end_idx < start_idx:
    raise SystemExit(f'Could not locate markers: start={start_idx}, end={end_idx}')

new_entry = '''  "lecon_transcription": {
    titleAr: `الفصل 3 : استنساخ المعلومات الوراثية الموجودة على مستوى ADN`,
    breadcrumb: `المجال الأول : التخصص الوظيفي للبروتينات • الوحدة الأولى : تركيب البروتين`,
    objectives: [
      `🎯 الهدف الحصري للدرس : تحديد مقر وآلية التصنيع الحيوي لجزيئة الـ ARNm انطلاقا من الـ ADN.`,
      `⏱️ المدة التقديرية للتعلم الذاتي : 20 دقيقة (بدون معلم)`
    ],
    phases: [
      {
        step: `1`,
        blocks: [
          {
            type: `problem`,
            title: `⚠️ التناقض الظاهري (مفتاح فهم الدرس)`,
            texts: [
              `تتواجد المعلومات الوراثية ADN داخل النواة عند حقيقيات النوى، بينما تتم عملية تركيب البروتينات في الهيولى (السيتوبلازم). علما أن جزيئة الـ ADN لا تغادر النواة أبدا بسبب حجمها الجزيئي الضخم، كيف تنتقل نسخة من هذه المعلومات إلى الهيولى لتركيب البروتين الخاص بها؟`
            ]
          },
          {
            type: `text`,
            texts: [
              `لحل هذه الإشكالية، اقترح العلماء وجود وسيط كيميائي (جزيئة ناقلة) ينقل الرسالة الوراثية من النواة إلى الهيولى. سميت هذه الجزيئة بـ الـ ARNm (حمض ريبي نووي رسول - ARN messager).`
            ]
          }
        ]
      },
      {
        step: `2`,
        blocks: [
          {
            type: `document`,
            active: true,
            texts: [
              `1. التعريف بالوثيقة : تمثل الوثيقة تتبع مسار الإشعاع في خلية حيوانية بعد حضنها في وسط يحتوي على اليوراسيل المشع (قاعدة مميزة للـ ARN ).`,
              `2. الملاحظة (التحليل الصارم دون تفسير) : • بعد 15 دقيقة : يتمركز الإشعاع كليا داخل النواة . • بعد 90 دقيقة : ينتقل الإشعاع من النواة ليستقر في الهيولى .`,
              `3. الاستنتاج الدقيق : يتم تركيب الـ ARNm داخل النواة ، ثم ينتقل إلى الهيولى حاملا معه نسخة من المعلومات الوراثية.`
            ]
          },
          {
            type: `document`,
            active: false,
            texts: [
              `منهجية البكالوريا : استخراج المعلومات من الشكل ماذا نستفيد من ظاهرة التعدد الاستنساخي؟ تظهر الصورة ارتباط عدة جزيئات من إنزيم ARN polymérase (ARN بوليميراز) بنفس مورثة الـ ADN في آن واحد، مما يسمح بإنتاج كميات هائلة من جزيئات الـ ARNm خلال فترة زمنية قصيرة. قاعدة تحديد اتجاه الاستنساخ في أسئلة البكالوريا : يتجه الاستنساخ دائما من الجهة التي تكون فيها خيوط الـ ARNm قصيرة (بداية المورثة) نحو الجهة التي تكون فيها خيوط الـ ARNm طويلة (نهاية المورثة) .`
            ]
          }
        ]
      },
      {
        step: `3`,
        blocks: [
          {
            type: `simulation`,
            texts: [
              `سلسلة الـ ADN المستنسخة (Brin Transcrit 3'→5') :`,
              `3'- T A C - G C T - A A G - C T A - A T T -5'`,
              `سلسلة الـ ARNm المتشكلة (اضغط على الزر لتركيب النكليوتيدات) :`,
              `5'- _ _ _ - _ _ _ - _ _ _ - _ _ _ - _ _ _ -3'`
            ],
            buttons: [
              `⚡ إضافة الرامزة التالية (Triplet)`,
              `🔄 إعادة المحاكاة`
            ]
          },
          {
            type: `bac_tip`,
            title: `💡 تنبيه هام جدا لبكالوريا العلوم التجريبية : فرق بين السلسلة المستنسخة وغير المستنسخة`,
            texts: [
              `السلسلة المستنسخة (Brin transcrit) هي السلسلة المقروءة من 3'→5' بواسطة إنزيم ARN بوليميراز، بينما السلسلة غير المستنسخة (Brin non transcrit) هي السلسلة المقابلة 5'→3'.`
            ]
          }
        ]
      },
      {
        step: `4`,
        blocks: [
          {
            type: `quiz`,
            question: `1. ما هو الإثبات التجريبي الذي يثبت أن الـ ARNm يتم تركيبيه داخل النواة ثم ينتقل إلى الهيولى؟`,
            options: [
              `أ) تجربة التتبع الإشعاعي باستخدام اليوراسيل المشع، حيث يظهر الإشعاع أولاً في النواة ثم في الهيولى بعد 90 دقيقة.`,
              `ب) تجربة Micropuncture التي تظهر أن الـ ARNm لا يغادر النواة أبداً.`,
              `ج) تجربة الطرد المركزي التي تظهر أن الـ ARNm يتواجد فقط في السيتوبلازم.`
            ],
            correct: 0
          }
        ]
      }
    ]
  },
'''

content = content[:start_idx] + new_entry + content[end_idx:]

with open('C:/Users/zakaria/Documents/application kunz el ouloum finale/src/lessonData.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print('Rewrote lecon_transcription entry successfully')
