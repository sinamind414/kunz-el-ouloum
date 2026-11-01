import React from 'react';
import { TrendingUp, AlertCircle, CheckCircle2, BarChart3, ChevronDown, ChevronUp } from 'lucide-react';
import { BOUSSOLE_STEPS, REGLE_D_OR_AR } from '../data/boussoleData';
import { getProductionLogs, VerbEvolutionStats } from '../utils/methodologyLog';

interface Props {
  evolution?: Record<string, VerbEvolutionStats>;
  onNavigate?: (tab: string) => void;
}

export default function MethodologyGlobalStats({ evolution }: Props) {
  const logs = getProductionLogs();
  const [open, setOpen] = React.useState(true);

  const errorCount = logs.reduce((sum, l) => sum + l.errorTags.length, 0);
  const errorByStep = BOUSSOLE_STEPS.reduce((acc, step) => {
    acc[step.num] = 0;
    return acc;
  }, {} as Record<number, number>);

  logs.forEach(l => l.errorTags.forEach(tag => {
    const step = BOUSSOLE_STEPS.find(s => s.errorTag === tag)?.num;
    if (step) errorByStep[step] = (errorByStep[step] || 0) + 1;
  }));

  const totalErrors = Object.values(errorByStep).reduce((a, b) => a + b, 0);
  const topErrorStep = Object.entries(errorByStep).reduce(
    (max, curr) => curr[1] > max.count ? { step: Number(curr[0]), count: curr[1] } : max,
    { step: 1, count: 0 }
  );

  return (
    <div className="bg-white dark:bg-[#161c18] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm mb-6" dir="rtl">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-emerald-600" />
          <h3 className="font-black text-sm text-gray-900 dark:text-white">مصفوفة الإتقان وخريطة الأخطاء</h3>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>

      {open && (
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {BOUSSOLE_STEPS.map(step => {
              const count = errorByStep[step.num];
              return (
                <div
                  key={step.num}
                  className={`p-3 rounded-xl border ${
                    count === 0 ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800' : 'bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-600 dark:text-gray-400">الخطوة {step.num}</span>
                    {count === 0 ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-red-500" />}
                  </div>
                  <p className="text-[11px] mt-1" style={{ color: step.num === topErrorStep.step ? '#dc2626' : '#64748b' }}>
                    {count === 0 ? 'خالية' : `${count} خطأ${count > 1 ? 'اء' : ''}`}
                  </p>
                </div>
              );
            })}
          </div>

          {errorCount > 0 && topErrorStep.count > 0 && (
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-xl p-3">
              <p className="text-xs font-bold text-amber-900 dark:text-amber-300 mb-1">
                ⚠️ تركز على الخطأ: الخطوة {topErrorStep.step}
              </p>
              <p className="text-[11px] text-amber-800 dark:text-amber-400">
                الخطأ الأكثر شيئًا في هذه الرحلة — استترع الخطوة {topErrorStep.step} في الجلسة التالية
              </p>
            </div>
          )}

          <div className="text-xs text-gray-500 dark:text-gray-400 italic text-center mt-2 pt-2 border-t border-gray-100 dark:border-gray-800">
            {REGLE_D_OR_AR}
          </div>
        </div>
      )}
    </div>
  );
}