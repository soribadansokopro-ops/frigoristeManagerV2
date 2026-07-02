import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './design-system/theme.css'
import './index.css'
import App from './App.tsx'
import { DsThemeProvider } from './design-system'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <DsThemeProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </DsThemeProvider>
  </StrictMode>,
)
