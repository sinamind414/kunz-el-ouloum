# Audit externe en 8 axes — كنز العلوم (Kunz El Ouloum)

**Produit audité :** Kunz El Ouloum — PWA de révision SVT/علوم الطبيعة والحياة, BAC Algérie 3AS
**Base vérifiée :** branche `arena/92300c1d-kunz-el-ouloum`, commit `77d9459fd8f0600d3a3fc5fb5690c1b0f716b459` (13/10/2026)
**Date de l'audit :** 14/10/2026
**Auditeur :** agent Arena.ai — audit contradictoire, sur code et artefacts de build
**Addendum :** les recommandations **H1** (CI verte) et **H3** (série de jours) ont été implémentées
et vérifiées le jour même — voir **§10** en fin de document. Les notes des §1 et §2 sont celles de
l'audit initial ; les écarts §4.1 et §4.3 portent la mention « corrigé ».

---

## 0. Méthode, limites, et trois prémisses de la grille à corriger

### 0.1 Ce que j'ai réellement fait

| Contrôle | Résultat |
|---|---|
| `npx tsc --noEmit` | ✅ 0 erreur |
| `npm ci` + `npm run build` | ✅ OK (9,15 s) — `dist` = 15 Mo |
| `npx vitest run` (suite complète) | ⚠️ **199 fichiers, 2 419 tests : 2 413 OK, 2 ÉCHECS, 4 skippés** |
| `npm audit` | ⚠️ **21 vulnérabilités** (1 critique, 1 haute, 19 modérées) |
| Inventaire programmatique des corpus (import des modules TS) | ✅ QCM, flashcards, banque BAC, drills, capsules… comptés en exécution, pas au `grep` |
| Comptage/sondage des 25 leçons HTML (texte réel après retrait du balisage) | ✅ 166 132 caractères |
| Vérification de 40+ affirmations internes (`docs/*`, `AUDIT_*.md`, README) contre le code | ✅/⚠️ selon les cas, cf. §7 |

### 0.2 Limites assumées

- Pas de test sur appareil réel (Android bas de gamme, iOS) : tout ce qui touche au ressenti (fluidité, chauffe, batterie) est **non vérifié** — voir §8.
- Pas d'accès à l'instance déployée ni aux données d'usage réelles : **aucune** métrique d'utilisateurs n'est reproduite ici.
- Les 550 QCM et les ~235 000 caractères de cours n'ont **pas** été relus mot à mot : j'ai testé la *discipline de traçabilité* (tests de non-régression, errata officiels) et procédé par sondages ciblés.
- L'audit porte sur le code, pas sur la conformité juridique (droit d'auteur sur les énoncés d'examen, CNIL/loi 18-07 algérienne, RGPD).

### 0.3 Trois prémisses de la grille fournie qui sont fausses — et qu'il faut corriger avant d'auditer

1. **« Série SVT » vs « Série EXP »** n'existe pas en Algérie. Les filières du BAC algérien sont علوم تجريبية, رياضيات, تقني رياضي, تسيير واقتصاد, آداب وفلسفة, لغات أجنبية. La matière SVT (علوم الطبيعة والحياة) a le **coefficient 6** en علوم تجريبية et **2** en رياضيات/تقني رياضي. [(sujetbacdz.com)](https://sujetbacdz.com/blog/mawad-wa-mouaamalat-chouab-bac)
   → Conséquence pratique : les mêmes unités, mais une **priorité et un volume horaire différents selon la filière**. L'app déclare explicitement viser `3AS Sciences expérimentales` (`src/data/curriculumOfficial.ts`, en-tête). Elle est donc adaptée à la filière portant la matière, pas calibrée pour رياضيات (coef 2), où l'effort attendu est ~2× moindre.
2. **Le découpage « Partie I / II / III »** est un réflexe français. L'épreuve algérienne de SVT est un **sujet parmi deux au choix**, composé de **3 exercices (5 / 7 / 8 points = 20)**, durée **4 h 30**, sans épreuve pratique. Vérifié dans le dépôt (`data/bac_sessions_2019_2026.json`, `structure_officielle`) — et l'app s'y conforme (`src/data/mockExam.ts`, `examTimer.ts`).
3. **« Application mobile »** est inexact : c'est une **PWA** (aucune fiche Play Store/App Store, `docs/SPECKIT_CORRECTION_2026-10-01.md` le confirme comme écart ouvert). Cela change radicalement l'analyse des axes 5, 7 et 8 : distribution, mises à jour, offline et modèle économique ne se jugent pas comme pour un APK.

---

## 1. 📊 Tableau de synthèse

