import subprocess
result = subprocess.run(
    ['git', 'show', '3c9ffa9:src/lessonData.ts'],
    capture_output=True, cwd='C:/Users/zakaria/Documents/application kunz el ouloum finale',
    encoding='utf-8', errors='replace'
)
if result.returncode != 0:
    raise SystemExit(result.stderr)
with open('C:/Users/zakaria/Documents/application kunz el ouloum finale/src/lessonData.ts', 'w', encoding='utf-8') as f:
    f.write(result.stdout)
print('Restored original lessonData.ts from git')
