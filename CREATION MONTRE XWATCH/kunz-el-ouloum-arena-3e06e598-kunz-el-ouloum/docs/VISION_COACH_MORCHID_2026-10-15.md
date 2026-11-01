# Morchid comme coach — la vision, mesurée
## Trois cerveaux, et aucun souvenir de la relation

15/10/2026 — diagnostic et vision. Aucune ligne de code.

---

## 1. La réponse directe à ta question

Tu demandes : « est-ce que Morchid a l'algorithme de suivi d'un coach qui guide,
oriente, booste, encourage, conseille ? »

**Réponse mesurée : il a trois organes sur quatre.** Et l'organe manquant est
précisément celui qui transforme un distributeur de messages en coach.

| Organe | État | Où |
|---|---|---|
| **Quoi faire** — la prochaine action | **EXISTE** | `nbaEngine.ts` : reprise → rappel → quota → nouveau → repos |
| **Où j'en suis** — verdict et prescription | **EXISTE** | `coach/diagnostic.ts` : faible / moyen / fort / non commencé, par unité, classé par poids au BAC |
| **Quand parler** — le bon moment, la bonne phrase | **EXISTE et c'est du travail sérieux** | `invitationCapitaine.ts` : 4 lois, 5 cas de silence |
| **La boucle** — qu'est-ce que j'ai prescrit, l'élève l'a-t-il fait, et ça a marché ? | **ABSENT** | nulle part |

Autrement dit : Morchid sait quoi dire, quand le dire, et où en est l'élève.
**Il ne sait pas si ce qu'il a dit a servi.**

---

## 2. La preuve que la boucle est ouverte — une seule suffit

J'ai cherché la trace de la réaction de l'élève à un conseil du coach. Il en
existe **exactement une** : `derniereInvitationIgnoreeMs`, un horodatage écrit
quand l'élève **ferme** la bulle.

Et à quoi sert-il ? À une seule chose : `SILENCE_APRES_IGNORANCE_MS = 6 heures`.
On l'utilise pour se taire six heures.

Ce que le système ne sait donc **jamais** :
- l'élève a-t-il fait la chose demandée, ou a-t-il juste fermé la bulle ?
- est-il revenu le lendemain ?
- le conseil donné mardi a-t-il produit quoi que ce soit mercredi ?
- la même phrase répétée pour la troisième fois a-t-elle déjà échoué ?

**Un seul bit de retour, utilisé pour se taire.** C'est la définition d'un
émetteur, pas d'un coach.

### Le détail qui achève le diagnostic

`profilErreurs.ts` expose `oublierErreur(code)` — la fonction qui **ferme une
erreur**. C'est l'événement le plus précieux du produit : le seul capital qui ne
se remet pas à zéro quand la série casse, le seul qui se comporte vraiment comme
des intérêts composés.

Vérifié par grep sur tout `src/` : **elle n'est appelée nulle part**, sauf dans
son propre fichier de test.

C'est le troisième cas du même défaut dans ce dépôt, après `spacedRecallPrompts`
(jamais montré à un élève) et `MICRO_REMEDIATIONS.nextAction = 'schedule_recall'`
(jamais lu) : **des organes écrits, testés, et jamais branchés.** Le motif est
toujours le même — la brique est construite, la connexion ne l'est pas.

---

## 3. Ce qui manque, concrètement — six conséquences

1. **Aucune escalade.** Si l'invitation « deux minutes, maintenant » échoue trois
   jours de suite, le coach redit la même chose. Un vrai coach change de
   stratégie : autre heure, autre format, demande plus petite, puis il passe la
   main à quelqu'un.
2. **Aucune félicitation honnête.** Le produit ne peut pas dire « tu as fermé
   trois erreurs cette semaine » — il ne compte pas les erreurs fermées. Il ne
   peut donc féliciter que sur l'assiduité, jamais sur le progrès.
