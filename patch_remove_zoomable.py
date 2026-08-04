import re
with open('src/components/LessonsView.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("import ZoomableImage from './ZoomableImage';\n", "")

with open('src/components/LessonsView.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
