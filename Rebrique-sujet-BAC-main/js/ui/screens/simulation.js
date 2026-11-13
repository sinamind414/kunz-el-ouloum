import { assertSimulationEligible } from "../../domain/subjects/official-coverage.js";
import { simulationBlockersArabic } from "../coverage-messages.js";
import { escapeHTML, setInternalHTML } from "../dom.js";
import { disposeAllPdfViewers, mountPdfViewers, pdfViewerHTML } from "../pdf-viewer.js";
import { debounce } from "../../application/debounce.js";

/* ÉPREUVE = LES EXERCICES DU SUJET, PAS LES QUESTIONS (décision du
   propriétaire, 2026-09-20). L'écran d'épreuve n'affiche plus AUCUNE
   question — ni officielle ni reconstruite. Comme le jour de l'examen,
   l'élève lit les questions dans le sujet officiel (PDF rendu lisible
   par l'application : CMaps + polices standard servies depuis la même
   origine) et rédige une réponse par exercice. L'écran porte :
     - les exercices DU sujet choisi (jamais ceux de l'autre sujet) ;
     - le barème mesuré de chaque exercice — dépendant de l'année et de
       la filière (SE : 5+7+8 ; Maths : 8+12, 10+10, 7+13… toujours
       20 pts par sujet) et le total quand il est entièrement mesuré.
   Les questions officielles restent encodées dans les inventaires
   (جرد المهام, calibration, tests d'intégrité) — elles ne sont simplement
   plus affichées à l'élève pendant l'épreuve. */
/* Barème MESURÉ ou barème NON MESURÉ : les deux s'affichent honnêtement.
   Sur un PDF scanné ou aux chiffres corrompus, le barème officiel n'est pas
   extractible — écrire « 0 نقطة » ferait croire à une donnée absente
   alors qu'elle est simplement inconnue. On le dit à la place. */
function pointsBadge(exercise) {
  return exercise.max === null
    ? `<span class="small text-muted">البارم غير مُقاس</span>`
    : `<span class="small text-muted">${Number(exercise.max) || 0} نقطة</span>`;
}

/* Quand le découpage du sujet n'a pas pu être mesuré (scan sans couche
   texte), la copie libre porte sur le sujet entier au lieu d'annoncer un
   « تمرين » que personne n'a compté. */
function exerciseBadge(exercise) {
  return exercise.wholeSubject === true
    ? `<span class="badge badge-indigo">الموضوع كاملاً</span>`
    : `<span class="badge badge-indigo">التمرين ${exercise.number}</span>`;
}

function exerciseHeading(exercise) {
  return typeof exercise.label === "string" && exercise.label.trim()
    ? `<h3>${escapeHTML(exercise.label)}</h3>`
    : "";
}

/* Total du sujet quand le barème de chaque exercice est mesuré. C'est le
   barème officiel de la session : il dépend de l'année et de la filière
   (toujours 20 pts par sujet dans le corpus actuel). Si un seul exercice
   n'est pas mesuré, on n'affiche pas de total faux. */
function examTotalBadge(subject) {
  const exercises = subject?.exercises || [];
  if (!exercises.length) return "";
  if (!exercises.every((exercise) => Number.isFinite(Number(exercise.max)))) return "";
  const total = exercises.reduce((sum, exercise) => sum + (Number(exercise.max) || 0), 0);
  const shown = Number.isInteger(total) ? String(total) : String(Number(total.toFixed(2)));
  return `<div class="flex spread mb-2"><span class="small bold text-muted">بارم الموضوع (${exercises.length} تمارين):</span><span class="badge badge-indigo" data-exam-total="${shown}">${shown} نقطة</span></div>`;
}

