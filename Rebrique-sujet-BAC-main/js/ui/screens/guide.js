/* ============================================================
   GUIDE SCREEN — préparation avant le sujet (flux examen)
   ------------------------------------------------------------
   Règle de simplicité : cet écran appartient au flux d'examen.
   Trois éléments : respiration, durée officielle, suite.
   L'épreuve est le seul mode : aucune aide méthodologique n'est affichée
   ici, seulement la préparation avant le sujet.

   Retiré le 2026-09-19 à la demande du propriétaire, parce que ces textes
   distraient l'élève au lieu de le préparer : le titre de l'écran, son
   sous-titre de « séance de cadrage psychologique », la phrase
   d'encouragement et le rappel des quatre étapes de la méthode (اقرأ، اجمع،
   اربط، اختُم). La méthode reste enseignée là où l'élève en a besoin : dans
   l'épreuve, consigne par consigne — pas dans un écran qu'il doit traverser.
   ============================================================ */

import { setInternalHTML } from "../dom.js";

export function createGuideScreen(deps) {
  const { $, adkarHTML, examMinutesForYear, formatDuration, goHome, goToStrategy } = deps;

  function renderGuide(y) {
    setInternalHTML(
      $("#view-guide"),
      `
    <div class="app">
      <header class="screen-head">
        <div class="brand">
          <button class="btn btn-rose btn-sm" id="guide-exit">✕ إلغاء والعودة</button>
          <div class="brand-icon" aria-hidden="true">🌿</div>
        </div>
      </header>

      <div class="grid">
        <div class="card center stack">
          <div class="breath">تنفس بعمق</div>
          <div>
            <p class="small text-muted mt-0">خذ شهيقاً 4 ثوانٍ، احبس 4 ثوانٍ، ثم ازفر ببطء 4 ثوانٍ لطرد التوتر.</p>
          </div>
        </div>
        ${adkarHTML()}
        <div class="card center stack">
          <p class="small text-muted mt-0 mb-0">مدة الاختبار الرسمية لهذه الشعبة: <b>${formatDuration(
            examMinutesForYear(y)
          )}</b>. خطتك هنا: <b>25 د</b> لتصفح الموضوع وتقدير ثقتك في كل تمرين.</p>
          <p class="small text-amber mt-0 mb-0">هذه مرحلة تحضير: اقرأ الموضوع كاملاً في الشاشة التالية قبل اختياره.</p>
        </div>
        <div class="flex justify-end">
          <button class="btn btn-emerald" id="guide-next">أنا مستعد — تصفح الموضوع واختر خلال 25 دقيقة</button>
        </div>
      </div>
      <footer class="screen-foot">ثقة واحدة تكفي: خطوة في كل مرة.</footer>
    </div>`
    );

    $("#guide-exit").addEventListener("click", goHome);
    $("#guide-next").addEventListener("click", goToStrategy);
  }

  return { renderGuide };
}
