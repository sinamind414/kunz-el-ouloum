import re

with open('src/components/LessonsView.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the cleanLessonTitle function to not strip the lesson numbers,
# since the user wants exactly the manual's format which includes "الدرس X :"
old_func = """function cleanLessonTitle(title: string): string {
  return title.replace(/^\s*(?:الدرس|الوحدة)\s+\d+\s*:\s*/, '').trim();
}"""

new_func = """function cleanLessonTitle(title: string): string {
  // We keep the "الدرس X :" part because the user wants strictly the book format
  return title.trim();
}"""

content = content.replace(old_func, new_func)

# We also remove the "الدرس {index + 1}" badge in the UI since the title now includes it
old_badge = """<span className="inline-flex items-center rounded-full bg-[#f2f0e8] dark:bg-white/5 px-2 py-0.5 text-[9px] sm:text-[10px] font-black text-[#6a5b43] dark:text-gray-300">
                              الدرس {index + 1}
                            </span>"""
new_badge = ""
content = content.replace(old_badge, new_badge)

with open('src/components/LessonsView.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Title patch applied.")
