# Audit approfondi de Morchid — déterminisme, routage, performance et exactitude

**Date :** 5 octobre 2026  
**Version auditée :** `40ce78fac0b811748071c4e7373fce204b814625`  
**Périmètre :** moteur local Morchid, interface, normalisation arabe, recherche lexicale/floue, quiz, missions, défis BAC, persistance et corpus directement servis par Morchid.  
**Position d'audit :** élève algérien de 3AS Sciences expérimentales préparant le BAC.

> **Mise à jour corrective du 5 octobre 2026 :** les défauts P0 et plusieurs P1 décrits ci-dessous ont été corrigés après la mesure initiale. Le texte de l'audit conserve les preuves de l'état observé ; voir la section 12 pour l'état post-correctifs et les validations finales.

---

## 1. Verdict sans complaisance

**Morchid est rapide et utile pour des questions canoniques, mais il n'est ni globalement déterministe, ni assez fiable pour être présenté comme un correcteur ou un routeur pédagogique infaillible.**

| Axe | Verdict | Note indicative |
|---|---|---:|
| Déterminisme d'une question isolée, hors quiz/temps | Bon | 8/10 |
| Déterminisme global de l'expérience | Insuffisant | 4/10 |
| Performance à chaud | Bonne | 8/10 |
| Routage lexical sur formulations canoniques | Bon | 7/10 |
| Routage adversarial / négation / hors-programme | Fragile | 4/10 |
| Cohérence quiz ciblés | **Défectueuse** | 2/10 |
| Missions et personnalisation | Partiellement fictives | 3/10 |
| Alignement au programme MEN | Inégal | 5/10 |
| Exactitude scientifique du corpus servi | Correcte en majorité, mais non certifiable | 6/10 |
| Qualité des tests | Nombreux tests, angles morts importants | 7/10 |

### Les quatre faits décisifs

1. **Le même prompt statique produit la même action** : 20 requêtes représentatives × 20 répétitions ont donné une seule variante chacune.
2. **« اختبرني في … » n'est pas déterministe** : 100 appels ont produit 6 questions différentes pour `الغوص`, 8 pour `الاستنساخ` et 11 pour `التنفس الخلوي` (`Math.random`, `smartTutorEngine.ts:1667`).
3. **Le quiz ciblé est logiquement cassé** : il annonce le nombre de questions du sujet, puis avance dans toute la banque du domaine. Il peut poser des questions d'autres chapitres et afficher un résultat sur 8 après seulement 2 questions.
4. **Le moteur possède des contenus explicitement hors programme, sans exploiter son propre registre `NON_EXIGIBLES`** : `المتمم`, `نضج ARNm` et `مبدأ الأسيلوسكوب` sont marqués non exigibles dans `curriculumOfficial.ts:35-42`, mais Morchid peut enseigner les deux premiers sans avertissement.

**Décision produit :** Morchid peut rester un **guide local de révision** après correction des défauts P0/P1 ci-dessous. Il ne doit pas être vendu, dans cet état, comme une IA qui « comprend » la question, comme un moteur parfaitement déterministe, ni comme une autorité scientifique ou réglementaire autonome.

---

## 2. Ce qui a réellement été testé

### 2.1 Exécutions

- script reproductible : `scripts/audit_morchid_runtime.ts` ;
- 2 000 appels chronométrés après échauffement ;
- 20 répétitions de 20 formulations statiques ;
- 100 tirages par commande de quiz sur trois sujets ;
- sondes hors sujet, négations, termes courts, contenus non exigibles et formulations hybrides ;
- trois parcours complets de quiz ciblé avec `Math.random` contrôlé ;
- import froid du moteur via `tsx` ;
- suites ciblées Vitest de Morchid/UI.

### 2.2 Résultats automatisés

```text
8 fichiers de tests passés
114 tests passés
Durée Vitest : 20,24 s
```

Le comptage lexical trouve 134 blocs `it/test` dans les fichiers demandés, mais Vitest en exécute 114 : le chiffre de référence est donc **114 tests réellement exécutés**, pas 134.

### 2.3 Limites honnêtes

