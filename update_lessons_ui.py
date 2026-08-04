import re

with open('src/components/LessonsView.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update the Dictionnaire title to be exactly: مكتبة المصطلحات SVT — Concepts SVT
content = content.replace(
    '<h3 className="text-base font-black text-[#1f1c0b] dark:text-gray-100 leading-snug">قاموس المصطلحات</h3>',
    '<h3 className="text-base font-black text-[#1f1c0b] dark:text-gray-100 leading-snug">مكتبة المصطلحات SVT</h3>'
)
content = content.replace(
    '<p className="text-[11px] text-[#506072] dark:text-gray-400 mt-1">Concepts SVT — مفاهيم علمية</p>',
    '<p className="text-[11px] text-[#506072] dark:text-gray-400 mt-1">Concepts SVT</p>'
)

# 2. Remove the green badge "تفاعلي حديث" completely to avoid visual clutter
pattern_badge = re.compile(r'\{\s*lesson\.type\s*===\s*\'active\'\s*&&\s*\([\s\S]*?تفاعلي حديث\s*<\/span>\s*\)\s*\}', re.DOTALL)
content = pattern_badge.sub('', content)

# 3. Clean up the text "كبّر الصورة بسرعة ثم افتح الدرس" since images are removed
content = content.replace(
    'حسب التدرج الرسمي. كبّر الصورة بسرعة ثم افتح الدرس.',
    'حسب التدرج الرسمي لوزارة التربية الوطنية.'
)

with open('src/components/LessonsView.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated UI texts successfully.")
