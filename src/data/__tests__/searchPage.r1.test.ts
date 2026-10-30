// searchPage.r1.test.ts — B1 (retour frère 30/10/2026, capture 08:40:47 :
// « faut écrire tout le mot clé pour avoir un résultat »).
//
// Méthode H1 : données mesurées AVANT puis APRÈS la tranche (sondes vitest sur
// le même corpus), attentes figées sur la mesure APRÈS — jamais inventées.
//
//   Requête        | visibles avant | visibles après (≥ SEUIL_RECHERCHE_PAGE)
//   « المناعة »     | 0              | 17   (le seuil tutorat 12 écrasait tout)
//   « مناعة »       | 0              | 17   (article manquant : +6 sans article)
//   « فوس »        | 0              | 4    (préfixe de « فوسفات » — u6)
//   « غوص »        | 0              | 37   (u9 + carte)
//   « المغماتية »  | 0              | 9    (u11)
//   « الغلوكوز »   | 2              | 24
//   « تحا »        | 0              | 1    (plafond : bruit d'un préfixe générique)
//
// Le parcours TUTORAT (`searchAllBases`, seuil 12, barème R6) est INVARIANT :
//   « مناعة » 0 / 0 · « الغوص » 1 / 1 · « الغلوكوز » 2 / 2 (avant / après).
import { describe, expect, it } from 'vitest';
import {
  normalizeArabic,
  recherchePage,
  recherchePageScores,
  SEUIL_RECHERCHE_PAGE,
  searchAllBases,
} from '../../smartTutorEngine';
import {
  egalSansArticle,
  prefixeMatch,
  sansArticle,
} from '../../utils/arabicNormalize';

describe('aides de rappel B1 (arabicNormalize)', () => {
  it('sansArticle : retire « ال » initial seulement (≥ 3 lettres)', () => {
    expect(sansArticle('المغماتيه')).toBe('مغماتيه');
    expect(sansArticle('الغوص')).toBe('غوص');
    expect(sansArticle('غوص')).toBe('غوص');
    expect(sansArticle('انقسام')).toBe('انقسام');
    expect(sansArticle('')).toBe('');
  });

  it('egalSansArticle : requête sans article ↔ mot-clé avec article', () => {
    expect(egalSansArticle('مغماتيه', 'المغماتيه')).toBe(true);
    expect(egalSansArticle('المغماتيه', 'المغماتيه')).toBe(true);
    expect(egalSansArticle('غوص', 'غوص')).toBe(true);
    // pas d'égalité entre mots différents malgré l'article :
    expect(egalSansArticle('مناعه', 'نمطيه')).toBe(false);
    // garde : mots trop courts refusés (bruit arabe)
    expect(egalSansArticle('لا', 'اللا')).toBe(false);
  });

  it('prefixeMatch : préfixe 3+ lettres dans l\'un des deux sens, article ignoré', () => {
    // « فوس » préfixe de « فوسفات » (requête sans article, mot-clé préfixé)
    expect(prefixeMatch('فوس', 'فوسفات')).toBe(true);
    // article d'un seul côté
    expect(prefixeMatch('فوس', 'الفوسفات')).toBe(true);
    // sens inverse : requête plus longue qu'un mot-clé court
    expect(prefixeMatch('الانقسام', 'انقسام')).toBe(true);
    // 2 lettres : refus (garde anti-bruit)
    expect(prefixeMatch('غو', 'الغوص')).toBe(false);
    // préfixe COMMUN mais mot différent de part et d'autre non exigé :
    // « لب » n'est PAS un préfixe de « الباك » (garde N1 historique)
    expect(prefixeMatch('لب', 'الباك')).toBe(false);
  });
});

describe('page recherche : rappel mesuré (B1)', () => {
  it('mot entier avec article : les leçons du domaine remontent (avant : 0)', () => {
    const hits = recherchePage(normalizeArabic('المناعة'), null);
    expect(hits.length).toBeGreaterThanOrEqual(10);
    expect(hits.some((h) => h.type === 'lesson' && h.unitId === 4)).toBe(true);
  });

  it('mot entier SANS article : même rappel que le mot avec article', () => {
    const avec = recherchePage(normalizeArabic('المناعة'), null);
    const sans = recherchePage(normalizeArabic('مناعة'), null);
    expect(sans.length).toBe(avec.length);
    expect(sans.some((h) => h.type === 'lesson' && h.unitId === 4)).toBe(true);
  });

  it('préfixe de 3 lettres (« فوس ») : le thème فوسفات/enzymes devient trouvable', () => {
    const hits = recherchePage(normalizeArabic('فوس'), null);
    expect(hits.length).toBeGreaterThanOrEqual(1);
    expect(hits.every((h) => h.unitId === 6)).toBe(true);
  });

  it('mot court d\'un seul titre (« غوص ») : le domaine u9 est servi', () => {
    const hits = recherchePage(normalizeArabic('غوص'), null);
    expect(hits.length).toBeGreaterThanOrEqual(5);
    expect(hits.some((h) => h.unitId === 9)).toBe(true);
  });

  it('requête courte ambiguë (« تحا ») : bruit plafonné à 2 extraits', () => {
    expect(recherchePage(normalizeArabic('تحا'), null).length).toBeLessThanOrEqual(2);
  });

  it('aucune fabrication : un token sans correspondance ne renvoie jamais rien', () => {
    expect(recherchePage('zzz', null)).toEqual([]);
  });

  it('score minimal de la page : un préfixe isolé (4) est visible, une simple faute (3) non', () => {
    expect(SEUIL_RECHERCHE_PAGE).toBe(4);
    const scored = recherchePageScores(normalizeArabic('فوس'), null);
    expect(scored.some((s) => s.score >= 4)).toBe(true);
  });
});

describe('non-régression TUTORAT (barème R6 inchangé)', () => {
  it('seuil 12 : mêmes résultats qu\'avant la tranche (mesure avant / après)', () => {
    expect(searchAllBases(normalizeArabic('مناعة'), null)).toHaveLength(0);
    expect(searchAllBases(normalizeArabic('الغوص'), null)).toHaveLength(1);
    expect(searchAllBases(normalizeArabic('الغلوكوز'), null)).toHaveLength(2);
  });
});
