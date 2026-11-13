import { BAC_MODE_POLICY } from "../../../data/bac-mode-policy.js";

const POLES = new Set(["N", "S", "E", "W"]);
const INVENTORY_STATUSES = new Set(["partial", "complete"]);
const MAPPING_KINDS = new Set(["direct", "decomposition"]);
const REVIEW_STATUSES = new Set(["provisional", "verified"]);
const DOCUMENT_STATUSES = new Set(["pending", "not-required", "reviewed"]);
const TASK_ID_PATTERN = /^\d{4}(?:-[a-z]{1,3})?-S[1-9]\d*-E[1-9]\d*-Q[1-9]\d*$/;

const closeEnough = (a, b) => Math.abs(a - b) < 1e-6;
const asArray = (value) => (Array.isArray(value) ? value : []);

function subjectExercises(subject) {
  return asArray(subject?.exercises);
}

function taskMappings(task) {
  return asArray(task?.trainingMappings);
}

function taskIsMapped(task, exerciseByNumber) {
  return taskMappings(task).some((mapping) => {
    const exercise = exerciseByNumber.get(mapping?.exerciseNumber);
    return exercise?.poles?.[mapping?.pole] && POLES.has(mapping.pole) && MAPPING_KINDS.has(mapping?.kind);
  });
}

/**
 * Audit an explicit official-task inventory against one training subject.
 * Unknown coverage is represented by null, never by a misleading zero or 100%.
 */
/* Un barème d'exercice est soit un nombre strictement positif, soit
   explicitement NON MESURÉ (`max: null`) : sur un PDF scanné ou aux chiffres
   corrompus, le barème officiel n'est pas extractible et recopier un nombre
   lu de travers produirait un barème faux. Un 0, un `undefined` ou un NaN
   reste une erreur de données — jamais une absence de mesure. */
export function exercisePointsKnown(exercise) {
  return exercise?.max !== null && (Number(exercise?.max) || 0) > 0;
}

/* Un sujet « copie libre » ne porte aucune consigne : la couche texte du
   PDF officiel est absente ou inexploitable, seule l'armature est encodée
   (fichiers du sujet, découpage lorsqu'il est mesurable). L'épreuve reste
   ouverte — le sujet se lit dans l'application et l'élève rédige — mais rien
   n'y est noté, faute de quoi corriger. */
export function isFreeAnswerSubject(subject) {
  const exercises = subjectExercises(subject);
  return (
    subject?.answerMode === "free" &&
    exercises.length > 0 &&
    exercises.every((exercise) => exercise.max === null || exercisePointsKnown(exercise)) &&
    Boolean(subject?.pdfLocalUrl || subject?.pdfExternalUrl)
  );
}

/** L'épreuve peut-elle s'ouvrir ? Oui pour un sujet inventorié, ou pour une
    armature « copie libre » — jamais pour un sujet sans rien à faire. */
export function examOpenable(report) {
  return Boolean(report?.simulationEligible || report?.freeAnswerEligible);
}

