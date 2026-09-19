import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Swords, ShieldAlert, Target, Lock, PlayCircle, Trophy, Clock, CheckCircle2, Zap, BrainCircuit } from 'lucide-react';

interface CombatTrainerViewProps {
  onStartChallenge: (id: string, title: string, mode: 'coach' | 'sprint') => void;
}

const CHALLENGES = [
  {
    id: 'bac-2025-sujets',
    title: 'الإطار الرسمي: بكالوريا 2025 — الموضوعان كاملان',
    description: 'الإطار الرسمي الكامل: أجب عن التمارين الثلاثة (5+7+8 نقاط) وشاهد التنقيط الإلزامي على مقتضيات الإجابة الرسمية — موضوعان رسميان 2025.',
    time: 'ساعتان',
    points: 40,
    locked: false,
    color: 'from-emerald-600 to-emerald-500',
    verified: true
  },
  {
    id: 'bac-2008-immunity',
    title: 'تفكيك وثيقة: مقر تركيب البروتين',
    description: 'تحدي تفكيك وثيقة التصوير الإشعاعي الذاتي، صياغة تحليل منهجي (ملاحظة-تفسير-استنتاج)، وبناء نص علمي.',
    time: '45 دقيقة',
    points: 20,
    locked: false,
    color: 'from-rose-600 to-rose-500',
    verified: true
  },
  {
    id: 'bac-2022-tyrosinase',
    title: 'الاستدلال العلمي: إنزيم التيروزيناز',
    description: 'تحدي اكتشاف تأثير الحرارة على بنية الإنزيمات وكيفية صياغة فرضيات علمية دقيقة.',
    time: '60 دقيقة',
    points: 30,
    locked: true,
    color: 'from-slate-700 to-slate-600',
    verified: true
  },
  {
    id: 'bac-drawing',
    title: 'الرسم التخطيطي: هجوم الـ LTc',
    description: 'استخدم القلم الرقمي لبناء رسم تخطيطي وظيفي دقيق لآلية عمل البرفورين والغرنزيم.',
    time: '30 دقيقة',
    points: 15,
    locked: true,
    color: 'from-slate-700 to-slate-600',
    verified: false
  }
];

export default function CombatTrainerView({ onStartChallenge }: CombatTrainerViewProps) {
  const [mode, setMode] = useState<'coach' | 'sprint'>('coach');

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6 pb-24" dir="rtl">
      
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 bg-slate-900 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-2xl"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl" />
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-rose-500/20 text-rose-400 rounded-2xl shadow-inner border border-rose-500/30">
                <Swords className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl md:text-4xl font-black flex items-center gap-2">
                  معسكر التدريب <span className="text-rose-500 text-sm md:text-xl border border-rose-500/30 bg-rose-500/10 px-2 py-1 rounded-lg">المواجهة</span>
                </h1>
              </div>
            </div>
          </div>
          
          <p className="text-slate-300 font-medium text-sm md:text-base leading-relaxed max-w-2xl mb-8">
            التطبيق ليس مجرد كتاب للمراجعة، بل هو "مدرب قتالي". 
            هنا لن تحفظ الدروس، بل ستتدرب على <strong className="text-white">المنهجية القاسية للبكالوريا</strong>.
            كل تحدي هنا <strong className="text-emerald-400">مدقق ومصادق عليه من طرف أساتذة المادة</strong> ومطابق لسلم التصحيح الرسمي.
          </p>

          {/* Mode Selector */}
          <div className="bg-slate-800/80 p-2 rounded-2xl border border-slate-700 inline-flex w-full md:w-auto relative mb-4">
            <div 
              className="absolute top-2 bottom-2 w-[calc(50%-8px)] bg-slate-700 rounded-xl transition-all duration-300 ease-in-out z-0"
              style={{ left: mode === 'sprint' ? '8px' : 'calc(50%)' }}
            />
            
            <button 
              onClick={() => setMode('coach')}
              className={`flex-1 md:w-48 py-3 px-4 relative z-10 font-bold text-sm flex items-center justify-center gap-2 transition-colors ${mode === 'coach' ? 'text-white' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <BrainCircuit className={`w-5 h-5 ${mode === 'coach' ? 'text-indigo-400' : ''}`} />
              <span>وضع المدرب (توجيه)</span>
            </button>
            
            <button 
              onClick={() => setMode('sprint')}
              className={`flex-1 md:w-48 py-3 px-4 relative z-10 font-bold text-sm flex items-center justify-center gap-2 transition-colors ${mode === 'sprint' ? 'text-white' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <Zap className={`w-5 h-5 ${mode === 'sprint' ? 'text-amber-400' : ''}`} />
              <span>وضع السبرينت (امتحان)</span>
            </button>
          </div>
          
          <div className="text-xs font-medium text-slate-400 px-2">
            {mode === 'coach' 
              ? '💡 في وضع المدرب: وقت مفتوح، تلميحات مساعدة، وتصحيح مفصل خطوة بخطوة. مثالي لبداية السنة.'
              : '⚡ في وضع السبرينت: عداد تنازلي صارم، لا تلميحات، تقييم نهائي صارم. مثالي للمراجعة النهائية.'}
          </div>

        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {CHALLENGES.map((challenge, index) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            key={challenge.id}
            className={`relative rounded-3xl overflow-hidden border flex flex-col ${challenge.locked ? 'bg-slate-900/50 border-slate-800 opacity-75' : 'bg-slate-900 border-slate-700 shadow-xl'}`}
          >
            <div className={`h-2 w-full bg-gradient-to-r ${challenge.color}`} />
            
            <div className="p-6 flex flex-col flex-1">
              <div className="flex justify-between items-start mb-4">
                <h3 className={`text-xl font-black ${challenge.locked ? 'text-gray-500' : 'text-white'}`}>
                  {challenge.title}
                </h3>
                {challenge.locked && (
                  <Lock className="w-5 h-5 text-slate-600" />
                )}
              </div>
              
              <p className={`text-sm font-medium mb-6 leading-relaxed flex-1 ${challenge.locked ? 'text-slate-600' : 'text-slate-400'}`}>
                {challenge.description}
              </p>

              {challenge.verified && (
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400/80 mb-6 bg-emerald-400/10 self-start px-2.5 py-1 rounded-md border border-emerald-400/20">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  مصادق عليه من طرف مفتش المادة
                </div>
              )}

              <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-800">
                <div className={`flex items-center gap-4 text-xs font-bold ${challenge.locked ? 'text-slate-600' : 'text-slate-400'}`}>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{challenge.time}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Trophy className="w-4 h-4" />
                    <span>{challenge.points} XP</span>
                  </div>
                </div>

                <button
                  onClick={() => !challenge.locked && onStartChallenge(challenge.id, challenge.title, mode)}
                  disabled={challenge.locked}
                  className={`px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${
                    challenge.locked 
                      ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                      : 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-900/50 hover:scale-105 active:scale-95 cursor-pointer'
                  }`}
                >
                  {challenge.locked ? (
                    <span>قريباً</span>
                  ) : (
                    <>
                      <span>ابدأ التحدي</span>
                      <PlayCircle className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
    </div>
  );
}
