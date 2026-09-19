with open('C:/Users/zakaria/Documents/application kunz el ouloum finale/src/lessonData.ts', 'r', encoding='utf-8') as f:
    content = f.read()

old = '    ]\n  },\n  },\n},'
new = '    ]\n  }\n};'

if old not in content:
    raise SystemExit('Old ending not found')
content = content.replace(old, new, 1)

with open('C:/Users/zakaria/Documents/application kunz el ouloum finale/src/lessonData.ts', 'w', encoding='utf-8') as f:
    f.write(content)
print('Fixed file ending')
