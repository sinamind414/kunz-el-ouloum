# copies_validation_m3 — LOT DE COLLECTE M3

Dossier de travail local pour la validation correcteur (30 copies
indépendantes — voir `../docs/rapports/M3_PROTOCOLE_VALIDATION_30_COPIES_2026-10-21.md`).

## Format attendu (identique au corpus racine, numérotation à partir de 101)

Un fichier `eleve_101.txt`, `eleve_102.txt`, … par copie :

```
=== eleve_101 ===
{réponse exercice 1 — texte intégral de l'élève}
{réponse exercice 2}
{réponse exercice 3}
SCORE: 11.5/20
```

- `SCORE:` dans chaque fichier OU un seul `RECAPITULATIF.txt` au format du
  corpus racine (recommandé : plus simple pour la double correction).
- AUCUN nom, lycée, école, date identifiable dans les textes.
- Interdits de provenance : toute copie des 40 `eleve_*.txt` du corpus de
  calibration ; toute copie des sujets blancs de l'app (correction circulaire).
- Répartition visée : ~15/15 S1/S2 · tous niveaux (≥ 5 copies < 5/20, ~15
  entre 5 et 12, ~10 > 12/20).

## Une fois le lot complet

```
npx tsx scripts/evaluer-copies.ts --dir copies_validation_m3 --out docs/M3_SUPERVISION.md
```

Ce dossier ne part PAS dans git automatiquement : ajouter les fichiers
explicitement, et uniquement des copies anonymisées.
