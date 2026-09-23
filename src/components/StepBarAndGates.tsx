import { AlertTriangle, Key } from 'lucide-react';
import {
  STEP_NAMES_AR, STEP_TEMPLATES, STEP0_TEMPLATE_AR, getVerbCardV2,
} from '../data/methodologyEngine';
import type { StepId, Switch, SourceGate, SourceKind, Movement, TrainingExercise } from '../data/methodologyEngine';

interface StepBarAndGatesProps {
  currentStage: 1 | 2 | 3 | 4;
  currentExercise: TrainingExercise | null;
  currentVerb: { verbAr: string };
  selectedVerbId: string;
  gateOpen: boolean;
  showSourceGate: boolean;
  setShowSourceGate: (v: boolean) => void;
  showGate2: boolean;
  setShowGate2: (v: boolean) => void;
  showSwitchGate: boolean;
  setShowSwitchGate: (v: boolean) => void;
  switchChoice: Switch | null;
  setSwitchChoice: (s: Switch | null) => void;
  setSourceGate: (s: SourceGate | null) => void;
  setGate2Choice: (g: SourceKind | null) => void;
  setGate3Choice: (g: Movement | null) => void;
  setIsDual: (v: boolean) => void;
  step0Text: string;
  setStep0Text: (v: string) => void;
}

