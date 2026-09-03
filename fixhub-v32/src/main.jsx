import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'

// Registrar el Service Worker de Firebase Messaging. Sin esto, las
// notificaciones push NO funcionan (ni en primer plano ni en segundo plano):
// Firebase necesita este registro activo para poder generar el token y para
// poder mostrar notificaciones cuando la app está cerrada/en background.
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/firebase-messaging-sw.js')
    .catch(err => console.warn('No se pudo registrar el Service Worker:', err))
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
)
