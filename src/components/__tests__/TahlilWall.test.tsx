// src/components/__tests__/TahlilWall.test.tsx — harnais RTL du mur حلّل (couche 1 Trainer).
// Scénarios : set complet → production contrainte → gate v2 ; anti-heuristique ;
// marqueur causal refusé à la saisie ; cooldown ; remédiation après 3 échecs.
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import TahlilWall from '../TahlilWall';
import { evaluateWallSet, WallAttemptDetail, resetWallGate, getWallGateStatus, recordWallSet, completeWallRemediation } from '../../data/v3Progress';
import { WALL_SERIES_A, lintWallBank } from '../../data/tahlilWallBank';
import { detectDisplacedCausal, detectHedging, detectAnalysisPattern } from '../../data/meftahLaw';

beforeAll(() => {
  Element.prototype.scrollIntoView = () => {};
});

afterEach(cleanup);
beforeEach(() => {
  window.localStorage.clear();
  resetWallGate();
});

/** Joue un set complet en répondant correctement (via les labels du pool). */
async function playPerfectSet(user: ReturnType<typeof userEvent.setup>) {
  for (let i = 0; i < 12; i++) {
    await waitFor(() => expect(screen.getByTestId(/^wall-item-\d+$/)).toBeTruthy());
    const itemEl = screen.getByTestId(/^wall-item-\d+$/);
    const sentence = itemEl.textContent || '';
    const item = WALL_SERIES_A.find((w) => w.sentence === sentence);
    expect(item).toBeDefined();
    const correct = item!.label === 'tahlil' ? 'tahlil' : 'tafsir';
    await user.click(correct === 'tahlil' ? screen.getByTestId('wall-btn-tahlil') : screen.getByTestId('wall-btn-tafir'));
    await waitFor(() => expect(screen.getByTestId('wall-feedback')).toBeTruthy());
    await user.click(screen.getByTestId('wall-next'));
  }
  // Phase production
  await waitFor(() => expect(screen.getByTestId('wall-produce')).toBeTruthy());
  await user.type(screen.getByTestId('prod-phenomenon'), 'تركيز NE');
  await user.selectOptions(screen.getByTestId('prod-direction'), 'نقص');
  await user.type(screen.getByTestId('prod-from'), '8');
  await user.type(screen.getByTestId('prod-to'), '2');
  await user.type(screen.getByTestId('prod-cause'), 'وهذا راجع إلى ارتباط Ado بالمستقبل A1R');
  await user.click(screen.getByTestId('wall-finish'));
}

describe('TahlilWall — pool & loi (unit)', () => {
  it('le pool passe le linter anti-heuristique (audits 1-2)', () => {
    expect(lintWallBank(WALL_SERIES_A)).toEqual([]);
    expect(WALL_SERIES_A.length).toBeGreaterThanOrEqual(24);
  });

  it('l\'heuristique "chiffre→تحليل" ÉCHOUE : les items à chiffres ne sont pas tous tahlil', () => {
    const withDigits = WALL_SERIES_A.filter((i) => /[0-9٠-٩]/.test(i.sentence));
    const heuristicallyTahlil = withDigits.filter((i) => i.label === 'tahlil').length;
    // Si tous les items à chiffres étaient tahlil, l'heuristique suffirait — interdit.
    expect(heuristicallyTahlil).toBeLessThan(withDigits.length);
  });

  it('la loi détecte les clitiques, hamza, diacritiques — et épargne تبيّن/نلاحظ', () => {
    expect(detectDisplacedCausal('ولأن الحرارة مرتفعة يتخرب الإنزيم')?.id).toBe('sabab');
    expect(detectDisplacedCausal('مما يدل على وجود البيرنويدة')?.id).toBe('dalal');
    expect(detectDisplacedCausal('وهذا راجع الى طبيعة الغشاء')?.id).toBe('rajac');
    expect(detectDisplacedCausal('يـفـسَّر بـ خاصية النفاذية')?.id).toBe('tafsir-verb');
    expect(detectDisplacedCausal('تبين الوثيقة أن الارتباط ينعدم عند 20 pmol/L')).toBeNull();
    expect(detectDisplacedCausal('نلاحظ استقرار النمو عند 90%')).toBeNull();
    expect(detectHedging('ربما يرتبط Mtb بالمستقبل')?.id).toBe('shak');
    expect(detectAnalysisPattern('كلما زاد Ado نقص النشاط')?.id).toBe('covariation');
    expect(detectAnalysisPattern('في الشاهد تنعدم بينما تظهر في المعالجة')?.id).toBe('comparaison');
  });
});