- Pas d'outil de navigateur graphique disponible : **aucune capture d'écran annotée nouvelle** ne peut être fournie honnêtement.
- Pas de téléphone Android réel, TalkBack, 3G algérienne, mesure de batterie ni profilage Chrome : les performances mesurées sont celles de Node dans le sandbox, pas celles d'un téléphone d'entrée de gamme à Oran.
- La recherche publique n'a pas retrouvé le PDF MEN exact sur le domaine officiel. L'alignement détaillé repose sur les copies locales tracées du guide et de la progression 2017. Le portail MEN confirme l'existence de ses ressources pédagogiques officielles, mais ne permet pas ici de certifier chaque page : <https://www.education.gov.dz/category/ressources-pedagogiques/livres-scolaires/>.
- Des miroirs algériens recensent le guide 3AS, sans être des sources ministérielles primaires : <https://www.dzexams.com/ar/documents/emdGRnRsbTZyR05iUHQyd3prUFZKQT09>.

---

## 3. Déterminisme : ce qui l'est et ce qui ne l'est pas

### 3.1 Déterministe

#### Normalisation

`normalizeArabic()` (`arabicNormalize.ts:1-14`) applique une chaîne pure : minuscules, retrait des diacritiques/tatweel, unification de أ/إ/آ, ى, ة, ؤ, ئ, ponctuation et espaces. Aucun état externe n'intervient.

#### Fuzzy matching

- Levenshtein bornée : `arabicNormalize.ts:46-72` ;
- budget 0 faute jusqu'à 3 caractères, 1 jusqu'à 6, puis 2 : `:76-79` ;
- retrait optionnel de l'article `ال` : `:86-94` ;
- recouvrement lexical : `:100-107`.

Ces fonctions sont pures et déterministes.

#### Ordre des options QCM

`shuffledView()` (`smartTutorEngine.ts:142-159`) utilise FNV-1a sur l'identifiant de question puis un LCG. Pour un même `q.id`, l'ordre des options et le nouvel index correct sont stables. C'est un bon choix : la correction utilise le même `shuffledView()` à `:904`.

#### Réponses statiques

Pour 20 formulations répétées 20 fois, hors état temporel et tirage de quiz : **1 hash de sortie par formulation**. Exemples :

- `ما هو الاستنساخ؟` : 1 variante ;
- `كيف يحدث التركيب الضوئي؟` : 1 ;
- `كيف أحلل وثيقة؟` : 1 ;
- `من هو ميسي؟` : 1 ;
- `راني خايف من الباك` : 1.

### 3.2 Non déterministe

#### Sélection initiale du quiz ciblé

`smartTutorEngine.ts:1665-1668` construit un pool de sujet puis choisit avec `Math.random()`. Mesures sur 100 appels :

| Commande | Questions distinctes |
|---|---:|
| `اختبرني في الغوص` | 6 |
| `اختبرني في الاستنساخ` | 8 |
| `اختبرني في التنفس الخلوي` | 11 |

Ce hasard n'est ni seedé, ni injecté, ni journalisé. Deux élèves avec le même état et la même entrée n'obtiennent pas la même première question.

#### Mission quotidienne

`pickRandomQuizForTopic()` utilise aussi `Math.random()` (`smartTutorEngine.ts:1909-1913`), appelé à `:2022`. À cible identique, le QCM de mission varie.

#### Horloge

- horodatage des sessions : `sessionManager.ts:90,94,105,128` ;
- ouverture des défis BAC : `:235,289` ;
- date UTC de mission : `:312` et `smartTutorEngine.ts:1991` ;
- attente avant indice BAC : `smartTutorEngine.ts:1348-1353` ;
- compte à rebours BAC : `:2026` ;
- identifiants et heures du chat : `AITutorView.tsx:35,51,78,91,132,171`.

Ces variations sont parfois légitimes, mais elles invalident l'affirmation « sortie identique à entrée et état identiques » si l'horloge n'est pas explicitement exclue du contrat.

#### Égalités de classement

- recherche globale : tri uniquement par `b.score - a.score` (`smartTutorEngine.ts:541,557`) ;
- cartes : remplacement seulement si `rankingScore > bestRankingScore` (`:843`) ;
- erreurs : tri uniquement par score (`:1986`).

C'est actuellement stable grâce au tri stable de JavaScript et à l'ordre des tableaux, mais la priorité éditoriale est **implicite**. Un réordonnancement du corpus peut changer la réponse sans modifier les scores.

### 3.3 Verdict précis

