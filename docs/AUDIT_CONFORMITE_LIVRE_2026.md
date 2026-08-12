# Audit de conformité — Corpus documentaire officiel ↔ Application « Kunz El Ouloum »

**Version 3 · 12 août 2026**
**Périmètre :** les 5 documents de référence déposés à la racine du dépôt + l'application `kunz-el-ouloum`
**Référence d'autorité :** `الكتاب_المصحح_v1.0.md`, désigné par le commanditaire comme le programme officiel
**Auteur :** audit expert indépendant (pédagogie SVT, conformité académique DZ, QA, produit)
**Commit audité :** `e0b7d17` · branche `arena/019ff4f0-kunz-el-ouloum`
**Documents antérieurs :** `docs/AUDIT_15_DIMENSIONS_2026.md` (v2, 15 dimensions). Le présent document ne le remplace pas : il le complète en apportant la référence de conformité qui manquait alors.

---

## Sommaire

- [0. Synthèse exécutive](#0-synthèse-exécutive)
- [1. Méthodologie et limites de l'audit](#1-méthodologie-et-limites-de-laudit)
- [2. Inventaire critique du corpus fourni](#2-inventaire-critique-du-corpus-fourni)
- **VOLET A — Audit du livre en soi**
  - [A1. Statut réel du document : ce que la carte de version ne dit pas](#a1-statut-réel-du-document--ce-que-la-carte-de-version-ne-dit-pas)
  - [A2. Exactitude scientifique](#a2-exactitude-scientifique)
  - [A3. Qualité rédactionnelle et terminologique](#a3-qualité-rédactionnelle-et-terminologique)
  - [A4. Densité et couverture par unité](#a4-densité-et-couverture-par-unité)
  - [A5. Notions absentes](#a5-notions-absentes)
  - [A6. Appareil pédagogique : figures, corrigés, guide de correction](#a6-appareil-pédagogique--figures-corrigés-guide-de-correction)
  - [A7. Le document OPUS : hiérarchie cassée](#a7-le-document-opus--hiérarchie-cassée)
  - [A8. Score du volet A](#a8-score-du-volet-a)
- **VOLET B — Diff livre ↔ application**
  - [B1. Couverture structurelle : 11 unités vs 44 leçons](#b1-couverture-structurelle--11-unités-vs-44-leçons)
  - [B2. CRITIQUE — 98 % d'explications circulaires *(chantier ouvert, lots 1 et 2 livrés)*](#b2-critique--98--dexplications-circulaires)
  - [B3. MAJEUR — 30 % de QCM méta-scolaires](#b3-majeur--30--de-qcm-méta-scolaires)
  - [B4. MAJEUR — Barème BAC non conforme](#b4-majeur--barème-bac-non-conforme)
  - [B5. MAJEUR — 57 schémas hors-sujet](#b5-majeur--57-schémas-hors-sujet)
  - [B6. Divergences de contenu livre ↔ app](#b6-divergences-de-contenu-livre--app)
  - [B7. Ce que l'application fait mieux que le livre](#b7-ce-que-lapplication-fait-mieux-que-le-livre)
  - [B8. Score du volet B](#b8-score-du-volet-b)
- [3. Registre consolidé des constats](#3-registre-consolidé-des-constats)
- [4. Feuille de route priorisée](#4-feuille-de-route-priorisée)
- [Annexe I — Table de conformité par unité](#annexe-i--table-de-conformité-par-unité)
- [Annexe II — Protocole de reproduction des mesures](#annexe-ii--protocole-de-reproduction-des-mesures)
- [Annexe III — Faux positifs écartés](#annexe-iii--faux-positifs-écartés)

---

## 0. Synthèse exécutive

L'arrivée du corpus documentaire change la nature de l'audit. Jusqu'ici, la conformité au programme était une hypothèse ; elle est désormais mesurable. Le verdict est double et il n'est pas celui qu'on attendait.

**Le livre est scientifiquement fiable mais matériellement incomplet.** Tous les sondages d'exactitude effectués reviennent conformes : sens de transcription 5'→3', codon d'initiation AUG/méthionine, codons stop UAA/UAG/UGA, potentiel de repos ≈ −70 mV avec pic ≈ +30 mV, profondeur du Moho 5-10 km sous les océans et 30-70 km sous les continents, bilan ATP à 38. Sur le fond, le document mérite crédit. Le problème est ailleurs : **26 501 mots pour couvrir 330 pages de manuel officiel**, avec une densité qui s'effondre précisément sur les unités les plus lourdes du BAC — 48 mots par page officielle sur l'immunologie, 50 sur la communication nerveuse, 40 sur la tectonique. Le livre est un condensé, pas un manuel. Le présenter comme « le programme officiel » revient à sous-estimer d'un facteur 4,7 ce que l'élève doit réellement maîtriser.

**Le livre n'est pas non plus le document officiel qu'il prétend être.** Sa carte de version l'annonce « مُصحَّحة ومُظبوطة لغوياً وعلمياً ومصطلحياً » — corrigée et calibrée linguistiquement, scientifiquement et terminologiquement. Or sept blocs de notes internes révèlent qu'il s'agit de la **correction d'une transcription produite par DeepSeek** (« ملاحظات تصحيح هذا الفصل مقارنة بنسخة DeepSeek المرفوعة »), et l'autoproclamation contient elle-même une faute d'orthographe : *مُظبوطة* pour *مضبوطة*. Quatre autres passages sont du charabia de traduction, dont « التسحيب الأكسدي » là où il faut lire « الفسفرة التأكسدية » (phosphorylation oxydative). Un document qui certifie sa propre exactitude terminologique en écorchant un terme central du programme pose un problème de confiance, pas seulement de relecture.

**Le défaut le plus grave se trouve toutefois dans l'application, et il est structurel.** Sur 508 QCM, **500 — soit 98 % — délivrent une explication au gabarit automatique « X يرتبط هنا بـ : Y », et dans les 500 cas l'explication recopie littéralement le terme mis entre guillemets dans l'énoncé.** L'explication ne justifie rien : elle reformule la question. Longueur médiane 11 mots ; 321 QCM sur 508 tiennent en moins de 12 mots. Or l'application est un tuteur **hors-ligne, sans LLM ni API** : l'explication statique est le seul feedback qu'un élève puisse recevoir après une erreur. Le circuit pédagogique est donc ouvert — l'élève apprend qu'il s'est trompé, jamais pourquoi. Le défaut se propage mécaniquement aux 500 flashcards, dérivées du même champ par un simple `.map()`. **Gravité : Critique.** C'est le point qui doit être traité avant tout autre.

**Trois autres écarts majeurs se confirment.** Le générateur d'épreuves BAC produit des examens à 28, 20 et 34 points selon le domaine, alors que l'épreuve algérienne est notée sur 20 (15 + 5), et des sujets mono-domaine quand l'épreuve réelle croise obligatoirement deux domaines — mais **ce générateur n'est appelé nulle part** : c'est du code mort, requalifié en P3 (§3.1). 30 % des QCM sont méta-scolaires — ils interrogent la définition d'une notion plutôt que son exploitation dans un document expérimental, à rebours de la nature même du BAC algérien. Enfin 57 QCM affichaient un schéma d'un autre domaine — tous concentrés sur l'unité 11, touchée à 93 % ; **ce dernier point a été corrigé au cours de l'audit** (commit `e130475`).

**Un point positif inattendu mérite d'être souligné, car il inverse un reproche courant :** le corpus de leçons HTML de l'application est **plus complet que le livre de référence**. Le mapping des 44 leçons sur les 11 unités officielles est intégralement cohérent, sans trou ni doublon, et l'application traite des notions que le livre omet — le système ABO et le facteur Rhésus, absents du livre (0 occurrence), font l'objet d'une leçon dédiée. Sur le plan de la couverture, l'application ne dérive pas du programme : elle le dépasse.

**Verdict global — Volet A : 6,4/10. Volet B : 5,4/10** *(5,1 à l'ouverture de l'audit ; +0,3 acquis par le Sprint 0).* L'application repose sur des fondations pédagogiques sérieuses (méthodologie des 6 verbes BAC, zéro doublon dans le corpus QCM, couverture complète du programme) mais sa couche d'évaluation — QCM, explications, flashcards, générateur d'épreuves — a été produite par génération automatique sans relecture experte, et c'est là que tout se joue. Après vérification par exécution, **un seul P0 subsiste** : la qualité des explications (constat #1). Deux des quatre P0 annoncés initialement ont été requalifiés — l'un invalidé, l'autre neutralisé par du code mort (§3.1) — et un troisième est corrigé depuis (commit `e130475`). Cette réduction est à la fois une bonne et une mauvaise nouvelle : le chantier est plus étroit qu'il n'y paraissait, mais il se concentre entièrement sur le point le plus coûteux à réparer, **la réécriture experte des 508 explications**, estimée à 10-12 jours-homme. C'est ce seul chantier qui sépare un quiz de reconnaissance d'un véritable tuteur d'entraînement.

---

## 1. Méthodologie et limites de l'audit

### 1.1 Démarche

L'audit croise trois sources : le corpus documentaire fourni par le commanditaire, le code et les données de l'application, et le référentiel prescriptif externe (progression annuelle ministérielle 2025-2026, structure officielle de l'épreuve, annales BAC 2008-2021).

Toutes les mesures quantitatives ont été obtenues par **exécution ou parsing programmatique**, jamais par estimation. Chaque chiffre cité est reproductible via le protocole donné en [Annexe II](#annexe-ii--protocole-de-reproduction-des-mesures).

### 1.2 Correction de méthode appliquée en cours d'audit

Une première série de mesures sur `src/quizCorpus.ts` utilisait des expressions régulières ciblant séparément les champs `questionText` et `explanation`. **Cette méthode est invalide** : elle rate le contenu porté par les options de réponse. Elle avait notamment conclu à tort à l'absence du sujet « 36-38 ATP » dans le corpus, alors que le QCM `id:334` le traite explicitement.

Toutes les mesures ont été refaites par **parsing d'objets JSON complets** (regex multi-champs avec `re.S`), qui restitue bien 508 objets. Les résultats de la première passe ont été écartés. Ce point est documenté ici parce qu'il conditionne la fiabilité de l'ensemble du volet B — et parce qu'une divergence scientifique annoncée par erreur serait plus dommageable qu'un constat manquant.

### 1.3 Limites déclarées

| Limite | Portée | Conséquence sur les conclusions |
|---|---|---|
| **Aucune capture d'écran ni test E2E** | Playwright/Chromium impossibles à installer dans l'environnement (2 tentatives : `fonts-freefont-ttf` exit 100, `ECONNRESET` sur le CDN) | Aucune conclusion sur le rendu visuel réel, l'ergonomie mobile ou les parcours utilisateur bout-en-bout. Les constats UI reposent sur la lecture du code. |
| **`LIVRE manhadijia.txt` illisible** | Encodage détruit, arabe stocké en `?` littéraux ; CP1256 et ISO-8859-6 testés sans succès | Le guide méthodologique n'est exploité qu'à travers son résumé `LIVRE MANHADJIYA.md` (3 Ko). Analyse partielle. |
| **OCR dégradé du parascolaire** | `504601676-…بوزار.txt` produit par CamScanner | Aucune citation littérale possible ; document utilisé pour repérage thématique seulement. |
| **Coquilles dans la table de référence** | `PROGRAMME NATIONAL SCIENCE VIE BAC - Copie.txt` l.58 porte « الحزينات الدفاعية » pour « الجزيئات الدفاعية » | La grille de conformité fine comporte elle-même des erreurs OCR. Les correspondances de titres ont été validées manuellement, pas automatiquement. |
| **Pas de PDF officiel scanné** | Le livre invoque une « vérification visuelle des pages du PDF officiel » ; ce PDF n'est pas dans le dépôt | La conformité au manuel ONPS réel ne peut être vérifiée qu'indirectement, via la table des matières paginée. |

Ces limites ne remettent en cause aucun des constats P0, qui reposent tous sur des mesures directes sur le code source.

---

## 2. Inventaire critique du corpus fourni

| Document | Volume | Nature réelle | Fiabilité | Usage retenu |
|---|---|---|---|---|
| `الكتاب_المصحح_v1.0.md` | 2 586 l. · **26 501 mots** | Condensé corrigé d'une transcription DeepSeek du manuel ONPS | Scientifiquement fiable, rédactionnellement fautif, matériellement incomplet | **Référence d'autorité** (désignation du commanditaire) |
| `PROGRAMME NATIONAL SVT CLAUDE OPUS - Copie.MD` | 10 007 l. · **46 368 mots** | Version enrichie par unité : objectifs, problématiques, exercices corrigés | Contenu riche ; **hiérarchie Markdown cassée** | Source de contenu pédagogique, non de structure |
| `PROGRAMME NATIONAL SCIENCE VIE BAC - Copie.txt` | 180 l. · 1 181 mots | Table des matières officielle paginée, bilingue AR/FR | Bonne, quelques coquilles OCR | **Grille de conformité fine** (pagination = proxy de volume attendu) |
| `504601676-…بوزار.txt` | 2 254 l. | Parascolaire « عكاشة » : méthodologie BAC, 500 points clés | OCR dégradé | Repérage thématique uniquement |
| `LIVRE manhadijia.txt` / `LIVRE MANHADJIYA.md` | 2 123 l. / 3 Ko | Guide méthodologique (verbes de consigne) | `.txt` inexploitable ; `.md` lisible | Validation de la méthodologie des 6 verbes |

**Constat transversal — Modéré.** Le corpus n'est pas un jeu de documents officiels : c'est un ensemble de **retraitements automatiques** de sources officielles, à des stades de qualité inégaux. Trois des cinq documents portent des traces d'outillage IA ou OCR non relu. Cela n'invalide pas leur usage — mais impose de traiter chaque divergence livre↔app comme une question ouverte plutôt que comme une faute de l'application.

---

# VOLET A — Audit du livre en soi

## A1. Statut réel du document : ce que la carte de version ne dit pas

### Constat

Le livre s'ouvre sur un appareil d'autorité complet : République algérienne, Ministère de l'Éducation nationale, référence à l'ONPS, nom de l'inspecteur superviseur (بوشلاغم عبد العالي), liste des cinq auteurs, responsable technique. Puis une carte de version :

> ⚖️ **بطاقة النسخة المصحّحة:** هذه نسخة تعليمية مُصحَّحة ومُظبوطة لغوياً وعلمياً ومصطلحياً وفق الكتاب الرسمي

Cette présentation induit qu'on lit le manuel officiel. **Le corps du document dit autre chose.** Sept blocs de notes internes, un par chapitre, sont explicites :

> **📝 ملاحظات تصحيح هذا الفصل مقارنة بنسخة DeepSeek المرفوعة:**

*(lignes 607, 847, 1070, 1341, 1570, 1756, 1952)*

Et huit blocs « موارد التصحيح » précisent la chaîne de production :

> **موارد التصحيح:** تفريغ الكتاب الرسمي (الملف المرفوع) + ملف البرنامج الوطني + التحقق البصري من صفحات الـ PDF الرسمي

Le mot **التفريغ** (« la transcription ») revient 24 fois. Le document est donc : *manuel ONPS → transcription automatique → passage DeepSeek → correction humaine partielle*. Trois transformations séparent le texte lu de la source officielle.

### Évaluation

Ce statut n'est pas disqualifiant — **la démarche de correction est réelle et traçable**, ce qui est plus que ce qu'offrent la plupart des supports parascolaires. Les notes de correction sont précises et pédagogiquement justes : distinction des liaisons de structure secondaire (entre groupements peptidiques) et tertiaire (entre radicaux R) qui étaient fusionnées ; séparation de « la double reconnaissance » et de « la sélection clonale » qui étaient mélangées ; suppression d'une référence fantôme à une « expérience de Falk » inexistante dans le texte officiel. C'est du travail d'expert.

Le problème est le **décalage entre l'autorité affichée et le statut réel**. Un élève qui lit « النسخة المصحّحة » sous l'en-tête ministériel croit tenir le manuel ; il tient un condensé retraité à 26 501 mots.

### Gravité, impacts, recommandation

| | |
|---|---|
| **Gravité** | **Majeur** |
| **Preuve** | l.26 (carte de version) vs l.607/847/1070/1341/1570/1756/1952 (notes DeepSeek) ; 24 occurrences de `التفريغ` |
| **Impact apprenant** | Fausse sécurité : l'élève cesse de consulter le manuel officiel en croyant l'avoir. Risque maximal sur les unités à faible densité (immunologie, neuro, tectonique). |
| **Impact produit** | Risque de réputation si l'app est perçue comme diffusant un « faux manuel officiel ». Exposition juridique non nulle vis-à-vis de l'ONPS. |
| **Recommandation** | Requalifier explicitement le document en tête : « ملخّص مصحَّح ومراجَع — لا يُغني عن الكتاب الرسمي ». Ajouter un renvoi de pagination officielle en tête de chaque unité. |
| **Effort** | Faible (1 j) |
| **Priorité** | **P1** |

---

## A2. Exactitude scientifique

### Constat — le livre tient la route

Les sondages ciblés portant sur les points les plus fréquemment fautifs dans les supports parascolaires reviennent **tous conformes** :

| Notion vérifiée | Attendu | Trouvé dans le livre | Statut |
|---|---|---|---|
| Sens de la transcription | 5' → 3' | 5' → 3' | ✅ |
| Codon d'initiation | AUG / méthionine | AUG / Met | ✅ |
| Codons stop | UAA, UAG, UGA | UAA, UAG, UGA | ✅ |
| Code génétique | 61 codants + 3 stop = 64 ≠ 20 aa | Formulé explicitement (l.601) | ✅ |
| Potentiel de repos | ≈ −70 mV | ≈ −70 mV | ✅ |
| Pic du potentiel d'action | ≈ +30 mV | ≈ +30 mV | ✅ |
| Moho — croûte océanique | 5-10 km | 5-10 km | ✅ |
| Moho — croûte continentale | 30-70 km | 30-70 km | ✅ |
| Bilan ATP respiration | 36-38 selon convention | **38** (2 + 2 + ≈34), NADH ≈2,5/3, FADH₂ ≈1,5/2 | ✅ |
| Bilan fermentation | 2 ATP | 2 | ✅ |

Le traitement du bilan ATP mérite mention favorable : le livre ne se contente pas d'un chiffre, il expose les coefficients stœchiométriques (NADH ≈ 2,5 à 3 ATP, FADH₂ ≈ 1,5 à 2) qui expliquent pourquoi la littérature oscille entre 36 et 38. C'est exactement le niveau de nuance attendu en terminale scientifique.

### Point de vigilance résolu

Une divergence potentielle livre↔application sur le rendement ATP avait été suspectée. **Vérification close : elle n'existe pas.** Le parsing complet du corpus QCM montre que seuls **2 QCM sur 508** touchent aux valeurs 30/32/36/38 — `id:334` (« الحصيلة القديمة 36-38 », unité 8) et `id:417` (profondeur du Moho, unité 10). Le livre affirme 38, l'application ne le contredit pas.

### Évaluation

**Crédit à porter au livre.** Sur le seul critère de la justesse scientifique, ce document est supérieur à une bonne partie de l'offre parascolaire algérienne. Le reproche qui suit porte sur la **densité et les manques**, pas sur l'exactitude.

| | |
|---|---|
| **Score de la sous-dimension** | **8,5/10** |
| **Constats positifs** | 10/10 sondages conformes ; nuance stœchiométrique sur l'ATP ; notes de correction scientifiquement pertinentes |
| **Réserve** | Le motif « ondes S / milieu liquide » n'a rien retourné (formulation différente) — non concluant, non bloquant |

---

## A3. Qualité rédactionnelle et terminologique

### Constat

Le document certifie sa propre exactitude linguistique et terminologique. Cinq passages la démentent :

| # | Passage fautif | Lecture correcte | Nature |
|---|---|---|---|
| 1 | « انطلاقاً من مثل مين مثل -70mV » | *(charabia — segment non reconstituable)* | Résidu de traduction automatique |
| 2 | « المرتبط بالغشية (مادامية) » | *الغشائية* | Déformation morphologique |
| 3 | « التسحيب الأكسدي » **(×2)** | **الفسفرة التأكسدية** — phosphorylation oxydative | **Terme central du programme écorché** |
| 4 | « بحث الطاقة الجسيم يأتي لاحقاً من التسحيب الأكسدي » | *(phrase non grammaticale)* | Traduction automatique non relue |
| 5 | « مُظبوطة » *(dans la carte de version elle-même)* | **مضبوطة** | Faute d'orthographe dans l'autocertification |

Le cas n°3 est le plus sérieux. **الفسفرة التأكسدية** est l'intitulé officiel d'une activité du programme (p.215 de la table de référence) et un attendu récurrent au BAC. Un élève qui mémorise « التسحيب الأكسدي » emploiera un terme inexistant dans sa copie d'examen.

Le cas n°5 est le plus révélateur : une faute d'orthographe **dans la phrase qui certifie l'absence de fautes d'orthographe**. Il indique qu'aucune relecture linguistique complète n'a eu lieu, contrairement à ce qui est affirmé.

### Gravité, impacts, recommandation

| | |
|---|---|
| **Gravité** | **Modéré** (5 occurrences localisées sur 26 501 mots — mais dont une terminologique lourde) |
| **Preuve** | 5 occurrences localisables par `grep` ; voir [Annexe II](#annexe-ii--protocole-de-reproduction-des-mesures) |
| **Impact apprenant** | Mémorisation d'un terme erroné sur une notion à fort rendement au BAC ; perte de confiance quand l'élève bute sur du charabia |
| **Impact produit** | Contredit frontalement l'argument de vente « corrigé et vérifié » |
| **Recommandation** | 1) Correction immédiate des 5 occurrences (30 min). 2) Passe de relecture humaine ciblée sur les 3 unités les plus denses. 3) Retirer ou nuancer l'autocertification tant que la relecture complète n'est pas faite. |
| **Effort** | **Faible** (correction ponctuelle : < 1 j) |
| **Priorité** | **P1** — coût dérisoire, bénéfice de crédibilité immédiat |

---

## A4. Densité et couverture par unité

### Mesure

Le rapport entre le volume rédigé et la pagination officielle donne un indicateur direct de compression. Sur une base de **26 501 mots pour ~330 pages de manuel**, la moyenne s'établit à ~80 mots/page — là où un manuel réel en compte 350 à 400.

| Domaine / Unité | Pages officielles | Mots/page | Lecture |
|---|---|---|---|
| D1-I — Synthèse des protéines | p.1-39 | **188** | ✅ Correct |
| D1-II — Structure/fonction | p.39-57 | **146** | ✅ Correct |
| D1-III — Enzymes | p.57-73 | **159** | ✅ Correct |
| **D1-IV — Immunologie** | **p.73-127 (11 act.)** | **48** | 🔴 **Effondrement** |
| **D1-V — Communication nerveuse** | **p.127-174 (7 act.)** | **50** | 🔴 **Effondrement** |
| D2-I — Photosynthèse | p.174-205 (4 act.) | **55** | 🟠 Faible |
| D2-II — Respiration / ATP | p.205-227 (6 act.) | **88** | 🟠 Faible |
| D2-III — Comparaison / cycle | p.227-237 | **118** | 🟡 Acceptable |
| D3-I — Tectonique des plaques | p.237-259 (3 act.) | **73** | 🟠 Faible |
| D3-II — Structure interne | p.259-287 (3 act.) | **58** | 🟠 Faible |
| **D3-III — Magmatisme / orogenèse** | **p.287-330 (8 act.)** | **40** | 🔴 **Effondrement** |

### Analyse

Le profil de compression n'est pas aléatoire : **le livre est détaillé sur ce qui est facile à rédiger et laconique sur ce qui est difficile.** Les trois unités les plus compressées — immunologie (54 pages officielles, 11 activités), communication nerveuse (47 pages, 7 activités), magmatisme et orogenèse (43 pages, 8 activités) — sont précisément celles qui concentrent le plus d'activités documentaires au programme et qui tombent le plus souvent au BAC.

L'unité 1 (synthèse des protéines) est traitée à 188 mots/page, soit **4,7 fois** la densité de l'unité de tectonique. Cette asymétrie se retrouve à l'identique dans l'application : les assets visuels sont massivement concentrés sur `domaine1_proteines/` (101 fichiers) et les 3 seules leçons interactives portent toutes sur `d1-u1`. **Le même biais de production traverse le livre et l'app** — les deux ont été construits en commençant par le début, sans jamais rattraper la fin.

### Gravité, impacts, recommandation

| | |
|---|---|
| **Gravité** | **Majeur** |
| **Preuve** | Table ci-dessus ; pagination issue de `PROGRAMME NATIONAL SCIENCE VIE BAC - Copie.txt` |
| **Impact apprenant** | Sous-préparation sur 3 unités à fort rendement d'examen. Un élève qui réviserait exclusivement sur ce livre aborderait l'immunologie avec ~2 600 mots pour 54 pages de programme. |
| **Impact business** | Le point de rupture d'un produit de révision est le premier chapitre mal couvert que l'élève rencontre. Ici il arrive dès l'unité 4. |
| **Recommandation** | Plan de rattrapage ciblé : porter D1-IV, D1-V et D3-III à ≥120 mots/page, en priorité sur les activités documentaires listées dans la table officielle (soi/non-soi p.76, complexe immun p.87, LTc p.98-100, synapse p.130, potentiel d'action p.140, dorsales p.288, subduction p.302). |
| **Effort** | **Élevé** (rédaction experte : 15-20 j) |
| **Priorité** | **P2** |

---

## A5. Notions absentes

### Mesure

Recherche exhaustive sur toutes les graphies arabes et latines plausibles :

| Notion | Occurrences dans le livre | Statut programme | Verdict |
|---|---|---|---|
| **Système ABO** | **0** (`ABO`, `الزمر الدموية`) | Au programme (D1-IV) | 🔴 **Absent** |
| **Facteur Rhésus** | **0** (`Rh`, `ريزوس`, `الريزوس`) | Au programme (D1-IV) | 🔴 **Absent** |
| Sélection / انتخاب نسيلي | 4 (traité l.1177-1180) | Au programme | ✅ Présent |
| Interleukines | 1 seule mention, **graphie fautive** : « الأترولينات (Interleukines — مثل IL2) » l.1238 | Au programme, activité dédiée | 🟠 **Quasi-absent + faute** |
| SIDA / VIH | 5 + 7 occurrences | Au programme (p.108) | ✅ Présent |
| دليل التصحيح (guide de correction) | **0** — pourtant **promis en l.26** | Promesse interne | 🔴 **Absent** |

### Analyse

Deux observations décisives.

**Première : l'absence d'ABO/Rh est confirmée et significative.** Ces notions figurent au programme de l'unité immunologie et servent de porte d'entrée classique à la notion de marqueur du soi. Leur absence totale du livre — zéro occurrence sur six graphies testées — est un trou de couverture réel, cohérent avec la densité de 48 mots/page mesurée sur cette unité.

**Seconde, et elle inverse la charge : l'application couvre ces notions que le livre omet.** `phase5_chapitres_9_10.html` porte le titre explicite « الدرس 2 : نظام الزمر الدموية ABO والعامل الريزوسي Rh », avec 5 occurrences de `ABO` et 2 de `الزمر الدموية` dans le corpus de leçons. **Sur ce point précis, l'application est plus conforme au programme que le document présenté comme référence.** Ce constat impose la prudence méthodologique posée en §2 : une divergence livre↔app n'est pas automatiquement une faute de l'app.

Le cas des interleukines cumule les deux défauts du livre : notion réduite à une incise alors qu'elle porte une activité entière du programme, **et** graphie fautive — « الأترولينات » n'existe pas en arabe scientifique ; il faut lire « الإنترلوكينات ». À verser au registre de [A3](#a3-qualité-rédactionnelle-et-terminologique).

L'absence du **دليل التصحيح** est d'une autre nature : c'est une **promesse non tenue**. La ligne 26 l'annonce ; le document ne le contient pas. Pour un support de révision BAC, le guide de correction est souvent l'élément le plus utilisé.

### Gravité, impacts, recommandation

| | |
|---|---|
| **Gravité** | **Majeur** (ABO/Rh + دليل التصحيح) · **Modéré** (interleukines) |
| **Preuve** | 0 occurrence sur 6 graphies ABO/Rh ; l.26 vs absence de corrigé ; l.1238 graphie « الأترولينات » |
| **Impact apprenant** | Impasse complète sur une notion d'examen ; impossibilité de s'auto-corriger faute de guide |
| **Recommandation** | 1) Rédiger la section ABO/Rh (~1 200 mots). 2) Corriger « الأترولينات » → « الإنترلوكينات » et développer l'activité. 3) Produire le دليل التصحيح promis, **ou** retirer la promesse de la l.26. 4) **Réutiliser le contenu ABO/Rh déjà présent dans `phase5_chapitres_9_10.html`** — le travail est déjà fait côté app. |
| **Effort** | Moyen (3-5 j), réduit par la réutilisation |
| **Priorité** | **P1** |

---

## A6. Appareil pédagogique : figures, corrigés, guide de correction

### Constat

| Élément | Attendu | Mesuré | Écart |
|---|---|---|---|
| **Figures / schémas** | Le manuel officiel est construit sur l'exploitation de documents | **0** (`![]()` : zéro occurrence) | 🔴 Total |
| **Réponses types** | Corrigés d'exploitation documentaire | 67 réponses types | 🟡 Présent mais inégal |
| **Additions éditoriales** | — | 5 « إضافة تحريرية » pour 67 réponses | 🟠 Couverture 7 % |
| **دليل التصحيح** | Promis l.26 | **0** | 🔴 Absent |

### Analyse

**Zéro figure est rédhibitoire pour une discipline documentaire.** Le BAC SVT algérien n'évalue pas la restitution : il évalue l'analyse de documents — courbes, électrophorèses, coupes histologiques, cartes sismiques, profils de vitesse. La table officielle le confirme activité par activité : « الوثيقة (1) ص 238 (خريطة الزلازل والبراكين) » avec sa consigne officielle de report sur papier calque. Un livre sans figures ne peut pas préparer à cette épreuve, quelle que soit la qualité de son texte.

L'explication se trouve dans le document OPUS. Celui-ci contient une section intitulée « **وصف الرسوم التوضيحية (لتوليدها بأدوات الذكاء الاصطناعي)** » — description des illustrations *en vue de leur génération par des outils d'IA*. **Les figures n'ont jamais été produites : elles ont seulement été décrites pour une génération ultérieure qui n'a pas eu lieu.** Les 0 figure du livre corrigé sont la conséquence directe de cette chaîne de production interrompue.

Ce constat crée une opportunité concrète : les descriptions existent déjà, et l'application dispose de **101 assets SVG/JPG locaux** sur `domaine1_proteines/`. Le raccordement est un travail d'intégration, pas de création.

| | |
|---|---|
| **Gravité** | **Critique** pour l'usage « préparation BAC » du livre seul |
| **Preuve** | 0 `![]()` dans 2 586 lignes ; section « وصف الرسوم التوضيحية » dans OPUS ; 101 assets dans `public/assets/images/schemas/domaine1_proteines/` |
| **Impact apprenant** | Aucun entraînement à l'analyse documentaire — la compétence effectivement notée |
| **Recommandation** | 1) Générer les figures à partir des descriptions OPUS déjà rédigées. 2) Prioriser les documents nommés dans la table officielle. 3) Réutiliser les 101 assets existants pour le domaine 1. |
| **Effort** | Moyen à élevé (8-12 j) |
| **Priorité** | **P1** |

---

## A7. Le document OPUS : hiérarchie cassée

### Constat

`PROGRAMME NATIONAL SVT CLAUDE OPUS - Copie.MD` est le document le plus riche du corpus : **46 368 mots**, 457 titres de niveau 2, avec objectifs, problématiques et exercices corrigés par unité. Sa structure Markdown est en revanche défaillante :

- **20 titres de niveau 1 dont 10 sont des doublons** — chaque `# المجال…` est répété avant chaque unité.
- **L'unité 2 du domaine 2 (respiration cellulaire / fermentation) n'a aucun titre de niveau 1.** Son en-tête est noyé en texte brut dans un bloc de citation `>` aux lignes 5150-5165, *à l'intérieur* de l'unité 1.

Le contenu, lui, existe bien : cycle de Krebs 28 occurrences, glycolyse 33, phosphorylation oxydative 22, fermentation 43. **C'est la hiérarchie qui est cassée, pas le contenu.**

Unités détectables par titre : D1 → 1,2,3,4,5 · D2 → 1 et 3 (**2 masquée**) · D3 → 1,2,3. Soit **10 unités visibles sur 11**.

### Impact

Tout parseur, générateur de sommaire ou script d'import automatique **perdra silencieusement une unité sur onze** — et pas n'importe laquelle : la respiration cellulaire, cœur du domaine 2. Le risque est d'autant plus élevé que ce document est le candidat naturel pour alimenter en contenu les unités faibles identifiées en [A4](#a4-densité-et-couverture-par-unité).

| | |
|---|---|
| **Gravité** | **Majeur** (bloquant pour toute automatisation) |
| **Preuve** | 457 `##`, 20 `#` dont 10 doublons ; en-tête D2-U2 en texte brut l.5150-5165 |
| **Impact produit** | Toute reprise automatique du contenu OPUS importera 10 unités sur 11 sans lever d'erreur — défaut silencieux, donc dangereux |
| **Recommandation** | 1) Promouvoir l'en-tête l.5150-5165 en titre `#` de niveau 1. 2) Dédupliquer les 10 titres de domaine. 3) Ajouter un test de structure : « 11 unités détectées, sinon échec ». |
| **Effort** | **Très faible** (< 2 h) |
| **Priorité** | **P1** — meilleur rapport effort/bénéfice de tout l'audit |

---

## A8. Score du volet A

| Sous-dimension | Score | Justification |
|---|---|---|
| A1 — Statut et transparence | **5,0** | Démarche de correction réelle et traçable, mais autorité affichée décalée du statut réel |
| A2 — Exactitude scientifique | **8,5** | 10/10 sondages conformes, nuance stœchiométrique appréciable |
| A3 — Qualité rédactionnelle | **5,5** | 5 fautes dont une terminologique lourde et une dans l'autocertification |
| A4 — Densité et couverture | **4,5** | Effondrement à 40-50 mots/page sur les 3 unités les plus lourdes du BAC |
| A5 — Complétude notionnelle | **5,0** | ABO/Rh absents, interleukines quasi-absentes, دليل التصحيح promis non livré |
| A6 — Appareil pédagogique | **3,0** | 0 figure dans une discipline documentaire ; 7 % d'additions éditoriales |
| A7 — Intégrité structurelle (OPUS) | **4,0** | 1 unité sur 11 invisible à tout parseur |
| **VOLET A — moyenne pondérée** | **6,4/10** | Fond scientifique solide, forme et complétude défaillantes |

*Pondération : A2 et A4 comptent double (exactitude et couverture priment sur la forme).*

---

# VOLET B — Diff livre ↔ application

## B1. Couverture structurelle : 11 unités vs 44 leçons

### Mesure — mapping intégral vérifié

L'application expose **23 fichiers HTML** dans `public/lessons/` : 22 fichiers « phase » couvrant les leçons 1 à 44, plus `lecon_transcription.html`. La correspondance avec les 11 unités officielles a été vérifiée titre par titre :

| Phases | Leçons | Unité officielle | Conformité |
|---|---|---|---|
| P1-P2 | 1-4 | D1-I Synthèse des protéines | ✅ |
| P3 | 5-6 | D1-II Structure/fonction + D1-III Enzymes | ✅ |
| P4 | 7-8 | D1-III Enzymes (pH, température) | ✅ |
| P5-P7 | 9-14 | D1-IV Immunologie | ✅ **dont ABO/Rh** |
| P8-P10 (l.19) | 15-19 | D1-V Communication nerveuse | ✅ dont drogues |
| P10 (l.20)-P12 | 20-24 | D2-I Photosynthèse | ✅ |
| P13-P14 | 25-28 | D2-II Respiration / fermentation | ✅ |
| P15 | 29-30 | D2-III Comparaison / cycle de la matière | ✅ |
| P16-P18 | 31-36 | D3-I Tectonique des plaques | ✅ |
| P19-P20 | 37-40 | D3-II Structure interne du globe | ✅ |
| P21-P22 (l.43) | 41-43 | D3-III Magmatisme / orogenèse | ✅ dont ophiolites, collision |
| P22 (l.44) | 44 | Ressources géologiques et énergétiques en Algérie | 🟠 **hors table officielle** |
| `lecon_transcription.html` | 3 | D1-I (transcription) | ✅ complète la série |

**Verdict : le mapping est intégralement cohérent. Aucun trou, aucun doublon, aucune unité manquante.** La numérotation « chapitres 1→44 » n'est pas une dérive : c'est un découpage plus fin — 4 leçons par unité en moyenne — parfaitement aligné sur la structure officielle en 3 domaines / 11 unités.

### Deux corrections apportées à l'audit v2

**Correction 1 — la leçon 44 n'est pas hors référentiel.** Un constat antérieur signalait `phase22_chapitres_43_44.html` comme hors programme, aucune ressource énergétique ne figurant dans la table officielle. Le titre exact est « **الموارد الجيولوجية والطاقوية في الجزائر (تشكل ومصائد البترول)** ». Cette leçon n'apparaît effectivement pas dans la table paginée, mais elle relève d'un prolongement légitime du domaine 3 à visée de contextualisation nationale — pratique courante et encouragée. À requalifier : **contenu additionnel assumé, non erreur de conformité.** Gravité ramenée de Majeur à **Mineur** (signaler à l'élève que ce n'est pas exigible tel quel).

**Correction 2 — `lecon_transcription.html` n'est pas un orphelin.** Ce fichier hors nomenclature « phase » porte « الدرس 3 : استنساخ المعلومات الوراثية » et comble précisément le saut entre P2 (leçons 1-2, puis 4-5) et P3. La série 1→44 est donc complète. Simple incohérence de nommage, sans impact fonctionnel. Gravité : **Mineur**.

### Le vrai problème est ailleurs : leçons statiques vs interactives

| Élément | Compte | Couverture |
|---|---|---|
| Leçons HTML statiques | **23** (1 184-1 571 mots) | 11/11 unités ✅ |
| Leçons **interactives** (`ACTIVE_LESSONS`) | **3** | **Toutes sur `d1-u1`** 🔴 |
| `SINGLE_PATH_LESSONS` | 2 | — |
| `EXPERIMENTAL_LESSONS` | **0** | — |
| `LESSON_GOLD_SUMMARIES` | 13 | Partielle |
| Unités déverrouillées (`unitCatalog.ts`) | **1 / 11** (10 × `isLocked: true`) | 🔴 |

**C'est le même biais qu'en [A4](#a4-densité-et-couverture-par-unité).** La couverture textuelle est complète ; la couverture *interactive* s'arrête à l'unité 1. Et 10 unités sur 11 sont verrouillées — un élève qui installe l'app en mai n'a accès qu'à la synthèse des protéines.

| | |
|---|---|
| **Gravité** | **Majeur** (3 leçons interactives / 11 unités) · *le grief « 10 unités verrouillées » est invalidé, voir §3.1* |
| **Preuve** | `ACTIVE_LESSONS` toutes `d1-u1`. Le `grep -c "isLocked: true"` → 10 mesure l'**état initial** de `unitCatalog.ts` : `App.tsx:268` déverrouille l'unité `n+1` dès 60 % de réussite. |
| **Impact apprenant** | L'expérience promise n'existe que sur 1/11 du programme. La progression séquentielle peut gêner une révision ciblée en fin d'année, mais elle ne bloque pas. |
| **Recommandation** | 1) Étendre le format interactif à au moins 1 leçon par unité, en priorité D1-IV, D1-V, D3-III. 2) Offrir un mode « révision libre » ouvrant toutes les unités en fin d'année (confort, non bloquant). |
| **Effort** | Élevé (interactivité : 20-30 j) / Faible (mode révision libre) |
| **Priorité** | **P2** (interactivité) / **P3** (mode révision libre) |

---

## B2. CRITIQUE — 98 % d'explications circulaires

### Mesure

Parsing par objets complets sur `src/quizCorpus.ts` (508 QCM ; le README en annonce 500) :

| Indicateur | Valeur |
|---|---|
| QCM au gabarit « **X يرتبط هنا بـ : Y** » | **500 / 508 — 98 %** |
| Parmi eux, explications recopiant **littéralement** le terme `«X»` de l'énoncé | **500 / 500 — 100 %** |
| Longueur médiane de l'explication | **11 mots** |
| Longueur minimale | 7 mots |
| QCM dont l'explication fait **< 12 mots** | **321 / 508 — 63 %** |
| QCM échappant au gabarit | **8** |

### Analyse

Le gabarit fonctionne ainsi : la question demande « quelle description correspond à **«الغابرو»** ? », et l'explication répond « **الغابرو** يرتبط هنا بـ : [libellé de la bonne réponse] ». **L'explication reformule la question en y insérant la réponse.** Elle n'apporte aucun élément de raisonnement, aucune cause, aucun mécanisme, aucun contre-exemple, aucune levée de confusion avec les notions voisines.

Ce défaut serait secondaire dans une application connectée à un modèle de langage, capable de générer une explication à la volée. **Il est critique ici.** Le README pose l'architecture : *tuteur local, 100 % hors-ligne, sans LLM ni API*. L'explication statique n'est pas une aide parmi d'autres — **c'est le seul feedback que l'élève puisse jamais recevoir après une erreur.** Le circuit pédagogique fondamental (erreur → diagnostic → correction → consolidation) est ouvert au deuxième maillon, pour 98 % du corpus.

**Mesure affinée pendant le Sprint 0.** L'écriture du test de non-régression a permis de préciser l'ampleur du défaut, et elle est pire qu'estimé en première lecture : au-delà des 500 explications circulaires, **les 508 explications du corpus font moins de 25 mots — sans exception**. La plus longue en compte 22, la médiane 11. Aucune explication du produit n'atteint donc le volume minimal d'une justification exploitable. Ce n'est pas un problème de qualité inégale à corriger par retouches : c'est **l'absence structurelle de contenu explicatif**, qui impose une réécriture et non une révision.

### Propagation

Le défaut ne reste pas confiné aux QCM. En fin de `src/quizCorpus.ts`, `SVT_FLASHCARDS` est dérivée par `.map()` : le champ `answerBullets` est construit à partir de la réponse correcte **et du champ `explanation`**. **Les 500 flashcards héritent donc mécaniquement des 500 explications circulaires.** Le défaut contamine le module de révision espacée — c'est-à-dire le dispositif censé assurer la rétention à long terme.

**Avancement au 12/08/2026.** Deux lots de réécriture sont exécutés, soit **172 QCM sur 508 (33,9 %)** :

| Lot | Unités | QCM | Circulaires restantes | < 25 mots restantes |
|---|---|---|---|---|
| — | *état initial* | — | 500 | 508 |
| Lot 1 | U11 — Tectonique des plaques (ids 440-500) | 61 | **439** | **447** |
| Lot 2 | U4 — Immunité (114-161) + U5 — Communication nerveuse (162-216) | 103 | **336** | **344** |

Chaque explication réécrite fait 26 à 43 mots et suit le canevas *mécanisme → réfutation du distracteur → mot-clé BAC* ; les flashcards correspondantes sont réparées par dérivation automatique. Le score B2 passe de **1,5 à 2,5/10** : le tiers traité est désormais d'un niveau exploitable, mais **66 % du corpus reste circulaire** et un score de qualité de feedback ne se relève pas sur un tiers du volume. Il sera réévalué lot par lot. Voir les journaux d'exécution en [§4, Sprint 1](#sprint-1--feedback--le-sprint-qui-compte--lots-1-et-2-exécutés).

Il faut aussi relier ce constat à celui de [B3](#b3-majeur--30--de-qcm-méta-scolaires) : énoncés méta-scolaires et explications circulaires sont **produits par la même chaîne de génération automatique**. Ce n'est pas deux défauts, c'est un seul — un corpus généré sans relecture experte.

### Gravité, impacts, recommandation

| | |
|---|---|
| **Gravité** | 🔴 **CRITIQUE** — le constat le plus grave de l'audit |
| **Preuve** | 500/508 au gabarit, 500/500 recopiant l'énoncé ; médiane 11 mots ; `SVT_FLASHCARDS` = `.map()` sur `explanation` |
| **Impact apprenant** | Aucun apprentissage par l'erreur. L'élève qui se trompe reste sans explication — dans une app conçue pour être son seul tuteur. Le taux de progression réel plafonne quel que soit le temps passé. |
| **Impact business** | Contredit la proposition de valeur centrale (« tuteur »). Défaut immédiatement perceptible par un enseignant évaluateur ou un parent — obstacle rédhibitoire à toute prescription institutionnelle. |
| **Recommandation** | 1) **Rédiger manuellement les explications des 3 unités les plus exposées au BAC** (D1-IV, D1-V, D3-III ≈ 150 QCM) selon un canevas imposé : *mécanisme → pourquoi les distracteurs sont faux → mot-clé attendu au BAC*, minimum 35 mots. 2) Étendre ensuite au reste du corpus. 3) **Ajouter un test de non-régression bloquant** : rejeter toute explication qui contient le terme entre guillemets de l'énoncé **ou** qui fait moins de 25 mots. 4) Régénérer les flashcards après correction. |
| **Effort** | Élevé (150 QCM ≈ 8-10 j experts ; corpus complet ≈ 25-30 j) — **mais le test de non-régression coûte 2 h et empêche toute rechute** |
| **Priorité** | 🔴 **P0 — avant toute autre action** |

---

## B3. MAJEUR — 30 % de QCM méta-scolaires

### Mesure

**153 QCM sur 508 (30 %)** relèvent de trois gabarits qui interrogent la forme scolaire de la notion plutôt que la notion elle-même :

| Gabarit | Nature |
|---|---|
| `أي وصف دقيق لـ«X»؟` — « quelle description exacte de X ? » | Reconnaissance de définition |
| `أي عبارة تساعد على تمييز «X» عن المفاهيم القريبة؟` — « quelle formule aide à distinguer X des notions voisines ? » | **Méta-cognitif : porte sur la formule, pas sur la notion** |
| `أي إكمال صحيح: «X» ← ________؟` | Texte à trous — **50 QCM (10 %)** |

### Analyse

Le second gabarit est le plus problématique : il ne demande pas de distinguer deux notions, mais d'identifier *quelle phrase aide à les distinguer*. L'élève apprend à reconnaître un énoncé de cours, pas à mobiliser un concept.

Cette orientation est **structurellement désalignée avec l'épreuve algérienne**. Les sources externes consultées sont sans ambiguïté :

- **Structure officielle** : deux parties indépendantes portant sur des **domaines différents**. Partie 1 = **15 points**, 2 exercices, ≤2 documents chacun. Partie 2 = **5 points**, situation d'intégration, ≤3 documents, ≤2 questions.
- **Sujet BAC 2021** : « التمرين الثاني : 07 نقاط », thèmes ribonucléase, interleukines/LT4, code génétique chez *Tetrahymena* — **évaluation par analyse expérimentale documentée**.

**Aucun QCM au BAC SVT algérien.** L'épreuve évalue l'exploitation de documents, la formulation d'hypothèses, la comparaison argumentée. Un corpus dont 30 % entraîne la reconnaissance de définitions optimise une compétence qui ne sera pas notée.

Nuance à porter au crédit du produit : le QCM reste un excellent outil de *consolidation mémorielle* et il alimente la révision espacée. Le problème n'est pas son existence, c'est qu'il soit **le mode d'évaluation dominant** sans passerelle vers l'analyse documentaire.

| | |
|---|---|
| **Gravité** | **Majeur** |
| **Preuve** | 153/508 sur 3 gabarits ; 50 QCM texte à trous ; structure officielle 15+5 sur 2 domaines |
| **Impact apprenant** | Illusion de maîtrise : scores élevés en QCM, effondrement sur épreuve documentaire |
| **Recommandation** | 1) Requalifier les QCM en « échauffement / mémorisation », pas en « entraînement BAC ». 2) Convertir les 153 méta-scolaires en questions appuyées sur un document (`documentAnalysisExercises.ts` existe déjà). 3) Faire de l'analyse documentaire le mode par défaut du module d'entraînement. |
| **Effort** | Moyen à élevé (10-15 j) |
| **Priorité** | **P1** |

---

## B4. MAJEUR — Barème BAC non conforme ⚠️ *(requalifié P3 : code mort)*

### Mesure — par exécution du générateur

| Domaine | Exercices générés | **Points générés** | Durée | **Barème officiel** | Écart |
|---|---|---|---|---|---|
| 1 — Protéines et immunité | 6 | **28** | 50 min | 20 (15+5) | **+40 %** |
| 2 — Transformations énergétiques | 4 | **20** | 80 min | 20 (15+5) | conforme |
| 3 — Tectonique globale | 7 | **34** | 110 min | 20 (15+5) | **+70 %** |

Cause identifiée dans `src/utils/bacGenerator.ts` : barème interne de **4 points par carte de connaissance + 6 points par boss**, **sans plafond**. Le corpus (`KNOWLEDGE_CARDS` 27/25/24 = 76 + 7 boss) est échantillonné aléatoirement — d'où la nécessité de citer les valeurs **mesurées par exécution** (28/20/34) et non un comptage statique.

### Second écart, plus structurel

Les examens générés sont **mono-domaine**. L'épreuve officielle croise obligatoirement **deux domaines différents** entre la partie 1 et la partie 2. Un élève entraîné exclusivement sur des sujets mono-domaine découvrira la structure réelle le jour J.

Les durées sont également incohérentes entre elles (50 / 80 / 110 min pour une épreuve de durée fixe).

**Requalification décisive — ce générateur n'est jamais exécuté.** La recherche de `bacGenerator|generateBacExam|BacExam` sur l'intégralité du dépôt ne renvoie **aucune référence** : `src/utils/bacGenerator.ts` (69 lignes) est du **code mort**. Le bouton « تحدي BAC » appelle en réalité `onLaunchQuiz(unit.id)` (`TrainingView.tsx:91-101,478-503`) et lance un simple quiz d'unité. Aucun élève n'a jamais vu ce barème à 28 points.

Le constat descend donc de P0 à **P3**. Il conserve une valeur diagnostique : la cause racine n'est pas une erreur de pondération mais l'**indigence du corpus** — le générateur retient *toutes* les `KNOWLEDGE_CARDS` du domaine et *tous* les `BOSS_FIGHT_SCENARIOS` (10 cartes et 7 scénarios en tout) faute de matière suffisante pour échantillonner. Corriger le barème sans enrichir ce corpus produirait un sujet juste sur 20 points mais toujours indigent. À arbitrer : supprimer le fichier, ou le câbler après avoir étoffé le corpus.

| | |
|---|---|
| **Gravité** | **Majeur** sur le papier / **Nul en pratique** (jamais exécuté) |
| **Preuve** | Exécution du générateur : 28/20/34 pts. Mais `grep -rn "bacGenerator\|generateBacExam\|BacExam"` → **0 référence** dans le dépôt. |
| **Impact apprenant** | **Aucun aujourd'hui** : le code n'est pas atteignable. Le risque n'existerait que si le générateur était câblé en l'état. |
| **Impact business** | Faible. En revanche, la fonctionnalité « épreuve BAC blanche » — la plus vendeuse — n'existe tout simplement pas : c'est **ce manque-là**, et non le barème, qui est à traiter. |
| **Recommandation** | 1) **Trancher d'abord :** supprimer le code mort ou décider de livrer la fonctionnalité. 2) Si livrée : enrichir le corpus (cartes et scénarios), normaliser à 20 pts (15 + 5), forcer le tirage bi-domaine, fixer la durée, et verrouiller par un test « tout sujet généré totalise 20 points et couvre 2 domaines ». |
| **Effort** | **Très faible** (suppression) / **Élevé** (livrer la fonctionnalité : enrichir le corpus domine le coût) |
| **Priorité** | **P3** *(requalifié — voir §3.1)* |

---

## B5. MAJEUR — 57 schémas hors-sujet ✅ *(corrigé pendant l'audit)*

### Mesure

| Indicateur | Valeur |
|---|---|
| QCM des unités 6-11 avec schéma d'un **autre domaine** | **57 (20 % du sous-ensemble)** |
| Unité 11 | **57 / 61 — 93 %** |
| Schémas uniques sur 508 QCM | **26** |
| U3 / U5 / U6 | **1 schéma unique** chacun (pour 45 / 55 / 45 QCM) |
| Assets manquants | **0** |
| **Après correctif** (commit `e130475`) | **0 schéma hors-domaine · 28 schémas uniques** |

**Preuve type :** QCM `id:444` porte sur الغابرو (gabbro, contexte de dorsale océanique) et affiche `schema_01_adn.svg` — un schéma d'ADN.

### Analyse

Un schéma d'ADN sur une question de pétrologie n'est pas un détail cosmétique : en SVT, le schéma **fait partie de l'énoncé**. L'élève cherche l'information dans le document ; ici le document contredit la question. Effet direct sur la charge cognitive et sur la confiance dans l'outil.

**Bonne nouvelle : 0 asset manquant.** Les fichiers existent tous ; c'est le champ `diagramUrl` qui pointait au mauvais endroit. **Il s'agissait d'un remapping de données, pas d'une production graphique.**

**Correctif appliqué pendant l'audit** (commit `e130475`, détail en §4). Mieux : deux schémas parfaitement adaptés, `schema_17_collision.svg` et `schema_18_wilson.svg`, dormaient dans le dépôt **sans être référencés par un seul QCM**. Le travail graphique avait été fait ; seul le câblage manquait. Vérification post-correctif : **0 schéma hors-domaine, 0 asset manquant, 26 → 28 schémas distincts**, verrouillé par `src/quizCorpus.integrity.test.ts`.

Constat connexe : **26 schémas uniques pour 508 QCM** signifie qu'un même visuel sert en moyenne 20 questions. Les unités 3, 5 et 6 tournent sur **un seul schéma** pour 45 à 55 QCM. Au-delà de l'erreur de mapping, le corpus visuel est massivement sous-dimensionné hors unité 1 — cohérent avec les 101 assets concentrés sur `domaine1_proteines/`.

| | |
|---|---|
| **Gravité** | **Majeur** (perception) / **Faible** (technique) — **résolu**|
| **Preuve** | *Avant :* 57 QCM, tous d'unité 11 ; `id:444` (الغابرو) → `schema_01_adn.svg`. *Après :* 0 mismatch, 28 schémas distincts. |
| **Impact apprenant** | Confusion sur la question, perte de confiance dans l'outil |
| **Recommandation** | 1) ✅ Remapping par marqueur d'axe `11.N` + 2) ✅ test de cohérence bloquant domaine↔`unitId`. 3) **Reste à faire :** enrichir le corpus visuel des unités 3, 5, 6 (1 seul schéma chacune) — constat #16, P2. |
| **Effort** | **Faible** — réalisé en une session ; meilleur rapport effort/impact du volet B |
| **Priorité** | ✅ **Traité** — reliquat #16 en **P2** |

---

## B6. Divergences de contenu livre ↔ app

### Tableau des divergences vérifiées

| Point | Livre | Application | Verdict |
|---|---|---|---|
| **Rendement ATP** | 38 (2+2+≈34) | Seuls 2 QCM touchent 30/32/36/38 (`id:334` « ancien bilan 36-38 », `id:417` Moho) | ✅ **Pas de divergence** — vérification close |
| **ABO / Rhésus** | **0 occurrence** | Leçon dédiée (`phase5_chapitres_9_10.html`), 5 occ. `ABO` | 🟢 **L'app est plus conforme que le livre** |
| **SIDA / VIH** | 5 + 7 occ. | 3 occ. leçons, **24 QCM** | ✅ Cohérent, app plus fournie |
| **Interleukines** | 1 occ., graphie fautive « الأترولينات » | À aligner sur la graphie correcte | 🟠 Corriger le livre |
| **Ophiolites, collision** | Présents (D3-III) | Présents (P21, leçons 41-42) | ✅ Cohérent — ⚠️ **hors progression 2025-2026** |
| **Ressources énergétiques Algérie** | Absent | Leçon 44 | 🟡 Prolongement assumé, non exigible |
| **Figures** | **0** | 101 assets (domaine 1), 26 schémas en QCM | 🟢 App supérieure, mais concentrée sur D1 |
| **دليل التصحيح** | Promis, absent | 67 réponses types côté livre ; app dispose de corrigés | 🟠 À produire |

### Le point de vigilance « exigible vs contenu du manuel »

La progression annuelle officielle 2025-2026 **n'inclut ni la collision continentale ni les ophiolites** (p.316-330 du manuel). Livre et application les traitent tous deux. Ce n'est pas une erreur — le manuel les contient — mais l'élève doit savoir que ces contenus **ne sont pas exigibles cette année**.

| | |
|---|---|
| **Gravité** | **Modéré** |
| **Recommandation** | Introduire un marqueur « exigible 2025-2026 » / « approfondissement » sur chaque leçon et chaque QCM, piloté par la progression annuelle. Un élève en révision doit pouvoir filtrer sur l'exigible. |
| **Effort** | Faible (2 j) |
| **Priorité** | **P2** |

---

## B7. Ce que l'application fait mieux que le livre

Un audit qui ne relève que les défauts est un audit faux. Quatre points forts sont mesurés, non déclaratifs.

**1. La méthodologie des 6 verbes BAC — excellent.** `src/data/methodologyJourney.ts` implémente six verbes de consigne avec leurs contraintes linguistiques propres :

| Verbe | Contrainte implémentée |
|---|---|
| `step_analyse` | **Interdiction du « لأن »** — analyser, ce n'est pas expliquer |
| `step_interpret` | Exige « لأن » / « يعود ذلك إلى » |
| `step_compare` | Exige un critère explicite + « بينما » / « في حين » |
| `step_hypothesize` | Structure « نفترض أن … مما يؤدي إلى … » |
| `step_validate` | « يتطابق / لا يتطابق », **jamais « صحيحة » sans preuve** |
| `step_explain` | Chaîne causale complète |

C'est **exactement** la difficulté n°1 des candidats algériens : confondre analyser, interpréter et expliquer. L'interdiction de « لأن » dans l'analyse est une contrainte que peu d'enseignants formalisent aussi nettement. Les 3 portes d'entrée (« je ne sais pas par où commencer », « je veux apprendre un verbe BAC », « j'ai une erreur à corriger ») témoignent d'une vraie réflexion sur les états mentaux de l'apprenant. **Ce module est le meilleur actif du produit et devrait être mis en avant, pas les QCM.**

**2. Zéro doublon dans le corpus QCM.** Après normalisation arabe : **0 doublon** sur 508, et **0 amorce de 40 caractères répétée ≥5 fois** (maximum observé : 4). Pour un corpus généré, c'est un résultat de qualité qui atteste d'un contrôle réel.

**3. Couverture complète du programme.** 44 leçons mappées sans trou sur 11 unités — supérieur au livre, qui omet ABO/Rh.

**4. Architecture hors-ligne assumée.** 100 % local, aucune dépendance API, 2 permissions Android seulement (INTERNET, ACCESS_NETWORK_STATE), `supportsRtl=true`, CSP stricte côté serveur Express. Pour le contexte algérien — connectivité irrégulière, coût des données — c'est le bon choix produit. Il rend simplement le défaut [B2](#b2-critique--98--dexplications-circulaires) d'autant plus critique.

---

## B8. Score du volet B

| Sous-dimension | Score | Justification |
|---|---|---|
| B1 — Couverture structurelle | **7,5** | Mapping 44 leçons/11 unités intégralement cohérent ; déverrouillage progressif fonctionnel ; mais 3 leçons interactives seulement |
| B2 — Qualité du feedback | **2,5** *(1,5 à l'ouverture)* | 66 % d'explications encore circulaires après les lots 1 et 2 ; propagation aux flashcards |
| B3 — Alignement au format d'épreuve | **4,0** | 30 % de QCM méta-scolaires ; pas de QCM au BAC réel |
| B4 — Générateur BAC | **3,5** | 28/20/34 points au lieu de 20 ; mono-domaine au lieu de bi-domaine |
| B5 — Cohérence visuelle | **6,5** | 57 schémas hors-sujet **corrigés** (commit `e130475`, 0 mismatch) ; reste la pauvreté du répertoire : 28 schémas pour 508 QCM |
| B6 — Fidélité au programme | **7,5** | Aucune divergence scientifique ; app parfois plus conforme que le livre |
| B7 — Méthodologie | **9,0** | Les 6 verbes BAC : meilleur actif du produit |
| B8 — Qualité du corpus (doublons) | **8,5** | 0 doublon, 0 amorce sur-répétée |
| B9 — Santé technique | **6,5** | 348/355 tests passés (dont 9 nouveaux garde-fous) ; **7 rouges** inchangés sur parcours débutant + arabisation |
| **VOLET B — moyenne pondérée** | **5,6/10** *(5,1 avant Sprint 0 ; 5,4 après)* | Fondations sérieuses, couche d'évaluation encore défaillante : B2 plafonne tout |

*Pondération : B2 compte triple (feedback = cœur de la promesse « tuteur »), B4 et B7 comptent double.*

**Rappel des tests rouges** (confirmés sur 3 exécutions, chiffres stables) : 7 échecs / 355, dans 4 fichiers — `LessonsView.visualCards.test.tsx` (4), `MyPathView.beginnerPath.test.tsx`, `TrainingView.beginnerMode.test.tsx` (`training-beginner-launchpad` introuvable), `activeLessons.test.ts` (asset `_ar.svg` attendu, `.jpg` reçu). Thème commun : **parcours débutant et arabisation des assets** — cohérent avec les 18 fichiers `_ar` sur 101 (18 % d'arabisation).

---

## 3. Registre consolidé des constats

| # | Constat | Volet | Gravité | Effort | Priorité |
|---|---|---|---|---|---|
| 1 | **Explications circulaires** — 500/508 à l'audit, **336/508 après les lots 1 et 2** (unités 11, 4 et 5 traitées) ; propagation aux flashcards | B2 | 🔴 **Critique** | Élevé | **P0 — seul P0 restant, en cours** |
| 2 | Barème BAC 28/20/34 au lieu de 20 ; sujets mono-domaine | B4 | 🟠 Majeur | Faible-moyen | **P3** *(requalifié : code mort)* |
| 3 | 57 schémas hors-sujet (U11 : 93 %) | B5 | 🟠 Majeur | **Faible** | ✅ **Résolu** — commit `e130475` |
| 4 | 10 unités sur 11 verrouillées | B1 | 🟠 Majeur | **Très faible** | ❌ **Invalidé** *(voir §3.1)* |
| 5 | 0 figure dans le livre (discipline documentaire) | A6 | 🔴 Critique* | Moyen-élevé | **P1** |
| 6 | Densité 40-50 mots/page sur D1-IV, D1-V, D3-III | A4 | 🟠 Majeur | Élevé | **P2** |
| 7 | 30 % de QCM méta-scolaires | B3 | 🟠 Majeur | Moyen-élevé | **P1** |
| 8 | ABO/Rh absents du livre ; دليل التصحيح promis non livré | A5 | 🟠 Majeur | Moyen | **P1** |
| 9 | Unité D2-U2 invisible dans OPUS (hiérarchie cassée) | A7 | 🟠 Majeur | **Très faible** | ✅ **Résolu** — commit `e130475` |
| 10 | Statut « officiel » affiché ≠ statut réel (correction DeepSeek) | A1 | 🟠 Majeur | Faible | **P1** |
| 11 | 5 fautes rédactionnelles dont « التسحيب الأكسدي » et « مُظبوطة » | A3 | 🟡 Modéré | **Très faible** | ✅ **Résolu** — commit `e130475` |
| 12 | 7 tests rouges (parcours débutant, arabisation) | B9 | 🟡 Modéré | Faible | **P1** |
| 13 | Arabisation des assets à 18 % (18/101) | B9 | 🟡 Modéré | Moyen | **P2** |
| 14 | 3 leçons interactives sur 11 unités | B1 | 🟠 Majeur | Élevé | **P2** |
| 15 | Pas de marqueur « exigible 2025-2026 » (ophiolites, collision) | B6 | 🟡 Modéré | Faible | **P2** |
| 16 | 26 schémas uniques / 508 QCM (U3, U5, U6 : 1 seul) | B5 | 🟡 Modéré | Moyen | **P2** |
| 17 | Interleukines : graphie « الأترولينات » fautive | A5 | 🟡 Modéré | Très faible | ✅ **Résolu** — commit `e130475` |
| 18 | Leçon 44 hors table officielle *(requalifié)* | B1 | 🔵 Mineur | Très faible | **P3** |
| 19 | `lecon_transcription.html` hors nomenclature *(requalifié)* | B1 | 🔵 Mineur | Très faible | **P4** |
| 20 | Racine polluée (~25 scripts `patch*.py`, `fix_*.py`) | — | 🔵 Mineur | Très faible | **P3** |

\* *Critique pour l'usage « préparation BAC » du livre pris isolément ; atténué dans l'app qui dispose de 101 assets.*

### 3.1 Constats corrigés par la vérification (auto-critique)

La mise en œuvre du Sprint 0 a exigé de relire le code d'exécution, et non plus seulement les données. Deux constats classés P0 n'ont pas résisté.

**#4 — « 10 unités sur 11 verrouillées » : invalidé.** `unitCatalog.ts` décrit l'**état initial**, pas l'état permanent. Un déverrouillage séquentiel existe : `App.tsx:268` ouvre l'unité `n+1` dès 60 % de réussite, `progressionTransferService.ts` persiste la progression, et `DashboardView.tsx:23,207` neutralise même le verrou à l'affichage. Lire un fichier de données et en déduire un comportement applicatif était une erreur de méthode ; le grief tombe. Reste un point de conception défendable — la découverte du programme est contrainte — mais il relève du choix pédagogique, pas du défaut, et ne justifie pas une priorité P0.

**#2 — « Barème BAC non conforme » : réel mais sans impact.** Les mesures tiennent (28/20/34 points au lieu de 20, sujets mono-domaine alors que l'épreuve croise deux domaines). Mais `src/utils/bacGenerator.ts` **n'est importé nulle part** : `grep` sur `bacGenerator|generateBacExam|BacExam` ne renvoie aucune référence dans tout le dépôt. Le bouton « تحدي BAC » appelle en réalité `onLaunchQuiz(unit.id)` (`TrainingView.tsx:91-101,478-503`), un simple quiz d'unité. Aucun élève ne voit ce barème. Le constat passe donc en **P3** : c'est de la dette morte à supprimer ou à câbler, pas une urgence. La cause racine mérite d'être notée — le générateur prend *tout* le corpus disponible (10 cartes de connaissance, 7 scénarios) faute de matière pour échantillonner ; le corriger sans enrichir le corpus ne produirait qu'un barème juste sur un contenu indigent.

Ces deux requalifications font du constat **#1 le seul P0 subsistant** — et renforcent sa position : la qualité du feedback est le seul point où l'application échoue vraiment devant un élève.

---

## 4. Feuille de route priorisée

### Sprint 0 — « Crédibilité » — ✅ **EXÉCUTÉ** (commit `e130475`)

Correctifs à coût quasi nul qui suppriment les défauts immédiatement vérifiables par un enseignant ou un parent. Le périmètre a été réduit en cours de route : deux des cinq actions prévues se sont révélées inutiles après vérification par exécution (voir §3.1).

| Action | Statut | Constat |
|---|---|---|
| Remapper les 57 `diagramUrl` de l'unité 11 + test de cohérence domaine↔asset | ✅ Fait | #3 |
| Corriger les fautes du livre (10 remplacements) | ✅ Fait | #11, #17 |
| Promouvoir l'en-tête D2-U2 en titre `#` dans OPUS | ✅ Fait | #9 |
| ~~Déverrouiller les 11 unités~~ | ❌ Sans objet | #4 invalidé |
| ~~Normaliser le générateur BAC à 20 pts~~ | ⏸️ Reporté P3 | #2 : code mort |

**Détail du remapping (#3).** La clé de correspondance n'est pas lexicale — les mots-clés échouent, « التصادم » apparaissant dans les distracteurs de tous les axes — mais structurelle : chaque énoncé de l'unité 11 porte un marqueur d'axe `11.1` à `11.5`.

| Axe | Schéma cible | QCM |
|---|---|---|
| 11.1 الظهرات | `schema_15_dorsale.svg` | 9 |
| 11.2 الغوص | `schema_16_subduction.svg` | 12 |
| 11.3 التصادم القاري | `schema_17_collision.svg` | 12 |
| 11.4 الأوفيوليت | `schema_17_collision.svg` | 12 |
| 11.5 دورة ويلسون | `schema_18_wilson.svg` | 12 |

Résultat vérifié : **0 schéma hors-domaine, 0 asset manquant, 26 → 28 schémas distincts**. Deux assets corrects, `schema_17_collision.svg` et `schema_18_wilson.svg`, étaient livrés dans le dépôt mais **n'étaient référencés par aucun QCM** : le défaut tenait au câblage, pas à la production graphique.

**Garde-fou.** `src/quizCorpus.integrity.test.ts` (9 tests) verrouille désormais la structure du corpus, la cohérence unité↔domaine des schémas et l'existence réelle des fichiers sur disque. Il porte aussi deux plafonds de dette conçus pour ne jamais remonter. Sa première exécution a d'ailleurs corrigé une mesure de cet audit : le seuil « explications trop courtes » fixé à 321 items s'est révélé faux — **les 508 explications font moins de 25 mots**, la plus longue en comptant 22. Le constat #1 est donc plus étendu que ce que la §2 laissait entendre.

### Sprint 1 — « Feedback » — **le sprint qui compte** — *lots 1 et 2 exécutés*

| Action | Effort | Constat traité | Statut |
|---|---|---|---|
| **Test de non-régression bloquant sur les explications** (rejet si recopie du terme de l'énoncé ou < 25 mots) | 2 h | #1 | ✅ **fait** (Sprint 0) |
| **Lot 1 — unité 11 (D3-III, 61 QCM)** réécrite au canevas en trois temps | — | #1 | ✅ **fait** |
| **Lot 2 — unités D1-IV (48 QCM) et D1-V (55 QCM)** réécrites au même canevas | — | #1 | ✅ **fait** |
| Lots 3-n — les 8 unités restantes (344 QCM) | 20-25 j | #1 | ⬜ à faire |
| Régénération des flashcards après correction | 0 j | #1 | ✅ **sans objet** — dérivation automatique vérifiée |
| Correction des 7 tests rouges (parcours débutant, arabisation) | 1 j | #12 | ⬜ à faire |

Le test de non-régression a bien été écrit **avant** la réécriture : il transforme un chantier ponctuel en garantie permanente.

#### Journal d'exécution — lot 1 (unité 11, ids 440-500)

**Cible.** L'unité 11 a été choisie comme pilote pour trois raisons : c'est la plus grosse unité du corpus (61 QCM, 12 %), elle figure parmi les trois unités prioritaires de la feuille de route (D3-III), et elle venait d'être remaniée au Sprint 0 — corriger l'explication après le schéma achève le même item.

**Lecture préalable intégrale.** Les 61 QCM ont été lus avant toute écriture. Conclusion qui a défini le périmètre : **les bonnes réponses sont scientifiquement justes et les énoncés exploitables**. Le défaut est strictement l'explication. La réécriture n'a donc touché ni `questionText`, ni `options`, ni `correctAnswerIndex` — vérifié par `git diff --numstat` : **61 lignes modifiées, 61 lignes ajoutées, aucune autre ligne du fichier**.

**Canevas appliqué à chaque item.**
1. *Mécanisme* — la cause physique ou biologique, pas la définition du terme ;
2. *Réfutation* — pourquoi le distracteur plausible est faux (« ne confonds pas X et Y ») ;
3. *Mot-clé BAC* — la formulation attendue par le correcteur.

**Exemple, QCM 440 (الظهرة).**

> *Avant* : « الظهرة يرتبط هنا بـ: حد تباعدي محيطي تتشكل عنده قشرة جديدة. » — recopie de l'option correcte, 9 mots.
>
> *Après* : « الظهرة حدّ بنّاء: تباعد الصفيحتين يخفّض الضغط على البرنس العلوي فيحدث انصهار جزئي يعطي صهيراً بازلتياً يتبلور مكوّناً قشرة محيطية جديدة. لا تخلط بينها وبين التصادم: الظهرة تُنشئ الليثوسفير ولا تُفنيها. في البكالوريا: اذكر «انصهار جزئي بانخفاض الضغط». » — 38 mots, mécanisme + réfutation + mot-clé.

**Résultat mesuré.** Unité 11 : **0 explication circulaire, 0 sous les 25 mots** (29 mots minimum, 36 en médiane, 43 au maximum). Corpus entier : circulaires **500 → 439**, trop courtes **508 → 447**. Les plafonds du garde-fou ont été abaissés d'autant, et un test supplémentaire verrouille l'unité 11 à **zéro défaut** pour interdire toute régression sur le travail validé — 10 tests verts. Suite complète : **349 passés / 7 échoués**, exactement les 7 échecs préexistants, aucune régression.

**Propagation vérifiée.** La flashcard `fc_q_440` a été inspectée après coup : son `answerBullets[1]` porte la nouvelle explication. La dérivation par `.map()` fait que **les 61 flashcards de l'unité 11 sont réparées sans action supplémentaire** — la ligne « régénération des flashcards » de ce sprint est donc sans objet.

**Défaut annexe relevé pendant la lecture (hors périmètre P0).** Chaque QCM de l'unité 11 contient **un distracteur hors-domaine évident** — de l'immunologie ou de la respiration cellulaire glissée dans un item de tectonique. Un élève élimine cette option sans réfléchir : le choix réel se fait entre 3 options, et la difficulté mesurée est surévaluée. Le symptôme confirme la génération automatique diagnostiquée en [B3](#b3-majeur--30--de-qcm-méta-scolaires). À traiter au Sprint 2 avec la refonte des énoncés, en réécrivant les distracteurs comme **erreurs classiques du même domaine** (confondre dorsale et zone de subduction, schiste bleu et micaschiste) plutôt que comme remplissage.

**Extrapolation d'effort.** Le lot 1 confirme que la réécriture n'est pas mécanisable : chaque explication exige de vérifier le mécanisme et d'identifier le distracteur à réfuter. Sur cette base, les 447 explications restantes représentaient **26 à 33 jours-expert**, à répartir en lots par unité, chacun clôturé par l'abaissement des plafonds.

#### Journal d'exécution — nettoyage de l'échafaudage de génération (500 énoncés)

**Défaut traité.** 500 des 508 énoncés s'ouvraient sur le **repère de plan interne du générateur** — un artefact d'outillage exposé tel quel à l'élève : « في محور 11.5 — دورة ويلسون، أي عبارة صحيحة حول «الأوفيوليت»؟ ». Six formulations coexistaient : `في محور` (150), `في موضوع` (50), `عند مراجعة` (50), `ضمن` (50), `في` (50), `في سؤال بكالوريا قصير حول` (50), plus la variante impérative `اختر … ضمن N.N — TITRE.` (50). Le repère `N.N` ne correspond à aucune numérotation visible dans l'application : il ne peut donc rien signifier pour l'apprenant, et il alourdit la lecture de chaque question en langue arabe.

**Périmètre validé avec le commanditaire.** L'en-tête a été retiré **en entier, dans toutes ses variantes**, en ne conservant que la question elle-même. Seul le champ `questionText` a été modifié — vérification `git diff -U0` : **500 lignes, aucune hors de ce champ**.

**Difficulté rencontrée.** Le découpage naïf sur la virgule arabe (`[^،]+،`) est faux : 12 des 49 titres d'axes contiennent eux-mêmes une virgule arabe et auraient été tronqués. Le découpage a donc été fait sur la **liste exacte des 49 titres** extraite du corpus, et non par expression régulière générique.

**Effet de bord traité.** Le retrait du repère d'axe a rendu **trois paires d'énoncés strictement identiques** — elles ne se distinguaient que par leur préfixe. Elles ont été désambiguïsées manuellement par une précision de contenu, ce qui est le comportement pédagogiquement correct : deux questions distinctes doivent l'être par leur objet, pas par un numéro de chapitre.

| Paire | Terme | Précision ajoutée |
|---|---|---|
| 298 / 328 | «التخمر» | *من حيث آليته* / *من حيث مردوده الطاقوي* |
| 348 / 438 | «الأستينوسفير» | *في تكتونية الصفائح* / *في النموذج الداخلي للأرض* |
| 477 / 497 | «الأوفيوليت» | *في تعريفه الصخري* / *في دورة ويلسون* |

**Garde-fou.** Deux tests ajoutés à `src/quizCorpus.integrity.test.ts` : l'un interdit le retour de l'échafaudage (5 motifs de garde), l'autre interdit tout énoncé dupliqué. Vérification par exécution : **508 QCM, 508 flashcards, 0 échafaudage, 0 doublon, 0 énoncé vide**, 4 options partout, index de réponse valides. Suite complète : **349 passés / 7 échoués**, les 7 échecs préexistants.

#### Journal d'exécution — lot 2 (unités 4 et 5, ids 114-216)

**Cible.** Les deux unités du domaine 1 explicitement citées dans la feuille de route (D1-IV « المناعة », 48 QCM ; D1-V « الاتصال العصبي », 55 QCM), soit **103 items** — le plus gros lot du chantier après l'unité 11. Ce sont aussi deux unités à fort rendement au BAC algérien : l'immunité et la communication nerveuse alimentent régulièrement la partie 1 de l'épreuve.

**Lecture préalable intégrale.** Les 103 QCM ont été dumpés avec leur bonne réponse et lus avant écriture. Même conclusion qu'au lot 1 : **les bonnes réponses sont scientifiquement justes**, le défaut est strictement l'explication. `git diff --numstat` : **103 lignes modifiées, aucune ligne hors du champ `explanation`**.

**Exemples.**

> QCM 118 (CMH II) — *avant* : « CMH II يرتبط هنا بـ: يوجد على خلايا تقديم المستضد وينشط LT4. » (11 mots, circulaire).
> *Après* : « يقتصر CMH II على خلايا تقديم المستضد (بالعات، خلايا شجرية، LB) ويعرض ببتيدات من أصل خارجي بعد بلعمتها، فينشّط LT4. الفرق مع CMH I هو أصل الببتيد والخلية اللمفاوية المخاطَبة. في البكالوريا: CMH II = ببتيد خارجي + LT4. » (36 mots).

> QCM 187 (إعادة الاستقطاب) — *après* : « إعادة الاستقطاب تنتج أساساً عن انغلاق قنوات الصوديوم وخروج البوتاسيوم عبر قنواته الفولطية، فيعود الكمون نحو قيمة الراحة. لا تنسبها للمضخة التي تتدخل لاحقاً. في البكالوريا: نزول المنحنى = خروج K+. » — la réfutation vise ici **l'erreur classique la plus fréquente** de l'unité : attribuer la repolarisation à la pompe Na⁺/K⁺ au lieu du canal potassique voltage-dépendant.

**Résultat mesuré.** Unités 4 et 5 : **0 explication circulaire, 0 sous les 25 mots** (26 mots minimum, 31 en médiane, 41 au maximum). Corpus entier : circulaires **439 → 336**, trop courtes **447 → 344**. Plafonds abaissés d'autant et `REWRITTEN_UNITS` étendu de `[11]` à `[4, 5, 11]` — **14 tests verts**. Suite complète : **353 passés / 7 échoués**, toujours les 7 échecs préexistants, aucune régression.

**Confirmation du défaut annexe.** Le distracteur hors-domaine relevé au lot 1 n'est pas propre à l'unité 11 : il est **systématique dans tout le corpus**. On trouve `يستعمل CO2 كمستقبل نهائي للإلكترونات في التنفس` ou `يمثل مرحلة جيولوجية عميقة` parmi les options de QCM d'immunologie. Chaque item se joue donc en réalité sur 3 options, ce qui surestime la difficulté mesurée et fausse le calcul de maîtrise. Ce défaut est désormais **documenté comme transverse** et rattaché au Sprint 2.

**Reste à faire.** 344 explications sur 8 unités (1, 2, 3, 6, 7, 8, 9, 10), soit **20 à 25 jours-expert** au rythme constaté.

### Sprint 2 — « Conformité au format d'épreuve » (12-15 jours)

| Action | Effort | Constat traité |
|---|---|---|
| Conversion des 153 QCM méta-scolaires en questions documentées | 10 j | #7 |
| Marqueur « exigible 2025-2026 » sur leçons et QCM | 2 j | #15 |
| Rédaction de la section ABO/Rh du livre (réutiliser `phase5_chapitres_9_10.html`) | 2 j | #8 |
| Production du دليل التصحيح, ou retrait de la promesse l.26 | 3 j | #8 |

### Sprint 3 — « Densité et visuels » (20-30 jours)

| Action | Effort | Constat traité |
|---|---|---|
| Génération des figures à partir des descriptions OPUS existantes | 8-12 j | #5 |
| Rattrapage de densité sur D1-IV, D1-V, D3-III (→ ≥120 mots/page) | 15-20 j | #6 |
| Extension du format interactif : 1 leçon minimum par unité | 20-30 j | #14 |
| Arabisation des assets restants (83/101) | 5 j | #13 |
| Nettoyage de la racine du dépôt | 2 h | #20 |

### Estimation globale

| Horizon | Effort | Effet attendu |
|---|---|---|
| **Sprints 0+1** | **12-18 j** | Passage d'un quiz de reconnaissance à un véritable tuteur. Volet B : **5,1 → ~7,0** |
| Sprints 0→2 | 25-33 j | Alignement sur le format d'épreuve réel. Volet B : **~7,8** |
| Sprints 0→3 | 60-80 j | Produit complet. Volets A+B : **~8,5** |

---

## Annexe I — Table de conformité par unité

| # | Unité officielle | Pages | Livre (mots/page) | Leçons app | QCM | Schémas | Verdict |
|---|---|---|---|---|---|---|---|
| 1 | D1-I Synthèse des protéines | 1-39 | 188 ✅ | P1-P2 + transcription | 39 | riche | ✅ Complet |
| 2 | D1-II Structure/fonction | 39-57 | 146 ✅ | P3 | 37 | ok | ✅ |
| 3 | D1-III Enzymes | 57-73 (4 act.) | 159 ✅ | P3-P4 | 45 | **1 seul** | 🟠 Visuels |
| 4 | **D1-IV Immunologie** | **73-127 (11 act.)** | **48** 🔴 | P5-P7 (**ABO/Rh ✅**) | 48 | ok | 🔴 Densité livre |
| 5 | **D1-V Communication nerveuse** | **127-174 (7 act.)** | **50** 🔴 | P8-P10 | 55 | **1 seul** | 🔴 Densité + visuels |
| 6 | D2-I Photosynthèse | 174-205 (4 act.) | 55 🟠 | P10-P12 | 45 | **1 seul** | 🟠 |
| 7 | D2-II Respiration / ATP | 205-227 (6 act.) | 88 🟠 | P13-P14 | 45 | ok | 🟠 **Invisible dans OPUS** |
| 8 | D2-III Comparaison / cycle | 227-237 | 118 🟡 | P15 | 40 | ok | ✅ |
| 9 | D3-I Tectonique des plaques | 237-259 (3 act.) | 73 🟠 | P16-P18 | 43 | ok | 🟠 |
| 10 | D3-II Structure interne | 259-287 (3 act.) | 58 🟠 | P19-P20 | 50 | ok | 🟠 |
| 11 | **D3-III Magmatisme / orogenèse** | **287-330 (8 act.)** | **40** 🔴 | P21-P22 | 61 | **57/61 faux** 🔴 | 🔴 **Le plus dégradé** |

**Total :** 508 QCM · 44 leçons + 1 · 26 501 mots de livre.
**L'unité 11 cumule les trois défauts** : densité la plus faible (40 mots/page), 93 % de schémas hors-sujet, contenu partiellement non exigible (ophiolites, collision). **C'est l'unité prioritaire.**

---

## Annexe II — Protocole de reproduction des mesures

```bash
# --- Volumétrie du corpus ---
python3 -c "print(len(open('الكتاب_المصحح_v1.0.md',encoding='utf-8').read().split()))"   # 26501
python3 -c "print(len(open('PROGRAMME NATIONAL SVT CLAUDE OPUS - Copie.MD',encoding='utf-8').read().split()))"  # 46368

# --- A1 : statut réel du livre ---
grep -c "التفريغ" الكتاب_المصحح_v1.0.md                    # 24
grep -n "DeepSeek" الكتاب_المصحح_v1.0.md                   # 7 blocs
grep -c "موارد التصحيح" الكتاب_المصحح_v1.0.md              # 8

# --- A3 : fautes rédactionnelles ---
grep -n "مثل مين\|مادامية\|التسحيب\|بحث الطاقة الجسيم\|مُظبوطة" الكتاب_المصحح_v1.0.md

# --- A5 : notions absentes ---
for k in ABO الريزوس "الزمر الدموية" الإنترلوكين "دليل التصحيح"; do
  echo "$k : $(grep -c "$k" الكتاب_المصحح_v1.0.md)"; done      # tous à 0

# --- A6 : figures ---
grep -c '!\[' الكتاب_المصحح_v1.0.md                         # 0

# --- A7 : hiérarchie OPUS ---
grep -c "^# " "PROGRAMME NATIONAL SVT CLAUDE OPUS - Copie.MD"   # 20 (dont 10 doublons)
sed -n '5150,5165p' "PROGRAMME NATIONAL SVT CLAUDE OPUS - Copie.MD"  # en-tête D2-U2 en texte brut

# --- B1 : mapping des leçons ---
cd public/lessons && for f in phase*.html; do
  grep -oE "<h1[^>]*>[^<]*</h1>" $f | sed 's/<[^>]*>//g'; done
grep -c "isLocked: true" src/unitCatalog.ts                  # 10

# --- B2 : explications circulaires (parsing par OBJET COMPLET obligatoire) ---
# NE PAS utiliser de regex ciblant questionText/explanation séparément : méthode invalide.
python3 - <<'PY'
import re, json
src = open('src/quizCorpus.ts', encoding='utf-8').read()
objs = re.findall(r'\{[^{}]*?"id"\s*:.*?"explanation"\s*:\s*"(.*?)".*?\}', src, re.S)
tpl  = [e for e in objs if 'يرتبط هنا بـ' in e]
print(len(objs), len(tpl))          # 508 / 500
lens = sorted(len(e.split()) for e in objs)
print('médiane', lens[len(lens)//2], 'min', lens[0])   # 11 / 7
print('<12 mots', sum(1 for l in lens if l < 12))      # 321
PY

# --- B4 : barème BAC (par EXÉCUTION, pas par comptage statique) ---
# le générateur échantillonne le corpus : exécuter bacGenerator par domaine -> 28 / 20 / 34

# --- B9 : tests ---
npx vitest run        # 339 passés / 7 échoués (346) ; 36 fichiers / 4 échoués ; ~77 s
```

---

## Annexe III — Faux positifs écartés

Ces pistes ont été explorées puis invalidées. Elles sont consignées pour éviter qu'un audit ultérieur ne les rouvre.

| Piste | Statut | Raison de l'invalidation |
|---|---|---|
| **Divergence ATP livre↔app** | ❌ **Écartée** | Parsing complet : seuls 2 QCM touchent 30/32/36/38 (`id:334`, `id:417`). Le livre dit 38, l'app ne le contredit pas. |
| **6 `${...}` non substitués dans les HTML** | ❌ **Écartée** | Ce sont des template literals JavaScript **à l'intérieur de balises `<script>`** — comportement normal. |
| **Leçon 44 hors référentiel** | 🔄 **Requalifiée** | Prolongement légitime de contextualisation nationale. Mineur, pas Majeur. |
| **`lecon_transcription.html` orphelin** | 🔄 **Requalifiée** | Comble le saut entre P2 et P3 (leçon 3). Incohérence de nommage seulement. |
| **`grep domainId` sur `smartBotData.ts`** | ⚠️ **Piège de mesure** | Mélange cartes et boss ; le comptage statique ne prédit pas le barème car le générateur échantillonne. **Mesurer par exécution.** |
| **Regex étroite sur `quizCorpus.ts`** | ⚠️ **Méthode invalide** | Cibler `questionText` / `explanation` séparément rate le contenu des options. **Parser les objets entiers.** |

---

*Fin du rapport. Volet A : 6,4/10 — Volet B : 5,6/10 après le Sprint 0 et les lots 1-2. Priorité absolue et désormais unique P0 : le constat #1 — explications circulaires. Chantier ouvert, lots 1 et 2 livrés (unités 11, 4 et 5 — 164 QCM) et échafaudage de génération retiré des 500 énoncés : le corpus passe de 500 à 336 explications circulaires, sous garde-fou automatisé de 14 tests. Les 336 restantes conditionnent encore la valeur pédagogique du produit.*
