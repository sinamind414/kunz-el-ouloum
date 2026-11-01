# Vision de protection — Kunz El Ouloum

**Date :** 14/10/2026 · **Déclencheur :** vidéo « How to Reverse Engineer Anything in Claude Code »
(REA, serveur MCP, ~100 000 étoiles GitHub) — un agent IA démonte une application compilée et la clone :
**1 h 12 et 40 $** pour reproduire l'écran d'accueil d'une app iPhone, contre 40 min et 12 $ sans l'outil.

**Règle de ce document :** aucun chiffre n'est estimé s'il peut être mesuré. Tout ce qui suit a été
vérifié sur cette machine, le 14/10/2026, sur le build de production.

---

## 1. La mauvaise nouvelle d'abord

**REA ne change rien pour vous, et c'est pire que ça.** Cet outil sert à démonter du logiciel
**compilé**. Votre application est un **site web** : le code part chez l'élève en texte clair, il suffit
d'ouvrir les outils du navigateur. Vous n'avez même pas besoin de REA pour en lire le contenu.

**Ce qui est exposé, mesuré à l'instant :**

| Constat mesuré | Valeur | Ce que ça veut dire |
|---|---|---|
| JavaScript livré au navigateur | **7,7 Mo** | Tout le code, toutes les données, tous les textes |
| Site complet servi | **15 Mo** | Contenu, images, données |
| **Clés de correction des QCM** (`correctAnswerIndex`) | **552 occurrences dans un seul chunk** | `grep -o 'correctAnswerIndex:[0-9]*'` et les corrigés sont extraits en une seconde |
| Leçons en arabe, en clair | **21 365 chaînes** dans le chunk des leçons | Le contenu pédagogique est lisible tel quel |
| Base de connaissances du tuteur | **15 913 chaînes** | Idem |
| Moteur de correction (`dictionaries/`, `estDeLaProse`, calibration BAC) | Présent dans le bundle, **identifiants minifiés** | Invisible au `grep`, mais la **logique** est là — un agent IA la relit en quelques minutes |
| Source map du **serveur** servie publiquement | **`/server.cjs.map` → 200, 202 Ko de TypeScript d'origine** | Avant aujourd'hui : tout le code serveur téléchargeable, sans outil |
| Secrets dans le bundle client | **Aucun** | ✅ vérifié (`ADMIN_PASSWORD`, `JWT_SECRET`, `process.env.*` : 0 occurrence) |
| `.env` versionné | **Non** (`.env.example` seulement) | ✅ |
| Données élèves versionnées | **Non** | ✅ |

**Corrigé aujourd'hui (§5) :** le serveur publiait `server.cjs`, `server.cjs.map`, `package.json`.
C'est la fuite la plus grave trouvée à ce jour, et la seule qui soit **réparable sans compromis**.

---

## 2. Ce que la vidéo change réellement

Le vrai message de la vidéo n'est pas « on peut cloner votre application ». C'est : **le coût de
reproduction de l'interface et des fonctionnalités vient de s'effondrer.** Ce qui prenait trois mois à
un développeur prend maintenant une heure à un agent.

Conséquence directe : **toute protection qui repose sur « c'est difficile à copier » est morte.**
Ce qui reste protégeable est exactement ce qui ne peut pas être copié depuis un téléphone :

| Ce qui est copiable en 1 h | Ce qui ne l'est pas |
|---|---|
| L'interface, la navigation, les couleurs | La relation avec les professeurs |
| Le contenu pédagogique (déjà en clair chez l'élève) | La distribution en classe et la confiance des parents |
| Le moteur de correction (logique relisible) | Les mises à jour continues pendant l'année scolaire |
| Les banques de QCM | Le support en arabe/darija, la réponse aux bugs sous 48 h |
| Le nom, l'icône (si vous ne les protégez pas) | La réputation et les résultats documentés |

---

## 3. Le modèle de menace — trois profils, trois réponses

| Profil | Ce qu'il veut | Coût pour lui | Ce qui marche contre lui |
|---|---|---|---|
| **Élève qui triche** | Les corrigés des QCM et des exercices | 30 secondes (`grep`) | **Clés côté serveur** pour tout ce qui est noté ; sinon : rien ne l'arrête |
| **Concurrent / cloneur** | Votre contenu et votre interface | 1 h d'agent IA + 40 $ | **Marquage + juridique + marque** : on ne l'empêche pas, on le rend surface *et* illégal |
| **Curieux technique** | Le code serveur, les secrets | 1 commande `curl` | **Aujourd'hui corrigé** ; en général : ne jamais servir ses sources, ne jamais mettre de secret dans le client |

**Ce que personne ne peut faire :** empêcher quelqu'un de copier un site web qu'il a reçu sur son
téléphone. Toute promesse inverse est un mensonge commercial.

---

## 4. La contradiction structurelle à trancher

Votre application est **hors ligne d'abord** (c'est sa force en Algérie). Or, **hors ligne veut dire :
tout est déjà chez l'élève**. On ne peut pas avoir les deux — l'élève possède le contenu, donc il peut
le copier.

