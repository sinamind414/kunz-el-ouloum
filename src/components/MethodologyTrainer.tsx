import React, { useState, useMemo } from 'react';
import { Target, CheckCircle2, XCircle, Sparkles, BookOpen } from 'lucide-react';
import { METHODOLOGY_QA, MethodologyQA } from '../methodologyKnowledge';
import { normalizeArabic } from '../utils/arabicNormalize';
import SpeechToTextInput from './SpeechToTextInput';

interface Props {
  onClose?: () => void;
  initialVerb?: 'analyse' | 'interpret' | 'deduce' | 'compare' | 'justify' | 'hypothesis';
}

const VERB_MAP: Record<string, { verb: string; keywords: string[]; connectors: string[]; color: string }> = {
  analyse: { verb: 'حلل', keywords: ['تمثل الوثيقة', 'نلاحظ', 'بدلالة', 'تزايد', 'تناقص', 'استنتاج'], connectors: ['حيث', 'كلما', 'نستنتج'], color: '#2563eb' },
  interpret: { verb: 'فسر', keywords: ['يفسر', 'يعود', 'لأن', 'راجع إلى'], connectors: ['لأن', 'يعود', 'يفسر', 'نتيجة'], color: '#d97706' },
  deduce: { verb: 'استنتج', keywords: ['أستنتج', 'نستنتج', 'إذن'], connectors: ['إذن', 'بالتالي', 'وعليه'], color: '#059669' },
  compare: { verb: 'قارن', keywords: ['تشابه', 'اختلاف', 'بينما'], connectors: ['بينما', 'في حين', 'بالمقابل'], color: '#0e7490' },
  justify: { verb: 'علل', keywords: ['لأن', 'بما أن', 'دليل'], connectors: ['لأن', 'بما أن', 'حيث أن'], color: '#e11d48' },
  hypothesis: { verb: 'فرضية', keywords: ['أقترح', 'ربما', 'قد يكون'], connectors: ['ربما', 'قد', 'يفترض'], color: '#7c3aed' },
};

function scoreAnswer(text: string, qa: MethodologyQA, verbKey?: string) {
  const norm = normalizeArabic(text);
  let kwFound: string[] = [];
  let kwScore = 0;
  const allKeywords = [...qa.keywords];
  if (verbKey && VERB_MAP[verbKey]) {
    allKeywords.push(...VERB_MAP[verbKey].keywords, ...VERB_MAP[verbKey].connectors);
  }
  const uniq = Array.from(new Set(allKeywords));
  for (const k of uniq) {
    const nk = normalizeArabic(k);
    if (nk.length > 2 && norm.includes(nk)) {
      kwFound.push(k);
      kwScore += 1;
    }
  }
  const connList = ['لأن', 'بما أن', 'إذن', 'يعود', 'يفسر', 'بينما', 'حيث', 'بالتالي', 'وعليه', 'نستنتج'];
  const connFound = connList.filter(c => norm.includes(normalizeArabic(c)));
  const hasStructure = text.trim().split(/[.\n]/).filter(s => s.trim().length > 8).length;
  const lengthOk = text.trim().length >= 40;
  
  const totalKw = Math.max(uniq.length, 6);
  const kwPct = Math.min(100, Math.round((kwFound.length / totalKw) * 100));
  const connPct = Math.min(100, connFound.length * 25);
  const structPct = Math.min(100, hasStructure * 30 + (lengthOk ? 30 : 0));
  
  const score = Math.round(kwPct * 0.6 + connPct * 0.2 + structPct * 0.2);
  
  return { score, kwFound, connFound, hasStructure, lengthOk, kwPct, connPct, structPct };
}

