# 🔍 Comparaison : les 100 mots du lexique face au livre officiel et à l’application

**Question posée : « est-on obligé de les ajouter ? » → Réponse : NON, aucun ajout de contenu n’est obligatoire.**

**Statut :** rapport d’analyse, aucun code, aucun commit, aucun push, aucun changement de branche. Fichier non suivi.
**Sources lues :** `الكتاب_المصحح_v1.0.md` (livre corrigé L1, 2 586 lignes), `المكتبة_الكاملة_SVT.md` (39 documents, **non officielle**), données de `src/data/`, `src/lib/`, `smartTutorEngine.ts`, `correcteurV1.ts`, `fillBlanks.ts`, `dictionnaire_final.json`.

---

## 1. Les chiffres

| Mesure | Résultat |
|---|---|
| Mots du lexique | **100** |
| Déjà présents dans l’app **et** dans le livre, même écriture | **68** → rien à ajouter |
| Présents dans l’app, écriture différente du livre | **18** → harmoniser le nom |
| Non trouvés sous l’écriture exacte, mais **tous retrouvés** dans le livre sous une variante | **12** → harmoniser le nom |
| « Dans le livre, absent de l’app » à première vue | **2** → en fait déjà dans l’app sous `VIH`/`السيدا` et `التكامل الحفزي` |
| **Total existant sous une forme ou une autre** | **100 / 100** |
| Mots ayant déjà une courte définition dans `fillBlanks.ts` | **29** |
| Mots déjà dans le dictionnaire du correcteur (617 entités) | **60** |
| Entrées de verbe dans le lexique | **0** (les 10 contrats existent déjà dans l’app) |
| Unités couvertes par le lexique | **10 / 11** (U8 absente) |

> **Interprétation.** Le lexique n’apporte pas de connaissance nouvelle : c’est une **réécriture** de ce qui existe déjà. Ce qu’il faut faire, ce n’est pas ajouter 100 fiches, c’est **relier les variantes de noms** et **rendre consultable** ce qui est déjà là.

## 2. Méthode et limite

Recherche par sous-chaîne après normalisation (diacritiques, `الـ`, alef/hamza, ta marbuta, tatweel), sur les 100 intitulés extraits du fichier, avec essai des variantes sans `ال` et des deux membres séparés par `/`.
**Limite :** « trouvé » signifie que le mot apparaît, **pas** qu’une définition officielle est recopiée mot pour mot. Les 6 définitions courtes de `fillBlanks.ts` testées ne sont d’ailleurs pas des citations du livre : ce sont des reformulations issues des 500 QCM.

---

## 3. Les 4 groupes

### ✅ A — déjà dans l’app et dans le livre (68) : **rien à ajouter**

`المورثة` · `الاستنساخ` · `إنزيم ARN بوليميراز` · `السلسلة المستنسخة` · `القطع الدالة` · `القطع غير الدالة` · `الترجمة` · `الشفرة الوراثية` · `الرامزة` · `رامزة الانطلاق` · `رامزات التوقف` · `تنشيط الأحماض الأمينية` · `الـ ARN الناقل` · `الرامزة المضادة` · `الريبوزوم` · `متعدد الريبوزوم / البوليزوم` · `الحمض الأميني` · `السلسلة الببتيدية` · `الرابطة الببتيدية` · `الخاصية الأمفوتيرية / الحمقلية` · `نقطة التعادل الكهربائي` · `البنية الأولية` · `البنية الثانوية` · `البنية الثالثية` · `البنية الرابعة` · `الجسور الكبريتية` · `الإنزيم` · `مادة التفاعل / الركيزة` · `الموقع الفعال` · `الذات` · `اللاذات` · `المستضد` · `محدد المستضد / البيبتيد المستضدي` · `الجسم المضاد / الغلوبيولين المناعي` · `المعقد المناعي` · `الخلايا البلازمية` · `البرفورين` · `كمون الراحة` · `مضخة الصوديوم/البوتاسيوم` · `كمون العمل` · `المشبك` · `المبلغ العصبي / الوسيط الكيميائي` · `التركيب الضوئي` · `الصانعة الخضراء` · `التيلاكويد` · `الحشوة / الستروما` · `المرحلة الكيموضوئية` · `الفسفرة الضوئية` · `أكسدة الماء` · `المرحلة الكيموحيوية` · `التنفس الخلوي` · `الميتوكندري` · `التحلل السكري` · `حلقة كريبس` · `الفسفرة التأكسدية` · `السلسلة التنفسية` · `التخمر` · `الصفيحة التكتونية` · `الليتوسفير` · `الأسثينوسفير` · `الريفت` · `منطقة التصادم` · `انقطاع موهو` · `انقطاع غوتنبرغ` · `انقطاع ليمان` · `الأوفيوليت` · `الشست الأزرق` · `الإكلوجيت`

### 🔁 D — dans l’app, mais le livre écrit le nom autrement (18) : **harmoniser**

`الحمض الريبي النووي منقوص الأكسجين` · `المعقد إنزيم-ركيزة` · `النوعية المزدوجة` · `التثبيط التنافسي` · `التثبيط غير التنافسي` · `معقد التوافق النسيجي الرئيسي` · `الانتخاب اللمي` · `الخلايا اللمفاوية التائية السامة` · `الإنترلوكين-2` · `قنوات التسرب` · `القنوات الفولطية` · `القنوات الكيميائية` · `النظام الضوئي` · `الظهرة وسط المحيطية` · `منطقة الغوص` · `مستوى بنيوف` · `الموجات الزلزالية P` · `الموجات الزلزالية S`

### 🔁 C — écriture du lexique absente, mais le concept est dans le livre sous un autre nom (12) : **harmoniser**

