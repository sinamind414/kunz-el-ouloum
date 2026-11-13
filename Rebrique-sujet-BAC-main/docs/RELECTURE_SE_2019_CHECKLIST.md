# Checklist de relecture — BAC SE 2019 (image par image)

**Date :** 2026-09-23 (première passe : copie depuis l'image ; seconde passe :
confrontation ligne à ligne sur crops zoomés ×1,7 à ×2,6, même jour).
**Sources :** `subjects/SE/2019/sujet-1.pdf` (5 pages = livret 1-5) et
`subjects/SE/2019/sujet-2.pdf` (4 pages = livret 6-9), rendus à l'échelle 2
(`rendered/`, gitignoré, aucun PNG commité).
**Méthode :** la couche texte du fichier local a servi de repère de page et de
contrôle ; **chaque consigne, chiffre et nom ci-dessous est lu sur l'image**.
Aucun fichier de `data/` n'est touché par cette phase (Phase 1 du plan
`docs/PLAN_SE_2013_2020.md`).

Mode d'emploi : une ligne `official` n'est proposée que si le `bacPrompt` est
recopié mot à mot depuis l'image, diacritiques imprimés inclus (شدّة, ضمّة,
سكون, تنوين). Le reste reste `reconstructed`.
Aucun corrigé local : les réponses modèles resteront des aides.

---

## Pages vues

| Page livret | Page PDF local | Contenu vu                                                                                                                             | Pôles certifiables         |
| ----------- | -------------- | -------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| 1 / 9       | sujet-1 p.1    | En-tête (دورة 2019, المدة 04 سا و30 د), avis de choix ; **S1-E1** (مغماتية/ظهرة, schéma 1-8) + **S1-E2** énoncé (GO, Asp./Penicillium) | S1-E1 S, S1-E1 E, S1-E2 N  |
| 2 / 9       | sujet-1 p.2    | S1-E2 doc.1 : tableau (581/587, 26/25, 71/24, Cys164-Cys206 / Cys168-Cys210, Arg512…/Arg516…) + alignements                            | S1-E2 S, S1-E2 E           |
| 3 / 9       | sujet-1 p.3    | S1-E2 doc.2 (3 milieux, barres Vmax 10/8/6/2) + S1-E3 énoncé (immunité antitumorale)                                                   | S1-E2 W, S1-E3 N (cadrage) |
| 4 / 9       | sujet-1 p.4    | S1-E3 doc.1 (CD8/HLA I/TCR) + doc.2 (IL2, TIL) + الجزء الثاني                                                                          | S1-E3 S                    |
| 5 / 9       | sujet-1 p.5    | S1-E3 doc.3 (tableau de fluorescence ±, x400, pergélisol/بُروفورين) + الجزء الثالث                                                     | S1-E3 E, S1-E3 W           |
| 6 / 9       | sujet-2 p.1    | Avant-propos sujet 2 ; **S2-E1** (Andes, schéma 1-8) + **S2-E2** énoncé (DDT)                                                          | S2-E1 S, S2-E1 E           |
| 7 / 9       | sujet-2 p.2    | S2-E2 doc.1 (tableau mV 0→5 ms) + doc.2 (canaux, trace, patch clamp)                                                                   | S2-E2 S, S2-E2 E, S2-E2 W  |
| 8 / 9       | sujet-2 p.3    | **S2-E3** énoncé (Rifamycine) + doc.1 (courbes 1/2/4/8 µg/ml)                                                                          | S2-E3 S                    |
| 9 / 9       | sujet-2 p.4    | S2-E3 doc.2 (tableau des 3 milieux + barres 10/8/6/2) + الجزء الثالث                                                                   | S2-E3 E, S2-E3 W           |

**Pages non vues : aucune** — les neuf pages du livret ont été lues sur image,
deux fois. En-tête relevé p.1 : `دورة: 2019`, `المدة: 04 سا و30 د`, `الشعبة:
علوم تجريبية` ; mention imprimée « يحتوي الموضوع على (05) صفحات (من الصفحة 1
من 9 إلى الصفحة 5 من 9) » — `يحتوي` et `على` sont **sans شدّة** à l'impression
(le contrôle zoomé ×2,6 les montre nus). Corrigé officiel non relu (aucun
corrigé local dans le dépôt).

---

