# Audit du correcteur (correcteurV1 + barème + calibration + scoreur ICM) et de la méthode مفتاح المنهجية

**Date :** 2026-09-19 · **Commit :** `724e137`
**Méthode :** lecture intégrale des 6 couches du correcteur et des 4 fichiers Meftah + **probes adversariales exécutées** (les notes citées ci-dessous sont des sorties réelles du code, pas des hypothèses). Toutes les suites passent : 127 tests correcteur/dictionnaires, 130 tests Meftah/scorer/utils, 138 invariants harnais.

---

## 1. Ce que j'ai audité

| Couche | Fichier | Verdict express |
|---|---|---|
| Banque mots-clés | `src/correcteurV1.ts` (429 l.) | Traçable L1–L6 (testé), matching par sous-chaîne |
| Barème auto | `src/data/dictionaries/baremeCorrecteur.ts` | 1 entité reconnue = item crédité en entier |
| Note /20 calibrée | `src/data/dictionaries/calibrationBac2025.ts` | **Code mort dans le produit** — et scientifiquement creux |
| Dictionnaire 617 entités | `dictionnaire_final.json` + `dictionnaireCorrecteur.ts` | Bon travail de build, couche feedback |
| Sanctions | `sanctionsCorrecteur.ts` | 6 règles regex — correctes mais microscopiques |
| Scoreur méthodo (ICM) | `src/utils/methodologyScorer.ts` | Heuristique regex/longueurs — **trivialment gameable** |
| Meftah données | `meftahManhajia.ts` (577 l.), `meftahLaw.ts`, `miftahSpec.ts` | Contenu excellent, **2 bugs de données factuels** |
| Meftah UI | `MeftahView.tsx` (542 l.) + `check-miftah.ts` | Câblage OK ; garde-fou = police de marque |

---

## 2. Verdict

**La méthode Meftah est le meilleur produit du repo. Le correcteur est son contradicteur interne.**

Meftah enseigne : « معلومة واحدة محكمة خير من حشو خارج الهدف » — une info solide vaut mieux que du bourrage. Le correcteur, lui, **paie le bourrage** : mes probes donnent 8/8 à une salade de mots-clés sans syntaxe, 8/8 à une réponse hors-sujet, 8/8 à une réponse entièrement fausse bien orthographiée. Et le scoreur ICM de la boucle méthodologie donne **100 % « prêt pour la phase 4 » à une analyse affirmant que le glucose vit sur Mars et porte un manteau rouge** — dès lors qu'elle contient les mots rituels.

Le correcteur est présenté comme « تجريبي / aide au corrigé » — cette honnêteté d'affichage est la seule chose qui le sauve. Mais deux éléments exigent une action immédiate : (1) la couche de notation /20 calibrée sur 80 copies existe, testée, documentée — **et n'est branchée nulle part** ; (2) le panneau affiche un « التنقيط على المقياس الرسمي » dont votre propre analyse interne a établi qu'il ne corrèle **pas du tout** (r = 0) avec les notes humaines.

---

## 3. Le correcteur — constats chiffrés

### C1 🔴 La note calibrée sature à 3–14 mots-clés (et c'est du code mort)

La chaîne `noterCopieCalibree` (couverture sur la banque de **l'unité entière** → fit linéaire → clamp) donne, calculé sur les constantes réelles :

| Groupe | Banque | Saturation | 1 seul mot-clé rapporte |
|---|---|---|---|
| S1-Ex1 (/5) | 49 mc | **14 mc = 5/5** | 0,00 pt |
| S1-Ex2 (/7) | 47 mc | **4 mc = 7/7** | 3,10 pts |
| S1-Ex3 (/8) | 50 mc | **3 mc = 8/8** | **5,18 pts** |
| S2-Ex1 (/5) | 42 mc | 9 mc = 5/5 | 0,00 pt |
| S2-Ex2 (/7) | 33 mc | 3 mc = 7/7 | 1,27 pt |
| S2-Ex3 (/8) | 65 mc | 4 mc = 8/8 | 1,67 pt |

La fonction est un escalier : 0 si zéro mot-clé, quasi-max à partir de 3–14 tokens épars. La pente a=197 (S2-Ex3) ne « calibre » plus rien, elle encode un saut. Les interceptes positifs (b=+3,16 sur S1-Ex3) paient plus que la couverture : ma paraphrase correcte de 42 mots n'ayant matché qu'UN mot-clé a reçu **5,18/8**, dont ~3 points d'intercepte.

**Et cette machine n'est importée par aucun composant** (grep sur `src/` hors tests : zéro appel). Toute la saga R1–R4 (80 copies, fits, tests d'ancres pleine précision) a produit un artefact non branché. Tant mieux — mais tant pis pour le travail perdu, et dangereux : quelqu'un finira par la câbler telle quelle.

### C2 🔴 Probes adversariales : 4/4 attaques réussissent (sorties réelles)

Contre `noterExerciceCalibre` (S1-Ex3, /8) :

