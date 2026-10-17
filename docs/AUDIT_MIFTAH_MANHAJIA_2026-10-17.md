# Audit pédagogique — مفتاح المنهجية

**Date :** 17 octobre 2026
**Périmètre :** parcours élève, volume éditorial, cohérence des explications, accès à l’entraînement et adéquation au Bac algérien SVT de 3AS.
**Nature du travail :** audit initial du dépôt et des sources consultées, suivi de l’implémentation essentielle autorisée (« GO »). Les constats des sections 1–5 décrivent l’état avant les changements ; le suivi post-implémentation figure en section 7.

## 1. Verdict exécutif

**Le noyau pédagogique est pertinent, mais la rubrique n’est pas encore organisée comme un parcours simple à apprendre.** Le défaut principal n’est pas qu’un écran affiche tout le texte d’un coup : les accordéons limitent effectivement ce problème. C’est plutôt la concurrence entre **plusieurs entrées, plusieurs taxonomies et plusieurs supports**, sans parcours novice qui relie clairement « comprendre → essayer → écrire → vérifier ».

Le contenu insiste à juste titre sur l’action demandée, la sélection du bon indice, la distinction entre analyse et interprétation, et une conclusion qui répond à l’objectif. Les exemples BAC 2025 sont riches. En revanche :

- le premier écran du hub offre **7 ateliers de poids visuel égal**, puis la page du مفتاح présente **3 niveaux et l’application BAC** comme quatre choix ouverts ; les prérequis sont du texte, pas des étapes imposées ;
- les exemples BAC exposent la réflexion, la réponse modèle et le piège au même clic, sans demander ni mesurer un essai préalable ;
- le nombre de « portes » et de « gestes » varie selon l’écran et le support ; certaines sections se recouvrent ;
- la fiche imprimable React et le HTML autonome annoncés comme identiques ne portent pas le même parcours ni le même nombre de pages ;
- plusieurs affirmations de notation sont formulées comme des certitudes générales alors que les sources repérées ne les établissent pas comme règles universelles.

**Conclusion franche :** la rubrique peut bien *expliquer* une méthode, mais son organisation actuelle ne permet pas d’affirmer qu’elle la fait *assimiler*. Le gain prioritaire est de réordonner et d’unifier l’existant, non d’ajouter du contenu.

## 2. Ce qu’un élève rencontre réellement

### 2.1 Entrée dans la rubrique

Le hub `MethodologyCompilerView.tsx` ouvre bien par défaut sur `meftah` — c’est un bon choix. Mais son en-tête affiche simultanément le nom/version, l’ICM, l’étape active, **7 ateliers** (simulateur, index des verbes, matrice, correction, règles, مفتاح + BAC 2025, mur حلّل) et un bouton séparé pour la fiche imprimable. Pour un élève débutant, les outils de suivi et de correction apparaissent au même niveau que l’apprentissage.

### 2.2 Accueil de مفتاح

`MeftahView.tsx` affiche au même niveau :

1. `المفتاح` — base ;
2. `المفتاح+` — avancé ;
3. `المفتاح++` — couche écriture ;
4. l’application sur les trois exercices du BAC 2025.

Le texte dit de commencer par le premier visage puis de progresser, mais les quatre cartes sont cliquables immédiatement. Les « prérequis » ne verrouillent rien et aucun enchaînement interne à cette page ne conduit de la base à un exercice guidé. Le test `MeftahView.test.tsx` fige même la présence des quatre cartes au premier écran.

À l’intérieur d’un visage, les sections sont repliées : **cela réduit la densité instantanée**, mais l’élève peut les ouvrir dans n’importe quel ordre. C’est une bibliothèque accordéonnée, pas encore une progression pédagogique.

### 2.3 Accessible à l’arrivée vs enfoui

| Niveau d’accès | Contenu constaté | Effet pour l’élève |
|---|---|---|
| **Dès l’ouverture du hub** | Les 7 ateliers, les métriques et le bouton séparé de la fiche imprimable. | Beaucoup de choix avant que le besoin de l’élève soit diagnostiqué. |
| **Après l’entrée dans مفتاح** | Les trois visages et l’application BAC apparaissent ensemble ; aucun n’est techniquement verrouillé. | La progression est suggérée par les prérequis textuels, mais pas organisée dans l’interface. |
| **Après le choix d’un visage ou d’un exercice** | Les sections détaillées et les questions ; il faut encore ouvrir chaque accordéon pour voir le contenu ou la correction. | C’est là que se trouve l’essentiel des explications, tableaux et réponses modèles : accessible, mais enfoui derrière plusieurs clics. |
| **Par une autre route de l’application** | Le simulateur à quatre phases, le guide général, l’index des verbes, la matrice et la correction. | Ces ressources peuvent enrichir l’apprentissage, mais le parcours Meftah ne les relie pas toutes au bon moment. |

