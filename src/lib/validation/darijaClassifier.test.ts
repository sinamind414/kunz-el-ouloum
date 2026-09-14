// darijaClassifier.test.ts — Preuve de la purge v2.1 (audit D4)
//
// Contrats :
//   1. Copie فصحى scientifique → FUSHHA (jamais classée MIXTE par des mots فصحى)
//   2. Copie دارجة (≥ 60% marqueurs) → DARIJA
//   3. Aucun marqueur mojibake/corrompu dans les listes (تRAV, مضoglyphique…)
//   4. Matching DARJA par mot EXACT — «الهادئ» ne matche pas «هاد»
//   5. MIXTE : 1-2 marqueurs دارجة isolés dans une copie par ailleurs فصحى
import { describe, it, expect } from 'vitest';
import { detecterRegistre } from './darijaClassifier';

// Copie modèle BAC (فصحى scientifique — manuel SVT DZ)
const COPIE_FUSHHA =
  'نلاحظ أن الغلوكوز يتحلل في الهيولى ثم تتم دورة كريبس في المصفوفة الميتوكوندرية ' +
  'وبالتالي تنتج السلسلة التنفسية على الغشاء الداخلي 34 ATP لذلك يكون المجموع 38 ATP';

// Copie دارجة (parler algérien — la majorité des mots SONT des marqueurs)
const COPIE_DARIJA = 'نديرو نشوفو كيفاش هاكا باش خلاص';

describe('detecterRegistre — purge v2.1', () => {
  it('copie فصحى scientifique → FUSHHA (mots فصحى ≠ دارجة)', () => {
    const r = detecterRegistre(COPIE_FUSHHA);
    expect(r.classe).toBe('FUSHHA');
    expect(r.jarida_markers_found).toEqual([]);
    expect(r.fushha_markers_found.length).toBeGreaterThanOrEqual(2);
  });

  it('copie دارجة → DARIJA (score ≥ 60)', () => {
    const r = detecterRegistre(COPIE_DARIJA);
    expect(r.classe).toBe('DARIJA');
    expect(r.score).toBeGreaterThanOrEqual(60);
    expect(r.jarida_markers_found.length).toBeGreaterThanOrEqual(3);
  });

  it('AUCUN token corrompu possible : caractères non-arabes/non-latins rejetés', () => {
    // تRAV (latin collé), مضoglyphique, هahaha — la normalisation isole les
    // segments arabes ; aucun marqueur mono-mot ne peut contenir de mojibake.
    const r = detecterRegistre('تRAV مضoglyphique نص علمي فصيح جيد جدا');
    // Un texte avec 4 mots فصحى et 0 marqueur → pas DARIJA
    expect(r.classe).not.toBe('DARIJA');
    expect(r.jarida_markers_found).toEqual([]);
  });

  it('matching DARJA par mot EXACT : «الهادئ» ne contient pas le marqueur «هاد»', () => {
    const r = detecterRegistre('الجواب الهادئ يكون دقيقا في الامتحان النهائي');
    expect(r.jarida_markers_found).toEqual([]);
    expect(r.classe).not.toBe('DARIJA');
  });

  it('MIXTE : un marqueur دارجة isolé dans une copie sinon فصحى', () => {
    // «باش» seul dans une copie neutre (peu de marqueurs فصحى) → MIXTE :
    // score دارجة < 60 mais > 20, ou marqueurs فصحى < 2
    const r = detecterRegistre('نستخرج المعطيات باش نحلل الظاهرة ثم نستنتج');
    expect(r.jarida_markers_found).toContain('باش');
    expect(r.score).toBeLessThan(60);
    expect(r.classe).toBe('MIXTE');
  });

  it('texte vide → classe FUSHHA + recommandation non vide', () => {
    const r = detecterRegistre('');
    expect(r.classe).toBe('FUSHHA');
    expect(r.score).toBe(0);
    expect(r.recommandation_ar.length).toBeGreaterThan(0);
  });
});
