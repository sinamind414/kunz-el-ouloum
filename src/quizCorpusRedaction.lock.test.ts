// quizCorpusRedaction.lock.test.ts — verrous éditoriaux du corpus QCM.
//
// Constats d'audit externe (8 axes, 15/10/2026), vérifiés ligne à ligne ici :
//
//   1. QCM 393 (U10, schéma des ondes) : l'option « تغير اتجاه وسرعة الموجة
//      عند تغير الوسط » (le phénomène de RÉFRACTION sismique) était citée
//      comme « فخ شائع » dans l'explication. Or le MÊME corpus en fait la
//      bonne réponse de la QCM 403 (« الانكسار الزلزالي », correctAnswerIndex
//      2). Une phrase vraie — nommément la réfraction — ne peut pas servir de
//      faux de référence. Le faux de référence légitime pour une question
//      « propriété de l'onde P » est la confusion classique P/S.
//
//   2. Quand une explication cite une option comme « فخ », la citation doit
//      correspondre à l'option réelle. Neuf questions citaient une option
//      TRONQUÉE (« … ») : l'élève reconstruit mentalement une option qui
//      n'existe pas exactement. Le verrou tolère l'ellipse explicite mais
//      refuse la désynchronisation.
//
//   3. La phrase-type de fin d'explication répétait la coquille « انبه »
//      (au lieu de « انتبه ») 357 fois.
//
// NB : le design « un vrai parmi des vrais d'ailleurs » (les distracteurs
// sont des définitions d'AUTRES concepts) est INTENTIONNEL et n'est pas
// verrouillé ici — seul le faux de référence d'une question doit être faux
// POUR LE TERME demandé.

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { SVT_QUIZ_QUESTIONS } from './quizCorpus';

const RACINE = process.cwd();
const BRUT = readFileSync(resolve(RACINE, 'src/quizCorpus.ts'), 'utf-8');

/** Le texte cité comme « الخيار «X» فخ شائع » dans une explication. */
function piegeCite(explanation: string): string | null {
  const m = explanation.match(/الخيار «([^»]+)» فخ شائع/);
  return m ? m[1] : null;
}

/** La citation peut tronquer l'option avec « … » : on compare sur le préfixe. */
function citeLAOption(citation: string, option: string): boolean {
  const c = citation.replace(/\s*…\s*$/, '');
  return option === citation || option.startsWith(c);
}

describe('corpus QCM — cohérence des « فخ » (faux de référence)', () => {
  it('chaque citation de « فخ » correspond réellement à une option de sa question', () => {
    const dérives: string[] = [];
    for (const q of SVT_QUIZ_QUESTIONS) {
      const piège = piegeCite(q.explanation ?? '');
      if (piège && !q.options.some((o) => citeLAOption(piège, o))) {
        dérives.push(`${q.id} : cite « ${piège} », aucune option ne correspond`);
      }
    }
    expect(dérives, `citation de faux désynchronisée : ${dérives.join(' ; ')}`).toEqual([]);
  });

  it('QCM 393 — le faux de référence est la confusion P/S, pas la vraie réfraction', () => {
    const q = SVT_QUIZ_QUESTIONS.find((x) => x.id === 393);
    expect(q, 'QCM 393 introuvable').toBeDefined();
    // La réfraction (phrase vraie, bonne réponse de la QCM 403) n'est plus
    // ni une option trompeuse ni un faux cité : c'est un phénomène réel des
    // ondes P, pas une erreur d'élève.
    const réfraction = 'تغير اتجاه وسرعة الموجة عند تغير الوسط';
    const options = q!.options.map((o) => o.trim());
    expect(options).not.toContain(réfraction);
    expect(q!.explanation).not.toContain(réfraction);
    // La bonne réponse reste la caractérisation complète de l'onde P.
    expect(q!.options[q!.correctAnswerIndex]).toContain('طولية');
    expect(q!.options[q!.correctAnswerIndex]).toContain('الصلب والسائل');
  });

  it('la coquille « انبه » (faute pour « انتبه ») a disparu du corpus', () => {
    const n = BRUT.split('انبه إلى').length - 1;
    expect(n, `${n} coquilles « انبه إلى » restantes`).toBe(0);
  });
});
