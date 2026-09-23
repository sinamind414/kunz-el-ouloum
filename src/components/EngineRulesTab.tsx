import { UNIVERSAL_GRAMMAR_RULES } from '../data/methodologyEngine';


export default function EngineRulesTab() {

  return (
<>

        <section className="space-y-6">
          <div className="bg-white dark:bg-[#161c18] p-5 md:p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
            <div>
              <h2 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white">الطبقة 0: قواعد الإجابة الموحدة (100% من الأسئلة)</h2>
              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">
                هذه القواعد الأربعة هي "نظام التشغيل" الذي تدور فوقه جميع أفعال الأداء، ويتعلمها الطالب مرة واحدة وتصلح لجميع مواضيع البكالوريا.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {UNIVERSAL_GRAMMAR_RULES.map(rule => (
                <div 
                  key={rule.ruleNumber}
                  className="p-5 rounded-2xl bg-gray-50 dark:bg-[#121614] border border-gray-200 dark:border-gray-800 space-y-2 hover:border-emerald-400 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="w-7 h-7 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center">
                      {rule.ruleNumber}
                    </span>
                    <span className="text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 px-2.5 py-0.5 rounded-full">
                      {rule.badge}
                    </span>
                  </div>
                  <h3 className="font-black text-sm md:text-base text-gray-900 dark:text-white">{rule.titleAr}</h3>
                  <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                    {rule.summaryAr}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
</>
  );
}
