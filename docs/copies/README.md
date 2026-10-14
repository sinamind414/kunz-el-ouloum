# Corpus de copies — Gouvernance (F8)

**Date :** 2026-09-27
**Corpus :** 40 copies `eleve_01.txt` … `eleve_40.txt` + `RECAPITULATIF.txt` (notes prof)
**Statut :** anonymisé — les noms réels ont été remplacés par `ELEVE_01` … `ELEVE_40`.

## Base légale et finalité
- Finalité : étalonner le correcteur automatique SVT (mesure r, MAE, biais) — usage interne, supervision R4.
- Base : consentement des familles / autorisation pédagogique de l'établissement. À défaut, retirer la copie du corpus.

## Anonymisation
- `Nom : [prénom nom]` → `Code : ELEVE_01` (exemple fictif)
- `الاسم: [الاسم بالعربية]` → `الرمز: ELEVE_01`
- Aucune donnée identifiante ne doit être committée. Les fichiers `docs/copies-bac2025/**` sont gitignorés.

## Accès
- Accès minimal : mainteneur du correcteur uniquement.
- Ne jamais logger les textes bruts en production.

## Conservation
- Durée : jusqu'à publication du rapport de fiabilité par exercice, puis archivage chiffré.
- Suppression : `git rm eleve_*.txt` + purge historique si fuite antérieure (à valider, destructif).

## Rapport de supervision
- Généré par `npx tsx scripts/evaluer-copies.ts --dir "." --out docs/SUPERVISION_ACTUEL.md`
- Métriques publiées : Pearson r global et par exercice, écart moyen, |écart| moyen — voir `docs/SUPERVISION_ACTUEL.md`.

## Rejouer les vérifications sans le corpus (CI)

Le corpus n'étant pas versionné (dépôt public), les deux tests de
`src/data/dictionaries/correctionGenerosite.test.ts` qui le lisent se déclarent
**ignorés** quand il est absent — jamais verts en silence. Ils s'exécutent dès
que le fichier est présent :

```bash
KUNZ_CORPUS_ELEVE_18=/chemin/vers/eleve_18.txt npx vitest run \
  src/data/dictionaries/correctionGenerosite.test.ts
```

Un verrou permanent sur **copie synthétique** (même fichier de test) rejoue la
règle en CI : la déclaration d'abandon (« لا أعرف », « لم أتم ») doit laisser
note et plafonds strictement identiques. Décision du 2026-10-14 (H1) : un test
qui dépend d'un fichier absent doit le **dire**, pas rougir ni disparaître.
