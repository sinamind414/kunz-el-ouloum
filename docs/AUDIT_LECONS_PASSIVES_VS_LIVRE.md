# 📋 AUDIT — Leçons passives vs Livre officiel (SVT 3AS)

> **Objet** : vérifier que les 23 fichiers HTML de `public/lessons` (25 leçons passives)
> ont le **même thème** et les **mêmes verbes** que le livre officiel (334 p.) et le
> programme ministériel (L5/L6, juin 2017).
> **Date** : 2026-09-19 · **Méthode** : extraction automatique (scripts `book_audit.py`,
> `book_variants.py`, `dump_passive_audit.py`) + lecture des sources officielles.

---

## 1. Sources de référence

| Code | Source | Volume | Usage |
|---|---|---|---|
| **MAN** | `LIVRE SVT BAC .txt` (livre officiel, OCR) | 325 879 car. | Présence réelle des thèmes |
| **MAN-C** | `الكتاب_المصحح_v1.0.md` | 280 742 car. | Titres de sections + verbes d'action |
| **TDM** | `book_tdm_clean.md` | 55 chapitres | Cartographie officielle des chapitres |
| **L5** | `docs/sources/التدرج-السنوي-للتعلمات-2017.txt` | 174 936 car. | Ressources exigibles + compétences |
| **L6** | `docs/sources/دليل-الأستاذ-2017.txt` | 668 052 car. | Compétences de base |
| **APP** | `src/data/reflexes.ts` | 6 + 7 verbes | Référentiel canonique de l'application |

**Règle d'or (L5, p.6)** : « يمتحن التلميذ على ما جاء في المنهاج (المعارف المشتركة)
وليس على المحتوى المعرفي الموجود في الكتاب المدرسي ».

---

## 2. Verbes : le livre vs l'application

### Verbes du livre (fréquences réelles — MAN-C)
| Verbe | Occ. | Verbe | Occ. | Verbe | Occ. |
|---|---|---|---|---|---|
| قارن | 48 | استنتج | 26 | بيّن | 4 |
| حدد | 46 | حلل / حلّل | 31 | اقترح | 4 |
| علل / علّل | 32 | وضح / وضّح | 24 | استخلص | 2 |
| لخص | 8 | فسّر / فسر | 17 | اذكر | 1 |
| تعرف | 15 | اشرح | 4 | احسب | 1 |
| استخرج | 4 | — | — | ارسم | 1 |

### Verbes canoniques de l'application (`reflexes.ts`)
- **6 réflexes** : حلّل · فسّر · قارن · اقترح فرضية · اشرح/بيّن · صادق
- **7 compétences** : حدد · صف · استنتج · علل/برر · اكتب نصا علميا · أنجز مخططا · أنجز رسما

