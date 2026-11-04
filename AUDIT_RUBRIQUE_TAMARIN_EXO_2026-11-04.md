# AUDIT — Rubrique « التمارين والتدريب » (tamarin / exo), module par module

**Date de mesure :** 2026-11-04, 12:45 UTC · **Branche :** `arena/5420e52e-kunz-el-ouloum` (`active`), HEAD `718d1fe` · `master` = `c701738` (remote identique) · **0 commit depuis `c701738`** · CI `41822767055` = 5/5.
**Objet :** « quand l'élève entre dans cette rubrique, il n'est pas guidé par quoi commencer ; à mon avis il faut commencer par les QCM / flashcards — à vous de voir l'approche idéale autant enseignant ».
**Nature :** audit + arbitrage pédagogique. **Aucun fichier source modifié**, aucun commit, aucun push.

---

## 0. Cadrage : de quelle « réorganisation » parle-t-on ?

| Fait | Mesure |
|---|---|
| `reorganisation-med` | **0 commit d'avance / 27 de retard** → entièrement fusionnée, rien en attente |
| Commit `5f14bebf` « reorg: importer la reorganisation Med (82 fichiers) » | ne touche **aucun** fichier du hub d'entraînement (seulement des patches d'archive) |
| `TrainingHubView.tsx`, `trainingHub.ts`, `revisionHub.ts`, `conseilsRubrique.ts` | **identiques octet pour octet entre `HEAD` et `master`** (`git diff --stat` vide) |
| Tests de verrous | `TrainingHubView.test.tsx` + `cadenasHubs.test.tsx` + `PortesUniques.test.tsx` = **3 fichiers / 18 tests, 18 verts** (exécutés) |

La réorganisation en vigueur est donc celle des **sprints 12/13 + restructuration du 2026-10-11** : 5 rubriques principales, une **porte unique** « التمارين والتدريب » qui remplace 9 entrées de menu, et un second hub « المراجعة ». Rien de nouveau n'est en attente : le défaut que vous signalez est un **défaut de conception courant**, pas une régression récente.

---

## 1. La porte d'entrée, telle qu'elle est codée

