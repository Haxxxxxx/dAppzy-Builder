import { defineConfig, transformWithEsbuild } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { visualizer } from 'rollup-plugin-visualizer';

// Custom plugin to treat .js files as JSX (CRA compatibility)
const jsxInJs = {
  name: 'treat-js-as-jsx',
  enforce: 'pre',
  async transform(code, id) {
    if (!/src\/.*\.js$/.test(id)) return null;
    return transformWithEsbuild(code, id, {
      loader: 'jsx',
      jsx: 'automatic',
    });
  },
};

export default defineConfig({
  plugins: [
    jsxInJs,
    react(),
    nodePolyfills({
      include: ['buffer', 'crypto', 'stream', 'util', 'process', 'events', 'url', 'assert', 'http', 'https', 'os', 'path', 'timers'],
      globals: { Buffer: true, process: true },
    }),
    visualizer({ open: false, filename: 'bundle-stats.html', gzipSize: true }),
  ],
  define: {
    'process.env': {},
  },
  server: {
    port: 3000,
    open: true,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    exclude: ['e2e/**', 'node_modules/**', 'functions/**'],
  },
  build: {
    outDir: 'build',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/storage'],
          'vendor-antd': ['antd'],
          'vendor-solana': ['@solana/web3.js'],
          'vendor-ethers': ['ethers'],
          'vendor-dnd': ['react-dnd', 'react-dnd-html5-backend'],
        },
      },
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: { '.js': 'jsx' },
    },
  },
  resolve: {
    alias: {
      'stream': 'stream-browserify',
    },
  },
});
