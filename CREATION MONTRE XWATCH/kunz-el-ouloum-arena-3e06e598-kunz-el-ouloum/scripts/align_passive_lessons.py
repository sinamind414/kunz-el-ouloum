# -*- coding: utf-8 -*-
"""
Aligne les leçons passives (src/lessonData.ts) sur le LIVRE OFFICIEL :
  (a) titres  : libellé du TDM officiel (book_tdm_clean.md) — sans mentir sur le contenu
  (b) verbes  : masdar -> impératif canonique (livre + src/data/reflexes.ts)
  (c) marquage « إثراء ثقافي » pour les 3 leçons hors manuel
Référence : docs/AUDIT_LECONS_PASSIVES_VS_LIVRE.md
"""
import io, re

P = r'c:\Users\zakaria\Documents\application kunz el ouloum finale\src\lessonData.ts'
s = io.open(P, encoding='utf-8').read()
orig = s

# ── (b) masdar -> impératif canonique ───────────────────────────────────────
VERB_MAP = [
    ('استنتاج', 'استنتج'), ('استخلاص', 'استخلص'), ('استخراج', 'استخرج'),
    ('تحديد', 'حدّد'), ('تفسير', 'فسّر'), ('إثبات', 'بيّن'), ('توضيح', 'وضّح'),
    ('مقارنة', 'قارن'), ('تمييز', 'حدّد'), ('تفصيل', 'صف'), ('حساب', 'احسب'),
    ('اختيار', 'حدّد'), ('ربط', 'بيّن'), ('بيان', 'بيّن'), ('كشف', 'استنتج'),
    ('تعليل', 'علّل'), ('تحليل', 'حلّل'), ('دراسة', 'حلّل'), ('تقدير', 'قدّر'),
    ('ترتيب', 'رتّب'), ('صياغة', 'صُغ'), ('إنجاز', 'أنجز'),
]

# ── (a) titres alignés sur le TDM officiel (véridiques par rapport au contenu) ─
TITLE_MAP = {
    'phase1_chapitres_1_2':      'الدرس 1 : تذكير بالمكتسبات ومقر تركيب البروتين',
    'phase1_chapitres_1_2_2':    'الدرس 2 : الشفرة الوراثية وتنشيط الأحماض الأمينية',
    'lecon_transcription':       'الدرس 3 : استنساخ المعلومات الوراثية الموجودة على مستوى ADN',
    'phase2_chapitres_3_4':      'الدرس 4 : الترجمة ومراحل الترجمة في الريبوزوم',
    'phase2_chapitres_3_4_2':    'الدرس 5 : مستويات البنية الفراغية للبروتينات',
    'lecon_representation':      'الدرس 1 : تمثيل البنية الفراغية للبروتين',
    'phase3_chapitres_5_6':      'الدرس 3 : العلاقة بين بنية ووظيفة البروتين',
    'phase3_chapitres_5_6_2':    'الدرس 1 : مفهوم الإنزيم وأهميته (الخصوصية المزدوجة)',
    'lecon_activite_structure':  'الدرس 2 : النشاط الإنزيمي وعلاقته ببنية الإنزيم',
    'phase4_chapitres_7_8':      'الدرس 3 : تأثير تغير درجة pH الوسط على نشاط الإنزيم',
    'phase4_chapitres_7_8_2':    'الدرس 4 : تأثير تغيرات درجة الحرارة على نشاط الإنزيم',
    'phase5_chapitres_9_10':     'الدرس 2 : الذات واللاذات (CMH / HLA والزمر الدموية)',
    'phase5_chapitres_9_10_2':   'الدرس 2 : نظام الزمر الدموية ABO والعامل الريزوسي Rh',
    'phase6_chapitres_11_12':    'الدرس 5 : مصدر الأجسام المضادة والاستجابة الأولية والثانوية',
    'phase6_chapitres_11_12_2':  'الدرس 4 : المعقد المناعي والتخلص منه (البلعمة)',
    'phase7_chapitres_13_14':    'الدرس 7 : طرق تأثير اللمفاويات LTc على الخلية المصابة',
    'phase7_chapitres_13_14_2':  'الدرس 9 : تحفيز الخلايا LB و LT (التعاون الخلوي)',
    'phase8_chapitres_15_16':    'الدرس 4 : كمون الراحة',
    'phase8_chapitres_15_16_2':  'الدرس 5 : كمون العمل',
    'phase9_chapitres_17_18':    'الدرس 3 : آلية النقل المشبكي (الأستيل كولين ACh)',
    'phase9_chapitres_17_18_2':  'الدرس 6 : آلية الإدماج العصبي (PPSE / PPSI)',
    'phase10_chapitres_19_20':   'الدرس 7 : تأثير المخدرات على مستوى المشابك',
    'phase10_chapitres_19_20_2': 'الدرس 2 : مقر عملية التركيب الضوئي وما فوق بنية الصانعة الخضراء',
    'phase11_chapitres_21_22':   'الدرس 3 : تفاعلات المرحلة الكيموضوئية والتحلل الضوئي للماء',
    'phase12_chapitres_23_24':   'الدرس 4 : تفاعلات المرحلة الكيميوحيوية (حلقة كالفن)',
    'phase13_chapitres_25_26':   'الدرس 3 : التحلل السكري (الغلوكوز إلى حمض البيروفيك)',
    'phase13_chapitres_25_26_2': 'الدرس 4 : مراحل تفكك حمض البيروفيك (تفاعلات حلقة كريبس)',
    'phase14_chapitres_27_28':   'الدرس 5 : الفسفرة التأكسدية',
    'phase14_chapitres_27_28_2': 'الدرس 6 : آليات تحويل الطاقة في وسط لا هوائي (التخمر)',
    'phase15_chapitres_29_30':   'الدرس 1 : التحولات الطاقوية على المستوى الخلوي',
    'phase15_chapitres_29_30_2': 'الدرس 6 : دورة الطاقة والمادة في المحيط الحيوي (إثراء ثقافي)',
    'phase16_chapitres_31_32':   'الدرس 1 : تحديد الصفائح التكتونية',
    'phase16_chapitres_31_32_2': 'الدرس 2 : حركات الصفائح التكتونية',
    'phase18_chapitres_35_36':   'الدرس 3 : الطاقة الداخلية للكرة الأرضية',
    'phase18_chapitres_35_36_2': 'الدرس 6 : تيارات الحمل الحراري (محرك الصفائح)',
    'phase19_chapitres_37_38':   'الدرس 1 : الموجات الزلزالية',
    'phase19_chapitres_37_38_2': 'الدرس 2 : التركيب الكيميائي لصخور القشرة الأرضية والمعطف (البرنس)',
    'phase20_chapitres_39_40':   'الدرس 3 : نمذجة البنية الداخلية للكرة الأرضية',
    'phase17_chapitres_33_34':   'الدرس 4 : الظواهر المرتبطة بالغوص',
    'phase17_chapitres_33_34_2': 'الدرس 5 : اختفاء اللوح المحيطي والظواهر المرتبطة بالغوص',
    'phase20_chapitres_39_40_2': 'الدرس 7 : شواهد التقلص (الطيات والفوالق)',
    'phase21_chapitres_41_42':   'الدرس 2 : المغماتية وتشكل اللوح المحيطي',
    'phase21_chapitres_41_42_2': 'الدرس 6 : التضاريس الناجمة عن التصادم',
    'phase22_chapitres_43_44':   'الدرس 5 : دورة الصخور في الطبيعة (إثراء ثقافي)',
    'phase22_chapitres_43_44_2': 'الدرس 6 : الموارد الجيولوجية والطاقوية في الجزائر (إثراء ثقافي)',
}

