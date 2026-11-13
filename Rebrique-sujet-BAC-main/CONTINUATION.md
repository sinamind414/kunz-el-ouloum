# Continuation Brief — مفتاح الكنز (Rebrique-sujet-BAC)

Session branch: `arena/01a08ed2-rebrique-sujet-bac` (this document is continued on `arena/01a096cc-rebrique-sujet-bac`)
Last commit message: `fix: critical data-loss, timer, scoring and HTTP range bugs (batch 3)`
Test status at handoff: **256 pass / 0 fail / 1 skipped** (`npm test`).
PWA build id: `f54ac619b7a2` (stale as soon as any source file changes — regenerate with `npm run pwa:version`).
Production build: `dist/site` 136 files, standalone `dist/boussole-4d-standalone.html` 1.80 MB (reproducible sha256).

> **2026-09-23 (nuit) — SE 2019 : Phases 3 à 6 du plan `PLAN_SE_2013_2020` appliquées.**
> Branche de session `arena/01a0cebc-rebrique-sujet-bac`, base `fcd2a90`.
>
> - **17 consignes `official` recopiées mot à mot sur l'image des 9 pages**
>   (`docs/RELECTURE_SE_2019_CHECKLIST.md`, deux passes du même jour) et **7
>   cadrages `reconstructed`** assumés avec note datée. `data/years/se/year-2019.js`
>   n'est pas retouché : il est **réécrit** — les six exercices portaient d'autres
>   thèmes que les pages imprimées (مغماتية الظهرة au lieu de « الاستنساخ »,
>   GO أنزيم au lieu du « الموقع الفعال », immunité antitumorale au lieu de la
>   « المناعة النوعية », Andes/بركان au lieu du « كمون العمل », DDT/canaux au lieu
>   de la « التنفس », Rifamycine au lieu de la tectonique). `bacPrompt`, `desc`,
>   `label`, réponses modèles et règles pôle sont remplacés pôle par pôle.
> - **Texte lu sur image, jamais sur la couche texte** : le tableau DDT a été
>   relevé à la main (0, 1, 1,5, 2, 2,5, 3,5, 4, 4,5, 5 ms ; −70 → +30 à 2 ms →
>   −70, et +25 maintenu avec DDT), les légendes 1-8 des deux schémas
>   (ظهرة/برنس/بيريدوتيت ; قشرة قارية/جيب صهاري/خندق/أستينوسفير) vérifiées sur
>   bandes zoomées. La couche texte de 2019 est inutilisable : elle a déjà menti
>   sur les chiffres ailleurs, elle n'a servi qu'à confirmer des numéros de page.
> - **Généré** : `inventory:generate` → 58 sujets / 576 tâches / **294 consignes
>   officielles** / 282 reconstruites / 294 pages rattachées / **0/58 `complete`** ;
>   `calibration:update` → `activePoles` **277 → 294** (corpusSha256 mis à jour).
> - **Gardes** : `tests/se-2019-recopy.test.mjs` (8 tests) fige les 17 textes, les
>   pages 1-9, les dates, les sept cadrages sans page, le barème 5/7/8, les
>   regroupements de phrases imprimées et les thèmes réels ; `tests/archive-years.test.mjs`
>   restreint sa règle « tout `reconstructed` » à 2013-2018 et exige pour 2019 et
>   2020 une page, une date ISO et une note citant la checklist par pôle officiel.
> - **Mesures** : `npm test` → **404 tests** (README régénéré) ; `p1:check` **reste
>   rouge** (0/58 inventaires complets, 0/4410 copies) — attendu ; `p2:check` 6/7,
>   `p3:check` 6/6. **Un garde a dû être ajusté, pas retiré** : le budget de 3 Mo du
>   monofichier était une approximation de « pas de PDF tiers » devenue fausse par
>   accumulation légitime de contenu certifié (+16 Ko pour 2019). Il passe à 4 Mo
>   (~1 Mo de marge quand le plus petit PDF du dépôt pèse 1,07 Mo) et l'invariant
>   réel est désormais testé directement : aucun `%PDF-` ni `JVBERi0` (base64) dans
>   le fichier.
> - **Suite du chantier** : 2016 et 2015, puis 2013 et 2014, puis 2017 et 2018 —
>   ordre du plan, inchangé. Phase 1 (checklist image) avant toute donnée.