## Sujet 1 — Exercice 1 (05 pts) : مغماتية مرتبطة بالظهرة وسط محيطية — page 1

Support imprimé : schéma de dorsale (données 1-8 : 1 = bombe de magma
(توسّع)، 2 = لافا حديثة، 3 = برنس (طبقة)، 4 = ظهرة/محور، 5 = صدع، 6 = دفع
(alvéoles/sens)، 7 = سيالة بازلتية، 8 = بيريدوتيت المعطف) + ملاحظة : « يتطلب
انصهار البيريدوتيت درجة حرارة 1300°C وضغط منخفض ».

| Pôle    | Source           | Consigne encodée                                                                                                   |
| ------- | ---------------- | ------------------------------------------------------------------------------------------------------------------ |
| N (1pt) | reconstructed    | cadrage pédagogique (l'énoncé présente le modèle, sans question)                                                   |
| S (1pt) | **official** p.1 | 1- تَعَرَّفْ على البيانات المرقمة من 1 إلى 8.                                                                      |
| E (2pt) | **official** p.1 | 2- قَدِّمْ في نص علمي الأدلة التي تُبَيِّنُ أن مناطق التباعد مرتبطة بمغماتية نشطة مستغلا معطيات الوثيقة ومعلوماتك. |
| W (1pt) | reconstructed    | clôture : la synthèse est incluse dans la consigne 2                                                               |

## Sujet 1 — Exercice 2 (07 pts) : أنزيم غلوكوز أكسيداز (GO) — pages 1, 2 et 3

Énoncé p.1 : `أَنْبَأَتْ` de nombreuses études que l'activité enzymatique exige
une structure spatiale propre, puis la question de cadrage :
`فَهَلْ كل اختلاف في بنية الأنزيمات يؤدي حتما إلى اختلاف في وظائفها؟`
Doc.1 p.2 : tableau comparatif Asp. niger / Penicillium (acides aminés 581/587,
α 26/25, β 71/24, ponts disulfure Cys164-Cys206 / Cys168-Cys210, site actif
Arg512,His516,His559,Asp424 / Arg516,His520,His563,Asp428) + alignements de
séquences (شكل ب). Doc.2 p.3 : tableau des 6 expériences (mutations Tyr68/Tyr73,
Asp424/Asp428, His516/His520, Arg512/Arg516, Asn514/Asn518 → Vmax 32 %, 7,2 %,
1,1 %, 3,5 %, 58,2 %) + site actif occupé (شكل ب).

| Pôle      | Source           | Consigne encodée                                                                                        |
| --------- | ---------------- | ------------------------------------------------------------------------------------------------------- |
| N (0,5pt) | **official** p.1 | فَهَلْ كل اختلاف في بنية الأنزيمات يؤدي حتما إلى اختلاف في وظائفها؟                                     |
| S (2pt)   | **official** p.2 | 1- اسْتَخْرِجْ الخطوات العملية المتبعة التي تسمح بحل المشكلة المطروحة انطلاقا من معطيات الوثيقة (1).    |
| E (2,5pt) | **official** p.2 | 2- قارن بين الخصائص البنيوية لأنزيم GO عند الفطرين.                                                     |
| W (1pt)   | **official** p.3 | 2- قَدِّمْ إجابة ملخصة للمشكلة العلمية المطروحة في بداية التمرين انطلاقا مما توصلت إليه في هذه الدراسة. |

Regroupements notés (compromis, pas des questions inventées) : pôle E reçoit
aussi la consigne 1 de la page 3 (« 1- فَسِّرْ النتائج التجريبية المحصل عليها
باستغلالك لمعطيات الوثيقة (2) ومن معلوماتك. »), les deux consignes relevant
de l'exploitation des données. Pôle W = la clôture imprimée seule.
Non mappé, listé tel quel : l'énoncé de la page 1 (`أَنْبَأَتْ` … ,
descriptif) et l'introduction du الجزء الثاني (« في دراسة مُكَمِّلَة، تَمَّ
قياسُ النشاط الأنزيمي للغلوكوز أكسيداز بعد إحداث طفرات … »).

## Sujet 1 — Exercice 3 (08 pts) : immunité antitumorale (LT8/CD8, TIL, IL2) — pages 3, 4 et 5

