# Qualité du Tuteur Morchid — audit interne mesuré

**14 octobre 2026** · Branche `arena/92300c1d-kunz-el-ouloum` · Moteur : `src/smartTutorEngine.ts` (2 443 lignes, 62 fonctions, 178 conditions, 73 sorties anticipées)

> Demande : « analyse la qualité du tutor Morchid ». Ce document ne juge pas le **personnage** (القبطان, sa bulle, ses messages)
> mais le **moteur qui répond** : ce que l'élève reçoit réellement quand il écrit.

**Note globale : 54 / 100.** Le socle de contenu est solide et honnête ; la **conduite de dialogue** — ce qui fait
qu'un professeur est un professeur — est presque absente. Détail en §5.

---

## 1. Méthode, et ce qu'elle ne mesure pas

4 lots de saisies arabes réalistes passés dans `processStudentInput` (session avec domaine actif), puis relevé du
chemin pris, du type de source, de la confiance, de la longueur et du texte :

| Lot | Contenu | Volume |
|---|---|---|
| Boutons | les 19 `quickActions` réellement pressées par l'élève | 13 distincts |
| Cours | questions de cours libres (ما هو / كيف / لماذا / اشرح / قارن) | 30 |
| Gestes de dialogue | salutations, remerciements, fatigue, « je n'ai pas compris », « répète », stress | 18 |
| Fidélité au domaine | 23 questions dont le domaine ne prête à aucune ambiguïté | 23 |
| Fautes & dialecte | `واش`, `علاش`, `الستنساخ`, `التركيب الضويي`, `كيفاش` | 7 |
| Hors discipline | football, cuisine, politique | 4 |

**Ce que cette mesure ne peut pas dire — et c'est la limite la plus grave :** aucun élève n'a jamais utilisé cette
application. Tout ce qui suit est mesuré sur le moteur, pas sur un cerveau d'élève. Un tuteur peut être fidèle au
domaine et rester pédagogiquement inutile ; seule une cohorte réelle trancherait.

---

## 2. Les chiffres

| Indicateur | Valeur | Lecture |
|---|---|---|
| Réponses portant une source nommée | 39/43 (91 %) | tout est traçable, rien n'est inventé |
| **Fidélité au domaine de la question** | **19/23 (83 %)** | **4 réponses servies hors du domaine**, 1 fausse alerte de ma métrique |
| **Gestes de dialogue refusés** | **10/11 (91 %)** | « السلام عليكم », « شكرا », « مافهمت والو » → hors programme |
| **Aveu d'ignorance** | **0/43** | le moteur répond toujours *quelque chose* |
| Refus « خارج المقرر » | 16/43 (37 %) | dont 10 sur des gestes humains |
| Réponses distinctes | 24/43 (56 %) | **44 % de réponses dupliquées** |
| Longueur des réponses | médiane 204, max 837 caractères | calibré mobile, bon |
| Latence | 0,1 – 16 ms (médiane ~2,5 ms) | excellent, aucune attente perceptible |
| Socle documentaire | 547 extraits, 154 193 caractères | suffisant pour le programme |
| Fiches de cours curatées | **11** | grossier : un bouton par unité, une fiche par domaine |

---

## 3. Le diagnostic en une phrase

**Le Tuteur Morchid est aujourd'hui un moteur de recherche documentaire fiable, avec un vestige socratique —
pas un tuteur.** Il excelle à retrouver un contenu et refuse tout ce qui n'est pas une question de contenu.
Or un professeur est précisément celui qui **entend autre chose que des questions** : « je n'ai pas compris »,
« je suis fatigué », « répète », « je ne sais pas par où commencer ».

---

## 4. Forces — mesurées, pas supposées

1. **Aucune invention.** 91 % des réponses portent une source nommée ; le moteur n'a pas de modèle génératif, donc
   pas d'hallucination possible. Sur un outil de révision du Bac, c'est un choix d'architecture qui protège l'élève.
2. **Fidélité au domaine sur les questions bien formées : 83 %.** « ما هو الاستنساخ؟ », « اشرح كمون الراحة »,
   « ما هي الموجات الزلزالية؟ » partent dans le bon domaine.
