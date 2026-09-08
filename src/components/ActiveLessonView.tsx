// ActiveLessonView.tsx
// Rendu interactif d'une Leçon Active (« mot par mot ») depuis ACTIVE_LESSONS.
// Parcourt les blocs dans l'ordre (tunnelStateMachine via useReducer), valide
// chaque production (mots-clés / réponses acceptées / moteur ValidationEngine),
// sauvegarde un snapshot (sessionSnapshotService) pour reprendre où on s'est arrêté.
import { useEffect, useMemo, useReducer, useState } from 'react';
import { CheckCircle2, XCircle, ChevronLeft, Lightbulb, Info } from 'lucide-react';
import { ACTIVE_LESSONS, getLessonProgression } from '../data/activeLessons';
import type { Block } from '../data/activeLessons';
import { normalizeAr } from '../lib/validation/normalizeAr';
import { validateAnswer } from '../lib/validation/ValidationEngine';
import { tunnelReducer, createInitialSessionData } from '../lib/lesson/tunnelStateMachine';
import type { LessonSessionEvent } from '../lib/lesson/tunnelStateMachine';
import {
  loadLessonSnapshot,
  saveLessonSnapshot,
  clearLessonSnapshot,
} from '../lib/lesson/sessionSnapshotService';

interface Props {
  lessonKey: string;
  onBack: () => void;
  onNext?: () => void;
  nextTitleAr?: string;
}

type BlockOutcome = { passed: boolean; feedbackAr: string };

function keywordHit(answer: string, kw: string): boolean {
  return normalizeAr(answer).includes(normalizeAr(kw));
}

/** Validation d'une production texte : mots-clés requis (tous), ordre optionnel, mots interdits. */
function validateKeywords(answer: string, opts: { required?: string[]; ordered?: string[]; forbidden?: string[] }): BlockOutcome {
  const required = opts.required ?? [];
  const forbidden = opts.forbidden ?? [];
  const norm = normalizeAr(answer);
  if (norm.length === 0) return { passed: false, feedbackAr: 'اكتب إجابتك أولاً.' };

  if (forbidden.some((f) => keywordHit(answer, f))) {
    return { passed: false, feedbackAr: 'إجابتك تحتوي على عبارات مرفوضة في هذا السياق. أعد الصياغة.' };
  }
  const missing = required.filter((k) => !keywordHit(answer, k));
  if (missing.length > 0) {
    return { passed: false, feedbackAr: `إجابتك ناقصة. تأكد من ذكر: ${missing.join(' · ')}` };
  }
  if (opts.ordered && opts.ordered.length > 1) {
    let last = -1;
    let orderedOk = true;
    for (const k of opts.ordered) {
      const idx = norm.indexOf(normalizeAr(k));
      if (idx === -1 || idx < last) { orderedOk = false; break; }
      last = idx;
    }
    if (!orderedOk) {
      return { passed: false, feedbackAr: 'الترتيب الزمني/المنطقي للعناصر غير صحيح. رتّب الأحداث كما تحدث فعلياً.' };
    }
  }
  return { passed: true, feedbackAr: 'أحسنت! إجابة علمية دقيقة.' };
}

/** Validation d'un micro-test : réponse acceptée (normalisée, tolérante). */
function validateAccepted(answer: string, accepted: string[]): BlockOutcome {
  const norm = normalizeAr(answer);
  if (norm.length === 0) return { passed: false, feedbackAr: 'اكتب إجابتك أولاً.' };
  if (accepted.some((a) => normalizeAr(a) === norm)) {
    return { passed: true, feedbackAr: 'إجابة صحيحة تماماً!' };
  }
  return { passed: false, feedbackAr: 'ليست الإجابة المنتظرة. راجع الملاحظة ثم أعد المحاولة.' };
}

