import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { CrashProvider } from './components/CrashContext'
import ErrorBoundary from './components/ErrorBoundary'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <CrashProvider>
        <App />
      </CrashProvider>
    </ErrorBoundary>
  </StrictMode>,
)
