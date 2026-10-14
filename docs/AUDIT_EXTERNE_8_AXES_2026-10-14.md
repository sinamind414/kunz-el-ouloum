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
4. **La couverture n'est pas complète, et l'app ne le dit pas à l'élève (axes 1, 2, 4).** Les manques sont reconnus en commentaire de code mais invisibles côté produit : U4 immunité (« 11 chapitres, 6 couverts » — `unitLessonSequences.ts`), le chapitre « الحزينات الدفاعية في الحالة الأولى » (immunité innée) est **absent du corpus** (0 occurrence), U11 (collision/ophiolites « à reconstruire »), 1 sujet BAC incomplet (2021 S2 Ex1), et **25 fichiers de leçons pour 47 clés** — deux d'entre eux (`lecon_activite_structure.html`, `lecon_representation.html`) **ne figurent pas dans le précache du service worker** (`public/sw.js`, `CORE_URLS`) : hors ligne après une première visite, un élève ne les a pas. Enfin, l'app se décrit comme « بالذكاء الاصطناعي » (`metadata.json`) alors que le tuteur est un moteur local déterministe (`smartTutorEngine.ts` : « Moteur local offline — UNIQUE source ») : c'est un écart entre promesse et implémentation, même s'il est techniquement à l'avantage de l'élève (pas de coût, pas de réseau).
5. **Dette de distribution et de validation (axes 3, 4, 7).** `package.json` est en **version 0.0.0**, `git tag` renvoie **0 tag**, il n'existe aucun processus de release, et `npm audit` remonte **21 vulnérabilités dont 1 critique (`proxy-addr`, CVSS 9.1, *IP spoofing via IPv4-mapped IPv6 trust subnet*, GHSA-jqcg-44mw-7w3h — contournement possible du limiteur par IP si `TRUST_PROXY=1`) et 1 haute (`source-map-js`, GHSA-68fv-2mgg-jv7q)** ; les deux correctifs sont disponibles. Côté pédagogie : les métriques du correcteur (`docs/SUPERVISION_ACTUEL.md`) reposent sur un corpus **de calibration, pas de validation indépendante** — le document le dit lui-même — et l'objectif interne (MAE ≤ 8 % du barème par exercice) **n'est pas atteint sur les 3 exercices (10 %, 10 %, 9 %)**.

---

## 5. 🔧 Recommandations

### Priorité HAUTE (bloquant pour un lancement public)

| # | Axe | Recommandation concrète | Preuve/état actuel |
|---|---|---|---|
| H1 | 7 | **Rendre la CI verte.** Externaliser le corpus de copies (`KUNZ_CORPUS_ELEVE_18`) et transformer les 2 tests en `skipIf` avec un test « corpus absent ⇒ ignoré explicitement », doublé d'un verrou permanent sur copie synthétique. | ✅ **FAIT (§10.1)** — les 3 jobs CI reproduits sur export propre : 0 échec |
| H2 | 7, 8 | **Produire un binaire.** TWA (ou Capacitor) depuis le `dist` existant → AAB signé, fiche Play Store (nom, captures, description, politique de confidentialité **déjà rédigée** dans `politiqueConfidentialite.ts`), piste de test interne d'abord. | `docs/SPECKIT_CORRECTION_2026-10-01.md` liste déjà l'écart « hors stores » ; aucune fiche aujourd'hui |
| H3 | 6 | **Réparer la série (streak) ou la supprimer.** Implémenter la règle (dernier jour actif = J-1 → +1, sinon reset), l'écrire dans `dailyGoals.streakDays` **et** `progress.streak`, ajouter un test unitaire « 7 jours consécutifs ⇒ badge débloqué », et bannir les `streak || 1` (afficher 0 si 0). | ✅ **FAIT (§10.2)** — 54 tests, dont 6 d'intégration sur `<App />` |
| H4 | 3 | **Valider le correcteur sur du réel, comme le dépôt le prévoit déjà.** Constituer le jeu F5 (300 copies authentiques, double correction à l'aveugle, ≥20 % arbitrées, calibration/test séparés) et **publier r vs prof par exercice**. À défaut, afficher la note comme « estimation » et remonter l'incertitude. | `docs/SUPERVISION_ACTUEL.md` : corpus de calibration uniquement ; MAE/barème 10-10-9 % vs cible 8 % |
| H5 | 1, 2 | **Combler les trous déclarés et publier une matrice de couverture.** 3 chantiers : immunité innée (« الحزينات الدفاعية في الحالة الأولى »), U11 (collision + ophiolites), leçons orphelines du précache SW. Afficher côté élève une matrice *unité × ressources exigibles (L5)* avec un état ✅/⚠️ par ressource. | 0 occurrence de « الحزينات الدفاعية » ; commentaire « à reconstruire » ; 2 leçons hors `CORE_URLS` |

### Priorité MOYENNE (qualité et échelle)

| # | Axe | Recommandation | Preuve/état actuel |
|---|---|---|---|
| M1 | 7 | **Supprimer le double embarquement des leçons.** Aujourd'hui chaque leçon existe en `public/lessons/*.html` (2 146 674 octets dans `dist/`) **et** en chunk JS `?raw` (2 143 991 octets) — et le SW précache **les deux** ⇒ ~4,3 Mo téléchargés et stockés deux fois sur un téléphone bas de gamme. Garder une seule source de vérité. | `du -sb dist/lessons` = 2 146 674 ; 25 chunks JS `phaseNN` = 2 143 991 |
| M2 | 7 | **Mettre à jour les dépendances** (`npm audit fix` — les deux correctifs sont disponibles) et **durcir le serveur** : `helmet`, CSP, et vérifier que `trust proxy` n'ouvre pas le limiteur IP. | `proxy-addr` **critique CVSS 9.1** — *IP spoofing via IPv4-mapped IPv6 trust subnet* (GHSA-jqcg-44mw-7w3h) ; `source-map-js` haute — DoS boucle d'événements (GHSA-68fv-2mgg-jv7q) |
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
