# Analyse croisée de 5 chaînes YouTube SVT — BAC 3AS (Algérie)

> Complément d'instruction de l'audit **[AUDIT_APP_5_LECONS_PRIORITAIRES.md](./AUDIT_APP_5_LECONS_PRIORITAIRES.md)**.
> Relevés du **27/09/2026** (pages `playlists` et `playlist?list=…` de YouTube).
> Données brutes : `data/youtube_multichaines_catalog.json` · `data/youtube_ikram_catalog.json` · `data/youtube_ketfi_catalog.json`.

## 0. Pourquoi quatre chaînes de plus

L'audit initial reposait sur une seule chaîne (**@prof-ketfi.cherif-zina**, ~1 M d'abonnés). Une chaîne unique mélange
la demande réelle des élèves et le calendrier de publication d'un seul professeur. Trois chaînes indépendantes ont donc
été relevées :

| Chaîne | Profil | Corpus relevé |
|---|---|---|
| **@Profchaouch** (الأستاذ شاوش) | 18 playlists, mégavidéos 2 h–8 h | série « من الألف إلى الياء » (7 unités) + playlist immunité 2019 (31 vidéos, **4 060 849 vues**) |
| **@Prof_benotmane** (الأستاذ بن عثمان) | 13 playlists, capsules 8–30 min | U4 (15 vidéos, **798 098 vues**), U6 (5 vidéos, 116 615 vues) |
| **@ikramscience8424** | résumés 20–77 min, offre payante adossée | 20 vidéos, 831 min, **1 251 K vues** |
| *(référence)* **@prof-ketfi.cherif-zina** | حقيبة عكاشة 45 h 31 + أخطبوط | 6 + 11 vidéos, 849 K vues |
| **@MostafaBdd** (mostafa bdd — العلوم الطبيعية) | 8 playlists ; **cartes mentales + corrections d'exercices** | U2 (6 vid.), U3 (8), U4 (11), U6 (5) + banque de **121 exercices** (350 075 vues) |

---

## 1. Le jeu de données le plus propre : la série « من الألف إلى الياء » (Chaouch)

Une seule vidéo par unité, **même auteur, même format, même année** : les vues sont donc directement comparables,
à la seule réserve de l'ancienneté (une vidéo de 11 mois a eu plus de temps pour accumuler).

| Unité de l'app | Durée | Vues | Âge | **Vues / mois** |
|---|---|---|---|---|
| **U4 المناعة** | 8 h 26 | **1,30 M** | 8 mois | **162,5 K** |
| U1 تركيب البروتين | 3 h 18 | 1,20 M | 11 mois | 109,1 K |
| **U7 التنفس (تحويل الطاقة)** | 3 h 02 | 427 K | 4 mois | **106,8 K** |
| U5 الاتصال العصبي | 3 h 39 | 580 K | 6 mois | 96,7 K |
| U6 التركيب الضوئي | 3 h 09 | 319 K | 5 mois | 63,8 K |
| U2 بنية/وظيفة البروتين | 2 h 17 | 513 K | 10 mois | 51,3 K |
| U3 الأنزيمات | 1 h 49 | 371 K | 9 mois | 41,2 K |
| **Total** | **25 h 40** | **4,71 M** | — | — |

**Trois lectures :**

1. **U4 est n° 1 quel que soit l'angle** : le plus long (33 % du temps de la série) *et* le plus vu par mois
   (+ 49 % devant U1). Les quatre chaînes convergent — priorités 2 et 4 de l'audit confirmées.
