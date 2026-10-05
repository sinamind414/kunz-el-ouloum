# Audit qualité des cours et des résumés d’or face au « livre مصحّح »

**Date :** 5 octobre 2026  
**Application :** Kunz El Ouloum — SVT 3AS / BAC Algérie  
**Référence demandée :** `الكتاب_المصحح_v1.0.md` (« livre corrigé / مصحّح »)  
**Empreinte de la copie locale auditée :** SHA-256 `1dcfc5ae7a64bf5e10965ef41302130e43abde7ad3e66d1f2e812380cb0e2b21`  
**Périmètre :** cours HTML, leçons actives, résumés simples, 71 résumés d’or et index du tuteur.

> **Verdict sans complaisance : ALIGNEMENT PARTIEL, NON CERTIFIABLE EN L’ÉTAT.**
>
> Les résumés d’or sont généralement cohérents avec le corps des leçons et couvrent toutes les leçons indexées. En revanche, plusieurs cartes « خلاصة الدرس » affichées à la fin des cours fractionnés résument le cours précédent, quatre leçons sont classées dans la mauvaise unité, des erreurs scientifiques restent dans les cours HTML, et aucun des 71 résumés d’or n’a une relecture enseignante enregistrée. Le « livre مصحّح » est une adaptation éditoriale utile, mais il ne peut pas remplacer le programme MEN pour décider ce qui est exigible au BAC.

---

## 1. Ce qui a réellement été contrôlé

### Corpus

| Élément | Volume contrôlé |
|---|---:|
| Livre `الكتاب_المصحح_v1.0.md` | 2 586 lignes, 280 742 octets |
| Leçons indexées par Morchid | **71** |
| Résumés d’or | **71** |
| Résumés simples `RESUMES_LECONS` | **50 entrées / 245 points** |
| Blocs des résumés d’or | **1 160** |
| Cartes حصيلة HTML | **11/11 présentes** |

### Contrôles exécutés

1. correspondance exacte des clés `LESSON_GOLD_SUMMARIES` avec `LESSON_INDEX` ;
2. comparaison lexicale normalisée arabe entre résumé d’or et cours portant la même clé ;
3. comparaison des résumés d’or avec la section correspondante des 11 unités du livre مصحّح ;
4. exécution du script historique `scripts/audit_resumes_hosila.py` contre l’OCR du manuel officiel ;
5. inspection manuelle des divergences scientifiques et des leçons fractionnées ;
6. tests ciblés :
   - `lessonGoldSummaries.test.ts` ;
   - `tutorGoldSummaryFlow.test.ts` ;
   - `resumes.lock.test.ts`.

**Résultat des tests ciblés : 3 fichiers, 37 tests réussis, 0 échec.**

### Limite méthodologique importante

Une couverture lexicale n’est **pas** une certification scientifique : une phrase fausse peut reprendre beaucoup de mots du livre. Les métriques servent à repérer les zones à relire ; le verdict scientifique ci-dessous repose sur des exemples examinés dans leur contexte.

Aucune capture annotée n’est fournie : l’environnement d’audit ne dispose pas d’un navigateur graphique. Les lignes et textes reproductibles remplacent les captures.

---

## 2. Résultats quantitatifs

### 2.1 Couverture fonctionnelle

- résumés d’or présents : **71/71 leçons indexées** ;
- leçons indexées sans résumé d’or : **0** ;
- résumé d’or sans leçon indexée : **0** ;
- format structurel complet (mission, 4–6 mécanismes, preuve, vocabulaire, erreur, rappel) : tests verts.

C’est un vrai point fort : le parcours Morchid ne pointe pas vers des fiches fantômes.

### 2.2 Alignement résumé d’or ↔ corps du cours

Mesure indicative sur les jetons normalisés :

| Indicateur | Résultat |
|---|---:|
| moyenne | **81,4 %** |
| médiane | **82,8 %** |
| minimum | **24,6 %** |
| fiches sous 70 % | **6/71** |

La majorité des résumés d’or reprend donc correctement les mécanismes du cours associé. Le cas minimal est `d1-u3-l1-enzyme` : sa fiche d’or traite la saturation et `Vmax`, alors que la leçon indexée correspondante développe surtout le principe général du catalyseur. Ce n’est pas nécessairement faux, mais la fiche est plus spécialisée que son support immédiat.

### 2.3 Alignement résumé d’or ↔ unité du livre مصحّح

Après correction analytique de quatre mauvais routages d’unité dans l’index :

| Indicateur | Résultat |
|---|---:|
| moyenne indicative | **63,6 %** |
| médiane | **63,2 %** |
| minimum | **16,2 %** |
| fiches sous 60 % | **25/71** |