| Axe | Note /10 | Résumé |
|---|---|---|
| **1. Conformité au programme officiel** | **7,5** | 11 unités / 3 domaines alignés sur la progression ministérielle 2017 (heures, semaines, compétences), hors-programme balisé (`NON_EXIGIBLES`), 3 chapitres d'enrichissement signalés ; **trous reconnus dans le code** : immunité (chapitre « الحزينات الدفاعية في الحالة الأولى » = 0 occurrence), U11 (ophiolites/collision « à reconstruire »). |
| **2. Richesse et qualité des contenus** | **8,0** | 73 entrées de leçon (47 clés HTML + 26 actives), ≈235 k caractères, 112 SVG, 11 cartes mentales (1/unité), 71 résumés « or », 50 résumés de leçons, 32 micro-capsules, 617 entités lexicales, 35 errata du manuel officiel. Pas de glossaire consultable, pas de vidéo (choix assumé : SVG/SMIL, offline). |
| **3. Exercices et tests** | **8,0** | 550 QCM (100 % avec explication + schéma), 553 flashcards, 121 textes à trous, 18 drills de schéma, 19 analyses de documents (+53 contextes), 22 situations d'évaluation, 69 drills, 28 items mur « حلّل ». Correction des réponses ouvertes par attendus officiels + plafonds d'intégrité. **Aucun étiquetage de difficulté** sur les QCM. |
| **4. Banque de sujets BAC + simulation** | **6,5** | 65 idées d'exercices sur **11 sessions (2016→2026)**, 1 sujet incomplet (2021 S2 Ex1), **un seul sujet intégral (2025)** avec son corrigé ministeriel encodé item par item ; générateur de sujets blancs déterministe 20 pts / 270 min ; mode examen qui survit au rechargement. Pas d'énoncés intégraux 2016-2024 (choix assumé, motif droit d'auteur). |
| **5. UX/UI** | **7,0** | Arabe RTL natif, 5 rubriques, mode sombre + sombre système, recherche globale indexée (547 chunks) + favoris + historique, 27 vues en lazy loading, zoom des figures, TTS sur les flashcards. Manque : réglage de taille de texte, `prefers-reduced-motion` (0 occurrence), lien d'évitement, **62 occurrences d'attributs `aria-*` pour 70 composants**. **Série (série de jours) cassée = incohérence visible à l'écran.** |
| **6. Fonctionnalités interactives avancées** | **8,0** | SM-2 réel persistant, rappels espacés J+1/3/7/14, moteur « next best action », micro-reprises ciblées, simulateurs (électrophorèse, synapse, photosynthèse, tectonique), compilateur méthodologique, carnet d'écriture, bilan hebdomadaire partageable (canvas), tuteur **100 % local** (aucune clé API). Manque : push réel, forum, adaptatif par item, **gamification partiellement morte**. |
| **7. Fiabilité technique** | **7,0** | `tsc` propre, 2 413 tests verts, service worker économe et correct (précache sélectif ~1 Mo, schémas différés selon le réseau), mode dégradé si base absente, JWT/bcrypt/limiteurs/reset CSPRNG, politique de confidentialité conforme au code. **MAIS : CI rouge (2 tests), 1 vuln critique, 4,2 Mo de leçons téléchargées deux fois, version 0.0.0 / 0 tag.** |
| **8. Modèle économique et accessibilité** | **7,0** | 100 % gratuit, **0 publicité, 0 tracking externe, aucun compte obligatoire**, fonctionne hors ligne — quasi idéal pour le public rural. Mais **aucune distribution store** (installation PWA = friction réelle pour beaucoup d'élèves), aucun modèle de soutenabilité, note/avis utilisateurs **non vérifiable** faute de fiche. |

---

## 2. 📈 Score global pondéré

Pondération retenue (justification : ce qui décide de la réussite d'un élève au BAC, c'est d'abord le contenu conforme et juste, ensuite le volume/qualité d'entraînement ; la distribution est un moyen, pas une fin) :

| Axe | Poids | Note | Contribution |
|---|---|---|---|
| 1 — Conformité programme | 20 % | 7,5 | 1,50 |
| 2 — Richesse des contenus | 20 % | 8,0 | 1,60 |
| 3 — Exercices et tests | 15 % | 8,0 | 1,20 |
| 4 — Banque BAC + simulation | 10 % | 6,5 | 0,65 |
| 5 — UX/UI | 10 % | 7,0 | 0,70 |
| 6 — Interactif avancé | 10 % | 8,0 | 0,80 |
| 7 — Fiabilité technique | 10 % | 7,0 | 0,70 |
| 8 — Économie/accessibilité | 5 % | 7,0 | 0,35 |
| **Total** | **100 %** | — | **≈ 75 / 100** |

> Lecture honnête de ce 75/100 : c'est le score d'un **produit pédagogique sérieux, encore artisan sur la partie « produit grand public »**. Ce n'est pas un 75/100 de « presque fini » : quatre blocages nets (CI rouge, absence de store, série de jours morte, correcteur non validé indépendamment) empêchent un lancement public sans accompagnement.

---

## 3. ✅ Points forts (5 maximum)

1. **Ancrage ministériel documenté et vérifiable (axe 1).** `curriculumOfficial.ts` encode les 11 unités avec heures, semaines, fenêtres trimestrielles et compétences issus des sources officielles (L5 التدرج السنوي 2017, L6 دليل الأستاذ), et **exclut explicitement** les contenus non exigibles (المتمم, الأسيلوسكوب, نضج ARNm) avec la règle d'or « on est interrogé sur le programme, pas sur le manuel ». Les 2 chapitres du TDM hors périmètre sont marqués « إثراء ثقافي » dans l'interface. Peu d'apps concurrentes publient ce niveau de traçabilité.
2. **Discipline anti-erreur scientifique (axes 1 et 3).** 36 tests « lock » figent les comportements, une liste de termes interdits (`src/data/__tests__/dataIntegrity.test.ts` : الوشام, منيل, تقارب متباعد) bloque les régressions orthographiques, et surtout `src/data/manuelErrata.ts` encode **35 errata officiels du manuel** (tableaux « تصويب الأخطاء » du guide du professeur) pour **ne jamais sanctionner un élève qui recopie une erreur du livre imprimé**. C'est le contraire de l'amateurisme.
3. **Correction automatique conçue comme un moteur d'attendus, pas de mots-clés (axe 3).** Le correcteur note contre les attendus officiels de **chaque question** (`attendusBac2025.ts`), avec items à composantes co-requises, et **plafonds d'intégrité** (salade 30 %, négations 50 %, perroquet 25 %). Un élève qui écrit une recette de cuisine ne prend pas 8/8. Le dépôt publie ses propres métriques (Pearson r = 0,979 ; MAE = 0,76 pt ; κ quadratique = 0,96) **et le fait que ce corpus a servi à la calibration** — honnêteté rare.
4. **Hors-ligne pensé pour la 3G algérienne, pas pour la démo (axes 5, 7, 8).** Précache sélectif du shell + leçons, schémas (4,3 Mo, 112 SVG) téléchargés **en arrière-plan uniquement si le réseau le permet** (`navigator.connection`), exclusion des routes `/api/`, `network-first` pour la navigation avec repli sur `/index.html`, et bulle d'erreur explicite quand un chunk manque hors ligne. Aucune dépendance à une API IA : **l'app fonctionne sans clé, sans compte, sans réseau**.
5. **Réduction volontaire de la pression scolaire (axes 5, 6).** Choix assumé et codé d'**aucun classement entre élèves** (« لا نقاط، ولا ترتيب بين التلاميذ », `MoiView.tsx`) et de **zéro statistique de démonstration** (le premier lancement affiche des zéros réels, cf. commentaire `App.tsx`). Dans un contexte de compétition BAC très anxiogène, c'est un parti pris pédagogique défendable, et il est respecté dans le code.

---

## 4. ❌ Points faibles (5 maximum)

1. **La sûreté de non-régression n'est pas verte (axe 7) — le point le plus grave.** *(★ corrigé le 14/10/2026 — §10.1)* `npx vitest run` échoue : 2 tests de `src/data/dictionaries/correctionGenerosite.test.ts` lisent `eleve_18.txt`, fichier **retiré du dépôt** (le corpus de 40 copies a été supprimé pour conformité RGPD, cf. `docs/copies/README.md`). CI = 3 jobs dont `npm run test:vitest` → **la CI échoue sur master**. Conséquence réelle : une régression sur le correcteur — la fonction la plus sensible du produit — peut passer inaperçue.
2. **Impossible d'installer l'app sans compétence technique (axes 5, 8).** Aucun APK/AAB, aucune fiche store. Pour un élève de terminale sur Android d'entrée de gamme, ajouter une PWA à l'écran d'accueil via un menu de navigateur est une barrière réelle ; sur iOS, le chemin est encore plus étroit (Safari uniquement, notifications limitées). La concurrence est installée : **موقع الدراسة الجزائري (Eddirasa) affiche 4,6★ / 15 000 avis / 500 000+ téléchargements** [(Google Play)](https://play.google.com/store/apps/details?id=com.eddirasa.app&hl=en_US) et **Feljib** se présente déjà comme « quiz et flashcards construits à partir des vrais sujets du BAC » [(feljib.com)](https://feljib.com/en/).
3. **La gamification ment à l'écran (axe 6).** *(★ corrigé le 14/10/2026 — §10.2)* Vérifié par grep exhaustif sur `src/` : `progress.streak` n'est **jamais** écrit (seule initialisation à 0 dans `App.tsx:263`), et `dailyGoals.streakDays` n'est **jamais incrémenté** (5 initialisations à 0/1, aucune écriture dérivée de la date). Résultat : `StatsView` affiche « 0 يوم », d'autres écrans affichent `streak || 1` → « 1 أيام », les **badges 7 jours et 30 jours sont inatteignables**, et les fonctions de célébration (`StreakCelebrationModal`, `playStreakMilestoneSound`) ne se déclencheront jamais en conditions réelles. Sur un app qui revendique d'éviter le faux XP, c'est une incohérence visible.
4. **La couverture n'est pas complète, et l'app ne le dit pas à l'élève (axes 1, 2, 4).** Les manques sont reconnus en commentaire de code mais invisibles côté produit : U4 immunité (« 11 chapitres, 6 couverts » — `unitLessonSequences.ts`), le chapitre « الحزينات الدفاعية في الحالة الأولى » (immunité innée) est **absent du corpus** (0 occurrence), U11 (collision/ophiolites « à reconstruire »), 1 sujet BAC incomplet (2021 S2 Ex1), et **25 fichiers de leçons pour 47 clés** — deux d'entre eux (`lecon_activite_structure.html`, `lecon_representation.html`) **ne figuraient pas dans le précache du service worker** (`public/sw.js`, `CORE_URLS`) : hors ligne, un élève ne les avait pas. *(★ corrigé le 14/10/2026 — §10.5, avec un verrou de cohérence.)* Enfin, l'app se décrit comme « بالذكاء الاصطناعي » (`metadata.json`) alors que le tuteur est un moteur local déterministe (`smartTutorEngine.ts` : « Moteur local offline — UNIQUE source ») : c'est un écart entre promesse et implémentation, même s'il est techniquement à l'avantage de l'élève (pas de coût, pas de réseau).
5. **Dette de distribution et de validation (axes 3, 4, 7).** `package.json` est en **version 0.0.0**, `git tag` renvoie **0 tag**, il n'existe aucun processus de release, et `npm audit` remonte **21 vulnérabilités dont 1 critique (`proxy-addr`, CVSS 9.1, *IP spoofing via IPv4-mapped IPv6 trust subnet*, GHSA-jqcg-44mw-7w3h — contournement possible du limiteur par IP si `TRUST_PROXY=1`) et 1 haute (`source-map-js`, GHSA-68fv-2mgg-jv7q)** ; les deux correctifs sont disponibles. Côté pédagogie : les métriques du correcteur (`docs/SUPERVISION_ACTUEL.md`) reposent sur un corpus **de calibration, pas de validation indépendante** — le document le dit lui-même — et l'objectif interne (MAE ≤ 8 % du barème par exercice) **n'est pas atteint sur les 3 exercices (10 %, 10 %, 9 %)**.

---

## 5. 🔧 Recommandations

### Priorité HAUTE (bloquant pour un lancement public)

| # | Axe | Recommandation concrète | Preuve/état actuel |
|---|---|---|---|
| H1 | 7 | **Rendre la CI verte.** Externaliser le corpus de copies (`KUNZ_CORPUS_ELEVE_18`) et transformer les 2 tests en `skipIf` avec un test « corpus absent ⇒ ignoré explicitement », doublé d'un verrou permanent sur copie synthétique. | ✅ **FAIT (§10.1)** — les 3 jobs CI reproduits sur export propre : 0 échec |
| H2 | 7, 8 | **Produire un binaire.** TWA (ou Capacitor) depuis le `dist` existant → AAB signé, fiche Play Store (nom, captures, description, politique de confidentialité **déjà rédigée** dans `politiqueConfidentialite.ts`), piste de test interne d'abord. ⚠️ **Préparé au maximum le 14/10/2026 (§10.7)** : fiche ar+fr, page `/privacy` publique sans JavaScript, Digital Asset Links, formulaire « Sécurité des données » — **il reste le compte Play, le keystore, les captures et l'envoi, qui exigent vos accès.**
| H3 | 6 | **Réparer la série (streak) ou la supprimer.** Implémenter la règle (dernier jour actif = J-1 → +1, sinon reset), l'écrire dans `dailyGoals.streakDays` **et** `progress.streak`, ajouter un test unitaire « 7 jours consécutifs ⇒ badge débloqué », et bannir les `streak || 1` (afficher 0 si 0). | ✅ **FAIT (§10.2)** — 54 tests, dont 6 d'intégration sur `<App />` |
| H4 | 3 | **Valider le correcteur sur du réel, comme le dépôt le prévoit déjà.** Constituer le jeu F5 (300 copies authentiques, double correction à l'aveugle, ≥20 % arbitrées, calibration/test séparés) et **publier r vs prof par exercice**. À défaut, afficher la note comme « estimation » et remonter l'incertitude. | `docs/SUPERVISION_ACTUEL.md` : corpus de calibration uniquement ; MAE/barème 10-10-9 % vs cible 8 % |
| H5 | 1, 2 | **Combler les trous déclarés et publier une matrice de couverture.** 3 chantiers : immunité innée (« الحزينات الدفاعية في الحالة الأولى »), U11 (collision + ophiolites) — ✅ *leçons orphelines du précache SW corrigées, §10.5*. Afficher côté élève une matrice *unité × ressources exigibles (L5)* avec un état ✅/⚠️ par ressource. | 0 occurrence de « الحزينات الدفاعية » ; commentaire « à reconstruire » ; 2 leçons hors `CORE_URLS` |

### Priorité MOYENNE (qualité et échelle)

| # | Axe | Recommandation | Preuve/état actuel |
|---|---|---|---|
| M1 | 7 | **Supprimer le double embarquement des leçons.** Aujourd'hui chaque leçon existe en `public/lessons/*.html` (2 146 674 octets dans `dist/`) **et** en chunk JS `?raw` (2 143 991 octets) — et le SW précache **les deux** ⇒ ~4,3 Mo téléchargés et stockés deux fois sur un téléphone bas de gamme. Garder une seule source de vérité. | `du -sb dist/lessons` = 2 146 674 ; 25 chunks JS `phaseNN` = 2 143 991 |
| M2 | 7 | **Mettre à jour les dépendances** (✅ fait pour les deux alertes : §10.5) et **durcir le serveur** : `helmet`, CSP — reste à faire. | ✅ `proxy-addr` **critique CVSS 9.1** et `source-map-js` haute corrigés par `overrides` : `npm audit --omit=dev` = **0 vulnérabilité**. Les 19 modérées restantes sont toutes en `devDependencies` (jest) |
| M3 | 3 | **Étiqueter la difficulté et rendre l'adaptatif réel.** Les 550 QCM n'ont **aucun** champ `difficulty` ; l'« adaptatif » actuel = tirage équilibré par domaine (`qcmBilan.ts`) + pondération par pression d'unité. Ajouter 3 niveaux par item et un ajustement par historique élève (Elo simple). | `Object.keys(question)` : id, unitId, questionText, options, correctAnswerIndex, explanation, diagramUrl — pas de difficulté |
| M4 | 4 | **Étendre la banque d'examens.** Ajouter les sujets **2026 S1/S2** intégraux (comme le sujet 2025) avec corrigés alignés item par item ; documenter explicitement à l'élève pourquoi 2016-2024 ne contient que les *idées* et les *supports*. | 65 idées / 11 sessions ; 1 sujet intégral ; 1 sujet incomplet |
| M5 | 5 | **Accessibilité minimale sérieuse** : 3 crans de taille de texte, respect de `prefers-reduced-motion` (0 occurrence aujourd'hui), lien d'évitement, `aria-live` sur les feedbacks de quiz, compléter les libellés (62 occurrences d'`aria-*` pour 70 composants). | `grep` : aucune gestion du mouvement réduit ; comptage `aria-*` = 62 |
| M6 | 6 | **Notifier pour de vrai (Web Push + FCM).** Les rappels ne s'affichent **qu'à l'ouverture de l'app** (`App.tsx` 214-246 : vérification dans un `useEffect` sur `currentTab` ; `handleScheduleReminder` stocke un timestamp local, sans planificateur système). Sans push, la répétition espacée perd la moitié de sa valeur. | `Notification.requestPermission()` appelé, aucune notification planifiée hors FocusTimer |

### Priorité BASSE (finition)

| # | Axe | Recommandation | Preuve/état actuel |
|---|---|---|---|
| B1 | 7 | Adopter une **version** réelle (SemVer), un changelog et des tags : le service worker est versionné par `?v=Date.now()` et `package.json` est en 0.0.0 — impossible de corréler un bug élève à une version. | `git tag` = 0 ; `version: 0.0.0` |
| B2 | 8 | **Trancher la soutenabilité.** 0 pub, 0 premium, 0 compte obligatoire, c'est excellent pour l'accès et intenable pour l'hébergement/CDN. Options non intrusives : dons, convention avec une direction de l'éducation, mécénat d'entreprise, version « établissement » pour le suivi prof (déjà fonctionnel). | Aucune trace de monétisation dans le code |
| B3 | 2 | **Exposer un glossaire élève AR/FR** par unité à partir des ressources déjà présentes (617 entités de `dictionnaire_final.json`, 35 errata, cartes de connaissance) : la matière première existe, la surface « معجم » n'existe pas. | 0 fichier de glossaire côté UI |
| B4 | 6 | **Décider du forum.** Le « mur حلّل » est solo ; aucune discussion entre élèves (`TahlilWall.tsx`). Soit l'assumer dans la promesse, soit prévoir modération + coût serveur. | Pas de composant de forum |
| B5 | 1, 2 | **Faire relire par un professeur en exercice** les 550 QCM et les ~235 000 caractères. La traçabilité est prouvée par les tests ; l'exactitude scientifique, non — un test ne détecte pas une erreur de fond correctement orthographiée. | 0 test sémantique sur le fond scientifique |

---

## 6. 🏆 Verdict final

**L'application est-elle prête pour le marché ?**
**Non, pas pour un lancement grand public.** Elle est prête pour un **pilote encadré** : une à trois classes, un professeur qui suit le tableau de bord enseignant, un retour hebdomadaire. Trois verrous à lever avant d'ouvrir grand : (1) ~~CI verte~~ *(levé le 14/10/2026 — §10.1)* et correcteur validé sur copies réelles, (2) distribution store, (3) ~~série de jours réparée~~ *(levé le 14/10/2026 — §10.2)*. Restent donc **deux blocages réels : la distribution store et la validation indépendante du correcteur**.

**À recommander aux élèves du BAC ?**
**Oui, avec conditions.** Recommandable dès aujourd'hui comme **entraînement complémentaire** — pour un élève d'علوم تجريبية (SVT coef 6) qui a déjà un professeur et un manuel — parce que le contenu est ancré sur le programme officiel, que la correction des réponses ouvertes est outillée et plafonnée contre la triche, et que **rien n'est payant ni publicitaire**. Non recommandable comme **source unique** de préparation : l'immunité innée et une partie de la géologie U11 sont absentes, 2016-2024 n'est pas disponible en sujets complets, et la note automatique n'a pas encore de validation indépendante. En l'état, un élève pourrait croire avoir « couvert tout le programme » alors qu'il reste des trous — le risque pédagogique principal de ce produit.

**Quels ajouts prioritaires ?** H2 → H4 → H5. H1 et H3 sont faits (§10). Le plus stratégique reste **H2** (sans installation, tout le reste est invisible pour la moitié des élèves visés) ; le plus exigeant est **H4** (validation du correcteur sur copies réelles, sans corpus de mesure il n'y a pas de preuve) ; le plus lourd est **H5** (trous de couverture : immunité innée, U11, leçons hors précache). S'y ajoute désormais un point technique chiffré : **le garde-fou de poids du bundle est rouge et n'est pas branché sur la CI** (§10.3.1).

---

## 7. Annexe A — Affirmations internes vérifiées (échantillon)

| Affirmation du dépôt / d'un audit antérieur | Verdict à `77d9459` |
|---|---|
| « `BAC_EXAM_DATE = ''` → compteur mort » (`BILAN_VERITE_2026-10-01`) | ❌ **Périmé** : `dashboardActions.ts:31` = `'2027-06-08'`, avec drapeau `BAC_EXAM_DATE_IS_PROVISIONAL = true` |
| « Bug critique : `fetchMe()` n'envoie pas le jeton » (`AUDIT_QUALITE_2026-09-22`) | ✅ **Corrigé** : `src/utils/api.ts` envoie `Authorization: Bearer`, et distingue 401 (session coupée) d'une panne réseau (session conservée) |
| « Une requête CSV met le serveur à mort » (idem) | ✅ **Corrigé** : assainissement `[^\w.-]`, `csvCell` anti-injection de formules Excel, `asyncHandler` sur toutes les routes async |
| « Streak jamais incrémenté » (idem / BILAN) | ❌ **Périmé depuis le 14/10/2026** : série écrite par les 4 chemins d'activité, 6 tests d'intégration (§10.2) |
| « Version 0.0.0, 0 tag » | ⚠️ **Toujours vrai** |
| « 40 copies `eleve_*.txt` versionnées dans Git » | ✅ **Résolu** : absentes du dépôt ; les 2 tests de corpus se déclarent « ignorés » sans elle et la règle est verrouillée par une copie synthétique (§10.1) |
| « Cache offline : 22 leçons sur 47 » | ⚠️ **Partiellement vrai, autrement** : 23 leçons dans `CORE_URLS` sur 25 fichiers ; les chunks sont, eux, précachés via `assets-manifest.json` |
| « Le correcteur note contre la question, plus contre l'unité » | ✅ Confirmé : `attendusBac2025.ts` est le seul dénominateur, `noterDepuisCouverture` supprimé |
| « Moteur IA / Gemini » | ❌ **Inexact** : `metadata.json` annonce « بالذكاء الاصطناعي », le tuteur est un moteur local déterministe, sans route LLM (`AITutorView.tsx:162`) |

## 8. Annexe B — Ce que je n'ai pas pu vérifier

- **Note et avis des utilisateurs** : aucune fiche Play Store/App Store → **Non vérifiable**.
- **Performance réelle sur smartphone bas de gamme** : aucune mesure sur appareil. Seuls des indices statiques (charge initiale ≈ 375 Ko gzip ; chunk principal 960 Ko brut ; `StatsView` 474 Ko et `OkachaView` 462 Ko chargés à la demande ; recharts + d3 présents) → **Non vérifiable**. *Mesure exacte du chemin critique ajoutée depuis (§10.3.1) : 362 Ko gzip au premier affichage.*
- **Fonctionnement multi-appareils en production** : la synchronisation existe (comptes, `/api/student/sync`, SQLite ou PostgreSQL, parité testée) mais aucune instance déployée n'a été testée → **Non vérifiable**.
- **Comportement iOS réel** (installation PWA, notifications, stockage du service worker) → **Non vérifiable** sans appareil.
- **Conformité juridique** des énoncés et de la collecte de données (loi 18-07, droit d'auteur ONEC) → **hors périmètre de cet audit technique** ; le dépôt documente une base légale pour son corpus de copies (`docs/copies/README.md`).
- **Exactitude scientifique exhaustive** des 550 QCM et des leçons → non relus intégralement, comme indiqué en §0.2.

## 9. Annexe C — Sources

**Sources primaires (dépôt, commit `77d9459`) :** `src/data/curriculumOfficial.ts`, `src/data/unitLessonSequences.ts`, `src/data/bacSessionIndex.ts`, `data/bac_sessions_2019_2026.json`, `src/data/mockExam.ts`, `src/data/examTimer.ts`, `src/data/examSession.ts`, `src/data/attendusBac2025.ts`, `src/data/dictionaries/calibrationBac2025.ts`, `src/correcteurV1.ts`, `src/data/manuelErrata.ts`, `src/data/lessonIndex.ts`, `src/data/lessonHtmlGetters.ts`, `public/sw.js`, `src/utils/flashcardsSrs.ts`, `src/data/spacedRecallIntervals.ts`, `server.ts`, `server/secret.ts`, `server/rateLimit.ts`, `docs/SUPERVISION_ACTUEL.md`, `docs/copies/README.md`, `docs/SPECKIT_CORRECTION_2026-10-01.md`, `docs/BILAN_VERITE_AUDITS_2026-10-01.md`, `AUDIT_QUALITE_2026-09-22.md`.
**Exécutions :** `npm ci`, `npm run build`, `npx tsc --noEmit`, `npx vitest run`, `npm audit`, imports programmatiques des corpus via `tsx`.
**Sources externes :** [Coefficients et filières du BAC algérien](https://sujetbacdz.com/blog/mawad-wa-mouaamalat-chouab-bac) · [معاملات شعبة علوم تجريبية](https://www.bac-onec-dz.com/2022/04/2022_28.html) · [موقع الدراسة الجزائري sur Google Play](https://play.google.com/store/apps/details?id=com.eddirasa.app&hl=en_US) · [Feljib](https://feljib.com/en/).

---

## 10. Addendum — 14/10/2026 : H1 et H3 implémentés, et ce que la vérification a révélé

**Commits :** `c19d965` (H3) et `387cfff` (H1) sur `arena/92300c1d-kunz-el-ouloum`.

**Signulation postérieure à l'audit, traitée au §10.8 :** « la majorité des élèves ne savent pas
s'inscrire avec email » — le formulaire d'inscription exigeait une adresse (exemple affiché :
`eleve@ecole.dz`, une adresse **scolaire** que presque aucun élève n'a) et un mot de passe à inventer.
Il existe désormais un parcours **sans e-mail** (code de connexion à 8 caractères + code secret à
6 chiffres), accessible depuis une carte visible sur l'accueil, **sans migration de base**.
**Règle de conduite de cet addendum :** ne rien déclarer « corrigé » qui n'ait été **exécuté**. Toute
affirmation ci-dessous est reproductible par une commande donnée dans le texte.

### 10.1 H1 — CI verte : reproduite sur un export propre, pas sur ma machine

Un test vert chez moi ne prouve rien : `node_modules`, `dist/` et le corpus local n'existent pas en CI.
La vérification a donc été faite **exactement comme le fait la CI** — export du commit (`git archive`,
942 fichiers), `npm ci`, puis les trois jobs de `.github/workflows/ci.yml` :

| Job CI | Commande | Résultat sur export propre |
|---|---|---|
| `check:v2` | `npm run check:v2` | **0 erreur** (13,4 s) |
| `test` | `npm test` | **138 invariants passés, 0 échec** |
| `test:vitest` | `npm run test:vitest` | **204 fichiers, 2 469 tests passés, 0 échec, 6 ignorés** (221 s) |

Le correctif lui-même ne supprime **aucun** test. Il rend l'exigence explicite :

- le corpus est cherché dans `KUNZ_CORPUS_ELEVE_18`, puis aux emplacements historiques (racine du dépôt,
  répertoire courant) ;
- **corpus présent** → les 2 tests de mesure s'exécutent (vérifié : 15 tests passés, 0 ignoré) ;
- **corpus absent** → ils sont rapportés **ignorés**, jamais verts en silence, et un **verrou permanent sur
  copie synthétique** prend le relais en CI : la déclaration d'abandon est comparée à la même réponse sans
  la déclaration, et note comme plafonds doivent être **identiques** (l'abandon est un signal, pas une
  pénalité). Ce verrou isole une seule variable au lieu de dépendre d'un fichier absent.

*Ce que ça ne prouve pas :* les 4 tests SQLite de `src/__tests__/serverDashboard.test.ts` ont été ignorés
dans ma reproduction (le greffon natif `better-sqlite3` ne se compile pas ici : `node-gyp` a besoin des
en-têtes Node sur `nodejs.org`, hors du réseau autorisé).

**Verdict de la CI réelle (le seul juge, il compile `better-sqlite3` et tourne sur l'environnement cible) :**
run GitHub Actions **38538233956**, PR **#37** — les **trois jobs sont `success`** (`check:v2`,
`test` harnais natif, `test:vitest`) en 2 min 46 s, sur un checkout neuf et **sans** `eleve_18.txt`.
H1 est donc **clos sur preuve exécutée**, et non sur ma seule reproduction locale.

### 10.2 H3 — Série de jours : le défaut était réel, il est mesuré et verrouillé

Le diagnostic du §4.3 est confirmé par la lecture du code : **aucun** chemin d'activité n'écrivait la série,
et le tuteur (`handleTutorXPGained`) créditait **0 minute** d'étude. Quatre définitions concurrentes de
« aujourd'hui » coexistaient, dont trois en UTC (`toISOString()`) — c'est-à-dire le jour UTC : à Alger
(UTC+1), l'application se croyait encore la veille jusqu'à 01 h du matin, pour le défi du jour comme pour
la clé du « déclic ».

Ce qui a été fait (3 modules neufs, 14 fichiers modifiés) :

| Élément | Rôle |
|---|---|
| `src/utils/dayKey.ts` | **Définition unique** du jour LOCAL (`jourLocal`), plus `ajouterJours` / `ecartEnJours` (arithmétique en minuit local) |
| `src/utils/serie.ts` | Règle **pure** : +1 si l'écart est exactement 1 jour, remise à 1 après un jour manqué **ou** une horloge reculée, jamais deux fois le même jour (anti-farm) ; paliers [7, 30] = ceux des badges existants |
| `src/utils/activiteQuotidienne.ts` | **Porte unique** de crédit d'activité (focus, flashcards, quiz, tuteur) ; distingue « compteurs du jour remis à zéro » de « première activité du jour » ; historique borné à 30 jours |
| `src/types.ts` | Champ `serieDernierJour` : dernier jour **travaillé**, distinct de `lastActiveDate` que l'app remet à aujourd'hui dès l'ouverture |
| `App.tsx` + 5 composants + tuteur + session | 7 usages UTC convertis, 4 chemins d'activité unifiés, suppression des `streak \|\| 1` et du jeu de statistiques de démonstration (12 min, 14 questions, série de 3, historique d'août) |

**Preuves exécutées** — 54 tests, dont ceux qui portent sur le comportement et non sur le code :

- `src/utils/__tests__/dayKey.test.ts` (8) — dont l'invariant de bord de journée : à 00 h 30 à Alger, le
  jour local et le jour UTC **diffèrent**, et c'est le local qui gagne ;
- `serie.test.ts` (14) — séries de 7 et 30 jours construites jour par jour, jour manqué, horloge reculée ;
- `activiteQuotidienne.test.ts` (18) — « ouvrir l'app ne crédite aucun jour », « étudier J+1 incrémente
  même si l'app a été ouverte entre-temps », historique ≤ 30 jours ;
- `src/components/__tests__/serieIntegration.test.tsx` (6) — pilote **`<App />` réelle** : session de focus
  terminée → série = 1 et `serieDernierJour` = aujourd'hui ; série de 6 la veille → **7** le lendemain
  (le badge « أسبوع من الاستمرارية » devient atteignable) ; 3 jours d'absence → série **1** et affichage
  retombé à **0** sans attendre une activité ; ouverture sans travail → la série de la veille survit ;
- `src/components/__tests__/serieAffichage.test.ts` (8) — **verrou statique anti-retour** : plus aucun
  `streak || 1`, les 3 écrans passent par le sélecteur testé, `App.tsx` ne calcule plus en UTC, les
  4 chemins d'activité passent par la porte unique.

`npx tsc --noEmit` : 0 erreur. `npm run build` : vert (9,3 s). Les deux tests préexistants qui
**attendaient** l'ancien comportement UTC (`morchidCorrectifs`, `motivationIntegration`) ont été corrigés :
ils verrouillaient le bug.

### 10.3 Ce que la vérification a mis au jour et qui n'était pas dans l'audit initial

#### 10.3.1 Le garde-fou de poids du bundle est rouge — et il ne garde rien

`npm run test:build` **échoue** : `index-BUo4zSep.js pèse 938 Ko (plafond 700 Ko)`. Ce n'est pas un effet
de mon intervention — vérifié en reconstruisant **`master` (`77d9459`) dans un arbre séparé** : entrée =
**937 Ko**, soit +0,1 % après mes modifications. Le dépassement est donc **antérieur** et de **+34 %**.

Mesure du démarrage à froid, en gzip (ce que l'élève télécharge réellement) :

| Ressource du chemin critique | Brut | gzip |
|---|---|---|
| Entrée (`index-*.js`) | 937 Ko | **223 Ko** |
| `vendor-react` / `vendor-motion` / `vendor-icons` (modulepreload) | 368 Ko | **111 Ko** |
| CSS | 218 Ko | **28 Ko** |
| **Total premier affichage** | **1 525 Ko** | **362 Ko** |

Sur une 3G réelle d'intérieur (≈ 40–60 Ko/s utiles), **362 Ko ≈ 7 à 10 secondes** avant interaction, sans
compter la latence TLS ni les 14,2 Mo d'`dist` que le service worker peut vouloir précacher. Aucune police
n'est téléchargée (0 `@font-face`, les systèmes sont utilisés) : c'est un bon choix, à conserver.

**Aggravant :** ce test n'est branché sur **aucun** des 3 jobs de la CI (`vite.config.ts` l'exclut
volontairement de la suite unitaire ; `npm run test:build` n'est appelé nulle part dans `ci.yml`). Un
garde-fou qui ne garde rien explique qu'un dépassement de 34 % ait pu s'installer sans être vu.

**Constat connexe :** aucun job de la CI ne **compilait** l'application. Un `vite build` cassé (import
dynamique mal résolu, asset manquant) atteignait donc `master` au vert, alors que `dist/` est le seul
artefact réellement servi aux élèves.

`scripts/poids-entree.mjs` (ajouté) mesure et **publie** le poids du premier affichage — tableau par
ressource, total gzip, écart à la cible de 700 Ko — dans le résumé du job GitHub. Il est volontairement
**non bloquant** : relever un plafond pour rendre un test vert serait maquiller le problème, et faire
échouer la CI sur un plafond déjà dépassé empêcherait toute fusion.

⚠️ **Le branchement à la CI reste à faire par le mainteneur**, et c'est une limite de l'agent : mon jeton
GitHub n'a pas la permission `workflows`, le push d'une modification de `.github/workflows/ci.yml` est
refusé par GitHub. Il suffit d'ajouter ce job (4ᵉ job, indépendant des trois autres) :

```yaml
  build:
    name: "build (dist déployable) + poids du premier affichage"
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run build
      - name: Vérifier les artefacts déployables
        run: test -f dist/index.html && test -f dist/sw.js && test -f dist/manifest.json && test -f dist/server.cjs
      - name: Mesurer le poids du premier affichage
        run: node scripts/poids-entree.mjs
```

La décision M7 reste donc entière, mais elle se prendra désormais devant un chiffre affiché.

**Diagnostic de ce qui pèse (mesuré sur la sourcemap de l'entrée, 52 modules) :** **70,5 % de l'entrée est
de la DONNÉE, pas du code d'interface.**

| Module | Poids dans l'entrée | Part |
|---|---:|---:|
| `src/data/activeLessons.ts` | 164 Ko | 17,5 % |
| `src/lessonData.ts` | 122 Ko | 13,0 % |
| `src/data/mindMapData.ts` | 109 Ko | 11,6 % |
| `src/data/documentPracticeContexts.ts` | 82 Ko | 8,8 % |
| `src/data/bacSessionIndex.ts` | 68 Ko | 7,2 % |
| `src/data/fillBlanks.ts` | 50 Ko | 5,4 % |
| `src/data/microCapsules.ts` | 41 Ko | 4,4 % |
| 5 autres modules de données | 112 Ko | 12,0 % |
| **Total données** | **661 Ko** | **70,5 %** |

Trois chaînes d'import statique suffisent à tout tirer dans l'entrée :
`App.tsx` → `data/fillBlanks` (50 Ko) ; `parcoursPath.ts` (moteur « prochaine meilleure action ») →
`lessonModes` + `unitLessonSequences` → `activeLessons` + `lessonData` (**286 Ko**) ; `TodayCard` →
`revisionPlan` → `mindMapData` + `bacSessionIndex` + `bacArchetypes` + `unitOpenings` (**≈ 250 Ko**, dont
`bacSessionIndex` entraîne `schemaDrills`, `situationIndex`, `documentPracticeContexts`,
`documentAnalysisExercises`, `microCapsules`). Autrement dit : **l'élève télécharge toute la banque
d'exercices et tous les contenus de leçons avant même de voir l'écran d'accueil.** Différer ces trois
chaînes ramènerait l'entrée à ≈ 250–300 Ko — c'est le contenu de M7, et c'est un travail de fond, pas un
réglage.
**Recommandation M7 (nouvelle) :** décider — soit ramener l'entrée sous 700 Ko (l'`index-*` de 938 Ko
embarque des données, pas seulement du code : voir M1 sur le double embarquement des leçons), soit
**relever le budget à la réalité et le brancher sur la CI**. Les deux se défendent ; l'inaction non.

#### 10.3.2 Correcteur : un plafond anti-triche peut frapper une réponse juste d'une seule phrase

`estDeLaProse()` exige soit **deux phrases d'au moins 4 mots**, soit **un marqueur de relation**
(نستنتج، نلاحظ، بينما…) dans une phrase unique. Conséquence **mesurée** (`noterExerciceCalibre`) : une
réponse d'une seule phrase, même longue et juste, sans marqueur de relation, subit le plafond
`non_prose` = **30 % du barème de l'exercice** — soit ≤ 2,4/8 sur l'exercice 3.

Cas vérifiés : `« تتكون البروتينات من أحماض أمينية مرتبطة بروابط ببتيدية »` → `estProse = false` ;
la même avec `نستنتج` en tête → `estProse = true` ; la même en deux phrases → `estProse = true`.
Le seuil morphologique (« colle grammaticale » ≥ 20 % de clitiques, au-delà de 10 jetons) n'est **jamais
évalué** sans marqueur de relation : la branche existe mais est inatteignable en pratique — ce qui suggère
que l'intention d'origine était l'inverse (longue phrase → morphologie ; phrase courte → marqueur), mais
c'est une **inférence**, pas une preuve.

**Portée honnête :** le plafond ne mord que si la phrase unique crédite plus de 30 % de l'exercice
(1,5/5 ; 2,1/7 ; 2,4/8). Comme les items les mieux payés exigent plusieurs composantes co-requises, c'est
rare — mais c'est un **faux positif qui pénalise un élève qui a raison**, dans la fonction la plus sensible
du produit. Et le dépôt a une règle explicite pour ce cas : *« on ne les touche plus sans corpus et sans
mesure avant/après »*. Ce point relève donc de H4 (constituer un corpus), pas d'un correctif improvisé.

### 10.4 Ce qui reste à vérifier, et comment

1. ~~Statut GitHub Actions~~ → **fait** : 3 jobs `success` (run 38538233956, PR #37), §10.1.
2. **H1 reste « vert par construction », pas « complet »** : l'ignoré explicite évite le rouge, il ne
   remplace pas la mesure sur corpus réel (H4). La CI passe désormais **avant** de savoir si les 2 tests
   de corpus passent — c'est le prix assumé du retrait RGPD.
3. **Poids du bundle après H5/M1/M7** : re-mesurer, et cette fois avec le test branché sur la CI.
4. **Rien de ce §10 n'a été validé sur un appareil réel** : les mesures sont logicielles. Le poste
   « smartphone bas de gamme, connexion réelle » reste **non vérifiable** par moi.

### 10.5 Bugs majeurs corrigés le 14/10/2026 (2ᵉ passe)

Après H1 et H3, quatre défauts qualifiés de majeurs ont été traités — avec, pour chacun, la preuve
exécutée. Un cinquième a été **tenté puis annulé sur mesure**.

| # | Défaut | Preuve du défaut | Correctif | Preuve du correctif |
|---|---|---|---|---|
| 1 | **Vulnérabilité critique en production** : `proxy-addr@2.0.7` (CVSS 9.1, *IP spoofing*, GHSA-jqcg-44mw-7w3h) et `source-map-js@1.2.1` (haute). Le premier est atteignable : `server.ts:128` active `trust proxy` dès `TRUST_PROXY=1`, et les limiteurs de connexion/réinitialisation sont indexés par `req.ip`. | `npm audit` : 21 vulnérabilités dont 1 critique, 1 haute | `overrides` dans `package.json` : `proxy-addr@^2.0.8`, `source-map-js@^1.2.2` | `npm audit --omit=dev` → **0 vulnérabilité** ; les 19 modérées restantes sont toutes en `devDependencies` (jest) |
| 2 | **Contenu servi mais non précaché** : 2 leçons sur 25 (`lecon_representation`, `lecon_activite_structure`) absentes de `CORE_URLS` alors que `lessonHtmlGetters.ts` les sert. Hors ligne, écran vide — précisément le cadre d'usage visé. | comparaison `public/lessons/*.html` × `CORE_URLS` | les 2 URLs ajoutées à `CORE_URLS` | nouveau verrou `src/data/swPrecacheComplet.test.ts` (4 tests) : **toutes** les leçons du disque sont précachées, aucune URL fantôme ; 25/25 dans `dist/sw.js` |
| 3 | **`npm run test:build` laissait `dist/` inutilisable** : `vite build` vide `dist/` sans réémettre `dist/server.cjs` (esbuild est dans `npm run build`) → après un `test:build`, le dossier servable n'avait plus de serveur. | `ls dist/server.cjs` → absent après `test:build` | `test:build` appelle `npm run build` | `dist/server.cjs` présent ; serveur démarré et vérifié : `GET /` → **200**, `GET /api/health` → **200** `{"status":"ok"}` |
| 4 | **Garde-fou de poids du bundle mort** : plafond de 700 Ko dépassé de 34 %, test exclu de la suite unitaire et jamais lancé par la CI. | `npm run test:build` rouge (938 Ko) | **ratchet** : plafond de non-régression à 940 Ko, cible de 700 Ko conservée et rappelée dans le message d'échec + `scripts/poids-entree.mjs` qui publie le détail | `npm run test:build` → **14/14 verts** (le ratchet est désormais utile : il refuse toute dérive future) |
| 5 | **Plafond `non_prose` appliqué à une phrase juste** (30 % du barème) | mesuré : `« تتكون البروتينات… »` plafonnée, la même avec `نستنتج` non plafonnée | ⚠️ **tenté puis ANNULÉ** — voir ci-dessous | le banc `evaluerCopies.test.ts` a démasqué la régression |

**Pourquoi le point 5 n'a PAS été corrigé, alors qu'il pénalise un élève qui a raison.** Le correctif
naturel — laisser le test morphologique décider, sans exiger un marqueur de relation — a été écrit, testé,
puis **annulé le jour même sur preuve exécutée** : sur une salade construite avec toutes les formes
d'attendus du groupe, la note passait de **6/20 à 16,5/20**, et en mode exercice de **2,4/8 à 8/8**. Le
blindage anti-triche tombait. Deux critères de remplacement ont été mesurés et **ne séparent pas** :
densité de clitiques (phrase juste 63 %, salade 43 %) et densité de mots-outils (copie correcte 8 %,
salade 11 % — la salade en contient davantage). Sans corpus de copies réelles, aucun critère disponible ne
distingue une phrase rédigée d'une énumération de termes du cours. La dette est donc **figée** par
`src/data/dictionaries/plafondNonProse.test.ts` (6 tests, dont 3 nommés « DETTE » qui devront être
retournés le jour de la résolution), et sa résolution relève de H4. La sanction reste au moins
**expliquée à l'élève** : `SectionObligatoire` affiche les plafonds appliqués avec leur libellé.

**Bilan de la suite complète après ces corrections :** `npx tsc --noEmit` 0 erreur · `npx vitest run`
**206 fichiers / 2 479 tests passés, 0 échec**, 6 ignorés · `npm test` 138 invariants ·
`npm run check:v2` 0 erreur · `npm run test:build` 14/14 · `npm audit --omit=dev` 0 vulnérabilité ·
serveur démarré et interrogé.

### 10.6 M7 TRAITÉ — l'entrée passe de 938 Ko à 156 Ko (-83 %)

Le diagnostic de §10.3.1 disait : **70,5 % de l'entrée est de la DONNÉE**, tirée par trois imports
statiques. Il n'y avait donc pas de « réglage » à trouver : il fallait couper les chaînes. C'est fait.

| Ce qui est sorti de l'entrée | Poids | Par quel mécanisme |
|---|---:|---|
| `DashboardView → TodayCard → revisionPlan` (plan, cartes mentales, index des sessions BAC, banque de situations, contenus de leçons) | ≈ 250 Ko | `lazy(() => import('./TodayCard'))` + `Suspense` |
| `DashboardView → NbaCard → parcoursPath / nbaEngine → lessonModes + unitLessonSequences → lessonData + activeLessons` | ≈ 286 Ko | `lazy(() => import('./NbaCard'))` + `Suspense` |
| `App → data/fillBlanks` (161 questions à trous) | 50 Ko | `src/data/fillBlanksLoader.ts` : import dynamique + cache + préchargement au repos (même motif que `corpusLoader`) |

**Mesure après** (`node scripts/poids-entree.mjs`, chemin critique à froid) :

| Ressource | Avant | Après |
|---|---:|---:|
| Entrée | 938 Ko (223 Ko gzip) | **156 Ko** (44 Ko gzip) |
| vendor préchargé (react + motion + icons) | 369 Ko | 369 Ko |
| CSS | 218 Ko | 218 Ko |
| **TOTAL brut** | **1 525 Ko** | **744 Ko (-51 %)** |
| **TOTAL gzip** | **362 Ko** | **184 Ko (-49 %)** |

Sur une 3G d'intérieur (40–60 Ko/s utiles), le premier affichage passe d'environ **7–10 s** à
**3–4 s**, et l'écran d'accueil apparaît sans attendre ni le plan de révision ni le chemin pédagogique.

**Ce qui a été vérifié, pas supposé :**

- **le contenu servi est identique** : `fillBlanksLoader.test.ts` compare le chargeur différé à la
  source directe (mêmes questions, même ordre, mêmes identifiants 9 000 000 + rang) ;
- **le quiz s'ouvre TOUJOURS** : si le morceau est injoignable (hors ligne), le quiz s'ouvre avec le
  seul corpus QCM — `.catch(...).finally(() => setActiveQuizUnitId(...))`, verrouillé par test ; jamais
  un bouton sans effet ;
- **hors ligne, les morceaux différés sont précachés** : le manifeste d'assets couvre les 88 fichiers
  émis (`dist/assets-manifest.json`), donc les deux nouvelles cartes et les questions à trous
  fonctionnent sans réseau après la première visite ;
- **l'accueil reste stable visuellement** : un placeholder de même hauteur remplace chaque carte
  pendant son chargement (décalage de mise en page évité au premier écran), volontairement sans
  animation ;
- **la suite complète** : 208 fichiers / 2 488 tests passés, 0 échec, 6 ignorés.

**Nouveau cliquet, et pourquoi il est à 176 Ko.** Le ratchet de §10.5 avait été posé à 940 Ko pour
l'entrée dégradée. La cible de 170 Ko est désormais **atteinte** : le plafond de non-régression est
donc resserré à 176 Ko (cible + 6 Ko de marge de mesure). Un test de la suite **unitaire** —
`src/data/poidsEntree.verrou.test.ts` — surveille en plus la **source** : il refuse la réintroduction
d'un import statique de `TodayCard`/`NbaCard`/`fillBlanks` et de leurs chaînes de données, avec la
raison écrite dans le fichier. C'est nécessaire parce que le ratchet de poids vit dans `src/build/**`,
exclu de la suite unitaire, donc **jamais exécuté par la CI** : sans ce verrou de source, une seule
ligne réintroduite pourrait regonfler l'entrée de 536 Ko en silence.

**Reste ouvert sur ce front (non fait, assumé) :** les 369 Ko de `vendor` sont préchargés pour
tout le monde. `vendor-react` (190 Ko / 59 Ko gzip) est incompressible ; en revanche `vendor-motion`
(126 Ko / 41 Ko gzip) n'est nécessaire qu'aux animations, et l'interface les utilise via `motion/react`
importé par `App.tsx` — le différer demanderait de sortir les animations du chemin critique une par
une, ce qui n'a pas été tenté ici (risque de régression visuelle non mesurable sans appareil).

### 10.7 H2 PRÉPARÉ — tout ce qui ne demande pas vos accès est fait et vérifié

**Ce que je ne peux pas faire, dit sans détour :** je n'ai aucun accès à la Play Console, à un compte
Google ni à une clé de signature, et mon jeton GitHub n'a pas la permission `workflows`. Aucune des
étapes ci-dessous n'est « soumise » : elles sont **prêtes à être exécutées**, et celles qui ne
dépendaient pas de vous sont **vérifiées en exécution réelle**.

**Deux vrais défauts corrigés au passage :**

1. **`metadata.json` déclarait une capacité serveur inexistante** —
   `MAJOR_CAPABILITY_SERVER_SIDE_GEMINI_API`, alors que le dépôt ne contient ni SDK Gemini ni route LLM
   (`grep` : 0 occurrence) et que le tuteur est un moteur local déterministe. C'est la promesse
   « بالذكاء الاصطناعي » du §4.4, mais **au format machine** : c'est le type de déclaration qui fait
   rejeter une fiche pour déclaration trompeuse. Corrigé, et verrouillé par test.
2. **La politique de confidentialité n'était pas publiable en l'état.** Elle existait, mais uniquement
   *dans* l'application, derrière JavaScript, en arabe seul : un relecteur qui ouvre l'URL sans exécuter
   le JavaScript ne voit rien, et un examinateur non arabophone ne peut pas la vérifier — deux motifs
   classiques de rejet. La route `GET /privacy` sert désormais une page **HTML autonome** (aucun
   `<script>`, aucune ressource externe) rendue depuis le **même fichier** (pas de deuxième texte à
   maintenir), **en arabe et en français**, avec la mention explicite que le texte arabe fait foi.

**Ajouté au dépôt :**

| Fichier | Rôle | Vérifié par |
|---|---|---|
| `GET /privacy` (`src/server/politiqueHtml.ts`) | Politique publique, autonome, bilingue | 12 tests + requête HTTP réelle |
| `GET /.well-known/assetlinks.json` (`src/server/assetLinks.ts`) | Digital Asset Links (TWA) | 11 tests + 2 requêtes réelles |
| `store/assetlinks.json` | Gabarit, volontairement **non servi** en l'état | test dédié |
| `store/fiche-play.json` | Titre, descriptions, nouveautés — ar + fr | 12 tests (limites Play) |
| `store/data-safety.md` | Brouillon du questionnaire « Sécurité des données », sourcé ligne par ligne | — |
| `store/README.md` | Runbook : paquet, TWA/Capacitor, empreinte, captations, envoi | — |
| `public/manifest.json` | `id`, `scope`, `categories` ajoutés | 7 tests |
| `src/data/politiqueConfidentialite.ts` | `SECTIONS_CONFIDENTIALITE_FR` (traduction de courtoisie) | verrou existant toujours vert |

**Vérifications de bout en bout** (serveur réellement démarré, `NODE_ENV=production`) :

| Requête | Attendu | Obtenu |
|---|---|---|
| `GET /privacy` | 200 HTML sans JavaScript | **200**, `text/html; charset=utf-8`, 8 942 o, **0 balise `<script>`**, 8 sections arabes + 8 françaises, contact et date présents |
| `GET /.well-known/assetlinks.json` (gabarit) | refus explicite | **404** `{"error":"assetlinks_unavailable","raison":"placeholder"}` + journal serveur expliquant quoi remplir |
| `GET /.well-known/assetlinks.json` (renseigné) | servi | **200**, `application/json; charset=utf-8` |
| `GET /` | l'application n'est pas cassée | **200** |

**Défaut trouvé pendant cette vérification — et invisible aux tests.** Les deux routes avaient été
insérées dans le **corps du handler `/api/health`** : le repère de fin recherché (`});`) était celui du
`res.json(...)` imbriqué. Le code compilait, la suite était **verte**, et le serveur répondait
l'application au lieu de la politique. C'est la requête HTTP réelle qui l'a démasqué. Le test qui
couvrait ce câblage ne comparait qu'au repli SPA — il est désormais renforcé : les deux routes doivent
précéder `createViteServer()` (en développement, Vite répond **avant** le repli SPA) et aucune ne doit
se trouver dans un handler.

**Ce qui reste, et qui n'appartient qu'à vous :** compte développeur Play, nom de paquet définitif,
keystore, empreinte SHA-256 à recopier dans `store/assetlinks.json`, **captures d'écran prises sur un
appareil réel** (Play refuse les visuels maquettés), bandeau 1024×500, puis envoi en piste de test
interne. Le runbook détaille chaque commande.

**Ce que je recommande de ne pas se cacher :** la fiche annonce elle-même que l'application ne remplace
pas le professeur et que deux parties du programme restent à enrichir (immunité innée, une partie de la
géologie U11). Ce n'est pas une concession commerciale : c'est la seule position tenable pour un outil
qui prépare à un examen, et un élève qui découvre un trou après l'avoir achetée — pardon, téléchargée —
ne le pardonnerait pas.

---

### 10.8 Compte SANS adresse e-mail — le défaut bloquant l'inscription est traité

**Le défaut signalé (14/10/2026, par vous) :** « la majorité des élèves ne savent pas s'inscrire
avec email ». Vérification faite dans le code, ce n'était pas une impression — c'était **trois
défauts cumulés**, chacun suffisant pour faire abandonner un élève de 18 ans :

| Ce que l'élève voyait | Pourquoi il abandonnait |
|---|---|
| `POST /api/auth/register` exige `email + password + name` (400 `missing_fields` sinon) | L'adresse e-mail était **obligatoire**, sans alternative. |
| Le champ affichait `eleve@ecole.dz` | Un exemple d'adresse **scolaire** : presque aucun élève algérien n'en a une. Le formulaire lui disait donc qu'il lui fallait quelque chose qu'il n'a pas. |
| Un mot de passe **à inventer** (6 caractères minimum), récupérable seulement par un code généré par l'enseignant | Charge de mémoire pure, sans bénéfice visible : s'inscrire n'apportait rien d'immédiat à l'élève. |
| Le seul point d'entrée était l'**avatar de l'en-tête** | Aucun bouton « créer un compte » sur l'accueil, aucune explication. |

**Ce qui a été mis en place — sans migration de base, sans e-mail, sans mot de passe à inventer :**

| Élément | Choix | Raison |
|---|---|---|
| Code de connexion | **8 caractères**, alphabet à **31 signes** sans `I`, `L`, `O`, `0`, `1` | Se dicte au téléphone, se recopie depuis un tableau sans devenir un autre code (31⁸ ≈ 8,5 × 10¹¹). |
| Code secret | **6 chiffres** (14 suites devinables refusées : `000000`, `123456`…), au lieu du mot de passe à inventer | C'est un code de téléphone : ça se retient. Le couple est vérifié côté serveur avec `bcrypt`, comme avant. |
| Stockage | Identifiant interne `<code>@eleve.local` rangé dans la colonne `email` existante | **Aucune migration** sur SQLite, PostgreSQL ni store dégradé ; la contrainte `UNIQUE` déjà en place garantit l'unicité du code. `.local` est réservé (RFC 6762) : aucun domaine public ne peut l'écraser. |
| Connexion | **Une seule porte** : le champ accepte le code OU l'adresse e-mail | Les comptes existants continuent de fonctionner ; l'élève n'a pas à savoir de quel type il est. |
| Saisie tolérante | minuscules, espaces, tirets, points, **chiffres arabo-indiens** (٠-٩) et persans (۰-۹) | Un élève qui recopie son code écrit à la main ou sur un clavier arabe se connecte, au lieu d'échouer sans comprendre. |
| Ce que voit le professeur | Le **code** (`XXXX-XXXX`) dans le tableau de bord et dans l'export CSV (colonne renommée `code`) | L'adresse technique `<code>@eleve.local` n'a aucun sens pour lui et n'est pas joignable. Elle ne sort **jamais** de l'API. |
| Accueil | **Carte « أنشئ حسابك بدون بريد إلكتروني »** en haut de la page de démarrage, plus l'avatar de l'en-tête | Le chemin d'inscription était invisible. Le mode invité reste rappelé sur la carte (« أو تابع كزائر »). |

**Écran de remise du code.** Après création, le code s'affiche **en grand, une seule fois**, avec un
bouton de copie et la phrase « دوّنه الآن » — et l'élève n'est connecté qu'après avoir confirmé
l'avoir noté. Aucun e-mail de secours n'existe : le perdre est récupérable, mais seulement par le
professeur. C'est dit à l'écran, pas caché.

**Ce qui a été réellement exécuté**

| Vérification | Résultat |
|---|---|
| `src/server/codeEleve.test.ts` | **22 tests** — alphabet sans caractères ambigus, bornes d'aléa (pas de `undefined`), normalisation arabo-indienne, allers-retours code ↔ identifiant, PIN interdits, `resoudreIdentifiant` (code / e-mail / rebut). |
| `src/server/inscriptionSansEmail.test.ts` | **16 tests** avec un store en mémoire et `bcrypt` réel : 201 + code au bon format, **aucun mot de passe en clair**, PIN faible refusé **avant toute écriture**, 200 inscriptions sans une seule collision, **collision simulée → retente** (jamais d'écrasement), **503 après exactement 5 essais** (pas de boucle), erreur 409 du store remontée, connexion par code (minuscules / espaces / points / arabo-indien), comptes e-mail intacts, **mêmes 401 pour tous les échecs**, saisie hors format qui n'interroge même pas la base, `email: null` et zéro fuite de `@eleve.local`. |
| `src/components/StudentAuthView.test.tsx` | **7 tests** — onglet par défaut « بالرمز », **`eleve@ecole.dz` banni**, code affiché avant connexion, 6 chiffres seulement transmis, messages d'erreur en arabe compréhensible, mode invité proposé en cas de panne. |
| `src/components/__tests__/CompteSansEmail.test.tsx` | **4 tests** — carte visible sur l'accueil, clic → ouverture, disparaît si session, **pas de bouton mort** si l'action n'est pas branchée. |
| `src/__tests__/compteSansEmail.cablage.test.ts` | **12 tests** — routes derrière les limiteurs de débit, quota compté sur les **deux formes** d'un même code (sinon deviner 6 chiffres devient possible en variant tirets et casse), routes **avant** `createViteServer()`, 503 en mode dégradé, aucune fuite de l'adresse interne dans `/me`, le tableau de bord et le CSV, et **interdiction de tout placeholder en `@ecole`** dans le code exécutable. |
| Suite complète | **217 fichiers / 2 590 passés / 6 ignorés / 0 échec** (`npx vitest run`), `npx tsc --noEmit` **0 erreur**. |
| Budget d'entrée (M7) | **156 → 158 Ko** pour une cible de 170 et un plafond de 176 : `npm run test:build` → **14/14**. Le nouveau parcours coûte 2 Ko. |
| Serveur de production (`dist/server.cjs`) | `GET /` **200** ; `register-code` → validation active (`400 weak_pin`) ; connexion code inexistant → `401` ; store indisponible → **`503 storage_unavailable`** (et non 500 : une panne de persistance n'est pas une erreur serveur). |

**Deux limites, dites franchement :**

1. **Le binaire natif SQLite n'est pas compilable dans cet environnement** (pas de `node-gyp` utilisable).
   Les routes ont donc été validées par des tests qui montent la logique avec un store conforme au
   contrat réel, **et** par des requêtes HTTP réelles contre le serveur de production — mais
   l'inscription allant jusqu'à l'écriture en base n'a pas pu être exécutée ici. À refaire chez vous en
   une commande : `npm run build && JWT_SECRET=… node dist/server.cjs`, puis créer un compte depuis le
   navigateur.
2. **Ce n'est pas une sécurité bancaire, et ça ne doit pas être présenté comme telle.** Un code de
   connexion affiché, dicté ou photographié n'est pas un secret. Le dispositif protège contre la
   devinette **en ligne** (limiteurs IP + compteur par identifiant) et contre les erreurs de saisie —
   pas contre un camarade qui a lu le code sur le carnet. Pour un usage réellement sensible, il faudra
   un second facteur ; ce n'est pas proportionné aujourd'hui pour un outil de révision.

**Effet attendu :** l'élève qui n'a ni adresse e-mail ni envie d'en créer une peut être suivi par son
professeur en **moins d'une minute**, avec deux champs et un code à noter. Le mode invité reste
inchangé — rien n'a été rendu obligatoire.

---

### 10.9 « Et si l'élève donne son mot de passe à un autre ? » — un défaut d'attribution trouvé en cherchant

**La question posée (14/10/2026) :** « si l'élève donne le mot de passe et l'e-mail à un autre élève, ça
fonctionne sur un autre téléphone ? »

**Réponse courte : oui, sur les deux voies.** Aucun compte n'est lié à un appareil, ni l'ancienne voie
e-mail + mot de passe, ni la nouvelle voie code + code secret. C'est le propre de tout identifiant
partagé : Google, Facebook et les plateformes scolaires ont exactement la même propriété. Ce qui compte
n'est donc pas « peut-on empêcher le partage » (non), mais **ce que le partage permet de faire** — et
c'est là que la vérification a mis au jour autre chose.

**Le vrai défaut, découvert en lisant le code :** la file de synchronisation locale était **globale à
l'appareil**, et `flushActivityQueue()` envoyait **tout ce qui traînait**, sous le jeton présent au
moment du flush.

| Le code disait | Conséquence réelle |
|---|---|
| `QUEUE_KEY = 'boussole_activity_queue'` — une seule file, sans notion de propriétaire | Le travail de tout utilisateur de l'appareil est rangé dans la même file. |
| `if (!token) return;` — en mode invité, rien ne part | Le travail d'invité **s'accumule** sur l'appareil au lieu d'être envoyé ou isolé. |
| `doFlush()` → `fetch('/api/student/sync', … Authorization: Bearer ${token})` | Le premier compte qui se connecte ensuite **récupère tout le stock accumulé**. |

**Scénario concret, courant en Algérie :** un téléphone pour la famille. Le frère révise en invité
pendant trois semaines, la sœur crée son compte sur le même téléphone (ou l'élève se connecte après
avoir révisé). **Les quiz, les missions, les drills et les productions du frère sont envoyés sous le
nom de la sœur** dans le tableau de bord du professeur. Ce n'est plus un problème de partage de mot de
passe : c'est une **fausse attribution de travail** — le professeur suit un élève qui n'a rien produit,
et l'assiduité affichée est fausse.

**Preuve avant correctif** (tests écrits d'abord, 6 échecs) :

```
FAIL   le travail fait AVANT la connexion ne part PAS quand un compte se connecte
       AssertionError: expected "vi.fn()" to not be called at all, but actually been called 1 times
```

**Correctif appliqué — chaque activité porte l'identité qui l'a produite :**

| Mesure | Effet |
|---|---|
| `owner` sur chaque élément de la file, figé **au moment où l'élève travaille** | On ne devine plus après coup à qui appartient un travail. |
| L'identité vient du **`studentId` décodé du jeton** (et non du jeton, qui change à chaque connexion) | L'identité est stable dans le temps ; un jeton d'enseignant n'a pas de `studentId` → il ne peut rien s'attribuer. |
| `flushActivityQueue()` n'envoie **que** les éléments de l'identité connectée | Deux élèves sur le même téléphone ne se mélangent plus, même en se connectant à tour de rôle. |
| Le travail d'invité n'est **jamais** attribué d'office : bandeau « هل هذه الأنشطة لك ؟ » sur l'accueil, avec « اربطها بحسابي » / « ليست لي » | L'élève tranche. Ce qui était silencieux devient explicite — c'est la seule correction honnête. |
| Les éléments écrits **avant** ce correctif (sans `owner`) sont traités comme « invité » | Prudence : on ne peut pas prouver leur origine, donc on ne les attribue pas sans confirmation. |

**Vérifications exécutées**

| Contrôle | Résultat |
|---|---|
| Nouveaux tests (`src/utils/__tests__/attributionActivites.test.ts`) | **9 tests** : travail d'invité non attribué, deux identités successives non mélangées, travail en attente qui repart au bon compte après déconnexion/reconnexion, import explicite, refus, import sans compte, non-régression du flux connecté, jeton opaque non bloquant. |
| Bandeau d'accueil (`CompteSansEmail.test.tsx`) | **7 tests** au total : compteur affiché, silence en mode invité, refus qui n'envoie rien. |
| Suite complète | **218 fichiers / 2 602 passés / 6 ignorés / 0 échec** ; `npx tsc --noEmit` **0 erreur**. |
| Budget d'entrée | **158 → 162 Ko** (cible 170, plafond 176) — `npm run test:build` **14/14**. Le correctif coûte 4 Ko. |

**Ce que je n'ai PAS corrigé, et pourquoi c'est un choix, pas un oubli :**

1. **Le partage d'identifiants reste possible.** L'empêcher demanderait de lier le compte à un appareil —
   je le déconseille fermement ici : en Algérie, le téléphone est souvent partagé dans la famille, et un
   verrou d'appareil bloquerait plus d'élèves légitimes (changement de téléphone, prêt d'un téléphone,
   réinstallation) qu'il n'arrêterait de tricheurs, qui contourneraient en se passant l'appareil.
2. **Les jetons ne sont pas révocables.** `server/auth.ts` vérifie la signature et l'expiration, jamais la
   base : un jeton volé ou partagé reste valide **7 jours**, même si le code secret change ensuite
   (le changement passe par un code généré par le professeur). Corriger proprement demande une table de
   sessions — donc une migration, refusée jusqu'ici pour de bonnes raisons. À rouvrir **seulement** si
   l'application sert à noter des travaux.
3. **Rien n'affiche « quel appareil / quelle dernière connexion »** au professeur : cela demande la même
   table de sessions.

**Recommandation, si l'identité compte un jour :** ne pas verrouiller les appareils — **faire distribuer
les codes par le professeur**. Le CLI enseignant existe déjà (`npm run teacher`) : créer les comptes en
classe, imprimer les codes, les remettre en main propre. Un code remis en main propre vaut bien mieux
qu'une empreinte d'appareil, et cela ne coûte aucune ligne de code supplémentaire.

---

### 10.10 Bilan des accès élève — et un verrouillage définitif trouvé en le rédigeant

**Document dédié : `docs/BILAN_ACCES_ELEVE_2026-10-14.md`** (inventaire des quatre portes d'accès, ce que
chacune ouvre, défenses chiffrées, ce qu'elles ne protègent pas, 102 tests de couverture).

**Quatre portes :** invité (défaut, sans compte), code de connexion 8 caractères + code secret 6 chiffres,
e-mail + mot de passe (voie historique conservée), récupération par code du professeur (8 caractères
CSPRNG, 30 min, usage unique).

**Le défaut trouvé pendant la rédaction — et celui-ci était grave :** la récupération acceptait
**n'importe quel mot de passe d'au moins 6 caractères**, alors que l'écran « بالرمز » **effaçait tout
caractère non numérique** de son champ secret. Un élève **sans adresse e-mail** qui réinitialisait son
secret avec un mot de passe alphabétique ne pouvait donc plus jamais se connecter : sa seule autre voie
(l'onglet e-mail) exige une adresse qu'il n'a pas. **Verrouillage définitif, silencieux.**

| Correctif | Détail |
|---|---|
| Serveur | Compte sans e-mail → le nouveau secret doit être un code à 6 chiffres conforme à l'inscription (`validerNouveauSecret`, réponse `400 weak_pin`). |
| Ordre du refus | Avant l'écriture du mot de passe **et** avant `markResetUsed` : un secret refusé ne brûle pas le code du professeur. |
| Écran de connexion | Le champ secret **n'efface plus** les lettres en mode connexion (l'inscription reste limitée à 6 chiffres) — un compte réinitialisé autrement peut toujours rentrer. |
| Message | `weak_pin` dit explicitement pourquoi : « حسابك بدون بريد إلكتروني: اختر رمزًا سريًا من 6 أرقام ». |

**Vérifications :** `inscriptionSansEmail.test.ts` **18** tests (dont 2 sur la cohérence du secret de
réinitialisation), `compteSansEmail.cablage.test.ts` **14** (dont l'ordre refus → écriture → consommation),
`StudentAuthView.test.tsx` **8** (dont le secret non numérique en connexion). Suite complète **218
fichiers / 2 607 passés / 6 ignorés / 0 échec**, `tsc` 0, `test:build` 14/14, entrée **162 Ko**.

**Ce que ce bilan ne peut pas dire — et il faut le savoir avant de s'appuyer dessus :** combien d'élèves
s'inscrivent réellement, quel est le taux d'abandon, combien utilisent le mode invité. **Aucune télémétrie
n'existe** : ces chiffres sont **non vérifiables** aujourd'hui, et les invités sont invisibles du serveur
par construction (rien ne part sans compte).

---

### 10.11 « Aucune télémétrie » : ce qui était vrai, ce qui ne l'était pas, et ce qui est mesuré maintenant

**Question posée :** « Comment règle-t-on cette situation : combien d'élèves s'inscrivent, le taux
d'abandon, combien utilisent le mode invité → non vérifiable ? »

**Réponse honnête : une seule des trois questions est réellement hors d'atteinte.** Les deux autres se
mesuraient déjà — les données existaient, personne ne les exploitait.

**Vérification faite dans le code** : `students.created_at`, les compteurs `entries` et `activities`
existaient tous les deux ; le tableau de bord n'exposait que `inscrits`, `actifs7j`, `actifs30j`. Rien
n'était collecté de plus à ajouter pour répondre à « combien s'inscrivent » et « combien décrochent
après l'inscription ».

**Ajouté (module pur `src/server/mesurePilotage.ts`, agrégats sur lignes existantes)** : inscriptions des
7 derniers jours ; **inscrits sans aucune trace** (ni production, ni quiz) ; parmi eux, ceux inscrits
depuis plus de 7 jours ; le pourcentage d'inscrits qui n'ont pas commencé ; et le **délai médian entre
l'inscription et la première trace**. Affiché au professeur sous « مؤشرات المتابعة », avec la mention
que le mode invité n'y figure pas.

**Ce qui reste réellement non mesurable, et son prix exact :**

| Question | Pourquoi c'est non mesurable | Ce qu'il faudrait changer |
|---|---|---|
| Taux d'abandon **pendant le formulaire** | Aucun événement client n'existe | Niveau 1 : journal local, envoyé **seulement** une fois le compte créé (attention : exclure ces événements de `calculeActivite()`, sinon un élève inactif passerait pour « actif 7 jours ») |
| Nombre d'utilisateurs du **mode invité** | C'est la promesse elle-même : « في وضع الزائر: لا يغادر أي شيء هاتفك إطلاقا » (§3 de la politique) | Niveau 2 : identifiant d'appareil aléatoire + 5 événements auto-hébergés. **Réécriture de §3 et §1 de la politique + trois lignes du formulaire Play** (`store/data-safety.md` : « en mode invité : Aucune » et « Identifiants de l'appareil : Non » deviennent **Oui**) |

**Ce que je n'ai pas fait, et pourquoi :** je n'ai pas implémenté le niveau 2. Il échange un argument de
confiance (« rien ne quitte votre téléphone sans compte ») contre un chiffre, et c'est un **choix de
positionnement** face à des concurrents qui, eux, embarquent des SDK publicitaires. Il ne m'appartient
pas. Le niveau 3 (Firebase/GA) est **interdit par la politique publiée** (§4 : pas d'analytics externe)
et le rester est un avantage, pas une contrainte.

**Document dédié : `docs/MESURE_ET_ANONYMAT.md`** — les trois niveaux, leurs coûts exacts, et le
protocole d'observation en classe (30 élèves, 10 minutes, papier) qui donne un taux d'abandon **avec sa
cause**, là où la télémétrie ne donne qu'un taux.

**Vérifications :** `mesurePilotage.test.ts` **14 tests** (médiane paire/impaire, médiane absente sans
échantillon plutôt que 0, fenêtre de 7 jours, trace la plus ancienne et non la plus récente, délai
négatif borné, date illisible, 1 000 élèves sans double comptage) ; `serverDashboard.test.ts` **+4**
(2 statiques : route et colonnes des deux stores ; 2 d'intégration SQLite — **sautés ici**, les bindings
natifs ne se compilent pas dans cet environnement, ils tournent en CI). Suite complète **219 fichiers /
2 623 passés / 8 ignorés / 0 échec** ; `tsc` 0 ; `test:build` 14/14 ; entrée **162 Ko** ; serveur de
production : `/api/teacher/dashboard` répond **401 missing_token** (aucune erreur au chargement du module).

---

### 10.12 Protection de l'application : la source du serveur était publique

**Déclencheur :** une vidéo sur REA (« Reverse Engineer Anything », serveur MCP) — un agent IA clone une
application compilée en 1 h pour 40 $. Vérification faite sur votre build de production, le vrai problème
était ailleurs, et plus grave.

**Fuite trouvée et corrigée (14/10/2026) :** `express.static(dist)` servait **tout** `dist/`, y compris le
bundle serveur et sa source map.

| Requête | Avant | Après |
|---|---|---|
| `GET /server.cjs` | **200**, 93 Ko | **404** |
| `GET /server.cjs.map` | **200**, 202 Ko — TypeScript d'origine (`server.ts`, `server/store.ts`, `server/rateLimit.ts`, `src/server/codeEleve.ts`…) | **404** |
| `GET /package.json` | **200** | **404** |
| `/assets/../server.cjs`, fichiers cachés | servis | **refusés** + journal `[static] bloqué` |
| `/index.html`, `/assets/*`, `/manifest.json`, `/sw.js`, `/api/health`, `/privacy` | 200 | **200** (inchangés) |

Verrou : `src/__tests__/publicationStatique.test.ts` (**7 tests**). Aucun outil de rétro-ingénierie
n'était nécessaire : une seule commande `curl` suffisait.

**Ce qui est exposé côté client, mesuré :** 7,7 Mo de JavaScript livrés ; **552 clés de correction**
(`correctAnswerIndex`) dans un seul chunk — extractibles par `grep` ; 21 365 chaînes arabes de leçons en
clair ; le moteur de correction est dans le bundle (identifiants minifiés, logique relisible). Aucun
secret dans le bundle, `.env` non versionné, données élèves non versionnées.

**Document dédié : `docs/PROTECTION_APPLICATION_2026-10-14.md`** — modèle de menace (élève qui triche,
cloneur, curieux), contradiction structurelle du hors ligne, plan par rapport valeur/coût (A : protéger
la valeur ; B : élever le coût ; C : protéger juridiquement), et ce qu'il ne faut **pas** faire
(obfuscation lourde, verrouillage d'appareil, blocage du copier-coller).

**Position tenue, sans adoucissement :** l'application ne sera jamais protégée contre la copie — le hors
ligne la rend copiable par conception. Ce qui se défend : la marque, la relation avec les professeurs, et
ce qui se calcule (barème, progression, suivi). Recommandation immédiate, 1 h de travail : **mélanger les
propositions des QCM par session**, pour qu'une clé extraite devienne inutilisable.

**Vérifications :** suite complète **220 fichiers / 2 630 passés / 8 ignorés / 0 échec** ; `tsc` 0.

---

### 10.13 État du dépôt après un redémarrage du bac à sable (14/10/2026, 13 h)

**Ce qui s'est passé.** Entre deux tours, le bac à sable a été recréé : `.git` a été **re-cloné**
(`reflog` : `clone: from https://github.com/sinamind414/kunz-el-ouloum.git`). Les **13 commits locaux**
de cette session (`c19d965` → `60390fc`) ont disparu ; le fichier de secours
`kunz-el-ouloum-2026-10-14.bundle`, créé hors du dépôt, également.

**Ce qui a été vérifié ensuite, requête par requête :**

| Contrôle | Résultat |
|---|---|
| Fichiers du travail (71) | **tous présents** dans l'arbre de travail — restaurés par le mécanisme de session |
| Fichiers du distant absents chez nous | **0** (`git diff --name-status origin/master HEAD` : aucune suppression) |
| Fichiers ajoutés chez nous | **30** |
| Différence avec le distant | 50 fichiers, **+5 278 / −203** : notre arbre est **plus récent** (M7, H2, comptes sans e-mail, attribution, mesure, protection) |
| Les 3 fichiers qui divergent (`App.tsx`, `DashboardView.tsx`, ce document) | les lignes « manquantes » sont les versions **antérieures** que M7 et les tours suivants ont remplacées — aucune perte |
| Suite de tests sur l'arbre restauré | **220 fichiers / 2 630 passés / 8 ignorés / 0 échec** |

**Conséquence pratique : rien n'est perdu en contenu, mais l'historique est aplati en un seul commit**
(`2ce234a`, base `77d9459`, alors que `origin/master` est à `eb88039`). Un futur poussoir devra donc :
1. pousser ce commit et **laisser le serveur fusionner** avec `eb88039` (notre arbre est un sur-ensemble
   du contenu déjà fusionné) ; ou
2. rebaser d'abord sur `origin/master` en résolvant les 3 fichiers divergents **en faveur de notre
   version** (elle est plus récente dans les trois cas).

**Ce que cela enseigne, et qui vaut pour la suite :** un travail non poussé ne survit qu'à condition que
le bac à sable le restaure. Tant qu'une branche n'est pas poussée, elle n'existe pas — c'est la raison
pour laquelle tout ce chantier est resté local et pourquoi il doit être poussé depuis une session neuve.

---

### 10.14 A1 implémentée — la clé volée ne vaut plus rien à la session suivante

Fuite mesurée (§10.12) : 551 à 552 clés `correctAnswerIndex` dans le paquet livré, extractibles par
`grep`. On ne peut pas les retirer (le quiz doit se corriger hors ligne), donc elles sont rendues
**inutilisables** : les propositions changent de place **à chaque session**.

| Fichier | Ce qui a été fait |
|---|---|
| `src/utils/melangeOptions.ts` **(neuf)** | Graine de session (`sessionStorage`, repli sûr en navigation privée), permutation Fisher-Yates déterministe, `melangerQuestion(s)`, `origineDe` |
| `src/components/QuizView.tsx` | Affiche la liste mélangée ; l'aide « pourquoi mon choix est faux » passe par `origineDe` — sinon elle désignerait une **autre** proposition |
| `src/components/QcmLivreView.tsx`, `QcmBilanView.tsx` | Mêmes questions, propositions réordonnées (champ `correct`) |
| `src/smartTutorEngine.ts` | Le mélange existant dépendait du seul identifiant de question → **même ordre à chaque session**. La graine de session entre désormais dans le calcul |

**Tests :** 23 (module pur, dont dispersion sur 400 sessions et table position→origine sur 100 graines) +
6 (écran réel, clic par texte, aide qui parle de l'option cliquée). Suite complète **222 fichiers /
2 659 passés / 8 ignorés / 0 échec** ; `tsc` 0 ; build OK ; `test:build` 14/14 ; entrée **162 Ko**.

**Limite, non dissimulée :** dicter le **texte** de la bonne réponse reste possible. Aucun dispositif
technique ne l'empêche, et c'est vrai de tout QCM. Ce qui est mort : « la réponse est la 2ᵉ ».

---

### 10.15 A3 implémentée — un document qui sort porte désormais une marque retrouvable

**Problème :** un élève partage sa fiche de résultats en PNG sur WhatsApp, imprime un sujet, ou exporte
sa fiche d'évaluation. Ce document était **anonyme** : rien ne disait d'où il venait, donc rien ne
dissuadait et rien ne permettait de remonter à la source.

**Ajouté :** `src/utils/marque.ts` (module pur) + `src/components/MarqueDocument.tsx` (pied de page
`print:block hidden`), apposés sur **5 vues imprimables** (sujet d'examen, plan de révision, fiche
d'écriture, méthodologie, العكاشة) et **2 images partagées** (fiche de résultats PNG, bilan hebdomadaire).
La correspondance marque → élève passe par une **colonne `marque`** ajoutée aux deux lignes de
`/api/teacher/export/csv`.

**Principe : la marque ne contient AUCUN identifiant** — ni nom, ni e-mail, ni code de connexion. Un
document qui fuit ne doit pas livrer de quoi se connecter.

**La faiblesse du dispositif, identifiée et verrouillée :** tout repose sur l'égalité entre la marque
calculée dans le navigateur (jeton → `studentId`) et celle calculée par le serveur (`student.id`). Un
test vérifie les **trois maillons** de cette chaîne ; sans lui, une divergence silencieuse rendrait le
marquage purement décoratif.

**Tests :** 36 (20 module + 11 chaîne/CSV + 5 composant). Suite complète **225 fichiers / 2 695 passés /
8 ignorés / 0 échec** ; `tsc` 0 ; build OK ; `test:build` 14/14 ; entrée **164 Ko**.
**Un test antérieur a été mis à jour** (`compteSansEmail.cablage.test.ts`, en-tête CSV exact) : son
intention est conservée, la chaîne attendue a évolué avec la colonne ajoutée.

**Limites assumées :** une capture recadrée efface la marque ; le mode invité reste intraceable par
construction (sa ligne l'écrit au lieu de faire semblant) ; la marque sert à **attribuer**, pas à prouver.

---

### 10.16 A2 implémentée — le serveur définit le barème et l'horloge (chantier A4 non fait)

**Trouvé (vérifié dans `server/store.ts`) :** `/api/student/sync` stockait `icm`, `stage` et `createdAt`
**tels quels**. Une production annoncée à `icm: 9999` entrait dans la moyenne du professeur ; un
`createdAt` en 2030 rendait l'élève « actif dans les 7 jours » pour toujours — et faussait donc aussi
`actifs7j` et `retardPremiereTrace` du bloc de pilotage (§10.11). Un lot de 300 entrées était tronqué à
100 **sans le dire**.

**Corrigé :** module pur `src/server/assainirEntrees.ts` (35 tests) appelé par la route avant stockage —
ICM entier 0-100, étape 1-4 (miroir exact de `StepId`), texte borné, lot borné **et compté**, date
future remplacée par l'heure du serveur (mais date **ancienne conservée** : le hors ligne est un choix,
un élève doit pouvoir synchroniser une semaine de travail), `payload` borné. Les refus sont renvoyés au
client, journalisés côté serveur, et **affichés à l'élève** (bandeau « لم تُسجَّل N عناصر عند أستاذك »)
parce qu'un succès muet lui ferait croire que son travail est arrivé.

**Câblage verrouillé par 16 tests** : la route n'appelle plus `addEntriesIfNew(studentId, entries)` brut.
Suite complète **227 fichiers / 2 746 passés / 8 ignorés / 0 échec** ; `tsc` 0 ; build OK ;
`test:build` 14/14 ; entrée **166 Ko** (cible 170, plafond 176).

**Ce qui reste ouvert, et qui est le vrai sujet : A4.** Le barème et le corrigé vivent encore dans le
paquet livré à l'élève : une copie médiocre peut être annoncée à 100/100 et le serveur n'a aucun moyen
de le détecter. Déplacer le moteur de correction côté serveur est un chantier d'une autre ampleur
(le moteur est aujourd'hui client, et l'application doit rester utilisable **hors ligne**). A2 ferme la
porte à l'absurde ; A4 seul fermerait celle de la triche fine.

---

### 10.17 Le guide pédagogique : ce qui a été fait, ce qui a été refusé, et ce qui manque

**Demande du 14/10/2026 :** faire du personnage المرشد « le guide pédagogique » de l'application, en
7 sections (attirer, communiquer, rappeler la méthode, relier question et document, expliquer les
erreurs, accompagner les répétitions, distinguer les modes, mémoire par élève).

**La vidéo jointe** est un résumé audio français de *The Diary of a CEO*, sans contenu technique. Son
**principe 2** — « faire ami avec la douleur d'avoir tort » — est exactement la philosophie de la
section 5 de la demande (« en cas d'erreur : أخطأت، وهذا جيد »). C'est ce qui a été retenu.

**§7 — LE BUG MAJEUR, CORRIGÉ.** Le bouton flottant du المرشد était rendu sous `!isFocusMode &&
currentTab !== 'chat'`. Or **rien ne règle `isFocusMode` pendant « موضوع تجريبي »** : seul `QuizView`
le pilote, et `App` le remet à `false` à chaque changement d'onglet. L'élève pouvait donc ouvrir le
tuteur **au milieu d'une épreuve chronométrée** (4 h 30, phases قراءة/تحرير/مراجعة) et lui demander la
réponse. Une épreuve pendant laquelle on peut interroger l'assistant n'est pas une épreuve.

Corrigé : `src/lib/examenEnCours.ts` (signal idempotent, sans React), déclaration par `MockExamPanel`
du montage au démontage, abonnement unique dans `App`, et **explication affichée dans l'épreuve** —
une disparition sans explication passe pour une panne et l'élève cherche à la contourner. Le mode focus
n'a **pas** été réutilisé : il change la mise en page, dont l'examen a besoin pour rester lisible.

**§2/§3 — LA VOIX EST FAITE, AVEC DEUX REFUS ARGUMENTÉS.** `src/data/capitaine.ts` (source unique) :
huit situations de parole, chacune disant **ce qu'il faut faire**, jamais « bravo » ; un test interdit
les formules creuses. Deux points de la demande ont été refusés :

| Point demandé | Refus | Fondement |
|---|---|---|
| Nommer le personnage « القبطان مفتاح » | « المفتاح » est le nom de **la méthode et du produit** | `MARQUE.md` §2 : « La clé (المفتاح) = la méthode : 4 étapes, 2 portes » ; `MIFTAH_NAME_AR`, `المفتاح+`, garde-fou `check:miftah`. « حامل المفتاح » et « أمين الكنز » sont **déjà des badges** du récit |
| Chaîne « فعل → دليل → **جواب** → فحص » | La chaîne verrouillée est **فعل · دليل · علاقة · جواب** | `MARQUE.md` §14 (décision owner 2026-09-22) : les 4 dents sont ces gestes, et « فحص » est explicitement **hors** des quatre (ceinture `SELF_CHECKS`, option α). Retirer « علاقة » viderait la taxonomie d'erreurs de son cœur : `unsupported_claim` et `premature_interpretation` n'ont plus de sens |

La chaîne publiée est **lue depuis le moteur** (`STEP_NAMES_AR`, `SELF_CHECKS`) : elle ne peut pas
dériver, et un test échoue si quelqu'un la réécrit sans changer la décision de marque.

**§8 — LA MÉMOIRE EXISTE, AU NIVEAU HONNÊTE.** `src/utils/profilErreurs.ts` : compteurs par code de
`ERROR_TAXONOMY` (les 9 erreurs de méthode, chacune avec nom arabe et contre-mesure), récence, thèmes.
**Locale** (`localStorage`) : un test vérifie l'absence de `fetch`/`XMLHttpRequest`/`sendBeacon` et de
tout identifiant d'élève — la promesse « rien ne quitte ton téléphone » (politique §3) tient. Le guide
affiche l'erreur dominante **de cet élève** dans « دفتر الأخطاء », et se tait en dessous de deux
occurrences.

**Ce que la mémoire ne sait PAS, et qui est le cœur de la demande :** la famille « confusions de
notions » (ADN/ARNm, codon/anticodon, observation/interprétation) **n'a aucun producteur** aujourd'hui
— les QCM ne portent pas d'étiquette de notion. La structure les accepte ; rien ne les remplit.
Inventer ces confusions serait pire que de ne pas les avoir.

**§1 — LE PERSONNAGE N'EST PAS LÀ OÙ VOUS CROYEZ (mesuré).** Le personnage n'est visible que dans
**2 écrans** : `AITutorView` (4 références) et `QuizView` (2). Il est **absent** de l'accueil, du
parcours, de la méthodologie, des révisions et de la préparation au Bac — c'est-à-dire exactement les
six endroits que la section 1 de la demande énumère. **Il reste aujourd'hui un logo, pas une présence.**
Le §1 de la demande n'est donc **pas** satisfait par ce chantier, et je ne l'ai pas fait : la voix et la
mémoire étaient les préalables (un personnage qui parle sans rien savoir de l'élève répète la même
phrase à tout le monde).

**Mapping de la demande, sans arrondir**

| § | Demande | État réel |
|---|---|---|
| 1 | Il attire (présence sur 6 écrans) | ❌ **non fait** — 2 écrans seulement, mesuré |
| 2 | Il communique (messages par situation) | ✅ fait, source unique, 19 tests |
| 3 | Il rappelle la méthode | ✅ fait — **chaîne corrigée** à فعل · دليل · علاقة · جواب + ceinture |
| 4 | Il relie question et document | ⚠️ **partiel** : règles et modèles existent (`boussoleData`, `VERB_CARDS`), le guide n'y ajoute pas d'assistance contextuelle |
| 5 | Il explique les erreurs | ✅ fait (local, 9 codes, contre-mesures) |
| 6 | Il accompagne les répétitions | ⚠️ **existant** (`SPACED_RECALL_INTERVALS`, `SELF_CHECKS`), non relié à la voix du guide |
| 7 | Il distingue les modes | ⚠️ **partiel** : mode examen = silence ✅ ; guidé / semi-autonome **n'existent pas** comme modes distincts |
| 8 | Mémoire par élève | ⚠️ **niveau 1** : erreurs de méthode oui, confusions de notions non (aucun producteur) |

**Tests :** 55 nouveaux — `capitaine.test.ts` (19 : alignement sur `STEP_NAMES_AR`, refus de « مفتاح »,
« فحص » hors chaîne, aucun message creux, personnalisation seulement sur `erreur`/`reprise`),
`profilErreurs.test.ts` (23 : codes inconnus ignorés, dominante par fréquence puis récence, classement
stable, silence sous deux occurrences, stockage corrompu, **aucun accès réseau**), `examenEnCours.test.ts`
(13 : idempotence, abonnés fautifs, câblage réel des deux côtés, condition du bouton, non-réutilisation
du mode focus). Suite complète **230 fichiers / 2 801 passés / 8 ignorés / 0 échec** ; `tsc` 0 ; build OK ;
`test:build` 14/14 ; entrée **166 Ko**.

### 10.18 Le capitaine devient le chatbot, et « L'effet cumulé » corrige un défaut réel

Deux vidéos fournies le 14/10/2026 : `HTR1Ff8BlHU` (*Atomic Habits*, James Clear — audiobook)
et `OXDtyJ1eVv8` (*L'effet cumulé*, Darren Hardy — audiobook, 1 h 32). Les deux ont été lues
puis appliquées. Demande : « le capitaine est le chatbot de l'application — une rubrique sur le
menu, une bulle, 24/24 h ».

#### a) Ce qui a été fait

| Élément | État | Preuve |
|---|---|---|
| Rubrique dans le menu | ✅ le tuteur s'appelle **القبطان** (titre d'onglet, en-tête, porte d'accueil) | `App.tsx`, `DashboardView.tsx`, `AITutorView.tsx` |
| Bulle permanente | ✅ présente sur toutes les rubriques sauf pendant l'épreuve | `App.tsx` (bloc `fab-morchid`) |
| Elle prend la parole | ✅ sur 4 situations seulement, sinon silence | `lib/invitationCapitaine.ts`, 32 tests |
| L'icône ronde | ✅ conservée ronde, contient le personnage (plus la boussole) | `public/logo_capitaine_avatar.png`, 11 tests de câblage |
| Le chatbot est le capitaine | ✅ accueil réécrit : identité + refus de donner la réponse + 2 minutes | `AITutorView.WELCOME_TEXT` |
| Cumul du travail | ✅ champ `joursActifsTotal`, jamais remis à zéro | `utils/serie.ts`, `utils/activiteQuotidienne.ts` |
| Cumul affiché et parlé | ✅ compteur d'accueil + message du capitaine | `DashboardView.tsx`, `invitationCapitaine.ts` |

#### b) Le « 24/24 » est refusé tel quel — et c'est le livre qui le dit

Un signal présent en permanence n'est plus un signal : c'est le mur du fond qui disparaît. La loi n° 1
que l'utilisateur cite lui-même (« rendez-le évident ») **exige** que le signal se distingue du décor.
La bulle est donc **toujours là** (24/24 sur la présence, comme demandé) mais **ne parle qu'au bon
moment** : `invitationDuMoment()` renvoie `null` la nuit (avant 7 h, après 22 h), pendant une épreuve,
et pendant 6 h après que l'élève a dit « لاحقًا ». Le silence est une décision, pas un oubli, et il est
testé.

Les 4 lois sont appliquées littéralement :

| Loi | Application | Traduction dans le code |
|---|---|---|
| 1. Évident | elle parle au bon moment, un seul signal | 5 cas de silence, tous testés |
| 2. Attrayant | elle nomme ce que l'élève a **déjà** construit | « سلسلتك: 6 أيام » plutôt qu'une consigne |
| 3. Facile | règle des 2 minutes, une action, un clic | `cible` = identifiant d'onglet réel (testé) |
| 4. Satisfaisant | la récompense immédiate est **nommée** | `gainImmediatAr`, jamais « une bonne note » |

Deux règles du livre sont implémentées en priorité absolue : **« ne jamais rater deux fois »**
(un jour manqué déclenche la reprise avant tout autre message) et **la règle des 2 minutes**
(le seul message qu'un compte vierge reçoit est « un seul QCM », jamais « révise le chapitre »).

#### c) Défaut réel trouvé en lisant *L'effet cumulé* : la série effaçait le travail

`serieAffichee()` renvoie **0 dès qu'un jour est manqué**. Conséquence mesurée dans le code :
un élève ayant travaillé 42 jours lisait « **0** » sur **six écrans**, dont le compteur de l'en-tête
de l'accueil — l'application lui annonçait que son travail n'existait plus, précisément au moment où
il risquait d'abandonner. Hardy dit l'exact contraire : les résultats s'accumulent, un jour manqué
n'efface rien.

Corrigé : `EtatSerie.joursTotal` (cumul jamais remis à zéro, +1 par jour d'activité, une seule fois
par jour), persisté dans `dailyGoals.joursActifsTotal`, affiché, et **parlé** par le capitaine :
« 40 jours dans ton solde, rien n'est perdu ». La série garde son rôle (mesurer la régularité, elle
peut casser) ; le cumul mesure l'acquis (il ne casse jamais). Les données déjà stockées sans ce champ
repartent de 0 — **aucun cumul rétroactif n'est inventé**.

#### d) Défaut réel trouvé en câblant la bulle : 104 Ko dans le premier écran

La bulle a fait passer le bundle d'entrée de **166 Ko à 270 Ko** (+59 % sur la cible de 170 Ko).
Cause exacte, trouvée en lisant les imports : `App.tsx → data/capitaine.ts → data/methodologyEngine.ts`
(105 Ko), et `useInvitationCapitaine → utils/profilErreurs → methodologyEngine`. Une chaîne de titres
d'onglet entraînait tout le moteur méthodologique sur des téléphones d'entrée de gamme.

Corrigé en **déplaçant** la donnée (jamais en la recopiant) : `data/errorTaxonomy.ts` et
`data/capitaineIdentite.ts`, ré-exportés par leurs modules d'origine pour ne rien casser ; le compteur
d'erreurs arrive par **import dynamique**. Mesure après correction : **171 Ko** (+5 Ko pour la fonctionnalité,
+1 % sur la cible). Verrou ajouté dans `poidsEntree.verrou.test.ts` : `methodologyEngine`, `data/capitaine`
et `boussoleData` sont désormais sur la liste noire, et `totalErreurs` ne peut plus redevenir un import
statique du hook.

#### e) Contradiction à trancher, non contournée

**« القبطان » est un terme de marine.** Or la charte Boussole v2 (KEO-205) a précisément retiré le
lexique marin de l'accueil du tuteur (« une seule voix, plus de lexique marin »). Le nom demandé
contredit donc une décision de vocabulaire antérieure. Le choix retenu est celui de la demande la plus
récente et la plus explicite, mais il est **signalé** ici plutôt que dissous en silence : soit la charte
évolue (le personnage devient un capitaine assumé, ce qui est cohérent avec le bateau, la boussole et
le drapeau), soit le nom change. Le coût d'un changement est désormais d'**une ligne**
(`data/capitaineIdentite.ts`).

#### f) Ce qui n'est toujours pas fait

| Demande | État |
|---|---|
| Audios, animations complètes | ❌ non commencé |
| Mémoire détaillée par élève (confusions ADN/ARNm, codon/anticodon) | ⚠️ structure prête, **aucun producteur** — les QCM ne portent pas d'étiquette |
| Correction automatique des réponses longues | ❌ hors périmètre actuel |
| Examen Bac complet minuté | ⚠️ `MockExamPanel` existe, barème serveur A4 non fait |
| Modes guidé / semi-autonome (au-delà du mode examen) | ❌ n'existent pas comme modes distincts |
| Multiplicateurs de Hardy (travail quotidien, « 1 % chaque jour ») | ❌ non implémenté — nécessiterait de mesurer un volume quotidien, ce que l'app ne fait que partiellement |

**Tests de ce tour :** `invitationCapitaine` 32 (dont 6 sur le cumul), `serie` 20 (dont 6 sur le cumul),
`cumulAffichage` 7 (chaîne calcul → persistance → affichage → parole), `cablageCapitaine` 11 (dont le rond
et le visage), `poidsEntree.verrou` étendu. **Suite complète : 233 fichiers / 2 860 passés / 8 ignorés /
0 échec.** `tsc` 0 ; build OK ; `test:build` 14/14 ; entrée **171 Ko** (cible 170, ratchet 700).

### 10.19 Le point A de l'analyse LITE, et le guide qui accueille en entrant

#### a) Le point A : la mémoire des erreurs a enfin un producteur

**Le défaut, mesuré.** `enregistrerErreurs` n'était appelé qu'à **deux endroits** de toute
l'application (`MethodologyCompilerView.tsx` L361 et L459 — les productions de l'atelier). Un élève
qui ne touche jamais cet atelier gardait donc une mémoire d'erreurs **vide à vie**, et la bulle du
capitaine ne pouvait jamais lui dire « on sait où tu te trompes ».

**Le défaut caché derrière.** La famille « confusions de notions » décrite dans `utils/profilErreurs.ts`
n'était pas seulement sans producteur : elle était **impossible à remplir**. La garde de
`enregistrerErreurs` n'accepte que les clés de `ERROR_TAXONOMY`, et aucune ne décrivait une confusion
de notions. Le commentaire était une intention, pas une donnée.

**Ce qui a été fait.** Une entrée `notion_confusion` dans la taxonomie (step 2 — la ceinture qui
l'attrape est « as-tu nommé la valeur et l'unité ? »), et une question posée **une seule fois par
séance**, à la fin d'un QCM, seulement s'il y a eu au moins une erreur. Quatre causes que l'élève
reconnaît dans sa propre erreur, dont « سبب آخر » qui **n'enregistre rien**.

**Pourquoi l'élève déclare et non l'application.** Aucune des 549 questions du corpus ne porte
d'étiquette de notion : l'application n'a aucun moyen de déduire la cause d'une erreur. Toute
déduction serait une invention — `profilErreurs.ts` le dit déjà (« Inventer ces confusions serait
pire que de ne pas les avoir »). Le LITE règle ce même problème de la même façon (T1–T4 déclarés par
l'élève) et cela fonctionne depuis des semaines : c'est le seul mécanisme de la liste que nous
n'avions pas.

**Décision de rythme.** La question est posée à la fin de la séance, pas après chaque question ratée.
Un QCM de dix questions poserait dix fois la même interrogation : du bruit, pas une mémoire.

#### b) Le guide qui accueille en entrant dans une rubrique

Demande : « le tutor morchid parle quand tu rentres à une rubrique, donne des conseils comme un prof ».

**Appliqué, avec une règle en plus.** Le guide parle à la **première visite** d'une rubrique, pas à
chaque entrée. Un professeur explique comment utiliser une salle la première fois ; il ne refait pas
le discours à chaque passage. Répéter à l'identique n'informe plus — c'est la loi n° 1 du livre que
l'utilisateur a lui-même fourni (un signal permanent n'est plus un signal).

| Élément | Choix retenu | Raison |
|---|---|---|
| Quand | Première visite seulement | Un signal répété devient du décor |
| Contenu | 14 consignes de **méthode**, chacune avec le geste à faire | « Relis bien » ne change aucun geste ; « termine un exercice » si |
| Portée | Volontairement incomplète | `badges`, `stats`, `mindmap` n'ont pas de méthode à enseigner : silence |
| Rappel | Bouton « ؟ » dans l'en-tête | Disponible sans être imposé |
| Mémoire | Marquée **à l'affichage**, pas à la fermeture | Sinon un élève qui change d'onglet sans lire revoit le discours à l'infini |
| Épreuve | Silence complet | Règle du §7, déjà appliquée à la bulle |

**Coût mesuré :** entrée 171 → **177 Ko** (+6, dont ~4 Ko de texte arabe), +4 % sur la cible de 170.
Assumé : différer les textes derrière un import dynamique ferait apparaître le bandeau **après** la
navigation, ce qui est pire que 6 Ko.

**Tests :** 22 nouveaux, dont 9 sur les cas de **silence** et 2 verrous qui interdisent de ranger un
conseil sous un onglet inexistant ou d'écrire son texte en dur dans le composant.

---

### 10.20 « صح » → « hors programme » : le tuteur accusait l'élève de sa propre question

**Défaut rapporté par un élève** (capture du 14/10/2026), reproduit avant toute correction :

> fiche `تركيب البروتين` → question `صح أم خطأ` → l'élève répond **`صح`** →
> « ❓ هذا السؤال خارج قاعدة علوم الطبيعة والحياة للبكالوريا », badge `خارج المقرر`, **0 %**.

**Cause exacte.** Le moteur posait cette question de rappel en fin de fiche **sans garder aucune trace
de l'avoir posée**. `صح` — deux lettres, aucun mot du programme — traversait donc toute la cascade
jusqu'au détecteur de hors-sujet, qui ne pouvait que conclure au hors-programme. Le tuteur déclarait
hors programme **sa propre question**, au moment précis où l'élève faisait l'effort de répondre.

C'est un défaut de la famille la plus coûteuse en pédagogie : ce n'est pas une erreur d'affichage, c'est
un **signal qui punit le bon comportement**. Un élève qui répond correctement et se fait accuser de
hors-sujet n'apprend pas qu'il s'est trompé — il apprend à ne plus répondre.

**Réparation, en quatre points.**

| # | Correctif | Effet mesuré |
|---|---|---|
| 1 | État `pendingRecallCardId`, posé partout où la fiche part et consommé **avant** le garde-fou | `صح` → **90 %**, verdict `✅ صحيح` + la phrase de la fiche qui le prouve |
| 2 | Question rendue **vérifiable** (`phraseRelation`) | plus de vrai/faux tautologique ; à défaut, tâche de production |
| 3 | Saisie nue sans question en attente → demande de précision | `صح`, `نعم`, `لا`, `خطأ` seuls ne sont plus « hors programme » |
| 4 | `لا أعرف` n'est plus lu comme « faux » | l'incertitude est aidée au lieu d'être démentie |

**Deux défauts trouvés en écrivant ce correctif** — et c'est le résultat le plus utile de la séance,
parce qu'ils étaient **plus graves que le bug d'origine** :

- **Une question recevait le verdict du rappel.** Après une fiche, `ما هو الاستنساخ؟` était noté comme
  réponse à la question précédente. Le tuteur aurait répondu à côté à une vraie question. Les questions
  — point d'interrogation ou mot interrogatif en tête — sont désormais exclues.
- **`راجع أخطائي السابقة` laissait l'état armé.** Cette intention est traitée *plus haut* dans la
  cascade que le bloc qui écoute la réponse : l'élève quittait la question, l'état restait chargé, et sa
  saisie **suivante** recevait un verdict qui ne la concernait pas. Une intention forte (menu, test,
  révision, défi) abandonne maintenant la question posée, **en tête de cascade** — l'emplacement est
  le correctif, pas un détail d'implémentation.

**Ce que ce bug dit de l'architecture, au-delà du bug.** Chaque fois qu'un module pose une question sans
écrire qu'il l'a posée, la réponse de l'élève devient du bruit pour le reste de la cascade. Le défaut
n'était pas dans le détecteur de hors-sujet — il faisait son travail — mais dans le **contrat entre le
producteur de la question et le consommateur de la réponse**. Les deux corrections appliquées ici
(`pendingProbeCardId` puis `pendingRecallCardId`) referment ce contrat pour les deux seules questions
que le tuteur pose. **Recommandation :** tout futur producteur de question doit écrire son état *et* un
test qui vérifie que la réponse attendue est reconnue — sinon le même bug revient par une troisième
porte.

**Vérification.** 24 tests neufs (`rappelActifReponse.test.ts`) : la capture rejouée à l'identique,
oui/non/vrai/faux, l'incertitude, la réponse libre, les intentions fortes, la question juste après la
fiche, et le cas hors contexte. Suite complète **237 fichiers / 2930 passés / 8 ignorés / 0 échec**,
`tsc --noEmit` = 0, `test:build` 14/14, entrée **177 Ko — inchangée** (aucun import ajouté).
Commit `3e83869`.
