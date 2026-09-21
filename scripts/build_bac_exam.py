#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
build_bac_exam.py — injection MÉCANIQUE des 3 tests bac du « PROGRAMME NATIONAL
SVT CLAUDE OPUS - Copie.MD » (upload master 5548459) vers src/data/bacExam.ts.

Règle standing : transcription à la main interdite → ce script extrait les segments,
applique 3 transformations DOCUMENTÉES (ci-dessous), et génère le TS (chaînes
JSON.stringify : zéro risque d'échappement).

Transformations appliquées (aucune autre) :
  T1 (D1 corrigé, ex3 Q3) — correction LOGIQUE d'une contradiction interne de la
     source : la question demande « هل كان ليُصاب بالحصبة؟ » ; la source répond
     « نعم، لو لُقِّح … نفس الحماية بدون معاناة » (= il aurait été PROTÉGÉ, donc
     « لا »). Remplacé : « نعم، لو لُقِّح: » → « لا، لم يكن ليُصاب (أو بأعراض خفيفة
     جداً): » — le reste de la phrase source (mécanisme mémoire) est conservé.
  T2 (D2 corrigé, ex4) — alignement référentiel : « 36-38 ATP » du schéma →
     « 38 ATP » (livre officiel l.4155 « 38ATP », l.4173) + note moderne ajoutée
     en fin de corrigé D2.
  T3 — notice « données simulées » ajoutée au niveau TS (champ notice), pas dans
     le texte extrait.

Le verrou src/data/bacExam.lock.test.ts re-vérifie : Σ barèmes = 20/test,
Σ questions = 5/exercice, T1/T2 appliqués, notices présentes, ancrages livre.
"""
import json
import re
import sys
from pathlib import Path

SRC = Path('uploads_externes/PROGRAMME NATIONAL SVT CLAUDE OPUS - Copie.MD')
OUT = Path('src/data/bacExam.ts')

t = SRC.read_text(encoding='utf-8')

# ── extraction par marqueurs ────────────────────────────────────────────────
def segment(start_marker: str, corrige_marker: str, end_marker: str):
    i0 = t.index(start_marker)
    i1 = t.index(corrige_marker, i0)
    i2 = t.index(end_marker, i1)
    return t[i0:i1].strip(), t[i1:i2].strip()

enonce_d1, corrige_d1 = segment(
    '## 🏆 اختبار تجريبي شامل — المجال الأول',
    '## 🔑 سلّم التنقيط التفصيلي',
    '> 🎉',
)
enonce_d2, corrige_d2 = segment(
    '## 🏆 اختبار تجريبي شامل — المجال الثاني',
    '## 🔑 سلّم التنقيط التفصيلي',
    '## 🎓 نصائح للبكالوريا — المجال الثاني',
)
enonce_d3, corrige_d3 = segment(
    '## 🏆 اختبار تجريبي شامل — المجال الثالث',
    '## 🔑 سلّم التنقيط الشامل',
    '## 🎓 نصائح للبكالوريا — المجال الثالث',
)

# ── T1 : correction logique (contradiction interne source) ─────────────────
assert corrige_d1.count('نعم، لو لُقِّح:') == 1, 'T1 : marqueur introuvable'
corrige_d1 = corrige_d1.replace('نعم، لو لُقِّح:', 'لا، لم يكن ليُصاب (أو بأعراض خفيفة جداً):')

# ── T2 : alignement 38 ATP (référentiel livre l.4155/4173) ─────────────────
# 2 occurrences dans le corrigé D2 (corrigé Q3 + schéma ex4) — les deux normalisées.
assert corrige_d2.count('36-38 ATP') >= 1, 'T2 : marqueur introuvable'
corrige_d2 = corrige_d2.replace('36-38 ATP', '38 ATP')
corrige_d2 += ('\n\n> 📌 ملاحظة مرجعية (ajout vérification 2026-09-20) : بعض المراجع '
               'الحديثة تُقدّر الحصيلة بـ 30-32 ATP تبعاً لتكلفة نقل NADH؛ المعتمد في '
               'البكالوريا والكتاب المدرسي الرسمي: 38 ATP.\n')

# ── parsing des exercices + questions ──────────────────────────────────────
Q_MAIN = re.compile(r'^\*\*(\d+)\.\*\*\s*(.*)$')
PT = re.compile(r'\((\d+(?:\.\d+)?)\s*ن\)')
EX_HDR = re.compile(r'^###\s+📝\s+التمرين\s+(\d+)\s+—\s+\((\d+)\s*نقاط\)\s*—\s*(.*)$')


def parse_exercices(enonce: str):
    """en-tête (instructions) + liste d'exercices {titre, points, enonce, questions}."""
    lignes = enonce.splitlines()
    # en-tête = tout ce qui précède le 1er « ### 📝 التمرين »
    i_first = next(i for i, l in enumerate(lignes) if '📝 التمرين' in l)
    entete = '\n'.join(lignes[:i_first]).strip()
    # découpage par exercice
    starts = [i for i, l in enumerate(lignes) if EX_HDR.match(l.strip())]
    exercices = []
    for k, s in enumerate(starts):
        m = EX_HDR.match(lignes[s].strip())
        num, pts, sujet = m.group(1), int(m.group(2)), m.group(3).strip()
        fin = starts[k + 1] if k + 1 < len(starts) else len(lignes)
        corps = lignes[s + 1:fin]
        # questions : ligne principale **N.** … ; si pas de (X ن) sur la ligne
        # principale → somme des (Y ن) des sous-lignes (ex. D1 ex1 Q4 أ/ب).
        questions = []
        cur = None
        for l in corps:
            mm = Q_MAIN.match(l.strip())
            if mm:
                if cur: questions.append(cur)
                pts_main = PT.findall(mm.group(2))
                cur = {
                    'num': mm.group(1),
                    'text': mm.group(2).strip(),
                    'points': float(pts_main[0]) if pts_main else 0.0,
                    '_sub': not bool(pts_main),
                }
            elif cur is not None:
                if cur['_sub']:
                    cur['points'] += sum(float(x) for x in PT.findall(l))
                cur['text'] += '\n' + l.rstrip()
        if cur: questions.append(cur)
        for q in questions:
            q.pop('_sub', None)
            q['text'] = q['text'].strip()
            q['points'] = round(q['points'], 2)
            assert q['points'] > 0, f'D question sans points : {q["text"][:40]}'
        total_q = round(sum(q['points'] for q in questions), 2)
        assert total_q == float(pts), f'Σ questions {total_q} ≠ {pts} (تمرين {num})'
        exercices.append({
            'titre': f'التمرين {num} — {sujet}',
            'points': pts,
            'enonce': '\n'.join(corps).strip(),
            'questions': questions,
        })
    return entete, exercices


def parse_duree(enonce: str) -> int:
    m = re.search(r'المدة:\s*(\d+)\s*ساعات', enonce)
    assert m, 'durée introuvable'
    return int(m.group(1)) * 60

NOTICE = ('⚠️ ملاحظة: الوثائق والقيم العددية في هذا الاختبار بيانات تدريبية مُحاكاة '
          'من مصدر مراجعة خارجي، وليست قياسات تجريبية منشورة. المرجع العلمي المعتمد '
          'للتصحيح: الكتاب المدرسي الرسمي.')

tests = []
for dom, (en, co) in enumerate([(enonce_d1, corrige_d1), (enonce_d2, corrige_d2),
                                (enonce_d3, corrige_d3)], 1):
    entete, exercices = parse_exercices(en)
    assert len(exercices) == 4, f'D{dom} : {len(exercices)} exercices ≠ 4'
    assert sum(e['points'] for e in exercices) == 20
    tests.append({
        'id': f'bac_d{dom}',
        'domaine': dom,
        'titreAr': f'اختبار تجريبي شامل — المجال {"الأول الثاني الثالث".split()[dom-1]}',
        'dureeMin': parse_duree(entete),
        'notice': NOTICE,
        'enTete': entete,
        'exercices': exercices,
        'corrigeParExercice': [co],  # placeholder, remplacé ci-dessous
    })
# corriger la structure : corrigé global → ventiler par exercice (découpage par titre)
# D1/D2 : « ### التمرين N (5 نقاط): » ; D3 : « **التمرين N (5 نقاط):** »
for ti, (dom, co) in enumerate([(1, corrige_d1), (2, corrige_d2), (3, corrige_d3)]):
    parts = re.split(r'^(?:###\s*|\*\*)\*{0,2}التمرين\s+(\d+)\s*\(\d+\s*نقاط\):\*{0,2}\s*$',
                     co, flags=re.M)
    # parts = [pré, num, corps, num, corps, ...]
    morceaux = {}
    for k in range(1, len(parts) - 1, 2):
        morceaux[int(parts[k])] = (parts[k + 1] or '').strip()
    exs = tests[ti]['exercices']
    assert sorted(morceaux) == [1, 2, 3, 4], f'D{dom} : corrigés {sorted(morceaux)}'
    for e in exs:
        num = int(re.search(r'التمرين\s+(\d+)', e['titre']).group(1))
        e['corrige'] = morceaux[num]
    tests[ti].pop('corrigeParExercice')

# ── vérifications finales avant écriture ───────────────────────────────────
raw_all = json.dumps(tests, ensure_ascii=False)
assert '36-38' not in raw_all, 'T2 non appliqué'
assert 'نعم، لو لُقِّح' not in raw_all, 'T1 non appliqué'
assert raw_all.count('38 ATP') >= 2
assert 'الظهيرة' not in raw_all

# ── écriture TS (JSON.stringify : échappement mécanique) ───────────────────
def j(s): return json.dumps(s, ensure_ascii=False)

out = []
out.append('// bacExam.ts — FICHIER GÉNÉRÉ par scripts/build_bac_exam.py — NE PAS ÉDITER À LA MAIN.')
out.append('// Source : « PROGRAMME NATIONAL SVT CLAUDE OPUS - Copie.MD » (upload GitHub master 5548459),')
out.append('// extraction mécanique des 3 tests bac + corrigés. Transformations documentées dans le script :')
out.append('// T1 correction logique D1-ex3-Q3 (contradiction interne de la source) ; T2 alignement 38 ATP')
out.append('// (livre officiel l.4155/4173 + note moderne) ; T3 notice « données simulées » par test.')
out.append('// Vérifié : docs/ANALYSE_PROGRAMME_NATIONAL_2026-09-20.md. Verrou : bacExam.lock.test.ts.')
out.append('')
out.append('export interface BacQuestion { num: string; text: string; points: number }')
out.append('export interface BacExercice { titre: string; points: number; enonce: string; questions: BacQuestion[]; corrige: string }')
out.append('export interface BacTest {')
out.append('  id: string;')
out.append('  domaine: number;')
out.append('  titreAr: string;')
out.append('  dureeMin: number;')
out.append('  notice: string;')
out.append('  enTete: string;')
out.append('  exercices: BacExercice[];')
out.append('}')
out.append('')
out.append('export const BAC_TESTS: BacTest[] = [')
for tt in tests:
    out.append('  {')
    out.append(f'    id: {j(tt["id"])},')
    out.append(f'    domaine: {tt["domaine"]},')
    out.append(f'    titreAr: {j(tt["titreAr"])},')
    out.append(f'    dureeMin: {tt["dureeMin"]},')
    out.append(f'    notice: {j(tt["notice"])},')
    out.append(f'    enTete: {j(tt["enTete"])},')
    out.append('    exercices: [')
    for e in tt['exercices']:
        out.append('      {')
        out.append(f'        titre: {j(e["titre"])},')
        out.append(f'        points: {e["points"]},')
        out.append(f'        enonce: {j(e["enonce"])},')
        out.append('        questions: [')
        for q in e['questions']:
            out.append(f'          {{ num: {j(q["num"])}, text: {j(q["text"])}, points: {q["points"]} }},')
        out.append('        ],')
        out.append(f'        corrige: {j(e["corrige"])},')
        out.append('      },')
    out.append('    ],')
    out.append('  },')
out.append('];')
out.append('')

OUT.write_text('\n'.join(out), encoding='utf-8')
nq = sum(len(e['questions']) for tt in tests for e in tt['exercices'])
print(f'OK : {OUT} — {len(tests)} tests, {sum(len(t["exercices"]) for t in tests)} exercices, {nq} questions')
