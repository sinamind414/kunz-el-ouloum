# -*- coding: utf-8 -*-
# Résumé compact : titres + verbes des objectifs par leçon passive
import io, re, json

d = json.load(io.open(r'c:\Users\zakaria\Documents\application kunz el ouloum finale\audit_passive_dump.json', encoding='utf-8'))

VERBS = ['تحديد','تفسير','إثبات','توضيح','مقارنة','تمييز','تفصيل','حساب','شرح','وصف','ترتيب','استنتاج','استخلاص','ربط','بيان','كشف','دراسة','تقدير','تتبع','اختيار','قراءة','تحليل','اقتراح','تعليل','تقييم','صياغة']

def verbs(text):
    found = [v for v in VERBS if v in text]
    return sorted(set(found))

lines = []
for e in d:
    sci = [o for o in e['objectives'] if '🎯' in o]
    ov = sorted(set(sum([verbs(o) for o in sci], [])))
    lines.append(f"{e['key']}\n  TITRE: {e['title']}\n  VERBES: {', '.join(ov) if ov else '(aucun verbe detecte)'}\n")

io.open(r'c:\Users\zakaria\Documents\application kunz el ouloum finale\audit_passive_summary.txt', 'w', encoding='utf-8').write('\n'.join(lines))
print('ok', len(d))
