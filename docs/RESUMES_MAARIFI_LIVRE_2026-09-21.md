# الحصائل المعرفية الرسمية du livre officiel — citation intégrale (2026-09-21)

**Objet.** À la demande user (« donne-moi et cite tous les résumés معارفي sur tout le
livre ») : extraction et citation **verbatim** de toutes les sections
**« الحصيلة المعرفية »** imprimées dans le livre officiel (source = `data/bookContent.json`,
dont l'identité binaire avec le PDF déposé b59a6a1 est prouvée par sha256 — voir
AUDIT_MOT_A_MOT §6). Erreurs OCR conservées telles quelles (règle R3 — jamais
« corrigées » en silence) ; les passages illisibles sont marqués […].

**Concordance de comptage JSON↔PDF dé-espacé : « حصيلة » 24× = 24× ;
« الحصيلة المعرفي* » 16× vs 15× (1 variante OCR : المعرذية).**

## 0. Fait structurel du livre

Le livre n'imprime **pas** de الحصيلة المعرفية pour toutes les unités. Zones avec
section : **U1, U2, U4, U6, U7, U8, U11 (fin D3)** — soit **7 zones**. Les unités
**U3 (الإنزيمات), U5 (الاتصال العصبي), U9 (الصفائح), U10 (بنية الكرة)** n'en ont
PAS (l'ingestion l'avait compté : knowledge_summary runs=14, hors variantes OCR).
Les unités sans حصيلة officielle se terminent par المخطط التحصيلي ou استثمر معارفي
directement. Nos 44 résumés par leçon (resumesLecons.ts) couvrent donc le complément,
alignés à 91 % sur le texte du livre.

## 1. D1-U1 — تركيب البروتين (ch5, l.578-595) — الحصيلة + المخطط التحصيلي

> **الحصيلة المعرفية** (l.578) — le livre y présente le **مخطط تحصيلي لعملية تركيب
> البروتين** (l.580-595) : schéma final dont l'OCR ne capture que les étiquettes :
> ARNn / سلسلة / سلسلة ببتيدية / عند بدائيات النواة / عند حميقيات [حقيقيات] النواة /
> ARNm / تحت الوحدة الكبرى ريبوزوم / سلسلة ببتيدية — le reste est du bruit OCR […].

## 2. D1-U2 — بنية-وظيفة (ch8, l.884-890) — la حصيلة la plus rédigée de D1

> **الحصيلة المعرفيي[sic]** (l.884) :
> « …من COOH، ويكون الحمض الأميني موجب الشحنة إذا كان pH الوسط أقل من pHi للحمض الأمينى. »
> « ترتبط الأحماض الأمينية المتتالية في السلسلة الببتيدية بروابط تكافؤية تدعى الروابط
> الببتيدية. وتنشأ الرابطة من تفاعل مجموعة الكربوكسل (COOH) لحمض أميني مع مجموعة أمين
> (NH2) لحمض أميني آخر مع خروج جزيئة ماء بينهما. » (l.886)
> « نحتوي السلاسل الببتيدية مهما كان طولها على مجموعة أمينية في بداية السلسلة تسمى
> الطرف الأمينى ومجموعة كربوكسيلية في نهاية السلسلة تسمى النهاية الكربوكسيلية. يبدأ
> قراءة تتابع الأحماض الأمينية في السلسلة الببتيدية دائما من الطرف الأميني… » (l.887)
> « نعتمد خصائص الكهربائية والأمفوتيرية للببتيدات والبروتينات على نوع الجذور الحامضية
> والقاعدية… » (l.888)
> « تُحافظ البروتينات على بنياتها الفراغية المحددة نتيجة لعدد من الروابط التي تنشأ بين
> المجموعات الكيميائية المتواجدة في جذور الأحماض الأمينية في مواقع محددة. » (l.889)
> « بؤدي[sic] تفكيك هذه الروابط (الجسور الكبيريتة[sic]، الروابط الهيدروجينية والشاردية)
> باستعمال عوامل فيزيائية مثلا حرارة أو كيمائية مثلا الأحماض والقواعد… » (l.890)

## 3. D1-U4 — الدفاع عن الذات (ch23, l.2102-2103) — حصيلة d'une ligne

> **الحصيلة المعرفية** (l.2102) :
> « يمثل كل فرد وحدة بيولوجية مستقلة بذاتها، إذ تستطيع عضويته التمييز بين مكونات
> **الذات واللاذات**. » (l.2103)

## 4. D2-U6 — التركيب الضوئي (ch34, l.3650-3664)

