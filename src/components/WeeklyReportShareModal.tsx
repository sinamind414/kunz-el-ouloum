import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Share2, 
  Download, 
  Copy, 
  Check, 
  X, 
  Trophy, 
  Clock, 
  BookOpen, 
  Flame, 
  Sparkles, 
  Award, 
  Zap, 
  Calendar,
  CheckCircle2,
  Palette,
  Send,
  Eye
} from 'lucide-react';
import { UserProgress, Unit } from '../types';
import { fmtDateLatn } from '../utils/latinDigits';

interface WeeklyReportShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  progress: UserProgress;
  units: Unit[];
  /** XP réel de la semaine (calculé par StatsView) — 0 par défaut, jamais inventé */
  weeklyXP?: number;
}

export default function WeeklyReportShareModal({
  isOpen,
  onClose,
  progress,
  units,
  weeklyXP = 0
}: WeeklyReportShareModalProps) {
  const [studentName, setStudentName] = useState<string>('طالب بكالوريا متفوق');
  const [cardTheme, setCardTheme] = useState<'emerald' | 'gold' | 'night'>('emerald');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Completed & in-progress units calculation
  const completedUnits = units.filter(u => u.progress >= 100);
  const inProgressUnits = units.filter(u => u.progress > 0 && u.progress < 100);
  const totalLessonsCount = completedUnits.length + (inProgressUnits.length > 0 ? inProgressUnits.length : 1);

  // Time calculations
  const totalMinutes = progress.studyMinutes || 0; // zéro réel, jamais 45 inventées
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  const timeFormatted = hours > 0 ? `${hours} س و ${mins} د` : `${mins} دقيقة`;

  // XP réel de la semaine passé par StatsView (0 si aucune activité)
  const questionsCompleted = progress.completedQuestionsCount || 0;

  // Calculate overall accuracy rate from quiz score history
  const averageAccuracy = progress.quizScoreHistory.length > 0
    ? Math.round(
        (progress.quizScoreHistory.reduce((acc, curr) => acc + (curr.score / curr.total), 0) /
          progress.quizScoreHistory.length) *
          100
      )
    : 0;

  // Text summary to copy for sharing
  const shareText = `📊 تقرير أدائي الأسبوعي في منصة كنز العلوم (SVT BAC DZ) 🏆
👤 الطالب(ة): ${studentName}
----------------------------------
📚 الدروس والوحدات المنجزة: ${totalLessonsCount} وحدات
⏳ وقت المذاكرة الإجمالي: ${timeFormatted}
⚡ نقاط الخبرة المكتسبة: ${weeklyXP} XP (المجموع: ${progress.xp} XP)
🔥 المواظبة المتتالية: ${progress.streak} أيام
🎯 دقة الإجابة في التمارين: ${averageAccuracy}%
----------------------------------
✨ مراجعة ذكية بالتكرار المتباعد نحو العلامة الكاملة 20/20 في البكالوريا! 🎓`;

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    } catch (e) {
      console.error('Failed to copy text', e);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'تقرير أدائي الأسبوعي - كنز العلوم للبكالوريا',
          text: shareText,
          url: window.location.href
        });
      } catch (err) {
        // User cancelled or share failed, fallback to copy
        handleCopyText();
      }
    } else {
      handleCopyText();
    }
  };

  // Helper to draw the visual share card onto canvas
  const renderCardToCanvas = (): HTMLCanvasElement | null => {
    const canvas = document.createElement('canvas');
    canvas.width = 900;
    canvas.height = 1180;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Theme definitions
    const themes = {
      emerald: {
        bgGradient: ['#042617', '#004d26', '#021f13'],
        accent: '#2ecc71',
        gold: '#f6c343',
        cardBg: 'rgba(255, 255, 255, 0.08)',
        border: 'rgba(46, 204, 113, 0.3)',
        textColor: '#ffffff',
        subText: '#a3e6be'
      },
      gold: {
        bgGradient: ['#291800', '#593300', '#1f1200'],
        accent: '#f6c343',
        gold: '#ffea9f',
        cardBg: 'rgba(255, 255, 255, 0.08)',
        border: 'rgba(246, 195, 67, 0.35)',
        textColor: '#ffffff',
        subText: '#fde8ab'
      },
      night: {
        bgGradient: ['#0a0f1d', '#13203c', '#060a14'],
        accent: '#60a5fa',
        gold: '#f6c343',
        cardBg: 'rgba(255, 255, 255, 0.07)',
        border: 'rgba(96, 165, 250, 0.3)',
        textColor: '#ffffff',
        subText: '#93c5fd'
      }
    };

    const currentTheme = themes[cardTheme];

    // 1. Background Gradient
    const bgGrad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    bgGrad.addColorStop(0, currentTheme.bgGradient[0]);
    bgGrad.addColorStop(0.5, currentTheme.bgGradient[1]);
    bgGrad.addColorStop(1, currentTheme.bgGradient[2]);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Decorative Orbs / Glows
    const orb1 = ctx.createRadialGradient(150, 150, 10, 150, 150, 250);
    orb1.addColorStop(0, 'rgba(46, 204, 113, 0.25)');
    orb1.addColorStop(1, 'transparent');
    ctx.fillStyle = orb1;
    ctx.fillRect(0, 0, 400, 400);

    const orb2 = ctx.createRadialGradient(canvas.width - 150, canvas.height - 200, 10, canvas.width - 150, canvas.height - 200, 300);
    orb2.addColorStop(0, 'rgba(246, 195, 67, 0.2)');
    orb2.addColorStop(1, 'transparent');
    ctx.fillStyle = orb2;
    ctx.fillRect(canvas.width - 450, canvas.height - 500, 450, 500);

    // Rounded rectangle helper
    const roundRect = (x: number, y: number, w: number, h: number, r: number) => {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
    };

    // 2. Outer Border Frame
    ctx.strokeStyle = currentTheme.border;
    ctx.lineWidth = 4;
    roundRect(30, 30, canvas.width - 60, canvas.height - 60, 32);
    ctx.stroke();

    // Inner subtle gold border
    ctx.strokeStyle = 'rgba(246, 195, 67, 0.25)';
    ctx.lineWidth = 1.5;
    roundRect(42, 42, canvas.width - 84, canvas.height - 84, 24);
    ctx.stroke();

    // 3. Header: App Brand & Badge
    ctx.fillStyle = currentTheme.gold;
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('⭐ الجمهورية الجزائرية الديمقراطية الشعبية — بكالوريا 2026 ⭐', canvas.width / 2, 85);

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 32px sans-serif';
    ctx.fillText('منصة كنز العلوم • SVT BAC DZ', canvas.width / 2, 130);

    ctx.fillStyle = currentTheme.accent;
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText('بطاقة الإنجاز والتحصيل الأسبوعي (Weekly Mastery Report)', canvas.width / 2, 162);

    // Divider
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(90, 185);
    ctx.lineTo(canvas.width - 90, 185);
    ctx.stroke();

    // 4. Student Name & Honorific Card
    ctx.fillStyle = currentTheme.cardBg;
    roundRect(70, 210, canvas.width - 140, 130, 22);
    ctx.fill();
    ctx.strokeStyle = currentTheme.border;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = currentTheme.subText;
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText('طالب متميز في مادة علوم الطبيعة والحياة', canvas.width / 2, 248);

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 34px sans-serif';
    ctx.fillText(studentName || 'طالب بكالوريا متفوق', canvas.width / 2, 292);

    ctx.fillStyle = currentTheme.gold;
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText('🔥 استمرارية دراسية نشطة بالتكرار المتباعد', canvas.width / 2, 324);

    // 5. Four Key Metric Blocks
    const metricBoxes = [
      {
        title: 'الدروس والوحدات',
        value: `${totalLessonsCount} وحدات`,
        sub: 'مكتملة وقيد الإنجاز',
        iconColor: currentTheme.accent
      },
      {
        title: 'الوقت الإجمالي للمذاكرة',
        value: timeFormatted,
        sub: 'تركيز واستيعاب عميق',
        iconColor: currentTheme.gold
      },
      {
        title: 'نقاط الخبرة (XP)',
        value: `${progress.xp} XP`,
        sub: `+${weeklyXP} XP هذا الأسبوع`,
        iconColor: '#ff9a4a'
      },
      {
        title: 'المواظبة ودقة الإجابة',
        value: `${progress.streak} أيام • ${averageAccuracy}%`,
        sub: 'تحكم ممتاز في المنهجية',
        iconColor: '#a78bfa'
      }
    ];

    metricBoxes.forEach((m, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const boxW = 360;
      const boxH = 125;
      const x = 70 + col * (boxW + 40);
      const y = 370 + row * (boxH + 20);

      // Card Background
      ctx.fillStyle = currentTheme.cardBg;
      roundRect(x, y, boxW, boxH, 18);
      ctx.fill();
      ctx.strokeStyle = currentTheme.border;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Title
      ctx.fillStyle = currentTheme.subText;
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(m.title, x + boxW - 25, y + 35);

      // Value
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 28px sans-serif';
      ctx.fillText(m.value, x + boxW - 25, y + 75);

      // Subtitle
      ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
      ctx.font = '12px sans-serif';
      ctx.fillText(m.sub, x + boxW - 25, y + 104);

      // Decorative mini bar
      ctx.fillStyle = m.iconColor;
      roundRect(x + 20, y + 45, 8, 45, 4);
      ctx.fill();
    });

    // 6. Recent Active Unit Section
    const activeUnit = units.find(u => u.progress > 0) || units[0];
    const unitY = 675;
    ctx.fillStyle = currentTheme.cardBg;
    roundRect(70, unitY, canvas.width - 140, 175, 20);
    ctx.fill();
    ctx.strokeStyle = currentTheme.border;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = currentTheme.gold;
    ctx.font = 'bold 15px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('🎯 الوحدة الأكثر تركيزاً هذا الأسبوع:', canvas.width - 100, unitY + 38);

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 20px sans-serif';
    ctx.fillText(activeUnit ? activeUnit.title : 'آليات تركيب البروتين', canvas.width - 100, unitY + 74);

    // Progress Bar
    const progBarW = canvas.width - 200;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    roundRect(100, unitY + 95, progBarW, 14, 7);
    ctx.fill();

    const unitProgressPct = activeUnit ? activeUnit.progress : 75;
    const fillW = Math.max(15, (progBarW * unitProgressPct) / 100);
    const progGrad = ctx.createLinearGradient(100, 0, 100 + fillW, 0);
    progGrad.addColorStop(0, currentTheme.accent);
    progGrad.addColorStop(1, currentTheme.gold);
    ctx.fillStyle = progGrad;
    roundRect(100, unitY + 95, fillW, 14, 7);
    ctx.fill();

    ctx.fillStyle = currentTheme.subText;
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`نسبة الإنجاز: ${unitProgressPct}%`, 100, unitY + 135);

    ctx.textAlign = 'right';
    ctx.fillText(`التمارين المحلولة: ${questionsCompleted} سؤال منهجي`, canvas.width - 100, unitY + 135);

    // 7. Motivational Quote & Methodology Badge
    const quoteY = 880;
    ctx.fillStyle = 'rgba(246, 195, 67, 0.12)';
    roundRect(70, quoteY, canvas.width - 140, 110, 20);
    ctx.fill();
    ctx.strokeStyle = 'rgba(246, 195, 67, 0.3)';
    ctx.stroke();

    ctx.fillStyle = currentTheme.gold;
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('💡 نصيحة المنهجية العلمية للتفوق:', canvas.width / 2, quoteY + 40);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText('"العلامة الكاملة 20/20 في العلوم تُصنع بالاستدلال العلمي السليم والدقة اللغوية!"', canvas.width / 2, quoteY + 75);

    // 8. Footer & Authentication Seal
    const footerY = 1040;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.font = '13px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('رُصدت الإحصائيات آلياً عبر خوارزمية التكرار المتباعد • SVT BAC 2026', canvas.width / 2, footerY);

    const now = new Date();
    const dateStr = fmtDateLatn(now, { year: 'numeric', month: 'long', day: 'numeric' });
    ctx.fillStyle = currentTheme.subText;
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText(`تاريخ الإصدار: ${dateStr}`, canvas.width / 2, footerY + 28);

    // Stamp circle
    ctx.strokeStyle = currentTheme.gold;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(140, footerY + 5, 36, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = currentTheme.gold;
    ctx.font = '900 10px sans-serif';
    ctx.fillText('معتمد', 140, footerY - 5);
    ctx.fillText('كنز العلوم', 140, footerY + 8);
    ctx.fillText('BAC DZ', 140, footerY + 21);

    return canvas;
  };

  const handleDownloadImage = () => {
    setIsGeneratingImage(true);
    setTimeout(() => {
      try {
        const canvas = renderCardToCanvas();
        if (!canvas) return;
        const dataUrl = canvas.toDataURL('image/png', 1.0);
        const link = document.createElement('a');
        link.download = `SVT_Bac_Weekly_Report_${studentName.replace(/\s+/g, '_')}.png`;
        link.href = dataUrl;
        link.click();
      } catch (err) {
        console.error('Error rendering image', err);
      } finally {
        setIsGeneratingImage(false);
      }
    }, 100);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto" dir="rtl">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 25 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 25 }}
          className="bg-white dark:bg-[#121824] border border-[#e2dabf] dark:border-gray-800 max-w-2xl w-full rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-right text-[#1f1c0b] dark:text-white"
        >
          {/* Header */}
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gradient-to-r from-emerald-50/70 via-teal-50/50 to-transparent dark:from-emerald-950/30 dark:to-transparent">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#006d37] to-[#2ecc71] text-white flex items-center justify-center font-black shadow-md">
                <Share2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-base sm:text-lg text-[#006d37] dark:text-emerald-400">
                  بطاقة تقرير الأداء الأسبوعي القابلة للمشاركة
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                  شارك إنجازك الدراسي مع زملائك أو في مجموعات التحضير للبكالوريا 🎓
                </p>
              </div>
            </div>

            <button 
              onClick={onClose}
              className="w-9 h-9 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
            
            {/* Customization Bar */}
            <div className="bg-gray-50 dark:bg-gray-800/60 p-3.5 rounded-2xl border border-gray-200/70 dark:border-gray-700/60 space-y-3">
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="flex-1 w-full space-y-1">
                  <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 block">
                    اسم الطالب (ليظهر في البطاقة):
                  </label>
                  <input
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="اكتب اسمك هنا..."
                    className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl px-3.5 py-2 text-xs font-bold focus:outline-none focus:border-[#006d37] dark:focus:border-emerald-500"
                  />
                </div>

                {/* Theme Selector */}
                <div className="w-full sm:w-auto space-y-1">
                  <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 block">
                    طابع وتصميم البطاقة:
                  </label>
                  <div className="flex items-center gap-1.5 bg-white dark:bg-gray-900 p-1 rounded-xl border border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => setCardTheme('emerald')}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                        cardTheme === 'emerald'
                          ? 'bg-[#006d37] text-white shadow-xs'
                          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                      <span>زمردي ملكي</span>
                    </button>

                    <button
                      onClick={() => setCardTheme('gold')}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                        cardTheme === 'gold'
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                      <span>كنز ذهبي</span>
                    </button>

                    <button
                      onClick={() => setCardTheme('night')}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                        cardTheme === 'night'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
                      <span>ليلي كوني</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* LIVE CARD PREVIEW */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-[#006d37]" />
                  <span>معاينة البطاقة المرئية للأداء:</span>
                </span>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                  جاهزة للتحميل بدقة فائقة (HD)
                </span>
              </div>

              <div 
                className={`relative overflow-hidden rounded-3xl p-5 sm:p-7 border shadow-xl text-white transition-all duration-300 ${
                  cardTheme === 'emerald'
                    ? 'bg-gradient-to-br from-[#042617] via-[#004d26] to-[#021f13] border-emerald-500/40'
                    : cardTheme === 'gold'
                    ? 'bg-gradient-to-br from-[#291800] via-[#593300] to-[#1f1200] border-amber-500/40'
                    : 'bg-gradient-to-br from-[#0a0f1d] via-[#13203c] to-[#060a14] border-blue-500/40'
                }`}
              >
                {/* Decorative background glow */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

                {/* Inner Border Frame */}
                <div className="border border-white/15 rounded-2xl p-4 sm:p-5 space-y-4 relative z-10 backdrop-blur-2xs">
                  
                  {/* Top Branding */}
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center font-black text-amber-300 shadow-xs">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-black text-xs sm:text-sm block tracking-wide">
                          منصة كنز العلوم • SVT BAC DZ
                        </span>
                        <span className="text-[10px] text-emerald-200/80 block">
                          تقرير الأداء الأسبوعي • بكالوريا 2026
                        </span>
                      </div>
                    </div>

                    <span className="bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[10px] font-black px-2.5 py-1 rounded-xl">
                      ⭐ طالب متميز
                    </span>
                  </div>

                  {/* Student Title Banner */}
                  <div className="text-center py-1">
                    <span className="text-xs text-emerald-200/80 font-bold block">إنجاز الطالب(ة):</span>
                    <h2 className="text-xl sm:text-2xl font-black text-white mt-0.5 tracking-tight">
                      {studentName || 'طالب بكالوريا متفوق'}
                    </h2>
                  </div>

                  {/* 3 Main Highlights (Lessons, Total Time, XP) */}
                  <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
                    
                    {/* Lessons completed */}
                    <div className="bg-white/10 border border-white/15 p-3 rounded-2xl text-center space-y-1 backdrop-blur-xs">
                      <div className="w-7 h-7 mx-auto rounded-xl bg-emerald-400/20 text-emerald-300 flex items-center justify-center">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] text-gray-300 font-bold block">الدروس والوحدات</span>
                      <span className="text-base sm:text-lg font-black text-white block">
                        {totalLessonsCount} <span className="text-xs font-normal text-gray-300">وحدات</span>
                      </span>
                    </div>

                    {/* Total Time */}
                    <div className="bg-white/10 border border-white/15 p-3 rounded-2xl text-center space-y-1 backdrop-blur-xs">
                      <div className="w-7 h-7 mx-auto rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center">
                        <Clock className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] text-gray-300 font-bold block">وقت المذاكرة</span>
                      <span className="text-sm sm:text-base font-black text-white block truncate">
                        {timeFormatted}
                      </span>
                    </div>

                    {/* XP Earned */}
                    <div className="bg-white/10 border border-white/15 p-3 rounded-2xl text-center space-y-1 backdrop-blur-xs">
                      <div className="w-7 h-7 mx-auto rounded-xl bg-orange-400/20 text-orange-300 flex items-center justify-center">
                        <Trophy className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] text-gray-300 font-bold block">نقاط الخبرة</span>
                      <span className="text-base sm:text-lg font-black text-amber-300 block">
                        {progress.xp} <span className="text-xs font-normal text-gray-300">XP</span>
                      </span>
                    </div>

                  </div>

                  {/* Secondary stats row */}
                  <div className="bg-black/20 border border-white/10 p-2.5 rounded-xl flex items-center justify-around text-center text-xs">
                    <div>
                      <span className="text-[10px] text-gray-300 block">المواظبة المستمرة</span>
                      <span className="font-black text-amber-400 flex items-center justify-center gap-1">
                        <Flame className="w-3.5 h-3.5 fill-current" />
                        {progress.streak} أيام 🔥
                      </span>
                    </div>
                    <div className="w-px h-6 bg-white/15" />
                    <div>
                      <span className="text-[10px] text-gray-300 block">دقة حل التمارين</span>
                      <span className="font-black text-emerald-400">
                        {averageAccuracy}% ✅
                      </span>
                    </div>
                    <div className="w-px h-6 bg-white/15" />
                    <div>
                      <span className="text-[10px] text-gray-300 block">XP هذا الأسبوع</span>
                      <span className="font-black text-amber-300">
                        +{weeklyXP} XP ⚡
                      </span>
                    </div>
                  </div>

                  {/* Encouragement Footer */}
                  <div className="pt-2 flex items-center justify-between text-[11px] text-gray-300 border-t border-white/10">
                    <span className="flex items-center gap-1 font-bold text-amber-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      نحو العلامة الكاملة 20/20 في البكالوريا
                    </span>
                    <span className="text-[10px] opacity-70">
                      {fmtDateLatn(new Date())}
                    </span>
                  </div>

                </div>
              </div>
            </div>

          </div>

          {/* Footer Action Buttons */}
          <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              onClick={handleCopyText}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{isCopied ? 'تم نسخ نص التقرير!' : 'نسخ التقرير كنص'}</span>
            </button>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                onClick={handleNativeShare}
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <Send className="w-4 h-4" />
                <span>مشاركة مباشرة</span>
              </button>

              <button
                onClick={handleDownloadImage}
                disabled={isGeneratingImage}
                className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#006d37] via-[#008040] to-[#10b981] hover:opacity-95 text-white text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-98"
              >
                <Download className="w-4 h-4" />
                <span>{isGeneratingImage ? 'جاري التوليد...' : 'تحميل كبطاقة صورة (HD)'}</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
