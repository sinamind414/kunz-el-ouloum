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

    // Parite vitest : URL.createObjectURL / File.text.
    // jsdom (jest) ne fournit pas URL.createObjectURL ; vitest (happy-dom)
    // oui. Les tests BackupPanel (sprint 46) en dependent pour simuler
    // l'export du fichier de sauvegarde.
    try {
      const U = this.global.URL;
      if (U && typeof U.createObjectURL !== 'function') {
        U.createObjectURL = () => 'blob:jest-test';
      }
      if (U && typeof U.revokeObjectURL !== 'function') {
        U.revokeObjectURL = () => {};
      }
    } catch {
      /* URL non patchable : on ignore */
    }
    // File/Blob.text : jsdom ancien ne remonte pas toujours le contenu des
    // morceaux (parts) passes au constructeur. On reimplemente text() a
    // partir des parts d'origine quand c'est possible.
    try {
      const { File, Blob } = this.global;
      const patchText = (Ctor) => {
        if (!Ctor || Ctor.prototype.__jestTextPatched) return;
        const dorigine = Ctor;
        const fabrique = function (...args) {
          const inst = new dorigine(...args);
          const parts = args[0];
          if (Array.isArray(parts)) {
            const texte = parts
              .map((p) => (typeof p === 'string' ? p : ''))
              .join('');
            if (texte && typeof inst.text !== 'function') {
              inst.text = async () => texte;
            } else if (texte) {
              const textOrigine = inst.text.bind(inst);
              inst.text = async () => {
                try {
                  const v = await textOrigine();
                  if (typeof v === 'string' && v.length > 0) return v;
                } catch {
                  /* repli sur les parts d'origine */
                }
                return texte;
              };
            }
          }
          return inst;
        };
        fabrique.prototype = dorigine.prototype;
        Object.defineProperty(fabrique.prototype, '__jestTextPatched', {
          value: true,
        });
        return fabrique;
      };
      if (File) {
        const FileCorrige = patchText(File);
        if (FileCorrige) this.global.File = FileCorrige;
      }
      if (Blob) {
        const BlobCorrige = patchText(Blob);
        if (BlobCorrige) this.global.Blob = BlobCorrige;
      }
    } catch {
      /* File/Blob non patchables : on ignore */
    }
  }
};
