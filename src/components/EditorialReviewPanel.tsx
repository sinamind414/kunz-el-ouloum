import { useState, useEffect } from 'react';
import { ShieldCheck, CheckCircle2, XCircle, FileText, BookOpen, PenTool } from 'lucide-react';
import {
  type EditorialItem,
  type EditorialItemType,
  getAllEditorialItems,
  setReviewOverride,
  clearReviewOverride,
} from '../services/editorialReviewService';

const TYPE_META: Record<EditorialItemType, { icon: React.ElementType; label: string }> = {
  survival_card: { icon: FileText, label: 'بطاقات النجاة' },
  lesson_summary: { icon: BookOpen, label: 'ملخصات الدروس' },
  document_context: { icon: PenTool, label: 'سياقات الوثائق' },
};

function EditorialItemRow({ item, onToggle }: { item: EditorialItem; onToggle: () => void }) {
  const meta = TYPE_META[item.type];
  const Icon = meta.icon;
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`rounded-xl border p-3 text-xs ${item.reviewed ? 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/40 dark:bg-emerald-950/10' : 'border-amber-200 bg-amber-50/50 dark:border-amber-900/40 dark:bg-amber-950/10'}`}>
      <button type="button" onClick={() => setExpanded(!expanded)} className="w-full flex items-center gap-2 text-right cursor-pointer">
        <Icon className="w-4 h-4 shrink-0 text-gray-500" />
        <span className="flex-1 font-bold text-gray-800 dark:text-gray-200 leading-5 line-clamp-2">{item.label}</span>
        <span className="shrink-0">{item.reviewed ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <XCircle className="w-4 h-4 text-amber-600" />}</span>
      </button>
      {expanded && (
        <div className="mt-2 space-y-2 border-t border-gray-200 dark:border-gray-700 pt-2">
          <div className="flex items-center gap-2">
            <button type="button" onClick={onToggle} className={`min-h-8 px-3 rounded-lg font-black text-xs cursor-pointer ${item.reviewed ? 'bg-amber-200 text-amber-900' : 'bg-emerald-700 text-white'}`}>
              {item.reviewed ? 'إلغاء النشر' : 'نشر'}
            </button>
            {item.editorialStatus && (
              <span className="text-[10px] text-gray-500">{item.editorialStatus}</span>
            )}
          </div>
          {item.reviewed && (
            <div className="text-[10px] text-gray-500 dark:text-gray-400 leading-5">
              {item.reviewedBy && <span>المراجع: {item.reviewedBy} · </span>}
              {item.reviewedAt && <span>{new Date(item.reviewedAt).toLocaleDateString('ar-DZ')} · </span>}
              {item.sourceProgram && <span>{item.sourceProgram}</span>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function EditorialReviewPanel() {
  const [items, setItems] = useState<EditorialItem[]>([]);
  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const [teacherName, setTeacherName] = useState('');
  const [sourceProgram, setSourceProgram] = useState('BAC DZ');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('kunz_editor_name');
      if (saved) setTeacherName(saved);
      const savedProgram = localStorage.getItem('kunz_editor_program');
      if (savedProgram) setSourceProgram(savedProgram);
    } catch {}
    refresh();
  }, []);

  const refresh = () => setItems(getAllEditorialItems());

  const toggleItem = (item: EditorialItem) => {
    if (item.reviewed) {
      clearReviewOverride(item.type, item.id);
    } else {
      setReviewOverride(item.type, item.id, {
        reviewed: true,
        reviewedBy: teacherName || 'أستاذ',
        reviewedAt: new Date().toISOString(),
        sourceProgram: sourceProgram || 'BAC DZ',
        // #59 — Cette revue est declaree localement, sans authentification.
        // Le marqueur suit la donnee (y compris a l'export) pour que l'ecran
        // eleve ne puisse pas la presenter comme une validation externe.
        locallyDeclared: true,
      });
    }
    refresh();
  };

  const publishAll = () => {
    for (const item of items) {
      if (!item.reviewed) toggleItem(item);
    }
  };
  const unpublishAll = () => {
    for (const item of items) {
      if (item.reviewed) toggleItem(item);
    }
  };

  const grouped = (type: EditorialItemType) => items.filter((i) => i.type === type);

  return (
    <section className="rounded-3xl bg-white dark:bg-[#141916] border-2 border-amber-300 dark:border-amber-700 p-4 shadow-sm mb-4" data-testid="editorial-panel">
      <h2 className="font-black text-gray-900 dark:text-white flex items-center gap-2">
        <ShieldCheck className="w-5 h-5 text-amber-600" /> التحكيم التحريري
      </h2>
      <p className="text-[10px] leading-5 text-gray-500 dark:text-gray-400 mt-1">
        وضع الأستاذ — المراجعة والنشر. التغييرات محفوظة محلياً.
      </p>
      {/* #59 — Ce mode n'est protege par aucun mot de passe : n'importe quel
          utilisateur peut l'ouvrir et signer du nom qu'il veut. Le dire ici
          est le minimum tant qu'aucune authentification n'existe. */}
      <p
        data-testid="editorial-local-only-notice"
        className="text-[10px] leading-5 text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-xl p-2 mt-2"
      >
        هذا الوضع غير محمي بكلمة سر ولا يتحقق من هوية من يستعمله. ما يُنشر هنا يُعدّ
        <strong> مراجعة محلية على هذا الجهاز فقط</strong>، ولا يمثل مصادقة من أي أستاذ أو هيئة.
      </p>

      {mode === 'edit' && (
        <div className="grid sm:grid-cols-2 gap-2 mt-3">
          <input type="text" value={teacherName} onChange={(e) => { setTeacherName(e.target.value); try { localStorage.setItem('kunz_editor_name', e.target.value); } catch {} }} placeholder="اسم الأستاذ" className="px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs font-bold text-right" />
          <input type="text" value={sourceProgram} onChange={(e) => { setSourceProgram(e.target.value); try { localStorage.setItem('kunz_editor_program', e.target.value); } catch {} }} placeholder="البرنامج" className="px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs font-bold text-right" />
        </div>
      )}
      <div className="flex gap-2 mt-2">
        <button type="button" onClick={() => setMode(mode === 'edit' ? 'view' : 'edit')} className="min-h-8 px-3 rounded-lg border border-gray-300 dark:border-gray-600 font-bold text-xs cursor-pointer">
          {mode === 'edit' ? 'تم' : 'تعديل الاسم'}
        </button>
        <button type="button" onClick={publishAll} className="min-h-8 px-3 rounded-lg bg-emerald-700 text-white font-black text-xs cursor-pointer">نشر الكل</button>
        <button type="button" onClick={unpublishAll} className="min-h-8 px-3 rounded-lg bg-amber-200 text-amber-900 font-black text-xs cursor-pointer">إلغاء نشر الكل</button>
      </div>

      {(['survival_card', 'lesson_summary', 'document_context'] as EditorialItemType[]).map((type) => {
        const typeItems = grouped(type);
        if (typeItems.length === 0) return null;
        const meta = TYPE_META[type];
        const Icon = meta.icon;
        return (
          <div key={type} className="mt-3">
            <h3 className="font-black text-xs text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1.5">
              <Icon className="w-3.5 h-3.5" /> {meta.label} ({typeItems.length})
            </h3>
            <div className="space-y-1.5">
              {typeItems.map((item) => (
                <EditorialItemRow key={`${item.type}:${item.id}`} item={item} onToggle={() => toggleItem(item)} />
              ))}
            </div>
          </div>
        );
      })}
    </section>
  );
}