Énoncé p.3 : le système immunitaire détruit les cellules cancéreuses ; les
tumeurs échappent (échapatoires) et deviennent résistantes.
Doc.1 p.4 : schéma (cellule cancéreuse HLA I / bittide مستضدي / TCR / LT-CD8,
CPA, ganglions) → consignes. Doc.2 p.4 : méthode (1) IL2 répété (courbe des
lymphocytes), méthode (2) TIL prélevés, cultivés, réinjectés (rémission).
Doc.3 p.5 : tableau de fluorescence (milieu (أ) vs (ب), vert/rouge, membrane) +
micrographies (خلايا LTC, بروفورين, خلية ورمية (X)/(Y)).

| Pôle      | Source           | Consigne encodée                                                                                                                                                                                                                         |
| --------- | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| N (0,5pt) | reconstructed    | cadrage : l'énoncé annonce l'échappement tumoral, sans phrase interrogative                                                                                                                                                              |
| S (2pt)   | **official** p.4 | 1- حَدِّدْ دور الخلايا المناعية المتدخلة في الاستجابة المناعية ضد الخلايا السرطانية الممثلة في الوثيقة (1). 2 - اقْتَرِحْ فرضيتين لتفسير إفلات بعض الخلايا السرطانية من الجهاز المناعي.                                                  |
| E (4pt)   | **official** p.5 | 1- فَسِّرْ إفلات وعدم إفلات الخلايا الورمية من الجهاز المناعي الطبيعي مُبْرِرًا دور البروتينات في ذلك ثم بَيِّن الفرضية الأكثر وجاهة. 2- استنتِجْ بأن التدخل العلاجي غير فعال دوما ضد السرطان ثم قدم نصيحة وقائية لتفادي تطور هذا المرض. |
| W (1,5pt) | **official** p.5 | لَخِّصْ في مخطط مراحل الاستجابة المناعية ضد الخلايا السرطانية اعتمادا على مكتسباتك ومُوَظِّفًا المعلومات التي توصلت إليها من هذه الدراسة.                                                                                                |

Regroupements notés : pôle S = les 2 consignes de l'énoncé (p.4) ; pôle E =
les 2 consignes de la page 5. Non mappé, listé tel quel : l'amorce du
الجزء الثاني (« 1. للتَّخَلُّصِ من الأورام يلجأ الأطباء إلى اختيار طرق
علاجية، من بينها الطريقتان الموضحتان في الوثيقة (2). ») et l'amorce de la
page 5 (« 2- لتفسير عجز الجهاز المناعي على تخريب الخلايا السرطانية … تُقْتَرَحُ
عليك سلسلة التجارب … »), qui annoncent les documents sans demander de tâche.

---

## Sujet 2 — Exercice 1 (05 pts) : subduction des Andes — page 6

Support imprimé : coupe (données 1-8 : 1-2 = قشرة محيطية/رسوبيات، 3 = صهارة
( magma)، 4 = غلاف، 5-6 = lavés، 7 = قشرة قارية، 8 = صفيحة غائصة) + بركان
انفجاري.

| Pôle    | Source           | Consigne encodée                                                                     |
| ------- | ---------------- | ------------------------------------------------------------------------------------ |
| N (1pt) | reconstructed    | cadrage : l'énoncé décrit l'activité tectonique des Andes, sans question             |
| S (1pt) | **official** p.6 | 1- سمّ العناصر المرقمة وتعرّف على هذا النّشاط التكتوني.                              |
| E (2pt) | **official** p.6 | 2- اشرح في نصّ علمي كيف تشكّل البركان الانفجاري معتمدا على معطيات الوثيقة ومكتسباتك. |
| W (1pt) | reconstructed    | clôture : incluse dans le نصّ علمي du pôle E                                         |

## Sujet 2 — Exercice 2 (07 pts) : DDT et canaux ioniques voltage-dépendants — pages 6 et 7

Doc.1 p.7 : tableau des potentiels (0 → 5 ms ; sans DDT : -70,-70,-70,+30,0,-70,
-75,-70,-70 ; avec DDT : -70,-70,-70,+30,+25,+25,+25,+25,+25) + consignes, avec
le barème de tracé imprimé : `1cm ← 0,5ms` et `1cm ← 20mv`. Doc.2 p.7 : canaux
Na⁺ (voltage) et K⁺ (voltage, fuite) + enregistrements patch clamp avec et sans
DDT.

