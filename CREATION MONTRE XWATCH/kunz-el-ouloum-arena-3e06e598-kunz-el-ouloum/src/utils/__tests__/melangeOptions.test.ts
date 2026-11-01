// melangeOptions.test.ts — la clé extraite doit devenir inutilisable.
//
// Trois propriétés à verrouiller, et une quatrième qui est la vraie :
//   1. la bonne réponse reste la bonne (sinon on casse le quiz) ;
//   2. la position change selon la SESSION (sinon la clé volée reste valable) ;
//   3. la même session donne toujours le même ordre (sinon l'élève voit ses
//      propositions bouger sous ses yeux) ;
//   4. la table position affichée → position d'origine est exacte : sans elle,
//      les aides « pourquoi mon choix est faux » deviennent fausses.
import { describe, expect, it, beforeEach, vi } from 'vitest';
import {
  graineSession,
  melangerQuestion,
  melangerQuestions,
  origineDe,
  permutation,
} from '../melangeOptions';

type Q = { id: number; options: string[]; correctAnswerIndex: number };

const question = (over: Partial<Q> = {}): Q => ({
  id: 1,
  options: ['النواة', 'الريبوزوم', 'الميتوكندريا', 'جهاز غولجي'],
  correctAnswerIndex: 1, // الريبوزوم
  ...over,
});

beforeEach(() => {
  sessionStorage.clear();
});

describe('permutation', () => {
  it('est une bijection de [0..n-1] (aucun index perdu ni dupliqué)', () => {
    for (const n of [2, 3, 4, 5, 8]) {
      const p = permutation(n, 12345);
      expect([...p].sort((a, b) => a - b)).toEqual(Array.from({ length: n }, (_, i) => i));
    }
  });

  it('est déterministe pour une graine donnée', () => {
    expect(permutation(4, 42)).toEqual(permutation(4, 42));
  });

  it('change avec la graine', () => {
    const vues = new Set(
      Array.from({ length: 40 }, (_, i) => permutation(4, i + 1).join('')),
    );
    // 4! = 24 permutations possibles : on doit en voir plusieurs.
    expect(vues.size).toBeGreaterThan(6);
  });

  it('ne casse pas sur n = 1 ou n = 0', () => {
    expect(permutation(1, 7)).toEqual([0]);
    expect(permutation(0, 7)).toEqual([]);
  });
});

describe('la bonne réponse reste la bonne', () => {
  it('l’index suit l’option déplacée', () => {
    const q = question();
    for (let graine = 1; graine <= 200; graine += 1) {
      const m = melangerQuestion(q, 'correctAnswerIndex', graine, q.id);
      // La chaîne pointée par la clé est TOUJOURS la même que dans l'original.
      expect(m.options[m.correctAnswerIndex], `graine ${graine}`).toBe(q.options[q.correctAnswerIndex]);
      // Et la question d'origine n'a pas été modifiée en place.
      expect(q.options).toEqual(question().options);
      expect(q.correctAnswerIndex).toBe(1);
    }
  });

  it('conserve l’ensemble des propositions (aucune perdue en route)', () => {
    const q = question();
    for (let graine = 1; graine <= 50; graine += 1) {
      const m = melangerQuestion(q, 'correctAnswerIndex', graine, q.id);
      expect([...m.options].sort()).toEqual([...q.options].sort());
    }
  });

  it('une question à trou (pas de propositions) n’est PAS touchée', () => {
    const trou = { id: 9, options: [] as string[], correctAnswerIndex: -1, kind: 'fillBlank' };
    const m = melangerQuestion(trou, 'correctAnswerIndex', 12345, trou.id);
    expect(m).toBe(trou); // même référence : rendue telle quelle
    expect(m.optionOrigins).toBeUndefined();
  });

  it('une question à une seule proposition n’est pas touchée', () => {
    const seule = { id: 10, options: ['النواة'], correctAnswerIndex: 0 };
    expect(melangerQuestion(seule, 'correctAnswerIndex', 5, seule.id)).toBe(seule);
  });

  it('un index de réponse aberrant ne déclenche aucun mélange', () => {
    for (const mauvais of [-1, 4, 99]) {
      const q = question({ correctAnswerIndex: mauvais });
      expect(melangerQuestion(q, 'correctAnswerIndex', 8, q.id), String(mauvais)).toBe(q);
    }
  });
});

