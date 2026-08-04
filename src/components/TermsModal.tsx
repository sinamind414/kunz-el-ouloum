import { X, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TermsModal({ isOpen, onClose }: TermsModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-[#141916] w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-[#e2dabf]/50 dark:border-[#2ecc71]/20 flex flex-col max-h-[85vh]"
          dir="rtl"
        >
          {/* Header */}
          <div className="bg-[#f8f9fa] dark:bg-[#0c0f0d] p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <h2 className="text-lg font-black text-[#006d37] dark:text-[#2ecc71] flex items-center gap-2">
              <ShieldCheck className="w-5 h-5" />
              شروط الاستخدام وسياسة الخصوصية
            </h2>
            <button 
              onClick={onClose}
              className="p-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-500"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 sm:p-6 overflow-y-auto flex flex-col gap-4 text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
            <p>
              أهلاً بك في تطبيق <strong>كنز العلوم</strong>. استخدامك لهذا التطبيق يعني موافقتك الصريحة على الشروط التالية:
            </p>

            <div className="space-y-1.5">
              <h3 className="font-black text-[#1f1c0b] dark:text-white text-base">1. الخصوصية والبيانات (Offline-First)</h3>
              <p className="text-xs">
                صُمم هذا التطبيق للعمل بدون إنترنت حفاظاً على خصوصيتك. <strong>جميع بياناتك، إجاباتك، ومستوى تقدمك تُحفظ محلياً على جهازك فقط</strong> (عبر متصفحك). نحن لا نقوم بجمع، تخزين، أو بيع أي بيانات شخصية لك في أي خادم خارجي. 
                في حال قمت بمسح بيانات المتصفح (Cache/History)، ستفقد تقدمك، ولا يتحمل التطبيق مسؤولية ذلك. يُنصح باستخدام ميزة "تصدير البيانات" دورياً.
              </p>
            </div>

            <div className="space-y-1.5">
              <h3 className="font-black text-[#1f1c0b] dark:text-white text-base">2. المحتوى العلمي والمسؤولية المحدودة</h3>
              <p className="text-xs">
                يقدم التطبيق محتوى تعليمياً استرشادياً مبنياً على التدرج السنوي لوزارة التربية الوطنية (الجزائر). 
                الرسومات التوضيحية (بما فيها المُولدة وتفاعلية) والمحتوى العلمي هي <strong>أدوات مساعدة للفهم والمراجعة، ولا تغني بأي حال من الأحوال عن المقرر الرسمي، الكتاب المدرسي، أو الأستاذ في القسم.</strong> 
                لا يتحمل المطورون مسؤولية أي سوء فهم أو خطأ غير مقصود قد يرد في التطبيق.
              </p>
            </div>

            <div className="space-y-1.5">
              <h3 className="font-black text-[#1f1c0b] dark:text-white text-base">3. المرشد الذكي (الذكاء الاصطناعي المحلي)</h3>
              <p className="text-xs">
                المرشد الموجود في التطبيق هو محرك بحث وخوارزمية تحليل تعمل محلياً للبحث في قاعدة البيانات المدمجة. <strong>إنه ليس ذكاءً اصطناعياً توليدياً (مثل ChatGPT)</strong>، وقد تكون إجاباته أحياناً غير دقيقة إذا لم تتطابق كلماتك مع القاعدة. يرجى دائماً التأكد من الإجابات عبر دروس التطبيق.
              </p>
            </div>

            <div className="space-y-1.5">
              <h3 className="font-black text-[#1f1c0b] dark:text-white text-base">4. الملكية الفكرية</h3>
              <p className="text-xs">
                جميع حقوق التصميم، البرمجة، والمنهجية المتبعة في (كنز العلوم) محفوظة. يُمنع منعاً باتاً استنساخ التطبيق أو استغلال محتواه لأغراض تجارية دون إذن مسبق.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 sm:p-5 border-t border-gray-100 dark:border-gray-800 bg-[#f8f9fa] dark:bg-[#0c0f0d]">
            <button
              onClick={onClose}
              className="w-full py-3 bg-[#006d37] hover:bg-[#00562b] text-white rounded-xl font-black shadow-sm transition-all text-sm"
            >
              قرأت الشروط وأوافق عليها
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
