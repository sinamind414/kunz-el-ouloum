import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Flame, 
  Trophy, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  X, 
  Zap, 
  Award, 
  Calendar, 
  CheckCircle2,
  Share2,
  ChevronLeft
} from 'lucide-react';
import { 
  playStreakMilestoneSound, 
  playDailyGoalCelebrationSound, 
  playXPGainSound,
  isSoundMuted, 
  toggleSoundMute 
} from '../utils/audio';

interface StreakCelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  streakDays: number;
  onOpenShareModal?: () => void;
}

export default function StreakCelebrationModal({
  isOpen,
  onClose,
  streakDays,
  onOpenShareModal
}: StreakCelebrationModalProps) {
  const [isMuted, setIsMuted] = useState<boolean>(isSoundMuted());
  const [isPlayingSound, setIsPlayingSound] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      // Play celebratory sound on open
      playStreakMilestoneSound(streakDays);
    }
  }, [isOpen, streakDays]);

  const handleToggleMute = () => {
    const nextMuted = toggleSoundMute();
    setIsMuted(nextMuted);
    if (!nextMuted) {
      playXPGainSound();
    }
  };

  const handleReplayStreakSound = () => {
    setIsPlayingSound(true);
    playStreakMilestoneSound(streakDays);
    setTimeout(() => setIsPlayingSound(false), 1200);
  };

  const handlePlayGoalSound = () => {
    setIsPlayingSound(true);
    playDailyGoalCelebrationSound();
    setTimeout(() => setIsPlayingSound(false), 1200);
  };

  // Determine Milestone Tier
  const getStreakTier = (days: number) => {
    if (days >= 30) return { title: 'أسطورة البكالوريا', level: 'عالمي', color: 'from-purple-500 to-indigo-600', textColor: 'text-purple-400', bonusXP: 500, nextMilestone: 60 };
    if (days >= 14) return { title: 'استمرارية الأبطال', level: 'ذهبي متقدم', color: 'from-amber-500 to-yellow-600', textColor: 'text-amber-400', bonusXP: 250, nextMilestone: 30 };
    if (days >= 7) return { title: 'شعلة الأسبوع المتواصل', level: 'فضي لامع', color: 'from-emerald-500 to-teal-600', textColor: 'text-emerald-400', bonusXP: 100, nextMilestone: 14 };
    if (days >= 3) return { title: 'انطلاقة العزيمة', level: 'برونزي نشط', color: 'from-orange-500 to-amber-600', textColor: 'text-orange-400', bonusXP: 50, nextMilestone: 7 };
    return { title: 'شعلة البداية', level: 'مبتدئ واعد', color: 'from-teal-500 to-emerald-600', textColor: 'text-teal-400', bonusXP: 20, nextMilestone: 3 };
  };

  const currentTier = getStreakTier(streakDays);

  const streakMilestones = [
    { days: 3, label: '3 أيام', xp: '+50 XP', title: 'انطلاقة العزيمة' },
    { days: 7, label: '7 أيام', xp: '+100 XP', title: 'شعلة الأسبوع' },
    { days: 14, label: '14 يوم', xp: '+250 XP', title: 'استمرارية الأبطال' },
    { days: 30, label: '30 يوم', xp: '+500 XP', title: 'أسطورة البكالوريا' },
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto" dir="rtl">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white dark:bg-[#121824] border border-amber-500/30 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden text-right text-[#1f1c0b] dark:text-white relative"
        >
          {/* Glowing background halo */}
          <div className="absolute top-0 right-1/2 translate-x-1/2 w-64 h-48 bg-gradient-to-b from-amber-500/20 to-transparent blur-3xl pointer-events-none" />

          {/* Header Controls */}
          <div className="p-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-800 relative z-10">
            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleMute}
                className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  isMuted 
                    ? 'bg-red-500/10 text-red-600 border-red-200 dark:border-red-900/50' 
                    : 'bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:border-emerald-900/50'
                }`}
                title={isMuted ? 'تفعيل المؤثرات الصوتية' : 'كتم المؤثرات الصوتية'}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                <span className="text-[11px] font-bold">{isMuted ? 'صوت مكتوم' : 'الصوت مفعل'}</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-6 space-y-6 text-center relative z-10">
            
            {/* Animated Flame Badge */}
            <div className="relative inline-block mx-auto">
              <motion.div
                animate={{ scale: [1, 1.08, 1], rotate: [-2, 2, -2] }}
                transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
                className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-amber-500 via-orange-500 to-yellow-400 text-white flex items-center justify-center shadow-[0_0_35px_rgba(245,158,11,0.5)] mx-auto border-2 border-yellow-200/40"
              >
                <Flame className="w-14 h-14 fill-current drop-shadow-md" />
              </motion.div>
              <div className="absolute -bottom-2 -right-2 bg-white dark:bg-gray-900 border-2 border-amber-400 text-amber-500 dark:text-amber-400 rounded-full px-2 py-0.5 text-xs font-black shadow-md flex items-center gap-1">
                <Sparkles className="w-3 h-3 fill-current" />
                <span>+{currentTier.bonusXP} XP</span>
              </div>
            </div>

            {/* Streak Counter Heading */}
            <div className="space-y-1">
              <span className="text-xs font-black text-amber-600 dark:text-amber-400 tracking-wider">
                ⭐ وسام المواظبة المتواصلة ⭐
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-[#1f1c0b] dark:text-white">
                {streakDays} {streakDays === 1 ? 'يوم' : streakDays === 2 ? 'يومان' : streakDays <= 10 ? 'أيام' : 'يوماً'} متتالية! 🔥
              </h2>
              <div className="inline-block bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-transparent px-3 py-1 rounded-full text-xs font-extrabold text-amber-700 dark:text-amber-300">
                مرتبة: {currentTier.title} ({currentTier.level})
              </div>
            </div>

            {/* Sound & Motivation Bar */}
            <div className="bg-gray-50 dark:bg-gray-800/60 p-4 rounded-2xl border border-gray-200/70 dark:border-gray-700/60 space-y-3 text-right">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-500" />
                  المؤثرات الصوتية التفاعلية:
                </span>
                <span className="text-[11px] font-bold text-gray-400">
                  نغمات فورية Web Audio
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleReplayStreakSound}
                  disabled={isPlayingSound}
                  className="px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-300/40 text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs active:scale-95"
                >
                  <Flame className="w-3.5 h-3.5 fill-current text-amber-500" />
                  <span>نغمة الشعلة 🎵</span>
                </button>

                <button
                  onClick={handlePlayGoalSound}
                  disabled={isPlayingSound}
                  className="px-3 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-300/40 text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs active:scale-95"
                >
                  <Trophy className="w-3.5 h-3.5 text-emerald-600" />
                  <span>نغمة الهدف اليومي 🏆</span>
                </button>
              </div>
            </div>

            {/* Milestone Roadmap */}
            <div className="space-y-2.5 text-right">
              <div className="flex items-center justify-between text-xs font-bold text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-amber-500" />
                  <span>محطات وأوسمة الـ Streak القادمة:</span>
                </span>
                <span className="text-[10px] text-amber-600 dark:text-amber-400">
                  متبقي {Math.max(1, currentTier.nextMilestone - streakDays)} أيام للمحطة التالية
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {streakMilestones.map((m) => {
                  const isUnlocked = streakDays >= m.days;
                  return (
                    <div
                      key={m.days}
                      className={`p-2.5 rounded-2xl border text-center transition-all ${
                        isUnlocked
                          ? 'bg-amber-500/10 dark:bg-amber-950/30 border-amber-400/50 text-amber-800 dark:text-amber-200 font-black shadow-xs'
                          : 'bg-gray-50 dark:bg-gray-800/40 border-gray-200 dark:border-gray-700 text-gray-400'
                      }`}
                    >
                      <div className="flex items-center justify-center mb-1">
                        {isUnlocked ? (
                          <CheckCircle2 className="w-4 h-4 text-amber-500" />
                        ) : (
                          <Calendar className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                      <div className="text-xs font-black">{m.label}</div>
                      <div className="text-[10px] opacity-80">{m.title}</div>
                      <div className="text-[9px] font-black text-amber-500 mt-1">{m.xp}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
              {onOpenShareModal && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenShareModal();
                  }}
                  className="w-full sm:flex-1 py-3 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:opacity-95 text-white font-black text-xs rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <Share2 className="w-4 h-4" />
                  <span>مشاركة إنجاز الـ Streak كبطاقة</span>
                </button>
              )}

              <button
                onClick={onClose}
                className="w-full sm:w-auto px-6 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-black text-xs rounded-2xl transition-all cursor-pointer"
              >
                متابعة الدراسة 🚀
              </button>
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