/** Pure renderer used by browser code and regression tests. */
export function examPaperHTML({ subject, completed = false, micButton = () => "" }) {
  /* Les bandeaux d'annonce (silence de l'épreuve, absence de note, renvoi
     au fichier) ont été retirés de la page de réponses à la demande du
     propriétaire. L'épreuve reste sans question affichée et sans note
     chiffrée : ce n'est plus annoncé par un bandeau. */
  const modeNotice = completed
    ? `<div class="feedback good mb-2" id="simulation-review-notice" role="status">تم التسليم. هذه شاشة إعادة القراءة؛ الإجابات مقفلة ولا تعرض أي نقطة آلية.</div>`
    : "";
  const exercises = (subject?.exercises || [])
    .map(
      (exercise) => `<article class="card stack simulation-task" data-free-exercise="${exercise.number}">
        <div class="flex spread simulation-task-head">
          ${exerciseBadge(exercise)}
          ${pointsBadge(exercise)}
        </div>
        ${exerciseHeading(exercise)}
        ${
          typeof exercise.desc === "string" && exercise.desc.trim()
            ? `<p class="small text-muted">${escapeHTML(exercise.desc)}</p>`
            : ""
        }
        <button type="button" class="btn btn-ghost btn-sm" data-exercise-pdf="${exercise.number}">📄 أسئلة التمرين ${exercise.number} في الملف</button>
        <label class="lbl" for="free-answer-${exercise.number}">إجابتك عن التمرين ${exercise.number}</label>
        <textarea class="field simulation-answer" id="free-answer-${exercise.number}" data-exercise-free="${exercise.number}" data-exercise="${exercise.number}" rows="10"${completed ? " disabled" : ""}></textarea>
        ${completed ? "" : micButton(`free-answer-${exercise.number}`)}
        ${
          completed
            ? `<button type="button" class="btn btn-ghost btn-sm qualitative-check" data-qualitative-free="${exercise.number}">تقييم نوعي</button><div class="feedback small qualitative-feedback" data-qualitative-result-free="${exercise.number}" aria-live="polite"></div>`
            : ""
        }
      </article>`
    )
    .join("");
  return `${modeNotice}
    ${examTotalBadge(subject)}
    <section class="card center stack bac-reading-card">
      ${pdfViewerHTML(subject, { showCover: false })}
    </section>
    <section class="stack bac-answers" aria-label="إجابات الموضوع">
      ${exercises}
    </section>`;
}

