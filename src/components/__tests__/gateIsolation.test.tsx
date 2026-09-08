// Update 2026-09-06 (MARQUE §12) — cascade des TROIS PORTES au stade 3 :
//   🚪 existence → 📥 source → ⚙️ mouvement.
// Tant qu'une porte est ouverte, aucune section « avant-choix » (StepBar, critères,
// zone d'écriture) n'est rendue ; chaque porte n'apparaît qu'après la précédente.
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import MethodologyCompilerView from '../MethodologyCompilerView';
import { completePhase0, resetPhase0 } from '../../data/drillBank';

// jsdom ne fournit pas ResizeObserver (utilisé via framer-motion/recharts)
class RO { observe() {} unobserve() {} disconnect() {} }
globalThis.ResizeObserver = globalThis.ResizeObserver ?? RO;
afterEach(() => cleanup());

const STEP_BAR_MARK = /الفعل يطلب الوصف/;      // ligne de justification §8 sous la StepBar
const CRITERIA_MARK = /توجيه قبلي وتأكيد بالإثبات/; // sidebar critères stade 3
const GATE1_MARK = '🚪 البوابة ١ — قفل أصلا؟';
const GATE2_MARK = '📥 البوابة ٢ — من أين آتي بمادة الإدخال؟';
const GATE3_MARK = '⚙️ البوابة ٣ — أي حركة يطلب هذا القفل؟';

const gotoStage3 = () => {
  fireEvent.click(screen.getAllByText('إنتاج موجه (Guidée)')[0]);
};

// Un élève au stade 3 a déjà fait la Phase 0 — sinon sa bannière dédouble « 🔒 قفل ».
beforeEach(() => { completePhase0(); });
afterEach(() => { resetPhase0(); });

describe('cascade des 3 portes au stade 3', () => {
  it('avant tout clic : porte 1 seule, ni StepBar ni critères ni zone d\'écriture', () => {
    render(<MethodologyCompilerView />);
    gotoStage3();
    expect(screen.getByText(GATE1_MARK)).toBeTruthy();
    expect(screen.queryByText(GATE2_MARK)).toBeNull();
    expect(screen.queryByText(GATE3_MARK)).toBeNull();
    expect(screen.queryByText(STEP_BAR_MARK)).toBeNull();
    expect(screen.queryByText(CRITERIA_MARK)).toBeNull();
    expect(screen.queryByPlaceholderText(/اكتب صياغتك/)).toBeNull();
    expect(screen.queryByText(/لا تُكتب هنا/)).toBeNull();
  });

  it('🔒 قفل ⇒ porte 2 apparaît (et seulement elle) ; le StepBar reste masqué', () => {
    render(<MethodologyCompilerView />);
    gotoStage3();
    fireEvent.click(screen.getByText('🔒 قفل').closest('button')!);
    expect(screen.queryByText(GATE1_MARK)).toBeNull();
    expect(screen.getByText(GATE2_MARK)).toBeTruthy();
    expect(screen.queryByText(GATE3_MARK)).toBeNull();
    expect(screen.queryByText(STEP_BAR_MARK)).toBeNull();
  });

  it('📄 وثيقة فقط ⇒ porte 3 (3 issues) apparaît ; puis le choix ouvre l\'éditeur', () => {
    render(<MethodologyCompilerView />);
    gotoStage3();
    fireEvent.click(screen.getByText('🔒 قفل').closest('button')!);
    fireEvent.click(screen.getByText('📄 وثيقة فقط').closest('button')!);
    expect(screen.getByText(GATE3_MARK)).toBeTruthy();
    // la porte 3 a exactement 3 issues
    expect(screen.getByText('📷').closest('button')).toBeTruthy();
    expect(screen.getByText('🎬').closest('button')).toBeTruthy();
    expect(screen.getByText('🔨').closest('button')).toBeTruthy();
    fireEvent.click(screen.getByText('📷').closest('button')!);
    expect(screen.queryByText(GATE3_MARK)).toBeNull();
    expect(screen.getByText(STEP_BAR_MARK)).toBeTruthy();
    expect(screen.getByText(CRITERIA_MARK)).toBeTruthy();
  });

  it('🧠 لا قفل ⇒ دُرج : toutes les portes ferment d\'un coup, écriture directe', () => {
    render(<MethodologyCompilerView />);
    gotoStage3();
    fireEvent.click(screen.getByText('🧠 لا قفل').closest('button')!);
    expect(screen.queryByText(GATE1_MARK)).toBeNull();
    expect(screen.queryByText(GATE2_MARK)).toBeNull();
    expect(screen.queryByText(GATE3_MARK)).toBeNull();
    expect(screen.queryByPlaceholderText(/اكتب صياغتك/)).toBeTruthy();
  });

  it('les boutons des portes sont neutres : aucune classe rouge/verte au survol', () => {
    render(<MethodologyCompilerView />);
    gotoStage3();
    const btnLock = screen.getByText('🔒 قفل').closest('button')!;
    const btnNoLock = screen.getByText('🧠 لا قفل').closest('button')!;
    expect(btnLock.className).not.toMatch(/red|emerald/);
    expect(btnNoLock.className).not.toMatch(/red|emerald/);
  });
});
