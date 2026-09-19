# -*- coding: utf-8 -*-
# Scan des thèmes dans le TEXTE OCR BRUT du livre officiel (334 p.)
import io, re

SRC = r'c:\Users\zakaria\Documents\ARCHIVE_SINAMIND\LIVRE SCOLAIRE SCIENCE BAC\LIVRE FINAL SVT BAC\LIVRE SVT BAC .txt'
OUT = r'c:\Users\zakaria\Documents\application kunz el ouloum finale\audit_raw_book.txt'

s = io.open(SRC, encoding='utf-8', errors='replace').read()

KEYS = ['الزمر', 'زمرة', 'الريزوس', 'ريزوس', 'نقل الدم', 'ABO', 'Rh ',
        'الأنترلوكين', 'أنترلوكين', 'IL-2', 'التعاون الخلوي',
        'المغماتيت', 'مغماتيت', 'دورة الصخور',
        'الموارد الجيولوجية', 'البترول', 'الغاز الطبيعي', 'المياه الجوفية',
        'المحيط الحيوي', 'التصحر', 'الكثبان', 'الأقاليم',
        'الأوفيوليت', 'أوفيوليت', 'المغناطيسية', 'باليومغناطيسية',
        'كمون الراحة', 'كمون العمل', 'الإدماج العصبي', 'المخدرات',
        'تينيبو', 'بن', 'Matière', 'البرفورين', 'PERFORINE',
        'بكتيريورودوبسين', 'جاغندورف', 'كالفن', 'هيل']

out = []
for k in KEYS:
    c = len(re.findall(re.escape(k), s))
    out.append(f'{k} => {c}')

io.open(OUT, 'w', encoding='utf-8').write('\n'.join(out))
KEYS2 = ['بنيوف', 'بينيوف', 'ميتشل', 'الكيمياؤسموزية', 'كيمياؤسموزية', 'كرية مذنبة',
         'تدرج البروتونات', 'التقلص', 'التضاعف القشري', 'التصادم', 'تجذر',
         'التدرج الجيوتحراري', 'الغوص', 'الظهرة', 'الوسائد البركانية',
         'الأنديزيت', 'الغرانوديوريت', 'الشست الأزرق', 'الإكلوجيت']
out2 = []
for k in KEYS2:
    out2.append(f'{k} => {len(re.findall(re.escape(k), s))}')
io.open(OUT, 'a', encoding='utf-8').write('\n\n=== BATCH 2 ===\n' + '\n'.join(out2))
print('batch2 done')

VAR = ['ABO', 'Rh', 'ريزوس', 'زمر', 'زمرة', 'نقل الدم', 'IL-2', 'أنترلوكين',
       'ميغماتيت', 'مغماتيت', 'دورة الصخور', 'الدورة الصخرية', 'المحيط الحيوي',
       'موارد', 'بترول', 'غاز طبيعي', 'تصحر', 'كثبان', 'أقاليم', 'جرف',
       'بيروكسيد', 'بيرفورين', 'غرانزيم', 'CMH', 'HLA', 'الفيروس', 'SIDA',
       'فقدان المناعة', 'اللقاح', 'التلقيح', 'الذاكرة المناعية', 'الاستجابة الثانوية']

out = []

for v in VAR:
    c = len(re.findall(re.escape(v), s))
    out.append(f'{v} => {c}')

io.open(r'c:\Users\zakaria\Documents\application kunz el ouloum finale\audit_variants.txt', 'w', encoding='utf-8').write('\n'.join(out))
print('done')