> **2026-09-24 — SE 2016 : Phase 1 du plan faite (checklist image).**
> Branche `arena/01a0cebc-rebrique-sujet-bac`.
>
> - Nouveau `docs/RELECTURE_SE_2016_CHECKLIST.md` : les **10 pages** du livret
>   lues sur image à 2× puis bandes de consignes zoomées (×1,8 à ×3,0), deux
>   passes le même jour, **aucune page non vue**. **60 consignes imprimées**
>   relevées ; **18 pôles `official` proposés** (3 par exercice : S, E, W, avec
>   les regroupements écrits) et **6 pôles de cadrage `reconstructed`** (aucun
>   exercice de 2016 n'imprime de question de cadrage).
> - **Écart de barème trouvé** : les titres imprimés annoncent **07 points** pour
>   le 3ᵉ exercice des **deux** sujets, alors que `data/years/se/year-2016.js`
>   porte **8**. Les deux sujets valent **20 pts** (6+7+7). À corriger en Phase 3
>   avec la somme des pôles.
> - **Même constat qu'en 2019** : les six exercices encodés portent un thème
>   générique qui n'est pas celui des pages — S1-E1 = مورثة وتعبيرها/Anagène
>   (et non « الاستنساخ »), S1-E2 = الخلية اللمفاوية (س), S1-E3 = إنتاج الـ
>   ATP/تيلاكوئيد (et non la المناعة الخلطية), S2-E1 = الأميلاز/Glucobay,
>   S2-E2 = التحول الطاقوي/ATP synthase, S2-E3 = المشبك المثبط/الـ BZD (et non
>   la بنية الكرة الأرضية). Les `bacPrompt` actuels sont tous du type « حلّل أو
>   استخرج من الوثيقة المعطيات المرتبطة بـ … ».
> - **Aucune donnée touchée** : `data/**` et les inventaires sont inchangés,
>   les 24 pôles 2016 restent `reconstructed`, `p1:check` inchangé.
> - Suite : **Phase 3 de 2016** (réécriture des six exercices + correction des
>   `max`), puis Phases 4 à 6, puis 2015.
>
> **2026-09-24 — SE 2016 : Phases 2 à 6 du plan appliquées.** Branche
> `arena/01a0cebc-rebrique-sujet-bac`, base `968f209`.
>
> - **18 consignes `official` recopiées mot à mot sur l'image des 10 pages**
>   (recopie revérifiée le 2026-09-24 sur les pages rendues à nouveau et sur
>   bandes zoomées ×2,4) et **6 pôles N `reconstructed`** avec note datée.
>   `data/years/se/year-2016.js` est **réécrit** : les six exercices portaient
>   d'autres thèmes que les pages (S1-E1 « الاستنساخ داخل النواة » au lieu de
>   مورثة وتعبيرها/Anagène ; S2-E3 « بنية الكرة الأرضية » au lieu du
>   المشبك المثبط/الـ BZD, etc.).
> - **Barème imprimé corrigé** : `التمرين الثالث: (07 نقاط)` sur les deux
>   sujets, S1-E3 et S2-E3 passent de **8 à 7** points (les deux sujets valent
>   20 pts). Répartition N/S/E/W : 1/1/2/2, 1/2,5/2,5/1, 0,5/2/3/1,5 sur le
>   sujet 1 ; 1/1/2/2, 1/2,5/2,5/1, 0,5/2/3/1,5 sur le sujet 2 — chaque somme
>   égale le total imprimé.
> - **La relecture d'encodage a corrigé la checklist** (écrit dans son journal) :
>   pôle S de S1-E2 imprimé **p.3** (et non p.2) et la consigne
>   `2- ب- اشرح نشاط الخلية (س)…` rattachée au lieu d'être « non mappée » ;
>   les consignes `1-` et `2- أ/ب` de S1-E3 imprimées **p.4** (et non p.5) ;
>   première consigne du pôle E de S2-E1 imprimée **p.6** (et non p.7). Les deux
>   fragments laissés en « 2- … » et « 3- … » ont été lus et recopiés.
> - **Généré** : `inventory:generate` → 58 sujets / 576 tâches / **312 consignes
>   officielles** / 264 reconstruites / **312 pages rattachées** / **0/58
>   `complete`** ; `calibration:update` → `activePoles` **294 → 312**.
> - **Gardes** : `tests/se-2016-recopy.test.mjs` (8 tests : textes, pages,
>   dates, thèmes réels, barème 6/7/7, six cadrages, regroupements, décalage du
>   sujet 2) ; `tests/archive-years.test.mjs` déplace 2016 dans la liste
>   certifiée (page de livret 1-10, date 2026-09-24, note citant la checklist) et
>   laisse 2013-2015 + 2017-2018 sous la règle « tout `reconstructed` ». Deux
>   dénominateurs de garde suivent le réel : 294 → 312 consignes rattachées et
>   4410 → 4680 copies exigées (15 par pôle officiel). **Aucun critère assoupli.**
> - **Mesures** : `npm test` → **412 tests, 0 échec, 1 skip** ; `p1:check` **reste
>   rouge** (0/58 inventaires complets, 0/4680 copies) — attendu ; `p2:check`
>   6/7, `p3:check` 6/6.
> - Suite : **2015** (checklist image d'abord, Phases 1 → 6), puis 2013-2014,
>   puis 2017-2018 — ordre du plan, inchangé.

> **2026-09-23 (nuit) — SE 2019 : Phase 1 du plan faite (checklist image).**
> Branche `arena/01a0cebc-rebrique-sujet-bac`.
>
> - Nouveau `docs/RELECTURE_SE_2019_CHECKLIST.md` : les **9 pages** du livret
>   lues sur image à 2× (puis bandes de consignes zoomées ×1,7 à ×2,6), deux
>   passes le même jour, **aucune page non vue**. Barèmes imprimés **5/7/8**
>   confirmés pour les deux sujets (`(05 نقاط)` / `(07 نقاط)` / `(08 نقاط)`).
> - **17 consignes `official`** proposées sur 24 pôles (5 pour S1-E2 qui porte
>   aussi la question de cadrage imprimée), **7 cadrages `reconstructed`**.
> - **Constat majeur** : les **six** exercices encodés aujourd'hui portent un
>   thème qui n'est pas celui de la page — S1-E1 = مغماتية مرتبطة بالظهرة (et
>   non « الاستنساخ »), S1-E2 = أنزيم غلوكوز أكسيداز GO, S1-E3 = immunité
>   antitumorale (LT8/CD8, TIL, IL2), S2-E1 = Andes/بركان انفجاري, S2-E2 =
>   DDT et canaux voltage-dépendants, S2-E3 = Rifamycine et niveaux d'action
>   des antibiotiques. La Phase 3 devra **remplacer** `bacPrompt`, `desc`,
>   `label`, réponses modèles et règles pôle par pôle.
> - **Aucune donnée touchée** (Phase 1 = document seul) : `data/**` inchangé,
>   les 24 pôles 2019 restent `reconstructed`, `p1:check` inchangé.
> - Suite : **Phase 3 de 2019** (encodage depuis la checklist) puis Phases 4-6.

