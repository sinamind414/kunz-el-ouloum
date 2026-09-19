// correcteurIntegration.test.ts — Garde-fous des couches supérieures du correcteur :
// détection transversale, inférence d'unité, notation par barème officiel, sanctions.
//
// Faits du build vérifiés (dictionnaire_final.json, build 2026-09-14) :
//   · 57 items de barème à signature auto, 23 manuels (dont bac2024_S1 Q1 item5/6) ;
//   · bac2024_S1 Q1 : التثبيت/الاستنساخ العكسي/الإدماج/الاستنساخ ont des signatures ;
//   · aucune entité scorée « الترجمة » ou « التبرعم » (a_valider) → manuels ;
//   · aucune entité Michaelis → déclencheurs sanctions codés dans sanctionsCorrecteur.

import { describe, expect, it } from 'vitest';
import { entitesDansTexte, inferreUnite, titreUnite } from './dictionnaireCorrecteur';
import { evaluerBareme, listBaremeQuestions, listBaremeSujets } from './baremeCorrecteur';
import { evaluerSanctions } from './sanctionsCorrecteur';

// ── 1. Détection transversale + inférence ────────────────────────────────────

describe('détection transversale + inférence d unité', () => {
  it('entitesDansTexte : scorées trouvées, a_valider uniquement en pistes', () => {
    const r1 = entitesDansTexte('دور الانتبغراز في تطور الفيروس');
    expect(r1.trouvees.some((t) => t.id === 'E0036')).toBe(true);
    const r2 = entitesDansTexte('الاختزال وإدمان بعض المواد');
    expect(r2.pistes.some((p) => p.id === 'E0004')).toBe(true);
    expect(r2.trouvees.some((t) => t.fiabilite === 'a_valider')).toBe(false);
  });

  it('inferreUnite : « صخور الأفيوليت » → unite 11 (E0050, D3U3)', () => {
    expect(inferreUnite('تتجمع صخور الأفيوليت')?.uniteId).toBe(11);
  });

  it('inferreUnite : texte sans entité scorée → null', () => {
    expect(inferreUnite('الاختزال فقط')).toBeNull();
    expect(inferreUnite('')).toBeNull();
  });

  it('titreUnite : titres du build, "" si id inconnu', () => {
    expect(titreUnite(1)).toContain('البروتين');
    expect(titreUnite(9)).toContain('التكتوني');
    expect(titreUnite(42)).toBe('');
  });
});

// ── 2. Notation par barème officiel ──────────────────────────────────────────