`TrainingHubView.tsx` (110 lignes) : titre `التمارين والتدريب`, sous-titre **`اختر الحركة التي تريد تمرينها اليوم`** (« choisis le geste que tu veux entraîner aujourd'hui »), puis une grille 2 colonnes de **7 cartes**, toutes de **poids visuel identique** (même bordure, même ombre, même survol ; seule `bootcamp` se distingue par son cadenas).

En RTL, le **premier enfant est à droite = début de lecture** : la première carte lue est `bacideas` (« أفكار التمارين حسب الدورة », geste **« أقرأ الامتحان »** = *je lis l'examen*), c'est-à-dire une activité **réceptive et abstraite** (65 idées de sujets BAC 2019-2025). La 3ᵉ carte est **verrouillée** (`deverrouApresUnites: 2`) : un élève neuf, 0 unité complète, voit donc un cadenas avant d'avoir commencé quoi que ce soit.

**Mesure du guidage : 0 occurrence** de `ابدأ` / « commence » dans `TrainingHubView.tsx` et `trainingHub.ts`. La seule consigne qui existe est **hors du hub** :

`src/data/conseilsRubrique.ts`, entrée `training` (rendue par `BandeauConseilRubrique` depuis `App.tsx:1114`) :
> « هنا نخسر النقاط بأمان. تمرين واحد أُنجز كاملًا أنفع من ثلاثة ناقصة، والتصحيح جزء من التمرين لا نهايته. »
> **ابدأ بـ :** « اختر تمرينًا واحدًا وحدّد أين ستتوقّف قبل أن تبدأ. »

C'est une excellente **consigne de méthode**, mais : ① elle ne nomme **aucun module**, ② elle est **première visite seulement** (`marquerRubriqueVue` mémorisée à l'affichage), ③ elle s'affiche **au-dessus** du hub, pas attachée à une carte, ④ après fermeture elle ne revient pas seule. Autrement dit : l'élève est conseillé sur *comment* travailler, jamais sur *par où* commencer. **Votre diagnostic est exact.**

À l'inverse, l'accueil possède déjà `خطوتك التالية` → `NbaCard` → `nextBestAction` (REPRISE > RAPPEL J+14 > QUOTA > NOUVEAU > REPOS), qui sait ouvrir **un QCM** (`onOpenQcm`) ou une leçon selon l'état réel. **La logique de « prochaine meilleure action » existe dans le produit, mais elle n'entre pas dans cette rubrique.**

---

## 2. Audit module par module — les 7 cartes d'entraînement

| # | Onglet / titre | Geste annoncé | Charge cognitive | Prérequis / verrou | Comme 1ᵉʳ geste ? |
|---|---|---|---|---|---|
| 1 | `bacideas` — أفكار التمارين حسب الدورة | أقرأ الامتحان (*je lis l'examen*) | **Réceptive**, méta : lire ce qui est tombé (65 idées) | libre | ❌ Passif, abstrait, sans production ; utile *avant* de réviser, pas pour démarrer une séance |
| 2 | `situations` — تمارين بالوضعيات | أحلّل سنداً (*j'analyse un document*) | **Élevée et ciblée** : le cœur du BAC (snd + consigne) | libre | ✅ **Le vrai geste BAC**, mais trop coûteux à froid sans échauffement |
| 3 | `bootcamp` — تحدي البكالوريا | أختبر نفسي | **Très élevée** (pression temps) | **2 unités complètes** | ❌ Cadenas dès le 1ᵉʳ jour → signal d'échec avant l'action |
| 4 | `workshop` — الورشة التفاعلية | أنتج جواباً (*je produis une réponse*) | **Moyenne, guidée** (texte à trous, étapes) | libre | ✅✅ **Meilleur compromis** après un rappel court : production sans détresse |
| 5 | `animations` — الأنميشن العلمي | أشاهد آلية (*je regarde un mécanisme*) | Réceptive, comprehension | libre | ⚠️ Remédiation / compréhension, pas entraînement actif |
| 6 | `tadwin` — التدوين الشامل | أدوّن الزبدة (*je note l'essentiel*) | Moyenne (reformulation) | libre | 🟡 Excellent *après* une leçon, pas à l'arrivée dans « exercices » |
| 7 | `examens` — الاختبارات | أختبر نفسي على سلم التنقيط | Élevée (QCM chapitres + 3 BAC complets) | libre (paywall unités 6-11) | ❌ Évaluation, pas apprentissage ; à placer en fin de séquence |

**Constat d'architecture :** les cartes sont classées par **geste** (choix pédagogique assumé et verrouillé), **pas par difficulté ni par progression**. Il n'y a donc ni ordre de lecture, ni « niveau 1 », ni point d'ancrage : l'élève doit déjà savoir ce qu'il veut travailler pour pouvoir choisir. C'est une porte conçue pour un élève autonome, pas pour un élève de 3AS qui arrive.

### 2 bis. Où sont réellement les QCM / flashcards ? (le point décisif)

| Module | Volume mesuré par exécution | Vit dans | Atteignable depuis le hub ? |
|---|---|---|---|
| Corpus QCM `SVT_QUIZ_QUESTIONS` | **531** | `QuizView` (QCM de leçon, alimente `profilErreurs`) | ❌ |
| `SVT_FLASHCARDS` (SM-2) | **569** = 35 hosila + 531 dérivées du QCM + 3 collège | `ReviewHubView` → `RevisionView` (المراجعة الذكية) | ❌ |
| QCM du livre officiel `QCM_CHAPITRES` | **41 chapitres**, 1 QCM + schéma + explication chacun | `LessonsView` (carte en fin de domaine, deep-link) | ❌ |
| Bilan diagnostique `tirageBilan()` | **15 QCM** sur 81 vérifiés | `QcmBilanView` | ❌ |
| Micro-capsules | capsules 45-90 s, auto-test à réponse masquée | `MicroCapsulePanel`, plan de révision | ❌ |

**Aucun QCM ni flashcard n'est dans la rubrique « التمارين والتدريب ».** Ils appartiennent par décision du 2026-10-11 à la rubrique **« المراجعة »** (consolider ce qui est déjà compris) ou à **« الدروس »**. Les y faire entrer comme 8ᵉ carte créerait une **seconde porte** vers `review`/`qcm` et casserait le verrou `PortesUniques.test.tsx` (mesuré : « une fonctionnalité = une seule porte principale »).

---

## 3. Verdict d'enseignant sur « commencer par les QCM / flashcards »

### Ce qui est juste dans votre intuition ✅

1. **Rappel actif = l'effet le plus rentable** à faible coût : 3 minutes de QCM/flashcards réveillent les acquis, donnent un feedback immédiat et un **premier succès** — exactement ce qui manque pour dissiper « par où je commence ? ».
2. **C'est diagnostique** : avant d'engager 20 minutes d'analyse de document, on voit si la notion est là. Le QCM de `QuizView` alimente déjà `profilErreurs` ; le bilan 15 QCM renvoie déjà vers le chapitre/leçon à revoir. L'infrastructure de diagnostic **existe**.
3. **C'est court et non anxiogène** : « هنا نخسر النقاط بأمان » (on perd des points en sécurité) — la consigne du capitaine colle parfaitement à un échauffement.

### Pourquoi je n'en ferais pas la porte d'entrée obligatoire ⚠️

1. **Le BAC 3AS شعبة العلوم التجريبية n'est pas un examen de rappel** : 1 sujet au choix · 3 exercices **5 + 7 + 8 = 20 pts** · **4 h 30**, dominés par l'**analyse de documents**, l'exploitation de graphes, le raisonnement expérimental et la **production écrite**. QCM/flashcards entraînent la **reconnaissance** de faits isolés. Si la rubrique commence *toujours* par eux, l'élève optimise la métrique facile et développe une **illusion de maîtrise** : « je connais mes cartes » ≠ « je sais analyser un sondage / rédiger une conclusion ». C'est exactement le **risque principal** identifié dans l'audit 8 axes : la rupture du guidage.
2. **Problème du démarrage à froid** : le SM-2 ne présente que les cartes **dues** ; un élève neuf n'a **0 carte notée** et 0 unité complète, et `QcmLivreView` est verrouillé par `uniteOuverte`. « Commencer par les flashcards » peut donc produire un écran **vide ou cadenassé** — pire que l'absence de consigne.
3. **Conflation des rubriques** : QCM/flashcards = **consolidation** (déjà compris), entraînement = **production sous contrainte**. C'est la confusion que la restructuration du 2026-10-11 a précisément corrigée.

**Arbitrage :** votre idée est la bonne **première brique**, mais elle doit être cadrée comme un **rituel d'entrée de 3 minutes, diagnostic, immédiatement suivi d'un geste de production** — pas comme un module de destination, ni comme une consigne permanente « commence toujours par les QCM ».

---

## 4. L'approche idéale (prof de 3AS, une seule voix)

**Principe de séquence :** `Rappel 3 min → Geste BAC → Auto-correction → Consolidation SRS (à la maison)`.
**Une séance = un geste = une consigne.** On ne demande jamais à l'élève de choisir parmi 7 gestes avant de l'avoir mis en mouvement.

### 🔴 1 — **Le Capitaine décide et parle** ; le hub ne fait que rendre

> **Arbitrage propriétaire (2026-11-04) :** « un helper pur, c'est le Capitaine Kunz El Ouloum, c'est lui qui guide l'élève, c'est le coach ». **Validé et intégré ici** : aucun guide autonome, aucune troisième voix.

La décision appartient à `invitationDuMoment(ctx)` (`src/lib/invitationCapitaine.ts`) qui publie **UNE** `Invitation` (`messageAr`, `actionAr`, `gainImmediatAr`, `cible`, `loi`). La règle qui choisit le module est une fonction **pure interne au module du coach** — un *calcul*, pas un guide concurrent (exactement comme `classerParUrgence`, `unitPriority` ou `nextBestAction`). Le hub reçoit la projection via le pointeur partagé `etatEleveSiChargee()` et **ne décide de rien**. Surfaces d'affichage **existantes** : la bulle (`BoutonMorchid` / `bulle-capitaine-agir`) et `BandeauConseilRubrique` qui imprime déjà `ابدأ بـ: {conseil.gesteAr}` avec le visage du Capitaine. Signaux **déjà disponibles** : `etat.competence.verdicts` (M1), `unitesCompletes`, `nextBestAction()`, `duesDuDeck()`, `ctx.rubrique`. La consigne nomme **UN module + UN geste + une durée** :

| État élève | Consigne (sens) | Module désigné |
|---|---|---|
| `null` / 0 unité / aucune mesure | « 3 questions courtes sur ton unité en cours, puis viens produire une réponse » | échauffement → **workshop** |
| verdict `faible` | « reprends la capsule de l'unité, puis un atelier guidé » | **workshop** (+ micro-capsule) |
| `moyen` / unité en cours | « analyse UN document de ton unité, jusqu'au bout » | **situations** |
| `fort` / ≥ 2 unités | « un chapitre du livre au barème, puis corrige-toi » | **examens**, puis `bootcamp` déverrouillé |
| cartes SRS dues > 0 | « 3 cartes dues d'abord » (rappel J+14 déjà dans `nbaEngine`) | rituel inline |

Règles impératives (déjà arbitrées en séance) : **consigne = projection dérivée, jamais stockée** ; `etatEleveSiChargee() === null` ⇒ consigne d'accueil par défaut, **jamais de recommandation inventée** ; grain **unité**, zéro annotation par leçon ; `unitPriority()` sert de départage seulement.

**Mesure corrective (12:57 UTC) :** le dépôt de l'état unique `fournirEtatEleve(etat)` est **déjà câblé sur la branche active** (`useInvitationCapitaine.ts:268`, import `:69`) — l'affirmation inverse figure par erreur dans une version antérieure de ce rapport et dans le chat ; elle est **réfutée**. Seul diffère l'abonnement : `surveillerEtatEleve` existe sur `master` (M1, `etatEleveRuntime.ts`) et **pas sur `HEAD`** (0 occurrence) → sur la branche, le hub lit le pointeur au montage ou l'on ajoute l'abonnement (fichier non protégé). Le fallback `null` reste obligatoire dans les deux cas.

**Pourquoi le coach, et pas un bandeau autonome (mesures) :** `capitainePeutParler()` possède déjà les portes du silence (épreuve en cours, nuit 22h–7h, ignorance < 6 h, travail déjà fait aujourd'hui) ; `invitationDuMoment()` applique « une seule voix » (relais humain, motifs retirés après 3 échecs) ; `CibleInvitation` contient déjà **`'training'`** ; pour un élève neuf (`j === null && serie === 0`) le coach propose déjà `ACTION_UNE_QUESTION_AR = « اختبار قصير: سؤال واحد »` avec `cible: 'training'` (loi 3, règle des 2 minutes) ; `conseilDeRubrique('examens')` est déjà repris **verbatim** par le coach (`:467`). Un bandeau qui déciderait de son côté parlerait **hors des portes de silence** et rejouerait le bug « deux cerveaux » que `etatEleveRuntime` a précisément supprimé.

**Câblage de l'action, sans toucher `App.tsx` :** `App.tsx:1428-1429` fait déjà `accepter(); setCurrentTab(invitation.cible)` → la bulle ouvre le hub. Le hub met en avant **UNE** carte (projection de l'état) et son prop `onOpen(tab)` existant mène au module. Aucune nouvelle porte, aucune nouvelle voix.

### 🔴 2 — Les QCM/flashcards en **rituel inline de 3 questions**, pas en 8ᵉ carte

Dans le bandeau : **3 cartes dues ou 3 QCM courts de l'unité courante**, servis en mémoire (depuis `SVT_FLASHCARDS` / `SVT_QUIZ_QUESTIONS`), réponse masquée jusqu'au clic, puis un seul CTA **« تمّ، انتقل إلى التمرين »** vers le module désigné.
- **Aucune navigation** vers `review`/`qcm` → `PortesUniques.test.tsx` reste vert ;
- **aucune nouvelle clé de stockage**, aucune 8ᵉ porte → `TRAINING_ENTRY_COUNT ≤ 8` (Miller) respecté ;
- cadré explicitement **« échauffement / diagnostic »** → pas d'illusion de maîtrise ;
- `duesDuDeck()` lit le stockage **une seule fois** (correctif ① déjà mesuré à 0,46 ms/appel).

### 🟡 3 — Un seul point d'ancrage visuel

Une **seule** carte reçoit un badge « موصى به اليوم » + une ligne « لماذا » ; les 6 autres gardent leur poids actuel. On ne réordonne pas `TRAINING_ENTRIES` (les tests itèrent dessus), on ne crée pas d'onglet. Déplacer `bacideas` hors de la 1ʳᵉ position de lecture est souhaitable, mais **visuellement** (section secondaire « قبل أن تبدأ »), pas en changeant la source de vérité.

### 🟡 4 — Réparer le bandeau de première visite

`conseilsRubrique.ts` garde sa consigne de méthode, mais : l'attacher à la carte recommandée, permettre la **réouverture** depuis le hub, et **ne jamais** afficher « choisis un exercice » quand une recommandation d'état existe. Une seule voix : le capitaine ne parle pas deux fois.

### 🟢 5 — Mesurer avant de généraliser

Sur 5-10 élèves : **temps jusqu'à la 1ʳᵉ action**, taux de complétion du geste désigné, abandon à 3 min, et surtout **part des élèves qui atteignent encore `situations` / `workshop`** (détecteur d'illusion de maîtrise : si les QCM captent toute la séance, l'approche est à corriger). Aucun ajustement automatique des notes ou des formules — règle P2/R6.

### Ce qu'il ne faut **pas** faire

- ❌ Ajouter une carte « QCM / flashcards » dans le hub (double porte, 8 cartes, confusion consolidation/entraînement).
- ❌ Mettre une recommandation **fixe** identique pour tous (un élève `fort` s'ennuie, un élève `faible` se décourage).
- ❌ Mettre 7 badges / 7 numéros d'ordre (mur de choix, surcharge).
- ❌ **Créer un « guide » autonome** (helper visible, bandeau qui décide, 2ᵉ cerveau) : le Capitaine est le seul décideur et la seule voix. Un calcul pur reste permis **uniquement à l'intérieur de `src/lib/invitationCapitaine.ts`**, publié par `invitationDuMoment`.
- ❌ Toucher `src/App.tsx` (protégé par `AGENTS.md:29` ; sur `master` toute nouvelle modification exige une validation explicite signée) ou `package.json` (`AGENTS.md:27`). Tout le correctif tient dans `TrainingHubView.tsx` + une règle pure **dans le module du coach** + `conseilsRubrique.ts`, **tous non protégés et identiques sur `HEAD`/`master`**.

---

## 5. « Non vérifiable »

Comportement réel d'élèves algériens face à la rubrique, temps jusqu'à la première action, efficacité comparée QCM-premier vs analyse-premier (aucune mesure A/B dans le dépôt), mesure sur device bas de gamme, conformité au programme officiel post-2017, validation indépendante du correcteur (M3 en attente du lot de 30 copies). Les volumes et les tests ci-dessus sont, eux, **mesurés par exécution**.

---

## 6. Verdict final

| Question | Réponse |
|---|---|
| Le défaut est-il réel ? | **Oui, mesuré** : 0 « ابدأ » dans le hub, 7 cartes de poids égal, 1 cadenas au 1ᵉʳ jour, consigne générique et première visite seulement |
| Est-ce une régression de la réorganisation ? | **Non** : fichiers identiques `HEAD`/`master`, branche `reorganisation-med` fusionnée ; c'est un angle mort de conception depuis le sprint 13 |
| « Commencer par QCM / flashcards » ? | **Oui comme échauffement diagnostic de 3 min, non comme destination** : le BAC juge l'analyse de documents et la production écrite, pas la reconnaissance |
| Approche idéale | **Le Capitaine décide et parle** (une seule `Invitation`, une seule voix) → **3 questions de rappel inline → UN geste BAC désigné → auto-correction** ; le hub ne fait que rendre la projection, sans nouvelle porte, sans `App.tsx`, sans stockage |
| Priorité | 🔴 consigne d'entrée + rituel inline · 🟡 ancrage visuel unique + bandeau réouvrable · 🟢 mesure terrain |
| Confiance | ⭐⭐⭐⭐ — architecture, volumes, tests et câblage vérifiés ; seule l'efficacité pédagogique reste à mesurer |

*Cet audit n'a modifié aucun fichier source. Aucun commit, aucun push, aucun changement de branche. Les 5 fichiers non suivis déjà présents (rapport 8 axes + 2 patches M4 + 2 fichiers M3) restent intacts.*