export default function StepBarAndGates({
  currentStage, currentExercise, currentVerb, selectedVerbId, gateOpen,
  showSourceGate, setShowSourceGate, showGate2, setShowGate2,
  showSwitchGate, setShowSwitchGate, switchChoice, setSwitchChoice,
  setSourceGate, setGate2Choice, setGate3Choice, setIsDual,
  step0Text, setStep0Text,
}: StepBarAndGatesProps) {

  return (
<>
{/* StepBar — stages 1-3, masquée tant que le gate est ouvert (B2) */}
          {currentStage >= 1 && currentStage <= 3 && currentExercise && !gateOpen && (() => {
            const card = getVerbCardV2(selectedVerbId);
            if (!card) return null;
            const lampState = currentStage === 3 ? (switchChoice ?? 'pending') : card.switch;
            // Mineur · la case affiche le moule de l'étape, pas un « ✓ » qui se lit comme « fait »
            const moldForStep = (step: StepId): string => {
              if (step === 1) return 'المطلوب: ………';
              if (!card.path.includes(step)) return 'لا تُكتب هنا';
              if (step === 2) return STEP_TEMPLATES[2][0];
              if (step === 4) return STEP_TEMPLATES[4][0];
              const mold = (STEP_TEMPLATES[3] as unknown as Record<string, string[]>)[card.step3Mode]?.[0];
              if (mold) return `«${mold}»`;
              return lampState === 'open' ? '«لأنّ» مطلوبة' : 'لا «لأنّ»';
            };
            return (
              <div dir="rtl" className="space-y-2 mb-4">
                <div className="grid grid-cols-4 gap-2">
                  {([1, 2, 3, 4] as StepId[]).map(step => {
                    const applicable = step === 1 || card.path.includes(step);
                    const isStep3 = step === 3;
                    const isStep3Open = lampState === 'open';
                    const isStep3Pending = lampState === 'pending';
                    return (
                      <div key={step} className={`p-3 rounded-xl border text-center text-xs ${
                        !applicable ? 'bg-gray-50 dark:bg-gray-800/40 border-gray-200 dark:border-gray-700 text-gray-400'
                        : isStep3 ? (isStep3Open ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40' : isStep3Pending ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40' : 'bg-gray-50 dark:bg-gray-800/40 border-gray-200 dark:border-gray-700 text-gray-400')
                        : 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-200'
                      }`}>
                        <div className="font-black text-lg leading-none">{step}</div>
                        <div className="font-bold text-sm mt-1">{STEP_NAMES_AR[step]}</div>
                        {isStep3 && (
                          <div className={`mt-1 inline-block px-1.5 rounded text-[10px] font-bold ${
                            isStep3Open ? 'bg-emerald-200/60 dark:bg-emerald-900/60' : isStep3Pending ? 'bg-amber-200/60 dark:bg-amber-900/60' : 'bg-gray-200/80 dark:bg-gray-700 line-through'
                          }`}>
                            «لأنّ»
                          </div>
                        )}
                        <div className="mt-1 font-bold text-[11px] leading-relaxed">
                          {moldForStep(step)}
                        </div>
                      </div>
                    );
                  })}
                </div>
                {/* Mineur · §8 : le Miftah est montré ET justifié */}
                <div className="text-[11px] font-bold text-gray-500 dark:text-gray-400 text-center">
                  {card.switch === 'open' ? 'الفعل يطلب الآلية ← «لأنّ» مطلوبة' : 'الفعل يطلب الوصف ← لا «لأنّ»'}
                </div>
              </div>
            );
          })()}

          {/* V3.1 Gate1 — ورقة أم رأس؟ (double gate) */}
          {/* 🚪 Update 2026-09-06 (MARQUE §12) — TROIS PORTES, cascade progressive */}
          {showSourceGate && currentStage === 3 && currentExercise && (() => {
            return (
              <div className="bg-white dark:bg-[#161c18] p-5 md:p-6 rounded-2xl border-2 border-amber-300 dark:border-amber-800 shadow-sm space-y-4">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <Key className="w-5 h-5 text-amber-500" />
                  <span>🚪 البوابة 1 — قفل أصلا؟</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">هل تستند المعطيات إلى وثيقة / شكل / جدول / منحنى / رسم؟ لا ⇒ 🧠 الدُرج مباشرة · نعم ⇒ البوابة 2</p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => { setSourceGate('paper'); setShowSourceGate(false); setShowGate2(true); setSwitchChoice(null); }}
                    className="p-4 rounded-xl border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-500 dark:hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-all font-bold text-center"
                  >
                    <div>🔒 قفل</div>
                    <div className="text-[11px] font-normal">وثيقة / شكل — هناك ما يُفتَح</div>
                  </button>
                  <button
                    onClick={() => { setSourceGate('memory'); setShowSourceGate(false); setShowGate2(false); setShowSwitchGate(false); setIsDual(false); setSwitchChoice(null); setGate2Choice(null); setGate3Choice(null); }}
                    className="p-4 rounded-xl border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-500 dark:hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-all font-bold text-center"
                  >
                    <div>🧠 لا قفل</div>
                    <div className="text-[11px] font-normal">دُرج المعرفة — من فعل إلى جواب</div>
                  </button>
                </div>
              </div>
            );
          })()}
          {showGate2 && currentStage === 3 && currentExercise && (() => {
            return (
              <div className="bg-white dark:bg-[#161c18] p-5 md:p-6 rounded-2xl border-2 border-sky-300 dark:border-sky-800 shadow-sm space-y-4">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <Key className="w-5 h-5 text-sky-500" />
                  <span>📥 البوابة 2 — من أين آتي بمادة الإدخال؟</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">«ومعلوماتك / ومكتسباتك» مذكورة في السؤال ⇒ مختلط (عمودان) · غير ذلك ⇒ وثيقة فقط</p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => { setIsDual(false); setGate2Choice('document'); setShowGate2(false); setShowSwitchGate(true); }}
                    className="p-4 rounded-xl border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-500 dark:hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-all font-bold text-center"
                  >
                    <div>📄 وثيقة فقط</div>
                    <div className="text-[11px] font-normal">عمود واحد في المسودة</div>
                  </button>
                  <button
                    onClick={() => { setIsDual(true); setGate2Choice('mixed'); setShowGate2(false); setShowSwitchGate(true); }}
                    className="p-4 rounded-xl border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-500 dark:hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-all font-bold text-center"
                  >
                    <div>📄+🧠 مختلط</div>
                    <div className="text-[11px] font-normal">عمودان: [من الوثيقة | من معلوماتي]</div>
                  </button>
                </div>
              </div>
            );
          })()}
          {/* Switch Gate — stage 3 only, Gate2 صورة/فيلم (renommage de مغلق/مفتوح) — B2 : boutons neutres */}
          {showSwitchGate && currentStage === 3 && currentExercise && !showSourceGate && (() => {
            return (
              <div className="bg-white dark:bg-[#161c18] p-5 md:p-6 rounded-2xl border-2 border-violet-300 dark:border-violet-800 shadow-sm space-y-4">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <Key className="w-5 h-5 text-violet-500" />
                  <span>⚙️ البوابة 3 — أي حركة يطلب هذا القفل؟</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">📷 وصف واستخراج · 🎬 تفسير ورابط «لأنّ» · 🔨 تصنيع: فرضية / اقتراح / توصية (لا جواب واحد صحيح)</p>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => { setGate3Choice('photo'); setSwitchChoice('closed'); setShowSwitchGate(false); }}
                    className="p-4 rounded-xl border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-500 dark:hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-all font-bold text-center"
                  >
                    <div className="text-2xl">📷</div>
                    <div className="text-sm">الصورة</div>
                    <div className="text-[10px] font-normal text-gray-400">حلل · قارن · استخرج</div>
                  </button>
                  <button
                    onClick={() => { setGate3Choice('film'); setSwitchChoice('open'); setShowSwitchGate(false); }}
                    className="p-4 rounded-xl border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-500 dark:hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-all font-bold text-center"
                  >
                    <div className="text-2xl">🎬</div>
                    <div className="text-sm">الفيلم</div>
                    <div className="text-[10px] font-normal text-gray-400">اشرح · فسر · استنتج</div>
                  </button>
                  <button
                    onClick={() => { setGate3Choice('smith'); setSwitchChoice('open'); setShowSwitchGate(false); }}
                    className="p-4 rounded-xl border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-500 dark:hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-all font-bold text-center"
                  >
                    <div className="text-2xl">🔨</div>
                    <div className="text-sm">الحدّاد</div>
                    <div className="text-[10px] font-normal text-gray-400">اقترح · برر · ناقض</div>
                  </button>
                </div>
              </div>
            );
          })()}

              {/* Current Exercise Subject Context */}
          {currentExercise ? (
          <div className="bg-white dark:bg-[#161c18] p-5 md:p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
            <div className="flex items-center justify-between gap-3 mb-3 border-b border-gray-100 dark:border-gray-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="bg-[#006d37] text-white px-2.5 py-1 rounded-lg text-xs font-black">
                  {currentExercise.themeAr}
                </span>
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
                  {currentExercise.supportTitle}
                </span>
              </div>
              <span className="text-xs font-bold text-gray-400">
                السند: {currentExercise.supportType === 'schema' ? 'مخطط' : currentExercise.supportType}
              </span>
            </div>

            <div className="space-y-3">
              {/* STEP0 — الهدف العام (V3.1) : ligne 0 avant tout */}
              <div className="bg-sky-50 dark:bg-sky-950/20 p-3 rounded-xl border border-sky-200 dark:border-sky-900/40">
                <label className="text-xs font-black text-sky-800 dark:text-sky-300 block mb-1">الهدف العام 0 — ماذا أفهم قبل أن أقرأ؟</label>
                <input
                  type="text"
                  value={step0Text}
                  onChange={(e) => setStep0Text(e.target.value)}
                  placeholder={STEP0_TEMPLATE_AR.replace('_____','……')}
                  className="w-full bg-white dark:bg-[#0f1a1f] border border-sky-200 dark:border-sky-800 rounded-lg p-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-sky-500 outline-none"
                />
                <span className="text-[11px] text-sky-600 dark:text-sky-400">اكتب هدفك في سطر واحد — لا يُصحَّح، لكنه يوجّه قراءتك</span>
              </div>
              <p className="text-sm md:text-base text-gray-700 dark:text-gray-300 font-medium leading-relaxed">
                <strong className="text-gray-900 dark:text-white">السياق العلمي: </strong>
                {currentExercise.context}
              </p>

              {currentExercise.dataSnippet && (
                <div className="bg-emerald-50/70 dark:bg-emerald-950/20 p-3.5 rounded-xl border border-emerald-100 dark:border-emerald-900/40 text-xs md:text-sm font-medium text-emerald-950 dark:text-emerald-200 whitespace-pre-line">
                  {currentExercise.dataSnippet}
                </div>
              )}

              {currentExercise.diagramUrl && (
                <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-[#1b221e]">
                  <img
                    src={currentExercise.diagramUrl}
                    alt={currentExercise.supportTitle}
                    className="w-full h-auto object-contain"
                  />
                </div>
              )}

              <div className="bg-amber-50 dark:bg-amber-950/30 p-3.5 rounded-xl border border-amber-200 dark:border-amber-900/50 flex items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-black text-amber-800 dark:text-amber-400 block mb-0.5">التعليمة المستهدفة:</span>
                  <p className="text-sm md:text-base font-black text-gray-900 dark:text-white">
                    {currentExercise.question}
                  </p>
                </div>
                <div className="p-2 bg-amber-200/50 dark:bg-amber-900/50 rounded-lg text-amber-800 dark:text-amber-300 text-xs font-black shrink-0">
                  {currentVerb.verbAr}
                </div>
              </div>
            </div>
          </div>
          ) : (
            <div className="bg-white dark:bg-[#161c18] p-5 md:p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm text-center">
              <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-3" />
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                اختر حلّل / فسّر / قارن للتدريب — أو راجع بطاقات الأفعال
              </p>
            </div>
          )}
</>
  );
}