describe('la position change selon la SESSION', () => {
  it('la position de la bonne réponse est répartie, pas figée', () => {
    // C'est LE test qui compte : « la réponse est la 2ᵉ » doit être faux la
    // plupart du temps selon la session.
    const q = question();
    const positions = new Map<number, number>();
    const N = 400;
    for (let graine = 1; graine <= N; graine += 1) {
      const m = melangerQuestion(q, 'correctAnswerIndex', graine, q.id);
      positions.set(m.correctAnswerIndex, (positions.get(m.correctAnswerIndex) ?? 0) + 1);
    }
    expect(positions.size).toBe(4); // les 4 positions apparaissent
    for (const [position, compte] of positions) {
      const part = compte / N;
      // Répartition attendue ≈ 25 % ; on tolère une marge large (jamais < 12 %).
      expect(part, `position ${position} : ${(part * 100).toFixed(1)} %`).toBeGreaterThan(0.12);
    }
  });

  it('sur 100 sessions, la bonne réponse n’est PAS majoritairement au même endroit', () => {
    const q = question();
    let auMemeEndroit = 0;
    for (let graine = 1; graine <= 100; graine += 1) {
      const m = melangerQuestion(q, 'correctAnswerIndex', graine, q.id);
      if (m.correctAnswerIndex === q.correctAnswerIndex) auMemeEndroit += 1;
    }
    // Sans mélange : 100/100. Avec : ~25. On exige une vraie dispersion.
    expect(auMemeEndroit).toBeLessThan(45);
  });

  it('deux questions différentes ne reçoivent pas la même permutation', () => {
    const graine = 777;
    const a = melangerQuestion(question({ id: 1 }), 'correctAnswerIndex', graine, 1);
    const b = melangerQuestion(question({ id: 2 }), 'correctAnswerIndex', graine, 2);
    // Elles PEUVENT coïncider par hasard, mais pas systématiquement : sur 20
    // identifiants distincts, on doit voir plusieurs ordres.
    const ordres = new Set(
      Array.from({ length: 20 }, (_, i) => melangerQuestion(question({ id: i }), 'correctAnswerIndex', graine, i).optionOrigins!.join('')),
    );
    expect(ordres.size).toBeGreaterThan(4);
  });
});

describe('stabilité PENDANT la session', () => {
  it('la même graine redonne exactement le même ordre', () => {
    const q = question();
    const a = melangerQuestion(q, 'correctAnswerIndex', 987654, q.id);
    const b = melangerQuestion(q, 'correctAnswerIndex', 987654, q.id);
    expect(a.options).toEqual(b.options);
    expect(a.correctAnswerIndex).toBe(b.correctAnswerIndex);
  });

  it('graineSession() rend la même valeur tant que la session dure', () => {
    const g1 = graineSession();
    const g2 = graineSession();
    expect(g1).toBe(g2);
    expect(g1).toBeGreaterThan(0);
    // Deux lectures successives ne doivent pas régénérer la graine.
    expect(sessionStorage.getItem('kunz_graine_session')).toBe(String(g1));
  });

  it('une graine stockée invalide est remplacée, pas propagée', () => {
    sessionStorage.setItem('kunz_graine_session', 'pas-un-nombre');
    const g = graineSession();
    expect(Number.isFinite(g)).toBe(true);
    expect(g).toBeGreaterThan(0);
  });

  it('survit à l’indisponibilité de sessionStorage (navigation privée)', () => {
    const vrai = sessionStorage;
    // Simule un stockage qui lève : le module doit rendre une graine quand même.
    vi.stubGlobal('sessionStorage', {
      getItem: () => {
        throw new Error('quota');
      },
      setItem: () => {
        throw new Error('quota');
      },
    });
    const g = graineSession();
    expect(Number.isFinite(g)).toBe(true);
    expect(g).toBeGreaterThan(0);
    vi.stubGlobal('sessionStorage', vrai);
  });
});