1. **Salade** : 6 mots-clés U5 sans grammaire, sans rapport avec la question → **8/8**
2. **Hors-sujet** : réponse 100 % sur le réflexe myotatique (la question porte sur les drogues au synapse) → **8/8** — la banque est celle de l'unité, **la question n'est jamais une entrée du moteur** (`evaluerReponseKeywords(reponse, uniteId)` — pas d'attendus dans le chemin calibré)
3. **Négations** : « لا يوجد أستيل كولين… لا يتحرر… مستحيل… غير موجود » (tout est faux) → **8/8**
4. **Perroquet** : la question recopiée telle quelle → **8/8**

Seul cas correctement traité : copie vide ou gribouillis → 0. Le moteur est un **détecteur de déversement lexical**, pas un correcteur.

### C3 🔴 Le seul correcteur affiché aux élèves est celui qui prédit r = 0

`CorrecteurPanel` n'utilise ni la calibration ni les attendus : il affiche entités + sanctions + `evaluerBareme`. Or votre en-tête de calibration l'établit noir sur blanc : « le BARÈME AUTOMATIQUE … = prédicteur nul **r=0** contre la vérité terrain ». Et le panneau l'intitule **« التنقيط على المقياس الرسمي »** avec des pastilles vertes ✓ par item. Pour un enseignant pressé, c'est une note. La règle de crédit est en outre maximale : **une seule entité de la signature = item crédité en entier** (ex. un item officiel exigera 3 mécanismes, un seul mot suffit à le payer).

### C4 🟠 La calibration repose sur un corpus non reproductible

`docs/copies-bac2025/` est gitignoré (juste pour la donnée élèves) — mais conséquence : **personne ne peut re-dériver les constantes** `a`/`b`. Et le commentaire R4 admet : « le fit actuel **dépend du générateur du corpus** … 11 faux positifs N°5–13 ». Le r=0,86 affiché n'est donc pas une validation, c'est un autofit sur un corpus dont la générosité est elle-même encodée (le code le dit : les b>0 « encodent la générosité du correcteur humain du corpus »). Le groupe S2-Ex3 a été re-fité à r_kw = **0,45** — corrélé à peine mieux qu'un dé.

### C5 🟠 Sous-chaînes : faux positifs démontrés

Matching `norm.includes(nMot)` sans frontière de mot : `CO2` crédite l'attendu `O2` (vérifié en sortie : trouvés = ['CO2', 'O2']), `PSII` crédite `PSI`, « Albumine » crédite `LB`. Inversement, une excellente paraphrase sans les formes exactes est sous-payée (C1).

### C6 🟡 Sanctions : 6 règles

Les sanctions sont scientifiquement justes (Michaelis≠cloche, HbA≠GR avec pré-condition contexte cellulaire, 38 ATP avec pré-condition énergétique, 3 double-sens) — leur construction est soignée. Mais 6 règles pour 11 unités = un Pare-feu en papier déchiré. Le pool de confusions réelles en SVT bac (mitose/méiose, ADN/ARN, antigène/anticorps, mitose/reproduction, réflexe/instinct…) n'est pas couvert.

### C7 🟠 Scoreur ICM : gameable à 100 %, fallback silencieux, critères codés en dur

Sorties réelles du harnais :

- **Analyse absurde formatée** (« نستنتج أن الغلوكوز يسكن على المريخ ») → **ICM = 100 %**, décision « إتقان ممتاز — جاهز للمرحلة 4 ».
- Analyse sobre correcte sans la formule rituelle → 75 % ; hypothèse correcte concise → **50 %** (portes de longueur 60+ caractères) : **le scoreur punit la concision que Meftah enseigne**, et retient en phase 2 l'élève concis pendant que le baratineur passe.
- `evaluateStudentProduction('verb_inexistant_xyz', …)` → **ICM 100 %, aucune erreur** (`getVerbCardV2 ?? VERB_CARDS_V2[0]`) : tout typo de verbId note contre la mauvaise carte en silence.
- Critères d'exercice codés en dur dans un moteur générique : `ped_c1` exige « أبوان سليمان » (UNE famille d'un exercice d'arbre généalogique), `calc_c1` exige « chargaff ». Réutilisé sur toute autre copie, l'élève échoue mécaniquement.
- Critère par défaut : `passed = text.length > 40` — écrire 40 caractères passe un critère inconnu.

### C8 🟠 Ce que les tests verrouillent — et ne verrouillent pas

127 tests correcteur : traçabilité des mots-clés, monotonicité, clamp, ancres de régression **des pentes C1** (les tests épinglent a=197,342342 en « pleine précision »), anti-fuite du barème hors note. Aucun test ne verrouille une propriété pédagogique : qu'un hors-sujet intra-unité ne prenne pas le max, qu'une négation ne crédite pas, que la salade plafonne. **Les tests protègent la mécanique contre la régression, pas l'élève contre la triche.**

---

## 4. Meftah — constats

### M1 ✅ Le fond est excellent (et je le dis sans complaisance)

- Les 4 dents (تَبَصَّر/أدخل/أدر/افتح), la séparation analysis/interpretation avec interdits sourcés (`meftahLaw` : chaque token porte rationale + source + `legitimateInAr` — le dé-généraliseur est prévu), les DEUX patrons d'analyse (covariation كلما **et** comparaison بينما — correction d'une vraie incohérence des rapports), le refus du « ربما » en hypothèse, la règle de causalité des expériences, le think/write/trap par question : c'est aligné avec la doctrine officielle algérienne et c'est de la bonne ingénierie pédagogique.
- Les réponses modèles BAC 2025 sont **scientifiquement exactes** au niveau exigé (RIP = clivage liaison adénine–ribose : correct ; ARNr grande sous-unité à deux sites catalytiques : correct ; mécanisme pyrénoïde/CA/Rubisco conforme aux عناصر الإجابة ; structure du texte scientifique conforme).
- La cohérence de marque est industrialisée (constant unique, garde-fou qui échoue si un littéral réapparaît).

