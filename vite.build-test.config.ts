// vite.build-test.config.ts — configuration dédiée aux contrôles POST-BUILD.
//
// La suite unitaire (vite.config.ts) exclut `src/build/**` : ces contrôles
// lisent `dist/assets`, qui n'existe qu'après `vite build`. Les mélanger
// produisait quatre échecs permanents dans toute copie fraîche du dépôt —
// du bruit rouge qui masquait les vraies régressions.
//
// Usage : `npm run test:build` (build puis exécution de ce fichier).
import { defineConfig } from 'vite';

// Portabilité du drapeau : `VAR=1 commande` est une syntaxe POSIX — sous
// Windows (cmd/PowerShell) elle est lue comme un nom de programme et le script
// s'arrête avant même de lancer les contrôles. On fixe donc le drapeau ici,
// dans la seule configuration qui sert aux contrôles post-build, plutôt que
// dans le script npm : même intention que l'originale (`REQUIRE_BUILD_SMOKE=1
// vitest run ...`), sans dépendance cross-env et valable sous tous les OS.
// Lancer cette configuration signifie « le build est censé exister ».
process.env.REQUIRE_BUILD_SMOKE = process.env.REQUIRE_BUILD_SMOKE ?? '1';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/build/**/*.test.ts'],
  },
});