2. **Correction importante sur le Domaine 2.** Les bilans précédents concluaient « U6 + U7 = moins de 7 % des vues
   alors qu'ils pèsent 39 % du BAC ». Corrigée de l'ancienneté, **U7 remonte au 3ᵉ rang (106,8 K/mois)**, devant U5,
   U2 et U3. Le déficit apparent d'audience du Domaine 2 est en grande partie un **effet de calendrier**
   (unités publiées en fin d'année scolaire), pas un désintérêt des élèves. U6 reste néanmoins le point bas du
   programme de biologie (63,8 K/mois) : la priorité 5 tient, mais **U7 doit sortir du statut de « terrain vide »**.
3. **Demande ≠ difficulté.** U2 et U3 sont les deux vidéos les plus courtes et les moins vues par mois, alors que ce
   sont les deux unités les plus citées comme difficiles (pHi, inhibiteurs). Les élèves n'y cherchent pas un cours
   complet mais une **réponse ciblée** : c'est exactement le format « micro-fiche + simulateur » des items 5 à 8 du
   backlog, et cela déconseille de produire un « cours de A à Z » pour ces deux unités.

---

## 2. À l'intérieur de l'immunité : quels chapitres sont réellement travaillés

### 2.1 Chaouch — playlist U4 (31 vidéos, 4,06 M vues)

| Chapitre | Parties | Vues cumulées |
|---|---|---|
| المناعة الخلطية | 5 visibles | **1 264 K** |
| المناعة الخلوية | 4 | 815 K |
| **تحفيز الخلايا اللمفاوية (التعاون الخلوي)** | 4 | **616 K** |
| فقدان المناعة المكتسبة (VIH/SIDA) | 3 | **414 K** |
| الذات واللاذات | 1 visible (ج6) | 328 K |
| مراجعة المناعة | 2 | 330 K |

### 2.2 Benotmane — U4 (15 vidéos, 798 K vues)

| Capsule | Durée | Vues |
|---|---|---|
| ج1 الذات واللاذات + بنية الغشاء | 27:30 | 280 K |
| **ج2 نظام CMH** | 12:04 | **153 K** |
| **ج4 نظام الريزوس Rh** | 8:38 | **119 K** |
| ج7 الخلطية : التعرف والانتقاء النسيلي | 16:55 | 140 K |
| ج10 الخلوية : التعرف والانتقاء | 29:08 | 141 K |
| **ج12 مخطط شامل لأدوار الخلايا المناعية** | 17:52 | **124 K** |
| ج8 + ج11 (les deux phases « التنفيذ ») | 25:51 | 145 K *(les deux réunies)* |
| ج13–ج15 فقدان المناعة المكتسبة | 1 h 12 | 280 K |
| مراجعة شاملة | 4 h 27 | 459 K |

**Ce que ces deux tableaux prouvent :**

- **La coopération cellulaire est un chapitre à part entière, pas une transition.** Chaouch lui consacre 4 parties
  (616 K) ; Benotmane en fait un **« مخطط شامل » des rôles** vu 124 K fois, soit **presque autant que les deux phases
  d'exécution réunies (145 K)** et davantage que chacune prise isolément (75 K et 70 K). ➜ la leçon
  `immunity_cooperation` livrée au sprint 2 est validée par trois chaînes indépendantes, et **le livrable attendu est
  un schéma global des rôles**, pas un texte linéaire.
- **CMH et Rh sont des capsules autonomes** (153 K et 119 K chez Benotmane, pour 12 et 9 minutes). ➜ le module
  prérequis 2AS du sprint 1 (`prerequis2AS_genetique`, ABO/Rh/HLA en 15 min) vise juste, et sa granularité
  (une notion = une capsule courte) est la bonne.
- **فقدان المناعة المكتسبة (VIH/SIDA) est systématiquement traité comme un chapitre complet** : 3 parties chez
  Chaouch (414 K), 3 capsules et 1 h 12 chez Benotmane (280 K), 1 vidéo chez Ikram. **C'est le manque le plus net
  découvert par ce complément d'enquête** (voir § 4).

---

## 3. Formats : ce que les autres chaînes font, et ce qu'aucune ne fait

| Modèle | Chaîne | Exemple | Enseignement pour l'app |
|---|---|---|---|
| Mégavidéo unique par unité | Chaouch | U4 en 8 h 26 (1,3 M) | il existe une demande de **révision globale en une session** → item 14 du backlog (« mode révision globale ») |
| Série de capsules 8–30 min | Benotmane | U4 en 15 capsules | granularité cible d'une leçon active de l'app |
| Micro-capsule | Benotmane | **« فكرة في دقيقة » (8 vidéos)** | valide le format **micro-fiche 1–2 min** des items 5 et 10 |
| Résumé dense 20–77 min | Ikram | moyenne 48 min | format « synthèse d'unité » de l'item 9 |
| Méthodologie comme produit distinct | Chaouch (6 + 8 + 23 vidéos), Benotmane (19 + 6) | منهجية الإجابة | conforte le guide méthodologie et les réflexes déjà en place |
| Banque d'idées d'exercices par session | Ikram (4 vidéos, 2019→2025, 214 K) | أفكار التمارين | **absent de l'app** (grep = 0) → item 12 |
| **Interactif avec validation de la réponse** | *aucune chaîne* | — | **c'est le positionnement différenciant de l'app** : simulateurs, ateliers de courbes, micro-remédiations déclenchées par l'erreur |

Aucune des quatre chaînes ne propose de simulation manipulable ni de correction automatique : les items 6
(électrophorèse), 8 (atelier 6 courbes) et 11 (chaîne photochimique) du backlog ne dupliquent donc rien
de l'offre existante.

**Géologie** : Chaouch maintient deux playlists de cours (11 + 16 vidéos) et une série d'exercices (5). Les unités
U9–U11 de l'app restent justifiées, aucune raison de les déprioriser.

---

## 4. Manques de l'application révélés ou confirmés

| # | Constat | Vérification dans le dépôt | Suite |
|---|---|---|---|
| A | **VIH/SIDA sans leçon** : 3 chaînes sur 4 en font un chapitre complet (≈ 700 K vues cumulées) | 19 QCM dans `quizCorpus.ts`, **0 leçon active, 0 résumé, 0 gold summary, 0 micro-remédiation** | **nouvel item prioritaire n° 3 bis** (voir audit) |
| B | Coopération cellulaire = chapitre autonome, format « schéma des rôles » | livré sprint 2 (`immunity_cooperation`, carte mentale 15 nœuds) | ✅ confirmé, ajouter l'export « mخطط شامل » imprimable |
| C | CMH / Rh / ABO en capsules courtes séparées | livré sprint 1 (`prerequis2AS_genetique`, QCM 509-516) | ✅ confirmé |
| D | U7 (تحويل الطاقة) sous-estimé par l'analyse initiale | 3 leçons actives, aucune synthèse d'unité | remonter U7 au même rang que U6 dans l'item 9 |
| E | pHi : **aucune des 4 chaînes** n'a de vidéo dédiée, alors que c'est la 2ᵉ notion la plus difficile | 0 occurrence dans l'app | l'app peut être **la seule ressource** sur le sujet → items 5 et 6 inchangés, valeur relevée |
| F | Banque « أفكار التمارين » indexée par session BAC | grep 2019→2024 = 0 fichier | item 12 confirmé |
| G | Format micro-capsule 1 min | micro-remédiations 2–4 min existantes | item 15 : aligner sur 1–2 min |

---

## 5. Hiérarchie révisée des 5 priorités

| Rang | Priorité | Mouvement | Justification multi-chaînes |
|---|---|---|---|
| 1 | **Coopération immunitaire (U4)** | = | 616 K (Chaouch) + 124 K sur le seul schéma (Benotmane) ; U4 n° 1 par mois |
| 1 bis | **VIH/SIDA (U4)** | **nouveau** | ≈ 700 K vues cumulées, chapitre systématique, zéro leçon dans l'app |
| 2 | **CMH / ABO-Rh + prérequis 2AS (U4)** | = | capsules dédiées chez Benotmane (153 K / 119 K) |
| 3 | **pHi / acides aminés (U2)** | ↑ *valeur* | difficulté n° 2, **aucune offre vidéo concurrente** |
| 4 | **Inhibiteurs enzymatiques (U3)** | = | U3 = demande la plus faible mais difficulté élevée → micro-fiches, pas un cours |
| 5 | **Phase photochimique (U6) — et désormais U7** | élargi | U6 63,8 K/mois (point bas), U7 106,8 K/mois (3ᵉ rang, révélé par la correction d'ancienneté) |

---

---

## 6. Cinquième chaîne — @MostafaBdd : le format compte autant que le contenu

Les quatre premières chaînes sont organisées autour du **cours**. Celle-ci est organisée autour de la **carte mentale
et de l'exercice corrigé**, et c'est ce qui la rend précieuse pour l'audit : elle mesure la demande sur les *formats*
que l'application peut produire, pas sur le cours magistral qu'elle ne produira jamais.

### 7.1 Dans chaque unité, la carte mentale écrase le cours

| Unité | Cours complet | **Carte mentale** | Rapport | Corrections d'exercices |
|---|---|---|---|---|
| U2 بنية/وظيفة | 3 h 05 — **87 K** | 20:50 — **568 K** | **× 6,5** | 5 h 27 + 3 h 27 — **393 K** |
| U3 الأنزيمات | 3 h 29 — **73 K** | 31:32 — **565 K** | **× 7,7** | 6 h 09 — **218 K** |
| U4 المناعة | 6 h 47 — **368 K** | 47:35 — **710 K** | **× 1,9** | 4 h 06 + 5 h 30 — **525 K** |

La carte mentale de l'immunité (710 K) est la vidéo la plus vue de la chaîne, et celles de U2 et U3 — deux unités
pourtant « peu demandées » selon la mesure par unité du § 1 — dépassent les 565 K chacune. **Ce n'est pas l'unité qui
crée la demande, c'est le format** : à contenu égal, une synthèse visuelle de 20-30 minutes est consommée 6 à 8 fois
plus qu'un cours de 3 heures.

### 7.2 Les micro-capsules « كيف … ؟ » et la correction du § 4-E

| Capsule | Durée | Vues | Ce qu'elle vise |
|---|---|---|---|
| **كيف نكتب صيغة الحمض الأميني بطريقة صحيحة ؟** | 12:30 | **151 K** | écrire la forme développée du AA |
| كيف نفرق بين المناعة الخلطية و الخلوية ؟ | **2:11** | 77 K | le critère décisif, en 2 minutes |
| كيف أحفظ حلقة كالفن ؟ | 4:12 | — | mémoriser un cycle |
| أهم خطوة بعد الانتهاء من حل التمارين | 1:00 | 15 K | méthode de travail |

**Correction d'un constat antérieur.** Le § 4-E affirmait qu'« aucune chaîne n'a de vidéo dédiée au comportement des
acides aminés ». C'était vrai des quatre premières, ce ne l'est plus : **151 K vues sur une capsule de 12 minutes
consacrée à l'écriture de la formule du AA**, soit la 2ᵉ vidéo la plus vue de sa playlist U2 après la carte mentale —
davantage que le cours complet de l'unité (87 K). La demande sur cette notion est donc **démontrée**, pas seulement
déduite de sa difficulté. Le sprint 3 (`amino_acid_behavior`) est validé ; il lui manque en revanche le geste précis
que traite cette capsule : **écrire la forme ionisée aux trois pH**, et non seulement en déduire la charge.

### 7.3 Une banque d'exercices indexée par situation, pas par chapitre

La playlist « التمارين + المناقشة و الحل » compte **121 vidéos / 350 075 vues**, ouverte par une **méthodologie de
résolution** (15:30, **145 K**). Chaque exercice y est nommé **par sa situation** — « المضاد الحيوي » (134 K),
« مرض البروجيريا » (102 K), « سرطان الثدي » (69 K), « أشعة الشمس », « المورثة و سلوك AA » — et parfois par sa session
(« بكالوريا 2022 : كيف نحسب الوزن الجزيئي », 48 K). C'est exactement l'entrée que cherche un élève : *un contexte*,
pas un numéro de chapitre. L'application indexe ses exercices par unité et par concept, **jamais par situation**.

### 7.4 Deux formats que personne d'autre ne produit

- **« جميع الرسومات التخطيطية و التفسيرية التي يجب حفظها » (58:58, 76 K)** — la liste fermée des schémas à savoir
  reproduire le jour du BAC. L'application possède les schémas mais n'a **aucun mode « reproduire le schéma de
  mémoire »**.
- **« ماذا سندرس في المناعة ؟ » (15:44, 79 K)** — une vidéo d'orientation en ouverture d'unité : ce qu'on va
  apprendre, dans quel ordre, ce qui tombe au BAC. L'application ouvre ses unités directement sur la première leçon.

### 7.5 Ce que cette chaîne change dans la hiérarchie

Elle ne déplace aucune des 5 priorités de contenu — elle **hiérarchise les supports** à produire pour chacune :
carte mentale d'abord, exercices corrigés et indexés par situation ensuite, micro-capsule « comment faire » enfin.
Or l'application ne compte aujourd'hui que **3 cartes mentales** (U1 : 15 nœuds, U2 : **8 nœuds**, U4 : 15 nœuds)
pour 11 unités.

---

## 7. Limites méthodologiques

- Les vues sont arrondies par YouTube (« 1.2M » = 1 150 000 – 1 249 999) ; les écarts inférieurs à 10 % ne sont pas
  significatifs.
- 9 vidéos sont masquées dans la playlist U4 de Chaouch, 7 dans sa série A→Z, et la partie 3 (probablement ABO)
  manque chez Benotmane : les totaux par chapitre sont donc des **minorants**.
- « Vues / mois » suppose une accumulation linéaire, ce qui sous-estime les vidéos anciennes (pic initial) et
  surestime légèrement les plus récentes.
- Les vues mesurent la **demande**, jamais la compréhension. La hiérarchie de difficulté reste celle établie dans
  `BILAN_LECONS_DIFFICILES.md` ; ce document sert à l'arbitrer, pas à la remplacer.
- Pour @MostafaBdd, la page de la playlist U6 n'expose pas les vues par vidéo : seul le total (121 083) est
  disponible. Les rapports « carte mentale / cours » y sont donc absents.
- Les cartes mentales de cette chaîne sont plus anciennes (4 ans) que ses cours (2 ans) : une part de leur avance
  vient de l'ancienneté. Elle n'explique pas un rapport de × 6 à × 8.