> **2026-09-23 (soir) — SE 2020 : Phase 3 du plan `PLAN_SE_2013_2020` appliquée.**
> Branche de session `arena/01a0cebc-rebrique-sujet-bac`, base `93706ee` (= `main`).
>
> - **17 consignes `official` recopiées mot à mot sur l'image des 9 pages**
>   (`docs/RELECTURE_SE_2020_CHECKLIST.md`, deux passes du même jour), **7
>   cadrages `reconstructed`** assumés avec note datée. `data/years/se/year-2020.js`
>   réordonné selon les pages : la question d'hypothèse de S1-E3 et de S2-E3
>   repart sur le pôle S, l'analyse du tableau Her2 et le « حل » GABA montent
>   sur E, les deux نص علمي passent sur W (voir le journal de la checklist).
> - **Données servies corrigées** : `600` au lieu de `655` (tableau Her2, la
>   couche texte mentait), CI50 `10`/`9` au lieu de `15`/`9,5`, « من 01 إلى 06 »
>   au lieu de « من 1 إلى 11 », « الجدول الشكل (أ) » (conflation) supprimé,
>   préfixes `خلاصة` disparus. Les réponses modèles restent des aides.
> - **Généré** : `inventory:generate` → 58 sujets / 576 tâches / **277 consignes
>   officielles** / 299 reconstruites / 277 pages rattachées / **0/58 `complete`** ;
>   `activePoles` et `data/calibration-status.js` **inchangés** (277). *(Mesure
>   datée : la Phase 3 de SE 2019, même date, porte ensuite le total à **294**
>   consignes officielles / 282 reconstruites / 294 pages.)*
> - **Gardes** : `tests/data-integrity.test.mjs` refuse désormais un préfixe
>   `خلاصة`/`الخاتمة`, des parenthèses vides, « أنزيم وأنزيم » et une consigne
>   officielle recopiée sur deux années/exercices (deux paires de formules
>   passe-partout de 2024 et 2026 sont nommées, pages distinctes). Nouveau
>   `tests/se-2020-recopy.test.mjs` (8 tests) : textes, pages, barèmes 5/7/8,
>   600, regroupements notés, inventaires `partial`.
> - **Mesures** : `npm test` → **395 tests** au moment du chantier (README
>   régénéré ; **404** après la Phase 3 de SE 2019) ; `p1:check` **reste rouge**
>   (0/58 inventaires complets, 0/4155 copies à cette date, 0/4410 après 2019) — attendu ;
>   `p2:check` 6/7, `p3:check` 6/6.
> - **Suite du chantier** : 2019 (checklist image → Phases 2-6), puis 2016/2015,
>   puis 2013/2014, puis 2017/2018 — ordre du plan, inchangé.

