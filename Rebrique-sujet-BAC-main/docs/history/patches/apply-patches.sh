#!/bin/bash
# Historique : les patches de ce dossier sont déjà appliqués sur main (0cc7e44).
set -e
echo "Patches already applied on main (0cc7e44 / PR #14)."
echo "CI: quality.yml tracks main and arena/**"
echo "Archive: 16 entrees, dont 10 avec contentVerified: true (mesure: data/archive.js)"
echo "         6 entrees restent non verifiees; 2 trous documentes dans ARCHIVE.gaps."
echo "Nothing to apply."
if git apply --check docs/history/patches/ci-workflow-fix.patch 2>/dev/null; then
  echo "Note: ci-workflow-fix.patch could still apply — quality.yml may have drifted."
else
  echo "ci-workflow-fix.patch does not apply (already present). OK."
fi
