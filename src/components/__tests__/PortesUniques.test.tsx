// PortesUniques.test.ts — verrou de la règle « une fonctionnalité = une seule
// porte principale » (recommandation d'architecture du 2026-10-11).
//
// Le défaut d'origine de l'app était le contraire : une même fonction
// accessible depuis l'accueil, le menu latéral, un hub et la page « أنا ».
// L'élève croyait avoir affaire à plusieurs outils.
//
// Ce test lit les sources et interdit qu'un onglet JOIGNABLE DEPUIS UN HUB
// (trainingHub / revisionHub / moiRaccourcis) soit AUSSI une entrée de menu
// ailleurs : navigation, accueil, barre principale.

import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { TRAINING_ENTRIES } from '../../data/trainingHub';
import { REVISION_ENTRIES } from '../../data/revisionHub';
import { MOI_RACCOURCIS } from '../../data/moiRaccourcis';

const APP = readFileSync(resolve(__dirname, '../../App.tsx'), 'utf8');
const DASHBOARD = readFileSync(resolve(__dirname, '../../components/DashboardView.tsx'), 'utf8');

/** Bloc d'un tableau nommé dans App.tsx (source de vérité de la navigation). */
function blocApp(nom: string): string {
  const i = APP.indexOf(`const ${nom}`);
  expect(i, `${nom} introuvable dans App.tsx`).toBeGreaterThan(0);
  const suite = APP.slice(i, i + 2600);
  return suite.slice(0, suite.indexOf('];'));
}

/** Toutes les cibles de navigation d'un fichier : onNavigateToTab?.('x'). */
function cibles(src: string): string[] {
  return [...src.matchAll(/onNavigateToTab\?\.\('(\w+)'\)/g)].map((m) => m[1]);
}

describe('une seule porte par fonctionnalité', () => {
  const principales = blocApp('PRIMARY_NAV');
  const secondaire = blocApp('SECONDARY_NAV');

  it('chaque espace des hubs est JOIGNABLE, et uniquement depuis son hub', () => {
    for (const e of [...TRAINING_ENTRIES, ...REVISION_ENTRIES]) {
      // 1. Monté réellement : la porte menu ne suffit pas.
      expect(APP, `${e.tab} n est monté nulle part`).toContain(`currentTab === '${e.tab}'`);
      // 2. Jamais une entrée de menu ailleurs.
      expect(principales, `${e.tab} est aussi dans la barre principale`).not.toContain(`tab: '${e.tab}'`);
      expect(secondaire, `${e.tab} est aussi dans le menu latéral`).not.toContain(`tab: '${e.tab}'`);
      // 3. Pas de raccourci en double sur l'accueil.
      expect(DASHBOARD, `${e.tab} est aussi sur l accueil`).not.toContain(`'${e.tab}'`);
    }
  });

  it('les raccourcis « أنا » ne sont pas dupliqués sur l accueil', () => {
    const ciblesAccueil = cibles(DASHBOARD);
    for (const r of MOI_RACCOURCIS) {
      expect(ciblesAccueil, `${r.tab} a une deuxième porte sur l accueil`).not.toContain(r.tab);
      // mais la rubrique existe toujours dans « أنا ».
      expect(APP, `${r.tab} n est plus monté`).toContain(`currentTab === '${r.tab}'`);
    }
  });

  it('l accueil ne garde que ce qui n a pas d autre porte', () => {
    const ciblesAccueil = cibles(DASHBOARD);
    // Portes légitimes : les deux rubriques principales et le المرشد.
    expect(ciblesAccueil).toContain('lesson');
    expect(ciblesAccueil).toContain('training');
    expect(ciblesAccueil).toContain('chat');
    // Rien d'autre.
    expect(ciblesAccueil.filter((t) => !['lesson', 'training', 'chat'].includes(t))).toEqual([]);
  });

  it('« الخرائط الذهنية » vit dans « الدروس », pas ailleurs', () => {
    expect(APP, 'mindmap est encore une entrée de menu').not.toContain("tab: 'mindmap'");
    expect(cibles(DASHBOARD), 'mindmap a une deuxième porte sur l accueil').not.toContain('mindmap');
    // La carte porte existe dans LessonsView.
    const lessons = readFileSync(resolve(__dirname, '../../components/LessonsView.tsx'), 'utf8');
    expect(lessons).toContain("onOpenTab?.('mindmap')");
  });
});