Ainsi, **la charge à l’arrivée est surtout une charge de choix**, tandis que **le volume d’explications est principalement enfoui**. Réduire arbitrairement le nombre de règles n’est donc pas la première intervention ; il faut d’abord hiérarchiser l’accès et faire pratiquer le noyau.

### 2.4 Volume réellement encodé

Les nombres ci-dessous comptent les blocs de contenu, pas leur difficulté ni le temps de lecture.

| Couche | Sections | Puces | Lignes de tableaux |
|---|---:|---:|---:|
| Base | 7 | 12 | 4 |
| Plus | 9 | 20 | 17 |
| Plusplus | 8 | 25 | 6 |
| **Total dans les trois niveaux** | **24** | **57** | **27** |

L’application BAC ajoute **3 exercices, 10 questions et 35 lignes de réponses modèles**. Chaque question possède aussi une consigne, des étiquettes, une explication « ما أفكر » et parfois un piège. Le corpus est donc substantiel, mais il n’est pas entièrement visible d’un seul coup.

À côté de cette rubrique, `OkachaView.tsx` donne accès au « الدليل العام للمنهجية » : **11 sections, 20 tableaux et 25 entrées à cocher**, soit un second document de référence conséquent. Il s’agit d’une autre entrée de l’application, pas d’un écran du مفتاح ; il faut donc distinguer le volume total disponible de ce qui est présenté au premier passage.

## 3. Qualité pédagogique : ce qui fonctionne et ce qui bloque

### Points forts à conserver

- Le principe central est mémorisable : **identifier ce que la consigne demande, sélectionner une preuve pertinente, construire le lien si le verbe l’exige, puis répondre à l’objectif**.
- La séparation analyse/interprétation est explicitement enseignée ; elle vise une erreur fréquente et coûteuse dans les réponses documentaires.
- Les exemples BAC associent la consigne, « ce que je pense », « ce que j’écris » et un piège. C’est plus utile qu’une liste abstraite de définitions.
- Le simulateur possède déjà une progression intéressante : modelage, complétion, production guidée, puis simulation. Le drill espacé et le retour ciblé existent aussi ailleurs dans le hub. **Il n’est pas nécessaire d’inventer un second système d’apprentissage.**
- La recherche arabe et les accordéons servent de référence rapide ; ils sont adaptés à une consultation ponctuelle, à condition de ne pas les confondre avec le parcours d’apprentissage.

### Faiblesses prioritaires

#### A. Le novice doit choisir avant d’avoir compris quoi choisir

Sept ateliers restent visibles dans l’en-tête, alors que le contenu propose déjà plusieurs niveaux, une application BAC, une fiche imprimable et un simulateur distinct. Le système contient un parcours en quatre étapes, mais l’élève doit le trouver lui-même parmi les ateliers. **La page d’arrivée dit “choisis un atelier” au lieu de prendre en charge le choix.**

#### B. Les exemples sont consultables sans production

Dans `BacQuestionCard`, un clic révèle ensemble le raisonnement attendu, la réponse modèle et le piège. Le rappel « 30 secondes silencieuses » est une consigne, pas une vérification d’effort : l’interface n’exige ni un classement des éléments, ni un brouillon, ni une réponse avant révélation. L’élève peut donc lire une solution et avoir l’impression de la maîtriser sans l’avoir récupérée de mémoire ni transférée à une nouvelle consigne.

La recherche en apprentissage favorise notamment les tests de rappel et la pratique espacée ; elle souligne aussi le rôle du feedback et les limites de généralisation à des tâches plus profondes. Cela soutient l’ajout d’un **essai court suivi d’un feedback**, pas la promesse qu’un simple accordéon garantit l’apprentissage [2][3].

#### C. Le modèle n’est pas présenté de façon uniforme

Les sources et vues exposent des formulations proches, mais pas identiques :

- l’en-tête du hub annonce **4 gestes et 3 portes** ; le simulateur enseigne une cascade de trois portes ;
- l’accueil de `MeftahView` annonce **4 gestes et deux portes**, et la section `gates` de la base distingue « الوثيقة » et « المكتسبات » ;
- la carte React présente **deux portes + une ligne “عائلتي”** ; la décision de marque explique que cette ligne représente une reconnaissance, pas une porte supplémentaire ;
- la fiche HTML v6 présente **trois familles** différentes (`أصف / أقرأ / أحكم`) et traite le contrôle final comme un cinquième geste, tandis que la vue principale parle de quatre gestes.

