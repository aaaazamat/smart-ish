import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SkeletonTheme } from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { ToastProvider } from '@/components/ui/Toast'
import '@/i18n'  // i18n init (yon ta'sirlari uchun importlash kifoya)
import './index.css'
import App from './App.jsx'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {/*
          SkeletonTheme — barcha skeleton'lar uchun rang sxemasi.
          Sayt teal (#149AAB) palitrasidan kelib chiqib, neytral kulrang
          ohanglar tanlandi. duration — pulse animatsiyasining tezligi.
        */}
        <SkeletonTheme
          baseColor="#E5E7EB"
          highlightColor="#F3F4F6"
          duration={1.2}
          borderRadius="0.5rem"
        >
          <ToastProvider>
            <App />
          </ToastProvider>
        </SkeletonTheme>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
)
