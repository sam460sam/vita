import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.vita.lifeos',
  appName: 'Vyta',
  // Vite builds the web app into dist/. `npx cap sync` copies it into the
  // native iOS/Android projects.
  webDir: 'dist',
  // Light theme to match the app's white design system.
  backgroundColor: '#090e0b',
  ios: {
    // Full-screen: let the WebView extend behind the status bar / home indicator.
    // Safe areas are handled in CSS (pt-safe-top / pb-safe-bottom), so there are
    // no white native inset bars at the top/bottom.
    contentInset: 'never',
    backgroundColor: '#090e0b',
  },
  android: {
    backgroundColor: '#090e0b',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 600,
      backgroundColor: '#090e0b',
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
