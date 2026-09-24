# AUDIT QUALITÉ ARABE — rubrique « الحصيلة المعرفية »

**Date** : 2026-09-24 · **Mode** : audit seul — **aucune modification de code ou de contenu appliquée** (consigne : « AUDIT LA QUALITE SANS CODE »)
**Objet** : « souci grave d'arabe mélangé (darija / latin / arabe corrompu) dans la rubrique الحصيلة المعرفية » → contrôle de la conformité **عربية فصحى 100 %**.

---

## 0. Périmètre réellement audité (2 surfaces distinctes)

| # | Surface | Fichier(s) | Contenu affiché à l'élève |
|---|---|---|---|
| S1 | Onglet app « الحصيلة المعرفية — كل ما يجب حفظه » | `src/components/OkachaView.tsx` | ① texte **officiel du livre** : `src/data/hosila.ts` (10 unités · 71 points · 488 blocs, verrou `src/data/hosila.lock.test.ts`) ② **méthodologie « كتاب عكاشة »** : `OKACHA_METHODO_SECTIONS` dans `src/data/okachaEnriched.ts` (9 sections · 401 blocs) ③ repli OCR عكاشة pour une unité hors texte officiel |
| S2 | Carte 🏛 en fin de leçon | `public/lessons/phase*.html` (**11** fichiers portent le titre) | texte officiel + méta-notes de production |

Méthode : extraction mécanique des zones concernées (2 passes : HTML brut + texte visible après stripping), scan **par mot entier** (darija algérienne/marocaine : `بصح`, `باش`, `كيفاش`, `ديال`, `تاع`, `واش`…), détection des formes non-arabes (répétitions ≥3, chiffres collés dans un mot, latin collé au mot arabe), et comparaison HEAD vs copie de travail.

---

## 1. Verdict

| Composant de la rubrique | État | Mesure |
|---|---|---|
| `src/data/hosila.ts` — النص الرسمي للكتاب | ✅ **فصحى 100 %** | 488 blocs scannés : 0 darija, 0 français, 0 corruption. Seules 3 chaînes portent des abréviations latines **légitimes** : `الـ ARN`, `pHi`, `LB / LT (LTh, LTc)` |
| Libellés d'interface `OkachaView.tsx` | ✅ فصحى | 46 lignes arabes : « الحصيلة المعرفية — كل ما يجب حفظه », « وضع الحفظ », « اختبار الكتاب »… aucune darija |
| **Cartes 🏛 des leçons (S2)** | ❌ **non conforme** | 8 fichiers · **24 lignes HTML cassées** → texte technique latin **imprimé au milieu du texte arabe** |
| **Méthodologie عكاشة (S1.②)** | ❌ **non conforme** | darija explicite (`بصح`) + **86 / 401 blocs** contenant au moins une forme non-arabe, dont **7 blocs illisibles** |

**Conclusion** : l'arabe « officiel » de la rubrique est propre ; le mélange vient de **3 défauts identifiés et localisés** (F1 → F3), tous corrigeables sans réécrire le contenu scientifique.

---

## 2. F1 — BLOQUANT : balises tronquées → texte latin visible dans la carte arabe

**Cause racine identifiée** : patch `morchid-fixes-pour-master.patch` (lignes 141-142, 217-218, 169, 247), intégré au commit `b8b86ab` (« Report Arena… zone-synthese 11 lecons »). Le patch remplace la balise complète par une balise **coupée**, et ré-émet la fin d'attribut comme **texte brut** :

```diff
-            <section class="card" id="hosila" style="border:2px solid #f59e0b;">
+            <section class="card"
...
+        <div class="synthese-zone" id="zone-synthese">
+id="hosila" style="border:2px solid #f59e0b;">
```

**Effet mesuré** : `<section class="card"` n'est jamais fermé (`>` absent) → le parseur HTML avale la balise suivante, et la ligne `id="hosila" style="border:2px solid #f59e0b;">` devient du **texte affiché**. Résultat : l'élève lit littéralement, au milieu de la carte arabe :

