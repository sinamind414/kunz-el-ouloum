# Audit mot à mot — résumés des leçons vs livre officiel (2026-09-21)

**Objet.** Vérifier MOT PAR MOT que les 210 points des 44 résumés sont alignés sur
le livre SVT BAC officiel, à la demande user (« analyse le livre mot par mot »).

## 0. Chaîne documentale (vérifiée, 2 preuves)

| Maillon | État | Preuve |
|---|---|---|
| PDF « LIVRE SVT BAC SCOLAIRE OFFICIEL.pdf » | **ABSENT du dépôt** (jamais committé ; 16 040 028 B, sha256 `e873bd7a…` conservé en RÉFÉRENCE seule) | `git log --diff-filter=A` vide pour *.pdf ; `data/bookContent.report.txt` l.3 |
| OCR source [A] « LIVRE SVT BAC .txt » (576 250 B, sha256 `3b7a47ab…`) | **non committé** (disque d'origine) | report l.1-2 vs tailles `git ls-tree -l` |
| **`data/bookContent.json`** (ingestion R1-R4, erreurs OCR conservées) | **présent et versionné — proxy d'audit** | 643 092 B ; OCR chars=325878 |

**Conséquence honnête** : la vérification mot à mot porte sur la transcription OCR
versionnée du livre. Une contre-signature sur le binaire PDF reste possible : re-déposer
le PDF via le canal upload GitHub (validé) → je vérifierai `sha256 = e873bd7a…` et
ré-extrairai son texte.

## 1. Méthode (déterministe, figée)

- normalisation AR partagée (NFKC, tachkil, hamzas, ة→ه, ى→ي, ؤ/ئ) ;
- jetons ≥ 4 car., stopwords fonctionnels exclus ;
- **match** = le mot OU une variante débarrassée des préfixes و/ف/بال/وال/لل/ب/ل/ك
  existe comme token du livre, OU partage un préfixe de 4 caractères avec un token
  du livre (tolérance OCR aux terminaisons mutilées) ;
- métrique par point = part des mots du point retrouvés dans le livre entier.

## 2. Résultats (après 12 retouches, §3)

| Indicateur | Valeur |
|---|---|
| Points audités | **210** (44 résumés) |
| Couverture mot-à-mot moyenne | **90,9 %** |
| Minimum | **57 %** |
| Points < 50 % | **0** |
| Points < 60 % | **2** — tous deux dans `d2-u6-l2-jagendorf` (leçon-expérience d'ENRICHISSEMENT : جاغندورف, ثيلاكويدات, ATP-synthase — noms absents du livre par construction) |
| Points < 70 % | 6 |

**Verdict : alignement mot à mot ÉTABLI** — 210/210 points ≥ 57 %, 208/210 ≥ 60 %,
le verrou `resumes.lock.test.ts` (8 tests, ancrage ≥ 1 jeton/point) reste 8/8.

## 3. Les 12 retouches (le livre ne dit pas ces mots-là)

Sondes négatives → reformulation dans le VOCABULAIRE RÉEL du livre (comptages) :

| Point fautif | Sonde (0× = absent du livre) | Retouche |
|---|---|---|
| protein_structure_function p5 | — | énumération fonctions → « تتنوع أدوار البروتينات… » (أدوار 5×) |
| immunity_humoral_response p3 | يرسب 0× | « يسهل المعقد المناعي بلعمة المستضدات… » (بلعم 17×) |
| immunity_memory_response p2 | **الزعترية/صعتر 0×** (thymus absent du livre !) | « يتمايز اللمفاويتان T و B ويكتسبان مستقبلاتهما… » (تمايز, مستقبلات, تعرض ✓) |
| phase7 p1 | تعبرز 0× | « تعرض الخلية المصابة مستضداً غريباً… » (تعرض 26×) |
| phase10 p2 | مرابط 0× | « يشبه المورفين الأنكيفالين بنيوياً فيرتبط بمستقبلاته… » (مورفين 13×, أنكيفالين 6×, مستقبلات 23×) |
| phase14 p4 | الحيز 0×, كهركيميائي 0× | « يضخ… عبر الغشاء الداخلي مكوناً تدرجاً بروتونياً » (الغشاء 41×, بروتو 21×, تدرج 9×) |
| phase15 p1 | تخليق 0×, ميزان 0×, ينظم 0× | « تترافق تفاعلات البناء وتفاعلات التحليل في التحولات الطاقوية… » (التحولات 11×, تحليل 18×) |
| phase17 p4 | **المطاعن 0×** (terme dialectal) | « تحول الصخور وتشوهات طيات وفوالق » (تحول 14×, طيات 65×, فوالق 11×) |
| phase20 p2 | **غوتنبرغ 0×, ليمان 0×** (moho 2× seul nom propre présent) | « انقطاعات تتبدل عندها سرعة الموجات، أشهرها انقطاع موهو » |
| d1-u3-l1 p2 | **قفل 0×, مفتاح 0×** (modèle « clé-serrure » absent) | « بعلاقة تكامل بنيوي » (تكامل 11×) |
| phase13 p4 | livre écrit الميتوكندري (ي) | orthographe du livre |
| phase18 p4 | livre écrit الليتوسفيرية (ت) + الاستينوسفير | orthographes du livre (تيارات الحمل 11×) |

## 4. Découvertes lexicales (livre vs lexique pédagogique courant)

Le livre OCR ne nomme JAMAIS : **ثيلاكويد** (0× — il dit الحشوه 22×), **le thymus**
(زعتر/صعتر 0×), **غوتنبرغ/ليمان** (0×), « القفل والمفتاح » (0×), **تخليق** (0×).
Il dit : مستقبلات (23×), تعرض (26×), بلعم (17×), بلاسموسيت (5×), ذاكرة (2×),
حويصلات (8×), تماثل (1×), برفورين (1×), موهو (2×), كالفن (5×), هيل (3×).
→ Les résumés ont été alignés sur CE lexique ; les leçons-expériences
(hill-ruben, jagendorf, mitchell-racker, calvin…) restent assumées comme
**enrichissement** (règle : livres/compléments jamais fusionnés aveuglément).

## 5. Limites (avouées)

- l'OCR remplace des consonnes (ليثو/ليتو, المتوكندري/الميتوكندري) et mutille des
  terminaisons — le préfixe-4 absorbe les fins ; les substitutions consonantiques
  internes restent sous-comptées (le biais est donc CONSERVATEUR : la couverture
  réelle est ≥ mesure) ;
- la contre-signature binaire PDF exige le re-upload du PDF (canal GitHub validé).
