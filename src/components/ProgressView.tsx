import { lazy, Suspense, useMemo } from 'react';
import { Trophy, TrendingUp, Sparkles, Clock, BookOpen } from 'lucide-react';
import { Unit, UserProgress, TabId } from '../types';
import DomainReadinessRadar from './DomainReadinessRadar';
import BacCountdown from './BacCountdown';
import { loadStore, MasteryLevel, MasteryRecord, DAY_MS } from '../data/store';

// V3 §4.7 / §4.8 — Maîtrise 3D + rappels espacés visibles (données réelles).
const LEVEL_META: Record<MasteryLevel, { color: string; labelAr: string; dot: string }> = {
  unknown: { color: '#9ca3af', labelAr: 'غير معروف', dot: '⚪' },
  needs_work: { color: '#ef4444', labelAr: 'يحتاج عملاً', dot: '🔴' },
  developing: { color: '#eab308', labelAr: 'قيد التطوّر', dot: '🟡' },
  mastered: { color: '#22c55e', labelAr: 'متقن', dot: '🟢' },
};

function Mastery3DSection() {
  const store = useMemo(() => {
    try {
      return loadStore();
    } catch {
      return null;
    }
  }, []);
  if (!store) return null;

  const records = Object.values(store.mastery) as MasteryRecord[];
  const visible = records.filter((r) => {
    const cells = [r.knowledge, r.document, ...Object.values(r.methodology ?? {})];
    return cells.some((c) => (c?.evidenceCount ?? 0) > 0);
  });

  const now = Date.now();
  const due = store.learningErrors.filter(
    (e) => e.resolvedAt == null && e.nextReviewAt > 0 && now >= e.nextReviewAt
  );

  if (visible.length === 0 && due.length === 0) return null;

  return (
    <div className="rounded-3xl bg-white dark:bg-[#141916] border border-gray-200 dark:border-gray-800 p-4 shadow-sm mb-4">
      <h3 className="font-black text-gray-900 dark:text-white mb-3 flex items-center gap-2 text-sm">
        <BookOpen className="w-5 h-5 text-[#006d37]" /> الإتقان ثلاثي الأبعاد + المراجعات
      </h3>

      {/* Maîtrise 3D : Connaissance / Document / Méthode */}
      <div className="space-y-2">
        {visible.map((r) => (
          <div key={r.conceptId} className="rounded-2xl border border-gray-100 dark:border-gray-800 p-3">
            <div className="text-xs font-black text-gray-900 dark:text-white mb-2">{r.conceptId}</div>
            <div className="grid grid-cols-3 gap-2 text-center">
              {(['knowledge', 'document', 'methodology'] as const).map((dim) => {
                const cell = dim === 'methodology'
                  ? Object.values(r.methodology ?? {}).sort((a, b) => (b?.evidenceCount ?? 0) - (a?.evidenceCount ?? 0))[0]
                  : r[dim];
                const lvl = (cell?.level ?? 'unknown') as MasteryLevel;
                const meta = LEVEL_META[lvl];
                const dimLabel = dim === 'knowledge' ? 'معرفة' : dim === 'document' ? 'وثيقة' : 'منهجية';
                return (
                  <div key={dim} className="rounded-xl bg-gray-50 dark:bg-gray-900/40 p-2">
                    <div className="text-[10px] font-bold text-gray-500 dark:text-gray-400">{dimLabel}</div>
                    <div className="mt-1 font-black" style={{ color: meta.color }}>
                      {meta.dot}
                    </div>
                    <div className="text-[9px] font-bold mt-0.5" style={{ color: meta.color }}>{meta.labelAr}</div>
                    {cell?.evidenceCount != null && cell.evidenceCount > 0 && (
                      <div className="text-[9px] text-gray-400">{cell.evidenceCount} دليل</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Rappels espacés échus (J+1 → J+14) */}
      {due.length > 0 && (
        <div className="mt-3 space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-black text-amber-700 dark:text-amber-400">
            <Clock className="w-4 h-4" /> مراجعات مستحقة اليوم
          </div>
          {due.map((e) => (
            <div key={e.id} className="flex items-center justify-between rounded-xl bg-amber-50 dark:bg-amber-900/20 px-3 py-2 text-xs font-bold">
              <span className="text-gray-900 dark:text-white">{e.conceptId ?? e.id}</span>
              <span className="text-amber-700 dark:text-amber-400">
                {Math.max(0, Math.round((now - e.nextReviewAt) / DAY_MS))} يوم مضت
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

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

      {/* Maîtrise 3D + rappels visibles */}
      <Mastery3DSection />

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