### ❌ Écart majeur détecté
Les objectifs des leçons passives utilisent des **masdar (noms d'action)** :
`تحديد · تفسير · إثبات · توضيح · مقارنة · تمييز · تفصيل · حساب · اختيار · ربط · بيان`
— alors que le livre ET l'application utilisent des **verbes à l'impératif** :
`حدد · فسّر · بيّن · وضّح · قارن · احسب · صف · استنتج…`

→ **Correction appliquée** : tous les objectifs réécrits avec les verbes impératifs.

---

## 3. Thèmes : conformité leçon ↔ chapitre officiel

### ✅ Conformes (22 leçons)
`phase1`→U1§1-2 · `lecon_transcription`→U1§3 · `phase1_2`→U1§4 · `phase2`→U1§5 ·
`lecon_representation`→U2§1 · `phase2_2`→U2§2 · `phase3`→U2§3 · `phase3_2`→U3§1 ·
`lecon_activite_structure`→U3§2 · `phase4`→U3§3 · `phase4_2`→U3§4 · `phase5`→U4§2 ·
`phase5_2`→groupes ABO/Rh ✔ (présents dans MAN : الزمر 21×, ريزوس 14×, ABO 3×) ·
`phase6`→U4§5 · `phase6_2`→U4§4 · `phase7`→U4§7 (البرفورين in MAN) ·
`phase7_2`→U4§9 (أنترلوكين 10× dans MAN) · `phase8`→U5§4 · `phase8_2`→U5§5 ·
`phase9`→U5§3 · `phase9_2`→U5§6 · `phase10`→U5§7 · `phase11`→D2-U1§3 · `phase12`→D2-U1§4 ·
`phase13`→D2-U2§3 · `phase13_2`→D2-U2§2/4 · `phase14`→D2-U2§5 · `phase14_2`→D2-U2§6 ·
`phase16`→D3-U1§1 · `phase16_2`→D3-U1§2 · `phase18`→D3-U1§3 · `phase19`→D3-U2§1 ·
`phase19_2`→D3-U2§2 · `phase20`→D3-U2§3 · `phase20_2`→D3-U3§7 · `phase21`→D3-U3§2/3 ·
`phase21_2`→D3-U3§6 · `phase17`→D3-U3§4/5 · `phase17_2`→D3-U3§4 (مغماتيت 5× dans MAN)

### ❌ Hors manuel ET hors programme — 3 leçons (déjà signalées dans `curriculumOfficial.ts`)
| Clé | Titre actuel | Recherche dans MAN | Verdict |
|---|---|---|---|
| `phase22_chapitres_43_44` | دورة الصخور في الطبيعة | `دورة الصخور` = **0** | ❌ CULTURE_GENERALE |
| `phase22_chapitres_43_44_2` | الموارد الجيولوجية والطاقوية في الجزائر | `الموارد الجيولوجية` = **0**, `الغاز الطبيعي` = **0**, `المياه الجوفية` = **0** | ❌ CULTURE_GENERALE |
| `phase15_chapitres_29_30_2` | دورة الطاقة والمادة في المحيط الحيوي | `المحيط الحيوي` = **0** | ❌ CULTURE_GENERALE |

> Ces 3 leçons sont pédagogiquement valables mais **hors TDM et hors ressources exigibles** :
> elles ne doivent pas compter dans les statistiques d'exigibilité BAC (bandeau déjà prévu).

### ⚠️ Chapitres du TDM non couverts par une leçon passive
| Unité | Chapitres | Statut |
|---|---|---|
| U4 | §1 تذكير · §3 الجزيئات الدفاعية (حالة 1) · §6 العناصر الدفاعية (حالة 2) · §8 مصدر اللمفاويات · §10 اختيار النمط · §11 فقدان المناعة (VIH) | couverts **partiellement** par les leçons ACTIVES (`immunity_*`) |
| U5 | §1 تذكير بالمكتسبات | non couvert (acceptable : rappel transversal) |
| U7 | §1 تذكير · §2 مقر الأكسدة | §2 couvert par `phase13_2` |
| U11 | §1 خصائص الظهرات · §3 الصخور المميزة للظهرة · §8 شواهد محيط قديم (أوفيوليت) | **§8 non couvert** ⚠️ (الأوفيوليت 5× dans MAN) |

---

## 4. Périmètre : le nouveau pilier « expériences historiques » vs le manuel

| Expérience | Présence dans MAN | Statut |
|---|---|---|
| Hill (هيل) | **2×** | ✅ dans le manuel |
| Calvin (كالفن) | **5×** | ✅ dans le manuel |
| Nirenberg | ✅ | ✅ dans le manuel |
| Prusiner / prions | ✅ | ✅ dans le manuel |
| **Wadati-Benioff** | via « شواهد جيوفيزيائية » (الغوص) | ⚠️ à confirmer |
| **Jagendorf (1966)** | **0×** | ➕ enrichissement (programme FR) |
| **Racker (1974)** / Mitchell | **0×** | ➕ enrichissement (programme FR) |

> ➕ = correct et exigible en culture scientifique, mais **hors manuel algérien** :
> à présenter comme *approfondissement*, jamais comme contenu d'examen.

---

## 5. Corrections appliquées (2026-09-19)

| # | Correction | Fichier | Volume |
|---|---|---|---|
| 1 | **Verbes** : masdar → impératif canonique (حدّد · فسّر · بيّن · وضّح · قارن · احسب · صف · استنتج…) | `src/lessonData.ts` | **25 lignes d'objectifs** |
| 2 | **Titres** : alignés mot à mot sur le TDM officiel (55 chapitres) | `src/lessonData.ts` | **25 titres** |
| 3 | **Titres des leçons `_2`** (2 leçon de chaque fichier) alignés sur le TDM | `src/data/passiveTitleOverrides.ts` | **24 titres** |
| 4 | **Marquage hors manuel** « إثراء ثقافي — غير وارد في الكتاب المدرسي المقرر » | 3 leçons | **3** |
| 5 | **Numérotation** : passage à la numérotation du TDM (par unité), fin de l'incohérence globale `الدرس 19/21/23…` | lessonData + overrides | — |

### Exemples avant / après

| Leçon | Avant (masdar, hors TDM) | Après (verbe impératif + TDM) |
|---|---|---|
| `phase11_chapitres_21_22` | الدرس 21 : تفاعلات المرحلة الكيميوضوئية…<br>`تحديد دور الأنظمة الضوئية … وإثبات أن…` | الدرس 3 : تفاعلات المرحلة الكيميوضوئية والتحلل الضوئي للماء<br>`حدّد دور الأنظمة الضوئية … وبيّن أن…` |
| `phase13_chapitres_25_26` | الدرس 25 : التحلل السكري…<br>`تحديد الهيولى … وتفصيل خطوات…` | الدرس 3 : التحلل السكري (الغلوكوز إلى حمض البيروفيك)<br>`حدّد الهيولى … وصف خطوات…` |
| `phase14_chapitres_27_28` | الدرس 27 : الفسفرة التأكسدية…<br>`توضيح دور النواقل…` | الدرس 5 : الفسفرة التأكسدية<br>`وضّح دور النواقل…` |
| `phase6_chapitres_11_12` | الدرس 11 : …<br>`إثبات الطبيعة البروتينية… وتحديد بنيتها` | الدرس 5 : مصدر الأجسام المضادة والاستجابة الأولية والثانوية<br>`بيّن الطبيعة البروتينية… وحدّد بنيتها` |
| `phase7_chapitres_13_14_2` | الدرس 6 : التعاون الخلوي ودور LT4 والأنترلوكين-2 | الدرس 9 : تحفيز الخلايا LB و LT (التعاون الخلوي) |
| `phase8_chapitres_15_16_2` | الدرس 2 : كمون العمل والقنوات المبوبة كهربائياً | الدرس 5 : كمون العمل |
| `phase20_chapitres_39_40_2` | الدرس 2 : البنيات الجيولوجية (الطيات والفوالق) | الدرس 7 : شواهد التقلص (الطيات والفوالق) |
| `phase17_chapitres_33_34_2` | الدرس 1 : المغمايتية المميزة لمناطق الغوص | الدرس 5 : اختفاء اللوح المحيطي والمغمايتية المرتبطة بالغوص |

### Correspondance objectifs ↔ compétences officielles (L5)

| Unité | Compétence officielle (L5) | Verbe aligné |
|---|---|---|
| U1 | يحدد آليات تركيب البروتين | حدّد |
| U2 | يجد العلاقة بين البنية والتخصص الوظيفي | بيّن |
| U3 | يظهر التخصص الوظيفي للبروتينات في التحفيز الأنزيمي | بيّن |
| U4 | يظهر التخصص الوظيفي للبروتينات في الدفاع عن الذات | بيّن |
| U5 | يظهر التخصص الوظيفي للبروتينات في الاتصال العصبي | بيّن |
| U6 | يعرف آليات تحويل الطاقة الضوئية | وضّح |
| U7 | يحدد آليات تحويل الطاقة الكامنة إلى ATP | حدّد |
| U8 | ينشئ مخططا تحصيليا للتحولات الطاقوية على المستوى الخلوي | أنجز مخططا |
| U9 | يقترح تفسيرا للنشاط التكتوني للصفائح | اقترح · فسّر |
| U10 | يصف نموذج بنية الكرة الأرضية اعتمادا على معطيات سيسمولوجية | صف |
| U11 | يتعرف على البنيات الجيولوجية والظواهر المرتبطة بالنشاط التكتوني | تعرّف · حدّد |

---

### ⚠️ Erratum vérifié (2026-09-19, après-midi) — ophiolite vs migmatite
- **L'ophiolite EST couverte** : `أفيوليت` apparaît **8×** dans les HTML (orthographe
  `phase21_chapitres_41_42_2` + synonyme latin `Ophiolite` dans `phase21_41_42_2`).
  La recherche initiale `أوفيوليت` (= 0) utilisait la mauvaise variante orthographique.
