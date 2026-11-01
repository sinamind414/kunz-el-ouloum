with open('C:/Users/zakaria/AppData/Local/Temp/kilo/original_lessonData.ts', 'r', encoding='utf-8') as f:
    content = f.read()
start = content.find('EXPERIMENTAL_LESSONS')
end = content.rfind('};')
block = content[start:end]
keys = [line.strip().split('"')[1] for line in block.split('\n') if '"' in line and ': {' in line and line.strip().startswith('"')]
with open('C:/Users/zakaria/AppData/Local/Temp/kilo/keys.txt', 'w', encoding='utf-8') as out:
    out.write(f'count={len(keys)}\n')
    out.write('\n'.join(keys))
