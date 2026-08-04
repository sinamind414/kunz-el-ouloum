import re

with open('src/components/LessonsView.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Match the div containing the ZoomableImage and remove it.
# Start at: <div className="relative w-20 shrink-0 sm:w-24">
# End at: </div>
# Followed by: <div className="min-w-0 flex-1 flex flex-col gap-2">

pattern = re.compile(r'<div className="relative w-20 shrink-0 sm:w-24">[\s\S]*?<ZoomIn className="w-2\.5 h-2\.5" \/> تكبير\s*<\/span>\s*<\/div>', re.DOTALL)
content = pattern.sub('', content)

with open('src/components/LessonsView.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Removed thumbnail images from lessons list.")
