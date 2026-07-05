import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/admin/' : '/',
  build: {
    outDir: path.resolve(__dirname, '../backend/public/admin'),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return;
          }

          if (id.includes('react-router')) {
            return 'router';
          }

          if (id.includes('@tanstack')) {
            return 'tanstack';
          }

          if (
            id.includes('react-hook-form') ||
            id.includes('@hookform') ||
            id.includes('zod')
          ) {
            return 'forms';
          }

          if (id.includes('@radix-ui') || id.includes('lucide-react')) {
            return 'ui';
          }

          if (id.includes('@tiptap')) {
            return 'tiptap';
          }

          if (id.includes('recharts') || id.includes('d3-')) {
            return 'charts';
          }

          if (id.includes('@fullcalendar')) {
            return 'calendar';
          }

          if (id.includes('react-select')) {
            return 'select';
          }

          return 'vendor';
        },
      },
    },
  },
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api': 'http://127.0.0.1:8000',
      '/storage': 'http://127.0.0.1:8000',
    },
  },
}));
