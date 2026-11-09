// Verrous du glossaire du Capitaine (étage 2, 2026-11-07).
// Objet : prouver qu'AUCUN contenu n'a été inventé et que les 10 contrats,
// les verdicts et les silences restent ceux du moteur existant.

import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  chercherMot,
  CONTRATS_VERBES,
  FICHES_GLOSSAIRE,
  U8_GLOSSAIRE,
  VERDICTS_ESSAI,
  verdictEssai,
} from './glossaireCapitaine';
import { FILL_BLANK_QUESTIONS } from './fillBlanks';
import { NON_EXIGIBLES } from './curriculumOfficial';
import { normalizeArabic } from '../utils/arabicNormalize';

const lire = (p: string) => readFileSync(resolve(__dirname, '../../', p), 'utf8');
const sourceModule = lire('src/data/glossaireCapitaine.ts');
const sourceMoteur = lire('src/smartTutorEngine.ts');
const dictionnaire = JSON.parse(lire('src/data/dictionaries/dictionnaire_final.json'));

describe('source unique : zéro contenu inventé', () => {
  it('toutes les fiches viennent des 121 micro-tests servis', () => {
    expect(FILL_BLANK_QUESTIONS.length).toBe(121);
    expect(FICHES_GLOSSAIRE.length).toBe(FILL_BLANK_QUESTIONS.length);
    const reponses = new Set(FILL_BLANK_QUESTIONS.map((q) => q.microTest.acceptedAnswers[0]));
    for (const f of FICHES_GLOSSAIRE) expect(reponses.has(f.definitionAr)).toBe(true);
  });

  it('aucune définition courte n est écrite en dur dans le module', () => {
    for (const q of FILL_BLANK_QUESTIONS.slice(0, 40)) {
      expect(sourceModule).not.toContain(q.microTest.acceptedAnswers[0]);
    }
    expect(sourceModule).toContain('FILL_BLANK_QUESTIONS');
  });

  it('les 39 exclu_ids du correcteur ne peuvent jamais être servis comme définition', () => {
    const ids: string[] = dictionnaire.meta.exclu_ids;
    expect(ids.length).toBe(39);
    for (const id of ids) {
      expect(chercherMot(id).statut).not.toBe('definition');
    }
  });

  it('U8 est documentée à partir de la progression officielle, pas inventée', () => {
    expect(U8_GLOSSAIRE.uniteId).toBe(8);
    expect(U8_GLOSSAIRE.heures).toBe(2);
    expect(U8_GLOSSAIRE.semaines).toBe(0.5);
    expect(U8_GLOSSAIRE.statut).toBe('exclusion-documentee');
    expect(U8_GLOSSAIRE.titreAr).toContain('ما فوق البنية الخلوية');
  });
});

describe('les 10 contrats de verbes sont CEUX du moteur', () => {
  it('le moteur déclare exactement 10 contrats, identiques mot pour mot', () => {
    const blocs = [...sourceMoteur.matchAll(
      /\{ verb: '([^']+)', labelAr: '([^']+)', contractAr: '([^']+)'/g,
    )];
    expect(blocs.length).toBe(10);
    const duMoteur = blocs.map((b) => ({
      verb: b[1],
      labelAr: b[2],
      contractAr: b[3].replace(/\\n/g, '\n'),
    }));
    expect(CONTRATS_VERBES).toEqual(duMoteur);
  });

  it('les verdicts sont repris du moteur (aveu, juste, à revoir)', () => {
    expect(sourceMoteur).toContain(VERDICTS_ESSAI.aveu);
    expect(sourceMoteur).toContain(VERDICTS_ESSAI.juste);
    expect(sourceMoteur).toContain('إجابتك غير موفقة');
    expect(sourceMoteur).toContain('اقرأ الشرح بعناية خاصة لبدايته');
  });
});

describe('comportement H1/H2/H3 et garde-fous', () => {
  it('un nom connu donne sa définition courte + le renvoi leçon + une sonde', () => {
    const r = chercherMot('الجين');
    expect(r.statut).toBe('definition');
    expect(r.definitionAr).toBe(FILL_BLANK_QUESTIONS[0].microTest.acceptedAnswers[0]);
    expect(r.renvoiAr).toContain('الوحدة');
    expect(r.donneLieuASonde).toBe(true);
    expect(r.sondeAr).toContain('حاول');
  });

  it('un verbe donne son contrat يُطلب/يُمنع, jamais une définition', () => {
    const r = chercherMot('استنتج');
    expect(r.statut).toBe('verbe');
    expect(r.contratAr).toContain('يُطلب:');
    expect(r.contratAr).toContain('يُمنع:');
    expect(r.definitionAr).toBeUndefined();
    expect(r.donneLieuASonde).toBe(true);
  });

  it('les 3 NON_EXIGIBLES sont étiquetés, pas définis', () => {
    for (const n of NON_EXIGIBLES) {
      const r = chercherMot(n.terme);
      expect(r.statut).toBe('non-exigible');
      expect(r.etiquetteAr).toBe('غير ممتحن فيه');
      expect(r.definitionAr).toBeUndefined();
      expect(r.donneLieuASonde).toBe(false);
    }
  });

  it('une variante renvoie au nom du livre sans fabriquer de définition', () => {
    const r = chercherMot('إنزيم روبيسكو');
    expect(r.statut).toBe('alias');
    expect(r.termeAr).toContain('RuBisCO');
    expect(r.definitionAr).toBeUndefined();
  });

  it('la variante ARNm retrouve une fiche réelle (pas un simple renvoi)', () => {
    const r = chercherMot('الحمض الريبي النووي المرسال');
    expect(r.statut).toBe('definition');
    expect(r.definitionAr).toBeTruthy();
  });

  it('mot inconnu, dialecte et diacritiques → échec explicite, jamais de contenu inventé', () => {
    for (const m of ['zzzqqq', 'شنو الجين', '', 'الجِين', 'المورّثة']) {
      const r = chercherMot(m);
      expect(['inconnu', 'definition']).toContain(r.statut);
      if (r.statut === 'inconnu') {
        expect(r.contenuAr).toContain('لم أجد');
        expect(r.definitionAr).toBeUndefined();
      }
    }
  });

  it('normalisation : même mot avec diacritiques et hamza', () => {
    expect(normalizeArabic('الجِين')).toBe(normalizeArabic('الجين'));
    expect(chercherMot('الجِين').statut).toBe('definition');
  });

  it('verdict : « لا أعرف » ouvre par la base, sans accuser l élève', () => {
    const r = chercherMot('الجين');
    expect(verdictEssai(r, 'لا أعرف')).toBe(VERDICTS_ESSAI.aveu);
    expect(verdictEssai(r, r.definitionAr!)).toBe(VERDICTS_ESSAI.juste);
    expect(verdictEssai(r, '').length).toBeGreaterThan(0);
  });
});
