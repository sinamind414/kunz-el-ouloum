# AUDIT DES 8 AXES — كنز العلوم / Kunz El Ouloum
### « Comment l'élève algérien moyen assimile-t-il cette richesse sans être submergé ? »

**Date :** 2026-11-03 (Oran, DZ) · **Branche :** `arena/5420e52e-kunz-el-ouloum` @ `718d1fe`
**Objet audité :** code source, données pédagogiques, build de production, CI GitHub, assets embarqués
**Auditeur :** audit externe, lecture du dépôt + mesures exécutées (pas de relecture disciplinaire intégrale)
**Rapport antérieur de référence :** `AUDIT_8_AXES_2026-10-20_RAPPORT_FINAL.md` (axes numérotés différemment, état @ `d467ba97`)

---

## 0. CADRAGE, MÉTHODE ET LIMITES

### 0.1 Trois prémisses de la grille à corriger avant de noter

Appliquer la grille telle quelle conduirait à noter un produit qui n'existe pas. Je juge l'application sur sa promesse réelle, mesurée dans le dépôt.

| Prémisse de la demande | Constat dans le dépôt | Effet sur l'audit |
|---|---|---|
| « Série **SVT** / Série **EXP** » + choix de filière | Le dépôt cible explicitement **3AS شعبة العلوم التجريبية** (`curriculumOfficial.ts:1`, `guideManhajia.ts:135`). Aucun sélecteur de filière ni de coefficient n'existe (`grep` sur `src/components`, `src/App.tsx`, `src/types.ts` : 0 occurrence). | L'absence de sélecteur n'est pas notée comme un oubli : c'est un **périmètre assumé**. L'adéquation aux autres filières est **Non vérifiable**. |
| « Partie I restitution / II démarche / III étude de cas » | Format encodé : **1 sujet au choix sur 2, 3 exercices notés 5 + 7 + 8 = 20 pts, 4 h 30** (`mockExam.ts:14,54`, `sujetBlanc1..4.lock.test.ts`, `bacPdf.lock.test.ts`). | Je note la conformité au **format algérien**, pas au format français. Les QCM/TP sont des outils d'entraînement, pas des parties d'épreuve. |
| « Application mobile, Play Store ET App Store » | **PWA** (`public/manifest.json`, `public/sw.js`) **+ projet Android Capacitor** (`capacitor.config.ts`, `android/`, `appId com.sinamind414.kunzelouloum`, `minSdk 24`). **Aucun dossier `ios/`**. Publication effective en store : **Non vérifiable**. | La distribution, les notes/avis et les installs se jugent comme PWA/APK en préparation, pas comme produit publié. |

**Autre correction importante :** le produit n'est plus « 100 % gratuit ». Un paywall existe (`src/utils/acces.ts`) — voir Axe 8. Le rapport d'octobre, qui le décrivait comme gratuit, est périmé sur ce point.

### 0.2 Ce que j'ai réellement exécuté

| Mesure | Résultat |
|---|---|
| `npm run lint` (`tsc --noEmit`) | ✅ 0 erreur |
| `npm run build` (Vite + esbuild) | ✅ OK en 9,06 s |
| `node scripts/buildBudgets.mjs` | ✅ **16/16 contrôles de budget OK** |
| `npm run test:build` (verrous post-build) | ✅ **20/20 verts** (4 fichiers) |
| `TZ=UTC` → `server/store.pg.dates.test.ts` (vitest **et** jest) | ❌ 1 échec / 3 : `expected '2027-06-29' to be '2027-06-30'` |
| `TZ=Africa/Algiers` → idem | ✅ 3/3 |
| Dernier run CI `master` (41466381160) | ❌ **3 jobs / 5 en échec** (`test:vitest`, `test`, `test:jest`) ; `check:v2` et `lint+build` verts |
| Comptages | Par **import TS réel** (`tsx`), pas par comptage de lignes : 531 QCM, 32 micro-capsules, 18 schémas, 22 situations, 11 cartes mentales, 65 idées BAC, 13 archétypes, 58 clés de séquence |
| Build produit | `dist` = **108 Mo** dont **94 Mo de PDF Bac** ; `dist/assets` = 5,0 Mo (1,26 Mo gzip) ; JS d'entrée 521 Ko (134 Ko gzip) ; CSS 240 Ko (31 Ko gzip) |

⚠️ Limite d'environnement : ici **Node v22.22.3 / ABI 127**, alors que `AGENTS.md` annonce Node 24 et que la CI utilise `node-version: 22`. `npm ci` échoue localement sur `better-sqlite3` (précompilé inaccessible + `nodejs.org` bloqué par l'egress du sandbox) ; j'ai installé en `--ignore-scripts` pour exécuter les tests JS. Ce n'est **pas** un défaut du produit — la CI, elle, installe correctement — mais je n'ai pas pu exécuter la suite complète dépendante de SQLite.

### 0.3 Légende de lecture

- **[C] Constat factuel** — mesuré dans le code, le build ou la CI, fichier cité.
- **[I] Interprétation** — jugement pédagogique ou cognitif porté à partir d'un constat.
- **[NV] Non vérifiable** — information absente du dépôt ou hors de portée de l'audit ; **jamais** remplacée par une supposition.

---

## 1. ANALYSE DÉTAILLÉE PAR AXE

### AXE 1 — Conformité pédagogique au programme officiel · **8,5 / 10**

**[C] Forces.** `src/data/curriculumOfficial.ts` encode la progression annuelle des **11 unités / 3 domaines** avec heures, semaines, fenêtre mensuelle, trimestre, compétence de base et ressources ciblées, à partir du `التدرج السنوي للتعلمات` et du `دليل الأستاذ` (جوان 2017). La règle ministérielle est citée en tête : *« يمتحن التلميذ على ما جاء في المنهاج… وليس على المحتوى المعرفي الموجود في الكتاب المدرسي »*. Trois contenus du manuel sont explicitement **non exigibles** (`المتمم`, `مبدأ الأسيلوسكوب`, `نضج الـ ARNm`) et deux chapitres sont étiquetés « ثقافة générale » avec bandeau dans le HTML. **35 errata officiels** du manuel sont enregistrés (`manuelErrata.ts`, `faux:` → `formeCorrecte`) pour qu'une erreur imprimée ne soit jamais sanctionnée chez l'élève. Le trou U11 signalé en octobre est **corrigé** : `programSequence.ts:109` enchaîne désormais `d3-u11-l1-migmatite → … → d3-u11-l2-wilson → d3-u11-l3-ophiolites`, et `phase22_chapitres_43_44` est repassé dans le cœur de programme. Le vocabulaire est en **arabe فصحى** sans dialecte (règle `AGENTS.md`), avec les termes officiels (`جسر`, `اختبار الحصيلة`, `الحصيلة`, `وثيقة`). La progression suit l'ordre ministériel (U1 تركيب البروتين en septembre → U11 géologie au 3ᵉ trimestre), pas un ordre alphabétique.

