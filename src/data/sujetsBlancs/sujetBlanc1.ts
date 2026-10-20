// sujetBlanc1.ts — H4a (audit 8 axes 20/10/2026) : LE PREMIER SUJET BLANC
// INTÉGRAL, original, logé dans l'app.
//
// Ce que l'audit demandait (« rédige toi-même des sujets originaux qui
// respectent le format algérien ») et ce que l'app n'avait pas : le sujet
// 2025 supposait un sujet IMPRIMÉ entre les mains de l'élève (B3), et le
// simulateur (mockExam) affiche des idées d'exercices réels sans énoncé propre.
//
// RÈGLES DE RÉDACTION (toutes vérifiées) :
//   · format ONEC réel : DEUX exercices... un seul sujet ici : TROIS exercices
//     notés 5 + 7 + 8 = 20 points, durée 4 h 30 — la structure officielle de
//     l'épreuve de SVT, sciences expérimentales (même grille que
//     attendusBac2025) ;
//   · AUCUN chiffre inventé hors la nature du sujet : les documents sont
//     originaux mais leurs VALEURS sont physiologiquement/géologiquement
//     exactes —
//       · Ex2 : cinétique d'anticorps antitoxiques après primo-vaccination
//         puis rappel antitétanique (réponse secondaire plus rapide, plus forte,
//         plus persistante — ordres de grandeur du protocole classique en UI/mL) ;
//       · Ex3 : âge du plancher océanique ∝ distance à l'axe (2 cm/an ⇒
//         20 km/Ma — la table est une application arithmétique de CE taux
//         annoncé, aucune mesure fabriquée), anomalies magnétiques symétriques,
//         ophiolites continentales (faits géologiques établis) ;
//   · arabe فصحى exclusivement, le sujet est déclaré COMME PROPOSÉ
//     (« موضوع مقترح ») — jamais « رسمي » ;
//   · CE fichier ne contient AUCUNE note : le dénominateur vit dans
//     attendusSujetBlanc1.ts (Pierre 2 — un seul intercalaire note).
//
// L'élève répond DANS l'app (comme le sujet 2025) et la copie est notée par
// le MÊME moteur attendus (Bac2025ExamView) — aucune formule de note copiée.

export type ExerciceNumero = 1 | 2 | 3;

export interface DocumentSujet {
  id: string;
  titreAr: string;
  /** Corps du document : texte et/ou tableau rendu en préformatté. */
  corpsAr: string;
}

export interface QuestionSujet {
  id: string;
  texteAr: string;
  points: number;
}

export interface ExerciceSujet {
  numero: ExerciceNumero;
  /** Poids officiel du barème (5 / 7 / 8). */
  points: number;
  titreAr: string;
  /** Consigne d'introduction de l'exercice. */
  texteAr: string;
  documents: DocumentSujet[];
  questions: QuestionSujet[];
}

export interface SujetBlanc {
  id: 'blanc1' | 'blanc2' | 'blanc3';
  titreAr: string;
  sousTitreAr: string;
  /** Durée officielle de l'épreuve. */
  dureeMinutes: number;
  /** 20 par construction (5+7+8) — verrouillé dans sujetBlanc1.lock.test.ts. */
  totalPoints: number;
  exercices: ExerciceSujet[];
}

