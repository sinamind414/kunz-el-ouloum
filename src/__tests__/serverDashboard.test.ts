// serverDashboard.test.ts — verrous « activité réelle » (actifs 7j/30j).
// Base SQLite EN MÉMOIRE, dates FIXES injectées (aucun mock d'horloge) :
//   stu_a : production J-2, événement J-1  → actif 7j ET 30j
//   stu_b : événement J-20                  → actif 30j seulement
//   stu_c : production J-40                 → inactif
// NB sandbox : better-sqlite3 est un binaire NATIF — si les bindings ne sont
// pas compilés (réseau sans accès aux prebuilds), les tests d'intégration
// SQL sont SAUTÉS explicitement (skipIf) ; la logique pure (activite.ts) et
// l'analyse statique de server.ts restent VERROUILLÉES partout. En déploiement
// (où `npm ci` complet passe), ces tests tournent réellement.

import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { resumeActivite, calculeActivite } from '../../server/activite';
import type { SqliteStore as TSqliteStore } from '../../server/store';

// Détection SANS faire échouer le chargement du fichier de test.
let store: TSqliteStore | null = null;
try {
  const { SqliteStore } = await import('../../server/store');
  store = new SqliteStore(':memory:');
} catch {
  store = null; // bindings natifs absents → intégration sautée, plus bas
}
const sqliteDispo = store !== null;

const MAINTENANT = Date.parse('2026-09-20T12:00:00.000Z');
const JOUR = 24 * 60 * 60 * 1000;
const iso = (joursAvant: number) => new Date(MAINTENANT - joursAvant * JOUR).toISOString();

function storeNeuf(): TSqliteStore {
  if (!store) throw new Error('better-sqlite3 indisponible');
  for (const [id, nom] of [['stu_a', 'أمين'], ['stu_b', 'بدر'], ['stu_c', 'وسام']] as const) {
    store.createStudent(id, `${id}@ecole.dz`, 'hash-invalide-pour-test', nom);
  }
  return store;
}

function entryDe(studentId: string, id: string, joursAvant: number) {
  return {
    id,
    studentId,
    verbId: 'decrire',
    theme: 'test',
    stage: 2,
    text: 'نص تجريبي',
    icm: 60,
    criteriaSummary: [{ label: 'تعريف دقيق', passed: true }],
    errorTags: ['vagueness'],
    createdAt: iso(joursAvant),
  };
}

function eventDe(studentId: string, id: string, joursAvant: number) {
  return {
    id,
    studentId,
    type: 'quiz' as const,
    payload: { percent: 80 },
    createdAt: iso(joursAvant),
  };
}

describe.skipIf(!sqliteDispo)('activité réelle — dashboardRows (SQLite en mémoire)', () => {
  it('drapeaux 7j/30j et lastActivity = max(production, événement)', () => {
    const st = storeNeuf();
    st.addEntriesIfNew('stu_a', [entryDe('stu_a', 'a1', 2)]);
    st.addActivitiesIfNew('stu_a', [eventDe('stu_a', 'a2', 1)]);
    st.addActivitiesIfNew('stu_b', [eventDe('stu_b', 'b1', 20)]);
    st.addEntriesIfNew('stu_c', [entryDe('stu_c', 'c1', 40)]);

    const rows = st.dashboardRows(MAINTENANT);
    expect(rows).toHaveLength(3);
    const par = Object.fromEntries(rows.map((r) => [r.id, r]));

    expect(par.stu_a.actif7j).toBe(true);
    expect(par.stu_a.actif30j).toBe(true);
    expect(par.stu_a.lastActivity).toBe(iso(1)); // événement J-1 > production J-2

    expect(par.stu_b.actif7j).toBe(false);
    expect(par.stu_b.actif30j).toBe(true);
    expect(par.stu_b.lastActivity).toBe(iso(20));

    expect(par.stu_c.actif7j).toBe(false);
    expect(par.stu_c.actif30j).toBe(false);
    expect(par.stu_c.lastActivity).toBe(iso(40));
  });

  it('resume : inscrits=3, actifs7j=1, actifs30j=2 (les dates fixes ci-dessus)', () => {
    const st = storeNeuf();
    st.addEntriesIfNew('stu_a', [entryDe('stu_a', 'a1', 2)]);
    st.addActivitiesIfNew('stu_a', [eventDe('stu_a', 'a2', 1)]);
    st.addActivitiesIfNew('stu_b', [eventDe('stu_b', 'b1', 20)]);
    st.addEntriesIfNew('stu_c', [entryDe('stu_c', 'c1', 40)]);

    const resume = resumeActivite(st.dashboardRows(MAINTENANT), MAINTENANT);
    expect(resume).toEqual({ inscrits: 3, actifs7j: 1, actifs30j: 2 });
  });

  it('élève sans aucune activité : drapeaux faux, lastActivity null (pas de crash)', () => {
    const st = storeNeuf();
    const rows = st.dashboardRows(MAINTENANT);
    for (const r of rows) {
      expect(r.actif7j).toBe(false);
      expect(r.actif30j).toBe(false);
      expect(r.lastActivity).toBeNull();
    }
  });

  it('export CSV (itérateur) : mêmes drapeaux que le dashboard, lastActivity cohérent', () => {
    const st = storeNeuf();
    st.addEntriesIfNew('stu_a', [entryDe('stu_a', 'a1', 2)]);
    st.addActivitiesIfNew('stu_a', [eventDe('stu_a', 'a2', 1)]);
    st.addActivitiesIfNew('stu_b', [eventDe('stu_b', 'b1', 20)]);

    const rows = [...st.iterateExportRows(undefined, MAINTENANT)];
    const par = Object.fromEntries(rows.map((r) => [r.id, r]));
    expect(par.stu_a.actif7j).toBe(true);
    expect(par.stu_a.lastActivity).toBe(iso(1));
    expect(par.stu_b.actif30j).toBe(true);
    expect(par.stu_b.actif7j).toBe(false);
  });
});

describe('activité réelle — logique pure + contrat serveur (tournent PARTOUT)', () => {
  it('calculeActivite : date non parseable = drapeau faux (donnée douteuse ≠ panne)', () => {
    const act = calculeActivite(['pas-une-date', iso(1)], MAINTENANT);
    expect(act.actif7j).toBe(true); // l'autre date est saine
    expect(act.lastActivity).toBe(iso(1));
    expect(calculeActivite(['pas-une-date'], MAINTENANT).actif30j).toBe(false);
    expect(calculeActivite([null, undefined], MAINTENANT)).toEqual({
      lastActivity: null,
      actif7j: false,
      actif30j: false,
    });
  });

  it('resumeActivite : comptage fidèle des drapeaux', () => {
    expect(
      resumeActivite(
        [
          { actif7j: true, actif30j: true },
          { actif7j: false, actif30j: true },
          { actif7j: false, actif30j: false },
        ],
        MAINTENANT,
      ),
    ).toEqual({ inscrits: 3, actifs7j: 1, actifs30j: 2 });
  });

  it('la route /api/teacher/dashboard expose resume + le CSV a les colonnes (analyse statique server.ts)', () => {
    const src = readFileSync(join(process.cwd(), 'server.ts'), 'utf-8');
    expect(src).toContain('resume: resumeActivite(students)');
    expect(src).toContain('"last_activity", "actif_7j", "actif_30j"');
    expect(src).toContain('calculeActivite'); // branche CSV mono-élève
  });
});
