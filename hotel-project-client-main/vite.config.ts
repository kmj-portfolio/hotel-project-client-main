import { defineConfig, loadEnv, type ConfigEnv } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';

export default defineConfig(({ mode }: ConfigEnv) => {
  const env = loadEnv(mode, process.cwd(), '');
  const keyPath = env.VITE_SSL_KEY;
  const certPath = env.VITE_SSL_CERT;

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    server: {
      https: {
        key: fs.readFileSync(path.resolve(__dirname, keyPath)),
        cert: fs.readFileSync(path.resolve(__dirname, certPath)),
      },
      proxy: {
        '/api': {
          target: env.VITE_API_BASE_URL,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
  };
});
