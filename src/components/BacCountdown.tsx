import { Clock, AlertTriangle, ShieldAlert, Zap, Coffee } from 'lucide-react';
import { calculateCountdown, type CountdownResult } from '../utils/countdownEngine';

const LEVEL_ICONS = { detendue: Coffee, plan: Clock, action: Zap, crisis: AlertTriangle, urgente: ShieldAlert };

interface BacCountdownProps { className?: string; onClick?: () => void; }

export default function BacCountdown({ className = '', onClick }: BacCountdownProps) {
  const result: CountdownResult = calculateCountdown();
  const IconComponent = LEVEL_ICONS[result.level];
  return (
    <button onClick={onClick || undefined}
      className={`w-full group relative overflow-hidden rounded-2xl p-4 shadow-sm border transition-all duration-300 cursor-pointer ${result.level === 'urgente' ? 'animate-pulse bg-[#991b1b]/10 border-red-500/30 hover:bg-[#991b1b]/20' : ''} ${className}`}
      style={{ backgroundColor: `${result.badgeColor}08` }}>
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at center, white 0%, transparent 100%)' }} />
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <IconComponent className="w-6 h-6" style={{ color: result.badgeColor }} stroke="currentColor" fill="none" strokeWidth={2.25} />
          <span className="font-extrabold text-sm" style={{ color: result.badgeColor }}>{result.title}</span>
        </div>
        <div className="flex flex-col items-end gap-0.5">
          <span className="text-xs font-bold tabular-nums tracking-widest font-mono" style={{ color: result.level === 'urgente' ? '#ef4444' : '#334155' }}>
            {result.timeLeft.days < 10 ? `${result.timeLeft.days}j ${result.timeLeft.hours}:${String(result.timeLeft.minutes).padStart(2, '0')}` : `${result.timeLeft.days} يوم`}
          </span>
        </div>
      </div>
      <div className="mt-2 pt-2 border-t border-white/20">
        <p className={`text-[11px] leading-tight ${result.level === 'urgente' ? 'text-red-500 italic font-medium' : 'text-gray-400'} transition-all`}>{result.message}</p>
        <p className="text-[10px] mt-1 font-bold underline decoration-dotted cursor-pointer" style={{ color: result.badgeColor }}>💡 {result.recommendation}</p>
      </div>
      <div className="w-full h-1 bg-black/20 rounded-full mt-3 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-1000 ease-linear" style={{ width: result.timeLeft.days > 180 ? '20%' : result.timeLeft.days > 45 ? '50%' : result.timeLeft.days > 15 ? '75%' : '95%', backgroundColor: result.badgeColor }} />
      </div>
    </button>
  );
}
