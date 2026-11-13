# Vérification des constats de l'audit externe (zips du 2026-11-13)

**Objet.** Mesurer, sur le code réel, la_validité de chaque constat contenu dans
les deux rapports d'audit livrés dans `C:\Users\zakaria\Downloads\NEW`.

**Périmètre mesuré.** Branche `reorganisation-med`, HEAD `291dbbe` (2026-11-12),
arbre de travail tel quel (les modifications concurrentes non signées de
`src/bookTutorQA.ts`, `src/smartTutorEngine.ts`, etc. sont présentes et **n'ont pas
été modifiées** par cette vérification).

**Cible auditée par le tiers.** Commit `6cce20d` (`origin/master`, 2026-11-12 07:30),
c'est-à-dire **sans** les 23 commits de `reorganisation-med` (patch « workspace-arena »
du 2026-11-09). Ce décalage explique l'essentiel des écarts de statut ci-dessous.

---

## 0. Ce qui a été reçu

| Zip | Nature | Contenu |
|---|---|---|
| `audit-svt-bac-application.zip` | App Vite/React (1 page) | 8 axes, score global **80,0/100**, 15 recommandations, `src/data/audit.ts` (69 Ko) |
| `svt-bac-application-audit.zip` | App Next.js + Drizzle/PostgreSQL | Même audit, autre forme : notes **8,0 / 6,5 / 7,5 / 8,0 / 6,0 / 7,0 / 7,0 / 8,5** → **73,5/100** recalculé, 10 recommandations `R1`→`R10` |
| `audit-svt-bac-application (1).zip` | Ébauche | `App.tsx` de 1 Ko : sans contenu |
| `svt-bac-application-audit (1).zip` | Ébauche | `page.tsx` de 833 o : sans contenu |

Les deux versions pleines **ne sont pas le même audit** : l'audit Vite est plus
indulgent sur les contenus (A2 8,5 contre 6,5) et la banque BAC (A5 8,0 contre 6,0),
l'audit Next.js est plus indulgent sur la technique (A8 8,5 contre 6,5). La note
globale affichée (80,0) est cohérente avec ses propres pondérations ; celle de la
version Next.js (73,5) ne l'est pas davantage. Ces deux applications sont des
**rapports statiques**, pas des audits outillés : elles ne peuvent pas rejouer le
code.

---

## 1. Verdict en une ligne

Le diagnostic externe est **juste pour `master`** mais **périmé pour notre
branche** : sur les 15 recommandations, **5 sont déjà implémentées** (absentes de
`master`, présentes sur `reorganisation-med`), **4 sont reproduites à l'identique**,
**3 sont fausses ou mal interprétées**, **1 est plus grave que mesurée** (poids du
build local), **2 sont partiellement faites**.

---

## 2. Les trois « urgentes » du rapport

| Rang | Urgent annoncé par l'audit | Statut mesuré | Preuve |
|---|---|---|---|
| 1 | Sortir les 94 Mo de PDF du bundle, fixer un budget de poids total | **Confirmé, et plus grave en local** | Build du 2026-11-13 07:47 : `dist` = **283,17 Mo** (331 fichiers) = `apk` 176,00 + `bac-sujets` 93,58 + `assets` 9,10 + `lessons` 2,11 + `tutor` 1,26 + `fonts` 0,29 + `icons` 0,15. **Le build local embarque 2 APK de 88 Mo** (`public/apk/`, copiés par Vite). Hors APK (déploiement, `public/apk` est gitignoré) : **106,74 Mo** — c'est le chiffre de l'audit. Aucun garde-fou : `src/build/bundleBudget.test.ts` n'inspecte que `dist/assets` (plafond entrée 700 Ko — respecté : 556,1 Ko). |
| 2 | Test de positionnement initial + objectif de note | **Déjà fait sur la branche, absent de `master`** | `src/data/positionnementInitial.ts` (OBJECTIFS_NOTE 10/14/18, 3 profils), `src/components/ParcoursAssimilation.tsx` (onglets « positionnement » et « express J-7 »), câblage `DashboardView` → `dashboard-ouvrir-parcours`. `git cat-file -e 6cce20d:src/data/positionnementInitial.ts` → **absent de `master`**. |
| 3 | Recaler la pyramide de difficulté (D3 29 % contre 5 %) et durcir les validateurs | **Confirmé, et connu** | Mesure du 2026-11-13 : **531 QCM servis = 250 D1 / 127 D2 / 154 D3 → 47,1 % / 23,9 % / 29,0 %** ; cible déclarée 75/20/5 dans `src/quizCorpus/index.ts:55`. L'état est **verrouillé sciemment** : `src/__tests__/difficulteQcm.lock.test.tsx:59` fige « 531 = 250 + 127 + 154 » et le commentaire dit que le rééquilibrage se fera « par AJOUT (enseignant) ». Validateurs : `src/utils/fillBlankValidate.ts:43-55` = couverture de mots-porteurs ≥ 60 %, **aucun invariant** ; `src/components/LessonTwoView.tsx:127-139` = mots-clés (`includes('تثبيط')`) — une négation passe (constat L03-04). Les 10 codes de `src/data/errorTaxonomy.ts` servent d'**étiquettes de profil**, jamais d'invariants bloquants. |

