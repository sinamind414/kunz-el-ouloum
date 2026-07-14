import { lazy, Suspense } from 'react';
import { Trophy, TrendingUp, Sparkles } from 'lucide-react';
import { Unit, UserProgress, TabId } from '../types';
import DomainReadinessRadar from './DomainReadinessRadar';
import BacCountdown from './BacCountdown';

// Lazy-load heavy fusion views (FR8.4 — keep ProgressView chunk small)
const StatsView = lazy(() => import('./StatsView'));
const BadgesView = lazy(() => import('./BadgesView'));

function SubFallback() {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3">
      <div className="w-8 h-8 border-4 border-[#2ecc71]/30 border-t-[#006d37] rounded-full animate-spin" />
      <p className="text-sm font-bold text-[#506072]">تحميل...</p>
    </div>
  );
}

interface ProgressViewProps {
  progress: UserProgress;
  units: Unit[];
  onNavigateToTab: (tab: TabId) => void;
}

export default function ProgressView({ progress, units, onNavigateToTab }: ProgressViewProps) {
  const mastery = units.length
    ? Math.round(units.reduce((s, u) => s + u.progress, 0) / units.length)
    : 0;

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6 pb-28" dir="rtl">
      {/* Header dark */}
      <div className="rounded-3xl p-5 bg-gradient-to-br from-[#0f172a] to-[#1e293b] text-white shadow-lg mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-[#fed65b] fill-[#fed65b]" />
            <h1 className="text-xl md:text-2xl font-black">تقدمي</h1>
          </div>
          <div className="flex items-center gap-3 text-sm font-bold">
            <span className="flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-full">
              <Trophy className="w-4 h-4 text-[#ffe49b] fill-[#ffe49b]" /> {progress.xp} XP
            </span>
            <span className="flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-full">
              🔥 {progress.streak}
            </span>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-bold">نسبة الإتقان العامة</span>
            <span className="font-black">{mastery}%</span>
          </div>
          <div className="h-2.5 rounded-full bg-white/15 overflow-hidden">
            <div className="h-full bg-[#2ecc71] rounded-full transition-all" style={{ width: `${mastery}%` }} />
          </div>
        </div>
      </div>

      {/* Radar + countdown */}
      <div className="rounded-3xl bg-white dark:bg-[#141916] border border-gray-200 dark:border-gray-800 p-4 shadow-sm mb-4">
        <h3 className="font-black text-gray-900 dark:text-white mb-2 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-[#006d37]" /> جاهزية المجالات
        </h3>
        <DomainReadinessRadar units={units} />
      </div>
      <div className="mb-4">
        <BacCountdown />
      </div>

      {/* Comment sentir l'amélioration */}
      <div className="rounded-3xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 p-4 mb-4">
        <h3 className="font-black text-emerald-700 dark:text-emerald-300 mb-1 flex items-center gap-2 text-sm">
          <Sparkles className="w-4 h-4" /> كيف تشعر بالتحسن؟
        </h3>
        <ul className="text-xs text-emerald-800 dark:text-emerald-200 leading-7 list-disc pr-4 space-y-1">
          <li>كل وحدة مكتملة (≥ 80%) تضيف وساماً في قسم « أوسمتي ».</li>
          <li>الرادار أعلاه ينمو كلما زاد إتقانك للمجالات الثلاثة.</li>
          <li>سلسلة الأيام (🔥) تطول كل يوم تتمرن فيه — حتى 5 دقائق تحسب.</li>
        </ul>
      </div>

      {/* Stats + Badges fusion */}
      <Suspense fallback={<SubFallback />}>
        <StatsView progress={progress} units={units} onNavigateToTab={onNavigateToTab} />
      </Suspense>
      <div className="mt-4">
        <Suspense fallback={<SubFallback />}>
          <BadgesView progress={progress} />
        </Suspense>
      </div>
    </div>
  );
}
