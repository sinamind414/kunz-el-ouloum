# Audit approfondi — « Kunz El Ouloum / كنز العلوم »
### Comment l'élève algérien moyen ASSIMILE-t-il cette richesse sans être submergé ?

**Date :** 7 novembre 2026 · **Branche :** `arena/bcf8863b-kunz-el-ouloum` · **Dépôt :** `/home/user/kunz-el-ouloum`
**Type :** **actualisation** de `AUDIT_ASSIMILATION_8_AXES_2026-11-05.md` (72/100), pas une recopie. Le rapport du 20/10/2026 (75/100) et ses conclusions ne sont **pas** repris : ils contredisent le code sur plusieurs points.

---

## 0. Méthode, légende, et ce qui a changé depuis le 5/11

**Légende employée partout** : **[CONSTAT]** = fait vérifié par lecture de fichier ou commande ce tour ; **[INTERPRÉTATION]** = lecture pédagogique / risque déduit ; **« Non vérifiable »** = information absente du dépôt ou non mesurable ici, **jamais supposée**.

**Exécuté ce tour** : lecture de ~30 fichiers (`src/data/curriculumOfficial.ts`, `lessonIndex.ts`, `activeLessons.ts`, `fillBlanks.ts`, `resumesLecons.ts`, `bacSessionIndex.ts`, `bacCorrectionIndex.ts`, `mockExam.ts`, `apprentissageNav.ts`, `apprentissageProgression.ts`, `deepLinkInterne.ts`, `navigationHash.ts`, `smartTutorEngine.ts`, `src/App.tsx`, `QuizView.tsx`, `BacCorrectionPanel.tsx`, `UnitIntroPortal.tsx`, `public/sw.js`, `index.html`, `src/index.css`, `store/`, `.gitignore`, `docs/sources/.gitignore`, les 5 documents de spec/recette et l'état git). Comptages par script Python sur les fichiers réels. **Aucune commande `lint` / tests / `build` relancée ce tour** : aucun amendement de code n'a été effectué (la chaîne de validation s'applique aux amendements, pas à un rapport). Les chiffres de tests cités sont ceux **documentés et validés après le commit `28ca5c4`**, pas remesurés ici.

**Changements intégrés depuis le 5/11** : navigation 6 → **4 rubriques** + liens profonds `?lecon/?qcm/?examen/?idee` ; panneau de transparence BAC (`BacCorrectionPanel`, `BacTypeStats`, `bacCorrectionIndex.ts`) ; spécification complète du **glossaire du capitaine** (H1/H2/H3 tranchées par l'utilisateur) ; comparaison des 100 mots du lexique au livre ; patch + recette de convergence (non appliqués).

### Deux corrections factuelles par rapport à mes propos précédents

1. **[CONSTAT]** Les deux ouvrages `الكتاب_المصحح_v1.0.md` (275 K) et `المكتبة_الكاملة_SVT.md` (2,0 M) sont **suivis dans le dépôt à la racine depuis `f4bc4f4`** (`git ls-files` et `git ls-tree HEAD` les confirment). J'avais dit « hors du dépôt, dans `/tmp` » : c'était **inexact**. Or `docs/sources/.gitignore` écrit « JAMAIS commités » pour motifs de droits d'auteur. **[INTERPRÉTATION]** contradiction de gouvernance des sources à traiter, pas une simple nuance de chemin.
2. **[CONSTAT]** Les marqueurs 🔴/🟡/🟢 de `lessonIndex.ts` (17 / 1 / 49) sont des **couleurs de légendes de schémas** (« 🔴 النقاط الحمراء تشير إلى الإشعاع », « 🟡 الخيوط الصفراء », « 🟢 رامزة البداية »), **pas** des étiquettes de priorité BAC. **[INTERPRÉTATION]** un audit qui les compterait comme hiérarchisation se tromperait.

### Trois recadrages de la grille (inchangés, revérifiés)

| Attente de la grille | **[CONSTAT]** | Effet sur la note |
|---|---|---|
| Séries « SVT » / « EXP » distinctes, 6 disciplines | `curriculumOfficial.ts` encode **11 unités / 3 domaines** pour **علوم تجريبية** (3AS) ; aucun sélecteur de filière. `hikalaBac.ts` signale explicitement une fiche « شعبة الرياضيات » hors cible. | On note l'alignement 3AS sciences expérimentales, pas un découpage inexistant. **Dernière version ministérielle en vigueur : Non vérifiable** (sources internes = 2017). |
| « Parties I / II / III » | `mockExam.ts` : **4 h 30, barème 5 / 7 / 8 pts**, 3 exercices, 2 sujets au choix ; 3 sujets blancs déterministes. | Conformité jugée au format algérien réel. |
| « Application mobile Android/iOS » | PWA : `index.html lang="ar" dir="rtl"`, `public/manifest.json`, `public/sw.js`. Aucun dossier `android/`, `ios/`. `store/` = dossier TWA **non soumis**. | On note comme PWA. **Play Store / App Store, notes, avis, téléchargements : Non vérifiable.** |

---

## 1. 📊 Tableau de synthèse

| Axe | Note /10 | Résumé en 1 phrase |
|---|---|---|
| **1. Conformité pédagogique** | **8,0** | 11 unités / 3 domaines officiellement séquencées avec volumes horaires L5, U8 bien présente et 3 contenus « hors programme » explicitement écartés — mais aucune preuve d'alignement 2026 et contradiction livre ↔ `NON_EXIGIBLES`. |
| **2. Richesse & hiérarchisation** | **6,5** | Corpus dense (47 leçons HTML + 27 actives + 562 chunks + 112 SVG, objectifs 🎯 et durées ⏱️ par leçon), mais **aucune étiquette de priorité réelle**, poids BAC affiché seulement pour les unités mesurées, leçons de 20–25 min et **aucun glossaire élève implémenté**. |
| **3. Parcours & assimilation ⭐** | **7,5** | 4 rubriques + liens profonds + parcours 72 leçons + SM-2 + boucle « erreur → reprise » réellement câblée : le guidage s'est nettement amélioré, mais **toujours ni test de positionnement, ni profil, ni objectif de note, ni mode Express J-7** — c'est l'axe le plus lourd et le plus fragile. |
| **4. Exercices & tests** | **8,0** | 531 QCM documentés, 162 micro-tests / ~161 définitions courtes, 10 contrats de verbes, 617 entités de correcteur, 12 questions de barème officiel / 80 items, difficulté affichée sur 3 niveaux et boucle de remédiation câblée ; le barème type jury reste limité à 2023–2025. |
| **5. Sujets BAC & simulation** | **6,5** | 11 sessions 2016→2026, 65 idées, 3 sujets blancs chronométrés 4 h 30 et désormais un panneau de transparence par session — mais **1 seul énoncé intégral** (2025), 8 sessions « idées seules », 1 lacune (2021 S2) et rattrapage `non-indexe`. |
| **6. UX/UI & ergonomie cognitive** | **7,5** | Passage à 4 rubriques, mémorisation du dernier onglet, RTL, mode sombre, 3 tailles de texte, `role="tablist"`, offline 3G-aware et entrée de 515 Ko — desservi par ~25 onglets internes toujours présents et des leçons HTML d'un seul tenant. |
| **7. Interactif & engagement** | **7,0** | Flashcards SM-2, badges/XP, défi quotidien, schémas à dessiner, cartes mentales, stats de méthode et tuteur local déterministe — mais **glossaire du capitaine seulement spécifié**, pas de quiz adaptatif, ni forum, ni notifications push (verrouillées par test), ni IA. |
| **8. Fiabilité & accessibilité économique** | **7,5** | 309 fichiers / 3628 tests + 8 ignorés, lint/ESLint/Miftah/`diff --check` à 0, build 12,11 s, 100 % gratuit sans pub ni abonnement — mais aucune publication en magasin, aucun test terrain, date Bac **provisoire** et historique git local/distant divergent. |

---

## 2. 📈 Score global pondéré

| Axe | Note | Poids | Contribution |
|---|---|---|---|
| 1 | 8,0 | 15 % | 1,20 |
| 2 | 6,5 | 12 % | 0,78 |
| **3** | **7,5** | **18 %** | **1,35** |
| 4 | 8,0 | 12 % | 0,96 |
| 5 | 6,5 | 10 % | 0,65 |
| 6 | 7,5 | 10 % | 0,75 |
| 7 | 7,0 | 13 % | 0,91 |
| 8 | 7,5 | 10 % | 0,75 |
| **Total** | | **100 %** | **73,5 / 100** (arrondi **74/100**) |

**Évolution : 72,2 → 73,5** (+1,3). **[INTERPRÉTATION]** Le gain vient de la navigation 4 rubriques et de la transparence BAC ; il est presque compensé par deux lacunes désormais **mesurées** plutôt que soupçonnées (fausses étiquettes de priorité, glossaire spécifié mais non livré). L'axe 3, pondéré à 18 %, plafonne à 7,5 : c'est lui qui empêche de franchir 80.

---

## 3. ✅ Points forts (5, par impact décroissant)

1. **[CONSTAT] Zéro contenu inventé, traçabilité explicite.** `NON_EXIGIBLES` (3), `CULTURE_GENERALE` (3), 39 `exclu_ids`, `RATTRAPAGE_BAC.statut = 'non-indexe'` avec la phrase « Aucun sujet n'a été inventé », correcteur « تشخيصي — ليس تنقيطاً », 12 questions de barème officiel 2023–2025. **[INTERPRÉTATION]** C'est le meilleur garde-fou contre une erreur scientifique distribuée à un candidat de Bac.
2. **[CONSTAT] La boucle d'apprentissage est câblée, pas seulement promise.** `profilErreurs.ts`, `planificationRappels.ts`, SM-2 (`kunz_flashcard_srs_v1`), `QuizView` → `enregistrerErreurs`, et les verrous `cablageBoucleCoach.test.ts`, `chaineErreurQuiz.cablage.test.ts`, `tc3Memoire.lock.test.tsx`. Apprendre → tester → identifier → réviser → retester existe réellement.
3. **[CONSTAT] Guidage allégé depuis le 5/11.** `PRIMARY_NAV = 4` (`cours / entrainement / revision / accueil`), `SECONDARY_NAV = []`, 24 ids conservés, priorité *lien profond > mémoire > Cours*, `popstate`/`hashchange`, `role="tablist"`, `data-testid="nav-methode"`, deep links validés contre `PARCOURS_FLAT`, `UNITES_REELLES` et les 65 `BAC_IDEAS`. **[INTERPRÉTATION]** C'est la vraie réponse partielle au risque de surcharge.
4. **[CONSTAT] Chaque leçon porte un objectif et une durée.** `🎯 الهدف العلمي` + `⏱️ المدة التقديرية للتعلم الذاتي : 20/25 دقيقة` dans `lessonIndex.ts`, plus `الحصيلة المعرفية` et `الخلاصة والتقويم الذاتي` en fin de séquence (ex. leçon « مراحل الترجمة », U1). 562 chunks ≤ 520 caractères alimentent le tuteur et la recherche.
5. **[CONSTAT] Fiabilité et sobriété technique.** `lint`, `lint:eslint`, `check:miftah`, `diff --check` à 0 ; vitest **309 fichiers / 3628 passés / 8 ignorés** + BOUSSOLE 138/0 ; jest 301 / 3574 + 2 ; `test:build` 12,11 s / 3348 modules ; entrée **515 Ko < 700 Ko** ; `sw.js` précache par rafales « sans imposer ~11 MB au premier lancement sur une connexion 3G » ; 100 % gratuit, sans publicité ni abonnement, compte sans e-mail possible mais non obligatoire.

---

## 4. ❌ Points faibles (5, par gravité décroissante)

1. **[CONSTAT] Aucune personnalisation d'entrée (axe 3, 18 %).** Aucun test de positionnement, aucun profil « difficulté / moyen / avancé », aucun objectif 10/20 · 14/20 · 18/20, aucun sélecteur de filière. `LECONS_TOTAL = 72` s'applique identiquement à tous. **[INTERPRÉTATION]** L'élève faible et l'élève visant 18/20 reçoivent le même parcours : c'est le risque principal de décrochage, et il est structurel.
2. **[CONSTAT] La hiérarchisation demandée n'existe pas.** Les 🔴/🟡/🟢 sont des légendes d'images ; `UnitIntroPortal` n'affiche le poids BAC que « pour une unité mesurée et l'omet sinon » ; durées annoncées 20–25 min, pas de micro-leçons 5–10 min ; pas de synthèse « 3 phrases » normalisée. **[INTERPRÉTATION]** L'élève ne peut pas distinguer l'essentiel du secondaire — exactement la question centrale de cet audit.
3. **[CONSTAT] Le glossaire du capitaine est une spec, pas une fonction.** `SPEC_GLOSSAIRE_COACH_2026-11-05.md` (H1 bulle du capitaine, H2 saisie libre, H3 sonde socratique, H6 sources) et `COMPARAISON_LEXIQUE_LIVRE_2026-11-05.md` (100/100 mots déjà présents sous une forme ou une autre) sont **non suivis**, 0 ligne de code. Aujourd'hui `اسأل القبطان` fait `setCurrentTab('chat')` : **ouvrir le tuteur, pas définir un mot**. **[INTERPRÉTATION]** La demande la plus récente de l'utilisateur n'est pas livrée ; le bénéfice pédagogique reste potentiel.
4. **[CONSTAT] Annales incomplètes, honnêtement signalées.** `STATS_COUVERTURE_BAC` : 11 sessions 2016→2026, **1 seul sujet intégral**, 8 sessions « idees-seules », 1 lacune (2021 S2), 65 idées, rattrapage `non-indexe`. Les 12 questions de barème officiel ne couvrent que 2023–2025. **[INTERPRÉTATION]** Simulation crédible sur la forme, insuffisante sur la matière pour un élève qui veut s'entraîner sur des énoncés réels.
5. **[CONSTAT] Gouvernance des sources et de l'historique à risque.** Les 2 livres protégés sont committés à la racine malgré `docs/sources/.gitignore` ; `HEAD` local = `f4bc4f4` tandis que `origin` = `a873d74` (snapshot ayant ramené l'historique local) ; `BAC_EXAM_DATE = '2027-06-08'` est **provisoire** (`BAC_EXAM_DATE_IS_PROVISIONAL`). **[INTERPRÉTATION]** Risque de confusion sur « quelle version fait foi » et de dépendance à une date non officielle dans un contexte de stress pré-Bac.

---

## 5. 🔧 Recommandations (concrètes, chiffrées, par priorité)

### 🔴 Haute priorité — bloquant pour l'apprentissage

| # | Axe | Action | Cible chiffrée / ancrage |
|---|---|---|---|
| R1 | **3** | **Test de positionnement d'entrée** : 15 QCM (3 par domaine + 3 verbes de consigne), 5 min, non noté, qui oriente vers 3 parcours (bases / consolidation / approfondissement) et demande l'objectif de note. | Réutiliser `SVT_QUIZ_QUESTIONS`, `VERB_CONTRACTS`, `profilErreurs` existants ; **0 nouveau contenu à inventer**. 1 écran + 1 test de verrou. |
| R2 | **2** | **Vraies étiquettes de priorité** 🔴/🟡/🟢 calculées à partir de `unitPressure()` et des 65 `BAC_IDEAS`, affichées sur **11/11 unités** dans `UnitIntroPortal`, avec le poids en points et en % du Bac. | 11 fiches + 1 test « aucune unité sans étiquette ». Ne pas réutiliser les emoji décoratifs. |
| R3 | **2 / 7** | **Implémenter le glossaire du capitaine** : reprendre la spec (H1/H2/H3 tranchées), brancher la saisie libre sur les 162 micro-tests + 617 entités, ajouter la table des **14 variantes** relevées dans la comparaison, étiqueter les 3 `NON_EXIGIBLES`, exposer les 10 `VERB_CONTRACTS`. | 1 champ de saisie + 14 alias + 10 verbes + 3 étiquettes ; glossaire **hors bundle d'entrée** (plafond 700 Ko) ; chaîne `lint → tests → build` obligatoire avant tout amendement. |

### 🟡 Moyenne priorité — améliore l'expérience

| # | Axe | Action | Cible chiffrée |
|---|---|---|---|
| R4 | **3** | **Mode « Révision express J-7 »** : 7 séances de 25 min (2 leçons 🔴 + 1 quiz), et figer la date du Bac avec une source officielle ou un bandeau « date provisoire » visible. | 7 écrans quotidiens ; `BAC_EXAM_DATE_IS_PROVISIONAL` doit rester **visible à l'élève** tant que la date n'est pas vérifiée. |
| R5 | **2** | **Découper les leçons longues** en micro-leçons de 5–10 min et ajouter une synthèse « 3 phrases » normalisée en fin de chaque leçon. | 47 leçons HTML ; viser ≤ 10 min par chunk, 562 chunks déjà disponibles comme base. |
| R6 | **5** | **Combler les annales** : intégrer les énoncés manquants et les corrigés type jury, en commençant par la lacune 2021 S2 et les 8 sessions « idées seules ». | 8 → 0 sessions sans énoncé ; 1 → 11 sujets intégraux ; **rattrapage : rester `non-indexe` tant que la source officielle n'est pas vérifiée**. |
| R7 | **6** | Réduire les ~25 onglets internes derrière les 4 rubriques et généraliser la recherche plein texte aux 562 chunks. | ≤ 3 clics vers n'importe quelle leçon ; 1 test de parcours. |

### 🟢 Basse priorité — confort / bonus

| # | Axe | Action | Cible chiffrée |
|---|---|---|---|
| R8 | **8** | **Trancher la gouvernance des sources** : soit retirer les 2 livres de l'index git (en conservant l'accès local), soit documenter explicitement leur licence. | 2 fichiers, 2,3 M au total ; aligner `.gitignore` racine et `docs/sources/.gitignore`. |
| R9 | **7** | Quiz réellement adaptatif (difficulté ajustée en temps réel) et classement entre amis, **sans** notifications push imposées. | 3 niveaux `LIBELLES_DIFFICULTE` déjà présents à piloter. |
| R10 | **8** | Validation terrain sur Redmi / Samsung A ≤ 2 Go, 3G intermittente, 360 px, texte agrandi, et bouton Retour Android. | 2 appareils + 1 scénario hors-ligne. **Actuellement « Non vérifiable »**. |

---

## 6. 🏆 Verdict final

- **Prête pour le marché ?** **[INTERPRÉTATION] Non, pas encore.** **[CONSTAT]** Aucune soumission Play Store / App Store (`store/README.md`), aucune mesure terrain, date d'examen provisoire, historique git local/distant divergent, glossaire non livré. **Note / avis / téléchargements : Non vérifiable.**
- **À recommander aux élèves de Bac ?** **[INTERPRÉTATION] Oui, en pilote encadré** (professeur ou parent qui fixe le rythme), **pas en autonomie totale** pour un élève en difficulté : c'est précisément le profil que l'absence de positionnement pénalise le plus.
- **Risque principal :** **[INTERPRÉTATION] la surcharge par défaut de guidage personnalisé** (axe 3), devant l'inexactitude (bien gardée) et le manque de contenu (le corpus est riche). La richesse est réelle ; c'est le **tri** qui manque, pas la quantité.
- **Les 3 ajouts les plus urgents :** **R1** (test de positionnement + profil + objectif), **R2** (étiquettes 🔴/🟡/🟢 et poids BAC sur 11/11), **R3** (glossaire du capitaine implémenté, spec déjà prête).
- **Note de confiance globale : ⭐⭐⭐⭐ (4/5)** — confiance élevée dans le corpus, la traçabilité et la fiabilité technique ; réserve sur l'assimilation autonome et sur tout ce qui touche au terrain algérien non mesuré.

---

## 7. Périmètre « Non vérifiable » (explicite)

Dernière version du programme ministériel en vigueur (sources internes = 2017) · identité papier ↔ fichier du livre corrigé (transcription, 334 p.) · statut officiel de `المكتبة_الكاملة_SVT.md` (39 documents mêlant BEM et BAC) · énoncés ONEC / corrigés / rattrapage non fournis · date officielle du Bac · copies d'élèves types · Play Console, `assetlinks.json`, `com.kunzelouloum.app`, notes, avis, téléchargements · abonnement / prix DZD (aucun dans le code) · rendu réel sur Redmi / Samsung A ≤ 2 Go, 3G, 360 px, texte agrandi · bouton Retour Android et swipe face au zoom · offline terrain · synchronisation cloud effective · comportement du patch de convergence face à `TAB_ROUTE` · contenu du clone Windows `reorganisation-med` / `e730d9c` · captures d'écran (aucun navigateur disponible : remplacées par des `data-testid` vérifiés) · pédagogie et rendu RTL du glossaire non implémenté.

**Aucune source web externe consultée** ; uniquement lectures locales, `git ls-remote` et l'état du workspace.

---

## 8. État git au moment du rapport

Branche **active** `arena/bcf8863b-kunz-el-ouloum`. `HEAD` local `f4bc4f4`, distant `a873d74` → **historique local ramené par le snapshot**, le travail de code est bien sur GitHub. 19 fichiers modifiés + 23 non suivis (dont 8 documents d'audit/spec et les modules navigation/BAC). Ce rapport est **non suivi** : aucun `git add`, commit ou push ce tour. Aucun fichier source modifié, aucun test/build relancé, aucun changement de branche.
