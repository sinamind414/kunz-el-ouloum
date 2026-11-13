import type { CapacitorConfig } from '@capacitor/cli';

/**
 * Capacitor 8.5.3 — H1 APK (docs/rapports/CHIFFRAGE_APK_2026-10-20.md, jalons A1-A2).
 * Dérogation package.json accordée par l'utilisateur (2026-10-21) + appId
 * confirmé : com.sinamind414.kunzelouloum (IRRÉVERSIBLE une fois publié).
 *
 * - webDir=dist : le contenu complet est EMBARQUÉ dans l'APK
 *   (android/app/src/main/assets/public/) — offline garanti dès l'installation.
 * - Serveur : optionnel dans l'app (100 % invité local, offline-first).
 *
 * Réglages natifs (targetSdk=36 exigence Play 2026, minSdk=24 pour garder
 * Android 7-8) : voir android/variables.gradle après `npx cap add android`.
 */
const config: CapacitorConfig = {
  appId: 'com.sinamind414.kunzelouloum',
  appName: 'كنز العلوم',
  webDir: 'dist',
  backgroundColor: '#006d37',
  android: {
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false,
  },
  server: {
    androidScheme: 'https',
  },
};

export default config;
