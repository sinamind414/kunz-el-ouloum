const fs = require('fs');

const code = fs.readFileSync('src/components/LessonsView.tsx', 'utf8');

const newCode = code.replace(/<div className="flex flex-col items-end gap-1">[\s\S]*?<\/div>\s*<\/div>\s*\{activeLessonsForSelectedUnit\.length > 0 && \([\s\S]*?<\/section>\s*\)\}\s*<section className="space-y-2\.5 rounded-2xl border border-\[\#e2dabf\]\/50 dark:border-white\/10 bg-\[\#fffdf9\] dark:bg-\[\#131915\] p-2\.5 sm:p-3">[\s\S]*?<\/section>/m, `
            <div className="flex items-center justify-between mb-3 px-1">
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
                    className={\`rounded-2xl sm:rounded-3xl border p-2.5 sm:p-3 shadow-sm transition-all \${
                      isSelected
                        ? 'bg-[var(--dl)] border-[var(--dc)] ring-1 ring-[var(--dc)]/15'
                        : 'bg-white dark:bg-[#1a211c] border-[#e2dabf]/50 dark:border-white/10 hover:border-[#006d37]/40'
                    }\`}
                  >
                    <div className="flex items-start gap-2.5 sm:gap-3">
                      <div className="relative w-20 shrink-0 sm:w-24">
                        <ZoomableImage
                          src={lesson.imageSrc}
                          alt={lesson.altAr}
                          className={\`w-full aspect-square rounded-xl sm:rounded-2xl object-cover bg-[#eef3ef] dark:bg-[#0c0f0d] \${lesson.imageSrc.includes('.jpg') || lesson.imageSrc.includes('.png') ? 'image-svt-filter' : ''}\`}
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
                          <h5 className={\`text-[11px] sm:text-xs leading-5 sm:leading-6 max-h-10 sm:max-h-12 overflow-hidden \${isSelected ? 'font-black text-[var(--dc)] dark:text-[var(--dc)]' : 'font-bold text-[#504441] dark:text-gray-200'}\`}>
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
                          className={\`w-full py-2 sm:py-2.5 rounded-xl sm:rounded-2xl text-[11px] sm:text-xs font-black shadow-sm transition-all cursor-pointer \${
                            isSelected
                              ? 'bg-[var(--dc)] text-white hover:brightness-95'
                              : 'bg-white dark:bg-[#101613] border border-[#e2dabf]/60 dark:border-white/10 text-[#1f1c0b] dark:text-gray-100 hover:bg-[var(--dl)]'
                          }\`}
                        >
                          افتح هذا الدرس ←
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </section>
`);

fs.writeFileSync('src/components/LessonsView.tsx', newCode);
console.log('Patched UI section!');