3. **Latence 0,1–16 ms.** L'élève n'attend jamais. Aucun concurrent local ne fait mieux.
4. **Longueur médiane 204 caractères.** Ce n'est pas un mur de texte : c'est lisible sur un téléphone, en RTL, en
   quinze secondes. Beaucoup d'applications de révision échouent là.
5. **La sonde avant le contenu (KEO-103)** : 20 questions de cours sur 30 ne livrent pas la fiche d'emblée. C'est
   rare, c'est défendable pédagogiquement, et c'est le seul endroit où le moteur fait travailler l'élève avant de
   lui donner.
6. **Robustesse dialecte/faute correcte sur le contenu** : `واش هو الاستنساخ`, `الستنساخ` (faute de frappe),
   `علاش الاستنساخ في النواة؟` sont tous résolus vers la bonne fiche.

---

## 5. Faiblesses — par gravité, chacune avec sa preuve

### 5.1 Le moteur préfère une RÉPONSE FAUSSE au silence — et ne se tait jamais (CRITIQUE)

Sur 43 saisies, **aucune** n'a produit « لم أجد إجابة دقيقة في قاعدتي المحلية » : le moteur répond toujours
quelque chose, même quand il n'a rien. Trois réponses servies avec confiance 70 :

| Saisie de l'élève | Ce qu'il reçoit |
|---|---|
| `كيف تتشكل الجبال؟` (géologie) | un cours sur **l'ADN et la transcription** |
| `ما هي البنيات الجيولوجية؟` (géologie) | un QCM sur les **structures secondaires d'une protéine** (α, β) |
| `ما هي البؤرة الزلزالية؟` (séismes) | une photo de **polysome pendant la traduction** |
| `لماذا للتنفس مردود أعلى؟` (énergétique) | une question sur les **groupes sanguins (O⁻)** |

Les quatre sont **reproductibles** : chaque saisie a été rejouée deux fois, en isolation complète
(`localStorage` vidé entre chaque appel) — même réponse les deux fois. Ce n'est pas un aléa.

**La preuve tient au mot lui-même, et c'est instructif.** Sur `ما هي البنيات الجيولوجية؟`, le moteur part sur
`بنيات` — qui veut dire *structures* — et sert « 1. ماذا يُظهر النموذج الشريطي للبروتين ؟ أ) **البنيات الثانوية**
(لوالب α وأوراق β) ». Le score par recouvrement de mots est élevé parce que le mot est bien là. **Ma propre
métrique s'est fait piéger exactement pareil** : elle comptait `ما هي البنيات الجيولوجية؟` comme réussie parce que
`بنيات` figurait dans le texte servi. Un humain qui relit la réponse voit l'erreur ; un score, non. C'est pour ça
qu'un seuil ne suffira pas seul : il faudra aussi **pondérer les mots passe-partout** (`بنيات`, `بنية`, `دور`,
`نشاط`, `علاقة`) qui n'identifient aucun chapitre.

**Cause identifiée** (`searchAllBases`, L731) : `score >= 12`, tri décroissant, **on sert toujours le premier
extrait**. Aucun seuil haut, aucun écart exigé avec le deuxième candidat, et une confiance plancher de 70 quel que
soit le score (`confidence: 70`, L836).

**Pourquoi c'est plus grave que le bug « صح » corrigé aujourd'hui :** le bug rapporté donnait 0 % et une étiquette
absurde — l'élève voyait que ça n'allait pas. Ici, l'élève reçoit un texte **plausible, bien écrit, issu d'un cours
réel**, sur un autre chapitre. Il l'apprend. C'est le seul défaut de cette liste qui peut **faire perdre des points
au Bac**.

### 5.2 Les gestes de dialogue sont refusés comme du hors-programme (CRITIQUE)

10 gestes humains sur 11 reçoivent le même refus de 156 caractères :

| L'élève dit | Le tuteur répond |
|---|---|
| `السلام عليكم` | « ❓ هذا السؤال خارج قاعدة علوم الطبيعة والحياة » |
| `شكرا` / `بارك الله فيك` | idem |
| `أنا تعبان` / `راني عيان` | idem |
| `مافهمت والو` | idem |
| `أعد من فضلك` | idem |
| `رسبت في الفرض` | idem |
| `كيفاش ندير` | idem |

Les trois phrases les plus fréquentes d'un élève en difficulté — *je n'ai pas compris, répète, je suis fatigué* —
sont exactement celles que le tuteur rejette. Le refus est légitime pour Messi ou la politique ; il est
**pédagogiquement absurde** pour `مافهمت والو`.

