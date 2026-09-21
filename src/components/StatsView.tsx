import { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell,
  Legend,
  LineChart,
  Line,
  CartesianGrid,
  AreaChart,
  Area,
  ComposedChart,
  ReferenceLine
} from 'recharts';
import { 
  Trophy, 
  Flame, 
  Calendar, 
  BookOpen, 
  Clock, 
  Activity, 
  Sparkles, 
  Award, 
  Lock, 
  CheckCircle2, 
  TrendingUp, 
  Printer, 
  Download, 
  X, 
  FileText, 
  Check,
  Zap,
  Target,
  BarChart2,
  TrendingDown,
  Share2
} from 'lucide-react';
import { UserProgress, Unit } from '../types';
import WeeklyReportShareModal from './WeeklyReportShareModal';
import MethodologyGlobalStats from './MethodologyGlobalStats';
import StreakCelebrationModal from './StreakCelebrationModal';
import { playStreakMilestoneSound, playXPGainSound } from '../utils/audio';
import { AR_LATN, fmtDateLatn, toLatinDigits } from '../utils/latinDigits';

interface StatsViewProps {
  progress: UserProgress;
  units: Unit[];
  /** Permet aux états vides d'envoyer l'élève vers la bonne rubrique */
  onNavigate?: (tab: string) => void;
}

