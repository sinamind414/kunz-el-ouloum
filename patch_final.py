import re

with open('src/components/LessonsView.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Pattern for the entire aside content
start_marker = '<aside className="bg-white dark:bg-[#141916] border border-[#e2dabf]/60 dark:border-[#2ecc71]/10 rounded-[28px] sm:rounded-3xl p-3 sm:p-4 shadow-sm space-y-3 sm:space-y-4 lg:sticky lg:top-24 lg:max-h-[calc(100vh-120px)] lg:overflow-y-auto" style={{ [\'--dc\']: domainInfo.color, [\'--dl\']: domainInfo.light } as any}>'
end_marker = '</aside>'

start_idx = content.find(start_marker)
if start_idx != -1:
    end_idx = content.find(end_marker, start_idx) + len(end_marker)
    
    replacement = start_marker + """
            <div className="rounded-2xl border border-[#e2dabf]/50 dark:border-white/10 bg-[#fffdf8] dark:bg-[#101613] p-3 sm:p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-black text-[#1f1c0b] dark:text-gray-100 mb-1 flex items-center gap-2 text-sm sm:text-base">
                    <BookOpen className="w-4 h-4 text-[#006d37] dark:text-[#2ecc71] shrink-0" />
                    <span>دروس الوحدة</span>
                  </h3>
                  <p className="text-[10px] sm:text-[11px] text-[#506072] dark:text-gray-400 leading-5 sm:leading-6">
                    حسب التدرج الرسمي. كبّر الصورة بسرعة ثم افتح الدرس.
                  </p>
                </div>
                <span className="shrink-0 inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-black text-white" style={{ background: domainInfo.color }}>
                  {unifiedLessons.length} دروس
                </span>
              </div>
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
    
    content = content[:start_idx] + replacement + content[end_idx:]

    with open('src/components/LessonsView.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Patched rendering successfully")
else:
    print("Could not find start block")
