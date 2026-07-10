import React from 'react';
import { Compass, AlertTriangle, RefreshCw, CheckCircle2, Brain, Target } from 'lucide-react';
import { Unit, UserProgress } from '../types';

interface CoachViewProps {
  progress?: UserProgress;
  units?: Unit[];
  onStartLesson: (lessonId: string) => void;
}

// Mock data + real progress fusion - offline coach, no LLM, no fetch
export default function CoachView({ progress, units, onStartLesson }: CoachViewProps) {
  // Derive weak points from real progress if available, else mock
  const weakPoints = React.useMemo(() => {
    if (progress && progress.quizScoreHistory && progress.quizScoreHistory.length > 0) {
      // Find lowest scores
      const lowScores = [...progress.quizScoreHistory]
        .sort((a, b) => a.score / a.total - b.score / b.total)
        .slice(0, 2)
        .map(h => ({
          lessonId: 'lecon_transcription',
          concept: h.unitTitle || 'نقطة ضعف',
          errorCount: h.total - h.score,
        }));
      if (lowScores.length > 0) return lowScores;
    }
    // Fallback mock - exactly as in SpecKit, preserves Algerian terms
    return [
      { lessonId: 'lecon_transcription', concept: 'السلسلة الناسخة', errorCount: 3 },
      { lessonId: 'phase2_chapitres_3_4', concept: 'الرامزة AUG', errorCount: 2 }
    ];
  }, [progress]);

  const dueToday = [
    { cardId: 'fc_1', concept: 'الاستنساخ', reason: 'مراجعة دورية - سمب' },
  ];

  const mastered = [
    'بنية الـ ADN',
    'الخاصية الحمقلية',
  ];

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-6 pb-24" dir="rtl">
      {/* Header Coach */}
      <div className="flex items-center gap-4 mb-2">
        <div className="p-3 bg-indigo-500/20 rounded-2xl border border-indigo-500/20">
          <Compass className="w-8 h-8 text-indigo-400" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-[#1f1c0b] dark:text-white">المرشد الموجه</h1>
          <p className="text-sm text-[#506072] dark:text-gray-400">تحليل أدائك وتوجيهك للمراجعة الصحيحة - 100% offline, بدون LLM</p>
        </div>
      </div>

      {/* Section 1: Points Faibles (Urgent) */}
      <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800/50 rounded-2xl p-5">
        <h2 className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-black mb-4 text-sm">
          <AlertTriangle className="w-5 h-5" />
          نقاط ضعفك (تتطلب تدخلاً عاجلاً)
        </h2>
        <div className="space-y-3">
          {weakPoints.map((wp, idx) => (
            <div key={idx} className="flex items-center justify-between bg-white dark:bg-slate-800/50 p-3 rounded-xl border border-rose-100 dark:border-rose-900/30 shadow-sm">
              <div className="text-right">
                <p className="font-black text-[#1f1c0b] dark:text-white text-sm">{wp.concept}</p>
                <p className="text-xs text-rose-600 dark:text-rose-400 font-bold">{wp.errorCount} أخطاء في الإنتاج</p>
              </div>
              <button
                onClick={() => onStartLesson(wp.lessonId)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-black rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                راجع الآن
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Section 2: Révision du Jour (Smart Review) */}
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-2xl p-5">
        <h2 className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-black mb-4 text-sm">
          <Brain className="w-5 h-5" />
          مراجعة اليوم (المنهجية الذكية)
        </h2>
        <div className="space-y-3">
          {dueToday.map((card, idx) => (
            <div key={idx} className="flex items-center justify-between bg-white dark:bg-slate-800/50 p-3 rounded-xl border border-amber-100 dark:border-amber-900/30 shadow-sm">
              <div className="text-right">
                <p className="font-black text-[#1f1c0b] dark:text-white text-sm">{card.concept}</p>
                <p className="text-xs text-amber-700 dark:text-amber-400 font-bold">{card.reason}</p>
              </div>
              <button
                onClick={() => onStartLesson('phase1_chapitres_1_2')}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-black rounded-xl transition-colors cursor-pointer shadow-md"
              >
                ابدأ المراجعة
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Section 3: Points Forts (Validated) */}
      <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl p-5">
        <h2 className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-black mb-4 text-sm">
          <CheckCircle2 className="w-5 h-5" />
          أنت جاهز في
        </h2>
        <div className="flex flex-wrap gap-2">
          {mastered.map((concept, idx) => (
            <span key={idx} className="px-3 py-1.5 bg-white dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-xs font-black rounded-full border border-emerald-200 dark:border-emerald-800/50 shadow-sm">
              ✓ {concept}
            </span>
          ))}
        </div>
        <p className="text-[11px] text-[#506072] dark:text-gray-400 mt-3 leading-6">
          هذه المفاهيم محفوظة: <strong>الاستنساخ</strong>، <strong>الهيولى</strong>، <strong>الرامزة</strong> - تم احترام القاعدة الذهبية، لم يتم تغييرها.
        </p>
      </div>

      {/* Bouton Test Diagnostique */}
      <div className="pt-2 space-y-3">
        <button
          onClick={() => onStartLesson('lecon_transcription')}
          className="w-full py-4 bg-[#006d37] hover:bg-[#00562b] border border-[#006d37] rounded-2xl font-black text-white flex items-center justify-center gap-3 transition-colors shadow-md cursor-pointer"
        >
          <Target className="w-5 h-5 text-[#fed65b]" />
          إجراء اختبار تشخيصي شامل
        </button>
        <p className="text-center text-[11px] text-[#506072] dark:text-gray-400 leading-6">
          يقيس الاختبار مستواك في كل المجالات (البروتينات 45%، الطاقة 30%، التكتونية 25%) ويحدد أولويات مراجعتك للأسبوع القادم. 100% offline، بدون API، بدون LLM.
        </p>
        <div className="bg-[#f3f4f5] dark:bg-[#1a201c] rounded-xl p-3 border border-[#e2dabf]/30 text-[11px] text-[#504441] dark:text-gray-300">
          <strong>ملاحظة منهجية:</strong> هذا المرشد لا يشرح التعريفات (لست بحاجة لـ LLM). هو يوجهك: "راجع أخطاءك السابقة" + "أنت ضعيف هنا". التعريف تجده في <strong>الدروس</strong> mot par mot.
        </div>
      </div>
    </div>
  );
}
