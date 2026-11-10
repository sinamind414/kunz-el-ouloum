# AUDIT EXTERNE 8 AXES — rapport de réception et de contrôle (2026-11-10)

> **Objet** : trois archives d'audit reçues dans `Downloads/` :
> `pedagogical-svt-app-audit (2).zip`, `pedagogical-svt-app-audit (3).zip`
> (dossier `NEW`) et `pedagogical-svt-app-claude 5.2.zip` (reçue le 10/11 à
> 13:42). Chacune contient une appli web d'audit de l'application.
>
> **Verdict (mis à jour le 10/11 après réception de l'archive 5.2)** :
> **l'archive « claude 5.2 » est la référence** — elle audite notre code au
> commit `70b69ec` (4 nov. 2026, dans notre historique) au lieu de s'appuyer
> sur le README, et elle **rectifie explicitement** les audits précédents.
> L'archive (2) reste utile (matrice de 133 critères). L'archive (3) est à
> écarter.
>
> **Matrice des 133 critères** (archive (2)) : [AUDIT_EXTERNE_8_AXES_2026-11-10_MATRICE.md](AUDIT_EXTERNE_8_AXES_2026-11-10_MATRICE.md)
>
> **À lire avec** : [AUDIT_8_AXES_2026-10-20_RAPPORT_FINAL.md](AUDIT_8_AXES_2026-10-20_RAPPORT_FINAL.md)
> (audit interne du 20/10) et `docs/AUDIT_EXTERNE_8_AXES_2026-10-14.md`.

---

## 0. L'archive « claude 5.2 » — la référence (reçue le 10/11 à 13:42)

**Ce qu'elle change** : elle audite le **code source** au commit `70b69ec`
(4 nov. 2026 — vérifié : ce commit est dans notre historique), et non le
README. Conséquences :

- **Score 74,6 / 100** (recalculé : 8 · 7 · 7,5 · 7,5 · 7,5 · 7 · 7,5 · 7,5,
  poids 100) avec une **confiance notée 4 / 5** (`CONFIANCE`) — la note est
  assortie de son degré de certitude.
- **Un `RECTIFICATIF` explicite** qui annule les erreurs des audits
  précédents : « la version précédente s'appuyait uniquement sur le README »,
  « elle déclarait absents le parcours guidé, le plan de révision, l'objectif
  quotidien, la série et les badges », « elle annonçait un seul sujet de Bac
  intégral : le dépôt en contient 28 en PDF », « elle raisonnait sur un
  programme (génétique, écologie, mitose et méiose) qui n'est pas celui de la
  3AS », « elle contenait des chiffres sans source ». **Ces cinq points sont
  exactement ceux que j'avais moi-même vérifiés** le 10/11 (§ 3.2 de ce
  rapport) : les deux travaux convergent.
- **Des `LIMITES` explicites** : lecture statique (ni compilé, ni lancé, ni
  testé sur téléphone), tests non exécutés (323 fichiers recensés),
  échantillons réduits (8 QCM relus sur 550), aucun utilisateur interrogé,
  aucune fiche Play Store.
- **Un rectificatif de fond** : « Le glossaire et le plan de 12 semaines bâtis
  dessus sont retirés » → **la recommandation du glossaire FR↔AR, que je
  présentais comme le seul reste à faire coûteux, est ANNULÉE** : elle
  reposait sur une grille de programme erronée.

### 0.1 Contrôle de ses chiffres contre le dépôt (2026-11-10)