| Pôle      | Source           | Consigne encodée                                                                                                                                                                        |
| --------- | ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| N (1pt)   | reconstructed    | cadrage : « لمعرفة آلية تأثير مادة الـ DDT تُقترح الدراسة التالية » — annonce, sans question                                                                                            |
| S (2,5pt) | **official** p.7 | 1- مَثِّلْ بيانيا ثم حَلِّلْ النتائج المُوضَحة في الوثيقة (1). (يُعطى مقياس الرسم التالي: 1cm ← 0,5ms / 1cm ← 20mv).                                                                    |
| E (2,5pt) | **official** p.7 | 1- حَدِّدْ أهم مُمَيِّزات القنوات المُمَثَّلة في الشكل (أ) ثم علّل تسميتها. 2- فَسِّرْ باستغلال معطيات شكلي الوثيقة (2) تأثير الكمون المفروض على القنوات الفولطية في غياب مادة الـ DDT. |
| W (1pt)   | **official** p.7 | 3- ناقش صحة إحدى الفرضيتين المقترحتين انطلاقا من النتائج السابقة، مُبَيِّنًا آلية تأثير مادة الـ DDT على النشاط العصبي.                                                                 |

Regroupements notés : pôle S reçoit aussi la consigne 2 du الجزء الأول
(« 2- اقترح فرضيتين لتفسير آلية تأثير مادة الـ DDT على الكمون الغشائي. ») ;
pôle E = les 2 consignes du الجزء الثاني. Les quatre niveaux imprimés sont
couverts, aucune `خلاصة`.

## Sujet 2 — Exercice 3 (08 pts) : Rifamycine et niveaux d'action des antibiotiques — pages 8 et 9

Énoncé p.8 : les antibiotiques visent la synthèse des protéines chez la
bactérie. Doc.1 p.8 : courbes de la synthèse protéique (1, 2, 4, 8 µg/ml →
200 %, ~100 %, ~50 %, ~0 %) + schéma de la traduction annoté (ADN, ARN
polymérase, ribosome, ARNm, ARNt, acides aminés). Doc.2 p.9 : tableau des
3 milieux (1 : ADN + ARN polymérase + ribonucléotides + acides aminés + ARNt +
ATP + énergie de régénération + ribosomes → ++++++++ ; 2 : + Rifamycine → + ;
3 : acides aminés + ATP + ARNt + énergie + ribosomes + Rifamycine + ARNm →
+++++++++) + barres de la vitesse initiale (0 → 10, 2 → 8, 4 → 6, 6 → 2,
8 → ≈0 ; axe `Vmax`).

| Pôle      | Source           | Consigne encodée                                                                                                                                                                                        |
| --------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| N (0,5pt) | reconstructed    | cadrage : « لتحديد مستويات تأثير هذه الأدوية تُقترح الدراسة التالية » — annonce, sans question                                                                                                          |
| S (2pt)   | **official** p.8 | 1. حَلِّلْ النتائج المُمَثَّلة في الشكل (أ) من الوثيقة (1). 2. اقترح باستغلال مُعطيات الشكل (ب) من الوثيقة (1) ثلاث فرضيات تُحدِّد من خلالها مستوى تأثير المضاد الحيوي (Rifamycine) على تركيب البروتين. |
| E (4pt)   | **official** p.9 | 1- قارن بين النتائج التجريبية الممثلة في الشكل (أ) للوثيقة (2). 2- ناقش باستغلال معطيات الوثيقة (2) صحة إحدى الفرضيات المقترحة سابقا محددا بدقة مستوى تأثير المضاد الحيوي (Rifamycine).                 |
| W (1,5pt) | **official** p.9 | لَخِّصْ في نص علمي من خلال ما سبق ومعلوماتك مراحل تركيب البروتين مبرزا المستويات المحتملة لتأثير مختلف المضادات الحيوية.                                                                                |

Regroupements notés : pôle S = les 2 consignes du الجزء الأول ; pôle E = les
2 consignes de la page 9 ; pôle W = le نص علمي du الجزء الثالث seul.

---

## Barèmes imprimés relevés (Phase 2)

