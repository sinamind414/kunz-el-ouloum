// src/services/guidedKeywordCounterProof.test.ts
// Contre-épreuve de la vérification par mots-clés des questions guidées de leçon
// (InteractiveLessonView → GUIDED_DOC_QA), la surface visée par le constat #33.
//
// #43 — La question « حدد اتجاه حدوث الاستنساخ » n'exigeait que les caractères
// « 5 » et « 3 » : la date « 2035 » était acceptée, tandis que la réponse juste
// écrite en toutes lettres (« من الطرف الخماسي نحو الطرف الثلاثي ») était refusée.
import { describe, it, expect } from 'vitest';
import { ACTIVE_LESSONS } from '../data/activeLessons';
import { validateKeywordAnswer } from './proteinChapterValidationService';

type GuidedQuestion = {
  id: string;
  requiredKeywords?: string[];
  orderedKeywords?: string[];
  forbiddenKeywords?: string[];
  successMessageAr?: string;
};

const QUESTIONS: GuidedQuestion[] = Object.values(ACTIVE_LESSONS).flatMap((lesson) =>
  (lesson.blocks ?? []).flatMap((block: { type?: string; questions?: GuidedQuestion[] }) =>
    block.type === 'GUIDED_DOC_QA' ? (block.questions ?? []) : [],
  ),
);

const valide = (answer: string, q: GuidedQuestion) =>
  validateKeywordAnswer(answer, q.requiredKeywords ?? [], q.forbiddenKeywords ?? []).valid;

const question = (id: string) => {
  const q = QUESTIONS.find((x) => x.id === id);
  if (!q) throw new Error(`question introuvable : ${id}`);
  return q;
};

