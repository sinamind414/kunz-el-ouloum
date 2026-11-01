with open('C:/Users/zakaria/Documents/application kunz el ouloum finale/src/lessonData.ts', 'r', encoding='utf-8') as f:
    content = f.read()
pos = 3443
with open('C:/Users/zakaria/AppData/Local/Temp/kilo/lessonContext.txt', 'w', encoding='utf-8') as f:
    f.write('Context around pos 3443:\n')
    f.write(repr(content[max(0,pos-200):pos+200]))
    f.write('\n\nLine 32 full:\n')
    lines = content.split('\n')
    if len(lines) >= 32:
        f.write(lines[31])
    f.write('\n')
