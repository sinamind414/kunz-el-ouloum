# Prompt de session Antigravity — corrections 2022, hygiène Unicode, merge PR #10

> ⚠️ **Document historique (2026-08-27).** Il décrit la PR **#10**, aujourd'hui
> fermée/mergée, et des consignes de l'époque. L'état courant du dépôt est décrit
> par `CONTINUATION.md` (mise à jour du 2026-09-15) et l'audit
> `ANALYSE_LIGNE_PAR_LIGNE.md` ; la PR ouverte est la **#26**. Les règles
> permanentes listées ci-dessous restent valables telles quelles.

Tu travailles sur `Allintelligence2024/Rebrique-sujet-BAC`. La PR #10
(branche `arena/01a04067-rebrique-sujet-bac`, tête `5b8a2c3`) est **OPEN**, CI verte
(run 33063819918 sur le SHA exact). Elle ajoute l'année BAC 2022 (P1→P4) et a été
auditée par une session tierce : le travail est conforme, mais la relecture du texte
arabe a révélé des défauts OCR à corriger **avant merge**.

## Vérifications initiales obligatoires

```bash
git log --oneline -5 && git status --short
gh pr view 10 --json state,headRefOid,statusCheckRollup
npm ci && npm test          # attendu : 142/142 sur la tête de la PR
```

Si la PR #10 a déjà été mergée ou modifiée depuis `5b8a2c3`, constate l'état réel et
adapte-toi — ce prompt décrit l'état au 2026-08-27.

## Règles permanentes (inchangées)

- Ne fabrique jamais : copies d'élèves, témoignages, statistiques, résultats de tests.
  `tests/hard-benchmark/cases.json` reste `{"cases": []}`.
- Positionnement : outil de **couverture méthodologique**, jamais « correcteur ».
  `scorePromotionAllowed` reste faux.
- Le dépôt et les commandes exécutées sont la source de vérité, pas ce prompt.
- Provenance obligatoire pour tout contenu : URL, pages, date de relecture,
  `reconstructed` si le wording n'est pas recopié à l'identique.

---

## T1 — Appliquer les corrections de la relecture humaine (BLOQUANT pour le merge)