---

## 3. Statut des 15 recommandations (rapport Vite)

| # | Recommandation | Statut | Preuve (2026-11-13) |
|---|---|---|---|
| R1 | Sortir les PDF du bundle + budget de poids | **Confirmé / aggravé** | Build 283,17 Mo en local ; garde-fou absent (`bundleBudget.test.ts` ne voit que `dist/assets`) |
| R2 | Test de positionnement de 20 questions | **Fait sur la branche** | `positionnementInitial.ts` + `ParcoursAssimilation.tsx` ; absent de `master` |
| R3 | Recaler la pyramide D1/D2/D3 + verrou de distribution | **Confirmé (état connu)** | 47,1 / 23,9 / 29,0 ; verrou actuel fige l'état, pas la cible |
| R4 | Durcir les validateurs (10 codes en invariants bloquants) | **Confirmé** | `fillBlankValidate.ts` (couverture seule), `LessonTwoView.validateW2` (mots-clés) |
| R5 | Signer et publier l'APK, corriger le README | **Partiel** | Signature release en place (`android/app/build.gradle`, keystore hors dépôt) ; README déjà corrigé (freemium 1 200 DA) ; reste la publication Play + `package.json` dont la `description` dit encore « gratuite » |
| R6 | Embarquer les corrigés des sessions 2020-2026 | **Confirmé** | `public/corrections/` **inexistant** (0 fichier) |
| R7 | Objectif de note + mode express J-7 | **Fait sur la branche** | `OBJECTIFS_NOTE` + onglet « express » de `ParcoursAssimilation` |
| R8 | Poids d'examen U8-U11 + étiquettes de priorité | **Partiel** | `src/data/unitOpenings.ts` : 7/11 poids (10+9+13+13+16+20+19 = 100), **U8-U11 absents** ; étiquettes de priorité présentes via `UnitIntroPortal` (65 idées BAC) |
| R9 | SM-2 sur le rappel du parcours + courbe d'oubli | **Partiel** | J+14 **toujours planifié** dans `src/lib/parcours/parcoursProgress.ts` et consommé par `nbaEngine.ts:33-40` (`NbaCard`) ; le SM-2 canonique (`src/lib/sm2.ts`) ne sert que `gestureRecallEngine` et `spacedRecallIntervals` ; une courbe d'oubli existe côté SRS (`PanneauSrs` / `bilanSrs`) mais pas sur le parcours |
| R10 | Diagnostic persistant + libellé par compétence | **Partiel** | `enregistrerErreurs` persiste la cause déclarée (`QuizView.tsx:234`) ; la formulation « unité · chapitre · notion » n'est pas vérifiée ici |
| R11 | Déplacer la synthèse + bandeau d'objectif | **Faux / mal interprété** | « الهدف scientifique » présent dans **25/25** leçons (`header.lesson-objectives`, ~5 % du texte). « خلاصة الدرس » présent 25/25, positionné à **39,7-50,5 %** du fichier **brut** (moyenne 47,5 %) — mais chaque fichier contient **2 chapitres**, chacun avec sa « خلاصة + تقويم » : la carte n'est pas « avant l'évaluation », elle est *entre* les deux activités |
| R12 | Quiz adaptatif à l'item + classement local | **Partiel** | `src/components/QuizAdaptatif.tsx` existe (opt-in, `QuizView`) ; **aucun classement local** (0 occurrence de leaderboard/classement) |
| R13 | Accessibilité : repères ARIA, clavier, reduced-motion, interface FR | **Partiel** | `<nav>` 2 occurrences, `<main>` 5, `prefers-reduced-motion` 1, `tabIndex` **1**, `aria-current` **0** → L02-03 (nœuds SVG non activables au clavier) toujours ouvert ; pas de bascule FR/AR |
| R14 | Statistiques par compétence et par type de sujet | **Confirmé (non fait)** | `src/components/StatsView.tsx` (1 355 lignes) : activité journalière, XP, jauge de progression par unité, courbe hebdomadaire — **aucun axe « compétence » ni « type de sujet »** (0 occurrence) |
| R15 | Boucler les rappels SM-2 sur les gains Hosila + nettoyer les constats | **Confirmé pour les constats** | `uploads_externes/` : **8 fichiers suivis** dont `504601676-…txt` et `FINALBAC_VOLUME_1.md` / `_2.md` (constat n° 1 ouvert) ; `bun.lock` toujours présent (constat n° 8) ; chiffres de tests du README périmés (« 294 fichiers / 3 465 tests ») (constat n° 7) ; ESLint (n° 4) **fermé** le 2026-11-10 (0 erreur, 0 warning) ; README « 100 % gratuite » (n° 3) **fermé** côté README ; CI `master` **verte** au 2026-11-12 06:30 (`gh run list`, run `43168610285`) → constat n° 2 **fermé** |

