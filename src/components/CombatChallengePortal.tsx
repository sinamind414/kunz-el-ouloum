import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Crosshair, CheckCircle2, AlertTriangle, Timer, ShieldAlert, FileText, ChevronLeft, Zap, Share2, BrainCircuit } from 'lucide-react';

interface CombatChallengePortalProps {
  challengeId: string;
  challengeTitle: string;
  mode: 'coach' | 'sprint';
  onClose: () => void;
}

export default function CombatChallengePortal({ challengeId, challengeTitle, mode, onClose }: CombatChallengePortalProps) {
  const [phase, setPhase] = useState<1 | 2 | 3 | 4>(1);
  const [timeLeft, setTimeLeft] = useState(mode === 'sprint' ? 45 * 60 : 0); // 45 mins for sprint, count up for coach
  const [score, setScore] = useState(0);

  // Phase 1: Hotspots
  const [hotspots, setHotspots] = useState([
    { id: 'n', top: '50%', left: '50%', label: 'النواة (حفظ المعلومة الوراثية)', found: false },
    { id: 'rer', top: '65%', left: '60%', label: 'الشبكة الهيولية الفعالة (مقر دمج الأحماض الأمينية)', found: false },
    { id: 'v', top: '25%', left: '75%', label: 'حويصلات إفرازية (نقل البروتين المصنع)', found: false }
  ]);
  const allHotspotsFound = hotspots.every(h => h.found);

  // Phase 2: Analysis
  const [constat, setConstat] = useState('');
  const [interpretation, setInterpretation] = useState('');
  const [conclusion, setConclusion] = useState('');
  const [analysisErrors, setAnalysisErrors] = useState<any>({});
  const [analysisValidated, setAnalysisValidated] = useState(false);
  const [isAiChecking, setIsAiChecking] = useState(false);

  // Phase 3: Synthesis
  const [synthIntro, setSynthIntro] = useState('');
  const [synthDev, setSynthDev] = useState('');
  const [synthConcl, setSynthConcl] = useState('');

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => mode === 'sprint' ? (prev > 0 ? prev - 1 : 0) : prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [mode]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleHotspotClick = (id: string) => {
    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(60);
    }
    setHotspots(prev => prev.map(h => h.id === id ? { ...h, found: true } : h));
  };

  const validateAnalysis = () => {
    setIsAiChecking(true);
    // Simulate AI Semantic Check delay
    setTimeout(() => {
      const errors: any = {};
      
      // We simulate a semantic AI check rather than strict string matching.
      // In a real app, this would be an API call to Gemini.
      const constatText = constat.toLowerCase();
      if (!constatText.includes('إشعاع') && !constatText.includes('تمركز') && !constatText.includes('يظهر')) {
        errors.constat = "❌ المحرك الدلالي: لم تذكر الكلمات المفتاحية المتعلقة بظهور الإشعاع. الملاحظة يجب أن تصف التجربة مباشرة.";
      }
      
      const interpText = interpretation.toLowerCase();
      if (!interpText.includes('بروتين') && !interpText.includes('تركيب') && !interpText.includes('بناء')) {
        errors.interpretation = "❌ المحرك الدلالي: التفسير غير دقيق. يجب ربط الإشعاع بعملية حيوية محددة (تركيب/بناء البروتين).";
      }
      
      const conclText = conclusion.toLowerCase();
      if (!conclText.includes('الشبكة') && !conclText.includes('فعالة') && !conclText.includes('محببة')) {
        errors.conclusion = "❌ المحرك الدلالي: الاستنتاج خاطئ. يجب تحديد المقر الدقيق بدقة متناهية (الشبكة الهيولية الفعالة).";
      }
      
      setAnalysisErrors(errors);
      setIsAiChecking(false);
      
      if (Object.keys(errors).length === 0) {
        setAnalysisValidated(true);
        setScore(prev => prev + 8); // +8 points for perfect analysis
      }
    }, 1500);
  };

  const handleFinish = () => {
    setScore(prev => prev + 12); // Points for synthesis
    setPhase(4); // Show results
  };

  const handleShare = () => {
    const text = encodeURIComponent(`أكملت تحدي "${challengeTitle}" في وضع ${mode === 'sprint' ? 'السبرينت' : 'المدرب'} وحصلت على علامة ${score}/20! 🔥 هل يمكنك تحطيم رقمي؟ جرب تطبيق معسكر البكالوريا.`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0f172a] text-white flex flex-col font-sans" dir="rtl">
      
      {/* Top Navigation - Combat Style */}
      <header className="p-4 flex justify-between items-center bg-slate-900 border-b border-slate-800 z-20">
        <div className="flex items-center gap-3">
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-800 text-slate-400 transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
          <div>
            <span className="font-black text-rose-500 flex items-center gap-2">
              {mode === 'sprint' ? <Zap className="w-5 h-5" /> : <BrainCircuit className="w-5 h-5 text-indigo-400" />}
              {mode === 'sprint' ? 'وضع السبرينت' : 'وضع المدرب'}
            </span>
            <span className="text-xs font-bold text-slate-400 block">{challengeTitle}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${mode === 'sprint' ? 'bg-slate-800 border-slate-700' : 'bg-transparent border-transparent'}`}>
            <Timer className={`w-4 h-4 ${mode === 'sprint' && timeLeft < 300 ? 'text-rose-500 animate-pulse' : 'text-slate-400'}`} />
            <span className={`font-mono font-bold text-sm tracking-wider ${mode === 'sprint' ? 'text-white' : 'text-slate-400'}`}>
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>
      </header>

      {/* Main Scrollable Content */}
      <main className="flex-1 overflow-y-auto pb-32">
        <div className="max-w-4xl mx-auto w-full p-4 md:p-8">

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between text-xs font-bold text-slate-400 mb-2 px-1">
              <span className={phase >= 1 ? 'text-indigo-400' : ''}>1. تفكيك الوثيقة</span>
              <span className={phase >= 2 ? 'text-indigo-400' : ''}>2. التحليل المنهجي</span>
              <span className={phase >= 3 ? 'text-indigo-400' : ''}>3. النص العلمي</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden relative">
              <motion.div 
                className={`h-full rounded-full relative ${mode === 'sprint' ? 'bg-gradient-to-l from-amber-500 to-rose-500' : 'bg-gradient-to-l from-indigo-500 to-emerald-500'}`}
                initial={{ width: 0 }}
                animate={{ width: `${(phase / 3) * 100}%` }}
                transition={{ duration: 0.5 }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse" />
              </motion.div>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {/* PHASE 1: L'Attaque du document */}
            {phase === 1 && (
              <motion.div
                key="phase1"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-2xl">
                  <h2 className="text-2xl font-black text-white flex items-center gap-3 mb-2">
                    <Crosshair className="w-6 h-6 text-rose-500" />
                    المرحلة 1: تفكيك الوثيقة (Scan)
                  </h2>
                  <p className="text-slate-300 font-medium leading-relaxed">
                    قبل قراءة السؤال، يجب أن نفهم الوثيقة. انقر على <strong className="text-indigo-400">3 مناطق أساسية</strong> في هذه الخلية البنكرياسية لاستخراج المعطيات المخفية.
                    {mode === 'coach' && <span className="block mt-2 text-indigo-400 text-sm">💡 تلميح: ابحث عن النواة، الشبكة المحببة، والحويصلات الإفرازية.</span>}
                  </p>
                </div>

                <div className="relative rounded-2xl overflow-hidden border-2 border-slate-700 bg-slate-900 aspect-video md:aspect-[21/9] shadow-2xl">
                  <img 
                    src="/assets/images/decor/unit_intro_cell.svg" 
                    alt="Cellule" 
                    className="w-full h-full object-cover opacity-60"
                  />
                  
                  {/* Interactive Hotspots */}
                  {hotspots.map(spot => (
                    <div 
                      key={spot.id}
                      className="absolute"
                      style={{ top: spot.top, left: spot.left, transform: 'translate(-50%, -50%)' }}
                    >
                      <button
                        onClick={() => handleHotspotClick(spot.id)}
                        className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer ${spot.found ? 'bg-emerald-500 text-white scale-110' : 'bg-rose-500/80 animate-pulse hover:bg-rose-500'}`}
                      >
                        {spot.found ? <CheckCircle2 className="w-6 h-6" /> : <Crosshair className="w-6 h-6 text-white" />}
                      </button>
                      
                      {/* Ripple effect */}
                      {!spot.found && (
                        <div className="absolute inset-0 bg-rose-500 rounded-full animate-ping opacity-50" />
                      )}

                      {/* Tooltip when found */}
                      <AnimatePresence>
                        {spot.found && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="absolute top-12 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-800 text-white text-sm font-bold py-2 px-4 rounded-xl border border-emerald-500/30 shadow-xl z-20"
                          >
                            {spot.label}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>

                {allHotspotsFound && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex justify-center pt-4"
                  >
                    <button 
                      onClick={() => setPhase(2)}
                      className="bg-rose-600 hover:bg-rose-500 text-white px-8 py-3 rounded-xl font-black flex items-center gap-2 transition-all shadow-lg shadow-rose-900/50 cursor-pointer"
                    >
                      <span>ممتاز! انتقل لمرحلة التحليل</span>
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* PHASE 2: L'Analyse Structurée */}
            {phase === 2 && (
              <motion.div
                key="phase2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-2xl">
                  <h2 className="text-2xl font-black text-white flex items-center gap-3 mb-2">
                    <Zap className="w-6 h-6 text-amber-400" />
                    المرحلة 2: التحليل المنهجي (Le Moteur de Déduction)
                  </h2>
                  <p className="text-slate-300 font-medium text-sm leading-relaxed">
                    السؤال في البكالوريا: "حلل الوثيقة لاستخراج مقر تركيب البروتين".
                    <br/>لا تكتب فقرة عشوائية! المنهجية تفرض عليك 3 كتل أساسية. سيقوم المحرك الدلالي بفحص إجابتك.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Bloc 1 */}
                  <div className="bg-slate-800 rounded-xl p-1 relative overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500 transition-all">
                    <div className="absolute top-0 right-0 bottom-0 w-1.5 bg-blue-500" />
                    <div className="p-4 pl-4 pr-6">
                      <label className="block text-sm font-bold text-blue-400 mb-2">الكتلة 1: الملاحظة (Constat)</label>
                      <textarea 
                        value={constat}
                        onChange={(e) => setConstat(e.target.value)}
                        placeholder="من خلال الوثيقة ألاحظ أن..."
                        className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-3 text-white placeholder-slate-500 focus:outline-none min-h-[80px]"
                        disabled={analysisValidated || isAiChecking}
                      />
                      {analysisErrors.constat && <p className="text-rose-400 text-xs font-bold mt-2 flex items-start gap-1.5"><AlertTriangle className="w-4 h-4 shrink-0"/> <span>{analysisErrors.constat}</span></p>}
                    </div>
                  </div>

                  {/* Bloc 2 */}
                  <div className="bg-slate-800 rounded-xl p-1 relative overflow-hidden focus-within:ring-2 focus-within:ring-amber-500 transition-all">
                    <div className="absolute top-0 right-0 bottom-0 w-1.5 bg-amber-500" />
                    <div className="p-4 pl-4 pr-6">
                      <label className="block text-sm font-bold text-amber-400 mb-2">الكتلة 2: التفسير (Interprétation)</label>
                      <textarea 
                        value={interpretation}
                        onChange={(e) => setInterpretation(e.target.value)}
                        placeholder="وهذا يدل على / يفسر بـ..."
                        className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-3 text-white placeholder-slate-500 focus:outline-none min-h-[80px]"
                        disabled={analysisValidated || isAiChecking}
                      />
                      {analysisErrors.interpretation && <p className="text-rose-400 text-xs font-bold mt-2 flex items-start gap-1.5"><AlertTriangle className="w-4 h-4 shrink-0"/> <span>{analysisErrors.interpretation}</span></p>}
                    </div>
                  </div>

                  {/* Bloc 3 */}
                  <div className="bg-slate-800 rounded-xl p-1 relative overflow-hidden focus-within:ring-2 focus-within:ring-emerald-500 transition-all">
                    <div className="absolute top-0 right-0 bottom-0 w-1.5 bg-emerald-500" />
                    <div className="p-4 pl-4 pr-6">
                      <label className="block text-sm font-bold text-emerald-400 mb-2">الكتلة 3: الاستنتاج (Conclusion)</label>
                      <textarea 
                        value={conclusion}
                        onChange={(e) => setConclusion(e.target.value)}
                        placeholder="ومنه أستنتج أن..."
                        className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-3 text-white placeholder-slate-500 focus:outline-none min-h-[80px]"
                        disabled={analysisValidated || isAiChecking}
                      />
                      {analysisErrors.conclusion && <p className="text-rose-400 text-xs font-bold mt-2 flex items-start gap-1.5"><AlertTriangle className="w-4 h-4 shrink-0"/> <span>{analysisErrors.conclusion}</span></p>}
                    </div>
                  </div>
                </div>

                <div className="flex justify-center pt-4 gap-4">
                  {!analysisValidated ? (
                    <button 
                      onClick={validateAnalysis}
                      disabled={isAiChecking || !constat || !interpretation || !conclusion}
                      className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl font-black flex items-center gap-2 transition-all shadow-lg shadow-indigo-900/50 cursor-pointer"
                    >
                      {isAiChecking ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>جاري التحليل الدلالي (IA)...</span>
                        </>
                      ) : (
                        <>
                          <ShieldAlert className="w-5 h-5" />
                          <span>افحص إجابتي بالمحرك الذكي</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <motion.button 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      onClick={() => setPhase(3)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-xl font-black flex items-center gap-2 transition-all shadow-lg shadow-emerald-900/50 cursor-pointer"
                    >
                      <span>تحليل دقيق! انتقل للتركيب</span>
                      <ChevronLeft className="w-5 h-5" />
                    </motion.button>
                  )}
                </div>
              </motion.div>
            )}

            {/* PHASE 3: La Rédaction du Texte Scientifique */}
            {phase === 3 && (
              <motion.div
                key="phase3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-2xl">
                  <h2 className="text-2xl font-black text-white flex items-center gap-3 mb-2">
                    <FileText className="w-6 h-6 text-emerald-400" />
                    المرحلة 3: بناء النص العلمي (Le Montage)
                  </h2>
                  <p className="text-slate-300 font-medium text-sm leading-relaxed">
                    لا تترك صفحة بيضاء! النص العلمي الناجح هو بناء هيكلي متسلسل. املأ هذه "الصناديق" لتركيب نصك النهائي حول آلية تركيب البروتين.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Intro */}
                  <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                    <label className="block text-sm font-bold text-slate-300 mb-2">1. المقدمة (طرح المشكل العلمي)</label>
                    <textarea 
                      value={synthIntro}
                      onChange={(e) => setSynthIntro(e.target.value)}
                      placeholder="تتميز الخلايا الحية بقدرتها على تركيب البروتينات... فما هو المقر الدقيق لذلك؟"
                      className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:border-indigo-500 focus:outline-none min-h-[60px]"
                    />
                  </div>

                  {/* Dev */}
                  <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                    <label className="block text-sm font-bold text-slate-300 mb-2">2. العرض (الآلية والخطوات)</label>
                    <textarea 
                      value={synthDev}
                      onChange={(e) => setSynthDev(e.target.value)}
                      placeholder="يتم تركيب البروتين على مستوى... حيث تتدخل عناصر هي..."
                      className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:border-indigo-500 focus:outline-none min-h-[100px]"
                    />
                  </div>

                  {/* Conclusion */}
                  <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                    <label className="block text-sm font-bold text-slate-300 mb-2">3. الخاتمة (الحل النهائي والمختصر)</label>
                    <textarea 
                      value={synthConcl}
                      onChange={(e) => setSynthConcl(e.target.value)}
                      placeholder="وعليه، فإن الشبكة الهيولية الفعالة هي المقر الأساسي لـ..."
                      className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:border-indigo-500 focus:outline-none min-h-[60px]"
                    />
                  </div>
                </div>

                <div className="flex justify-center pt-4">
                  <button 
                    onClick={handleFinish}
                    disabled={!synthIntro || !synthDev || !synthConcl}
                    className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-4 rounded-xl font-black text-lg flex items-center gap-2 transition-all shadow-lg shadow-emerald-900/50 cursor-pointer"
                  >
                    <CheckCircle2 className="w-6 h-6" />
                    <span>إنهاء التحدي واعتماد الإجابة</span>
                  </button>
                </div>
              </motion.div>
            )}

            {/* PHASE 4: Results */}
            {phase === 4 && (
              <motion.div
                key="phase4"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center space-y-8 py-12"
              >
                <div className="relative">
                  <div className="w-32 h-32 bg-indigo-500/20 rounded-full animate-pulse absolute inset-0" />
                  <div className="w-32 h-32 bg-slate-800 rounded-full border-4 border-indigo-500 flex items-center justify-center relative z-10">
                    <span className="text-4xl font-black text-white">{score}/20</span>
                  </div>
                </div>

                <div className="text-center space-y-2">
                  <h2 className="text-3xl font-black text-white">وحش المنهجية! 🧬</h2>
                  <p className="text-slate-400 font-medium max-w-md mx-auto">
                    لقد أثبت قدرتك على تفكيك الوثيقة، صياغة تحليل منهجي عبر المحرك الدلالي، وبناء نص علمي مهيكل. أنت جاهز للبكالوريا.
                  </p>
                </div>

                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-lg">
                  <h3 className="font-bold text-white mb-4 border-b border-slate-700 pb-2 flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-indigo-400" />
                    التشخيص النهائي (Diagnostic IA)
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3 text-emerald-400 text-sm font-bold">
                      <CheckCircle2 className="w-5 h-5" /> استخراج المعطيات البصرية (100%)
                    </li>
                    <li className="flex items-center gap-3 text-emerald-400 text-sm font-bold">
                      <CheckCircle2 className="w-5 h-5" /> التحليل الدلالي (ملاحظة-تفسير-استنتاج)
                    </li>
                    <li className="flex items-center gap-3 text-indigo-400 text-sm font-bold">
                      <FileText className="w-5 h-5" /> هيكلة النص العلمي (تحت التقييم)
                    </li>
                  </ul>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <button 
                    onClick={handleShare}
                    className="bg-[#25D366] hover:bg-[#20bd5a] text-white px-8 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#25D366]/20 cursor-pointer"
                  >
                    <Share2 className="w-5 h-5" />
                    تحدَّ أصدقاءك (WhatsApp)
                  </button>

                  <button 
                    onClick={onClose}
                    className="bg-slate-700 hover:bg-slate-600 text-white px-8 py-3 rounded-xl font-bold transition-all cursor-pointer"
                  >
                    العودة لمعسكر التدريب
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>

        </div>
      </main>
    </div>
  );
}
