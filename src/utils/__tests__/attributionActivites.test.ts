// attributionActivites.test.ts — À QUI appartient le travail fait sur l'appareil ?
//
// Défaut trouvé le 14/10/2026 en répondant à la question « si l'élève donne son
// mot de passe à un autre, ça marche sur un autre téléphone ? ».
//
// Le partage d'identifiants, on ne peut pas l'empêcher (aucune plateforme ne le
// peut). Mais la file d'attente locale, elle, était GLOBALE À L'APPAREIL :
// `flushActivityQueue()` envoyait tout ce qui traînait sous le jeton présent.
// Conséquence réelle : le travail fait en mode invité par un frère ou une sœur
// était attribué à l'élève qui se connectait ensuite — dans le tableau de bord
// du professeur, sous SON nom. Ce n'est plus un problème de partage de mot de
// passe : c'est une fausse attribution de travail.
//
// Règle verrouillée ici : une activité n'est envoyée QUE sous l'identité qui
// l'a produite. Le travail d'invité ne part jamais tout seul ; il faut une
// demande explicite (« ces activités sont-elles à toi ? »).

import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import {
  compterActivitesInvite,
  effacerActivitesInvite,
  flushActivityQueue,
  importerActivitesInvite,
  logActivityLocally,
} from '../activityLog';

const QUEUE_KEY = 'boussole_activity_queue';
const TOKEN_KEY = 'boussole_token';

/** Jeton factice mais DÉCODABLE : payload { studentId } en base64url. */
function jeton(studentId: string): string {
  const b64 = (o: unknown) =>
    btoa(JSON.stringify(o)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return `${b64({ alg: 'HS256', typ: 'JWT' })}.${b64({ studentId })}.signature`;
}

function mockFetchOk() {
  const appels: Array<{ entries: any[]; events: any[] }> = [];
  const fetchMock = vi.fn(async (_url: string, init: RequestInit) => {
    appels.push(JSON.parse(String(init.body)));
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  });
  vi.stubGlobal('fetch', fetchMock);
  return { fetchMock, appels };
}

const quiz = (percent: number) =>
  logActivityLocally({ studentId: 'local', type: 'quiz', payload: { percent } });

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});
afterEach(() => {
  vi.restoreAllMocks();
});

describe('travail d’invité : jamais attribué tout seul à un compte', () => {
  it('le travail fait AVANT la connexion ne part PAS quand un compte se connecte', async () => {
    quiz(60); // aucun jeton : mode invité
    const { fetchMock, appels } = mockFetchOk();

    localStorage.setItem(TOKEN_KEY, jeton('stu_frere'));
    await flushActivityQueue();

    expect(fetchMock).not.toHaveBeenCalled();
    expect(appels).toEqual([]);
    // le travail reste en file, intact
    expect(JSON.parse(localStorage.getItem(QUEUE_KEY)!).length).toBe(1);
  });

  it('le compte qui se connecte n’hérite pas du travail d’un AUTRE compte', async () => {
    localStorage.setItem(TOKEN_KEY, jeton('stu_A'));
    quiz(80); // produit par A
    const { fetchMock } = mockFetchOk();
    await flushActivityQueue();
    expect(fetchMock).toHaveBeenCalledTimes(1); // A envoie SON travail : normal

    localStorage.setItem(TOKEN_KEY, jeton('stu_B')); // B se connecte sur le même téléphone
    quiz(10); // produit par B
    await flushActivityQueue();
    // La file ne contient plus que le travail de B (celui de A est parti).
    expect(JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]')).toEqual([]);
  });

  it('après déconnexion, le travail en attente reste marqué et repart au bon compte', async () => {
    localStorage.setItem(TOKEN_KEY, jeton('stu_A'));
    // Hors ligne : le flush échoue, la file garde le travail de A.
    const ko = vi.fn(async () => new Response('{}', { status: 500 }));
    vi.stubGlobal('fetch', ko);
    quiz(70);
    await flushActivityQueue();
    expect(JSON.parse(localStorage.getItem(QUEUE_KEY)!).length).toBe(1);

    // Déconnexion puis connexion de B : le travail de A ne doit pas partir.
    localStorage.removeItem(TOKEN_KEY);
    localStorage.setItem(TOKEN_KEY, jeton('stu_B'));
    const { fetchMock } = mockFetchOk();
    await flushActivityQueue();
    expect(fetchMock).not.toHaveBeenCalled();

    // Re-connexion de A : son travail repart, sous son identité.
    localStorage.setItem(TOKEN_KEY, jeton('stu_A'));
    await flushActivityQueue();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]')).toEqual([]);
  });
});

describe('import explicite du travail d’invité', () => {
  it('compterActivitesInvite voit le travail non attribué', () => {
    expect(compterActivitesInvite()).toBe(0);
    quiz(50);
    expect(compterActivitesInvite()).toBe(1);
  });

  it('importerActivitesInvite les rattache au compte connecté et les envoie', async () => {
    quiz(50);
    quiz(90);
    localStorage.setItem(TOKEN_KEY, jeton('stu_sara'));
    const { fetchMock, appels } = mockFetchOk();

    await importerActivitesInvite();

    expect(fetchMock).toHaveBeenCalled();
    const total = appels.reduce((n, b) => n + b.entries.length + b.events.length, 0);
    expect(total).toBe(2);
    expect(compterActivitesInvite()).toBe(0);
    expect(JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]')).toEqual([]);
  });

  it('refuser l’import ne recopie RIEN, mais ne détruit pas le travail sans le dire', async () => {
    quiz(30);
    effacerActivitesInvite();
    expect(compterActivitesInvite()).toBe(0);
    expect(JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]')).toEqual([]);
  });

  it('importer sans compte connecté ne fait rien (pas d’attribution à l’aveugle)', async () => {
    quiz(30);
    const { fetchMock } = mockFetchOk();
    await importerActivitesInvite();
    expect(fetchMock).not.toHaveBeenCalled();
    expect(compterActivitesInvite()).toBe(1);
  });
});

describe('non-régression du synchro normal', () => {
  it('le travail produit CONNECTÉ part immédiatement (comportement inchangé)', async () => {
    localStorage.setItem(TOKEN_KEY, jeton('stu_A'));
    const { fetchMock, appels } = mockFetchOk();
    quiz(100);
    await flushActivityQueue();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(appels[0].events.length).toBe(1);
    expect(JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]')).toEqual([]);
  });

  it('un jeton non décodable reste traité comme « compte » (pas de blocage du sync)', async () => {
    localStorage.setItem(TOKEN_KEY, 'jeton-opaque');
    const { fetchMock } = mockFetchOk();
    quiz(100);
    await flushActivityQueue();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
