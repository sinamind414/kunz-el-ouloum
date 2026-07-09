import React, { useState, useEffect, useRef } from 'react'
import { generateBacExam } from '../utils/bacGenerator'
import { REAL_BAC_SUBJECTS, BacSubject } from '../data/bacRealSubjects'

type CombatPhase = 'setup' | 'combat' | 'results'
type SetupMode = 'random' | 'boss'

export default function BacCombatView() {
  const [phase, setPhase] = useState<CombatPhase>('setup')
  const [setupMode, setSetupMode] = useState<SetupMode>('boss')
  
  const [examData, setExamData] = useState<any>(null)
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({})
  const [selfScores, setSelfScores] = useState<Record<string, number>>({})
  const [revealedCorrections, setRevealedCorrections] = useState<Record<string, boolean>>({})
  
  const [timeLeft, setTimeLeft] = useState(0)
  const timerRef = useRef<any>(null)

  useEffect(() => {
    if (phase !== 'combat') return
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current)
          handleFinishExam()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  const handleStartRandom = (domain: number) => {
    const newExam = generateBacExam(domain)
    setExamData({ ...newExam, title: `تدريب المجال ${domain}` })
    initCombat(newExam.duration)
  }

  const handleStartBoss = (subject: BacSubject) => {
    setExamData(subject)
    initCombat(subject.duration)
  }

  const initCombat = (durationMin: number) => {
    setUserAnswers({})
    setSelfScores({})
    setRevealedCorrections({})
    setTimeLeft(durationMin * 60)
    setPhase('combat')
  }

  const handleFinishExam = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    setPhase('results')
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const getTimerColor = () => {
    const total = examData ? (examData.duration * 60) : 1
    const ratio = timeLeft / total
    if (ratio > 0.5) return 'text-emerald-400'
    if (ratio > 0.2) return 'text-yellow-400'
    return 'text-red-500 animate-pulse'
  }

  const calculateCurrentScore = () => {
    if (!examData) return 0
    let total = 0
    examData.exercises.forEach((ex: any) => {
      total += selfScores[ex.id] || 0
    })
    return total
  }

  // PHASE 1 : SETUP
  if (phase === 'setup') {
    return (
      <div className="flex flex-col p-6 text-white min-h-screen bg-slate-900">
        <h2 className="text-2xl font-bold mb-6 text-center">تحدي البكالوريا</h2>
        
        <div className="flex gap-2 mb-8 bg-slate-800 p-1 rounded-xl">
          <button 
            onClick={() => setSetupMode('boss')}
            className={`flex-1 py-2 rounded-lg font-bold transition-all ${setupMode === 'boss' ? 'bg-red-600 text-white' : 'text-slate-400'}`}
          >
            👑 مواضيع البكالوريا الحقيقية
          </button>
          <button 
            onClick={() => setSetupMode('random')}
            className={`flex-1 py-2 rounded-lg font-bold transition-all ${setupMode === 'random' ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}
          >
            ⚡ تدريب سريع
          </button>
        </div>

        {setupMode === 'boss' && (
          <div className="grid gap-3 max-w-md w-full mx-auto">
            {REAL_BAC_SUBJECTS.map(subject => (
              <button
                key={subject.code}
                onClick={() => handleStartBoss(subject)}
                className="flex items-center justify-between p-4 bg-slate-800/50 border border-slate-700 rounded-xl hover:border-red-500 transition-all text-right group"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs bg-red-900/50 text-red-400 px-2 py-0.5 rounded font-mono">
                      {subject.code}
                    </span>
                    <span className="text-xs text-slate-500">{subject.year}</span>
                  </div>
                  <span className="font-bold text-white">{subject.title}</span>
                  <div className="text-xs text-slate-400 mt-1">
                    المجال {subject.domain} • {subject.duration} دقيقة
                  </div>
                </div>
                <span className="text-2xl opacity-50 group-hover:opacity-100 group-hover:text-red-500 transition-all">⚔️</span>
              </button>
            ))}
          </div>
        )}

        {setupMode === 'random' && (
          <div className="grid gap-4 w-full max-w-md mx-auto">
            {[1, 2, 3].map(d => (
              <button
                key={d}
                onClick={() => handleStartRandom(d)}
                className="p-4 rounded-xl border-2 border-slate-700 bg-slate-800/50 hover:border-emerald-500 transition-all text-right"
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-lg">المجال {d}</span>
                  <span className="text-sm text-slate-400">
                    {d === 1 ? '50 دقيقة' : d === 2 ? '80 دقيقة' : '110 دقيقة'}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  // PHASE 2 : COMBAT
  if (phase === 'combat' && examData) {
    return (
      <div className="flex flex-col p-6 text-white min-h-screen bg-slate-900">
        <div className="sticky top-0 bg-slate-900/90 backdrop-blur py-4 mb-6 border-b border-slate-800 z-10">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-slate-400">{examData.title}</span>
            <span className={`text-3xl font-mono font-bold ${getTimerColor()}`}>
              ⏱️ {formatTime(timeLeft)}
            </span>
            <span className="text-lg font-bold text-emerald-400">
              {calculateCurrentScore().toFixed(2)} / 20
            </span>
          </div>
          <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${(timeLeft / (examData.duration * 60)) * 100}%` }} />
          </div>
        </div>

        <div className="flex-1 space-y-6 max-w-2xl w-full mx-auto pb-20">
          {examData.exercises.map((ex: any, idx: number) => (
            <div key={ex.id} className="bg-slate-800/50 p-5 rounded-xl border border-slate-700">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-emerald-400">التمرين {idx + 1}</h3>
                <span className="text-xs bg-slate-700 px-2 py-1 rounded">{ex.points} نقاط</span>
              </div>
              <p className="text-slate-200 mb-4 whitespace-pre-line">{ex.question}</p>
              
              <textarea
                value={userAnswers[ex.id] || ''}
                onChange={(e) => setUserAnswers(prev => ({ ...prev, [ex.id]: e.target.value }))}
                className="w-full bg-slate-900 p-3 rounded-lg border border-slate-700 focus:border-emerald-500 outline-none text-sm mb-4"
                rows={4}
                placeholder="اكتب إجابتك هنا..."
                disabled={revealedCorrections[ex.id]}
              />

              {!revealedCorrections[ex.id] ? (
                <button 
                  onClick={() => setRevealedCorrections(prev => ({ ...prev, [ex.id]: true }))}
                  className="text-sm text-yellow-400 hover:text-yellow-300 font-semibold"
                >
                  📖 أظهر التصحيح النموذجي (لا يمكن التعديل بعد ذلك)
                </button>
              ) : (
                <div className="mt-4 border-t border-slate-700 pt-4 space-y-4">
                  <div className="bg-emerald-900/20 border border-emerald-800/50 p-3 rounded-lg">
                    <p className="text-xs text-emerald-400 font-bold mb-2">التصحيح النموذجي:</p>
                    <p className="text-slate-200 text-sm whitespace-pre-line">{ex.correction}</p>
                  </div>

                  <div className="bg-slate-900 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm text-slate-300">قيّم إجابتك ذاتياً:</label>
                      <span className="font-bold text-emerald-400">{selfScores[ex.id] || 0} / {ex.points} ن</span>
                    </div>
                    <input
                      type="range" min="0" max={ex.points} step="0.25"
                      value={selfScores[ex.id] || 0}
                      onChange={(e) => setSelfScores(prev => ({ ...prev, [ex.id]: parseFloat(e.target.value) }))}
                      className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="fixed bottom-0 left-0 right-0 p-4 bg-slate-900/90 backdrop-blur border-t border-slate-800">
          <button onClick={handleFinishExam} className="px-6 py-3 bg-red-600 hover:bg-red-500 rounded-xl font-bold transition-colors max-w-2xl w-full mx-auto block">
            إنهاء وتسليم النتيجة 🏁
          </button>
        </div>
      </div>
    )
  }

  // PHASE 3 : RESULTS
  if (phase === 'results' && examData) {
    const finalScore = calculateCurrentScore()
    const isMedicineThreshold = finalScore >= 16.65
    
    return (
      <div className="flex flex-col items-center p-6 text-white min-h-screen bg-slate-900">
        <div className="max-w-md w-full">
          <h2 className="text-3xl font-bold text-center mb-2">النتيجة النهائية</h2>
          <p className="text-slate-400 text-center mb-8">{examData.title} ({examData.code || 'تدريب'})</p>
          
          <div className={`text-center p-8 rounded-2xl border-2 mb-6 ${isMedicineThreshold ? 'border-emerald-500 bg-emerald-500/10' : 'border-yellow-500 bg-yellow-500/10'}`}>
            <div className="text-6xl font-bold mb-2">{finalScore.toFixed(2)}<span className="text-2xl text-slate-400">/20</span></div>
            {isMedicineThreshold ? <p className="text-emerald-400 font-bold">🎉 فوق عتبة الطب (16.65)</p> : <p className="text-yellow-400 font-bold">تحت عتبة الطب (16.65)</p>}
          </div>

          <div className="bg-slate-800/50 rounded-xl p-5 space-y-3 mb-6">
            <h3 className="font-bold text-slate-300 mb-3">تفاصيل النقاط</h3>
            {examData.exercises.map((ex: any, idx: number) => (
              <div key={ex.id} className="flex justify-between text-sm border-b border-slate-700 pb-2 last:border-0">
                <span className="text-slate-400">التمرين {idx + 1}</span>
                <span className="font-mono font-bold">{(selfScores[ex.id] || 0).toFixed(2)} / {ex.points} ن</span>
              </div>
            ))}
          </div>

          <button onClick={() => setPhase('setup')} className="w-full px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl font-bold transition-colors">
            تحدٍ جديد 🔄
          </button>
        </div>
      </div>
    )
  }

  return null
}