**[C] Faiblesses.** L'en-tête de `curriculumOfficial.ts` **avoue** que l'ancrage n'est pas mot à mot : *« 15/42 sous-chaînes exactes ; 22/42 à couverture lexicale 100 % ; 13 citations < 85 % à réviser — L5 est un OCR bruité »*. `bacSessionIndex.ts:31` documente que le barème 2016 n'était pas 5/7/8 (6/5/9 et 6/7/7) — cas traité, mais qui rappelle que le format a varié. Aucune adaptation aux autres filières (périmètre assumé).

**[NV] Non vérifiable.** **L'existence d'une version du programme plus récente que 2017** (aucun accès au site ministériel depuis cet environnement). **L'exactitude scientifique exhaustive** : je n'ai pas relu les ~25 leçons HTML ni les 531 QCM mot à mot ; j'ai vérifié la *discipline de traçabilité* (errata, `curriculumIntegrity.test.ts`, `bibliothequeOfficielle.lock.test.ts`, `dataIntegrity.test.ts`), pas chaque affirmation. **[I]** C'est une limite d'audit, pas une présomption d'erreur.

---

### AXE 2 — Richesse, qualité et hiérarchisation · **7,5 / 10**

**[C] Richesse mesurée.** 25 leçons HTML officielles + **58 clés** dans `OFFICIAL_PROGRAM_SEQUENCE` (44 `lessonsCount` dans `INITIAL_UNITS`, l'écart venant du découpage des fichiers `phaseN_chapitres_X_Y` en 2 leçons) ; **112 SVG** annotés ; **11 cartes mentales** (1/unité) ; **32 micro-capsules** de 45 à 90 s (moyenne 67 s) ; **18 schémas à reproduire** ; **22 situations** ; **13 montages d'archétypes BAC** ; **531 QCM** ; **121 textes à trous servis** (161 bruts) ; **69 drills** ; résumés par leçon (`lessonGoldSummaries.ts`, `resumesLecons.ts`, `hosila.ts`). Chacune des **25/25** leçons HTML porte un objectif explicite *« 🎯 الهدف العلمي : »* (ex. `phase1_chapitres_1_2.html:435` : *« بيّن أن تركيب البروتين يتم في الهيولى… على مستوى الشبكة الهيولية الداخلية المحببة (REG) »*) **et** une *« خلاصة الدرس »* + une section *« الخلاصة والتقويم الذاتي »*. Le chunking est réel : capsules < 90 s, tâches du plan chiffrées en minutes, 28 vues en chargement paresseux.

**[C] Hiérarchisation — le point faible de l'axe.** Il n'existe **aucun étiquetage 🔴/🟡/🟢 par chapitre** dans la liste des leçons. Les emoji présents (`MiftahCard.tsx:165` « 🔴 قاعدة حمراء », `OkachaView.tsx:282`) désignent des règles méthodologiques, pas des priorités. En revanche, **deux indicateurs de poids existent déjà** : `RevisionPlanView.tsx:239-250` affiche `unitPriority(unitId)` avec la légende *« الترتيب يتبع وزن الوحدة في الامتحان مصحّحاً بصعوبتها الملاحظة »*, et `UnitIntroPortal.tsx:139` affiche *« وزن هذه الوحدة في الامتحان حسب دراسة الدورات : X٪ »*. `revisionPlan.ts:unitPriority()` = moyenne(poids annoncé, pression constatée 2016-2026) + `DIFFICULTY_BONUS`, verrouillé par `revisionPlan.lock.test.ts` et `prioritesMesurees.sync.test.ts`. `data/priorites_pedagogiques.json` (11 entrées tier 1/2/3) n'est lu par **aucun code produit** (seulement 2 tests + 1 doc) : c'est un document, pas une source d'exécution.

**[I]** Le grain est donc **unité, pas leçon** : l'élève sait que U6 pèse 24,9 et U8 3,0, mais il ne sait pas, en ouvrant la liste des 58 leçons, lesquelles sont indispensables. C'est exactement la question de digestibilité posée. Le « multiplicateur de maintenance » d'une annotation statique par leçon (58 entrées) est réel ; une projection dynamique calculée est préférable — mais elle n'est pas encore implémentée.

**[C] Manques.** Aucun glossaire autonome consultable (`src/data/glossaire.ts` absent ; `src/data/dictionaries/` contient des dictionnaires de **correction**, pas un lexique élève). Aucune vidéo ; animations SVG/SMIL et simulateurs (`ElectrophoresisSimulator`, `ScienceAnimations`) à la place — choix cohérent avec l'offline. **[NV]** Résolution/lisibilité réelle sur écran 5 pouces : non mesurée sur device.

---

### AXE 3 — Parcours d'apprentissage et assimilation ⭐ · **7,0 / 10**
*(**5,0 / 10 pour un élève non abonné** — voir le défaut n°1 ci-dessous)*

**[C] A) Diagnostic et personnalisation.** Un **test de positionnement existe** : `QcmBilanView` = *« اختبار تشخيصي شامل »*, 15 QCM tirés de façon déterministe parmi 81 QCM vérifiés, **diagnostic par domaine + renvoi vers le chapitre/leçon à réviser**, avec brassage des propositions anti-triche. S'y ajoute le diagnostic par unité `lib/coach/diagnostic.ts` (4 verdicts `non_commence | faible | moyen | fort`) alimenté par le **جسر** de fin d'unité, et `ligneCoach()` qui affiche la note, sa source, les leçons lues, les éléments fragiles et la prescription. La personnalisation est **déduite, jamais déclarée** : `phaseEleve.ts` calcule 5 phases + un état « creux » (*« Aucune case à cocher, aucun questionnaire »*), avec des règles testées (un élève à J-20 qui n'a jamais rien produit reste en « porte des 2 minutes », pas en sprint). **[C]** En revanche : **aucun choix de filière, aucun objectif de note** (10/20, 14/20, 18/20) — 0 occurrence. L'objectif quotidien est bien paramétrable en **minutes ou en questions** (`DailyGoalWidget`, `DailyGoalConfig`).

**[C] B) Structuration.** `ParcoursView` + `parcoursPath.ts` = chemin linéaire dérivé de la séquence officielle (leçon → leçon → **جسر**). `RevisionPlanView` + `buildRevisionPlan()` = plan **déterministe** sur 1 à 60 jours, budget 20 à 240 min/jour, **4 présents** (30 j/60 min, 14 j/90 min, 7 j/120 min, **3 j/120 min**), alternance de 6 gestes (capsule, schéma, montage, rédaction, situation, carte), deux derniers jours en consolidation seule. `bacDaysLeft()` aligne le calendrier sur la date du BAC — **[C]** mais `BAC_EXAM_DATE_IS_PROVISIONAL` indique que cette date est **provisoire**. Progression visuelle : barre dans `ParcoursView.tsx:250`, `StatsView`, `BadgesView`, série de jours (`serieAfficheeDepuisDaily`), `WeeklyReportShareModal`.

