import { useState, useRef } from 'react';
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
  CartesianGrid
} from 'recharts';
import { Trophy, Flame, Calendar, BookOpen, Clock, Activity, Sparkles, Award, Lock, CheckCircle2, TrendingUp, Printer, Download, X, FileText, Check } from 'lucide-react';
import { UserProgress, Unit } from '../types';

interface StatsViewProps {
  progress: UserProgress;
  units: Unit[];
}

export default function StatsView({ progress, units }: StatsViewProps) {
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [studentName, setStudentName] = useState<string>('');
  const reportRef = useRef<HTMLDivElement>(null);
  
  // 1. Format data for the Spaced Repetition card status chart
  const cardData = [
    { name: 'إعادة', value: progress.flashcardStats.again, color: '#ba1a1a' },
    { name: 'صعب', value: progress.flashcardStats.hard, color: '#506072' },
    { name: 'جيد', value: progress.flashcardStats.good, color: '#006d37' },
    { name: 'سهل', value: progress.flashcardStats.easy, color: '#2ecc71' }
  ].filter(item => item.value > 0);

  // Fallback if no cards have been rated yet
  const hasCardData = cardData.length > 0;
  const mockCardData = [
    { name: 'إعادة', value: 3, color: '#ba1a1a' },
    { name: 'صعب', value: 5, color: '#506072' },
    { name: 'جيد', value: 12, color: '#006d37' },
    { name: 'سهل', value: 8, color: '#2ecc71' }
  ];

  // 2. Format quiz history data
  const quizHistory = progress.quizScoreHistory.map((item, idx) => ({
    name: item.unitTitle.substring(0, 15) + '...',
    'النتيجة %': Math.round((item.score / item.total) * 100),
    scoreText: `${item.score} / ${item.total}`
  }));

  const hasQuizHistory = quizHistory.length > 0;
  const mockQuizHistory = [
    { name: 'تركيب البروتين', 'النتيجة %': 75, scoreText: '3 / 4' },
    { name: 'بنية البروتين', 'النتيجة %': 90, scoreText: '5 / 6' },
    { name: 'دور البروتينات', 'النتيجة %': 60, scoreText: '3 / 5' }
  ];

  // 3. Format quiz timeline progress (scores over time)
  const quizTimeline = progress.quizScoreHistory.map((item) => ({
    date: item.date,
    'الدرجة %': Math.round((item.score / item.total) * 100),
    title: item.unitTitle,
    scoreText: `${item.score}/${item.total}`
  }));

  const hasQuizTimeline = quizTimeline.length > 0;
  const mockQuizTimeline = [
    { date: '05/07', 'الدرجة %': 65, title: 'آليات تركيب البروتين', scoreText: '3/5' },
    { date: '05/07', 'الدرجة %': 80, title: 'العلاقة بين البنية والوظيفة', scoreText: '4/5' },
    { date: '06/07', 'الدرجة %': 75, title: 'الذات واللاذات', scoreText: '3/4' },
    { date: '06/07', 'الدرجة %': 90, title: 'الاستجابة المناعية الخلطية', scoreText: '9/10' }
  ];

  // Total lessons completed
  const completedUnitsCount = progress.completedUnits.length;

  // Spaced repetition stats total
  const totalCardsRated = 
    (progress.flashcardStats?.again || 0) + 
    (progress.flashcardStats?.hard || 0) + 
    (progress.flashcardStats?.good || 0) + 
    (progress.flashcardStats?.easy || 0);

  // 4. Mock Monthly Unit Progress Data for Recharts
  const monthlyUnitProgress = [
    { name: 'الأسبوع 1', 'تركيب البروتين': 20, 'بنية البروتين': 0, 'الأنزيمات': 0, 'المناعة': 0 },
    { name: 'الأسبوع 2', 'تركيب البروتين': 50, 'بنية البروتين': 30, 'الأنزيمات': 0, 'المناعة': 0 },
    { name: 'الأسبوع 3', 'تركيب البروتين': 80, 'بنية البروتين': 60, 'الأنزيمات': 20, 'المناعة': 0 },
    { name: 'الأسبوع 4', 'تركيب البروتين': 100, 'بنية البروتين': 85, 'الأنزيمات': 50, 'المناعة': 10 }
  ];

  const colors = ['#006d37', '#2ecc71', '#ff9a4a', '#ba1a1a', '#fed65b'];


  return (
    <div className="space-y-6 pb-24 font-sans">
      
      {/* Title Header */}
      <section className="px-1 shrink-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#006d37] dark:text-[#2ecc71] font-display">إحصائيات الإنجاز والتقدم</h2>
          <p className="text-xs text-[#506072] dark:text-zinc-300 font-semibold mt-1">تتبع رحلتك العلمية والتحضير للبكالوريا</p>
        </div>
        <button
          onClick={() => setShowReportModal(true)}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#006d37] to-[#2ecc71] hover:from-[#005027] hover:to-[#27ae60] text-white font-extrabold text-xs px-5 py-3 rounded-2xl shadow-md cursor-pointer transition-all active:scale-95 self-start sm:self-auto border border-transparent"
          id="generate-report-btn"
        >
          <Award className="w-4 h-4 text-[#fed65b] fill-[#fed65b] animate-pulse" />
          <span>تصدير كشف النقاط الرسمي (PDF)</span>
        </button>
      </section>

      {/* Grid Stats Highlights */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Streak Item */}
        <div className="bg-[#ffffff] border border-[#e2dabf]/60 p-4 rounded-2xl shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#ff9a4a]/10 text-[#ff9a4a] flex items-center justify-center">
            <Flame className="w-5 h-5 fill-current" />
          </div>
          <div>
            <span className="text-[10px] text-[#506072] block font-semibold">اليوم المتتالي</span>
            <span className="text-xl font-bold text-[#1f1c0b]">{progress.streak} يوم</span>
          </div>
        </div>

        {/* XP Item */}
        <div className="bg-[#ffffff] border border-[#e2dabf]/60 p-4 rounded-2xl shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#fed65b]/10 text-[#944a00] flex items-center justify-center">
            <Trophy className="w-5 h-5 fill-current text-white" />
          </div>
          <div>
            <span className="text-[10px] text-[#506072] block font-semibold">مجموع النقاط</span>
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

      {/* Monthly Unit Progress LineChart */}
      <section className="bg-[#ffffff] border border-[#e2dabf]/60 rounded-3xl p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-[#006d37]" />
          <h3 className="font-extrabold text-base text-[#1f1c0b]">تطور مستوى الوحدات على مدار الشهر</h3>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyUnitProgress} margin={{ top: 15, right: 15, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2dabf" strokeOpacity={0.3} />
              <XAxis dataKey="name" stroke="#506072" fontSize={10} tickLine={false} />
              <YAxis stroke="#506072" fontSize={10} tickLine={false} domain={[0, 100]} />
              <Tooltip 
                formatter={(value: any, name: any) => [`${value}%`, name]}
                contentStyle={{ direction: 'rtl', fontFamily: 'Noto Kufi Arabic', fontSize: 11, borderRadius: '12px', border: '1px solid #e2dabf' }}
              />
              <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '11px', fontFamily: 'Noto Kufi Arabic', direction: 'rtl' }}/>
              {Object.keys(monthlyUnitProgress[0])
                .filter(key => key !== 'name')
                .map((key, index) => (
                  <Line 
                    key={key}
                    type="monotone" 
                    dataKey={key} 
                    stroke={colors[index % colors.length]} 
                    strokeWidth={3}
                    activeDot={{ r: 6 }} 
                  />
                ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Evolution Over Time LineChart */}
      <section className="bg-[#ffffff] border border-[#e2dabf]/60 rounded-3xl p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-[#006d37]" />
          <h3 className="font-extrabold text-base text-[#1f1c0b]">منحنى تطور المستوى العلمي عبر الزمن</h3>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={hasQuizTimeline ? quizTimeline : mockQuizTimeline} margin={{ top: 15, right: 15, left: -20, bottom: 0 }}>
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
        {!hasQuizTimeline && (
          <p className="text-[11px] text-[#506072] text-center bg-[#fff9ed] p-2 rounded-xl border border-[#fed65b]/30">
            💡 يظهر المخطط البياني التجريبي أعلاه. قم بحل الاختبارات المتعددة لبناء منحنى تقدمك الحقيقي!
          </p>
        )}
      </section>

      <div className="grid md:grid-cols-2 gap-6">
        
        {/* Quiz History Performance BarChart */}
        <div className="bg-[#ffffff] border border-[#e2dabf]/60 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#006d37]" />
            <h3 className="font-extrabold text-base text-[#1f1c0b]">نتائج التدريبات والاختبارات</h3>
          </div>
          
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hasQuizHistory ? quizHistory : mockQuizHistory} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#506072" fontSize={10} tickLine={false} />
                <YAxis stroke="#506072" fontSize={10} tickLine={false} domain={[0, 100]} />
                <Tooltip 
                  formatter={(value: any, name: any, props: any) => [`${value}% (${props.payload.scoreText || 'نموذجية'})`, 'الدرجة']}
                  contentStyle={{ direction: 'rtl', fontFamily: 'Noto Kufi Arabic', fontSize: 11, borderRadius: '12px', border: '1px solid #e2dabf' }}
                />
                <Bar dataKey="النتيجة %" fill="#006d37" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {!hasQuizHistory && (
            <p className="text-[11px] text-[#506072] text-center bg-[#fff9ed] p-2 rounded-xl border border-[#fed65b]/30">
              💡 يظهر أعلاه تمثيل تجريبي. ابدأ بحل أول اختبار لتسجيل نتيجتك الحقيقية!
            </p>
          )}
        </div>

        {/* Flashcards SM-2 Distribution PieChart */}
        <div className="bg-[#ffffff] border border-[#e2dabf]/60 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#944a00]" />
            <h3 className="font-extrabold text-base text-[#1f1c0b]">مستويات تذكر بطاقات المراجعة</h3>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 h-64">
            <div className="h-full flex-1 w-full max-w-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={hasCardData ? cardData : mockCardData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {(hasCardData ? cardData : mockCardData).map((entry, index) => (
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
              {(hasCardData ? cardData : mockCardData).map((item, idx) => (
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
          {!hasCardData && (
            <p className="text-[11px] text-[#506072] text-center bg-[#fff9ed] p-2 rounded-xl border border-[#fed65b]/30">
              💡 تظهر مستويات التذكر بالتكرار المتباعد بعد تقييمك للبطاقات الذكية.
            </p>
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
          body * { visibility: hidden !important; }
          #print-report-card, #print-report-card * { visibility: visible !important; }
          #print-report-card { position: absolute !important; left: 0 !important; top: 0 !important; width: 100% !important; height: 100% !important; background: #faf6ee !important; color: #1f1c0b !important; box-shadow: none !important; border: 4px double #006d37 !important; margin: 0 !important; padding: 2cm !important; border-radius: 0 !important; }
          .no-print { display: none !important; }
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
                          const canvas = document.createElement('canvas');
                          canvas.width = 800;
                          canvas.height = 1100;
                          const ctx = canvas.getContext('2d');
                          if (!ctx) return;

                          ctx.fillStyle = '#fffcf5';
                          ctx.fillRect(0, 0, canvas.width, canvas.height);

                          ctx.strokeStyle = '#006d37';
                          ctx.lineWidth = 6;
                          ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);
                          
                          ctx.strokeStyle = '#fed65b';
                          ctx.lineWidth = 2;
                          ctx.strokeRect(30, 30, canvas.width - 60, canvas.height - 60);

                          ctx.fillStyle = '#006d37';
                          ctx.font = 'bold 22px Arial, sans-serif';
                          ctx.textAlign = 'center';
                          ctx.fillText('الجمهورية الجزائرية الديمقراطية الشعبية', canvas.width / 2, 80);
                          
                          ctx.fillStyle = '#506072';
                          ctx.font = 'bold 12px Arial, sans-serif';
                          ctx.fillText('وزارة التربية الوطنية • الديوان الوطني للامتحانات والمسابقات', canvas.width / 2, 110);
                          ctx.fillText('فضاء كنز العلوم لتسهيل مادة علوم الطبيعة والحياة للبكالوريا', canvas.width / 2, 130);

                          ctx.strokeStyle = '#e2dabf';
                          ctx.lineWidth = 1;
                          ctx.beginPath();
                          ctx.moveTo(100, 155);
                          ctx.lineTo(canvas.width - 100, 155);
                          ctx.stroke();

                          ctx.fillStyle = '#944a00';
                          ctx.font = 'bold 24px Arial, sans-serif';
                          ctx.fillText('كشف النقاط الإنجازي وشهادة التفوق للبكالوريا', canvas.width / 2, 200);

                          ctx.fillStyle = '#1f1c0b';
                          ctx.font = '15px Arial, sans-serif';
                          ctx.fillText('يشهد فضاء كنز العلوم التفاعلي بأن الطالب(ة):', canvas.width / 2, 245);

                          ctx.fillStyle = '#006d37';
                          ctx.font = 'bold 28px Arial, sans-serif';
                          ctx.fillText(studentName || 'طالب متميز', canvas.width / 2, 290);

                          ctx.fillStyle = '#506072';
                          ctx.font = '13px Arial, sans-serif';
                          ctx.fillText('قد أنجز مسار المراجعة الذكية والتدريبات المنهجية وحقق المؤشرات التحصيلية التالية:', canvas.width / 2, 330);

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

                          ctx.strokeStyle = '#e2dabf';
                          ctx.beginPath();
                          ctx.moveTo(70, 565);
                          ctx.lineTo(canvas.width - 70, 565);
                          ctx.stroke();

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
                            
                            ctx.fillStyle = '#e2ecf5';
                            ctx.fillRect(70, y + 8, 660, 6);
                            ctx.fillStyle = '#2ecc71';
                            ctx.fillRect(70, y + 8, 6.6 * unit.progress, 6);

                            ctx.textAlign = 'right';
                          });

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

                            ctx.fillStyle = '#f3f4f5';
                            ctx.fillRect(70, y + 8, 660, 8);
                            ctx.fillStyle = scorePct >= 75 ? '#006d37' : scorePct >= 50 ? '#ff9a4a' : '#ba1a1a';
                            ctx.fillRect(70, y + 8, 6.6 * scorePct, 8);

                            ctx.textAlign = 'right';
                          });

                          const footerY = 990;
                          
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

                          ctx.fillStyle = '#506072';
                          ctx.font = 'italic bold 12px Arial, sans-serif';
                          ctx.fillText('المرشد الذكي للبكالوريا', canvas.width - 150, footerY - 10);
                          
                          ctx.font = '10px Arial, sans-serif';
                          ctx.fillText(`تاريخ الإصدار: ${new Date().toLocaleDateString('ar-DZ')}`, canvas.width - 150, footerY + 15);

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

                {/* Printable Area */}
                <div 
                  id="print-report-card"
                  ref={reportRef}
                  className="bg-[#faf6ee] border-4 border-double border-[#006d37] rounded-3xl p-6 md:p-8 space-y-6 shadow-md relative overflow-hidden"
                >
                  <div className="absolute inset-0 opacity-[0.015] pointer-events-none flex items-center justify-center">
                    <Trophy className="w-96 h-96" />
                  </div>

                  <div className="text-center space-y-1.5 border-b-2 border-dashed border-[#006d37]/20 pb-4">
                    <span className="text-xs font-bold text-[#506072] block tracking-wide">الجمهورية الجزائرية الديمقراطية الشعبية</span>
                    <span className="text-[11px] font-bold text-gray-500 block">وزارة التربية الوطنية • الديوان الوطني للامتحانات والمسابقات</span>
                    <span className="text-xs font-extrabold text-[#006d37] bg-[#2ecc71]/10 px-3 py-1 rounded-full inline-block mt-1">
                      منصة كنز العلوم التفاعلية لعلوم الطبيعة والحياة للبكالوريا
                    </span>
                  </div>

                  <div className="text-center space-y-2 py-2">
                    <h2 className="text-2xl font-black text-[#944a00] font-display">كشف الإنجاز والتقدم الدراسي النموذجي</h2>
                    <p className="text-xs text-gray-500 font-semibold">شهادة إثبات الكفاءة وتحصيل المنهجية العلمية لمادة علوم الطبيعة والحياة</p>
                  </div>

                  <div className="bg-white/50 border border-[#e2dabf]/30 p-4 rounded-2xl text-center space-y-2">
                    <p className="text-xs text-gray-500">يشهد الديوان الإلكتروني لمنصة كنز العلوم التفاعلية بأن الطالب(ة):</p>
                    <div className="text-xl font-black text-[#006d37] py-1 border-b border-dashed border-[#006d37]/20 inline-block px-8">
                      {studentName || 'طالب متميز'}
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed max-w-xl mx-auto">
                      قد واصل تدريبات المراجعة الذكية بالتكرار المتباعد، وأظهر تحكماً ممتازاً في المنهجية العلمية (الاستدلال والمسعى العلمي) للتحضير لبكالوريا 2026 محرزاً الإحصائيات التالية:
                    </p>
                  </div>

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

                  <div className="flex flex-row-reverse justify-between items-center pt-4 border-t border-dashed border-[#006d37]/20">
                    <div className="relative w-20 h-20 flex items-center justify-center border-2 border-dashed border-[#006d37]/30 rounded-full bg-white text-[9px] text-[#006d37]/80 text-center flex-col font-bold leading-tight p-2 shadow-inner">
                      <CheckCircle2 className="w-4 h-4 mb-0.5 text-[#2ecc71] fill-[#2ecc71]/10" />
                      <span>منصة كنز العلوم</span>
                      <span className="text-[7px] text-gray-400">SVT BAC DZ</span>
                    </div>
                    
                    <div className="text-right space-y-1">
                      <span className="text-[10px] text-gray-400 block font-bold">توقيع ومصادقة:</span>
                      <span className="text-xs font-extrabold text-[#506072] block">المرشد الذكي للبكالوريا</span>
                      <span className="text-[10px] font-mono text-gray-400 block">تاريخ الإصدار: {new Date().toLocaleDateString('ar-DZ', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
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

    </div>
  );
}
