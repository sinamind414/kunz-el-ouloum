with open('src/components/LessonsView.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("import { BookOpen, Layers, Dna, Zap, Globe2, ChevronRight, Sparkles, ChevronLeft } from 'lucide-react';", "import { BookOpen, Layers, Dna, Zap, Globe2, ChevronRight } from 'lucide-react';")

import re
pattern = re.compile(r'const featuredActiveLessons = useMemo\(\s*\(\) => LESSON_PAGE_FEATURED_ORDER.*?,\s*\[\]\s*\);', re.DOTALL)
content = pattern.sub('', content)

with open('src/components/LessonsView.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
