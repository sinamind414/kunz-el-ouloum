# Checklist de relecture — BAC SE 2020 (scan local, image par image)

**Date :** 2026-09-23 (première passe : copie depuis l'image ; seconde passe :
confrontation ligne à ligne sur crops zoomés ×1,5, même jour).
**Sources :** scans locaux `subjects/SE/2020/sujet-1.pdf` (4 pages = livret 1-4)
et `subjects/SE/2020/sujet-2.pdf` (5 pages = livret 5-9), rendus à 170 dpi via
pypdfium2 dans `rendered/` (gitignoré, aucun PNG commité).
**Méthode :** la couche texte logique reconstruite a servi de brouillon de
repérage uniquement ; chaque chiffre, nom propre et consigne ci-dessous est lu
sur l'image. Les barèmes imprimés sont relevés même quand ils confirment
l'encodage actuel (Phase 2). Aucun fichier de `data/years/` touché (Phase 1).

Mode d'emploi : une ligne `official` n'est proposée que si le `bacPrompt`
est recopié mot à mot depuis l'image, diacritiques imprimés inclus
(شدّة, ضمّة, همزة, تنوين). Le reste reste `reconstructed`.
Aucun corrigé local : les réponses modèles restent des aides.

---

## Pages vues

| Page livret | Page PDF local | Contenu vu | Pôles certifiables |
| --- | --- | --- | --- |
| 1 / 9 | sujet-1 p.1 | Sujet 1, Ex1 (sismique, tableau 1-10) + amorce Ex2 (Cox, énoncé + الجزء الأول) | S1-E1 S, S1-E1 E |
| 2 / 9 | sujet-1 p.2 | Sujet 1, Ex2 doc1 (Pg1/Pg2, CI50) + doc2 (site actif, courbe سلكوكزيب) | S1-E2 S, S1-E2 E, S1-E2 W |
| 3 / 9 | sujet-1 p.3 | Sujet 1, Ex3 énoncé (question فكيف) + الجزء الأول (Her2) | S1-E3 N, S1-E3 S |
| 4 / 9 | sujet-1 p.4 | Sujet 1, Ex3 الجزء الثاني (Trastuzumab) + الجزء الثالث (نص علمي) | S1-E3 E, S1-E3 W |
| 5 / 9 | sujet-2 p.1 | Sujet 2, Ex1 (sélection lymphocytaire, cellules س/ع) + amorce Ex2 (énoncé ريسين) | S2-E1 S, S2-E1 E |
| 6 / 9 | sujet-2 p.2 | Sujet 2, Ex2 doc1 (barres, schéma) + intro الجزء الثاني (milieux) | S2-E2 S |
| 7 / 9 | sujet-2 p.3 | Sujet 2, Ex2 doc2 (courbes) + doc3 (ribosome, ARNr 28s) | S2-E2 E, S2-E2 W |
| 8 / 9 | sujet-2 p.3 | Sujet 2, Ex3 énoncé + الجزء الأول (synapse GABA, jour 1 / 60 jours) | S2-E3 S |
| 9 / 9 | sujet-2 p.5 | Sujet 2, Ex3 الجزء الثاني + الجزء الثالث (NKCC1/KCC2, نص علمي) | S2-E3 E, S2-E3 W |

Pages **non vues** : aucune — les neuf pages du livret officiel ont été lues
sur image, deux fois. En-tête relevé p.1 : المدة 04 سا 30 د, دورة 2020,
الشعبة علوم تجريبية. Corrigé officiel non relu (aucun corrigé local).

---

## Sujet 1 — Exercice 1 (05 pts) : sismique / بنية الكرة الأرضية — page 1

Support imprimé : schéma de coupe (بحر، رواسب، LVZ, A, B, C, données 1-10)
+ tableau (أسماء البيانات 1-10 ؛ الحالة الفيزيائية pour 3, 6, 7, 8, 9, 10 :
صلب، لدن، سائل ؛ الصخر الاندساسي المميز pour 1, 2, 4 ؛ اسم الانقطاع A, B, C).

