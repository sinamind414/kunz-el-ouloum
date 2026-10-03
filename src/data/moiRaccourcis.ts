// moiRaccourcis.ts — raccourcis « أنا » (déplacés depuis le menu المزيد).
//
// Décision du 2026-10-03 : « الأوسمة والإنجازات » et « لوحة المتابعة » quittent
// le menu latéral « المزيد » pour devenir des ICÔNES dans la page أنا, sous
// l'avancement de l'élève. L'élève clique sur l'icône pour ouvrir le détail :
// le raccourci remplace l'entrée de menu, il ne s'y ajoute pas.
//
// Ce fichier est la SOURCE UNIQUE des deux étiquettes : elles sont déplacées
// verbatim depuis `SECONDARY_NAV` (App.tsx), jamais réécrites. Un test de
// MoiView relit App.tsx et casse si elles réapparaissent dans le menu — c'est
// la preuve que le déplacement a bien eu lieu et n'est pas un doublon.

export type MoiRaccourciTab = 'badges' | 'teacher';

export interface MoiRaccourci {
  /** Onglet ouvert par le clic sur l'icône. */
  tab: MoiRaccourciTab;
  /** Libellé arabe — déplacé verbatim de `SECONDARY_NAV`, non rédigé ici. */
  labelAr: string;
}

export const MOI_RACCOURCIS: readonly MoiRaccourci[] = [
  { tab: 'badges', labelAr: 'الأوسمة والإنجازات' },
  { tab: 'teacher', labelAr: 'لوحة المتابعة' },
] as const;

export const MOI_RACCOURCI_COUNT = MOI_RACCOURCIS.length;
