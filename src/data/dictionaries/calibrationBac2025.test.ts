// calibrationBac2025.test.ts — Verrous de la notation R6 (Pierre 2 : attendus
// obligatoires) + garde du LEGACY (fit linéaire, déprécié hors recherche).
//
// R6 : la note = min(couverture_attendus × maxPts, plafonds d'intégrité).
// Le dénominateur est le REGISTRE (attendusBac2025.ts) — la banque d'unité
// n'est plus jamais un dénominateur (audit C1/C2 : elle payait les salades 8/8).

import { describe, expect, it } from 'vitest';
import {
  formePresente,
  noterCopieCalibree,
  noterExerciceCalibre,
  uniteDeGroupe,
} from './calibrationBac2025';
import { attendusDeGroupe } from './attendusBac2025';
import { normalizeAr } from '../../lib/validation/normalizeAr';
import { MEFTA_BAC_EXERCISES } from '../meftahManhajia';
import { PLAFONDS } from './integriteCopie';

// Réponse qui contient TOUS les textes officiels d'un groupe → toutes les
// formes matchent → couverture 1 → note max (cohérence registre ↔ scoreur).
// + les réponses modèle Meftah (S1) : les variantes arabes des composantes P5
//   n'existent que dans la formulation élève officielle.
// + glossaire S2-Ex1 : « فوسفات » (l'item C = Pi n'emporte pas le mot arabe).
function reponseExhaustive(sujet: 1 | 2, exercice: 1 | 2 | 3): string {
  const textes = attendusDeGroupe(sujet, exercice).items.map((i) => i.texteAr).join(' ');
  let extra = '';
  if (sujet === 1) {
    const ex = MEFTA_BAC_EXERCISES.find((x) => x.id === `bac2025-ex${exercice}`);
    extra = ex ? ex.questions.flatMap((q) => q.writeAr).join('\n') : '';
  }
  if (sujet === 2 && exercice === 1) extra = 'فوسفات';
  return `${textes} ${extra}`;
}

describe('R6 — invariants de la notation par attendus obligatoires', () => {
  it('copie vide → 0 pt sur les 6 groupes', () => {
    for (const sujet of [1, 2] as const) {
      for (const exercice of [1, 2, 3] as const) {
        expect(noterExerciceCalibre('', sujet, exercice).points).toBe(0);
      }
    }
  });

  it('texte couvrant TOUS les attendus → note max (plafond auto = barème)', () => {
    for (const sujet of [1, 2] as const) {
      for (const exercice of [1, 2, 3] as const) {
        const n = noterExerciceCalibre(reponseExhaustive(sujet, exercice), sujet, exercice);
        expect(n.couverture, `S${sujet}-Ex${exercice}`).toBe(1);
        expect(n.points).toBe(n.maxPts);
        expect(n.plafonds).toEqual([]); // c'est de la prose officielle
      }
    }
  });

  it('points = couverture × maxPts, sauf plafond d’intégrité (formule R6)', () => {
    for (const sujet of [1, 2] as const) {
      for (const exercice of [1, 2, 3] as const) {
        const n = noterExerciceCalibre(reponseExhaustive(sujet, exercice).slice(0, 400), sujet, exercice);
        const borne = Math.min(...(n.plafonds.length ? n.plafonds.map((p) => p.plafondPct) : [1])) * n.maxPts;
        expect(n.points).toBeLessThanOrEqual(Math.round(borne * 100) / 100 + 1e-9);
        expect(n.points).toBe(Math.round(Math.min(n.couverture * n.maxPts, borne) * 100) / 100);
      }
    }
  });

  it('le déversement de la banque d’unité NE PAIE PLUS (fin du détecteur de déversement)', () => {
    // Texte « immunité » (banque U4) sur S2-Ex3 (transfusion) : avant R6 il
    // saturait 8/8 ; il ne touche presque aucun attendu officiel du groupe.
    const immunité =
      'المستضد أجسام مضادة خلايا بلازمية معقد مناعي بلعمة المتمم الانتقاء النسيلي خلايا ذاكرة ' +
      'الاستجابة الأولية الاستجابة الثانوية اللقاح LTc البرفورين الغرانزيمات TCR LT4 الإنترلوكين GP120 CD4';
    const n = noterExerciceCalibre(immunité, 2, 3);
    expect(n.points).toBeLessThanOrEqual(0.25 * 8); // ≤ 2/8 — quasi rien
    expect(n.couverture).toBeLessThan(0.3);
  });

  it('hors-sujet intrinsèque → 0 (sans aucun paramètre : les attendus sont OBLIGATOIRES)', () => {
    const reflexe =
      'المنعكس العضلي ثنائي المشبك يمر عبر النخاع الشوكي، واللوحة المحركة هي البنية النهائية، ' +
      'وآلية الإدماج الزمني والفضائي تحدد شدة الاستجابة، وقانون الكل أو لا شيء يحكم المحور الأسطواني.';
    const n = noterExerciceCalibre(reflexe, 1, 3);
    expect(n.couverture).toBe(0);
    expect(n.points).toBe(0);
  });

  it('groupe inconnu → throw du registre (jamais de dénominateur de substitution)', () => {
    // attendusDeGroupe lève ; noterExerciceCalibre ne peut pas être appelé hors 2025.
    expect(() => attendusDeGroupe(3 as 1 | 2, 3)).toThrow(/attendu/);
  });

  it('mapping unités (diagnostic) inchangé : S1 [1,6,5] · S2 [7,3,4]', () => {
    const copie = noterCopieCalibree(['', '', ''], 1);
    expect(copie.exercices.map((e) => e.uniteId)).toEqual([1, 6, 5]);
    const copie2 = noterCopieCalibree(['', '', ''], 2);
    expect(copie2.exercices.map((e) => e.uniteId)).toEqual([7, 3, 4]);
  });

  it('total copie = somme des exercices ≤ 20', () => {
    const copie = noterCopieCalibree([reponseExhaustive(1, 1), reponseExhaustive(1, 2), reponseExhaustive(1, 3)], 1);
    expect(copie.total).toBe(20);
    expect(copie.total).toBeLessThanOrEqual(20);
  });
});

