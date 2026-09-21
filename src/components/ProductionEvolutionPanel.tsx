import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, TrendingDown, Minus, Award, History, Target,
  NotebookPen, RefreshCw, Flame, AlertTriangle
} from 'lucide-react';
import {
  getProductionLogs, getLatestDraft, VerbEvolutionStats, ProductionLogEntry, ERROR_TAG_LABELS_AR, clearProductionLog
} from '../utils/methodologyLog';
import { fmtDateLatn } from '../utils/latinDigits';

interface Props {
  stats: VerbEvolutionStats[];
  onResume: (entry: ProductionLogEntry) => void;
  onRefresh: () => void;
}

function fmtDate(iso: string): string {
  try { return fmtDateLatn(new Date(iso), { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }); }
  catch { return iso.slice(0, 16); }
}

function DeltaBadge({ delta }: { delta: number | null }) {
  if (delta === null) return <span className="text-[10px] font-bold text-zinc-400">—</span>;
  if (delta > 0) return <span className="inline-flex items-center gap-0.5 text-[10px] font-black text-emerald-600 dark:text-emerald-400"><TrendingUp className="w-3 h-3" />+{delta}</span>;
  if (delta < 0) return <span className="inline-flex items-center gap-0.5 text-[10px] font-black text-rose-500"><TrendingDown className="w-3 h-3" />{delta}</span>;
  return <span className="inline-flex items-center gap-0.5 text-[10px] font-black text-zinc-400"><Minus className="w-3 h-3" />0</span>;
}