> **2026-09-23 — état vérifié après le merge de la PR #30** (branche de session
> `arena/01a0cebc-rebrique-sujet-bac`, base `93706ee` = `origin/main`, merge de #30 à
> 13:37:56Z ; CI « Quality » **verte sur `main`** au run 13:38:01Z). Mesures relancées
> localement sur ce SHA, pas recopiées d'un rapport :
>
> - `npm test` → **385 tests (384 pass / 0 fail / 1 skip)** ; `lint`, `typecheck`,
>   `format:check`, `docs:check`, `calibration:check`, `inventory:check`, `p3:check`,
>   `rights:check`, `impact:check` : **tous verts**.
> - `npm run p1:status` → **3/6** (P1.1, P1.2, P1.5 bloqués) ; `p2:status` → **6/7**
>   (P2.7 : 0/5 élèves) ; `p3:status` → **6/6** ; `coverage:official` → 58 sujets
>   éligibles, 0 inventaire invalide ; `pdftext:status` → **50 sujets `propre`,
>   8 `indéterminé`**, 0 `scan` (les couches logiques 450 dpi ont été reconstruites).
> - **Pôles `official` : 277 / 576** (M : 175 sur 240 ; SE : 102 sur 336). Répartition
>   mesurée par import des `data/years/**` :
>   **SE 2013→2019 = 0/24 chacun** ; SE 2020 = 17 ; 2021 = 16 ; 2022 = 14 ; 2023 = 14 ;
>   2024 = 8 ; 2025 = 16 ; 2026 = 17. Maths : 9 à 14 sur 16 selon l'année.
>   Ce total reste la valeur verrouillée par `tests/official-inventory-integrity.test.mjs:172`
>   — portée à **294** le 2026-09-23 par la Phase 3 de SE 2019 (voir le bloc de
>   tête), la valeur 277 ci-dessus restant la mesure datée de l'après-PR #30.
> - **Chantier en cours — `docs/PLAN_SE_2013_2020.md`.** Phase 1 faite pour **SE 2020**
>   (`docs/RELECTURE_SE_2020_CHECKLIST.md`, 9 pages lues deux fois sur image ; 17 pôles
>   `official` proposés mot à mot, 7 cadrages laissés `reconstructed` ; barèmes imprimés
>   5/7/8 confirmés). **Phase 3 non faite** : `data/years/se/year-2020.js` porte encore
>   les divergences listées par la checklist (préfixes `خلاصة`, questions tronquées
>   « اقترح حلا. », question d'hypothèse placée sur S1-E3/N au lieu de S, S2-E2 E/W à
>   permuter, S2-E3 à regrouper). Rien de `data/` n'a été touché par la PR #30.
> - **Ordre de reprise du plan** (inchangé) : 2020 (Phase 3) → 2019 → 2016/2015 →
>   2013/2014 → 2017/2018, puis régénération, gardes (Phase 5), décompte (Phase 6).
>   `npm run p1:status` **doit rester rouge** : un inventaire `partial` n'est pas une preuve.
> - **En attente du propriétaire** : (a) fermeture du ticket **#13** — obsolète, la CI
>   tourne bien sur `main`, mais l'App GitHub de la session n'a pas `issues:write` ;
>   (b) arbitrage juridique des PDF (`docs/rights/request-dossier.md` et
>   `docs/rights/external-links-impact.md` prêts, décision non prise) ; (c) 5 élèves
>   réels pour P2.7 ; (d) `travail 4` de `PROMPT_DECISIONS_PROPRIETAIRE.md` (cases
>   encore vides) si le propriétaire veut fournir des transcriptions lui-même.
> - **Hygiène CI** : `.github/workflows/fetch-clean-pdf.yml` (one-shot) est encore sur
>   `main` avec un trigger `push` sur la branche **mergée** `arena/01a0c9d4-…` ; il ne
>   sert plus. À supprimer ou convertir en `workflow_dispatch` au prochain lot OCR en CI.