describe('C5 — frontières latines (fin des faux positifs de sous-chaînes)', () => {
  it('formePresente : « co2 » ne crédite pas « o2 », « ARNm » pas « arn », « Edaravone » pas « eda »', () => {
    expect(formePresente('خلط co2 و h2o', 'o2')).toBe(false);
    expect(formePresente('توفير o2', 'o2')).toBe(true);
    expect(formePresente('arnm arnr', 'arn')).toBe(false);
    expect(formePresente('انواع arn', 'arn')).toBe(true);
    expect(formePresente('edaravone', 'eda')).toBe(false);
    expect(formePresente('eda دواء', 'eda')).toBe(true);
    // chiffres : frontière alphanumérique complète
    expect(formePresente('saison 1982', '98')).toBe(false);
    expect(formePresente('تراكيز 98', '98')).toBe(true);
    // chiffres adjacents admis pour les formes alphabétiques (« 2Pi » crédite Pi)
    expect(formePresente('2pi', 'pi')).toBe(true);
    // arabes : sous-chaîne (inchangé)
    expect(formePresente('مواد مضاده للاجسام المضاده', 'مضاده للاجسام')).toBe(true); // paire réelle du registre (S2-Ex3)
  });

  it('S1-Ex1 : « ARNm » seul crédite son item à moitié, PAS l item intro (forme « arn »)', () => {
    const n = noterExerciceCalibre('ARNm', 1, 1);
    expect(n.verdicts.find((v) => v.id.endsWith('Q2/intro'))!.pointsCredites).toBe(0);
    const arnm = n.verdicts.find((v) => v.id.endsWith('Q2/ARNm'))!;
    expect(arnm.composantesDetectees).toBe(1);
  });

  it('S2-Ex2 : « Edaravone » (nom complet) crédite son item (forme dédiée)', () => {
    const n = noterExerciceCalibre('يستعمل دواء Edaravone لعلاج المرض.', 2, 2);
    const v = n.verdicts.find((x) => x.texteAr.includes('الربط بالمعادلات'))!;
    expect(v.pointsCredites).toBe(0.5);
  });
});

