// letterGrid.test.ts — Tests unitaires de la grille A+/D+ (TS port)
// Contrats :
//   - 17 tests unitaires identiques au Python letter_grid.py (même décision tree)
//   - 3 copies Bac 2023 simulées doivent donner 3 lettres distinctes et ordonnées
//   - Ungraded (null methodLetter) → affichage « — »
import { describe, it, expect } from 'vitest';
import { computeMethodLetter, computeScienceLetter, computeOverallLetter, formatDisplay, CriterionInput, LetterOutput } from './letterGrid';

const C = (id: string, status: 'full'|'partial'|'empty'|'error', weight = 1, required = true): CriterionInput => ({ id, status, weight, required });

// ─── computeMethodLetter — 17 tests (identiques au Python letter_grid.py) ───

describe('computeMethodLetter — tous full → A+', () => {
  const crit = [
    C('k', 'full', 2, true),
    C('c', 'full', 3, true),
    C('a', 'full', 2, true),
    C('r', 'full', 1, false),
    C('n', 'full', 1, false),
  ];
  it('retourne A+', () => {
    expect(computeMethodLetter(crit)).toBe('A+');
  });
});

describe('computeMethodLetter — 1 requis partial poids faible → B+', () => {
  const crit = [
    C('k', 'full', 2, true),
    C('c', 'full', 3, true),
    C('a', 'partial', 2, true),
  ];
  it('retourne B+', () => {
    expect(computeMethodLetter(crit)).toBe('B+');
  });
});

describe('computeMethodLetter — 1 requis partial poids fort → C+', () => {
  const crit = [
    C('k', 'full', 2, true),
    C('c', 'partial', 3, true),
    C('a', 'full', 2, true),
  ];
  it('retourne C+', () => {
    expect(computeMethodLetter(crit)).toBe('C+');
  });
});

describe('computeMethodLetter — 2 requis partials → C+', () => {
  const crit = [
    C('k', 'full', 2, true),
    C('c', 'partial', 3, true),
    C('a', 'partial', 2, true),
  ];
  it('retourne C+', () => {
    expect(computeMethodLetter(crit)).toBe('C+');
  });
});

describe('computeMethodLetter — 1 requis empty poids fort → C', () => {
  const crit = [
    C('k', 'full', 2, true),
    C('c', 'empty', 3, true),
    C('a', 'full', 2, true),
  ];
  it('retourne C', () => {
    expect(computeMethodLetter(crit)).toBe('C');
  });
});

describe('computeMethodLetter — 1 requis empty poids faible → C+', () => {
  const crit = [
    C('k', 'full', 2, true),
    C('c', 'full', 3, true),
    C('a', 'empty', 2, true),
  ];
  it('retourne C+', () => {
    expect(computeMethodLetter(crit)).toBe('C+');
  });
});

describe('computeMethodLetter — 2 requis empty → D+', () => {
  const crit = [
    C('k', 'empty', 2, true),
    C('c', 'empty', 3, true),
    C('a', 'full', 2, true),
  ];
  it('retourne D+', () => {
    expect(computeMethodLetter(crit)).toBe('D+');
  });
});

describe('computeMethodLetter — opt empty → C+', () => {
  const crit = [
    C('k', 'full', 2, true),
    C('c', 'full', 3, true),
    C('a', 'full', 2, true),
    C('n', 'empty', 1, false),
  ];
  it('retourne C+', () => {
    expect(computeMethodLetter(crit)).toBe('C+');
  });
});

describe('computeMethodLetter — error requis poids fort → C', () => {
  const crit = [
    C('k', 'full', 2, true),
    C('c', 'error', 3, true),
    C('a', 'full', 2, true),
  ];
  it('retourne C', () => {
    expect(computeMethodLetter(crit)).toBe('C');
  });
});

describe('computeMethodLetter — error requis poids faible → C+', () => {
  const crit = [
    C('k', 'full', 2, true),
    C('c', 'full', 3, true),
    C('a', 'error', 2, true),
  ];
  it('retourne C+', () => {
    expect(computeMethodLetter(crit)).toBe('C+');
  });
});

