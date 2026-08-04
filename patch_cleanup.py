import re

with open('src/components/LessonsView.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove the entire "Vitrine visuelle" section because without images, it's just redundant text.
# It starts at {/* Vitrine visuelle and ends before {/* LEVEL 1
pattern_vitrine = re.compile(r'\{\/\*\s*Vitrine visuelle.*?\*\/\}.*?\{\/\*\s*LEVEL 1\s*—', re.DOTALL)
content = pattern_vitrine.sub('{/* LEVEL 1 —', content)

# 2. Remove the "Raccourci — Leçons actives" section at the end of LEVEL 1
# It starts at {/* Raccourci — Leçons actives and ends before {/* LEVEL 1b
pattern_raccourci = re.compile(r'\{\/\*\s*Raccourci — Leçons actives.*?\*\/\}.*?\{\/\*\s*LEVEL 1b\s*—', re.DOTALL)
content = pattern_raccourci.sub('{/* LEVEL 1b —', content)

# 3. Rename "مكتبة المصطلحات" to "قاموس المصطلحات"
content = content.replace('مكتبة المصطلحات', 'قاموس المصطلحات')

with open('src/components/LessonsView.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Cleaned up remaining sections.")