> **الحصيلة المعرفية** (l.3650) :
> « التركيب الضوئي هو آلية تسمح بتحويل الطاقة الضوئية إلى طاقة كيميائية تخزن في شكل
> جزيئات عضوية مثل النشا وفق المعادلة : » (l.3652)
> « CO2 + nH2O —ضوء/يخضور→ نشا يخضور + O2 » (l.3653, orthographe OCR dégradée)
> « تتطلب عملية التركيب الضوئي توفر الضوء واليخضور وتؤدي إلى تكون النشا داخل
> الصانعات الخضرء. يمكن الكشف عن وجود النشا في الأوراق عن طريق استعمال كواشف مناسبة
> (ماء اليود)… » (l.3654)
> « تتم عملية التركيب الضوئي في الصانعات الخضراء وهي عضيات ذات بنية حجيرية (مقسمة إلى
> حجرات)… تحتوي أغشية **التيلاكويد** على : أغشية ضوئية (معقدات بروتينية كبيرة… نوعين
> من الأنظمة الضوئية PS-I / PS-II)؛ ناقلات الإلكترونات؛ معقد بروتيني كبير يقوم بتركيب ATP » (l.3655-3660)
> « تحتوي الحشوة على مواد الأيض الوسطية لتركيب الجزيئات العضوية بالإضافة إلى المرافقات
> الإنزيمية ATP و NADP و إنزيمات كثيرة… » (l.3661)
> « …المرحلة الكيموضوئية (تفاعلات أكسدة وإرجاع)… ومرحلة كيميوحيوية وتتم في الحشوة. » (l.3662-3664)

## 5. D2-U7 — الأكسدة التنفسية (ch39, l.4113-4167) — la plus riche (équations + bilan ATP)

> **الحصيلة المعرفية** (l.4113) — structure du Mيتوكندري :
> « يتميز الغشاء الداخلى بمحتواه العالي من البروتينات مقارنة بالغشاء الخارجي… بوجود
> نواقل الإلكترونات تشكل مايعرف بالسلسلة التنفسية… بالإضافة إلى أجسام كروية… تسمى
> الكريات المذنبة أو إنزيم ATP-Synthase. » (l.4115-4116)
> « لا يمكن للميتوكوندري استعمال الغلوكوز كمادة أيضية لكنها تستعمل حمض البيروفيك
> الذي ينتج من الهدم الجزئي للغلوكوز » (l.4119)
>
> **حصيلة التحلل السكري** (l.4124-4125) :
> « Glucose + 2NAD+ + 2ADP + 2Pi → Acide pyruvique + 2ATP + 2NADH.H »
>
> **حصيلة حلقة كريبس** (l.4132-4137) — 4 types de réactions :
> « 1) تفاعلات نزع الكربوكسيل التأكسدية… مرتين. 2) نزع الهيدروجين وإرجاع NAD مرة.
> 3) نزع الهيدروجين وإرجاع FAD مرة واحدة. 4) تركيب ATP بطريقة مباشرة… »
> « Acide pyruvique + CoA-SH + NAD+ → Acetyl-CoA + NADH.H + CO2 » (l.4129, OCR dégradée)

> **حصيلة عدد ATP** (l.4146-4154) — TABLEAU officiel du livre :
> | Étape | ATP directs | NADH.H | FADH2 |
> |---|---|---|---|
> | التحلل السكري (الهيولى) | 2 | 2 | 0 |
> | حلقة كريبس (بخطوتها التحضيرية) | 2 | 2+6 | 2 |
> | الفسفرة التأكسدية | — | أكسدة 10 NADH.H | أكسدة 2 FADH2 |
> | **حصيلة عدد ATP** | **4** | **30** | **4** |
> **الحصيلة الإجمالية : 38 ATP** (l.4153-4154)
> + « المخطط التحصيلي لظاهرة التنفس » (l.4155) — schéma final.
> (l.4167 ouvre la حصيلة de la suite : التخمر — « إنتاج كمية قليلة من الطاقة مقدارها
> 2 ATP فقط مقارنة بـ 38 ATP في التنفس » l.4172, équation l.4173.)

## 6. D2-U8 — التحولات الطاقوية (ch41, l.4287)

> **الحصيلة المعرفية** (l.4287) — la section imprimée est immédiatement suivie de
> « استثمر معارفي وأوظف قدراتي » (OCR : « أسيمر معارق وأوهف قالاتي ») et des exercices
> (نباتات الشمس/الظل, نقطة التعويض…) : **le livre ne rédige pas de texte de حصيلة
> pour U8** — il enchaîne sur les exercices. (Le texte récapitulatif de l'unité est
> dans l'ouverture du chapitre l.4284-4286 : « لا يمكن للحياة أن تستمر دون الإمداد
> المستمر من الطاقة والقدرة على تحويل الطاقة من صورة لأخرى بشكل مستمر. »)