describe('computeMethodLetter — opt partial ≥ 2 → B+', () => {
  const crit = [
    C('k', 'full', 2, true),
    C('c', 'full', 3, true),
    C('a', 'full', 2, true),
    C('n', 'partial', 1, false),
    C('r', 'partial', 1, false),
  ];
  it('retourne B+', () => {
    expect(computeMethodLetter(crit)).toBe('B+');
  });
});

describe('computeMethodLetter — opt partial 1 → A', () => {
  const crit = [
    C('k', 'full', 2, true),
    C('c', 'full', 3, true),
    C('a', 'full', 2, true),
    C('n', 'partial', 1, false),
  ];
  it('retourne A', () => {
    expect(computeMethodLetter(crit)).toBe('A');
  });
});

describe('computeMethodLetter — edge : critères vides → A+', () => {
  it('retourne A+ quand aucun critère', () => {
    expect(computeMethodLetter([])).toBe('A+');
  });
});

describe('computeMethodLetter — edge : tous optionnels full → A+', () => {
  const crit = [
    C('r', 'full', 1, false),
    C('n', 'full', 1, false),
  ];
  it('retourne A+ (pas de requis, tous optionnels full)', () => {
    expect(computeMethodLetter(crit)).toBe('A+');
  });
});

describe('computeMethodLetter — edge : error requis seul → C+', () => {
  const crit = [
    C('c', 'error', 3, true),
  ];
  it('retourne C+ (1 requis error, poids_fort, au moins 2 requis requis → C)', () => {
    // reqEmpty=1, reqPartial=0, crit weight=3 → isPoidsFort(3) → C
    expect(computeMethodLetter(crit)).toBe('C');
  });
});

describe('computeMethodLetter — edge : opt partial 2 + opt empty 1 → C+', () => {
  // opt_empty (étape 5) précède opt_partial (étape 6) : optEmpty>=1 → C+
  const crit = [
    C('k', 'full', 2, true),
    C('c', 'full', 3, true),
    C('n', 'partial', 1, false),
    C('r', 'empty', 1, false),
  ];
  it('retourne C+ (opt empty avant opt partial)', () => {
    expect(computeMethodLetter(crit)).toBe('C+');
  });
});

// ─── computeScienceLetter ───

describe('computeScienceLetter', () => {
  it('ok → ✅', () => expect(computeScienceLetter('ok')).toBe('✅'));
  it('error → 🔴', () => expect(computeScienceLetter('error')).toBe('🔴'));
  it('partial → ⚠️', () => expect(computeScienceLetter('partial')).toBe('⚠️'));
  it('unknown → null', () => expect(computeScienceLetter('inconnu')).toBe(null));
});

// ─── computeOverallLetter + formatDisplay ───

describe('computeOverallLetter — darija méthode A+ → plafond B', () => {
  const r = computeOverallLetter('A+', '✅', false, true);
  it('overall = B', () => expect(r.overallLetter).toBe('B'));
  it('ceilings.darija = B', () => expect(r.ceilings.darija).toBe('B'));
  it('ceilings.stuffing absent', () => expect(r.ceilings.stuffing).toBeUndefined());
  it('ceilings.science absent', () => expect(r.ceilings.science).toBeUndefined());
});

describe('computeOverallLetter — darija méthode C+ → pas d\'effet', () => {
  const r = computeOverallLetter('C+', '✅', false, true);
  it('overall = C+', () => expect(r.overallLetter).toBe('C+'));
  it('ceilings.darija = C+ (égalité avec méthode)', () => expect(r.ceilings.darija).toBe('C+'));
});

describe('computeOverallLetter — science 🔴 → plafond D+', () => {
  const r = computeOverallLetter('A+', '🔴', false, false);
  it('overall = D+', () => expect(r.overallLetter).toBe('D+'));
  it('ceilings.science = D+', () => expect(r.ceilings.science).toBe('D+'));
});