export function createSimulationController(deps) {
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
  let completionNoticeShown = false;

  function context() {
    const year = yearObj(store.state.yearId);
    const subject = sujetObj();
    const inventory = officialTaskInventoryFor(store.state.yearId, store.state.sujetId);
    const report = officialCoverageForSubject(year, subject);
    return { year, subject, inventory, report };
  }

  function restoreFreeAnswers(subject) {
    for (const exercise of subject.exercises) {
      const input = $(`[data-exercise-free="${exercise.number}"]`);
      if (!input) continue;
      const progress = store.exercise(store.state.yearId, store.state.sujetId, exercise.number);
      input.value = progress.freeAnswer || "";
    }
  }

  /* Synchronise le DOM vers l'état, sans rien sérialiser : c'est la partie
     bon marché, elle peut tourner à chaque frappe. */
  function collectAnswers() {
    /* Un champ de rédaction PAR EXERCICE (décision du propriétaire,
       2026-09-20) : plus aucun champ par tâche. */
    $$("#view-workspace [data-exercise-free]").forEach((input) => {
      const progress = store.exercise(
        store.state.yearId,
        store.state.sujetId,
        Number(input.dataset.exercise)
      );
      progress.freeAnswer = input.value;
      if (input.value.trim()) progress.answeredAny = true;
    });
  }

  /* store.save() resérialise TOUT l'état : le déclencher à chaque frappe
     saccade la saisie sur téléphone. Le regroupement est sans risque parce que
     chaque point de sortie appelle flushAnswers(). */
  const scheduleSave = debounce(() => store.save(), 350);

  /** Frappe en cours : état mis à jour tout de suite, écriture regroupée. */
  function persistAnswers() {
    collectAnswers();
    scheduleSave();
  }

  /** Écriture garantie et immédiate — remise de copie, changement d'exercice,
   *  page masquée. L'élève se voit promettre « حُفظت الإجابات محلياً » : cette
   *  promesse ne peut pas dépendre d'un minuteur. */
  function flushAnswers() {
    collectAnswers();
    scheduleSave.cancel();
    store.save();
  }

  /* Un onglet mis en arrière-plan ou fermé ne déclenchera pas le minuteur :
     on vide la file avant de perdre la main. `window` plutôt que `globalThis`
     parce que sous Node globalThis n'est pas une EventTarget : le filet serait
     silencieusement absent — donc impossible à tester, donc jamais vérifié. */
  let unloadGuardBound = false;
  function bindUnloadFlush() {
    if (unloadGuardBound) return;
    const target = globalThis.window || globalThis;
    if (!target?.addEventListener) return;
    unloadGuardBound = true;
    target.addEventListener("pagehide", flushAnswers);
    target.addEventListener("visibilitychange", () => {
      if (globalThis.document?.visibilityState === "hidden") flushAnswers();
    });
  }

  function qualitativeLabel(value) {
    const length = String(value || "").trim().length;
    if (!length) return "ضعيف — C — ابدأ بكتابة إجابتك.";
    if (length < 80) return "يحتاج إلى تطوير — C — أضف الملاحظة والشرح والنتيجة.";
    if (length < 220) return "جيد — B — إجابة مفهومة وقابلة للتحسين.";
    return "ممتاز — A — إجابة مفصلة ومنظمة.";
  }

  function bindQualitativeChecks() {
    $$("#view-workspace [data-qualitative-free]").forEach((button) => {
      button.addEventListener("click", () => {
        const exNum = Number(button.dataset.qualitativeFree);
        const input = $(`[data-exercise-free="${exNum}"]`);
        const output = $(`[data-qualitative-result-free="${exNum}"]`);
        if (output) output.textContent = qualitativeLabel(input?.value);
      });
    });
  }

  /* Filet de sécurité : si l'inventaire officiel est absent, partiel ou non
     éligible, la simulation « silencieuse » est impossible. On bascule sur le
     mode lecture — en l'annonçant explicitement, jamais à l'insu de l'élève. */
  const FALLBACK_NOTICE = {
    missing:
      "لا يوجد جرد رسمي لمهام هذا الموضوع: وضع الإمتحان غير متاح. تعرض هذه الشاشة الموضوع للقراءة وكتابة إجابات حرة فقط.",
    partial:
      "جرد المهام الرسمية لهذا الموضوع غير مكتمل: وضع الإمتحان غير متاح حتى اكتماله. تعرض هذه الشاشة الموضوع للقراءة وكتابة إجابات حرة فقط.",
    blocked:
      "لم يستوفِ هذا الموضوع شروط الأهلية للإمتحان. تعرض هذه الشاشة الموضوع للقراءة وكتابة إجابات حرة فقط."
  };

  function renderBacReadingMode(subject, fallbackReason = "") {
    const fallbackNotice = FALLBACK_NOTICE[fallbackReason]
      ? `<div class="feedback mid mb-2" role="status">${FALLBACK_NOTICE[fallbackReason]}</div>`
      : "";
    const screen = $("#view-workspace");
    screen?.setAttribute("data-session-mode", "bac");
    screen?.setAttribute("data-review-mode", "false");
    // Avant de remplacer le contenu : un visionneur monté reste sinon accroché
    // à `resize` et garde son document pdf.js ouvert sur un DOM déjà jeté.
    if (screen) disposeAllPdfViewers(screen);
    setInternalHTML(
      screen,
      `<div class="app app-wide bac-reading-mode">
        <header class="screen-head">
          <div class="brand">
            <button class="btn btn-rose btn-sm" id="bac-reading-home">الرئيسية</button>
            <div>
              <h2>قراءة الموضوع · الموضوع ${subject.id === 1 ? "الأول" : "الثاني"}</h2>
              <p>قراءة الموضوع المختار فقط — بدون تصحيح أو إجابة نموذجية</p>
            </div>
          </div>
          <span class="badge badge-indigo">PDF محلي</span>
        </header>
        ${fallbackNotice}
        <div class="feedback mid mb-2" role="note">هذا الموضوع منفصل عن الموضوع الثاني. لا توجد حلول أو إجابات نموذجية في هذا الوضع. إجاباتك تُحفظ محلياً لكل تمرين.</div>
        <section class="card center stack bac-reading-card">
          ${pdfViewerHTML(subject, { showCover: false })}
        </section>
        <section class="stack bac-answers" aria-label="إجابات الموضوع">
          ${subject.exercises
            .map((exercise) => {
              return `<article class="card stack"><h3>إجابة التمرين ${exercise.number}: ${escapeHTML(exercise.label)}</h3><textarea class="field simulation-answer" data-exercise-free="${exercise.number}" data-exercise="${exercise.number}" rows="8"></textarea><button class="btn btn-ghost btn-sm qualitative-check" data-qualitative-free="${exercise.number}">تقييم نوعي</button><div class="feedback small qualitative-feedback" data-qualitative-result-free="${exercise.number}" aria-live="polite"></div></article>`;
            })
            .join("")}
        </section>
      </div>`
    );
    $("#bac-reading-home")?.addEventListener("click", goHome);
    restoreFreeAnswers(subject);
    $$("#view-workspace [data-exercise-free]").forEach((input) =>
      input.addEventListener("input", persistAnswers)
    );
    bindQualitativeChecks();
    showScreen("view-workspace");
    // Après l'affichage : le conteneur a sa largeur réelle, le rendu est net.
    mountPdfViewers(screen);
  }

  /* L'épreuve universelle (décision du propriétaire, 2026-09-20) : les
     exercices du sujet + leur barème + le sujet officiel rendu lisible.
     Un champ de rédaction par exercice, le chronomètre officiel et
     « ✓ تسليم الورقة ». Aucune question affichée, aucun corrigé, aucune
     note automatique : les questions se lisent dans le sujet, comme le
     jour de l'examen. */

  function renderExamPaper(subject, inventory) {
    const completed = store.state.sessionStatus === "completed";
    const screen = $("#view-workspace");
    screen?.setAttribute("data-session-mode", "bac");
    screen?.setAttribute("data-review-mode", String(completed));
    /* Plus de mode « copie libre » : l'attribut data-answer-mode libre
       disparaît de l'écran — toutes les épreuves sont des copies
       d'exercices notées sur le barème officiel. */
    screen?.removeAttribute?.("data-answer-mode");
    if (screen) disposeAllPdfViewers(screen);
    setInternalHTML(
      screen,
      `<div class="app app-wide">
        <header class="screen-head">
          <div class="brand">
            <button class="btn btn-rose btn-sm" id="simulation-home">الرئيسية</button>
            <div>
              <h2>الإمتحان · الموضوع ${subject.id === 1 ? "الأول" : "الثاني"}</h2>
              <p>${completed ? "إعادة القراءة بعد التسليم" : "الأسئلة في ملف الموضوع — أجب عن كل تمرين في حقله"}</p>
            </div>
          </div>
          <span class="badge ${completed ? "badge-emerald" : "badge-rose"}">${completed ? "مُسلَّم" : "إمتحان"}</span>
        </header>
        <div class="workspace-tools" aria-label="أدوات الاختبار">
          <button class="btn btn-indigo btn-sm" id="simulation-pdf">📄 الموضوع</button>
          ${completed ? "" : `<button class="btn btn-rose btn-sm" id="simulation-finish">✓ تسليم الورقة</button>`}
        </div>
        ${examPaperHTML({
          subject,
          inventory,
          completed,
          micButton
        })}
      </div>`
    );
    $("#simulation-home")?.addEventListener("click", goHome);
    $("#simulation-pdf")?.addEventListener("click", () => openSubjectPdf());
    $("#simulation-finish")?.addEventListener("click", confirmFinish);
    /* Chaque exercice pointe vers sa page dans le fichier du sujet : le
       PDF est la source des questions, on y va directement. */
    $$("#view-workspace [data-exercise-pdf]").forEach((button) =>
      button.addEventListener("click", () => openSubjectPdf(Number(button.dataset.exercisePdf)))
    );
    restoreFreeAnswers(subject);
    $$("#view-workspace [data-exercise-free]").forEach((input) =>
      input.addEventListener("input", persistAnswers)
    );
    bindQualitativeChecks();
    bindMics($("#view-workspace"));
    bindUnloadFlush();
    showScreen("view-workspace");
    // Après l'affichage : le conteneur a sa largeur réelle, le rendu est net.
    mountPdfViewers(screen);
  }

  function renderSimulation() {
    const { subject, inventory, report } = context();
    if (!subject) {
      denyInvalidSimulation(report);
      return;
    }
    /* Décision du propriétaire (2026-09-20) : l'épreuve affiche les
       EXERCICES du sujet et leur barème — jamais les questions, qui se
       lisent dans le PDF officiel. */
    if (report?.simulationEligible) {
      try {
        assertSimulationEligible(report);
      } catch {
        renderBacReadingMode(subject, "blocked");
        return;
      }
      renderExamPaper(subject, inventory);
      return;
    }
    if (report?.freeAnswerEligible) {
      renderExamPaper(subject, inventory);
      return;
    }
    renderBacReadingMode(subject, inventory ? "partial" : "missing");
  }

  function openSubjectPdf(exerciseNumber = null) {
    const subject = sujetObj();
    if (!subject) return;
    const { inventory } = context();
    /* Ouvre le sujet à la première page de l'exercice demandé quand elle
       est connue (pageInPdf de l'inventaire) — sinon à la première page. */
    const firstPage = (inventory?.tasks || [])
      .filter((task) => Number.isInteger(exerciseNumber) && task.exerciseNumber === exerciseNumber)
      .map((task) => task.pageInPdf)
      .find((page) => Number.isInteger(page));
    const drawer = openDrawer(
      "right",
      `📄 وثيقة الموضوع ${subject.id === 1 ? "الأول" : "الثاني"}`,
      pdfViewerHTML(subject, { showCover: false, page: firstPage ?? null })
    );
    mountPdfViewers(drawer);
  }

  function denyInvalidSimulation(report) {
    timers.stopAll();
    if (store.isSessionActive()) store.leaveSession();
    toast(`الإمتحان مرفوض: ${simulationBlockersArabic(report?.blockers)}`, "error");
    goHome();
  }

  function confirmFinish() {
    if (!store.isSessionActive()) return;
    openModal(
      "تسليم الورقة",
      "بعد التسليم تُقفل الإجابات نهائياً وتبدأ إعادة القراءة. لا توجد نقطة آلية.",
      `<button class="btn btn-rose" id="simulation-finish-yes">نعم، سلّم الورقة</button>
       <button class="btn btn-ghost" id="simulation-finish-no" data-close="btn">لا، أكمل الإمتحان</button>`
    );
    $("#simulation-finish-yes")?.addEventListener("click", () => {
      // « حُفظت الإجابات محلياً » est affiché juste après : l'écriture doit
      // être effective avant, pas programmée.
      flushAnswers();
      store.finishSession("manual");
      timers.stopAll();
      // Le chronomètre s'efface avec la remise : il ne doit plus rien décompter.
      $("#global-timer-bar")?.classList.add("hidden");
      closeModal();
      completionNoticeShown = false;
      renderSimulation();
      showCompletionNotice("manual");
    });
  }

  function showCompletionNotice(reason) {
    if (completionNoticeShown) return;
    completionNoticeShown = true;
    openModal(
      reason === "time-expired" ? "انتهى وقت الإمتحان" : "تم تسليم الورقة",
      `<p>حُفظت الإجابات محلياً وأُغلقت الكتابة.</p>
       <p class="feedback mid">تبدأ الآن إعادة القراءة دون نقطة آلية. المراجع المعروضة تدريبية وليست تصحيحاً وزارياً.</p>`
    );
    const closeButton = $("[data-close='ok']");
    if (closeButton) closeButton.textContent = "راجع الإجابات";
  }

  function handleSessionCompletion(reason = store.state.sessionEndReason) {
    // Fin de temps ou remise automatique : même promesse d'enregistrement.
    flushAnswers();
    timers.stopAll();
    $("#global-timer-bar")?.classList.add("hidden");
    renderSimulation();
    showCompletionNotice(reason);
  }

  return { renderSimulation, handleSessionCompletion, persistAnswers, flushAnswers };
}
