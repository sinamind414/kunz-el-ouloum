// attendusBac2025.test.ts — Verrous du REGISTRE des attendus obligatoires (Pierre 2).
//
// Le registre est la source unique du dénominateur de la note (R6). Ces tests
// garantissent : les sommes = les barèmes officiels (5/7/8), la parité avec le
// build prouvé fidèle (Ex1), la complétude des formes de reconnaissance, et la
// traçabilité des sources.

import { describe, expect, it } from 'vitest';
import {
  ATTENDUS_BAC2025,
  attendusDeGroupe,
  itemsDepuisBuild,
  plafondAutoDe,
  type AttendusExercice,
} from './attendusBac2025';
import { ATTENDUS_BAREME } from './dictionnaireCorrecteur';
import { noterExerciceCalibre } from './calibrationBac2025';
import { normalizeAr } from '../../lib/validation/normalizeAr';

const GROUPES: AttendusExercice[] = (
  [1, 2] as const
).flatMap((s) => ([1, 2, 3] as const).map((e) => attendusDeGroupe(s, e)));

// Dérogations sourcées au corrigé ministériel (somme جزئيات > enveloppe) —
// vide sauf preuve verbatim. S2-Ex1 2025 : l'équation officielle vaut 0.25×5=1.25
// (« عناصر من مجموع الخمسة المسطرة في المعادلة؛ يُمنح 0.25 نقطة لكل عنصر ») et non
// 0.75 : Σ = 5.5. L'excédent est absorbé par le plafond maxPts (couverture ≤ 1),
// exactement comme le correcteur officiel qui plafonne l'exercice à 5.
const DEPASSEMENTS_SOURCES: Record<string, number> = { '2-1': 0.5 };

describe('registre — sommes = barèmes officiels', () => {
  it('chaque groupe somme à son barème (5/7/8), dérogations sourcées incluses', () => {
    for (const g of GROUPES) {
      const somme = Math.round(g.items.reduce((a, i) => a + i.points, 0) * 100) / 100;
      const depassement = DEPASSEMENTS_SOURCES[`${g.sujet}-${g.exercice}`] ?? 0;
      expect(somme, `S${g.sujet}-Ex${g.exercice}`).toBe(g.maxPts + depassement);
    }
    expect(GROUPES.map((g) => g.maxPts)).toEqual([5, 7, 8, 5, 7, 8]);
  });

  it('aucun item à points sans forme NI composantes (sinon manuel — build only)', () => {
    // F3 (2026-09-28) : tolérance étendue aux items MANUELS encodés à la main et
    // SOURCÉS — un critère exigeant une interprétation humaine (ex. un schéma =
    // structure, pas des mots-clés) reste manuel par principe F2. La liste
    // ci-dessous est close et chaque entrée porte sa preuve dans le registre.
    const MANUELS_SOURCES: Set<string> = new Set(['1-3/corr-2025-25']); // schéma S1-Ex3
    for (const g of GROUPES) {
      for (const it of g.items) {
        const aComposantes = (it.composantes?.length ?? 0) > 0;
        if (it.points > 0 && it.formes.length === 0 && !aComposantes) {
          // Toléré UNIQUEMENT pour les items build (remontés au prof) ou les
          // items manuels sourcés — tout autre item encodé à la main doit avoir
          // ses formes.
          if (!MANUELS_SOURCES.has(`${g.sujet}-${g.exercice}/${it.id}`)) {
            expect(it.source, `${g.sujet}/${it.id}`).toBe('build');
          }
        }
        for (const f of it.formes) {
          expect(normalizeAr(f).length, `forme vide: ${it.id}`).toBeGreaterThan(0);
        }
        for (const comp of it.composantes ?? []) {
          expect(comp.length, `composante vide: ${it.id}`).toBeGreaterThan(0);
          for (const f of comp) expect(normalizeAr(f).length, `forme de composante vide: ${it.id}`).toBeGreaterThan(0);
        }
      }
    }
  });

  it('P5 — les items à rôles du S1-Ex1 portent leurs composantes (contexte + ARN)', () => {
    const g = attendusDeGroupe(1, 1);
    for (const it of g.items.filter((x) => x.id.includes('/Q1/'))) {
      expect(it.composantes?.length, `${it.id} : 2 composantes (contexte, ARN)`).toBe(2);
    }
    // Fin du « un mot = un item entier » : l'item RIP exige le mécanisme (adénine/ribose).
    const rip = g.items.find((x) => x.id.endsWith('/RIP'))!;
    expect(rip.composantes?.length).toBe(2);
    expect(rip.composantes![1].some((f) => ['ادنين', 'adenine'].includes(f))).toBe(true);
    // Pi (S2-Ex1) : la forme ajoutée à la main (équation officielle « +2Pi+ »).
    const pi = attendusDeGroupe(2, 1).items.find((x) => x.id.endsWith('Q1/item3'))!;
    expect(pi.formes).toContain('pi');
  });

  it('la Σ auto (plafond) est ≥ 70 % du barème sur les 6 groupes', () => {
    // Sinon la pré-note ne peut plus atteindre le max — trop d'items manuels.
    for (const g of GROUPES) {
      expect(plafondAutoDe(g), `S${g.sujet}-Ex${g.exercice}`).toBeGreaterThanOrEqual(0.7 * g.maxPts);
    }
  });

  it('chaque groupe porte son énoncé (détection de perroquet active par défaut)', () => {
    for (const g of GROUPES) expect(g.questionAr.length).toBeGreaterThan(20);
  });
});

