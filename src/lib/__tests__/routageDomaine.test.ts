// src/lib/__tests__/routageDomaine.test.ts — verrous du module PUR de routage.
//
// Le module répond à une seule question : « de quel domaine du programme parle
// la question de l'élève ? ». Ces tests fixent les cas où il DOIT trancher, et
// ceux où il doit s'abstenir — s'abstenir à tort coûte une réponse juste,
// trancher à tort coûte un cours d'un autre chapitre servi à un élève.
import { describe, expect, it } from 'vitest';
import {
  construireVocabulaire,
  domaineDeUnite,
  domaineProbable,
  sansArticle,
} from '../routageDomaine';

const UNITES: Record<number, [number, number]> = { 1: [1, 5], 2: [6, 8], 3: [9, 11] };

describe('sansArticle — l’article défini arabe colle au mot', () => {
  it('retire « ال » quand il reste de quoi identifier le mot', () => {
    expect(sansArticle('الجبال')).toBe('جبال');
    expect(sansArticle('الميتوكوندري')).toBe('ميتوكوندري');
  });

  it('ne mutile pas un mot court qui commence par « ال »', () => {
    // « الغوص » → « غوص » (4 lettres, encore identifiable) mais un mot de
    // 5 lettres dont les 2 premières sont « ال » et qui ne fait que 3 lettres
    // ensuite doit rester intact.
    expect(sansArticle('الغوص')).toBe('غوص');
    expect(sansArticle('الب')).toBe('الب');
    expect(sansArticle('الات')).toBe('الات');
  });
});

describe('construireVocabulaire', () => {
  it('verse chaque jeton dans son domaine, avec et sans article', () => {
    const v = construireVocabulaire([
      { domaine: 3, tokens: ['الجبال', 'زلزال'] },
      { domaine: null, tokens: ['مراجعة'] },
    ]);
    expect(v[3]?.has('الجبال')).toBe(true);
    expect(v[3]?.has('جبال')).toBe(true);
    expect(v[3]?.has('زلزال')).toBe(true);
    // Transverse : n'entre dans aucun domaine, donc ne peut pas le désigner.
    // (`v[1]` n'existe même pas : aucun jeton ne lui a été versé.)
    expect(v[1]?.has('مراجعة') ?? false).toBe(false);
    expect(v[2]?.has('مراجعة') ?? false).toBe(false);
  });
});

describe('domaineProbable — trancher, ou s’abstenir', () => {
  // Vocabulaires de tailles différentes À DESSEIN : un domaine plus fourni
  // contient mécaniquement plus de mots banals. C'est ce qui faisait gagner la
  // génétique sur une question de géologie avant la normalisation par taille.
  const vocab = construireVocabulaire([
    { domaine: 1, tokens: ['استنساخ', 'ترجمة', 'ريبوزوم', 'خلية', 'دور', 'دراسة', 'نشاط', 'علاقة'] },
    { domaine: 2, tokens: ['كالفن', 'ضوئي', 'تنفس', 'دور', 'دراسة', 'نشاط', 'علاقة'] },
    { domaine: 3, tokens: ['الجبال', 'زلزالية', 'غوص', 'دور', 'دراسة', 'نشاط', 'علاقة'] },
  ]);

  it('tranche quand un jeton exclusif est présent', () => {
    expect(domaineProbable(['كيف', 'تتشكل', 'الجبال'], vocab)).toBe(3);
    expect(domaineProbable(['اشرح', 'كالفن'], vocab)).toBe(2);
    expect(domaineProbable(['الاستنساخ'], vocab)).toBe(1);
  });

  it('s’abstient quand les jetons sont partagés par les trois domaines', () => {
    expect(domaineProbable(['دور', 'دراسة', 'نشاط', 'علاقة'], vocab)).toBeNull();
  });

  it('s’abstient sur un jeton insignifiant (plancher de bruit)', () => {
    // Un seul mot banal suffit à produire un score non nul : ce n'est pas pour
    // autant un sujet identifié. Sans ce plancher, « أعطني مثال » passait pour
    // une question de cours et n'était plus traité comme un geste.
    const v2 = construireVocabulaire([
      { domaine: 1, tokens: ['استنساخ', 'ريبوزوم'] },
      { domaine: 2, tokens: ['كالفن'] },
      { domaine: 3, tokens: ['غوص'] },
    ]);
    expect(domaineProbable(['مثال'], v2)).toBeNull();
  });

  it('s’abstient quand deux domaines sont à égalité', () => {
    const v3 = construireVocabulaire([
      { domaine: 1, tokens: ['الفوتون'] },
      { domaine: 2, tokens: ['الفوتون'] },
    ]);
    expect(domaineProbable(['الفوتون'], v3)).toBeNull();
  });

  it('ne prétend rien sur une saisie vide ou sans mot exploitable', () => {
    expect(domaineProbable([], vocab)).toBeNull();
    expect(domaineProbable(['في', 'من'], vocab)).toBeNull();
  });
});

describe('domaineDeUnite — l’appartenance d’un extrait', () => {
  it('range les unités dans leur domaine', () => {
    expect(domaineDeUnite(1, UNITES)).toBe(1);
    expect(domaineDeUnite(5, UNITES)).toBe(1);
    expect(domaineDeUnite(6, UNITES)).toBe(2);
    expect(domaineDeUnite(9, UNITES)).toBe(3);
  });

  it('rend null sur un extrait TRANSVERSE — il ne contredit alors aucun domaine', () => {
    // Les fiches de méthode et le guide n'appartiennent à aucun domaine : le
    // filtre ne doit jamais les écarter.
    expect(domaineDeUnite(null, UNITES)).toBeNull();
    expect(domaineDeUnite(undefined, UNITES)).toBeNull();
    expect(domaineDeUnite(99, UNITES)).toBeNull();
  });
});