La distinction « deux portes + famille » peut être un choix de présentation valable. Le problème est que le مفتاح principal de l’application ne montre pas explicitement la correspondance avec les trois portes de l’entraînement. Les décisions antérieures de `docs/MARQUE.md` disent que l’application garde trois portes, alors que la vue Meftah affiche deux portes.

Autre ambiguïté dans la base : la section **علاقة** inclut une recette en quatre sous-étapes qui se termine par « استنتاج الهدف », puis la section **جواب** enseigne de nouveau l’aboutissement à l’objectif. Il faut séparer nettement **le lien entre données** de **la phrase qui répond à la question**.

#### D. Les supports annoncés comme identiques divergent

La page `MethodologyCompilerView.tsx` affirme que `MiftahCard` correspond à 100 % au HTML autonome et se présente comme une impression A4 recto-verso. Pourtant, dans le dépôt actuel :

- `public/miftah.html` v6 montre **5 gestes** (avec فحص), **3 familles** et deux faces ; il précise que les indications de notation ne sont pas un barème officiel général ;
- `MiftahCard.tsx` montre **4 gestes**, deux portes + la famille, conserve un contenu avancé et une annexe PRO sur une troisième page ; plusieurs formulations de notation y sont catégoriques.

Le fait que ces supports diffèrent est cohérent avec leur historique, mais **l’interface affirme aujourd’hui qu’ils sont identiques**. Un élève qui imprime l’un et apprend dans l’autre n’obtient pas la même carte mentale.

#### E. Des affirmations de barème demandent une vérification, pas une emphase

La carte React et `miftahSpec.ts` affirment notamment qu’une réponse non numérotée vaut zéro, qu’une conclusion sans mots de la question « n’est pas lue », ou attribuent des fractions de point comme si elles étaient générales. Or la fiche v6 avertit explicitement que ses indications ne sont pas un barème officiel général ; `docs/MARQUE.md` (§12quater) signale aussi que la règle « numéro manquant = zéro » n’apparaît pas dans le corrigé 2025 examiné et demande d’adoucir le ton des affirmations.

**Statut : Non vérifiable comme règle universelle dans les sources officielles consultées.** `docs/MARQUE.md` rapporte que, dans le barème 2025 qu’il a examiné, la numérotation relève de la présentation et non de la notation ; l’audit présent n’a pas pu vérifier ce document ministériel original. Tant qu’une consigne précise et sa grille de correction ne sont pas citées, remplacer ces absolus par des recommandations de présentation (« numérote pour rendre ta réponse repérable ») et ne pas promettre de perte de points déterminée. C’est une question de confiance pédagogique, pas seulement de style.

## 4. Organisation recommandée pour un élève de 3AS

### Principe : un parcours court, puis une référence

Ne pas supprimer les contenus utiles. Présenter une seule route principale et guidée ; garder le reste dans une bibliothèque clairement facultative, accessible sans confondre référence et progression.

| Étape | Écran / action de l’élève | Contenu à garder visible |
|---|---|---|
| **1. Commencer ici** | Un seul bouton principal depuis le hub ; une fiche d’une minute. | Objectif du contexte, consigne entière, action demandée. Pas d’ICM, matrice ou file de correction au premier plan. |
| **2. Décider quoi faire** | Répondre à trois décisions courtes avant d’écrire : y a-t-il un document ? d’où viennent les éléments ? quel produit demande la consigne ? | Présenter ces décisions comme un tri d’entrée ; expliquer en une ligne que le « 2 portes + familles » de la carte et les « 3 portes » du simulateur décrivent ce même tri. |
| **3. Apprendre le noyau** | Appliquer quatre gestes sur un exemple : **فعل → دليل → علاقة (si demandé) → جواب**. | Une règle par geste. Le contrôle final reste une vérification séparée, pas une cinquième étape concurrente. |
| **4. Essayer avant de voir** | Classer une consigne, choisir une preuve, ou écrire un brouillon très court sur papier/téléphone ; ensuite seulement ouvrir la correction. | Réutiliser le simulateur existant pour le modelage et la complétion ; feedback immédiat, une erreur à la fois. Ne pas exiger une longue saisie arabe sur mobile. |
| **5. Transférer au Bac** | Résoudre seul une question d’un sujet algérien, puis comparer à la réponse modèle. | Un exercice BAC à la fois, d’abord une question, avec les unités et les preuves attendues ; varier ensuite le type de tâche. |
| **6. Vérifier et revoir** | Faire le contrôle final, nommer l’erreur à corriger, revoir une consigne différente plus tard. | Garder le rappel espacé déjà disponible, mais tester son seuil et son effet sur le transfert avant d’en faire une barrière dure. |

