# Constats ouverts (relevés le 2026-10-26, non corrigés)

> Lu depuis `AGENTS.md`. Problèmes **réels** découverts pendant la réorganisation,
> hors de son périmètre. Classés par gravité. Supprimer une ligne quand elle est réglée,
> avec la preuve dans le commit.
>
> **Constat n° 4 (ESLint) RÉSOLU le 2026-11-10** — voir le bloc « Réponses » en bas :
> la règle « 0 erreur ET 0 warning » est désormais réellement vérifiable en local
> (le garde-fou était explosé : 11 575 erreurs issues d'artefacts de build et d'un
> projet vendorisé, tous deux désormais ignorés).
>
> **Audit externe vérifié le 2026-11-13** — deux rapports d'audit reçus en zip
> (`C:\Users\zakaria\Downloads\NEW`) auditaient le commit `6cce20d`
> (`origin/master`, 2026-11-12 07:30), **sans** les 23 commits de la branche
> `reorganisation-med` (patch « workspace-arena » du 2026-11-09). Cinq de leurs
> quinze recommandations sont donc **déjà implémentées sur la branche** et
> invisibles depuis `master` (positionnement initial, objectif de note, mode
> express J-7, quiz adaptatif, glossaire du Capitaine). Constats confirmés,
> périmés et faux : `docs/rapports/VERIFICATION_AUDIT_EXTERNE_ZIPS_2026-11-13.md`.
> Constats n° 2 et n° 3 ci-dessous sont **fermés** ; n° 10, 11 et 12 sont **ajoutés**.

| # | Gravité | Constat | Preuve | Qui décide |
|---|---|---|---|---|
| 1 | haute | Deux livres sous droits (L1 `الكتاب_المصحح_v1.0.md`, L2 `504601676-…txt`) sont versionnés dans un dépôt **public**, contre la règle de `docs/sources/README.md` | `git ls-files uploads_externes/` → 8 fichiers suivis ; dépôt `private: false` | propriétaire (retrait = réécriture d'historique) |
| 2 | haute | ~~CI `master` rouge (vitest, jest, `npm test`) sur les runs 259-261~~ → **RÉSOLU le 2026-11-13** : `master` est verte (run `43168610285`, 2026-11-12 06:30, `success`) | `gh run list --limit 6` | — |
| 3 | moyenne | ~~`README.md` annonce « 100 % gratuite »~~ → **RÉSOLU le 2026-11-13** : le README décrit le freemium (palier 1 gratuit, abonnement 1 200 DA). **Reste** : la `description` de `package.json` dit encore « gratuite » | `README.md:7-9` ; `package.json` (`description`) | propriétaire (texte public) |
| 5 | basse | En-tête de `src/server/facturation.ts` : « Unité 1 gratuite » ; code client : unités 1-5 (`UNITES_GRATUITES`) | décision du 25/10/2026 | mise à jour du commentaire |
| 6 | basse | Générateurs non exécutables depuis le dépôt : `book_to_json.py` (chemins Windows), `build_okacha.py` (source absente), `build_bac_exam.py` (sortie `bacExam.ts` absente) | `DONNEES_GENEREES.md` | — |
| 7 | basse | Chiffres de tests du `README.md` (18/10) périmés : le README dit « 294 fichiers / 3 465 tests » ; mesure du 2026-11-13 : **363 fichiers / 4 089 tests** (vitest) | `TESTS_ET_CI.md` | mise à jour du README |
| 8 | basse | Deux lockfiles (`package-lock.json` qui fait foi, `bun.lock` reliquat) | CI = `npm ci` | propriétaire |
| 9 | info | `docs/` mélange spécifications vivantes et audits datés ; non déplacés car une trentaine de fichiers du code citent leur chemin (dont `src/App.tsx`, protégé) | `git grep "docs/"` | — |
| 10 | haute | **Poids de livraison non gardé** : `npm run build` local produit un `dist` de **283,17 Mo** — Vite copie `public/apk/` (2 APK de 88 Mo, gitignorés) dans `dist`. Hors APK (déploiement) : **106,74 Mo**, dont **93,58 Mo de PDF** (`public/bac-sujets/`, 28 fichiers). Aucun test ne surveille le total : `src/build/bundleBudget.test.ts` n'inspecte que `dist/assets` (plafond d'entrée 700 Ko, respecté : 556,1 Ko) | `npm run build` puis `Get-ChildItem dist -Directory` ; rapport du 2026-11-13 : `docs/rapports/VERIFICATION_AUDIT_EXTERNE_ZIPS_2026-11-13.md` | propriétaire (arbitrage packaging) |
| 11 | haute | **Validateurs de réponses ouvertes non invariants** : `src/utils/fillBlankValidate.ts` ne mesure qu'une couverture de mots-porteurs ≥ 60 % (une négation passe) ; `src/components/LessonTwoView.tsx` (`validateW2`) valide sur mots-clés (`includes('تثبيط')`). Les 10 codes de `src/data/errorTaxonomy.ts` ne servent qu'à étiqueter le profil de l'élève | `CONSTATS_OUVERTS` L03-02 / L03-04 (inchangés) | propriétaire (règle pédagogique) |
| 12 | moyenne | **Difficulté hors cible, connue** : 531 QCM servis = 250 D1 / 127 D2 / 154 D3 → 47,1 % / 23,9 % / 29,0 % ; cible déclarée 75/20/5 (`src/quizCorpus/index.ts:55`). L'état est **verrouillé sciemment** par `src/__tests__/difficulteQcm.lock.test.tsx` (« rééquilibrage par AJOUT, par un enseignant ») | mesure du 2026-11-13 (`SVT_QUIZ_QUESTIONS`) | propriétaire (arbitrage : ajout vs requalification) |