describe('registre ↔ build (parité sur les Ex1 — sources verrouillées)', () => {
  it('S1-Ex1 : les items du pont = les items du build, points identiques (1.25 + 3.75)', () => {
    const g = attendusDeGroupe(1, 1);
    const buildKeys = Object.keys(ATTENDUS_BAREME).filter((k) => k.startsWith('bac2025_S1/S1-Ex1/'));
    expect(g.items.map((i) => i.id)).toEqual(buildKeys);
    const q1 = g.items.filter((i) => i.id.includes('/Q1/')).reduce((s, i) => s + i.points, 0);
    const q2 = g.items.filter((i) => i.id.includes('/Q2/')).reduce((s, i) => s + i.points, 0);
    expect(Math.round(q1 * 100) / 100).toBe(1.25); // 0.25 × 5 — corrigé officiel p.1
    expect(Math.round(q2 * 100) / 100).toBe(3.75); // RIP 1.25 — corrigé officiel
  });

  it('S2-Ex1 : pont complet sur le build (glycolyse)', () => {
    const g = attendusDeGroupe(2, 1);
    const buildKeys = Object.keys(ATTENDUS_BAREME).filter((k) => k.startsWith('bac2025_S2/S2-Ex1/'));
    expect(g.items.map((i) => i.id)).toEqual(buildKeys);
  });

  it('les items encodés à la main portent la source corrigé-officiel-2025', () => {
    for (const [s, e] of [[1, 2], [1, 3], [2, 2], [2, 3]] as const) {
      const g = ATTENDUS_BAC2025[s][e];
      expect(g.items.every((i) => i.source === 'corrige-officiel-2025'), `S${s}-Ex${e}`).toBe(true);
    }
  });
});


describe('P2g — équation glycolyse S2-Ex1 (corrigé officiel 0.25×5) + isolement d’année des overlays', () => {
  const verdictEquation = (reponse: string) => {
    const n = noterExerciceCalibre(reponse, 2, 1);
    const v = n.verdicts.find((x) => x.id.endsWith('Q2/equation'))!;
    return v.pointsCredites;
  };
  const PLEINE = 'المعادلة الاجمالية: C6H12O6 + 2ADP + 2Pi + 2NAD+ ← 2(C3H4O3) + 2ATP + 2NADH,H+';

  it('équation complète → 1.25 pt (5 éléments × 0.25, valeur officielle)', () => {
    expect(verdictEquation(PLEINE)).toBe(1.25);
  });

  it('équation à 3 éléments sur 5 → 0.75 pt (crédit proportionnel 0.25/élément)', () => {
    expect(verdictEquation('C6H12O6 + 2ADP + 2Pi ← 2 pyruvates + 2ATP')).toBe(0.75);
  });

  it('garde «nad» ≠ «nadh» : écrire NADH seul ne crédite pas la case NAD+ (4/5 → 1.0)', () => {
    expect(verdictEquation('C6H12O6 + 2ADP + 2Pi + 2NADH,H+ ← 2 pyruvates + 2ATP')).toBe(1);
  });

  it('Σ S2-Ex1 = 5.5 (débordement officiel) MAIS plafond note = maxPts 5', () => {
    const g = attendusDeGroupe(2, 1);
    expect(plafondAutoDe(g)).toBe(5.5);
    expect(g.maxPts).toBe(5);
  });

  it('isolement d’année : les formes/composantes 2025 ne fuient plus sur 2023/2024', () => {
    // Bug P2g : la lookup endsWithout year pushed « pi/فوسفات » sur l’item ARNt 2024
    // et les composantes ARN de 2025 sur les items Q1 2023/2024.
    const i3_2024 = itemsDepuisBuild('bac2024_S2/S2-Ex1/').find((x) => x.id.endsWith('Q1/item3'))!;
    expect(i3_2024.texteAr).toContain('ARNt');
    expect(i3_2024.formes).not.toContain('pi');
    expect(i3_2024.formes).not.toContain('فوسفات');
    const i3_2023 = itemsDepuisBuild('bac2023_S2/S2-Ex1/').find((x) => x.id.endsWith('Q1/item3'))!;
    expect(i3_2023.formes).not.toContain('pi');
    for (const annee of ['bac2023_S1', 'bac2024_S1'] as const) {
      for (const it of itemsDepuisBuild(`${annee}/S1-Ex1/`).filter((x) => x.id.includes('/Q1/'))) {
        expect(it.composantes?.length ?? 0, `${it.id} : zéro composante 2025`).toBe(0);
      }
    }
    // Les items 2025 gardent leurs composantes (non-régression P5).
    for (const it of attendusDeGroupe(1, 1).items.filter((x) => x.id.includes('/Q1/'))) {
      expect(it.composantes?.length, `${it.id}`).toBe(2);
    }
  });
});