3. **Aucune adaptation du ton au moment de l'élève.** Rien ne distingue un élève
   fébrile à trois semaines du BAC d'un élève qui décolle. Le moteur parle pareil
   aux deux.
4. **Répétition.** Rien n'empêche de servir deux fois le même conseil, même
   après un échec. Or un conseil répété qui n'a pas marché n'est plus un conseil,
   c'est du bruit — et c'est ainsi qu'un tuteur perd son autorité.
5. **Aucune redevabilité vers un humain.** C'est le chaînon totalement absent, et
   c'est le chapitre le plus puissant du livre que tu m'as donné (les
   *influences*, chapitre 5 : redevabilité publique + compagnon de réussite). Le
   produit peut produire un relevé hebdomadaire ; il ne le destine à personne.
6. **La date du BAC existe et ne conseille rien.** `bacDaysLeft` sert à afficher
   « بقي 235 يوماً » dans une mission. Aucune logique de phase ne dit : à 6 mois
   on construit, à 1 mois on consolide, à 10 jours on stabilise, on ne découvre
   plus rien.

---

## 4. Ce qui existe déjà et qu'il serait criminel de casser

Je dois le dire clairement, parce que c'est rare : **le système actuel refuse
déjà les mécanismes d'addiction**, et il les refuse explicitement dans son code.

- **Silence nocturne après 22 h** : « relancer un élève la nuit fabrique du rejet ».
- **Silence pendant l'épreuve** : aucune parole, même d'encouragement.
- **Silence après un message ignoré** : un message ignoré disparaît vraiment.
- **Silence si le travail du jour est fait** : on ne harcèle pas quelqu'un qui a
  déjà travaillé.
- **Silence quand un compteur est inexploitable** : « entre un message faux et le
  silence, on choisit le silence ».
- **Règle du 2 minutes** : l'entrée la moins chère possible.
- **Protection de la série** : on parle de ce qui est acquis avant minuit, on
  n'annonce pas un échec qui n'a pas eu lieu.
- **« Ne jamais rater deux fois »** en priorité absolue sur tout le reste.
- **Aucune note inventée** : le verdict est dérivé de données réelles, et un
  élève qui n'a rien fait se l'entend dire.

Ces neuf décisions sont bonnes, et plusieurs sont contre-intuitives pour un
produit : elles **coûtent de l'engagement**. Qui les a écrites a compris le
risque. Ma vision ne consiste pas à ajouter des mécaniques par-dessus : elle
consiste à brancher une mémoire sous ce qui existe.

---

## 5. L'algorithme du coach — la vision, clairement

Un coach, ce n'est pas un stock de messages. C'est quatre choses : **des entrées,
un état, une décision, et une boucle.** Voici les quatre.

### A. Les entrées — sept familles, et rien d'inventé

Tout ce qui suit existe déjà dans le dépôt. Le coach n'a rien de nouveau à
collecter ; il doit seulement cesser de lire chacun de ces signaux dans un coin
séparé.

| Famille | Signaux | Source actuelle |
|---|---|---|
| **Temps** | heure, jour, jours depuis la dernière activité | `invitationCapitaine`, `activiteQuotidienne` |
| **Horizon** | jours restants avant le BAC | `dashboardActions` (**non utilisé pour conseiller**) |
| **Assiduité** | série, cumul, paliers | `serie.ts` |
| **Compétence** | verdict par unité, score du جسر, éléments fragiles | `coach/diagnostic.ts` |
| **Erreurs** | compteurs par code, erreur dominante | `profilErreurs.ts` |
| **Relation** | dernière invitation, ignorée ou suivie | `useInvitationCapitaine` (**1 bit**) |
| **Contexte** | épreuve en cours, rubrique ouverte | `examenEnCours`, `conseilRubrique` |

### B. L'état de l'élève — cinq phases, une transversale, **déduites** jamais déclarées

Aucune case à cocher, aucun questionnaire. La phase se **calcule** des entrées
ci-dessus, et change toute seule.