describe('TahlilWall — gate v2 (unit, règle pure)', () => {
  const att = (family: string, cue: string, correct: boolean): WallAttemptDetail => ({
    itemId: `x-${family}`, family, cue, chosen: correct ? 'tahlil' : 'tafsir', correct,
  });

  it('2 fautes simples sur F1 = PASSE (≤ 2 fautes hors familles preuve)', () => {
    const set = [
      att('F1', 'explicit', true), att('F1', 'explicit', false),
      att('F3', 'none', true), att('F4', 'none', true), att('F5', 'misleading', true),
      att('F4', 'none', true), att('F5', 'misleading', true), att('F6', 'none', true),
      att('F1', 'explicit', false), att('F2', 'explicit', true), att('F3', 'none', true), att('F6', 'none', true),
    ];
    const r = evaluateWallSet(set);
    expect(r.setPassed).toBe(true);
    expect(r.errors).toBe(2);
  });

  it('1 SEULE faute sur F4 ou F5 = ÉCHOUE (les familles qui prouvent)', () => {
    const set = Array.from({ length: 12 }, (_, i) =>
      i === 5 ? att('F4', 'none', false) : att(`F${(i % 6) + 1}`, 'none', true)
    );
    const r = evaluateWallSet(set);
    expect(r.setPassed).toBe(false);
    expect(r.errorsOnProofFamilies).toBe(1);
  });

  it('3+ items non-explicit exigés — tirage 100% explicit échoue (anti-heuristique)', () => {
    const allExplicit = Array.from({ length: 12 }, () => att('F1', 'explicit', true));
    expect(evaluateWallSet(allExplicit).setPassed).toBe(false);
    const mixed = Array.from({ length: 12 }, (_, i) =>
      att(i < 8 ? 'F4' : 'F1', i < 8 ? 'none' : 'explicit', true)
    );
    expect(evaluateWallSet(mixed).setPassed).toBe(true);
  });

  it('cooldown ≥ 1h après échec ; remédiation après 3 échecs ; reset clean', () => {
    const fail = Array.from({ length: 12 }, () => att('F4', 'none', false));
    const t0 = 1_000_000;
    let st = recordWallSet(fail, t0);
    expect(st.passed).toBe(false);
    expect(st.retryAllowed).toBe(false);
    expect(st.retryInMs).toBeGreaterThan(0);
    st = recordWallSet(fail, t0 + 30 * 60 * 1000);
    expect(st.attempts).toBe(2);
    st = recordWallSet(fail, t0 + 2 * 60 * 60 * 1000);
    expect(st.attempts).toBe(3);
    expect(st.remediation).toBe(true);
    completeWallRemediation();
    const after = getWallGateStatus(t0 + 3 * 60 * 60 * 1000);
    expect(after.remediation).toBe(false);
    expect(after.attempts).toBe(0);
  });
});

