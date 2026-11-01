import { setInternalHTML } from "../dom.js";
import { officialTaskInventoryFor } from "../../../data/official-tasks.js";
import { disposeAllPdfViewers, mountPdfViewers, pdfViewerHTML } from "../pdf-viewer.js";
import { examOpenable } from "../../domain/subjects/official-coverage.js";
import { simulationBlockersArabic } from "../coverage-messages.js";

/* Estimation QUALITATIVE, pas un barème : l'élève ne note pas son sujet sur
   20 points, il dit comment il se sent sur chaque exercice. Cinq niveaux,
   décidés par le propriétaire le 2026-09-19 — « estimer sur excellent,
   très bien, bien, moyen, besoin d'apprentissage ».

   Deux raisons de ne plus compter des points : le barème n'était pas mesurable
   sur les sessions alors en copie libre (Maths 2013–2020, SE 2021 — d'où
   « 0.00 نقطة » et « ت1: null (nullن) », bug corrigé ce jour-là ; toutes sont
   structurées 4D depuis le 2026-09-20), et noter
   sa propre copie sur 8 ou 12 points avant de l'avoir écrite n'a jamais rien
   mesuré. Une échelle de confiance, si. */
/* Le pourcentage n'est pas une note d'examen. C'est la lecture, en %, du
   choix de l'élève sur chaque exercice. « جيد » partout = 70 %. Le barème
   imprimé (5, 7, 8…) pèse : un exercice à 8 points compte plus qu'un
   exercice à 5. Le bouton ne rougit pas parce que le pourcentage est bas :
   il rougit seulement si l'autre sujet a une probabilité plus haute. */
export const CONFIDENCE_LEVELS = [
  { value: 4, label: "ممتاز", percent: 90 },
  { value: 3, label: "جيد جداً", percent: 80 },
  { value: 2, label: "جيد", percent: 70 },
  { value: 1, label: "متوسط", percent: 50 },
  { value: 0, label: "يحتاج تعلّماً", percent: 30 }
];

const PERCENT_BY_VALUE = new Map(CONFIDENCE_LEVELS.map((level) => [level.value, level.percent]));

function confidenceLabel(mean) {
  return CONFIDENCE_LEVELS.reduce((closest, level) =>
    Math.abs(level.value - mean) < Math.abs(closest.value - mean) ? level : closest
  ).label;
}

function clampLevel(value) {
  if (!Number.isFinite(value)) return null;
  return Math.min(4, Math.max(0, Math.round(value)));
}

/** Moyenne des % de chaque exercice. `weights` = barème imprimé, si mesuré. */
export function masteryPercent(values, weights) {
  const pairs = [];
  for (let index = 0; index < values.length; index += 1) {
    const level = clampLevel(Number(values[index]));
    if (level === null || !PERCENT_BY_VALUE.has(level)) continue;
    pairs.push({ percent: PERCENT_BY_VALUE.get(level), weight: Number(weights?.[index]) });
  }
  if (!pairs.length) return null;
  const canWeight = pairs.every((pair) => Number.isFinite(pair.weight) && pair.weight > 0);
  const totalWeight = canWeight ? pairs.reduce((sum, pair) => sum + pair.weight, 0) : pairs.length;
  const weighted = pairs.reduce((sum, pair) => sum + pair.percent * (canWeight ? pair.weight : 1), 0);
  return Math.round(weighted / totalWeight);
}

/** Rouge seulement si un autre sujet a une probabilité strictement plus haute. */
export function masteryBandAgainst(percent, otherPercents) {
  const rivals = (otherPercents || []).filter((value) => Number.isFinite(value));
  if (!Number.isFinite(percent) || rivals.length === 0) return "strong";
  return percent < Math.max(...rivals) ? "weak" : "strong";
}

