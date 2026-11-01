# Checklist de relecture — BAC maths (شعبة رياضيات)

**Date :** 2026-09-15 (dernière passe : 2013-m — la filière maths est encodée de
2013 à 2026 ; passes précédentes : 2014-m, 2015-m, 2016-m, 2021-m, 2022-m,
2026-m, puis 2023-m, 2024-m et 2025-m revérifiés sur les scans locaux). Branche
`arena/01a09be6-rebrique-sujet-bac` (PR #26).

Périmètre : toutes les consignes officielles de la filière maths encodées dans
`data/years/m/`. Règle appliquée : une tâche n'est marquée `official` que si le
`bacPrompt` a été relu **sur l'image de la page** ; le reste reste
`reconstructed` (badge ⚠️) et aucun texte n'est inventé.

## Pourquoi la couche texte ne suffit pas

Les scans ministériels portent une couche texte inversée ou bruitée. Exemples
relevés : `2222` pour 2022, `20 سا و02 د` pour 2 h 30, `إمتحان`/`امتحان`
mélangés. Recopier une consigne depuis cette couche produit une faute que
l'élève recopie ensuite en épreuve.

Outil ajouté : `node scripts/render-pdf-pages.mjs <pdf> <pages> [scale]`
→ `rendered/<chemin>_pN.png` (dossier ignoré par git). Elle demande un canvas
Node ; sous ce dépôt, l'alias local `node_modules/canvas` → `@napi-rs/canvas`
suffit (procédure dans l'en-tête du script).

Audit d'un sujet (pôles, points, provenance, page) :
`node scripts/report-subject-inventory.mjs 2024-m`.

## Pages relues en image

| Sujet                       | Page                   | Contenu                                                                         | Décision                                                                                                                                                                                                                                 |
| --------------------------- | ---------------------- | ------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2023-m S1 (scan `-1077342`) | 1                      | ت1 (8ن) الإيثانول / بنية البروتين                                               | S = Q1+Q2 mot à mot, E = Q3 (نص علمي)                                                                                                                                                                                                    |
| 2023-m S1                   | 2                      | ت2 (12ن) القصور المناعي / PRF1, الجزء الأول                                     | N = consigne officielle mot à mot                                                                                                                                                                                                        |
| 2023-m S1                   | 3                      | ت2, الجزء الثاني + الثالث                                                       | E et W alignés sur le scan                                                                                                                                                                                                               |
| 2023-m S1                   | 4                      | S2 ت1 : التعاون الخلوي                                                          | S, E confirmés                                                                                                                                                                                                                           |
| 2023-m S2                   | 5                      | ت2 (13ن) Halofuginone / ملاريا, الجزء الأول                                     | N confirmé                                                                                                                                                                                                                               |
| 2023-m S2                   | 6                      | ت2, الجزء الثاني + الثالث                                                       | E = Q1+Q2 (نصيحة), W confirmé                                                                                                                                                                                                            |
| 2024-m S1                   | 1                      | ت1 (7ن) الكورديسبين                                                             | S = Q1+Q2, E = Q3                                                                                                                                                                                                                        |
| 2024-m S2                   | 1 (page 4 du scan)     | ت1 (7ن) PID / الرد الخلطي                                                       | S = Q1+Q2 (جدول المنشأ), E = Q3                                                                                                                                                                                                          |
| 2025-m S1                   | 1                      | ت1 (8ن) Q/D / الريبوزوم                                                         | S = Q1+Q2+Q3, E = Q4                                                                                                                                                                                                                     |
| 2020-m S1 (scan `-2273619`) | 1                      | ت1 (8ن) بنية البروتين / هجرة كهربائية                                           | S = Q1+Q2+Q3, E = Q4 ; N/W reconstruits                                                                                                                                                                                                  |
| 2020-m S1                   | 2-3                    | ت2 (12ن) Ras / p53 / سرطان الجلد                                                | N = « صُغ المشكل العلمي », S = فرضية+بيّن+ترجم, E = اشرح+نص علمي                                                                                                                                                                         |
| 2020-m S2                   | 4                      | ت1 (8ن) جزيئات HLA                                                              | S = Q1+Q2+Q3, E = Q4 ; N/W reconstruits                                                                                                                                                                                                  |
| 2020-m S2                   | 5                      | ت2 (12ن) الأنيميا المنجلية HbS                                                  | N = « أبرز المشكلة المطروحة », S = فرضية+قارن, E = تحقق+نص علمي                                                                                                                                                                          |
| 2020-m corrigé              | 6-10                   | corrigé officiel complet                                                        | réponses modèle rédigées depuis l'image (رابطة شاردية، (س)=R2…، T→A position 20)                                                                                                                                                         |
| 2017-m S1                   | 1, 2                   | ت1 (6ن) المعقد المناعي ; ت2 (14ن) النسخ والترجمة                                | quatre consignes mot à mot par exercice ; réponses modèle = corrigé officiel (`-2275712` pp. 5-7)                                                                                                                                        |
| 2017-m S2                   | 3, 4                   | ت1 (6ن) الأحماض الأمينية ; ت2 (14ن) الجزيئات الدفاعية                           | huit consignes mot à mot ; réponses modèle = corrigé officiel (pp. 7-9)                                                                                                                                                                  |
| 2019-m corrigé              | 6-10                   | corrigé officiel complet des deux sujets                                        | réponses modèle réécrites : (1) β / (2) α / (3) انعطاف et 257 غ/مول ; (س)=LT4، (ع)=LT8، (ص)=LB، (ل)=بالعة ; الغرفة (3) بلا استجابة ; n = 3، UUU/AAA/CCC، 4 أحماض، UCC/CUC/ACA/CAC، رامزات التوقف                                         |
| 2018-m S1                   | 1, 2, 3                | ت1 (7ن) المورثة والبروتين ; ت2 (13ن) العجز المناعي                              | Q1–Q4 mot à mot (بيانات+الظاهرتان، مرحلتا (ص)، هجرة كهربائية، نص علمي) ; W reconstruit ; ت2 : كل السلم mot à mot (منحنى، مقارنة، (a)/(b) وCMH II، تحليل الوثيقة 4، نص علمي)                                                              |
| 2018-m S2                   | 4, 5, 6                | ت1 (6ن) اللقاح والجسم المضاد ; ت2 (14ن) مورثة الريبونوكلياز                     | huit consignes mot à mot (تعرّف/مثّل، الظاهرة، الاستجابة الثانوية، نص علمي، البيانات 1–3، جدول الشفرة، متتالية الأحماض، سبب RNas غير عادي)                                                                                               |
| 2019-m S1                   | 1                      | ت1 (6ن) بنية البروتين / الرابطة الببتيدية                                       | Q1–Q4 mot à mot (بيانات، صيغة + كتلة مولية، تعليل، نص علمي)                                                                                                                                                                              |
| 2019-m S1                   | 2, 3                   | ت2 (14ن) الخلايا المناعية / الغرفتان                                            | N, S, E mot à mot ; W reconstruit                                                                                                                                                                                                        |
| 2019-m S2                   | 4, 5                   | ت1 (6ن) البالعة ; ت2 (14ن) الشفرة الوراثية                                      | consignes mot à mot                                                                                                                                                                                                                      |
| 2015-m S1                   | 1, 2                   | ت1 (10ن) الهجرة الكهربائية والببتيد 503 ; ت2 (10ن) الزمر الدموية                | consignes mot à mot (تحليل النتائج، الفرضية، II-1/II-2، الاختباران، الرسم، المقارنة، المخطط) ; les deux pôles N reconstruits et le W de ت2 reconstruit                                                                                   |
| 2015-m S2                   | 3, 4                   | ت1 (10ن) البروتين amphotère والبنية الثالثية ; ت2 (10ن) فيروس الالتهاب الكبدي B | consignes mot à mot (المنحنى، pHi، II-1/II-2/II-3، وصف البنية، فسّر، الرسم، المراحل، استخرج) ; les deux pôles N reconstruits                                                                                                             |
| 2015-m corrigé              | 5-10                   | corrigé officiel « الإجابة النموذجية وسلم التنقيط » des deux sujets             | réponses modèle réécrites : 503 = (133+174+117+133) − 3×18 ; pHi = 4.5 ; قوس ترسيب Hbs/Hbe ; 90 % في الوسط 4 ; O+ / AB− / B+ / A+ ; N أسيتيل غلوكوزامين و الغالاكتوز                                                                     |
| 2014-m S1                   | 1, 2                   | ت1 (10ن) البنيات الفراغية وجذور R1-R4 ; ت2 (10ن) الغشاء الهيولي وتحديد الذات    | S1 : S = Q1 (أ، ب α/β، ج، د), E = Q2+Q3 ; W reconstruit (l'exercice s'arrête à 3ب) ; S2 : S = Q1, E = Q2+Q3 ; W = Q4 imprimée (تعريف الذات واللاذات), N reconstruits                                                                     |
| 2014-m S2                   | 3, 4                   | ت1 (10ن) النسخ والترجمة ; ت2 (10ن) الجهاز المناعي وفيروس السيدا                 | S2-E1 : S = Q1+Q2, E = Q3+Q4 (جدول ADN/ARNm et النص العلمي) ; S2-E2 : S = Q1+Q2, E = Q3 ; les deux W reconstruits (l'exercice s'arrête à 4ج et 3ج)                                                                                       |
| 2014-m corrigé              | 5-11                   | corrigé officiel « الإجابة النموذجية » des deux sujets                          | réponses modèle réécrites : pHi 3 / 5 / 9.8 / 10.8 ; 4⁴ = 256 و 4×3×2×1 = 24 ; بنية ثالثية، رابطة كبريتية (A) وشاردية (B) ; 100 % في الوسط أ وتناقص التيميدين ; زمرة (س) : B أو O (Anti A) ; 18 = 5×3 + 3 و 4 وحدات بنائية ; gp120/CD4   |
| 2016-m S1                   | 1, 2                   | ت1 (10ن) تركيب البروتين ; ت2 (10ن) البالعة والأجسام المضادة                     | consignes mot à mot (Q1/Q2، الجدول، الوثيقة 2) ; les deux pôles N reconstruits                                                                                                                                                           |
| 2016-m S2                   | 3, 4                   | ت1 (10ن) من الـ ADN إلى البروتين ; ت2 (10ن) الغشاء وCMH                         | consignes mot à mot (Anagène، الترجمة والحساب، الفلورة، CMH والنمط الوراثي) ; les deux pôles N reconstruits                                                                                                                              |
| 2016-m corrigé              | 5-11                   | corrigé officiel « عناصر الإجابة » des deux sujets                              | réponses modèle réécrites : 429 = 3 × 143 و141 = 1 − 142 ; 16.66 % = 1 × 100 ÷ 6 (الأليل C3 متماثل) ; الجزء الثابت والمتغير للجسم المضاد ; فسيفسائي ومائع ; نظام CMH ونظام ABO والريزوس                                                  |
| 2021-m S1                   | 1, 2, 3                | ت1 (8ن) CMH / زرع الكلية ; ت2 (12ن) الماكروليد (Mex.R)                          | S1 : S = Q1+Q2 (النمط الوراثي لولدين rattachée), E = Q3 ; S2 : N = question du préambule, S = Q1, E = Q2أ+Q2ب puis Q1 du الجزء الثاني, W = نصيحة + نص علمي du الجزء الثالث                                                               |
| 2021-m S2                   | 4, 5, 6                | ت1 (8ن) النسخ والترجمة ; ت2 (12ن) الهيموغلوبين R/T                              | S2-E1 : S = Q1+Q2, E = Q3+Q4 ; S2-E2 : N = Q2, S = Q1, E = Q1+Q2أ+Q2ب+Q3 (الفرضية والخطورة rattachées), W = Q3 du الجزء الثالث                                                                                                           |
| 2022-m S1                   | 1, 2, 3                | ت1 (8ن) دور الريبوزوم ; ت2 (12ن) اختبار RADT Cov19                              | S1 : S = Q1, E = Q2+Q4, W = Q3 ; S2 : N = فرضيتان, E = Q du الجزء الثاني (الشكل (ج) et les trois sites), W = Q du الجزء الثالث (وضّح)                                                                                                    |
| 2022-m S2                   | 4, 5, 6                | ت1 (8ن) البنية الفراغية للجسم المضاد ; ت2 (12ن) الهيبسيدين                      | S2-E1 : S = Q1+Q2 (رتب المراحل rattachée), E = Q3 ; S2-E2 : N = Q1, S = exploitation du tableau 1, E = Q du الجزء الثاني, W = Q du الجزء الثالث                                                                                          |
| 2022-m corrigé              | 7-13                   | corrigé officiel « الإجابة النموذجية » des deux sujets                          | réponses modèle réécrites : 0→40 د n'existe pas ici ; R/T absent ; points clés = (س) ثانوي، ج←أ←ب، 10-30 غ، الثلاثية 33 G→A, sites S/T/C, وضّح chez 2022-m S1-E2/W                                                                       |
| 2026-m S1                   | 1, 2, 3 (scan local)   | ت1 (6ن) LTc ; ت2 (14ن) HCF/LDLR/PCSK9                                           | S1-E1 : S = Q1, E = Q2 (mention « مُهيكل بمقدمة وعرض وخاتمة ») ; S1-E2 : N = فرضيتان, E = Q1+Q2 (برّر تثبيط PCSK9 rattachée), W = خلاصة du الجزء الثالث                                                                                  |
| 2026-m S2                   | 4, 5, 6 (scan local)   | ت1 (8ن) IL-2 ; ت2 (12ن) غيتلمان/SLC12A3                                         | S2-E1 : N = Q1, S = Q2, E = Q3, W = خاتمة ; S2-E2 : N = Q1, E = Q1+Q2 (قدّم نصيحة rattachée), W = مخطط وظيفي du الجزء الثالث                                                                                                             |
| 2021-m corrigé              | 7-12                   | corrigé officiel « الإجابة النموذجية » des deux sujets                          | réponses modèle réécrites : 0→40 د, 70 %/10 % ; Mex.R (الثلاثية 114 : TGC → TGA, رامزة توقف, 7 أحماض بديلة عن 9) ; R/T (روابط كارِهة للماء، تثبيت/تحرير O2) ; 7.4 → 7.3 ; رابطة شاردية His146–Asp94                                      |
| 2013-m S1                   | 1, 2                   | ت1 (10ن) الشفرة الوراثية والترجمة ; ت2 (10ن) الألبومين والاستجابة الخلطية       | S1-E1 : S = Q1أ-د, E = Q2أ-ج ; S1-E2 : S = Q1أ+ب, E = Q2أ+ب puis Q3أ+ب ; pôles N et W reconstruits (aucune question de cadrage ni de clôture imprimée)                                                                                   |
| 2013-m S2                   | 3, 4                   | ت1 (10ن) الخلية اللمفاوية B والبلازمية ; ت2 (10ن) الاستجابة الخلوية             | S2-E1 : S = QI-1+2+3أ+3ب, E = QII-1+2أ+2ب+3أ+3ب ; S2-E2 : S = QI-1+2أ+2ب, E = QII-1أ+1ب+2أ+2ب puis QIII ; pôles N et W reconstruits                                                                                                      |
| 2013-m corrigé              | 5-11                   | corrigé officiel « الإجابة النموذجية » (7 pages)                                | réponses modèle réécrites : 2³ = 8 ; AUG/Met و UAA/UAG/UGA ; AAG/ACC/UGG/GGC ; H2N–CH(R1)–CO–NH–CH(R2)–CO–NH–CH(R3)–COOH ; قوس الترسيب بين (م) و(د) فقط ; مناعة خلطية ثم خلوية ; ARNr/ARNt مقابل ظهور ARNm chez la plasmocyte            |
| 2023-m (relu 2026-09-14)    | couche texte 1-3 + 4-6 | consignes et figures des deux sujets                                            | deux consignes corrigées (Asp/Tyr imprimés ; fin de بيّن في نص علمي) ; valeurs des figures relues : courbe 0.6→10 et 10→80 %, barres ≈3500/≈250 جزيئة, triplets AGT GTC ATA GTG / AGT ATC ATA GTG, UCA→Ser…UAG→توقف                      |
| 2024-m (relu 2026-09-14)    | 1, 2 (S1) + 1 (S2)     | ت1 الكورديسبين ; ت2 الورم ; ت1 PID                                              | Q2 de ت1 reçue sa réponse (complément AGACGUUG lu sur la figure) ; verbe تُبيّن restauré ; courbe du الوسط 1 (250→≈330→≈180) et du الوسط 2 (250→≈1180) ; corrigé : LT8 source des LTc ; consigne restituée avec الأولي et نص علمي مُهيكل |
| 2025-m (relu 2026-09-14)    | 2, 3 (S1) + 2 (S2)     | ت2 TAP ; ت2 UV-C/Spike                                                          | deux consignes de فرضيتين recopiées mot à mot ; tableau du الشكل (ب) : 10/35/50/70 % contre 3/5/8/9 % pour 0.1→2 µg/mL ; تتابع ...CTGACTGG... / ...CTGATGG... (حذف C) ; LT8                                                              |

## Consignes corrigées ou ajoutées (cette passe)

- **2023-m S1-E1** — la tâche E recopiait la question 2 et la question du texte
  scientifique n'existait nulle part ; les trois questions officielles sont
  maintenant encodées.
- **2023-m S1-E2** — la consigne du الجزء الأول était une paraphrase
  (« توضحان » au lieu de « توضّح بهما … باستغلالك لنتائج الوثيقة 1 »).
- **2023-m S2-E2** — « قدّم نصيحة مُبرَّرة لتفادي ذلك » (الجزء الثاني, Q2)
  n'était mappée nulle part.
- **2024-m S1-E1** — « أكمل التتابع النيكليوتيدي للعنصر 4 في حالة غياب (COR) »
  (Q2) manquait ; « الجدول منشأ ومقر اكتساب الكفاءة » n'existait pas non plus.
- **2024-m S2-E1** — idem : table du منشأ / مقر الاكتساب ajoutée.
- **2025-m S1-E1** — « مثّل الجزء المؤطر (م)… » et « أعطِ الصيغة الكيميائية
  للأحماض الأمينية (Lys, Asp, Ala)… » (Q2, Q3) manquaient.
- Notes de provenance : elles citaient « corrigé page N » alors que la consigne
  a été relue sur le **scan** ; chaque note porte désormais la page relue.
- **2018-m** : réponses modèle **réécrites depuis le corrigé officiel** (le
  dossier local `M/dzexams-bac-sciences-1967487.pdf` porte l'« الإجابة
  النموذجية » pp. 7–12). Les hypothèses de la première passe étaient fausses :
  (س) = الاستنساخ (النواة) et (ص) = الترجمة (الهيولى) — et non « تضاعف ADN /
  تعبير مورثي » ; les stades des figures du ت2 sont **مرحلة النهاية / مرحلة
  الاستطالة** ; (a) = CD4 et (b) = TCR (et non CMH II) ; les phases de
  l'infection sont **الإصابة الأولية / الكمون / العجز المناعي** (seuil
  numérique : 200 خلية/مم³, fenêtre 9–12 شهرا) ; le tableau du الشكل (أ) donne
  **His–Phe–Asp–Pro–Ser–Val** et **His–Tyr–Asp–Pro–Ser–Val**, avec les
  séquences GTA AAA CTA GGA AGT CAG ATT / CAT TTT GAT CCT TCA GTC TAA ; la
  mutation est l'**استبدال النيكليوتيد A رقم 362 → T** (حمض أميني 120 :
  Phe → Tyr).
