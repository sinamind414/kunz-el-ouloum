with open('C:/Users/zakaria/Documents/application kunz el ouloum finale/src/lessonData.ts', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find the line with EXPERIMENTAL_SLUGS
slug_line = None
for i, line in enumerate(lines):
    if line.startswith('export const EXPERIMENTAL_SLUGS'):
        slug_line = i
        break

if slug_line is None:
    raise SystemExit('EXPERIMENTAL_SLUGS not found')

# Find the closing }; just before EXPERIMENTAL_SLUGS
close_line = None
for i in range(slug_line - 1, slug_line - 10, -1):
    if lines[i].strip() == '};':
        close_line = i
        break

if close_line is None:
    raise SystemExit('Closing }; not found before EXPERIMENTAL_SLUGS')

# Find the last original entry line before };
last_entry_line = None
for i in range(close_line - 1, close_line - 10, -1):
    if lines[i].strip().startswith('"phase') or lines[i].strip().startswith('"lecon'):
        last_entry_line = i
        break

print(f'slug_line={slug_line+1}, close_line={close_line+1}, last_entry_line={last_entry_line+1 if last_entry_line else None}')

# Show what's between last_entry and close
with open('C:/Users/zakaria/AppData/Local/Temp/kilo/insert_info.txt', 'w', encoding='utf-8') as out:
    out.write(f'slug_line={slug_line+1}\n')
    out.write(f'close_line={close_line+1}\n')
    out.write(f'last_entry_line={last_entry_line+1 if last_entry_line else None}\n')
    out.write('Lines around close:\n')
    for i in range(max(0, close_line-3), min(len(lines), slug_line+2)):
        out.write(f'{i+1}: {repr(lines[i])}\n')
