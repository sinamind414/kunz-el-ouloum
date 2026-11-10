# AUDIT EXTERNE 8 AXES — rapport de réception et de contrôle (2026-11-10)

> **Objet** : deux archives `pedagogical-svt-app-audit (2).zip` et
> `pedagogical-svt-app-audit (3).zip` reçues dans `Downloads/NEW`, contenant une
> appli web d'audit de l'application Kunz El Ouloum.
>
> **Verdict** : **l'archive (2) est l'audit pertinent** ; l'archive (3) en est une
> version **antérieure et appauvrie** — à écarter.
>
> **Matrice des 133 critères** : [AUDIT_EXTERNE_8_AXES_2026-11-10_MATRICE.md](AUDIT_EXTERNE_8_AXES_2026-11-10_MATRICE.md)
>
> **À lire avec** : [AUDIT_8_AXES_2026-10-20_RAPPORT_FINAL.md](AUDIT_8_AXES_2026-10-20_RAPPORT_FINAL.md)
> (audit interne du 20/10) et `docs/AUDIT_EXTERNE_8_AXES_2026-10-14.md`.

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

Les 34 critères « P » (partiels) sont le second gisement : hiérarchie de
priorité visible, poids d'examen par unité, objectif d'entrée, scaffolding
intra-leçon, révisions croisées, etc. Le détail est dans la
[matrice](AUDIT_EXTERNE_8_AXES_2026-11-10_MATRICE.md).

## 5. Action recommandée

1. **Priorité unique** : glossaire scientifique FR↔AR (~180 termes, équivalence
   vérifiée en QCM inversé) — c'est le seul « absent » qui coûte des points à
   l'élève, et il est nommé deux fois par l'auditeur.
2. **Rafraîchir l'audit** avant tout usage décisionnel : les 6 lignes du § 3.2
   et les chiffres de tests. Un audit qui planifie des manques déjà comblés
   fait perdre du temps.
3. **Arbitrer le droit d'auteur** : garder les 28 PDF officiels dans l'APK
   (choix offline assumé, 88 Mo) ou n'indexer que les idées (≈ 5 Mo). Ce
   choix n'est pas écrit dans le code.

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
