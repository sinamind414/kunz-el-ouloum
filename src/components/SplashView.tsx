import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Rocket, ChevronLeft, ShieldCheck, Trophy, Sparkles, Volume2, VolumeX, Key, Anchor } from 'lucide-react';
import { MASCOT_URL } from '../data';
import { startPirateMusic, stopPirateMusic } from '../utils/audio';

interface SplashViewProps {
  onStart: () => void;
}

export default function SplashView({ onStart }: SplashViewProps) {
  const [showIntroSplash, setShowIntroSplash] = useState<boolean>(true);
  const [isMusicMuted, setIsMusicMuted] = useState<boolean>(false);
  
  // Clean up music when component unmounts
  useEffect(() => {
    return () => {
      // We don't stop music immediately on unmount so they can hear it in home page,
      // but if we want to stop it when they click Start, we can do that in onStart!
    };
  }, []);

  const handleOpenTreasure = () => {
    // Play shanty music
    startPirateMusic(0.08);
    // Smooth transition to standard landing screen
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
      
      {/* Styles for gold shimmer and sparkles */}
      <style>{`
        @keyframes shine {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
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
      `}</style>

      {/* Background Sound Indicator (once music is started or in original splash) */}
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

      <AnimatePresence mode="wait">
        {showIntroSplash ? (
          /* INTRO FULL SCREEN SPLASH SCREEN */
          <motion.div
            key="intro-splash"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="absolute inset-0 w-full h-full z-40 bg-gradient-to-b from-[#002713] via-[#003d1e] to-[#00140a] flex flex-col justify-between p-6 select-none"
          >
            {/* Immersive Pirate Background Watermark */}
            <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
              <motion.img 
                initial={{ scale: 1.1, opacity: 0.15 }}
                animate={{ scale: 1.0, opacity: 0.25 }}
                transition={{ duration: 10, repeat: Infinity, repeatType: "reverse" }}
                src={MASCOT_URL} 
                alt="Pirate Watermark" 
                className="w-full h-full object-contain opacity-25 filter brightness-50 mix-blend-overlay"
                referrerPolicy="no-referrer"
              />
              
              {/* Magic Golden Sparkles / Stars */}
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute bg-[#fed65b] rounded-full"
                  style={{
                    width: Math.random() * 6 + 3 + 'px',
                    height: Math.random() * 6 + 3 + 'px',
                    left: Math.random() * 100 + '%',
                    top: Math.random() * 100 + '%',
                  }}
                  animate={{
                    opacity: [0.2, 0.9, 0.2],
                    scale: [0.8, 1.3, 0.8],
                    y: [0, Math.random() * -50 - 20],
                  }}
                  transition={{
                    duration: Math.random() * 3 + 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: Math.random() * 2,
                  }}
                />
              ))}
            </div>

            {/* Top header on Intro */}
            <div className="relative z-10 text-center pt-8 flex flex-col items-center gap-1">
              <span className="text-[10px] uppercase tracking-[0.25em] font-extrabold text-[#fed65b]/80 flex items-center gap-1.5">
                <Anchor className="w-3.5 h-3.5 text-[#fed65b]" />
                <span>التحضير الأقوى لبكالوريا 2026</span>
              </span>
              <div className="h-[2px] w-12 bg-gradient-to-r from-transparent via-[#fed65b] to-transparent mt-1" />
            </div>

            {/* Centered Golden Arabic Calligraphy Logo & Character */}
            <div className="relative z-10 flex-1 flex flex-col items-center justify-center space-y-6">
              
              {/* Calligraphy Logo */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 1 }}
                className="text-center"
              >
                <h1 className="gold-calligraphy-text text-glow text-5xl md:text-7xl tracking-wide select-none">
                  كَنْزُ العُلُومِ
                </h1>
                <p className="text-[11px] font-bold tracking-[0.1em] text-[#fed65b] mt-1 opacity-95">
                  بوابة التفوق في علوم الطبيعة والحياة
                </p>
              </motion.div>

              {/* Character full surface - breathe animation */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, duration: 1.2, ease: "easeOut" }}
                className="relative"
              >
                <div className="absolute inset-0 bg-[#fed65b]/20 rounded-full blur-3xl animate-pulse" />
                <motion.div
                  animate={{ 
                    y: [0, -12, 0],
                    rotate: [0, 1, -1, 0]
                  }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 4, 
                    ease: "easeInOut" 
                  }}
                  className="relative p-2"
                >
                  <img 
                    src={MASCOT_URL} 
                    alt="Pirate Mascot" 
                    className="w-56 h-56 md:w-72 md:h-72 object-contain filter drop-shadow-[0_12px_24px_rgba(254,214,91,0.35)]"
                    referrerPolicy="no-referrer"
                  />
                </motion.div>
              </motion.div>
              
            </div>

            {/* Bottom Golden Action Key Button */}
            <div className="relative z-10 pb-8 flex flex-col items-center gap-3">
              <motion.button
                onClick={handleOpenTreasure}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group relative px-8 py-4 bg-gradient-to-r from-[#ffe066] via-[#fed65b] to-[#b8860b] hover:from-[#fff4cc] hover:to-[#fed65b] text-[#002713] rounded-2xl font-black text-sm md:text-base flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(254,214,91,0.35)] cursor-pointer transition-all border border-[#fff4cc]/50"
              >
                <Key className="w-5 h-5 text-[#002713] animate-bounce" />
                <span>افْتَحْ كَنْزَ العُلُومِ (دخول)</span>
              </motion.button>
              
              <span className="text-[10px] text-gray-400 font-medium">
                انقر لفتح الكنز وبدء المغامرة الموسيقية 🎵
              </span>
            </div>

          </motion.div>
        ) : (
          /* STANDARD LANDING SCREEN (ORIGINAL SPLASHVIEW) */
          <motion.div
            key="main-splash"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="relative min-h-screen w-full flex flex-col justify-between p-6 md:p-12 z-10"
          >
            {/* Decorative Atmosphere Orbs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
              <div className="absolute -top-[10%] -right-[10%] w-[350px] md:w-[600px] h-[350px] md:h-[600px] bg-[#2ecc71] opacity-[0.06] rounded-full blur-3xl" />
              <div className="absolute -bottom-[10%] -left-[10%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-[#fed65b] opacity-[0.12] rounded-full blur-3xl" />
            </div>

            {/* Top Header Row */}
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

            {/* Main mascot and titles */}
            <main className="relative z-10 flex-1 flex flex-col items-center justify-center w-full max-w-xl mx-auto text-center my-6">
              
              {/* Animated Mascot Image Container */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.85, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative mb-8"
              >
                {/* Soft outer aura glow */}
                <div className="absolute inset-0 bg-[#006d37]/10 rounded-full blur-2xl animate-pulse" />
                
                <div className="relative bg-[#ffffff] p-6 rounded-[28px] border border-[#006d37]/10 shadow-[0_12px_36px_-6px_rgba(68,42,34,0.15)] flex items-center justify-center">
                  <motion.img 
                    animate={{ y: [0, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
                    src={MASCOT_URL} 
                    alt="Mascot" 
                    className="w-40 h-40 md:w-52 md:h-52 object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </motion.div>

              {/* Brand Typography with dynamic entrance */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="space-y-4"
              >
                <h1 className="text-4xl md:text-5xl font-black text-[#006d37] tracking-tight drop-shadow-sm font-display">
                  كَنْزُ العُلُومِ
                </h1>
                <p className="text-xl md:text-2xl font-black text-[#442a22] max-w-[340px] mx-auto leading-relaxed">
                  أهلاً بك في كنز العلوم
                </p>
                <p className="text-sm md:text-base text-[#504441] leading-relaxed max-w-md mx-auto opacity-90 px-4 font-bold">
                  منصتك المتكاملة والذكية لتبسيط علوم الطبيعة والحياة (SVT) وتسهيل التميز في امتحانات شهادة البكالوريا.
                </p>
              </motion.div>

              {/* Info Grid Pills */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="grid grid-cols-2 gap-3 mt-8 w-full max-w-sm"
              >
                <div className="bg-[#ffffff]/60 backdrop-blur-sm p-4 rounded-2xl border border-[#e2dabf]/50 flex flex-col items-center shadow-sm">
                  <span className="text-lg font-black text-[#006d37]">ملخصات ذكية</span>
                  <span className="text-[10px] text-[#504441] font-bold opacity-80">تفاعلية وسهلة الفهم</span>
                </div>
                <div className="bg-[#ffffff]/60 backdrop-blur-sm p-4 rounded-2xl border border-[#e2dabf]/50 flex flex-col items-center shadow-sm">
                  <span className="text-lg font-black text-[#944a00]">تقييم ذكي</span>
                  <span className="text-[10px] text-[#504441] font-bold opacity-80">خوارزمية تكرار متباعد</span>
                </div>
              </motion.div>

            </main>

            {/* Button and footer policy */}
            <footer className="relative z-10 w-full max-w-md mx-auto pb-6">
              <motion.button 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  // Keep playing shanty but also play default click sound
                  onStart();
                }}
                className="group w-full h-14 md:h-16 bg-[#006d37] hover:bg-[#00562b] text-[#ffffff] rounded-2xl font-black text-base md:text-lg flex flex-row-reverse justify-between px-6 shadow-[0_8px_24px_-6px_rgba(0,109,55,0.3)] transition-all duration-300 cursor-pointer"
              >
                <span className="flex items-center gap-3 flex-row-reverse">
                  <Rocket className="w-5 h-5 text-[#fed65b] fill-[#fed65b] animate-pulse" />
                  <span>ابدأ رحلة التعلم</span>
                </span>
                <ChevronLeft className="w-6 h-6 transition-transform group-hover:-translate-x-1" />
              </motion.button>

              <p className="text-center mt-6 text-[10px] sm:text-xs text-[#504441] opacity-75 flex items-center justify-center gap-1.5 font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-[#006d37]" />
                <span>بالانضمام إلينا، أنت توافق على شروط الاستخدام وسياسة الخصوصية</span>
              </p>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
