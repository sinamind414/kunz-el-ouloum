# BILAN D'ÉTAT — Correcteur & Meftah (au 2026-09-19, fin de session)

**Santé globale : 692/692 tests vitest · 138/138 harnais · check:v2 OK · build production OK.**
**Documents de référence :** `AUDIT_CORRECTEUR_MEFTAH_2026-09-19.md` (audit + Pierre 1) · `VERIF_HIKALA_BAC.md` (fiche هيكلة) · `AUDIT_ARCHITECTURE_2026-09-19.md` (repo global).

---

## 1. LE CORRECTEUR — état actuel

### Ce qu'il est aujourd'hui

Un pipeline en 6 couches : banque de mots-clés L1–L6 (traçable, testée) → dictionnaire 617 entités → barème officiel 80 items (2023→2025) → **blindage d'intégrité (NOUVEAU)** → sanctions scientifiques (6 règles) → note calibrée (non branchée, voir dette).

### Ce qui a été prouvé (audit du jour, sorties réelles)

| Constat | Verdict |
|---|---|
| Salade de mots-clés, hors-sujet, négations, perroquet | **4/4 attaques à 8/8 avant blindage** — détecteur de déversement lexical |
| Barème auto affiché aux élèves | Prédicteur nul (r=0) selon vos propres données, présenté sous le titre « التنقيط على المقياس الرسمي » |
| Note calibrée (80 copies) | Sature à 3–14 mots-clés ; interceptes payant la copie creuse ; **code mort** (zéro composant) ; corpus non reproductible ; S2-Ex3 à r=0,45 |
| Matching | Sous-chaînes : CO2 crédite O2, PSII crédite PSI |
| Fidélité du dictionnaire | ✅ **VALIDÉE contre le corrigé ministériel 2025** (item par item : Q1=0,25×5, Q2=3,75, RIP=1,25, annonce=0) |

### Ce qui a été corrigé (Pierre 1 + arbitrage officiel)

| Correctif | Fichier | Effet mesuré |
|---|---|---|
| Vigile anti-jeu : 3 plafonds (non-prose 30 %, négations 50 %, perroquet 25 %) | `integriteCopie.ts` + câblage dans `noterExerciceCalibre` | 8/8 → **2,4/8** (salade, hors-sujet, négations), 8/8 → **0/8** (perroquet) |
| Contrôle positif verrouillé : les 3 réponses modèle Meftah **ne bougent pas** | `integriteCopie.test.ts` | 3,87/5 · 7/7 · 5,18/8 — zéro plafond |
| La QUESTION entre dans le moteur (`{question, attendus}`) | `calibrationBac2025.ts` | Perroquet détecté par écho lexical ; hors-sujet = 0/8 quand les attendus sont fournis (testé) |
| Fin de la note au hasard : verbId inconnu → `throw` | `methodologyScorer.ts` | « hypothesize » ne note plus contre la carte analyse |
| Tests anciens adaptés honnêtement | `calibrationBac2025.test.ts` | R2 étendu en R2+R5 ; le test « salade immunité 8/8 » exige maintenant ≤ 2,4/8 |

### La dette du correcteur (dans l'ordre de priorité)

1. **P2 — Brancher les attendus par question** (le cœur). Les 80 items officiels sont dans le build, **prouvés fidèles** ; le mécanisme est câblé et testé. Reste : rendre `attendus` obligatoire pour toute notation + l'alimenter par question. *Sans ça, le hors-sujet intrinsèque reste indétectable (allié accidentel : le signal prose).*
2. **P3 — Trancher le sort de la calibration** : brancher derrière flag « expérimental » ou geler ; refitter sur vraies copies humaines (protocole R4 existant) ; publier les métriques PAR GROUPE.
3. **P4 — Sanctions 6 → ~30** (une confusion/semaine, source = rapports de correction).
4. **P5 — Renommer l'affichage** « التنقيط » → statut expérimental + crédit proportionnel aux entités de signature (1 entité = item entier aujourd'hui).
5. **P6 — Sous-chaînes** : frontières de mots dans le matching.

---

## 2. MEFTAH — état actuel

