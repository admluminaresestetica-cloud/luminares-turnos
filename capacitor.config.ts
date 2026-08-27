import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.luminares.admin',
  appName: 'Luminares Admin',
  webDir: 'public',
  server: {
    url: 'https://mireservalumin.com.ar/admin',
    cleartext: true
  }
};

export default config;