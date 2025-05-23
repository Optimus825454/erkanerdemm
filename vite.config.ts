import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { type Plugin } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: '/',
  plugins: [
    react(),
  ],
  publicDir: 'public',
  build: {
    target: 'es2015', // Daha eski bir hedef, daha az bellek kullanır
    minify: 'esbuild', // Daha az bellek kullanan minifier
    chunkSizeWarningLimit: 500, // Chunk boyutunu daha sıkı kontrol et
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor'; // Node_modules'u ayrı tut
          }
        }
      },
    },
  },
  server: {
    hmr: {
      overlay: false
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  }
});