import re

with open('src/components/LessonsView.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

unified_memo = """
  const unifiedLessons = useMemo(() => {
    if (!selectedUnitId) return [];

    const sequence = OFFICIAL_PROGRAM_SEQUENCE[selectedUnitId];
    if (!sequence) {
      return [
         ...activeLessonsForSelectedUnit.map(a => ({ ...a, type: 'active' as const, key: a.lessonId })),
         ...sortedLessonsForUnit.map(l => {
            const visual = resolveLegacyLessonVisual(l);
            return {
              key: l.key,
              type: 'legacy' as const,
              title: cleanLessonTitle(l.titleAr),
              imageSrc: visual?.imageSrc ?? '',
              altAr: visual?.altAr ?? '',
              metaAr: visual?.metaAr ?? ''
            };
         })
      ];
    }

    return sequence.map(key => {
       const active = ACTIVE_LESSONS[key];
       if (active) {
         const visual = LESSON_PAGE_VISUAL_OVERRIDES[key] ?? UNIT_PAGE_VISUALS[selectedUnitId];
         return {
           key,
           type: 'active' as const,
           title: cleanLessonTitle(active.title ?? key),
           imageSrc: visual?.imageSrc ?? '',
           altAr: visual?.altAr ?? '',
           metaAr: visual?.metaAr ?? ''
         };
       } else {
         const legacy = lessonsForUnit.find(l => l.key === key);
         if (legacy) {
           const visual = resolveLegacyLessonVisual(legacy);
           return {
             key,
             type: 'legacy' as const,
             title: cleanLessonTitle(legacy.titleAr),
             imageSrc: visual?.imageSrc ?? '',
             altAr: visual?.altAr ?? '',
             metaAr: visual?.metaAr ?? ''
           };
         }
       }
       return null;
    }).filter(Boolean) as { key: string; type: 'active'|'legacy'; title: string; imageSrc: string; altAr: string; metaAr: string }[];
  }, [selectedUnitId, activeLessonsForSelectedUnit, sortedLessonsForUnit, lessonsForUnit]);

  const goToDomain = (domain: string) => {"""

content = content.replace("  const goToDomain = (domain: string) => {", unified_memo, 1)

# Now replace the aside rendering.
# Look for: <div className="flex items-center justify-between mb-3 px-1">
# End at: </aside>

pattern = re.compile(r'<div className="flex items-center justify-between mb-3 px-1">[\s\S]*?<\/aside>', re.DOTALL)

replacement = """<div className="flex items-center justify-between mb-3 px-1">
              <div>
                <h4 className="text-[11px] sm:text-xs font-black text-[#1f1c0b] dark:text-gray-100">فهرس الدروس</h4>
                <span className="text-[10px] font-bold text-[#506072] dark:text-gray-400">حسب التدرج الرسمي</span>
              </div>
              <span className="inline-flex items-center rounded-full bg-[#f1eee3] dark:bg-white/10 px-2.5 py-1 text-[10px] font-black text-[#6a5b43] dark:text-gray-300">
                {unifiedLessons.length} دروس
              </span>
            </div>

            <section className="space-y-2.5 rounded-2xl bg-transparent">
              {unifiedLessons.map((lesson, index) => {
                const isSelected = selectedLesson?.key === lesson.key || openLessonKey === lesson.key;
                return (
                  <article
                    key={lesson.key}
                    className={`rounded-2xl sm:rounded-3xl border p-2.5 sm:p-3 shadow-sm transition-all ${
                      isSelected
                        ? 'bg-[var(--dl)] border-[var(--dc)] ring-1 ring-[var(--dc)]/15'
                        : 'bg-white dark:bg-[#1a211c] border-[#e2dabf]/50 dark:border-white/10 hover:border-[#006d37]/40'
                    }`}
                  >
                    <div className="flex items-start gap-2.5 sm:gap-3">
                      <div className="relative w-20 shrink-0 sm:w-24">
                        <ZoomableImage
                          src={lesson.imageSrc}
                          alt={lesson.altAr}
                          className={`w-full aspect-square rounded-xl sm:rounded-2xl object-cover bg-[#eef3ef] dark:bg-[#0c0f0d] ${lesson.imageSrc.includes('.jpg') || lesson.imageSrc.includes('.png') ? 'image-svt-filter' : ''}`}
                          referrerPolicy="no-referrer"
                          draggable={false}
                        />
                        <span className="absolute top-1.5 left-1.5 inline-flex items-center gap-1 rounded-full bg-black/65 text-white px-1.5 py-1 text-[9px] font-bold">
                          <ZoomIn className="w-2.5 h-2.5" /> تكبير
                        </span>
                      </div>
                      <div className="min-w-0 flex-1 flex flex-col gap-2">
                        <div>
                          <div className="flex flex-wrap items-center gap-1.5 mb-1">
                            <span className="inline-flex items-center rounded-full bg-[#f2f0e8] dark:bg-white/5 px-2 py-0.5 text-[9px] sm:text-[10px] font-black text-[#6a5b43] dark:text-gray-300">
                              الدرس {index + 1}
                            </span>
                            {lesson.type === 'active' && (
                              <span className="inline-flex items-center rounded-full bg-[#006d37]/10 px-2 py-0.5 text-[9px] sm:text-[10px] font-black text-[#006d37] dark:bg-[#2ecc71]/10 dark:text-[#7ee2a8]">
                                تفاعلي حديث
                              </span>
                            )}
                            {isSelected && (
                              <span className="inline-flex items-center rounded-full bg-[var(--dc)]/10 px-2 py-0.5 text-[9px] sm:text-[10px] font-black text-[var(--dc)]">
                                محدد الآن
                              </span>
                            )}
                          </div>
                          <div className="text-[9px] sm:text-[10px] font-black mb-1" style={{ color: domainInfo.color }}>{lesson.metaAr}</div>
                          <h5 className={`text-[11px] sm:text-xs leading-5 sm:leading-6 max-h-10 sm:max-h-12 overflow-hidden ${isSelected ? 'font-black text-[var(--dc)] dark:text-[var(--dc)]' : 'font-bold text-[#504441] dark:text-gray-200'}`}>
                            {lesson.title}
                          </h5>
                        </div>
                        <button
                          onClick={() => {
                            if (lesson.type === 'active') {
                              onStartLesson(lesson.key);
                            } else {
                              setSelectedLessonKey(lesson.key); 
                              setOpenLessonKey(lesson.key);
                            }
                          }}
                          className={`w-full py-2 sm:py-2.5 rounded-xl sm:rounded-2xl text-[11px] sm:text-xs font-black shadow-sm transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[var(--dc)] text-white hover:brightness-95'
                              : 'bg-white dark:bg-[#101613] border border-[#e2dabf]/60 dark:border-white/10 text-[#1f1c0b] dark:text-gray-100 hover:bg-[var(--dl)]'
                          }`}
                        >
                          افتح هذا الدرس ←
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </section>
          </aside>"""

content = pattern.sub(replacement, content, count=1)

# Add OFFICIAL_PROGRAM_SEQUENCE at the top before LessonsView Component
imports_end = content.find("export default function LessonsView")
if imports_end != -1:
    seq = """const OFFICIAL_PROGRAM_SEQUENCE: Record<number, string[]> = {
  1: ['phase1_chapitres_1_2', 'd1-u1-l1-expression-genique', 'd1-u1-l2-transcription', 'd1-u1-l3-traduction', 'phase2_chapitres_3_4'],
  2: ['phase3_chapitres_5_6', 'protein_structure_function'],
  3: ['d1-u3-l1-enzyme', 'phase4_chapitres_7_8'],
  4: ['phase5_chapitres_9_10', 'immunity_self_nonself', 'phase6_chapitres_11_12', 'immunity_humoral_response', 'phase7_chapitres_13_14', 'immunity_cellular_response', 'immunity_memory_response'],
  5: ['phase8_chapitres_15_16', 'phase9_chapitres_17_18', 'synapse', 'phase10_chapitres_19_20'],
  6: ['phase11_chapitres_21_22', 'phase12_chapitres_23_24'],
  7: ['phase13_chapitres_25_26', 'phase14_chapitres_27_28', 'phase15_chapitres_29_30'],
  9: ['phase16_chapitres_31_32', 'subduction', 'phase17_chapitres_33_34'],
  10: ['phase18_chapitres_35_36', 'seismic_waves', 'phase19_chapitres_37_38'],
  11: ['phase20_chapitres_39_40', 'phase21_chapitres_41_42', 'phase22_chapitres_43_44']
};

"""
    content = content[:imports_end] + seq + content[imports_end:]

with open('src/components/LessonsView.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Patched successfully")
