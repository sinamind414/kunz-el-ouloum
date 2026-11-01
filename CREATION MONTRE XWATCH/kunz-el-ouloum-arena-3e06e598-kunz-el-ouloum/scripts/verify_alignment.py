# -*- coding: utf-8 -*-
# Vérification finale : titres + verbes des objectifs dans lessonData.ts
import io, re

P = r'c:\Users\zakaria\Documents\application kunz el ouloum finale\src\lessonData.ts'
s = io.open(P, encoding='utf-8').read()

pat = re.compile(r'"([a-z0-9_]+)":\s*\{\s*titleAr:\s*`([^`]*)`,\s*breadcrumb:\s*`([^`]*)`,\s*objectives:\s*\[([^\]]*)\]', re.S)
MASDAR = ['تحديد', 'تفسير', 'إثبات', 'توضيح', 'مقارنة', 'تمييز', 'تفصيل', 'حساب',
          'اختيار', 'ربط', 'بيان', 'كشف', 'تعليل', 'تحليل', 'استنتاج', 'استخلاص', 'دراسة', 'تقدير']
IMPER = ['حدّد', 'فسّر', 'بيّن', 'وضّح', 'قارن', 'صف', 'احسب', 'استنتج', 'استخلص', 'حلّل', 'علّل', 'اقترح', 'تعرّف', 'احسب']

rows = []
n_masdar = 0
for m in pat.finditer(s):
    key, title, crumb, obj = m.groups()
    first = re.findall(r'`([^`]*)`', obj)
    first_sci = [o for o in first if '🎯' in o]
    v = [i for i in IMPER if i in obj]
    left = [x for x in MASDAR if re.search(r'(?<!ال)' + x + r'(?!\w)', obj)]
    if left:
        n_masdar += 1
    rows.append('%-28s | %-58s | %s' % (key, title[:56], ','.join(v) or '-'))
    if left:
        rows.append('     masdar restant: ' + ','.join(left))

io.open(r'c:\Users\zakaria\Documents\application kunz el ouloum finale\audit_final_verif.txt', 'w', encoding='utf-8').write(
    'entrées: %d | entrées avec masdar restant: %d\n\n' % (len(rows), n_masdar) + '\n'.join(rows))
print('entries:', len([r for r in rows if not r.startswith('    ')]), '| masdar-left:', n_masdar)