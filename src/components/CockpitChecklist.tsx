import { useState } from 'react';
import { Target, Info, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';

interface ChecklistItem {
  id: string;
  label: string;
  desc: string;
}

interface CockpitChecklistProps {
  verb: string;
  verbColor: string;
}

// Les Checklists officielles selon la Manhadjiya BAC DZ
const CHECKLISTS: Record<string, ChecklistItem[]> = {
  'حلل': [
    { id: 'pres', label: 'التقديم', desc: 'التعريف بالوثيقة (تمثل الوثيقة... حيث نلاحظ...)' },
    { id: 'obs', label: 'الملاحظة (التفكيك)', desc: 'تفكيك المعطيات وتحديد التغيرات (تزايد، تناقص، ثبات)' },
    { id: 'link', label: 'الربط', desc: 'إيجاد العلاقة المنطقية بين المتغيرات (دلالة على...)' },
    { id: 'deduc', label: 'الاستنتاج', desc: 'استخراج معلومة جديدة (ومنه نستنتج أن...)' }
  ],
  'فسر': [
    { id: 'obs_f', label: 'الملاحظة', desc: 'ماذا حدث؟ (نلاحظ أن...)' },
    { id: 'cause', label: 'السبب (الآلية)', desc: 'لماذا حدث؟ (بسبب / يعود ذلك إلى...)' },
    { id: 'link_f', label: 'الربط العلمي', desc: 'توضيح الآلية العلمية الخفية التي أدت للنتيجة' }
  ],
  'استنتج': [
    { id: 'logic', label: 'المنطق', desc: 'بناءاً على المعطيات السابقة...' },
    { id: 'rule', label: 'القاعدة', desc: 'استخراج القاعدة العامة أو المعلومة المخفية' }
  ],
  'قارن': [
    { id: 'pres_q', label: 'التقديم', desc: 'تقديم الوثيقة أو الظاهرتين' },
    { id: 'sim', label: 'أوجه التشابه', desc: 'ذكر النقاط المشتركة بينهما' },
    { id: 'diff', label: 'أوجه الاختلاف', desc: 'ذكر الفروق (بينما / في حين)' },
    { id: 'deduc_q', label: 'الاستنتاج', desc: 'الخروج بخلاصة المقارنة' }
  ]
};

export default function CockpitChecklist({ verb, verbColor }: CockpitChecklistProps) {
  const [isOpen, setIsOpen] = useState(true);
  const checklist = CHECKLISTS[verb];

  if (!checklist) return null;

  return (
    <div className="bg-[#1f2937] border-l-4 rounded-xl p-3 sm:p-4 mb-4 shadow-lg text-white" style={{ borderLeftColor: verbColor }}>
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-[#fed65b]" />
          <h4 className="font-black text-sm">شبكة المصحح (Checklist) : <span style={{ color: verbColor }}>{verb}</span></h4>
        </div>
        <button className="text-gray-400 hover:text-white transition-colors">
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {isOpen && (
        <div className="mt-3 space-y-2">
          <p className="text-[10px] sm:text-[11px] text-gray-400 font-bold mb-3">
            المصحح في البكالوريا يضع النقطة بناءً على هذه الخطوات. تأكد من وجودها في إجابتك:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {checklist.map((item, idx) => (
              <label key={item.id} className="flex items-start gap-2 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
                <div className="relative flex items-center justify-center w-4 h-4 mt-0.5 rounded border border-gray-500 group-hover:border-[#2ecc71] transition-colors">
                  <input type="checkbox" className="peer sr-only" />
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#2ecc71] opacity-0 peer-checked:opacity-100 transition-opacity absolute" />
                </div>
                <div>
                  <div className="text-[11px] font-black text-white">{idx + 1}. {item.label}</div>
                  <div className="text-[9px] text-gray-400 mt-0.5">{item.desc}</div>
                </div>
              </label>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#fed65b]/10 text-[#fed65b] text-[10px] font-bold">
            <Info className="w-3.5 h-3.5" />
            هذه المربعات لك فقط (لتنظيم أفكارك). لن تمنعك من الإجابة.
          </div>
        </div>
      )}
    </div>
  );
}
