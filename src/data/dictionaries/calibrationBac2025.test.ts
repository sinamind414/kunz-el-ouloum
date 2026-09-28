// calibrationBac2025.test.ts — Verrous de la notation R6 (Pierre 2 : attendus
// obligatoires) + garde du LEGACY (fit linéaire, déprécié hors recherche).
//
// R6 : la note = min(couverture_attendus × maxPts, plafonds d'intégrité) —
// sauf les groupes à ventilation par partie (S1-Ex3) où chaque partie est
// ramenée à son poids officiel avant le plafond (docs/DIAGNOSTIC_EX3.md).
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

// Réserve humaine attendue : Σ des points des items MANUELS, ramenés à l'échelle
// officielle via le ratio poidsPartie (F1+, 2026-09-28). Réimplémentation
// indépendante de la formule moteur — doit rester byte-pour-byte égale.
function reserveManuellePonderee(reg: ReturnType<typeof attendusDeGroupe>): number {
  const pp = reg.poidsPartie;
  const reserve = reg.items
    .filter((i) => !(i.formes.length > 0 || (i.composantes?.length ?? 0) > 0))
    .reduce((s, i) => {
      const p = pp?.partie[i.id];
      const ratio = p && pp && pp.registre[p] > 0 ? pp.officiel[p] / pp.registre[p] : 1;
      return s + i.points * ratio;
    }, 0);
  return Math.round(reserve * 100) / 100;
}

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
    // F3 (2026-09-28) : un item MANUEL (ex. S1-Ex3 schéma) n'est pas
    // créditable automatiquement → points + réserve humaine = barème, et la
    // note finale est PROVISOIRE (noteFinale = null) tant que le correcteur
    // n'a pas arbitré. Les autres exercices restent intégralement auto.
    for (const sujet of [1, 2] as const) {
      for (const exercice of [1, 2, 3] as const) {
        const n = noterExerciceCalibre(reponseExhaustive(sujet, exercice), sujet, exercice);
        expect(n.couverture, `S${sujet}-Ex${exercice}`).toBe(1);
        expect(n.points + n.pointsManuelsAArbitrer, `S${sujet}-Ex${exercice} points+réserve`).toBe(
          n.maxPts,
        );
        expect(n.points).toBeLessThanOrEqual(n.maxPts);
        expect(n.noteFinale).toBe(n.pointsManuelsAArbitrer > 0 ? null : n.points);
        expect(n.plafonds).toEqual([]); // c'est de la prose officielle
      }
    }
  });

  it('points = ventilation par partie (S1-Ex3) ou couverture × maxPts ailleurs (formule R6)', () => {
    for (const sujet of [1, 2] as const) {
      for (const exercice of [1, 2, 3] as const) {
        const n = noterExerciceCalibre(reponseExhaustive(sujet, exercice).slice(0, 400), sujet, exercice);
        const borne = Math.min(...(n.plafonds.length ? n.plafonds.map((p) => p.plafondPct) : [1])) * n.maxPts;
        expect(n.points).toBeLessThanOrEqual(Math.round(borne * 100) / 100 + 1e-9);
        // Réimplémentation indépendante de la formule moteur.
        const pp = n.registre.poidsPartie;
        let formule = n.couverture * n.maxPts;
        if (pp) {
          const partCredit: Record<number, number> = { 1: 0, 2: 0, 3: 0 };
          for (const v of n.verdicts) {
            const p = pp.partie[v.id];
            if (p === undefined) continue;
            partCredit[p] += v.pointsCredites;
          }
          formule = 0;
          for (const p of [1, 2, 3] as const) {
            if (pp.registre[p] > 0) formule += partCredit[p] * (pp.officiel[p] / pp.registre[p]);
          }
          formule = Math.min(n.maxPts, Math.max(0, formule));
        }
        expect(n.points, `S${sujet}-Ex${exercice}`).toBe(Math.round(Math.min(formule, borne) * 100) / 100);
      }
    }
  });

  it('S1-Ex3 : la ventilation par partie plafonne la Partie 1 (facile) à 1,5/8', () => {
    // Réponse ne contenant QUE les items de la Partie 1 (formes officielles).
    const pp = attendusDeGroupe(1, 3).poidsPartie!;
    const itemsP1 = attendusDeGroupe(1, 3).items.filter((i) => pp.partie[i.id] === 1);
    const reponseP1 = itemsP1.map((i) => i.texteAr).join(' ');
    const n = noterExerciceCalibre(reponseP1, 1, 3);
    // Avant E : 3,5 pts crédités → 3,5/8. Maintenant : ramené au poids officiel 1,5/8.
    expect(n.pointsAttendusCredites).toBe(3.5);
    expect(n.points).toBe(1.5);
  });

  it('S1-Ex3 : la map poidsPartie couvre TOUS les items auto du registre', () => {
    const reg = attendusDeGroupe(1, 3);
    const pp = reg.poidsPartie!;
    for (const it of reg.items) {
      const auto = it.points > 0 && (it.formes.length > 0 || (it.composantes?.length ?? 0) > 0);
      if (auto) expect(pp.partie[it.id], `${it.id} non mappé`).toBeDefined();
    }
    const sommes = { registre: [1, 2, 3].reduce((s, p) => s + pp.registre[p as 1 | 2 | 3], 0),
                     officiel: [1, 2, 3].reduce((s, p) => s + pp.officiel[p as 1 | 2 | 3], 0) };
    expect(sommes.registre).toBe(reg.maxPts);
    expect(sommes.officiel).toBe(reg.maxPts);
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
    // F3 : S1-Ex3 garde 1,0 pt en réserve humaine (schéma) → total auto 19/20,
    // le 20/20 n'est atteint qu'après arbitrage humain (noteFinale provisoire).
    const copie = noterCopieCalibree([reponseExhaustive(1, 1), reponseExhaustive(1, 2), reponseExhaustive(1, 3)], 1);
    expect(copie.total).toBe(19);
    expect(copie.total).toBeLessThanOrEqual(20);
  });
});

