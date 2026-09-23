import { motion } from 'motion/react';
import { ArrowLeft, CheckCircle2, Eye } from 'lucide-react';
import { STEP_NAMES_AR, getVerbCardV2 } from '../data/methodologyEngine';
import type { StepId, TrainingExercise } from '../data/methodologyEngine';
import { getStepData } from '../data/boussoleData';

interface Stage1PanelProps {
  currentExercise: TrainingExercise | null;
  currentVerb: { verbAr: string; structureSteps: string[]; criteria: unknown[] };
  selectedVerbId: string;
  highlightedSteps: Record<number, boolean>;
  setHighlightedSteps: (
    v: Record<number, boolean> | ((p: Record<number, boolean>) => Record<number, boolean>),
  ) => void;
  handleSelectStage: (stage: 1 | 2 | 3 | 4) => void;
}

export default function Stage1Panel({
  currentExercise, currentVerb, selectedVerbId, highlightedSteps,
  setHighlightedSteps, handleSelectStage,
}: Stage1PanelProps) {

  return (
<>
            <div className="bg-white dark:bg-[#161c18] p-5 md:p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
                <div>
                  <h3 className="text-base md:text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
                    <Eye className="w-5 h-5 text-blue-600" />
                    <span>المرحلة 1: النمذجة (استكشاف خطوات الإجابة النموذجية)</span>
                  </h3>
                  <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">
                    اقرأ إجابة الخبير، وانقر على الأجزاء لتحديد كل خطوة من خطوات هيكل الفعل.
                  </p>
                </div>
              </div>

              {/* Steps Legend — couleurs Boussole via stepMap (pas le n° brut) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                {currentExercise.stage1.segments.map((seg, idx) => {
                  const mappedStep = (getVerbCardV2(selectedVerbId)?.stepMap?.[seg.stepNumber - 1] ?? seg.stepNumber) as StepId;
                  const boussoleColor = getStepData(mappedStep)?.color ?? '#10b981';
                  const isDone = highlightedSteps[seg.stepNumber];
                  return (
                  <div
                    key={idx}
                    style={isDone ? { borderColor: boussoleColor, backgroundColor: `${boussoleColor}14` } : undefined}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-between ${
                      isDone
                        ? 'text-gray-800 dark:text-gray-200'
                        : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/40 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: boussoleColor }} />
                      <span>{STEP_NAMES_AR[mappedStep]}: {(currentVerb.structureSteps[idx] || 'خطوة هيكلية').replace(/^\d+\.\s*/, '')}</span>
                    </span>
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: boussoleColor }} />
                    ) : (
                      <span className="w-4 h-4 rounded-full border border-gray-300 dark:border-gray-600"></span>
                    )}
                  </div>
                  );
                })}
              </div>

              {/* Expert Answer with Clickable Segments — même couleur stepMap que la légende */}
              <div className="p-5 bg-gray-50 dark:bg-[#121614] rounded-2xl border border-gray-200 dark:border-gray-800 space-y-3 leading-relaxed text-sm md:text-base">
                {currentExercise.stage1.segments.map((seg, idx) => {
                  const isMarked = highlightedSteps[seg.stepNumber];
                  const mappedStep = (getVerbCardV2(selectedVerbId)?.stepMap?.[seg.stepNumber - 1] ?? seg.stepNumber) as StepId;
                  const boussoleColor = getStepData(mappedStep)?.color ?? '#10b981';
                  return (
                    <motion.div
                      key={idx}
                      whileHover={{ scale: 1.01 }}
                      onClick={() => setHighlightedSteps(prev => ({ ...prev, [seg.stepNumber]: true }))}
                      style={isMarked ? { borderColor: boussoleColor, backgroundColor: `${boussoleColor}1A` } : undefined}
                      className={`p-3 rounded-xl cursor-pointer border transition-all ${
                        isMarked
                          ? 'shadow-sm text-gray-800 dark:text-gray-200'
                          : 'bg-white dark:bg-[#1b221e] border-gray-200 dark:border-gray-700 hover:border-emerald-400 text-gray-800 dark:text-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-bold text-gray-400 mb-1">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: boussoleColor }} />
                          <span>{STEP_NAMES_AR[mappedStep]} (انقر للتحديد)</span>
                        </span>
                        {isMarked && <span className="font-bold" style={{ color: boussoleColor }}>تم التعرف عليها ✓</span>}
                      </div>
                      <p className="font-medium whitespace-pre-line">{seg.text}</p>
                    </motion.div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => currentExercise && setHighlightedSteps(Object.fromEntries(currentExercise.stage1.segments.map(s => [s.stepNumber, true])))}
                  className="text-xs font-bold text-gray-500 hover:text-emerald-600"
                >
                  كشف جميع الخطوات
                </button>

                <button
                  onClick={() => handleSelectStage(2)}
                  className="px-5 py-2.5 bg-[#006d37] hover:bg-[#00562b] text-white rounded-xl font-bold text-sm flex items-center gap-2 shadow-sm"
                >
                  <span>الانتقال للمرحلة 2 (الإكمال)</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </div>
            </div>
</>
  );
}
