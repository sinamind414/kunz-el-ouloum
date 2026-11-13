// Phase 4 / R10 (2026-11-07) — PRE-VERIFICATIONS AUTOMATISEES, PAS TERRAIN.
//
// R10 demande Redmi / Samsung A <= 2 Go, 3G intermittente, 360 px, texte
// agrandi, bouton Retour Android, 1 scenario hors ligne. jsdom ne fait PAS
// de layout et le sandbox n'a aucun appareil : tout cela reste
// « Non vérifiable ». Ce verrou gele uniquement ce qui est MESURABLE dans le
// depot, pour que les garde-fous existants ne disparaissent pas en silence.
//
// Il ne pretend PAS valider un rendu mobile. Voir
// PLAN_PHASES_RESTANTES_2026-11-07.md § PHASE 4.

import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const lire = (p: string) => readFileSync(resolve(process.cwd(), p), 'utf8');
const present = (p: string) => existsSync(resolve(process.cwd(), p));

describe('Phase 4 / R10 : socle mesurable du mobile', () => {
  it('le viewport suit la largeur de l appareil (index.html, protege, lu seulement)', () => {
    const html = lire('index.html');
    expect(html).toContain('name="viewport"');
    expect(html).toContain('width=device-width');
    expect(html).toContain('initial-scale=1.0');
    expect(html).toContain('viewport-fit=cover');
  });

  it('le bouton Retour Android est ecoute ET nettoye (pas de fuite d ecouteurs)', () => {
    const app = lire('src/App.tsx');
    expect(app).toContain("addEventListener('popstate'");
    expect(app).toContain("addEventListener('hashchange'");
    expect(app).toContain("removeEventListener('popstate'");
    expect(app).toContain("removeEventListener('hashchange'");
  });

  it('aucune permission de notification demandee au chargement de App', () => {
    expect(lire('src/App.tsx')).not.toContain('Notification.requestPermission');
  });

  it('les 4 controles post-build existent toujours (offline, budget, chunks, lhx_)', () => {
    for (const f of [
      'src/build/offlineAssets.test.ts',
      'src/build/bundleBudget.test.ts',
      'src/build/lazyRouteChunks.smoke.test.ts',
      'src/build/tutorLeconsJson.lock.test.ts',
    ]) {
      expect(present(f), `${f} supprime`).toBe(true);
    }
  });
});

describe('Phase 4 / R10 : la limite est documentee, pas masquee', () => {
  it('le plan nomme explicitement les elements « Non verifiable »', () => {
    const plan = lire('PLAN_PHASES_RESTANTES_2026-11-07.md');
    for (const marqueur of ['360 px', '3G', 'Retour Android', 'Non vérifiable']) {
      expect(plan, marqueur).toContain(marqueur);
    }
  });
});
