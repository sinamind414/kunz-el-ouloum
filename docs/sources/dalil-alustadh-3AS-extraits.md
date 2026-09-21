# دليل الأستاذ 3AS — EXTRAITS SOURCÉS (Pierre 2f, 2026-09-19)

Source : texte intégral collé par le propriétaire le 2026-09-19 (canal fiable, copie
propre). La copie brute d'extraction PDF existe en parallèle :
`docs/sources/دليل-الأستاذ-2017.txt` (653 KB, ligatures de présentation — NON
greppable, conservée pour la traçabilité du scan).
Ce fichier = les passages qui fondent des décisions moteur, cités verbatim.

Statut d'exigibilité (décision implicite par intégration) : le دليل الأستاذ devient
la **3e référence du correcteur**, aux côtés du corrigé ministériel 2025 et du
dictionnaire final (build). Une assertion pédagogique peut désormais être sourcée
aux trois.

---

## 1. Énergie — la valeur 38 ATP CONFIRMÉE par le guide

> « يتوصل التلميذ إلى أن الحصيلة الكلية لعدد ATP هي **38 جزيئة** »
> (وحدة آليات تحويل الطاقة الكيميائية الكامنة — الفسفرة التأكسدية)

> « يمكن للتلميذ حساب كمية الطاقة... بـ **38 جزيئة في التنفس و ATP 2 في التخمر** »

→ Renforce la sanction `atp_bilan_respiration` (CONFLIT_REF) : la citation
« الكتاب المدرسي L9843 » est doublée d'une citation explicite du دليل الأستاذ.

## 2. Photosynthèse — nommage des deux phases + le mythe « تتم في الظلام »

> « يعتمد هذا المنهج تسمية **المرحلة الكيموضوئية** والمرحلة **الكيميائية الحيوية**
> (تعوضان تسمية المرحلة الضوئية والمرحلة اللاضوئية في المنهج السابق) »

> « **المرحلة ب لا تحتاج إلى الضوء لكنها تتم في الضوء** وإزالة الغموض الذي كان
> متواجداً أحياناً في أن المرحلة ب تتم في الظلام »

> « حدوث المرحلة ب يمكن اكتشافه من خلال امتصاص CO2 الذي يتم **في غياب الضوء وفي
> وجوده** »

→ Le guide lui-même utilise « في غياب الضوء » comme formulation légitime — la
sanction `phase_obscure_nuit` a été **resserrée** : elle ne vise que la PHASE
nommée placée dans l'obscurité/la nuit (« المرحلة اللاضوئية تتم في الظلام »),
jamais la simple co-occurrence photosynthèse + obscurité.

## 3. Photosynthèse — le source de l'oxygène libéré

> « يتوصل التلميذ من خلال النتائج إلى أن **مصدر الأكسجين المنطلق هو الماء وليس
> CO2** »

> « **CO2 غير ضروري لعمل التيلاكويد** وذلک لأن انطلاق O2 يتم في غياب CO2 »

→ Nouvelle sanction `oxygene_source_co2` (forte).

## 4. Protéines — la « بنية ربعية », l'erratum du concept

> « يجب التنبيه على أنه **لا علاقة بين 4 تحت وحدات والبنية الرابعية** كما يجب
> **تفادي استعمال مصطلح البنية الرباعية** لأنها تؤدي إلى فكرة أن البنية الرابعية
> تعني دائماً أربعة سلاسل ببتيدية »

> « الحد الأدنى لعدد تحت الوحدات في البنية الرابعية هو **2** والحد الأقصى غير محدد »

→ Nouvelles sanctions `structure_terme_rubaiya` (vigilance) et
`structure_quaternaire_4_chaines` (vigilance).

## 5. Enzymes — spécificité trypsine / chymotrypsine (attendu officiel de l'exercice)

> « عند معاملة الببتيد: Ala-Gly-Tyr-Arg-Ser-Phe-Glu-Val-Lys-Leu بإنزيم تربسين ينتج
> 3 قطع: **Ala-Gly-Tyr-Arg | Ser-Phe-Glu-Val-Lys | Leu** » (coupure après Arg ET Lys)

> « معاملة بإنزيم **ببسين [chymotrypsine]** ينتج: **Ala-Gly-Tyr | Arg-Ser-Phe |
> Glu-Val-Lys-Leu** لأن الإنزيم يحلل الرابطة الببتيدية عند **Tyr و Phe** »

→ Nouvelle sanction `protease_specificite_inversee` (forte). Garde : les séquences
latines (Ala-Gly-Tyr-…) ne déclenchent PAS — la réponse correcte du guide est
elle-même truffée de Tyr/Phe à côté de « تربسين ».

