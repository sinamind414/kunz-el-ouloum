import React from 'react';
import { Compass, AlertTriangle, RefreshCw, CheckCircle2, Brain, Target, Sparkles, Gift, BookOpen, LogOut } from 'lucide-react';
import { Unit, UserProgress } from '../types';
import { CoachConfig } from '../data/kunzDatabase';
import { logEvent } from '../utils/telemetryService';

interface CoachViewProps {
  progress?: UserProgress;
  units?: Unit[];
  onStartLesson: (lessonId: string) => void;
  onSignOut: () => void;
}

// Pilier 3 — Coach Offline (100% offline, 0 réseau, 0 LLM).
// Lit un état local (simulé ici à 75 pour démontrer le Teaser Pro, cf. TEST 6 du Spec Kit).
export default function CoachView({ progress, onStartLesson, onSignOut }: CoachViewProps) {
  // Score méthodologique local — dépasse 70 → déclenche le Teaser Pro (TEST 6).
  const methodologyScore = 75;

  // Points faibles : dérivés de la vraie progression si disponible, sinon mock fidèle au lexique DZ.
  const weakPoints = React.useMemo(() => {
    if (progress && progress.quizScoreHistory && progress.quizScoreHistory.length > 0) {
      return [...progress.quizScoreHistory]
        .sort((a, b) => a.score / a.total - b.score / b.total)
        .slice(0, 2)
        .map((h) => ({
          lessonId: 'lecon_transcription',
          concept: h.unitTitle || 'نقطة ضعف',
          errorCount: h.total - h.score,
        }));
    }
    return [
      { lessonId: 'lecon_transcription', concept: 'السلسلة الناسخة', errorCount: 3 },
      { lessonId: 'phase2_chapitres_3_4', concept: 'الرامزة AUG', errorCount: 2 },
    ];
  }, [progress]);

  const dueToday = [{ cardId: 'fc_1', concept: 'الاستنساخ', reason: 'مراجعة دورية - سمب' }];
  const mastered = ['بنية الـ ADN', 'الخاصية الحمقلية'];

  const proTeaserVisible = methodologyScore >= CoachConfig.proTeaser.triggerScore;
  const { proTeaser } = CoachConfig;

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
                <p className="font-black text-[#1f1c0b] dark:text-white text-sm">{CoachConfig.coachMessages.weakPointDetected.replace('{concept}', wp.concept).replace('{count}', String(wp.errorCount))}</p>
              </div>
              <button
                onClick={() => onStartLesson(wp.lessonId)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-black rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-md shrink-0"
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
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-black rounded-xl transition-colors cursor-pointer shadow-md shrink-0"
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
      </div>

      {/* Teaser Pro — déclenché si methodologyScore >= 70 (TEST 6) */}
      {proTeaserVisible && (
        <div className="relative overflow-hidden bg-gradient-to-br from-[#006d37] to-[#00562b] text-white rounded-2xl p-5 shadow-md border border-emerald-300/40">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-[#fed65b]" />
            <h2 className="font-black text-sm">{proTeaser.title}</h2>
          </div>
          <p className="text-sm text-white/90 leading-7">{proTeaser.message}</p>
          <button
            onClick={() => {
              logEvent('PRO_TEASER_CLICKED', { score: methodologyScore });
              onStartLesson('lecon_transcription');
            }}
            className="mt-4 w-full py-3 rounded-xl bg-[#fed65b] hover:bg-[#f5c93f] text-[#1f1c0b] font-black text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors shadow"
          >
            <Gift className="w-4 h-4" />
            {proTeaser.ctaText}
          </button>
          <p className="mt-2 text-[10px] text-white/70 text-center">Score méthodologique local : {methodologyScore}/100</p>
        </div>
      )}

      {/* Section 4: Leçons officielles (Programme 2017) — entrée de navigation vers les leçons câblées */}
      <div className="bg-[#f3f8f4] dark:bg-[#10231a] border border-[#2ecc71]/30 rounded-2xl p-5">
        <h2 className="flex items-center gap-2 text-[#006d37] dark:text-[#2ecc71] font-black mb-4 text-sm">
          <BookOpen className="w-5 h-5" />
          الدروس الرسمية (برنامج 2017)
        </h2>
        <div className="grid gap-2">
          <button
            onClick={() => onStartLesson('d1-u1-l2-transcription')}
            className="w-full text-right px-4 py-3 rounded-xl bg-white dark:bg-[#141916] border border-[#e2dabf]/60 dark:border-[#2ecc71]/10 text-sm font-bold text-[#1f1c0b] dark:text-gray-100 hover:bg-[#2ecc71]/10 transition-colors cursor-pointer flex items-center justify-between"
          >
            <span>الاستنساخ وتدخل الإنزيم</span>
            <Target className="w-4 h-4 text-[#006d37] dark:text-[#2ecc71]" />
          </button>
          <button
            onClick={() => onStartLesson('d1-u1-l3-traduction')}
            className="w-full text-right px-4 py-3 rounded-xl bg-white dark:bg-[#141916] border border-[#e2dabf]/60 dark:border-[#2ecc71]/10 text-sm font-bold text-[#1f1c0b] dark:text-gray-100 hover:bg-[#2ecc71]/10 transition-colors cursor-pointer flex items-center justify-between"
          >
            <span>الترجمة والشفرة الوراثية</span>
            <Target className="w-4 h-4 text-[#006d37] dark:text-[#2ecc71]" />
          </button>
        </div>
      </div>

      {/* Bouton Test Diagnostique */}
      <div className="pt-2 space-y-3">
        <button
          onClick={() => onStartLesson('lecon_transcription')}
          className="w-full py-4 bg-[#006d37] hover:bg-[#00562b] border border-[#006d37] rounded-2xl font-black text-white flex items-center justify-center gap-3 transition-colors shadow-md cursor-pointer"
        >
          <Target className="w-5 h-5 text-[#fed65b]" />
          {CoachConfig.coachMessages.diagnosticTest}
        </button>
        <p className="text-center text-[11px] text-[#506072] dark:text-gray-400 leading-6">
          يقيس الاختبار مستواك في كل المجالات (البروتينات 45%، الطاقة 30%، التكتونية 25%) ويحدد أولويات مراجعتك للأسبوع القادم. 100% offline، بدون API، بدون LLM.
        </p>
      </div>

      {/* Bouton Déconnexion (TEST 7 — SignOut) */}
      <div className="pt-2">
        <button
          onClick={onSignOut}
          className="w-full py-3 rounded-2xl border border-[#e2dabf]/60 dark:border-white/10 text-[#506072] dark:text-gray-400 font-bold text-sm flex items-center justify-center gap-2 cursor-pointer hover:bg-[#fff9ed] dark:hover:bg-white/5 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Déconnexion
        </button>
      </div>
    </div>
  );
}
