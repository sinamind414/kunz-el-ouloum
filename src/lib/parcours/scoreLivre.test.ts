// scoreLivre.test.ts — audit Capitaine 2026-10-17 (§2, P0) :
// « le score de اختبار الكتاب n'est pas transmis » — l'élève qui réussit le
// QCM du livre reste « لم تبدأ » côté coach, car son score n'atterrit nulle
// part. Contrat après correction :
//   · scoreQcmUnite   → UNIQUEMENT le جسر (entrées sans `source`) — la
//     décision 2026-10-02 (le جسر est la preuve de l'unité) reste debout ;
//   · scoreLivreUnite → UNIQUEMENT les entrées `source: 'livre'` (écrites par
//     App à la fin de chaque chapitre, avec `chapitre: N`) ; AGGREGAT de
//     l'unité = somme des DERNIÈRES tentatives de chaque chapitre (un chapitre
//     a ≤ 2 questions : seul l'agrégat unité fait une mesure exploitable) ;
//   · une entrée sans `source` n'est JAMAIS comptée côté livre (et l'inverse).
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { INITIAL_UNITS } from '../../unitCatalog';
import { scoreLivreUnite, scoreQcmUnite } from './parcoursMeta';
import { loadSession } from '../../utils/sessionManager';
import { diagnosticCoach } from '../../smartTutorEngine';

const CLE = 'svt_progress';
const TITRE_U1 = INITIAL_UNITS[0].title;

function ecrireProgres(contenu: unknown): void {
  localStorage.setItem(CLE, JSON.stringify(contenu));
}

beforeEach(() => localStorage.clear());
afterEach(() => localStorage.clear());

describe('séparation جسر / livre dans quizScoreHistory', () => {
  const progreConcilie = {
    quizScoreHistory: [
      // jalon (ancien schéma App.tsx : pas de `source`)
      { date: '1/1/2026', score: 8, total: 10, unitTitle: TITRE_U1 },
      // livre : chapitres 1 et 2 (2 q max par chapitre dans la banque)
      { date: '2/1/2026', score: 2, total: 2, unitTitle: TITRE_U1, source: 'livre', chapitre: 1 },
      { date: '3/1/2026', score: 2, total: 2, unitTitle: TITRE_U1, source: 'livre', chapitre: 2 },
    ],
  };

  it('scoreLivreUnite AGGREGÈ les chapitres de l unité (2+2 = 4/4)', () => {
    ecrireProgres(progreConcilie);
    expect(scoreLivreUnite(1)).toEqual({ score: 4, total: 4 });
  });

  it('une reprise remplace la tentative précédente DU MÊME chapitre seulement', () => {
    ecrireProgres({
      quizScoreHistory: [
        { date: '2/1/2026', score: 2, total: 2, unitTitle: TITRE_U1, source: 'livre', chapitre: 1 },
        { date: '3/1/2026', score: 2, total: 2, unitTitle: TITRE_U1, source: 'livre', chapitre: 2 },
        { date: '4/1/2026', score: 1, total: 2, unitTitle: TITRE_U1, source: 'livre', chapitre: 1 },
      ],
    });
    // chapitre 1 → 1/2 (reprise), chapitre 2 → 2/2 : agrégat 3/4.
    expect(scoreLivreUnite(1)).toEqual({ score: 3, total: 4 });
  });

  it('scoreQcmUnite reste jalon : le livre ne qualifie PAS le جسر', () => {
    ecrireProgres(progreConcilie);
    expect(scoreQcmUnite(1)).toEqual({ score: 8, total: 10 });
  });

  it('une entrée livre ne crée PAS un score jalon fantôme', () => {
    ecrireProgres({
      quizScoreHistory: [{ date: '2/1/2026', score: 4, total: 4, unitTitle: TITRE_U1, source: 'livre', chapitre: 1 }],
    });
    expect(scoreQcmUnite(1)).toBeNull();
    expect(scoreLivreUnite(1)).toEqual({ score: 4, total: 4 });
  });

  it('scoreLivreUnite : null sans progression / historique corrompu / autre unité', () => {
    expect(scoreLivreUnite(1)).toBeNull();
    localStorage.setItem(CLE, '{cassé');
    expect(scoreLivreUnite(1)).toBeNull();
    ecrireProgres({ quizScoreHistory: 'pas un tableau' });
    expect(scoreLivreUnite(1)).toBeNull();
    ecrireProgres({
      quizScoreHistory: [
        { date: '2/1/2026', score: 2, total: 2, unitTitle: INITIAL_UNITS[1].title, source: 'livre', chapitre: 3 },
      ],
    });
    expect(scoreLivreUnite(2)).toEqual({ score: 2, total: 2 });
    expect(scoreLivreUnite(1)).toBeNull();
  });

  it('entrées livre sans chapitre exploitable → ignorées (pas de somme fausse)', () => {
    ecrireProgres({
      quizScoreHistory: [{ date: '2/1/2026', score: 2, total: 2, unitTitle: TITRE_U1, source: 'livre' }],
    });
    expect(scoreLivreUnite(1)).toBeNull();
  });
});

describe('chaîne complète (audit §2) : jalon ouvert → réponses → diagnostic actualisé', () => {
  it('le diagnostic du coach affiche la mesure اختبار الكتاب (75 %, moyen plafonné)', () => {
    // Le جسر de l'unité 1 n'a PAS de note ; deux chapitres de livre passés
    // (1/2 puis 2/2) → agrégat 3/4. Le coach l'affiche et en attribue la source.
    ecrireProgres({
      quizScoreHistory: [
        { date: '2/1/2026', score: 1, total: 2, unitTitle: TITRE_U1, source: 'livre', chapitre: 1 },
        { date: '3/1/2026', score: 2, total: 2, unitTitle: TITRE_U1, source: 'livre', chapitre: 2 },
      ],
    });
    const resultat = diagnosticCoach(loadSession(), '');
    // L'unité 1 porte la mesure LIVRE 75 % (et 100 % doit rester affichable
    // tel quel — on n'arrondit pas la vérité mesurée).
    expect(resultat.action.text).toContain('(اختبار الكتاب): 75%');
    // La mesure sort l'unité de « non_commence » ; le plafond (leçons non
    // terminées) tient le verdict à « moyen » — jamais « fort ».
    expect(resultat.action.text).toContain('مستوى متوسط في «1. تركيب البروتين»');
  });
});
