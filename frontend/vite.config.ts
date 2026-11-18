import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      target: 'es2022',
      cssCodeSplit: true,
      assetsInlineLimit: 4096,
      rollupOptions: {
        output: {
          entryFileNames: 'assets/[name]-[hash].js',
          chunkFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]',
          manualChunks(id) {
            if (id.includes('node_modules/three')) {
              return 'vendor-three';
            }
            if (id.includes('node_modules/react') || id.includes('node_modules/lucide-react')) {
              return 'vendor-ui';
            }
          },
        },
      },
    },
    server: {
      port: 3000,
      proxy: {
        '/api/auth': { target: 'http://127.0.0.1:4001', changeOrigin: true },
        '/api/usuarios': { target: 'http://127.0.0.1:4001', changeOrigin: true },
        '/api/productos': { target: 'http://127.0.0.1:4002', changeOrigin: true },
        '/api/mesas': { target: 'http://127.0.0.1:4002', changeOrigin: true },
        '/api/pedidos': { target: 'http://127.0.0.1:4003', changeOrigin: true },
      },
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