| Pôle | Source | Consigne encodée |
| --- | --- | --- |
| N (1pt) | reconstructed | cadrage pédagogique (l'énoncé annonce les données, sans question) |
| S (1pt) | **official** p.1 | 1. أنقل الجدول على ورقة إجابتك ثم املأ الخانات وفق التّعليمات المطلوبة. |
| E (2pt) | **official** p.1 | 2. بيّن في نصّ علمي كيف تمّ استغلال المعطيات الزلزالية لمعرفة البنية الداخلية للكرة الأرضية ممّا سبق ومعلوماتك. |
| W (1pt) | reconstructed | clôture pédagogique (incluse dans le نص علمي, pôle E) |

## Sujet 1 — Exercice 2 (07 pts) : Cox / إيبوبروفان — pages 1 et 2

Doc1 p.2 : schéma حمض أراشيدونيك → Pg1 (Cox-1, مخاط المعدة) / Pg2 (Cox-2,
حمى وألم) + جدول CI50 : Cox-1 ← 9 ميكرو مول/ل, Cox-2 ← 10 ميكرو مول/ل.
Doc2 p.2 : 4 schémas de site actif (أرجينين 120، فالين 523، إيزولوسين 523،
جيب كاره للماء، روابط انتقالية) + courbe النشاط الأنزيمي (Cox-2 chute rapide,
Cox-1 chute lente, abscisse 1-9 ميكرو مول/ل).

| Pôle | Source | Consigne encodée |
| --- | --- | --- |
| N (1pt) | reconstructed | cadrage pédagogique (énoncé + présentation du الجزء الأول, sans question) |
| S (2,5pt) | **official** p.2 | 1. حلّل مخطط الشكل (أ) من الوثيقة (1). 2. وضّح دور دواء إيبوبروفان مبرزا أعراضه الجانبية باستغلالك لمعطيات الوثيقة (1). |
| E (2,5pt) | **official** p.2 | 1. انطلاقا من الشكل (أ) من الوثيقة (2) علّل : - تأثير الأنزيمين (Cox-1) و(Cox-2) على نفس الركيزة. - تأثير إيبوبروفان على نفس الأنزيمين. 2. فسّر منحنى الشكل (ب) من الوثيقة (2). |
| W (1pt) | **official** p.2 | 3. اقترح حلا يُبيّن كيفية تخفيف الأعراض الجانبية للأدوية التي تستهدف النشاط الأنزيمي. |

Regroupements notés (compromis, pas des questions inventées) : pôle S = les
2 consignes du الجزء الأول ; pôle E = علّل (2 tirets) + فسّر المنحنى du
الجزء الثاني. Les 5 consignes imprimées sont couvertes, aucune `خلاصة`.

## Sujet 1 — Exercice 3 (08 pts) : Her2 / تراستوزوماب — pages 3 et 4

Doc1 p.3 : courbes Her2 (A haute, B basse) + barres 7 jours (B ≈ 2, A ≈ 6
بالمليون). Doc2 p.4 : tableau 5 milieux (600 / 200 / 50 / 20 / 20 بالمليون ;
Trastuzumab à 2 et 20 ملغ/مل) + schéma fixation Her2 + courbe (pic ≈ 45,
المعالجة بـ Trastuzumab puis بإضافة البالعات).

| Pôle | Source | Consigne encodée |
| --- | --- | --- |
| N (0,5pt) | **official** p.3 | فكيف تتدخل الأجسام المضادة في القضاء على هذا النوع من السرطان؟ |
| S (2pt) | **official** p.3 | 1- استخرج علاقة بروتين (Her 2) بتطور الخلايا السرطانية للثدي. 2- اقترح فرضية تُبيّن طريقة علاجية للحد من تكاثر خلايا سرطان الثدي. |
| E (4pt) | **official** p.4 | 1- حلّل النتائج الموضّحة في الجدول (أ) من الوثيقة (2). 2- فسّر آلية تأثير جزيئة (Trastuzumab) على الخلايا السرطانية باستغلالك لمعطيات الشكلين (ب) و(ج) من الوثيقة (2) مُعلّلا صحة الفرضية المقترحة. 3- قدّم مقترحا حول إمكانية استغلال نتائج هذه الدراسة في الكشف المبكّر عن سرطان الثدي. |
| W (1,5pt) | **official** p.4 | بيّن من خلال ما سبق ومعلوماتك في نص علمي كيف تتدخل الأجسام المضادة في القضاء على الأجسام الغريبة عموما وخلايا سرطان الثدي على وجه الخصوص. |

Regroupements notés : pôle S = les 2 consignes du الجزء الأول ; pôle E = les
3 consignes du الجزء الثاني ; pôle W = le نص علمي du الجزء الثالث seul.
L'énoncé porte une vraie question → pôle N `official`. Noter l'orthographe
imprimée : « نص علمي » (sans شدّة) ici, contre « نصّ علمي » à l'exercice 1.

## Sujet 2 — Exercice 1 (05 pts) : sélection lymphocytaire — page 5

Support imprimé : schéma d'une cellule, الخلية (س) / الخلية (ع), النمط (أ) /
النمط (ب), éléments numérotés 1-6, نواة.

| Pôle | Source | Consigne encodée |
| --- | --- | --- |
| N (1pt) | reconstructed | cadrage pédagogique (l'énoncé annonce les deux نمط, sans question) |
| S (1pt) | **official** p.5 | 1. سمّ العناصر المرقمة من 01 إلى 06، ثم تعرف على الخليتين (س) و(ع) ونمطي الاستجابة (أ) و (ب). |
| E (2pt) | **official** p.5 | 2. اكتب نصا علميا تبيّن فيه دور ومصدر المستضد في انتقاء اللمفاويات وتحديد نمط الاستجابة المناعية النوعية انطلاقا من معطيات الوثيقة ومكتسباتك. |
| W (1pt) | reconstructed | clôture pédagogique (incluse dans le نص علمي, pôle E) |

Noter : « تعرف » imprimé sans شدّة, « نصا علميا » sans تنوين visible,
« اللمفاويات » (question 2) contre « للمفاويات » (énoncé, préposition).

## Sujet 2 — Exercice 2 (07 pts) : ريسين / تركيب البروتين — pages 5, 6 et 7

Doc1 p.6 : barres 0/1/5/10 ميكروغرام/مل (لوسين مشع / تايمدين مشع) + schéma
(10 ميكروغرام/مل). Doc2 p.7 : droite 100 % (0-10) + courbes 0-4,5 و.ط.
(0-30 د). Doc3 p.7 : ARNm 5'…3' GCCGGUAGUCGAAUC ×3, ريبوزوم وظيفي / غير
وظيفي, ARNr 28s, متعدد بيبتيد.

| Pôle | Source | Consigne encodée |
| --- | --- | --- |
| N (1pt) | reconstructed | cadrage pédagogique (énoncé + ملاحظة UUU, sans question) |
| S (2,5pt) | **official** p.6 | . حلّل الوثيقة (1) مبرزا العلاقة بين تكاثر الخلايا السرطانية المبينة في الشكل (أ) والظواهر الحيوية الموضّحة في الشكل (ب). |
| E (2,5pt) | **official** p.7 | . حلّل منحنيات الشكلين (أ) و (ب) مبرزا المشكلة حول تأثير مادة الريسين على تركيب البروتين. |
| W (1pt) | **official** p.7 | . أعط حلا للمشكلة المطروحة انطلاقا من استغلالك لمعطيات الوثيقة (3). |

Une consigne par pôle, aucun regroupement. La puce imprimée « . » est
conservée telle quelle. « المبينة » sans شدّة, « الموضّحة » avec شدّة.

## Sujet 2 — Exercice 3 (08 pts) : synapse inhibitrice / GABA — pages 8 et 9

Doc1 p.8 : schémas بعد يوم (01) / بعد 60 يوما (GABA, مستقبلات, Cl⁻) + courbes
التيار الأيوني + الكمون الغشائي (-40 / -60 / -80 mV). Doc2 p.9 : schémas
NKCC1 (jour 1) / KCC2 (jour 60) + barres Cl⁻ (الولادة ≈ 2, اليوم 15 ≈ 3,
اليوم 40 ≈ 1, اليوم 60 ≈ 1, وثت) + courbes ARNm (pic NKCC1 ≈ 2 vers j10,
plateau KCC2 à 1).

| Pôle | Source | Consigne encodée |
| --- | --- | --- |
| N (0,5pt) | reconstructed | cadrage pédagogique (« لمعرفة كيف يتمّ ذلك » annonce, sans question) |
| S (2pt) | **official** p.8 | 1- حلّل معطيات الوثيقة (1) مُحدّدا المشكلة العلمية المطروحة. 2- اقترح فرضية لحل هذه المشكلة. |
| E (4pt) | **official** p.9 | 1- استخرج أهم مميزات البروتينات الغشائية الممثلة في الشكل (أ) من الوثيقة (2). 2- تأكد من صحة الفرضية المقترحة باستغلالك لمعطيات الوثيقة (2). 3- قدّم حلا مَبْنِيًّا على أُسُس علمية لعلاج أشخاص بالغين يعانون من اضطرابات عصبية ناتجة عن تراكم شوارد الـ (Cl⁻) في هيولى الخلية بعد مشبكية. |
| W (1,5pt) | **official** p.9 | لخّص في نص علمي دقيق آلية عمل المشبك المثبط عند شخص سليم بالغ مبرزا دور مختلف البروتينات الغشائية في ذلك باستغلالك لنتائج الدراسة السابقة ومكتسباتك. |

Regroupements notés : pôle S = les 2 consignes du الجزء الأول ; pôle E = les
3 consignes du الجزء الثاني ; pôle W = le نص علمي du الجزء الثالث seul
(même découpe que S1-E3). « مَبْنِيًّا » porte un تنوين imprimé, « أُسُس »
une ضمّة. Ordre imprimé : « شخص سليم بالغ ».

---

## Barèmes imprimés relevés (Phase 2)

Sujet 1 : Ex1 = 05, Ex2 = 07, Ex3 = 08. Sujet 2 : Ex1 = 05, Ex2 = 07,
Ex3 = 08. Tous lus sur l'image (titres d'exercices). Ils confirment les
`max` actuels de `data/years/se/year-2020.js` (5/7/8) : aucune correction
de total à prévoir en Phase 2 pour 2020.

## Pièges de couche texte constatés (pour les encodeurs Phase 3)

La couche reconstruite est logiquement juste mais ne doit servir ni aux
chiffres ni aux noms : tableau CI50 (9 / 10) illisible dans la couche,
« إيبوبروفان » lu « إيبويروفان » p.1, « نُقترح » lu « تقترح », valeurs des
barres/courbes (doc2 S2-E3 : وثت 2/3/1/1) absentes ou brouillées, « تعرف »
sans شدّة contre « تُبيّن/يُبيّن » vocalisés. Toujours relire l'image.

## Divergences vs encodage actuel (à traiter en Phase 3, données intactes)

Relevé du 2026-09-23 sur `data/years/se/year-2020.js` (lecture seule) :
préfixes `خلاصة` présents (S2-E2 : « خلاصة: مستوى تأثير الريسين… »),
questions tronquées (« اقترح حلا. »), questions sans attache imprimée
(« ما النموذج الذي سمحت… », « ما الذي يحدد نمط… »), conflation
(« الجدول الشكل (أ) » pour « الجدول (أ) »). La Phase 3 remplacera ces
`bacPrompt` par les phrases ci-dessus, pôle par pôle.

## Cadrages restés `reconstructed` (aucune question imprimée)

S1-E1 N et W ; S1-E2 N ; S2-E1 N et W ; S2-E2 N ; S2-E3 N. Ces sept pôles
portent une formulation pédagogique et une note datée expliquant l'absence
de question autonome : ils ne doivent pas être promus `official` sans une
phrase interrogative lue sur l'image. Total : 17 pôles `official`
proposés sur 24.

---

## Application (Phase 3 du plan) — 2026-09-23

Encodage fait **depuis les tableaux ci-dessus**, jamais depuis la couche
texte. Aucune page n'a été lue à nouveau : la Phase 3 applique la Phase 1.

### Consignes passées en `official` (17/24, chiffre inchangé)

| Pôle | Avant | Après |
| --- | --- | --- |
| S1-E1 S | « انقل الجدول … وفق البيانات المرقمة. » (p.1) | « 1. أنقل الجدول … وفق التّعليمات المطلوبة. » (p.1) |
| S1-E1 E | « بيّن في نص علمي … اعتمادا على معلوماتك. » | « 2. بيّن في نصّ علمي … ممّا سبق ومعلوماتك. » (p.1) |
| S1-E2 S | « حلّل مخطط الشكل (أ) من الوثيقة 1. » | + consigne 2 du الجزء الأول (وضّح دور إيبوبروفان) — regroupement noté |
| S1-E2 E | « فسّر منحنى الشكل (ب) من الوثيقة 2. » | + consigne 1 du الجزء الثاني et ses deux tirets (علّل) — regroupement noté |
| S1-E2 W | « اقترح حلا. » | « 3. اقترح حلا يُبيّن كيفية تخفيف الأعراض الجانبية… » (p.2) |
| S1-E3 N | « اقترح فرضية … » (p.3) | « فكيف تتدخل الأجسام المضادة … ؟ » (p.3) — la question de cadrage remplace la question d'hypothèse |
| S1-E3 S | « حلّل النتائج الموضحة في الجدول الشكل (أ) … » | « 1- استخرج علاقة بروتين (Her 2)… 2- اقترح فرضية … » (p.3) — l'analyse du tableau part au pôle E |
| S1-E3 E | « فسّر آلية تأثير جزيئة تراستوزوماب … » | + consignes 1 et 3 du الجزء الثاني (جدول + كشف مبكّر) — regroupement noté (p.4) |
| S1-E3 W | « قدّم مقترحا … الكشف المبكر … » | « بيّن … في نص علمي كيف تتدخل الأجسام المضادة … » (p.4) |
| S2-E1 S | « من 1 إلى 11 … » | « من 01 إلى 06 … » (p.5) — la 6e cellule est bien la dernière (11 était faux) |
| S2-E1 E | « … دور مصدر الببتيد المستضدي في انتقاء … » | « … دور ومصدر المستضد في انتقاء اللمفاويات … » (p.5) |
| S2-E2 S | « حلّل الوثيقة 1 … » (p.5) | « . حلّل الوثيقة (1) … » (p.6) — page corrigée, puce imprimée conservée |
| S2-E2 E | « قدّم حلا … الوثيقة 3. » (p.7) | « . حلّل منحنيات الشكلين (أ) و (ب) … » (p.7) |
| S2-E2 W | pôle reconstruit (نسخ/ترجمة) | « . أعط حلا للمشكلة المطروحة … الوثيقة (3). » (p.7) |
| S2-E3 N | « اقترح فرضية لحل هذه المشكلة. » (p.8) | pôle reconstruit : cadrage pédagogique, aucune question imprimée |
| S2-E3 S | « استخرج أهم مميزات البروتينات … » (p.9) | « 1- حلّل معطيات الوثيقة (1) مُحدّدا المشكلة … 2- اقترح فرضية … » (p.8) |
| S2-E3 E | « تأكد من صحة الفرضية … » (p.9) | + consignes 1 et 3 du الجزء الثاني (استخرج + قدّم حلا) — regroupement noté (p.9) |
| S2-E3 W | « قدّم حلا مبنيا على أسس علمية … » | « لخّص في نص علمي دقيق آلية عمل المشبك المثبط … » (p.9) |

### Ce que la Phase 3 a corrigé dans les données servies

- **600, pas 655** : le tableau de S1-E3 imprime 600 (première ligne du
  tableau, relue sur l'image) ; la couche texte écrivait 655. La valeur est
  corrigée dans la réponse modèle **et** dans la règle `rule.document.values`.
- **CI50 : 10 et 9** au lieu de 15 et 9,5. La couche texte donne 9 et 10
  (pièges ci-dessus) ; l'ordre (Cox-1 lent, Cox-2 rapide) est conservé.
  Ce sont des réponses modèles, jamais un corrigé officiel.
- **« الجدول الشكل (أ) »** (conflation) disparaît : la phrase imprimée dit
  « الجدول (أ) من الوثيقة (2) ».
- **« من 1 إلى 11 »** devient « من 01 إلى 06 » : le schéma numérote six
  éléments, pas onze.
- **La question pédagogique « نسخ / ترجمة » de S2-E2-W n'est plus un pôle** :
  la phrase imprimée est « أعط حلا … ». Son contenu est porté par la consigne
  du pôle E (حلّل منحنيات الشكلين (أ) و (ب) …).
- **Sept cadrages restent `reconstructed`** (S1-E1 N/W, S1-E2 N, S2-E1 N/W,
  S2-E2 N, S2-E3 N) avec une note datée disant pourquoi.

### Gardes ajoutées (Phase 5) et verrou

- `tests/data-integrity.test.mjs` : refus d'un préfixe `خلاصة`/`الخاتمة`, de
  parenthèses vides, du doublon « أنزيم وأنزيم », et d'une consigne officielle
  recopiée sur deux années ou deux exercices. Mesure faite **avant** l'ajout :
  aucune consigne du corpus ne déclenchait ces refus ; deux paires légitimes
  de formules passe-partout (2024, 2026) sont nommées dans le test plutôt que
  tolérées en silence.
- `tests/se-2020-recopy.test.mjs` (8 tests) : fige les 17 textes et leurs
  pages, le refus de page sur un pôle reconstruit, les barèmes 5/7/8 lus sur
  l'image, le 600, les regroupements notés et l'inventaire `partial`.

### Mesures après encodage

`npm run inventory:generate` → **58 sujets, 576 tâches, 277 consignes
officielles, 299 étapes reconstruites, 0/58 inventaire `complete`,
277/277 pages rattachées**. Le compte 277 et `activePoles` **ne bougent pas** :
2020 échange des pôles entre exercices, n'en certifie aucun de plus.
`calibration:check` reste vert, `p1:check` reste rouge — c'est attendu.
