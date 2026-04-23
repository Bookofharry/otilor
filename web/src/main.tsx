import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AnalyticsProvider } from './context/AnalyticsProvider'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AnalyticsProvider config={{ debug: import.meta.env.DEV }}>
      <App />
    </AnalyticsProvider>
  </StrictMode>,
)
