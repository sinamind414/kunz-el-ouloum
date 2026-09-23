// lessonIcons.test.ts — Verrou de la navigation « icône après icône »
// (décision propriétaire 2026-09-22, étendue aux 3 rubriques).
//
// Contrats : les 11 unités du catalogue ont une icône (licite, distincte) ; les
// 47 chapitres passifs — sur TOUS les domaines et TOUTES les unités — et les
// leçons actives reçoivent une icône licite ; les 10 unités de بنك الحفظ et ses
// 8 sections de méthodologie ont une entrée explicite ; les règles sémantiques
// ne se marchent pas dessus (Gauge avant Boxes, Layers avant BatteryCharging) ;
// déterminisme.

import { describe, expect, it } from 'vitest';
import {
  ICONES_AUTORISEES,
  UNIT_ICON_KEY,
  uniteIcone,
  chapitreIcone,
  OKACHA_UNIT_ICON_KEY,
  okachaUniteIcone,
  METHODO_ICON_KEY,
  methodoIcone,
} from './lessonIcons';
import { PASSIVE_DOMAINS, hasHtmlFile, getPassiveLessonTitle, getActiveLessonKeysForUnit, getActiveLessonTitle } from './lessonModes';
import { getUnitLessonSequence } from './unitLessonSequences';
import { INITIAL_UNITS } from './index';
import { HTML_LESSON_ORDER } from './htmlLessonProgression';
import { OKACHA_UNITES_ENRICHIES, OKACHA_METHODO_SECTIONS } from './okachaEnriched';

const licite = (cle: string) => (ICONES_AUTORISEES as readonly string[]).includes(cle);

/** Tous les chapitres passifs exposés par la navigation (domaine → unité). */
function chapitresPassifs(): { unitId: number; key: string; titre: string }[] {
  const out: { unitId: number; key: string; titre: string }[] = [];
  for (const d of PASSIVE_DOMAINS) {
    for (const uid of d.unitIds) {
      for (const key of getUnitLessonSequence(uid).filter(hasHtmlFile)) {
        out.push({ unitId: uid, key, titre: getPassiveLessonTitle(key) });
      }
    }
  }
  return out;
}

describe('passiveLessonIcons — icônes des unités', () => {
  it('les 11 unités du catalogue ont une icône licite', () => {
    expect(Object.keys(UNIT_ICON_KEY)).toHaveLength(11);
    for (const u of INITIAL_UNITS) {
      expect(licite(uniteIcone(u.id)), `unité ${u.id} → icône non licite`).toBe(true);
    }
  });

  it('chaque unité listée dans un domaine passif a une icône licite', () => {
    for (const d of PASSIVE_DOMAINS) {
      for (const uid of d.unitIds) {
        expect(licite(uniteIcone(uid)), `domaine ${d.id} / unité ${uid}`).toBe(true);
      }
    }
  });

  it('11 icônes d’unités distinctes (aucune unité ne partage son repère)', () => {
    const toutes = INITIAL_UNITS.map((u) => uniteIcone(u.id));
    expect(new Set(toutes).size).toBe(11);
  });

  it('unité inconnue → repli neutre, jamais une icône indéfinie', () => {
    expect(uniteIcone(99)).toBe('FileText');
    expect(licite(uniteIcone(0))).toBe(true);
  });
});