- **Déterminisme fonctionnel local : oui**, pour les branches pures.
- **Déterminisme global : non**, à cause du hasard, de l'horloge, de la persistance et des tie-breaks implicites.
- **Reproductibilité d'un bug : partielle**, faute de seed et de trace du tirage.

---

## 4. Défaut P0 : les quiz ciblés ne restent pas dans le sujet

### Cause

Le démarrage filtre correctement le pool par `topicId` :

```text
smartTutorEngine.ts:1665  pool = questions du domaine filtrées par topicId
smartTutorEngine.ts:1667  picked = élément aléatoire du pool
smartTutorEngine.ts:1668  totalQuestions = pool.length
```

Mais la correction cherche la question suivante dans **toute la banque du domaine** :

```text
smartTutorEngine.ts:916  questions = getQuestionsForDomain(question.domainId)
smartTutorEngine.ts:917  idx dans cette banque complète
smartTutorEngine.ts:918  nextQ = questions[idx + 1]
```

L'état `QuizState` ne conserve ni la liste d'identifiants prévue ni le filtre `topicId` (`sessionManager.ts:147-163`).

### Reproduction contrôlée

Commande : `اختبرني في الاستنساخ` ; pool annoncé : 8 questions.

| `Math.random` forcé | Parcours réel | Résultat |
|---:|---|---|
| 0 | `prot_q1` → … → `prot_q8` | les q7-q8 sortent du pool ciblé |
| 0,5 | `prot_q5` → … → `prot_q12` | bascule vers enzymes puis immunité |
| 0,9999 | `prot_q22` → `prot_q23` | s'arrête après 2 questions mais affiche `0/8` |

### Impact élève

- contrat pédagogique faux : « اختبار … — 8 أسئلة » ;
- score mathématiquement trompeur ;
- erreurs enregistrées sur d'autres sujets ;
- XP basé sur un dénominateur qui ne correspond pas aux questions effectivement posées ;
- résultat variable selon le premier tirage aléatoire.

### Correctif recommandé

Ajouter `questionIds: string[]` au `QuizState`, avec un index. Au démarrage, construire l'ordre complet une seule fois (seed explicite), puis avancer dans cette liste. Ne jamais retrouver `nextQ` par position dans la banque de domaine.

Test de non-régression obligatoire : pour chaque sujet ciblé, tous les `questionId` visités doivent appartenir au pool initial, le nombre visité doit égaler `totalQuestions`, y compris si la première question est la dernière du fichier.

---

## 5. Routage et classement « mot par mot »

### 5.1 Forces

- Les mots-clés courts ne sont plus cherchés comme sous-chaînes arbitraires dans les cartes ; `includesAsWord` évite notamment l'ancien faux positif `لب` dans `الباك`.
- Le bonus de domaine (+5, `smartTutorEngine.ts:840`) influence le classement mais pas le seuil d'acceptation, qui exige toujours `bestContentScore >= 8` (`:851`). Un contexte de domaine seul ne fabrique donc pas une réponse.
- Le fuzzy est limité sur les mots courts et plafonne la confiance à 65/70 (`:864-869`).
- Les trois hors-sujet testés (`ميسي`, couscous, politique) ont été refusés.
- Les 13 sondes du programme du harnais existant ont toutes reçu une réponse ; le résumé de test affichait 13/16 car les 3 hors-sujet étaient intentionnellement comptés comme `MISS`, pas parce que trois questions du programme avaient échoué.

### 5.2 Faiblesses structurelles

#### Une seule occurrence exacte suffit

Un mot-clé exact vaut 8 (`smartTutorEngine.ts:802-815`) et le seuil est 8 (`:851`). Morchid attribue alors 75 % de confiance (`:869`). Cela explique des réponses très affirmées à des requêtes pauvres :

- `pH` → carte enzymes, 75 % ;
- `لب` → structure terrestre, 75 %.

Ce n'est pas forcément faux, mais 75 % exprime une certitude disproportionnée pour un token isolé et ambigu.

#### Les bases spécialisées passent avant le garde-fou positif

La cascade est : guide (`:1764`) → méthodologie (`:1778`) → banque scientifique (`:1799`) → cartes (`:1831`) → **seulement ensuite** détection positive de domaine (`:1878`). Un match lexical faible dans les premières bases peut donc contourner le filtre hors sujet.

