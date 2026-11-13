// profilEleveInerte.lock.test.ts — VERROU R1 : L'OBJECTIF DE NOTE EST INERTE
// POUR LE COACH (audit coach 2026-11-06, GO propriétaire : « affichage local,
// rien de plus »).
//
// Le risque réel : demain, un raccourci relie l'objectif (16/20) au moteur —
// « cible 16 → invitations plus dures ». Ce serait une RÈGLE PÉDAGOGIQUE
// NOUVELLE jamais arbitrée, et l'objectif de l'élève deviendrait un
// instrument de pression. Ce verrou lit la SOURCE des deux côtés du pont :
//   · côté profil : la cible ne vit QUE dans le panneau + le stockage ;
//   · côté coach : la décision (invitationCapitaine) ne lit JAMAIS profEleve.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const SOURCE_PANNEAU = readFileSync(
  join(process.cwd(), 'src', 'components', 'ProfilEleveView.tsx'),
  'utf8',
);
const SOURCE_CAPITAINE = readFileSync(
  join(process.cwd(), 'src', 'lib', 'invitationCapitaine.ts'),
  'utf8',
);
const SOURCE_CLE = readFileSync(
  join(process.cwd(), 'src', 'utils', 'profilEleve.ts'),
  'utf8',
);

describe('R1 — l\'objectif de note reste INERTE pour la décision', () => {
  it('le module profil n\'est jamais importée du côté du CAPITAINE', () => {
    // Aucune mention dans la machine de décision : ni le module, ni la clé,
    // ni le mot « objectif » porteur d'une règle.
    expect(SOURCE_CAPITAINE).not.toContain('profilEleve');
    expect(SOURCE_CAPITAINE).not.toContain('boussole_profil_eleve');
  });

  it('le panneau n\'ouvre aucune porte de navigation (il n\'est pas une rubrique)', () => {
    expect(SOURCE_PANNEAU).not.toContain('onNavigate');
    expect(SOURCE_PANNEAU).not.toContain('onOuvrir');
  });

  it('la clé de profil est déclarée une fois, locale, sans réseau', () => {
    expect(SOURCE_CLE).toContain("const CLE = 'boussole_profil_eleve'");
    // Aucune requête réseau dans le module (politique §3 de l'invité).
    expect(SOURCE_CLE).not.toContain('fetch(');
    expect(SOURCE_CLE).not.toContain('XMLHttpRequest');
  });

  it('l\'étiquette de la date provisoire est RECYCLÉE, jamais reformulée', () => {
    // « Une seule voix » (R5) : le panneau importe LA constante ÉTIQUETTE,
    // il n'écrit pas sa propre variante du libellé.
    expect(SOURCE_PANNEAU).toContain('ETIQUETTE_DATE_BAC_PROVISOIRE_AR');
    expect(SOURCE_PANNEAU).not.toContain("تاريخ تقديري —");
  });
});
