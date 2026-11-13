const SCREEN_NAMES = {
  "view-hub": "الصفحة الرئيسية",
  "view-guide": "دليل الاستعداد",
  "view-strategy": "استراتيجية الموضوع",
  "view-workspace": "مساحة الإجابة"
};

function uniqueId(document, prefix) {
  let index = 1;
  let candidate = prefix;
  while (document.getElementById(candidate)) {
    index += 1;
    candidate = `${prefix}-${index}`;
  }
  return candidate;
}

export function ensureLiveRegions(document) {
  let announcer = document.getElementById("screen-announcer");
  if (!announcer) {
    announcer = document.createElement("div");
    announcer.id = "screen-announcer";
    announcer.className = "sr-only";
    announcer.setAttribute("role", "status");
    announcer.setAttribute("aria-live", "polite");
    announcer.setAttribute("aria-atomic", "true");
    document.body.appendChild(announcer);
  }

  let diagnostics = document.getElementById("diagnostic-announcer");
  if (!diagnostics) {
    diagnostics = document.createElement("div");
    diagnostics.id = "diagnostic-announcer";
    diagnostics.className = "sr-only";
    diagnostics.setAttribute("role", "alert");
    diagnostics.setAttribute("aria-live", "assertive");
    diagnostics.setAttribute("aria-atomic", "true");
    document.body.appendChild(diagnostics);
  }
  return { announcer, diagnostics };
}

export function announceScreen(document, id, { focus = true } = {}) {
  const target = document.getElementById(id);
  const { announcer } = ensureLiveRegions(document);
  const heading = target?.querySelector("h1, h2, h3");
  const name = heading?.textContent?.trim() || SCREEN_NAMES[id] || "شاشة جديدة";
  announcer.textContent = "";
  const schedule = document.defaultView.requestAnimationFrame || document.defaultView.setTimeout;
  schedule.call(document.defaultView, () => {
    announcer.textContent = `تم فتح: ${name}`;
  });
  if (!target) return;
  if (heading) {
    if (!heading.id) heading.id = uniqueId(document, `${id}-title`);
    target.setAttribute("aria-labelledby", heading.id);
    target.removeAttribute("aria-label");
    if (focus) {
      heading.setAttribute("tabindex", "-1");
      heading.focus({ preventScroll: true });
    }
    return;
  }
  target.setAttribute("aria-label", name);
  if (focus) {
    target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
  }
}

function hasExplicitName(field, document) {
  if (field.hasAttribute("aria-label") || field.hasAttribute("aria-labelledby")) return true;
  return Boolean(
    field.id && [...document.querySelectorAll("label[for]")].some((label) => label.htmlFor === field.id)
  );
}

export function associateFieldsWithInstructions(root = document) {
  const document = root.ownerDocument || root;
  const seenIds = new Set();
  document.querySelectorAll("[id]").forEach((element) => {
    if (!root.contains?.(element)) seenIds.add(element.id);
  });
  root.querySelectorAll("input, textarea, select").forEach((field, index) => {
    const precedingLabel =
      field.previousElementSibling?.tagName === "LABEL" ? field.previousElementSibling : null;
    if (!field.id || seenIds.has(field.id)) {
      field.id = uniqueId(document, `accessible-field-${index + 1}`);
      if (precedingLabel) precedingLabel.htmlFor = field.id;
    }
    seenIds.add(field.id);
    if (hasExplicitName(field, document)) return;
    if (precedingLabel) {
      precedingLabel.htmlFor = field.id;
      return;
    }
    if (field.placeholder || field.name) {
      const label = document.createElement("label");
      label.className = "sr-only";
      label.htmlFor = field.id;
      label.textContent = field.placeholder || field.name;
      field.before(label);
      return;
    }
    const context = field.closest("section, article, .card, [role='dialog']");
    const instruction = context?.querySelector("h1, h2, h3, .bac-consigne, .lbl");
    if (instruction) {
      if (!instruction.id) instruction.id = uniqueId(document, `${field.id}-instruction`);
      field.setAttribute("aria-labelledby", instruction.id);
      return;
    }
    const label = document.createElement("label");
    label.className = "sr-only";
    label.htmlFor = field.id;
    label.textContent = "حقل إدخال";
    field.before(label);
  });
}

function diagnosticMessage(code) {
  const safeCode = typeof code === "string" ? code : "";
  if (safeCode.startsWith("store.")) return "تعذر حفظ البيانات محلياً";
  if (safeCode.startsWith("speech.")) return "تعذر تشغيل الإملاء الصوتي";
  if (safeCode.startsWith("sound.")) return "تعذر تشغيل الصوت";
  if (safeCode.startsWith("theme.")) return "تعذر حفظ إعداد العرض";
  if (safeCode.startsWith("service-worker.")) return "تعذر تحديث وضع العمل دون اتصال";
  return "حدث خطأ تقني غير متوقع";
}

export function bindDiagnosticAnnouncements(window) {
  window.addEventListener("boussole4d:diagnostic", (event) => {
    const { diagnostics } = ensureLiveRegions(window.document);
    diagnostics.textContent = diagnosticMessage(event.detail?.code);
  });
}
