/* ============================================================
   UI — rendu, routage entre écrans, boussole, exercices, toasts
   Facade stable : init, renderHub, notify, voiceEngine
   ============================================================ */

import {
  APP_CONFIG,
  examMinutesForYear,
  getLoadedYear,
  loadYear,
  normalizeArabic
} from "../data/subjects.js";
import { officialTaskInventoryFor } from "../data/official-tasks.js";
import { createSubjectSessionStarter } from "./application/subject-session.js";
import { buildOfficialCoverageReport } from "./domain/subjects/official-coverage.js";
import { store, helpers } from "./store.js";
/* Le moteur d'évaluation (evaluateText, scoreBac, METHOD_SCRIPTS…) n'est plus
   branché sur l'épreuve : aucune note n'est affichée à l'élève. Il reste
   exporté par js/engine.js pour les outils d'audit et de calibration, mais
   l'application ne doit plus le charger au démarrage. */
/* On importe les modules réels, pas la façade js/engine.js : celle-ci
   ré-exporte aussi le moteur d'évaluation (text-analysis, methodology,
   quality-checks — 2 500 lignes) qui n'est plus branché sur l'épreuve. Un
   import indirect suffisait à le faire charger et analyser au démarrage. */
import { timers } from "./application/timers.js";
import { soundEngine } from "./services/sound-engine.js";
import { createSpeechEngine } from "./services/speech-recognition.js";
import {
  announceScreen,
  associateFieldsWithInstructions,
  bindDiagnosticAnnouncements,
  ensureLiveRegions
} from "./ui/accessibility.js";
import { createDialogManager } from "./ui/dialogs.js";
import { escapeHTML, node, replaceContent, setInternalHTML, watchStickyHeaderOffset } from "./ui/dom.js";
import { createScreenNavigator } from "./ui/navigation.js";
import { mountOperationalStatus } from "./ui/operational-status.js";
import { createGuideScreen } from "./ui/screens/guide.js";
import { createHubScreen } from "./ui/screens/hub.js";
import { createStrategyScreen } from "./ui/screens/strategy.js";
import { createWorkspaceController } from "./ui/screens/workspace.js";
import { disposeAllPdfViewers, mountPdfViewers, pdfViewerHTML } from "./ui/pdf-viewer.js";
import { reportDiagnostic } from "./services/diagnostics.js";

const POLE = {
  N: { title: "الخطوة 1 · اقرأ", short: "اقرأ", cls: "emerald" },
  S: { title: "الخطوة 2 · اجمع", short: "اجمع", cls: "blue" },
  E: { title: "الخطوة 3 · اربط", short: "اربط", cls: "amber" },
  W: { title: "الخطوة 4 · اختُم", short: "اختُم", cls: "purple" }
};
const POLE_ORDER = ["N", "S", "E", "W"];
let hubScreen;
let guideScreen;
let strategyScreen;

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
// Les tiroirs affichent les sujets en PDF : fermer un tiroir doit libérer le
// document pdf.js et son listener resize, sinon chaque consultation s'accumule.
const dialogs = createDialogManager({ $, $$, onClose: (element) => disposeAllPdfViewers(element) });
const { openModal, closeModal, openDrawer } = dialogs;
const showScreen = createScreenNavigator({
  screens: () => $$(".screen"),
  onNavigate: (id, { initial = false } = {}) => {
    store.setActiveScreen(id);
    // Un écran masqué garde son DOM : sans cela, l'aperçu de sujet laissé sur
    // l'écran de stratégie restait accroché à « resize » pendant toute
    // l'épreuve. Sans risque parce que chaque showScreen(id) est précédé d'un
    // rendu de cet écran (renderHub/renderGuide/renderStrategy/renderWorkspace
    // et les trois rendus de simulation.js) : l'écran cible est toujours
    // remonté, donc jamais dépouillé de ses visionneuses.
    for (const screen of $$(".screen")) {
      if (screen.id !== id) disposeAllPdfViewers(screen);
    }
    associateFieldsWithInstructions(document.getElementById(id));
    announceScreen(document, id, { focus: !initial });
  }
});

