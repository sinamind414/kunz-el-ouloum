// pushM4.test.ts — verrous du lot M4 (Web Push).
//
// Tests de présence sur le code source : chaque défaut 🔴 relevé dans l'audit
// M4 a un verrou dédié. Aucun vi.mock → pas d'exécution dans Jest (convention
// du dépôt), ces tests tournent dans vitest.

import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const serverSrc = () => fs.readFileSync(path.resolve(process.cwd(), 'server.ts'), 'utf-8');
const storePgSrc = () => fs.readFileSync(path.resolve(process.cwd(), 'server', 'store.pg.ts'), 'utf-8');
const swSrc = () => fs.readFileSync(path.resolve(process.cwd(), 'public', 'sw.js'), 'utf-8');

describe('M4 — /api/push/send réservé à l’enseignant (défaut 🔴 diffusion par élève)', () => {
  it('server.ts utilise teacherAuth sur /api/push/send (pas studentAuth seul)', () => {
    const src = serverSrc();
    // La route /api/push/send doit être protégée par teacherAuth.
    const bloc = src.slice(src.indexOf('/api/push/send') - 60, src.indexOf('/api/push/send') + 60);
    expect(bloc).toContain('teacherAuth');
    // studentAuth ne suffit pas pour l’envoi en diffusion.
    expect(src).not.toMatch(/app\.post\("\/api\/push\/send",\s*studentAuth/);
  });

  it('/api/push/send valide la présence de VAPID_PRIVATE_KEY', () => {
    const src = serverSrc();
    expect(src).toContain('if (!VAPID_PRIVATE_KEY)');
  });
});

describe('M4 — quota 1 notification/jour par utilisateur (défaut 🔴 Postgres)', () => {
  it('listPushSubscriptions (Postgres) sérialise derniere_notif en ISO (toISOString)', () => {
    const src = storePgSrc();
    const bloc = src.slice(src.indexOf('async listPushSubscriptions'), src.indexOf('async updatePushDerniereNotif'));
    expect(bloc).toContain('new Date(row.derniere_notif).toISOString()');
    expect(bloc).not.toMatch(/String\(row\.derniere_notif\)/);
  });

  it('server.ts compare la date du jour en ISO (toISOString slice 0,10)', () => {
    const src = serverSrc();
    expect(src).toContain("new Date(s.derniere_notif).toISOString().slice(0, 10)");
    expect(src).toContain('derniere === aujourdhui');
  });
});

describe('M4 — horaire algérien 08h-22h UTC+1', () => {
  it('server.ts rejette l’envoi hors plage 08h-22h', () => {
    const src = serverSrc();
    expect(src).toContain('heureAlgerie < 8 || heureAlgerie >= 22');
    expect(src).toContain('hors_horaire_algerien');
  });
});

describe('M4 — contrôle de propriétaire sur /api/push/unsubscribe', () => {
  it('server.ts vérifie que l’abonnement appartient à l’élève avant suppression', () => {
    const src = serverSrc();
    const bloc = src.slice(src.indexOf('/api/push/unsubscribe'), src.indexOf('/api/push/send'));
    expect(bloc).toContain('abonnement_non_appartient');
    expect(bloc).toContain('student_id !== studentId');
  });
});

describe('M4 — await sur les appels de store (SQLite sync vs Postgres async)', () => {
  it('upsertPushSubscription est awaité', () => {
    const src = serverSrc();
    expect(src).toContain('await store.upsertPushSubscription');
  });

  it('removePushSubscription est awaité (désabonnement + purge 410)', () => {
    const src = serverSrc();
    expect(src).toContain('await store.removePushSubscription');
  });

  it('updatePushDerniereNotif est awaité après envoi', () => {
    const src = serverSrc();
    expect(src).toContain('await store.updatePushDerniereNotif');
  });
});

describe('M4 — Service Worker : clic sur notification ouvre l’app', () => {
  it('sw.js résout l’URL relative contre self.location.origin (pas TypeError)', () => {
    const src = swSrc();
    expect(src).toContain("new URL(url, self.location.origin)");
    expect(src).not.toMatch(/new URL\(url\)\)/);
  });

  it('sw.js annonce lang ar et dir rtl sur la notification', () => {
    const src = swSrc();
    expect(src).toContain("lang: 'ar'");
    expect(src).toContain("dir: 'rtl'");
  });

  it('sw.js titre et corps par défaut en arabe', () => {
    const src = swSrc();
    expect(src).toContain('تذكير بالمراجعة');
    expect(src).toContain('حان الوقت لمراجعة');
  });
});

describe('M4 — composant PushOptIn en arabe (فصحى)', () => {
  it('PushOptIn.tsx n’affiche aucun libellé français', () => {
    const src = fs.readFileSync(path.resolve(process.cwd(), 'src', 'components', 'PushOptIn.tsx'), 'utf-8');
    // Mots français interdits dans l’UI affichée.
    const interdits = [
      'Rappels de révision',
      'Activer les rappels',
      'Pas maintenant',
      'Les rappels de révision sont activés',
      'Vous avez refusé',
      'Votre navigateur ne supporte pas',
    ];
    for (const mot of interdits) {
      expect(src).not.toContain(mot);
    }
  });

  it('PushOptIn.tsx contient des libellés arabes', () => {
    const src = fs.readFileSync(path.resolve(process.cwd(), 'src', 'components', 'PushOptIn.tsx'), 'utf-8');
    expect(src).toContain('تذكيرات المراجعة المتباعدة');
    expect(src).toContain('تفعيل التذكيرات');
    expect(src).toContain('ليس الآن');
  });
});