| Phase | Comment on la reconnaît | Ce dont l'élève a besoin |
|---|---|---|
| **1. Jamais commencé** | rien produit | la porte des 2 minutes, rien d'autre |
| **2. Démarrage** | < 7 jours d'activité, verdicts faibles | des victoires courtes et visibles |
| **3. Installation** | une série existe | protection de ce qui est construit, pas intensification |
| **4. Consolidation** | verdicts moyen/fort | espacement, fermeture d'erreurs, transfert |
| **5. Sprint épreuve** | < 30 jours du BAC | production chronométrée, plus aucune découverte |
| ✦ **Creux** (transversal) | ≥ 3 jours sans rien | reprise minimale, jamais de rattrapage |

Deux règles de fond sur cet état :
- **Un élève ne descend jamais de phase à cause d'un creux.** Un creux n'est pas
  une régression, c'est une parenthèse. L'état reprend où il était.
- **La phase 5 ne réintroduit jamais de contenu neuf.** À 30 jours du BAC, lire
  un nouveau chapitre est une faute de coaching, pas du zèle.

### C. La décision — une échelle de priorité, pas un calendrier

À chaque sollicitation, **une seule chose**. L'ordre est absolu ; on s'arrête au
premier niveau qui s'applique.

1. **Épreuve en cours** → silence.
2. **Nuit** → silence.
3. **Hier a été manqué** (jamais rater deux fois) → la plus petite action possible.
4. **Série vivante et soirée entamée** → protéger ce qui est acquis.
5. **Une erreur dominante revient** → un seul exercice ciblé, jamais deux.
6. **Unité faible et lourde au BAC** → contenu, dans l'ordre du poids réel.
7. **Unité forte** → espacement, et **on ne retient pas l'élève** (le retenir
   ferait baisser son niveau et détruirait la confiance).
8. **Rien à dire** → silence. C'est une réponse, pas un échec.

Les niveaux 1 à 4 existent déjà et fonctionnent. Les niveaux 5 à 8 sont là où le
coach doit apprendre à se saisir des verdicts et des erreurs qu'il connaît déjà
mais n'utilise pas pour décider.

### D. La boucle — l'organe manquant

C'est ici que tout se joue. **Chaque parole du coach doit devenir une
prescription traçable, et chaque prescription doit avoir une issue.**

```
prescription  →  { suivie | ignorée | expirée }  →  mémoire  →  décision suivante
```

**Trois issues, trois comportements différents :**

| Issue | Ce que le coach fait |
|---|---|
| **Suivie** | Il le **dit**, et il le crédite : « hier, une erreur fermée. » C'est la seule félicitation qui vaut quelque chose, parce qu'elle est mesurée. |
| **Ignorée** | Silence 6 heures (déjà fait), puis **il change de méthode** — autre heure, autre format, autre cible. Jamais la même phrase. |
| **Expirée** (rien pendant 48 h) | Il **réduit la demande** au minimum absolu : une seule question, pas une séance. Puis il change de canal : le relevé part vers un humain. |

**L'escalade associée — quatre tentatives, puis on passe la main :**

1. Une invitation (**existant**).
2. Même objectif, **forme différente** — une question au lieu d'une séance.
3. **Action minuscule** — « réponds à une seule question, puis tu fermes ».
4. **Relais humain** — le relevé du travail part à une personne choisie par
   l'élève. Ce n'est pas un échec du coach : c'est le chapitre 5 du livre, celui
   qui dit que l'environnement décide plus que la volonté.

**Et une mémoire des prescriptions** : combien de fois cette phrase a-t-elle été
dite, à qui, avec quelle issue. Trois échecs de la même phrase → elle est
retirée. Un coach qui ne modifie pas son approche après trois échecs n'est pas un
coach têtu, c'est un distributeur en panne.

---

## 6. « Addictif » — je refuse le mot, et voici pourquoi

