import { QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'

import App from './App.tsx'
import './index.css'
import { queryClient } from './lib/queryClient.ts'

/**
 * Legacy API redirects used a path URL (`/auth/callback?…`) which HashRouter
 * cannot route. Rewrite to the hash form before React mounts.
 */
function rewriteLegacyAuthCallbackPath(): void {
  if (window.location.pathname !== '/auth/callback') {
    return
  }

  const { origin, search } = window.location
  window.location.replace(`${origin}/#/auth/callback${search}`)
}

rewriteLegacyAuthCallbackPath()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <HashRouter>
        <App />
      </HashRouter>
    </QueryClientProvider>
  </StrictMode>,
)
