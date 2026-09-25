// tests/jest-jsdom-node-env.cjs — environnement jsdom jest + globales Node.
//
// Vitest expose dans son environnement jsdom les globales fetch/Response/Request
// (undici) ; jest-environment-jsdom non. Or plusieurs tests construisent
// `new Response(...)` dans des mocks de fetch. On les reporte depuis Node
// (>= 18) pour la parite des deux runners, sans toucher aux fichiers de tests.
//
// Second point : jsdom definit `localStorage` via un accesseur NON inscriptible.
// `global.localStorage = fake` (mock de quota depasse) echoue alors
// silencieusement. On le rend inscriptible sans changer d'objet.

const jsdomPkg = require('jest-environment-jsdom');
const JsdomEnvironment = jsdomPkg.default || jsdomPkg.TestEnvironment || jsdomPkg;

module.exports = class JsdomNodeEnvironment extends JsdomEnvironment {
  async setup() {
    await super.setup();

    if (typeof this.global.fetch === 'undefined' && typeof fetch === 'function') {
      this.global.fetch = fetch;
    }
    if (typeof this.global.Response === 'undefined' && typeof Response === 'function') {
      this.global.Response = Response;
    }
    if (typeof this.global.Request === 'undefined' && typeof Request === 'function') {
      this.global.Request = Request;
    }

    try {
      const ls = this.global.localStorage;
      if (ls) {
        Object.defineProperty(this.global, 'localStorage', {
          value: ls,
          writable: true,
          configurable: true,
        });
      }
    } catch {
      /* localStorage indisponible : on ignore */
    }
  }
};