- **Le VRAI manque était le migmatite / التضاعف القشري** (`مغماتيت`/`ميغماتيت` = 0
  dans les 25 HTML, **5×** dans le manuel p.319-321) → **corrigé le jour même** :
  nouvelle leçon active `d3-u11-l1-migmatite` (MISSION_CHOICE → GUIDED_DOC_QA →
  SEQUENCE_ORDER → TEXT_AND_PRODUCE) + route `migmatite_crustal_thickening` +
  défi BAC `lt_migmatite_thickening` + Gold Summary `adaptation_pedagogique`
  (source : manuel p.319-321, non relu par enseignant) + schéma 94 + entrée U11 en tête de séquence.

## 6. Reste à faire (recommandations)

1. ~~**Créer la leçon manquante U11 §8**~~ ✅ **FAIT (ophiolite)** — déjà couverte
   (`أفيوليت` 8×) ; et **U11 §7 migmatite créé** (`d3-u11-l1-migmatite`, 2026-09-19).
2. **Créer les leçons U4 §3, §6, §8, §10, §11** (immunité non spécifique, effecteurs de la réponse
   spécifique, origine des LTc, choix du type de réponse, VIH/SIDA) — actuellement couvertes
   seulement en partie par les leçons ACTIVES.
3. **Vérifier le niveau de preuve de Wadati-Benioff** dans le manuel avant de le présenter comme
   expérience « officielle » (aujourd'hui présenté comme approfondissement).
4. **Conserver** le bandeau إثراء ثقافي sur `phase15_29_30_2`, `phase22_43_44`, `phase22_43_44_2`
   (déjà déclaré dans `curriculumOfficial.ts` → `CULTURE_GENERALE`).
5. **Ne pas** réintroduire les notions `NON_EXIGIBLES` (المتمم · مبدأ الأسيلوسكوب · نضج الـ ARNm)
   dans les titres/objectifs.
