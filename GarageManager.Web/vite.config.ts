import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    // Same origin in development, which is where sprint 5 is heading anyway: the API will
    // serve the built SPA. Without this, /api resolves against the Vite dev server and
    // every request 404s.
    proxy: {
      '/api': {
        target: 'http://localhost:5275',
        changeOrigin: true,
      },
    },
  },
});
