import re

with open('src/components/DocumentAnalysisView.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Insert the CockpitChecklist just above the <textarea>
pattern = re.compile(r'<textarea', re.DOTALL)
replacement = """<CockpitChecklist verb={q.verb} verbColor={VERB_COLOR[q.verb] || '#006d37'} />\n\n        <textarea"""

content = pattern.sub(replacement, content, count=1)

with open('src/components/DocumentAnalysisView.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("CockpitChecklist inserted.")