function yearObj(id) {
  return getLoadedYear(id);
}
function yearMetadata(id) {
  return APP_CONFIG.years.find((year) => year.id === id);
}
function officialCoverageForSubject(year, subject) {
  return buildOfficialCoverageReport({
    yearId: year?.id,
    subject,
    inventory: officialTaskInventoryFor(year?.id, subject?.id)
  });
}
function sujetObj() {
  return yearObj(store.state.yearId)?.sujets.find((s) => s.id === store.state.sujetId);
}
function exDef(num) {
  return sujetObj()?.exercises.find((e) => e.number === num);
}

/* La zone de notifications est une région aria-live : créée en même temps que
   son contenu, elle n'est pas annoncée de façon fiable. `init()` la crée donc
   tôt. `toast()` la recrée au besoin plutôt que de sortir silencieusement —
   avant cela, toute notification émise avant `init()` était perdue sans trace
   (mesuré : `notify("…")` pré-init ne rendait rien). */
function ensureToastZone() {
  const existing = $("#toast-zone");
  if (existing) return existing;
  if (!document.body) return null;
  const zone = document.createElement("div");
  zone.id = "toast-zone";
  zone.className = "toast-zone";
  zone.setAttribute("aria-live", "polite");
  zone.setAttribute("aria-relevant", "additions text");
  zone.setAttribute("aria-label", "الإشعارات");
  document.body.appendChild(zone);
  return zone;
}

function toast(msg, type = "info", ms = 3500) {
  const zone = ensureToastZone();
  if (!zone) return;
  const t = node("div", {
    className: `toast ${type}`,
    attrs: { role: type === "error" || type === "warn" ? "alert" : "status", "aria-atomic": "true" }
  });
  t.append(node("span", { text: iconFor(type) }), node("div", { text: msg }));
  zone.appendChild(t);
  setTimeout(() => {
    t.classList.add("is-exiting");
    setTimeout(() => t.remove(), 250);
  }, ms);
}
function iconFor(type) {
  const map = { success: "✅", warn: "⚠️", error: "⛔", info: "💡" };
  return map[type] || "ℹ️";
}

const THEME_KEY = "boussole4d.theme";
function applyTheme(theme) {
  const value = ["dark", "light", "contrast"].includes(theme) ? theme : "dark";
  document.documentElement.dataset.theme = value;
  try {
    localStorage.setItem(THEME_KEY, value);
  } catch (error) {
    reportDiagnostic("theme.save", error, { value });
  }
}

export const voiceEngine = createSpeechEngine(toast);

function micButton(fieldId) {
  return `<button type="button" class="btn-mic" data-mic="${fieldId}">🎤 إملاء</button>`;
}
function bindMics(root = document) {
  $$("[data-mic]", root).forEach((btn) => {
    if (btn.dataset.micBound === "1") return;
    btn.dataset.micBound = "1";
    btn.addEventListener("click", () => {
      const input = $("#" + btn.dataset.mic);
      // Explain the privacy boundary before the browser permission prompt. The
      // app only receives a transcript and never stores an audio recording.
      openModal(
        "🎤 قبل تفعيل الإملاء الصوتي",
        "سيطلب المتصفح إذن الميكروفون الآن. قد يعالج المتصفح الصوت عبر محركه الخاص؛ لا تحفظ منصة مفتاح الكنز أي تسجيل صوتي، ولا تستقبل إلا النص المحوّل. يمكنك الرفض ومواصلة الكتابة يدوياً.",
        '<p class="small text-muted">راجع سياسة الخصوصية لمزيد من التفاصيل.</p>'
      );
      const modal = $(".overlay:last-child");
      $("[data-close='ok']", modal)?.addEventListener("click", () => voiceEngine.start(input), {
        once: true
      });
    });
  });
}