describe('notation par barème officiel (attendus bac2023→2025)', () => {
  const questions = listBaremeQuestions();

  it('groupe les 80 attendus en 12 questions sur 6 sujets', () => {
    expect(questions.length).toBe(12);
    expect(new Set(questions.map((q) => q.sujetId)).size).toBe(6);
    expect(questions.reduce((s, q) => s + q.items.length, 0)).toBe(80);
    for (const q of questions) {
      expect(q.totalPoints, `total ${q.id}`).toBeGreaterThan(0);
      expect(q.labelAr, `label ${q.id}`).toContain('بكالوريا');
    }
  });

  it('listBaremeSujets : les 6 sujets officiels dans l ordre du build', () => {
    expect(listBaremeSujets().map((s) => s.id)).toEqual([
      'bac2023_S1', 'bac2023_S2', 'bac2024_S1', 'bac2024_S2', 'bac2025_S1', 'bac2025_S2',
    ]);
  });

  it('bac2025_S1 Q1 : 5 items à 0.25 (total 1.25)', () => {
    const q = questions.find((x) => x.id === 'bac2025_S1/S1-Ex1/Q1');
    expect(q).toBeDefined();
    expect(q!.items.length).toBe(5);
    expect(q!.totalPoints).toBe(1.25);
  });

  it('crédit automatique par signature (bac2024_S1 Q1 — cycle du VIH)', () => {
    const res = evaluerBareme(
      'تبدأ العملية بالتثبيت ثم الاستنساخ العكسي ثم الإدماج في ADN الخلية',
      'bac2024_S1/S1-Ex1/Q1',
    );
    expect(res).not.toBeNull();
    const credites = res!.verdicts.filter((v) => v.credite);
    // item1 التثبيت (E0429) · item2 الاستنساخ العكسي (E0040) · item3 الإدماج (E0036)
    const ids = credites.map((v) => v.item.id);
    expect(ids).toContain('bac2024_S1/S1-Ex1/Q1/item1');
    expect(ids).toContain('bac2024_S1/S1-Ex1/Q1/item2');
    expect(ids).toContain('bac2024_S1/S1-Ex1/Q1/item3');
    expect(res!.pointsObtenus).toBeGreaterThanOrEqual(0.75);
    expect(res!.pointsObtenus).toBeLessThanOrEqual(res!.pointsTotal);
    for (const v of credites) expect(v.via.length, `via ${v.item.id}`).toBeGreaterThan(0);
  });

  it('items sans signature (الترجمة/التبرعم, a_valider) = mode manuel, jamais crédités', () => {
    const res = evaluerBareme(
      'التثبيت ثم الاستنساخ العكسي ثم الإدماج ثم الاستنساخ والترجمة ثم التبرعم',
      'bac2024_S1/S1-Ex1/Q1',
    );
    expect(res).not.toBeNull();
    const item5 = res!.verdicts.find((v) => v.item.id.endsWith('item5'))!;
    const item6 = res!.verdicts.find((v) => v.item.id.endsWith('item6'))!;
    expect(item5.mode).toBe('manuelle');
    expect(item6.mode).toBe('manuelle');
    expect(item5.credite).toBe(false);
    expect(item6.credite).toBe(false);
    expect(item5.via).toEqual([]);
    // les manuels comptent dans le total mais pas dans les points obtenus
    expect(res!.nbManuelles).toBe(2);
    expect(res!.nbAuto).toBe(4);
    expect(res!.pointsObtenus).toBeLessThanOrEqual(res!.pointsTotal - 0.5);
  });

  it('réponse vide → 0 point ; question inconnue → null', () => {
    const vide = evaluerBareme('', 'bac2024_S1/S1-Ex1/Q1');
    expect(vide).not.toBeNull();
    expect(vide!.pointsObtenus).toBe(0);
    expect(evaluerBareme('x', 'inconnu/Q1')).toBeNull();
  });
});

// ── 3. Sanctions pédagogiques ────────────────────────────────────────────────

describe('sanctions pédagogiques', () => {
  it('faux ami Michaelis « en cloche » détecté (toutes graphies)', () => {
    for (const rep of [
      'منحنى مايكاليس مينتن جرسية الشكل',
      'المنحنى مايكليس الشكل الجرس',
      'courbe de Michaelis en cloche',
    ]) {
      const s = evaluerSanctions(rep).find((x) => x.id === 'courbe_michaelis_forme');
      expect(s, `déclencheur: ${rep}`).toBeDefined();
      expect(s!.gravite).toBe('forte');
      expect(s!.correctionAr).toContain('تشبع');
    }
  });

  it('pas de sanction Michaelis si la courbe est hyperbolique (cas correct)', () => {
    const s = evaluerSanctions('منحنى مايكاليس مينتن يشير إلى التشبع الزائدي مع هضبة عند Vmax');
    expect(s.find((x) => x.id === 'courbe_michaelis_forme')).toBeUndefined();
  });

  it('faux ami HbA (molécule) vs globule rouge (cellule)', () => {
    const s = evaluerSanctions('الهيموغلوبين HbA خلية كروية الشكل');
    const fa = s.find((x) => x.id === 'hemoglobine_vs_globule');
    expect(fa).toBeDefined();
    expect(fa!.correctionAr).toContain('بروتين');
  });

  it('conflit ATP : 30-32 / 36 / 37 tagués, 38 accepté seul (décision correcteur)', () => {
    for (const rep of ['الحصيلة 30-32 ATP', 'الحصيلة 32 ATP', '36 ATP لكل غلوكوز', 'الحصيلة 37 ATP']) {
      const s = evaluerSanctions(rep).find((x) => x.id === 'atp_bilan_respiration');
      expect(s, `conflit attendu: ${rep}`).toBeDefined();
      expect(s!.type).toBe('CONFLIT_REF');
      expect(s!.correctionAr).toContain('38 ATP');
    }
    expect(
      evaluerSanctions('الحصيلة 38 ATP لكل غلوكوز').find((x) => x.id === 'atp_bilan_respiration'),
    ).toBeUndefined();
    expect(
      evaluerSanctions('ينتج التحلل السكري 2 ATP').find((x) => x.id === 'atp_bilan_respiration'),
    ).toBeUndefined();
  });

  it('double-sens (Km, matrice, noyau) = vigilance uniquement, jamais forte', () => {
    const km = evaluerSanctions('قيمة Km عند درجة انزيم معين');
    expect(km.find((x) => x.id === 'km_kilometre_vs_michaelis')?.gravite).toBe('vigilance');
    const matrice = evaluerSanctions('المصفوفة الميتوكوندرية تحتوي انزيمات والسلسلة القالبية مستنسخة');
    expect(matrice.find((x) => x.id === 'matrice_double_sens')?.gravite).toBe('vigilance');
    const noyau = evaluerSanctions('النواة تحتوي ADN ولب الأرض طبقات');
    expect(noyau.find((x) => x.id === 'noyau_double_sens')?.gravite).toBe('vigilance');
    // pas de double-sens si un seul domaine
    expect(evaluerSanctions('النواة تحتوي ADN').find((x) => x.type === 'VIGILANCE')).toBeUndefined();
  });

  it('réponse vide ou neutre : aucune sanction', () => {
    expect(evaluerSanctions('')).toEqual([]);
    expect(evaluerSanctions('   ')).toEqual([]);
    expect(evaluerSanctions('xcvb qsdq 12345')).toEqual([]);
  });
});

