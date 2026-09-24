import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ZoomIn, Target, ChevronLeft, Info, Search, CheckCircle2 } from 'lucide-react';

interface UnitIntroPortalProps {
  unitId: number;
  unitTitle: string;
  onStartLesson: () => void;
  onClose: () => void;
}

const termsDefinitions = {
  'ADN': 'الحمض النووي الريبي منقوص الأكسجين: دعامة المعلومة الوراثية التي تحمل سر صفات الكائن الحي.',
  'ARN': 'الحمض النووي الريبي: جزيء وسيط ينقل النُسخة الوراثية من النواة إلى الهيولى لتركيب البروتين.',
  'Fibroïne': 'بروتين الفيبروين: المكون الأساسي لحرير العنكبوت، يتميز بصلابة تفوق الفولاذ ومرونة مذهلة.',
  'AcidesAminesRadioactifs': 'أحماض أمينية مشعة (موسومة): نظائر مشعة تستعمل لتتبع مسار ومقر دمج هذه الأحماض أثناء تركيب البروتين.',
  'Autoradiographie': 'التصوير الإشعاعي الذاتي: تقنية تسمح بالكشف عن مواقع وجود الإشعاع في الخلية باستخدام مستحلب حساس للضوء.',
  'RER': 'الشبكة الهيولية الداخلية المحببة (الفعالة): عضية خلوية تتواجد في الهيولى، وتتميز بوجود ريبوزومات على سطحها، وهي المقر الأساسي لتركيب البروتين.',
  'Nucleotide': 'النيوكليوتيدة الريبية: الوحدة البنائية الأساسية لجزيء الـ ARN.',
  'Ribose': 'سكر ريبوز (C5H10O5): سكر خماسي الكربون، المكون الأساسي لنيوكليوتيدات الـ ARN.',
  'AcidePhosphorique': 'حمض الفوسفوريك (H3PO4): مجموعة فوسفات تربط بين نيوكليوتيدتين متتاليتين بروابط إستر فوسفاتية.',
  'BaseAzotee': 'القاعدة الآزوتية: جزيء عضوي حلقي، تتواجد 4 أنواع في الـ ARN (A, C, G, U).',
  'Uracile': 'اليوراسيل (U): قاعدة آزوتية بييريميدية مميزة وخاصة بالـ ARN، تحل محل الثايمين (T).'
};

