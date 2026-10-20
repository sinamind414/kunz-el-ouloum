// sujetBlanc2.ts — H4b : le DEUXIÈME sujet blanc original intégral (audit 8
// axes 20/10/2026). Mêmes règles de rédaction que sujetBlanc1.ts :
//   · format algérien : TROIS exercices 5 + 7 + 8 = 20 points, 4 h 30 ;
//   · valeurs documents physiologiquement exactes, aucun chiffre inventé —
//     · Ex1 : glycémie normale ~1 g/L (0,8-1,2), îlots de Langerhans
//       (cellules β → insuline hypoglycémiante, cellules α → glucagon
//       hyperglycémiant), pancréas glande mixte — faits établis ;
//     · Ex2 : quotient respiratoire QR = CO2/O2 ; graines germées sur
//       substrat glucidique : O2 consommé = CO2 dégagé (QR = 1) et aussi
//       hors doc QR ≈ 0,7 pour les lipides — références classiques ;
//     · Ex3 : drépanocytose — mutation ponctuelle GAG→GTG (ADN) ⇒ ARNm
//       GAG→GUG ⇒ acide glutamique→valine (résultat séquencé réel), HbS
//       migre moins loin en électrophorèse (charges plus faibles), avantage
//       des hétérozygotes en zone de paludisme (polymorphisme équilibré) ;
//   · arabe فصحى, sujet déclaré « مقترح » ; AUCUNE note ici (le dénominateur
//     vit dans attendusSujetBlanc2.ts — Pierre 2).

import type { SujetBlanc } from './sujetBlanc1';