- **2018-m S1-E1-Q4** et **S1-E2-W** : le pôle W de ت1 est signalé `reconstructed`
  (simple clôture) ; les huit consignes du sujet 2 sont toutes imprimées dans le
  sujet, donc `official`.

## Passe 2022-m et 2026-m (2026-09-14)

Dossier dzexams local `M/dzexams-bac-sciences-1777391.pdf` (sujets pp. 1-6,
corrigé « الإجابة النموذجية » pp. 7-13), relu en image, et scans locaux
`subjects/M/2026/sujet-{1,2}.pdf` (3 pages chacun) relus en image, corrigé
eddirasa 2026 lu via l'extraction texte de la même URL.

```bash
node scripts/render-pdf-pages.mjs M/dzexams-bac-sciences-1777391.pdf 1,2,3,4,5,6 2
node scripts/render-pdf-pages.mjs M/dzexams-bac-sciences-1777391.pdf 7,8,9,10,11,12,13 2
node scripts/render-pdf-pages.mjs subjects/M/2026/sujet-1.pdf 1,2,3 2
node scripts/render-pdf-pages.mjs subjects/M/2026/sujet-2.pdf 1,2,3 2
```

**2022-m.** Les consignes venaient d'un OCR RTL mixte ; la relecture image les a
corrigées : `S1-E2/W` imprime « **وضّح** كيف تُساهم هذه الدراسة » (et non
« بيّن »), `S1-E2/N` imprime « توضّح » avec la référence « الوثيقة (1) ». Les
trois consignes « non mappée » sont rattachées : la معادلة chimique (Q2) dans
`S1-E1/E`, le ترتيب المراحل (Q2) dans `S2-E1/S`, et l'analyse chiffrée du
tableau 1 dans `S2-E2/S`. Trois réponses modèle étaient fausses :
`S2-E1/S` classait (س) comme niveau **primaire** alors que le corrigé écrit
« (س) مستوى بنائي **ثانوي** » et le ترتيب est **ج ← أ ← ب** ; `S2-E2/S` donnait
« من 11 إلى 13 غ » alors que le tableau du sujet **et** le corrigé donnent
**من 10 إلى 30 غ** ; `S2-E2/E` restait muet sur la position de la mutation, que
le corrigé situe au **الثلاثية 33** (استبدال G بـ A : GTC ← ATC →
سلسلة ببتيدية غير مكتملة). Le texte du `S2-E1/E` suit désormais mot pour mot
les éléments du corrigé (تنتقل… إلى الثانوي بتقالف… / تكسب… بنية ثالثية… ).

