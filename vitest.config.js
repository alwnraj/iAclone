import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'happy-dom', // Better DOM support for CodeMirror
    setupFiles: ['./tests/setup.js'],
    include: ['tests/**/*.test.js'],
    testTimeout: 10000, // Increase timeout for CodeMirror initialization
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        'src-tauri/',
        'dist/',
        '*.config.js'
      ]
    }
  },
  resolve: {
    alias: {
      '@': './src'
    }
  }
});

