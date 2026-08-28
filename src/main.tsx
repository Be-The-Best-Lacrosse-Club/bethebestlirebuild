import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { SmoothScroll } from './components/SmoothScroll'
import { prepareAuthCallback, storeAuthCallbackError } from './lib/auth.ts'

async function startApp() {
  let callbackType: string | null

  try {
    callbackType = (await prepareAuthCallback())?.type ?? null
  } catch (error) {
    const message = error instanceof Error ? error.message : "The account link is invalid or expired."
    storeAuthCallbackError(message)
    callbackType = "error"
  }

  if (callbackType && window.location.pathname !== "/login") {
    window.location.replace("/login")
    return
  }

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <SmoothScroll>
        <App />
      </SmoothScroll>
    </StrictMode>,
  )
}

void startApp()
