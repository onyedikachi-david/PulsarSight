import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill';
import rollupNodePolyFill from 'rollup-plugin-node-polyfills';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
    include: [
      'buffer',
      'process'
    ],
    esbuildOptions: {
      define: {
        global: 'globalThis'
      },
      plugins: [
        NodeGlobalsPolyfillPlugin({
          buffer: true,
          process: true
        }),
        NodeModulesPolyfillPlugin()
      ]
    }
  },
  resolve: {
    alias: {
      crypto: 'crypto-browserify',
      stream: 'stream-browserify',
      assert: 'assert',
      http: 'stream-http',
      https: 'https-browserify',
      os: 'os-browserify',
      url: 'url',
      buffer: 'buffer',
      process: 'process/browser',
      util: 'util',
      'node:crypto': 'crypto-browserify',
      'node:stream': 'stream-browserify',
      'node:assert': 'assert',
      'node:http': 'stream-http',
      'node:https': 'https-browserify',
      'node:os': 'os-browserify',
      'node:url': 'url',
      'node:buffer': 'buffer',
      'node:util': 'util'
    }
  },
  define: {
    'process.env': {},
    global: {},
    Buffer: ['buffer', 'Buffer']
  },
  build: {
    rollupOptions: {
      plugins: [rollupNodePolyFill()]
    }
  }
});