### M2 ✅ RÉSOLU le 2026-09-19 — le corrigé officiel a tranché : le dictionnaire avait raison

**Source :** الإجابة النموذجية الرسمية، bac2025 SVT علوم تجريبية — `correction-bac-sci-sciences-2025.pdf` (eddirasa, 12 p.), lue et croisée le 2026-09-19.

| | Meftah (AVANT) | `dictionnaire_final.json` | Corrigé officiel |
|---|---|---|---|
| bac2025 S1 · Ex1 · Q1 | **0,5 pt** ❌ | **1,25 pt** (5 items × 0,25) | **0,25 × 5 = 1,25 pt** ✅ |
| bac2025 S1 · Ex1 · Q2 | **4,5 pts** ❌ | **3,75 pts** (ARNm/t/r 0,5×3 + RIP 1,25 + intro 0,5 + concl 0,5 + annonce 0) | **3,75 pts** — item par item identique (RIP 1,25 explicite ; l'annonce d'ouverture n'est pas pointée) ✅ |

**Verdict :** le build du dictionnaire est la transcription EXACTE du corrigé officiel. Les `pointsLabel` de Meftah étaient faux.

**Découvert par la correction :** l'Ex2 de Meftah sommait **7,5 ≠ 7** (incohérence interne passée inaperçue). Corrigé sur la ventilation officielle : Q1 = 1,5 · Q2 = 2,5 (explicite) · Q3 = 2,5 (contrainte de somme) · تبرير = 0,5.

**Corrections appliquées** (`meftahManhajia.ts`, commentées avec la source) : ex1-q1 → `1.25 ن`, ex1-q2 → `3.75 ن`, ex2-q1 → `1.5 ن`, ex2-q2 → `2.5 ن`, ex2-q3 → `2.5 ن`. Ex3 (2,5/4,5/0,5/0,5 = 8) : non contredit par le corrigé ; ventilation fine confirmable sur le scan (OCR bruité).

**Verrous ajoutés** (`hikalaBac.test.ts`) : somme des questions de chaque exercice = son barème (5/7/8) ; parité programmatique Meftah ↔ `ATTENDUS_BAREME` (1,25/3,75) ; le « فخ RIP = 1,25 نقطة » reste cohérent. **692/692 tests verts.**

### M2 (analyse d'origine, conservée pour la traçabilité)

Même sujet, même prétention « barème officiel BAC 2025 » :

| | `meftahManhajia.ts` | `dictionnaire_final.json` (barème du correcteur) |
|---|---|---|
| bac2025 S1 · Ex1 · Q1 | **0,5 pt** | **1,25 pt** (5 items × 0,25) |
| bac2025 S1 · Ex1 · Q2 | **4,5 pts** | **3,75 pts** (ARNm/t/r 0,5×3 + RIP 1,25 + intro 0,5 + concl 0,5 + annonce 0) |

Somme = 5 pts des deux côtés, mais la ventilation contredit le contenu : le barème du build liste **5 items distingués** pour Q1 (les mêmes que la réponse modèle de Meftah, soit dit en passant — le contenu matche parfaitement), ce qui est incompatible avec 0,5 pt ; et le propre texte « فخ » de Meftah (« نص جميل عن ARN دون RIP = ضياع **1.25** نقطة ») confirme le RIP à 1,25 du build, donc la ventilation de Meftah (4,5) ne tient plus. **Verdict : le pointsLabel de Meftah est très probablement faux.** À arbitrer sur l'إجابة نموذجية officielle (disponible sur les portails habituels : [1](https://eddirasa.com/correction-bac-science-2025-se/), [2](https://morajati.blogspot.com/2025/09/bac-science-nature-2025-exam-solutions.html)) puis à corriger, avec un test d'intégrité qui empêche la récidive.

### M3 🟡 Drift de version

`miftahSpec.ts` : `MIFTAH_VERSION = '3.3'` (affiché par la fiche/carte, verrouillé par check-miftah) ; `meftahManhajia.ts` et `MeftahView.tsx` s'annoncent **« V4.3 »** en en-tête. Deux schémas de version parallèles pour le même objet = la prochaine session de dev affichera l'un pour l'autre.

### M4 🟠 check-miftah est une police de marque, pas un garde-fou pédagogique

Le script vérifie ~120 chaînes : noms interdits, footers, `font-size:10.4px`, `page-break-before`. Zéro assertion sur : la somme des points (5/7/8), l'existence des `linkedVerbId` dans `reflexes.ts` (ça tombe bien, ils existent tous — mais rien ne l'empêcherait de casser), l'alignement des réponses modèles avec le barème du dictionnaire. La marque est blindée ; la vérité pédagogique n'a aucun garde-fou.

