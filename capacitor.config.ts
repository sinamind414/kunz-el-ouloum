import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.kunzelouloum.app',
  appName: 'Kunz El Ouloum',
  webDir: 'dist',
  android: {
    allowMixedContent: false
  }
};

export default config;
