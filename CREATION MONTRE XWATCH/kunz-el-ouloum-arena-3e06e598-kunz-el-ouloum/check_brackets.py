with open('C:/Users/zakaria/Documents/application kunz el ouloum finale/src/lessonData.ts', 'r', encoding='utf-8') as f:
    content = f.read()

stack = []
in_str = False
str_char = None
escape = False
line = 1
col = 0

for i, ch in enumerate(content):
    col += 1
    if ch == '\n':
        line += 1
        col = 0
        continue
    if escape:
        escape = False
        continue
    if ch == '\\' and in_str:
        escape = True
        continue
    if ch in ('"', "'", '`'):
        if not in_str:
            in_str = True
            str_char = ch
        elif str_char == ch:
            in_str = False
            str_char = None
        continue
    if in_str:
        continue
    if ch in ('{', '[', '(', '}', ']', ')'):
        if ch in ('{', '[', '('):
            stack.append((ch, line, col, i))
        else:
            if not stack:
                with open('C:/Users/zakaria/AppData/Local/Temp/kilo/lessonContext.txt', 'a', encoding='utf-8') as out:
                    out.write(f'\nUnexpected closing {ch} at line {line} col {col} index {i}\n')
                break
            opening, oline, ocol, oi = stack.pop()
            if (opening, ch) not in (('{','}'), ('[',']'), ('(',')')):
                with open('C:/Users/zakaria/AppData/Local/Temp/kilo/lessonContext.txt', 'a', encoding='utf-8') as out:
                    out.write(f'\nMismatch at line {line} col {col} index {i}: got {ch}, expected closing for {opening} at line {oline} col {ocol}\n')
                    out.write('Context:\n')
                    out.write(repr(content[max(0,i-200):i+200]))
                    out.write('\n')
                break

with open('C:/Users/zakaria/AppData/Local/Temp/kilo/lessonContext.txt', 'a', encoding='utf-8') as out:
    out.write(f'\nFinal stack size: {len(stack)}\n')
    for item in stack[-5:]:
        out.write(f'  {item}\n')
