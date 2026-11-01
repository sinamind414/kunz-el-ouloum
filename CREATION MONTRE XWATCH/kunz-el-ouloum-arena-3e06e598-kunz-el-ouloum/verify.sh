# ==========================================================
# verify.sh — vérifie que la BOUSSOLE v2 est bien en place
# Usage : cd <repo> && npm install --no-audit --no-fund && bash ../spec_kit/verify.sh
# ==========================================================
#!/usr/bin/env bash
set -u

PASS=0; FAIL=0
ok()   { echo "  ✓ $1"; PASS=$((PASS+1)); }
ko()   { echo "  ✗ $1"; FAIL=$((FAIL+1)); }
check_file() { [ -f "$1" ] && ok "$1 présent" || ko "$1 MANQUANT"; }
check_absent() { [ ! -f "$1" ] && ok "$1 supprimé (v2)" || ko "$1 devrait être supprimé en v2"; }
check_grep() {
  if [ -f "$1" ] && grep -q "$2" "$1" 2>/dev/null; then ok "$3"; else ko "$3 (introuvable : $2)"; fi
}
check_not_grep() {
  if [ -f "$1" ] && ! grep -q "$2" "$1" 2>/dev/null; then ok "$3"; else ko "$3 (encore présent : $2)"; fi
}

echo "════════════════════════════════════════════════"
echo " 1) Fichiers v2 attendus / supprimés"
echo "════════════════════════════════════════════════"
check_file src/data/boussoleData.ts
check_file src/components/BoussolePanel.tsx
check_file src/components/SwitchGateModal.tsx
check_file src/components/SwitchDrillModal.tsx
check_file src/components/SwitchDuoDemo.tsx
check_file src/components/BoussoleCardPrint.tsx
check_file src/components/QuarterTimerBar.tsx
check_file src/components/BoussoleIntroModal.tsx
check_file src/components/ProductionEvolutionPanel.tsx
check_file src/components/MethodologyGlobalStats.tsx
check_file src/utils/methodologyLog.ts
check_absent src/components/CompassRose.tsx
check_absent src/components/RitualCompassModal.tsx