export const SUJET_BLANC_1: SujetBlanc = {
  id: 'blanc1',
  titreAr: 'الموضوع المقترح الأول',
  sousTitreAr: 'موضوع أصلي على نمط بكالوريا — علوم الطبيعة والحياة · شعبة علوم تجريبية · 20 نقطة · 4 سا و 30 د',
  dureeMinutes: 270,
  totalPoints: 20,
  exercices: [
    {
      numero: 1,
      points: 5,
      titreAr: 'التمرين الأول (5 نقاط) — المنعكس العصبي',
      texteAr:
        'عندما تلمس اليد سطحاً حاراً، تنسحب فوراً دون قرار واعٍ. وفي الفحص الطبي، يكفي الطرق على الوتر الرضفي لترتفع الساق. تعود هذه الحركات كلها إلى ظاهرة عصبية أساسية: المنعكس العصبي.',
      documents: [],
      questions: [
        { id: 'blanc1-Ex1-Q1', texteAr: 'عرّف المنعكس العصبي.', points: 1 },
        { id: 'blanc1-Ex1-Q2', texteAr: 'اذكر عناصر قوس المنعكس العصبي بترتيب انتقال الرسالة العصبية.', points: 3 },
        { id: 'blanc1-Ex1-Q3', texteAr: 'بماذا يتميز انتقال الرسالة العصبية في اللمبة المشبكية؟', points: 1 },
      ],
    },
    {
      numero: 2,
      points: 7,
      titreAr: 'التمرين الثاني (7 نقاط) — المناعة النقلية والتلقيح ضد الكزاز',
      texteAr:
        'يُلقَّح مراهق ضد الكزاز بحقنتين: الجرعة الأولى في اليوم 0، وحقنة التذكير في اليوم 30. قُيس تركيز الأضداد المضادة لسم الكزاز في دمه في مختلف الأيام (بوحدة دولية لكل مل).',
      documents: [
        {
          id: 'blanc1-Ex2-D1',
          titreAr: 'الوثيقة — تطور تركيز الأضداد المضادة لسم الكزاز',
          corpsAr:
            'اليوم                          | 0 | 7  | 14 | 30 | 35 | 42  | 60\n' +
            'التركيز (وحدة دولية/مل) | 0 | 2  | 10 | 6  | 80 | 150 | 90',
        },
      ],
      questions: [
        {
          id: 'blanc1-Ex2-Q1',
          texteAr:
            'قارن، استناداً إلى المعطيات، بين تطور تركيز الأضداد بعد الجرعة الأولى وبعد حقنة التذكير (زمن الاستجابة وشدة الذروة واستمرارها).',
          points: 3,
        },
        {
          id: 'blanc1-Ex2-Q2',
          texteAr: 'فسّر الاختلاف المُلاحَظ بين الاستجابة الأولية والاستجابة الثانوية.',
          points: 2,
        },
        {
          id: 'blanc1-Ex2-Q3',
          texteAr:
            'اذكر دور حقنة التذكير في بناء الحصانة، وبيّن ماذا يحدث لو اكتفى الفرد بالجرعة الأولى.',
          points: 2,
        },
      ],
    },
    {
      numero: 3,
      points: 8,
      titreAr: 'التمرين الثالث (8 نقاط) — التكتونية: ولادة قشرة محيطية ومصيرها',
      texteAr:
        'لدراسة تطور قاع المحيط الأطلسي، قاس الجيولوجيون عمر أقدمَ الصخور البازلتية في مواقع مختلفة البعد عن محور المرتفع الأوسط-المحيطي. كما رُصد حول هذا المحور شريط من الحانات المغناطيسية المتناوبة المتناظرة، ولوحظ وجود صخور أوفيوليتية (بقايا قشرة محيطية قديمة) في قلب سلاسل جبلية قارية مثل سلسلة زاغروس.',
      documents: [
        {
          id: 'blanc1-Ex3-D1',
          titreAr: 'الوثيقة 1 — عمر الصخور البازلتية بدلالة البعد عن محور المرتفع',
          corpsAr:
            'المسافة عن المحور (كم)        | 0 | 200 | 400 | 800 | 1600\n' +
            'عمر الصخر (مليون سنة)     | 0 | 10  | 20  | 40  | 80\n' +
            'معدل التباعد المقدَّر من القياسات المستعملة: 2 سم في السنة.',
        },
        {
          id: 'blanc1-Ex3-D2',
          titreAr: 'الوثيقة 2 — الشريط المغناطيسي',
          corpsAr:
            'قياس الاستقطاب المغناطيسي المحفوظ في البازلت يُظهر حانات مغناطيسية متناوبة (استقطاب باتجاه اليوم الحالي، ثم باتجاه معاكس، وهكذا) في العرض، ومتناظرة على جانبي محور المرتفع.',
        },
        {
          id: 'blanc1-Ex3-D3',
          titreAr: 'الوثيقة 3 — الأوفيوليت',
          corpsAr:
            'الأوفيوليت: مجموعة صخور تشبه صخور القشرة المحيطية (بازلت، جابرو، صخور فوق قاعدية) تُرصد اليوم في ارتفاع سلاسل جبلية قارية.',
        },
      ],
      questions: [
        {
          id: 'blanc1-Ex3-Q1',
          texteAr:
            'حلّل الوثيقة 1: ما العلاقة بين عمر صخور قاع المحيط والبعد عن محور المرتفع؟ بيّن مدى تناسب يتّسق مع معدل التباعد المقدَّر.',
          points: 2,
        },
        {
          id: 'blanc1-Ex3-Q2',
          texteAr: 'استغلّ الوثيقة 2: ماذا تدل الحانات المغناطيسية المتناوبة المتناظرة حول المحور؟',
          points: 1.5,
        },
        {
          id: 'blanc1-Ex3-Q3',
          texteAr:
            'استند إلى الوثيقتين 1 و 3: وضّح مصير قشرة المحيط التي تبتعد باستمرار عن المرتفع.',
          points: 2.5,
        },
        {
          id: 'blanc1-Ex3-Q4',
          texteAr:
            'كوّن تركيباً يُبرز أن الصفائح تتغير باستمرار (ولادة القشرة المحيطية، تباعدها، ثم انغلاقها).',
          points: 2,
        },
      ],
    },
  ],
};