describe('position affichée → position d’origine (les aides restent justes)', () => {
  it('origineDe() défait exactement le mélange', () => {
    const q = question();
    for (let graine = 1; graine <= 100; graine += 1) {
      const m = melangerQuestion(q, 'correctAnswerIndex', graine, q.id);
      for (let affiche = 0; affiche < 4; affiche += 1) {
        const origine = origineDe(m.optionOrigins, affiche);
        // L'option affichée EST l'option d'origine à cette position.
        expect(m.options[affiche]).toBe(q.options[origine]);
      }
    }
  });

  it('sans mélange, l’index est rendu tel quel', () => {
    expect(origineDe(undefined, 2)).toBe(2);
    expect(origineDe([], 3)).toBe(3);
    expect(origineDe([1, 0], 5)).toBe(5); // hors bornes : pas d'invention
  });

  it('l’aide « pourquoi ce choix est faux » désigne le MÊME texte après mélange', () => {
    // Reproduit l'usage réel de QuizView : getHintForIncorrectOption(questionId,
    // selectedIdx) est indexé par position d'ORIGINE. Sans origineDe(), l'aide
    // expliquerait une autre proposition que celle choisie.
    const q = question();
    const m = melangerQuestion(q, 'correctAnswerIndex', 2026, q.id);
    const choisiParEleve = 0; // il clique la 1ʳᵉ proposition affichée
    const texteAffiche = m.options[choisiParEleve];
    const origine = origineDe(m.optionOrigins, choisiParEleve);
    expect(q.options[origine]).toBe(texteAffiche); // l'aide visera le bon texte
    expect(origine).not.toBe(choisiParEleve); // et ce n'est PAS la position affichée
  });
});

describe('melangerQuestions — usage de masse', () => {
  it('mélange toute la liste et garde la clé juste partout', () => {
    const liste: Q[] = [
      { id: 1, options: ['a', 'b', 'c', 'd'], correctAnswerIndex: 0 },
      { id: 2, options: ['a', 'b', 'c', 'd'], correctAnswerIndex: 1 },
      { id: 3, options: ['a', 'b', 'c', 'd'], correctAnswerIndex: 2 },
      { id: 4, options: ['a', 'b', 'c', 'd'], correctAnswerIndex: 3 },
    ];
    const vues = melangerQuestions(liste, 'correctAnswerIndex', 31415);
    expect(vues.length).toBe(4);
    vues.forEach((v, i) => {
      expect(v.options[v.correctAnswerIndex]).toBe(liste[i].options[liste[i].correctAnswerIndex]);
    });
  });

  it('utilise l’identifiant de la question comme clé par défaut', () => {
    const liste: Q[] = [
      { id: 11, options: ['a', 'b', 'c'], correctAnswerIndex: 0 },
      { id: 12, options: ['a', 'b', 'c'], correctAnswerIndex: 0 },
    ];
    const vues = melangerQuestions(liste, 'correctAnswerIndex', 555);
    // Deux identifiants différents → permutations indépendantes (elles peuvent
    // coïncider, mais la clé passée doit bien être l'identifiant).
    expect(vues[0].optionOrigins).toBeDefined();
    expect(vues[1].optionOrigins).toBeDefined();
    expect(vues.map((v) => v.options[v.correctAnswerIndex])).toEqual(['a', 'a']);
  });

  it('accepte le champ « correct » des QCM du livre (autre nom de clé)', () => {
    type Livre = { chapitre: number; question: string; options: string[]; correct: number };
    const q: Livre = { chapitre: 7, question: 'س', options: ['1', '2', '3'], correct: 2 };
    const m = melangerQuestion(q, 'correct', 11, q.chapitre);
    expect(m.options[m.correct]).toBe('3');
  });
});

describe('alignement du tuteur (smartTutorEngine) sur la session', () => {
  it('le quiz du المرشد change d’ordre quand la session change', async () => {
    // Avant le 14/10/2026, `shuffledView` ne dépendait que de l'identifiant de
    // la question : l'ordre était le MÊME à chaque session, donc une clé relevée
    // une fois restait vraie pour toujours.
    const { shuffledView } = await import('../../smartTutorEngine');
    const { getQuestionsForDomain } = await import('../../data/smartBotData');
    const q = getQuestionsForDomain(1)[0];
    expect(q.options.length).toBeGreaterThan(1);

    sessionStorage.setItem('kunz_graine_session', '111111');
    const sessionA = shuffledView(q);
    sessionStorage.setItem('kunz_graine_session', '222222');
    const sessionB = shuffledView(q);

    // Même question, deux sessions : l'ordre doit différer (les permutations
    // sont tirées sur 4 propositions — la coïncidence reste possible, mais pas
    // sur les DEUX critères à la fois).
    const identique =
      sessionA.options.join('|') === sessionB.options.join('|') &&
      sessionA.correctIndex === sessionB.correctIndex;
    expect(identique).toBe(false);
    // Et dans les deux cas, la bonne réponse reste la bonne.
    expect(sessionA.options[sessionA.correctIndex]).toBe(q.options[q.correctIndex]);
    expect(sessionB.options[sessionB.correctIndex]).toBe(q.options[q.correctIndex]);
    sessionStorage.clear();
  });
});
