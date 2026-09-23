import { motion } from 'motion/react';
import {
  AlertTriangle, Award, CheckCircle2, Cpu, Key, Layers, RotateCcw, ShieldAlert, X,
} from 'lucide-react';
import {
  ERROR_TAXONOMY, STEP_NAMES_AR, getVerbCardV2,
  detectExistenceGate, detectSourceKind, classifyConclusion,
} from '../data/methodologyEngine';
import type { Movement } from '../data/methodologyEngine';
import type { ScoreReport, StepLine } from '../utils/methodologyScorer';
import { evaluatePhase2, remediationTargets } from '../utils/phase2';
import type { MethodologyLetterReport } from '../utils/methodologyToLetter';
import type { TrainingExercise } from '../data/methodologyEngine';
import { TONE, switchTone, swAr, icmLabel, icmLabelFr } from './methodologyShared';
import type { ToneKey } from './methodologyShared';

interface ScoreReportPanelProps {
  scoreReport: ScoreReport;
  letterReport: MethodologyLetterReport | null;
  examMode: boolean;
  freeReview: boolean;
  selfScore: string;
  currentStage: 1 | 2 | 3 | 4;
  currentExercise: TrainingExercise | null;
  currentVerb: { verbAr: string };
  selectedVerbId: string;
  sourceGate: 'paper' | 'memory' | null;
  gate2Choice: 'document' | 'mixed' | null;
  gate3Choice: Movement | null;
  studentText: string;
  step0Text: string;
  handleSelectStage: (stage: 1 | 2 | 3 | 4) => void;
  setCurrentStage: (s: 1 | 2 | 3 | 4) => void;
  setHighlightedSteps: (
    v: Record<number, boolean> | ((p: Record<number, boolean>) => Record<number, boolean>),
  ) => void;
  setShowSourceGate: (v: boolean) => void;
  setShowSwitchGate: (v: boolean) => void;
}

