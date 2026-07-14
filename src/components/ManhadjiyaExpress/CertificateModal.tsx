import { motion } from 'motion/react';
import { Award, Sparkles } from 'lucide-react';
import { CERTIFICATE, type Lang } from '../../data/manhadjiyaModules';
import { Bi } from './BilingualSwitcher';

interface CertificateModalProps {
  lang: Lang;
  totalXp: number;
  studentName?: string;
  onEnter: () => void;
}

/** Certificat honnête "شهادة الانطلاق المنهجي" débloquant l'application. */
export default function CertificateModal({ lang, totalXp, studentName, onEnter }: CertificateModalProps) {
  return (
    <div className="w-full max-w-lg mx-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-3xl bg-white dark:bg-[#141916] p-8 text-center shadow-2xl border-4 border-[#fed65b]"
      >
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#fed65b]/20 rounded-full blur-2xl" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#006d37]/10 rounded-full blur-2xl" />

        <div className="relative z-10">
          <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-[#fed65b] to-[#b8860b] flex items-center justify-center shadow-lg mb-4">
            <Award className="w-10 h-10 text-white" />
          </div>

          <p className="text-[11px] font-black tracking-widest text-[#b45309] uppercase">
            كنز العلوم — منهجية إكسبريس
          </p>
          <h2 className="text-2xl font-black text-[#006d37] dark:text-[#2ecc71] mt-2">
            <Bi ar={CERTIFICATE.nameAr} fr={CERTIFICATE.nameFr} lang={lang} />
          </h2>

          {studentName && (
            <p className="text-sm font-bold text-gray-700 dark:text-gray-200 mt-3">{studentName}</p>
          )}

          <p className="text-sm text-gray-600 dark:text-gray-300 leading-7 mt-3">
            <Bi ar={CERTIFICATE.messageAr} fr={CERTIFICATE.messageFr} lang={lang} />
          </p>

          <div className="inline-flex items-center gap-2 bg-[#fff9ed] dark:bg-[#1a221d] border border-[#e2dabf]/60 dark:border-gray-800 rounded-full px-4 py-2 mt-5 font-black text-[#b45309] dark:text-[#fed65b]">
            <Sparkles className="w-4 h-4" /> +{totalXp} XP
          </div>

          <button
            onClick={onEnter}
            className="mt-6 w-full rounded-2xl bg-[#006d37] text-white font-black py-3.5 text-sm hover:bg-[#00562b] transition-colors cursor-pointer"
          >
            <Bi ar="ادخل إلى التطبيق" fr="Entrer dans l'application" lang={lang} />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