> **2026-09-16 — état courant de la session** (branche `arena/01a09be6-rebrique-sujet-bac`,
> PR **#26** OPEN — ne pas merger sans consigne du propriétaire ; tête `2e44da9`, suivie du présent
> bandeau ; commits poussés ce jour : `5b9e947`, `0b2ec31`, `ad26660`, `71b0cf7`, `0afdee4`,
> `185c42c`, `2e44da9`, puis ce commit — CI « Quality » verte sur chaque push).
>
> - **Mesures :** `npm test` → **365 (364 pass / 1 skip)** ; 28 sessions encodées (14 maths, 14 sciences) ;
>   54 inventaires ; **253 pôles `official`** (95 SE + 158 M) = `CALIBRATION_STATUS.activePoles`,
>   **232/253** consignes rattachées à une page du fichier ; build `509a7a7cf435`, standalone 3024 KB
>   (sha `b604a50e82fd`), release 135 fichiers sha256 `c2c4068becd2…`.
> - **Backlog d'analyse (`ANALYSE_LIGNE_PAR_LIGNE.md`) : §10.1 entièrement fermé sauf l'arbitrage
>   juridique des PDF (S3.8, décision propriétaire).** S2.5 (binaural) est verrouillé par
>   `tests/sound-engine.test.mjs` — seule l'écoute réelle Safari reste due ; S2.6 (ordre de création
>   de `#toast-zone`) est corrigé (`ensureToastZone()`) et verrouillé par `tests/toast-zone.test.mjs`.
>   Les tableaux §6 et §4 portent désormais le renvoi « → §10.1 » promis par la bannière du rapport.
> - **Contenus — SE-2021 :** les dix pages ont été relues en image ; deux consignes recopiées
>   (sujet 1 exercice 3, sujet 2 exercice 3 « مقر ودور … للإحساس بالألم ») sont recalées et
>   verrouillées par `tests/se-2021-recopy.test.mjs`. La couche texte du même PDF écrit `ثالث` là où
>   l'image imprime `ثلاث فرضيات` : continuer à recopier sur l'image, jamais sur la couche.
>   L'année reste en **copie libre**.
> - **Contenus — SE-2024 :** les deux scans sont image seule ; les pages 1, 3, 4 et 5 (sujet 1)
>   puis 8 et 9 (sujet 2) ont été relues le 2026-09-16, et les pages 6, 7 et 10, d'abord transcrites
>   sur photos le 2026-08-31, ont été contrôlées sur le scan le même jour. **17 pôles sur 24** sont
>   `official` (sujet 1 : ex1 S/E p.1 ; ex2 S/E p.2 + W p.3 ; ex3 N p.3, S p.4, E/W p.5 — sujet 2 :
>   ex1 S/E p.6 ; ex2 S/E p.7 + W p.8 ; ex3 S p.9, E/W p.10). Sept pôles de cadrage (N/W) restent
>   `reconstructed` : aucune question imprimée. Deux corrections trouvées en relisant les images :
>   S2-E2 E sans « في الأوراق » et S2-E3 W avec « المدروسة » (et non « الخلطية »).
>   `tests/se-2024-recopy.test.mjs` (**12 tests**) verrouille les citations, les pages, le rattachement
>   d'inventaire et les notes datées ; `docs/RELECTURE_2024_CHECKLIST.md` tient le tableau page-à-page.
>   Aucun corrigé local : les réponses modèles sont rédigées d'après les documents, sans correction
>   officielle revendiquée. **Reste à faire sur ce chantier :** les mêmes relectures pour SE-2025 et
>   SE-2026 (PDF image seule eux aussi).
> - **Décisions en attente du propriétaire :** (a) redistribuer ou non les 41,1 Mo de PDF dans
>   `dist/site` ; (b) passer SE-2021 en mode BAC chiffré ou la garder en copie libre ; (c) ouvrir ou non
>   les archives SE 2013-2019 à des consignes `official` (elles sont aujourd'hui verrouillées
>   `reconstructed` par `tests/archive-years.test.mjs`, alors que les PDF officiels sont dans le dépôt).

> **2026-09-12 — batch « analyse ligne par ligne »** (branch `arena/01a096cc-rebrique-sujet-bac`, rapport complet dans `ANALYSE_LIGNE_PAR_LIGNE.md`):
> fixed S1.1 (JSDoc `@param {string} lang` → `npm run typecheck` vert), S2.1 (`hits > 0` avant le palier parfait), S2.2 (condition tautologique de l'horloge en stratégie + suppression du doublon de libellés arabes au profit de `js/ui/coverage-messages.js`), S2.3 (le repli de simulation annonce désormais `missing`/`partial`/`blocked`), S3.9 (opérande mort dans `brouillon.js`), S3.6 (commentaire orphelin), `methodology.js` refactoré (28 blocs de retour → 1, −235 lignes, **0 différence sur 2448 couples échantillon/pôle**), démo « avant/après » recalée sur le schéma réel de `evaluateText`, frontière `setInternalHTML` restaurée partout, `build.mjs` n'affirme plus que les PDF ne sont pas distribués (et affiche leur poids dans le log), en-têtes périmés de `data/archive.js` corrigés, modules de rapport documentés comme volontairement non câblés.

## Mise à jour du 2026-09-15 — état réel du dépôt (lire avant les sections ci-dessous)

Les sections qui suivent décrivent la session `arena/01a08ed2…` et restent utiles
comme historique (liste des bugs corrigés, plan OCR). Ce qui a changé depuis :

- Branche de travail : `arena/01a09be6-rebrique-sujet-bac` (PR **#26**, OPEN — ne pas
  merger sans consigne explicite du propriétaire). Tête vérifiée au moment de cette
  mise à jour : `3c8d276` (état depuis dépassé : voir le bandeau **2026-09-16** en tête de
  ce document — tête `71b0cf7`, 352 tests, §10.1 fermé hors arbitrage juridique).
- État mesuré : **336 tests (335 pass / 0 fail / 1 skip)**, **28 sessions encodées**
  (14 maths `2013-m … 2026-m`, 14 sciences `2013 … 2026`), **54 inventaires**
  officiels, `npm run coverage:official` → 54 sujets éligibles, 0 invalide.
- **SE 2021 n'est plus « non créée »** : `data/years/se/year-2021.js` existe (armature
  2 sujets × 3 exercices, barème 5 + 7 + 8, thèmes) et, depuis le 2026-09-15, les
  **questions officielles y sont recopiées** (`consignes`, `consignesPages`,
  `consignesSource`) après relecture image des dix pages. L'année reste en **copie
  libre** (`answerMode: "free"`, `poles: {}`) : aucun inventaire, aucune note,
  `coverage:official` la donne `blocked` par design. La règle permanente tient : rien
  n'est marqué « officiel » sans relecture humaine, et les symboles latins restitués
  depuis la couche texte (dont les chiffres sont faux) sont signalés comme tels.
