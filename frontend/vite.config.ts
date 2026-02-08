import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        port: 5173,
        proxy: {
            '/api': {
                target: 'http://localhost:3000',
                changeOrigin: true,
            },
        }
    },
    build: {
        target: 'esnext',
        minify: 'esbuild',
        rollupOptions: {
            output: {
                manualChunks: {
                    'vendor-react': ['react', 'react-dom', 'react-router-dom'],
                    'vendor-antd': ['antd', '@ant-design/icons'],
                    'vendor-utils': ['xlsx', 'dayjs', 'axios', 'i18next'],
                    'vendor-charts': ['@ant-design/plots'],
                }
            }
        },
        chunkSizeWarningLimit: 1000
    }
})
