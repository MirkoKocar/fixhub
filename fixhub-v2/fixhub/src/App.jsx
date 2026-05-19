import React, { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Home from './pages/Home'
import NuevoAviso from './pages/NuevoAviso'
import Proveedores from './pages/Proveedores'
import Avisos from './pages/Avisos'
import Admin from './pages/Admin'

export default function App() {
  const [vecino, setVecino] = useState(() => {
    const saved = localStorage.getItem('fixhub_vecino')
    return saved ? JSON.parse(saved) : null
  })

  const login = (data) => {
    localStorage.setItem('fixhub_vecino', JSON.stringify(data))
    setVecino(data)
  }

  const logout = () => {
    localStorage.removeItem('fixhub_vecino')
    setVecino(null)
  }

  if (!vecino) return <Login onLogin={login} />

  return (
    <Routes>
      <Route path="/" element={<Home vecino={vecino} onLogout={logout} />} />
      <Route path="/aviso" element={<NuevoAviso vecino={vecino} />} />
      <Route path="/proveedores" element={<Proveedores vecino={vecino} />} />
      <Route path="/avisos" element={<Avisos vecino={vecino} />} />
      <Route path="/admin" element={<Admin vecino={vecino} />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}
