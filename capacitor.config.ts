import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.vita.lifeos',
  appName: 'Vyta',
  // Vite builds the web app into dist/. `npx cap sync` copies it into the
  // native iOS/Android projects.
  webDir: 'dist',
  // Light theme to match the app's white design system.
  backgroundColor: '#ffffff',
  ios: {
    contentInset: 'always',
    backgroundColor: '#ffffff',
  },
  android: {
    backgroundColor: '#ffffff',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 600,
      backgroundColor: '#ffffff',
      showSpinner: false,
      androidScaleType: 'CENTER_CROP',
    },
    LocalNotifications: {
      smallIcon: 'ic_stat_icon',
      iconColor: '#0A0A0C',
    },
  },
};

export default config;
