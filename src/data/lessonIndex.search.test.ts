// src/data/lessonIndex.search.test.ts — probes de RECHERCHE sur l'index des
// leçons branché au moteur (lot « index leçons ») : les contenus des 47 leçons
// HTML + 20 leçons actives doivent être trouvables via searchAllBases et
// remonter en source de type 'lesson' quand ils sont le meilleur hit.
import { describe, expect, it } from 'vitest';
import { answerTutorQuestion, searchAllBases, normalizeArabic } from '../smartTutorEngine';
import { LESSON_INDEX, LESSON_INDEX_STATS } from './lessonIndex';
import { HTML_LESSON_ORDER } from './htmlLessonProgression';
import { ACTIVE_LESSONS } from './activeLessons';

describe('index des leçons — intégration moteur', () => {
  it('LESSON_INDEX est présent dans searchAllBases (au moins un hit de type lesson)', () => {
    // Titre exact d'une card d'une leçon HTML : doit remonter.
    const norm = normalizeArabic('الدرس 1 : تمثيل البنية الفراغية للبروتين');
    const hits = searchAllBases(norm, null);
    const lessonHits = hits.filter((h) => h.type === 'lesson');
    expect(lessonHits.length).toBeGreaterThan(0);
    expect(lessonHits.some((h) => h.id.startsWith('lhx_'))).toBe(true);
  });

  it('contenu des leçons ACTIVES trouvable — source de type lesson', () => {
    // Titre canonique d'une leçon active (montre d'Hill & Ruben).
    const norm = normalizeArabic('تجربة هيل وروبن');
    const hits = searchAllBases(norm, null);
    expect(hits.some((h) => h.type === 'lesson' && h.id.startsWith('lha_'))).toBe(true);

    const action = answerTutorQuestion('اشرح تجربة هيل وروبن');
    expect(action?.text || '').not.toContain('لم أجد إجابة');
  });

  it('answerTutorQuestion expose la source type lesson pour un contenu propre aux leçons', () => {
    // Question ciblée sur un contenu de card HTML : le snippet doit être répondu.
    const action = answerTutorQuestion('ما هي مستويات البنية الفراغية للبروتين؟');
    expect(action?.text || '').not.toContain('لم أجد إجابة');
    expect(action?.sources?.length || 0).toBeGreaterThan(0);
  });

  it('stats cohérentes : 47 leçons HTML, 20 actives, ≥ 400 chunks', () => {
    expect(LESSON_INDEX_STATS.lessonsHtml).toBe(HTML_LESSON_ORDER.length);
    expect(LESSON_INDEX_STATS.lessonsActive).toBe(Object.keys(ACTIVE_LESSONS).length);
    expect(LESSON_INDEX_STATS.chunksTotal).toBeGreaterThanOrEqual(400);
    expect(LESSON_INDEX.length).toBe(LESSON_INDEX_STATS.chunksTotal);
  });

  it('hors-sujet toujours refusé malgré l index élargi', () => {
    for (const q of ['من هو ميسي؟', 'كيف أطبخ الكسكس؟', 'ما رأيك في السياسة؟']) {
      const action = answerTutorQuestion(q);
      expect(action?.text || '', q).toContain('لم أجد إجابة');
    }
  });
});
