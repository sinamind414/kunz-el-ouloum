# 🔬 AUDIT — Qualité des QCM et alignement avec le livre scolaire

> **Objet** : auditer TOUS les QCM de l'application (banques `lessonData.ts` +
> `singlePathLessons.ts`) sur deux axes : (1) qualité de construction (options,
> distracteurs, fuites de réponse) ; (2) alignement avec le livre officiel
> ingéré (`data/bookContent.json`, 6 105 lignes OCR) via l'index des 55
> chapitres (`data/bookContent.index.json`).
> **Date** : 2026-09-20 · **Méthode** : extraction mécanique (scripts temporaires),
> attribution experte des chapitres (documentée Q par Q), couverture lexicale
> dans le chapitre, présence des termes distinctifs dans TOUT le livre.
> **Corpus audité** : **53 QCM** (50 + 3).

---

## 1. Verdict global

| Axe | Verdict |
|---|---|
| Hygiène structurelle | ✅ **Saine** : 0 index de réponse invalide, 0 option dupliquée, 0 fuite de réponse dans l'énoncé (53/53) |
| Qualité des distracteurs | ⚠️ **Faiblesse systémique** : ~40 % des QCM ont 2 distracteurs absurdes + 1 seul plausible → devinables par élimination |
| Ancrage scientifique | ✅ **Fort** : GABA, interleukine, perforine, péridotite, ophiolites, andésite, chimiosmose, asthénosphère — tous vérifiés dans le livre |
| Alignement chapitre | 📊 26/50 ≥ 50 % de couverture dans le chapitre expert ; les 18 « faibles » s'expliquent par des chapitres OCR effondrés (C10, C15, C46 = 1-3 lignes) ou du vocabulaire latin absent de l'OCR |
| Hors-livre | 🔶 **2 QCM assumés** (Q30, Q31 — phase22 « culture générale », déjà documentés dans `curriculumOfficial.CULTURE_GENERALE`) |
| Dette lexicale app/livre | ⚠️ **4 termes** : voir §4 |

---

## 2. Inventaire

| Banque | Fichier | Nombre | Forme |
|---|---|---|---|
| Quiz de leçons | `src/lessonData.ts` (EXPERIMENTAL_LESSONS) | **50** | `{question, options[3], correct: index}` |
| Leçons single-path | `src/data/singlePathLessons.ts` | **3** | `{question, options[{text, correct}]}` |
| **Total** | | **53** | |

Autres structures examinées et **écartées** (non-QCM) : `drillBank.ts` (drils à 3
portes, pas de QCM), `v3Progress.ts` (état de jeu), `meftahManhajia.ts` (exercices
à production libre), `Bac2025ExamView` (sujet + attendus, pas de QCM).

## 3. Qualité de construction — constats

### 3.1 Ce qui est excellent (à préserver)
- **Q2 (transcription)** : le piège classique `UAC GCG` vs `AUG CGC` — la bonne
  réponse exige de savoir que la séquence donnée est la surligne NON-transcrite.
- **Q38 (enzymes)** : récupération à 0 °C vs destruction à 80 °C — discrimine
  réversibilité physique vs dénaturation.
- **Q40 (immunologie)** : « un sérum O⁻ porte anti-A et anti-B » — distinguer
  antigènes/anticorps du donneur O⁻ est LA confusion classique ; le distracteur
  « ne porte rien » est le bon leurre.
- **Q44 (IL-2)** : l'exigence de récepteur induit post-activation — niveau BAC élevé.
- **Q46 (tout ou rien)** et **Q10 (bilan NADH par compartiment)** : rigoureux.

### 3.2 Faiblesse systémique : distracteurs farces
Motif récurrent (~20 QCM) : la bonne réponse « longue et technique », un
distracteur plausible, deux absurdes — l'élève élimine en 3 secondes :
- Q3 « *ils se trouvent dans le noyau et détruisent l'ADN* » / « *dans les muscles* » ;
- Q14 « *parce que le Soleil tourne autour de la Terre* » ;
- Q20 « *parce que sa chaleur ressemble à celle du moteur d'une voiture* » ;
- Q26 « *eau et oxygène comprimés* » ; Q29 « *le sommet de l'Everest était un volcan* ».

**Recommandation R1** : pour chaque QCM, remplacer UN distracteur absurde par une
confusion plausible du même chapitre (ex. Q3 : « récepteurs post-synaptiques » ;
Q26 : « silicium et magnésium »). Priorité aux QCM des chapitres à fort effectif
(U4, U5) — c'est la banque de révision principale.

