import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Send } from 'lucide-react';

interface SpeechToTextInputProps {
  placeholder?: string;
  onValidate: (text: string) => void;
  expectedKeywords?: string[];
  lang?: string;
}

export default function SpeechToTextInput({ placeholder = "اكتب إجابتك هنا أو استخدم الميكروفون", onValidate, expectedKeywords = [], lang = 'ar-DZ' }: SpeechToTextInputProps) {
  const [text, setText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    const SpeechRecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognitionCtor) {
      setIsSupported(true);
      const recognition = new SpeechRecognitionCtor();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = lang;
      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        setText(prev => prev ? prev + ' ' + transcript : transcript);
      };
      recognition.onerror = () => setIsListening(false);
      recognitionRef.current = recognition;
    }
  }, [lang]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  const handleValidate = () => {
    if (text.trim()) {
      onValidate(text.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleValidate();
    }
  };

  return (
    <div className="space-y-3 w-full" dir="rtl">
      <div className="relative flex items-center gap-2 bg-white dark:bg-[#1a201c] border border-[#e2dabf]/60 dark:border-[#2ecc71]/10 rounded-2xl p-2 shadow-sm focus-within:ring-2 focus-within:ring-[#006d37]/20 focus-within:border-[#006d37]/30 transition-all">
        <div className="flex-1 relative">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full bg-transparent outline-none text-sm font-bold text-[#1f1c0b] dark:text-gray-100 placeholder:text-[#bbcbbb] dark:placeholder:text-gray-500 pr-2 py-2"
          />
        </div>
        
        {isSupported && (
          <button
            onClick={toggleListening}
            className={`p-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center ${
              isListening 
                ? 'bg-rose-500 text-white animate-pulse shadow-md' 
                : 'bg-[#f3f4f5] dark:bg-[#1f2622] text-[#506072] dark:text-gray-400 hover:bg-[#006d37]/10 hover:text-[#006d37]'
            }`}
            title={isListening ? "إيقاف التسجيل" : "تشغيل الميكروفون (عربية)"}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>
        )}
      </div>
      
      {isListening && (
        <div className="flex items-center gap-2 text-[11px] text-rose-600 dark:text-rose-400 font-bold animate-pulse px-1">
          <div className="w-2 h-2 bg-rose-500 rounded-full animate-ping" />
          <span>جاري الاستماع... تحدث الآن بالعربية</span>
        </div>
      )}

      {expectedKeywords.length > 0 && text && (
        <div className="flex flex-wrap gap-1.5 px-1">
          {expectedKeywords.map((kw, i) => {
            const found = text.toLowerCase().includes(kw.toLowerCase());
            return (
              <span key={i} className={`text-[10px] px-2 py-1 rounded-full font-bold border ${found ? 'bg-[#2ecc71]/15 text-[#006d37] border-[#2ecc71]/20' : 'bg-[#f3f4f5] text-[#bbcbbb] border-[#e2dabf]/30'}`}>
                {found ? '✓ ' : ''}{kw}
              </span>
            );
          })}
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={handleValidate}
          disabled={!text.trim()}
          className="px-6 py-2.5 bg-[#006d37] hover:bg-[#00562b] disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl font-black text-sm flex items-center gap-2 transition-all shadow-md cursor-pointer"
        >
          <Send className="w-4 h-4" />
          تحقق
        </button>
      </div>

      {!isSupported && (
        <p className="text-[10px] text-[#bbcbbb] dark:text-gray-500 px-1">
          ⚠️ متصفحك لا يدعم التعرف الصوتي، استخدم الكتابة. Chrome Android يدعم العربية.
        </p>
      )}
    </div>
  );
}
