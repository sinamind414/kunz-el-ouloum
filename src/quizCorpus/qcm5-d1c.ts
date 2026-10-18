import type { QuizQuestion } from '../types';

/*
 * M16 volet 2 (audit externe v2, 2026-10-18) — segment 6/6 : 1 QCM (domaine 'التخصص الوظيفي للبروتينات', unités 2,
 * ids 550..550).
 * Déplacement LITTÉRAL depuis src/quizCorpus.ts : octet pour octet,
 * aucun contenu modifié, ordre relatif = celui du fichier d)origine.
 * La concaténation des segments dans l)ordre (index.ts) restitue
 * exactement l)ordre global du corpus d)origine.
 */
export const QUESTIONS_D1C: QuizQuestion[] = [{
    "id": 550,
    "unitId": 2,
    "questionText": "نقطة التعادل الكهربائي (pHi) للألانين تساوي 6. عُرض محلول Ala للهجرة الكهربائية في محلول منظم ذي pH = 2. ما شحنة الحمض الأميني واتجاه هجرته؟",
    "options": [
      "شحنة سالبة، يهاجر نحو المصعد (القطب الموجب).",
      "شحنة متعادلة، لا يهاجر ويبقى في مكان الوضع.",
      "شحنة موجبة، يهاجر نحو المهبط (القطب السالب).",
      "لا شحنة نهائية، يهاجر نحو المصعد لأن المجموعة الكربوكسيلية حرّة."
    ],
    "correctAnswerIndex": 2,
    "explanation": "القاعدة المحورية: نقارن pH الوسط بـ pHi. هنا pH (2) < pHi (6)، إذن الحمض الأميني يحمل شحنة كهربائية موجبة (المجموعة الأمينية مبروتونة -NH₃⁺). والجسيم المشحون موجبا ينجذب نحو القطب المعاكس لشحنته أي المهبط (القطب السالب). تنبيه: الخيار «شحنة سالبة، يهاجر نحو المصعد (القطب الموجب).» فخ شائع في البكالوريا ناتج عن عكس المقارنة أو عكس اتجاه القطب — انتبه للمقارنة أولاً ثم للقطب.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_41_alanine_representations_modern.svg"
  }
];
