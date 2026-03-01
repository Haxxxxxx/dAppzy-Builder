import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      include: ['buffer', 'crypto', 'stream', 'util', 'process', 'events', 'url', 'assert', 'http', 'https', 'os', 'path', 'timers'],
      globals: { Buffer: true, process: true },
    }),
  ],
  define: {
    'process.env': {},
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'build',
    sourcemap: false,
  },
  resolve: {
    alias: {
      'stream': 'stream-browserify',
    },
  },
});