**[C] C) Lutte contre la surcharge — le vrai point fort.** `DashboardViewHierarchy.test.tsx` verrouille *« une priorité et trois parcours avant les outils secondaires »* : l'accueil ouvre sur **« خطوتك التالية »** puis `أتعلّم` / parcours, et `SECONDARY_NAV` est **vide** depuis le 12/10. **28 vues** en `React.lazy`, `BandeauConseilRubrique` (un conseil par rubrique, une fois), `MotivationDeclic` une fois/jour, `FocusTimer`. **[I]** L'élève n'est pas lâché devant 185 modules de données : il reçoit une seule consigne. C'est la meilleure réponse du produit à la question centrale de cet audit. Le couple « 30 jours / apprentissage » ↔ « 3 jours / urgence » tient lieu de mode express, sans être nommé comme tel.

**[C] D) Mémorisation — le défaut d'intégration.** Le SRS est **réel et canonique** : `lib/sm2.ts`, `utils/flashcardsSrs.ts` (4 boutons `again/hard/good/easy`, ordre du deck par échéance, plafond 21 jours), `rappelAdaptatif.ts`, `planificationRappels.ts`, `spacedRecallPrompts` J+1/J+3/J+7/J+14, `gestureRecallEngine.ts`, `microRemediations.ts` (erreur → micro-leçon → question active). **Mais** `buildRevisionPlan()` ne l'importe pas : `TaskKind = 'capsule' | 'schema' | 'montage' | 'redaction' | 'situation' | 'carte'` — **aucune tâche « rappel »**. `ParcoursView` n'importe aucun module SRS. Les cartes dues ne sont donc **pas injectées dans le plan quotidien** : la répétition espacée vit dans un onglet séparé. **[I]** C'est précisément le critère « SRS intégrée au parcours (pas seulement en option) » qui échoue. Les révisions croisées existent autrement (`conceptRoutes.ts` route une erreur vers leçon/quiz/carte, `mockExam.ts` règle 5 impose 3 unités et 3 sessions distinctes par sujet blanc). **[C]** Aucun **Web Push / VAPID** : seul `FocusTimer.tsx:104` émet une `new Notification` locale ; `SmartReminderCard` est un rappel **in-app**. Hors de l'app, silence.

**[C] E) Métacognition.** Auto-évaluation intégrée : *« الخلاصة والتقويم الذاتي »* en fin d'activité, `verdictAutoEvaluation()` du tuteur (l'élève juge sa propre restitution : `صح / خطأ / لا أعرف`, verdict enregistré et réutilisé), `diagnosticQuiz.ts` (l'élève **déclare** la cause T1-T4 de son erreur — le dépôt refuse de la déduire sans preuve), `TahlilWall`, `MethodologyCompilerView`, `WritingReviewPanel`, `conseilsRubrique.ts`. **[NV]** « Estimer sa note /20 avant correction » en tant que geste explicite : non identifié.

**[C] DÉFAUT N°1 — la boucle se brise au paywall.** `src/utils/acces.ts` : `UNITES_GRATUITES = [1,2,3,4,5]`, unités 6-11 payantes. Or `buildRevisionPlan()` construit son plan sur **les 11 unités sans filtre d'accès** (`revisionPlan.ts` et `RevisionPlanView.tsx` n'importent ni `acces.ts` ni `EcranPaiement`, contrairement à 11 autres vues). Mesure sur un plan 30 j / 90 min : **2 688 minutes prescrites, dont 1 112 (41 %) sur les unités 6-11**, et **la 1ʳᵉ unité recommandée est U6** (priorité 24,9, la plus lourde à l'examen) — **payante**. **[I]** Un élève non abonné reçoit donc un parcours guidé dont la première marche et 41 % du volume mènent à un écran de paiement. Pour la moitié du programme, l'app cesse d'être un coach et redevient une bibliothèque. C'est le risque principal de cet axe, plus grave que la surcharge.

**[C] DÉFAUT N°2 — le poids BAC ne pilote pas le coach.** `classerParUrgence(diags, poidsBac)` (`diagnostic.ts:189`) sait départager deux unités également faibles par leur poids à l'examen, mais `useInvitationCapitaine.ts:148` l'appelle **sans second argument** (défaut `() => 1`). Le classement dynamique ignore donc la mesure statique pourtant disponible. `etatEleveRuntime.ts` n'est qu'un **pointeur** (`null` tant que le capitaine n'a pas déposé l'état) et `FamilleCompetence.verdicts` est indexé par **titre arabe**, pas par `unitId` : pas de jointure directe avec le catalogue.

---

### AXE 4 — Module d'exercices et de tests · **8,0 / 10**

**[C] Inventaire servi.** 531 QCM de corpus, **tous étiquetés difficulté** (`difficulte` 1/2/3 : **250 / 127 / 154**) avec badge affiché dans `QuizView.tsx:353-371` et verrou `difficulteQcm.lock.test.tsx` — la recommandation H3 de l'audit d'octobre est **exécutée**. 41 chapitres de QCM du livre (`QCM_CHAPITRES`), 15 QCM de bilan diagnostique, **121 textes à trous servis** (`FILL_BLANK_QUESTIONS`), 69 drills, 22 situations, 18 schémas à reproduire, 112 SVG, 65 idées d'exercices BAC, simulateurs (`ElectrophoresisSimulator`, `ProductionEvolutionPanel`), rédaction (`WritingReportSheet`, `WritingReviewPanel`, `bacWriting.ts`), analyse de documents (`documentTypology.ts`, `DocumentFigure`, `FigureZoomLayer`). Corrigés : `correcteurV1.ts` (barème officiel, plafonds d'intégrité : salade 30 %, négation 50 %, perroquet 25 %), `dictionaries/attendusBac2025.ts`, `baremeCorrecteur.ts`, `calibrationBac2025.ts`, registres d'attendus pour les 4 sujets blancs. Boucle d'apprentissage : `chaineErreurQuiz.cablage.test.ts`, `CarteMicroRemediation`, `lib/prescriptions.ts` (expiration 48 h, **retrait du motif après 3 échecs**, relais humain à la 4ᵉ tentative), `replanifierRevue()`.

