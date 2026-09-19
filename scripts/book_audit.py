# -*- coding: utf-8 -*-
# Extrait du livre officiel : titres de sections + verbes d'action utilisés
import io, re, json, os

SRC = r'c:\Users\zakaria\Documents\ARCHIVE_SINAMIND\LIVRE SCOLAIRE SCIENCE BAC\LIVRE FINAL SVT BAC\الكتاب_المصحح_v1.0.md'
OUT = r'c:\Users\zakaria\Documents\application kunz el ouloum finale\audit_livre_dump.txt'

s = io.open(SRC, encoding='utf-8', errors='replace').read()
lines = s.split('\n')

# 1) Titres markdown
heads = []
for i, ln in enumerate(lines):
    t = ln.strip()
    if re.match(r'^#{1,4}\s+\S', t):
        heads.append((i, t))

# 2) Verbes d'action du livre (impératifs + interrogatifs didactiques)
VERBS = ['حلل', 'حلّل', 'فسر', 'فسّر', 'استنتج', 'علل', 'علّل', 'قارن', 'لخص', 'اشرح',
         'استخرج', 'اذكر', 'احسب', 'أنجز', 'انجز', 'ارسم', 'أرسم', 'تعرف', 'حدد',
         'بين', 'بيّن', 'وضح', 'وضّح', 'استخلص', 'اقترح', 'ماذا', 'ما هي', 'كيف', 'لماذا', 'هل']
counts = {}
for v in VERBS:
    counts[v] = len(re.findall(re.escape(v), s))

# 3) Présence des thèmes contestés
THEMES = ['الزمر الدموية', 'الريزوسي', 'دورة الصخور', 'الموارد الجيولوجية',
          'المحيط الحيوي', 'أوفيوليت', 'الأوفيوليت', 'المغناطيسية القديمة',
          'الأنترلوكين', 'البرفورين', 'المورفين', 'الشفرة الوراثية',
          'تنشيط الأحماض الأمينية', 'الصفائح التكتونية', 'التصحر', 'الأقاليم الجيولوجية',
          'كمون الراحة', 'كمون العمل', 'المغماتيت', 'تيارات الحمل']
theme_counts = {t: len(re.findall(re.escape(t), s)) for t in THEMES}

buf = []
buf.append('=== TITRES (markdown headings) : %d ===' % len(heads))
for i, t in heads:
    buf.append(f'{i}: {t}')
buf.append('')
buf.append('=== FREQUENCE DES VERBES DANS LE LIVRE ===')
for v, c in sorted(counts.items(), key=lambda x: -x[1]):
    if c:
        buf.append(f'{v} => {c}')
buf.append('')
buf.append('=== PRESENCE DES THEMES ===')
for t, c in theme_counts.items():
    buf.append(f'{t} => {c}')

io.open(OUT, 'w', encoding='utf-8').write('\n'.join(buf))
print('heads:', len(heads), 'lines:', len(lines))