Le propriétaire relit le wording 2022 avec `docs/RELECTURE_2022_CHECKLIST.md` (sur la
branche de l'auditeur ; le fichier liste les 24 consignes avec pages PDF). S'il fournit
des corrections, applique-les sur la branche de la PR #10 **avant** merge.

Trois anomalies ont déjà été détectées mécaniquement — applique-les sauf contre-ordre
explicite du propriétaire après consultation du PDF officiel :

1. **A1 — `اللادوات` → `اللاذات`** (10 occurrences, bloc 2022, S1-E1). Le terme du
   programme est اللاذات (non-soi) ; اللادوات est une déformation OCR. Le fichier
   contient déjà 3× la forme correcte — unifie. Champs concernés : `desc`, `prompt`,
   `bacPrompt`, `bacPromptNotes` (aucun champ de matching — vérifié).
2. **A2 — `كسمه` → `أكسبه`** dans la citation du préambule (`bacPromptNotes` S1-E1-N),
   à confirmer sur le PDF p.1 avant correction (c'est une citation).
3. **A3 — yeh persan ی (U+06CC) → yeh arabe ي (U+064A)** : 101 occurrences dans le
   bloc 2022 (ex. الهیولي, الجینتامسین). Résidu OCR, typographiquement incorrect.
   Corrige-les dans les données 2022.

Après chaque correction : `npm test` (les tests 2022 valident les réponses modèles
contre leurs règles — si un remplacement casse un test, comprends pourquoi avant de
toucher au test).

## T2 — Corriger le bug Unicode PRÉEXISTANT dans le moteur (indépendant de la PR)

`normalizeArabic` (`data/subjects.js` l.18-33) ne normalise **pas** U+06CC (ی persan)
ni U+06A9 (ک persan) vers leurs équivalents arabes. Or **3 lignes `keywords`
préexistantes** (années antérieures, ~l.496 `الخلایا`, ~l.521 `العصبیه`, ~l.677
`فرضیه/انزیم`) contiennent le yeh persan dans des champs de MATCHING : un élève tapant
le ي arabe standard ne matche jamais ces mots-clés. Bug réel, antérieur à la PR #10.

- Ajoute `.replace(/[یى]/g, "ي")` (étendre la règle existante `[ىي]`→ي à U+06CC) et
  `.replace(/ک/g, "ك")` dans `normalizeArabic`.
- Ajoute un test unitaire : un mot écrit avec ی doit matcher son équivalent avec ي.
- Vérifie qu'aucun test existant ne régresse (142 attendus + les nouveaux).
- Ce correctif rend T1-A3 non critique pour le matching, mais T1-A3 reste requis pour
  l'affichage propre.

## T3 — Merger la PR #10

Conditions préalables, dans l'ordre :

1. Corrections T1 appliquées (ou confirmation écrite du propriétaire « aucune
   correction ») et T2 fait.
2. Suite complète verte en local : `lint`, `typecheck`, `format:check`, `docs:check`,
   `test`, `calibration` (toujours « non calibré », 0 copie), `build`.
3. Push sur la branche de la PR, attendre le run CI sur le **nouveau SHA de tête**
   (pas un run antérieur), vérifier `verify = success` via
   `gh pr view 10 --json statusCheckRollup`.
4. Merge : `gh pr merge 10 --squash` (ou `--merge` si le propriétaire préfère
   conserver les 3+ commits — demande-lui s'il est disponible, sinon squash).
5. Après merge : vérifie `origin/main`, lance `npm test` sur `main` fraîchement mergé.

**Ne merge PAS si** : le propriétaire n'a pas répondu sur la relecture ET qu'il a
explicitement demandé de ne pas merger sans elle. S'il a validé ce prompt tel quel,
considère les corrections A1/A2/A3 comme actées et le merge autorisé une fois T1+T2
verts.

## T4 — (si le temps le permet) Année BAC 2021, même méthode que 2022

Page identifiée : https://www.dzexams.com/ar/annales/alFTTFJIRFZuTFd4QnAvelFTQWRqUT09
Même exigences que la session précédente : sujets + corrigé officiel ONEC, croisement
avec une 2e source, barèmes/mots-clés dérivés du corrigé jamais inventés, notes de
provenance datées, aucun PDF commité, `data-integrity`/`data-selfcheck` couvrant la
nouvelle année, README et métriques mis à jour (`docs:check` vert).

**Vigilance OCR renforcée** (leçon de 2022) : avant d'encoder, scanne le texte extrait
pour les caractères persans (U+06CC, U+06A9), les mots déformés, et compare chaque
terme scientifique au corrigé. Ne reproduis pas les défauts que T1 corrige.

## Hors périmètre (inchangé)

- Corpus de calibration, promotion du score, métriques de fiabilité inventées.
- Audits accessibilité multi-écrans, police arabe, refonte UI.
- `.github/workflows/*` : le push de workflows a été **rejeté** la session dernière
  (permission `workflows` manquante sur le GitHub App). N'y touche pas ; si une
  modification de CI est indispensable, décris-la dans le rapport final pour que le
  propriétaire l'applique via l'interface GitHub.

## Rapport final attendu

1. Corrections T1 appliquées (liste exacte, avec occurrences remplacées) ; celles
   refusées et pourquoi.
2. T2 : diff de `normalizeArabic`, nouveaux tests, preuve de non-régression.
3. Merge : SHA de merge sur `main`, URL du run CI sur la tête finale de la PR.
4. Si T4 fait : mêmes exigences de provenance que la session 2022 (tableau
   sujet/exercice/pages/URLs).
5. Ce qui n'a pas pu être fait, et pourquoi — sans euphémisme.
