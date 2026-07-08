import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, BrainCircuit, Trash2, Target, Lock, Trophy, X, Eye, Zap } from 'lucide-react';
import { loadSession, resetSession, completeDailyMission, type BotSession } from '../utils/sessionManager';
import { handleDomainClick, processStudentInput, getDailyMission } from '../utils/smartTutorEngine';
import { DOMAINS } from '../data/smartBotData';
import SmartBotMessage, { type BotMessageData } from './SmartBotMessage';
import { calculateRadarScore, getRadarStatus } from '../utils/radarEngine';
import { generateBacPrediction } from '../utils/prophetEngine';
import BacCountdown from './BacCountdown';
import CrisisRoomView from './CrisisRoomView';
import { calculateCountdown } from '../utils/countdownEngine';
import type { UserProgress } from '../types';

interface AITutorViewProps {
  onBackToDashboard?: () => void;
  onAwardXP?: (xp: number) => void;
  globalProgress?: UserProgress;
  onUnlockWebPlatform?: () => void;
}

const WELCOME_TEXT = 'مرحباً بك يا بحّار المعرفة! أنا الأستاذ الذكي لـ **كنز العلوم** 🏴‍☠️.\nأنا أستاذ محلي يعمل بدون إنترنت: أختار لك مجالاً، أشّص مستواك بأسئلة QCM، أصحّح أخطاءك وأراجعها معك، وأعلّمك المنهجية.\nابدأ باختيار أحد المجالات الثلاثة أدناه.';