### Ce qui est validé

- **Le fond (M1) ✅** : 4 dents, loi unique sourcée (`meftahLaw`), deux patrons d'analyse, interdits avec contextes légitimes, think/write/trap — conforme à la doctrine officielle et à la fiche هيكلة (colonne « قياس التعليمة », vérifiée et verrouillée en test).
- **Les réponses modèle BAC 2025 ✅** : scientifiquement exactes (RIP, pyrénoïde/CA/Rubisco, mécanisme Ado/A1R/NE), et servent désormais de **contrôle positif permanent** du correcteur.
- **La vérité des barèmes ✅ (M2 CLOSE)** : le corrigé ministériel a tranché — le dictionnaire était exact, Meftah était faux. Corrigé : Q1 **1,25** / Q2 **3,75** ; et bug découvert au passage : **Ex2 sommait 7,5 ≠ 7**, réparé (1,5 / 2,5 / 2,5 / 0,5).

### Les verrous posés (plus jamais de dérive silencieuse)

`hikalaBac.test.ts` : somme des questions = barème (5/7/8) · parité programmatique Meftah ↔ `ATTENDUS_BAREME` · فخ RIP=1,25 cohérent · mapping calibration ↔ هيكلة · dette des أفعال bornée et visible.

### La dette de Meftah

1. **P2 — Drift de versions** : spec `3.3` vs données/Vue `V4.3` — unifier (½ j).
2. **P3 — Collision d'espaces d'ids** : `linkedVerbId` (reflexes : `hypothesize`…) ≠ cartes scoreur (`verb_*`). Aujourd'hui la navigation Meftah ne score pas — mais le jour où ça score, ça throw (c'est voulu). Harmoniser.
3. **P4 — check-miftah** = police de marque (~120 chaînes, 0 assertion pédagogique) ; y déplacer les verrous de barème.

### Le constat structurel qui reste

**~40 % de couverture des أفعال officiels** par les 12 cartes du scoreur. T2+T3 (15 pts/20) portent 17+ occurrences sans carte : **ناقش، علّل، برّر، أثبت، استخرج، برهن، صغ المشكل**. L'app n'entraîne ni ne note les verbes du مسعى — le plus gros exercice du bac. (Faux du jour corrigés par la mesure : la dette = 27 occurrences, pas ~15 ; T1 est le pire en ratio, mais ce sont les points de T2+T3 qui comptent.)

---

## 3. LES CHIFFRES DE LA SESSION

| | Avant | Après |
|---|---|---|
| Attaques adversariales réussies (note max) | 4/4 | **0/4** |
| Réponses légitimes dégradées | — | **0/3** (verrouillé par test) |
| Barème Meftah faux | 5 labels (dont somme 7,5≠7) | **0** (verrouillé par test) |
| VerbId inconnu | notait 100 % en silence | **throw** |
| Contradiction de sources (M2) | ouverte | **close sur corrigé officiel** |
| Tests | 663 (+4 rouges hors build) | **692 verts, build inclus** |

## 4. LA DÉCISION QUI T'ATTEND

Le correcteur est maintenant **un détecteur de déversement plafonné** — honnête, testé, non-gameable au niveau superficiel. Il n'est **pas encore un correcteur au sens plein**, parce qu'il ne note pas contre la question. La marche à franchir est éditoriale, pas algorithmique : transformer les 80 items officiels (prouvés exacts) en attendus obligatoires par question. C'est P2. Tout le reste est secondaire.


---
## Mise à jour du 2026-09-19 (même journée) — Pierre 2 EXÉCUTÉE

« rendre les attendus obligatoires » : fait. Registre 6 groupes (build prouvé + corrigé
ministériel intégral), moteur R6 (couverture attendus × max, puis plafonds d'intégrité),
câblé dans le panneau correcteur, 703/703 + 138/138 + build OK. Détail complet :
`docs/AUDIT_CORRECTEUR_MEFTAH_2026-09-19.md` §7 (avant/après chiffrés et limites).
Reste du plan : calibration sur copies humaines (R4), sanctions 6→30, ICM, granularité
par item (P5), branchement élève de bout en bout.