### M5 🟠 L'incohérence produit centrale

Meftah + `meftahLaw` + ValidationEngine forment un système qui **sait** détecter le bourrage, le perroquet, l'interprétation prématurée, les phrases sans valeur. Le correcteur de copies ignore tout de ce système : les détecteurs existent (`detectDisplacedCausal`, `detectHedging`, sanctions, `bareNumbers`) et **aucun ne feed-back dans la note d'une copie**. Deux sous-produits qui se contredisent sous le même toit.

---

## 5. Plan d'action (priorisé, sans reconstruction lourde)

| # | Action | Effort | Effet |
|---|---|---|---|
| 1 | **Arbitrer M2** sur l'إجابة نموذجية officielle, corriger le `pointsLabel`, ajouter un test : les points Meftah somment à 5/7/8 et coïncident avec les items du dictionnaire | ½ j | Vérité unique |
| 2 | **Renommer l'affichage du barème auto** : « التنقيط » → « قرضة تقديرية (تجريبية) » + seuil visible ; régler le crédit « 1 entité = item entier » à « proportionnel aux entités de la signature » | 1 j | Fin de la sur-promesse à l'élève/prof |
| 3 | **Décider du sort de `calibrationBac2025.ts`** : soit la brancher derrière un flag « expérimental » avec les limites C1 affichées, soit la geler (export mort documenté). Dans les deux cas : recalibrer sur copies humaines réelles (R4 déjà écrit) et publier les métriques PAR GROUPE (le 0,45 de S2-Ex3), pas seulement le global | 2–3 j | Honnêteté scientifique |
| 4 | **Contre-probes en tests** : salade/hors-sujet/négation/perroquet doivent plafonner. Implémentation minimale : (a) attendus de question obligatoires pour noter (la question devient une entrée), (b) pénalité sanctions sur les items crédités, (c) détection de non-prose (aucun verbe/pas de relation → plafond diagnostic) | 3–5 j | Le correcteur devient défendable |
| 5 | **Scoreur ICM** : lever le fallback silencieux (`throw` sur verbId inconnu), remplacer les longueurs (25/50/60) par des critères sémantiques du dictionnaire, externaliser `ped_c1`/`calc_c1` dans des cartes d'exercice | 2 j | Fin du 100 % Mars |
| 6 | Étendre les sanctions 6 → ~30 confusions couvrant les 3 domaines (source : corrigés + rapports de correction officiels) | continu, chiffrable | Valeur pédagogique réelle |
| 7 | Unifier la version Meftah (une constante, un schéma) + étendre check-miftah aux assertions pédagogiques (sommes, ids, parité barème) | ½ j | Garde-fou utile |

## 6. Ce que cet audit ne tranche pas

- La ventilation officielle exacte 0,5/4,5 vs 1,25/3,75 (M2) — exige le PDF ministériel.
- La validité des coefficients hors bac2025 : la calibration ne couvre que les 6 groupes du sujet 2025 ; extrapoler aux autres sujets est indéfendable en l'état.
- Le comportement réel des 80 copies non disponibles ici (gitignore) : je n'ai pas pu rejouer `scripts/evaluer-copies.ts`, tous les chiffres C1/C2 viennent des constantes et du code, pas des copies.

---

## 7. Pierre 1 posée — le blindage anti-jeu (2026-09-19, même journée)

Mise en œuvre de l'action §5.4 (partiellement) et §5.5 (fallback). Suite : **680/680 vitest (+17), 138/138 harnais, check:v2 OK.**

### Ce qui a été écrit

| Fichier | Contenu |
|---|---|
| `src/data/dictionaries/integriteCopie.ts` (nouveau) | Signaux de surface (prose, négations d'assertion, écho lexical avec l'énoncé) → **plafonds, jamais des points** (non_prose 30 %, negation 50 %, echo_question 25 %) |
| `src/data/dictionaries/integriteCopie.test.ts` (nouveau) | Les contre-probes : pièges plafonnent, **contrôles positifs = réponses modèles de Meftah** (aucun plafond, écho < 12 %), porte attendus prouvée, verrou d'honnêteté PIÈGE 4bis |
| `calibrationBac2025.ts` | `noterExerciceCalibre(…, {question?, attendus?})` — la question entre dans le moteur (perroquet) et les attendus peuvent gouverner la couverture (hors-sujet). Champs `plafonds`/`signaux` exposés (transparence) |
| `calibrationBac2025.test.ts` | Invariant R2 **étendu en R2+R5** (barème jamais dans la note — inchangé ; plafonds intégrité — nouveau). Le test « immunité 8/8 » devient « immunité plafonnée ≤ 2,4 » |
| `methodologyScorer.ts` | **Fin du fallback silencieux** : verbId inconnu → `throw` (C7 ; « hypothesize » ne note plus contre la carte analyse) |

### Mesures avant/après (sorties réelles, S1-Ex3 /8)

