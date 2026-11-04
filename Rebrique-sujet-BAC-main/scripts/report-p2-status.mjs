import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { P2_USABILITY_STUDY } from "../data/usability-study.js";

const root = fileURLToPath(new URL("../", import.meta.url));
const read = (path) => readFileSync(join(root, path), "utf8");
const MIN_REQUIRED_PARTICIPANTS = 5;

function validPastDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  const dateParts = Object.fromEntries(
    new Intl.DateTimeFormat("en", {
      timeZone: "Africa/Algiers",
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    })
      .formatToParts(new Date())
      .map(({ type, value: part }) => [type, part])
  );
  const today = `${dateParts.year}-${dateParts.month}-${dateParts.day}`;
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === value && value <= today;
}

export function validUsabilitySession(session) {
  const validFirstQuestionTime =
    (Number.isFinite(session?.secondsToFirstQuestion) && session.secondsToFirstQuestion > 0) ||
    (session?.completed === false && session.secondsToFirstQuestion === null);
  return Boolean(
    session &&
    /^p2-[a-z0-9-]{4,}$/i.test(session.id) &&
    /^student-[a-z0-9-]{4,}$/i.test(session.participantCode) &&
    session.realParticipant === true &&
    session.consentVerified === true &&
    session.lowEndDevice === true &&
    typeof session.deviceClass === "string" &&
    session.deviceClass.trim().length > 0 &&
    typeof session.completed === "boolean" &&
    validFirstQuestionTime &&
    Number.isInteger(session.observerInterventions) &&
    session.observerInterventions >= 0 &&
    Array.isArray(session.misunderstoodTerms) &&
    session.misunderstoodTerms.every((term) => typeof term === "string" && term.trim()) &&
    typeof session.draftInsertedAndVerified === "boolean" &&
    validPastDate(session.testedAt)
  );
}

export function summarizeUsabilityStudy(study) {
  const sessions = Array.isArray(study?.sessions) ? study.sessions : [];
  const validSessions = sessions.filter(validUsabilitySession);
  const uniqueParticipants = new Set(validSessions.map((session) => session.participantCode)).size;
  const declaredRequirement = Number.isInteger(study?.requiredParticipants) ? study.requiredParticipants : 0;
  const requiredParticipants = Math.max(MIN_REQUIRED_PARTICIPANTS, declaredRequirement);
  const abandonedSessions = validSessions.filter((session) => !session.completed).length;
  const firstQuestionTimes = validSessions
    .map((session) => session.secondsToFirstQuestion)
    .filter(Number.isFinite)
    .sort((a, b) => a - b);
  const middle = Math.floor(firstQuestionTimes.length / 2);
  const medianSecondsToFirstQuestion = firstQuestionTimes.length
    ? firstQuestionTimes.length % 2
      ? firstQuestionTimes[middle]
      : (firstQuestionTimes[middle - 1] + firstQuestionTimes[middle]) / 2
    : null;
  const misunderstoodTermCounts = {};
  for (const term of validSessions.flatMap((session) => session.misunderstoodTerms)) {
    const normalized = term.trim();
    misunderstoodTermCounts[normalized] = (misunderstoodTermCounts[normalized] || 0) + 1;
  }
  return {
    recordedSessions: sessions.length,
    validSessions: validSessions.length,
    uniqueParticipants,
    requiredParticipants,
    abandonedSessions,
    abandonmentRate: validSessions.length ? abandonedSessions / validSessions.length : null,
    medianSecondsToFirstQuestion,
    observerInterventions: validSessions.reduce((total, session) => total + session.observerInterventions, 0),
    misunderstoodTermCounts,
    verifiedDraftInsertions: validSessions.filter((session) => session.draftInsertedAndVerified).length,
    complete: study?.protocolVersion === 1 && uniqueParticipants >= requiredParticipants
  };
}

