import { useState } from 'react';

export interface QuizCardData {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface SmartBotQuizCardProps {
  key?: string;
  quiz: QuizCardData;
  onAnswer: (letter: string) => void;
}

const LETTERS = ['A', 'B', 'C', 'D'];

export default function SmartBotQuizCard({ quiz, onAnswer }: SmartBotQuizCardProps) {
  const [locked, setLocked] = useState(false);

  const handleClick = (index: number) => {
    if (locked) return;
    setLocked(true);
    onAnswer(LETTERS[index]);
  };

  return (
    <div dir="rtl" className="mt-3 bg-[#fff9ed] border-2 border-[#006d37]/20 rounded-2xl p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-bold text-[#006d37]">🧪 اختبر فهمك</span>
      </div>
      <p className="text-sm font-bold text-[#1f1c0b] mb-3 leading-relaxed">{quiz.question}</p>
      <div className="space-y-2">
        {quiz.options.map((option, idx) => (
          <button
            key={idx}
            type="button"
            disabled={locked}
            onClick={() => handleClick(idx)}
            className={`w-full text-right px-4 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer border ${
              locked
                ? 'bg-[#f3f4f5] border-[#e2dabf] text-[#506072]'
                : 'bg-[#ffffff] border-[#e2dabf] hover:border-[#006d37] hover:bg-[#006d37]/5 text-[#1f1c0b]'
            }`}
          >
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-[#006d37]/10 text-[#006d37] text-xs font-black mr-2">
              {LETTERS[idx]}
            </span>
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
