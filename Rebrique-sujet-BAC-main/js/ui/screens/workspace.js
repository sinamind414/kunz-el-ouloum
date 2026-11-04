/* ============================================================
   Écran de session — façade vers l'épreuve
   ------------------------------------------------------------
   Le produit ne propose plus qu'un mode : l'épreuve (mode BAC).
   L'ancien écran d'exercices d'entraînement — barre d'outils avec
   تلميح / مسودة / تقرير / إعادة تعيين, modèles de réponse et
   diagnostics N/S/E/W — a été retiré à la demande du produit.
   Cette façade garde le point d'entrée unique (enterExercise,
   renderWorkspace, handleSessionCompletion) et délègue tout à
   js/ui/screens/simulation.js.
   ============================================================ */
import { createSimulationController } from "./simulation.js";

export function createWorkspaceController(deps) {
  const {
    $,
    $$,
    bindMics,
    closeModal,
    goHome,
    micButton,
    officialCoverageForSubject,
    officialTaskInventoryFor,
    openDrawer,
    openModal,
    showScreen,
    store,
    timers,
    toast,
    yearObj,
    sujetObj
  } = deps;

  const simulationController = createSimulationController({
    $,
    $$,
    bindMics,
    closeModal,
    goHome,
    micButton,
    officialCoverageForSubject,
    officialTaskInventoryFor,
    openDrawer,
    openModal,
    showScreen,
    store,
    timers,
    toast,
    yearObj,
    sujetObj
  });

  function enterExercise(exerciseNumber) {
    store.setActiveExercise(exerciseNumber);
    renderWorkspace();
    showScreen("view-workspace");
  }

  function renderWorkspace() {
    simulationController.renderSimulation();
  }

  function handleSessionCompletion(reason = store.state.sessionEndReason) {
    simulationController.handleSessionCompletion(reason);
  }

  return { enterExercise, renderWorkspace, handleSessionCompletion };
}
