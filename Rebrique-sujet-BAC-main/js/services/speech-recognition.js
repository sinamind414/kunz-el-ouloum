import { reportDiagnostic } from "./diagnostics.js";

/* Browser speech recognition adapter. The UI supplies its notification channel. */
/**
 * @param {(message: string, type?: string) => void} notify
 * @returns {{ listening: boolean, target: any, recognition: any, start(input: HTMLInputElement | HTMLTextAreaElement): boolean, stop(abort?: boolean): void }}
 */
export function createSpeechEngine(notify = () => {}) {
  return {
    listening: false,
    /** @type {HTMLInputElement | HTMLTextAreaElement | null} */
    target: null,
    /** @type {any} */
    recognition: null,

    start(input) {
      const browserWindow = /** @type {any} */ (window);
      const SR = browserWindow.SpeechRecognition || browserWindow.webkitSpeechRecognition;
      if (!SR || !input) {
        notify("الإملاء الصوتي غير متاح في هذا المتصفح.", "warn");
        return false;
      }
      this.stop();
      this.target = input;

      // An attempt that throws leaves the recognition object in an undefined
      // state: calling start() again on the same object raises InvalidStateError
      // (bug #54 — the old code retried ar-EG then ar on the very object that
      // had just failed). Each attempt therefore gets a fresh instance, and a
      // locale refused after start() moves on to the next one.
      const langs = ["ar-SA", "ar-EG", "ar"];
      let index = 0;
      // Une même action de l'élève peut démarrer plusieurs fois en interne
      // (locale refusée puis repli) : il ne doit voir qu'un seul message.
      let announced = false;

      /** @param {string} lang */
      const buildRecognition = (lang) => {
        const recognition = new SR();
        recognition.lang = lang;
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
        recognition.onresult = (/** @type {any} */ event) => {
          const transcript = Array.from(event.results)
            .slice(event.resultIndex)
            .map((result) => result[0]?.transcript || "")
            .join(" ")
            .trim();
          if (!transcript || !this.target) return;
          // Insert at caret (or append at end if no selection), preserving the
          // student's cursor so dictation in the middle of notes does not jump.
          const el = this.target;
          const start = typeof el.selectionStart === "number" ? el.selectionStart : el.value.length;
          const end = typeof el.selectionEnd === "number" ? el.selectionEnd : el.value.length;
          const prefix = el.value.slice(0, start);
          const suffix = el.value.slice(end);
          const glue = prefix && !/\s$/.test(prefix) ? " " : "";
          el.value = `${prefix}${glue}${transcript}${suffix}`;
          const caret = (prefix + glue + transcript).length;
          try {
            el.setSelectionRange(caret, caret);
          } catch {
            /* not all inputs support this */
          }
          el.dispatchEvent(new el.ownerDocument.defaultView.Event("input", { bubbles: true }));
        };
        recognition.onerror = (/** @type {any} */ error) => {
          const code = String(error?.error || "");
          // The engine may accept start() then reject the locale asynchronously.
          // Retry the next language instead of surfacing a failure to the pupil.
          if (this.recognition === recognition && code === "language-not-supported") {
            this.recognition = null;
            this.listening = false;
            attempt();
            return;
          }
          reportDiagnostic("speech.recognition", error);
          if (this.recognition === recognition) this.stop(false);
          notify("تعذر الإملاء الصوتي. تحقق من إذن الميكروفون.", "warn");
        };
        recognition.onend = () => {
          if (this.recognition === recognition) this.stop(false);
        };
        return recognition;
      };

      const attempt = () => {
        if (index >= langs.length) {
          reportDiagnostic("speech.start", new Error("aucune langue arabe supportée"));
          this.stop();
          notify("تعذر بدء الإملاء الصوتي.", "warn");
          return false;
        }
        const lang = langs[index];
        index += 1;
        const recognition = buildRecognition(lang);
        this.recognition = recognition;
        // listening/recognition sont posés AVANT start() : un moteur peut
        // émettre onresult/onend de façon synchrone, et onend doit alors
        // pouvoir refermer proprement la session.
        this.listening = true;
        try {
          recognition.start();
          // Garder l'identité : si la session s'est déjà refermée (onend
          // synchrone), on n'annonce pas un démarrage qui n'existe plus.
          if (this.recognition === recognition && !announced) {
            announced = true;
            notify("بدأ الإملاء الصوتي…", "info");
          }
          return true;
        } catch (error) {
          reportDiagnostic("speech.start", error);
          if (this.recognition === recognition) this.recognition = null;
          this.listening = false;
          return attempt();
        }
      };

      return attempt();
    },

    stop(abort = true) {
      const recognition = this.recognition;
      this.recognition = null;
      this.listening = false;
      this.target = null;
      if (abort && recognition) {
        try {
          recognition.abort();
        } catch (error) {
          reportDiagnostic("speech.abort", error);
        }
      }
    }
  };
}
