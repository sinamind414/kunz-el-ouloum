// src/data/hosila.lock.test.ts — VERROU de src/data/hosila.ts (GÉNÉRÉ).
// Garantit l'intégrité du نص «الحصيلة المعرفية» OFFICIEL (photos du livre) :
// couverture des 10 unités, ancrages page-par-page, propreté (aucun reste
// d'extraction ni de LaTeX), blocs mémorisables. Réexécuter le générateur
// (npx tsx scripts/build_hosila.ts) en cas d'échec — jamais de patch à la main.
import { describe, it, expect } from 'vitest';
import { HOSILA_OFFICIELLES, HOSILA_IDS, HOSILA_STATS } from './hosila';

const IDSAttendUS = ['d1u1', 'd1u2', 'd1u3', 'd1u4', 'd1u5', 'd2u1', 'd2u2', 'd3u1', 'd3u2', 'd3u3'];

/** Ancrages vérifiés page par page sur les photos du livre. */
const ANCRES: Record<string, string[]> = {
  d1u1: ['Introns', '64 رامزة', 'مصير البروتين'],
  d1u2: ['البنية الرابعة', 'Rastop'],
  d1u3: ['درجة حرارة', 'النشاط الإنزيمي'],
  d1u4: ['HLA', 'الريزوس', 'الأجسام المضادة'],
  d1u5: ['رانفيي', 'الادماج العصبي'], // corps « 2. الادماج… » (L421 source) — l'en-tête hamza est exclue
  d2u1: ['RuDP', 'كالفن'],
  d2u2: ['38 ATP', 'التخمر الكحولي', 'Acetyl-CoA'],
  d3u1: ['الموجات الزلزالية', 'الليتوسفير'],
  d3u2: ['الصفائح التكتونية', 'الطاقة الداخلية'],
  d3u3: ['الأفيوليت', 'مناطق التصادم'],
};

describe('hosila.ts — حصيلة معرفية رسمية (livre)', () => {
  it('couvre exactement les 10 unités, ids uniques et ordonnés', () => {
    expect(HOSILA_IDS).toEqual(IDSAttendUS);
    expect(new Set(HOSILA_IDS).size).toBe(10);
    expect(HOSILA_OFFICIELLES.map((u) => u.id)).toEqual(IDSAttendUS);
    expect(HOSILA_STATS.unites).toBe(10);
    expect(HOSILA_OFFICIELLES.length).toBe(HOSILA_STATS.unites);
  });

  it('métadonnées intactes : domaine, nom, portée source, nbPoints = cartes à mémoriser', () => {
    for (const u of HOSILA_OFFICIELLES) {
      expect([1, 2, 3]).toContain(u.domaine);
      expect(u.uniteAr.trim().length).toBeGreaterThan(2);
      expect(u.sourceRange).toContain('الحصيلة الرسمية');
      expect(u.blocs.length).toBeGreaterThanOrEqual(10);
      expect(u.nbPoints).toBeGreaterThanOrEqual(1);
      expect(u.nbPoints).toBe(u.blocs.filter((b) => b.kind === 'point').length);
    }
    const total = HOSILA_OFFICIELLES.reduce((s, u) => s + u.blocs.length, 0);
    expect(HOSILA_STATS.blocs).toBe(total);
    expect(HOSILA_STATS.points).toBe(HOSILA_OFFICIELLES.reduce((s, u) => s + u.nbPoints, 0));
  });

  it('ancrages page par page (texte des photos) présents dans chaque unité', () => {
    // Collecte TOUS les manquants avant d'échouer → un seul run révèle tout.
    const manquantes: string[] = [];
    for (const [id, mots] of Object.entries(ANCRES)) {
      const u = HOSILA_OFFICIELLES.find((x) => x.id === id);
      if (!u) { manquantes.push(`${id} : unité manquante`); continue; }
      // num inclus : libellé affiché (badge) — ancrage aussi sur le corps des
      // notes type « 2. الادماج… » (les en-têtes « الصفحة N: » sont exclus du
      // corpus par le générateur, cf. build_hosila.ts).
      const texte = u.blocs.map((b) => `${b.num ? `${b.num} ${b.texte}` : b.texte}`).join(' ');
      for (const m of mots) if (!texte.includes(m)) manquantes.push(`${id} : ancre « ${m} » absente`);
    }
    expect(manquantes).toEqual([]);
  });

  it('propreté : aucun résidu d’extraction, de LaTeX ni de fragment OCR', () => {
    const tout = HOSILA_OFFICIELLES.flatMap((u) => u.blocs.map((b) => b.texte)).join('\n');
    expect(tout).not.toMatch(/EXTRAIRE|livre_scolaire|إليك النص الكامل|تمت مراجعة|الصور (?:الأخيرة|السبع|الثلاث|الأربع|الخمس|الثنتين)/);
    expect(tout).not.toMatch(/\$|\\(?:text|rightarrow|Delta)|\bo \d|\bMax\b/);
    expect(tout).not.toMatch(/_[A-Za-z0-9]|\^[A-Za-z0-9]/); // LaTeX non converti
    // Aucune ligne PUREMENT réduite à UN seul alphanumérique (mot-fragment de
    // formule, ex. « C » isolé, sans aucun arabe). La ponctuation seule n'est
    // PAS un résidu ; une phrase arabe légitime contenant un unique chiffre ou
    // lettre latine (« الترجمة 3 خطوات », « الصنف I ») n'est PAS un fragment.
    const fragments: string[] = [];
    for (const l of tout.split('\n')) {
      const al = l.replace(/[^0-9A-Za-z]/g, '');
      const arabe = /[\u0600-\u06FF]/.test(l);
      if (!arabe && al.length === 1) fragments.push(l);
    }
    expect(fragments).toEqual([]);
    for (const u of HOSILA_OFFICIELLES) {
      for (const b of u.blocs) {
        expect(b.texte.trim()).toBe(b.texte);
        expect(b.texte.length).toBeGreaterThan(0);
        expect(['titre', 'point', 'puce', 'note', 'texte']).toContain(b.kind);
      }
    }
  });

  it('chaque unité contient au moins ses titres d’activités (النشاط) du livre', () => {
    for (const u of HOSILA_OFFICIELLES) {
      const titres = u.blocs.filter((b) => b.kind === 'titre');
      expect(titres.length, `${u.id}: titres`).toBeGreaterThanOrEqual(3);
      expect(titres.some((t) => t.texte.includes('الحصيلة')), `${u.id}: titre الحصيلة`).toBe(true);
    }
  });
});
