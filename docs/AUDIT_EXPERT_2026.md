# Audit expert — Kunz El Ouloum (كنز العلوم) · SVT BAC Algérie

**Date :** 12 août 2026
**Objet audité :** dépôt `sinamind414/kunz-el-ouloum`, commit `aea890c`, branche d'audit `arena/019ff4f0-kunz-el-ouloum`
**Nature :** application React 19 / Vite 6 / TypeScript + Capacitor 8, offline-first, arabe RTL, ciblant la 3AS Sciences Expérimentales (BAC DZ)
**Posture d'audit :** expert senior — pédagogie SVT, UX/UI, QA, conformité académique, produit

---

## Périmètre, méthode et limites de l'audit

### Ce sur quoi cet audit s'appuie (vérifiable, reproductible)

| Méthode | Détail |
|---|---|
| Lecture de code | ~462 fichiers hors `node_modules` ; composants, moteurs, corpus, config |
| Parsing analytique du corpus | extraction JSON des 508 QCM depuis `src/quizCorpus.ts`, statistiques sur gabarits, distracteurs, explications |
| Exécution de tests | `npm run test:unit` (346 tests), `npm run test:smartbot`, `npx tsc --noEmit` |
| Build de production | `npm run build` → mesure réelle des bundles + gzip |
| Tests d'intrusion pédagogique | injection de réponses volontairement absurdes dans `ValidationEngine` via `tsx` |
| Tests fonctionnels du tuteur | 10 questions d'élève réalistes (dont darija) passées à `answerTutorQuestion()` |
| Runtime partiel | serveur dev lancé, `curl /` → 200, `/api/health` → ok |
| Recoupement externe | programme officiel 3AS Sciences Expérimentales (3 domaines) — sources web |

### Limites — à lire avant toute décision

1. **Aucune inspection visuelle réelle. `NON VÉRIFIABLE`.** L'installation de Chromium/Playwright a échoué définitivement dans l'environnement d'audit (`ECONNRESET` sur `cdn.playwright.dev`, puis `fonts-freefont-ttf` introuvable). **Aucune capture d'écran, aucun test E2E, aucune mesure de contraste réelle, aucun Lighthouse.** Tout jugement UX/UI et accessibilité ci-dessous est **déduit du code** (classes Tailwind, attributs ARIA, structure JSX) et non observé. Les notes UX/UI et Accessibilité sont donc données avec une marge d'incertitude que je signale explicitement.
2. **Aucun test sur Android réel ni sur APK.** Le comportement Capacitor (WebView, permissions runtime, performances sur mobile d'entrée de gamme algérien) est **`HYPOTHÈSE`** raisonnée, pas une mesure.
3. **Aucune donnée d'usage** (rétention, taux de complétion, funnel). Aucun jugement quantitatif de rétention n'est possible.
4. **Aucun accès à un enseignant SVT algérien certifié** pour valider ligne à ligne l'exactitude scientifique des 508 QCM et des 23 leçons. J'ai audité **la structure, la méthode de production et des échantillons**, pas la totalité du contenu disciplinaire. Un item peut être scientifiquement faux sans que je l'aie détecté.
5. **Les placeholders du brief ([NOM], [LIEN]…) n'ont pas été renseignés.** J'ai audité le dépôt réel plutôt que d'attendre — c'est la source la plus fiable disponible.
6. **Modification faite par l'auditeur, à connaître :** j'ai ajouté `server: { host: '0.0.0.0', allowedHosts: true }` dans `vite.config.ts` pour pouvoir lancer le serveur de dev dans le sandbox. **Cette ligne n'est pas du code produit ; à retirer ou isoler avant merge.**

### Auto-correction : trois erreurs de mon analyse préliminaire, corrigées

L'honnêteté d'audit impose de signaler mes propres faux positifs, détectés en re-vérifiant avec un parseur correct :

- ❌ **« Absence totale de génétique et de reproduction »** → **FAUX, retiré.** Le programme officiel 3AS Sciences Expérimentales ne comporte que **3 domaines** (التخصص الوظيفي للبروتينات / تحويل الطاقة / التكتونية العامة). La génétique mendélienne et la reproduction **ne sont pas au programme du BAC DZ pour cette filière**. Les 11 unités de l'app correspondent bien à ces 3 domaines. C'était une erreur de ma part, corrigée.
- ❌ **« 98,4 % des questions suivent 10 gabarits »** → **imprécis.** Le chiffre exact après parsing correct : **500/508 questions générées par gabarit** (ids 1–500), réparties sur ~10 familles dominantes (37 à 40 occurrences chacune). Le fond du constat tient, la formulation initiale était fausse.
- ❌ **« Corpus formellement solide = qualité »** → la validité formelle est réelle mais elle **masque** l'invalidité pédagogique. Voir §C.3.

---

## A. Résumé exécutif

### Note globale : **48 / 100**

### Verdict : **PARTIELLEMENT PRÊTE**

Traduction sans langue de bois : **la coquille technique est de bonne facture, le contenu pédagogique central ne l'est pas.** L'application est solide là où l'on mesure des octets (build, offline, sécurité, permissions) et faible là où l'on mesure de l'apprentissage (QCM, explications, correction des réponses ouvertes). En l'état, un élève peut l'utiliser des heures, voir des scores élevés, et **ne pas progresser** — pire, se croire prêt alors qu'il ne l'est pas. C'est le risque numéro un de ce produit, et il est pédagogique, pas technique.

### 5 forces réelles

1. **Offline-first authentique, pas marketing.** Service worker à caches versionnés (`kunz-offline-web-shell-{v}` / `-runtime-{v}`), précache des 23 leçons HTML, collecte dynamique via `assets/images/schemas/manifest.json`. Le tuteur ne fait **aucun appel LLM/API** — vérifié. Dans un pays où la data mobile est un coût réel, c'est un vrai avantage produit.
2. **Empreinte de sécurité et de vie privée minimale par conception.** **2 permissions Android seulement** (`INTERNET`, `ACCESS_NETWORK_STATE`), `allowMixedContent: false`, CSP stricte côté Express (`connect-src 'self' https://*.supabase.co`). Aucun SDK publicitaire, aucun tracker tiers, aucun dark pattern, aucun paiement. Sur un public mineur, cette sobriété est remarquable et rare.
3. **Le moteur méthodologique est une vraie idée pédagogique.** `ValidationEngine` (T1–T12) encode des *lois de rédaction* propres à l'épreuve SVT algérienne : « كلما… كلما » sur document quantitatif, « بينما / في حين » sur qualitatif, « نفترض أن » pour l'hypothèse, interdiction de réfuter brutalement H2, distinction PPM/PPSE à la jonction neuromusculaire. Des messages d'erreur en fus'ha figée, indexés par loi. **C'est le meilleur actif du produit** — et il est aujourd'hui saboté par son barème (voir faiblesse 2).
4. **Les 8 QCM écrits à la main (ids 501–508) sont d'excellente qualité.** Explications substantielles (« ARN polymérase ouvre la double hélice, lit le brin transcrit 3'→5' pour assembler l'ARNm 5'→3' »), distracteurs plausibles, référence à des schémas. **Ils prouvent que l'équipe sait produire du bon contenu** — elle ne l'a fait que 8 fois sur 508.
5. **Base technique saine.** `tsc --noEmit` passe (exit 0, vérifié), build en 6,25 s, JS gzip total **≈ 173 kB** (index 111 K + vendor-react 59 K + icons 3,4 K) — nettement **meilleur** que les « ~291 kB » annoncés dans `SPECKIT_FINAL.md`. Exercices d'analyse documentaire réels avec sous-questions q1/q2/q3 (`nmj_ppm_courbe`, `curare_table`, `michaelis_courbe`…).

### 5 faiblesses critiques

1. **🔴 98,4 % du corpus QCM est généré par machine, avec des explications tautologiques.** 500 questions sur 508 (ids 1–500) sortent de ~10 gabarits ; **500/500 de leurs explications contiennent littéralement le texte de la bonne option**, sous la forme « ‹terme› يرتبط هنا بـ : ‹bonne réponse› » (64 caractères en moyenne). **L'élève qui se trompe n'apprend rien** : on lui répète la bonne réponse sans jamais lui dire pourquoi la sienne était fausse. C'est la faille pédagogique centrale du produit.
2. **🔴 Le correcteur de réponses ouvertes valide du charabia — 20/20.** Test d'intrusion exécuté : la chaîne `« بلابلا بلابلا كلما نفترض أن إنزيم 5 مول بينما وثيقة 1 وثيقة 2 يربط المقدمة الخاتمة نستنتج جزيئي خلوي وظيفي »` (mots-clés empilés, zéro sens) obtient **20/20 et PASS sur les 12 verbes d'action**. Le simple mot **« نعم » (« oui ») obtient 11 à 17/20 selon le verbe.** Cause : `computeScore` part de 20 et **soustrait** des pénalités ; en l'absence d'erreur détectée, le score reste maximal. Le moteur sait punir des fautes de forme, il ne sait pas vérifier qu'une réponse dit quelque chose. **Un élève qui découvre ça — et il le découvrira — perd toute confiance dans l'app.**
3. **🔴 Environ 49 % des QCM sont devinables sans aucune connaissance SVT.** Stratégie naïve testée sur les 508 items : « choisir l'option la moins recyclée dans le corpus » → **251/508 = 49,4 % de réussite** (hasard = 25 %). Cause : 38 distracteurs sont réutilisés ≥ 5 fois, jusqu'à **41 fois** pour « يحدث في كل البروتينات بالطريقة نفسها دون نوعية » et 40 fois pour « يستعمل CO2 كمستقبل نهائي للإلكترونات في التنفس » — ce dernier étant proposé comme leurre sur des questions de biochimie *et* de géologie. **Conséquence directe : les scores affichés à l'élève sont surévalués d'un facteur ≈ 2.**
4. **🔴 Contradiction frontale entre les CGU et le code — sur un public mineur.** `TermsModal.tsx` affirme en arabe que « toutes tes données sont conservées **localement sur ton appareil uniquement** » et que « nous ne collectons/stockons/vendons **aucune** donnée personnelle sur un serveur externe ». Or `src/utils/telemetryService.ts` envoie vers Supabase (table `telemetry_events`) **8 types d'événements** — `APP_OPENED`, `QUIZ_COMPLETED`, `METHOD_FAIL`, `PRO_TEASER_CLICKED`… — avec `user_id`, payload et `is_online`. **Aucun consentement, aucun opt-out.** C'est un risque juridique et surtout un problème éthique : on ment à des lycéens dans le document censé les protéger.
5. **🔴 Faux contenu affiché comme vrai + suite de tests en échec sur l'onboarding.** `StatsView.tsx` affiche `mockCardData`, `mockQuizHistory`, `mockQuizTimeline` en **fallback silencieux** : un élève sans historique voit « تركيب البروتين 75 % / 3 sur 4 » — une progression **qui n'existe pas**. En parallèle, `npm run test:unit` échoue : **7 tests / 346, dans 4 fichiers / 40**, tous concentrés sur le **parcours débutant et les cartes visuelles** (`TrainingView.beginnerMode`, `MyPathView.beginnerPath`, `LessonsView.visualCards`, `activeLessons`). La régression touche précisément l'élève le plus fragile. Cela **invalide factuellement** `audit_report.md` qui conclut « 139 tests, prêt pour la production ».

