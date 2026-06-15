import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'node:path';

// Use absolute base on Vercel (detected via env), relative base for Capacitor local file serving.
const isVercel = !!process.env.VERCEL;

export default defineConfig({
  base: isVercel ? '/' : './',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'GETTO',
        short_name: 'GETTO',
        description: 'Gestionale per pavimentatori in calcestruzzo — cantieri, preventivi, firma, meteo, incassi.',
        theme_color: '#F55100',
        background_color: '#070710',
        display: 'standalone',
        orientation: 'portrait',
        start_url: isVercel ? '/#/' : './#/',
        scope: isVercel ? '/' : './',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        navigateFallback: 'index.html',
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true,
      },
    }),
  ],
  build: {
    target: 'es2020',
  },
});