export default function ProductionEvolutionPanel({ stats, onResume, onRefresh }: Props) {
  const drafts = useMemo(() => getProductionLogs().reverse().slice(0, 8), [stats, onRefresh]);

  const totalAttempts = stats.reduce((a, s) => a + s.attempts, 0);
  const improved = stats.filter(s => (s.delta ?? 0) > 0).length;
  const regressed = stats.filter(s => (s.delta ?? 0) < 0).length;
  const mastered = stats.filter(s => s.masteredThemes >= 3).length;

  return (
    <div className="space-y-4">
      {/* En-tête du diagnostic */}
      <div className="bg-gradient-to-l from-[#006d37]/10 to-[#2ecc71]/5 dark:from-[#2ecc71]/10 dark:to-transparent border border-[#006d37]/15 dark:border-[#2ecc71]/15 rounded-2xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#006d37] dark:bg-[#2ecc71]/20 text-white dark:text-[#2ecc71] flex items-center justify-center">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-sm md:text-base text-gray-900 dark:text-white">تشخيص التطور عبر الزمن</h3>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 font-bold">
                كل بثول كتبه التلميذ يُحفظ ويُقارن بالذي قبله — لا يُعتبر الفعل مكتسباً إلا بتحسن مستمر
              </p>
            </div>
          </div>
          <button
            onClick={() => { if (confirm('هل تريد مسح كل البثول المحفوظة؟ لا يمكن التراجع.')) { clearProductionLog(); onRefresh(); } }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-black text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-rose-200 dark:border-rose-900 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" /> مسح السجل
          </button>
        </div>

        {/* Indicateurs globaux */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          <div className="bg-white dark:bg-[#161c18] rounded-xl border border-gray-100 dark:border-gray-800 p-3 text-center">
            <div className="text-lg font-black text-gray-900 dark:text-white">{totalAttempts}</div>
            <div className="text-[10px] font-bold text-gray-500 dark:text-gray-400">محاولات مكتوبة</div>
          </div>
          <div className="bg-white dark:bg-[#161c18] rounded-xl border border-gray-100 dark:border-gray-800 p-3 text-center">
            <div className="text-lg font-black text-emerald-600 dark:text-emerald-400">{improved}</div>
            <div className="text-[10px] font-bold text-gray-500 dark:text-gray-400">أفعال في تحسن ↗</div>
          </div>
          <div className="bg-white dark:bg-[#161c18] rounded-xl border border-gray-100 dark:border-gray-800 p-3 text-center">
            <div className="text-lg font-black text-rose-500">{regressed}</div>
            <div className="text-[10px] font-bold text-gray-500 dark:text-gray-400">أفعال في تراجع ↘</div>
          </div>
          <div className="bg-white dark:bg-[#161c18] rounded-xl border border-gray-100 dark:border-gray-800 p-3 text-center">
            <div className="text-lg font-black text-amber-500">{mastered}</div>
            <div className="text-[10px] font-bold text-gray-500 dark:text-gray-400">أفعال مؤتمتة (≥90 في 3 وحدات)</div>
          </div>
        </div>
      </div>

      {/* Cartes par verbe */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {stats.length === 0 && (
          <div className="col-span-full text-center py-8 text-gray-400 dark:text-gray-600">
            <NotebookPen className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-xs font-bold">لا توجد بثول محفوظة بعد — تدرّب في المحاكي وسيتم تشخيص تطورك هنا تلقائياً.</p>
          </div>
        )}
        {stats.map(s => {
          const maxSpark = Math.max(100, ...s.spark);
          const draft = getLatestDraft(s.verbId);
          return (
            <motion.div
              key={s.verbId}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-[#161c18] rounded-2xl border border-gray-200 dark:border-gray-800 p-4 space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-black text-sm text-gray-900 dark:text-white">{s.verbAr}</div>
                  <div className="text-[10px] font-bold text-gray-500 dark:text-gray-400">{s.attempts} محاولات · متوسط {s.average}% · أفضل {s.best}%</div>
                </div>
                <div className="text-left">
                  <div className="text-xl font-black text-gray-900 dark:text-white tabular-nums">{s.last}%</div>
                  <div className="flex items-center gap-1 justify-end">
                    <DeltaBadge delta={s.delta} />
                    {s.masteredThemes >= 3 && (
                      <span className="inline-flex items-center gap-0.5 text-[9px] font-black text-amber-500 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-full px-1.5 py-0.5">
                        <Award className="w-2.5 h-2.5" /> مؤتمت
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Sparkline (barres : dernières tentatives) */}
              <div className="flex items-end gap-1 h-10">
                {s.spark.map((v, i) => (
                  <div key={i} className="flex-1 flex flex-col justify-end" title={`${v}%`}>
                    <div
                      className={`w-full rounded-t ${i === s.spark.length - 1 ? 'bg-[#006d37] dark:bg-[#2ecc71]' : i === s.spark.length - 2 ? 'bg-[#006d37]/60 dark:bg-[#2ecc71]/60' : 'bg-[#006d37]/25 dark:bg-[#2ecc71]/25'}`}
                      style={{ height: `${Math.max(8, (v / maxSpark) * 100)}%` }}
                    />
                  </div>
                ))}
              </div>

              {/* Erreurs récurrentes = vrai diagnostic */}
              {s.topErrors.length > 0 && (
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-[10px] font-black text-gray-500 dark:text-gray-400">
                    <AlertTriangle className="w-3 h-3 text-amber-500" /> الأخطاء المتكررة
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {s.topErrors.map(e => (
                      <span key={e.tag} className="text-[9px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50 rounded-full px-2 py-0.5">
                        {ERROR_TAG_LABELS_AR[e.tag] || e.tag} ×{e.count}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Reprendre le dernier brouillon */}
              <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <span className="text-[9px] font-bold text-gray-400 dark:text-gray-600 flex items-center gap-1">
                  <History className="w-3 h-3" /> آخر بثول: {draft ? fmtDate(draft.dateISO) : '—'}
                </span>
                <button
                  onClick={() => { if (draft) onResume(draft); }}
                  disabled={!draft}
                  className="flex items-center gap-1 text-[10px] font-black text-[#006d37] dark:text-[#2ecc71] hover:bg-[#e8f5ee] dark:hover:bg-[#2ecc71]/10 disabled:opacity-40 disabled:cursor-not-allowed px-2 py-1 rounded-lg transition-colors cursor-pointer"
                >
                  <Target className="w-3 h-3" /> استئناف التدريب
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Liste des brouillons récents */}
      {drafts.length > 0 && (
        <div className="bg-white dark:bg-[#161c18] rounded-2xl border border-gray-200 dark:border-gray-800 p-4">
          <h4 className="font-black text-xs text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1.5">
            <NotebookPen className="w-3.5 h-3.5 text-[#006d37] dark:text-[#2ecc71]" /> البثول الأخيرة (قابلة للاسترجاع)
          </h4>
          <div className="space-y-1.5">
            {drafts.map(d => (
              <button
                key={d.id}
                onClick={() => onResume(d)}
                className="w-full flex items-center justify-between gap-2 text-right bg-gray-50 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-800 rounded-xl px-3 py-2 hover:border-[#006d37]/40 dark:hover:border-[#2ecc71]/30 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`w-9 h-9 shrink-0 rounded-lg flex items-center justify-center text-[10px] font-black ${d.icm >= 90 ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300' : d.icm >= 60 ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300' : 'bg-rose-100 dark:bg-rose-950/40 text-rose-600'}`}>
                    {d.icm}%
                  </span>
                  <div className="min-w-0">
                    <div className="text-[11px] font-black text-gray-800 dark:text-gray-200 truncate">{d.verbAr} — {d.stage === 2 ? 'تكملة' : d.stage === 4 ? 'إنتاج كامل' : 'تحرير'}</div>
                    <div className="text-[9px] text-gray-400 font-bold">{fmtDate(d.dateISO)} · {d.text.length} حرفاً</div>
                  </div>
                </div>
                <span className="text-[9px] font-black text-[#006d37] dark:text-[#2ecc71] shrink-0">استرجاع ←</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
