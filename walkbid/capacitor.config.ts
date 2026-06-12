import type { CapacitorConfig } from '@capacitor/cli';

// WalkBid native shell. US App Store storefront only (configured in App Store
// Connect — no code change). Bundle id pending registration: com.walkbid.app.
const config: CapacitorConfig = {
  appId: 'com.walkbid.app',
  appName: 'WalkBid',
  webDir: 'dist',
  backgroundColor: '#0E1013', // asphalt — dark-first
  ios: {
    contentInset: 'always',
    backgroundColor: '#0E1013',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 600,
      backgroundColor: '#0E1013',
      showSpinner: false,
    },
  },
};

export default config;
