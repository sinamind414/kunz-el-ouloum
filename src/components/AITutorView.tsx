import React, { useState, useEffect, useRef } from 'react'
import { processStudentInput } from '../smartTutorEngine'
import { generateBacPrediction, calculateMedicSuccess } from '../utils/prophetEngine'

// Composant Indicateur de saisie
const TypingIndicator = () => (
  <div className="flex items-center gap-1 px-4 py-3 bg-slate-800 rounded-2xl rounded-bl-sm w-fit">
    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
  </div>
)

export default function AITutorView() {
  const [messages, setMessages] = useState<{role: string, content: string}[]>([
    { role: 'ai', content: 'مرحباً! أنا مساعدك الذكي. كيف يمكنني مساعدتك اليوم؟' }
  ])
  const [input, setInput] = useState('')
  const [isThinking, setIsThinking] = useState(false)
  const [activeDomain, setActiveDomain] = useState(1) // À connecter à ton sélecteur de domaine
  
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isThinking])

  // Fonction factice pour récupérer les notes (à connecter à ton state global/localStorage)
  const getStudentGrades = () => {
    return { svt: 15.5, math: 14, physics: 13.5 }
  }

  const handleSendMessage = async (textToSend?: string) => {
    const userText = textToSend || input
    if (!userText.trim()) return

    // 1. Afficher message user
    setMessages(prev => [...prev, { role: 'user', content: userText }])
    setInput('')
    setIsThinking(true)

    try {
      const lowerText = userText.toLowerCase().trim()
      let aiResponse: string = ""

      // --- MODE PROPHÈTE ---
      if (lowerText.includes('توقع') || lowerText.includes('علامتي') || lowerText.includes('كم ستكون نقطتي')) {
        aiResponse = generateBacPrediction(getStudentGrades())
      } 
      else if (lowerText.includes('الطب') || lowerText.includes('طب') || lowerText.includes('نسبة قبولي')) {
        aiResponse = calculateMedicSuccess(getStudentGrades())
      } 
      // --- MODE TUTEUR NORMAL ---
      else {
        // Appel asynchrone au moteur (télécharge le chunk du domaine au besoin)
        aiResponse = await processStudentInput(userText, activeDomain)
      }

      setMessages(prev => [...prev, { role: 'ai', content: aiResponse }])

    } catch (error) {
      console.error(error)
      setMessages(prev => [...prev, { role: 'ai', content: 'حدث خطأ أثناء المعالجة.' }])
    } finally {
      setIsThinking(false)
    }
  }

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-white">
      {/* Header avec sélecteur de domaine (à adapter selon ton code) */}
      <div className="p-4 border-b border-slate-800 flex gap-2">
        {[1, 2, 3].map(d => (
          <button 
            key={d}
            onClick={() => setActiveDomain(d)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium ${activeDomain === d ? 'bg-emerald-600' : 'bg-slate-800 text-slate-400'}`}
          >
            المجال {d}
          </button>
        ))}
      </div>

      {/* Zone Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-2xl whitespace-pre-line ${
              msg.role === 'user' 
                ? 'bg-emerald-600 text-white rounded-br-sm' 
                : 'bg-slate-800 text-slate-100 rounded-bl-sm'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}

        {isThinking && (
          <div className="flex justify-start">
            <TypingIndicator />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Boutons Raccourcis Prophète */}
      <div className="px-4 pb-2 flex gap-2 overflow-x-auto">
        <button 
          onClick={() => handleSendMessage("توقع علامتي في البكالوريا")}
          className="text-xs bg-slate-800 text-purple-300 px-3 py-1.5 rounded-full whitespace-nowrap hover:bg-slate-700"
        >
          🔮 توقع علامتي
        </button>
        <button 
          onClick={() => handleSendMessage("كم أحتاج للطب؟")}
          className="text-xs bg-slate-800 text-emerald-300 px-3 py-1.5 rounded-full whitespace-nowrap hover:bg-slate-700"
        >
          🩺 نسبة قبولي في الطب
        </button>
      </div>

      {/* Input Zone */}
      <div className="p-4 border-t border-slate-800 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          className="flex-1 bg-slate-800 p-3 rounded-xl border border-slate-700 focus:border-emerald-500 outline-none text-sm"
          placeholder="اكتب سؤالك هنا..."
        />
        <button 
          onClick={() => handleSendMessage()}
          className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-bold transition-colors"
        >
          إرسال
        </button>
      </div>
    </div>
  )
}