Ce résultat ne signifie pas « 25 fiches fausses ». Les fiches d’expériences, de prérequis et de culture générale emploient un vocabulaire plus détaillé que la section du livre. En revanche, elles ne doivent pas porter implicitement le même statut qu’un contenu directement exigible.

Exemple extrême : `phase22_chapitres_43_44_2`, sur les réservoirs pétroliers sahariens, n’obtient que **16,2 %** d’ancrage dans l’unité 11 du livre مصحّح. Le contenu peut être pédagogiquement utile, mais c’est un enrichissement ; il ne doit pas être présenté comme le résumé officiel d’une activité du manuel.

### 2.4 Contrôle contre l’OCR du manuel officiel

Le script historique trouve :

- **245/245** points des résumés simples avec au moins une ancre ;
- **22** points simples ne passant que grâce à une seule ancre ;
- **54/1 160** blocs de résumés d’or sans jeton reconnu dans l’OCR officiel ;
- **221/1 160** blocs ne disposant que d’une ancre.

Le verrou actuel est donc trop permissif : **un seul mot commun** suffit pour déclarer un point « ancré ». Il garantit une proximité minimale, pas une fidélité de sens.

---

## 3. Défaut critique : des cours finissent par le résumé d’un autre cours

Le contenu principal et le résumé d’or sont souvent corrects, mais plusieurs cours fractionnés affichent une carte simple héritée de la première moitié du fichier HTML. Pour l’élève, c’est le résumé visible en fin de leçon : l’erreur est donc pédagogiquement grave.

### Cas démontrés

| Leçon affichée | Résumé simple réellement affiché | Verdict |
|---|---|---|
| `phase2_chapitres_3_4_2` — niveaux de structure protéique | étapes de la **traduction** et polysomes | ❌ autre leçon |
| `phase3_chapitres_5_6_2` — enzymes | relation générale **structure–fonction du protéine** | ❌ résumé précédent |
| `phase8_chapitres_15_16_2` — potentiel d’action | **potentiel de repos** | ❌ autre mécanisme |
| `phase9_chapitres_17_18_2` — intégration nerveuse | transmission synaptique par **ACh** | ❌ autre mécanisme |
| `phase10_chapitres_19_20_2` — chloroplaste | résumé hybride **drogues + photosynthèse** | ❌ deux unités fusionnées |
| `phase13_chapitres_25_26_2` — Krebs/pyruvate | **glycolyse** | ❌ étape antérieure |
| `phase14_chapitres_27_28_2` — fermentation | **phosphorylation oxydative** | ❌ mécanisme opposé |
| `phase19_chapitres_37_38_2` — composition des roches | **ondes sismiques** | ❌ activité précédente |
| `phase20_chapitres_39_40_2` — plis et failles | structure interne de la Terre | ❌ autre unité conceptuelle |
| `phase22_chapitres_43_44_2` — réservoirs pétroliers | cycle général des roches | ⚠️ résumé trop éloigné |

Exemple reproductible dans `src/data/lessonIndex.ts` : la leçon intitulée « لماذا يفقد البروتين وظيفته إذا تغيرت شكله؟ » contient une carte `خلاصة الدرس` commençant par « فسّر المراحل الثلاث للترجمة ».

**Cause probable :** les fichiers `phaseX_chapitres_Y_Z.html` ont été découpés en deux clés (`...` et `..._2`), mais l’injection des résumés simples et l’unité héritent encore de la clé mère.

**Conséquence élève :** après avoir étudié un mécanisme, il mémorise la synthèse du mécanisme précédent. C’est plus dangereux qu’un résumé absent.

---

## 4. Mauvais classement curriculaire dans l’index

Quatre routages sont objectivement incompatibles avec le titre et le livre :

| Clé | `unitId` actuel | Unité correcte |
|---|---:|---:|
| `phase2_chapitres_3_4_2` — structure protéique | 1 — synthèse | **2 — structure/fonction** |
| `phase3_chapitres_5_6_2` — enzymes | 2 — structure/fonction | **3 — activité enzymatique** |
| `phase10_chapitres_19_20_2` — chloroplaste | 5 — système nerveux | **6 — photosynthèse** |
| `phase20_chapitres_39_40_2` — plis/failles | 10 — structure terrestre | **11 — structures géologiques** |

Cela fausse la navigation, les statistiques par unité, le choix des missions et toute mesure automatisée « par chapitre ».

---

## 5. Erreurs scientifiques encore présentes dans les cours

### P0 — à corriger avant de déclarer les cours alignés

