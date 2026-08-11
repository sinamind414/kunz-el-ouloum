import { lazy, Suspense, useMemo, useState } from 'react';
import { Trophy, TrendingUp, Sparkles, Clock, BookOpen, ShieldCheck, Download, Upload, Save } from 'lucide-react';
import { Unit, UserProgress, TabId } from '../types';
import DomainReadinessRadar from './DomainReadinessRadar';
import BacCountdown from './BacCountdown';
import { loadStore, MasteryLevel, MasteryRecord } from '../data/store';
import SpacedRecallCard from './SpacedRecallCard';
import ProgressionTransfer from './ProgressionTransfer';
import EditorialReviewPanel from './EditorialReviewPanel';

const LEVEL_META: Record<MasteryLevel, { color: string; labelAr: string; dot: string }> = {
  unknown: { color: '#9ca3af', labelAr: 'غير معروف', dot: '⚪' },
  needs_work: { color: '#ef4444', labelAr: 'يحتاج عملاً', dot: '🔴' },
  developing: { color: '#eab308', labelAr: 'قيد التطوّر', dot: '🟡' },
  mastered: { color: '#22c55e', labelAr: 'متقن', dot: '🟢' },
};

function Mastery3DSection() {
  const [storeRevision, setStoreRevision] = useState(0);
  const store = useMemo(() => {
    try {
      return loadStore();
    } catch {
      return null;
    }
  }, [storeRevision]);
  if (!store) return null;

  const records = Object.values(store.mastery) as MasteryRecord[];
  const visible = records.filter((r) => {
    const cells = [r.knowledge, r.document, ...Object.values(r.methodology ?? {})];
    return cells.some((c) => (c?.evidenceCount ?? 0) > 0);
  });

  const now = Date.now();
  const dueRecalls = store.recalls.filter(
    (item) => item.completedAt === undefined && item.nextReviewAt > 0 && now >= item.nextReviewAt
  );

  if (visible.length === 0 && dueRecalls.length === 0) {
    return (
      <div className="rounded-3xl bg-white dark:bg-[#141916] border border-gray-200 dark:border-gray-800 p-5 shadow-sm mb-4 text-center">
        <p className="text-sm font-bold text-gray-500 dark:text-gray-400 leading-7">
          لا توجد مراجعات مستحقة اليوم.
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
          أكمل وثيقة أو تحدياً لتظهر أدلة تقدمك ومراجعاتك القادمة.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl bg-white dark:bg-[#141916] border border-gray-200 dark:border-gray-800 p-4 shadow-sm mb-4">
      <h3 className="font-black text-gray-900 dark:text-white mb-3 flex items-center gap-2 text-sm">
        <BookOpen className="w-5 h-5 text-[#006d37]" /> الإتقان ثلاثي الأبعاد + المراجعات
      </h3>

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

      {dueRecalls.length > 0 && (
        <div className="mt-3 space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-black text-amber-700 dark:text-amber-400">
            <Clock className="w-4 h-4" /> مراجعات مستحقة اليوم
          </div>
          {dueRecalls.map((recall) => (
               <SpacedRecallCard
                 key={`${recall.id}_${recall.stage}_${recall.nextReviewAt}`}
                 recall={recall}
                 onComplete={() => setStoreRevision((revision) => revision + 1)}
               />
          ))}
        </div>
      )}
    </div>
  );
}

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
  /** V3 — mode professeur : force le déverrouillage de toutes les unités. */
  teacherOverride?: boolean;
  onTeacherOverrideChange?: (enabled: boolean) => void;
}

export default function ProgressView({ progress, units, onNavigateToTab, teacherOverride, onTeacherOverrideChange }: ProgressViewProps) {
  const [editorMode, setEditorMode] = useState(false);
  const mastery = units.length
    ? Math.round(units.reduce((s, u) => s + u.progress, 0) / units.length)
    : 0;

  const handleExport = () => {
    const backup: Record<string, string | null> = {
      svt_data_version: localStorage.getItem('svt_data_version'),
      svt_progress: localStorage.getItem('svt_progress'),
      svt_units: localStorage.getItem('svt_units'),
      svt_flashcards: localStorage.getItem('svt_flashcards'),
      kunz_meta_v2: localStorage.getItem('kunz_meta_v2'),
      kunz_errors_v2: localStorage.getItem('kunz_errors_v2'),
      kunz_missions_v2: localStorage.getItem('kunz_missions_v2'),
      kunz_mastery_v2: localStorage.getItem('kunz_mastery_v2'),
      kunz_evidences_v2: localStorage.getItem('kunz_evidences_v2'),
      kunz_recalls_v2: localStorage.getItem('kunz_recalls_v2'),
    };
    const dataStr = JSON.stringify(backup);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const date = new Date().toISOString().split('T')[0];
    link.download = `kunz_backup_${date}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const backup = JSON.parse(event.target?.result as string);
        if (backup && backup.svt_progress) {
          Object.keys(backup).forEach(key => {
            if (backup[key] !== null && backup[key] !== undefined) {
              localStorage.setItem(key, backup[key]);
            }
          });
          alert('✅ تم استرجاع البيانات بنجاح! سيتم إعادة تشغيل التطبيق لتطبيق التغييرات.');
          window.location.reload();
        } else {
          alert('❌ ملف النسخة الاحتياطية غير صالح.');
        }
      } catch (err) {
        alert('❌ حدث خطأ أثناء قراءة الملف.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6 pb-28" dir="rtl">
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

      <div className="rounded-3xl bg-white dark:bg-[#141916] border border-gray-200 dark:border-gray-800 p-4 shadow-sm mb-4">
        <h3 className="font-black text-gray-900 dark:text-white mb-2 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-[#006d37]" /> جاهزية المجالات
        </h3>
        <DomainReadinessRadar units={units} />
      </div>
      <div className="mb-4">
        <BacCountdown />
      </div>

      <Mastery3DSection />

      <ProgressionTransfer progress={progress} units={units} />

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

      <Suspense fallback={<SubFallback />}>
        <StatsView progress={progress} units={units} onNavigateToTab={onNavigateToTab} />
      </Suspense>
      <div className="mt-4">
        <Suspense fallback={<SubFallback />}>
          <BadgesView progress={progress} />
        </Suspense>
      </div>

      <div className="mt-4 rounded-3xl bg-white dark:bg-[#141916] border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
        <h3 className="font-black text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <Save className="w-5 h-5 text-[#006d37] dark:text-[#2ecc71]" /> حفظ واسترجاع البيانات
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">
          بما أن التطبيق يعمل بدون إنترنت (Offline)، فإن تقدمك محفوظ على متصفحك فقط.
          لتفادي فقدان بياناتك عند مسح المتصفح، قم بتنزيل نسخة احتياطية بانتظام.
        </p>
        <div className="flex gap-3">
          <button
            onClick={handleExport}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-[#006d37] hover:bg-[#00562b] text-white text-xs font-black shadow-sm transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" /> تنزيل نسخة
          </button>
          <label className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-[#f3f4f5] dark:bg-[#1f2622] hover:bg-[#e7e8e9] dark:hover:bg-[#2c312d] text-gray-900 dark:text-white text-xs font-black border border-gray-200 dark:border-gray-700 shadow-sm transition-colors cursor-pointer">
            <Upload className="w-4 h-4" /> استرجاع نسخة
            <input type="file" accept=".json" className="hidden" onChange={handleImport} />
          </label>
        </div>
      </div>

      {/* V3 — Garde-fou : un professeur peut forcer le déverrouillage (usage en classe). */}
      {onTeacherOverrideChange && (
        <div className="mt-4 rounded-3xl bg-white dark:bg-[#141916] border border-gray-200 dark:border-gray-800 p-4 shadow-sm" data-testid="teacher-override-card">
          <label className="flex items-start justify-between gap-3 cursor-pointer">
            <span className="min-w-0">
              <span className="flex items-center gap-2 font-black text-sm text-gray-900 dark:text-white">
                <ShieldCheck className="w-4 h-4 text-[#006d37] dark:text-[#2ecc71]" />
                وضع الأستاذ — فتح كل الوحدات
              </span>
              <span className="block text-[11px] text-gray-500 dark:text-gray-400 leading-6 mt-1">
                للاستعمال داخل القسم فقط: يلغي القفل التقدمي ويسمح بفتح أي وحدة دون امتحان.
                التلميذ وحده يستفيد من البوصلة عندما يكون هذا الوضع مغلقاً.
              </span>
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={Boolean(teacherOverride)}
              onClick={(e) => { e.preventDefault(); onTeacherOverrideChange(!teacherOverride); }}
              className={`shrink-0 w-12 h-7 rounded-full transition-colors relative ${teacherOverride ? 'bg-[#006d37]' : 'bg-gray-200 dark:bg-gray-700'}`}
            >
              <span
                className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-all ${teacherOverride ? 'right-1' : 'right-6'}`}
              />
            </button>
          </label>
        </div>
      )}

      <button type="button" onClick={() => setEditorMode(!editorMode)} className="w-full mt-4 min-h-10 rounded-2xl border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300 font-black text-xs flex items-center justify-center gap-2 cursor-pointer">
        <ShieldCheck className="w-4 h-4" /> {editorMode ? 'إغلاق وضع الأستاذ' : 'وضع الأستاذ — التحكيم التحريري'}
      </button>

      {editorMode && <EditorialReviewPanel />}
    </div>
  );
}
