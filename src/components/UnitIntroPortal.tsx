import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, XCircle, Info, BookOpen, AlertCircle, ArrowLeft, ArrowRight, PlayCircle, Star, Mic, MicOff } from 'lucide-react';

export default function LessonTwoView() {
  // Progress tracking
  const [progress, setProgress] = useState(0);

  // Lesson Rating State
  const [lessonRating, setLessonRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);

  // Word 1 States
  const [w1Blank, setW1Blank] = useState<string | null>(null);
  const [w1Input, setW1Input] = useState('');
  const [w1Validated, setW1Validated] = useState(false);
  const [w1Feedback, setW1Feedback] = useState('');
  const [showW1Def, setShowW1Def] = useState(false);

  // Word 2 States
  const [w2Blank, setW2Blank] = useState<string | null>(null);
  const [w2Hotspot, setW2Hotspot] = useState<string | null>(null);
  const [w2Input, setW2Input] = useState('');
  const [w2Validated, setW2Validated] = useState(false);
  const [w2Feedback, setW2Feedback] = useState('');

  // Word 3 States
  const [w3Blank, setW3Blank] = useState<string | null>(null);
  const [w3Dna] = useState(['T', 'A', 'C', 'G', 'G', 'T', 'A']);
  const [w3Mrna, setW3Mrna] = useState(['', '', '', '', '', '', '']);
  const [w3Input, setW3Input] = useState('');
  const [w3Validated, setW3Validated] = useState(false);
  const [w3Feedback, setW3Feedback] = useState('');

  // Word 4 States
  const [w4Blank, setW4Blank] = useState<string | null>(null);
  const [w4StartClicked, setW4StartClicked] = useState(false);
  const [w4EndClicked, setW4EndClicked] = useState(false);
  const [w4Input, setW4Input] = useState('');
  const [w4Validated, setW4Validated] = useState(false);
  const [w4Feedback, setW4Feedback] = useState('');

  // Word 5 States
  const [w5Blank, setW5Blank] = useState<string | null>(null);
  const [w5Input, setW5Input] = useState('');
  const [w5Validated, setW5Validated] = useState(false);
  const [w5Feedback, setW5Feedback] = useState('');

  // Calculate Progress
  useEffect(() => {
    let completed = 0;
    if (w1Validated) completed += 20;
    if (w2Validated) completed += 20;
    if (w3Validated) completed += 20;
    if (w4Validated) completed += 20;
    if (w5Validated) completed += 20;
    setProgress(completed);
  }, [w1Validated, w2Validated, w3Validated, w4Validated, w5Validated]);

  // Recording State
  const [isRecording, setIsRecording] = useState<string | null>(null);

  const toggleRecording = (inputId: string, setter: (val: string) => void) => {
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("المتصفح الخاص بك لا يدعم ميزة التعرف على الصوت. يرجى استخدام متصفح كروم أو إيدج.");
      return;
    }

    if (isRecording === inputId) {
      setIsRecording(null);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'ar-DZ';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsRecording(inputId);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      // Append or replace? Let's replace for simplicity
      setter(transcript);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsRecording(null);
    };

    recognition.onend = () => {
      setIsRecording(null);
    };

    try {
      recognition.start();
    } catch (e) {
      console.error(e);
      setIsRecording(null);
    }
  };

  // Validation Handlers
  const validateW1 = () => {
    if (w1Blank !== 'السلسلة الناسخة') {
      setW1Feedback('خطأ في الكلمة المفقودة.');
      return;
    }
    const ans = w1Input.trim();
    if ((ans.includes('نسخ') || ans.includes('قالب')) && (ans.includes('ARNm') || ans.includes('تكامل'))) {
      setW1Validated(true);
      setW1Feedback('أحسنت! إجابة صحيحة.');
    } else {
      setW1Feedback('راجع الوثيقة 1 ص16: السلسلة الناسخة هي التي يُصنع منها ARNm بالتكامل');
    }
  };

  const validateW2 = () => {
    if (w2Blank !== 'ARN بوليميراز' || w2Hotspot !== 'center') {
      setW2Feedback('تأكد من ملء الفراغ واختيار الإنزيم الصحيح من المنحنى.');
      return;
    }
    const ans = w2Input.trim();
    if ((ans.includes('توقف') && ans.includes('استنساخ')) || ans.includes('لا يتشكل ARNm') || ans.includes('تثبيط')) {
      setW2Validated(true);
      setW2Feedback('أحسنت! إجابة دقيقة.');
    } else {
      setW2Feedback('الوثيقة 3 ص17: هذا الإنزيم هو المسؤول، مثبطه يوقف العملية (الاستنساخ).');
    }
  };

  const handleW3MrnaClick = (index: number, base: string) => {
    const newMrna = [...w3Mrna];
    newMrna[index] = base;
    setW3Mrna(newMrna);
  };

  const validateW3 = () => {
    if (w3Blank !== 'مبدأ التكامل') {
      setW3Feedback('الكلمة المفقودة خاطئة.');
      return;
    }
    const expectedMrna = ['A', 'U', 'G', 'C', 'C', 'A', 'U'];
    if (w3Mrna.join('') !== expectedMrna.join('')) {
      setW3Feedback('الجدول غير صحيح. تذكر أن T تقابلها A، و A تقابلها U في الـ ARN.');
      return;
    }
    if (w3Input.trim().toUpperCase() === 'AUG') {
      setW3Validated(true);
      setW3Feedback('أحسنت! AUG هي الرامزة الموافقة.');
    } else {
      setW3Feedback('تذكر مبدأ التكامل: T->A, A->U, C->G. حاول مرة أخرى مع TAC.');
    }
  };

  const validateW4 = () => {
    if (w4Blank !== 'قصيرة') {
      setW4Feedback('الكلمة المفقودة خاطئة.');
      return;
    }
    if (!w4StartClicked || !w4EndClicked) {
      setW4Feedback('الرجاء النقر على بداية ونهاية المورثة في الصورة.');
      return;
    }
    const ans = w4Input.trim();
    if (ans.includes('قصير') && ans.includes('بداية') && ans.includes('طويل') && ans.includes('نهاية')) {
      setW4Validated(true);
      setW4Feedback('ممتاز! اتجاه الاستنساخ يكون من الخيوط القصيرة إلى الطويلة.');
    } else {
      setW4Feedback('يجب أن تذكر أن الخيوط تكون "قصيرة" في "البداية" و "طويلة" في "النهاية".');
    }
  };

  const validateW5 = () => {
    if (w5Blank !== 'ARNm') {
      setW5Feedback('الكلمة المفقودة خاطئة.');
      return;
    }
    const ans = w5Input.trim();
    if (ans.includes('نواة') && ans.includes('ARNm') && (ans.includes('ناسخة') || ans.includes('قالب')) && ans.includes('تكامل')) {
      setW5Validated(true);
      setW5Feedback('ملخص رائع! لقد استوعبت مفهوم الاستنساخ بالكامل.');
    } else {
      setW5Feedback('الملخص غير مكتمل. تأكد من ذكر: النواة، ARNm، السلسلة الناسخة (أو قالب)، ومبدأ التكامل.');
    }
  };

  return (
    <div className="space-y-0 max-w-3xl mx-auto pb-32 font-sans" dir="rtl">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-[#f8f9fa] dark:bg-[#0c0f0d] pt-4 pb-4 px-2 border-b border-[#e2dabf]/60 dark:border-[#2ecc71]/20 backdrop-blur-md bg-opacity-90">
        <h2 className="text-xl font-black text-[#006d37] dark:text-[#2ecc71]">الوحدة 1: آليات تركيب البروتين</h2>
        <p className="text-sm font-bold text-[#506072] dark:text-gray-300 mt-1">الدرس 2: استنساخ المعلومة الوراثية</p>
        
        {/* Progress Bar */}
        <div className="mt-4 flex items-center gap-3">
          <div className="flex-1 h-2.5 bg-[#e2dabf]/30 dark:bg-gray-800 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-[#2ecc71] rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <span className="text-xs font-bold text-[#006d37] dark:text-[#2ecc71] w-10">{progress}%</span>
        </div>
      </div>

      <div className="px-4 py-8 space-y-16">
        
        {/* ================= MOT 1: السلسلة الناسخة ================= */}
        <section className={`transition-opacity duration-500 ${!w1Validated && progress > 0 ? 'opacity-50 pointer-events-none' : ''}`}>
          <div className="bg-white dark:bg-[#141916] rounded-3xl p-6 shadow-sm border border-[#e2dabf]/60 dark:border-white/10 space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-2 h-full bg-[#2ecc71]"></div>
            
            <h3 className="font-black text-lg text-[#1f1c0b] dark:text-gray-100 flex items-center gap-2">
              <span className="bg-[#2ecc71]/20 text-[#006d37] dark:text-[#2ecc71] w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
              الكلمة المقدسة الأولى: السلسلة الناسخة
            </h3>

            {/* Texte Troué */}
            <div className="bg-[#fff9ed] dark:bg-[#1c241f] p-5 rounded-2xl border border-[#fed65b]/30">
              <p className="text-[#1f1c0b] dark:text-gray-200 leading-relaxed font-medium">
                يتم التعبير عن المعلومة الوراثية على مرحلتين: الاستنساخ في النواة يتم انطلاقا من إحدى سلسلتي الـ ADN وتسمى 
                <span className="inline-block mx-2 min-w-[120px] text-center border-b-2 border-dashed border-[#006d37] text-[#006d37] dark:text-[#2ecc71] font-bold pb-1">
                  {w1Blank || '...........'}
                </span>.
              </p>
              
              <div className="mt-4 flex flex-wrap gap-2 justify-center">
                {['السلسلة غير الناسخة', 'السلسلة المحمولة', 'السلسلة الناسخة'].map(word => (
                  <button 
                    key={word}
                    onClick={() => setW1Blank(word)}
                    className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${w1Blank === word ? 'bg-[#006d37] text-white border-[#006d37]' : 'bg-white dark:bg-[#141916] text-[#506072] dark:text-gray-300 hover:bg-[#2ecc71]/10'}`}
                  >
                    {word}
                  </button>
                ))}
              </div>
            </div>

            {/* Interactive Term */}
            {w1Blank === 'السلسلة الناسخة' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-2">
                <button 
                  onClick={() => setShowW1Def(!showW1Def)}
                  className="flex items-center gap-2 text-[#006d37] dark:text-[#2ecc71] font-bold text-sm w-max hover:underline"
                >
                  <Info className="w-4 h-4" /> اضغط لتعريف "السلسلة الناسخة"
                </button>
                <AnimatePresence>
                  {showW1Def && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 p-4 rounded-xl text-sm leading-relaxed border border-blue-200 dark:border-blue-800/50">
                      <strong>السلسلة الناسخة (Brin transcrit 3'→5'):</strong> هي السلسلة من الـ ADN التي يقرأها إنزيم ARN بوليميراز لصنع ARNm بالتكامل. تسمى أيضاً "السلسلة القالبية".
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* Micro-Test */}
            <div className="space-y-3">
              <label className="block text-sm font-bold text-[#1f1c0b] dark:text-gray-200">سؤال الإنتاج: لماذا نسميها "ناسخة"؟ (أجب في سطر واحد)</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={w1Input}
                  onChange={(e) => setW1Input(e.target.value)}
                  placeholder="اكتب إجابتك هنا أو استخدم الميكروفون..."
                  className="w-full bg-white dark:bg-[#0c0f0d] border border-[#bbcbbb] dark:border-gray-700 rounded-xl px-4 py-3 pl-12 text-sm focus:outline-none focus:border-[#2ecc71]"
                  disabled={w1Validated}
                />
                {!w1Validated && (
                  <button
                    onClick={() => toggleRecording('w1', setW1Input)}
                    className={`absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-colors ${isRecording === 'w1' ? 'bg-red-100 dark:bg-red-900/30 text-red-500 animate-pulse' : 'text-gray-400 hover:text-[#2ecc71] hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                    title={isRecording === 'w1' ? 'إيقاف التسجيل' : 'التحدث للإجابة'}
                  >
                    {isRecording === 'w1' ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </button>
                )}
              </div>
              {!w1Validated && (
                <button onClick={validateW1} className="bg-[#2ecc71] hover:bg-[#27ae60] text-white px-6 py-2 rounded-xl font-bold text-sm transition-all shadow-sm">
                  تحقق
                </button>
              )}
              {w1Feedback && (
                <p className={`text-xs font-bold mt-2 ${w1Validated ? 'text-[#006d37] dark:text-[#2ecc71]' : 'text-red-500'}`}>{w1Feedback}</p>
              )}
            </div>

            {/* Methodology Box */}
            {w1Validated && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#f8f9fa] dark:bg-[#1c241f] border-r-4 border-[#fed65b] p-4 rounded-l-xl">
                <h4 className="font-black text-xs text-[#944a00] dark:text-[#fed65b] mb-1 flex items-center gap-1"><BookOpen className="w-3.5 h-3.5"/> الاستنتاج المنهجي (Constat)</h4>
                <p className="text-sm text-[#506072] dark:text-gray-300">من خلال الوثيقة 1 ص16، ألاحظ أن ADN مزدوج اللولب بينما ARN مفرد، وأن السلسلة الناسخة تعمل كقالب لتركيب الـ ARNm.</p>
              </motion.div>
            )}
          </div>
        </section>

        {/* ================= MOT 2: ARN بوليميراز ================= */}
        {progress >= 20 && (
        <section className={`transition-opacity duration-500 ${!w2Validated && progress > 20 ? 'opacity-50 pointer-events-none' : ''}`}>
          <div className="bg-white dark:bg-[#141916] rounded-3xl p-6 shadow-sm border border-[#e2dabf]/60 dark:border-white/10 space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-2 h-full bg-blue-500"></div>
            
            <h3 className="font-black text-lg text-[#1f1c0b] dark:text-gray-100 flex items-center gap-2">
              <span className="bg-blue-500/20 text-blue-600 dark:text-blue-400 w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
              الكلمة المقدسة الثانية: ARN بوليميراز
            </h3>

            {/* Texte Troué */}
            <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
              <p className="text-[#1f1c0b] dark:text-gray-200 leading-relaxed font-medium">
                يرتبط إنزيم 
                <span className="inline-block mx-2 min-w-[120px] text-center border-b-2 border-dashed border-blue-600 text-blue-600 font-bold pb-1">
                  {w2Blank || '...........'}
                </span> 
                بمنطقة بداية المورثة في النواة.
              </p>
              <div className="mt-4 flex flex-wrap gap-2 justify-center">
                {['الريبوزوم', 'ARN بوليميراز', 'ADN بوليميراز'].map(word => (
                  <button 
                    key={word}
                    onClick={() => setW2Blank(word)}
                    className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${w2Blank === word ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-[#141916] text-[#506072] dark:text-gray-300 hover:bg-blue-50'}`}
                  >
                    {word}
                  </button>
                ))}
              </div>
            </div>

            {/* SVG Graph Example (Watiqa 3 p17) */}
            <div className="border border-[#bbcbbb]/50 rounded-2xl p-4 bg-white relative">
              <h4 className="text-xs font-bold text-center mb-4 text-[#506072]">الوثيقة 3 ص17: تأثير مركب ألفا أمانيتين (سام)</h4>
              
              {/* Simulated Chart via SVG */}
              <svg viewBox="0 0 300 150" className="w-full h-auto max-w-sm mx-auto">
                {/* Axes */}
                <line x1="40" y1="120" x2="280" y2="120" stroke="#506072" strokeWidth="2" />
                <line x1="40" y1="120" x2="40" y2="20" stroke="#506072" strokeWidth="2" />
                <text x="160" y="145" fontSize="10" textAnchor="middle" fill="#506072">تركيز ألفا أمانيتين</text>
                <text x="20" y="70" fontSize="10" textAnchor="middle" fill="#506072" transform="rotate(-90, 20, 70)">نسبة تشكل ARNm</text>
                
                {/* Curve */}
                <path d="M 40 30 Q 150 30 250 110" fill="none" stroke="#ba1a1a" strokeWidth="3" />
                
                {/* Hotspots */}
                <g 
                  onClick={() => setW2Hotspot('left')} 
                  className="cursor-pointer hover:opacity-80"
                >
                  <circle cx="80" cy="35" r="15" fill={w2Hotspot === 'left' ? '#ff9a4a' : 'transparent'} stroke={w2Hotspot === 'left' ? '#ff9a4a' : '#506072'} strokeDasharray="3,3" />
                  <text x="80" y="38" fontSize="8" textAnchor="middle" fill="#1f1c0b">ADN بوليميراز</text>
                </g>

                <g 
                  onClick={() => setW2Hotspot('center')} 
                  className="cursor-pointer hover:opacity-80"
                >
                  <circle cx="160" cy="65" r="25" fill={w2Hotspot === 'center' ? '#2ecc71' : 'transparent'} stroke={w2Hotspot === 'center' ? '#2ecc71' : '#006d37'} strokeWidth="2" />
                  <text x="160" y="68" fontSize="10" textAnchor="middle" fill={w2Hotspot === 'center' ? 'white' : '#006d37'} fontWeight="bold">ARN بوليميراز</text>
                </g>

                <g 
                  onClick={() => setW2Hotspot('right')} 
                  className="cursor-pointer hover:opacity-80"
                >
                  <circle cx="230" cy="95" r="15" fill={w2Hotspot === 'right' ? '#ff9a4a' : 'transparent'} stroke={w2Hotspot === 'right' ? '#ff9a4a' : '#506072'} strokeDasharray="3,3" />
                  <text x="230" y="98" fontSize="8" textAnchor="middle" fill="#1f1c0b">الهيليكاز</text>
                </g>
              </svg>
              <p className="text-center text-[10px] text-gray-500 mt-2">انقر على الإنزيم المسؤول عن الاستنساخ في هذا المنحنى.</p>
            </div>

            {/* Micro-Test */}
            <div className="space-y-3">
              <label className="block text-sm font-bold text-[#1f1c0b] dark:text-gray-200">سؤال الإنتاج: ماذا يحدث إذا أضفنا مثبط نوعي لـ ARN بوليميراز؟</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={w2Input}
                  onChange={(e) => setW2Input(e.target.value)}
                  placeholder="يتوقف الـ... (يمكنك التحدث)"
                  className="w-full bg-white dark:bg-[#0c0f0d] border border-[#bbcbbb] dark:border-gray-700 rounded-xl px-4 py-3 pl-12 text-sm focus:outline-none focus:border-blue-500"
                  disabled={w2Validated}
                />
                {!w2Validated && (
                  <button
                    onClick={() => toggleRecording('w2', setW2Input)}
                    className={`absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-colors ${isRecording === 'w2' ? 'bg-red-100 dark:bg-red-900/30 text-red-500 animate-pulse' : 'text-gray-400 hover:text-blue-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                    title={isRecording === 'w2' ? 'إيقاف التسجيل' : 'التحدث للإجابة'}
                  >
                    {isRecording === 'w2' ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </button>
                )}
              </div>
              {!w2Validated && (
                <button onClick={validateW2} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-bold text-sm transition-all shadow-sm">
                  تحقق
                </button>
              )}
              {w2Feedback && (
                <p className={`text-xs font-bold mt-2 ${w2Validated ? 'text-blue-600 dark:text-blue-400' : 'text-red-500'}`}>{w2Feedback}</p>
              )}
            </div>

            {/* Methodology Box */}
            {w2Validated && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#f8f9fa] dark:bg-[#1c241f] border-r-4 border-blue-500 p-4 rounded-l-xl">
                <h4 className="font-black text-xs text-blue-800 dark:text-blue-400 mb-1 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5"/> التفسير المنهجي (Interprétation)</h4>
                <p className="text-sm text-[#506072] dark:text-gray-300">وهذا يدل على أن الإنزيم المسؤول عن عملية الاستنساخ هو ARN بوليميراز، لأن تثبيطه أدى إلى تناقص نسبة تشكل ARNm.</p>
              </motion.div>
            )}
          </div>
        </section>
        )}

        {/* ================= MOT 3: مبدأ التكامل ================= */}
        {progress >= 40 && (
        <section className={`transition-opacity duration-500 ${!w3Validated && progress > 40 ? 'opacity-50 pointer-events-none' : ''}`}>
          <div className="bg-white dark:bg-[#141916] rounded-3xl p-6 shadow-sm border border-[#e2dabf]/60 dark:border-white/10 space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-2 h-full bg-purple-500"></div>
            
            <h3 className="font-black text-lg text-[#1f1c0b] dark:text-gray-100 flex items-center gap-2">
              <span className="bg-purple-500/20 text-purple-600 dark:text-purple-400 w-8 h-8 rounded-full flex items-center justify-center text-sm">3</span>
              الكلمة المقدسة الثالثة: مبدأ التكامل
            </h3>

            {/* Texte Troué */}
            <div className="bg-purple-50 dark:bg-purple-900/20 p-5 rounded-2xl border border-purple-200 dark:border-purple-800">
              <p className="text-[#1f1c0b] dark:text-gray-200 leading-relaxed font-medium">
                يقرأ الإنزيم السلسلة الناسخة في اتجاه 3'←5' ويركب ARNm في اتجاه 5'←3' حسب 
                <span className="inline-block mx-2 min-w-[120px] text-center border-b-2 border-dashed border-purple-600 text-purple-600 font-bold pb-1">
                  {w3Blank || '...........'}
                </span>.
              </p>
              <div className="mt-4 flex flex-wrap gap-2 justify-center">
                {['مبدأ الترجمة', 'مبدأ التكامل', 'مبدأ الانتشار'].map(word => (
                  <button 
                    key={word}
                    onClick={() => setW3Blank(word)}
                    className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${w3Blank === word ? 'bg-purple-600 text-white border-purple-600' : 'bg-white dark:bg-[#141916] text-[#506072] dark:text-gray-300 hover:bg-purple-50'}`}
                  >
                    {word}
                  </button>
                ))}
              </div>
            </div>

            {/* Interactive Table (Watiqa 4 p18) */}
            <div className="border border-[#bbcbbb]/50 rounded-2xl p-5 bg-white dark:bg-[#0c0f0d] relative overflow-x-auto" dir="ltr">
              <h4 className="text-xs font-bold text-center mb-4 text-[#506072] font-arabic">أكمل سلسلة ARNm بالتكامل مع السلسلة الناسخة (اضغط على الفراغات لاختيار القاعدة)</h4>
              
              <div className="flex flex-col gap-3 min-w-[300px]">
                <div className="flex items-center gap-2">
                  <span className="w-24 text-right font-bold text-sm text-gray-500">ADN (ناسخة):</span>
                  <span className="text-xs font-mono text-gray-400">3'</span>
                  <div className="flex flex-1 gap-1">
                    {w3Dna.map((base, i) => (
                      <div key={`dna-${i}`} className="flex-1 h-10 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded flex items-center justify-center font-mono font-bold text-gray-800 dark:text-gray-200">
                        {base}
                      </div>
                    ))}
                  </div>
                  <span className="text-xs font-mono text-gray-400">5'</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="w-24 text-right font-bold text-sm text-purple-600">ARNm:</span>
                  <span className="text-xs font-mono text-purple-400">5'</span>
                  <div className="flex flex-1 gap-1">
                    {w3Mrna.map((base, i) => (
                      <div key={`mrna-${i}`} className="flex-1 h-10 bg-purple-50 dark:bg-purple-900/30 border-2 border-purple-300 border-dashed rounded flex items-center justify-center font-mono font-bold text-purple-700 dark:text-purple-300 relative group cursor-pointer">
                        {base || '?'}
                        
                        {/* Dropdown-like selector on hover/focus within */}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 bg-white shadow-xl border rounded flex gap-1 p-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto">
                          {['A', 'U', 'G', 'C'].map(b => (
                            <button key={b} onClick={() => handleW3MrnaClick(i, b)} className="w-6 h-6 hover:bg-purple-100 rounded text-xs font-bold">{b}</button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <span className="text-xs font-mono text-purple-400">3'</span>
                </div>
              </div>
            </div>

            {/* Micro-Test */}
            <div className="space-y-3">
              <label className="block text-sm font-bold text-[#1f1c0b] dark:text-gray-200">سؤال الإنتاج: إذا كانت السلسلة الناسخة TAC، ماذا تكون رامزة ARNm؟</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={w3Input}
                  onChange={(e) => setW3Input(e.target.value.toUpperCase())}
                  placeholder="أدخل الثلاثية أو انطقها (مثال: UUU)"
                  className="w-full bg-white dark:bg-[#0c0f0d] border border-[#bbcbbb] dark:border-gray-700 rounded-xl px-4 py-3 pl-12 text-sm font-mono focus:outline-none focus:border-purple-500 uppercase text-left"
                  disabled={w3Validated}
                  dir="ltr"
                />
                {!w3Validated && (
                  <button
                    onClick={() => toggleRecording('w3', setW3Input)}
                    className={`absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-colors ${isRecording === 'w3' ? 'bg-red-100 dark:bg-red-900/30 text-red-500 animate-pulse' : 'text-gray-400 hover:text-purple-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                    title={isRecording === 'w3' ? 'إيقاف التسجيل' : 'التحدث للإجابة'}
                  >
                    {isRecording === 'w3' ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </button>
                )}
              </div>
              {!w3Validated && (
                <button onClick={validateW3} className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-xl font-bold text-sm transition-all shadow-sm">
                  تحقق
                </button>
              )}
              {w3Feedback && (
                <p className={`text-xs font-bold mt-2 ${w3Validated ? 'text-purple-600 dark:text-purple-400' : 'text-red-500'}`}>{w3Feedback}</p>
              )}
            </div>

            {/* Methodology Box */}
            {w3Validated && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#f8f9fa] dark:bg-[#1c241f] border-r-4 border-purple-500 p-4 rounded-l-xl">
                <h4 className="font-black text-xs text-purple-800 dark:text-purple-400 mb-1 flex items-center gap-1"><BookOpen className="w-3.5 h-3.5"/> التحليل المنهجي (Analyse)</h4>
                <p className="text-sm text-[#506072] dark:text-gray-300">من خلال الوثيقة 4 ص18، ألاحظ أن A في ADN تقابل U في ARNm، و T تقابل A، و C تقابل G... ومنه العلاقة بين السلسلتين هي علاقة <strong>تكامل القواعد الآزوتية</strong>.</p>
              </motion.div>
            )}
          </div>
        </section>
        )}

        {/* ================= MOT 4: اتجاه الاستنساخ ================= */}
        {progress >= 60 && (
        <section className={`transition-opacity duration-500 ${!w4Validated && progress > 60 ? 'opacity-50 pointer-events-none' : ''}`}>
          <div className="bg-white dark:bg-[#141916] rounded-3xl p-6 shadow-sm border border-[#e2dabf]/60 dark:border-white/10 space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-2 h-full bg-[#ff9a4a]"></div>
            
            <h3 className="font-black text-lg text-[#1f1c0b] dark:text-gray-100 flex items-center gap-2">
              <span className="bg-[#ff9a4a]/20 text-[#d8711e] dark:text-[#ff9a4a] w-8 h-8 rounded-full flex items-center justify-center text-sm">4</span>
              الكلمة المقدسة الرابعة: اتجاه الاستنساخ
            </h3>

            {/* Texte Troué */}
            <div className="bg-orange-50 dark:bg-orange-900/20 p-5 rounded-2xl border border-orange-200 dark:border-orange-800">
              <p className="text-[#1f1c0b] dark:text-gray-200 leading-relaxed font-medium">
                يتجه الاستنساخ دائما من الجهة التي تكون فيها خيوط الـ ARNm 
                <span className="inline-block mx-2 min-w-[120px] text-center border-b-2 border-dashed border-[#ff9a4a] text-[#d8711e] font-bold pb-1">
                  {w4Blank || '...........'}
                </span>.
              </p>
              <div className="mt-4 flex flex-wrap gap-2 justify-center">
                {['متساوية', 'طويلة', 'قصيرة'].map(word => (
                  <button 
                    key={word}
                    onClick={() => setW4Blank(word)}
                    className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${w4Blank === word ? 'bg-[#ff9a4a] text-white border-[#ff9a4a]' : 'bg-white dark:bg-[#141916] text-[#506072] dark:text-gray-300 hover:bg-orange-50'}`}
                  >
                    {word}
                  </button>
                ))}
              </div>
            </div>

            {/* SVG Christmas Tree EM Image */}
            <div className="border border-[#bbcbbb]/50 rounded-2xl p-4 bg-black relative overflow-hidden flex flex-col items-center">
              <h4 className="text-xs font-bold text-center mb-4 text-gray-400 font-arabic z-10">صورة مجهرية (محاكاة): انقر على بداية المورثة (رقم 1) ثم نهايتها (رقم 2)</h4>
              
              <svg viewBox="0 0 400 200" className="w-full max-w-md">
                {/* Background Noise for EM effect */}
                <filter id="noise">
                  <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="3" stitchTiles="stitch"/>
                  <feColorMatrix type="matrix" values="1 0 0 0 0, 0 1 0 0 0, 0 0 1 0 0, 0 0 0 0.3 0" />
                </filter>
                <rect width="400" height="200" fill="#111" />
                <rect width="400" height="200" filter="url(#noise)" opacity="0.5"/>

                {/* Central DNA */}
                <line x1="50" y1="100" x2="350" y2="100" stroke="#fff" strokeWidth="2" opacity="0.8" />
                
                {/* mRNA strings growing from left to right */}
                {Array.from({ length: 20 }).map((_, i) => {
                  const x = 80 + i * 13;
                  const length = 5 + i * 3.5;
                  return (
                    <g key={i}>
                      <line x1={x} y1="100" x2={x} y2={100 - length} stroke="#ccc" strokeWidth="1" opacity="0.7" />
                      <circle cx={x} cy={100} r="1.5" fill="#fff" /> {/* Polymerase */}
                    </g>
                  );
                })}

                {/* Clickable Zones */}
                <g onClick={() => setW4StartClicked(true)} className="cursor-pointer group">
                  <rect x="50" y="50" width="80" height="100" fill="transparent" />
                  <circle cx="80" cy="100" r="20" fill={w4StartClicked ? '#2ecc71' : 'transparent'} stroke={w4StartClicked ? '#2ecc71' : '#fff'} strokeWidth="2" strokeDasharray={w4StartClicked ? '' : '4 4'} opacity="0.8"/>
                  <text x="80" y="140" fill={w4StartClicked ? '#2ecc71' : '#fff'} fontSize="12" textAnchor="middle" className="font-bold">بداية 1</text>
                </g>

                <g onClick={() => setW4EndClicked(true)} className="cursor-pointer group">
                  <rect x="280" y="20" width="80" height="160" fill="transparent" />
                  <circle cx="320" cy="100" r="30" fill={w4EndClicked ? '#2ecc71' : 'transparent'} stroke={w4EndClicked ? '#2ecc71' : '#fff'} strokeWidth="2" strokeDasharray={w4EndClicked ? '' : '4 4'} opacity="0.8"/>
                  <text x="320" y="150" fill={w4EndClicked ? '#2ecc71' : '#fff'} fontSize="12" textAnchor="middle" className="font-bold">نهاية 2</text>
                </g>
              </svg>
            </div>

            {/* Micro-Test */}
            <div className="space-y-3">
              <label className="block text-sm font-bold text-[#1f1c0b] dark:text-gray-200">سؤال الإنتاج: كيف نحدد اتجاه الاستنساخ من الصورة؟</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={w4Input}
                  onChange={(e) => setW4Input(e.target.value)}
                  placeholder="من الخيوط الـ... (يمكنك التحدث)"
                  className="w-full bg-white dark:bg-[#0c0f0d] border border-[#bbcbbb] dark:border-gray-700 rounded-xl px-4 py-3 pl-12 text-sm focus:outline-none focus:border-[#ff9a4a]"
                  disabled={w4Validated}
                />
                {!w4Validated && (
                  <button
                    onClick={() => toggleRecording('w4', setW4Input)}
                    className={`absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-colors ${isRecording === 'w4' ? 'bg-red-100 dark:bg-red-900/30 text-red-500 animate-pulse' : 'text-gray-400 hover:text-[#ff9a4a] hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                    title={isRecording === 'w4' ? 'إيقاف التسجيل' : 'التحدث للإجابة'}
                  >
                    {isRecording === 'w4' ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </button>
                )}
              </div>
              {!w4Validated && (
                <button onClick={validateW4} className="bg-[#ff9a4a] hover:bg-[#e68a42] text-white px-6 py-2 rounded-xl font-bold text-sm transition-all shadow-sm">
                  تحقق
                </button>
              )}
              {w4Feedback && (
                <p className={`text-xs font-bold mt-2 ${w4Validated ? 'text-[#d8711e] dark:text-[#ff9a4a]' : 'text-red-500'}`}>{w4Feedback}</p>
              )}
            </div>

            {/* Methodology Box */}
            {w4Validated && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#f8f9fa] dark:bg-[#1c241f] border-r-4 border-[#ff9a4a] p-4 rounded-l-xl">
                <h4 className="font-black text-xs text-[#d8711e] dark:text-[#ff9a4a] mb-1 flex items-center gap-1"><BookOpen className="w-3.5 h-3.5"/> الاستنتاج المنهجي (Constat)</h4>
                <p className="text-sm text-[#506072] dark:text-gray-300">ألاحظ أن طول خيوط ARNm يزداد كلما اتجهنا نحو نهاية المورثة، مما يحدد اتجاه النسخ من البداية (خيوط قصيرة) إلى النهاية (خيوط طويلة).</p>
              </motion.div>
            )}
          </div>
        </section>
        )}

        {/* ================= MOT 5: ARNm & Final Synthesis ================= */}
        {progress >= 80 && (
        <section className={`transition-opacity duration-500`}>
          <div className="bg-white dark:bg-[#141916] rounded-3xl p-6 shadow-sm border border-[#e2dabf]/60 dark:border-white/10 space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-2 h-full bg-teal-500"></div>
            
            <h3 className="font-black text-lg text-[#1f1c0b] dark:text-gray-100 flex items-center gap-2">
              <span className="bg-teal-500/20 text-teal-600 dark:text-teal-400 w-8 h-8 rounded-full flex items-center justify-center text-sm">5</span>
              الكلمة المقدسة الخامسة: ARNm والتركيب النهائي
            </h3>

            {/* Texte Troué */}
            <div className="bg-teal-50 dark:bg-teal-900/20 p-5 rounded-2xl border border-teal-200 dark:border-teal-800">
              <p className="text-[#1f1c0b] dark:text-gray-200 leading-relaxed font-medium">
                عند وصول الإنزيم إلى نهاية المورثة، ينفصل وتتحرر جزيئة 
                <span className="inline-block mx-2 min-w-[120px] text-center border-b-2 border-dashed border-teal-600 text-teal-600 font-bold pb-1">
                  {w5Blank || '...........'}
                </span> 
                لتنتقل نحو الهيولى.
              </p>
              <div className="mt-4 flex flex-wrap gap-2 justify-center">
                {['ADN', 'ARNm', 'ARNt'].map(word => (
                  <button 
                    key={word}
                    onClick={() => setW5Blank(word)}
                    className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${w5Blank === word ? 'bg-teal-600 text-white border-teal-600' : 'bg-white dark:bg-[#141916] text-[#506072] dark:text-gray-300 hover:bg-teal-50'}`}
                  >
                    {word}
                  </button>
                ))}
              </div>
            </div>

            {/* Final Synthesis Textarea */}
            <div className="space-y-3">
              <label className="block text-sm font-bold text-[#1f1c0b] dark:text-gray-200">الخلاصة: لخص في جملتين: أين يحدث الاستنساخ؟ وما هو ناتجه؟ (استعمل الكلمات المقدسة)</label>
              <div className="relative">
                <textarea 
                  value={w5Input}
                  onChange={(e) => setW5Input(e.target.value)}
                  placeholder="تحدث عملية الاستنساخ في... (اكتب أو استخدم الميكروفون)"
                  rows={3}
                  className="w-full bg-white dark:bg-[#0c0f0d] border border-[#bbcbbb] dark:border-gray-700 rounded-xl px-4 py-3 pl-12 text-sm focus:outline-none focus:border-teal-500"
                  disabled={w5Validated}
                />
                {!w5Validated && (
                  <button
                    onClick={() => toggleRecording('w5', (val) => setW5Input(prev => prev ? prev + ' ' + val : val))}
                    className={`absolute left-2 top-4 p-2 rounded-lg transition-colors ${isRecording === 'w5' ? 'bg-red-100 dark:bg-red-900/30 text-red-500 animate-pulse' : 'text-gray-400 hover:text-teal-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                    title={isRecording === 'w5' ? 'إيقاف التسجيل' : 'التحدث للإجابة'}
                  >
                    {isRecording === 'w5' ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </button>
                )}
              </div>
              {!w5Validated && (
                <button onClick={validateW5} className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-xl font-bold text-sm transition-all shadow-sm flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4"/> إنهاء الدرس وتأكيد الفهم
                </button>
              )}
              {w5Feedback && (
                <p className={`text-xs font-bold mt-2 ${w5Validated ? 'text-teal-700 dark:text-teal-400' : 'text-red-500'}`}>{w5Feedback}</p>
              )}
            </div>

            {/* Final Scientific Text Assembly */}
            {w5Validated && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 space-y-4">
                <h4 className="font-black text-[#1f1c0b] dark:text-white border-b pb-2">النص العلمي الشامل (Méthodologie finale)</h4>
                
                <div className="space-y-3 text-sm">
                  <div className="bg-[#f8f9fa] dark:bg-[#1c241f] p-4 rounded-xl border-r-4 border-gray-400">
                    <strong className="text-gray-600 dark:text-gray-400 block mb-1">مقدمة:</strong>
                    تتميز الخلايا حقيقية النواة بوجود ADN في النواة بينما تركيب البروتين في الهيولى، فما هي الآلية التي تسمح بانتقال المعلومة؟
                  </div>
                  <div className="bg-[#fff9ed] dark:bg-[#1c241f] p-4 rounded-xl border-r-4 border-[#fed65b]">
                    <strong className="text-[#944a00] dark:text-[#fed65b] block mb-1">عرض:</strong>
                    يتم الاستنساخ في النواة بواسطة <strong>ARN بوليميراز</strong> الذي يقرأ <strong>السلسلة الناسخة</strong> في الاتجاه 3'←5' ويركب <strong>ARNm</strong> في الاتجاه 5'←3' حسب <strong>مبدأ التكامل</strong> بين القواعد الآزوتية، حيث يزداد طول الخيوط لتحديد <strong>اتجاه الاستنساخ</strong> نحو نهاية المورثة.
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border-r-4 border-green-500">
                    <strong className="text-green-700 dark:text-green-400 block mb-1">خاتمة:</strong>
                    وعليه، الاستنساخ هو نسخ المعلومة من ADN إلى ARNm الذي سينتقل للهيولى للترجمة.
                  </div>
                </div>

                {/* Rating System */}
                <div className="mt-8 pt-6 border-t border-[#bbcbbb]/30 dark:border-gray-700 flex flex-col items-center">
                  <h4 className="text-sm font-bold text-[#506072] dark:text-gray-300 mb-4">ما مدى سهولة وفهم هذا الدرس؟</h4>
                  <div className="flex gap-2 mb-2" dir="ltr">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setLessonRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="transition-transform hover:scale-110 focus:outline-none"
                      >
                        <Star
                          className={`w-8 h-8 ${
                            (hoverRating || lessonRating) >= star
                              ? 'fill-[#fed65b] text-[#fed65b]'
                              : 'text-gray-300 dark:text-gray-600'
                          } transition-colors duration-200`}
                        />
                      </button>
                    ))}
                  </div>
                  <AnimatePresence>
                    {lessonRating > 0 && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xs font-bold text-[#006d37] dark:text-[#2ecc71] mt-2"
                      >
                        شكراً لتقييمك! ({lessonRating} / 5)
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

              </motion.div>
            )}
          </div>
        </section>
        )}

      </div>
      
      {/* Footer Badge */}
      <div className="fixed bottom-0 left-0 right-0 p-2 bg-[#f8f9fa] dark:bg-[#0c0f0d] text-center border-t border-[#e2dabf]/30 text-[10px] text-gray-500 font-bold z-50">
        هذه Leçon Mot par Mot تعتمد على محاكاة SVG مدمجة - لا تحتاج إنترنت خارجي للصور 🚀
      </div>
    </div>
  );
}