Sujet 1 : Ex1 = **05**, Ex2 = **07**, Ex3 = **08**. Sujet 2 : Ex1 = **05**,
Ex2 = **07**, Ex3 = **08**. Tous lus sur l'image (titres d'exercices
`(05 نقاط)` / `(07 نقاط)` / `(08 نقاط)`), sur les pages 1, 6, 8 et 3, 7, 9.
Ils confirment les `max` actuels de `data/years/se/year-2019.js` (5/7/8) :
aucune correction de total à prévoir en Phase 2.

## Pièges de couche texte constatés (pour les encodeurs Phase 3)

La couche du fichier local est logiquement lisible mais **bruitée** ; elle
n'est pas une source de recopie :

- elle écrit « Lay الباحثون » (p.1) là où l'image imprime « لاحظ الباحثون » ;
- « المغماتية » devient illisible ; « أَنَّ البراكين » devient « َّأَن البراكين » ;
- p.3 : « المُضاتات الحيوية » pour « المُضادَّات الحيوية » ;
- p.3 : « نسبة تركيب البروتين » est lisible, mais les annotations du schéma
  (الريبوزوم، ARNm، ARNt، ARN بوليميراز) n'y sont pas ;
- **les chiffres cités dans les documents ne sont pas dans la couche** (581/587,
  71/24, 9/10 du CI50 de 2020 déjà rencontré, barres Vmax) : tout chiffre est
  relu sur l'image.

## Divergences vs encodage actuel (à traiter en Phase 3, données intactes)

Relevé du 2026-09-23 sur `data/years/se/year-2019.js` (lecture seule). **Les
six thèmes encodés contredisent les pages** — c'est le défaut principal que la
Phase 3 doit corriger (le plan l'annonçait pour S1-E1 : « transcription » au
lieu de la مغماتية) :

| Exercice | Thème encodé aujourd'hui                   | Thème imprimé sur la page                                             |
| -------- | ------------------------------------------ | --------------------------------------------------------------------- |
| S1-E1    | الاستنساخ وتركيب ARNm                      | **مغماتية مرتبطة بالظهرة وسط محيطية** (البراكين الطفحية، البيريدوتيت) |
| S1-E2    | الموقع الفعال والتخصص الإنزيمي (pH، حرارة) | **أنزيم غلوكوز أكسيداز GO**: بنية–وظيفة، طفرات، مقارنة فطرين          |
| S1-E3    | الاستجابة المناعية النوعية                 | **الاستجابة المناعية ضد الخلايا السرطانية** (LT8/CD8، TIL، IL2)       |
| S2-E1    | كمون العمل والقنوات الفولطية               | **الأنديز: بركان انفجاري ومنطقة غوص**                                 |
| S2-E2    | التنفس الخلوي والحصيلة الطاقوية            | **مادة الـ DDT والقنوات الفولطية**                                    |
| S2-E3    | التكتونية العامة للصفائح                   | **Rifamycine ومستويات تأثير المضادات الحيوية على تركيب البروتين**     |

Conséquence : les `bacPrompt` actuels (ex. « اشرح في نص علمي آلية الاستنساخ
داخل النواة. », « حلّل تغيرات السرعة الابتدائية بدلالة pH ودرجة الحرارة. »),
les `placeholder`, les `desc` et les réponses modèles décrivent d'autres
exercices que ceux imprimés. La Phase 3 les remplacera pôle par pôle depuis les
consignes ci-dessus ; elle corrigera aussi les `label` des six exercices.
Aucun de ces textes n'est certifiable : ils restent `reconstructed` tant que la
Phase 3 ne les a pas remplacés.

## Cadrages restés `reconstructed` (aucune question imprimée)

S1-E1 N et W ; S1-E3 N ; S2-E1 N et W ; S2-E2 N ; S2-E3 N. Ces **7 pôles**
portent une formulation pédagogique et une note datée expliquant l'absence de
question autonome : ils ne doivent pas être promus `official` sans une phrase
interrogative lue sur l'image. **Total : 17 pôles `official` proposés sur 24**
(S1 : S1-E1 S/E ; S1-E2 N/S/E/W ; S1-E3 S/E/W — S2 : S2-E1 S/E ;
S2-E2 S/E/W ; S2-E3 S/E/W).

---

## Application (Phase 3 du plan) — 2026-09-23

Encodage fait **depuis les tableaux ci-dessus**, jamais depuis la couche
texte ni depuis l'ancien payload. Aucune page n'a été relue à nouveau.

### Les six exercices réécrits

