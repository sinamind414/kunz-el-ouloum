import { motion } from 'motion/react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LineChart,
  Line,
  CartesianGrid,
  AreaChart,
  Area,
  ComposedChart,
  ReferenceLine,
  Cell,
} from 'recharts';
import {
  Trophy,
  Activity,
  Sparkles,
  Award,
  TrendingUp,
  Share2,
  Zap,
  Target,
  BarChart2,
} from 'lucide-react';
import { UserProgress } from '../types';
import { WeeklyChartRow } from '../utils/weeklyStats';

type WeeklyMetricTab = 'combined' | 'xp' | 'completion';

interface StatsWeeklySectionProps {
  progress: UserProgress;
  weeklyMetricTab: WeeklyMetricTab;
  setWeeklyMetricTab: (t: WeeklyMetricTab) => void;
  totalWeeklyXP: number;
  avgCompletionRate: number;
  bestDay: { day: string; xp: number } | null;
  hasWeeklyActivity: boolean;
  weeklyPerformanceData: WeeklyChartRow[];
  setShowWeeklyShareModal: (v: boolean) => void;
  onNavigate?: (tab: string) => void;
}

export default function StatsWeeklySection({
  progress,
  weeklyMetricTab,
  setWeeklyMetricTab,
  totalWeeklyXP,
  avgCompletionRate,
  bestDay,
  hasWeeklyActivity,
  weeklyPerformanceData,
  setShowWeeklyShareModal,
  onNavigate,
}: StatsWeeklySectionProps) {
  return (
<>
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
              <span className="text-base sm:text-lg font-black text-[#1e40af]">{bestDay?.day || '—'}</span>
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
</>
  );
}