**[C] Faiblesses.** Les paliers de difficulté sont **dérivés du segment d'origine** (d1a/d1b/d1c → 1, d2a/d2b → 2, d3 → 3), pas d'une analyse pédagogique par question ; l'en-tête du verrou annonce lui-même un rééquilibrage futur « vers D1≈75 % / D2≈20 % / D3≈5 % » alors que la distribution réelle est **47 % / 24 % / 29 %** — **[I]** donc près d'un QCM sur trois est « difficile » et la progressivité « simple → complexe » n'est pas garantie. **[C]** Aucun type **Vrai/Faux avec justification** identifié (0 occurrence). **[NV]** « Corrigé détaillé avec barème type Bac pour **chaque** exercice » : seuls les sujets BAC 2025 et les 4 blancs ont un registre d'attendus item par item ; les 531 QCM ont une explication mais pas de barème. **[C]** Le correcteur n'a **pas** été validé sur un jeu indépendant : `M3_PROTOCOLE_VALIDATION_30_COPIES_2026-10-21.md` est explicitement *« à exécuter par un humain »*, et `AGENTS.md` rappelle que les 40 copies `eleve_*.txt` ont servi à **calibrer** — un écart publié est un plancher, pas une performance.

---

### AXE 5 — Banque de sujets BAC + simulation · **8,0 / 10**

**[C] Nettement amélioré depuis octobre.** **28 PDF officiels** embarqués, **2013 → 2026**, sujets 1 **et** 2 par année (`public/bac-sujets/`), chacun vérifié par octet magique `%PDF` (`bacPdf.lock.test.ts`). 65 idées d'exercices sur **11 sessions continues 2016-2026** (`YEARS_COVERED`), 13 montages d'archétypes, **2 sujets officiels + 4 sujets blancs originaux** dans un hub dédié (`sujetsBlancsHub.lock.test.tsx`). Chaque blanc : **3 exercices 5+7+8 = 20 pts, 270 min (4 h 30)**, registre d'attendus exact (Σ items = maxPts), noté par le même moteur calibré que le BAC 2025, copie vide = 0 / corrigé complet = couverture totale, grille MIFTAH `اقرأ/اجمع/اربط/اختُم` sur les 3 exercices du blanc n°4. Chronomètre **persistant** qui « lit » l'horloge au lieu de compter les ticks (`examSession.ts`, `examTimer.ts`) — corrige un défaut réel d'onglet en arrière-plan sur mobile. Générateur de sujets déterministe (`mockExam.ts`) : 3 unités porteuses distinctes, 3 sessions distinctes, priorité aux unités lourdes sans exclure la géologie.

**[C] Faiblesses.** **[C]** Aucun **corrigé PDF** embarqué (0 fichier `*corr*`), seulement les URLs de correction indexées et le registre 2025. **[C]** **Aucune session de rattrapage** : `bacPdf.lock.test.ts` verrouille « sujets 1 et 2, **session principale uniquement** ». **[C]** Aucune statistique de réussite **par type de sujet** identifiée (`examLog.ts`, `StatsView.tsx`). **[NV]** L'interdiction explicite de voir le corrigé avant la fin de l'épreuve : je n'ai pas trouvé de garde dédiée dans `Bac2025ExamView.tsx` / `MockExamPanel.tsx` (la correction est une phase distincte après « تسليم التصحيح », mais un verrou temporel n'est pas prouvé). **[I]** L'élève dispose enfin de vrais énoncés officiels — mais pour 2013-2024 il travaille surtout avec des fiches d'idées, pas avec des corrigés jury annotés.

---

### AXE 6 — UX / UI et ergonomie cognitive · **7,0 / 10**

**[C] Forces.** Arabe **RTL فصحى** natif, **60 vues sur 76** avec prise en charge du mode sombre (`isDarkMode` / classes `dark:`), 3 crans de taille de texte (`useTailleTexte`, `html[data-taille-texte]`), **lien d'évitement** `#zone-principale`, `aria-live="polite"` sur le feedback QCM, **167 occurrences `aria-*`** — le tout verrouillé par `accessibilite.test.ts`. Recherche plein texte (`SearchView.tsx`, `lessonIndex.ts` ~547 chunks), favoris (`utils/favorites.ts`), 28 vues Lazy, zoom des figures (`FigureZoomLayer`). Offline : `public/sw.js` (BUILD_ID, précache sélectif, `lazySchemaPrecache` **conditionné à `navigator.connection`**, `networkFirstNavigation`, nettoyage des anciens caches) + projet **Android Capacitor** `minSdk 24` (Android 7-8 conservés), contenu embarqué dans l'APK. Build mesuré : entrée 521 Ko / **134 Ko gzip**, CSS 240 Ko / **31 Ko gzip**, `dist/assets` 5,0 Mo / **1,26 Mo gzip**, **16/16 contrôles de budget OK**, 20/20 verrous post-build verts. **[I]** Sur une 3G intermittente, l'élève télécharge peu au premier lancement ; c'est bien pensé pour le contexte algérien.

