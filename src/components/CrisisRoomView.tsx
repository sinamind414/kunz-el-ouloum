import { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, Clock, ShieldAlert } from 'lucide-react';
import { startCrisisMode, gradeCrisisAnswer, analyzeCrisisPerformance, type CrisisSession, type CrisisResult } from '../utils/crisisEngine';

interface CrisisRoomProps { onBack?: () => void; onAwardXP?: (xp: number) => void; session: any; }

function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef(callback);
  useEffect(() => { savedCallback.current = callback; }, [callback]);
  useEffect(() => { if (delay !== null) { const id = setInterval(() => savedCallback.current(), delay); return () => clearInterval(id); } }, [delay]);
}

export default function CrisisRoomView({ onBack, onAwardXP, session }: CrisisRoomProps) {
  const [crisisState, setCrisisState] = useState<CrisisSession | null>(null);
  const [timeLeft, setTimeLeft] = useState(45);
  const [result, setResult] = useState<CrisisResult | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [lastAnswer, setLastAnswer] = useState<'correct' | 'wrong' | 'timeout' | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (!crisisState && !result) { const c = startCrisisMode(session); setCrisisState(c); setTimeLeft(c.timePerQuestion); } }, []);

  const startCrisis = () => { if (crisisState) { setHasStarted(true); setTimeLeft(crisisState.timePerQuestion); inputRef.current?.focus(); } };

  const handleTimeout = useCallback(() => {
    if (crisisState && !crisisState.isFinished) {
      setLastAnswer('timeout');
      const res = gradeCrisisAnswer(crisisState, '', 45000); setCrisisState(res.newCrisis);
      if (res.newCrisis.isFinished) setTimeout(() => finalizeCrisis(res.newCrisis), 1000);
      else setTimeout(() => { setTimeLeft(crisisState.timePerQuestion); setLastAnswer(null); }, 800);
    }
  }, [crisisState]);

  const tick = useCallback(() => { setTimeLeft((prev) => { if (prev <= 1) { handleTimeout(); return 0; } return prev - 1; }); }, [handleTimeout]);
  useInterval(tick, hasStarted ? (timeLeft > 0 && !crisisState?.isFinished ? 1000 : null) : null);

  const handleSubmit = (val: string) => {
    if (!crisisState || crisisState.isFinished) return;
    const res = gradeCrisisAnswer(crisisState, val, 45 - timeLeft); setCrisisState(res.newCrisis);
    setLastAnswer(res.isCorrect ? 'correct' : 'wrong');
    if (res.newCrisis.isFinished) setTimeout(() => finalizeCrisis(res.newCrisis), 1200);
    else setTimeout(() => { setTimeLeft(crisisState.timePerQuestion); setLastAnswer(null); }, 600);
  };

  const finalizeCrisis = (finalCrisis: CrisisSession) => {
    const analysis = analyzeCrisisPerformance(finalCrisis); setResult(analysis);
    if (onAwardXP) onAwardXP(finalCrisis.score * 15);
  };

  const restartGame = () => { setCrisisState(null); setResult(null); setTimeLeft(45); setHasStarted(false); setLastAnswer(null); };

  if (!crisisState || result) {
    return (
      <div className="flex flex-col h-full bg-[#0f172a] text-white p-6 overflow-y-auto relative">
        <button onClick={onBack} className="absolute top-4 left-4 text-gray-300 hover:text-white z-10"><ArrowLeft className="w-6 h-6" /></button>
        {!result ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-6 z-10 relative">
            <ShieldAlert className="w-20 h-20 text-[#ef4444] animate-bounce" />
            <h1 className="text-3xl font-extrabold tracking-wider text-[#ef4444]">غرفة العمليات</h1>
            <p className="max-w-sm text-gray-400 text-sm leading-relaxed">نظام الطوارئ. اختبار سرعة تحت الضغط.<br />10 أسئلة عشوائية (بعضها من أخطائك!) في 7 دقائق.<br /><span className="text-xs text-gray-600">هل أنت مستعد للجحيم؟</span></p>
            <button onClick={startCrisis} className="px-8 py-4 bg-gradient-to-r from-[#dc2626] to-[#991b1b] hover:from-[#b91c1c] rounded-xl font-bold text-lg shadow-[0_4px_14px_0_rgba(220,38,38,0.25)] transform transition active:scale-95">⚡ بدء المهمة السريعة ⚡</button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-8 z-10">
            <span className="text-6xl">{result.emoji}</span>
            <h2 className="text-3xl font-bold">{result.badge === 'ironman' ? 'IRONMAN' : result.badge === 'soldat' ? 'جندي' : result.badge === 'ejecte' ? 'مقصى' : 'مبتدئ'}</h2>
            <div className="bg-white/10 p-6 rounded-2xl backdrop-blur-md border border-white/20">
              <p className="text-lg font-mono">{result.score}</p>
              <p className="text-sm text-blue-200 mt-2">وقت البقاء: {result.survivalTime}</p>
              <p className="mt-4 text-gray-200 text-sm italic">"{result.message}"</p>
              {result.badge !== 'ironman' && <button onClick={restartGame} className="mt-6 px-6 py-2 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/10 transition-colors w-full">إعادة المحاولة</button>}
            </div>
            <button onClick={onBack} className="text-sm text-gray-400 hover:text-white transition-colors">العودة للدردشة</button>
          </div>
        )}
      </div>
    );
  }

  const currentQ = crisisState.questionsToAsk[crisisState.currentQuestionIndex];
  const getColorClass = () => { if (timeLeft <= 10) return 'text-red-500'; if (timeLeft <= 25) return 'text-orange-500'; if (timeLeft >= 40) return 'text-green-400'; return 'text-yellow-300'; };

  return (
    <div className="flex flex-col h-full bg-[#0f172a] text-white min-h-screen">
      <header className="bg-black/40 backdrop-blur-sm border-b border-white/10 p-4 flex justify-between items-center shrink-0 sticky top-0 z-20 shadow-2xl">
        <button onClick={onBack} className="hover:text-[#ef4444]"><ArrowLeft className="w-5 h-5" /></button>
        <div className="flex items-center gap-4">
          <ShieldAlert className={`w-5 h-5 ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-orange-500'}`} />
          <span className={`font-mono text-xl md:text-3xl font-bold tabular-nums tracking-widest ${timeLeft <= 10 ? 'text-[#ef4444]' : ''}`}>{timeLeft}s</span>
        </div>
        <div className="text-xs opacity-60 font-mono">{crisisState.currentQuestionIndex}/{crisisState.totalQuestionCount}</div>
      </header>
      <div className="flex-1 overflow-y-auto p-4 pt-8 flex flex-col items-center gap-8">
        <div className="w-full max-w-2xl bg-black/30 h-2 rounded-full overflow-hidden border border-white/10">
          <div className="h-full bg-gradient-to-r from-[#ef4444] to-[#991b1b] transition-all duration-500" style={{ width: `${(crisisState.score / Math.max(crisisState.totalQuestionCount, 1)) * 100}%` }} />
        </div>
        {currentQ && (
          <div className="w-full max-w-2xl bg-[#1e293b]/80 border border-white/20 rounded-2xl p-6 backdrop-blur-xl shadow-2xl">
            <div className="mb-2 text-xs text-right text-gray-400 uppercase tracking-widest">سؤال رقم {crisisState.currentQuestionIndex + 1}</div>
            {lastAnswer && <div className={`text-center py-2 rounded-lg mb-3 text-sm font-bold ${lastAnswer === 'correct' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>{lastAnswer === 'correct' ? '✅ صحيح!' : '⏰ انتهى الوقت!'}</div>}
            <p className="text-lg leading-loose text-white mb-6 min-h-[80px]">{currentQ.question}</p>
            <div className="grid grid-cols-2 gap-3">
              {currentQ.options.map((option, idx) => (
                <button key={idx} onClick={() => handleSubmit(idx.toString())} disabled={hasStarted === false || timeLeft <= 0}
                  className="group relative py-4 px-4 rounded-xl text-right text-base font-medium border-2 border-transparent transition-all duration-200 disabled:bg-gray-800 hover:border-white/50 hover:bg-white/5 cursor-pointer active:scale-95">
                  <span className="absolute top-2 right-2 font-mono font-bold text-xs opacity-40">{String.fromCharCode(65 + idx)}</span>
                  <span>{option}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      <footer className="shrink-0 bg-black/90 p-4 border-t border-white/10 grid grid-cols-3 gap-4 sticky bottom-0 z-20 backdrop-blur-xl">
        <div className="text-center"><div className="text-2xl font-bold text-[#006d37]">{crisisState.score}</div><div className="text-[10px] text-gray-500">صحيح</div></div>
        <div className="text-center"><Clock className={`w-5 h-5 mx-auto mb-1 ${timeLeft <= 10 ? 'animate-spin text-red-500' : 'text-gray-400'}`} /><div className={`font-mono text-lg font-bold ${getColorClass()}`}>{timeLeft}</div></div>
        <div className="text-center"><div className="text-2xl font-bold text-red-500">{crisisState.totalQuestionCount - crisisState.score}</div><div className="text-[10px] text-gray-500">خطأ</div></div>
      </footer>
    </div>
  );
}