export default function StatsView({ progress, units, onNavigate }: StatsViewProps) {
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [showWeeklyShareModal, setShowWeeklyShareModal] = useState<boolean>(false);
  const [showStreakModal, setShowStreakModal] = useState<boolean>(false);
  const [studentName, setStudentName] = useState<string>('');
  const [weeklyMetricTab, setWeeklyMetricTab] = useState<'combined' | 'xp' | 'completion'>('combined');
  const reportRef = useRef<HTMLDivElement>(null);

  const handleOpenStreakCelebration = () => {
    playStreakMilestoneSound(progress.streak || 1);
    setShowStreakModal(true);
  };
  
  // Weekly XP & Achievement Progress Data (Recharts)
  // Weekly XP & Achievement Progress Data (Recharts) — 100 % réel.
  // Plus AUCUNE donnée de démonstration : on reconstruit chaque jour à partir
  // de l'historique réel (règle XP de l'app : +20 XP par bonne réponse).
  const weeklyPerformanceData = useMemo(() => {
    const dayNames = ['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];
    const targetDailyXP = 50;
    const targetCompletion = 100;

    // Index réel : date (format stocké ar-DZ-u-nu-latn) -> XP/questions réel(le)s.
    // toLatinDigits : compat avec l'historique déjà stocké en 'ar-DZ' (chiffres ٠-٩).
    const byDate = new Map<string, { xp: number; questions: number }>();
    progress.quizScoreHistory.forEach(q => {
      const cur = byDate.get(toLatinDigits(q.date)) || { xp: 0, questions: 0 };
      cur.xp += q.score * 20;           // règle XP réelle (App.tsx)
      cur.questions += q.total;
      byDate.set(toLatinDigits(q.date), cur);
    });

    // Fenêtre réelle : les 7 derniers jours (semaine commençant le samedi)
    const today = new Date();
    const realDays: { xp: number; questions: number; isToday: boolean }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const real = byDate.get(d.toLocaleDateString(AR_LATN));
      realDays.push({ xp: real?.xp ?? 0, questions: real?.questions ?? 0, isToday: i === 0 });
    }

    return dayNames.map((day, idx) => {
      const real = realDays[idx];
      let xpEarned = real.xp;
      let completionRate = Math.min(130, Math.round((xpEarned / targetDailyXP) * 100));
      let studyMins = 0;

      if (real.isToday && progress.dailyGoals) {
        const dg = progress.dailyGoals;
        const curr = dg.type === 'minutes' ? dg.todayMinutes : dg.todayQuestions;
        const target = dg.type === 'minutes' ? dg.targetMinutes : dg.targetQuestions;
        completionRate = Math.max(completionRate, Math.min(150, Math.round((curr / Math.max(1, target)) * 100)));
        if (dg.type === 'minutes') studyMins = dg.todayMinutes;
      }

      return {
        day,
        isToday: real.isToday,
        isPast: true,
        'نقاط XP': xpEarned,
        'معدل الإنجاز %': completionRate,
        'الهدف المستهدف XP': targetDailyXP,
        'هدف الإنجاز %': targetCompletion,
        questionsCount: real.questions,
        studyMins,
      };
    });
  }, [progress.quizScoreHistory, progress.dailyGoals]);

  const totalWeeklyXP = useMemo(() => {
    return weeklyPerformanceData.reduce((acc, curr) => acc + (curr['نقاط XP'] || 0), 0);
  }, [weeklyPerformanceData]);

  const avgCompletionRate = useMemo(() => {
    const pastDays = weeklyPerformanceData.filter(d => d.isPast);
    if (!pastDays.length) return 0;
    const sum = pastDays.reduce((acc, curr) => acc + curr['معدل الإنجاز %'], 0);
    return Math.round(sum / pastDays.length);
  }, [weeklyPerformanceData]);

  const bestDay = useMemo(() => {
    return [...weeklyPerformanceData].sort((a, b) => b['نقاط XP'] - a['نقاط XP'])[0];
  }, [weeklyPerformanceData]);

  // Activité réelle de la semaine (0 donnée inventée) :
  // on n'affiche le graphique que s'il existe du vrai travail à montrer.
  const hasWeeklyActivity = totalWeeklyXP > 0
    || (progress.dailyGoals?.todayQuestions || 0) > 0
    || (progress.dailyGoals?.todayMinutes || 0) > 0
    || (progress.quizScoreHistory?.length || 0) > 0;

  // 1. Format data for the Spaced Repetition card status chart
  const cardData = [
    { name: 'إعادة', value: progress.flashcardStats.again, color: '#ba1a1a' },
    { name: 'صعب', value: progress.flashcardStats.hard, color: '#506072' },
    { name: 'جيد', value: progress.flashcardStats.good, color: '#006d37' },
    { name: 'سهل', value: progress.flashcardStats.easy, color: '#2ecc71' }
  ].filter(item => item.value > 0);

  // Fallback : aucun mock. On n'affiche le camembert que si des cartes
  // ont réellement été évaluées (sinon : état vide honnête).
  const hasCardData = cardData.length > 0;

  // 2. Format quiz history data
  const quizHistory = progress.quizScoreHistory.map((item, idx) => ({
    name: item.unitTitle.substring(0, 15) + '...',
    'النتيجة %': Math.round((item.score / item.total) * 100),
    scoreText: `${item.score} / ${item.total}`
  }));

  const hasQuizHistory = quizHistory.length > 0;

  // 3. Format quiz timeline progress (scores over time)
  const quizTimeline = progress.quizScoreHistory.map((item) => ({
    date: item.date,
    'الدرجة %': Math.round((item.score / item.total) * 100),
    title: item.unitTitle,
    scoreText: `${item.score}/${item.total}`
  }));

  const hasQuizTimeline = quizTimeline.length > 0;

  // Total lessons completed
  const completedUnitsCount = progress.completedUnits.length;

  // Spaced repetition stats total
  const totalCardsRated = 
    (progress.flashcardStats?.again || 0) + 
    (progress.flashcardStats?.hard || 0) + 
    (progress.flashcardStats?.good || 0) + 
    (progress.flashcardStats?.easy || 0);

  // 4. Niveau d'atteinte réel de chaque unité (progression sauvegardée localement)
  const unitMastery = units.map(u => ({
    name: u.title.length > 16 ? u.title.substring(0, 15) + '…' : u.title,
    'الإتقان %': Math.round(u.progress),
  }));
  const hasUnitMastery = unitMastery.some(d => d['الإتقان %'] > 0);



  return (
    <div className="space-y-6 pb-24 font-sans">
      
      {/* Title Header */}
      <section className="px-1 shrink-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#006d37] dark:text-[#2ecc71] font-display">إحصائيات الإنجاز والتقدم</h2>
          <p className="text-xs text-[#506072] dark:text-zinc-300 font-semibold mt-1">تتبع رحلتك العلمية والتحضير للبكالوريا</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          {/* Shareable Weekly Card Trigger */}
          <button
            onClick={() => setShowWeeklyShareModal(true)}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:opacity-95 text-white font-extrabold text-xs px-4 py-2.5 rounded-2xl shadow-md cursor-pointer transition-all active:scale-95 border border-amber-300/30"
            id="weekly-share-card-btn"
          >
            <Share2 className="w-4 h-4 text-white" />
            <span>بطاقة الأداء الأسبوعي (مشاركة)</span>
          </button>

          {/* Official Certificate / Grade Report PDF */}
          <button
            onClick={() => setShowReportModal(true)}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#006d37] to-[#2ecc71] hover:from-[#005027] hover:to-[#27ae60] text-white font-extrabold text-xs px-4 py-2.5 rounded-2xl shadow-md cursor-pointer transition-all active:scale-95 border border-transparent"
            id="generate-report-btn"
          >
            <Award className="w-4 h-4 text-[#fed65b] fill-[#fed65b] animate-pulse" />
            <span>كشف النقاط الرسمي (PDF)</span>
          </button>
        </div>
      </section>

      {/* Grid Stats Highlights */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Streak Item - Interactive with sound */}
        <div 
          onClick={handleOpenStreakCelebration}
          className="bg-[#ffffff] border border-[#e2dabf]/60 hover:border-amber-400 p-4 rounded-2xl shadow-sm flex items-center gap-3 cursor-pointer transition-all hover:scale-102 active:scale-98"
          title="اضغط للاستماع لنغمة الشعلة وعرض تفاصيل الـ Streak 🎵"
        >
          <div className="w-10 h-10 rounded-xl bg-[#ff9a4a]/10 text-[#ff9a4a] flex items-center justify-center">
            <Flame className="w-5 h-5 fill-current animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] text-[#506072] block font-semibold flex items-center gap-1">
              <span>اليوم المتتالي</span>
              <span className="text-[9px] text-amber-600 font-bold">🎵</span>
            </span>
            <span className="text-xl font-bold text-[#1f1c0b]">{progress.streak} يوم</span>
          </div>
        </div>

        {/* XP Item - Interactive with coin sound */}
        <div 
          onClick={() => playXPGainSound()}
          className="bg-[#ffffff] border border-[#e2dabf]/60 hover:border-yellow-400 p-4 rounded-2xl shadow-sm flex items-center gap-3 cursor-pointer transition-all hover:scale-102 active:scale-98"
          title="اضغط لسماع نغمة نقاط الخبرة 🎵"
        >
          <div className="w-10 h-10 rounded-xl bg-[#fed65b]/10 text-[#944a00] flex items-center justify-center">
            <Trophy className="w-5 h-5 fill-current text-amber-500" />
          </div>
          <div>
            <span className="text-[10px] text-[#506072] block font-semibold flex items-center gap-1">
              <span>مجموع النقاط</span>
              <span className="text-[9px] text-amber-600 font-bold">🎵</span>
            </span>
            <span className="text-xl font-bold text-[#1f1c0b]">{progress.xp} XP</span>
          </div>
        </div>

        {/* Study Time Item */}
        <div className="bg-[#ffffff] border border-[#e2dabf]/60 p-4 rounded-2xl shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#006d37]/10 text-[#006d37] flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-[#506072] block font-semibold">وقت المذاكرة</span>
            <span className="text-xl font-bold text-[#1f1c0b]">{progress.studyMinutes} دقيقة</span>
          </div>
        </div>

        {/* Completed Units Item */}
        <div className="bg-[#ffffff] border border-[#e2dabf]/60 p-4 rounded-2xl shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#2ecc71]/10 text-[#005027] flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-[#506072] block font-semibold">الوحدات المكتملة</span>
            <span className="text-xl font-bold text-[#1f1c0b]">{completedUnitsCount} وحدات</span>
          </div>
        </div>
      </section>

      {/* NEW INTERACTIVE WEEKLY PERFORMANCE CHART (Recharts) */}
      <section className="bg-[#ffffff] border border-[#e2dabf]/60 rounded-3xl p-5 md:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-5" dir="rtl">
        {/* Section Header & View Toggles */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#006d37] to-[#2ecc71] text-white flex items-center justify-center font-black shadow-sm">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base md:text-lg text-[#1f1c0b]">
                  المخطط الأسبوعي لنقاط الخبرة (XP) ومعدلات الإنجاز
                </h3>
                <span className="bg-emerald-50 text-[#006d37] text-[10px] font-black px-2.5 py-0.5 rounded-full border border-emerald-200/60 hidden md:inline-block">
                  من نشاطك الحقيقي فقط — بلا بيانات وهمية
                </span>
              </div>
              <p className="text-xs text-[#506072] font-semibold mt-0.5">
                يُبنى حصرياً على نشاطك الفعلي (نتائج اختباراتك + أهداف اليوم) — أي إنجاز غير مسجل لا يظهر
              </p>
            </div>
          </div>

          {/* Interactive Metric Switcher */}
          <div className="flex items-center p-1 bg-gray-100/80 rounded-2xl border border-gray-200/50 self-start sm:self-auto">
            <button
              onClick={() => setWeeklyMetricTab('combined')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                weeklyMetricTab === 'combined'
                  ? 'bg-[#006d37] text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>مدمج (XP + %)</span>
            </button>

            <button
              onClick={() => setWeeklyMetricTab('xp')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                weeklyMetricTab === 'xp'
                  ? 'bg-[#006d37] text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>نقاط XP</span>
            </button>

            <button
              onClick={() => setWeeklyMetricTab('completion')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                weeklyMetricTab === 'completion'
                  ? 'bg-[#006d37] text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              <span>معدل الإنجاز %</span>
            </button>
          </div>
        </div>

        {/* Quick Weekly KPI Summary Badges */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
          <div className="bg-[#f8fbfa] border border-emerald-100 rounded-2xl p-3 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-1 text-center sm:text-right">
            <div>
              <span className="text-[10px] text-gray-500 font-bold block">مجموع XP الأسبوع</span>
              <span className="text-base sm:text-lg font-black text-[#006d37]">{totalWeeklyXP} XP</span>
            </div>
            <div className="w-7 h-7 rounded-xl bg-emerald-100 text-[#006d37] flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>

          <div className="bg-[#fff9ed] border border-amber-100 rounded-2xl p-3 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-1 text-center sm:text-right">
            <div>
              <span className="text-[10px] text-gray-500 font-bold block">متوسط الإنجاز اليومي</span>
              <span className="text-base sm:text-lg font-black text-[#944a00]">{avgCompletionRate}%</span>
            </div>
            <div className="w-7 h-7 rounded-xl bg-amber-100 text-[#944a00] flex items-center justify-center shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>

          <div className="bg-[#f2f7ff] border border-blue-100 rounded-2xl p-3 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-1 text-center sm:text-right">
            <div>
              <span className="text-[10px] text-gray-500 font-bold block">أعلى يوم إنتاجية</span>
              <span className="text-base sm:text-lg font-black text-[#1e40af]">{bestDay?.day || 'السبت'}</span>
            </div>
            <div className="w-7 h-7 rounded-xl bg-blue-100 text-[#1e40af] flex items-center justify-center shrink-0">
              <Award className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Dynamic Recharts Visualization Container */}
        {hasWeeklyActivity ? (
        <div className="h-72 sm:h-80 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            {weeklyMetricTab === 'combined' ? (
              <ComposedChart data={weeklyPerformanceData} margin={{ top: 15, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="barXPColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#006d37" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#2ecc71" stopOpacity={0.7} />
                  </linearGradient>
                  <linearGradient id="areaRateColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ff9a4a" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#ff9a4a" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2dabf" strokeOpacity={0.35} />
                <XAxis 
                  dataKey="day" 
                  stroke="#506072" 
                  fontSize={11} 
                  tickLine={false}
                  tick={({ x, y, payload }) => {
                    const item = weeklyPerformanceData.find(d => d.day === payload.value);
                    const isToday = item?.isToday;
                    return (
                      <g transform={`translate(${x},${y})`}>
                        <text
                          x={0}
                          y={12}
                          dy={4}
                          textAnchor="middle"
                          fill={isToday ? '#006d37' : '#506072'}
                          fontSize={11}
                          fontWeight={isToday ? 'bold' : 'normal'}
                        >
                          {payload.value} {isToday ? '(اليوم)' : ''}
                        </text>
                      </g>
                    );
                  }}
                />
                <YAxis 
                  yAxisId="left" 
                  stroke="#006d37" 
                  fontSize={10} 
                  tickLine={false} 
                  domain={[0, 'dataMax + 20']}
                  unit=" XP"
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right" 
                  stroke="#ff9a4a" 
                  fontSize={10} 
                  tickLine={false} 
                  domain={[0, 140]} 
                  unit="%"
                />
                <Tooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white/95 backdrop-blur-md border border-[#e2dabf] p-3.5 rounded-2xl shadow-xl text-right text-xs font-sans space-y-2 min-w-[190px]" dir="rtl">
                          <div className="flex items-center justify-between border-b border-gray-100 pb-1.5">
                            <span className="font-black text-[#1f1c0b] text-sm">{label} {data.isToday ? '🌟 (اليوم)' : ''}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                              data.isPast ? 'bg-emerald-100 text-[#006d37]' : 'bg-gray-100 text-gray-500'
                            }`}>
                              {data.isPast ? 'تم التسجيل' : 'قادم'}
                            </span>
                          </div>
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-gray-500 flex items-center gap-1">
                                <span className="w-2.5 h-2.5 rounded-full bg-[#006d37]" />
                                نقاط الخبرة:
                              </span>
                              <span className="font-black text-[#006d37]">{data['نقاط XP']} XP</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-500 flex items-center gap-1">
                                <span className="w-2.5 h-2.5 rounded-full bg-[#ff9a4a]" />
                                معدل الإنجاز:
                              </span>
                              <span className="font-black text-[#ff9a4a]">{data['معدل الإنجاز %']}%</span>
                            </div>
                            <div className="flex items-center justify-between pt-1 border-t border-gray-100 text-[11px] text-gray-600">
                              <span>التمارين المكتملة:</span>
                              <span className="font-bold">{data.questionsCount} سؤال</span>
                            </div>
                            <div className="flex items-center justify-between text-[11px] text-gray-600">
                              <span>زمن التحصيل:</span>
                              <span className="font-bold">{data.studyMins} دقيقة</span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend 
                  verticalAlign="top" 
                  height={36} 
                  wrapperStyle={{ fontSize: '11px', fontFamily: 'inherit', direction: 'rtl' }}
                />
                <Bar 
                  yAxisId="left" 
                  dataKey="نقاط XP" 
                  fill="url(#barXPColor)" 
                  radius={[8, 8, 0, 0]} 
                  maxBarSize={36}
                />
                <Line 
                  yAxisId="right" 
                  type="monotone" 
                  dataKey="معدل الإنجاز %" 
                  stroke="#ff9a4a" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: '#ff9a4a', stroke: '#fff', strokeWidth: 2 }}
                  activeDot={{ r: 7 }}
                />
                <ReferenceLine 
                  yAxisId="right" 
                  y={100} 
                  stroke="#2ecc71" 
                  strokeDasharray="4 4" 
                  label={{ value: 'الهدف (100%)', fill: '#2ecc71', fontSize: 10, position: 'insideTopLeft' }} 
                />
              </ComposedChart>
            ) : weeklyMetricTab === 'xp' ? (
              <AreaChart data={weeklyPerformanceData} margin={{ top: 15, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="xpAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#006d37" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#2ecc71" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2dabf" strokeOpacity={0.35} />
                <XAxis dataKey="day" stroke="#506072" fontSize={11} tickLine={false} />
                <YAxis stroke="#006d37" fontSize={10} tickLine={false} unit=" XP" />
                <Tooltip 
                  contentStyle={{ direction: 'rtl', fontSize: 11, borderRadius: '16px', border: '1px solid #e2dabf' }}
                  formatter={(value: any) => [`${value} XP`, 'نقاط الخبرة المكتسبة']}
                />
                <ReferenceLine y={50} stroke="#ff9a4a" strokeDasharray="3 3" label={{ value: 'المعيار اليومي (50 XP)', fill: '#ff9a4a', fontSize: 10, position: 'insideTopLeft' }} />
                <Area 
                  type="monotone" 
                  dataKey="نقاط XP" 
                  stroke="#006d37" 
                  strokeWidth={3.5} 
                  fill="url(#xpAreaGrad)" 
                  activeDot={{ r: 8, stroke: '#fed65b', strokeWidth: 3 }}
                />
              </AreaChart>
            ) : (
              <BarChart data={weeklyPerformanceData} margin={{ top: 15, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2dabf" strokeOpacity={0.35} />
                <XAxis dataKey="day" stroke="#506072" fontSize={11} tickLine={false} />
                <YAxis stroke="#506072" fontSize={10} tickLine={false} domain={[0, 140]} unit="%" />
                <Tooltip 
                  contentStyle={{ direction: 'rtl', fontSize: 11, borderRadius: '16px', border: '1px solid #e2dabf' }}
                  formatter={(value: any) => [`${value}%`, 'نسبة تحقيق الهدف']}
                />
                <ReferenceLine y={100} stroke="#006d37" strokeWidth={2} strokeDasharray="4 4" label={{ value: 'الهدف اليومي 100%', fill: '#006d37', fontSize: 10 }} />
                <Bar 
                  dataKey="معدل الإنجاز %" 
                  radius={[8, 8, 0, 0]}
                  maxBarSize={40}
                >
                  {weeklyPerformanceData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry['معدل الإنجاز %'] >= 100 ? '#006d37' : entry['معدل الإنجاز %'] >= 60 ? '#2ecc71' : '#ff9a4a'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
        ) : (
          <div className="h-72 sm:h-80 w-full pt-2 flex flex-col items-center justify-center text-center bg-[#f8fbfa] border border-dashed border-[#006d37]/30 rounded-3xl p-6">
            <Activity className="w-10 h-10 text-[#006d37]/40 mb-3" />
            <p className="font-black text-sm text-[#1f1c0b] mb-1.5">لا يوجد نشاط مسجل هذا الأسبوع بعد</p>
            <p className="text-[11px] text-[#506072] font-semibold max-w-md leading-relaxed mb-4">
              لا نعرض أرقاماً وهمية: هذا المخطط يُبنى فقط من نشاطك الحقيقي. ابدأ بحل أول اختبار حتى تظهر أعمدة تقدمك هنا.
            </p>
            <button
              onClick={() => onNavigate?.('quiz')}
              className="flex items-center gap-2 bg-[#006d37] hover:bg-[#005027] text-white text-xs font-black px-4 py-2.5 rounded-xl transition-all cursor-pointer"
            >
              <Target className="w-4 h-4" />
              <span>ابدأ اختباراً الآن</span>
            </button>
          </div>
        )}

        {/* Motivational Insight Footer with Share trigger */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-gradient-to-r from-emerald-50/70 via-teal-50/70 to-amber-50/60 p-3 rounded-2xl border border-emerald-100 text-xs">
          <div className="flex items-center gap-2 text-[#006d37] font-bold">
            <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
            <span>
              {avgCompletionRate >= 80 
                ? 'معدل أسبوعي فائق التميز! أنت تحافظ على نسق منتظم يقودك مباشرة نحو العلامة الكاملة في البكالوريا.'
                : 'استمر في حل الكويزات اليومية للوصول بمتوسط إنجازك الأسبوعي إلى 100% كاملاً.'}
            </span>
          </div>
          
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] font-black text-emerald-800 bg-white/90 px-2.5 py-1 rounded-xl shadow-2xs">
              {progress.streak} أيام مستمرة 🔥
            </span>
            <button
              onClick={() => setShowWeeklyShareModal(true)}
              className="px-3 py-1 bg-[#006d37] hover:bg-[#005027] text-white text-[11px] font-black rounded-xl transition-all shadow-xs flex items-center gap-1 cursor-pointer"
            >
              <Share2 className="w-3 h-3" />
              <span>مشاركة بطاقة الأسبوع</span>
            </button>
          </div>
        </div>
      </section>
      <section className="bg-[#ffffff] border border-[#e2dabf]/60 rounded-3xl p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-[#006d37]" />
          <h3 className="font-extrabold text-base text-[#1f1c0b]">تطور مستوى الوحدات على مدار الشهر</h3>
          <span className="text-[9px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5 shrink-0 mr-auto">بناء على نشاطك الحقيقي 100%</span>
        </div>

        {hasUnitMastery ? (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={unitMastery} margin={{ top: 15, right: 15, left: -20, bottom: 15 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2dabf" strokeOpacity={0.3} />
                <XAxis dataKey="name" stroke="#506072" fontSize={9} tickLine={false} interval={0} angle={-22} textAnchor="end" height={60} />
                <YAxis stroke="#506072" fontSize={10} tickLine={false} domain={[0, 100]} unit="%" />
                <Tooltip 
                  formatter={(value: any) => [`${value}%`, 'الإتقان']}
                  contentStyle={{ direction: 'rtl', fontFamily: 'Noto Kufi Arabic', fontSize: 11, borderRadius: '12px', border: '1px solid #e2dabf' }}
                />
                <Bar dataKey="الإتقان %" radius={[6, 6, 0, 0]} maxBarSize={34}>
                  {unitMastery.map((d, i) => (
                    <Cell 
                      key={i} 
                      fill={d['الإتقان %'] >= 100 ? '#2ecc71' : d['الإتقان %'] >= 60 ? '#006d37' : d['الإتقان %'] > 0 ? '#ff9a4a' : '#d6dbe0'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-72 w-full flex flex-col items-center justify-center text-center bg-[#f8fbfa] border border-dashed border-[#006d37]/30 rounded-3xl p-6">
            <BookOpen className="w-10 h-10 text-[#006d37]/40 mb-3" />
            <p className="font-black text-sm text-[#1f1c0b] mb-1.5">لم تُسجَّل أي وحدة بعد</p>
            <p className="text-[11px] text-[#506072] font-semibold max-w-md leading-relaxed mb-4">
              هذا المخطط يعرض تقدمك الحقيقي فقط. افتح مكتبة الدروس وابدأ أول وحدة ليظهر مستوى إتقانك هنا.
            </p>
            <button
              onClick={() => onNavigate?.('lesson')}
              className="flex items-center gap-2 bg-[#006d37] hover:bg-[#005027] text-white text-xs font-black px-4 py-2.5 rounded-xl transition-all cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              <span>فتح مكتبة الدروس</span>
            </button>
          </div>
        )}
      </section>

      {/* ====== Suivi de la méthodologie : carnet de bord (100 % réel) ====== */}
      <MethodologyGlobalStats onNavigate={onNavigate} />

      {/* Evolution Over Time LineChart */}
      <section className="bg-[#ffffff] border border-[#e2dabf]/60 rounded-3xl p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-[#006d37]" />
          <h3 className="font-extrabold text-base text-[#1f1c0b]">منحنى تطور مستواك العلمي عبر الزمن</h3>
          <span className="text-[9px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5 shrink-0 mr-auto">نتائجك الحقيقية فقط</span>
        </div>

        {hasQuizTimeline ? (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={quizTimeline} margin={{ top: 15, right: 15, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2dabf" strokeOpacity={0.3} />
                <XAxis dataKey="date" stroke="#506072" fontSize={10} tickLine={false} />
                <YAxis stroke="#506072" fontSize={10} tickLine={false} domain={[0, 100]} />
                <Tooltip 
                  formatter={(value: any, name: any, props: any) => [`${value}% (${props.payload.scoreText})`, 'النتيجة']}
                  labelFormatter={(label) => `التاريخ: ${label}`}
                  contentStyle={{ direction: 'rtl', fontFamily: 'Noto Kufi Arabic', fontSize: 11, borderRadius: '12px', border: '1px solid #e2dabf' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="الدرجة %" 
                  stroke="#006d37" 
                  strokeWidth={3}
                  activeDot={{ r: 8 }} 
                  dot={{ stroke: '#fed65b', strokeWidth: 2, r: 4, fill: '#006d37' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-64 w-full flex flex-col items-center justify-center text-center bg-[#f8fbfa] border border-dashed border-[#006d37]/30 rounded-3xl p-6">
            <TrendingUp className="w-9 h-9 text-[#006d37]/40 mb-3" />
            <p className="font-black text-sm text-[#1f1c0b] mb-1.5">منحنيك الحقيقي سيظهر هنا</p>
            <p className="text-[11px] text-[#506072] font-semibold max-w-md leading-relaxed mb-4">
              نعرض فقط نتائجك الفعلية — لا مبيانات تجريبية. حل ثلاثة اختبارات على الأقل لرسم خط تطورك عبر الزمن.
            </p>
            <button
              onClick={() => onNavigate?.('quiz')}
              className="flex items-center gap-2 bg-[#006d37] hover:bg-[#005027] text-white text-xs font-black px-4 py-2.5 rounded-xl transition-all cursor-pointer"
            >
              <Target className="w-4 h-4" />
              <span>حل أول اختبار</span>
            </button>
          </div>
        )}
      </section>
        
      <div className="grid md:grid-cols-2 gap-6">

        {/* Quiz History Performance BarChart (données réelles uniquement) */}
        <div className="bg-[#ffffff] border border-[#e2dabf]/60 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#006d37]" />
            <h3 className="font-extrabold text-base text-[#1f1c0b]">نتائج التدريبات والاختبارات</h3>
          </div>
          
          {hasQuizHistory ? (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={quizHistory} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#506072" fontSize={10} tickLine={false} />
                  <YAxis stroke="#506072" fontSize={10} tickLine={false} domain={[0, 100]} />
                  <Tooltip 
                    formatter={(value: any, name: any, props: any) => [`${value}% (${props.payload.scoreText || '—'})`, 'الدرجة']}
                    contentStyle={{ direction: 'rtl', fontFamily: 'Noto Kufi Arabic', fontSize: 11, borderRadius: '12px', border: '1px solid #e2dabf' }}
                  />
                  <Bar dataKey="النتيجة %" fill="#006d37" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 w-full flex flex-col items-center justify-center text-center bg-[#f8fbfa] border border-dashed border-[#006d37]/30 rounded-3xl p-6">
              <Activity className="w-9 h-9 text-[#006d37]/40 mb-3" />
              <p className="font-black text-sm text-[#1f1c0b] mb-1.5">لا توجد نتائج مسجلة بعد</p>
              <p className="text-[11px] text-[#506072] font-semibold max-w-md leading-relaxed mb-4">
                نعرض نتيجتك الحقيقية فقط — بلا أي نتيجة وهمية. أكمل أول اختبار لتسجيل نتيجتك هنا.
              </p>
              <button
                onClick={() => onNavigate?.('quiz')}
                className="flex items-center gap-2 bg-[#006d37] hover:bg-[#005027] text-white text-xs font-black px-4 py-2.5 rounded-xl transition-all cursor-pointer"
              >
                <Target className="w-4 h-4" />
                <span>تسجيل أول نتيجة</span>
              </button>
            </div>
          )}
        </div>
        <div className="bg-[#ffffff] border border-[#e2dabf]/60 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#944a00]" />
            <h3 className="font-extrabold text-base text-[#1f1c0b]">مستويات تذكر بطاقات المراجعة</h3>
          </div>

          {hasCardData ? (
            <div className="flex flex-col sm:flex-row items-center gap-4 h-64">
              <div className="h-full flex-1 w-full max-w-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={cardData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {cardData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ direction: 'rtl', fontFamily: 'Noto Kufi Arabic', fontSize: 11, borderRadius: '12px', border: '1px solid #e2dabf' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legend info lists */}
              <div className="space-y-2 shrink-0 text-xs text-right w-full sm:w-auto">
                {cardData.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="font-bold text-[#1f1c0b]">{item.name}</span>
                    </div>
                    <span className="text-[#506072] font-semibold">{item.value} بطاقة</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-64 w-full flex flex-col items-center justify-center text-center bg-[#f8fbfa] border border-dashed border-[#006d37]/30 rounded-3xl p-6">
              <Calendar className="w-9 h-9 text-[#944a00]/40 mb-3" />
              <p className="font-black text-sm text-[#1f1c0b] mb-1.5">لم تُقيَّم أي بطاقة بعد</p>
              <p className="text-[11px] text-[#506072] font-semibold max-w-md leading-relaxed mb-4">
                مستويات التذكر (إعادة/صعب/جيد/سهل) تُبنى من تقييماتك الحقيقية للبطاقات — لا نعرض أرقاماً افتراضية.
              </p>
              <button
                onClick={() => onNavigate?.('review')}
                className="flex items-center gap-2 bg-[#006d37] hover:bg-[#005027] text-white text-xs font-black px-4 py-2.5 rounded-xl transition-all cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                <span>المراجعة الذكية</span>
              </button>
            </div>
          )}
        </div>

      </div>

      {/* Motivational Advice Block */}
      <section className="bg-[#fff9ed] border border-[#fed65b]/50 p-5 rounded-3xl space-y-3">
        <h4 className="font-extrabold text-sm text-[#944a00] flex items-center gap-1.5">
          <Sparkles className="w-4 h-4" />
          <span>توجيه علمي مخصص لمستواك:</span>
        </h4>
        <p className="text-xs text-[#504441] leading-relaxed">
          - **سرعة التذكر:** بطاقات المراجعة في مرحلة "إعادة" تظهر لك مجدداً قريباً لتثبيتها في الذاكرة طويلة المدى. واصل دراستها يومياً.
          <br />
          - **التحضير المستمر:** تكرار حل الاختبارات برسمها التخطيطي ينمي المنهجية المطلوبة (التحليل والتفسير والاستنتاج) للحصول على العلامات التامة.
        </p>
      </section>

      {/* Dynamic Printing Style Tag */}
      <style>{`
        @media print {
          /* Hide everything in the body by default */
          body * {
            visibility: hidden !important;
          }
          /* Show only the printable card and its descendants */
          #print-report-card, #print-report-card * {
            visibility: visible !important;
          }
          #print-report-card {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            height: 100% !important;
            background: #faf6ee !important;
            color: #1f1c0b !important;
            box-shadow: none !important;
            border: 4px double #006d37 !important;
            margin: 0 !important;
            padding: 2cm !important;
            border-radius: 0 !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Report Card Modal */}
      <AnimatePresence>
        {showReportModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto no-print">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#fffcf5] border border-[#e2dabf] max-w-2xl w-full rounded-3xl shadow-2xl flex flex-col h-[90vh] text-right text-[#1f1c0b]"
              style={{ direction: 'rtl' }}
            >
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-[#e2dabf]/40 flex flex-row-reverse justify-between items-center bg-[#ffffff] rounded-t-3xl no-print">
                <button 
                  onClick={() => setShowReportModal(false)}
                  className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-red-500 transition-colors cursor-pointer"
                >
                  <X className="w-6 h-6" />
                </button>
                
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#006d37]" />
                  <h3 className="font-extrabold text-lg text-[#006d37]">مُولّد كشوف النقاط وشهادات التميّز</h3>
                </div>
              </div>

              {/* Modal Content - Scrollable */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {/* Control Panel (Non-Printable) */}
                <div className="bg-[#fcfbf7] border border-[#e2dabf]/50 p-4 rounded-2xl space-y-4 no-print shadow-inner">
                  <h4 className="font-bold text-xs text-[#944a00]">إعدادات كشف التحصيل والطباعة</h4>
                  
                  <div className="flex flex-col sm:flex-row gap-4 items-end">
                    <div className="flex-1 space-y-1 w-full text-right">
                      <label className="text-[11px] font-bold text-gray-500 block">اسم الطالب(ة) الكامل (ليظهر في كشف النقاط):</label>
                      <input
                        type="text"
                        value={studentName}
                        onChange={(e) => setStudentName(e.target.value)}
                        placeholder="أدخل اسمك الكريم هنا..."
                        className="w-full bg-white border border-[#e2dabf] rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-[#006d37] font-bold text-right"
                      />
                    </div>
                    
                    <div className="flex gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => window.print()}
                        className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-[#006d37] hover:bg-[#005027] text-white text-xs font-extrabold px-4 py-2.5 rounded-xl shadow cursor-pointer transition-colors"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>طباعة / حفظ PDF</span>
                      </button>

                      <button
                        onClick={() => {
                          // Canvas drawing helper function
                          const canvas = document.createElement('canvas');
                          canvas.width = 800;
                          canvas.height = 1100;
                          const ctx = canvas.getContext('2d');
                          if (!ctx) return;

                          // Fill background (parchment/cream color)
                          ctx.fillStyle = '#fffcf5';
                          ctx.fillRect(0, 0, canvas.width, canvas.height);

                          // Outer double border
                          ctx.strokeStyle = '#006d37';
                          ctx.lineWidth = 6;
                          ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);
                          
                          ctx.strokeStyle = '#fed65b';
                          ctx.lineWidth = 2;
                          ctx.strokeRect(30, 30, canvas.width - 60, canvas.height - 60);

                          // Title text
                          ctx.fillStyle = '#006d37';
                          ctx.font = 'bold 22px Arial, sans-serif';
                          ctx.textAlign = 'center';
                          ctx.fillText('الجمهورية الجزائرية الديمقراطية الشعبية', canvas.width / 2, 80);
                          
                          ctx.fillStyle = '#506072';
                          ctx.font = 'bold 12px Arial, sans-serif';
                          ctx.fillText('وزارة التربية الوطنية • الديوان الوطني للامتحانات والمسابقات', canvas.width / 2, 110);
                          ctx.fillText('فضاء كنز العلوم لتسهيل مادة علوم الطبيعة والحياة للبكالوريا', canvas.width / 2, 130);

                          // Divider
                          ctx.strokeStyle = '#e2dabf';
                          ctx.lineWidth = 1;
                          ctx.beginPath();
                          ctx.moveTo(100, 155);
                          ctx.lineTo(canvas.width - 100, 155);
                          ctx.stroke();

                          // Document title
                          ctx.fillStyle = '#944a00';
                          ctx.font = 'bold 24px Arial, sans-serif';
                          ctx.fillText('كشف النقاط الإنجازي وشهادة التفوق للبكالوريا', canvas.width / 2, 200);

                          ctx.fillStyle = '#1f1c0b';
                          ctx.font = '15px Arial, sans-serif';
                          ctx.fillText('يشهد فضاء كنز العلوم التفاعلي بأن الطالب(ة):', canvas.width / 2, 245);

                          // Student Name
                          ctx.fillStyle = '#006d37';
                          ctx.font = 'bold 28px Arial, sans-serif';
                          ctx.fillText(studentName || 'طالب متميز', canvas.width / 2, 290);

                          ctx.fillStyle = '#506072';
                          ctx.font = '13px Arial, sans-serif';
                          ctx.fillText('قد أنجز مسار المراجعة الذكية والتدريبات المنهجية وحقق المؤشرات التحصيلية التالية:', canvas.width / 2, 330);

                          // Metrics boxes helper function
                          const drawRoundRect = (x: number, y: number, w: number, h: number, r: number) => {
                            ctx.beginPath();
                            ctx.moveTo(x + r, y);
                            ctx.arcTo(x + w, y, x + w, y + h, r);
                            ctx.arcTo(x + w, y + h, x, y + h, r);
                            ctx.arcTo(x, y + h, x, y, r);
                            ctx.arcTo(x, y, x + w, y, r);
                            ctx.closePath();
                            ctx.fill();
                            ctx.stroke();
                          };

                          const metrics = [
                            { label: 'النقاط التراكمية', val: `${progress.xp} XP` },
                            { label: 'الاستمرارية والمواظبة', val: `${progress.streak} أيام` },
                            { label: 'الأسئلة والتمارين', val: `${progress.completedQuestionsCount} سؤال` },
                            { label: 'زمن التحصيل العلمي', val: `${progress.studyMinutes} دقيقة` }
                          ];

                          metrics.forEach((m, idx) => {
                            const x = 70 + (idx % 2) * 340;
                            const y = 365 + Math.floor(idx / 2) * 90;
                            ctx.fillStyle = '#ffffff';
                            ctx.strokeStyle = '#e2dabf';
                            drawRoundRect(x, y, 310, 70, 12);
                            
                            ctx.fillStyle = '#506072';
                            ctx.font = 'bold 11px Arial, sans-serif';
                            ctx.textAlign = 'right';
                            ctx.fillText(m.label, x + 290, y + 25);
                            
                            ctx.fillStyle = '#006d37';
                            ctx.font = 'bold 18px Arial, sans-serif';
                            ctx.fillText(m.val, x + 290, y + 50);
                          });

                          // Units progress divider
                          ctx.strokeStyle = '#e2dabf';
                          ctx.beginPath();
                          ctx.moveTo(70, 565);
                          ctx.lineTo(canvas.width - 70, 565);
                          ctx.stroke();

                          // Units title
                          ctx.fillStyle = '#006d37';
                          ctx.font = 'bold 15px Arial, sans-serif';
                          ctx.textAlign = 'right';
                          ctx.fillText('الدروس والوحدات الأكثر تقدماً وتحصيلاً:', canvas.width - 70, 595);

                          const sortedUnits = [...units].sort((a, b) => b.progress - a.progress).slice(0, 3);
                          sortedUnits.forEach((unit, uIdx) => {
                            const y = 620 + uIdx * 45;
                            
                            ctx.fillStyle = '#1f1c0b';
                            ctx.font = '13px Arial, sans-serif';
                            ctx.fillText(unit.title, canvas.width - 70, y);

                            ctx.fillStyle = '#506072';
                            ctx.font = 'bold 12px Arial, sans-serif';
                            ctx.textAlign = 'left';
                            ctx.fillText(`${unit.progress}%`, 70, y);
                            
                            // Draw progress bar
                            ctx.fillStyle = '#e2ecf5';
                            ctx.fillRect(70, y + 8, 660, 6);
                            ctx.fillStyle = '#2ecc71';
                            ctx.fillRect(70, y + 8, 6.6 * unit.progress, 6);

                            ctx.textAlign = 'right';
                          });

                          // Quiz performance section
                          ctx.fillStyle = '#006d37';
                          ctx.font = 'bold 15px Arial, sans-serif';
                          ctx.textAlign = 'right';
                          ctx.fillText('التحليل البياني لأداء الاختبارات المنهجية:', canvas.width - 70, 775);

                          const quizDataList = progress.quizScoreHistory.length > 0 ? progress.quizScoreHistory.slice(0, 3) : [
                            { unitTitle: 'آليات تركيب البروتين (نموذجي)', score: 4, total: 5 },
                            { unitTitle: 'العلاقة بين بنية البروتين ووظيفته (نموذجي)', score: 9, total: 10 },
                            { unitTitle: 'الذات واللاذات (نموذجي)', score: 3, total: 4 }
                          ];

                          quizDataList.forEach((quiz, qIdx) => {
                            const y = 805 + qIdx * 50;
                            const scorePct = Math.round((quiz.score / quiz.total) * 100);

                            ctx.fillStyle = '#1f1c0b';
                            ctx.font = '12px Arial, sans-serif';
                            ctx.textAlign = 'right';
                            ctx.fillText(quiz.unitTitle, canvas.width - 70, y);

                            ctx.fillStyle = '#506072';
                            ctx.font = 'bold 12px Arial, sans-serif';
                            ctx.textAlign = 'left';
                            ctx.fillText(`${quiz.score}/${quiz.total} (${scorePct}%)`, 70, y);

                            // Quiz bar chart
                            ctx.fillStyle = '#f3f4f5';
                            ctx.fillRect(70, y + 8, 660, 8);
                            ctx.fillStyle = scorePct >= 75 ? '#006d37' : scorePct >= 50 ? '#ff9a4a' : '#ba1a1a';
                            ctx.fillRect(70, y + 8, 6.6 * scorePct, 8);

                            ctx.textAlign = 'right';
                          });

                          // Stamp & signature
                          const footerY = 990;
                          
                          // Draw circle seal
                          ctx.strokeStyle = 'rgba(0,109,55,0.4)';
                          ctx.lineWidth = 3;
                          ctx.beginPath();
                          ctx.arc(150, footerY, 42, 0, Math.PI * 2);
                          ctx.stroke();

                          ctx.fillStyle = 'rgba(0,109,55,0.6)';
                          ctx.font = 'bold 8px Arial, sans-serif';
                          ctx.textAlign = 'center';
                          ctx.fillText('تمت المصادقة', 150, footerY - 10);
                          ctx.fillText('منصة كنز العلوم', 150, footerY + 3);
                          ctx.fillText('SVT BAC DZ', 150, footerY + 16);

                          // AI signature
                          ctx.fillStyle = '#506072';
                          ctx.font = 'italic bold 12px Arial, sans-serif';
                          ctx.fillText('المرشد الذكي للبكالوريا', canvas.width - 150, footerY - 10);
                          
                          ctx.font = '10px Arial, sans-serif';
                          ctx.fillText(`تاريخ الإصدار: ${fmtDateLatn(new Date())}`, canvas.width - 150, footerY + 15);

                          // Trigger image download
                          const dataUrl = canvas.toDataURL('image/png');
                          const link = document.createElement('a');
                          link.download = `SVT_Bac_Report_Card_${studentName || 'Student'}.png`;
                          link.href = dataUrl;
                          link.click();
                        }}
                        className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-gradient-to-r from-[#ba933c] to-[#944a00] hover:opacity-90 text-white text-xs font-extrabold px-4 py-2.5 rounded-xl shadow cursor-pointer transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>تحميل كبطاقة صورة</span>
                      </button>
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-400 text-right">
                    💡 يمكنك حفظ الملف بصيغة PDF بالضغط على زر "طباعة" واختيار "حفظ بتنسيق PDF" كوجهة طابعة في المتصفح.
                  </p>
                </div>

                {/* Printable Area - Formatted as an official document */}
                <div 
                  id="print-report-card"
                  ref={reportRef}
                  className="bg-[#faf6ee] border-4 border-double border-[#006d37] rounded-3xl p-6 md:p-8 space-y-6 shadow-md relative overflow-hidden"
                >
                  {/* Decorative Watermark */}
                  <div className="absolute inset-0 opacity-[0.015] pointer-events-none flex items-center justify-center">
                    <Trophy className="w-96 h-96" />
                  </div>

                  {/* Document Header */}
                  <div className="text-center space-y-1.5 border-b-2 border-dashed border-[#006d37]/20 pb-4">
                    <span className="text-xs font-bold text-[#506072] block tracking-wide">الجمهورية الجزائرية الديمقراطية الشعبية</span>
                    <span className="text-[11px] font-bold text-gray-500 block">وزارة التربية الوطنية • الديوان الوطني للامتحانات والمسابقات</span>
                    <span className="text-xs font-extrabold text-[#006d37] bg-[#2ecc71]/10 px-3 py-1 rounded-full inline-block mt-1">
                      منصة كنز العلوم التفاعلية لعلوم الطبيعة والحياة للبكالوريا
                    </span>
                  </div>

                  {/* Certificate Title */}
                  <div className="text-center space-y-2 py-2">
                    <h2 className="text-2xl font-black text-[#944a00] font-display">كشف الإنجاز والتقدم الدراسي النموذجي</h2>
                    <p className="text-xs text-gray-500 font-semibold">شهادة إثبات الكفاءة وتحصيل المنهجية العلمية لمادة علوم الطبيعة والحياة</p>
                  </div>

                  {/* Student Bio Statement */}
                  <div className="bg-white/50 border border-[#e2dabf]/30 p-4 rounded-2xl text-center space-y-2">
                    <p className="text-xs text-gray-500">يشهد الديوان الإلكتروني لمنصة كنز العلوم التفاعلية بأن الطالب(ة):</p>
                    <div className="text-xl font-black text-[#006d37] py-1 border-b border-dashed border-[#006d37]/20 inline-block px-8">
                      {studentName || 'طالب متميز'}
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed max-w-xl mx-auto">
                      قد واصل تدريبات المراجعة الذكية بالتكرار المتباعد، وأظهر تحكماً ممتازاً في المنهجية العلمية (الاستدلال والمسعى العلمي) للتحضير لبكالوريا 2026 محرزاً الإحصائيات التالية:
                    </p>
                  </div>

                  {/* Grid of Key Performance Indicators */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-white border border-[#e2dabf]/50 p-3 rounded-xl text-center shadow-sm">
                      <span className="text-[10px] text-gray-400 block font-bold">النقاط التراكمية</span>
                      <span className="text-lg font-black text-[#006d37]">{progress.xp} XP</span>
                    </div>
                    <div className="bg-white border border-[#e2dabf]/50 p-3 rounded-xl text-center shadow-sm">
                      <span className="text-[10px] text-gray-400 block font-bold">المواظبة والاستمرارية</span>
                      <span className="text-lg font-black text-[#ff9a4a]">{progress.streak} أيام متتالية</span>
                    </div>
                    <div className="bg-white border border-[#e2dabf]/50 p-3 rounded-xl text-center shadow-sm">
                      <span className="text-[10px] text-gray-400 block font-bold">الأسئلة والتمارين</span>
                      <span className="text-lg font-black text-[#944a00]">{progress.completedQuestionsCount} سؤال</span>
                    </div>
                    <div className="bg-white border border-[#e2dabf]/50 p-3 rounded-xl text-center shadow-sm">
                      <span className="text-[10px] text-gray-400 block font-bold">زمن التحصيل العلمي</span>
                      <span className="text-lg font-black text-[#006d37]">{progress.studyMinutes} دقيقة</span>
                    </div>
                  </div>

                  {/* Units and Lessons Progress Table */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-[#006d37] border-b border-[#006d37]/20 pb-1.5 flex items-center gap-1.5 text-right">
                      <BookOpen className="w-4 h-4" />
                      <span>أكثر الدروس والوحدات تقدماً وتحصيلاً:</span>
                    </h4>
                    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden divide-y divide-gray-100">
                      {([...units].sort((a, b) => b.progress - a.progress).slice(0, 3)).map((unit) => (
                        <div key={unit.id} className="p-3 flex items-center justify-between text-xs text-right">
                          <div className="space-y-0.5">
                            <span className="font-extrabold text-gray-800">{unit.title}</span>
                            <span className="text-[10px] text-gray-400 block">{unit.description}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-24 bg-gray-100 h-2 rounded-full overflow-hidden">
                              <div className="bg-[#2ecc71] h-full" style={{ width: `${unit.progress}%` }} />
                            </div>
                            <span className="font-bold text-gray-600">{unit.progress}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quiz performance graph */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-[#006d37] border-b border-[#006d37]/20 pb-1.5 flex items-center gap-1.5 text-right">
                      <Activity className="w-4 h-4" />
                      <span>التحليل البياني لأداء الاختبارات المنهجية:</span>
                    </h4>
                    <div className="space-y-2.5 bg-white p-4 rounded-2xl border border-gray-100">
                      {(progress.quizScoreHistory.length > 0 ? progress.quizScoreHistory.slice(0, 3) : [
                        { unitTitle: 'آليات تركيب البروتين (نموذجي)', score: 4, total: 5 },
                        { unitTitle: 'العلاقة بين بنية البروتين ووظيفته (نموذجي)', score: 9, total: 10 },
                        { unitTitle: 'الذات واللاذات (نموذجي)', score: 3, total: 4 }
                      ]).map((quiz, qidx) => {
                        const pct = Math.round((quiz.score / quiz.total) * 100);
                        let barColor = 'bg-[#006d37]';
                        if (pct < 50) barColor = 'bg-[#ba1a1a]';
                        else if (pct < 75) barColor = 'bg-[#ff9a4a]';

                        return (
                          <div key={qidx} className="space-y-1 text-right">
                            <div className="flex justify-between text-[11px] font-bold text-gray-700">
                              <span className="line-clamp-1">{quiz.unitTitle}</span>
                              <span className="font-mono">{quiz.score} / {quiz.total} ({pct}%)</span>
                            </div>
                            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Validation Seal and Signature row */}
                  <div className="flex flex-row-reverse justify-between items-center pt-4 border-t border-dashed border-[#006d37]/20">
                    {/* Stamp */}
                    <div className="relative w-20 h-20 flex items-center justify-center border-2 border-dashed border-[#006d37]/30 rounded-full bg-white text-[9px] text-[#006d37]/80 text-center flex-col font-bold leading-tight p-2 shadow-inner">
                      <CheckCircle2 className="w-4 h-4 mb-0.5 text-[#2ecc71] fill-[#2ecc71]/10" />
                      <span>منصة كنز العلوم</span>
                      <span className="text-[7px] text-gray-400">SVT BAC DZ</span>
                    </div>
                    
                    {/* Signature */}
                    <div className="text-right space-y-1">
                      <span className="text-[10px] text-gray-400 block font-bold">توقيع ومصادقة:</span>
                      <span className="text-xs font-extrabold text-[#506072] block">المرشد الذكي للبكالوريا</span>
                      <span className="text-[10px] font-mono text-gray-400 block">تاريخ الإصدار: {fmtDateLatn(new Date(), { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                  </div>

                </div>

              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-[#e2dabf]/40 flex justify-end bg-gray-50 rounded-b-3xl no-print">
                <button
                  onClick={() => setShowReportModal(false)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-extrabold text-xs px-5 py-2.5 rounded-xl cursor-pointer transition-colors"
                >
                  إغلاق النافذة
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Shareable Weekly Visual Performance Card Modal */}
      <WeeklyReportShareModal
        isOpen={showWeeklyShareModal}
        onClose={() => setShowWeeklyShareModal(false)}
        progress={progress}
        units={units}
        weeklyXP={totalWeeklyXP}
      />

      {/* Streak Milestone Celebration Modal */}
      <StreakCelebrationModal
        isOpen={showStreakModal}
        onClose={() => setShowStreakModal(false)}
        streakDays={progress.streak || 1}
        onOpenShareModal={() => setShowWeeklyShareModal(true)}
      />

    </div>
  );
}