### Ce qui passe en « Référence / Approfondir »

- Les tableaux de verbes et les détails des 24 sections ; ne pas les mettre en concurrence avec le bouton de démarrage.
- Les formes avancées : hypothèse, expérience, texte scientifique, schéma, calcul, arbre généalogique et analyse selon le type de document.
- Les trois exercices BAC 2025 complets et leurs réponses modèles, avec un filtre par consigne plutôt qu’une deuxième route principale.
- Le guide général long, identifié comme **référence complète** (et non comme une autre méthode de départ).
- La matrice, le correcteur et les analyses de progression, regroupés sous « Suivre mes progrès » ou dans un espace enseignant.

Dans le hub, regrouper les sept ateliers sous **Apprendre**, **S’entraîner**, **Suivre mes progrès** et **Références**. Conserver l’accès libre aux outils avancés, mais ne pas leur donner le même poids visuel au premier passage.

## 5. Corrections à prioriser avant d’ajouter du contenu

1. **Fiabilité du message** — vérifier chaque phrase de barème contre une grille citée ; remplacer les règles absolues non prouvées ; aligner la carte React et le HTML autonome, ou retirer la promesse de parité.
2. **Modèle unique** — publier une mini-carte de correspondance : trois décisions d’entrée → quatre gestes d’écriture → contrôle final. Fixer les libellés et le rôle de la famille de tâche ; distinguer clairement relation et réponse finale.
3. **Parcours novice** — remplacer les cartes de niveaux concurrentes par « Commencer ici » ; déplacer le reste derrière « Référence / Approfondir » ; ne pas forcer les métriques du correcteur sur l’écran d’apprentissage.
4. **Pratique active** — avant de révéler une réponse modèle, demander un choix ou un brouillon court ; réutiliser les quatre phases du simulateur plutôt que créer un nouveau moteur.
5. **Désencombrer les sources** — faire de `miftahSpec.ts` le vocabulaire de référence, puis aligner les textes visibles ; identifier le guide général et le legacy Boussole comme références secondaires. `methodologyJourney.ts` contient un parcours débutant de six réflexes mais n’est consommé par aucune vue non-test : l’intégrer seulement si ce parcours est retenu, sinon le traiter comme donnée morte.
6. **Mise à jour annuelle** — conserver BAC 2025 comme exemple daté, pas comme preuve de couverture complète du programme courant. Le ministère a indiqué le 30 juillet 2026 que le mode du Bac ne changeait pas et que les matières évaluées correspondaient aux programmes de 3AS pour 2026–2027 [1]. La page consultée ne donne cependant pas le détail du programme SVT de la session : cette couverture est **Non vérifiable** ici.

## 6. Vérifications réalisées et limites

- Avant l’implémentation (« GO »), les tests ciblés `MeftahView.test.tsx`, `porteMethode.lock.test.tsx`, `gateIsolation.test.tsx`, `atelierFlux.test.tsx`, `hikalaBac.test.ts` donnaient **30/30**. Ils vérifiaient le rendu et des invariants internes, pas la compréhension ni le transfert d’un élève.
- Dans ce même état pré-implémentation, `npm run check:miftah` échouait sur **7 assertions** : six vérifications de marque obsolètes dans `App.tsx`/`DashboardView.tsx`, plus le résiduel manuel S1–Ex3 (**7,5 auto pour un total encodé de 8**). Le suivi actuel est décrit en section 7.
- Le protocole de test de 10 élèves de 3AS est documenté dans `docs/MARQUE.md` (§11), mais y est toujours indiqué comme **à exécuter**. Aucun résultat d’essai terrain n’a été trouvé dans le dépôt. La capacité réelle à apprendre, retenir ou gagner des points au Bac est donc **Non vérifiable** sans pilote.
- Le guide d’apprentissage de Dunlosky et al. classe les tests de pratique et la pratique distribuée parmi les stratégies à forte utilité, mais une méta-analyse ultérieure rappelle que la majorité des résultats portaient sur des acquis factuels/de surface et qu’il faut rester prudent pour le transfert profond [2][3]. Cela justifie un essai terrain sur de nouvelles consignes SVT, pas une extrapolation automatique.

## 7. Suite post-implémentation — GO

### Changements réalisés

