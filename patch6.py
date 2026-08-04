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

with open('src/components/LessonsView.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Patched memo successfully")
