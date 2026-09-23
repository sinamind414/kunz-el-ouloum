import { useState, useRef, useMemo } from 'react';
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
  LineChart,
  Line,
  CartesianGrid,
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
  TrendingUp,
  Share2,
  Target,
} from 'lucide-react';
import { UserProgress, Unit } from '../types';
import WeeklyReportShareModal from './WeeklyReportShareModal';
import MethodologyGlobalStats from './MethodologyGlobalStats';
import StreakCelebrationModal from './StreakCelebrationModal';
import { playStreakMilestoneSound, playXPGainSound } from '../utils/audio';
import StatsWeeklySection from './StatsWeeklySection';
import StatsReportCardModal from './StatsReportCardModal';
import {
  avgCompletionRate as computeAvgCompletionRate,
  bestDay as pickBestDay,
  buildWeeklyPerformanceData,
  toWeeklyChartRows,
} from '../utils/weeklyStats';

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
  
  // Weekly XP & Achievement Progress Data (Recharts) — 100 % réel.
  // Logique pure extraite dans src/utils/weeklyStats.ts (P1) :
  //  · étiquettes = vrais jours civils (plus de grille סبت→جمعة figée) ;
  //  · isPast = jour clos (le jour en cours n'est plus « passé » à tort) ;
  //  · avgCompletionRate ne moyenne que les jours clos.
  const weeklyPoints = useMemo(
    () => buildWeeklyPerformanceData(progress.quizScoreHistory, progress.dailyGoals),
    [progress.quizScoreHistory, progress.dailyGoals],
  );
  const weeklyPerformanceData = useMemo(() => toWeeklyChartRows(weeklyPoints), [weeklyPoints]);

  const totalWeeklyXP = useMemo(() => {
    return weeklyPerformanceData.reduce((acc, curr) => acc + (curr['نقاط XP'] || 0), 0);
  }, [weeklyPerformanceData]);

  const avgCompletionRate = useMemo(() => computeAvgCompletionRate(weeklyPoints), [weeklyPoints]);

  const bestDay = useMemo(() => pickBestDay(weeklyPoints), [weeklyPoints]);

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

      <StatsWeeklySection
        progress={progress}
        weeklyMetricTab={weeklyMetricTab}
        setWeeklyMetricTab={setWeeklyMetricTab}
        totalWeeklyXP={totalWeeklyXP}
        avgCompletionRate={avgCompletionRate}
        bestDay={bestDay}
        hasWeeklyActivity={hasWeeklyActivity}
        weeklyPerformanceData={weeklyPerformanceData}
        setShowWeeklyShareModal={setShowWeeklyShareModal}
        onNavigate={onNavigate}
      />
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

      <StatsReportCardModal
        showReportModal={showReportModal}
        setShowReportModal={setShowReportModal}
        studentName={studentName}
        setStudentName={setStudentName}
        reportRef={reportRef}
        progress={progress}
        units={units}
      />
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
