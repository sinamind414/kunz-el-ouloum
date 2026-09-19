with open('C:/Users/zakaria/Documents/application kunz el ouloum finale/src/lessonData.ts', 'r', encoding='utf-8') as f:
    content = f.read()
start = content.find('export const EXPERIMENTAL_LESSONS: Record<string, ExperimentalLesson> = {')
depth = 0
in_str = False
str_ch = None
esc = False
end = None
for i in range(start + 79, len(content)):
    ch = content[i]
    if esc:
        esc = False
        continue
    if ch == '\\' and in_str:
        esc = True
        continue
    if ch in '"\'':
        if not in_str:
            in_str = True
            str_ch = ch
        elif str_ch == ch:
            in_str = False
            str_ch = None
        continue
    if in_str:
        continue
    if ch == '{':
        depth += 1
    elif ch == '}':
        depth -= 1
        if depth == 0:
            end = i
            break
with open('C:/Users/zakaria/AppData/Local/Temp/kilo/endpos.txt', 'w', encoding='utf-8') as out:
    out.write(f'start={start}\nend={end}\n')
    out.write('Context at close:\n')
    out.write(repr(content[max(0,end-60):end+20]))
    out.write('\n')
