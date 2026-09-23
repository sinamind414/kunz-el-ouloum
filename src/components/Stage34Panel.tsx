import { Check, ChevronDown, Clock, Compass, FileText, RotateCcw, Sparkles } from 'lucide-react';
import { MEMORY_TEMPLATES } from '../data/methodologyEngine';
import type { SourceGate, TrainingExercise } from '../data/methodologyEngine';
import { TIME_RULES } from '../data/boussoleData';

interface Stage34PanelProps {
  currentExercise: TrainingExercise | null;
  currentStage: 1 | 2 | 3 | 4;
  currentVerb: {
    verbAr: string;
    goal: string;
    structureSteps: string[];
    requiredConnectors: string[];
    goodExample: { answer: string };
    criteria: Array<{ id: string; wording: { compass: string; probe: string } }>;
  };
  gateOpen: boolean;
  isDual: boolean;
  sourceGate: SourceGate | null;
  refCardOpen: boolean;
  setRefCardOpen: (v: boolean | ((o: boolean) => boolean)) => void;
  draftVerb: string;
  setDraftVerb: (v: string) => void;
  draftSteps: string;
  setDraftSteps: (v: string) => void;
  draftFinalSentence: string;
  setDraftFinalSentence: (v: string) => void;
  isDraftCompleted: boolean;
  setIsDraftCompleted: (v: boolean | ((b: boolean) => boolean)) => void;
  studentText: string;
  setStudentText: (v: string) => void;
  editorPlaceholder: string;
  selfScore: string;
  setSelfScore: (v: string) => void;
  selectedEvidenceForCriterion: Record<string, boolean>;
  setSelectedEvidenceForCriterion: (
    v: Record<string, boolean> | ((p: Record<string, boolean>) => Record<string, boolean>),
  ) => void;
  timerSeconds: number;
  isDev: boolean;
  handleResetExercise: () => void;
  handleSubmitProduction: () => void;
}