Tu écris « il doit être addictive à l'application ». Là, mon rôle est de te dire
que tu te trompes, et je vais le faire avec des arguments, pas avec de la morale.

**1. Tes propres livres sont contre.** *L'effet cumulé* n'est pas un livre sur
l'engagement : c'est un livre sur la constance, la mesure et la redevabilité.
*Atomic Habits* n'est pas un livre sur l'accroche : c'est un livre sur
l'identité, les deux minutes et « ne jamais rater deux fois ». Aucun des deux ne
dit « rends ton application addictive ». Tous les deux disent : **rends l'action
correcte facile, visible et mesurable.** Ce n'est pas la même chose, et la
différence n'est pas cosmétique.

**2. Pour une application de révision, le temps passé est un indicateur
pervers.** Le BAC SVT se passe sur du papier, à la main, pendant des heures.
**La meilleure séance est courte et se termine quand l'élève prend son stylo.**
Une application qui maximise le temps passé dans l'application vole exactement
l'entraînement le plus rentable. Nous serions les seuls à nous féliciter d'un
chiffre qui nuit à l'élève.

**3. La ligne rouge est réelle et datée.** Nous sommes le 15 octobre ; le BAC est
dans environ huit mois, mais il y aura un jour où il sera dans trois semaines. Une
mécanique d'accroche qui fabrique de l'anxiété à ce moment-là ne booste pas un
élève : elle le casse. Et le dépôt porte déjà la trace que quelqu'un l'a compris —
le silence nocturne, la protection de la série, le silence pendant l'épreuve.
**Ne défais pas tes propres bonnes décisions à cause d'un mot.**

**4. Ce que « addictif » veut dire techniquement, et que je refuse d'implémenter.**
Récompense variable (le mécanisme de la machine à sous), peur de perdre la série,
urgence artificielle fabriquée par le compte à rebours, notification quotidienne
obligatoire. Chacun de ces quatre leviers est efficace, mesurable en rétention, et
nuisible à l'élève. Je les refuse.

### Ce que j'accepte de construire à la place — quatre leviers durables

| Levier | Ce que c'est | Pourquoi c'est durable |
|---|---|---|
| **La porte de 2 minutes** | chaque jour une action minuscule, déjà existante | l'entrée ne demande aucune décision |
| **Le capital visible** | jours actifs **et** erreurs fermées, montrés comme un acquis | c'est le seul chiffre qui monte même quand la série tombe |
| **L'identité** | « quelqu'un qui vérifie ses erreurs », pas « quelqu'un qui a 14 » | *Atomic Habits* : on ne tient pas une habitude contre son identité |
| **Le relais humain** | un relevé hebdomadaire remis à une personne | le chapitre 5, et le seul chaînon totalement absent |

Ce que je défends, ce n'est donc pas « addictive ». C'est : **le retour que
l'élève ne décide plus.** Il n'ouvre pas l'application parce qu'il a été hameçonné
— il l'ouvre parce que c'est devenu, comme se laver les dents, la chose qu'il fait
sans délibérer.

Note la différence, elle est mesurable : un produit addictif fabrique des sessions
longues et un abandon brutal ensuite ; un produit-habitude produit des sessions
**courtes** et un **retour** qui ne se dément pas. Les indicateurs du paragraphe 8
sont choisis pour distinguer les deux.

---

## 7. À quoi ça ressemble, concrètement

**Aujourd'hui** — l'élève n'est pas venu mardi. Mercredi soir, la bulle dit :

> « فُتت يومًا واحدًا. لا تُفَوّت يومين. سؤال واحد فقط، الآن. »

S'il la ferme, elle se taît six heures. Jeudi, si rien n'a bougé : **la même
phrase.** C'est tout ce que le système sait faire.

**Avec la boucle** — mardi échoue (issue : *expirée*). Mercredi, le coach sait
que la demande d'une séance a échoué **et** que l'erreur dominante est
`CONFUSION_ADN_ARNM`. Il n'essaie plus une séance, il essaie la plus petite
chose :

