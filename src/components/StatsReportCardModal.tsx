import { motion, AnimatePresence } from 'motion/react';
import {
  Trophy,
  BookOpen,
  Clock,
  Activity,
  CheckCircle2,
  Printer,
  Download,
  X,
  FileText,
} from 'lucide-react';
import { RefObject } from 'react';
import { UserProgress, Unit } from '../types';
import { fmtDateLatn } from '../utils/latinDigits';

interface StatsReportCardModalProps {
  showReportModal: boolean;
  setShowReportModal: (v: boolean) => void;
  studentName: string;
  setStudentName: (v: string) => void;
  reportRef: RefObject<HTMLDivElement | null>;
  progress: UserProgress;
  units: Unit[];
}

export default function StatsReportCardModal({
  showReportModal,
  setShowReportModal,
  studentName,
  setStudentName,
  reportRef,
  progress,
  units,
}: StatsReportCardModalProps) {
  return (
<>
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
</>
  );
}
