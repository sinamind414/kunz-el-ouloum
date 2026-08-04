import re
with open('src/components/LessonsView.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

pattern = re.compile(r'const LESSON_PAGE_FEATURED_ORDER = \[.*?\] as const;', re.DOTALL)
content = pattern.sub('', content)

with open('src/components/LessonsView.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