## Audit MVP — ajouts vérifiés le 2026-10-30

Ces observations proviennent du lot F01–F05, Chromium réel sur serveur local
de développement (`67afd92`). Aucun correctif produit appliqué. Elles ne
réactualisent pas implicitement les constats historiques de la table ci-dessus.
Preuves, limites et recommandations : [lot 01](../audit-mvp/LOT01.md).

| Référence | Gravité | Constat reproduit | Fiche |
|---|---|---|---|
| L01-01 | Majeure | La sortie vers la liste efface le snapshot de la leçon active et empêche la reprise de l'avancement. | [F03](../audit-mvp/F03-lecons-actives.md) |
| L01-02 | Majeure | Après une leçon active à six blocs, la suivante à quatre blocs hérite du succès et affiche 6/4 sans être effectuée. | [F03](../audit-mvp/F03-lecons-actives.md) |
| L01-03 | Majeure | La recherche ouvre en invité la variante active U6 `phase11_chapitres_21_22` : son unité est recalculée à tort comme U1 par défaut. | [F04](../audit-mvp/F04-recherche.md) |
| L01-04 | Modérée | Un résultat HTML U6 affiche le paywall sans retour local ; la navigation principale reste disponible. | [F02](../audit-mvp/F02-lecons-html.md) |
| L01-05 | Modérée | La réinitialisation du parcours efface immédiatement validations et rappels sans confirmation ni annulation proposée. | [F05](../audit-mvp/F05-parcours.md) |

Le glossaire d'architecture a aussi été actualisé : 47 entrées HTML et 27 actives
dans le parcours, 29 définitions actives avec deux variantes classées HTML.
Ne pas présenter ces volumes comme un audit pédagogique exhaustif.

### Lot 02 — F06 à F10

Preuves et périmètres : [synthèse du lot 02](../audit-mvp/LOT02.md),
[journal central](../audit-mvp/JOURNAL.md). Aucun correctif produit appliqué.

| Référence | Gravité | Constat |
|---|---|---|
| L02-01 | Modérée | La reprise restaure les validations d'une leçon active, pas le brouillon en cours. |
| L02-02 | Modérée | Le clic sur un nœud D3 ouvre aussi le zoom global, qui masque les contrôles de carte. |
| L02-03 | Modérée | Les nœuds SVG cliquables n'ont pas de focalisation/activation clavier identifiée. |
| L02-04 | Majeure pédagogique | Le simulateur affiche « 3,0 = 3,2 » et valide l'immobilité : tolérance numérique non explicitée. |
| L02-05 | Mineure | Le potentiel d'action est étiqueté unité 2, au lieu de l'unité officielle 5. |

Précisions : une notation Hosila crédite les compteurs/XP mais aucun rappel SM-2
de ce point n'a été constaté ; le chrono QCM est indicatif dans le composant testé.
Les 262 tests ciblés et le typecheck sont verts ; ni la CI globale ni l'APK ne
sont validés par ce lot.

### Lot 03 — F11 à F15

Référence `9bccc8b`, aucun changement produit. [Preuves et limites](../audit-mvp/LOT03.md).
Les vues payantes sont testées avec un essai client simulé ; la facturation
authentifiée n'est pas validée. Le scénario invité du jalon est sans simulation.

| Référence | Gravité | Constat |
|---|---|---|
| L03-01 | Majeure | Le hub examens refuse l'invité, mais le jalon gratuit ouvre le QCM puis le bilan des trois domaines sans token. |
| L03-02 | Majeure pédagogique | `fillBlankValidate` accepte une négation et les associations de bases inversées avec les mêmes mots-porteurs. |
| L03-03 | Majeure sur les exercices concernés | Quatre documents indisponibles : `lecture_shifra` (2), `anemie_falciforme` (1), `seuil_integration` (1). |
| L03-04 | Majeure pédagogique | `LessonTwoView.validateW2` valide « لا يحدث تثبيط » grâce au seul mot `تثبيط`. |
| L03-05 | Modérée | La sortie de l'atelier de transcription efface ses réponses et sa progression, y compris après 100 %. |
| L03-06 | Mineure | Sur 390×844, le badge fixe de l'atelier recouvre les libellés de navigation mobile. |

