import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { SmoothScroll } from './components/SmoothScroll'

// After Netlify Identity widget processes an invite/recovery/confirmation token,
// redirect the user to the login page so the SPA takes over.
declare global {
  interface Window {
    netlifyIdentity?: {
      on: (event: string, callback: (user?: unknown) => void) => void
    }
  }
}

if (window.netlifyIdentity) {
  window.netlifyIdentity.on("init", (user) => {
    if (!user) {
      window.netlifyIdentity!.on("login", () => {
        document.location.href = "/login"
      })
    }
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SmoothScroll>
      <App />
    </SmoothScroll>
  </StrictMode>,
)
