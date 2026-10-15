// brandAssets.ts — URLs de marque, isolées du corpus (sprint 31).
//
// `SplashView` et `DashboardView` importaient `LOGO_URL` depuis `data/index.ts`.
// Or ce fichier importe `quizCorpus.ts` (549 QCM, 596 Ko de source) : une
// constante de six caractères entraînait donc tout le corpus dans le bundle
// d'entrée, et annulait le chargement différé. Les constantes vivent désormais
// dans un module sans dépendance ; `data/index.ts` les ré-exporte pour ne rien
// casser ailleurs.

export const DIAGRAM_QUIZ_URL =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBHewZo48wjNdNC_EGWYGRzduDxicgGztWMu2vdFW48avFtjF3GBVCPyR-uin214yMvhTNb6UmG6v704clB_WDvWy3qs1DW86A791f9S_NllwZaq-vEomxojQaTchhv-OaMqVl7TAhckwtSOZ-3QhLq-uJfeKCMgwXlpWGV_MQKtqAV_7yFaoQmu3T9zDPHw7v7JgNCRoSj6JqlIbElWTLoqTnvMOu3A0w0kaaqrWvJ8ruHNc57yr2v9EDgjTKJOew1yrlmDWDe2A';
export const DIAGRAM_FLASHCARD_URL =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBm2eS7wegmPkIFmjuqd-3EAxmECqfZvrjse-TYR8LjmIMIWMm3CICN7WobYQumt8a3OCLBjP6S_2-FCQ5q86oM0SVUfFql3evu1K0IUv1_Ex6axew-StCgYxHfUBwYWd8RDn-sVOlCLCXb5qwEjgeJLBioKizAOkweCqP816LrJHRXD_U-nPmGX09AlUHYYnaJV2eG4J5vbNnKavSTcb_ChNrXPtdLMmok63LgMDRpJokSTgwLOCx4v8D2JXq19F7Ri3T_TCMu4Q';
export const MASCOT_URL = '/assets/images/mascot-512.png';

/** Logo officiel de la plateforme كنز العلوم (accueil / splash / favicon). */
export const LOGO_URL = '/logo_site.png';

/** Logo dédié au المرشد الذكي (en-tête + avatars de la conversation). */
export const MORCHID_LOGO_URL = '/logo_morchid.png';

/**
 * VISAGE DU CAPITAINE — le personnage seul, recadré (14/10/2026).
 *
 * Pourquoi un second fichier au lieu de réutiliser `MORCHID_LOGO_URL` : l'image
 * d'origine (424×588) contient le personnage ET le mot-symbole « كنز العلوم »
 * en bas. Dans un bouton rond de 56 px, ce texte était réduit à des taches
 * dorées illisibles — et sans aucun sens, puisqu'un bouton n'a pas à répéter le
 * nom du site. Ce fichier est le MÊME visuel, recadré sur le personnage
 * (280×280 centré sur le buste), sans retouche ni couleur ajoutée.
 */
export const CAPITAINE_VISAGE_URL = '/logo_capitaine_avatar.png';