export const SUJET_BLANC_2: SujetBlanc = {
  id: 'blanc2',
  titreAr: 'الموضوع المقترح الثاني',
  sousTitreAr: 'موضوع أصلي على نمط بكالوريا — علوم الطبيعة والحياة · شعبة علوم تجريبية · 20 نقطة · 4 سا و 30 د',
  dureeMinutes: 270,
  totalPoints: 20,
  exercices: [
    {
      numero: 1,
      points: 5,
      titreAr: 'التمرين الأول (5 نقاط) — التنظيم الهرموني لتحلل السكر في الدم',
      texteAr:
        'بعد وجبة عادية ترتفع نسبة الجلوكوز في الدم، ثم تعود بعد ساعات إلى مستواها الاعتدالي (~1 غ/ل) وتبقى شبه ثابتة عند الشخص الصحيح. يُعزى هذه الثبات إلى التنسيق بين هرمونين يُفرزانهما مختلفات غدة البنكرياس.',
      documents: [],
      questions: [
        { id: 'blanc2-Ex1-Q1', texteAr: 'عرّف الهرمون.', points: 1 },
        { id: 'blanc2-Ex1-Q2', texteAr: 'وظف المعطيات: ما دور كل من الخلايا (بيتا) والخلايا (ألفا) في مختلفات لانغرهانس؟', points: 2 },
        { id: 'blanc2-Ex1-Q3', texteAr: 'وضّح كيف يتحقق التوازن في نسبة الجلوكوز (نظم الصمّام الذاتي).', points: 2 },
      ],
    },
    {
      numero: 2,
      points: 7,
      titreAr: 'التمرين الثاني (7 نقاط) — التنفس الخلوي عند بذور نابتة',
      texteAr:
        'وضعنا كمية من بذور القمح النابتة في جهاز يسمح بقياس حجم الأوكسجين المستهلك وحجم ثاني أكسيد الكربون المتحرر (المحتجز بمحلول KOH في التجربة الشاهدة) على مدى 8 ساعات.',
      documents: [
        {
          id: 'blanc2-Ex2-D1',
          titreAr: 'الوثيقة 1 — القياسات الحجمية عند 25 °س (بذور نابتة على وسط جلوكوز)',
          corpsAr:
            'الزمن (ساعة)                      | 0 | 2 | 4 | 6  | 8\n' +
            'الأوكسجين المستهلك (مل)    | 0 | 4 | 8 | 12 | 16\n' +
            'CO2 المتحرر (مل)                 | 0 | 4 | 8 | 12 | 16',
        },
        {
          id: 'blanc2-Ex2-D2',
          titreAr: 'الوثيقة 2 — تذكير علمي',
          corpsAr:
            'العدد الحصري للتنفس (QR) = حجم CO2 المتحرر / حجم الأوكسجين المستهلك.\n' +
            'تأكسد الجلوكوز يعطي QR = 1؛ تأكسد الشحوم يعطي QR قريباً من 0.7.',
        },
      ],
      questions: [
        {
          id: 'blanc2-Ex2-Q1',
          texteAr: 'عرّف العدد الحصري للتنفس (QR) ثم احسبه عند الساعة الثامنة.',
          points: 2,
        },
        {
          id: 'blanc2-Ex2-Q2',
          texteAr: 'ما طبيعة المادة المؤكسدة المستنتَجة من قيمة QR؟ بيّن كيف يُدعَم ذلك بقياسان متلازمَين في الوثيقة 1.',
          points: 2.5,
        },
        {
          id: 'blanc2-Ex2-Q3',
          texteAr: 'اكتب المعادلة الجملية لتأكسد الجلوكوز، وحدّد مكان حدوثها الأساسي في الخلية.',
          points: 2.5,
        },
      ],
    },
    {
      numero: 3,
      points: 8,
      titreAr: 'التمرين الثالث (8 نقاط) — الفقر المنجلي: من المعلومة الوراثية إلى السمة',
      texteAr:
        'الفقر المنجلي مرض وراثي يتسبب في تشوّه الكريات الحمراء (شكل الهلال). نملك نتائج تجربة الكهربائية الهجرة للهيموغلوبين المستخلص من ثلاثة أشخاص (شخص سليم، شخص مصاب، شخص متخالف الاقتران)، ونتائج تمتّع سلسلة DNA الخاصة بجين الهيموغلوبين عند المصاب.',
      documents: [
        {
          id: 'blanc2-Ex3-D1',
          titreAr: 'الوثيقة 1 — الهجرة الكهربائية للهيموغلوبين (المسافة المقطوعة بالسم)',
          corpsAr:
            'الشخص                        | السليم          | المصاب          | المتخالف الاقتران\n' +
            'حزمة قريبة من القطبة (-)  | HbA · 5 سم | —               | HbA · 5 سم\n' +
            'حزمة أقل ابتعاداً             | —                | HbS · 3 سم | HbS · 3 سم\n' +
            'الهيموغلوبين HbS أقل تنجيماً (شوائده الكهربائية أقل سالبية من HbA).',
        },
        {
          id: 'blanc2-Ex3-D2',
          titreAr: 'الوثيقة 2 — المقارنة الجزئية لسلسلة DNA (الشعرة المترجِمة) للجين',
          corpsAr:
            'الشخص السليم   : ... ACC GAG TTC ...\n' +
            'الشخص المصاب : ... ACC GTG TTC ...\n' +
            '(المقطع المشير هو ثلاثيات عديدة تُترجم من حيث الموضع المقابل في الشعرة.)\n' +
            'شيفرة عدة (mRNA) المقابلة للثلاثية المتغيرة: سليم GAG → مصاب GUG.',
        },
        {
          id: 'blanc2-Ex3-D3',
          titreAr: 'الوثيقة 3 — معطيات جغرافية-طبية',
          corpsAr:
            'تتطابق أعلى نسب للأجيال المتخالفة الاقتران من الفقر المنجلي مع المناطق التاريخية لانتشار الملاريا؛ وقد بُرهن تجريبياً على أن هذه الأجيال أكثر مقاومة للملاريا من الأفراد السليمة الاقتران.',
        },
      ],
      questions: [
        { id: 'blanc2-Ex3-Q1', texteAr: 'حلّل الوثيقة 1 وبيّن ماذا تُضيف الحزمتان لدى المتخالف الاقتران إلى تفسير وراثة المرض.', points: 2 },
        { id: 'blanc2-Ex3-Q2', texteAr: 'ترجم الوثيقة 2 إلى المستويين الجزيئي والبروتيني (نوع الطفرة، الحمض الأميني البديل).', points: 2.5 },
        { id: 'blanc2-Ex3-Q3', texteAr: 'فسّر تشوه الكريات الحمراء ونقص تأكسد الأنسجة عند المصاب.', points: 2 },
        { id: 'blanc2-Ex3-Q4', texteAr: 'كوّن تركيباً: أيُّ علاقة تربط الطفرة الجزئية بظهور سمة جديدة، وبتميّز المماثلين المتخالفة الاقتران في وسط الملاريّ.', points: 1.5 },
      ],
    },
  ],
};
