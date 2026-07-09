// src/data/bacRealSubjects.ts

export interface BacSubject {
  code: string
  year: number
  domain: number
  title: string
  duration: number // en minutes
  exercises: {
    id: string
    question: string
    points: number
    correction: string
  }[]
}

export const REAL_BAC_SUBJECTS: BacSubject[] = [
  {
    code: '903970',
    year: 2017,
    domain: 1,
    title: 'المناعة الخلوية والخمائر',
    duration: 50,
    exercises: [
      {
        id: '903970-ex1',
        question: '1- انطلاقا من الوثيقة 1، حدد طبيعة الخميرة المشاركة في التفاعل المناعي.\n2- صنف أنواع الاستجابة المناعية الموضحة في الوثيقة.',
        points: 2.5,
        correction: '1- الخميرة المشاركة هي خميرة البروتياز (Protease).\n2- الاستجابات المناعية هي: استجابة خلوية (تدخل اللمفاويات Tc) واستجابة خلطية (تدخل اللمفاويات B والبلعميات).'
      },
      {
        id: '903970-ex2',
        question: 'بالاعتماد على الوثيقة 2، فسر العلاقة بين تركيز الأجسام المضادة والزمن.',
        points: 4,
        correction: 'نلاحظ زيادة سريعة لتركيز الأجسام المضادة بين اليوم 3 واليوم 7، ثم استقرارها. هذا يفسر الاستجابة المناعية الأولية ثم الثانوية مع تكوين الخلايا الذاكرة.'
      }
    ]
  },
  {
    code: '904127',
    year: 2018,
    domain: 3,
    title: 'النشاط الجيني للخلايا',
    duration: 110,
    exercises: [
      {
        id: '904127-ex1',
        question: '1- عرف المورثة.\n2- اشرح آلية التعبير المورثي انطلاقا من معطيات الوثيقة 1.',
        points: 3,
        correction: '1- المورثة هي قطعة من ADN تحمل المعلومات الوراثية لتخليق بروتين معين.\n2- التعبير المورثي يشمل الاستنساخ (ADN → ARNm) ثم الترجمة (ARNm → بروتين) بمساعدة الريبوزومات و ARNt.'
      }
    ]
  }
  // ... Ajoute les 10 autres sujets ici après OCR
]
