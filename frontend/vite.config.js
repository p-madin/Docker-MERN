
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/', 
  server: {
    port: 3000, // Specify your desired port
    host: true, // Needed for Docker to access the dev server
    proxy: {
      '/api': 'http://backend:5000'
    },
    watch: {
      usePolling: true, // Useful for some Docker setups to detect changes
      interval: 100,
    },
  },
});
console.log("Vite config loaded. Polling set to true.");