export default function ActiveLessonView({ lessonKey, onBack, onNext, nextTitleAr }: Props) {
  const lesson = ACTIVE_LESSONS[lessonKey];
  const blocks = useMemo(() => lesson?.blocks ?? [], [lesson]);
  const total = blocks.length;

  const [session, dispatch] = useReducer(tunnelReducer, total, (n) => {
    const snap = loadLessonSnapshot(lessonKey);
    if (snap) {
      // Reprise : restaure l'index et les blocs validés.
      return {
        state: snap.validatedBlocks.every(Boolean) ? 'EXIT_PRACTICE' as const : 'BLOCKS_IN_PROGRESS' as const,
        currentBlockIndex: Math.min(snap.currentBlockIndex, Math.max(n - 1, 0)),
        validatedBlocks: snap.validatedBlocks.slice(0, n),
        totalBlocks: n,
        outcome: snap.outcome,
        feedbackViewed: snap.feedbackViewed,
      };
    }
    return createInitialSessionData(n);
  });

  const [answers, setAnswers] = useState<Record<number, Record<string, string>>>({});
  const [outcomes, setOutcomes] = useState<Record<number, BlockOutcome | undefined>>({});
  const [openPopup, setOpenPopup] = useState<string | null>(null);
  const [selectedChoice, setSelectedChoice] = useState<Record<number, string>>({});
  const [orderedSteps, setOrderedSteps] = useState<Record<number, string[]>>({});

  // Persistance du snapshot à chaque changement d'état.
  useEffect(() => {
    if (!lesson) return;
    if (session.state === 'MISSION_VISIBLE') return;
    saveLessonSnapshot(lessonKey, {
      lessonId: lessonKey,
      state: session.state,
      currentBlockIndex: session.currentBlockIndex,
      validatedBlocks: session.validatedBlocks,
      outcome: session.outcome,
      feedbackViewed: session.feedbackViewed,
      suspendedAt: Date.now(),
    });
  }, [session, lessonKey, lesson]);

  // Nettoyage à la sortie du composant.
  useEffect(() => {
    return () => { clearLessonSnapshot(lessonKey); };
  }, [lessonKey]);

  if (!lesson) {
    return (
      <div dir="rtl" className="p-6 rounded-2xl border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/20 text-red-800 dark:text-red-200 font-bold text-sm text-center">
        لا توجد درس نشيط بهذا المفتاح ({lessonKey})
      </div>
    );
  }

  const progression = getLessonProgression(lessonKey);
  const idx = session.currentBlockIndex;
  const block: Block | undefined = blocks[idx];
  const validatedCount = session.validatedBlocks.filter(Boolean).length;

  const setAnswer = (blockIdx: number, fieldId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [blockIdx]: { ...(prev[blockIdx] ?? {}), [fieldId]: value } }));
  };

  const passBlock = (outcome: BlockOutcome) => {
    setOutcomes((prev) => ({ ...prev, [idx]: outcome }));
    if (outcome.passed) {
      dispatch({ type: 'VALIDATE_BLOCK', blockIndex: idx } as LessonSessionEvent);
    }
  };

  const renderBlock = (b: Block, blockIdx: number) => {
    switch (b.type) {
      case 'MISSION_CHOICE': {
        const chosen = selectedChoice[blockIdx];
        return (
          <div className="space-y-4">
            <div className="bg-gradient-to-l from-emerald-600 to-teal-700 text-white p-5 rounded-2xl shadow-md">
              <h3 className="text-xl font-black mb-2">{b.heroTitle}</h3>
              <p className="text-sm text-white/90 leading-relaxed">{b.heroText}</p>
              {b.imageSrc && (
                <img src={b.imageSrc} alt={b.heroTitle} className="mt-3 rounded-xl w-full max-h-64 object-contain bg-white/10" />
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {b.choices.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setSelectedChoice((p) => ({ ...p, [blockIdx]: c.id }));
                    if (c.completeOnSelect) {
                      passBlock({ passed: true, feedbackAr: 'انطلقنا! تابع الخطوات الموالية.' });
                    }
                  }}
                  className={`p-4 rounded-2xl border text-right transition-all ${
                    chosen === c.id
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 shadow-md'
                      : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-[#161c18] hover:border-emerald-400'
                  }`}
                >
                  <span className="block text-sm font-black text-gray-800 dark:text-gray-100">{c.labelAr}</span>
                  <span className="block text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">{c.descriptionAr}</span>
                </button>
              ))}
            </div>
          </div>
        );
      }

      case 'TEXT_AND_PRODUCE': {
        const parts = b.content.split('[____]');
        const blanks = parts.length - 1;
        const result = outcomes[blockIdx];
        return (
          <div className="space-y-4">
            <p className="text-base font-bold text-gray-800 dark:text-gray-100 leading-loose">
              {parts.map((p, i) => (
                <span key={i}>
                  {p}
                  {i < blanks && (
                    <input
                      value={answers[blockIdx]?.[`blank_${i}`] ?? ''}
                      onChange={(e) => setAnswer(blockIdx, `blank_${i}`, e.target.value)}
                      disabled={session.validatedBlocks[blockIdx]}
                      className="mx-1 w-32 border-b-2 border-emerald-500 bg-transparent focus:outline-none text-center font-black"
                      aria-label={`فراغ ${i + 1}`}
                    />
                  )}
                </span>
              ))}
            </p>
            {Object.keys(b.popups).length > 0 && (
              <div className="flex flex-wrap gap-2">
                {Object.entries(b.popups).map(([term, def]) => (
                  <span key={term} className="relative inline-block">
                    <button
                      onClick={() => setOpenPopup(openPopup === term ? null : term)}
                      className="text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-[#006d37] dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1 rounded-lg hover:border-emerald-400"
                    >
                      {term} ↩
                    </button>
                    {openPopup === term && (
                      <span className="absolute z-30 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-white dark:bg-[#1a201c] p-3 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 text-xs leading-relaxed text-gray-700 dark:text-gray-200 block">
                        {def}
                      </span>
                    )}
                  </span>
                ))}
              </div>
            )}
            <div className="bg-gray-50 dark:bg-gray-900/40 rounded-2xl p-4 border border-gray-200 dark:border-gray-800">
              <p className="text-sm font-black text-gray-800 dark:text-gray-100 mb-2">🧪 اختبار مصغّر</p>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{b.microTest.prompt}</p>
              <div className="flex gap-2 flex-wrap">
                <input
                  value={answers[blockIdx]?.['micro'] ?? ''}
                  onChange={(e) => setAnswer(blockIdx, 'micro', e.target.value)}
                  disabled={session.validatedBlocks[blockIdx]}
                  className="flex-1 min-w-48 border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-2 text-sm bg-white dark:bg-[#161c18] focus:border-emerald-500 focus:outline-none"
                  aria-label="إجابة الاختبار المصغر"
                />
                <button
                  onClick={() => passBlock(validateAccepted(answers[blockIdx]?.['micro'] ?? '', b.microTest.acceptedAnswers))}
                  disabled={session.validatedBlocks[blockIdx]}
                  className="px-4 py-2 rounded-xl font-black text-sm bg-[#006d37] hover:bg-[#00562b] text-white disabled:opacity-40"
                >
                  تحقّق
                </button>
              </div>
              {result && (
                <p className={`mt-2 text-xs font-bold flex items-center gap-1.5 ${result.passed ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                  {result.passed ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  {result.passed ? result.feedbackAr : `${result.feedbackAr} — تلميح: ${b.microTest.errorHint}`}
                </p>
              )}
            </div>
          </div>
        );
      }

      case 'HOTSPOT_AND_METHODOLOGY': {
        const result = outcomes[blockIdx];
        const hotspotDone = session.validatedBlocks[blockIdx] || outcomes[blockIdx]?.passed;
        return (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{b.introText}</p>
            {b.schemaSrc && (
              <div className="relative overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 bg-white">
                <img src={b.schemaSrc} alt={b.objective} className="w-full max-h-80 object-contain" />
                {!hotspotDone && (
                  <button
                    onClick={(e) => {
                      const rect = (e.currentTarget as HTMLButtonElement).getBoundingClientRect();
                      const x = ((e.clientX - rect.left) / rect.width) * 100;
                      const y = ((e.clientY - rect.top) / rect.height) * 100;
                      const dz = b.hotspot.correctZone;
                      const dist = Math.hypot(x - dz.x, y - dz.y);
                      if (dist <= dz.radius) {
                        passBlock({ passed: true, feedbackAr: b.hotspot.successFeedback });
                      } else {
                        setOutcomes((p) => ({ ...p, [blockIdx]: { passed: false, feedbackAr: b.hotspot.prompt } }));
                      }
                    }}
                    className="absolute inset-0 cursor-crosshair"
                    aria-label={b.hotspot.prompt}
                  />
                )}
              </div>
            )}
            <p className="text-xs font-bold text-[#506072]">🎯 {b.hotspot.prompt}</p>

            <div className="bg-amber-50/60 dark:bg-amber-950/20 rounded-2xl p-4 border border-amber-200 dark:border-amber-900/40">
              <p className="text-sm font-black text-amber-800 dark:text-amber-300 mb-1 flex items-center gap-1.5"><Lightbulb className="w-4 h-4" /> المنهجية</p>
              <p className="text-xs text-amber-700 dark:text-amber-400 mb-3">{b.methodology.prompt}</p>
              <div className="space-y-3">
                {b.methodology.steps.map((s, si) => (
                  <div key={s.label}>
                    <label className="block text-xs font-black text-gray-700 dark:text-gray-200 mb-1">{s.label}</label>
                    <textarea
                      value={answers[blockIdx]?.[`step_${si}`] ?? ''}
                      onChange={(e) => setAnswer(blockIdx, `step_${si}`, e.target.value)}
                      disabled={!!hotspotDone}
                      placeholder={s.placeholder}
                      rows={2}
                      className="w-full border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-2 text-xs bg-white dark:bg-[#161c18] focus:border-emerald-500 focus:outline-none resize-y"
                    />
                  </div>
                ))}
              </div>
              {!hotspotDone && (
                <button
                  onClick={() => {
                    const missing: string[] = [];
                    b.methodology.steps.forEach((s, si) => {
                      const a = answers[blockIdx]?.[`step_${si}`] ?? '';
                      const miss = s.requiredKeywords.filter((k) => !keywordHit(a, k));
                      if (miss.length > 0) missing.push(`${s.label}: ${miss.join(' · ')}`);
                    });
                    if (missing.length === 0) {
                      passBlock({ passed: true, feedbackAr: 'خطوات منهجية موفقة! تابع الدرس.' });
                    } else {
                      setOutcomes((p) => ({ ...p, [blockIdx]: { passed: false, feedbackAr: `أكمل: ${missing.join(' — ')}` } }));
                    }
                  }}
                  className="mt-3 px-4 py-2 rounded-xl font-black text-xs bg-amber-600 hover:bg-amber-700 text-white"
                >
                  تحقّق من الخطوات
                </button>
              )}
            </div>
            {result && (
              <p className={`text-xs font-bold flex items-center gap-1.5 ${result.passed ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                {result.passed ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                {result.feedbackAr}
              </p>
            )}
          </div>
        );
      }

      case 'GUIDED_DOC_QA': {
        const result = outcomes[blockIdx];
        const docAnswers = answers[blockIdx] ?? {};
        return (
          <div className="space-y-4">
            {b.doc.assetSrc && (
              <figure className="rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-white">
                <img src={b.doc.assetSrc} alt={b.doc.altAr} className="w-full max-h-72 object-contain" />
                {b.doc.captionAr && <figcaption className="p-2 text-[11px] text-gray-500 text-center">{b.doc.captionAr}</figcaption>}
              </figure>
            )}
            {b.questions.map((q, qi) => (
              <div key={q.id} className="bg-gray-50 dark:bg-gray-900/40 rounded-2xl p-4 border border-gray-200 dark:border-gray-800">
                <p className="text-sm font-black text-gray-800 dark:text-gray-100 mb-1">
                  <span className="text-[#006d37]">{q.verbAr}</span> — {q.promptAr}
                </p>
                <textarea
                  value={docAnswers[`q_${qi}`] ?? ''}
                  onChange={(e) => setAnswer(blockIdx, `q_${qi}`, e.target.value)}
                  disabled={session.validatedBlocks[blockIdx]}
                  rows={2}
                  className="mt-2 w-full border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-2 text-sm bg-white dark:bg-[#161c18] focus:border-emerald-500 focus:outline-none resize-y"
                  aria-label={q.promptAr}
                />
              </div>
            ))}
            <button
              onClick={() => {
                const fails: string[] = [];
                let allPassed = true;
                b.questions.forEach((q, qi) => {
                  const a = docAnswers[`q_${qi}`] ?? '';
                  let ok = false;
                  if (q.validationMode === 'engine' && q.validationCtx) {
                    ok = validateAnswer(a, { ...q.validationCtx, promptAr: q.promptAr }).passed;
                  } else {
                    ok = validateKeywords(a, { required: q.requiredKeywords, ordered: q.orderedKeywords, forbidden: q.forbiddenKeywords }).passed;
                  }
                  if (!ok) { allPassed = false; fails.push(q.verbAr); }
                });
                if (allPassed) {
                  passBlock({ passed: true, feedbackAr: b.summaryAr });
                } else {
                  setOutcomes((p) => ({ ...p, [blockIdx]: { passed: false, feedbackAr: `أعد العمل على: ${fails.join(' · ')}` } }));
                }
              }}
              disabled={session.validatedBlocks[blockIdx]}
              className="px-4 py-2 rounded-xl font-black text-sm bg-[#006d37] hover:bg-[#00562b] text-white disabled:opacity-40"
            >
              تحقّق من الأجوبة
            </button>
            {result && (
              <div className={`rounded-2xl p-4 border text-sm font-bold leading-relaxed ${result.passed ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300' : 'border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-300'}`}>
                {result.passed ? `✅ ${result.feedbackAr}` : `❌ ${result.feedbackAr}`}
              </div>
            )}
          </div>
        );
      }

      case 'DUAL_EVIDENCE': {
        const result = outcomes[blockIdx];
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[b.docA, b.docB].map((d, di) => (
                <figure key={di} className="rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-white">
                  {d.assetSrc && <img src={d.assetSrc} alt={d.altAr} className="w-full max-h-64 object-contain" />}
                  <figcaption className="p-2 text-[11px] text-gray-500 text-center">{d.captionAr}</figcaption>
                </figure>
              ))}
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-black mb-1">1) {b.extractionPromptAr}</label>
                <textarea
                  value={answers[blockIdx]?.['extract'] ?? ''}
                  onChange={(e) => setAnswer(blockIdx, 'extract', e.target.value)}
                  disabled={session.validatedBlocks[blockIdx]}
                  rows={2}
                  className="w-full border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-2 text-sm bg-white dark:bg-[#161c18] focus:border-emerald-500 focus:outline-none resize-y"
                />
              </div>
              <div>
                <label className="block text-xs font-black mb-1">2) {b.justificationPromptAr}</label>
                <textarea
                  value={answers[blockIdx]?.['justify'] ?? ''}
                  onChange={(e) => setAnswer(blockIdx, 'justify', e.target.value)}
                  disabled={session.validatedBlocks[blockIdx]}
                  rows={2}
                  className="w-full border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-2 text-sm bg-white dark:bg-[#161c18] focus:border-emerald-500 focus:outline-none resize-y"
                />
              </div>
            </div>
            <button
              onClick={() => {
                const extractionOk = b.extractionKeywords.every((k) => keywordHit(answers[blockIdx]?.['extract'] ?? '', k));
                const justOk = b.justificationKeywords.every((k) => keywordHit(answers[blockIdx]?.['justify'] ?? '', k));
                if (extractionOk && justOk) {
                  passBlock({ passed: true, feedbackAr: b.summaryAr });
                } else {
                  setOutcomes((p) => ({ ...p, [blockIdx]: { passed: false, feedbackAr: !extractionOk ? 'الاستخراج من الوثيقتين ناقص.' : 'التعليل غير مكتمل.' } }));
                }
              }}
              disabled={session.validatedBlocks[blockIdx]}
              className="px-4 py-2 rounded-xl font-black text-sm bg-[#006d37] hover:bg-[#00562b] text-white disabled:opacity-40"
            >
              تحقّق
            </button>
            {result && (
              <p className={`text-xs font-bold ${result.passed ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>{result.feedbackAr}</p>
            )}
          </div>
        );
      }

      case 'HYPOTHESIS_EXPERIMENT': {
        const result = outcomes[blockIdx];
        const fields: [string, string, string[]][] = [
          ['hyp', b.hypothesisPromptAr, []],
          ['res', b.resultPromptAr, b.resultKeywords ?? []],
          ['val', b.validationPromptAr, b.validationKeywords ?? []],
        ];
        return (
          <div className="space-y-4">
            <p className="text-sm font-black text-gray-800 dark:text-gray-100">⚠️ {b.problemAr}</p>
            {b.experimentAssetSrc && (
              <figure className="rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-white">
                <img src={b.experimentAssetSrc} alt={b.experimentAltAr} className="w-full max-h-72 object-contain" />
              </figure>
            )}
            {fields.map(([id, prompt]) => (
              <div key={id}>
                <label className="block text-xs font-black mb-1">{prompt}</label>
                <textarea
                  value={answers[blockIdx]?.[id] ?? ''}
                  onChange={(e) => setAnswer(blockIdx, id, e.target.value)}
                  disabled={session.validatedBlocks[blockIdx]}
                  rows={2}
                  className="w-full border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-2 text-sm bg-white dark:bg-[#161c18] focus:border-emerald-500 focus:outline-none resize-y"
                />
              </div>
            ))}
            <button
              onClick={() => {
                const missing: string[] = [];
                if (!b.expectedTargets.some((t) => keywordHit(answers[blockIdx]?.['hyp'] ?? '', t))) missing.push('الفرضية');
                if (!b.resultKeywords?.every((k) => keywordHit(answers[blockIdx]?.['res'] ?? '', k))) missing.push('النتيجة');
                if (!b.validationKeywords?.every((k) => keywordHit(answers[blockIdx]?.['val'] ?? '', k))) missing.push('التحقق');
                if (missing.length === 0) {
                  passBlock({ passed: true, feedbackAr: b.summaryAr });
                } else {
                  setOutcomes((p) => ({ ...p, [blockIdx]: { passed: false, feedbackAr: `أكمل: ${missing.join(' · ')}` } }));
                }
              }}
              disabled={session.validatedBlocks[blockIdx]}
              className="px-4 py-2 rounded-xl font-black text-sm bg-[#006d37] hover:bg-[#00562b] text-white disabled:opacity-40"
            >
              تحقّق
            </button>
            {result && (
              <p className={`text-xs font-bold ${result.passed ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>{result.feedbackAr}</p>
            )}
          </div>
        );
      }

      case 'COMPARISON_TABLE': {
        const result = outcomes[blockIdx];
        const tableAnswers = answers[blockIdx] ?? {};
        return (
          <div className="space-y-4">
            <p className="text-sm font-black">{b.promptAr}</p>
            {b.assetSrc && (
              <figure className="rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-white">
                <img src={b.assetSrc} alt={b.altAr ?? ''} className="w-full max-h-72 object-contain" />
              </figure>
            )}
            <div className="overflow-x-auto rounded-2xl border border-gray-200 dark:border-gray-800">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-emerald-50 dark:bg-emerald-950/30">
                    <th className="p-2 text-right font-black">المعيار</th>
                    <th className="p-2 text-right font-black">العمود الأول</th>
                    <th className="p-2 text-right font-black">العمود الثاني</th>
                  </tr>
                </thead>
                <tbody>
                  {b.criteria.map((c) => (
                    <tr key={c.id} className="border-t border-gray-200 dark:border-gray-800">
                      <td className="p-2 font-bold text-xs">{c.labelAr}</td>
                      <td className="p-2">
                        <input
                          value={tableAnswers[`${c.id}_L`] ?? ''}
                          onChange={(e) => setAnswer(blockIdx, `${c.id}_L`, e.target.value)}
                          disabled={session.validatedBlocks[blockIdx]}
                          className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-2 py-1 text-xs bg-white dark:bg-[#161c18] focus:border-emerald-500 focus:outline-none"
                          aria-label={`${c.labelAr} — اليسار`}
                        />
                      </td>
                      <td className="p-2">
                        <input
                          value={tableAnswers[`${c.id}_R`] ?? ''}
                          onChange={(e) => setAnswer(blockIdx, `${c.id}_R`, e.target.value)}
                          disabled={session.validatedBlocks[blockIdx]}
                          className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-2 py-1 text-xs bg-white dark:bg-[#161c18] focus:border-emerald-500 focus:outline-none"
                          aria-label={`${c.labelAr} — اليمين`}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div>
              <label className="block text-xs font-black mb-1">{b.conclusionPromptAr}</label>
              <textarea
                value={answers[blockIdx]?.['conclusion'] ?? ''}
                onChange={(e) => setAnswer(blockIdx, 'conclusion', e.target.value)}
                disabled={session.validatedBlocks[blockIdx]}
                rows={2}
                className="w-full border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-2 text-sm bg-white dark:bg-[#161c18] focus:border-emerald-500 focus:outline-none resize-y"
              />
            </div>
            <button
              onClick={() => {
                const missing: string[] = [];
                b.criteria.forEach((c) => {
                  const l = tableAnswers[`${c.id}_L`] ?? '';
                  const r = tableAnswers[`${c.id}_R`] ?? '';
                  if (!c.leftExpected.every((k) => keywordHit(l, k))) missing.push(`${c.labelAr} (يسار)`);
                  if (!c.rightExpected.every((k) => keywordHit(r, k))) missing.push(`${c.labelAr} (يمين)`);
                });
                const conclOk = b.conclusionKeywords.every((k) => keywordHit(answers[blockIdx]?.['conclusion'] ?? '', k));
                if (missing.length === 0 && conclOk) {
                  passBlock({ passed: true, feedbackAr: b.summaryAr });
                } else {
                  setOutcomes((p) => ({ ...p, [blockIdx]: { passed: false, feedbackAr: missing.length > 0 ? `أكمل الجدول: ${missing.join(' · ')}` : 'الخلاصة غير مكتملة.' } }));
                }
              }}
              disabled={session.validatedBlocks[blockIdx]}
              className="px-4 py-2 rounded-xl font-black text-sm bg-[#006d37] hover:bg-[#00562b] text-white disabled:opacity-40"
            >
              تحقّق من الجدول
            </button>
            {result && (
              <p className={`text-xs font-bold ${result.passed ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>{result.feedbackAr}</p>
            )}
          </div>
        );
      }

      case 'SEQUENCE_ORDER': {
        const result = outcomes[blockIdx];
        const picked = orderedSteps[blockIdx] ?? [];
        const remaining = b.steps.filter((s) => !picked.includes(s.id));
        return (
          <div className="space-y-4">
            <p className="text-sm font-black">{b.promptAr}</p>
            {b.assetSrc && (
              <figure className="rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-white">
                <img src={b.assetSrc} alt={b.altAr ?? ''} className="w-full max-h-72 object-contain" />
              </figure>
            )}
            <ol className="space-y-2">
              {picked.map((sid) => {
                const s = b.steps.find((x) => x.id === sid)!;
                return (
                  <li key={sid} className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-sm font-bold flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#006d37] text-white flex items-center justify-center text-xs font-black shrink-0">{picked.indexOf(sid) + 1}</span>
                    {s.labelAr}
                  </li>
                );
              })}
            </ol>
            {remaining.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {remaining.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setOrderedSteps((p) => ({ ...p, [blockIdx]: [...(p[blockIdx] ?? []), s.id] }))}
                    disabled={session.validatedBlocks[blockIdx]}
                    className="px-3 py-2 rounded-xl text-xs font-bold border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#161c18] hover:border-emerald-400"
                  >
                    + {s.labelAr}
                  </button>
                ))}
              </div>
            )}
            <button
              onClick={() => {
                const correct = picked.every((sid, i) => b.steps.find((s) => s.id === sid)?.expectedOrder === i + 1);
                const summaryOk = b.summaryKeywords.every((k) => keywordHit(answers[blockIdx]?.['summary'] ?? '', k));
                if (correct && picked.length === b.steps.length && summaryOk) {
                  passBlock({ passed: true, feedbackAr: b.summaryAr });
                } else {
                  setOutcomes((p) => ({ ...p, [blockIdx]: { passed: false, feedbackAr: !correct || picked.length !== b.steps.length ? 'الترتيب غير صحيح بعد. راجع التسلسل المنطقي.' : 'الخلاصة ناقصة.' } }));
                }
              }}
              disabled={session.validatedBlocks[blockIdx]}
              className="px-4 py-2 rounded-xl font-black text-sm bg-[#006d37] hover:bg-[#00562b] text-white disabled:opacity-40"
            >
              تحقّق من الترتيب
            </button>
            <div>
              <label className="block text-xs font-black mb-1">{b.summaryPromptAr}</label>
              <textarea
                value={answers[blockIdx]?.['summary'] ?? ''}
                onChange={(e) => setAnswer(blockIdx, 'summary', e.target.value)}
                disabled={session.validatedBlocks[blockIdx]}
                rows={2}
                className="w-full border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-2 text-sm bg-white dark:bg-[#161c18] focus:border-emerald-500 focus:outline-none resize-y"
              />
            </div>
            {result && (
              <p className={`text-xs font-bold ${result.passed ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>{result.feedbackAr}</p>
            )}
          </div>
        );
      }

      case 'REASONING_COUNT': {
        const result = outcomes[blockIdx];
        const chosenOpt = selectedChoice[blockIdx];
        return (
          <div className="space-y-4">
            <p className="text-sm font-black">{b.promptAr}</p>
            {b.assetSrc && (
              <figure className="rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-white">
                <img src={b.assetSrc} alt={b.altAr ?? ''} className="w-full max-h-72 object-contain" />
              </figure>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {b.options.map((o, oi) => (
                <button
                  key={oi}
                  onClick={() => {
                    setSelectedChoice((p) => ({ ...p, [blockIdx]: String(oi) }));
                  }}
                  disabled={session.validatedBlocks[blockIdx]}
                  className={`p-4 rounded-2xl border text-center transition-all ${
                    chosenOpt === String(oi)
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 shadow-md'
                      : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-[#161c18] hover:border-emerald-400'
                  }`}
                >
                  <span className="block text-2xl font-black text-[#006d37]">{o.combinations}</span>
                  <span className="block text-xs font-bold text-gray-500 mt-1">الرموز: {o.symbolCount}</span>
                </button>
              ))}
            </div>
            <div>
              <label className="block text-xs font-black mb-1">{b.rationalePromptAr}</label>
              <textarea
                value={answers[blockIdx]?.['rationale'] ?? ''}
                onChange={(e) => setAnswer(blockIdx, 'rationale', e.target.value)}
                disabled={session.validatedBlocks[blockIdx]}
                rows={2}
                className="w-full border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-2 text-sm bg-white dark:bg-[#161c18] focus:border-emerald-500 focus:outline-none resize-y"
              />
            </div>
            <button
              onClick={() => {
                const optOk = chosenOpt !== undefined && b.options[Number(chosenOpt)]?.isCorrect === true;
                const ratOk = b.rationaleKeywords.every((k) => keywordHit(answers[blockIdx]?.['rationale'] ?? '', k));
                if (optOk && ratOk) {
                  passBlock({ passed: true, feedbackAr: b.summaryAr });
                } else {
                  setOutcomes((p) => ({ ...p, [blockIdx]: { passed: false, feedbackAr: !optOk ? 'العدد المختار غير صحيح. أعد التفكير في التركيبات الممكنة.' : 'التعليل غير مكتمل.' } }));
                }
              }}
              disabled={session.validatedBlocks[blockIdx]}
              className="px-4 py-2 rounded-xl font-black text-sm bg-[#006d37] hover:bg-[#00562b] text-white disabled:opacity-40"
            >
              تحقّق
            </button>
            {result && (
              <p className={`text-xs font-bold ${result.passed ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>{result.feedbackAr}</p>
            )}
          </div>
        );
      }
    }
  };

  // ----- Rendu principal -----
  return (
    <div dir="rtl" className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
        >
          <span>→</span>
          <span>عودة إلى قائمة الدروس النشيطة</span>
        </button>
        {session.state === 'COMPLETION_VISIBLE' && onNext && (
          <button
            onClick={onNext}
            className="px-4 py-2 rounded-xl font-bold text-sm bg-[#006d37] hover:bg-[#00562b] text-white shadow-md transition-all"
          >
            الدرس الموالي ← {nextTitleAr}
          </button>
        )}
      </div>

      <div className="bg-gradient-to-l from-[#006d37] via-[#008744] to-[#10b981] text-white p-5 rounded-3xl shadow-lg">
        <h2 className="text-xl md:text-2xl font-black">{lesson.title}</h2>
        <div className="mt-2 flex items-center gap-2">
          <div className="flex-1 h-2 bg-white/25 rounded-full overflow-hidden">
            <div className="h-full bg-white rounded-full transition-all" style={{ width: `${(validatedCount / Math.max(total, 1)) * 100}%` }} />
          </div>
          <span className="text-xs font-black">{validatedCount}/{total}</span>
        </div>
      </div>

      {session.state === 'MISSION_VISIBLE' && (
        <div className="bg-white dark:bg-[#161c18] rounded-3xl p-6 border border-gray-200 dark:border-gray-800 text-center space-y-4">
          <p className="text-4xl">🚀</p>
          <h3 className="text-lg font-black">مهمة الدرس</h3>
          <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1 text-right max-w-md mx-auto">
            {blocks.map((b, i) => (
              <li key={i} className="flex items-start gap-2">
                <Info className="w-4 h-4 mt-0.5 text-[#006d37] shrink-0" />
                {b.objective}
              </li>
            ))}
          </ul>
          <button
            onClick={() => dispatch({ type: 'START_LESSON' })}
            className="px-6 py-3 rounded-2xl font-black text-sm bg-[#006d37] hover:bg-[#00562b] text-white shadow-md"
          >
            ابدأ الدرس النشيط
          </button>
        </div>
      )}

      {(session.state === 'BLOCKS_IN_PROGRESS' || session.state === 'EXIT_PRACTICE' || session.state === 'SESSION_SUSPENDED') && block && (
        <div className="bg-white dark:bg-[#161c18] rounded-3xl p-5 border border-gray-200 dark:border-gray-800 space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            {blocks.map((_, i) => (
              <span
                key={i}
                className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black ${
                  session.validatedBlocks[i]
                    ? 'bg-[#006d37] text-white'
                    : i === idx
                      ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border-2 border-amber-400'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                }`}
              >
                {session.validatedBlocks[i] ? '✓' : i + 1}
              </span>
            ))}
          </div>
          <p className="text-xs font-black text-[#506072]">🎯 {block.objective}</p>
          {renderBlock(block, idx)}
          {session.state === 'SESSION_SUSPENDED' && (
            <button
              onClick={() =>
                dispatch({
                  type: 'RESUME_SESSION',
                  currentBlockIndex: session.currentBlockIndex,
                  validatedBlocks: session.validatedBlocks,
                })
              }
              className="px-4 py-2 rounded-xl font-black text-sm bg-amber-600 hover:bg-amber-700 text-white"
            >
              متابعة من حيث توقفت
            </button>
          )}
        </div>
      )}

      {session.state === 'EXIT_PRACTICE' && (
        <div className="bg-white dark:bg-[#161c18] rounded-3xl p-6 border border-gray-200 dark:border-gray-800 text-center space-y-3">
          <p className="text-3xl">🏁</p>
          <p className="text-sm font-black">أنهيت جميع محطات الدرس. ما مستوى إتقانك؟</p>
          <div className="flex justify-center gap-2 flex-wrap">
            <button
              onClick={() => dispatch({ type: 'SET_OUTCOME', outcome: 'passed' })}
              className="px-4 py-2 rounded-xl font-black text-sm bg-[#006d37] hover:bg-[#00562b] text-white"
            >
              أتقنت جيداً
            </button>
            <button
              onClick={() => dispatch({ type: 'SET_OUTCOME', outcome: 'doc_only' })}
              className="px-4 py-2 rounded-xl font-black text-sm bg-emerald-100 dark:bg-emerald-900/40 text-[#006d37] hover:bg-emerald-200"
            >
              أتقنت بالوثيقة فقط
            </button>
            <button
              onClick={() => dispatch({ type: 'SET_OUTCOME', outcome: 'failed' })}
              className="px-4 py-2 rounded-xl font-black text-sm bg-amber-100 dark:bg-amber-900/40 text-amber-700 hover:bg-amber-200"
            >
              لم أتقن بعد
            </button>
          </div>
        </div>
      )}

      {session.state === 'COMPLETION_VISIBLE' && (
        <div className="bg-emerald-50 dark:bg-emerald-950/20 rounded-3xl p-6 border border-emerald-200 dark:border-emerald-800 text-center space-y-3">
          <p className="text-3xl">
            {session.outcome === 'passed' ? '🏆' : session.outcome === 'doc_only' ? '📗' : '💪'}
          </p>
          <p className="text-sm font-black leading-relaxed">
            {progression?.completionMessageAr ?? 'أحسنت! لقد أنهيت هذا الدرس النشيط.'}
          </p>
          {onNext && (
            <button
              onClick={onNext}
              className="px-6 py-3 rounded-2xl font-black text-sm bg-[#006d37] hover:bg-[#00562b] text-white shadow-md"
            >
              الدرس الموالي ← {nextTitleAr}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
