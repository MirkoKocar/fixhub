import React, { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import HomeVecino from './pages/HomeVecino'
import HomeAdmin from './pages/HomeAdmin'
import HomeProveedor from './pages/HomeProveedor'
import NuevoAviso from './pages/NuevoAviso'
import Chat from './pages/Chat'
import Proveedores from './pages/Proveedores'
import Avisos from './pages/Avisos'

const PalaceFrame = () => (
  <div className="palace-frame">
    <div className="frame-border" />
    <div className="corner tl" />
    <div className="corner tr" />
    <div className="corner bl" />
    <div className="corner br" />
  </div>
)

export default function App() {
  const [user, setUser] = useState(() => {
    const s = localStorage.getItem('fixhub_user')
    return s ? JSON.parse(s) : null
  })

  const login = (data) => {
    localStorage.setItem('fixhub_user', JSON.stringify(data))
    setUser(data)
  }

  const logout = () => {
    localStorage.removeItem('fixhub_user')
    setUser(null)
  }

  if (!user) return <><PalaceFrame /><Login onLogin={login} /></>

  return (
    <BrowserRouter>
      <PalaceFrame />
      <Routes>
        {user.rol === 'vecino' && <>
          <Route path="/" element={<HomeVecino user={user} onLogout={logout} />} />
          <Route path="/aviso" element={<NuevoAviso user={user} />} />
          <Route path="/proveedores" element={<Proveedores user={user} />} />
          <Route path="/avisos" element={<Avisos user={user} />} />
          <Route path="/chat/:proveedorId" element={<Chat user={user} />} />
        </>}
        {user.rol === 'admin' && <>
          <Route path="/" element={<HomeAdmin user={user} onLogout={logout} />} />
          <Route path="/chat/:vecinoId" element={<Chat user={user} />} />
        </>}
        {user.rol === 'proveedor' && <>
          <Route path="/" element={<HomeProveedor user={user} onLogout={logout} />} />
          <Route path="/chat/:vecinoId" element={<Chat user={user} />} />
        </>}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  )
}