| Attaque | Avant | Après | Plafond déclenché |
|---|---|---|---|
| Salade 6 mots-clés sans syntaxe | 8/8 | **2,4/8** | non_prose |
| Hors-sujet (réflexe ≠ question) | 8/8 | **2,4/8** | non_prose * |
| Négations (tout est faux) | 8/8 | **2,4/8** | non_prose + negation |
| Perroquet (énoncé recopié) | 8/8 | **0/8** | echo_question |
| **Contrôle** Meftah Ex1 | 3,87/5 | 3,87/5 | aucun |
| **Contrôle** Meftah Ex2 | 7/7 | 7/7 | aucun |
| **Contrôle** Meftah Ex3 | 5,18/8 | 5,18/8 | aucun |

\* **Honnêteté sur le hors-sujet** : il est ici plafonné par le signal prose (texte à clause unique sans connecteur de relation — allié accidentel), pas par compréhension de la question. La détection intrinsèque = la porte `attendus` (câblée : PIÈGE 4 → 0/8 quand les attendus sont fournis) ; la rédaction des attendus par question reste un projet éditorial (PIÈGE 4bis verrouille la dette).

### Limites assumées de la Pierre 1

1. Le blindage est **superficiel** (surface) : un élève soigné peut écrire une fausse prose relationalle. C'est un filet, pas une compréhension.
2. Les négations d'assertion sont une liste explicite (12 marqueurs, densité ≥ 3) — volontairement conservatrice pour ne pas punir la causalité légitime (« فلا تفرز » des corrigés officiels).
3. L'ICM absurde 100 % (C7, analyse « Mars ») n'est **pas** traité par cette pierre — le scoreur méthodo reste à durcir sémantiquement (prochaine pierre).
4. Ex3 modèle à 5,18/8 avec 2 % de couverture : c'est le problème des interceptes (C1 de l'audit) — inchangé, c'est la calibration elle-même qu'il faut refiter sur de vraies copies (R4).

## 7. Pierre 2 ✅ RÉSOLU le 2026-09-19 — les attendus sont OBLIGATOIRES (R6)

*Exécution des actions 2, 3 et 4 du plan. Le moteur de notation ne lit plus jamais
la banque d'unité comme dénominateur : la note vient du registre des attendus
officiels (`src/data/dictionaries/attendusBac2025.ts`), sources tracées.*

### Ce qui a été construit

1. **Registre des attendus (6 groupes)** : SujetId × ExerciceId → {énoncé, maxPts (5/7/8), items}.
   - Ex1 (les deux sujets) : pont **programmatique** sur `ATTENDUS_BAREME` (le build prouvé fidèle) — parité testée key-par-key ; les formes de reconnaissance = entités du dictionnaire + sigles scientifiques du texte officiel de l'item (ARNm, RIP, ATP, 2-DG…).
   - S1-Ex2, S1-Ex3, S2-Ex2, S2-Ex3 : encodés **item par item depuis le corrigé ministériel** (`correction-bac-sci-sciences-2025.pdf`, lu intégralement), source marquée `corrige-officiel-2025`, ventilation officielle respectée (S2-Ex2 : 0,5×13 dont تبرير 1,0 ; S2-Ex3 : ventilation complète incluant chromatographie 326/221/529 et الفقرة العلمية 1,0).
   - Invariants testés : Σ items = maxPts **exactement** sur les 6 groupes (le test a attrapé 5 items morts — formes non verbatim — corrigés) ; aucun item à points sans formes sauf `source: build` (→ remonté au prof) ; Σ auto ≥ 70 % du barème partout (S1-Ex1 5/5, S2-Ex1 4,75/5).
2. **Moteur R6** (`calibrationBac2025.ts`) : `noterExerciceCalibre(réponse, sujet, ex)` =
   couverture = Σ auto crédité / Σ auto (formes OR, sous-chaîne normalisée) →
   note = couverture × maxPts → **puis** plafonds d'intégrité (Pierre 1) ; couverture 0 → 0.
   Items sans formes : exclus du dénominateur, affichés « بند يدوي », remontés au correcteur humain.
   `noterDepuisCouverture` (fit 80 copies) : déprécié, gelé, verrouillé par ancres — LEGACY hors production.
3. **Câblage produit** (`CorrecteurPanel`) : sélecteur « المقتضيات الرسمية (2025) » (6 groupes) →
   section **« التنقيط الإلزامي »** (couverture %, points/max, plafonds déclenchés avec % et raison,
   items manuels signalés) ; l'ancienne section renommée honnêtement
   « تقرير بنود المقياس (تشخيصي — ليس تنقيطاً) ».
4. **Tests** : `attendusBac2025.test.ts` (registre : sommes, parité build, formes, sources) +
   `calibrationBac2025.test.ts` (R6 : exhaustif→max, hors-sujet→0 sans paramètre, banque U4→≤2/8,
   Meftah ≥ 85 % couverture / ≥ 90 % du max / zéro plafond, mapping unités, ancres LEGACY) +
   `integriteCopie.test.ts` réécrit (les pièges mesurés au réel) + `CorrecteurPanel.test.tsx` (UI).

### Mesures avant/après (sorties réelles, S1-Ex3 /8)