export default function ScoreReportPanel({
  scoreReport, letterReport, examMode, freeReview, selfScore, currentStage,
  currentExercise, currentVerb, selectedVerbId, sourceGate, gate2Choice, gate3Choice,
  studentText, step0Text, handleSelectStage, setCurrentStage, setHighlightedSteps,
  setShowSourceGate, setShowSwitchGate,
}: ScoreReportPanelProps) {

  return (
<>
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-[#161c18] p-6 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-xl space-y-6"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-5">
                <div>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">تقرير التدقيق المنهجي</span>
                  <h3 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                    <Award className="w-6 h-6 text-amber-500" />
                    <span>مؤشر المطابقة المنهجية (ICM)</span>
                  </h3>
                </div>

                <div className="flex items-center gap-3">
                  {/* Grille de lettres — verdict officiel (statuts → lettre, jamais un % converti).
                      Stage 3/4 uniquement : une complétion (stage 2) n'est pas une copie. */}
                  {letterReport && (
                    <div className="px-5 py-2.5 rounded-2xl bg-[#006d37] text-white text-center font-black shadow-md min-w-[120px]">
                      <span className="text-3xl md:text-4xl block leading-none tracking-tight">{letterReport.display.overall}</span>
                      <span className="text-[10px] uppercase opacity-90 block mt-1">التقييم الرسمي — الحروف</span>
                    </div>
                  )}
                  <div className={`px-5 py-2.5 rounded-2xl text-center font-black ${
                    scoreReport.icm >= 90
                      ? 'bg-emerald-500 text-white'
                      : scoreReport.icm >= 60
                      ? 'bg-amber-500 text-white'
                      : 'bg-red-500 text-white'
                  }`}>
                    <span className="text-2xl md:text-3xl block leading-none">{scoreReport.icm}%</span>
                    <span className="text-[10px] uppercase">معدل ICM · {icmLabel(scoreReport.icm)} <span className="latin opacity-80">({icmLabelFr(scoreReport.icm)})</span></span>
                  </div>
                </div>
              </div>

              {/* Grille de lettres — 3 lignes pour l'élève (المنهجية / العلم / العام) + next step */}
              {letterReport && (
                <div dir="rtl" className="p-4 rounded-2xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-800 space-y-2">
                  <div className="flex items-center gap-2 font-black text-sm text-gray-800 dark:text-gray-100">
                    <Award className="w-4 h-4 text-amber-500" />
                    <span>شبكة الحروف — الحكم الرسمي على الشكل</span>
                  </div>
                  {letterReport.display.lines.map((line, i) => (
                    <div key={i} className={`text-sm font-bold ${i === 2 ? 'text-[#006d37] dark:text-emerald-400' : 'text-gray-800 dark:text-gray-200'}`}>
                      {line}
                    </div>
                  ))}
                  {letterReport.letters.nextStepAr && (
                    <div className="pt-2 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-600 dark:text-gray-400 font-medium leading-relaxed">
                      {letterReport.letters.nextStepAr}
                    </div>
                  )}
                  <div className="text-[10px] text-gray-400 font-medium">
                    ملاحظة: هذه ليست علامة بكالوريا رسمية — الشكل يقيمه المحرك، والمضمون العلمي يقرره الأستاذ في «المصححة».
                  </div>
                </div>
              )}

              {/* Phase 2 — verdict « forme validée » (audit §3.3) : les 3 portes, jamais le fond */}
              {/* Ligne 7 — mode examen : le score auto par tags, la note réelle humaine est la référence */}
              {examMode && (() => {
                const steps = scoreReport.stepReport.filter(l => l.applicable);
                const passed = steps.filter(l => l.passed).length;
                return (
                  <div className="p-4 rounded-2xl bg-slate-900 dark:bg-black/70 border border-slate-700 text-white space-y-1.5">
                    <div className="flex items-center gap-2 font-black text-sm">📝 ورقة الامتحان — النتيجة الآلية</div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-bold">
                      <span>ICM الشكل: {scoreReport.icm}/100</span>
                      <span>الخطوات: {passed}/{steps.length}</span>
                      {scoreReport.detectedErrors.length > 0 && (
                        <span className="text-red-300">الأخطاء: {scoreReport.detectedErrors.map(e => e.tag).join(' · ')}</span>
                      )}
                      {selfScore !== '' && <span className="text-sky-300">توقعك: {selfScore}/20</span>}
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      في الامتحان لا إعادة: النتيجة هي الحكم، والدرس في المعايرة — النقطة الفعلية /20 يضيفها الأستاذ في «المصححة»، وسيظهر لك العبر.
                    </p>
                  </div>
                );
              })()}

              {(() => {
                const q = currentExercise?.question ?? '';
                const cardV2 = getVerbCardV2(selectedVerbId);
                const expExistence = detectExistenceGate(q);
                const expSource = expExistence === 'lock' ? (detectSourceKind(q) ?? 'document') : null;
                const expMovement: Movement | null = expExistence === 'lock' ? (cardV2 && cardV2.movement !== 'drawer' ? cardV2.movement : 'photo') : null;
                const gatesActive = currentStage === 3 && !freeReview;
                const existenceOk = gatesActive && sourceGate ? ((sourceGate === 'paper' ? 'lock' : 'no_lock') === expExistence) : null;
                const sourceOk = gatesActive && sourceGate === 'paper' ? (gate2Choice && expSource ? gate2Choice === expSource : null) : null;
                const movementOk = gatesActive && sourceGate === 'paper' ? (gate3Choice && expMovement ? gate3Choice === expMovement : null) : null;
                const v = evaluatePhase2({
                  existenceGateOk: existenceOk,
                  sourceGateOk: sourceOk,
                  movementGateOk: movementOk,
                  icm: scoreReport.icm,
                  typicalErrorViolated: scoreReport.switchLine.violated,
                });
                return (
                  <div className={`p-4 rounded-2xl border flex items-start gap-3 ${v.formeValidee ? 'bg-sky-50 dark:bg-sky-950/30 border-sky-200 dark:border-sky-800/60' : 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/60'}`}>
                    <ShieldAlert className={`w-5 h-5 shrink-0 mt-0.5 ${v.formeValidee ? 'text-sky-600 dark:text-sky-400' : 'text-amber-600 dark:text-amber-400'}`} />
                    <div className="flex-1">
                      <h4 className={`font-black text-sm ${v.formeValidee ? 'text-sky-900 dark:text-sky-300' : 'text-amber-900 dark:text-amber-300'}`}>الحكم الآلي — {v.formeValidee ? 'الشكل مُتحقَّق منه' : 'الشكل ناقص'}</h4>
                      <p className={`text-xs md:text-sm font-medium mt-0.5 ${v.formeValidee ? 'text-sky-800 dark:text-sky-400' : 'text-amber-800 dark:text-amber-400'}`}>{v.messageAr}</p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {v.gates.map(g => (
                          <span key={g.id} className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${g.passed === null ? 'bg-gray-100 dark:bg-gray-800/50 text-gray-400 border-gray-200 dark:border-gray-700' : g.passed ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60' : 'bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800/60'}`}>{g.passed === null ? '—' : g.passed ? '✓' : '✗'} {g.labelAr}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Renvoi ciblé (audit §3.7) : micro-2a sur la sous-étape en défaut, pas la re-Phase-2 */}
              {currentStage < 4 && (() => {
                const targets = remediationTargets(scoreReport.stepReport);
                if (targets.length === 0) return null;
                return (
                  <div className="bg-red-50 dark:bg-red-950/30 p-4 rounded-2xl border border-red-200 dark:border-red-800/60 space-y-2">
                    <div className="flex items-start gap-3">
                      <RotateCcw className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-black text-sm text-red-900 dark:text-red-300">الرجوع المستهدف — إكمال 2a مصغّر</h4>
                        <p className="text-xs text-red-800 dark:text-red-400 font-medium mt-0.5">لا إعادة المرحلة 2 كاملة: نعكف فقط على الخطوة الناقصة في النموذج، ثم نعود للإنتاج.</p>
                        <div className="mt-1.5 space-y-1">
                          {targets.map(t => (
                            <div key={t.step} className="text-xs font-bold text-red-900 dark:text-red-300 flex items-start gap-1.5">
                              <span className="shrink-0">الخطوة {t.step}:</span>
                              <span className="font-medium">{t.remedyAr ?? 'راجع نموذج هذه الخطوة ثم أعد كتابتها.'}</span>
                            </div>
                          ))}
                        </div>
                        {examMode ? (
                          <p className="text-[11px] font-bold text-red-900 dark:text-red-300 bg-white dark:bg-black/30 rounded-lg p-2">في الامتحان لا إعادة: النتيجة هي الحكم، والدرس في المعايرة — أضف نقطتك الفعلية في «المصححة».</p>
                        ) : (
                        <div className="flex flex-wrap gap-2 mt-2">
                          <button onClick={()=>{
                            setCurrentStage(1);
                            setHighlightedSteps(Object.fromEntries(scoreReport.stepReport.filter(l=>l.applicable && !l.passed).map(l=>[l.step, true])));
                            setShowSourceGate(false);
                            setShowSwitchGate(false);
                          }} className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs">🔁 إعادة الخطوات الناقصة (النموذج)</button>
                          <button onClick={()=> setCurrentStage(3)} className="px-3 py-1.5 bg-white dark:bg-black/30 text-red-700 dark:text-red-300 rounded-xl font-bold text-xs border border-red-200 dark:border-red-800/60">العودة للإنتاج</button>
                        </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Pedagogical Decision Engine Result */}
              <div className="bg-emerald-50 dark:bg-emerald-950/30 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 flex items-start gap-3">
                <Cpu className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-black text-sm text-emerald-900 dark:text-emerald-300">قرار محرك التوجيه البيداغوجي:</h4>
                  <p className="text-xs md:text-sm text-emerald-800 dark:text-emerald-400 font-medium mt-0.5">
                    {scoreReport.pedagogicalDecisionAr}
                  </p>
                  {scoreReport.nextPedagogicalStage !== currentStage && (
                    <button
                      onClick={() => handleSelectStage(scoreReport.nextPedagogicalStage)}
                      className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-[#006d37] hover:bg-[#00562b] text-white rounded-xl text-xs font-black shadow-sm"
                    >
                      الانتقال إلى المرحلة {scoreReport.nextPedagogicalStage} الآن
                    </button>
                  )}
                </div>
              </div>

              {/* 🔑 Ligne interrupteur */}
              {scoreReport.switchLine && (() => {
                const s = scoreReport.switchLine;
                return (
                  <div dir="rtl" className={`p-4 rounded-2xl border text-sm space-y-2 ${TONE[switchTone(s)]}`}>
                    <div className="flex items-center gap-2 font-bold">
                      <Key className="w-4 h-4" />
                      <span>المفتاح</span>
                      <span className="mx-1 text-gray-400">·</span>
                      <span>الفعل: <span className="font-black">{swAr(s.truth)}</span></span>
                      <span className="text-xs font-normal opacity-70">
                        {s.truth === 'open' ? '— «لأنّ» مطلوبة' : '— لا «لأنّ»'}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 flex-wrap text-xs">
                      {s.choice !== null && (
                        <span>
                          اختيارك: <span className="font-black">{swAr(s.choice)}</span>{' '}
                          <span className="font-bold">{s.choiceCorrect ? '✓' : '✗'}</span>
                        </span>
                      )}
                      <span className="font-bold">
                        {s.violated ? `✗ ${ERROR_TAXONOMY[s.truth === 'closed' ? 'premature_interpretation' : 'unsupported_claim'].nameAr}`
                                    : '✓ احترمتَ الفعل'}
                      </span>
                    </div>
                    {s.remedyAr && (
                      <div className="pt-1 border-t border-current/10 font-bold">
                        الدواء: <span className="font-normal">{s.remedyAr}</span>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Les 4 étapes */}
              <div dir="rtl" className="space-y-2">
                <h4 className="font-bold text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Layers className="w-4 h-4" />
                  <span>الخطوات الأربع</span>
                </h4>
                <div className="grid grid-cols-4 gap-2">
                  {scoreReport.stepReport.map((sl: StepLine) => {
                    const tone: ToneKey = !sl.applicable ? 'muted' : sl.passed ? 'emerald' : 'red';
                    const isSwitchStep = sl.step === 3;
                    const truth = scoreReport.switchLine.truth;
                    return (
                      <div key={sl.step} className={`p-3 rounded-xl border text-center text-xs ${TONE[tone]}`}>
                        <div className="font-black text-lg leading-none">{sl.step}</div>
                        <div className="font-bold text-sm mt-1">{STEP_NAMES_AR[sl.step]}</div>
                        {isSwitchStep && (
                          <div className={`mt-1 inline-block px-1.5 rounded text-[10px] font-bold ${
                            truth === 'open' ? 'bg-emerald-200/60 dark:bg-emerald-900/60' : 'bg-gray-200/80 dark:bg-gray-700 line-through'
                          }`}>
                            «لأنّ»
                          </div>
                        )}
                        <div className="mt-1 font-bold text-[11px]">
                          {!sl.applicable ? 'لا تُكتب هنا' : sl.passed ? '✓' : '✗'}
                        </div>
                        {sl.errorTags.length > 0 && (
                          <div className="mt-1 space-y-0.5 text-[11px]">
                            {sl.errorTags.map(tag => (
                              <div key={tag} className="bg-red-200/60 dark:bg-red-900/60 px-1 rounded">
                                {ERROR_TAXONOMY[tag]?.nameAr ?? 'ملاحظة منهجية'}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                {(() => {
                  const first = scoreReport.stepReport.find(s => s.applicable && !s.passed && s.remedyAr);
                  return first ? (
                    <div className="p-3 rounded-xl bg-white dark:bg-gray-900 border text-sm">
                      <span className="font-bold">ابدأ بالخطوة {first.step} ({STEP_NAMES_AR[first.step]}) : </span>
                      {first.remedyAr}
                    </div>
                  ) : null;
                })()}
                {/* V3.1 عام/خاص helper */}
                {(() => {
                  const lastSentence = studentText.split(/[\.!؟\n]/).filter(Boolean).pop() || '';
                  const cls = classifyConclusion(lastSentence, step0Text || '');
                  return (
                    <div className="p-3 rounded-xl bg-sky-50 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-900/40 text-xs">
                      <span className="font-black">الهدف العام 0 + الخاتمة — عام أم خاص؟</span>
                      <span className="mx-2 px-2 py-0.5 rounded-full bg-white dark:bg-black/20 border text-[11px] font-bold">{cls === 'generic' ? 'عام (يعيد الهدف)' : cls === 'specific' ? 'خاص (يجيب المطلوب)' : 'غير مصنّف'}</span>
                      <span className="text-[11px] text-gray-600 dark:text-gray-400">— إن كانت «خاص» بلا سند من الوثيقة فهي تهويل</span>
                    </div>
                  );
                })()}
              </div>

              {/* M6 · couche enseignant repliée : critères + erreurs sous « التفاصيل » */}
              <details className="bg-gray-50 dark:bg-black/20 rounded-2xl border border-gray-200 dark:border-gray-800 px-4 py-3">
                <summary className="font-bold text-sm text-gray-700 dark:text-gray-300 cursor-pointer">التفاصيل</summary>
                <div className="pt-3 space-y-6">
              {/* Criteria hits list */}
              <div className="space-y-3">
                <h4 className="font-bold text-sm text-gray-700 dark:text-gray-300">تدقيق معايير الفعل ({currentVerb.verbAr}):</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {scoreReport.criteriaResults.map(res => (
                    <div
                      key={res.criterionId}
                      className={`p-3.5 rounded-xl border text-xs flex items-start justify-between gap-3 ${
                        res.passed
                          ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40 text-emerald-900 dark:text-emerald-200'
                          : 'bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-900/40 text-red-900 dark:text-red-200'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 font-bold">
                          {res.passed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          ) : (
                            <X className="w-4 h-4 text-red-600 shrink-0" />
                          )}
                          <span>{res.label}</span>
                        </div>
                        <p className="text-[11px] text-gray-600 dark:text-gray-400">{res.feedback}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Detected Errors & Counter-actions */}
              {scoreReport.detectedErrors.length > 0 && (
                <div className="space-y-3 pt-2">
                  <h4 className="font-bold text-sm text-red-700 dark:text-red-400 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    <span>الأخطاء المنهجية المرصودة وخطة التصحيح الفوري:</span>
                  </h4>
                  <div className="space-y-2">
                    {scoreReport.detectedErrors.map((err, idx) => (
                      <div key={idx} className="p-4 bg-red-50 dark:bg-red-950/20 rounded-xl border border-red-200 dark:border-red-900/40 text-xs space-y-1">
                        <div className="flex items-center justify-between font-bold text-red-800 dark:text-red-300">
                          <span>{err.nameAr}</span>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300">{err.descriptionAr}</p>
                        <div className="pt-1 text-emerald-700 dark:text-emerald-400 font-bold">
                          <span>الإجراء العلاجي المطلوب: </span>
                          <span>{err.counterActionAr}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
                </div>
              </details>

            </motion.div>
</>
  );
}
