import React, { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Onboarding from './pages/Onboarding'
import HomeVecino from './pages/HomeVecino'
import HomeAdmin from './pages/HomeAdmin'
import HomeProveedor from './pages/HomeProveedor'
import NuevoAviso from './pages/NuevoAviso'
import Avisos from './pages/Avisos'
import Proveedores from './pages/Proveedores'
import Reservas from './pages/Reservas'
import Chat from './pages/Chat'
import VotacionVecino from './pages/VotacionVecino'
import EncuestaVecino from './pages/EncuestaVecino'
import VisitaVecino from './pages/VisitaVecino'
import AdminAvisos from './pages/AdminAvisos'
import AdminProveedores from './pages/AdminProveedores'
import AdminStats from './pages/AdminStats'
import AdminTablon from './pages/AdminTablon'
import AdminRecordatorios from './pages/AdminRecordatorios'
import AdminVecinos from './pages/AdminVecinos'
import AdminVotaciones from './pages/AdminVotaciones'
import AdminEncuestas from './pages/AdminEncuestas'
import AdminEmergencias from './pages/AdminEmergencias'
import AdminVisitas from './pages/AdminVisitas'
import AdminMas from './pages/AdminMas'
import ActivityLog from './pages/ActivityLog'
import ProveedorAgenda from './pages/ProveedorAgenda'
import ProveedorHistorial from './pages/ProveedorHistorial'
import { PalaceFrame } from './components/Palace'

const SESSION_KEY = 'fixhub_session_v6'
const ONBOARDING_KEY = 'fixhub_onboarding_done'

export default function App() {
  const [session, setSession] = useState(() => {
    try { return JSON.parse(localStorage.getItem(SESSION_KEY)) } catch { return null }
  })
  const [showOnboarding, setShowOnboarding] = useState(false)

  const handleLogin = (userData) => {
    localStorage.setItem(SESSION_KEY, JSON.stringify(userData))
    setSession(userData)
    // Show onboarding only for vecinos first time
    if (userData.rol === 'vecino' && !localStorage.getItem(ONBOARDING_KEY)) {
      setShowOnboarding(true)
    }
  }

  const finishOnboarding = () => {
    localStorage.setItem(ONBOARDING_KEY, 'done')
    setShowOnboarding(false)
  }

  if (!session) return (
    <>
      <PalaceFrame />
      <Login onLogin={handleLogin} />
    </>
  )

  if (showOnboarding) return <Onboarding onFinish={finishOnboarding} />

  const { rol } = session

  return (
    <>
      <PalaceFrame />
      <Routes>
        {/* VECINO */}
        {rol === 'vecino' && <>
          <Route path="/" element={<HomeVecino user={session} />} />
          <Route path="/aviso" element={<NuevoAviso user={session} />} />
          <Route path="/avisos" element={<Avisos user={session} />} />
          <Route path="/proveedores" element={<Proveedores user={session} />} />
          <Route path="/reservas" element={<Reservas user={session} />} />
          <Route path="/chat/:avisoId" element={<Chat user={session} />} />
          <Route path="/votaciones" element={<VotacionVecino user={session} />} />
          <Route path="/encuesta/:encuestaId" element={<EncuestaVecino user={session} />} />
          <Route path="/visitas" element={<VisitaVecino user={session} />} />
          <Route path="/guia" element={<Onboarding onFinish={() => window.history.back()} />} />
          <Route path="*" element={<Navigate to="/" />} />
        </>}

        {/* ADMIN */}
        {rol === 'admin' && <>
          <Route path="/" element={<HomeAdmin user={session} />} />
          <Route path="/admin/avisos" element={<AdminAvisos user={session} />} />
          <Route path="/admin/proveedores" element={<AdminProveedores user={session} />} />
          <Route path="/admin/stats" element={<AdminStats user={session} />} />
          <Route path="/admin/tablon" element={<AdminTablon user={session} />} />
          <Route path="/admin/recordatorios" element={<AdminRecordatorios user={session} />} />
          <Route path="/admin/vecinos" element={<AdminVecinos user={session} />} />
          <Route path="/admin/votaciones" element={<AdminVotaciones user={session} />} />
          <Route path="/admin/encuestas" element={<AdminEncuestas user={session} />} />
          <Route path="/admin/emergencias" element={<AdminEmergencias user={session} />} />
          <Route path="/admin/visitas" element={<AdminVisitas user={session} />} />
          <Route path="/admin/actividad" element={<ActivityLog user={session} />} />
          <Route path="/admin/mas" element={<AdminMas user={session} />} />
          <Route path="/admin/aviso/:avisoId" element={<Chat user={session} />} />
          <Route path="*" element={<Navigate to="/" />} />
        </>}

        {/* PROVEEDOR */}
        {rol === 'proveedor' && <>
          <Route path="/" element={<HomeProveedor user={session} />} />
          <Route path="/proveedor/mensajes" element={<HomeProveedor user={session} />} />
          <Route path="/proveedor/chat/:avisoId" element={<Chat user={session} />} />
          <Route path="/proveedor/agenda" element={<ProveedorAgenda user={session} />} />
          <Route path="/proveedor/historial" element={<ProveedorHistorial user={session} />} />
          <Route path="*" element={<Navigate to="/" />} />
        </>}

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  )
}
