// src/components/TahlilWall.tsx — le mur حلّل (couche 1 du Trainer المفتاح).
//
// Un geste à l'écran (audits 1-2) : UNE phrase, DEUX boutons (تحليل | تفسير),
// feedback immédiat ≤ 1 ligne avec le marqueur surligné si erreur.
// Set = 12 items tirés du pool (mélange familles, anti-heuristique par construction).
// Clôture : 1 item de production contrainte par champs (audit 1 §5.3) — la
// frontière décrire/expliquer devient une contrainte d'interface : le champ
// تفسير reste grisé tant que l'analyse (phénomène + sens + valeurs) est vide,
// et un marqueur causal dans le champ analyse est REFUSÉ À LA SAISIE.
// Gate v2 (v3Progress.evaluateWallSet) : fautes ≤ 2, 0 sur F4/F5, ≥ 3 non-explicit.

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BrickWall, RotateCcw, Lock, CheckCircle2, XCircle, Lightbulb, ArrowLeft } from 'lucide-react';
import { WALL_SERIES_A, WallItem, lintWallBank } from '../data/tahlilWallBank';
import { detectDisplacedCausal, ANALYSIS_PATTERNS } from '../data/meftahLaw';
import {
  recordWallSet, getWallGateStatus, completeWallRemediation,
  WallAttemptDetail, WALL_RETRY_COOLDOWN_MS,
} from '../data/v3Progress';

const SET_SIZE = 12;