export default function AITutorView({ onBackToDashboard, onAwardXP, globalProgress, onUnlockWebPlatform }: AITutorViewProps) {
  const [session, setSession] = useState<BotSession>(() => loadSession());
  const [messages, setMessages] = useState<BotMessageData[]>([{ id: 'welcome', sender: 'ai', text: WELCOME_TEXT }]);
  const [input, setInput] = useState('');
  const [showPaywall, setShowPaywall] = useState(false);
  const [missionActive, setMissionActive] = useState(false);
  const [showCrisisRoom, setShowCrisisRoom] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const showDomainCards = session.activeDomainId == null;
  const radarScore = globalProgress ? calculateRadarScore(globalProgress, session) : 0;
  const radarStatus = getRadarStatus(radarScore);

  useEffect(() => { if (radarScore >= 80) setShowPaywall(true); }, [radarScore]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const appendExchange = (
    userText: string,
    aiText: string,
    quickActions?: string[],
    quiz?: BotMessageData['quiz'],
    sources?: BotMessageData['sources']
  ) => {
    setMessages((prev) => [...prev,
      { id: `user_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`, sender: 'user', text: userText },
      { id: `ai_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`, sender: 'ai', text: aiText, quickActions, quiz, sources },
    ]);
  };

  const handleDomainSelect = (domainId: number) => {
    const res = handleDomainClick(session, domainId); setSession(res.session);
    setMessages((prev) => [...prev, { id: `ai_domain_${Date.now()}`, sender: 'ai', text: res.action.text, quickActions: res.action.quickActions }]);
  };

  const handleSend = (rawText: string) => {
    const trimmed = (rawText || '').trim(); if (!trimmed) return;
    const res = processStudentInput(session, trimmed); setSession(res.session);
    appendExchange(trimmed, res.action.text, res.action.quickActions, res.action.quiz, res.action.sources);
    if (res.action.reward && res.action.reward.xpGained > 0) onAwardXP?.(res.action.reward.xpGained);
    if (missionActive && res.action.quiz === undefined && res.action.reward) {
      if (session.lastMissionDate !== new Date().toISOString().split('T')[0]) {
        const newSession = completeDailyMission(res.session, session.lastMissionTopic || 'mission');
        setSession(newSession); setMissionActive(false); onAwardXP?.(15);
        setTimeout(() => setMessages((prev) => [...prev, { id: `ai_mission_done_${Date.now()}`, sender: 'ai', text: '🎯 **مهمة اليوم منجزة!** +15 XP إضافية. تعال غداً لمهمة جديدة.', quickActions: ['العودة للقائمة الرئيسية'] }]), 500);
      }
    }
  };

  const handleQuickAction = (action: string) => handleSend(action);
  const handleAnswer = (letter: string) => handleSend(letter);

  const handleClear = () => { const fresh = resetSession(); setSession(fresh); setMessages([{ id: 'welcome', sender: 'ai', text: WELCOME_TEXT }]); setInput(''); setMissionActive(false); };

  const handleDailyMission = () => {
    const res = getDailyMission(session); setSession(res.session);
    if (res.action.quiz) setMissionActive(true);
    setMessages((prev) => [...prev, { id: `ai_mission_${Date.now()}`, sender: 'ai', text: res.action.text, quickActions: res.action.quickActions, quiz: res.action.quiz }]);
  };

  const handleProphetClick = () => {
    if (!globalProgress) return;
    const p = generateBacPrediction(session, globalProgress);
    setMessages((prev) => [...prev, { id: `ai_prophet_${Date.now()}`, sender: 'ai',
      text: `🔮 **مكتب تنبؤات البكالوريا**\n\n📊 توقعاتنا لنتيجتك القادمة:\nمن **${p.minExpected}/20** إلى **${p.maxExpected}/20**\n(درجة الثقة: ${p.confidence})\n\n${p.inspirationalMessage}\n\n⚠️ **نقاط خطرة محتملة:**\n${p.criticalMistakes.map((m) => `- ${m}`).join('\n')}\n\n🎯 **خطة المعركة:**\n${p.battlePlan.map((s, i) => `${i + 1}. ${s}`).join('\n')}`,
      quickActions: ['ابدأ الخطة الآن', 'إعادة التنبؤ', 'العودة للقائمة الرئيسية'] }]);
  };

  const handleCountdownClick = () => {
    const info = calculateCountdown();
    if (info.level === 'crisis' || info.level === 'urgente') setShowCrisisRoom(true);
    else if (info.level === 'action') handleSend('مهمة اليوم');
    else if (info.level === 'plan') handleProphetClick();
    else appendExchange('📅', `📅 **الوقت المتبقي:** ${info.timeLeft.days} يوم\n\n${info.message}\n\n💡 ${info.recommendation}`);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] md:h-[calc(100vh-100px)] bg-[#ffffff] border border-[#e2dabf]/60 rounded-3xl shadow-sm overflow-hidden font-sans relative">
      <div className="bg-[#fff9ed] border-b border-[#e2dabf]/60 px-5 py-4 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative"><div className="absolute inset-0 bg-[#006d37]/10 rounded-full blur-sm" /><div className="w-10 h-10 rounded-full bg-[#006d37] text-white flex items-center justify-center text-xl relative">🧠</div></div>
          <div><h3 className="font-extrabold text-base text-[#006d37] flex items-center gap-1.5"><span>الأستاذ الذكي (كنز العلوم)</span><BrainCircuit className="w-4 h-4 text-[#944a00]" /></h3><span className="text-[10px] text-[#506072] font-semibold block">أستاذ محلي - يعمل بدون إنترنت</span></div>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={handleProphetClick} className="p-2.5 rounded-xl hover:bg-[#006d37]/10 text-[#006d37] transition-all cursor-pointer" title="التنبؤ بالمعدل"><Eye className="w-4 h-4" /></button>
          <button type="button" onClick={() => setShowCrisisRoom(true)} className="p-2.5 rounded-xl hover:bg-[#ba1a1a]/10 text-[#ba1a1a] transition-all cursor-pointer" title="غرفة العمليات"><Zap className="w-4 h-4" /></button>
          <button type="button" onClick={handleClear} className="p-2.5 rounded-xl hover:bg-[#ba1a1a]/10 text-[#ba1a1a] transition-all cursor-pointer" title="إعادة تعيين الجلسة"><Trash2 className="w-4 h-4" /></button>
        </div>
      </div>
      <div className="bg-white px-5 pt-3 shrink-0"><BacCountdown onClick={handleCountdownClick} /></div>
      <div className="bg-white border-b border-[#e2dabf]/60 px-5 py-3 flex items-center justify-between gap-4 shrink-0">
        <div className="flex-1 min-w-0">
          <div className="flex justify-between text-xs font-bold mb-1"><span className="text-[#506072]">رادار التحضير للبكالوريا</span><span style={{ color: radarStatus.color }} className="mr-2">{radarScore}%{radarScore >= 80 && <Lock className="w-3 h-3 inline mr-1" />} – {radarStatus.label}</span></div>
          <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden"><div className="h-full rounded-full transition-all duration-700" style={{ width: `${radarScore}%`, backgroundColor: radarStatus.color }} /></div>
        </div>
        <button onClick={handleDailyMission} className="flex items-center gap-1.5 bg-[#fff9ed] border border-[#944a00]/30 text-[#944a00] px-3 py-2 rounded-xl text-xs font-bold hover:bg-[#944a00]/10 transition-colors shrink-0"><Target className="w-4 h-4" />مهمة اليوم</button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-[#fcf3d8]/10">
        {messages.map((msg) => <SmartBotMessage key={msg.id} message={msg} onQuickAction={handleQuickAction} onAnswer={handleAnswer} />)}
        {showDomainCards && (
          <div className="ml-auto max-w-[90%] space-y-2">
            <div className="flex items-center gap-2 mb-1 text-[#006d37] font-bold text-sm"><Sparkles className="w-4 h-4 text-[#944a00]" /><span>اختر مجالاً لبدء جلسة المراجعة:</span></div>
            {DOMAINS.map((domain) => (
              <button key={domain.id} type="button" onClick={() => handleDomainSelect(domain.id)} className="w-full text-right px-4 py-3 rounded-2xl bg-[#ffffff] border border-[#e2dabf] hover:border-[#006d37] hover:shadow-sm transition-all cursor-pointer group">
                <div className="flex items-center gap-3 mb-1"><span className="text-2xl">{domain.emoji}</span><span className="text-sm font-bold text-[#1f1c0b] group-hover:text-[#006d37] transition-colors">{domain.title}</span></div>
                <p className="text-[11px] text-[#506072] leading-relaxed pr-9">{domain.subtitle}</p>
                <div className="flex flex-wrap gap-1 mt-2 pr-9">{domain.menuBullets.map((b, i) => <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-[#006d37]/10 text-[#006d37] font-semibold">{b}</span>)}</div>
              </button>
            ))}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t border-[#e2dabf]/60 shrink-0 bg-[#ffffff]">
        <form onSubmit={(e) => { e.preventDefault(); handleSend(input); setInput(''); }} className="flex gap-2">
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="اسأل الأستاذ الذكي أو اكتب إجابتك (A/B/C/D)..." className="flex-1 px-4 h-12 rounded-xl bg-[#f3f4f5] border border-transparent focus:border-[#006d37] focus:bg-[#ffffff] text-sm focus:outline-none transition-all placeholder:text-[#506072]/60" />
          <button type="submit" className="w-12 h-12 bg-[#006d37] hover:bg-[#00562b] text-[#ffffff] rounded-xl flex items-center justify-center cursor-pointer transition-colors" title="إرسال"><Send className="w-5 h-5 rotate-180" /></button>
        </form>
      </div>
      {showPaywall && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center relative">
            <button onClick={() => setShowPaywall(false)} className="absolute top-4 left-4 text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            <div className="text-5xl mb-4">🏆</div>
            <h3 className="text-xl font-extrabold text-[#006d37] mb-2">وصلت إلى 80% من التحضير!</h3>
            <p className="text-sm text-gray-600 mb-5 leading-relaxed">أنت الآن تتحكم في 80% من برنامج العلوم الطبيعية. مبروك! لكن للحصول على العلامة الكاملة (A1) في البكالوريا، تحتاج إلى الـ 20% المتبقية:<br /><br /><span className="text-xs text-gray-500">• تصحيح مواضيع البكالوريا بالفيديو<br />• مواضيع استثنائية متقدمة<br />• متابعة شخصية لإجاباتك المفتوحة</span></p>
            <button onClick={() => { if (onUnlockWebPlatform) onUnlockWebPlatform(); setShowPaywall(false); }} className="w-full flex items-center justify-center gap-2 bg-[#006d37] hover:bg-[#00562b] text-white font-bold py-3 rounded-xl transition-colors mb-3"><Trophy className="w-5 h-5" />افتح النسخة الكاملة (100%)</button>
            <button onClick={() => setShowPaywall(false)} className="w-full text-sm text-gray-500 hover:text-gray-700 py-2">متابعة المراجعة المجانية</button>
          </div>
        </div>
      )}
      {showCrisisRoom && (
        <div className="absolute inset-0 z-[100] flex flex-col bg-black/95 backdrop-blur-sm animate-in fade-in duration-300">
          <CrisisRoomView onBack={() => setShowCrisisRoom(false)} onAwardXP={onAwardXP} session={session} />
        </div>
      )}
    </div>
  );
}
