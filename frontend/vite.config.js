import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { visualizer } from 'rollup-plugin-visualizer'
import path from 'node:path'

// Build:
//   npm run build           — oddiy build
//   npm run build -- --analyze=true   — natijani dist/stats.html da ko'rsatadi
//
// ANALYZE env yoki "--analyze=true" parametri bilan visualizer yoqiladi.
const ANALYZE = process.env.ANALYZE === 'true' || process.argv.includes('--analyze=true')

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // Bundle tahlilini stats.html ga yaratadi (faqat analyze rejimida)
    ANALYZE && visualizer({
      filename: 'dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
      template: 'treemap', // 'sunburst' yoki 'network' ham bor
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // Asosiy chunk hajm ogohlantirish limiti
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        // Manual chunking — yirik kutubxonalarni alohida fayllarga ajratadi.
        // Natijada brauzer parallel yuklab oladi va kesh qulayroq ishlaydi.
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // React core
            if (id.includes('/react/') || id.includes('/react-dom/') ||
                id.includes('/scheduler/')) {
              return 'vendor-react'
            }
            // Router
            if (id.includes('react-router')) {
              return 'vendor-router'
            }
            // Server state (TanStack Query)
            if (id.includes('@tanstack/react-query')) {
              return 'vendor-query'
            }
            // Forms (Hook Form + Zod + Resolvers)
            if (id.includes('react-hook-form') ||
                id.includes('@hookform/resolvers') ||
                id.includes('/zod/')) {
              return 'vendor-forms'
            }
            // Lucide ikonalar
            if (id.includes('lucide-react')) {
              return 'vendor-icons'
            }
            // Axios va boshqa kichik utility kutubxonalar
            if (id.includes('axios') || id.includes('clsx') || id.includes('zustand')) {
              return 'vendor-utils'
            }
            // Skeleton kutubxonasi
            if (id.includes('react-loading-skeleton')) {
              return 'vendor-skeleton'
            }
            // i18n (uz/ru tarjimalar)
            if (id.includes('i18next') || id.includes('react-i18next')) {
              return 'vendor-i18n'
            }
            // Qolgan barcha node_modules — yagona vendor
            return 'vendor-other'
          }
        },
      },
    },
  },
})