## 6. Synapse — le curare sur les canaux CHIMIQUES (sens S1-Ex3)

> « تثبت جزيئات الكورار على **القنوات الغشائية المرتبطة بالكيمياء** منافسةً في ذلك
> جزيئات الأستيل كولين وبالتالي تمنع انتقال النبأ... ويصاب الحيوان بالشلل »

→ Sance `curare_sur_canal_voltage` (vigilance — la phrase correcte « لا يعمل على
الفولطية » ne doit jamais être pénalisée).

## 7. Synapse — la pompe Na⁺/K⁺ (les nombres officiels)

> « تثبت **3 شوارد الصوديوم** وتنقلها **خارج الخلية** وتثبت **2 شاردتي البوتاسيوم**
> وتدخلها داخل الخلية **باستهلاك جزيئة ATP** »

→ Nouvelle sanction `pompe_na_k_inversee` (vigilance, fenêtres serrées pour ne pas
heurter la phrase correcte du guide).

## 8. Erratum officiel du manuel — TTX / TEA échangés (ص 132)

> « Tetrodotoxine مادة تحصر انتقال **Na⁺** / Tetraethyl-ammonium مادة تحصر انتقال
> **K⁺** » (تصويب الأخطاء : les deux légendes étaient interverties dans le manuel)

→ Nouvelle sanction `bloqueurs_ttx_tea` (vigilance) : l'élève qui répète l'erreur
du manuel imprimé est alerté.

## 9. Erratum BAC 1999 — « 3 أنواع من ARNt » est FAUX

> « هذه المعطيات **تصحح أحد الأخطاء التي وردت في الموضوع الثاني لبكالوريا 1999**
> والذي تم فيه خطأ الإشارة إلى وجود 3 أنواع من ARNt — والصحيح أن هناك **3 أنواع من
> ARNr** مختلفة في أوزانها الجزيئية »

→ Nouvelle sanction `arnr_3_types_pas_arnt` (vigilance).

## 10. Structure du programme (pour التدرج السنوي — L5, travail différé)

Le guide livre la table officielle des unités et كفاءات :

- **المجال I — التخصص الوظيفي للبروتينات** : U1 تركیب البروتین*, U2 العلاقة بین
  بنیة ووظیفة*, U3 النشاط الإنزيمي, U4 دور البروتینات في الدفاع*, U5 دور البروتینات
  في الإتصال العصبي (* = unités communes SE/Math).
- **المجال II — التحولات الطاقوية** : U1 آلیات تحويل الطاقة الضوئیة, U2 آلیات
  تحويل الطاقة الكامنة إلى ATP, U3 التحويل على مستوى ما فوق البنیة الخلوية.
- **المجال III — التكتونیة العامة** : U1 النشاط التكتوني للصفائح, U2 بنیة الكرة
  الأرضیة, U3 النشاط التكتوني والبنیات المرتبطة به.
- **شعبة الرياضیات (مجال خاص)** : الإنسان وتسییر الكوكب (U1 العلاقة بین نشاطات
  الإنسان والتلوث الجوي, U2 مصادر تلوث الماء, U3 الحالات الصحیة المرتبطة بالتلوث,
  U4 التأثیر الإيجابي للإنسان على مستقبل الكوكب).

الكفاءات القاعدية SE : (1) إرشادات لاختشال وظيفي عضوي بتجنيد معارف الإتصال على
مستوى الجزيئات الحاملة للمعلومة · (2) نموذج تفسيري لحركية الطاقة الخلوية ·
(3) نماذج تفسيرية للحركية الداخلية للأرض والتكتونية العامة.
الكفاءات القاعدية Math : (1) identique à SE-1 · (2) حلول عقلانية للمحافظة على
البيئة (الإنسان وتسيير الكوكب).

La source brute complète pour L5 : `docs/sources/التدرج-السنوي-للتعلمات-2017.txt`
(156 KB, déjà en dépôt).

## 11. Confirmations qui ne changent rien (contrôles de cohérence)

- 38 ATP ✓ (cohérent avec le dictionnaire final et la sanction existante).
- اللقاح/الذاكرة/التعرف المزدوج (HLA I + antigène) — cohérent avec U4.
- لاتيettres du guide ne contredisent RIEN du registre bac2025 (attendusBac2025) :
  α-amanitine/Amanita phalloides (contexte S1-Ex1 RIP) y est traité comme
  inhibiteur spécifique d'ARN polymérase, le curare explique la mécanique
  « drogue au synapse » de S1-Ex3.