describe('F1 — points acquis vs réserve manuelle (garder l’échelle officielle)', () => {
  it('aucun item manuel invisible : verdicts = items du registre (6 groupes)', () => {
    for (const sujet of [1, 2] as const) {
      for (const exercice of [1, 2, 3] as const) {
        const reg = attendusDeGroupe(sujet, exercice);
        const n = noterExerciceCalibre(reponseExhaustive(sujet, exercice), sujet, exercice);
        expect(n.verdicts, `S${sujet}-Ex${exercice}`).toHaveLength(reg.items.length);
      }
    }
  });

  it('pointsAutoAcquis = points · réserve = Σ items non auto · noteFinale cohérente', () => {
    for (const sujet of [1, 2] as const) {
      for (const exercice of [1, 2, 3] as const) {
        const reg = attendusDeGroupe(sujet, exercice);
        const n = noterExerciceCalibre(reponseExhaustive(sujet, exercice), sujet, exercice);
        expect(n.pointsAutoAcquis).toBe(n.points);
        expect(n.pointsManuelsAArbitrer).toBe(reserveManuellePonderee(reg));
        expect(n.noteFinale).toBe(n.pointsManuelsAArbitrer > 0 ? null : n.points);
      }
    }
  });

  it('garde-fou : pointsAutoAcquis + pointsManuelsAArbitrer ≤ maxPts (jamais plus que l’officiel)', () => {
    for (const sujet of [1, 2] as const) {
      for (const exercice of [1, 2, 3] as const) {
        const n = noterExerciceCalibre(reponseExhaustive(sujet, exercice), sujet, exercice);
        expect(
          n.pointsAutoAcquis + n.pointsManuelsAArbitrer,
          `S${sujet}-Ex${exercice}`,
        ).toBeLessThanOrEqual(n.maxPts + 1e-9);
      }
    }
  });

  it('les items manuels ne sont JAMAIS comptés comme zéro ni redistribués', () => {
    // Copie vide : la réserve manuelle reste INTACTE (égale à Σ items non auto,
    // sur l'échelle officielle), les points auto tombent à 0 — pas de
    // renormalisation de la part manuelle.
    for (const sujet of [1, 2] as const) {
      for (const exercice of [1, 2, 3] as const) {
        const reg = attendusDeGroupe(sujet, exercice);
        const n = noterExerciceCalibre('', sujet, exercice);
        expect(n.pointsManuelsAArbitrer).toBe(reserveManuellePonderee(reg));
        expect(n.pointsAutoAcquis).toBe(0);
      }
    }
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
    // F3 : S1-Ex3 a un item manuel (schéma) → la note auto seule plafonne à
    // 6,36/8 (79,5 %) ; c'est le TOTAL atteignable points+réserve qui vaut le
    // barème. Une copie modèle ne peut pas être pleinement notée par machine.
    for (const m of MODELES) {
      const n = noterExerciceCalibre(m.texte, 1, m.exercice);
      expect(n.couverture, `${m.id} couverture`).toBeGreaterThanOrEqual(0.85);
      expect(n.points + n.pointsManuelsAArbitrer, `${m.id} points+réserve`).toBeGreaterThanOrEqual(
        0.9 * n.maxPts,
      );
      expect(n.plafonds, `${m.id} — aucun plafond sur une copie légitime`).toEqual([]);
    }
  });

  it('copie modèle complète ≈ 19-20/20 (avant R6 : 16,05)', () => {
    // F3 : 19/20 auto + 1,0 en réserve humaine (schéma S1-Ex3).
    const copie = noterCopieCalibree(
      MODELES.map((m) => m.texte) as [string, string, string],
      1
    );
    expect(copie.total).toBeGreaterThanOrEqual(17);
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
