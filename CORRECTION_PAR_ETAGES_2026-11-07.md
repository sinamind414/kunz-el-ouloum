# Correction par étages — 7 novembre 2026

**Consigne reçue :** « CORRIGE TOUS LES BUGS PAR ETAGES ». **Consignes suivantes :** « OGO » (étage 2) · « GO » (étage 3) · « GO » + arbitrage explicite **« Étage 4 complet »** · « GO » (purge de notre branche) · « GO » (recette de purge complète) · **« GOGO » (R5)** · **« GO » (R9, interprétation annoncée non confirmée)** (7/11/2026).
**Branche :** `arena/bcf8863b-kunz-el-ouloum` (active). **État initial du plan :** `HEAD local f4bc4f4` · `distant a873d74`.

**Légende** : **[CONSTAT]** = vérifié par commande ce tour · **[INTERPRÉTATION]** = lecture déduite · **« Non vérifiable »** = jamais supposé.

---

## ⚠️ Le constat qui commande tout le plan

**[CONSTAT]** La chaîne complète de validation a été exécutée **avant** toute modification, sur l'état réel du workspace :

| Étape | Résultat |
|---|---|
| `npm ci --ignore-scripts --no-audit --no-fund` | 1013 paquets, exit 0 |
| `npm run lint` (`tsc --noEmit`) | **0 erreur** |
| `npm run lint:eslint` | **0 erreur** |
| `npm run check:miftah` | garde-fou OK |
| `git diff --check` | 0 |
| `npm test` (vitest + BOUSSOLE) | **309 fichiers / 3628 passés / 8 ignorés**, BOUSSOLE **138/0** |
| `npm run test:jest` | **301 suites / 3574 passés / 2 ignorés** |
| `npm run test:build` | 3348 modules, **20/20 tests**, build 10,39 s |
| Entrée du bundle | `index-IucpS1su.js`, **515 Ko** < plafond 700 Ko |

**[CONSTAT] Il n'existe donc aucun bug reproductible par les tests, le typage ou le build.** [INTERPRÉTATION] Les 5 « points faibles » de l'audit du 7/11 sont des **manques fonctionnels** (positionnement, hiérarchisation, glossaire, annales), pas des défauts d'exécution. Les « corriger » = développer des fonctionnalités, ce qui exige soit un arbitrage explicite, soit du contenu officiel absent du dépôt. **[CONSTAT]** La règle d'or du projet interdit d'inventer ce contenu ; `AGENTS.md` interdit de modifier `src/App.tsx` sans arbitrage explicite.

**Décision prise :** procéder par étages, en exécutant d'abord tout ce qui est sûr, vérifiable et réversible ; ne rien inventer ; ne rien pousser.

---

## 🟢 ÉTAGE 1 — FAIT CE TOUR : 9 corrections vérifiables

### C1 — Constante définie mais jamais utilisée ( vrai défaut de code )

**[CONSTAT]** `src/lib/invitationCapitaine.ts:563` exporte `LIBELLE_BULLE_SILENCIEUX_AR = 'اسأل القبطان'` ; un `grep` sur `src/` montrait **0 import**, et `src/components/DashboardView.tsx:494` recopiait la chaîne en dur. **[INTERPRÉTATION]** Risque de divergence : changer le libellé à sa source ne changeait pas l'affichage de l'accueil.

**Correction** : import de la constante dans `DashboardView.tsx` + remplacement du littéral par `{LIBELLE_BULLE_SILENCIEUX_AR}`. Aucun cycle d'import (`invitationCapitaine.ts` n'importe aucun composant), aucun fichier protégé, aucun contenu nouveau. Le test existant `DashboardViewHierarchy.test.tsx:69` (`getByText('اسأل القبطان')`) verrouille le rendu.

### C2 — Ouvrages tiers non protégés à la racine

**[CONSTAT]** `الكتاب_المصحح_v1.0.md` (275 K) et `المكتبة_الكاملة_SVT.md` (2,0 M) sont **suivis dans le dépôt depuis `f4bc4f4`** (`git ls-files`, `git ls-tree HEAD`), alors que `docs/sources/.gitignore` écrit « Livres complets protégés par le droit d'auteur — JAMAIS commités ». Le `.gitignore` racine ne les mentionnait pas.

**Correction** : ajout des 2 noms au `.gitignore` racine, avec commentaire daté. **[CONSTAT — limite assumée]** une règle `.gitignore` **ne désindexe pas** des fichiers déjà suivis : empêcher de futures copies ne retire pas celles déjà dans l'historique. Le `git rm --cached` et une éventuelle purge d'historique sont **laissés à l'étage 4**, car ils modifient l'index et, à terme, l'historique publié. Aucune de ces opérations n'a été faite.

### C3 / C4 — Erreurs factuelles dans mes propres livrables

**[CONSTAT]** J'avais écrit dans `SPEC_GLOSSAIRE_COACH_2026-11-05.md` et `COMPARAISON_LEXIQUE_LIVRE_2026-11-05.md` que les livres « restent hors du dépôt, dans `/tmp`, jamais copiés » : **inexact** (cf. C2). J'y avais aussi écrit « 165 définitions courtes » alors que le comptage de `fillBlanks.ts` donne **161 occurrences de « التعريف الصحيح »** pour 162 blocs `unitId`.

