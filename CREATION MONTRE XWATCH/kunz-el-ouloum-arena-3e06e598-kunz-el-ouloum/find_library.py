with open('C:/Users/zakaria/Documents/application kunz el ouloum finale/src/lessonData.ts', 'r', encoding='utf-8') as f:
    content = f.read()
indices = [i for i in range(len(content)) if content.startswith('LESSON_LIBRARY', i)]
print('LESSON_LIBRARY occurrences:', len(indices), indices)
for idx in indices:
    print('---')
    print(repr(content[max(0,idx-60):idx+120]))
