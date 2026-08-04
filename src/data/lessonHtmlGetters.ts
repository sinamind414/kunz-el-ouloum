// src/data/lessonHtmlGetters.ts
// Lazy dynamic importers for the lesson HTML (Vite `?raw`).
// Extracted from HtmlLessonViewer for testability.

export const LESSON_HTML_GETTERS: Record<string, () => Promise<{ default: string }>> = {
  lecon_transcription: () => import('../../public/lessons/lecon_transcription.html?raw'),
  phase1_chapitres_1_2: () => import('../../public/lessons/phase1_chapitres_1_2.html?raw'),
  phase2_chapitres_3_4: () => import('../../public/lessons/phase2_chapitres_3_4.html?raw'),
  phase3_chapitres_5_6: () => import('../../public/lessons/phase3_chapitres_5_6.html?raw'),
  phase4_chapitres_7_8: () => import('../../public/lessons/phase4_chapitres_7_8.html?raw'),
  phase5_chapitres_9_10: () => import('../../public/lessons/phase5_chapitres_9_10.html?raw'),
  phase6_chapitres_11_12: () => import('../../public/lessons/phase6_chapitres_11_12.html?raw'),
  phase7_chapitres_13_14: () => import('../../public/lessons/phase7_chapitres_13_14.html?raw'),
  phase8_chapitres_15_16: () => import('../../public/lessons/phase8_chapitres_15_16.html?raw'),
  phase9_chapitres_17_18: () => import('../../public/lessons/phase9_chapitres_17_18.html?raw'),
  phase10_chapitres_19_20: () => import('../../public/lessons/phase10_chapitres_19_20.html?raw'),
  phase11_chapitres_21_22: () => import('../../public/lessons/phase11_chapitres_21_22.html?raw'),
  phase12_chapitres_23_24: () => import('../../public/lessons/phase12_chapitres_23_24.html?raw'),
  phase13_chapitres_25_26: () => import('../../public/lessons/phase13_chapitres_25_26.html?raw'),
  phase14_chapitres_27_28: () => import('../../public/lessons/phase14_chapitres_27_28.html?raw'),
  phase15_chapitres_29_30: () => import('../../public/lessons/phase15_chapitres_29_30.html?raw'),
  phase16_chapitres_31_32: () => import('../../public/lessons/phase16_chapitres_31_32.html?raw'),
  phase17_chapitres_33_34: () => import('../../public/lessons/phase17_chapitres_33_34.html?raw'),
  phase18_chapitres_35_36: () => import('../../public/lessons/phase18_chapitres_35_36.html?raw'),
  phase19_chapitres_37_38: () => import('../../public/lessons/phase19_chapitres_37_38.html?raw'),
  phase20_chapitres_39_40: () => import('../../public/lessons/phase20_chapitres_39_40.html?raw'),
  phase21_chapitres_41_42: () => import('../../public/lessons/phase21_chapitres_41_42.html?raw'),
  phase22_chapitres_43_44: () => import('../../public/lessons/phase22_chapitres_43_44.html?raw'),
};
