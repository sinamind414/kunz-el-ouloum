import re

with open('C:/Users/zakaria/Documents/application kunz el ouloum finale/src/lessonData.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Locate EXPERIMENTAL_LESSONS block
start = content.find('EXPERIMENTAL_LESSONS = {')
end = content.find('};', start)
block = content[start:end+2]

# Extract top-level keys
keys = re.findall(r'"([^"]+)":\s*\{', block)
print(f'Top-level keys in EXPERIMENTAL_LESSONS: {len(keys)}')
for k in keys:
    print(' ', k)

# Check each entry has balanced braces
for m in re.finditer(r'"([^"]+)":\s*\{', block):
    key = m.group(1)
    pos = m.start()
    # find the matching } for this entry (next top-level })
    rest = block[pos:]
    depth = 0
    in_str = False
    esc = False
    str_ch = None
    end_pos = None
    for i, ch in enumerate(rest):
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
                end_pos = pos + i
                break
    if end_pos is None:
        print(f'  {key}: UNBALANCED (no closing)')
    else:
        entry = rest[:i+1]
        commas = entry.count(',')
        print(f'  {key}: balanced, length={len(entry)}, commas={commas} last60={repr(entry[-60:])}')