---

## 4. Mesures reproductibles

Toutes les mesures ci-dessus sont rejouables sans réseau.

```powershell
# Poids du build (local : les APK de public/apk sont copiés par Vite)
npm run build
Get-ChildItem dist -Directory | ForEach-Object {
  $x = Get-ChildItem $_.FullName -Recurse -File | Measure-Object Length -Sum
  "{0,-15} {1,10:N2} MB" -f $_.Name, ($x.Sum/1MB) }

# Distribution de difficulté (servi, après filtre T3a)
npx tsx -e "import {SVT_QUIZ_QUESTIONS as Q} from './src/quizCorpus/index.ts';
 const p=[1,2,3].map(d=>Q.filter(q=>q.difficulte===d).length); console.log(Q.length,p)"

# Leçons HTML : mots, position de « خلاصة الدرس », présence de « الهدف العلمي »
#   (script Node : strip balises, indexOf sur le texte puis sur le fichier brut)

# Validateurs / invariants
Get-Content src/utils/fillBlankValidate.ts            # couverture >= 0.6, aucun invariant
Get-Content src/components/LessonTwoView.tsx | Select-String validateW2
Get-Content src/data/errorTaxonomy.ts                 # 10 codes, étiquetage seul

# Poids d'examen par unité
Get-Content src/data/unitOpenings.ts | Select-String bacWeightPercent   # 7 valeurs sur 11

# État de la CI
gh run list --limit 6
```

## 5. Chaîne de vérification exécutée

| Étape | Résultat |
|---|---|
| `npm run lint` (tsc `--noEmit`) | **0 erreur** |
| `npm run build` (2026-11-13 07:47) | **exit 0** — 21,6 s + bundle serveur ; `dist` = 283,17 Mo (cf. supra) |
| `npx vitest run` (2026-11-13 07:49 → 07:53) | **363 fichiers / 4 089 tests — tous verts** (215 s) |
| `npx jest` (2026-11-13 07:54 → 07:56) | **353 suites / 4 021 tests — tous verts** (55 s) |
| Fichiers modifiés par cette vérification | **aucun fichier applicatif** (2 documents seulement) |

## 6. Suite de tests (mesure du 2026-11-13)

`vitest run` : **363 fichiers de test, 4 089 tests, 0 échec** (215,34 s).
`jest` : **353 suites, 4 021 tests, 0 échec** (54,79 s).
Ces chiffres sont mesurés **avec** les modifications concurrentes non signées
présentes dans l'arbre de travail ; ils ne valent donc pas référence pour l'état
de `291dbbe` seul.

---

## 7. Ce qui reste réellement ouvert, par priorité

1. **Poids de livraison** — sortir les PDF du `dist` servi (ou au minimum poser un
   garde-fou de budget **total**, APK exclus, sur `dist`), et traiter les 176 Mo
   d'APK copiés en local.