```
id="hosila" style="border:2px solid #f59e0b;">
الحصيلة المعرفية — النص الرسمي للكتاب المدرسي (…)
id="schema-synthese" style="border:2px solid #2563eb;">
```

Effets secondaires : la carte perd sa classe/bordure (`card-hosila` / `card-schema`), et l'ancre `#hosila` de la navigation **n'existe plus** (ce n'est plus un attribut `id`).

**Localisation exacte (8 fichiers · 24 lignes — déjà présentes dans HEAD, pas seulement dans la copie de travail) :**

| Fichier | Balises ouvertes sans `>` | Attributs orphelins (texte visible) |
|---|---|---|
| `phase7_chapitres_13_14.html` | 638 `<section class="card-hosila"`, 641 `<section class="card-schema"` | 665 `id="hosila">`, 674 `id="schema-synthese">` |
| `phase10_chapitres_19_20.html` | 613, 616 `<section class="card"` | 640 `id="hosila" style="…">`, 659 `id="schema-synthese" style="…">` |
| `phase12_chapitres_23_24.html` | 606 | 630 |
| `phase14_chapitres_27_28.html` | 609 | 633 |
| `phase15_chapitres_29_30.html` | 613 | 637 |
| `phase18_chapitres_35_36.html` | 599 | 623 |
| `phase20_chapitres_39_40.html` | 607, 610 | 634, 652 |
| `phase22_chapitres_43_44.html` | 624, 627 | 651, 666 |


---

## 3. F2 — Français / notes de production **visibles** à l'intérieur de la carte arabe

Mesure : **13 lignes latines visibles** dans les 11 zones 🏛 (10 réelles, hors formules chimiques).

| Fichier:ligne | Texte affiché aujourd'hui | Correction 100 % فصحى (si la note reste visible) | Recommandation |
|---|---|---|---|
| `phase2:686`, `phase3:635`, `phase10:645`, `phase12:635`, `phase14:638`, `phase15:642`, `phase22:656` | « … نص الكتاب بتنسيق قرائي، دون تغيير المعنى **(OCR rendu lisible)**. » | « … نصّ الكتاب بتنسيق قرائي، دون تغيير في المعنى، مع جعل النص مقروءاً. » | supprimer la note (production) → la déplacer en `<!-- commentaire -->` |
| `phase4:636` | « **Texte corrigé fourni par l'utilisateur (page 68) — absent de l'OCR ingéré (ch9-11 quasi vides).** » (phrase 100 % française) | « نصّ الحصيلة مصحَّح يدوياً من الكتاب المدرسي (ص 68)؛ لم تُستخرج هذه الصفحات آلياً. » | idem |
| `phase18:638` | « **Texte corrigé fourni par l'utilisateur** — حصيلة U9 absente de l'OCR ingéré. » (phrase mixte) | « نصّ حصيلة الوحدة 9 مصحَّح يدوياً؛ لم تُستخرج من النسخة الممسوحة ضوئياً. » | idem |
| `phase2:750`, `phase7:694`, `phase10:678` | « … (ancrage 12/12, **verrou resumes.lock**). » / « (ancrage mécanique, verrou resumes.lock). » | — (jargon de production, intraduisible utilement) | **retirer du DOM élève** (le projet a déjà un patron `<details>` réservé à l'enseignant — cf. `phase7:690`) |
| `phase10:665`, `phase20:658` | « طبقة الصورة تحوي **أخطاء OCR آلية** (« الفقوات » بدل القنوات…) » | « تحوي طبقة الصورة أخطاء استخراج آلي (« الفقوات » بدل « القنوات »…). » | OK après correction |

**Point de doctrine à trancher** : ailleurs dans le projet, le latin scientifique est un choix assumé (`<span class="ltr-seq">`, `ADN`, `ATP`, `Rubisco`…). La règle « arabe 100 % » doit donc être formulée ainsi :
> **Aucune phrase, mot-outil ou note de production en latin/FR dans le texte élève ; les seuls caractères latins admis sont les symboles et abréviations scientifiques portés par `<span class="ltr-seq">`.**

---

## 4. F3 — Darija et arabe corrompu dans la méthodologie « عكاشة » (S1.②)

⚠️ Ce contenu est **généré** (`src/data/okachaEnriched.ts` ← `src/data/okacha.ts` via `scripts/enrich_okacha.ts`, verrou `okachaEnriched.lock.test.ts`). Conformément à la consigne « sans code », **rien n'a été modifié**.

### 4.1 Darija explicite

| Source | Texte | Défaut | Proposition فصحى |
|---|---|---|---|
| `okacha.ts:1841` = `okachaEnriched.ts:1379` (section **nasiha** — نصائح المراجعة) | « **لاكا بصح** بالابتعاد عن كل وسائل التشويش (هاتف، موسيقى، تلفاز...) ولدراسة في غفة جبد: ءة وهادئة، بالإضافة إلى حسن التغذية والنوم الجيد فالعقل السليم في الجسم السليم. » | **`بصح`** = darija algérienne (« mais ») ; `لاكا` + `في غفة جبد: ءة` = OCR cassé | « لكن لا بدّ من الابتعاد عن كل وسائل التشويش (الهاتف، الموسيقى، التلفاز…)، وأن تجري الدراسة في غرفة نظيفة هادئة، مع حسن التغذية والنوم الجيد؛ فالعقل السليم في الجسم السليم. » |

### 4.2 Arabe illisible (extraits, texte affiché tel quel à l'élève)

| Bloc | Texte affiché | Proposition |
|---|---|---|
| `okachaEnriched.ts:1041` | « … إما بطريقة استقرائية( الانتقال من الجزيات إلى الكليات) أو استنباطين(…) **ءماش، الملالس الممو لك** » | « … إمّا بطريقة استقرائية (الانتقال من الجزئيات إلى الكليات) وإمّا بطريقة استنباطية (الانتقال من الكليات إلى الجزئيات). » |
| `:1042` | « **اللمران المناني:** » | « التمرين الثاني: » |
| `:1043` | « **نرظبف** الموارد المعرفية والمنهجية في **مارسة الاسنادلال المامي**. » | « نوظِّف الموارد المعرفية والمنهجية في ممارسة الاستدلال العلمي. » |
| `:1044` | « **،:وي النمرين الثاني على جزأين منتابعبن ومنكاملبن من** » | « ويتضمّن التمرين الثاني جزأين متتابعين ومتكاملين. » |
| `:1045` | « **،انيا ما بحنوي النمرين الثاني على:** » | « أمّا ما يحتوي عليه التمرين الثاني فهو: » |
| `:1021` | « **الورض**: بعد طرح المشكلة… **حبث** يخير **اطالب**… مجموعة **طمات** » | « العرض: بعد طرح المشكلة… حيث يختار الطالب… مجموعة كلمات » |
| `:1022` | « **يادللإجانة على السوال** نضع عنوانا لكل عنصر… **آلة عمل لاريم**… **نمر-لعمر مطلوب** » | « عند الإجابة عن السؤال نضع عنواناً لكل عنصر… آلية عمل الإنزيم… نمرّر للعنوان المطلوب » |
| `:1029` | « **تفنع عأيهد فسلن لس مهاود سر ته دفيديبافايد اد اعزما بمن الاعتبار:** … » | « ينبغي أن نأخذ في الحسبان أنّ في الإجابة عن كل موضوع معلومات رئيسية ومعلومات ثانوية… » |
| `:76` (= `okacha.ts:60`) | « **غاد منه املية علي اللفة لورية بن ال»اع٨ و د٩ا٩«…** » | **non corrigeable par déduction** → réextraction de la page source obligatoire |
| `:130` | « **يفايي فاد اطمي في ود فنففأ، ٥ اشه ١ي٤عب٢ دبئ ودش** » | idem (illisible) |
| `:219` | « **ب- شو ثالع نجية: و هذه الالذ بمدا قمتا شحليل للمطيات افحيية والقطما الفحرن ت٢٢،** » | idem |

### 4.3 Volumétrie mesurée

- 9 sections méthodo affichées : `intro`, `hikala`, `tamarin1`, `tahil`, `tafsir`, `mouqarana`, `istinj`, `istidlal`, `nasiha` — **titres فصحى ✔**.
- **401 blocs** de texte → **86 blocs (≈ 21 %)** contiennent au moins une forme non-arabe (répétition ≥3 lettres, chiffre collé dans un mot, ponctuation intruse) ; **7 blocs sont massivement corrompus / illisibles**.
- Corollaire : la rubrique ne peut pas être déclarée « arabe 100 % » tant que ces 86 blocs ne sont pas repris (le texte officiel `hosila.ts` couvre les 10 unités mais **pas** la méthodologie).


---

## 5. F4 — Points de typographie / terminologie (non bloquants, mais « arabe 100 % » les exige)

| Défaut mesuré | Occurrences | Correction فصحى |
|---|---|---|
| « **المصطلح المفتاح** للبكالوريا » (nom employé comme adjectif) | **25** | « **المصطلح المفتاحي في البكالوريا** » |
| « مُعاد بناؤه **آليا** » / « أخطاء **آليا** » (tanwīn non écrit) | **17** | « **آلياً** » |
| « **وحدة : D1-U1** » (espace + deux-points à la française dans une phrase arabe) | **11** | « **الوحدة: D1-U1** » (ou « الوحدة الأولى — D1-U1 ») |
| « موقع الترجمة عند **بدائيات النواة** » / « عند **الحقيقيات** » | 3 + 1 | « عند **بدائيات النوى** » / « عند **حقيقيات النوى** » |
| « **منهاج تحصيلي** » alors que le reste du corpus dit « مخطط تحصيلي » | 3 | unifier : « **مخطط تحصيلي** » |
| « **OCR** » (abrégé latin) dans une phrase arabe | 13 | « **الاستخراج الآلي** / النسخة الممسوحة ضوئياً** » |
| `hosila.ts` : « مما **يسرع** من عملية الاستنساخ » | 1 | « مما **يسرّع**… » — ⚠️ **texte officiel verbatim** : correction à valider (la règle projet R3 interdit de retoucher le texte du livre) |

---

## 6. Ce qui est déjà conforme (à ne pas casser)

- `src/data/hosila.ts` (488 blocs) : **arabe scientifique فصحى**, aligné sur le manuel ; couvre **10 unités** `d1u1 → d3u3` (71 points).
- Libellés de l'onglet : « الحصيلة المعرفية — كل ما يجب حفظه », « وضع الحفظ », « اختبار الكتاب », « المنهجية (عكاشة) »… : **فصحى**.
- Titres des 9 sections méthodo : « مقدمة المنهجية — قواعد العمل », « هيكلة الموضوع », « التمرين الأول », « التحليل », « التفسير », « المقارنة », « الاستنتاج », « الاستدلال العلمي ومعاييره », « نصائح المراجعة والتحضير » : **فصحى**.
- Zones 🏛 de `phase2`, `phase3`, `phase4` pour la **structure** : balises correctes (le défaut y est uniquement F2/F4).

---

## 7. Correctif structurel prêt à appliquer (F1) — patch mécanique, 8 fichiers

Remplacement **ligne à ligne** (aucune logique modifiée, aucun texte scientifique touché) :

| Fichier | Ligne | Contenu actuel | Contenu corrigé |
|---|---|---|---|
| `phase7_chapitres_13_14.html` | 638 | `<section class="card-hosila"` | `<section class="card-hosila" id="hosila">` |
| | 641 | `<section class="card-schema"` | `<section class="card-schema" id="schema-synthese">` |
| | 665 | `id="hosila">` | *(supprimer la ligne)* |
| | 674 | `id="schema-synthese">` | *(supprimer la ligne)* |
| `phase10_chapitres_19_20.html` | 613 | `<section class="card"` | *(supprimer — balise fantôme)* |
| | 616 | `<section class="card"` | *(supprimer — balise fantôme)* |
| | 640 | `id="hosila" style="border:2px solid #f59e0b;">` | `<section class="card-hosila" id="hosila">` |
| | 659 | `id="schema-synthese" style="border:2px solid #2563eb;">` | `<section class="card-schema" id="schema-synthese">` |
| `phase12_chapitres_23_24.html` | 606 / 630 | idem | idem |
| `phase14_chapitres_27_28.html` | 609 / 633 | idem | idem |
| `phase15_chapitres_29_30.html` | 613 / 637 | idem | idem |
| `phase18_chapitres_35_36.html` | 599 / 623 | idem | idem |
| `phase20_chapitres_39_40.html` | 607, 610 / 634, 652 | idem | idem |
| `phase22_chapitres_43_44.html` | 624, 627 / 651, 666 | idem | idem |

Contrôle après correction : `<section` = `</section>` par fichier, **0 texte orphelin** `id="…">`, ancres `#hosila` / `#schema-synthese` de nouveau fonctionnelles (nav « 🏛 حصيلة » / « 🗺 مخطط »).

---

## 8. Plan d'application & validation (à exécuter sur autorisation)

1. **F1** : appliquer le patch structurel ci-dessus (8 fichiers de contenu) → relancer `npx vitest run src/data/resumes.lock.test.ts src/data/lessonSplitSynthese.test.ts`.
2. **F2** : convertir/déplacer les notes de production (13 lignes) → relancer les mêmes verrous + relecture visuelle de la carte 🏛.
3. **F3** : reprendre les 86 blocs méthodo à la source (`src/data/okacha.ts`) → régénérer `src/data/okachaEnriched.ts` (`npx tsx scripts/enrich_okacha.ts`) → relancer `src/data/okachaEnriched.lock.test.ts` + `src/components/__tests__/OkachaView.test.tsx`. Les 7 blocs illisibles exigent une **ré-extraction de la page du cahier** ; l'occasion : décider du sort de la méthodologie dans la rubrique (re-transcription فصحى ou déplacement sous « ملاحظات الأستاذ »).
4. **F4** : passe typographique ciblée (26 remplacements `المصطلح المفتاح` → `المصطلح المفتاحي`, 17 × `آليا` → `آلياً`, 11 × `وحدة :` → `الوحدة:`…).
5. **Garde-fou proposé** (à cadrer) : brancher sur les zones de la rubrique un contrôle de non-régression « arabe 100 % » réutilisant l'existant — `detecterRegistre()` (`src/lib/validation/darijaClassifier.ts`) pour la darija + une règle « aucune séquence latine hors `<span class="ltr-seq">` / symboles scientifiques » — afin qu'aucun patch ne puisse réintroduire de darija, de latin ou de balise tronquée.

---

## 9. Conclusion de l'audit

| | |
|---|---|
| **Symptôme déclaré** | « arabe mélangé avec el darija » dans الحصيلة المعرفية |
| **Cause n° 1 (visible partout)** | HTML cassé par un patch : le texte `id="hosila" style="border:2px solid #f59e0b;">` s'imprime **en latin au milieu de l'arabe** dans 8 leçons |
| **Cause n° 2** | notes de production en français/anglais laissées dans la carte élève (13 lignes, dont 2 phrases entièrement françaises) |
| **Cause n° 3 (vraie darija)** | méthodologie « عكاشة » : « **لاكا بصح** » + 86 blocs d'arabe corrompu (dont 7 illisibles) affichés dans l'onglet |
| **Part déjà propre** | نصّ الكتاب الرسمي (`hosila.ts`) et tous les libellés UI : **فصحى** |

**Aucune correction n'a été appliquée** (consigne « sans code »). Sélectionner le lot à appliquer pour lancer la correction.

> **Mise à jour post-correction (2026-09-24, même session)** — voir §10.

---

## 10. Résultats après application (2026-09-24)

Les lots F1/F2/F4 (HTML des leçons) et F3 (dictionnaire OCR de la méthodologie) ont été appliqués et validés.

### 10.1 Corrections appliquées

| Lot | Fichier(s) | Détail |
|---|---|---|
| F1/F2/F4 | `public/lessons/*.html` (25 fichiers) | ids `hosila`/`schema-synthese` réparés sur la même balise, balises fantômes supprimées, notes de production déplacées hors carte élève ; terminologie livre : **بدائيات النواة → أوليات النواة**, **عند الحقيقيات → عند حقيقيات النواة** ; effets de bord corrigés (`آلياًت`→`آليات`, `مُعاد بناؤه آليا`→`آلياً`) |
| F3a | `scripts/enrich_okacha.ts` → FIXES v2 | ~86 corrections فصحى (dont darija « لاكا بصح… » → phrase فصحى complète) + ~30 retraits de résidus 100 % illisibles (valeur vide, **aucun sens inventé**) ; dont `'فاتارز' → ''` (résidu de `okacha.ts:1669`) |
| F3b | `scripts/enrich_okacha.ts` → `nettoieBlocs()` | **nouvelle étape 6 du pipeline** : après `applyFixes`/`filtreOcrBlocs`, trim + retrait des blocs vides (tous kinds) + promotion titre des restes `< 20` finissant par `:` + recollage Pass C des restes courts. Trace : `ENRICH_STATS.blocsRetiresPostFix` (= **9** : 4 vides + «فاتارز» + recollages) |
| Verrou | `src/data/resumes.lock.test.ts` | marqueurs de texte mis à jour (أوليات النواة, آلياً) |

### 10.2 Validation (tout vert)

| Contrôle | Résultat |
|---|---|
| `okachaEnriched.lock` + `okacha.lock` + `hosila.lock` + `OkachaView.test` | **39/39 ✔** (avant correctif : 1 échec — `d1u1/texte` longueur 0) |
| `resumes.lock` + `lessonSplitSynthese` + `leconSource.lock` | **50/50 ✔** |
| `npx tsc --noEmit` | **0 erreur** |
| `tmp_verify_arabe` (structure rubrique) | **0 problème structurel**, 4 lignes latines restantes = termes scientifiques (ADN, ARNm…) **voulus** |
| Orphelins / blocs vides dans `okachaEnriched.ts` | **0 / 0** |
| Sections méthodo | 9 sections, toutes ≥ 3 blocs : `intro(10) hikala(7) tamarin1(118) tahil(56) tafsir(32) mouqarana(7) istinj(63) istidlal(19) nasiha(83)` |
| Stats régénérées | 210 fragments recollés · 317 rattrapages · 86 corrections · 19 retraits OCR · 9 blocs retirés post-fix · 58 points |

### 10.3 Reste ouvert (documenté, non bloquant)

- Les **~86 blocs méthodo** restants à forme non-arabe (§4.3) sont pour la plupart désormais corrigés ou épurés via FIXES v2 ; les **résidus non corrigeables par déduction** (7 blocs 100 % illisibles de §4.3, ex. `okacha.ts:60`) ont été **retirés** (famille B) — une ré-extraction de la page du cahier reste la seule façon de les restituer.
- §5 (F4) : uniformisations restantes à valider par l'enseignant (« المصطلح المفتاحي », « OCR » → « الاستخراج الآلي », « يسرع » du texte officiel verrouillé).


