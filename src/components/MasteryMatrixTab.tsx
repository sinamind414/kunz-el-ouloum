import { Calendar, ShieldAlert } from 'lucide-react';
import { VERB_CARDS_V2, ERROR_TAXONOMY } from '../data/methodologyEngine';
import { getProductionLogs, verbSlidingRatio, VerbEvolutionStats, ProductionLogEntry } from '../utils/methodologyLog';
import { AUTOMATION_THRESHOLD } from './methodologyShared';
import ProductionEvolutionPanel from './ProductionEvolutionPanel';

interface ReviewScheduleItem { verbAr: string; gap: number; nextDate: Date; due: boolean; daysLeft: number; }
interface MasteryMatrixTabProps {
  matrixScores: Record<string, Record<string, number>>;
  weeklyErrorCounters: Record<string, number>;
  reviewSchedule: ReviewScheduleItem[];
  evolutionStats: VerbEvolutionStats[];
  handleResumeDraft: (entry: ProductionLogEntry) => void;
  setEvolutionVersion: (fn: (v: number) => number) => void;
}

export default function MasteryMatrixTab({ matrixScores, weeklyErrorCounters, reviewSchedule, evolutionStats, handleResumeDraft, setEvolutionVersion }: MasteryMatrixTabProps) {

  return (
<>

        <section className="space-y-6">
          
          {/* Matrix Header */}
          <div className="bg-white dark:bg-[#161c18] p-5 md:p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
            <div>
              <h2 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white">مصفوفة الإتقان (الأفعال × الوحدات)</h2>
              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">
                القاعدة: لا يُعتبر الفعل مؤتمتاً ومكتسباً حتى يحقق التلميذ ICM ≥ 90% في 3 وحدات مختلفة على الأقل.
              </p>
            </div>

            {/* B (audit §3.8) — stabilité sur le noyau : ratio glissant (fenêtre 10) */}
            {(() => {
              const logs = getProductionLogs();
              const rows = VERB_CARDS_V2.map(v => ({ v, r: verbSlidingRatio(v.id, 10, logs) })).filter(x => x.r.total > 0);
              if (rows.length === 0) return null;
              return (
                <div className="space-y-2">
                  <h4 className="font-black text-sm text-gray-700 dark:text-gray-300">الاستقرار على النواة — الإنتاجات الأخيرة (10) الخالية من الخطأ النموذجي للفعل</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {rows.map(({ v, r }) => (
                      <div key={v.id} className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-black/20">
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span className="text-gray-800 dark:text-gray-200">{v.verbAr}</span>
                          <span className={r.ratio === null ? 'text-gray-400' : r.ratio >= 80 ? 'text-emerald-600' : r.ratio >= 50 ? 'text-amber-600' : 'text-red-600'}>{r.ratio === null ? '—' : r.ratio + '%'} <span className="text-[10px] text-gray-400 font-normal">({r.clean}/{r.total})</span></span>
                        </div>
                        <div className="mt-1.5 h-1.5 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
                          <div className={`h-full rounded-full ${r.ratio === null ? '' : r.ratio >= 80 ? 'bg-emerald-500' : r.ratio >= 50 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: (r.ratio ?? 0) + '%' }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Matrix Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs md:text-sm text-right border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    <th className="p-3 font-black text-gray-700 dark:text-gray-300">فعل الأداء</th>
                    <th className="p-3 font-bold text-gray-600 dark:text-gray-400 text-center">تركيب البروتين</th>
                    <th className="p-3 font-bold text-gray-600 dark:text-gray-400 text-center">النشاط الإنزيمي</th>
                    <th className="p-3 font-bold text-gray-600 dark:text-gray-400 text-center">المناعة</th>
                    <th className="p-3 font-bold text-gray-600 dark:text-gray-400 text-center">الاتصال العصبي</th>
                    <th className="p-3 font-bold text-gray-600 dark:text-gray-400 text-center">التنظيم الهرموني</th>
                    <th className="p-3 font-bold text-gray-600 dark:text-gray-400 text-center">التحولات الطاقوية</th>
                    <th className="p-3 font-bold text-gray-600 dark:text-gray-400 text-center">الظواهر الجيولوجية</th>
                    <th className="p-3 font-bold text-gray-600 dark:text-gray-400 text-center">الحالة</th>
                  </tr>
                </thead>
                <tbody>
                  {VERB_CARDS_V2.map((verb) => {
                    const scores = matrixScores[verb.id] || {};
                    const isAutomated = Object.values(scores).filter((s: any) => Number(s) >= AUTOMATION_THRESHOLD).length >= 3;
                    return (
                      <tr key={verb.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-white/5">
                        <td className="p-3 font-black text-gray-900 dark:text-white">{verb.verbAr}</td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-1 rounded-md font-bold text-xs ${
                            (scores.protein_synthesis || 0) >= AUTOMATION_THRESHOLD ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                          }`}>
                            {scores.protein_synthesis || 0}%
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-1 rounded-md font-bold text-xs ${
                            (scores.enzymology || 0) >= AUTOMATION_THRESHOLD ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                          }`}>
                            {scores.enzymology || 0}%
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-1 rounded-md font-bold text-xs ${
                            (scores.immunology || 0) >= AUTOMATION_THRESHOLD ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300'
                          }`}>
                            {scores.immunology || 0}%
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-1 rounded-md font-bold text-xs ${
                            (scores.neuro_comm || 0) >= AUTOMATION_THRESHOLD ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                          }`}>
                            {scores.neuro_comm || 0}%
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-1 rounded-md font-bold text-xs ${
                            (scores.regulations || 0) >= AUTOMATION_THRESHOLD ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                          }`}>
                            {scores.regulations || 0}%
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-1 rounded-md font-bold text-xs ${
                            (scores.energy_transformations || 0) >= AUTOMATION_THRESHOLD ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                          }`}>
                            {scores.energy_transformations || 0}%
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-1 rounded-md font-bold text-xs ${
                            (scores.geodynamics || 0) >= AUTOMATION_THRESHOLD ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                          }`}>
                            {scores.geodynamics || 0}%
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <span className={`px-2.5 py-1 rounded-full text-[11px] font-black ${
                            isAutomated 
                              ? 'bg-emerald-600 text-white' 
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                          }`}>
                            {isAutomated ? 'مؤتمت' : 'قيد التدريب'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Weekly Error Typology Counters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-[#161c18] p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
                <h3 className="font-black text-base text-gray-900 dark:text-white flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-red-600" />
                  <span>دفتر الأخطاء النوعية (الأسبوع الحالي)</span>
                </h3>
                <span className="text-xs font-bold text-gray-400">توجيه الجهد نحو الخلل السائد</span>
              </div>

              <div className="space-y-3">
                {Object.keys(weeklyErrorCounters).length === 0 ? (
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-bold text-center py-4">
                    لا أخطاء مرصودة بعد — ابدأ التدريب لتشخيص الخلل السائد.
                  </p>
                ) : Object.entries(weeklyErrorCounters).map(([tag, count]) => {
                  const errorDef = ERROR_TAXONOMY[tag];
                  if (!errorDef) return null;
                  return (
                    <div key={tag} className="p-3.5 bg-gray-50 dark:bg-[#121614] rounded-xl border border-gray-200 dark:border-gray-800 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-xs md:text-sm text-gray-900 dark:text-white block">
                          {errorDef.nameAr}
                        </span>
                        <span className="text-[11px] text-gray-500 dark:text-gray-400">{errorDef.example}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 rounded-lg font-black text-xs">
                          {count} تكرار
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Calendrier de révision calculé depuis le carnet (m1 : aucune date fictive) */}
            <div className="bg-white dark:bg-[#161c18] p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
                <h3 className="font-black text-base text-gray-900 dark:text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-emerald-600" />
                  <span>جدول التكرار المتباعد للذاكرة</span>
                </h3>
                <span className="text-xs font-bold text-emerald-600">5 دقائق استرجاع كتابي</span>
              </div>

              <div className="space-y-2.5">
                {reviewSchedule.length === 0 ? (
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-bold text-center py-4">
                    لا مراجعات مجدولة بعد — أكمل إنتاجًا مقيّمًا ليبدأ الجدول.
                  </p>
                ) : reviewSchedule.map((item, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 dark:bg-[#121614] rounded-xl border border-gray-200 dark:border-gray-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="font-black text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-gray-800 dark:text-gray-200">
                        يوم +{item.gap}
                      </span>
                      <span className="font-bold text-xs md:text-sm text-gray-800 dark:text-gray-200">{item.verbAr}</span>
                    </div>
                    <span className={`text-xs font-bold ${item.due ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'}`}>
                      {item.due ? 'جاهز للمراجعة' : `بعد ${item.daysLeft} يوم`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Diagnostic d'évolution : brouillons archivés + progression dans le temps */}
          <div className="border-t border-gray-100 dark:border-gray-800 pt-5">
            <ProductionEvolutionPanel
              stats={evolutionStats}
              onResume={handleResumeDraft}
              onRefresh={() => setEvolutionVersion(v => v + 1)}
            />
          </div>

        </section>
</>
  );
}