| Affirmation de l'audit 5.2 | Mesure |
|---|---|
| 11 unités, 3 domaines, 108 h | ✔ `curriculumOfficial.ts` |
| 15 citations exactes / 42, 13 sous 85 % « à réviser » | ✔ en-tête du fichier, mot pour mot |
| 3 hors-exigibles + 2 chapitres « culture générale » | ✔ `NON_EXIGIBLES`, `CULTURE_GENERALE` |
| errata du manuel intégrés | ✔ `manuelErrata.ts` |
| poids d'examen renseigné pour 7 unités sur 11 | ✔ `unitOpenings.ts` : U1-U7 (10, 9, 13, 13, 16, 20, 19), U8-U11 absents |
| 4 cartes de survie non validées (1 sur 5) | ✔ `survivalCards.ts` : « sc_enzymes reviewed:true, les autres reviewed:false » |
| aucun QCM ne porte de niveau de difficulté | ✔ 7 occurrences de `difficulte:` dans tout le corpus |
| aucun QCM ne porte d'étiquette de notion | ✔ 0 occurrence de `notion:` |
| 28 sujets officiels en PDF, 65 exercices indexés | ✔ `public/bac-sujets` (28 PDF), `BAC_IDEAS` (65) |
| recherche, favoris, mode sombre, taille de texte | ✔ présents dans le code |
| série, points, badges | ✔ `BadgesView`, `StreakCelebrationModal` |
| domaine 1 gratuit, essai 30 j, 1 200 DA | ✔ `facturation.ts` |
| 323 fichiers de test | ⚠️ **dépassé** : 359 aujourd'hui (le dépôt a grandi) |

### 0.2 Le point le plus intéressant : l'écart sur les poids d'examen

L'audit 5.2 constate que le poids **annoncé** à l'élève (10, 9, 13, 13, 16,
20, 19 %) ne correspond pas à la part **constatée** (18,6 · 5,1 · 14,7 · 20 ·
18,6 · 11,7 · 6,7 · 1,1 ×4), et le signale comme « à confirmer avec la
fonction du dépôt ».

**Vérifié : ce n'est pas un défaut.** La colonne « constatée » de l'audit est
**exactement** la sortie de la fonction du dépôt
`observedUnitSharePercent()` (`src/data/bacSessionIndex.ts:1725`) — 11 valeurs
identiques au dixième, avec la même règle d'attribution (les points d'un
exercice vont à son unité **principale**, la première de `unitIds`). Et le
dépôt documente depuis longtemps que les deux mesures ne disent pas la même
chose :

> « À lire à côté de `unitOpenings.bacWeightPercent`, qui donne le poids
> ANNONCÉ par la répartition du programme. Les deux ne disent pas la même
> chose, et c'est l'information la plus utile de toute la banque. »
> — `bacSessionIndex.ts:1716-1723`

**Ce qui reste vrai et actionnable** : l'élève ne voit que le poids *annoncé*
(`UnitIntroPortal.tsx:149`), jamais la part *constatée* — alors que le dépôt
la qualifie de « l'information la plus utile de toute la banque ». Concrètement :
U7 est annoncée à 19 % alors qu'elle ne pèse que 6,7 % des exercices indexés ;
U1 annoncée à 10 % pour 18,6 % réels ; et U8-U11 (25 h officielles) n'ont
**aucun** poids affiché. **Piste** : afficher les deux nombres côte à côte
plutôt que corriger l'un par l'autre (les deux sont vrais, à des niveaux
différents).

### 0.3 Ce que l'audit 5.2 laisse ouvert (10 recommandations « haute »)

1. Visa d'un enseignant de SVT sur 13 citations « à réviser » + 4 cartes de
   survie.
2. Renseigner le poids des 4 unités manquantes (U8-U11) et afficher le poids
   annoncé **à côté** de la part constatée.
