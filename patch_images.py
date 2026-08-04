import re

with open('src/components/LessonsView.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove images from Level 1 (Domains)
domain_pattern = re.compile(r'\{visual && \(\s*<div className="relative">\s*<ZoomableImage[^>]+>\s*<span[^>]+>\s*<ZoomIn[^>]+>\s*تكبير\s*</span>\s*</div>\s*\)\}', re.DOTALL)
content = domain_pattern.sub('', content)

# Also remove them from the featured active lessons (vitrine visuelle)
featured_pattern = re.compile(r'<div className="relative">\s*<ZoomableImage[^>]+>\s*<span[^>]+>\s*<ZoomIn[^>]+>\s*تكبير\s*</span>\s*</div>', re.DOTALL)
content = featured_pattern.sub('', content)

with open('src/components/LessonsView.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Images removed from domains and featured sections.")