Reproduction : `كيف أطبخ البروتين؟` (« comment cuisiner la protéine ? ») est envoyé vers la carte « تركيب البروتين » avec 90 % de confiance et une question socratique. Le mot `البروتين` écrase l'intention culinaire.

#### La négation ne modifie pas le routage ni la réponse explicative

- `التنفس لا ينتج ATP` → guide énergétique, 82 %, sans correction explicite de la proposition fausse ;
- `الانزيم ليس بروتينا` → carte enzyme, 92 %, contenu affirmatif générique ;
- `هل الغوص صعود؟` → carte de subduction, 92 %, sans répondre directement « non ».

Le module de négation protège maintenant la notation BAC, mais n'est pas utilisé pour détecter une misconception dans les questions libres.

#### Asymétrie des tokens courts

`tokenizeArabic` conserve seulement les tokens de 3 caractères ou plus (`arabicNormalize.ts:28-30`). Les cartes acceptent pourtant des alias/mots-clés dès 2 caractères (`smartTutorEngine.ts:783,805`). Résultat mesuré :

- `LB` → hors sujet ;
- `LT` → hors sujet ;
- `pH` → reconnu, parce que la normalisation donne un terme exploitable via les règles de carte.

Le comportement est incohérent pour un élève qui emploie les abréviations standards d'immunologie.

#### Confiance non probabiliste

Les valeurs 75/80/82/85/90/92/95/98 sont des paliers codés en dur. Elles ne proviennent d'aucune calibration sur corpus annoté. Afficher « الثقة: 98% » pour une banque locale est donc une précision factice.

#### Tie-break caché

À score égal, gagne le premier élément du tableau. Il faut un second critère explicite : priorité, spécificité, longueur exacte, identifiant stable.

### 5.3 Qualité de la normalisation arabe

**Bonne base technique**, mais pas analyse linguistique :

- `ة → ه` et `ؤ/ئ` simplifiés améliorent le rappel ;
- aucune racinisation, lemmatisation, segmentation des clitiques ou compréhension syntaxique ;
- le fuzzy par distance peut rapprocher des mots sémantiquement différents ;
- suppression de ponctuation et déduplication des tokens perdent ordre et fréquence ;
- les formes darija ne sont reconnues que si elles sont explicitement présentes dans les données.

Le moteur est donc un **routeur lexical tolérant**, pas un moteur sémantique au sens fort.

---

## 6. États, missions et défis BAC

### 6.1 Points positifs

- L'état actif quiz/BAC est traité avant la recherche générale (`smartTutorEngine.ts:1497-1499`). Une réponse `A` n'est donc pas détournée vers un cours.
- Les interactions fantômes après refresh sont neutralisées par `clearPendingInteractions`.
- Les erreurs sont retirées après une bonne réponse (`sessionManager.ts:185-189`).
- Le retour par le moteur préserve erreurs, BAC terminés et date de mission.
- Le défi BAC tient compte de la négation et impose une tentative minimale/une temporisation avant les indices.

### 6.2 Personnalisation de mission en partie fictive

Le commentaire promet `fréquence × poids BAC × oubli` (`smartTutorEngine.ts:1918-1920`). L'implémentation ne tient pas cette promesse :

1. `recordQuizAnswer` déduplique les erreurs (`sessionManager.ts:178-181`) : en usage normal, un sujet ne peut apparaître qu'une seule fois ;
2. `rankMistakes` recompte pourtant les doublons (`smartTutorEngine.ts:1972-1974`) ;
3. `lastSeenAt` est passé à la fonction mais **jamais utilisé** (`:1972`) ;
4. l'« oubli » est une formule sur la position dans le tableau, pas un âge réel (`:1979-1983`) ;
5. le conseil « vous vous êtes trompé 3 fois » (`:2032-2038`) est inatteignable avec l'état produit normalement ;
6. le mapping topic → unité est déduit du rang de la carte (`:1956-1964`), pas d'une donnée curriculaire réelle.

La priorité de mission paraît sophistiquée dans les commentaires, mais les données nécessaires ne sont pas stockées. Il faut enregistrer `{topicId, wrongCount, lastWrongAt, lastCorrectAt}`.

### 6.3 Fuseau de mission

`new Date().toISOString().split('T')[0]` utilise le jour **UTC**, pas le jour local algérien. En Algérie (UTC+1), entre 00:00 et 00:59 locale, la mission peut encore appartenir à la veille UTC. Utiliser une date locale explicite `Africa/Algiers`.

