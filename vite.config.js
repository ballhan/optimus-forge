import { defineConfig } from 'vite';
export default defineConfig({
  base: './',
  server: { host: '127.0.0.1' },
  build: {
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      input: { main: 'index.html', bumblebee: 'bumblebee.html' },
    },
  },
});
