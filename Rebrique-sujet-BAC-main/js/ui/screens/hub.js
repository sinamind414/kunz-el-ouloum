import { node, setInternalHTML } from "../dom.js";
import { mountPdfViewers, pdfViewerHTML } from "../pdf-viewer.js";
import { ARCHIVE, catalogYearsForStream } from "../../../data/archive.js";

const STREAM_KEY = "boussole4d.stream";
/* Le troisième onglet était « تقني رياضي » (clé `tm`) : une شعبة sans épreuve
   SVT au BAC algérien, affichée comme un trou. Il devient « باكالوريات أجنبية »
   — un espace pour des sujets non algériens, qui n'est donc PAS une شعبة.
   L'identifiant suit le changement (`foreign`) ; une installation ayant déjà
   écrit « tm » dans localStorage est ramenée à « foreign » au lieu de retomber
   silencieusement sur « se ». */
const LEGACY_STREAM_IDS = Object.freeze({ tm: "foreign" });
const STREAM_ORDER = ["se", "m", "foreign"];
const STREAMS = {
  se: { id: "se", label: "علوم تجريبية" },
  m: { id: "m", label: "رياضيات" },
  foreign: { id: "foreign", label: "باكالوريات أجنبية" }
};

function readStream() {
  try {
    const value = localStorage.getItem(STREAM_KEY);
    if (STREAMS[value]) return value;
    if (LEGACY_STREAM_IDS[value]) return LEGACY_STREAM_IDS[value];
  } catch {
    /* storage unavailable */
  }
  return "se";
}

function nextStreamId(id) {
  const index = STREAM_ORDER.indexOf(id);
  return STREAM_ORDER[(index + 1) % STREAM_ORDER.length];
}

function writeStream(id) {
  try {
    localStorage.setItem(STREAM_KEY, id);
  } catch {
    /* storage unavailable */
  }
}

function examYearsForStream(appConfig, streamId) {
  return appConfig.years.filter((year) => year.enabled && (year.stream || "se") === streamId);
}

/* Deux sessions du même millésime (2017 Maths : principale + exceptionnelle)
   doivent avoir deux cartes distinctes, sinon l'une masque l'autre — et les
   PDF de la session exceptionnelle deviennent inatteignables. */
function yearCardId(year) {
  const base = year.calendarYear || year.id;
  return year.session === "exceptional" ? `${base} (دورة استثنائية)` : base;
}

function buildHubCatalog(appConfig, streamId) {
  const training = examYearsForStream(appConfig, streamId).map((year) => ({
    id: yearCardId(year),
    kind: "exam",
    year
  }));
  /* Le filtre se fait sur le MILLÉSIME, pas sur l'identifiant de carte : sans
     cela, une session exceptionnelle laisserait réapparaître une carte de
     consultation pour la même année. */
  const usedYears = new Set(training.map((item) => item.year.calendarYear || item.year.id));
  const consult = catalogYearsForStream(streamId)
    .filter((group) => !usedYears.has(group.year))
    .map((group) => ({
      id: group.year,
      kind: "consult",
      entries: group.entries
    }));
  return [...training, ...consult].sort((a, b) => (a.id < b.id ? 1 : -1));
}

