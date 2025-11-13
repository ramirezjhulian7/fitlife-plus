import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.fitlife.app',
  appName: 'fitlife-plus',
  webDir: 'www',
  plugins: {
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#000000',
      overlaysWebView: true
    }
  }
};

export default config;
