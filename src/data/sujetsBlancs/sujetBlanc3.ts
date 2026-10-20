// sujetBlanc3.ts — H4c : le TROISIÈME sujet blanc original intégral (audit 8
// axes 20/10/2026) — achève le triplet demandé par l'audit. Mêmes règles que
// sujetBlanc{1,2}.ts : format algérien 5 + 7 + 8 = 20 points, 4 h 30, valeurs
// exactes, arabe فصحى, dénominateur ailleurs (attendusSujetBlanc3.ts).
//   · Ex1 : protéines — 20 acides aminés courants, 4 niveaux d'organisation
//     (séquence, α/β, tertiaire par liaisons faibles/ponts S-S), dénaturation
//     par perte du repliement — faits établis ;
//   · Ex2 : photosynthèse — respiration à l'obscurité constante (0,6 mL/h),
//     point de compensation lorsque dégagement net = 0, saturation au-delà
//     d'une intensité forte — la table « brut » est donnée, le « net » est
//     l'application arithmétique net = brut − 0,6 (aucune mesure fabriquée) ;
//   · Ex3 : mitose — quantité d'ADN 2C en G1, réplication en phase S → 4C,
//     retour à 2C par cellule fille après séparation des chromatides ;
//     contraste avec la méiose (réduction) — cytologie classique.

import type { SujetBlanc } from './sujetBlanc1';

export const SUJET_BLANC_3: SujetBlanc = {
  id: 'blanc3',
  titreAr: 'الموضوع المقترح الثالث',
  sousTitreAr: 'موضوع أصلي على نمط بكالوريا — علوم الطبيعة والحياة · شعبة علوم تجريبية · 20 نقطة · 4 سا و 30 د',
  dureeMinutes: 270,
  totalPoints: 20,
  exercices: [
    {
      numero: 1,
      points: 5,
      titreAr: 'التمرين الأول (5 نقاط) — البدائع البروتينية: البنية والوظيفة',
      texteAr:
        'نحو 20 حمضاً أمينياً تُشكِّل الأساس الجزيئي للبروتينات الحية، وتكتسب كل بروتين وظيفته من طيّه الفراغي. عند تسخين بروتين (مثل بياض البيض) يتغيّر لونه وقوامه دون أي تغيير في تسلسله من الأحماض الأمينية.',
      documents: [],
      questions: [
        { id: 'blanc3-Ex1-Q1', texteAr: 'عرّف الأحماض الأمينية والرابطة الببتيدية.', points: 1.5 },
        { id: 'blanc3-Ex1-Q2', texteAr: 'اذكر مستويات التركيب الفضائي للبروتين وعناصر كل مستوى.', points: 3 },
        { id: 'blanc3-Ex1-Q3', texteAr: 'فسّر تأثير الحرارة على وظيفة البروتين رغم بقاء تسلسله.', points: 0.5 },
      ],
    },
    {
      numero: 2,
      points: 7,
      titreAr: 'التمرين الثاني (7 نقاط) — معدل التخليق الضوئي بدلالة شدة الإضاءة',
      texteAr:
        'في جهاز قياس الغازات، تُعرَّض نبتة مائية لإضاءات متزايدة (مع ضبط الحرارة وتركيز CO2)، ويُقاس عند كل شدة الإنتاج الخام للأوكسجين. في الظلام الكامل يساوي معدل التنفس 0.6 مل في الساعة.',
      documents: [
        {
          id: 'blanc3-Ex2-D1',
          titreAr: 'الوثيقة 1 — الإنتاج الخام للتخليق الضوئي بدلالة شدة الإضاءة (مل/ساعة)',
          corpsAr:
            'شدة الإضاءة (وحدات عرفية) | 0   | 5   | 10  | 20  | 40  | 80\n' +
            'الإنتاج الخام (مل/ساعة)          | 0   | 0.6 | 1.2 | 2.4 | 3.0 | 3.2',
        },
        {
          id: 'blanc3-Ex2-D2',
          titreAr: 'الوثيقة 2 — تذكير علمي',
          corpsAr:
            'الإنتاج الصافي = الإنتاج الخام − ما يستهلكه التنفس. عند الصافي الصفري تتساوى عمليتا التخليق الضوئي والتنفس (نقطة التعويض).',
        },
      ],
      questions: [
        {
          id: 'blanc3-Ex2-Q1',
          texteAr: 'احسب الإنتاج الصافي عند كل شدة، وحدّد شدة نقطة التعويض.',
          points: 2.5,
        },
        { id: 'blanc3-Ex2-Q2', texteAr: 'بيّن دور التنفس في التفسير (مصير الأوكسجين في الظلمة).', points: 2 },
        {
          id: 'blanc3-Ex2-Q3',
          texteAr: 'استنتج تأثير شدة الإضاءة على معدل التخليق الضوئي (منحنى تزايد ثم رخاء) وعامل الإشباع.',
          points: 2.5,
        },
      ],
    },
    {
      numero: 3,
      points: 8,
      titreAr: 'التمرين الثالث (8 نقاط) — دورة الخلية: مضاعفة DNA وانفصاله',
      texteAr:
        'تتبَّع الباحثون كمية DNA النسبية (بوحدة C) في خلايا مُتزامنة الطور، عبر أطوار الدورة الخلوية، مع مراقبة مجهرية لحركة الكروموسومات.',
      documents: [
        {
          id: 'blanc3-Ex3-D1',
          titreAr: 'الوثيقة 1 — كمية DNA بدلالة طور الخلية',
          corpsAr:
            'الطور         | G1 | S             | G2 | الانقسام (م) | ما بعد الانقسام\n' +
            'كمية DNA    | 2C | بين 2C و 4C | 4C | 4C            | 2C في كل خلية ابنة',
        },
        {
          id: 'blanc3-Ex3-D2',
          titreAr: 'الوثيقة 2 — المشاهد الجزئية',
          corpsAr:
            'أثناء الطور الاستوائي (الوسطي) تنتظم الكروموسومات المضاعفة في صفّ استوائي واحد، ثم تنفصل الاختانات الشقيقتان نحو قطبي الخلية.',
        },
      ],
      questions: [
        {
          id: 'blanc3-Ex3-Q1',
          texteAr: 'فسّر تطور كمية DNA من G1 إلى G2 (مضاعفة شبه محافظة في طور التركيب).',
          points: 2.5,
        },
        { id: 'blanc3-Ex3-Q2', texteAr: 'فسر عودة 2C في كل خلية ابنة بعد الانقسام.', points: 1.5 },
        {
          id: 'blanc3-Ex3-Q3',
          texteAr: 'قارن الانقسام الخيطي بالانقسام المنصف من جهة كمية الوراثة وعدد الصبغيات.',
          points: 2,
        },
        {
          id: 'blanc3-Ex3-Q4',
          texteAr:
            'كوّن تركيباً: لماذا يُعدّ انسجام المضاعفة والنسخ والانفصال شرطاً لسلامة الخلية ونقاء مرورها الوراثي؟',
          points: 2,
        },
      ],
    },
  ],
};