Il faut donc **décider par type de contenu**, et c'est un choix pédagogique autant que technique :

| Contenu | Où il doit vivre | Raison |
|---|---|---|
| Leçons, résumés, cartes mentales | **Chez l'élève** (hors ligne) | Il révise dans le bus sans réseau. C'est la promesse du produit. |
| Annales du BAC (sujets) | **Chez l'élève** | Ce sont des **documents publics** : les « protéger » n'a aucun sens juridique. |
| QCM d'entraînement | Chez l'élève, **avec clés mélangées** | Une clé volée doit être inutilisable : mélange des propositions par session (§5) |
| **Exercices notés / productions écrites** | **Chez le serveur** | Le vrai actif : ce que le professeur évalue et ce qui produit une note |
| Moteur de correction (calibration BAC) | **Chez le serveur, idéalement** | C'est votre savoir-faire réel ; il n'a aucune raison d'être dans un téléphone |

**Recommandation nette :** ne touchez pas au hors ligne pour les leçons. Mais à partir du moment où un
exercice est **noté**, la clé et le barème ne doivent jamais arriver avant la réponse de l'élève.
C'est la seule mesure technique qui protège un actif réel — et elle est gratuite en poids.

---

## 5. Ce que j'ai corrigé aujourd'hui (fait, vérifié, verrouillé)

| Défaut | Avant | Après |
|---|---|---|
| `GET /server.cjs` | **200**, 93 Ko (bundle serveur) | **404** |
| `GET /server.cjs.map` | **200**, 202 Ko — TypeScript d'origine : `server.ts`, `server/store.ts`, limiteurs, génération des codes, commentaires de sécurité | **404** |
| `GET /package.json` | **200** | **404** |
| Remontée de dossier (`/assets/../server.cjs`) | servie | **404** + journal |
| Fichiers cachés (`.env*`, `.git*`) | servis si présents dans `dist/` | **refusés** (`dotfiles: "deny"`) |
| Service statique d'un dossier sans `index.html` | liste possible | `index: false` |

**Vérifié par requêtes réelles** sur `dist/server.cjs` en `NODE_ENV=production` :
`/server.cjs` **404** · `/server.cjs.map` **404** · `/package.json` **404** · `/index.html` **200** ·
`/assets/<chunk>` **200** · `/manifest.json` **200** · `/sw.js` **200** · `/api/health` **200** ·
`/privacy` **200**. Verrouillé par `src/__tests__/publicationStatique.test.ts` (**7 tests**).

---

## 6. Plan de protection, par rapport valeur/coût

### Niveau A — protège la VALEUR (à faire, quoi qu'il arrive)