**[C] Faiblesses.** **`dist` = 108 Mo**, dont **94 Mo de PDF Bac** (le plus gros : 7,6 Mo pour `2025/sujet-2.pdf`). Avec `webDir: 'dist'`, un APK embarquant tout le dossier dépasserait largement les **50 Mo** visés — **[I]** rédhibitoire sur un Redmi/Samsung A-series à stockage limité, même si la PWA, elle, ne précache qu'un jeu sélectif d'URLs (`CORE_URLS`) et diffère les schémas selon le réseau. `prefers-reduced-motion` n'apparaît que dans **1 fichier**. **[C]** Interface **100 % arabe** : pas de glossaire FR/AR ni de termes bilingues dans l'UI (les libellés français vivent dans le code et les docs). **[I]** C'est le bon choix pour l'épreuve (enseignée en arabe), mais la grille demandait un bilinguisme de consultation : il est absent. **[NV]** Temps de chargement < 2 s, FCP, fluidité 60 fps et RAM ≤ 2 Go : **aucune mesure sur device réel** dans le dépôt. **[NV]** Compatibilité iOS : aucun projet `ios/`.

---

### AXE 7 — Fonctionnalités interactives et engagement · **7,5 / 10**

**[C] Forces.** Flashcards SM-2 (`RevisionView`), quiz chrono et défis (`CombatChallengePortal`, `CombatTrainerView`), schémas interactifs et simulateurs, tuteur IA **local hors ligne** (`AITutorView`, `smartTutorEngine.ts`, `bookTutorQA.ts` — pas d'appel à un LLM externe, donc pas de dépendance réseau). Gamification : `BadgesView`, `StreakCelebrationModal`, `DailyGoalWidget` (objectif en minutes **ou** questions), `PALIERS_SERIE` 7/30 jours, XP, `MoiView` — **[I]** les récompenses portent sur la **régularité**, pas seulement la performance, ce qui est le bon levier en période de stress pré-Bac. Statistiques : `StatsView`, `MethodologyGlobalStats` (erreurs par étape), `TahlilWall` (analyse de l'erreur), `WeeklyReportShareModal`. La boucle **Apprendre → Tester → Identifier → Réviser → Retester** est réellement câblée : `diagnosticQuiz` (cause déclarée) → `profilErreurs` → `microRemediations` → `prescriptions` (48 h, 3 échecs) → `bilanBoucle` → `relais humain`, avec tests de câblage dédiés (`cablageBoucleCoach.test.ts`, `chaineErreurQuiz.cablage.test.ts`).

**[C] Faiblesses.** **[C]** Le « quiz adaptatif en temps réel » n'est pas prouvé : `QuizView` **affiche** le badge de difficulté mais ne sélectionne pas la question suivante selon la réponse. **[C]** Aucun **classement** (amis/classe/national), aucun **forum/communauté** (0 occurrence), aucun **push** de révision. **[C]** Les statistiques par **type de question / courbe d'évolution dans le temps** sont partielles (surtout méthodologie et erreurs, peu de courbes de score par unité). **[NV]** Fiabilité de la synchronisation cloud en conditions 3G : le compte/serveur existe (`server.ts`, JWT, `StudentAuthView`, `BackupPanel`, `assainissementSync.cablage.test.ts`) mais la progression principale est en `localStorage` ; je n'ai pas testé la sync de bout en bout.

---

### AXE 8 — Fiabilité technique et accessibilité économique · **6,0 / 10**

**[C] Fiabilité — un rouge bloquant.** Dernier run CI `master` (41466381160) : **3 jobs / 5 en échec**. Deux annotations sont la même assertion : `server/store.pg.dates.test.ts:21` → `expected '2027-06-29' to be '2027-06-30'`. Cause mesurée : `isoleDate()` recompose les **composantes locales** d'un `Date`, alors que le test construit un instant absolu `2027-06-29T23:00:00.000Z` ; `.github/workflows/ci.yml` ne pose **aucun `TZ`** et les runners GitHub sont UTC par défaut. Reproduit ici en vitest **et** en jest (`TZ=UTC` : 1/3 rouge ; `TZ=Africa/Algiers` : 3/3 vert). **[I]** Ce n'est pas un « échec de fuseau connu » anodin : c'est la porte d'entrée qualité du projet qui est rouge en permanence, indépendamment de `better-sqlite3`. À l'inverse, `lint`, `build`, budgets et `test:build` sont **verts** localement. **[C]** `AGENTS.md` annonce Node 24, la CI utilise `node-version: 22`, le sandbox tourne en 22.22.3 : trois références différentes.

**[C] Vie privée / pub.** `politiqueConfidentialite.ts` (7 sections **AR + FR**, contact public `kunzelouloum@gmail.com`, « لا نبيع بياناتك »), mode invité sans requête, JWT + bcrypt côté serveur, `confidentialitePolices.test.ts`, `verrouSecretsCompose.test.ts`, `corsApk.cablage.test.ts`. **0 occurrence** de `adsbygoogle`, GTM ou Google Analytics. **[C]** Pas de FAQ ni de support dédié : l'ancien tiroir « تحتاج مساعدة؟ » a été remplacé par l'entrée du **القبطان / المرشد** (`DashboardView.tsx:479`), et le seul contact est l'e-mail de la politique de confidentialité.

**[C] Modèle économique — changement majeur.** `src/utils/acces.ts` : **freemium**, `UNITES_GRATUITES = [1,2,3,4,5]` (tout le المجال 1 gratuit à vie), **1 200 DA / année scolaire**, essai 30 jours, paiement **BaridiMob hors app** + code d'activation `KUNZ-…`, `EcranPaiement.tsx` présent dans 11 vues. **[I]** À ~100 DA/mois lissés sur l'année, le prix entre dans le budget cité (100-500 DA/mois) et l'absence de pub est un vrai respect de l'élève. **[I]** Mais la version gratuite couvre **5 unités sur 11** : un élève qui ne paie pas perd la photosynthèse/respiration (U6, U7), l'écologie et **toute la géologie (U9-U11)**, soit la moitié du programme d'une matière à fort coefficient. Le seuil « gratuit réellement utilisable » est donc **partiellement** tenu.

**[NV] Non vérifiable.** Publication **Play Store / App Store**, note et avis d'utilisateurs, nombre d'installations, performance en zone rurale 3G réelle, stabilité long terme (crashes, perte de données) sur parc d'appareils, mises à jour effectives, politique RGPD au sens juridique (le texte est en arabe/français, mais aucune preuve de conformité légale n'est auditée). `metadata.json` a `majorCapabilities: []`.

---

## 2. 📊 TABLEAU DE SYNTHÈSE