**2026-m.** Les deux consignes « non mappée » sont rattachées : « برّر أنّ
تثبيط بروتين PCSK9 يمكن أن يكون علاجا مناسبا للشخص المصاب بالنمط A دون
المصاب بالنمط B » dans `S1-E2/E`, et « قدّم نصيحة لتحسين الحالة الصحية
للمصابين بمتلازمة غيتلمان » dans `S2-E2/E`. Deux consignes ont été complétées
d'après le scan : la mention « النصّ العلمي: مُهيكل بمقدمة وعرض وخاتمة » fait
partie de la consigne imprimée, et `S2-E2/W` demande un **مخطط وظيفي**.
Réponses modèle complétées depuis le corrigé : `S1-E2/E` chiffre la mutation
(النمط B : الثلاثية 33 GTC ← ATC → LDLR غير مكتمل) et répond au برّر
(تثبيط PCSK9 يفيد النمط A لأن الإفراط في PCSK9 هو السبب، بينما النمط B خلله في
بنية LDLR) ; `S2-E2/E` détaille les trois figures (1.5 و.إ / 1 و.إ ; CUG ← CCG
Leu ← Pro ; تجاذب الجذور الكارهة للماء) et donne la نصيحة du corrigé (أغذية غنية
بالشوارد + أدوية تنشط إعادة الامتصاص).

## Passe 2023-m, 2024-m et 2025-m (2026-09-14)

