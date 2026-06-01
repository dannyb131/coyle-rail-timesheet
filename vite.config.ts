import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import basicSsl from '@vitejs/plugin-basic-ssl';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/coyle-rail-timesheet/',
  server: {
    host: '0.0.0.0',
  },
  plugins: [
    basicSsl(),
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'logo.jpg'],
      manifest: {
        name: 'Coyle Rail Timesheet',
        short_name: 'Timesheet',
        description: 'Record of Hours Worked - Coyle Rail',
        theme_color: '#2d6a4f',
        background_color: '#f0f4f0',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/coyle-rail-timesheet/',
        start_url: '/coyle-rail-timesheet/',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: '/favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js',
    }),
  ],
});
