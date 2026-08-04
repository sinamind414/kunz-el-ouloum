import json
import re

with open('src/quizCorpus.ts', 'r', encoding='utf-8') as f:
    content = f.read()

new_questions = """  {
    "id": 501,
    "unitId": 1,
    "questionText": "حسب ملخصات البكالوريا، ما هو الدور الأساسي لإنزيم ARN بوليميراز (ARN polymérase)؟",
    "options": [
      "تنشيط الأحماض الأمينية وربطها بالـ ARNt.",
      "كسر الروابط الهيدروجينية لجزيء ADN ودمج النيكليوتيدات الريبية الحرة لبناء ARNm.",
      "ربط الأحماض الأمينية بروابط ببتيدية داخل الريبوزوم.",
      "تفكيك ARNm بعد انتهاء عملية الترجمة."
    ],
    "correctAnswerIndex": 1,
    "explanation": "إنزيم ARN بوليميراز يفك الالتفاف، يكسر الروابط الهيدروجينية، ويقرأ السلسلة المستنسخة (3'→5') لربط النيكليوتيدات الريبية بالتكامل لتشكيل ARNm (5'→3').",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_17_transcription_bubble_modern.svg"
  },
  {
    "id": 502,
    "unitId": 1,
    "questionText": "ما هي الفائدة البيولوجية لظاهرة «متعدد الريبوزوم» (البوليزوم) المذكورة في الحوصلة؟",
    "options": [
      "تخزين المعلومات الوراثية لحين الحاجة إليها.",
      "تسريع عملية الاستنساخ داخل النواة.",
      "تركيب كمية كبيرة من نفس البروتين في وقت قصير، حيث يترجم نفس ARNm بواسطة عدة ريبوزومات.",
      "تدمير البروتينات التالفة داخل الهيولى."
    ],
    "correctAnswerIndex": 2,
    "explanation": "البوليزوم (متعدد الريبوزوم) هو ارتباط عدة ريبوزومات بخيط ARNm واحد، مما يسمح بإنتاج نسخ كثيرة من نفس السلسلة الببتيدية في وقت قياسي.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_24_polysome_translation_modern.svg"
  },
  {
    "id": 503,
    "unitId": 1,
    "questionText": "لحدوث عملية «تنشيط الأحماض الأمينية»، ما هي العناصر الضرورية؟",
    "options": [
      "حمض أميني، ARNm، ريبوزوم، وطاقة ATP.",
      "حمض أميني، ARNt، إنزيم نوعي (أمينو أسيل ARNt سينتيتاز)، وطاقة ATP.",
      "حمض أميني، ADN، ARN بوليميراز، وطاقة.",
      "حمض أميني فقط، فالعملية تلقائية."
    ],
    "correctAnswerIndex": 1,
    "explanation": "التنشيط هو ربط الحمض الأميني بالـ ARNt الخاص به. ويتطلب: حمض أميني، ARNt، طاقة (ATP)، وإنزيم ربط نوعي.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_26_aa_activation_modern.svg"
  },
  {
    "id": 504,
    "unitId": 1,
    "questionText": "ما هو اتجاه الاستنساخ الصحيح على السلسلة المستنسخة لـ ADN؟",
    "options": [
      "من النهاية 5' نحو النهاية 3' للسلسلة المستنسخة.",
      "من النهاية 3' نحو النهاية 5' للسلسلة المستنسخة.",
      "يتم بشكل عشوائي حسب موقع الإنزيم.",
      "من اليمين إلى اليسار دائماً."
    ],
    "correctAnswerIndex": 1,
    "explanation": "إنزيم ARN بوليميراز يقرأ السلسلة المستنسخة في الاتجاه 3' → 5'، ليقوم ببناء الـ ARNm في الاتجاه 5' → 3'.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_17_transcription_bubble_modern.svg"
  },
  {
    "id": 505,
    "unitId": 2,
    "questionText": "حسب ملخصات البنية الفراغية، بم تتميز «البنية الثالثية» (Structure tertiaire) للبروتين؟",
    "options": [
      "تتابع خطي للأحماض الأمينية بروابط ببتيدية فقط.",
      "التفاف السلسلة لتشكيل حلزون ألفا أو وريقة بيتا بواسطة روابط هيدروجينية.",
      "انطواء السلسلة الثانوية في الفراغ، وتستقر بروابط (كبريتية، شاردية، هيدروجينية، كارهة للماء) بين الجذور (R).",
      "تجمع سلسلتين ببتيديتين أو أكثر."
    ],
    "correctAnswerIndex": 2,
    "explanation": "البنية الثالثية تنتج عن انطواء البنية الثانوية في الفراغ، وتحافظ على استقرارها 4 أنواع من الروابط تنشأ بين جذور الأحماض الأمينية (R).",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_45_four_levels_structure_modern.svg"
  },
  {
    "id": 506,
    "unitId": 2,
    "questionText": "ما هي الرابطة «التكافؤية» (القوية جداً) الوحيدة التي تساهم في استقرار البنية الثالثية والرابعية؟",
    "options": [
      "الرابطة الهيدروجينية.",
      "الرابطة الشاردية (الملحية).",
      "تجاذب الجذور الكارهة للماء.",
      "الجسر ثنائي الكبريت (Pont disulfure)."
    ],
    "correctAnswerIndex": 3,
    "explanation": "الجسر ثنائي الكبريت ينشأ بين جذرين لحمض السيستين (Cys)، وهو الرابطة التكافؤية (القوية) الوحيدة المساهمة في طي البروتين، بينما باقي الروابط ضعيفة.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_43_secondary_stabilization_modern.svg"
  },
  {
    "id": 507,
    "unitId": 2,
    "questionText": "متى نقول عن بروتين أنه يمتلك «بنية رابعية» (Structure quaternaire)؟",
    "options": [
      "عندما يحتوي على أكثر من 100 حمض أميني.",
      "عندما يتكون من تجمع سلسلتين ببتيديتين أو أكثر، كل سلسلة تسمى (تحت وحدة) ذات بنية ثالثية.",
      "عندما يمتلك جسوراً كبريتية.",
      "عندما يكتسب وظيفة إنزيمية."
    ],
    "correctAnswerIndex": 1,
    "explanation": "البنية الرابعية (مثل الهيموغلوبين) هي اتحاد تحت وحدتين (سلسلتين) أو أكثر، كل واحدة منهما تمتلك بنية ثالثية مستقلة.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_44_quaternary_hemoglobin_tim_modern.svg"
  },
  {
    "id": 508,
    "unitId": 2,
    "questionText": "في حالة فقر الدم المنجلي (Drépanocytose)، ما هو سبب فقدان الهيموغلوبين لوظيفته؟",
    "options": [
      "طفرة استبدال أدت إلى تغير حمض الغلوتاميك (Glu) بالفالين (Val) في السلسلة بيتا، مما غير بنيته الفراغية.",
      "غياب الحديد في الدم.",
      "تخريب إنزيم ARN بوليميراز.",
      "تكسر الجسور الكبريتية بسبب الحرارة."
    ],
    "correctAnswerIndex": 0,
    "explanation": "استبدال حمض أميني محب للماء (Glu) بآخر كاره للماء (Val) يغير البنية الفراغية، فتتبلور جزيئات الهيموغلوبين وتشوه الكرية الحمراء (تصبح منجلية).",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_28_anagene_mutation_compare_modern.jpg"
  },"""

# Insert right after "export const SVT_QUIZ_QUESTIONS: QuizQuestion[] = ["
pattern = re.compile(r'export const SVT_QUIZ_QUESTIONS: QuizQuestion\[\] = \[')
content = pattern.sub(f'export const SVT_QUIZ_QUESTIONS: QuizQuestion[] = [\n{new_questions}', content)

with open('src/quizCorpus.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print("QCMs added")