`الحمض الريبي النووي المرسال` · `التخريب الفراغي` · `السرعة القصوى للتفاعل` · `مؤشرات HLA-I` · `مؤشرات HLA-II` · `مؤشرات السيادة المناعية` · `الكمون التنبيهي بعد المشبكي` · `الكمون التثبيطي بعد المشبكي` · `الدمج العصبي` · `إنزيم روبيسكو` · `السلاسل الجبلية حديثة التكون` · `التحول التكتوني`

### 🔁 B — « manquants » apparents (2), en réalité déjà dans l’app sous abréviation : **harmoniser**

`التكامل التحفيزي / التكيف المستحث` · `فيروس نقص المناعة البشرية`

---

## 4. Tableau des 14 variantes à relier

| Écriture du lexique | Ce qu’écrit le livre / l’app |
|---|---|
| الحمض الريبي النووي المرسال | ARNm (58×), المرسال (3×), الرسول (1×) |
| التخريب الفراغي | التخريب (8×), التمسخ (bibliothèque) |
| السرعة القصوى للتفاعل | Vmax (5×), السرعة القصوى (2×) |
| مؤشرات HLA-I | HLA (34×), CMH (2×) |
| مؤشرات HLA-II | HLA-II (8×) |
| مؤشرات السيادة المناعية | BCR (2×), TCR (1×), مستقبلات (19×) |
| الكمون التنبيهي بعد المشبكي | PPSE (18×) |
| الكمون التثبيطي بعد المشبكي | PPSI (6×) |
| الدمج العصبي | الإدماج (10×) |
| إنزيم روبيسكو | RuBisCO (7×), RuDP (10×) |
| السلاسل الجبلية حديثة التكون | السلاسل الجبلية (4×), التصادم (13×) |
| التحول التكتوني | التحول (10×), المتحول (2×) |
| التكامل التحفيزي / التكيف المستحث | التكيف المستحث (2×), التكامل الحفزي (2×) — présent dans l’app sous « التكامل الحفزي » |
| فيروس نقص المناعة البشرية | VIH (7×), السيدا (5×) — présent dans l’app : VIH 122×, السيدا 109× |

> Conséquence concrète : si l’élève tape `روبيسكو`, le coach doit le ramener à `RuBisCO` ; s’il tape `الدمج العصبي`, à `الإدماج` ; s’il tape `فيروس نقص المناعة البشرية`, à `VIH`. C’est un travail de **synonymes**, pas de rédaction.

---

## 5. Ce qui manque **vraiment** (4 points, pas 100)

1. **U8** « تحويل الطاقة على المستوى ما فوق البنية الخلوية » : officielle (2 h / 0,5 sem), absente du lexique. À ajouter **ou** à documenter comme exclusion assumée.
2. **Les verbes** : 0 entrée dans le lexique, alors que 10 contrats `يُطلب/يُمنع` existent déjà. À rendre consultables, pas à rédiger.
3. **Les étiquettes** : `المتمم`, `نضج الـ ARNm`, `القطع الدالة/غير الدالة` sont **dans le livre** mais déclarés non exigibles par `NON_EXIGIBLES` (L5 p.6) ; `غلوكوفان`, `psii`, `igg`, `hba` figurent dans les 39 `exclu_ids`. Il faut un statut explicite (« غير ممتحن فيه »), pas une suppression automatique → **arbitrage utilisateur**.
4. **Une colonne « source »** : aucune des 100 entrées ne dit d’où elle vient. C’est le seul vrai travail de mise en conformité.

## 6. Ce qu’il faut faire à la place d’« ajouter »

- Garder les **161 définitions courtes** et les **617 entités** existantes comme socle.
- Ajouter une **table de synonymes** pour les 14 variantes ci-dessus.
- Brancher la **saisie libre** de la bulle du capitaine sur ce socle (H1/H2 tranchés), avec la **question-sonde d'abord** (H3 tranché le 2026-11-05 : faire essayer l'élève avant d'expliquer — règle déjà présente dans `smartTutorEngine.ts`).
- Étiqueter les contenus non exigibles ; ajouter les 10 verbes ; trancher U8.
- Puis `lint → tests → build` et les verrous de la spec.

## 7. « Non vérifiable »

- Le fichier `الكتاب_المصحح_v1.0.md` est une **transcription corrigée** : je ne peux pas garantir qu’il est identique au scan papier de 334 pages.
- `المكتبة_الكاملة_SVT.md` (39 documents, mêlant 3ᵉ moyenne BEM et 3AS) n’a **pas de statut officiel**.
- La formulation exacte du ministère, le désaccord livre / `NON_EXIGIBLES`, le rendu sur Redmi / Samsung A ≤ 2 Go / 3G / 360 px, et les mots qui bloquent réellement les élèves (aucune donnée de terrain).
- Aucune source externe consultée.

---

## 8. État git

Branche `arena/bcf8863b-kunz-el-ouloum` (**active**). En fin de tour, le snapshot a ramené l’historique **local** à `f4bc4f4` : les commits `a873d74` et `28ca5c4` ne sont plus présents localement, mais le **distant reste `a873d74`** (le travail de code est donc bien sur GitHub). Les fichiers, eux, sont toujours présents dans l’arbre de travail (modifiés / non suivis). Ce rapport, la spec et les autres documents sont **non suivis** : aucun `git add`, commit ou push effectué ce tour. Les deux ouvrages sont suivis à la racine du dépôt depuis `f4bc4f4` (constat corrigé le 2026-11-07) ; `docs/sources/.gitignore` les exclut nommément, mais la copie racine est committée. Retrait de l'index à arbitrer.