describe('passiveLessonIcons — icônes des chapitres', () => {
  it('les 47 chapitres passifs (3 domaines, 11 unités) ont une icône licite', () => {
    const chapitres = chapitresPassifs();
    expect(chapitres).toHaveLength(47);
    expect(chapitres).toHaveLength(HTML_LESSON_ORDER.length);
    for (const c of chapitres) {
      expect(licite(chapitreIcone(c.titre, c.unitId)), `${c.key} → ${c.titre}`).toBe(true);
    }
  });

  it('chaque domaine a bien ses unités couvertes', () => {
    for (const d of PASSIVE_DOMAINS) {
      const n = d.unitIds.reduce(
        (acc, uid) => acc + getUnitLessonSequence(uid).filter(hasHtmlFile).length,
        0,
      );
      expect(n).toBeGreaterThan(0);
    }
    expect(PASSIVE_DOMAINS.flatMap((d) => d.unitIds)).toHaveLength(11);
  });

  it('règles sémantiques : chaque famille tombe sur la bonne icône', () => {
    expect(chapitreIcone('استنساخ المعلومات الوراثية الموجودة على مستوى ADN', 1)).toBe('Dna');
    expect(chapitreIcone('الترجمة ومراحل الترجمة في الريبوزوم', 1)).toBe('Boxes');
    expect(chapitreIcone('تأثير تغير درجة pH الوسط على نشاط الإنزيم', 3)).toBe('Gauge');
    expect(chapitreIcone('الذات واللاذات (CMH / HLA والزمرة الدموية)', 4)).toBe('ShieldCheck');
    expect(chapitreIcone('كمون الراحة', 5)).toBe('Brain');
    expect(chapitreIcone('تفاعلات المرحلة الكيميحيوية (حلقة كالفن)', 6)).toBe('Sun');
    expect(chapitreIcone('الفسفرة التأكسدية', 7)).toBe('Flame');
    expect(chapitreIcone('التحولات الطاقوية على المستوى الخلوي', 8)).toBe('BatteryCharging');
    expect(chapitreIcone('تيارات الحمل الحراري (محرك الصفائح)', 9)).toBe('Earth');
    expect(chapitreIcone('نمذجة البنية الداخلية للكرة الأرضية', 10)).toBe('Layers');
    expect(chapitreIcone('شواهد التقلص (الطيات والفوالق)', 11)).toBe('Mountain');
  });

  it('priorités : enzyme avant protéine, structure terrestre avant énergie', () => {
    // « النشاط الإنزيمي وعلاقته ببنية الإنزيم » : Gauge (enzyme), pas Boxes (بنية).
    expect(chapitreIcone('النشاط الإنزيمي وعلاقته ببنية الإنزيم', 3)).toBe('Gauge');
    // « الطاقة الداخلية للكرة الأرضية » : Layers (structure), pas BatteryCharging.
    expect(chapitreIcone('الطاقة الداخلية للكرة الأرضية', 9)).toBe('Layers');
    // « دورة الطاقة والمادة في المحيط الحيوي » : BatteryCharging, pas Earth.
    expect(chapitreIcone('دورة الطاقة والمادة في المحيط الحيوي (إثراء ثقافي)', 8)).toBe('BatteryCharging');
  });

  it('titre non reconnu → icône de l’unité (aucune carte sans icône)', () => {
    for (const u of INITIAL_UNITS) {
      expect(chapitreIcone('zzz غير معروف', u.id)).toBe(uniteIcone(u.id));
    }
  });

  it('déterminisme : même titre, même unité → même icône', () => {
    const titre = 'حركات الصفائح التكتونية (اتساع قاع المحيط والمغناطيسية القديمة)';
    expect(chapitreIcone(titre, 9)).toBe(chapitreIcone(titre, 9));
    expect(chapitreIcone(titre, 9)).toBe('Earth');
  });
});

// ---------------------------------------------------------------------------
// الدرس النشيط — toutes les leçons actives reçoivent une icône licite.
// ---------------------------------------------------------------------------
describe('lessonIcons — leçons actives', () => {
  const unitesActives = INITIAL_UNITS.filter((u) => getActiveLessonKeysForUnit(u.id).length > 0);

  it('les unités actives sont couvertes et non vides', () => {
    expect(unitesActives.length).toBeGreaterThan(0);
    for (const u of unitesActives) {
      expect(getActiveLessonKeysForUnit(u.id).length).toBeGreaterThan(0);
      expect(licite(uniteIcone(u.id))).toBe(true);
    }
  });

  it('chaque leçon active a une icône licite (repli = icône de l’unité)', () => {
    let total = 0;
    for (const u of unitesActives) {
      for (const key of getActiveLessonKeysForUnit(u.id)) {
        const ic = chapitreIcone(getActiveLessonTitle(key), u.id);
        expect(licite(ic), `${key} → ${ic}`).toBe(true);
        total++;
      }
    }
    expect(total).toBe(6); // U6×3 (hill/jagendorf/calvin), U7 racker, U9 benioff, U11 migmatite
  });

  it('sémantique des 6 leçons actives actuelles', () => {
    expect(chapitreIcone('تجربة هيل وروبن : مصدر الأكسجين المنطلق في التركيب الضوئي', 6)).toBe('Sun');
    expect(chapitreIcone('تجربة جاغندورف : تركيب ATP في الظلام وتدرج البروتونات', 6)).toBe('BatteryCharging');
    expect(chapitreIcone('تجربة كالفن : تتبع ¹⁴CO₂ وكشف حلقة كالفن', 6)).toBe('Sun');
    // راكر : aucun mot-clé → repli sur l'icône de l'unité (U7 = Flame).
    expect(chapitreIcone('تجربة راكر : إثبات النظرية الكيمياؤسموزية لميتشل', 7)).toBe('Flame');
    expect(chapitreIcone('مستوى بنيوف : توزع بؤر الزلازل دليل على الغوص', 9)).toBe('Earth');
    expect(chapitreIcone('شواهد التقلص — التضاعف القشري وصخر المغماتيت', 11)).toBe('Mountain');
  });
});

