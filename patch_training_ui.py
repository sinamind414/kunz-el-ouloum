import re

with open('src/components/TrainingView.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the "Beginner Launchpad" with a "Simulateur de Methodologie" banner
pattern_launchpad = re.compile(r'<section className="mb-4 rounded-3xl border border-\[\#ffb347\]\/40 bg-gradient-to-br from-\[\#fff7e8\].*?<\/section>', re.DOTALL)

replacement_launchpad = """<section className="mb-4 rounded-3xl border border-[#0891b2]/40 bg-gradient-to-br from-[#f0f9ff] to-white dark:from-[#083344] dark:to-[#141916] p-4 md:p-5 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="inline-flex items-center rounded-full bg-[#0891b2]/10 dark:bg-[#0891b2]/20 px-2.5 py-1 text-[10px] font-black text-[#0891b2] dark:text-[#22d3ee] mb-2 border border-[#0891b2]/20">
              محاكي المنهجية (Simulateur SVT)
            </div>
            <h2 className="text-lg font-black text-[#1f1c0b] dark:text-white">السر في البكالوريا هو "الاستدلال العلمي"</h2>
            <p className="text-[11px] text-[#506072] dark:text-gray-300 leading-6 mt-1.5 font-bold">
              حفظ الدرس يضمن لك 30% من النقطة فقط. 70% تعتمد على أفعال الأداء (حلل، فسر، استنتج). 
              ابدأ بتعلم المنهجية هنا، وسيقوم المصحح الآلي بتقييم إجاباتك خطوة بخطوة.
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#0891b2] text-white flex items-center justify-center shrink-0 shadow-md">
            <Target className="w-6 h-6" />
          </div>
        </div>
        
        {sub === null && (
          <div className="grid grid-cols-2 gap-3 mt-4">
            <button
              onClick={() => setSub('methodo')}
              className="w-full rounded-2xl bg-[#0891b2] hover:bg-[#0e7490] text-white font-black py-3 text-xs shadow-sm cursor-pointer transition-colors"
            >
              1. تعلم: كيف أجيب؟
            </button>
            <button
              onClick={() => {
                if (isFirstSessions) {
                  alert('عذراً، هذا القسم مخصص للمتقدمين. أكمل المراجعة والمنهجية واجمع 150 XP لفتحه!');
                } else {
                  setSub('docs');
                }
              }}
              className={`w-full rounded-2xl font-black py-3 text-xs shadow-sm transition-colors flex justify-center items-center gap-1 ${
                isFirstSessions 
                  ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed' 
                  : 'bg-white border-2 border-[#059669] text-[#059669] hover:bg-[#059669] hover:text-white cursor-pointer'
              }`}
            >
              {isFirstSessions ? <Lock className="w-3 h-3" /> : null} 2. تدرب: تحليل وثائق
            </button>
          </div>
        )}
      </section>"""

content = pattern_launchpad.sub(replacement_launchpad, content, count=1)

# Remove the reduntant "docs" and "methodo" from the RUBRICS array since they are now at the top
content = content.replace(
    "{ id: 'methodo', label: 'كيف أجيب؟', desc: 'المنهجية وطريقة الإجابة', icon: <BookOpen className=\"w-8 h-8\" />, color: '#0891b2', ring: 0, onClick: () => setSub('methodo'), badge: isFirstSessions ? 'ابدأ بالمنهجية' : undefined, glow: isFirstSessions },",
    ""
)
content = content.replace(
    "{ id: 'docs', label: 'تحليل وثائق', desc: isFirstSessions ? 'مغلق مؤقتاً' : '15 وثيقة نخبة + تقييم فوري', icon: <FileText className=\"w-8 h-8\" />, color: isFirstSessions ? '#a1a1aa' : '#059669', ring: 0, onClick: () => !isFirstSessions && setSub('docs'), isLocked: isFirstSessions },",
    ""
)

# Update the header subtext to reflect the new focus
content = content.replace(
    '<span className="block text-[10px] text-[#006d37] dark:text-[#2ecc71]">QCM + بطاقات + منهجية</span>',
    '<span className="block text-[10px] text-[#0891b2] dark:text-[#22d3ee]">محاكي المنهجية والاسترجاع</span>'
)

with open('src/components/TrainingView.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Patched TrainingView UI.")