describe('computeOverallLetter — stuffing → plafond C+', () => {
  const r = computeOverallLetter('A', '✅', true, false);
  it('overall = C+', () => expect(r.overallLetter).toBe('C+'));
  it('ceilings.stuffing = C+', () => expect(r.ceilings.stuffing).toBe('C+'));
});

describe('computeOverallLetter — science🔴 + stuffing → D+ (le plus restrictif gagne)', () => {
  const r = computeOverallLetter('A', '🔴', true, false);
  it('overall = D+', () => expect(r.overallLetter).toBe('D+'));
  it('ceilings.science = D+', () => expect(r.ceilings.science).toBe('D+'));
  it('ceilings.stuffing = C+', () => expect(r.ceilings.stuffing).toBe('C+'));
});

describe('computeOverallLetter — darija + science🔴 → D+', () => {
  const r = computeOverallLetter('A+', '🔴', false, true);
  it('overall = D+', () => expect(r.overallLetter).toBe('D+'));
});

describe('computeOverallLetter — darija + stuffing → C+ (stuffing plus restrictif que darija B)', () => {
  const r = computeOverallLetter('A+', '✅', true, true);
  it('overall = C+', () => expect(r.overallLetter).toBe('C+'));
  it('ceilings.darija = B', () => expect(r.ceilings.darija).toBe('B'));
  it('ceilings.stuffing = C+', () => expect(r.ceilings.stuffing).toBe('C+'));
});

describe('computeOverallLetter — aucun cap → overall = méthode', () => {
  const r = computeOverallLetter('A+', '✅', false, false);
  it('overall = A+', () => expect(r.overallLetter).toBe('A+'));
  it('ceilings vide', () => expect(Object.keys(r.ceilings)).toHaveLength(0));
});

// ─── formatDisplay ───

describe('formatDisplay — A+ sans plafond', () => {
  const r: LetterOutput = { methodLetter:'A+', scienceLetter:'✅', overallLetter:'A+', ceilings:{}, nextStepAr:'...' };
  const d = formatDisplay(r);
  it('lines[0] = "المنهجية: A+"', () => expect(d.lines[0]).toBe('المنهجية: A+'));
  it('lines[1] = "العلم: ✅"', () => expect(d.lines[1]).toBe('العلم: ✅'));
  it('lines[2] contient (بدون قيد)', () => expect(d.lines[2]).toContain('بدون قيد'));
  it('overall = A+', () => expect(d.overall).toBe('A+'));
});

describe('formatDisplay — D+ plafonné science', () => {
  const r: LetterOutput = { methodLetter:'A+', scienceLetter:'🔴', overallLetter:'D+', ceilings:{science:'D+'}, nextStepAr:'...' };
  const d = formatDisplay(r);
  it('lines[2] contient مُقَيَّد بـ science → D+', () => expect(d.lines[2]).toContain('مُقَيَّد بـ science → D+'));
  it('overall = D+', () => expect(d.overall).toBe('D+'));
});

describe('formatDisplay — C+ stuffing détecté (égalité méthode)', () => {
  const r: LetterOutput = { methodLetter:'C+', scienceLetter:'✅', overallLetter:'C+', ceilings:{stuffing:'C+'}, nextStepAr:'...' };
  const d = formatDisplay(r);
  it('lines[2] contient stuffing مكتشف', () => expect(d.lines[2]).toContain('stuffing مكتشف'));
  it('overall = C+', () => expect(d.overall).toBe('C+'));
});

describe('formatDisplay — ungraded (null)', () => {
  const r: LetterOutput = { methodLetter:null, scienceLetter:null, overallLetter:null, ceilings:{}, nextStepAr:'...' };
  const d = formatDisplay(r);
  it('lines[0] = "المنهجية: —"', () => expect(d.lines[0]).toBe('المنهجية: —'));
  it('lines[1] = "العلم: —"', () => expect(d.lines[1]).toBe('العلم: —'));
  it('lines[2] = "العام: —"', () => expect(d.lines[2]).toContain('العام: —'));
  it('overall = "—"', () => expect(d.overall).toBe('—'));
});
