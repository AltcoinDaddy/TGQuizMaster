import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { TONProvider } from './providers/TONProvider.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <TONProvider>
      <App />
    </TONProvider>
  </React.StrictMode>,
)