const ADKAR = [
  {
    title: "دعاء بداية الامتحان",
    ar: "اللهم لا سهل إلا ما جعلته سهلا وأنت تجعل الحزن إذا شئت سهلا.",
    note: "يُستحب عند الشروع."
  },
  {
    title: "سورة طه",
    ar: "رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي وَاحْلُلْ عُقْدَةً مِنْ لِسَانِي يَفْقَهُوا قَوْلِي.",
    note: "سورة طه — دعاء موسى عليه السلام."
  },
  { title: "الاستعاذة", ar: "أعوذ بالله من الشيطان الرجيم.", note: "قبل القراءة والتركيز." },
  { title: "التوكل", ar: "حسبي الله ونعم الوكيل.", note: "عند القلق." },
  { title: "طلب العلم", ar: "ربِّ زدني علما.", note: "أثناء المراجعة." },
  { title: "خاتمة الجلسة", ar: "الحمد لله الذي بنعمته تتم الصالحات.", note: "بعد التسليم." }
];

function adkarHTML() {
  return `<div class="adkar-section">
    <strong class="text-emerald">أدعية وأذكار الامتحان</strong>
    <div class="adkar-grid">
      ${ADKAR.map((a) => `<div class="adkar-card"><div class="adkar-title">${a.title}</div><div class="adkar-arabic">${a.ar}</div><div class="adkar-note">${a.note}</div></div>`).join("")}
    </div>
  </div>`;
}
function openAdkar() {
  openModal("أدعية وأذكار الامتحان", adkarHTML());
}

function cycleSound(btn) {
  const mode = soundEngine.cycle();
  if (btn) {
    btn.classList.toggle("active", mode !== "off");
    btn.textContent = mode === "off" ? "🔇 صوت" : `🔊 ${mode}`;
  }
}

export function renderHub() {
  return hubScreen.renderHub();
}

function goHome() {
  timers.stopAll();
  soundEngine.stop();
  // Un visionneur monté dans l'espace de travail resterait accroché à `resize`
  // pendant tout le temps passé sur le hub : on le libère en quittant l'écran.
  disposeAllPdfViewers();
  if (store.isSessionActive()) store.leaveSession();
  renderHub();
  showScreen("view-hub");
  $("#global-timer-bar")?.classList.add("hidden");
}

function renderGuide(year) {
  return guideScreen.renderGuide(year);
}
function goToStrategy() {
  return strategyScreen.goToStrategy();
}
function pdfFallbackHTML(subject) {
  return strategyScreen.pdfFallbackHTML(subject);
}

