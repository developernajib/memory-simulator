import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      // Native fs.watch fails on network shares / some virtual drives
      // (Error: UNKNOWN: watch). Polling is slower but works everywhere.
      usePolling: true,
      interval: 300,
    },
  },
});
