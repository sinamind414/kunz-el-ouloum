#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
build_okacha.py — injection MÉCANIQUE du livre « عكاشة » (upload master 5548459 :
504601676-كتاب-العلوم-للطالبة-اكرام-بوزار.txt) vers src/data/okacha.ts.

Nature du contenu réel (exploration 2026-09-20) : par unité, un RÉCAPITULATIF
NUMÉROTÉ « ما يجب حفظه » (numérotation globale continue ~1→310+ dans D1) — pas
une banque d'exercices (le livre ne contient AUCUN corrigé marqué). V1 = banque
de mémorisation ; la section méthodologie (l.115-660) reste de côté (chevauche
la migration مفتاح v5.0 en attente d'arbitrage).

Transformations documentées (aucune autre) :
  T-ctx  — périmètre : l.115-660 (méthodo, v2) et l.2215+ (conseils personnels)
           exclus ; l.1-114 (couverture commerciale/فهرس/إهداء) exclus.
  T-dom  — mapping des domaines (ordre عكاشة ≠ ordre officiel) :
           المجال الأول (protéines) → domaine 1 · المجال الثاني (الجيولوجيا)
           → domaine 3 · المجال الثالث (التحولات الطاقوية) → domaine 2.
  T-u5   — l'en-tête U5 (الاتصال العصبي) est perdu dans l'OCR ; frontière fixée
           à l.1347 : dernier marqueur immunitaire l.1344 (item 245, الخلايا 114),
           premier contenu nerveux l.1348-1349 (النظام العصبي).
  T-fin  — énergie U2 bornée à l.2199 (les conseils perso commencent l.2200-2201).
  T-noise— filtres de lignes (OCR scanné) : bannières « Scanne/CamScanner »,
           « مشروع عكاشة/الطالب المتفوق/المتفوق في علوم », numéros de page isolés
           (≤4 chiffres), séparateurs de soulignement, lignes < 3 lettres arabes.
  T-lab  — les 10 libellés d'unités sont les titres CANONIQUES (les en-têtes OCR
           sont parfois corrompus, ex. « خخدة الاتية ») ; le CONTENU reste verbatim.