### Niveau de risque global : **ÉLEVÉ**

Décomposition :

| Type de risque | Niveau | Motif |
|---|---|---|
| Risque pédagogique | **ÉLEVÉ** | Scores surévalués ×2, explications vides, charabia noté 20/20 → fausse confiance avant un examen national |
| Risque juridique / éthique | **ÉLEVÉ** | CGU mensongères + télémétrie sans consentement sur mineurs |
| Risque de réputation | **ÉLEVÉ** | Un seul élève qui poste « j'ai écrit نعم et j'ai eu 17/20 » suffit à tuer le produit |
| Risque technique | **FAIBLE** | Build sain, tsc OK, offline solide, sécurité sobre |
| Risque business | **MOYEN** | Aucun modèle économique implémenté, mais aucune dette non plus |

---

## B. Tableau de scoring détaillé

| # | Catégorie | Note | Justification | Preuve / indice observé | Impact sur l'élève | Priorité |
|---|---|---|---|---|---|---|
| 1 | **Alignement programme BAC Algérie** | **7/10** | Les 11 unités couvrent fidèlement les 3 domaines officiels 3AS. Bonne couverture fine : الشفرة الوراثية (8 q), المخدرات (11), السيدا (9), الإدماج العصبي (11), كالفن (11), كريبس (10), ويلسون (12), الأفيوليت (13). Trous réels mais localisés. | Parsing des 508 QCM par mot-clé : **0 question** sur اللقاح/المصل, **0** sur الاصطدام/السلاسل الجبلية, **0** sur الصخور المتحولة, **1** sur الطفرات, **2** sur الفسفرة التأكسدية, **3** sur الظهرة. | Impasse involontaire sur des chapitres tombables (métamorphisme, collision continentale sont des classiques du sujet géologie). | **P2** |
| 2 | **Exactitude scientifique** | **6/10** | Les échantillons lus sont corrects et le vocabulaire arabe scientifique est juste (fus'ha, terminologie officielle avec équivalents français entre parenthèses). Mais 500 items générés n'ont **aucune trace de relecture enseignante**, et des distracteurs sont scientifiquement absurdes plutôt que faux-plausibles. | « يستعمل CO2 كمستقبل نهائي للإلكترونات في التنفس » utilisé **40 fois**, y compris hors du chapitre respiration. Aucun fichier de validation/relecture dans le dépôt. `NON VÉRIFIABLE` : exactitude ligne à ligne des 508 items (nécessite un enseignant certifié). | Risque d'ancrage d'erreurs. Un distracteur hors-sujet n'enseigne pas la distinction fine que l'examen, lui, exigera. | **P1** |
| 3 | **Qualité pédagogique** | **3/10** | Le point le plus faible. La boucle « je me trompe → je comprends pourquoi » est **rompue** : 500 explications sur 508 se contentent de répéter la bonne réponse. Aucune remédiation, aucune anticipation de l'erreur classique. | `explanation` = « ‹X› يرتبط هنا بـ : ‹texte exact de la bonne option› » dans **500/500** cas générés (vérifié par comparaison littérale). Longueur moyenne 64 car. Les 8 items manuels (501–508) montrent, par contraste, ce qui aurait dû être fait. | L'élève mémorise des couples question–réponse au lieu de comprendre des mécanismes. Échec assuré dès que le sujet reformule. | **P1** |
| 4 | **Qualité des exercices / évaluations** | **3/10** | Corpus formellement irréprochable mais **exploitable sans savoir**. Le Défi BAC n'est pas un sujet BAC. Le correcteur ouvert est cassable trivialement. | (a) Heuristique « option la moins recyclée » = **49,4 %** de réussite. (b) 38 distracteurs réutilisés ≥5×. (c) `bacGenerator.ts` concatène `KNOWLEDGE_CARDS` (4 pts, question stéréotypée « اشرح الموضوع التالي بدقة علمية : {titre} ») + `BOSS_FIGHT_SCENARIOS` (6 pts) — **aucune annale officielle, pas de structure partie 1/partie 2, pas de barème officiel**. (d) charabia → 20/20. Crédit honnête : 0 doublon, 0 index hors bornes, 4 options partout, index correct équilibré (126/127/129/126), « option la plus longue » ne marche que 13 % du temps. | L'élève s'entraîne sur un simulateur mal calibré. Le jour J, l'écart entre le score simulé et le score réel sera brutal. | **P1** |
| 5 | **UX / UI** | **6/10** | `HYPOTHÈSE` (pas d'inspection visuelle). Architecture 4 onglets lisible, RTL correct dès `index.html` (`lang="ar" dir="rtl"`), thème vert `#006d37`, quiz avec mode focus et chrono affiché. Mais 36 composants pour 4 onglets suggère une redondance de parcours (Dashboard / MyPath / Lessons / LessonAdventurePortal / UnitIntroPortal…), et le parcours débutant est cassé. | `QuizView.tsx:22` chrono 900 s. 36 composants non-test. 3 tests d'onboarding en échec. `InteractiveLessonView.tsx` = 2055 lignes, `MethodologyView.tsx` = 1533 lignes → composants monolithiques, difficiles à faire évoluer. | Confusion sur « par où je commence », surtout pour l'élève faible — précisément la cible que les tests cassés concernent. | **P2** |
| 6 | **Accessibilité / inclusion** | **4/10** | Faible. Volume d'ARIA très insuffisant, typographie petite fréquente, aucune prise en compte des préférences de mouvement. | **24 occurrences** de `aria-label`/`role` sur 36 composants. **125 occurrences** de `text-[9px]`/`text-[10px]` — sous le seuil de confort de lecture, aggravé en arabe où les diacritiques et les points distinctifs se perdent. **0 occurrence** de `prefers-reduced-motion` dans tout `src/` et `public/`. `NON VÉRIFIABLE` : contrastes réels, navigation lecteur d'écran. | Élèves malvoyants, dyslexiques, ou simplement sur petit écran d'entrée de gamme : lecture pénible, certains parcours inaccessibles au clavier/lecteur d'écran. | **P2** |
| 7 | **Performance technique** | **7/10** | Bon, avec deux réserves sérieuses. Bundle JS mesuré **meilleur que documenté**. Mais 10,6 Mo d'assets et une obfuscation hostile au runtime. | `npm run build` OK **6,25 s** ; gzip : index **111 K**, vendor-react **59 K**, icons **3,4 K** ≈ **173 K** total (vs « ~291 kB » dans SPECKIT — doc à corriger). `dist/` = 13 Mo. **`mascot.png` = 1,9 Mo en 1024×1024**, servi comme icône PWA 192px *et* 512px. `schema_16_subduction.png` = 1,1 Mo, `schema_17_collision.png` = 964 Ko. Obfuscation prod : `debugProtection` + interval 2000 ms, `selfDefending`, `controlFlowFlattening: 0.5`, `deadCodeInjection: 0.2`, `stringArrayEncoding: base64`, `sourcemap: false`. | ~11 Mo au premier lancement = coût data réel en Algérie. L'obfuscation à intervalle consomme CPU/batterie en continu sur mobile d'entrée de gamme ; `sourcemap: false` rend tout crash non diagnosticable. | **P2** |
| 8 | **Localisation Algérie** | **7/10** | Bonne localisation de surface : arabe fus'ha scolaire, terminologie du programme DZ, français technique entre parenthèses comme dans les manuels, RTL natif, compte à rebours BAC. Manque la darija et les repères concrets. | `BAC_DATE_TARGET = new Date('2027-06-07T08:00:00+01:00')` — **fuseau +01:00 correct**, mais date **codée en dur** : elle sera fausse chaque année et l'app n'a aucun mécanisme de mise à jour. Test tuteur : « شرحلي كيفاش تدير الاستنساخ » (darija) est **correctement routé** vers la carte « تركيب البروتين » — bon point. Mais « عندي غدوة البكالوريا وماقريتش والو » (détresse en darija) est routé vers… **« بنية الكرة الأرضية »**. | Le compte à rebours deviendra faux et décrédibilisera l'app. L'élève en panique reçoit une réponse hors-sujet au pire moment. | **P2** |
| 9 | **Motivation / rétention** | **5/10** | Les briques existent (XP, badges, streak, missions, countdown, mode crise, rappels espacés) mais elles sont soit non câblées, soit alimentées par de fausses données — donc contre-productives. | `spacedRecallService.ts` est un **vrai moteur** (seuil `score ≥ 70` ET `validationResult.passed` ET `matched.length ≥ prompt.minEvidence`, génère `MasteryEvidence`) mais **n'est pas déclenché par l'UI** (confirmé par `SPECKIT_FINAL.md`). Rappels = `Notification.requestPermission()` sur un simple `localStorage` (`App.tsx:132-136`) — **aucune notification planifiée réelle**, pas de `LocalNotifications` Capacitor : si l'app est fermée, l'élève n'est jamais rappelé. `StatsView` affiche des stats fictives. | Gamification qui récompense sans mesurer. Faux progrès = démotivation à la découverte, ou pire, fausse sécurité. | **P1** (fausses données) / **P3** (features) |
| 10 | **Éthique / monétisation** | **5/10** | Note scindée : **9/10 sur l'absence de prédation**, **2/10 sur la sincérité**. Aucune pub, aucun paiement, aucun dark pattern — exemplaire. Mais CGU contredites par le code, et un teaser « Pro » qui promet un produit inexistant. | `PRO_TEASER_CLICKED` tracké depuis `CoachView.tsx:242` alors que le discours affiche « مجاني 100% » (`MethodologyTrainer.tsx:230`, `MethodologyView.tsx:1518`). Aucun SDK ads (grep exhaustif). Contradiction CGU/télémétrie documentée en A.4. | L'élève est protégé commercialement mais trompé sur ses données. Sur mineurs, c'est le point le plus grave après la pédagogie. | **P1** |
| 11 | **Sécurité / confidentialité** | **6/10** | Périmètre d'attaque volontairement réduit et bien pensé. Mais l'authentification est laxiste et le stockage local est en clair. | **2 permissions Android** seulement ; CSP stricte dans `server.ts` ; `allowMixedContent: false` ; **0 vulnérabilité npm**. Côté faible : mot de passe **≥ 6 caractères**, pas de confirmation d'e-mail, pas de « mot de passe oublié », pas de double saisie, **pas de lien CGU à l'inscription** ; profil en clair dans `localStorage['kunz_user']` (**e-mail en clair**) ; commentaire d'en-tête mentionnant « Google OAuth » qui ne correspond à aucun code. Télémétrie sans consentement (cf. A.4). | Compte d'élève facile à compromettre et irrécupérable en cas d'oubli de mot de passe (aucun reset) → perte de progression, abandon. | **P1** (télémétrie/CGU) / **P2** (auth) |
| 12 | **Valeur globale / positionnement** | **5/10** | Différenciation réelle et défendable (**tuteur 100 % offline sans LLM** — rare et pertinent en Algérie), mais la promesse produit n'est pas tenue par le contenu, et le README surpromet. | README annonce « 500 QCM » **+** « 500 flashcards » : or `SVT_FLASHCARDS = SVT_QUIZ_QUESTIONS.map(...)` — **ce sont les mêmes 508 items reconditionnés**, `answerBullets` = bonne option + explication tautologique. Annonce « 23 leçons » : 23 fichiers HTML existent bien (944 Ko, autonomes, CSS inline, `dir="rtl"`, contenu de bonne tenue) mais **hors du moteur React** — `ACTIVE_LESSONS` ne câble que **9 entrées**, dont des ids dupliqués. | L'écart promesse/réalité se paie en désinstallations et en bouche-à-oreille négatif — le seul canal d'acquisition réaliste pour ce produit. | **P1** |

**Moyenne pondérée → 48/100.** Le calcul n'est pas une moyenne arithmétique brute : les catégories 3, 4 et 10 (pédagogie, exercices, éthique) sont pondérées double, car un produit éducatif qui échoue à enseigner et qui trompe sur les données ne peut pas être compensé par un bon score de build.

---

## C. Audit détaillé par rubrique

### C.1 — Alignement au programme BAC Algérie · 7/10

**Points positifs.** La structure en 11 unités est un découpage fidèle des 3 domaines officiels de la 3AS Sciences Expérimentales : (1) التخصص الوظيفي للبروتينات — synthèse protéique, relation structure/fonction, catalyse enzymatique, défense du soi, communication nerveuse ; (2) تحويل الطاقة — photosynthèse, respiration/fermentation, bilan énergétique ; (3) التكتونية العامة — structure de la Terre, structures géologiques, tectonique. La répartition des QCM par unité est équilibrée (de 37 à 61 items, aucune unité orpheline). Le vocabulaire suit la convention des manuels algériens : terme arabe + équivalent français entre parenthèses (`ARN بوليميراز (ARN polymérase)`).

**Problèmes.**

- **Trous de couverture localisés mais tombables.** Recherche par mot-clé sur les 508 énoncés : **0 question** sur le vaccin/sérum (اللقاح/المصل), **0** sur la collision continentale et les chaînes de montagnes (الاصطدام/السلاسل الجبلية), **0** sur le métamorphisme (الصخور المتحولة), **1** seule sur les mutations (الطفرات), **2** sur la phosphorylation oxydative, **3** sur la dorsale (الظهرة). Or collision et métamorphisme sont des sujets récurrents de la partie géologie.
- **Déséquilibre profond entre domaines sur les exercices de haut niveau.** Les exercices d'analyse documentaire réels (`documentAnalysisExercises.ts` : `nmj_ppm_courbe`, `ach_jnm_schema`, `ppse_ppsi_compare`, `curare_table`, `sarin_gb_double`, `michaelis_courbe`, `enzyme_ph_temp`) sont **quasi tous sur le domaine 1**. Les domaines 2 et 3 n'ont pratiquement que des QCM générés. C'est un déséquilibre grave : l'épreuve du BAC accorde un poids important à la géologie.
- **Verrouillage séquentiel rigide.** `unitCatalog.ts` : unités 2→11 en `isLocked: true`, déverrouillées via `progress.completedUnits.includes(unit.id - 1)` (`DashboardView.tsx:23`). Un élève de mars qui veut réviser la tectonique **doit d'abord terminer 9 unités**. C'est l'inverse de l'usage réel en période de révision.
- **Origine du corpus non académique.** `unitCatalog.ts` est auto-généré depuis un ancien projet Flutter ; 120 questions Flutter ont été écartées faute de support `fillBlank`. Le corpus n'a jamais été construit *depuis* le programme officiel, il a été *migré*.

**Recommandations.** (1) Combler les 6 trous identifiés par des items rédigés à la main : ~40 questions ciblées suffisent. (2) Rééquilibrer les exercices documentaires : minimum 8 exercices domaine 2, 10 domaine 3 (courbes sismiques P/S, profils de Moho, cartes d'anomalies magnétiques, coupes de subduction — matière abondante). (3) Remplacer le verrouillage séquentiel par un déverrouillage libre + recommandation intelligente (« on te conseille de commencer par X », sans interdire). (4) Publier une matrice de couverture programme ↔ items, maintenue dans le dépôt.

### C.2 — Exactitude scientifique · 6/10

**Points positifs.** Les échantillons lus sont scientifiquement corrects, y compris sur des points où les erreurs sont fréquentes : sens de lecture du brin transcrit (3'→5') et synthèse de l'ARNm (5'→3') ; rôle du polysome ; les 4 éléments de l'activation d'un acide aminé (aa, ARNt, enzyme spécifique aminoacyl-ARNt synthétase, ATP). Le `ValidationEngine` encode même des finesses que beaucoup d'apps ratent : l'acétylcholine ouvre des canaux **ligand-dépendants (nicotiniques)**, pas voltage-dépendants (`FORBIDDEN_VOLTAGE_GATED_ACH`) ; au niveau de la plaque motrice on parle de **PPM et non de PPSE** (`WRONG_PPM_PPSE`, sévérité critique) ; fibrillation ≠ tétanie, question de dose (`FIBRILLATION_TETANIE_MIX`). C'est du travail d'enseignant, pas de développeur.

**Problèmes.**

- **Aucune trace de relecture scientifique.** Aucun fichier de validation, aucune signature d'enseignant, aucun changelog de correction dans le dépôt. 500 items générés sont donc **non relus** par construction.
- **Distracteurs scientifiquement absurdes plutôt que didactiquement faux.** Un bon distracteur incarne une **confusion réelle d'élève**. Ici, « يستعمل CO2 كمستقبل نهائي للإلكترونات في التنفس » (40×) ou « يمثل مرحلة جيولوجية عميقة لا علاقة لها بالخلايا » (35×) apparaissent sur des questions sans rapport. Ils ne testent rien : ils sont éliminables au premier coup d'œil, ce qui explique mécaniquement le taux de devinabilité de 49 %.
- **`NON VÉRIFIABLE` — et c'est un point que je refuse d'arrondir :** je n'ai pas pu faire valider les 508 items et les 23 leçons par un professeur de SVT algérien. Mon audit porte sur la **méthode de production** (qui est défaillante) et sur des **échantillons** (qui sont bons). Statistiquement, un corpus généré et non relu contient presque certainement des erreurs que je n'ai pas vues.

**Recommandations.** (1) **Relecture humaine obligatoire des 500 items générés** par au moins un enseignant SVT 3AS en exercice, avec traçabilité (`reviewedBy`, `reviewedAt`, `status` dans le schéma de données). (2) Interdire par test automatisé qu'un distracteur soit réutilisé plus de 3 fois, et qu'il apparaisse hors de son domaine. (3) Reconstruire les distracteurs à partir d'une **banque d'erreurs typiques** documentées par les enseignants (chaque distracteur doit être étiqueté avec la misconception qu'il cible).

### C.3 — Qualité pédagogique · 3/10 — *le cœur du problème*

**Le constat, chiffré.** Sur les 508 QCM :

- **8 items (ids 501–508)** ont une explication réelle, qui décrit un mécanisme.
- **500 items (ids 1–500)** ont une explication de la forme `« ‹terme› يرتبط هنا بـ : ‹texte exact de la bonne option› »`. Vérification littérale : **500/500** contiennent le texte de la bonne option. Longueur moyenne : **64 caractères** (min 38, max 149).

Concrètement :

> **Q :** في محور 1.1 — ADN، الجين والشفرة الوراثية، أي وصف دقيق لـ«الجين»؟
> **Bonne option :** قطعة من ADN تحمل معلومة تركيب سلسلة ببتيدية أو بروتين معين
> **Explication :** الجين يرتبط هنا بـ: قطعة من ADN تحمل معلومة تركيب سلسلة ببتيدية أو بروتين معين.

L'« explication » est la reproduction verbatim de la réponse. **Pédagogiquement, la valeur ajoutée est nulle.** Le feedback correctif — le seul moment où un QCM enseigne réellement — n'existe pas dans 98,4 % des cas.

**Pourquoi c'est le problème n°1 et pas un détail de contenu.** Toute l'architecture du produit (missions, rappels espacés, détection de lacunes, XP) repose sur l'hypothèse que **l'élève apprend en se trompant puis en comprenant**. Si l'étape « comprendre » est vide, tout l'édifice tourne à vide, quelle que soit la qualité du code qui l'anime. Investir dans de nouvelles features avant de corriger ça, c'est ajouter des étages sur des fondations creuses.

**Aggravant : le mode « erreurs précédentes » ne remédie pas.** Le tuteur enregistre les `mistakes` par `topicId` et repropose des questions du même sujet (`crisisEngine.ts` double la pondération des topics ratés). Mais reproposer une question sur un sujet raté **sans jamais expliquer l'erreur** ne fait que répéter l'échec.

**Ce qui sauve la note de 0.** Le `MethodologyView` et le `ValidationEngine` incarnent une vraie doctrine pédagogique (les « lois » de rédaction SVT), et les messages d'erreur méthodologiques, eux, **sont explicatifs et actionnables** : « الوثيقة نوعية: تجنّب «كلما» واستعمل «بينما» أو «في حين». → القانون 2 ». C'est exactement le niveau de feedback qui manque au QCM. **Le savoir-faire est dans la maison — il n'a simplement pas été appliqué au corpus.**

**Recommandations.** (1) **Réécrire les explications, par ordre de fréquence d'apparition** : les 100 items les plus servis d'abord (impact maximal, coût maîtrisé). Format imposé : *pourquoi la bonne réponse est bonne* (1 phrase mécanisme) + *pourquoi l'erreur la plus probable est fausse* (1 phrase) + *le piège BAC associé* (1 phrase). (2) Attacher à chaque distracteur la misconception qu'il cible, et servir l'explication **spécifique au distracteur choisi** — c'est ce qui transforme un QCM en outil d'apprentissage. (3) Ajouter un test CI qui **échoue** si une explication contient plus de 60 % du texte de la bonne option.

### C.4 — Qualité des exercices et des évaluations · 3/10

#### a) Le QCM est devinable — démonstration

Test exécuté sur les 508 items. Stratégie **sans aucune connaissance SVT** : compter la fréquence de chaque option dans tout le corpus, choisir **l'option la moins fréquente**.

```
stratégie « option la moins recyclée » : 251/508 = 49,4 %   (hasard = 25 %)
stratégie « option la plus longue »    :  66/508 = 13,0 %
distribution de l'index correct        : {0:126, 1:127, 2:129, 3:126}
distracteurs réutilisés ≥ 5 fois       : 38
top : 41× « يحدث في كل البروتينات بالطريقة نفسها دون نوعية. »
      40× « يستعمل CO2 كمستقبل نهائي للإلكترونات في التنفس. »
      38× « هو بنية ثابتة لا تتأثر بالشروط الفيزيائية أبداً. »
      37× « يحدث دائماً داخل النواة ولا يرتبط بباقي العضيات. »
      37× « يدل على وسط صلب دائماً مهما كانت المعطيات الزلزالية. »
```

Un élève qui « sent » que l'option étrange et jamais revue est la bonne double son score sans réviser. **Les scores de l'app sont donc surévalués d'environ un facteur 2.** Un élève à 70 % dans l'app est plausiblement à ~40 % de maîtrise réelle. Avant un examen national, c'est un mensonge dangereux.

À créditer honnêtement : la qualité **formelle** est irréprochable — 0 doublon d'énoncé, 0 `correctAnswerIndex` hors bornes, 4 options partout, position de la bonne réponse parfaitement équilibrée, la « réponse la plus longue » ne fonctionne que 13 % du temps (les auteurs ont pensé à ce biais classique). Le problème n'est pas le soin, c'est la **méthode de génération**.

#### b) Le correcteur de réponses ouvertes valide n'importe quoi — démonstration

Test d'intrusion exécuté contre `validateAnswer()`, les 12 verbes d'action :

```
verbe        | charabia bourré de mots-clés | réponse « نعم » | vide
identify     | 20/20 PASS                   | 17/20 PASS      | 0/20 FAIL
describe     | 20/20 PASS                   | 14/20 PASS      | 0/20 FAIL
analyse      | 20/20 PASS                   | 11/20 PASS      | 0/20 FAIL
interpret    | 19/20 PASS                   | 16/20 PASS      | 0/20 FAIL
explain      | 20/20 PASS                   | 17/20 PASS      | 0/20 FAIL
compare      | 20/20 PASS                   | 14/20 PASS      | 0/20 FAIL
hypothesize  | 20/20 PASS                   | 14/20 PASS      | 0/20 FAIL
validate     | 20/20 PASS                   | 16/20 PASS      | 0/20 FAIL
synthesize   | 20/20 PASS                   | 16/20 PASS      | 0/20 FAIL
schematize   | 20/20 PASS                   | 17/20 PASS      | 0/20 FAIL
justify      | 19/20 PASS                   | 16/20 PASS      | 0/20 FAIL
critique     | 20/20 PASS                   | 17/20 PASS      | 0/20 FAIL
```

Chaîne de charabia utilisée : `بلابلا بلابلا كلما نفترض أن إنزيم 5 مول بينما وثيقة 1 وثيقة 2 يربط المقدمة الخاتمة نستنتج جزيئي خلوي وظيفي` — zéro sens, mais tous les marqueurs attendus.

**Cause racine**, `src/lib/validation/scoring.ts` :

```ts
export function computeScore(errors, maxScore) {
  const penalty = errors.reduce((s, e) => s + SEVERITY_PENALTY[e.severity], 0);
  return Math.max(0, Math.min(maxScore, maxScore - penalty));   // part de 20
}
```

Le score **part du maximum** et ne descend que si une erreur est *détectée*. Le moteur ne vérifie jamais qu'une réponse **contient du contenu attendu** — il n'y a pas de score positif à gagner, seulement des points à perdre. Le seul garde-fou (`TOO_SHORT`, sévérité `minor` = −1 point) est dérisoire : « نعم » perd 1 point pour brièveté.

**Pourquoi les 12 tests T1–T12 ne l'ont pas vu.** Ils passent tous (12/12), mais ils sont **exclusivement construits en faux négatifs** : chaque test vérifie qu'une faute connue est bien détectée. **Aucun test ne vérifie qu'une non-réponse est rejetée.** C'est un angle mort classique de conception de suite de tests, et il est ici total.

#### c) Le « Défi BAC » n'est pas un sujet BAC

`src/utils/bacGenerator.ts` : `generateBacExam(domain)` concatène des `KNOWLEDGE_CARDS` (4 points, énoncé stéréotypé « اشرح الموضوع التالي بدقة علمية : {titre} ») et des `BOSS_FIGHT_SCENARIOS` (6 points). Durées : D1 50 min, D2 80 min, D3 110 min. Il manque **tout ce qui définit l'épreuve réelle** : structure partie 1 / partie 2, exploitation de documents notée, barème officiel, format et durée réels de l'épreuve, sujets d'annales. Un élève qui « réussit le Défi BAC » n'a aucune indication sur sa performance réelle à l'examen.

**Recommandations.** (1) Corriger `computeScore` en **score positif** : points gagnés pour éléments attendus présents (couples valeur+unité, relation causale, niveaux d'organisation, cible moléculaire), pénalités **par-dessus**. Plancher : aucune réponse < 25 mots utiles ne peut dépasser 8/20. (2) Ajouter immédiatement des **tests de faux positifs** (charabia, mot unique, copie de l'énoncé, mots-clés sans syntaxe) — ils doivent tous échouer sous le seuil. (3) Intégrer de **vraies annales** (sujets BAC DZ des 8 dernières années, disponibles publiquement) avec corrigés et barèmes officiels. (4) Interdire par lint la réutilisation d'un distracteur au-delà de 3 occurrences.

### C.5 — UX / UI · 6/10 · `HYPOTHÈSE` (aucune inspection visuelle)

**Points positifs déduits du code.** RTL correct au niveau racine (`<html lang="ar" dir="rtl">`), identité visuelle cohérente (vert `#006d37`, `theme-color` aligné dans `index.html` et `manifest.json`), mode focus au quiz avec chronomètre visible et réponse verrouillée après validation (`QuizView.tsx:92` — bon choix pédagogique, empêche le tâtonnement), PWA installable en `standalone`.

**Problèmes.**

- **Prolifération de parcours concurrents.** 36 composants non-test pour 4 onglets, dont `DashboardView`, `MyPathView`, `LessonsView`, `LessonAdventurePortal`, `UnitIntroPortal`, `InteractiveLessonView` — plusieurs points d'entrée vers le même contenu. `HYPOTHÈSE` : l'élève ne sait pas où commencer.
- **Le parcours débutant est cassé.** 3 des 7 tests en échec le visent directement : `TrainingView.beginnerMode` (`getByTestId('training-beginner-launchpad')` introuvable), `MyPathView.beginnerPath` (« affiche un vrai point de départ débutant et ouvre l'onglet training »), `LessonsView.visualCards` (4 échecs : miniatures, cartes visuelles, ouverture de leçon active). **La porte d'entrée de l'élève faible ne fonctionne pas.**
- **Composants monolithiques.** `InteractiveLessonView.tsx` = 2055 lignes, `MethodologyView.tsx` = 1533 lignes. Coût de maintenance élevé, risque de régression à chaque évolution.
- **Racine du dépôt polluée.** ~25 scripts `patch*.py`, `fix_*.py`, `_coach.patch`, `_speech.patch`, `add_qcm.py` versionnés. Sans effet pour l'élève, mais **signal fort de dette** : le contenu a été produit et rafistolé par scripts ad hoc, ce qui corrobore le diagnostic sur le corpus.

**Recommandations.** (1) Réparer les 7 tests **avant toute nouvelle feature** — ils décrivent des parcours cassés, pas des tests obsolètes. (2) Un seul point d'entrée décisionnel : « Reprendre / Diagnostic / Réviser un chapitre ». (3) Découper les deux composants > 1500 lignes. (4) Sortir les scripts de patch dans `tools/` ou les supprimer.

### C.6 — Accessibilité et inclusion · 4/10

**Constats mesurés.** **24** occurrences de `aria-label`/`role` réparties sur 36 composants — très en dessous du nécessaire pour une app à forte interaction (quiz, cartes, onglets, modales). **125** occurrences de `text-[9px]` / `text-[10px]` : en arabe, ces tailles rendent les points diacritiques (ب/ت/ث, ج/ح/خ) difficilement distinguables sur écran d'entrée de gamme. **0** occurrence de `prefers-reduced-motion` dans tout le projet, alors que `motion` (Framer) est une dépendance active — les élèves sensibles au mouvement n'ont aucune échappatoire. Aucun réglage de taille de police dans l'app.

`NON VÉRIFIABLE` : ratios de contraste réels, ordre de tabulation, restitution par lecteur d'écran, zones tactiles ≥ 44 px. Un audit axe/Lighthouse est indispensable et n'a pas pu être exécuté ici.

**Recommandations.** (1) Plancher typographique à 14 px pour tout texte de contenu ; réserver 10–11 px aux badges non essentiels. (2) Réglage de taille de police in-app (3 crans) — peu coûteux, fort impact. (3) Respecter `prefers-reduced-motion` globalement. (4) Passer `jsx-a11y` en CI et viser ≥ 90 sur l'axe accessibilité Lighthouse. (5) Vérifier que chaque schéma SVG/PNG a une alternative textuelle : un schéma de subduction sans description est inaccessible **et** inexploitable en révision auditive.

### C.7 — Performance technique · 7/10

**Mesures réelles.** Build `npm run build` : **✓ 6,25 s**. Bundles gzip : `index` **111 K**, `vendor-react` **59 K**, `vendor-icons` **3,4 K** → **≈ 173 K de JS gzip**. CSS `21,3 K` gzip. `dist/` total **13 Mo** (dominé par les assets). `tsc --noEmit` → **exit 0** (l'affirmation « tsc OK » d'`audit_report.md` est ici **confirmée**).

**Écart de documentation à corriger :** `SPECKIT_FINAL.md` annonce « bundle vendor ~291 kB gzip ». La mesure réelle est **≈ 173 kB**. La doc sous-estime la qualité du travail — à corriger, mais dans le bon sens.

**Problèmes.**

- **`mascot.png` : 1,9 Mo, 1024×1024**, référencé comme favicon **et** comme icône PWA en 192px **et** en 512px. Le navigateur télécharge 1,9 Mo pour afficher une icône de 192 px. **Correction en 10 minutes, gain immédiat de ~1,8 Mo.**
- **Assets lourds non optimisés.** `schema_16_subduction.png` 1,1 Mo, `schema_17_collision.png` 964 Ko, `schema_09_photosynthese.png` 672 Ko. Total `public/` = **10,6 Mo**. Conversion WebP/AVIF : **60–80 % de gain** sans perte perceptible.
- **Obfuscation hostile au produit.** `debugProtection: true` + `debugProtectionInterval: 2000` exécute une boucle anti-debug **toutes les 2 secondes en continu** ; s'ajoutent `selfDefending`, `controlFlowFlattening: 0.5`, `deadCodeInjection: 0.2`, `stringArrayEncoding: base64`. Coût CPU et batterie permanent sur les appareils d'entrée de gamme — exactement le parc visé. Et `sourcemap: false` : **aucun crash n'est diagnosticable**. `HYPOTHÈSE` : impact batterie mesurable, non quantifié faute d'appareil réel.
- **Ratio protection/valeur défavorable.** On protège par obfuscation lourde un contenu dont on a montré qu'il est en grande partie généré — et donc facilement régénérable par un tiers. L'actif défendable, c'est la qualité pédagogique, pas le bytecode.

**Recommandations.** (1) Générer `icon-192.png` et `icon-512.png` dédiés, retirer le 1024 du chemin critique. (2) Pipeline WebP + `<picture>` fallback : ~7 Mo économisés. (3) **Désactiver `debugProtection` et `selfDefending`** ; conserver au plus un `stringArray` léger. (4) Activer les sourcemaps privées + un crash reporter respectueux de la vie privée. (5) Afficher le poids du pack offline **avant** téléchargement et permettre le téléchargement **par domaine** — sur un forfait algérien, ~11 Mo imposés d'un bloc est une friction réelle.

### C.8 — Localisation Algérie · 7/10

**Points positifs.** Arabe fus'ha scolaire correct, terminologie conforme au programme DZ, français technique entre parenthèses comme dans les manuels — cette convention bilingue est bien respectée, elle compte beaucoup pour la crédibilité auprès des élèves et des enseignants. RTL natif. Fuseau horaire correct (`+01:00`). Reconnaissance vocale prévue avec repli `ar-DZ` → `ar-SA` (`SpeechToTextInput.tsx:28`) — pragmatique, faute de modèle darija.

Test réel de compréhension darija : « شرحلي كيفاش تدير الاستنساخ » → **correctement routé** vers la carte « تركيب البروتين ». Bon point, non trivial.

**Problèmes.**

- **Date du BAC codée en dur** : `BAC_DATE_TARGET = new Date('2027-06-07T08:00:00+01:00')`. Aucun mécanisme de mise à jour ni de configuration à distance. Le compte à rebours — élément émotionnel central de l'app — **deviendra faux** et la décrédibilisera.
- **Le tuteur échoue sur la détresse en darija.** « عندي غدوة البكالوريا وماقريتش والو » (« j'ai le bac demain et je n'ai rien révisé ») → réponse : **« بنية الكرة الأرضية »** (structure de la Terre). De même « كيف أراجع في أسبوع قبل البكالوريا؟ » → **« بنية الكرة الأرضية »**. Le routage retombe sur une carte par défaut au lieu de reconnaître une intention méta (stratégie de révision, panique). Or `crisisEngine.ts` et `countdownEngine.ts` **contiennent exactement les réponses attendues** — elles ne sont simplement pas branchées sur ces intentions.
- **Aucun repère local concret** : pas de calendrier des vacances scolaires DZ, pas de coefficients par filière, pas de mention des sujets d'annales par année.

**Recommandations.** (1) Rendre la date du BAC configurable (fichier JSON versionné + mise à jour au chargement si en ligne, valeur par défaut sinon). (2) Ajouter une **couche d'intentions** au tuteur avant le matching de contenu : « stratégie de révision », « panique/temps court », « organisation » → router vers `countdownEngine`/`crisisEngine`. Gain immédiat pour un coût faible. (3) Étendre le lexique darija (au moins 200 formulations d'élèves collectées réellement).

### C.9 — Motivation et rétention · 5/10

**Points positifs.** L'arsenal conceptuel est là et il est bien pensé : `countdownEngine` avec 5 paliers émotionnels calibrés (détendue ≥ 90 j → plan ≥ 45 j → action ≥ 15 j → crise ≥ 7 j → code rouge), chacun avec un message **et une recommandation d'action** — c'est de la bonne conception motivationnelle. `crisisEngine` sur-pondère les topics ratés. `spacedRecallService` implémente une vraie logique de maîtrise (`score ≥ 70` **ET** `validationResult.passed` **ET** `matched.length ≥ prompt.minEvidence` → génère une `MasteryEvidence`) — c'est plus rigoureux que la plupart des apps du marché.

**Problèmes.**

- **Le moteur de rappel espacé n'est pas branché sur l'UI** (confirmé par `SPECKIT_FINAL.md`). Le meilleur mécanisme de rétention du produit **ne tourne jamais**.
- **Les rappels ne rappellent rien.** `App.tsx:132-136` : `handleScheduleReminder` écrit un timestamp dans `localStorage` et appelle `Notification.requestPermission()`. **Aucune notification n'est jamais planifiée**, aucun usage de `LocalNotifications` de Capacitor. Si l'élève ferme l'app, il n'est jamais recontacté. Le mécanisme de rétention n° 1 sur mobile est inopérant.
- **Fausse progression = démotivation programmée.** `StatsView.tsx` : `mockCardData` (l.42), `mockQuizHistory` (l.57), `mockQuizTimeline` (l.72) affichés en **fallback silencieux** (l.203, 241, 271, 279, 292). Un élève neuf voit « تركيب البروتين 75 % », « 3 sur 4 ». Quand il comprendra que c'était faux, il ne fera plus confiance à aucun chiffre de l'app — y compris les vrais.
- **Gamification découplée de la maîtrise.** `computeXp` : ≥16 → 15 XP, ≥10 → 10 XP, ≥5 → 5 XP. Combiné au barème cassé (C.4.b), **on distribue 15 XP pour du charabia**. Récompenser le bruit détruit la valeur du signal.

**Recommandations.** (1) **Supprimer purement et simplement les données fictives** ; état vide honnête et engageant (« Commence ton premier quiz pour voir tes stats »). (2) Brancher `spacedRecallService` sur l'UI — le travail est déjà fait à 80 %. (3) Notifications locales réelles via Capacitor `LocalNotifications`, planifiées, avec préférence horaire. (4) Recalculer l'XP **après** correction du barème.

### C.10 — Éthique et monétisation · 5/10

**Points positifs — et ils sont substantiels.** Aucun paiement, aucun abonnement, aucune publicité, **aucun SDK publicitaire** (grep exhaustif), aucun dark pattern, aucun timer culpabilisant, aucune loot box. Sur un public de lycéens stressés, ce niveau de sobriété commerciale est rare et mérite d'être souligné. L'implémentation technique de la télémétrie est par ailleurs soignée : file `localStorage` bornée (100/80), debounce 5 min, gestion de `QuotaExceeded`, non bloquante hors ligne.

**Problèmes.**

- **🔴 CGU contredites par le code.** `TermsModal.tsx` affirme aux élèves que toutes leurs données restent **uniquement sur l'appareil** et qu'**aucune donnée personnelle n'est envoyée à un serveur externe**. `telemetryService.ts` envoie à Supabase 8 événements (`APP_OPENED`, `METHOD_FAIL`, `METHOD_SUCCESS`, `PRO_TEASER_CLICKED`, `GUEST_LOGIN_OFFLINE`, `QUIZ_COMPLETED`, `BOSS_COMPLETED`, `DOMAIN_SELECTED`) avec `user_id`, payload et `is_online`. **Aucun consentement, aucun opt-out, public mineur.** Que ce soit une négligence plutôt qu'une intention ne change rien à l'exposition : c'est faux dans le document même censé garantir la vérité.
- **Le teaser « Pro » vend du vide.** `PRO_TEASER_CLICKED` est tracké (`CoachView.tsx:242`) alors que l'app clame « مجاني 100% » et qu'aucune offre Pro n'existe. Mesurer l'appétence est légitime ; le faire sans consentement et en contradiction avec le discours affiché ne l'est pas.
- **Modèle économique inexistant.** Pas de dette éthique, mais pas de trajectoire de viabilité non plus. Un produit gratuit sans modèle finit par ne plus être maintenu — c'est un risque pour les élèves qui en dépendent.

**Recommandations.** (1) **Immédiat — choisir l'une des deux options, cette semaine :** soit désactiver la télémétrie et honorer les CGU, soit réécrire les CGU en décrivant exactement ce qui est collecté, avec **opt-in explicite** (par défaut : désactivé). Option A recommandée à court terme : elle est plus rapide, plus sûre juridiquement, et cohérente avec le positionnement « 100 % offline ». (2) Ne rien tracker de nominatif sur mineurs ; agréger et anonymiser. (3) Modèle économique honnête à envisager : cœur gratuit + pack annales corrigées / suivi enseignant payant, sans jamais dégrader le cœur.

### C.11 — Sécurité et confidentialité · 6/10

**Points positifs.** Surface d'attaque délibérément réduite : **2 permissions Android** (`INTERNET`, `ACCESS_NETWORK_STATE`) — remarquable pour une app éducative, la plupart en demandent 8 à 15. `supportsRtl=true`, `allowMixedContent: false`. CSP stricte côté Express (`connect-src 'self' https://*.supabase.co`), en-têtes de sécurité, catch-all SPA hors `/api/*`. **0 vulnérabilité npm.** Supabase entièrement optionnel : l'app fonctionne sans aucune clé.

**Problèmes.**

- **Authentification laxiste.** Mot de passe **≥ 6 caractères** seulement, pas de confirmation d'e-mail, **pas de « mot de passe oublié »** (un élève qui oublie perd son compte et sa progression, définitivement), pas de double saisie, **pas de lien vers les CGU à l'inscription** — ce qui, combiné à C.10, signifie que l'élève accepte des conditions qu'il n'a pas vues et qui sont de surcroît inexactes.
- **Données locales en clair.** `localStorage['kunz_user']` contient le profil, **e-mail en clair**, lisible par tout script exécuté dans la WebView.
- **`allowBackup=true`** dans le manifeste Android : les données de l'app remontent dans la sauvegarde Google, sans que l'utilisateur en soit informé — encore une contradiction avec « uniquement sur ton appareil ».
- **Commentaire trompeur** : l'en-tête d'`AuthContext` mentionne « Google OAuth », absent du code. Détail, mais symptomatique d'une documentation qui décrit une intention plutôt que la réalité — le même travers que les CGU et le README.

**Recommandations.** (1) Mot de passe ≥ 10 caractères + indicateur de robustesse + double saisie. (2) Implémenter la réinitialisation de mot de passe (Supabase l'offre nativement — coût quasi nul). (3) Lien CGU obligatoire à l'inscription. (4) Passer `allowBackup=false` ou documenter clairement. (5) Ne pas stocker l'e-mail en clair ; un identifiant opaque suffit à l'usage local.

### C.12 — Positionnement produit et avantage concurrentiel · 5/10

**L'avantage réel, et il est défendable.** « Tuteur SVT fonctionnant **entièrement hors ligne, sans LLM, sans clé API** » est un positionnement pertinent et rare : il élimine le coût data, le coût d'inférence, la latence, la dépendance réseau et le risque d'hallucination. Dans le contexte algérien (connectivité inégale, forfaits coûteux, appareils modestes), c'est un vrai différenciateur face aux apps de révision génériques et aux chatbots.

**Ce qui l'annule aujourd'hui.**

- **Le README surpromet.** « 500 QCM » **+** « 500 flashcards » suggère 1000 items. Or `SVT_FLASHCARDS = SVT_QUIZ_QUESTIONS.map(...)` : ce sont **les mêmes 508 items reconditionnés**, avec `answerBullets` = bonne option + explication tautologique. Le compte honnête est : **508 items, dont 8 de qualité rédactionnelle**.
- **« 23 leçons » est vrai dans les fichiers, faux dans le produit.** Les 23 HTML existent (944 Ko, autonomes, CSS inline, `dir="rtl"`, contenu de bonne tenue à la lecture) mais vivent **hors du moteur React** : statiques, non instrumentés, aucune progression captée, aucun lien avec les QCM ou le rappel espacé. `ACTIVE_LESSONS` ne câble que **9 entrées**, dont des ids dupliqués (`d1-u1-l1-expression-genique`, `d1-u1-l2-transcription`, `d1-u3-l1-enzyme`…). Le meilleur contenu rédigé du projet est le moins exploité.
- **Aucune caution académique.** Aucun enseignant nommé, aucun établissement partenaire, aucune validation officielle. Sur un marché où la confiance parentale et enseignante décide de l'installation, c'est bloquant.

**Recommandations.** (1) Aligner le README sur la réalité **avant toute diffusion** — la crédibilité perdue au premier élève qui compte est très coûteuse. (2) **Intégrer les 23 leçons HTML au moteur React** : c'est l'actif de contenu le plus sous-exploité (leçon → QCM ciblés → rappel espacé → maîtrise). (3) Obtenir la caution nominative d'au moins un enseignant SVT 3AS et l'afficher.

---

## D. Liste des problèmes classés

### 🔴 CRITIQUE — bloquant pour une diffusion large

| # | Problème | Pourquoi c'est critique | Impact élève | Solution | Effort | Impact estimé |
|---|---|---|---|---|---|---|
| **C1** | 500/508 explications tautologiques (« ‹terme› يرتبط هنا بـ : ‹bonne réponse› ») | Le feedback correctif est le seul moment où un QCM enseigne. Il est vide dans 98,4 % des cas. | Aucune remédiation possible ; mémorisation par cœur de couples Q/R ; échec dès reformulation | Réécrire les explications (mécanisme + réfutation du distracteur + piège BAC). Prioriser les 100 items les plus servis. Test CI bloquant si l'explication reprend > 60 % de la bonne option | **Élevé** | ⭐⭐⭐⭐⭐ |
| **C2** | Le correcteur ouvert note 20/20 du charabia ; « نعم » = 11–17/20 | Barème purement soustractif partant de 20 ; aucun test de faux positif dans T1–T12 | Confiance détruite dès la découverte ; méthodologie apprise à l'envers | Score **positif** (points gagnés par élément attendu) + plancher (< 25 mots utiles ⇒ ≤ 8/20) + suite de tests de faux positifs | **Moyen** | ⭐⭐⭐⭐⭐ |
| **C3** | ~49 % des QCM devinables sans connaissance (38 distracteurs recyclés ≥ 5×, jusqu'à 41×) | Le score affiché mesure la reconnaissance de gabarit, pas la maîtrise | **Scores surévalués ×2** → fausse confiance avant un examen national | Régénérer les distracteurs depuis une banque de misconceptions ; lint : max 3 réutilisations, jamais hors domaine | **Élevé** | ⭐⭐⭐⭐⭐ |
| **C4** | CGU affirment « aucune donnée envoyée » alors que 8 événements partent vers Supabase, sans consentement, sur mineurs | Risque juridique + rupture de confiance dans le document censé protéger | Données de mineurs collectées à leur insu | Désactiver la télémétrie **ou** CGU exactes + opt-in par défaut désactivé | **Faible** | ⭐⭐⭐⭐⭐ |
| **C5** | `StatsView` affiche des statistiques fictives en fallback silencieux | L'app ment sur la progression de l'élève | Fausse sécurité, puis perte de confiance dans tous les chiffres | Supprimer les mocks ; états vides honnêtes | **Faible** | ⭐⭐⭐⭐ |

### 🟠 MAJEUR

| # | Problème | Pourquoi | Impact élève | Solution | Effort | Impact |
|---|---|---|---|---|---|---|
| **M1** | 7 tests en échec / 346, tous sur le parcours débutant et les cartes visuelles | Régression sur l'onboarding de l'élève le plus fragile ; invalide `audit_report.md` | L'élève faible ne trouve pas son point de départ | Réparer avant toute nouvelle feature ; CI bloquante | **Moyen** | ⭐⭐⭐⭐ |
| **M2** | Défi BAC 100 % généré, sans annales ni barème officiel | Ne prépare pas au format réel de l'épreuve | Choc de format le jour J | Intégrer les annales BAC DZ (8 dernières années) + corrigés + barèmes | **Élevé** | ⭐⭐⭐⭐⭐ |
| **M3** | 23 leçons HTML hors du moteur React ; `ACTIVE_LESSONS` = 9 entrées avec doublons | Le meilleur contenu rédigé est le moins exploité, aucune progression captée | Rupture leçon → exercice → maîtrise | Intégrer les 23 leçons, dédupliquer les ids | **Moyen** | ⭐⭐⭐⭐ |
| **M4** | Rappels espacés jamais déclenchés ; notifications jamais planifiées | Le moteur de rétention n°1 est inopérant | Oubli et abandon | Brancher `spacedRecallService` sur l'UI + `LocalNotifications` Capacitor | **Moyen** | ⭐⭐⭐⭐ |
| **M5** | Verrouillage séquentiel des unités 2→11 | Empêche la révision ciblée, l'usage dominant en fin d'année | Frustration, désinstallation en période de révision | Déverrouillage libre + recommandation non contraignante | **Faible** | ⭐⭐⭐⭐ |
| **M6** | Pas de reset de mot de passe ; mot de passe ≥ 6 car. ; pas de lien CGU | Perte définitive de compte et de progression | Abandon | Reset Supabase natif + politique ≥ 10 car. + lien CGU | **Faible** | ⭐⭐⭐ |
| **M7** | `mascot.png` 1,9 Mo en icône ; 10,6 Mo d'assets ; pack offline ~11 Mo imposé | Coût data réel en Algérie | Renoncement à l'installation sur forfait limité | Icônes dédiées, WebP/AVIF, téléchargement par domaine avec poids affiché | **Faible** | ⭐⭐⭐⭐ |

### 🟡 MODÉRÉ

| # | Problème | Impact | Solution | Effort |
|---|---|---|---|---|
| **Mo1** | Trous programme : 0 question sur vaccin/sérum, collision, métamorphisme ; 1 sur mutations | Impasse sur des chapitres tombables | ~40 items rédigés à la main | Moyen |
| **Mo2** | Exercices documentaires concentrés sur le domaine 1 | Domaines 2 et 3 sous-entraînés | 8 exercices D2, 10 D3 | Moyen |
| **Mo3** | Obfuscation `debugProtection` (2 s) + `selfDefending` ; `sourcemap: false` | Batterie/CPU sur mobiles modestes ; aucun crash diagnosticable | Désactiver ; sourcemaps privées + crash reporter | Faible |
| **Mo4** | Accessibilité : 24 ARIA, 125 `text-[9-10px]`, 0 `prefers-reduced-motion` | Exclusion des élèves à besoins particuliers | Plancher 14 px, réglage de police, `jsx-a11y` en CI | Moyen |
| **Mo5** | Tuteur : intentions méta mal routées (panique, stratégie → « structure de la Terre ») | Réponse hors-sujet au pire moment | Couche d'intentions avant le matching de contenu | Faible |
| **Mo6** | Date BAC codée en dur (`2027-06-07`) | Compte à rebours faux dès l'an prochain | Config JSON versionnée + mise à jour à chaud | Faible |
| **Mo7** | README surpromet (« 500 QCM + 500 flashcards » = mêmes items) | Perte de crédibilité | Aligner la doc sur la réalité | Faible |

### 🔵 MINEUR

| # | Problème | Solution | Effort |
|---|---|---|---|
| **Mi1** | ~25 scripts `patch*.py` / `fix_*.py` à la racine | Déplacer dans `tools/` ou supprimer | Faible |
| **Mi2** | `InteractiveLessonView.tsx` 2055 l., `MethodologyView.tsx` 1533 l. | Découper | Moyen |
| **Mi3** | `SPECKIT_FINAL.md` annonce 291 kB gzip vs 173 kB réels | Corriger la doc | Faible |
| **Mi4** | Commentaire « Google OAuth » sans code correspondant | Nettoyer | Faible |
| **Mi5** | `allowBackup=true` non documenté | Passer à `false` ou documenter | Faible |
| **Mi6** | `vite.config.ts` modifié par l'auditeur (`allowedHosts: true`) | Retirer ou isoler en dev | Faible |

---

## E. Plan d'action priorisé 30 / 60 / 90 jours

### Jours 1–30 — « Arrêter de nuire » (crédibilité et honnêteté)

**Objectif : que rien de ce que l'app affiche à l'élève ne soit faux.**

*Quick wins (semaine 1, < 2 jours de travail cumulés)*

1. **Désactiver la télémétrie** (ou opt-in désactivé par défaut) — met fin à C4 en une heure.
2. **Supprimer les mocks de `StatsView`** → états vides honnêtes (C5).
3. **Icônes PWA dédiées** 192/512 ; retirer `mascot.png` 1,9 Mo du chemin critique (M7).
4. **Désactiver `debugProtection` + `selfDefending`** ; réactiver les sourcemaps privées (Mo3).
5. **Déverrouiller les unités** ; conserver une recommandation d'ordre (M5).
6. **Corriger README et SPECKIT** : 508 items dont 8 rédigés, 173 kB gzip (Mo7, Mi3).
7. **Retirer la ligne `allowedHosts: true`** laissée par l'audit (Mi6).

*Correctifs structurants du mois*

8. **Réparer les 7 tests en échec** et rendre la CI bloquante (M1).
9. **Corriger le barème du `ValidationEngine`** : score positif + plancher + **suite de tests de faux positifs** (charabia, mot unique, copie d'énoncé) — C2. *C'est le correctif au meilleur rapport impact/effort du plan.*
10. **Réécrire les explications des 100 QCM les plus servis** au format mécanisme + réfutation + piège BAC (début de C1).
11. **Reset de mot de passe + politique ≥ 10 caractères + lien CGU à l'inscription** (M6).

**Critère de sortie 30 j :** aucune donnée fictive affichée ; aucune affirmation fausse dans les CGU ; charabia noté < 8/20 ; CI verte.

### Jours 31–60 — « Rendre l'app réellement pédagogique »

12. **Réécrire les 400 explications restantes** (C1) — chantier principal, à répartir entre 2–3 enseignants.
13. **Régénérer les distracteurs** depuis une banque de misconceptions ; lint « max 3 réutilisations, jamais hors domaine » ; **re-mesurer la devinabilité** (cible : < 30 %) — C3.
14. **Intégrer les 23 leçons HTML au moteur React** ; dédupliquer `ACTIVE_LESSONS` (M3).
15. **Brancher `spacedRecallService` sur l'UI** + notifications locales Capacitor (M4).
16. **Combler les trous programme** : vaccin/sérum, collision, métamorphisme, mutations, phosphorylation oxydative, dorsale (~40 items) — Mo1.
17. **Relecture enseignante des 500 items générés** avec traçabilité (`reviewedBy`, `reviewedAt`) — C.2.
18. **Accessibilité** : plancher 14 px, réglage de police, `prefers-reduced-motion`, `jsx-a11y` en CI (Mo4).

**Critère de sortie 60 j :** devinabilité < 30 % ; 100 % des items relus par un enseignant ; leçons instrumentées.

### Jours 61–90 — « Devenir une référence »

19. **Annales BAC DZ des 8 dernières années**, corrigées, avec barèmes officiels et structure partie 1 / partie 2 (M2) — *le levier de différenciation le plus fort.*
20. **Exercices documentaires domaines 2 et 3** (Mo2) : courbes sismiques P/S, profils de Moho, anomalies magnétiques, coupes de subduction.
21. **Parcours « Objectif 14/20 » et « Objectif 16/20 »** (voir §F).
22. **Détection de lacunes** exploitant enfin des données réelles.
23. **Optimisation des assets** WebP/AVIF + téléchargement par domaine avec poids affiché (M7).
24. **Caution académique** : un enseignant SVT 3AS nommé, affiché dans l'app.
25. **E2E Playwright** sur les parcours critiques, et **audit visuel/Lighthouse réel** — le chaînon manquant de cet audit.

**Critère de sortie 90 j :** un élève peut faire une annale complète corrigée au barème officiel ; parcours par objectif de note opérationnels.

---

## F. Recommandations spécifiques SVT BAC Algérie

### F.1 Annales corrigées — la priorité de contenu n°1

Le manque le plus coûteux. Un élève algérien de terminale révise **par les sujets**. Recommandations concrètes : intégrer les sujets officiels des 8 dernières années (sessions normale et de remplacement), avec pour chacun : énoncé fidèle, documents, **barème officiel détaillé**, corrigé rédigé, et surtout **le lien vers les items d'entraînement de l'app correspondant à chaque question**. C'est ce dernier point qui transforme une banque d'annales en outil d'apprentissage — et l'app a déjà le moteur pour le faire.

### F.2 Approfondissement par domaine

- **Immunologie** (domaine 1, unité 4) : c'est le chapitre le plus tombable et le plus riche en documents. Ajouter : électrophorèse, Ouchterlony (déjà présent dans les tests du `ValidationEngine` — à exploiter dans les exercices), tests ELISA, cinétique des anticorps primaire/secondaire, VIH et évolution des populations lymphocytaires. **0 question sur le vaccin/sérum est une anomalie à corriger en priorité.**
- **Communication nerveuse** : la base est excellente (PPM/PPSE, curare, sarin, sommation). L'étendre à l'intégration nerveuse avec exercices de lecture d'enregistrements multiples.
- **Géologie** (domaine 3) : le parent pauvre en exercices alors qu'il pèse lourd. Priorité : collision continentale et métamorphisme (**0 question aujourd'hui**), lecture de profils sismiques, cartes d'anomalies magnétiques symétriques, datation relative, coupes de subduction avec calcul de vitesse de plaque.
- **Métabolisme** : renforcer le bilan énergétique chiffré (ATP par étape) et la comparaison respiration/fermentation, avec exercices de type « exploiter un tableau de mesures ».
- *Note : génétique mendélienne et reproduction ne sont pas au programme de cette filière — aucune action requise, contrairement à ce que suggérait mon analyse préliminaire.*

### F.3 Schémas interactifs

L'app possède déjà **125 fichiers d'assets** dont des SVG arabisés de qualité (`domaine1_proteines` particulièrement riche). Ils sont aujourd'hui **statiques**. Levier à fort rendement : rendre les SVG cliquables (légendes masquables, annotation par l'élève, mode « place les étiquettes »). Le format SVG le permet nativement, sans nouvelle dépendance. **L'exercice « annoter un schéma » est un classique du BAC, il n'existe pas dans l'app.**

### F.4 Quiz chronométrés

Le chrono existe (`QuizView.tsx` : 900 s) mais il est **fixe, quel que soit le nombre de questions**. Recommandation : calibrer sur le rythme réel de l'épreuve (~1,5 min/question de restitution), afficher un rythme cible, et proposer un **mode « conditions d'examen »** (durée réelle du sujet, pas de retour arrière, correction seulement à la fin).

### F.5 Mode révision finale (J-30 → J-1)

`countdownEngine` fournit déjà les 5 paliers et les recommandations — **il ne pilote rien**. À construire : un mode qui, à J-7, masque les leçons longues et n'expose que (a) les erreurs répétées de l'élève, (b) les fiches méthode, (c) 10 questions d'annales par jour. `crisisEngine` fait déjà 80 % du travail (pondération des topics ratés, 10 questions, badges). **Il suffit de connecter le compte à rebours au moteur de crise.**

### F.6 Détection de lacunes

Aujourd'hui non fiable, pour une raison mathématique : avec ~49 % de devinabilité, un élève « réussit » des chapitres qu'il ne maîtrise pas — la détection de lacunes hérite de ce bruit. **Elle ne peut pas être crédible avant la correction de C3.** Ensuite : croiser QCM, réponses ouvertes validées et rappels espacés pour produire une carte de maîtrise par notion (`MasteryEvidence` existe déjà, il n'est pas exploité).

### F.7 Parcours « Objectif 14/20 » et « Objectif 16/20 »

Excellente idée du brief, directement implémentable sur les briques existantes :

- **Objectif 14/20** — sécuriser la restitution : couverture complète des notions du programme, QCM et flashcards, méthodologie de base (les 6 verbes), 3 annales guidées. Message : « viser la note plancher solide ».
- **Objectif 16/20** — gagner sur l'exploitation documentaire et la rédaction : exercices documentaires exigeants, synthèse multi-documents, respect strict des lois de rédaction, annales en temps réel sans aide. C'est **précisément ce que `ValidationEngine` sait évaluer** — une fois son barème corrigé.

Prérequis absolu : **C2 et C3 corrigés**, sinon les deux parcours certifient des acquis qui n'existent pas.

### F.8 Fiches méthode

Le socle est là et il est bon (6 verbes, lois de rédaction, messages fus'ha). À compléter : une fiche par verbe **avec un exemple rédigé complet issu d'une annale réelle**, un contre-exemple annoté (« voici une copie à 6/20 et pourquoi »), et une checklist avant remise. Format à privilégier : exportable/imprimable — beaucoup d'élèves algériens révisent sur papier.

---

## G. Conclusion stratégique

### G.1 — Cette application aide-t-elle réellement un élève algérien à progresser ?

**Partiellement, et beaucoup moins que ce que ses chiffres laissent croire.**

Ce qui aide réellement, aujourd'hui : les **23 leçons HTML** (bien rédigées, disponibles hors ligne), le **module méthodologie** (les lois de rédaction sont un vrai savoir-faire d'examen, rarement outillé ailleurs), les **exercices d'analyse documentaire du domaine 1**, et la **disponibilité offline** qui supprime une barrière réelle.

Ce qui n'aide pas, et peut nuire : le **QCM**, qui constitue pourtant le volume principal du produit. Avec des explications qui répètent la réponse et ~49 % de devinabilité, l'élève accumule des scores flatteurs sans construire de compréhension. Et le **correcteur de réponses ouvertes**, qui valide du charabia à 20/20, enseigne exactement le contraire de la rigueur attendue au BAC.

Le jugement net : **l'app crée aujourd'hui plus de confiance qu'elle ne crée de compétence.** Pour un examen national à enjeu, c'est le pire écart possible. Un élève qui plafonne à 12/20 en classe et voit 75 % dans l'app ne révisera pas ce qu'il devrait réviser.

### G.2 — Que manque-t-il pour en faire une référence nationale ?

Quatre choses, dans cet ordre :

1. **Des explications qui expliquent.** C'est le fossé entre une banque de questions et un outil d'apprentissage. 500 explications à réécrire — c'est un travail lourd, mais c'est *le* travail.
2. **Des annales officielles corrigées au barème réel.** C'est ce que l'élève algérien cherche en premier, et c'est absent. C'est aussi le différenciateur le plus difficile à copier, parce qu'il demande un travail enseignant, pas du code.
3. **Une évaluation qui ne ment pas.** Barème positif, distracteurs plausibles, scores calibrés sur la réalité. Sans ça, aucune feature d'analytics, de parcours ou d'IA n'a de sens : elles s'appuieraient sur un signal faux.
4. **Une caution académique visible.** Un enseignant SVT 3AS nommé qui valide le contenu. Sur ce marché, la confiance des enseignants et des parents précède l'adoption par les élèves.

Ce qui **ne** manque **pas** : les compétences techniques. Le build est sain, l'offline est sérieux, la sécurité est sobre, et le `ValidationEngine` prouve qu'il y a une vraie intelligence pédagogique dans l'équipe. **Le problème n'est pas la capacité à faire — c'est que le contenu a été industrialisé au lieu d'être enseigné.**

### G.3 — Les 3 actions à effet immédiat

1. **Corriger le barème du `ValidationEngine` et ajouter des tests de faux positifs.** Effort moyen (quelques jours), impact maximal : c'est la faille la plus embarrassante du produit, la plus facile à découvrir par un élève, et la plus rapide à réparer. Cible : le charabia doit tomber sous 8/20.
2. **Supprimer les données fictives de `StatsView` et mettre les CGU en accord avec le code.** Effort faible (quelques heures). Ces deux corrections mettent fin, dans la même journée, aux deux mensonges structurels de l'app — un envers la progression de l'élève, un envers ses données personnelles.
3. **Réécrire les explications des 100 QCM les plus servis** au format mécanisme + réfutation du distracteur + piège BAC. Effort concentré (2 semaines à deux enseignants), mais c'est le premier pas concret vers un produit qui enseigne, et il rend l'amélioration immédiatement perceptible par l'élève.

### G.4 — Recommanderais-je cette application en l'état ?

**Non — pas en diffusion large, pas maintenant.** Trois raisons, toutes corrigeables :

- Elle **surévalue la maîtrise d'un facteur ~2** juste avant un examen qui détermine l'orientation de l'élève. C'est une prise de risque que je ne peux pas recommander à des lycéens.
- Elle **collecte des données de mineurs en affirmant l'inverse** dans ses propres CGU. Indépendamment de l'intention, l'exposition juridique et éthique est réelle.
- Son **onboarding est cassé** précisément pour les élèves faibles (7 tests en échec sur le parcours débutant), c'est-à-dire ceux qui en auraient le plus besoin.

**Je la recommanderais en usage encadré et ciblé, dès aujourd'hui**, pour : les 23 leçons hors ligne, le module méthodologie, et les exercices documentaires du domaine 1 — avec la consigne explicite à l'élève de **ne pas se fier aux scores affichés**.

**Et je la recommanderais pleinement** une fois les points C1 à C5 traités. Ce n'est pas un pronostic de complaisance : la base technique est saine, le savoir-faire pédagogique est démontré par le `ValidationEngine`, les 8 QCM rédigés à la main et les 23 leçons. **L'équipe sait manifestement faire du bon travail — elle a industrialisé là où il fallait enseigner.** Ce diagnostic est plus encourageant qu'il n'y paraît : les problèmes sont concentrés dans le contenu et dans un barème, pas dans l'architecture. Ils sont donc réparables en un trimestre de travail focalisé, avec la trajectoire décrite en §E.

**Verdict final : PARTIELLEMENT PRÊTE — 48/100 — risque ÉLEVÉ, réductible à faible en 90 jours.**

---

## Annexe — Reproduire les mesures de cet audit

```bash
# Corpus : gabarits, explications tautologiques, devinabilité
#   → extraction JSON de SVT_QUIZ_QUESTIONS depuis src/quizCorpus.ts
#   Résultats : 508 items ; 500 tautologiques (ids 1–500) ; 8 rédigés (501–508)
#               heuristique « option la moins recyclée » = 251/508 = 49,4 %
#               38 distracteurs réutilisés ≥ 5×, max 41×

# Barème ouvert : test d'intrusion
#   → validateAnswer(charabia, {docType, actionVerb, isNeuromuscular}) sur les 12 verbes
#   Résultat : 19–20/20 PASS partout ; « نعم » = 11–17/20 PASS

npm run test:unit      # 7 échecs / 346 tests, 4 fichiers / 40
npx tsc --noEmit       # exit 0
npm run build          # ✓ 6,25 s ; gzip index 111K + vendor-react 59K + icons 3,4K
npm run test:smartbot  # 12/12 PASS (mais aucun test de faux positif)
du -sh public/assets   # 10,6 Mo ; mascot.png = 1,9 Mo en 1024×1024
```

**Non exécutable dans l'environnement d'audit :** `npm run test:e2e` (Chromium non installable), Lighthouse, axe-core, tests sur appareil Android réel.
