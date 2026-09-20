# AUDIT de l'ingestion du manuel (master cb4afe6) — vérification indépendante

**Date** : 2026-09-20 · **Objet** : le commit `cb4afe6` (master) ajoute
`data/bookContent.json` (643 Ko), `data/bookContent.report.txt`, `scripts/book_to_json.py`.
**Méthode** : re-vérification de CHAQUE réclamation du `rule_compliance` du JSON par
mesures indépendantes (pas de confiance aux flags).

## Verdict global : INGESTION RÉELLE ET EXPLOITABLE — 3 réserves documentées

| Réclamation (rule_compliance) | Verdict indépendant | Preuve |
|---|---|---|
| R1 « no_fabrication » | ✅ texte réel, ⚠️ **non prouvable sur pièces** | `book.full_text` = 6 105 lignes / **319 774 car. / 76 % arabe** : couverture (« كتاب علوم الطبيعة والحياة ») → contenu → bibliographie (Bordas 2002). MAIS les sources (PDF 16 040 028 octets, OCR, « corrected_v1 ») ne sont **pas committées** — des hash SHA-256 seulement. La chaîne de traçabilité est dans `bookContent.report.txt`, pas dans git. |
| R2 « tdm_grid_55 » | ✅ **grille complète 3/11/55**… avec réserves | La grille existe (control_grid.structure). MAIS : titres AR de la grille = **mojibake** (`?????`), titres FR partiellement mojibake (« Si?ge »). Les titres AR fiables sont dans `book_tdm_clean.md` (dépôt). Croisement TDM↔texte refait par mes soins : **49/55 titres arabes normalisés se localisent** dans le texte ; 6 manqués = variantes OCR (ف: « الحزينات/الحثينات », ordre des mots pH). |
| R3 « errata_preserved » | ⚠️ **réclamation creuse en l'état** | `corrected_layer` ne contient que des compteurs (163 394 car.) — le TEXTE corrigé n'est pas dans le JSON ni dans git. Rien à vérifier, donc rien de « préservé » de façon démontrable. Les errata MOTEUR restent `src/data/manuelErrata.ts` (inchangé, correct). |
| R4 « divergences_reported » | ✅ | Les warnings sont honnêtes et visibles (encodage TDM perdu). |

## Ce que l'ingestion CHANGE (vraie victoire)

Le dépôt contient enfin la **source unique de vérité textuelle** réclamée depuis
l'audit du « rôle du manuel » : 319 774 caractères d'OCR greppable du livre
officiel (76 % d'arabe, qualitativement bon hors corruptibles locaux).

## Ce qui manque encore (avant les consommateurs)

1. **Positions des chapitres non persistées** : `book.markers.chapters` = vide —
   on ne peut pas encore découper le texte par chapitre sans re-localiser
   (49/55 verbatim + variantes à traiter).
2. **Le texte « corrigé v1.0 » absent** (280 742 octets hachés, non committés).
3. **Les sources brutes absentes** (PDF + OCR + corrected) — à committer (le PDF
   tient dans la limite GitHub) pour transformer les hash en preuves.

## Verrous ajoutés dans cette branche

`src/data/bookContent.lock.test.ts` : parse JSON · ≥300 000 car. · ≥70 % arabe ·
grille 3/11/55 exacte · localisation AR-TDM ≥ 49/55 (valeur figée mesurée) ·
`schema_version` présent.