Il existe un embryon de couche affective (`أنا خايف من الباك` → « سمعتك. القلق قبل البكالوريا طبيعي… », 274 car.)
mais il est déclenché par quelques mots-clés, il n'attrape pas `مازال ما فهمتش` (auquel il répond par… le message
sur le stress), et il ne couvre aucun des gestes ci-dessus.

### 5.3 L'adaptation est cosmétique : la sonde est un portillon, pas un diagnostic

Test décisif — même question, deux réponses opposées à la sonde :

| Réponse de l'élève | Ce qu'il reçoit |
|---|---|
| `في النواة` (juste) | `✅ إجابتك في محلّها` + **corps de fiche A** |
| `في الهيولى` (faux) | `📌 إجابتك غير موفقة — الجواب المنتظر: النواة` + **corps de fiche A, identique à l'octet** |

Vérifié par comparaison programmatique : `même corps de fiche ? true`. La sonde **filtre** l'accès au contenu,
elle ne **l'adapte pas**. L'élève qui se trompe sur le lieu de la traduction reçoit exactement le même texte que
celui qui a juste — alors que le seul intérêt de poser la question est de savoir *quoi* corriger.

### 5.4 Monotonie : 44 % des réponses sont identiques

24 textes distincts pour 43 saisies. Un même refus de 156 caractères sert 16 fois. Le tuteur dit très peu de
choses de très peu de façons — sur une application utilisée quotidiennement pendant des mois, l'élève reconnaîtra
les réponses avant de les lire, et la loi n° 1 du livre qu'il a lui-même fourni s'applique : **un signal répété à
l'identique cesse d'être un signal.**

### 5.5 Granularité incohérente : les boutons promettent plus que les fiches

- **11 fiches** pour tout le programme du Bac, alors que le menu expose des entrées fines.
- Les boutons `راجع المرحلة الكيميوضوئية` et `راجع حلقة كالفن` renvoient **le même texte à l'octet** (une seule
  fiche « التركيب الضوئي », 530 caractères). Deux boutons distincts, une seule réponse.
- `راجع تركيب البروتين (الاستنساخ والترجمة)` — le bouton qui dit « révise la fiche » — renvoie un guide
  « التجارب الأساسية » de 837 caractères, **pas la fiche**.

Un bouton qui ne fait pas ce qu'il annonce éduque l'élève à ne plus cliquer.

### 5.6 Le refus avale aussi les questions de méthode

`كيف أحضر للباك؟` → « خارج قاعدة علوم الطبيعة والحياة ». C'est une question **sur l'application de la
discipline**, traitée par le module de méthodologie (`كيف أراجع بفعالية؟` fonctionne) : l'intention n'est pas
reconnue, et la réponse par défaut est un refus.

### 5.7 Dette structurelle : 178 conditions et 73 sorties pour une seule fonction

`processStudentInput` est un escalier de 2 443 lignes. Le bug rapporté aujourd'hui en est la conséquence directe :
un état qui survit à son contexte, un bloc d'écoute placé sous un autre guichet. Chaque correctif ajoute une
marche et rend le suivant plus risqué. Ce n'est pas un défaut visible par l'élève — c'est le défaut qui fabrique
les défauts.

---

## 6. Note par axe

