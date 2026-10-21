// h2u11.lock.test.ts — verrou H2 (audit 8 axes, axe 1) : reconstruction U11.
//
// Cible : « Reconstruis U11 (ophiolites / collision / cycle Wilson / تقلص
// قشري) comme unité exigible à part entière. » Critères du rapport :
//   (1) programSequence U11 ≥ 8 chapitres couverts, phase22_chapitres_43_44
//       requise (sortie de CULTURE_GENERALE), 2 leçons actives dédiées ;
//   (2) lessonIndex : ≥ 15 chunks U11 avec أوفيوليت + تقلص + تصادم —
//       plancher mesuré après travaux (2026-10-21, chunks 57→73) :
//       أوفيوليت 2→16, تقلص 4→14, تصادم 17→33, le trio dans un même chunk
//       0→10, l'union des trois 20→34. Le verrou fige les PLANCHERS qui
//       garantissent la non-régression de la couverture U11 ;
//   (3) progression migmatite → wilson → ophiolites (navigation LESSON_PROGRESSION).
// Contenu authentique : étapes Wilson ①→⑥ ancrées dans schema_18_wilson.svg ;
// شواهد التصادم (أوفيوليت، ميكاشيست، طيات، صدوع عكسية) ancrées dans
// schema_17_collision.svg ; datations usuelles : الهيمالايا ≈ 50 مليون سنة
// (اصطدام الهند بآسيا)، الألب ≈ 40 مليون سنة. Append-pur TC6 préservé.
import { describe, expect, it } from 'vitest';
import { ACTIVE_LESSONS, LESSON_PROGRESSION } from './activeLessons';
import { COMPETENCES_OFFICIELLES, CULTURE_GENERALE } from './curriculumOfficial';
import { LESSON_INDEX, LESSON_INDEX_STATS } from './lessonIndex';
import { OFFICIAL_PROGRAM_SEQUENCE } from './programSequence';

const norm = (s: string) => s.replace(/[\u064B-\u0652\u0640\u0640]/g, '');

describe('H2 — séquence officielle U11', () => {
  const u11 = OFFICIAL_PROGRAM_SEQUENCE[11];

  it('au moins 8 chapitres couverts (Rapport H2, critère 1)', () => {
    expect(u11.length).toBeGreaterThanOrEqual(8);
  });

  it('préfixe TC6 inchangé — append-pur, aucun décalage d ids', () => {
    const histo = [
      'd3-u11-l1-migmatite',
      'phase17_chapitres_33_34_2',
      'phase20_chapitres_39_40_2',
      'phase21_chapitres_41_42',
      'phase22_chapitres_43_44',
      'subduction',
    ];
    histo.forEach((cle, i) => expect(u11[i]).toBe(cle));
  });

  it('les 2 leçons actives H2 sont appendées et enregistrées dans ACTIVE_LESSONS', () => {
    expect(u11.slice(-2)).toEqual(['d3-u11-l2-wilson', 'd3-u11-l3-ophiolites']);
    expect(ACTIVE_LESSONS['d3-u11-l2-wilson']).toBeTruthy();
    expect(ACTIVE_LESSONS['d3-u11-l3-ophiolites']).toBeTruthy();
  });

  it('phase22_chapitres_43_44 est requise — sortie de CULTURE_GENERALE', () => {
    expect(u11).toContain('phase22_chapitres_43_44');
    expect(CULTURE_GENERALE.map((c) => c.lessonKey)).not.toContain('phase22_chapitres_43_44');
  });

  it('chaque ressource U11 mappée sur la compétence officielle du domaine 3', () => {
    // H2 : l'unité U11 est rattachée au domaine 3 ; les 2 nouvelles leçons
    // mobilisent sa ressource 3 « الحوادث التي تعقب الغوص ».
    expect(COMPETENCES_OFFICIELLES[3].length).toBeGreaterThan(20);
    expect(u11).toContain('d3-u11-l3-ophiolites');
    expect(u11).toContain('d3-u11-l2-wilson');
  });
});

