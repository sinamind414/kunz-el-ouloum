import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Rocket, ChevronLeft, ShieldCheck, Trophy, Sparkles, Volume2, VolumeX, Key, Anchor } from 'lucide-react';
import { MASCOT_URL } from '../unitCatalog';
import { startPirateMusic, stopPirateMusic } from '../utils/audio';
import ZoomableImage from './ZoomableImage';

const TermsModal = lazy(() => import('./TermsModal'));

interface SplashViewProps {
  onStart: () => void;
}

export default function SplashView({ onStart }: SplashViewProps) {
  const [showIntroSplash, setShowIntroSplash] = useState<boolean>(true);
  const [isMusicMuted, setIsMusicMuted] = useState<boolean>(false);
  const [isTermsOpen, setIsTermsOpen] = useState<boolean>(false);

  useEffect(() => {
    return () => {
      // On laisse la musique continuer jusqu'au vrai démarrage.
    };
  }, []);

  const handleOpenTreasure = () => {
    startPirateMusic(0.08);
    setShowIntroSplash(false);
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isMusicMuted) {
      startPirateMusic(0.08);
      setIsMusicMuted(false);
    } else {
      stopPirateMusic();
      setIsMusicMuted(true);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#fff9ed] text-[#1f1c0b] overflow-hidden flex flex-col justify-between font-sans selection:bg-[#fed65b]/30">
      <style>{`
        @keyframes shine {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes mascotFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .gold-calligraphy-text {
          font-family: "Amiri", "Scheherazade New", serif;
          font-weight: 900;
          background: linear-gradient(
            to right,
            #d4af37 0%,
            #fff4cc 25%,
            #f5af19 50%,
            #fff4cc 75%,
            #d4af37 100%
          );
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shine 4s linear infinite;
        }
        .text-glow {
          text-shadow: 0 0 15px rgba(254, 214, 91, 0.4), 0 0 30px rgba(184, 134, 11, 0.2);
        }
        .mascot-float {
          animation: mascotFloat 5s ease-in-out infinite;
        }
      `}</style>

      {!showIntroSplash && (
        <div className="absolute top-4 left-4 z-50">
          <button
            onClick={toggleMute}
            className="flex items-center gap-1.5 bg-[#ffffff]/80 backdrop-blur-md hover:bg-[#fff9ed] border border-[#e2dabf] px-3 py-1.5 rounded-full shadow-sm cursor-pointer text-xs font-bold text-[#006d37] transition-all"
          >
            {isMusicMuted ? (
              <>
                <VolumeX className="w-4 h-4 text-gray-400" />
                <span className="text-gray-400">مكتوم</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 text-[#006d37] animate-bounce" />
                <span className="animate-pulse">شغال الموسيقى 🏴‍☠️</span>
              </>
            )}
          </button>
        </div>
      )}

      {showIntroSplash ? (
        <div className="absolute inset-0 w-full h-full z-40 bg-gradient-to-b from-[#002713] via-[#003d1e] to-[#00140a] flex flex-col justify-between p-6 select-none">
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
            <img
              src={MASCOT_URL}
              alt="Pirate Watermark"
              className="w-full h-full object-contain opacity-25 filter brightness-50 mix-blend-overlay"
              referrerPolicy="no-referrer"
            />
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute bg-[#fed65b] rounded-full animate-pulse"
                style={{
                  width: Math.random() * 6 + 3 + 'px',
                  height: Math.random() * 6 + 3 + 'px',
                  left: Math.random() * 100 + '%',
                  top: Math.random() * 100 + '%',
                }}
              />
            ))}
          </div>

          <div className="relative z-10 text-center pt-8 flex flex-col items-center gap-1">
            <span className="text-[10px] uppercase tracking-[0.25em] font-extrabold text-[#fed65b]/80 flex items-center gap-1.5">
              <Anchor className="w-3.5 h-3.5 text-[#fed65b]" />
              <span>التحضير الأقوى لبكالوريا 2026</span>
            </span>
            <div className="h-[2px] w-12 bg-gradient-to-r from-transparent via-[#fed65b] to-transparent mt-1" />
          </div>

          <div className="relative z-10 flex-1 flex flex-col items-center justify-center space-y-6">
            <div className="text-center">
              <h1 className="gold-calligraphy-text text-glow text-5xl md:text-7xl tracking-wide select-none">
                كَنْزُ العُلُومِ
              </h1>
              <p className="text-[11px] font-bold tracking-[0.1em] text-[#fed65b] mt-1 opacity-95">
                بوابة التفوق في علوم الطبيعة والحياة
              </p>
            </div>

            <div className="relative p-2 mascot-float">
              <div className="absolute inset-0 bg-[#fed65b]/20 rounded-full blur-3xl animate-pulse" />
              <ZoomableImage
                src={MASCOT_URL}
                alt="Pirate Mascot"
                className="relative w-56 h-56 md:w-72 md:h-72 object-contain filter drop-shadow-[0_12px_24px_rgba(254,214,91,0.35)]"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>

          <div className="relative z-10 pb-8 flex flex-col items-center gap-3">
            <button
              onClick={handleOpenTreasure}
              className="group relative px-8 py-4 bg-gradient-to-r from-[#ffe066] via-[#fed65b] to-[#b8860b] hover:from-[#fff4cc] hover:to-[#fed65b] text-[#002713] rounded-2xl font-black text-sm md:text-base flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(254,214,91,0.35)] cursor-pointer transition-all border border-[#fff4cc]/50"
            >
              <Key className="w-5 h-5 text-[#002713] animate-bounce" />
              <span>افْتَحْ كَنْزَ العُلُومِ (دخول)</span>
            </button>
            <span className="text-[10px] text-gray-400 font-medium">
              انقر لفتح الكنز وبدء المغامرة الموسيقية 🎵
            </span>
          </div>
        </div>
      ) : (
        <div className="relative min-h-screen w-full flex flex-col justify-between p-6 md:p-12 z-10">
          <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            <div className="absolute -top-[10%] -right-[10%] w-[350px] md:w-[600px] h-[350px] md:h-[600px] bg-[#2ecc71] opacity-[0.06] rounded-full blur-3xl" />
            <div className="absolute -bottom-[10%] -left-[10%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-[#fed65b] opacity-[0.12] rounded-full blur-3xl" />
          </div>

          <header className="relative z-10 flex flex-row-reverse justify-between items-center w-full max-w-4xl mx-auto pt-4 md:pt-0">
            <div className="flex items-center gap-2 bg-[#ffffff]/80 backdrop-blur-md px-3.5 py-2 rounded-full border border-[#e2dabf]/50 shadow-sm text-xs md:text-sm text-[#735c00] font-bold">
              <Trophy className="w-4 h-4 text-[#fed65b] fill-[#fed65b]" />
              <span>منصة التحضير الأفضل لبكالوريا الجزائر</span>
            </div>
            <div className="text-xs text-[#735c00] font-bold opacity-80 flex items-center gap-1 pr-12">
              <Sparkles className="w-3.5 h-3.5 text-[#fed65b]" />
              <span>إصدار 2026 ذكي</span>
            </div>
          </header>

          <main className="relative z-10 flex-1 flex flex-col items-center justify-center w-full max-w-xl mx-auto text-center my-6">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-[#006d37]/10 rounded-full blur-2xl animate-pulse" />
              <div className="relative bg-[#ffffff] p-6 rounded-[28px] border border-[#006d37]/10 shadow-[0_12px_36px_-6px_rgba(68,42,34,0.15)] flex items-center justify-center">
                <img
                  src={MASCOT_URL}
                  alt="Mascot"
                  className="w-40 h-40 md:w-52 md:h-52 object-contain mascot-float"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-black text-[#006d37] tracking-tight drop-shadow-sm font-display">
                كَنْزُ العُلُومِ
              </h1>
              <p className="text-xl md:text-2xl font-black text-[#442a22] max-w-[340px] mx-auto leading-relaxed">
                أهلاً بك في كنز العلوم
              </p>
              <p className="text-sm md:text-base text-[#504441] leading-relaxed max-w-md mx-auto opacity-90 px-4 font-bold">
                منصتك المتكاملة والذكية لتبسيط علوم الطبيعة والحياة (SVT) وتسهيل التميز في امتحانات شهادة البكالوريا.
              </p>
            </div>

            {/* Avertissement de Bêta publique hors-ligne */}
            <div className="w-full max-w-md mx-auto mt-6 bg-[#fff3cd] border-2 border-[#ffc107] rounded-xl p-4 shadow-sm relative overflow-hidden">
               <div className="absolute top-0 right-0 w-2 h-full bg-[#ffc107]" />
               <p className="text-sm font-black text-[#856404] flex items-center gap-2 mb-1">
                 <ShieldCheck className="w-4 h-4" /> نسخة تجريبية (Bêta)
               </p>
               <p className="text-xs text-[#856404] leading-relaxed text-right font-bold">
                 تُحفظ بياناتك وتقدمك على هذا المتصفح فقط. مسح بيانات المتصفح (Cache/History) سيؤدي إلى فقدان تقدمك بالكامل.
               </p>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-6 w-full max-w-sm">
              <div className="bg-[#ffffff]/60 backdrop-blur-sm p-4 rounded-2xl border border-[#e2dabf]/50 flex flex-col items-center shadow-sm">
                <span className="text-lg font-black text-[#006d37]">ملخصات ذكية</span>
                <span className="text-[10px] text-[#504441] font-bold opacity-80">تفاعلية وسهلة الفهم</span>
              </div>
              <div className="bg-[#ffffff]/60 backdrop-blur-sm p-4 rounded-2xl border border-[#e2dabf]/50 flex flex-col items-center shadow-sm">
                <span className="text-lg font-black text-[#944a00]">تقييم ذكي</span>
                <span className="text-[10px] text-[#504441] font-bold opacity-80">خوارزمية تكرار متباعد</span>
              </div>
            </div>
          </main>

          <footer className="relative z-10 w-full max-w-md mx-auto pb-6">
            <button
              onClick={() => {
                if (localStorage.getItem('kunz_terms_accepted') === 'true') {
                  onStart();
                } else {
                  setIsTermsOpen(true);
                }
              }}
              className="group w-full h-14 md:h-16 bg-[#006d37] hover:bg-[#00562b] text-[#ffffff] rounded-2xl font-black text-base md:text-lg flex flex-row-reverse justify-between px-6 shadow-[0_8px_24px_-6px_rgba(0,109,55,0.3)] transition-all duration-300 cursor-pointer"
            >
              <span className="flex items-center gap-3 flex-row-reverse">
                <Rocket className="w-5 h-5 text-[#fed65b] fill-[#fed65b] animate-pulse" />
                <span>ابدأ رحلة التعلم</span>
              </span>
              <ChevronLeft className="w-6 h-6 transition-transform group-hover:-translate-x-1" />
            </button>

            <button 
              onClick={() => setIsTermsOpen(true)}
              className="mt-6 mx-auto text-[10px] sm:text-xs text-[#504441] opacity-75 flex items-center justify-center gap-1.5 font-bold hover:text-[#006d37] hover:opacity-100 transition-colors cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#006d37]" />
              <span className="underline underline-offset-4 decoration-[#e2dabf]">شروط الاستخدام وسياسة الخصوصية</span>
            </button>
          </footer>
        </div>
      )}

      <Suspense fallback={null}>
        <TermsModal 
          isOpen={isTermsOpen} 
          onClose={() => {
            localStorage.setItem('kunz_terms_accepted', 'true');
            setIsTermsOpen(false);
          }} 
        />
      </Suspense>
    </div>
  );
}