HORS_MANUEL = {
    'phase22_chapitres_43_44',
    'phase22_chapitres_43_44_2',
    'phase15_chapitres_29_30_2',
}

report = {'titles': 0, 'verb_lines': 0, 'flags': 0}
pat_entry = re.compile(r'(\n  "([a-z0-9_]+)": \{\n)(.*?)(\n  \},)', re.S)


def convert_verbs(line: str) -> str:
    """Convertit les masdar en impératifs dans une ligne `objectives:`.
    Le lookbehind négatif (?!ال) protège les formes définies (التمييز…)."""
    def repl(m):
        return VERB_I(m.group(1))
    for src, dst in VERB_MAP:
        line = re.sub(r'(?<!ال)' + src + r'(?!\w)', dst, line)
    return line


def VERB_I(x):
    return x


def fix_entry(m):
    head, key, body, tail = m.groups()

    # (a) titre TDM
    if key in TITLE_MAP:
        body, n = re.subn(r'titleAr: `[^`]*`', 'titleAr: `%s`' % TITLE_MAP[key], body, count=1)
        if n:
            report['titles'] += 1

    # (b) verbes
    out_lines = []
    for line in body.split('\n'):
        if 'objectives:' in line and '🎯' in line:
            new = convert_verbs(line)
            if new != line:
                report['verb_lines'] += 1
            line = new
        out_lines.append(line)
    body = '\n'.join(out_lines)

    # (c) marquage hors manuel
    if key in HORS_MANUEL:
        marker = 'إثراء ثقافي — غير وارد في الكتاب المدرسي المقرر'
        if marker not in body:
            m2, n = re.subn(
                r'(objectives: \[.*?)(\],)',
                r'\1, `⚠️ إثراء ثقافي — غير وارد في الكتاب المدرسي المقرر ولا في موارد المنهاج`\2',
                body,
                count=1,
                flags=re.S,
            )
            if n:
                body = m2
                report['flags'] += 1

    return head + body + tail


s = pat_entry.sub(fix_entry, s)
io.open(P, 'w', encoding='utf-8').write(s)
print('titles:', report['titles'], '| verb-lines:', report['verb_lines'], '| flags:', report['flags'])
print('bytes diff:', len(s) - len(orig))