| Axe | Note /10 | Résumé en 1 phrase |
|---|---|---|
| **1. Conformité au programme officiel** | **8,5** | 11 unités / 3 domaines ancrées sur les textes ministériels 2017, 35 errata du manuel et U11 reconstruite ; l'ancrage « mot à mot » est honnêtement reconnu comme partiel (15/42). |
| **2. Richesse, qualité, hiérarchisation** | **7,5** | Corpus très riche (25 leçons, 112 SVG, 531 QCM, objectif + خلاصة dans 25/25 leçons) mais **aucun 🔴/🟡/🟢 par chapitre** : le poids n'est affiché qu'au grain unité. |
| **3. Parcours & assimilation ⭐** | **7,0** | Diagnostic, 5 phases déduites, plan 1-60 j et « خطوتك التالية » luttent bien contre la surcharge — mais le SRS n'entre pas dans le plan et **41 % du plan prescrit du contenu payant**. |
| **4. Exercices & tests** | **8,0** | 531 QCM désormais étiquetés (250/127/154), 6 familles de tâches, boucle erreur → micro-reprise câblée ; correcteur encore non validé sur jeu indépendant. |
| **5. Banque BAC + simulation** | **8,0** | 28 PDF officiels 2013-2026, 4 blancs intégraux 5+7+8 / 270 min, chronomètre persistant ; pas de corrigés PDF ni de sessions de rattrapage. |
| **6. UX / ergonomie cognitive** | **7,0** | RTL, sombre, 3 tailles, a11y verrouillée, offline soigné (134 Ko gzip à l'entrée) — mais `dist` à **108 Mo** et aucune mesure sur bas de gamme. |
| **7. Interactif & engagement** | **7,5** | SRS, tuteur local, badges/séries et boucle d'apprentissage complète ; manquent l'adaptatif temps réel, le push et la communauté. |
| **8. Fiabilité & économie** | **6,0** | CI **rouge (3/5 jobs)**, pas de FAQ, freemium 1 200 DA qui verrouille les unités 6-11 ; distribution et avis **non vérifiables**. |

---

## 3. 📈 SCORE GLOBAL PONDÉRÉ

| Axe | Note | Poids | Contribution |
|---|---|---|---|
| 1 | 8,5 | 15 % | 12,75 |
| 2 | 7,5 | 12 % | 9,00 |
| **3** | **7,0** | **18 %** | **12,60** |
| 4 | 8,0 | 12 % | 9,60 |
| 5 | 8,0 | 10 % | 8,00 |
| 6 | 7,0 | 10 % | 7,00 |
| 7 | 7,5 | 13 % | 9,75 |
| 8 | 6,0 | 10 % | 6,00 |
| **TOTAL** | | **100 %** | **74,70** |

### ⇒ **74,7 / 100** (≈ 75/100)

**[I]** Lecture du chiffre : l'application a **gagné** sur le contenu depuis octobre (difficulté QCM, U11, 4 blancs intégraux, a11y, APK) et **perdu** sur la cohérence du parcours (paywall) et la porte qualité (CI rouge). Le score global reste ~75, mais **la nature du risque a changé** : ce n'est plus « pas assez de matière », c'est « le guidage se coupe en cours de route ». Pour un élève non abonné, en rétrogradant l'Axe 3 à 5,0 et l'Axe 8 à 5,0, le score tombe à **≈ 70,1 / 100**.

---

## 4. ✅ POINTS FORTS (top 5, par impact)

1. **[Axe 3]** **Une seule consigne à la fois.** `خطوتك التالية` + 3 parcours avant les outils secondaires (verrou `DashboardViewHierarchy.test.tsx`), `SECONDARY_NAV` vide, 28 vues lazy, un conseil de rubrique unique, Déclic 1×/jour. C'est la réponse directe et réussie à « l'élève submergé ».
2. **[Axe 1]** **Traçabilité disciplinaire rare.** `curriculumOfficial.ts` (heures/semaines/compétences), 35 errata du manuel pour ne jamais sanctionner une erreur imprimée, `NON_EXIGIBLES`, chapitres « ثقافة générale » signalés, tests d'intégrité. Le dépôt s'interdit d'inventer — et le dit quand l'ancrage est bruité.
3. **[Axe 3/7]** **Personnalisation déduite, pas déclarée.** 5 phases + « creux » (`phaseEleve.ts`), diagnostic par unité via le **جسر**, `classerParUrgence`, escalade du capitaine (3 échecs → le motif se tait, 4ᵉ → relais humain), auto-évaluation de sa propre restitution. Aucun questionnaire à remplir, aucune case à cocher.
4. **[Axe 4/5]** **Le BAC tel qu'il est, pas tel qu'on l'imagine.** 5+7+8 = 20 pts, 4 h 30, 28 PDF officiels 2013-2026, 4 sujets blancs originaux avec registres d'attendus et notation calibrée, chronomètre qui survit au rechargement.
5. **[Axe 6/8]** **Offline et sobriété pour le contexte algérien.** SW à précache sélectif conditionné au réseau, APK Capacitor `minSdk 24` (Android 7-8), 134 Ko gzip à l'entrée, zéro pub, zéro tracker, tuteur IA **local** (aucun appel réseau pour réviser).

---

## 5. ❌ POINTS FAIBLES (top 5, par gravité)

1. **[Axe 3/8 — bloquant] Le plan guidé prescrit 41 % de contenu verrouillé.** Mesure : plan 30 j/90 min = 2 688 min, **1 112 min sur U6-U11** ; 1ʳᵉ unité recommandée = **U6**, payante. `revisionPlan.ts` / `RevisionPlanView` / `ParcoursView` n'appliquent aucun filtre d'accès. **[I]** Le coach envoie l'élève non abonné droit dans un mur, au moment précis où il a accepté d'être guidé.
2. **[Axe 8 — bloquant] CI `master` rouge, 3 jobs / 5.** Assertion `store.pg.dates.test.ts:21` dépendante du fuseau, `.github/workflows/ci.yml` sans `TZ`, runners UTC. **[I]** Toute régression peut passer inaperçue ; c'est aussi le premier signal qu'un élève « installe » indirectement via la confiance des mainteneurs.
3. **[Axe 3 — majeur] SRS hors du parcours.** SM-2 canonique, 4 boutons, échéances, J+1/3/7/14, micro-remédiations… mais `TaskKind` du plan quotidien ne contient aucun geste « rappel ». **[I]** La répétition espacée reste **une option** dans un onglet, alors que c'est le mécanisme d'ancrage le plus robuste contre l'oubli à J-30.
4. **[Axe 2/3 — majeur] Pas de hiérarchisation au grain de la leçon.** Aucun 🔴/🟡/🟢 par chapitre ; `unitPriority` n'est visible que dans 2 écrans ; `priorites_pedagogiques.json` n'est pas consommé par le code ; `classerParUrgence` est appelé sans `poidsBac`. **[I]** L'élève sait quelles **unités** pèsent, pas quelles **leçons** sauver à J-7.
5. **[Axe 6/8 — majeur] 108 Mo embarqués + distribution non établie.** 94 Mo de PDF dans `dist` (= contenu de l'APK), aucun `ios/`, store/avis/installs **non vérifiables**, aucune mesure sur smartphone ≤ 2 Go. **[I]** Le produit est techniquement sobre à l'exécution mais lourd à installer — le premier filtre d'accès pour le public visé.

---

## 6. 🔧 RECOMMANDATIONS

### 🔴 HAUTE PRIORITÉ — bloquant pour l'apprentissage

| # | Axe | Action concrète & chiffrée | Preuve attendue |
|---|---|---|---|
| **H1** | **3 + 8** | **Réconcilier plan et accès.** Dans `buildRevisionPlan()`, filtrer `UNIT_OPENINGS` sur `UNITES_GRATUITES` quand `accesActuel().statut === 'gratuit'` (et **laisser le plan complet** en essai/abonnement) ; **ou**, meilleur pédagogiquement, ouvrir gratuitement **U6 + U7** (39 % du poids annoncé au programme, 18,4 % de la pression réellement constatée 2016-2026) et garder U8-U11 en premium. Afficher dans `RevisionPlanView` un libellé « unité non incluse » plutôt qu'une tâche morte. | Test `planAcces.lock.test.ts` : plan gratuit = 0 minute sur U6-U11 ; **0 tâche morte** sur 261 ; plan abonné inchangé (2 688 min, 11 unités). |
| **H2** | **8** | **Rendre la CI verte.** Remplacer dans `server/store.pg.dates.test.ts:20` l'instant absolu `new Date("2027-06-29T23:00:00.000Z")` par un **minuit local** `new Date(2027, 5, 30, 0, 0, 0)` (le contrat de `isoleDate` = composantes locales), ou ajouter `env: TZ: Africa/Algiers` aux 5 jobs — **la 1ʳᵉ option est la bonne** : elle rend le test vrai sous tout fuseau. | `TZ=UTC npx vitest run server/store.pg.dates.test.ts` → 3/3 ; `TZ=UTC npx jest --config tests/jest.ci.config.cjs server/store.pg.dates.test.ts` → 3/3 ; run CI **5/5 verts**. |
| **H3** | **3** | **Injecter le SRS dans le plan quotidien.** Ajouter `'rappel'` à `TaskKind`, puiser les cartes dues via `getSrsState`/`sortByDue` (`flashcardsSrs.ts`), plafonner à **3 cartes / jour** (≈ 3 min), les placer en **tête de journée** avant `capsule`, et les exclure des 2 derniers jours de consolidation. | `buildRevisionPlan({daysLeft:14,minutesPerDay:60})` contient ≥ 1 tâche `rappel` par jour quand ≥ 1 carte est due, 0 quand aucune ; test `srsDansPlan.lock.test.ts` vert. |
| **H4** | **3** | **Brancher le poids BAC sur le coach** : `classerParUrgence(diags, unitPriority)` dans `useInvitationCapitaine.ts:148` (1 ligne) + indexer `FamilleCompetence.verdicts` par `unitId` plutôt que par titre arabe pour permettre la jointure. | Test : à verdicts égaux, U6 (24,9) passe avant U10 (3,0) ; `etatEleve.test.ts` mis à jour, 0 régression sur 13/13 motivation. |

### 🟡 MOYENNE PRIORITÉ — améliore l'expérience

| # | Axe | Action concrète & chiffrée | Preuve attendue |
|---|---|---|---|
| **M1** | **2 + 3** | **Hiérarchiser au grain leçon, sans annotation manuelle** : projeter dynamiquement `unitPriority` + verdict `diagnostic.ts` sur les **58 leçons** en 4 états (🔴 faible / 🟡 moyen / 🟢 fort / ⚪ non mesuré), avec un verrou « `etatEleveSiChargee() === null` ⇒ aucune couleur ». **Zéro** donnée stockée, **zéro** `App.tsx`. | Badge présent sur 58/58 leçons ; `hierarchieLecons.lock.test.tsx` : null → 0 couleur, faible → 🔴, fort → 🟢 ; poids BAC utilisé uniquement comme départage. |
| **M2** | **6 + 8** | **Alléger l'APK** : exclure `bac-sujets/*.pdf` du `webDir` embarqué (94 Mo → ~14 Mo), les servir à la demande avec mise en cache SW, et ne garder dans l'APK que 2 sujets (2025 + 2026). | `du -sh dist` ≤ **20 Mo** ; `bacPdf.lock.test.ts` toujours vert ; test `apkPoids.lock.test.ts` ≤ 20 Mo. |
| **M3** | **4** | **Valider le correcteur sur 30 copies indépendantes** : exécuter `M3_PROTOCOLE_VALIDATION_30_COPIES_2026-10-21.md` (30 copies jamais vues, 3 notes profs, MAE ≤ 1,0 pt, κ ≥ 0,80), publier le rapport même défavorable ; puis rééquilibrer les paliers QCM vers **D1 75 % / D2 20 % / D3 5 %** par ajout de 200 QCM D1. | Rapport commité avec MAE/κ réels ; `difficulteQcm.lock.test.tsx` mis à jour (nouveaux compteurs), 0 QCM sans palier. |
| **M4** | **5** | **Compléter la banque BAC** : ajouter les **sessions de rattrapage** (2 sujets/an sur 2016-2026 = ~22 PDF légers) et un corrigé jury annoté par session pour **au moins 5 années**, plus des statistiques de réussite par type d'exercice dans `examLog.ts`. | `BAC_PDF_INDEX` étendu aux sessions `rattrapage` ; 5 corrigés indexés ; `StatsView` affiche ≥ 3 courbes par unité. |
| **M5** | **8 + 7** | **FAQ + rappels hors-app** : une page « الأسئلة الشائعة » (10 questions : offline, code d'activation, changement de téléphone, données, 1 200 DA, J-7…) et Web Push **opt-in** à fréquence max **1/jour**, jamais après 21 h, branché sur les échéances SM-2. | `faq.test.ts` 10 entrées ; `push.test.ts` 1 notification/jour max, 0 envoi hors plage 8 h-21 h, respect de `prefers-reduced-motion`. |

### 🟢 BASSE PRIORITÉ — confort / bonus

| # | Axe | Action concrète & chiffrée |
|---|---|---|
| **B1** | **6** | Tester sur **3 devices réels bas de gamme** (Itel A60, Redmi A3, Samsung A04e) : FCP < 2 s, ouverture `LessonsView`, RAM, scroll 60 fps ; publier `docs/TESTS_PERFORMANCE.md`. |
| **B2** | **2** | Glossaire autonome **≥ 300 termes AR (+ équivalent FR en code/docs)**, indexé dans `SearchView`, avec `glossaire.lock.test.ts`. |
| **B3** | **7** | Communauté asynchrone légère (Q&A par chapitre, 5 unités pilotes U1/U4/U6/U7/U11), modérée par un prof référent, lisible hors ligne. |
| **B4** | **6** | Généraliser `prefers-reduced-motion` (aujourd'hui 1 fichier) et porter `aria-*` de 167 à ≥ 250 occurrences sur les 76 vues. |

---

## 7. 🏆 VERDICT FINAL

**L'application est-elle prête pour le marché ?** **[I]** **Pas encore en l'état**, pour trois raisons mesurées : (1) un parcours guidé qui envoie l'élève gratuit vers 41 % de contenu payant, (2) une CI `master` rouge sur 3 jobs/5, (3) un paquet installable de 108 Mo sans publication store vérifiable. Le **fond pédagogique**, lui, est prêt — et même au-dessus de la moyenne des produits de révision bac que l'on rencontre.

**Est-elle à recommander aux élèves de Bac ?** **[I]** **Oui, comme complément encadré**, à trois conditions explicites : expliquer que le المجال 1 (U1-U5) est gratuit à vie et que U6-U11 demandent 1 200 DA/an ou l'essai de 30 jours ; conseiller de **commencer par le plan de révision**, pas par la bibliothèque ; prévenir que la date du BAC dans l'app est **provisoire**. Pour un élève non abonné seul, je recommande de l'utiliser sur U1-U5 uniquement et de compléter U6-U11 par le manuel — sinon la guidance devient trompeuse.

**Risque principal :** **[I]** **ni la surcharge, ni l'inexactitude avérée — mais la rupture du guidage.** L'app a précisément conquis le terrain de la surcharge (`خطوتك التالية`, 28 vues lazy, plan déterministe, micro-capsules < 90 s). Ce qui reste, c'est un coach qui s'interrompt au milieu de sa propre consigne (paywall), une répétition espacée qui ne nourrit pas le plan, et un correcteur dont la justesse n'est pas validée indépendamment. **[NV]** L'inexactitude scientifique exhaustive reste **non vérifiable** sans relecture disciplinaire intégrale — je ne l'affirme pas.

**Les 3 ajouts les plus urgents :**
1. **H1** — aligner `buildRevisionPlan()` sur l'accès (ou ouvrir U6/U7) : **0 minute prescrite sur du contenu verrouillé**.
2. **H2** — réparer le test de fuseau : **CI 5/5 verte**, mesure qualité restaurée.
3. **H3** — intégrer **3 cartes SRS dues / jour** en tête du plan quotidien : l'ancrage cesse d'être optionnel.

*En parallèle, sans attendre : alléger l'APK (M2) et publier la fiche store — sinon les trois ajouts ci-dessus ne toucheront que les élèves déjà installés.*

**Note de confiance globale : ⭐⭐⭐⭐ (4/5).** Les notes s'appuient sur des mesures exécutées (imports TS, build, budgets, tests, CI, fichiers) et non sur des déclarations ; il manque une étoile pour la relecture disciplinaire intégrale, les tests sur devices réels, la validation indépendante du correcteur et les données de distribution — tous explicitement **[NV]**.

---

## ANNEXE — INVENTAIRE DES « NON VÉRIFIABLE »

| Élément demandé | Statut | Pourquoi |
|---|---|---|
| Dernière version **en vigueur** du programme ministériel (post-2017 ?) | **NV** | Aucun accès au site du Ministère depuis cet environnement ; le dépôt ancre ses sources à جوان 2017. |
| Exactitude scientifique **exhaustive** des 25 leçons + 531 QCM | **NV** | Relecture disciplinaire mot à mot non réalisée ; seule la discipline de traçabilité a été auditée (35 errata, tests d'intégrité). |
| Note / avis / nombre d'installations (Play Store, App Store) | **NV** | Aucun accès aux stores ; `metadata.json` `majorCapabilities: []`. |
| Publication effective Play Store / App Store ; iOS | **NV / absent** | Projet `android/` présent, **aucun `ios/`** ; aucune trace de fiche publiée dans le dépôt. |
| Temps de chargement < 2 s, FCP, RAM ≤ 2 Go, 60 fps | **NV** | Aucun test sur device réel ; seules les tailles de bundle sont mesurées (134 Ko gzip à l'entrée). |
| Validation indépendante du correcteur | **NV (protocole prêt, non exécuté)** | `M3_PROTOCOLE_VALIDATION_30_COPIES_2026-10-21.md` = « à exécuter par un humain » ; 40 copies = corpus de calibration. |
| Interdiction du corrigé avant la fin de l'épreuve | **NV** | Aucune garde temporelle explicite trouvée dans `Bac2025ExamView` / `MockExamPanel`. |
| Sync cloud de bout en bout, stabilité long terme, conformité RGPD juridique | **NV** | Serveur et politique de confidentialité présents, mais aucun test de parc réel / audit juridique. |
| Publicité en production | **NV** | 0 tracker trouvé dans les sources ; le comportement d'un déploiement tiers n'est pas audité. |

---

*Méthode : mesures exécutées le 2026-11-03 sur `718d1fe` — `npm run lint`, `npm run build`, `scripts/buildBudgets.mjs`, `npm run test:build`, ciblages vitest/jest sous 2 fuseaux, `gh run view 41466381160`, imports `tsx` des modules de données, inventaire `dist/`. Aucun fichier source modifié par cet audit (`git status` propre ; `dist/` ignoré).*
