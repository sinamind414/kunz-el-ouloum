# Analyse — Le capitaine de KUNZ-EL-OULOUM-LITE : ce qu'il fait, et ce qu'on en porte

**Date** : 14/10/2026 · **Source** : `github.com/sinamind414/KUNZ-EL-OULOUM-LITE`, branche `main`
(lecture seule via l'interface GitHub et `raw.githubusercontent.com` — le bac à sable n'a pas d'accès réseau à GitHub).
**Objet** : comprendre comment le guide travaille avec l'élève dans la version LITE, pour en tirer des idées
applicables ici. Ce document n'est pas une revue de code : c'est une extraction de mécanismes.

---

## 1. Son rôle réel : quatre prises de parole dans une séance de 42 minutes

Le capitaine du LITE n'est pas un assistant qu'on interroge : c'est un **maître de séance**. Toute la leçon
est pilotée par un protocole de 6 phases (`src/data/protocole.ts`), et le guide intervient à des moments
**fixés dans le code** :

```ts
// src/components/ProtocoleRunner.tsx
// المراحل التي يتكلّم فيها المُرشد (الباقي: صمت)
const PHASES_PARLANTES = new Set([1, 3, 5, 6]);
```

| Phase | Durée | Ce qu'elle fait avaler au « résumé d'or » | Le capitaine parle ? |
|---|---|---|---|
| 1. Question et lecture | 8 min | `questionLecon` + `missionAr` + nombre d'étapes | **oui** |
| 2. Capture des motifs | 3 min | `vocabulary` (classer les mots-clés) | non |
| 3. Premier rappel | 5 min | `missionAr` + `recallQuestionAr` | **oui** |
| 4. Squelette | 5 min | `mechanismAr` (masqué puis révélé) | non |
| 5. Lecture guidée | 15 min | `mechanismAr` + `evidenceAr` | **oui** |
| 6. Ancrage | 10 min | `bacSentenceFrameAr` + `commonErrorAr` | **oui** |

Sa ligne de phase est une donnée, pas une génération : `morchidAr` est un champ de chaque phase. Exemple,
phase 3 : « Ce que tu écris maintenant **de ta mémoire** — pas du cours — c'est ce qui va tenir. »
Et la règle d'ensemble est explicite en tête du fichier de données :

> « لا يوجد زر «تخطّي». كل مرحلة لها بوّابة تحقّق تُفعّل زر الانتقال.
> **المُرشد يتكلّم في 4 لحظات فقط**، والصمّام «أنا عالق» يُعطي تلميحين كحدّ أقصى لكل مرحلة. »

Trois contraintes, donc : pas de saut de phase, une porte de vérification par phase, et un guide qui se tait
dans deux phases sur six. **Le silence n'est pas une politique de timing ici : il est dans les données.**

## 2. Les six mécanismes qui font la différence

1. **Porte de vérification** — le bouton « j'ai fini cette phase » reste désactivé jusqu'à la condition de
   `verrouAr`, affichée sous le bouton (ex. phase 1 : « combien d'étapes causales dans la leçon ? »).
2. **Soupape « je suis bloqué », plafonnée** — `ValveAide` reçoit `restant={aides}`, initialisé à **2** et
   décrémenté à chaque indice consommé. L'indice vient de `indiceAr` (un par phase). Au-delà : plus rien.
3. **« Produis d'abord, choisis ensuite »** (`PortillonRappel`) — avant d'afficher les options, l'élève doit
   produire sa réponse *sur papier ou à voix haute*, puis confirmer. Le QCM ne sert plus à trouver mais à
   **vérifier** : « choisir une réponse prête corrige la reconnaissance, pas le rappel ».
4. **L'échec devient une donnée** — première erreur : « ce n'est pas la réponse, essaie encore ». Deuxième :
   la bonne réponse est donnée **et la phase est enregistrée comme « هشّة » (fragile)**, avec la phrase
   « on la reverra demain ». L'élève n'est pas puni : la notion est étiquetée.
5. **Diagnostic déclaré par l'élève, réinjecté plus tard** — en phase 6, après comparaison avec l'« erreur
   nucléaire » du cours (`commonErrorAr`), l'élève s'auto-évalue sur 3 niveaux ; s'il n'est pas parfait, il
   **choisit son type de brèche** parmi 4 (`DIAGNOSTICS`, T1–T4 : terminologie / séquence / preuve /
   production). Ce choix est stocké par leçon et **réinjecté à la séance de révision suivante** :
   « 🎯 ثغرتك المسجَّلة هنا — استهدفها » (`SessionRevision.tsx`).
6. **Révélation progressive avec rappel actif entre les pas** — en phase 5, une étape n'apparaît qu'après
   que l'élève a dit à voix basse *pourquoi* elle vient après la précédente. S'y ajoute une « échelle de
   compréhension » affichée (phénomène → mécanisme x/y → preuve moléculaire).

## 3. Ce que ce capitaine fait mieux que le nôtre

| Mécanisme LITE | Notre état, vérifié dans le code | Verdict |
|---|---|---|
| L'élève **déclare** son type d'erreur, qui est stocké et **réinjecté** plus tard | `utils/profilErreurs.ts` a la structure (9 codes, dominante, stockage local) mais `enregistrerErreurs` n'est appelé qu'à **2 endroits** (`MethodologyCompilerView.tsx` L361 et L459) : les erreurs de méthode. La famille « confusions de notions » **n'a aucun producteur** | **Nous sommes en retard** |
| « Produis avant de choisir » | `QuizView.tsx` L360 affiche les options **immédiatement** | **Nous sommes en retard** |
| Une notion ratée est marquée **fragile** et revient le lendemain | Le score est plafonné (KEO-101) mais rien n'étiquette la notion pour un retour programmé | **Nous sommes en retard** |
| Le guide parle **pendant la tâche** (phases 1/3/5/6) | Notre capitaine parle **entre** les sessions (série, erreurs, cumul). Sa parole est contextuelle, mais elle ne suit pas l'élève *dans* l'exercice | Complémentaire |

## 4. Ce qu'il ne faut PAS copier

1. **Les lignes du capitaine sont figées dans les données.** `morchidAr` est une constante par phase : les
   quatre mêmes phrases reviennent à l'identique pour les 25 leçons. C'est le défaut que la loi n° 1
   d'Atomic Habits décrit — un signal répété à l'identique s'efface du décor. À la troisième leçon, l'élève
   ne les lit plus. Notre bulle, elle, est contextuelle (série, cumul, erreurs en mémoire) : c'est un
   avantage réel, ne le perdons pas en copiant un texte fixe.
2. **« القبطان مفتاح » accole deux choses distinctes** — le nom du guide et « مفتاح », qui est le nom de la
   **méthode** (`MIFTAH_NAME_AR`). C'est exactement la collision refusée ici (MARQUE §14). Côté LITE, c'est à
   nettoyer, pas à imiter.
3. **La durée : 42 minutes en 6 phases verrouillées.** C'est un protocole de séance assise, livre ouvert. Le
   public visé ici est sur téléphone, souvent pour quelques minutes. Importer la durée serait suicidaire :
   on importe les **mécanismes d'erreur**, pas le format.
4. **Aucun bouton « passer ».** Défendable en séance encadrée, brutal quand l'élève a six minutes devant lui
   et un contrôle le lendemain. Chez nous, un verrou dur ferait fuir avant d'instruire.

## 5. Ce que je propose de porter ici, par rapport valeur / coût

**A. Donner un producteur à la mémoire des erreurs** *(valeur forte, coût faible)* — c'est le trou du §8 de
l'audit : la structure existe, elle est vide. Le LITE prouve qu'**une seule question à 4 choix suffit**.
Concret : après un échec dans `MethodologyCompilerView`, juste après l'appel existant à `enregistrerErreurs`,
une question « d'où vient l'erreur ? » mappée sur notre taxonomie existante — pas une nouvelle structure.

**B. Portillon « produis d'abord » sur le QCM** *(valeur forte, coût moyen)* — demander la réponse à voix
haute ou sur papier avant d'afficher les options. C'est le seul mécanisme de la liste qui change la nature
du geste de l'élève : reconnaître devient se rappeler.

**C. Étiquette « fragile » + retour du capitaine** *(valeur moyenne, coût faible)* — marquer l'unité ratée
et laisser la bulle la citer (`ContexteCapitaine.derniereUnite` existe déjà). L'échec cesse d'être un score
pour devenir un rendez-vous.

**D. Faire parler le capitaine DANS l'exercice** *(valeur moyenne, coût moyen)* — 4 moments à définir chez
nous (avant de répondre, après un échec, avant la correction, à la fin), avec des phrases **variables** et
pas figées. C'est le complément de ce qu'il fait déjà entre les sessions.

## 6. Contradiction à trancher avant de copier le point B

Les deux dépôts ont des philosophies d'aide **opposées**, et les deux se défendent :

- **LITE** : plafond dur à 2 indices par phase, et le QCM produit d'abord.
- **Ici (KEO-101/KEO-102, `smartTutorEngine.ts` L1162-1164)** : escalier de **3** indices, aucun indice
  avant 90 s sans tentative écrite, correction débloquée au 3ᵉ indice avec score plafonné à 3/10.

Ce n'est pas la même idée de l'aide : le LITE **rationne**, nous **graduons**. Copier le plafond à 2 sans
retirer l'escalier donnerait trois sources d'aide concurrentes. Il faut choisir une doctrine, pas empiler.

---

## Ce qui n'est pas vérifiable depuis ici

- Où `MascotteKunz.tsx` est appelé sur `main` (la branche `arena/7a3f2e84-…` l'ajoute à `ProtocoleRunner`
  et `SessionRevision`, mais le composant existe déjà sur `main` — je n'ai pas parcouru tous ses points
  d'appel).
- Le contenu de `lessonGoldSummaries.ts` (25 leçons) : je n'ai lu que sa structure, pas les données.
- L'effet réel sur les élèves : aucun test utilisateur n'existe dans aucun des deux dépôts.