echo
echo "════════════════════════════════════════════════"
echo " 2) Marqueurs de la v2 (4 étapes + مفتاح)"
echo "════════════════════════════════════════════════"
check_grep src/data/boussoleData.ts "اِقْرَأْ" "Étape 1 : اقرأ"
check_grep src/data/boussoleData.ts "اِرْبِطْ" "Étape 3 : اربط"
check_grep src/data/boussoleData.ts "اِخْتِمْ" "Étape 4 : اختم"
check_grep src/data/boussoleData.ts "هل الفعل يسمح بـ«لأنّ»؟" "La question du مفتاح"
check_grep src/data/boussoleData.ts "SWITCH_OPEN_VERBS" "Deux familles de verbes (interrupteur)"
check_grep src/data/boussoleData.ts "ERROR_ADDRESS_MAP" "Carte des erreurs → adresse"
check_grep src/data/boussoleData.ts "AID_LEVELS" "4 niveaux d'aide (axe horizontal)"
check_grep src/components/MethodologyCompilerView.tsx "تقرير البوصلة" "Rapport 5 lignes (مفتاح + 4 étapes)"
check_grep src/components/MethodologyCompilerView.tsx "SwitchGateModal" "Porte du مفتاح montée (10 s)"
check_grep src/components/MethodologyCompilerView.tsx "AID_LEVELS" "Pills = niveaux d'aide"
check_grep src/components/BoussolePanel.tsx "مفتوح ✓" "Lampe du مفتاح dans le fil d'étapes"
check_grep src/components/BoussolePanel.tsx "درّب المفتاح" "Bouton micro-drill 60 s"
check_grep src/components/BoussolePanel.tsx "BoussoleCardPrint" "Bouton fiche imprimable"
check_grep src/components/MethodologyCompilerView.tsx "SwitchDuoDemo" "Démo même document/2 consignes montée"
check_grep src/components/MethodologyCompilerView.tsx "QuarterTimerBar" "Chrono en quarts monté (niveau 4)"
check_grep src/components/MethodologyGlobalStats.tsx "خريطة الأخطاء" "Carte des erreurs par étape (تقدمي)"
check_grep src/utils/methodologyScorer.ts "REFERENT_VERBS" "missing_reference globale (9 verbes à document)"
check_grep src/utils/methodologyScorer.ts "switchContext" "Le مفتاح entre dans la correction"
check_grep src/utils/methodologyScorer.ts "وهذا لأن" "Gabarit «وهذا لأنّ» reconnu (ex_c3)"
check_grep src/utils/methodologyLog.ts "switchChoice" "Décision du مفتاح archivée dans le carnet"
check_grep src/components/MethodologyCompilerView.tsx "نتيجة غير موثوقة" "Bannière ⚠ مفتاح faux = résultat non fiable"
check_grep src/components/MethodologyCompilerView.tsx "غير مُقيَّم" "Étape 1 honnête (non évaluable sans مفتاح)"
check_grep src/components/MethodologyGlobalStats.tsx "أدرّب المفتاح الآن" "Remédiation cliquable depuis تقدمي"
check_grep src/components/SwitchDrillModal.tsx "round" "Drill : re-mélange à chaque relance"
check_grep src/components/SwitchDuoDemo.tsx "useState(true)" "Démo duo ouverte par défaut"
# — Correctifs d'assimilation (lot K/L) : le diagnostic devient réel et honnête —
check_grep src/utils/methodologyScorer.ts "compCriteriaRe" "Vraie règle : comparaison (comp_c2)"
check_grep src/utils/methodologyScorer.ts "juAcquisRe" "Vraie règle : تعليل (ju_c1-c4)"
check_grep src/utils/methodologyScorer.ts "valConfRe" "Vraie règle : تصديق (val_c2)"
check_grep src/utils/methodologyScorer.ts "REFERENT_VERBS" "missing_reference + missing_unit globaux"
check_not_grep src/components/MethodologyCompilerView.tsx "protein_synthesis: 92" "Matrice d'icm RÉELLE (plus de 92 % inventé)"
check_not_grep src/components/MethodologyCompilerView.tsx "missing_unit: 4" "Compteurs d'erreurs RÉELS (plus de 4/3/2/1)"
check_grep src/components/MethodologyCompilerView.tsx "matrixScores = React.useMemo" "Matrice calculée depuis le carnet"
check_grep src/components/MethodologyCompilerView.tsx "لم يُقيَّم بعد في هذه الوحدة" "Note d'honnêteté de la matrice"
check_grep src/components/MethodologyCompilerView.tsx "porte du مفتاح" "Porte du مفتاح rouverte au changement de verbe"
check_grep src/components/MethodologyCompilerView.tsx "repart du bon montant" "Timer restauré au retour de brouillon"
# — Duel Scoreur vs Boussole (lot M) : anti-faux-positifs d'agglutination arabe —
check_grep src/utils/methodologyScorer.ts "arPattern" "Frontières de mot arabes (anti «الأنسولين»⊃«لأن»)"
check_grep src/utils/methodologyScorer.ts "causalReg" "causalReg avec frontières (interpretation prématurée exacte)"
check_grep src/utils/methodologyScorer.ts "doubtReg" "doubtReg avec frontières (anti «العلاقة»⊃«لعل»)"
check_grep src/utils/methodologyScorer.ts "textNoDocRefs" "Numéros de documents exclus de missing_unit"
check_grep src/utils/methodologyScorer.ts "!== 'verb_schematic_v1' && !conclusionRegex" "Dessin exclu de missing_conclusion (étape 4 = مفتاح+عنوان)"
check_grep src/components/MethodologyGlobalStats.tsx "أولوية العلاج" "Étape la plus faible → remédiation"
check_grep src/App.tsx "BoussoleIntroModal" "Onboarding v2 monté dans App"
check_grep src/utils/methodologyLog.ts "getNavigatorGrade" "Grades conservés (couche motivation)"
check_grep src/utils/methodologyLog.ts "kunz_methodology_production_log_v1" "Carnet de bord (localStorage)"

# L'ancien lexique marin ne doit plus exister dans l'interface
if grep -rq "خريطة الرياح" src/components/ 2>/dev/null; then
  ko "Lexique « خريطة الرياح » encore présent (v1)"
elif grep -rq "كاب الشمال" src/components/ 2>/dev/null; then
  ko "Lexique « كاب » encore présent (v1)"
else
  ok "Lexique marin de la v1 absent de l'interface"
fi

if grep -q "mockCardData\|mockQuizHistory\|mockQuizTimeline\|monthlyUnitProgress" src/components/StatsView.tsx 2>/dev/null; then
  ko "StatsView contient encore des données mock"
else
  ok "StatsView : plus aucune donnée mock"
fi

echo
echo "════════════════════════════════════════════════"
echo " 3) Compilation TypeScript"
echo "════════════════════════════════════════════════"
if [ -f node_modules/.bin/tsc ]; then
  if node_modules/.bin/tsc --noEmit >/tmp/tsc_out.log 2>&1; then
    ok "tsc --noEmit : 0 erreur"
  else
    ko "tsc --noEmit a des erreurs (voir /tmp/tsc_out.log)"; head -12 /tmp/tsc_out.log
  fi
else
  echo "  ⚠ node_modules absent → lance : npm install --no-audit --no-fund"
fi

echo
echo "════════════════════════════════════════════════"
echo " RÉSUMÉ : $PASS ok · $FAIL ko"
echo "════════════════════════════════════════════════"
[ "$FAIL" -eq 0 ] && echo "✅ BOUSSOLE v2 EN PLACE — lance npm run dev pour tester dans le navigateur." || echo "⛔ $FAIL point(s) à corriger (vois SPEC_BOUSSOLE_NSOE.md)."