**Correction** : 4 passages corrigés dans la spec, 2 dans la comparaison, dont 165 → **161** (2 occurrences), et l'ajout explicite du constat corrigé. L'audit du 7/11, lui, était déjà exact sur ces deux points.

### Validation APRÈS corrections (chaîne complète relancée)

| Étape | Résultat |
|---|---|
| `lint` / `lint:eslint` / `check:miftah` / `diff --check` | **0 / 0 / OK / 0** |
| `npm test` | **309 fichiers / 3628 passés / 8 ignorés** + BOUSSOLE **138/0** |
| `npm run test:jest` | **301 suites / 3574 passés / 2 ignorés** |
| `npm run test:build` | 3348 modules, **20/20**, build 14,09 s |
| Entrée | `index-BsT7vmIz.js`, **515 Ko** < 700 Ko (hash changé, taille identique) |

**[CONSTAT]** 2 fichiers suivis modifiés (`.gitignore` + `DashboardView.tsx`, +16/−1), 4 documents corrigés. **Aucun commit, aucun `git add`, aucun push, aucun changement de branche.**

---

## 🟢 ÉTAGE 2 — FAIT (consigne « OGO » = GO, 5 propositions par défaut validées)

**Le glossaire du capitaine.** **[CONSTAT]** Avant : `اسأل القبطان` faisait `setCurrentTab('chat')` — la bulle ouvrait le tuteur, elle ne répondait pas. **[CONSTAT]** La comparaison du 5/11 avait établi que 100/100 mots existent déjà → **0 définition inventée**.

**Correction apportée** : le bouton rond ouvre désormais la bulle du capitaine ; l'élève tape le mot ; une **question-sonde** précède le contenu (H3) ; **1 tentative** ; verdict d'une ligne ; définition courte فصحى + renvoi « الوحدة X · الدرس Y ». Sortie « اشرح لي » conservée. Quand la bulle répond, invitation et relais se taisent (**une seule voix**). Le panneau reste **dans le bloc gardé par `!epreuveEnCours`** : impossible à monter pendant une épreuve. Le pont « تابع مع المرشد » garde l'accès au tuteur, sans régression.

| Fichier | Rôle |
|---|---|
| `src/data/glossaireCapitaine.ts` (nouveau) | **121 fiches dérivées de `FILL_BLANK_QUESTIONS`** (`acceptedAnswers`), 14 variantes, 10 contrats, 3 étiquettes, U8 documentée. Aucune définition littérale |
| `src/data/glossaireCapitaine.lock.test.ts` (nouveau) | verrous : 0 invention, 39 `exclu_ids` jamais servis, 10 contrats **identiques mot pour mot** à `smartTutorEngine.ts`, verdicts du moteur, cas nom/verbe/alias/hors-programme/inconnu |
| `src/components/GlossaireCapitaine.tsx` (nouveau, lazy) | saisie libre, sonde, verdict, étiquette, renvoi, pont tuteur |
| `src/components/__tests__/glossaireCapitaine.cablage.test.tsx` (nouveau) | verrous de câblage, une seule voix, silences et bouton rond intacts |
| `src/App.tsx` (**protégé, GO explicite**) | 1 lazy + 1 `useState` (avant tout retour anticipé) + FAB + panneau ; aucun autre comportement modifié |

**5 arbitrages tranchés par défaut** : H4 = 10 contrats du moteur · H5 = **aucun seuil de longueur imposé** (définitions du dépôt, longueur variable) · R5 = **étiqueter** « غير ممتحن فيه » · U8 = **exclusion documentée** (2 h / 0,5 sem.) · **1 tentative**.

**Validation complète après amendement** :

| Étape | Résultat |
|---|---|
| `lint` · `lint:eslint` · `check:miftah` · `diff --check` | **0 · 0 · OK · 0** |
| Ciblée (6 fichiers) | **56/56** — verrous anciens du capitaine inclus |
| `npm test` | **311 fichiers / 3650 passés / 8 ignorés** (+2 fichiers, **+22 tests**) · BOUSSOLE **138/0** |
| `npm run test:jest` | **303 suites / 3596 passés / 2 ignorés** |
| `npm run test:build` | 3348 modules, **20/20**, build **15,23 s** |
| Entrée / chunk | `index-FHuMah8G.js` **515 Ko < 700 Ko** · `GlossaireCapitaine-*.js` **12 Ko, hors entrée** ✅ |

**Contrôle fonctionnel réel** : `الجين` → définition du dépôt · `استنتج` → contrat `يُطلب/يُمنع` · `المتمم` → étiquette « خارج المنهاج » · `إنزيم روبيسكو` → renvoi `RuBisCO` sans définition fabriquée · `الحمض الريبي النووي المرسال` → fiche `ARNm` · `zzzqqq` → échec explicite.

**Limites assumées** : renvoi leçon en **texte**, pas encore cliquable ; sortie « اشرح لي » **non enregistrée** dans un stockage ; la carte d'accueil `DashboardView` ouvre toujours le tuteur (verrou `MorchidContextuel.test.tsx`) ; les silences nocturnes / 3 ignorances s'appliquent aux **invitations automatiques**, pas à un clic explicite (règle déjà en vigueur pour le tuteur). Détail dans `SPEC_GLOSSAIRE_COACH_2026-11-05.md` §0bis.

