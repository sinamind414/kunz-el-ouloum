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