export function createHubScreen(deps) {
  const {
    $,
    $$,
    APP_CONFIG,
    applyTheme,
    mountPdfViewers,
    pdfViewerHTML,
    closeModal,
    cycleSound,
    enterExercise,
    examMinutesForYear,
    formatDuration,
    openAdkar,
    openDrawer,
    openModal,
    startSession,
    store,
    timers,
    yearObj
  } = deps;

  function renderHub() {
    const streamId = readStream();
    const stream = STREAMS[streamId];
    const other = STREAMS[nextStreamId(streamId)];
    const catalog = buildHubCatalog(APP_CONFIG, streamId);
    setInternalHTML(
      $("#view-hub"),
      `
    <div class="app">
      <header class="screen-head">
        <div class="brand">
          <div class="brand-icon" aria-hidden="true">٤</div>
          <div>
            <h1>${APP_CONFIG.appTitle}</h1>
          </div>
        </div>
        <div class="flex gap-2 hub-tools">
          <button class="btn btn-emerald btn-sm" id="btn-stream-fab" aria-live="polite">
            <span class="stream-fab-kicker">الشعبة:</span> <strong id="stream-fab-label"></strong>
          </button>
          <button class="btn-sound" id="btn-hub-sound">🔇 صوت</button>
          <button class="btn-adkar" id="btn-hub-adkar">🕌 أدعية وأذكار</button>
        </div>
      </header>

      <div class="grid grid-cards" id="year-grid"></div>
      <footer class="screen-foot">منصة إمتحان بكالوريا علوم الطبيعة والحياة. <a href="legal/privacy.html">الخصوصية</a> · <a href="legal/legal-notice.html">المعلومات القانونية</a></footer>
    </div>`
    );

    const fab = $("#btn-stream-fab");
    fab.setAttribute("aria-label", `القسم الحالي: ${stream.label}. اضغط للانتقال إلى ${other.label}`);
    $("#stream-fab-label").textContent = stream.label;
    /* « باكالوريات أجنبية » n'est pas une شعبة : lui coller le préfixe
       « الشعبة: » afficherait une information fausse. */
    const kicker = fab.querySelector(".stream-fab-kicker");
    if (kicker) kicker.hidden = streamId === "foreign";

    const grid = $("#year-grid");
    if (catalog.length === 0) {
      grid.appendChild(gapCard(stream));
    } else {
      for (const item of catalog) {
        grid.appendChild(item.kind === "exam" ? examCard(item.year) : consultCard(item));
      }
    }

    $$("#year-grid [data-year]:not([disabled])").forEach((button) =>
      button.addEventListener("click", async () => {
        const label = button.textContent;
        button.disabled = true;
        button.setAttribute("aria-busy", "true");
        button.textContent = "جارٍ تحميل السنة…";
        const loaded = await startSession(button.dataset.year);
        if (!loaded && button.isConnected) {
          button.disabled = false;
          button.removeAttribute("aria-busy");
          button.textContent = label;
        }
      })
    );
    $("#btn-hub-adkar").addEventListener("click", openAdkar);
    $("#btn-hub-sound").addEventListener("click", () => cycleSound($("#btn-hub-sound")));
    fab.addEventListener("click", cycleStream);
    applyTheme(document.documentElement.dataset.theme);
  }

  function cycleStream() {
    writeStream(nextStreamId(readStream()));
    renderHub();
  }

  function gapCard(stream) {
    const card = node("div", {
      className: "card year-card dim",
      dataset: { hubYear: "none", kind: "gap", stream: stream.id }
    });
    const stack = node("div", { className: "stack" });
    const header = node("div", { className: "flex spread" });
    header.append(node("span", { className: "mono bold year-number", text: "—" }));
    const isForeign = stream.id === "foreign";
    const copy = node("div");
    copy.append(
      node("h3", {
        className: "mt-0 mb-1",
        text: isForeign ? stream.label : `شعبة ${stream.label}`
      }),
      node("p", {
        className: "small text-muted mt-0",
        text: isForeign
          ? "لم يُحمَّل أي موضوع بعد. هذا القسم مخصص للبكالوريات غير الجزائرية."
          : "لا يوجد موضوع SVT متاح لهذه الشعبة."
      })
    );
    stack.append(header, copy);
    const actions = node("div", { className: "stack" });
    /* Le bouton renvoie vers l'index dzexams des SVT ALGÉRIENNES : il n'a de
       sens que pour une شعبة algérienne. Le montrer sous « باكالوريات أجنبية »
       serait un lien trompeur — aucun index étranger n'a été vérifié ici. */
    if (!isForeign) {
      actions.append(
        node("a", {
          className: "btn btn-block btn-ghost",
          text: "📂 فهرس علوم الطبيعة والحياة",
          attrs: {
            href: ARCHIVE.sourceRoot,
            target: "_blank",
            rel: "noopener noreferrer"
          }
        })
      );
    }
    card.append(stack, actions);
    return card;
  }

  /* Une année « copie libre » n'a aucune consigne encodée : la carte ne peut
     pas annoncer un جرد المهام qu'elle n'a pas. Elle le dit à la place. */
  function examCardNote(y) {
    const duration = formatDuration(examMinutesForYear(y));
    if (y.answerMode !== "free") {
      return `إمتحان الموضوع — جرد المهام جزئي: بعض التعليمات مُعاد بناؤها. مدة الاختبار الرسمية: ${duration}.`;
    }
    /* Ce que la carte annonce dépend de ce qui a été MESURÉ sur le fichier :
       le découpage en exercices (scan : non mesurable) et le barème (chiffres
       corrompus sur ce corpus : jamais mesuré). Rien de plus n'est affirmé. */
    const split = y.freeMeasurements?.exerciseSplitMeasured;
    const points = y.freeMeasurements?.pointsMeasured;
    /* L'infobulle reste le seul endroit où l'application dit ce qu'elle n'a
       pas : aucune consigne encodée, aucun barème affiché. Les longs
       paragraphes qui expliquaient le mode « copie libre » ont été retirés à
       la demande du propriétaire ; ce qui reste suffit à ne rien promettre de
       faux. */
    return (
      `إمتحان الموضوع — تعليمات هذه الدورة غير مُشفَّرة: تقرأ الموضوع من الملف وتكتب إجابتك ` +
      (split === false
        ? "في خانة لكل تمرين (بعدد تمارين الشعبة: غير مقروء على هذا الملف)"
        : "في خانة لكل تمرين") +
      (points === false ? ". البارم غير مُقاس فلا يُعرض أي عدد نقاط" : "") +
      `. مدة الاختبار الرسمية: ${duration}.`
    );
  }

  function examCard(y) {
    const disabled = !y.enabled;
    const note = disabled ? y.loadingNote || "لم تُرفق وثائق PDF لهذه الدورة بعد — قريباً." : examCardNote(y);
    const cardId = yearCardId(y);
    const card = node("div", {
      className: `card year-card ${disabled ? "dim" : ""}`,
      attrs: { title: note },
      dataset: { hubYear: cardId, kind: "exam" }
    });
    const stack = node("div", { className: "stack" });
    const header = node("div", { className: "flex spread" });
    header.append(node("span", { className: "mono bold year-number", text: cardId }));
    const copy = node("div");
    copy.append(node("h3", { className: "mt-0 mb-1", text: y.label }));
    stack.append(header, copy);
    /* Un seul vert pour toutes les années : la couleur ne doit plus laisser
       croire que deux boutons identiques ouvrent deux choses différentes. */
    const button = node("button", {
      className: "btn btn-block btn-emerald",
      text: disabled ? "غير متاح بعد" : "▶ ابدأ الإمتحان",
      attrs: disabled ? { disabled: "" } : {},
      dataset: { year: y.id }
    });
    const actions = node("div", { className: "stack" });
    actions.append(button);
    card.append(stack, actions);
    return card;
  }

  function consultCard(item) {
    const card = node("div", {
      className: "card year-card",
      dataset: { hubYear: item.id, kind: "consult" }
    });
    const stack = node("div", { className: "stack" });
    const header = node("div", { className: "flex spread" });
    header.append(node("span", { className: "mono bold year-number", text: item.id }));
    const localPdfs = item.entries.flatMap((entry) => entry.localPdfUrls || []);
    const copy = node("div");
    copy.append(node("h3", { className: "mt-0 mb-1", text: `بكالوريا الجزائر دورة ${item.id}` }));
    stack.append(header, copy);
    const actions = node("div", { className: "stack" });
    if (localPdfs.length) {
      localPdfs.forEach((href, index) => {
        const button = node("button", {
          className: "btn btn-block btn-emerald",
          text: `📄 قراءة الموضوع ${index + 1} في التطبيق`,
          dataset: { consultPdf: href }
        });
        button.addEventListener("click", () => {
          const drawer = openDrawer(
            "right",
            `📄 وثيقة الموضوع ${index + 1}`,
            pdfViewerHTML({ id: index + 1, pdfLocalUrl: href })
          );
          mountPdfViewers(drawer);
        });
        actions.append(button);
      });
    }
    for (const entry of item.entries) {
      const session = ARCHIVE.sessions[entry.session] || entry.session;
      const label = item.entries.length > 1 ? `🔗 ${session} (المصدر)` : "🔗 المصدر والتصحيح";
      if (entry.url) {
        actions.append(
          node("a", {
            className: "btn btn-block btn-ghost btn-sm",
            text: label,
            attrs: { href: entry.url, target: "_blank", rel: "noopener noreferrer" }
          })
        );
      }
    }
    card.append(stack, actions);
    return card;
  }

  return { renderHub };
}