export default function Stage34Panel({
  currentExercise, currentStage, currentVerb, gateOpen, isDual, sourceGate,
  refCardOpen, setRefCardOpen, draftVerb, setDraftVerb, draftSteps, setDraftSteps,
  draftFinalSentence, setDraftFinalSentence, isDraftCompleted, setIsDraftCompleted,
  studentText, setStudentText, editorPlaceholder, selfScore, setSelfScore,
  selectedEvidenceForCriterion, setSelectedEvidenceForCriterion, timerSeconds,
  isDev, handleResetExercise, handleSubmitProduction,
}: Stage34PanelProps) {

  return (
<>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Main Writing Area (8 cols on lg) */}
              <div className="lg:col-span-8 space-y-4">
                
                {/* Stage 4 Special Banner: 90s Draft + Timer */}
                {currentStage === 4 && (
                  <div className="bg-gradient-to-r from-red-600 to-amber-600 text-white p-4 rounded-2xl shadow-md space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 animate-pulse" />
                        <span className="font-black text-sm">محاكاة البكالوريا (توقيت رسمي)</span>
                      </div>
                      <div className="font-mono text-xl font-black bg-black/30 px-3 py-1 rounded-xl">
                        {Math.floor(timerSeconds / 60)}:{(timerSeconds % 60).toString().padStart(2, '0')}
                      </div>
                    </div>

                    {/* Phase 3 — carte-référence : rédaction libre avec la carte à portée de main */}
                    <div className="bg-white/10 backdrop-blur-sm p-3.5 rounded-xl border border-white/20 text-xs space-y-2">
                      <button onClick={()=> setRefCardOpen(o=>!o)} className="w-full flex items-center justify-between font-bold text-white">
                        <span>📇 البطاقة — مرجع حر (افتحها في أي لحظة)</span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${refCardOpen ? 'rotate-180' : ''}`} />
                      </button>
                      {refCardOpen && (
                        <div className="space-y-1.5 pt-1 border-t border-white/15">
                          <div className="font-bold text-emerald-300">{currentVerb.verbAr} — {currentVerb.goal}</div>
                          {currentVerb.structureSteps.map((st, i) => (
                            <div key={i} className="text-white/80 leading-relaxed">• {st}</div>
                          ))}
                          <div className="pt-1 text-white/70"><span className="font-bold text-amber-300">الروابط:</span> {currentVerb.requiredConnectors.join(' · ')}</div>
                          <details className="pt-1">
                            <summary className="cursor-pointer font-bold text-white/70">المثال النموذجي</summary>
                            <p className="mt-1 text-white/60 whitespace-pre-line">{currentVerb.goodExample.answer}</p>
                          </details>
                        </div>
                      )}
                    </div>

                    {/* Compulsory 90s Draft Accordion */}
                    <div className="bg-white/10 backdrop-blur-sm p-3.5 rounded-xl border border-white/20 text-xs space-y-2">
                      <div className="flex items-center justify-between font-bold">
                        <span>مخطط المسودة الإلزامي (تقنية الـ 90 ثانية في البكالوريا)</span>
                        <span className={isDraftCompleted ? 'text-emerald-300 font-bold' : 'text-amber-200'}>
                          {isDraftCompleted ? '✓ مسودة مكتملة' : 'مطلوب للمحاكاة'}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <input
                          type="text"
                          value={draftVerb}
                          onChange={(e) => setDraftVerb(e.target.value)}
                          placeholder="الفعل المحدد (مثلاً: حَلل)"
                          className="bg-black/20 border border-white/20 rounded-lg p-2 text-white placeholder-white/60 text-xs outline-none"
                        />
                        <input
                          type="text"
                          value={draftSteps}
                          onChange={(e) => setDraftSteps(e.target.value)}
                          placeholder="المطلوب (≤ 5 كلمات)"
                          className="bg-black/20 border border-white/20 rounded-lg p-2 text-white placeholder-white/60 text-xs outline-none"
                        />
                        <input
                          type="text"
                          value={draftFinalSentence}
                          onChange={(e) => {
                            setDraftFinalSentence(e.target.value);
                            if (draftVerb && draftSteps && e.target.value) setIsDraftCompleted(true);
                          }}
                          placeholder="الخاتمة المتوقعة"
                          className="bg-black/20 border border-white/20 rounded-lg p-2 text-white placeholder-white/60 text-xs outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Dual note V3.1 */}
                {isDual && sourceGate==='paper' && (
                  <div className="bg-emerald-50 dark:bg-emerald-950/20 p-3 rounded-xl border border-emerald-200 dark:border-emerald-900/40 text-xs">
                    <span className="font-black">ورقة بعمودين — «معلوماتك + الوثيقة»:</span>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      <span className="bg-white dark:bg-black/20 p-2 rounded border">من الوثيقة: قيمة + وحدة</span>
                      <span className="bg-white dark:bg-black/20 p-2 rounded border">من الدرس: آلية/مكتسب</span>
                    </div>
                  </div>
                )}
                {sourceGate==='memory' && (
                  <div className="bg-amber-50 dark:bg-amber-950/20 p-3 rounded-xl border border-amber-200 dark:border-amber-900/40 text-xs">
                    <span className="font-black">🧠 وضع حفظ — لا خاتمة بعد حُجة، بل جملة نجاة:</span>
                    <div className="mt-1 font-medium text-amber-900 dark:text-amber-200">{MEMORY_TEMPLATES.define.ar} — {MEMORY_TEMPLATES.list.ar.split('ـ').slice(0,2).join(' · ')}…</div>
                  </div>
                )}
                {/* Text Area */}
                <div className="bg-white dark:bg-[#161c18] p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="font-black text-sm text-gray-900 dark:text-white flex items-center gap-2">
                      <FileText className="w-4 h-4 text-emerald-600" />
                      <span>محرر الإجابة النموذجية المكتوبة:</span>
                    </label>
                    <span className="text-xs font-bold text-gray-400">
                      {studentText.split(/\s+/).filter(Boolean).length} كلمة
                    </span>
                  </div>

                  <textarea
                    rows={8}
                    value={studentText}
                    onChange={(e) => setStudentText(e.target.value)}
                    placeholder={editorPlaceholder}
                    className="w-full bg-gray-50 dark:bg-[#121614] border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-sm md:text-base text-gray-900 dark:text-white font-medium leading-relaxed focus:ring-2 focus:ring-emerald-500 outline-none"
                  />

                   {/* Phase 4 — auto-évaluation /20 AVANT le verdict (calibration) */}
                   {currentStage === 4 && (
                    <div className="flex flex-wrap items-center gap-3 bg-sky-50 dark:bg-sky-950/30 p-3 rounded-xl border border-sky-200 dark:border-sky-800/60">
                      <span className="text-xs font-black text-sky-900 dark:text-sky-300">🪞 قبل التصحيح: ما النقطة التي تتوقعها على 20؟</span>
                      <input
                        type="number" min={0} max={20} step={0.25}
                        value={selfScore}
                        onChange={(e) => setSelfScore(e.target.value)}
                        className="w-24 px-2.5 py-1.5 rounded-lg border border-sky-200 dark:border-sky-800/60 bg-white dark:bg-black/30 text-sky-900 dark:text-sky-200 text-sm font-black focus:ring-2 focus:ring-sky-500 outline-none"
                      />
                      <span className="text-[11px] text-sky-700 dark:text-sky-400 font-medium">تتنبأ ثم تُصحَّح: الفارق بين توقعك ونقطة الأستاذ هو مرآة المرحلة 4.</span>
                    </div>
                   )}

                   {/* Actions & Submit */}
                   <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                      {isDev && (
                        <button
                          onClick={() => currentExercise && setStudentText(currentExercise.stage1.expertAnswer)}
                          className="text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-emerald-600"
                        >
                          إدراج نص تجريبي للاختبار
                        </button>
                      )}

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleResetExercise}
                        className="p-2.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all"
                        title="إعادة تعيين"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                      <button
                        onClick={handleSubmitProduction}
                        disabled={studentText.trim().length === 0 || (currentStage === 4 && !isDraftCompleted) || (currentStage === 4 && !(Number(selfScore) >= 0 && Number(selfScore) <= 20 && selfScore !== ''))}
                        className="px-6 py-2.5 bg-[#006d37] hover:bg-[#00562b] disabled:opacity-50 text-white rounded-xl font-bold text-sm shadow-md flex items-center gap-2"
                      >
                        <Sparkles className="w-4 h-4 text-[#fed65b]" />
                        <span>تقييم الإجابة وحساب ICM</span>
                      </button>
                    </div>
                  </div>
                </div>

              </div>

              {/* Colonne latérale : critères au stade 3, chrono au stade 4 (M1 : bac sans carte) */}
              <div className="lg:col-span-4 space-y-4">
              {currentStage === 3 && (
                <div className="bg-white dark:bg-[#161c18] p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm sticky top-4">
                  <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3 mb-3">
                    <div className="flex items-center gap-2">
                      <Compass className="w-5 h-5 text-emerald-600" />
                      <div>
                        <h4 className="font-black text-sm text-gray-900 dark:text-white">معايير الفعل</h4>
                        <span className="text-[11px] text-gray-400">توجيه قبلي وتأكيد بالإثبات</span>
                      </div>
                    </div>
                    <span className="text-xs font-black bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-md">
                      {Object.values(selectedEvidenceForCriterion).filter(Boolean).length} / {currentVerb.criteria.length}
                    </span>
                  </div>

                  {/* Single Column Checklist (Constraint: Une seule colonne) */}
                  <div className="space-y-3">
                    {currentVerb.criteria.map((cr, idx) => {
                      const isChecked = selectedEvidenceForCriterion[cr.id];
                      return (
                        <div
                          key={cr.id}
                          onClick={() => {
                            setSelectedEvidenceForCriterion(prev => ({
                              ...prev,
                              [cr.id]: !prev[cr.id]
                            }));
                          }}
                          className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                            isChecked
                              ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500/80 text-emerald-900 dark:text-emerald-200 shadow-sm'
                              : 'bg-gray-50 dark:bg-gray-800/40 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-start gap-2.5">
                            <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                              isChecked ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-gray-300 dark:border-gray-600'
                            }`}>
                              {isChecked && <Check className="w-3 h-3" />}
                            </div>
                            <div className="space-y-1">
                              <p className="font-bold">{cr.wording.compass}</p>
                              <div className="text-[11px] text-gray-500 dark:text-gray-400 bg-white/60 dark:bg-black/20 px-2 py-0.5 rounded">
                                <span className="text-emerald-600 font-bold">السؤال السابر: </span>
                                {cr.wording.probe}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                </div>
              )}
              {currentStage === 4 && (
                <div className="bg-white dark:bg-[#161c18] p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm sticky top-4 space-y-3">
                  <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-3">
                    <Clock className="w-5 h-5 text-amber-600" />
                    <h4 className="font-black text-sm text-gray-900 dark:text-white">الزمن (يتناسب مع النقاط)</h4>
                  </div>
                  <div className="font-mono text-2xl font-black text-center bg-gray-50 dark:bg-[#121614] rounded-xl py-2 text-gray-900 dark:text-white">
                    {Math.floor(timerSeconds / 60)}:{(timerSeconds % 60).toString().padStart(2, '0')}
                  </div>
                  <ul className="space-y-1.5 text-xs font-bold text-gray-700 dark:text-gray-300">
                    <li className="flex items-start gap-2"><span>⏳</span><span>{TIME_RULES.quart}</span></li>
                    <li className="flex items-start gap-2"><span>✍️</span><span>{TIME_RULES.half}</span></li>
                    <li className="flex items-start gap-2"><span>✅</span><span>{TIME_RULES.quarter}</span></li>
                  </ul>
                </div>
              )}
              </div>
            </div>
</>
  );
}