### 6.4 Effacement total

Le bouton « effacer la conversation » appelle `resetSession()` (`AITutorView.tsx:193-199`) et supprime volontairement suivi, erreurs, missions et anti-farm. Le dialogue de confirmation parle seulement d'effacer l'historique de conversation. Pour l'élève, la portée est trompeuse : il faudrait proposer séparément « effacer le chat » et « réinitialiser toute ma progression ».

### 6.5 API sans session différente de l'UI

`answerTutorQuestion()` marque toutes les cartes à probe comme contournées (`smartTutorEngine.ts:1892-1902`). Les benchmarks et intégrations utilisant cette API reçoivent directement le contenu, alors que l'UI peut lancer un échange socratique. Il existe donc deux comportements pour une même question.

---

## 7. Exactitude scientifique et conformité MEN

### Références locales utilisées

- progression 3AS 2017 : `docs/sources/التدرج-السنوي-للتعلمات-2017.txt` ;
- guide enseignant 2017 : `docs/sources/دليل-الأستاذ-2017.txt` ;
- extraits propres et sourcés : `docs/sources/dalil-alustadh-3AS-extraits.md` ;
- modèle structuré : `src/data/curriculumOfficial.ts`.

La règle locale issue de L5 p.6 est explicite : l'élève est évalué sur le programme commun, pas sur tout le contenu du manuel (`curriculumOfficial.ts:10-13`).

### 7.1 Erreur réglementaire majeure : contenus non exigibles non signalés

| Concept | Référence programme | Réponse Morchid | Verdict |
|---|---|---|---|
| `المتمم` (complément immunitaire) | NON_EXIGIBLE, L5 p.6, `curriculumOfficial.ts:39` | `هل المتمم ضمن البرنامج؟` est routé vers **organisation du temps**, 75 % | Faux routage, ne répond pas à la question |
| `نضج ARNm` | NON_EXIGIBLE, L5 p.6, `:41` | `نضج ARNm` renvoie la carte synthèse protéique, 92 % ; `studyGuide.ts:157` l'enseigne | Hors programme non signalé |
| `مبدأ الأسيلوسكوب` | NON_EXIGIBLE, L5 p.6, `:40` | réponse « je n'ai pas trouvé », sans dire « non exigible » | Incomplet mais moins dangereux |

Ambiguïté importante : `bookTutorQA.ts:163-166` parle de **متمم إنزيمي** (cofacteur enzymatique), qui n'est pas le système du complément immunitaire. Le moteur doit distinguer les deux homonymes au lieu d'associer `المتمم` aveuglément.

### 7.2 Bilan ATP non aligné sur l'attendu algérien

**Unité :** domaine II, unité 7, mécanismes de conversion de l'énergie chimique en ATP.  
**Référence guide :** section « آليات تحويل الطاقة الكيميائية الكامنة », extrait local : « الحصيلة الكلية … 38 جزيئة » et « 38 جزيئة في التنفس و ATP 2 في التخمر » (`dalil-alustadh-3AS-extraits.md`, §1).  
**Page exacte :** non certifiable depuis l'extrait propre ; la copie OCR brute ne conserve pas une pagination exploitable de façon fiable.

Morchid sert plusieurs variantes :

- `smartBotData.ts:276` : 36–38 ATP ;
- `smartBotData.ts:992-998` : 36–38 ;
- `studyGuide.ts:111` : 36 ou 38 ;
- `tutorKnowledge.ts:3234,3242,3348` : 36–38 ;
- `bookTutorQA.ts:231,242` : environ 38, aligné.

**Verdict :** « 36–38 » est défendable en biologie moderne selon les conventions de navettes et rendements, mais **pas optimal pour la réponse BAC algérienne attendue par le guide local, qui fixe 38**. Le tuteur doit distinguer : « attendu MEN : 38 ; nuance scientifique moderne : rendement variable ». Mélanger les deux sans étiquette expose l'élève à une réponse non conforme au barème appris.

### 7.3 Relation vitesse–densité des ondes : formulation scientifiquement fausse

**Unité :** domaine III, unité 10, structure de la Terre ; concept : vitesse des ondes sismiques.  
**Données fautives :**

