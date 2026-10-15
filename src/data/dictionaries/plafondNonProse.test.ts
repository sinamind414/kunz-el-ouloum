// plafondNonProse.test.ts — la dette du plafond `non_prose`, MESURÉE et FIGÉE.
//
// Cette dette n'est pas un oubli : c'est un arbitrage documenté.
//
// LE DÉFAUT (constaté le 14/10/2026) : `non_prose` est un plafond anti-copier-coller
// qui ramène la note à 30 % du barème de l'exercice. Il est décidé par
// `estDeLaProse()`, qui exige un MARQUEUR DE RELATION (« نستنتج », « نلاحظ »…)
// avant d'examiner la morphologie de la réponse. Donc une réponse d'UNE phrase,
// juste et complète, mais sans ces mots d'articulation, est plafonnée — alors que
// la même phrase précédée de « نستنتج » ne l'est pas. Deux rédactions de valeur
// scientifique égale, deux notes différentes : c'est un défaut de correction.
//
// LE CORRECTIF A ÉTÉ TENTÉ LE MÊME JOUR, ET REVENU EN ARRIÈRE SUR PREUVE. Laisser
// le seul test morphologique décider (densité de clitiques ≥ 20 %) faisait passer
// le banc `src/supervision/evaluerCopies.test.ts` de 6/20 à 16,5/20 sur une
// salade construite avec TOUTES les formes d'attendus du groupe, et le mode
// exercice de 2,4/8 à 8/8. Le blindage anti-triche — la raison d'être de ce
// plafond — tombait.
//
// LES CRITÈRES DE REMPLACEMENT ONT ÉTÉ MESURÉS ET NE SÉPARENT PAS :
//   · densité de clitiques : phrase juste 63 %, salade exhaustive 43 % (la salade
//     passe au-dessus du seuil de 20 %) ;
//   · densité de mots-outils (في، من، على، ثم… — STOPWORDS du module) : copie
//     correcte 8 %, salade 11 % (la salade en contient DAVANTAGE).
//
// CONCLUSION : sans corpus de copies réelles, aucun critère disponible ici ne
// distingue une phrase rédigée d'une énumération de termes du cours. Trancher à
// l'intuition reviendrait à choisir entre sous-noter des élèves honnêtes et
// laisser passer du déversement lexical. La dette reste donc OUVERTE ; ce fichier
// l'empêche de grandir en silence et sa résolution relève de H4 (constituer un
// corpus, mesurer avant/après), conformément à la règle du dépôt pour les items
// du correcteur — cf. `correctionGenerosite.test.ts`, « ne PAS corriger sans
// mesure ».
//
// Si quelqu'un la résout AVEC un corpus : les tests marqués « DETTE » ci-dessous
// doivent être retournés (ils décrivent le défaut, pas la règle voulue).

import { describe, expect, it } from 'vitest';
import { analyserSignaux, PLAFONDS } from './integriteCopie';
import { noterExerciceCalibre } from './calibrationBac2025';

/** Réponse d'une seule phrase, complète, sans marqueur de relation. */
const PHRASE_JUSTE =
  'يتحرر النورادرينالين من النهايات العصبية ويتثبت على المستقبلات ثم يسبب تقبض العضلات الملساء وارتفاع الضغط الشرياني';
/** Même contenu scientifique, avec le marqueur de relation. */
const PHRASE_JUSTE_AVEC_RELATION =
  'نستنتج أن النورادرينالين يتحرر من النهايات العصبية ويتثبت على المستقبلات ويسبب تقبض العضلات الملساء وارتفاع الضغط الشرياني';
/** Déversement lexical : que des termes du cours, aucune structure de phrase. */
const SALADE =
  'adn arnm atp nadh mitochondrie thylakoide rubisco glucose o2 co2 photosynthese';

describe('plafond non_prose — ce que le blindage anti-triche doit continuer de faire', () => {
  it('une salade de mots-clés est plafonnée, avec son taux inchangé (30 %)', () => {
    expect(PLAFONDS.non_prose).toBe(0.3);
    expect(analyserSignaux(SALADE).estProse).toBe(false);
    const note = noterExerciceCalibre(SALADE, 1, 3);
    expect(note.plafonds.some((p) => p.type === 'non_prose')).toBe(true);
  });

  it('une réponse rédigée en deux phrases n’est jamais plafonnée', () => {
    expect(analyserSignaux('يتحرر النورادرينالين من النهايات العصبية. ويسبب تقبض العضلات الملساء.').estProse).toBe(
      true,
    );
  });

  it('un marqueur de relation suffit à écarter le plafond', () => {
    expect(analyserSignaux(PHRASE_JUSTE_AVEC_RELATION).estProse).toBe(true);
  });
});

describe('plafond non_prose — la dette figée (à retourner le jour où elle sera résolue)', () => {
  it('DETTE : une phrase juste UNIQUE, sans marqueur, est traitée en salade', () => {
    // Comportement actuel, assumé faute de corpus. Le jour où H4 fournit un
    // corpus et qu'un critère discriminant est trouvé, ce test passe à `true`.
    expect(analyserSignaux(PHRASE_JUSTE).estProse).toBe(false);
  });

  it('DETTE : la note dépend donc de la présence d’un mot de liaison', () => {
    // Le même contenu scientifique, écrit avec et sans « نستنتج », ne donne pas
    // la même note. Chiffré ici pour que la dette ne puisse pas être oubliée.
    const sans = noterExerciceCalibre(PHRASE_JUSTE, 1, 3);
    const avec = noterExerciceCalibre(PHRASE_JUSTE_AVEC_RELATION, 1, 3);
    expect(sans.plafonds.some((p) => p.type === 'non_prose')).toBe(true);
    expect(avec.plafonds.some((p) => p.type === 'non_prose')).toBe(false);
    expect(avec.plafonds).not.toEqual(sans.plafonds);
  });

  it('DETTE : le plafond reste VISIBLE par l’élève (pas de sanction muette)', () => {
    // La sanction est au moins explicable : `SectionObligatoire` affiche les
    // plafonds appliqués avec leur libellé arabe et leur pourcentage. Sans cela,
    // la dette serait aussi un mensonge.
    const src = require('node:fs').readFileSync(
      require('node:path').resolve(__dirname, '../../components/SectionObligatoire.tsx'),
      'utf-8',
    ) as string;
    expect(src).toContain('LABEL_PLAFOND');
    expect(src).toContain('note.plafonds');
  });
});