- Backlog d'analyse (`ANALYSE_LIGNE_PAR_LIGNE.md`) : tout §10.1 est corrigé sauf
  S2.5 (chemin `StereoPannerNode` écrit, à confirmer sur un vrai Safari), S2.6 (dette
  défensive non atteignable en pratique) et l'arbitrage juridique des PDF (§10.1 S3.8,
  décision propriétaire). L'ancrage à 75 % de l'écran de choix a été supprimé.
- Prochaine étape ouverte : conversion **BAC** de SE 2021 (pôles + inventaire). Elle
  exige de réassigner l'année « copie libre » de référence dans les tests et de
  n'écrire que des réponses explicitement **reconstruites** (aucun corrigé local).

## Bugs already fixed this session (committed)

Catastrophic/data-loss:

- **#73** bac-reading-mode `BAC-S?-E?` answers stripped on reload — added `freeAnswer` per-exercise field, rewrote `renderBacReadingMode` to use `data-exercise-free`, wired persist/restore. Schema v4→v5 migration rescues orphaned pre-fix keys.
- **#71** brouillon "إدراج الحالي" silently overwrites existing answer — now appends when non-empty.
- **#50** sound-engine master GainNode never disconnected on mode switch → audio leak. Now disconnects/nulls master gain.

Timing:

- **#60** global BAC timer drained during guide/breathing/strategy screens — startGlobal moved from `begin()` to strategy `confirmChoice()`; init restore only resumes timer in workspace; guide sets timer text to chosen year so Math-stream shows 2h30 not 4h30.
- **#63** drill timer used naive `setInterval(,1000)` → drift — switched to Date.now() delta pattern.
- **#64** `strategyMinutes` config not persisted across reload — added `strategyDuration` field.

Locale/speech:

- **#52** SpeechRecognition `lang="ar-DZ"` unsupported → now `ar-SA` with ar-EG→ar fallback loop.
- **#53** dictation replaced text / jumped caret → inserts at selectionStart/End with proper space glue.

Network/PDF:

- **#61** sw.js returned undefined for Range requests (Chromium PDF breakage) → now `respondWith(fetch(request))`.
- **#62** server.mjs always returned 200 full body, no Range support → added 206 Partial Content with `Accept-Ranges: bytes` and sliced createReadStream (verified: PDF 0-999 returns 206/1000 bytes).

Scoring heuristics:

- **#65** science wrong-concept penalty zeroed any answer with 2 errors (`1-0.5*n`) → softened to `max(0.1, 1-0.25*n)` (BAC-style deduction).
- **#66** `matchConcept` prefix match (≥4 chars and startsWith) over-matched e.g. بروت→بروتوكول/بروتون → ±1-3 char inflection window only.
- **#67** verb detection counted any word ≥4 chars starting with ي/ت/ن/س (destroyed نواة/تركيب/نسيج/سنة/تلميذ/سطح/سائل) → prefix + (verbal-suffix OR no-nominal-ending) rule.
- **#68** `stripArabicClitics` `/^[كبفول]/` amputated بروتين→روتين, بكتيريا→كتيريا, كبد→بد, فرضية→رضية, وراثة→راثة → replaced with protected-stem allowlist + context-aware single-letter strip.
- **#69** `hasTwoSides` "any و OR ≥8 words = both sides" always-true heuristic → explicit contrast-marker detection (بينما/في حين/على عكس/مقابل/أما/بعكس/يتشابه/يشبه).
- **#72** diagnostics online/offline/SW listeners leaked across init/re-init → cleanup on re-init via named handlers.

## NOT created (deliberate, per user constraint)