### 3.3 Incohérences mineures
- Numérotation : mélange « 1. / 2. » et « Testez votre compréhension : » sans
  numéros ; plusieurs « 1. » dans le même fichier (les 2 leçons par fichier).
- **Q32 mal placée** : la question sur la liaison peptidique (site P/site A) est
  dans la leçon de STRUCTURE (phase2) mais teste la TRADUCTION (C5) — révision
  croisée valide, à étiqueter comme telle.
- Options toujours au nombre de 3 : acceptable, mais le BAC alterne ; varier.

## 4. Alignement avec le livre — constats

### 4.1 Dette lexicale (termes du QCM absents du livre) — FIGER dans le verrou
| Terme du QCM | Livre | QCM concerné | Décision recommandée |
|---|---|---|---|
| **الروبيسكو (Rubisco)** | ✗ absent (le livre ne nomme pas l'enzyme de fixation) | Q7 | conserver (enrichissement correct) + noter « hors nomenclature du livre » |
| **الغرانودوريت** | ✗ absent (l'andésite ✓) | Q18 | idem |
| **انقطاع غوتنبرغ** | ✗ nom absent (la profondeur **2900 km** ✓) | Q21 | remplacer le nom par « l'interruption à une profondeur de 2900 km » (ancre livre) |
| **ظهيرة المحيطية (app)** vs **الظهرات (livre)** | divergence sur le terme central de la D3 | Q16, Q27, Q28 | harmoniser vers **الظهرات** (terme du livre/TDM) ou bilingue |

### 4.2 Chapitres effondrés (limite de la mesure, déjà connus de l'index)
C10 (1 ligne), C15 (3 lignes), C46 (1 ligne), C21 (13), C52 (14) : toute
couverture calculée dedans est mécaniquement basse — la présence des termes
dans le livre (✓ péridotite, ✓ perforine, ✓ interleukine…) est la preuve
d'alignement retenue pour ces cas.

### 4.3 Répartition mesurée (50 QCM, chapitre expert)
- **26 alignés** (couverture ≥ 50 % dans le bon chapitre) ;
- **4 partiels** (30-49 %) ;
- **18 faibles** (< 30 %) — dont la majorité par effet de taille de chapitre ou
  vocabulaire latin (ATP/NADH/CMH en script latin dans le QCM, arabe dans l'OCR) ;
- **2 hors-livre assumés** : Q30 (roches métamorphiques/ignées) et Q31 (piège
  pétrolier) — phase22 est de la culture générale HORS TDM, signalé
  `CULTURE_GENERALE` côté app. Verdict : **aligné à l'objectif 'culture', hors
  objectif 'livre' — à garder avec badge**.

## 5. Recommandations priorisées
1. **R1 — distracteurs** : reprendre les ~20 QCM à distracteurs farces (§3.2).
2. **R2 — harmonisation lexicale** : dorsal ظهيرة→الظهرات (Q16/27/28) ;
   Gutenberg→profondeur 2900 km (Q21).
3. **R3 — étiquette** : badge « enrichissement — hors nomenclature du livre » sur
   Rubisco/granodiorite (Q7, Q18) et sur les 2 QCM de culture (phase22).
4. **R4 — couverture** : 13 chapitres sur 55 n'ont AUCUN QCM (notamment C18-C20
   voie LTc detail, C24-C26 début U5) — la banque couvre les leçons APP, pas le
   livre entier ; décider si la cible est « leçons » ou « 55 chapitres ».
5. **R5 — verrou** : `src/data/qcm.integrite.lock.test.ts` fige l'état (comptes,
   hygiène, dettes lexicales) — toute évolution passe par lui.

## 6. Méthode et limites
- Extraction mécanique des 53 QCM ; mesures reproductibles (scripts exécutés
  puis supprimés ; les chiffres figés vivent dans le verrou).
- Attribution « chapitre expert » : décision documentée de l'auditeur Q par Q
  (l'attribution automatique par jaccard est biaisée par les gros chapitres de
  récapitulation — C23, C31).
- La couverture lexicale pénalise l'OCR arabe (termes latins du QCM) et les
  chapitres courts ; la présence de termes dans tout le livre sert d'arbitre.
- Aucun QCM n'a été modifié durant cet audit — c'est un état des lieux.
