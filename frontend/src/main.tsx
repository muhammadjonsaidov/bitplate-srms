import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30_000,
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1c1b18',
            color: '#fafaf9',
            fontSize: '13px',
            fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
            borderRadius: '10px',
            padding: '12px 16px',
          },
          success: { iconTheme: { primary: '#df6620', secondary: '#fafaf9' } },
          error:   { iconTheme: { primary: '#ef4444', secondary: '#fafaf9' } },
        }}
      />
    </QueryClientProvider>
  </React.StrictMode>
)