3. Étiqueter les 550 QCM par 3 niveaux (tombé / fréquent / approfondissement).
4. Étiqueter les 550 QCM par **notion** (pour alimenter le profil d'erreurs
   sans dépendre de la déclaration de l'élève).
5. Test de positionnement court (22 QCM) préremplissant le plan.
6. Correction notée par attendus pour 2024, 2023, 2022 (18 exercices).
7. Corrigés résumés hors ligne pour les 65 exercices indexés.
8. Mesures sur téléphone d'entrée de gamme (3G, poids installé, mémoire).
9. Publication de l'APK signé sur Google Play.
10. **Télécharger les PDF à la demande au lieu de les embarquer (94 Mo
    évités)** — à trancher avec notre choix « offline complet » (l'APK pèse
    88,1 Mo) ; l'audit privilégie la taille, nous privilégions l'autonomie.

### 0.4 Ce que le dépôt a fait depuis (10/11/2026) — rang 1

| Item de l'audit 5.2 | État au 2026-11-10 |
|---|---|
| 2 — poids annoncé À CÔTÉ de la part constatée | ✅ fait : `UnitIntroPortal` affiche les deux (le premier pour U1-U7, le second pour les 11 unités) |
| 5 — étiqueter les QCM par notion | ✅ fait : les **550** QCM portent leur notion (titre arabe de la figure interrogée), table **générée** (`src/data/notionsQcm.ts`) + verrou anti-dérive ; la notion ratée est enregistrée **automatiquement** (sans attendre la déclaration) et affichée dans le portail d'unité |
| 3 et 6 — niveaux de difficulté | ⚠️ **déjà fait, le reproche est caduc** : la difficulté est stampée sur **100 %** des QCM (`src/quizCorpus/index.ts`), le palier est affiché dans le quiz (`QuizView.tsx:411`) et le quiz adaptatif trie par palier. Réserve honnête : le palier vient du **segment** (donc du domaine), pas de l'item — c'est le seul reste de ce reproche |

---

## 1. Ce que sont les deux archives

Deux applis web **autonomes** (React 19 + Vite 7 + Tailwind 4, build
mono-fichier `vite-plugin-singlefile`) qui présentent un audit de l'application
en 8 axes avec score pondéré et recommandations chiffrées. Elles ne font pas
partie du dépôt et ne doivent pas y entrer (voir § 6).

| | **(2) audit (2)** | **(3) audit (3)** |
|---|---|---|
| Version du contenu | **audit v2** (corrigé) | **audit v1** (antérieur) |
| Notes par axe | 9 · 7 · 8 · 8 · 6,5 · 7 · 7 · 8,5 | 8,5 · 6,5 · 6 · 7,5 · 5,5 · 7 · 6,5 · 8,5 |
| Score global (recalculé) | **77,0 / 100** | **69,8 / 100** (= son `GLOBAL_SCORE`) |
| Matrice de couverture | **133 critères** (V 59 · P 34 · A 10 · N 30) | absente |
| Données de programme | 11 unités, 108 h, 3 domaines, démarche en 5 étapes, non-exigibles | absentes |
| Visuels | radar, hélice, courbe d'oubli, machine à phases, cadran, jauges | radar simple |
| Console de notation | 5 presets de pondération, recalcul en direct, test de robustesse | absente |
| Smoke test | `qa/smoke.mjs` (jsdom) | absent |
| Volume | 17 fichiers, 233 Ko | 10 fichiers, 174 Ko |

**Les notes de (3) sont exactement les `noteV1` de (2)** : (3) n'est pas une
version allégée de l'audit v2, c'est **l'audit d'avant les corrections**.

**Conséquence à retenir** : (3) **réintroduit une erreur factuelle que (2) avait
explicitement corrigée** — « Génétique ≈ 30 % du Bac » (le programme algérien
3AS n'a pas d'unité « Génétique » ; ce poids vient du programme français). La
version (2) dit noir sur blanc : « l'audit v1 la contenait, elle est corrigée
ici ». **Utiliser (3) ferait revenir une erreur documentée.**

## 2. La méthode de l'auditeur (ce qui rend (2) crédible)

- **Chaque critère a un statut et une preuve** : `V` vérifié dans le code,
  `P` partiel, `A` absent, `N` non vérifiable — 133 lignes, réparties
  13/16/22/16/14/17/17/18 par axe.
- **Il lit le code, pas le README** : il cite des symboles précis
  (`estNonExigible`, `CULTURE_GENERALE`, `DEMARCHE_5`, `phaseEleve` 5 phases +
  creux, `nbaEngine`, `answerStructureCheck`, `examenEnCours`, 65+ idées BAC
  cotées, `prescriptions` « arrêt après 3 échecs »).
- **Il publie son incertitude** : 30 critères « non vérifiable », dont
  « aucune interface n'a été exécutée ».
- **Il se corrige et montre le chemin** : `noteV1` → `noteV2` + `delta` par
  axe (A3 passe de 6,0 à 8,0 après la découverte du moteur de guidage).
- **La pondération ne porte pas la conclusion** : la console permet de
  re-peser les axes (5 presets, dont « 8 axes à poids égal ») et de vérifier
  que le classement tient.

## 3. Contrôle de l'audit contre le dépôt — 2026-11-10

*Mesures faites dans le dépôt ce jour-là (fichiers cités en preuve), pas de
relecture du rapport.*

### 3.1 Confirmé mot pour mot

| Affirmation de l'audit | Mesure |
|---|---|
| 11 unités du programme officiel | ✔ `curriculumOfficial.ts` : `uniteId` 1→11 |
| **108 heures** encodées | ✔ somme des `heures:` = **108 exactement** |
| fenêtres trimestrielles + trimestre par unité | ✔ 12 occurrences de `fenetre`, 19 de `trimestre` |
| `estNonExigible()` / `CULTURE_GENERALE` / `DEMARCHE_5` | ✔ présents |
| 31 remédiations · 121 textes à trous · 69 drills · 10 tags d'erreur · 16 rappels SM-2 · 41 QCM livre | ✔ `volumeCorpus.lock.test.ts` |
| 1 200 DA / saison | ✔ `PRIX_SAISON_DA = 1200` |
| moteur de guidage (5 phases, creux, sprint, prescriptions, profil d'erreurs) | ✔ `phaseEleve`, `nbaEngine`, `prescriptions`, `profilErreurs`, `rappelAdaptatif` |
| micro-leçons, glossaire, quiz adaptatif (patch arena du 09/11) | ✔ `microLecons.ts`, `GlossaireCapitaine`, `QuizAdaptatif` |

### 3.2 Dépassé ou faux — à ne pas planifier dessus

| Formulation de l'audit | Réalité du dépôt | Contrôle |
|---|---|---|
| A5 « un seul sujet intégral, l'app ne reproduit pas les PDF » | **28 PDF officiels embarqués** (`public/bac-sujets`, 93,6 Mo) | l'audit s'en tient au README |
| A7 « 0 badge / 0 streak, gamification absente » | `BadgesView` + `StreakCelebrationModal` + XP **existent** | preuve : « README (absence) » — le README, pas le code |
| A6 « recherche / mode sombre / taille de texte non vérifiables » | `SearchView` (450 extraits offline), variante `dark`, 3 crans de taille **existent** | |
| A4 « aucun niveau de difficulté trouvé » | `LIBELLES_DIFFICULTE` (3 paliers) + quiz adaptatif **existent** | |
| A2 « pas de micro-leçons 5-10 min », « pas de synthèse en 3 phrases » | 578 chunks → **192 micro-leçons ≤ 10 min**, chacune avec `SyntheseTroisPhrases` | |
| A3 « aucun parcours daté » | `phaseEleve` (5 phases + creux + sprint ≤ 30 j) depuis le 06/11 | |
| A2 « aucune carte mentale dans le code » | cartes mentales présentes (vue interactive + `cartesHosila`) | l'audit les a manquées |
| A8 « 3 465 tests vitest + 3 408 jest » | **4 052 + 3 988** au 2026-11-10 | chiffres à rafraîchir |
| A5 « droits ONEC respectés » | l'app **embarque** 28 PDF officiels → arbitrage droit d'auteur à expliciter | ⚠️ à trancher |

### 3.3 Une seule réserve sur l'audit v2

Son delta d'axe 3 cite un module `revueJ14` (« programme le rappel ») : **ce
module n'existe pas** dans le dépôt sous ce nom. Le reste des symboles cités
est vérifié.

## 4. Le reste à faire : les 10 critères « absents »

Sept sur dix sont des **choix produit assumés**, pas des oublis : avertissement
« autres filières », sélecteur SVT/EXP, test de positionnement (refus
documenté dans `phaseEleve.ts`), basculement français, résumés IA
(offline-first), classements, forum.

**Le seul gap réellement coûteux pour l'élève — et cité deux fois (axes 1 et 2)
— est le glossaire scientifique FR↔AR.** Attention : le `GlossaireCapitaine`
livré par le patch arena est le glossaire *du Capitaine*, **pas** un glossaire
FR↔AR : le gap reste entier.

> **⚠️ RECTIFICATIF (archive « claude 5.2 », reçue le 10/11) : cette
> recommandation est ANNULÉE.** L'audit 5.2, qui a lu le code et non le
> README, montre que le glossaire FR↔AR et le « plan de 12 semaines » des
> audits précédents étaient bâtis sur **une grille de programme erronée**
> (génétique, écologie, mitose/méiose — qui ne sont pas des unités de la
> 3AS algérienne). Les 11 unités réelles sont le التخصص الوظيفي للبروتينات /
> التحولات الطاقوية / التكتونية العامة. Un glossaire construit sur la bonne
> grille reste possible — mais l'audit 5.2 ne le réclame plus, et la
> priorité n'est plus la même.

Les 34 critères « P » (partiels) sont le second gisement : hiérarchie de
priorité visible, poids d'examen par unité, objectif d'entrée, scaffolding
intra-leçon, révisions croisées, etc. Le détail est dans la
[matrice](AUDIT_EXTERNE_8_AXES_2026-11-10_MATRICE.md).

## 5. Action recommandée

1. **Priorité unique (rectifiée le 10/11)** : l'audit 5.2 remplace le
   glossaire par trois chantiers mesurables — (a) **afficher le poids annoncé
   À CÔTÉ de la part constatée** dans la fiche d'unité (les deux sont vrais,
   voir § 0.2 ; l'élève n'a aujourd'hui que le premier), (b) **étiqueter les
   550 QCM par notion** (0 étiquette aujourd'hui : c'est ce qui permettrait au
   profil d'erreurs de se remplir sans dépendre de la déclaration de
   l'élève), (c) **préremplir le plan par un test de positionnement court**
   (22 QCM) — le moteur de guidage existe déjà, il manque l'entrée.
2. **Visa humain** : 13 citations « à réviser » + 4 cartes de survie (1 sur 5
   validée) — c'est la seule action qui demande un enseignant, pas du code.
3. **Arbitrer le droit d'auteur** : garder les 28 PDF officiels dans l'APK
   (choix offline assumé, 88 Mo) ou les télécharger à la demande (≈ 5 Mo,
   l'audit 5.2 privilégie la taille, nous l'autonomie).
4. **Rafraîchir les audits** avant tout usage décisionnel : les 6 lignes du
   § 3.2, les chiffres de tests, et l'échelle « 323 fichiers de test » de
   l'audit 5.2 (359 aujourd'hui).

## 6. Where the report lives / comment le reconstruire

L'appli d'audit **ne doit pas entrer dans le dépôt** : ESLint linte tout le
dépôt hors `ignores` (`eslint.config.mjs`), et la CI exige 0 erreur **et**
0 warning → un second projet Vite/React sous `docs/` ferait tomber le job
`lint`. Elle reste donc **hors dépôt** (les ZIP d'origine + le HTML construit
en mono-fichier suffisent).

Pour reconstruire l'HTML autonome depuis l'archive (2) :

```bash
# dans un dossier hors dépôt
npm ci
npm run build            # → dist/index.html (mono-fichier)
node qa/smoke.mjs        # smoke test jsdom du HTML produit
```

Prérequis : Node ≥ 20 et un accès réseau (polices Google + dépendances npm) —
l'appli n'est **pas** offline (contrairement à l'application auditée).

## 7. Limites de ce contrôle

- J'ai vérifié **les chiffres, les symboles et l'existence des fonctionnalités**
  cités par l'audit — pas une relecture intégrale des 133 critères ligne à ligne
  (62 contrôles posés sur 133, voir la colonne « Contrôle dépôt »).
- Les 30 critères « non vérifiables » de l'auditeur le restent (aucune
  interface exécutée par lui ; de mon côté, l'app a été exécutée dans
  Chromium — Bureau et mobile 390×844 — mais **sans appareil Android réel** :
  aucun device `adb` n'était connecté).
- La note finale de l'audit (77/100) est **son jugement d'expert**, pas le
  mien : je n'ai pas re-noté les axes, j'ai vérifié ses preuves.