| Exercice | Avant (jamais vu sur une page)            | Après (imprimé)                                                    |
| -------- | ----------------------------------------- | ------------------------------------------------------------------ |
| S1-E1    | الاستنساخ وتركيب ARNm                     | **المغماتية المرتبطة بالظهرة وسط محيطية**                          |
| S1-E2    | الموقع الفعال (pH وحرارة)                 | **أنزيم غلوكوز أكسيداز GO وعلاقة البنية بالوظيفة**                 |
| S1-E3    | الاستجابة المناعية النوعية (مستضد neutre) | **الاستجابة المناعية ضد الخلايا السرطانية** (HLA I، LT8، TIL، IL2) |
| S2-E1    | كمون العمل والقنوات الفولطية              | **الأنديز: منطقة الغوص والبركان الانفجاري**                        |
| S2-E2    | التنفس الخلوي والحصيلة الطاقوية           | **مادة الـ DDT والقنوات الفولطية**                                 |
| S2-E3    | التكتونية العامة للصفائح                  | **المضاد الحيوي (Rifamycine) ومستويات تأثيره على تركيب البروتين**  |

### Consignes passées en `official` (17/24)

| Pôle    | Verbe imprimé                                                                      | Page |
| ------- | ---------------------------------------------------------------------------------- | ---- |
| S1-E1 S | تَعَرَّفْ على البيانات المرقمة من 1 إلى 8                                          | 1    |
| S1-E1 E | قَدِّمْ في نص علمي الأدلة… (المغماتية النشطة)                                      | 1    |
| S1-E2 N | فَهَلْ كل اختلاف في بنية الأنزيمات…                                                | 1    |
| S1-E2 S | اسْتَخْرِجْ الخطوات العملية المتبعة…                                               | 2    |
| S1-E2 E | قارن بين الخصائص البنيوية… + فَسِّرْ النتائج التجريبية (regroupement)              | 2    |
| S1-E2 W | قَدِّمْ إجابة ملخصة للمشكلة العلمية…                                               | 3    |
| S1-E3 S | حَدِّدْ دور الخلايا المناعية… + اقْتَرِحْ فرضيتين (regroupement)                   | 4    |
| S1-E3 E | فَسِّرْ إفلات وعدم إفلات الخلايا الورمية… + استنتِجْ… (regroupement)               | 5    |
| S1-E3 W | لَخِّصْ في مخطط مراحل الاستجابة المناعية…                                          | 5    |
| S2-E1 S | سمّ العناصر المرقمة وتعرّف على هذا النّشاط التكتوني                                | 6    |
| S2-E1 E | اشرح في نصّ علمي كيف تشكّل البركان الانفجاري…                                      | 6    |
| S2-E2 S | مَثِّلْ بيانيا ثم حَلِّلْ… + اقترح فرضيتين (regroupement, avec le barème de tracé) | 7    |
| S2-E2 E | حَدِّدْ أهم مُمَيِّزات القنوات… + فَسِّرْ تأثير الكمون المفروض (regroupement)      | 7    |
| S2-E2 W | ناقش صحة إحدى الفرضيتين…                                                           | 7    |
| S2-E3 S | حَلِّلْ النتائج… + اقترح ثلاث فرضيات (regroupement)                                | 8    |
| S2-E3 E | قارن بين النتائج التجريبية… + ناقش صحة إحدى الفرضيات (regroupement)                | 9    |
| S2-E3 W | لَخِّصْ في نص علمي… مراحل تركيب البروتين…                                          | 9    |

### Cadrages restés `reconstructed` (7)

S1-E1 N et W ; S1-E3 N ; S2-E1 N et W ; S2-E2 N ; S2-E3 N — chacun avec une
note datée du 2026-09-23 disant qu'aucune phrase interrogative n'est imprimée
à cet endroit. Les réponses modèles de ces pôles sont des aides pédagogiques.

### Réponses modèles réécrites

Elles suivent les documents imprimés (elles ne sont pas un corrigé officiel —
aucun corrigé local n'existe dans le dépôt) :

- **S1-E1** : la numérotation 1-8 du schéma est décrite telle que lue sur
  l'image (1 اتجاه التباعد، 2 لافا حديثة، 3 البرنس، 4 العمق، 5 صعود الصهارة،
  6 الاتجاهان المتعاكسان، 7 سيالات بازلتية، 8 بيريدوتيت المعطف) ; mention de
  la ملاحظة imprimée : 1300°C وضغط منخفض.