---

## 🟢 ÉTAGE 3 — FAIT CE TOUR (consigne « GO » = GO de l'étage 3)

**[INTERPRÉTATION]** Ce « GO » a été traité comme l'autorisation de l'étage 3 (R1, R2, R4, R7), **pas** de l'étage 4 ; il n'a jamais valu push, `git rm --cached` ni purge d'historique. Le câblage de `src/App.tsx` est le pendant de l'arbitrage « OGO » de l'étage 2 : même fichier, même zone sûre, mêmes silences, réversible. **[CONSTAT]** `src/data/lessonIndex.ts` (généré, protégé) n'a **pas** été touché : les étiquettes sont calculées dans un module séparé.

| Recommandation | Ce qui est livré | Source des données |
|---|---|---|
| **R1 positionnement** | **15 questions** : 12 QCM du corpus (4 par domaine) + 3 verbes des contrats ; objectif **10 / 14 / 18** choisi par l'élève ; seuils **proposés** 6 / 12 ; 3 profils → 3 rubriques **existantes**. Non noté, non persisté | `SVT_QUIZ_QUESTIONS` (531 servis), `VERB_CONTRACTS` (10), `TAB_PAR_ONGLET` |
| **R2 étiquettes 11/11** | **🔴 3 / 🟡 4 / 🟢 4** sur les **11 unités**, y compris U8, U10, U11 ; points et % dérivés de `unitPressure()` (**65 idées, 435 points**) ; badge `portal-priorite` ajouté dans `UnitIntroPortal`, l'ancien `portal-poids` reste intact ; `prioritePourUnite(99)` → `null` | `bacSessionIndex.ts`, `curriculumOfficial.ts` |
| **R4 Express J-7** | **7 jours**, 2 leçons **réelles** de `PARCOURS_FLAT` + 1 quiz d'unité par jour, 25 min proposées ; avertissement فصحى « تاريخ البكالوريا … مؤقت وغير مؤكد رسمياً » avec `2027-06-08` ; `estFenetreExpress()` ; consultation hors fenêtre **signalée** | `PARCOURS_FLAT` (83 items), `BAC_EXAM_DATE_IS_PROVISIONAL` |
| **R7 accès rapide / recherche** | **1 seule porte** depuis l'accueil → panneau → onglet J-7 → **recherche plein texte existante pré-ouverte** (`initialMode='search'`) ; aucun 5ᵉ onglet, aucun moteur nouveau, `handleTabChange` conserve l'historique | `LessonsView` (`mode='search'`, `SearchView` déjà lazy), `deep-link` interne existant |

**Fichiers** : 3 modules de données (`prioritesBac.ts`, `positionnementInitial.ts`, `expressJ7.ts`), 1 composant **lazy** (`ParcoursAssimilation.tsx`), 2 fichiers de verrous (`etage3.lock.test.ts`, `etage3.cablage.test.tsx`) ; 4 fichiers suivis amendés : `src/App.tsx`, `DashboardView.tsx`, `UnitIntroPortal.tsx`, `LessonsView.tsx`. Le panneau est gardé par `!epreuveEnCours` et **hors bundle d'entrée**.

**Pas fait** : R3 (glossaire, déjà livré à l'étage 2), R5 / R6 / R8–R10, annales officielles, date Bac officielle, étage 4. **[CONSTAT]** Les 🔴17 / 🟡1 / 🟢49 de `lessonIndex.ts` restent des **légendes de schémas**, pas des priorités BAC ; elles n'ont pas été réécrites. **[INTERPRÉTATION]** Le classement est **relatif** (rang par points mesurés), pas une pondération ministérielle : **« Non vérifiable »**. Aucun « tombe chaque année », aucun pourcentage inventé.

**Validation complète après amendement** (relancée après chaque correction) :

| Étape | Résultat |
|---|---|
| `lint` · `lint:eslint` · `check:miftah` · `diff --check` | **0 · 0 · OK · 0** |
| Ciblée (2 fichiers étage 3) | **22/22** ; ciblée élargie (7 fichiers) **57/57** |
| `npm test` | **313 fichiers / 3672 passés / 8 ignorés** · BOUSSOLE **138/0** |
| `npm run test:jest` | **305 suites / 3618 passés / 2 ignorés** |
| `npm run test:build` | 3354 modules, **20/20**, build **9,90 s** |
| Entrée / chunks lazy | `index-DjnSZ9jb.js` **528 476 octets ≈ 516 Ko < 700 Ko** · `ParcoursAssimilation-*.js` **10 Ko** · `GlossaireCapitaine-*.js` **5 Ko**, tous deux hors entrée ✅ |

**Contrôle fonctionnel réel** : 11/11 phrases d'étiquette sans `NaN`/`Infinity` · U99 → `null` · 15/15 → `approfondissement` → `revision` · 0/15 → `bases` → `cours` · J-7 au 2027-06-01 = `true`, J-30 au 2027-05-09 = `false` · 213 jours restants au 7/11/2026.

**Limites assumées** : seuils 6/12 et 25 min sont des **propositions pédagogiques**, pas des normes ; le résultat du positionnement n'est pas sauvegardé ; le plan J-7 reste consultable hors fenêtre (signalé à l'élève) ; R7 pré-ouvre la recherche au 3ᵉ clic **depuis l'accueil**, mais « ≤ 3 clics » sur le terrain, le rendu RTL/mobile et le bouton Retour Android restent **« Non vérifiable »** sans navigateur. Aucun contenu scientifique nouveau : tout est dérivé du dépôt.

