// vite.build-test.config.ts — configuration dédiée aux contrôles POST-BUILD.
//
// La suite unitaire (vite.config.ts) exclut `src/build/**` : ces contrôles
// lisent `dist/assets`, qui n'existe qu'après `vite build`. Les mélanger
// produisait quatre échecs permanents dans toute copie fraîche du dépôt —
// du bruit rouge qui masquait les vraies régressions.
//
// Usage : `npm run test:build` (build puis exécution de ce fichier).
import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/build/**/*.test.ts'],
  },
});