export function createStrategyScreen(deps) {
  const {
    $,
    $$,
    enterExercise,
    goHome,
    helpers,
    officialCoverageForSubject,
    openModal,
    showScreen,
    store,
    timers,
    toast,
    yearObj
  } = deps;

  function goToStrategy() {
    renderStrategy(store.state.sujetId || 1);
    timers.startStrategy();
    showScreen("view-strategy");
  }

  function restoreStrategy() {
    renderStrategy(store.state.sujetId || 1);
    if (store.state.strategyRemaining > 0) timers.startStrategy();
    showScreen("view-strategy");
  }

  /* Le sujet s'affiche dans l'application : les PDF sont suivis dans le dépôt
     (subjects/**) et servis par la même origine, ce que la CSP autorise
     (frame-src 'self'). Le lien externe ne reste qu'en source de repli. */
  function pdfFallbackHTML(subject) {
    return pdfViewerHTML(subject);
  }

  function renderStrategy(sujetNum) {
    const year = yearObj(store.state.yearId);
    if (!year) return;
    setInternalHTML(
      $("#view-strategy"),
      `
    <div class="app app-wide">
      <header class="screen-head">
        <div class="brand">
          <button class="btn btn-rose btn-sm" id="strategy-exit">✕ إلغاء وخروج</button>
          <div class="brand-icon" aria-hidden="true">٤</div>
          <div><h2>اختر موضوع الإمتحان</h2>
          <p class="small text-muted">تصفّح وقدّر ثقتك في كل تمرين — 25 د.</p></div>
        </div>
        <div class="pill"><span class="text-dim">وقت الاختيار:</span><span class="mono" id="strategy-timer">25:00</span></div>
      </header>

      <div class="grid">
        <div class="card card-vign">
          <div class="flex spread strategy-preview-head">
            <span class="text-indigo bold small">📄 الموضوعان الرسميان:</span>
            <div class="flex gap-2">
              ${year.sujets
                .map(
                  (subject, index) =>
                    `<button class="btn ${index === 0 ? "btn-indigo" : "btn-purple"} btn-sm" data-preview="${subject.id}">الموضوع 0${subject.id}</button>`
                )
                .join("")}
            </div>
          </div>
          <div class="strategy-pdf-container" id="pdf-preview-container"></div>
        </div>
        <p class="subject-method-note">كنز العلوم يقترح طريقة لاختيار الموضوع الذي تتمكن فيه اكثر</p>
        <div class="grid grid-2">
          ${year.sujets
            .map((subject, index) => calcCard(year, subject, index === 0 ? "indigo" : "purple"))
            .join("")}
        </div>
      </div>
    </div>`
    );

    setPdfPreview(sujetNum);
    updateStrategyTimer();
    calculateStrategicScores();

    $("#strategy-exit").addEventListener("click", goHome);
    $$("#view-strategy [data-preview]").forEach((button) =>
      button.addEventListener("click", () => setPdfPreview(+button.dataset.preview))
    );
    $$("#view-strategy .calc-input").forEach((input) =>
      input.addEventListener("input", calculateStrategicScores)
    );
    $$("#view-strategy [data-confirm]").forEach((button) =>
      button.addEventListener("click", () =>
        confirmChoice(+button.dataset.confirm, button.dataset.sessionMode || "bac")
      )
    );
  }

  /* Barème MESURÉ ou barème NON MESURÉ : une armature « copie libre » porte
     `max: null`. L'additionner produisait « 0.00 نقطة » et « ت1: null (nullن) »
     sous chaque exercice — un écran de choix illisible, vu en Maths 2013–2020
     et en SE 2021. Quand le barème n'existe pas, il n'y a rien à estimer :
     ni champ de saisie, ni total chiffré, ni comparaison entre sujets. */
  function barèmeMeasurable(subject) {
    return (subject.exercises || []).every((exercise) => exercise.max !== null);
  }

  function calcCard(year, subject, theme) {
    const measurable = barèmeMeasurable(subject);
    const total = measurable ? subject.exercises.reduce((sum, exercise) => sum + exercise.max, 0) : null;
    const coverage = officialCoverageForSubject(year, subject);
    const inputs = subject.exercises
      .map((exercise) => {
        const name =
          exercise.wholeSubject === true
            ? "الموضوع كاملاً"
            : typeof exercise.label === "string" && exercise.label.trim()
              ? `ت${exercise.number}: ${exercise.label}`
              : `التمرين ${exercise.number}`;
        const points = exercise.max === null ? "" : ` (${exercise.max}ن)`;
        const options = CONFIDENCE_LEVELS.map(
          (level) =>
            `<option value="${level.value}"${level.value === 2 ? " selected" : ""}>${level.label}</option>`
        ).join("");
        return `<div class="flex spread"><label class="small" for="strategy-s${subject.id}-e${exercise.number}">${name}${points}</label><select class="field calc-input" id="strategy-s${subject.id}-e${exercise.number}" data-subject="${subject.id}" data-exercise="${exercise.number}" aria-label="تقدير الثقة في ${name}">${options}</select></div>`;
      })
      .join("");
    const officialTasks = (officialTaskInventoryFor(store.state.yearId, subject.id)?.tasks || []).filter(
      (task) => task.promptSource === "official"
    ).length;
    /* Armature « copie libre » : plus de note — la consigne à l'élève est
       dans l'épreuve (et « البارم غير مُقاس » suffit ici). */
    const inventoryNote = coverage.freeAnswerEligible
      ? ""
      : `<p class="small text-muted inventory-note" id="inventory-note-${subject.id}">جرد المهام: ${coverage.knownTaskCount} مهمة، منها ${officialTasks} تعليمة رسمية موثّقة.</p>`;
    return `
    <div class="card stack subject-card" data-subject-coverage="${coverage.inventoryStatus}" data-simulation-eligible="${coverage.simulationEligible}" data-exam-openable="${examOpenable(coverage)}" data-answer-mode="${coverage.freeAnswerEligible ? "free" : "inventory"}">
      <div>
        <div class="flex spread subject-card-head">
          <span class="badge badge-${theme}">الموضوع 0${subject.id}</span>
          <span class="mono small text-dim" data-bareme="${measurable ? "measured" : "unmeasured"}">${measurable ? `${total.toFixed(2)} نقطة` : "البارم غير مُقاس"}</span>
        </div>
        <div class="stack mt-1">${inputs}</div>
        <div class="flex spread small mt-1 subject-estimate">
          <span class="bold text-muted">مجموع تقدير الموضوع ${subject.id}:</span><span class="mono text-${theme}" id="s${subject.id}-total"></span>
        </div>
        <p class="small subject-mastery" id="s${subject.id}-mastery" aria-live="polite"></p>
      </div>
      <div class="stack subject-mode-actions">
        <div class="subject-start">
          <button class="btn btn-block btn-emerald" data-confirm="${subject.id}" data-session-mode="bac" data-mastery-band="strong">ابدأ الإمتحان</button>
          <span class="subject-start-percent mono" id="s${subject.id}-start-percent" aria-hidden="true"></span>
        </div>
        ${inventoryNote}
      </div>
    </div>`;
  }

  function setPdfPreview(subjectId) {
    const year = yearObj(store.state.yearId);
    const subject = year?.sujets.find((item) => item.id === subjectId) || year?.sujets[0];
    const box = $("#pdf-preview-container");
    if (box && subject) {
      // Chaque changement d'aperçu remplaçait le contenu sans libérer le
      // visionneur précédent : un document pdf.js et un listener resize
      // s'accumulaient à chaque clic.
      disposeAllPdfViewers(box);
      setInternalHTML(box, pdfFallbackHTML(subject));
      mountPdfViewers(box);
    }
    $$("#view-strategy [data-preview]").forEach((button, index) => {
      const active = +button.dataset.preview === subject?.id;
      const color = active ? (index === 0 ? "btn-indigo" : "btn-purple") : "btn-ghost";
      button.className = `btn btn-sm ${color}`;
    });
  }

  function updateStrategyTimer() {
    const timer = $("#strategy-timer");
    if (timer) timer.textContent = helpers.fmt(store.state.strategyRemaining);
  }

  function subjectEstimate(subject) {
    const samples = subject.exercises
      .map((exercise) => {
        const input = $(`[data-subject="${subject.id}"][data-exercise="${exercise.number}"]`);
        const level = clampLevel(Number.parseFloat(input?.value ?? ""));
        return level === null ? null : { level, weight: Number(exercise.max) };
      })
      .filter(Boolean);
    if (!samples.length) return null;
    const mean = samples.reduce((sum, sample) => sum + sample.level, 0) / samples.length;
    return {
      mean,
      percent: masteryPercent(
        samples.map((sample) => sample.level),
        samples.map((sample) => sample.weight)
      )
    };
  }

  function paintMastery(subjectId, percent, otherPercents) {
    const band = percent === null ? "" : masteryBandAgainst(percent, otherPercents);
    const note = $(`#s${subjectId}-mastery`);
    if (note) {
      note.textContent = percent === null ? "" : `انت متمكن في هذا الموضوع بنسبة ${percent}%`;
      note.classList.toggle("is-strong", band === "strong");
      note.classList.toggle("is-weak", band === "weak");
    }
    const beside = $(`#s${subjectId}-start-percent`);
    if (beside) {
      beside.textContent = percent === null ? "" : `${percent}%`;
      beside.classList.toggle("is-strong", band === "strong");
      beside.classList.toggle("is-weak", band === "weak");
    }
    const button = $(`#view-strategy [data-confirm="${subjectId}"]`);
    if (!button) return;
    /* Sans estimation, le bouton revient au neutre : sinon une couleur et
       un aria-label calculés sur une ancienne valeur resteraient affichés. */
    if (percent === null) {
      button.classList.add("btn-emerald");
      button.classList.remove("btn-rose");
      button.dataset.masteryBand = "strong";
      button.removeAttribute("aria-label");
      return;
    }
    button.classList.toggle("btn-emerald", band === "strong");
    button.classList.toggle("btn-rose", band === "weak");
    button.dataset.masteryBand = band;
    button.setAttribute("aria-label", `ابدأ الإمتحان، ${percent}%`);
  }

  function calculateStrategicScores() {
    const year = yearObj(store.state.yearId);
    if (!year) return;
    const estimates = year.sujets.map((subject) => ({ subject, estimate: subjectEstimate(subject) }));
    for (const { subject, estimate } of estimates) {
      const output = $(`#s${subject.id}-total`);
      if (output) {
        output.textContent =
          estimate === null ? "" : `${confidenceLabel(estimate.mean)} · ${estimate.mean.toFixed(1)}/4`;
      }
      const others = estimates
        .filter((item) => item.subject.id !== subject.id)
        .map((item) => item.estimate?.percent);
      paintMastery(subject.id, estimate?.percent ?? null, others);
    }
  }

  function confirmChoice(sujetNum, mode = "bac") {
    if (!store.isSessionActive()) return;
    const year = yearObj(store.state.yearId);
    const subject = year?.sujets.find((item) => item.id === sujetNum);
    if (!subject) return;
    // Filet de sécurité : un sujet sans inventaire exploitable reste fermé,
    // sauf armature « copie libre » — là, rien n'est noté mais l'épreuve est
    // réelle : le sujet se lit dans l'application et l'élève rédige.
    // Le `try/catch` qui enveloppait assertSimulationEligible était inatteignable :
    // cette fonction ne lève que si !simulationEligible, et l'appel était placé
    // dans la branche `if (coverage.simulationEligible)`. Le garde réel est le
    // test booléen ci-dessous — même table de vérité, une branche morte en moins.
    const coverage = officialCoverageForSubject(year, subject);
    if (!coverage.simulationEligible && !coverage.freeAnswerEligible) {
      toast(`الإمتحان مرفوض: ${simulationBlockersArabic(coverage.blockers)}`, "error");
      return;
    }
    store.activateSubjectMode(sujetNum, mode);
    timers.stopStrategy();
    // Writing starts here, in both modes: the official clock begins. In
    // simulation, activateSubjectMode has just reset the remaining time to the
    // full duration, so the strategy/breathing phase is never debited.
    timers.startGlobal();
    enterExercise(1);
    $("#global-timer-bar")?.classList.remove("hidden");
  }

  return { goToStrategy, restoreStrategy, pdfFallbackHTML, updateStrategyTimer };
}