## 🟠 ÉTAGE 4 — PARTIELLEMENT EXÉCUTÉ (« GO » + arbitrage explicite « Étage 4 complet »)

**[CONSTAT]** Mesures avant action : clone local **shallow** (`grafted`, 1 seul commit accessible) ; `git ls-remote --heads` = **9 branches** ; les ouvrages sont suivis depuis `6d26c17` (20/09/2026) et `5f14beb` (29/10/2026, lignée **divergente**) ; `6d26c17...a873d74` = **318 commits**. **[INTERPRÉTATION]** Une purge d'historique exigerait de réécrire ces 318 commits **et** les 9 branches qui les partagent, puis une collecte des objets côté GitHub. La règle de session n'autorise de pousser **que** sur `arena/bcf8863b-kunz-el-ouloum` : une purge complète n'est donc **pas exécutable ici** ; même réécrite, l'effacement réel reste **« Non vérifiable »** (objets retenus par GitHub, forks, caches). Le libellé de l'arbitrage parlait de « 2 commits » et de « 3 ouvrages » : **deux simplifications inexactes**, corrigées ci-dessous.

| Opération | Résultat |
|---|---|
| Divergence `HEAD f4bc4f4` ↔ `origin a873d74` | `git reset --mixed a873d74` : pointeur avancé en **fast-forward**, arbre de travail **intact**, aucune perte de fichier. **[CONSTAT]** 35/37 fichiers de `a873d74` étaient déjà identiques ; les 2 écarts sont les ajouts des étages 2/3 |
| `git rm --cached` | **2 ouvrages** retirés de l'index, **conservés sur le disque** (275 K + 2,0 M), désormais ignorés |
| `.gitignore` | commentaire corrigé : ils **ont été** suivis (fin de l'incohérence « jamais commité »), retrait daté, avertissement sur l'historique |
| `book_tdm_clean.md` | **laissé suivi** : TDM bilingue de 5,8 Ko, pas un ouvrage tiers ; `scripts/book_to_json.py` et `docs/` la lisent |
| Push | `git push origin arena/bcf8863b-kunz-el-ouloum` en **fast-forward**, **sans `--force`** |

**NON fait** : réécriture des 318 commits, force-push, purge des objets GitHub. **[CONSTAT]** Après ce commit, les 2 ouvrages ne sont plus dans l'arbre de la pointe **mais restent téléchargeables depuis l'historique** : le sujet des droits d'auteur n'est donc **pas résolu**, seulement rendu cohérent pour l'avenir. **[INTERPRÉTATION]** Un force-push partiel sur notre seule branche casserait le lien avec les 8 autres sans empêcher l'accès aux fichiers par elles : coût élevé, bénéfice nul. Une consigne **distincte et nommée** restait nécessaire pour cette partie : elle est intervenue au 2ᵉ « GO », **voir § « ÉTAGE 4 (suite) » ci-dessous**, qui exécute la réécriture sur notre seule branche. Aucune PR demandée. Ce paragraphe décrit l'état à la fin du 1ᵉʳ « GO » et est conservé comme trace chronologique.

## 🟠 ÉTAGE 4 (suite) — PURGE D'HISTORIQUE SUR NOTRE SEULE BRANCHE (2ᵉ « GO »)

**[INTERPRÉTATION]** Le « GO » suivant a été traité comme la confirmation de la réécriture choisie au tour précédent (« Étage 4 complet ») ; interprétation annoncée avant exécution. **[CONSTAT]** Le snapshot avait ramené le `HEAD` local à `f4bc4f4` alors que le distant restait `7be66ef` : état local rétabli par `git reset --mixed FETCH_HEAD`, arbre de travail intact, 0 perte.

**Mesures corrigées** : `git fetch --unshallow` → **366 commits accessibles** ; `git log --diff-filter=A` → les 2 ouvrages ont été introduits par **`6d26c17`** (20/09/2026, « Add files via upload », +74 380 lignes) ; `6d26c17^..HEAD` = **320 commits** à réécrire. **[CONSTAT]** Une 1ʳᵉ sonde `gh api contents?ref=` était **fausse** (404 compté comme « présent ») ; la mesure fiable par arbre git donne **8 branches sur 9** portant encore les 2 ouvrages à leur pointe, la nôtre étant la seule à 0/2. **[CONSTAT]** `git ls-tree` échappe les noms arabes par défaut (`core.quotepath`) : sans `-c core.quotepath=false`, « 0 fichier » est un **faux négatif**.

| Étape | Résultat |
|---|---|
| Point de retour | tag local **`avant-purge-2026-11-07`** → `7be66ef` + bundle `/tmp/avant-purge.bundle` **34 Mo**. Aucune branche créée, aucun tag poussé |
| Réécriture | `git filter-branch --index-filter` sur `6d26c17^..HEAD` : **320 commits réécrits**, `refs/original/` nettoyé, nouveau tip **`c639744`** |
| Vérification | **366 commits examinés, 0 ne contient l'un des 2 fichiers** · `git diff --stat avant-purge-2026-11-07 HEAD` = **0 fichier différent** (code strictement inchangé) · **366 → 366** commits conservés |
| Validation | chaîne `lint → lint:eslint → check:miftah → tests → test:jest → test:build → diff --check` relancée |
| Publication | `git push --force-with-lease origin arena/bcf8863b-kunz-el-ouloum` (valeur attendue `7be66ef`), **jamais** `--force` |

**[CONSTAT]** L'historique de **notre branche** ne contient plus les 2 ouvrages. **[INTERPRÉTATION]** Ce n'est **pas** une purge du dépôt : les 8 autres branches les portent toujours à leur pointe et GitHub conserve les objets jusqu'à collecte — l'effacement réel reste **« Non vérifiable »**. **[CONSTAT]** Conséquence assumée : tous les SHA cités plus haut et dans les livrables antérieurs (`f4bc4f4`, `a873d74`, `7be66ef`, `28ca5c4`, `e730d9c`…) désignent l'**ancienne** histoire ; tout clone existant doit être resynchronisé. Retour arrière possible via le tag local, le bundle, ou un nouveau `--force-with-lease` de `7be66ef`.

## 🔴 ÉTAGE 4 (fin) — PURGE COMPLÈTE : PRÉPARÉE, NON EXÉCUTÉE (3ᵉ « GO »)

**[CONSTAT]** Règle de session : pousser **uniquement** sur `arena/bcf8863b-kunz-el-ouloum` ; interdiction de changer, créer ou pousser une autre branche. **[INTERPRÉTATION]** La purge complète exige de réécrire et repousser **8 autres branches** : elle sort du périmètre autorisé, quel que soit le « GO ». **Aucune commande de la recette n'a été lancée.**

**[CONSTAT]** Mesure nouvelle : les 2 ouvrages ne sont **pas au même chemin** selon la branche — racine (`arena/5420e52e`, `arena/b840cf8e`), `uploads_externes/` (6 branches), et en plus `CREATION MONTRE XWATCH/…/` sur `fix/tadwin-report-desactivate`. Un filtre limité aux 2 noms à la racine aurait laissé 6 branches contaminées. **[CONSTAT]** D'autres documents tiers existent (`FINALBAC_VOLUME_1/2.txt`, `PROGRAMME NATIONAL SVT CLAUDE OPUS - Copie.MD`, `hosila_officielle_3as.txt`, `504601676-…txt`) : leur statut juridique est **« Non vérifiable »** avec les seules sources du dépôt.

**[CONSTAT]** Le snapshot a de nouveau ramené `HEAD` à `f4bc4f4` (shallow, `node_modules` et tag absents) alors que le distant restait `fe28ed5` : état local rétabli par `git reset --mixed FETCH_HEAD`, 0 perte, statut propre. L'ancienne pointe `7be66ef` reste accessible via l'API GitHub ; le tag local et le bundle `/tmp`, non persistés, ont disparu du sandbox — **le point de retour fiable est donc le SHA `7be66ef` côté GitHub**.

**Livrable** : `RECETTE_PURGE_COMPLETE_2026-11-07.md` — les 9 pointes et leurs SHA, les 3 familles de chemins, un filtre par **nom de fichier** (Python, robuste aux dossiers), un `--force-with-lease` branche par branche, les vérifications, le retour arrière, et tout ce qui reste **« Non vérifiable »** (collecte des objets par le support GitHub, forks, caches CDN, artefacts CI, clones déjà téléchargés).

**[INTERPRÉTATION]** Même la recette exécutée, l'effacement réel dépend de GitHub : le retrait de l'index et la réécriture de notre seule branche ne règlent donc **pas** le sujet des droits d'auteur à l'échelle du dépôt.

## 🟢 R5 — MICRO-LEÇONS + SYNTHÈSE « 3 PHRASES » (consigne « GOGO »)

**[INTERPRÉTATION]** « GOGO » a été traité comme le « GO » annoncé au tour précédent, dont la cible par défaut était **R5** ; interprétation annoncée avant exécution. **[CONSTAT]** L'audit du 7/11 demandait : « Découper les leçons longues en micro-leçons de 5–10 min et ajouter une synthèse « 3 phrases » normalisée en fin de chaque leçon » — 47 leçons HTML, 562 chunks comme base.

**[CONSTAT]** L'espace de travail contenait **déjà** 3 fichiers R5 non suivis et 1 fichier modifié, écrits mais **non validés et inatteignables** : aucun bouton ne posait `mode === 'micro'`. J'ai terminé le câblage et corrigé l'architecture plutôt que de réécrire.

| Élément | Résultat |
|---|---|
| Source unique | `microLecons.ts` **pur** : `import type` uniquement ; les 562 chunks arrivent par `lessonIndexRuntime` (`dist/tutor/lesson-index.json`, précaché par le SW) |
| Découpage | **74 leçons** (47 HTML + 27 actives) → **215 micro-leçons**, groupes contigus de ≤ 3 chunks ; `minutes = ceil(durée déclarée / nbMicro)`, **max mesuré 9 min** |
| Durées | **25** leçons déclarent 20 ou 25 min ; **49** ne déclarent rien → `null` + « المدة غير مصرّح بها » — **aucun chiffre fabriqué**. Les temps d'expérience (بعد 3/20/120 دقيقة) ne sont jamais comptés |
| Synthèse | **3 phrases pour 74/74** : **52** reprises MOT POUR MOT de `RESUMES_LECONS` (ancrées livre officiel), **22** sous-chaînes VERBATIM de chunks, **0 absente** ; placée en fin de leçon |
| Accès | 1 bouton `lecons-ouvrir-micro` sur l'écran d'accueil de `LessonsView`, panneau **lazy** de **8 660 octets**, **aucune 5ᵉ rubrique** |
| Protégés | `HtmlLessonViewer`, `src/data/lessonIndex.ts`, `activeLessons.ts`, `scripts/tools/` **intacts** ; 4 portes de navigation inchangées |

**Régression trouvée et corrigée.** **[CONSTAT]** La version initiale importait `LESSON_INDEX` **statiquement** : `test:build` échouait sur `tutorLeconsJson.lock.test.ts` (b), avec un chunk `tutor-lesson-index-*.js` de **812 932 octets** contenant le marqueur `lhx_` — interdit depuis la Phase A « découpage bundle ». Correction : module pur + chargement par fetch au montage du panneau ; le chunk retombe à **503 octets**, **0 chunk JS** ne contient `lhx_`, le verrou repasse. **[INTERPRÉTATION]** Ce n'était pas un faux positif à assouplir, mais une vraie régression de sobriété 3G. Dégradation honnête : si le JSON manque, le panneau affiche « فهرس الدروس غير متاح » et **aucune synthèse de remplacement n'est fabriquée**.

**Validation** : `lint` 0 · `lint:eslint` 0 · `check:miftah` OK · `diff --check` 0 · ciblée **19/19** · `npm test` **315 fichiers / 3691 passés / 8 ignorés** + BOUSSOLE **138/0** · `test:jest` **307 suites / 3637 + 2** · `test:build` **20/20**, 3356 modules, 10,54 s · entrée **528 476 octets ≈ 516 Ko < 700 Ko**, panneau **8 660 octets** hors entrée.

**Contrôle fonctionnel** : `phase1_chapitres_1_2` = 6 chunks → 3 micro à 9/9/9 min (déclaré 25) ; synthèse `resume-ancre` verbatim ; `كيف نترجم 4 أحرف إلى 20 كلمة؟` → `minutes = null`.

**Limites / « Non vérifiable »** : le découpage et les 5–10 min sont des **règles de présentation**, pas une norme ministérielle ; durée réelle d'apprentissage, validation pédagogique, rendu RTL / mobile ≤ 2 Go / 3G et chargement hors ligne du JSON sur le terrain ne sont pas mesurés. **R6 et R10 restent non faits ; R9 fait l'objet de la section suivante (partiel : le « classement entre amis » n'est pas livré).**

## 🟡 R9 — QUIZ ADAPTATIF (PARTIEL) : LIVRÉ, « CLASSEMENT ENTRE AMIS » NON FAIT (consigne « GO »)

**[INTERPRÉTATION]** Ce « GO » a été traité comme la cible **R9** annoncée à la fin de R5 (« Sans mot nommé, un prochain « GO » sera traité comme R9 »). Interprétation annoncée avant toute action, **non confirmée** par l'utilisateur : elle n'a **jamais** valu autorisation de push, de purge, de `git rm --cached` ni de changement de branche. **[CONSTAT]** Aucune opération git n'a été exécutée ce tour ; les 5 fichiers sont laissés non suivis / modifiés dans l'arbre de travail.

**[CONSTAT]** Cible de l'audit (`AUDIT_ASSIMILATION_8_AXES_2026-11-07.md:109`) : « Quiz réellement adaptatif (difficulté ajustée en temps réel) et classement entre amis, sans notifications push imposées ». Mesures préalables : `SVT_QUIZ_QUESTIONS` = **531 QCM** = **250** palier 1 + **127** palier 2 + **154** palier 3 ; `LIBELLES_DIFFICULTE` porte déjà les 3 niveaux **أساسي / متوسط / متقدم**. **[CONSTAT] Découverte déterminante : le palier est entièrement corrélé à l'unité** (U1–U5 → 1, U6–U8 → 2, U9–U11 → 3 ; 1 seule valeur par unité sur 11 unités). **[INTERPRÉTATION]** Un quiz d'unité ne contient donc **jamais** les 3 niveaux : piloter la difficulté en temps réel exige un **pool inter-unités**, chargé à la demande, et non un simple `questions.filter(unitId)`.

| Élément | Résultat |
|---|---|
| Moteur | `src/lib/quizAdaptatif.ts` **pur** (`import type` seul, aucune donnée de question) : `prochainPalier` — 1 échec fait descendre, **2 réussites consécutives** font monter, bornes **1..3** ; `choisirQuestion` — 1ʳᵉ question non servie du palier cible, repli au palier le plus proche, `null` si corpus épuisé ; `palierInitial` ; séance de **10** questions |
| Panneau | `src/components/QuizAdaptatif.tsx` **lazy** depuis `QuizView.tsx`, porte **opt-in** `quiz-ouvrir-adaptatif` : le quiz d'unité reste **inchangé par défaut**, le compte à rebours est suspendu pendant la séance et reprend intact au retour |
| Corpus | `loadCorpus()` (import dynamique avec cache) : **0 question, 0 énoncé, 0 corrigé inventé** ; `explanation` affichée **verbatim** ; si le corpus est indisponible → `quiz-adaptatif-indisponible`, **aucune question de remplacement** |
| Anti-triche | Même `graineSession()` et même `melangerQuestion(…, 'correctAnswerIndex', …)` que `QuizView` ; la correction reste juste après mélange, verrou comportemental par clic sur le **texte** de la bonne proposition |
| Silences | **Aucune** notification ajoutée (**0 occurrence** de `Notification` / `requestPermission` / `push` dans les 2 nouveaux fichiers) ; **une seule voix**, aucun `CAPITAINE_IDENTITE_AR` ; pas d'écriture dans la boucle mémoire `memoireQuestions` ni de score persistant |
| Périmètre | `src/App.tsx` **inchangé**, `TrainingHubView.tsx` **inchangé** (**aucune 9ᵉ carte**, `≤ 8` préservé) ; protégés (`package.json`, `metadata.json`, `index.html`, `server.ts`, `lessonIndex.ts`, `activeLessons.ts`, SVG, `scripts/tools/`) intacts ; **0/2 ouvrage** à la pointe |

### ⛔ Le volet « classement entre amis » n'est PAS livré — et n'est pas simulé

**[CONSTAT]** `server.ts` n'expose **aucun** endpoint de classement ni d'amis, et le dépôt ne contient **aucune identité d'ami, aucun compte élève, aucun score d'élèves**. **[INTERPRÉTATION]** Fabriquer un « classement entre amis » obligerait à inventer des noms, des scores et une persistance : c'est interdit par la règle « zéro contenu inventé ». Un vrai classement suppose en outre un backend, des comptes, un consentement et une modération — décision de produit, pas un correctif de présentation. **[CONSTAT]** Le panneau l'écrit explicitement en fin de séance : « لا يُحفظ أي ترتيب بين المتعلمين ولا تُرسل أي إشعارات ». **« Non vérifiable »** : existence et taille d'un réseau d'amis chez les élèves, faisabilité backend, conformité RGPD / consentement. **[INTERPRÉTATION]** Ce manque reste donc **ouvert**, signalé et non déguisé ; R9 doit être lu comme **partiel**.

**Validation (code final, après alignement anti-triche)** : `lint` 0 · `lint:eslint` 0 · `check:miftah` OK · `diff --check` 0 · ciblée **2 fichiers / 16 tests** · `npm test` **317 fichiers / 3707 passés / 8 ignorés** + BOUSSOLE **138/0** · `test:jest` **309 suites / 3653 + 2** · `test:build` **4 fichiers / 20 tests**, **3358 modules**, 10,44 s · entrée **528 485 octets ≈ 516 Ko < 700 Ko**, soit **+9 octets** seulement par rapport aux 528 476 de R5 (`LIBELLES_DIFFICULTE` était déjà importé statiquement par `QuizView` : aucune donnée de corpus ajoutée à l'entrée) · panneau lazy **6 243 octets** hors entrée · **0** chunk JS avec le marqueur `lhx_`, mesuré sur le build final.

**Corrections en cours de tour** : 2 erreurs `TS2322` sur les casts de `Math.max/min` (le cast portait sur l'argument, pas sur le résultat) ; 2 faux positifs de verrous de lecture de source (le mot « classement » figurait dans un **commentaire** français, reformulé) ; puis ajout du mélange des propositions, absent de la 1ʳᵉ écriture.

**Limites / « Non vérifiable »** : la règle « 2 réussites → monter, 1 échec → descendre » et la séance de 10 sont des **[INTERPRÉTATION]** de présentation, **pas** un barème officiel ni une mesure psychométrique ; la difficulté réelle des 531 questions n'a pas été re-étalonnée. **[CONSTAT]** Le mode adaptatif n'écrit pas dans `memoireQuestions` : la boucle de révision existante n'est pas modifiée. rendu RTL / mobile ≤ 2 Go / 3G / 360 px, chargement hors ligne du corpus, validation pédagogique et absence de notification imposée **sur le terrain** : **« Non vérifiable »**.

## ⛔ Ce qui n'est PAS un bug et ne sera pas « corrigé »

**[CONSTAT]** R6 (8 sessions BAC sans énoncé, 1 lacune 2021 S2, rattrapage `non-indexe`, corrigés type jury) exige des **énoncés et corrigés officiels absents du dépôt** : les produire serait inventer du contenu, ce qui est interdit. Idem pour la date officielle du Bac, les copies d'élèves, les notes/avis/téléchargements des magasins, le prix en DZD. **« Non vérifiable »** : identité papier ↔ fichier du livre corrigé, dernière version du programme ministériel (sources internes 2017), statut officiel de `المكتبة_الكاملة_SVT.md`, rendu sur Redmi / Samsung A ≤ 2 Go / 3G / 360 px / texte agrandi, Retour Android, offline terrain, Play Console / `assetlinks.json`, contenu du clone Windows `reorganisation-med`.

Aucune source web de **contenu** consultée ; seules les API GitHub du dépôt ont été lues à l'étage 4 (topologie, historique, branches), pas de page ministérielle ni de corpus externe. **[CONSTAT]** Fichiers protégés restés intacts : `package.json`, `metadata.json`, `index.html`, `server.ts`, `src/data/lessonIndex.ts`, `src/data/activeLessons.ts`, `HtmlLessonViewer`, SVG, `scripts/tools/`, copies d'élèves. **`src/App.tsx` fait exception** : il a été amendé à l'étage 2 (arbitrage « OGO ») puis à l'étage 3 (« GO »), uniquement pour du câblage lazy + états + portes, sans modification de la navigation à 4 rubriques ni des 24 identifiants d'écran.

---

## État final de ce tour

Branche active inchangée · historique réécrit puis publications en fast-forward (SHA courant vérifié par `git ls-remote`, consigné dans la réponse) · **0 changement de branche, 0 PR, 0 push vers une autre branche** · `dist/`, `node_modules/` et les 2 ouvrages ignorés. **[CONSTAT]** Le tour de **développement** R9 n'a fait **aucune opération git** : le dernier commit publié restait **`598f1df`** (R5), et **6 fichiers** étaient en attente dans l'arbre de travail. **[INTERPRÉTATION]** Le « GO » suivant est un tour **distinct**, traité comme la clôture de cette livraison : chaîne complète relancée puis commit local — voir la section ci-après.

**Étages 1, 2, 3 livrés et validés ; étage 4 exécuté**, puis **R5 livré et validé**, puis **R9 partiel livré et validé** (difficulté ajustée en temps réel, anti-triche aligné, sans notification). **Reste hors de portée ou non fait** : le **« classement entre amis » de R9** (pas de backend, pas d'identité d'amis → « Non vérifiable », rien fabriqué), **R6 / R10**, et la purge des 8 autres branches — une **recette** est livrée (`RECETTE_PURGE_COMPLETE_2026-11-07.md`) mais **non exécutée**, la session interdisant de pousser ailleurs. Les validations `lint → lint:eslint → check:miftah → tests → test:jest → test:build → diff --check` ont été relancées avant chaque publication et après chaque amendement. **[CONSTAT]** Ce paragraphe décrit l'état à la fin du tour de **développement** R9 et est conservé comme trace chronologique ; la clôture par commit local est consignée dans la section suivante.

---

## 🟢 « GO » SUIVANT — CLÔTURE R9 : COMMIT LOCAL, NON PUBLIÉ

**[INTERPRÉTATION]** Ce « GO » n'ouvre **aucun nouveau périmètre fonctionnel** : il clôt la livraison R9 décrite plus haut. Interprétation annoncée avant action, **non confirmée** par l'utilisateur : elle n'a valu **ni push, ni PR, ni amendement, ni réécriture de l'historique publié, ni changement de branche**. **[CONSTAT]** L'état remesuré avant action : branche `arena/bcf8863b-kunz-el-ouloum` active, `HEAD` = distant = **`598f1df`**, clone shallow, `node_modules` et `dist` présents, 6 fichiers en attente, 0 PR — aucun `reset` ni `npm ci` nécessaires.

**[CONSTAT]** Chaîne complète relancée **avant** le commit, 7/7 au vert : `lint` 0 · `lint:eslint` 0 · `check:miftah` OK · `npm test` **317 fichiers / 3707 passés / 8 ignorés** + BOUSSOLE **138/0** · `test:jest` **309 suites / 3653 + 2** (116,345 s) · `test:build` **4 fichiers / 20 tests**, **3358 modules**, 10,26 s · `git diff --check` 0.

**[CONSTAT]** Commit local **`078d39f`** « R9 (partiel) : quiz adaptatif 3 paliers en temps reel, opt-in, sans contenu invente » : **6 fichiers, +640 / −6**. `git diff --cached --check` 0 ; **0 fichier protégé** touché (`package.json`, `metadata.json`, `index.html`, `server.ts`, `src/App.tsx`, `lessonIndex.ts`, `activeLessons.ts`, `scripts/tools/`) ; **0/2 ouvrage** à la pointe ; plus gros fichier ajouté < 10 Ko hors `QuizView.tsx` déjà suivi ; **0 PR**. **[CONSTAT]** Après ce commit, le `HEAD` local est en avance d'un commit sur `origin/arena/bcf8863b-kunz-el-ouloum` qui reste **`598f1df`** : **rien n'est publié**.

**[CONSTAT]** Relecture : le bilan final disait « 5 fichiers en attente » alors qu'il y en avait **6**. **[INTERPRÉTATION]** Correction apportée dans un **second commit local distinct** (documentation seule), après une nouvelle chaîne complète : aucun amendement du commit `078d39f`, donc aucune réécriture, même locale. Les deux commits restent **non publiés** et forment un fast-forward propre le jour d'une publication.

**[INTERPRÉTATION]** Un mot nommé **« push R9 »** reste nécessaire pour publier. Le **« classement entre amis »** reste **non fait** et **« Non vérifiable »** : aucun de ces deux commits ne le simule.