#### 5.1 Vitesse des ondes sismiques attribuée à la densité

- `public/lessons/phase19_chapitres_37_38.html:510` : « سرعتها تزداد بازدياد كثافة وصلابة الوسط » ;
- `public/lessons/phase20_chapitres_39_40.html:727` : « سرعة الموجات تزداد بالكثافة والضغط ».

Cette causalité est incorrecte. La vitesse dépend des modules élastiques **et** de la densité (`vP = √((K + 4μ/3)/ρ)`, `vS = √(μ/ρ)`). À élasticité constante, augmenter `ρ` diminue la vitesse. Le livre مصحّح se contente correctement d’observer des sauts de vitesse aux discontinuités sans affirmer « densité ↑ donc vitesse ↑ ».

Le moteur Morchid a été corrigé sur ce point, mais les leçons HTML ne l’ont pas été : l’application se contredit encore selon la surface.

#### 5.2 Lactate présenté comme cause de la fatigue

- `public/lessons/phase14_chapitres_27_28.html:646` : « حمض اللبن الذي يسبب التعب العضلي ».

Le lactate n’est pas la cause unique de la fatigue musculaire. Pour le niveau scolaire, il faut parler de fermentation lactique, d’acidification transitoire et de facteurs multiples, sans causalité unique.

#### 5.3 Énergie « fabriquée » par la lumière

- `public/lessons/phase15_chapitres_29_30.html:479` : « الطاقة يصنعها الضوء ويبددها التنفس ».

L’énergie n’est pas créée : l’énergie lumineuse est **convertie** en énergie chimique, puis transférée et dissipée sous forme thermique.

#### 5.4 Phrase biologiquement incohérente

- `src/data/resumesLecons.ts:379` et le HTML correspondant : « يعود H+ إلى الترجمة عبر ATP-synthase ».

`الترجمة` signifie traduction protéique. Le proton retourne vers la **matrice mitochondriale** (`المصفوفة/المادة الأساسية`), pas vers la traduction.

### P1 — erreurs rédactionnelles qui contaminent les synthèses

- `تعبرز` dans les résumés CMH (`resumesLecons.ts:105–106`) : graphie fautive ; écrire `تَعرِض`/`تعرض` selon la phrase ;
- `فترة كامن` : accord incorrect ; écrire `فترة كمون` ou `طور كامن` ;
- `خلايا بلازمية ناشزة` (`resumesLecons.ts:212`) : terme erroné ;
- `يتكسر تراكم الإجهاد` (`resumesLecons.ts:470`) : formulation incohérente ; écrire que la rupture brutale libère l’énergie élastique accumulée ;
- résumé d’or enzyme (`lessonGoldSummaries.ts:156–157`) : `تزداد تركيز` et `تزداد احتمال` doivent devenir `يزداد تركيز` et `يزداد احتمال`.

---

## 6. Les résumés d’or : ce qui est bon et ce qui ne l’est pas

### Points solides

- couverture **71/71** ;
- structure pédagogique utile : question-problème, mécanisme causal, preuve, vocabulaire, erreur fréquente et rappel actif ;
- cohérence cours/résumé globalement élevée ;
- très bonnes fiches sur transcription, synapse, immunité, phosphorylation oxydative et ondes sismiques ;
- la fiche `phase14_chapitres_27_28` adopte clairement la convention **38 ATP**, alignée avec la convention scolaire retenue ;
- les fiches d’or des secondes moitiés sont souvent plus justes que la carte simple erronée affichée dans le cours.

### Faiblesses éditoriales

- **71/71** ont `status: 'adaptation_pedagogique'` ;
- **71/71** ont `reviewed: false` ;
- **0/71** n’est enregistré comme `manuel_officiel_verifie` ;
- une seule fiche possède un tableau de pages structuré ; les autres ont surtout un texte libre `sourceLabel` ;
- plusieurs labels vagues disent « programme BAC SVT Algérie » sans page, activité ni document officiel précis ;
- les tests ne vérifient que la présence des champs et l’honnêteté du statut, pas la vérité scientifique ni l’alignement sémantique avec le livre.

**Conclusion éditoriale :** le nom « résumé d’or » décrit un bon format pédagogique, pas un statut de validation officielle.

---

## 7. Le livre مصحّح n’est pas à confondre avec le programme MEN

Le fichier commence par annoncer une version « corrigée et approfondie » comprenant des ajouts éditoriaux, réponses modèles, tableaux et exercices. Il est dérivé du manuel, mais ce n’est pas le binaire ONPS ni un texte réglementaire autonome.

Trois niveaux doivent rester séparés :

