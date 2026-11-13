# Patches — historique

Le correctif CI (`ci-workflow-fix.patch`) est **déjà mergé** sur `main`
(`quality.yml` : `branches: [main, arena/**]`).

La vérification mécanique des 9 PDF bloqués est **déjà faite**
(`contentVerified: true` pour les 19 entrées).

`git apply patches/ci-workflow-fix.patch` échouera proprement s'il est
relancé (hunk déjà présent).
