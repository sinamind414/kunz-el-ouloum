# Constats ouverts (relevés le 2026-10-26, non corrigés)

> Lu depuis `AGENTS.md`. Problèmes **réels** découverts pendant la réorganisation,
> hors de son périmètre. Classés par gravité. Supprimer une ligne quand elle est réglée,
> avec la preuve dans le commit.

| # | Gravité | Constat | Preuve | Qui décide |
|---|---|---|---|---|
| 1 | haute | Deux livres sous droits (L1 `الكتاب_المصحح_v1.0.md`, L2 `504601676-…txt`) sont versionnés dans un dépôt **public**, contre la règle de `docs/sources/README.md` | `git ls-files uploads_externes/` ; dépôt `private: false` | propriétaire (retrait = réécriture d'historique) |
| 2 | haute | CI `master` rouge (vitest, jest, `npm test`) sur les runs 259-261, alors que les commits annoncent des suites vertes | `server/store.pg.dates.test.ts` dépend du fuseau (passe en `TZ=Africa/Algiers`, échoue en UTC) — voir `TESTS_ET_CI.md` | correction du test |
| 3 | moyenne | `README.md` annonce « 100 % gratuite » alors que le freemium (essai 30 j, abonnement 1200 DA, codes) est en production | `src/server/facturation.ts`, `src/utils/acces.ts` | propriétaire (texte public) |
| 4 | moyenne | ESLint : 1 erreur (`no-empty-object-type`) alors que la règle du dépôt est « 0 erreur » | `src/utils/acces.ts:192` | correction simple |
| 5 | basse | En-tête de `src/server/facturation.ts` : « Unité 1 gratuite » ; code client : unités 1-5 (`UNITES_GRATUITES`) | décision du 25/10/2026 | mise à jour du commentaire |
| 6 | basse | Générateurs non exécutables depuis le dépôt : `book_to_json.py` (chemins Windows), `build_okacha.py` (source absente), `build_bac_exam.py` (sortie `bacExam.ts` absente) | `DONNEES_GENEREES.md` | — |
| 7 | basse | Chiffres de tests du `README.md` (18/10) périmés : 314 fichiers / 3 675 tests vitest aujourd'hui | `TESTS_ET_CI.md` | mise à jour du README |
| 8 | basse | Deux lockfiles (`package-lock.json` qui fait foi, `bun.lock` reliquat) | CI = `npm ci` | propriétaire |
| 9 | info | `docs/` mélange spécifications vivantes et audits datés ; non déplacés car une trentaine de fichiers du code citent leur chemin (dont `src/App.tsx`, protégé) | `git grep "docs/"` | — |

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
