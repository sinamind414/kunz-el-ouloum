import {
  AlertTriangle, CheckCircle2, ChevronDown, ChevronUp, Layers, Sparkles, Zap,
} from 'lucide-react';
import { VERB_CARDS, TRAINING_EXERCISES } from '../data/methodologyEngine';

interface VerbsRefTabProps {
  expandedVerbCardId: string | null;
  setExpandedVerbCardId: (v: string | null) => void;
  setSelectedVerbId: (id: string) => void;
  setSelectedExerciseId: (id: string) => void;
  setActiveTab: (t: 'simulator') => void;
}

export default function VerbsRefTab({ expandedVerbCardId, setExpandedVerbCardId, setSelectedVerbId, setSelectedExerciseId, setActiveTab }: VerbsRefTabProps) {

  return (
<>

        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white">فهرس الأفعال الثمانية الموحدة</h2>
              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">
                فيشة معيارية لكل فعل تشمل: الهيكل الإلزامي، الروابط، المحظورات، ونموذج الخطأ المعلم.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {VERB_CARDS.map((verbCard) => {
              const isExpanded = expandedVerbCardId === verbCard.id;
              return (
                <div 
                  key={verbCard.id}
                  className="bg-white dark:bg-[#161c18] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden"
                >
                  <div 
                    onClick={() => setExpandedVerbCardId(isExpanded ? null : verbCard.id)}
                    className="p-5 cursor-pointer flex items-center justify-between hover:bg-gray-50 dark:hover:bg-white/5 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-black flex items-center justify-center text-sm shadow-sm">
                        {verbCard.verbAr.slice(0, 3)}
                      </div>
                      <div>
                        <h3 className="font-black text-lg text-gray-900 dark:text-white flex items-center gap-2">
                          {verbCard.verbAr}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{verbCard.goal}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedVerbId(verbCard.id);
                          const ex = TRAINING_EXERCISES.find(item => item.verbId === verbCard.id);
                          if (ex) setSelectedExerciseId(ex.id);
                          setActiveTab('simulator');
                        }}
                        className="hidden sm:flex items-center gap-1 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 rounded-lg text-xs font-bold border border-emerald-200 dark:border-emerald-800"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>تدريب المحاكي</span>
                      </button>

                      {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                    </div>
                  </div>

                  {/* Expanded Verb Details */}
                  {isExpanded && (
                    <div className="p-5 pt-0 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-black/20 space-y-5">
                      
                      {/* Structure Steps & Connectors */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div className="p-4 bg-white dark:bg-[#1b221e] rounded-xl border border-gray-200 dark:border-gray-700/60 space-y-2">
                          <h4 className="font-bold text-xs text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                            <Layers className="w-4 h-4" />
                            <span>الهيكل الإلزامي (3 إلى 4 خطوات):</span>
                          </h4>
                          <ul className="space-y-1.5 text-xs text-gray-700 dark:text-gray-300 font-medium">
                            {verbCard.structureSteps.map((step, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span className="text-emerald-600 font-bold">•</span>
                                <span>{step}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="p-4 bg-white dark:bg-[#1b221e] rounded-xl border border-gray-200 dark:border-gray-700/60 space-y-2">
                          <h4 className="font-bold text-xs text-blue-700 dark:text-blue-400 flex items-center gap-1.5">
                            <Sparkles className="w-4 h-4" />
                            <span>الروابط اللفظية الإلزامية:</span>
                          </h4>
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {verbCard.requiredConnectors.map((conn, idx) => (
                              <span key={idx} className="bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 px-2.5 py-1 rounded-md text-xs font-bold border border-blue-100 dark:border-blue-900/50">
                                {conn}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Model Example vs Annotated Counter-Example */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        
                        {/* 100% Good Example */}
                        <div className="p-4 bg-emerald-50/70 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800/60 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              <span>إجابة نموذجية ممتازة</span>
                            </span>
                            <span className="bg-emerald-600 text-white font-black text-[10px] px-2 py-0.5 rounded-full">
                              100% (20/20)
                            </span>
                          </div>
                          <p className="text-xs text-gray-800 dark:text-gray-200 font-medium whitespace-pre-line leading-relaxed">
                            {verbCard.goodExample.answer}
                          </p>
                        </div>

                        {/* Annotated Bad Counter-Example with circled error */}
                        <div className="p-4 bg-red-50/70 dark:bg-red-950/30 rounded-xl border border-red-200 dark:border-red-900/60 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-red-800 dark:text-red-300 flex items-center gap-1">
                              <AlertTriangle className="w-4 h-4 text-red-600" />
                              <span>مثال مضاد معلّم (Contre-exemple)</span>
                            </span>
                            <span className="bg-red-600 text-white font-black text-[10px] px-2 py-0.5 rounded-full">
                              {verbCard.badExample.scorePercent}% (خطأ شائع)
                            </span>
                          </div>
                          
                          <div className="p-2.5 bg-white dark:bg-[#1a1214] rounded-lg border border-red-200 dark:border-red-900/40 text-xs text-gray-800 dark:text-gray-200 font-medium">
                            <p className="leading-relaxed">{verbCard.badExample.answer}</p>
                            <div className="mt-2 pt-2 border-t border-red-100 dark:border-red-950 text-[11px] text-red-700 dark:text-red-400 font-bold">
                              <span>الخطأ القاتل: </span>
                              <span className="bg-red-100 dark:bg-red-900/40 px-1.5 py-0.5 rounded border border-red-300 dark:border-red-700">{verbCard.badExample.circledError}</span>
                            </div>
                          </div>

                          <p className="text-[11px] text-red-600 dark:text-red-400/90 font-medium">
                            {verbCard.badExample.flawDescription}
                          </p>
                        </div>

                      </div>

                    </div>
                  )}

                </div>
              );
            })}
          </div>
        </section>
</>
  );
}
