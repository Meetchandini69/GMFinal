import { defineConfig, loadEnv } from 'vite';
import { readFileSync } from 'node:fs';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
  plugins: [react(), tailwindcss(), {
    name: 'pages-api-proxy',
    generateBundle() {
      const template = readFileSync(path.resolve(__dirname, 'server/pages-proxy.js'), 'utf8');
      this.emitFile({ type: 'asset', fileName: '_worker.js', source: template.replace("'__BACKEND_ORIGIN__'", JSON.stringify(env.API_ORIGIN || env.VITE_API_URL || '')) });
      this.emitFile({ type: 'asset', fileName: '_routes.json', source: JSON.stringify({ version: 1, include: ['/api/*', '/uploads/*'], exclude: [] }) });
    },
  }],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/uploads': { target: 'http://localhost:3001', changeOrigin: true },
    },
    host: true,
    allowedHosts: true,
  },
};
});
