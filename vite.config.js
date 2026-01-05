import { defineConfig } from 'vite';

export default defineConfig({
  // Vite options tailored for Tauri development
  clearScreen: false,
  server: {
    port: 5500,
    strictPort: true,
    watch: {
      // Tell vite to watch src directory
      ignored: ['**/src-tauri/**']
    }
  },
  // Env variables starting with VITE_ will be exposed to your source code
  envPrefix: ['VITE_', 'TAURI_'],
  build: {
    // Tauri uses Chromium on Windows and WebKit on macOS and Linux
    target: process.env.TAURI_PLATFORM == 'windows' ? 'chrome105' : 'safari13',
    // Optimize for production
    minify: !process.env.TAURI_DEBUG ? 'esbuild' : false,
    // Produce sourcemaps for debug builds only
    sourcemap: !!process.env.TAURI_DEBUG,
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
    // Rollup options for better tree-shaking
    rollupOptions: {
      output: {
        manualChunks: undefined // Single bundle for smaller size
      }
    },
    outDir: '../dist'
  },
  root: 'src'
});

