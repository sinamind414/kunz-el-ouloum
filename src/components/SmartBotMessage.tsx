import type { ReactNode } from 'react';
import type { QuizCardData } from './SmartBotQuizCard';
import SmartBotQuizCard from './SmartBotQuizCard';
import type { SourceRef, SourceType } from '../utils/smartTutorEngine';

export interface BotMessageData {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  quickActions?: string[];
  quiz?: QuizCardData;
  sources?: SourceRef[];
}

interface SmartBotMessageProps {
  message: BotMessageData;
  onQuickAction: (action: string) => void;
  onAnswer: (letter: string) => void;
}

const SOURCE_META: Record<SourceType, { label: string; cls: string }> = {
  card: { label: 'بطاقة', cls: 'bg-[#006d37]/10 text-[#006d37]' },
  book: { label: 'كتاب', cls: 'bg-[#944a00]/10 text-[#944a00]' },
  opus: { label: 'درس', cls: 'bg-[#1d4ed8]/10 text-[#1d4ed8]' },
  methodology: { label: 'منهجية', cls: 'bg-[#7c3aed]/10 text-[#7c3aed]' },
  domain: { label: 'مجال', cls: 'bg-[#006d37]/10 text-[#006d37]' },
  quiz: { label: 'اختبار', cls: 'bg-[#006d37]/10 text-[#006d37]' },
  out: { label: 'خارج البرنامج', cls: 'bg-[#ba1a1a]/10 text-[#ba1a1a]' },
};

function renderBold(text: string): React.ReactNode {
  const parts = text.split('**');
  return parts.map((part, index) =>
    index % 2 === 1 ? (
      <strong key={index} className="font-extrabold text-[#006d37]">{part}</strong>
    ) : (
      part
    )
  );
}

function renderText(text: string) {
  return text.split('\n').map((line, lIdx) => {
    if (line.trim() === '') return <div key={lIdx} className="h-2" />;
    if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      const content = line.trim().substring(2);
      return (
        <li key={lIdx} className="list-disc list-inside ml-2">
          {renderBold(content)}
        </li>
      );
    }
    return <p key={lIdx}>{renderBold(line) || ' '}</p>;
  });
}

export default function SmartBotMessage({ message, onQuickAction, onAnswer }: SmartBotMessageProps) {
  const isUser = message.sender === 'user';

  return (
    <div dir="rtl" className={`flex gap-3 max-w-[90%] ${isUser ? 'mr-auto flex-row-reverse' : 'ml-auto'}`}>
      <div className="space-y-1">
        <div
          className={`p-4 rounded-2xl text-sm leading-relaxed ${
            isUser
              ? 'bg-[#006d37] text-[#ffffff] rounded-tl-none font-medium'
              : 'bg-[#ffffff] text-[#1f1c0b] border border-[#e2dabf]/60 rounded-tr-none shadow-sm'
          }`}
        >
          <div className="whitespace-pre-wrap space-y-2">{renderText(message.text)}</div>

          {message.quiz && (
            <SmartBotQuizCard
              key={message.quiz.id}
              quiz={message.quiz}
              onAnswer={onAnswer}
            />
          )}
        </div>

        {!isUser && message.quickActions && message.quickActions.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {message.quickActions.map((action, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onQuickAction(action)}
                className="bg-[#ffffff] hover:bg-[#fed65b]/20 border border-[#e2dabf] px-3 py-1.5 rounded-xl text-xs font-bold text-[#006d37] hover:text-[#00562b] cursor-pointer transition-colors"
              >
                {action}
              </button>
            ))}
          </div>
        )}

        {!isUser && message.sources && message.sources.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            <span className="text-[10px] font-bold text-[#506072] self-center">📚 المصادر:</span>
            {message.sources.map((src, idx) => {
              const meta = SOURCE_META[src.type];
              return (
                <span
                  key={idx}
                  title={src.title}
                  className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${meta.cls}`}
                >
                  {meta.label}: {src.title}
                </span>
              );
            })}
          </div>
        )}

        {isUser && message.quickActions && message.quickActions.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1 justify-end">
            {message.quickActions.map((action, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onQuickAction(action)}
                className="bg-[#006d37]/5 hover:bg-[#006d37]/10 border border-[#006d37]/20 px-3 py-1.5 rounded-xl text-xs font-bold text-[#006d37] cursor-pointer transition-colors"
              >
                {action}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