Clarification de navigation : l'entrée `workshop` monte `LessonTwoView`, et non
`MethodologyCompilerView` ; le test `atelierFlux` couvre ce dernier. Les schémas
de mémoire sont dans Révision ; leur score est une auto-évaluation sur papier.
Les 246 tests ciblés et le typecheck sont verts ; aucune suite globale ni CI
distante relancée pour ce lot. Le bilan QCM ne persiste pas son diagnostic.

### Lot 04 — F16 à F20

Référence `9bccc8b`, aucun code ni barème modifié.
[Preuves, reproductions et limites](../audit-mvp/LOT04.md).

| Référence | Gravité | Constat |
|---|---|---|
| L04-01 | Mineure | Meftah transmet le verbe du lien BAC, mais le parent ouvre seulement l'index général. |
| L04-02 | Majeure pour l'impression | La carte React est tronquée en A4 et dépend du scroll ; l'HTML autonome produit quatre pages. |
| L04-03 | Majeure | Tadwin reste au palier 4 après une fiche, sans création supplémentaire ni changement d'unité. |
| L04-04 | Majeure pédagogique | Tadwin enregistre une production à 0 % et propose sa consolidation sans réécriture. |
| L04-05 | Modérée | Au palier autonome Tadwin, choix des clés et brouillon disparaissent au rechargement. |
| L04-06 | Majeure de workflow | L'invité approuve le fond dans la file locale : ce statut ne prouve pas une correction enseignante. |
| L04-07 | Majeure pour l'export | Le rapport de rédaction peut être imprimé vide ; remonter en haut fournit du contenu. |
| L04-08 | Modérée | La reprise d'une famille BAC non standard ouvre la famille par défaut et un champ vide, sans effacer le vrai brouillon. |

Mesure locale : 30 fichiers / 487 tests ciblés et typecheck verts. L'ICM et C2
ne sont pas une note de BAC ; les six groupes 2025 conservent la réserve humaine.
Pas de précision indépendante sur copies, de facturation ou de suivi enseignant
authentifié validés. Aucun de ces constats n'est corrigé par les documents.

## Réponses du 2026-11-10 — constat n° 4 (ESLint) : RÉSOLU

**Constat** : « ESLint : 1 erreur (`no-empty-object-type`) alors que la règle du
dépôt est « 0 erreur ET 0 warning ». » → `src/utils/acces.ts:192`.

**Ce que la vérification a réellement donné** (mesure du 2026-11-10, avant
correction) : `npm run lint:eslint` sortait **11 575 erreurs + 730 warnings** —
et **19 des 20** restants venaient du *code source*. Trois causes distinctes :

| Cause | Volume | Traitement |
|---|---|---|
| Artefacts de build Capacitor (`android/app/src/main/assets/public/**` = copie de `dist/`, et `android/app/build/intermediates/**`) — non suivis par git, jamais dans `public/**` (seul dossier ignoré) | 10 670 | `ignores` ESLint ajoutés (générés, pas du source) |
| Projet vendorisé tiers `Rebrique-sujet-BAC-main/**` (489 fichiers suivis, pdfjs minifié) | 1 635 | `ignores` ESLint ajoutés (ce n'est pas notre code) |
| Code source : 3 erreurs + 17 warnings | 20 | corrigés un par un (voir ci-dessous) |

**Corrections source** :
- `src/App.tsx` : `useEffect` du listener `kunz-web-tab-change` **remonté avant
  les retours anticipés** (quiz / portail d'unité / épreuve) — il était déclaré
  APRÈS, donc le nombre de hooks variait d'un rendu à l'autre (violation des
  règles des hooks, `react-hooks/rules-of-hooks` en erreur).
- `src/utils/acces.ts:192` : `{}` → `Record<string, never>` (le constat n° 4).
- `scripts/build_spaced_recall_auto.ts:121` : expression inutilisée
  (`record[id] = record[id] ?? [], (...)` en virgule) → réécrite en if explicite.
- 14 imports/variables inutilisés supprimés (`FAQView` × 8, `TadwinView`,
  4 tests) et 1 test renforcé (`tirageRappelTrois` : le tirage du jour précédent
  est maintenant asserts).
- `src/components/PanneauSrs.tsx` : 2 directives `exhaustive-deps` documentées
  (dépendance `srsVersion` volontairement « inutile » = rechargement du bilan)
  + 1 directive devenue inutile supprimée.

**Preuve** : `npm run lint:eslint` → **0 erreur, 0 warning** (sortie vide).
`npm run lint` (tsc) → 0 erreur. Suite complète vitest + jest vertes.
Le job `lint` de la CI n'exécute que `tsc` (le job `build-et-postbuild` fait
`npm run lint` puis `npm run build`) : la CI n'était pas menacée, mais le
garde-fou **local** était inutilisable après tout build APK — c'est ce qui
était réellement cassé.