- **S1-E2** : les chiffres du tableau sont recopiés (581/587، 26/25، 71/24،
  Cys164-Cys206 / Cys168-Cys210، Arg512-His516-His559-Asp424 /
  Arg516-His520-His563-Asp428) ainsi que les Vmax des six expériences.
- **S1-E3** : les quatre colonnes du tableau de fluorescence sont décrites
  (الوسط (أ) : فلورة خضراء وحمراء على الغشاء بأربع إشارات ; الوسط (ب) :
  غياب الفلورة الخضراء على الغشاء) → الفرضية الأكثر وجاهة : تغير أو غياب
  HLA I.
- **S2-E2** : les valeurs du tableau sont recopiées (70- mV ثم +30 mV ثم
  عودة سريعة في غياب الـ DDT ; البقاء عند نحو +25 mV في وجوده) مع barème
  الرسم كما هو مطبوع.
- **S2-E3** : les barres du الشكل (ب) (10 / 8 / 6 / 2 / ≈0) et les trois
  أوساط du tableau sont décrits ; le niveau de تأثير retenu est **النسخ**
  (الوسط 3 يثبت أن الترجمة غير معيقة).

### Gardes ajoutées (Phase 5) et verrou

- `tests/archive-years.test.mjs` : la garde « archive 2013-2019 = tout
  `reconstructed` » n'est **pas supprimée ni assouplie** ; elle est restreinte
  à une **liste blanche explicite** des 17 pôles de 2019 relus sur image.
  Toute consigne officielle hors liste blanche fait échouer le test, et
  2013-2018 doit rester intégralement `reconstructed`.
- `tests/se-2019-recopy.test.mjs` (8 tests) : fige les 17 textes et leurs
  pages, les 7 cadrages, les barèmes 5/7/8 lus sur les titres, la disparition
  des cinq thèmes périmés (aucun retour possible par inadvertance), la
  longueur des réponses modèles et le rattachement du générateur
  (2019/S2 offset +5, 294 consignes officielles au total).

### Mesures après encodage

`npm run inventory:generate` → **58 sujets, 576 tâches, 294 consignes
officielles** (277 + 17), **282 étapes reconstruites**, 294/294 pages
rattachées, **0/58 inventaire `complete`**. `activePoles` passe de 277 à
**294** et le minimum de copies exigé (P1.5) de 4155 à **4410** : la
promotion de 2019 rend la barre de calibration plus haute, elle ne la baisse
pas. `p1:check` reste rouge (0/58 complets, 0/4410 copies) — attendu.

### Précision après encodage — 2026-09-24 (relecture ciblée p. 5)

La réponse modèle du pôle **S1-E3 E** disait « في الوسط (ب): تنتقل الفلورتان
إلى الوسط (++++) ولا تكادان تظهران على الغشاء », ce qui aplatit le tableau.
Nouvelle lecture **cellule par cellule** de `sujet-1.pdf` p. 5 (zoom ×3 / ×4 /
×8, `rendered/crops/`) :

| الوسط | أخضر في الوسط | أخضر على الغشاء | أحمر في الوسط | أحمر على الغشاء |
| ----- | ------------- | --------------- | ------------- | --------------- |
| (أ) خلايا (X) من ورم حديث، غير مقاومة لـ TIL | + | ++++ | + | ++++ |
| (ب) خلايا (Y) من ورم متقدم، مقاومة لـ TIL | +++++ | **−** | ++++ | + |

Et la page imprime l'identité des sondes (الأخضر ↔ HLA I, الأحمر ↔ الببتيد
المستضدي) dans **التجربة (1)**, juste avant le tableau : la disparition
**totale** du vert sur la membrane de (ب) et la persistance **faible** du rouge
(+) ne sont donc pas symétriques. La réponse modèle a été réécrite sur ces
valeurs exactes ; aucun texte officiel n'a changé (les 17 consignes restent
celles du 2026-09-23), donc `tests/se-2019-recopy.test.mjs` reste vert.

Contrôle de pagination à la même occasion : le pied de la page 4 du fichier
imprime « صفحة 4 من 9 » → `sujet-1.pdf` = pages 1-5 du livret, `pageOffset 0`
confirmé.