function formatDuration(minutes) {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours}س${String(rest).padStart(2, "0")}د` : `${hours}س`;
}

let workspaceController;
function enterExercise(exerciseNumber) {
  return workspaceController.enterExercise(exerciseNumber);
}
function renderWorkspace() {
  return workspaceController.renderWorkspace();
}

function fmtPts(n) {
  return `${(+n).toFixed(2)}ن`;
}
function short(text, n = 7) {
  const words = String(text || "").split(" ");
  return words.length <= n ? text : words.slice(0, n).join(" ") + "…";
}

const startSession = createSubjectSessionStarter({
  appConfig: APP_CONFIG,
  renderGuide,
  showScreen,
  store,
  timers,
  toast,
  timerBar: () => $("#global-timer-bar"),
  helpers,
  $
});

hubScreen = createHubScreen({
  $,
  $$,
  APP_CONFIG,
  applyTheme,
  closeModal,
  cycleSound,
  enterExercise,
  examMinutesForYear,
  formatDuration,
  openAdkar,
  mountPdfViewers,
  openDrawer,
  openModal,
  pdfViewerHTML,
  startSession,
  store,
  timers,
  yearObj
});
guideScreen = createGuideScreen({
  $,
  $$,
  adkarHTML,
  examMinutesForYear,
  formatDuration,
  goHome,
  goToStrategy,
  store,
  openModal
});
strategyScreen = createStrategyScreen({
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
});

workspaceController = createWorkspaceController({
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

export async function init() {
  ensureLiveRegions(document);
  mountOperationalStatus(document, globalThis.window);
  bindDiagnosticAnnouncements(window);
  store.load();
  let savedTheme = "dark";
  try {
    savedTheme = localStorage.getItem(THEME_KEY) || "dark";
  } catch (error) {
    reportDiagnostic("theme.load", error);
  }
  applyTheme(savedTheme);

  let bar = $("#global-timer-bar");
  if (!bar) {
    bar = document.createElement("div");
    bar.id = "global-timer-bar";
    bar.className = "global-timer-bar hidden";
    const timerLabel = node("span", {
      className: "global-timer-label text-emerald bold",
      text: "● وقت الجلسة"
    });
    const timerValue = node("span", { className: "global-timer-value mono bold" });
    timerValue.append(
      "⏳ ",
      node("span", { text: helpers.fmt(store.state.globalRemaining), attrs: { id: "global-timer" } })
    );
    replaceContent(bar, [timerLabel, timerValue]);
    document.body.prepend(bar);
    watchStickyHeaderOffset(bar);
  }

  timers.onChange = (which) => {
    const t = $("#global-timer");
    if (t) t.textContent = helpers.fmt(store.state.globalRemaining);
    if (which === "strategy") strategyScreen.updateStrategyTimer();
    if (which === "global" && store.state.sessionStatus === "completed") {
      if (store.state.activeScreen === "view-workspace") {
        workspaceController.handleSessionCompletion("time-expired");
      } else {
        timers.stopAll();
        renderHub();
        showScreen("view-hub");
        bar.classList.add("hidden");
        toast("انتهى وقت الجلسة وحُفظ التقدم.", "warn");
      }
    }
  };

  ensureToastZone();

  /* Une copie rendue reste relisible après rechargement : la relecture est
     restaurée comme une session active. La condition exigeait autrefois
     sessionMode === "simulation" — un mode qui n'existe plus depuis que
     l'épreuve est le seul mode : elle ne pouvait donc plus jamais être vraie,
     et l'élève qui rechargait après تسليم الورقة perdait l'accès à sa copie. */
  const completedOnWorkspace =
    store.state.sessionStatus === "completed" && store.state.activeScreen === "view-workspace";
  const hasRestorableSession = store.isSessionActive() || completedOnWorkspace;
  let activeYear = yearObj(store.state.yearId);
  if (hasRestorableSession && yearMetadata(store.state.yearId) && !activeYear) {
    try {
      activeYear = await loadYear(store.state.yearId);
    } catch (error) {
      reportDiagnostic("subjects.restore-year", error, { yearId: store.state.yearId });
    }
  }
  const canRestoreActive = store.isSessionActive() && activeYear && sujetObj();
  const canRestoreReview = completedOnWorkspace && activeYear && sujetObj();
  if (canRestoreActive || canRestoreReview) {
    // The global exam clock only ticks during the writing phase (workspace).
    // Guide and strategy are planning/reading phases that must not debit
    // official exam time after reload either.
    const onWorkspace = store.state.activeScreen === "view-workspace";
    if (canRestoreActive && onWorkspace) {
      timers.startGlobal();
      bar.classList.remove("hidden");
    } else {
      bar.classList.add("hidden");
    }
    if (canRestoreReview) {
      renderWorkspace();
      showScreen("view-workspace");
    } else if (store.state.activeScreen === "view-guide") {
      renderGuide(activeYear);
      showScreen("view-guide");
    } else if (store.state.activeScreen === "view-strategy") {
      // On reload during strategy, keep the strategy timer only — global stays paused.
      strategyScreen.restoreStrategy();
    } else if (onWorkspace) {
      renderWorkspace();
      showScreen("view-workspace");
    } else {
      renderGuide(activeYear);
      showScreen("view-guide");
    }
  } else {
    if (store.isSessionActive()) store.leaveSession();
    renderHub();
    showScreen("view-hub");
    bar.classList.add("hidden");
  }
}

export { toast as notify };