export default function MethodologyTrainer({ onClose, initialVerb = 'analyse' }: Props) {
  const [verb, setVerb] = useState(initialVerb);
  const [qaIndex, setQaIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [validated, setValidated] = useState(false);

  const pool = useMemo(() => {
    // pick QAs that match verb intent, fallback first 6
    const map: Record<string, string[]> = {
      analyse: ['meth_7', 'meth_4'],
      interpret: ['meth_8', 'meth_5'],
      deduce: ['meth_9', 'meth_5'],
      compare: ['meth_10'],
      justify: ['meth_11'],
      hypothesis: ['meth_12', 'meth_14'],
    };
    const ids = map[verb] || [];
    const found = ids.map(id => METHODOLOGY_QA.find(q => q.id === id)).filter(Boolean) as MethodologyQA[];
    return found.length ? found : METHODOLOGY_QA.slice(6, 12);
  }, [verb]);

  const qa = pool[qaIndex % pool.length] || METHODOLOGY_QA[6];
  const result = validated ? scoreAnswer(answer, qa, verb) : null;
  const vMeta = VERB_MAP[verb] || VERB_MAP.analyse;

  const handleValidate = (txt?: string) => {
    if (txt !== undefined) setAnswer(txt);
    setValidated(true);
  };

  const next = () => {
    setValidated(false);
    setAnswer('');
    setQaIndex(i => i + 1);
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-white dark:bg-[#141916] rounded-3xl border border-[#e2dabf]/60 dark:border-gray-800 shadow-sm p-5 md:p-7 space-y-5" dir="rtl">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl text-white" style={{ background: vMeta.color }}>
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-black text-lg text-gray-900 dark:text-white">تدريب منهجي — {vMeta.verb}</h3>
            <p className="text-[11px] text-[#506072] dark:text-gray-400">Kunz El Ouloum — gratuit • 100% offline • version Pro = تصحيح مفصّل + مواضيع BAC</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-xs font-bold text-[#506072] hover:text-[#006d37] px-3 py-1.5 rounded-lg bg-[#f3f4f5] dark:bg-white/5">إغلاق</button>
        )}
      </div>

      {/* Verb picker */}
      <div className="flex flex-wrap gap-1.5">
        {Object.entries(VERB_MAP).map(([k, m]) => (
          <button
            key={k}
            onClick={() => { setVerb(k as any); setValidated(false); setAnswer(''); setQaIndex(0); }}
            className={`px-3 py-1.5 rounded-full text-[11px] font-black border transition-all cursor-pointer ${verb === k ? 'text-white' : 'bg-white dark:bg-[#1a201c] text-[#506072] dark:text-gray-300 hover:brightness-95'}`}
            style={verb === k ? { background: m.color, borderColor: m.color } : { borderColor: '#e2dabf88' }}
          >
            {m.verb}
          </button>
        ))}
      </div>

      {/* Document / consigne */}
      <div className="bg-[#fff9ed] dark:bg-[#1c241f] border border-[#e2dabf]/60 dark:border-amber-900/30 rounded-2xl p-4 space-y-2">
        <div className="text-[11px] font-black text-[#944a00] dark:text-amber-300">📄 وضعية منهجية — {qa.category}</div>
        <p className="font-black text-[#1f1c0b] dark:text-white leading-7">{qa.question}</p>
        <p className="text-[12px] text-[#506072] dark:text-gray-400 leading-6">{qa.answer.slice(0, 180)}…</p>
        {qa.template && (
          <div className="text-[11px] bg-white dark:bg-black/20 border border-amber-200/50 dark:border-amber-900/30 rounded-xl px-3 py-2 font-bold text-amber-800 dark:text-amber-300">
            قالب: {qa.template}
          </div>
        )}
      </div>

      {/* Answer input */}
      <div className="space-y-3">
        <label className="text-xs font-black text-[#506072] dark:text-gray-300 flex items-center gap-2">
          <BookOpen className="w-3.5 h-3.5 text-[#006d37]" />
          اكتب إجابتك المنهجية هنا (3–5 أسطر) — أو استعمل الميكروفون
        </label>
        <SpeechToTextInput
          placeholder="تمثل الوثيقة … حيث نلاحظ … ومنه نستنتج …"
          expectedKeywords={[...qa.keywords.slice(0,4), ...(VERB_MAP[verb]?.keywords.slice(0,3) || [])]}
          onValidate={handleValidate}
          lang="ar-DZ"
        />
        <textarea
          value={answer}
          onChange={e => { setAnswer(e.target.value); setValidated(false); }}
          rows={4}
          className="w-full bg-[#f8f9fa] dark:bg-[#0f1411] border border-[#e2dabf]/60 dark:border-gray-800 rounded-2xl p-3 text-sm leading-8 font-medium text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-[#006d37]/20"
          placeholder="اكتب هنا: مقدمة قصيرة — عرض بالأدلة — خاتمة …"
          dir="rtl"
        />
        <div className="flex justify-between items-center text-[11px] text-[#506072] dark:text-gray-400">
          <span>{answer.trim().length} حرف — الهدف ≥ 120 حرف</span>
          <span>الكلمات المفتاحية المتوقعة: {qa.keywords.slice(0,3).join(' • ')}</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleValidate()}
            disabled={answer.trim().length < 15}
            className="px-5 py-2.5 bg-[#006d37] hover:bg-[#00562b] disabled:opacity-40 text-white rounded-xl font-black text-sm shadow-sm cursor-pointer"
          >
            صحّح محلياً
          </button>
          {validated && (
            <button onClick={next} className="px-4 py-2.5 bg-[#fff9ed] border border-[#e2dabf] text-[#944a00] rounded-xl font-bold text-sm cursor-pointer flex items-center gap-1">
              سؤال موالي <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Result */}
      {result && (
        <div className="space-y-3 animate-in fade-in">
          <div className="flex items-center gap-3 flex-wrap">
            <div className={`px-4 py-2 rounded-2xl font-black text-white text-sm ${result.score >= 70 ? 'bg-[#006d37]' : result.score >= 45 ? 'bg-amber-600' : 'bg-rose-600'}`}>
              {result.score} / 100
            </div>
            <div className="text-xs font-bold text-[#506072] dark:text-gray-300">
              كلمات مفتاحية {result.kwPct}% • روابط {result.connPct}% • بنية {result.structPct}%
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-3 text-xs">
            <div className="bg-[#f8f9fa] dark:bg-black/20 border border-[#e2dabf]/40 dark:border-gray-800 rounded-xl p-3">
              <div className="font-black mb-1 text-[#006d37] flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> كلمات وُجدت</div>
              <div className="flex flex-wrap gap-1">
                {result.kwFound.length ? result.kwFound.map((k,i)=>
                  <span key={i} className="bg-[#2ecc71]/15 text-[#006d37] px-2 py-0.5 rounded-full font-bold">✓ {k}</span>
                ) : <span className="text-gray-400">— لا شيء بعد</span>}
              </div>
            </div>
            <div className="bg-[#fff9ed] dark:bg-amber-950/10 border border-[#e2dabf]/40 dark:border-amber-900/30 rounded-xl p-3">
              <div className="font-black mb-1 text-amber-700 dark:text-amber-300">أدوات ربط منهجية</div>
              <div className="flex flex-wrap gap-1">
                {result.connFound.length ? result.connFound.map((c,i)=>
                  <span key={i} className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 px-2 py-0.5 rounded-full font-bold">{c}</span>
                ) : <span className="text-gray-400">أضف: لأن • يعود • ومنه • بينما</span>}
              </div>
            </div>
          </div>

          <div className={`p-3 rounded-xl text-[12px] leading-7 font-bold border ${result.score >= 70 ? 'bg-[#2ecc71]/10 text-[#006d37] border-[#2ecc71]/20' : result.score >=45 ? 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/20 dark:text-amber-200 dark:border-amber-900/40' : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-300 dark:border-rose-900/40'}`}>
            {result.score >= 70 ? 'ممتاز منهجياً! أضفت الكلمات المفتاحية + أدوات الربط + بنية واضحة.' :
             result.score >= 45 ? 'جيد، لكن ناقص: أضف 1–2 كلمات مفتاحية من القائمة، وابدأ بـ "تمثل الوثيقة …" ثم "نلاحظ …" ثم "نستنتج …".' :
             'أعد المحاولة: اكتب 3 جمل — تعريف الوثيقة، ملاحظة/تفسير، استنتاج. استعمل: لأن، يعود ذلك إلى، ومنه نستنتج.'}
          </div>

          {/* Pro teaser */}
          <div className="bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950/20 dark:to-transparent border border-indigo-100 dark:border-indigo-900/30 rounded-2xl p-4 text-[12px] leading-6">
            <div className="font-black text-indigo-700 dark:text-indigo-300 flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4" /> Kunz Pro — تصحيح BAC كامل
            </div>
            <p className="text-[#504441] dark:text-gray-300 font-medium">
              هنا تدريب مجاني محلّي: كلمات مفتاحية + روابط. 
              في <strong>Kunz Pro</strong> تحصل على: 3 مواضيع BAC كاملة، مصحح مدمج بالتنقيط الوزاري، تتبع أخطائك أسبوع بأسبوع، وAPI key للمراجعة الذكية العميقة.
            </p>
            <div className="flex gap-2 mt-3 flex-wrap">
              <a href="https://github.com/sinamind414/kunz-el-ouloum" target="_blank" rel="noreferrer" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black text-xs shadow-sm cursor-pointer">
                اكتشف Kunz Pro →
              </a>
              <button onClick={next} className="px-4 py-2 bg-white dark:bg-[#141916] border border-indigo-200 dark:border-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded-xl font-bold text-xs cursor-pointer">
                تمرين مجاني آخر
              </button>
            </div>
            <p className="text-[10px] text-[#7a6a5a] dark:text-gray-400 mt-2">Kunz El Ouloum يبقى مجانياً 100% لفهم الدروس ومنطق الآليات. Pro = immersion BAC.</p>
          </div>
        </div>
      )}
    </div>
  );
}

// tiny inline to avoid extra import circular
function ArrowLeft(props: any) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
  );
}
