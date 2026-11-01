# ==========================================================
# apply_patches.sh — BOUSSOLE v2 (4 étapes + مفتاح واحد)
# Usage :
#   base vierge (avant toute boussole) :  bash ../spec_kit/apply_patches.sh
#   base déjà en v1 (kit précédent)   :  bash ../spec_kit/apply_patches.sh --delta
# ==========================================================
#!/usr/bin/env bash
set -u

KIT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MODE="${1:-full}"

if [ "$MODE" = "--delta" ]; then
  PATCH_DIR="$KIT_DIR/patches_v2_delta"
  echo "🔄 MODE DELTA — application de la v2 par-dessus une base déjà en v1"
else
  PATCH_DIR="$KIT_DIR/patches"
  echo "📦 MODE FULL — application de tous les patches (base vierge, 0001 → 0005)"
fi

# --- 0. Garde-fous -------------------------------------------------
if [ ! -d .git ]; then
  echo "✗ Lance ce script depuis la racine du dépôt git."
  exit 1
fi

if ! git diff --quiet; then
  echo "✗ Modifications non commitées. Commite ou stash d'abord :"
  echo "    git status"
  echo "    git add -A && git commit -m 'wip avant boussole v2'"
  exit 1
fi

if ! git config user.name >/dev/null 2>&1; then
  echo "→ Identité git manquante, configuration locale :"
  git config user.name "Ton Nom"
  git config user.email "ton@email.com"
fi

# --- 1. Application en chaîne ------------------------------------
echo "Patches :"
ls -1 "$PATCH_DIR"/*.patch 2>/dev/null | sed 's|.*/||'
echo

FAILED=false
for p in "$PATCH_DIR"/*.patch; do
  echo "══════════════════════════════════════════════════════"
  echo "→ Application de : $(basename "$p")"
  if git am --3way "$p" 2>/tmp/git_am_err.log; then
    echo "  ✓ commit créé via git am"
  else
    echo "  ⚠ git am a échoué → tentative en git apply..."
    git am --abort >/dev/null 2>&1
    if git apply --check "$p" 2>/dev/null; then
      git apply "$p" && echo "  ✓ appliqué via git apply"
      git add -A && git commit -q -m "applied: $(basename "$p" .patch)"
    else
      echo "  ✗ CONFLIT IRRESOLUBLE. Détail :"
      head -8 /tmp/git_am_err.log
      echo "  → Ouvre SPEC_BOUSSOLE_NSOE.md et fais appliquer le lot concerné par ton agent IA."
      FAILED=true
      break
    fi
  fi
done

echo
if [ "$FAILED" = false ]; then
  echo "✅ Patches appliqués. Lance la vérification :"
  echo "   bash ../spec_kit/verify.sh"
else
  echo "⛔ Voir la SPEC pour la résolution manuelle."
fi
