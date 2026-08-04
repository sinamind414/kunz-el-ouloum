import { useRef, useState } from 'react';
import { Download, FileCheck2, ShieldCheck, Upload } from 'lucide-react';
import type { Unit, UserProgress } from '../types';
import {
  applyProgressionImport,
  createProgressionExport,
  progressionExportFilename,
  type ProgressionImportResult,
  validateProgressionImport,
} from '../services/progressionTransferService';

interface ProgressionTransferProps {
  progress: UserProgress;
  units: Unit[];
}

export default function ProgressionTransfer({ progress, units }: ProgressionTransferProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [candidate, setCandidate] = useState<ProgressionImportResult | null>(null);
  const [applyError, setApplyError] = useState('');
  const [imported, setImported] = useState(false);

  const exportProgression = () => {
    const json = JSON.stringify(createProgressionExport(progress, units), null, 2);
    const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = progressionExportFilename();
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const readImport = async (file?: File) => {
    setApplyError('');
    if (!file) return;
    setCandidate(validateProgressionImport(await file.text()));
  };

  const confirmImport = () => {
    if (!candidate?.ok) return;
    if (!applyProgressionImport(candidate.file, units)) {
      setApplyError('Import impossible. La progression actuelle a été conservée.');
      return;
    }
    setCandidate(null);
    setImported(true);
    setTimeout(() => window.location.reload(), 4000);
  };

  const resetAll = () => {
    setCandidate(null);
    setApplyError('');
    setImported(false);
  };

  return (
    <section className="rounded-3xl bg-white dark:bg-[#141916] border border-gray-200 dark:border-gray-800 p-4 shadow-sm mb-4" aria-labelledby="progression-transfer-title">
      <h2 id="progression-transfer-title" className="font-black text-gray-900 dark:text-white flex items-center gap-2">
        <ShieldCheck className="w-5 h-5 text-[#006d37]" /> نقل التقدم
      </h2>
      <p className="text-xs leading-6 text-gray-500 dark:text-gray-400 mt-1">
        صدّر الأدلة والأخطاء والمراجعات والإتقان والجلسات، ثم استعدها على جهاز آخر.
      </p>
      <div className="grid sm:grid-cols-2 gap-2 mt-3">
        <button type="button" onClick={exportProgression} className="min-h-11 rounded-2xl bg-[#006d37] text-white font-black text-sm flex items-center justify-center gap-2 cursor-pointer">
          <Download className="w-4 h-4" /> تصدير التقدم
        </button>
        <button type="button" onClick={() => inputRef.current?.click()} className="min-h-11 rounded-2xl border border-[#006d37] text-[#006d37] dark:text-emerald-300 font-black text-sm flex items-center justify-center gap-2 cursor-pointer">
          <Upload className="w-4 h-4" /> اختيار ملف للاستيراد
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="application/json,.json"
          className="sr-only"
          aria-label="ملف تقدم Kunz"
          onChange={(event) => void readImport(event.target.files?.[0])}
        />
      </div>

      {candidate && !candidate.ok && (
        <div role="alert" className="mt-3 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 p-3 text-xs font-bold text-red-700 dark:text-red-300">
          {candidate.error}
        </div>
      )}

      {candidate?.ok && (
        <div className="mt-3 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 p-3" data-testid="import-preview">
          <h3 className="font-black text-sm text-amber-900 dark:text-amber-200 flex items-center gap-2">
            <FileCheck2 className="w-4 h-4" /> معاينة قبل الاستبدال
          </h3>
          <p className="text-[11px] text-amber-800 dark:text-amber-300 mt-1">
            تاريخ التصدير: {new Date(candidate.preview.exportedAt).toLocaleString('ar-DZ')}
          </p>
          <dl className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 text-center">
            <div className="rounded-xl bg-white/70 dark:bg-black/20 p-2"><dt className="text-[10px]">XP</dt><dd className="font-black">{candidate.preview.xp}</dd></div>
            <div className="rounded-xl bg-white/70 dark:bg-black/20 p-2"><dt className="text-[10px]">الأدلة</dt><dd className="font-black">{candidate.preview.evidences}</dd></div>
            <div className="rounded-xl bg-white/70 dark:bg-black/20 p-2"><dt className="text-[10px]">الأخطاء</dt><dd className="font-black">{candidate.preview.errors}</dd></div>
            <div className="rounded-xl bg-white/70 dark:bg-black/20 p-2"><dt className="text-[10px]">المراجعات</dt><dd className="font-black">{candidate.preview.recalls}</dd></div>
            <div className="rounded-xl bg-white/70 dark:bg-black/20 p-2"><dt className="text-[10px]">الوحدات المكتملة</dt><dd className="font-black">{candidate.preview.completedUnits}</dd></div>
            <div className="rounded-xl bg-white/70 dark:bg-black/20 p-2"><dt className="text-[10px]">إتقانات مثبتة</dt><dd className="font-black">{candidate.preview.masteredCells}</dd></div>
            <div className="rounded-xl bg-white/70 dark:bg-black/20 p-2"><dt className="text-[10px]">الجلسات</dt><dd className="font-black">{candidate.preview.snapshots}</dd></div>
          </dl>
          <div className="rounded-xl bg-amber-100/70 dark:bg-black/20 border border-amber-300 dark:border-amber-800 p-3 mt-3">
            <p className="text-xs font-bold text-amber-900 dark:text-amber-200 leading-6">
              سيتم استيراد تقدمك، الأدلة، الأخطاء، والمراجعات.
            </p>
            <p className="text-xs font-bold text-red-600 dark:text-red-400 leading-6 mt-1">
              لن يتم استيراد المهام الجارية، وسيعاد إنشاء مسار جديد حسب تقدمك المستورد.
            </p>
          </div>
          <p className="text-xs font-bold text-amber-900 dark:text-amber-200 leading-6 mt-3">
            سيستبدل هذا الملف تقدمك الحالي. لا يمكن التراجع بعد التأكيد.
          </p>
          {applyError && <p role="alert" className="text-xs font-bold text-red-700 dark:text-red-300 mt-2">{applyError}</p>}
          <div className="flex gap-2 mt-3">
            <button type="button" onClick={confirmImport} className="min-h-11 flex-1 rounded-xl bg-[#006d37] text-white font-black text-xs cursor-pointer">
              استيراد التقدم
            </button>
            <button type="button" onClick={() => setCandidate(null)} className="min-h-11 px-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 font-bold text-xs cursor-pointer">
              إلغاء
            </button>
          </div>
        </div>
      )}

      {imported && (
        <div className="mt-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 p-3" data-testid="import-success">
          <p className="text-xs font-black text-emerald-800 dark:text-emerald-200 leading-6">
            تم استيراد تقدمك بنجاح.
          </p>
          <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300 leading-6">
            سيتم إنشاء مسار مراجعة جديد حسب أخطائك وتذكيراتك.
          </p>
          <button type="button" onClick={resetAll} className="mt-2 text-xs font-bold text-emerald-700 dark:text-emerald-300 underline cursor-pointer">
            موافق
          </button>
        </div>
      )}

      <p className="text-[10px] leading-5 text-gray-400 mt-3">لا يتضمن الملف الحساب أو مفاتيح الاتصال أو الأسرار.</p>
    </section>
  );
}
