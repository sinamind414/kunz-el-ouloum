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
  - [B2. CRITIQUE — 98 % d'explications circulaires *(chantier **CLOS** — 508/508 réécrites, lots 1 à 5)*](#b2-critique--98--dexplications-circulaires)
  - [B3. MAJEUR — un corpus généré : énoncés standardisés et distracteurs de remplissage](#b3-majeur--un-corpus-généré--énoncés-standardisés-et-distracteurs-de-remplissage)
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

**Le défaut le plus grave se trouve toutefois dans l'application, et il est structurel.** Sur 508 QCM, **500 — soit 98 % — délivrent une explication au gabarit automatique « X يرتبط هنا بـ : Y », et dans les 500 cas l'explication recopie littéralement le terme mis entre guillemets dans l'énoncé.** L'explication ne justifie rien : elle reformule la question. Longueur médiane 11 mots ; 321 QCM sur 508 tiennent en moins de 12 mots. Or l'application est un tuteur **hors-ligne, sans LLM ni API** : l'explication statique est le seul feedback qu'un élève puisse recevoir après une erreur. Le circuit pédagogique est donc ouvert — l'élève apprend qu'il s'est trompé, jamais pourquoi. Le défaut se propage mécaniquement aux 500 flashcards, dérivées du même champ par un simple `.map()`. **Gravité : Critique.** C'est le point qui devait être traité avant tout autre — et **il l'a été au cours de cet audit** : les 508 explications ont été réécrites en cinq lots, unité par unité, sous garde-fou automatisé. Le corpus ne compte plus **aucune** explication circulaire ni aucune explication de moins de 25 mots. Ce qui reste de ce chantier n'est plus un défaut de contenu mais un besoin de **validation par un enseignant en exercice** (constat #21).

**Trois autres écarts majeurs se confirment.** Le générateur d'épreuves BAC produit des examens à 28, 20 et 34 points selon le domaine, alors que l'épreuve algérienne est notée sur 20 (15 + 5), et des sujets mono-domaine quand l'épreuve réelle croise obligatoirement deux domaines — mais **ce générateur n'est appelé nulle part** : c'est du code mort, requalifié en P3 (§3.1). Le corpus de QCM est engendré par gabarits : 10 squelettes d'énoncé couvrent 97,2 % des 508 items, et **12 phrases de remplissage occupaient un choix sur 79 % d'entre eux**, empruntées à un autre domaine et donc éliminables sans connaître le cours — défaut corrigé au cours de l'audit (§B3). Enfin 57 QCM affichaient un schéma d'un autre domaine — tous concentrés sur l'unité 11, touchée à 93 % ; **ce dernier point a été corrigé au cours de l'audit** (commit `e130475`).

**Un point positif inattendu mérite d'être souligné, car il inverse un reproche courant :** le corpus de leçons HTML de l'application est **plus complet que le livre de référence**. Le mapping des 44 leçons sur les 11 unités officielles est intégralement cohérent, sans trou ni doublon, et l'application traite des notions que le livre omet — le système ABO et le facteur Rhésus, absents du livre (0 occurrence), font l'objet d'une leçon dédiée. Sur le plan de la couverture, l'application ne dérive pas du programme : elle le dépasse.

**Verdict global — Volet A : 6,4/10. Volet B : 7,2/10** *(5,1 à l'ouverture de l'audit ; 5,4 après le Sprint 0 ; 5,9 après le lot 3 ; 6,9 après la clôture du chantier des explications ; 7,0 après la remise au vert de la suite de tests ; 7,2 après le lot 4, qui porte l'analyse documentaire à 11 unités sur 11 et répare un correcteur qui sanctionnait les réponses au féminin).* L'application repose sur des fondations pédagogiques sérieuses (méthodologie des 6 verbes BAC, zéro doublon dans le corpus QCM, couverture complète du programme) mais sa couche d'évaluation — QCM, explications, flashcards, générateur d'épreuves — avait été produite par génération automatique sans relecture experte, et c'est là que tout se jouait. Après vérification par exécution, un seul P0 subsistait : la qualité des explications (constat #1). Deux des quatre P0 annoncés initialement ont été requalifiés — l'un invalidé, l'autre neutralisé par du code mort (§3.1) — un troisième a été corrigé (commit `e130475`), et **le dernier est désormais soldé** : 508 explications réécrites, 500 flashcards réparées par dérivation, 0 régression sur la suite de tests.

**Ce que cela change, et ce que cela ne change pas.** Le produit n'est plus un quiz de reconnaissance : après chaque erreur, l'élève reçoit un mécanisme causal, la réfutation de la confusion la plus probable et une consigne d'examen. C'est la différence entre mesurer une lacune et la traiter. Mais **le plafond du produit n'est plus fixé par la qualité du feedback ; il l'est par la forme de l'évaluation.** Le BAC algérien n'utilise aucun QCM : il évalue l'exploitation de documents expérimentaux (15 points) et une situation d'intégration (5 points) portant sur deux domaines différents. Une application qui entraîne excellemment à des QCM entraîne excellemment à un exercice qui n'existe pas à l'examen. **Le prochain chantier structurant est la conversion d'une part des QCM en questions documentées — et non un perfectionnement supplémentaire des explications.**

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

**Avancement au 12/08/2026 — chantier clos.** Cinq lots de réécriture ont été exécutés. **Les 508 explications des 11 unités sont réécrites : la dette est soldée.**

| Lot | Unités | QCM | Circulaires restantes | < 25 mots restantes |
|---|---|---|---|---|
| — | *état initial* | — | 500 | 508 |
| Lot 1 | U11 — Magmatisme et orogenèse (ids 440-500) | 61 | **439** | **447** |
| Lot 2 | U4 — Immunité (114-161) + U5 — Communication nerveuse (162-216) | 103 | **336** | **344** |
| Lot 3 | U1 — Synthèse des protéines + U2 — Structure spatiale + U3 — Enzymologie (1-113, 501-508) | 121 | **223** | **223** |
| Lot 4 | U6 — Photosynthèse + U7 — Respiration et fermentation + U8 — Bilan énergétique (217-346) | 130 | **93** | **93** |
| Lot 5 | U9 — Tectonique des plaques (347-389) + U10 — Structure du globe (390-439) | 93 | **0** | **0** |
| | **Total** | **508** | **0** | **0** |

Chaque explication réécrite fait 25 à 43 mots et suit le canevas *mécanisme → réfutation du distracteur → mot-clé BAC* ; les flashcards correspondantes sont réparées par dérivation automatique, sans action supplémentaire. **Les trois domaines du programme sont assainis** : plus une seule explication du produit ne se contente de recopier l'énoncé, et plus une seule ne descend sous les 25 mots.

Le score B2 passe de **1,5 à 8,0/10**. Il n'atteint pas 10 pour trois raisons explicites, qui constituent la dette résiduelle du chantier : (1) les explications ont été rédigées **dans le cadre de l'audit et non validées par un enseignant en exercice** — la relecture experte reste à faire (constat **#21** du [registre](#3-registre-consolidé-des-constats)) ; (2) le feedback demeure **statique** : le même texte est servi quelle que soit l'erreur commise, alors qu'un distracteur choisi renseigne sur la nature de la confusion ; (3) les **énoncés restent standardisés à 97,2 % ([B3](#b3-majeur--un-corpus-généré--énoncés-standardisés-et-distracteurs-de-remplissage))** — une bonne explication sur une question de gabarit reste une question de gabarit. Voir les journaux d'exécution en [§4, Sprint 1](#sprint-1--feedback--le-sprint-qui-compte--chantier-clos-lots-1-à-5).

**Anomalie résiduelle documentée — items 326 et 336 (unité 8).** Ces deux items ont conservé dans leur énoncé un fragment de l'échafaudage de génération à l'intérieur même du terme interrogé : `«3 | العلاقة بين»` et `«4 | الحصيلة الطاقوية»`. Ce sont **les deux seuls items du corpus** dont le terme entre guillemets contient une barre verticale — vérifié par balayage complet. Pour l'item 336, la bonne réponse elle-même (`المقارنة الشاملة`, « la comparaison globale ») n'est pas informative. La réécriture s'est délibérément limitée au champ `explanation`, périmètre annoncé et contrôlé ligne à ligne : **les énoncés et les options n'ont pas été modifiés**, et les explications de ces deux items portent le fond scientifique attendu (bilan comparé photosynthèse/respiration). Ces deux items restent à reformuler dans le cadre du Sprint 2, qui traite les énoncés.

Il faut aussi relier ce constat à celui de [B3](#b3-majeur--un-corpus-généré--énoncés-standardisés-et-distracteurs-de-remplissage) : énoncés de gabarit, distracteurs de remplissage et explications circulaires sont **produits par la même chaîne de génération automatique**. Ce n'est pas deux défauts, c'est un seul — un corpus généré sans relecture experte.

### Gravité, impacts, recommandation

| | |
|---|---|
| **Gravité** | 🔴 **CRITIQUE à l'ouverture — ✅ traité au 12/08/2026** (508/508 réécrites, garde-fou à tolérance nulle) |
| **Preuve** | 500/508 au gabarit, 500/500 recopiant l'énoncé ; médiane 11 mots ; `SVT_FLASHCARDS` = `.map()` sur `explanation` |
| **Impact apprenant** | Aucun apprentissage par l'erreur. L'élève qui se trompe reste sans explication — dans une app conçue pour être son seul tuteur. Le taux de progression réel plafonne quel que soit le temps passé. |
| **Impact business** | Contredit la proposition de valeur centrale (« tuteur »). Défaut immédiatement perceptible par un enseignant évaluateur ou un parent — obstacle rédhibitoire à toute prescription institutionnelle. |
| **Recommandation** | 1) **Rédiger manuellement les explications des 3 unités les plus exposées au BAC** (D1-IV, D1-V, D3-III ≈ 150 QCM) selon un canevas imposé : *mécanisme → pourquoi les distracteurs sont faux → mot-clé attendu au BAC*, minimum 35 mots. 2) Étendre ensuite au reste du corpus. 3) **Ajouter un test de non-régression bloquant** : rejeter toute explication qui contient le terme entre guillemets de l'énoncé **ou** qui fait moins de 25 mots. 4) Régénérer les flashcards après correction. |
| **Effort** | Élevé (estimé 25-30 j experts pour le corpus complet) — **exécuté en 5 lots ; le test de non-régression, écrit en premier, empêche désormais toute rechute** |
| **Priorité** | ✅ **P0 soldé.** Reste en P1 la **relecture par un enseignant en exercice** des 508 explications produites, et en P2 le passage à un feedback différencié par distracteur |

---

## B3. MAJEUR — un corpus généré : énoncés standardisés et distracteurs de remplissage

### Rectificatif méthodologique

**Une version antérieure de ce rapport avançait « 153 QCM méta-scolaires (30 %) ». Ce chiffre était faux et est retiré.** Il provenait d'un comptage à vue sur un échantillon, extrapolé sans vérification. Recompté par exécution sur les 508 items, le motif annoncé ressort à **0/508**. Le défaut réel est différent, et plus profond — il est établi ci-dessous par mesure reproductible. Principe appliqué depuis : *aucun chiffre n'entre dans ce rapport sans avoir été recompté par un script sur le corpus complet, y compris mes propres estimations.*

### Mesure

Le corpus n'est pas rédigé item par item : il est **engendré par gabarits**. Trois mesures, toutes obtenues par exécution.

**(1) Les énoncés sont standardisés.** 10 squelettes de phrase couvrent **494 des 508 items (97,2 %)**, à raison de 46 à 50 occurrences chacun, et les 11 unités reçoivent les 10 mêmes. 505 items sur 508 sont bâtis sur un terme placé entre guillemets, réinjecté mécaniquement dans le gabarit.

**(2) Les distracteurs étaient du remplissage.** **12 phrases passe-partout** occupaient un choix sur **402 des 508 items (79 %)** — exactement une par item, **jamais en position de bonne réponse**, et empruntées à un domaine étranger à la question. Extrait, avant correction :

| Phrase recyclée | Occurrences | Unités où elle apparaît |
|---|---|---|
| `هو بنية ثابتة لا تتأثر بالشروط الفيزيائية أبداً.` | 38 | 1-7, 9-11 |
| `يحدث دائماً داخل النواة ولا يرتبط بباقي العضيات.` | 37 | 1-10 |
| `يمثل مرحلة جيولوجية عميقة لا علاقة لها بالخلايا.` | 35 | 1-11 |
| `يستعمل CO2 كمستقبل نهائي للإلكترونات في التنفس.` | 32 | 1-5, 9-11 |

Une question sur la traduction des protéines proposait ainsi « utilise le CO2 comme accepteur final d'électrons dans la respiration » : hors sujet, donc éliminable **sans rien connaître au cours**.

**(3) L'effet était mesurable sur la difficulté réelle.** Un élève ignorant tout du programme et appliquant la seule règle « j'écarte toute option déjà rencontrée ailleurs » obtenait **35,4 %** contre 25 % au hasard. Le corpus était partiellement soluble sans savoir.

### Correction apportée pendant l'audit

Les **402 distracteurs** ont été réécrits en **erreurs classiques portant sur le concept visé** : confusion ARNm/ARNt, appariement `A-U` attribué à l'ADN, Gutenberg confondu avec Lehmann, inhibiteur compétitif présenté comme non compétitif. Le distracteur devient ainsi un diagnostic — le choix de l'élève révèle *quelle* confusion il entretient, ce qui est la condition d'un feedback différencié (constat #23).

Les items **326** et **336** ont été reconstruits : leur énoncé reprenait un titre de section du livre (`«3 | العلاقة بين»`, « 3 | La relation entre ») en guise de terme interrogé, produisant une question littéralement insensée (constat **#22**, désormais soldé).

| Indicateur (mesuré par exécution) | Avant | Après |
|---|---|---|
| Items portant un distracteur hors-domaine | 28,1 % | **4,5 %** |
| Stratégie « ignorer toute option déjà vue » | 35,4 % | **17,5 %** |
| Heuristique « choisir l'option la plus longue » | 14,2 % | **24,0 %** |

Les deux stratégies sans connaissance sont désormais **au niveau du hasard ou en dessous** : le corpus ne se laisse plus résoudre par sa forme. Trois assertions d'intégrité ont été ajoutées pour empêcher la régression — bannissement nominatif des phrases de remplissage, plafond de recyclage d'un même distracteur, interdiction des marqueurs de génération dans les énoncés et les réponses (**26 assertions vertes**).

### Ce qui reste, et pourquoi la gravité demeure Majeure

La réparation traite les distracteurs, **pas la forme de l'évaluation**. Les énoncés restent standardisés à 97,2 %, et surtout le QCM lui-même est désaligné de l'épreuve algérienne :

- **Structure officielle** : deux parties indépendantes portant sur des **domaines différents**. Partie 1 = **15 points**, 2 exercices, ≤2 documents chacun. Partie 2 = **5 points**, situation d'intégration, ≤3 documents, ≤2 questions.
- **Sujet BAC 2021** : « التمرين الثاني : 07 نقاط », thèmes ribonucléase, interleukines/LT4, code génétique chez *Tetrahymena* — **évaluation par analyse expérimentale documentée**.

**Aucun QCM au BAC SVT algérien.** Le QCM reste un excellent outil de *consolidation mémorielle* et alimente utilement la révision espacée ; le problème n'est pas son existence mais qu'il soit **le mode d'évaluation dominant** sans passerelle vers l'analyse documentaire.

| | |
|---|---|
| **Gravité** | **Majeur** (inchangée : la forme d'évaluation reste désalignée) |
| **Preuve** | 10 gabarits couvrant 494/508 énoncés ; 402/508 distracteurs de remplissage corrigés ; structure officielle 15+5 sur 2 domaines |
| **Impact apprenant** | Illusion de maîtrise : scores élevés en QCM, effondrement sur épreuve documentaire |
| **Recommandation** | 1) Requalifier les QCM en « échauffement / mémorisation », pas en « entraînement BAC ». 2) Diversifier les 10 gabarits d'énoncé et adosser une part des items à un document (`documentAnalysisExercises.ts` existe déjà). 3) Faire de l'analyse documentaire le mode par défaut du module d'entraînement. |
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
| B2 — Qualité du feedback | **8,0** *(1,5 à l'ouverture)* | **0 explication circulaire, 0 sous 25 mots** sur 508 ; correcteur d'analyse documentaire réparé (accord en genre, constat #28) et **0 gabarit sur 43 sanctionné par l'app elle-même** ; reste : feedback statique, non validé par un enseignant |
| B3 — Alignement au format d'épreuve | **4,0** | Corpus engendré par 10 gabarits (97,2 %) ; pas de QCM au BAC réel |
| B4 — Générateur BAC & analyse documentaire | **5,0** *(3,5 avant le lot 4)* | Analyse documentaire : **13 exercices sur 19** exploitables et **11 unités sur 11** couvertes (contre 7/11) ; les 43 réponses modèles passent désormais le correcteur de l'app. Reste : générateur BAC à 28/20/34 points au lieu de 20, mono-domaine au lieu de bi-domaine, et 6 documents en attente d'image |
| B5 — Cohérence visuelle | **6,5** | 57 schémas hors-sujet **corrigés** (commit `e130475`, 0 mismatch) ; reste la pauvreté du répertoire : 28 schémas pour 508 QCM |
| B6 — Fidélité au programme | **7,5** | Aucune divergence scientifique ; app parfois plus conforme que le livre |
| B7 — Méthodologie | **9,0** | Les 6 verbes BAC : meilleur actif du produit |
| B8 — Qualité du corpus (doublons) | **8,5** | 0 doublon, 0 amorce sur-répétée |
| B9 — Santé technique | **8,0** *(score maintenu, mais re-justifié)* | **463/463 tests passés** (dont 32 garde-fous d'intégrité) ; **0 rouge** ; `tsc --noEmit` propre, build OK. **Le maintien de la note mérite une explication.** Ce 8,0 reposait initialement sur le nombre de tests verts — or les constats #33, #36 et #37 ont montré que cette métrique mesurait la mauvaise chose : elle certifiait des modules pris isolément pendant que le **chemin** entre les données et le moteur perdait l'information (moteur non appelé, table masquée, réflexes non traduits). Une suite verte cohabitait avec un correcteur qui ignorait la loi #4. La note n'est donc pas revue à la baisse au titre des défauts trouvés — ils préexistaient, et les découvrir a **amélioré** l'état réel — mais elle est désormais adossée à des garde-fous qui s'exécutent sur les **services réels** avec contrôles négatifs, et non plus au seul compteur. Le vrai plafond de B9 reste l'**absence de tests E2E** (Chromium non installable dans l'environnement d'audit) : aucun parcours élève complet n'est vérifié de bout en bout |
| **VOLET B — moyenne pondérée** | **7,2/10** *(5,1 avant Sprint 0 ; 5,4 après ; 5,6 après le lot 2 ; 5,9 après le lot 3 ; 6,9 après le lot 5 ; 7,0 après le lot 3 du Sprint 2)* | Le défaut critique du produit est corrigé et l'analyse documentaire couvre enfin les 11 unités. Le plafond est désormais fixé par **B3 — la forme d'évaluation (QCM) reste désalignée du BAC réel** |

*Pondération : B2 compte triple (feedback = cœur de la promesse « tuteur »), B4 et B7 comptent double ; dénominateur 13. Calcul vérifié : (7,5 + 8,0×3 + 4,0 + 5,0×2 + 6,5 + 7,5 + 9,0×2 + 8,5 + 8,0) / 13 = 94,0 / 13 = **7,2**. Note : les révisions précédentes affichaient 7,1 pour une somme qui donnait en réalité 6,92 — l'écart d'arrondi est corrigé ici.*

**Tests rouges — RÉSOLU (Sprint 2, lot 1).** Les 7 échecs (4 fichiers) sont corrigés ; la suite passe de **361/368** à **369/369**. Diagnostic : *les 7 tests avaient raison*. Ils décrivaient des fonctionnalités spécifiées puis jamais câblées, et non des régressions. (a) `activeLessons.test.ts` — un unique asset oublié par la campagne d'arabisation : la variante `_ar.svg` existait déjà dans `public/`, la donnée pointait encore sur le `.jpg`. (b) `MyPathView.beginnerPath.test.tsx` — la rampe « ابدأ من هنا » existait dans le code mais était rendue *après* le garde `if (showOnboarding) return (…)` ; or `showOnboarding` vaut `true` tant que la Manhadjiya n'est pas terminée, donc **le point d'entrée conçu pour le débutant était précisément invisible pour le débutant**. (c) `TrainingView.beginnerMode.test.tsx` — « كيف أجيب؟ » n'était qu'un bouton parmi quatre pour un élève en début de parcours. (d) `LessonsView.visualCards.test.tsx` (4 tests) — le fichier définissait **4 tables de métadonnées visuelles (~300 lignes)** et propageait `imageSrc`/`altAr`/`metaAr` jusque dans `unifiedLessons`, mais ne contenait **aucune balise `<img>`** : les visuels n'atteignaient jamais le DOM, alors que le composant `ZoomableImage` (zoom plein écran) était déjà écrit et inutilisé. **Aucun test n'a été affaibli ni supprimé.**

---

## 3. Registre consolidé des constats

| # | Constat | Volet | Gravité | Effort | Priorité |
|---|---|---|---|---|---|
| 1 | **Explications circulaires** — 500/508 à l'audit, **0/508 après les lots 1 à 5** ; les 11 unités sont réécrites, flashcards réparées par dérivation | B2 | 🔴 **Critique** | Élevé | ✅ **Résolu** — commits `baa7c12` → `1e80a42` + lot 5 ; garde-fou à tolérance nulle |
| 31 | **`src/utils/validationEngine.ts` (166 l.) : second moteur de validation en doublon**, porteur du même biais masculin, **sans aucun importeur** — code mort. À supprimer plutôt qu'à corriger, sous peine de voir un correctif appliqué au mauvais fichier | B9 | 🔵 Mineur | Faible | **P3** |
| 32 | **Rappels espacés : trois défauts cumulés sur la même surface.** (a) `spacedRecallService` figeait `docType:'mixed'` pour les 48 cartes alors qu'**un rappel se fait sans document sous les yeux** ⇒ `MISSING_VALUE_UNIT` reproché à des réponses conformes aux `acceptedEvidence` ; (b) `enzymes/s1` (« متى يبدأ التشبّع؟ », un **état**) étiqueté `analyse` ⇒ le moteur exigeait un vocabulaire de tendance absent de sa propre réponse attendue ; (c) `matchedEvidence` exigeait la **sous-chaîne exacte** ⇒ l'élève écrivant la forme conjuguée correcte `زادت` n'obtenait pas la preuve `تزداد`, et comme `minEvidence` vaut souvent le total des preuves, la progression était **bloquée malgré un score de 100** | B9 | 🔴 Critique | Faible | ✅ **Résolu** — `a918653` |
| 33 | **Le moteur de validation (12 lois) n'est jamais appelé sur les questions guidées de leçon.** `InteractiveLessonView:1283` n'emprunte la branche `validateEngineAnswer` que si `validationMode === 'engine'` **et** `validationCtx` est fourni ; or, sur les **22** questions guidées de `activeLessons.ts`, la valeur `'engine'` n'apparaît **que dans la déclaration de type** (l.85) et `validationCtx` n'est renseigné **nulle part**. Les 22 questions retombent donc silencieusement sur `validateKeywordAnswer` — simple présence de mots-clés, sans aucune des lois méthodologiques (كلما, نفترض, interdiction de ربما…) que l'application met en avant. Aucun bug visible : la branche morte masque une fonctionnalité annoncée mais non câblée | B9 | 🟠 Majeur | Moyen | **P2** |
| 36 | **Deux verbes de consigne majeurs absents du tableau de correspondance, et trois entrées rendues inatteignables par l'ordre d'itération.** `mapVerb` (`verbMapping.ts`) ne connaissait ni `استنتج` ni `استخرج` : ces consignes retombaient sur `null`, donc sans aucune loi. Or `استنتج` porte **8 des 22 questions guidées** et apparaît **26 fois dans le livre officiel** ; le guide méthodologique (§9 « استخرج مقابل استنتج ») distingue explicitement *relever ce qui figure au document* (⇒ `identify`) de *produire une conclusion logique nouvelle* (⇒ `synthesize`). Second défaut mis au jour par la mesure : la boucle par inclusion suivait l'ordre d'insertion, si bien que la clé courte `حدد` interceptait `حدد العلاقة`, `حدد الآلية` et `حدد المشكل` — trois entrées mortes alors que le fichier documente cette polysémie en tête. Corrigé par un tri du plus spécifique au plus général | B9 | 🟠 Majeur | Faible | ✅ **Résolu** — `4cf24d6` |
| 37 | **La loi #4 (« interdiction de ربما ») ne s'exécutait sur aucune question d'hypothèse.** `getActionVerbForValidation` ne traduisait que trois des six réflexes fondamentaux ; `hypothesize`, `validate` et `compare` retombaient sur le défaut `describe`. Les **6 contextes de pratique correctement étiquetés `reflexId: 'hypothesize'`** (sarine ×2, rifamycine ×2, Januvia, structure du globe) étaient donc corrigés comme de simples descriptions : une réponse ouverte par « ربما » — la faute méthodologique que l'application enseigne explicitement à éviter, absente des 2 586 lignes du livre officiel — **passait à 100/100**. L'étiquetage des données était juste ; c'est le traducteur qui perdait l'information. Table rendue exhaustive et contrainte par `Record<CoreReflexId, ActionVerb>` : ajouter un réflexe sans décider de son verbe casse désormais la compilation | B9 | 🔴 **Critique** | Faible | ✅ **Résolu** — `05e43a0` |
| 2 | Barème BAC 28/20/34 au lieu de 20 ; sujets mono-domaine | B4 | 🟠 Majeur | Faible-moyen | **P3** *(requalifié : code mort)* |
| 3 | 57 schémas hors-sujet (U11 : 93 %) | B5 | 🟠 Majeur | **Faible** | ✅ **Résolu** — commit `e130475` |
| 4 | 10 unités sur 11 verrouillées | B1 | 🟠 Majeur | **Très faible** | ❌ **Invalidé** *(voir §3.1)* |
| 5 | 0 figure dans le livre (discipline documentaire) | A6 | 🔴 Critique* | Moyen-élevé | **P1** |
| 6 | Densité 40-50 mots/page sur D1-IV, D1-V, D3-III | A4 | 🟠 Majeur | Élevé | **P2** |
| 7 | Corpus engendré par gabarits ; QCM désaligné du format BAC | B3 | 🟠 Majeur | Moyen-élevé | **P1** — *partiel : distracteurs traités (`0fe1710`), **énoncés non traités** (10 gabarits couvrent 494/508)* |
| 8 | ABO/Rh absents du livre ; دليل التصحيح promis non livré | A5 | 🟠 Majeur | Moyen | **P1** |
| 9 | Unité D2-U2 invisible dans OPUS (hiérarchie cassée) | A7 | 🟠 Majeur | **Très faible** | ✅ **Résolu** — commit `e130475` |
| 10 | Statut « officiel » affiché ≠ statut réel (correction DeepSeek) | A1 | 🟠 Majeur | Faible | **P1** |
| 11 | 5 fautes rédactionnelles dont « التسحيب الأكسدي » et « مُظبوطة » | A3 | 🟡 Modéré | **Très faible** | ✅ **Résolu** — commit `e130475` |
| 12 | ~~7 tests rouges (parcours débutant, arabisation)~~ | B9 | ✅ **RÉSOLU** | Faible | — |
| 13 | Arabisation des assets à 18 % (18/101) | B9 | 🟡 Modéré | Moyen | **P2** |
| 14 | 3 leçons interactives sur 11 unités | B1 | 🟠 Majeur | Élevé | **P2** |
| 15 | Pas de marqueur « exigible 2025-2026 » (ophiolites, collision) | B6 | 🟡 Modéré | Faible | **P2** |
| 16 | 26 schémas uniques / 508 QCM (U3, U5, U6 : 1 seul) | B5 | 🟡 Modéré | Moyen | **P2** |
| 17 | Interleukines : graphie « الأترولينات » fautive | A5 | 🟡 Modéré | Très faible | ✅ **Résolu** — commit `e130475` |
| 18 | Leçon 44 hors table officielle *(requalifié)* | B1 | 🔵 Mineur | Très faible | **P3** |
| 19 | `lecon_transcription.html` hors nomenclature *(requalifié)* | B1 | 🔵 Mineur | Très faible | **P4** |
| 20 | Racine polluée (~25 scripts `patch*.py`, `fix_*.py`) | — | 🔵 Mineur | Très faible | **P3** |
| 21 | **Les 508 explications réécrites n'ont pas été validées par un enseignant en exercice** *(constat né du traitement de #1)* | B2 | 🟠 Majeur | Moyen (≈ 4-5 j) | **P1** |
| 22 | Items **326 et 336** : échafaudage résiduel dans l'énoncé (`«3 \| العلاقة بين»`) ; réponse non informative pour 336 *(constat né du lot 4)* | B3 | 🟡 Modéré | Très faible | ✅ **Résolu** — commit `0fe1710` |
| 23 | Feedback **statique** : la même explication est servie quel que soit le distracteur choisi | B2 | 🟡 Modéré | Élevé | **P2** |
| 24 | **Correction morte sur 9 questions d'analyse documentaire sur 14** : `handleValidate` déréférençait `practice!` sans contexte défini ⇒ `TypeError` dans un gestionnaire d'événement, non rattrapé par l'`ErrorBoundary` ; l'élève rédigeait, cliquait, rien ne se produisait *(constat né du chantier #7)* | B1 | 🔴 **Critique** | Faible | ✅ **Résolu** — commit `e213e93` (9 contextes rédigés + garde défensive) |
| 25 | **14 `unitId` faux sur 15** dans `documentAnalysisExercises.ts` : le nerveux rattaché à l'unité 1 « تركيب البروتين », l'immunologie à l'unité 9 « النشاط التكتوني للصفائح ». Champ jamais lu par la vue ⇒ défaut invisible mais propagé à toute navigation ou statistique par unité *(constat né du chantier #7)* | B6 | 🟠 Majeur | Très faible | ✅ **Résolu** — commit `e213e93` |
| 26 | **Sur-annonce dans l'interface** : l'en-tête affichait « 15 وثيقة نخبة » alors que **9 documents sur 15** rendent « هذه الوثيقة غير جاهزة بعد. » — indisponibilité découverte seulement après le clic *(constat né du chantier #7)* | B7 | 🟡 Modéré | Très faible | ✅ **Résolu** — commit `e213e93` (compte réel + pastille « غير جاهزة ») |
| 30 | **Logique de correction dupliquée inline.** La traduction « contexte de pratique → contexte de validation » vivait dans le corps d'un composant : toute vérification externe en recopiait la règle et validait donc *sa copie*, pas le code exécuté. Extraite dans `lib/validation/practiceContextMapping.ts`, importée par la production et les tests ; l'extraction a révélé un `domain: string` non typé | B9 | 🟡 Modéré | Faible | ✅ **Résolu** — `8cc2452` |
| 29 | **Un schéma était traité comme un document chiffré.** Toute question de réflexe `analyse` était déclarée `quantitative`, y compris sur des **schémas de structure** sans axe gradué ni mesure. Conséquence mesurée : la **correction officielle** de `photosynthese_cycle_q1` — celle que l'app affiche comme réponse attendue — était elle-même refusée par le correcteur (`MISSING_KULLAMA`, *major*). 3 contextes concernés | B2 | 🔴 Critique | Faible | ✅ **Résolu** — `8cc2452` |
| 28 | **Le correcteur sanctionnait les réponses correctes au féminin.** La liste des verbes de tendance ne contenait que les formes masculines (`يزداد`…) ; toute réponse portant sur un sujet féminin — `السرعة`, `النسبة`, `الكمية` — recevait `MISSING_KULLAMA` (gravité *major*). **4 des 6 formes testées étaient rejetées.** Corrigé, plus test d'accord en genre | B2 | 🔴 Critique | Faible | ✅ **Résolu** — `a736830` |
| 27 | **Analyse documentaire : 13 exercices exploitables sur 19** (6 avant le lot 3, 9 avant le lot 4). Couverture réelle **11 unités sur 11**, tous dispositifs confondus — **U7, U8, U10 et U11 ne sont plus à zéro**. Reste : 6 exercices exigeant une **vraie image** (schéma de traduction, membrane HLA, Ouchterlony, électrophorèse Hb, PPSE/PPSI, H1/H2) | B4 | 🟡 Modéré *(était Majeur)* | Moyen | **P2** — *partiel : `a736830`* |

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

**Garde-fou.** `src/quizCorpus.integrity.test.ts` (9 tests à sa création, **22 aujourd'hui**) verrouille la structure du corpus, la cohérence unité↔domaine des schémas et l'existence réelle des fichiers sur disque. Il portait aussi deux plafonds de dette conçus pour ne jamais remonter — **plafonds remplacés depuis la clôture du chantier par une interdiction stricte** (voir le journal du lot 5). Sa première exécution a d'ailleurs corrigé une mesure de cet audit : le seuil « explications trop courtes » fixé à 321 items s'est révélé faux — **les 508 explications font moins de 25 mots**, la plus longue en comptant 22. Le constat #1 est donc plus étendu que ce que la §2 laissait entendre.

### Sprint 1 — « Feedback » — **le sprint qui compte** — *chantier clos, lots 1 à 5*

| Action | Effort | Constat traité | Statut |
|---|---|---|---|
| **Test de non-régression bloquant sur les explications** (rejet si recopie du terme de l'énoncé ou < 25 mots) | 2 h | #1 | ✅ **fait** (Sprint 0) |
| **Lot 1 — unité 11 (D3-III, 61 QCM)** réécrite au canevas en trois temps | — | #1 | ✅ **fait** |
| **Lot 2 — unités D1-IV (48 QCM) et D1-V (55 QCM)** réécrites au même canevas | — | #1 | ✅ **fait** |
| **Lot 3 — unités 1, 2 et 3 (121 QCM)**, clôture du domaine 1 | — | #1 | ✅ **fait** |
| **Lot 4 — unités 6, 7 et 8 (130 QCM)**, clôture du domaine 2 | — | #1 | ✅ **fait** |
| **Lot 5 — unités 9 et 10 (93 QCM)**, clôture du domaine 3 **et du corpus** | — | #1 | ✅ **fait** |
| **Passage du garde-fou de « plafonds dégressifs » à « tolérance nulle »** | 15 min | #1 | ✅ **fait** |
| Régénération des flashcards après correction | 0 j | #1 | ✅ **sans objet** — dérivation automatique vérifiée |
| **Relecture des 508 explications par un enseignant en exercice** | 4-5 j | **#21** | ⬜ **à faire — nouvelle priorité P1 du chantier** |
| ~~Correction des 7 tests rouges (parcours débutant, arabisation)~~ | 1 j | #12 | ✅ **fait** (Sprint 2, lot 1) |

Le test de non-régression a bien été écrit **avant** la réécriture : il transforme un chantier ponctuel en garantie permanente. Une fois la dette soldée, les deux plafonds dégressifs (`MAX_CIRCULAR`, `MAX_TOO_SHORT`) ont été **remplacés par une interdiction stricte** : toute explication circulaire ou de moins de 25 mots ajoutée au corpus fait désormais échouer la suite, et l'assertion par unité désigne immédiatement l'unité fautive. Le garde-fou compte **22 assertions**.

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

**Défaut annexe relevé pendant la lecture (hors périmètre P0).** Chaque QCM de l'unité 11 contient **un distracteur hors-domaine évident** — de l'immunologie ou de la respiration cellulaire glissée dans un item de tectonique. Un élève élimine cette option sans réfléchir : le choix réel se fait entre 3 options, et la difficulté mesurée est surévaluée. Le symptôme confirme la génération automatique diagnostiquée en [B3](#b3-majeur--un-corpus-généré--énoncés-standardisés-et-distracteurs-de-remplissage). **Ce point a été traité** : les 402 distracteurs de remplissage du corpus ont été réécrits en **erreurs classiques du même domaine** (confondre dorsale et zone de subduction, schiste bleu et micaschiste).

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

#### Journal d'exécution — lot 3 (unités 1, 2 et 3, ids 1-113 + 501-508) — **clôture du domaine 1**

**Cible.** Les trois unités fondatrices du programme : D1-I « تركيب البروتين » (39 QCM, ids 1-35 + 501-504), D1-II « البنية الفراغية للبروتين » (37 QCM, ids 36-68 + 505-508) et D1-III « النشاط الإنزيمي » (45 QCM, ids 69-113), soit **121 items**. Ce lot était prioritaire pour deux raisons : ce sont les unités **déverrouillées par défaut** — donc les premières que tout élève rencontre, et celles qui décident de sa confiance dans le produit — et ce sont les seules unités du domaine 1 encore non traitées.

**Lecture préalable intégrale.** Les 121 QCM ont été dumpés avec leur bonne réponse et lus avant écriture. Conclusion identique aux lots précédents : **aucune erreur scientifique dans les bonnes réponses** ; le défaut est strictement l'explication. Les 8 items 501-508, ajoutés hors série, faisaient exception : leurs explications étaient déjà causales mais trop brèves (18-22 mots) — ils ont été **étoffés** plutôt que réécrits.

**Exemples.**

> QCM 12 (ARN) — *avant* : « ARN يرتبط هنا بـ: غالباً أحادي السلسلة وأقل استقراراً من ADN. » (11 mots, circulaire).
> *Après* : « ARN غالباً أحادي السلسلة، سكره الريبوز، وهو أقل استقراراً من ADN، ما يناسب دوره كنسخة عمل مؤقتة. لا تخلط: ADN ثنائي ومستقر لأنه مخزن المعلومة. في البكالوريا: قارنهما بالسكر والقاعدة والبنية. » (31 mots) — l'explication **fonde l'instabilité sur la fonction** (copie de travail transitoire) au lieu de la constater.

> QCM 88 (Fischer) — *après* : « فيشر صاحب نموذج القفل والمفتاح، وهو أول تفسير مقترح للنوعية الإنزيمية، ويقوم على تكامل شكلي جامد بين الموقع الفعال والركيزة. لا تنسب إليه التلاؤم المحفز. في البكالوريا: فيشر = جمود، كوشلاند = مرونة. » — la réfutation cible la **confusion Fischer / Koshland**, l'erreur la plus fréquente de l'unité 3.

> QCM 105 (Km) — *après* : « Km هو تركيز الركيزة الموافق لنصف Vmax، وهو مؤشر على ألفة الإنزيم للركيزة. لا تخلطه بـVmax التي تقيس السرعة. في البكالوريا: Km منخفض يعني ألفة عالية. » — Km/Vmax est le couple le plus piégeux de l'enzymologie ; la formule finale est directement réutilisable en copie.

**Résultat mesuré.** `git diff --numstat` : **121 lignes modifiées, aucune ligne hors du champ `explanation`** — les `diagramUrl` sont intacts (contrôle par assertion bloc par bloc). Unités 1, 2 et 3 : **0 explication circulaire, 0 sous les 25 mots** (25 mots minimum, 33 au maximum). Corpus entier : circulaires **336 → 223**, trop courtes **344 → 223**. Plafonds abaissés d'autant et `REWRITTEN_UNITS` étendu de `[4, 5, 11]` à `[1, 2, 3, 4, 5, 11]` — **17 tests verts**. Suite complète : **356 passés / 7 échoués**, toujours les 7 échecs préexistants, aucune régression.

**Effet de seuil.** Avec ce lot, **285 QCM sur 508 (56 %) sont réécrits** et surtout **le domaine 1 est intégralement assaini** : un élève qui suit la progression officielle — unités 1 à 5 avant les vacances d'hiver — ne rencontre plus une seule explication circulaire. La dette résiduelle est désormais **exactement délimitée** : unités 6 à 10, 223 QCM, domaines 2 et 3 (métabolisme énergétique et géodynamique).

**Reste à faire.** 223 explications sur 5 unités (6, 7, 8, 9, 10), soit **13 à 16 jours-expert** au rythme constaté (≈ 15 items/jour-expert mesuré sur les trois lots).

#### Journal d'exécution — lot 4 (unités 6, 7 et 8, ids 217-346) — **clôture du domaine 2**

**Cible.** Le domaine 2 dans son intégralité : D2-I « التركيب الضوئي » (45 QCM, ids 217-261), D2-II « التنفس الخلوي والتخمر » (45 QCM, ids 262-306) et D2-III « الحصيلة الطاقوية » (40 QCM, ids 307-346), soit **130 items**. Ce domaine concentre le métabolisme énergétique, matière où les erreurs d'élèves sont les plus stéréotypées — donc où une réfutation ciblée du distracteur a le meilleur rendement pédagogique.

**Lecture préalable intégrale.** Les 130 QCM ont été dumpés et lus avec leur bonne réponse avant écriture. Conclusion inchangée depuis le lot 1 : **aucune erreur scientifique dans les bonnes réponses**. Deux items font exception au plan de la forme, non du fond (voir l'anomalie 326/336 en [B2](#b2-critique--98--dexplications-circulaires)).

**Angle retenu.** Le domaine 2 est le terrain de trois confusions récurrentes, ciblées systématiquement par la deuxième phrase du canevas :

1. **« la plante respire-t-elle la nuit seulement ? »** — l'erreur la plus répandue du programme. Les explications posent que la plante respire en permanence, et que ce qui change le jour c'est la *dominance* de la photosynthèse, pas l'arrêt de la respiration.
2. **« photosynthèse = inverse de la respiration »** — symétrie de façade. Les explications opposent les compartiments (chloroplaste/mitochondrie), les transporteurs (NADPH/NADH) et le sens du flux d'énergie.
3. **rendement énergétique** — la confusion entre les 2 ATP *nets* de la glycolyse et les 36-38 ATP du bilan complet, et entre fermentation (oxydation incomplète, ~2 ATP) et respiration.

**Exemples.**

> QCM 228 (membrane du thylakoïde) — *après* : « الغشاء الداخلي للثيلاكويد يحمل الأنظمة الضوئية وسلاسل نقل الإلكترونات وATP synthase، وهذا التنظيم الغشائي شرط لتوليد تدرج البروتونات. لا تنسب النقل الإلكتروني للستروما. في البكالوريا: كل نقل إلكتروني ضوئي يجري على غشاء. » — l'explication **fonde la localisation sur la fonction** (le gradient de protons exige une membrane close) au lieu de la faire mémoriser.

> QCM 290 (O₂) — *après* : « O2 المستقبل النهائي للإلكترونات في السلسلة، ويتحد مع البروتونات ليعطي ماء، وهذا ما يمنع تشبع النواقل. لا تنسب إليه إنتاج CO2. في البكالوريا: O2 يعطي الماء، والكربون يعطي CO2. » — la réfutation vise l'erreur classique consistant à faire de l'O₂ la source du CO₂ expiré.

> QCM 344 (matière/énergie) — *après* : « المادة تدور بين الكائنات والوسط في دورات مغلقة، خلافاً للطاقة التي تتدفق في اتجاه واحد وتُفقد كحرارة. في البكالوريا: هذا التمييز سؤال متكرر فاحفظه بصيغته الدقيقة. » — distinction cycle de la matière / flux unidirectionnel de l'énergie, régulièrement mal restituée en copie.

**Résultat mesuré.** `git diff --numstat` : **130 lignes modifiées, 130 ajoutées, aucune ligne hors du champ `explanation`** (contrôle `git diff -U0` filtré : 0 ligne). Unités 6, 7 et 8 : **0 explication circulaire, 0 sous les 25 mots** (25 mots minimum, 31 au maximum). Corpus entier : circulaires **223 → 93**, trop courtes **223 → 93**. `REWRITTEN_UNITS` étendu à `[1, 2, 3, 4, 5, 6, 7, 8, 11]` — **20 tests verts**. Suite complète : **359 passés / 7 échoués**, toujours les 7 échecs préexistants. Commit `1e80a42`.

**Effet de seuil.** Avec ce lot, **deux domaines sur trois sont intégralement assainis** et la dette résiduelle se réduit à deux unités de géologie.

#### Journal d'exécution — lot 5 (unités 9 et 10, ids 347-439) — **clôture du domaine 3 et du corpus**

**Cible.** Les deux dernières unités non traitées : D3-I « النشاط التكتوني للصفائح » (43 QCM, ids 347-389) et D3-II « بنية الكرة الأرضية » (50 QCM, ids 390-439), soit **93 items**. L'unité 11 du même domaine ayant servi de pilote au lot 1, ce lot ferme à la fois le domaine 3 et la totalité du corpus.

**Lecture préalable intégrale.** Les 93 QCM ont été lus avec leur bonne réponse. Aucune erreur scientifique relevée ; les valeurs numériques citées (Moho 30-70 km sous les continents, Gutenberg ≈ 2900 km, Lehmann ≈ 5100 km, vitesses de plaques en cm/an) sont exactes et conformes au programme.

**Angle retenu.** La géologie interne s'enseigne comme une **science de l'indirect** : on ne prélève jamais le manteau, on l'infère. Les explications de l'unité 10 ont donc été écrites autour de la chaîne de raisonnement plutôt qu'autour des faits — *donnée sismique observée → propriété physique déduite → limite structurale nommée* — parce que c'est exactement la démarche attendue par l'épreuve, qui fournit des sismogrammes et demande une déduction.

Trois confusions sont réfutées systématiquement : (1) **asthénosphère ≠ milieu liquide** — elle n'est que partiellement fondue, et le passage des ondes S le prouve ; (2) **limite lithosphère/asthénosphère (mécanique) ≠ Moho (chimique)** ; (3) **la chaleur seule ne détermine pas l'état physique** — le noyau interne, le plus chaud, est solide *par la pression*.

**Exemples.**

> QCM 406 (zone d'ombre des ondes S) — *après* : « ظل S واسع جداً وينتج عن توقف الموجات العرضية عند اللب الخارجي السائل، وهو الدليل الرئيسي على سيولته. في البكالوريا: غياب S خلف اللب حجة قاطعة على وسط مائع. » — l'explication nomme le **statut probatoire** de l'observation, pas seulement son contenu.

> QCM 435 (pression) — *après* : « الضغط الهائل في المركز يبقي اللب الداخلي صلباً رغم حرارته العالية، لأنه يرفع درجة انصهار الحديد. لا تهمله في التعليل. في البكالوريا: الضغط يرفع درجة الانصهار. » — traite frontalement le paradoxe « le point le plus chaud est solide », source d'erreur classique.

> QCM 382 (convection) — *après* : « المادة الساخنة تصعد لأنها أقل كثافة نسبياً بفعل التمدد الحراري، وهذا هو مبدأ الحمل. لا تخلط السبب بالنتيجة. في البكالوريا: فرق الكثافة هو المحرك الفيزيائي للحمل. » — rétablit la causalité (dilatation → densité → mouvement) là où l'élève retient une image.

**Résultat mesuré.** Deux applications successives, contrôlées séparément : **43 lignes** puis **50 lignes** modifiées, **0 ligne hors du champ `explanation`**, `diagramUrl` intacts (assertion bloc par bloc). Unités 9 et 10 : **0 circulaire, 0 sous les 25 mots** (25 minimum, 32 maximum).

**Mesure finale sur le corpus entier :**

```
total 508 circ 0 short 0
u1 39 circ 0 short 0     u7  45 circ 0 short 0
u2 37 circ 0 short 0     u8  40 circ 0 short 0
u3 45 circ 0 short 0     u9  43 circ 0 short 0
u4 48 circ 0 short 0     u10 50 circ 0 short 0
u5 55 circ 0 short 0     u11 61 circ 0 short 0
u6 45 circ 0 short 0
```

**Durcissement du garde-fou.** La dette étant nulle, les deux plafonds dégressifs ont été supprimés au profit d'assertions strictes (`expect(circular.map(q => q.id)).toEqual([])`), et `REWRITTEN_UNITS` couvre les **11 unités**. Le fichier `src/quizCorpus.integrity.test.ts` compte **22 assertions, toutes vertes**. Suite complète : **361 passés / 7 échoués** — les 7 mêmes échecs préexistants, aucune régression introduite par les cinq lots.

**Bilan du chantier #1.** 508 explications réécrites en 5 lots, **500 flashcards réparées par dérivation automatique**, 0 modification hors du champ `explanation` sur l'ensemble des lots, 0 régression. Le seul P0 de l'audit est soldé. Trois constats en sont nés, inscrits au registre : **#21** (validation enseignante requise), **#22** (items 326/336, depuis soldé), **#23** (feedback non différencié).

### Sprint 2 — « Conformité au format d'épreuve » (12-15 jours)

| Action | Effort | Constat traité |
|---|---|---|
| Conversion d'une part des QCM en questions documentées | 10 j | #7 |
| Marqueur « exigible 2025-2026 » sur leçons et QCM | 2 j | #15 |
| Rédaction de la section ABO/Rh du livre (réutiliser `phase5_chapitres_9_10.html`) | 2 j | #8 |
| Production du دليل التصحيح, ou retrait de la promesse l.26 | 3 j | #8 |

### Lot 2 du Sprint 2 — « Analyse documentaire » : trois défauts prouvés par exécution

Le constat **#7** désigne le format d'évaluation comme le vrai plafond du produit : le BAC algérien évalue par **analyse expérimentale documentée** (deux parties indépendantes, 15 + 5 points, sur deux domaines différents), pas par QCM. L'application dispose déjà du bon dispositif — `DocumentAnalysisView`, 15 exercices, 33 questions. L'audit de ce dispositif a révélé qu'il était **partiellement hors service**.

**Défaut 1 — la correction ne répondait pas (Critique).** `handleValidate` construisait sa trace avec `context: practice!`, l'opérateur `!` affirmant au compilateur qu'un contexte de pratique existe toujours. Il n'existait que pour 5 questions sur les 14 réellement atteignables. Pour les 9 autres, `validateDocumentTrace` recevait `undefined` et levait `TypeError: Cannot read properties of undefined (reading 'expectedEvidence')`.

Ce défaut est plus grave que ne le suggère son libellé, pour une raison de mécanique React : **l'erreur est levée dans un gestionnaire d'événement**, or les `ErrorBoundary` n'interceptent pas les erreurs des handlers. Il n'y avait donc ni écran de secours, ni message : l'élève rédigeait sa réponse, cliquait « صحّح إجابتي », et **rien ne se produisait**. Le symptôme le plus décourageant possible dans une application de révision — et le plus silencieux pour l'équipe, puisqu'il ne remonte dans aucun log.

Mesure par exécution avant correction, sur les 14 questions atteignables : **9 plantages**. Après : **0**.

La correction est double, et l'ordre importe. D'abord une **garde défensive** (`if (!practice) { setRecorded(null); return; }`) : plus aucun contexte manquant ne pourra jamais provoquer de crash. Ensuite la **rédaction des 9 contextes manquants** — car la garde seule aurait transformé un plantage en bouton inerte, ce qui n'est pas une correction mais un camouflage.

**Défaut 2 — 14 `unitId` faux sur 15 (Majeur).** Les exercices de jonction neuromusculaire étaient rattachés à l'unité 1 (تركيب البروتين), ceux d'immunologie à l'unité 9 (النشاط التكتوني للصفائح). Ce champ n'étant lu par aucun composant, le défaut était **invisible à l'usage** — mais il aurait contaminé toute navigation par unité, tout filtre de révision et toute statistique de maîtrise construits par-dessus. Corrigé sur les 15 exercices, et **figé par un test** qui compare la table complète exercice → unité → nombre de questions.

**Défaut 3 — sur-annonce dans l'interface (Modéré).** L'en-tête annonçait « 15 وثيقة نخبة » quand **9 documents sur 15** affichent « هذه الوثيقة غير جاهزة بعد. ». L'élève découvrait l'indisponibilité après avoir choisi l'exercice. L'en-tête affiche désormais le nombre réellement exploitable, et la liste porte une pastille « غير جاهزة » **avant** le clic. Le dispositif restait alors à **6 exercices exploitables sur 15** : c'est le constat **#27**, traité en partie par le lot 3 ci-dessous.

**Deux specs obsolètes, corrigées avec leur motif.** Deux tests s'opposaient à la correction. Ils n'ont pas été assouplis pour verdir : ils ont été requalifiés, motif écrit en commentaire dans le code.

Le premier, `exerciseId unique`, imposait **un seul contexte par exercice** alors que la clé de lecture réelle est le couple `(exerciseId, questionId)`. Cet invariant interdisait littéralement de documenter les questions q2 et q3 — **c'est lui qui a produit le défaut 1**. Il est remplacé par l'unicité du couple (vérifiée : 25 contextes, 25 couples distincts) plus un test de non-régression exigeant qu'au moins un exercice porte plusieurs contextes. Avant de le modifier, ses consommateurs ont été recherchés : un seul, le test lui-même. Et il a été vérifié par exécution que `getDocumentPracticeContextByExercise` — appelé sans `questionId` par `LiveDocumentUracile` et `sessionEffectsService` — **résout toujours la question q1 pour les 17 exercices**, donc sans changement de comportement.

Le second figeait par `toEqual` la liste ordonnée de 16 exercices prioritaires, rendant tout ajout impossible. Il vérifie désormais la **présence** de ces 16 exercices sans figer ni l'ordre ni le total.

**Bilan du lot.** 9 contextes rédigés, 15 `unitId` corrigés, 1 garde défensive, 1 en-tête rendu sincère, 7 assertions d'intégrité ajoutées (`src/data/documentAnalysis.integrity.test.ts`). **380 tests verts sur 380** (42 fichiers) *à la date du lot 2 — 436 après le lot 4*, `tsc` rc=0, build OK, 0 doublon d'options sur 508 QCM. Constats **#24**, **#25**, **#26** soldés ; **#27** alors ouvert en P1 *(ramené à P2/Modéré au lot 4)*.

---
### Lot 3 du Sprint 2 — trois documents rendus exploitables, et une erreur d'audit corrigée

**Auto-correction préalable.** Le constat #27 tel que rédigé au lot 2 affirmait « aucun exercice sur les trois unités de géologie ». **C'était faux, et c'est une erreur de méthode de ma part** : je n'avais mesuré qu'une seule des deux surfaces. L'analyse documentaire existe à deux endroits distincts :

| Surface | Composant | Exercices | Sélection |
|---|---|---|---|
| Vue dédiée | `DocumentAnalysisView` | 15 | choix libre par l'élève |
| Fin de leçon | `LiveDocumentUracile` | 11 | imposé par `LESSON_DOCUMENT_EXERCISE_ID` |

Les 11 contextes que je prenais pour des « orphelins » (aucun exercice correspondant) alimentent en réalité la **seconde** surface, à la fin des leçons — dont `subduction_water_melting` et `seismic_p_s_core`, tous deux **en géologie**. Les 12 identifiants de leçon du mapping ont été vérifiés : **12 présents sur 12**, aucun mapping mort. La géologie n'était donc pas absente, elle était ailleurs. Le constat est corrigé au registre.

**Ce qui était réellement bloqué.** En classant les 9 exercices indisponibles par type de document, trois d'entre eux **n'attendaient aucune image** :

| Exercice | Unité | Type | Ce qui manquait |
|---|---|---|---|
| `enzyme_ph_temp` | 3 | tableau | l'asset seulement |
| `glycemie_januvia` | 3 | courbe | l'asset seulement |
| `photosynth_courbe` | 6 | courbe | l'asset seulement |

`DocumentAssetRenderer` sait déjà dessiner `table` et `curve` en SVG **à partir de données**. Leurs questions, leur `correctionAr` et leur `grilleEntrainement` étaient déjà écrites intégralement. Ces trois exercices étaient donc déclarés `unavailable` **pour rien** — un travail pédagogique déjà fait, invisible faute de quelques lignes de données.

Ils sont désormais construits. Deux décisions valent d'être explicitées :

- **`glycemie_januvia` est monté en `mixed` à deux courbes.** Sa question q3 demande « صادق بربط منحنى السكر والهرمون » — valider *en reliant* la courbe de glycémie et celle de l'hormone. Avec une seule courbe, la question était littéralement insoluble.
- **Échelles qualitatives, pas numériques** (`منخفض`/`مرتفع`, `التشبع`). Le programme ne fixe aucune valeur chiffrée pour ces expériences ; inventer des nombres aurait introduit de la donnée non sourcée dans un support de révision. C'est la convention déjà retenue pour `curareTable` et `michaelisCurve`.

**Les 7 questions ainsi ouvertes ont reçu leur contexte de pratique avant d'être exposées.** L'ordre n'est pas anodin : la garde défensive du lot 2 aurait empêché le crash, mais laissé le bouton « corriger » **inerte** — le même mur pour l'élève, sous une forme plus polie. Le `reflexId` de chacune suit le verbe réel de la consigne (حلل → `analyse`, فسر → `interpret`, اقترح فرضية → `hypothesize`, صادق → `validate`).

**Le garde-fou a joué son rôle.** L'assertion `expect(reachable).toHaveLength(6)` écrite au lot 2 a fait échouer la suite au passage à 9. C'est exactement ce pour quoi elle avait été posée : rendre toute variation du périmètre **délibérée**. Mise à jour sciemment, motif en commentaire.

**Mesures par exécution.** Questions atteignables **14 → 21**, sans contexte **0**. Rendu vérifié à travers le vrai composant : tableau à 5 lignes, glycémie à 2 polylignes, photosynthèse à 1 polyligne, aucun message « غير جاهزة ». **380/380 tests**, `tsc` rc=0, build OK.

**Ce qui reste, et pourquoi ça ne se règle pas au clavier.** Les 6 exercices encore bloqués exigent une **vraie image** — schéma de traduction, membrane HLA, arcs d'Ouchterlony, électrophorèse de l'hémoglobine, PPSE/PPSI, double document H1/H2. Aucune donnée ne les remplace : c'est une production graphique, chiffrée au Sprint 3. Couverture réelle, les deux surfaces cumulées :

| U1 | U2 | U3 | U4 | U5 | U6 | U7 | U8 | U9 | U10 | U11 |
|---|---|---|---|---|---|---|---|---|---|---|
| 3 | 1 | 3 | 4 | 5 | 2 | **0** | **0** | 2 | **0** | **0** |

**7 unités sur 11 — état à la clôture du lot 3 ; le lot 4 ci-dessous porte ce chiffre à 11/11.** Les trous ne sont pas en géologie mais sur **U7 (التنفس/التخمر), U8 (الحصيلة الطاقوية), U10 (بنية الكرة الأرضية) et U11 (البنيات الجيولوجية)** — quatre unités qui totalisent pourtant **196 QCM**. U11 est la plus dotée du corpus (61 QCM) et n'a aucun document.

---

### Lot 4 du Sprint 2 — les quatre unités orphelines, et un correcteur qui refusait le féminin

**Objectif.** Combler les quatre trous mesurés au lot 3 — U7, U8, U10, U11, soit 196 QCM sans le moindre document — sans attendre la production graphique du Sprint 3. Méthode identique à celle du lot 3 : n'écrire que des documents de types **`table`, `curve` et `mixed`**, que le renderer dessine à partir de données, donc sans dépendance à une image.

**Ce qui a été produit.** Quatre exercices neufs, ancrés sur le livre officiel : `respiration_bilan` (U7, 3 questions, bilan 38 ATP contre 2 ATP en fermentation, p. 206), `bilan_energetique_cellule` (U8, 2 questions, p. 228), `structure_terre_ondes` (U10, 3 questions dont une hypothèse sur l'état liquide du noyau, discontinuités Moho / Gutenberg 2 900 km / Lehmann ≈ 5 100 km, p. 259-286) et `structures_geologiques_compare` (U11, 2 questions, dorsale / subduction / collision, p. 287-330). Chacun est livré complet : document, questions, correction, barème sur 20 et **contexte de pratique** — 10 contextes rédigés, portant le fichier à 42.

**Résultat, mesuré par exécution des deux surfaces** (et non par lecture du code) :

| | U1 | U2 | U3 | U4 | U5 | U6 | U7 | U8 | U9 | U10 | U11 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Avant le lot 4 | 3 | 1 | 3 | 4 | 5 | 2 | **0** | **0** | 2 | **0** | **0** |
| Après le lot 4 | 3 | 1 | 3 | 4 | 5 | 2 | **1** | **1** | 2 | **1** | **1** |

**11 unités sur 11, aucune unité vide.** Les exercices exploitables passent de 9/15 à **13/19**, les questions atteignables de 21 à **31**, toutes dotées d'un contexte avant exposition.

**Le vrai défaut du lot — un correcteur qui refusait le féminin (Critique).** En vérifiant que le moteur accepte bien les réponses modèles, j'ai soumis les 43 gabarits de l'application à son propre correcteur : **6 étaient sanctionnés**. La cause n'est pas dans les données. Le contrôle de tendance quantitative s'appuie sur une liste de verbes qui ne contenait que les formes **masculines** — `يزداد`, `يرتفع`, `ينخفض`. Or l'arabe accorde le verbe en genre : on écrit `يزداد التركيز` mais **`تزداد السرعة`**. Résultat, mesuré : sur 6 formulations correctes testées, **4 étaient rejetées** avec l'erreur `MISSING_KULLAMA` de gravité *major*. Un élève écrivant la bonne réponse sur `السرعة`, `النسبة` ou `الكمية` — c'est-à-dire sur la majorité des grandeurs de SVT — était pénalisé pour une faute qu'il n'avait pas commise. Le défaut touchait **toutes les unités**, pas seulement les nouvelles.

La correction porte sur le moteur (`ValidationEngine.ts`, 9 formes féminines ajoutées, motif écrit en commentaire), **pas sur la règle** : une analyse quantitative sans aucun marqueur de tendance reste sanctionnée, et un test négatif le vérifie. Trois autres gabarits étaient des ébauches non rédigées (`نلاحظ قمة عند … بينما تنخفض عند …`) exigeant un chiffre que leur document ne contient pas — leurs échelles sont textuelles — et un quatrième, sur l'immunodiffusion, contenait le mot `كلما` **dans sa propre mise en garde contre `كلما`**. Les hints sont réécrits à partir des valeurs réelles des documents, et trois `docType` mal déclarés `quantitative` sont passés en `qualitative`, conformément à ce que le document montre.

**Garde-fou.** Un test paramétré vérifie désormais que **chacun des 43 gabarits est accepté par `validateAnswer`** : l'application ne peut plus suggérer à l'élève une phrase que son propre correcteur refuserait. Il est doublé d'un test structurel — « aucune unité du programme sans document » — qui survivra aux prochains lots, là où un simple compteur `toHaveLength(19)` deviendrait obsolète au premier ajout.

**Le même défaut, sur une autre surface (Critique).** Le biais de genre réparé, j'ai balayé les **autres** dispositifs qui appellent le correcteur plutôt que de supposer le problème réglé. Il y en a cinq. Sur la surface « leçon » — celle qui affiche un document en fin de cours — **la correction officielle de `photosynthese_cycle_q1` était elle-même refusée par le correcteur**. La cause est distincte du constat #28 : la traduction du contexte vers le moteur déclarait `quantitative` toute question de réflexe `analyse`, **y compris sur un schéma de structure**. Or un schéma de la photosynthèse n'a ni axe gradué ni valeur mesurée : exiger un marqueur de tendance chiffrée sur une réponse de *localisation* est une contradiction dans les termes. Trois contextes étaient dans ce cas. La règle est corrigée à sa racine : seuls les documents qui **portent** des valeurs — courbe, tableau, mixte — sont désormais quantitatifs.

**Un défaut de méthode, révélé en cours de route (Modéré).** Mon premier script de vérification recopiait cette règle de mapping pour la rejouer hors de l'application. Il a donc affiché « 0 sanctionnée » *après* le correctif — alors que le correctif n'avait pas encore d'effet, parce que le script validait **sa propre copie** de la règle, pas le code exécuté. C'est le même piège que celui documenté en annexe : une mesure qui contredit ou confirme trop commodément doit d'abord faire suspecter l'instrument. La logique est extraite dans `src/lib/validation/practiceContextMapping.ts`, désormais importée **par la production et par les tests** ; l'extraction a par ailleurs révélé un `domain: string` non typé que le compilateur a immédiatement signalé. Constats **#29** et **#30**.

**Un doublon dormant (Mineur).** Le balayage a aussi exhumé `src/utils/validationEngine.ts` — 166 lignes, un **second** moteur de validation portant le même biais masculin, et **aucun importeur**. Il est signalé en **#31** pour suppression : le laisser en place expose au scénario où un correctif futur est appliqué au fichier mort pendant que le bug persiste en production.

**Bilan du lot.** 4 exercices, 4 documents, 10 contextes ; **3 bugs de correction** dont 2 critiques, 6 gabarits assainis, 3 `docType` corrigés, 1 règle dupliquée extraite. **450 tests verts sur 450** (contre 380), `tsc` rc=0, build OK. Constats **#28**, **#29** et **#30** ouverts et soldés dans le lot ; **#31** ouvert en P3 ; **#27** ramené de Majeur à Modéré et de P1 à P2 — il ne reste que les 6 documents exigeant une vraie image.

### Lot 5 — la surface des rappels espacés (constat #32)

Les lots précédents avaient corrigé le correcteur là où l'élève **voit** un document. Restait la surface où il n'en voit aucun : les 48 cartes de rappel espacé. Le balayage y a trouvé **trois défauts distincts**, dont un bloquant.

Le premier prolonge exactement #28/#29 : `spacedRecallService` fixait `docType: 'mixed'` pour les 48 cartes, sans distinction. Or `mixed` combiné à `analyse` déclenche l'exigence d'une valeur chiffrée — alors qu'**un rappel de mémoire se fait par définition sans document sous les yeux**. L'élève ne peut relever aucune valeur : l'exigence est structurellement insatisfiable. Deux cartes (`enzymes/s0`, `enzymes/s1`) se voyaient ainsi reprocher `MISSING_VALUE_UNIT` sur une réponse pourtant composée des `acceptedEvidence` déclarées par la carte elle-même.

Le deuxième est un défaut de **donnée**, pas de moteur : `enzymes/s1` demande « متى يبدأ التشبّع؟ » — quand la saturation commence, c'est-à-dire un **état**, pas une variation. Étiquetée `analyse`, la carte réclamait un vocabulaire de tendance que sa propre réponse attendue ne contient pas. Le fichier lui-même donnait la norme : 11 des 12 concepts utilisent `explain` au stage 1.

Le troisième est le plus grave car il **bloque la progression**. `matchedEvidence` exigeait la sous-chaîne exacte : un élève écrivant la forme conjuguée parfaitement correcte `زادت` n'obtenait pas la preuve stockée sous la forme `تزداد`. Comme `minEvidence` vaut souvent le nombre **total** de preuves, il manquait alors une preuve sur trois — et la carte était refusée **avec un score de 100**. Le correctif introduit des familles morphologiques fermées et volontairement étroites, sans aucun rapprochement approximatif.

**Deux fausses pistes écartées par la mesure, pas par l'intuition.** Requalifier les cartes en `qualitative` sans `qualitativeTrend` ramenait le compteur à `0/48` sanctionnées — un vert trompeur : la même configuration rejetait ensuite `كلما` dans **47 cartes sur 48**, or `كلما` est précisément la tournure attendue au BAC. Déduire `qualitativeTrend` de la présence d'un verbe de tendance dans les données produisait le même effondrement. Seul `qualitative + qualitativeTrend` tient sur les quatre styles de réponse testés. **Le premier chiffrage était lui-même faux** : le script initial comptait des « sanctions » là où le service, lui, laissait passer l'élève (score 85, `passed = true`) — la mesure ne devenait exacte qu'en passant par `recordSpacedRecallAttempt`, le service réellement exécuté.

**Bilan du lot.** 3 défauts dont 1 bloquant, 1 correctif de service, 1 correctif de donnée, 1 garde-fou permanent de 4 tests (`spacedRecallValidation.test.ts`) passant par le service réel. Les quatre assertions ont été **mutées une à une** : chacune rougit en nommant la carte fautive, puis restauration vérifiée. **454 tests verts sur 454**, `tsc` rc=0.

**Fin du balayage : les six surfaces de correction sont désormais couvertes.** Le lot 5 clôt la revue systématique des appelants du moteur de validation, entamée au lot 4. Bilan : `InteractiveLessonView` (sortie de leçon) ✅, `LiveDocumentUracile` ✅ (#29/#30), `spacedRecallService` ✅ (#32), `useSmartValidation` ✅ — il consomme les `ctx` de `documentAnalysisExercises`, déjà couverts par l'invariant des 43 couples du lot 4 —, `proteinChapterValidationService` ✅ (son unique contexte non couvert porte le verbe `hypothesize`, que les règles de valeur chiffrée et de `كلما` ne concernent pas). Reste `src/utils/validationEngine.ts`, code mort (#31).

Ce balayage a livré un dernier constat, d'une autre nature : **le moteur n'est pas appelé du tout** sur les 22 questions guidées de leçon (#33). La branche existe, la donnée qui l'active n'a jamais été écrite — `'engine'` ne figure que dans la déclaration de type. Ces questions sont corrigées par simple présence de mots-clés, sans aucune des douze lois méthodologiques que l'application présente comme son cœur pédagogique. C'est le pendant exact de #31 : là, un moteur mort que l'on risquait de corriger ; ici, un moteur vivant que l'on a oublié de brancher.

**Instruction de #33 : avant de brancher, vérifier ce qui serait branché (constat #36).** Le câblage des 22 questions relève d'un choix pédagogique qui appartient à l'enseignant, mais son instruction technique a révélé un défaut isolé, prouvé et corrigeable seul. La table de correspondance verbe→loi (`mapVerb`) **ignorait `استنتج`** — le verbe le plus fréquent des 22 questions (8 occurrences), employé **26 fois dans le livre officiel**. Brancher le moteur sans corriger ce trou aurait laissé ces huit questions sans aucune loi, tout en donnant l'illusion inverse : le pire des deux mondes. Le guide méthodologique tranche lui-même l'ambiguïté dans une section dédiée (§9 « استخرج مقابل استنتج ») : `استخرج` = relever ce qui figure au document ⇒ `identify` ; `استنتج` = produire une conclusion logique nouvelle rattachée au problème scientifique ⇒ `synthesize`, qui déclenche le contrôle de structure en trois blocs. Les deux verbes ont été ajoutés en s'appuyant sur cette définition, et non sur une intuition.

La même mesure a exhumé un second défaut, invisible à la lecture : la recherche par inclusion parcourait la table **dans l'ordre d'insertion**, si bien que la clé courte `حدد` interceptait `حدد العلاقة`, `حدد الآلية` et `حدد المشكل`. Ces trois entrées étaient **mortes** — alors que le fichier documente précisément cette polysémie en tête, et que la distinction est décisive : selon la formulation, `حدد` appelle une description, une analyse de relation ou une interprétation de mécanisme. Un tri du plus spécifique au plus général les rend atteignables. Ce défaut illustre une règle déjà rencontrée trois fois dans cet audit : **une table de correspondance ne vaut que ce que vaut la boucle qui la lit**, et seule l'exécution le dit. Les cinq garde-fous de `verbMapping.test.ts` ont été mutation-testés (retour à l'ordre d'insertion ⇒ 1 échec ; retrait de `استنتج` ⇒ 2 échecs).

**Le défaut le plus grave de la série était le plus silencieux (constat #37).** En vérifiant que les verbes corrigés atteignaient bien le moteur, une question s'est imposée : *le traducteur entre les données et le moteur est-il complet ?* Il ne l'était pas. `getActionVerbForValidation` ne traduisait que trois des six réflexes fondamentaux ; `hypothesize`, `validate` et `compare` retombaient sur le défaut `describe`. Les données étaient pourtant justes — les six contextes d'hypothèse (sarine ×2, rifamycine ×2, Januvia, structure du globe) portent bien `reflexId: 'hypothesize'`. C'est le traducteur qui perdait l'information en chemin.

Conséquence, mesurée sur le service réel : la **loi #4** — « صغ الفرضية بـ نفترض أن … يُمنع ربما » — ne s'exécutait sur **aucune** question d'hypothèse de l'application. Une réponse ouverte par « ربما » y obtenait **100/100**. Or c'est précisément la faute que l'application enseigne à éviter : elle lui consacre une fiche de méthodologie, un message de remédiation dédié et un exemple contre-exemple ; le mot n'apparaît pas une seule fois dans les 2 586 lignes du livre officiel. L'application sanctionnait donc partout *sauf* là où elle l'avait promis.

Deux détails valident le correctif plutôt que de le supposer. D'abord, les **11 corrections officielles** affichées à l'élève restent acceptées après durcissement : le renforcement frappe la formulation dubitative, pas les réponses justes — un correctif qui aurait fait échouer les corrections du produit aurait été un faux correctif. Ensuite, un **contrôle négatif** vérifie que « ربما » demeure toléré hors hypothèse (citation, explication), conformément à la décision déjà inscrite dans `reflexes.test.ts` : la loi #4 ne doit pas devenir un filtre global. La table est désormais contrainte par `Record<CoreReflexId, ActionVerb>` — ajouter un septième réflexe sans décider de son verbe casse la compilation au lieu de retomber en silence sur `describe`.

**Ce que ces trois constats disent du sous-système.** #36 et #37 partagent une même signature avec #31 et #29 : *la donnée est correcte, la règle est correcte, mais le chemin entre les deux perd l'information* — un ordre d'itération, un `switch` partiel, un moteur jamais appelé, un second moteur mort. Aucun de ces défauts n'est visible à la lecture du code, aucun ne produit d'erreur, tous rendent le correcteur silencieusement plus permissif que sa spécification. C'est l'angle mort le plus coûteux d'une application éducative : **un correcteur trop indulgent ne se plaint jamais**, et l'élève ne découvre l'écart qu'à l'épreuve. La leçon d'audit est méthodologique : sur ce sous-système, ne jamais conclure d'un `grep` ni d'une lecture — seule l'exécution du service réel, contre-exemples compris, dit ce que l'élève reçoit.



---

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

# --- B2 après réécriture : contrôle de la dette (doit afficher 0 / 0) ---
# Mesure de référence, à relancer après toute modification du corpus.
cat > /tmp/count.mjs <<'EOF'
import { SVT_QUIZ_QUESTIONS as Q } from './src/quizCorpus.ts';
const words = (t) => (t ?? '').trim().split(/\s+/).filter(Boolean).length;
const term  = (t) => (t.match(/«([^»]+)»/) ?? [])[1];
const circ  = (q) => q.explanation.includes('يرتبط هنا بـ')
                  && !!term(q.questionText)
                  && q.explanation.includes(term(q.questionText));
for (const u of [...new Set(Q.map(q => q.unitId))].sort((a,b) => a-b)) {
  const it = Q.filter(q => q.unitId === u);
  console.log('u' + u, it.length,
    'circ', it.filter(circ).length,
    'short', it.filter(q => words(q.explanation) < 25).length);
}
EOF
npx vite-node /tmp/count.mjs      # attendu : circ 0 / short 0 sur les 11 unités

# --- B4 : barème BAC (par EXÉCUTION, pas par comptage statique) ---
# le générateur échantillonne le corpus : exécuter bacGenerator par domaine -> 28 / 20 / 34

# --- B9 : tests ---
npx vitest run        # état final : 369 passés / 0 échoué ; 41 fichiers ; ~82 s
                      # (à l'ouverture de l'audit : 339 passés / 7 échoués sur 346)
npx vitest run src/quizCorpus.integrity.test.ts   # garde-fou seul : 22 assertions vertes
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

*Fin du rapport. Volet A : 6,4/10 — Volet B : 7,2/10 après le Sprint 0, les cinq lots du Sprint 1 et les quatre lots du Sprint 2. **Le seul P0 de l'audit — constat #1, les explications circulaires — est soldé** : les 508 explications des 11 unités ont été réécrites au canevas « mécanisme → réfutation du distracteur → mot-clé BAC », l'échafaudage de génération a été retiré des 500 énoncés, les 500 flashcards sont réparées par dérivation automatique, et le corpus passe de 500 explications circulaires à **zéro**, sous un garde-fou de 23 assertions désormais à **tolérance nulle**. Le premier lot du Sprint 2 a par ailleurs soldé le constat #12 : les 7 tests rouges décrivaient des fonctionnalités spécifiées mais non câblées — rampe débutant rendue derrière son propre garde d'onboarding, 300 lignes de métadonnées visuelles n'atteignant jamais le DOM — et sont désormais verts sans qu'aucune assertion ait été assouplie (**369 tests verts, 0 rouge**, `tsc` propre, build OK). Deux constats nés de ce chantier restent ouverts : la validation par un enseignant en exercice (#21, P1) et l'absence de feedback différencié par distracteur (#23, P2) ; le troisième, les items 326/336 (#22), a été soldé depuis. Le Sprint 2 a par ailleurs assaini le corpus de QCM : **402 distracteurs de remplissage sur 508 items (79 %)** — des phrases hors-domaine éliminables sans connaître le cours — ont été réécrits en erreurs classiques portant sur le concept visé, les items 326/336 ont été reconstruits (constat #22 soldé), et les stratégies de réussite sans connaissance sont retombées au niveau du hasard (35,4 % → 17,5 %). **372 tests verts**, `tsc` propre, build OK. Le second lot du Sprint 2 s'est attaqué à **la forme de l'évaluation** — l'analyse documentaire, seul format proche du BAC réel — et y a trouvé un défaut critique jusque-là invisible : **9 des 14 questions atteignables ne répondaient pas au clic sur « corriger »**, un `TypeError` levé dans un gestionnaire d'événement, donc hors de portée de l'`ErrorBoundary` et absent de tout log. Le dispositif est réparé (0 plantage sur 14), ses 14 `unitId` erronés sur 15 sont corrigés et figés par un test, et l'en-tête n'annonce plus 15 documents quand 6 seulement sont exploitables. Deux specs obsolètes ont été requalifiées avec leur motif écrit dans le code, après vérification qu'aucun appelant de production ne changeait de comportement. **380 tests verts, 0 rouge**, `tsc` propre, build OK. Le lot 3 a poursuivi sur le constat **#27** et corrigé au passage une erreur de mon propre audit : j'avais écrit « aucun exercice en géologie » en n'ayant mesuré qu'une des **deux** surfaces d'analyse documentaire — la géologie est couverte en fin de leçon, pas dans la vue dédiée. Trois exercices sur les neuf bloqués n'attendaient **aucune image** (types tableau/courbe, que le renderer dessine à partir de données) et disposaient déjà de leurs questions, corrections et barèmes : ils sont désormais exploitables, **9 sur 15**, leurs 7 questions dotées d'un contexte avant exposition. **380 tests verts**, `tsc` propre, build OK. Le lot 4 a comblé les quatre trous restants : **U7, U8, U10 et U11** — 196 QCM jusqu'alors sans le moindre document — disposent chacune d'un exercice complet bâti sur des types `table`/`curve`/`mixed`, sans attendre la production graphique. La couverture atteint **11 unités sur 11, aucune unité vide**, et **13 exercices exploitables sur 19**. Ce lot a surtout révélé un défaut critique invisible aux tests existants : en soumettant les 43 réponses modèles de l'application à son propre correcteur, **6 étaient sanctionnées**, dont 4 parce que la liste des verbes de tendance ne contenait que les formes **masculines** — `تزداد السرعة` était refusé là où `يزداد التركيز` passait. **L'application pénalisait donc des réponses justes, dans toutes les unités, dès que le sujet était féminin** : c'est-à-dire sur la majorité des grandeurs de SVT. Le moteur est corrigé sans que la règle soit assouplie (le cas négatif reste sanctionné, un test le prouve), et un garde-fou paramétré interdit désormais qu'un gabarit suggéré soit refusé par le correcteur. En balayant ensuite les cinq **autres** surfaces qui appellent le correcteur, j'ai trouvé le même type de défaut ailleurs : sur la surface « leçon », **la correction officielle de la photosynthèse était refusée par l'application elle-même**, parce qu'un *schéma de structure* — sans axe ni mesure — était déclaré document *quantitatif*. Corrigé à la racine (#29), avec la règle extraite d'un composant vers un module partagé par la production et les tests (#30) : elle était dupliquée, si bien qu'une vérification externe validait sa propre copie plutôt que le code exécuté. Le lot 5 a enfin traité la dernière surface, celle des **rappels espacés**, où l'élève ne voit aucun document : l'application y exigeait pourtant une valeur chiffrée, et surtout **refusait la progression d'un élève ayant obtenu 100** parce que la forme conjuguée correcte `زادت` n'était pas reconnue comme la preuve `تزداد` (#32). Deux requalifications plus simples ont été mesurées puis écartées : elles rejetaient `كلما`, la tournure même attendue au BAC, dans 47 cartes sur 48. **463 tests verts, 0 rouge**, `tsc` propre, build OK. L'instruction du dernier constat (#33) a par ailleurs mis au jour deux défauts silencieux du même sous-système : la **loi #4 ne s'exécutait sur aucune question d'hypothèse** — « ربما » y valait 100/100 alors que l'application enseigne explicitement à le proscrire (#37, Critique, corrigé) — et un trou dans la table verbe→loi : le verbe `استنتج`, le plus fréquent des questions guidées et employé 26 fois par le livre officiel, n'y figurait pas, et trois entrées multi-mots étaient masquées par une clé plus courte (#36). Le plafond restant est **B3** : la forme d'évaluation dominante — le QCM — demeure absente du BAC réel, et les 6 derniers documents exigent une production graphique chiffrée au Sprint 3.*
