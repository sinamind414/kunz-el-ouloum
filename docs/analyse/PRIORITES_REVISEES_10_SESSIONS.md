# Quelles leçons travailler en premier — la réponse après dix sessions du BAC

> Document du sprint 37. Il **révise** `PLAN_LECONS_A_RENFORCER.md`, établi aux
> sprints 1-4 à partir des chaînes YouTube (vues, commentaires, durée des
> cours) et de la difficulté ressentie. Ce qui suit vient d'une autre source :
> **59 exercices des sujets officiels ONEC, sessions 2017 à 2026**, dépouillés
> un par un (`src/data/bacSessionIndex.ts`).
>
> Les chiffres publiés ici sont verrouillés par
> `src/data/prioritesMesurees.sync.test.ts` : si le corpus change et que le
> document ne suit pas, le test échoue.

## 1. Comment lire les deux colonnes

- **Points menés** : points de l'exercice attribués à l'unité qui le *porte*.
  Un exercice de 8 points sur l'immunité compte 8 pour U4.
- **Apparitions** : nombre d'exercices où l'unité intervient, y compris en
  second rôle. C'est la mesure de son caractère **transversal**.

Une unité peut donc peser peu en points menés et être partout — c'est
précisément le cas qui a été manqué en 2017-2024 par les classements fondés
sur le ressenti.

## 2. Le classement mesuré (2017 → 2026)

| Unité | Points menés | Part | Poids annoncé | Apparitions | Sessions |
|---|---|---|---|---|---|
| **U4 المناعة** | 82 | 20,8 % | 13 % | 13 | 10/10 |
| **U1 تركيب البروتين** | 75 | 19,0 % | 10 % | **17** | 10/10 |
| **U5 الاتصال العصبي** | 74 | 18,7 % | 16 % | 11 | 10/10 |
| **U3 النشاط الإنزيمي** | 58 | 14,7 % | 13 % | 15 | 10/10 |
| U6 التركيب الضوئي | 51 | 12,9 % | 20 % | 7 | 6/10 |
| U2 بنية/وظيفة | 22 | 5,6 % | 9 % | 13 | 9/10 |
| U7 تحويل الطاقة | 13 | 3,3 % | 19 % | 4 | 4/10 |
| U8 à U11 | 5 chacune | 1,3 % | 5 % | 1 à 5 | 1 à 4 |

## 3. Ce que la liste initiale avait juste — et ce qu'elle a manqué

**Juste : U4.** L'immunité était première au classement ressenti (coopération
immunitaire, CMH/ABO) ; elle est première à l'épreuve. Les deux méthodes
convergent, et le travail des sprints 5-15 sur cette unité était bien placé.

**Le grand oubli : U1, synthèse des protéines.** Absente des cinq priorités
initiales. Elle mène **19 % des points** et apparaît dans **17 exercices sur
59** — l'unité la plus omniprésente du programme.

L'explication de l'angle mort est intéressante : les classements initiaux
mesuraient la **difficulté ressentie** (recherches YouTube, vues des cours).
Or U1 n'est pas *ressentie* comme difficile — elle est enseignée tôt, elle
paraît mécanique. Personne ne cherche « شرح الترجمة » à trois semaines du BAC.
Elle tombe pourtant chaque année, seule ou en support d'un exercice
d'immunologie, de pharmacologie ou de génétique.

**Second oubli : U5, communication nerveuse.** 18,7 % des points, présente sur
les 10 sessions, 11 exercices. Même mécanisme d'angle mort.

**À requalifier : U2 (pHi, acides aminés).** Première au classement de
difficulté ressentie (73), elle ne mène que **5,6 %** des points… mais apparaît
dans **13 exercices**. Conclusion : ce n'est pas une unité vedette, c'est une
**compétence transversale** — savoir lire une charge, une migration, un niveau
structural sert dans les exercices des autres unités. Le travail fait sur le
simulateur pH → charge → migration reste justifié ; son cadrage change.

**Surévaluée par le programme : U7.** 19 % annoncés, **3,3 %** constatés sur dix
ans, 4 sessions concernées seulement. Un élève qui suit la répartition
officielle y passe environ six fois trop de temps.

**Irrégulière : U6.** 12,9 % des points mais seulement **6 sessions sur 10**.
C'est le profil « tout ou rien » : quand elle tombe, elle porte un exercice de
7 ou 8 points. Elle mérite d'être sue, pas d'être sur-travaillée.

## 4. Les cinq priorités révisées

1. **U4 المناعة** — 82 pts, toutes les sessions. Confirmée.
2. **U1 تركيب البروتين** — 75 pts, 17 apparitions. *Nouvelle entrée, et la plus
   importante du réexamen.*
3. **U5 الاتصال العصبي** — 74 pts, toutes les sessions. *Nouvelle entrée.*
4. **U3 النشاط الإنزيمي** — 58 pts, 15 apparitions. La « clé cachée » : elle
   mène 8 exercices mais en éclaire 15.
5. **U6 التركيب الضوئي** — 51 pts, mais irrégulière : à sécuriser, pas à
   sur-investir.

**En transverse, et non en cinquième place : U2** — charge, pHi, niveaux
structuraux ; 13 apparitions dans les exercices des autres unités.

## 5. Ce que l'application en fait déjà

- le **plan de révision** ne suit ni le poids annoncé ni la pression mesurée,
  mais leur **moyenne** (`unitWeight`, sprint 18) — pour corriger l'erreur sans
  parier sur la reconduction exacte de dix ans d'histoire ;
- les **montages récurrents** (12) et le **décodeur de consignes** (12 familles)
  transforment ce classement en gestes : le même corpus dit quoi réviser *et*
  comment rédiger ;
- l'**écho BAC** affiche, sur chaque capsule, situation et schéma, les sessions
  où la notion est tombée.

## 6. Limite honnête de ce document

Dix sessions, c'est robuste pour une tendance, insuffisant pour une loi. U9,
U10 et U11 n'apparaissent que sur une ou deux sessions du corpus : leur 1,3 %
ne signifie pas qu'elles ne tomberont pas cette année — il signifie que le
corpus ne permet pas de les classer. Les unités du domaine 3 conservent donc un
poids plancher dans le plan, et ce document ne recommande pas de les
abandonner.
