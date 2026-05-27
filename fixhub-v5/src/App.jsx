import React, { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import HomeVecino from './pages/HomeVecino'
import HomeAdmin from './pages/HomeAdmin'
import HomeProveedor from './pages/HomeProveedor'
import NuevoAviso from './pages/NuevoAviso'
import Avisos from './pages/Avisos'
import Proveedores from './pages/Proveedores'
import Reservas from './pages/Reservas'
import Chat from './pages/Chat'
import AdminAvisos from './pages/AdminAvisos'
import AdminProveedores from './pages/AdminProveedores'
import AdminStats from './pages/AdminStats'
import AdminTablon from './pages/AdminTablon'
import AdminRecordatorios from './pages/AdminRecordatorios'
import AdminVecinos from './pages/AdminVecinos'
import ProveedorAgenda from './pages/ProveedorAgenda'
import { PalaceFrame } from './components/Palace'

const SESSION_KEY = 'fixhub_session_v5'

export default function App() {
  const [session, setSession] = useState(() => {
    try { return JSON.parse(localStorage.getItem(SESSION_KEY)) } catch { return null }
  })

  const handleLogin = (userData) => {
    localStorage.setItem(SESSION_KEY, JSON.stringify(userData))
    setSession(userData)
  }

  if (!session) return (
    <>
      <PalaceFrame />
      <Login onLogin={handleLogin} />
    </>
  )

  const { rol } = session

  return (
    <>
      <PalaceFrame />
      <Routes>
        {rol === 'vecino' && <>
          <Route path="/" element={<HomeVecino user={session} />} />
          <Route path="/aviso" element={<NuevoAviso user={session} />} />
          <Route path="/avisos" element={<Avisos user={session} />} />
          <Route path="/proveedores" element={<Proveedores user={session} />} />
          <Route path="/reservas" element={<Reservas user={session} />} />
          <Route path="/chat/:avisoId" element={<Chat user={session} />} />
          <Route path="*" element={<Navigate to="/" />} />
        </>}

        {rol === 'admin' && <>
          <Route path="/" element={<HomeAdmin user={session} />} />
          <Route path="/admin/avisos" element={<AdminAvisos user={session} />} />
          <Route path="/admin/proveedores" element={<AdminProveedores user={session} />} />
          <Route path="/admin/stats" element={<AdminStats user={session} />} />
          <Route path="/admin/tablon" element={<AdminTablon user={session} />} />
          <Route path="/admin/recordatorios" element={<AdminRecordatorios user={session} />} />
          <Route path="/admin/vecinos" element={<AdminVecinos user={session} />} />
          <Route path="/admin/aviso/:avisoId" element={<Chat user={session} />} />
          <Route path="*" element={<Navigate to="/" />} />
        </>}

        {rol === 'proveedor' && <>
          <Route path="/" element={<HomeProveedor user={session} />} />
          <Route path="/proveedor/mensajes" element={<HomeProveedor user={session} />} />
          <Route path="/proveedor/chat/:avisoId" element={<Chat user={session} />} />
          <Route path="/proveedor/historial" element={<HomeProveedor user={session} />} />
          <Route path="/proveedor/agenda" element={<ProveedorAgenda user={session} />} />
          <Route path="*" element={<Navigate to="/" />} />
        </>}

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  )
}
