// AnimationsView.tsx — U4 (audits Opus/Gemini) : galerie d'animations vectorielles
// de mécanismes clés. SVG/SMIL pur (quelques Ko), fonctionnel hors-ligne sur 3G.

import { motion } from 'motion/react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { ANIMATION_CATALOG } from './ScienceAnimations';

interface AnimationsViewProps {
  onBackToHome: () => void;
}

export default function AnimationsView({ onBackToHome }: AnimationsViewProps) {
  return (
    <div className="min-h-screen p-4 md:p-8 max-w-5xl mx-auto" dir="rtl">
      <div className="flex flex-row-reverse items-center justify-between gap-4 mb-8">
        <div className="flex flex-row-reverse items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-l from-emerald-500 to-teal-600 flex items-center justify-center shadow-md">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div className="text-right">
            <h1 className="text-2xl md:text-3xl font-black text-[#1f1c0b] dark:text-gray-100">الأنميشن العلمي</h1>
            <p className="text-sm text-[#506072] dark:text-gray-400">محاكاة متحركة لآليات البكالوريا — تعمل دون أنترنت</p>
          </div>
        </div>
        <button
          onClick={onBackToHome}
          className="flex flex-row-reverse items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#f3f4f5] dark:bg-[#1f2622] hover:bg-[#e8f5ee] dark:hover:bg-[#141916] border border-[#bbcbbb]/30 dark:border-[#2ecc71]/10 text-sm font-bold text-[#006d37] dark:text-[#2ecc71] transition-all cursor-pointer"
        >
          <span>العودة</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {ANIMATION_CATALOG.map(({ id, titleAr, unitAr, Component }, i) => (
          <motion.div
            key={id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-white dark:bg-[#141916] rounded-3xl p-5 border border-[#bbcbbb]/30 dark:border-[#2ecc71]/10 shadow-sm hover:shadow-md transition-shadow"
          >
            <Component />
            <div className="mt-4 pt-3 border-t border-[#bbcbbb]/20 dark:border-[#2ecc71]/10">
              <span className="text-[11px] font-bold text-[#506072] dark:text-gray-400 bg-[#f3f4f5] dark:bg-black/20 px-2.5 py-1 rounded-lg">
                {unitAr}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      <p className="mt-8 text-center text-xs text-[#506072] dark:text-gray-500 leading-relaxed max-w-2xl mx-auto">
        كل محاكاة مرسومة برمجيًا (SVG) ولا تحتاج اتصالاً بالإنترنت. إن واجهت رسومًا لا تظهر، حدّث المتصفح أو فعّل وضع السطح المكتب.
      </p>
    </div>
  );
}