- `smartBotData.ts:320` : vitesse augmente avec rigidité **et densité** ;
- `smartBotData.ts:335-336` : causalité répétée ;
- `tutorKnowledge.ts:3250` : vitesse augmente avec la densité seule.

La vitesse dépend des modules élastiques et de la densité (`Vp = sqrt((K + 4μ/3)/ρ)`, `Vs = sqrt(μ/ρ)`). À rigidité constante, augmenter ρ diminue la vitesse. Dans la Terre, les modules élastiques augmentent souvent assez pour dominer l'effet de densité : on ne peut pas attribuer causalement l'augmentation à la densité seule.

**Correction pédagogique :** « تتحدد السرعة بصلابة/مرونة الوسط وكثافته؛ زيادة الصلابة ترفع السرعة، بينما الكثافة وحدها لا تكفي للتنبؤ بها. »

**Page MEN :** unité et ressource confirmées par `curriculumOfficial.ts` U10 ; page exacte non certifiable dans l'OCR disponible.

### 7.4 Sur-spécification / contenu hors cible dans le guide d'étude

`studyGuide.ts:157` enseigne introns/exons et maturation de l'ARNm alors que `curriculumOfficial.ts:41` classe explicitement `نضج الـ ARNm` hors programme. Ce n'est pas une erreur scientifique, mais une **erreur de portée** pour un élève BAC : le tuteur ne distingue pas culture générale et exigible.

### 7.5 Contenus désormais corrigés et cohérents

Les erreurs historiques suivantes ne sont plus présentes dans `smartBotData.ts` : méthionine tronquée, ondes S traversant le noyau, zone d'ombre P niée, oxymore divergence/convergence, magma qui s'enfonce, faute `الوشام`. Les cartes actuelles sur ces points sont cohérentes, notamment `smartBotData.ts:289-340`.

### 7.6 Qualité éditoriale résiduelle

- `tutorKnowledge.ts:2888` contient du code-switch accidentel : `وي produced 38 ATP` ;
- les sources affichées à l'élève sont des catégories internes (« بنك الأسئلة », « الدروس »), pas des références MEN page/unité ;
- les assertions « sourceBook: PROGRAMME NATIONAL SVT CLAUDE OPUS.MD » ne constituent pas une provenance institutionnelle.

**Conclusion scientifique :** la majorité des réponses canoniques testées est correcte, mais trois classes empêchent une certification : contradiction avec la portée officielle, incohérence de l'attendu ATP, et causalité erronée vitesse/densité. Un audit ligne par ligne des centaines de réponses n'est pas remplacé par 114 tests fonctionnels.

---

## 8. Performance

### 8.1 Mesure mixte sur 2 000 appels

```json
{
  "calls": 2000,
  "meanMs": 8.899,
  "p50Ms": 3.193,
  "p95Ms": 41.724,
  "p99Ms": 55.789,
  "maxMs": 112.195
}
```

Le p95 élevé vient surtout du mélange de routes et de pauses du runtime/GC ; une seconde mesure par requête, 300 appels chacune, donne :

| Requête | moyenne | p50 | p95 | max |
|---|---:|---:|---:|---:|
| transcription | 3,17 ms | 2,93 | 4,86 | 6,90 |
| photosynthèse | 3,58 | 3,45 | 4,98 | 5,93 |
| méthodologie document | 1,69 | 1,58 | 2,36 | 3,20 |
| hors sujet Messi | 3,05 | 2,84 | 4,79 | 5,57 |
| acides nucléiques | 3,01 | 2,96 | 3,26 | 4,15 |
| comparaison photo/respiration | 3,62 | 3,53 | 4,13 | 5,48 |

### 8.2 Froid et mémoire

- import froid via `npx tsx` : **1,151 s** réel ;
- mémoire du processus après import : RSS ~135 MB, heap utilisé ~36 MB ;
- sources directement impliquées : environ 728 KiB de TypeScript (`smartTutorEngine` 104 KiB, `smartBotData` 100 KiB, `tutorKnowledge` 480 KiB, autres bases ~67 KiB).

Ces chiffres incluent Node/tsx et ne sont pas une mesure du heap navigateur. Ils montrent néanmoins un coût d'initialisation et un corpus monolithique non négligeables.

### 8.3 Analyse algorithmique

À chaque requête, le moteur :