| Axe | Note | Justification chiffrée |
|---|---|---|
| Exactitude du contenu servi | **62** | 83 % fidèle au domaine ; 3 réponses carrément fausses |
| Conduite de dialogue (entendre l'élève) | **15** | 10/11 gestes humains refusés |
| Pédagogie socratique | **70** | sonde avant contenu, triade, escalier d'indices — mais sonde non adaptative |
| Honnêteté intellectuelle du moteur | **25** | 0 aveu d'ignorance sur 43 saisies ; confiance 70 plancher non méritée |
| Traçabilité des réponses | **92** | 91 % de sources nommées, aucune génération libre |
| Couverture du programme | **75** | 547 extraits / 154 k caractères, mais 11 fiches seulement |
| Mémoire de l'élève | **60** | erreurs, profil, série, cumul — mais aucune mémoire du fil de la conversation |
| Expérience technique (mobile) | **90** | latence < 16 ms, médiane 204 caractères, RTL |
| **Global** | **54** | **la plomberie est bonne, la conduite ne l'est pas** |

---

## 7. Verdict

Cet audit n'est pas un mauvais verdict pour le travail accompli : **le contenu est propre, traçable et rapide**, ce
qui est la partie que la plupart des projets ne font jamais correctement. Mais le mot « tuteur » désigne celui qui
**comprend la situation de l'élève**, et c'est précisément la partie absente. Aujourd'hui, Morchid sait *quoi*
répondre. Il ne sait pas encore *à qui*.

Les deux chantiers qui changent tout, dans l'ordre :

1. **Le silence honnête** (§5.1) — cesser de servir au hasard un cours d'un autre chapitre.
2. **Les gestes de dialogue** (§5.2) — entendre « je n'ai pas compris » avant d'entendre « quelle est la
   structure de l'ADN ».

Ces deux-là ne demandent aucune données nouvelle, aucun contenu nouveau, aucun modèle génératif : ils demandent
des règles et des tests. Le socle nécessaire existe déjà.

---

## 8. Recommandations, par rapport impact / effort

| # | Action | Impact | Effort | Règle à poser |
|---|---|---|---|---|
| 1 | **Seuil d'ignorance honnête** : exiger un score minimal **et** un écart sur le 2ᵉ candidat, sinon `لم أجد في دروسي — أي وحدة تقصد؟` + confiance calculée, jamais plancher 70 | ★★★ | faible | on ne sert jamais un extrait « le moins mauvais » |
| 2 | **Couche dialogue (12 gestes)** : salutation, remerciement, fatigue, incompréhension, « répète », « plus simple », stress, échec, « par où commencer » | ★★★ | moyen | un geste humain n'est **jamais** du hors-programme ; le refus est réservé aux questions hors discipline |
| 3 | **Sonde adaptative** : si l'élève se trompe, ouvrir la fiche par la phrase qui contredit sa croyance | ★★ | moyen | la question posée doit changer la réponse donnée, sinon elle est décorative |
| 4 | **Redécouper les fiches** à la maille des boutons (1 bouton = 1 contenu) | ★★ | moyen | un bouton qui ment n'est pas cliquable deux fois |
| 5 | **Rendre ce banc permanent** : les 23 questions du §9 en test de non-régression du domaine | ★★ | faible | un domaine de question est un invariant, pas une impression |
| 6 | Découper `processStudentInput` en guichets nommés et testables | ★ | élevé | l'emplacement d'un bloc *est* une décision d'architecture |
| 7 | **Mesurer avec de vrais élèves** | ★★★ | — | aucun test ne remplace une cohorte |

---

## 9. Annexe — le banc de fidélité au domaine (23 questions)

Devient le test du §8.5. Domaine attendu : D1 protéines/génétique · D2 énergétique · D3 géologie.

**D3** : `ما هي بنية الكرة الأرضية؟` · `ما هي الموجات الزلزالية؟` · `اشرح الغوص` · `كيف تتشكل الجبال؟` ✗ ·
`ما هي البنيات الجيولوجية؟` ✗ · `ما هي الصفائح التكتونية؟` · `ما هو الوشاح؟` · `كيف نحدد باطن الأرض؟` ·
`ما هي البؤرة الزلزالية؟` ✗

**D2** : `ما هو التركيب الضوئي؟` · `ما هي حلقة كالفن؟` · `اشرح التنفس الخلوي` · `قارن بين التنفس والتخمر` ·
`ما هو ATP؟` · `لماذا للتنفس مردود أعلى؟` ✗

**D1** : `ما هو الاستنساخ؟` · `اشرح الترجمة` · `ما دور ARN بوليميراز؟` · `ما هي الاستجابة المناعية؟` ·
`ما هو الاتصال العصبي؟` · `ما هي الحمولة الوراثية؟` · `لماذا يتأثر الإنزيم بالحرارة؟` · `ما هو النشاط الإنزيمي؟`

✗ = réponse servie hors du domaine attendu : **4 cas sur 23**, tous reproductibles (voir §5.1).
Fausse alerte de la métrique : `ما هي الصفائح التكتونية؟` avait été comptée en échec parce que le texte servait le
pluriel `صفائح` là où ma liste attendait `صفيحة` — le contenu, lui, était correct.

---

## 10. Suivi du correctif — mesuré le même jour (commit `614f541` + le suivant)

Cet audit a été suivi de la correction des recommandations 1 (silence honnête) et
2 (couche dialogue). Les chiffres ci-dessus décrivent l'AVANT ; les voici mis à
jour par le même banc, la même heure, sur le même corpus.

| Mesure (banc de 43 saisies) | Avant | Après |
|---|---|---|
| Refus « hors programme » | **16** | **3** |
| dont gestes humains (bonjour, merci, « je n'ai pas compris »…) | **10** | **0** |
| Aveux d'ignorance explicites | **0** | 1 |
| Textes distincts pour 43 saisies | 24 | 31 |
| Longueur médiane d'une réponse | 204 car. | 212 car. |
| Réponses servies HORS du domaine (banc de 23 questions) | **4** | **0** |
| Fidélité mesurée par mots-clés (même banc) | 19/23 | 22/23 † |

Les 3 refus restants sont les seuls légitimes : `من هو ميسي؟`, `كيف أطبخ الكسكس؟`,
`ما رأيك في السياسة؟`.

† Les deux lignes mesurent deux choses différentes, et je ne les confonds pas.
La première est le défaut de l'audit — une réponse tirée d'un AUTRE chapitre — et il
est éteint : 4 → 0 sur les 23 questions. La seconde est ma métrique grossière par
mots-clés : elle compte encore un échec sur `ما هي الصفائح التكتونية؟`, où le texte
répond « صفائح الغلاف الصخري » et ma liste de mots-clés attendait « صفيحة ». Le
contenu est correct ; c'est l'instrument qui est myope. Le verrou permanent
(`tutorFideliteDomaine.test.ts`) juge donc sur l'appartenance au domaine, pas sur
une liste de mots que je choisis moi-même.

### 10.1 Cause racine trouvée en corrigeant

Le point d'interrogation arabe `؟` était **inclus dans le bloc de caractères
`U+0600–U+06FF`** que `tokenizeArabic` prenait pour des lettres. Conséquence :
dans `الجبال؟`, le dernier mot était le jeton `الجبال؟` — qui ne pouvait
correspondre à aucun mot-clé, aucun titre, aucun vocabulaire. **Le dernier mot de
chaque question interrogative était donc invisible au moteur**, et le défaut ne
se signalait jamais, puisqu'il ne faisait pas d'erreur : il appauvrissait
silencieusement toutes les correspondances.

Effet secondaire mesuré : 740 mots-clés de `lessonIndex.ts` étaient stockés avec
leur ponctuation collée et étaient donc inutilisables. L'index a été régénéré par
le script officiel (`npm run` du générateur) : mêmes identifiants, mêmes textes,
mêmes titres, 9 713 mots-clés dont 0 ponctué. Le verrou `lessonIndex.lock.test.ts`
qui exige la parité avec les sources l'a confirmé.

### 10.2 Ce qui n'a PAS été corrigé — à dire franchement

- **La sonde socratique reste non adaptative** (§5.4) : répondre `في النواة` ou
  `في الهيولى` produit un corps de fiche identique à l'octet. La sonde trie
  l'élève (il a essayé / il n'a pas essayé), elle ne vérifie pas sa réponse.
  C'est le premier usage détourné du dispositif : un élève qui répond au hasard
  passe pour un élève qui a cherché.
- **`لماذا للتنفس مردود أعلى؟`** reçoit un extrait d'un autre chapitre du même
  domaine : le corpus n'indexe pas ce terme, et l'aveu d'ignorance ne se déclenche
  pas puisque la correspondance dépasse le seuil. C'est le compromis assumé du
  filtre de domaine : il élimine le hors-sujet grossier, pas l'imprécision fine.
- **`processStudentInput` reste un bloc de ~2 000 lignes** (§5.6) : la couche
  gestes a été isolée en modules purs, ce qui réduit la douleur sans traiter la
  cause.
- **Aucun élève réel n'a jamais utilisé cette application.** Tout ce document
  mesure le comportement du moteur, pas son effet sur un apprenant. Le seul angle
  que je ne peux pas instruire ici — et de loin le plus important.
- **Les fiches ne sont pas redécoupées** (§5.5) : la réponse reste longue pour un
  élève qui décroche après trois lignes.