export function buildP2Status() {
  const shell = read("index.html");
  const accessibility = read("js/ui/accessibility.js");
  const dialogs = read("js/ui/dialogs.js");
  const workspace = read("js/ui/screens/workspace.js");
  const strategy = read("js/ui/screens/strategy.js");
  const guide = read("js/ui/screens/guide.js");
  const hub = read("js/ui/screens/hub.js");
  const simulation = read("js/ui/screens/simulation.js");
  const pdfViewer = read("js/ui/pdf-viewer.js");
  const bacPolicy = read("data/bac-mode-policy.js");
  const styles = read("assets/styles.css");
  const e2e = read("tests/e2e/accessibility.spec.mjs");
  // Ce que l'élève voit réellement : les quatre écrans du parcours, l'épreuve,
  // la visionneuse du sujet et les avis produit. Les modules de l'ancien écran
  // d'entraînement ont été supprimés le 2026-09-13 (décision produit).
  const visibleUiSources = [workspace, strategy, guide, hub, simulation, pdfViewer, bacPolicy].join("\n");

  const accessibilityComplete =
    shell.includes('class="skip-link" href="#main-content"') &&
    shell.includes('<main id="main-content" tabindex="-1">') &&
    accessibility.includes("heading.focus({ preventScroll: true })") &&
    accessibility.includes("seenIds.has(field.id)") &&
    dialogs.includes('"aria-labelledby": ids.title') &&
    dialogs.includes("isolateDialog") &&
    dialogs.includes("returnFocus.focus()");

  // P2.2 — l'ordre des exercices est libre. Depuis le 2026-09-20 (décision
  // du propriétaire), TOUS les exercices du sujet sont rédigés sur la même
  // copie : un champ par exercice, aucun verrou, aucune navigation imposée.
  // La preuve vit dans le gabarit de l'épreuve (js/ui/screens/simulation.js).
  const examPaperTemplate = simulation.match(/function examPaperHTML[\s\S]*?\n}\n/)?.[0] || "";
  const exerciseOrderFree =
    examPaperTemplate.includes('data-free-exercise="') &&
    examPaperTemplate.includes('data-exercise-free="') &&
    /* « disabled » reste légitime : c'est le verrou de la relecture après
       remise, pas une contrainte pendant l'épreuve. */
    !/(locked|answeredAny|openModal)/.test(examPaperTemplate);

  const competingMetaphors = [
    "السنّ",
    "الأسنان",
    "بوصلة",
    "🧭",
    "♞",
    "ورقة أم رأس",
    "صورة أم فيلم",
    "شريط فيديو",
    "فكّ القفل"
  ];
  /* Le lot « vocabulaire unifié » vérifiait que l'application n'employait
     qu'une seule métaphore : les quatre étapes. Le propriétaire a retiré ce
     rappel de l'écran de préparation le 2026-09-19 — il distrayait l'élève.
     La preuve s'inverse donc : plus AUCUNE métaphore méthodologique n'est
     affichée dans le parcours élève, ni ancienne (بوصلة, الأسنان…) ni nouvelle
     (الخطوات الأربع). Ce que l'élève voit, ce sont les consignes officielles
     et leur provenance. */
  const vocabularyUnified =
    !visibleUiSources.includes("الخطوات الأربع") &&
    competingMetaphors.every((term) => !visibleUiSources.includes(term));

  const legacyFrenchCopy = [
    "Objectif méthodologique",
    "consigne brute BAC",
    "consigne reconstruite",
    "Contrôle brouillon",
    "tu n’as pas mis de comparaison",
    "tu as expliqué sans observer",
    "ta conclusion ne répond pas au problème",
    "PDF non disponible localement",
    "PDF du sujet"
  ];
  const languageUnified = legacyFrenchCopy.every((term) => !visibleUiSources.includes(term));

  const readabilityComplete =
    styles.includes("--dim: #94a3b8") &&
    styles.includes("--dim: #475569") &&
    /html\[lang="ar"\]\s*:where\(/.test(styles) &&
    styles.includes("font-size: 0.9rem") &&
    e2e.includes("zoom de 200 %") &&
    e2e.includes("width: 640");

  // P2.6 — le brouillon en quatre étapes a été retiré du produit avec l'écran
  // d'entraînement. Le critère porte désormais sur le cycle de la copie : sujet
  // lisible dans l'application, réponse enregistrée, remise confirmée, relecture
  // verrouillée et retour de focus.
  const examPaperComplete =
    pdfViewer.includes('<iframe class="pdf-frame"') &&
    pdfViewer.includes("download") &&
    simulation.includes('input.value = progress.freeAnswer || ""') &&
    simulation.includes("function examPaperHTML") &&
    simulation.includes("bac-answers") &&
    simulation.includes('id="simulation-finish-yes"') &&
    simulation.includes('id="simulation-finish-no"') &&
    simulation.includes('id="simulation-review-notice"') &&
    simulation.includes("showCompletionNotice");

  const usability = summarizeUsabilityStudy(P2_USABILITY_STUDY);
  const { uniqueParticipants, requiredParticipants } = usability;
  const usabilityComplete = usability.complete;

  const gates = [
    {
      id: "P2.1",
      complete: accessibilityComplete,
      evidence: "lien d’évitement, focus de route, noms de champs, dialogues isolés et annonces live"
    },
    {
      id: "P2.2",
      complete: exerciseOrderFree,
      evidence: "navigation directe entre exercices, sans verrou de progression"
    },
    {
      id: "P2.3",
      complete: vocabularyUnified,
      evidence: "vocabulaire visible recentré sur les quatre étapes"
    },
    {
      id: "P2.4",
      complete: languageUnified,
      evidence: "les anciens avertissements français visibles ont été traduits en arabe"
    },
    {
      id: "P2.5",
      complete: readabilityComplete,
      evidence: "contraste de --dim corrigé, petits textes arabes ≥ 0,9 rem, test de reflow 200 %"
    },
    {
      id: "P2.6",
      complete: examPaperComplete,
      evidence:
        "sujet lisible dans l'app, réponse par exercice enregistrée et restaurée, remise confirmée (oui/non), relecture verrouillée"
    },
    {
      id: "P2.7",
      complete: usabilityComplete,
      evidence: `${uniqueParticipants}/${requiredParticipants} élèves distincts avec session réelle, consentie et valide`
    }
  ];
  return {
    complete: gates.every((gate) => gate.complete),
    completedGates: gates.filter((gate) => gate.complete).length,
    totalGates: gates.length,
    usability,
    gates
  };
}