describe('#43 — contre-épreuve des questions guidées par mots-clés', () => {
  it('le corpus de questions guidées est bien celui attendu', () => {
    expect(QUESTIONS.length).toBeGreaterThanOrEqual(22);
  });

  it('sens inverse : aucune réponse creuse ou hors-sujet n’est acceptée', () => {
    const rebuts = ['كرة القدم رياضة جميلة والطقس حار اليوم', 'لا اعرف الجواب', '   ', '2035'];
    const fuites: string[] = [];
    for (const texte of rebuts) {
      for (const q of QUESTIONS) if (valide(texte, q)) fuites.push(`${q.id} ← « ${texte.trim()} »`);
    }
    expect(fuites, `réponses non valables acceptées : ${fuites.join(', ')}`).toEqual([]);
  });

  it('direction de transcription : les graphies légitimes sont acceptées', () => {
    const q = question('transcription_direction');
    for (const bonne of [
      "من 5 نحو 3",
      "الاتجاه 5' → 3'",
      "5'->3'",
      'يتم في الاتجاه من 5 الى 3',
      'من الطرف الخماسي نحو الطرف الثلاثي', // réponse en toutes lettres
      'الخماسي ⟶ الثلاثي',
    ]) {
      expect(valide(bonne, q), `refusée à tort : ${bonne}`).toBe(true);
    }
  });

  it('direction de transcription : une suite de chiffres sans sens est refusée', () => {
    const q = question('transcription_direction');
    // « 2035 » contient un 5 et un 3 : c'était le faux positif d'origine.
    for (const mauvaise of ['2035', '53', '3 5', '555']) {
      expect(valide(mauvaise, q), `acceptée à tort : ${mauvaise}`).toBe(false);
    }
  });

  it('un mot-clé dont toutes les variantes disparaissent à la normalisation ne valide rien', () => {
    // normalizeAr efface la ponctuation : une variante « → » seule devient vide,
    // et `includes('')` est toujours vrai. Ce piège doit rester fermé.
    expect(validateKeywordAnswer('كرة القدم', ['→'], []).valid).toBe(false);
    expect(validateKeywordAnswer('n’importe quoi', ['->|→'], []).valid).toBe(false);
  });

  it('l’alternance « | » reste rétrocompatible avec les mots-clés simples', () => {
    expect(validateKeywordAnswer('يحتوي على الريبوزوم', ['الريبوزوم'], []).valid).toBe(true);
    expect(validateKeywordAnswer('نص quelconque', ['الريبوزوم'], []).valid).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// #44 — Le SENS ne se vérifie pas par présence.
// Le correctif #43 acceptait « من 3 نحو 5 » : les mêmes mots-clés que la
// réponse juste, dans l'ordre inverse, donc une réponse scientifiquement
// fausse validée à 100 %. Ces garde-fous mesurent les DEUX sens, sur les
// données réelles de la leçon.
// ---------------------------------------------------------------------------
describe('#44 — sens de la transcription : ordre des bornes', () => {
  const question = QUESTIONS.find((q) => q.id === 'transcription_direction');

  const check = (answer: string) =>
    validateKeywordAnswer(answer, question!.requiredKeywords ?? [], question!.forbiddenKeywords ?? [], {
      orderedKeywords: question!.orderedKeywords,
    });

  it('la donnée déclare bien les deux bornes comme ordonnées', () => {
    expect(question).toBeDefined();
    expect(question!.orderedKeywords).toEqual(['5|خماسي', '3|ثلاثي']);
  });

  it.each([
    ['chiffres', 'يتم الاستنساخ من 5 نحو 3'],
    ['flèche unicode', "الاتجاه 5' → 3'"],
    ['flèche ASCII', "5'->3'"],
    ['toutes lettres', 'من الطرف الخماسي نحو الطرف الثلاثي'],
    // Une copie complète cite le sens de LECTURE (3'→5') PUIS celui de
    // SYNTHÈSE (5'→3') : elle doit rester acceptée.
    [
      'lecture puis synthèse',
      'يقرأ ARN بوليمراز السلسلة الناسخة من الطرف الثلاثي نحو الطرف الخماسي فيركب ARNm من الخماسي نحو الثلاثي',
    ],
  ])('accepte une réponse juste : %s', (_label, answer) => {
    expect(check(answer).valid).toBe(true);
  });

  it.each([
    ['sens inverse en chiffres', 'يتم الاستنساخ من 3 نحو 5'],
    ['sens inverse fléché', "الاتجاه 3' → 5'"],
    ['sens inverse en lettres', 'من الطرف الثلاثي نحو الطرف الخماسي'],
  ])('refuse le sens inverse : %s', (_label, answer) => {
    const result = check(answer);
    expect(result.valid).toBe(false);
    expect(result.code).toBe('WRONG_KEYWORD_ORDER');
  });

  it("n'altère pas le comportement des 21 autres questions guidées", () => {
    const others = QUESTIONS.filter((q) => q.id !== 'transcription_direction');
    expect(others.length).toBe(21);
    const probes = [
      'يتم الاستنساخ من 5 نحو 3',
      'من الطرف الثلاثي نحو الطرف الخماسي',
      'لا اعرف الجواب',
      'انا احب كرة القدم في وهران',
    ];
    for (const q of others) {
      // Aucune autre question ne déclare d'ordre : l'option est inerte.
      expect(q.orderedKeywords).toBeUndefined();
      for (const probe of probes) {
        const base = validateKeywordAnswer(probe, q.requiredKeywords ?? [], q.forbiddenKeywords ?? []);
        const withOption = validateKeywordAnswer(
          probe,
          q.requiredKeywords ?? [],
          q.forbiddenKeywords ?? [],
          { orderedKeywords: q.orderedKeywords },
        );
        expect(withOption.valid).toBe(base.valid);
      }
    }
  });
});

// ------------------------------------------------------------------
// #33 — L'agglutination de l'arabe faisait refuser des réponses justes.
//
// BASELINE mesurée avant correctif, sur les 22 questions en mode
// « keywords », avec des réponses justes LIBREMENT RÉDIGÉES (et non
// calquées sur `errorHintAr`, qui recopie littéralement les mots-clés
// attendus et gonfle artificiellement le taux d'acceptation) :
//   3/22 acceptées seulement.
// Après correctif : 22/22, sans aucune acceptation parmi 110 réponses
// fausses, vides ou hors-sujet.
// ------------------------------------------------------------------
describe('#33 — tolérance aux affixes agglutinés', () => {
  it("accepte l'article défini collé au mot-clé", () => {
    const q = question('tertiary_interactions');
    // Mot-clé attendu : « روابط هيدروجينية » (indéfini).
    expect(valide('نجد الروابط الهيدروجينية والروابط الشاردية', q)).toBe(true);
  });

  it('accepte le mot-clé au singulier défini quand la donnée le veut indéfini', () => {
    const q = question('amino_acid_unit');
    expect(valide('الوحدة الأساسية هي الحمض الأميني، والاختلاف في المجموعة الجانبية', q)).toBe(true);
  });

  it("n'accepte pas des mots-clés dispersés hors séquence", () => {
    const q = question('amino_acid_unit');
    // Les deux mots existent, mais «حمض» et «أميني» ne se suivent pas :
    // ce n'est pas le terme scientifique, c'est une collision de vocabulaire.
    expect(valide('الحمض موجود في الغذاء والنسيج الأميني شيء آخر تماما', q)).toBe(false);
    // Variante où TOUS les mots-clés sont présents mais aucun n'est contigu :
    // c'est le cas qui distingue une vraie séquence d'un simple sac de mots.
    expect(
      valide('الحمض موجود في الغذاء والنسيج الأميني شيء آخر، وهناك مجموعة جانبية أيضا', q),
    ).toBe(false);
  });

  it('refuse encore le hors-sujet, le vide et la non-réponse sur les 22 questions', () => {
    const cibles = QUESTIONS.filter((q) => (q.requiredKeywords ?? []).length > 0);
    expect(cibles.length).toBe(22);
    for (const q of cibles) {
      for (const mauvaise of ['', 'لا اعرف', 'نعم هذا صحيح', 'كرة القدم رياضة جميلة']) {
        expect(valide(mauvaise, q)).toBe(false);
      }
    }
  });

  it('ne réduit jamais un mot à un radical trop court pour être discriminant', () => {
    const q = question('why_one_change_matters');
    // « وظيفة » ne doit pas être rapproché de « ظيفة » ni d'un fragment.
    expect(valide('تبديل حمض أميني واحد يغير الطي فتتغير الوظيفة', q)).toBe(true);
    expect(valide('تبديل حمض أميني واحد يغير الطي', q)).toBe(false);
  });
});

// ------------------------------------------------------------------
// #33 — Variantes de données : ce que l'affixe ne peut pas rattraper.
// ------------------------------------------------------------------
describe('#33 — pluriel brisé et synonymie, portés par la donnée', () => {
  it('accepte le pluriel brisé روابط pour le singulier رابطة', () => {
    const q = question('primary_structure_define');
    expect(valide('تتابع الأحماض الأمينية المرتبطة بروابط ببتيدية', q)).toBe(true);
    // La graphie d'origine reste acceptée : la variante n'a rien retiré.
    expect(valide('تتابع الأحماض الأمينية مع رابطة ببتيدية', q)).toBe(true);
  });

  it('accepte les synonymes de « انخفاض » pour la lecture de courbe', () => {
    const q = question('amanitine_curve');
    for (const mot of ['انخفاض', 'تناقص', 'نقصان', 'قلة']) {
      expect(valide(`نلاحظ ${mot} كمية ARNm كلما ارتفع تركيز المثبط`, q)).toBe(true);
    }
  });

  it('ne transforme pas la synonymie en passe-droit', () => {
    const q = question('amanitine_curve');
    // Le synonyme seul ne suffit pas : ARNm et تركيز restent exigés.
    expect(valide('نلاحظ تناقصا كبيرا في الظاهرة المدروسة', q)).toBe(false);
  });
});