- **data/years/se/year-2021.js (training 4D)** _(dépassé : le fichier existe depuis le 2026-09-12 en copie libre, avec questions recopiées le 2026-09-15 — voir la mise à jour en tête de ce document)_: The 2021 SE PDF is encrypted (viewer 0 pages on dzexams). `scripts/extracted/SE/2021/*.txt` exists but is RTL-inverted, garbled (shows "المدة: 40 سا و04 د"), and has no usable text layer. Per standing rule "never mark OCR-extracted prompts as verified, never fabricate coverage" I did **not** author 2021 SE in 4D. It stays as a consult card pointing to dzexams. Promoting 2021 SE requires manual re-reading of the PDF page by page to build poles + model answers — content authoring, not a code patch.

## Files changed in this batch

`data/subjects.js`, `js/app-version.js`, `js/application/subject-session.js`, `js/domain/evaluation/{methodology,quality-checks,text-analysis}.js`, `js/services/{diagnostics,sound-engine,speech-recognition}.js`, `js/store.js`, `js/ui.js`, `js/ui/screens/{hub,simulation,strategy}.js`, `js/ui/training.js`, `js/ui/workspace/brouillon.js`, `server.mjs`, `sw.js`, `tests/p1-status.test.mjs`, `README.md` (auto-metrics), `package.json` + `package-lock.json` (runtime deps for OCR scripts), plus new scripts in `scripts/`.

## Remaining work for the next agent

### P0 — OCR pipeline (per the user's accepted phased workflow: audit → extract native → one pilot before generalize)

1. **Audit native-text extractability** across all 38 subject PDFs (SE 2013–2026 ×2, M 2021–2026 ×2 = 26 SE + 12 M = 38). The script `scripts/extract-native-pdfs.mjs` exists but needs to be run end-to-end:
   - `node scripts/extract-native-pdfs.mjs` → writes `.txt` under `scripts/extracted/{SE,M}/<year>/sujet-<n>.txt` for PDFs with a real text layer.
   - For each PDF, record: `{ hasText: bool, ocrRequired: bool, pages, extractionQuality }`.
   - Update `data/calibration-status.js` (or the calibration-status JSON) with the result, marking native-extract subjects.

2. **Run one pilot extraction with UNVERIFIED flag first.** Suggested pilot: SE 2025 (already 4D-coded — use native extract to double-check `bacPrompt` strings) OR SE 2022 if native-text quality is good. The pilot must:
   - Run `scripts/pilot-extract-prompts.mjs <year> <subject>`.
   - Output a machine-readable tasks JSON and diff against the existing `data/years/se/year-<y>.js` poles.
   - NEVER mark pilot prompts as `bacPromptSource: "official"` without human re-read. Use `bacPromptSource: "unverified-ocr"` and show them side-by-side.

3. **OCR-only fallback**: `scripts/ocr-scan-pdf.mjs` uses tesseract.js with Arabic traineddata (ara.traineddata needs to be fetched/confirmed). Run on SE 2021 first (the known-encrypted case) to see if the garbled text can be recovered; expect RTL issues — the existing 2021 extract is inverted because of PDF.js text-direction bugs. Fix the RTL inversion (`scripts/lib/`) before trusting output.

4. **After pilot verification**, generalize OCR/native extraction to other missing years (2013–2019 currently reconstructed; 2021 SE needs full authoring; 2022–2026 already 4D-encoded but prompts should be re-verified against native text).

### P1 — Bugs still on the list

- ~~**#51** Sound engine binaural on Safari~~ **corrigé le 2026-09-12** (`js/services/sound-engine.js`, `_playBinaural`) : le code utilisait déjà un `ChannelMerger`, auquel s'ajoute désormais un chemin explicite `StereoPannerNode` (pan ∓1) quand le moteur l'expose, le merger restant le repli. **Câblage verrouillé depuis le 2026-09-15** par `tests/sound-engine.test.mjs` (contexte WebAudio factice : les deux chemins, l'étanchéité des modes et le gain maître). Reste à confirmer à l'oreille sur un vrai Safari : aucun test ne peut écouter le rendu.
- ~~**#54** Speech recognition `InvalidStateError`~~ **corrigé le 2026-09-12** (`js/services/speech-recognition.js`) : la boucle `ar-SA → ar-EG → ar` rappelait `start()` sur l'objet qui venait d'échouer. Chaque tentative construit désormais une instance neuve, une locale refusée de façon asynchrone (`language-not-supported`) retente la suivante, et un seul message est affiché par action. Couvert par `tests/speech-recognition.test.mjs` (5 tests, moteur fictif).
- **Diagnostics**: `reportDiagnostic` still has an edge case where it can double-count if same error fires synchronously during reporting (low severity).

### P2 — Scoring/rubric/hypotheses/technique deep audit (not yet done)

