// lessonIndex.search.r5.test.ts — lot R5 (recommandation 5 de l'audit
// pédagogique) : recherche globale + favoris.
//   G1 : tout chunk de leçon remonté par searchAllBases porte sa lessonKey
//        (deep-link vers ActiveLessonView / HtmlLessonViewer).
//   G6 : trous de retrieval bouchés — الفسفرة التأكسدية (→ respiration) et
//        تنظيم وقت المراجعة (→ carte méthode, transverse).
import { describe, expect, it } from 'vitest';
import { answerTutorQuestion, normalizeArabic, searchAllBases } from '../../smartTutorEngine';

describe('R5-G1 : lessonKey sur les chunks de leçon', () => {
  it('un hit de type lesson porte toujours une lessonKey + un lessonKind', () => {
    const norm = normalizeArabic('تركيب البروتين');
    const hits = searchAllBases(norm, null);
    const lessonHits = hits.filter((h) => h.type === 'lesson');
    expect(lessonHits.length).toBeGreaterThan(0);
    for (const h of lessonHits) {
      expect(typeof h.lessonKey).toBe('string');
      expect(h.lessonKey!.length).toBeGreaterThan(0);
      expect(['html', 'active']).toContain(h.lessonKind);
    }
  });

  it('les chunks des leçons HTML ont lessonKind === "html"', () => {
    const norm = normalizeArabic('تذكير بالمكتسبات ومقر تركيب البروتين');
    const hits = searchAllBases(norm, null).filter((h) => h.type === 'lesson');
    expect(hits.some((h) => h.lessonKind === 'html' && h.id.startsWith('lhx_'))).toBe(true);
  });

  it('les chunks des leçons actives ont lessonKind === "active"', () => {
    const norm = normalizeArabic('تجربة هيل وروبن');
    const hits = searchAllBases(norm, null).filter((h) => h.type === 'lesson');
    expect(hits.some((h) => h.lessonKind === 'active' && h.id.startsWith('lha_'))).toBe(true);
  });
});

describe('R5-G6 : trous de retrieval bouchés', () => {
  it('الفسفرة التأكسدية → carte respiration (définition ATP-سينتاز)', () => {
    const action = answerTutorQuestion('ما هي الفسفرة التأكسدية؟');
    expect(action).not.toBeNull();
    const text = action!.text || '';
    expect(text).toContain('الفسفرة التأكسدية');
    expect(text).toContain('ATP');
    expect(text.toLowerCase()).not.toContain('لم أجد');
  });

  it('تنظيم وقت المراجعة → carte méthode transverse (domainId 0)', () => {
    const action = answerTutorQuestion('كيف أنظم وقت المراجعة؟');
    expect(action).not.toBeNull();
    const text = action!.text || '';
    expect(text).toContain('تنظيم');
    // Doit contenir une des règles concrètes de la carte.
    expect(/1×3×3|الاسترجاع النشط|Ebbinghaus/.test(text)).toBe(true);
  });

  it('alias courts de la carte méthode trouvés', () => {
    for (const q of ['خطة المراجعة', 'كيف أراجع', 'برنامج المراجعة']) {
      const action = answerTutorQuestion(q);
      expect(action, `question non répondue: ${q}`).not.toBeNull();
      expect((action!.text || '').length).toBeGreaterThan(20);
    }
  });

  it('synonyme الكود الوراثي ≡ الشفرة الوراثية (translittération → terme officiel)', () => {
    // L'élève écrit souvent « الكود الوراثي » ; le programme officiel dit
    // « الشفرة الوراثية ». Les deux doivent mener à la carte synthèse.
    const action = answerTutorQuestion('ما هو الكود الوراثي؟');
    expect(action).not.toBeNull();
    expect((action!.text || '')).toContain('تركيب البروتين');
  });
});