describe('F1 — enveloppe officielle : un seul débordement documenté', () => {
  it('Σ points des items ≤ maxPts partout, sauf S2-Ex1 (overlay P2g 2026-09-19)', () => {
    const debordees: string[] = [];
    for (const sujet of [1, 2] as const) {
      for (const exercice of [1, 2, 3] as const) {
        const g = attendusDeGroupe(sujet, exercice);
        const somme = g.items.reduce((s, i) => s + i.points, 0);
        if (somme > g.maxPts + 1e-9) debordees.push(`S${sujet}-Ex${exercice}: ${somme} > ${g.maxPts}`);
      }
    }
    // S2-Ex1 : corrigé officiel verbatim « 0.25 نقطة لكل عنصر » × 5 = 1.25 pour
    // l'équation ; l'excédent est absorbé par le plafond maxPts (couverture ≤ 1
    // → note ≤ 5). Ce test verrouille qu'AUCUN autre groupe ne déborde — un
    // nouveau débordement doit être conscient et documenté ici.
    expect(debordees).toEqual(['S2-Ex1: 5.5 > 5']);
  });
});

// F3 (2026-09-28) — trous de formes mesurés sur le corpus 40 copies
// (scripts/diagnostiquer-items-manques.ts) : des items auto n'étaient JAMAIS
// crédités (40/40) bien que le correcteur humain valide la formulation produite.
// Verrouille la reconnaissance de ces formes ET l'absence de faux positifs.
describe('F3 — formes effectivement produites par les copies', () => {
  // S1-Ex2 item « الشكل(ج) » (0.5 pt) : « نفوذ » est absent des 40 copies ;
  // 17 copies écrivent « تدخل HCO3⁻ … وخروج CO2 منها » et le prof le crédite.
  const FIG_C = 'ومن الشكل(ج): تدخل HCO3- إلى التيلاكوئيد داخل البيروئيدة وخروج CO2 منها.';
  const FIG_C_EBAUCHE = 'ومن الشكل(ج): تدخل HCO3- إلى التيلاكوئيد داخل البيروئيدة.';
  const SANS_FLUX = 'البيروئيدة مهمة في نمو الطحالب.';

  it('S1-Ex2 الشكل(ج) : les deux flux (HCO3⁻ entrant, CO2 sortant) → 0.5 pt', () => {
    const v = noterExerciceCalibre(FIG_C, 1, 2).verdicts.find((x) => x.texteAr.includes('الشكل(ج)'));
    expect(v?.pointsCredites).toBe(0.5);
  });

  it('S1-Ex2 الشكل(ج) : un seul flux (« ébauché ») → 0.25 pt (crédit proportionnel)', () => {
    const v = noterExerciceCalibre(FIG_C_EBAUCHE, 1, 2).verdicts.find((x) => x.texteAr.includes('الشكل(ج)'));
    expect(v?.pointsCredites).toBe(0.25);
  });

  it('S1-Ex2 الشكل(ج) : la formulation officielle « نفوذ / غير نفوذ » reste reconnue', () => {
    const OFFICIEL =
      'الغشاء البروتيني للبيرنويدة نفوذ لـ HCO3⁻ وRuBP/APG وغير نفوذ لـ CO2 فيُحجز CO2 داخل البيرنويدة.';
    const v = noterExerciceCalibre(OFFICIEL, 1, 2).verdicts.find((x) => x.texteAr.includes('الشكل(ج)'));
    expect(v?.pointsCredites).toBe(0.5);
  });

  it('S1-Ex2 الشكل(ج) : mention de la pyrénoïde sans aucun flux → 0 pt (pas de faux positif)', () => {
    const v = noterExerciceCalibre(SANS_FLUX, 1, 2).verdicts.find((x) => x.texteAr.includes('الشكل(ج)'));
    expect(v?.pointsCredites).toBe(0);
  });

  it('S1-Ex2 : la forme observée ne crédite rien sur les copies qui ne traitent pas fig(C)', () => {
    // eleve_01 (prof 0.5/7) cite la pyrénoïde sans décrire aucun flux : l'item
    // reste à zéro — la similarité de surface ne vaut pas preuve (garde-fou F3).
    const r = noterExerciceCalibre(SANS_FLUX, 1, 2);
    expect(r.points).toBeLessThan(1.5);
  });
});