/** Tirage déterministe par graine (anti-mémorisation : chaque set diffère). */
function drawSet(seed: number): WallItem[] {
  const pool = [...WALL_SERIES_A];
  // Mulberry32 — stable, testable
  let rng = seed >>> 0;
  const rand = () => {
    rng = (rng + 0x6d2b79f5) >>> 0;
    let t = Math.imul(rng ^ (rng >>> 15), 1 | rng);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const picked: WallItem[] = [];
  while (picked.length < SET_SIZE && pool.length > 0) {
    const i = Math.floor(rand() * pool.length);
    picked.push(pool.splice(i, 1)[0]);
  }
  return picked;
}

const PRODUCTION_ITEMS = [
  {
    id: 'prod-1',
    contextAr: 'الوثيقة: تغيرات تركيز NE (nmol/L) بدلالة نسبة المعقدات Ado–A1R في غياب Mtb.',
    lockAr: 'ما أثر ارتباط Ado بـ A1R على إفراز NE؟',
  },
];

interface Props {
  onBack?: () => void;
}

export default function TahlilWall({ onBack }: Props) {
  // Linter contenu en DEV : le pool doit rester anti-heuristique.
  const lintErrors = useMemo(() => lintWallBank(WALL_SERIES_A), []);
  if (lintErrors.length > 0 && import.meta.env?.DEV) {
    console.warn('[TahlilWall] linter bank:', lintErrors);
  }

  const [seed, setSeed] = useState(() => Math.floor(Math.random() * 1e9));
  const [idx, setIdx] = useState(0);
  const [choice, setChoice] = useState<'tahlil' | 'tafsir' | null>(null);
  const [attempts, setAttempts] = useState<WallAttemptDetail[]>([]);
  const [phase, setPhase] = useState<'classify' | 'produce' | 'result'>('classify');
  const gate = getWallGateStatus();

  const set = useMemo(() => drawSet(seed), [seed]);
  const item = set[idx];

  // ── Production contrainte : champs ──
  const [prod, setProd] = useState({ phenomenon: '', direction: 'زاد', from: '', to: '' });
  const [prodCause, setProdCause] = useState('');
  const analysisText = `${prod.phenomenon} ${prod.direction} من ${prod.from} إلى ${prod.to}`;
  const analysisValid = prod.phenomenon.trim().length > 2 && (prod.from.trim() + prod.to.trim()).length > 0;
  const displacedInAnalysis = analysisValid ? detectDisplacedCausal(analysisText) : null;

  const restart = (newSeed?: number) => {
    setSeed(newSeed ?? Math.floor(Math.random() * 1e9));
    setIdx(0);
    setChoice(null);
    setAttempts([]);
    setPhase('classify');
    setProd({ phenomenon: '', direction: 'زاد', from: '', to: '' });
    setProdCause('');
  };

  const answer = (c: 'tahlil' | 'tafsir') => {
    if (choice || !item) return;
    setChoice(c);
    const correct = c === item.label;
    setAttempts((prev) => [
      ...prev,
      { itemId: item.id, family: item.family, cue: item.cue, chosen: c, correct },
    ]);
  };

  const next = () => {
    if (idx + 1 >= set.length) {
      setPhase('produce');
    } else {
      setIdx(idx + 1);
      setChoice(null);
    }
  };

  const finishSet = () => {
    // La production contrainte compte comme 2 items virtuels (phénomène+valeurs valides,
    // pas de marqueur causal dans l'analyse, et le تفسير n'est rempli QUE dans son champ).
    const prodOk = analysisValid && !displacedInAnalysis;
    const prodDetails: WallAttemptDetail[] = [
      { itemId: 'production-analysis', family: 'F1', cue: 'none', chosen: 'tahlil', correct: prodOk },
      { itemId: 'production-cause', family: 'F2', cue: 'explicit', chosen: 'tafsir', correct: prodOk && prodCause.trim().length > 3 },
    ];
    const result = recordWallSet([...attempts, ...prodDetails]);
    setPhase('result');
    return result;
  };

  const errCount = attempts.filter((a) => !a.correct).length;
  const retryMinutes = Math.ceil(gate.retryInMs / 60000);

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6 space-y-5" dir="rtl" data-testid="tahlil-wall">
      {/* En-tête */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl text-white shadow-sm" style={{ background: 'linear-gradient(135deg,#c08a1f,#765108)' }}>
            <BrickWall className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-gray-900 dark:text-white">جدار حلّل</h2>
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400">
              صنّف الجملة: تحليل (وصف مقيس) أم تفسير (سبب / آلية)؟
            </p>
          </div>
        </div>
        {onBack && (
          <button onClick={onBack} className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-[#c08a1f]">
            <ArrowLeft className="w-3.5 h-3.5" /> رجوع
          </button>
        )}
      </div>

      {/* Règle fixe (la consigne du mur) */}
      <div className="grid grid-cols-2 gap-2 text-[11px] font-bold">
        <div className="rounded-xl border border-teal-200 dark:border-teal-800 bg-teal-50 dark:bg-teal-950/20 px-3 py-2 text-teal-800 dark:text-teal-200">
          التحليل = قيم + اتجاه / مقارنة، بلا سبب
        </div>
        <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20 px-3 py-2 text-amber-800 dark:text-amber-200">
          التفسير = سبب أو آلية (لأن، يدل على، راجع إلى…)
        </div>
      </div>

      {/* Gate状态 */}
      {gate.passed ? (
        <div className="rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/20 px-4 py-3 flex items-center gap-2 text-emerald-800 dark:text-emerald-200 text-xs font-bold" data-testid="wall-gate-passed">
          <CheckCircle2 className="w-4 h-4" />
          الجدار مفتوح ✓ — مهمة التحليل دون تفسير مستقرة عندك. (للتدريب: إعادة بصعوبة جديدة)
        </div>
      ) : gate.remediation ? (
        <div className="rounded-2xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20 px-4 py-3 space-y-2" data-testid="wall-remediation">
          <p className="text-amber-800 dark:text-amber-200 text-xs font-bold">
            ثلاث محاولات دون نجاح — مراجعة موجهة: اقرأ القاعدة، ثم جرّب مجموعة جديدة.
          </p>
          <button
            onClick={() => { completeWallRemediation(); restart(); }}
            className="px-4 py-2 rounded-xl bg-[#c08a1f] hover:bg-[#765108] text-white text-xs font-bold shadow"
            data-testid="wall-remediation-restart"
          >
            فتح المراجعة وإعادة جديدة
          </button>
        </div>
      ) : null}

      {/* ── Phase 1 : classement ── */}
      {phase === 'classify' && item && (
        <div className="space-y-4">
          {/* Progression */}
          <div className="flex items-center justify-between text-[11px] font-bold text-gray-400">
            <span>{idx + 1} / {set.length}</span>
            <span>{errCount > 0 ? `أخطاء: ${errCount}` : 'بلا أخطاء'}</span>
          </div>
          <div className="h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
            <div className="h-full rounded-full transition-all" style={{ width: `${((idx) / set.length) * 100}%`, background: 'linear-gradient(90deg,#c08a1f,#c08a1f)' }} />
          </div>

          {/* La phrase — un seul geste */}
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#141916] p-5 text-base font-medium leading-8 text-gray-900 dark:text-gray-100 shadow-sm"
            data-testid={`wall-item-${idx}`}
          >
            {renderBidi(item.sentence)}
          </motion.div>

          {/* Deux boutons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => answer('tahlil')}
              disabled={!!choice}
              className={`rounded-2xl py-3.5 font-black text-sm border-2 transition-all cursor-pointer disabled:cursor-default
                ${choice === 'tahlil'
                  ? item.label === 'tahlil'
                    ? 'bg-teal-500 text-white border-teal-600'
                    : 'bg-red-500 text-white border-red-600'
                  : 'bg-white dark:bg-[#141916] border-gray-200 dark:border-gray-700 hover:border-teal-400 text-gray-800 dark:text-gray-100'}`}
              data-testid="wall-btn-tahlil"
            >
              تحليل
            </button>
            <button
              onClick={() => answer('tafsir')}
              disabled={!!choice}
              className={`rounded-2xl py-3.5 font-black text-sm border-2 transition-all cursor-pointer disabled:cursor-default
                ${choice === 'tafsir'
                  ? item.label === 'tafsir'
                    ? 'bg-teal-500 text-white border-teal-600'
                    : 'bg-red-500 text-white border-red-600'
                  : 'bg-white dark:bg-[#141916] border-gray-200 dark:border-gray-700 hover:border-amber-400 text-gray-800 dark:text-gray-100'}`}
              data-testid="wall-btn-tafir"
            >
              تفسير
            </button>
          </div>

          {/* Feedback immédiat */}
          <AnimatePresence>
            {choice && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`rounded-2xl px-4 py-3 text-sm font-bold flex items-start gap-2
                  ${choice === item.label
                    ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800'
                    : 'bg-red-50 dark:bg-red-950/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800'}`}
                data-testid="wall-feedback"
              >
                {choice === item.label
                  ? <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                  : <XCircle className="w-4 h-4 mt-0.5 shrink-0" />}
                <span>
                  {choice === item.label
                    ? (item.label === 'tahlil'
                        ? 'صحيح — وصف مقيس بلا سبب.'
                        : 'صحيح — سبب أو آلية.')
                    : item.feedbackWrongAr}
                  {choice !== item.label && item.pattern && (
                    <span className="block text-xs font-medium mt-1 text-gray-600 dark:text-gray-300">
                      قالب التحليل: {ANALYSIS_PATTERNS.find((p) => p.id === item.pattern)?.templateAr}
                    </span>
                  )}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {choice && (
            <button
              onClick={next}
              className="w-full rounded-2xl bg-[#c08a1f] hover:bg-[#765108] text-white font-black py-3 text-sm shadow transition-colors cursor-pointer"
              data-testid="wall-next"
            >
              {idx + 1 >= set.length ? 'إلى الإنتاج الموجّه ←' : 'التالي ←'}
            </button>
          )}
        </div>
      )}

      {/* ── Phase 2 : production contrainte par champs ── */}
      {phase === 'produce' && (
        <div className="space-y-4" data-testid="wall-produce">
          <div className="rounded-2xl border border-[#ebd6a0] bg-[#fff8e8] dark:bg-[#3a2c14]/20 p-4 space-y-2">
            <p className="text-xs font-black text-[#765108] dark:text-[#ffd27a] flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4" /> الإنتاج الموجّه — اكتب التحليل بالحقول، ثم التفسير في مكانه
            </p>
            <p className="text-sm font-bold text-gray-700 dark:text-gray-200 leading-7">
              {PRODUCTION_ITEMS[0].contextAr}
              <br />
              <span className="text-[#765108] dark:text-[#ffd27a]">القفل: {PRODUCTION_ITEMS[0].lockAr}</span>
            </p>
          </div>

          {/* Champ analyse — la frontière est structurelle */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#141916] p-4 space-y-3">
            <p className="text-xs font-black text-teal-700 dark:text-teal-300">① التحليل (وصف مقيس — بلا سبب):</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <input
                value={prod.phenomenon}
                onChange={(e) => setProd({ ...prod, phenomenon: e.target.value })}
                placeholder="الظاهرة المدروسة"
                className="rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 text-sm"
                data-testid="prod-phenomenon"
              />
              <select
                value={prod.direction}
                onChange={(e) => setProd({ ...prod, direction: e.target.value })}
                className="rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 text-sm font-bold"
                data-testid="prod-direction"
              >
                <option value="زاد">زاد</option>
                <option value="نقص">نقص</option>
                <option value="بقي ثابتا">بقي ثابتا</option>
              </select>
              <input
                value={prod.from}
                onChange={(e) => setProd({ ...prod, from: e.target.value })}
                placeholder="من (قيمة)"
                className="rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 text-sm"
                data-testid="prod-from"
              />
              <input
                value={prod.to}
                onChange={(e) => setProd({ ...prod, to: e.target.value })}
                placeholder="إلى (قيمة)"
                className="rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 text-sm"
                data-testid="prod-to"
              />
            </div>
            {analysisValid && (
              <p className="text-xs text-gray-500 bg-gray-50 dark:bg-black/20 rounded-xl px-3 py-2" data-testid="prod-analysis-preview">
                «{analysisText}»
              </p>
            )}
            {displacedInAnalysis && (
              <p className="text-xs font-bold text-red-600 dark:text-red-400" data-testid="prod-displaced-warning">
                ⚠️ «{displacedInAnalysis.labelAr}» كلمة تفسير — مكانها الحقل ② لا ①. ({displacedInAnalysis.rationaleAr})
              </p>
            )}
          </div>

          {/* Champ تفسير — grisé tant que l'analyse est vide */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#141916] p-4 space-y-2">
            <p className="text-xs font-black text-amber-700 dark:text-amber-300">② التفسير (السبب / الآلية) — يُفتح بعد إكمال التحليل:</p>
            <textarea
              value={prodCause}
              onChange={(e) => setProdCause(e.target.value)}
              disabled={!analysisValid || !!displacedInAnalysis}
              placeholder={analysisValid && !displacedInAnalysis ? 'وهذا راجع إلى … نعلم أن …' : 'أكمل التحليل أولا (①)'}
              rows={2}
              className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 text-sm disabled:opacity-50"
              data-testid="prod-cause"
            />
          </div>

          <button
            onClick={finishSet}
            disabled={!analysisValid || !!displacedInAnalysis || prodCause.trim().length < 4}
            className="w-full rounded-2xl bg-[#c08a1f] hover:bg-[#765108] disabled:opacity-40 disabled:cursor-not-allowed text-white font-black py-3 text-sm shadow transition-colors cursor-pointer"
            data-testid="wall-finish"
          >
            أنهِ المجموعة وافحص الجدار ←
          </button>
        </div>
      )}

      {/* ── Phase 3 : résultat + gate ── */}
      {phase === 'result' && (
        <div className="space-y-4" data-testid="wall-result">
          {(() => {
            const st = getWallGateStatus();
            const prodOk = analysisValid && !displacedInAnalysis && prodCause.trim().length > 3;
            return st.passed && prodOk ? (
              <div className="rounded-2xl border-2 border-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 p-5 space-y-2" data-testid="wall-passed">
                <p className="font-black text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" /> الجدار مفتوح!
                </p>
                <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
                  {errCount} خطأ في التصنيف + إنتاج موجه {'✓'} — التحليل عندك وصف، والتفسير مكانه الصحيح.
                </p>
              </div>
            ) : (
              <div className="rounded-2xl border-2 border-red-300 bg-red-50 dark:bg-red-950/20 p-5 space-y-2" data-testid="wall-failed">
                <p className="font-black text-red-800 dark:text-red-200 flex items-center gap-2">
                  <XCircle className="w-5 h-5" /> الجدار لم يُفتح بعد
                </p>
                <p className="text-sm font-bold text-red-700 dark:text-red-300">
                  {errCount} خطأ — راجع القاعدة أعلاه ثم أعد المحاولة {st.retryInMs > 0 && `(بعد ${Math.ceil(st.retryInMs / 60000)} دقيقة)`}.
                </p>
              </div>
            );
          })()}

          {/* L'élève qui échoue 3 fois n'est jamais bloqué : remédiation affichée au prochain mount */}
          {gate.attempts >= 3 && !gate.passed && (
            <button
              onClick={() => { completeWallRemediation(); restart(); }}
              className="w-full rounded-2xl border-2 border-amber-400 bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-200 font-black py-3 text-sm"
              data-testid="wall-remediate"
            >
              مراجعة موجهة ثم مجموعة جديدة (بدل الانتظار)
            </button>
          )}

          <button
            onClick={() => restart()}
            disabled={!gate.passed && gate.retryInMs > 0}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gray-100 dark:bg-gray-800 disabled:opacity-40 text-gray-700 dark:text-gray-200 font-bold py-3 text-sm cursor-pointer"
            data-testid="wall-retry"
          >
            <RotateCcw className="w-4 h-4" />
            {gate.passed ? 'إعادة تدريب (مجموعة جديدة)' : gate.retryInMs > 0 ? `الانتظار ${Math.ceil(gate.retryInMs / 60000)} دقيقة (منع الحفظ)` : 'مجموعة جديدة'}
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * Bidi (audit 1 R9) : isole chaque segment LTR (latin, chiffres, unités, symboles
 * chimiques K⁺ / CO₂…) dans un <bdi> — sinon l'ordre visuel des nombres et unités
 * est cassé sur Android bas de gamme, dans une appli où LE CHIFFRE est le contenu
 * pédagogique. textContent reste identique (les tests lisent le texte, pas le DOM).
 */
const LTR_RUN = /([A-Za-z0-9][A-Za-z0-9٪%°µ≈⁻⁺²³₀-₉₄.\-/]*[A-Za-z0-9٪%°µ≈⁻⁺²³₄]|[A-Za-z0-9])/g;

export function renderBidi(sentence: string): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  let last = 0;
  for (const m of sentence.matchAll(LTR_RUN)) {
    const i = m.index ?? 0;
    if (i > last) out.push(sentence.slice(last, i));
    out.push(<bdi key={i}>{m[0]}</bdi>);
    last = i + m[0].length;
  }
  if (last < sentence.length) out.push(sentence.slice(last));
  return out;
}
