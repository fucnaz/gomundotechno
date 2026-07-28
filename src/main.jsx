import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'
import { SheetProvider } from './context/SheetContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <SheetProvider>
        <App />
      </SheetProvider>
    </AuthProvider>
  </StrictMode>,
)