Le verrou src/data/okacha.lock.test.ts re-vérifie : 10 unités (5/2/3), interdits
(téléphones/prix/CamScanner/promo), الظهيرة absente, longueurs min, unicité ids.
"""
import json
import re
from pathlib import Path

SRC = Path('uploads_externes/okacha.txt')
OUT = Path('src/data/okacha.ts')

lines = SRC.read_text(encoding='utf-8').splitlines()

# (id, domaine, libellé canonique, début, fin) — bornes en numéros de ligne 1-based
UNITES = [
    ('d1u1', 1, 'تركيب البروتين', 670, 811),
    ('d1u2', 1, 'العلاقة بين بنية ووظيفة البروتين', 812, 914),
    ('d1u3', 1, 'النشاط الإنزيمي للبروتينات', 915, 1017),
    ('d1u4', 1, 'دور البروتينات في الدفاع عن الذات', 1018, 1346),
    ('d1u5', 1, 'الاتصال العصبي', 1347, 1576),
    ('d3u1', 3, 'بنية الكرة الأرضية', 1581, 1651),
    ('d3u2', 3, 'الصفائح التكتونية', 1652, 1755),
    ('d3u3', 3, 'الظواهر المرتبطة بالنشاط التكتوني', 1756, 1869),
    ('d2u1', 2, 'تحويل الطاقة الضوئية إلى طاقة كيميائية كامنة', 1871, 1925),
    ('d2u2', 2, 'تحويل الطاقة الكيميائية الكامنة إلى طاقة قابلة للاستعمال', 1926, 2199),
]

RE_NOISE = re.compile(
    r'Scanne|CamScanner|عكاش|عكإغ|المتفوق|للمتفوق|متتقوق|^_{5,}|_{5,}$')


def filtrer(tranche):
    """T-noise : retire les bannières promo/scan, numéros de page, lignes vides de bruit."""
    out = []
    for l in tranche:
        s = l.strip()
        if not s:
            continue
        if RE_NOISE.search(s):
            continue
        if re.fullmatch(r'\d{1,4}', s):  # numéro de page isolé
            continue
        if len(re.findall(r'[\u0600-\u06FF]', s)) < 3 and len(s) < 25:  # débris non arabes
            continue
        out.append(s)
    return out


unit = []
for uid, dom, label, a, b in UNITES:
    lignes = filtrer(lines[a - 1:b])
    assert len(lignes) >= 40, f'{uid} : {len(lignes)} lignes filtrées (<40) — bornes à revoir'
    unit.append({'id': uid, 'domaine': dom, 'uniteAr': label,
                 'sourceRange': f'l.{a}-{b}', 'lignes': lignes})

# ── méthodologie (l.115-660) — v2, croisée مع مفتاح (voir note docs/) ──
METHODO = {'titreAr': 'قسم المنهجية', 'sourceRange': 'l.115-660',
           'lignes': filtrer(lines[114:660])}
assert len(METHODO['lignes']) >= 300, f"métho : {len(METHODO['lignes'])} lignes (<300)"

# ── T-adv — d2u2 : قسم النصائح isolé (conseils personnels hors résumés) ──
# Restauration المنهجية 2026-09-23 : les conseils ne sont PLUS dans OKACHA_UNITES
# ni mélangés aux points — export dédié OKACHA_CONSEILS (9ᵉ section méthodo).
CONSEILS = None
for u in unit:
    if u['id'] == 'd2u2' and 'قسم النصائح' in u['lignes']:
        i = u['lignes'].index('قسم النصائح')
        CONSEILS = {'titreAr': 'قسم النصائح', 'sourceRange': 'l.1926-2199',
                    'lignes': u['lignes'][i:]}
        u['lignes'] = u['lignes'][:i]
assert CONSEILS and len(CONSEILS['lignes']) >= 80, 'T-adv : قسم النصيحه non isolé'

# ── post-conditions avant écriture ──
raw = json.dumps(unit, ensure_ascii=False) + json.dumps(METHODO, ensure_ascii=False) + json.dumps(CONSEILS, ensure_ascii=False)
for interdit in ['0672388202', '0560420993', '300 دج', 'CamScanner', 'Scanne',
                 'المتفوق', 'الظهيرة']:
    assert interdit not in raw, f'interdit présent : {interdit}'
assert len(unit) == 10
assert {u['domaine'] for u in unit} == {1, 2, 3}
assert len([u for u in unit if u['domaine'] == 1]) == 5
assert len([u for u in unit if u['domaine'] == 2]) == 2
assert len([u for u in unit if u['domaine'] == 3]) == 3

# ── écriture TS ──
def j(s):
    return json.dumps(s, ensure_ascii=False)

out = []
out.append('// okacha.ts — FICHIER GÉNÉRÉ par scripts/build_okacha.py — NE PAS ÉDITER À LA MAIN.')
out.append('// Source : livre عكاشة (upload GitHub master 5548459), extraction mécanique verbatim')
out.append('// (filtres OCR documentés dans le script). Récapitulatifs numérotés « ما يجب حفظه »')
out.append('// par unité — AUCUN corrigé dans la source (le livre nen contient pas). Verrou :')
out.append('// okacha.lock.test.ts. Restauration 2026-09-23 : METHODO + OKACHA_CONSEILS')
out.append('// (قسم النصيحه ex-d2u2) ; 17 signatures OCR restent purgées des unités.')
out.append('')
out.append('export interface UniteOkacha {')
out.append('  id: string;')
out.append('  domaine: 1 | 2 | 3;')
out.append('  uniteAr: string;')
out.append("  sourceRange: string; // plage de lignes dans l'OCR source")
out.append('  lignes: string[];')
out.append('}')
out.append('')
out.append('export const OKACHA_UNITES: UniteOkacha[] = [')
for u in unit:
    out.append('  {')
    out.append(f'    id: {j(u["id"])},')
    out.append(f'    domaine: {u["domaine"]} as 1 | 2 | 3,')
    out.append(f'    uniteAr: {j(u["uniteAr"])},')
    out.append(f'    sourceRange: {j(u["sourceRange"])},')
    out.append('    lignes: [')
    for l in u['lignes']:
        out.append(f'      {j(l)},')
    out.append('    ],')
    out.append('  },')
out.append('];')
out.append('')
out.append('// Section méthodologie (l.115-660) — croisée avec مفتاح, non éditée.')
out.append('export const OKACHA_METHODO = {')
out.append(f'  titreAr: {j(METHODO["titreAr"])},')
out.append(f'  sourceRange: {j(METHODO["sourceRange"])},')
out.append('  lignes: [')
for l in METHODO['lignes']:
    out.append(f'    {j(l)},')
out.append('  ],')
out.append('} as const;')
out.append('')
out.append('/** قسم النصيحه — ex-d2u2, isolé (T-adv / restauration 2026-09-23). */')
out.append('export const OKACHA_CONSEILS = {')
out.append(f'  titreAr: {j(CONSEILS["titreAr"])},')
out.append(f'  sourceRange: {j(CONSEILS["sourceRange"])},')
out.append('  lignes: [')
for l in CONSEILS['lignes']:
    out.append(f'    {j(l)},')
out.append('  ],')
out.append('};')
out.append('')

OUT.write_text('\n'.join(out), encoding='utf-8')
total = sum(len(u['lignes']) for u in unit)
print(f'OK : {OUT} — {len(unit)} unités (5/2/3), {total} lignes de révision')
