// assainissementSync.cablage.test.ts — LE MODULE NE SERT À RIEN S'IL N'EST PAS BRANCHÉ.
//
// Un assainissement qui existe mais que la route n'appelle pas est un fichier
// mort : le serveur continuerait d'accepter `icm: 9999`. Ces tests vérifient le
// câblage réel — route, réponse au client, et affichage côté élève.
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import {
  compterRefusSync,
  detaillerRefusSync,
  effacerRefusSync,
} from '../utils/activityLog';

const lire = (p: string) => fs.readFileSync(path.resolve(process.cwd(), p), 'utf-8');
const serveur = () => lire('server.ts');

describe('la route de synchronisation assainit AVANT de stocker', () => {
  it('elle importe le module d’assainissement', () => {
    expect(serveur()).toContain(
      'import { assainirEntrees, assainirActivites, fusionnerRefus } from "./src/server/assainirEntrees"',
    );
  });

  it('elle assainit, puis stocke les entrées ACCEPTÉES seulement', () => {
    const src = serveur();
    expect(src).toContain('const rapportEntrees = assainirEntrees(entries);');
    expect(src).toContain('const rapportActivites = assainirActivites(events);');
    // Le point décisif : on ne passe plus `entries` / `events` bruts au stockage.
    expect(src).toContain('store.addEntriesIfNew(studentId, rapportEntrees.acceptees)');
    expect(src).toContain('store.addActivitiesIfNew(studentId, rapportActivites.acceptees)');
    expect(src, 'les tableaux bruts ne doivent plus atteindre le stockage').not.toContain(
      'store.addEntriesIfNew(studentId, entries)',
    );
    expect(src).not.toContain('store.addActivitiesIfNew(studentId, events)');
  });

  it('les refus sont JOURNALISÉS, pas silencieux', () => {
    const src = serveur();
    expect(src).toContain('[sync] refus pour');
    expect(src).toContain('fusionnerRefus(rapportEntrees.refus, rapportActivites.refus)');
  });

  it('la réponse au client contient le détail des refus', () => {
    const src = serveur();
    const reponse = /res\.json\(\{[\s\S]{0,400}?refuses,[\s\S]{0,300}?\}\)/.exec(src);
    expect(reponse, 'le champ `refuses` doit être renvoyé au client').toBeTruthy();
  });
});

describe('le client ne perd pas l’information', () => {
  it('il lit `refuses` dans la réponse et l’enregistre', () => {
    const client = lire('src/utils/activityLog.ts');
    const lecture = client.indexOf('await res.json()');
    const stockage = client.indexOf('enregistrerRefus(data.refuses)');
    expect(lecture).toBeGreaterThan(0);
    expect(stockage).toBeGreaterThan(lecture);
  });

  it('la file est vidée de ces éléments (pas de renvoi en boucle)', () => {
    const client = lire('src/utils/activityLog.ts');
    // Après un 200, le lot envoyé est retiré par identifiant — donc les éléments
    // refusés partent de la file au lieu d'être renvoyés indéfiniment.
    expect(client).toContain('writeQueue(readQueue().filter(i => !sent.has(itemKey(i))))');
  });

  it('le compteur est cumulatif et remis à zéro sur action de l’élève', () => {
    localStorage.clear();
    expect(compterRefusSync()).toBe(0);
    localStorage.setItem(
      'boussole_sync_refus',
      JSON.stringify({ total: 3, raisons: { icm_hors_bareme: 2, date_future_corrigee: 1 }, dernier: 'x' }),
    );
    expect(compterRefusSync()).toBe(3);
    expect(detaillerRefusSync().raisons.icm_hors_bareme).toBe(2);
    effacerRefusSync();
    expect(compterRefusSync()).toBe(0);
  });

  it('une valeur illisible ne fait pas planter la lecture', () => {
    for (const mauvais of ['pas du json', '{"total":"x"}', '{"total":-4}', '{}']) {
      localStorage.setItem('boussole_sync_refus', mauvais);
      expect(compterRefusSync(), mauvais).toBe(0);
    }
  });
});

describe('l’élève est prévenu, il ne croit pas son travail arrivé', () => {
  it('le tableau de bord lit le compteur au montage', () => {
    const vue = lire('src/components/DashboardView.tsx');
    expect(vue).toContain('setRefusSync(compterRefusSync());');
    expect(vue).toContain('setRaisonsRefus(detaillerRefusSync().raisons);');
  });

  it('un bandeau existe, avec un testid stable', () => {
    const vue = lire('src/components/DashboardView.tsx');
    expect(vue).toContain('data-testid="bandeau-refus-sync"');
    expect(vue).toContain('لم تُسجَّل {refusSync} عناصر عند أستاذك');
  });

  it('il ne s’affiche QUE s’il y a des refus', () => {
    const vue = lire('src/components/DashboardView.tsx');
    expect(vue).toContain('{connecte && refusSync > 0 && (');
  });

  it('les raisons sont listées, pas résumées en un nombre opaque', () => {
    const vue = lire('src/components/DashboardView.tsx');
    expect(vue).toContain('Object.entries(raisonsRefus).map');
  });

  it('le bandeau d’import des activités d’invité laisse la place au bandeau de refus', () => {
    // Deux bandeaux empilés sur un écran de téléphone, c'est un de trop.
    const vue = lire('src/components/DashboardView.tsx');
    expect(vue).toContain('{connecte && refusSync === 0 && activitesInvite > 0 && (');
  });

  it('l’élève peut fermer le message (sinon il reste à vie)', () => {
    const vue = lire('src/components/DashboardView.tsx');
    expect(vue).toContain('effacerRefusSync();');
  });
});

describe('ce que l’assainissement ne prétend PAS faire', () => {
  it('le module dit noir sur blanc qu’il ne vérifie pas la qualité de la copie', () => {
    const src = lire('src/server/assainirEntrees.ts');
    expect(src).toContain('il ne vérifie PAS que');
    expect(src).toContain('chantier A4');
  });

  it('le barème vient du moteur réel : ICM entier 0-100, étapes 1-4', () => {
    const src = lire('src/server/assainirEntrees.ts');
    expect(src).toContain('export const ICM_MAX = 100');
    expect(src).toContain('export const STAGE_MAX = 4');
    // Les étapes doivent correspondre au moteur méthodologique, pas à une
    // invention : `StepId = 1 | 2 | 3 | 4`.
    //
    // 14/10/2026 — la DÉCLARATION a été déplacée dans `data/errorTaxonomy.ts`
    // (module léger : la taxonomie des erreurs n'a plus à entraîner les 105 Ko
    // du moteur dans le bundle d'entrée). L'intention du test est conservée et
    // renforcée : on vérifie le type LÀ OÙ IL EST DÉCLARÉ, et on vérifie que le
    // moteur le ré-exporte toujours — sinon le lien avec le barème du serveur
    // serait silencieusement rompu.
    const taxonomie = lire('src/data/errorTaxonomy.ts');
    expect(taxonomie).toContain('export type StepId = 1 | 2 | 3 | 4;');
    const moteur = lire('src/data/methodologyEngine.ts');
    expect(moteur).toContain("export type { ErrorStep, ErrorTaxonomyItem, StepId } from './errorTaxonomy'");
  });
});
