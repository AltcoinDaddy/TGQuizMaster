import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { ChilizProvider } from './providers/ChilizProvider.tsx';
 
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ChilizProvider>
      <App />
    </ChilizProvider>
  </React.StrictMode>,
)
