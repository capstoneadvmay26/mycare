// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',       // VitePWA auto-registers the SW
      includeAssets: [
        'favicon.svg',
        'favicon-32x32.png',
        'favicon-16x16.png',
        'apple-touch-icon.png',
      ],
      manifest: {
        name: 'MyCare Health Platform',
        short_name: 'MyCare',
        description: 'Your personal healthcare management portal.',
        theme_color: '#0033CC',
        background_color: '#FFFFFF',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/mycare/',
        start_url: '/mycare/',
        icons: [
          {
            src: '/mycare/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/mycare/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/mycare/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable',
          },
          {
            src: '/mycare/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
        screenshots: [
          // ─── Mobile (narrow) ───
          {
            src: '/mycare/screenshots/mobile-onboarding.png',
            sizes: '320x714',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'Sign in to MyCare',
          },
          {
            src: '/mycare/screenshots/mobile-home.png',
            sizes: '320x714',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'Medications list',
          },
          {
            src: '/mycare/screenshots/mobile-symptoms.png',
            sizes: '320x714',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'Symptom tracking',
          },
          // ─── Desktop (wide) ───
          {
            src: '/mycare/screenshots/desktop-home.png',
            sizes: '1280x1024',
            type: 'image/png',
            form_factor: 'wide',
            label: 'MyCare dashboard',
          },
          {
            src: '/mycare/screenshots/desktop-medications.png',
            sizes: '1280x1024',
            type: 'image/png',
            form_factor: 'wide',
            label: 'Medications management',
          },
          {
            src: '/mycare/screenshots/desktop-symptoms.png',
            sizes: '1280x1024',
            type: 'image/png',
            form_factor: 'wide',
            label: 'Symptoms overview',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        // 🆕 Merge Firebase messaging handler into VitePWA's SW
        importScripts: ['firebase-messaging-sw.js'],
        // Don't cache API requests
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/mycare-backend.*\/api\/.*/i,
            handler: 'NetworkOnly',
          },
          {
            urlPattern: /^https:\/\/mycare-b8tr\.onrender\.com\/api\/.*/i,
            handler: 'NetworkOnly',
          },
        ],
      },
    }),
  ],
  base: '/mycare/',
})