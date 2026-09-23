import { ArrowLeft, CheckSquare } from 'lucide-react';
import type { TrainingExercise } from '../data/methodologyEngine';

interface Stage2PanelProps {
  currentExercise: TrainingExercise | null;
  clozeAnswers: Record<string, string>;
  setClozeAnswers: (v: Record<string, string>) => void;
  clozeSubmitted: boolean;
  handleCheckStage2: () => void;
  handleSelectStage: (stage: 1 | 2 | 3 | 4) => void;
}

export default function Stage2Panel({
  currentExercise, clozeAnswers, setClozeAnswers, clozeSubmitted,
  handleCheckStage2, handleSelectStage,
}: Stage2PanelProps) {

  return (
<>
            <div className="bg-white dark:bg-[#161c18] p-5 md:p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
                <div>
                  <h3 className="text-base md:text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
                    <CheckSquare className="w-5 h-5 text-amber-600" />
                    <span>المرحلة 2: الإكمال (الشكل جاهز والمجهود على المضمون)</span>
                  </h3>
                  <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">
                    الروابط المنهجية موجودة سلفاً، املأ الفراغات بالمعطيات العلمية والوحدات المطلوبة.
                  </p>
                </div>
              </div>

              {/* Interactive Cloze Inputs Form */}
              <div className="space-y-4">
                {currentExercise.stage2.blanks.map((b, idx) => (
                  <div key={b.id} className="p-4 bg-gray-50 dark:bg-[#121614] rounded-xl border border-gray-200 dark:border-gray-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                        الفراغ ({idx + 1}): {b.hint}
                      </span>
                      {clozeSubmitted && (
                        <span className="text-xs font-bold text-gray-500">
                          المتوقع: {b.expectedText}
                        </span>
                      )}
                    </div>
                    <input
                      type="text"
                      value={clozeAnswers[b.id] || ''}
                      onChange={(e) => setClozeAnswers({ ...clozeAnswers, [b.id]: e.target.value })}
                      placeholder={`اكتب هنا: ${b.hint}...`}
                      className="w-full bg-white dark:bg-[#1a221d] border border-gray-200 dark:border-gray-700 rounded-lg p-2.5 text-sm text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={handleCheckStage2}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-sm"
                >
                  فحص الإجابة وحساب ICM
                </button>

                <button
                  onClick={() => handleSelectStage(3)}
                  className="px-5 py-2.5 bg-[#006d37] hover:bg-[#00562b] text-white rounded-xl font-bold text-sm flex items-center gap-2 shadow-sm"
                >
                  <span>الانتقال للمرحلة 3 (الإنتاج الموجّه)</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </div>
            </div>
</>
  );
}
