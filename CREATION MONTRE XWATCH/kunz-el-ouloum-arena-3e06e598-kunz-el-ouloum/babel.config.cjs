// babel.config.cjs — NE SERT QU'A JEST (transform TypeScript + JSX).
//
// Vite (build/dev) et tsx utilisent esbuild et ignorent ce fichier. Mais
// @vitejs/plugin-react lit babel.config.* s'il existe : le garde-fou
// ci-dessous le rend inactif hors de l'environnement de test pour ne jamais
// interferer avec le bundle (NODE_ENV=production/development).
//
// Jest met NODE_ENV=test automatiquement.
//
// Plugin local : `import.meta` est de l'ESM pur (utilise par 6 fichiers pour
// import.meta.env / .url / .dirname). Babel ne le convertit pas en CJS ;
// jest refuse alors le module. On le remplace par un objet calcule a
// l'execution (url/dirname corrects par fichier, env mocke en mode test).

/** @type {import('@babel/core').TransformOptions} */
module.exports = (api) => {
  api.cache.using(() => process.env.NODE_ENV);
  if (!api.env('test')) {
    return { plugins: [] };
  }
  return {
    presets: [
      ['@babel/preset-env', { targets: { node: 'current' } }],
      ['@babel/preset-typescript'],
      ['@babel/preset-react', { runtime: 'automatic' }],
    ],
    plugins: [jestImportMetaPlugin],
  };
};

function jestImportMetaPlugin({ types: t, template }) {
  return {
    name: 'jest-replace-import-meta',
    visitor: {
      Program: {
        exit(path) {
          let usesImportMeta = false;
          path.traverse({
            MetaProperty(p) {
              const { node } = p;
              if (
                t.isIdentifier(node.meta, { name: 'import' }) &&
                t.isIdentifier(node.property, { name: 'meta' })
              ) {
                usesImportMeta = true;
                p.replaceWith(t.callExpression(t.identifier('__jestImportMeta'), []));
              }
            },
          });
          if (usesImportMeta) {
            path.unshiftContainer(
              'body',
              template.ast(
                'function __jestImportMeta() {' +
                  "  return {" +
                  "    url: require('url').pathToFileURL(__filename).href," +
                  '    dirname: __dirname,' +
                  "    env: { DEV: false, MODE: 'test', PROD: false }," +
                  '  };' +
                  '}'
              )
            );
          }
        },
      },
    },
  };
}
