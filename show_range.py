with open('C:/Users/zakaria/Documents/application kunz el ouloum finale/src/lessonData.ts', 'r', encoding='utf-8') as f:
    lines = f.readlines()
with open('C:/Users/zakaria/AppData/Local/Temp/kilo/ranges.txt', 'w', encoding='utf-8') as out:
    for i in range(163, min(270, len(lines))):
        out.write(f'{i+1}: {lines[i].rstrip()}\n')
