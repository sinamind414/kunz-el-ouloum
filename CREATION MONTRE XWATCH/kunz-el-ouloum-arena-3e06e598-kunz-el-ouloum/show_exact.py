with open('C:/Users/zakaria/Documents/application kunz el ouloum finale/src/lessonData.ts', 'r', encoding='utf-8') as f:
    content = f.read()

pos = 3178
with open('C:/Users/zakaria/AppData/Local/Temp/kilo/lessonContext.txt', 'a', encoding='utf-8') as out:
    out.write('\nExact bytes around index 3178:\n')
    out.write(repr(content[max(0,pos-80):pos+80]))
    out.write('\nChars:\n')
    out.write(''.join(f'{i+max(0,pos-80)}:{repr(ch)}\n' for i,ch in enumerate(content[max(0,pos-80):pos+80])))
