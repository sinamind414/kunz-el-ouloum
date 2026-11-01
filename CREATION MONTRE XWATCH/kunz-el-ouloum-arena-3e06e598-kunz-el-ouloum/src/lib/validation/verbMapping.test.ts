import { describe, expect, it } from 'vitest';
import { mapVerb } from './verbMapping';

describe('mapVerb — verbes de consigne du BAC', () => {
  it('reconnait les quatre verbes employes par les questions guidees', () => {
    // Aucun de ces verbes ne doit retomber sur null : un verbe non mappe prive
    // silencieusement la question de toute loi methodologique.
    const attendus: Record<string, string> = {
      حلل: 'analyse',
      حدد: 'describe',
      فسر: 'interpret',
      استنتج: 'interpret',
    };

    for (const [verbe, actionVerb] of Object.entries(attendus)) {
      expect(mapVerb(verbe), `verbe "${verbe}" non mappe`).not.toBeNull();
      expect(mapVerb(verbe)?.actionVerb, `verbe "${verbe}"`).toBe(actionVerb);
    }
  });

  it('distingue استخرج (relever) de استنتج (conclure)', () => {
    // Guide methodologique §9 : استخرج = ce qui figure dans le document ;
    // استنتج = conclusion logique nouvelle rattachee au probleme scientifique.
    // D2 (2026-09-06, MARQUE §11) : le moteur suit la fiche — استنتج = film 1→2→3→4,
    // donc verbe raisonne (interpret, loi 3) exigeant le lien causal.
    expect(mapVerb('استخرج')?.actionVerb).toBe('identify');
    expect(mapVerb('استنتج')?.actionVerb).toBe('interpret');
    expect(mapVerb('استنتج')?.loiFocus).toBe(3);
    expect(mapVerb('استنتج')?.checks).toEqual(['CAUSAL', 'LEVELS']);
    expect(mapVerb('استخرج')?.actionVerb).not.toBe(mapVerb('استنتج')?.actionVerb);
  });

  it('ne laisse aucune entree multi-mots masquee par une clef plus courte', () => {
    // La polysemie de « حدد » est documentee en tete du fichier : elle doit etre
    // effective. Une iteration par ordre d'insertion rendait ces clefs mortes.
    const specifiques: Record<string, string> = {
      'حدد المشكل العلمي': 'identify',
      'حدد العلاقة بين المنحنيين': 'analyse',
      'حدد الآلية المسؤولة عن الظاهرة': 'interpret',
      'استنتج العلاقة بين البنية والوظيفة': 'analyse',
    };

    for (const [prompt, actionVerb] of Object.entries(specifiques)) {
      expect(mapVerb(prompt)?.actionVerb, `prompt "${prompt}"`).toBe(actionVerb);
    }
  });

  it('conserve le verbe generique quand aucune precision ne suit', () => {
    expect(mapVerb('حدد')?.actionVerb).toBe('describe');
    expect(mapVerb('حدد مكونات الريبوزوم')?.actionVerb).toBe('describe');
  });

  it('rend null sur une entree vide ou sans verbe connu', () => {
    expect(mapVerb('')).toBeNull();
    expect(mapVerb('   ')).toBeNull();
    expect(mapVerb('نص بدون فعل تعليمة')).toBeNull();
  });
});
