import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Sparkles, AlertCircle, Trash2, BrainCircuit, Target, Stethoscope, Swords, ClipboardList, Globe2 } from 'lucide-react';
import { ChatMessage } from '../types';
import { MASCOT_URL } from '../data';

import { processStudentInput, getDailyMission, type TutorRewardDetails, type EngineResult } from '../smartTutorEngine';
import { DOMAINS } from '../data/smartBotData';
import { loadSession, saveSession, resetSession, type BotSession } from '../utils/sessionManager';

interface AITutorViewProps {
  onBackToDashboard?: () => void;
  /** Propagation des XP gagnés dans le tutor vers le UserProgress global de l'App.
   *  details (3e param) porte la fin d'activité → journalisation serveur (rec #2 de l'audit). */
  onXPGained?: (xpGained: number, questionsAnswered: number, details?: TutorRewardDetails) => void;
}

const JOURNEY_BUTTONS = [
  { label: 'مهمة اليوم', icon: Target, testId: 'journey-daily-mission' },
  { label: 'اختبار تشخيصي', icon: Stethoscope, testId: 'journey-diagnostic' },
  { label: 'تحدي BAC', icon: Swords, testId: 'journey-boss-fight' },
  { label: 'راجع أخطائي السابقة', icon: ClipboardList, testId: 'journey-review-mistakes' },
  { label: 'القائمة الرئيسية', icon: Globe2, testId: 'journey-home' },
];

const WELCOME_TEXT = "مرحباً بك يا بحار المعرفة! أنا المرشد الذكي لـ **كنز العلوم** 🏴‍☠️.\n\nأنا هنا لأبسط لك كل ما يتعلق بعلوم الطبيعة والحياة للبكالوريا. اسألني عن آليات تركيب البروتين، أو بنيته الفراغية وسلوكه الحمقلي، أو آليات الاستجابة المناعية وتفاصيل الذات واللاذات!\n\nاختر مجالاً أو أحد أزرار الرحلة أدناه للبدء:";