const InteractiveTerm = ({ text, termKey, color }: { text: string, termKey: keyof typeof termsDefinitions, color: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <span className="relative inline-block mx-1">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`font-black ${color} cursor-pointer hover:opacity-80 transition-all bg-white dark:bg-black/20 shadow-sm border border-gray-200 dark:border-gray-700 px-2.5 py-0.5 rounded-lg transform hover:scale-105 active:scale-95 flex items-center gap-1.5 inline-flex align-middle`}
      >
        <span>{text}</span>
        <span className="text-[10px] uppercase tracking-wider bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded-md text-gray-500">{termKey}</span>
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-3 w-64 bg-white dark:bg-[#1a201c] p-4 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl shrink-0">
                  <Info className="w-5 h-5 text-blue-500" />
                </div>
                <div className="flex-1">
                  <h4 className="text-xs font-black text-gray-400 mb-1 uppercase tracking-wider">{termKey}</h4>
                  <p className="text-sm font-bold text-gray-800 dark:text-gray-200 text-right leading-relaxed">
                    {termsDefinitions[termKey]}
                  </p>
                </div>
              </div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white dark:bg-[#1a201c] border-b border-r border-gray-200 dark:border-gray-800 rotate-45" />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </span>
  );
};

const LESSON_PAGES = [
  {
    id: 'intro',
    title: 'سر خيوط العنكبوت',
    subtitle: 'الوضعية الانطلاقية',
    image: '/assets/images/decor/unit_intro_spider_silk.svg',
    zoomImage: '/assets/images/decor/unit_intro_spider_silk.svg',
    content: () => (
      <>
        <p className="text-gray-700 dark:text-gray-300 font-medium leading-loose text-lg md:text-xl">
          تنسج العناكب شبكات قوية ومرنة لاصطياد فرائسها. هذه الخيوط مصنوعة أساساً من
          <InteractiveTerm text="بروتين ليفي" termKey="Fibroïne" color="text-amber-600 dark:text-amber-400" />
          قوي جداً.
        </p>
        <p className="text-gray-700 dark:text-gray-300 font-medium leading-loose text-lg md:text-xl mt-4">
          لكي تقوم خلايا العنكبوت بتصنيع هذا البروتين بدقة، فهي تعتمد على المعلومات الوراثية المشفرة والمحفوظة في
          <InteractiveTerm text="مورثاتها" termKey="ADN" color="text-blue-600 dark:text-blue-400" />
          الموجودة في النواة. ولأن هذه المعلومات لا تغادر النواة، فإن الخلية تستعين بجزيء وسيط هو
          <InteractiveTerm text="الرسول الوراثي" termKey="ARN" color="text-emerald-600 dark:text-emerald-400" />
          لنقل الوصفة الدقيقة إلى الهيولى حيث يتم التصنيع الفعلي للبروتين.
        </p>
      </>
    ),
    actionText: 'كيف يتم ذلك؟ (اكتشف النشاط الأول)',
    progress: 15,
    objective: 'الوضعية الانطلاقية: فهم العلاقة بين المورثة والبروتين'
  },
  {
    id: 'activity1',
    title: 'مقر تركيب البروتين',
    subtitle: 'النشاط الأول',
    // Using an abstract molecular/cell image for the activity
    image: '/assets/images/decor/unit_intro_cell.svg',
    zoomImage: '/assets/images/decor/unit_intro_cell.svg',
    content: () => (
      <>
        <p className="text-gray-700 dark:text-gray-300 font-medium leading-loose text-lg md:text-xl">
          لغرض تحديد مقر تركيب البروتين داخل الخلية، تم تحضين خلايا عنقودية للبنكرياس في وسط يحتوي على
          <InteractiveTerm text="أحماض أمينية مشعة" termKey="AcidesAminesRadioactifs" color="text-purple-600 dark:text-purple-400" />.
        </p>
        <p className="text-gray-700 dark:text-gray-300 font-medium leading-loose text-lg md:text-xl mt-4">
          بعد مضي فترة قصيرة (3 دقائق)، وعن طريق تقنية 
          <InteractiveTerm text="التصوير الإشعاعي الذاتي" termKey="Autoradiographie" color="text-rose-600 dark:text-rose-400" />
          ، تبين تمركز الإشعاع في 
          <InteractiveTerm text="الشبكة الهيولية الفعالة" termKey="RER" color="text-blue-600 dark:text-blue-400" />.
        </p>
        <div className="mt-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-xl">
          <h4 className="font-bold text-emerald-800 dark:text-emerald-400 flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-5 h-5" />
            الاستنتاج
          </h4>
          <p className="text-emerald-700 dark:text-emerald-300 font-medium text-sm md:text-base">
            يتم تركيب البروتين عند حقيقيات النوى في الهيولى، وبالتحديد على مستوى الشبكة الهيولية الفعالة.
          </p>
        </div>
      </>
    ),
    actionText: 'مما يتكون الـ ARN؟ (النشاط الثاني)',
    progress: 50,
    objective: 'النشاط الأول: تحديد مقر تركيب البروتين في الخلية'
  },
  {
    id: 'activity2',
    title: 'التركيب الكيميائي للـ ARN',
    subtitle: 'النشاط الثاني',
    // Using an abstract DNA/RNA visualization
    image: '/assets/images/decor/unit_intro_dna_rna.svg',
    zoomImage: '/assets/images/decor/unit_intro_dna_rna.svg',
    content: () => (
      <>
        <p className="text-gray-700 dark:text-gray-300 font-medium leading-loose text-lg md:text-xl">
          بينت نتائج الإماهة الجزئية لجزيء الـ ARN باستخدام إنزيمات متخصصة (RNase) أنه يتكون من سلسلة من
          <InteractiveTerm text="النيوكليوتيدات" termKey="Nucleotide" color="text-teal-600 dark:text-teal-400" />
          قليلة التعدد.
        </p>
        <p className="text-gray-700 dark:text-gray-300 font-medium leading-loose text-lg md:text-xl mt-4">
          تتكون كل نيوكليوتيدة ريبية من اتحاد ثلاثة جزيئات: 
          <InteractiveTerm text="سكر ريبوز" termKey="Ribose" color="text-amber-600 dark:text-amber-400" />
          ، ومجموعة 
          <InteractiveTerm text="حمض فوسفوريك" termKey="AcidePhosphorique" color="text-blue-600 dark:text-blue-400" />
          ، وواحدة من أربع قواعد آزوتية (A, C, G) بالإضافة إلى القاعدة المميزة للـ ARN وهي
          <InteractiveTerm text="اليوراسيل" termKey="Uracile" color="text-rose-600 dark:text-rose-400" />.
        </p>
      </>
    ),
    actionText: 'اختبر معلوماتك (بدء الاختبار)',
    progress: 85,
    objective: 'النشاط الثاني: معرفة التركيب الكيميائي لجزيء الـ ARN'
  }
];

export default function UnitIntroPortal({ unitId, unitTitle, onStartLesson, onClose }: UnitIntroPortalProps) {
  const [isImageZoomed, setIsImageZoomed] = useState(false);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  const currentPage = LESSON_PAGES[currentPageIndex];

  const handleNext = () => {
    if (currentPageIndex < LESSON_PAGES.length - 1) {
      setCurrentPageIndex(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      onStartLesson();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#fff9ed] dark:bg-[#0c0f0d] flex flex-col font-sans" dir="rtl">
      
      {/* Top Navigation */}
      <header className="p-4 flex justify-between items-center bg-white/80 dark:bg-[#141916]/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-800/50 z-20">
        <button 
          onClick={onClose}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors cursor-pointer"
        >
          <X className="w-6 h-6" />
        </button>
        <span className="font-bold text-gray-800 dark:text-gray-200 text-sm">{unitTitle}</span>
        <div className="w-10 flex justify-center text-gray-400 text-sm font-bold">
          {currentPageIndex + 1}/{LESSON_PAGES.length}
        </div>
      </header>

      {/* Main Scrollable Content */}
      <main className="flex-1 overflow-y-auto pb-32">
        <div className="max-w-2xl mx-auto w-full p-4 md:p-8 space-y-8">
          
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full text-xs font-bold mb-2">
                  <Target className="w-3.5 h-3.5" />
                  <span>{currentPage.subtitle}</span>
                </div>
                <h1 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white leading-tight">
                  {currentPage.title}
                </h1>
              </div>

              {/* Zoomable Image Container */}
              <div 
                className="relative rounded-3xl overflow-hidden shadow-2xl cursor-zoom-in group"
                onClick={() => setIsImageZoomed(true)}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                <img 
                  src={currentPage.image} 
                  alt={currentPage.title} 
                  className="w-full h-64 md:h-80 object-cover transform transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute bottom-4 right-4 z-20 flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full text-white text-xs font-bold border border-white/30">
                  <ZoomIn className="w-4 h-4" />
                  <span>اضغط للتكبير (Zoom)</span>
                </div>
              </div>

              {/* Interactive Text */}
              <div className="prose prose-lg dark:prose-invert max-w-none">
                {currentPage.content()}
              </div>

              {/* Interactive Button */}
              <div className="flex flex-col items-center pt-8 border-t border-gray-200 dark:border-gray-800">
                <button 
                  onClick={handleNext}
                  className="group relative w-full md:w-auto px-8 py-4 bg-gradient-to-l from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white rounded-2xl font-black text-xl shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all flex items-center justify-center gap-3 overflow-hidden cursor-pointer"
                >
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out" />
                  {currentPageIndex === LESSON_PAGES.length - 1 ? (
                    <Search className="w-6 h-6 animate-pulse" />
                  ) : (
                    <ChevronLeft className="w-6 h-6 transition-transform group-hover:-translate-x-2" />
                  )}
                  <span className="relative z-10">{currentPage.actionText}</span>
                  {currentPageIndex === LESSON_PAGES.length - 1 ? (
                    <ChevronLeft className="w-6 h-6 transition-transform group-hover:-translate-x-2" />
                  ) : null}
                </button>
              </div>
            </motion.div>
          </AnimatePresence>

        </div>
      </main>

      {/* Progress Bar (Bottom) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-[#141916]/90 backdrop-blur-xl border-t border-gray-200/50 dark:border-gray-800/50 p-4 md:p-6 z-30">
        <div className="max-w-2xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mb-2">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
              التقدم: {currentPage.progress}% - الهدف: {currentPage.objective}
            </span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hidden md:block">
              {unitTitle}
            </span>
          </div>
          <div className="w-full h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden border border-gray-200 dark:border-gray-700">
            <motion.div 
              className="h-full bg-emerald-500 rounded-full relative overflow-hidden"
              initial={{ width: 0 }}
              animate={{ width: `${currentPage.progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse" />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Fullscreen Image Zoom Modal */}
      <AnimatePresence>
        {isImageZoomed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center cursor-zoom-out p-4"
            onClick={() => setIsImageZoomed(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative max-w-5xl w-full flex items-center justify-center h-full"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setIsImageZoomed(false)}
                className="absolute top-4 right-4 md:-top-12 md:right-0 p-2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors z-[110]"
              >
                <X className="w-6 h-6" />
              </button>
              {/* pinch-zoom implementation using touchAction CSS */}
              <div className="overflow-auto rounded-2xl w-full max-h-[90vh] flex justify-center items-center" style={{ touchAction: 'pinch-zoom' }}>
                <img 
                  src={currentPage.zoomImage} 
                  alt={currentPage.title} 
                  className="w-full h-auto object-contain max-h-full rounded-2xl shadow-2xl"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