Ces trois années avaient été encodées le 2026-08-31 depuis l'OCR eddirasa des
sujets. Leurs scans locaux (`subjects/M/2023…2025/sujet-{1,2}.pdf`) ont été
rouverts : ceux de 2023 portent une couche texte lisible, ceux de 2024 et 2025
sont image seul. Les corrigés eddirasa n'ont servi qu'à recouper la structure
(leurs chiffres sont inversés par l'OCR : ils ne sont jamais repris sans
l'image).

```bash
node scripts/dump-pdf-text.mjs subjects/M/2023/sujet-1.pdf 1 --lines   # pages 1 à 6
node scripts/render-pdf-pages.mjs subjects/M/2024/sujet-1.pdf 1,2 2
node scripts/render-pdf-pages.mjs subjects/M/2024/sujet-2.pdf 1 2
node scripts/render-pdf-pages.mjs subjects/M/2025/sujet-1.pdf 2,3 2
node scripts/render-pdf-pages.mjs subjects/M/2025/sujet-2.pdf 2,3 2
```

Ce qui a changé dans les données :

- **2023-m S1-E1** : l'énoncé imprime bien `(Asp و Tyr)` (la transcription
  laissait deux parenthèses vides, comme si l'élève devait les identifier).
- **2023-m S2-E1/E** : la fin de la consigne (الاستجابة المناعية النوعية مستغلا
  معارفك ومعطيات الوثيقة) manquait.
- **2023-m S1-E2** : chiffres relus sur les figures — courbe du milieu 1 de
  ~10 % à ~80 % quand celle du milieu 2 reste vers 20 %, barres du الشكل (أ)
  ≈3500 / ≈250 جزيئة (l'OCR donnait 3066 et 166), triplets
  `AGT GTC ATA GTG` / `AGT ATC ATA GTG` et table des codons du الشكل (ج).
- **2023-m S2-E2** : courbes relues (croissance à 100 % jusqu'à 1.5 و.ت puis
  quasi nulle dès 4 و.ت ; barres 100 / 60 / 40 / ~10 %) et نصيحة alignée sur
  le corrigé (الجرعات الضعيفة بلا مفعول والعالية تؤثر سلبا على العضوية).
- **2024-m S1-E1** : la question 2 (أكمل التتابع) n'avait aucune réponse
  modèle ; la figure donne la trame `G A C A T C T G C A A` + (س) C, l'ARNm
  déjà dessiné `C U G U` et la cordycépine en face du T → complément
  `A G A C G U U G` (ce que donne aussi le corrigé).
- **2024-m S1-E2** : le verbe officiel est `تُبيّن` (et non تفسر) ; la courbe
  donne 250 → ≈330 (اليوم 6) → ≈180 pour le الوسط 1 et 250 → ≈1180 pour le
  الوسط 2 (le corrigé arrondissait à 100 et 1250).
- **2024-m S2-E1** : la consigne officielle porte الأولي et la forme du
  نص علمي (مقدّمة، عرض وخاتمة) ; la réponse du corrigé attribue aux الخلايا
  LT8 le rôle de source des LTc (la transcription écrivait LTh/IL).
- **2025-m S1-E2** : les deux consignes de فرضيتين sont recopiées mot à mot ;
  le tableau du الشكل (ب) donne 10 / 35 / 50 / 70 % chez le sujet sain contre
  3 / 5 / 8 / 9 % chez le malade pour des concentrations de 0.1 à 2 µg/mL (et
  non un « 3 % » constant) ; le الشكل (ج) oppose `...CTGACTGG...` à
  `...CTGATGG...` (حذف نيكليوتيدة) et la cellule est LT8.
- **2025-m S2-E2** : consigne officielle de فرضيتين recopiée mot à mot (آلية
  تأثير شدة الأشعة UV-C على الفيروس).

Les réponses modèle restent verrouillées par `tests/maths-model-answers.test.mjs`
(la réponse modèle doit satisfaire sa propre règle de mots-clés).

## Passe 2013-m (2026-09-15) — dernière année maths

Troisième scan **image seul** : le dossier dzexams local
`M/dzexams-bac-sciences-2770867.pdf` (11 pages) porte le sujet (pp. 1-4) et son
corrigé officiel « الإجابة النموذجية » (pp. 5-11), avec **1 fragment de texte par
page** (`www.dzexams.com`) : aucune consigne n'a pu être recopiée depuis une
couche texte, tout vient de l'image.

```bash
node scripts/render-pdf-pages.mjs M/dzexams-bac-sciences-2770867.pdf 1,2,3,4 2
node scripts/render-pdf-pages.mjs M/dzexams-bac-sciences-2770867.pdf 5,6,7,8,9,10,11 2
node scripts/report-subject-inventory.mjs 2013-m
```

Format retrouvé sur l'image : **2 sujets × 2 exercices (10 + 10)**, durée imprimée
02 سا و30 د. Sujet 1 : قراءة اللغة الوراثية (جدول الشفرة الوراثية و`4³ = 64`،
اللغتان والقاموس، إشارات البدء والنهاية، رسم الترجمة على الريبوزوم بالبيانات
1-6 والأحماض A1 إلى A5 وثلاثيات القواعد، الصيغة الكيميائية للجزء المؤطر (م)،
والأحداث التي سمحت بالانتقال من الشكل أ إلى الشكل ب) puis الألبومين والاستجابة
الخلطية (تقنية Ouchterlony، العنصر (س)، رسم المعقد المناعي، الأشعة X واستئصال
الغدة السعرية، الحفر الأربع). Sujet 2 : الخلية اللمفاوية B والخلية البلازمية
(البيانات 1-7، نتائج فصل ARNr و ARNt و ARNm، بنية الجسم المضاد) ثم الاستجابة
الخلوية (جدول التجارب الأربع، شروط عمل الخلية (س)، منحنى الأرثروكين، فيروس VIH).

Huit consignes imprimées deviennent des tâches `official` ; les quatre pôles N
(aucune question de cadrage imprimée) et les quatre pôles W (les quatre exercices
se terminent sur une question déjà rattachée au pôle E : 1د، 3ب، II-3ب، III)
restent reconstruits et le disent dans leur note.

Valeurs reprises du corrigé : les lettres `A` (عدد قواعد الرامزة = 3) و `B` (عدد
أنواع القواعد الأزوتية = 4) و `C` (عدد أنواع الرامزات = 64)؛ اللغة 1 نوية واللغة
2 بروتينية والقاموس هو جدول الشفرة الوراثية؛ بفرض نوعين من الحروف فإن `2³ = 8`
كلمات؛ إشارات البدء `AUG` (Met) وإشارات النهاية `UAA` و`UAG` و`UGA`؛ البيانات
1 رامزة انطلاق، 2 الموقع P، 3 حمض أميني، 4 الريبوزوم، 5 الموقع A، 6 ARNt؛
الأحماض A1 Met، A2 Lys، A3 Phe، A5 Gly؛ ثلاثيات القواعد س: AAG، ص: ACC،
ع: UGG، ل: GGC؛ الصيغة الكيميائية للجزء المؤطر
`H2N–CH(R1)–CO–NH–CH(R2)–CO–NH–CH(R3)–COOH`؛ وصف الأحداث في ثلاث خطوات
(انقطاع الترابط وتشكل رابطة ببتيدية، حركة الريبوزوم برامزة واحدة، وصول ARNt
خامس). Sujet 1 exercice 2 : (س) هو الجسم المضاد (خلية لمفاوية B مفرزة)، الرسم
مع المنطقة المتغيرة والثابتة والسلسلتين، والمعلومة المستخلصة هي نوعية المفعول؛
قوس الترسيب يتشكل بين الحفرتين (م) و(د) فقط (المجموعة الرابعة المعطاة LB + LT)
والمجموعات الثلاث الأخرى بلا أجسام مضادة (غياب B و T، أو غياب B، أو غياب LT4)؛
ونوع الاستجابة **مناعة نوعية ذات وساطة خلطية**. Sujet 2 exercice 1 : (أ) خلية
لمفاوية LB و(ب) خلية بلازمية LBP، ومصدرها نقي العظام ثم تمايز LB المنتقاة؛ نتائج
الفصل تُظهر ARNr و ARNt في اللمفاوية مقابل **ظهور ARNm** في البلازمية (دلالة على
تركيب البروتين وإفرازه عبر الشبكة الهيولية وجهاز كولجي والحويصلات)؛ والجسم
المضاد بروتين (غاما غلوبولين) ثالثي الببتيد في جزئه المؤطر، يحافظ على ثباته
بروابط هيدروجينية وشاردية وجسور ثنائية الكبريت وتجاذب الجذور الكارهة للماء.
Sujet 2 exercice 2 : (س) هي LTC ومصدرها تمايز LT8 المنتقاة؛ وشروط عملها (خلية
مصابة تحمل نفس الببتيد المستضدي، ونفس سلالة الفأر أي توافق CMH)؛ والآلية
تعرف مزدوج (TCR مع ببتيد مستضدي–CMH I) ثم البيرفورين والصدمة الحلولية؛ ومنحنى
الأرثروكين ثابت ومنخفض إلى الأسبوع الأول (فترة الانتقاء) ثم متزايد؛ وVIH
يستهدف LT4 فينقص الأرثروكين؛ ونوع الاستجابة **مناعية نوعية ذات وساطة خلوية**.

Le catalogue maths ouvre désormais en **2013** : les quinze sessions encodées
(2013-m … 2026-m plus la session exceptionnelle 2017) couvrent toute la filière,
`tests/maths-2013.test.mjs` verrouille la session (barème, inventaire mappé, liste
des huit pôles officiels, valeurs du corrigé) et plus aucune carte maths ne reste
en consultation.

## Passe 2014-m (2026-09-15)

Deuxième année dont le scan est **image seul** : le dossier dzexams local
`M/dzexams-bac-sciences-2369148.pdf` (11 pages) porte le sujet (pp. 1-4) et son
corrigé officiel « الإجابة النموذجية » (pp. 5-11), avec **1 fragment de texte par
page** : rien n'a pu être recopié depuis une couche texte, tout vient de l'image.

```bash
node scripts/render-pdf-pages.mjs M/dzexams-bac-sciences-2369148.pdf 1,2,3,4 3
node scripts/render-pdf-pages.mjs M/dzexams-bac-sciences-2369148.pdf 5,6,7,8,9,10,11 2
node scripts/report-subject-inventory.mjs 2014-m
```

Format retrouvé sur l'image : **2 sujets × 2 exercices (10 + 10)**, durée imprimée
02 سا و30 د. Sujet 1 : البنيات الفراغية (جذور R1-R4 وقيم pHi، الهجرة الكهربائية
عند pH=5، عدد أنواع رباعي الببتيد، الروابط A وB، تجربتا اليوريا وبيتا
مركبتوإيتانول على الريبونوكلياز) ثم الغشاء الهيولي وتحديد الذات (النموذج
الفسيفسائي المائع، تجربة الزرع في الوسطين أ و ب، مصل الشخص (س) وقطرة دم الشخص
(ص)). Sujet 2 : النسخ والترجمة (البيانات 1-8، العنصر (ص)، مراحل تنشيط الحمض
الأميني، الاستنساخ) ثم الجهاز المناعي وإقصاء اللاذات (خلايا الطحال في خمسة
وسائط، فيروس السيدا، نسبة LT4 و LB، تطور الأجسام المضادة).

Neuf consignes imprimées deviennent des tâches `official`. Les quatre étapes de
cadrage N restent reconstruites (aucun « المشكل العلمي » n'est imprimé) et le
disent dans leur note, comme trois pôles W : les exercices 1 et 2 du sujet 1 et
les deux exercices du sujet 2 se terminent en effet sur une question de
conclusion déjà rattachée au pôle E (3ب، 4ج، 3ج), sauf 2014-m S1-E2 dont la
question 4 (تعريف الذات واللاذات) est imprimée et devient le pôle W officiel.

Valeurs reprises du corrigé : l'aspartate (`R1`, pHi = 3) migre vers le pôle
positif et le résidu neutre (`R2`, pHi = 5) reste en place ; le nombre de
tétrapeptides est **4⁴ = 256** avec répétition et **4 × 3 × 2 × 1 = 24** sans
répétition ; la question 2أ identifie la **بنية ثالثية**, `A` la liaison
disulfure et `B` la liaison ionique ; l'expérience 1 restaure la structure
native alors que l'expérience 2 (urée maintenue) donne une structure non
fonctionnelle ; dans le sujet 1 exercice 2, le milieu (أ) garde 100 % du
tritium car l'histocompatibilité CMH empêche la prolifération, le milieu (ب)
le consomme progressivement, et le sérum du sujet (س) agglutine les hématies A
→ zéros de groupe **B ou O** (anticorps Anti-A) ; dans le sujet 2, l'ARNm
(élément 6) compte **18 bases** (`5 × 3 + 3`) pour **4 unités** dans la chaîne
(5 ARNt moins la méthionine initiatrice) ; enfin le VIH se fixe par **gp120**
sur les cellules portant **CD4**, ce qui explique la chute des LT4 et le
maintien des LB, la production d'anticorps devenant faible par manque
d'interleukines.

Le catalogue maths ouvre désormais en **2014** (13 cartes-épreuve 2014-m …
2026-m, une seule carte de consultation pour 2013, plus la session
exceptionnelle 2017) et `tests/maths-2014.test.mjs` verrouille la session
(barème, inventaire mappé, liste des neuf pôles officiels, valeurs du corrigé).

## Passe 2015-m (2026-09-15)

Cinquième année encodée hors programme de rattrapage, et première dont le scan
est **image seul** : le dossier dzexams local
`M/dzexams-bac-sciences-2723927.pdf` (10 pages) porte le sujet (pp. 1-4) ET son
corrigé officiel « الإجابة النموذجية وسلم التنقيط » (pp. 5-10), mais
`scripts/dump-pdf-text.mjs` n'y trouve **1 fragment de texte par page** — aucune
couche texte ne peut donc servir de source, tout est recopié depuis l'image.

```bash
node scripts/render-pdf-pages.mjs M/dzexams-bac-sciences-2723927.pdf 1,2,3,4,5 2
node scripts/render-pdf-pages.mjs M/dzexams-bac-sciences-2723927.pdf 6,7,8,9,10 2
node scripts/report-subject-inventory.mjs 2015-m
```

Format retrouvé sur l'image : **2 sujets × 2 exercices (10 + 10)**, durée
imprimée 02 سا و30 د. Sujet 1 : البروتين (الهجرة الكهربائية لثلاث وحدات بنائية،
السلسلة الناسخة وجدول الشفرة، pHi والجذور) puis الزمر الدموية (اختبار المصل
وكريات الدم الحمراء، Ouchterlony). Sujet 2 : البروتين amphotère (منحنى
الرحلان، Rastop، الجلوتاميك 63 والأرجنين 87، سيستيين) puis التصدي لفيروس
الالتهاب الكبدي B (Ouchterlony، الثيمين المشع، LTc والبرفورين).

Onze consignes imprimées deviennent des tâches `official` ; les quatre étapes de
cadrage N restent reconstruites (aucune question de ce type n'est imprimée) et
le disent dans leur note, comme le pôle W de 2015-m S1-E2 (l'exercice n'a pas de
جزء ثالث imprimé).

Valeurs reprises du corrigé : `503 = (133 + 174 + 117 + 133) − 3 (18) = 557 − 54`
(où `3 (18)` est le nombre de molécules d'eau retirées pour former le
tétrapeptide) ; `pHi = 4.5` et la relation inverse entre pH et distance de
migration ; `AUG-GAC-GUC-AGA-GAU-UAA` → `Asp-Val-Arg-Asp` ; l'aspartate migre
vers le pôle positif et l'arginine vers le pôle négatif ; la liaison ionique
`COO− … NH3+` entre le glutamate 63 (`pHi = 3.08`) et l'arginine 87
(`pHi = 10.7`) ; la source du soufre est le cystéine (Cys) ; les zones de la
famille sont **الأب O+ ، الأم AB− ، البنت B+ ، الابن A+** ; `1 %` dans les milieux
1-3 et `90 %` dans le milieu 4 avec la double reconnaissance LTc/CMH I.

Le catalogue maths ouvrait en **2015** au moment de cette passe (12 cartes-épreuve
2015-m … 2026-m) ; il a ouvert en **2014** puis **2013** aux passes suivantes (voir
plus bas), et la filière n'a plus aucune carte en consultation.
`tests/maths-2015.test.mjs` verrouille la session
(barème, inventaire mappé, liste des 11 pôles officiels, valeurs du corrigé,
badge ⚠️).

## Passe 2016-m (2026-09-14)

Première année encodée hors du programme de rattrapage initial : son dossier
dzexams local `M/dzexams-bac-sciences-1413929.pdf` porte le sujet (pp. 1-4) ET le
corrigé officiel « عناصر الإجابة » (pp. 5-11). Les onze pages ont été relues en
image ; la couche texte du fichier est accentuée à l'envers (`عمى` pour `على`,
`خمية` pour `خلية`) et n'a servi qu'à recouper.

```bash
node scripts/render-pdf-pages.mjs M/dzexams-bac-sciences-1413929.pdf 1,2,3,4 2
node scripts/render-pdf-pages.mjs M/dzexams-bac-sciences-1413929.pdf 5,6,7,8,9,10,11 2
node scripts/report-subject-inventory.mjs 2016-m
```

Format retrouvé sur l'image : **2 sujets × 2 exercices (10 + 10)**, durée
imprimée 02 سا و30 د. Sujet 1 : تركيب البروتين (نسخ وترجمة) puis البالعة وتطور
الأجسام المضادة. Sujet 2 : من الـ ADN إلى البروتين (Anagène، الهيموغلوبين) puis
الغشاء الهيولي ونظام CMH. Douze consignes imprimées deviennent des tâches
`official` ; les quatre étapes de cadrage N restent reconstruites (aucune
question de ce type n'est imprimée) et le disent dans leur note.

Valeurs reprises du corrigé : `429 = 3 × 143` niqueotides et `141 = 1 − 142`
acides aminés (2016-m S2-E1) ; الموقع التحفيزي A فارغ مقابل رامزة التوقف UAG ;
`16.66 % = 1 × 100 ÷ 6` avec l'allèle C3 identique chez les deux parents
(2016-m S2-E2) ; الجزء الثابت والمتغير du corps anticorps ; الغشاء الهيولي
فسيفسائي ومائع ; النمط الوراثي المحتمل A2 C5 B12 / A17 C6 B34.

## Passe 2021-m (2026-09-14)

Le dossier dzexams local `M/dzexams-bac-sciences-2068087.pdf` réunit les sujets
(pp. 1-6) et le corrigé officiel « الإجابة النموذجية » (pp. 7-12) ; les douze
pages ont été relues en image.

```bash
node scripts/render-pdf-pages.mjs M/dzexams-bac-sciences-2068087.pdf 1,2,3,4,5,6 2
node scripts/render-pdf-pages.mjs M/dzexams-bac-sciences-2068087.pdf 7,8,9,10,11,12 2
node scripts/report-subject-inventory.mjs 2021-m
```

Consignes : deux verbes du sujet avaient été mal reconstitués depuis la couche
texte inversée — le scan imprime « بيّن في نص علمي دقيق » (2021-m S1-E2/W, la
version précédente portait « أنشئ »), « فسّر كيف اكتسبت إحدى السلالتين »
(S1-E2/E, et non « تكتسب ») et « مبرزا تأثر هذه العلاقة بعوامل الوسط »
(S2-E2/W, et non « وأثر هذه العلاقة »). Cinq consignes imprimées n'étaient
rattachées à aucun pôle : النمط الوراثي لولدين (S1-E1/S), اشرح آلية تأثير
المضاد الحيوي + اقترح فرضية (S1-E2/E), قدم نصيحة حول الاستعمال المفرط
(S1-E2/W), حدد في أيّ مرحلة يتدخل العنصران + اكتب معادلة تشكُّل ثنائي الببتيد
(S2-E1/S et /E), فسّر الشكل (ب) + ناقش صحة الفرضية + بَيِّن خطورة انخفاض
الـ pH (S2-E2/E). Les lettres R et T de l'exercice 2 (sujet 2) et les valeurs
7.4 / 7.3 sont dans la couche texte du sujet mais ne sont pas dessinées : elles
sont restituées et signalées dans les notes.

Réponses modèle : deux valeurs de 2021-m S1-E2/S étaient fausses — 0→10 د et
50 %/5 % au lieu de **0→40 د** et **70 % / 10 %** du corrigé — et la règle
associée (اتجاهات 50/5, `strictValues`) a suivi. Les réponses de S1-E2/E
(الموقع A، الرابطة الببتيدية، Mex.R, الثلاثية 114 : TGC → TGA = رامزة توقف,
7 أحماض أمينية بدل 9) et de S2-E2/E (رابطة شاردية His146–Asp94، 2 Å et 8 Å,
7.4 → 7.3، خطورة الـ CO) sont désormais celles du corrigé.

## Passe 2018-m (2026-09-13)

```bash
node scripts/render-pdf-pages.mjs subjects/M/2018/sujet-1.pdf 1,2,3
node scripts/render-pdf-pages.mjs subjects/M/2018/sujet-2.pdf 1,2,3
node scripts/report-subject-inventory.mjs 2018-m
node scripts/generate-official-inventories.mjs && npm run inventory:check
npm run calibration:update && npm run pwa:version && npm test
```

Format retrouvé sur l'image : **2 sujets × 2 exercices (7 + 13 / 6 + 14)**,
durée imprimée 02 سا و30 د. Le corrigé 2018 est dans le dépôt, dans le même
dossier dzexams que le sujet (`M/dzexams-bac-sciences-1967487.pdf`,
« الإجابة النموذجية » pp. 7–12) : les réponses modèle ont été réécrites depuis
ces pages (commit `d4d286e`) et non depuis le programme.

La passe 2021-m du 2026-09-14 ne change pas le total officiel (12/16) :
cinq consignes imprimées dans le sujet et qui n'étaient mappées nulle part sont
désormais recopiées dans un pôle déjà officiel (aucune consigne n'est inventée),
et sept libellés paraphrasés depuis la couche texte inversée sont recopiés mot à
mot. Le pôle N de 2021-m S1-E2 accueille la question du préambule (page 2),
recopiée mot à mot : la note du pôle dit qu'elle n'est pas numérotée.

Bilan maths 2013–2026 : **158 tâches officielles sur 224** — la filière est
complète, aucune année ne reste en consultation. L'encodage 2013 (dernier
chantier) ajoute huit consignes recopiées sur l'image, les huit autres pôles
(quatre cadrages N et quatre clôtures W, aucune question de ce type n'étant
imprimée dans ce sujet) restant reconstruits et le disant. Les encodages
précédents avaient ajouté : 2014 (neuf consignes), 2015 (onze), 2016 (douze),
2017 (seize, soit la totalité de ses pôles) et 2018 (quinze), puis les
relectures 2019 à 2026.

## Passe de cohérence (2026-09-15) : liens morts et verrous manquants

Deux trous trouvés en reprenant la branche, tous deux corrigés ici.

**1. Un lien mort dans l'inventaire généré.** Le sujet 2 de 2013 pointait vers
`https://www.dzexams.com/ar/expiree/…` (page expirée) au lieu de
`/ar/annales/…`. La source (`data/subjects.js`, `data/archive.js`) avait été
corrigée le 2026-09-15, mais `data/official-tasks.js` — fichier GÉNÉRÉ — ne
l'avait pas été régénéré : `npm run inventory:check` échouait et l'application
affichait encore le lien mort. Correction : régénération de l'inventaire.
Garde-fou ajouté : `tests/curated-links.test.mjs` scanne toutes les sources
curées (`data/**`, `index.html`, `manifest.webmanifest`) et tous les
localisateurs d'inventaire ; il refuse `/ar/expiree/`, les sections inconnues de
dzexams et exige que 2013-m/S2 reste sur la page annales. Vérifié dans les deux
sens : les quatre tests échouent sur l'inventaire non régénéré et passent après.

**2. Trois années maths sans fichier de test.** 2017-m, 2018-m et 2021-m
n'étaient couvertes que par les tests transversaux, alors que ce sont les années
les plus retravaillées (corrigé 2018 réécrit depuis les pp. 7-12, relecture 2021
du 2026-09-14). Elles ont désormais leurs verrous, sur le modèle de
`tests/maths-2016.test.mjs` :

- `tests/maths-2017.test.mjs` — 2 × (6 + 14), les **seize** pôles officiels
  (page 1-4, relecture du 2026-09-13), corrigé : (س) مستضد / (ع) جسم مضاد،
  معقد مناعي، ARNt/ARNm/حمض أميني، الموقعان A و P، مرحلة الاستطالة،
  `Met–Ala–Val–Ala–Asn–Ile–Phé–Gly` et les deux chaînes TAC…/ATG…،
  الخلية البلاسمية، les trois expériences de تراص `+++++` / `-----` ;
- `tests/maths-2018.test.mjs` — 7 + 13 / 6 + 14, quinze pôles officiels et
  l'unique étape reconstruite (S1-E1-W, dont la note dit que le corrigé EST
  dans le dépôt), corrigé : (س) الاستنساخ النواة / (ص) الترجمة، **مرحلة النهاية
  puis مرحلة الاستطالة**, (a) CD4 et (b) TCR، `GTA AAA CTA GGA AGT CAG ATT`,
  `His – Phe – Asp – Pro – Ser – Val`, l'استبدال de l'`A` رقم 362 →
  `Phe` → `Tyr` (حمض أميني 120) ;
- `tests/maths-2021.test.mjs` — 8 + 12, douze pôles officiels et quatre étapes
  reconstruites, les cinq consignes rattachées le 2026-09-14, les trois verbes
  du scan (`بيّن في نص علمي`، `اكتسبت`، `مبرزا تأثر هذه العلاقة`), les deux
  valeurs corrigées (`0 → 40 د`، `70 % / 10 %`, règle documentaire alignée) et
  le corrigé Mex.R (`الثلاثية 114 : TGC → TGA`, `رامزة التوقف UGA`,
  `7 أحماض أمينية بدل 9`).

Chaque année maths (2013-m … 2026-m) possède maintenant son fichier de test
dédié : une édition de barème, de provenance ou de réponse modèle sans mise à
jour des données fait échouer `npm test`.

## Passe d'orthographe arabe (2026-09-15)

Le point « beaucoup d'erreurs » du relevé portait aussi sur la **langue** des
données : des mots recopiés avec un `ه` au lieu du `ة`, des hamzas de coupure
manquantes ou, à l'inverse, des hamzat wasl hamzées. La correction a été faite
mot à mot, en s'appuyant sur les couches texte des sujets/corrigés locaux
(32 PDF, `/tmp/pdf-all.txt`) plutôt que sur une règle automatique.

**Ampleur** : 27 fichiers d'annales (14 maths + 13 sciences expérimentales),
635 lignes, **201 graphies fautives distinctes** (196 graphies corrigées
apparaissent). Aucune phrase n'a été réécrite : seuls des jetons ont changé.

| Famille                        | Avant → Après                                            | Exemples                                                                                                                                                                               |
| ------------------------------ | -------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ة` finale écrite `ه`          | `بنيه` → `بنية`                                          | `رامزه` (23), `ببتيديه` (12), `بنيه` (47), `وظيفه` (16), `مضاده` (45), `نواه` → `نواة`, `زمره` → `زمرة`                                                                                |
| hamzat wasl hamzée             | `إستجابة` → `استجابة`                                    | `إستنساخ`, `إستطالة`, `إرتباط`, `إكتساب`, `إنطلاق` → `انطلاق`                                                                                                                          |
| hamza de coupure manquante     | `اجسام` → `أجسام`                                        | `احماض` → `أحماض`, `إنزيم`/`انزيم` → `أنزيم` (137 formes : `الأنزيمي`, `للأنزيم`, `أنزيمات`…), `إكتساب` → `اكتساب`, `أكسجين` (29), `اشعاع` → `إشعاع`, `أكتب` → `اكتب`, `انجز` → `أنجز` |
| coquilles de recopie           | `البيبتيدية` → `الببتيدية`                               | `التماز` → `التمايز`, `التكزري` → `الكزازي`, `الغرأنزيم` → `الغرانزيم`, `البلاسمية` → `البلازمية`, `البلاسموديوم` → `البلازموديوم`, `المحسة` → `المحسسة`, `البيتيد` → `الببتيد`        |
| phrase fausse (preuve corrigé) | `بين الضمحل الييني وArg120` → `بين الحمض الأميني Arg120` | corrigé SE 2022 : « روابط بين CoEM والحمض الأميني Arg120 و Tyr333 »                                                                                                                    |

**Résidu de la même famille (2026-09-15, après la passe)** : quatre formes VII/VIII/X avaient échappé à la liste — `إستعاد`, `إكتسب`, `إرتصاص`, `إنطواء` (2014-m). Le même fichier écrit `ارتصاص` 18 fois et le corpus `استعادة` (4), `يكتسب` (6), `انطواء` (2) ; un balayage des jetons entiers opposant `إ…` et `ا…` n'en trouve plus aucun autre dans tout le corpus.

**Preuve** : pour chaque famille, le comptage des deux graphies dans la couche
texte des PDF tranche (`فرضية` 109 / `فرضيه` 0, `طفرة` 6 / `طفره` 0,
`نواة` 29 / `نواه` 0, `مورثة` 79 / `مورثه` 0, `سرعة`, `حرارة`, `مضخة`,
`كارهة`, `حلزونية`, `ثانوية`, `ذاكرة`, `رقابة`, `ناسخة`, `الثالثة`,
`الأسيتيل`, `وذمة`, `بلعمة`…). Les composés sont traités comme des jetons
entiers, jamais en sous-chaîne : `ارض` n'est pas corrigé dans « العارضة » et
`كره` pas dans « سكره ».

**Régression attrapée pendant la passe** : remplacer une sous-chaîne a abîmé
des possessifs (`لتترجمه` → `لتترجمةا`, `رامزها` → `رامزةا`, `تركيزهما`,
`تسلسلها`, `تبلعمها`, `تشفرها`, `محاليل` → `محأليل`, `اللامينين` →
`اللأمينين`). Les treize occurrences ont été restaurées, et l'invariant du
corpus « le `ة` est toujours en finale de jeton » est vérifié à la fois sur
`HEAD` (0 cas) et après la passe (0 cas).

**Le cas `ى` / `ي` (2026-09-15)** : les candidats relevés dans les mots-clés
ne sont pas des coquilles — `الهيولى` est le nom (هيولى, cytoplasmique au
sens de « matière ») et `الهيولي` l'adjectif (غشاء هيولي, شبكة هيولية) ;
`تتالي`, `يحتوي`, `قوي`, `تعطي`, `بنى`, `غنى`, `السفلى`, `تنتقي` sont des
formes correctes. Aucun n'a été changé ; en revanche les mots-clés restent
écrits en `ي` (forme normalisée par `normalizeArabic`, qui mappe `ى → ي`)
et le verrou de `tests/arabic-orthography.test.mjs` refuse le `ى` final.

**Ce qui n'a volontairement PAS été changé** : `انسب`/`أنسب` (les deux
impératifs sont attestés, y compris dans les corrigés), `استراديول` /
`أستراديول` et `انزيم` / `إنزيم` d'autres fichiers, les possessifs légitimes
(`سكره` = son sucre, `مصله` = son sérum, `نقله` = son transfert, `مرافقه` =
son cofacteur, `عضويته`, `خلله`), `مورثات متعددة الصنويات` — **confirmé par le
corrigé** et non une coquille —, `الفينغومييلين` (transcription attestée),
les **mots-clés gardent la forme ي** (`منحني` et non `منحنى`) car
`normalizeArabic` mappe ى→ي et `tests/data-selfcheck.test.mjs` l'impose ;
seule l'attente documentaire 2022-m « عظمى » a suivi la formulation du
corrigé (« قيمة عظمى في اليوم 15 »). Et les 2013-2015 dont le corrigé est
sans couche texte : aucun mot n'y a été « corrigé » sans lecture d'image.
Les couples ى/ي en prose ont été revus le 2026-09-15 et **laissés tels quels**
quand les deux formes vivent côte à côte sans être fautives : `الهيولى` (le
hyaloplasme, nom) contre `الغشاء الهيولي` / `الشبكة الهيولية` (adjectifs), et
`تتالي`, `يحتوي`, `قوي`, `تعطي`, `بنى`, `غنى`, `السفلى`, `تنتقي` (formes en ي
correctes). Dans les `keywords`, la forme ي est obligatoire —
`tests/data-selfcheck.test.mjs` l'impose puisque `normalizeArabic` mappe ى→ي.

**Seconde passe du 2026-09-15** (même jour, après la première) : onze jetons
corrigés dans neuf payloads, tous vérifiables dans le dépôt.

| Famille          | Correction                                                  | Détail                                                                                                                     |
| ---------------- | ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| translittération | `بلاسموسيت` → `بلازموسيت`                                   | 12 occurrences (SE-2016 ×11, SE-2019 ×1) ; la liste ne bannissait que `البلاسموسيت`, la forme sans article passait         |
| translittération | `بلاسمية` → `بلازمية`                                       | 5 (2014-m ×2, 2017-m ×3) — même famille, déjà documentée pour `البلاسمية`                                                  |
| translittération | `بالمسموتسيت` → `بلازموسيت`, `بالمسموتسيات` → `بلازموسيتات` | 2017-m (3) : deux corruptions du même terme dans la même réponse modèle                                                    |
| translittération | `برفورين` / `بروفيرين` → `بيرفورين`                         | 19 (2014-m 1, 2015-m 6, 2019-m 8, 2023-m 4) ; `البيرفورين` est la graphie du sujet **officiel** 2023 (`official-tasks.js`) |
| mot-clé          | `تيموسيه` → `تيموسية`                                       | 2017-m : la forme en ة vit 5 fois dans le corpus (2017-m, 2024-m)                                                          |
| mot-clé          | `لالذات` → `لاذات`                                          | 2016-m : double ل ; `لاذات` 118 fois dans le corpus                                                                        |
| mot-clé          | `ليمفاوية` → `لمفاوية`                                      | 2016-m : seule occurrence en ي contre 115 en `لمفاوية`                                                                     |
| mot-clé          | `بيت` → `وريقية`                                            | 2018-m : mot-clé sans correspondance dans la réponse modèle (« بنية وريقية β »)                                            |

**Recopies du corrigé 2014-m relues en image** (`M/dzexams-bac-sciences-2369148.pdf`,
« الإجابة النموذجية » p. 7, rendu par `scripts/render-pdf-pages.mjs`) : le libellé
du document 1 est « 1 — طبقة فوسفودهنية مضاعفة ، 2 — بروتين سطحي داخلي … ». La
recopie portait `فوسفوهيدنية مضافة` (deux slips), `غليكو بروتين` au lieu de
`غليكوبروتينية` et `تحضى` au lieu de `تحظى` (2). Quatre jetons corrigés dans
2014-m, avec l'image comme preuve ; le reste de la page (الوسط أ/ب، الرسم، زمرة
(س)، الذات/اللاذات) correspond mot pour mot à ce qui était encodé.

**Troisième passe du 2026-09-15 (2013-m, 2017-m, 2018-m, SE-2023, SE-2025)** :
sept lignes de plus. Les trois premières sont tranchées sur l'image du corrigé 2013
(`M/dzexams-bac-sciences-2770867.pdf`, « الإجابة النموذجية » pp. 4 et 3 du
dossier, rendues par `scripts/render-pdf-pages.mjs`) ; les suivantes sur le
reste du corpus et le vocabulaire des scans.

| Famille            | Correction                                                                       | Détail                                                                                                                                                                                                                                                                                                         |
| ------------------ | -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| translittération   | `لازمية` → `بلازمية`, `اللازمية` → `البلازمية`                                   | 20 (2013-m) ; le corrigé p. 4 écrit « خلية بلازمية LBP » et le schéma p. 3 « بلازمية »                                                                                                                                                                                                                         |
| coquille           | `تماز` → `تمايز`, `وتمازت` → `وتمايزت`                                           | 6 (2013-m) ; corrigé p. 4 « مصدر الخلية البلازمية (الشكل ب) : تمايز الخلية اللمفاوية LB المنتقاة »                                                                                                                                                                                                             |
| coquille           | `تشطيم` → `التنشيط` (1) et `تنشيط` (1)                                           | 2013-m ; schéma p. 3 « التنشيط : التكاثر و التمايز »                                                                                                                                                                                                                                                           |
| coquille           | `السيسيتين` → `السيستينين`                                                       | 2018-m : deux cystéines du pont disulfure ; le corpus écrit `السيستين` (2014-m) et les scans `السيستيني`                                                                                                                                                                                                       |
| slug reconstruit   | `النطبيعي` → `النمط الطبيعي`                                                     | SE-2025 : le placeholder fusionnait `النمط` et `الطبيعي` (la réponse modèle disait déjà `النمط الطبيعي`)                                                                                                                                                                                                       |
| mot-clé mort       | `بلاسم` → `بلازم` (2017-m), `زمري` → `زمر` (SE-2025)                             | radicaux restés sur les anciennes graphies : la réponse modèle écrit `بلازموسيتات`, et le pôle voisin de SE-2025 utilise déjà `الزمر`                                                                                                                                                                          |
| contresens         | `المبالغ العصبية` → `المبلغات العصبية`                                           | SE-2023 : « المبالغ » (les montants) n'a aucun sens ; la même session écrit `مستقبل غشائي للمبلغ العصبي` (L. 61) et 2026-m `المبلغات الكيميائية`                                                                                                                                                               |
| hamzat wasl        | `إستعاد` → `استعاد`, `إكتسب` → `اكتسب`, `إرتصاص` → `ارتصاص`, `إنطواء` → `انطواء` | 2014-m : formes VII/VIII/X hamzées ; le même fichier écrit `ارتصاص` (18 fois) et le corpus `استعادة`, `يكتسب`, `انطواء`                                                                                                                                                                                        |
| slug reconstruit   | `مستقل زمرته` → `مستقبل زمرته`                                                   | SE-2025 : le résumé du pôle N disait « مستقل » (indépendant) là où l'énoncé officiel du même pôle (page 9) écrit `مستقبل`                                                                                                                                                                                      |
| translittération   | `الأراكيدونيك` → `الأراشيدونيك`                                                  | SE-2020 : le sujet officiel imprime `حمض أراشيدونيك` (page 2, relue en image : diagramme + question) — la forme française `-k-` n'existe dans aucun scan                                                                                                                                                       |
| mot-clé mort       | `تركيض` → `ارتباط` (SE-2022)                                                     | jeton inexistant (0 occurrence dans le corpus des scans, 0 dans la réponse modèle) ; le corrigé officiel dit `يمنع 3-NOP ارتباط CoEM بالأنزيم`                                                                                                                                                                 |
| coquille           | `للرفاق الأنزيمي` → `المرافق الأنزيمي` (SE-2022)                                 | le corrigé officiel écrit `الموقع الخاص بتثبيت المرافق الأنزيمي` ; le même pôle porte déjà `المرافق` trois fois                                                                                                                                                                                                |
| graphie du sujet   | mot-clé `جينتاميسين` → groupe `["جينتامسين", "جينتاميسين"]`                      | le sujet SE-2022 imprime `الجينتامسين` (س) et son corrigé `الجينتاميسين` : sans le groupe, l'élève qui lit le sujet n'était jamais crédité                                                                                                                                                                     |
| graphie harmonisée | `بالنيوكليوتيد` → `بالنيكليوتيد` (2017-m, réponse modèle)                        | trois graphies vivent dans les scans — `نيكليوتيد` (49), `نكليوتيدة` (21), `نيوكليوتيد` wāw (10) ; le payload employait la 3ᵉ une fois contre huit fois la 1ʳᵉ dans le même fichier. Le corrigé 2017 imprime `النكليوتيدة` et le sujet 2017-m cite `نكليوتيدات` : ces citations officielles restent inchangées |

Les lignes « hamzat wasl » (2014-m) et « slug reconstruit » (SE-2025) ont été tranchées par règle orthographique et cohérence interne — formes VII/VIII/X jamais hamzées, `مستقبل` écrit juste à côté dans l'énoncé officiel — sans relecture d'image ; la ligne « contresens » (SE-2023) l'a été par cohérence interne. Les cinq lignes ajoutées ensuite (2026-09-15, après la recopie SE-2021) s'appuient, elles, sur l'image du sujet (`حمض أراشيدونيك`, SE-2020 p. 2), sur le corpus des scans (`تركيض` : 0 occurrence ; `المرافق الأنزيمي`) ou sur la couche texte du sujet local (`الجينتامسين` SE-2022, `البكتريا` 2021-m)

Le même schéma porte une case jaune « التشيط + » : cette graphie officielle est
celle du corpus, elle n'a pas été touchée. Le verrou gagne huit formes
(`اللازمية`, `تماز`, `تمازت`, `تشطيم`, `سيسيتين`, `النطبيعي`, `بلاسم`,
`زمري`) et un cinquième
test compare le **jeton entier** `لازمية` — il ne peut pas entrer dans la liste des préfixes, où le
préfixe `ب` l'aurait rendu égal à la forme correcte `بلازمية`.

**Verrou** : `tests/arabic-orthography.test.mjs` (10 tests) refuse les 165
graphies fautives (`أراكيدونيك`, `تركيض`, `للرفاق`, `نيوكليوتيد` en plus) (comparaison par jeton, préfixes
`و ف ب ك ل ال وال فال بال كال لل` retirés avant comparaison : `والتماز`
échappait à la liste où figure `التماز` — corrigé le 2026-09-15 en
`والتمايز` — et `اللأمينين` à celle où figure `لأمينين` ; injections vérifiées
dans les deux sens, y compris après la seconde passe), exige que le `ة`
reste final,
contrôle vingt-cinq formes corrigées (`اراشيدونيك` en plus) et les phrases-témoins (2017 `الخلية البلازمية`,
2018 `الأناتوكسين الكزازي`, SE 2022 `اللامينين`, 2015 `محاليل`). Vérifié dans
les deux sens : réintroduire `إنزيم` fait échouer le premier test, injecter
`ترجمةا` fait échouer le second ; les quatre repassent sans la réintroduction.
Les quatre tests `maths-2016/2017/2021` qui figeaient d'anciennes graphies ont
été alignés (`أنزيم ARN بوليميراز`, `الخلية البلازمية`, `قليلة`). Deux verrous ciblent les corrections de cette passe : `مستقل زمرته` (SE-2025, test 7) et la phrase `المبالغ العصبية` (SE-2023, test 3). Un dixième test verrouille la famille `نيوكليوتيد` (wāw) sur tout le corpus (nos rédactions disent `نيكليوتيد` ; les citations officielles `نكليوتيدة`/`نكليوتيدات` sont laissées telles quelles). Un neuvième test vérifie la **graphie lue par l'élève** : `حمض أراشيدونيك` (SE-2020), `الجينتامسين` (SE-2022, groupe d'alias avec `الجينتاميسين`) et `البكتريا` (2021-m, groupe avec `بكتيريا`) doivent tous être attrapés par leur mot-clé ; casser un groupe d'alias le fait échouer (injection vérifiée).

## Reste à faire (assumé)

1. **Plus aucune consigne « non mappée »** dans les notes de payload : les
   neuf consignes recensées le 2026-09-13 ont été rattachées — cinq pour 2021-m
   (النمط الوراثي لولدين → S1-E1/S ; اشرح آلية التأثير + اقترح فرضية →
   S1-E2/E ; قدم نصيحة → S1-E2/W ; مرحلة التدخل + المعادلة → S2-E1/S et /E ;
   فسّر الشكل (ب) + ناقش الفرضية + خطورة الـ pH → S2-E2/E), trois pour 2022-m
   (المعادلة الكيميائية → S1-E1/E ; رتّب المراحل → S2-E1/S ; analyse du
   tableau 1 → S2-E2/S) et deux pour 2026-m (برّر تثبيط PCSK9 → S1-E2/E ;
   قدّم نصيحة → S2-E2/E). La relecture montre aussi pourquoi elles n'avaient pas
   de pôle : ce sont des **questions d'un même exercice** que la carte BAC
   regroupe volontairement dans une seule étape.

2. **Recouvrement 2022-m S2-E1-Q2** : la question « رتّب المراحل » a été relue
   sur l'image (page 4) et son corrigé donne **ج ← أ ← ب** ; la réponse modèle et
   les mots-clés (`ثانوي`, `LB`) ont été alignés. Le 0 % du probe venait de la
   réponse précédente, qui classait (س) en « أولي ».
3. **Toutes les années maths 2013–2026 sont encodées** (2013-m … 2026-m) :
   la filière ne compte plus aucune année en consultation externe, il ne reste
   que la carte de la session exceptionnelle 2017. Deux scans ont une police
   incomplète : 2019 (quelques séries de mots non dessinées) et 2018 (le nom du
   virus dans « فيروس الـ ( ) » n'est pas dessiné). Ils sont signalés dans
   `bacPromptNotes` et jamais complétés au hasard (la couche texte, lue par
   `scripts/dump-pdf-text.mjs`, tranche les cas lisibles par fragments) ; 2013,
   2014 et 2015 sont image seul (1 fragment de texte par page) et ont donc été
   entièrement relus sur l'image.

3ter. **Formes minoritaires examinées puis conservées, avec preuve** (2026-09-15) :

- `متحسسة` / `متموضعة` (2016-m) : le corpus des scans donne 9 `محسسة` pour
  1 `متحسسة`, ce qui en faisait un signal. La couche texte du corrigé local
  `M/dzexams-bac-sciences-1413929.pdf` tranche : « تحفيز باقي الخلايا
  اللمفاوية **المتحسسة** », « بين أحماض أمينية معينة **متموضعة** في أماكن
  محددة » et « في السلسلة **المتموضعة** في الموقع المحفز ». Nos réponses
  modèle sont ces citations : **rien changé**, et un test les verrouille
  (`tests/maths-2016.test.mjs`).
- `بكتريا` (2014-m, 3 occurrences) : les deux graphies vivent dans les sujets
  officiels (`بكتريا` 15 / `بكتيريا` 31 dans les scans ; le sujet 2021-m
  imprime `البكتريا`) : **rien changé**.
- `دوره` / `دورها` (11 occurrences) : ce sont des possessifs (« son rôle »),
  pas des coquilles de `دورة` — tranché sans image, par grammaire, et déjà
  couvert par la liste des possessifs vérifiés.

3bis. **Mots-clés qui ne vivent pas dans leur propre réponse modèle** : un
balayage du 2026-09-15 (1890 mots-clés sur 536 pôles, `matchConcept` de la
réponse modèle vers chaque mot-clé) en laisse **164**, presque tous des
approximations assumées — un mot-clé de cadrage (`الأنواع`, `أكسجين`,
`وظيفة`) que la réponse modèle n'emploie pas littéralement. Le balayage ne
garde un signal que croisé avec une variante quasi identique dans la réponse
(2 cas, tous deux légitimes : `وظيفة`/`وظيفي`, `بكتيريا`/`بكتيرية`) et avec le
corpus des scans (`تركيض` : 0 occurrence), ce qui a donné la correction
SE-2022. Les 164 restants sont documentés ici, pas « corrigés » : les réécrire
sans preuve serait inventer.

4. Corrections officielles maths : **toutes les années encodées ont leur corrigé
   relu**. Le corrigé est dans le même dossier dzexams que le sujet : 2015
   (`-2723927.pdf`, « الإجابة النموذجية وسلم التنقيط » pp. 5–10, relu le
   2026-09-15, scan image seul), 2016
   (`-1413929.pdf`, عناصر الإجابة pp. 5–11, relu le 2026-09-14), 2017
   (`-2275712.pdf`, pp. 5–9), 2018 (`-1967487.pdf`, pp. 7–12), 2019
   (`-2280992.pdf`, pp. 6–10, relu le 2026-09-14), 2020
   (`-2273619.pdf`, pp. 6–10), 2021 (`-2068087.pdf`, pp. 7–12, relu le
   2026-09-14) et 2022 (`-1777391.pdf`, pp. 7–13, relu le 2026-09-14).
   2023, 2024, 2025 et 2026 disposent du corrigé eddirasa (2026 et 2023–2025
   revérifiés le 2026-09-14, chiffres relus sur les figures des scans locaux car
   l'OCR inverse les nombres), 2014 (`-2369148.pdf`, « الإجابة النموذجية »
   pp. 5–11, relu le 2026-09-15, scan image seul) et 2013 (`-2770867.pdf`,
   « الإجابة النموذجية » pp. 5–11, relu le 2026-09-15, scan image seul).
   **Chaque année encodée a donc son corrigé relu** : il n'existe plus de
   réponse modèle rédigée depuis le seul programme.
5. Cohérence mots-clés / réponses modèle : **traité le 2026-09-14**, étendu le
   2026-09-15 aux 16 pôles de 2015-m, puis aux 16 pôles de 2014-m et enfin aux
   16 pôles de 2013-m. Sonde
   `evaluateText(réponse modèle, règle)` sur les 224 pôles maths (les 14
   sessions maths × 16 pôles ; `tests/maths-model-answers.test.mjs` les
   parcourt tous) :
   `hits >= req` partout (0 échec). Quatre règles ne pouvaient pas être
   satisfaites par la réponse modèle officielle et ont été ajustées
   (2017-m S2E2W, 2018-m S2E2E, 2018-m S2E2W, 2020-m S1E1W) ; deux réponses
   modèle de 2018-m ont gagné les termes exacts du corrigé (الرامزة، المورثة،
   ARNm). La seconde passe du 2026-09-15 a ajouté quatre mots-clés que la
   réponse modèle du même pôle ne pouvait pas satisfaire (`لالذات`, `ليمفاوية`,
   `بيت`, `بروفيرين`) et deux formes fautives (`تيموسيه`, `فوسفوهيدنيه`) : le
   contrôle `tests/maths-model-answers.test.mjs` reste vert après correction.
   Le contrôle est verrouillé par `tests/maths-model-answers.test.mjs`.
6. Traçabilité dans `pdfNote` : les notes de 2013-m, 2014-m et 2015-m disent
   désormais « relecture image du 2026-09-15 », celle de 2016-m
   « relecture image du 2026-09-14 » et celle de 2020-m « relecture image du
   2026-09-13, date du commit d'encodage e068e80 » — même convention que
   2017-m, 2018-m et 2019-m (« relecture 2026-09-13 ») et que 2021-m / 2022-m
   (« relus page à page le 2026-09-14 »). La date d'encodage est vérifiable dans
   l'historique (`git show -s e068e80`) ; aucune note n'affirme une relecture
   qui n'a pas eu lieu.

## Notes d'entretien

- **Trois avertissements de pagination restent** dans `npm run inventory:generate` :
  `2023/S2 (7)`, `2026/S1 (9)` (filière SE) et `2024-m/S2 (5)`. Cause vérifiée le
  2026-09-15 : ces `bacPromptPage` sont numérotés dans le dossier dzexams alors
  que le fichier local est un extrait eddirasa dont la pagination imprimée diffère
  (`subjects/M/2024/sujet-2.pdf` : 3 pages ; `subjects/SE/2023/sujet-2.pdf` :
  pieds de page « صفحة 6, 7, 8, 9 puis 11 من 11 » — **l'extrait saute la page 10**),
  donc la correspondance n'est pas un simple décalage constant : un extrait n'est
  pas nécessairement un intervalle contigu. Le générateur refuse d'inventer (`computePageOffset`
  renvoie `null`). Conséquence mesurée dans `js/ui/screens/simulation.js` :
  `taskPageHTML` affiche alors `الصفحة N (الأصل)` — la page du document, sans
  page locale — et `openSubjectPdf` ouvre le PDF sans ancre de page. Aucune page
  fausse n'est donc montrée ; c'est seulement une page locale en moins. À
  reprendre si l'on veut une table de correspondance vérifiée page à page pour
  ces trois sujets (`2023/S2`, `2026/S1` côté SE, `2024-m/S2`).

## Vérifications

```bash
node scripts/render-pdf-pages.mjs subjects/M/2024/sujet-1.pdf 1
node scripts/report-subject-inventory.mjs 2024-m
node scripts/generate-official-inventories.mjs && npm run inventory:check
npm run pwa:version && npm test
```