describe('TahlilWall — RTL (le scénario promis)', () => {
  it('set parfait 12/12 + production contrainte valide → gate ouvert', async () => {
    const user = userEvent.setup();
    render(<TahlilWall />);

    // Interdits AVANT la production : feedback rouges sur 2 erreurs volontaires F1 (tolérées)
    // → on joue volontairement 2 items F1 faux puis le reste correct : le gate doit PASSER.
    let errorsLeft = 2;
    for (let i = 0; i < 12; i++) {
      await waitFor(() => expect(screen.getByTestId(/^wall-item-\d+$/)).toBeTruthy());
      const sentence = screen.getByTestId(/^wall-item-\d+$/).textContent || '';
      const item = WALL_SERIES_A.find((w) => w.sentence === sentence)!;
      let answer: 'tahlil' | 'tafsir' = item.label;
      if (item.family === 'F1' && errorsLeft > 0) {
        answer = item.label === 'tahlil' ? 'tafsir' : 'tahlil'; // erreur tolérée sur famille facile
        errorsLeft--;
      }
      await user.click(answer === 'tahlil' ? screen.getByTestId('wall-btn-tahlil') : screen.getByTestId('wall-btn-tafir'));
      await waitFor(() => expect(screen.getByTestId('wall-feedback')).toBeTruthy());
      await user.click(screen.getByTestId('wall-next'));
    }

    // Production contrainte : le champ تفسير est GRISÉ tant que l'analyse est vide
    await waitFor(() => expect(screen.getByTestId('wall-produce')).toBeTruthy());
    expect((screen.getByTestId('prod-cause') as HTMLTextAreaElement).disabled).toBe(true);
    await user.type(screen.getByTestId('prod-phenomenon'), 'تركيز NE');
    await user.selectOptions(screen.getByTestId('prod-direction'), 'نقص');
    await user.type(screen.getByTestId('prod-from'), '8');
    await user.type(screen.getByTestId('prod-to'), '2');
    await waitFor(() => expect((screen.getByTestId('prod-cause') as HTMLTextAreaElement).disabled).toBe(false));
    await user.type(screen.getByTestId('prod-cause'), 'وهذا راجع إلى ارتباط Ado بالمستقبل A1R');
    await user.click(screen.getByTestId('wall-finish'));

    await waitFor(() => expect(screen.getByTestId('wall-passed')).toBeTruthy());
    expect(getWallGateStatus().passed).toBe(true);
  }, 90000);

  it('marqueur causal SAISI dans le champ analyse → refus à la saisie + champ تفسير re-bloqué', async () => {
    const user = userEvent.setup();
    render(<TahlilWall />);
    // Répondre 12 correctement pour atteindre la production
    for (let i = 0; i < 12; i++) {
      await waitFor(() => expect(screen.getByTestId(/^wall-item-\d+$/)).toBeTruthy());
      const sentence = screen.getByTestId(/^wall-item-\d+$/).textContent || '';
      const item = WALL_SERIES_A.find((w) => w.sentence === sentence)!;
      await user.click(item.label === 'tahlil' ? screen.getByTestId('wall-btn-tahlil') : screen.getByTestId('wall-btn-tafir'));
      await waitFor(() => expect(screen.getByTestId('wall-feedback')).toBeTruthy());
      await user.click(screen.getByTestId('wall-next'));
    }
    await waitFor(() => expect(screen.getByTestId('wall-produce')).toBeTruthy());

    // Analyse volontairement polluée par un marqueur causal
    await user.type(screen.getByTestId('prod-phenomenon'), 'تركيز NE بسبب ارتباط Ado');
    await user.selectOptions(screen.getByTestId('prod-direction'), 'نقص');
    await user.type(screen.getByTestId('prod-from'), '8');
    await user.type(screen.getByTestId('prod-to'), '2');

    await waitFor(() => {
      expect(screen.getByTestId('prod-displaced-warning')).toBeTruthy();
      expect(screen.getByTestId('prod-displaced-warning').textContent).toContain('كلمة تفسير');
    });
    expect((screen.getByTestId('prod-cause') as HTMLTextAreaElement).disabled).toBe(true);
    expect((screen.getByTestId('wall-finish') as HTMLButtonElement).disabled).toBe(true);
  }, 90000);
});
