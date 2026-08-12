import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { SVT_QUIZ_QUESTIONS } from './quizCorpus';

/**
 * Tests d'intégrité du corpus QCM.
 *
 * Origine : audit de conformité 2026 (docs/AUDIT_CONFORMITE_LIVRE_2026.md).
 * Ces tests verrouillent deux défauts corrigés et empêchent toute rechute :
 *   - constat #3 : 57 QCM de l'unité 11 affichaient un schéma du domaine 1
 *     (ex. schema_01_adn.svg sur une question de pétrologie) ;
 *   - constat #1 : 500/508 explications recopiaient le terme de l'énoncé
 *     au lieu de le justifier (feedback circulaire).
 */

/** Domaine officiel d'une unité : 1-5 = protéines, 6-8 = énergie, 9-11 = tectonique. */
const domainOfUnit = (unitId: number): 1 | 2 | 3 =>
  unitId <= 5 ? 1 : unitId <= 8 ? 2 : 3;

const FOLDER_BY_DOMAIN: Record<1 | 2 | 3, string> = {
  1: 'domaine1_proteines',
  2: 'domaine2_energie',
  3: 'domaine3_tectonique',
};

describe('corpus QCM — intégrité structurelle', () => {
  it('contient bien 508 questions', () => {
    expect(SVT_QUIZ_QUESTIONS.length).toBe(508);
  });

  it('attribue à chaque QCM un unitId valide (1-11)', () => {
    const invalid = SVT_QUIZ_QUESTIONS.filter(
      (q) => !Number.isInteger(q.unitId) || q.unitId < 1 || q.unitId > 11,
    );
    expect(invalid.map((q) => q.id)).toEqual([]);
  });

  it("n'a aucun identifiant en double", () => {
    const ids = SVT_QUIZ_QUESTIONS.map((q) => q.id);
    expect(ids.length).toBe(new Set(ids).size);
  });

  it('désigne toujours une réponse correcte existante', () => {
    const broken = SVT_QUIZ_QUESTIONS.filter(
      (q) => q.correctAnswerIndex < 0 || q.correctAnswerIndex >= q.options.length,
    );
    expect(broken.map((q) => q.id)).toEqual([]);
  });
});

describe('corpus QCM — cohérence des schémas (constat #3)', () => {
  it('associe à chaque QCM un schéma de SON domaine', () => {
    const mismatched = SVT_QUIZ_QUESTIONS.filter((q) => {
      const expected = FOLDER_BY_DOMAIN[domainOfUnit(q.unitId)];
      return !q.diagramUrl?.includes(expected);
    }).map((q) => `#${q.id} (unité ${q.unitId}) → ${q.diagramUrl}`);

    expect(mismatched).toEqual([]);
  });

  it('ne référence que des fichiers réellement présents', () => {
    const urls = [...new Set(SVT_QUIZ_QUESTIONS.map((q) => q.diagramUrl))];
    const missing = urls.filter(
      (url) => !fs.existsSync(path.join(process.cwd(), 'public', url)),
    );
    expect(missing).toEqual([]);
  });
});