| Attaque | Avant Pierres 1+2 | Après Pierres 1+2 | Mécanisme |
|---|---|---|---|
| Salade de mots-clés | 8/8 | **1/8** | registre (cov 13 %) + non_prose |
| Hors-sujet (réflexe sur question drogues) | 8/8 | **0/8** | registre — intrinsèque, zéro paramètre |
| Négations (tout est faux) | 8/8 | **1/8** | registre (cov < 25 %) + negation 50 % |
| Perroquet (énoncé recopié) | 8/8 | **0,5/8** | registre (cov 6 %) + echo 25 % |
| Banque U4 déversée sur transfusion | 8/8 | **0,5/8** | fin du « détecteur de déversement » |

| Contrôle (légitime) | Avant | Après |
|---|---|---|
| Meftah Ex1 | 3,87/5 | **5/5** |
| Meftah Ex2 | 7/7 | **6,5/7** (93 % de couverture — l'item manqué est verbatim-corrigé) |
| Meftah Ex3 | 5,18/8 | **7,5/8** |
| Copie modèle complète | 16,05/20 | **19/20** |
| Copie vide | 0/20 | 0/20 |

### Limites assumées (Pierre 2)

1. **Un item = une forme = ses points entiers** (granularité C3/P5 non traitée) : nommer « ARNm, ARNr, ARNt » sur S1-Ex1 crédite les items nominaux sans les rôles. Les plafonds d'intégrité et l'écran prof compensent ; le crédit proportionnel reste à faire.
2. **Items manuels** (intro/conclusion/annonces/اقتراح) : hors note automatique, affichés au prof. La pré-note peut donc être légèrement sous le barème humain final — c'est voulu et affiché.
3. **RIP 1,25** (S1-Ex1) créditée sur la seule forme « RIP » : le corrigé exige réaction+enzymes+produits ; granularité P5.
4. La couverture Meftah Ex2 = 93 % : l'item manqué est un écart de formulation (forme trop stricte), pas une erreur de barème — acceptable, documenté.
5. Le corrigé S2-Ex2 p.2 a été lu sur scan OCR dégradé (chunk 2) ; la ventilation S2-Ex2 provient du chunk 3 (lisible). Le point شاهد (0,5) est reconstitué du protocole de la question — plausible et cohérent (Σ=7), à confirmer sur le PDF natif si disponible.
6. **Pas encore branché sur la notation élève de bout en bout** (le chemin élève → note finale avec الرقم السري et saisie prof reste l'étape d'après).

### Vérification

- `npx vitest run` : **703/703** (52 fichiers) · boussole `npx tsx tests/boussole.test.ts` : **138/138** · `npx vite build` : OK (8,8 s).
- Le hors-sujet intrinsèque ferme l'action 4 (a) ; la penalité sanctions sur items (4b) est couverte par la couverture registre (les salades ne touchent quasi aucun attendu) ; la détection non-prose était la Pierre 1.

### Pierre 2b — RÉSOLUTION DES 5 LIMITES (même journée, 2026-09-19)

| Limite (§7) | Résolution | Preuve |
|---|---|---|
| 1. Un mot = un item entier (P5) | Mécanisme **`composantes`** : groupes (OU dans un groupe, ET entre groupes), crédit = points × détectés/exigés. Décomposition des items à rôles du S1-Ex1 (Q1 ×5 : contexte hors/pendant synthèse + ARN ; Q2 : ARNm/ARNt/ARNr + rôle, RIP + mécanisme adénine/ribose) | « ARNm ARNr ARNt » : item Q1 = **0,13/0,25** (avant : 0,25) ; « RIP » seul = **0,63/1,25** (avant : 1,25) ; RIP + تكسر الرابطة بين الأدنين = 1,25/1,25. Contrôles intacts : Meftah Ex1 **5/5**, Ex2 **7/7** (↑ de 6,5), Ex3 7,5/8 |
| 2. Items manuels hors pré-note | Dernier item manuel (S2-Ex1 « C : Pi ») doté de formes **sources officielles** : l'équation du corrigé p.7 « +2ADP+**2Pi**+2NAD⁺ » (l'item = identifier Pi, le « فوسفات » arabe accepté aussi). Le registre est désormais **100 % auto** : plafond auto = barème sur les 6 groupes (5/7/8 ×2) — la pré-note couvre 100 % de l'échelle | `plafondAutoDe` = 5·7·8·5·7·8 partout ; test registre verrouille |
| 3. شاهد S2-Ex2 non confirmé | **CONFIRMÉ par ventilation arithmétique** : re-lecture du corrigé (p.7-8) — parties 1+2 forcées à 3,5 pts par les rangées officielles (tableau partie 3 = 3,0 + اقتراح 0,5 ; total imposé 7,0) ; les 6 items lisibles = 3,0 ; le 0,5 manquant est nécessairement le شاهد (tube témoin du protocole). Item marqué confirmé dans le code | Commentaire dans attendusBac2025.ts + presentiel des 0,5 dans le chunk |
| 4. Boucle élève non branchée | **`Bac2025ExamView`** : choix du sujet (2 cartes) → 3 zones de réponse avec énoncés officiels du registre → تسليم → **note /20** + détail par exercice. Câblée comme défi déverrouillé « الإطار الرسمي: بكالوريا 2025 » dans معسكر التدريب (App intercepte `bac-2025-sujets`). Rendu partagé `SectionObligatoire` (un seul contrat d'affichage panneau/examen) | Tests jsdom : Meftah → 19/20 affiché ; copie vide → 0 ; hors-sujet → 0/8 affiché |
| 5. (affichage) | Le verdict montre désormais le crédit réel « 0.63/1.25 » et « عناصر مطلوبة: 1/2 — عنصر ناقص » pour les items à composantes | SectionObligatoire.tsx |

**Vérification** : vitest **711/711** (53 fichiers) · boussole **138/138** · build OK (9,0 s).

**Limites restantes (franches)** : la granularité P5 n'est décomposée que sur les items où le
corrigé exige des rôles identifiés (S1-Ex1) — les items 1,0 des autres exercices restent
tout-ou-rien (à décomposer si un faux positif réel est observé) ; les formes restent des
sous-chaînes (le FP CO₂/O₂ connu subsiste) ; la calibration sur copies humaines (R4), les
sanctions 6→30 et le durcissement ICM restent les prochaines pierres.

### Pierre 2c — FINALISATION (même journée) : M3 ✅ M4 ✅ C5 ✅ C6 ✅ (6→26)

| Action du plan | État | Contenu |
|---|---|---|
| M3 — dérive de versions | ✅ | `MIFTAH_MANHAJIA_VERSION = '4.3'` (meftahManhajia, source unique de l'extension) parente de `MIFTAH_VERSION = '3.3'` (miftahSpec, la fiche) ; tous les littéraux « V4.3 » supprimés (commentaires compris) ; check-miftah verrouille les deux constantes et bannit le littéral |
| M4 — check-miftah police de marque | ✅ | Le garde-fou exécute maintenant des **assertions pédagogiques runtime** : Σ questions Meftah = total exercice (5/7/8), total copie 20, registre 6 groupes Σ=maxPts=plafond auto (100 % auto), 2×20=40, parité S1-Ex1 (Q1 1.25 · Q2 3.75). Échec → exit 1 |
| C5 — faux positifs de sous-chaînes | ✅ | `formePresente()` : formes latines à frontières (pas de lettre adjacente ; chiffres pleins pour les formes numériques) — « co2 » ne crédite plus « o2 », « ARNm » plus « arn », « Edaravone » plus « eda », « 1982 » plus « 98 » ; « 2Pi » crédite toujours Pi. Le FP H2O2 ⊃ o2 subsiste (documenté, l'exercice concerné ne mentionne pas H2O2) |
| C6 — sanctions 6 → ~30 | ✅ (26) | +20 règles : inversion AChE « متحررة », anticodon-sur-ARNm (déclencheur d'inversion avec lookahead anti-faux-positif), 2-DG « augmente ATP » (forte) ; vigilances : ribosome/ATP, antibiotique≠anticorps, نخاع شوكي/عظمي, SEP≠SLA, Hb/plasma, « phase à l'obscurité »≠nuit, chloroplaste/respiration, glycolyse/mitochondrie, LTC/LT4, مستضد/مصل, برفورين/بلازموسيت, ATP≠ADN, « تثبت الفرضية », fermentation/38, خلطية/LTC, Rubisco/CA. Les co-occurrences légitimes (comparaisons des corrigés) restent en vigilance, jamais pénalisantes |

Piège de débogage consigné : `formePresente` retournait l'INDEX (0 = trouvé) — falsy sous
`Array.some` → toute forme arabe manquée. Contrat fixé : booléen strict.

**Vérification** : vitest **720/720** (54 fichiers) · boussole **138/138** · build 8,1 s ·
`npm run check:miftah` vert (marque + versions + pédagogie).

**Ce qui reste (franc)** : R4 — calibration sur copies humaines réelles (bloqué : pas de
données) ; C7 — ICM sémantique (seuils 25/50/60 + ped_c1/calc_c1 externalisés : travail
éditorial, le throw sur verbId inconnu est fait) ; granularité P5 étendue aux items 1,0 des
autres exercices (au premier faux positif réel observé).

### Pierre 2d — FINALISATION FINALE (même journée) : C4b ✅ C7 ✅ · R4 rétrogradé

| Chantier | État | Contenu mesuré |
|---|---|---|
| C4b — sanctions × note | ✅ | Une sanction **forte** (inversion factuelle : AChE « متحررة », anticodon-sur-ARNm, 2-DG↑ATP) coûte **0,5 n** sur la pré-note (plancher 0) ; les **vigilances** affichent sans pénaliser. Contrôles intacts : Meftah déclenche **zéro** forte (vérifié sur les 18 réponses). Mesuré : Meftah Ex3 7,5/8 → **7/8** avec inversion greffée, **7,5/8** avec vigilance seule. Affiché dans la même section obligatoire (« خصم أخطاء علمية −0.5 ن ») |
| C7 — fallback silencieux | ✅ | Inventaire réel : **5 critères tombaient dans `length > 40`** (`hyp_c1`, `sch_c1`, `sch_c2`, `exp_m_c1`, `exp_m_c2` — jamais gérés par le scoreur). Chacun a désormais son cas sémantique (ancrage expérimental, boîtes/flammes du canon des cartes, pont entre documents). `default` → **throw** `criterionId inconnu` — un critère non géré est un bug de carte, plus une note gratuite |
| C7 — critères codés en dur | ✅ | `ped_c1..c3` (arbre généalogique) et `calc_c1` (Chargaff) : les regex de CONTENU sont sorties du scoreur générique vers les cartes (`verifAr: string[]`, ET logique) — un autre exercice de calcul n'est plus esclave de Chargaff. Mesuré : calcul 100 %, pedigree 100 %, sans loi/encodage → échec du critère |
| C7 — portes de longueur | ✅ | `ex_c2`/`hyp_c2` : 60 caractères → **marqueur de mécanisme** (المستقبل/الأنزيم/القناة/ومنه…) — l'hypothèse concise ancrée repasse à **100 %**, la vague tautologique = **0 %**. `an_c4`-famille : seuil 50 supprimé (la conclusion est déjà un marqueur sémantique) |
| C7 — « Mars à 100 % » | ⚠️ ASSUMÉ | « نستنتج أن الغلوكوز يسكن على المريخ » reste à 100 % **et c'est correct** : l'ICM mesure la MÉTHODE (structure, seners, conclusions), pas la vérité du contenu. La vérité du contenu est désormais jugée par le registre obligatoire + les sanctions fortes (chemin BAC). Un détecteur d'absurdité sémantique générale serait un LLM-judge — refusé (décision acquise) |
| R4 — calibration | ⬇️ RÉTROGRADÉE | Avec le registre comme dénominateur, le fit linéaire (a·cov+b) est **obsolète** : le barème EST le modèle, plus aucun coefficient à ajuster. R4 se réduit à : surveiller les seuils d'intégrité (30/50/25 %) sur un lot de vraies copies quand des données arriveront — une tâche de supervision, pas de calibration. `recalibrer-copiees.ts` reste pour l'étude LEGACY |

**Vérification** : vitest **729/729** (55 fichiers) · boussole **138/138** · build 8,3 s · `check:miftah` vert.

### ÉTAT FINAL DU PLAN (5 actions de l'audit + résolutions)

| # | Action du plan originel | État |
|---|---|---|
| 1 | Arbitrer M2 sur le corrigé officiel + tests sommes/parité | ✅ (M2, verrouillé) |
| 2 | Renommer l'affichage + granularité du crédit | ✅ (P2b : « تقرير بنود المقياس (تشخيصي) » + composantes P5) |
| 3 | Sort de calibrationBac2025 + métriques par groupe | ✅ (R6 obligatoire, LEGACY gelé ; métriques = tests §R6 ; R4 rétrogradée ici) |
| 4 | Contre-probes + attendus obligatoires + pénalités | ✅ (P2/P2b/C4b/C6/C7 — 4 pièges ≤ 1/8, hors-sujet 0 sans paramètre) |
| 5 | Scoreur ICM : throw, critères carte, fin des seuils | ✅ (C7 ci-dessus) |
| 6 | Sanctions 6 → ~30 | ✅ (26 — extensible) |
| 7 | Versions unifiées + check-miftah pédagogique | ✅ (M3+M4) |

**Reste ouvert (hors plan, décisions produits)** : التدرج السنوي (traçabilité L5) et exigibilité du
livre prof — points demandés par le propriétaire, jamais arbitrés ; branchement de la note
obligatoire sur la sauvegarde élève (الرقم السري) si le produit doit archiver les notes.

### Pierre 2e — HISTORIQUE DES NOTES (décision propriétaire, même journée)

Le troisième arbitrage produit restant est tranché par le propriétaire : « je veux un
historique de notes ». Livré :

1. **`src/utils/examLog.ts`** — archivage local de chaque épreuve soumise
   (`kunz_exam_attempts_log_v1`, rotation 200) : total /20 + détail par exercice
   (points, maxPts, couverture) = exactement la note affichée par le correcteur.
   JSON corrompu → historique vide (jamais un crash). Stats : last/previous/best/
   average/spark (10 derniers) — null tant qu'il n'y a aucune tentative.
2. **Dashboard enseignant** : chaque tentative pousse un événement activité
   (file offline-first `logActivityLocally`, type `quiz`, domaine `bac2025`) —
   il n'arrive sur le serveur QUE si l'élève a un compte (`boussole_token`) ;
   en invité, rien ne quitte l'appareil. Décision assumée : le TEXTE des réponses
   reste local (aucun contrat de synchro ne le porte — l'historique de NOTES
   n'exige pas la réplication des copies).
3. **UI** (`Bac2025ExamView`) : la note est calculée UNE fois au clic (fin du
   useMemo post-soumission — zéro double-archivage possible) ; bouton
   « سجل النقاط » → panneau : nombre de tentatives, liste antéchronologique
   (total, sujet, date ar-DZ, badges ت1/ت2/ت3 avec points/max), message honnête
   « لا محاولات مؤرشفة بعد » si vide, purge manuelle.

**Vérification** : vitest **738/738** (56 fichiers : +7 examLog, +2 UI) · boussole 138/138 ·
build 8,9 s · check:miftah OK. Le test UI verrouille l'invariant central :
**note affichée = note historisée** (19,5 = 5+7+7,5 — le test a d'abord attrapé mon
assertion périmée d'avant la granularité P5, preuve qu'il lit la note réelle).

**Reste ouvert (décisions propriétaire)** : التدرج السنوي (traçabilité L5), exigibilité du
livre prof. Rien d'autre ne pends côté correcteur.