## 7. D3-U11 — الظواهر التكتونية (ch54, l.5976-5979)

> **الحصيلة المعرفية** (l.5976) :
> « ينتج عن التقلص القشري تحول الصخور العميقة تحت تأثير ارتفاع درجة الحرارة والضغط
> انصهار جزئي لغرانيت القشرة القارية. » (l.5977)
> « شواهد محيط قديم : يؤدي تقارب الألواح التكتونية إلى تشوه حدود الصفائح واندساس
> بقايا المحيط داخل السلسلة الجبلية على شكل **أوفيوليت**. » (l.5978-5979)
> + المخطط التحصيلي final : « يمثل المخطط التحصيلي التالي ديناميكية الليتوسفير من
> التباعد إلى غاية تشكل سلسلة جبلية » (l.5989).

## 8. Correction documentée (règle : vérifier avant de croire)

Le doc AUDIT_MOT_A_MOT §4 affirmait « le livre ne nomme jamais ثيلاكويد » —
**littéralement vrai (ثيلاكويد 0×) mais trompeur** : le livre écrit **التيلاكويد
avec تā' (تيلاكويد : 38×, ex. l.3656)**. Mes résumés utilisaient majoritairement
التيلاكويد (correct) ; 1 occurrence en ث (leçon jagendorf p1) a été corrigée en ت
(verrou 8/8 stable).NB : l'extraction PyMuPDF du PDF rend « تيلاكويد » illisible
(0× dans la couche texte) — l'OCR ingéré (autre outil) l'avait capturé 38× : la
couche texte PyMuPDF est localement moins fidèle que l'OCR ingéré, à garder en tête.

## 9. Récapitulatif

| Zone | Chapitre | Lignes (bookContent) | Contenu |
|---|---|---|---|
| D1-U1 | ch5 | 578-595 | حصيلة + مخطط تركيب البروتين (étiquettes) |
| D1-U2 | ch8 | 884-890 | pHi, روابط ببتيدية, طرفان, بنية فراغية |
| D1-U4 | ch23 | 2102-2103 | الذات واللاذات (1 phrase) |
| D2-U6 | ch34 | 3650-3664 | معادلة التركيب الضوئي + بنية الصانعة/التيلاكويد |
| D2-U7 | ch39 | 4113-4173 | Mيتوكندري + 3 معادلات + tableau **38 ATP** + التخمر |
| D2-U8 | ch41 | 4287-4288 | حصيلة sans texte (enchaîne sur les exercices) |
| D3-U11 | ch54 | 5976-5989 | التقلص + أوفيوليت + مخطط ديناميكية الليتوسفير |
| **Sans حصيلة** | — | — | **U3, U5, U9, U10** (المخطط التحصيلي/exercices seulement) |

## 10. Injection « pro » dans les leçons passives (GO user, 2026-09-21)

Les 7 حصائل officielles sont injectées dans la **leçon de clôture de chaque unité**
(carte ambre « 🏛 الحصيلة المعرفية — النص الرسمي للكتاب المدرسي », page du manuel
citée quand lisible dans l'OCR, lien nav 🏛 après le lien 📝 خلاصة) :

| Leçon de clôture | Unité | Source livre | Page |
|---|---|---|---|
| `phase2_chapitres_3_4` | D1-U1 | ch5 (مخطط تركيب البروتين) | ص 34 |
| `phase3_chapitres_5_6` | D1-U2 | ch8 (روابط ببتيدية, بنية فراغية) | ص 152 |
| `phase7_chapitres_13_14` | D1-U4 | ch23 (الذات واللاذات) | — |
| `phase12_chapitres_23_24` | D2-U6 | ch34 (معادلة + بنية الصانعة) | — |
| `phase14_chapitres_27_28` | D2-U7 | ch39 (3 équations + **tableau 38 ATP**) | ص 222 |
| `phase15_chapitres_29_30` | D2-U8 | ch41 (الإمداد المستمر من الطاقة) | — |
| `phase22_chapitres_43_44` | D3-U11 | ch54 (تقلص + أوفيوليت + Orogenèse) | ص 330 |

Présentation pro : équations en cadres LTR, tableau ATP en table HTML stylée,
notice de transparence (« نص الكتاب بتنسيق قرائي، دون تغيير المعنى »). Les U3/U5/U9/U10
(sans حصيلة officielle) gardent uniquement nos résumés 📝 — la carte 🏛 n'existe qu'où
le livre en a une, c'est sa valeur d'autorité.

**Verrou** : resumes.lock.test.ts étendu — 7 cartes `id="hosila"` + marqueurs +
liens nav + ancrage lexical au livre + le chiffre 38ATP tracé à sa source (l.4154).
