import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The admin SPA builds to dist/, which src/admin/server.ts serves on :3200.
// `vite dev` (port 3201) proxies API/auth calls to the admin backend.
export default defineConfig({
    root: __dirname,
    plugins: [react()],
    base: '/',
    build: {
        outDir: 'dist',
        emptyOutDir: true,
    },
    server: {
        port: 3201,
        proxy: {
            '/graphql': 'http://localhost:3200',
            '/auth': 'http://localhost:3200',
            '/logout': 'http://localhost:3200',
            '/version': 'http://localhost:3200',
        },
    },
});