| # | Mesure | Effort | Ce qu'elle protège réellement |
|---|---|---|---|
| A1 | **Mélanger les propositions des QCM par session** (l'ordre affiché change, la clé reste la même) | ~1 h | Une clé extraite (« réponse = B ») devient inutilisable. Coût : 0 Ko. |
| A2 | **Clés et barèmes des exercices NOTÉS côté serveur** | 1 jour | Le seul actif qu'un clone ne peut pas récupérer depuis un téléphone. |
| A3 | **Marquage du contenu exporté** (code de l'élève inséré dans les PDF/CSV partagés) | 2 h | Un document qui fuit désigne sa source. Décourage le partage en masse. |
| A4 | **Moteur de correction côté serveur** pour les copies notées (garder la version client hors ligne pour l'entraînement) | 2-3 jours | Votre vrai savoir-faire cesse d'être dans le navigateur de tout le monde. |

### Niveau B — élève le coût (effet limité, à faire seulement si c'est gratuit)

| # | Mesure | Effort | Verdict honnête |
|---|---|---|---|
| B1 | **Aucune source map servie** (fait) | ✅ | Trou réel, corrigé. À maintenir. |
| B2 | **Bannière de licence + propriété** dans « À propos » et la politique | 1 h | Utile juridiquement, inutile techniquement. |
| B3 | **Vérification d'intégrité des chunks** au chargement | 4 h | Frustre un curieux ; un cloneur s'en fiche (il recopie, il ne modifie pas votre version). |
| B4 | **Minification + noms courts** (déjà en place) | ✅ | Suffisant. **Ne pas obfusquer davantage.** |
| B5 | **Obfuscation avancée** | 1 jour | ❌ **Déconseillé** : +20 à 40 % de poids sur des téléphones d'entrée de gamme, casse le débogage, retarde les mises à jour — et un agent IA la défait. C'est exactement le compromis que la vidéo montre mort. |

### Niveau C — protège JURIDIQUEMENT (le seul qui empêche vraiment)

| # | Mesure | Où | Ce qu'elle permet |
|---|---|---|---|
| C1 | **Dépôt du code et du contenu à l'ONDA** (Office National des Droits d'Auteur, Algérie) | Alger / en ligne | Une date certaine opposable en cas de litige |
| C2 | **Dépôt de la marque « كنز العلوم / Kunz El Ouloum »** (INAPI) | INAPI | Empêche un cloneur de publier sous votre nom sur les stores |
| C3 | **Licence d'utilisation dans l'application** (interdiction de reproduction, extraction, revente) | 1 h de rédaction | Base d'un signalement Play/DMCA |
| C4 | **Veille stores** (mot-clé, nom, icône) + procédure de signalement Play | 1 h/mois | Retrait du clone en quelques jours, s'il copie texte/icône |
| C5 | **Traçabilité pédagogique** : nom du professeur et de l'établissement dans l'app | continu | Le clone n'a pas vos professeurs |

**Le point dur, dit franchement :** la quasi-totalité de votre contenu pédagogique provient de documents
officiels (programme, sujets de BAC). Ces éléments-là **n'ont pas de protection possible** — ils
appartiennent à tous. Ce que vous protégez réellement, c'est **l'assemblage, le barème, la progression,
les corrigés rédigés, le suivi** — pas la matière première.

---

## 7. Ce qu'il ne faut PAS faire

| Tentation | Pourquoi c'est une erreur ici |
|---|---|
| **Verrouiller les appareils** (empreinte, un seul téléphone par élève) | Le téléphone est souvent partagé en Algérie. Vous bloquez des élèves légitimes et vous arrêtez ceux qui se passeront l'appareil. |
| **Obfusquer tout le code** | Coûteux en Ko sur des téléphones modestes, casse la maintenance, sans effet réel : la vidéo le démontre. |
| **Bloquer le copier-coller, désactiver les outils du navigateur** | Frustration pure côté élève (règle n°1 : utile d'abord), et 10 secondes à contourner. |
| **Mettre le corrigé hors ligne ET côté serveur** | Double maintenance, divergence garantie. Un seul endroit fait autorité : le serveur pour le noté, le client pour l'entraînement. |
| **Suivre le chemin de la vidéo (cloner un concurrent)** | Vous n'en avez pas besoin : votre avantage est pédagogique, pas cosmétique. Et c'est juridiquement risqué. |

---

## 8. Priorité finale, dans cet ordre

1. **Aujourd'hui (fait)** — ne plus publier les sources du serveur. ✅
2. **Cette semaine** — A1 (mélange des propositions) : 1 h, effet immédiat contre le seul risque qui vous touche vraiment, la triche par corrigés extraits.
3. **Cette semaine** — C3 + B2 (licence dans l'app) : 1 h, donne une base à toute réclamation.
4. **Ce mois** — C1 + C2 (ONDA, marque) : formalités, pas de développement. Sans elles, C4 ne sert à rien.
5. **Quand un exercice est noté** — A2 puis A4 : protéger ce que vous êtes le seul à pouvoir produire.
6. **Jamais** — obfuscation lourde, verrouillage d'appareil, blocage du copier-coller.

**Vérité finale, sans adoucissement :** votre application ne sera jamais « protégée » contre la copie.
Le hors ligne que vous avez choisi pour de bonnes raisons la rend copiable **par conception**. Ce qui se
défend, c'est la **marque**, la **relation avec les professeurs**, et ce qui se **calcule** (barème,
progression, suivi) — pas ce qui se **télécharge**.

---

## 9. Mesure A1 — IMPLÉMENTÉE le 14/10/2026

**Décision retenue :** on ne retire pas les clés du paquet livré — on ne peut pas, le quiz doit se
corriger hors ligne — **on rend une clé extraite inutilisable** : les propositions changent de place **à
chaque session**.

| Ce qui change | Avant | Après |
|---|---|---|
| Ordre des propositions du quiz principal (`QuizView`) | Ordre des données, identique pour tous et toujours | Réordonné **par session**, clé recalculée |
| Ordre des QCM du livre (`QcmLivreView`, `QcmBilanView`) | Idem | Idem (champ `correct`) |
| Quiz du المرشد (`smartTutorEngine`) | Mélangé… **mais avec une graine dérivée du seul identifiant** → **le même ordre à chaque session, pour toujours** | La graine de **session** entre dans le calcul |
| Aides « pourquoi mon choix est faux » | Justes (index de données = index affiché) | **Toujours justes** grâce à la table `optionOrigins` |

**Le piège de cette transformation, et comment il est évité.** Les aides par option
(`getHintForIncorrectOption`) sont indexées par la position dans les **données**, pas à l'écran. Sans
traduction, l'aide affichée expliquerait une **autre** proposition que celle cliquée — un bug silencieux,
plausible, et faux. Chaque question mélangée porte donc `optionOrigins` (position affichée → position
d'origine), et `QuizView` la consulte avant d'appeler l'aide.

**Ni la bonne réponse ni l'ordre des questions ne bougent.** Seules les positions des propositions
changent. Un élève qui navigue ne voit pas ses propositions se réordonner : la graine vit dans
`sessionStorage`, stable pendant toute la session, neuve à la suivante.

**Vérifications**

| Contrôle | Résultat |
|---|---|
| `src/utils/__tests__/melangeOptions.test.ts` | **23 tests** : bijection de la permutation, déterminisme par graine, la bonne réponse reste la bonne sur 200 graines, propositions conservées, questions à trou et index aberrants non touchés, **dispersion des positions sur 400 sessions** (les 4 positions apparaissent, aucune sous 12 %), **≤ 45 % de « même position » sur 100 sessions** (sans mélange : 100 %), 20 questions → ordres distincts, stabilité pendant la session, graine invalide remplacée, `sessionStorage` indisponible (navigation privée), **table position → origine vérifiée sur 100 graines × 4 positions**, et le tuteur change d'ordre quand la session change |
| `src/components/__tests__/QuizView.melange.test.tsx` | **6 tests** avec l'écran réel : clic **par texte** (bonne réponse → score 1/1 ; mauvaise → 0/1), **l'aide parle bien de l'option cliquée** (`النواة`), les 4 propositions toujours affichées, ordre différent entre deux sessions fixées, question à trou intacte |
| Suite complète | **222 fichiers / 2 659 passés / 8 ignorés / 0 échec** |
| `tsc --noEmit` · `npm run build` · `test:build` | 0 erreur · OK · **14/14** |
| Budget d'entrée (M7) | **162 Ko** (cible 170, plafond 176) — le module est dans son propre morceau de 1 Ko |
| Preuve sur le paquet livré | **551 clés `correctAnswerIndex` restent extractibles** par `grep` — assumé : ce qui a changé, c'est que la clé **ne dit plus où se trouve la réponse** à la session suivante |

**Ce que cette mesure ne protège pas, dit franchement :** un élève peut relever la position dans **sa**
session et la transmettre à un camarade qui ouvre l'application **le même jour dans la même session**
— impossible : chaque onglet a sa propre graine. Le partage qui marche encore : dicter le **texte** de
la bonne réponse. Aucun dispositif technique n'empêche cela, et c'est vrai de tous les QCM du monde.

---

## 10. Mesure A3 — IMPLÉMENTÉE le 14/10/2026

**Objectif :** un document qui sort de l'application (image partagée sur WhatsApp, PDF imprimé, papier)
cessait d'être anonyme. Aujourd'hui il porte une **marque courte** que le professeur peut retrouver dans
son export CSV.

**Principe de conception, non négociable : la marque ne contient AUCUN identifiant.** Ni nom, ni e-mail,
ni code de connexion. Un document qui fuit ne doit jamais livrer de quoi se connecter au compte d'un
élève. La marque est un hachage (`KZ-XXXXXX`), et la correspondance marque → élève n'existe **que** dans
l'export du professeur.

| Élément | Fichier | Rôle |
|---|---|---|
| Module pur de marque | `src/utils/marque.ts` **(neuf)** | `marqueDepuisIdentite`, `ligneMarque`, `apposerMarqueCanvas` |
| Pied de page imprimé | `src/components/MarqueDocument.tsx` **(neuf)** | `print:block hidden` — invisible à l'écran, présent sur le papier/PDF |
| Vues imprimables marquées | `MockExamPanel`, `RevisionPlanView`, `WritingReportSheet`, `MethodologyCompilerView`, `OkachaView` | Sujet d'examen, plan de révision, fiche d'évaluation, méthodologie, العكاشة |
| Images partagées marquées | `StatsView` (fiche de résultats PNG), `WeeklyReportShareModal` (bilan hebdomadaire) | Le vecteur de fuite réel : la capture qu'on partage |
| Colonne `marque` | `server.ts`, `/api/teacher/export/csv` | **La correspondance marque → élève** |

**La chaîne qui rend A3 utile, et qui est testée maillon par maillon :** le jeton élève porte
`studentId = student.id` (store) → le navigateur lit ce `studentId` (`identiteCourante()`) → le serveur
marque à partir du même identifiant. **Si un maillon casse, les deux marques divergent et plus rien ne
se retrouve** — c'est la faiblesse réelle de ce dispositif, et elle est verrouillée par un test dédié.

**Vérifications :** 36 tests au total — `marque.test.ts` (20 : stabilité, non-identifiance vérifiée cas
par cas, invité sans faux marquage, position et discrétion du marqueur dans l'image, contexte sans
`save`/`restore`), `marqueExport.test.ts` (11 : les trois maillons, colonne `marque` dans l'en-tête ET
dans les deux lignes, **nombre de colonnes identique** en-tête/lignes compté par profondeur de parenthèses,
absence de `localStorage`/DOM dans le module côté serveur, marque apposée **avant** `toDataURL`),
`MarqueDocument.test.tsx` (5 : marque affichée, invisible à l'écran, invité honnête, aucun identifiant
divulgué). Suite complète **225 fichiers / 2 695 passés / 8 ignorés / 0 échec** ; `tsc` 0 ; build OK ;
`test:build` 14/14 ; entrée **164 Ko** (cible 170).

**Un test existant a été mis à jour, pas contourné :** `compteSansEmail.cablage.test.ts` figeait
l'en-tête CSV exact et a échoué à cause de la colonne ajoutée. Son intention (« une colonne `code`,
jamais `email` ») est conservée ; seule la chaîne attendue a évolué. Un test qu'on casse sans le dire
vaut zéro.

**Limites, dites franchement :**
- **un marqueur se supprime** : une capture recadrée l'élimine. Il dissuade le partage paresseux, il
  n'arrête pas un élève déterminé ;
- **le mode invité reste intraceable, par construction.** Sans compte, il n'y a aucune identité à
  marquer. Sa ligne l'écrit explicitement (« غير قابلة للتتبع ») plutôt que de laisser croire à un
  marquage qui n'existe pas. C'est la contrepartie assumée de la promesse « rien ne quitte ton
  téléphone » — et c'est une raison de plus, du point de vue du professeur, de pousser l'inscription ;
- **la marque est calculable par qui connaît l'identifiant interne.** Elle sert à **attribuer** un
  document, pas à prouver une identité.

---

## 11. Mesure A2 — IMPLÉMENTÉE le 14/10/2026 : le serveur définit le barème et l'horloge

**Ce qui a été trouvé (vérifié dans le code, pas supposé).** La route `/api/student/sync` transmettait au
stockage ce que l'appareil envoyait, sans contrôle :

```ts
icm:        typeof entry.icm === 'number' ? entry.icm : null   // aucune borne
created_at: typeof entry.createdAt === 'string' ? … : ''        // date de l'appareil
stage:      typeof entry.stage === 'number' ? … : null          // aucune borne
```

Conséquences **réelles**, pas théoriques :

| Falsification possible | Effet sur ce que lit le professeur |
|---|---|
| `icm: 9999` (ou 101) sur une échelle 0-100 | Entre dans la **moyenne ICM** du tableau de bord |
| `createdAt` en 2030 | L'élève paraît **« actif dans les 7 jours »** pour toujours — et fausse `actifs7j`, `retardPremiereTrace` |
| Lot de 300 productions | **Tronqué en silence** à 100 : l'élève voit un succès, le professeur ne voit pas 200 lignes |
| `stage: 99` | Étape inexistante dans le moteur méthodologique (qui en compte 4) |

**Corrigé.** Module pur `src/server/assainirEntrees.ts`, appelé par la route **avant** le stockage :

| Règle | Décision | Pourquoi |
|---|---|---|
| `icm` | Entier dans **0-100**, sinon **entrée refusée** | Une note impossible n'est pas une note approximative : elle polluerait la moyenne. Le barème vient du moteur réel (`methodologyScorer` : `Math.round(…) * 100`) |
| `stage` | Entier dans **1-4**, sinon refusé | Miroir de `StepId = 1 \| 2 \| 3 \| 4` du moteur |
| `createdAt` **futur** (> 5 min) | **Remplacé** par l'heure du serveur, et compté | On ne travaille pas demain. Le travail reste enregistré : un appareil mal réglé n'est pas un tricheur |
| `createdAt` **ancien** | **Conservé** | L'application est hors ligne par choix : un élève peut légitimement synchroniser une semaine de travail. Le corriger effacerait sa semaine |
| `text` > 20 000 car. | Refusé (pas coupé) | Découper produirait une copie tronquée jugée comme complète |
| `errorTags` en excès | **Tronqués**, l'entrée survit | Leur excès ne fausse aucun score |
| Lot > 100 | Tronqué **et compté** | Le silence était le vrai défaut |
| Type d'activité inconnu, `payload` non objet, non sérialisable ou > 4 000 car. | Refusé | Éviter que le stockage devienne un dépotoir |

**Le refus n'est pas silencieux :** le client reçoit `refuses` (détail par raison), le serveur écrit
`[sync] refus pour <élève>` dans son journal, et l'élève voit un bandeau « لم تُسجَّل N عناصر عند أستاذك »
avec les raisons — parce qu'un succès muet lui ferait croire que son travail est arrivé chez le
professeur. La file locale retire ces éléments (les renvoyer en boucle ne les rendrait pas valides).

**Vérifications :** 51 tests — `assainirEntrees.test.ts` (35 : bornes exactes 0/100 acceptées, 101/9999/
-5/74.5/non-nombre refusés, étapes 1-4, date future corrigée et comptée, date ancienne **conservée**,
date illisible remplacée, lot de 300 tronqué et compté, 1 000 entrées → 100, tags tronqués, identifiants
à caractère de contrôle, `payload` cyclique) + `assainissementSync.cablage.test.ts` (16 : la route
n'appelle plus `addEntriesIfNew(studentId, entries)` brut, `refuses` est renvoyé, le client le lit et
l'enregistre, le compteur est cumulatif et effaçable, le bandeau n'apparaît qu'avec des refus, et le
module **dit lui-même** qu'il ne vérifie pas la qualité de la copie). Suite complète **227 fichiers /
2 746 passés / 8 ignorés / 0 échec** ; `tsc` 0 ; build OK ; `test:build` 14/14 ; entrée **166 Ko**.

**CE QUE CELA NE FAIT PAS — la limite est dans le code, pas seulement ici.** Cela ferme la porte à
l'**absurde**, pas à la triche fine : tant que le barème et le corrigé vivent dans le paquet livré à
l'élève, celui-ci peut envoyer une copie médiocre en annonçant 100/100. Interdire cela demande que le
moteur de correction vive côté serveur — **c'est le chantier A4, et il n'est pas fait.** Le module
l'écrit noir sur blanc pour que personne ne s'y trompe.