> « سؤال واحد فقط عن ARNm. أجب بكلمة، ثم أغلق. » *(Une question. Rien d'autre.)*

L'élève répond. Le coach **ferme l'erreur** (`oublierErreur`, aujourd'hui jamais
appelée), l'**écrit dans son capital** et le lui dit :

> « خطأ واحد خرج من دفترك نهائيًّا. هذا لا يُلغيه أيُّ يوم تفوته. »

S'il ne répond pas non plus : jeudi, la demande devient minimale, et le **relevé
part vers la personne** qu'il a désignée. Le coach n'a pas échoué — il a utilisé
les quatre niveaux avant de passer la main.

**La différence entre les deux scènes n'est pas le ton, ni le texte.** C'est que
dans la seconde, **quelque chose est su et quelque chose est fermé.** Le premier
Morchid parle ; le second se souvient.

---

## 8. Les cinq indicateurs honnêtes — et ceux que je refuse

**Acceptés :**

1. **Retour J+1, J+7, J+21** — la seule mesure d'habitude.
2. **Erreurs fermées définitivement** — le capital qui ne se remet pas à zéro.
3. **Erreurs rouvertes** — le révélateur de l'illusion : une erreur « fermée »
   qui revient prouve que le diagnostic était faux.
4. **Conseils suivis / conseils donnés** — le taux de réussite du coach lui-même.
5. **Taux de silence** — un coach qui parle tout le temps est du bruit ; celui-ci
   doit être **élevé**.

**Refusés, explicitement :** minutes passées, nombre de clics, nombre de messages
envoyés, longueur de la série comme victoire, « engagement ». Ce sont les cinq
chiffres qui pousseraient l'équipe à prendre les décisions que le paragraphe 6
interdit.

---

## 9. L'ordre de construction — du moins cher au plus lourd

Aucune de ces cinq étapes ne demande d'inventer du contenu. Toutes utilisent ce
qui est déjà dans le dépôt.

1. **Fermer la boucle.** Tracer chaque prescription et son issue ; brancher
   `oublierErreur` quand une erreur est réellement réglée. *Le moins cher, le plus
   rentable : sans lui, tout le reste parle dans le vide.*
2. **Un seul état de l'élève.** Assembler les sept familles de signaux **une
   fois**, dans un module unique, au lieu que chaque consommateur relise sa part.
3. **Les phases déduites.** Brancher la date du BAC sur le conseil (elle est
   affichée aujourd'hui, elle ne décide rien).
4. **L'escalade.** Les quatre niveaux, et la règle des trois échecs d'une même
   phrase → changement de méthode.
5. **Le relevé humain.** Le chaînon absent, et le plus fort levier de retour qui
   ne soit pas un piège.

**Ce qu'il ne faut pas faire en même temps** : ajouter du contenu, une nouvelle
rubrique, ou une sixième échelle de révision. Le produit a déjà plus d'organes que
de connexions — c'est le constat qui traverse les trois derniers audits, et c'est
encore vrai ici.

---

## 10. Le test qui tranchera

Dix élèves de 3AS, vingt et un jours, les mêmes dix au début et à la fin. On
mesure : retour J+2, J+7, J+21, erreurs fermées, conseils suivis, et le taux de
silence.

**Mon engagement, écrit d'avance :** si, à la fin, le taux de conseils suivis est
inférieur à un sur trois, alors le problème n'est ni le moteur, ni le contenu, ni
l'algorithme — ce sera le **moment** ou la **taille de la demande**. Et ce sera
écrit, daté, avec le chiffre brut.

**Aujourd'hui, ce test affiche zéro** — non parce que le coach est mauvais, mais
parce qu'aucun élève réel n'a jamais utilisé cette application. C'est encore le
seul chiffre qui compte, et il n'a pas bougé depuis l'audit du 14 octobre.