export default function AITutorView({ onBackToDashboard, onXPGained }: AITutorViewProps) {
  const [session, setSession] = useState<BotSession>(() => loadSession());
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: WELCOME_TEXT,
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      action: { quickActions: DOMAINS.map((d) => d.title) },
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const runEngine = (result: EngineResult) => {
    setSession(result.session);
    saveSession(result.session);
    const aiMsg: ChatMessage = {
      id: `ai_${Date.now()}`,
      sender: 'ai',
      text: result.action.text,
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      action: {
        quickActions: result.action.quickActions,
        quiz: result.action.quiz as NonNullable<ChatMessage['action']>['quiz'],
        sources: result.action.sources as NonNullable<ChatMessage['action']>['sources'],
        confidence: result.action.confidence,
        reward: result.action.reward,
      },
    };
    setMessages((prev) => [...prev, aiMsg]);
    // Propagation XP vers le UserProgress global (badge header + stats).
    // questionsAnswered = 1 seulement quand le moteur clôture un quiz (reward présent).
    if (result.action.reward && result.action.reward.xpGained > 0) {
      onXPGained?.(result.action.reward.xpGained, 1, {
        kind: result.action.reward.kind ?? 'quiz',
        score: result.action.reward.score ?? 0,
        total: result.action.reward.total ?? 0,
        domain: result.action.reward.domain ?? '',
      });
    }
  };

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    setError(null);
    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Moteur local offline — UNIQUE source (audit T3 : la route /api/chat
      // n'existe pas côté serveur ; le fetch mort renvoyait 404 à l'élève).
      // Quand le moteur ne sait pas, il le dit honnêtement dans son texte.
      const result = processStudentInput(session, textToSend);
      runEngine(result);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "تعذر الحصول على إجابة من المرشد الذكي. يرجى إعادة المحاولة.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleJourneyClick = (label: string) => {
    if (label === 'القائمة الرئيسية') {
      const fresh = resetSession();
      const aiMsg: ChatMessage = {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        text: '↩️ رجعنا إلى القائمة الرئيسية. اختر مجالاً لبدء جلسة مراجعة:',
        timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
        action: { quickActions: DOMAINS.map((d) => d.title) },
      };
      setSession(fresh);
      setMessages((prev) => [...prev, {
        id: `user_${Date.now()}`,
        sender: 'user',
        text: label,
        timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      }, aiMsg]);
      return;
    }

    if (label === 'مهمة اليوم') {
      setIsLoading(true);
      try {
        const userMsg: ChatMessage = {
          id: `user_${Date.now()}`,
          sender: 'user',
          text: label,
          timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, userMsg]);
        const result = getDailyMission(session);
        runEngine(result);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Les autres entrées du parcours passent par le moteur standard :
    // « اختبار تشخيصي » / « تحدي BAC » / « راجع أخطائي السابقة » sont
    // des commandes nativement reconnues par processStudentInput.
    handleSend(label);
  };

  const handleQuizAnswer = (optionLabel: string) => {
    handleSend(optionLabel);
  };

  const handleClear = () => {
    if (window.confirm("هل تريد مسح سجل المحادثة والبدء من جديد؟")) {
      const fresh = resetSession();
      setSession(fresh);
      setMessages([
        {
          id: 'welcome',
          sender: 'ai',
          text: "مرحباً بك مجدداً يا بحار المعرفة! أنا مستعد لأسئلتك الجديدة حول مقرر العلوم الطبيعية للبكالوريا. ما هو الكنز العلمي الذي تود استكشافه الآن؟",
          timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
          action: { quickActions: DOMAINS.map((d) => d.title) },
        }
      ]);
      setError(null);
    }
  };

  // Quick suggestions based on official high-scoring syllabus keywords
  const suggestions = [
    "اشرح لي آليات عملية الاستنساخ بالتفصيل",
    "ما معنى الخاصية الحمقلية (الأمفوتيرية)؟",
    "لخص دور اللمفاويات LT4 في تنشيط المناعة",
    "ما هي مستويات البنية الفراغية للبروتين؟"
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] md:h-[calc(100vh-100px)] bg-[#ffffff] border border-[#e2dabf]/60 rounded-3xl shadow-sm overflow-hidden font-sans">

      {/* Chat Title bar */}
      <div className="bg-[#fff9ed] border-b border-[#e2dabf]/60 px-5 py-4 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-[#006d37]/10 rounded-full blur-sm" />
            <img
              src={MASCOT_URL}
              alt="Mascot Avatar"
              className="w-10 h-10 rounded-full object-contain border border-[#006d37]/10 relative bg-[#ffffff] p-1"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-[#006d37] flex items-center gap-1.5">
              <span>المرشد الذكي (الأستاذ كنز العلوم)</span>
              <BrainCircuit className="w-4 h-4 text-[#944a00]" />
            </h3>
            <span className="text-[10px] text-[#506072] font-semibold block">مساعد ذكاء اصطناعي تفاعلي وموجه لمنهج البكالوريا</span>
          </div>
        </div>

        <button
          onClick={handleClear}
          className="p-2.5 rounded-xl hover:bg-[#ba1a1a]/10 text-[#ba1a1a] transition-all cursor-pointer"
          title="مسح المحادثة"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Scroll area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-[#fcf3d8]/10" data-testid="tutor-messages">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'mr-auto flex-row-reverse' : 'ml-auto'}`}
            >
              {/* Avatar on message side */}
              {msg.sender === 'ai' && (
                <div className="shrink-0">
                  <img
                    src={MASCOT_URL}
                    alt="AI Avatar"
                    className="w-8 h-8 rounded-full border border-[#e2dabf]/50 p-0.5 bg-[#ffffff] object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}

              {/* Message Bubble text content */}
              <div className="space-y-1 w-full">
                <div
                  className={`p-4 rounded-2xl text-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-[#006d37] text-[#ffffff] rounded-tl-none font-medium'
                      : 'bg-[#ffffff] text-[#1f1c0b] border border-[#e2dabf]/60 rounded-tr-none shadow-sm'
                  }`}
                >
                  {/* Handle basic markdown formatting (bullet points, bold texts) */}
                  <div className="whitespace-pre-wrap space-y-2">
                    {msg.text.split('\n').map((line, lIdx) => {
                      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
                        const content = line.trim().substring(2);
                        return <li key={lIdx} className="list-disc list-inside ml-2">{renderBoldText(content)}</li>;
                      }
                      return <p key={lIdx}>{renderBoldText(line)}</p>;
                    })}
                  </div>

                  {/* — Rendu riche du moteur (T2) — */}

                  {/* Quiz interactif : boutons A/B/C/D */}
                  {msg.action?.quiz && (
                    <div className="mt-3 pt-3 border-t border-[#e2dabf]/40 space-y-2" data-testid={`tutor-quiz-${msg.action.quiz.id}`}>
                      <p className="text-xs font-bold text-[#944a00] flex items-center gap-1.5">
                        <Target className="w-3.5 h-3.5" />
                        <span>اختر إجابتك:</span>
                      </p>
                      {msg.action.quiz.options.map((opt, oIdx) => (
                        <button
                          key={oIdx}
                          onClick={() => handleQuizAnswer(['A', 'B', 'C', 'D'][oIdx])}
                          className="w-full text-right px-3 py-2 rounded-xl bg-[#fff9ed] hover:bg-[#fed65b]/30 border border-[#e2dabf] text-xs font-bold text-[#1f1c0b] cursor-pointer transition-colors flex items-center gap-2"
                          data-testid={`quiz-option-${oIdx}`}
                        >
                          <span className="shrink-0 w-6 h-6 rounded-full bg-[#006d37] text-[#ffffff] flex items-center justify-center text-[10px] font-extrabold">
                            {['A', 'B', 'C', 'D'][oIdx]}
                          </span>
                          <span>{opt}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Sources + traçabilité */}
                  {msg.action?.sources && msg.action.sources.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-[#e2dabf]/40 flex flex-wrap items-center gap-1.5" data-testid="tutor-sources">
                      {msg.action.sources.map((src, sIdx) => (
                        <span
                          key={sIdx}
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                            src.type === 'out_of_scope'
                              ? 'bg-[#ffdad6] text-[#ba1a1a] border-[#ba1a1a]/20'
                              : 'bg-[#fff9ed] text-[#506072] border-[#e2dabf]/50'
                          }`}
                        >
                          {SOURCE_LABELS[src.type] || 'المصدر'}: {src.title}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Confiance + récompense */}
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {typeof msg.action?.confidence === 'number' && (
                      <span className="text-[9px] font-bold text-[#506072] bg-[#f3f4f5] px-2 py-0.5 rounded-full">
                        الثقة: {msg.action.confidence}%
                      </span>
                    )}
                    {msg.action?.reward && msg.action.reward.xpGained > 0 && (
                      <span className="text-[9px] font-extrabold text-[#006d37] bg-[#006d37]/10 px-2 py-0.5 rounded-full" data-testid="tutor-reward">
                        ⚡ +{msg.action.reward.xpGained} XP
                      </span>
                    )}
                  </div>
                </div>

                {/* Quick actions cliquables du moteur */}
                {msg.sender === 'ai' && msg.action?.quickActions && msg.action.quickActions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-1" data-testid="tutor-quick-actions">
                    {msg.action.quickActions.map((qa, qIdx) => (
                      <button
                        key={qIdx}
                        onClick={() => handleSend(qa)}
                        className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-[#fff9ed] hover:bg-[#fed65b]/40 border border-[#e2dabf]/70 text-[#006d37] cursor-pointer transition-colors"
                        data-testid={`quick-action-${qIdx}`}
                      >
                        {qa}
                      </button>
                    ))}
                  </div>
                )}
                <span className={`text-[9px] text-[#506072] block ${msg.sender === 'user' ? 'text-left' : 'text-right'}`}>
                  {msg.timestamp}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Loading Indicator */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-3 max-w-[80%] ml-auto"
          >
            <div className="shrink-0">
              <img
                src={MASCOT_URL}
                alt="AI Avatar"
                className="w-8 h-8 rounded-full border border-[#e2dabf]/50 p-0.5 bg-[#ffffff] object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="bg-[#ffffff] border border-[#e2dabf]/60 p-4 rounded-2xl rounded-tr-none shadow-sm flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#006d37] animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-2 h-2 rounded-full bg-[#006d37] animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-2 h-2 rounded-full bg-[#006d37] animate-bounce"></span>
            </div>
          </motion.div>
        )}

        {/* Error Notification */}
        {error && (
          <div className="p-4 bg-[#ffdad6] text-[#ba1a1a] rounded-2xl text-xs flex items-center gap-2 border border-[#ba1a1a]/10 max-w-md mx-auto">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestion Chips Box */}
      {messages.length === 1 && (
        <div className="p-4 shrink-0 bg-[#fff9ed]/40 border-t border-[#e2dabf]/30">
          <span className="text-xs text-[#506072] font-bold block mb-2.5 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-[#944a00]" />
            <span>مواضيع مقترحة للمراجعة السريعة:</span>
          </span>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((sug, sIdx) => (
              <button
                key={sIdx}
                onClick={() => handleSend(sug)}
                className="bg-[#ffffff] hover:bg-[#fed65b]/20 border border-[#e2dabf] px-3 py-1.5 rounded-xl text-xs font-bold text-[#006d37] hover:text-[#00562b] cursor-pointer transition-colors"
              >
                {sug}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Journey Bar — parcours guidé (audit T2) */}
      <div className="px-4 py-2.5 shrink-0 bg-[#fff9ed]/60 border-t border-[#e2dabf]/40 flex items-center gap-2 overflow-x-auto">
        {JOURNEY_BUTTONS.map(({ label, icon: Icon, testId }) => (
          <button
            key={label}
            onClick={() => handleJourneyClick(label)}
            className="flex items-center gap-1.5 shrink-0 text-[11px] font-extrabold px-2.5 py-1.5 rounded-xl bg-[#ffffff] hover:bg-[#fed65b]/30 border border-[#e2dabf] text-[#006d37] cursor-pointer transition-colors"
            data-testid={testId}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Input Form Footer */}
      <div className="p-4 border-t border-[#e2dabf]/60 shrink-0 bg-[#ffffff]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(input);
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="اسأل المرشد الذكي عن أي سؤال في مادة العلوم..."
            className="flex-1 px-4 h-12 rounded-xl bg-[#f3f4f5] border border-transparent focus:border-[#006d37] focus:bg-[#ffffff] text-sm focus:outline-none transition-all placeholder:text-[#506072]/60"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="w-12 h-12 bg-[#006d37] hover:bg-[#00562b] disabled:opacity-40 text-[#ffffff] rounded-xl flex items-center justify-center cursor-pointer transition-colors"
          >
            <Send className="w-5 h-5 rotate-180" />
          </button>
        </form>
      </div>

    </div>
  );
}

const SOURCE_LABELS: Record<string, string> = {
  internal_card: 'بطاقة معرفة',
  legacy_card: 'بطاقة دراسة',
  book: 'بنك الأسئلة',
  opus: 'الدروس',
  methodology: 'المنهجية',
  guide: 'دليل الدراسة',
  domain: 'مجال',
  quiz: 'اختبار',
  out_of_scope: 'خارج المقرر',
};

// Basic formatter to bold markdown text (**text**)
function renderBoldText(text: string) {
  const parts = text.split('**');
  return parts.map((part, index) =>
    index % 2 === 1
      ? <strong key={index} className="text-[#006d37] font-extrabold">{part}</strong>
      : part
  );
}
