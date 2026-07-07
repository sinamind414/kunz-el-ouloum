import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Sparkles, BookOpen, AlertCircle, Trash2, BrainCircuit, CheckCircle2, XCircle, ChevronDown } from 'lucide-react';
import { ChatMessage } from '../types';
import { MASCOT_URL } from '../data';
import {
  answerTutorQuestion,
  gradeTutorQuizAnswer,
  getTutorDomainCards,
  getTutorQuickSuggestions,
  type SmartTutorReply,
  type TutorQuizPrompt,
} from '../utils/smartTutorEngine';

interface AITutorViewProps {
  onBackToDashboard?: () => void;
}

export default function AITutorView({ onBackToDashboard }: AITutorViewProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: "مرحباً بك يا بحار المعرفة! أنا المرشد الذكي لـ **كنز العلوم** 🏴‍☠️.\n\nأنا هنا لأبسط لك كل ما يتعلق بعلوم الطبيعة والحياة للبكالوريا. اسألني عن آليات تركيب البروتين، أو بنيته الفراغية وسلوكه الحمقلي، أو آليات الاستجابة المناعية وتفاصيل الذات واللاذات!\n\nما هو موضوع كنزنا اليوم؟",
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentReply, setCurrentReply] = useState<SmartTutorReply | null>(null);
  const [selectedQuiz, setSelectedQuiz] = useState<TutorQuizPrompt | null>(null);
  const [quizResult, setQuizResult] = useState<SmartTutorReply | null>(null);
  const [showDomainCards, setShowDomainCards] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, currentReply, quizResult]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    setError(null);
    setShowDomainCards(false);
    setQuizResult(null);
    setSelectedQuiz(null);

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
      await new Promise(r => setTimeout(r, 300 + Math.random() * 400));

      const reply = answerTutorQuestion(textToSend);
      setCurrentReply(reply);

      const aiMsg: ChatMessage = {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        text: reply.text,
        timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiMsg]);
      setSelectedQuiz(reply.quiz || null);
    } catch (err: any) {
      console.error(err);
      setError("تعذر الحصول على إجابة من المرشد الذكي. يرجى إعادة المحاولة.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuizAnswer = (quiz: TutorQuizPrompt, selectedIndex: number) => {
    const result = gradeTutorQuizAnswer(quiz, selectedIndex);
    setQuizResult(result);

    const resultMsg: ChatMessage = {
      id: `quiz_${Date.now()}`,
      sender: 'ai',
      text: result.text,
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, resultMsg]);
    setSelectedQuiz(null);
  };

  const handleClear = () => {
    if (window.confirm("هل تريد مسح سجل المحادثة والبدء من جديد؟")) {
      setMessages([
        {
          id: 'welcome',
          sender: 'ai',
          text: "مرحباً بك مجدداً يا بحار المعرفة! أنا مستعد لأسئلتك الجديدة حول مقرر العلوم الطبيعية للبكالوريا. ما هو الكنز العلمي الذي تود استكشافه الآن؟",
          timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setError(null);
      setCurrentReply(null);
      setSelectedQuiz(null);
      setQuizResult(null);
      setShowDomainCards(true);
    }
  };

  const domainCards = getTutorDomainCards();
  const suggestions = getTutorQuickSuggestions();

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
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%23006d37" width="100" height="100" rx="50"/><text x="50" y="65" text-anchor="middle" fill="white" font-size="50">🏴‍☠️</text></svg>';
              }}
            />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-[#006d37] flex items-center gap-1.5">
              <span>المرشد الذكي (الأستاذ كنز العلوم)</span>
              <BrainCircuit className="w-4 h-4 text-[#944a00]" />
            </h3>
            <span className="text-[10px] text-[#506072] font-semibold block">مساعد ذكي محلي - يعمل بدون إنترنت</span>
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
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-[#fcf3d8]/10">
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
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%23006d37" width="100" height="100" rx="50"/><text x="50" y="65" text-anchor="middle" fill="white" font-size="50">🏴‍☠️</text></svg>';
                    }}
                  />
                </div>
              )}

              {/* Message Bubble text content */}
              <div className="space-y-1">
                <div 
                  className={`p-4 rounded-2xl text-sm leading-relaxed ${
                    msg.sender === 'user' 
                      ? 'bg-[#006d37] text-[#ffffff] rounded-tl-none font-medium' 
                      : 'bg-[#ffffff] text-[#1f1c0b] border border-[#e2dabf]/60 rounded-tr-none shadow-sm'
                  }`}
                >
                  <div className="whitespace-pre-wrap space-y-2">
                    {msg.text.split('\n').map((line, lIdx) => {
                      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
                        const content = line.trim().substring(2);
                        return <li key={lIdx} className="list-disc list-inside ml-2">{renderBoldText(content)}</li>;
                      }
                      return <p key={lIdx}>{renderBoldText(line)}</p>;
                    })}
                  </div>
                </div>
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
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%23006d37" width="100" height="100" rx="50"/><text x="50" y="65" text-anchor="middle" fill="white" font-size="50">🏴‍☠️</text></svg>';
                }}
              />
            </div>
            <div className="bg-[#ffffff] border border-[#e2dabf]/60 p-4 rounded-2xl rounded-tr-none shadow-sm flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#006d37] animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-2 h-2 rounded-full bg-[#006d37] animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-2 h-2 rounded-full bg-[#006d37] animate-bounce"></span>
            </div>
          </motion.div>
        )}

        {/* Interactive Quiz Prompt */}
        {selectedQuiz && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="ml-auto max-w-[85%]"
          >
            <div className="bg-[#fff9ed] border-2 border-[#006d37]/20 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="w-4 h-4 text-[#006d37]" />
                <span className="text-xs font-bold text-[#006d37]">اختبر فهمك</span>
              </div>
              <p className="text-sm font-bold text-[#1f1c0b] mb-3">{selectedQuiz.questionText}</p>
              <div className="space-y-2">
                {selectedQuiz.options.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleQuizAnswer(selectedQuiz, idx)}
                    className="w-full text-right px-4 py-2.5 rounded-xl bg-[#ffffff] border border-[#e2dabf] hover:border-[#006d37] hover:bg-[#006d37]/5 text-sm font-medium text-[#1f1c0b] transition-all cursor-pointer"
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Quiz Result */}
        {quizResult && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="ml-auto max-w-[85%]"
          >
            <div className={`p-4 rounded-2xl text-sm leading-relaxed border ${
              quizResult.text.startsWith('✅') 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              <div className="whitespace-pre-wrap space-y-2">
                {quizResult.text.split('\n').map((line, lIdx) => {
                  if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
                    const content = line.trim().substring(2);
                    return <li key={lIdx} className="list-disc list-inside ml-2">{renderBoldText(content)}</li>;
                  }
                  return <p key={lIdx}>{renderBoldText(line)}</p>;
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* Sources Display */}
        {currentReply && currentReply.sources.length > 0 && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mr-auto max-w-[85%]"
          >
            <div className="bg-[#f9fafb] border border-[#e2dabf]/60 rounded-2xl p-3 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-3.5 h-3.5 text-[#506072]" />
                <span className="text-[10px] font-bold text-[#506072] uppercase tracking-wide">المصادر</span>
              </div>
              <div className="space-y-1">
                {currentReply.sources.map((source, idx) => (
                  <div key={idx} className="text-[11px] text-[#506072] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#006d37] shrink-0" />
                    <span className="font-medium">{source.title}</span>
                    <span className="text-[#9ca3af]">• {source.unitTitle}</span>
                    <span className="px-1.5 py-0.5 rounded-full bg-[#006d37]/10 text-[#006d37] text-[9px] font-bold">
                      {source.type === 'qcm'
                        ? 'QCM'
                        : source.type === 'lesson'
                          ? 'درس'
                          : source.type === 'book'
                            ? 'كتاب'
                            : source.type === 'methodology'
                              ? 'منهجية'
                              : source.type === 'card'
                                ? 'بطاقة'
                                : 'OPUS'}
                    </span>
                  </div>
                ))}
              </div>
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

      {/* Domain Cards */}
      {showDomainCards && messages.length <= 1 && (
        <div className="p-4 shrink-0 bg-[#fff9ed]/40 border-t border-[#e2dabf]/30">
          <span className="text-xs text-[#506072] font-bold block mb-2.5 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-[#944a00]" />
            <span>اختر مجالاً للبدء:</span>
          </span>
          <div className="grid grid-cols-1 gap-2">
            {domainCards.map((card) => (
              <button
                key={card.id}
                onClick={() => handleSend(card.title)}
                className="text-right px-4 py-3 rounded-xl bg-[#ffffff] border border-[#e2dabf] hover:border-[#006d37] hover:shadow-sm transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2 mb-1">
                  <div 
                    className="w-3 h-3 rounded-full shrink-0" 
                    style={{ backgroundColor: card.color }}
                  />
                  <span className="text-sm font-bold text-[#1f1c0b] group-hover:text-[#006d37] transition-colors">
                    {card.title}
                  </span>
                </div>
                <p className="text-[11px] text-[#506072] leading-relaxed pr-5">
                  {card.description}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Suggestion Chips Box */}
      {messages.length > 1 && !showDomainCards && (
        <div className="p-3 shrink-0 bg-[#fff9ed]/40 border-t border-[#e2dabf]/30">
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

// Basic formatter to bold markdown text (**text**)
function renderBoldText(text: string) {
  const parts = text.split('**');
  return parts.map((part, index) => 
    index % 2 === 1 
      ? <strong key={index} className="text-[#006d37] font-extrabold">{part}</strong> 
      : part
  );
}