2. **Validateurs** — traiter les 10 codes de `errorTaxonomy.ts` comme invariants
   bloquants (négation, bases inversées, correspondance par mot-porteur seul), avec
   un corpus d'énoncés négatifs.
3. **Difficulté** — décider explicitement : rééquilibrage par ajout (comme le
   prévoit le verrou) ou requalification d'une partie des 154 items D3, puis
   aligner le verrou sur la cible.
4. **Poids d'examen U8-U11** — mesurer le poids observé sur les 11 sessions et
   publier la source (le domaine 3 = 25 h sur 108 h n'affiche aucun indicateur).
5. **J+14 → SM-2** sur le chemin `parcours` (la carte « tâche du jour » reste en
   échéance fixe).
6. **Corrigés BAC hors ligne** (`public/corrections/` inexistant).
7. **Constats ouverts du dépôt** : n° 1 (livres sous droits versionnés dans un
   dépôt public), n° 6 (générateurs non exécutables), n° 7 (chiffres du README),
   n° 8 (`bun.lock`), L02-03 (clavier sur les nœuds SVG).
8. **Fusionner `reorganisation-med` dans `master`** : 5 recommandations de l'audit
   externe (positionnement, objectif de note, express J-7, quiz adaptatif,
   glossaire) sont **réellement implémentées mais invisibles depuis `master`** —
   c'est la source de l'écart de notes entre les deux versions de l'audit.

## 8. Ce que l'audit externe a bien vu

- La rigueur de la méthode : 531/550 QCM, 250/127/154, 28 480 mots, 25 leçons,
  11 sessions, 108 Mo de build — **reproduits à l'identique** par nos mesures.
- Le décalage entre la cible de difficulté écrite dans le code et la réalité.
- La faiblesse des validateurs de réponses ouvertes.
- Le coût d'installation (APK + PDF) comme risque principal.
- Les limites assumées (référentiel 2017, absence de série EXP, absence de iOS,
  corpus de 40 copies = plancher et non validation).

## 9. Ce que l'audit externe s'est trompé sur

- « 0/25 leçon avec un objectif en tête » → **25/25** en ont un.
- « Aucun point d'entrée ni de sortie pour l'élève » → positionnement, objectif de
  note, mode express et glossaire existent sur la branche (absents de `master`,
  ce que l'audit a audité).
- « README annonce 100 % gratuite » → **corrigé** depuis le 2026-11-10.
- « CI rouge sur les runs 259-261 » → `master` est **verte** depuis le 2026-11-12.
- « ESLint en erreur » → **0 erreur, 0 warning** depuis le 2026-11-10.
- « 4 documents indisponibles (L03-03) » → les 6 `exerciseIds` concernés
  (`codon_anticodon`, `translation_schema`, `h1_h2_generic_double_doc`,
  `electro_hb`, `mutation_protein_function`, `uracile_marque`) sont résolus dans
  `src/data/`.
- « Glossaire lexical de 617 entrées non exposé en interface » → **nuancé** :
  les 617 entités de `src/data/dictionnaires/dictionnaireCorrecteur.ts` alimentent
  le **correcteur** (`CorrecteurPanel`, `baremeCorrecteur`, calibration BAC 2025) ;
  elles ne sont pas **parcourables** comme glossaire et ne sont pas bilingues.

## 10. Mesure complémentaire : langue du corpus

| Mesure | Valeur | Méthode |
|---|---|---|
| Tokens latins dans les 531 QCM servis | **4,8 %** (848 sur 17 776) | découpage `questionText` + `options`, tout token contenant une lettre latine |
| Nature de ces tokens latins | **100 % des acronymes scientifiques** (ATP 97, ARNm 43, CO₂ 33, ADN 30, O₂ 30, pH 21, VIH 17, ARN 16, ARNT 13, NAD+ 11…) — aucune prose française | comptage des 30 tokens latins les plus fréquents |
| Textes à trous servis | **121** | `FILL_BLANK_QUESTIONS.length` |

L'audit annonce « 2 % de tokens latins » : l'ordre de grandeur est bon (4,8 % par
notre comptage, qui inclut les acronymes), et la conclusion — **interface et
corpus monolingues arabes**, latins limités aux notations scientifiques — est
confirmée.