describe('P5 — granularité par composantes : fin du « un mot = un item entier »', () => {
  it('« ARNm ARNr ARNt » ne crédite plus les rôles exigés (Q1 : 1/2 composante par item)', () => {
    const n = noterExerciceCalibre('ARNm ARNr ARNt', 1, 1);
    const q1 = n.verdicts.filter((v) => v.id.includes('/Q1/'));
    expect(q1.length).toBe(5);
    for (const v of q1) {
      expect(v.composantesTotal).toBe(2);
      expect(v.composantesDetectees).toBe(1); // l'ARN est nommé, le contexte (hors/pendant synthèse) manque
      expect(v.pointsCredites).toBeCloseTo(v.points / 2, 1); // arrondi 0.01 du crédit
    }
    // L'item RIP (1.25) exige le mécanisme : absent → 0.
    expect(n.verdicts.find((v) => v.id.endsWith('/RIP'))!.pointsCredites).toBe(0);
    expect(n.points).toBeLessThan(n.maxPts);
  });

  it('« RIP » seul = la moitié de l item ; RIP + mécanisme = item entier', () => {
    const seul = noterExerciceCalibre('RIP', 1, 1).verdicts.find((v) => v.id.endsWith('/RIP'))!;
    expect(seul.composantesDetectees).toBe(1);
    expect(seul.pointsCredites).toBeCloseTo(1.25 / 2, 1);

    const complet = noterExerciceCalibre('RIP تكسر الرابطة بين الأدنين وسكر الريبوز فيفقد ARN بنيته', 1, 1)
      .verdicts.find((v) => v.id.endsWith('/RIP'))!;
    expect(complet.composantesDetectees).toBe(2);
    expect(complet.pointsCredites).toBe(1.25);
  });

  it('les composantes sont OU-dans-un-groupe : une seule variante suffit', () => {
    // « خارج فترة تركيب » (formulation Meftah) suffit pour la composante contexte.
    const n = noterExerciceCalibre('خارج فترة تركيب البروتين: ARNr', 1, 1);
    const v = n.verdicts.find((x) => x.id.endsWith('Q1/item1'))!;
    expect(v.composantesDetectees).toBe(2);
    expect(v.pointsCredites).toBe(v.points);
  });
});

describe('R6 — contrôles positifs : les réponses modèle de Meftah', () => {
  // Les visages BAC sont écrits depuis les عناصر الإجابة officiels → ils
  // doivent couvrir ~tout le registre. Avant R6 : 16,05/20 (Ex3 à 5,18/8).
  const MODELES = MEFTA_BAC_EXERCISES.map((ex) => ({
    id: ex.id,
    texte: ex.questions.flatMap((q) => q.writeAr).join('\n'),
    exercice: (ex.id.endsWith('1') ? 1 : ex.id.endsWith('2') ? 2 : 3) as 1 | 2 | 3,
  }));

  it('couverture ≥ 85 % et note ≥ 90 % du max pour chaque réponse modèle', () => {
    for (const m of MODELES) {
      const n = noterExerciceCalibre(m.texte, 1, m.exercice);
      expect(n.couverture, `${m.id} couverture`).toBeGreaterThanOrEqual(0.85);
      expect(n.points, `${m.id} points`).toBeGreaterThanOrEqual(0.9 * n.maxPts);
      expect(n.plafonds, `${m.id} — aucun plafond sur une copie légitime`).toEqual([]);
    }
  });

  it('copie modèle complète ≈ 19-20/20 (avant R6 : 16,05)', () => {
    const copie = noterCopieCalibree(
      MODELES.map((m) => m.texte) as [string, string, string],
      1
    );
    expect(copie.total).toBeGreaterThanOrEqual(18);
    expect(copie.total).toBeLessThanOrEqual(20);
  });
});

describe('P2 — le chemin legacy est SUPPRIMÉ (règle dure : aucune note hors attendus)', () => {
  it('noterDepuisCouverture n existe plus', async () => {
    const mod = await import('./calibrationBac2025');
    expect((mod as unknown as Record<string, unknown>).noterDepuisCouverture).toBeUndefined();
  });
});

describe('compat — uniteDeGroupe (mapping diagnostic verrouillé)', () => {
  it('S1-Ex3 → U5 · S2-Ex3 → U4', () => {
    expect(uniteDeGroupe(1, 3)!.uniteId).toBe(5);
    expect(uniteDeGroupe(2, 3)!.uniteId).toBe(4);
  });
});

// Garde anti-fuite : la couverture exposée vient du registre, pas de la banque.
describe('R6 — traçabilité', () => {
  it('la note expose son registre et ses verdicts (transparence prof)', () => {
    const n = noterExerciceCalibre('تمثل الوثيقة تأثير Mtb. نلاحظ ارتباطه بالمستقبل ومنه يعيق الأدينوزين.', 1, 3);
    expect(n.registre.items.length).toBeGreaterThan(0);
    expect(n.verdicts.length).toBe(n.registre.items.length);
    expect(normalizeAr(n.registre.questionAr).length).toBeGreaterThan(10);
  });
});