- rescane les cartes et plusieurs banques ;
- renormalise de nombreux titres, triggers et mots-clés ;
- effectue des Levenshtein potentiellement quadratiques sur des couples de tokens ;
- trie des listes complètes alors qu'un top-1 suffirait souvent.

Les index de domaine sont préconstruits en partie, mais les bases spécialisées refont des normalisations. Sur desktop, 2–5 ms est bon. Sur un Android peu puissant, les scans synchrones peuvent provoquer des à-coups, surtout avec le rendu React et le clavier.

### 8.4 Verdict performance en contexte algérien

- **Connectivité : excellent** — moteur totalement local, donc pas de coût data ni dépendance réseau pour les réponses.
- **Latence à chaud : bonne** sur machine de test.
- **Démarrage/bundle : à surveiller** pour téléphones 2–4 Go de RAM.
- **Batterie : non mesurée** ; le fuzzy synchrone à chaque frappe n'est pas exécuté, seulement à l'envoi, ce qui limite le risque.
- **Budget : favorable** — aucune API LLM payante.

Il faut profiler un APK/PWA ou Chrome Android réel avant de revendiquer une performance mobile certifiée.

---

## 9. Tests : ce qu'ils prouvent et ce qu'ils ratent

### Ce qu'ils prouvent

Les 114 tests ciblés couvrent notamment :

- négation dans la notation BAC ;
- triade socratique et contrat des verbes ;
- garde-fou hors sujet ;
- intégrité QCM et payload sans correction ;
- mission clôturée et XP ;
- UI du chat et anciennes options désactivées ;
- navigation des résumés.

### Angles morts démontrés

1. Les tests `اختبرني` vérifient que **le premier QCM existe**, pas que toute la séquence reste dans le sujet.
2. Les tests mission vérifient QCM/XP/clôture, pas la reproductibilité du tirage.
3. Aucun test ne confronte systématiquement `NON_EXIGIBLES` à chaque base routable.
4. Aucun test de calibration empirique des pourcentages de confiance.
5. Aucun test de propriété sur les égalités de score et l'ordre des corpus.
6. Aucun benchmark de régression avec budget p95.
7. Aucun test de fuseau `Africa/Algiers` à minuit.
8. Aucun test ne démontre que le conseil `freq >= 3` est atteignable avec la vraie fonction d'enregistrement.

Le vert de la suite ne contredit donc pas les défauts : les assertions actuelles ne les observent pas.

---

## 10. Plan de correction réaliste

### P0 — avant toute promesse de fiabilité

1. **Réparer la séquence de quiz ciblé** : stocker `questionIds` et avancer uniquement dans cette liste.
2. **Éliminer ou contrôler `Math.random`** : PRNG injecté avec seed `sessionId + date locale + topicId`, seed journalisé.
3. **Brancher `estNonExigible` dans la cascade avant les bases** et afficher : « présent dans le manuel mais non exigible au BAC », avec unité/source.
4. **Corriger vitesse/densité** dans `smartBotData.ts` et `tutorKnowledge.ts`.
5. **Aligner ATP** : réponse principale 38 selon le guide algérien ; nuance 36–38 clairement étiquetée comme contexte scientifique moderne.

### P1 — fiabilité pédagogique

6. Remplacer `mistakes: string[]` par des statistiques par topic ; supprimer le faux calcul de fréquence/oubli.
7. Gérer la négation et les questions oui/non dans le routage libre ; répondre d'abord au verdict, puis expliquer.
8. Déplacer le garde-fou de domaine avant les banques, avec exception explicite pour les commandes pédagogiques.
9. Revoir la confiance : catégories `élevée/moyenne/faible`, ou calibration sur un jeu annoté ; supprimer les faux 98 %.
10. Ajouter un tie-break explicite et documenté.
11. Séparer « effacer le chat » de « réinitialiser la progression ».
12. Utiliser `Africa/Algiers` pour la mission quotidienne.

### P2 — performance et maintenabilité

13. Pré-normaliser titres/triggers/keywords une fois à l'import dans toutes les bases.
14. Construire un index inversé token → candidats, puis ne scorer que les candidats.
15. Éviter les tris complets pour un top-1 ; conserver le meilleur pendant le scan.
16. Découper/lazy-loader les grands corpus par domaine.
17. Ajouter un benchmark CI : après warm-up, p95 < 15 ms sur runner défini, stabilité de sortie et budget de bundle.