// ── 4. Non-régression faux positifs (audit 2026-09-16) ──────────────────────
// Verrouille les correctifs de précision : la sanction ATP exige un contexte
// énergétique (ATP / حصيلة / غلوكوز), et la co-occurrence Hb + « كروي » est
// dégradée en vigilance quand la réponse parle bien de la cellule.

describe('non-régression faux positifs sanctions (audit 2026-09-16)', () => {
  it('A1 — température optimale 37° (unité 3) : AUCUNE sanction ATP', () => {
    const s = evaluerSanctions('درجة الحرارة المثلى للإنزيم هي 37 درجة');
    expect(s.find((x) => x.id === 'atp_bilan_respiration')).toBeUndefined();
  });

  it('A2 — température corporelle décimale 36.8 : AUCUNE sanction ATP', () => {
    const s = evaluerSanctions('حرارة الجسم 36.8 درجة');
    expect(s.find((x) => x.id === 'atp_bilan_respiration')).toBeUndefined();
  });

  it('A3 — numéros de documents 30/32 : AUCUNE sanction ATP', () => {
    const s = evaluerSanctions('كما هو مبيّن في الوثيقة 30 والوثيقة 32 نستنتج أن');
    expect(s.find((x) => x.id === 'atp_bilan_respiration')).toBeUndefined();
  });

  it('A5 — pourcentage de données expérimentales « المصاب 30% » (copies bac2025 S2) : AUCUNE sanction ATP', () => {
    // Évaluation 80 copies : le % de « المصاب 30% » (données SOD, sujet 2)
    // était supprimé par le normaliseur → « 30 » isolé → faux conflit ATP
    // sur 39 copies (dont 5 « excellentes »). Verrouille la conservation de %.
    const s = evaluerSanctions(
      'نشاط انزيم sod السليم 100 والمصاب 30% تركيز ros السليم 4umol l والمصاب 12'
    );
    expect(s.find((x) => x.id === 'atp_bilan_respiration')).toBeUndefined();
  });

  it('A4 — contexte énergétique présent : la sanction ATP reste active', () => {
    for (const rep of ['الحصيلة 37 ATP', 'الحصيلة الطاقوية هي 32', '36 ATP لكل غلوكوز']) {
      const s = evaluerSanctions(rep).find((x) => x.id === 'atp_bilan_respiration');
      expect(s, `déclencheur attendu: ${rep}`).toBeDefined();
      expect(s!.gravite).toBe('forte');
    }
  });

  it('B1 — globule rouge décrit comme cellule contenant Hb : vigilance (pas forte)', () => {
    const s = evaluerSanctions(
      'الكريه الحمراء خلية كروية الشكل تقريبا تحتوي على الهيموغلوبين',
    ).find((x) => x.id === 'hemoglobine_vs_globule');
    expect(s).toBeDefined();
    expect(s!.gravite).toBe('vigilance');
  });

  it('B2 — molécule qualifié de cellule sans contexte cellulaire : forte', () => {
    const s = evaluerSanctions('الهيموغلوبين مستدير الشكل').find(
      (x) => x.id === 'hemoglobine_vs_globule',
    );
    expect(s).toBeDefined();
    expect(s!.gravite).toBe('forte');
  });
});