describe('corpus QCM — qualité des explications (constat #1)', () => {
  /** Terme mis en avant dans l'énoncé, par ex. «الغابرو». */
  const quotedTerm = (text: string): string | null => {
    const m = text.match(/«([^»]{2,60})»/);
    return m ? m[1].trim() : null;
  };

  /**
   * Une explication est circulaire quand elle se contente de recoller le terme
   * de l'énoncé au libellé de la bonne réponse, sans apporter de raisonnement.
   */
  const isCircular = (q: (typeof SVT_QUIZ_QUESTIONS)[number]): boolean => {
    const term = quotedTerm(q.questionText);
    if (!term) return false;
    const exp = q.explanation ?? '';
    return exp.includes('يرتبط هنا بـ') && exp.includes(term);
  };

  const MIN_WORDS = 25;
  const wordCount = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;

  // Dette héritée : le corpus est corrigé par lots (voir la feuille de route du
  // rapport d'audit). Ces plafonds ne doivent que DIMINUER — jamais augmenter.
  //
  // État initial mesuré au 12/08/2026 : 500/508 explications circulaires, et
  // surtout 508/508 sous les 25 mots — l'explication la plus longue du corpus
  // en faisait 22. Aucune n'atteignait le seuil minimal d'une justification
  // utile.
  //
  // Lot 1 (unité 11 — Tectonique des plaques, 61 QCM, ids 440-500) : les 61
  // explications ont été réécrites selon le canevas en trois temps
  // « mécanisme → réfutation du distracteur plausible → mot-clé BAC ».
  // Plafonds ramenés de 500 → 439 et de 508 → 447.
  //
  // Lot 2 (unité 4 — L'immunité, 48 QCM, ids 114-161 ; unité 5 — La
  // communication nerveuse, 55 QCM, ids 162-216) : 103 explications réécrites
  // selon le même canevas. Plafonds ramenés de 439 → 336 et de 447 → 344.
  const MAX_CIRCULAR = 336;
  const MAX_TOO_SHORT = 344;

  it('ne régresse pas sur le nombre d’explications circulaires', () => {
    const circular = SVT_QUIZ_QUESTIONS.filter(isCircular);
    expect(circular.length).toBeLessThanOrEqual(MAX_CIRCULAR);
  });

  it('ne régresse pas sur le nombre d’explications trop courtes', () => {
    const tooShort = SVT_QUIZ_QUESTIONS.filter(
      (q) => wordCount(q.explanation ?? '') < MIN_WORDS,
    );
    expect(tooShort.length).toBeLessThanOrEqual(MAX_TOO_SHORT);
  });

  // Échafaudage de génération retiré des énoncés le 12/08/2026 : les 500 QCM
  // concernés préfixaient la question par le repère de plan interne
  // (« في محور 11.5 — دورة ويلسون، … » et ses 5 variantes de formulation).
  // Ce repère n'a pas de sens pour l'élève et ne doit pas revenir.
  const SCAFFOLDING = [
    /\d+\.\d+\s*—/,
    /في محور/,
    /عند مراجعة/,
    /في موضوع/,
    /في سؤال بكالوريا قصير حول/,
  ];

  it('ne réintroduit aucun repère de plan interne dans les énoncés', () => {
    const withScaffolding = SVT_QUIZ_QUESTIONS.filter((q) =>
      SCAFFOLDING.some((re) => re.test(q.questionText)),
    );
    expect(withScaffolding.map((q) => q.id)).toEqual([]);
  });

  it('ne comporte aucun énoncé dupliqué', () => {
    const seen = new Map<string, number[]>();
    SVT_QUIZ_QUESTIONS.forEach((q) => {
      const key = q.questionText.trim();
      seen.set(key, [...(seen.get(key) ?? []), q.id]);
    });
    const duplicates = [...seen.values()].filter((ids) => ids.length > 1);
    expect(duplicates).toEqual([]);
  });

  // Lots déjà traités : verrouillés à zéro défaut pour interdire tout retour
  // en arrière sur le travail de réécriture déjà validé.
  const REWRITTEN_UNITS = [4, 5, 11];

  it.each(REWRITTEN_UNITS)(
    'garde l’unité %i totalement exempte d’explications circulaires ou trop courtes',
    (unitId) => {
      const items = SVT_QUIZ_QUESTIONS.filter((q) => q.unitId === unitId);
      expect(items.length).toBeGreaterThan(0);
      expect(items.filter(isCircular).map((q) => q.id)).toEqual([]);
      expect(
        items
          .filter((q) => wordCount(q.explanation ?? '') < MIN_WORDS)
          .map((q) => q.id),
      ).toEqual([]);
    },
  );

  it('fournit une explication non vide pour chaque question', () => {
    const empty = SVT_QUIZ_QUESTIONS.filter((q) => !q.explanation?.trim());
    expect(empty.map((q) => q.id)).toEqual([]);
  });
});
