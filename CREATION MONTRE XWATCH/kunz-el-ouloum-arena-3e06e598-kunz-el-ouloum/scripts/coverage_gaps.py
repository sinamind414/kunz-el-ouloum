# -*- coding: utf-8 -*-
# Contexte authentique du manuel sur le migmatite / التضاعف القشري / شواهد التقلص
import io, re

SRC = r'c:\Users\zakaria\Documents\ARCHIVE_SINAMIND\LIVRE SCOLAIRE SCIENCE BAC\LIVRE FINAL SVT BAC\LIVRE SVT BAC .txt'
OUT = r'c:\Users\zakaria\Documents\application kunz el ouloum finale\audit_migmatite_ctx.txt'

s = io.open(SRC, encoding='utf-8', errors='replace').read()
lines = s.split('\n')

KEY = ['مغماتيت', 'ميغماتيت', 'التقلص', 'غرونا', 'التضاعف', 'سحنة', 'أومفيبوليت']
rows = []
for i, ln in enumerate(lines):
    if any(k in ln for k in KEY):
        rows.append('[%d] %s' % (i + 1, ln.strip()[:400]))
io.open(OUT, 'w', encoding='utf-8').write('\n'.join(rows[:120]))
print('matches:', len(rows))