- L’accueil de `MeftahView` donne la priorité à la base ; les niveaux avancés et le BAC restent accessibles dans une bibliothèque repliée.
- Dans les exercices BAC, l’élève doit déclarer une tentative courte avant d’ouvrir le modèle. Les montants partiels sont qualifiés de **répartition de référence**, avec un avertissement explicite sur la source.
- L’accueil et la méthode de base renvoient au simulateur existant via `onOpenSimulator`.
- Le hub met le مفتاح et le simulateur en avant ; les références, outils de suivi, carte imprimable et métriques sont placés dans des volets secondaires/repliés.
- Les versions sont désormais suivies séparément : carte React `MIFTAH_VERSION = 6.1`, HTML autonome `v6.0`, données de méthode `MIFTAH_MANHAJIA_VERSION = 4.4`. Le HTML reste volontairement indépendant.
- Les assertions de marque obsolètes du garde-fou ont été réalignées. Le contrôle BAC distingue maintenant l’écart encodé S2–Ex1 et l’item manuel résiduel de S1–Ex3, sans les présenter comme des faits ministériels vérifiés.
- Les champs de provenance des données utilisent `corrige-consulte-2025` et les poids de partie sont nommés « référence » ; le statut du document comme corrigé ministériel original reste **Non vérifiable**.

### Vérifications après modification

| Vérification | Résultat |
|---|---|
| `npx vitest run` | **273 fichiers passés ; 3 357 tests passés ; 8 ignorés** |
| `npm test` | **138/138** |
| `npm run lint` | réussi (`tsc --noEmit`) |
| `npm run check:miftah` | réussi, avec le résiduel manuel et l’écart de corpus explicitement signalés |
| `npm run build` | réussi ; avertissements non bloquants de dépendances/chunks volumineux |
| `git diff --check` | réussi |

Les avertissements Vitest de l’environnement simulé (AudioContext indisponible, boutons imbriqués dans une ancienne vue de flashcards et clés dupliquées dans des corpus) n’ont pas fait échouer les tests et ne portent pas sur les vues modifiées ici.

### Limites inchangées

- Le statut ministériel original de la correction consultée et la ventilation partielle par question restent **Non vérifiables** faute de document original exploitable ; l’application ne doit pas les appeler « barème officiel ».
- Le détail du programme SVT 3AS 2026–2027 reste **Non vérifiable** avec les sources établies.
- Le pilote prévu avec des élèves n’a pas été exécuté : l’efficacité en classe, la mémorisation et le transfert au Bac restent **Non vérifiables**.

## 8. Sources

### Sources du dépôt

- `src/components/MethodologyCompilerView.tsx` — navigation du hub, ouverture par défaut, carte de référence.
- `src/components/MeftahView.tsx` — accueil, niveaux, accordéons et affichage des réponses BAC.
- `src/data/meftahManhajia.ts` — contenu des niveaux et des exercices BAC 2025.
- `src/data/miftahSpec.ts`, `src/components/MiftahCard.tsx`, `public/miftah.html` — spécification et supports imprimables.
- `src/components/OkachaView.tsx`, `src/data/guideManhajia.ts` — guide général séparé.
- `docs/MARQUE.md` — décisions de marque et de progression, notamment §§11, 12, 13bis et 14.

### Sources externes

1. [Ministère de l’Éducation nationale algérien — dispositions pédagogiques 2026–2027, 30 juillet 2026](https://www.education.gov.dz/2026/07/30/%D9%88%D8%B2%D9%8A%D8%B1-%D8%A7%D9%84%D8%AA%D8%B1%D8%A8%D9%8A%D8%A9-%D8%A7%D9%84%D9%88%D8%B7%D9%86%D9%8A%D8%A9-%D9%8A%D9%86%D8%B4%D9%91%D8%B7-%D9%86%D8%AF%D9%88%D8%A9-%D8%B5%D8%AD%D9%81%D9%8A%D8%A9/) — le ministère indique que le mode du Bac reste inchangé et que les matières évaluées sont celles programmées en 3AS ; l’article consulté ne détaille pas le programme SVT.
2. Dunlosky et al. (2013), [Improving Students’ Learning With Effective Learning Techniques](https://pubmed.ncbi.nlm.nih.gov/26173288/) — revue des techniques d’apprentissage ; pratique de rappel et pratique distribuée évaluées comme stratégies à forte utilité.
3. Donoghue & Hattie (2021), [A Meta-Analysis of Ten Learning Techniques](https://www.frontiersin.org/journals/education/articles/10.3389/feduc.2021.581216/full) — 242 études ; les auteurs signalent notamment que la majorité des résultats portent sur des acquis de surface/factuels, ce qui limite l’extrapolation au transfert méthodologique profond.
