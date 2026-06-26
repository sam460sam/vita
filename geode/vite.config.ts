import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

// Capacitor-ready: relative base so the bundle works when served from
// file:// inside the native iOS WebView. `npx cap sync` copies dist/ into the
// native project.
export default defineConfig({
  base: './',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  plugins: [react()],
  build: {
    target: 'es2020',
    sourcemap: false,
  },
});