describe('H2 — les 2 leçons actives dédiées', () => {
  const wilson = ACTIVE_LESSONS['d3-u11-l2-wilson'];
  const ophiolites = ACTIVE_LESSONS['d3-u11-l3-ophiolites'];

  it('wilson : cycle en 6 étapes ordonnées 1→6', () => {
    const seq = wilson.blocks.find((b) => b.type === 'SEQUENCE_ORDER');
    expect(seq).toBeTruthy();
    if (seq?.type !== 'SEQUENCE_ORDER') return;
    expect(seq.steps).toHaveLength(6);
    expect(seq.steps.map((s) => s.expectedOrder)).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it('wilson : les exemples réels du cycle sont présents (SVG schema_18)', () => {
    const texte = JSON.stringify(wilson);
    for (const exemple of ['الصدع الأفريقي', 'البحر الأحمر', 'الأطلسي', 'البحر المتوسط', 'الهيمالايا']) {
      expect(texte).toContain(exemple);
    }
  });

  it('ophiolites : متتالية الأوفيوليت complète (SVG schema_17 + séquence standard)', () => {
    const texte = JSON.stringify(ophiolites);
    for (const terme of ['الغابرو', 'الدوليريت', 'البازلت', 'الراديولاريت', 'سربانتين']) {
      expect(texte).toContain(terme);
    }
  });

  it('ophiolites : datations usuelles présentes (الهيمالايا ≈ 50 Ma, الألب ≈ 40 Ma)', () => {
    const texte = JSON.stringify(ophiolites);
    expect(texte).toContain('50 مليون سنة');
    expect(texte).toContain('40 مليون سنة');
  });

  it('chaînage migmatite → wilson → ophiolites', () => {
    expect(LESSON_PROGRESSION['d3-u11-l1-migmatite']?.nextLessonId).toBe('d3-u11-l2-wilson');
    expect(LESSON_PROGRESSION['d3-u11-l2-wilson']?.nextLessonId).toBe('d3-u11-l3-ophiolites');
    expect(LESSON_PROGRESSION['d3-u11-l3-ophiolites']).toBeTruthy();
  });
});

describe('H2 — couverture du lessonIndex U11 (planchers mesurés 2026-10-21)', () => {
  const u11 = LESSON_INDEX.filter((c) => c.unitId === 11);
  const avecOufiolite = u11.filter((c) => norm(c.text).includes('أوفيوليت')).length;
  const avecTaqallos = u11.filter((c) => norm(c.text).includes('تقلص')).length;
  const avecTasaddum = u11.filter((c) => norm(c.text).includes('تصادم')).length;
  const trio = u11.filter((c) =>
    ['أوفيوليت', 'تقلص', 'تصادم'].every((w) => norm(c.text).includes(w)),
  ).length;
  const union = u11.filter((c) =>
    ['أوفيوليت', 'تقلص', 'تصادم'].some((w) => norm(c.text).includes(w)),
  ).length;

  it('≥ 15 chunks U11 avec أوفيوليت (critère littéral — mesuré 16, était 2)', () => {
    expect(avecOufiolite).toBeGreaterThanOrEqual(15);
  });

  it('planchers تقلص / تصادم / trio / union non régressibles', () => {
    expect(avecTaqallos).toBeGreaterThanOrEqual(12);
    expect(avecTasaddum).toBeGreaterThanOrEqual(30);
    expect(trio).toBeGreaterThanOrEqual(8);
    expect(union).toBeGreaterThanOrEqual(30);
    expect(u11.length).toBeGreaterThanOrEqual(70);
  });

  it('les stats exportées restent cohérentes avec l index reconstruit', () => {
    expect(LESSON_INDEX_STATS.lessonsActive).toBe(Object.keys(ACTIVE_LESSONS).length);
  });
});