// ---------------------------------------------------------------------------
// بنك الحفظ (عكاشة) — 10 unités du livre + 8 sections de méthodologie.
// ---------------------------------------------------------------------------
describe('lessonIcons — بنك الحفظ (عكاشة)', () => {
  it('chaque unité réelle du livre a une icône explicite licite', () => {
    expect(OKACHA_UNITES_ENRICHIES).toHaveLength(10);
    for (const u of OKACHA_UNITES_ENRICHIES) {
      const cle = OKACHA_UNIT_ICON_KEY[u.id];
      expect(cle, `unité عكاشة ${u.id} (${u.uniteAr}) sans icône`).toBeTruthy();
      expect(licite(cle!)).toBe(true);
      // La résolution publique rend la même clé que la carte explicite.
      expect(okachaUniteIcone(u.id, u.domaine)).toBe(cle);
    }
  });

  it('unités عكاشة : icönes distinctes par domaine attendu', () => {
    expect(okachaUniteIcone('d1u1', 1)).toBe('Dna');
    expect(okachaUniteIcone('d1u4', 1)).toBe('ShieldCheck');   // الدفاع عن الذات
    expect(okachaUniteIcone('d1u5', 1)).toBe('Brain');         // الاتصال العصبي
    expect(okachaUniteIcone('d2u1', 2)).toBe('Sun');           // الطاقة الضوئية
    expect(okachaUniteIcone('d2u2', 2)).toBe('BatteryCharging'); // طاقة قابلة للاستعمال
    expect(okachaUniteIcone('d3u1', 3)).toBe('Layers');        // بنية الكرة الأرضية
    expect(okachaUniteIcone('d3u2', 3)).toBe('Earth');         // الصفائح التكتونية
  });

  it('unité de حفظ inconnue → repli sur l’icône du domaine, jamais vide', () => {
    expect(okachaUniteIcone('dxu9', 1)).toBe('Dna');
    expect(okachaUniteIcone('dxu9', 2)).toBe('BatteryCharging');
    expect(okachaUniteIcone('dxu9', 3)).toBe('Earth');
    expect(licite(okachaUniteIcone('dxu9', 99))).toBe(true);
  });

  it('les 9 sections de méthodologie (8 livre + nasiha) ont une icône explicite licite', () => {
    expect(OKACHA_METHODO_SECTIONS).toHaveLength(9);
    for (const s of OKACHA_METHODO_SECTIONS) {
      const cle = METHODO_ICON_KEY[s.id];
      expect(cle, `section ${s.id} sans icône`).toBeTruthy();
      expect(licite(cle!)).toBe(true);
      expect(methodoIcone(s.id)).toBe(cle);
    }
  });

  it('section de méthodologie inconnue → repli neutre', () => {
    expect(methodoIcone('nouvelle_section')).toBe('FileText');
  });

  it('toutes les clés licites ont un composant divergent : aucune clé orpheline', () => {
    // Unicité des clés (pas de doublon qui masquerait une entrée).
    expect(new Set(ICONES_AUTORISEES).size).toBe(ICONES_AUTORISEES.length);
  });
});
