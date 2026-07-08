import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, BrainCircuit, Trash2, GraduationCap } from 'lucide-react';
import {
  loadSession,
  resetSession,
  type BotSession,
} from '../utils/sessionManager';
import {
  handleDomainClick,
  processStudentInput,
} from '../utils/smartTutorEngine';
import { DOMAINS } from '../data/smartBotData';
import SmartBotMessage, { type BotMessageData } from './SmartBotMessage';

interface AITutorViewProps {
  onBackToDashboard?: () => void;
  onAwardXP?: (xp: number) => void;
}

const WELCOME_TEXT =
  'مرحباً بك يا بحّار المعرفة! أنا الأستاذ الذكي لـ **كنز العلوم** 🏴‍☠️.\n' +
  'أنا أستاذ محلي يعمل بدون إنترنت: أختار لك مجالاً، أشخّص مستواك بأسئلة QCM، أصحّح أخطاءك وأراجعها معك، وأعلّمك المنهجية.\n' +
  'ابدأ باختيار أحد المجالات الثلاثة أدناه.';

export default function AITutorView({ onBackToDashboard, onAwardXP }: AITutorViewProps) {
  const [session, setSession] = useState<BotSession>(() => loadSession());
  const [messages, setMessages] = useState<BotMessageData[]>([
    { id: 'welcome', sender: 'ai', text: WELCOME_TEXT },
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const showDomainCards = session.activeDomainId == null;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const appendExchange = (
    userText: string,
    aiText: string,
    quickActions?: string[],
    quiz?: BotMessageData['quiz'],
    sources?: BotMessageData['sources']
  ) => {
    const userMsg: BotMessageData = {
      id: `user_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      sender: 'user',
      text: userText,
    };
    const aiMsg: BotMessageData = {
      id: `ai_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      sender: 'ai',
      text: aiText,
      quickActions,
      quiz,
      sources,
    };
    setMessages((prev) => [...prev, userMsg, aiMsg]);
  };

  const handleDomainSelect = (domainId: number) => {
    const res = handleDomainClick(session, domainId);
    setSession(res.session);
    setMessages((prev) => [
      ...prev,
      {
        id: `ai_domain_${Date.now()}`,
        sender: 'ai',
        text: res.action.text,
        quickActions: res.action.quickActions,
      },
    ]);
  };

  const handleSend = (rawText: string) => {
    const trimmed = (rawText || '').trim();
    if (!trimmed) return;

    const res = processStudentInput(session, trimmed);
    setSession(res.session);
    appendExchange(trimmed, res.action.text, res.action.quickActions, res.action.quiz, res.action.sources);

    if (res.action.reward && res.action.reward.xpGained > 0) {
      onAwardXP?.(res.action.reward.xpGained);
    }
  };

  const handleQuickAction = (action: string) => {
    handleSend(action);
  };

  const handleAnswer = (letter: string) => {
    handleSend(letter);
  };

  const handleClear = () => {
    const fresh = resetSession();
    setSession(fresh);
    setMessages([{ id: 'welcome', sender: 'ai', text: WELCOME_TEXT }]);
    setInput('');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] md:h-[calc(100vh-100px)] bg-[#ffffff] border border-[#e2dabf]/60 rounded-3xl shadow-sm overflow-hidden font-sans">
      <div className="bg-[#fff9ed] border-b border-[#e2dabf]/60 px-5 py-4 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-[#006d37]/10 rounded-full blur-sm" />
            <div className="w-10 h-10 rounded-full bg-[#006d37] text-white flex items-center justify-center text-xl relative">
              🧠
            </div>
          </div>
          <div>
            <h3 className="font-extrabold text-base text-[#006d37] flex items-center gap-1.5">
              <span>الأستاذ الذكي (كنز العلوم)</span>
              <BrainCircuit className="w-4 h-4 text-[#944a00]" />
            </h3>
            <span className="text-[10px] text-[#506072] font-semibold block">
              أستاذ محلي - يعمل بدون إنترنت
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleClear}
          className="p-2.5 rounded-xl hover:bg-[#ba1a1a]/10 text-[#ba1a1a] transition-all cursor-pointer"
          title="إعادة تعيين الجلسة"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-[#fcf3d8]/10">
        {messages.map((msg) => (
          <SmartBotMessage
            key={msg.id}
            message={msg}
            onQuickAction={handleQuickAction}
            onAnswer={handleAnswer}
          />
        ))}

        {showDomainCards && (
          <div className="ml-auto max-w-[90%] space-y-2">
            <div className="flex items-center gap-2 mb-1 text-[#006d37] font-bold text-sm">
              <Sparkles className="w-4 h-4 text-[#944a00]" />
              <span>اختر مجالاً لبدء جلسة المراجعة:</span>
            </div>
            {DOMAINS.map((domain) => (
              <button
                key={domain.id}
                type="button"
                onClick={() => handleDomainSelect(domain.id)}
                className="w-full text-right px-4 py-3 rounded-2xl bg-[#ffffff] border border-[#e2dabf] hover:border-[#006d37] hover:shadow-sm transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-2xl">{domain.emoji}</span>
                  <span className="text-sm font-bold text-[#1f1c0b] group-hover:text-[#006d37] transition-colors">
                    {domain.title}
                  </span>
                </div>
                <p className="text-[11px] text-[#506072] leading-relaxed pr-9">{domain.subtitle}</p>
                <div className="flex flex-wrap gap-1 mt-2 pr-9">
                  {domain.menuBullets.map((b, i) => (
                    <span
                      key={i}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-[#006d37]/10 text-[#006d37] font-semibold"
                    >
                      {b}
                    </span>
                  ))}
                </div>
              </button>
            ))}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-[#e2dabf]/60 shrink-0 bg-[#ffffff]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(input);
            setInput('');
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="اسأل الأستاذ الذكي أو اكتب إجابتك (A/B/C/D)..."
            className="flex-1 px-4 h-12 rounded-xl bg-[#f3f4f5] border border-transparent focus:border-[#006d37] focus:bg-[#ffffff] text-sm focus:outline-none transition-all placeholder:text-[#506072]/60"
          />
          <button
            type="submit"
            className="w-12 h-12 bg-[#006d37] hover:bg-[#00562b] text-[#ffffff] rounded-xl flex items-center justify-center cursor-pointer transition-colors"
            title="إرسال"
          >
            <Send className="w-5 h-5 rotate-180" />
          </button>
        </form>
      </div>
    </div>
  );
}
