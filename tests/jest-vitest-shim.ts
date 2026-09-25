// tests/jest-vitest-shim.ts — Pont vitest -> jest.
//
// Les 91 fichiers de tests de src/** importent { describe, it, expect, vi }
// depuis 'vitest'. Cette config Jest les fait tourner sans les reecrire :
// ce shim re-exporte les equivalents jest, mappe via jest moduleNameMapper.
//
// NOTE technique (jest 30) : l'objet `jest` injecte dans les modules n'expose
// plus describe/it/expect (seulement l'API de mocks : fn, mock, spyOn...).
// Ces fonctions sont en revanche des GLOBALES injectees par jest-environment.
// On prend donc :
//   - describe/it/test/expect/hooks  => globales de l'environnement
//   - vi.fn/vi.mock/vi.spyOn...      => objet jest (closure injectee)
//   - vi.stubGlobal / unstubAllGlobals => reimplementes (jest n'a pas d'equivalent)
//
// LIMITES (vitest-only, exclus de jest dans jest.config.cjs) :
//  - vi.mock / vi.doMock ne sont PAS hoistees par babel-plugin-jest-hoist
//    (il ne reconnait que les appels jest.*) -> l'enregistrement du mock
//    arrive apres les imports et n'a aucun effet. Les 4 fichiers concernes
//    restent couverts par vitest.
//  - vi.hoisted / vi.setSystemTime / snapshots vitest : non couverts ici.

declare const jest: any;

const g = globalThis as Record<string, any>;

export const describe = Object.assign(g.describe, {
  // vitest-only : describe.skipIf(cond) saute le bloc si cond est vrai.
  skipIf: (cond: boolean) => (cond ? g.describe.skip : g.describe),
});

// vitest accepte un objet d'options en 2e argument : it('x', { timeout: N }, fn).
// jest n'accepte que la forme numerique it('x', fn, N). On convertit.
function wrapTest(t: any) {
  const wrapper = (name: string, ...args: any[]) => {
    if (
      args.length >= 2 &&
      args[0] &&
      typeof args[0] === 'object' &&
      typeof args[1] === 'function'
    ) {
      const { timeout } = args[0] as { timeout?: number };
      return t(name, args[1], timeout);
    }
    return t(name, ...args);
  };
  // reporte .each / .skip / .only / .todo / .concurrent
  return Object.assign(wrapper, t);
}
export const it = wrapTest(g.it);
export const test = wrapTest(g.test);
export const beforeAll = g.beforeAll;
export const beforeEach = g.beforeEach;
export const afterAll = g.afterAll;
export const afterEach = g.afterEach;

// vitest accepte un message personnalise en 2e argument d'expect ; jest non.
// On enveloppe en ignorant ce message : les assertions restent exactes, seul
// le texte affiche en cas d'echec differe.
function expectVitest(actual: any, _message?: string): any {
  return g.expect(actual);
}
// reporte les utilitaires statiques : expect.any, expect.anything,
// expect.stringMatching, expect.objectContaining...
Object.keys(g.expect as object).forEach((k) => {
  (expectVitest as any)[k] = (g.expect as any)[k];
});
export const expect = expectVitest;

// Filet memoire des globals remplacees par stubGlobal (jest n'a pas
// d'equivalent a unstubAllGlobals) : restoration LIFO a l'appel.
const stubbedGlobals: Array<[PropertyKey, any]> = [];

export const vi = {
  fn: jest.fn,
  spyOn: jest.spyOn,
  // vi.mocked<T>(x) est un simple cast au runtime.
  mocked: (x: any) => x,
  // ATTENTION : non hoistee par babel-plugin-jest-hoist -> vitest-only.
  mock: jest.mock,
  unmock: jest.unmock,
  doMock: jest.doMock,
  resetAllMocks: jest.resetAllMocks,
  clearAllMocks: jest.clearAllMocks,
  restoreAllMocks: jest.restoreAllMocks,
  stubGlobal: (key: PropertyKey, value: any): void => {
    stubbedGlobals.push([key, g[key]]);
    g[key] = value;
  },
  unstubAllGlobals: (): void => {
    while (stubbedGlobals.length) {
      const [key, value] = stubbedGlobals.pop() as [PropertyKey, any];
      g[key] = value;
    }
  },
};