1. **MEN / progression officielle** : décide ce qui est exigible ;
2. **manuel ONPS** : support pédagogique officiel ;
3. **livre مصحّح** : reconstruction et enrichissement éditorial local.

Exemples :

- le livre مصحّح développe la maturation de l’ARNm et le complément immunitaire ;
- la progression MEN locale utilisée par l’application les classe comme non exigibles ;
- leur présence dans le livre مصحّح ne suffit donc pas à les transformer en priorité BAC.

Le livre مصحّح contient aussi une contradiction ATP interne : il retient **38 ATP** dans la synthèse (`≈38 ATP`), mais conserve ailleurs `≈36–38 ATP`. L’application doit afficher la convention BAC **38 ATP** dans les exercices notés et, si nécessaire, isoler la nuance moderne comme enrichissement non évalué.

---

## 8. Évaluation synthétique

| Axe | Note | Justification |
|---|---:|---|
| Couverture des cours et résumés | **18/20** | 71/71 fiches d’or, 50 résumés simples, 11 unités |
| Qualité pédagogique des résumés d’or | **16/20** | format causal, preuve, erreur fréquente, rappel |
| Alignement résumé d’or ↔ cours | **15/20** | bon en moyenne, quelques fiches plus larges que le support |
| Alignement visible cours ↔ résumé final | **8/20** | nombreuses cartes de fin héritées du cours précédent |
| Fidélité au livre مصحّح | **13/20** | bonne sur le noyau, faible pour plusieurs enrichissements |
| Conformité MEN / statut BAC | **11/20** | contenus non exigibles pas uniformément séparés |
| Qualité scientifique des cours | **11/20** | quatre erreurs importantes encore visibles |
| Traçabilité éditoriale | **7/20** | 71/71 non relus, sources rarement paginées |

### Verdict global : **12,4/20 — avec réserves fortes**

Pour un élève de terminale algérien, les cours sont riches et souvent meilleurs que des fiches de révision courtes. Mais il n’est pas acceptable de présenter l’ensemble comme « aligné et vérifié » tant que le résumé visible peut appartenir au cours précédent et que les erreurs scientifiques listées restent dans les pages étudiées.

---

## 9. Plan de correction réaliste

### P0 — immédiat

1. corriger les quatre erreurs scientifiques (§5.1 à §5.4) dans les HTML et leurs données sources ;
2. corriger les six formulations fautives des résumés simples ;
3. rattacher chaque clé `..._2` à son propre résumé simple, pas à celui de la clé mère ;
4. corriger les quatre `unitId` erronés puis régénérer `lessonIndex.ts` ;
5. ajouter un test qui compare le thème de la carte `خلاصة الدرس` au thème de la leçon.

### P1 — avant communication « conforme au livre »

6. remplacer l’ancrage « ≥1 mot » par une couverture sémantique minimale et des concepts obligatoires/interdits ;
7. ajouter pour chaque résumé d’or : unité, activité, pages, statut MEN (`exigible`, `enrichissement`, `hors programme`) ;
8. marquer explicitement les fiches pétrole, Mitchell–Racker, prérequis 2AS et autres enrichissements ;
9. faire relire les 71 fiches par un enseignant SVT algérien et renseigner `reviewedBy`/`reviewedAt` ;
10. empêcher le statut `manuel_officiel_verifie` sans pages et sans preuve de relecture.

### Test d’acceptation recommandé

Le build doit échouer si :

- une leçon et sa synthèse n’appartiennent pas à la même unité ;
- une carte de fin contient des concepts obligatoires du cours précédent et omet ceux du cours courant ;
- un contenu non exigible est présenté comme « سؤال BAC » sans session/source ;
- un résumé prétend être vérifié sans page ni relecteur ;
- les formulations scientifiques interdites (`السرعة تزداد بالكثافة`, `اللاكتات يسبب التعب`, `الطاقة يصنعها الضوء`) réapparaissent.

---

## 10. Réponse directe

**Les cours et leurs résumés d’or sont-ils alignés avec le livre مصحّح ?**

**Partiellement :**

- **oui** pour la couverture et le noyau conceptuel de la majorité des 71 fiches ;
- **non** pour plusieurs résumés visibles en fin de cours, qui appartiennent au cours précédent ;
- **non démontré** pour les enrichissements à faible ancrage ;
- **non certifié** éditorialement, puisque 71/71 fiches restent non relues ;
- **insuffisant pour le BAC** si l’on ne distingue pas le livre مصحّح du périmètre officiel MEN.

Le bon objectif n’est donc pas de déclarer « tout est aligné », mais de corriger les P0, verrouiller le routage des synthèses et obtenir une validation enseignante traçable.
