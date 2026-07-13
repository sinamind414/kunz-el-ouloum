import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, Clock, X, Flame } from 'lucide-react';

interface StudyReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSchedule: (hours: number) => void;
}

export default function StudyReminderModal({ isOpen, onClose, onSchedule }: StudyReminderModalProps) {
  const [scheduledHours, setScheduledHours] = useState<number>(1);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-[#1a201c] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-[#e2dabf] dark:border-[#2ecc71]/20 flex flex-col"
          dir="rtl"
        >
          {/* Header */}
          <div className="bg-gradient-to-l from-[#006d37] to-[#2ecc71] p-6 text-white relative">
            <button 
              onClick={onClose}
              className="absolute top-4 left-4 p-1.5 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
                <Flame className="w-6 h-6 text-[#fed65b] fill-[#fed65b]" />
              </div>
              <h2 className="text-2xl font-black">جاهز للعودة؟</h2>
            </div>
            <p className="text-white/90 text-sm font-medium leading-relaxed">
              لقد مر أكثر من 24 ساعة منذ آخر جلسة دراسة لك! الاستمرارية هي مفتاح التفوق في شهادة البكالوريا.
            </p>
          </div>

          {/* Body */}
          <div className="p-6 flex flex-col gap-5">
            <button
              onClick={onClose}
              className="w-full py-3.5 bg-[#006d37] hover:bg-[#00562b] text-white rounded-xl font-black shadow-md shadow-[#006d37]/20 transition-all flex items-center justify-center gap-2"
            >
              <Flame className="w-5 h-5 text-[#fed65b] fill-[#fed65b]" />
              <span>ابدأ الدراسة الآن واستمر في الحماس!</span>
            </button>

            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-gray-200 dark:border-gray-800"></div>
              <span className="flex-shrink-0 mx-4 text-xs font-bold text-gray-400 dark:text-gray-500">أو تذكيري لاحقاً</span>
              <div className="flex-grow border-t border-gray-200 dark:border-gray-800"></div>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 bg-gray-50 dark:bg-[#1f2622] p-2 rounded-xl border border-gray-100 dark:border-gray-800">
                <Clock className="w-5 h-5 text-[#006d37] dark:text-[#2ecc71] mr-2" />
                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">بعد</span>
                <select
                  value={scheduledHours}
                  onChange={(e) => setScheduledHours(Number(e.target.value))}
                  className="bg-white dark:bg-[#141916] border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 text-sm rounded-lg focus:ring-[#006d37] focus:border-[#006d37] block w-24 p-2 font-bold cursor-pointer outline-none"
                  dir="rtl"
                >
                  <option value={1}>ساعة</option>
                  <option value={2}>ساعتين</option>
                  <option value={4}>4 ساعات</option>
                  <option value={8}>8 ساعات</option>
                  <option value={24}>غداً</option>
                </select>
                <button
                  onClick={() => onSchedule(scheduledHours)}
                  className="mr-auto px-4 py-2 bg-white dark:bg-[#141916] border border-[#e2dabf] dark:border-gray-700 text-[#006d37] dark:text-[#2ecc71] hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg text-sm font-bold transition-colors flex items-center gap-2 shadow-sm"
                >
                  <Bell className="w-4 h-4" />
                  <span>جدولة</span>
                </button>
              </div>
              <p className="text-[10px] text-gray-400 text-center px-4 font-medium">
                سنقوم بجدولة إشعار لتذكيرك بعد المدة المحددة (يتطلب السماح بالإشعارات).
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