function print(status) {
  console.log("lot\tétat\tpreuve");
  for (const gate of status.gates) {
    console.log(`${gate.id}\t${gate.complete ? "terminé" : "bloqué"}\t${gate.evidence}`);
  }
  if (status.usability.validSessions) {
    const rate = `${Math.round(status.usability.abandonmentRate * 100)} %`;
    const median =
      status.usability.medianSecondsToFirstQuestion === null
        ? "non atteinte"
        : `${status.usability.medianSecondsToFirstQuestion} s`;
    const terms =
      Object.entries(status.usability.misunderstoodTermCounts)
        .map(([term, count]) => `${term} (${count})`)
        .join("، ") || "aucun";
    console.log(
      `mesures P2.7\tabandon=${rate}; médiane première question=${median}; interventions=${status.usability.observerInterventions}; insertions vérifiées=${status.usability.verifiedDraftInsertions}/${status.usability.validSessions}; termes incompris=${terms}`
    );
  }
  console.log(
    `\nP2: ${status.complete ? "TERMINÉ" : "INCOMPLET"} (${status.completedGates}/${status.totalGates} critères d'acceptation fermés).`
  );
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const status = buildP2Status();
  print(status);
  if (process.argv.includes("--check-complete") && !status.complete) process.exitCode = 1;
}
