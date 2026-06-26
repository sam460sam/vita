import type { CapacitorConfig } from '@capacitor/cli';

// NOTE: change `appId` to your reverse-DNS bundle id, e.g. com.yourdev.geode
const config: CapacitorConfig = {
  appId: 'com.yourdev.geode',
  appName: 'Geode',
  webDir: 'dist',
  backgroundColor: '#0a0a0d',
  ios: {
    contentInset: 'always',
    backgroundColor: '#0a0a0d',
    // Allow the camera plugin to present.
    limitsNavigationsToAppBoundDomains: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1200,
      launchAutoHide: true,
      backgroundColor: '#0a0a0d',
      showSpinner: false,
      iosSpinnerStyle: 'small',
    },
    LocalNotifications: {
      smallIcon: 'ic_stat_icon',
      iconColor: '#a87bff',
    },
  },
};

export default config;
