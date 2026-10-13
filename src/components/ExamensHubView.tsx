// ExamensHubView.tsx — sous-écran du hub « التمارين والتدريب » (2026-10-12).
//
// Pourquoi un sous-écran plutôt que deux cartes de plus dans le hub : le hub
// plafonne à 8 cartes (limite de lisibilité verrouillée par test). « QCM du
// livre » et « tests bac complets » sont deux façons de SE TESTER, pas deux
// apprentissages distincts — une seule carte « الاختبارات » les annonce, et ce
// sous-écran laisse l'élève choisir laquelle.
//
// Les deux examens vivaient dans l'écran 1 de « الدروس » ; ils l'ont quitté
// parce qu'y produire une réponse relève de l'entraînement, pas de
// l'apprentissage. Ils restent ouverts par deep-link dans LessonsView
// (`initialMode`) : déplacement, pas perte.

import { ArrowRight, BookOpen, GraduationCap } from 'lucide-react';

interface ExamensHubViewProps {
  /** 'qcm' = QCM du livre officiel, 'bac' = 3 tests bac complets. */
  onOpen: (mode: 'qcm' | 'bac') => void;
  onBack?: () => void;
}

const EXAMENS = [
  {
    mode: 'qcm' as const,
    titre: 'اختبار الفصول',
    detail: 'أسئلة حسب الفصول — مع مخططات وتفسيرات فورية لكل إجابة.',
    geste: 'أختبر فصلاً محدداً',
    Icon: BookOpen,
  },
  {
    mode: 'bac' as const,
    titre: 'اختبار بكالوريا',
    detail: 'ثلاثة اختبارات كاملة على 20 نقطة — تصحيح ذاتي على سلّم التنقيط.',
    geste: 'أجتاز امتحاناً كاملاً',
    Icon: GraduationCap,
  },
];

export default function ExamensHubView({ onOpen, onBack }: ExamensHubViewProps) {
  return (
    <div className="min-h-screen p-4 md:p-8 max-w-5xl mx-auto" dir="rtl" data-testid="examens-hub">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <span className="w-12 h-12 rounded-2xl bg-gradient-to-l from-[#006d37] to-emerald-600 flex items-center justify-center shadow-md">
            <GraduationCap className="w-6 h-6 text-white" />
          </span>
          <div className="text-right">
            <h1 className="text-2xl md:text-3xl font-black text-[#1f1c0b] dark:text-gray-100">الاختبارات</h1>
            <p className="text-sm text-[#506072] dark:text-gray-400">اختر نوع الاختبار الذي تريد خوضه</p>
          </div>
        </div>
        {onBack && (
          <button
            data-testid="examens-retour"
            onClick={onBack}
            className="flex flex-row-reverse items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#f3f4f5] dark:bg-[#1f2622] border border-[#bbcbbb]/30 text-sm font-bold text-[#006d37] dark:text-[#2ecc71] cursor-pointer"
          >
            <span>العودة</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {EXAMENS.map((e) => (
          <button
            key={e.mode}
            data-testid={`examens-${e.mode}`}
            onClick={() => onOpen(e.mode)}
            className="text-right bg-white dark:bg-[#141916] rounded-3xl p-5 border border-[#bbcbbb]/30 dark:border-[#2ecc71]/10 shadow-sm hover:shadow-md hover:border-[#006d37]/40 transition-all cursor-pointer"
          >
            <div className="flex items-start gap-3">
              <span className="shrink-0 w-10 h-10 rounded-2xl bg-[#e8f5ee] dark:bg-black/20 flex items-center justify-center">
                <e.Icon className="w-5 h-5 text-[#006d37] dark:text-[#2ecc71]" />
              </span>
              <div className="flex-1">
                <h2 className="text-base font-black text-[#1f1c0b] dark:text-gray-100 mb-1">{e.titre}</h2>
                <p className="text-[13px] leading-6 text-[#506072] dark:text-gray-400 mb-2">{e.detail}</p>
                <span className="inline-block text-[11px] font-bold px-2.5 py-1 rounded-lg bg-[#fff9ed] dark:bg-black/20 text-[#8a6a00] dark:text-[#d9a400]">
                  {e.geste}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
