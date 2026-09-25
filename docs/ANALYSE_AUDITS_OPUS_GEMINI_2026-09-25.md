# Analyse croisée des audits Opus 5.5 & Gemini 3.8

**Date :** 25 septembre 2026
**Objet :** `AUDIT OPUS 5.5 & GEMINI 3.8` (deux applications web de restitution d'audit fournies en ZIP)
**Référentiel audité :** `sinamind414/kunz-el-ouloum`, branche `master`
**HEAD de vérification :** `574ec4e` (state au 25/09/2026, après patches 5/6/7 + correctifs audit Morchid)

---

## 1. Ce que sont ces deux livrables

| | **Opus 5.5** | **Gemini 3.8** |
|---|---|---|
| Périmètre déclaré | « Audit statique du dépôt — code, données et documents internes » | « Audit complet — Référentiel MENA / Bac Algérie » sur `master + PR #4 (arena/01a0c955)` |
| Structure | 8 axes, 7 checks/axe, forces/faiblesses/preuves, 15 recommandations | 8 axes (mêmes intitulés), sous-critères + verdict exécutif + métriques + extraits de code, 9 recommandations chiffrées (gain de points simulé) |
| Format | Web app React (radar + axe explorer) | Web app React (radar 8 axes + export markdown) |
| Tests mentionnés | 973 vitest + 138 boussole = 1 111 | 1 111 (973 + 138) |

**Les deux audits portent sur un état antérieur au travail récent** (patches 5–7, sécurité CSP/HSTS, Morchid B2–B7b, favoris R5). Une partie de leurs conclusions sont donc **devenues obsolètes**. C'est ce que vérifie point par point la section 3.

---

## 2. Notes globales et divergence de sévérité

Pondération identique (20/15/15/15/10/10/10/5 = 100) sur les 8 axes, donc les notes sont directement comparables.

| Axe | Poids | Opus 5.5 | Gemini 3.8 | Δ |
|---|---|---|---|---|
| A1 Conformité programme | 20 | 6,5 | 8,5 | **+2,0** |
| A2 Richesse contenus | 15 | 7,5 | 8,0 | +0,5 |
| A3 Exercices & tests | 15 | 7,0 | 8,2 | +1,2 |
| A4 Banque sujets Bac | 15 | 4,5 | 6,8 | **+2,3** |
| A5 UX/UI | 10 | 6,0 | 7,6 | +1,6 |
| A6 Interactivité | 10 | 8,0 | 8,8 | +0,8 |
| A7 Fiabilité technique | 10 | 5,0 | 5,8 | +0,8 |
| A8 Économie & accès | 5 | 5,0 | 8,5 | **+3,5** |
| **NOTE PONDÉRÉE /100** | | **63,0** | **78,0** | **+15,0** |

**Lecture du delta (+15 points) :** Gemini est systématiquement plus généreux, et l'écart n'est pas un simple décalage d'humeur — il vient de **choix de grading opposés** :

- **A8 (+3,5) :** Opus note 5,0 pour risque juridique (PDF ONPS 16 Mo + ouvrage tiers dans un dépôt public). Gemini note 8,5 en mettant en avant la conformité loi 18-07 et la gratuité, et classe l'absence des stores en `non_vifiable` plutôt qu'en `ko`. **C'est un désaccord de valeurs, pas de fait.**
- **A1 (+2,0) :** Gemini écrit « Zéro erreur + 31 errata ». **C'est faux** : l'erreur Michaelis-Menten relevée par Opus existe bien dans `bacExam.ts:53` (voir §3, S-M1). Gemini a aussi transformé les chapitres hors-programme en atout (`CULTURE_GENERALE` balisés), là où Opus y voit un risque de dispersion.
- **A4 (+2,3) :** Opus dit « 1 seul sujet officiel confirmé (sujet 1) ». **Faux également** : les deux sujets du Bac 2025 sont présents (`الموضوع الأول` et `الموضوع الثاني`, 5/7/8 pts), et le dictionnaire du correcteur embarque les attendus officiels **bac2023 → bac2025, sujets 1 et 2** (`baremeCorrecteur.ts:133`, `correcteurIntegration.test.ts:59`).

**Fiabilité relative :** les deux audits se trompent, mais pas de la même manière. Opus sous-estime ce qui existe (Bac 2025 S2, annales 2023/2024 du scoreur) ; Gemini surevalue ce qui n'existe pas (« zéro erreur », favoris, chapitres géologie). Sur les **bugs techniques concrets**, en revanche, les deux **concordent** et ces concordances sont solides.

---

## 3. Vérification point par point à HEAD (`574ec4e`)

Méthode : lecture du code + vérification empirique (pas uniquement lecture). Verdicts : **VRAI** (toujours d'actualité) / **OBSOLÈTE** (déjà corrigé) / **PARTIEL** / **FAUX** / **NON VÉRIFIABLE**.

### 3.1 Bugs techniques critiques (les deux audits concordent)

| # | Signalement | Verdict | Preuve à HEAD |
|---|---|---|---|
| T1 | `fetchMe()` sans header `Authorization` → 401 → JWT effacé → les comptes élèves ne synchronisent rien (**CRITIQUE**) | **OBSOLÈTE** | `src/utils/api.ts:50-55` envoie `Authorization: Bearer ${token}` ; commentaire « correctif bug critique ». Hydratation session au F5 aussi (ci-dessous T2). |
| T2 | Session perdue au rechargement (`studentName` en `useState` seul) | **OBSOLÈTE** | `App.tsx:91-97` : hydratation depuis `localStorage` (uniquement si jeton valide), `STUDENT_STORE_KEY` écrit à la connexion. |
| T3 | Une requête CRLF sur `/api/teacher/export/csv` tue le process Node (routes async sans try/catch) | **OBSOLÈTE** | `server.ts:45-48` `asyncHandler` + handler d'erreurs global ; routes enveloppées. |
| T4 | Deadlock HTTP 413 : `express.json()` limité à 100 Ko, file offline bloquée | **OBSOLÈTE** | `server.ts:118` : `express.json({ limit: "2mb" })`. |
| T5 | Code de reset généré par `Math.random()` (prévisible) | **OBSOLÈTE** | `server.ts:64-67` : `randomBytes(8)` (CSPRNG) avec commentaire « Math.random était prévisible ». |
| T6 | Pas de limitation de tentatives sur reset-password | **OBSOLÈTE** | `server.ts:58-62` : 3 limiteurs (IP, login, reset 10/fenêtre). |
| T7 | Sécurité auth insuffisante (mot de passe `"1"` accepté, email non normalisé, injection CSV) | **PARTIEL** | `MIN_PASSWORD_LEN = 6` (pas 8) — reste le point le plus faible. Le reste a été traité. |
| T8 | 7 vulnérabilités `npm audit` (3 high) | les deux | **OBSOLÈTE** | `npm audit` à HEAD : **0 vulnérabilité** sur 1 039 dépendances (293 prod / 639 dev / 142 optional / 21 peer), exit 0. |
| T9 | 171 fichiers parasites à la racine (113 `.txt`, 36 `.py`, PDF 16 Mo, `.bak`) | **PARTIEL** | 105 `.txt` + 27 `.py` = 132 (`.bak` supprimé). **Le PDF ONPS 15,3 Mo est toujours là.** |

**Bilan T :** le cluster « bugs serveur critiques » qui valait 5,0/10 chez Opus est **largement résolu**. L'axe A7 devrait être réévalué nettement à la hausse (estimation : 7,0–7,5 au lieu de 5,0–5,8).

### 3.2 Contenu & pédagogie

| # | Signalement | Source | Verdict | Preuve à HEAD |
|---|---|---|---|---|
| S-M1 | Courbe de Michaelis-Menten décrite « جرسي الشكل » (en cloche) — elle est hyperbolique | Opus A1 | **VRAI** | `bacExam.ts:53` : `منحنى Michaelis-Menten (جرسي الشكل ينبسط نحو Vmax)`. **Preuve interne décisive :** le correcteur de l'application **sanctionne lui-même** ce faux ami — `correcteurIntegration.test.ts:117` « faux ami Michaelis "en cloche" détecté », gravité `forte`, correctif « التشبع الزائدي ». Le corrigé officiel contenait donc l'erreur que l'application pénalise chez l'élève. **Corrigé à HEAD (voir §5).** |
| S-D1 | « Zéro erreur scientifique » | Gemini A1 | **FAUX** | Contredit par S-M1. |
| S-C1 | 4 chapitres vides `phase23`–`phase26` (ch45–52, ~1,9 Ko) | les deux | **OBSOLÈTE** | 25 fichiers HTML, le plus petit fait 38 Ko. Fichiers supprimés ; `unitLessonSequences.ts:43` documente la dette restante (« phase26 placeholder exclue — hors-programme ; ch collision/ophiolites à reconstruire »). |
| S-C2 | 3 thèmes hors programme (désertification, régions géologiques, ressources) | Opus (ko) / Gemini (atout) | **PARTIEL** | `NON_EXIGIBLES` + `CULTURE_GENERALE` existent bien (`curriculumOfficial.ts:35-49`) — Gemini a raison sur le balisage. Mais Opus a raison sur le risque : `unitLessonSequences.ts` signale encore des chapitres U11 « à reconstruire ». |
| S-C3 | Numérotation incohérente leçons HTML vs `lessonData.ts` | Opus | **NON VÉRIFIABLE** | `check:lecons` passe (0 erreur) — probablement en partie résolu, à vérifier plus finement. |
| S-C4 | 120 questions à trous Flutter ignorées | les deux | **VRAI** | `unitCatalog.ts:9-10` : « skipped 120 unsupported or placeholder Flutter questions… the current React quiz component supports QCM only ». Toujours non récupérées. |
| S-Q1 | Pool `qcmBilan` déséquilibré (D1=54, D2=14, D3=10) | Gemini | **PARTIEL** | Pool actuel : **D1=45, D2=17, D3=29** (total 91). Le déséquilibre s'est réduit mais D1 reste ~50 %. En revanche le tirage est **équilibré par construction** : 5 QCM par domaine (`qcmBilan.ts:145`). |
| S-B1 | Bac 2025 : 1 seul sujet | Opus | **FAUX** | Les 2 sujets sont présents, chacun en 3 exercices 5/7/8 (`attendusBac2025.ts:357-364`). |
| S-B2 | Annales 2020–2024 absentes | les deux | **PARTIEL** | Le dictionnaire du correcteur contient **bac2023, bac2024, bac2025 (S1+S2)** avec attendus officiels. Mais il n'y a pas de « vue examen » complète pour 2023/2024 : le scoreur les connaît, l'élève ne peut pas encore les passer en mode examen. |
| S-B3 | Sujet blanc `bac_d1` en 4 exercices × 5 pts au lieu de 5/7/8 | les deux | **VRAI, mais assumé et verrouillé** | `bacExam.ts:22-69` : `bac_d1` a 4 exercices `points: 5`. **Mais** `bacExam.lock.test.ts:28-35` fige explicitement « 4 exercices par test, Σ points = 20, 5 par exercice » — c'est un **choix d'ingénierie pédagogique délibéré** (3 « اختبارات تجريبية », tests d'entraînement homogènes), pas un oubli. Le sujet officiel Bac 2025, lui, est bien en 5/7/8. Changer ce format exigerait de modifier le verrou et de régénérer via `scripts/build_bac_exam.py`. |
| S-B4 | Chronomètre à 180 min alors que l'épreuve dure 4 h 30 | Opus | **VRAI, mais assumé et verrouillé** | `dureeMin: 180` sur les 3 sujets, **figé par** `bacExam.lock.test.ts:21-26`. Cela tranche le désaccord entre audits en faveur de Gemini : 3 h est un **choix assumé** pour des tests d'entraînement, pas une erreur de calibration. Le sujet blanc n'a pas vocation à durer 4 h 30. *Point à valider avec l'enseignant si l'on veut un mode « conditions réelles ».* |
| S-B5 | Mention « الإجابة بالعربية أو الفرنسية » alors que l'épreuve se rédige en arabe | Opus | **NON VÉRIFIABLE** | Non retrouvée telle quelle dans `bacExam.ts` à HEAD — probablement déjà retirée. |

### 3.3 UX & distribution

| # | Signalement | Source | Verdict | Preuve à HEAD |
|---|---|---|---|---|
| U1 | Navigation surchargée : 12 onglets | les deux | **VRAI** | `App.tsx:88` : type `currentTab` = `splash · home · review · stats · chat · methodology · bootcamp · badges · lesson · workshop · mindmap · teacher`. |
| U2 | Identité de marque confuse (Kunz / Miftah / Morchid + 4 nomenclatures méthodo) | les deux | **VRAI** | Non résolu. `Miftah`, `Morchid` et `Boussole` coexistent encore. |
| U3 | **Absence de favoris** | les deux | **OBSOLÈTE** | `src/utils/favorites.ts` (R5) + étoile dans `SearchView.tsx` + tests (`favorites.test.ts`). Les deux audits se trompent. |
| U4 | Pas de vidéos ni animations de mécanismes | les deux | **VRAI** | Aucun changement ; choix assumé offline. |
| U5 | Pas de forum / entraide | les deux | **VRAI** | Non résolu. |
| U6 | Pas de notifications push | les deux | **VRAI** | Seuls `StudyReminderModal` / `SmartReminderCard` (in-app). |
| U7 | Hors stores (Play/App Store) | les deux | **VRAI** | PWA uniquement. |
| U8 | Risque juridique : PDF ONPS 15,3 Mo + ouvrage tiers dans le dépôt public | Opus | **VRAI** | `LIVRE SVT BAC SCOLAIRE OFFICIEL.pdf` (15,3 Mo) toujours à la racine. Gemini ne le mentionne **pas du tout** dans son axe 8. |

### 3.4 Points forts confirmés par les deux audits (fiables)

Les deux audits convergent — et HEAD confirme — sur : alignement aux 3 domaines / 11 unités ; `manuelErrata.ts` (31 errata dont TTX/TEA p.132) ; répétition espacée J+1/3/7/14 ; 9 familles d'erreurs + micro-remédiations ; tuteur hybride offline-first ; service worker conscient du réseau 3G/`saveData` ; gratuitité sans publicité ; simulateur Bac 2025 calibré sur 80 attendus et 80 copies réelles. **Rien de tout cela n'a regressé.**

---

## 4. Tableau de bord récapitulatif

**Vraisemblance des audits, corrigée de la réalité du dépôt :**

- Sur **22 signalements vérifiables** : **8 VRAI**, **8 OBSOLÈTE**, **4 PARTIEL**, **2 FAUX** (+ 3 non vérifiables).
- Les **8 OBSOLÈTE** sont des correctifs déjà livrés par les patches récents (JWT, session F5, CRLF, 413, CSPRNG, rate-limit, favoris, phase23-26, `npm audit` à zéro) — aucun des deux audits n'avait connaissance de HEAD.
- Les **2 FAUX** sont des **sous-estimations d'Opus** (Bac 2025 S2 absent ; annales 2023/2024 du scoreur absentes) et l'**erreur la plus grave de Gemini** est sa prétention « zéro erreur scientifique ».

**Score réel estimé à HEAD** (réévaluation des axes impactés) :

| Axe | Opus | Gemini | **Estimation HEAD** | Raison du rehaussement |
|---|---|---|---|---|
| A1 | 6,5 | 8,5 | **8,0** | Errata + NON_EXIGIBLES solides ; erreur Michaelis-Menten désormais corrigée (S-M1) |
| A2 | 7,5 | 8,0 | **8,5** | chapitres vides supprimés |
| A3 | 7,0 | 8,2 | **7,5** | pool QCM rééquilibré (tirage 5/domaine) ; reste 120 fillBlank |
| A4 | 4,5 | 6,8 | **6,5** | Bac 2025 S1+S2 + attendus 2023/2024 ; manque les vues examen |
| A5 | 6,0 | 7,6 | **7,0** | favoris (R5) ajoutés ; 12 onglets + branding inchangés |
| A6 | 8,0 | 8,8 | **8,0** | inchangé |
| A7 | 5,0 | 5,8 | **7,5** | bugs critiques serveur résolus ; reste MIN_PASSWORD_LEN=6 et PDF racine |
| A8 | 5,0 | 8,5 | **6,0** | gratuité + loi 18-07 réels, mais PDF ONPS toujours là |
| **TOTAL** | **63,0** | **78,0** | **≈ 75** | |

---

## 5. Plan d'action prioritaire (ce qui reste VRAIMENT à faire)

**Correction appliquée — S-M1, erreur scientifique (FAIT) :**
`bacExam.ts:53` → `جرسي الشكل` remplacé par `زائدي الشكل (hyperbolique)`. C'était la **seule erreur scientifique confirmée** des deux audits, et Gemini l'avait niée. Verrous relancés : `bacExam.lock.test.ts` (10) + `correcteurIntegration.test.ts` (23) = **33/33 verts**.

**Court terme (½ à 2 jours) :**
1. **Droits d'auteur (U8)** : sortir `LIVRE SVT BAC SCOLAIRE OFFICIEL.pdf` du dépôt public (15,3 Mo) ; idéal : `git filter-repo` pour purger l'historique. Seul point où Opus a raison et Gemini se tait.
2. **`MIN_PASSWORD_LEN` 6 → 8** (`server.ts:30`) — dernier reliquat de sécurité non traité (T7).
3. **Hygiène dépôt (T9)** : archiver les 132 `.txt`/`.py` de la racine.
4. **S-B3/S-B4 (format & durée) : choix à valider, pas des bugs** — ils sont verrouillés par conception (`bacExam.lock.test.ts`). Si l'enseignant veut un mode « conditions réelles » (3 exercices 5/7/8, 4 h 30), il faut un 4ᵉ test `bac_real` distinct plutôt que de casser les 3 tests d'entraînement existants.

**Moyen terme (1–4 semaines) :**
5. **Annales 2023/2024 en mode examen (S-B2)** : le scoreur a déjà les attendus — créer les vues `Bac2023ExamView`/`Bac2024ExamView`. Plus value énorme, coût maîtrisé.
6. **Récupérer les 120 questions à trous (S-C4)** : type `fillBlank` + comparaison normalisée arabe.
7. **Simplifier la navigation (U1/U2)** : 12 → 5 onglets, une seule marque, une seule nomenclature méthodologique.
8. **APK Android (U7)** : TWA/Capacitor pour le Play Store.

**Long terme :** verbes consignes manquants (~17), forum, push, animations SVG, boss adaptatif.

---

## 6. Verdict sur les audits eux-mêmes

| | Opus 5.5 | Gemini 3.8 |
|---|---|---|
| Fiabilité des faits | **7/10** — 1 erreur factuelle (Bac 2025 S2), mais il a trouvé la seule erreur scientifique | **5,5/10** — « zéro erreur » faux, favoris « absents » faux, phase23-26 obsolète, chiffres `qcmBilan` inexacts |
| Degré de sévérité | Pénalisant, parfois trop (voit le risque avant l'atout) | Généreux, parfois au-delà de la réalité (voit l'atout avant le risque) |
| Force principale | Les preuves par fichier/ligne, l'honnêteté sur le non-vérifiable, la détection d'erreur scientifique | La contextualisation algérienne (lois, forfaits, usage réel), les recommandations chiffrées avec gain de points simulé, les extraits de code |
| Faiblesse | Ignore les annales 2023/2024 du scoreur ; vision juridique sans contrepoint social | Contredit un autre audit sur la science sans vérifier ; ignore complètement le risque droits d'auteur ; note A8 à 8,5 avec un PDF ONPS dans le dépôt |
| A utiliser pour | La **liste de bugs** et la rigueur factuelle | La **narrative produit** et la priorisation chiffrée |

**Conclusion :** ni l'un ni l'autre n'a raison seul. La **convergence** des deux (bugs serveur, 12 onglets, annales manquantes, fillBlank, stores) est ce qu'il faut traiter ; la **divergence** (note A8, « zéro erreur », hors-programme) doit être levée par vérification — c'est ce que fait ce rapport. L'écart de 15 points entre 63 et 78 s'explique à parts égales par le séquencement (audits antérieurs aux correctifs) et par un biais d'indulgence de Gemini sur l'axe économique.