export function buildOfficialCoverageReport({ yearId, subject, inventory }) {
  const exercises = subjectExercises(subject);
  const exerciseByNumber = new Map(exercises.map((exercise) => [exercise.number, exercise]));
  const validExerciseNumbers = new Set(exerciseByNumber.keys());
  const subjectPoints = exercises.reduce((sum, exercise) => sum + (Number(exercise.max) || 0), 0);
  const errors = [];
  const blockers = [];

  if (!inventory) {
    return {
      yearId,
      subjectId: subject?.id ?? null,
      inventoryStatus: "missing",
      knownTaskCount: 0,
      mappedTaskCount: 0,
      knownTaskMappingPercent: null,
      overallTaskCoveragePercent: null,
      knownPoints: 0,
      subjectPoints,
      inventoriedExerciseNumbers: [],
      taskCompleteExerciseNumbers: [],
      errors,
      blockers: ["inventory-missing"],
      simulationEligible: false,
      freeAnswerEligible: isFreeAnswerSubject(subject)
    };
  }

  if (inventory.schemaVersion !== 1) errors.push("inventory schemaVersion must be 1");
  if (!INVENTORY_STATUSES.has(inventory.status)) errors.push("inventory status must be partial or complete");
  if (!inventory.source?.locator) errors.push("inventory source locator is required");
  // Une date de vérification n'est exigée que d'un inventaire qui se déclare
  // relu par un humain : un inventaire dérivé mécaniquement ne s'en invente pas.
  if (
    inventory.source?.humanVerified === true &&
    !/^\d{4}-\d{2}-\d{2}$/.test(inventory.source?.verifiedAt || "")
  ) {
    errors.push("human-verified inventory requires an ISO verifiedAt date");
  }

  const inventoriedExerciseNumbers = asArray(inventory.scope?.inventoriedExerciseNumbers);
  const taskCompleteExerciseNumbers = asArray(inventory.scope?.taskCompleteExerciseNumbers);
  for (const exerciseNumber of [...inventoriedExerciseNumbers, ...taskCompleteExerciseNumbers]) {
    if (!validExerciseNumbers.has(exerciseNumber))
      errors.push(`unknown exercise in inventory scope: ${exerciseNumber}`);
  }
  for (const exerciseNumber of taskCompleteExerciseNumbers) {
    if (!inventoriedExerciseNumbers.includes(exerciseNumber)) {
      errors.push(`task-complete exercise is not inventoried: ${exerciseNumber}`);
    }
  }

  const tasks = asArray(inventory.tasks);
  const ids = new Set();
  for (const task of tasks) {
    if (!TASK_ID_PATTERN.test(task?.id || "")) errors.push(`invalid official task id: ${String(task?.id)}`);
    const expectedTaskPrefix = `${yearId}-S${subject?.id}-E${task?.exerciseNumber}-Q`;
    if (!task?.id?.startsWith(expectedTaskPrefix))
      errors.push(`task id does not match its subject: ${task?.id}`);
    if (ids.has(task?.id)) errors.push(`duplicate official task id: ${task.id}`);
    ids.add(task?.id);
    if (!validExerciseNumbers.has(task?.exerciseNumber)) {
      errors.push(`unknown exercise for task ${task?.id}: ${String(task?.exerciseNumber)}`);
    }
    if (!inventoriedExerciseNumbers.includes(task?.exerciseNumber)) {
      errors.push(`task outside inventoried scope: ${task?.id}`);
    }
    if (!Number.isInteger(task?.order) || task.order < 1) errors.push(`invalid task order: ${task?.id}`);
    const pageKnown = Number.isInteger(task?.page) && task.page >= 1;
    if (!pageKnown && task?.promptSource !== "reconstructed") {
      errors.push(`invalid task page: ${task?.id}`);
    }
    if (
      Number.isInteger(task?.pageInPdf) &&
      Number.isInteger(inventory?.document?.pages) &&
      (task.pageInPdf < 1 || task.pageInPdf > inventory.document.pages)
    ) {
      errors.push(`task page outside delivered file: ${task?.id}`);
    }
    if (typeof task?.prompt !== "string" || !task.prompt.trim())
      errors.push(`missing task prompt: ${task?.id}`);
    if (!Number.isFinite(task?.maxPoints) || task.maxPoints <= 0) {
      errors.push(`invalid task maxPoints: ${task?.id}`);
    }
    if (!REVIEW_STATUSES.has(task?.scoringReviewStatus)) {
      errors.push(`invalid scoring review status: ${task?.id}`);
    }
    if (!DOCUMENT_STATUSES.has(task?.documentReviewStatus)) {
      errors.push(`invalid document review status: ${task?.id}`);
    }
    if (!Array.isArray(task?.documentRefs)) errors.push(`documentRefs must be an array: ${task?.id}`);
    const documentRefs = asArray(task?.documentRefs);
    if (task?.documentReviewStatus === "reviewed" && documentRefs.length === 0) {
      errors.push(`reviewed task has no documentRefs: ${task?.id}`);
    }
    for (const reference of documentRefs) {
      if (typeof reference?.id !== "string" || !reference.id.trim()) {
        errors.push(`document reference has no id: ${task?.id}`);
      }
      if (!Array.isArray(reference?.pages) || !reference.pages.length) {
        errors.push(`document reference has no pages: ${task?.id}`);
      } else if (reference.pages.some((page) => !Number.isInteger(page) || page < 1)) {
        errors.push(`document reference has invalid pages: ${task?.id}`);
      } else if (
        Number.isInteger(inventory?.document?.pages) &&
        reference.pages.some((page) => page > inventory.document.pages)
      ) {
        errors.push(`document reference beyond last page: ${task?.id}`);
      }
    }
    for (const mapping of taskMappings(task)) {
      if (!validExerciseNumbers.has(mapping?.exerciseNumber)) {
        errors.push(`mapping references unknown exercise: ${task?.id}`);
      }
      if (mapping?.exerciseNumber !== task?.exerciseNumber) {
        errors.push(`mapping crosses exercises: ${task?.id}`);
      }
      if (!POLES.has(mapping?.pole)) errors.push(`mapping has invalid pole: ${task?.id}`);
      else if (!exerciseByNumber.get(mapping.exerciseNumber)?.poles?.[mapping.pole]) {
        errors.push(`mapping references missing pole: ${task?.id}`);
      }
      if (!MAPPING_KINDS.has(mapping?.kind)) errors.push(`mapping has invalid kind: ${task?.id}`);
    }
  }

  for (const exerciseNumber of taskCompleteExerciseNumbers) {
    const exercise = exerciseByNumber.get(exerciseNumber);
    const taskPoints = tasks
      .filter((task) => task.exerciseNumber === exerciseNumber)
      .reduce((sum, task) => sum + (Number(task.maxPoints) || 0), 0);
    if (!closeEnough(taskPoints, Number(exercise?.max) || 0)) {
      errors.push(`task points do not match exercise ${exerciseNumber} maximum`);
    }
  }

  const mappedTaskCount = tasks.filter((task) => taskIsMapped(task, exerciseByNumber)).length;
  const everyPromptOfficial =
    tasks.length > 0 && tasks.every((task) => task.promptSource !== "reconstructed");
  const knownTaskCount = tasks.length;
  const knownPoints = tasks.reduce((sum, task) => sum + (Number(task.maxPoints) || 0), 0);
  const everyExerciseComplete =
    exercises.length > 0 &&
    exercises.every((exercise) => taskCompleteExerciseNumbers.includes(exercise.number));
  const everyScoreVerified =
    tasks.length > 0 && tasks.every((task) => task.scoringReviewStatus === "verified");
  const everyDocumentReviewed =
    tasks.length > 0 &&
    tasks.every((task) => ["not-required", "reviewed"].includes(task.documentReviewStatus));
  const everyTaskMapped = tasks.length > 0 && mappedTaskCount === tasks.length;
  const pointsComplete = closeEnough(knownPoints, subjectPoints);
  const everyExerciseInventoried =
    exercises.length > 0 &&
    exercises.every((exercise) => inventoriedExerciseNumbers.includes(exercise.number));

  if (inventory.status !== "complete") blockers.push("inventory-partial");
  if (!everyExerciseInventoried) blockers.push("exercise-not-inventoried");
  if (!everyExerciseComplete) blockers.push("exercise-inventory-incomplete");
  if (!everyTaskMapped) blockers.push("task-mapping-incomplete");
  if (!everyScoreVerified) blockers.push("scoring-unverified");
  if (!everyDocumentReviewed) blockers.push("documents-unreviewed");
  if (!pointsComplete) blockers.push("points-incomplete");
  if (errors.length) blockers.push("metadata-invalid");

  const inventoryComplete = inventory.status === "complete";
  // Règle stricte : rien n'est ouvert sans inventaire complet, barème vérifié
  // et documents relus. Elle reste la référence (et la cible) du projet.
  const strictEligible =
    inventoryComplete &&
    everyExerciseComplete &&
    everyTaskMapped &&
    everyScoreVerified &&
    everyDocumentReviewed &&
    pointsComplete &&
    errors.length === 0;
  /* Politique produit (data/bac-mode-policy.js) : le mode BAC est le seul mode
     et il doit être fonctionnel. Les exigences de CONTENU sont conservées
     (sujet inventorié, chaque exercice couvert, chaque tâche rattachée, points
     concordants, aucune erreur) ; seules les certifications humaines manquantes
     sont admises — et l'écran d'épreuve le dit à l'élève (voir
     BAC_MODE_NOTICES), sans jamais afficher de note. */
  const policy = BAC_MODE_POLICY;
  const relaxedEligible =
    policy.singleMode === true &&
    policy.allowPartialInventory === true &&
    (policy.allowReconstructedPrompts === true || everyPromptOfficial) &&
    policy.allowProvisionalScoring === true &&
    (policy.allowUnreviewedDocuments === true || everyDocumentReviewed) &&
    policy.requireInventoriedSubject === true &&
    knownTaskCount > 0 &&
    everyExerciseInventoried &&
    everyTaskMapped &&
    pointsComplete &&
    errors.length === 0;
  const simulationEligible = strictEligible || relaxedEligible;

  return {
    yearId,
    subjectId: subject?.id ?? null,
    inventoryStatus: inventory.status,
    knownTaskCount,
    mappedTaskCount,
    knownTaskMappingPercent: knownTaskCount ? (mappedTaskCount / knownTaskCount) * 100 : null,
    overallTaskCoveragePercent: inventoryComplete
      ? knownTaskCount
        ? (mappedTaskCount / knownTaskCount) * 100
        : 0
      : null,
    knownPoints,
    subjectPoints,
    inventoriedExerciseNumbers: [...inventoriedExerciseNumbers],
    taskCompleteExerciseNumbers: [...taskCompleteExerciseNumbers],
    errors,
    blockers: [...new Set(blockers)],
    simulationEligible,
    freeAnswerEligible: false
  };
}

/** Deny by default: a missing or partial inventory can never start simulation. */
export function assertSimulationEligible(report) {
  if (!report?.simulationEligible) {
    const blockers = report?.blockers?.join(", ") || "coverage-unknown";
    throw new Error(`simulation unavailable: ${blockers}`);
  }
  return true;
}