I patched the most damaging scoring heuristics (#65–#69) but did NOT fully audit:

- `js/domain/evaluation/text-analysis.js` — `matchConcept`, `aliasesFor`, `stripArabicClitics`, overlap ratios.
- `js/domain/evaluation/quality-checks.js` — `evaluateScience` (causal order), `evaluateDocument` (grids/curves/tables).
- `js/domain/evaluation/methodology.js` — pole N/S/E/W grids (now one single return — see batch below).
- `js/domain/evaluation/pipeline-evaluator.js` — domain-specific pipelines (graph / table / genetics) live here, **not** in per-domain files: the paths `js/domain/evaluation/{rubric,hypotheses,technique}.js` and `{graph,table,genetics}-*.js` cited in earlier handoffs **do not exist** (verified 2026-09-12).
- `js/domain/subjects/official-coverage.js` — TASK_ID_PATTERN strictness should probably also accept a future "unverified-ocr" suffix instead of silently dropping freeform keys (current v5 migration covers historical orphans, but future inventories may need a softer key path).

### P3 — XSS surface audit (partially done 2026-09-12)

- `setInternalHTML` (`js/ui/dom.js`) is the **only** HTML-writing boundary. It does **not** sanitize: it is a marker for "application-owned template, never user input", enforced by `scripts/report-p1-status.mjs` P1.6 / `tests/security-baseline.test.mjs` (CSP forbids inline styles, no `innerHTML` outside `dom.js`).
- Remaining direct writes found by the audit and fixed in the batch below: `js/ui/training.js` (3), `js/ui/atlas.js` (1), `js/ui/screens/hub.js` (1 `insertAdjacentHTML`). Only `js/ui/reports/exports.js` still reads `.innerHTML` — a read, for print output.
- `js/ui/atlas.js` and `js/ui/keycard.js` are **not** in `js/ui/drawers/` (that directory does not exist); the adhkar drawer is `js/ui/dialogs.js`.
- Still to check: `js/ui/workspace/brouillon.js` `buildDrafts`/`brouillonPreflight` — draft content rendered into the preview is escaped through `elementFromInternalHTML` templates, worth a dedicated test.

### P4 — SE 2021 (content, not code)

> **État au 2026-09-15** : les points 1 à 3 et 6 de cette liste sont faits pour la
> **copie libre** (fichier, chargeur, catalogue, épreuve ouverte) ; les points 4-5
> restent à trancher si l'année passe en mode BAC, ce qui suppose un corrigé ou des
> réponses explicitement reconstruites. Voir la mise à jour en tête de ce document.

When OCR is usable AND the Arabic text has been manually verified line-by-line against the PDF:

1. Create `data/years/se/year-2021.js` following the 2020/2022 templates: 2 sujets × 3 exercises, N/S/E/W poles per exercise.
2. Add `"2021": () => import("./years/se/year-2021.js")` to `YEAR_LOADERS` in `data/subjects.js`.
3. Add a `catalogEntry` for 2021 SE in `YEAR_CATALOG` (with `enabled: true`, `subjectCount: 2`, `exerciseCounts: [3, 3]`).
4. Update `js/ui/screens/hub.js` caption (`"الشعبة: ${stream.label} — مواضيع 2013–2026."` already covers 2013–2026; remove the SE consult-only path for 2021 when adding).
5. Remove the 2021 SE entry from `data/archive.js` consult list (or keep it as a "mirror" entry with `trainingAvailable: true`).
6. Add `wrongConcepts` lists per exercise (SOD/RUBISCO distractors) — must appear only on science poles, not document poles.
7. Run `npm run pwa:version && npm test` — the P1.1 evidence regex in `tests/p1-status.test.mjs` already uses a loose `/\/38 inventaires complets/` pattern, so adding one more inventory should auto-update.
8. Run `npm run update-calibration-status` (or `node scripts/update-calibration-status.mjs`) to refresh copiesCompared.

### P5 — Verifications to re-run after any scoring change

- `npm test` must stay green.
- `node build.mjs` must produce the same sha256 on two consecutive runs (deterministic build — `9387190ec97e…` at time of handoff).
- Spot-check server range support: `curl -r 0-999 http://localhost:8080/subjects/SE/2021/sujet-1.pdf -o /tmp/partial && wc -c /tmp/partial` → 1000 bytes.
- Spot-check SW range passthrough is NOT cached (Chromium devtools → Network → PDF in iframe should show 206 from network, not from ServiceWorker cache).

## Session-memory state (for the next agent)

- No running servers / background processes.
- `node_modules/` installed (including `pdf-parse`, `pdfjs-dist`, `tesseract.js`, `tesseract.js-core`, `@napi-rs/canvas`) — these are dev deps but `package.json` puts them under "dependencies" because the OCR scripts run at dev time; you may want to move back to devDependencies once scripts are mature.
- Build/dist directories present but gitignored.
- Working tree is clean after PR merge (next session should start with `git pull` to confirm the merged commit on main — note: Arena tracks branch `arena/01a08ed2-rebrique-sujet-bac`, work there only, not main).