### Tests à ajouter immédiatement

- propriété : tous les QCM visités appartiennent à `questionIds` ;
- propriété : `visited.length === totalQuestions` ;
- seed fixe → sortie identique ; seed différent → variation contrôlée ;
- table de tous les `NON_EXIGIBLES` contre toutes les bases ;
- `LB`, `LT`, `LT4`, `pH`, clitiques et fautes arabes ;
- propositions négatives et questions oui/non ;
- égalités de score avec corpus réordonné ;
- date locale avant/après minuit à Alger ;
- trois erreurs successives sur un topic déclenchent effectivement la remédiation.

---

## 11. Conclusion

Morchid a une architecture raisonnable pour un produit scolaire hors ligne : réponse locale, normalisation arabe, fuzzy borné, sources affichées, QCM sans correction exposée, états socratiques et nombreux tests. C'est une base sérieuse.

Mais les commentaires du code surestiment parfois la réalité. La « personnalisation fréquence × poids × oubli » n'a pas les données nécessaires ; le quiz ciblé viole son propre pool ; les pourcentages de confiance ne sont pas calibrés ; le registre officiel des contenus non exigibles n'est pas utilisé par le moteur ; et le corpus conserve au moins une causalité scientifique incorrecte et un conflit de convention ATP.

**Verdict final à l'instant de l'audit initial : rapide, généralement stable sur question canonique, pédagogiquement prometteur — mais pas déterministe de bout en bout et pas encore assez fiable pour une certification BAC.**

---

## 12. État post-correctifs

La passe déclenchée après l'audit a livré les corrections suivantes :

- suppression de `Math.random()` dans Morchid ;
- quiz ciblés pilotés par une liste `questionIds` persistée : aucune fuite vers un autre sujet et dénominateur exact ;
- mission quotidienne déterministe par sujet et jour algérien ;
- date civile calculée en UTC+1 (`algeriaDateKey`) pour éviter le décalage entre 00:00 et 00:59 en Algérie ;
- statistiques réelles par sujet (`wrongCount`, `correctCount`, dates) et remédiation après trois échecs désormais atteignable ;
- interception prioritaire des trois contenus MEN non exigibles, avec référence L5 p.6 ;
- distinction entre complément immunitaire et cofacteur enzymatique ;
- bilan énergétique harmonisé à 38 ATP selon l'attendu algérien ;
- correction de la causalité vitesse des ondes/densité ;
- réponses directes aux misconceptions critiques sur ATP, enzyme/protéine et subduction ;
- prise en charge directe de `LB` et `LT` ;
- rejet de la formulation hybride hors sujet `كيف أطبخ البروتين؟`.

### Preuves après correction

```text
Quiz ciblé transcription :
prot_q1 → prot_q2 → prot_q3 → prot_q4 → prot_q5 → prot_q6 → prot_q21 → prot_q22
8 questions visitées, toutes topicId=protein_synthesis, score final /8.

100 répétitions :
اختبرني في الغوص        → 1 seule question initiale
اختبرني في الاستنساخ    → 1 seule question initiale
اختبرني في التنفس الخلوي → 1 seule question initiale
```

### Validation finale

- TypeScript `tsc --noEmit` : réussi ;
- tests Morchid ciblés : **125/125** ;
- suite Vitest complète : **2 318 réussis, 4 ignorés, 0 échec** ;
- suite B.O.U.S.S.O.L.E : **138/138** ;
- build production Vite + serveur : réussi.

Des avertissements antérieurs et hors périmètre Morchid restent visibles dans la suite complète : bouton audio imbriqué dans un bouton de flashcard, mocks Web Audio incomplets et clés React dupliquées dans d'autres écrans. Ils ne font pas échouer les tests, mais ne doivent pas être confondus avec un résultat entièrement exempt d'avertissements.

### Verdict post-correctifs

Le défaut critique des quiz ciblés et les sources de hasard internes à Morchid sont supprimés. Les réponses fonctionnelles deviennent reproductibles à entrée et état métier identiques ; les variations restantes sont celles qui appartiennent explicitement au temps et à l'état de session (chrono BAC, horodatages UI, jour de mission). La certification scientifique exhaustive de tout le corpus reste hors de portée de cette seule passe, mais les erreurs et contradictions démontrées dans l'audit ont été corrigées et verrouillées par tests.
