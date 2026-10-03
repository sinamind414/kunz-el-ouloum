// moiRaccourcis.ts — raccourcis « أنا » (déplacés depuis le menu المزيد).
//
// Décision du 2026-10-03 : « الأوسمة والإنجازات » et « لوحة المتابعة » quittent
// le menu latéral « المزيد » pour devenir des ICÔNES dans la page أنا, sous
// l'avancement de l'élève. L'élève clique sur l'icône pour ouvrir le détail :
// le raccourci remplace l'entrée de menu, il ne s'y ajoute pas.
// Puis « تقدمي » (PROGRÈS) a rejoint les deux : elle quitte la barre
// principale du bas (8 → 7 onglets). Même traitement, toujours pas de doublon.
//
// Ce fichier est la SOURCE UNIQUE des trois étiquettes : elles sont déplacées
// verbatim (`الأوسمة والإنجازات` et `لوحة المتابعة` depuis SECONDARY_NAV,
// `تقدمي` depuis PRIMARY_NAV), jamais réécrites. Un test de MoiView relit
// App.tsx et casse si l'une d'elles réapparaît dans l'ancien menu — c'est la
// preuve que le déplacement a bien eu lieu et n'est pas un doublon.

export type MoiRaccourciTab = 'badges' | 'teacher' | 'stats';

export interface MoiRaccourci {
  /** Onglet ouvert par le clic sur l'icône. */
  tab: MoiRaccourciTab;
  /** Libellé arabe — déplacé verbatim, non rédigé ici (voir en-tête). */
  labelAr: string;
}

export const MOI_RACCOURCIS: readonly MoiRaccourci[] = [
  // Ordre imposé le 2026-10-03 : تقدمي d'abord, puis الأوسمة, et لوحة
  // المتابعة en dernier. L'ordre est verrouillé par un test.
  { tab: 'stats', labelAr: 'تقدمي' },
  { tab: 'badges', labelAr: 'الأوسمة والإنجازات' },
  { tab: 'teacher', labelAr: 'لوحة المتابعة' },
] as const;

export const MOI_RACCOURCI_COUNT = MOI_RACCOURCIS.length;
