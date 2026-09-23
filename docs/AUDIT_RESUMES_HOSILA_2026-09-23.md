# Audit pro — résumés / hosila / gold / HTML (Script A)

**Date :** 2026-09-23 · **Branche :** `arena/01a0c955-kunz-el-ouloum` · **HEAD :** purge `778f271`

**Périmètre :** `src/data/resumesLecons.ts` · `lessonGoldSummaries.ts` · `public/lessons/*.html` · `okachaEnriched.ts` · `hosila.ts`

**Étalon :** texte الحصيلة collé par l'utilisateur (`docs/RESUMES_MAARIFI_LIVRE_2026-09-21.md`) + `data/bookContent.json` (identité PDF sha256, cf. AUDIT_MOT_A_MOT).

**Méthode (Script A) :** recette exacte du verrou `resumes.lock.test.ts` (NFKC, diacritiques, variantes arabes, jeton ≥ 5 car., chapitres `CHAPITRES_ANCRAGE` via index lignes), puis passe supplémentaires : hors-livre, fragilité 1 jeton, suspects lexicographiques, gold, HTML, hosila, okachaEnriched.

## Résumé exécutif

| | |
|---|---|
| **Verrou ancrage livré** | 210/210 points OK (0 FAIL) — `resumes.lock.test.ts` vert |
| **P0 bloquants** | **6** motifs hors livre dans les points résumés (graphies/expressions absentes du livre) |
| **P1 structurels** | 4 (seuil ≥1 jeton trop faible · 21 points fragiles · objectif/termeBac hors verrou · gold sans lock) |
| **P2** | 5 (éditorial gold 19/19 non revu · hosila/HTML verts) |
| **Verts confirmés** | hosila 10u/71pts 0 résidu · HTML 11/11 · okachaEnriched 0 résidu · 0 point hors livre entier |

**Verdict :** le verrou *passe* mais il est **trop faible** pour attraper 6 formulations non ancrées qui passent via d'autres jetons ≥5 car. — Script A les isole ci-dessous avec preuves ligne + appartenance livre.

## 0. Métriques

