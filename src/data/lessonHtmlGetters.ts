// src/data/lessonHtmlGetters.ts
// Getters du HTML des leçons — M1 (audit 8 axes 2026-10-14, P1) :
//
// AVANT : chaque fichier de `public/lessons/` était chargé DEUX FOIS —
// copié tel quel dans `dist/lessons/` (précaché par le SW) ET embarqué en
// chunk JS `?raw` (imports dynamiques Vite). ~2,1 Mo de HTML dupliqués en
// JavaScript : téléchargés deux fois, stockés deux fois, sur un téléphone
// bas de gamme 3G.
//
// APRÈS : SOURCE UNIQUE = `public/lessons/*.html` (protégé, verrouillé par
// swPrecacheComplet.test.ts côté précache). Les getters la consultent par
// fetch : en ligne, le réseau une seule fois ; hors ligne, le SW répond
// depuis son cache — et plus aucun octet de leçon dans le JS. Le contrat
// du viewer (protégé) est inchangé : Promise<{ default: string }>, rejet →
// message d'erreur affiché.

const depuisFichier = (fichier: string): Promise<{ default: string }> =>
  fetch(`/lessons/${fichier}`).then((reponse) => {
    if (!reponse.ok) {
      throw new Error(`leçon indisponible (HTTP ${reponse.status}) : /lessons/${fichier}`);
    }
    return reponse.text();
  }).then((html) => ({ default: html }));

export const LESSON_HTML_GETTERS: Record<string, () => Promise<{ default: string }>> = {
  // Les clés `_2` désignent la 2e leçon du même fichier de phase :
  // l'isolation du chapitre est faite par sliceLessonHtml() dans HtmlLessonViewer.
  lecon_transcription: () => depuisFichier('lecon_transcription.html'),
  lecon_representation: () => depuisFichier('lecon_representation.html'),
  lecon_activite_structure: () => depuisFichier('lecon_activite_structure.html'),
  phase1_chapitres_1_2: () => depuisFichier('phase1_chapitres_1_2.html'),
  phase2_chapitres_3_4: () => depuisFichier('phase2_chapitres_3_4.html'),
  phase3_chapitres_5_6: () => depuisFichier('phase3_chapitres_5_6.html'),
  phase4_chapitres_7_8: () => depuisFichier('phase4_chapitres_7_8.html'),
  phase5_chapitres_9_10: () => depuisFichier('phase5_chapitres_9_10.html'),
  phase6_chapitres_11_12: () => depuisFichier('phase6_chapitres_11_12.html'),
  phase7_chapitres_13_14: () => depuisFichier('phase7_chapitres_13_14.html'),
  phase8_chapitres_15_16: () => depuisFichier('phase8_chapitres_15_16.html'),
  phase9_chapitres_17_18: () => depuisFichier('phase9_chapitres_17_18.html'),
  phase10_chapitres_19_20: () => depuisFichier('phase10_chapitres_19_20.html'),
  phase11_chapitres_21_22: () => depuisFichier('phase11_chapitres_21_22.html'),
  phase12_chapitres_23_24: () => depuisFichier('phase12_chapitres_23_24.html'),
  phase13_chapitres_25_26: () => depuisFichier('phase13_chapitres_25_26.html'),
  phase14_chapitres_27_28: () => depuisFichier('phase14_chapitres_27_28.html'),
  phase15_chapitres_29_30: () => depuisFichier('phase15_chapitres_29_30.html'),
  phase16_chapitres_31_32: () => depuisFichier('phase16_chapitres_31_32.html'),
  phase17_chapitres_33_34: () => depuisFichier('phase17_chapitres_33_34.html'),
  phase18_chapitres_35_36: () => depuisFichier('phase18_chapitres_35_36.html'),
  phase19_chapitres_37_38: () => depuisFichier('phase19_chapitres_37_38.html'),
  phase20_chapitres_39_40: () => depuisFichier('phase20_chapitres_39_40.html'),
  phase21_chapitres_41_42: () => depuisFichier('phase21_chapitres_41_42.html'),
  phase22_chapitres_43_44: () => depuisFichier('phase22_chapitres_43_44.html'),

  // --- 2e leçon de chaque phase (chapitre 2 du même fichier HTML) ---
  phase1_chapitres_1_2_2: () => depuisFichier('phase1_chapitres_1_2.html'),
  phase2_chapitres_3_4_2: () => depuisFichier('phase2_chapitres_3_4.html'),
  phase3_chapitres_5_6_2: () => depuisFichier('phase3_chapitres_5_6.html'),
  phase4_chapitres_7_8_2: () => depuisFichier('phase4_chapitres_7_8.html'),
  phase5_chapitres_9_10_2: () => depuisFichier('phase5_chapitres_9_10.html'),
  phase6_chapitres_11_12_2: () => depuisFichier('phase6_chapitres_11_12.html'),
  phase7_chapitres_13_14_2: () => depuisFichier('phase7_chapitres_13_14.html'),
  phase8_chapitres_15_16_2: () => depuisFichier('phase8_chapitres_15_16.html'),
  phase9_chapitres_17_18_2: () => depuisFichier('phase9_chapitres_17_18.html'),
  phase10_chapitres_19_20_2: () => depuisFichier('phase10_chapitres_19_20.html'),
  phase11_chapitres_21_22_2: () => depuisFichier('phase11_chapitres_21_22.html'),
  phase12_chapitres_23_24_2: () => depuisFichier('phase12_chapitres_23_24.html'),
  phase13_chapitres_25_26_2: () => depuisFichier('phase13_chapitres_25_26.html'),
  phase14_chapitres_27_28_2: () => depuisFichier('phase14_chapitres_27_28.html'),
  phase15_chapitres_29_30_2: () => depuisFichier('phase15_chapitres_29_30.html'),
  phase16_chapitres_31_32_2: () => depuisFichier('phase16_chapitres_31_32.html'),
  phase17_chapitres_33_34_2: () => depuisFichier('phase17_chapitres_33_34.html'),
  phase18_chapitres_35_36_2: () => depuisFichier('phase18_chapitres_35_36.html'),
  phase19_chapitres_37_38_2: () => depuisFichier('phase19_chapitres_37_38.html'),
  phase20_chapitres_39_40_2: () => depuisFichier('phase20_chapitres_39_40.html'),
  phase21_chapitres_41_42_2: () => depuisFichier('phase21_chapitres_41_42.html'),
  phase22_chapitres_43_44_2: () => depuisFichier('phase22_chapitres_43_44.html'),
};