| Indicateur | Valeur |
|---|---|
| Résumés (entrées) | 44 |
| Points audités | 210 |
| Verrou ancrage OK (≥1 jeton) | 210/210 |
| Verrou FAIL | **0** |
| Fragiles (1 seul jeton d'ancre) | 21 |
| Hors livre (0 jeton dans tout le livre) | **0** |
| Suspects lexicographiques | 7 |
| Gold entries / blocs | 19 / 294 |
| Gold hors livre / fragile | 13 (3 latin-OCR + 10 lexicale) / 90 |
| Hosila unités / points | 10 / 71 |
| HTML cartes حصيلة OK | 11/11 |
| okachaEnriched résidus | {'EXTRAIRE': 0, 'إليك النص': 0, 'METHODO': 0} |

## P0 — bloquants (hors livre / verrou cassé / invention)

### 1. `P0-suspect-horslivre-phase5_chapitres_9_10-point2`

- **fichier :** src/data/resumesLecons.ts
- **key :** phase5_chapitres_9_10
- **ligne :** 105
- **texte :** تعبرز جزيئات CMH-I على سطح جميع الخلايا المنواة لعرض شظايا البروتينات الداخلية.
- **preuve :** motif « تعبرز » absent du livre normalisé ; graphie inhabituelle — vérifier تبرز / تُبرز vs livre
- **rec :** Corriger la formulation d'après le livre.

### 2. `P0-suspect-horslivre-phase5_chapitres_9_10-point3`

- **fichier :** src/data/resumesLecons.ts
- **key :** phase5_chapitres_9_10
- **ligne :** 106
- **texte :** تعبرز جزيئات CMH-II من طرف خلايا مناعية متخصصة لعرض شظايا اللاذات المبتلعة.
- **preuve :** motif « تعبرز » absent du livre normalisé ; graphie inhabituelle — vérifier تبرز / تُبرز vs livre
- **rec :** Corriger la formulation d'après le livre.

### 3. `P0-suspect-horslivre-phase6_chapitres_11_12-point2`

- **fichier :** src/data/resumesLecons.ts
- **key :** phase6_chapitres_11_12
- **ligne :** 126
- **texte :** تتميز الاستجابة المناعية الأولية بفترة كامن وبمستوى أجسام مضادة منخفض.
- **preuve :** motif « فترة كامن » absent du livre normalisé ; expression — vérifier période de latence vs livre
- **rec :** Corriger la formulation d'après le livre.

### 4. `P0-suspect-horslivre-immunity_humoral_response-point4`

- **fichier :** src/data/resumesLecons.ts
- **key :** immunity_humoral_response
- **ligne :** 139
- **texte :** تتمايز اللمفاويات B إلى خلايا بلازمية ناشزة (قصيرة العمر) وخلايا ذاكرة طويلة العمر.
- **preuve :** motif « ناشزة » absent du livre normalisé ; graphie — vérifier ناشِعة/ناشِطة vs livre
- **rec :** Corriger la formulation d'après le livre.

### 5. `P0-suspect-horslivre-phase14_chapitres_27_28-point5`

- **fichier :** src/data/resumesLecons.ts
- **key :** phase14_chapitres_27_28
- **ligne :** 306
- **texte :** يعود H+ إلى الترجمة عبر ATP-synthase فيركب كمية كبيرة من ATP.
- **preuve :** motif « إلى الترجمة » absent du livre normalisé ; sens douteux en contexte ATP (H+ → matrice ?)
- **rec :** Corriger la formulation d'après le livre.

### 6. `P0-suspect-horslivre-phase19_chapitres_37_38-point5`

- **fichier :** src/data/resumesLecons.ts
- **key :** phase19_chapitres_37_38
- **ligne :** 397
- **texte :** يتكسر تراكم الإجهاد في الصخور فتنطلق الطاقة على شكل موجات زلزالية.
- **preuve :** motif « يتكسر تراكم » absent du livre normalisé ; syntaxe étrange — vérifier formulation livre
- **rec :** Corriger la formulation d'après le livre.

## P1 — structurels (design verrou, gold, fragilité)

### 1. `P1-fragile-1jeton`

- **fichier :** src/data/resumesLecons.ts
- **preuve :** 21 point(s) ne passent le verrou que par 1 seul jeton ≥5 car.
- **count :** 21
- **rec :** Renforcer : 2 jetons ou reformuler sur le texte chapitre.
- **exemples :** [{"key": "d1-u1-l2-transcription", "point": 3, "jeton_hit": "يرتكز الـ ARNm على السلسلة وفق التكامل القاعدي وباتجاه واحد "}, {"key": "d1-u3-l1-enzyme", "point": 1, "jeton_hit": "يحفز الإنزيم تفاعلات الوساط الحيوية بتسريعها دون أن يستهلك."}, {"key": "d1-u3-l1-enzyme", "point": 2, "jeton_hit": "يمتلك الإنزيم موقعاً فعالاً تسند فيه المادة بعلاقة تكامل بني"}, {"key": "phase6_chapitres_11_12", "point": 4, "jeton_hit": "تضمن خلايا الذاكرة المناعة المكتسبة طويلة المدى."}, {"key": "immunity_cellular_res

### 2. `P1-objectif-hors-verrou`

- **fichier :** src/data/resumesLecons.ts
- **preuve :** objectif/termeBac : resumes.lock ne vérifie QUE les points — objectifs fragiles ou hors livre non bloqués
- **count :** 15
- **rec :** Étendre le verrou à objectif + termeBac.
- **exemples :** [{"key": "d1-u3-l1-enzyme", "field": "objectif", "texte": "بيّن خصوصية الإنزيم وعلاقة نشاطه بالبنية الفراغية لموقعه الفعال.", "nb_jetons": 8, "hits_chapitres": 1, "hits_livre": 5, "lock_note": "non vérifié par le verrou (lock ne couvre que points)", "fragile": true, "hors_livre": false}, {"key": "d1-u3-l1-enzyme", "field": "termeBac", "texte": "الموقع الفعال / المعقد إنزيم-مادة", "nb_jetons": 4, "hits_chapitres": 1, "hits_livre": 4, "lock_note": "non vérifié par le verrou (lock ne couvre que poi

### 3. `P1-gold-hors-livre`

- **fichier :** src/data/lessonGoldSummaries.ts
- **preuve :** 13 bloc(s) gold sans jeton dans le livre normalisé (3 latin/OCR technique ex. ATP-synthase · 10 hors-livre lexicale) — aucun lock d'ancrage gold
- **count :** 13
- **rec :** Ajouter lessonGold.lock (ancrage chapitres) ; corriger les termes hors-livre (كودون، تشبّع، صهارة…) d'après le livre ou marquer explicitement vocabulaire bac hors-OCR.
- **exemples :** [{"key": "d2-u6-l2-jagendorf", "field_idx": 2, "nb_jetons": 1, "hits_chapitres": 0, "hits_livre": 0, "lock_ok_noir": false, "fragile_1": false, "hors_livre": true, "status": "adaptation_pedagogique", "reviewed": false, "ligne": 54, "extrait": "ATP-synthase"}, {"key": "d2-u6-l2-jagendorf", "field_idx": 4, "nb_jetons": 2, "hits_chapitres": 0, "hits_livre": 0, "lock_ok_noir": false, "fragile_1": false, "hors_livre": true, "status": "adaptation_pedagogique", "reviewed": false, "ligne": 54, "extrait"

### 4. `P1-lock-design`

- **fichier :** src/data/resumes.lock.test.ts
- **preuve :** seuil ancrage = ≥1 jeton ≥5 car./point — trop faible (fragilité mesurée ci-dessus) ; objectif/termeBac/gold non couverts
- **rec :** Durcir : ≥2 jetons ou couverture objectif+gold.

## P2 — éditoriaux / verts documentés

### 1. `P2-suspect-note-phase21_chapitres_41_42-objectif`

- **fichier :** src/data/resumesLecons.ts
- **key :** phase21_chapitres_41_42
- **ligne :** 425
- **texte :** فسّر المغماتية وتشكل اللوح المحيطي عند الظهرات وسط المحيطية.
- **preuve :** motif « المغماتية » présent dans chapitres — qualité rédactionnelle à relire (orthographe — الميغmatite / مغماتية vs livre)
- **rec :** Relecture éditoriale owner.

### 2. `P2-gold-fragile`

- **fichier :** src/data/lessonGoldSummaries.ts
- **preuve :** 90 bloc(s) gold avec 1 seul jeton d'ancre
- **count :** 90
- **rec :** Renforcer ancrage gold.

### 3. `P2-gold-statut`

- **fichier :** src/data/lessonGoldSummaries.ts
- **preuve :** 19/19 status=adaptation_pedagogique, reviewed=false, 0 manuel_officiel_verifie
- **rec :** Traçabilité : relecture enseignant ou bascule honest status (déjà documenté Speckit V3).

### 4. `P2-hosila-propore`

- **fichier :** src/data/hosila.ts
- **preuve :** 0 résidu extraction dans données ; 10 u. / 71 pts — lock anti-résidus OK
- **rec :** Aucun (statut vert).

### 5. `P2-html-hosila-ok`

- **fichier :** public/lessons/*.html
- **preuve :** 11/11 cartes حصيلة HTML OK (id + marqueurs)
- **rec :** Aucun (statut vert).

## Annexes — suspects détaillés

**Lignes exactes `resumesLecons.ts` :** L105–106 تعبرز · L126 فترة كامن · L139 ناشزة · L306 إلى الترجمة · L397 يتكسر تراكم · L425 المغماتية (objectif, présent dans livre → P2).



| key | field | motif | dans livre ? | dans chap. ancrés ? | lock point |
|---|---|---|---|---|---|
| `phase5_chapitres_9_10` | point2 | تعبرز | False | False | True |
| `phase5_chapitres_9_10` | point3 | تعبرز | False | False | True |
| `phase6_chapitres_11_12` | point2 | فترة كامن | False | False | True |
| `immunity_humoral_response` | point4 | ناشزة | False | False | True |
| `phase14_chapitres_27_28` | point5 | إلى الترجمة | False | False | True |
| `phase19_chapitres_37_38` | point5 | يتكسر تراكم | False | False | True |
| `phase21_chapitres_41_42` | objectif | المغماتية | True | True | True |

---

_Généré par `scripts/audit_resumes_hosila.py` — reproductible : `python3 scripts/audit_resumes_hosila.py`._
